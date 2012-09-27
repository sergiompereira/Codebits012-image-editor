importScripts("smp.js", "MathUtils.js", "ColorUtils.js", "Geometry2D.js",  "BitmapDataUtility.js", "BitmapFilter.js");


(function(){
	
	var bitmapData;
	var processStack = [];
	
	this.addEventListener('message', function(e) {
		var data = e.data;
		if(data.action == "init"){
			bitmapData = new smp.bitmap.BitmapDataUtility();
		}else
		if(data.action == "applyFilters"){
			if(data.filter !== null && data.filter !== undefined && data.filter != ""){
				bitmapData.addFilter(data.filter,data.filterValue);
				var retbmp = bitmapData.applyFilters(data.bmpData,data.emptyBmpData);
				
				postMessage({"bmpData":retbmp});
			}else{
				postMessage({"bmpData":bitmapData.applyFilters(data.bmpData,data.emptyBmpData)});
			}
		}else  if(data.action == "resetFilters"){
			bitmapData.clearFilters();
		}else if(data.action == "resetFilter"){
			bitmapData.clearFilter(data.filter);
		}
		
		
	}, false);

	
}());