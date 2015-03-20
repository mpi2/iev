"""
This file is a testing suite for resampling the various image formats.
"""

import SliceGenerator
import resampler


INPUT_NRRD = '/home/neil/work/test_volumes/20140515_KLHDC2_E14.5_21.1h_WT_XX_REC_14.nrrd'
OUT_NRRD = 'test_rescaler_nnrd.nrrd'
INPUT_MINC = '/home/neil/work/test_volumes/NXN_K1029-1_KO.mnc'
OUT_MINC = 'test_rescaler_minc.nrrd'
INPUT_TIFF = '/home/neil/work/test_volumes/20140515_KLHDC2_E14.5_21.1h_WT_XX_REC_14.tif'
OUT_TIFF = 'test_rescaler_tif.nrrd'

def test_NRRD():
    slicegen = SliceGenerator.NrrdSliceGenerator(INPUT_NRRD)
    resampler.resample(slicegen, 0.5, OUT_NRRD)

def test_MINC():
    slicegen = SliceGenerator.MincSliceGenerator(INPUT_MINC)
    resampler.resample(slicegen, 0.5, OUT_MINC)

def test_TIFF():
    slicegen = SliceGenerator.TiffStackSliceGenerator(INPUT_TIFF)
    resampler.resample(slicegen, 0.5, OUT_TIFF)



if __name__ == '__main__':
    # test_NRRD()
    test_TIFF()

