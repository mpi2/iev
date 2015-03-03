__author__ = 'james'

import os
import yaml
import MySQLdb
import json
from SliceGenerator import *
import resampler


# Todo: add minc rescale as well
PARAMETERS = {'IMPC_EOL_001_001': (2, 4),
              'IMPC_EMO_001_001': (2, 4),
              'IMPC_EMA_001_001': (2, 4)}

# Todo: add zip as well
SLICE_GENERATORS = {'tif': TiffSliceGenerator, 'tiff': TiffSliceGenerator,
                    'nrrd': NrrdSliceGenerator, 'mnc': MincSliceGenerator}


class EmbryoPreprocess(object):

    def __init__(self, config_file):

        self.base_path = '/home/james/IMPC_media'
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

                fields, rows = self.query_database('sql/all_media.sql', replacement=param)

                # Loop through each row and see if URL exists.
                for row in rows:

                    # Extract file extension and URL
                    media_URL = row[fields.index('value')]
                    media_extension = row[fields.index('extension')]

                    # Query phenodcc_embryo for url
                    url_query = "SELECT * FROM phenodcc_embryo.preprocessed " \
                                    "WHERE url = '{}'".format(media_extension)

                    fields, rows = self.query_database(url_query)

                    if len(rows) == 0:
                        #TODO: check status

                        # Fields that we can insert data into phenodcc_embryo
                        embryo_fields = [fields.index('cid'), fields.index('lid'), fields.index('gid'),
                                         fields.index('pid'), fields.index('qid'), fields.index('gene_symbol'),
                                         fields.index('sid'),  fields.index('measurement_id'), fields.index('value'),
                                         fields.index('checksum')]

                        embryo_entries = [str(row[x]) for x in embryo_fields]

                        insert_query = "INSERT INTO phenodcc_embryo.preprocessed " \
                                       "(cid, lid, gid, pid, qid, gene_symbol, sid, mid, url, checksum, phase_id) " \
                                       "VALUES ({}, {}, {}, {}, {}, '{}', {}, {}, '{}', '{}', 0".format(*embryo_entries)
                        _, _ = self.query_database(insert_query)

                        # Directory structure for output files
                        folder_ids = [fields.index('cid'), fields.index('lid'), fields.index('gid'),
                               fields.index('sid'), fields.index('pid'), fields.index('qid')]
                        dirs = os.path.join(*[str(row[x]) for x in folder_ids])

                        src_folder = os.path.join(self.src_path, dirs)
                        out_folder = os.path.join(self.embryo_path, dirs)

                        self.preprocessing.append({'recon_type': param, 'src_folder': src_folder,
                                                   'out_folder': out_folder,  'ext': media_extension,
                                                   'metadata': row[-1]})

            # Loop through preprocessing list
            for recon in self.preprocessing:

                # Get metadata group
                fields, metadata = self.query_database('sql/get_pixel_sizes.sql', replacement=recon['metadata'])

                # Extract and parse JSON string for pixel size
                json_dict = json.loads('{' + metadata[0][fields.index('metadata_json')] + '}')
                recon['pixel_size'] = json_dict.setdefault('Image Pixel Size', None)

                # Create paths on IMPC_media if the directories do not exist yet
                if os.path.exists(recon['out_folder']) is False:
                    os.makedirs(recon['out_folder'])

                # Determine which slicer generator to use based on dictionary
                slice_gen = SLICE_GENERATORS.setdefault(recon['ext'], None)

                if slice_gen:
                    self.process_recon(recon, slice_gen)  # process the recon
                else:
                    #TODO raise an exception
                    print "Invalid file extension '{}'. Skipping...".format(recon['ext'])

            # Close connection to database
            self.db_disconnect()

        else:
            print "Failed to connect to {}".format(self.HOST)

    def process_recon(self, recon, slice_gen):

        # Get scaling factors
        param = recon['param']
        scaling = PARAMETERS[param]

        resampler.resample(slice)


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
        except MySQLdb.MySQLError as e:
            print "Error querying database!", e

        field_names = [i[0] for i in self.cursor.description]
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
