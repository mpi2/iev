goog.provide('iev.specimen2D');
goog.require('iev.specimenPanel');
//goog.require('iev.templates')
//goog.require('X.renderer2D');
//goog.require('X.interactor2D');


/**
 * Create a specimen view that displays three orthogonal views
 *
 * @constructor
 */

iev.specimen2D = function(volumeData, id, container, 
             queryColonyId, xCb, yCb, zCb, config, readyCB, localStorage){

    this.localStorage = localStorage;
    this.xtkLoadError = false;

    /* @type {string} */
    this.queryColonyId = queryColonyId;
    this.config = config;
    
   // The callbacks to embryoviewer for when slice indices change
    this.xCb = xCb;
    this.yCb = yCb;
    this.zCb = zCb;
    
    /** @type {string} */
    this.id = id;
    /** @type {string} */
    this.viewContainer = container;
    this.volumeData = volumeData;
    this.readyCB = readyCB;
    this.$xContainer;
    this.$yContainer;
    this.$zContainer;
    this.$xWrap;
    this.$yWrap;
    this.$zWrap;
    this.$xSlider;
    this.$ySlider;
    this.$zSlider;
    
    this.xRen;
    this.yRen;
    this.zRen;
    this.volume;
    this.analysisVolume;
    this.hasLabelmap = false;
    this.currentLabelmap = 'ov' in config ? config['ov'] : 'jacobian';
    this.scaleBarSize;
    this.lowPower = false;
    this.windowLevel = 'windowLevel_' + id;
    this.overlayControl = 'overlayControl_' + id;
    this.vselector = 'volumeSelector_' + id;
    this.inverted = false;
    this.xOffset = 0;
    this.yOffset = 0;
    this.zOffset = 0;
    this.ready = false;
    this.progressSpinner;
    
    /** @const */ 
    this.spinnerOpts = {
        lines: 8 // The number of lines to draw
        , length: 6 // The length of each line
        , width: 6 // The line thickness
        , radius: 8 // The radius of the inner circle
        , scale: 1 // Scales overall size of the spinner
        , corners: 1 // Corner roundness (0..1)
        , color: '#ef7b0b' // #rgb or #rrggbb or array of colors
        , opacity: 0.2 // Opacity of the lines
        , rotate: 0 // The rotation offset
        , direction: 1 // 1: clockwise, -1: counterclockwise
        , speed: 1 // Rounds per second
        , trail: 50 // Afterglow percentage
        , fps: 10 // Frames per second when using setTimeout() as a fallback for CSS
        , zIndex: 2e9 // The z-index (defaults to 2000000000)
        , className: 'spinner' // The CSS class to assign to the spinner
        , top: '20px' // Top position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false // Whether to use hardware acceleration
        , position: 'relative' // Element positioning
    };

    // Select first volume in the list
    this.currentVolume = volumeData[Object.keys(volumeData)[0]];
    this.bookmarkHasVolume = false;
    
    // Retrieve first volume
    for (var key in volumeData) {
        var vol = volumeData[key];
        
        if ('n' in config && vol['animalName'] === config['n']) {
            this.currentVolume = vol;
            this.bookmarkHasVolume = true;
            break;
        }

        if (this.currentLabelmap in vol) {       
            this.analysisVolume = key;
        }
                     
    }  
    
    // Create a control panel, and bind this (specimen2D)
    this.controlPanel = new iev.specimenPanel(id, this.replaceVolume.bind(this));
    
    // The html source for the Handelbar template
//    var progressSource   = $("#progress_template").html();
    this.progressTemplate = Handlebars.templates['progress_template'];

    this.createHTML();
    this.controlPanel.updateVolumeSelector(this.currentVolume, this.volumeData);        
    this.jQuerySelectors();     
    this.setupOverlayControls();
    this.setupRenderers();
    this.drawScaleBar();        
};

iev.specimen2D.prototype.showAnalysisData = function() {
    if (this.analysisVolume && this.currentVolume['volume_url'] !== this.analysisVolume) {
        $('#' + this.vselector).val(this.analysisVolume);
        $('#' + this.vselector).iconselectmenu("refresh");     
        this.replaceVolume(this.analysisVolume);
    }
};

