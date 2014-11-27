//The initail script that creates the views

$(document).ready(function() {
	var main = new Main();
});


function Main() {

	var s1 = new Slices('s1', 'viewer');
	s1.createHTML();
	s1.setup_renderers();
	s1.xtk_showtime();
	
	var s2 = new Slices('s2', 'viewer');
	s2.createHTML();
	s2.setup_renderers();
	s2.xtk_showtime();

	var s3 = new Slices('s3', 'viewer');
	s3.createHTML();
	s3.setup_renderers();
	s3.xtk_showtime();
	
	var s4 = new Slices('s4', 'viewer');
	s4.createHTML();
	s4.setup_renderers();
	s4.xtk_showtime();
	
	var s5 = new Slices('s5', 'viewer');
	s5.createHTML();
	s5.setup_renderers();
	s5.xtk_showtime();
	
	var s6 = new Slices('s6', 'viewer');
	s6.createHTML();
	s6.setup_renderers();
	s6.xtk_showtime();

	var s7 = new Slices('s7', 'viewer');
	s7.createHTML();
	s7.setup_renderers();
	s7.xtk_showtime();
	
	var s8 = new Slices('s8', 'viewer');
	s8.createHTML();
	s8.setup_renderers();
	s8.xtk_showtime();
	
	this.viewers = [s1, s2, s3, s4, s5, s5, s6, s7, s8];

	//This needs work. There is no longer a global reference to 'volume';
	
	this.show_label_map = function(){
		// Do not implement until merging with James' code
	};
	
	
	this.setVisibleOrientations = function(to_view){
		this.viewers.forEach(function(viewer) {
			console.log(to_view);
    	viewer.set_visible_orientations(to_view);
  });
    
	};
	

	this.buttons = function() {
		// Setup the buttons on the top of the page

		$('#labelmap').change(function() {
			if ($(this).is(':checked')) {
				volume.labelmap._opacity = 0.0;
			} else {
				volume.labelmap._opacity = 1.0;
			}
		}).bind(this);

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
				var ortho_views_to_view = [];
				if ($('#' + slice_list[i]).is(':checked')) {
					ortho_views_to_view.push(slice_list[i]);
					//$('#' + slice_list[i].charAt(0)).show();
					//$('#' + slice_list[i].charAt(0)).width(slice_view_width + '%');
				//} else {
					//$('#' + slice_list[i].charAt(0)).hide();
				}
				// This is needed for XTK to resize the canvas
				window.dispatchEvent(new Event('resize'));
				this.setVisibleOrientations(ortho_views_to_view);
			}

		});
	};
	this.buttons();

}

// Style the control buttons

$(function() {
	$("#labelmap").button();
});

$(function() {
	$("#link_views_toggle").button();
}); 

$('body').bind('beforeunload',function(){
   console.log('bye');
});