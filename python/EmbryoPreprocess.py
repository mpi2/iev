__author__ = 'james'

import yaml
import MySQLdb
import json
from SliceGenerator import *
import resampler
import conversion as conv
from collections import OrderedDict
from time import time
import datetime

# TODO: ensure that these are correct
PARAMETERS = {'IMPC_EOL_001_001': (0.5, 0.25),
              'IMPC_EMO_001_001': (0.5, 0.25),
              'IMPC_EMA_001_001': (0.5, 0.25)}

SLICE_GENERATORS = OrderedDict()
SLICE_GENERATORS['nrrd'] = NrrdSliceGenerator
SLICE_GENERATORS['mnc'] = MincSliceGenerator
SLICE_GENERATORS['tif'] = TiffStackSliceGenerator
SLICE_GENERATORS['tiff'] = TiffStackSliceGenerator

COMPRESSION = {'bz2': conv.decompress_bz2}  # 'zip': conv.decompress_zip,

EXISTS_BY_URL = "SELECT * FROM {} WHERE url = '{}'"
INSERT_PRE_PROCESSING_ROW = 'INSERT INTO {} (cid, lid, gid, pid, qid, gene_symbol, sid, mid, url, checksum, ' \
                            'metadataGroup, status_id, created) ' \
                            'VALUES ({}, {}, {}, {}, {}, "{}", {}, {}, "{}", "{}", "{}", {}, Now());'
UPDATE_MID_META = 'UPDATE {} SET mid={}, metadataGroup="{}" WHERE url="{}";'
GET_EXTENSION_ID = 'SELECT * FROM phenodcc_embryo.file_extension WHERE extension="{}";'
GET_EXTENSION_BY_ID = 'SELECT * FROM phenodcc_embryo.file_extension WHERE id="{}";'
UPDATE_STATUS_EXT_PIXEL = 'UPDATE {} SET status_id={}, extension_id={}, pixelsize={} WHERE url="{}";'


