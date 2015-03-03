__author__ = 'james'

import os
import sys
import tifffile
import numpy as np
import nrrd
import h5py
import tempfile
from matplotlib import pyplot as plt
import matplotlib.cm as cm


class SliceGenerator(object):

    def __init__(self, recon):
        self.recon = recon
        self.slice_index = 0

    def slices(self):
        pass

    def dtype(self):
        raise NotImplementedError("Ths method needs overriding")

    def shape(self):
        raise NotImplementedError("Ths method needs overriding")


class TiffSliceGenerator(SliceGenerator):

    def __init__(self, recon):

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


class NrrdSliceGenerator(SliceGenerator):

    def __init__(self, recon):

        super(NrrdSliceGenerator, self).__init__(recon)
        # self.raw, self.header = nrrd.read(recon)

        nrrd_raw = tempfile.TemporaryFile(mode='wb+')
        self.header = {}

        with open(recon, "rb") as f:

            header_end = False

            for line in f:

                if header_end:
                    nrrd_raw.write(line)
                else:

                    if line.startswith('type'):
                        self.header['dtype'] = eval('np.' + line.split(':')[1].strip())
                    elif line.startswith('encoding'):
                        self.header['encoding'] = line.split(':')[1].strip()
                    elif line.startswith('sizes'):
                        self.header['dims'] = tuple([int(d) for d in line.split(':')[1].split()])
                    elif line == '\n':
                        header_end = True

        self.raw = np.memmap(nrrd_raw, dtype=self.header['dtype'], mode='r', shape=self.header['dims'], order='F')

    def slices(self, start=0):

        for i in range(start, self.header['dims'][2]):
            yield self.raw[:, :, i]

    def dtype(self):
        return self.header['dtype']

    def shape(self):
        return self.raw.shape


class MincSliceGenerator(SliceGenerator):

    def __init__(self, recon):
        super(MincSliceGenerator, self).__init__(recon)

        minc = h5py.File(self.recon, "r")['minc-2.0']
        self.volume = minc['image']['0']['image']

    def slices(self, start=0):
        # TODO check not transposed
        for i in range(self.volume.shape[0], -1, start):
            yield self.volume[i, :, :]

    def dtype(self):
        return self.volume.dtype

    def shape(self):
        return self.volume.shape

if __name__ == "__main__":

    # bz2_nrrd = "/media/sf_siah/IMPC_pipeline/preprocessing/example_data/" \
    #            "20140515_KLHDC2_E14.5_21.1h_WT_XX_REC_14.nrrd.bz2"
    # conv.decompress_bz2(bz2_nrrd, "/home/james/soft/test.nrrd")

    # gen = TiffSliceGenerator("/home/james/soft/test_tiffs")
    gen = MincSliceGenerator("/home/james/soft/test.mnc")
    # gen = NrrdSliceGenerator("/home/james/soft/test.nrrd")
    # gen = NrrdSliceGenerator("/home/neil/siah/IMPC_pipeline/preprocessing/example_data/IMPC_cropped_20141104_RYR2_18.1h_WT_Rec.nrrd")

    print gen.dtype()
    print gen.shape()

    for slice_ in gen.slices(720):

        plt.imshow(slice_, cmap=cm.Greys_r)
        plt.show()
        break
        # print slice_.shape
