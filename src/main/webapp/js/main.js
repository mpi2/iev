
goog.require('iev.specimenview');
//goog.require('iev.localStorage');


(function () {
    if (typeof dcc === 'undefined')
        dcc = {};
    
     dcc.EmbryoViewer = function(data, div, queryType, queryId, bookmarkData) {
         /**
          * @class EmbryoViewer
          * @type String
          */

        var IMAGE_SERVER = 'https://www.mousephenotype.org/images/emb/';
        //var IMAGE_SERVER = 'http://localhost:8000/'; // For testing localhost
        var WILDTYPE_COLONYID = 'baseline';
        var OUTPUT_FILE_EXT = '.NRRD';
        var queryId = queryId;
        var horizontalView;
        var scaleVisible = true;
        var wtView;
        var mutView;
        var currentModality;
        var currentCentreId;
        var downloadTableRowSource;
        var spinner; // Progress spinner
        var currentZoom = 0;
        var currentOrientation = 'horizontal';
        var currentViewHeight;
        var bookmarkReady = false;
        var mgi;
        var gene_symbol;
        var availableViewHeight; // The window height minus all the header and controls heights
          
        //Give users a warning about using the deprecated colony_id=test url
        if (queryType === 'colony ID' && queryId === 'test'){
            var source   = $("#redirect_test_template").html();
            var template = Handlebars.compile(source);
            $('#' + div).append(template());
            return;
        }
        var localStorage;
        
      
                    
        
        
        
        
        /**
         * 
         * @type {object} modality_stage_pids
         * A mapping of procedure ids and imaging modality/stage key
         */
        
         // Contains a bunch of modalityData objects
         // {centreId: modalitydata}
        var centreData = {};
        
        var getModalityData = function(){
            return {
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
    }
        
        var volorder = ["203", "204", "202"]; //At startup, search in this order for modality data to display first
        
        if (bookmarkData['modality'] !== "null") {
            volorder.unshift(bookmarkData['modality']);
        }
          
        
        /*
         * Map micrometer scale bar sizes to labels
         */
        
        var scales = {
            
            currentBarSize: 600,
            
            options: {
                '200&#956;m': 200,
                '400&#956;m': 400,
                '600&#956;m': 600,
                '1mm': 1000,
                '2mm': 2000,
                '4mm': 4000,
                '6mm': 6000
            }
        };
        
        
        var centreOptions = {
            1: 'BCM',
            3: 'GMC',
            4: 'HAR',
            6: 'ICS',
            7: 'J',
            8: 'TCP',
            9: 'Ning',
            10: 'RBRC',
            11: 'UCD',
            12: 'Wtsi'
        };
        
        
        var ICONS_DIR = "images/centre_icons/"; //Also in SpecimenView
        
        var centreIcons ={ // This should go somewhere else. There's also a copy in SpecimenView
            1: "logo_Bcm.png",
            3: "logo_Gmc.png",
            4: "logo_H.png",
            6: "logo_Ics.png",
            7: "logo_J.png",
            8: "logo_Tcp.png",
            9: "logo_Ning.png",
            10: "logo_Rbrc.png",
            11: "logo_Ucd.png",
            12: "logo_Wtsi.png"
        };
            
            

        var scaleLabels = function () {
            var options = [];
            for (var key in scales.options) {

                options.push("<option value='" + scales.options[key] + "'>" + key + "</option>");
            }
            return options;
        };

       

        function centreSelector() {
            /*
             * Sets up the drop down menu with avaiable centre icons for this particular mgi/colony etc
             */
//            
//            //Just for testing
//            // Populate drop down box with available centres
            function availableCentres() {
                var options = [];
                for (var key in centreOptions) {
                    if (key in data['centre_data']) {
                        var iconClass = 'centreSelectIcon cen_' + key;
                        options.push("<option value='" + key + "'" + "' data-class='" + iconClass + "'>" + centreOptions[key] + "</option>");
                    }
                }
                return options;
            }
            var $centre_select = $('#centre_select');

            $centre_select.append(availableCentres().join(""));

            $centre_select.iconselectmenu()
                    .iconselectmenu("menuWidget")
                    .addClass("ui-menu-icons customicons");

            $centre_select
                    .iconselectmenu({
                        change: $.proxy(function (event, ui) {
                            setCentre(event.currentTarget.innerText);

                        }, this)
                    })
                    .iconselectmenu("refresh");
        }
            
            
        
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
            //In case we load another dataset  
            mgi = 'undefined';
            gene_symbol = 'undefined';
           
            for (var cen in data['centre_data']){ // Pick the first centre you come across as the current centre
                var modData =  getModalityData(); 
                //Display the top control bar
                $('#top_bar').show(); //NH? what's this

                // Loop over the centre data
                for(var i = 0; i < objSize(data['centre_data'][cen]); i++) {
                    //loop over the data for this centre

                    var obj = data['centre_data'][cen][i];

                    buildUrl(obj);

                    if (obj.colonyId === WILDTYPE_COLONYID){
                        modData[obj.pid]['vols']['wildtype'][obj.volume_url] = obj;

                    }else{
                        modData[obj.pid]['vols']['mutant'][obj.volume_url] = obj;
                        //Now set the current MGI and Genesymbol
                        if (mgi === 'undefined'){
                            mgi = obj.mgi;
                        }
                        if (gene_symbol=== 'undefined'){
                            gene_symbol = obj.geneSymbol;
                        }
                    }
                }
                centreData[cen] = modData;
           
            }
            currentCentreId = cen; // Just pick the last one to be visible
            
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
            for (var pid in centreData[currentCentreId] ){
                if (objSize(centreData[currentCentreId][pid]['vols']['mutant']) < 1){
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
            
            data['volume_url'] = url;

            return data;
        }               
        
        function bookmarkConfigure() {
            
            if (!bookmarkReady) {               

                // Set views       
                if (bookmarkData['s'] === 'off') {
                    $('#X_check').trigger('click');
                }

                if (bookmarkData['c'] === 'off') {
                    $('#Y_check').trigger('click');
                }

                if (bookmarkData['a'] === 'off') {
                    $('#Z_check').trigger('click');
                }

                // Set orientation
                if (bookmarkData['orientation'] === 'vertical') {
                    $("#orientation_button").trigger("click");
                }

                // Set zoom
                zoomBy(bookmarkData['zoom']);
                
                // Set viewer height
                if (bookmarkData['h']) {
                    var $viewHeight = $("#viewHeightSlider");
                    $viewHeight.slider('value', bookmarkData['h']);
                    $viewHeight.slider("option", "slide").call($viewHeight, null, { value: bookmarkData['h']});
                }

                // Set ready
                bookmarkReady = true;
            
            }
            
        }
        
        function generateBookmark() {
            
            var currentUrl = window.location.href;
            var hostname = currentUrl.split('?')[0];
            
            var s =  ortho['X']['visible'] ? 'on' : 'off';
            var c = ortho['Y']['visible'] ? 'on' : 'off';
            var a = ortho['Z']['visible'] ? 'on' : 'off';
            
            var bookmark = hostname
                + '?' + bookmarkData['mode'] + '=' + bookmarkData['gene']
                + '&mod=' + currentModality
                + '&h=' + currentViewHeight
                + '&wt=' + wtView.getCurrentVolume()['animalName']
                + '&mut=' + mutView.getCurrentVolume()['animalName']
                + '&s=' + s
                + '&c=' + c
                + '&a=' + a
                + '&wx=' + wtView.getIndex('X')
                + '&wy=' + wtView.getIndex('Y')
                + '&wz=' + wtView.getIndex('Z')
                + '&mx=' + mutView.getIndex('X')
                + '&my=' + mutView.getIndex('Y')
                + '&mz=' + mutView.getIndex('Z')                
                + '&wl=' + wtView.getBrightnessLower()
                + '&wu=' + wtView.getBrightnessUpper()
                + '&ml=' + mutView.getBrightnessLower()
                + '&mu=' + mutView.getBrightnessUpper()
                + '&o=' + currentOrientation
                + '&zoom=' + currentZoom;
            return bookmark;
        }
                
   
        function zoomBy(times) {
            
            if (times < 0) {
                while (times < 0) {                    
                    setTimeout(function() {
                        zoomViewsOut();
                    }, 1000);   
                    times++;
                }
            }
            
            if (times > 0) {
                while (times > 0) { 
                    setTimeout(function() {
                        zoomViewsIn();
                    }, 1000);   
                    times--;
                }
            }             
            
        }
        
        function zoomViewsIn() {
            wtView.zoomIn();
            mutView.zoomIn();
        }
        
        function zoomViewsOut() {
            wtView.zoomOut();
            mutView.zoomOut();
        }


        function scaleOrthogonalViews(){
            /**
             * Set the largest extent for each of the dimensions
             *@method setLargestDimesions
             */
          
            // Set the proportional views
            for (var i=0; i < views.length; ++i){
                views[i].rescale(scales.currentBarSize);   
            }
           
            window.dispatchEvent(new Event('resize')); 
        }
        
        
        function beforeReady(){
            
            $('#modality_stage :input').prop("disabled", true); 
            $("#modality_stage").buttonset('refresh');
        }
        
        function onReady(){
                        
            setActiveModalityButtons();
            //$('#modality_stage :input').prop('disabled', false);
            $("#modality_stage").buttonset('refresh');
            
            currentZoom = 0;
            
            // Configure viewer styling based on bookmark data
            bookmarkConfigure();
            
        }  
        
        
        function loadViewers(container){
            localStorage = new ievLocalStorage(function(){  
                afterLoadingLocalStorage(container);
            }); 
        }
        
                    
        function afterLoadingLocalStorage(container) {
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
                if (objSize(centreData[currentCentreId][pid]['vols']['mutant']) > 0){ // !!!! Don't forget to switch off once I work out how to load ct by default
                    var wildtypeData = centreData[currentCentreId][pid]['vols']['wildtype'];
                    var mutantData = centreData[currentCentreId][pid]['vols']['mutant'];
                    break;
                }
            }
            
            currentModality = pid;
            
            //Check the modality button
            $("#modality_stage input[id^=" + pid + "]:radio").attr('checked',true);
            
            // only load if baseline data available
            if (objSize(wildtypeData) > 0){
                var wtConfig = {specimen: bookmarkData['wt'] };
                wtView = new iev.specimenview(wildtypeData, 'wt', container, 
                    WILDTYPE_COLONYID, sliceChange, wtConfig, loadedCb, localStorage);
                views.push(wtView);
            }
            
            // Set mutant specimen based on bookmark   
            var mutConfig = {specimen: bookmarkData['mut'] };
            mutView = new iev.specimenview(mutantData, 'mut', container, 
                queryId, sliceChange, mutConfig, loadedCb, localStorage);
            views.push(mutView);   
            centreSelector();
        };
        
        
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
        
        
        


            ////////////////////testing
//            $.widget("custom.iconselectmenu", $.ui.selectmenu, {
//                _renderItem: function (ul, item) {
//                    var li = $("<li>", {text: item.label});
//                    if (item.disabled) {
//                        li.addClass("ui-state-disabled");
//                    }
//
//                    $("<span>", {
//                        style: item.element.attr("data-style"),
//                        "class": "ui-icon " + item.element.attr("data-class")
//                    })
//                            .appendTo(li);
//                    return li.appendTo(ul);
//                }
//            });
//            //remove any current options
//            $('#centre_select')
//                    .find('option')
//                    .remove()
//                    .end();
//
//            // Add the volume options
//            var options = [];
//            for (var cen in data['centre_data']){
//                var iconUrl = ICONS_DIR + centreIcons[cen];
//                options.push('<option value="' + cen + '" data-class="cen_'+ cen + ' centreIcons"></option>');
//            }
//
//
//            $('#centre_select')
//                    .append(options.join("")).val(currentCentreId);
//
//
//            $('#centre_select').iconselectmenu()
//                    .iconselectmenu("menuWidget")
//                    .addClass("ui-menu-icons customicons");
//
//            $('#centre_select')
//                    .iconselectmenu({
//                        change: $.proxy(function (event, ui) {
//                            setCentre(ui.item.value);
//                        }, this)
//                    })         
//            }
          
               
//            
        
        
        
        function setCentre(cid){
            /*
             * Change the centre. Only works if there is data from multiple centres.
             * Such as with reference lines
             * 
             */
           currentCentreId = cid;
           setStageModality(currentModality);
        }
        
        
        function setStageModality(pid){
            /*
             * 
             * @param {string} 
             */
            beforeReady();
            currentModality = pid;
            
            if (typeof wtView !== 'undefined'){
                var wtVolumes = centreData[currentCentreId][pid]['vols'].wildtype;
                
                if (Object.keys(wtVolumes).length > 0) {
                    $("#wt").show();
                    wtView.updateData(wtVolumes);
                    wtView.reset();
                } else {
                    $("#wt").hide();                    
                }
            }
            if (typeof mutView !== 'undefined'){
                var mutVolumes = centreData[currentCentreId][pid]['vols'].mutant;

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
             * Switches the low power option on or off
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
        
            
            $('#screenShot').click(function(e) {
                for (var i = 0; i < views.length; i++) {
                    views[i].screenShot();
                }
            }.bind(this));
          
            $('#low_power_check').button().click(function(e){                               
                setLowPowerState(e.currentTarget.checked);
            }.bind(this));


            $("#reset")
               
                .click($.proxy(function () {
                   for (var i = 0; i < views.length; i++) {
                        views[i].reset();
                    } 
                }, this));
                
                
            $("#invertColours")
                .click(function (e) {
                     e.preventDefault();
                    //First change the background colors and scale colors
                    var checked;
                    if ($(this).hasClass('ievgrey')){
                        $(this).removeClass('ievgrey');
                        $(this).addClass('ievInvertedGrey');
                        $(".sliceView").css("background-color", "#FFFFFF");
                        $('.scale_text').css("color", "#000000");
                        $('.scale').css("background-color", "#000000");
                        checked = true;
                    } else if ($(this).hasClass('ievInvertedGrey')){  
                        $(this).removeClass('ievInvertedGrey');
                        $(this).addClass('ievgrey');
                        $(".sliceView").css("background-color", "#000000");
                        $('.scale_text').css("color", "#FFFFFF");
                        $('.scale').css("background-color", "#FFFFFF");
                        checked = false;
                    }
                    //Now get the SpecimenViews to reset
                    for (var i = 0; i < views.length; i++) {
                        views[i].invertColour(checked);
                    }

                });
                
               
                
            $('.scale_outer').draggable();
            
            
            $("#zoomIn")
                .button()
                .click($.proxy(function () {                                        
                    for (var i = 0; i < views.length; i++) {
                        views[i].zoomIn();
                    }
                    currentZoom++;
                }, this));


            $("#zoomOut")
                .button()
                .click($.proxy(function () {                    
                    for (var i = 0; i < views.length; i++) {
                        if (!views[i].zoomOut()) {
                            return; // stop trying to zoom if we hit a limit
                        };                        
                    }
                    currentZoom--;
                }, this));
       

            // Set up the table for available downloads
            $('#download').click(function (e) {
                e.preventDefault();
                setupDownloadTable(e);
            });
            
            // Create bookmark when clicked
            $('#createBookmark').click(function (e) {
                if (!bookmarkReady) { 
                    return;
                }
                e.preventDefault();
                var newBookmark = generateBookmark();   
                window.prompt("Bookmark created!\nCopy to clipboard (Ctrl/Cmd+C + Enter)", newBookmark);   
            });            
   
            $("#modality_stage" ).buttonset();
            $("#orthogonal_views_buttons").buttonset();

            /*
             * Orientation buttons *************************
             */
            
            $("#orientation_button").click(function(e) {
                e.preventDefault();
                if ($(this).hasClass('vertical')){
                    $(this).removeClass('vertical');
                    $(this).addClass('horizontal');
                    setViewOrientation('horizontal');
                    currentOrientation = 'horizontal';
                }
                else{
                    $(this).removeClass('horizontal');
                    $(this).addClass('vertical');
                    setViewOrientation('vertical');
                    currentOrientation = 'vertical';
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
                
                currentZoom = 0; // necessary as the zoom resets on change

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
                        scales.currentBarSize = ui.item.value;
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
                        value: 500,
                        slide: $.proxy(function (event, ui) {
                            currentViewHeight = ui.value;
                            $('.sliceWrap').css('height', ui.value);                            
                            scaleOrthogonalViews();                       
                            var evt = document.createEvent('UIEvents');
                            evt.initUIEvent('resize', true, false,window,0);
                            window.dispatchEvent(evt);
                        }, this)
                    }); 
         
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
                height: 550,
                position: { my: "left bottom", at: "left top", of: $('#top_bar')}
            });
         

            
            var template = Handlebars.compile(downloadTableRowSource);

            dlg.load('download_dialog.html', function () {
                for (var pid in centreData[currentCentreId]) {
                    if (pid !== currentModality)
                        continue;  // Only supply current modality data for download
                    var vols = centreData[currentCentreId][currentModality]['vols'];
                    
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
        
        function setBreadCrumb() {
            /*
             * Get the dynamically generated menu code. Split into main menu and the login section
             */
            
            var mgi_href = '/data/genes/' + mgi;
            var b_link = $('#ievBreadCrumbGene').html(gene_symbol).attr('href', mgi_href)
        }
        
    function setInitialViewerHeight(){
       /*Get the height available for the specimen views*/
        var sliceViewControlsHeight = 32 + 6; // Currently set in embryo.css the 6 is for padding
        var windowHeight = $( window.top ).innerHeight();
        var helpHeight = $('#help').outerHeight();
        var impcHeaderHeight = $('#header').outerHeight();
        var subHeaderHeight = $('#iev_subHeader').outerHeight();
        var mainControlsHeight = $('#ievControlsWrap').outerHeight();
        availableViewHeight = Math.round((windowHeight - impcHeaderHeight - subHeaderHeight - 
                mainControlsHeight - helpHeight -( sliceViewControlsHeight * 2 )) / 2);
        console.log(windowHeight, impcHeaderHeight, subHeaderHeight, mainControlsHeight);
        /* add a new stylesheet fort the specimen view wrapper height as it's not been created yet */
        $("<style type='text/css'> .sliceWrap{height:" + availableViewHeight + "px;}</style>").appendTo("head");
   
    }
    
    
    function setViewOrientation(orientation){
          
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

            $("#help_link").button({
                icons: {
                    primary: 'ui-icon-help'
                }

            }).css({width: '30'});


        });
    
//        function getFileSystem() {
//            var localStorage = new iev.localStorage();
//            // pass in success and error callbacks
//            localStorage.checkForHtml5Storage(
//                    function (fs_object) {
//                        console.log(fs_object);
//                        fileSystem = fs_object;
//                        for (var i=0; i < views.length; ++i){
//                            views[i].setFileSystem(fileSystem);   
//                        }
//
//                    }.bind(this));
//        }
//        
        

    
    setBreadCrumb();
    setInitialViewerHeight();
    setActiveModalityButtons();
    loadViewers(container);
    attachEvents();
    beforeReady();

    
    
    
    }//EmbryoViewer
     
   
    
})();
