//The initail script that creates the views


//TODO: sync zooming
//  



$(document).ready(function() {
	var main = new Main();
});

function Main() {
	
	this.viewsLinked = false;
	this.load_queue = 2; // How manu views to load
	this.views = [];
	
	this.sliceChange = function(scrolled){
		if (!this.viewsLinked) return;
		for(var i = 0; i < this.views.length; i++){
			if(scrolled.id == this.views[i].id) {
				continue;
			}else{
				this.views[i].setSlices(scrolled.volume.indexX, scrolled.volume.indexY, scrolled.volume.indexZ);
			}
			}
	}.bind(this);
	

	this.loadViewers = function(){
		
		if (this.load_queue < 1){
			return;
		}
		this.load_queue--;
		var view = new Slices('s' + this.load_queue, 'viewer', this.loadViewers, this.sliceChange);
		view.createHTML();
		view.setup_renderers();
		this.views.push(view);
		
	}.bind(this);
	
	
	this.loadViewers();
	
	


	//This needs work. There is no longer a global reference to 'volume';

	this.show_label_map = function() {
		// Do not implement until merging with James' code
	};

	this.setVisibleOrientations = function(to_view) {
		this.viewers.forEach(function(viewer) {
			console.log(to_view);
			viewer.set_visible_orientations(to_view);
		});

	};
	
	
	this.setUpLinkViews = function(){
		//Link the views so that sliding/scrolling/zooming affect all
		// other views. Maybe on slider release, to speed things up 
			
		$('#link_views_toggle').change(function(e) {
			this.viewsLinked = e.currentTarget.checked;
		}.bind(this));
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
			var ortho_views_to_view = [];
			for (var i = 0; i < slice_list.length; i++) {

				if ($('#' + slice_list[i]).is(':checked')) {
					ortho_views_to_view.push(slice_list[i]);
					//$('#' + slice_list[i].charAt(0)).show();
					//$('#' + slice_list[i].charAt(0)).width(slice_view_width + '%');
					//} else {
					//$('#' + slice_list[i].charAt(0)).hide();
				}
				// This is needed for XTK to resize the canvas

				//window.dispatchEvent(new Event('resize'));

			}
			console.log(ortho_views_to_view);
			//this.setVisibleOrientations(ortho_views_to_view);  //TODO: not working

		}).bind(this);
	};
	this.buttons();
	this.setUpLinkViews();
}// Main

// Style the control buttons

$(function() {
	$("#labelmap").button();
});

$(function() {
	$("#link_views_toggle").button();
});

$('body').bind('beforeunload', function() {
	console.log('bye');
}); 