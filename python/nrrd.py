#!/usr/bin/env python
"""
Adapted from https://github.com/mhe/pynrrd/  Please see licence at https://github.com/mhe/pynrrd/blob/master/LICENSE
Copyright (c) 2012 Maarten H. Everts and contributors.

"""

import numpy as np
import os.path
import os
from datetime import datetime

class NrrdError(Exception):
    """Exceptions for Nrrd class."""
    pass


_TYPEMAP_NRRD2NUMPY = {
    'signed char': 'i1',
    'int8': 'i1',
    'int8_t': 'i1',
    'uchar': 'u1',
    'unsigned char': 'u1',
    'uint8': 'u1',
    'uint8_t': 'u1',
    'short': 'i2',
    'short int': 'i2',
    'signed short': 'i2',
    'signed short int': 'i2',
    'int16': 'i2',
    'int16_t': 'i2',
    'ushort': 'u2',
    'unsigned short': 'u2',
    'unsigned short int': 'u2',
    'uint16': 'u2',
    'uint16_t': 'u2',
    'int': 'i4',
    'signed int': 'i4',
    'int32': 'i4',
    'int32_t': 'i4',
    'uint': 'u4',
    'unsigned int': 'u4',
    'uint32': 'u4',
    'uint32_t': 'u4',
    'longlong': 'i8',
    'long long': 'i8',
    'long long int': 'i8',
    'signed long long': 'i8',
    'signed long long int': 'i8',
    'int64': 'i8',
    'int64_t': 'i8',
    'ulonglong': 'u8',
    'unsigned long long': 'u8',
    'unsigned long long int': 'u8',
    'uint64': 'u8',
    'uint64_t': 'u8',
    'float': 'f4',
    'double': 'f8',
    'block': 'V'
}

_TYPEMAP_NUMPY2NRRD = {
    'i1': 'int8',
    'u1': 'uint8',
    'i2': 'int16',
    'u2': 'uint16',
    'i4': 'int32',
    'u4': 'uint32',
    'i8': 'int64',
    'u8': 'uint64',
    'f4': 'float',
    'f8': 'double',
    'V': 'block'
}

_NUMPY2NRRD_ENDIAN_MAP = {
    '<': 'little',
    'L': 'little',
    '>': 'big',
    'B': 'big'
}



_NRRD_REQUIRED_FIELDS = ['dimension', 'type', 'encoding', 'sizes']

# The supported field values
_NRRD_FIELD_ORDER = [
    'type',
    'dimension',
    'space dimension',
    'space',
    'sizes',
    'space directions',
    'kinds',
    'endian',
    'encoding',
    'min',
    'max',
    'oldmin',
    'old min',
    'oldmax',
    'old max',
    'content',
    'sample units',
    'spacings',
    'thicknesses',
    'axis mins',
    'axismins',
    'axis maxs',
    'axismaxs',
    'centerings',
    'labels',
    'units',
    'space units',
    'space origin',
    'measurement frame',
    'data file']


def _format_nrrd_list(fieldValue) :
    return ' '.join([str(x) for x in fieldValue])


def _format_nrrdvector(v) :
    return '(' + ','.join([str(x) for x in v]) + ')'


def _format_optional_nrrdvector(v):
    if (v == 'none') :
        return 'none'
    else :
        return _format_nrrdvector(v)

_NRRD_FIELD_FORMATTERS = {
    'dimension': str,
    'type': str,
    'sizes': _format_nrrd_list,
    'endian': str,
    'encoding': str,
    'min': str,
    'max': str,
    'oldmin': str,
    'old min': str,
    'oldmax': str,
    'old max': str,
    'lineskip': str,
    'line skip': str,
    'byteskip': str,
    'byte skip': str,
    'content': str,
    'sample units': str,
    'datafile': str,
    'data file': str,
    'spacings': _format_nrrd_list,
    'thicknesses': _format_nrrd_list,
    'axis mins': _format_nrrd_list,
    'axismins': _format_nrrd_list,
    'axis maxs': _format_nrrd_list,
    'axismaxs': _format_nrrd_list,
    'centerings': _format_nrrd_list,
    'labels': _format_nrrd_list,
    'units': _format_nrrd_list,
    'kinds': _format_nrrd_list,
    'space': str,
    'space dimension': str,
    'space units': _format_nrrd_list,
    'space origin': _format_nrrdvector,
    'space directions': lambda fieldValue: ' '.join([_format_optional_nrrdvector(x) for x in fieldValue]),
    'measurement frame': lambda fieldValue: ' '.join([_format_optional_nrrdvector(x) for x in fieldValue]),
}


