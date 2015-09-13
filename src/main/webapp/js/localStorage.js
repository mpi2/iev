


iev = function(){
    this.idbSupported = false;
    this.db;
};

iev.prototype.checkForIndexDB = function (successCallback, errorCallback) {

    if("indexedDB" in window) {
        this.idbSupported = true;
    }

    if(this.idbSupported) {
        var openRequest = indexedDB.open("iev",1);

        openRequest.onupgradeneeded = function(e) {
            console.log("Upgrading...");
            var thisDB = e.target.result;

            if(!thisDB.objectStoreNames.contains("volumes")) {
                thisDB.createObjectStore("volumes");
            }
        }

        openRequest.onsuccess = function(e) {
            console.log("Success!");
            this.db = e.target.result;
            successCallback();
        }.bind(this);

        openRequest.onerror = function(e) {
            console.log("Error");
            console.dir(e);
        }

    }

};

iev.prototype.addVolume = function(volname, xtkVolume, successCB){
    console.log('dbbbb', this.db);
    var transaction = this.db.transaction(["volumes"],"readwrite");
    var store = transaction.objectStore("volumes");

    //Define a person
    var volume = {
        name:volname,
        volume:xtkVolume,
        created:new Date()
    };

    //Perform the add
    var request = store.add(volume, volname);

    request.onerror = function(e) {
        console.log("Error",e.target.error.name);
        //possibly already exists in DB
        successCB();
    };

    request.onsuccess = function(e) {
        console.log("Woot! Did it");
        successCB();
    };
};

iev.prototype.getVolume = function(key, successCB){

    var transaction = this.db.transaction(["volumes"],"readonly");
    var store = transaction.objectStore("volumes");

    var request = store.get(Number(key));

    request.onsuccess = function(e) {

        var result = e.target.result;
        console.dir('newvol', result.volume);
        if(result) {
        successCB(result);

        }
    };
};

