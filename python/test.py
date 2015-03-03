import sys
import SliceGenerator
import resampler



if sys.platform == "win32" or sys.platform == "win64":
    windows = True
else:
    windows = False

#use @with_setup(setup_func, teardown_func)

INPUT_NRRD = '/home/neil/siah/IMPC_pipeline/preprocessing/example_data/IMPC_cropped_20141104_RYR2_18.1h_WT_Rec.nrrd'
OUT = 'testing.nrrd'

def test_resampler():
    slicegen = SliceGenerator.NrrdSliceGenerator(INPUT_NRRD)
    resampler.resample(slicegen, 0.5, OUT)



if __name__ == '__main__':
    test_resampler()
