/*
 * Copyright 2016 Medical Research Council Harwell.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Neil Horner <n.horner@har.mrc.ac.uk>
 * @author James Brown <james.brown@har.mrc.ac.uk>
 */


goog.provide('iev.viewer3D');
goog.require('iev.specimen3D')

iev.viewer3D = function(centreData, div, queryType, queryId, tabCb) {
    
    this.centreData = centreData;
    this.container = div;
    this.$container = $('#' + this.container);
    this.IMAGE_SERVER = 'https://www.mousephenotype.org/images/emb/';
    //var IMAGE_SERVER = 'http://localhost:8000/'; // For testing localhost
    this.WILDTYPE_COLONYID = 'baseline';
    this.queryId = queryId;
    this.volorder = ["203", "204", "202"];  // may want to add others at a later date
    this.currentCentreId = Object.keys(centreData)[0];
    this.views = [];
    this.ready = false;
    this.currentZoom = 0;
    this.bookmarkReady = false;
    this.tabCb = tabCb;
    this.isDestroyed = true;

 };
 
 iev.viewer3D.prototype.attachEvents = function() {

    $("#invertColours").unbind("click")
        .click(function (e) {
            e.preventDefault();
            //First change the background colors and scale colors
            var checked;
            if ($(e.target).hasClass('ievgrey')){
                $(e.target).removeClass('ievgrey');
                $(e.target).addClass('ievInvertedGrey');
                checked = true;
            } else if ($(e.target).hasClass('ievInvertedGrey')){  
                $(e.target).removeClass('ievInvertedGrey');
                $(e.target).addClass('ievgrey');
                checked = false;
            }
            //Now get the views to reset
            for (var i = 0; i < this.views.length; i++) {
                this.views[i].invertColour(checked);
            }

        }.bind(this));


    $("#zoomIn")
        .button()
        .click($.proxy(function () {                                        
            for (var i = 0; i < this.views.length; i++) {
                this.views[i].zoomIn();
            }
            this.currentZoom++;
        }, this));


    $("#zoomOut")
        .button()
        .click($.proxy(function () {                    
            for (var i = 0; i < this.views.length; i++) {
                if (!this.views[i].zoomOut()) {
                    return; // stop trying to zoom if we hit a limit
                };                        
            }
            this.currentZoom--;
        }, this));


    // Set up the table for available downloads
//    $('#download').click(function (e) {
//        e.preventDefault();
//        this.setupDownloadTable(e);
//    }.bind(this));

    // Create bookmark when clicked
    $('#createBookmark').unbind('click').click(function (e) {
        if (!this.bookmarkReady) { 
            return;
        }
        e.preventDefault();
        var newBookmark = this.generateBookmark();   
        window.prompt("Bookmark created!\nCopy to clipboard (Ctrl/Cmd+C + Enter)", newBookmark);   
    }.bind(this));            

    $("#modality_stage" ).buttonset();
    $("#orthogonal_views_buttons").buttonset();

    // Effectively disables the button
    $("#orientation_button").unbind("click");

    // Hide/show slice views from the checkboxes
    $('.toggle_slice').button("disable");

    // Initialise scale bar
    $('#scale_select')
            .find('option') // get all existing options
            .remove() // remove them
            .end() // end
            .append($('<option></option>').val("0").html("Off")) // append all options
            .selectmenu({// create select menu widget
                width: 80,
                height: 20,
                disabled: true
        });
    
    $('#scale_visible').prop("checked", false) // uncheck
            .trigger('change') // trigger change
            .prop("disabled", true); // disabled checkbox
    
    // Modality
    $('.modality_button').unbind('change').change(function (ev) {
        var checkedStageModality = ev.currentTarget.id;
        this.setStageModality(checkedStageModality);
    }.bind(this));

    $(".button").button();

    $("#viewHeightSlider")
        .slider({
            disabled: true,
            min: 200,
            max: 1920,
            value: 500
    }); 
    
    // Put this here as calling this multiple times does not work
    this.downloadTableRowSource = $("#downloadTableRowTemplate").html();
    
    $('#analysis_button').click(function(e) {
        this.wtView.showAnalysisData();
    }.bind(this));

};

iev.viewer3D.prototype.generateBookmark = function() {
    
    var currentUrl = window.location.href;
    var hostname = currentUrl.split('?')[0];

    var bookmark = hostname
             + '?' + this.bookmarkData['mode'] + '=' + this.bookmarkData['gene']
             + '&v=' + '3d'
             + '&pid=' + this.currentModality
             + '&zoom=' + this.currentZoom
             + '&wn=' + this.wtView.currentVolume['animalName']        
             + '&wl=' + this.wtView.volume.windowLow
             + '&wu=' + this.wtView.volume.windowHigh
             + '&mn=' + this.mutView.currentVolume['animalName']                
             + '&ml=' + this.mutView.volume.windowLow
             + '&mu=' + this.mutView.volume.windowHigh;
         return bookmark;
};

iev.viewer3D.prototype.zoomBy = function(times) {

    if (times < 0) {
        while (times < 0) {                    
            setTimeout(function() {
                this.zoomViewsOut();
            }.bind(this), 1000);   
            times++;
        }
    }

    if (times > 0) {
        while (times > 0) { 
            setTimeout(function() {
                this.zoomViewsIn();
            }.bind(this), 1000);   
            times--;
        }
    }             

};

iev.viewer3D.prototype.zoomViewsIn = function() {
    this.wtView.zoomIn();
    this.mutView.zoomIn();
};

