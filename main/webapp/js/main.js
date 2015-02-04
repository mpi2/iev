//goog.require('X.labelmap');

//The initail script that creates the views

//TODO: sync zooming
//


(function () {
    if (typeof dcc === 'undefined')
        dcc = {};

    var viewsLinked = false;
    var number_to_load = 1;
    var views = [];

    dcc.EmbryoViewer = function(volPath, container) {
        console.log(container);
        loadViewers(volPath, container);
        setUpLinkViews();
        setupZoomSlider();
        attachEvents();
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

    function loadViewers(volPath, container) {

        if (number_to_load < 1) {
            return;
        }
        number_to_load--;
        //console.log('fish');
        var view = new Slices(volPath, 's' + number_to_load, container, loadViewers, sliceChange);
        //console.log('chips');
        view.createHTML();
        view.setup_renderers();
        views.push(view);
    }

    function setUpLinkViews() {
        //Link the views so that sliding/scrolling/zooming affect all

        $('#link_views_toggle').change(function (e) {
            viewsLinked = e.currentTarget.checked;
        });
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
                views[i].setOrthogonalViews(toView, count);
            }

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
