(function() {
    /* this is the global variable where we expose the public interfaces */
    if (typeof dcc === 'undefined')
        dcc = {};

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

    dcc.getVolumesByColonyId = function(colonyId) {   
        dcc_get("rest/volumes" + (colonyId === undefined ? "" : "?colony_id=" + colonyId), 
            function(data) {   
                dcc.EmbryoViewer(data, 'viewer', 'colony ID', colonyId);     
        });
    };
    
    
    dcc.getVolumesByGeneSymbol = function(geneSymbol) {   
        dcc_get("rest/volumes" + (geneSymbol === undefined ? "" : "?gene_symbol=" + geneSymbol), 
            function(data) {   
                dcc.EmbryoViewer(data, 'viewer', 'gene symbol', geneSymbol);     
        });
    };


})();