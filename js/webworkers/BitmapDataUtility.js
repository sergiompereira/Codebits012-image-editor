(function(){	
	
	smp.createNamespace("smp.bitmap.BitmapDataUtility");
	
	smp.bitmap.BitmapDataUtility = (function()
	{
		//dependencies
		var ColorUtils = smp.math.ColorUtils;
		var MathUtils = smp.math.MathUtils;
		//!! Do not load the reference here, to avoid looped dependencies 
		//(BitmapFilter loads this class as well)
		//var BitmapFilter = smp.bitmap.BitmapFilter;
		
		//private properties
		var Constructor;
		
	

		
		//Constructor
		Constructor = function(bmpData)
		{
			var _bitmapData;
			
			//filters
			var filters = [];
			var filtersObj;
			
			
			if(bmpData != null && bmpData !== "undefined"){
				_bitmapData = bmpData;
			}
			
			
			//private made public below
			
			function _setBitmapData(bmpData){
				_bitmapData = bmpData;
			}
			
			
			function _getBitmapData(){
				return _bitmapData;
			}
			
			function _getColor(index, hexa){
				var color = {};
				
				color.r = _bitmapData.data[index];
				color.g = _bitmapData.data[index+1];
				color.b = _bitmapData.data[index+2];
				color.a = _bitmapData.data[index+3];
				
				if(hexa){
					for(var key in color){
						color[key] = color[key].toString(16);
						if(color[key].length < 2){
							color[key] = '0'+color[key];
						}
					}
				}
				
				return color;
			}
			
			function _getColorAt(x,y, hexa){
				var id = _pointToIndex(x,y);
				return _getColor(id, hexa);
			}
			
			/* DEPRECATED */
			/*
			function _getDataAtIndex(id){
				
				var point = {};
				var tx = id%(bmpData.width * 4)/4;
				point.x = Math.floor(tx);
				var subindex = (tx%1) * 4 - 1;
				point.y = Math.floor((id/4)/bmpData.width);
				
				point.r = _bitmapData.data[id-subindex];
				point.g = _bitmapData.data[id-subindex+1];
				point.b = _bitmapData.data[id-subindex+2];
				point.a = _bitmapData.data[id-subindex+3];
				
				switch(subindex){
					case 0:
						point.color = "R";
						break;
					case 1:
						point.color = "G";
						break;
					case 2:
						point.color = "B";
						break;
					case 3:
						point.color = "A";
						break;
				}
				
				
				return point;
				
				
			}
			*/
			/* END : DEPRECATED */
			
			function _setColor(index,color,alpha){
				
				var color = ColorUtils.serializeColor(color,10);
				if(alpha == undefined) alpha = 255;
				
				_bitmapData.data[index] = color.r;
				_bitmapData.data[index+1] = color.g;
				_bitmapData.data[index+2] = color.b;
				_bitmapData.data[index+3] = alpha;
			}
			
			function _pointToIndex(x,y){
				return y*_bitmapData.width*4+ x*4;
			}
			
			function _indexToPoint(index){
				var tx = index%(_bitmapData.width * 4)/4;
				var x = Math.floor(tx);
				var subindex = (tx%1) * 4 - 1;
				var y = Math.floor((index/4)/_bitmapData.width);
				
				return {x:x, y:y};
			}
			
			function _bilinearInterpolation(point){
				
				var vxint = Math.floor(point.x);
				var vyint = Math.floor(point.y);
				var rx = point.x -vxint;
				var ry = point.y -vyint;
				
				//get values at the corners
				var v1 = _getColorAt(vxint,vyint);
				var v2 = _getColorAt(vxint+1,vyint);
				var v3 = _getColorAt(vxint+1,vyint+1);
				var v4 = _getColorAt(vxint,vyint+1);
				
				//interpolate the values in the middle of two of the sides
				//if you use the bottom and up sides, use the value of rx
				var i1 = _linearInterpolation(v1,v2,rx);
				var i2 = _linearInterpolation(v3,v4,rx);
				
				//return the interpolation of the above values, which give the
				//interpolated value in the centre of the square
				//The interpolation is done vertically, so use the value of ry
				return _linearInterpolation(i1,i2,ry);
			}
			
			function _linearInterpolation(color1,color2,r){
				return {
					r:MathUtils.linearInterpolation(color1.r,color2.r,r),
					g:MathUtils.linearInterpolation(color1.g,color2.g,r),
					b:MathUtils.linearInterpolation(color1.b,color2.b,r),
					a:MathUtils.linearInterpolation(color1.a,color2.a,r)
				}
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
					filters.push({filter:new smp.bitmap.BitmapFilter(filtername), params:args});
				}
			}
			
			/**
			 * 
			 * @param bmpData :	always pass an (original) ImageData, instead of using the stored one, to avoid overfiltering.
			 * @param emptyBmpData : pass an empty ImageData, to avoid DOM dependencies in this class.
			 * @returns
			 */
			/**
			 * TODO : melhorar a performance evitando a escrita no ImageData original
			 * e favorecendo-a no ImageData vazio
			 */
			function _applyFilters(bmpData, emptyBmpData){
					
				var bmpDataUtil = new smp.bitmap.BitmapDataUtility(bmpData);
				
				var j,x,y,
					total = bmpData.data.length,
					imgw = bmpData.width,
					imgh = bmpData.height,
					index,filter,filterRef,params;
				
				var pointTypeFilterExists = false;
				for(j=0; j<filters.length;j++){
					if(filters[j].filter.type() == "point"){
						pointTypeFilterExists = true;
						break;
					}
				}
				if(pointTypeFilterExists){
					for(i = 0; i<total; i+=4){
					//for(x=0; x<imgw; x++){
						//for(y=0; y<imgh; y++){
							//index = y*imgw*4+ x*4;	
							for(j=0; j<filters.length;j++){
								filterRef = filters[j];
								if(filterRef.filter.type() == "point"){
									bmpDataUtil.setColor(i,filterRef.filter.applyToPoint(bmpDataUtil.getColor(i),filterRef.params));
								}
							}
						//}
					}
				}
				
				for(j=0; j<filters.length;j++){
					filterRef = filters[j];
					if(filterRef.filter.type() == "area"){
						//console.log("area: "+filters[j].params)
						params = filterRef.params;
						bmpData = filterRef.filter.applyToData(bmpData,emptyBmpData,params);
						//console.log(filterRef.params);
					}
				}
			
				
				return bmpData;
				
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
			
			
			//public interface
			this.getBitmapData = _getBitmapData;
			this.setBitmapData = _setBitmapData;
			this.getColor = _getColor;
			this.getColorAt = _getColorAt;
			this.setColor = _setColor;
			this.pointToIndex = _pointToIndex;
			this.indexToPoint = _indexToPoint;
			this.bilinearInterpolation = _bilinearInterpolation;
			this.addFilter = _addFilter;
			this.applyFilters = _applyFilters;
			this.clearFilters = _clearFilters;
			this.clearFilter = _clearFilter;
		};
		
		//public
		Constructor.prototype = {
			
			//public properties (getters)
				
			//public methods
			
		};
		
		
		return Constructor;
		
	}());
}());
	