iev.specimen2D.prototype.setLabelmap = function(overlay_type) {
    if (overlay_type !== "none") {
        
        var labelmap = this.currentVolume[overlay_type];
        var cmap = labelmap.slice(0, -5) + '.txt';
        
        this.volume.labelmap.file = labelmap;
        this.volume.labelmap.colortable.file = cmap;

        if (overlay_type === "labelmap") {
            this.volume.labelmap.opacity = 0.5;
        }
                
    }
};

iev.specimen2D.prototype.getLabelmap = function() {
    if (this.hasLabelmap) {
        return this.currentLabelmap;
    } else {
        return "none";
    }
};

iev.specimen2D.prototype.setupOverlayControls = function() {

    // Set the checked button
    var button = $('input:radio', '#' + this.overlayControl).filter('[value=' + this.currentLabelmap + ']'); // '#' + this.overlayControl, 
    button.prop('checked', true);
        
    // Set up overlay controls
    $('#' + this.overlayControl).buttonset();
    
    // On click
    $('#' + this.overlayControl).click(function(e) {
        var overlay_type = $('input[type=radio]:checked', e.currentTarget).prop("value");
        if (this.currentLabelmap !== overlay_type) {  // check if anything changed
            this.currentLabelmap = overlay_type;        
            this.replaceVolume(this.currentVolume['volume_url']);
        }
    }.bind(this));
};

iev.specimen2D.prototype.showHideOverlayControls = function() {
    
    if (this.hasLabelmap) {
        this.$overlayControl.show();
    } else {
        this.$overlayControl.hide();
    }

};
        
        
iev.specimen2D.prototype.updateData = function (volumes){
    /*
     * Change the current stage/modality/centre being viewed
     * 
     */
    
    this.volumeData = volumes;
    this.replaceVolume(this.volumeData[Object.keys(this.volumeData)[0]]['volume_url']);
    this.controlPanel.updateVolumeSelector(this.currentVolume, this.volumeData);
};
        
        
iev.specimen2D.prototype.update = function (){
    this.invertColour(this.inverted);
    this.drawScaleBar();
    this.controlPanel.showMetadata(this.currentVolume);
    this.controlPanel.setVisible(true);
    this.setBookmarkContrast();
};
               
iev.specimen2D.prototype.setBookmarkContrast = function() {

    // Set lower contrast level
    var lower = parseInt(this.volume.windowLow);
    if ('l' in this.config) {
        lower = Math.max(parseInt(this.config['l']), parseInt(this.volume.windowLow));                
    }

    // Set upper this.contrast level
    var upper = parseInt(this.volume.windowHigh);
    if ('u' in this.config) {
        upper = Math.min(parseInt(this.config['u']), parseInt(this.volume.windowHigh));                             
    }

    // Set this.volume modifed
    this.volume.windowLow = lower;
    this.volume.windowHigh = upper;
    this.volume.modified(false);

    // Set slider values
    this.controlPanel.$windowLevel.slider("option", "values",
                        [this.volume.windowLow, this.volume.windowHigh]);            

};


iev.specimen2D.prototype.reset = function(){
    /*
     * Resets:
     *  Renderer: undoes the zoom
     *  Set the slice index to the mid-slice
     *  contrast
     *  The scale bar are put back in original place, and redrawn
     *  @method reset
     */
    this.xRen.resetViewAndRender();
    this.yRen.resetViewAndRender();
    this.zRen.resetViewAndRender();
    //Reset the slider position
    var dims = this.volume.dimensions;
    this.volume.indexX = Math.floor((dims[0] - 1) / 2);
    this.volume.indexY = Math.floor((dims[1] - 1) / 2);
    this.volume.indexZ = Math.floor((dims[2] - 1) / 2);
    this.$xSlider.slider("value", this.volume.indexX);
    this.$ySlider.slider("value", this.volume.indexY);
    this.$zSlider.slider("value", this.volume.indexZ);
    
    //reset the window level
    this.controlPanel.$windowLevel.slider("option", "values", [this.volume.windowLow, this.volume.windowHigh]);

    // Put scale bars back in place            
    $('.scale_outer').css(
       {
        'height': '100%',
        'bottom': '30px',
        'width': '20px',
        'position': 'relative',
        'left': '20px',
        'z-index': 900
        });

    this.update();
};


