(function () {
    if (typeof dcc === 'undefined')
        dcc = {};
    
     dcc.EmbryoViewer = function(data, div, queryType, queryId) {
         /**
          * @class EmbryoViewer
          * @type String
          */
        
   
        //var IMAGE_SERVER = 'https://www.mousephenotype.org/images/emb/';
        //var ANA_SERVER = 'https://www.mousephenotype.org/images/ana/';
        var IMAGE_SERVER = 'http://localhost:8000/emb/';
        var ANA_SERVER = 'http://localhost:8000/ana/';
        var WILDTYPE_COLONYID = 'baseline';
        var OUTPUT_FILE_EXT = '.nrrd';
        var queryId = queryId;
        var horizontalView = undefined;
        var scaleVisible = true;
        var wtView;
        var mutView;
        var currentModality;
        var downloadTableRowSource;
        var spinner; // Progress spinner 
          
        //Give users a warning about using the deprecated colony_id=test url
        if (queryType === 'colony ID' && queryId === 'test'){
            var source   = $("#redirect_test_template").html();
            var template = Handlebars.compile(source);
            $('#' + div).append(template());
            return;
        }
        
        /**
         * 
         * @type {object} modality_stage_pids
         * A mapping of procedure ids and imaging modality/stage key
         */
        var modalityData = {
            203: {
                'id': 'CT E14.5/15.5',
                'vols': {
                    'mutant': {},
                    'wildtype': {}
                }
            },
            204: {
                'id': 'CT E18.5',
                'vols':{
                    'mutant': {},
                    'wildtype': {}
                }
            },
            202:{
                'id': 'OPT 9.5',
                'vols':{
                    'mutant': {},
                    'wildtype': {}
                }
            }
        };
        
         var volorder = ["203", "204", "202"]; //At startup, search in this order for modality data to display first
        
        
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
        };
            
        
        var scaleLabels = function(){
            var options = [];
            for (var key in scaleOptions){
           
                options.push("<option value='" + scaleOptions[key]  + "'>" + key + "</option>");
            }
            return options;
        };
        
        
        var config = { //remove hardcoding
            scaleBarSize: 600,
        };
        
        var spinnerOpts = {
            lines: 8 // The number of lines to draw
            , length: 6 // The length of each line
            , width: 6 // The line thickness
            , radius: 8 // The radius of the inner circle
            , scale: 1 // Scales overall size of the spinner
            , corners: 1 // Corner roundness (0..1)
            , color: '#ef7b0b' // #rgb or #rrggbb or array of colors
            , opacity: 0.2 // Opacity of the lines
            , rotate: 0 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 1 // Rounds per second
            , trail: 50 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            , zIndex: 2e9 // The z-index (defaults to 2000000000)
            , className: 'spinner' // The CSS class to assign to the spinner
            , top: '50%' // Top position relative to parent
            , left: '70%' // Left position relative to parent
            , shadow: false // Whether to render a shadow
            , hwaccel: true // Whether to use hardware acceleration
            , position: 'absolute' // Element positioning
        };

     
        /**
         * Seperate out the baseline data and the mutant data.
         * If data is not available, load an error message
         */
        if (data['success']){
            
            //Display the top control bar
            $('#top_bar').show();
            
            // Get the baselines and the mutant paths
            for(var i = 0; i < objSize(data.volumes); i++) {

                var obj = data.volumes[i];
                               
                buildUrl(obj);
                
                if (obj.colonyId === WILDTYPE_COLONYID){
                    modalityData[obj.pid]['vols']['wildtype'][obj.volume_url] = obj;

                }else{
                    modalityData[obj.pid]['vols']['mutant'][obj.volume_url] = obj;
                }
                
            }
            
            // Get analysis data, if it exists
            var ana = data.analysis;
            console.log(ana);
            
            // Create population average url
            analysisUrl(ana, 'volume_url', 'average', OUTPUT_FILE_EXT);
            
            // Create Jacobian URLs
            analysisUrl(ana, 'jacobian_overlay', 'jacobian', OUTPUT_FILE_EXT);
            analysisUrl(ana, 'jacobian_cmap', 'jacobian', '.txt');
            
            // Create intensity URLs
            analysisUrl(ana, 'intensity_overlay', 'intensity', OUTPUT_FILE_EXT);
            analysisUrl(ana, 'intensity_cmap', 'intensity', '.txt');

            // Add populate average volume to both viewers
            modalityData[ana.pid]['vols']['wildtype'][ana.volume_url] = ana;
            modalityData[ana.pid]['vols']['mutant'][ana.volume_url] = ana;

        }else{
            //Just display a message informing no data
            var data = {
                colonyId: queryId,
                queryType: queryType
            };
            
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
             * Check which modalities we have data for and inactivate buttons for which we have no data
             */
            for (var pid in modalityData ){
                if (objSize(modalityData[pid]['vols']['mutant']) < 1){
                    $("#modality_stage input[id^=" + pid + "]:radio").attr('disabled', true);
                }
                else{
                    $("#modality_stage input[id^=" + pid + "]:radio").attr('disabled', false);
                }
            }  
        }
        
    
        function buildUrl(data){
            /**
             * Create a url from the data returned by querying database for a colonyID
             * URL should point us towards the correct place on the image server.
             * add the URL to the data object
             * @method buildUrl
             * @param {json} data Data for colonyID 
             */

            var url = IMAGE_SERVER + data.cid + '/' 
                    + data.lid + '/' 
                    + data.gid + '/' 
                    + data.sid + '/' 
                    + data.pid + '/' 
                    + data.qid + '/' 
                    + data.imageForDisplay;
                    //+ data.url;
            
            data['volume_url'] = url

            return data;
        }
        
        function analysisUrl(data, field, name, ext){
            /**
             * Create url for the analysis data, based on type and extension
             * @method analysisUrl
             * @param {json} data Data for colonyID 
             */

            var url = ANA_SERVER + data.cid + '/' 
                    + data.lid + '/' 
                    + data.gid + '/' 
                    + data.sid + '/' 
                    + data.pid + '/' 
                    + data.qid + '/' 
                    + data.id + '/'
                    + name + ext
            
            data[field] = url;
            return data;
        }
        
        function scaleOrthogonalViews(){
            /**
             * Set the largest extent for each of the dimensions
             *@method setLargestDimesions
             */
          
            // Set the proportional views
            for (var i=0; i < views.length; ++i){
                views[i].rescale();   
            }
           
            window.dispatchEvent(new Event('resize')); 
        }
        
        
        function loadedCb(){
            /*
             * called when each specimenView has finished loading
             * @param {type} container
             * @return {undefined}
             */
            for (var i = 0; i < views.length; i++){
                if (!views[i].isReady()) return;
            }
            onReady();
        }
        
        function beforeReady(){
            $('#modality_stage :input').prop("disabled", true); 
            $("#modality_stage").buttonset('refresh');
        }
        
        function onReady(){
            setActiveModalityButtons();
            //$('#modality_stage :input').prop('disabled', false);
            $("#modality_stage").buttonset('refresh');
            
        }
        
        
            
        function loadViewers(container) {
            /**
             * Create instances of SpecimenView and append to views[]. 
             * Get the dimensions of the loaded volumes
             * @method loadViewers
             * @param {String} container HTML element to put the specimen viewer in to
             */
            
            
            // Find first lot of data to use. loop over PIDs in reverse to try CT before OPT
            var pid;
            for (var i in volorder){
                pid = volorder[i];
                if (objSize(modalityData[pid]['vols']['mutant']) > 0){ // !!!! Don't forget to switch off once I work out how to load ct by default
                    var wildtypeData = modalityData[pid]['vols']['wildtype'];
                    var mutantData = modalityData[pid]['vols']['mutant'];
                    break;
                }
            }
            
            currentModality = pid;
            
            //Check the modality button
            $("#modality_stage input[id^=" + pid + "]:radio").attr('checked',true);
            
            // only load if baseline data available
            if (objSize(wildtypeData) > 0){
                wtView = dcc.SpecimenView(wildtypeData, 'wt', container, 
                WILDTYPE_COLONYID, sliceChange, config, loadedCb);
                views.push(wtView);
            }
            mutView = dcc.SpecimenView(mutantData, 'mut', container, 
            queryId, sliceChange, config, loadedCb);
            views.push(mutView);   
        };
        
        
        
        function setStageModality(pid){
            /*
             * 
             * @param {string} 
             */
            beforeReady();
            currentModality = pid;
            
            if (typeof wtView !== 'undefined'){
                var wtVolumes = modalityData[pid]['vols'].wildtype;
                
                if (Object.keys(wtVolumes).length > 0) {
                    $("#wt").show();
                    wtView.updateData(wtVolumes);
                    wtView.reset();
                } else {
                    $("#wt").hide();                    
                }
            }
            if (typeof mutView !== 'undefined'){
                var mutVolumes = modalityData[pid]['vols'].mutant;

                if (Object.keys(mutVolumes).length > 0) {
                    $("#mut").show();
                    mutView.updateData(mutVolumes);
                    mutView.reset();
                } else {
                    $("#mut").hide();
                }
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
        
        
        function setLowPowerState(state){
            /*
             * Switches the low poer option on or off
             */

            for (var i = 0; i < views.length; i++) {
                views[i].setLowPowerState(state);
            } 
        }
        
        
        function getNewFileName(volData){
            /* .. function:: loadxhtml(url, data, reqtype, mode)
              The file names in the Preprocessed db are just procedure performed? 
              We need domething more informative downloading

            Parameters:

            * `volData`: object
                containing al the data from the database for this volume
               
            Returns: String
             */
            var path = volData['volume_url'];
            var sex = volData['sex'];
            var geneSymbol = sanitizeFileName(volData['geneSymbol']);
            var animalName = sanitizeFileName(volData['animalName']);
            var newPath = sex + '_' + animalName + '_' + geneSymbol;
            return newPath;
            
            
        }

        function attachEvents() {
            /**
             * 
             */
        
            
            $('#screenShot').click(function(e){
                for (var i = 0; i < views.length; i++) {
                    views[i].screenShot();                }
            }.bind(this));
          
            $('#low_power_check').click(function(e){
                setLowPowerState(e.currentTarget.checked);
            }.bind(this));


            $("#reset")
                .button()
                .click($.proxy(function () {
                   for (var i = 0; i < views.length; i++) {
                        views[i].reset();
                    } 
                }, this));
                
                
            $("#invertColours")
                .button()
                .click($.proxy(function (e) {
                    //First change the background colors and scale colors
                    var checked = e.target.checked;
                    if (checked) {
                        $(".sliceView").css("background-color", "#FFFFFF");
                        $('.scale_text').css("color", "#000000");
                        $('.scale').css("background-color", "#000000");
                    } else {
                        $(".sliceView").css("background-color", "#000000");
                        $('.scale_text').css("color", "#FFFFFF");
                        $('.scale').css("background-color", "#FFFFFF");
                    }
                    //Now get the SpecimenViews to reset
                    for (var i = 0; i < views.length; i++) {
                        views[i].invertColour(checked);
                    }

                }, this));
                
                
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
       

            // Set up the table for available downloads
            $('#download').click(function (e) {
                e.preventDefault();
                setupDownloadTable(e);
            });
            
        
            
   
            $("#modality_stage" ).buttonset();
            $("#orthogonal_views_buttons").buttonset();

            /*
             * Orientation buttons *************************
             */
            
            $("#orientation_button").click(function(){
                if ($(this).hasClass('vertical')){
                    $(this).removeClass('vertical');
                    $(this).addClass('horizontal');
                    setViewOrientation('horizontal');
                }
                else{
                    $(this).removeClass('horizontal');
                    $(this).addClass('vertical');
                    setViewOrientation('vertical');
                }
            });
            
            /*
             * ********************************************
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
            
            
            
            
            // Scale bar visiblity
            $('#scale_visible').change(function (ev) {
                if( $(ev.currentTarget).is(':checked') ){
                    scaleVisible = true;
                    
                    $('#scale_select').selectmenu("enable");
                    $('.scale_outer').css(
                        {'visibility': 'visible'}
                     );
                }else{
                    scaleVisible = false;
                     $('#scale_select').selectmenu("disable");
                      $('.scale_outer').css(
                        {'visibility': 'hidden'}
                     );
                }
                for (var i = 0; i < views.length; i++) {
                    views[i].setScaleVisibility(scaleVisible);
                }
                scaleOrthogonalViews();
            }.bind(this));
            
           
            /*
             * The selectmenu for the scale bar sizes
             */
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
            

            

            $(".button").button();
         
            

            $("#viewHeightSlider")
                    .slider({
                        min: 200,
                        max: 1920,
                        values: [500],
                        slide: $.proxy(function (event, ui) {
                            $('.sliceWrap').css('height', ui.value);                            
                            scaleOrthogonalViews();                       
                            var evt = document.createEvent('UIEvents');
                            evt.initUIEvent('resize', true, false,window,0);
                            window.dispatchEvent(evt);
                        }, this)
                    });
                
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
            // Put this here as calling this multiple times does not work
            downloadTableRowSource = $("#downloadTableRowTemplate").html();
        
    }//AttachEvents
    
    
        function setupDownloadTable() {
            var dlg = $('#download_dialog').dialog({
                title: 'Select volumes for download',
                resizable: true,
                autoOpen: false,
                modal: true,
                hide: 'fade',
                width: 700,
                height: 550
            });
         

            
            var template = Handlebars.compile(downloadTableRowSource);

            dlg.load('download_dialog.html', function () {
                for (var pid in modalityData) {
                    if (pid !== currentModality)
                        continue;  // Only supply current modality data for download
                    var vols = modalityData[pid]['vols'];
                    
                    var currentlyViewed = [];
                    for (var i=0; i < views.length; ++i){
                        currentlyViewed.push(views[i].getCurrentVolume()['volume_url'])
                    }

                    for (var vol in vols['mutant']) {
                        
                        var volData = vols['mutant'][vol];
                        var displayName = getNewFileName(volData);
                        var remotePath = volData['volume_url'];
                        var bg = '#FFFFFF';
                        if ($.inArray(remotePath, currentlyViewed)  > -1) bg = '#ef7b0b';
                        var data = {
                            remotePath: remotePath + ";" + displayName,
                            volDisplayName: displayName,
                            bg: bg
                        };

                        $("#mutant_table tbody").append(template(data));
                    }
                    for (var vol in vols['wildtype']) {
                        var volData = vols['wildtype'][vol];
                        var displayName = getNewFileName(volData);
                        var remotePath = volData['volume_url'];
                        var bg = '#FFFFFF';
                        if ($.inArray(remotePath, currentlyViewed)  > -1) bg = '#ef7b0b';
                        var data = {
                            remotePath: remotePath + ";" + displayName,
                            volDisplayName: displayName,
                            bg: bg
                        };

                        $("#wt_table tbody").append(template(data));
                    }
                }
                dlg.dialog('open');

                // Once selected on download dialog, download volumes
                $('#download_dialog_button').click(function () {
                    dlg.dialog('close');
                    getZippedVolumes();
                });
            });
        }
        ;
        
        
        
        function getZippedVolumes(event) {
            /* Just try zipping one volume for now
             * 
             */
            // Jsut try with one volume for now
           var volumeURLs = "";
           var checked = $('#wt_table').find('input[type="checkbox"]:checked')
           for (var i=0; i < checked.length; ++i){
               var url = checked[i]['name'];
               volumeURLs += url + ',';  
           }
           var checked = $('#mutant_table').find('input[type="checkbox"]:checked')
           for (var i=0; i < checked.length; ++i){
               var url = checked[i]['name'];
               volumeURLs += url + ',';  
           }
            var restURL = 'rest/zip?vol=' + volumeURLs;
            // Start the progress spinner
           
            
            progressIndicator('preparing zip');
            
            $.fileDownload(restURL, {
                successCallback: function (url) {
                    progressStop();
                },
                failCallback: function (html, url) {

                    alert('There was an error downloading the images' );
                }
            });

            
        }
        
        function progressStop(){
            spinner.stop();
             $("#progressMsg").empty();
        }
        
        function progressIndicator(msg){
            
            var target =  document.getElementById("progressSpin");
            spinner = new Spinner(spinnerOpts).spin(target);
            $("#progressMsg").text(msg);   
        }
        
    
        function sanitizeFileName(dirtyString){
            var cleanString = dirtyString.replace(/[|&;$%@"<>()+,\/]/g, "");
            return cleanString;
        }

        function basename(path) {
            /**
             * Extract the basename from a path
             * @method basename
             * @param {String} path File path
             */
            return path.split(/[\\/]/).pop();
        }
        
        
        function objSize(obj) {
            var count = 0;
            var i;

            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    count++;
                }
            }
            return count;
        }
    
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
                width: '50%',
                clear: 'none'
                       
                });
                $('.sliceWrap').css({
                       width: '100%'
                });
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
           
            window.dispatchEvent(new Event('resize'));      
         }
    }
    

    // Style the control buttons

    $(function () {
                
        $( "#help_link" ).button({
             icons: {
                 primary: 'ui-icon-help'
             }
     
        }).css({width: '30'});
        

    });

//    $('body').bind('beforeunload', function () {
//        console.log('bye');
//    });
    setActiveModalityButtons();


    loadViewers(container);
    attachEvents();
    beforeReady();
    
    
    
    }//EmbryoViewer
     
   
    
})();
