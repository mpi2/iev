goog.provide('iev.specimen3D');

/**
 * Create a volume view that displays a single 3D renderer
 *
 * @constructor
 */
iev.specimen3D = function(volumeData, id, container, queryColonyId, localStorage, cb, config) {
    
    this.volumeData = volumeData;
    this.id = id;
    this.container = container;
    this.$container = $('#'+ this.container)
    this.cb = cb;
    this.config = config;
    this.queryColonyId = queryColonyId;
    this.localStorage = localStorage;
    this.spinner;
    this.analysisVolume;
    this.currentLabelmap = 'ov' in config ? config['ov'] : 'jacobian';
    this.vselector = 'volumeSelector_' + id;

    
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

    // If the config has a specimen, select that instead
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
    
    
    // Create control panel
    this.controlPanel = new iev.specimenPanel(id, this.replaceVolume.bind(this));

    var progressSource   = $("#progress_template").html();
    this.progressTemplate = Handlebars.compile(progressSource);
    this.volumeRendered = false;
    
    this.createHTML();
    this.controlPanel.updateVolumeSelector(this.currentVolume, this.volumeData);
    this.createRenderer();    
    
};

iev.specimen3D.prototype.createHTML = function() {

    var $viewsContainer = $("#" + this.container);

    if (this.objSize(this.volumeData) < 1 && this.queryColonyId !==  null){
        return;
    }

    var data = {
        id: this.id,
        msg: "Rendering, please wait..."
    };
    
    // Create volumeView
    var source = $("#volume_view_template").html();
    var template = Handlebars.compile(source);
    this.$volumeView = $(template(data));
    
    // Add controls
    this.$volumeView.append(this.controlPanel.create());
    
    // Create progress div and append
    var $progress = $(this.progressTemplate(data));
    this.spinner = new Spinner(this.spinnerOpts).spin();
    $progress.find('.ievLoadingMsg').append(this.spinner.el);
    this.$volumeView.append($progress);
   
    // Add volume view to container
    $viewsContainer.append(this.$volumeView);
    
    // Update volume selector
    this.controlPanel.updateVolumeSelector(this.currentVolume, this.volumeData);        
    
    
};     

iev.specimen3D.prototype.createRenderer = function() {

    this.renderer = new X.renderer3D();

    this.renderer.container = this.$volumeView.get(0);
    this.renderer.config.PICKING_ENABLED = false;
    this.renderer.init();
    this.renderer.camera.position = [0, 400, 0];  
    
    this.renderer.onShowtime = function(){        
        this.volume.lowerThreshold = (this.volume.min + (this.volume.max/10));
        this.volume.upperThreshold = this.volume.max * 0.9;
        this.volume.opacity = 0.2;
    }.bind(this);
    
    this.renderer.firstRender = true;
    this.volumeRendered = false;
    this.renderer.afterRender = function() {
        
        // Check if first render has happened
        if (!this.renderer.firstRender && !this.volumeRendered) {
            this.volumeRendered = true;
            this.xtk_showtime();
        }
        
        if (this.renderer.firstRender){
           this.renderer.firstRender = false;
        }

    }.bind(this);
    
    this.volume = new X.volume();
    this.volume.file = 'dummy.nrrd';
    this.localStorage.getVolume(this.currentVolume['volume_url'], 
                                new Date(this.currentVolume['lastUpdate']),
                                this.onFetchedData.bind(this));  
       
};

iev.specimen3D.prototype.update = function() {
    this.controlPanel.setContrastSlider(this.volume);
    this.controlPanel.showMetadata(this.currentVolume);
    this.controlPanel.setVisible(true);
    this.setBookmarkContrast();
};

iev.specimen3D.prototype.setBookmarkContrast = function() {

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

iev.specimen3D.prototype.invertColour = function(checked) {
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
    } else {

        this.volume.maxColor = [1, 1, 1];
        this.volume.minColor = [0, 0, 0];
    }
};

iev.specimen3D.prototype.destroyRenderer = function() {
    
    if (typeof (this.renderer) !== 'undefined') {
        this.renderer.destroy();
        delete this.renderer;
    }
    if (typeof (this.volume) !== 'undefined') {
        this.volume.destroy();
        delete this.volume;
    }
    
};

iev.specimen3D.prototype.xtk_showtime = function() {
    this.spinner.stop();
    $(".ievLoading").remove();
    this.update();
    this.cb();
};

iev.specimen3D.prototype.setReady = function() {
    this.ready = true;
};

iev.specimen3D.prototype.onFetchedData = function(filedata) {
    
    // filedata is null if not found on server
    if (!filedata) {
        console.log("File not found");
    } else {
        this.volume.filedata = filedata;
        this.volume.volumeRendering = true;
        this.renderer.add(this.volume);
        this.renderer.render();
    }
    
};

iev.specimen3D.prototype.updateData = function (volumes){
    /*
     * Change the current stage/modality/centre being viewed
     * 
     */

    this.volumeData = volumes;
    this.replaceVolume(this.volumeData[Object.keys(this.volumeData)[0]]['volume_url']);
    this.controlPanel.updateVolumeSelector(this.currentVolume, this.volumeData);
};
    

iev.specimen3D.prototype.replaceVolume = function(volumePath) {
        
    var data = {
        id: this.id,
        msg: "Rendering, please wait..."
    };
    
    this.controlPanel.setVisible(false);
    var $progress = $(this.progressTemplate(data));

    this.$volumeView.append($progress);
    this.spinner = new Spinner(this.spinnerOpts).spin();
    $progress.find('.ievLoadingMsg').append(this.spinner.el);
    
    // Call separate method to destroy renderers
    this.destroyRenderer();

    this.currentVolume = this.volumeData[volumePath];
    this.createRenderer();
    
};

iev.specimen3D.prototype.showAnalysisData = function() {
    if (this.analysisVolume && this.currentVolume['volume_url'] !== this.analysisVolume) {
        $('#' + this.vselector).val(this.analysisVolume);
        $('#' + this.vselector).iconselectmenu("refresh");     
        this.replaceVolume(this.analysisVolume);
    }
};

iev.specimen3D.prototype.zoomIn = function(){
   this.renderer.camera.zoomIn(true);
};
        
iev.specimen3D.prototype.zoomOut = function(){
    //Prevent over out-zooming
    if (this.renderer.normalizedScale < 1.0) {
       return false;
    }
    
    this.renderer.camera.zoomOut(true);        
    return true;
};

iev.specimen3D.prototype.reset = function() {
    this.renderer.resetViewAndRender();
    this.controlPanel.$windowLevel.slider("option", "values", [this.volume.windowLow, this.volume.windowHigh]);
    this.currentZoom = 0;
    this.update();

};

iev.specimen3D.prototype.objSize = function(obj) {
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