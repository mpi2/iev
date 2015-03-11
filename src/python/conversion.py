import numpy as np
import os
import nrrd
import bz2
from progressbar import ProgressBar, Percentage, Bar

DATA_TYPES = {"unsigned short": np.uint16, "uint16": np.uint16,
              "signed short": np.int16, "int16": np.int16,
              "unsigned byte": np.uint8, "uint8": np.uint8,
              "signed byte": np.int8, "int8": np.int8}


def decompress_bz2(bz2_in, decompressed_out):
    """The decompress_bz2 method performs sequential decompression of bzipped files on disk.

    If the bz2_in path can be found, the file is open and read in chunks of ~100 Mb at a time. Each chunk is then
    decompressed, and written to the file specified by decompressed_out. A progress bar is used to indicate how the
    decompression is getting on.

    :param bz2_in: path to bzipped file to be decompressed
    :param decompressed_out: path to output file, which can already exist
    :raises IOError: the decompressed file could not be found/opened
    """

    if os.path.isfile(bz2_in) is False:
        raise IOError("Input file '{}' not found!".format(bz2_in))

    try:
        with open(decompressed_out, 'wb') as decom, bz2.BZ2File(bz2_in, 'rb') as com:
            com_size = os.path.getsize(bz2_in)
            pbar = ProgressBar(widgets=[Percentage(), Bar()], maxval=com_size)
            bytes_read = 0
            chunk_size = 100000 * 1024
            for data in iter(lambda: com.read(chunk_size), b''):
                decom.write(data)
                bytes_read += chunk_size
                pbar.update(bytes_read)
            pbar.finish()
    except IOError as e:
        print "Error decompressing '{}'".format(bz2_in), e


def write_xtk_nrrd(volume, nrrd_out):
    """The write_xtk_nrrd method writes numpy arrays as IEV-ready NRRD files. It also works on memory mapped arrays.

    IEV works using the X Toolkit (XTK), which is quite particular about the NRRD files it displays. This method ensures
    that the NRRD headers are written appropriately, using nrrd.py by Maarten Everts
    (https://github.com/mhe/pynrrd/blob/master/nrrd.py)

    :param volume: a numpy array in memory, or a memory mapped numpy array
    :param nrrd_out: a file path to which the NRRD file is written
    :raises IOError: unable to write file to disk
    """

    try:
        options = {"encoding": "gzip",
                   "space": "left-posterior-superior",
                   "space directions": [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
                   "kinds": ["domain", "domain", "domain"],
                   "space origin": [0, 0, 0]}
        nrrd.write(nrrd_out, volume, options)
    except IOError as e:
        print "Failure writing .nrrd file: {}".format(e)


if __name__ == "__main__":

    recon = '/home/james/soft/test.nrrd.bz2'
    image_parts = recon.split(os.extsep)

    decom_out = '.'.join(image_parts[0:2])

    decom_tmp = decompress_bz2(recon, decom_out)
    print decom_tmp
    # tiffs_to_nrrd('/home/james/tmp/test_tiffs/', '/home/james/tmp/test.nrrd')