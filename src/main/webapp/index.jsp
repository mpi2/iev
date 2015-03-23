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
        <script type="text/javascript" src="X/lib/google-closure-library/closure/goog/base.js"></script>
        <script type="text/javascript" src="X/xtk-deps.js"></script>
        <!--<script type="text/javascript" src="js/xtk.js"></script>-->
        
        <script type="text/javascript" src="js/embryo.js"></script>
        <script type="text/javascript" src="js/main.js"></script>
        <script type="text/javascript" src="js/viewer.js"></script>
        <link rel="stylesheet" type="text/css" href="css/embryo.css">
        </head>
        <body>
        <div id='wrap'>
            <div id='top_bar'>
                <div id='topleft'>
                    <!--<a href="https://dev.mousephenotype.org/sites/dev.mousephenotype.org/files/mousephenotype_files/Internet%20Embryo%20Viewer.pdf" target="_blank"><span id="help_link" class="ui-icon  ui-icon-help"</span></a>-->
                      
                    <form action="https://dev.mousephenotype.org/sites/dev.mousephenotype.org/files/mousephenotype_files/Internet%20Embryo%20Viewer.pdf" target="_blank"  id="help_form">
                        <input type="submit" value="?" id="help_link" >
                    </form>
                    
                    <input type="checkbox" id="X_check" class='toggle_slice' checked>
                    <label for="X_check" id='X_check_label'>Sagittal</label>
                    <input type="checkbox" id="Y_check" class='toggle_slice' checked>
                    <label for="Y_check" id='Y_check_label'>Coronal</label>
                    <input type="checkbox" id="Z_check" class='toggle_slice' checked>
                    <label for="Z_check" id='Z_check_label'>Axial</label>
                </div>
                <div id='topright'>
                    <!--<button type="submit" id="fullscreen"><img src="fullscreen.png" height="20px"></button>-->
                    <span id="orientation_radio">
                    <input type="radio" id="vertical_check" name="radio" checked="checked">
                    <label for="vertical_check" id='vertical_check_label'>Vertical</label>
                    <input type="radio" id="horizontal_check" name="radio">
                    <label for="horizontal_check" id='horizontal_check_label'>Horizontal</label>
                    </span>
                </div>
                <div id="viewHeightSlider" title="test"></div>
            </div>
            </div>
            <div id="viewer"></div>
           <script>
   
    
    
    
    window.addEventListener('load', function() {
                dcc.embryo("<%= request.getParameter("colony_id")%>");                
            });
    </script>
    <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject'] = r;
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
    </script>  
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
            <a id="{{zoomInId}}" href="#" class="button">+</a>
            <a id="{{zoomOutId}}" href="#" class="button">-</a>
            <a id ="{{resetId}}" href="#" class="button">Reset</a>
        </span>
    </div>
    </script>
    
    
    <!--Specimen view template-->
    <script id="specimen_view_template" type="text/x-handlebars-template">  
    <div id="{{id}}" class='specimen_view'></div>"    
    </script>

    
    <!--Slice view template-->
    <script id="slice_view_template" type="text/x-handlebars-template">
    <div class="sliceWrap" id="{{sliceWrapId}}">
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