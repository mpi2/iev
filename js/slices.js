goog.require('X.renderer2D');

//chromeAppID = 'hhehodfmcgpecmneccjekjlkmejgakml'; //Home
chromeAppID = 'fecbmnhapaahlfhcnnnllddbajkmajib'; //Work


function Slices(id, container) {

	this.id = id;
	this.view_container = container;
	
	this.Xcontainer = 'X_' + this.id ;
	this.Ycontainer = 'Y_' + this.id ;
	this.Zcontainer = 'Z_' + this.id ;
	
	
	this.onScroll = function(){
		$('#' + this.x_slider_id).slider('value', this.volume.indexX);
		$('#' + this.y_slider_id).slider('value', this.volume.indexY);
		$('#' + this.z_slider_id).slider('value', this.volume.indexZ);
	};
	
	
	this.createHTML = function(){
		// Create the html for this specimen orthogonal views. 
		var viewsContainer = $("#" + this.view_container);
		
		var x_outer = $("<div class='X slice'>");
		var y_outer = $("<div class='Y slice'>");
		var z_outer = $("<div class='Z slice'>");
		
		this.x_slider_id = 'slider_x_' + this.id;
		this.y_slider_id = 'slider_y_' + this.id;
		this.z_slider_id = 'slider_z_' + this.id;
		
		this.x_slider = $("<div id='" + this.x_slider_id + "' class ='sliderX slider'></div>");
		this.y_slider = $("<div id='" + this.y_slider_id + "' class ='sliderY slider'></div>");
		this.z_slider = $("<div id='" + this.z_slider_id + "' class ='sliderZ slider'></div>");
		
		this.x_xtk_container = $("<div id='X" + this.Xcontainer +  "' class='sliceX sliceView'></div>");
		this.y_xtk_container = $("<div id='Y" + this.Ycontainer +  "' class='sliceX sliceView'></div>");
		this.z_xtk_container = $("<div id='Z" + this.Zcontainer +  "' class='sliceX sliceView'></div>");
		
		var specimen_view  = $("<div id='" + this.id + "' class='specimen_view'></div>");
		
		x_outer.append([this.x_xtk_container, this.x_slider]);
		specimen_view.append(x_outer);
		
		y_outer.append([this.y_xtk_container, this.y_slider]);
		specimen_view.append(y_outer);
		
		z_outer.append([this.z_xtk_container, this.z_slider]);
		specimen_view.append(z_outer);
	
		viewsContainer.append(specimen_view);	
	};
	
	
	this.setup_renderers = function(container) {

		this.sliceX = new X.renderer2D();
		this.sliceX.container = this.x_xtk_container.get(0);
		this.sliceX.orientation = 'X';
		this.sliceX.onScroll = function(){
			this.onScroll();
		}.bind(this);
		
		this.sliceX.init();

		this.sliceY = new X.renderer2D();
		this.sliceY.container = this.y_xtk_container.get(0);
		this.sliceY.orientation = 'Y';
		this.sliceY.onScroll = function(){
			this.onScroll();
		}.bind(this);
		this.sliceY.init();

		this.sliceZ = new X.renderer2D();
		this.sliceZ.container = this.z_xtk_container.get(0);
		this.sliceZ.orientation = 'Z';
		this.sliceZ.onScroll = function(){
			this.onScroll();
		}.bind(this);
		this.sliceZ.init();

		//
		// THE VOLUME DATA
		//
		// create a X.volume
		this.volume = new X.volume();
		

		//volume.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/260814.nii';
		this.volume.file = 'chrome-extension://' + chromeAppID + '/260814.nii';

		//volume.labelmap.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/volumes/seg.nii';
		this.volume.labelmap.file = 'chrome-extension://' + chromeAppID + '/seg.nii';

		//volume.labelmap.colortable.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/genericanatomy.txt';
		this.volume.labelmap.colortable.file = 'chrome-extension://' + chromeAppID + '/genericanatomy.txt';

		this.sliceX.add(this. volume);
		
		this.sliceX.render();
				
		this.sliceX.onShowtime = this.xtk_showtime;

	};
	

	this.xtk_showtime = function() {
		//
		// the onShowtime method gets executed after all files were fully loaded and
		// just before the first rendering attempt
		//console.log(this.sliceY.add);
		this.sliceY.add(this.volume);
		this.sliceY.render();
		this.sliceZ.add(this.volume);
		this.sliceZ.render();

		var dims = this.volume.dimensions;

		// It appears that dimensoins are in yxz order. At least with nii loading
		this.volume.indexX = Math.floor((dims[0] - 1) / 2);
		this.volume.indexY = Math.floor((dims[1] - 1) / 2);
		this.volume.indexZ = Math.floor((dims[2] - 1) / 2);
		// Setup the sliders within 'onShowtime' as we need the volume dimensions for the ranges
		// //////// X slider ////////

		// It doesn't seem possible to pass to this.x.. into the jQuery selector so make local references
		var x_slider_id = this.x_slider_id;
		var y_slider_id = this.x_slider_id;
		var z_slider_id = this.x_slider_id;
		var volume = this.volume;


		// make the sliders
		$("#" + this.x_slider_id).slider({
			"disabled" : false,
			range : "min",
			min : 0,
			max : dims[0] - 1,
			value : this.volume.indexX,
			slide : function(event, ui) {
				if (!this.volume) {
					return;
				}
				this.volume.indexX = ui.value;
			}.bind(this)
		});
		

		$("#" + this.y_slider_id).slider({
			"disabled" : false,
			range : "min",
			min : 0,
			max : dims[1] - 1,
			value : this.volume.indexY,
			slide : function(event, ui) {
				if (!this.volume) {
					return;
				}
				this.volume.indexY = ui.value;
			}.bind(this)
		});


		$("#" + this.z_slider_id).slider({
			"disabled" : false,
			range : "min",
			min : 0,
			max : dims[2] - 1,
			value : this.volume.indexZ,
			slide : function(event, ui) {
				if (!this.volume) {
					return;
				}
				this.volume.indexZ = ui.value;
			}.bind(this)
		});

	}.bind(this); 
}
