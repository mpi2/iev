goog.require('X.renderer2D');

function Slices(xdiv, ydiv, zdiv) {

	this.Xcontainer = xdiv;
	this.Ycontainer = ydiv;
	this.Zcontainer = zdiv;


this.buttons = function() {
		// Setup the buttons on the top of the page

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
			for (var i = 0; i < slice_list.length; i++) {
				if ($('#' + slice_list[i]).is(':checked')) {
					total_visible++;
				}
			}
			var slice_view_width = String(100 / total_visible);

			// Set the visiblitiy and widths
			for (var i = 0; i < slice_list.length; i++) {
				if ($('#' + slice_list[i]).is(':checked')) {
					$('#' + slice_list[i].charAt(0)).show();
					$('#' + slice_list[i].charAt(0)).width(slice_view_width + '%');
				} else {
					$('#' + slice_list[i].charAt(0)).hide();
				}
				// This is needed for XTK to resize the canvas
				window.dispatchEvent(new Event('resize'));
			}

		});
	};


this.setup_renderers = function(container) {
		sliceX = new X.renderer2D();
		console.log(this);
		sliceX.container = this.Xcontainer;
		sliceX.orientation = 'X';
		sliceX.init();

		// sliceX.interactor.onMouseDown = function() {

		// var _pos = sliceX.interactor.mousePosition; // get mouse position
		// alert(_pos)
		// }

		// .. for Y
		sliceY = new X.renderer2D();
		sliceY.container = this.Ycontainer;
		sliceY.orientation = 'Y';
		sliceY.init();
		// .. and for Z
		sliceZ = new X.renderer2D();
		sliceZ.container = this.Zcontainer;
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
	};
	

this.xtk_showtime = function() {
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
						
						if (!volume) {
							return;
						}
						volume.indexX = ui.value;
						//sliceX.render();
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
						if (!volume) {
							return;
						}
						volume.indexY = ui.value;
						//sliceY.render();

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
						if (!volume) {
							return;
						}
						volume.indexZ = ui.value;
						//sliceZ.render();

					}
				});
			});
		};
	};
	

	// Style the checkboxes for viewing/hiding stuff with jQuery-UI

	$(function() {
		$("#labelmap").button();
	});

	$(function() {
		$("#split_views_toggle").button();
	});
	
}
