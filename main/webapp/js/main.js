//goog.require('X.labelmap');

//The initail script that creates the views

//TODO: sync zooming
//



//window.addEventListener('load', function() {
//               
//    return;  // Remove for testing on local chrome app
//    
//    // So we can just use index.html instead of deploying the web app
//    var CHROME_ID = 'dndfpjnjfpbnpoeocbdgimhfcombnfhj';
//    var IMAGE_SERVER = 'chrome-extension://' + CHROME_ID; 
//
//    var wildtypes = 
//            ['20131206_MLLT3_15.3_d_WT_rec_28um.nrrd',
//             '/20140121RIC8B_15.4_b_wt_rec_28um.nrrd',
//             '/20140128_SMOC1_18.2_c_wt_rec_28um.nrrd'];
//    var mutants = 
//            ['/20140128_SMOC1_18.2_c_wt_rec_28um.nrrd',
//             '/20131206_MLLT3_15.3_d_WT_rec_28um.nrrd',
//             '/20140121RIC8B_15.4_b_wt_rec_28um.nrrd'];
//
//
//    var div = 'viewer' // For developing outside of web app
//    dcc.EmbryoViewer(wildtypes, mutants, div, IMAGE_SERVER);
//
//});


(function () {
    if (typeof dcc === 'undefined')
        dcc = {};
    
   
 
     dcc.EmbryoViewer = function(data, div, queryColonyId) {
        
        var IMAGE_SERVER = 'https://www.mousephenotype.org/images/emb/';
        var WILDTYPE_COLONYID = 'baseline';
        var wildtypes = [];
        var mutants = [];
        var queryColonyId = queryColonyId;
        var horizontalView = undefined;
     
        // Get the baselines and the mutant paths
        for(var i = 0; i < data.volumes.length; i++) {
            var obj = data.volumes[i];
            if (obj.colonyId === WILDTYPE_COLONYID){
                wildtypes.push(buildUrl(obj));
                console.log(obj.url);
            }else{
                mutants.push(buildUrl(obj));
                console.log(obj.url);
            }
        }
        
        console.log(window);
       
    
        var container = div;
        var views = [];
        
        var visible = {'x': true,
                       'y': true,
                       'z': true
                      };
    
    
        function buildUrl(data){
            url = IMAGE_SERVER + data.cid + '/' 
                    + data.lid + '/' 
                    + data.gid + '/' 
                    + data.sid + '/' 
                    + data.pid + '/' 
                    + data.qid + '/' 
                    + data.url;

            return url;
        }
    
    
        function loadViewers(container) {

            views.push(dcc.SpecimenView(wildtypes, 'wt', container, 'baseline'));
            views.push(dcc.SpecimenView(mutants, 'mut', container, queryColonyId));

        };
    

        function attachEvents() {
            
            // Hide/show slice views from the checkboxes
            $('.toggle_slice').change(function (e, ui) {
                console.log(e);

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
                    views[i].setVisibleViews(visible, count, horizontalView);
                }
                window.dispatchEvent(new Event('resize')); 

            });
            

            $(".button").button();
            

            $('#link_views')
                .button()
                .change(function (e) {
                    viewsLinked = e.currentTarget.checked;
            });
            
            $("#viewHeightSlider").tooltip({
                content: "Modify slice viewer height",
                 show: {delay: 1200 }
            });

            $("#viewHeightSlider")
                    .slider({
                        min: 200,
                        max: 1920,
                        values: [500],
                        slide: $.proxy(function (event, ui) {
                            $('.sliceView').css('height', ui.value);
                            var evt = document.createEvent('UIEvents');
                            evt.initUIEvent('resize', true, false,window,0);
                            window.dispatchEvent(evt);
                        }, this)
                    });
            
            $('#fullscreen')
                    .click(function(){
                        console.log('fullscreen');     
            });
            $('.windowLevel').tooltip({content: "Adjust brightness/contrast",
                 show: {delay: 1200 }
             });
             
            $("#selectorWrap_wt").tooltip({content: "Select WT embryo to view",
             show: {delay: 1200 }});
         
            $("#selectorWrap_mut").tooltip({content: "Select mutant embryo to view",
             show: {delay: 1200 }});
         
         
  
        
    }//AttachEvents
    
    

    
    
    function setupOrientationControls(){
                
            // No orientation controls for single specimen view  
            if (wildtypes.length < 1 || mutants.length < 1){
                 $("#orientation_radio" ).hide();
                 return;
            }
         
            $("#orientation_radio" ).buttonset();
           
        
            $("#vertical_check")
                .click(function (event) {
                    horizontalView = true;
                   $('.specimen_view').css({
                       float: 'left',
                       width: '48%',
                       clear: 'none'
                       
                });
                $('.sliceView').css({
                       width: '100%'
                });
                $('#horizontal_check').prop('checked', true).button("refresh");
                window.dispatchEvent(new Event('resize')); 
        }.bind(this));
        
        $('#horizontal_check')
                .click(function (event) {
                    horizontalView = false;
                    var numVisible = 0;
                    for(var item in visible){
                        if(visible[item]) ++ numVisible;
                    }
                      
                $('.specimen_view').css({
                       float: 'none',
                       width: '100%',
                       clear: 'both'
                       
                });
                $('.sliceView').css({
                       width: String(100 / numVisible) + '%'
                      
                });
                $('#vertical_check').prop('checked', true).button("refresh");
                window.dispatchEvent(new Event('resize')); 
                
           
        }.bind(this));
        }
        

//    $(function() {
//
        
//        console.log('toggle');
//    });
//    Does not work


    // Style the control buttons

    $(function () {
       
        $(".toggle_slice").button();
        
        $("#X_check").tooltip({
           content: "This is a tooltip"
        });
                
        $( "#help_link" ).button({
             icons: {
                 primary: 'ui-icon-help'
             }
        }).click(function(){
            //Get link to the docs
        }).css({width: '30'});
    });

//    $('body').bind('beforeunload', function () {
//        console.log('bye');
//    });
    
    loadViewers(container);
    attachEvents();
    setupOrientationControls();
    //tooltips();
    }//EmbryoViewer
     
   
    
})();
