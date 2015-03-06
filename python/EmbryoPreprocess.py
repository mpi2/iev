__author__ = 'james'

import os
import yaml
import MySQLdb
import json
from SliceGenerator import *
import resampler
import conversion as conv

# Todo: add minc rescale as well
PARAMETERS = {'IMPC_EOL_001_001': (0.5, 0.25),
              'IMPC_EMO_001_001': (0.5, 0.25),
              'IMPC_EMA_001_001': (0.5, 0.25)}

# Todo: add zip as well
SLICE_GENERATORS = {'nrrd': NrrdSliceGenerator, 'mnc': MincSliceGenerator,
                    'tif': TiffStackSliceGenerator, 'tiff': TiffStackSliceGenerator}

COMPRESSION = {'bz2': conv.decompress_bz2}  # 'zip': conv.decompress_zip,


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

        # Connect to database, raises exception and returns None upon failure
        self.conn = self.db_connect()

        if self.conn:

            # Create cursor object
            self.cursor = self.conn.cursor()

            # Loop through relevant parameters and query phenodcc_media
            for param in PARAMETERS:

                fields, rows = self.query_database('sql/valid_entries.sql', replacement=param)

                # Loop through each row and see if URL exists.
                for row in rows:

                    # Extract URL, extension, measurement_id and metadata
                    url = row[fields.index('url')]

                    # Query phenodcc_embryo for url
                    url_query = "SELECT * FROM {} " \
                                "WHERE url = '{}'".format(self.embryo_table, url)

                    _, url_rows = self.query_database(url_query)

                    if len(url_rows) == 0:

                        # Fields that we can insert data into phenodcc_embryo
                        embryo_fields = [fields.index('cid'), fields.index('lid'), fields.index('gid'),
                                         fields.index('pid'), fields.index('qid'), fields.index('gene_symbol'),
                                         fields.index('sid'),  fields.index('measurement_id'), fields.index('url'),
                                         fields.index('checksum'), fields.index('metadataGroup')]

                        embryo_entries = [str(row[x]) for x in embryo_fields]

                        insert_query = 'INSERT INTO {} ' \
                                       '(cid, lid, gid, pid, qid, gene_symbol, sid, mid, url, checksum,' \
                                       'metadataGroup, status_id, created) ' \
                                       'VALUES ({}, {}, {}, {}, {}, "{}", {}, {}, "{}", "{}", "{}", 0, Now());' \
                                       ''.format(self.embryo_table, *embryo_entries)

                        _, _ = self.query_database(insert_query)

                        # Directory structure for output files
                        folder_ids = [fields.index('cid'), fields.index('lid'), fields.index('gid'),
                                      fields.index('sid'), fields.index('pid'), fields.index('qid')]
                        dirs = os.path.join(*[str(row[x]) for x in folder_ids])

                        # Get measurement_id, extension and metadata
                        mid = row[fields.index('measurement_id')]
                        ext = row[fields.index('extension')].lower()
                        metadata = row[fields.index('metadataGroup')]

                        src = os.path.join(self.src_path, dirs, str(mid)) + '.{}'.format(ext)
                        out_folder = os.path.join(self.embryo_path, dirs)

                        # Create dictionary for recon
                        recon_dict = {'param': param, 'src': src,
                                      'out_folder': out_folder,  'ext': ext,
                                      'url': url, 'metadata': row[-1]}

                        self.preprocessing.append(recon_dict)

                    else:

                        # Update metadata group and measurement_id in pre-processing table
                        update_embryo = 'UPDATE {} ' \
                                    'SET mid={}, metadataGroup="{}" ' \
                                    'WHERE url="{}"'.format(self.embryo_table, mid, metadata, url)
                        _, _ = self.query_database(update_embryo)

                        # TODO: check if the other columns have changed

            # Loop through pre-processing list
            for recon in self.preprocessing:

                print "* Processing '{}' *".format(recon['src'])

                # Get metadata group
                fields, metadata = self.query_database('sql/get_pixel_sizes.sql', replacement=recon['metadata'])

                # Extract and parse JSON string for pixel size
                # TODO update embryo database
                json_dict = json.loads('{' + metadata[0][fields.index('metadata_json')] + '}')
                recon['pixel_size'] = json_dict.setdefault('Image Pixel Size', None)

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
                        decompressor(recon['src'], os.path.join(recon['out_folder'], image_path))

                else:
                    image_path = recon['src']

                # Go through all the slice generators, starting with NRRD
                # TODO something more sensible than this

                valid_file_type = False
                for key in SLICE_GENERATORS:

                        try:
                            slice_gen = SLICE_GENERATORS.setdefault(key, None)(image_path)
                        except Exception as e:
                            print "Failed to generate slices as '{}' : ".format(key), e
                            slice_gen = None

                        # If the slice generator returns a non-None value, we're good to go
                        if slice_gen:

                            valid_file_type = True
                            print "Resampling..."

                            # Get scaling factors
                            scaling = PARAMETERS[recon['param']]

                            # Go through all scaling factors
                            for scale in scaling:
                                resampler.resample(slice_gen, scale, recon['out_folder'])  # process the recon
                            break

                if valid_file_type is False:
                    raise ValueError("Invalid file type for '{}'").format(recon['src'])

            # Close connection to database
            self.db_disconnect()

        else:
            print "Failed to connect to {}".format(self.HOST)

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
        else:
            field_names = None

        rows = self.cursor.fetchall()
        return field_names, rows


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