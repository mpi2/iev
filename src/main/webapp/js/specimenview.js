
//goog.require('X.renderer2D');
//goog.require('X.interactor2D');

goog.provide('iev.specimenview');

/**
 * Create a specimen view that displays three orthogonal views
 *
 * @constructor
 */

iev.specimenview = function(volumeData, id, container, 
             queryColonyId, indexCB, config, readyCB){
    
if (typeof dcc === 'undefined')
    dcc = {};

    /* @type {string} */
    this.queryColonyId = queryColonyId;
    
   /*@type {?Object}*/
    this.config = config;
    
   
    this.indexCB = indexCB;
    
    /** @type {string} */
    this.id = id;
    /** @type {string} */
    this.viewContainer = container;
    this.volumeData = volumeData;
    this.readyCB = readyCB;
    this.$xContainer;
     /**
    * The orientation index in respect to the
    * attached volume and its scan direction.
    *
    * @type {!number}
    * @protected
    */
    this.fs_object;
    this.$yContainer;
    this.$zContainer;
    this.$xWrap;
    this.$yWrap;
    this.$zWrap;
    this.$xSlider;
    this.$ySlider;
    this.$zSlider;
    this.$windowLevel;
    this.xRen;
    this.yRen;
    this.zRen;
    this.volume;
    this.scaleBarSize;
    this.lowPower = false;
    this.windowLevel = 'windowLevel_' + id;
    this.vselector = 'volumeSelector_' + id;
    this.xOffset = 0;
    this.yOffset = 0;
    this.zOffset = 0;
    this.ready = false;
    this.progressSpinner;
    this.contrast = config['specimen']['brightness'];
    /** @const */ 
    this.WILDTYPE_COLONYID = 'baseline';

    // Select first volume in the list
    this.currentVolume = volumeData[Object.keys(volumeData)[0]];
    this.bookmarkHasVolume = false;

    // If the config has a specimen, select that igit nstead
    if (config['specimen']) {
        for (var key in volumeData) {
            if (volumeData.hasOwnProperty(key)) {
                var vol = volumeData[key];
                if (vol['animalName'] === config['specimen']['name']) {
                    this.currentVolume = vol;
                    this.bookmarkHasVolume = true;
                    break;
                }
            }
        }           
    }


    /*
     * 
     * A temporary fix to map cid to centre logo icon
     */
    /** @const */ 
    this.ICONS_DIR = "images/centre_icons/";
    /** @const */ 
    this.IMG_DIR = "images/";
    /** @const */ 
    this.FEMALE_ICON = "female.png";
    /** @const */ 
    this.MALE_ICON = "male.png";
    /** @const */ 
    this.HOM_ICON = 'hom.png';
    /** @const */ 
    this.HET_ICON = 'het.png';
    /** @const */ 
    this.HEMI_ICON = 'het.png';
    /** @const */ 
    this.WT_ICON = 'wildtype.png';

    this.specimenMetaTemplateSource = $("#specimenMetdataTemplate").html();

    /** @const */ 
    this.centreIcons ={
        1: "logo_Bcm.png",
        3: "logo_Gmc.png",
        4: "logo_H.png",
        6: "logo_Ics.png",
        7: "logo_J.png",
        8: "logo_Tcp.png",
        9: "logo_Ning.png",
        10: "logo_Rbrc.png",
        11: "logo_Ucd.png",
        12: "logo_Wtsi.png"
    }

    this.spinner;
    
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
//            , left: '70%' // Left position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false // Whether to use hardware acceleration
        , position: 'relative' // Element positioning
    };

    /** @const */ 
    this.monthNames = ["Jan", "Feb", "Mar", "April", "May", "June",
        "July", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    this.createHTML();
    this.updateVolumeSelector();        
    this.jQuerySelectors();        
    this.setupRenderers();
    //createEventHandlers();
    this.drawScaleBar();        
}
        
        
iev.specimenview.prototype.updateData = function (volumes){
    /*
     * Chnage the current stage/modality being viewed
     * 
     */

    this.volumeData = volumes;
    this.replaceVolume(this.volumeData[Object.keys(this.volumeData)[0]]['volume_url']);
    this.updateVolumeSelector();
}
        
        
iev.specimenview.prototype.update = function (){
    this.drawScaleBar();
    this.showMetadata();
}
        

