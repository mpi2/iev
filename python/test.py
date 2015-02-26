
import nose
import conversion
import os
from os.path import expanduser
import cv2
import h5py

#use @with_setup(setup_func, teardown_func)

INPUT_DIR = '/home/neil/siah/IMPC_pipeline/preprocessing/example_data/'
TEST_MINC = 'NXN_K1029-1_KO.mnc'
#TEST_NRRD_PATH =
#TEST_TIFF_PATH =


def setup():
    pass

def teardown():
    pass


def test_minc_to_array():
    minc = conversion.minc_to_array(INPUT_DIR, TEST_MINC)
    mapped_array = minc['image']['0']['image']
    #print type(mapped_array[10, 10, 10])

    xyscaledH5 = h5py.File('tempXyscaledH5', 'a')

    # We need to get the shape of the resized array
    xyshrunk_shape = list(cv2.resize(mapped_array[1, :, :], None, fx=2, fy=2).shape)
    xyshrunk_shape.insert(0, mapped_array.shape[0])
    dtype = mapped_array.dtype

    xyscaledH5.create_dataset('tempscale', xyshrunk_shape, dtype)

    for i in range(0, mapped_array.shape[0]):

        shrunk_slice = cv2.resize(mapped_array[i, :, :], None, fx=2, fy=2)

        xyscaledH5[i, :, :] = shrunk_slice


