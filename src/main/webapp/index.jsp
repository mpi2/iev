<!--
Copyright 2015 Medical Research Council Harwell.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->



<!DOCTYPE html>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<html>
    <head>
        
        <link href='https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600' rel='stylesheet' type='text/css'>
        <meta name="google" content="notranslate" />
        <title>Interactive Embryo Viewer</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta http-equiv="X-UA-Compatible" content="chrome=1" />
        <meta name="google" content="notranslate" />
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
        <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/themes/smoothness/jquery-ui.css" />
        <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
        <script src="lib/handlebars.min.js"></script>
        <script type="text/javascript" src="X/lib/google-closure-library/closure/goog/base.js"></script>
        <!--<script type="text/javascript" src="X/xtk-deps.js"></script>-->
        <script type="text/javascript" src="lib/xtk.js"></script>
        <script type="text/javascript" src="iev/iev_deps.js"></script>
        <!--<script type="text/javascript" src="iev/iev_compiled.js"></script>-->
        <script type="text/javascript" src="lib/spin.min.js"></script>
        <script type="text/javascript" src="lib/fileDownload.js"></script>
            
        <!--from duncan-->
        <script type="text/javascript" src="/data/js/vendor/DataTables-1.10.4/media/js/jquery.dataTables.min.js?v=20150707"></script>
        <script type="text/javascript" src="/data/js/vendor/DataTables-1.10.4/extensions/TableTools/js/dataTables.tableTools.min.js?v=20150707"></script>
        <script type="text/javascript" src="/data/js/vendor/jquery.jeditable.js?v=20150707"></script>
        <!--[if lt IE 9 ]><script type="text/javascript" src="js/selectivizr-min.js"></script><![endif]-->
        <script type="text/javascript" src="/data/js/vendor/jquery/jquery.qtip-2.2/jquery.qtip.min.js?v=20150707"></script>
        <script type="text/javascript" src="/data/js/vendor/jquery/jquery.fancybox-2.1.5/jquery.fancybox.pack.js?v=20150707"></script>
        <script type="text/javascript" src="/data/js/vendor/jquery/jquery.tablesorter.min.js?v=20150707"></script>
        <script type='text/javascript' src='/data/js/charts/highcharts.js?v=20150707'></script>
        <script type='text/javascript' src='/data/js/charts/highcharts-more.js?v=20150707'></script>
        <script type='text/javascript' src='/data/js/charts/exporting.js?v=20150707'></script>
        <script type='text/javascript' src="/data/js/general/toggle.js?v=20150707"></script>
        
  
        
       <script type='text/javascript' src="/data/js/searchAndFacet/breadcrumbSearchBox.js"></script>
        <!--<link rel="stylesheet" href="css/css_yAAr2_tYpxdN25Mw1UPtSGqKc-8KVSUlCeFXve-A6OI.css">-->
        
        <link rel="stylesheet" type="text/css" href="css/embryo.css">
        
        <!--<link rel="stylesheet" href="css/css_yAAr2_tYpxdN25Mw1UPtSGqKc-8KVSUlCeFXve-A6OI.css">-->
        <link rel="stylesheet" href="/data/css/searchPage.css">
        <link rel="stylesheet" href="/data/css/default.css">
        <link rel="stylesheet" href="/data/css/vendor/font-awesome/font-awesome.min.css">
     
        
<script>
 var baseUrl = '/data';
 var solrUrl = null;

 if ( window.location.hostname == 'dev.mousephenotype.org' ){
  solrUrl = '/mi/impc/dev/solr';
}
else if ( window.location.hostname == 'beta.mousephenotype.org' ){
  solrUrl = '/mi/impc/beta/solr';
}
else  if (window.location.hostname == 'www.mousephenotype.org' ){
  solrUrl = '/mi/impc/solr';
}
//$(".menu-mlid-3127").removeClass( "active" );
</script>
    </head>
    
    <body>
        <!-- Got the menu and header code from https://github.com/mpi2/PhenotypeData/ -->
        <header id="header">
            <div class="region region-header">

                <div id="tn">
                    <!-- Login icons go here. Look in main.js-->
                </div>

                <div id="logo">
                    <a href="https://www.mousephenotype.org/"><img src="images/impc.png" alt="IMPC Logo" /></a>
                    <div id="logoslogan">International Mouse Phenotyping Consortium</div>
                </div>

                <nav id="mn"><div id="block-menu-block-1" class="block block-menu-block">

                    <!--menu goes . Look in main.js -->
                    
                    
                    </div>
                </nav>
            </div>
        </header>
        <div id="iev">
        <div id="iev_subHeader">


        <div class="breadcrumb">

            <a href="www.mousephenotype.org">Home</a> » <a href="/data/search">Search</a>&nbsp;» <a id='ievBreadCrumbGene' href=""></a>&raquo;&nbsp;IEV

            <div class="searchcontent">
                <div id="bigsearchbox" class="block">
                    <div class="content">
                        <p><i id="sicon" class="fa fa-search"></i></p>
                        <div class="ui-widget">
                            <input id="s" value="search">
                            <!--for dev-->
                            <!--<a><i class="fa fa-question-circle fa-2x searchExample" data-hasqtip="391"></i></a>-->
                            
                            <!--for live-->
                            <a><i class='fa fa-info searchExample'></i></a>
                            
                        </div>
                    </div>
                </div>
            </div>

            <div id="batchQryLink">
                    <a id="batchquery" href="/data/batchQuery"><i class="fa fa-th-list batchQuery"></i><span id="bqry">Batch search</span></a>
            </div>

        </div>
