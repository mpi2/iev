//goog.require('X.labelmap');

//The initail script that creates the views

//TODO: sync zooming
//



window.addEventListener('load', function() {
               
    viewer_testing = true;
    
    if (viewer_testing){
        // So we can just use index.html instead of deploying the web app
        chromeID = 'dndfpjnjfpbnpoeocbdgimhfcombnfhj';
        var v =  'chrome-extension://' + chromeID + '/260814.nrrd';
        var div = 'viewer' // For developing outside of web app
        dcc.EmbryoViewer(v, div);
    }
});



    

(function () {
    if (typeof dcc === 'undefined')
        dcc = {};
    
    console.log('herererere');

    var viewsLinked = false;
    var number_to_load = 2;
    var views = [];
    var container = 'viewer'// Div to put the viewers
    var chromeID = 'dndfpjnjfpbnpoeocbdgimhfcombnfhj';
    var volpath ='chrome-extension://' + chromeID + '/260814.nrrd';
   
    var controlsVisible = false;
    

    
    dcc.EmbryoViewer = function (v, div) {
        //console.log(container);
        //url = 'http://localhost:8084/embryo-viewer/viewer.html';
//        window.location.href = url;
        //window.location.assign(url);
        loadViewers(volpath, container);
        //setupZoomSlider();
        attachEvents();
        container = div;
        volpath = v;
        console.log('dcc EmbryOView  volpath ' + volpath);
      
    }


    function sliceChange(viewid, orientation, indx) {
        // Calback from viewer for when slice changes
        if (!viewsLinked)
            return;
        // on scrolling, scroll the other views as well
        for (var i = 0; i < views.length; i++) {
            if (viewid === views[i].id) {
                continue;
            } else {
               if (orientation === 'x') {
                   views[i].setXslice(indx);
               }
               else if (orientation === 'y'){
                    views[i].setYslice(indx);
               }
               else if (orientation === 'z'){
                    views[i].setZslice(indx);
               }
            }
        }
    }

    function loadViewers() {
        console.log('load viewers called');
        for (var i =0; i < number_to_load; ++i){
            console.log('load_viewer ' + i)
            var view = new Slices(volpath, 's' + i, 'viewer', sliceChange);
            views.push(view);
            view.createHTML();
            view.setup_renderers();
        }
    }


//    function setupZoomSlider() {
//        $("#level_slider").slider({
//            "disabled": false,
//            range: "min",
//            min: 100,
//            max: 1000,
//            value: 400,
//            slide: function (event, ui) {
//
//            }
//        });
//    }

    function attachEvents() {
        console.log('attach events');
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


        //Try to add styling to buttons here
        $(".button").button();
        

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
        
        
        $("#vertical_check")
                .click(function (event) {
                   $
        });

                

    }


    // Style the control buttons

    $(function () {
        $(".toggle_slice").button();
    });

    $('body').bind('beforeunload', function () {
        console.log('bye');
    });


})();
