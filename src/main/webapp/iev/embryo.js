goog.provide('iev.embryo');
goog.require('iev.viewer2D');
goog.require('iev.viewer3D');
//goog.require('iev');


iev.embryo = function(){
    
    this.IMAGE_SERVER = 'https://www.mousephenotype.org/images/emb/';
    this.ANA_SERVER = 'https://www.mousephenotype.org/images/ana/';
    this.WILDTYPE_COLONYID = 'baseline';
    this.OUTPUT_FILE_EXT = '.nrrd';
    this.lastBookmark = window.location.href;
    
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
    
    $.widget("custom.iconselectmenu", $.ui.selectmenu, {
        _renderItem: function (ul, item) {
            var li = $("<li>", {text: item.label});
            if (item.disabled) {
                li.addClass("ui-state-disabled");
            }

            $("<span>", {
                style: item.element.attr("data-style"),
                "class": "ui-icon " + item.element.attr("data-class")
            })
                    .appendTo(li);
            return li.appendTo(ul);
        }
    });

    this.setupImpcMenus();
    this.setupTabs();  
    this.createControlPanel();
   
};

iev.embryo.prototype.setupImpcMenus = function() {

    var protocol = window.location.protocol === "https:"? 'https' : 'http';

    var header_menu_source;
    //Set the correct menu depending on which sub-domain we're on
    switch (location.hostname) {

        case 'localhost':
            header_menu_source = 'menudisplaycombinedrendered.html';
            break;
        case 'www.mousephenotype.org':
            header_menu_source = protocol + '://www.mousephenotype.org/menudisplaycombinedrendered';
            break;
        case 'beta.mousephenotype.org':
            header_menu_source = protocol + '://beta.mousephenotype.org/menudisplaycombinedrendered';
            break;
        case 'dev.mousephenotype.org':
            header_menu_source = protocol + '://dev.mousephenotype.org/menudisplaycombinedrendered';
            break;
    }
    $.get(header_menu_source, function (data) {
        var menuItems = data.split("MAIN*MENU*BELOW");
        $('#block-menu-block-1').append(menuItems[1]);
        $('#tn').append(menuItems[0]);
    });
};

iev.embryo.prototype.setupTabs = function() {
    
    // Set up tabbed view
    $("#ievTabs" ).tabs({
        
        activate: function(event, ui) {
            
            if (!event.hasOwnProperty("data")) {
                return; // if tab switched programatically
            }
            
            var tabId = ui.newPanel.attr('id');
            $(".ievControlsWrap").show();

            var bookmark; // try to generate bookmark, or use old one

            try {
                bookmark = this.activeViewer.generateBookmark();
                this.lastBookmark = bookmark;
            } catch (err) {
                bookmark = this.lastBookmark;
            }
    
            var config = this.parseBookmark($.getQueryParameters(bookmark));
            config['mode'] = this.bookmarkData['mode'];
            config['gene'] = this.bookmarkData['gene'];

            if (tabId === 'volumeRenderingMain' && this.viewer3D.isDestroyed) {
                this.viewer2D.onDestroy();
                this.viewer3D.onTab(config);                    
                this.activeViewer = this.viewer3D;
            } else if (tabId === 'sliceViewMain' && this.viewer2D.isDestroyed) {
                this.viewer3D.onDestroy();  
                this.viewer2D.onTab(config);                
                this.activeViewer = this.viewer2D;
            } else {
                if (!this.activeViewer.isDestroyed) {
                    this.activeViewer.onDestroy();
                }
                $(".ievControlsWrap").hide();
                this.tabCallback();
            }
 
        }.bind(this),
        disabled: true
        
    }).removeClass('ui-widget ui-widget-content').show();
     
};

iev.embryo.prototype.tabCallback = function() {
    $("#ievTabs" ).tabs("enable");
};

iev.embryo.prototype.createControlPanel = function() {
    
    // Create control panel
     var $container = $('#controlPanel');           
     var source = $("#main_controls_template").html();
     var template = Handlebars.compile(source);
     this.$controlPanel = $(template()); 
     $container.prepend(this.$controlPanel);
    
    // Attach events here that refer to the active viewer
    $("#reset")
    .click($.proxy(function () {
        this.resetViewer(this.activeViewer);
    }, this));

};

iev.embryo.prototype.centreSelector = function (data) {
    /*
     * Sets up the drop down menu with avaiable centre icons for this particular mgi/colony etc
     */

    var options = [];

    for (var key in this.centreOptions) {
        if (key in data) {
            var iconClass = 'centreSelectIcon cen_' + key;
            options.push("<option value='" + key + "'" + "' data-class='" + iconClass + "'>" + this.centreOptions[key] + "</option>");
        }
    }
    
    var currentCentreId = key;

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
    $centre_select.val(currentCentreId).iconselectmenu('refresh', true);
};

iev.embryo.prototype.modalityData = function() {
    
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
};

iev.embryo.prototype.parseBookmark = function(queryParams) {
    
    var bookmarkData = {'wt': {}, 'mut': {}};
    for (var k in queryParams) {
        if (queryParams.hasOwnProperty(k)) {                        
            if (k.startsWith('w')) {                            
                bookmarkData['wt'][k.substring(1)] = queryParams[k];
            } else if (k.startsWith('m')) {
                bookmarkData['mut'][k.substring(1)] = queryParams[k];
            } else {
                bookmarkData[k] = queryParams[k];
            }
        }
    }
    
    return bookmarkData;
    
};

