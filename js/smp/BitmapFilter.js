(function(){
	
	smp.createNamespace("smp.bitmap.BitmapFilter");
	
	smp.bitmap.BitmapFilter = (function()
	{
		//private properties
		var Constructor;
		//dependencies
		var Geometry2D = smp.math.Geometry2D;
		var BitmapDataUtility = smp.bitmap.BitmapDataUtility;
		
		Constructor = function(filtername)
		{
			
			var _bitmapDataUtil = new BitmapDataUtility();	
			var _auxBitmapDataUtil = new BitmapDataUtility();
			
			var _filterName = filtername;
			var _filterType = "";
			var _filterPointFnc, _filterAreaFnc;
			
			
			switch(_filterName){
				case "saturation":
					_filterType = "point";
					_filterAreaFnc = _saturate;
					_filterPointFnc = _saturateFunction;
					break;
				case "brightness":
					_filterType = "point";
					_filterAreaFnc = _brighten;
					_filterPointFnc = _brightenFunction;
					break;
				case "contrast":
					_filterType = "point";
					_filterAreaFnc = _contrast;
					_filterPointFnc = _contrastFunction;
					break;
				case "threshold":
					_filterType = "point";
					_filterAreaFnc = _threshold;
					_filterPointFnc = _thresholdFunction;
					break;
				case "red":
					_filterType = "point";
					_filterAreaFnc = _channel;
					_filterPointFnc = _channelFunction;
					break;
				case "green":
					_filterType = "point";
					_filterAreaFnc = _channel;
					_filterPointFnc = _channelFunction;
					break;
				case "blue":
					_filterType = "point";
					_filterAreaFnc = _channel;
					_filterPointFnc = _channelFunction;
					break;
				case "blur":
					_filterType = "area";
					_filterAreaFnc = _blur;
					break;
				case "edges":
					_filterType = "area";
					_filterAreaFnc = _findEdges;
					break;
				case "sharpen":
					_filterType = "area";
					_filterAreaFnc = _sharpen;
					break;
				case "emboss":
					_filterType = "area";
					_filterAreaFnc = _emboss;
					break;
				case "convolute":
					_filterType = "area";
					_filterAreaFnc = _convolute;
					break;
				case "stretch":
					_filterType = "area";
					_filterAreaFnc = _stretch;
					break;
				default:
					throw new Error("BitmapFilter->constructor: No filter name specified.");
			}
				
			/**
			 * @param[0] : bitmap data ImageData
			 * @param[1] : empty bitmap data ImageData
			 * @param... : filter params
			 */
			function _applyToData(){				
				return  _filterAreaFnc.apply(this, arguments);
			}
			
			function _applyToPoint(){
				if(_filterType == "point"){
				
					if (_filterName == "red" || _filterName == "green" | _filterName == "blue") {
						var args = [].slice.call(arguments,0);
						args.splice(1,0,_filterName);
						return _filterPointFnc.apply(this, args);
					}else {
						return _filterPointFnc.apply(this, arguments);
					}
					
				}else{
					throw new Error("BitmapFiler->applyToPoint: Filter is of type 'area'. Applying on a point basis will render unconsistent results.")
				}
			}
			function _name(){
				return _filterName;
			}
			function _type(){
				return _filterType;
			}
			
			
			this.applyToData = _applyToData;
			this.applyToPoint = _applyToPoint;
			this.name = _name;
			this.type = _type;
			this.bitmapDataUtil = _bitmapDataUtil;
			this.auxBitmapDataUtil = _auxBitmapDataUtil;
			
			
			
		}
		
		//public
		Constructor.prototype = {
			//public properties (getters)

			//public methods
		
		};
		
		
		//private shared methods
		/** filters methods */
		function _saturate(originalImageData, newData,params){
			
			var i,self=this;
			var total = originalImageData.data.length;
			self.auxBitmapDataUtil.setBitmapData(newData);
			self.bitmapDataUtil.setBitmapData(originalImageData);
			
			if(params != 1){
				for(i = 0; i<total; i+=4){
					self.auxBitmapDataUtil.setColor(i,_saturateFunction(self.bitmapDataUtil.getColor(i), params));
				}
				return newData;
			}else{
				return originalImageData;
			}
			
			
			
		}
		
		function _brighten(originalImageData, newData,params){
			
			var i,self=this;
			var total = originalImageData.data.length;
			self.auxBitmapDataUtil.setBitmapData(newData);
			self.bitmapDataUtil.setBitmapData(originalImageData);
			
			if(params != 1){
				for(i = 0; i<total; i+=4){
					self.auxBitmapDataUtil.setColor(i,_brightenFunction(self.bitmapDataUtil.getColor(i), params));					
				}
				return newData;
			}else{
				return originalImageData;
			}
		}
		
		function _contrast(originalImageData, newData,params){
			
			var i,self=this;
			var total = originalImageData.data.length;
			self.auxBitmapDataUtil.setBitmapData(newData);
			self.bitmapDataUtil.setBitmapData(originalImageData);
			
			if(params != 1){
				for(i = 0; i<total; i+=4){
					self.auxBitmapDataUtil.setColor(i,_contrastFunction(self.bitmapDataUtil.getColor(i), params));	
				}
				return newData;
			}else{
				return originalImageData;
			}
		}
		
		function _threshold(originalImageData, newData,params){
			
			var i,self=this;
			var total = originalImageData.data.length;
			self.auxBitmapDataUtil.setBitmapData(newData);
			self.bitmapDataUtil.setBitmapData(originalImageData);
			
			if(params != 1){
				for(i = 0; i<total; i+=4){
					self.auxBitmapDataUtil.setColor(i,_thresholdFunction(self.bitmapDataUtil.getColor(i), params));	
				}
				return newData;
			}else{
				return originalImageData;
			}
		}
		
		function _channel(originalImageData, newData,channel, params){
			
			var i,self=this;
			var total = originalImageData.data.length;
			self.auxBitmapDataUtil.setBitmapData(newData);
			self.bitmapDataUtil.setBitmapData(originalImageData);
			
			if(params != 1){
				for(i = 0; i<total; i+=4){
					self.auxBitmapDataUtil.setColor(i,_channelFunction(self.bitmapDataUtil.getColor(i),channel, params));
				}
				return newData;
			}else{
				return originalImageData;
			}
		}
		
		
		function _blur(originalImageData, newData,params){
			//console.log(params)
			var matrix;
			var amount = Number(params);
			switch(amount){
				case 1:
					matrix =   [0,1,0,
								1,2,1,
								0,1,0];
					break;
			
				case 2: 
					matrix =   [0,0,1,0,0,
								0,1,2,1,0,
								1,2,3,2,1,
								0,1,2,1,0,
								0,0,1,0,0];
					break;
				case 3:
					matrix =   [0,0,0,1,0,0,0,
								0,0,1,2,1,0,0,
								0,1,2,3,2,1,0,
								1,2,3,4,3,2,1,
								0,1,2,3,2,1,0,
								0,0,1,2,1,0,0,
								0,0,0,1,0,0,0];
					break;
				case 4:
					matrix =   [0,0,0,0,1,0,0,0,0,
								0,0,0,1,2,1,0,0,0,
								0,0,1,2,3,2,1,0,0,
								0,1,2,3,4,3,2,1,0,
								1,2,3,4,5,4,3,2,1,
								0,1,2,3,4,3,2,1,0,
								0,0,1,2,3,2,1,0,0,
								0,0,0,1,2,1,0,0,0,
								0,0,0,0,1,0,0,0,0];
					break;
					
			
			}
			
			if(matrix){
				return _convolute.call(this,originalImageData,newData, matrix);
			}else{
				return originalImageData;
			}
		}
		
		function _findEdges(originalImageData,newData){
			
			/** A soma deverá ser zero, pois só as transições de cor serão coloridas 
			e todo o resto da imagem ficará escuro.
			A cada pixel subtraem-se os pixéis vizinhos, obtém-se uma diferença ou derivada de cor.
			A direcção pode ser qualquer ou todas.
			*/
			
			//transições a 45º
			var matrix =  [-1,  0,  0,  0,  0,
						    0, -2,  0,  0,  0,
						    0,  0,  6,  0,  0,
						    0,  0,  0, -2,  0,
						    0,  0,  0,  0, -1];
			
			return _convolute.call(this,originalImageData,newData, matrix);
		}
		
		function _sharpen(originalImageData, newData,params){
			
			
			/**
			 * 
			Semelhante a find edges, mas é adicionada a imagem original, em vez de se obter apenas a diferença.
			Deste modo se mantém a imagem original mas com as transições de cor realçadas, ganhando definição.
			
			definição prop. inversa ao valor ao centro (com os mesmos valores à volta)
			definiçao prop. directa aos valores à volta (em valor absoluto) com a mesma diff. entre o valor ao centro e a soma dos valores à volta
			*/
			
			var value = Number(params);
			var amount;
			if(value >=1 ){
				amount = 8-(value-1)*2+10;
			}else{
				return originalImageData;
			}
			
			var matrix = [	0, -2, 0,
					  	 	-2, amount, -2,
					   		0, -2, 0];
			
			
			
			return _convolute.call(this,originalImageData,newData, matrix);
		
			
			
		}
			
		function _emboss(originalImageData, newData,params){
			/**			
			
			Aumentando e reduzindo a intensidade dos pixéis vizinhos
			obtém-se um efeito 3D, como se a imagem estivesse em relevo.
			Neste caso a 45º (luz vem do c.s.e)
			
			 * inv. prop valor central (para os m.s valores à volta)
			 * dir. prop valores à volta (para o mesmo valor ao centro)
			 * */
			
			var value = Number(params);
			var amount;
			if(value >=1 ){
				//amount = 5-(value-1);
				//range in: 1-5, out:3-1
				amount = (value - 1) / (5 - 1) * (1 - 3) + 3;
			}else{
				return originalImageData;
			}
			
			var matrix = [	-2, -1, 0,
					  	 	-1, amount, 1,
					   		0, 1, 2];
			
			
			
			return _convolute.call(this,originalImageData,newData, matrix);
		
			
		}
			
		function _convolute(originalImageData, newData, matrix, factor,bias){
			
			if(factor == undefined) factor = 1;
			if(bias == undefined) bias = 0;
			
			var self = this;
			self.auxBitmapDataUtil.setBitmapData(newData);
			self.bitmapDataUtil.setBitmapData(originalImageData);
			
			//matrix should have a even number of items and their square root should be an integer
			var side = Math.sqrt(matrix.length),
				centeroffset = (side-1)/2,
				matrixlen = matrix.length,
				sum = 0,
				x,y,k,m,
				pixelslength = originalImageData.data.length,
				imgw = originalImageData.width,
				imgh = originalImageData.height;
				
				if(side%Math.floor(side)>0) throw new Error("CanvasFilter->convolute:Matrix width and eight must be the same (matrix length's square root must be an integer).")
								
			//obter o valor da soma de todos os elementos da matriz
			for(i=0;i<matrix.length;i++){
				sum+=matrix[i];
			}
			
			//avoid division by zero
			if(sum == 0) sum = 1;
			
			//por cada pixel da imagem
			
			//PERFORMANCE TEST
			//var time = Date.now();
						
			/*
			for(i = 0; i<pixelslength; i+=4){
				_setColor(newImageData,i,_computeMatrix(
						Math.floor(i%(originalImageData.width * 4)/4),
						Math.floor((i/4)/originalImageData.width)));
						
			}*/
			
			//ligeiramente mais répido
			for(x=0; x<imgw; x++){
				for(y=0; y<imgh; y++){
					var index = y*imgw*4+ x*4;					
					self.auxBitmapDataUtil.setColor(index,_computeMatrix(x,y));
				}
			}
			
			//PERFORMANCE TEST
			//console.log(Date.now()-time)
			
			function _computeMatrix(imgx,imgy){
				var imgnx,imgny,color,value,psum = {r:0,g:0,b:0,a:255};
				for(k=0; k<side; k++){
					for(m=0;m<side;m++){
						value = matrix[m*side+k];
						nimgx = imgx - centeroffset+k;
						nimgy = imgy - centeroffset+m;
						
						if(nimgx<0) nimgx*=-1;
						if(nimgy<0) nimgy*=-1;
						if(nimgx>imgw-1) nimgx -= (nimgx - (imgw-1));
						if(nimgy>imgh-1) nimgy -= (nimgy - (imgh-1));
						
						color = self.bitmapDataUtil.getColor(nimgy*imgw*4+ nimgx*4);
		
						psum.r+=(color.r*value);
						psum.g+=(color.g*value);
						psum.b+=(color.b*value);					
					}
				}
				
				psum.r = Math.floor((psum.r/sum)*factor + bias);
				psum.g = Math.floor((psum.g/sum)*factor + bias);
				psum.b = Math.floor((psum.b/sum)*factor + bias);
		
				psum = _range(psum);
				
				return psum;
				
			}
			
			
			return newData;
			
		}
		
		/**
		 * displacementCoeff: 1 - ...20... - 200
		 * radialCoeff: 1 - ...50... - 200
		 */
		
		function _stretch(originalImageData, newData, origin, dest, displacementCoeff, radialCoeff){
		
			
			var i;
			var total = originalImageData.data.length;
			var self = this;
			self.auxBitmapDataUtil.setBitmapData(newData);
			self.bitmapDataUtil.setBitmapData(originalImageData);
			
			// displacement: the vector between the original position and the new position (destination)
            var displacement = {x:dest.x - origin.x, y:dest.y - origin.y};
			// correctedDisplacement decreases in proportion to displacement increase (f(x) = 1/(1+x/a))
            //      and equals to displacement value when this reaches 0 (the origin is never actually moved to destination, but is somewhere along the way)
            //      Consider this as a sort of friction...
            var  correctedDisplacement = {x:0,y:0};
            correctedDisplacement.x = (displacement.x / (1.0 + Math.abs(displacement.x) / displacementCoeff));
            correctedDisplacement.y = (displacement.y / (1.0 + Math.abs(displacement.y) / displacementCoeff));
           
			self.bitmapDataUtil.setBitmapData(originalImageData);
			
			/*for(i = 0; i<20; i+=4){
				_setColor(newData,i,_stretchPoint(bitmapDataUtil.indexToPoint(i)));	
			}*/
			
			var x,y,w = originalImageData.width,h = originalImageData.height;
			for(y = 0; y<h; y++){
				for(x = 0; x<w; x++){
					self.auxBitmapDataUtil.setColor(self.bitmapDataUtil.pointToIndex(x,y),_stretchPoint({x:x,y:y}));	
				}
			}
			return newData;
			
			function _stretchPoint(point){
				
	            // distance: the distance (vector length) between the current pixel and the origin
	            var distance = Geometry2D.distance(origin.x,origin.y,point.x,point.y);
	        
	            // the correctedDisplacement is further changed by a factor that decreases in proportion to distance increase
	            //      If the current pixel is over the origin (distance equals 0) than no change occurs.
	            var relativeDisplacement = (1.0 + distance / radialCoeff);
	            
	            var pos = {x:point.x - correctedDisplacement.x / relativeDisplacement, y:point.y - correctedDisplacement.y / relativeDisplacement};

	            return self.bitmapDataUtil.bilinearInterpolation(pos);
			}
			
			
		}
		
		
		/** per pixel algorithms */
		function _saturateFunction(obj, params)
		{

				//grayscale
			//dest.r = dest.g = dest.b = (colors.r+colors.g+colors.b)/3.0;
			//or REC 709
			//dest.r = dest.g = dest.b =  = 0.2126*r + 0.7152*g + 0.0722*b;
			//or REC 601
			//dest.r = dest.g = dest.b =  = 0.3*r + 0.59*g + 0.11*b;
			//in any case, the coefficients sum to 1.
			
			var  saturation = params;
			var rlum = 0.2126;
			var glum = 0.7152;
			var blum = 0.0722;
			
		
			var dest = {};
			
			dest.r = ((rlum + (1.0 - rlum) * saturation) * obj.r) + ((glum + -glum * saturation) * obj.g) + ((blum + -blum * saturation) * obj.b);
			dest.g = ((rlum + -rlum * saturation) * obj.r) + ((glum + (1.0 - glum) * saturation) * obj.g) + ((blum + -blum * saturation) * obj.b);
			dest.b = ((rlum + -rlum * saturation) * obj.r) + ((glum + -glum * saturation) * obj.g) + ((blum + (1.0 - blum) * saturation) * obj.b);
			dest.a = obj.a;
			
			return dest;
		}
		
		function _brightenFunction(obj, params)
		{
			var  brightness = params;
			
			var dest = {};
			
			if(brightness < 1){
					dest.r = brightenColor(obj.r);
					dest.g = brightenColor(obj.g);
				dest.b = brightenColor(obj.b);
			}else{
				dest.r = darkenColor(obj.r);
				dest.g = darkenColor(obj.g);
				dest.b = darkenColor(obj.b);
			}
			
			function brightenColor(color){
				return color + gaussian(color,125,100)* (brightness-1);
			}
			function darkenColor(color){
				return color + gaussian(color,125,50)* (brightness-1);
			}
			function gaussian(value, center, amplitude){
				var a = value, b = center, c = amplitude;
				//curva gaussiana, de modo que os pretos e brancos ficam quase inalterados.
				return a*Math.pow(Math.E, -(Math.pow(value-b,2)/(2*Math.pow(c,2))));
			}

			dest.a = obj.a;
			
			dest = _range(dest);
			
			return dest;
		}

		function _contrastFunction(obj, params)
		{
			var  contrast = params;
			
			var dest = {};
			
			dest.r = contrastColor(obj.r);
			dest.g = contrastColor(obj.g);
			dest.b = contrastColor(obj.b);
			
			function contrastColor(color){
				//formula : diferença de luminância / luminância média
				//ou seja, o desvio da média a dividir pela média.
				//http://en.wikipedia.org/wiki/Contrast_(formula)#Formula
				return ((color - 125)*contrast)+ 125;
			}
			
			dest.a = obj.a;
			
			dest = _range(dest);
			
			return dest;
		}
		
		function _thresholdFunction(obj, params)
		{
			var  threshold = params;
			
			var dest = {};
			//REC 709
			var nvalue = (0.2126*obj.r + 0.7152*obj.g + 0.0722*obj.b >= threshold) ? 255 : 0;
			dest.r = dest.g = dest.b = nvalue;
			dest.a = obj.a;
			
			//dest = _range(dest);
			
			return dest;
		}
		
		function _channelFunction(obj, channel, params)
		{
			var  value = params;
			
			var dest = {};
			
			dest.r = obj.r;
			dest.g = obj.g;
			dest.b = obj.b;
			dest.a = obj.a;
			
			switch(channel){
				case "red":
					dest.r*=value;
				break;
				case "green":
					dest.g*=value;
				break;
				case "blue":
					dest.b*=value;
				break;
			}
			
			dest = _range(dest);
			
			return dest;
		}

		
		
		function _range(color){
			if(color.r>255)color.r = 255; else if(color.r<0)color.r = 0;
			if(color.g>255)color.g = 255; else if(color.g<0)color.g = 0;
			if(color.b>255)color.b = 255; else if(color.b<0)color.b = 0;
			if(color.a>255)color.a = 255; else if(color.a<0)color.a = 0;
			
			return color;
		}
		
		
		return Constructor;
		
	}());
	
	
}());


