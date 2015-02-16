goog.require('X.renderer2D');
goog.require('X.interactor2D');


(function () {
    if (typeof dcc === 'undefined')
        dcc = {};


    function Slices(volumePaths, id, container) {

        var id = id;
        var viewContainer = container;
        var volumePaths = volumePaths;
        var currentVolumePath = volumePaths[0];

        var $xContainer;
        var $yContainer;
        var $zContainer;
        var $xSlider;
        var $ySlider;
        var $zSlider;
        var xRen;
        var yRen;
        var zRen;

        var volume;
        var controlsVisible = false;
        var ctrlDown = false;

        var invertColours = 'invert_colours_' + id;
        var windowLevel = 'windowLevel_' + id;
        var $windowLevel;
        var reset = 'reset_' + id;
        var zoomIn = 'zoomIn_' + id;
        var zoomOut = 'zoomOut_' + id;
        var vselector = 'volumeSelector_' + id;


        function createEventHandlers() {

            $("#pane_" + id).click(function (e) {
                if (!controlsVisible) {
                    $(this).animate({
                        'marginLeft': '0px'
                    }, 500);
                    controlsVisible = true;
                } else {
                    if (controlsVisible) {

                        if (e.target.className === 'ui-button-text')
                            return;
                        $(this).animate({
                            'marginLeft': '-250px'
                        }, 500);
                        controlsVisible = false;
                    }
                }
            });


            // Invert the color map 
            $("#" + invertColours).change($.proxy(function (e) {
                invertColour(e.target.checked);
            }, this));

            
            $windowLevel = $('#' + windowLevel);
            
            $windowLevel.slider({
                range: true,
                min: parseInt(volume.windowLow),
                max: parseInt(volume.windowHigh),
                min: 0, // TODO: remove hard coding
                max: 256,
                step: 1,
                //values: [ parseInt(volume.windowLow), parseInt(volume.windowHigh) ],
                values: [0, 200],
                slide: $.proxy(function (event, ui) {
                    volume.windowLow = ui.values[0];
                    volume.windowHigh = ui.values[1];
                    volume.modified(true);
                }, this)
            });


            $("#" + reset)
            .button()
            .click($.proxy(function (event) {
                var e = new X.event.ResetViewEvent();
                xRen.interactor.dispatchEvent(e);
                yRen.interactor.dispatchEvent(e);
                zRen.interactor.dispatchEvent(e);
                $windowLevel.slider("option", "values", [volume.windowLow, volume.windowHigh]);

            }, this));



            $("#" + zoomIn)
            .button()
            .click($.proxy(function (event) {
                xRen.camera.zoomIn(false);
                yRen.camera.zoomIn(false);
                zRen.camera.zoomIn(false);
            }, this));



            $("#" + zoomOut)
            .button()
            .click($.proxy(function (event) {
                xRen.camera.zoomOut(false);
                yRen.camera.zoomOut(false);
                zRen.camera.zoomOut(false);
            }, this));

            // Add the volume options

            var options = [];
            for (i = 0; i < volumePaths.length; i++) {

                options.push("<option value='" + volumePaths[i] + "'>" + basename(volumePaths[i]) + "</option>");
            }

           
            $('#' + vselector)
            .append(options.join(""))

            .selectmenu({
                width: 200,
                height: 20,
                change: $.proxy(function (event, ui) {
                    replaceVolume(ui.item.value);
                }, this)
            });
        }
        ; 


        function createHTML () {
            // Create the html for this specimen orthogonal views. 

            var $viewsContainer = $("#" + viewContainer);
            var XcontainerID = 'X_' + id;
            var YcontainerID = 'Y_' + id;
            var ZcontainerID = 'Z_' + id;

            var xSliderID = 'slider_x_' + id;
            var ySliderID = 'slider_y_' + id;
            var zSliderID = 'slider_z_' + id;

            $xSlider = $("<div id='" + xSliderID + "' class ='sliderX slider'></div>");
            $ySlider = $("<div id='" + ySliderID + "' class ='sliderY slider'></div>");
            $zSlider = $("<div id='" + zSliderID + "' class ='sliderZ slider'></div>");

            $xContainer = $("<div id='X" + XcontainerID + "' class='sliceX sliceView'></div>");
            $xContainer.append($xSlider);
            $yContainer = $("<div id='Y" + YcontainerID + "' class='sliceY sliceView'></div>");
            $yContainer.append($ySlider);
            $zContainer = $("<div id='Z" + ZcontainerID + "' class='sliceZ sliceView'></div>");
            $zContainer.append($zSlider);

            var $specimenView = $("<div id='" + id + "' class='specimen_view'></div>");
            $specimenView.append(controls_tab());
            $specimenView.append($xContainer);
            $specimenView.append($yContainer);
            $specimenView.append($zContainer);

            $viewsContainer.append($specimenView);
        };


        function controls_tab() {
            // NH. Do not like. Should I use templating to generate this HTML?

            var selectorWrap = 'selectorWrap_' + id;

            controlsHTML =
                    '<div id="controls_' + id + '" class="controls clear">' +
                    '<span id="controlsButtons_' + id + '" class="controlsButtons">' +
                    '<input type="checkbox" id="' + invertColours + '" class="button">' +
                    '<label for="invert_colours_' + id + '">Invert colours</label>' +
                    '<a id="' + zoomIn + '" href="#" class="button">+</a>' +
                    '<a id="' + zoomOut + '" href="#" class="button">-</a>' +
                    '<a id ="' + reset + '" href="#" class="button">Reset</a>' +
                    '</span>' +
                    '<div class="selectorWrap" id="' + selectorWrap + '">' +
                    '<select id="' + vselector + '" class ="volselector"></select>' +
                    '</div>' +
                    '<div class="wlwrap">' +
                    '<div id="' + windowLevel + '" class="windowLevel"></div>' +
                    '</div>'

            '</div>';

            //Add the styling       
            $("#invert_colours_" + id).button();
            $("#zoomIn_" + id).button();

            return controlsHTML;
        }
        ;


        function replaceVolume(volumePath) {
            //TODO. Memory is not being released wehen we delete renderer
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
            currentVolumePath = volumePath;
            setupRenderers();
        }
        ;


        function setupRenderers(container) {


            xRen = new X.renderer2D();
            xRen.container = $xContainer.get(0);
            xRen.orientation = 'X';
            xRen.init();

            yRen = new X.renderer2D();
            yRen.container = $yContainer.get(0);
            yRen.orientation = 'Y';
            yRen.init();

            zRen = new X.renderer2D();
            zRen.container = $zContainer.get(0);
            zRen.orientation = 'Z';
            zRen.init();

            //
            // THE VOLUME DATA
            //
            // create a X.volume
            volume = new X.volume();
            volume.file = currentVolumePath;

            xRen.add(volume);

            // We need to catch events that might change the slice, then pass taht to main
            // Navigation, slider shift, wheel scrolling and zoom
            // Naviagtion has a problem that it fires even when not moving the cross-hairs

            xRen.render();

            xRen.onShowtime = xtk_showtime;

            createEventHandlers();
        }
        ;


        function invertColour(checked) {

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
        }
        ;


        function updateSliders(_slice, event) {
            
            if (event.ctrlKey){
                ctrlDown = true;
                //console.log(_slice._interactor.mousePosition);
                console.log(_slice.camera.position);
                console.log(event);
                _slice.camera.pan([10, 10]);
            }
            else{
                ctrlDown = false;
            }

            if (_slice._interactor.leftButtonDown) {
                $("#windowLevel").slider("option", "values", [volume.windowLow, volume.windowHigh]);
            } else if (_slice._interactor._shiftDown) {
                $xSlider.slider("value", volume.indexX);
                $ySlider.slider("value", volume.indexY);
                $zSlider.slider("value", volume.indexZ);
            }
        }
        ;



        function xtk_showtime() {
            //
            // the onShowtime method gets executed after all files were fully loaded and
            // just before the first rendering attempt

            yRen.add(volume);
            yRen.render();
            zRen.add(volume);
            zRen.render();

            var dims = volume.dimensions;

            // It appears that dimensoins are in yxz order. At least with nii loading
            volume.indexX = Math.floor((dims[0] - 1) / 2);
            volume.indexY = Math.floor((dims[1] - 1) / 2);
            volume.indexZ = Math.floor((dims[2] - 1) / 2);
            // Setup the sliders within 'onShowtime' as we need the volume dimensions for the ranges


            // make the sliders
            $xSlider.slider({
                disabled: false,
                range: "min",
                min: 0,
                max: dims[0] - 1,
                value: volume.indexX,
                slide: function (event, ui) {
                    if (!volume) {
                        return;
                    }
                    volume.indexX = ui.value;
                    //sliceChange(id, 'x', volume.indexX);
                }.bind(this)
            });


            $ySlider.slider({
                disabled: false,
                range: "min",
                min: 0,
                max: dims[1] - 1,
                value: volume.indexY,
                slide: function (event, ui) {
                    if (!volume) {
                        return;
                    }
                    volume.indexY = ui.value;
                    //sliceChange(id, 'y', volume.indexY);
                }.bind(this)
            });


            $zSlider.slider({
                disabled: false,
                range: "min",
                min: 0,
                max: dims[2] - 1,
                value: volume.indexZ,
                slide: function (event, ui) {
                    if (!volume) {
                        return;
                    }
                    volume.indexZ = ui.value;
                    //sliceChange(id, 'z', volume.indexZ);
                }.bind(this)
            });

            // Overload onMouseWheel event to control sliders
            xRen._interactor.onMouseWheel = function (event) {

                var oldValue = $xSlider.slider("option", "value");
                var sign = event.deltaY ? event.deltaY < 0 ? -1 : 1 : 0
                $xSlider.slider({value: oldValue + sign});
                //sliceChange(id, 'x', volume.indexX);
            }.bind(this);

            yRen._interactor.onMouseWheel = function (event) {

                var oldValue = $ySlider.slider("option", "value");
                var sign = event.deltaY ? event.deltaY < 0 ? -1 : 1 : 0
                $ySlider.slider({value: oldValue + sign});
                //sliceChange(id, 'y', volume.indexY);
            }.bind(this);

            zRen._interactor.onMouseWheel = function (event) {

                var oldValue = $zSlider.slider("option", "value");
                var sign = event.deltaY ? event.deltaY < 0 ? -1 : 1 : 0
                $zSlider.slider({value: oldValue + sign});
                //sliceChange(id, 'z', volume.indexZ);
            }.bind(this);


            // Overload sliceX mouse moved
            xRen._interactor.onMouseMove = function (event) {
                updateSliders(xRen, event);
            }.bind(this);

            // Overload yRen mouse moved
            yRen._interactor.onMouseMove = function (event) {
                updateSliders(yRen, event);
            }.bind(this);

            // Overload zRen mouse moved
            zRen._interactor.onMouseMove = function (event) {
                updateSliders(zRen, event);
            }.bind(this);
        }
        ;


        function setVisibleViews(viewList, count) {
            //ViewList: Hash
            //var slice_view_width = String(100 / total_visible);
            //Calcualte new with of each orthogonal view
            console.log('here');
            var slice_view_width = String(100 / count);

            if (viewList['X']) {
                $xContainer.show();
                $xContainer.width(slice_view_width + '%');

            } else {
                $xContainer.hide();
            }

            if (viewList['Y']) {
                $yContainer.show();
                $yContainer.width(slice_view_width + '%');
           
            } else {
                $yContainer.hide();
            }

            if (viewList['Z']) {
                $zContainer.show();
                $zContainer.width(slice_view_width + '%');
          
            } else {
                $zContainer.hide();
            }
        }
        ;


        function basename(path) {
            return path.split(/[\\/]/).pop();
        }
        ;

        function setup() {
            createHTML();
            setupRenderers();
        }

        var public_interface = {
            setVisibleViews: setVisibleViews

        };
        
        createHTML();
        setupRenderers();
        return public_interface;
    }

    dcc.SpecimenView = Slices;
})();
