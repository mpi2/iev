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
        <script type="text/javascript" src="js/viewer.js"></script>
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
                        <div>
                       <img src="images/download.png" height="25" id="download">
                       </div>
                    </div>

                </div>
                <fieldset id="orthogonal_views_buttons_fieldset">
                    <legend>Orthogonal views</legend>
                    <div id="orthogonal_views_buttons">
                        <input type="checkbox" id="X_check" class='toggle_slice' checked>
                        <label for="X_check" id='X_check_label'>Sagittal</label>
                        <input type="checkbox" id="Y_check" class='toggle_slice' checked>
                        <label for="Y_check" id='Y_check_label'>Coronal</label>
                        <input type="checkbox" id="Z_check" class='toggle_slice' checked>
                        <label for="Z_check" id='Z_check_label'>Axial</label>
                    </div>
                </fieldset>



                <fieldset id="orientation_fieldset">
                    <legend>Orientation</legend>
                    <div id='orientation_buttons'>
                        <input type="radio" id="vertical" name="radio" class="orientation_button">
                        <label for="vertical" id='vertical_label' class="button_label">Vertical</label>
                        <input type="radio" id="horizontal" name="radio" class="orientation_button" checked="checked">
                        <label for="horizontal" id='horizontal_label' class="button_label">Horizontal</label>
                    </div>
                </fieldset>
                
                <fieldset id="zoom_fieldset">
                    <legend>Zoom</legend>
                  
                    <span class="button" id="zoomIn">+</span>
                    <span class="button" id ="zoomOut">-</span>   
                </fieldset>
                
            <fieldset>
                <legend>Scale bar
                <input type="checkbox" id="scale_visible" name="radio" checked="checked">
<!--                <label for="scale_visible" id='scale_visible_label' class="button_label">Visible</label>-->
                </legend>
                    <select name="scale_select" id="scale_select">
                    </select>
                
            </fieldset>
            


                <fieldset id="heightslider_fieldset">
                    <legend>View height</legend>
                    <div id="viewHeightSlider" title="test"></div>
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
                dcc.embryo("<%= request.getParameter("colony_id")%>");
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
        <span id="{{controlsButtonsId}}" class="controlsButtons">
        <input type="checkbox" id="{{invertColoursId}}" class="button">
        <label for="{{invertColoursId}}">Invert colours</label>
        
        <a id ="{{resetId}}" href="#" class="button">Reset</a>
        </span>
        </div>
    </script>
<!--<a id="{{zoomInId}}" href="#" class="button">+</a>
        <a id="{{zoomOutId}}" href="#" class="button">-</a>-->

    <!--Specimen view template-->
    <script id="specimen_view_template" type="text/x-handlebars-template">  
        <div id="{{id}}" class='specimen_view'></div>"  
    </script>


    <!--Slice view template-->
    <script id="slice_view_template" type="text/x-handlebars-template">
        <div class="sliceWrap" id="{{sliceWrapId}}">
            <div class='scale_outer'>
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
        <p>There are no data currently available for colony ID "{{colonyId}}".</p>
        </div>
    </script>
</html>