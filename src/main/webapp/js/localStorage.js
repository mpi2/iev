

ievLocalStorage = function(finished){
    this.idbSupported = true;
    this.db = null;
    this.id = Math.random();

    if(!"indexedDB" in window) {
        this.idbSupported = false;
        return;
    }

    var openRequest = indexedDB.open("ievTest",1);

    openRequest.onupgradeneeded = function(e) {
        console.log("Upgrading iev indexedDB");
        var thisDB = e.target.result;

        if(!thisDB.objectStoreNames.contains("volumes")) {
            thisDB.createObjectStore("volumes");
        };
    };

    openRequest.onsuccess = function(e) {
        console.log("idxdb Success!");
        this.db = e.target.result;    
        var transaction = this.db.transaction(["volumes"],"readwrite");
        var store = transaction.objectStore("volumes");
        console.log('1st id:', this.id);
        finished();
    }.bind(this);

    openRequest.onerror = function(e) {
        console.log("Error");
        console.dir(e);
        finished();
    };
};


ievLocalStorage.prototype.getVolume = function (url, callback) {
    //First check if already present in store
    this._checkForKey(url, function (e) {
        if (e.target.result) {
            this._getfromIndexedDb(url, function(filedata){
                callback(filedata);
            });        
        }
        else {
            this._getFromServer(url, function(filedata){
                this._addVolume(url, filedata)
                callback(filedata);  
            }.bind(this));
            
        }
    }.bind(this));
};


ievLocalStorage.prototype._checkForKey = function (key, exists) {
    var transaction = this.db.transaction(["volumes"],"readonly");
    var store = transaction.objectStore("volumes");
    store.get(key).onsuccess = exists;
//    var req = store.openCursor(key);
//    req.onsuccess = function (e) {
//        var cursor = e.target.target;
//        if (cursor) { // key already exist
//            exists(true);
//        } else { // key not exist
//            exists(false);
//        }
//    };
};

ievLocalStorage.prototype._addVolume = function(volUrl, filedata){
    
    if(!this.idbSupported) return;
    
    //Define a person
    var volume = {
        name:volUrl,
        filedata:filedata,
        created:new Date()
    };

    //Perform the add
    var transaction = this.db.transaction(["volumes"],"readwrite");
    var store = transaction.objectStore("volumes");
    var request = store.add(volume, volUrl);

    request.onerror = function(e) {
        console.log("Error",e.target.error.message);
        //possibly already exists in DB
    };

    request.onsuccess = function(e) {
        console.log("Woot! Did it");
    };
};

ievLocalStorage.prototype._getfromIndexedDb = function(url, successCB){
 
    // If indexedDB not supported, just get the file from the server
    if (!this.idbSupported){
        successCB(this._getVolumeFromServer(url));
    }
    
    var transaction = this.db.transaction(["volumes"],"readwrite");
    var store = transaction.objectStore("volumes");
    var request = store.get(url);

    request.onsuccess = function(e) {

        var result = e.target.result;
        if(result) {
            console.log('retrieving volume from indexedDB');
        successCB(result.filedata);
        }
    };
    
    request.onerror = function(e){
        /*if we failed to get volumes from indexedDB, just fetch from server */
        consol.log('failed to get from idxdb even though key exists')
        this._getVolumeFromServer(url, function(filedata){
            successCB(filedata);
        })
    };
};

ievLocalStorage.prototype._getFromServer = function (url, success) {
    /*If we can't find volume in indexedDB or indexedDB not supported,
     * Load the file from an ajax call from the server*/
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.send();
    console.log('getting data from server')
    xhr.onreadystatechange = function (e) {
        if (this.readyState === 4) {
            success(this.response);
            
        }
    };
};

