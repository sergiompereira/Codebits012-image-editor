importScripts("smp.js", "../smp/MathUtils.js", "../smp/ColorUtils.js", "../smp/Geometry2D.js",  "../smp/BitmapDataUtility.js", "../smp/BitmapFilter.js");
//The files here included behave has in a sandbox.
//The core smp.js file they will reference will be the one specified here, in webworkers/
//although they are in the ../smp/ where another smp.js file exist, 
//which include references to DOM that would launch error in this context.

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