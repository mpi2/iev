#!/usr/bin/env python
# -*- coding: utf-8 -*-
# EmbryoPreprocess.py

# Licensing information to go here

"""
Search for downloaded embryo media (OPT/uCT) and pre-process it accordingly for viewing in Internet Embryo Viewer (IEV)

Class instances are initialised by passing in a config (.yaml) file, which contains the hostname (HOST),
username (USER) and password (PASS) required to connect to the database. This allows for easy switching between
"prince" and "live".

To begin pre-processing, the run() method must be called. Upon establishing a successful connection to the database,
the program queries phenodcc_media.media_file, finding all valid recon media. Subject to certain constraints, valid
data is added to a pre-processing list which is subsequently handled by the "process_recons()" method.

:Author:
  `James Brown`

:Organization:
  Medical Research Council (MRC) Harwell, Oxfordshire, UK

:Version: 0.0.1

Requirements
------------
* `Python 2.7 <http://www.python.org>`_
* `Numpy 1.8.2 <http://www.numpy.org>`_
* `PyYAML 3.11 <http://pyyaml.org/>`_
* `MySQLdb 1.2.3 <http://mysql-python.sourceforge.net/MySQLdb.html>`_
* `SimpleITK 0.8.1 <http://www.simpleitk.org/>`_

Examples
--------
>>> ep = EmbryoPreprocess('/local/folder/IMPC_media', 'phenodcc_embryo.preprocessed', 'db_connect.yaml')
>>> ep.run()
"""

__author__ = 'james'

