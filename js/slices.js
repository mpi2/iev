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
		
	// Hide/show slice views from the checkboxes
	slice_list = ['X_check', 'Y_check', 'Z_check'];

	$('.toggle_slice').change(function() {
		var total_visible = 0;
			//Count the number of checked boxes
			for(var i = 0; i < slice_list.length; i++){
				if ($('#' + slice_list[i]).is(':checked')) {
					total_visible++;
				}
			}
			var slice_view_width = String(100 / total_visible);
			
			// Set the visiblitiy and widths
			for(var i = 0; i < slice_list.length; i++){
				if($('#' + slice_list[i]).is(':checked')) {
					$('#' +  slice_list[i].charAt(0)).show();
					$('#' +  slice_list[i].charAt(0)).width(slice_view_width + '%');
				}else{
					$('#' +  slice_list[i].charAt(0)).hide();
				}
				// This is needed for XTK to resize the canvas
				window.dispatchEvent(new Event('resize'));
			}
			
	});
	
	
  // Create the initial divs to stick the XTK stuff in
  //setup_initial_view();
  //
  // create the 2D renderers
  // .. for the X orientation
  sliceX = new X.renderer2D();
  sliceX.container = 'sliceX';
  sliceX.orientation = 'X';
  sliceX.init();
  
  // sliceX.interactor.onMouseDown = function() {
	// var _pos = sliceX.interactor.mousePosition; // get mouse position
	// alert(_pos)
  // }
  
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

  //volume.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/260814.nii';
  volume.file = 'chrome-extension://fecbmnhapaahlfhcnnnllddbajkmajib/260814.nii';

  //volume.labelmap.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/volumes/seg.nii';
  volume.labelmap.file = 'chrome-extension://fecbmnhapaahlfhcnnnllddbajkmajib/seg.nii';


  //volume.labelmap.colortable.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/genericanatomy.txt';
  volume.labelmap.colortable.file = 'chrome-extension://fecbmnhapaahlfhcnnnllddbajkmajib/genericanatomy.txt';
  
  sliceX.add(volume);

  sliceX.render();
  
  var view = new SliceView();
  view.setContainer('hello');

  //
  // THE GUI
  //
  // the onShowtime method gets executed after all files were fully loaded and
  // just before the first rendering attempt

	sliceX.onShowtime = function() {
	//slider_count = 0;
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
	// slider_count++;
	// console.log(slider_count);
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

// Style the checkboxes for viewing/hiding stuff with jQuery-UI


$(function() {
	$("#labelmap").button();
});

$(function() {
	$("#split_views_toggle").button();
}); 




function setup_initial_view(){
	//load up the default view
	$('#viewer').load('slice_view.html');
}
