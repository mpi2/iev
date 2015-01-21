// XTK source had to be modified for this to work
// JAMES EDIT 27112014 in renderer2d.js


// provides
goog.provide('IPMC.colortable');

// Divide the colortable up into organs and t-statistics
		colorLists = (function() {

			var noElements = volume.labelmap._colorTable.count_;
			var colormap = volume.labelmap._colorTable.map_;
			var found = false;
			var tstatList = []; var organList = [];

			// Loop through color table
			for (var t = 0; t < noElements; t++) {
				var labelID = colormap[t][0];
				var color = colormap[t].slice(1,5);
				color[0] *= 255; color[1] *= 255; color[2] *= 255; color[3] *= 255;
			
				if (labelID.lastIndexOf("tstat", 0) === 0) {
					tstatList.push(color);
				} else {
					organList.push(color);
				}
			}
			
			fullList = organList.concat(tstatList);
			return { all: fullList, tstats: tstatList, organs: organList };

		})();  