import yaml
import MySQLdb
import json
from SliceGenerator import *
import resampler
import conversion as conv
from collections import OrderedDict
import time
import datetime
import nrrd
import SimpleITK as sitk


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

    def __init__(self, base_path, embryo_table, config_file):
        """ The __init__ initialises a number of class attributes, and parses the .yaml config file.

        :param config_file: path to .yaml containing database connection credentials.
        :param base_path: path where the embryo 'src' and 'emb' directories are located
        :param embryo_table: name of the table where embryo pre-processing rows are to be added
        :return:
        """

        self.base_path = base_path
        self.embryo_table = embryo_table
        self.embryo_path = os.path.join(self.base_path, 'emb')
        self.src_path = os.path.join(self.base_path, 'src')
        self.conn = None
        self.cursor = None
        self.preprocessing = []
        self.orientations = ['sagittal', 'coronal', 'axial']
        self.start_time = time.time()

        with open(config_file) as f:
            self.HOST, self.USER, self.PASS = yaml.load(f)

    def run(self):
        """The run method queries the phenodcc_media.media_file table, identifying those that require pre-processing.

        The method firsts attempts to connect to the database. If this connection fails, an exception is raised and the
        program terminates. If the connection is successful, the program queries phenodcc_media.media_file for media
        submitted for each of the three "embryo reconstruction" parameters; IMPC_EOL_001_001 (OPT E9.5),
        IMPC_EMO_001_001 (uCT E14.5/15.5) and IMPC_EMA_001_001 (uCT E18.5).

        For each of the rows returned, its unique URL is used to determine where it has already processed:

            If URL already exists in phenodcc_embryo.preprocessed:
                (1) Check its status ID and extension ID
                (2) If status_id != 1 (success), add job to the pre-processing list
                (3) Otherwise, update its metadataGroup and measurement_id.

            Otherwise:
                (1) Create a new row in the pre-processing table
                (2) Add job to the pre-processing list.

        Once all of the parameters have been searched against, the process_recons method is called.
        """

        start_timestamp = datetime.datetime.fromtimestamp(self.start_time).strftime('%Y-%m-%d %H:%M:%S')
        print "Embryo pre-processing started at " + start_timestamp

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
                        if ext_id:
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
                        self.query_database(UPDATE_MID_META.format(self.embryo_table, mid, metadata, url))

            # We're done, so lets process the reconstructions that were added to the list
            self.process_recons()

        else:
            raise MySQLdb.MySQLError("Failed to connect to {}".format(self.HOST))

    def process_recons(self):
        """The process_recons method loops through the pre-processing list, and attempts to process each recon in turn.

        For each recon in the pre-processing list, it is first decompressed (if necessary) according to its file
        extension. Unfortunately, we do not know what image format the data will be. To overcome this, the program will
        attempt to open the file using each of the valid file readers in turn.

        If the file is successfully opened, the correct extension ID is stored and the pixel size extracted from the
        database. The image data is then rescaled to pre-specified image resolutions, writing the results to disk as
        NRRD files. In addition to the rescaled images, three orthogonal maximum intensity projection (MIP) are
        generated for visual QC purposes (for the moment, these are written to the IMPC_media/emb/... directory)

        The three possible outcomes of the pre-processing job are as follows:

            (1) Successfully read and resample image data (status_id 1)
            (2) Failed to read image data, presumably due to an invalid file extension (status_id 2)
            (3) Error when resampling image data (status_id 3)

        Finally, the status ID, extension ID and pixel size are updated in the embryo pre-processing table.
        """

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
                    print "-- decompressing {}".format(recon['ext'])
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

                            if scale < 0.5:
                                mip_path = rescaled_path

                            resampler.resample(slice_gen, scale, rescaled_path)  # process the recon

                        rescaling_success = True
                    except Exception as e:
                        print "-- error rescaling: ", e
                        break  # might as well stop if any of them break

                    # We're done, so break out of for loop
                    break

            # Set status ID according to what went on
            if valid_file_type is False:
                status_id = 3  # we couldn't find a valid slice generator
            elif rescaling_success is False:
                status_id = 2  # we tried to rescale, but something broke
            else:
                status_id = 1  # everything went fine
                print "-- generating QC MIP"
                self.get_mip(mip_path, recon['out_folder'])

            # Update the pre-processed table
            url = recon['url']
            self.query_database(UPDATE_STATUS_EXT_PIXEL.format(self.embryo_table, status_id, ext_id, pixel_size, url))

        # We're all done, so close connection to database
        self.db_disconnect()

        end_time = time.time()
        end_timestamp = datetime.datetime.fromtimestamp(end_time).strftime('%Y-%m-%d %H:%M:%S')
        print "\nEmbryo pre-processing finished at " + end_timestamp

        m, s = divmod(end_time - self.start_time, 60)
        h, m = divmod(m, 60)
        print "Time taken: %d:%02d:%02d" % (h, m, s)

    def get_mip(self, in_path, out_dir):
        """The get_mip method generates three maximum intensity projections (MIP) for visual QC purposes.

        MIPs are generated from the downscaled image data, so the whole image can be loaded into memory for ease. The
        resulting images are written to disk in .png format.
        """

        volume, header = nrrd.read(in_path)

        for ax, view in enumerate(self.orientations):
            mip = np.amax(volume, axis=ax)
            sitk.WriteImage(sitk.GetImageFromArray(mip.T), os.path.join(out_dir, 'mip_{}.png'.format(view)))

    def query_database(self, sql, replacement=None):
        """The query_database method executes arbitrary queries and returns any results as dictionary lists.

        Input queries can be either strings or SQL files. If a replacement is specified, the $REPLACE$ wildcard will be
        replaced with it. The query is then executed and committed, raising an exception upon failure. If there are rows
        to be returned, the resulting data is parsed and returned as a list of dictionaries that can be referenced
        by column name for convenience.

        :param sql: either a string containing an SQL query, or a path to an SQL file
        :param replacement: optional argument for SQL files, $REPLACE$ wildcard is replaced with the specified string
        :return: a list of dictionaries if there were rows returned, otherwise None

        """

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
        """ The db_connect method attempts to connect to a database using the credentials in the specified .yaml file.

        :return: MySQLdb connect object if successful, or None if connection fails
        """

        try:
            conn = MySQLdb.connect(host=self.HOST, user=self.USER, passwd=self.PASS)
            print 'Connect status: {}'.format(conn)
        except MySQLdb.Error as e:
            print "Error connecting to '{}'".format(self.HOST), e
            return None

        return conn

    def db_disconnect(self):
        """The db_disconnect method attempts to disconnect from the database, and is called at the end of processing.
        Raises an exception upon failure (i.e. if the connection has already been closed).
        """

        try:
            self.conn.close()
            print 'Connect status: {}'.format(self.conn)
        except MySQLdb.Error as e:
            print "Error disconnecting from '{}'".format(self.HOST), e


if __name__ == '__main__':

    ep = EmbryoPreprocess('/media/sf_siah/IMPC_pipeline', 'phenodcc_embryo.preprocessed_test', 'db_connect.yaml')
    ep.run()