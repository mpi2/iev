goog.provide('iev.viewer2D');
goog.require('iev.specimen2D');
goog.require('iev.LocalStorage');
goog.require('iev.Download');
//goog.require('iev.templates')



iev.viewer2D = function (data, container, queryType, queryId) {
    /**
     * @class EmbryoViewer
     * @type String
     */
    this.data = data;
    this.IMAGE_SERVER = 'https://www.mousephenotype.org/images/emb/';
    this.ANA_SERVER = 'https://www.mousephenotype.org/images/ana/';
    this.WILDTYPE_COLONYID = 'baseline';
    this.OUTPUT_FILE_EXT = '.nrrd';
    this.queryId = queryId;
    this.horizontalView;
    this.wtView;
    this.mutView;
    this.currentModality;
    this.currentCentreId;
    this.downloadTableRowSourceLow;
    this.downloadTableRowSourceHigh;
    this.spinner; // Progress spinner
    this.currentZoom = 0;
    this.currentOrientation = 'horizontal';
    this.currentViewHeight = 500;
    this.bookmarkReady = false;
    this.mgi;
    this.gene_symbol;
    this.availableViewHeight; // The window height minus all the header and controls heights
    this.isBrowserIE = this.isInternetExplorer();
    this.downloader = new iev.Download(this);
    this.container = container;
    this.$container = $('#' + this.container);

    if (this.isBrowserIE === 'oldIe') {
        console.log('IEV does not support Internet Explorer <v11');
        var source = $("#ie_warning_template").html();
        var template = Handlebars.compile(source);
        this.$container.append(template(data));
        return;
    }
    ;


    //Give users a warning about using the deprecated colony_id=test url
    if (queryType === 'colony ID' && this.queryId === 'test') {
        var source = $("#redirect_test_template").html();
        var template = Handlebars.compile(source);
        this.$container.append(template());
        return;
    }
    this.localStorage = 'carrots';

    /**
     * 
     * @type {object} modality_stage_pids
     * A mapping of procedure ids and imaging modality/stage key
     */

    // Contains a bunch of modalityData objects
    // {centreId: modalitydata}
    this.centreData = {};

    this.ortho = {// rename
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


    this.volorder = ["203", "204", "202"]; //At startup, search in this order for modality data to display first


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



    this.ICONS_DIR = "images/centre_icons/"; //not used??

    /**
     * Seperate out the baseline data and the mutant data.
     * If data is not available, load an error message
     */
    if (data['success']) {
        //In case we load another dataset  
        this.mgi = 'undefined';
        this.gene_symbol = 'undefined';

        for (var cen in data['centre_data']) { // Pick the first centre you come across as the current centre
            var modData = this.getModalityData();
            //Display the top control bar
            $('#top_bar').show(); //NH? what's this

            // Loop over the centre data
            for (var i = 0; i < this.objSize(data['centre_data'][cen]); i++) {
                //loop over the data for this centre

                var obj = data['centre_data'][cen][i];

                this.buildUrl(obj);

                if (obj.colonyId === this.WILDTYPE_COLONYID) {
                    modData[obj.pid]['vols']['wildtype'][obj.volume_url] = obj;

                } else {
                    modData[obj.pid]['vols']['mutant'][obj.volume_url] = obj;
                    //Now set the current MGI and Genesymbol
                    if (this.mgi === 'undefined') {
                        this.mgi = obj.mgi;
                    }
                    if (this.gene_symbol === 'undefined') {
                        this.gene_symbol = obj.geneSymbol;
                    }
                }
            }
            // Get analysis data, if it exists
            if (this.objSize(data['analysis_data'][cen]) > 0) {
                $('#analysis_button').removeClass('disabled');
                $('#analysis_button').prop('title', 'Display analysis');
            } else {
                $('#analysis_button').removeClass('hoverable');
            }
            
            
            for (var j = 0; j < this.objSize(data['analysis_data'][cen]); j++) {

                var ana = data['analysis_data'][cen][j];
                ana.zygosity = 'Mixed';
                ana.animalName = 'Average';
                ana.sex = 'no data';
                ana.geneSymbol = '';

                // Create volume/overlay URLs
                ana['volume_url'] = this.analysisUrl(ana, 'average', this.OUTPUT_FILE_EXT);
                ana['jacobian'] = this.analysisUrl(ana, 'jacobian', this.OUTPUT_FILE_EXT);
                ana['intensity'] = this.analysisUrl(ana, 'intensity', this.OUTPUT_FILE_EXT);
                ana['labelmap'] = this.analysisUrl(ana, 'labelmap', this.OUTPUT_FILE_EXT);

                // Add populate average volume
                modData[ana.pid]['vols']['wildtype'][ana.volume_url] = ana;
                modData[ana.pid]['vols']['mutant'][ana.volume_url] = ana;
            }
            this.centreData[cen] = modData;

        }
        this.currentCentreId = cen; // Just pick the last one to be visible

    } else {
        //Just display a message informing no data
        var data = {
            colonyId: this.queryId,
            queryType: queryType
        };

        var source = $("#no_data_template").html();
        var template = Handlebars.compile(source);
        this.$container.append(template(data));
    }

    this.views = [];

    this.catchXtkLoadError();
    this.setBreadCrumb();
    this.setInitialViewerHeight();

};  // Constructor

iev.viewer2D.prototype.analysisUrl = function (data, name, ext) {
    /**
     * Create url for the analysis data, based on type and extension
     * @method analysisUrl
     * @param {json} data Data for colonyID 
     */

    var url = this.ANA_SERVER + data.cid + '/'
            + data.lid + '/'
            + data.gid + '/'
            + data.sid + '/'
            + data.pid + '/'
            + data.qid + '/'
            + data.id + '/'
            + name + ext;
    return url;
};

iev.viewer2D.prototype.scaleLabels = function () {

    var options = [];
    for (var key in this.scales.options) {
        options.push("<option value='" + this.scales.options[key] + "'>" + key + "</option>");
    }
    return options;
}

iev.viewer2D.prototype.getModalityData = function () {

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


iev.viewer2D.prototype.centreSelector = function () {
    /*
     * Sets up the drop down menu with avaiable centre icons for this particular mgi/colony etc
     */

    // Populate drop down box with available centres

    var options = [];

    for (var key in this.centreOptions) {
        if (key in this.data['centre_data']) {
            var iconClass = 'centreSelectIcon cen_' + key;
            options.push("<option  value='" + key + "'" + "' data-class='" + iconClass + "'>" + this.centreOptions[key] + "</option>");
        }
    }

    var $centre_select = $('#centre_select');
    $centre_select.find('option').remove().end().append(options.join(""));

    $centre_select.iconselectmenu()
            .iconselectmenu("menuWidget")
            .addClass("ui-menu-icons customicons");

    $centre_select
            .iconselectmenu({
                width: '60px',
                change: $.proxy(function (event, ui) {
                    this.setCentre(ui.item.value);
                }, this)

            });

    // Set the current centre
    $centre_select.val(this.currentCentreId).iconselectmenu('refresh', true);
}



iev.viewer2D.prototype.setActiveModalityButtons = function () {
    /*
     * Check which modalities we have data for and inactivate buttons for which we have no data
     */
    for (var pid in this.centreData[this.currentCentreId]) {
        if (this.objSize(this.centreData[this.currentCentreId][pid]['vols']['mutant']) < 1) {
            $("#modality_stage input[id^=" + pid + "]:radio").attr('disabled', true);
        } else {
            $("#modality_stage input[id^=" + pid + "]:radio").attr('disabled', false);
        }
    }
}


iev.viewer2D.prototype.buildUrl = function (data) {
    /**
     * Create a url from the data returned by querying database for a colonyID
     * URL should point us towards the correct place on the image server.
     * add the URL to the data object
     * @method buildUrl
     * @param {json} data Data for colonyID 
     */
    var root = this.IMAGE_SERVER + data.cid + '/'
            + data.lid + '/'
            + data.gid + '/'
            + data.sid + '/'
            + data.pid + '/'
            + data.qid + '/';

    //Low res just need relative path to image as it's zipped server side
    var lowResUrl = root + data.imageForDisplay;
    var lowResName = data.imageForDisplay.split('.')[0];
    var base = lowResName.split('_')[0];
    var ext = data.imageForDisplay.split('.')[1];

    // High res need full link to image on server
    var highResName = base + '_download.' + ext;
    var highResUrl = root + highResName;

    data['volume_url'] = lowResUrl;
    data['volume_url_high_res'] = highResUrl;
    return data;
}

iev.viewer2D.prototype.bookmarkConfigure = function () {
    /*
     * Setup the viewers based on bookmark data
     */

    if (!this.bookmarkReady) {
        console.log('setting bookmark options');
        // Set views       
        if (this.bookmarkData['s'] === 'off') {
            $('#X_check').trigger('click');
        }

        if (this.bookmarkData['c'] === 'off') {
            $('#Y_check').trigger('click');
        }

        if (this.bookmarkData['a'] === 'off') {
            $('#Z_check').trigger('click');
        }

        // Set orientation
        if (this.bookmarkData['o'] === 'vertical') {
            $("#orientation_button").trigger("click");
        }

        // Set zoom
        this.zoomBy(this.bookmarkData['zoom']);

        // Set viewer height
        if (this.bookmarkData['h']) {
            var $viewHeight = $("#viewHeightSlider");
            $viewHeight.slider('value', this.bookmarkData['h']);
            $viewHeight.slider("option", "slide").call($viewHeight, null, {value: this.bookmarkData['h']});
        }

        // Set scale bar
        if (this.bookmarkData['sb']) {
            this.scales.currentBarSize = this.bookmarkData['sb'];
        }

        // Set ready
        this.bookmarkReady = true;
    }

};

iev.viewer2D.prototype.generateBookmark = function () {

    var currentUrl = window.location.href;
    var hostname = currentUrl.split('?')[0];

    var s = this.ortho['X']['visible'] ? 'on' : 'off';
    var c = this.ortho['Y']['visible'] ? 'on' : 'off';
    var a = this.ortho['Z']['visible'] ? 'on' : 'off';

    var bookmark = hostname
            + '?' + this.bookmarkData['mode'] + '=' + this.bookmarkData['gene']
            + '&v=' + '2d'
            + '&pid=' + this.currentModality
            + '&h=' + this.currentViewHeight
            + '&s=' + s
            + '&c=' + c
            + '&a=' + a
            + '&o=' + this.currentOrientation
            + '&zoom=' + this.currentZoom
            + '&sb=' + this.scales.currentBarSize
            + '&wn=' + this.wtView.getCurrentVolume()['animalName']
            + '&wx=' + this.wtView.getIndex('X')
            + '&wy=' + this.wtView.getIndex('Y')
            + '&wz=' + this.wtView.getIndex('Z')
            + '&wl=' + this.wtView.getBrightnessLower()
            + '&wu=' + this.wtView.getBrightnessUpper()
            + '&mn=' + this.mutView.getCurrentVolume()['animalName']
            + '&mx=' + this.mutView.getIndex('X')
            + '&my=' + this.mutView.getIndex('Y')
            + '&mz=' + this.mutView.getIndex('Z')
            + '&ml=' + this.mutView.getBrightnessLower()
            + '&mu=' + this.mutView.getBrightnessUpper();
            +'&wov=' + this.wtView.getLabelmap()
            + '&mov=' + this.mutView.getLabelmap();
    return bookmark;
};

iev.viewer2D.prototype.zoomBy = function (times) {

    if (times < 0) {
        while (times < 0) {
            setTimeout(function () {
                this.zoomViewsOut();
            }.bind(this), 1000);
            times++;
        }
    }

    if (times > 0) {
        while (times > 0) {
            setTimeout(function () {
                this.zoomViewsIn();
            }.bind(this), 1000);
            times--;
        }
    }

};

iev.viewer2D.prototype.zoomViewsIn = function () {
    this.wtView.zoomIn();
    this.mutView.zoomIn();
};

iev.viewer2D.prototype.zoomViewsOut = function () {
    this.wtView.zoomOut();
    this.mutView.zoomOut();
};


iev.viewer2D.prototype.scaleOrthogonalViews = function () {
    /**
     * Set the largest extent for each of the dimensions
     *@method setLargestDimesions
     */

    // Set the proportional views
    for (var i = 0; i < this.views.length; ++i) {
        this.views[i].rescale(this.scales.currentBarSize);
    }

    //test do we need?
    //window.dispatchEvent(new Event('resize'));
    //currentZoom = 0;
};


iev.viewer2D.prototype.beforeReady = function () {
    /*Inactivate the modality/stage buttons*/
    $('#modality_stage :input').prop("disabled", true);
    $("#modality_stage").buttonset('refresh');
};

iev.viewer2D.prototype.onReady = function () {

    this.setActiveModalityButtons();
    //$('#modality_stage :input').prop('disabled', false);
    $("#modality_stage").buttonset('refresh');
    $('#help').show();

    this.currentZoom = 0;

    // Configure viewer styling based on bookmark data
    this.bookmarkConfigure();

    $('#scale_select').val(this.scales.currentBarSize).selectmenu('refresh');
    //Set the scale bar text value to current selected
    $('.scale_text').text($('#scale_select').find(":selected").text());

    $(".linkCheck").change(function (e) {

        if ($(e.target).hasClass('X')) {
            this.linkViews('X', e.currentTarget.checked);
        } else if ($(e.target).hasClass('Y')) {
            this.linkViews('Y', e.currentTarget.checked);
        } else if ($(e.target).hasClass('Z')) {
            this.linkViews('Z', e.currentTarget.checked);
        }

    }.bind(this));

    this.scaleOrthogonalViews();
    $('.scale_outer').draggable();

};

iev.viewer2D.prototype.onDestroy = function () {

    // Loop through views and destroy the renderers
    for (var i = 0; i < this.objSize(this.views); i++) {
        this.views[i].destroyRenderer();
    }

    this.$container.empty(); // clear the template HTML
    this.views = [];

};

iev.viewer2D.prototype.onTab = function (config) {

    this.bookmarkData = config;
    if (this.bookmarkData['pid']) {
        this.volorder.unshift(this.bookmarkData['pid']);
    }

    this.localStorage = new iev.LocalStorage(this.isBrowserIE);

    this.localStorage.setup(function () {
        this.afterLoadingLocalStorage(this.container);
    }.bind(this));

    this.attachEvents();
    this.beforeReady();

};


iev.viewer2D.prototype.afterLoadingLocalStorage = function () {
    /**
     * Create instances of SpecimenView and append to views[]. 
     * Get the dimensions of the loaded volumes
     * @param {String} container HTML element to put the specimen viewer in to
     */


    // Find first lot of data to use. loop over PIDs in reverse to try CT before OPT
    var pid;
    for (var i in this.volorder) {
        pid = this.volorder[i];
        if (this.objSize(this.centreData[this.currentCentreId][pid]['vols']['mutant']) > 0) { // !!!! Don't forget to switch off once I work out how to load ct by default
            var wildtypeData = this.centreData[this.currentCentreId][pid]['vols']['wildtype'];
            var mutantData = this.centreData[this.currentCentreId][pid]['vols']['mutant'];
            break;
        }
    }

    this.currentModality = pid;

    //Check the modality button
    $("#modality_stage input[id^=" + pid + "]:radio").attr('checked', true);

    // only load if baseline data available
    if (this.objSize(wildtypeData) > 0) {
        var wtConfig = this.bookmarkData['wt'];
        this.wtView = new iev.specimen2D(
                wildtypeData,
                'wt',
                this.container,
                this.WILDTYPE_COLONYID,
                this.onWtXChange.bind(this),
                this.onWtYChange.bind(this),
                this.onWtZChange.bind(this),
                wtConfig,
                this.loadedCb.bind(this),
                this.localStorage
                );
        this.views.push(this.wtView);
    }

    // Set mutant specimen based on bookmark   
    var mutConfig = this.bookmarkData['mut'];
    this.mutView = new iev.specimen2D(
            mutantData,
            'mut',
            this.container,
            this.queryId,
            this.onMutXChange.bind(this),
            this.onMutYChange.bind(this),
            this.onMutZChange.bind(this),
            mutConfig,
            this.loadedCb.bind(this),
            this.localStorage
            );
    this.views.push(this.mutView);
    this.centreSelector();
};


iev.viewer2D.prototype.loadedCb = function () {
    /*
     * called when each specimenView has finished loading
     * @param {type} container
     * @return {undefined}
     */

    for (var i = 0; i < this.views.length; i++) {
        if (!this.views[i].isReady())
            return;
    }
    this.onReady();
};


iev.viewer2D.prototype.setCentre = function (cid) {
    /*
     * Change the centre. Only works if there is data from multiple centres.
     * Such as with reference lines
     * 
     */
    this.currentCentreId = cid;
    this.setStageModality(this.currentModality);
};


iev.viewer2D.prototype.setStageModality = function (pid) {
    /*
     * 
     * Switch to another modality
     */
    this.beforeReady();
    this.currentModality = pid;

    if (typeof this.wtView !== 'undefined') {
        var wtVolumes = this.centreData[this.currentCentreId][pid]['vols'].wildtype;

        if (Object.keys(wtVolumes).length > 0) {
            $("#wt").show();
            this.wtView.updateData(wtVolumes);
        } else {
            $("#wt").hide();
        }
    }
    if (typeof this.mutView !== 'undefined') {
        var mutVolumes = this.centreData[this.currentCentreId][pid]['vols'].mutant;

        if (Object.keys(mutVolumes).length > 0) {
            $("#mut").show();
            this.mutView.updateData(mutVolumes);
        } else {
            $("#mut").hide();
        }
    }
};


iev.viewer2D.prototype.onMutXChange = function (index) {
    if (this.ortho['X'].linked)
        this.wtView.setXindex(index);
};

iev.viewer2D.prototype.onMutYChange = function (index) {
    if (this.ortho['Y'].linked)
        this.wtView.setYindex(index);
};

iev.viewer2D.prototype.onMutZChange = function (index) {
    if (this.ortho['Z'].linked)
        this.wtView.setZindex(index);
};

iev.viewer2D.prototype.onWtXChange = function (index) {
    if (this.ortho['X'].linked)
        this.mutView.setXindex(index);
};

iev.viewer2D.prototype.onWtYChange = function (index) {
    if (this.ortho['Y'].linked)
        this.mutView.setYindex(index);
};

iev.viewer2D.prototype.onWtZChange = function (index) {
    if (this.ortho['Z'].linked)
        this.mutView.setZindex(index);
};

iev.viewer2D.prototype.linkViews = function (orthoView, isLink) {
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

    this.ortho[orthoView].linked = isLink;

    for (var i = 0; i < this.views.length; i++) {
        // Set/unset the link buttons
        if (this.views[i].id === 'wt') {
            wtIdx = this.views[i].getIndex(orthoView);
        } else if (this.views[i].id === 'mut') {
            mutIdx = this.views[i].getIndex(orthoView);
        }
    }
    for (var i = 0; i < this.views.length; i++) {
        if (this.views[i].id === 'mut') {
            this.views[i].setIdxOffset(orthoView, wtIdx - mutIdx);
        }
    }
};


iev.viewer2D.prototype.setLowPowerState = function (state) {
    /*
     * Switches the low power option on or off
     */

    for (var i = 0; i < this.views.length; i++) {
        this.views[i].setLowPowerState(state);
    }
};


iev.viewer2D.prototype.getNewFileName = function (volData) {
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


iev.viewer2D.prototype.attachEvents = function () {

    $("#reset")

            .click($.proxy(function () {
                for (var i = 0; i < this.views.length; i++) {
                    this.views[i].reset();
                }
            }, this));

    $("#invertColours")
        .click(function (e) {
            e.preventDefault();
            //First change the background colors and scale colors
            var checked;
            if ($(e.target).hasClass('ievgrey')) {
                $(e.target).removeClass('ievgrey');
                $(e.target).addClass('ievInvertedGrey');
                $(".sliceView").css("background-color", "#FFFFFF");
                $(".sliceControls").css("background-color", "#FFFFFF");
                $('.scale_text').css("color", "#000000");
                $('.scale').css("background-color", "#000000");
                checked = true;
            } else if ($(e.target).hasClass('ievInvertedGrey')) {
                $(e.target).removeClass('ievInvertedGrey');
                $(e.target).addClass('ievgrey');
                $(".sliceView").css("background-color", "#000000");
                $(".sliceControls").css("background-color", "#000000");
                $('.scale_text').css("color", "#FFFFFF");
                $('.scale').css("background-color", "#FFFFFF");
                checked = false;
            }
            //Now get the SpecimenViews to reset
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
                    }
                    ;
                }
                this.currentZoom--;
            }, this));


    // Set up the table for available downloads
    $('#download').click(function (e) {
        e.preventDefault();
        this.downloader.setupDownloadTable()
//        this.setupDownloadTable(e);
    }.bind(this));

    // Create bookmark when clicked
    $('#createBookmark').unbind('click').click(function (e) {
        if (!this.bookmarkReady) {
            return;
        }
        e.preventDefault();
        var newBookmark = this.generateBookmark();
        window.prompt("Bookmark created!\nCopy to clipboard (Ctrl/Cmd+C + Enter)", newBookmark);
    }.bind(this));

    $("#modality_stage").buttonset();
    $("#orthogonal_views_buttons").buttonset();

    /*
     * Orientation buttons *************************
     */
    $("#orientation_button").click(function (e) {
        e.preventDefault();
        if ($(e.target).hasClass('vertical')) {
            $(e.target).removeClass('vertical');
            $(e.target).addClass('horizontal');
            this.setViewOrientation('horizontal');
            this.currentOrientation = 'horizontal';
        } else {
            $(e.target).removeClass('horizontal');
            $(e.target).addClass('vertical');
            this.setViewOrientation('vertical');
            this.currentOrientation = 'vertical';
        }
    }.bind(this));

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
                this.ortho[slice_list[i].charAt(0)].visible = true;
                count++;
            } else {
                this.ortho[slice_list[i].charAt(0)].visible = false;
            }
        }
        for (var i = 0; i < this.views.length; i++) {
            this.views[i].setVisibleViews(this.ortho, count, this.horizontalView);
        }
        window.dispatchEvent(new Event('resize'));

        this.currentZoom = 0; // necessary as the zoom resets on change

    }.bind(this)).button('enable');

    // Scale bar visiblity
    this.setScaleSelect(); // creates widget
    $('#scale_visible').change(function (ev) {
        if ($(ev.currentTarget).is(':checked')) {
            $('#scale_select').selectmenu("enable");
            $('.scale_outer').css(
                    {'visibility': 'visible'}
            );
        } else {
            $('#scale_select').selectmenu("disable");
            $('.scale_outer').css(
                    {'visibility': 'hidden'}
            );
        }
    }.bind(this));

    $('#scale_visible').prop("checked", true) // check
            .trigger('change') // trigger change
            .prop("disabled", false); // enabled checkbox

    // Modality
    $('.modality_button').unbind('change').change(function (ev) {
        var checkedStageModality = ev.currentTarget.id;
        this.setStageModality(checkedStageModality);
    }.bind(this));

    $(".button").button();

    $("#viewHeightSlider")
        .slider({
            disabled: false,
            min: 200,
            max: 1920,
            value: this.currentViewHeight,
            slide: $.proxy(function (event, ui) {
                this.currentViewHeight = ui.value;
                $('.sliceWrap').css('height', ui.value);
                this.scaleOrthogonalViews();
                var evt = document.createEvent('UIEvents');
                evt.initUIEvent('resize', true, false, window, 0);
                window.dispatchEvent(evt);
            }, this)
    });
    
    $('#analysis_button').click(function(e) {
        this.wtView.showAnalysisData();
    }.bind(this));

};