iev.specimen2D.prototype.createHTML = function() {
    /**
     * Creates the html needed for the specimen view to live in.
     * Uses handlebar.js to generate from templates
     * 
     * @method createHtml
     * 
     */
    
    var $viewsContainer = $("#" + this.viewContainer);

    if (this.objSize(this.volumeData) < 1 && this.queryColonyId !==  null){
            return;
    }
    
    var data = {
        id: this.id,
        msg: "Images loading"
    };

//    var source   = $("#specimen_view_template").html();
    var template = Handlebars.templates['specimen_view_template'];
    var $specimenView = $(template(data));
    
    // Append controlPanel
    $specimenView.append(this.controlPanel.create());
    
    // This defines the order of the orthogonal views
    $specimenView.append(this.createSliceView('X'));
    $specimenView.append(this.createSliceView('Y'));
    $specimenView.append(this.createSliceView('Z'));
    
    // Create progress div
    var $progress = $(this.progressTemplate(data));
    $specimenView.append($progress);
    this.spinner = new Spinner(this.spinnerOpts).spin();
    $progress.find('.ievLoadingMsg').append(this.spinner.el);

    // Add view to container and update control panel
    $viewsContainer.append($specimenView);    

};
        
            
iev.specimen2D.prototype.progressStop = function(){
    this.spinner.stop();
     $("#progressMsg").empty();
};
        
        
iev.specimen2D.prototype.createSliceView = function(orient){
    /**
     * Create the HTML for the elements containing the slice view
     * @param {String} orient Orientation (X, Y or Z)
     */

    var viewSliceClass = 'slice' + orient;

    var data = {
        sliceWrapId: 'sliceWrap_' + orient + '_' + this.id,
        sliceContainerID: orient + '_' + this.id,
        viewSliceClasss: viewSliceClass,
        sliderId: 'slider_' + orient + '_'+ this.id,
        sliderClass: 'slider' + orient,
        orientation: orient,
        id: this.id,
        scaleId: 'scale_' + orient + this.id,
        scaleTextId: 'scaletext_' + orient + this.id

    };

//    var source = $("#slice_view_template").html();
    var template = Handlebars.templates['slice_view_template'];
    return template(data);
};
        
           
        
iev.specimen2D.prototype.jQuerySelectors = function(){
    /**
     * Get Jquery handles on elements that need to be accessed multiple times
     * Should speed things up not having to query the DOM all the time
     * 
     * @method jQuerySelectors
     */
    this.$xContainer =  $('#X_' + this.id);
    this.$yContainer =  $('#Y_' + this.id);
    this.$zContainer =  $('#Z_' + this.id);
    this.$xSlider = $('#slider_X_'+ this.id);
    this.$ySlider = $('#slider_Y_'+ this.id);
    this.$zSlider = $('#slider_Z_'+ this.id);
    this.$xWrap = $('#sliceWrap_X_' + this.id);
    this.$yWrap = $('#sliceWrap_Y_' + this.id);
    this.$zWrap = $('#sliceWrap_Z_' + this.id);
    this.$windowLevel = $('#' + this.windowLevel);
    this.$overlayControl = $('#' + this.overlayControl);
};
          
iev.specimen2D.prototype.zoomIn = function(){
   this.xRen.camera.zoomIn(false);
   this.yRen.camera.zoomIn(false);
   this.zRen.camera.zoomIn(false);
   this.drawScaleBar();
};

iev.specimen2D.prototype.zoomOut = function(){
    //Prevent over out-zooming
    if (this.xRen.normalizedScale < 1.0 || this.yRen.normalizedScale < 1.0 || this.zRen.normalizedScale < 1.0){
       return false;
    }            
    this.xRen.camera.zoomOut(false);
    this.yRen.camera.zoomOut(false);
    this.zRen.camera.zoomOut(false);
    this.drawScaleBar();        
    return true;
};


