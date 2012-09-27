
/**
 * Depends on
 * 	smp.bitmap.BitmapFilter
 * 	smp.math.ColorUtils
 */

(function(){
	
	smp.createNamespace("smp.canvas.CanvasBitmapData");
	
	//dependencies
	var MathUtils = smp.math.MathUtils;
	var BitmapDataUtility = smp.bitmap.BitmapDataUtility;
	var BitmapFilter = smp.bitmap.BitmapFilter;
	
	smp.canvas.CanvasBitmapData = (function()
	{
		//private shared properties
		var Constructor;
		var auxCanvas = document.createElement("canvas");
		var auxContext;
		if(!!auxCanvas.getContext){
			auxContext = auxCanvas.getContext("2d");
		}else{
			smp.log('CanvasBitmapData -> O browser não suporta canvas.');
			return;
		}
		
		
		
		/** utils */
		//private shared methods
		function _createCanvas(w,h){
			var tCanvas = document.createElement("canvas");
			tCanvas.setAttribute("width", w);
			tCanvas.setAttribute("height", h);
			return tCanvas;
		}
		
		function _createBitmapData(w,h){
			return auxContext.createImageData(w,h);
		}
		
		function _cloneBitmapData(bmpData){
			var i;
			var total = bmpData.data.length;
			var tempBmpData = auxContext.createImageData(bmpData.width, bmpData.height);
			for(i = 0; i<total; i++){
				tempBmpData.data[i] = bmpData.data[i];
			}
			tempBmpData.width = bmpData.width;
			tempBmpData.height = bmpData.height;
			return tempBmpData;
		}
	
		
		//
		
		Constructor = function(canvas, w, h)
		{
			var _canvas;
			if(canvas && canvas !== "undefined"){
				_canvas = canvas;
			}else{
				_canvas = document.createElement("canvas");
				_canvas.setAttribute("width", w);
				_canvas.setAttribute("height", h);
			}
			var _context = _canvas.getContext("2d");

			var _imageWidth;
			var _imageHeight;
			var _originalBitmapData = _context.getImageData(0,0,_canvas.width, _canvas.height);
			var _bitmapData = _cloneBitmapData(_originalBitmapData);
			var _bitmapDataUtil = new BitmapDataUtility(_bitmapData);
					
			
			/**
			 * 
			 * @param image		: Dom img tag reference
			 */
			function _setImage(image)
			{
				_imageWidth = image.width;
				_imageHeight = image.height;
				_canvas.setAttribute('width', _imageWidth);
				_canvas.setAttribute('height', _imageHeight);
				/*_clipObj.w = _imageWidth;
				_clipObj.h = _imageHeight;*/
				_context.drawImage(image, 0, 0, _imageWidth, _imageHeight);
				
				_originalBitmapData = _context.getImageData(0,0,_imageWidth, _imageHeight);
				_bitmapData = _cloneBitmapData(_originalBitmapData);
			}
			
			function _getCanvas(){
				return _canvas;
			}
			
			function _getBitmapData(){
				return _bitmapData;
			}
			
			
			
			/* TODO */
			
			function _scale(x,y, bmpData){
				
				if(!bmpData || bmpData === "undefined"){
					bmpData = _cloneBitmapData(_originalBitmapData);
				}
				
				if(!y || y === "undefined"){
					y = x;
				}
				
				
				var tempCanvas = _createCanvas(bmpData.width, bmpData.height);
				var tempContext = tempCanvas.getContext("2d");
				var tempCanvas2 = _createCanvas(bmpData.width, bmpData.height);
				var tempContext2 = tempCanvas2.getContext("2d");
				
				tempContext.putImageData(bmpData,0,0);
				tempContext2.scale(x,y);
				tempContext2.drawImage(tempCanvas,0,0);
				
				_bitmapData = tempContext2.getImageData(0, 0, bmpData.width*x, bmpData.height*y);
				return _bitmapData;
				
			}
			
			function _crop(x,y,w,h, bmpData)
			{
				if(!bmpData || bmpData === "undefined"){				
					_context.putImageData(_originalBitmapData,0,0);
					_bitmapData = _context.getImageData(x, y, w, h);
					
				}else{
					var tempCanvas = _createCanvas(bmpData.width, bmpData.height);
					var tempContext = tempCanvas.getContext("2d");
					tempContext.putImageData(bmpData,0,0);
					_bitmapData = tempContext.getImageData(x, y, w, h);
				}
				
				return _bitmapData;
			
			}
			/* END : TODO */
			

			function _applyFilters(){
	
				_context.putImageData(
						_bitmapDataUtil.applyFilters(
								_cloneBitmapData(_bitmapData), 
								_createBitmapData(_bitmapData.width, _bitmapData.height)
								),
						0,0);
			}
			
			function _savePNGImage(canvas, bmpData){
				var imageData;
				if(bmpData){
					var canvas = _createCanvas(bmpData.width,bmpData.height);
					canvas.getContext("2d").putImageData(bmpData, 0,0);
				}else if(!canvas){
					canvas = _canvas;
				}
				
				imageData = canvas.toDataURL("image/png");
				var imageUrl = imageData.replace("image/png", "image/octet-stream");
				window.open(imageUrl,'userimage','width='+_canvas.width+',height='+_canvas.height+',left=100,top=100,resizable=No');

			}
			
			
			//public interface (instance scope)
			this.setImage = _setImage;
			this.getCanvas = _getCanvas;
			this.getBitmapData = _getBitmapData;
			this.getColor = _bitmapDataUtil.getColor;
			this.getColorAt = _bitmapDataUtil.getColorAt;
			this.setColor = _bitmapDataUtil.setColor;
			this.addFilter = _bitmapDataUtil.addFilter;
			this.applyFilters = _applyFilters;
			this.clearFilters = _bitmapDataUtil.clearFilters;
			this.clearFilter = _bitmapDataUtil.clearFilter;
			this.savePNGImage =  _savePNGImage;
			
		}
		
		//public
		Constructor.prototype = {
			//public properties (getters)

			//public shared methods
			createCanvas : _createCanvas,
			createBitmapData :	_createBitmapData,
			cloneBitmapData : _cloneBitmapData
		};
		
		return Constructor;
		
	}());

	
}());


