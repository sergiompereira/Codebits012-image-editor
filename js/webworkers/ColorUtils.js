(function(){
	
	smp.createNamespace("smp.math.ColorUtils");
	
	//constructor (instance creation)
	smp.math.ColorUtils = (function()
	{
		var Constructor;
		
		
		Constructor = function()
		{
		
		}
		
		Constructor.prototype = {
			//public properties
			version:"1.0"
			
			//public methods
			
		};
		
		return Constructor;
		
	}());
	
	
	//utils
	function getHighestChannel(color){
		color = smp.math.ColorUtils.serializeColor(color);
		color.r = parseInt(color.r,16);
		color.g = parseInt(color.g,16);
		color.b = parseInt(color.b,16);
		
		var highestValue = color.r;
		if(color.g > highestValue) highestValue = color.g;
		if(color.b > highestValue) highestValue = color.b;
		
		color.r = color.r.toString(16);
		color.g = color.g.toString(16);
		color.b = color.b.toString(16);
		
		return highestValue;
	}
	function getLowestChannel(color){
		color = smp.math.ColorUtils.serializeColor(color);
		color.r = parseInt(color.r,16);
		color.g = parseInt(color.g,16);
		color.b = parseInt(color.b,16);
		
		var lowestValue = color.r;
		if(color.g < lowestValue) lowestValue = color.g;
		if(color.b < lowestValue) lowestValue = color.b;
		
		color.r = color.r.toString(16);
		color.g = color.g.toString(16);
		color.b = color.b.toString(16);
		
		return lowestValue;
	}
	//@param	color: Object	must be serialized and in decimal base.
	function constrainColor(color){
		if(color.r > 255) color.r = 255;
		if(color.g > 255) color.g = 255;
		if(color.b > 255) color.b = 255;
		if(color.r < 0) color.r = 0;
		if(color.g < 0) color.g = 0;
		if(color.b < 0) color.b = 0;
		return color;
	}
	
	
	//static methods
	
	/**
	 * @param	Number (base 10) or String (base 16)	color	:	
	 * @param	int		to									:	which base the output should be in
	 */
	smp.math.ColorUtils.serializeColor = function(color,to){
		if(typeof color == "string"){
			if(color.substr(0,1)=="#") color = color.substr(1);
		}else if(typeof color != "number"){
			return color;
		}
	
		var hexParts = _getHexParts(color.toString(16));
		if(to == null || to == undefined) to = 16;
		if(to == 16){
			return {
				r: hexParts.r,
				g: hexParts.g,
				b: hexParts.b
			};
		}else if(to == 10){
			return {
				r: parseInt(hexParts.r,16),
				g: parseInt(hexParts.g,16),
				b: parseInt(hexParts.b,16)
			};
		}else if(to == 2){
			//to be continued
		}
		
	
		
		//internal function
		function _getHexParts(hexvalue){
			var len,r,g,b;
			len = hexvalue.toString().length;
			if(len <= 6){
				b = hexvalue.substr(len-2);
				g = hexvalue.substr(len-4,2);
				r;
				if(len==6){
					r = hexvalue.substr(0,2);
				}else{
					r = hexvalue.substr(0,1);
					r = '0'+r;
				}
				return {
					r: r,
					g: g,
					b: b
				};
			}else{
				//consider RGBA values...
			}
		}
	}
	
	
	/**
	*	Adds zeros to the left to match the specified length
	*/
	smp.math.ColorUtils.normalizeHexaValues = function(hexvalue,length){
		
		var len = hexvalue.length;
		var value = hexvalue;
		var diff,j;
	
		if(len < length){
			diff = length - len;
			for(j=0; j < diff; j++){
				value = '0'+value;
			}
		}
		return  value; 
		
	}

	smp.math.ColorUtils.stringifyColor = function(color){
		if(typeof color == "object" && color.r != null){
			return "#"+color.r+color.g+color.b;
		}
		return color;
	}
	
	smp.math.ColorUtils.changeBrightness = function(color,factor){
		color = smp.math.ColorUtils.serializeColor(color);
		var dec;
		if(factor<=1){
			dec = getHighestChannel(color)*(factor-1);
		}else{
			dec = (255-getLowestChannel(color))*(factor-1);
		}
		color.r = Math.round(parseInt(color.r, 16)+dec);
		color.g = Math.round(parseInt(color.g, 16)+dec);
		color.b = Math.round(parseInt(color.b, 16)+dec);
		
		if(color.r < 0) color.r = 0;
		if(color.g < 0) color.g = 0;
		if(color.b < 0) color.b = 0;
		if(color.r > 255) color.r = 255;
		if(color.g > 255) color.g = 255;
		if(color.b > 255) color.b = 255;
		
		color.r = smp.math.ColorUtils.normalizeHexaValues(color.r.toString(16),2);
		color.g = smp.math.ColorUtils.normalizeHexaValues(color.g.toString(16),2);
		color.b = smp.math.ColorUtils.normalizeHexaValues(color.b.toString(16),2);
		
		return color
	}
	
	/**
	 * Returns an array with the colors of the spectrum
	 * @param	hex		: Boolean, if true, returns the array with DomString Colors #rrggbb
	 * @returns Array
	 */
	smp.math.ColorUtils.spectrum = function(total, hex) 
	{
		
		var i,nRadians,nR,nG,nB,nColor,spectrumColors = [];
		var resolution = 360/total;
		
		for (i = 0; i <= 360; i+=resolution)
		{

			/*
			 * A little maths (bitwise operation):
			 * 00010111 LEFT-SHIFT =  00101110
			 * 00010111 RIGHT-SHIFT =  00001011
			 * 
			 * A left arithmetic shift by n is equivalent to multiplying by Math.pow(2,n), 
			 * while a right arithmetic shift by n is equivalent to dividing by Math.pow(2,n).
			 * 
			 * In C-inspired languages, the left and right shift operators are "<<" and ">>", respectively. 
			 * The number of places to shift is given as the second argument to the shift operators.
			 * x = y << 2;
			 */
			
			nRadians = i * (Math.PI / 180);
			nR = Math.cos(nRadians)                   * 127 + 128 << 16;
			nG = Math.cos(nRadians + 2 * Math.PI / 3) * 127 + 128 << 8;
			nB = Math.cos(nRadians + 4 * Math.PI / 3) * 127 + 128;
			   
			
			/*
			 * Some more maths (bitwise operation continued):
			 * The | (vertical bar) operator performs a bitwise OR on two integers. 
			 * Each bit in the result is 1 if either of the corresponding bits in the two input operands is 1. 
			 * For example, 0x56 | 0x32 is 0x76, because:

				  0 1 0 1 0 1 1 0
				| 0 0 1 1 0 0 1 0
				  ---------------
				  0 1 1 1 0 1 1 0

			 */

			 
			nColor  = nR | nG | nB;
			
			spectrumColors.push(nColor);
		}
		
		if(hex){
			var len = spectrumColors.length;
			var value,diff,j;
			for(i=0; i<len; i++){
				value = spectrumColors[i].toString(16);
				if(value.length < 6){
					diff = 6 - value.length;
					for(j=0; j < diff; j++){
						value = '0'+value;
					}
				}
				spectrumColors[i] = value; 
			}
		}
		
		
		return spectrumColors;	
	}
	
	
	/**
	 * @param	initcolor	: String	the initial hexadecimal color
	 * @param	endcolor	: String	the final hexadecimal color
	 * @param	total		: Number	the number of interpolated colors to output
	 * @param	hex			: Boolean	wether to return the array with DomString Colors rrggbb (without the #)
	 * @returns 			: Array		the collection of colors between the initcolor and endcolor
	 * @example				
		<pre>
			

			div > div{
				width:5px;
				height:100px;
				float:left;
				background-color:#000000;
			}
			
			
			var gradient = document.getElementById("gradient");
						
			var spectrum = smp.math.ColorUtils.crossColorsSpectrum("#339900","#0066dd", 100, true);
			var value,i,len = spectrum.length;
			for(i=0; i<len; i++){
				value = spectrum[i];
				var div = document.createElement("div");
				div.style.backgroundColor = "#"+value.r+value.g+value.b;
				gradient.appendChild(div);
			}
		</pre>
	 */
	smp.math.ColorUtils.crossColorsSpectrum =  function(initcolor, endcolor, total, hex) {
		
		var _self = smp.math.ColorUtils;
		var initHexParts = _self.serializeColor(initcolor,10);
		var endHexParts = _self.serializeColor(endcolor,10);
		var tempColor = {r:initHexParts.r, g:initHexParts.g, b:initHexParts.b};
		var tempHexColor = {};
		var spectrumColors = [],i;
		
		var delta = {r:endHexParts.r-initHexParts.r ,g:endHexParts.g-initHexParts.g ,b:endHexParts.b-initHexParts.b };
		var inc = {r:delta.r/total ,g:delta.g/total ,b:delta.b/total };
		spectrumColors.push(smp.clone(tempColor));
		
		for(i=0; i<total; i++){					
				tempColor.r = tempColor.r + inc.r;
				tempColor.g = tempColor.g + inc.g;
				tempColor.b = tempColor.b + inc.b;
				tempColor = constrainColor(tempColor);
				
				spectrumColors.push(smp.clone(tempColor));
							
		}
		
		if(hex){
			var len = spectrumColors.length;
			
			for(i=0; i<len; i++){
			
				spectrumColors[i].r =_self.normalizeHexaValues(Math.round(spectrumColors[i].r).toString(16),2);
				spectrumColors[i].g =_self.normalizeHexaValues(Math.round(spectrumColors[i].g).toString(16),2);
				spectrumColors[i].b =_self.normalizeHexaValues(Math.round(spectrumColors[i].b).toString(16),2);
				
			}
		}
		
		return spectrumColors;	
	}

}());
    