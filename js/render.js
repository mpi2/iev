window.onload = function() {

  // create and initialize a 3D renderer
  var r = new X.renderer3D();
  r.bgColor = [1, 1, 1];
  r.init();
  
  
  // create a X.volume
  var v = new X.volume();
  // .. and attach the single-file dicom in .NRRD format
  // this works with gzip/gz/raw encoded NRRD files but XTK also supports other
  // formats like MGH/MGZ
  v.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/260814_14um_average-1.nrrd';
  //v.labelmap.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/seg_260814_14um_average_atlas-1.nrrd';
  
 
  
  // only add the volume for now, the mesh gets loaded on request
  r.add(v);
  
  
  
  // the onShowtime method gets executed after all files were fully loaded and
  // just before the first rendering attempt
  r.onShowtime = function() {

    //
    // The GUI panel
    //
    // (we need to create this during onShowtime(..) since we do not know the
    // volume dimensions before the loading was completed)
    
    
    var gui = new dat.GUI();
    
    // the following configures the gui for interacting with the X.volume
    var volumegui = gui.addFolder('Volume');
    // now we can configure controllers which..
    // .. switch between slicing and volume rendering
   // var vrController = volumegui.add(volume, 'volumeRendering');
    // the min and max color which define the linear gradient mapping
    //var minColorController = volumegui.addColor(v, 'minColor');
    //var maxColorController = volumegui.addColor(v, 'maxColor');
    // .. configure the volume rendering opacity
    var opacityController = volumegui.add(v, 'opacity', 0, 1).listen();
    // .. and the threshold in the min..max range
    var lowerThresholdController = volumegui.add(v, 'lowerThreshold',
        v.min, v.max);
    var upperThresholdController = volumegui.add(v, 'upperThreshold',
        v.min, v.max);
    var lowerWindowController = volumegui.add(v, 'windowLow', v.min,
        v.max);
    var upperWindowController = volumegui.add(v, 'windowHigh', v.min,
        v.max);
    // the indexX,Y,Z are the currently displayed slice indices in the range
    // 0..dimensions-1
    // var sliceXController = volumegui.add(volume, 'indexX', 0,
        // volume.range[0] - 1);
    // var sliceYController = volumegui.add(volume, 'indexY', 0,
        // volume.range[1] - 1);
    // var sliceZController = volumegui.add(volume, 'indexZ', 0,
        // volume.range[2] - 1);
    volumegui.open();
    v.volumeRendering = true;
  };
  
  // adjust the camera position a little bit, just for visualization purposes
  //volume.transform.translateY(-200)
  //r.camera.position = [100,100,250];
  
  
  // showtime! this triggers the loading of the volume and executes
  // r.onShowtime() once done
  r.camera.position = [-600,150,200];
  //v.minColor = [0, 0.06666666666666667, 1];
 //v.maxColor = [0.5843137254901961, 1, 0];
  v.opacity = 0.55;
  v.upperThreshold = 255;
  v.lowerThreshold = 45;
  v.windowLow = 40;
  v.windowHigh = 255;
  r.render();

  
  
 
  
 
  
  // For testing. To get the position of the camera
  // r.interactor.onMouseMove = function() {
		// console.log(volume.transform.matrix);
  // };

};

