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
templates['mainControlsTemplate'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "\n        <div class='ievControlsWrap' class=\"noselect\">\n        \n            <div class='top_bar' id=\"simple_controls\">\n                <fieldset id=\"orthogonal_views_buttons_fieldset\">\n                    <legend>Views</legend>\n                    <div id=\"orthogonal_views_buttons\">\n                        <input type=\"checkbox\" id=\"X_check\" class='toggle_slice' title=\"Sagittal\" checked>\n                        <label for=\"X_check\" id='X_check_label'>S</label>\n                        <input type=\"checkbox\" id=\"Y_check\" class='toggle_slice' title=\"Coronal\" checked>\n                        <label for=\"Y_check\" id='Y_check_label'>C</label>\n                        <input type=\"checkbox\" id=\"Z_check\" class='toggle_slice' title=\"Axial\" checked>\n                        <label for=\"Z_check\" id='Z_check_label'>A</label>\n\n                        <div id='orientation_buttons'>\n                        <div id=\"orientation_button\" class=\"orientation horizontal hoverable\" title=\"Switch orientation\">\n                    </div>\n                </fieldset>\n\n                <fieldset id=\"zoom_fieldset\">\n                    <legend>Zoom</legend>\n                    <span class=\"button\" id=\"zoomIn\">+</span>\n                    <span class=\"button\" id =\"zoomOut\">-</span>   \n                    <!--<span class=\"button\" id =\"screenShot\">c</span>--> \n                </fieldset>\n\n                <fieldset id=\"reset_fieldset\" class=\"centered\">\n                    <legend>Reset</legend>\n                    <div id=\"reset\">\n                          <img src=\"images/reload.png\" height=\"25\" class=\"hoverable\" title=\"Restore default view\">\n                    </div>\n                </fieldset>\n        \n                <fieldset id=\"download_fieldset\" class=\"centered\">\n                    <legend>Download</legend>\n                    <div id=\"download\">\n                        <img src=\"images/download.png\" height=\"25\" id=\"download_img\" class=\"hoverable\" title=\"Download embryo data\">\n                    </div>\n                </fieldset>       \n\n                <fieldset id=\"bookmark_fieldset\" class=\"centered\">\n                    <legend>Share</legend>\n                    <div id=\"createBookmark\">\n                        <img src=\"images/bookmark.png\" height=\"25\" id=\"bookmark_img\" title=\"Generate URL for current view\" class=\"hoverable\">\n                    </div>\n                </fieldset>\n        \n                <fieldset id=\"toggle_fieldset\" class=\"centered\">\n                    <legend>Advanced</legend>\n                    <img src=\"images/advanced.png\" height=\"25\" id=\"toggle_img\" title=\"Toggle advanced controls\" class=\"hoverable\">\n                </fieldset>\n                \n            </div>\n            \n            <div class='top_bar' id=\"advanced_controls\">\n            \n                <fieldset id=\"scale_fieldset\" title=\"Configure scale bar\">\n                    <legend>Scale bar\n                    <input type=\"checkbox\" id=\"scale_visible\" name=\"radio\" checked=\"checked\">\n                    </legend>\n                    <select name=\"scale_select\" id=\"scale_select\">\n                    </select>  \n                </fieldset>\n        \n                <fieldset id=\"heightslider_fieldset\">\n                    <legend>View height</legend>\n                    <div id=\"viewHeightSlider\"></div>\n                </fieldset>\n        \n                <fieldset id=\"color_fieldset\">\n                    <legend>Invert</legend>\n                    <div id=\"invertColours\" class=\"ievgrey hoverable\" title=\"Invert colours\"></div>\n                </fieldset>\n        \n                <fieldset id=\"analysis_fieldset\">\n                    <legend>Analysis</legend>  \n                    <div id=\"analysis_button\" class=\"hoverable disabled\"  title=\"No analysis data available\">\n                    </div>\n                </fieldset>\n        \n                <fieldset id=\"centres_fieldset\">\n                    <legend>Centres</legend>\n                    <select name=\"centre_select\" id=\"centre_select\">\n                    </select>                \n                </fieldset>\n            </div>\n    \n            <div class='top_bar' id=\"modality_controls\">\n                <fieldset id=\"modality_stage_fieldset\">\n                    <legend>Modality/stage selection</legend>\n                    <div id=\"modality_stage\" title=\"Change modality\">\n                        <input type=\"radio\" id=\"202\" class=low\"modality_button\" name=\"project\">\n                        <label for=\"202\" class=\"button_label\">OPT E9.5</label>\n                        \n                        <input type=\"radio\" id=\"203\" name=\"project\" class=\"modality_button\">\n                        <label for=\"203\" class=\"button_label\">&#956;CT E14/E15.5</label>\n\n                        <input type=\"radio\" id=\"204\" name=\"project\" class=\"modality_button\">\n                        <label for=\"204\" class=\"button_label\">&#956;CT E18.5</label>\n                    </div>\n                </fieldset>\n            </div>\n        </div>\n";
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
templates['volume_view_template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "\n        <div class=\"volWrap noselect\" id=\"vol_"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n        </div>\n    </script>\n    \n    <script id=\"progress_template\" type=\"text/x-handlebars-template\">\n        <div class=\"ievLoading\" id=\"ievLoading"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n            <div class=\"ievLoadingMsg\" id=\"ievLoadingMsg"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n                "
    + alias4(((helper = (helper = helpers.msg || (depth0 != null ? depth0.msg : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"msg","hash":{},"data":data}) : helper)))
    + "\n            </div>\n        </div>\n\n";
},"useData":true});
})();
