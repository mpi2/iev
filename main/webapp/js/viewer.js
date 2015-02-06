goog.require('X.renderer2D');
goog.require('X.interactor2D');



function Slices(volPath, id, container, sliceChange) {
    //:param finished_callback function what to call when fisinshed rendering

    this.sliceChange = sliceChange;
    //this.finished_callback = finished_cb;
    this.id = id;
    this.view_container = container;
    this.volPath = volPath;



    var Xcontainer = 'X_' + this.id;
    var Ycontainer = 'Y_' + this.id;
    var Zcontainer = 'Z_' + this.id;

    var x_xtk;
    var y_xtk;
    var z_xtk;
    var x_slider;
    var y_slider;
    var z_slider;
    var volume;
    var controlsVisible = false;
    this.specimenSelector = undefined;


    this.setSlices = function (idxX, idxY, idxZ) {
        // called from main
        volume.indexX = idxX;
        volume.indexY = idxY;
        volume.indexZ = idxZ;
    };

    this.setXslice = function (idxX) {
        volume.indexX = idxX;
    };

    this.setYslice = function (idxY) {
        volume.indexY = idxY;
    };

    this.setZslice = function (idxZ) {
        volume.indexZ = idxZ;
    };


//    this.onWheelScroll = function () {
//        $('#' + this.x_slider_id).slider('value', volume.indexX);
//        $('#' + this.y_slider_id).slider('value', volume.indexY);
//        $('#' + this.z_slider_id).slider('value', volume.indexZ);
//        this.sliceChange();
//    };


    this.setDisplayOrientation = function () {
        // h or v : horizontal/vertiacl
        // This mght not be needed. Maybe just some css tweeks
        return;
    };


    this.controls_tab = function () {
        // NH. this is horendous. Should I use templating or some other way of accessing the buttons on this object

        this.controlsPane = 'pane_' + this.id;
        this.invertColours = 'invert_colours_' + this.id;
        this.windowLevel = 'windowLevel_' + this.id;
        this.reset = 'reset_' + this.id;
        this.zoomIn = 'zoomIn_' + this.id;
        this.zoomOut = 'zoomOut_' + this.id;

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



    this.createEventHandlers = function () {
        
        $("#" + this.controlsPane).click(function (e) {
            if (!controlsVisible) {
                $(this).animate({
                    'marginLeft': '0px'
                }, 500);
                controlsVisible = true;
            } else {
                if (controlsVisible) {
                    console.log(e.target.className);

                    if (e.target.className === 'ui-button-text')
                        return;
                    $(this).animate({
                        'marginLeft': '-180px'
                    }, 500);
                    controlsVisible = false;
                }
            }
        });
        
        
        // Invert the color map 
        $("#" + this.invertColours).change($.proxy(function (e) {
            this.invertColour(e.target.checked);
        }, this));

        
        
        $("#" + this.windowLevel).slider({
            range: true,
            min: parseInt(volume.windowLow),
            max: parseInt(volume.windowHigh),
            min: 0,
                    max: 256,
                    step: 1,
            //values: [ parseInt(volume.windowLow), parseInt(volume.windowHigh) ],
            values: [0, 200],
            slide: function (event, ui) {
                volume.windowLow = ui.values[0];
                volume.windowHigh = ui.values[1];
                volume.modified(true);
            }
        });


        $("#" + this.reset)
            .button()
            .click($.proxy(function (event) {
                var e = new X.event.ResetViewEvent();
                this.sliceX.interactor.dispatchEvent(e);
                this.sliceY.interactor.dispatchEvent(e);
                this.sliceZ.interactor.dispatchEvent(e);
                $("#windowLevel").slider("option", "values", [volume.windowLow, volume.windowHigh]);

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

    };



    this.createHTML = function () {
        // Create the html for this specimen orthogonal views. 

        var viewsContainer = $("#" + this.view_container);

        this.x_slider_id = 'slider_x_' + this.id;
        this.y_slider_id = 'slider_y_' + this.id;
        this.z_slider_id = 'slider_z_' + this.id;

        x_slider = $("<div id='" + this.x_slider_id + "' class ='sliderX slider'></div>");
        y_slider = $("<div id='" + this.y_slider_id + "' class ='sliderY slider'></div>");
        z_slider = $("<div id='" + this.z_slider_id + "' class ='sliderZ slider'></div>");

        x_xtk = $("<div id='X" + Xcontainer + "' class='sliceX sliceView'></div>");
        x_xtk.append(x_slider);
        y_xtk = $("<div id='Y" + Ycontainer + "' class='sliceY sliceView'></div>");
        y_xtk.append(y_slider);
        z_xtk = $("<div id='Z" + Zcontainer + "' class='sliceZ sliceView'></div>");
        z_xtk.append(z_slider);

        var specimen_view = $("<div id='" + this.id + "' class='specimen_view'></div>");

        specimen_view.append([x_xtk, this.x_slider]);
        specimen_view.append([y_xtk, this.y_slider]);
        specimen_view.append([z_xtk, this.z_slider]);
        specimen_view.append(this.controls_tab());

        viewsContainer.append(specimen_view);
    };



    this.setup_renderers = function (container) {

        this.sliceX = new X.renderer2D();
        this.sliceX.container = x_xtk.get(0);
        this.sliceX.orientation = 'X';
        this.sliceX.init();

        this.sliceY = new X.renderer2D();
        this.sliceY.container = y_xtk.get(0);
        this.sliceY.orientation = 'Y';
        this.sliceY.init();

        this.sliceZ = new X.renderer2D();
        this.sliceZ.container = z_xtk.get(0);
        this.sliceZ.orientation = 'Z';
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

        this.sliceX.onResize_ = function () {
            console.log('computing end');
        };

        this.sliceX.render();

        this.sliceX.onShowtime = this.xtk_showtime;

        this.createEventHandlers();


    };


    this.invertColour = function (checked) {

        if (!volume)
            return;


        if (checked) {
            volume.maxColor = [0, 0, 0];
            volume.minColor = [1, 1, 1];
            $("#" + this.id + "> .sliceView").css("background-color", "#FFFFFF");

            volume.indexX++;
            volume.indexY++;
            volume.indexZ++;

        } else {

            volume.maxColor = [1, 1, 1];
            volume.minColor = [0, 0, 0];
            $("#" + this.id + "> .sliceView").css("background-color", "#000000");

            // Bodge to get the colours to update
            volume.indexX--;
            volume.indexY--;
            volume.indexZ--;

        }
    };


    this.updateSliders = function (_slice) {

        windowLevelEvent = _slice._interactor.leftButtonDown;
        crosshairEvent = _slice._interactor._shiftDown;

        if (windowLevelEvent) {
            $("#windowLevel").slider("option", "values", [volume.windowLow, volume.windowHigh]);
        } else if (crosshairEvent) {
            $("#sliderX").slider("value", volume.indexX);
            $("#sliderY").slider("value", volume.indexY);
            $("#sliderZ").slider("value", volume.indexZ);
        }

    }



    this.xtk_showtime = function () {
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
            "disabled": false,
            range: "min",
            min: 0,
            max: dims[0] - 1,
            value: volume.indexX,
            slide: function (event, ui) {
                if (!volume) {
                    return;
                }
                volume.indexX = ui.value;
                this.sliceChange(this.id, 'x', volume.indexX);
            }.bind(this)
        });


        $("#" + this.y_slider_id).slider({
            "disabled": false,
            range: "min",
            min: 0,
            max: dims[1] - 1,
            value: volume.indexY,
            slide: function (event, ui) {
                if (!volume) {
                    return;
                }
                volume.indexY = ui.value;
                this.sliceChange(this.id, 'y', volume.indexY);
            }.bind(this)
        });


        $("#" + this.z_slider_id).slider({
            "disabled": false,
            range: "min",
            min: 0,
            max: dims[2] - 1,
            value: volume.indexZ,
            slide: function (event, ui) {
                if (!volume) {
                    return;
                }
                volume.indexZ = ui.value;
                this.sliceChange(this.id, 'z', volume.indexZ);
            }.bind(this)
        });

        // Overload onMouseWheel event to control sliders
        this.sliceX._interactor.onMouseWheel = function (event) {

            var oldValue = x_slider.slider("option", "value");
            var sign = event.deltaY ? event.deltaY < 0 ? -1 : 1 : 0
            x_slider.slider({value: oldValue + sign});
            this.sliceChange(this.id, 'x', volume.indexX);
        }.bind(this)

        this.sliceY._interactor.onMouseWheel = function (event) {

            var oldValue = y_slider.slider("option", "value");
            var sign = event.deltaY ? event.deltaY < 0 ? -1 : 1 : 0
            y_slider.slider({value: oldValue + sign});
            this.sliceChange(this.id, 'y', volume.indexY);
        }.bind(this)

        this.sliceZ._interactor.onMouseWheel = function (event) {

            var oldValue = z_slider.slider("option", "value");
            var sign = event.deltaY ? event.deltaY < 0 ? -1 : 1 : 0
            z_slider.slider({value: oldValue + sign});
            this.sliceChange(this.id, 'z', volume.indexZ);
        }.bind(this)


        // Overload sliceX mouse moved
        this.sliceX._interactor.onMouseMove = function (event) {
            this.updateSliders(this.sliceX);
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
}