iev.specimenview.prototype.updateVolumeSelector = function () {
    
    //This custom widget is also used in main. Should define it somewhere else
    $.widget("custom.iconselectmenu", $.ui.selectmenu, {
        _renderItem: function (ul, item) {
            var li = $("<li>", {text: item.label});
            if (item.disabled) {
                li.addClass("ui-state-disabled");
            }

            $("<span>", {
                style: item.element.attr("data-style"),
                "class": "ui-icon " + item.element.attr("data-class")
            })
                    .appendTo(li);
            return li.appendTo(ul);
        }
    });
    //remove any current options
    $('#' + this.vselector)
            .find('option')
            .remove()
            .end();

    // Add the volume options
    var options = [];
    
    for (var i in this.volumeData) {
        var url = this.volumeData[i]['volume_url'];
        var sex = this.volumeData[i].sex.toLowerCase();
        var zygosity = this.volumeData[i].zygosity.toLowerCase();
        
        var idForSexZygosityIcon;
       
        if (this.volumeData[i].colonyId === this.WILDTYPE_COLONYID){
            idForSexZygosityIcon = 'specimenSelectIcon ' + sex + '_' + 'wildtype';
        }else{
              var idForSexZygosityIcon = 'specimenSelectIcon ' + sex + '_' + zygosity;
        }
      
        var animalNameForDisplay = this.volumeData[i].animalName.substring(0, 25);

        if (url === this.currentVolume['volume_url']) {
            options.push("<option value='" + url  + "' data-class='" + idForSexZygosityIcon + "' selected>" + animalNameForDisplay + "</option>");
            this.bookmarkHasVolume = false;
        } else {
            options.push("<option value='" + url + "' data-class='" + idForSexZygosityIcon + "'>" + animalNameForDisplay + "</option>");
        }
    }


    $('#' + this.vselector)
            .append(options.join(""));


    $('#' + this.vselector).iconselectmenu()
            .iconselectmenu("menuWidget")
            .addClass("ui-menu-icons customicons");

    $('#' + this.vselector)
            .iconselectmenu({
                change: $.proxy(function (event, ui) {
                    if (!this.bookmarkHasVolume) { // not a bookmark triggered change
                        this.replaceVolume(ui.item.value);
                    }
                }, this)
            })
            .iconselectmenu("refresh");                  
}
        
        
        
iev.specimenview.prototype.showMetadata = function(){

    var date = new Date(this.currentVolume.experimentDate)

    var displayDate = this.monthNames[date.getMonth()];

    displayDate += " " + date.getDate();
    displayDate += " " + date.getFullYear();

    var sexIconPath;
    if (this.currentVolume.sex.toLowerCase() === 'female'){
       sexIconPath = this.IMG_DIR + this.FEMALE_ICON;
    }
    else{
        sexIconPath = this.IMG_DIR + this.MALE_ICON;
    }

    // Set the zygosity icon for mutants or the 'WT' icon for baselines 
    var zygIconPath;
    var zygIcon;

    if (this.currentVolume.colonyId === this.WILDTYPE_COLONYID){
        zygIcon = this.WT_ICON;
    }

    else{

        switch (this.currentVolume.zygosity.toLowerCase()){
            case 'homozygous':
                console.log('hello');
                zygIcon = this.HOM_ICON;
                break;
            case 'heterozygous':
                console.log('hettttt');
                zygIcon = this.HET_ICON;
                break;
            case 'hemizygous':
                console.log('hemiiiii');
                zygIcon = this.HEMI_ICON;
                break;
        }
    }

    zygIconPath = this.IMG_DIR + zygIcon;

    var centreLogoPath = "";

    if (this.centreIcons.hasOwnProperty(this.currentVolume.cid)){
        centreLogoPath = this.ICONS_DIR + this.centreIcons[this.currentVolume.cid];
    }

    var data = {
        animalId: this.currentVolume.animalName,
        date: displayDate,
        sexIconPath: sexIconPath,
        zygIconPath: zygIconPath,
        centreLogoPath: centreLogoPath
    };

    var template = Handlebars.compile(this.specimenMetaTemplateSource);

    var $metaDataHtml = $(template(data));

    //Clear any current metadata
    $("#metadata_" + this.id).empty();
    $("#metadata_" + this.id).append($metaDataHtml);
}
        
        
iev.specimenview.prototype.setContrastSlider = function() {
    /**
     * Makes contrast slider for specimen view
     * @method setContrastSlider
     */
    console.log(this.volume.min);

    this.$windowLevel.slider({
        range: true,
        min: parseInt(this.volume.min),
        max: parseInt(this.volume.max),
        step: Math.ceil((this.volume.max - this.volume.min) / 256),
        values: [ parseInt(this.volume.windowLow), parseInt(this.volume.windowHigh) ],
        slide: $.proxy(function (event, ui) {
            this.volume.windowLow = ui.values[0];
            this.volume.windowHigh = ui.values[1];
            this.volume.modified(true);
        }, this)
    });
};


        
iev.specimenview.prototype.setBookmarkContrast = function() {

    // Set lower contrast level
    var lower = parseInt(this.volume.windowLow);
    if (this.contrast['lower'] !== null) {
        lower = Math.max(this.contrast['lower'], parseInt(this.volume.windowLow));                
    }

    // Set upper this.contrast level
    var upper = parseInt(this.volume.windowHigh);
    if (this.contrast['upper'] !== null) {
        upper = Math.min(this.contrast['upper'], parseInt(this.volume.windowHigh));                             
    }

    // Set this.volume modifed
    this.volume.windowLow = lower;
    this.volume.windowHigh = upper;
    this.volume.modified(false);

    // Set slider values
    this.$windowLevel.slider("option", "values", [this.volume.windowLow, this.volume.windowHigh]);            

}


