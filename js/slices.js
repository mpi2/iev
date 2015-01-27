goog.require('X.renderer2D');




function Slices(id, container, finished_cb, sliceChange) {
	//:param finished_callback function what to call when fisinshed rendering

	this.sliceChange = sliceChange;
	this.finished_callback = finished_cb;
	this.id = id;
	this.view_container = container;
	
	this.Xcontainer = 'X_' + this.id ;
	this.Ycontainer = 'Y_' + this.id ;
	this.Zcontainer = 'Z_' + this.id ;
	
	
	this.setSlices = function(idxX, idxY, idxZ){
		// called from main
		console.log('setting slice');
		this.volume.indexX = idxX;
		this.volume.indexY = idxY;
		this.volume.indexZ = idxZ;
	};
	
	
	this.onWheelScroll = function(){
		$('#' + this.x_slider_id).slider('value', this.volume.indexX);
		$('#' + this.y_slider_id).slider('value', this.volume.indexY);
		$('#' + this.z_slider_id).slider('value', this.volume.indexZ);
		this.sliceChange();
	};
	
	
	this.createHTML = function(){
		// Create the html for this specimen orthogonal views. 
		var viewsContainer = $("#" + this.view_container);
		
		this.x_outer = $("<div class='X slice'>");
		this.y_outer = $("<div class='Y slice'>");
		this.z_outer = $("<div class='Z slice'>");
		
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
		
		this.x_outer.append([this.x_xtk_container, this.x_slider]);
		specimen_view.append(this.x_outer);
		
		this.y_outer.append([this.y_xtk_container, this.y_slider]);
		specimen_view.append(this.y_outer);
		
		this.z_outer.append([this.z_xtk_container, this.z_slider]);
		specimen_view.append(this.z_outer);
	
		viewsContainer.append(specimen_view);	
	};
	
	
	this.setup_renderers = function(container) {

		this.sliceX = new X.renderer2D();
		this.sliceX.container = this.x_xtk_container.get(0);
		this.sliceX.orientation = 'X';
		this.sliceX.onWheelScroll = function(){
			this.onScroll();
		// Lets try and monkey-patch the renderer's camera zoom event'
		var old_onZoom = this.sliceX._camera.onZoom_;
		this.newZoom = function(){
			//call the original function
			old_onZoom();
			console.log('zooming');
		};
		}.bind(this);
		
		this.sliceX.init();

		this.sliceY = new X.renderer2D();
		this.sliceY.container = this.y_xtk_container.get(0);
		this.sliceY.orientation = 'Y';
		this.sliceY.onWheelScroll = function(){
			this.onScroll();
		}.bind(this);
		this.sliceY.init();

		this.sliceZ = new X.renderer2D();
		this.sliceZ.container = this.z_xtk_container.get(0);
		this.sliceZ.orientation = 'Z';
		this.sliceZ.onWheelScroll = function(){
			this.onScroll();
		}.bind(this);
		this.sliceZ.init();

		//
		// THE VOLUME DATA
		//
		// create a X.volume
		this.volume = new X.volume();
		

		//volume.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/260814.nii';
		this.volume.file = 'chrome-extension://' + chromeAppID + '/260814.nrrd';

		this.sliceX.add(this.volume);
		
		// We need to catch events that might change the slice, then pass taht to main
		// Navigation, slider shift, wheel scrolling and zoom
		// Naviagtion has a problem that it fires even when not moving the cross-hairs
		
		this.sliceX.onResize_ = function(){
			console.log('computing end');
		};
		
		
		this.sliceX.render();
				
		this.sliceX.onShowtime = this.xtk_showtime;
		

	};
	

	this.xtk_showtime = function() {
		//
		// the onShowtime method gets executed after all files were fully loaded and
		// just before the first rendering attempt
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

		var x_slider_id = this.x_slider_id;
		var y_slider_id = this.x_slider_id;
		var z_slider_id = this.x_slider_id;
		


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
				this.sliceChange(this);
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
				this.sliceChange(this);
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
				this.sliceChange(this);
			}.bind(this)
		});
		this.finished_callback();

	}.bind(this); 
	
	
	
	this.setOrthogonalViews = function(viewList){
		//ViewList: Hash
		//var slice_view_width = String(100 / total_visible);
		//Calcualte new with of each orthogonal view
		
		
		if (viewList['X']){
			this.x_xtk_container.show();
		}else{
			this.x_xtk_container.hide();
		} 
		
		if (viewList['Y']){
			this.y_xtk_container.show();
		}else{
			this.y_xtk_container.hide();
		} 
		
		if (viewList['Z']){
			this.z_xtk_container.show();
		}else{
			this.z_xtk_container.hide();
		} 
		
		
	}.bind(this);
	
	
	
	this.destroy = function(){
		// Delete the html 
	};
}
