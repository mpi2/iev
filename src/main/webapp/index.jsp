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
        <script type="text/javascript" src="http://www.mousephenotype.org/data/js/head.min.js?v=2.0.2"></script>
        <script type="text/javascript" src="lib/jquery.qtip.min.js"></script>
        <script type="text/javascript" src="lib/jquery.dataTables.min.js"></script>
        <script type="text/javascript" src="lib/dataTables.tableTools.min.js"></script>


        

        
        <link rel="stylesheet" type="text/css" href="css/embryo.css">
        
        <link type="text/css" rel="stylesheet" href="css/css_FOZ_d3UAptpDgO0Bi3g0O_i_hnW9qo3cnnlJ7zHLIpU.css" media="all" /> <!--needed?-->
        <link type="text/css" rel="stylesheet" href="//fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600" media="all" />
        <link type="text/css" rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" media="all" />
        <link type="text/css" rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/qtip2/2.1.1/jquery.qtip.min.css" media="all" />
        <!--<link type="text/css" rel="stylesheet" href="css/css_JbqXNeGT2vW5-6KTgm-ypazaAqvl8n-0h3My8pH_69Q.css" media="all" />-->
        <link rel="stylesheet" href="css/css_yAAr2_tYpxdN25Mw1UPtSGqKc-8KVSUlCeFXve-A6OI.css">
        <link rel="stylesheet" href="css/searchPage.css">
        <!--<link rel="stylesheet" href="css/font-awesome.min.css">-->
     
        
        <script>
            
            try {
                console.log(" ");
            } catch (err) {
                var console = {};
                console.log = console.error = console.info = console.debug = console.warn = console.trace = console.dir = console.dirxml = console.group = console.groupEnd = console.time = console.timeEnd = console.assert = console.profile = function () {
                };
            }

            var baseUrl = "/data";
            var solrUrl = '//www.ebi.ac.uk/mi/impc/beta/solr';
            var drupalBaseUrl = "//beta.mousephenotype.org";
            var mediaBaseUrl = "//www.ebi.ac.uk/mi/impc/beta/phenotype-archive/media";
            console.log("mediaBaseUrl set="+mediaBaseUrl);
            var pdfThumbnailUrl = "//wwwdev.ebi.ac.uk/mi/media/omero/webgateway/render_thumbnail/119501";
            console.log("pdfThumbnailUrl set="+pdfThumbnailUrl);

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



            <DIV id="DIV_19"><DIV id="DIV_20"><div class="breadcrumb" id="DIV_1">
                        <a href="https://mousephenotype.org">Home</a> &raquo;&nbsp;<a href="/data/search">Search</a>&raquo;&nbsp;<a id='ievBreadCrumbGene' href=""></a>&raquo;&nbsp;IEV

                        <div class="searchcontent" id="DIV_5">
                            <div id="DIV_6" class="block">
                                <div class="content" id="DIV_7">
                                    <p id="P_8"><i id="I_9" class="fa fa-search"></i></p>
                                    <div class="ui-widget" id="DIV_10">
                                        <span role="status" aria-live="polite" class="ui-helper-hidden-accessible" id="SPAN_11"></span><input id="s" class="ui-autocomplete-input" autocomplete="off">
                                        <a id="A_13"><i class="fa fa-info searchExample" data-hasqtip="1881" id="I_14"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="DIV_15">
                            <a id="A_16" href="/data/batchQuery"><i class="fa fa-th-list batchQuery" id="I_17"></i><span id="SPAN_18">Batch query</span></a>
                        </div>

                    </div></DIV></DIV>

<!--<div class="breadcrumb"><a href="/">Home</a> » EmbryoViewer</div><div class="searchcontent"><div id="bigsearchbox" class="block"><div class="content"><p><i id="sicon" class="fa fa-search"></i></p><div class="ui-widget"><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input id="s" class="ui-autocomplete-input" autocomplete="off"><a><i class="fa fa-info searchExample" data-hasqtip="289"></i></a></div><p></p></div></div>
</div>-->

        </div>
           <div id="help">
                            <form action="https://www.mousephenotype.org/sites/beta.mousephenotype.org/files/mousephenotype_files/IEV_help.pdf" target="_blank"  id="help_form">
                                <input type="submit" value="?" id="help_link" >
                            </form>
                        </div>

<!--                <div id='batchQryLink'>
                    <a id='batchquery' href='/data/batchQuery'><i class='fa fa-th-list batchQuery'></i><span id='bqry'>Batch query</span></a>
                </div>-->
        
        
        

