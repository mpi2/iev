goog.provide('iev.specimenPanel');


iev.specimenPanel = function(id, replaceVolume) {

    this.id = id;
    this.replaceVolume = replaceVolume;
    this.windowLevel = 'windowLevel_' + id;
    this.vselector = 'volumeSelector_' + id;
    this.controls = 'controls_' + id;
    this.overlayControl = 'overlayControl_' + id;

    
    /** @const */ 
    this.WILDTYPE_COLONYID = 'baseline';
    
    /** @const */ 
    this.ICONS_DIR = "images/centre_icons/";
    /** @const */ 
    this.IMG_DIR = "images/";
    /** @const */ 
    this.FEMALE_ICON = "female.png";
    /** @const */ 
    this.MALE_ICON = "male.png";
    /** @const */
    this.NDSEX_ICON = "unknown_sex.png";
    /** @const */ 
    this.HOM_ICON = 'hom.png';
    /** @const */ 
    this.HET_ICON = 'het.png';
    /** @const */ 
    this.HEMI_ICON = 'het.png';
    /** @const */ 
    this.WT_ICON = 'wildtype.png';
    /** @const */ 
    this.AVERAGE_ICON = 'average.png';
    
    /** @const */ 
    this.centreIcons ={
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
    
    /** @const */ 
    this.monthNames = ["Jan", "Feb", "Mar", "April", "May", "June",
        "July", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    this.specimenMetaTemplateSource = $("#specimenMetdataTemplate").html();
    
};

iev.specimenPanel.prototype.create = function() {
    /**
     * Use handlebars.js to the controls tab HTML for the specimen view
     * Controls tab contains zoom buttons contrst slider etc.
     * 
     * @method controls_tab
     * 
     */

    var data = {
        id: this.id,
        controlsButtonsId: "controlsButtons_" + this.id,
        selectorWrapId: "selectorWrap_" + this.id,
        vselectorId: this.vselector,
        windowLevelId: this.windowLevel,
        overlayId: this.overlayControl
    };

    var source   = $("#slice_controls_template").html();
    var template = Handlebars.compile(source);
    return template(data);
    
};

iev.specimenPanel.prototype.updateVolumeSelector = function(currentVolume, volumeData) {
    
    //This custom widget is also used in main. Should define it somewhere else
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
    
    //remove any current options
    $('#' + this.vselector)
            .find('option')
            .remove()
            .end();

    // Add the volume options
    var options = [];
    
    for (var i in volumeData) {
        var url = volumeData[i]['volume_url'];
        var sex = volumeData[i].sex.toLowerCase();
        var zygosity = volumeData[i].zygosity.toLowerCase();
        
        if (sex === 'no data') sex ='no_data';        
        
            var idForSexZygosityIcon;

            if (volumeData[i].colonyId === this.WILDTYPE_COLONYID){
                idForSexZygosityIcon = 'specimenSelectIcon ' + sex + '_' + 'wildtype';
            } else {
                idForSexZygosityIcon = 'specimenSelectIcon ' + sex + '_' + zygosity;
            }
      
        var animalNameForDisplay = volumeData[i].animalName.substring(0, 25);

        if (url === currentVolume['volume_url']) {
            options.push("<option value='" + url  + "' data-class='" + idForSexZygosityIcon + "' selected>" + animalNameForDisplay + "</option>");
            this.bookmarkHasVolume = false;
        } else {
            options.push("<option value='" + url + "' data-class='" + idForSexZygosityIcon + "'>" + animalNameForDisplay + "</option>");
        }
    }


    $('#' + this.vselector)
            .append(options.join(""));


    $('#' + this.vselector).iconselectmenu()
            .iconselectmenu("menuWidget")
            .addClass("ui-menu-icons customicons");

    $('#' + this.vselector)
            .iconselectmenu({
                change: $.proxy(function (event, ui) {
                    this.replaceVolume(ui.item.value);                    
                }, this)
            })
            .iconselectmenu("refresh");                  
};
        
iev.specimenPanel.prototype.showMetadata = function(currentVolume) {

    if (currentVolume.experimentDate) {
        var date = new Date(currentVolume.experimentDate);
    } else {
        var date = new Date(currentVolume.dateAnalysed);
    }
    
    var displayDate = this.monthNames[date.getMonth()];

    displayDate += " " + date.getDate();
    displayDate += " " + date.getFullYear();

    var sexIconPath;
    if (currentVolume.sex.toLowerCase() === 'female'){
        sexIconPath = this.IMG_DIR + this.FEMALE_ICON;
    }
    else if (currentVolume.sex.toLowerCase() === 'male'){
        sexIconPath = this.IMG_DIR + this.MALE_ICON;
    }
    else if (currentVolume.sex.toLowerCase() === 'no data'){
        sexIconPath = this.IMG_DIR + this.NDSEX_ICON;
    }

    // Set the zygosity icon for mutants or the 'WT' icon for baselines 
    var zygIconPath;
    var zygIcon;

    if (currentVolume.colonyId === this.WILDTYPE_COLONYID){
        zygIcon = this.WT_ICON;
    }

    else{

        switch (currentVolume.zygosity.toLowerCase()){
            case 'homozygous':
                zygIcon = this.HOM_ICON;
                break;
            case 'heterozygous':
                zygIcon = this.HET_ICON;
                break;
            case 'hemizygous':
                zygIcon = this.HEMI_ICON;
                break;
            default:
                zygIcon = this.AVERAGE_ICON;
        }
    }

    zygIconPath = this.IMG_DIR + zygIcon;

    var centreLogoPath = "";

    if (this.centreIcons.hasOwnProperty(currentVolume.cid)){
        centreLogoPath = this.ICONS_DIR + this.centreIcons[currentVolume.cid];
    }

    var data = {
        animalId: currentVolume.animalName,
        date: displayDate,
        sexIconPath: sexIconPath,
        zygIconPath: zygIconPath,
        centreLogoPath: centreLogoPath
    };

    var template = Handlebars.compile(this.specimenMetaTemplateSource);

    var $metaDataHtml = $(template(data));

    //Clear any current metadata
    $("#metadata_" + this.id).empty();
    $("#metadata_" + this.id).append($metaDataHtml);
};
        
        
iev.specimenPanel.prototype.setContrastSlider = function(volume) {
    /**
     * Makes contrast slider for specimen view
     * @method setContrastSlider
     */
    console.log(volume.min);

    this.$windowLevel = $('#' + this.windowLevel);

    this.$windowLevel.slider({
        range: true,
        min: parseInt(volume.min),
        max: parseInt(volume.max),
        step: Math.ceil((volume.max - volume.min) / 256),
        values: [ parseInt(volume.windowLow), parseInt(volume.windowHigh)],
        slide: $.proxy(function (event, ui) {
            volume.windowLow = ui.values[0];
            volume.windowHigh = ui.values[1];
            volume.modified(true);
        })
    });
};

iev.specimenPanel.prototype.setVisible = function(bool) {
    
    if (bool) {
        $("#metadata_" + this.id).show();
        this.$windowLevel.show();
    } else {
        $("#metadata_" + this.id).hide();
        this.$windowLevel.hide();
    }
};