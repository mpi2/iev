me<!--
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
        <script src="iev/templates.js"></script>
        <script type="text/javascript" src="X/lib/google-closure-library/closure/goog/base.js"></script>
        <!--<script type="text/javascript" src="X/xtk-deps.js"></script>-->
        <script type="text/javascript" src="lib/xtk.js"></script>
        <script type="text/javascript" src="iev/iev_deps.js"></script>
        <!--<script type="text/javascript" src="iev/iev_compiled.js"></script>-->
        <script type="text/javascript" src="lib/spin.min.js"></script>
        <script type="text/javascript" src="lib/fileDownload.js"></script>

        <!--uncommentfor deployment-->
<!--        <script type="text/javascript" src="/data/js/vendor/DataTables-1.10.4/media/js/jquery.dataTables.min.js?v=20150707"></script>
        <script type="text/javascript" src="/data/js/vendor/DataTables-1.10.4/extensions/TableTools/js/dataTables.tableTools.min.js?v=20150707"></script>
        <script type="text/javascript" src="/data/js/vendor/jquery.jeditable.js?v=20150707"></script>
        [if lt IE 9 ]><script type="text/javascript" src="js/selectivizr-min.js"></script><![endif]
        <script type="text/javascript" src="/data/js/vendor/jquery/jquery.qtip-2.2/jquery.qtip.min.js?v=20150707"></script>
        <script type="text/javascript" src="/data/js/vendor/jquery/jquery.fancybox-2.1.5/jquery.fancybox.pack.js?v=20150707"></script>
        <script type="text/javascript" src="/data/js/vendor/jquery/jquery.tablesorter.min.js?v=20150707"></script>
        <script type='text/javascript' src='/data/js/charts/highcharts.js?v=20150707'></script>
        <script type='text/javascript' src='/data/js/charts/highcharts-more.js?v=20150707'></script>
        <script type='text/javascript' src='/data/js/charts/exporting.js?v=20150707'></script>
        <script type='text/javascript' src="/data/js/general/toggle.js?v=20150707"></script>
        <script type='text/javascript' src="/data/js/searchAndFacet/breadcrumbSearchBox.js"></script>
        <link rel="stylesheet" type="text/css" href="css/embryo.css">
        <link rel="stylesheet" href="/data/css/searchPage.css">
        <link rel="stylesheet" href="/data/css/default.css">
        <link rel="stylesheet" href="/data/css/vendor/font-awesome/font-awesome.min.css">-->


        <!--for local testing-->

        <script type="text/javascript" src="http://www.mousephenotype.org/data/js/vendor/DataTables-1.10.4/media/js/jquery.dataTables.min.js?v=20150707"></script>
        <script type="text/javascript" src="http://www.mousephenotype.org/data/js/vendor/DataTables-1.10.4/extensions/TableTools/js/dataTables.tableTools.min.js?v=20150707"></script>
        <script type="text/javascript" src="http://www.mousephenotype.org/data/js/vendor/jquery.jeditable.js?v=20150707"></script>
        <script type="text/javascript" src="http://www.mousephenotype.org/data/js/vendor/jquery/jquery.qtip-2.2/jquery.qtip.min.js?v=20150707"></script>
        <script type="text/javascript" src="http://www.mousephenotype.org/data/js/vendor/jquery/jquery.fancybox-2.1.5/jquery.fancybox.pack.js?v=20150707"></script>
        <script type="text/javascript" src="http://www.mousephenotype.org/data/js/vendor/jquery/jquery.tablesorter.min.js?v=20150707"></script>
        <script type='text/javascript' src='http://www.mousephenotype.org/data/js/charts/highcharts.js?v=20150707'></script>
        <script type='text/javascript' src='http://www.mousephenotype.org/data/js/charts/highcharts-more.js?v=20150707'></script>
        <script type='text/javascript' src='http://www.mousephenotype.org/data/js/charts/exporting.js?v=20150707'></script>
        <script type='text/javascript' src="http://www.mousephenotype.org/data/js/general/toggle.js?v=20150707"></script>
        <script type='text/javascript' src="http://www.mousephenotype.org/data/js/searchAndFacet/breadcrumbSearchBox.js"></script>
        <link rel="stylesheet" type="text/css" href="css/embryo.css">
        <link rel="stylesheet" href="http://www.mousephenotype.org/data/css/searchPage.css">
        <link rel="stylesheet" href="http://www.mousephenotype.org/data/css/default.css">
        <link rel="stylesheet" href="http://www.mousephenotype.org/data/css/vendor/font-awesome/font-awesome.min.css">


     
        
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

        <div id="iev_subHeader">


        <div class="breadcrumb">

            <a href="//dev.mousephenotype.org">Home</a> » <a href="/data/search">Search</a>&nbsp;» <a id='ievBreadCrumbGene' href=""></a>&raquo;&nbsp;IEV

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
           <div id="help">
                            <form action="https://www.mousephenotype.org/sites/beta.mousephenotype.org/files/mousephenotype_files/IEV_help.pdf" target="_blank"  id="help_form">
                                <input type="submit" value="?" id="help_link" >
                            </form>
                        </div>

<!--                <div id='batchQryLink'>
                    <a id='batchquery' href='/data/batchQuery'><i class='fa fa-th-list batchQuery'></i><span id='bqry'>Batch query</span></a>
                </div>-->
        
        
        

<!-- -->
        
        
            <div id="iev">
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
//            
//            (function setupImpcMenus() {
//            /*
//             * Get the dynamically generated menu code. Split into main menu and the login section
//             */
//                var protocol = window.location.protocol === "https:"? 'https' : 'http';
//                
//                var header_menu_source;
//                //Set the correct menu depending on which sub-domain we're on
//                switch (location.hostname) {
//                    
//                    case 'localhost':
//                        header_menu_source = 'menudisplaycombinedrendered.html';
//                        break;
//                    case 'www.mousephenotype.org':
//                        header_menu_source = protocol + '://www.mousephenotype.org/menudisplaycombinedrendered';
//                        break;
//                    case 'beta.mousephenotype.org':
//                        header_menu_source = protocol + '://beta.mousephenotype.org/menudisplaycombinedrendered';
//                        break;
//                    case 'dev.mousephenotype.org':
//                        header_menu_source = protocol + '://dev.mousephenotype.org/menudisplaycombinedrendered';
//                        break;
//                }
//                $.get(header_menu_source, function (data) {
//                    var menuItems = data.split("MAIN*MENU*BELOW");
//                    $('#block-menu-block-1').append(menuItems[1]);
//                    $('#tn').append(menuItems[0]);
//                });
//              })()
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
   

<!--    <script type='text/javascript' src='/data/js/searchAndFacet/breadcrumbSearchBox.js'></script>-->
<!--    <script type='text/javascript' src='http://www.mousephenotype.org/data/js/utils/tools.js'></script>
    <script type='text/javascript' src='/data/js/general/ui.dropdownchecklist_modif.js?v=20150807'></script>
    <script type='text/javascript' src='/data/js/documentationConfig.js?v=20150807'></script>-->

    
</html>