iev.specimen2D.prototype.drawScaleBar = function() {   
    // After resizing the window or doing a zoomIn or zoomOut, we need to wait for renderer2D to call
    // render_(). Otherwose normalizScale will not have been set
    
     setTimeout(function () {
        this.drawScale(this.yRen);
        this.drawScale(this.zRen);
        this.drawScale(this.xRen);
    }.bind(this), 20);  
};
        
            
iev.specimen2D.prototype.drawScale = function(ren){

	var $scaleouter =  $('#scale_outer' + this.id + ren.orientation);
	var $scaleId = $('#scale_' + ren.orientation + this.id);
	var $scaletext = $('#scaletext_' + ren.orientation + this.id);
    

	if (this.currentVolume["rescaledPixelsize"] === null ||  this.currentVolume["rescaledPixelsize"] === 0){
		$scaleouter.hide();
		return;
	}
	$scaleouter.show();

	var pixel_size = this.currentVolume["rescaledPixelsize"];
	var bar_size_pixels = (this.scaleBarSize / pixel_size) * ren.normalizedScale;

	var outer_height = $scaleouter.height();
	var top = (outer_height - bar_size_pixels) / 2;
   
	$scaleId.css(
	   {'height': bar_size_pixels, 
		'width': '2px',
		'position': 'absolute',
		'top': top
	});
	$scaletext.css(
		{
		'position': 'absolute',
		'top': top - 20,
		'font-size': '10px'
	});
};         
        
              
iev.specimen2D.prototype.rescale = function(scale){
 
    this.scaleBarSize = scale;
    this.drawScaleBar();
};
        
         
iev.specimen2D.prototype.getVolume = function(){

    return this.volume;
};

iev.specimen2D.prototype.destroyRenderer = function() {
    
    if (typeof (this.xRen) !== 'undefined') {
        this.xRen.destroy();
        delete this.xRen;
    }
    if (typeof (this.yRen) !== 'undefined') {
        this.yRen.destroy();
        delete this.yRen;
    }
    if (typeof (this.zRen) !== 'undefined') {
        this.zRen.destroy();
        delete this.zRen;
    }
    if (typeof (this.volume) !== 'undefined') {
        this.volume.destroy();
        delete this.volume;
    }
    
};
        
iev.specimen2D.prototype.replaceVolume = function(volumePath) {
    /**
     * Replace current specimen volume with another.
     * Destroys current object (not sure is necessary) add new path and call setupoRenderers
     * 
     * @method replaceVolume
     * @param {String} VolumePath path to new volume to load into viewer
     */
    
    var data = {
        id: this.id,
        msg: "Images loading"
    };
    
    this.controlPanel.setVisible(false);
    var $specimenView = $('#' + this.id);
    var $progress = $(this.progressTemplate(data));

    $specimenView.append($progress);
    this.spinner = new Spinner(this.spinnerOpts).spin();
    $progress.find('.ievLoadingMsg').append(this.spinner.el);
    
    // Call separate method to destroy renderers
    this.destroyRenderer();

    this.currentVolume = this.volumeData[volumePath];
    this.setupRenderers();
    
};
       

iev.specimen2D.prototype.setupRenderers = function() {
    /**
     * Call the XTK functions that are required to get our volume rendered in 2D
     * 
     * @method setupRenderers
     */
    
    
    //testing: Get the filedata to attach to our volume
    // Check wheter the URL is already saved in the indexedDB if it is retieve it
    // If not fetch it and write to indexedDB
    
    
    
    this.ready = false;

    if (this.objSize(this.volumeData) < 1) return;

    this.xRen = new X.renderer2D();
    this.xRen.config.PROGRESSBAR_ENABLED = false;

    /*
     * Sagittal scaling bug fix.
     * also see fix in X.renderer2D.render_
     */ 
    this.xRen.firstRender = true;

    this.xRen.afterRender = function(){   
        if (this.xRen.firstRender){
           this.xRen.resetViewAndRender();
           this.xRen.firstRender = false;
           this.xtk_showtime();
        }                           
    }.bind(this);
    
    // Set flag if overlay exists (checks by jacobian)      
    this.hasLabelmap = 'jacobian' in this.currentVolume;

    this.xRen.onShowtime = function(){   
        // we have to wait before volumes have fully loaded before we
        // can extract intesity information                
        this.controlPanel.setContrastSlider(this.volume);
        this.showHideOverlayControls();
        this.setReady();                
    }.bind(this);

    this.xRen.container = this.$xContainer.get(0);
    this.xRen.orientation = 'X';
    this.xRen.init();

    this.rightMouseDown = false;
    this.catchMouseDown(this.xRen);
    this.catchMouseUp(this.xRen);

    this.yRen = new X.renderer2D();
    this.yRen.config.PROGRESSBAR_ENABLED = false;
    this.yRen.container = this.$yContainer.get(0);
    this.yRen.orientation = 'Y';
    this.yRen.init();
    this.catchMouseDown(this.yRen);
    this.catchMouseUp(this.yRen);

    this.zRen = new X.renderer2D();
    this.zRen.config.PROGRESSBAR_ENABLED = false;
    this.zRen.container = this.$zContainer.get(0);
    this.zRen.orientation = 'Z';
    this.zRen.init();
    this.catchMouseDown(this.zRen);
    this.catchMouseUp(this.zRen);

    // create a X.volume
    this.volume = new X.volume();

    //Hack: Need to add dummy filename if we are setting filedata directly
    this.volume.file = 'dummy.nrrd'
    this.localStorage.getVolume(this.currentVolume['volume_url'], 
                                new Date(this.currentVolume['lastUpdate']),
                                this.onFetchedData.bind(this));  
                                
    // Add jacobian overlay by default (if it exists)            
    if (this.hasLabelmap) {
        this.setLabelmap(this.currentLabelmap);
    }
};


