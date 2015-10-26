var h=!0,j=null,k=!1,m;function q(){}function r(a,b){var c=new XMLHttpRequest;c.open("GET",a,h);c.onreadystatechange=function(){4===c.readyState&&(200===c.status?b(JSON.parse(c.responseText)):console.error("Unable to retrieve data from "+a))};c.send(j)}q.prototype.Mb=function(a,b){r("rest/volumes"+(void 0===a?"":"?colony_id="+a),function(c){new s(c,"viewer","colony ID",a,b)})};q.prototype.Nb=function(a,b){r("rest/volumes"+(void 0===a?"":"?gene_symbol="+a),function(c){new s(c,"viewer","gene symbol",a,b)})};
q.prototype.Ob=function(a,b){console.log("gettigng by mgi");console.log(a);r("rest/volumes"+(void 0===a?"":"?mgi="+a),function(c){new s(c,"viewer","mgi",a,b)})};goog.n("iev.embryo.prototype.getVolumesByMgi",q.prototype.Ob);goog.n("iev.embryo.prototype.getVolumesByGeneSymbol",q.prototype.Nb);goog.n("iev.embryo.prototype.getVolumesByColonyId",q.prototype.Mb);function u(a){this.V=h;this.db=j;this.id=Math.random();if(k in window)this.V=k,console.log("indexedDB not supported. Loading volumes from server");else{var b=indexedDB.open("ievTest",2);b.onupgradeneeded=function(a){console.log("Upgrading iev indexedDB");a=a.target.result;a.objectStoreNames.contains("volumes")&&a.deleteObjectStore("volumes");a.createObjectStore("volumes")};b.onsuccess=function(b){console.log("idxdb Success!");this.db=b.target.result;this.db.transaction(["volumes"],"readwrite").objectStore("volumes");
console.log("1st id:",this.id);a()}.bind(this);b.onerror=function(b){console.log("Error initialising IndexedDB");console.dir(b);this.V=k;a()}.bind(this)}}
u.prototype.bb=function(a,b,c){if(this.V){var e=function(d){if(d.target.result){var e=function(g){new Date(g.Bc)<b?(console.log("newer data available on the server"),v(a,function(g){w(this,a,b,g);c(g)}.bind(this))):c(g.$a)};this.V||e(this.Cb(a));d=this.db.transaction(["volumes"],"readwrite").objectStore("volumes").get(a);d.onsuccess=function(a){if(a=a.target.result)console.log("retrieving volume from indexedDB"),e(a)};d.onerror=function(){console.log("failed to get from idxdb even though key exists");
this.Cb(a,function(a){e(a)})}}else v(a,function(g){w(this,a,b,g);c(g)}.bind(this))}.bind(this);this.db.transaction(["volumes"],"readonly").objectStore("volumes").get(a).onsuccess=e}else v(a,function(d){w(this,a,b,d);c(d)}.bind(this))};function w(a,b,c,e){a.V&&(c={name:b,$a:e,qc:c},a=a.db.transaction(["volumes"],"readwrite").objectStore("volumes").add(c,b),a.onerror=function(a){console.log("Error",a.target.error.message)},a.onsuccess=function(){console.log("Woot! Did it")})}
function v(a,b){var c=new XMLHttpRequest;c.open("GET",a,h);c.responseType="arraybuffer";c.send();console.log("getting data from server");c.onreadystatechange=function(){4===this.readyState&&b(this.response)}};function s(a,b,c,e,d){this.data=a;this.yb="https://www.mousephenotype.org/images/emb/";this.P="baseline";this.Ca=e;this.za;this.ca;this.$;this.la;this.m;this.Za;this.A;this.ma=0;this.Xa="horizontal";this.Fb;this.va=k;this.W;this.na;this.ta;this.k=d;if("colony ID"===c&&"test"===this.Ca){var f=$("#redirect_test_template").o(),f=Handlebars.compile(f);$("#"+b).append(f())}else{this.localStorage;this.u={};this.w={X:{visible:h,N:h},Y:{visible:h,N:h},Z:{visible:h,N:h}};this.Ia=["203","204","202"];"null"!==
this.k.modality&&this.Ia.unshift(this.k.modality);this.aa={xa:600,options:{"200&#956;m":200,"400&#956;m":400,"600&#956;m":600,"1mm":1E3,"2mm":2E3,"4mm":4E3,"6mm":6E3}};this.Va={1:"BCM",3:"GMC",4:"HAR",6:"ICS",7:"J",8:"TCP",9:"Ning",10:"RBRC",11:"UCD",12:"Wtsi"};this.ra={Sb:8,length:6,width:6,Zb:8,scale:1,Eb:1,color:"#ef7b0b",opacity:0.2,rotate:0,direction:1,speed:1,ec:50,Ib:20,zIndex:2E9,className:"spinner",top:"50%",left:"70%",cc:k,Pb:h,position:"absolute"};this.Qa="images/centre_icons/";if(a.success){this.na=
this.W="undefined";for(f in a.centre_data){c={203:{id:"CT E14.5/15.5",vols:{mutant:{},wildtype:{}}},204:{id:"CT E18.5",vols:{mutant:{},wildtype:{}}},202:{id:"OPT 9.5",vols:{mutant:{},wildtype:{}}}};$("#top_bar").show();for(e=0;e<this.F(a.centre_data[f]);e++)d=a.centre_data[f][e],d.volume_url=this.yb+d.Wa+"/"+d.Dc+"/"+d.yc+"/"+d.Vc+"/"+d.jb+"/"+d.Nc+"/"+d.Ac,d.S===this.P?c[d.jb].vols.wildtype[d.Ja]=d:(c[d.jb].vols.mutant[d.Ja]=d,"undefined"===this.W&&(this.W=d.W),"undefined"===this.na&&(this.na=d.xc));
this.u[f]=c}this.m=f}else a={S:this.Ca,Oc:c},f=$("#no_data_template").o(),f=Handlebars.compile(f),$("#"+b).append(f(a));this.T=b;this.b=[];window.onerror=function(a,b,c){console.log(a,b,c);if("Uncaught Error: input buffer is broken"===a||"Uncaught Error: Loading failed"===a||"Uncaught Error: invalid file signature"===a)for(a=0;a<this.b.length;++a)this.b[a].La=h};a="/data/genes/"+this.W;$("#ievBreadCrumbGene").o(this.na).Q("href",a);a=$(window.top).innerHeight();b=$("#help").outerHeight();f=$("#header").outerHeight();
c=$("#iev_subHeader").outerHeight();e=$("#ievControlsWrap").outerHeight();this.ta=Math.round((a-f-c-e-b-76)/2);console.log(a,f,c,e);$("<style type='text/css'> .sliceWrap{height:"+(200>this.ta?200:this.ta)+"px;}</style>").Ta("head");x(this);this.localStorage=new u(function(){var a,b;for(b in this.Ia)if(a=this.Ia[b],0<this.F(this.u[this.m][a].vols.mutant)){var c=this.u[this.m][a].vols.wildtype,d=this.u[this.m][a].vols.mutant;break}this.la=a;$("#modality_stage input[id^="+a+"]:radio").Q("checked",h);
0<this.F(c)&&(this.ca=new y(c,"wt",this.T,this.P,this.t.bind(this),{specimen:this.k.wt},this.fb.bind(this),this.localStorage),this.b.push(this.ca));this.$=new y(d,"mut",this.T,this.Ca,this.t.bind(this),{specimen:this.k.mut},this.fb.bind(this),this.localStorage);this.b.push(this.$);a=[];for(var e in this.Va)e in this.data.centre_data&&a.push("<option  value='"+e+"'' data-class='"+("centreSelectIcon cen_"+e)+"'>"+this.Va[e]+"</option>");e=$("#centre_select");e.append(a.join(""));e.D().D("menuWidget").K("ui-menu-icons customicons");
e.D({width:"60px",L:$.G(function(a,b){setCentre(b.item.value)},this)});e.fc(this.m).D("refresh",h)}.bind(this));$("#low_power_check").button().click(function(a){setLowPowerState(a.currentTarget.checked)}.bind(this));$("#help_link").button({zc:{Lc:"ui-icon-help"}}).f({width:"30"});$("#reset").click($.G(function(){for(var a=0;a<this.b.length;a++)this.b[a].reset()},this));$("#invertColours").click(function(a){a.preventDefault();var b;$(a.target).U("ievgrey")?($(a.target).Da("ievgrey"),$(a.target).K("ievInvertedGrey"),
$(".sliceView").f("background-color","#FFFFFF"),$(".sliceControls").f("background-color","#FFFFFF"),$(".scale_text").f("color","#000000"),$(".scale").f("background-color","#000000"),b=h):$(a.target).U("ievInvertedGrey")&&($(a.target).Da("ievInvertedGrey"),$(a.target).K("ievgrey"),$(".sliceView").f("background-color","#000000"),$(".sliceControls").f("background-color","#000000"),$(".scale_text").f("color","#FFFFFF"),$(".scale").f("background-color","#FFFFFF"),b=k);for(a=0;a<this.b.length;a++)z(this.b[a],
b)}.bind(this));$("#zoomIn").button().click($.G(function(){for(var a=0;a<this.b.length;a++)this.b[a].da();this.ma++},this));$("#zoomOut").button().click($.G(function(){for(var a=0;a<this.b.length;a++)if(!this.b[a].ea())return;this.ma--},this));$("#download").click(function(a){a.preventDefault();var b=$("#download_dialog").Ya({title:"Select volumes for download",Pc:h,mc:k,Ec:h,M:"fade",width:700,height:550,position:{Hc:"left bottom",lc:"left top",Ic:$("#top_bar")}}),c=Handlebars.compile(this.Za);b.load("download_dialog.html",
function(){for(var a in this.u[this.m])if(a===this.la){var d=this.u[this.m][this.la].vols;console.log("vols",d);for(var e=[],g=0;g<this.b.length;++g)e.push(this.b[g].e.volume_url);for(var f in d.mutant){var n=d.mutant[f],g=A(n),n=n.volume_url,t="#FFFFFF";-1<$.Qb(n,e)&&(t="#ef7b0b");g={bc:n+";"+g,hc:g,Db:t};$("#mutant_table tbody").append(c(g))}for(f in d.wildtype)n=d.wildtype[f],g=A(n),n=n.volume_url,t="#FFFFFF",-1<$.Qb(n,e)&&(t="#ef7b0b"),g={bc:n+";"+g,hc:g,Db:t},$("#wt_table tbody").append(c(g))}b.Ya("open");
$("#download_dialog_button").click(function(){b.Ya("close");for(var a="",c=$("#wt_table").find('input[type="checkbox"]:checked'),d=0;d<c.length;++d)var g=c[d].name,a=a+(g+",");c=$("#mutant_table").find('input[type="checkbox"]:checked');for(d=0;d<c.length;++d)g=c[d].name,a+=g+",";a="rest/zip?vol="+a;c=document.getElementById("progressSpin");this.A=(new Spinner(this.ra)).qb(c);$("#progressMsg").text("preparing zip");$.vc(a,{$c:function(){this.kb()}.bind(this),uc:function(){alert("There was an error downloading the images")}})}.bind(this))}.bind(this))}.bind(this));
$("#createBookmark").click(function(a){this.va&&(a.preventDefault(),a=generateBookmark(),window.prompt("Bookmark created!\nCopy to clipboard (Ctrl/Cmd+C + Enter)",a))});$("#modality_stage").wa();$("#orthogonal_views_buttons").wa();$("#orientation_button").click(function(a){a.preventDefault();$(a.target).U("vertical")?($(a.target).Da("vertical"),$(a.target).K("horizontal"),B(this,"horizontal"),this.Xa="horizontal"):($(a.target).Da("horizontal"),$(a.target).K("vertical"),B(this,"vertical"),this.Xa=
"vertical")}.bind(this));$(".toggle_slice").L(function(){for(var a=["X_check","Y_check","Z_check"],b=0,c=0;c<a.length;c++)$("#"+a[c]).Rb(":checked")?(this.w[a[c].charAt(0)].visible=h,b++):this.w[a[c].charAt(0)].visible=k;for(c=0;c<this.b.length;c++){var a=this.b[c],d=this.w,e=void 0,e=this.za?100:String(100/b);d.X.visible?(a.fa.show(),a.fa.width(e+"%")):a.fa.M();d.Y.visible?(a.ga.show(),a.ga.width(e+"%")):a.ga.M();d.Z.visible?(a.ha.show(),a.ha.width(e+"%")):a.ha.M()}window.dispatchEvent(new Event("resize"));
this.ma=0}.bind(this));$("#scale_visible").L(function(a){$(a.currentTarget).Rb(":checked")?($("#scale_select").qa("enable"),$(".scale_outer").f({visibility:"visible"})):($("#scale_select").qa("disable"),$(".scale_outer").f({visibility:"hidden"}))}.bind(this));$(".modality_button").L(function(a){a=a.currentTarget.id;C();this.la=a;if("undefined"!==typeof this.ca){var b=this.u[this.m][a].vols.ed;0<Object.keys(b).length?($("#wt").show(),this.ca.Ha(b),this.ca.reset()):$("#wt").M()}"undefined"!==typeof this.$&&
(a=this.u[this.m][a].vols.Gc,0<Object.keys(a).length?($("#mut").show(),this.$.Ha(a),this.$.reset()):$("#mut").M())}.bind(this));$(".button").button();$("#viewHeightSlider").i({min:200,max:1920,value:500,pb:$.G(function(a,b){this.Fb=b.value;$(".sliceWrap").f("height",b.value);D(this);var c=document.createEvent("UIEvents");c.initUIEvent("resize",h,k,window,0);window.dispatchEvent(c)},this)});this.Za=$("#downloadTableRowTemplate").o();C();$("#scale_select").append(E(this).join("")).qa({width:80,height:20,
L:$.G(function(a,b){this.aa.xa=b.item.value;$(".scale_text").text(b.item.label);D(this)},this)})}}function E(a){var b=[],c;for(c in a.aa.options)b.push("<option value='"+a.aa.options[c]+"'>"+c+"</option>");return b}function x(a){for(var b in a.u[a.m])1>a.F(a.u[a.m][b].vols.mutant)?$("#modality_stage input[id^="+b+"]:radio").Q("disabled",h):$("#modality_stage input[id^="+b+"]:radio").Q("disabled",k)}
function D(a){for(var b=0;b<a.b.length;++b){var c=a.b[b];c.ob=a.aa.xa;F(c)}window.dispatchEvent(new Event("resize"))}function C(){$("#modality_stage :input").Yb("disabled",h);$("#modality_stage").wa("refresh")}
s.prototype.fb=function(){for(var a=0;a<this.b.length;a++)if(!this.b[a].pa)return;x(this);$("#modality_stage").wa("refresh");this.ma=0;if(!this.va){"off"===this.k.s&&$("#X_check").Ga("click");"off"===this.k.c&&$("#Y_check").Ga("click");"off"===this.k.a&&$("#Z_check").Ga("click");"vertical"===this.k.orientation&&$("#orientation_button").Ga("click");a=this.k.zoom;if(0>a)for(;0>a;)setTimeout(function(){zoomViewsOut()},1E3),a++;if(0<a)for(;0<a;)setTimeout(function(){zoomViewsIn()},1E3),a--;this.k.h&&
(a=$("#viewHeightSlider"),a.i("value",this.k.h),a.i("option","slide").call(a,j,{value:this.k.h}));this.va=h}$("#scale_select").fc(this.aa.xa).qa("refresh");$(".scale_text").text($("#scale_select").find(":selected").text());$(".linkCheck").L(function(a){$(a.target).U("X")?G(this,"X",a.currentTarget.checked):$(a.target).U("Y")?G(this,"Y",a.currentTarget.checked):$(a.target).U("Z")&&G(this,"Z",a.currentTarget.checked)}.bind(this));D(this);$(".scale_outer").draggable()};
s.prototype.t=function(a,b,c){for(var e=0;e<this.b.length;e++)if(this.b[e].id!==a)if("X"===b&&this.w.X.N){var d=this.b[e];d.volume.p=c-d.Ka;d.H.i("value",d.volume.p)}else"Y"===b&&this.w.Y.N?(d=this.b[e],d.volume.q=c-d.Ma,d.I.i("value",d.volume.q)):"Z"===b&&this.w.Z.N&&(d=this.b[e],d.volume.r=c-d.Na,d.J.i("value",d.volume.r))};
function G(a,b,c){var e,d;$("."+b).Yb("checked",c);ortho[b].N=c;for(c=0;c<a.b.length;c++)"wt"===a.b[c].id?e=a.b[c].oa(b):"mut"===a.b[c].id&&(d=a.b[c].oa(b));for(c=0;c<a.b.length;c++)if("mut"===a.b[c].id){var f=a.b[c],g=b,p=e-d;"X"===g&&(f.Ka=p);"Y"===g&&(f.Ma=p);"Z"===g&&(f.Na=p)}}function A(a){var b=a.sex;"No data"===b&&(b="undeterminedSex");var c=a.geneSymbol.replace(/[|&;$%@"<>()+,\/]/g,"");a=a.animalName.replace(/[|&;$%@"<>()+,\/]/g,"");return b+"_"+a+"_"+c}
s.prototype.kb=function(){this.A.stop();$("#progressMsg").empty()};s.prototype.F=function(a){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b};
function B(a,b){"vertical"===b&&(a.za=h,$(".specimen_view").f({"float":"left",width:"50%",clear:"none"}),$(".sliceWrap").f({width:"100%"}),window.dispatchEvent(new Event("resize")));if("horizontal"===b){a.za=k;var c=0,e;for(e in a.w)a.w[e].visible&&++c;$(".specimen_view").f({"float":"none",width:"100%",clear:"both"});$(".sliceWrap").f({width:String(100/c)+"%"});window.dispatchEvent(new Event("resize"))}};function y(a,b,c,e,d,f,g,p){console.log("id",b);this.localStorage=p;this.La=k;this.lb=e;this.ja=f;this.Aa=d;this.id=b;this.gc=c;this.l=a;this.ac=g;this.Oa;this.Pa;this.fa;this.ga;this.ha;this.H;this.I;this.J;this.O;this.d;this.g;this.j;this.volume;this.ob;this.gb=k;this.sb="windowLevel_"+b;this.ba="volumeSelector_"+b;this.eb=k;this.Na=this.Ma=this.Ka=0;this.pa=k;this.Mc;console.log(f,b);this.ka=f.specimen.nc;this.P="baseline";this.e=a[Object.keys(a)[0]];this.ua=k;if(f.specimen)for(var l in a)if(a.hasOwnProperty(l)&&
(b=a[l],b.animalName===f.specimen.name)){this.e=b;this.ua=h;break}this.Qa="images/centre_icons/";this.ia="images/";this.ub="female.png";this.zb="male.png";this.Ab="unknown_sex.png";this.xb="hom.png";this.vb=this.wb="het.png";this.Bb="wildtype.png";this.dc=$("#specimenMetdataTemplate").o();this.Ua={1:"logo_Bcm.png",3:"logo_Gmc.png",4:"logo_H.png",6:"logo_Ics.png",7:"logo_J.png",8:"logo_Tcp.png",9:"logo_Ning.png",10:"logo_Rbrc.png",11:"logo_Ucd.png",12:"logo_Wtsi.png"};this.A;this.ra={Sb:8,length:6,
width:6,Zb:8,scale:1,Eb:1,color:"#ef7b0b",opacity:0.2,rotate:0,direction:1,speed:1,ec:50,Ib:10,zIndex:2E9,className:"spinner",top:"20px",cc:k,Pb:k,position:"relative"};this.Wb="Jan Feb Mar April May June July Aug Sep Oct Nov Dec".split(" ");a=$("#"+this.gc);1>this.F(this.l)&&this.lb!==j||(f={id:this.id},l=$("#specimen_view_template").o(),l=Handlebars.compile(l),l=$(l(f)),l.append(H(this)),l.append(I(this,"X")),l.append(I(this,"Y")),l.append(I(this,"Z")),b=$("#progress_template").o(),b=Handlebars.compile(b),
f=$(b(f)),l.append(f),this.A=(new Spinner(this.ra)).qb(),f.find(".ievLoadingMsg").append(this.A.Hb),a.append(l));J(this);this.Oa=$("#X_"+this.id);this.tb=$("#Y_"+this.id);this.Pa=$("#Z_"+this.id);this.H=$("#slider_X_"+this.id);this.I=$("#slider_Y_"+this.id);this.J=$("#slider_Z_"+this.id);this.fa=$("#sliceWrap_X_"+this.id);this.ga=$("#sliceWrap_Y_"+this.id);this.ha=$("#sliceWrap_Z_"+this.id);this.O=$("#"+this.sb);K(this);F(this)}m=y.prototype;
m.Ha=function(a){this.l=a;L(this,this.l[Object.keys(this.l)[0]].volume_url);J(this)};
m.update=function(){z(this,this.eb);F(this);var a=new Date(this.e.tc),b=this.Wb[a.getMonth()],b=b+(" "+a.getDate()),b=b+(" "+a.getFullYear()),c;"female"===this.e.Fa.toLowerCase()?c=this.ia+this.ub:"male"===this.e.Fa.toLowerCase()?c=this.ia+this.zb:"no data"===this.e.Fa.toLowerCase()&&(c=this.ia+this.Ab);var e;if(this.e.S===this.P)e=this.Bb;else switch(this.e.ic.toLowerCase()){case "homozygous":console.log("hello");e=this.xb;break;case "heterozygous":console.log("hettttt");e=this.wb;break;case "hemizygous":console.log("hemiiiii"),
e=this.vb}a=this.ia+e;e="";this.Ua.hasOwnProperty(this.e.Wa)&&(e=this.Qa+this.Ua[this.e.Wa]);b={Sa:this.e.sa,rc:b,Uc:c,gd:a,oc:e};c=Handlebars.compile(this.dc);b=$(c(b));$("#metadata_"+this.id).empty();$("#metadata_"+this.id).append(b)};
function J(a){$.dd("custom.iconselectmenu",$.ad.qa,{jc:function(a,b){var c=$("<li>",{text:b.label});b.disabled&&c.K("ui-state-disabled");$("<span>",{style:b.element.Q("data-style"),"class":"ui-icon "+b.element.Q("data-class")}).Ta(c);return c.Ta(a)}});$("#"+a.ba).find("option").remove().end();var b=[],c;for(c in a.l){var e=a.l[c].volume_url,d=a.l[c].Fa.toLowerCase(),f=a.l[c].ic.toLowerCase();"no data"===d&&(d="no_data");d=a.l[c].S===a.P?"specimenSelectIcon "+d+"_wildtype":"specimenSelectIcon "+d+
"_"+f;f=a.l[c].sa.substring(0,25);e===a.e.volume_url?(b.push("<option value='"+e+"' data-class='"+d+"' selected>"+f+"</option>"),a.ua=k):b.push("<option value='"+e+"' data-class='"+d+"'>"+f+"</option>")}$("#"+a.ba).append(b.join(""));$("#"+a.ba).D().D("menuWidget").K("ui-menu-icons customicons");$("#"+a.ba).D({L:$.G(function(a,b){this.ua||L(this,b.item.value)},a)}).D("refresh")}
m.reset=function(){this.d.Ea();this.g.Ea();this.j.Ea();var a=this.volume.Gb;this.volume.p=Math.floor((a[0]-1)/2);this.volume.q=Math.floor((a[1]-1)/2);this.volume.r=Math.floor((a[2]-1)/2);this.H.i("value",this.volume.p);this.I.i("value",this.volume.q);this.J.i("value",this.volume.r);this.O.i("option","values",[this.volume.C,this.volume.B]);$(".scale_outer").f({height:"100%",bottom:"30px",width:"20px",position:"relative",left:"20px","z-index":900});this.update()};m.kb=function(){this.A.stop();$("#progressMsg").empty()};
function I(a,b){var c={Xc:"sliceWrap_"+b+"_"+a.id,Wc:b+"_"+a.id,bd:"slice"+b,Zc:"slider_"+b+"_"+a.id,Yc:"slider"+b,orientation:b,id:a.id,Rc:"scale_"+b+a.id,Sc:"scaletext_"+b+a.id},e=$("#slice_view_template").o();return Handlebars.compile(e)(c)}function H(a){a={id:a.id,pc:"controlsButtons_"+a.id,Tc:"selectorWrap_"+a.id,cd:a.ba,fd:a.sb};var b=$("#slice_controls_template").o();return Handlebars.compile(b)(a)}m.da=function(){this.d.R.da();this.g.R.da();this.j.R.da();F(this)};
m.ea=function(){if(1>this.d.Ba||1>this.g.Ba||1>this.j.Ba)return k;this.d.R.ea();this.g.R.ea();this.j.R.ea();F(this);return h};function F(a){setTimeout(function(){M(this,this.g,"scale_Y"+this.id,"scaletext_Y"+this.id);M(this,this.j,"scale_Z"+this.id,"scaletext_Z"+this.id);M(this,this.d,"scale_X"+this.id,"scaletext_X"+this.id)}.bind(a),20)}
function M(a,b,c,e){var d=$(".scale_outer_"+a.id);a.e.rescaledPixelsize===j||0===a.e.rescaledPixelsize?d.M():(d.show(),a=a.ob/a.e.rescaledPixelsize*b.Ba,b=($(".scale_outer").height()-a)/2,$("#"+c).f({height:a,width:"2px",position:"absolute",top:b}),$("#"+e).f({position:"absolute",top:b-20,"font-size":"10px"}))}m.bb=function(){return this.volume};
function L(a,b){var c={id:a.id},e=$("#"+a.id),d=$("#progress_template").o(),d=Handlebars.compile(d),c=$(d(c));e.append(c);a.A=(new Spinner(a.ra)).qb();c.find(".ievLoadingMsg").append(a.A.Hb);"undefined"!==typeof a.d&&(a.d.ya(),delete a.d);"undefined"!==typeof a.g&&(a.g.ya(),delete a.g);"undefined"!==typeof a.j&&(a.j.ya(),delete a.j);"undefined"!==typeof a.volume&&(a.volume.ya(),delete a.volume);a.e=a.l[b];K(a)}
function K(a){a.pa=k;1>a.F(a.l)||(a.d=new X.nb,a.d.ja.Ra=k,a.d.ab=h,a.d.kc=function(){if(this.d.ab){this.d.Ea();this.d.ab=k;this.g.add(this.volume);this.g.mb();this.j.add(this.volume);this.j.mb();var a=this.volume.Gb,c=this.ja.specimen.pos;this.volume.p=c.x;this.volume.q=c.y;this.volume.r=c.z;N(this,this.H,"X",a[0]-1);N(this,this.I,"Y",a[1]-1);N(this,this.J,"Z",a[2]-1);this.d.v.ib=function(){this.H.i({value:this.volume.p});this.t(this.id,"X",this.volume.p)}.bind(this);this.g.v.ib=function(){this.I.i({value:this.volume.q});
this.t(this.id,"Y",this.volume.q)}.bind(this);this.j.v.ib=function(){this.J.i({value:this.volume.r});this.t(this.id,"Z",this.volume.r)}.bind(this);this.d.v.hb=function(){O(this,this.d)}.bind(this);this.g.v.hb=function(){O(this,this.g)}.bind(this);this.j.v.hb=function(){O(this,this.j)}.bind(this);this.g.v.Qc=function(){};a=parseInt(this.volume.C);this.ka.lower!==j&&(a=Math.max(this.ka.lower,parseInt(this.volume.C)));c=parseInt(this.volume.B);this.ka.upper!==j&&(c=Math.min(this.ka.upper,parseInt(this.volume.B)));
this.volume.C=a;this.volume.B=c;this.volume.Vb(k);this.O.i("option","values",[this.volume.C,this.volume.B]);this.update()}}.bind(a),a.d.Kc=function(){this.O.i({$b:h,min:parseInt(this.volume.min),max:parseInt(this.volume.max),step:Math.ceil((this.volume.max-this.volume.min)/256),rb:[parseInt(this.volume.C),parseInt(this.volume.B)],pb:$.G(function(a,c){this.volume.C=c.rb[0];this.volume.B=c.rb[1];this.volume.Vb(h)},this)});$("#ievLoading"+this.id).remove();$("#noData").remove();this.pa=h;this.ac()}.bind(a),
a.d.T=a.Oa.get(0),a.d.orientation="X",a.d.cb(),P(a.d),a.g=new X.nb,a.g.ja.Ra=k,a.g.T=a.tb.get(0),a.g.orientation="Y",a.g.cb(),P(a.g),a.j=new X.nb,a.j.ja.Ra=k,a.j.T=a.Pa.get(0),a.j.orientation="Z",a.j.cb(),P(a.j),a.volume=new X.volume,a.volume.file="dummy.nrrd",a.localStorage.bb(a.e.volume_url,new Date(a.e.lastUpdate),a.Xb.bind(a)))}
m.Xb=function(a){if(a){this.volume.$a=a;this.d.add(this.volume);var b=setInterval(function(){console.log("carrots");if(this.pa)clearInterval(b);else if(this.La){$("#ievLoading"+this.id).remove();var a={S:this.e.S,Sa:this.e.sa},c=$("#"+this.id),e=$("#dataNotFoundTemplate").o(),a=Handlebars.compile(e)(a);c.append(a);clearInterval(b);var p=this.e.Ja,c=this.localStorage.db.transaction(["volumes"],"readwrite").objectStore("volumes").sc(p);c.onerror=function(){console.log("Error deleting corrupted image from IndexedDB storage")};
c.onsuccess=function(){console.log(p+" successfully deleted from IndexedDB storage")};console.log(this.e.Ja);this.La=k}}.bind(this),5E3);this.d.mb()}else{$("#ievLoading"+this.id).remove();var c={wc:this.lb,Sa:this.e.sa};a=$("#"+this.id);var e=$("#dataNotFoundTemplate").o(),c=Handlebars.compile(e)(c);a.append(c)}};function P(a){a.v.Jc=function(a,c,e){e&&console.log("mousy R")}}
function z(a,b){a.volume&&((a.eb=b)?(a.volume.Tb=[0,0,0],a.volume.Ub=[1,1,1],$("#"+a.id+"> .sliceView").f("background-color","#FFFFFF"),a.volume.p++,a.volume.q++,a.volume.r++):(a.volume.Tb=[1,1,1],a.volume.Ub=[0,0,0],$("#"+a.id+"> .sliceView").f("background-color","#000000"),a.volume.p--,a.volume.q--,a.volume.r--))}m.t=function(a,b,c){"X"===b?this.Aa(a,b,c+this.Ka):"Y"===b?this.Aa(a,b,c+this.Ma):"Z"===b&&this.Aa(a,b,c+this.Na)};
function O(a,b){b.v.Fc.shiftKey?(a.H.i("value",a.volume.p),a.I.i("value",a.volume.q),a.J.i("value",a.volume.r),a.t(a.id,"X",a.volume.p),a.t(a.id,"Y",a.volume.q),a.t(a.id,"Z",a.volume.r)):b.v.Cc&&a.O.i("option","values",[a.volume.C,a.volume.B])}
function N(a,b,c,e){var d="index"+c;b.i({disabled:k,$b:"min",min:0,max:e,value:a.volume[d],pb:function(a,b){this.volume&&!this.gb&&(this.volume[d]=b.value,this.t(this.id,c,this.volume[d]))}.bind(a),stop:function(a,b){this.volume&&this.gb&&(this.volume[d]=b.value,this.t(this.id,c,this.volume[d]))}.bind(a)})}m.Jb=function(){return this.volume.C};m.Kb=function(){return this.volume.B};m.oa=function(a){if("X"===a)return this.volume.p;if("Y"===a)return this.volume.q;if("Z"===a)return this.volume.r};
m.Lb=function(){return this.e};m.F=function(a){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b};goog.n("iev.specimenview.prototype.updateData",y.prototype.Ha);goog.n("iev.specimenview.prototype.reset",y.prototype.reset);goog.n("iev.specimenview.prototype.getCurrentVolume",y.prototype.Lb);goog.n("iev.specimenview.prototype.getIndex",y.prototype.oa);goog.n("iev.specimenview.getBrightnessLower",y.Jb);goog.n("iev.specimenview.getBrightnessupper",y.Kb);
goog.n("iev.specimenview.prototype.zoomIn",y.prototype.da);goog.n("iev.specimenview.prototype.zoomOut",y.prototype.ea);goog.n("iev.specimenview.prototype.getIndex",y.prototype.oa);
