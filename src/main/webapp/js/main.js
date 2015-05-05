(function () {
    if (typeof dcc === 'undefined')
        dcc = {};
    
     dcc.EmbryoViewer = function(data, div, queryColonyId) {
         /**
          * @class EmbryoViewer
          * @type String
          */
        
        //var IMAGE_SERVER = 'https://www.mousephenotype.org/images/emb/';
        var IMAGE_SERVER = 'http://localhost:8000/'; // For testing localhost
        var WILDTYPE_COLONYID = 'baseline';
        var wildtypes = [];
        var mutants = [];
        var queryColonyId = queryColonyId;
        var horizontalView = undefined;
        var NUM_VIEWERS = 2;
        var viewers_loaded = 0;
        var scaleVisible = true;
        var wtView;
        var mutView;
        
        
        /**
         * 
         * @type {object} modality_stage_pids
         * A mapping of procedure ids and imaging modality/stage key
         */
        var modalityData = {
            203: {
                'id': 'CT E14.5/15.5',
                'vols': {
                    'mutant': [],
                    'wildtype': []
                }
            },
            204: {
                'id': 'CT E18.5',
                'vols':{
                    'mutant': [],
                    'wildtype': []
                }
            },
            202:{
                'id': 'OPT 9.5',
                'vols':{
                    'mutant': [],
                    'wildtype': []
                }
            }
        };
        
        
        /*
         * Map micrometer scale bar sizes to labels
         */
        var scaleOptions = {
            '200&#956;m': 200,
            '400&#956;m': 400,
            '600&#956;m': 600,
            '1mm': 1000,
            '2mm': 2000,
            '4mm': 4000,
            '6mm': 6000
        }
            
        
        var scaleLabels = function(){
            var options = [];
            for (var key in scaleOptions){
           
                options.push("<option value='" + scaleOptions[key]  + "'>" + key + "</option>");
            }
            return options;
        }
        
        
        var config = { //remove hardcoding
            scaleBarSize: 600,
        }

     
        /**
         * Seperate out the baseline data and the mutant data.
         * If data is not available, load an error message
         */
        if (data['success']){
            
            //Display the top control bar
            $('#top_bar').show();
            
            // Get the baselines and the mutant paths
            for(var i = 0; i < data.volumes.length; i++) {

                var obj = data.volumes[i];

                 if (obj.colonyId === WILDTYPE_COLONYID){
                    modalityData[obj.pid]['vols']['wildtype'].push(buildUrl(obj));

                }else{
                    modalityData[obj.pid]['vols']['mutant'].push(buildUrl(obj));
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
        
        
        function setActiveModalityButtons(){
            /*
             * Chaeck which modalities we have data for and inactivate buttons for which we have no data
             */
            for (var pid in modalityData){
                if (modalityData[pid]['vols']['mutant'].length < 1){
                    $("#modality_stage input[id^=" + pid + "]:radio").attr('disabled',true);
                }
            }
              
        }
        
    
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
             //console.log('after slider', $('#X_mut').height(), $('.sliceWrap').height());
        }
        
        
        function scaleOrthogonalViews(){
            /**
             * Set the largest extent for each of the dimensions
             *@method setLargestDimesions
             */
            
            //TODO: check what happens if specimens have iddentical dimensions
           
            var maxY = 0;
            var maxZ = 0;
            var maxYid;
            var maxZid;
           
            
            for (var i=0; i < views.length; ++i){
               var vol_dims = views[i].getDimensions();
               //console.log(views[i].getDimensions());
         
               // Set the max height for both sagittal and coronal, as they have height of Z in the viewer
               if (vol_dims[2] > maxZ){
                   maxZ = vol_dims[2];
                   maxZid = views[i].id;
               }
               
               // Set the max hight of the axial slice - Y
               if (vol_dims[1] > maxY){
                   maxY = vol_dims[1];
                   maxYid = views[i].id;
               } 
            }
          
            // Set the proportional views
            for (var i=0; i < views.length; ++i){
                // Don't set on the largest
                if (maxZid !== views[i].id){
                //Set on the others
                    views[i].setProportional();
                }
                if (maxYid !== views[i].id){
                    views[i].setProportional();
                }
                
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
            
            //Detmermine which of the stage/modalities has mutant data. Choose the first one
            for (var pid in modalityData){
                if (modalityData[pid]['vols']['mutant'].length > 1){
                    var wildtypeData = modalityData[pid]['vols']['wildtype'];
                    var mutantData = modalityData[pid]['vols']['mutant'];
                    break
                }
            }
            
            //Check the modality button
            $("#modality_stage input[id^=" + pid + "]:radio").attr('checked',true);
            
            wtView = dcc.SpecimenView(wildtypeData, 'wt', container, WILDTYPE_COLONYID, 
                            sliceChange, onViewLoaded, scaleOrthogonalViews, config);
            views.push(wtView);
            
            mutView = dcc.SpecimenView(mutantData, 'mut', container, queryColonyId, 
                            sliceChange, onViewLoaded, scaleOrthogonalViews, config);
            views.push(mutView);
            
            /* volumes are loaded. Now make the correposnding orthogonal views
             proportial sizes to each other. eg saggital slice from each view
            should be sized propotional to their real size
            */
          
        };
        
        
        function setStageModality(pid){
            /*
             * 
             * @param {string} 
             */
            
            if (typeof wtView !== 'undefined'){
                var wtVolumes = modalityData[pid]['vols'].wildtype;
                wtView.updateData(wtVolumes);
            }
            if (typeof mutView !== 'undefined'){
                var mutVolumes = modalityData[pid]['vols'].mutant;
                mutView.updateData(mutVolumes);
            }
                
        }
        
        
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
            
            /*
             * When the download button is clicked, create a file download dislaog
             */
//            $(document.body).on('click', '#download_all' ,function(event){
//                event.preventDefault();
//                $('.down_all').multiDownload();
//            });
//            
//         
//            

            $('.scale_outer').draggable();
            
            
            $("#zoomIn")
                .button()
                .click($.proxy(function () {
                    for (var i = 0; i < views.length; i++) {
                        views[i].zoomIn();
                    }
                }, this));


            $("#zoomOut")
                .button()
                .click($.proxy(function () {
                    for (var i = 0; i < views.length; i++) {
                        views[i].zoomOut();
                    }
                }, this));
       
            
            var dlg = $('#download_dialog').dialog({
                title: 'Select volumes for download',
                resizable: true,
                autoOpen: false,
                modal: true,
                hide: 'fade',
                width: 500,
                height: 450
            });


            // Set up the table for available downloads
            $('#download').click(function (e) {
                e.preventDefault();
                dlg.load('download_dialog.html', function () {
                    
                for (var pid in modalityData){
                    var vols = modalityData[pid]['vols'];
                    
                    for (var vol in vols['mutant']){
                         var path = vols['mutant'][vol];
                         $("#download_table tbody").append("<tr>" +
                                    "<td>" + basename(path) + "</td>" +
                                    "<td>" + "<a href='"+ path + "' class='down_all'>Download</a></td>" +
                                    "</tr>");
                    }
                    for (var vol in vols['wildtype']){
                        var path = vols['wildtype'][vol];
                         $("#download_table tbody").append("<tr>" +
                                    "<td>" + basename(path) + "</td>" +
                                    "<td>" + "<a href='"+ path + "'>Download</a></td>" +
                                    "</tr>");
                    }  
                }
                    
                
                    dlg.dialog('open');
                }.bind(this));
            }); 
           
    
            
            $("#modality_stage" ).buttonset();
            $("#orientation_buttons" ).buttonset();
            $("#orthogonal_views_buttons").buttonset();
      
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
            
            
            // Scale bar visiblity
            $('#scale_visible').change(function (ev) {
                if( $(ev.currentTarget).is(':checked') ){
                    scaleVisible = true;
                    $('#scale_select').selectmenu("enable");
                }else{
                    scaleVisible = false;
                     $('#scale_select').selectmenu("disable");
                }
                for (var i = 0; i < views.length; i++) {
                    views[i].setScaleVisibility(scaleVisible);
                }
                scaleOrthogonalViews();
            }.bind(this));
            
           
            
            $('#scale_select')
                .append(scaleLabels().join(""))
                .selectmenu({
                    width: 80,
                    height: 20,
                    change: $.proxy(function (event, ui) { 
                        config.scaleBarSize = ui.item.value;
                        $('.scale_text').text(ui.item.label);
                        scaleOrthogonalViews();
                        
                    }, this)
                });
                
            $('#scale_select').val(600).selectmenu('refresh');
            $('.scale_text').text($('#scale_select').find(":selected").text());
           
            
            
        
            
       
            
            $('.modality_button').change(function (ev) {
                var checkedStageModality = ev.currentTarget.id;
                setStageModality(checkedStageModality);
            });
            
            $('.orientation_button').change(function (ev) {
              var orientation = ev.currentTarget.id;
                setViewOrientation(orientation);
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
                            scaleOrthogonalViews();
                       
                            //console.log('after scaling', $('#X_mut').height());
                            var evt = document.createEvent('UIEvents');
                            evt.initUIEvent('resize', true, false,window,0);
                            window.dispatchEvent(evt);
                        }, this)
                    })
                
//            $('.windowLevel').tooltip({content: "Adjust brightness/contrast",
//                 show: {delay: 1200 }
//             });
//             
//            $("#selectorWrap_wt").tooltip({content: "Select WT embryo to view",
//             show: {delay: 1200 }});
//         
//            $("#selectorWrap_mut").tooltip({content: "Select mutant embryo to view",
//             show: {delay: 1200 }});
         
         
            scaleOrthogonalViews();
        
    }//AttachEvents
    
    

        function basename(path) {
            /**
             * Extract the basename from a path
             * @method basename
             * @param {String} path File path
             */
            return path.split(/[\\/]/).pop();
        }
        ;
    
    function setViewOrientation(orientation){
                     
//            // No orientation controls for single specimen view  
//            if (wildtypes.length < 1 || mutants.length < 1){
//                 $("#orientation_radio" ).hide();
//                 return;
//            }
          
         if (orientation === 'vertical'){
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
       
         }
         if (orientation === 'horizontal'){
             
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
         }
    }
    

    // Style the control buttons

    $(function () {
                
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
    setActiveModalityButtons();
    loadViewers(container);
    attachEvents();
    
    
    
    }//EmbryoViewer
     
   
    
})();
