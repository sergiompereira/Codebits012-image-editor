(function(){
	
	/*
	Dependencies:
		smp.graphics.Svg
		smp.math.ColorUtils
	
	Usage:
		var preloader = new smp.ui.WedgePreloader(50,25,"cc9900",20,5,2);	
		document.getElementById("svgcont").appendChild(preloader);
	*/
	
	smp.createNamespace("smp.ui.WedgePreloader");
	
	
	smp.ui.WedgePreloader = (function()
	{
		var Constructor;
		
		/**
		* @param	radius				: Number
		* @param	thickness			: Number
		* @param	color				: String
		* @param	numberWedges		: Number
		* @param	gutter				: Number	space between wedges
		* @param	rotationTimeSpan	: Number	seconds
		* @param	parent				: html element to which append the svg element
		* @param	svg element
		*/
		
		Constructor = function(radius,thickness,color,numberWedges,gutter,rotationTimeSpan,parent)
		{
			var svgDoc = smp.graphics.Svg.createSVG(radius*2,radius*2);
			
			if(parent) parent.appendChild(svgDoc);
			if(thickness > radius) thickness = radius;
			var wedgeArc = 360/numberWedges-gutter;
			
			if(wedgeArc < 0) {
				gutter = 5; 
				wedgeArc = 360/numberWedges-gutter;
			}
			
			var g = smp.graphics.Svg.create("g")
			var dec = 1/numberWedges,alpha=1,b=1,i;
			
			for(i=0;i<360;i+=wedgeArc+gutter){
				
				g.appendChild( smp.graphics.Svg.createWedge(radius,radius,radius,radius-thickness,i,i+wedgeArc,color,alpha));
				alpha-=dec;
			}
			smp.graphics.Svg.rotate(g,0,360,rotationTimeSpan,{x:radius,y:radius},0);
			svgDoc.appendChild(g);

			return svgDoc;
			
		}
		
		Constructor.prototype = {
			//public properties
			
			version:"1.0"
			
			//public methods
			
		};
		
		return Constructor;
		
	}());
}());	