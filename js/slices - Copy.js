goog.require('X.renderer2D');

window.onload = function() {

// 
// Check boxes for viewing/hiding stuff		
//


	//Labelmap
	$('#labelmap').change(function() {
		if ($(this).is(':checked')) {
			volume.labelmap._opacity = 0.0;
		} else {
			volume.labelmap._opacity = 1.0;
		}
	}); 
	
	
	//Single view
	$('single_view').change(function() {
		alert('single_view');
	}); 
	

	

  
  //
  // create the 2D renderers
  // .. for the X orientation
  sliceX = new X.renderer2D();
  sliceX.container = 'sliceX';
  sliceX.orientation = 'X';
  sliceX.init();
  
 sliceX.interactor.onMouseDown = function(event) {
 	
	var _sliceWidth = sliceX._sliceWidth;
	var _sliceHeight = sliceX._sliceHeight;
	
	var _labelmapData = sliceX._labelFrameBufferContext.getImageData(0, 0, _sliceWidth, _sliceHeight);
	var _labelPixels = _labelmapData.data;
	
	
	
  }
  
  // .. for Y
  var sliceY = new X.renderer2D();
  sliceY.container = 'sliceY';
  sliceY.orientation = 'Y';
  sliceY.init();
  // .. and for Z
  sliceZ = new X.renderer2D();
  sliceZ.container = 'sliceZ';
  sliceZ.orientation = 'Z';
  sliceZ.init();
  

  

  //
  // THE VOLUME DATA
  //
  // create a X.volume
  volume = new X.volume();
  // .. and attach the single-file dicom in .NRRD format
  // this works with gzip/gz/raw encoded NRRD files but XTK also supports other
  // formats like MGH/MGZ
  volume.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/260814.nii';
  // we also attach a label map to show segmentations on a slice-by-slice base
  volume.labelmap.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/seg.nii';

  // .. and use a color table to map the label map values to colors
  volume.labelmap.colortable.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/new_anatomy.txt';
  
  // add the volume in the main renderer
  // we choose the sliceX here, since this should work also on
  // non-webGL-friendly devices like Safari on iOS
  sliceX.add(volume);
  
  // start the loading/rendering
  sliceX.render();
  

  //
  // THE GUI
  //
  // the onShowtime method gets executed after all files were fully loaded and
  // just before the first rendering attempt
  sliceX.onShowtime = function() {

    //
    // add the volume to the other 3 renderers
    //
    sliceY.add(volume);
    sliceY.render();
    sliceZ.add(volume);
    sliceZ.render();
	
	var dims = volume.dimensions;
	
		
	volume.indexX = Math.floor((dims[0] - 1) / 2);
	volume.indexY = Math.floor((dims[1] - 1) / 2);
	volume.indexZ = Math.floor((dims[2] - 1) / 2);
	// Setup the sliders within 'onShowtime' as we need the volume dimensions for the ranges
	// //////// X slider ////////
	
	$(function() {
		$("#sliderX").slider({
			"disabled" : false,
			range : "min",
			min : 0,
			max : dims[0] - 1,
			value : volume.indexX,
			slide : function(event, ui) {
				on_sliderX_changed(ui.value, sliceX);

			}
		});
	});
	
	
	// //////// Y slider ////////
	$(function() {
		$("#sliderY").slider({
			"disabled" : false,
			range : "min",
			min : 0,
			max : dims[1] - 1,
			value : volume.indexY,
			slide : function(event, ui) {
				on_sliderY_changed(ui.value, sliceY);

			}
		});
			// Hide/show axial view
	$('#axial').change(function(){
		if ($(this).is(':checked')){
			$('#Z').hide();
		}
		else{
			$('#Z').show();
		}
	});	
	});
	

	// //////// Z slider ////////
	 $(function() {
		 $("#sliderZ").slider({
		 "disabled" : false,
		 range : "min",
		 min : 0,
		 max : dims[2] - 1,
		 value : volume.indexZ,
		 slide : function(event, ui) {
			on_sliderZ_changed(ui.value, sliceZ);

			}
		 });
	 });
    
  };
  
};

function on_sliderX_changed(value, sliceX) {
	if (!volume) {
		return;
	}
	volume.indexX = value;
	sliceX.render();
}


function on_sliderY_changed(value, sliceY) {
	if (!volume) {
		return;
	}
	volume.indexY = value;
	sliceY.render();
}


function on_sliderZ_changed(value, sliceZ) {
	if (!volume) {
		return;
	}
	volume.indexZ = value;

	sliceZ.render();
}

// Stle the checkboxes for viewing/hiding stuff

	$(function() {
		$("#labelmap").button();
	});

		$(function() {
		$("#single_view").button();
	});