iev.viewer2D.prototype.basename = function (path) {
    /**
     * Extract the basename from a path
     * @method basename
     * @param {String} path File path
     */
    return path.split(/[\\/]/).pop();
};

iev.viewer2D.prototype.objSize = function (obj) {
    var count = 0;
    var i;

    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            count++;
        }
    }
    return count;
};

iev.viewer2D.prototype.setBreadCrumb = function () {
    /*
     * Get the dynamically generated menu code. Split into main menu and the login section
     */

    var mgi_href = '/data/genes/' + this.mgi;
    var b_link = $('#ievBreadCrumbGene').html(this.gene_symbol).attr('href', mgi_href)
};

iev.viewer2D.prototype.setInitialViewerHeight = function () {
    /*Get the height available for the specimen views*/
    var sliceViewControlsHeight = 32 + 6; // Currently set in embryo.css the 6 is for padding
    var windowHeight = $(window.top).innerHeight();
    var helpHeight = $('#help').outerHeight();
    var impcHeaderHeight = $('#header').outerHeight();
    var subHeaderHeight = $('#iev_subHeader').outerHeight();
    var mainControlsHeight = $('#ievControlsWrap').outerHeight();
    this.availableViewHeight = Math.round((windowHeight - impcHeaderHeight - subHeaderHeight -
            mainControlsHeight - helpHeight - (sliceViewControlsHeight * 2)) / 2);
    /* add a new stylesheet fort the specimen view wrapper height as it's not been created yet */
    //If we are on a laptop we may not want to set the minimum size too small
    var viewHeight = this.availableViewHeight < 200 ? 200 : this.availableViewHeight;
    this.currentViewHeight = viewHeight;
    $("<style type='text/css'> .sliceWrap{height:" + viewHeight + "px;}</style>").appendTo("head");

};


