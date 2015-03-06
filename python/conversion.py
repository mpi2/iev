import numpy as np
import os
import h5py
import nrrd
import SimpleITK as sitk
import bz2
import tifffile
import tempfile

DATA_TYPES = {"unsigned short": np.uint16, "uint16": np.uint16,
              "signed short": np.int16, "int16": np.int16,
              "unsigned byte": np.uint8, "uint8": np.uint8,
              "signed byte": np.int8, "int8": np.int8}


def nrrd_to_array(nrrd_file):
    return nrrd.read(nrrd_file)


def minc_to_array(input_folder, minc_file):

    # Open minc file using HDF5 module
    print "Loading {}".format(minc_file)
    minc = h5py.File(os.path.join(input_folder, minc_file), "r")['minc-2.0']
    #volume = np.transpose(minc['image']['0']['image'])
    return minc


def tiffs_to_array(folder_, out_path):

    print "Loading TIFF files in '{}'".format(folder_)
    tiff_list = sorted([f for f in os.listdir(folder_) if f.lower().endswith('tiff') or f.lower().endswith('tif')])

    # Get tiff info and create empty NRRD file
    first_tiff = tifffile.imread(folder_ + tiff_list[0])
    dims = list(first_tiff.shape)
    dims.append(len(tiff_list))
    dims = tuple(dims)
    volume = np.ndarray(shape=dims, dtype=first_tiff.dtype)

    for index, file_path in enumerate(tiff_list):

        try:
            im = tifffile.imread(folder_ + file_path)
            volume[:, :, index] = im
        except IOError as e:
            print "Error loading '{}'".format(file_path)
            return None

    return volume


def decompress_bz2(bz2_in, decompressed_out):

    if os.path.isfile(bz2_in) is False:
        raise IOError("Input file '{}' not found!".format(bz2_in))
        return None

    try:
        with open(decompressed_out, 'wb') as decom, bz2.BZ2File(bz2_in, 'rb') as com:
            for data in iter(lambda: com.read(1000 * 1024), b''):
                decom.write(data)
    except IOError as e:
        print "Error decompressing '{}'".format(bz2_in), e


def write_xtk_nrrd(volume, nrrd_out):

    try:
        options = {"encoding": "gzip",
                   "space": "left-posterior-superior",
                   "space directions": [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
                   "kinds": ["domain", "domain", "domain"],
                   "space origin": [0, 0, 0]}
        nrrd.write(nrrd_out, volume, options)
    except IOError as e:
        print "Failure writing .nrrd file: {}".format(e)


# # Define input raw file parameters
# fileName = sys.argv[1]
# dims = (642, 465, 417)
#
# # Load raw binary data into numpy array
# print "Reading raw data..."
# volume = np.fromfile(fileName, dtype=np.uint8).reshape(dims)
# im = sitk.GetImageFromArray(volume)
#
# # Shrink
# imShrunk = sitk.Shrink(im, (2,2,2))
#
# # Write as nifti
# outfile = fileName.split(".raw")[0] + ".nrrd"
# print "Writing NRRD data to " + outfile
# sitk.WriteImage(sitk.Cast(imShrunk, sitk.sitkUInt8), outfile)

# class XTKConverter():
#
#     dtype_dict = {"unsigned short": np.uint16, "signed short": np.int16,
#                   "unsigned byte": np.uint8, "signed byte": np.int8}
#
#     def __init__(self, input_folder, src="pipeline"):
#
#         self.input_folder = input_folder
#         self.output_folder = os.path.join(self.input_folder, "converted")
#
#         if os.path.isdir(self.output_folder) is False:
#             os.mkdir(self.output_folder)
#
#         if src == "pipeline":
#
#             for file_ in (file_ for file_ in os.listdir(input_folder) if file_.split('.')[-1] == "mnc"):
#                 print "Converting {}...".format(file_)
#                 nrrd_out = os.path.join(self.output_folder, file_ + ".nrrd")
#                 self.minc_to_nrrd(file_, nrrd_out)
#
#                 # return  # REMOVE TO CONTINUE FOR LOOP, REST IS UNREACHABLE
#
#         elif src == "harp":
#             return
#         else:
#             return


if __name__ == "__main__":

    recon = '/home/james/soft/test.nrrd.bz2'
    image_parts = recon.split(os.extsep)

    decom_out = '.'.join(image_parts[0:2])

    decom_tmp = decompress_bz2(recon, decom_out)
    print decom_tmp
    # tiffs_to_nrrd('/home/james/tmp/test_tiffs/', '/home/james/tmp/test.nrrd')