def _write_data(data, filehandle, options):
    """
    :param data: numpy ndarray (memmaped if working with large files)
    :param filehandle:
    :param options: dict
    :return:
    Write a nrrd from a memmaped ndarray. Writes a slice at a time to prevent hogging RAM
    """

    if options['encoding'] == 'raw':
        for z in range(data.shape[2]):
            rawdata = data[:, :, z].tostring(order='F')
            filehandle.write(rawdata)


def write(filename, data, options={}, separate_header=False):
    """Write the numpy data to a nrrd file. The nrrd header values to use are
    inferred from from the data. Additional options can be passed in the
    options dictionary. See the read() function for the structure of this
    dictionary.

    To set data samplings, use e.g. `options['spacings'] = [s1, s2, s3]` for
    3d data with sampling deltas `s1`, `s2`, and `s3` in each dimension.

    """
    # Infer a number of fields from the ndarray and ignore values
    # in the options dictionary.
    options['type'] = _TYPEMAP_NUMPY2NRRD[data.dtype.str[1:]]
    if data.dtype.itemsize > 1:
        options['endian'] = _NUMPY2NRRD_ENDIAN_MAP[data.dtype.str[:1]]
    # if 'space' is specified 'space dimension' can not. See http://teem.sourceforge.net/nrrd/format.html#space
    if 'space' in options.keys() and 'space dimension' in options.keys():
        del options['space dimension']
    options['dimension'] = data.ndim
    options['sizes'] = list(data.shape)

    # The default encoding is 'gzip'
    if 'encoding' not in options:
        options['encoding'] = 'raw'

    with open(filename,'wb') as filehandle:
        filehandle.write('NRRD0004\n')
        filehandle.write('# This NRRD file was generated by HARP with the help of pynrrd\n')
        filehandle.write('# on ' +
                         datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S') +
                         '(GMT).\n')
        filehandle.write('# Complete NRRD file format specification at:\n');
        filehandle.write('# http://teem.sourceforge.net/nrrd/format.html\n');

        # Write the fields in order, this ignores fields not in _NRRD_FIELD_ORDER
        for field in _NRRD_FIELD_ORDER:
            if options.has_key(field):
                outline = (field + ': ' +
                           _NRRD_FIELD_FORMATTERS[field](options[field]) +
                           '\n')
                filehandle.write(outline)
        for (k,v) in options.get('keyvaluepairs', {}).items():
            outline = str(k) + ':=' + str(v) + '\n'
            filehandle.write(outline)

        # Write the closing extra newline
        filehandle.write('\n')

        # If a single file desired, write data
        if not separate_header:
            _write_data(data, filehandle, options)


def write_nrrd_header(filehandle, shape, npdtype, ndim=3, options={}):
    """Write the numpy data to a nrrd file. The nrrd header values to use are
    inferred from from the data. Additional options can be passed in the
    options dictionary. See the read() function for the structure of this
    dictionary.

    To set data samplings, use e.g. `options['spacings'] = [s1, s2, s3]` for
    3d data with sampling deltas `s1`, `s2`, and `s3` in each dimension.

    """
    # Infer a number of fields from the ndarray and ignore values
    # in the options dictionary.

    #'make sure file does not exist as we are appending to it
    # if os.path.isfile(filename):
    #     os.remove(filename)



    options['type'] = _TYPEMAP_NUMPY2NRRD[npdtype.str[1:]]
    if npdtype.itemsize > 1:
        options['endian'] = _NUMPY2NRRD_ENDIAN_MAP[npdtype.str[:1]]
    # if 'space' is specified 'space dimension' can not. See http://teem.sourceforge.net/nrrd/format.html#space
    if 'space' in options.keys() and 'space dimension' in options.keys():
        del options['space dimension']
    options['dimension'] = ndim
    options['sizes'] = list(shape)

    # The default encoding is 'gzip'
    if 'encoding' not in options:
        options['encoding'] = 'raw'

    filehandle.write('NRRD0004\n')
    filehandle.write('# This NRRD file was generated by HARP with the help of pynrrd\n')
    filehandle.write('# on ' +
                     datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S') +
                     '(GMT).\n')
    filehandle.write('# Complete NRRD file format specification at:\n');
    filehandle.write('# http://teem.sourceforge.net/nrrd/format.html\n');

    # Write the fields in order, this ignores fields not in _NRRD_FIELD_ORDER
    for field in _NRRD_FIELD_ORDER:
        if options.has_key(field):
            outline = (field + ': ' +
                       _NRRD_FIELD_FORMATTERS[field](options[field]) +
                       '\n')
            filehandle.write(outline)
    for (k,v) in options.get('keyvaluepairs', {}).items():
        outline = str(k) + ':=' + str(v) + '\n'
        filehandle.write(outline)

    # Write the closing extra newline
    filehandle.write('\n')

    # If a single file desired, write data
    return filehandle
    #_write_data(data, filehandle, options)



if __name__ == "__main__":
    import doctest
    doctest.testmod()

