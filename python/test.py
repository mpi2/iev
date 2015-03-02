
import nrrd
import conversion
import os
import cv2
import h5py
import tempfile
import sys
import numpy as np

if sys.platform == "win32" or sys.platform == "win64":
    windows = True
else:
    windows = False

#use @with_setup(setup_func, teardown_func)

INPUT_DIR = '/home/neil/siah/IMPC_pipeline/preprocessing/example_data/'
TEST_MINC = 'NXN_K1029-1_KO.mnc'
#TEST_NRRD_PATH =
#TEST_TIFF_PATH =


def setup():
    pass

def teardown():
    pass


def test_hdf5_resample_nrrd():
    minc = conversion.minc_to_array(INPUT_DIR, TEST_MINC)
    hdf5array = minc['image']['0']['image']
    #print type(mapped_array[10, 10, 10])

    tempXY = tempfile.TemporaryFile(mode='wb+')

    # We need to get the shape of the resized array
    xyshrunk_shape = list(cv2.resize(hdf5array[1, :, :], None, fx=0.5, fy=0.5).shape)
    xyshrunk_shape.insert(0, hdf5array.shape[0])

    dtype = hdf5array.dtype

    for i in range(0, hdf5array.shape[0]):

        shrunk_slice = cv2.resize(hdf5array[i, :, :], None, fx=0.5, fy=0.5)

        if windows:
            shrunk_slice.tofile(tempXY.file)
        else:
            shrunk_slice.tofile(tempXY)

    #Scale in XZ

    xy_scaled_mmap = np.memmap(tempXY, dtype=dtype, mode='r', shape=tuple(xyshrunk_shape))

    xyzshrunk_shape = list(cv2.resize(xy_scaled_mmap[:, :, 1], None, fx=1.0, fy=0.5).shape)
    xyzshrunk_shape.insert(2, xy_scaled_mmap.shape[2])

    temp_xyz = tempfile.TemporaryFile(mode='wb+')

    for i in range(0, xy_scaled_mmap.shape[2]):

        shrunk_slice = cv2.resize(xy_scaled_mmap[:, :, i], None, fx=1.0, fy=0.5)
        if windows:
            shrunk_slice.tofile(temp_xyz.file)
        else:
            shrunk_slice.tofile(temp_xyz)

    xyz_scaled_mmap = np.memmap(temp_xyz, dtype=dtype, mode='r', shape=tuple(xyzshrunk_shape))

    nrrdout = 'scaled_nrrd_temp.nrrd'
    if os.path.isfile(nrrdout):
        os.remove(nrrdout)

    nrrd.write('scaled_nrrd_temp.nrrd', np.swapaxes(xyz_scaled_mmap, 0, 1 ))

    tempXY.close()
    temp_xyz.close()


#create memory mapped version of the temporary xy scaled slices


    #nrrd.write(outpath, np.swapaxes(xyz_scaled_mmap.T, 1, 2))


if __name__ == '__main__':
    test_minc_to_array()