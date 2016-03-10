#!/usr/bin/env python

import os
from addict import Dict
from os.path import join, splitext, relpath
import json

# Temp hard coding, put in a json config
TOP_VIEWER = 'mutant'
BOTTOM_VIEWER = 'wildtype'
FILE_EXTENSIONS = ['.nrrd', '.nii', 'tif', '.tiff']

def run(in_dir):
    script_dir = os.path.dirname(os.path.realpath(__file__))
    data = Dict()

    experiment_dirs = [x for x in os.listdir(in_dir) if os.path.isdir(join(in_dir, x))]
    for exp in experiment_dirs:

        reltop = relpath(join(in_dir, exp, TOP_VIEWER), in_dir)
        data[exp]['top']['dir'] = reltop
        data[exp]['top']['files'] = [x for x in os.listdir(join(in_dir, exp, TOP_VIEWER)) if splitext(x)[1] in FILE_EXTENSIONS ]

        relbottom = relpath(join(in_dir, exp, BOTTOM_VIEWER), in_dir)
        data[exp]['bottom']['dir'] = relbottom
        data[exp]['bottom']['files'] = [x for x in os.listdir(join(in_dir, exp, BOTTOM_VIEWER)) if splitext(x)[1] in FILE_EXTENSIONS ]

    outjson = join(script_dir, 'files.json')
    with open(outjson, 'w') as fh:
        fh.write(json.dumps(data, sort_keys=True, indent=4, separators=(',', ': ')))

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser("generate JSON file for IEV")
    parser.add_argument('-i', dest='input_dir', help='directory containing input data for IEV', required=True)
    args = parser.parse_args()

    run(args.input_dir)