iev.embryo.prototype.run = function(colonyId, geneSymbol, mgi, queryParams) {
    
    this.bookmarkData = this.parseBookmark(queryParams);
    
    if (colonyId !== 'null'){
        this.bookmarkData['mode'] = "colony_id";
        this.bookmarkData['gene'] = colonyId;
        this.getVolumesByColonyId(colonyId);
    }
    else if (geneSymbol !== 'null') {
        this.bookmarkData['mode'] = "gene_symbol";
        this.bookmarkData['gene'] = geneSymbol;
        this.getVolumesByGeneSymbol(geneSymbol);
    }
    else if (mgi !== 'null') {
        this.bookmarkData['mode'] = "mgi";
        this.bookmarkData['gene'] = mgi;
        this.getVolumesByMgi(mgi);
    }    
    
};

iev.embryo.prototype.setTab = function() {
    
    // Set active tab
    if (!this.bookmarkData['v']) {
        this.activeViewer = this.viewer2D;
    } else {
        
        $("#ievTabs" ).tabs("enable");
    
        switch(this.bookmarkData['v']) {
            case '2d':
                $("#ievTabs").tabs("option", "active", 0);
                this.activeViewer = this.viewer2D;
                break;
            case '3d':
                $("#ievTabs").tabs( "option", "active", 1);
                this.activeViewer = this.viewer3D;
                break;
            default:
                $("#ievTabs").tabs( "option", "active", 0);
                this.activeViewer = this.viewer2D;
                break;
        }
        
        $("#ievTabs" ).tabs("disable");
    }
    
    this.activeViewer.onTab(this.bookmarkData);
    
};

iev.embryo.prototype.organiseData = function(data) {
  
    /**
     * Seperate out the baseline data and the mutant data.
     * If data is not available, load an error message
     */
    var centreData = {};
    
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
            centreData[cen] = modData;

        }
        this.currentCentreId = cen; // Just pick the last one to be visible

    }
    
    this.centreSelector(centreData);
    return centreData;
    
};


iev.embryo.prototype.getModalityData = function () {

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

iev.embryo.prototype.buildUrl = function (data) {
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

};

iev.embryo.prototype.analysisUrl = function (data, name, ext) {
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
            + data.id +  '/'
            + name + ext;
    return url;
};

iev.embryo.prototype.dcc_get = function(url, handler){
    
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onreadystatechange = function(event) {
        if (request.readyState === 4) {
            if (request.status === 200)
                handler(JSON.parse(request.responseText));
            else
                console.error('Unable to retrieve data from ' + url);
        }
    };
    request.send(null);
};

iev.embryo.prototype.getVolumesByColonyId = function(colonyId) {   
    this.dcc_get("rest/volumes" + (colonyId === undefined ? "" : "?colony_id=" + colonyId), 
        function(data) {
            data = this.organiseData(data);
            this.viewer2D = new iev.viewer2D(data, 'viewer', 'colony ID', colonyId, this.tabCallback.bind(this));
            this.viewer3D = new iev.viewer3D(data, 'volumeRenderer', 'colony ID', colonyId, this.tabCallback.bind(this));
            this.setTab();
        }.bind(this)
    );
};
    
iev.embryo.prototype.getVolumesByGeneSymbol = function(geneSymbol) {
    this.dcc_get("rest/volumes" + (geneSymbol === undefined ? "" : "?gene_symbol=" + geneSymbol), 
        function(data) {
            data = this.organiseData(data);
            this.viewer2D = new iev.viewer2D(data, 'viewer', geneSymbol, 'gene symbol', this.tabCallback.bind(this));     
            this.viewer3D = new iev.viewer3D(data, 'volumeRenderer', geneSymbol, 'gene symbol', this.tabCallback.bind(this));
            this.setTab();
        }.bind(this)
    );
};
    
iev.embryo.prototype.getVolumesByMgi = function(mgi) {
    this.dcc_get("rest/volumes" + (mgi === undefined ? "" : "?mgi=" + mgi), 
        function(data) {
            data = this.organiseData(data);
            this.viewer2D = new iev.viewer2D(data, 'viewer', 'mgi', mgi, this.tabCallback.bind(this));  
            this.viewer3D = new iev.viewer3D(data, 'volumeRenderer', 'mgi', mgi, this.tabCallback.bind(this));
            this.setTab();
        }.bind(this)
    );
};

iev.embryo.prototype.resetViewer = function(viewer) {
    for (var i = 0; i < this.objSize(viewer.views); i++) {
        viewer.views[i].reset();
    }
};

iev.embryo.prototype.objSize = function (obj) {
    var count = 0;
    var i;

    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            count++;
        }
    }
    return count;
};

goog.exportSymbol('iev.embryo.prototype.getVolumesByMgi', iev.embryo.prototype.getVolumesByMgi);
goog.exportSymbol('iev.embryo.prototype.getVolumesByGeneSymbol', iev.embryo.prototype.getVolumesByGeneSymbol);
goog.exportSymbol('iev.embryo.prototype.getVolumesByColonyId', iev.embryo.prototype.getVolumesByColonyId);