iev.viewer3D.prototype.zoomViewsOut = function() {
    this.wtView.zoomOut();
    this.mutView.zoomOut();
};
 
iev.viewer3D.prototype.onTab = function(config){
    
    this.isDestroyed = false;

    this.bookmarkData = config;
    if (this.bookmarkData['pid']) {
        this.volorder.unshift(this.bookmarkData['pid']);
    }
    
    var pid;
    for (var i in this.volorder){
        pid = this.volorder[i];
        if (this.objSize(this.centreData[this.currentCentreId][pid]['vols']['mutant']) > 0){
            this.wildtypeData = this.centreData[this.currentCentreId][pid]['vols']['wildtype'];
            this.mutantData = this.centreData[this.currentCentreId][pid]['vols']['mutant'];
            break;
        }
    }
    
    this.currentModality = pid;
    
    this.attachEvents();
    this.beforeReady();
    this.localStorage = new iev.LocalStorage(this.isBrowserIE);
    this.localStorage.setup(function(){  
        this.onReady();
    }.bind(this));
    
};

iev.viewer3D.prototype.beforeReady = function () {
    /*Inactivate the modality/stage buttons*/
    $('#modality_stage :input').prop("disabled", true);
    $("#modality_stage").buttonset('refresh');
};

iev.viewer3D.prototype.onReady = function(){
    
    var pid = this.bookmarkData['pid'];
    
    // Update data if pid passed in from bookmark
    if (pid && pid !== this.currentModality) {
        this.wildtypeData = this.centreData[this.currentCentreId][pid]['vols'].wildtype;
        this.mutantData = this.centreData[this.currentCentreId][pid]['vols'].mutant;
        this.currentModality = pid;
    }
        
    this.wtView = new iev.specimen3D(this.wildtypeData, 'wt', this.container, 
                    this.WILDTYPE_COLONYID, this.localStorage,
                    this.viewerCallback.bind(this), this.bookmarkData['wt']);
    this.views.push(this.wtView);

    this.mutView = new iev.specimen3D(this.mutantData, 'mut', this.container,
                    this.queryId, this.localStorage,
                    this.viewerCallback.bind(this), this.bookmarkData['mut']);
    this.views.push(this.mutView);  
    this.ready = true;    
};

iev.viewer3D.prototype.setActiveModalityButtons = function(){
    /*
     * Check which modalities we have data for and inactivate buttons for which we have no data
     */
    for (var pid in this.centreData[this.currentCentreId] ){
        if (this.objSize(this.centreData[this.currentCentreId][pid]['vols']['mutant']) < 1){
            $("#modality_stage input[id^=" + pid + "]:radio").attr('disabled', true);
        }
        else{
            $("#modality_stage input[id^=" + pid + "]:radio").attr('disabled', false);
        }
    }      
    
    $("#modality_stage input[id^=" + this.currentModality + "]:radio").attr('checked',true);
    $("#modality_stage").buttonset('refresh');
};
 
iev.viewer3D.prototype.getModData = function(){
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
            'vols': {
                'mutant': {},
                'wildtype': {}
            }
        },
        202: {
            'id': 'OPT 9.5',
            'vols': {
                'mutant': {},
                'wildtype': {}
            }
        }
    };
};

iev.viewer3D.prototype.setStageModality = function(pid){
    /*
     * 
     * Switch to another modality
     */
    this.currentModality = pid;

    if (typeof this.wtView !== 'undefined'){
        var wtVolumes = this.centreData[this.currentCentreId][pid]['vols'].wildtype;

        if (Object.keys(wtVolumes).length > 0) {
            $("#wt").show();
            this.wtView.updateData(wtVolumes);
        } else {
            $("#wt").hide();                    
        }
    }
    if (typeof this.mutView !== 'undefined'){
        var mutVolumes = this.centreData[this.currentCentreId][pid]['vols'].mutant;

        if (Object.keys(mutVolumes).length > 0) {
            $("#mut").show();
            this.mutView.updateData(mutVolumes);
        } else {
            $("#mut").hide();
        }
    }    
};

iev.viewer3D.prototype.bookmarkConfigure = function() {
    /*
     * Setup the viewers based on bookmark data
     */

    if (!this.bookmarkReady) {               
        console.log('setting bookmark options');

        // Set ready
        this.bookmarkReady = true;
    }

};

iev.viewer3D.prototype.onDestroy = function() {
    
    // Loop through views and destroy the renderers
    for (var i = 0; i < this.objSize(this.views); i++) {
        this.views[i].destroyRenderer();
    }
    
    this.$container.empty(); // clear the template HTML
    this.views = [];
    this.isDestroyed = true;
    
};

iev.viewer3D.prototype.viewerCallback = function() {
    this.bookmarkConfigure();
    this.setActiveModalityButtons();
    this.tabCb();
    //window.dispatchEvent(new Event('resize')); 
};

iev.viewer3D.prototype.objSize = function(obj) {
   var count = 0;
   var i;

   for (i in obj) {
       if (obj.hasOwnProperty(i)) {
           count++;
       }
   }
   return count;
};

iev.viewer3D.prototype.buildUrl = function(data){

   var url = this.IMAGE_SERVER + data.cid + '/' 
           + data.lid + '/' 
           + data.gid + '/' 
           + data.sid + '/' 
           + data.pid + '/' 
           + data.qid + '/' 
           + data.imageForDisplay;

   data['volume_url'] = url;
   return data;

};