class EmbryoPreprocess(object):

    def __init__(self, config_file):

        self.base_path = '/media/sf_siah/IMPC_pipeline'
        self.embryo_table = 'phenodcc_embryo.preprocessed_test'
        self.embryo_path = os.path.join(self.base_path, 'emb')
        self.src_path = os.path.join(self.base_path, 'src')
        self.conn = None
        self.cursor = None
        self.preprocessing = []

        with open(config_file) as f:
            self.HOST, self.USER, self.PASS = yaml.load(f)

    def run(self):

        timestamp = datetime.datetime.fromtimestamp(time()).strftime('%Y-%m-%d %H:%M:%S')
        print "Embryo pre-processing - " + timestamp

        # Connect to database, raises exception and returns None upon failure
        self.conn = self.db_connect()

        if self.conn:

            # Create cursor object
            self.cursor = self.conn.cursor()

            # Loop through relevant parameters and query phenodcc_media
            for param in PARAMETERS:

                print "\n# Querying media submitted for {}".format(param)

                valid_rows = self.query_database('sql/valid_entries.sql', replacement=param)

                # Loop through each row and see if URL exists.
                for row in valid_rows:

                    # Extract URL, extension, measurement_id and metadata
                    url = row['url']
                    mid = row['measurement_id']
                    ext = row['extension']
                    metadata = row['metadataGroup']

                    # Query embryo table to see if we already have a record for this URL
                    existing_rows = self.query_database(EXISTS_BY_URL.format(self.embryo_table, url))

                    # If there is no entry, add a record to the database
                    if len(existing_rows) == 0:

                        # Status ID should be zero by default (unprocessed)
                        status_id = 0

                        # Fields for which we can insert data into phenodcc_embryo
                        embryo_fields = ['cid', 'lid', 'gid', 'pid', 'qid', 'gene_symbol', 'sid', 'measurement_id',
                                         'url', 'checksum', 'metadataGroup']

                        embryo_entries = [row[x] for x in embryo_fields]
                        embryo_entries.append(status_id)  # need to add the status ID which will be zero

                        self.query_database(INSERT_PRE_PROCESSING_ROW.format(self.embryo_table, *embryo_entries))

                    else:

                        # Otherwise, it's already in the table so get its status ID and true extensions
                        status_id = existing_rows[0]['status_id']
                        ext_id = existing_rows[0]['extension_id']
                        decom_ext = self.query_database(GET_EXTENSION_BY_ID.format(ext_id))[0]['extension']

                    # If the status ID is not 1, then it hasn't been processed
                    if status_id != 1:

                        # Directory structure for output files
                        folder_ids = ['cid', 'lid', 'gid', 'sid', 'pid', 'qid']

                        dirs = os.path.join(*[str(row[x]) for x in folder_ids])
                        src = os.path.join(self.src_path, dirs, str(mid)) + '.{}'.format(ext)
                        out_folder = os.path.join(self.embryo_path, dirs)

                        # Create dictionary for recon
                        recon_dict = {'param': param, 'src': src, 'out_name': str(mid), 'out_folder': out_folder,
                                      'ext': ext, 'decom_ext': decom_ext, 'url': url, 'metadata': metadata}

                        # Append to pre-processing list
                        self.preprocessing.append(recon_dict)
                        print "-- added: {}".format(url)

                    else:  # TODO: check if the other columns have changed

                        # The data has already been processed, just update measurement ID and metadata group
                        _, _ = self.query_database(UPDATE_MID_META.format(self.embryo_table, mid, metadata, url))

            # We're done, so lets process the reconstructions that were added to the list
            self.process_recons()

        else:
            print "Failed to connect to {}".format(self.HOST)

    def process_recons(self):

        # Loop through pre-processing list
        for recon in self.preprocessing:

            print "\n# Processing '{}'".format(recon['src'])

            # Create paths on IMPC_media/emb/ if the directories do not exist yet
            if os.path.exists(recon['out_folder']) is False:
                os.makedirs(recon['out_folder'])

            # Is this file compressed?
            decompressor = COMPRESSION.setdefault(recon['ext'])

            if decompressor:

                # Create a name for the decompressed file
                file_parts = recon['src'].split(os.extsep)
                image_path = file_parts[0]  # + '.' + recon['ext']

                if os.path.exists(image_path) is False:
                    # Decompress the file
                    print "Decompressing {}".format(recon['ext'])
                    decompressor(recon['src'], os.path.join(recon['out_folder'], image_path))

            else:
                image_path = recon['src']

            # Go through all the slice generators and attempt to open the recon, starting with NRRD
            # Todo check extension ID, as it may have been set before
            valid_file_type = False
            rescaling_success = False

            for gen_type in SLICE_GENERATORS:

                try:
                    slice_gen = SLICE_GENERATORS.setdefault(gen_type, None)(image_path)
                except Exception:
                    slice_gen = None

                # If the slice generator returns a non-None value, we're good to go
                if slice_gen:

                    valid_file_type = True
                    print "-- successfully opened file as .{}".format(gen_type)

                    # Get extension ID for storing later
                    ext_id = self.query_database(GET_EXTENSION_ID.format(slice_gen.ext))[0]['id']

                    # Get metadata group, extract and parse JSON string for pixel size
                    meta_group = self.query_database('sql/get_pixel_sizes.sql', replacement=recon['metadata'])[0]
                    json_dict = json.loads('{' + meta_group['metadata_json'] + '}')
                    pixel_size = float(json_dict.setdefault('Image Pixel Size', None))
                    print "-- pixel size: {} um".format(pixel_size)

                    # Get scaling factors
                    scaling = PARAMETERS[recon['param']]

                    # Go through all scaling factors
                    try:
                        for scale in scaling:
                            print "-- rescaling at {}".format(scale)
                            rescaled_path = os.path.join(recon['out_folder'], recon['out_name'])
                            rescaled_path += '_{}.{}'.format(1.0/scale, gen_type)  # append scaling factor and path
                            resampler.resample(slice_gen, scale, rescaled_path)  # process the recon
                    except Exception as e:
                        print "-- error rescaling: ", e
                        break  # might as well stop if any of them break

                    rescaling_success = True

                    # We're done, so break out of for loop
                    break

            # Set status ID according to what went on
            if valid_file_type is False:
                status_id = 3  # we couldn't find a valid slice generator
            elif rescaling_success is False:
                status_id = 2  # we tried to rescale, but something broke
            else:
                status_id = 1  # everything went fine
                print "-- done"

            # Update the pre-processed table
            url = recon['url']
            self.query_database(UPDATE_STATUS_EXT_PIXEL.format(self.embryo_table, status_id, ext_id, pixel_size, url))

        # We're all done, so close connection to database
        self.db_disconnect()

    def query_database(self, sql, replacement=None):

        if sql.endswith('.sql'):
            sql = open(sql)
            query = sql.read()
        else:
            query = sql

        if replacement:
            query = query.replace('$REPLACE$', replacement)

        try:
            self.cursor.execute(query)
            self.conn.commit()
        except MySQLdb.MySQLError as e:
            print "Error querying database!", e

        # If this was an INSERT, there will be no description
        if self.cursor.description:

            field_names = [i[0] for i in self.cursor.description]
            result = []

            for row in self.cursor.fetchall():

                field_dict = {}

                for i, field in enumerate(field_names):
                    field_dict[field] = row[i]

                result.append(field_dict)

            return result

        else:
            return None

    def db_connect(self):

        try:
            conn = MySQLdb.connect(host=self.HOST, user=self.USER, passwd=self.PASS)
            print 'Connect status: {}'.format(conn)
        except MySQLdb.Error as e:
            print "Error connecting to '{}'".format(self.HOST), e
            return None

        return conn

    def db_disconnect(self):

        try:
            self.conn.close()
            print 'Connect status: {}'.format(self.conn)
        except MySQLdb.Error as e:
            print "Error disconnecting from '{}'".format(self.HOST), e


if __name__ == '__main__':

    config = 'db_connect.yaml'
    ep = EmbryoPreprocess(config)
    ep.run()