<!-- -->
        
        
      
        <div id='ievControlsWrap' class="noselect">
            <div id='top_bar'>
                <div id='topleft'>
                   
             
                    
                </div>
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
                        <div id="orientation_button" class="orientation horizontal hoverable" title="Switch orientation"></div>
                 
                </fieldset>
                
            <fieldset id="scale_fieldset" title="Configure scale bar">
                <legend>Scale bar
                <input type="checkbox" id="scale_visible" name="radio" checked="checked">
                </legend>
                <select name="scale_select" id="scale_select"></select>  
            </fieldset>
                
            
            <fieldset id="centres_fieldset" title="Switch center">
                <legend>Centres</legend>
                    <select name="centre_select" id="centre_select">
                    </select>                
            </fieldset>
               
            
            <fieldset id="heightslider_fieldset" title="Increase/decrease height">
                <legend>View height</legend>
                <div id="viewHeightSlider"></div>
            </fieldset>

             <fieldset id="zoom_fieldset" title="Zoom views in/out">
                <legend>Zoom</legend>
                <span class="button" id="zoomIn">+</span>
                <span class="button" id ="zoomOut">-</span>   
                <!--<span class="button" id ="screenShot">c</span>--> 
            </fieldset>

            <fieldset id="analysis_fieldset">
                <legend>Analysis</legend>  
                <div id="analysis_button" class="hoverable disabled"  title="No analysis data available">
                </div>
            </fieldset>

            <fieldset id="bookmark_fieldset">
                <legend>Share</legend>
                <div id="createBookmark" class="hoverable" title="Generate URL for current view" >
                    <img src="images/bookmark.png" id="bookmark_img">
                </div>
            </fieldset>
                
            <fieldset id="color_fieldset">
                <legend>Other</legend>

                <div id="invertColours" class="ievgrey hoverable" title="Invert colours"></div>   
                <div id="reset" class="hoverable">
                      <img src="images/reload.png" title="Restore default view">
                </div>
                <div id="download" class="hoverable"  title="Download embryo data">
                    <img src="images/download.png" id="download_img">
                </div>

                <div id='lowcpu' title="Toggle dynamic/static slicing">
                    <input type="checkbox" id="low_power_check" class='toggle_slice' title="Toggle static/dynamic rendering">
                    <label for="low_power_check" id='low_power_check_label'>Low CPU</label> 
                </div>

            </fieldset>
                
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
        <div class="clear"></div>
        <div id="viewer" class="noselect">
            
            <div id="progress">
                <div id="progressSpin"></div>
                <div id="progressMsg"></div>
            </div>
        </div>
            </div> <!-- iev -->
        
            <script>
                 goog.require('iev.embryo');
            </script>
        <script>
            window.addEventListener('load', function () {
                
                var geneSymbol = "<%= request.getParameter("gene_symbol")%>";
                var colonyId = "<%= request.getParameter("colony_id")%>";
                var mgi = "<%= request.getParameter("mgi")%>";
                

                var modalityData = {
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
                
                jQuery.extend({
                    getQueryParameters : function(str) {
                        return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
                    }
                });
                
                var queryParams = $.getQueryParameters();
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
                var dccGetter = new iev.embryo();
                
                if (colonyId !== 'null'){
                    bookmarkData['mode'] = "colony_id";
                    bookmarkData['gene'] = colonyId;
                    dccGetter.getVolumesByColonyId(colonyId, bookmarkData);
                }
                else if (geneSymbol !== 'null') {
                    bookmarkData['mode'] = "gene_symbol";
                    bookmarkData['gene'] = geneSymbol;
                    dccGetter.getVolumesByGeneSymbol(geneSymbol, bookmarkData);
                }
                else if (mgi !== 'null') {
                    bookmarkData['mode'] = "mgi";
                    bookmarkData['gene'] = mgi;
                    dccGetter.getVolumesByMgi(mgi, bookmarkData);
                }
               
            });
            
            (function setupImpcMenus() {
            /*
             * Get the dynamically generated menu code. Split into main menu and the login section
             */
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
              })()
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
    
    
    
    <script id="progress_template" type="text/x-handlebars-template">
        <div class="ievLoading" id="ievLoading{{id}}">
            <div class="ievLoadingMsg" id="ievLoadingMsg{{id}}">
            Images loading
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
        <p>There are no data currently available for {{queryType}}: {{colonyId}}</p>
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
        <p>This test no longer works. Try this one:<br> <a href="https://beta.mousephenotype.org/embryoviewer?gene_symbol=Klf7" target="_top">beta.mousephenotype.org/embryoviewer?gene_symbol=Klf7</a></p>
        </div>
    </script>
    
            <!--Download table row template-->
    <script id="downloadTableRowTemplate" type="text/x-handlebars-template">
     
       <tr>
       <td style="background-color: {{bg}}">{{volDisplayName}}</td>
       <td><input type='checkbox' name={{remotePath}}></td>
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

    <script type='text/javascript' src='/data/js/searchAndFacet/searchAndFacetConfig.js?v=20150807'></script>
    <script type='text/javascript' src='/data/js/utils/tools.js?v=20150807'></script>
    <script type='text/javascript' src='/data/js/general/ui.dropdownchecklist_modif.js?v=20150807'></script>
    <script type='text/javascript' src='/data/js/documentationConfig.js?v=20150807'></script>


    <script type='text/javascript' src="/data/js/searchAndFacet/breadcrumbSearchBox.js?v=20150807"></script>

    
</html>