iev.specimen2D.prototype.onFetchedData = function (filedata) {
    //Filedata is null if not found on server
    if (!filedata) {
        // Remove the loading indicator
        $('#ievLoading' + this.id).remove();
        var data = {geneOrColonyId: this.queryColonyId,
            animalId: this.currentVolume.animalName};

        var $specimenView = $('#' + this.id);
        var dataNotFoundSource = $("#dataNotFoundTemplate").html();
        var dataNotFoundTemplate = Handlebars.compile(dataNotFoundSource);
        var $notFound = dataNotFoundTemplate(data);
        $specimenView.append($notFound);
    } else {
        this.volume.filedata = filedata;
        // First we render X. Then X.afterRender() calls the loading and rendering of the others
        this.xRen.add(this.volume);
        this.checkLoading();
        this.xRen.render();
    }
};


iev.specimen2D.prototype.checkLoading = function () {
    /*
     * XTK does not have a on data load error function
     * Check periodically for successful loading of data
     * If data loaded, return
     * If data not loaded, check for XTX load error caut by window.onerror
     */
    var tid = setInterval(function () {
        
        if (this.ready) {
            clearInterval(tid);
        }
        else if (this.xtkLoadError) {
            $('#ievLoading' + this.id).remove();
            
            var data = {
                colonyId: this.currentVolume.colonyId,
                animalId: this.currentVolume.animalName
            };

            var $specimenView = $('#' + this.id);
            var dataNotFoundSource = $("#dataNotFoundTemplate").html();
            var dataNotFoundTemplate = Handlebars.compile(dataNotFoundSource);
            var $notFound = dataNotFoundTemplate(data);
            $specimenView.append($notFound);
            clearInterval(tid);
            //Remove the offending volume from indexedDB
            this.localStorage.removeVolume(this.currentVolume.volume_url);
            console.log(this.currentVolume.volume_url);
            this.xtkLoadError = false;
        }
    }.bind(this), 5000);
};


iev.specimen2D.prototype.catchMouseDown = function(ren){
    // This is a hack has we can't seem to correctly catch rightmouse up
    // event in XTK

    ren.interactor.onMouseDown = function(left, middle, right) {
       
            if (right){
                this.rightMouseDown = true;   
            }else{
                this.rightMouseDown = false;   
            }

        
    }.bind(this);
};

iev.specimen2D.prototype.catchMouseUp = function(ren){
    // This is a hack has we can't seem to correctly catch rightmouse up
    // event in XTK. If right mouse is up, rescale the scale bar
    ren.interactor.onMouseUp = function(event) {
            if (this.rightMouseDown){   
                this.drawScaleBar();
                this.rightMouseDown = false;
            }
    }.bind(this);
};

        
iev.specimen2D.prototype.setReady = function(){
    //remove the progress div
    //
    $('#ievLoading' + this.id).remove();
    $('#noData').remove();
    this.ready = true;
    this.readyCB();
};

        
iev.specimen2D.prototype.isReady = function(){
    return this.ready;
};


