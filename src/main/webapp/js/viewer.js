//goog.require('X.renderer2D');
//goog.require('X.interactor2D');


(function () {
    if (typeof dcc === 'undefined')
        dcc = {};


    function SpecimenView(volumePaths, id, container, queryColonyId, indexCallback) {
        /**
         * This class holds the three orthogonal views from a single specimen and 
         * allows for loading in of differnt specimens of the same genenotype/colonyID
         * 
         * @class SpcimenView
         * @param {Array} VolumePaths volumes paths for a specific mutant/baseline
         * @param {int} id unique id for this view
         * @param {String} container html element to place this view
         * @param {String} queryColonyId The colonyId of this specimen
         * @param {function} indexCallBack called when slice index changes
         */

        var id = id;
        var viewContainer = container;
        var volumePaths = volumePaths;
        var currentVolumePath = volumePaths[0];

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
        var invertColours = 'invert_colours_' + id;
        var windowLevel = 'windowLevel_' + id;
        var reset = 'reset_' + id;
        var zoomIn = 'zoomIn_' + id;
        var zoomOut = 'zoomOut_' + id;
        var vselector = 'volumeSelector_' + id;
        var xOffset = 0;
        var yOffset = 0;
        var zOffset = 0;


        function createEventHandlers() {
            /**
             * Create event handler for controlling the specimen view
             * 
             * @method createEventHandlers
             * 
             */
   
            // Invert the color map 
            $("#" + invertColours).change($.proxy(function (e) {
                invertColour(e.target.checked);
            }, this));

            
            $windowLevel = $('#' + windowLevel);
            
            $windowLevel.slider({
                range: true,
//                min: parseInt(volume.windowLow),
//                max: parseInt(volume.windowHigh),
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

            $('#windowLevel_mut').tooltip({content: "gjdfhs",
                 show: {delay: 1000 }
             });

            $("#" + reset)
            .button()
            .click($.proxy(function () {
                  //reset the zoom
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
            }, this));



            $("#" + zoomIn)
            .button()
            .click($.proxy(function () {
                xRen.camera.zoomIn(false);
                yRen.camera.zoomIn(false);
                zRen.camera.zoomIn(false);
            }, this));


            $("#" + zoomOut)
            .button()
            .click($.proxy(function () {
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
        }; 



        function createHTML () {
            /**
             * Creates the html needed for the specimen view to live in.
             * Uses handlebar.js to generate from templates
             * 
             * @method createHtml
             * 
             */

            var $viewsContainer = $("#" + viewContainer);
            
            if (volumePaths.length < 1 && queryColonyId !==  null){
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

            $viewsContainer.append($specimenView);
        }
        
        
        function createSliceView(orient){
            /**
             * 
             * @param {String} orient Orientation (X, Y or Z)
             */
            
            var data = {
                sliceWrapId: 'sliceWrap_' + orient + '_' + id,
                sliceContainerID: orient + '_' + id,
                viewSliceClasss: 'slice' + orient,
                sliderId: 'slider_' + orient + '_'+ id,
                sliderClass: 'slider' + orient,
                orientation: orient,
                id: id
               
            };
            
            var source   = $("#slice_view_template").html();
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
                invertColoursId: invertColours,
                zoomInId: zoomIn,
                zoomOutId: zoomOut,
                resetId: reset,
                selectorWrapId: "selectorWrap_" + id,
                vselectorId: vselector,
                windowLevelId: windowLevel 
            };
            
            var source   = $("#slice_controls_template").html();
            var template = Handlebars.compile(source);
            return template(data);
        };


        function replaceVolume(volumePath) {
            /**
             * Replace current specimen volume with another.
             * Destroys current object (not sure is necessary) add new path and call setupoRenderers
             * 
             * @method replaceVolume
             * @param {String} VolumePath path to new volume to load into viewer
             */
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
        };


        function setupRenderers() {
            /**
             * Call the XTK functions that are required to get our volume rendered in 2D
             * 
             * @method setupRenderers
             */

            if (volumePaths.length < 1) return;
            
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
            

            xRen.render();

            xRen.onShowtime = xtk_showtime;

           
        };


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
            * @param {int} id The ID of the this SpecimenView class
            * @param {String} ortho The orthogonal view that was changed ('X', 'Y', or 'Z')
            */
            if (ortho === 'X') indexCallback(id, ortho, index + xOffset );
            if (ortho === 'Y') indexCallback(id, ortho, index + yOffset );
            if (ortho === 'Z') indexCallback(id, ortho, index + zOffset );
       }
          


        function updateSliders(renderer, event) {
 
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
                    sliceChange(id, 'X', volume.indexX);
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
                    sliceChange(id, 'Y', volume.indexY);
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
                    sliceChange(id, 'Z', volume.indexZ);
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
        };
        
        function setXindex(index){
             volume.indexX = index -xOffset;
             $xSlider.slider("value", volume.indexX);
        }
        
        function setYindex(index){
             volume.indexY = index - yOffset;
             $ySlider.slider("value", volume.indexY);
        }
        
        function setZindex(index){
             volume.indexZ = index - zOffset;
             $zSlider.slider("value", volume.indexZ);
        }
        
        function getIndex(ortho){
            if (ortho === 'X') return volume.indexX;
            if (ortho === 'Y') return volume.indexY;
            if (ortho === 'Z') return volume.indexZ;
        }
       
        function setIdxOffset(ortho, offset){
            if (ortho === 'X') xOffset = offset;
            if (ortho === 'Y') yOffset = offset;
            if (ortho === 'Z') zOffset = offset;
        }
        



        function setVisibleViews(viewList, count, horizontalView) {
            //ViewList: Hash
            //var slice_view_width = String(100 / total_visible);
            //Calcualte new with of each orthogonal view
            
            //If orientation in vertial, slice width should always be 100%
     
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
        };


        function basename(path) {
            return path.split(/[\\/]/).pop();
        };


        var public_interface = {
            setVisibleViews: setVisibleViews,
            //linkOrthoView: linkOrthoView,
            setXindex: setXindex,
            setYindex: setYindex,
            setZindex: setZindex,
            getIndex: getIndex,
            id: id,
            setIdxOffset: setIdxOffset

        };
        
        createHTML();
        jQuerySelectors();
        setupRenderers();
        createEventHandlers();
        return public_interface;
    }

    dcc.SpecimenView = SpecimenView;
})();
