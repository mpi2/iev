window.onload = function() {

jQuery(function() {
	$("#sliderX").slider();
});

$( document ).click(function() {
$( "#sliderX" ).toggle( "explode" );
});
  
};
