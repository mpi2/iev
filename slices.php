<html>
	<head>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
		<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/themes/smoothness/jquery-ui.css" />
		<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>

		<!-- Just testing out the imported from the uncompiled X src  -->
		<script type="text/javascript" src="X_src/lib/google-closure-library/closure/goog/base.js"></script>
		<script type="text/javascript" src="X_src/xtk-deps.js"></script>

		<link href="css/main.css" rel="stylesheet" type="text/css">
		<script type="text/javascript" src="js/slices.js"></script>
		<script type="text/javascript" src="js/main.js"></script>
		<!-- <script type="text/javascript" src="x/js/xtk_edge.js"></script> -->

		<body>
			<div id='wrapp'>
				<div id='top_bar'>
					<div id='left_top_buttons'>
						<input type="checkbox" id="labelmap">
						<label for="labelmap">Labelmap</label>
						<input type="checkbox" id="link_views_toggle">
						<label for="link_views_toggle">link views</label>
						<div id='zoom_slider'></div>
						
					</div>
					<div id='top_right_buttons'>
						<input type="checkbox" id="X_check" class='toggle_slice' checked>
						<label for="check">S</label>
						<input type="checkbox" id="Y_check" class='toggle_slice' checked>
						<label for="check">C</label>
						<input type="checkbox" id="Z_check" class='toggle_slice' checked>
						<label for="check">A</label>
					</div>
				</div> <!-- Top bar -->

				<div id="viewer"></div>
			
			</div><!-- wrapp -->
		</body>
	</head>
</html>
