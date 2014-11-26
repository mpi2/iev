//This contains a class that displays 3 orthogonal views for a specimen

function SliceView(){
	//this.slice_html = $document.createElement('div', div_id);
	//this.slice_html.className = 'slice';
	
	this.setContainer = function(container_div){
		//alert(container_div);
	};



	this.setup = function() {
		// create the 2D renderers
		// .. for the X orientation
		sliceX = new X.renderer2D();
		sliceX.container = 'sliceX';
		sliceX.orientation = 'X';
		sliceX.init();

		// .. for Y
		var sliceY = new X.renderer2D();
		sliceY.container = 'sliceY';
		sliceY.orientation = 'Y';
		sliceY.init();

		// .. and for Z
		sliceZ = new X.renderer2D();
		sliceZ.container = 'sliceZ';
		sliceZ.orientation = 'Z';
		sliceZ.init();
		

		// create the 2D renderers
		// .. for the X orientation
		sliceX = new X.renderer2D();
		sliceX.container = 'sliceX';
		sliceX.orientation = 'X';
		sliceX.init();

		// .. for Y
		var sliceY = new X.renderer2D();
		sliceY.container = 'sliceY';
		sliceY.orientation = 'Y';
		sliceY.init();

		// .. and for Z
		sliceZ = new X.renderer2D();
		sliceZ.container = 'sliceZ';
		sliceZ.orientation = 'Z';
		sliceZ.init(); 

  

	};

  
  
  
}



