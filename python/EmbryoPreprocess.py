__author__ = 'james'

import os
import yaml
import MySQLdb
import json
import conversion as conv

PARAMETERS = {'IMPC_EOL_001_001': 'OPT E9.5',
              'IMPC_EMO_001_001': 'uCT E14.5/E15.5',
              'IMPC_EMA_001_001': 'uCT E18.5'}

VALID_IMAGE_EXTENSIONS = {'tif', 'tiff', 'nrrd', 'mnc', 'bz2', 'zip'}


class EmbryoPreprocess(object):

    def __init__(self, config_file):

        self.base_path = '/home/james/IMPC_media'
        self.embryo_path = os.path.join(self.base_path, 'emb')
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

                    # Extract media url and file extension
                    media_url = row[fields.index('value')]
                    media_extension = row[fields.index('extension')]

                    id_list = [fields.index('cid'), fields.index('lid'), fields.index('gid'),
                           fields.index('sid'), fields.index('pid'), fields.index('qid')]

                    media_dirs = os.path.join(*[str(row[x]) for x in id_list])
                    media_folder = os.path.join(self.embryo_path, media_dirs)

                    self.preprocessing.append({'recon_type': param, 'folder': media_folder,
                                               'url': media_url, 'ext': media_extension })

            # Loop through preprocessing list
            print "Processing downloaded embryo media"
            for recon in self.preprocessing:

                # Get metadata group
                metadata_group = row[-1]
                fields, metadata = self.query_database('sql/get_pixel_sizes.sql', replacement=metadata_group)

                # Extract and parse JSON string for pixel size
                json_dict = json.loads('{' + metadata[0][fields.index('metadata_json')] + '}')
                pixel_size = json_dict.setdefault('Image Pixel Size', None)

                # Create paths on IMPC_media if the directories do not exist yet
                if os.path.exists(recon['folder']) is False:
                    os.makedirs(recon['folder'])

                # Process the image
                self.process_recon(recon)

            # Close connection to database
            self.db_disconnect()

        else:
            print "Failed to connect to {}".format(self.HOST)

    def process_recon(self, recon):

        print "Parameter: " +recon['recon_type']
        print "Output folder: " + recon['folder']
        print "URL: " + recon['url']
        print "Extension: " + recon['ext']

    def query_database(self, sql_file, replacement=None):

        sql = open(sql_file)
        query = sql.read()

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
