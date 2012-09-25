

/**
@example: rotating preloader
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="800" height="400"
	onload="onLoad(evt)" >
			
			<script type="text/javascript"><![CDATA[
				
				var svgDoc;
				function onLoad(evt){
					
					//get a reference to the svg element
					svgDoc = evt.target;		
			
					var g = smp.graphics.Svg.create("g")
					var gutter =180/24,inc=4*gutter,i;
					for(i=0;i<360;i+=inc+2*gutter){
						g.appendChild( smp.graphics.Svg.createWedge(50,50,35,50,i,i+inc,'#999999'));
					}
					smp.graphics.Svg.rotate(g,0,360,4,{x:50,y:50},0);
					svgDoc.appendChild(g);
				}
			]]></script>

		</svg>
*/



(function(){
	
	smp.createNamespace("smp.graphics.Svg");
	var d = document;
	
	//constructor (instance creation)
	smp.graphics.Svg = (function()
	{
		var _value;
		var Constructor;
		
		
		Constructor = function()
		{
		
		}
		
		Constructor.prototype = {
			//public properties
			value:_value,
			version:"1.0"
			
			//public methods
			
		};
		
		return Constructor;
		
	}());

	smp.graphics.Svg.createSVG = function(width,height){
		var _width = width || 800;
		var _height = height || 600;
		var svgcont = d.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgcont.setAttribute("version", "1.1");
		svgcont.setAttribute("width", _width);
		svgcont.setAttribute("height", _height);
		return svgcont;
	}
	smp.graphics.Svg.create = function(el){
				return d.createElementNS("http://www.w3.org/2000/svg", el);
		};
	
		/**
		 * 
		 * @param	sx
		 * @param	sy
		 * @param	outerRadius			: defaults 50
		 * @param	innerRadius			: defaults 0
		 * @param	startAngle			: defaults 0. Degrees, measured from the positive X axis in clockwise direction. Accepted 0 to 360.
		 * @param	endAngle			: defaults 360. Degrees, measured from the positive X axis in clockwise direction. Accepted 0 to 360.
		 * @param	fillColor			: defaults #999999
		 * @param	fillAlpha			: defaults 1
		 * @param	lineWidth			: defaults 0
		 * @param	lineColor			: defaults #000000
		 * @param	lineAlpha			: defaults 1
		 * @return	svg <g> element
		 */
	smp.graphics.Svg.createWedge = function(sx, sy, outerRadius, innerRadius, startAngle, endAngle, fillColor, fillAlpha, lineWidth, lineColor, lineAlpha){
			
			
				if(!outerRadius) outerRadius = 50;
				if(!innerRadius) innerRadius = 0;
				if(!startAngle) startAngle = 0;
				if(!endAngle) endAngle = 360;
				if(!fillColor) fillColor = '#999999';
				if(!fillAlpha) fillAlpha = 1;
				if(lineWidth && !lineAlpha) lineAlpha = 1;
				if(lineWidth && !lineColor) lineColor = '#000000';
				/*
				if(!endOuterRadius) endOuterRadius = 0;
				if(!endInnerRadius) endInnerRadius = 0;
				*/
				
			
				var shape = smp.graphics.Svg.create("path");
				var segAngle,angle,angleMid,numOfSegs,outerRadiusInc = 0,innerRadiusInc = 0,ax,ay,bx,by,cx,cy;
				
				shape.setAttribute('fill',fillColor);
				shape.setAttribute('fill-opacity',fillAlpha);
				if(lineWidth && lineWidth>0){
					shape.setAttribute('stroke',lineColor);
					shape.setAttribute('stroke-width',lineWidth);
					shape.setAttribute('stroke-opacity',lineAlpha);
				}
				
				// No need to draw more than 360
				if (Math.abs(endAngle) > 360) 
				{
						endAngle = 360;
				}
				
				numOfSegs = Math.ceil(Math.abs(endAngle-startAngle) / 45);
				segAngle = (endAngle-startAngle) / numOfSegs;
				segAngle = (segAngle / 180) * Math.PI;
				angle = (startAngle / 180) * Math.PI;
				/*
				if (endOuterRadius > 0) {
					outerRadiusInc = (endOuterRadius - outerRadius) / numOfSegs;
				}
				if (endInnerRadius > 0) {
					innerRadiusInc = (endInnerRadius - innerRadius) / numOfSegs;
				}
				*/
				
				// Calculate the wedge start point
				var startx = sx + Math.cos(angle) * innerRadius;
				var starty = sy + Math.sin(angle) * innerRadius;
				
				// Move the pen
				
				//shape.createSVGPathSegMovetoAbs(startx, starty);
				
				var dAttr = 'M '+startx+' '+starty;
				
				// Calculate the arc start point
				ax = sx + Math.cos(angle) * outerRadius;
				ay = sy + Math.sin(angle) * outerRadius;
				
				// Draw the first line
				//shape.createSVGPathSegLinetoAbs(ax, ay);
				dAttr += ' L '+ax+' '+ay;

				var i;
				for (i=0; i<numOfSegs; i++) 
				{
						angle += segAngle;
						angleMid = angle - (segAngle / 2);
						bx = sx + Math.cos(angle) * outerRadius;
						by = sy + Math.sin(angle) * outerRadius;
						cx = sx + Math.cos(angleMid) * (outerRadius / Math.cos(segAngle / 2));
						cy = sy + Math.sin(angleMid) * (outerRadius / Math.cos(segAngle / 2));
						//shape.createSVGPathSegCurvetoQuadraticSmoothAbs(cx, cy, bx, by);
						dAttr += ' Q '+cx+' '+cy+' '+bx+' '+by;
						//outerRadius += outerRadiusInc;
				}
			
			
				var endx,endy;	
				
				//if (innerRadius > 0 || endInnerRadius > 0) {
				if (innerRadius > 0) {
					/*
					if (endInnerRadius > 0) {
						innerRadius = endInnerRadius;
					}
					*/
					
					// Calculate the wedge end point
					endx = sx + Math.cos(angle) * innerRadius;
					endy = sy + Math.sin( angle) * innerRadius;
					
					// Point of return
					//shape.createSVGPathSegLinetoAbs(endx, endy);
					dAttr += ' L '+endx+' '+endy;
					
					for (i=0; i<numOfSegs; i++) 
					{
							angle -= segAngle;
							angleMid = angle + (segAngle / 2);
							bx = sx + Math.cos(angle) * innerRadius;
							by = sy + Math.sin(angle) * innerRadius;
							cx = sx + Math.cos(angleMid) * (innerRadius / Math.cos(segAngle / 2));
							cy = sy + Math.sin(angleMid) * (innerRadius / Math.cos(segAngle / 2));
							//shape.createSVGPathSegCurvetoQuadraticSmoothAbs(cx, cy, bx, by);
							dAttr += ' Q '+cx+' '+cy+' '+bx+' '+by;
							//innerRadius -= innerRadiusInc;
					}
				}else {
					// Calculate the wedge end point
					endx = sx + Math.cos(angle) * innerRadius;
					endy = sy + Math.sin( angle) * innerRadius;
					
					// Point of return
					//shape.createSVGPathSegLinetoAbs(endx, endy);
					dAttr += ' L '+endx+' '+endy;
				}
				
				//shape.createSVGPathSegClosePath();
				dAttr += ' z';
				
				shape.setAttribute('d',dAttr);
				
				
				return shape;
				
			};
			
			/**
			*	el:SVGDomElement	: the element to rotate
			*	begin:Number		: the start value in degrees
			*	end:Number			: the end value in degrees
			*	time:Number			: the total duration in seconds
			*	axis:Object(x,y)	: the point to rotate around, as an object with properties x and y
			*	loop:Number			: if 0, it is considered a loop
			*/
	smp.graphics.Svg.rotate = function(el,begin,end,time,axis,count){
				
				var anim = this.create('animateTransform');
				anim.setAttribute('attributeName','transform');
				anim.setAttribute('attributeType','XML');
				anim.setAttribute('type','rotate');
				var axispos = '';
				if(typeof axis == 'object' && axis.x && axis.y){
					axispos = ','+axis.x+','+axis.y;
				}
				anim.setAttribute('from',begin+axispos);
				anim.setAttribute('to',end+axispos);
				anim.setAttribute('dur',time.toString()+'s');
				anim.setAttribute('additive','replace');
				anim.setAttribute('fill','freeze');
				(count == 0) ? anim.setAttribute('repeatCount','indefinite') : anim.setAttribute('repeatCount','1');
				el.appendChild(anim);
				/*
				<animateTransform attributeName="transform" attributeType="XML"
                    type="scale" from="1" to="2" dur="5s"
                    additive="replace" fill="freeze" repeatCount="indefinite"/>
					*/
			};
	
}()); 