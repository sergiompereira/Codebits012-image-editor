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
			
			function _setColor(index,color){
				
				var color = ColorUtils.serializeColor(color,10);
				
				_bitmapData.data[index] = color.r;
				_bitmapData.data[index+1] = color.g;
				_bitmapData.data[index+2] = color.b;
				_bitmapData.data[index+3] = color.a;
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
			function _nearestNeighbor(point){
				var vxint = Math.floor(point.x);
				var vyint = Math.floor(point.y);
				var rx = point.x -vxint;
				var ry = point.y -vyint;
				
				if(rx <= 0.5 && ry <= 0.5) {
					return _getColorAt(vxint, vyint);
				}else if(rx <= 0.5 && ry > 0.5){
					return _getColorAt(vxint, vyint+1);
				}else if(rx > 0.5 && ry <= 0.5){
					return _getColorAt(vxint+1, vyint);
				}else if(rx > 0.5 && ry > 0.5){
					return _getColorAt(vxint+1, vyint+1);
				}
				
			}
			function _bilinearInterpolation(point){
				
				var vxint = Math.floor(point.x);
				var vyint = Math.floor(point.y);
				var rx = point.x -vxint;
				var ry = point.y -vyint;
				var v1,v2,v3,v4,i1,i2;
				
				if (rx == 0 && ry == 0) {
					return _getColorAt(point.x, point.y);
				}
				else if (rx == 0) {
					v1 = _getColorAt(vxint,vyint);
					v4 = _getColorAt(vxint,vyint+1);
					return _linearInterpolation(v1,v4,ry);
				}else if (ry == 0) {
					v1 = _getColorAt(vxint,vyint);
					v2 = _getColorAt(vxint+1,vyint);
					return _linearInterpolation(v1,v2,rx);
				}else{
					//get values at the corners
					v1 = _getColorAt(vxint,vyint);
					v2 = _getColorAt(vxint+1,vyint);
					v3 = _getColorAt(vxint+1,vyint+1);
					v4 = _getColorAt(vxint,vyint+1);
					
					//interpolate the values in the middle of two of the sides
					//if you use the bottom and up sides, use the value of rx
					i1 = _linearInterpolation(v1,v2,rx);
					i2 = _linearInterpolation(v4,v3,rx);
					
					//return the interpolation of the above values, which give the
					//interpolated value in the centre of the square
					//The interpolation is done vertically, so use the value of ry
					return _linearInterpolation(i1,i2,ry);
				}
				
				
			}
			
			function _linearInterpolation(color1,color2,r){
				return {
					r:MathUtils.linearInterpolation(color1.r,color2.r,r),
					g:MathUtils.linearInterpolation(color1.g,color2.g,r),
					b:MathUtils.linearInterpolation(color1.b,color2.b,r),
					a:MathUtils.linearInterpolation(color1.a,color2.a,r)
				}
			}
			
			//better quality, slower
			function _bicubicInterpolation(point){
				
				var vxint = Math.floor(point.x);
				var vyint = Math.floor(point.y);
				var rx = point.x -vxint;
				var ry = point.y -vyint;
				var v1,v2,v3,v4,v1l,v2r,v3r,v4l,v1t,v2t,v3b,v4b,v1c,v2c,v3c,v4c,i12,i43,i12t,i43b;
				
				//catching these special cases avoids one interpolation
				//and is slightly faster
				if(rx == 0 && ry == 0){
					return _getColorAt(point.x,point.y);
				}else if(rx == 0){
					v1 = _getColorAt(vxint,vyint);
					v4 = _getColorAt(vxint,vyint+1);
					v1t = _getColorAt(vxint,vyint-1);
					v4b = _getColorAt(vxint,vyint+2);
					return _cubicInterpolation(v1t,v1,v4,v4b,ry);
				}else if(ry == 0){
					v1 = _getColorAt(vxint, vyint);
					v2 = _getColorAt(vxint + 1, vyint);
					v1l = _getColorAt(vxint - 1, vyint);
					v2r = _getColorAt(vxint + 2, vyint);
					return _cubicInterpolation(v1l,v1,v2,v2r,rx);
				}else {
					//get values at the corners
					v1 = _getColorAt(vxint, vyint);
					v2 = _getColorAt(vxint + 1, vyint);
					v3 = _getColorAt(vxint + 1, vyint + 1);
					v4 = _getColorAt(vxint, vyint + 1);
					
					//get values at the far left
					v1l = _getColorAt(vxint - 1, vyint);
					v4l = _getColorAt(vxint - 1, vyint + 1);
					
					//get values at the far right
					v2r = _getColorAt(vxint + 2, vyint);
					v3r = _getColorAt(vxint + 2, vyint + 1);
					
					//interpolate the values in the middle of two of the sides
					//if you use the bottom and up sides, use the value of rx
					i12 = _cubicInterpolation(v1l, v1, v2, v2r, rx);
					i43 = _cubicInterpolation(v4l, v4, v3, v3r, rx);
					
					//get values at the farther corners
					v1c = _getColorAt(vxint - 1, vyint - 1);
					v2c = _getColorAt(vxint + 2, vyint - 1);
					v3c = _getColorAt(vxint + 2, vyint + 2);
					v4c = _getColorAt(vxint - 1, vyint + 2);
					
					//get values at the far top
					v1t = _getColorAt(vxint, vyint - 1);
					v2t = _getColorAt(vxint + 1, vyint - 1);
					
					//get values at the far bottom
					v3b = _getColorAt(vxint + 1, vyint + 2);
					v4b = _getColorAt(vxint, vyint + 2);
					
					//interpolate the values in the middle of two of the sides
					//if you use the bottom and up sides, use the value of rx
					i12t = _cubicInterpolation(v1c, v1t, v2t, v2c, rx);
					i43b = _cubicInterpolation(v4c, v4b, v3b, v3c, rx);
					
					//return the interpolation of the above values, which give the
					//interpolated value in the centre of the square
					//The interpolation is done vertically, so use the value of ry
					return _cubicInterpolation(i12t, i12, i43, i43b, ry);
				}
			}
			
			function _cubicInterpolation(color01,color1,color2,color20,r){
				return {
					r:MathUtils.cubicInterpolation(color01.r,color1.r,color2.r,color20.r,r),
					g:MathUtils.cubicInterpolation(color01.g,color1.g,color2.g,color20.g,r),
					b:MathUtils.cubicInterpolation(color01.b,color1.b,color2.b,color20.b,r),
					a:MathUtils.cubicInterpolation(color01.a,color1.a,color2.a,color20.a,r)
				}
			}
			
			//grid effect to be solved ... 
            //(the interpolation is brighter then the original)
            //http://en.wikipedia.org/wiki/Lanczos_resampling
            //http://software.intel.com/sites/products/documentation/hpc/ipp/ippi/ippi_appendices/ippi_appB_LanczosInterpolation.html
            
			function _LanczosResampling(point,a){
				
				if(!a) a = 3;
				
				var x = point.x,
					xf = Math.floor(x),
					y = point.y,
					yf = Math.floor(y),
					dx = x-xf,
					dy = y-yf,
					inix = xf-a+1,
					iniy = yf-a+1,
					endx = xf+a,
					endy = yf+a,
					xi,yj,
					color,ncolor,xcolor;
					
				if(dx == 0 && dy == 0){ 
					return _getColorAt(x,y);
				}else if(dx == 0){
					ncolor = {r:0,g:0,b:0,a:255};
					for (yj = iniy; yj <= endy; yj++) {
						color = _getColorAt(xf,yj);
						
						ncolor.r += _LanczosFilter(y - yj, a)*color.r;
						ncolor.g += _LanczosFilter(y - yj, a)*color.g;
						ncolor.b += _LanczosFilter(y - yj, a)*color.b;
					}
				}else if(dy == 0){
					ncolor = {r:0,g:0,b:0,a:255};
					for (xi = inix; xi <= endx; xi++) {
						color = _getColorAt(xi,yf);
						
						ncolor.r += _LanczosFilter(x - xi, a) * color.r;
						ncolor.g += _LanczosFilter(x - xi, a) * color.g;
						ncolor.b += _LanczosFilter(x - xi, a) * color.b;
					}
				}else{
					var Ix = [],
						I = [];
						
					for (yj = iniy; yj <= endy; yj++) {
						ncolor = {r:0,g:0,b:0,a:255};
						for (xi = inix; xi <= endx; xi++) {
							
							color = _getColorAt(xi,yj);
							ncolor.r += _LanczosFilter(x - xi, a) * color.r;
							ncolor.g += _LanczosFilter(x - xi, a) * color.g;
							ncolor.b += _LanczosFilter(x - xi, a) * color.b;
							
						}
						Ix.push(ncolor);
					}
					
					//reset
					ncolor = {r:0,g:0,b:0,a:255};
					
					for (yj = iniy; yj <= endy; yj++) {
						xcolor = Ix.shift();
						
						ncolor.r += _LanczosFilter(y - yj, a)*xcolor.r;
						ncolor.g += _LanczosFilter(y - yj, a)*xcolor.g;
						ncolor.b += _LanczosFilter(y - yj, a)*xcolor.b;
					}
				}
				
				return ncolor;
			}
			
			function _LanczosFilter(t,a){
				if (t < 0){
				      t = -t;
				}
				
				var tp = Math.PI*t;
				if (t < a && t!=0){
				      return _clean(a*Math.sin(tp)*Math.sin(tp/a) / (tp*tp));
				}else{
				      return 0;
				}
				
				
				/*function sinc(x){
					x = x * Math.PI;

				   	if ((x < 0.01) && (x > -0.01)){
				      return 1 + x*x*(-1/6 + x*x*1/120);
					}
				   	
					return Math.sin(x) / x;
				   
				}*/
			}
			
			
			/**
			 * 
			 * @param {ImageData} originalImageData
			 * @param {ImageData} newData			: it assumes to be a factor*size of the original ImageData.
			 * @return ImageData
			 */
			function _scale(originalImageData, newData, interpolationType){
				
				var total = newData.data.length,
				 	width = newData.width,
				 	height = newData.height,
					factor = width/originalImageData.width,
					bmpUtil = new smp.bitmap.BitmapDataUtility(originalImageData),
					newBmpUtil = new smp.bitmap.BitmapDataUtility(newData),
					interpolationFnc;
				
				switch(interpolationType){
					case "nearest":
					 	_interpolationFnc = bmpUtil.nearestNeighbor;
					break;
					case "bicubic":
						_interpolationFnc = bmpUtil.bicubicInterpolation;
					break;
					case "lanczos":
						_interpolationFnc = bmpUtil.LanczosResampling;
					break;
					default:
						//linear
						 _interpolationFnc = bmpUtil.bilinearInterpolation;
				}
				
				var x,y,ncolor;	
						
				for(y = 0; y<height; y++){	
					for(x = 0; x<width; x++){
						ncolor = _interpolationFnc({x:x/factor , y:y/factor})
						newBmpUtil.setColor(newBmpUtil.pointToIndex(x,y), ncolor);
					}		
				}
				
				return newData;
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
			
			
			
			/**
			 * utils
			 */
			
			function _clean(t){
				
				if(t<0.0000125){
					return 0;
				}
				return t;
			}
			
			/**
			 * END : utils
			 */
			
			
			//public interface
			this.getBitmapData = _getBitmapData;
			this.setBitmapData = _setBitmapData;
			this.getColor = _getColor;
			this.getColorAt = _getColorAt;
			this.setColor = _setColor;
			this.pointToIndex = _pointToIndex;
			this.indexToPoint = _indexToPoint;
			this.nearestNeighbor = _nearestNeighbor;
			this.bilinearInterpolation = _bilinearInterpolation;
			this.bicubicInterpolation = _bicubicInterpolation;
			this.LanczosResampling = _LanczosResampling;
			this.scale = _scale;
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
	