iev.viewer2D.prototype.setViewOrientation = function (orientation) {

    if (orientation === 'vertical') {
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

    if (orientation === 'horizontal') {

        this.horizontalView = false;
        var numVisible = 0;
        for (var item in this.ortho) {
            if (this.ortho[item].visible)
                ++numVisible;
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
    this.currentZoom = 0; //reset zoom
};

iev.viewer2D.prototype.setScaleSelect = function () {
    $('#scale_select')
            .find('option') // get all existing options
            .remove() // remove them
            .end() // end
            .append(this.scaleLabels().join("")) // append all options
            .selectmenu({// create select menu widget
                width: 80,
                height: 20,
                change: $.proxy(function (event, ui) {
                    this.scales.currentBarSize = ui.item.value;
                    $('.scale_text').text(ui.item.label);
                    this.scaleOrthogonalViews();

                }, this)
            });
};


iev.viewer2D.prototype.isInternetExplorer = function () {
    /*
     * XTK currently fails with IE. Check if we are using IE
     * Return True if using any IE version
     * If using < 11, display not supported message
     */

    if (navigator.userAgent.indexOf('MSIE') !== -1) {
        return 'oldIe';
    } else if (navigator.appVersion.indexOf('Trident/') > 0) {
        console.log('using IE 11');
        return 'ie11';
    } else {                 // If another browser, return 0
        return false;
    }

};


iev.viewer2D.prototype.catchXtkLoadError = function () {
    //This is an attempt to catch error messages from XTK loading errors as it does not have a error function to hook into
    window.onerror = function (errorMsg, url, lineNumber) {

        if (errorMsg === 'Uncaught Error: input buffer is broken' ||
                errorMsg === 'Uncaught Error: Loading failed' ||
                errorMsg === 'Uncaught Error: invalid file signature')
        {
            for (var i = 0; i < this.views.length; ++i) {
                this.views[i].caughtXtkLoadError();
            }
        }
    };
};





