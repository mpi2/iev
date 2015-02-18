//goog.require('X.labelmap');

//The initail script that creates the views

//TODO: sync zooming
//



window.addEventListener('load', function() {
               
    return;  // Remove for testing on local chrome app
    
    // So we can just use index.html instead of deploying the web app
            var chromeID = 'imnbjldclgefjpoiclhgkhodldbgkefo';

    var wildtypes = 
            ['chrome-extension://' + chromeID + '/20131206_MLLT3_15.3_d_WT_rec_28um.nrrd',
             'chrome-extension://' + chromeID + '/20140121RIC8B_15.4_b_wt_rec_28um.nrrd',
             'chrome-extension://' + chromeID + '/20140128_SMOC1_18.2_c_wt_rec_28um.nrrd'];
    var mutants = 
            ['chrome-extension://' + chromeID + '/20140128_SMOC1_18.2_c_wt_rec_28um.nrrd',
             'chrome-extension://' + chromeID + '/20131206_MLLT3_15.3_d_WT_rec_28um.nrrd',
             'chrome-extension://' + chromeID + '/20140121RIC8B_15.4_b_wt_rec_28um.nrrd'];


    var div = 'viewer' // For developing outside of web app
    dcc.EmbryoViewer(wildtypes, mutants, div);

});


(function () {
    if (typeof dcc === 'undefined')
        dcc = {};
    
 
    function EmbryoViewer(data, div) {
        
       for(var i = 0; i < data.volumes.length; i++) {
            var obj = json[i];
            console.log(obj);
    }
    
    
        var wildtypes = wild;
        var mutants = mut;
        var container = div;
        var views = [];
        
        var visible = {'x': true,
                       'y': true,
                       'z': true
                      };
    
      
    
    function loadViewers(container) {
        
        var wildtypeView = new dcc.SpecimenView(wildtypes, 'wt', container);
        views.push(wildtypeView);
        
        var mutantView = new dcc.SpecimenView(mutants, 'mut', container);
        views.push(mutantView);   
    };
    


    function attachEvents() {
        // Hide/show slice views from the checkboxes
        $('.toggle_slice').change(function (e, ui) {
            console.log(e);
          
            //e.target.css('backgound-color', 'blue');

            var slice_list = ['X_check', 'Y_check', 'Z_check'];	//IDs of the checkboxes
            visible = {}
            var count = 0;

            //Count the number of checked boxes so we can work out a new width
            for (var i = 0; i < slice_list.length; i++) {
                if ($('#' + slice_list[i]).is(':checked')) {
                    visible[slice_list[i].charAt(0)] = true;
                    count++;
                }
                else {
                    visible[slice_list[i].charAt(0)] = false;
                }
            }
            for (var i = 0; i < views.length; i++) {
                views[i].setVisibleViews(visible, count);
            }
            window.dispatchEvent(new Event('resize')); 

        });

        $(".button").button();
        
        $('#link_views')
                .button()
                .change(function (e) {
                    viewsLinked = e.currentTarget.checked;
        });
    
        

        $(function() {
            $( "#orientation_radio" ).buttonset();
        });
        
        
        $("#vertical_check")
                .click(function (event) {
                   $('.specimen_view').css({
                       float: 'left',
                       width: '48%',
                       
                });
                $('.sliceView').css({
                       width: '100%'
                });
                $('#horizontal_check').prop('checked', true).button("refresh");
           
        });
        
        $('#horizontal_check')
                .click(function (event) {
                    var numVisible = 0;
                    for(var item in visible){
                        if(visible[item]) ++ numVisible;
                    }
                      
                $('.specimen_view').css({
                       float: 'none',
                       width: '100%',
                       
                });
                $('.sliceView').css({
                       width: String(100 / numVisible) + '%',
//                      
                });
                $('#vertical_check').prop('checked', true).button("refresh");
                
           
        });
        
        
        $( "#viewHeightSlider" )
            .slider({
                min: 200,
                max: 1920,
                values: [500],
                slide: $.proxy(function(event, ui){
                         $('.sliceView').css('height', ui.value);
                         window.dispatchEvent(new Event('resize'));
                            
            }, this)
         });
    }


    // Style the control buttons

    $(function () {
        $(".toggle_slice").button();
    });

    $('body').bind('beforeunload', function () {
        console.log('bye');
    });
    
    loadViewers(container);
    attachEvents();
    }
     
    dcc.EmbryoViewer = EmbryoViewer;
    
})();
