goog.require('X.renderer2D');
goog.require('X.interactor2D');



function Slices(volPath, id, container, finished_cb, sliceChange) {
	//:param finished_callback function what to call when fisinshed rendering

	this.sliceChange = sliceChange;
	this.finished_callback = finished_cb;
	this.id = id;
	this.view_container = container;
        this.volPath = volPath + '.nrrd';
        console.log('volume path ' + volPath);
        
	
	var Xcontainer = 'X_' + this.id ;
	var Ycontainer = 'Y_' + this.id ;
	var Zcontainer = 'Z_' + this.id ;
	
	var x_xtk;
	var y_xtk;
	var z_xtk;
	var x_slider;
	var y_slider;
	var z_slider;
        var volume;
	
	
	this.setSlices = function(idxX, idxY, idxZ){
		// called from main
		volume.indexX = idxX;
		volume.indexY = idxY;
		volume.indexZ = idxZ;
	};
	
	
	this.onWheelScroll = function(){
		$('#' + this.x_slider_id).slider('value', volume.indexX);
		$('#' + this.y_slider_id).slider('value', volume.indexY);
		$('#' + this.z_slider_id).slider('value', volume.indexZ);
		this.sliceChange();
	};

	
	this.setDisplayOrientation = function(){
		// h or v : horizontal/vertiacl
		// This mght not be needed. Maybe just some css tweeks
		return	
	};
	
	
	this.createHTML = function(){
		// Create the html for this specimen orthogonal views. 
		
		var viewsContainer = $("#" + this.view_container);
		
		this.x_slider_id = 'slider_x_' + this.id;
		this.y_slider_id = 'slider_y_' + this.id;
		this.z_slider_id = 'slider_z_' + this.id;
		
		x_slider = $("<div id='" + this.x_slider_id + "' class ='sliderX slider'></div>");
		y_slider = $("<div id='" + this.y_slider_id + "' class ='sliderY slider'></div>");
		z_slider = $("<div id='" + this.z_slider_id + "' class ='sliderZ slider'></div>");
		
		x_xtk = $("<div id='X" + Xcontainer +  "' class='sliceX sliceView'></div>");
		x_xtk.append(x_slider);
		y_xtk = $("<div id='Y" + Ycontainer +  "' class='sliceY sliceView'></div>");
		y_xtk.append(y_slider);
		z_xtk = $("<div id='Z" + Zcontainer +  "' class='sliceZ sliceView'></div>");
		z_xtk.append(z_slider);
		
		var specimen_view  = $("<div id='" + this.id + "' class='specimen_view'></div>");
		
		specimen_view.append([x_xtk, this.x_slider]);
		specimen_view.append([y_xtk, this.y_slider]);
		specimen_view.append([z_xtk, this.z_slider]);
	
		viewsContainer.append(specimen_view);	
	};
//	
	
	this.setup_renderers = function(container) {

		this.sliceX = new X.renderer2D();
		this.sliceX.container = x_xtk.get(0);
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
		this.sliceY.container = y_xtk.get(0);
		this.sliceY.orientation = 'Y';
		this.sliceY.onWheelScroll = function(){
			this.onScroll();
		}.bind(this);
		this.sliceY.init();

		this.sliceZ = new X.renderer2D();
		this.sliceZ.container = z_xtk.get(0);
		this.sliceZ.orientation = 'Z';
		this.sliceZ.onWheelScroll = function(){
			this.onScroll();
		}.bind(this);
		this.sliceZ.init();

		//
		// THE VOLUME DATA
		//
		// create a X.volume
		volume = new X.volume();
		

		//volume.file = 'http://labs.publicdevelopment1.har.mrc.ac.uk/neil/xtk_viewer/volumes/260814.nii';
		volume.file = this.volPath;

		this.sliceX.add(volume);
		
		// We need to catch events that might change the slice, then pass taht to main
		// Navigation, slider shift, wheel scrolling and zoom
		// Naviagtion has a problem that it fires even when not moving the cross-hairs
		
		this.sliceX.onResize_ = function(){
			console.log('computing end');
		};
		
		
		this.sliceX.render();
				
		this.sliceX.onShowtime = this.xtk_showtime;
		

	};
        
        
        this.invertColour = function(checked){
    
            if (!volume) return;
            console.log(this);

	    if (checked) {
            volume.maxColor = [0, 0, 0];
	        volume.minColor = [1, 1, 1];
	        $(".sliceView").css("background-color", "#FFFFFF");

            volume.indexX++;
	        volume.indexY++;
	        volume.indexZ++;

	    } else {
         
            volume.maxColor = [1, 1, 1];
	        volume.minColor = [0, 0, 0];
	        $(".sliceView").css("background-color", "#000000");

                // Bodge to get the colours to update
	        volume.indexX--;
	        volume.indexY--;
	        volume.indexZ--;

	    }
        };
        
	

	this.xtk_showtime = function() {
		//
		// the onShowtime method gets executed after all files were fully loaded and
		// just before the first rendering attempt
		this.sliceY.add(volume);
		this.sliceY.render();
		this.sliceZ.add(volume);
		this.sliceZ.render();

		var dims = volume.dimensions;

		// It appears that dimensoins are in yxz order. At least with nii loading
		volume.indexX = Math.floor((dims[0] - 1) / 2);
		volume.indexY = Math.floor((dims[1] - 1) / 2);
		volume.indexZ = Math.floor((dims[2] - 1) / 2);
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
			value : volume.indexX,
			slide : function(event, ui) {
				if (!volume) {
					return;
				}
				volume.indexX = ui.value;
				this.sliceChange(this);
			}.bind(this)
		});
		

		$("#" + this.y_slider_id).slider({
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
				this.sliceChange(this);
			}.bind(this)
		});


		$("#" + this.z_slider_id).slider({
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
				this.sliceChange(this);
			}.bind(this)
		});
		this.finished_callback();

	}.bind(this); 
	
	
	
	this.setOrthogonalViews = function(viewList, count){
		//ViewList: Hash
		//var slice_view_width = String(100 / total_visible);
		//Calcualte new with of each orthogonal view
		
		var slice_view_width = String(100 / count);
		
		if (viewList['X']){
			x_xtk.show();
			// this.y_outer.width(slice_view_width + '%');
			// this.z_outer.width(slice_view_width + '%');
			
		}else{
			x_xtk.hide();
		} 
		
		if (viewList['Y']){
			y_xtk.show();
			//this.y_outer.width(slice_view_width + '%');
		}else{
			y_xtk.hide();
		} 
		
		if (viewList['Z']){
			z_xtk.show();
			//this.z_outer.width(slice_view_width + '%');
		}else{
			z_xtk.hide();
		} 
		
		
	}.bind(this);
	
	
	
	this.destroy = function(){
		// Delete the html 
	};
}