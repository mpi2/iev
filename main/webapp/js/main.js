//goog.require('X.labelmap');

//The initail script that creates the views

//TODO: sync zooming
//



window.addEventListener('load', function() {
               
    viewer_testing = true;
    
    if (viewer_testing){
        // So we can just use index.html instead of deploying the web app
		chromeID = 'dndfpjnjfpbnpoeocbdgimhfcombnfhj';
       
        var wildtypes = 
                ['chrome-extension://' + chromeID + '/260814.nrrd',
                 'chrome-extension://' + chromeID + '20140107_MLLT3_16.3_e_wt_rec_28um_vox.nrrd'];
        var mutants = 
                ['chrome-extension://' + chromeID + '/260814.nrrd',
                 'chrome-extension://' + chromeID + '20140121RIC8B_15.4_b_wt_rec_28um.nrrd'];
        
        
        var div = 'viewer' // For developing outside of web app
        dcc.EmbryoViewer(wildtypes, mutants, div);
    }
});



    

(function () {
    if (typeof dcc === 'undefined')
        dcc = {};
    
    var viewsLinked = false;
    var views = [];
    var container = 'viewer';// Div to put the viewers
    var chromeID = 'dndfpjnjfpbnpoeocbdgimhfcombnfhj';
    var controlsVisible = false;
    var wildtypes;
    var mutants;
    
 
    
    function EmbryoViewer(wild, mut, div) {
        
        wildtypes = wild;
        mutants = mut;
        loadViewers();
        attachEvents();
        container = div;
    }
      
    dcc.EmbryoViewer = EmbryoViewer;
    


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

    this.loadViewers = function () {
        
        var wildtypeView = new dcc.SpecimenView(wildtypes, 'wt', 'viewer', sliceChange);
        console.log(wildtypes);
        wildtypeView.createHTML();
        wildtypeView.setup_renderers();
        views.push(wildtypeView);
        var mutantView = new dcc.SpecimenView(mutants, 'mut', 'viewer', sliceChange);
        mutantView.createHTML();
        mutantView.setup_renderers();
        views.push(mutantView);
        
        
    }


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
        
        
        $(function() {
            $( "#orientation_radio" ).buttonset();
        });
        
        
        $("#vertical_check")
                .click(function (event) {
                   $('.specimen_view').css({
                     float: 'left',
                       width: '48%',
                       height: 'auto'
                });
                $('.sliceView').css({
                       width: '100%'
                });
                $('#horizontal_check').prop('checked', true).button("refresh");
           
        });
        
        $('#horizontal_check')
                .click(function (event) {
                   $('.specimen_view').css({
                       float: 'left',
                       width: '100%',
                       height: '500px'
                });
                $('.sliceView').css({
                       width: '33%' // what about if some ortho views are not shown?
                });
                $('#vertical_check').prop('checked', true).button("refresh");
                
           
        });
        
        
         $( "#viewHeightSlider" )
            .slider({
                min: 200,
                max: 1000,
                values: [500],
                slide: function(event, ui){
                    console.log(ui);
            }
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
