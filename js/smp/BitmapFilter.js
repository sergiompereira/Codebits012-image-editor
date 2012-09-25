
/**
 * namespace pattern
 * @class CanvasBitmapData
 * @namespace smp.geom
 */

(function(){
	
	smp.createNamespace("smp.bitmap.BitmapFilter");
	smp.bitmap.BitmapFilter = (function()
	{
		//private properties
		var Constructor;
		
		Constructor = function(filtername)
		{
			
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
				default:
					throw new Error("CanvasFilter->constructor: No filter name specified.");
			}
				
			/**
			 * @param[0] : bitmap data ImageData
			 * @param[1] : empty bitmap data ImageData
			 * @param... : filter params
			 */
			function _applyToData(){
				//convert to array
				var args = Array.prototype.slice.call(arguments);
				//store and remove the first argument, the bitmap data;
				var bmpData = args.shift();
				//store and remove the second argument, the empty data to return;
				var emptyData = args.shift();
				if(args.length==1){
					//if there are still further arguments
					return _filterAreaFnc(bmpData,emptyData,args[0]);
				}else{
					return _filterAreaFnc(bmpData,emptyData);
				}				
				
			}
			
			function _applyToPoint(){
				if(_filterType == "point"){
					//convert to array
					var args = Array.prototype.slice.call(arguments);
					//store and remove the first argument, the bitmap data;
					var bmpData = args.shift();
					if(args.length==1){
						//if there are still further arguments
						
						if (_filterName == "red" || _filterName == "green" | _filterName == "blue") {
							return _filterPointFnc(bmpData, _filterName, args[0]);
						}else {
							return _filterPointFnc(bmpData, args[0]);
						}
					}else{
						return _filterPointFnc(bmpData);
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
			
			
			
		}
		
		//public
		Constructor.prototype = {
			//public properties (getters)

			//public methods
		
		};
		
		
		//private shared methods
		/** filters methods */
		function _saturate(originalImageData, newData,params){
			
			var i;
			var total = originalImageData.data.length;
			for(i = 0; i<total; i+=4){
				
				_setColor(newData,i,_saturateFunction(_copyColor(originalImageData,i), params[0]));
				
			}
			return newData;
		}
		
		function _brighten(originalImageData, newData,params){
			
			var i;
			var total = originalImageData.data.length;
			for(i = 0; i<total; i+=4){
				
				_setColor(newData,i,_brightenFunction(_copyColor(originalImageData,i), params[0]));
				
			}
			return newData;
		}
		
		function _contrast(originalImageData, newData,params){
			
			var i;
			var total = originalImageData.data.length;
			for(i = 0; i<total; i+=4){
				
				_setColor(newData,i,_contrastFunction(_copyColor(originalImageData,i), params[0]));
				
			}
			return newData;
		}
		
		function _channel(originalImageData, newData,channel, params){
			
			var i;
			var total = originalImageData.data.length;
			for(i = 0; i<total; i+=4){
				
				_setColor(newData,i,_channelFunction(_copyColor(originalImageData,i), channel, params));
				
			}
			return newData;
		}
		
		
		function _blur(originalImageData, newData,params){
			
			var matrix;
			var amount = params.shift();
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
					
				default:
					matrix =   [0,1,0,
								1,2,1,
								0,1,0];
								
			}
			
			return _convolute(originalImageData,newData, matrix, params);
		}
		
		function _findEdges(originalImageData,newData){
			
			//A soma deverá ser zero, pois só as transições de cor serão coloridas 
			//e todo o resto da imagem ficará escuro.
			//A cada pixel subtraem-se os pixéis vizinhos, obtém-se uma diferença ou derivada de cor.
			//A direcção pode ser qualquer ou todas.
			
			//transições a 45º
			var matrix =  [-1,  0,  0,  0,  0,
						    0, -2,  0,  0,  0,
						    0,  0,  6,  0,  0,
						    0,  0,  0, -2,  0,
						    0,  0,  0,  0, -1];
			
			return _convolute(originalImageData,newData, matrix);
		}
		
		function _sharpen(originalImageData, newData,params){
			
			
			//Semelhante a find edges, mas é adicionada a imagem original, em vez de se obter apenas a diferença.
			//Deste modo se mantém a imagem original mas com as transições de cor realçadas, ganhando definição.
			
			//definição prop. inversa ao valor ao centro (com os mesmos valores à volta)
			//definiçao prop. directa aos valores à volta (em valor absoluto) com a mesma diff. entre o valor ao centro e a soma dos valores à volta
			
			var amount = params.shift()+10;
			var matrix = [	0, -2, 0,
					  	 	-2, amount, -2,
					   		0, -2, 0];
			
			
			return _convolute(originalImageData,newData, matrix, params);
			
			
		}
			
		function _emboss(originalImageData, newData,params){
			
			var matrix;
			
			//Aumentando e reduzindo a intensidade dos pixéis vizinhos
			//obtém-se um efeito 3D, como se a imagem estivesse em relevo.
			var amount = params.shift();
			console.log(amount)
			switch(amount){
				case 1:
					matrix =  [-2, -1,  0,
							   -1,  1,  1,
							    0,  1,  2]
					break;
				
				case 2:
					matrix = [ -3, -3, -2, -1,  1,
							   -3, -2, -1,  1,  1,
							   -2, -1,  1,  1,  2,
							   -1,  1,  1,  2,  3,
							    1,  1,  2,  3,  3];
					break;
				default:
				 	matrix =  [-2, -1,  0,
							   -1,  1,  1,
							    0,  1,  2];
					break;
			}
			
			return _convolute(originalImageData,newData, matrix, params);
		}
			
		function _convolute(originalImageData, newData, matrix, params){
			var factor, bias;
			if(params){
				if(params[0]) {factor = params[0]} else {factor = 1};
				if(params[1]) {bias = params[1]} else {bias = 0};
			}else{
				factor = 1; bias = 0;
			}
			
			
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
					_setColor(newData,index, _computeMatrix(x,y));
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
						
						color = _copyColor(originalImageData, nimgy*imgw*4+ nimgx*4);
		
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
		
		
		/** per pixel algorithms */
		function _saturateFunction(obj, params)
		{

			//grayscale
			//dest.r = dest.g = dest.b = (colors.r+colors.g+colors.b)/3.0;
			//or:
			//dest.r = dest.g = dest.b =  = 0.2126*r + 0.7152*g + 0.0722*b;
			
			var  saturation = params[0];
			var rlum = 0.3;
			var glum = 0.59;
			var blum = 0.11;
		
			var dest = {};
			
			dest.r = ((rlum + (1.0 - rlum) * saturation) * obj.r) + ((glum + -glum * saturation) * obj.g) + ((blum + -blum * saturation) * obj.b);
			dest.g = ((rlum + -rlum * saturation) * obj.r) + ((glum + (1.0 - glum) * saturation) * obj.g) + ((blum + -blum * saturation) * obj.b);
			dest.b = ((rlum + -rlum * saturation) * obj.r) + ((glum + -glum * saturation) * obj.g) + ((blum + (1.0 - blum) * saturation) * obj.b);
			dest.a = obj.a;
			
			return dest;
		}
		
		function _brightenFunction(obj, params)
		{
			var  brightness = params[0];
			
			var dest = {};
			
			dest.r = obj.r * brightness;
			dest.g = obj.g * brightness;
			dest.b = obj.b * brightness;
			dest.a = obj.a;
			
			dest = _range(dest);
			
			return dest;
		}

		function _contrastFunction(obj, params)
		{
			var  contrast = params[0];
			
			var dest = {};
			
			dest.r = ((obj.r - 125)*contrast)+ 125;
			dest.g = ((obj.g - 125)*contrast)+ 125;
			dest.b = ((obj.b - 125)*contrast)+ 125;
			dest.a = obj.a;
			
			dest = _range(dest);
			
			return dest;
		}
		
		function _channelFunction(obj, channel, params)
		{
			var  value = params[0];
			
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

		
		
		/** utils */
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


