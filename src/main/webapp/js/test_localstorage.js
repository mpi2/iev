goog.require('X.renderer2D');
goog.require('X.interactor2D');


window.onload = function() {
var t = new test();

};

test = function(){
this.sliceX = null;
this.sliceY = null;
this.sliceZ = null;
this.volume = null;

this.iev_ = new iev();

  //
  // create the 2D renderers
  // .. for the X orientation
  this.sliceX = new X.renderer2D();
  this.sliceX.container = 'sliceX';
  this.sliceX.orientation = 'X';
  this.sliceX.init();
  // .. for Y
  this.sliceY = new X.renderer2D();
  this.sliceY.container = 'sliceY';
  this.sliceY.orientation = 'Y';
  this.sliceY.init();
  // .. and for Z
  this.sliceZ = new X.renderer2D();
  this.sliceZ.container = 'sliceZ';
  this.sliceZ.orientation = 'Z';
  this.sliceZ.init();


  //
  // THE VOLUME DATA
  //
  // create a X.volume
  this.volume = new X.volume();
  
  this.volume.file = 'http://x.babymri.org/?vol.nrrd';
  
  this.sliceX.add(this.volume);
  this.sliceX.render();


  this.sliceX.onShowtime = function() {
  
  console.log('ovol', this.volume);
    this.iev_.checkForIndexDB(this.indexDbSuccesCb.bind(this));

    this.sliceY.add(this.volume);
    this.sliceY.render();
    this.sliceZ.add(this.volume);
    this.sliceZ.render();
  }.bind(this);
 };

test.prototype.indexDbSuccesCb = function(){
    var context = this;
      this.iev_.addVolume(this.volume.file, this.volume, this.volumeLoadedCB.bind(this));
 };


test.prototype.volumeLoadedCB = function(){
    //hard coded db key. Need to work out how to set unique keys and map to volume names
    this.iev_.getVolume(2, this.dataLoadedCB.bind(this));
 };

test.prototype.dataLoadedCB = function(retrievedObj){
    
    //this.sliceX.destroy(); //Can't seem to destroy
   
     //delete this.sliceX;
     
    
    
    this.sliceXn = new X.renderer2D();
    this.newVol= new X.volume();
    this.newVol.file = 'dummy.nrrd'; // The needs to be set
    this.newVol.filedata = retrievedObj.volume.filedata;
    
    this.sliceXn.container = 'sliceXnew';
    this.sliceXn.orientation = 'X';
    this.sliceXn.init();
    this.sliceXn.add(this.newVol);
    this.sliceXn.render();
 };

