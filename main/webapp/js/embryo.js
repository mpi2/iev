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
//    function dcc_get(url, handler) {
//        var request = new XMLHttpRequest();
//        request.open('GET', url, true);
//        request.onreadystatechange = function(event) {
//            if (request.readyState === 4) {
//                if (request.status === 200)
//                    handler(JSON.parse(request.responseText));
//                else
//                    console.error('Unable to retrieve data from ' + url);
//            }
//        };
//        request.send(null);
//    }

    function dcc_get(url, handler) {
        console.log('dcc_get: ' + url);
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


    dcc.embryo = function (colonyId) {
        dcc_get("rest/centres" +
                (colonyId === undefined ? "" : "?colonyId=" + colonyId),
        function (data) {
            console.log('embro.js ' + data);
        });
    };

})();