<!--<div class="breadcrumb"><a href="/">Home</a> » EmbryoViewer</div><div class="searchcontent"><div id="bigsearchbox" class="block"><div class="content"><p><i id="sicon" class="fa fa-search"></i></p><div class="ui-widget"><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input id="s" class="ui-autocomplete-input" autocomplete="off"><a><i class="fa fa-info searchExample" data-hasqtip="289"></i></a></div><p></p></div></div>
</div>-->

        </div>

<!--                <div id='batchQryLink'>
                    <a id='batchquery' href='/data/batchQuery'><i class='fa fa-th-list batchQuery'></i><span id='bqry'>Batch query</span></a>
                </div>-->
        
        
        

<!-- Overall wrapper around slice and volume rendering tabs -->
<div id="ievTabs">

    <ul>
        <li><a href="#sliceViewMain">2D</a></li>
        <li><a href="#volumeRenderingMain">3D</a></li>
        <li><a href="#helpTab">Help</a></li>
    </ul>
    
    <div id="controlPanel"></div>
    
    <div id="sliceViewMain">    
       
        <div class="clear"></div>
        <div id="viewer" class="noselect">

        </div>
    </div> <!-- main slice view end -->
    
    
    <div id="volumeRenderingMain">
        
        <div class="clear"></div>
        <div id="volumeRenderer" class="noselect">

        </div>
    </div>
    
    <div id="helpTab">
        <object data="https://www.mousephenotype.org/sites/beta.mousephenotype.org/files/mousephenotype_files/IEV_help.pdf" type="application/pdf">
            <embed src="https://www.mousephenotype.org/sites/beta.mousephenotype.org/files/mousephenotype_files/IEV_help.pdf" type="application/pdf" />
        </object>
    </div>
    
</div>
    
    <!-- URL query string handling and handlebars -->
        <script>
            goog.require('iev.embryo');
            window.addEventListener('load', function () {
                
                jQuery.extend({
                    getQueryParameters : function(str) {
                        return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
                    }
                });
                
                var dccGetter = new iev.embryo();
                
                var colonyId = "<%= request.getParameter("colony_id")%>";
                var geneSymbol = "<%= request.getParameter("gene_symbol")%>";
                var mgi = "<%= request.getParameter("mgi")%>";
                var queryParams = $.getQueryParameters();
                
                dccGetter.run(colonyId, geneSymbol, mgi, queryParams);

            });           
        </script>
