
goog.provide('iev.localStorage'); // Not used yet

iev.localStorage = function(){
    
};

iev.localStorage.prototype.checkForHtml5Storage = function (successCallback, errorCallback) {
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

    var size = 1000 * 50;  /*~50MB*/
    window.requestFileSystem(window.TEMPORARY, size, successCallback, errorCallback)
};
