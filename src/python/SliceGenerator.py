"""
The SliceGenerator class is an "abstract" superclass designed to be extended for specific file formats.

Subclasses call the super constructor and override the slices() that yields image slices when used as a generator. The
class should also override the dtype() and shape() methods accordingly.

Instances of a subclass should be initialised by passing a valid file path as an argument. Slices may then be generated
using a for-loop, calling the slices() method on the generator object.

Requirements
------------
* `h5py <http://www.h5py.org/>`_
* `Numpy 1.8.2 <http://www.numpy.org>`_
* `ctutils 0.2 <https://github.com/waveform80/ctutils>`_

Examples
--------
>>> from SliceGenerator import NrrdSliceGenerator
>>> gen = NrrdSliceGenerator('path/to/file.nrrd')
>>> for x in gen.slices():
...     print x.shape  # do something with the slice

"""

__author__ = 'james'

import os
import tifffile
import numpy as np
import h5py
from ctutils import readers
import subprocess as sp
import nrrd
import tempfile


class SliceGenerator(object):

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
    """The TiffSliceGenerator class extends SliceGenerator, yielding slices from a folder of TIFFs. The method uses the
    tifffile.py module, created by Christoph Gohlke.

    This class is unlikely to ever be needed, as we should not receive folders of TIFFs from IMPC centres.
    """

    def __init__(self, recon):
        """The constructor takes a recon path as an argument, and generates a list of TIFF file paths. It then reads the
        first TIFF file in the list, and extracts the dimensions and data type.

        :param recon: a path to a folder containing reconstructed slices as TIFFs
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
        """Slices are yielded one slice at a time from the list of TIFFs.
        """

        for i in range(start, self.dims[2]):

            current_slice = tifffile.imread(os.path.join(self.recon, self.tiff_list[i]))
            yield current_slice

    def dtype(self):
        """Overrides the superclass to return the data type of the TIFF files i.e. 8 bit/16 bit.
        """
        return self.datatype

    def shape(self):
        """Overrides the superclass to return the shape of the TIFF files as a volume.
        """
        return self.dims


class TiffStackSliceGenerator(SliceGenerator):
    """The TiffStackSliceGenerator class extends SliceGenerator, yielding slices from a single TIFF stack.

    In the unlikely event that we receive a TIFF stack from an IMPC centre, this generator will slice it for resampling.
    At present, TIFF stacks CANNOT be memory mapped, and will be loaded into memory. The method uses the tifffile.py
    module, created by Christoph Gohlke.
    """

    def __init__(self, recon):
        """The constructor takes a recon path as an argument, and reads the entire stack into memory.

            :param recon: a path to a TIFF stack
        """

        super(TiffStackSliceGenerator, self).__init__(recon)
        self.ext = 'tiff'
        self.tiff_stack = tifffile.imread(recon)
        self.dims = self.tiff_stack.shape[::-1]
        self.datatype = self.tiff_stack.dtype

    def slices(self, start=0):
        """Slices are yielded one slice at a time from the TIFF stack.
        """

        for i in range(self.dims[2]):
            yield self.tiff_stack[i, :, :]

    def dtype(self):
        """Overrides the superclass to return the data type of the TIFF stack i.e. 8 bit/16 bit.
        """
        return self.datatype

    def shape(self):
        """Overrides the superclass to return the shape of the TIFF stack.
        """
        return self.dims


class TXMSliceGenerator(SliceGenerator):
    """The TXMSliceGenerator class extends SliceGenerator, yielding slices from TXM file (Transmission X-ray Microscopy).

    This generator has not been tested comprehensively, as we only have access to one example file for testing. It makes
     use of the ctutils module (https://github.com/waveform80/ctutils)
    """

    def __init__(self, recon):
        """The constructor takes a recon path as an argument, and opens the TXM file for reading.

            :param recon: a path to a TXM file.
        """

        super(TXMSliceGenerator, self).__init__(recon)
        self.ext = 'txm'
        self.txm = readers.TxmScanReader(recon)

    def slices(self, start=0):
        """Slices are yielded one slice at a time from the TXM file.
        """
        for i in reversed(self.txm.keys):
            yield np.reshape(self.txm[i], tuple([self.txm.height, self.txm.width]))

    def dtype(self):
        """Overrides the superclass to return the data type of the TXM file i.e. 8 bit/16 bit.
        """
        return self.txm.datatype

    def shape(self):
        """Overrides the superclass to return the shape of the TXM file.
        """
        return tuple([self.txm.height, self.txm.width, len(self.txm)])


class NrrdSliceGenerator(SliceGenerator):
    """The NrrdSliceGenerator class extends SliceGenerator, yielding slices from a single NRRD (Nearly Raw Raster Data)
    file.

    NRRDs are the most likely file type to be received at the DCC, especially for those centres that have adopted HARP.
    This generator has gone through several iterations, and now relies on Utah Nrrd Utilities (unu) by teem
    (http://teem.sourceforge.net/index.html).
    """

    def __init__(self, recon):
        """The constructor takes a recon path as an argument, and calls `unu head` on the NRRD file to write the
        header as separate file. The header is then parsed to extract the datatype, dimensions and encoding.
        This size of the header file (.hdr) determines an offset, which allows the remaining raw portion of the file to
        be memory mapped using numpy.

        :param recon: a path to a NRRD file.
        """
        super(NrrdSliceGenerator, self).__init__(recon)
        self.ext = 'nrrd'

        if os.path.exists(recon):

            # Parse the header using nrrd.py
            with open(recon, 'rb') as f:
                self.header = nrrd.read_header(f)
                self.dims = self.header['sizes']
                self.datatype = self.header['type']

            # Pipe the raw data to a separate file using "unu data"
            raw_data = tempfile.TemporaryFile(mode='wb+')
            sp.check_call(['unu', 'data', recon], stdout=raw_data)

        else:
            raise IOError("Failed to locate '{}'".format(recon))

        self.raw = np.memmap(raw_data, dtype=self.datatype, mode='r', shape=tuple(self.dims), order='F')

    def slices(self, start=0):
        """Slices are yielded one slice at a time from the memory mapped NRRD file.
        """
        for i in range(start, self.dims[2]):
            yield self.raw[:, :, i].T

    def dtype(self):
        """Overrides the superclass to return the data type of the NRRD file i.e. 8 bit/16 bit.
        """
        return self.header['type']

    def shape(self):
        """Overrides the superclass to return the shape of the NRRD file.
        """
        return self.header['sizes']


class MincSliceGenerator(SliceGenerator):
    """The MincSliceGenerator class extends SliceGenerator, yielding slices from a single MINC (Medical Image NetCDF)
    file.

    MINC files (.mnc) are based on the Hierarchical Data (HDF5) Format, and so they are currently handled by the h5py
    module (https://github.com/h5py/h5py).
    """

    def __init__(self, recon):
        """The constructor takes a recon path as an argument, and opens the MINC file using h5py. The volume object is a
        memory mapped numpy array which can sliced in the usual way.

        :param recon: a path to a MINC file.
        """
        super(MincSliceGenerator, self).__init__(recon)
        self.ext = 'mnc'
        minc = h5py.File(self.recon, "r")['minc-2.0']
        self.volume = minc['image']['0']['image']

    def slices(self, start=0):
        """Slices are yielded one slice at a time from the memory mapped numpy array
        """
        # TODO check not transposed
        for i in range(self.volume.shape[0]):
            yield self.volume[i, :, :]

    def dtype(self):
        """Overrides the superclass to return the data type of the MINC file i.e. 8 bit/16 bit.
        """
        return self.volume.dtype

    def shape(self):
        """Overrides the superclass to return the shape of the MINC file.
        """
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
    print gen.txm.pixel_size
    print gen.txm.current
    print gen.txm.voltage
