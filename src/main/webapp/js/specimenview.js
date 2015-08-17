
//goog.require('X.renderer2D');
//goog.require('X.interactor2D');



(function () {
    if (typeof dcc === 'undefined')
        dcc = {};


    function SpecimenView(volumeData, id, container, 
             queryColonyId, indexCB, config, readyCB) {
        /**
         * This class holds the three orthogonal views from a single specimen and 
         * allows for loading in of differnt specimens of the same genenotype/colonyID
         * 
         * @class SpcimenView
         * @param {Array} VolumePaths volumes paths for a specific mutant/baseline
         * @param {String} id unique id for this view
         * @param {String} container html element to place this view
         * @param {String} queryColonyId The colonyId of this specimen
         * @param {function} indexCB called when slice index changes
         */
        //This is s atest vomment
        var id = id;
        var viewContainer = container;
     
        
        var volumeData = volumeData;
        
        // Load up the first volume 
        var currentVolume = volumeData[Object.keys(volumeData)[0]];
        if (config['specimen']) {       
            for (var key in volumeData) {
                if (volumeData.hasOwnProperty(key)) {
                    var vol = volumeData[key];
                    if (vol['animalName'] === config['specimen']['name']) {
                        currentVolume = vol;
                        break;
                    }
                }
            }           
        }
        
     
        var $xContainer;
        var $yContainer;
        var $zContainer;
        var $xWrap;
        var $yWrap;
        var $zWrap;
        var $xSlider;
        var $ySlider;
        var $zSlider;
        var $windowLevel;
        var xRen;
        var yRen;
        var zRen;
        var volume;
        var progressDiv;
        var scaleBarSize;
        var lowPower = false;
        var windowLevel = 'windowLevel_' + id;
        var vselector = 'volumeSelector_' + id;
        var xOffset = 0;
        var yOffset = 0;
        var zOffset = 0;
        var ready = false;
        var progressSpinner;
        var contrast = config['specimen']['brightness'];
		var WILDTYPE_COLONYID = 'baseline';
        
        
        /*
         * 
         * A temporary fix to map cid to centre logo icon
         */
        var ICONS_DIR = "images/centre_icons/";
        var IMG_DIR = "images/";
        var FEMALE_ICON = "female.png";
        var MALE_ICON = "male.png";
        var HOM_ICON = 'hom.png';
        var HET_ICON = 'het.png';
        var HEMI_ICON = 'het.png';
        var WT_ICON = 'wildtype.png';
        
        var specimenMetaTemplateSource = $("#specimenMetdataTemplate").html();
        
        var centreIcons ={
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
        
        var spinnerOpts = {
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

        
        var monthNames = ["Jan", "Feb", "Mar", "April", "May", "June",
            "July", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        
        
        function beforeLoading(){
            /*
             Create a progress div
             */
            
//            progressDiv = $('#' + viewContainer);
//            progressDiv.append("<div class='iev_progress' id='progress_" + id +   "' ></div>")
            
            
//            var target =  document.getElementById("progressSpin");
//            spinner = new Spinner(spinnerOpts).spin(target);
//            $("#progressMsg").text(msg);   
        
        }
        
        function updateData(volumes){
            /*
             * Chnage the current stage/modality being viewed
             * 
             */
            
            volumeData = volumes;
            replaceVolume(volumeData[Object.keys(volumeData)[0]]['volume_url']);
            updateVolumeSelector();
        }
        
        
        function update(){
            drawScaleBar();
            showMetadata();
        }
        

        function updateVolumeSelector() {
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
            $('#' + vselector)
                    .find('option')
                    .remove()
                    .end();

            // Add the volume options
            var options = [];
            for (var i in volumeData) {
                var url = volumeData[i]['volume_url'];
                var sex = volumeData[i].sex.toLowerCase();
                options.push("<option value='" + url + "' data-class='" + sex + "'>" + basename(url) + "</option>");
            }


            $('#' + vselector)
                    .append(options.join(""));


            $('#' + vselector).iconselectmenu()
                    .iconselectmenu("menuWidget")
                    .addClass("ui-menu-icons customicons");

            $('#' + vselector)
                    .iconselectmenu({
                        change: $.proxy(function (event, ui) {
                            replaceVolume(ui.item.value);
                        }, this)
                    })
                    .iconselectmenu("refresh");
        }
        
        
        
        function showMetadata(){
                     
            var date = new Date(currentVolume.experimentDate)
       
            var displayDate = monthNames[date.getMonth()];
       
            displayDate += " " + date.getDate();
            displayDate += " " + date.getFullYear();
            
            var sexIconPath;
            if (currentVolume.sex.toLowerCase() === 'female'){
               sexIconPath = IMG_DIR + FEMALE_ICON;
            }
            else{
                sexIconPath = IMG_DIR + MALE_ICON;
            }
            
            // Set the zygosity icon for mutants or the 'WT' icon for baselines 
            var zygIconPath;
            var zygIcon;
            
            if (currentVolume.colonyId === WILDTYPE_COLONYID){
                zygIcon = WT_ICON;
            }
            
            else{
                
                switch (currentVolume.zygosity.toLowerCase()){
                    case 'homozygous':
                        console.log('hello');
                        zygIcon = HOM_ICON;
                        break;
                    case 'heterozygous':
                        console.log('hettttt');
                        zygIcon = HET_ICON;
                        break;
                    case 'hemizygous':
                        console.log('hemiiiii');
                        break;
                        zygIcon = HEMI_ICON;
                }
            }
            
            zygIconPath = IMG_DIR + zygIcon;
              
            var centreLogoPath = "";
          
            if (centreIcons.hasOwnProperty(currentVolume.cid)){
                centreLogoPath = ICONS_DIR + centreIcons[currentVolume.cid];
            }
            
            var data = {
                animalId: currentVolume.animalName,
                date: displayDate,
                sexIconPath: sexIconPath,
                zygIconPath: zygIconPath,
                centreLogoPath: centreLogoPath
            };
            
            var template = Handlebars.compile(specimenMetaTemplateSource);
            
            var $metaDataHtml = $(template(data));
            
            //Clear any current metadata
            $("#metadata_" +id).empty();
            $("#metadata_" +id).append($metaDataHtml);
        }
        
        
        function setContrastSlider() {
            /**
             * Makes contrast slider for specimen view
             * @method setContrastSlider
             */
            //console.log(volume.min);
            
            $windowLevel.slider({
                range: true,
                min: parseInt(volume.min),
                max: parseInt(volume.max),
                step: Math.ceil((volume.max - volume.min) / 256),
                values: [ parseInt(volume.windowLow), parseInt(volume.windowHigh) ],
                slide: $.proxy(function (event, ui) {
                    volume.windowLow = ui.values[0];
                    volume.windowHigh = ui.values[1];
                    volume.modified(true);
                }, this)
            });
        }; 

        function screenShot() {
     
            var canvas = xRen._canvas;
            console.log('trwep', canvas);
//            var img    = canvas.toDataURL("image/png");
//            document.write('<img src="'+img+'"/>');
        }

        function reset(){
            /*
             * Resets:
             *  Renderer: undoes the zoom
             *  Set the slice index to the mid-slice
             *  contrast
             *  The scale bar are put back in original place, and redrawn
             *  @method reset
             */
            xRen.resetViewAndRender();
            yRen.resetViewAndRender();
            zRen.resetViewAndRender();
            //Reset the slider position
            var dims = volume.dimensions;
            volume.indexX = Math.floor((dims[0] - 1) / 2);
            volume.indexY = Math.floor((dims[1] - 1) / 2);
            volume.indexZ = Math.floor((dims[2] - 1) / 2);
            $xSlider.slider("value", volume.indexX);
            $ySlider.slider("value", volume.indexY);
            $zSlider.slider("value", volume.indexZ);
            //reset the window level
            $windowLevel.slider("option", "values", [volume.windowLow, volume.windowHigh]);
            
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
                
            update();
        }


        function createHTML() {
            /**
             * Creates the html needed for the specimen view to live in.
             * Uses handlebar.js to generate from templates
             * 
             * @method createHtml
             * 
             */

            var $viewsContainer = $("#" + viewContainer);
            
            if (objSize(volumeData) < 1 && queryColonyId !==  null){
                    return;
            }
            
            var data = {
                id: id
            };
            
            var source   = $("#specimen_view_template").html();
            var template = Handlebars.compile(source);
            
            var $specimenView = $(template(data));
            
            $specimenView.append(controls_tab());
      
            // This defines the order of the orthogonal views
            $specimenView.append(createSliceView('X'));
            $specimenView.append(createSliceView('Y'));
            $specimenView.append(createSliceView('Z'));
           
            var progressSource   = $("#progress_template").html();
            var progressTemplate = Handlebars.compile(progressSource);
            var $progress = $(progressTemplate(data));
           
            $specimenView.append($progress);
            spinner = new Spinner(spinnerOpts).spin();
            //spinner = new Spinner(spinnerOpts).spin($specimenView);
            $progress.find('.ievLoadingMsg').append(spinner.el);
            

            $viewsContainer.append($specimenView);
        }
        
        function progressStop(){
            spinner.stop();
             $("#progressMsg").empty();
        }
        
        
        function createSliceView(orient){
            /**
             * Create the HTML for the elements containing the slice view
             * @param {String} orient Orientation (X, Y or Z)
             */
            
            viewSliceClass = 'slice' + orient;
            
            var data = {
                sliceWrapId: 'sliceWrap_' + orient + '_' + id,
                sliceContainerID: orient + '_' + id,
                viewSliceClasss: viewSliceClass,
                sliderId: 'slider_' + orient + '_'+ id,
                sliderClass: 'slider' + orient,
                orientation: orient,
                id: id,
                scaleId: 'scale_' + orient + id,
                scaleTextId: 'scaletext_' + orient + id
               
            };
            
            var source = $("#slice_view_template").html();
            var template = Handlebars.compile(source);
            return template(data);
        }
        
           
        
        function jQuerySelectors(){
            /**
             * Get Jquery handles on elements that need to be accessed multiple times
             * Should speed things up not having to query the DOM all the time
             * 
             * @method jQuerySelectors
             */
            $xContainer =  $('#X_' + id);
            $yContainer =  $('#Y_' + id);
            $zContainer =  $('#Z_' + id);
            $xSlider = $('#slider_X_'+ id);
            $ySlider = $('#slider_Y_'+ id);
            $zSlider = $('#slider_Z_'+ id);
            $xWrap = $('#sliceWrap_X_' + id);
            $yWrap = $('#sliceWrap_Y_' + id);
            $zWrap = $('#sliceWrap_Z_' + id);
            $windowLevel = $('#' + windowLevel);
        }
        
        

        function controls_tab() {
            /**
             * Use handlebars.js to the controls tab HTML for the specimen view
             * Controls tab contains zoom buttons contrst slider etc.
             * 
             * @method controls_tab
             * 
             */
   
            var data = {
                id: id,
                controlsButtonsId: "controlsButtons_" + id,
                selectorWrapId: "selectorWrap_" + id,
                vselectorId: vselector,
                windowLevelId: windowLevel 
            };
            
            var source   = $("#slice_controls_template").html();
            var template = Handlebars.compile(source);
            return template(data);
        };
        
        
        function zoomIn(){
           xRen.camera.zoomIn(false);
           yRen.camera.zoomIn(false);
           zRen.camera.zoomIn(false);
           drawScaleBar();
        }
        
        function zoomOut(){
            //Prevent over out-zooming
            if (xRen.normalizedScale < 1.0 || yRen.normalizedScale < 1.0 || zRen.normalizedScale < 1.0){
               return false;
            }            
            xRen.camera.zoomOut(false);
            yRen.camera.zoomOut(false);
            zRen.camera.zoomOut(false);
            drawScaleBar();        
            return true;
        }
        
        
        function drawScaleBar() {   
            // After resizing the window or doing a zoomIn or zoomOut, we need to wait for renderer2D to call
            // render_(). Otherwose normalizScale will not have been set
             setTimeout(function () {
                drawScale(yRen, 'scale_' + 'Y' + id, 'scaletext_' + 'Y' + id);
                drawScale(zRen, 'scale_' + 'Z' + id, 'scaletext_' + 'Z' + id);
                drawScale(xRen, 'scale_' + 'X' + id, 'scaletext_' + 'X' + id );
            }, 20);  
        }
        
            
        function drawScale(ren, scaleId, scaleTextId){

            var $scaleouter =  $('.scale_outer_' + id);
            
            if (currentVolume["rescaledPixelsize"] == null ||  currentVolume["rescaledPixelsize"] == 0){
                $scaleouter.hide();
                return;
            }
            $scaleouter.show();
            
            var pixel_size = currentVolume["rescaledPixelsize"]; //for now hard code
            var bar_size_pixels = (scaleBarSize / pixel_size) * ren.normalizedScale;
           
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
        }      
        
              
        function rescale(scale){
            
            scaleBarSize = scale;
            drawScaleBar();
        }
        
         
        function getVolume(){
            
            return volume;
        }
        
        

        function replaceVolume(volumePath) {
            /**
             * Replace current specimen volume with another.
             * Destroys current object (not sure is necessary) add new path and call setupoRenderers
             * 
             * @method replaceVolume
             * @param {String} VolumePath path to new volume to load into viewer
             */
            var data = {
                id: id
            };
            var $specimenView = $('#' + id);
            var progressSource   = $("#progress_template").html();
            var progressTemplate = Handlebars.compile(progressSource);
            var $progress = $(progressTemplate(data));
           
            $specimenView.append($progress);
            spinner = new Spinner(spinnerOpts).spin();
            //spinner = new Spinner(spinnerOpts).spin($specimenView);
            $progress.find('.ievLoadingMsg').append(spinner.el);
            
            if (typeof (xRen) !== 'undefined') {
                xRen.destroy();
                delete xRen;
            }
            if (typeof (yRen) !== 'undefined') {
                yRen.destroy();
                delete yRen;
            }
            if (typeof (zRen) !== 'undefined') {
                zRen.destroy();
                delete zRen;
            }
            if (typeof (volume) !== 'undefined') {
                volume.destroy();
                delete volume;
            }
            
            currentVolume = volumeData[volumePath];
            setupRenderers();
        };
        



        function setupRenderers() {
            /**
             * Call the XTK functions that are required to get our volume rendered in 2D
             * 
             * @method setupRenderers
             */
            ready = false;
            
            if (objSize(volumeData) < 1) return;
            
            xRen = new X.renderer2D();
            xRen.config.PROGRESSBAR_ENABLED = false;
           
          
            
            
            /*
             * Sagittal scaling bug fix.
             * also see fix in X.renderer2D.render_
             */ 
            xRen.firstRender = true;
            
            xRen.afterRender = function(){   
                if (this.firstRender){
                   this.resetViewAndRender();
                   this.firstRender = false;
                   xtk_showtime();
                }
                
                // Set contrast                            
                var lower = parseInt(volume.windowLow);
                if (contrast['lower'] !== null) {
                    lower = Math.max(contrast['lower'], parseInt(volume.windowLow));
                    volume.windowLow = lower;
                    volume.modified(false);
                }

                var upper = parseInt(volume.windowHigh);
                if (contrast['upper'] !== null) {
                    upper = Math.min(contrast['upper'], parseInt(volume.windowHigh));
                    volume.windowHigh = upper;
                    volume.modified(false);
                }
                
                $windowLevel.slider("option", "values", [volume.windowLow, volume.windowHigh]);                               
                                
            };
            
            xRen.onShowtime = function(){   
                // we have to wait before volumes have fully loaded before we
                // can extract intesity information
                setContrastSlider();               
                setReady();
            };
        
            /*
             * 
             */
            
            xRen.container = $xContainer.get(0);
            xRen.orientation = 'X';
            xRen.init();
         
            overrideRightMouse(xRen);

            yRen = new X.renderer2D();
            yRen.config.PROGRESSBAR_ENABLED = false;
            yRen.container = $yContainer.get(0);
            yRen.orientation = 'Y';
            yRen.init();
            overrideRightMouse(yRen);

            zRen = new X.renderer2D();
            zRen.config.PROGRESSBAR_ENABLED = false;
            zRen.container = $zContainer.get(0);
            zRen.orientation = 'Z';
            zRen.init();
            overrideRightMouse(zRen);
            
            
            // create a X.volume
            volume = new X.volume();
            volume.file = currentVolume['volume_url'];
            

            // First we render X. Then X.afterRender() calls the loading and rendering of the others
            xRen.add(volume);
            xRen.render(); 
        };
        
        // Attempting to stop the right mouse zoom functionality
        function overrideRightMouse(ren){
            
            ren.interactor.onMouseDown = function(left, middle, right) {
                // This doesn't override the onMouseDown_ function
                if (right) {
                    console.log('mousy R');
                    return;
                   
                }
            }
        }
        
        function setReady(){
            //remove the progress div
            //
            $('#ievLoading' + id).remove();
            ready = true;
            readyCB();
        }
        
        function isReady(){
            return ready;
        }


        function invertColour(checked) {
            /**
             * Responds to invert color checkbox, and inverts the lookup table
             * 
             * @method invertColour
             * @param {bool} checked Is the checkbox active
             */

            if (!volume)
                return;

            if (checked) {
                volume.maxColor = [0, 0, 0];
                volume.minColor = [1, 1, 1];
                $("#" + id + "> .sliceView").css("background-color", "#FFFFFF");

                volume.indexX++;
                volume.indexY++;
                volume.indexZ++;

            } else {

                volume.maxColor = [1, 1, 1];
                volume.minColor = [0, 0, 0];
                $("#" + id + "> .sliceView").css("background-color", "#000000");

                // Bodge to get the colours to update
                volume.indexX--;
                volume.indexY--;
                volume.indexZ--;
            }
        };
        
        
        
       function sliceChange(id, ortho, index){
           /**
            * Called when the slice index is changed either from the slider of the mouse scroll button
            * 
            * @method sliceChange
            * @param {String} id The ID of the this SpecimenView class
            * @param {String} ortho The orthogonal view that was changed ('X', 'Y', or 'Z')
            */
            if (ortho === 'X') indexCB(id, ortho, index + xOffset );
            else if (ortho === 'Y') indexCB(id, ortho, index + yOffset );
            else if (ortho === 'Z') indexCB(id, ortho, index + zOffset );
       }
       
       
       function setLowPowerState(state){
           /*
            * @param {bool} state. Wheter low power should be turned on or off
            */
           lowPower = state;
       }
          


        function updateSliders(renderer) {
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
                $xSlider.slider("value", volume.indexX);
                $ySlider.slider("value", volume.indexY);
                $zSlider.slider("value", volume.indexZ);
                
                //Set the index in the other linked views
                sliceChange(id, 'X', volume.indexX);
                sliceChange(id, 'Y', volume.indexY);
                sliceChange(id, 'Z', volume.indexZ);
            }
            else if(renderer.interactor.leftButtonDown){
                  $windowLevel.slider("option", "values", [volume.windowLow, volume.windowHigh]);
            }
        }



        function xtk_showtime() {
            /**
             * Gets executed after all files were fully loaded and just before the first rendering attempt.
             * Sets up: Volumes and their index to view, index sliders, and mouse whell events
             * 
             * @method xtk_showtime
             */
            yRen.add(volume);
            yRen.render();
            zRen.add(volume);
            zRen.render();

            var dims = volume.dimensions;           
            
            // Let main know of the new dimensions of the orthogonal views

            // It appears that dimensins are in yxz order. At least with nii loading
            var pos = config['specimen']['pos'];
            volume.indexX = !isNaN(pos['x']) ? pos['x'] : pos['x']; //Math.floor((dims[0] - 1) / 2);
            volume.indexY = !isNaN(pos['y']) ? pos['y'] : pos['y']; //Math.floor((dims[1] - 1) / 2);
            volume.indexZ = !isNaN(pos['z']) ? pos['z'] : pos['z']; //Math.floor((dims[2] - 1) / 2);

            // make the sliders
            $xSlider.slider({
                disabled: false,
                range: "min",
                min: 0,
                max: dims[0] - 1,
                value: volume.indexX,
                slide: function (event, ui) {
                    if (!volume || lowPower) return;
                    volume.indexX = ui.value;
                    sliceChange(id, 'X', volume.indexX);
                }.bind(this),
                stop: function (event, ui){
                    if (volume && lowPower){
                        volume.indexX = ui.value;
                        sliceChange(id, 'X', volume.indexX);
                    }
                }.bind(this)
            });


            $ySlider.slider({
                disabled: false,
                range: "min",
                min: 0,
                max: dims[1] - 1,
                value: volume.indexY,
                slide: function (event, ui) {
                    if (!volume || lowPower) return;
                    volume.indexY = ui.value;
                    sliceChange(id, 'Y', volume.indexY);
                }.bind(this),
                stop: function (event, ui){
                    if (volume && lowPower){
                        volume.indexY = ui.value;
                        sliceChange(id, 'Y', volume.indexY);
                    }
                }.bind(this)
            });


            $zSlider.slider({
                disabled: false,
                range: "min",
                min: 0,
                max: dims[2] - 1,
                value: volume.indexZ,
                slide: function (event, ui) {
                    if (!volume || lowPower) return;
                    volume.indexZ = ui.value;
                    sliceChange(id, 'Z', volume.indexZ);
                }.bind(this),
                stop: function (event, ui){
                    if (volume && lowPower){
                        volume.indexZ = ui.value;
                        sliceChange(id, 'Z', volume.indexZ);
                    }
                }.bind(this)
            });
            
            
           

            // Overload onMouseWheel event to control slice sliders
            xRen.interactor.onMouseWheel = function (event) {
                $xSlider.slider({value: volume.indexX});

                sliceChange(id, 'X', volume.indexX);
            }.bind(this);

            yRen.interactor.onMouseWheel = function (event) {
                $ySlider.slider({value: volume.indexY});
                sliceChange(id, 'Y', volume.indexY);
            }.bind(this);

            zRen.interactor.onMouseWheel = function (event) {
                $zSlider.slider({value: volume.indexZ});
                sliceChange(id, 'Z', volume.indexZ);
            }.bind(this);

             
            /*
             * Link the cross-hairs between the spacimen views
             */
             
            // Overload sliceX mouse moved
            xRen.interactor.onMouseMove = function (event) {
                updateSliders(xRen, event);
            }.bind(this);

            // Overload yRen mouse moved
            yRen.interactor.onMouseMove = function (event) {
                updateSliders(yRen, event);
            }.bind(this);

            // Overload zRen mouse moved
            zRen.interactor.onMouseMove = function (event) {
                updateSliders(zRen, event);
            }.bind(this);
            
            //TODO: overload right click zoom. Do not want
            yRen.interactor.rightButtonDown = function () {
            };
            
            update();
         
        };
        
        
        function setXindex(index){
            /**
             * Set the volume index for the X orientation
             * Apply the offset used in linking orthogonal views across SpecimenViews
             * @method setIndex
             * @param {int} index The new slice index to set
             */
             volume.indexX = index -xOffset;
             $xSlider.slider("value", volume.indexX);
        }
        
        
        function setYindex(index){
            /**
             * Set the volume index for the Y orientation
             * Apply the offset used in linking orthogonal views across SpecimenViews
             * @method setIndex
             * @param {int} index The new slice index to set
             */
          
             volume.indexY = index - yOffset;
             $ySlider.slider("value", volume.indexY);
        };
        
        function setZindex(index){
            /**
             * Set the volume index for the Z orientation
             * Apply the offset used in linking orthogonal views across SpecimenViews
             * @method setIndex
             * @param {int} index The new slice index to set
             */
            
             volume.indexZ = index - zOffset;
             $zSlider.slider("value", volume.indexZ);
        }
        
        function getBrightnessLower() { 
            return volume.windowLow;
        }
        
        function getBrightnessUpper() { 
            return volume.windowHigh;
        }   
        
        function getIndex(ortho){
            /**
             * Get the index of the current slice for a orthogonal view
             * @method getIndex
             * @param {String} ortho Orthogonal view ('X', 'Y' or 'Z')
             */
            if (ortho === 'X') return volume.indexX;
            if (ortho === 'Y') return volume.indexY;
            if (ortho === 'Z') return volume.indexZ;
        }
       
        function setIdxOffset(ortho, offset){
            /**
             * Set the index offset for a specific orthogonal view.
             * The offset defines how much the slice index differs compared to the corresponding slice in the
             * other view
             * @method setIdxOffset
             * @param {String} ortho Orthogonal view ('X', 'Y' or 'Z')
             * @param {int} offset slice index offset
             */
            if (ortho === 'X') xOffset = offset;
            if (ortho === 'Y') yOffset = offset;
            if (ortho === 'Z') zOffset = offset;
        }
        
        
        function getDimensions(){
            /**
             * Get the dimensions of the current volume
             * @method getDimensions
             * @return {Array<int>} XYZ dimensions of the current volume
             */
            return volume.dimensions;
        }
        
        function getCurrentVolume(){
            /*
             * Return the data for the currently viewd image
             */
            return currentVolume;
        }     

        function setVisibleViews(viewList, count, horizontalView) {
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
                $xWrap.show();
                $xWrap.width(slice_view_width + '%');

            } else {
                $xWrap.hide();
            }

            if (viewList['Y'].visible) {
                $yWrap.show();
                $yWrap.width(slice_view_width + '%');
           
            } else {
                $yWrap.hide();
            }

            if (viewList['Z'].visible) {
                $zWrap.show();
                $zWrap.width(slice_view_width + '%');
          
            } else {
                $zWrap.hide();
            }
        }


        function basename(path) {
            /**
             * Extract the basename from a path
             * @method basename
             * @param {String} path File path
             */
            return path.split(/[\\/]/).pop();
        };
        
        function objSize(obj) {
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


        var public_interface = {
            /**
             * The public interface for this class.
             * refernce public methods in here
             * @type {Object}
             */
            setVisibleViews: setVisibleViews,
            setXindex: setXindex,
            setYindex: setYindex,
            setZindex: setZindex,
            getIndex: getIndex,
            getBrightnessLower: getBrightnessLower,
            getBrightnessUpper: getBrightnessUpper,
            id: id,
            setIdxOffset: setIdxOffset,
            getDimensions: getDimensions,
            rescale: rescale,
            getVolume: getVolume,
            updateData: updateData,
            zoomIn: zoomIn,
            zoomOut: zoomOut,
            reset: reset,
            invertColour: invertColour,
            setLowPowerState: setLowPowerState,
            isReady: isReady,
            getCurrentVolume: getCurrentVolume,
            screenShot: screenShot
          
        };
        
        beforeLoading();
        createHTML();
        updateVolumeSelector();
        jQuerySelectors();
        setupRenderers();
        //createEventHandlers();
        drawScaleBar();
        
        return public_interface;
    }

    dcc.SpecimenView = SpecimenView;
})();
