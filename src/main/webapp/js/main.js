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
         /**
          * @class EmbryoViewer
          * @type String
          */
        
        var IMAGE_SERVER = 'https://www.mousephenotype.org/images/emb/';
        var WILDTYPE_COLONYID = 'baseline';
        var wildtypes = [];
        var mutants = [];
        var queryColonyId = queryColonyId;
        var horizontalView = undefined;
     
        
        /**
         * Seperate out the baseline data and the mutant data.
         * If data is not available, load an error message
         */
        if (data['success']){
            // Get the baselines and the mutant paths
            for(var i = 0; i < data.volumes.length; i++) {

                var obj = data.volumes[i];

                 if (obj.colonyId === WILDTYPE_COLONYID){
                    wildtypes.push(buildUrl(obj));

                }else{
                    mutants.push(buildUrl(obj));   
                }
            }
            
        }else{
            //Just display a message informing no data
            var data = {colonyId: queryColonyId};
            var source   = $("#no_data_template").html();
            var template = Handlebars.compile(source);
            $('#' + div).append(template(data));
        }
       
    
        var container = div;
        var views = [];
        
        
        /**
         * 
         * @type {Object} ortho
         * Visible: for the orthogonal views buttons
         * Linked: are the corresponding ortho views from the different specimens linked
         * Max dimensions for each orthogonal view
         */
        var ortho = {
            'X': {
                visible: true,
                linked: true,
                maxHeight: 0,
                maxWidth: 0
            },
            'Y': {
                visible: true,
                linked: true,
                maxHeight: 0,
                maxWidth: 0
            },
            'Z': {
                visible: true,
                linked: true,
                maxHeight: 0,
                maxWidth: 0
            }
        };
    
    
        function buildUrl(data){
            /**
             * Create a url from the data returned by querying database for a colonyID
             * URL should point us towards the correct place on the image server
             * @method buildUrl
             * @param {json} data Data for colonyID 
             */
            url = IMAGE_SERVER + data.cid + '/' 
                    + data.lid + '/' 
                    + data.gid + '/' 
                    + data.sid + '/' 
                    + data.pid + '/' 
                    + data.qid + '/' 
                    + data.url;

            return url;
        }
        
        
        function setLargestDimesions(dims){
            /**
             * Set the largest extent for each of the dimensions
             *@method setLargestDimesions
             *@param {Object} dims X Y and Z height and widths
             */
           
            if (ortho.X.maxHeight > dims.X.height){
                ortho.X.maxHeight = dims.X.height;
            }
            if (ortho.X.maxWidth > dims.X.width){
                ortho.X.maxWidth = dims.X.width;
            }
            if (ortho.Y.maxHeight > dims.Y.height){
                ortho.Y.maxHeight = dims.Y.height;
            }
            if (ortho.Y.maxWidth > dims.Y.width){
                ortho.Y.maxWidth = dims.Y.width;
            }
            if (ortho.Z.maxHeight > dims.Z.height){
                ortho.Z.maxHeight = dims.Z.height;
            }
            if (ortho.Z.maxWidth > dims.Z.width){
                ortho.Z.maxWidth = dims.Z.width;
            };
            console.log(ortho);
                
        
        }
            
        
    
    
        function loadViewers(container) {
            /**
             * Create instances of SpecimenView and append to views[]. 
             * Get the dimensions of the loaded volumes
             * @method loadViewers
             * @param {String} container HTML element to put the specimen viewer in to
             */
            var wtView = dcc.SpecimenView(wildtypes, 'wt', container, WILDTYPE_COLONYID, 
                            sliceChange, setLargestDimesions);
            views.push(wtView);
            
            var mutView = dcc.SpecimenView(mutants, 'mut', container, queryColonyId, 
                            sliceChange, setLargestDimesions);
            views.push(mutView);
        };
        
        
        
        function sliceChange(id, orientation, index) {
            /**
             * Callback for the slice change events from the SpecimenViews.
             * Calls the other SpecimenViews with index change if required
             * @method sliceChange
             * @param {String} id ID ofd the calling SpecimenView
             * @param {String} orientation ('X', 'Y', 'Z')
             * @param {int} index Slice index
             */

            for (var i = 0; i < views.length; i++) {
                if (views[i].id === id) continue; //this is the views that changed
                
                if (orientation === 'X' && ortho['X'].linked) {
                    views[i].setXindex(index);
                
                } else if (orientation === 'Y' && ortho['Y'].linked) {
                    views[i].setYindex(index);
                
                } else if (orientation === 'Z' && ortho['Z'].linked) {
                    views[i].setZindex(index);
                }
            }
        }
        
        
        function linkViews(orthoView, isLink){
            /**
             *Match the slice indices between the SpecimenViews
             *@method linkViews
             *@param {String} orthoView('X', 'Y' or 'Z')
             *@param {bool} isLink Are these orthogonal viewsd linked?
             * 
             */
            var wtIdx;
            var mutIdx;
         
            $('.' + orthoView).prop('checked', isLink);
            
            ortho[orthoView].linked = isLink;
            
            for (var i = 0; i < views.length; i++) {
                // Set/unset the link buttons
                if(views[i].id === 'wt'){
                    wtIdx = views[i].getIndex(orthoView);
                }else if (views[i].id === 'mut'){
                    mutIdx = views[i].getIndex(orthoView);
                }
            }
            for (var i = 0; i < views.length; i++) {
                if (views[i].id === 'mut'){
                    views[i].setIdxOffset(orthoView, wtIdx - mutIdx);
                }
            }  
        }
        
        

        function attachEvents() {
            /**
             * 
             */
      
            $(".linkCheck").change(function(e){
              
                if ($(e.target).hasClass('X')) {
                    linkViews('X', e.currentTarget.checked);
                }
                else if ($(e.target).hasClass('Y')) {
                    linkViews('Y', e.currentTarget.checked);
                }
                else if ($(e.target).hasClass('Z')) {
                    linkViews('Z', e.currentTarget.checked);
                }
                        
            }.bind(this)); 
             
           
            
            // Hide/show slice views from the checkboxes
            $('.toggle_slice').change(function () {

                var slice_list = ['X_check', 'Y_check', 'Z_check'];	//IDs of the checkboxes
                var count = 0;

                //Count the number of checked boxes so we can work out a new width
                for (var i = 0; i < slice_list.length; i++) {
                    if ($('#' + slice_list[i]).is(':checked')) {
                        ortho[slice_list[i].charAt(0)].visible = true;
                        count++;
                    }
                    else {
                        ortho[slice_list[i].charAt(0)].visible = false;
                    }
                }
                for (var i = 0; i < views.length; i++) {
                    views[i].setVisibleViews(ortho, count, horizontalView);
                }
                window.dispatchEvent(new Event('resize')); 

            });
            

            $(".button").button();
            


            
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
                            $('.sliceWrap').css('height', ui.value);
                            var evt = document.createEvent('UIEvents');
                            evt.initUIEvent('resize', true, false,window,0);
                            window.dispatchEvent(evt);
                        }, this)
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
                $('.sliceWrap').css({
                       width: '100%'
                });
                $('#horizontal_check').prop('checked', true).button("refresh");
                window.dispatchEvent(new Event('resize')); 
        }.bind(this));
        
        $('#horizontal_check')
                .click(function (event) {
                    horizontalView = false;
                    var numVisible = 0;
                    for(var item in ortho){
                        if(ortho[item].visible) ++ numVisible;
                    }
                      
                $('.specimen_view').css({
                       float: 'none',
                       width: '100%',
                       clear: 'both'
                       
                });
                $('.sliceWrap').css({
                       width: String(100 / numVisible) + '%'
                      
                });
                $('#vertical_check').prop('checked', true).button("refresh");
                window.dispatchEvent(new Event('resize')); 
                
           
        }.bind(this));
        }
  

    // Style the control buttons

    $(function () {
       
        $(".toggle_slice").button();
        
                
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
    }//EmbryoViewer
     
   
    
})();
