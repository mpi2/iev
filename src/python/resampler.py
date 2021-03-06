"""Resampler for the embryo pre-processing script.

This module performs resampling of images of arbitrary size, using a slice generator and memory mapped raw files.

Requirements
------------
* `OpenCV 2.4.9 <http://docs.opencv.org/>`_
* `Numpy 1.8.2 <http://www.numpy.org>`_
* `python-progressbar 2.3 <https://code.google.com/p/python-progressbar/>`_

Examples
--------
>>> from resampler import resample
>>> from SliceGenerator import NrrdSliceGenerator
>>> gen = NrrdSliceGenerator('/path/to/file.nrrd')
>>> resample(gen, 0.5, '/path/to/rescaled.nrrd')

"""

import os
import nrrd
import cv2
import tempfile
import numpy as np
import sys
import SimpleITK as sitk

if sys.platform == "win32" or sys.platform == "win64":
    windows = True
else:
    windows = False

xtk_opt = {"encoding": "gzip",
           "space": "left-posterior-superior",
           "space directions": [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
           "kinds": ["domain", "domain", "domain"],
           "space origin": [0, 0, 0]}


def resample(slicegen, scale, nrrd_path):
    """The resample method takes a slice generator and scaling factor as arguments, resamples the image accordingly,
    and writes it to disk as an IEV-ready NRRD file.

    :param slicegen: a slice generator that provides xy slices of an image as two-dimensional numpy arrays
    :param scale: scaling factor for resampling, which should be < 1 for downscaling (e.g. 0.5)
    :param nrrd_path: outfile NRRD containing extension
    """

    temp_xy = tempfile.TemporaryFile(mode='wb+')
    temp_xyz = tempfile.TemporaryFile(mode='wb+')

    # Get dimensions for the memory mapped raw xy file
    xy_scaled_dims = [slicegen.shape()[2]]

    first = True

    for i, z_slice_arr in enumerate(slicegen.slices()):

        # This might slow things done by re-assigning to the original array
        z_slice_arr = _droppixels(z_slice_arr, scale, scale)
        z_slice_resized = cv2.resize(z_slice_arr, (0, 0), fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

        if first:
            xy_scaled_dims.extend(z_slice_resized.shape)
            datatype = z_slice_resized.dtype
            first = False

        if windows:
            z_slice_resized.tofile(temp_xy.file)
        else:
            z_slice_resized.tofile(temp_xy)

    # Create memory mapped version of the temporary xy scaled slices
    xy_scaled_mmap = np.memmap(temp_xy, dtype=datatype, mode='r', shape=tuple(xy_scaled_dims))

    # Get dimensions for the memory mapped raw xyz file
    xyz_scaled_dims = []
    first = True

    # Scale in zy plane
    for y in range(xy_scaled_mmap.shape[1]):

        xz_plane = xy_scaled_mmap[:, y, :]
        scaled_xz = cv2.resize(xz_plane, (0, 0), fx=1, fy=scale, interpolation=cv2.INTER_AREA)

        if first:
            first = False
            xyz_scaled_dims.append(xy_scaled_mmap.shape[1])
            xyz_scaled_dims.append(scaled_xz.shape[0])
            xyz_scaled_dims.append(scaled_xz.shape[1])

        if windows:
            scaled_xz.tofile(temp_xyz.file)
        else:
            scaled_xz.tofile(temp_xyz)

    # Create memory mapped version of the temporary xy scaled slices
    xyz_scaled_mmap = np.memmap(temp_xyz, dtype=datatype, mode='r', shape=tuple(xyz_scaled_dims))
    nrrd.write(nrrd_path, np.swapaxes(xyz_scaled_mmap.T, 1, 2), options=xtk_opt)

    temp_xy.close()  # deletes temp file
    temp_xyz.close()


def _droppixels(a, scaley, scalex):
    """
    Make an array divisible by integer scale factors by dropping pixels from the right and bottom of the image.
    :param a: the array to be pixel dropped
    :param scaley: the scaling factor in Y
    :param scalex: the scaling factor in X
    :returns a: the pixel dropped image
    """

    # If new dimension not integral factors of original, drop pixels to make it so they are

    scalex = 1.0/scalex
    scaley = 1.0/scaley

    y1, x1 = a.shape
    changed = False

    # Get the shape of the old array after dropping pixels
    dropy = y1 % scaley
    if dropy != 0:
        b = a[0:-dropy]
        changed = True

    dropx = x1 % scalex
    if dropx != 0:
        b = a[:, 0:-dropx]
        changed = True

    if not changed:
        b = a

    return b


def internally_compressed_nrrd(slice_gen, nrrd_path):

    temp_xy = tempfile.TemporaryFile(mode='wb+')
    for i, z_slice_arr in enumerate(slice_gen.slices()):

        if windows:
            z_slice_arr.tofile(temp_xy.file)
        else:
            z_slice_arr.tofile(temp_xy)

    # Create memory mapped version of the temporary xy scaled slices
    mmap_shape = list(slice_gen.shape())
    mmap_shape = [mmap_shape[x] for x in [2, 1, 0]]  # re-order
    xyz_scaled_mmap = np.memmap(temp_xy, dtype=slice_gen.dtype(), mode='r', shape=tuple(mmap_shape))

    sitk.WriteImage(sitk.GetImageFromArray(xyz_scaled_mmap), nrrd_path, useCompression=True)


if __name__ == '__main__':

    import sys
    resample(sys.argv[1], sys.argv[2], sys.argv[3])