iev.specimenview.prototype.reset = function(){
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
    this.$windowLevel.slider("option", "values", [this.volume.windowLow, this.volume.windowHigh]);

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
}


iev.specimenview.prototype.createHTML = function() {
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
        id:this.id
    };

    var source   = $("#specimen_view_template").html();
    var template = Handlebars.compile(source);

    var $specimenView = $(template(data));

    $specimenView.append(this.controls_tab());

    // This defines the order of the orthogonal views
    $specimenView.append(this.createSliceView('X'));
    $specimenView.append(this.createSliceView('Y'));
    $specimenView.append(this.createSliceView('Z'));

    var progressSource   = $("#progress_template").html();
    var progressTemplate = Handlebars.compile(progressSource);
    var $progress = $(progressTemplate(data));

    $specimenView.append($progress);
    this.spinner = new Spinner(this.spinnerOpts).spin();
    //spinner = new Spinner(this.spinnerOpts).spin($specimenView);
    $progress.find('.ievLoadingMsg').append(this.spinner.el);


    $viewsContainer.append($specimenView);
};
        
        
        
        
iev.specimenview.prototype.progressStop = function(){
    this.spinner.stop();
     $("#progressMsg").empty();
};
        
        
iev.specimenview.prototype.createSliceView = function(orient){
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

    var source = $("#slice_view_template").html();
    var template = Handlebars.compile(source);
    return template(data);
}
        
           
        
iev.specimenview.prototype.jQuerySelectors = function(){
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
}
        
        
        
