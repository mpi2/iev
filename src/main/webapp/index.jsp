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
        <title>Embryo Viewer Web Application</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta http-equiv="X-UA-Compatible" content="chrome=1" />
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
        <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/themes/smoothness/jquery-ui.css" />
        <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
        <script src="js/handlebars.min.js"></script>
       
<!--        <script type="text/javascript" src="X/lib/google-closure-library/closure/goog/base.js"></script>
        <script type="text/javascript" src="X/xtk-deps.js"></script>-->
        <script type="text/javascript" src="js/xtk.js"></script>

        <script type="text/javascript" src="js/embryo.js"></script>
        <script type="text/javascript" src="js/main.js"></script>
        <script type="text/javascript" src="js/specimenview.js"></script>
        <script type="text/javascript" src="js/sliceview.js"></script>
        <link rel="stylesheet" type="text/css" href="css/embryo.css">
    </head>
    <body>
        <div id='wrap'>
            <div id='top_bar'>
                <div id='topleft'>
                   
                    <div>
                    <form action="https://dev.mousephenotype.org/sites/dev.mousephenotype.org/files/mousephenotype_files/Internet%20Embryo%20Viewer.pdf" target="_blank"  id="help_form">
                        <input type="submit" value="?" id="help_link" >
                    </form>
                        <div id="download_button">
                       <img src="images/download.png" height="25" id="download">
                       </div>
                    </div>

                </div>
                <fieldset id="orthogonal_views_buttons_fieldset">
                    <legend>Views</legend>
                    <div id="orthogonal_views_buttons">
                        <input type="checkbox" id="X_check" class='toggle_slice' checked>
                        <label for="X_check" id='X_check_label'>S</label>
                        <input type="checkbox" id="Y_check" class='toggle_slice' checked>
                        <label for="Y_check" id='Y_check_label'>C</label>
                        <input type="checkbox" id="Z_check" class='toggle_slice' checked>
                        <label for="Z_check" id='Z_check_label'>A</label>
                   
                         <div id='orientation_buttons'>
                        <div id="orientation_button" class="orientation horizontal"></div>
                 
                </fieldset>
                
            <fieldset id="scale_fieldset">
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
            
                 <fieldset id="zoom_fieldset">
                    <legend>Zoom</legend>
                  
                    <span class="button" id="zoomIn">+</span>
                    <span class="button" id ="zoomOut">-</span>   
                </fieldset>
                
                <fieldset id="color_fieldset">
                    <legend>Other</legend>
                    <input type="checkbox" id="invertColours">
                    <label for="invertColours">Invert colours</label>
                    <button id="reset">Reset</button>
                    <input type="checkbox" id="low_power_check" class='toggle_slice'>
                    <label for="low_power_check" id='low_power_check_label'>cpu</label>
                   
                    
                </fieldset>



                <fieldset id="modality_stage_fieldset">
                    <legend>Modality/stage selection</legend>
                    <div id="modality_stage">
                        <input type="radio" id="203" name="project" class="modality_button">
                        <label for="203" class="button_label">&#956;CT E14/E15.5</label>

                        <input type="radio" id="204" name="project" class="modality_button">
                        <label for="204" class="button_label">&#956;CT E18.5</label>

                        <input type="radio" id="202" class="modality_button" name="project">
                        <label for="202" class="button_label">OPT E9.5</label>
                    </div>
                </fieldset>


            </div>
        </div>
        <div class="clear"></div>
        <div id="viewer"></div>
        <script>




            window.addEventListener('load', function () {
                var geneSymbol = "<%= request.getParameter("gene_symbol")%>";
                var colonyId = "<%= request.getParameter("colony_id")%>";
                
                if (colonyId !== 'null'){
                    dcc.getVolumesByColonyId(colonyId);
                }
                else if (geneSymbol !== 'null') {
                    dcc.getVolumesByGeneSymbol(geneSymbol);
                }
               
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


    <!--Slice controls template-->
    <script id="slice_controls_template" type="text/x-handlebars-template">      
        <div id="controls_{{id}}"class="controls clear">
            <div class="selectorWrap" id="{{selectorWrapId}}" title="test">
                <select id="{{vselectorId}}" class ="selectmenu"></select>
            </div>
            <div class="wlwrap">
                <div id="{{windowLevelId}}" class="windowLevel" title="test"></div>
            </div>
            <div class="metadata" id="metadata_{{id}}">
                <div class="centre_logo" id="centre_logo_{{id}}"></div>
                <div class="metadata_c1" id="metadata_c1_{{id}}"></div>
                <div class="metadata_c2" id="metadata_c2_{{id}}"></div>
            <div>
        </div>
    </script>

    <!--Specimen view template-->
    <script id="specimen_view_template" type="text/x-handlebars-template">  
        <div id="{{id}}" class='specimen_view'></div>"  
    </script>


    <!--Slice view template-->
    <script id="slice_view_template" type="text/x-handlebars-template">
        <div class="sliceWrap" id="{{sliceWrapId}}">
            <div class='scale_outer scale_outer_{{id}}' >
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


    <!--No data template-->
    <script id="no_data_template" type="text/x-handlebars-template">
        <div class="nodata">
        <p>There are no data currently available for {{queryType}}: {{colonyId}}</p>
        </div>
    </script>
</html>