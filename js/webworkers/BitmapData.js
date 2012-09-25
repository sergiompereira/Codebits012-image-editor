

	
(function(){	
	BitmapData = (function()
	{
		//private properties
		var Constructor;
		var _bitmapData;
		
		//filters
		var filters = [];
		var filtersObj;
		
		//private made public in prototype
		function _getData(){
			return _bitmapData;
		}
		
		function _copyColor(bmpData,index){
			var color = {};
			
			color.r = bmpData.data[index];
			color.g = bmpData.data[index+1];
			color.b = bmpData.data[index+2];
			color.a = bmpData.data[index+3];
			
			return color;
		}
		
		function _setColor(bmpData,index,color){
			bmpData.data[index] = color.r;
			bmpData.data[index+1] = color.g;
			bmpData.data[index+2] = color.b;
			bmpData.data[index+3] = color.a;
		}
		
		/**
		 *@param[0] filter name: string
		 *@param... : filter params 
		 */
		function _addFilter(){
			//convert to array
			var args = Array.prototype.slice.call(arguments);
			//store and remove the first argument, the filter name;
			var filtername = args.shift();
			var i;
			var filterExist = false;
	
			for(i=0; i<filters.length; i++){
				//console.log(filters[i].filter.name() + " // "+filters[i].params)
				if(filters[i].filter.name() == filtername){
					filters[i].params = args;
					filterExist = true;
					break;
				}
				
			};
			if(!filterExist){
				filters.push({filter:new BitmapFilter(filtername), params:args});
			}
		}
		
		function _applyFilters(filtersImageData, emptyBmpData){
				
	
			//var filtersImageData = _cloneBitmapData(_bitmapData);
			var j,x,y,
				total = filtersImageData.data.length,
				imgw = filtersImageData.width,
				imgh = filtersImageData.height,
				index,filter,filterRef,params;
			
			var pointTypeFilterExists = false;
			for(j=0; j<filters.length;j++){
				if(filters[j].filter.type() == "point"){
					pointTypeFilterExists = true;
					break;
				}
			}
			if(pointTypeFilterExists){
				for(x=0; x<imgw; x++){
					for(y=0; y<imgh; y++){
						index = y*imgw*4+ x*4;	
						for(j=0; j<filters.length;j++){
							filterRef = filters[j];
							if(filterRef.filter.type() == "point"){
								_setColor(filtersImageData,index,filterRef.filter.applyToPoint(_copyColor(filtersImageData,index),filterRef.params));
							}
						}
					}
				}
			}
			
			for(j=0; j<filters.length;j++){
				filterRef = filters[j];
				if(filterRef.filter.type() == "area"){
					console.log("area: "+filters[j].params)
					params = filterRef.params;
					filtersImageData = filterRef.filter.applyToData(filtersImageData,emptyBmpData,params);
					console.log(filterRef.params);
				}
			}
		
			
			return filtersImageData;
			
			//_context.putImageData(filtersImageData, 0,0);
		}
		
		function _clearFilters(){
			filters.splice(0, filters.length);
		};
		
		function _clearFilter(filterName){
			var i;
			for(i=0; i<filters.length; i++){
				//console.log(filters[i].filter.name() + " // "+filters[i].params)
				if(filters[i].filter.name() == filterName){
					filters.splice(i, 1);
					break;
				}
				
			};
		}
	

		
		//Constructor
		Constructor = function(bmpData)
		{

			if(bmpData != null && bmpData !== "undefined"){
				_bitmapData = bmpData;
			}
			
		};
		
		//public
		Constructor.prototype = {
			
			//public properties (getters)
				
			//public methods
			getData:_getData,
			addFilter:_addFilter,
			applyFilters:_applyFilters,
			clearFilters:_clearFilters,
			clearFilter:_clearFilter
		};
		
		
		return Constructor;
		
	}());
}());
	



