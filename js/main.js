//The initail script that creates the views

$(document ).ready(function(){
	buttons();
	
	var top_slices = new Slices('top_test', 'viewer');
	top_slices.createHTML();
	top_slices.setup_renderers();
	top_slices.xtk_showtime();
	
	var bottom_slices = new Slices('bottom_test', 'viewer');
	bottom_slices.createHTML();
	bottom_slices.setup_renderers();
	bottom_slices.xtk_showtime();


});

//This needs work. There is no longer a global reference to 'volume';

function buttons() {
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


// Style the control buttons

	$(function() {
		$("#labelmap").button();
	});

	$(function() {
		$("#link_views_toggle").button();
	});