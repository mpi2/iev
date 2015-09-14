//goog.provide('iev.idxdb');

iev = function(){
    
};

iev.idxdb = function(){
    this.idbSupported = false;
    this.db;
};

iev.idxdb.prototype.checkForIndexDB = function (successCallback, errorCallback) {

    if("indexedDB" in window) {
        this.idbSupported = true;
    }

    if(this.idbSupported) {
        var openRequest = indexedDB.open("iev",1);

        openRequest.onupgradeneeded = function(e) {
            console.log("Upgrading iev indexedDB");
            var thisDB = e.target.result;

            if(!thisDB.objectStoreNames.contains("volumes")) {
                thisDB.createObjectStore("volumes");
            };
        };

        openRequest.onsuccess = function(e) {
            console.log("Success!");
            this.db = e.target.result;
            successCallback();
        }.bind(this);

        openRequest.onerror = function(e) {
            console.log("Error");
            console.dir(e);
        };

    }

};

iev.idxdb.prototype.addVolume = function(volUrl, xtkVolume, successCB){
    
    if(!this.idbSupported) return;
    
    var transaction = this.db.transaction(["volumes"],"readwrite");
    var store = transaction.objectStore("volumes");
    var filedata = xtkVolume.filedata;
    //Define a person
    var volume = {
        name:volUrl,
        filedata:filedata,
        created:new Date()
    };

    //Perform the add
    var request = store.add(volume, volUrl);

    request.onerror = function(e) {
        console.log("Error",e.target.error.message);
        //possibly already exists in DB
        successCB();
    };

    request.onsuccess = function(e) {
        console.log("Woot! Did it");
        successCB();
    };
};

iev.idxdb.prototype.getVolume = function(url, successCB){

    if (!this.idbSupported){
        successCB(this._getVolumeFromServer(url));
    }
    var transaction = this.db.transaction(["volumes"],"readonly");
    var store = transaction.objectStore("volumes");

    var request = store.get(url);

    request.onsuccess = function(e) {

        var result = e.target.result;
        if(result) {
        successCB(result.filedata);
        }
    };
    
    request.onerror = function(e){
        /*if we failed to get volumes from indexedDB, just fetch from server */
        successCB(this._getVolumeFromServer(url))
    };
};

iev.idxdb.prototype._getVolumeFromServer = function (url) {
    /*If we can't find volume in indexedDB or indexedDB not supported,
     * Load the file from an ajax call from the server*/
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.send();
    xhr.onreadystatechange = function (e) {
        if (this.readyState === 4) {
            this.response;
            
        }
    };
};

