//The initail script that creates the views

$(document ).ready(function(){
	var top_slices = new Slices('sliceX', 'sliceY', 'sliceZ');
	top_slices.buttons();
	top_slices.setup_renderers();
	top_slices.xtk_showtime();
//top_slices.setup();
});