<!--        <script>
            (function (i, s, o, g, r, a, m) {
                i['GoogleAnalyticsObject'] = r;
                i[r] = i[r] || function () {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * new Date();
                a = s.createElement(o),
                        m = s.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m)
            })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

            ga('create', 'UA-23433997-1', 'https://www.mousephenotype.org/embryo');
            ga('send', 'pageview');
        </script>  -->
        <!-- This is where the download dialog goes -->
        <div id="download_dialog"><div>
    </body>
    
    
    <script id="main_controls_template" type="text/x-handlebars-template">
        
        <div class='ievControlsWrap' class="noselect">
        
            <div class='top_bar' id="simple_controls">
                <fieldset id="orthogonal_views_buttons_fieldset">
                    <legend>Views</legend>
                    <div id="orthogonal_views_buttons">
                        <input type="checkbox" id="X_check" class='toggle_slice' title="Sagittal" checked>
                        <label for="X_check" id='X_check_label'>S</label>
                        <input type="checkbox" id="Y_check" class='toggle_slice' title="Coronal" checked>
                        <label for="Y_check" id='Y_check_label'>C</label>
                        <input type="checkbox" id="Z_check" class='toggle_slice' title="Axial" checked>
                        <label for="Z_check" id='Z_check_label'>A</label>

                        <div id='orientation_buttons'>
                        <div id="orientation_button" class="orientation horizontal hoverable" title="Switch orientation">
                    </div>
                </fieldset>

                <fieldset id="zoom_fieldset">
                    <legend>Zoom</legend>
                    <span class="button" id="zoomIn">+</span>
                    <span class="button" id ="zoomOut">-</span>   
                    <!--<span class="button" id ="screenShot">c</span>--> 
                </fieldset>

                <fieldset id="reset_fieldset" class="centered">
                    <legend>Reset</legend>
                    <div id="reset">
                          <img src="images/reload.png" height="25" class="hoverable" title="Restore default view">
                    </div>
                </fieldset>
        
                <fieldset id="download_fieldset" class="centered">
                    <legend>Download</legend>
                    <div id="download">
                        <img src="images/download.png" height="25" id="download_img" class="hoverable" title="Download embryo data">
                    </div>
                </fieldset>       

                <fieldset id="bookmark_fieldset" class="centered">
                    <legend>Share</legend>
                    <div id="createBookmark">
                        <img src="images/bookmark.png" height="25" id="bookmark_img" title="Generate URL for current view" class="hoverable">
                    </div>
                </fieldset>
        
                <fieldset id="toggle_fieldset" class="centered">
                    <legend>Advanced</legend>
                    <img src="images/advanced.png" height="25" id="toggle_img" title="Toggle advanced controls" class="hoverable">
                </fieldset>
                
            </div>
            
            <div class='top_bar' id="advanced_controls">
            
                <fieldset id="scale_fieldset" title="Configure scale bar">
                    <legend>Scale bar
                    <input type="checkbox" id="scale_visible" name="radio" checked="checked">
                    </legend>
                    <select name="scale_select" id="scale_select">
                    </select>  
                </fieldset>
        
                <fieldset id="heightslider_fieldset">
                    <legend>View height</legend>
                    <div id="viewHeightSlider"></div>
                </fieldset>
        
                <fieldset id="color_fieldset">
                    <legend>Invert</legend>
                    <div id="invertColours" class="ievgrey hoverable" title="Invert colours"></div>
                </fieldset>
        
                <fieldset id="analysis_fieldset">
                    <legend>Analysis</legend>  
                    <div id="analysis_button" class="hoverable disabled"  title="No analysis data available">
                    </div>
                </fieldset>
        
                <fieldset id="centres_fieldset">
                    <legend>Centres</legend>
                    <select name="centre_select" id="centre_select">
                    </select>                
                </fieldset>
            </div>
    
            <div class='top_bar' id="modality_controls">
                <fieldset id="modality_stage_fieldset">
                    <legend>Modality/stage selection</legend>
                    <div id="modality_stage" title="Change modality">
                        <input type="radio" id="202" class=low"modality_button" name="project">
                        <label for="202" class="button_label">OPT E9.5</label>
                        
                        <input type="radio" id="203" name="project" class="modality_button">
                        <label for="203" class="button_label">&#956;CT E14/E15.5</label>

                        <input type="radio" id="204" name="project" class="modality_button">
                        <label for="204" class="button_label">&#956;CT E18.5</label>
                    </div>
                </fieldset>
            </div>
        </div>
    </script>

    <!--Slice controls template-->
    <script id="slice_controls_template" type="text/x-handlebars-template">      
        <div id="controls_{{id}}"class="controls clear">
            <div class="selectorWrap" id="{{selectorWrapId}}" title="Select an embryo">
                <select id="{{vselectorId}}" class ="selectmenu" style='position:relative;z-index:1100'></select>
            </div>
            <div class="wlwrap">
                <div id="{{windowLevelId}}" class="windowLevel" title="Change brightness/contrast"></div>
            </div>
    
            <div class="overlayWrap">

                <div class="overlayToggle" id="{{overlayId}}" style="display: none;">
                    <input type="radio" id="none_{{overlayId}}" name="{{overlayId}}" value="none">
                    <label for="none_{{overlayId}}" class="button_label">None</label>

                    <input type="radio" id="jacobian_{{overlayId}}" name="{{overlayId}}" value="jacobian">
                    <label for="jacobian_{{overlayId}}" class="button_label">Volume</label>

                    <input type="radio" id="intensity_{{overlayId}}" name="{{overlayId}}" value="intensity">
                    <label for="intensity_{{overlayId}}" class="button_label">Intensity</label>
                </div>
        
            </div>
    
            <div class="metadata" id="metadata_{{id}}">
            
            <div>
        </div>
    </script>

    <!--Specimen view template-->
    <script id="specimen_view_template" type="text/x-handlebars-template">  
        
        <div id="{{id}}" class='specimen_view noselect'></div>

    </script>


    <!--Slice view template-->
    <script id="slice_view_template" type="text/x-handlebars-template">
        <div class="sliceWrap noselect" id="{{sliceWrapId}}">
            <div id="scale_outer{{id}}{{orientation}}"  class='scale_outer scale_outer_{{id}}' >
                <div class="scale" id="{{scaleId}}">
                </div>
                <div class='scale_text' id="{{scaleTextId}}"></div>
            </div>
           
        <div id="{{sliceContainerID}}" class ="sliceView"></div>
        <div class="sliceControls">
            <div id="{{sliderId}}" class ="{{sliderClass}}"></div>
                <input type='checkbox' class="linkCheck {{orientation}}" id="{{id}}{{orientation}}" name="{{id}}{{orientation}}" checked/>
                <label for="{{id}}{{orientation}}" class="linkCheckLabel"></label>

        </div>
        </div>
    </script>
    
    <script id="volume_view_template" type="text/x-handlebars-template">
        <div class="volWrap noselect" id="vol_{{id}}">
        </div>
    </script>
    
    <script id="progress_template" type="text/x-handlebars-template">
        <div class="ievLoading" id="ievLoading{{id}}">
            <div class="ievLoadingMsg" id="ievLoadingMsg{{id}}">
                {{msg}}
            </div>
        </div>
    </script>
    
    
    <script id="dataNotFoundTemplate" type="text/x-handlebars-template">
        <div class="ievLoading" id="noData{{id}}">
            <div class="ievLoadingMsg" id="noDataMsg{{id}}">
            Sorry. This data could not be loaded<br>
    Please contact us at sig@har.mrc.ac.uk <br>quoting {{colonyId}}:{{animalId}}. Thanks 
            </div>
        </div>
    </script>



    <!--No data template-->
    <script id="no_data_template" type="text/x-handlebars-template">
        <div class="nodata">
        <p>&nbsp;</p>
        <p>There are no data currently available for {{queryType}}: <strong>{{colonyId}}</strong></p>
        
        <p>Click <a target="none" href="https://www.mousephenotype.org/data/search/gene?kw=*&fq=(embryo_data_available:%22true%22)">here</a> to see all available data</p> 

        </div>
    </script>
    
   <!--IE template template-->
    <script id="ie_warning_template" type="text/x-handlebars-template">
        <div class="nodata">
        <p>We do not currently support Internet Explorer, but are looking at supporting it in the near future.</p>
        <p>For now, We recommend using Chrome of Firefox</p>
        <div id='browser_icons'>
            <a href='https://www.mozilla.org/en-GB/firefox/new/'><img src='images/firefox.png'></a>
            <a href='https://www.google.co.uk/chrome/browser/desktop/'><img src='images/chrome.png'></a>
        </div>
        </div>
    </script>
   
        <!--redirect from test template-->
    <script id="redirect_test_template" type="text/x-handlebars-template">
        <div class="nodata">
        <p>This test no longer works. Try this one:</p>
        <p><a href="https://www.mousephenotype.org/embryoviewer?gene_symbol=Klf7" target="_top">beta.mousephenotype.org/embryoviewer?gene_symbol=Klf7</a></p>
        </div>
    </script>
    
            <!--Download table row template-->
    <script id="downloadTableRowTemplate" type="text/x-handlebars-template">
     
       <tr>
       <td style="background-color: {{bg}}">{{volDisplayName}}</td>
       <td><input type='checkbox' name={{remotePath}}></td>
       </tr>

    </script>
    
    <script id="downloadTableRowTemplateHighRes" type="text/x-handlebars-template">
     
       <tr>
       <td style="background-color: {{bg}}">{{volDisplayName}}</td>
       <td><a href={{remotePath}}>Download</a></td>
       </tr>

    </script>
    
    
            <!--Specimen metadata template-->
    <script id="specimenMetdataTemplate" type="text/x-handlebars-template">
         <div class="centre_logo" id="centre_logo_{{id}}">
            <img class="logo_img" src="{{centreLogoPath}}"/>
         </div>
         <div class="metadata_c1" id="metadata_c1_{{id}}">
            <div>
                ID:{{animalId}}
            </div>
            <div>
                Date:{{date}}
            </div>
         </div>
         <div class="metadata_c2" id="metadata_c2_{{id}}">
            <div>
                <img class="sexIcon" src="{{sexIconPath}}"/>
            </div>
             <div>
                <img class="zygIcon" src="{{zygIconPath}}"/>
            </div>
         </div>
    </script>

<!--    <script type='text/javascript' src='/data/js/searchAndFacet/breadcrumbSearchBox.js'></script>-->
    <script type='text/javascript' src='/data/js/utils/tools.js'></script><!--
    <script type='text/javascript' src='/data/js/general/ui.dropdownchecklist_modif.js?v=20150807'></script>
    <script type='text/javascript' src='/data/js/documentationConfig.js?v=20150807'></script>-->
    
    <div id="attributions" style="text-align: center; font-size: 6pt">
        <a href="www.flaticon.com">Icons by Freepik</a>
    </div>
    
</html>