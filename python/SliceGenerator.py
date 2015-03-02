__author__ = 'james'

import os
import sys
import tifffile
import numpy as np
import nrrd
import h5py
import conversion as conv


class SliceGenerator(object):

    def __init__(self, recon):
        self.recon = recon
        self.slice_index = 0

    def slices(self):
        pass


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

    def slices(self):

        for i in range(0, self.dims[2]):

            current_slice = tifffile.imread(os.path.join(self.recon, self.tiff_list[self.slice_index]))
            yield current_slice


class NrrdSliceGenerator(SliceGenerator):

    def __init__(self, recon):

        super(NrrdSliceGenerator, self).__init__(recon)
        self.raw, self.header = nrrd.read(recon)

    def slices(self):

        for i in range(0, self.header['sizes'][2]):
            yield self.raw[:, :, i]


class MincSliceGenerator(SliceGenerator):

    def __init__(self, recon):
        super(MincSliceGenerator, self).__init__(recon)

    def slices(self):

        minc = h5py.File(self.recon, "r")['minc-2.0']
        volume = minc['image']['0']['image']

        for i in range(0, volume.shape[0]):
            yield volume[i, :, :]

if __name__ == "__main__":

    # bz2_nrrd = "/media/sf_siah/IMPC_pipeline/preprocessing/example_data/" \
    #            "20140515_KLHDC2_E14.5_21.1h_WT_XX_REC_14.nrrd.bz2"
    # conv.decompress_bz2(bz2_nrrd, "/home/james/soft/test.nrrd")

    # gen = TiffSliceGenerator("/home/james/soft/test_tiffs")
    # gen = MincSliceGenerator("/home/james/soft/test.mnc")
    gen = NrrdSliceGenerator("/home/james/soft/test.nrrd")

    for slice_ in gen.slices():
        print slice_.shape
