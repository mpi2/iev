goog.require('X.labelmap');

//The initail script that creates the views

//TODO: sync zooming
//
chromeAppID = 'oeblccjojhbilkabifkljjgjoncmeaoj';
//Work
//chromeAppID = 'hhehodfmcgpecmneccjekjlkmejgakml'; //Home
//chromeAppID = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes';

$(document).ready(function() {
	var main = new Main();
});

function Main() {

	this.viewsLinked = false;
	this.number_to_load = 2;
	this.views = [];

	this.sliceChange = function(scrolled) {
		if (!this.viewsLinked)
			return;
		// on scrolling, scroll the other views as well
		for (var i = 0; i < this.views.length; i++) {
			if (scrolled.id == this.views[i].id) {
				continue;
			} else {
				this.views[i].setSlices(scrolled.volume.indexX, scrolled.volume.indexY, scrolled.volume.indexZ);
			}
		}
	}.bind(this);
	

	this.loadViewers = function() {

		if (this.number_to_load < 1) {
			return;
		}
		this.number_to_load--;
		var view = new Slices('s' + this.number_to_load, 'viewer', this.loadViewers, this.sliceChange);
		view.createHTML();
		view.setup_renderers();
		this.views.push(view);

	}.bind(this);
	

	this.loadViewers();

	this.setUpLinkViews = function() {
		//Link the views so that sliding/scrolling/zooming affect all
		

		$('#link_views_toggle').change( function(e) {
			this.viewsLinked = e.currentTarget.checked;
		}.bind(this));
	};

	this.setupZoomSlider = function() {
		$("#level_slider").slider({
			"disabled" : false,
			range : "min",
			min : 100,
			max : 1000,
			value : 400,
			slide : function(event, ui) {

			}.bind(this)
		});
	};

	this.ortho = function(){
		console.log(ths);	
	};
	
	
	
	// Hide/show slice views from the checkboxes
	
	$('.toggle_slice').change(function() {
		var slice_list = ['X_check', 'Y_check', 'Z_check'];	//IDs of the checkboxes
		var total_visible = 0;
		var toView = {}
		var count = 0;
		
		//Count the number of checked boxes so we can work out a new width
		for (var i = 0; i < slice_list.length; i++) {
			if ($('#' + slice_list[i]).is(':checked')) {
				toView[slice_list[i].charAt(0)] = true;
				count++;
			}
			else{
				toView[slice_list[i].charAt(0)] = false;
			}
		}
		for (var i = 0; i < this.views.length; i++) {
			this.views[i].setOrthogonalViews(toView, count);
		}

	}.bind(this));
	
	
	this.setUpLinkViews();
	this.setupZoomSlider();
}// Main

// Style the control buttons

$(function() {
	$("#link_views_toggle").button();
});

$('body').bind('beforeunload', function() {
	console.log('bye');
});
