//goog.require('X.labelmap');

//The initail script that creates the views

//TODO: sync zooming
//

chromeID = 'dndfpjnjfpbnpoeocbdgimhfcombnfhj';
viewer_testing = false;

(function () {
    if (typeof dcc === 'undefined')
        dcc = {};

    var viewsLinked = false;
    var number_to_load = 2;
    var views = [];
    var container; // Div to put the viewers
    var volpath;

    dcc.EmbryoViewer = function (v, div) {
        //console.log(container);
        //url = 'http://localhost:8084/embryo-viewer/viewer.html';
//        window.location.href = url;
        //window.location.assign(url);
        loadViewers(volpath, container);
        setupZoomSlider();
        attachEvents();
        container = div;
        volpath = v;
        console.log('test volpath ' + volpath);
        console.log('test v', +v);
    }


    function sliceChange(scrolled) {

        if (!viewsLinked)
            return;
        // on scrolling, scroll the other views as well
        for (var i = 0; i < views.length; i++) {
            if (scrolled.id == views[i].id) {
                continue;
            } else {
                views[i].setSlices(scrolled.volume.indexX, scrolled.volume.indexY, scrolled.volume.indexZ);
            }
        }
    }

    function loadViewers() {

        if (number_to_load < 1) {
            return;
        }
        number_to_load--;

        var view = new Slices('260814', 's' + number_to_load, 'viewer', loadViewers, sliceChange);
        view.createHTML();
        view.setup_renderers();
        views.push(view);
    }


    function setupZoomSlider() {
        $("#level_slider").slider({
            "disabled": false,
            range: "min",
            min: 100,
            max: 1000,
            value: 400,
            slide: function (event, ui) {

            }
        });
    }

    function attachEvents() {

        // Hide/show slice views from the checkboxes
        $('.toggle_slice').change(function () {

            var slice_list = ['X_check', 'Y_check', 'Z_check'];	//IDs of the checkboxes
            var toView = {}
            var count = 0;

            //Count the number of checked boxes so we can work out a new width
            for (var i = 0; i < slice_list.length; i++) {
                if ($('#' + slice_list[i]).is(':checked')) {
                    toView[slice_list[i].charAt(0)] = true;
                    count++;
                }
                else {
                    toView[slice_list[i].charAt(0)] = false;
                }
            }
            for (var i = 0; i < views.length; i++) {
                views[i].setVisibleViews(toView, count);
            }
            window.dispatchEvent(new Event('resize')); //

        });


        // Invert the color map 
        $('#invert_colours')
                .button()
                .change(function () {
                    for (var i = 0; i < views.length; i++) {
                        views[i].invertColour($(this).is(':checked'));
            }
        });
        
           
        //Link the views so that sliding/scrolling/zooming affect all

        $('#link_views')
                .button()
                .change(function (e) {
                    viewsLinked = e.currentTarget.checked;
        });
    


        // Zooming
        $("#zoomIn")
                .button()
                .click(function (event) {
                    for (var i = 0; i < views.length; i++) {
                        views[i].cameraZoomIn()
                    }

                });

        $("#zoomOut")
                .button()
                .click(function (event) {
                    for (var i = 0; i < views.length; i++) {
                        views[i].cameraZoomOut();
                    }
                });

        $("#reset")
                .button()
                .click(function (event) {
                    var e = new X.event.ResetViewEvent();
                    for (var i = 0; i < views.length; i++) {
                        views[i].resetView(e);
                    }
                    $("#windowLevel").slider("option", "values", [volume.windowLow, volume.windowHigh]);

                });

    }


    // Style the control buttons

    $(function () {
        $("#link_views_toggle").button();
    });

    $('body').bind('beforeunload', function () {
        console.log('bye');
    });


})();
