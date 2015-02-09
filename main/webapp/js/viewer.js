goog.require('X.renderer2D');
goog.require('X.interactor2D');


(function () {
    if (typeof dcc === 'undefined')
        dcc = {};
    
    
function Slices(volumePaths, id, container, sliceChange) {
    //:param finished_callback function what to call when fisinshed rendering

    this.sliceChange = sliceChange;
    this.id = id;
    this.view_container = container;
    this.volumePaths = volumePaths;
    this.currentVolumePath = volumePaths[0];
    
    this.Xcontainer = 'X_' + id;
    this.Ycontainer = 'Y_' + id;
    this.Zcontainer = 'Z_' + id;
//
    this.x_xtk;
    this.y_xtk;
    this.z_xtk;
    this.x_slider;
    this.y_slider;
    this.z_slider;
    this.sliceX;
    this.sliceY;
    this.sliceZ;
    
    
    this.volume;
    this.controlsVisible = false;
    this.specimenSelector = undefined;
    
    this.controlsPane = 'pane_' + id;
    this.invertColours = 'invert_colours_' + id;
    this.windowLevel = 'windowLevel_' + id;
    this.reset = 'reset_' + id;
    this.zoomIn = 'zoomIn_' + id;
    this.zoomOut = 'zoomOut_' + id;
    this.selectorWrap = 'selectorWrap_' + id;
    this.vselector = 'volumeSelector_' + id;
    
    




    this.setSlices = function(idxX, idxY, idxZ) {
        // called from main
        this.volume.indexX = idxX;
        this.volume.indexY = idxY;
        this.volume.indexZ = idxZ;
    };

    this.setXslice = function(idxX) {
        this.volume.indexX = idxX;
    };

    this.setYslice = function(idxY) {
        this.volume.indexY = idxY;
    };

    this.setZslice = function(idxZ) {
        this.volume.indexZ = idxZ;
    };


//    this.onWheelScroll = function () {
//        $('#' + this.x_slider_id).slider('value', this.volume.indexX);
//        $('#' + this.y_slider_id).slider('value', this.volume.indexY);
//        $('#' + this.z_slider_id).slider('value', this.volume.indexZ);
//        this.sliceChange();
//    };


    this.setDisplayOrientation = function() {
        // h or v : horizontal/vertiacl
        // This mght not be needed. Maybe just some css tweeks
        return;
    };



    this.createEventHandlers = function() {
        
       
        $("#" + this.controlsPane).click(function (e) {
            if (!this.controlsVisible) {
                $(this).animate({
                    'marginLeft': '0px'
                }, 500);
                this.controlsVisible = true;
            } else {
                if (this.controlsVisible) {
                  

                    if (e.target.className === 'ui-button-text')
                        return;
                    $(this).animate({
                        'marginLeft': '-250px'
                    }, 500);
                    this.controlsVisible = false;
                }
            }
        });
        
        
        // Invert the color map 
        $("#" + this.invertColours).change($.proxy(function (e) {
            this.invertColour(e.target.checked);
        }, this));

        
        
        $("#" + this.windowLevel).slider({
            range: true,
            min: parseInt(this.volume.windowLow),
            max: parseInt(this.volume.windowHigh),
            min: 0,
                    max: 256,
                    step: 1,
            //values: [ parseInt(this.volume.windowLow), parseInt(this.volume.windowHigh) ],
            values: [0, 200],
            slide: function (event, ui) {
                this.volume.windowLow = ui.values[0];
                this.volume.windowHigh = ui.values[1];
                this.volume.modified(true);
            }
        });


        $("#" + this.reset)
            .button()
            .click($.proxy(function (event) {
                var e = new X.event.ResetViewEvent();
                this.sliceX.interactor.dispatchEvent(e);
                this.sliceY.interactor.dispatchEvent(e);
                this.sliceZ.interactor.dispatchEvent(e);
                $("#windowLevel").slider("option", "values", [this.volume.windowLow, this.volume.windowHigh]);

            }, this));
            
            
            
        $("#" + this.zoomIn)
            .button()
            .click($.proxy(function( event ) {
               this.sliceX.camera.zoomIn(false);
               this.sliceY.camera.zoomIn(false);
               this.sliceZ.camera.zoomIn(false);
            }, this));



        $("#" + this.zoomOut)
            .button()
            .click($.proxy(function( event ) {
               this.sliceX.camera.zoomOut(false);
               this.sliceY.camera.zoomOut(false);
               this.sliceZ.camera.zoomOut(false);
            }, this));

        
        
        // Add the volume options
    
       var options = []; 
       for (i = 0; i < this.volumePaths.length; i++){ 
                  
            options.push("<option value='" + this.volumePaths[i]  +"'>" + this.basename(this.volumePaths[i]) + "</option>");
        }
       
      // TODO: Wire this up to loading a new this.volume
       $('#' + this.vselector)
       .append(options.join(""))

                .selectmenu({ 
                change: $.proxy(function( event, ui ) {
               this.replaceVolume(ui.item.value);
               }, this)
            });
       

    }; //createEventHandlers

    this.createHTML = function() {
        // Create the html for this specimen orthogonal views. 

        var viewsContainer = $("#" + this.view_container);

        this.x_slider_id = 'slider_x_' + this.id;
        this.y_slider_id = 'slider_y_' + this.id;
        this.z_slider_id = 'slider_z_' + this.id;

        this.x_slider = $("<div id='" + this.x_slider_id + "' class ='sliderX slider'></div>");
        this.y_slider = $("<div id='" + this.y_slider_id + "' class ='sliderY slider'></div>");
        this.z_slider = $("<div id='" + this.z_slider_id + "' class ='sliderZ slider'></div>");

        this.x_xtk = $("<div id='X" + this.Xcontainer + "' class='sliceX sliceView'></div>");
        this.x_xtk.append(this.x_slider);
        this.y_xtk = $("<div id='Y" + this.Ycontainer + "' class='sliceY sliceView'></div>");
        this.y_xtk.append(this.y_slider);
        this.z_xtk = $("<div id='Z" + this.Zcontainer + "' class='sliceZ sliceView'></div>");
        this.z_xtk.append(this.z_slider);

        var specimen_view = $("<div id='" + this.id + "' class='specimen_view'></div>");
        specimen_view.append("<div id='controls2" + this.id + "' class='controls2'></div>")

        specimen_view.append(this.x_xtk);
        specimen_view.append(this.y_xtk);
        specimen_view.append(this.z_xtk);
        specimen_view.append(this.controls_tab());
        
   
        viewsContainer.append(specimen_view);
    };
    
      this.controls_tab = function() {
      
       
        // NH. Do not like. Should I use templating to generate this HTML?

        controlsHTML =
                '<div id="' + this.controlsPane + '"' + 'class="pane"' + '>' +
                    '<div id="controls_' + this.id + '">' +
                        '<input type="checkbox" id="' + this.invertColours + '" class="button">' +
                        '<label for="invert_colours_' + this.id + '">Invert colours</label>' +
                        '<div id="zooming_' + this.id + '">' +
                            '<a id="' + this.zoomIn + '" href="#" class="button">+</a>' +
                            '<a id="' + this.zoomOut + '" href="#" class="button">-</a>' +
                        '</div>' +
                        '<a id ="' + this.reset +'" href="#" class="button">Reset</a>' +
                        '<div id="' + this.windowLevel + '"></div>' +
                       
                    '</div></div>';


        //Add the styling       
        $("#invert_colours_" + this.id).button();
        $("#zoomIn_" + this.id).button();
    


        return controlsHTML;
    };
    
    this.makeVolumeSelector(){
         '<div id="' + this.selectorWrap + 
                        '"><select id="' + this.vselector + '" class ="volselector"></select>'+  

    }

    
    

    this.replaceVolume = function(volumePath){
        this.currentVolumePath = volumePath;
        this.setupRenderers();
    };
    
    

    this.setupRenderers = function(container) {
        
        if (typeof(this.sliceX) !== 'undefined'){
            this.sliceX.destroy();
        }
        if (typeof(this.sliceY) !== 'undefined'){
            this.sliceY.destroy();
        }
        if (typeof(this.sliceZ) !== 'undefined'){
            this.sliceZ.destroy();
        }

        this.sliceX = new X.renderer2D();
        this.sliceX.container = this.x_xtk.get(0);
        this.sliceX.orientation = 'X';
        this.sliceX.init();

        this.sliceY = new X.renderer2D();
        this.sliceY.container = this.y_xtk.get(0);
        this.sliceY.orientation = 'Y';
        this.sliceY.init();

        this.sliceZ = new X.renderer2D();
        this.sliceZ.container = this.z_xtk.get(0);
        this.sliceZ.orientation = 'Z';
        this.sliceZ.init();

        //
        // THE VOLUME DATA
        //
        // create a X.volume
        this.volume = new X.volume();
        this.volume.file = this.currentVolumePath;
        console.log('jhgygu ' + this.volume.file);

        this.sliceX.add(this.volume);

        // We need to catch events that might change the slice, then pass taht to main
        // Navigation, slider shift, wheel scrolling and zoom
        // Naviagtion has a problem that it fires even when not moving the cross-hairs

        this.sliceX.onResize_ = function () {
            console.log('computing end');
        };

        this.sliceX.render();

        this.sliceX.onShowtime = this.xtk_showtime;

        this.createEventHandlers();


    };


    this.invertColour = function(checked) {

        if (!this.volume)
            return;


        if (checked) {
            this.volume.maxColor = [0, 0, 0];
            this.volume.minColor = [1, 1, 1];
            $("#" + id + "> .sliceView").css("background-color", "#FFFFFF");

            this.volume.indexX++;
            this.volume.indexY++;
            this.volume.indexZ++;

        } else {

            this.volume.maxColor = [1, 1, 1];
            this.volume.minColor = [0, 0, 0];
            $("#" + id + "> .sliceView").css("background-color", "#000000");

            // Bodge to get the colours to update
            this.volume.indexX--;
            this.volume.indexY--;
            this.volume.indexZ--;

        }
    };


    this.updateSliders = function (_slice) {

        var windowLevelEvent = _slice._interactor.leftButtonDown;
        var crosshairEvent = _slice._interactor._shiftDown;

        if (windowLevelEvent) {
            $("#windowLevel").slider("option", "values", [this.volume.windowLow, this.volume.windowHigh]);
        } else if (crosshairEvent) {
            $("#sliderX").slider("value", this.volume.indexX);
            $("#sliderY").slider("value", this.volume.indexY);
            $("#sliderZ").slider("value", this.volume.indexZ);
        }

    };



    this.xtk_showtime = function () {
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
            disabled: false,
            range: "min",
            min: 0,
            max: dims[0] - 1,
            value: this.volume.indexX,
            slide: function (event, ui) {
                if (!this.volume) {
                    return;
                }
                this.volume.indexX = ui.value;
                sliceChange(this.id, 'x', this.volume.indexX);
            }.bind(this)
        });


        $("#" + this.y_slider_id).slider({
            disabled: false,
            range: "min",
            min: 0,
            max: dims[1] - 1,
            value: this.volume.indexY,
            slide: function (event, ui) {
                if (!this.volume) {
                    return;
                }
                this.volume.indexY = ui.value;
                this.sliceChange(this.id, 'y', this.volume.indexY);
            }.bind(this)
        });


        $("#" + this.z_slider_id).slider({
            disabled: false,
            range: "min",
            min: 0,
            max: dims[2] - 1,
            value: this.volume.indexZ,
            slide: function (event, ui) {
                if (!this.volume) {
                    return;
                }
                this.volume.indexZ = ui.value;
                this.sliceChange(this.id, 'z', this.volume.indexZ);
            }.bind(this)
        });

        // Overload onMouseWheel event to control sliders
        this.sliceX._interactor.onMouseWheel = function (event) {

            var oldValue = this.x_slider.slider("option", "value");
            var sign = event.deltaY ? event.deltaY < 0 ? -1 : 1 : 0
            this.x_slider.slider({value: oldValue + sign});
            this.sliceChange(this.id, 'x', this.volume.indexX);
        }.bind(this)

        this.sliceY._interactor.onMouseWheel = function (event) {

            var oldValue = this.y_slider.slider("option", "value");
            var sign = event.deltaY ? event.deltaY < 0 ? -1 : 1 : 0
            this.y_slider.slider({value: oldValue + sign});
            this.sliceChange(this.id, 'y', this.volume.indexY);
        }.bind(this)

        this.sliceZ._interactor.onMouseWheel = function (event) {

            var oldValue = this.z_slider.slider("option", "value");
            var sign = event.deltaY ? event.deltaY < 0 ? -1 : 1 : 0
            this.z_slider.slider({value: oldValue + sign});
            this.sliceChange(this.id, 'z', this.volume.indexZ);
        }.bind(this)


        // Overload sliceX mouse moved
        this.sliceX._interactor.onMouseMove = function (event) {
            this.updateSliders(this.sliceX);
            if (event.cntrlKey){
               console.log('ppppppp');
            }
            
            
        }.bind(this);

        // Overload sliceY mouse moved
        this.sliceY._interactor.onMouseMove = function (event) {
            this.updateSliders(this.sliceY);
        }.bind(this);

        // Overload sliceZ mouse moved
        this.sliceZ._interactor.onMouseMove = function (event) {
            this.updateSliders(this.sliceZ);
        }.bind(this);


        //this.finished_callback(); // Create the next specimen view if required

    }.bind(this);



    this.setVisibleViews = function (viewList, count) {
        //ViewList: Hash
        //var slice_view_width = String(100 / total_visible);
        //Calcualte new with of each orthogonal view
        console.log('here');
        var slice_view_width = String(100 / count);

        if (viewList['X']) {
            x_xtk.show();
            x_xtk.width(slice_view_width + '%');
            x_xtk.width(slice_view_width + '%');

        } else {
            x_xtk.hide();

        }

        if (viewList['Y']) {
            y_xtk.show();
            y_xtk.width(slice_view_width + '%');
            y_xtk.width(slice_view_width + '%');
        } else {
            y_xtk.hide();
        }

        if (viewList['Z']) {
            z_xtk.show();
            z_xtk.width(slice_view_width + '%');
            z_xtk.width(slice_view_width + '%');
        } else {
            z_xtk.hide();
        }


    }.bind(this);


    this.cameraZoomIn = function () {
        this.sliceX.camera.zoomIn(false);
        this.sliceY.camera.zoomIn(false);
        this.sliceZ.camera.zoomIn(false);
    };

    this.cameraZoomOut = function () {
        this.sliceX.camera.zoomOut(false);
        this.sliceY.camera.zoomOut(false);
        this.sliceZ.camera.zoomOut(false);
    };

    this.resetView = function (X_event) {
        this.sliceX.interactor.dispatchEvent(X_event);
        this.sliceY.interactor.dispatchEvent(X_event);
        this.sliceZ.interactor.dispatchEvent(X_event);
    };

    this.destroy = function () {
        // Delete the html 
    };

    this.basename = function(path){
        return path.split(/[\\/]/).pop();
    };
    }

    dcc.SpecimenView = Slices;
})();