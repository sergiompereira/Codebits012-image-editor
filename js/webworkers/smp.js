

(function(){

	if (typeof smp == "undefined" || !smp) {
	  
		smp = {};
	}

	/**
	* CORE
	*/
	
	var console = {};
	console.log = function(message) {
		postMessage({"type":"debug", "message":message});
		
	};

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
			console.log("smp log : "+value);
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
		
}());