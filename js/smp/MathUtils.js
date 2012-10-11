/**
 * namespace pattern
 * @class MathUtils
 * @namespace smp.math
 */

(function(){
	
	smp.createNamespace("smp.math.MathUtils");
	
	//constructor (instance creation)
	smp.math.MathUtils = (function()
	{
		var _value;
		var Constructor;
		
		
		Constructor = function()
		{
		
		}
		
		Constructor.prototype = {
			//public properties
			value:_value,
			version:"1.1"
			
			//public methods
			
		};
		
		return Constructor;
		
	}());
	
	//static methods
	
    /**
     *  Round a number. By default the number is rounded to the nearest
     *  integer. Specifying a roundToInterval parameter allows you to round
     *  to the nearest of a specified interval.
     *  @param  number             The number you want to round.
     *  @param  nRoundToInterval   (optional) The interval to which you want to
     *                             round the number. The default is 1.
     *  @return                    The number rounded to the nearest interval.
     */
    smp.math.MathUtils.round = function(nNumber, nRoundToInterval) {
      // Return the result
	  if(nRoundToInterval == null){
	  	nRoundToInterval = 1;
	  }
      return Math.round(nNumber / nRoundToInterval) * nRoundToInterval;
    }
    

    /**
     *  Get the floor part of a number. By default the integer part of the
     *  number is returned just as if calling Math.floor( ). However, by specifying
     *  a roundToInterval, you can get non-integer floor parts.
     *  to the nearest of a specified interval.
     *  @param  number             The number for which you want the floor part.
     *  @param  nRoundToInterval   (optional) The interval to which you want to
     *                             get the floor part of the number. The default is 1.
     *  @return                    The floor part of the number.
     */
   smp.math.MathUtils.floor  = function(nNumber, nRoundToInterval) {
    
	  if(nRoundToInterval == null){
	  	nRoundToInterval = 1;
	  }
      // Return the result
      return Math.floor(nNumber / nRoundToInterval) * nRoundToInterval;
    }

    /**
     *  Get the ceiling part of a number. By default the next highested integer
     *  number is returned just as if calling Math.ceil( ). However, by specifying
     *  a roundToInterval, you can get non-integer ceiling parts.
     *  to the nearest of a specified interval.
     *  @param  number             The number for which you want the ceiling part.
     *  @param  nRoundToInterval   (optional) The interval to which you want to
     *                             get the ceiling part of the number. The default is 1.
     *  @return                    The ceiling part of the number.
     */
    smp.math.MathUtils.ceil = function(nNumber, nRoundToInterval) {

	  if(nRoundToInterval == null){
	  	nRoundToInterval = 1;
	  }
      // Return the result
      return Math.ceil(nNumber / nRoundToInterval) * nRoundToInterval;
    }

    /**
     *  Generate a random number within a specified range. By default the value
     *  is rounded to the nearest integer. You can specify an interval to which
     *  to round the value.
     *  @param  minimum            The minimum value in the range.
     *  @param  maximum            (optional) The maxium value in the range. If
                                   omitted, the minimum value is used as the maximum,
                                   and 0 is used as the minimum.
     *  @param  roundToInterval    (optional) The interval to which to round.
     *  @return                    The random number.
     */
    smp.math.MathUtils.random = function(nMinimum, nMaximum, nRoundToInterval) {

	  if(nMaximum == null){
	  	nMaximum = 0;
	  }
	  
	  if(nRoundToInterval == null){
	  	nRoundToInterval = 1;
	  }
      // If the minimum is greater than the maximum, switch the two.
      if(nMinimum > nMaximum) {
        var nTemp = nMinimum;
        nMinimum = nMaximum;
        nMaximum = nTemp;
      }

        // Calculate the range by subtracting the minimum from the maximum. Add
        // 1 times the round to interval to ensure even distribution.
        var nDeltaRange = (nMaximum - nMinimum) + (1 * nRoundToInterval);

        // Multiply the range by Math.random(). This generates a random number
        // basically in the range, but it won't be offset properly, nor will it
        // necessarily be rounded to the correct number of places yet.
        var nRandomNumber = Math.random() * nDeltaRange;

        // Add the minimum to the random offset to generate a random number in the correct range.
        nRandomNumber += nMinimum;

        // Return the random value. Use the custom floor( ) method to ensure the
        // result is rounded to the proper number of decimal places.
        return smp.math.MathUtils.floor(nRandomNumber, nRoundToInterval);
      }
	  
	  
	smp.math.MathUtils.scale = function(valor, inMin , inMax , outMin , outMax) {
			return (valor - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
	}
	
	smp.math.MathUtils.normalize = smp.math.MathUtils.scale;
	
	/**
	 * Considering a matrix with matrixHCount elements in each row,
	 * and an array that would store each of the matrix elements in a left to right and top bottom order,
	 * this method returns the index position in the array that stores the element at the matrix coordinates (x,y)
	 * @param	matrixHCount	: number of elements in each row of the matrix
	 * @param	x				: x position in the matrix grid
	 * @param 	y				: y position in the matrix grid
	 * @return					: index in the array
	 */
	smp.math.MathUtils.getIndexFromPoint = function(matrixHCount, x, y) {
		if(x<matrixHCount && x>=0){
			return y*matrixHCount + x;
		}
		return null;
		
	}
	
	/**
	 * Considering a matrix with matrixHCount elements in each row,
	 * and an array that would store each of the matrix elements in a left to right and top bottom order,
	 * this method returns the (x,y) position in the matrix grid of the element stored in the index position of the array.
	 * @param	matrixHCount	: number of elements in each row of the matrix
	 * @param	index			: position of the element in the array
	 * @return					: an object with properties x and y
	 */
	smp.math.MathUtils.getPointFromIndex = function(matrixHCount, index) {
		var point = {};
		var tx = (index % matrixHCount);
		point.x = Math.floor(tx);
		var subindex = (tx % 1) - 1;
		point.y = Math.floor(index/matrixHCount);
		return point;
	}
	
	
	/**
	 * If only three arguments are provided, consider the third as the ratio
	 * otherwise, compute the ratio from the last three arguments, 
	 * being the third argument the current x position at which to interpolate the function
	 */
    smp.math.MathUtils.linearInterpolation = function(y1,y2,rORxk,x1,x2){
    	var r;
    	if(arguments.length == 3){
    		r = rORxk;
    	}else if(arguments.length == 5){
    		r = (rORxk-x1)/(x2-x1);
    	}
    	
    	return y1*(1-r) + y2*r;

    }
	
    
 
    smp.math.MathUtils.cubicInterpolation = function(y0,y1,y2,y3,rORxk,x1,x2){
		var r;
		if(arguments.length == 5){
			r = rORxk;
		}else if(arguments.length == 7){
			r = (rORxk-x1)/(x2-x1);
		}
		
		
		//return (-y0+3*y1-3*y2+y3)*Math.pow(r,3)+(2*y0-5*y1+4*y2-y3)*Math.pow(r,2)+(-y0+y1)*r+y1;
		//just very slightly faster...
		return (y1+r*(-y0+y1+r*(2*y0-5*y1+4*y2-y3+r*(-y0+3*y1-3*y2+y3))))
	}
    
	smp.math.MathUtils.cosineInterpolation = function(v1,v2,r){
		var pi = 3.1415927;
		var ft = r * pi;
		var f = (1 - Math.cos(ft)) * 0.5;
		return v1*(1-f) + v2*f;
	}
	
	

}());
    