iev.specimenview.prototype.controls_tab = function() {
    /**
     * Use handlebars.js to the controls tab HTML for the specimen view
     * Controls tab contains zoom buttons contrst slider etc.
     * 
     * @method controls_tab
     * 
     */

    var data = {
        id: this.id,
        controlsButtonsId: "controlsButtons_" + this.id,
        selectorWrapId: "selectorWrap_" + this.id,
        vselectorId: this.vselector,
        windowLevelId: this.windowLevel 
    };

    var source   = $("#slice_controls_template").html();
    var template = Handlebars.compile(source);
    return template(data);
};
        
        
iev.specimenview.prototype.zoomIn = function(){
   this.xRen.camera.zoomIn(false);
   this.yRen.camera.zoomIn(false);
   this.zRen.camera.zoomIn(false);
   this.drawScaleBar();
};

        
iev.specimenview.prototype.zoomOut = function(){
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


iev.specimenview.prototype.drawScaleBar = function() {   
    // After resizing the window or doing a zoomIn or zoomOut, we need to wait for renderer2D to call
    // render_(). Otherwose normalizScale will not have been set
     setTimeout(function () {
        this.drawScale(this.yRen, 'scale_' + 'Y' + this.id, 'scaletext_' + 'Y' + this.id);
        this.drawScale(this.zRen, 'scale_' + 'Z' + this.id, 'scaletext_' + 'Z' + this.id);
        this.drawScale(this.xRen, 'scale_' + 'X' + this.id, 'scaletext_' + 'X' + this.id );
    }.bind(this), 20);  
};
        
            
iev.specimenview.prototype.drawScale = function(ren, scaleId, scaleTextId){

    var $scaleouter =  $('.scale_outer_' + this.id);

    if (this.currentVolume["rescaledPixelsize"] === null ||  this.currentVolume["rescaledPixelsize"] === 0){
        $scaleouter.hide();
        return;
    }
    $scaleouter.show();

    var pixel_size = this.currentVolume["rescaledPixelsize"]; //for now hard code
    var bar_size_pixels = (this.scaleBarSize / pixel_size) * ren.normalizedScale;

    var outer_height = $('.scale_outer').height();
    var top = (outer_height - bar_size_pixels) / 2;

    $('#'+ scaleId).css(
       {'height': bar_size_pixels, 
        'width': '2px',
        'position': 'absolute',
        'top': top
    });
    $('#' + scaleTextId).css(
        {
        'position': 'absolute',
        'top': top - 20,
        'font-size': '10px'
    });
};      
        
              
iev.specimenview.prototype.rescale = function(scale){

    this.scaleBarSize = scale;
    this.drawScaleBar();
}
        
         
iev.specimenview.prototype.getVolume = function(){

    return this.volume;
}

        

iev.specimenview.prototype.replaceVolume = function(volumePath) {
    /**
     * Replace current specimen volume with another.
     * Destroys current object (not sure is necessary) add new path and call setupoRenderers
     * 
     * @method replaceVolume
     * @param {String} VolumePath path to new volume to load into viewer
     */
    var data = {
        id: this.id
    };
    var $specimenView = $('#' + this.id);
    var progressSource   = $("#progress_template").html();
    var progressTemplate = Handlebars.compile(progressSource);
    var $progress = $(progressTemplate(data));

    $specimenView.append($progress);
    this.spinner = new Spinner(this.spinnerOpts).spin();
    //spinner = new Spinner(this.spinnerOpts).spin($specimenView);
    $progress.find('.ievLoadingMsg').append(this.spinner.el);

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

    this.currentVolume = this.volumeData[volumePath];
    this.setupRenderers();
};
        



iev.specimenview.prototype.setupRenderers = function() {
    /**
     * Call the XTK functions that are required to get our volume rendered in 2D
     * 
     * @method setupRenderers
     */
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
    

    this.xRen.onShowtime = function(){   
        // we have to wait before volumes have fully loaded before we
        // can extract intesity information                
        this.setContrastSlider();                
        this.setReady();                
    }.bind(this);


    this.xRen.container = this.$xContainer.get(0);
    this.xRen.orientation = 'X';
    this.xRen.init();

    this.overrideRightMouse(this.xRen);

    this.yRen = new X.renderer2D();
    this.yRen.config.PROGRESSBAR_ENABLED = false;
    this.yRen.container = this.$yContainer.get(0);
    this.yRen.orientation = 'Y';
    this.yRen.init();
    this.overrideRightMouse(this.yRen);

    this.zRen = new X.renderer2D();
    this.zRen.config.PROGRESSBAR_ENABLED = false;
    this.zRen.container = this.$zContainer.get(0);
    this.zRen.orientation = 'Z';
    this.zRen.init();
    this.overrideRightMouse(this.zRen);

    // create a X.volume
    this.volume = new X.volume();
    this.volume.file = this.currentVolume['volume_url'];

    // First we render X. Then X.afterRender() calls the loading and rendering of the others
    this.xRen.add(this.volume);
    this.xRen.render(); 
};

        
// Attempting to stop the right mouse zoom functionality
iev.specimenview.prototype.overrideRightMouse = function(ren){

    ren.interactor.onMouseDown = function(left, middle, right) {
        // This doesn't override the onMouseDown_ function
        if (right) {
            console.log('mousy R');
            return;

        }
    }
}

        
iev.specimenview.prototype.setReady = function(){
    //remove the progress div
    //
    $('#ievLoading' + this.id).remove();
    this.ready = true;
    this.readyCB();
}

        
iev.specimenview.prototype.isReady = function(){
    return this.ready;
}


iev.specimenview.prototype.invertColour = function(checked) {
    /**
     * Responds to invert color checkbox, and inverts the lookup table
     * 
     * @method invertColour
     * @param {bool} checked Is the checkbox active
     */

    if (!this.volume)
        return;

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
        
        
        
iev.specimenview.prototype.sliceChange = function(id, ortho, index){
    /**
     * Called when the slice index is changed either from the slider of the mouse scroll button
     * 
     * @method sliceChange
     * @param {String} id The ID of the this SpecimenView class
     * @param {String} ortho The orthogonal view that was changed ('X', 'Y', or 'Z')
     */
     if (ortho === 'X') this.indexCB(id, ortho, index + this.xOffset );
     else if (ortho === 'Y') this.indexCB(id, ortho, index + this.yOffset );
     else if (ortho === 'Z') this.indexCB(id, ortho, index + this.zOffset );
};
       
       
iev.specimenview.prototype.setLowPowerState = function(state){
    /*
     * @param {bool} state. Wheter low power should be turned on or off
     */
    this.lowPower = state;
};



iev.specimenview.prototype.updateSliders = function(renderer) {
    /**
     * Update the slice index or contrast sliders.
     * If the shift key is down, we want to move the other orthogonal views index correspondingly
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
        this.sliceChange(this.id, 'X', this.volume.indexX);
        this.sliceChange(this.id, 'Y', this.volume.indexY);
        this.sliceChange(this.id, 'Z', this.volume.indexZ);
    }
    else if(renderer.interactor.leftButtonDown){
          this.$windowLevel.slider("option", "values", [this.volume.windowLow, this.volume.windowHigh]);
    }
};

iev.specimenview.prototype.makeIndexSlider = function($sliderDiv, orientation, max){
    /*
     * 
     * @type {iev.specimenview.volume.dimensions}
     * orientation: string, 'X', 'Y', 'Z'
     */
    
    var index = 'index' + orientation;
    
    $sliderDiv.slider({
        disabled: false,
        range: "min",
        min: 0,
        max: max,
        value: this.volume[index],
        slide: function (event, ui) {
            if (!this.volume || this.lowPower) return;
            this.volume[index] = ui.value;
            console.log(this.id);
            this.sliceChange(this.id, orientation, this.volume[index]);
        }.bind(this),
        stop: function (event, ui){
            if (this.volume && this.lowPower){
                this.volume[index] = ui.value;
                this.sliceChange(this.id, orientation, this.volume[index]);
            }
        }.bind(this)
    });
}

//iev.specimenview.prototype.writeVolume = function (volName, rawData) {
//    this.fs_object.root.getFile(volName, {create: false}, function (fileEntry) {
//
//        // Create a FileWriter object for our FileEntry (log.txt).
//        fileEntry.createWriter(function (fileWriter) {
//
//            fileWriter.seek(fileWriter.length); // Start write position at EOF.
//
//            // Create a new Blob and write it to log.txt.
//            var blob = new Blob([rawData], {type: 'text/plain'});
//
//            fileWriter.write(blob);
//
//        }, errorHandler);
//
//    }, errorHandler);
//
//
//};

iev.specimenview.prototype.xtk_showtime = function() {
    /**
     * Gets executed after all files were fully loaded and just before the first rendering attempt.
     * Sets up: Volumes and their index to view, index sliders, and mouse whell events
     * 
     * @method xtk_showtime
     */
//    var rawData = this.volume.filedata;
//    this.writeVolume(this.currentVolume, rawData);
//    console.log('filedata', rawData);
    
   
    this.yRen.add(this.volume);
    this.yRen.render();
    this.zRen.add(this.volume);
    this.zRen.render();

    var dims = this.volume.dimensions;           

    // Let main know of the new dimensions of the orthogonal views

    // It appears that dimensins are in yxz order. At least with nii loading
    var pos = this.config['specimen']['pos'];
    this.volume.indexX = !isNaN(pos['x']) ? pos['x'] : pos['x']; //Math.floor((dims[0] - 1) / 2);
    this.volume.indexY = !isNaN(pos['y']) ? pos['y'] : pos['y']; //Math.floor((dims[1] - 1) / 2);
    this.volume.indexZ = !isNaN(pos['z']) ? pos['z'] : pos['z']; //Math.floor((dims[2] - 1) / 2);

    this.makeIndexSlider(this.$xSlider, 'X', dims[0] - 1);
    this.makeIndexSlider(this.$ySlider, 'Y', dims[1] - 1);
    this.makeIndexSlider(this.$zSlider, 'Z', dims[2] - 1);


    // Overload onMouseWheel event to control slice sliders
    this.xRen.interactor.onMouseWheel = function (event) {
        this.$xSlider.slider({value: this.volume.indexX});

        this.sliceChange(id, 'X', this.volume.indexX);
    }.bind(this);

    this.yRen.interactor.onMouseWheel = function (event) {
        this.$ySlider.slider({value: this.volume.indexY});
        this.sliceChange(id, 'Y', this.volume.indexY);
    }.bind(this);

    this.zRen.interactor.onMouseWheel = function (event) {
        this.$zSlider.slider({value: this.volume.indexZ});
        this.sliceChange(id, 'Z', this.volume.indexZ);
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
        
        
iev.specimenview.prototype.setXindex = function(index){
    /**
     * Set the volume index for the X orientation
     * Apply the offset used in linking orthogonal views across SpecimenViews
     * @method setIndex
     * @param {int} index The new slice index to set
     */
     this.volume.indexX = index -this.xOffset;
     this.$xSlider.slider("value", this.volume.indexX);
}

        
iev.specimenview.prototype.setYindex = function(index){
    /**
     * Set the volume index for the Y orientation
     * Apply the offset used in linking orthogonal views across SpecimenViews
     * @method setIndex
     * @param {int} index The new slice index to set
     */

     this.volume.indexY = index - this.yOffset;
     this.$ySlider.slider("value", this.volume.indexY);
};
        
iev.specimenview.prototype.setZindex = function(index){
    /**
     * Set the volume index for the Z orientation
     * Apply the offset used in linking orthogonal views across SpecimenViews
     * @method setIndex
     * @param {int} index The new slice index to set
     */

     this.volume.indexZ = index - this.zOffset;
     this.$zSlider.slider("value", this.volume.indexZ);
}
        
iev.specimenview.prototype.getBrightnessLower = function() { 
    return this.volume.windowLow;
}
        
iev.specimenview.prototype.getBrightnessUpper = function() { 
    return this.volume.windowHigh;
}   
        
iev.specimenview.prototype.getIndex = function(ortho){
    /**
     * Get the index of the current slice for a orthogonal view
     * @method getIndex
     * @param {String} ortho Orthogonal view ('X', 'Y' or 'Z')
     */
    if (ortho === 'X') return this.volume.indexX;
    if (ortho === 'Y') return this.volume.indexY;
    if (ortho === 'Z') return this.volume.indexZ;
}

       
iev.specimenview.prototype.setIdxOffset = function(ortho, offset){
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
        
        
iev.specimenview.prototype.getDimensions = function(){
    /**
     * Get the dimensions of the current volume
     * @method getDimensions
     * @return {Array<int>} XYZ dimensions of the current this.volume
     */
    return this.volume.dimensions;
};
    
    
iev.specimenview.prototype.getCurrentVolume = function(){
    /*
     * Return the data for the currently viewd image
     */
    return this.currentVolume;
};     

iev.specimenview.prototype.setFileSystem = function(fs_object){
    this.fs_object = fs_object;
};


iev.specimenview.prototype.setVisibleViews = function(viewList, count, horizontalView) {
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
}


iev.specimenview.prototype.basename = function(path) {
    /**
     * Extract the basename from a path
     * @method basename
     * @param {String} path File path
     */
    return path.split(/[\\/]/).pop();
};

        
iev.specimenview.prototype.objSize = function(obj) {
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
}

        



       
    


