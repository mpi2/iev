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


goog.provide('iev.Download');


iev.Download = function(ev){
    this.IMAGE_SERVER = 'https://www.mousephenotype.org/images/emb/';
    this.downloadTableRowSourceLow = $("#downloadTableRowTemplate").html();
    this.downloadTableRowSourceHigh = $("#downloadTableRowTemplateHighRes").html();
    this.ev = ev; // embryoviewer
    this.dlg;
    
    this.spinnerOpts = {
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
}

iev.Download.prototype.setupDownloadTable = function (currentlyViewed, currentModality, currentCentreId) {
    
    this.dlg = $('#download_dialog').dialog({
        title: 'Select volumes for download',
        resizable: true,
        autoOpen: false,
        modal: true,
        hide: 'fade',
        width: $(document).width() -30,
        height: $(document).height() -30,
        position: {my: "left bottom", at: "left top", of: $('#top_bar')}
    });
       
    $('#download_dialog').on('click', '#close_dialog_button', function(){
        this.dlg.dialog('close');
    }.bind(this));

    
 
    var lowResTemplate = Handlebars.compile(this.downloadTableRowSourceLow);
    var highResTemplate = Handlebars.compile(this.downloadTableRowSourceHigh);

    this.dlg.load('download_dialog.html', function () {
       
        for (var pid in this.ev.centreData[this.ev.currentCentreId]) {
            if (pid !== this.ev.currentModality)
                continue;  // Only supply current modality data for download
            var vols = this.ev.centreData[this.ev.currentCentreId][this.ev.currentModality]['vols'];
            var currentlyViewed = [];
            for (var i = 0; i < this.ev.views.length; ++i) {
                currentlyViewed.push(this.ev.views[i].getCurrentVolume()['volume_url'])
            }

            for (var vol in vols['mutant']) {

                var volData = vols['mutant'][vol];
                var displayName = this.getNewFileName(volData);
                var lowResRemotePath = volData['volume_url'];
                var highResRemotePath = volData['volume_url_high_res'];
                var bg = '#FFFFFF';
                if ($.inArray(lowResRemotePath, currentlyViewed) > -1) bg = '#ef7b0b';
                var data = {
                    // We add the display name to the rest request to give a name for the downloads 
                    remotePath: lowResRemotePath + ";" + displayName,
                    volDisplayName: displayName,
                    bg: bg
                };
                var dataHighRes = {
                    remotePath: highResRemotePath,
                    volDisplayName: displayName,
                    bg: bg
                };

                $("#mutLowResTable tbody").append(lowResTemplate(data));
                $("#mutHighResTable tbody").append(highResTemplate(dataHighRes));
            }
            for (var vol in vols['wildtype']) {
                var volData = vols['wildtype'][vol];
                var displayName = this.getNewFileName(volData);
                var lowResRemotePath = volData['volume_url'];
                var highResRemotePath = volData['volume_url_high_res'];
                var bg = '#FFFFFF';
                if ($.inArray(lowResRemotePath, currentlyViewed) > -1) bg = '#ef7b0b';
                var data = {
                    remotePath: lowResRemotePath + ";" + displayName,
                    volDisplayName: displayName,
                    bg: bg
                };
                var dataHighRes = {
                    remotePath: highResRemotePath,
                    volDisplayName: displayName,
                    bg: bg
                };
                    
                var x = lowResTemplate(data);
                $("#wtLowResTable tbody").append(x);
                $("#wtHighResTable tbody").append(highResTemplate(dataHighRes));
            }
        }
  
        this.dlg.dialog('open');

        // Once selected on download dialog, download volumes
        $('#download_dialog_button').click(function () {
            this.dlg.dialog('close');
            this.getZippedVolumes();
        }.bind(this));
    $('#downloadTabs').tabs({active: 0});
    }.bind(this));
};



iev.Download.prototype.getNewFileName = function (volData) {
    /* .. function:: loadxhtml(url, data, reqtype, mode)
     The file names in the Preprocessed db are just procedure performed? 
     We need domething more informative downloading
     
     Parameters:
     
     * `volData`: object
     containing al the data from the database for this volume
     
     Returns: String
     */
    //var path = volData['volume_url'];
    var sex = volData['sex'];
    if (sex === 'No data') {
        sex = 'undeterminedSex';
    }
    ;
    var geneSymbol = this.sanitizeFileName(volData['geneSymbol']);
    var animalName = this.sanitizeFileName(volData['animalName']);
    var newPath = sex + '_' + animalName + '_' + geneSymbol;
    return newPath;


};

iev.Download.prototype.getZippedVolumes = function () {
    /* Just try zipping one volume for now
     * 
     */
    // Jsut try with one volume for now
    var volumeURLs = "";
    var checked = $('#wtLowResTable').find('input[type="checkbox"]:checked')
    for (var i = 0; i < checked.length; ++i) {
        var url = checked[i]['name'];
        volumeURLs += url + ',';
    }
    var checked = $('#mutLowResTable').find('input[type="checkbox"]:checked')
    for (var i = 0; i < checked.length; ++i) {
        var url = checked[i]['name'];
        volumeURLs += url + ',';
    }
    if (volumeURLs.length < 1){
        alert('There was an error downloading the images');
        return;
    }
    var restURL = 'rest/zip?vol=' + volumeURLs;
    // Start the progress spinner


    this.progressIndicator('preparing zip');

    $.fileDownload(restURL, {
        successCallback: function (url) {
            this.progressStop();
        }.bind(this),
        failCallback: function (html, url) {
            alert('There was an error downloading the images');
        }
    });
};

iev.Download.prototype.sanitizeFileName = function (dirtyString) {
    var cleanString = dirtyString.replace(/[|&;$%@"<>()+,\/]/g, "");
    return cleanString;
};

iev.Download.prototype.progressStop = function () {
    this.spinner.stop();
    $("#progressMsg").empty();
};

iev.Download.prototype.progressIndicator = function (msg) {

    var target = document.getElementById("progressSpin");
    this.spinner = new Spinner(this.spinnerOpts).spin(target);
    $("#progressMsg").text(msg);
};
