//goog.provide(iev);



(function() {
    goog.require('iev.embryoviewer');
    /* this is the global variable where we expose the public interfaces */
//    if (typeof iev === 'undefined')
//        iev = {};
if (typeof dcc === 'undefined')
        dcc = {};
alert('cat');
    /**
     * Retrieves data using asynchronous HTTP request.
     *
     * @param {String} url Resource URL to retrieve data from.
     * @param {Function} handler Handles successful retrieval.
     */
    function dcc_get(url, handler) {
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
    }

    dcc.getVolumesByColonyId = function(colonyId, bookmarkData) {   
        dcc_get("rest/volumes" + (colonyId === undefined ? "" : "?colony_id=" + colonyId), 
            function(data) {   
                iev.embryoviewer(data, 'viewer', 'colony ID', colonyId, bookmarkData);     
        });
    };
    
    
    dcc.getVolumesByGeneSymbol = function(geneSymbol, bookmarkData) {
        dcc_get("rest/volumes" + (geneSymbol === undefined ? "" : "?gene_symbol=" + geneSymbol), 
            function(data) {   
                iev.embryoviewer(data, 'viewer', 'gene symbol', geneSymbol, bookmarkData);     
        });
    };
    
    dcc.getVolumesByMgi = function(mgi, bookmarkData) {
        console.log('gettigng by mgi');
        console.log(mgi);
        dcc_get("rest/volumes" + (mgi === undefined ? "" : "?mgi=" + mgi), 
            function(data) {   
                iev.embryoviewer(data, 'viewer', 'mgi', mgi, bookmarkData);  
               
        });
    };


})();