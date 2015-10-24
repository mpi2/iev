//goog.provide('iev.embryo');
//goog.require('iev.embryoviewer');



iev.embryo = function(){
   
};

iev.embryo.prototype.dcc_get = function(url, handler){
    
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onreadystatechange = function(event) {
            if (request.readyState === 4) {
                if (request.status === 200)
                    handler(JSON.parse(request.responseText));
                else
                    console.error('Unable to retrieve data from ' + url);
            }
        };
        request.send(null);
};

iev.embryo.prototype.getVolumesByColonyId = function(colonyId, bookmarkData) {   
    this.dcc_get("rest/volumes" + (colonyId === undefined ? "" : "?colony_id=" + colonyId), 
        function(data) {   
            var e = new iev.embryoviewer(data, 'viewer', 'colony ID', colonyId, bookmarkData);     
    });
};
    
    
iev.embryo.prototype.getVolumesByGeneSymbol = function(geneSymbol, bookmarkData) {
    this.dcc_get("rest/volumes" + (geneSymbol === undefined ? "" : "?gene_symbol=" + geneSymbol), 
        function(data) {   
            var e = new iev.embryoviewer(data, 'viewer', 'gene symbol', geneSymbol, bookmarkData);     
    });
};
    
iev.embryo.prototype.getVolumesByMgi = function(mgi, bookmarkData) {
    console.log('gettigng by mgi');
    console.log(mgi);
    this.dcc_get("rest/volumes" + (mgi === undefined ? "" : "?mgi=" + mgi), 
        function(data) {   
            var e = new iev.embryoviewer(data, 'viewer', 'mgi', mgi, bookmarkData);  

    });
};

