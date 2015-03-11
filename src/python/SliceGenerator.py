__author__ = 'james'

import os
import tifffile
import numpy as np
import h5py
from matplotlib import pyplot as plt
import matplotlib.cm as cm
from ctutils import readers
import subprocess as sp


class SliceGenerator(object):
    """The SliceGenerator class is an "abstract" superclass designed to be extended for specific file formats.

    Subclasses should call the super constructor and override the slices() as a generator that yields image slices. The
    class should also override the dtype() and shape() methods accordingly.

    """

    def __init__(self, recon):
        self.recon = recon
        self.slice_index = 0


    def slices(self):
        """The slices method should yield xy image slices from a memory mapped numpy array."""
        raise NotImplementedError("Ths method needs overriding")

    def dtype(self):
        """The dtype method should return the datatype of the memory mapped numpy array"""
        raise NotImplementedError("Ths method needs overriding")

    def shape(self):
        """The shape method should return the shape of the memory mapped numpy array in x, y, z order."""
        raise NotImplementedError("Ths method needs overriding")


class TiffSliceGenerator(SliceGenerator):
    """The TiffSliceGenerator class extends SliceGenerator, yielding slices from a folder of TIFFs.

    This class is unlikely to ever be needed, as we should not receive folders of TIFFs from IMPC centres.
    """

    def __init__(self, recon):
        """The constructor takes a recon path as an argument.

        :param recon:
        :return:
        """

        super(TiffSliceGenerator, self).__init__(recon)

        # Get list of tiffs
        self.tiff_list = sorted([f for f in os.listdir(recon) if f.lower().endswith('tiff') or f.lower().endswith('tif')])

        # Read the first one to get dimensions
        first_tiff = tifffile.imread(os.path.join(recon, self.tiff_list[0]))
        dims = list(first_tiff.shape)
        dims.append(len(self.tiff_list))
        self.dims = tuple(dims)
        self.datatype = first_tiff.dtype

    def slices(self, start=0):

        for i in range(start, self.dims[2]):

            current_slice = tifffile.imread(os.path.join(self.recon, self.tiff_list[i]))
            yield current_slice

    def dtype(self):
        return self.datatype

    def shape(self):
        return self.dims


class TiffStackSliceGenerator(SliceGenerator):

    def __init__(self, recon):

        super(TiffStackSliceGenerator, self).__init__(recon)
        self.ext = 'tiff'
        self.tiff_stack = tifffile.imread(recon)
        self.dims = self.tiff_stack.shape[::-1]
        self.datatype = self.tiff_stack.dtype


    def slices(self, start=0):

        for i in range(self.dims[2]):
            yield self.tiff_stack[i, :, :]

    def dtype(self):
        return self.datatype

    def shape(self):
        return self.dims


class TXMSliceGenerator(SliceGenerator):

    def __init__(self, recon):

        super(TXMSliceGenerator, self).__init__(recon)
        self.ext = 'txm'
        self.txm = readers.open_scan(recon)

    def slices(self, start=0):

        for i in self.txm:
            yield np.reshape(self.txm[i], tuple([self.txm.height, self.txm.width]))

    def dtype(self):
        return self.txm.datatype

    def shape(self):
        return tuple([self.txm.height, self.txm.width, len(self.txm)])


class NrrdSliceGenerator(SliceGenerator):

    def __init__(self, recon):

        super(NrrdSliceGenerator, self).__init__(recon)
        # self.raw, self.header = nrrd.read(recon)
        self.ext = 'nrrd'
        self.dims = None
        self.datatype = None
        self.encoding = None

        nrrd_hdr = recon + '.hdr'
        raw_offset = 0

        if os.path.exists(recon):
            try:
                sp.check_call(['unu', 'head', recon], stdout=open(nrrd_hdr, 'wb'))
                raw_offset = os.path.getsize(nrrd_hdr)
            except sp.CalledProcessError as cpe:
                print "Error extracting raw data from NRRD using 'unu': ", cpe
        else:
            raise IOError("Failed to locate '{}'".format(recon))

        self.parse_header(nrrd_hdr)
        self.raw = np.memmap(recon, dtype=self.datatype, offset=raw_offset, mode='r', shape=self.dims,
                             order='F')

        # self.header = {}
        #
        # with open(recon, "rb") as f:
        #
        #     header_end = False
        #
        #     for line in f:
        #
        #         if header_end:
        #             nrrd_raw.write(line)
        #         else:
        #
        #             if line.startswith('type'):
        #                 self.header['dtype'] = eval('np.' + line.split(':')[1].strip())
        #             elif line.startswith('encoding'):
        #                 self.header['encoding'] = line.split(':')[1].strip()
        #             elif line.startswith('sizes'):
        #                 self.header['dims'] = tuple([int(d) for d in line.split(':')[1].split()])
        #             elif line == '\n':
        #                 header_end = True

    def parse_header(self, hdr):

        with open(hdr, 'rb') as f:
            for line in f:
                if line.startswith('type'):
                    self.datatype = line.split(':')[1].strip()
                elif line.startswith('sizes'):
                    self.dims = tuple([int(d) for d in line.split(':')[1].split()])
                elif line.startswith('encoding'):
                    self.encoding = line.split(':')[1].strip()

    def slices(self, start=0):

        for i in range(start, self.dims[2]):
            yield self.raw[:, :, i].T

    def dtype(self):
        return self.datatype

    def shape(self):
        return self.dims


class MincSliceGenerator(SliceGenerator):

    def __init__(self, recon):
        super(MincSliceGenerator, self).__init__(recon)
        self.ext = 'mnc'
        minc = h5py.File(self.recon, "r")['minc-2.0']
        self.volume = minc['image']['0']['image']

    def slices(self, start=0):
        # TODO check not transposed
        for i in reversed(range(self.volume.shape[0])):
            yield self.volume[i, :, :]

    def dtype(self):
        return self.volume.dtype

    def shape(self):
        return self.volume.shape[::-1]

if __name__ == "__main__":

    # bz2_nrrd = "/media/sf_siah/IMPC_pipeline/preprocessing/example_data/" \
    #            "20140515_KLHDC2_E14.5_21.1h_WT_XX_REC_14.nrrd.bz2"
    # conv.decompress_bz2(bz2_nrrd, "/home/james/soft/test.nrrd")

    # gen = TiffSliceGenerator("/home/james/soft/test_tiffs")
    # gen = MincSliceGenerator("/home/james/soft/test.mnc")
    # gen = NrrdSliceGenerator("/home/james/soft/test.nrrd")
    # gen = TiffStackSliceGenerator("/home/james/soft/test.tif")
    gen = TXMSliceGenerator("/home/james/soft/test.txm")
    # gen = NrrdSliceGenerator("/home/neil/siah/IMPC_pipeline/preprocessing/example_data/IMPC_cropped_20141104_RYR2_18.1h_WT_Rec.nrrd")

    print gen.dtype()
    print gen.shape()

    for slice_ in gen.slices():

        plt.imshow(slice_, cmap=cm.Greys_r)
        plt.show()
