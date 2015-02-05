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

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <title>Embryo Viewer Web Application</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta http-equiv="X-UA-Compatible" content="chrome=1" />
        <link rel="stylesheet" type="text/css" href="css/embryo.css">
    </head>
    <body>
        <div id="embryo-container"></div>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
        <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/themes/smoothness/jquery-ui.css" />
        <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
        <script type="text/javascript" src="X/lib/google-closure-library/closure/goog/base.js"></script>
        <script type="text/javascript" src="X/xtk-deps.js"></script>
        <script type="text/javascript" src="js/embryo.js"></script>
        <script type="text/javascript" src="js/main.js"></script>
        <script type="text/javascript" src="js/viewer.js"></script>

        <div id='wrap'>
            <div id='top_bar'>
                <div id='bottom_row'>
                    <input type="checkbox" id="X_check" class='toggle_slice' checked>
                    <label for="check">Sagittal</label>
                    <input type="checkbox" id="Y_check" class='toggle_slice' checked>
                    <label for="check">Coronal</label>
                    <input type="checkbox" id="Z_check" class='toggle_slice' checked>
                    <label for="check">Axial</label>
                </div>
            </div>
               <div id='pane'>

                    <div id='controls'>
                        <input type="checkbox" id="invert_colours"><label id="invert_text" for="invert_colours">Invert colours</label>
                        <input type="checkbox" id="link_views"><label id="link" for="link_views">Link views</label>
                        <div id="zooming">
                            <a id ="zoomIn" href="#">+</a>
                            <a id ="zoomOut" href="#">-</a>
                        </div>
                        <a id ="reset" href="#">Reset</a>
                        <div id="windowLevel"></div>
                    </div>

                </div>
            <div id="viewer">
                
            </div>

        </div>
  
        <script>
            window.addEventListener('load', function() {
                //dcc.embryo("<%= request.getParameter("vol")%>");
                dcc.embryo('260814');
            });
        </script>
        
        <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-23433997-1', 'https://www.mousephenotype.org/embryo');
        ga('send', 'pageview');
        </script>

    </body>
</html>