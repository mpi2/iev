(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['downloadTableRowTemplate'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return " <tr>\n       <td style=\"background-color: "
    + alias4(((helper = (helper = helpers.bg || (depth0 != null ? depth0.bg : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"bg","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.volDisplayName || (depth0 != null ? depth0.volDisplayName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"volDisplayName","hash":{},"data":data}) : helper)))
    + "</td>\n       <td><input type='checkbox' name="
    + alias4(((helper = (helper = helpers.remotePath || (depth0 != null ? depth0.remotePath : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"remotePath","hash":{},"data":data}) : helper)))
    + "></td>\n       </tr>";
},"useData":true});
templates['downloadTableRowTemplateHighRes'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<tr>\n       <td style=\"background-color: "
    + alias4(((helper = (helper = helpers.bg || (depth0 != null ? depth0.bg : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"bg","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.volDisplayName || (depth0 != null ? depth0.volDisplayName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"volDisplayName","hash":{},"data":data}) : helper)))
    + "</td>\n       <td><a href="
    + alias4(((helper = (helper = helpers.remotePath || (depth0 != null ? depth0.remotePath : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"remotePath","hash":{},"data":data}) : helper)))
    + ">Download</a></td>\n       </tr>";
},"useData":true});
templates['ie_warning_template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"nodata\">\n        <p>We do not currently support Internet Explorer, but are looking at supporting it in the near future.</p>\n        <p>For now, We recommend using Chrome of Firefox</p>\n        <div id='browser_icons'>\n            <a href='https://www.mozilla.org/en-GB/firefox/new/'><img src='images/firefox.png'></a>\n            <a href='https://www.google.co.uk/chrome/browser/desktop/'><img src='images/chrome.png'></a>\n        </div>\n        </div>";
},"useData":true});
templates['no_data_template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"nodata\">\n        <p>&nbsp;</p>\n        <p>There are no data currently available for "
    + alias4(((helper = (helper = helpers.queryType || (depth0 != null ? depth0.queryType : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"queryType","hash":{},"data":data}) : helper)))
    + ": <strong>"
    + alias4(((helper = (helper = helpers.colonyId || (depth0 != null ? depth0.colonyId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"colonyId","hash":{},"data":data}) : helper)))
    + "</strong></p>\n        \n        <p>Click <a target=\"none\" href=\"https://www.mousephenotype.org/data/search/gene?kw=*&fq=(embryo_data_available:%22true%22)\">here</a> to see all available data</p> \n\n        </div>";
},"useData":true});
templates['progress_template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        <div class=\"ievLoading\" id=\"ievLoading"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n            <div class=\"ievLoadingMsg\" id=\"ievLoadingMsg"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n            Images loading\n            </div>\n        </div";
},"useData":true});
templates['redirect_test_template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return " <div class=\"nodata\">\n        <p>This test no longer works. Try this one:</p>\n        <p><a href=\"https://www.mousephenotype.org/embryoviewer?gene_symbol=Klf7\" target=\"_top\">beta.mousephenotype.org/embryoviewer?gene_symbol=Klf7</a></p>\n        </div>";
},"useData":true});
templates['slice_controls_template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return " \n        <div id=\"controls_"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"class=\"controls clear\">\n            <div class=\"selectorWrap\" id=\""
    + alias4(((helper = (helper = helpers.selectorWrapId || (depth0 != null ? depth0.selectorWrapId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"selectorWrapId","hash":{},"data":data}) : helper)))
    + "\" title=\"Select an embryo\">\n                <select id=\""
    + alias4(((helper = (helper = helpers.vselectorId || (depth0 != null ? depth0.vselectorId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"vselectorId","hash":{},"data":data}) : helper)))
    + "\" class =\"selectmenu\" style='position:relative;z-index:1100'></select>\n            </div>\n            <div class=\"wlwrap\">\n               \n                <div id=\""
    + alias4(((helper = (helper = helpers.windowLevelId || (depth0 != null ? depth0.windowLevelId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"windowLevelId","hash":{},"data":data}) : helper)))
    + "\" class=\"windowLevel\" title=\"Change brightness/contrast\"></div>\n             \n            </div>\n    \n            <div class=\"overlayWrap\">\n\n                <div class=\"overlayToggle\" id=\""
    + alias4(((helper = (helper = helpers.overlayId || (depth0 != null ? depth0.overlayId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"overlayId","hash":{},"data":data}) : helper)))
    + "\" style=\"display: none;\">\n                    <input type=\"radio\" id=\"none_"
    + alias4(((helper = (helper = helpers.overlayId || (depth0 != null ? depth0.overlayId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"overlayId","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.overlayId || (depth0 != null ? depth0.overlayId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"overlayId","hash":{},"data":data}) : helper)))
    + "\" value=\"none\">\n                    <label for=\"none_"
    + alias4(((helper = (helper = helpers.overlayId || (depth0 != null ? depth0.overlayId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"overlayId","hash":{},"data":data}) : helper)))
    + "\" class=\"button_label\">None</label>\n\n                    <input type=\"radio\" id=\"jacobian_"
    + alias4(((helper = (helper = helpers.overlayId || (depth0 != null ? depth0.overlayId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"overlayId","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.overlayId || (depth0 != null ? depth0.overlayId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"overlayId","hash":{},"data":data}) : helper)))
    + "\" value=\"jacobian\">\n                    <label for=\"jacobian_"
    + alias4(((helper = (helper = helpers.overlayId || (depth0 != null ? depth0.overlayId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"overlayId","hash":{},"data":data}) : helper)))
    + "\" class=\"button_label\">Volume</label>\n\n                    <input type=\"radio\" id=\"intensity_"
    + alias4(((helper = (helper = helpers.overlayId || (depth0 != null ? depth0.overlayId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"overlayId","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.overlayId || (depth0 != null ? depth0.overlayId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"overlayId","hash":{},"data":data}) : helper)))
    + "\" value=\"intensity\">\n                    <label for=\"intensity_"
    + alias4(((helper = (helper = helpers.overlayId || (depth0 != null ? depth0.overlayId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"overlayId","hash":{},"data":data}) : helper)))
    + "\" class=\"button_label\">Intensity</label>\n                </div>\n        \n            </div>\n    \n            <div class=\"metadata\" id=\"metadata_"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n            \n            <div>\n        </div>";
},"useData":true});
templates['slice_view_template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"sliceWrap noselect\" id=\""
    + alias4(((helper = (helper = helpers.sliceWrapId || (depth0 != null ? depth0.sliceWrapId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sliceWrapId","hash":{},"data":data}) : helper)))
    + "\">\n            <div id=\"scale_outer"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + alias4(((helper = (helper = helpers.orientation || (depth0 != null ? depth0.orientation : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"orientation","hash":{},"data":data}) : helper)))
    + "\"  class='scale_outer scale_outer_"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "' >\n                <div class=\"scale\" id=\""
    + alias4(((helper = (helper = helpers.scaleId || (depth0 != null ? depth0.scaleId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"scaleId","hash":{},"data":data}) : helper)))
    + "\">\n                </div>\n                <div class='scale_text' id=\""
    + alias4(((helper = (helper = helpers.scaleTextId || (depth0 != null ? depth0.scaleTextId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"scaleTextId","hash":{},"data":data}) : helper)))
    + "\"></div>\n            </div>\n           \n        <div id=\""
    + alias4(((helper = (helper = helpers.sliceContainerID || (depth0 != null ? depth0.sliceContainerID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sliceContainerID","hash":{},"data":data}) : helper)))
    + "\" class =\"sliceView\"></div>\n        <div class=\"sliceControls\">\n            <div id=\""
    + alias4(((helper = (helper = helpers.sliderId || (depth0 != null ? depth0.sliderId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sliderId","hash":{},"data":data}) : helper)))
    + "\" class =\""
    + alias4(((helper = (helper = helpers.sliderClass || (depth0 != null ? depth0.sliderClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sliderClass","hash":{},"data":data}) : helper)))
    + "\"></div>\n                <input type='checkbox' class=\"linkCheck "
    + alias4(((helper = (helper = helpers.orientation || (depth0 != null ? depth0.orientation : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"orientation","hash":{},"data":data}) : helper)))
    + "\" id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + alias4(((helper = (helper = helpers.orientation || (depth0 != null ? depth0.orientation : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"orientation","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + alias4(((helper = (helper = helpers.orientation || (depth0 != null ? depth0.orientation : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"orientation","hash":{},"data":data}) : helper)))
    + "\" checked/>\n                <label for=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + alias4(((helper = (helper = helpers.orientation || (depth0 != null ? depth0.orientation : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"orientation","hash":{},"data":data}) : helper)))
    + "\" class=\"linkCheckLabel\"></label>\n\n        </div>\n        </div>";
},"useData":true});
templates['specimenMetdataTemplate'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return " <div class=\"centre_logo\" id=\"centre_logo_"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n            <img class=\"logo_img\" src=\""
    + alias4(((helper = (helper = helpers.centreLogoPath || (depth0 != null ? depth0.centreLogoPath : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"centreLogoPath","hash":{},"data":data}) : helper)))
    + "\"/>\n         </div>\n         <div class=\"metadata_c1\" id=\"metadata_c1_"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n            <div>\n                ID:"
    + alias4(((helper = (helper = helpers.animalId || (depth0 != null ? depth0.animalId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"animalId","hash":{},"data":data}) : helper)))
    + "\n            </div>\n            <div>\n                Date:"
    + alias4(((helper = (helper = helpers.date || (depth0 != null ? depth0.date : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"date","hash":{},"data":data}) : helper)))
    + "\n            </div>\n         </div>\n         <div class=\"metadata_c2\" id=\"metadata_c2_"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n            <div>\n                <img class=\"sexIcon\" src=\""
    + alias4(((helper = (helper = helpers.sexIconPath || (depth0 != null ? depth0.sexIconPath : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sexIconPath","hash":{},"data":data}) : helper)))
    + "\"/>\n            </div>\n             <div>\n                <img class=\"zygIcon\" src=\""
    + alias4(((helper = (helper = helpers.zygIconPath || (depth0 != null ? depth0.zygIconPath : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"zygIconPath","hash":{},"data":data}) : helper)))
    + "\"/>\n            </div>\n         </div>";
},"useData":true});
templates['specimen_view_template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class='specimen_view noselect'></div>";
},"useData":true});
})();