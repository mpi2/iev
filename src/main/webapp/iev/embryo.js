goog.provide('iev.embryo');
goog.require('iev.viewer2D');
goog.require('iev.viewer3D');
//goog.require('iev');


iev.embryo = function(){
    
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
            
            if (event.hasOwnProperty('data')) {
                        
                var tabId = ui.newPanel.attr('id');

                // Generate bookmark
                var bookmark = this.activeViewer.generateBookmark();
                var config = this.parseBookmark($.getQueryParameters(bookmark));
                config['mode'] = this.bookmarkData['mode'];
                config['gene'] = this.bookmarkData['gene'];

                if (tabId === 'volumeRenderingMain') {

                    // Destroy 2D viewer and switch to 3D
                    this.viewer2D.onDestroy();
                    this.viewer3D.onTab(config);                    
                    this.activeViewer = this.viewer3D;

                } else if (tabId === 'sliceViewMain') {
                    this.viewer3D.onDestroy();  
                    this.viewer2D.onTab(config);                
                    this.activeViewer = this.viewer2D;
                }
            }
            
        }.bind(this)
        
    }).removeClass('ui-widget ui-widget-content').show();
     
};

iev.embryo.prototype.createControlPanel = function() {
    
    // Create control panel
     var $container = $('#controlPanel');           
     var source = $("#main_controls_template").html();
     var template = Handlebars.compile(source);
     this.$controlPanel = $(template()); 
     $container.prepend(this.$controlPanel);

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
    
        switch(this.bookmarkData['v']) {
            case '2d':
                $("#ievTabs").tabs( "option", "active", 0);
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
    }
    
    this.activeViewer.onTab(this.bookmarkData);
    
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
            this.viewer2D = new iev.viewer2D(data, 'viewer', 'colony ID', colonyId);
            this.viewer3D = new iev.viewer3D(data, 'volumeRenderer', 'gene symbol', colonyId);
            this.setTab();
        }.bind(this)
    );
};
    
iev.embryo.prototype.getVolumesByGeneSymbol = function(geneSymbol) {
    this.dcc_get("rest/volumes" + (geneSymbol === undefined ? "" : "?gene_symbol=" + geneSymbol), 
        function(data) {
            this.viewer2D = new iev.viewer2D(data, 'viewer', 'gene symbol', geneSymbol);     
            this.viewer3D = new iev.viewer3D(data, 'volumeRenderer', 'gene symbol', geneSymbol);
            this.setTab();
        }.bind(this)
    );
};
    
iev.embryo.prototype.getVolumesByMgi = function(mgi) {
    this.dcc_get("rest/volumes" + (mgi === undefined ? "" : "?mgi=" + mgi), 
        function(data) {
            this.viewer2D = new iev.viewer2D(data, 'viewer', 'mgi', mgi);  
            this.viewer3D = new iev.viewer3D(data, 'volumeRenderer', 'gene symbol', mgi);
            this.setTab();
        }.bind(this)
    );
};

iev.embryo.prototype.resetViewer = function(viewer) {
    for (var i = 0; i < viewer.views.length; i++) {
        viewer.views[i].reset();
    }
};

goog.exportSymbol('iev.embryo.prototype.getVolumesByMgi', iev.embryo.prototype.getVolumesByMgi);
goog.exportSymbol('iev.embryo.prototype.getVolumesByGeneSymbol', iev.embryo.prototype.getVolumesByGeneSymbol);
goog.exportSymbol('iev.embryo.prototype.getVolumesByColonyId', iev.embryo.prototype.getVolumesByColonyId);
