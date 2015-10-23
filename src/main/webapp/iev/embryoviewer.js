goog.provide('iev.embryoviewer');
goog.require('iev.specimenview');
goog.require('iev.LocalStorage');




    
iev.embryoviewer = function(data, div, queryType, queryId, bookmarkData) {
    /**
     * @class EmbryoViewer
     * @type String
     */

   this.IMAGE_SERVER = 'https://www.mousephenotype.org/images/emb/';
   //var IMAGE_SERVER = 'http://localhost:8000/'; // For testing localhost
   this.this.WILDTYPE_COLONYID = 'baseline'
   this.queryId = queryId;
   this.horizontalView;
   this.wtView;
   this.mutView;
   this.currentModality;
   this.currentCentreId;
   this.downloadTableRowSource;
   this.spinner; // Progress spinner
   this.currentZoom = 0;
   this.currentOrientation = 'horizontal';
   this.currentViewHeight;
   this.bookmarkReady = false;
   this.mgi;
   this.gene_symbol;
   this.availableViewHeight; // The window height minus all the header and controls heights

   //Give users a warning about using the deprecated colony_id=test url
   if (queryType === 'colony ID' && this.queryId === 'test'){
       var source   = $("#redirect_test_template").html();
       var template = Handlebars.compile(source);
       $('#' + div).append(template());
       return;
   }
   this.localStorage;

   /**
    * 
    * @type {object} modality_stage_pids
    * A mapping of procedure ids and imaging modality/stage key
    */

    // Contains a bunch of modalityData objects
    // {centreId: modalitydata}
   this.centreData = {};



   this.volorder = ["203", "204", "202"]; //At startup, search in this order for modality data to display first

   if (bookmarkData['modality'] !== "null") {
       this.volorder.unshift(bookmarkData['modality']);
   }


   /*
    * Map micrometer scale bar sizes to labels
    */

   this.scales = {

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


   this.centreOptions = {
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


   this.ICONS_DIR = "images/centre_icons/"; //not used??


   this.scaleLabels = function () {
       var options = [];
       for (var key in this.scales.options) {

           options.push("<option value='" + this.scales.options[key] + "'>" + key + "</option>");
       }
       return options;
   };
   
    this.catchXtkLoadError();
    this.setBreadCrumb();
    this.setInitialViewerHeight();
    this.setActiveModalityButtons();
    this.loadViewers(container);
    this.attachEvents();
    this.beforeReady();
    this.setScaleSelect();

    iev.embryoviewer.prototype.getModalityData = function(){
       
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


   iev.embryoviewer.prototype.centreSelector = function() {
       /*
        * Sets up the drop down menu with avaiable centre icons for this particular mgi/colony etc
        */

       // Populate drop down box with available centres
       function availableCentres() {
           var options = [];

           for (var key in this.centreOptions) {
               if (key in data['centre_data']) {
                   var iconClass = 'centreSelectIcon cen_' + key;
                   options.push("<option  value='" + key + "'" + "' data-class='" + iconClass + "'>" + this.centreOptions[key] + "</option>");
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
                   width: '60px',
                   change: $.proxy(function (event, ui) {
                       setCentre(ui.item.value);
                   }, this)

               });

       // Set the current centre
       $centre_select.val(this.currentCentreId).iconselectmenu('refresh', true);
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
       this.mgi = 'undefined';
       this.gene_symbol = 'undefined';

       for (var cen in data['centre_data']){ // Pick the first centre you come across as the current centre
           var modData =  getModalityData(); 
           //Display the top control bar
           $('#top_bar').show(); //NH? what's this

           // Loop over the centre data
           for(var i = 0; i < objSize(data['centre_data'][cen]); i++) {
               //loop over the data for this centre

               var obj = data['centre_data'][cen][i];

               buildUrl(obj);

               if (obj.colonyId === this.WILDTYPE_COLONYID){
                   modData[obj.pid]['vols']['wildtype'][obj.volume_url] = obj;

               }else{
                   modData[obj.pid]['vols']['mutant'][obj.volume_url] = obj;
                   //Now set the current MGI and Genesymbol
                   if (this.mgi === 'undefined'){
                       this.mgi = obj.mgi;
                   }
                   if (this.gene_symbol=== 'undefined'){
                       this.gene_symbol = obj.geneSymbol;
                   }
               }
           }
           this.centreData[cen] = modData;

       }
       this.currentCentreId = cen; // Just pick the last one to be visible

   }else{
       //Just display a message informing no data
       var data = {
           colonyId: this.queryId,
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


   iev.embryoviewer.prototype.setActiveModalityButtons = function(){
       /*
        * Check which modalities we have data for and inactivate buttons for which we have no data
        */
       for (var pid in this.centreData[this.currentCentreId] ){
           if (objSize(this.centreData[this.currentCentreId][pid]['vols']['mutant']) < 1){
               $("#modality_stage input[id^=" + pid + "]:radio").attr('disabled', true);
           }
           else{
               $("#modality_stage input[id^=" + pid + "]:radio").attr('disabled', false);
           }
       }        
   }


   iev.embryoviewer.prototype.buildUrl = function(data){
       /**
        * Create a url from the data returned by querying database for a colonyID
        * URL should point us towards the correct place on the image server.
        * add the URL to the data object
        * @method buildUrl
        * @param {json} data Data for colonyID 
        */

       var url = this.IMAGE_SERVER + data.cid + '/' 
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

   iev.embryoviewer.prototype.bookmarkConfigure = function() {

       if (!this.bookmarkReady) {               

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
           this.bookmarkReady = true;

       }

   }

   iev.embryoviewer.prototype.generateBookmark = function() {

       var currentUrl = window.location.href;
       var hostname = currentUrl.split('?')[0];

       var s =  ortho['X']['visible'] ? 'on' : 'off';
       var c = ortho['Y']['visible'] ? 'on' : 'off';
       var a = ortho['Z']['visible'] ? 'on' : 'off';

       var bookmark = hostname
           + '?' + bookmarkData['mode'] + '=' + bookmarkData['gene']
           + '&mod=' + this.mutView
           + '&h=' + this.currentViewHeight
           + '&wt=' + this.wtView.getCurrentVolume()['animalName']
           + '&mut=' + mutView.getCurrentVolume()['animalName']
           + '&s=' + s
           + '&c=' + c
           + '&a=' + a
           + '&wx=' + this.wtView.getIndex('X')
           + '&wy=' + this.wtView.getIndex('Y')
           + '&wz=' + this.wtView.getIndex('Z')
           + '&mx=' + this.mutView.getIndex('X')
           + '&my=' + this.mutView.getIndex('Y')
           + '&mz=' + this.mutView.getIndex('Z')                
           + '&wl=' + this.wtView.getBrightnessLower()
           + '&wu=' + this.wtView.getBrightnessUpper()
           + '&ml=' + this.mutView.getBrightnessLower()
           + '&mu=' + this.mutView.getBrightnessUpper()
           + '&o=' + this.currentOrientation
           + '&zoom=' + currentZoom;
       return bookmark;
   }


   iev.embryoviewer.prototype.zoomBy = function(times) {

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

   iev.embryoviewer.prototype.zoomViewsIn = function() {
       this.wtView.zoomIn();
       this.mutView.zoomIn();
   }

   iev.embryoviewer.prototype.zoomViewsOut = function() {
       this.wtView.zoomOut();
       this.mutView.zoomOut();
   }


   iev.embryoviewer.prototype.scaleOrthogonalViews = function(){
       /**
        * Set the largest extent for each of the dimensions
        *@method setLargestDimesions
        */

       // Set the proportional views
       for (var i=0; i < views.length; ++i){
           views[i].rescale(this.scales.currentBarSize);   
       }

       window.dispatchEvent(new Event('resize')); 
   }


   iev.embryoviewer.prototype.beforeReady = function(){
       /*Inactivate the modality/stage buttons*/
       $('#modality_stage :input').prop("disabled", true); 
       $("#modality_stage").buttonset('refresh');
   }

   iev.embryoviewer.prototype.onReady = function(){

       setActiveModalityButtons();
       //$('#modality_stage :input').prop('disabled', false);
       $("#modality_stage").buttonset('refresh');

       this.currentZoom = 0;

       // Configure viewer styling based on bookmark data
       bookmarkConfigure();


       $('#scale_select').val(this.scales.currentBarSize).selectmenu('refresh');
       //Set the scale bar text value to current selected
       $('.scale_text').text($('#scale_select').find(":selected").text());
       //attachEvents();

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
       scaleOrthogonalViews();
       $('.scale_outer').draggable();

   }  


   iev.embryoviewer.prototype.loadViewers = function(container){
       this.localStorage = new ievLocalStorage(function(){  
           afterLoadingLocalStorage(container);
       }); 
   }


   iev.embryoviewer.prototype.afterLoadingLocalStorage = function(container) {
       /**
        * Create instances of SpecimenView and append to views[]. 
        * Get the dimensions of the loaded volumes
        * @method loadViewers
        * @param {String} container HTML element to put the specimen viewer in to
        */


       // Find first lot of data to use. loop over PIDs in reverse to try CT before OPT
       var pid;
       for (var i in this.volorder){
           pid = this.volorder[i];
           if (objSize(this.centreData[this.currentCentreId][pid]['vols']['mutant']) > 0){ // !!!! Don't forget to switch off once I work out how to load ct by default
               var wildtypeData = this.centreData[this.currentCentreId][pid]['vols']['wildtype'];
               var mutantData = this.centreData[this.currentCentreId][pid]['vols']['mutant'];
               break;
           }
       }

       this.mutView = pid;

       //Check the modality button
       $("#modality_stage input[id^=" + pid + "]:radio").attr('checked',true);

       // only load if baseline data available
       if (objSize(wildtypeData) > 0){
           var wtConfig = {specimen: bookmarkData['wt'] };
           this.wtView = new iev.specimenview(wildtypeData, 'wt', container, 
               this.WILDTYPE_COLONYID, sliceChange, wtConfig, loadedCb, this.localStorage);
           views.push(this.wtView);
       }

       // Set mutant specimen based on bookmark   
       var mutConfig = {specimen: bookmarkData['mut'] };
       this.mutView = new iev.specimenview(mutantData, 'mut', container, 
           this.queryId, sliceChange, mutConfig, loadedCb, this.localStorage);
       views.push(this.mutView);   
       centreSelector();
   };


   iev.embryoviewer.prototype.loadedCb = function(){
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


   iev.embryoviewer.prototype.setCentre = function(cid){
       /*
        * Change the centre. Only works if there is data from multiple centres.
        * Such as with reference lines
        * 
        */
      this.currentCentreId = cid;
      setStageModality(this.mutView);
   }


   iev.embryoviewer.prototype.setStageModality = function(pid){
       /*
        * 
        * Switch to another modality
        */
       beforeReady();
       this.mutView = pid;

       if (typeof this.wtView !== 'undefined'){
           var wtVolumes = this.centreData[this.currentCentreId][pid]['vols'].wildtype;

           if (Object.keys(wtVolumes).length > 0) {
               $("#wt").show();
               this.wtView.updateData(wtVolumes);
               this.wtView.reset();
           } else {
               $("#wt").hide();                    
           }
       }
       if (typeof this.mutView !== 'undefined'){
           var mutVolumes = this.centreData[this.currentCentreId][pid]['vols'].mutant;

           if (Object.keys(mutVolumes).length > 0) {
               $("#mut").show();
               this.mutView.updateData(mutVolumes);
               this.mutView.reset();
           } else {
               $("#mut").hide();
           }
       }    
   }



   iev.embryoviewer.prototype.sliceChange = function(id, orientation, index) {
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


   iev.embryoviewer.prototype.linkViews = function(orthoView, isLink){
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


   iev.embryoviewer.prototype.setLowPowerState = function(state){
       /*
        * Switches the low power option on or off
        */

       for (var i = 0; i < views.length; i++) {
           views[i].setLowPowerState(state);
       } 
   }


   iev.embryoviewer.prototype.getNewFileName = function(volData){
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
       if(sex === 'No data'){
           sex = 'undeterminedSex';
       };
       var geneSymbol = sanitizeFileName(volData['geneSymbol']);
       var animalName = sanitizeFileName(volData['animalName']);
       var newPath = sex + '_' + animalName + '_' + geneSymbol;
       return newPath;


   }

   iev.embryoviewer.attachEvents = function() {
       /**
        * 
        */


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
                   $(".sliceControls").css("background-color", "#FFFFFF");
                   $('.scale_text').css("color", "#000000");
                   $('.scale').css("background-color", "#000000");
                   checked = true;
               } else if ($(this).hasClass('ievInvertedGrey')){  
                   $(this).removeClass('ievInvertedGrey');
                   $(this).addClass('ievgrey');
                   $(".sliceView").css("background-color", "#000000");
                   $(".sliceControls").css("background-color", "#000000");
                   $('.scale_text').css("color", "#FFFFFF");
                   $('.scale').css("background-color", "#FFFFFF");
                   checked = false;
               }
               //Now get the SpecimenViews to reset
               for (var i = 0; i < views.length; i++) {
                   views[i].invertColour(checked);
               }

           });


       $("#zoomIn")
           .button()
           .click($.proxy(function () {                                        
               for (var i = 0; i < views.length; i++) {
                   views[i].zoomIn();
               }
               this.currentZoom++;
           }, this));


       $("#zoomOut")
           .button()
           .click($.proxy(function () {                    
               for (var i = 0; i < views.length; i++) {
                   if (!views[i].zoomOut()) {
                       return; // stop trying to zoom if we hit a limit
                   };                        
               }
               this.currentZoom--;
           }, this));


       // Set up the table for available downloads
       $('#download').click(function (e) {
           e.preventDefault();
           setupDownloadTable(e);
       });

       // Create bookmark when clicked
       $('#createBookmark').click(function (e) {
           if (!this.bookmarkReady) { 
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
               this.currentOrientation = 'horizontal';
           }
           else{
               $(this).removeClass('horizontal');
               $(this).addClass('vertical');
               setViewOrientation('vertical');
               this.currentOrientation = 'vertical';
           }
       });

       /*
        * ********************************************
        */



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

           this.currentZoom = 0; // necessary as the zoom resets on change

       });




       // Scale bar visiblity
       $('#scale_visible').change(function (ev) {
           if( $(ev.currentTarget).is(':checked') ){
               $('#scale_select').selectmenu("enable");
               $('.scale_outer').css(
                   {'visibility': 'visible'}
                );
           }else{
                $('#scale_select').selectmenu("disable");
                 $('.scale_outer').css(
                   {'visibility': 'hidden'}
                );
           }
           //scaleOrthogonalViews();
       }.bind(this));


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
                       this.currentViewHeight = ui.value;
                       $('.sliceWrap').css('height', ui.value);                            
                       scaleOrthogonalViews();                       
                       var evt = document.createEvent('UIEvents');
                       evt.initUIEvent('resize', true, false,window,0);
                       window.dispatchEvent(evt);
                   }, this)
               }); 

       //scaleOrthogonalViews();
       // Put this here as calling this multiple times does not work
       this.downloadTableRowSource = $("#downloadTableRowTemplate").html();

}//AttachEvents


   iev.embryoviewer.prototype.setupDownloadTable = function() {

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



       var template = Handlebars.compile(this.downloadTableRowSource);

       dlg.load('download_dialog.html', function () {
           for (var pid in this.centreData[this.currentCentreId]) {
               if (pid !== this.mutView)
                   continue;  // Only supply current modality data for download
               var vols = this.centreData[this.currentCentreId][this.mutView]['vols'];

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
                       // We add the display name to the rest request to give a name for the downloads 
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



   iev.embryoviewer.prototype.getZippedVolumes = function(event) {
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

   iev.embryoviewer.prototype.progressStop = function(){
       this.spinner.stop();
        $("#progressMsg").empty();
   }

   iev.embryoviewer.prototype.progressIndicator = function(msg){

       var target =  document.getElementById("progressSpin");
       this.spinner = new Spinner(spinnerOpts).spin(target);
       $("#progressMsg").text(msg);   
   }


   iev.embryoviewer.prototype.sanitizeFileName = function(dirtyString){
       var cleanString = dirtyString.replace(/[|&;$%@"<>()+,\/]/g, "");
       return cleanString;
   }

   iev.embryoviewer.prototype.basename = function(path) {
       /**
        * Extract the basename from a path
        * @method basename
        * @param {String} path File path
        */
       return path.split(/[\\/]/).pop();
   }


   iev.embryoviewer.prototype.objSize = function(obj) {
       var count = 0;
       var i;

       for (i in obj) {
           if (obj.hasOwnProperty(i)) {
               count++;
           }
       }
       return count;
   }

   iev.embryoviewer.prototype.setBreadCrumb = function() {
       /*
        * Get the dynamically generated menu code. Split into main menu and the login section
        */

       var mgi_href = '/data/genes/' + this.mgi;
       var b_link = $('#ievBreadCrumbGene').html(this.gene_symbol).attr('href', mgi_href)
   }


iev.embryoviewer.prototype.setInitialViewerHeight = function(){
  /*Get the height available for the specimen views*/
   var sliceViewControlsHeight = 32 + 6; // Currently set in embryo.css the 6 is for padding
   var windowHeight = $( window.top ).innerHeight();
   var helpHeight = $('#help').outerHeight();
   var impcHeaderHeight = $('#header').outerHeight();
   var subHeaderHeight = $('#iev_subHeader').outerHeight();
   var mainControlsHeight = $('#ievControlsWrap').outerHeight();
   this.availableViewHeight = Math.round((windowHeight - impcHeaderHeight - subHeaderHeight - 
           mainControlsHeight - helpHeight -( sliceViewControlsHeight * 2 )) / 2);
   console.log(windowHeight, impcHeaderHeight, subHeaderHeight, mainControlsHeight);
   /* add a new stylesheet fort the specimen view wrapper height as it's not been created yet */
   //If we are on a laptop we may not want to set the minimum size too small
   var viewHeight = this.availableViewHeight < 200 ? 200 : this.availableViewHeight;

   $("<style type='text/css'> .sliceWrap{height:" + viewHeight + "px;}</style>").appendTo("head");

}


iev.embryoviewer.prototype.setViewOrientation = function(orientation){

    if (orientation === 'vertical'){
       this.horizontalView = true;
       $('.specimen_view').css({
           'float': 'left',
           'width': '50%',
           'clear': 'none'

           });
           $('.sliceWrap').css({
                  'width': '100%'
           });
           window.dispatchEvent(new Event('resize')); 

    }
    if (orientation === 'horizontal'){

       this.horizontalView = false;
       var numVisible = 0;
       for(var item in ortho){
           if(ortho[item].visible) ++ numVisible;
       }

       $('.specimen_view').css({
              'float': 'none',
              'width': '100%',
              'clear': 'both'

       });
       $('.sliceWrap').css({
              'width': String(100 / numVisible) + '%'

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
      

iev.embryoviewer.prototype.setScaleSelect = function(){
     $('#scale_select')
       .append(this.scaleLabels().join(""))
       .selectmenu({
           width: 80,
           height: 20,
           change: $.proxy(function (event, ui) { 
               this.scales.currentBarSize = ui.item.value;
               $('.scale_text').text(ui.item.label);
               scaleOrthogonalViews();

           }, this)
       });
}


    iev.embryoviewer.prototype.isInternetExplorer = function(){
   /*
    * XTK currently fails with IE. Check if we are using IE
    */

   var ua = window.navigator.userAgent;
   var msie = ua.indexOf("MSIE ");

   if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      return true;
   }

   else{                 // If another browser, return 0
       return false;
   }

}


if (isInternetExplorer()){
   var source = $("#ie_warning_template").html();
   var template = Handlebars.compile(source);
   $('#' + div).append(template(data));
   return;
};

iev.embryoviewer.prototype.catchXtkLoadError = function() {
   //This is an attempt to catch error messages from XTK loading errors as it does not have a error function to hook into
   window.onerror = function (errorMsg, url, lineNumber) {
       console.log(errorMsg);
       if (errorMsg === 'Uncaught Error: input buffer is broken' ||
           errorMsg === 'Uncaught Error: Loading failed' ||
           errorMsg === 'Uncaught Error: invalid file signature') 
       {
           for (var i=0; i < views.length; ++i){
               views[i].caughtXtkLoadError();   
           }
       }
   };
};
}//EmbryoViewer

   
    