iev.specimen2D.prototype.invertColour = function(checked) {
    /**
     * Responds to invert color checkbox, and inverts the lookup table
     * 
     * @method invertColour
     * @param {bool} checked Is the checkbox active
     */

    if (!this.volume)
        return;
    
    this.inverted = checked;

    if (checked) {
        this.volume.maxColor = [0, 0, 0];
        this.volume.minColor = [1, 1, 1];
        $("#" + this.id + "> .sliceView").css("background-color", "#FFFFFF");

        this.volume.indexX++;
        this.volume.indexY++;
        this.volume.indexZ++;

    } else {

        this.volume.maxColor = [1, 1, 1];
        this.volume.minColor = [0, 0, 0];
        $("#" + this.id + "> .sliceView").css("background-color", "#000000");

        // Bodge to get the colours to update
        this.volume.indexX--;
        this.volume.indexY--;
        this.volume.indexZ--;
    }
};
        
        
        
iev.specimen2D.prototype.sliceChangeX = function(index){
    /**
     * Called when the slice index is changed either from the slider of the mouse scroll button
     * 
     * @method sliceChange
     * @param {String} id The ID of the this SpecimenView class
     * @param {String} ortho The orthogonal view that was changed ('X', 'Y', or 'Z')
     */
     this.xCb(index + this.xOffset );
};

iev.specimen2D.prototype.sliceChangeY = function(index){
    /**
     * Called when the slice index is changed either from the slider of the mouse scroll button
     * 
     * @method sliceChange
     * @param {String} id The ID of the this SpecimenView class
     * @param {String} ortho The orthogonal view that was changed ('X', 'Y', or 'Z')
     */
     this.yCb(index + this.yOffset );
};

iev.specimen2D.prototype.sliceChangeZ = function(index){
    /**
     * Called when the slice index is changed either from the slider of the mouse scroll button
     * 
     * @method sliceChange
     * @param {String} id The ID of the this SpecimenView class
     * @param {String} ortho The orthogonal view that was changed ('X', 'Y', or 'Z')
     */
     this.zCb(index + this.zOffset );
};
       
       
iev.specimen2D.prototype.setLowPowerState = function(state){
    /*
     * @param {bool} state. Wheter low power should be turned on or off
     */
    this.lowPower = state;
};



iev.specimen2D.prototype.updateSliders = function(renderer) {
    /**
     * Update the slice index or contrast sliders.
     * If the shift key is down, we want to move the other orthogonal views idices correspondingly
     * If the left mouse button is down, we are changing the contrast, so update the contrast sliders
     * 
     *  @method updateSliders
     *  @param {X.renderer2D} renderer The renderer from which the event came from. Contains the event
     *  @param {type} name description 
     * 
     */

    if (renderer.interactor.mousemoveEvent.shiftKey) {  
        //Cross-hair navigating///////////////////

        //Set the index sliders
        this.$xSlider.slider("value", this.volume.indexX);
        this.$ySlider.slider("value", this.volume.indexY);
        this.$zSlider.slider("value", this.volume.indexZ);

        //Set the index in the other linked views
        this.sliceChangeX(this.volume.indexX);
        this.sliceChangeY(this.volume.indexY);
        this.sliceChangeZ(this.volume.indexZ);
        
    } else if (renderer.interactor.leftButtonDown){
        this.$windowLevel.slider("option", "values", [this.volume.windowLow, this.volume.windowHigh]);
    }
};

iev.specimen2D.prototype.makeIndexSlider = function($sliderDiv, orientation, max){
    /*
     * 
     * @type {iev.specimen2D.volume.dimensions}
     * orientation: string, 'X', 'Y', 'Z'
     */
    
    var index = 'index' + orientation;
    
    var sliceChangeFunction;
    if (orientation === 'X'){
        sliceChangeFunction = this.sliceChangeX.bind(this);
    }
    else if (orientation === 'Y'){
        sliceChangeFunction = this.sliceChangeY.bind(this);
    }
    else if (orientation === 'Z'){
        sliceChangeFunction = this.sliceChangeZ.bind(this);
    }
    
    $sliderDiv.slider({
        disabled: false,
        range: "min",
        min: 0,
        max: max,
        value: this.volume[index],
        slide: function (event, ui) {
            if (!this.volume || this.lowPower) return;
            this.volume[index] = ui.value;
            sliceChangeFunction(this.volume[index]);
        }.bind(this),
        stop: function (event, ui){
            if (this.volume && this.lowPower){
                this.volume[index] = ui.value;
                sliceChangeFunction(this.volume[index]);
            }
        }.bind(this)
    });
};


