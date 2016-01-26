/*
 * Get data for loading into IEV. First checks whether it belongs in the the IndexedDB local storage.
 * Also check date of last time modified on localstorage and on server. If new on server, reload and replace.
/*
 * 
 */

goog.provide('iev.LocalStorage');

iev.LocalStorage = function(isBrowserIE){
    this.idbSupported = true;
   
    this.db = null;
    this.id = Math.random();

    if(!"indexedDB" in window || isBrowserIE) {
        this.idbSupported = false;
        console.log('indexedDB not supported. Loading volumes from server')
        
    };
    
};


iev.LocalStorage.prototype.setup = function(finished){
    
    if (!this.idbSupported){
        finished();
    };
    
    var openRequest = indexedDB.open("ievTest", 4); //

    openRequest.onupgradeneeded = function(e) {
        console.log("Upgrading iev indexedDB");
        var thisDB = e.target.result;

        // Create a volumes object store if not exists
        if(thisDB.objectStoreNames.contains("volumes")) {
            // If exists, delete and move up a version
            thisDB.deleteObjectStore("volumes");
        };
        thisDB.createObjectStore("volumes");
        
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
        console.log("Error initialising IndexedDB");
        console.dir(e);
        this.idbSupported = false;
        finished();
    }.bind(this);
};


iev.LocalStorage.prototype.getVolume = function (url, remoteDate, callback) {
    //First check if already present in store
    /*
     * url: path to volume on server
     * lastUpdated: last time volume was modified on server
     * callbac: where to send the resulting volume data
     */
    
    // For chrome
    var test = navigator.webkitTemporaryStorage;
    if (typeof navigator.webkitTemporaryStorage != 'undefined'){
        navigator.webkitTemporaryStorage.queryUsageAndQuota ( 
        function(usedBytes, grantedBytes) {  
            var used_gb = usedBytes / 1024 / 1024 / 1024;
            used_gb = used_gb.toFixed(2)
            var granted_gb = grantedBytes / 1024 / 1024 / 1024;
            granted_gb = granted_gb.toFixed(2);
            console.log('we are using ', used_gb, ' of ', granted_gb, 'Gigabytes');
        }, 
        function(e) { console.log('Error', e);  }
        );
    }
    
    if (this.idbSupported) {
        this._checkForKey(url, function (key_exists) {
            if (key_exists) { 
                //We get a volume result back from idxDB. Now check if we have a newer version on the server
                console.log('key exists oh yeah!!')
                this._getfromIndexedDb(url, function (idxdbResult) {
                    // Check if there's a newer version on server
                    var localDate = new Date(idxdbResult.lastUpdate)
                    console.log('local__date', localDate, 'remoteDAT', remoteDate);
                    //console.log(idxdbResult);
                    
                    if (localDate < remoteDate) { //we have a newer version on the server
                        console.log('newer data available on the server');
                        this._getFromServer(url, function (filedata) {
                            this._addVolume(url, remoteDate, filedata)
                            callback(filedata);
                        }.bind(this));
                    }else{ // The local data is up to date so use it
                         callback(idxdbResult.filedata);
                    }    
                }.bind(this));
            }
            else {
                console.log('key does not exist. Boo!')
                this._getFromServer(url, function (filedata) {
                    this._addVolume(url, remoteDate, filedata)
                    callback(filedata);
                }.bind(this));

            }
        }.bind(this));
    } else {
        
        this._getFromServer(url, function (filedata) {
            this._addVolume(url, remoteDate, filedata)
            callback(filedata);
        }.bind(this));
    }
};


iev.LocalStorage.prototype._checkForKey = function (key, idxdbSuccess) {
    /*
     * Check for presence of volume in local storage and  whether we have older version
     */
    var transaction = this.db.transaction(["volumes"],"readonly");
    var store = transaction.objectStore("volumes");
    
    var req = store.get(key);    
    req.onsuccess = function(event){
         var myResult = event.target.result;
         idxdbSuccess(myResult)
         //console.log('checked for key', key, myResult)
          
    }
    req.onerror = function(event) {
          alert("key not in local storage!");
    };
            
};

iev.LocalStorage.prototype._addVolume = function(volUrl, lastUpdated, filedata){
    /*
     * Add a volume to indexedDB local storage
     */
    
    if(!this.idbSupported) return;
    
    var volume = {
        name:volUrl, // Path to file on server
        filedata:filedata,  //ArrayBuffer
        lastUpdate:lastUpdated // Data object
    };
    
    var transaction = this.db.transaction(["volumes"],"readwrite");
    var store = transaction.objectStore("volumes");
    var request = store.put(volume, volUrl);
    
    request.onerror = function(e) {
        console.log("Could not 'put' volume into local storage: ", e.target.error.message);
    };

    request.onsuccess = function(e) {
        console.log("Successfully added volume to local storage");
    };    
  
};

iev.LocalStorage.prototype._getfromIndexedDb = function(url, successCB){
 
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
        successCB(result);
        }
    };
    
    request.onerror = function(e){
        /*if we failed to get volumes from indexedDB, just fetch from server */
        console.log('failed to get from idxdb even though key exists')
        this._getVolumeFromServer(url, function(filedata){
            successCB(filedata);
        });
    };
};

iev.LocalStorage.prototype._getFromServer = function (url, success) {
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


iev.LocalStorage.prototype.removeVolume = function(url){
    var request = this.db.transaction(["volumes"],"readwrite")
            .objectStore("volumes").delete(url);
            
    request.onerror = function(e){
        console.log('Error deleting corrupted image from IndexedDB storage');
    };
    
    request.onsuccess = function(e){
        console.log(url + " successfully deleted from IndexedDB storage");
    };
    
};

