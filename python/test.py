
import conversion
import resampler
import sys


if sys.platform == "win32" or sys.platform == "win64":
    windows = True
else:
    windows = False

#use @with_setup(setup_func, teardown_func)

INPUT_DIR = '/home/neil/siah/IMPC_pipeline/preprocessing/example_data/'
TEST_MINC = 'NXN_K1029-1_KO.mnc'


def test_resampler():
    minc = conversion.minc_to_array(INPUT_DIR, TEST_MINC)
    hdf5array = minc['image']['0']['image']
    resampler.resample(hdf5array, 0.5, 'testnrrd_oout.nrrd')




