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
        var NUM_VIEWERS = 2;
        var viewers_loaded = 0;
        
        /**
         * 
         * @type {object} modality_stage_pids
         * A mapping of procedure ids and imaging modality/stage key
         */
        var modality_stage_pids = {
            203: 'CT E14.5/15.5',
            204: 'CT E18.5',
            202: 'OPT E12.5'
        };
        
        var modality_stage_data = {
            'wildtypes':{
                'CT E14.5/15.5': [],
                'CT E18.5': [],
                'OPT E12.5': []
            },
            'mutants':{
                'CT E14.5/15.5': [],
                'CT E18.5': [],
                'OPT E12.5': []
            }    
        };
            

     
        
        /**
         * Seperate out the baseline data and the mutant data.
         * If data is not available, load an error message
         */
        if (data['success']){
            // Get the baselines and the mutant paths
            for(var i = 0; i < data.volumes.length; i++) {

                var obj = data.volumes[i];

                 if (obj.colonyId === WILDTYPE_COLONYID){
                    var modality_stage = modality_stage_pids[obj.pid];
                    modality_stage_data['wildtypes'][modality_stage].push(buildUrl(obj));

                }else{
                    var modality_stage = modality_stage_pids[obj.pid];
                    modality_stage_data['mutants'][modality_stage].push(buildUrl(obj));
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
                linked: true
            },
            'Y': {
                visible: true,
                linked: true
            },
            'Z': {
                visible: true,
                linked: true
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
        
        
        
        function onHeightSlider(sliderValue){
            /**
             * 
             * @return {undefined}
             */
             $('.sliceWrap').css('height', ui.value);
             console.log('after slider', $('#X_mut').height(), $('.sliceWrap').height());
        }
        
        
        function scaleOrthogonalViews(){
            /**
             * Set the largest extent for each of the dimensions
             *@method setLargestDimesions
             */
            
            var maxXY = 0;
            var maxZ = 0;
            var maxXYid;
            var maxZid;
           
            
            for (var i=0; i < views.length; ++i){
               var vol_dims = views[i].getDimensions();
         
               
               if (vol_dims[2] > maxXY){
                   maxXY = vol_dims[2];
                   maxXYid = views[i].id;
               }
               
               if (vol_dims[1] > maxZ){
                   maxZ = vol_dims[1];
                   maxZid = views[i].id;
               }
               
            }
     
            // Set the proportional views
            for (var i=0; i < views.length; ++i){
                if (maxXYid === views[i].id) continue;
                views[i].setXYproportional(maxXY);
                
//                if (maxZid === views[i].id){
//                    views[i].setProportionalSize('Z', maxXY);
//                } 
           }
           
           window.dispatchEvent(new Event('resize')); 
        }
        
        
            
        
    
    
        function loadViewers(container) {
            /**
             * Create instances of SpecimenView and append to views[]. 
             * Get the dimensions of the loaded volumes
             * @method loadViewers
             * @param {String} container HTML element to put the specimen viewer in to
             */
            var wtView = dcc.SpecimenView(modality_stage_data.wildtypes, 'wt', container, WILDTYPE_COLONYID, 
                            sliceChange, views, onViewLoaded);
            views.push(wtView);
            
            var mutView = dcc.SpecimenView(modality_stage_data.mutants, 'mut', container, queryColonyId, 
                            sliceChange, views, onViewLoaded);
            views.push(mutView);
            
            /* volumes are loaded. Now make the correposnding orthogonal views
             proportial sizes to each other. eg saggital slice from each view
            should be sized propotional to their real size
            */
          
        };
        
        function onViewLoaded(id){
            /**
             * Called when each SpecimenView has loaded, so that we can do stuff like determining
             * which views need rescaling to show relational sizes.
             * @todo we need to decrement viewers_loaded when we delete a SpecimenView
             * @param {type} id
             */
            viewers_loaded += 1;
            if (viewers_loaded === NUM_VIEWERS){
                scaleOrthogonalViews();  
            }  
        }
        
        
        
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
         
            

            $("#viewHeightSlider")
                    .slider({
                        min: 200,
                        max: 1920,
                        values: [500],
                        slide: $.proxy(function (event, ui) {
                            //console.log('before slider', $('#X_mut').height(), $('.sliceWrap').height());
                            $('.sliceWrap').css('height', ui.value);
                            
                           
                            //console.log('after slider', $('#X_mut').height(), $('.sliceWrap').height());
                            //scaleOrthogonalViews()
                       
                            //console.log('after scaling', $('#X_mut').height());
                            

                            var evt = document.createEvent('UIEvents');
                            evt.initUIEvent('resize', true, false,window,0);
                            window.dispatchEvent(evt);
                        }, this)
                    })
                    .tooltip({
                        content: "Modify slice viewer height",
                        show: {delay: 1200 }
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
                $( "#modality_stage" ).buttonset();
                
            // No orientation controls for single specimen view  
            if (wildtypes.length < 1 || mutants.length < 1){
                 $("#orientation_radio" ).hide();
                 return;
            }
         
            //$("#orientation_radio" ).buttonset();
           
        
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
    
    
    function setupModalityStageButtons(){
        
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
    setupModalityStageButtons();
    
    }//EmbryoViewer
     
   
    
})();
