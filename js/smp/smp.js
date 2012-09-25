

(function(){

	if (typeof smp == "undefined" || !smp) {
	  
		smp = {};
	}

	/**
	* CORE
	*/

	if (typeof window.console == 'undefined') {
		window.console = {};
		window.console.log = function(msg) {
			return;
		};
	}

	function _createNamespace(sNamespace){
		var parts = sNamespace.split("."),
			parent = smp,
			i;
		
		if(parts[0] === "smp"){
			parts = parts.slice(1);
		}
		
		for(i=0; i<parts.length; i+=1){
			if(typeof parent[parts[i]] === "undefined"){
				parent[parts[i]] = {};
			}
			parent = parent[parts[i]];
		}
		return parent;
	};
	
	function _createModule(init,options)
	{
		
		var Constructor;
		
		
		Constructor = function()
		{
			if(init) init();
		}
		
		Constructor.prototype = {
			//public properties
			
			version:"1.1"
			
			//public methods
			
		};
		
		if(options)
			Constructor.prototype = _clone(options, Constructor.prototype);
		
		return Constructor;
		
	}


	//some utils
	smp.debugMode = true;
	smp.log = function(value){
		if(this.debugMode){
			window.console.log("smp log : "+value);
		}
	}


	/**
	* UTILS
	*/
	
	function _clone(parent, child){
		
		var child = child || {};
		var i, 
			toString = Object.prototype.toString, 
			astr = "[object Array]";
		
		
		function _copy(parent, child){
			
			for(i in parent){
				if(parent.hasOwnProperty(i)){
					if(typeof parent[i] === "object"){
						child[i] = (toString.call(parent[i])===astr) ? [] : {};
						_copy(parent[i], child[i]);
					}else{
						child[i] = parent[i];
					}
				}
			}
			return child;
		}
		
		_copy(parent,child);

		
		return child;

	}
	

	function _extend(parent, child){

		if(typeof parent === "function"){
			var child = child || function(){};
			
			//copy own properties (added to this.)
			child = smp.clone(parent, child);
			
			//copy prototype
			var proxyF = function(){};
			proxyF.prototype = parent.prototype;
			child.prototype = new proxyF();
			child.superPrototype = parent.prototype;
			child.prototype.constructor = child;
			
		}else{
			return null;
		}
		
		return child;
		
	}
	
	
	//static methods
	smp.createNamespace = _createNamespace;
	smp.createModule = _createModule;
	smp.clone = _clone;
	smp.extend = _extend;
	
	/**
	*	@see	: also json2.js
	*/
	smp.serialize = function(_obj)
	{
	   // Let Gecko browsers do this the easy way
	   if (typeof _obj.toSource !== 'undefined' && typeof _obj.callee === 'undefined')
	   {
		  return _obj.toSource();
	   }

	   // Other browsers must do it the hard way
	   switch (typeof _obj)
	   {
		  // numbers, booleans, and functions are trivial:
		  // just return the object itself since its default .toString()
		  // gives us exactly what we want
		  case 'number':
		  case 'boolean':
		  case 'function':
			 return _obj;
			 break;

		  // for JSON format, strings need to be wrapped in quotes
		  case 'string':
			 return '\'' + _obj + '\'';
			 break;

		  case 'object':
			 var str;
			 if (_obj.constructor === Array || typeof _obj.callee !== 'undefined')
			 {
				str = '[';
				var i, len = _obj.length;
				for (i = 0; i < len-1; i++) { str += serialize(_obj[i]) + ','; }
				str += serialize(_obj[i]) + ']';
			 }
			 else
			 {
				str = '{';
				var key;
				for (key in _obj) { str += key + ':' + serialize(_obj[key]) + ','; }
				str = str.replace(/\,$/, '') + '}';
			 }
			 return str;
			 break;

		  default:
			 return 'UNKNOWN';
			 break;
	   }

	}

	
	
	/**
	* 	@example	var teste = ["Portugal","Itália","Finlândia","Bulgária"];
	*				smp.each(teste,
	*					function(key,value){
	*						console.log(key+" // "+value);
	*					}, this
	*				);
	*/
	smp.each = function(obj,fnc,context){
		if(obj === null || obj === undefined) return;
		if(context === undefined) context = this;
		if(typeof obj == "object"){
			if(obj.length !== null && obj.length !== undefined){
				var length = obj.length;
				var i = 0;
				while(i<length){
					fnc.call(context, i, obj[i], obj);
					i++;
				}
			}else{
				var key;
				for(key in obj){
					//if (context.fnc === "function") {
						fnc.call(context, key, obj[key], obj);
					//}
				}
			}
		}
	}
	
		
	/**
	* @example smp.times(10, function(count){
	*					document.write("Hello! "+count.toString());
	*				});
	*/
	smp.times = function(number,callback){
		var i;
		for(i=0;i<number; i++){
			callback(i);
		}
	}
	
	smp.pullout = function(obj,fnc,context){
		if(obj === null || obj === undefined) return;
		if(context === undefined) context = this;
		if(typeof obj == "object"){
			if(obj.length !== null && obj.length !== undefined){
				var i,length = obj.length,item;
				for(i=0;i<length;i++){
					item = obj[i];
					if(fnc.call(context,i,item,obj) == false){
						obj.splice(i,1);
						length = obj.length;
						i-=1;
					}	
				}
				
			}else{
				var key;
				for(key in obj){
					//if (context.fnc === "function") {
						if(fnc.call(context, key, obj[key], obj) == false){
							obj[key] = null;
							delete obj[key];
						}
					//}
				}
			}
		}
	}
	
	///////////////
	/**
	* CLASS
	*/
	
	_createNamespace("smp.class");
	smp.class = _createModule();
	
	smp.class.extend = (function(){
	
		var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
		
		var proxy = function(){};
		
		/** 
			 The following method enables extending smp.class and whichever subclasses afterwards (this method is also inherited, see bellow)
				var myclass = smp.class.extend({
					log:function(value){console.log(value);}
				});
				var myclass2 = myclass.extend({
					log:function(value){ this._super("myclass2: "+value)}
				});
				var inst = new myclass2();
				inst.log("I am the first instance");
				

			 'prop' should be an object literal with the properties and methods that will be copied onto the new prototype.
			 Pass an 'init' function as initializer. It is a convention. If you call it other name, than invoke it explicitly after extending:
					var mySubclass = smp.class.extend({myInitializer:function(){...}});
					var inst = new mySubclass();
					inst.myInitializer();
					
			 Any instance specific properties or methods added to 'this.' should happen within those methods:
				var mysubclass = smp.class.extend(
					{
					 init:function(){
							var privateInstanceValue = "";
							this.publicInstanceValue = "";
							function privateInstanceMethod(){};
							this.publicInstanceMethod = function(){};
						},
					  publicPrototypeValue: "",
					  publicPrototypeMethod:function(){}
					}	
				);
			
			If you provide a new method with the same name as one in the superclass (overwriting it),
			you can invoke the super method within your new implementation with this._super();
			This includes obviously the init method: 
				var myclass = smp.class.extend({
					init:function(){
						//invokes the init method in the superclass
						this._super();
					}
				}
			
			Internal/private, common across instances, variables or methods are not possible here.
			Remember that they are achieved in anonymous closure functions. 
			You have to implement them yourself after extending:
			
			var subclass = (function(){
			
				//internal, instance independent, variables and methods
				var privateCommonVar = "";
				var privateCommonMethod = function(){};
				function privateCommonMethod(){
				};
				
				var _subclass = smp.class.extend({
					//create public getters if needed
					getMyPrivateVar : function(){
						return privateCommonVar;
					},
					privilegedMethod: privateCommonMethod
				});
				
				//create static properties and methods
				_subclass.staticProp = "";
				_sublcass.staticMethod = function(){};
				
				return _subclass;
			}());
				
			Any object or function can be passed as argument, but its properties and methods are passed by reference, they are not deep-copied. 
			So if you change them within the new sublclass, it will afect the original object, which might be a problem if it is in use elsewhere.
			Instead create a temporary deep-copy:
					var subClass = smp.class.extend(smp.clone(myComplexObjectInUse));
			
		*/
		
		var _extend = function(prop) {
		
			var _super = this.prototype;
		
			proxy.prototype = _super;
			var prototype = new proxy();
			
			for (var name in prop) {
				if(typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name])){
					prototype[name] = (function(name, fn){
							return function() {
									var tmp = this._super;
									this._super = _super[name];
									var success = fn.apply(this, arguments);
									this._super = tmp;
									return success;
								};
						})(name, prop[name])
				}else{
					prototype[name] = prop[name];
				}
			}
			
			_class.prototype = prototype;
			_class.parent = _super;
			_class.prototype.constructor = _class;
			_class.extend = arguments.callee;
			
			function _class() {
				if (this.init ) this.init.apply(this, arguments);
			}
			
			return _class;
		};
		
		return _extend;
		
	})();
		
	
	///////////////
	/**
	* DOM
	*/
	
	_createNamespace("smp.dom");
	smp.dom = _createModule();
	
	smp.dom.get = function(value){
		var value = smp.string.trim(value);
		var nvalue = value.substr(1);
		var fchar = value.substr(0,1);
		if(fchar == "#"){
			return document.getElementById(nvalue);
		}else if(fchar == "."){
			return document.getElementsByClassName(nvalue);
		}else{
			return document.getElementsByTagName(value);
		}
		return false;
	}

	smp.dom.html = function(obj, html){
	console.log(obj.innerHTML)
		if(obj.innerHTML !== null && obj.innerHTML !== undefined){
			obj.innerHTML = html;
			return true;
		}
		return false;
	}
	
	smp.dom.attr = function (obj, name, value){
		if(obj.setAttribute !== null && obj.setAttribute !== undefined && typeof obj.setAttribute === 'function'){
			obj.setAttribute(name,value);
			return true;
		}
		return false;
	}

	
	smp.dom.hide = function(obj){
		
		if(obj.style !== null && obj.style !== undefined){
			obj.style.display = "none";
		}
	}
	
	/**
	* TODO	: check the element tag and decide between block or inline
	*/
	smp.dom.show = function(obj){
		
		if(obj.style !== null && obj.style !== undefined){
			obj.style.display = "block";
		}
	}
	
	
	///////////////
	/**
	* BOM
	*/

	_createNamespace("smp.bom");
	smp.bom = _createModule();
	
	smp.bom.popup = function(url, name, width, height, left, top, resizable){
		
		return window.open(url,name,'width='+width+',height='+height+',left='+left+',top='+top+',resizable='+resizable);
	}

	
	//////////////////
	/**
	* MATH
	*/
	
	_createNamespace("smp.math");
	smp.math = _createModule();
	
	
	/**
     *  Round a number. By default the number is rounded to the nearest
     *  integer. Specifying a roundToInterval parameter allows you to round
     *  to the nearest of a specified interval.
     *  @param  number             The number you want to round.
     *  @param  nRoundToInterval   (optional) The interval to which you want to
     *                             round the number. The default is 1.
     *  @return                    The number rounded to the nearest interval.
	 *	@example alert(smp.math.round(10.347, 0.1));	//outputs 10.3
     */
    smp.math.round = function(nNumber, nRoundToInterval) {
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
   smp.math.floor  = function(nNumber, nRoundToInterval) {
    
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
    smp.math.ceil = function(nNumber, nRoundToInterval) {

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
    smp.math.random = function(nMinimum, nMaximum, nRoundToInterval) {

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
        return NumberUtilities.floor(nRandomNumber, nRoundToInterval);
      }
	  
	  
	smp.math.scale = function(valor, inMin , inMax , outMin , outMax) {
			return (valor - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
	}
	
	/**
	 * Considering a matrix with matrixHCount elements in each row,
	 * and an array that would store each of the matrix elements in a left to right and top bottom order,
	 * this method returns the index position in the array that stores the element at the matrix coordinates (x,y)
	 * @param	matrixHCount	: number of elements in each row of the matrix
	 * @param	x				: x position in the matrix grid
	 * @param 	y				: y position in the matrix grid
	 * @return					: index in the array
	 */
	smp.math.getIndexFromPoint = function(matrixHCount, x, y) {
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
	smp.math.getPointFromIndex = function(matrixHCount, index) {
		var point = {};
		var tx = (index % matrixHCount);
		point.x = Math.floor(tx);
		var subindex = (tx % 1) - 1;
		point.y = Math.floor(index/matrixHCount);
		return point;
	}
	
	//////////////////
	/**
	* STRING
	*/
	_createNamespace("smp.string");
	smp.string = _createModule();
	
	//static methods
	
	smp.string.trim = function(str)
	{
		var l=0; var r=str.length -1;
		while(l < str.length && smp.string.isWhitespace(str[l]))
		{	l++; }
		while(r > l && smp.string.isWhitespace(str[r]))
		{	r-=1;	}
		return str.substring(l, r+1);
	}
	
	smp.string.isWhitespace = function(ch) 
	{
		 return ch == '\r' || 
					ch == '\n' ||
					ch == '\f' || 
					ch == '\t' ||
					ch == ' '; 
    }
	
	smp.string.truncate = function(inputString, maxLength, appendedString) 
	{
			if (!appendedString) {
				appendedString = "...";
			}
			var ttext;
			
			if(inputString.length > maxLength){
				ttext = inputString.substr(0, maxLength);
				
				var j = ttext.length - 1;
				while (!smp.utils.StringUtilities.isWhitespace(ttext.charAt(j))) 
				{
					if (j > 0) {
						j--;
					}else {
						break;
					}
				}
				
				if(j == 0){
					var pos = inputString.search(" ");
					if(pos>0){
						ttext = inputString.substring(0, pos);
					}else {
						ttext = inputString;
					}
				}else{
					ttext = inputString.substring(0, j);
				}
				
				if(ttext != inputString){
					ttext+= appendedString;
				}	
			}else{
				ttext = inputString;
			}
			
			
			return ttext;
		
	}
    
	smp.string.wrap = function(originalString, maxLength) 
	{
		var chunkedString = [];
		var maxlen = maxLength;
		var start = 0;
		var processString = originalString;
		//var count = 40;
		
		if(originalString.length > maxLength){
			/*while(count>0){
			count--;*/
			while(start < processString.length){
				truncate();
			}
			
		}else{
			chunkedString.push(originalString);
			
		}
		
		return chunkedString;
		
		function truncate()
		{
			var tempString = processString.substr(start, maxlen);
			
			//se ainda existem pelo menos maxlen letras até ao fim da string
			if (tempString.length == maxlen)
			{
				var j = tempString.length - 1;
				while (!smp.utils.StringUtilities.isWhitespace(tempString.charAt(j))) 
				{
					
					if (j > 0) {
						j--;
					}else {
						break;
					}
				}
							
				if(j == 0){
				//não existirem brancos, procura o próximo mais adiante
					var pos = start + processString.substr(start).search(" ");
					
					if(pos > start-1){
						
						tempString = processString.substring(start, pos);
						start = pos + 1;
					}else{
						
						//se já náo existirem mais brancos, termina o processo
						tempString = processString.substr(start);
						start = processString.length;
					}
				}else{
					tempString = processString.substring(start, start+j);
					start = start + j + 1;
				}
				
			}else{
			//caso contrário, termina o processo
				start = processString.length;
			}
			chunkedString.push(tempString);
		}
		
	}
	
	
	smp.string.generateKey = function(length) 
	{
	
	  // start with a blank password
	  var password = "";

	  // define possible characters
	  var possible = "0123456789abcdefghjkmnpqrstvwxyz"; 
		
	  // set up a counter
	  var i = 0, char; 

	  // add random characters to $password until $length is reached
	  while (i < length) { 

		// pick a random character from the possible ones
		char = possible.substr(Math.round(Math.random()*(possible.length-1)), 1);
			
		// we don't want this character if it's already in the password
		if (password.indexOf(char)==-1) { 
		  password += char;
		  i++;
		}

	  }

	  // done!
	  return password;

	}
	
	smp.string.stripHTML = function(str){
		return str.replace(/<(?:.|\s)*?>/g, ' ');
	}
	
	//////////////////
	/**
	* DATE
	*/
	_createNamespace("smp.date");
	smp.date = _createModule();
	
	//static methods
	smp.date.print = function(date) {
		
		function pad2(number) { return (number < 10 ? '0' : '') + number };
		
		var dt = new Date();
		if(date){
			dt = date;
		}
		
		var dtstring = dt.getFullYear()
			+ '-' + pad2(dt.getMonth()+1)
			+ '-' + pad2(dt.getDate())
			+ ' ' + pad2(dt.getHours())
			+ ':' + pad2(dt.getMinutes())
			+ ':' + pad2(dt.getSeconds());
			
			return dtstring;
	}
	
	
	smp.date.getClock = function(miliseconds, leftzero)
	{
		var c,s,m,h,d,r;
		var roundfnc;
		if(miliseconds >= 0){
			roundfnc = Math.floor;
		}else{
			roundfnc = Math.ceil;
		}
			d = roundfnc(miliseconds / 86400000);
			r = miliseconds % 86400000;
			h = roundfnc(r / 3600000);
			r = r % 3600000;
			m = roundfnc(r / 60000);
			r = r % 60000;
			s = roundfnc(r / 1000);
			r = r % 1000;
			c = roundfnc(r / 10);
			
			d = d.toString();
			h = h.toString();
			m = m.toString();
			s = s.toString();
			c = c.toString().substr(0,2);
			
			if(leftzero){
				if (c.length == 1) {
					c = "0" + c;
				}
				if (s.length == 1) {
					s = "0" + s;
				}
				if (m.length == 1) {
					m = "0" + m;
				}
				if (h.length == 1) {
					h = "0" + h;
				}
				if (d.length == 1) {
					d = "0" + d;
				}
			}
			
			return {
					day:d,
					hour:h,
					min:m,
					sec:s,
					csec:c
					};

	}
	
	//////////////////
	/**
	* EVENTS
	*/
	
	_createNamespace("smp.events");
	smp.events = _createModule();
	
	
	var EventDispatcher = (function(){

		var Constructor;
	
		Constructor = function()
		{
			var listeners = [];
			
			
			//private
			//event object
			function CustomEvent(){
				this.name = "";
				this.data = {};
				this.target = undefined;
			}
			
			function _dispatchEvent(name, data)
			{
				var j, eventObj;
				for(j=0; j<listeners.length; j++){
					if(listeners[j][0] == name){
						if(typeof listeners[j][1] === "function"){
							eventObj = new CustomEvent();
							eventObj.name = name;
							eventObj.data = data;
							eventObj.target = listeners[j][2];
							if(eventObj.target !== undefined){
								listeners[j][1].apply(eventObj.target, eventObj);
							}else{
								listeners[j][1](eventObj);
							}
							
							//do not return or break
							//because there might be other listeners with the same callback
							
						}
					}
				}
			}
			
			//protected
			function _addEventListener(name,callback, context){
				listeners.push([name,callback, context]);
			}
			function _removeEventListener(name, callback){
				var j;
				for(j=0; j<listeners.length; j++){
					if(listeners[j][0] == name && listeners[j][1] == callback){
						listeners.splice(j,1);
						//no break is used because there might have been redundancy of listeners
					}
				}
			}
			
			function _extend(inheritedObj){
				var inheritedObj = inheritedObj || {};
				var i, 
					toString = Object.prototype.toString, 
					astr = "[object Array]";
				
				
				function _extendCycle(superObj, inheritedObj){
					
					for(i in superObj){
						if(superObj.hasOwnProperty(i)){
							if(typeof superObj[i] === "object"){
								inheritedObj[i] = (toString.call(superObj[i])===astr) ? [] : {};
								_extendCycle(superObj[i], inheritedObj[i]);
							}else{
								inheritedObj[i] = superObj[i];
							}
						}
					}
					return inheritedObj;
				}
				
				_extendCycle(this,inheritedObj);
				
				return inheritedObj;
			
			}
			
			//public
			this.addEventListener = _addEventListener;
			this.removeEventListener = _removeEventListener;
			this.dispatchEvent = _dispatchEvent;
			this.extend = _extend;
				
				
		};
		
		return Constructor;
		
	}());
	var eventDispatcher = new EventDispatcher();
	
	//static methods
	smp.events.create = function() {
		return new EventDispatcher();
	}
	smp.events.extend = function(obj) {
		obj = eventDispatcher.extend(obj);
	}
	
	//////////////////
	/**
	* URL
	*/
	
	_createNamespace("smp.url");
	smp.url = _createModule();
	
	//static methods
	smp.url.params = function()
	{
		var qsParm = new Array();
        var query = '';
        var fullURL = window.document.URL;
        if (fullURL.indexOf('?') > 0) {
            query = fullURL.substring(fullURL.indexOf('?')+1, fullURL.length);
            query = unescape(query);
        }
		var parms = query.split('&');
		for (var i=0; i<parms.length; i++) {
			var pos = parms[i].indexOf('=');
			if (pos > 0) {
				var key = parms[i].substring(0,pos);
				var val = parms[i].substring(pos+1);
				qsParm[key] = val;
			}
		}
        return (qsParm);
	}
	
	
	//////////////////
	/**
	* GEOMETRY
	*/
	
	_createNamespace("smp.geom");
	smp.geom = _createModule();
	
	 /**
     *  Round a number. By default the number is rounded to the nearest
     *  integer. Specifying a roundToInterval parameter allows you to round
     *  to the nearest of a specified interval.
     *  @param  number             The number you want to round.
     *  @param  nRoundToInterval   (optional) The interval to which you want to
     *                             round the number. The default is 1.
     *  @return                    The number rounded to the nearest interval.
     */
    smp.geom.distance = function(x1, y1, x2, y2) 
    {
    	var dx = x1 - x2;
		var dy = y1 - y2;
		return Math.sqrt(dx*dx+dy*dy);
    }
    
    smp.geom.distance3 = function(x1, y1, z1, x2, y2, z2) 
    {
		var dxz = smp.geom.GeometryUtils.distance(x1, z1, x2, z2);
		var dy = y1 - y2;
		return Math.sqrt(dxz*dxz+dy*dy);
    }
    
	
	
}());
