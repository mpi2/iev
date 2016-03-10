goog.provide('iev.filegetter');
goog.require('iev.embryoviewer');
//goog.require('iev');



$("#iev").load("iev/viewer.html");

iev.fileGetter = function(){
    this.configFile = 'files.json';
    fileExtension = '.nrrd';
    this.experiment = 'cbx4';
};

iev.fileGetter.prototype.readConfig = function(cb){
    $.getJSON( this.configFile, function( data ) {
     cb(data);
          
  });
 

};

iev.fileGetter.prototype.loadFilesFromConfig = function(experimentId) {   
    this.readConfig(function(data){
        var top = data[this.experiment].top;
        var bottom = data[this.experiment].bottom;
        
        var top_path = top.dir;
        var bottom_path = bottom.dir;
        var top_files = top['files'];
        var bottom_files = bottom['files']


        files = [];

        for (var i = 0; i < top_files.length; i++) {
            files.push(this.buildDataObject('mutant', top_path, top_files[i]));
        }

        for (var i = 0; i < bottom_files.length; i++) {
            files.push(this.buildDataObject('baseline', bottom_path, bottom_files[i]));
        }

        centre_data = {
                        "8":files}



        var data = {success: true,
                    ievLight: true,
                    centre_data: centre_data,
                    topFiles: top_files,
                    bottomFiles: bottom_files,
                    analysis_data: {}

                    }
        var viewer = new iev.embryoviewer(data, 'viewer', 'colony ID', 'cbx4', {wt:{}, mut:{}}, true);
        
    }.bind(this))
};


iev.fileGetter.prototype.buildDataObject = function(geneSymbol, dir, file){
                    data =
                    {"id":161,
                    "cid":8,
                    "lid":9,
                    "gid":0,
                    "pid":202,
                    "qid":5428,
                    "colonyId":geneSymbol,
                    "geneSymbol":geneSymbol,
                    "sid":19,
                    "mid":"84416124",
                    "statusId":1,
                    "url":"ftp://ftp.cmhd.ca/home/dccrawler/impc/images/OPT/Fadd/IMPC_cropped_20140326_Fadd_E9.5_74918_WT_ND_UV_rec.nrrd.bz2",
                    "animalName":"ABBP_K749-18-e9.5",
                    "imageForDisplay":"603697_12.nrrd",
                    "qc":0,
                    "mgi":"",
                    "zygosity":"Homozygous",
                    "sex":"No data",
                    "experimentDate":"Mar 26, 2014 12:00:00 AM",
                    "volume_url": 'data/' + dir + '/' + file};
              return data

}

goog.exportSymbol('iev.fileGetter.prototype.loadFilesFromConfig', iev.fileGetter.prototype.loadFilesFromConfig)