iev.specimen2D.prototype.xtk_showtime = function() {
    /**
     * Gets executed after all files were fully loaded and just before the first rendering attempt.
     * Sets up: Volumes and their index to view, index sliders, and mouse whell events
     * 
     * @method xtk_showtime
     */    
   
    this.yRen.add(this.volume);
    this.yRen.render();
    this.zRen.add(this.volume);
    this.zRen.render();

    var dims = this.volume.dimensions;           

    // Let main know of the new dimensions of the orthogonal views

    // It appears that dimensins are in yxz order. At least with nii loading
    this.volume.indexX = 'x' in this.config ? parseInt(this.config['x']) : Math.floor((dims[0] - 1) / 2);
    this.volume.indexY = 'y' in this.config ? parseInt(this.config['y']) : Math.floor((dims[1] - 1) / 2);
    this.volume.indexZ = 'z' in this.config ? parseInt(this.config['z']) : Math.floor((dims[2] - 1) / 2);

    this.makeIndexSlider(this.$xSlider, 'X', dims[0] - 1);
    this.makeIndexSlider(this.$ySlider, 'Y', dims[1] - 1);
    this.makeIndexSlider(this.$zSlider, 'Z', dims[2] - 1);


    // Overload onMouseWheel event to control slice sliders
    this.xRen.interactor.onMouseWheel = function (event) {
        this.$xSlider.slider({value: this.volume.indexX});

        this.sliceChangeX(this.volume.indexX);
    }.bind(this);

    this.yRen.interactor.onMouseWheel = function (event) {
        this.$ySlider.slider({value: this.volume.indexY});
        this.sliceChangeY(this.volume.indexY);
    }.bind(this);

    this.zRen.interactor.onMouseWheel = function (event) {
        this.$zSlider.slider({value: this.volume.indexZ});
        this.sliceChangeZ(this.volume.indexZ);
    }.bind(this);


    /*
     * Link the cross-hairs between the spacimen views
     */

    // Overload sliceX mouse moved
    this.xRen.interactor.onMouseMove = function (event) {
        this.updateSliders(this.xRen, event);
    }.bind(this);

    // Overload this.yRen mouse moved
    this.yRen.interactor.onMouseMove = function (event) {
        this.updateSliders(this.yRen, event);
    }.bind(this);

    // Overload this.zRen mouse moved
    this.zRen.interactor.onMouseMove = function (event) {
        this.updateSliders(this.zRen, event);
    }.bind(this);

    //TODO: overload right click zoom. Do not want
    this.yRen.interactor.rightButtonDown = function () {
    };


    // Set bookmark contrast and selected volume in menu
    this.setBookmarkContrast();

    this.update();
    
};
        
        
iev.specimen2D.prototype.setXindex = function(index){
    /**
     * Set the volume index for the X orientation
     * Apply the offset used in linking orthogonal views across SpecimenViews
     * @method setIndex
     * @param {int} index The new slice index to set
     */
     this.volume.indexX = index -this.xOffset;
     this.$xSlider.slider("value", this.volume.indexX);
}

        
iev.specimen2D.prototype.setYindex = function(index){
    /**
     * Set the volume index for the Y orientation
     * Apply the offset used in linking orthogonal views across SpecimenViews
     * @method setIndex
     * @param {int} index The new slice index to set
     */

     this.volume.indexY = index - this.yOffset;
     this.$ySlider.slider("value", this.volume.indexY);
};
        
iev.specimen2D.prototype.setZindex = function(index){
    /**
     * Set the volume index for the Z orientation
     * Apply the offset used in linking orthogonal views across SpecimenViews
     * @method setIndex
     * @param {int} index The new slice index to set
     */

     this.volume.indexZ = index - this.zOffset;
     this.$zSlider.slider("value", this.volume.indexZ);
}
        
iev.specimen2D.prototype.getBrightnessLower = function() { 
    return this.volume.windowLow;
}
        
iev.specimen2D.prototype.getBrightnessUpper = function() { 
    return this.volume.windowHigh;
}   
        
