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
        <script type="text/javascript" src="js/embryo.js"></script>

        <script>
            window.addEventListener('load', function() {
                dcc.embryo("<%= request.getParameter("colony_id")%>");
//                var colonyId = "H-Cbx2-F12-TM1B";
////                var centreId = "4";
//                console.log('jsp: ' + colonyId);
//                dcc.embryo(colonyId);
//                  
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
