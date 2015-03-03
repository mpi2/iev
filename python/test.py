import SliceGenerator
import resampler


INPUT_NRRD = '/home/neil/work/20140515_KLHDC2_E14.5_21.1h_WT_XX_REC_14.nrrd'
OUT = 'testing.nrrd'

def test_resampler():
    slicegen = SliceGenerator.NrrdSliceGenerator(INPUT_NRRD)
    resampler.resample(slicegen, 0.5, OUT)



if __name__ == '__main__':
    test_resampler()
