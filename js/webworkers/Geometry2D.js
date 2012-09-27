/**
 * namespace pattern
 * @class Geometry2D
 * @namespace smp.math
 */

(function(){
	
	smp.createNamespace("smp.math.Geometry2D");
	
	//constructor (instance creation)
	smp.math.Geometry2D = (function()
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
	smp.math.Geometry2D.distance = function(x1, y1, x2, y2) 
    {
    	var dx = x1 - x2;
		var dy = y1 - y2;
		return Math.sqrt(dx*dx+dy*dy);
    }
    
    smp.math.Geometry2D.distance3 = function(x1, y1, z1, x2, y2, z2) 
    {
		var dxz = smp.math.MathUtils.distance(x1, z1, x2, z2);
		var dy = y1 - y2;
		return Math.sqrt(dxz*dxz+dy*dy);
    }
	
	smp.math.Geometry2D.degreeToRadian = function(deg) {
		return deg * (Math.PI / 180) % (2*Math.PI);
	}
		
	smp.math.Geometry2D.radianToDegree = function(rad) {
		return rad  * (180/Math.PI) % 360;
	}
	
	/**
	*	@return	: GeometryVector
	*/
	smp.math.Geometry2D.getVector = function(x1, y1, x2, y2) {
			
		var magnitude =  smp.math.Geometry2D.getDistance(x1, y1, x2, y2);
		
		var angle = Math.atan2(y2-y1, x2-x1);
		
		if (angle < 0) {
			angle = -angle;
		}else if (angle >= 0) {
			angle = Math.PI * 2 - angle;
		}
		
		return new smp.math.GeometryVector(angle, magnitude);
		
		
	}
	
	/**
	*	@param	startPoint	: object with properties x and y
	*	@param	endPoint	: object with properties x and y
	*	@param	outputType	: string 'radians' (default) or 'degrees'
	*/
	smp.math.Geometry2D.getLineAngle = function(startPoint, endPoint, outputType) 
	{
		var directionAngle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
		if (directionAngle < 0) {
			directionAngle = Math.PI + directionAngle;
		}
		if (outputType == 'degrees') {
			return directionAngle*180/Math.PI;
		}
		//default to radians
		return directionAngle;	
	}
	
	/**
	*	@param	axis	: object with properties x and y
	*	@param 	point	: object with properties x and y
	*	@param	angle	: number, expected radians
	*	@return			: object with properties x and y
	*/
	smp.math.Geometry2D.rotatePoint = function(axis, point, angle) {
		var delta = {x:point.x - axis.x, y:point.y - axis.y};
		var rpoint = {x:0,y:0};
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);
		
		rpoint.x = delta.x * cos - delta.y * sin;
		rpoint.y = delta.x * sin + delta.y * cos;
		rpoint.x += axis.x;
		rpoint.y += axis.y;
		
		return rpoint;
	}
	
	/**
	 * If input size is minor than bounding size, it returns the input size, no change.
	 * @param	inputSize	: object with properties x,y,width,heigth
	 * @param	maxSize		: object with properties x,y,width,heigth 
	 * @return	 			: object with properties x,y,width,heigth
	 */
	smp.math.Geometry2D.reduceRectangle = function(inputSize, maxSize) {
		
		var propref = maxSize.width / maxSize.height;
		var prop = inputSize.width / inputSize.height;
		var outputSize = {x:0,y:0,width:0,height:0};
		
		if (inputSize.width > maxSize.width || inputSize.height > maxSize.height) {
			if (propref > 1) {
				//se horizontal
				if (prop >= propref) {
					//horizontal e mais largo na  propor��o
					outputSize.width = maxSize.width;
					outputSize.height = inputSize.width / prop;
				}else {
					//((prop < propref && prop > 1) || prop <= 1)
					//horizontal mas mais estreito na propor��o ou vertical ou quadrado
					outputSize.width  = inputSize.height * prop;
					outputSize.height =  maxSize.height;
				}
			}else{
				//se vertical ou quadrado
				if (prop <= propref) {
					//vertical e mais alto na  propor��o
					outputSize.width = inputSize.height * prop;
					outputSize.height =  maxSize.height;
				}else{
					//((prop > propref && prop < 1) || prop >= 1)
					//vertical mas mais baixo na propor��o ou horizontal ou quadrado
					outputSize.width = maxSize.width;
					outputSize.height = inputSize.width / prop;
				}
			}
		}else {
			outputSize = inputSize;
		}
		
		return outputSize;
	}
	
	

}());