iev.specimen2D.prototype.getIndex = function(ortho){
    /**
     * Get the index of the current slice for a orthogonal view
     * @method getIndex
     * @param {String} ortho Orthogonal view ('X', 'Y' or 'Z')
     */
    if (ortho === 'X') return this.volume.indexX;
    if (ortho === 'Y') return this.volume.indexY;
    if (ortho === 'Z') return this.volume.indexZ;
}

       
iev.specimen2D.prototype.setIdxOffset = function(ortho, offset){
    /**
     * Set the index offset for a specific orthogonal view.
     * The offset defines how much the slice index differs compared to the corresponding slice in the
     * other view
     * @method setIdxOffset
     * @param {String} ortho Orthogonal view ('X', 'Y' or 'Z')
     * @param {int} offset slice index offset
     */
    if (ortho === 'X') this.xOffset = offset;
    if (ortho === 'Y') this.yOffset = offset;
    if (ortho === 'Z') this.zOffset = offset;
};
        
        
iev.specimen2D.prototype.getDimensions = function(){
    /**
     * Get the dimensions of the current volume
     * @method getDimensions
     * @return {Array<int>} XYZ dimensions of the current this.volume
     */
    return this.volume.dimensions;
};
    
    
iev.specimen2D.prototype.getCurrentVolume = function(){
    /*
     * Return the data for the currently viewd image
     */
    return this.currentVolume;
};     


iev.specimen2D.prototype.setVisibleViews = function(viewList, count, horizontalView) {
    /**
     * Set which orthogonal views should be visible. Change the container width
     * to take up the full width of the outer container.
     * If orientation in vertical, slice width should always be 100%
     * @method setVisibleViews
     * @param {Hash} viewsList Info on which orthogonal view is visible
     * @param {int} count How many views should be visible
     */

    var slice_view_width;

    if (horizontalView){
        slice_view_width = 100;
    }
    else{
        var slice_view_width = String(100 / count);
    }

    if (viewList['X'].visible) {
        this.$xWrap.show();
        this.$xWrap.width(slice_view_width + '%');

    } else {
        this.$xWrap.hide();
    }

    if (viewList['Y'].visible) {
        this.$yWrap.show();
        this.$yWrap.width(slice_view_width + '%');

    } else {
        this.$yWrap.hide();
    }

    if (viewList['Z'].visible) {
        this.$zWrap.show();
        this.$zWrap.width(slice_view_width + '%');

    } else {
        this.$zWrap.hide();
    }
    this.drawScaleBar();
};


iev.specimen2D.prototype.basename = function(path) {
    /**
     * Extract the basename from a path
     * @method basename
     * @param {String} path File path
     */
    return path.split(/[\\/]/).pop();
};

        
iev.specimen2D.prototype.objSize = function(obj) {
    /*
     * Get the size of an object (associative array)
     * @method objSize
     */
    var count = 0;
    var i;

    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            count++;
        }
    }
    return count;
};


iev.specimen2D.prototype.getData = function(volumeUrl){
    /*
     * Checks if the data for this url has already been loaded and saved in
     * indexedDB storage. If it has, we get the x.volume.filedata from it.
     * Otherwise it is fetched from the server and stored
     */
};

iev.specimen2D.prototype.caughtXtkLoadError = function(){
    this.xtkLoadError = true;
};
        
// export symbols (required for advanced compilation)
goog.exportSymbol('iev.specimen2D.prototype.updateData', iev.specimen2D.prototype.updateData);
goog.exportSymbol('iev.specimen2D.prototype.reset', iev.specimen2D.prototype.reset );
goog.exportSymbol('iev.specimen2D.prototype.getCurrentVolume', iev.specimen2D.prototype.getCurrentVolume);
goog.exportSymbol('iev.specimen2D.prototype.getIndex', iev.specimen2D.prototype.getIndex);
goog.exportSymbol('iev.specimen2D.getBrightnessLower', iev.specimen2D.getBrightnessLower);
goog.exportSymbol('iev.specimen2D.getBrightnessupper', iev.specimen2D.getBrightnessUpper);
goog.exportSymbol('iev.specimen2D.prototype.zoomIn', iev.specimen2D.prototype.zoomIn);
goog.exportSymbol('iev.specimen2D.prototype.zoomOut', iev.specimen2D.prototype.zoomOut);
goog.exportSymbol('iev.specimen2D.prototype.getIndex', iev.specimen2D.prototype.getIndex);
