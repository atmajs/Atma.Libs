(function(globals){
	
	
	// source /src/license.txt
/*!
 * ClassJS v%VERSION%
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, %YEAR% Atma.js and other contributors
 */
// end:source /src/license.txt
// source /src/umd.js
(function(root, factory){
	"use strict";

	var _global = typeof window === 'undefined' || window.navigator == null
			? global
			: window
			,
		_exports
		;

    
	_exports = root || _global;
    

    function construct(){

        return factory(_global, _exports);
    };

    
    if (typeof define === 'function' && define.amd) {
        return define(construct);
    }
    
	// Browser OR Node
    construct();
	
	if (typeof module !== 'undefined') 
		module.exports = _exports.Class;
	
}(this, function(global, exports){
	"use strict";
// end:source /src/umd.js
	
	// source /src/vars.js
	var _Array_slice = Array.prototype.slice,
		_Array_sort = Array.prototype.sort,
		
		_cfg = {
			ModelHost: null, // @default: Class.Model
		};
		
	
	var str_CLASS_IDENTITY = '__$class__';
	// end:source /src/vars.js
	
	// source /src/util/is.js
	var is_Function,
		is_Object,
		is_Array,
		is_ArrayLike,
		is_String,
		is_Date,
		is_notEmptyString,
		is_rawObject,
		is_NullOrGlobal;
	(function(){
	
		is_Function = function(x) {
			return typeof x === 'function';
		};
		is_Object = function(x) {
			return x != null
				&&  typeof x === 'object';
		};
		is_Date = function(x){
			return x != null
				&& x.constructor.name === 'Date'
				&& x instanceof Date;
		};
		is_Array = function(x) {
			return x != null
				&& typeof x.length === 'number'
				&& typeof x.slice === 'function';
		};
		is_ArrayLike = is_Array;
		
		is_String = function(x) {
			return typeof x === 'string';
		};
		
		is_notEmptyString = function(x) {
			return typeof x === 'string'
				&& x !== '';
		};
		
		is_rawObject = function(obj) {
			if (obj == null) 
				return false;
			
			if (typeof obj !== 'object')
				return false;
			
			return obj.constructor === Object;
		};
		is_NullOrGlobal = function(ctx){
			return ctx === void 0 || ctx === global;
		};
		
	}());
	
	// end:source /src/util/is.js
	// source /src/util/array.js
	var arr_each,
		arr_isArray,
		arr_remove
		;
		
	(function(){
	
		arr_each = function(array, callback) {
			
			if (arr_isArray(array)) {
				for (var i = 0, imax = array.length; i < imax; i++){
					callback(array[i], i);
				}
				return;
			}
			
			callback(array);
		};
		
		arr_isArray = function(array) {
			return array != null
				&& typeof array === 'object'
				&& typeof array.length === 'number'
				&& typeof array.splice === 'function';
		};
		
		arr_remove = function(array, fn){
			var imax = array.length,
				i = -1;
			while ( ++i < imax){
				if (fn(array[i]) === true) {
					array.splice(i, 1);
					i--;
					imax--;
				}
			}
		};
		
		/* polyfill */
		if (typeof Array.isArray !== 'function') {
			Array.isArray = function(array){
				if (array instanceof Array){
					return true;
				}
				
				if (array == null || typeof array !== 'object') {
					return false;
				}
				
				
				return array.length !== void 0 && typeof array.slice === 'function';
			};
		}
		
	}());
	
	// end:source /src/util/array.js
	// source /src/util/class.js
	var class_register,
		class_get,
		
		class_patch,
		
		class_stringify,
		class_parse,
		class_properties
		
		;
	
	(function(){
		
		class_register = function(namespace, class_){
			
			obj_setProperty(
				_cfg.ModelHost || Class.Model,
				namespace,
				class_
			);
		};
		
		class_get = function(namespace){
			
			return obj_getProperty(
				_cfg.ModelHost || Class.Model,
				namespace
			);
		};
		
		class_patch = function(mix, Proto){
			
			var class_ = is_String(mix)
				? class_get(mix)
				: mix
				;
				
			// if DEBUG
			!is_Function(class_)
				&& console.error('<class:patch> Not a Function', mix);
			// endif
				
			Proto.Base = class_;
			
			class_ = Class(Proto);
			
			if (is_String(mix)) 
				class_register(mix, class_);
			
			return class_;
		};
		
		class_stringify = function(class_){
			
			return JSON.stringify(class_, stringify);
		};
		
		class_parse = function(str){
			
			return JSON.parse(str, parse);
		};
		
		class_properties = function(Ctor) {
			return getProperties(Ctor);
		};
		
		// private
		
		function stringify(key, val) {
			
			if (val == null || typeof val !== 'object') 
				return val;
			
			var current = this,
				obj = current[key]
				;
			
			if (obj[str_CLASS_IDENTITY] && obj.toJSON) {
				
				return stringifyMetaJSON(obj[str_CLASS_IDENTITY], val)
				
				////val[str_CLASS_IDENTITY] = obj[str_CLASS_IDENTITY];
				////return val;
			}
			
			
			return val;
		}
		
		function stringifyMetaJSON(className, json){
			var out = {};
			out['json'] = json;
			out[str_CLASS_IDENTITY] = className;
			
			return out;
		}
		
		function parse(key, val) {
			
			var Ctor;
			
			if (val != null && typeof val === 'object' && val[str_CLASS_IDENTITY]) {
				Ctor = Class(val[str_CLASS_IDENTITY]);
			
				if (typeof Ctor === 'function') {
					
					val = new Ctor(val.json);
				} else {
					
					console.error('<class:parse> Class was not registered', val[str_CLASS_IDENTITY]);
				}
			}
			
			return val;
		}
		
		function getProperties(proto, out){
			if (typeof proto === 'function')
				proto = proto.prototype;
			
			if (out == null) 
				out = {};
			
			var type,
				key,
				val;
	        for(key in proto){
				val = proto[key];
	            type = val == null
					? null
					: typeof val
					;
					
	            if (type === 'function')
					continue;
				
				var c = key.charCodeAt(0);
				if (c === 95 && key !== '_id')
					// _
					continue;
				
				if (c >= 65 && c <= 90)
					// A-Z
					continue;
				
				if (type === 'object') {
					var ctor = val.constructor,
						ctor_name = ctor && ctor.name
						;
					
					if (ctor_name !== 'Object' && ctor_name && global[ctor_name] === ctor) {
						// built-in objects
						out[key] = ctor_name;
						continue;
					}
					
					out[key] = getProperties(val);
					continue;
				}
				
	            out[key] = type;
	        }
	        
	        if (proto.__proto__) 
	            getProperties(proto.__proto__, out);
	        
	        return out;
	    }
		
	}());
	// end:source /src/util/class.js
	// source /src/util/proto.js
	var class_inherit,
		class_inheritStatics,
		class_extendProtoObjects
		;
	
	(function(){
		
		var PROTO = '__proto__';
		
		var _toString = Object.prototype.toString,
			_isArguments = function(args){
				return _toString.call(args) === '[object Arguments]';
			};
		
		
		class_inherit = PROTO in Object.prototype
			//? inherit_Object_create
			? inherit
			: inherit_protoLess
			;
		
		class_inheritStatics = function(_class, mix){
			if (mix == null) 
				return;
			
			if (is_ArrayLike(mix)) {
				var i = mix.length;
				while ( --i > -1 ) {
					class_inheritStatics(_class, mix[i]);
				}
				return;
			}
			
			var Static;
			if (is_Function(mix)) 
				Static = mix;
			else if (is_Object(mix.Static)) 
				Static = mix.Static;
			
			
			if (Static == null)
				return;
			
			obj_extendDescriptorsDefaults(_class, Static);
		};
		
		
		class_extendProtoObjects = function(proto, _base, _extends){
			var key,
				protoValue;
				
			for (key in proto) {
				protoValue = proto[key];
				
				if (!is_rawObject(protoValue))
					continue;
				
				if (_base != null){
					if (is_rawObject(_base.prototype[key])) 
						obj_defaults(protoValue, _base.prototype[key]);
				}
				
				if (_extends != null) {
					arr_each(_extends, function(x){
						x = proto_getProto(x);
						
						if (is_rawObject(x[key])) 
							obj_defaults(protoValue, x[key]);
					});
				}
			}
		}
		
		// PRIVATE
		function proto_extend(proto, source) {
			if (source == null) 
				return;
			
			if (typeof proto === 'function') 
				proto = proto.prototype;
			
			if (typeof source === 'function') 
				source = source.prototype;
			
			var key, val;
			for (key in source) {
				if (key === 'constructor') 
					continue;
				
				val = source[key];
				if (val != null) 
					proto[key] = val;
			}
		}
		
		function proto_override(super_, fn) {
	        var proxy;
			
			if (super_) {
				proxy = function(mix){
					
					var args = arguments.length === 1 && _isArguments(mix)
						? mix
						: arguments
						;
					
					return  fn_apply(super_, this, args);
				}
			} else{
				proxy = fn_doNothing;
			}
			
	        
	        return function(){
	            this['super'] = proxy;
	            
	            return fn_apply(fn, this, arguments);
	        };
	    }
	
		function inherit(_class, _base, _extends, original, _overrides, defaults) {
			var prototype = original,
				proto = original;
	
			prototype.constructor = _class.prototype.constructor;
	
			if (_extends != null) {
				proto[PROTO] = {};
	
				arr_each(_extends, function(x) {
					proto_extend(proto[PROTO], x);
				});
				proto = proto[PROTO];
			}
	
			if (_base != null) 
				proto[PROTO] = _base.prototype;
			
			for (var key in defaults) {
				if (prototype[key] == null) 
					prototype[key] = defaults[key];
			}
			for (var key in _overrides) {
				prototype[key] = proto_override(prototype[key], _overrides[key]);
			}
			
			
			_class.prototype = prototype;
		}
		function inherit_Object_create(_class, _base, _extends, original, _overrides, defaults) {
			
			if (_base != null) {
				_class.prototype = Object.create(_base.prototype);
				obj_extendDescriptors(_class.prototype, original);
			} else {
				_class.prototype = Object.create(original);
			}
			
			_class.prototype.constructor = _class;
			
			if (_extends != null) {
				arr_each(_extends, function(x) {
					obj_defaults(_class.prototype, x);
				});
			}
			
			var proto = _class.prototype;
			obj_defaults(proto, defaults);
			for (var key in _overrides) {
				proto[key] = proto_override(proto[key], _overrides[key]);
			}
		}
	
	
		// browser that doesnt support __proto__ 
		function inherit_protoLess(_class, _base, _extends, original, _overrides, defaults) {
			
			if (_base != null) {
				var tmp = function() {};
	
				tmp.prototype = _base.prototype;
	
				_class.prototype = new tmp();
				_class.prototype.constructor = _class;
			}
			
			if (_extends != null) {
				arr_each(_extends, function(x) {
					
					delete x.constructor;
					proto_extend(_class, x);
				});
			}
			
			var prototype = _class.prototype;
			obj_defaults(prototype, defaults);
			
			for (var key in _overrides) {
				prototype[key] = proto_override(prototype[key], _overrides[key]);
			}
			proto_extend(_class, original); 
		}
		
			
		function proto_getProto(mix) {
			
			return is_Function(mix)
				? mix.prototype
				: mix
				;
		}
		
	}());
	// end:source /src/util/proto.js
	// source /src/util/json.js
	// Create from Complex Class Instance a lightweight json object
	
	var json_key_SER = '__$serialization',
		json_proto_toJSON,
		json_proto_arrayToJSON
		;
		
	(function(){
		
		json_proto_toJSON = function(serialization){
			
			var object = this,
				json = {},
				
				key, val, s;
				
			if (serialization == null) 
				serialization = object[json_key_SER];
			
			
			var asKey;
			
			for(key in object){
				asKey = key;
				
				if (serialization != null && serialization.hasOwnProperty(key)) {
					s = serialization[key];
					if (s != null && typeof s === 'object') {
						
						if (s.key) 
							asKey = s.key;
							
						if (s.hasOwnProperty('serialize')) {
							if (s.serialize == null) 
								continue;
							
							json[asKey] = s.serialize(object[key]);
							continue;
						}
						
					}
				}
				
				// _ (private)
				if (key.charCodeAt(0) === 95)
					continue;
	
				if ('Static' === key || 'Validate' === key)
					continue;
	
				val = object[key];
	
				if (val == null)
					continue;
				
				if ('_id' === key) {
					json[asKey] = val;
					continue;
				}
	
				switch (typeof val) {
					case 'function':
						continue;
					case 'object':
						
						if (is_Date(val)) 
							break;
						
						var toJSON = val.toJSON;
						if (toJSON == null) 
							break;
						
						json[asKey] = val.toJSON();
						continue;
						//@removed - serialize any if toJSON is implemented
						//if (toJSON === json_proto_toJSON || toJSON === json_proto_arrayToJSON) {
						//	json[asKey] = val.toJSON();
						//	continue;
						//}
						
						break;
				}
	
				json[asKey] = val;
			}
			
			// make mongodb's _id property not private
			if (object._id != null)
				json._id = object._id;
			
			return json;	
		};
		
		json_proto_arrayToJSON =  function() {
			var array = this,
				imax = array.length,
				i = 0,
				output = new Array(imax),
				
				x;
	
			for (; i < imax; i++) {
	
				x = array[i];
				
				if (x != null && typeof x === 'object') {
					
					var toJSON = x.toJSON;
					if (toJSON === json_proto_toJSON || toJSON === json_proto_arrayToJSON) {
						
						output[i] = x.toJSON();
						continue;
					}
					
					if (toJSON == null) {
						
						output[i] = json_proto_toJSON.call(x);
						continue;
					}
				}
				
				output[i] = x;
			}
	
			return output;
		};
		
	}());
	// end:source /src/util/json.js
	// source /src/util/object.js
	
	var obj_inherit,
		obj_getProperty,
		obj_setProperty,
		obj_defaults,
		obj_extend,
		obj_extendDescriptors,
		obj_extendDescriptorsDefaults,
		obj_validate
		;
	
	(function(){
		
		obj_inherit = function(target /* source, ..*/ ) {
			if (is_Function(target)) 
				target = target.prototype;
			
			var i = 1,
				imax = arguments.length,
				source, key;
			for (; i < imax; i++) {
		
				source = is_Function(arguments[i])
					? arguments[i].prototype
					: arguments[i]
					;
		
				for (key in source) {
					
					if ('Static' === key) {
						if (target.Static != null) {
							
							for (key in source.Static) {
								target.Static[key] = source.Static[key];
							}
							
							continue;
						}
					}
					
					
					target[key] = source[key];
					
				}
			}
			return target;
		};
		
		obj_getProperty = function(obj, property) {
			var chain = property.split('.'),
				imax = chain.length,
				i = -1;
			while ( ++i < imax ) {
				if (obj == null) 
					return null;
				
				obj = obj[chain[i]];
			}
			return obj;
		};
		
		obj_setProperty = function(obj, property, value) {
			var chain = property.split('.'),
				imax = chain.length,
				i = -1,
				key;
		
			while ( ++i <  imax - 1) {
				key = chain[i];
				
				if (obj[key] == null) 
					obj[key] = {};
				
				obj = obj[key];
			}
		
			obj[chain[i]] = value;
		};
		
		obj_defaults = function(target, defaults) {
			for (var key in defaults) {
				if (target[key] == null) 
					target[key] = defaults[key];
			}
			return target;
		};
		
		obj_extend = function(target, source) {
			if (target == null) 
				target = {};
			if (source == null) 
				return target;
			
			var val,
				key;
			for(key in source) {
				val = source[key];
				if (val != null) 
					target[key] = val;
			}
			return target;
		};
		
		(function(){
			var getDescr = Object.getOwnPropertyDescriptor,
				define = Object.defineProperty;
			
			if (getDescr == null) {
				obj_extendDescriptors = obj_extend;
				obj_extendDescriptorsDefaults = obj_defaults;
				return;
			}
			obj_extendDescriptors = function(target, source){
				return _extendDescriptors(target, source, false);
			};
			obj_extendDescriptorsDefaults = function(target, source){
				return _extendDescriptors(target, source, true);
			};
			function _extendDescriptors (target, source, defaultsOnly) {
				if (target == null) 
					return {};
				if (source == null) 
					return source;
				
				var descr,
					key;
				for(key in source){
					if (defaultsOnly === true && target[key] != null) 
						continue;
					
					descr = getDescr(source, key);
					if (descr == null) {
						obj_extendDescriptors(target, source['__proto__']);
						continue;
					}
					if (descr.value !== void 0) {
						target[key] = descr.value;
						continue;
					}
					define(target, key, descr);
				}
				return target;
			};
		}());
		
		
		(function(){
			
			obj_validate = function(a /*, b , ?isStrict, ?property, ... */) {
				if (a == null) 
					return Err_Invalid('object');
				
				_props = null;
				_strict = false;
				
				var i = arguments.length,
					validator, x;
				while (--i > 0) {
					x = arguments[i];
					switch(typeof x){
						case 'string':
							if (_props == null) 
								_props = {};
							_props[x] = 1;
							continue;
						case 'boolean':
							_strict = x;
							continue;
						case 'undefined':
							continue;
						default:
							if (i !== 1) {
								return Err_Invalid('validation argument at ' + i)
							}
							validator = x;
							continue;
					}
				}
				if (validator == null) 
					validator = a.Validate;
				if (validator == null)
					// if no validation object - accept any.
					return null;
				
				return checkObject(a, validator, a);
			};
			
			// private
			
				// unexpect in `a` if not in `b`
			var _strict = false,
				// validate only specified properties
				_props = null;
			
			// a** - payload
			// b** - expect
			// strict - 
			function checkObject(a, b, ctx) {
				var error,
					optional,
					key, aVal, aKey;
				for(key in b){
					
					if (_props != null && a === ctx && _props.hasOwnProperty(key) === false) {
						continue;
					}
					
					switch(key.charCodeAt(0)) {
						case 63:
							// ? (optional)
							aKey = key.substring(1);
							aVal = a[aKey];
							//! accept falsy value
							if (!aVal) 
								continue;
							
							error = checkProperty(aVal, b[key], ctx);
							if (error != null) {
								error.setInvalidProperty(aKey);
								return error;
							}
							
							continue;
						case 45:
							// - (unexpect)
							aKey = key.substring(1);
							if (typeof a === 'object' && aKey in a) 
								return Err_Unexpect(aKey);
						
							continue;
					}
						
					aVal = a[key];
					if (aVal == null) 
						return Err_Expect(key);
					
					
					error = checkProperty(aVal, b[key], ctx);
					if (error != null) {
						error.setInvalidProperty(key);
						return error;
					}
				}
				
				if (_strict) {
					for(key in a){
						if (key in b || '?' + key in b) 
							continue;
						
						return Err_Unexpect(key);
					}
				}
			}
			
			function checkProperty(aVal, bVal, ctx) {
				if (bVal == null) 
					return null;
				
				if (typeof bVal === 'function') {
					var error = bVal.call(ctx, aVal);
					if (error == null || error === true) 
						return null;
					
					if (error === false) 
						return Err_Invalid();
					
					return Err_Custom(error);
				}
				
				if (aVal == null) 
					return Err_Expect();
				
				if (typeof bVal === 'string') {
					var str = 'string',
						num = 'number',
						bool = 'boolean'
						;
					
					switch(bVal) {
						case str:
							return typeof aVal !== str || aVal.length === 0
								? Err_Type(str)
								: null;
						case num:
							return typeof aVal !== num
								? Err_Type(num)
								: null;
						case bool:
							return typeof aVal !== bool
								? Err_Type(bool)
								: null;
					}
				}
				
				if (bVal instanceof RegExp) {
					return bVal.test(aVal) === false
						? Err_Invalid()
						: null;
				}
				
				if (Array.isArray(bVal)) {
					if (Array.isArray(aVal) === false) 
						return Err_Type('array');
					
					var i = -1,
						imax = aVal.length,
						error;
					while ( ++i < imax ){
						error = checkObject(aVal[i], bVal[0])
						
						if (error) {
							error.setInvalidProperty(i);
							return error;
						}
					}
					
					return null;
				}
				
				if (typeof aVal !== typeof bVal) 
					return Err_Type(typeof aVal);
				
				
				if (typeof aVal === 'object') 
					return checkObject(aVal, bVal);
				
				return null;
			}
			
			var Err_Type,
				Err_Expect,
				Err_Unexpect,
				Err_Custom,
				Err_Invalid
				;
			(function(){
				
				Err_Type = create('type',
					function TypeErr(expect) {
						this.expect = expect;
					},
					{
						toString: function(){
							return 'Invalid type.'
								+ (this.expect
								   ? ' Expect: ' + this.expect
								   : '')
								+ (this.property
								   ? ' Property: ' + this.property
								   : '')
								;
						}
					}
				);
				Err_Expect = create('expect',
					function ExpectErr(property) {
						this.property = property;
					},
					{
						toString: function(){
							return 'Property expected.'
								+ (this.property
								   ? '`' + this.property + '`'
								   : '')
								;
						}
					}
				);
				Err_Unexpect = create('unexpect',
					function UnexpectErr(property) {
						this.property = property;
					},
					{
						toString: function(){
							return 'Unexpected property'
								+ (this.property
								   ? '`' + this.property + '`'
								   : '')
								;
						}
					}
				);
				Err_Custom = create('custom',
					function CustomErr(error) {
						this.error = error
					},
					{
						toString: function(){
							return 'Custom validation: '
								+ this.error
								+ (this.property
								    ? ' Property: ' + this.property
									: '')
								;
						}
					}
				);
				Err_Invalid = create('invalid',
					function InvalidErr(expect) {
						this.expect = expect
					}, {
						toString: function(){
							return 'Invalid.'
								+ (this.expect
									? ' Expect: ' + this.expect
									: '')
								+ (this.property
									? ' Property: ' + this.property
									: '')
								;
						}
					}
				);
				
				function create(type, Ctor, proto) {
					proto.type = type;
					proto.property = null;
					proto.setInvalidProperty = setInvalidProperty;
					
					Ctor.prototype = proto;
					return function(mix){
						return new Ctor(mix);
					}
				}
				function setInvalidProperty(prop){
					if (this.property == null) {
						this.property = prop;
						return;
					}
					this.property = prop + '.' + this.property;
				}
			}()); /*< Errors */
			
		}());
	}());
	// end:source /src/util/object.js
	// source /src/util/patchObject.js
	var obj_patch,
		obj_patchValidate;
	
	(function(){
		
		obj_patch = function(obj, patch){
			
			for(var key in patch){
				
				var patcher = patches[key];
				if (patcher) 
					patcher[fn_WALKER](obj, patch[key], patcher[fn_MODIFIER]);
				else
					console.error('Unknown or not implemented patcher', key);
			}
			return obj;
		};
		
		obj_patchValidate = function(patch){
			if (patch == null) 
				return 'Undefined';
			
			var has = false;
			for(var key in patch){
				has = true;
				
				if (patches[key] == null) 
					return 'Unsupported patcher: ' + key;
			}
			if (has === false) 
				return 'No data';
			
			return null;
		};
		
		// === private
		
		function walk_mutator(obj, data, fn) {
			for (var key in data) 
				fn(obj_getProperty(obj, key), data[key], key);
			
		}
		
		function walk_modifier(obj, data, fn){
			for(var key in data)
				obj_setProperty(
					obj,
					key,
					fn(obj_getProperty(obj, key), data[key], key)
				);
		}
		
		function fn_IoC(){
			var fns = arguments;
			return function(val, mix, prop){
				for (var i = 0, fn, imax = fns.length; i < imax; i++){
					fn = fns[i];
					if (fn(val, mix, prop) === false) 
						return;
				}
			}
		}
		
		function arr_checkArray(val, mix, prop) {
			if (arr_isArray(val) === false) {
				// if DEBUG
				console.warn('<patch> property is not an array', prop);
				// endif
				return false;
			}
		}
		
		function arr_push(val, mix, prop){
			if (mix.hasOwnProperty('$each')) {
				for (var i = 0, imax = mix.$each.length; i < imax; i++){
					val.push(mix.$each[i]);
				}
				return;
			}
			val.push(mix);
		}
		
		function arr_pop(val, mix, prop){
			 val[mix > 0 ? 'pop' : 'shift']();
		}
		function arr_pull(val, mix, prop) {
			arr_remove(val, function(item){
				return query_match(item, mix);
			});
		}
		
		function val_inc(val, mix, key){
			return val + mix;
		}
		function val_set(val, mix, key){
			return mix;
		}
		function val_unset(){
			return void 0;
		}
		
		function val_bit(val, mix){
			if (mix.or) 
				return val | mix.or;
			
			if (mix.and) 
				return val & mix.and;
			
			return val;
		}
		
		var query_match;
		(function(){
			/** @TODO improve object matcher */
			query_match = function(obj, mix){
				for (var key in mix) {
					if (obj[key] !== mix[key]) 
						return false;
				}
				return true;
			};
		}());
		
		
		var fn_WALKER = 0,
			fn_MODIFIER = 1
			;
			
		var patches = {
			'$push': [walk_mutator, fn_IoC(arr_checkArray, arr_push)],
			'$pop':  [walk_mutator, fn_IoC(arr_checkArray, arr_pop)],
			'$pull': [walk_mutator, fn_IoC(arr_checkArray, arr_pull)],
			
			'$inc':   [walk_modifier, val_inc],
			'$set':   [walk_modifier, val_set],
			'$unset': [walk_modifier, val_unset],
			'$bit':   [walk_modifier, val_unset],
		};
		
		
		
	}());
	// end:source /src/util/patchObject.js
	// source /src/util/function.js
	var fn_proxy,
		fn_apply,
		fn_createDelegate,
		fn_doNothing,
		fn_argsId
		;
		
	(function(){
	
		fn_proxy = function(fn, ctx) {
			return function() {
				return fn_apply(fn, ctx, arguments);
			};
		};
		
		fn_apply = function(fn, ctx, _arguments){
			switch (_arguments.length) {
				case 0:
					return fn.call(ctx);
				case 1:
					return fn.call(ctx, _arguments[0]);
				case 2:
					return fn.call(ctx,
						_arguments[0],
						_arguments[1]);
				case 3:
					return fn.call(ctx,
						_arguments[0],
						_arguments[1],
						_arguments[2]);
				case 4:
					return fn.call(ctx,
						_arguments[0],
						_arguments[1],
						_arguments[2],
						_arguments[3]);
				case 5:
					return fn.call(ctx,
						_arguments[0],
						_arguments[1],
						_arguments[2],
						_arguments[3],
						_arguments[4]
						);
			};
			return fn.apply(ctx, _arguments);
		};
		
		fn_createDelegate = function(fn /* args */) {
			var args = _Array_slice.call(arguments, 1);
			return function(){
				if (arguments.length > 0) 
					args = args.concat(_Array_slice.call(arguments));
				
				return fn_apply(fn, null, args);
			};
		};
		
		fn_doNothing = function(){};
		
		fn_argsId = function(args, cache){
			if (args.length === 0)
				return 0;
			
			var imax = cache.length,
				i = -1;
			while( ++i < imax ){
				if (args_match(cache[i], args))
					return i + 1;
			}
			cache.push(args);
			return cache.length;
		};
		
		// === private
		
		function args_match(a, b){
			if (a.length !== b.length) 
				return false;
			
			var imax = a.length,
				i = 0;
			for (; i < imax; i++){
				if (a[i] !== b[i])
					return false;
			}
			return true;
		}
	}());
	
	// end:source /src/util/function.js
	
	
	// source /src/xhr/XHR.js
	var XHR = {};
	
	(function(){
		
		// source promise.js
		/*
		 *  Copyright 2012-2013 (c) Pierre Duquesne <stackp@online.fr>
		 *  Licensed under the New BSD License.
		 *  https://github.com/stackp/promisejs
		 */
		
		(function(exports) {
		
		    var ct_URL_ENCODED = 'application/x-www-form-urlencoded',
		        ct_JSON = 'application/json';
		    
		    var e_NO_XHR = 1,
		        e_TIMEOUT = 2,
		        e_PRAPAIR_DATA = 3;
		        
		    function Promise() {
		        this._callbacks = [];
		    }
		
		    Promise.prototype.then = function(func, context) {
		        var p;
		        if (this._isdone) {
		            p = func.apply(context, this.result);
		        } else {
		            p = new Promise();
		            this._callbacks.push(function () {
		                var res = func.apply(context, arguments);
		                if (res && typeof res.then === 'function')
		                    res.then(p.done, p);
		            });
		        }
		        return p;
		    };
		
		    Promise.prototype.done = function() {
		        this.result = arguments;
		        this._isdone = true;
		        for (var i = 0; i < this._callbacks.length; i++) {
		            this._callbacks[i].apply(null, arguments);
		        }
		        this._callbacks = [];
		    };
		
		    function join(promises) {
		        var p = new Promise();
		        var results = [];
		
		        if (!promises || !promises.length) {
		            p.done(results);
		            return p;
		        }
		
		        var numdone = 0;
		        var total = promises.length;
		
		        function notifier(i) {
		            return function() {
		                numdone += 1;
		                results[i] = Array.prototype.slice.call(arguments);
		                if (numdone === total) {
		                    p.done(results);
		                }
		            };
		        }
		
		        for (var i = 0; i < total; i++) {
		            promises[i].then(notifier(i));
		        }
		
		        return p;
		    }
		
		    function chain(funcs, args) {
		        var p = new Promise();
		        if (funcs.length === 0) {
		            p.done.apply(p, args);
		        } else {
		            funcs[0].apply(null, args).then(function() {
		                funcs.splice(0, 1);
		                chain(funcs, arguments).then(function() {
		                    p.done.apply(p, arguments);
		                });
		            });
		        }
		        return p;
		    }
		
		    /*
		     * AJAX requests
		     */
		
		    function _encode(data) {
		        var result = "";
		        if (typeof data === "string") {
		            result = data;
		        } else {
		            var e = encodeURIComponent;
		            for (var k in data) {
		                if (data.hasOwnProperty(k)) {
		                    result += '&' + e(k) + '=' + e(data[k]);
		                }
		            }
		        }
		        return result;
		    }
		
		    function new_xhr() {
		        var xhr;
		        if (window.XMLHttpRequest) {
		            xhr = new XMLHttpRequest();
		        } else if (window.ActiveXObject) {
		            try {
		                xhr = new ActiveXObject("Msxml2.XMLHTTP");
		            } catch (e) {
		                xhr = new ActiveXObject("Microsoft.XMLHTTP");
		            }
		        }
		        return xhr;
		    }
		
		
		    function ajax(method, url, data, headers) {
		        var p = new Promise(),
		            contentType = headers && headers['Content-Type'] || promise.contentType;
		        
		        var xhr,
		            payload;
		        
		
		        try {
		            xhr = new_xhr();
		        } catch (e) {
		            p.done(e_NO_XHR, "");
		            return p;
		        }
		        if (data) {
		            
		            if ('GET' === method) {
		                
		                url += '?' + _encode(data);
		                data = null;
		            } else {
		                
		                
		                switch (contentType) {
		                    case ct_URL_ENCODED:
		                        data = _encode(data);
		                        break;
		                    case ct_JSON:
		                        try {
		                            data = JSON.stringify(data);
		                        } catch(error){
		                            
		                            p.done(e_PRAPAIR_DATA, '');
		                            return p;
		                        }
		                    default:
		                        // @TODO notify not supported content type
		                        // -> fallback to url encode
		                        data = _encode(data);
		                        break;
		                }
		            }
		            
		        }
		        
		        xhr.open(method, url);
		        
		        if (data) 
		            xhr.setRequestHeader('Content-Type', contentType);
		        
		        for (var h in headers) {
		            if (headers.hasOwnProperty(h)) {
		                xhr.setRequestHeader(h, headers[h]);
		            }
		        }
		
		        function onTimeout() {
		            xhr.abort();
		            p.done(e_TIMEOUT, "", xhr);
		        }
		
		        var timeout = promise.ajaxTimeout;
		        if (timeout) {
		            var tid = setTimeout(onTimeout, timeout);
		        }
		
		        xhr.onreadystatechange = function() {
		            if (timeout) {
		                clearTimeout(tid);
		            }
		            if (xhr.readyState === 4) {
		                var err = (!xhr.status ||
		                           (xhr.status < 200 || xhr.status >= 300) &&
		                           xhr.status !== 304);
		                p.done(err, xhr.responseText, xhr);
		            }
		        };
		
		        xhr.send(data);
		        return p;
		    }
		
		    function _ajaxer(method) {
		        return function(url, data, headers) {
		            return ajax(method, url, data, headers);
		        };
		    }
		
		    var promise = {
		        Promise: Promise,
		        join: join,
		        chain: chain,
		        ajax: ajax,
		        get: _ajaxer('GET'),
		        post: _ajaxer('POST'),
		        put: _ajaxer('PUT'),
		        del: _ajaxer('DELETE'),
		        patch: _ajaxer('PATCH'),
		
		        /* Error codes */
		        ENOXHR: e_NO_XHR,
		        ETIMEOUT: e_TIMEOUT,
		        E_PREPAIR_DATA: e_PRAPAIR_DATA,
		        /**
		         * Configuration parameter: time in milliseconds after which a
		         * pending AJAX request is considered unresponsive and is
		         * aborted. Useful to deal with bad connectivity (e.g. on a
		         * mobile network). A 0 value disables AJAX timeouts.
		         *
		         * Aborted requests resolve the promise with a ETIMEOUT error
		         * code.
		         */
		        ajaxTimeout: 0,
		        
		        
		        contentType: ct_JSON
		    };
		
		    if (typeof define === 'function' && define.amd) {
		        /* AMD support */
		        define(function() {
		            return promise;
		        });
		    } else {
		        exports.promise = promise;
		    }
		
		})(this);
		
		// end:source promise.js
		
	}.call(XHR));
	
	arr_each(['get'], function(key){
		XHR[key] = function(path, sender){
			
			this
				.promise[key](path)
				.then(function(errored, response, xhr){
					
					if (errored) {
						sender.onError(errored, response, xhr);
						return;
					}
					
					sender.onSuccess(response);
				});
			
		};
	});
	
	arr_each(['del', 'post', 'put', 'patch'], function(key){
		XHR[key] = function(path, data, cb){
			this
				.promise[key](path, data)
				.then(function(error, response, xhr){
					cb(error, response, xhr);
				});
		};
	});
	
	
	// end:source /src/xhr/XHR.js
	
	// source /src/business/Serializable.js
	var Serializable;
	
	(function(){
		
		Serializable = function($serialization) {
			
			if (this === Class || this == null || this === global) {
				
				var Ctor = function(data){
					this[json_key_SER] = obj_extend(this[json_key_SER], $serialization);
					
					Serializable.call(this, data);
				};
				
				return Ctor;
			}
			
			if ($serialization != null) {
				
				if (this.deserialize) 
					this.deserialize($serialization);
				else
					Serializable.deserialize(this, $serialization);
				
			}
			
		}
		
		Serializable.serialize = function(instance) {
				
			if (is_Function(instance.toJSON)) 
				return instance.toJSON();
			
			
			return json_proto_toJSON.call(instance, instance[json_key_SER]);
		};
		
		Serializable.deserialize = function(instance, json) {
				
			if (is_String(json)) {
				try {
					json = JSON.parse(json);
				}catch(error){
					console.error('<json:deserialize>', json);
					return instance;
				}
			}
			
			if (is_Array(json) && is_Function(instance.push)) {
				instance.length = 0;
				for (var i = 0, imax = json.length; i < imax; i++){
					instance.push(json[i]);
				}
				return instance;
			}
			
			var props = instance[json_key_SER],
				asKeys, asKey,
				key,
				val,
				Mix;
			
			
			if (props != null) {
				var pname = '__desAsKeys';
				
				asKeys = props[pname];
				if (asKeys == null) {
					asKeys = props[pname] = {};
					for (key in props) {
						if (key !== '__desAsKeys' && props[key].hasOwnProperty('key') === true) 
							asKeys[props[key].key] = key;
					}
				}
			}
			
			for (key in json) {
				
				val = json[key];
				asKey = key;
				
				if (props != null) {
					Mix = props.hasOwnProperty(key) 
						? props[key]
						: null
						;
					if (asKeys[key]) {
						asKey = asKeys[key];
					}
					
					if (Mix != null) {
						if (is_Object(Mix)) 
							Mix = Mix.deserialize;
						
						if (is_String(Mix)) 
							Mix = class_get(Mix);
						
						if (is_Function(Mix)) {
							instance[asKey] = val instanceof Mix
								? val
								: new Mix(val)
								;
							continue;
						}
					}
				}
				
				instance[asKey] = val;
			}
			
			return instance;
		}	
		
	}());
	
	// end:source /src/business/Serializable.js
	// source /src/business/Route.js
	/**
	 *	var route = new Route('/user/:id');
	 *
	 *	route.create({id:5}) // -> '/user/5'
	 */
	var Route = (function(){
		
		
		function Route(route){
			this.route = route_parse(route);
		}
		
		Route.prototype = {
			constructor: Route,
			create: function(object){
				var path, query;
				
				path = route_interpolate(this.route.path, object, '/');
				if (path == null) {
					return null;
				}
				
				if (this.route.query) {
					query = route_interpolate(this.route.query, object, '&');
					if (query == null) {
						return null;
					}
				}
				
				return path + (query ? '?' + query : '');
			},
			
			hasAliases: function(object){
				
				var i = 0,
					imax = this.route.path.length,
					alias
					;
				for (; i < imax; i++){
					alias = this.route.path[i].parts[1];
					
					if (alias && object[alias] == null) {
						return false;
					}
				}
				
				return true;
			}
		};
		
		var regexp_pathByColon = /^([^:\?]*)(\??):(\??)([\w]+)$/,
			regexp_pathByBraces = /^([^\{\?]*)(\{(\??)([\w]+)\})?([^\s]*)?$/;
		
		function parse_single(string) {
			var match = regexp_pathByColon.exec(string);
			
			if (match) {
				return {
					optional: (match[2] || match[3]) === '?',
					parts: [match[1], match[4]]
				};
			}
			
			match = regexp_pathByBraces.exec(string);
			
			if (match) {
				return {
					optional: match[3] === '?',
					parts: [match[1], match[4], match[5]]
				};
			}
			
			console.error('Paths breadcrumbs should be matched by regexps');
			return { parts: [string] };
		}
		
		function parse_path(path, delimiter) {
			var parts = path.split(delimiter);
			
			for (var i = 0, imax = parts.length; i < imax; i++){
				parts[i] = parse_single(parts[i]);
			}
			
			return parts;
		}
		
		function route_parse(route) {
			var question = /[^\:\{]\?[^:]/.exec(route),
				query = null;
			
			if (question){
				question = question.index + 1;
				query = route.substring(question + 1);
				route = route.substring(0, question);
			}
			
			
			return {
				path: parse_path(route, '/'),
				query: query == null ? null : parse_path(query, '&')
			};
		}
		
		/** - route - [] */
		function route_interpolate(breadcrumbs, object, delimiter) {
			var route = [],
				key,
				parts;
			
			
			for (var i = 0, x, imax = breadcrumbs.length; i < imax; i++){
				x = breadcrumbs[i];
				parts = x.parts.slice(0);
				
				if (parts[1] == null) {
					// is not an interpolated breadcrumb
					route.push(parts[0]);
					continue;
				}
				
				key = parts[1];
				parts[1] = object[key];
				
				if (parts[1] == null){
				
					if (!x.optional) {
						console.error('Object has no value, for not optional part - ', key);
						return null;
					}
					
					continue;
				}
				
				route.push(parts.join(''));
			}
			
			return route.join(delimiter);
		}
		
		
		return Route;
	}());
	// end:source /src/business/Route.js
	// source /src/business/Deferred.js
	var Deferred;
	
	(function(){
		Deferred = function(){};
		Deferred.prototype = {
			_isAsync: true,
				
			_done: null,
			_fail: null,
			_always: null,
			_resolved: null,
			_rejected: null,
			
			defer: function(){
				this._rejected = null;
				this._resolved = null;
			},
			
			isResolved: function(){
				return this._resolved != null;
			},
			isRejected: function(){
				return this._rejected != null;
			},
			isBusy: function(){
				return this._resolved == null && this._rejected == null;
			},
			
			resolve: function() {
				var done = this._done,
					always = this._always
					;
				
				this._resolved = arguments;
				
				dfr_clearListeners(this);
				arr_callOnce(done, this, arguments);
				arr_callOnce(always, this, [ this ]);
				
				return this;
			},
			
			reject: function() {
				var fail = this._fail,
					always = this._always
					;
				
				this._rejected = arguments;
				
				dfr_clearListeners(this);
				arr_callOnce(fail, this, arguments);
				arr_callOnce(always, this, [ this ]);
		
				return this;
			},
			
			resolveDelegate: function(){
				return fn_proxy(this.resolve, this);
			},
			
			rejectDelegate: function(){
				return fn_proxy(this.reject, this);
			},
			
			then: function(filterSuccess, filterError){
				return this.pipe(filterSuccess, filterError);
			},
			
			done: function(callback) {
				if (this._rejected != null) 
					return this;
				return dfr_bind(
					this,
					this._resolved,
					this._done || (this._done = []),
					callback
				);
			},
			
			fail: function(callback) {
				if (this._resolved != null) 
					return this;
				return dfr_bind(
					this,
					this._rejected,
					this._fail || (this._fail = []),
					callback
				);
			},
			
			always: function(callback) {
				return dfr_bind(
					this,
					this._rejected || this._resolved,
					this._always || (this._always = []),
					callback
				);
			},
			
			pipe: function(mix /* ..methods */){
				var dfr;
				if (typeof mix === 'function') {
					dfr = new Deferred;
					var done_ = mix,
						fail_ = arguments.length > 1
							? arguments[1]
							: null;
						
					this
						.done(delegate(dfr, 'resolve', done_))
						.fail(delegate(dfr, 'reject',  fail_))
						;
					return dfr;
				}
				
				dfr = mix;
				var imax = arguments.length,
					done = imax === 1,
					fail = imax === 1,
					i = 0, x;
				while( ++i < imax ){
					x = arguments[i];
					switch(x){
						case 'done':
							done = true;
							break;
						case 'fail':
							fail = true;
							break;
						default:
							console.error('Unsupported pipe channel', arguments[i])
							break;
					}
				}
				done && this.done(dfr.resolveDelegate());
				fail && this.fail(dfr.rejectDelegate());
				
				function pipe(dfr, method) {
					return function(){
						dfr[method].apply(dfr, arguments);
					};
				}
				function delegate(dfr, name, fn) {
					
					return function(){
						if (fn != null) {
							var override = fn.apply(this, arguments);
							if (override != null) {
								if (isDeferred(override) === true) {
									override.pipe(dfr);
									return;
								}
								
								dfr[name](override)
								return;
							}
						}
						dfr[name].apply(dfr, arguments);
					};
				}
				
				return this;
			},
			pipeCallback: function(){
				var self = this;
				return function(error){
					if (error != null) {
						self.reject(error);
						return;
					}
					var args = _Array_slice.call(arguments, 1);
					fn_apply(self.resolve, self, args);
				};
			}
		};
		
		Deferred.run = function(fn, ctx){
			var dfr = new Deferred();
			if (ctx == null) 
				ctx = dfr;
			
			fn.call(ctx, dfr.resolveDelegate(), dfr.rejectDelegate(), dfr);
			return dfr;
		};
		/**
		 * Create function wich gets deferred object with first argument.
		 * Created function returns always that deferred object
		 */
		Deferred.create = function(fn){
			return function(){
				var args = _Array_slice.call(arguments),
					dfr = new Deferred;
				args.unshift(dfr);
				
				fn_apply(fn, this, args);
				return dfr;
			};
		};
		/**
		 * Similar as `create` it will also cache the deferred object,
		 *  sothat the target function is called once pro specific arguments
		 *
		 * var fn = Deferred.memoize((dfr, name) => dfr.resolve(name));
		 * fn('foo');
		 * fn('baz');
		 * fn('foo');
		 *  - is called only once for `foo`, and once for `baz`
		 */
		Deferred.memoize = function(fn){
			var dfrs = {}, args_store = [];
			return function(){
				var args = _Array_slice.call(arguments),
					id = fn_argsId(args_store, args);
				if (dfrs[id] != null) 
					return dfrs[id];
				
				var dfr = dfrs[id] = new Deferred;
				args.unshift(dfr);
				
				fn_apply(fn, this, args);
				return dfr;
			};
		};
	
		// PRIVATE
		
		function dfr_bind(dfr, arguments_, listeners, callback){
			if (callback == null) 
				return dfr;
			
			if ( arguments_ != null) 
				fn_apply(callback, dfr, arguments_);
			else 
				listeners.push(callback);
			
			return dfr;
		}
		
		function dfr_clearListeners(dfr) {
			dfr._done = null;
			dfr._fail = null;
			dfr._always = null;
		}
		
		function arr_callOnce(arr, ctx, args) {
			if (arr == null) 
				return;
			
			var imax = arr.length,
				i = -1,
				fn;
			while ( ++i < imax ) {
				fn = arr[i];
				
				if (fn) 
					fn_apply(fn, ctx, args);
			}
			arr.length = 0;
		}
		function isDeferred(x){
			if (x == null || typeof x !== 'object') 
				return false;
			
			if (x instanceof Deferred) 
				return true;
			
			return typeof x.done === 'function'
				&& typeof x.fail === 'function'
				;
		}
		
	}());
	// end:source /src/business/Deferred.js
	// source /src/business/EventEmitter.js
	var EventEmitter;
	(function(){
	 
		EventEmitter = function() {
			this._listeners = {};
		};
	    EventEmitter.prototype = {
	        constructor: EventEmitter,
			on: function(event, callback) {
	            if (callback != null){
					(this._listeners[event] || (this._listeners[event] = [])).push(callback);
				}
				
	            return this;
	        },
	        once: function(event, callback){
				if (callback != null) {
					callback._once = true;
					(this._listeners[event] || (this._listeners[event] = [])).push(callback);
				}
				
	            return this;
	        },
			
			pipe: function(event){
				var that = this,
					args;
				return function(){
					args = _Array_slice.call(arguments);
					args.unshift(event);
					
					fn_apply(that.trigger, that, args);
				};
			},
	        
			emit: event_trigger,
	        trigger: event_trigger,
			
	        off: function(event, callback) {
				var listeners = this._listeners[event];
	            if (listeners == null)
					return this;
				
				if (arguments.length === 1) {
					listeners.length = 0;
					return this;
				}
				
				var imax = listeners.length,
					i = -1;
				while (++i < imax) {
					
					if (listeners[i] === callback) {
						listeners.splice(i, 1);
						i--;
						imax--;
					}
					
				}
	            return this;
			}
	    };
	    
		function event_trigger() {
			var args = _Array_slice.call(arguments),
				event = args.shift(),
				fns = this._listeners[event],
				fn, imax, i = 0;
				
			if (fns == null)
				return this;
			
			for (imax = fns.length; i < imax; i++) {
				fn = fns[i];
				fn_apply(fn, this, args);
				
				if (fn._once === true){
					fns.splice(i, 1);
					i--;
					imax--;
				}
			}
		
			return this;
		}
	}());
	
	// end:source /src/business/EventEmitter.js
	



	// source /src/Class.js
	var Class = function(mix) {
		
		var namespace,
			data;
		
		if (is_String(mix)) {
			namespace = mix;
			
			if (arguments.length === 1) 
				return class_get(mix);
			
			
			data = arguments[1];
			data[str_CLASS_IDENTITY] = namespace;
		} else {
			data = mix;
		}
		
		
		var _base = data.Base,
			_extends = data.Extends,
			_static = data.Static,
			_construct = data.Construct,
			_class = null,
			_store = data.Store,
			_self = data.Self,
			_overrides = data.Override,
			
			key;
	
		if (_base != null) 
			delete data.Base;
		
		if (_extends != null) 
			delete data.Extends;
		
		if (_static != null) 
			delete data.Static;
		
		if (_self != null) 
			delete data.Self;
		
		if (_construct != null) 
			delete data.Construct;
		
		
		if (_store != null) {
			
			if (_extends == null) {
				_extends = _store;
			} else if (is_Array(_extends)) {
				_extends.unshift(_store)
			} else {
				_extends = [_store, _extends];
			}
			
			delete data.Store;
		}
		
		if (_overrides != null) 
			delete data.Override;
		
		if (_base == null && _extends == null && _self == null) {
		
			if (data.toJSON === void 0) 
				data.toJSON = json_proto_toJSON;
			
			_class = _construct == null
				? function() {}
				: _construct
				;
			
			data.constructor = _class.prototype.constructor;
	
			if (_static != null) {
				obj_extendDescriptors(_class, _static);
			}
	
			_class.prototype = data;
			
			if (namespace != null) 
				class_register(namespace, _class);
			
			return _class;
		}
	
		_class = function() {
			
			//// consider to remove 
			////if (this instanceof _class === false) 
			////	return new (_class.bind.apply(_class, [null].concat(_Array_slice.call(arguments))));
			
		
			if (_extends != null) {
				var isarray = _extends instanceof Array,
					
					imax = isarray ? _extends.length : 1,
					i = 0,
					x = null;
				for (; i < imax; i++) {
					x = isarray
						? _extends[i]
						: _extends
						;
					if (typeof x === 'function') {
						fn_apply(x, this, arguments);
					}
				}
			}
	
			if (_base != null) {
				fn_apply(_base, this, arguments);
			}
			
			if (_self != null && is_NullOrGlobal(this) === false) {
				
				for (var key in _self) {
					this[key] = fn_proxy(_self[key], this);
				}
			}
	
			if (_construct != null) {
				var r = fn_apply(_construct, this, arguments);
				if (r != null) {
					return r;
				}
			}
			
			this['super'] = null;
			
			return this;
		};
		
		if (namespace != null) 
			class_register(namespace, _class);
	
		if (_static != null) {
			obj_extendDescriptors(_class, _static);
		}
		
		if (_base != null) 
			class_inheritStatics(_class, _base);
		
		if (_extends != null) 
			class_inheritStatics(_class, _extends);
		
		class_extendProtoObjects(data, _base, _extends);
		
		class_inherit(_class, _base, _extends, data, _overrides, {
			toJSON: json_proto_toJSON
		});
		
		data = null;
		_static = null;
		return _class;
	};
	// end:source /src/Class.js
	
	// source /src/business/Await.js
	var Await;
	
	(function(){
		
		Await = Class({
			Extends: Deferred.prototype,
		
			_wait: 0,
			_timeout: null,
			_result: null,
			_resolved: [],
			
			Construct: function(/* promises <optional> */){
				var imax = arguments.length,
					i = -1,
					dfr
					;
				while ( ++i < imax ){
					dfr = arguments[i];
					if (dfr != null && typeof dfr.done === 'function') 
						await_deferredDelegate(this, null, dfr);
				}
			},
			
			delegate: function(name, errorable) {
				return await_createDelegate(this, name, errorable);
			},
		
			deferred: function(name) {
				
				return await_deferredDelegate(
					this,
					name,
					new Deferred);
			},
		
			Static: {
		
				TIMEOUT: 2000
			}
		});
	
		function await_deferredDelegate(await, name, dfr){
			var delegate = await_createDelegate(await, name, true),
				args
			;
			return dfr
				.done(function(){
					args = _Array_slice.call(arguments);
					args.unshift(null);
					
					delegate.apply(null, args);
				})
				.fail(function(error){
					
					delegate(error);
				})
				;
		}
		
		function await_createDelegate(await, name, errorable){
			if (errorable == null) 
				errorable = true;
			
			if (await._timeout)
				clearTimeout(await._timeout);
	
			await.defer();
			await._wait++;
	
			if (name){
				if (!await._result)
					await._result = {};
				
				if (name in await._result) 
					console.warn('<await>', name, 'already awaiting');
				
				await._result[name] = null;
			}
			
			var delegate = fn_createDelegate(await_listener, await, name, errorable)
				;
	
			await._timeout = setTimeout(delegate, Await.TIMEOUT);
	
			return delegate;
		}
		
		function await_listener(await, name, errorable /* .. args */ ) {
			
			if (arguments.length === 0) {
				// timeout
				await._wait = 0;
				await.reject('408: Timeout');
				return;
			}
			
			if (await._wait === 0) 
				return;
			
			var result = await._result;
			
			if (name) {
				var args = _Array_slice.call(arguments, 3);
				
				result[name] = {
					error: errorable ? args.shift() : null,
					arguments: args
				};
			} else if (errorable && arguments[3] != null) {
				
				if (result == null) 
					result = await._result = {};
				
				result.__error = arguments[3];
			}
			
			if (--await._wait === 0) {
				clearTimeout(await._timeout);
				
				var error = result && result.__error
					;
				var val,
					key;
				
				if (error == null) {
					for(key in result){
						
						val = result[key];
						error = val && val.error;
						
						if (error) 
							break;
					}
				}
				
				if (error) {
					await.reject(error, result);
					return;
				}
				
				await.resolve(result);
			}
		}
	
	}());
	// end:source /src/business/Await.js
	
	// source /src/store/Store.js
	var StoreProto = {
		
		
		// Abstract
		
		fetch: null,
		save: null,
		del: null,
		onSuccess: null,
		onError: null,
		
		Static: {
			fetch: function(data){
				return new this().fetch(data);
			}
		}
	};
	// end:source /src/store/Store.js
	// source /src/store/events.js
	var storageEvents_onBefore,
		storageEvents_onAfter,
		storageEvents_remove,
		storageEvents_overridenDefer
		;
		
	(function(){
		
		
		var event_START = 'start',
			event_SUCCESS = 'fulfilled',
			event_FAIL = 'rejected';
		
		var events_ = new EventEmitter,
			hasBeforeListeners_,
			hasAfterListeners_
			;
		
		storageEvents_onBefore = function(callback){
			events_.on(event_START, callback);
			hasBeforeListeners_ = true;
		};
		
		storageEvents_onAfter = function(onSuccess, onFailure){
			events_
				.on(event_SUCCESS, onSuccess)
				.on(event_FAIL, onFailure)
				;
			hasAfterListeners_ = true;
		};
		
		storageEvents_remove = function(callback){
			events_
				.off(event_SUCCESS, callback)
				.off(event_FAIL, callback)
				.off(event_START, callback)
				;
		};
		
		storageEvents_overridenDefer = function(type){
			
			Deferred.prototype.defer.call(this);
			
			if (hasBeforeListeners_) 
				emit([event_START, this, type]);
			
			if (hasAfterListeners_) 
				this.always(listenerDelegate(this, type));
			
			return this;
		};
		
		// PRIVATE
		
		function listenerDelegate(sender, type) {
			return function(){
				var isSuccess = sender._rejected == null,
					arguments_ = isSuccess 
						? sender._resolved
						: sender._rejected
						,
					event = isSuccess
						? event_SUCCESS
						: event_FAIL
					;
				emit([event, sender, type].concat(arguments_));
			};
		}
		
		
		function emit(arguments_/* [ event, sender, .. ]*/){
			events_.trigger.apply(events_, arguments_);
		}
		
		
	}());
	// end:source /src/store/events.js
	// source /src/store/Remote.js
	Class.Remote = (function(){
	
		var str_CONTENT_TYPE = 'content-type',
			str_JSON = 'json'
			;
			
		var XHRRemote = function(route){
			this._route = new Route(route);
		};
		
		obj_inherit(XHRRemote, StoreProto, Serializable, Deferred, {
			
			defer: storageEvents_overridenDefer,
			
			serialize: function(){
				
				return is_Array(this)
					? json_proto_arrayToJSON.call(this)
					: json_proto_toJSON.call(this)
					;
			},
			
			deserialize: function(json){
				return Serializable.deserialize(this, json);
			},
			
			fetch: function(data){
				this.defer('fetch');
				
				XHR.get(this._route.create(data || this), this);
				return this;
			},
			
			save: function(callback){
				this.defer('save');
				
				var json = this.serialize(),
					path = this._route.create(this),
					method = this._route.hasAliases(this)
						? 'put'
						: 'post'
					;
				
				XHR[method](path, json, resolveDelegate(this, callback, 'save'));
				return this;
			},
			
			patch: function(json){
				this.defer('patch');
				
				obj_patch(this, json);
				
				XHR.patch(
					this._route.create(this),
					json,
					resolveDelegate(this)
				);
				return this;
			},
			
			del: function(callback){
				this.defer('del');
				
				var json = this.serialize(),
					path = this._route.create(this)
					;
				
				XHR.del(path, json, resolveDelegate(this, callback));
				return this;
			},
			
			onSuccess: function(response){
				parseFetched(this, response);
			},
			onError: function(errored, response, xhr){
				reject(this, response, xhr);
			}
			
			
		});
		
		function parseFetched(self, response){
			var json;
				
			try {
				json = JSON.parse(response);	
			} catch(error) {
				
				reject(self, error);
				return;
			}
			
			
			self.deserialize(json);
			self.resolve(self);
		}
		
		function reject(self, response, xhr){
			var obj;
			if (typeof response === 'string' && is_JsonResponse(xhr)) {
				try {
					obj = JSON.parse(response);
				} catch (error) {
					obj = error;
				}
			}
			
			self.reject(obj || response);
		}
		
		function is_JsonResponse(xhr){
			var header = xhr.getResponseHeader(str_CONTENT_TYPE);
			
			return header != null
				&&  header.toLowerCase().indexOf(str_JSON) !== -1;
		}
		
		function resolveDelegate(self, callback, action){
			
			return function(error, response, xhr){
					
					if (is_JsonResponse(xhr)) {
						try {
							response = JSON.parse(response);
						} catch(error){
							console.error('<XHR> invalid json response', response);
							
							return reject(self, error, xhr);
						}
					}
					
					// @obsolete -> use deferred
					if (callback) 
						callback(error, response);
					
					if (error) 
						return reject(self, response, xhr);
					
					if ('save' === action && is_Object(response)) {
						
						if (is_Array(self)) {
							
							var imax = self.length,
								jmax = response.length,
								i = -1
								;
							
							while ( ++i < imax && i < jmax){
								
								Serializable.deserialize(self[i], response[i]);
							}
							
						} else {
							self.deserialize(response);
						}
						
						return self.resolve(self);
					}
					
					self.resolve(response);
			};
		}
		
		function Remote(route){
			
			return new XHRRemote(route);
		};
		
		Remote.onBefore = storageEvents_onBefore;
		Remote.onAfter = storageEvents_onAfter;
		
		arr_each(['get', 'post', 'put', 'delete'], function(method){
			
			Remote[method] = function(url, obj){
				
				var json = obj;
				if (obj.serialize != null) 
					json = obj.serialize();
				
				if (json == null && obj.toJSON) 
					json = obj.toJSON();
				
				var dfr = new Deferred();
				XHR[method](url, json, resolveDelegate(dfr));
				
				return dfr;
			};
		});
		
		return Remote;
	}());
	// end:source /src/store/Remote.js
	// source /src/store/LocalStore.js
	Class.LocalStore = (function(){
		
		var LocalStore = function(route){
			this._route = new Route(route);
		};
		
		obj_inherit(LocalStore, StoreProto, Serializable, Deferred, {
			
			serialize: function(){
				
				var json = is_Array(this)
					? json_proto_arrayToJSON.call(this)
					: json_proto_toJSON.call(this)
					;
				
				return JSON.stringify(json);
			},
			deserialize: function(json){
				return Serializable.deserialize(this, json);
			},
			fetch: function(data){
				
				var path = this._route.create(data || this),
					object = localStorage.getItem(path);
				
				if (object == null) {
					return this.resolve(this);
				}
				
				if (is_String(object)){
					try {
						object = JSON.parse(object);
					} catch(e) {
						return this.reject(e);
					}
				}
				
				this.deserialize(object);
				return this.resolve(this);
			},
			
			save: function(callback){
				var path = this._route.create(this),
					store = this.serialize();
				
				localStorage.setItem(path, store);
				callback && callback();
				return this.resolve(this);
			},
			
			del: function(mix){
				
				if (mix == null && arguments.length !== 0) {
					return this.reject('<localStore:del> - selector is specified, but is undefined');
				}
				
				// Single
				if (arr_isArray(this) === false) {
					store_del(this._route, mix || this);
					return this.resolve();
				}
				
				// Collection
				if (mix == null) {
					
					for (var i = 0, imax = this.length; i < imax; i++){
						this[i] = null;
					}
					this.length = 0;
					
					store_del(this._route, this);
					return this.resolve();
				}
				
				var array = this.remove(mix);
				if (array.length === 0) {
					// was nothing removed
					return this.resolve();
				}
				
				return this.save();
			},
			
			onError: function(error){
				this.reject({
					error: error
				});
			}
			
			
		});
		
		function store_del(route, data){
			var path = route.create(data);
			
			localStorage.removeItem(path);
		}
		
		var Constructor = function(route){
			
			return new LocalStore(route);
		};
		
		Constructor.prototype = LocalStore.prototype;
		
		
		return Constructor;
	
	}());
	// end:source /src/store/LocalStore.js
	

	// source /src/Class.Static.js
	/**
	 * Can be used in Constructor for binding class's functions to class's context
	 * for using, for example, as callbacks
	 *
	 * @obsolete - use 'Self' property instead
	 */
	Class.bind = function(cntx) {
		var arr = arguments,
			i = 1,
			length = arguments.length,
			key;
	
		for (; i < length; i++) {
			key = arr[i];
			cntx[key] = cntx[key].bind(cntx);
		}
		return cntx;
	};
	
	Class.cfg = function(mix, value){
		
		if (is_String(mix)) {
			
			if (arguments.length === 1) 
				return _cfg[mix];
			
			_cfg[mix] = value;
			return;
		}
		
		if (is_Object(mix)) {
			
			for(var key in mix){
				
				Class.cfg(key, mix[key]);
			}
		}
	};
	
	
	
	Class.Model = {};
	Class.Serializable = Serializable;
	Class.Deferred = Deferred;
	Class.EventEmitter = EventEmitter;
	Class.Await = Await;
	Class.validate = obj_validate;
	
	Class.stringify = class_stringify;
	Class.parse = class_parse;
	Class.patch = class_patch;
	Class.properties = class_properties;
	// end:source /src/Class.Static.js
	
	// source /src/collection/Collection.js
	Class.Collection = (function(){
		
		// source ArrayProto.js
		
		var ArrayProto = (function(){
		
			function check(x, mix) {
				if (mix == null)
					return false;
				
				if (typeof mix === 'function') 
					return mix(x);
				
				if (typeof mix === 'object'){
					
					if (x.constructor === mix.constructor && x.constructor !== Object) {
						return x === mix;
					}
					
					var value, matcher;
					for (var key in mix) {
						
						value = x[key];
						matcher = mix[key];
						
						if (typeof matcher === 'string') {
							var c = matcher[0],
								index = 1;
							
							if ('<' === c || '>' === c){
								
								if ('=' === matcher[1]){
									c +='=';
									index++;
								}
								
								matcher = matcher.substring(index);
								
								switch (c) {
									case '<':
										if (value >= matcher)
											return false;
										continue;
									case '<=':
										if (value > matcher)
											return false;
										continue;
									case '>':
										if (value <= matcher)
											return false;
										continue;
									case '>=':
										if (value < matcher)
											return false;
										continue;
								}
							}
						}
						
						// eqeq to match by type diffs.
						if (value != matcher) 
							return false;
						
					}
					return true;
				}
				
				console.warn('No valid matcher', mix);
				return false;
			}
		
			var ArrayProto = {
				length: 0,
				push: function(/*mix*/) {
					var imax = arguments.length,
						i = -1;
					while ( ++i < imax ) {
						
						this[this.length++] = create(this._ctor, arguments[i]);
					}
					
					return this;
				},
				pop: function() {
					var instance = this[--this.length];
			
					this[this.length] = null;
					return instance;
				},
				shift: function(){
					if (this.length === 0) 
						return null;
					
					
					var first = this[0],
						imax = this.length - 1,
						i = 0;
					
					for (; i < imax; i++){
						this[i] = this[i + 1];
					}
					
					this[imax] = null;
					this.length--;
					
					return first;
				},
				unshift: function(mix){
					this.length++;
					
					var imax = this.length;
					
					while (--imax) {
						this[imax] = this[imax - 1];
					}
					
					this[0] = create(this._ctor, mix);
					return this;
				},
				
				splice: function(index, count /* args */){
					
					var length = this.length;
					var i, imax, y;
					
					// clear range after length until index
					if (index >= length) {
						count = 0;
						for (i = length, imax = index; i < imax; i++){
							this[i] = void 0;
						}
					}
					
					var	rm_count = count,
						rm_start = index,
						rm_end = index + rm_count,
						add_count = arguments.length - 2,
						
						new_length = length + add_count - rm_count;
					
					
					// move block
					
					var block_start = rm_end,
						block_end = length,
						block_shift = new_length - length;
					
					if (0 < block_shift) {
						// move forward
						
						i = block_end;
						while (--i >= block_start) {
							
							this[i + block_shift] = this[i];
							
						}
		
					}
					
					if (0 > block_shift) {
						// move backwards
						
						i = block_start;				
						while (i < block_end) {
							this[i + block_shift] = this[i];
							i++;
						}
					}
					
					// insert
					
					i = rm_start;
					y = 2;
					for (; y < arguments.length; y) {
						this[i++] = create(this._ctor, arguments[y++]);
					}
					
					
					this.length = new_length;
					return this;
				},
				
				slice: function(){
					return fn_apply(_Array_slice, this, arguments);
				},
				
				sort: function(fn){
					_Array_sort.call(this, fn);
					return this;
				},
				
				reverse: function(){
					var array = _Array_slice.call(this),
						imax = this.length,
						i = -1
						;
					while( ++i < imax) {
						this[i] = array[imax - i - 1];
					}
					return this;
				},
				
				toString: function(){
					return _Array_slice.call(this, 0).toString()
				},
				
				each: forEach,
				forEach: forEach,
				
				
				where: function(mix){
					
					var collection = new this.constructor();
					
					for (var i = 0, x, imax = this.length; i < imax; i++){
						x = this[i];
						
						if (check(x, mix)) {
							collection[collection.length++] = x;
						}
					}
					
					return collection;
				},
				remove: function(mix){
					var index = -1,
						array = [];
					for (var i = 0, imax = this.length; i < imax; i++){
						
						if (check(this[i], mix)) {
							array.push(this[i]);
							continue;
						}
						
						this[++index] = this[i];
					}
					for (i = ++index; i < imax; i++) {
						this[i] = null;
					}
					
					this.length = index;
					return array;
				},
				first: function(mix){
					if (mix == null)
						return this[0];
					
					var i = this.indexOf(mix);
					return i !== -1
						? this[i]
						: null;
						
				},
				last: function(mix){
					if (mix == null)
						return this[this.length - 1];
					
					var i = this.lastIndexOf(mix);
					return i !== -1
						? this[i]
						: null;
				},
				indexOf: function(mix, index){
					if (mix == null)
						return -1;
					
					if (index != null) {
						if (index < 0) 
							index = 0;
							
						if (index >= this.length) 
							return -1;
						
					}
					else{
						index = 0;
					}
					
					
					var imax = this.length;
					for(; index < imax; index++) {
						if (check(this[index], mix))
							return index;
					}
					return -1;
				},
				lastIndexOf: function(mix, index){
					if (mix == null)
						return -1;
					
					if (index != null) {
						if (index >= this.length) 
							index = this.length - 1;
						
						if (index < 0) 
							return -1;
					}
					else {
						index = this.length - 1;
					}
					
					
					for (; index > -1; index--) {
						if (check(this[index], mix))
							return index;
					}
					
					return -1;
				},
				
				map: function(fn){
					
					var arr = [],
						imax = this.length,
						i = -1;
					while( ++i < imax ){
						arr[i] = fn(this[i]);
					}
					return arr;
				},
				
				filter: function(fn, ctx){
					var coll = new this.constructor(),
						imax = this.length,
						i = -1;
					while ( ++i < imax ){
						if (fn.call(ctx || this, this[i])) {
							coll.push(this[i]);
						}
					}
					return coll;
				}
			};
			
			// ES6 iterator
			if (typeof Symbol !== 'undefined' && Symbol.iterator) {
				ArrayProto[Symbol.iterator] = function(){
					var arr = this,
						i = -1;
					return {
						next: function(){
							return {
								value: arr[++i],
								done: i > arr.length - 1
							};
						},
						hasNext: function(){
							return i < arr.length;
						}
					}
				};
			}
			
			function forEach(fn, ctx){
				var imax = this.length,
					i = -1
					;
				while( ++i < imax ) {
					fn.call(ctx || this, this[i], i);
				}
				return this;
			}
			
			
			return ArrayProto;
		}());
		
		// end:source ArrayProto.js
		
		function create(Constructor, mix) {
			
			if (mix instanceof Constructor) 
				return mix;
			
			return new Constructor(mix);
		}
		
		var CollectionProto = {
			toArray: function(){
				var array = new Array(this.length);
				for (var i = 0, imax = this.length; i < imax; i++){
					array[i] = this[i];
				}
				
				return array;
			},
			
			toJSON: json_proto_arrayToJSON
		};
		
		function Collection(/* (ClassName, Child, Proto) (Child, Proto) */) {
			var length = arguments.length,
				Proto = arguments[length - 1],
				Child = arguments[length - 2],
				
				className
				;
			
			if (length > 2) 
				className = arguments[0];
			
			
			Proto._ctor = Child;
			obj_inherit(Proto, CollectionProto, ArrayProto);
			
			return className == null
				? Class(Proto)
				: Class(className, Proto)
				;
		}
		
		
		return Collection;
	}());
	// end:source /src/collection/Collection.js
	
	// source /src/fn/fn.js
	(function(){
		
		// source memoize.js
		var fn_memoize,
			fn_memoizeAsync;
		
		(function(){
			fn_memoize = function(fn) {
				var _cache = {},
					_args = [];
				return function() {
					var id = fn_argsId(arguments, _args);
					
					return _cache[id] == null
						? (_cache[id] = fn_apply(fn, this, arguments))
						: _cache[id];
				};
			};
			
			fn_memoizeAsync = function(fn) {
				var _cache = {},
					_cacheCbs = {},
					_args = [];
					
				return function(){
					
					var args = _Array_slice.call(arguments),
						callback = args.pop();
					
					var id = fn_argsId(args, _args);
					
					if (_cache[id]){
						fn_apply(callback, this, _cache[id])
						return; 
					}
					
					if (_cacheCbs[id]) {
						_cacheCbs[id].push(callback);
						return;
					}
					
					_cacheCbs[id] = [callback];
					
					args = _Array_slice.call(args);
					args.push(fn_resolveDelegate(_cache, _cacheCbs, id));
					
					fn_apply(fn, this, args);
				};
			};
			
			// === private
			function fn_resolveDelegate(cache, cbs, id) {
				return function(){
					cache[id] = arguments;
					
					for (var i = 0, x, imax = cbs[id].length; i < imax; i++){
						x = cbs[id][i];
						fn_apply(x, this, arguments);
					}
					
					cbs[i] = null;
					cache = null;
					cbs = null;
				};
			}
		}());
		
		
		// end:source memoize.js
		
		Class.Fn = {
			memoize: fn_memoize,
			memoizeAsync: fn_memoizeAsync
		};
		
	}());
	// end:source /src/fn/fn.js
	
	exports.Class = Class;
	
}));
// source ../src/head.js
(function (root, factory) {
    'use strict';

	var _global, _exports;
	
	if (typeof exports !== 'undefined' && (root === exports || root == null)){
		// raw nodejs module
    	_global = _exports = global;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined' ? global : window;
	}
	if (_exports == null) {
		_exports = root || _global;
	}
	
	if (typeof include !== 'undefined' && typeof include.js === 'function') {
		// allow only one `include` per application
		_exports.include = include;
		_exports.includeLib = include.Lib || _global.includeLib;
		return;
	}
	
	factory(_global, _exports, _global.document);

}(this, function (global, exports, document) {
    'use strict';

// end:source ../src/head.js

	// source ../src/1.scope-vars.js 
	
	/**
	 *	.cfg
	 *		: path :=	root path. @default current working path, im browser window.location;
	 *		: eval := in node.js this conf. is forced
	 *		: lockedToFolder := makes current url as root path
	 *			Example "/script/main.js" within this window.location "{domain}/apps/1.html"
	 *			will become "{domain}/apps/script/main.js" instead of "{domain}/script/main.js"
	 */
	
	var bin = {
			js: {},
			css: {},
			load: {}
		},
		isWeb = !! (global.location && global.location.protocol && /^https?:/.test(global.location.protocol)),
		reg_subFolder = /([^\/]+\/)?\.\.\//,
		reg_hasProtocol = /^(file|https?):/i,
		cfg = {
			path: null,
			loader: null,
			version: null,
			lockedToFolder: null,
			sync: null,
			eval: document == null
		},
		handler = {},
		hasOwnProp = {}.hasOwnProperty,
		emptyResponse = {
			load: {}
		},
		__array_slice = Array.prototype.slice,
		
		XMLHttpRequest = global.XMLHttpRequest;
	
		
	// end:source ../src/1.scope-vars.js 
	// source ../src/2.Helper.js
	var Helper = { /** TODO: improve url handling*/
		
		reportError: function(e) {
			console.error('IncludeJS Error:', e, e.message, e.url);
			typeof handler.onerror === 'function' && handler.onerror(e);
		}
		
	},
	
		XHR = function(resource, callback) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				xhr.readyState === 4 && callback && callback(resource, xhr.responseText);
			};
	
			xhr.open('GET', typeof resource === 'object' ? resource.url : resource, true);
			xhr.send();
		};
	
	// end:source ../src/2.Helper.js
	
	// source ../src/utils/fn.js
	function fn_proxy(fn, ctx) {
		
		return function(){
			fn.apply(ctx, arguments);
		};
		
	}
	
	function fn_doNothing(fn) {
		typeof fn === 'function' && fn();
	}
	// end:source ../src/utils/fn.js
	// source ../src/utils/object.js
	var obj_inherit,
		obj_getProperty,
		obj_setProperty
		;
	
	(function(){
	
		obj_inherit = function(target /* source, ..*/ ) {
			if (typeof target === 'function') {
				target = target.prototype;
			}
			var i = 1,
				imax = arguments.length,
				source, key;
			for (; i < imax; i++) {
		
				source = typeof arguments[i] === 'function'
					? arguments[i].prototype
					: arguments[i];
		
				for (key in source) {
					target[key] = source[key];
				}
			}
			return target;
		};
		
		obj_getProperty = function(obj, property) {
			var chain = property.split('.'),
				length = chain.length,
				i = 0;
			for (; i < length; i++) {
				if (obj == null) 
					return null;
				
				obj = obj[chain[i]];
			}
			return obj;
		};
		
		obj_setProperty = function(obj, property, value) {
			var chain = property.split('.'),
				imax = chain.length - 1,
				i = -1,
				key;
			while ( ++i < imax ) {
				key = chain[i];
				if (obj[key] == null) 
					obj[key] = {};
				
				obj = obj[key];
			}
			obj[chain[i]] = value;
		};
		
	}());
	
	// end:source ../src/utils/object.js
	// source ../src/utils/array.js
	function arr_invoke(arr, args, ctx) {
	
		if (arr == null || arr instanceof Array === false) {
			return;
		}
	
		for (var i = 0, length = arr.length; i < length; i++) {
			if (typeof arr[i] !== 'function') {
				continue;
			}
			if (args == null) {
				arr[i].call(ctx);
			}else{
				arr[i].apply(ctx, args);
			}
		}
	
	}
	
	function arr_ensure(obj, xpath) {
		if (!xpath) {
			return obj;
		}
		var arr = xpath.split('.'),
			imax = arr.length - 1,
			i = 0,
			key;
	
		for (; i < imax; i++) {
			key = arr[i];
			obj = obj[key] || (obj[key] = {});
		}
	
		key = arr[imax];
		return obj[key] || (obj[key] = []);
	}
	// end:source ../src/utils/array.js
	// source ../src/utils/path.js
	var path_getDir,
		path_getFile,
		path_getExtension,
		path_resolveCurrent,
		path_normalize,
		path_win32Normalize,
		path_resolveUrl,
		path_combine,
		path_isRelative
		;
		
	(function(){
	
		
		path_getDir = function(path) {
			return path.substring(0, path.lastIndexOf('/') + 1);
		};
			
		path_getFile = function(path) {
			path = path
				.replace('file://', '')
				.replace(/\\/g, '/')
				.replace(/\?[^\n]+$/, '');
			
			if (/^\/\w+:\/[^\/]/i.test(path)){
				// win32 drive
				return path.substring(1);
			}
			return path;
		};
		
		path_getExtension = function(path) {
			var query = path.indexOf('?');
			if (query === -1) {
				return path.substring(path.lastIndexOf('.') + 1);
			}
			
			return path.substring(path.lastIndexOf('.', query) + 1, query);
		};
		
		path_resolveCurrent = function() {
		
			if (document == null) {
				return typeof module === 'undefined'
					? '' 
					: path_win32Normalize(module.parent.filename);
			}
			var scripts = document.getElementsByTagName('script'),
				last = scripts[scripts.length - 1],
				url = last && last.getAttribute('src') || '';
			
			if (url[0] === '/') {
				return url;
			}
			
			var location = window
				.location
				.pathname
				.replace(/\/[^\/]+\.\w+$/, '');
			
			if (location[location.length - 1] !== '/') {
				location += '/';
			}
			
			return location + url;
		};
		
		path_normalize = function(path) {
			return path
				.replace(/\\/g, '/')
				// remove double slashes, but not near protocol
				.replace(/([^:\/])\/{2,}/g, '$1/')
				;
		};
		
		path_win32Normalize = function(path){
			path = path_normalize(path);
			if (path.substring(0, 5) === 'file:')
				return path;
			
			return 'file:///' + path;
		};
		
		path_resolveUrl = function(url, parent) {
			
			if (reg_hasProtocol.test(url)) 
				return path_collapse(url);
			
			if (url.substring(0, 2) === './') 
				url = url.substring(2);
			
			if (url[0] === '/' && parent != null && parent.base != null) {
				url = path_combine(parent.base, url);
				if (reg_hasProtocol.test(url)) 
					return path_collapse(url);
			}
			if (url[0] === '/' && cfg.path) {
				url = cfg.path + url.substring(1);
				if (reg_hasProtocol.test(url)) 
					return path_collapse(url);
			}
			if (url[0] === '/') {
				if (isWeb === false || cfg.lockedToFolder === true) {
					url = url.substring(1);
				}
			} else if (parent != null && parent.location != null) {
				url = parent.location + url;
			}
		
			return path_collapse(url);
		};
		
		path_isRelative = function(path) {
			var c = path.charCodeAt(0);
			
			switch (c) {
				case 47:
					// /
					return false;
				case 102:
					// f
				case 104:
					// h
					return reg_hasProtocol.test(path) === false;
			}
			
			return true;
		};
		
		path_combine = function() {
			var out = '',
				imax = arguments.length,
				i = -1,
				x
				;
			while ( ++i < imax ){
				x = arguments[i];
				if (!x) 
					continue;
				
				x = path_normalize(x);
				
				if (out === '') {
					out = x;
					continue;
				}
				
				if (out[out.length - 1] !== '/') 
					out += '/'
				
				if (x[0] === '/') 
					x = x.substring(1);
				
				out += x;
			}
			
			return out;
		};
		
		function path_collapse(url) {
			while (url.indexOf('../') !== -1) {
				url = url.replace(reg_subFolder, '');
			}
	
			return url.replace(/\/\.\//g, '/');
		}
		
	}());
		
	
	// end:source ../src/utils/path.js
	// source ../src/utils/tree.js
	var tree_resolveUsage;
	
	
	(function(){
		
		tree_resolveUsage = function(resource, usage, next){
			var use = [],
				imax = usage.length,
				i = -1,
				
				obj, path, name, index, parent
				;
			while( ++i < imax ) {
				
				name = path = usage[i];
				index = path.indexOf('.');
				if ( index !== -1) {
					name = path.substring(0, index);
					path = path.substring(index + 1);
				}
				
				parent = use_resolveParent(name, resource.parent, resource);
				if (parent == null) 
					return null;
				
				if (parent.state !== 4){
					resource.state = 3;
					parent.on(4, next, parent, 'push');
					return null;
				}
				
				obj = parent.exports;
				
				if (name !== path) 
					obj = obj_getProperty(obj, path);
				
				// if DEBUG
				(typeof obj === 'object' && obj == null)
					&& console.warn('<include:use> Used resource has no exports', name, resource.url);
				// endif
				
				use[i] = obj;
			}
			return use;
		};
		
		
		function use_resolveParent(name, resource, initiator){
			
			if (resource == null) {
				// if DEBUG
				console.warn('<include> Usage Not Found:', name);
				console.warn('- Ensure to have it included before with the correct alias')
				console.warn('- Initiator Stacktrace:');
				
				var arr = [], res = initiator;
				while(res != null){
					arr.push(res.url);
					res = res.parent;
				}
				console.warn(arr.join('\n'));
				// endif
				
				return null;
			}
			
			
			var includes = resource.includes,
				i = -1,
				imax = includes.length,
				
				include, exports, alias
				;
				
			while( ++i < imax ) {
				include = includes[i];
				alias = include.route.alias || Routes.parseAlias(include.route);
				if (alias === name) 
					return include.resource;
			}
			
			return use_resolveParent(name, resource.parent, initiator);
		}
		
		
	}());
	// end:source ../src/utils/tree.js
	
	// source ../src/2.Routing.js
	var RoutesLib = function() {
	
		var routes = {},
			regexpAlias = /([^\\\/]+)\.\w+$/;
	
		
			
		return {
			/**
			 *	@param route {String} = Example: '.reference/libjs/{0}/{1}.js'
			 */
			register: function(namespace, route, currentInclude) {
				
				if (typeof route === 'string' && path_isRelative(route)) {
					var res = currentInclude || include,
						location = res.location || path_getDir(res.url || path_resolveCurrent());
						
					if (path_isRelative(location)) {
						location = '/' + location;
					}
					
					route = location + route;
				}
	
				routes[namespace] = route instanceof Array ? route : route.split(/[\{\}]/g);
	
			},
	
			/**
			 *	@param {String} template = Example: 'scroller/scroller.min?ui=black'
			 */
			resolve: function(namespace, template) {
				var questionMark = template.indexOf('?'),
					aliasIndex = template.indexOf('::'),
					alias,
					path,
					params,
					route,
					i,
					x,
					length,
					arr;
					
				
				if (aliasIndex !== -1){
					alias = template.substring(aliasIndex + 2);
					template = template.substring(0, aliasIndex);
				}
				
				if (questionMark !== -1) {
					arr = template.substring(questionMark + 1).split('&');
					params = {};
					
					for (i = 0, length = arr.length; i < length; i++) {
						x = arr[i].split('=');
						params[x[0]] = x[1];
					}
	
					template = template.substring(0, questionMark);
				}
	
				template = template.split('/');
				route = routes[namespace];
				
				if (route == null){
					return {
						path: template.join('/'),
						params: params,
						alias: alias
					};
				}
				
				path = route[0];
				
				for (i = 1; i < route.length; i++) {
					if (i % 2 === 0) {
						path += route[i];
					} else {
						/** if template provides less "breadcrumbs" than needed -
						 * take always the last one for failed peaces */
						
						var index = route[i] << 0;
						if (index > template.length - 1) {
							index = template.length - 1;
						}
						
						
						
						path += template[index];
						
						if (i === route.length - 2){
							for(index++; index < template.length; index++){
								path += '/' + template[index];
							}
						}
					}
				}
	
				return {
					path: path,
					params: params,
					alias: alias
				};
			},
	
			/**
			 *	@arg includeData :
			 *	1. string - URL to resource
			 *	2. array - URLs to resources
			 *	3. object - {route: x} - route defines the route template to resource,
			 *		it must be set before in include.cfg.
			 *		example:
			 *			include.cfg('net','scripts/net/{name}.js')
			 *			include.js({net: 'downloader'}) // -> will load scipts/net/downloader.js
			 *	@arg namespace - route in case of resource url template, or namespace in case of LazyModule
			 *
			 *	@arg fn - callback function, which receives namespace|route, url to resource and ?id in case of not relative url
			 *	@arg xpath - xpath string of a lazy object 'object.sub.and.othersub';
			 */
			each: function(type, includeData, fn, namespace, xpath) {
				var key;
	
				if (includeData == null) {
					return;
				}
	
				if (type === 'lazy' && xpath == null) {
					for (key in includeData) {
						this.each(type, includeData[key], fn, null, key);
					}
					return;
				}
				if (includeData instanceof Array) {
					for (var i = 0; i < includeData.length; i++) {
						this.each(type, includeData[i], fn, namespace, xpath);
					}
					return;
				}
				if (typeof includeData === 'object') {
					for (key in includeData) {
						if (hasOwnProp.call(includeData, key)) {
							this.each(type, includeData[key], fn, key, xpath);
						}
					}
					return;
				}
	
				if (typeof includeData === 'string') {
					var x = this.resolve(namespace, includeData);
					if (namespace){
						namespace += '.' + includeData;
					}
					
					fn(namespace, x, xpath);
					return;
				}
				
				console.error('Include Package is invalid', arguments);
			},
	
			getRoutes: function(){
				return routes;
			},
			
			parseAlias: function(route){
				var path = route.path,
					result = regexpAlias.exec(path);
				
				return result && result[1];
			}
		};
		
	};
	
	var Routes = RoutesLib();
	
	
	/*{test}
	
	console.log(JSON.stringify(Routes.resolve(null,'scroller.js::Scroller')));
	
	Routes.register('lib', '.reference/libjs/{0}/lib/{1}.js');
	console.log(JSON.stringify(Routes.resolve('lib','scroller::Scroller')));
	console.log(JSON.stringify(Routes.resolve('lib','scroller/scroller.mobile?ui=black')));
	
	Routes.register('framework', '.reference/libjs/framework/{0}.js');
	console.log(JSON.stringify(Routes.resolve('framework','dom/jquery')));
	
	
	*/
	// end:source ../src/2.Routing.js
	// source ../src/3.Events.js
	var Events = (function(document) {
		if (document == null) {
			return {
				ready: fn_doNothing,
				load: fn_doNothing
			};
		}
		var readycollection = [];
	
		function onReady() {
			Events.ready = fn_doNothing;
	
			if (readycollection == null) {
				return;
			}
	
			arr_invoke(readycollection);
			readycollection = null;
		}
	
		/** TODO: clean this */
	
		if ('onreadystatechange' in document) {
			document.onreadystatechange = function() {
				if (/complete|interactive/g.test(document.readyState) === false) {
					return;
				}
				onReady();
			};
		} else if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', onReady);
		}else {
			window.onload = onReady;
		}
	
	
		return {
			ready: function(callback) {
				readycollection.unshift(callback);
			}
		};
	})(document);
	
	// end:source ../src/3.Events.js
    // source ../src/6.ScriptStack.js
    /** @TODO Refactor loadBy* {combine logic} */
    
    var ScriptStack = (function() {
    
    	var head,
    		currentResource,
    		stack = [],
    		
    		_cb_complete = [],
    		_paused;
    		
    		
    	function loadScript(url, callback) {
    		//console.log('load script', url);
    		var tag = document.createElement('script');
    		tag.type = 'text/javascript';
    		tag.src = url;
    
    		if ('onreadystatechange' in tag) {
    			tag.onreadystatechange = function() {
    				(this.readyState === 'complete' || this.readyState === 'loaded') && callback();
    			};
    		} else {
    			tag.onload = tag.onerror = callback;
    		}
    		
    		;(head || (head = document.getElementsByTagName('head')[0])).appendChild(tag);
    	}
    
    	function loadByEmbedding() {
    		if (_paused) {
    			return;
    		}
    		
    		if (stack.length === 0){
    			trigger_complete();
    			return;
    		}
    
    		if (currentResource != null) {
    			return;
    		}
    
    		var resource = (currentResource = stack[0]);
    
    		if (resource.state === 1) {
    			return;
    		}
    
    		resource.state = 1;
    
    		global.include = resource;
    		global.iparams = resource.route.params;
    
    
    		function resourceLoaded(e) {
    
    
    			if (e && e.type === 'error') {
    				console.log('Script Loaded Error', resource.url);
    			}
    
    			var i = 0,
    				length = stack.length;
    
    			for (; i < length; i++) {
    				if (stack[i] === resource) {
    					stack.splice(i, 1);
    					break;
    				}
    			}
    
    			if (i === length) {
    				console.error('Loaded Resource not found in stack', resource);
    				return;
    			}
    
    			if (resource.state !== 2.5) 
    				resource.readystatechanged(3);
    			currentResource = null;
    			loadByEmbedding();
    		}
    
    		if (resource.source) {
    			__eval(resource.source, resource);
    
    			resourceLoaded();
    			return;
    		}
    
    		loadScript(resource.url, resourceLoaded);
    	}
    	
    	function processByEval() {
    		if (_paused) {
    			return;
    		}
    		
    		if (stack.length === 0){
    			trigger_complete();
    			return;
    		}
    		
    		if (currentResource != null) {
    			return;
    		}
    
    		var resource = stack[0];
    
    		if (resource.state < 2) {
    			return;
    		}
    
    		currentResource = resource;
    
    		resource.state = 1;
    		global.include = resource;
    
    		//console.log('evaling', resource.url, stack.length);
    		__eval(resource.source, resource);
    
    		for (var i = 0, x, length = stack.length; i < length; i++) {
    			x = stack[i];
    			if (x === resource) {
    				stack.splice(i, 1);
    				break;
    			}
    		}
    
    		if (resource.state !== 2.5) 
    			resource.readystatechanged(3);
    		currentResource = null;
    		processByEval();
    
    	}
    	
    	
    	function trigger_complete() {
    		var i = -1,
    			imax = _cb_complete.length;
    		while (++i < imax) {
    			_cb_complete[i]();
    		}
    		
    		_cb_complete.length = 0;
    	}
    
    	
    
    	return {
    		load: function(resource, parent, forceEmbed) {
    
    			this.add(resource, parent);
    
    			if (!cfg.eval || forceEmbed) {
    				loadByEmbedding();
    				return;
    			}
    
    			// was already loaded, with custom loader for example
    			if (resource.source) {
    				resource.state = 2;
    				processByEval();
    				return;
    			}
    
    			XHR(resource, function(resource, response) {
    				if (!response) {
    					console.error('Not Loaded:', resource.url);
    					console.error('- Initiator:', resource.parent && resource.parent.url || '<root resource>');
    				}
    
    				resource.source = response;
    				resource.state = 2;
    
    				processByEval();
    			});
    		},
    		
    		add: function(resource, parent){
    			
    			if (resource.priority === 1) 
    				return stack.unshift(resource);
    			
    			
    			if (parent == null) 
    				return stack.push(resource);
    				
    			
    			var imax = stack.length,
    				i = -1
    				;
    			// move close to parent
    			while( ++i < imax){
    				if (stack[i] === parent) 
    					return stack.splice(i, 0, resource);
    			}
    			
    			// was still not added
    			stack.push(resource);
    		},
    		
    		/* Move resource in stack close to parent */
    		moveToParent: function(resource, parent) {
    			var length = stack.length,
    				parentIndex = -1,
    				resourceIndex = -1,
    				i;
    
    			for (i = 0; i < length; i++) {
    				if (stack[i] === resource) {
    					resourceIndex = i;
    					break;
    				}
    			}
    
    			if (resourceIndex === -1) {
    				return;
    			}
    
    			for (i= 0; i < length; i++) {
    				if (stack[i] === parent) {
    					parentIndex = i;
    					break;
    				}
    			}
    
    			if (parentIndex === -1) {
    				return;
    			}
    
    			if (resourceIndex < parentIndex) {
    				return;
    			}
    
    			stack.splice(resourceIndex, 1);
    			stack.splice(parentIndex, 0, resource);
    
    
    		},
    		
    		pause: function(){
    			_paused = true;
    		},
    		
    		resume: function(){
    			_paused = false;
    			
    			if (currentResource != null) 
    				return;
    			
    			this.touch();
    		},
    		
    		touch: function(){
    			var fn = cfg.eval
    				? processByEval
    				: loadByEmbedding
    				;
    			fn();
    		},
    		
    		complete: function(callback){
    			if (_paused !== true && stack.length === 0) {
    				callback();
    				return;
    			}
    			
    			_cb_complete.push(callback);
    		}
    	};
    })();
    
    // end:source ../src/6.ScriptStack.js
    
	// source ../src/4.IncludeDeferred.js 
	
	/**
	 * STATES:
	 * 0: Resource Created
	 * 1: Loading
	 * 2: Loaded - Evaluating
	 * 2.5: Paused - Evaluating paused
	 * 3: Evaluated - Childs Loading
	 * 4: Childs Loaded - Completed
	 */
	
	var IncludeDeferred = function() {
		this.callbacks = [];
		this.state = -1;
	};
	
	IncludeDeferred.prototype = { /**	state observer */
	
		on: function(state, callback, sender, mutator) {
			if (this === sender && this.state === -1) {
				callback(this);
				return this;
			}
			
			// this === sender in case when script loads additional
			// resources and there are already parents listeners
			
			if (mutator == null) {
				mutator = (this.state < 3 || this === sender)
					? 'unshift'
					: 'push'
					;
			}
			
			state <= this.state ? callback(this) : this.callbacks[mutator]({
				state: state,
				callback: callback
			});
			return this;
		},
		readystatechanged: function(state) {
	
			var i, length, x, currentInclude;
	
			if (state > this.state) {
				this.state = state;
			}
	
			if (this.state === 3) {
				var includes = this.includes;
	
				if (includes != null && includes.length) {
					for (i = 0; i < includes.length; i++) {
						if (includes[i].resource.state !== 4) {
							return;
						}
					}
				}
	
				this.state = 4;
			}
	
			i = 0;
			length = this.callbacks.length;
	
			if (length === 0){
				return;
			}
	
			//do not set asset resource to global
			if (this.type === 'js' && this.state === 4) {
				currentInclude = global.include;
				global.include = this;
			}
	
			for (; i < length; i++) {
				x = this.callbacks[i];
				if (x == null || x.state > this.state) {
					continue;
				}
	
				this.callbacks.splice(i,1);
				length--;
				i--;
	
				/* if (!DEBUG)
				try {
				*/
					x.callback(this);
				/* if (!DEBUG)
				} catch(error){
					console.error(error.toString(), 'file:', this.url);
				}
				*/
	
				if (this.state < 4){
					break;
				}
			}
	
			if (currentInclude != null){
				global.include = currentInclude;
			}
		},
	
		/** assets loaded and DomContentLoaded */
	
		ready: function(callback) {
			var that = this;
			return this.on(4, function() {
				Events.ready(function(){
					that.resolve(callback);
				});
			}, this);
		},
	
		/** assets loaded */
		done: function(callback) {
			var that = this;
			return this.on(4, function(){
				that.resolve(callback);
			}, this);
		},
		resolve: function(callback) {
			var includes = this.includes,
				length = includes == null
					? 0
					: includes.length
					;
	
			if (length > 0 && this.response == null){
				this.response = {};
	
				var resource,
					route;
	
				for(var i = 0, x; i < length; i++){
					x = includes[i];
					resource = x.resource;
					route = x.route;
	
					if (typeof resource.exports === 'undefined')
						continue;
					
					var type = resource.type;
					switch (type) {
					case 'js':
					case 'load':
					case 'ajax':
	
						var alias = route.alias || Routes.parseAlias(route),
							obj = type === 'js'
								? (this.response)
								: (this.response[type] || (this.response[type] = {}))
								;
	
						if (alias != null) {
							obj_setProperty(obj, alias, resource.exports);
							break;
						}
						console.warn('<includejs> Alias is undefined', resource);
						break;
					}
				}
			} 
			
			var response = this.response || emptyResponse;
			var that = this;
			if (this._use == null && this._usage != null){
				this._use = tree_resolveUsage(this, this._usage, function(){
					that.state = 4;
					that.resolve(callback);
					that.readystatechanged(4);
				});
				if (this.state < 4)
					return;
			}
			if (this._use) {
				callback.apply(null, [response].concat(this._use));
				return;
			}
			
			callback(response);
		}
	};
	
	// end:source ../src/4.IncludeDeferred.js 
	// source ../src/5.Include.js 
	var Include,
		IncludeLib = {};
	(function(IncludeDeferred) {
	
		Include = function() {
			IncludeDeferred.call(this);
		};
	
		stub_release(Include.prototype);
		
		obj_inherit(Include, IncludeDeferred, {
			// Array: exports
			_use: null,
			
			// Array: names
			_usage: null,
			
			isBrowser: true,
			isNode: false,
			
			setCurrent: function(data) {
				var url = data.url,
					resource = this.getResourceById(url, 'js');
					
				if (resource == null) {
					if (url[0] === '/' && this.base)
						url = this.base + url.substring(1);
							
					var resource = new Resource(
						'js'
						, { path: url }
						, data.namespace
						, null
						, null
						, url);
				}
				if (resource.state < 3) {
					console.error("<include> Resource should be loaded", data);
				}
	
				/**@TODO - probably state shoulb be changed to 2 at this place */
				resource.state = 3;
				global.include = resource;
			},
			
			cfg: function(arg) {
				switch (typeof arg) {
				case 'object':
					var key, value;
					for (key in arg) {
						value = arg[key];
	
						switch(key){
							case 'loader':
								for(var x in value){
									CustomLoader.register(x, value[x]);
								}
								break;
							case 'modules':
								if (value === true){
									enableModules();
								}
								break;
							default:
								cfg[key] = value;
								break;
						}
	
					}
					break;
				case 'string':
					if (arguments.length === 1) {
						return cfg[arg];
					}
					if (arguments.length === 2) {
						cfg[arg] = arguments[1];
					}
					break;
				case 'undefined':
					return cfg;
				}
				return this;
			},
			routes: function(mix) {
				if (mix == null) {
					return Routes.getRoutes();
				}
				
				if (arguments.length === 2) {
					Routes.register(mix, arguments[1], this);
					return this;
				}
				
				for (var key in mix) {
					Routes.register(key, mix[key], this);
				}
				return this;
			},
			promise: function(namespace) {
				var arr = namespace.split('.'),
					obj = global;
				while (arr.length) {
					var key = arr.shift();
					obj = obj[key] || (obj[key] = {});
				}
				return obj;
			},
			/** @TODO - `id` property seems to be unsed and always equal to `url` */
			register: function(_bin) {
				
				var base = this.base,
					key,
					info,
					infos,
					imax,
					i;
				
				function transform(info){
					if (base == null) 
						return info;
					if (info.url[0] === '/')
						info.url = base + info.url.substring(1);
	
					if (info.parent[0] === '/')
						info.parent = base + info.parent.substring(1);
					
					info.id = info.url;
					return info;
				}
				
				for (key in _bin) {
					infos = _bin[key];
					imax = infos.length;
					i = -1;
					
					while ( ++i < imax ) {
						
						info = transform(infos[i]);
						
						var id = info.id,
							url = info.url,
							namespace = info.namespace,
							parent = info.parent && incl_getResource(info.parent, 'js'),
							resource = new Resource(),
							state = info.state
							;
						if (! (id || url)) 
							continue;
						
						if (url) {
							if (url[0] === '/') {
								url = url.substring(1);
							}
							resource.location = path_getDir(url);
						}
						
						
						resource.state = state == null
							? (key === 'js' ? 3 : 4)
							: state
							;
						resource.namespace = namespace;
						resource.type = key;
						resource.url = url || id;
						resource.parent = parent;
						resource.base = parent && parent.base || base;
	
						switch (key) {
						case 'load':
						case 'lazy':
							var container = document.querySelector('#includejs-' + id.replace(/\W/g, ''));
							if (container == null) {
								console.error('"%s" Data was not embedded into html', id);
								break;
							}
							resource.exports = container.innerHTML;
							if (CustomLoader.exists(resource)){
								
								resource.state = 3;
								CustomLoader.load(resource, CustomLoader_onComplete);
							}
							break;
						}
						
						//
						(bin[key] || (bin[key] = {}))[id] = resource;
					}
				}
				function CustomLoader_onComplete(resource, response) {
					resource.exports = response;
					resource.readystatechanged(4);
				}
			},
			/**
			 *	Create new Resource Instance,
			 *	as sometimes it is necessary to call include. on new empty context
			 */
			instance: function(url, parent) {
				var resource;
				if (url == null) {
					resource = new Include();
					resource.state = 4;
					
					return resource;
				}
				
				resource = new Resource();
				resource.state = 4;
				resource.location = path_getDir(path_normalize(url));
				resource.parent = parent;
				return resource;
			},
	
			getResource: function(url, type){
				if (this.base && url[0] === '/')
					url = this.base + url.substring(1);
				
				return incl_getResource(url, type)
			},
			getResourceById: function(url, type){
				var _bin = bin[type],
					_res = _bin[url];
				if (_res != null) 
					return _res;
				
				if (this.base && url[0] === '/') {
					_res = _bin[path_combine(this.base, url)];
					if (_res != null) 
						return _res;
				}
				if (this.base && this.location) {
					_res = _bin[path_combine(this.base, this.location, url)];
					if (_res != null) 
						return _res;
				}
				if (this.location) {
					_res = _bin[path_combine(this.location, url)];
					if (_res != null) 
						return _res;
				}
				return null;
			},
			getResources: function(){
				return bin;
			},
	
			plugin: function(pckg, callback) {
	
				var urls = [],
					length = 0,
					j = 0,
					i = 0,
					onload = function(url, response) {
						j++;
	
						embedPlugin(response);
	
						if (j === length - 1 && callback) {
							callback();
							callback = null;
						}
					};
				Routes.each('', pckg, function(namespace, route) {
					urls.push(route.path[0] === '/' ? route.path.substring(1) : route.path);
				});
	
				length = urls.length;
	
				for (; i < length; i++) {
					XHR(urls[i], onload);
				}
				return this;
			},
			
			client: function(){
				if (cfg.server === true) 
					stub_freeze(this);
				
				return this;
			},
			
			server: function(){
				if (cfg.server !== true) 
					stub_freeze(this);
				
				return this;
			},
			
			use: function(){
				if (this.parent == null) {
					console.error('<include.use> Parent resource is undefined');
					return this;
				}
				
				this._usage = arguments;
				return this;
			},
			
			pauseStack: fn_proxy(ScriptStack.pause, ScriptStack),
			resumeStack: fn_proxy(ScriptStack.resume, ScriptStack),
			
			allDone: function(callback){
				ScriptStack.complete(function(){
					
					var pending = include.getPending('js'),
						await = pending.length;
					if (await === 0) {
						callback();
						return;
					}
					
					var i = -1,
						imax = await;
					while( ++i < imax ){
						pending[i].on(4, check);
					}
					
					function check() {
						if (--await < 1) 
							callback();
					}
				});
			},
			
			getPending: function(type){
				var resources = [],
					res, key, id;
				
				for(key in bin){
					if (type != null && type !== key) 
						continue;
					
					for (id in bin[key]){
						res = bin[key][id];
						if (res.state < 4)
							resources.push(res);
					}
				}
				
				return resources;
			},
			Lib: IncludeLib
		});
		
		
		// >> FUNCTIONS
		
		function incl_getResource(url, type) {
			var id = url;
			
			if (path_isRelative(url) === true) 
				id = '/' + id;
			
			if (type != null){
				return bin[type][id];
			}
	
			for (var key in bin) {
				if (bin[key].hasOwnProperty(id)) {
					return bin[key][id];
				}
			}
			return null;
		}
		
		
		function embedPlugin(source) {
			eval(source);
		}
		
		function enableModules() {
			if (typeof Object.defineProperty === 'undefined'){
				console.warn('Browser do not support Object.defineProperty');
				return;
			}
			Object.defineProperty(global, 'module', {
				get: function() {
					return global.include;
				}
			});
	
			Object.defineProperty(global, 'exports', {
				get: function() {
					var current = global.include;
					return (current.exports || (current.exports = {}));
				},
				set: function(exports) {
					global.include.exports = exports;
				}
			});
		}
		
		function includePackage(resource, type, mix){
			var pckg = mix.length === 1 ? mix[0] : __array_slice.call(mix);
			
			if (resource instanceof Resource) {
				return resource.include(type, pckg);
			}
			return new Resource('js').include(type, pckg);
		}
		
		function createIncluder(type) {
			return function(){
				return includePackage(this, type, arguments);
			};
		}
		
		function doNothing() {
			return this;
		}
		
		function stub_freeze(include) {
			include.js =
			include.css =
			include.load =
			include.ajax =
			include.embed =
			include.lazy =
			include.inject =
				doNothing;
		}
		
		function stub_release(proto) {
			var fns = ['js', 'css', 'load', 'ajax', 'embed', 'lazy'],
				i = fns.length;
			while (--i !== -1){
				proto[fns[i]] = createIncluder(fns[i]);
			}
			
			proto['inject'] = proto.js;
		}
		
	}(IncludeDeferred));
	
	// end:source ../src/5.Include.js 
	// source ../src/7.CustomLoader.js
	var CustomLoader = (function() {
	
		// source loader/json.js
			
		var JSONParser = {
			process: function(source, res){
				try {
					return JSON.parse(source);
				} catch(error) {
					console.error(error, source);
					return null;
				}
			}
		};
		
		
		// end:source loader/json.js
	
		cfg.loader = {
			json : JSONParser
		};
		
		function loader_isInstance(x) {
			if (typeof x === 'string')
				return false;
			
			return typeof x.ready === 'function' || typeof x.process === 'function';
		}
		
		function createLoader(url) {
			var extension = path_getExtension(url),
				loader = cfg.loader[extension];
	
			if (loader_isInstance(loader)) {
				return loader;
			}
	
			var path = loader,
				namespace;
	
			if (typeof path === 'object') {
				// is route {namespace: path}
				for (var key in path) {
					namespace = key;
					path = path[key];
					break;
				}
			}
	
			return (cfg.loader[extension] = new Resource(
				'js',
				Routes.resolve(namespace, path),
				namespace,
				null,
				null,
				null,
				1
			));
		}
		
		function loader_completeDelegate(callback, resource) {
			return function(response){
				callback(resource, response);
			};
		}
		
		function loader_process(source, resource, loader, callback) {
			if (loader.process == null) {
				callback(resource, source);
				return;
			}
			
			var delegate = loader_completeDelegate(callback, resource),
				syncResponse = loader.process(source, resource, delegate);
			
			// match also null
			if (typeof syncResponse !== 'undefined') {
				callback(resource, syncResponse);
			}
		}
		
		function tryLoad(resource, loader, callback) {
			if (typeof resource.exports === 'string') {
				loader_process(resource.exports, resource, loader, callback);
				return;
			}
			
			function onLoad(resource, response){
				loader_process(response, resource, loader, callback);
			}
			
			if (loader.load) 
				return loader.load(resource, onLoad);
			
			XHR(resource, onLoad);
		}
	
		return {
			load: function(resource, callback) {
	
				var loader = createLoader(resource.url);
				
				if (loader.process) {
					tryLoad(resource, loader, callback);
					return;
				}
				
				loader.on(4, function() {
					tryLoad(resource, loader.exports, callback);
				}, null, 'push');
			},
			exists: function(resource) {
				if (!resource.url) {
					return false;
				}
	
				var ext = path_getExtension(resource.url);
	
				return cfg.loader.hasOwnProperty(ext);
			},
			
			/**
			 *	IHandler:
			 *	{ process: function(content) { return _handler(content); }; }
			 *
			 *	Url:
			 *	 path to IHandler
			 */
			register: function(extension, handler){
				if (typeof handler === 'string'){
					var resource = include;
					if (resource.location == null) { 
						resource = {
							location: path_getDir(path_resolveCurrent())
						};
					}
	
					handler = path_resolveUrl(handler, resource);
				}
	
				cfg.loader[extension] = handler;
			}
		};
	}());
	
	// end:source ../src/7.CustomLoader.js
	// source ../src/8.LazyModule.js
	var LazyModule = {
		create: function(xpath, code) {
			var arr = xpath.split('.'),
				obj = global,
				module = arr[arr.length - 1];
			while (arr.length > 1) {
				var prop = arr.shift();
				obj = obj[prop] || (obj[prop] = {});
			}
			arr = null;
	
			Object.defineProperty(obj, module, {
				get: function() {
	
					delete obj[module];
					try {
						var r = __eval(code, global.include);
						if (!(r == null || r instanceof Resource)){
							obj[module] = r;
						}
					} catch (error) {
						error.xpath = xpath;
						Helper.reportError(error);
					} finally {
						code = null;
						xpath = null;
						return obj[module];
					}
				}
			});
		}
	};
	// end:source ../src/8.LazyModule.js
	// source ../src/9.Resource.js
	var Resource;
	
	(function(Include, Routes, ScriptStack, CustomLoader) {
	
		Resource = function(type, route, namespace, xpath, parent, id, priority) {
			Include.call(this);
			
			this.childLoaded = fn_proxy(this.childLoaded, this);
	
			var url = route && route.path;
			if (url != null) 
				this.url = url = path_resolveUrl(url, parent);
			
			this.type = type;
			this.xpath = xpath;
			this.route = route;
			this.parent = parent;
			this.priority = priority;
			this.namespace = namespace;
			this.base = parent && parent.base;
	
			if (id == null && url) 
				id = (path_isRelative(url) ? '/' : '') + url;
			
			var resource = bin[type] && bin[type][id];
			if (resource) {
	
				if (resource.state < 4 && type === 'js') 
					ScriptStack.moveToParent(resource, parent);
				
				return resource;
			}
	
			if (url == null) {
				this.state = 3;
				this.location = path_getDir(path_resolveCurrent());
				return this;
			}
	
			this.state = 0;
			this.location = path_getDir(url);
	
			(bin[type] || (bin[type] = {}))[id] = this;
	
			if (cfg.version) 
				this.url += (this.url.indexOf('?') === -1 ? '?' : '&') + 'v=' + cfg.version;
			
			return process(this);
	
		};
	
		Resource.prototype = obj_inherit(Resource, Include, {
			
			state: null,
			location: null,
			includes: null,
			response: null,
			
			url: null,
			base: null,
			type: null,
			xpath: null,
			route: null,
			parent: null,
			priority: null,
			namespace: null,
			
			setBase: function(baseUrl){
				this.base = baseUrl;
				return this;
			},
			
			childLoaded: function(child) {
				var resource = this,
					includes = resource.includes;
				if (includes && includes.length) {
					if (resource.state < 3) {
						// resource still loading/include is in process, but one of sub resources are already done
						return;
					}
					for (var i = 0; i < includes.length; i++) {
						if (includes[i].resource.state !== 4) {
							return;
						}
					}
				}
				resource.readystatechanged(4);
			},
			create: function(type, route, namespace, xpath, id) {
				var resource;
	
				this.state = this.state >= 3
					? 3
					: 2;
				this.response = null;
	
				if (this.includes == null) 
					this.includes = [];
				
	
				resource = new Resource(type, route, namespace, xpath, this, id);
	
				this.includes.push({
					resource: resource,
					route: route
				});
	
				return resource;
			},
			include: function(type, pckg) {
				var that = this,
					children = [],
					child;
				Routes.each(type, pckg, function(namespace, route, xpath) {
	
					if (that.route != null && that.route.path === route.path) {
						// loading itself
						return;
					}
					child = that.create(type, route, namespace, xpath);
					children.push(child);
				});
				
				var i = -1,
					imax = children.length;
				while ( ++i < imax ){
					children[i].on(4, this.childLoaded);
				}
	
				return this;
			},
			
			pause: function(){
				this.state = 2.5;
				
				var that = this;
				return function(exports){
					
					if (arguments.length === 1) 
						that.exports = exports;
					
					that.readystatechanged(3);
				};
			},
			
			getNestedOfType: function(type){
				return resource_getChildren(this.includes, type);
			}
		});
		
		// private
		
		function process(resource) {
			var type = resource.type,
				parent = resource.parent,
				url = resource.url;
				
			if (document == null && type === 'css') {
				resource.state = 4;
				return resource;
			}
	
			if (CustomLoader.exists(resource) === false) {
				switch (type) {
					case 'js':
					case 'embed':
						ScriptStack.load(resource, parent, type === 'embed');
						break;
					case 'ajax':
					case 'load':
					case 'lazy':
						XHR(resource, onXHRCompleted);
						break;
					case 'css':
						resource.state = 4;
	
						var tag = document.createElement('link');
						tag.href = url;
						tag.rel = "stylesheet";
						tag.type = "text/css";
						document.getElementsByTagName('head')[0].appendChild(tag);
						break;
				}
			} else {
				
				if ('js' === type || 'embed' === type) {
					ScriptStack.add(resource, resource.parent);
				}
				
				CustomLoader.load(resource, onXHRCompleted);
			}
	
			return resource;
		}
	
		function onXHRCompleted(resource, response) {
			if (!response) {
				console.warn('Resource cannt be loaded', resource.url);
				//- resource.readystatechanged(4);
				//- return;
			}
	
			switch (resource.type) {
				case 'js':
				case 'embed':
					resource.source = response;
					resource.state = 2;
					ScriptStack.touch();
					return;
				case 'load':
				case 'ajax':
					resource.exports = response;
					break;
				case 'lazy':
					LazyModule.create(resource.xpath, response);
					break;
				case 'css':
					var tag = document.createElement('style');
					tag.type = "text/css";
					tag.innerHTML = response;
					document.getElementsByTagName('head')[0].appendChild(tag);
					break;
			}
	
			resource.readystatechanged(4);
		}
	
		function resource_getChildren(includes, type, out) {
			if (includes == null) 
				return null;
			
			if (out == null) 
				out = [];
			
			var imax = includes.length,
				i = -1,
				x;
			while ( ++i < imax ){
				x = includes[i].resource;
				
				if (type === x.type) 
					out.push(x);
				
				if (x.includes != null) 
					resource_getChildren(x.includes, type, out);
			}
			return out;
		}
		
	}(Include, Routes, ScriptStack, CustomLoader));
	// end:source ../src/9.Resource.js
	
	// source ../src/10.export.js
	IncludeLib.Routes = RoutesLib;
	IncludeLib.Resource = Resource;
	IncludeLib.ScriptStack = ScriptStack;
	IncludeLib.registerLoader = CustomLoader.register;
	
	exports.include = new Include();
	exports.includeLib = IncludeLib;
	
	
	
	// end:source ../src/10.export.js
}));

// source ../src/global-vars.js

function __eval(source, include) {
	"use strict";
	
	var iparams = include && include.route.params;

	/* if !DEBUG
	try {
	*/
		return eval.call(window, source);
	
	/* if !DEBUG
	} catch (error) {
		error.url = include && include.url;
		//Helper.reportError(error);
		console.error(error);
	}
	*/
	
}
// end:source ../src/global-vars.js// source /src/license.txt
/*!
 * MaskJS v0.12.3
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, 2014 Atma.js and other contributors
 */
// end:source /src/license.txt
// source /src/umd-head.js
(function (root, factory) {
    'use strict';
    
    var _global = typeof window === 'undefined' || window.navigator == null
		? global
		: window,
		
		_exports, _document;

    
	if (typeof exports !== 'undefined' && (root == null || root === exports || root === _global)){
		// raw commonjs module
        root = exports;
    }
	
    
    _document = _global.document;
	_exports = root || _global;
    

    function construct(){
        return factory(_global, _exports, _document);
    }

    
    if (typeof define === 'function' && define.amd) {
        return define(construct);
    }
    
	// Browser OR Node
    return construct();

}(this, function (global, exports, document) {
    'use strict';

// end:source /src/umd-head.js

	// source /ref-utils/lib/utils.embed.js
	// source /src/coll.js
	var coll_each,
		coll_remove,
		coll_map,
		coll_indexOf,
		coll_find;
	(function(){
		coll_each = function(coll, fn, ctx){
			if (ctx == null) 
				ctx = coll;
			if (coll == null) 
				return coll;
			
			var imax = coll.length,
				i = 0;
			for(; i< imax; i++){
				fn.call(ctx, coll[i], i);
			}
			return ctx;
		};
		coll_indexOf = function(coll, x){
			if (coll == null) 
				return -1;
			var imax = coll.length,
				i = 0;
			for(; i < imax; i++){
				if (coll[i] === x) 
					return i;
			}
			return -1;
		};
		coll_remove = function(coll, x){
			var i = coll_indexOf(coll, x);
			if (i === -1) 
				return false;
			coll.splice(i, 1);
			return true;
		};
		coll_map = function(coll, fn, ctx){
			var arr = new Array(coll.length);
			coll_each(coll, function(x, i){
				arr[i] = fn.call(this, x, i);
			}, ctx);
			return arr;
		};
		coll_find = function(coll, fn, ctx){
			var imax = coll.length,
				i = 0;
			for(; i < imax; i++){
				if (fn.call(ctx || coll, coll[i], i))
					return true;
			}
			return false;
		};
	}());
	// end:source /src/coll.js
	
	// source /src/polyfill/arr.js
	if (Array.prototype.forEach === void 0) {
		Array.prototype.forEach = function(fn, ctx){
			coll_each(this, fn, ctx);
		};
	}
	if (Array.prototype.indexOf === void 0) {
		Array.prototype.indexOf = function(x){
			return coll_indexOf(this, x);
		};
	}
	
	// end:source /src/polyfill/arr.js
	// source /src/polyfill/str.js
	if (String.prototype.trim == null){
		String.prototype.trim = function(){
			var start = -1,
				end = this.length,
				code;
			if (end === 0) 
				return this;
			while(++start < end){
				code = this.charCodeAt(start);
				if (code > 32)
					break;
			}
			while(--end !== 0){
				code = this.charCodeAt(end);
				if (code > 32)
					break;
			}
			return start !== 0 && end !== length - 1
				? this.substring(start, end + 1)
				: this;
		};
	}
	// end:source /src/polyfill/str.js
	// source /src/polyfill/fn.js
	
	if (Function.prototype.bind == null) {
		var _Array_slice;
		Function.prototype.bind = function(){
			if (arguments.length < 2 && typeof arguments[0] === "undefined") 
				return this;
			var fn = this,
				args = _Array_slice.call(arguments),
				ctx = args.shift();
			return function() {
				return fn.apply(ctx, args.concat(_Array_slice.call(arguments)));
			};
		};
	}
	// end:source /src/polyfill/fn.js
	
	// source /src/is.js
	var is_Function,
		is_Array,
		is_ArrayLike,
		is_String,
		is_Object,
		is_notEmptyString,
		is_rawObject;
	
	(function() {
		is_Function = function(x) {
			return typeof x === 'function';
		};
		is_Object = function(x) {
			return x != null && typeof x === 'object';
		};
		is_Array = is_ArrayLike = function(arr) {
			return arr != null
				&& typeof arr === 'object'
				&& typeof arr.length === 'number'
				&& typeof arr.slice === 'function'
				;
		};
		is_String = function(x) {
			return typeof x === 'string';
		};
		is_notEmptyString = function(x) {
			return typeof x === 'string' && x !== '';
		};
		is_rawObject = function(obj) {
			if (obj == null || typeof obj !== 'object')
				return false;
	
			return obj.constructor === Object;
		};
	}());
	// end:source /src/is.js
	// source /src/obj.js
	var obj_getProperty,
		obj_setProperty,
		obj_extend,
		obj_create;
	(function(){
		obj_getProperty = function(obj, path){
			if ('.' === path) // obsolete
				return obj;
			
			var chain = path.split('.'),
				imax = chain.length,
				i = -1;
			while ( obj != null && ++i < imax ) {
				obj = obj[chain[i]];
			}
			return obj;
		};
		obj_setProperty = function(obj, path, val) {
			var chain = path.split('.'),
				imax = chain.length - 1,
				i = -1,
				key;
			while ( ++i < imax ) {
				key = chain[i];
				if (obj[key] == null) 
					obj[key] = {};
				
				obj = obj[key];
			}
			obj[chain[i]] = val;
		};
		obj_extend = function(a, b){
			if (b == null)
				return a || {};
			
			if (a == null)
				return obj_create(b);
			
			for(var key in b){
				a[key] = b[key];
			}
			return a;
		};
		obj_create = Object.create || function(x) {
			var Ctor = function(){};
			Ctor.prototype = x;
			return new Ctor;
		};
	}());
	// end:source /src/obj.js
	// source /src/arr.js
	var arr_remove,
		arr_each,
		arr_indexOf,
		arr_contains;
	(function(){
		arr_remove = function(array, x){
			var i = array.indexOf(x);
			if (i === -1) 
				return false;
			array.splice(i, 1);
			return true;
		};
		arr_each = function(arr, fn, ctx){
			arr.forEach(fn, ctx);
		};
		arr_indexOf = function(arr, x){
			return arr.indexOf(x);
		};
		arr_contains = function(arr, x){
			return arr.indexOf(x) !== -1;
		};
	}());
	// end:source /src/arr.js
	// source /src/fn.js
	var fn_proxy,
		fn_apply,
		fn_doNothing;
	(function(){
		fn_proxy = function(fn, ctx) {
			return function(){
				return fn_apply(fn, ctx, arguments);
			};
		};
		
		fn_apply = function(fn, ctx, args){
			var l = args.length;
			if (0 === l) 
				return fn.call(ctx);
			if (1 === l) 
				return fn.call(ctx, args[0]);
			if (2 === l) 
				return fn.call(ctx, args[0], args[1]);
			if (3 === l) 
				return fn.call(ctx, args[0], args[1], args[2]);
			if (4 === l)
				return fn.call(ctx, args[0], args[1], args[2], args[3]);
			
			return fn.apply(ctx, args);
		};
		
		fn_doNothing = function(){
			return false;
		};
	}());
	// end:source /src/fn.js
	// source /src/class.js
	var class_create;
	(function(){
		class_create = function () {
			var args = _Array_slice.call(arguments),
				Proto = args.pop();
			if (Proto == null) {
				Proto = {};
			}
			var Ctor = Proto.hasOwnProperty('constructor')
					? Proto.constructor
					: null,
				BaseCtor;
			
			
			var i = args.length, x, Parent;
			while ( --i > -1 ) {
				x = args[i];
				if (typeof x === 'function') {
					if (Ctor == null && BaseCtor == null) 
						BaseCtor = x;
					
					x = x.prototype;
				}
				for(var key in x){
					if (Proto[key] == null) {
						Proto[key] = x[key];
					}
				}
				if (Parent == null) {
					Parent = x;
				}
			}
			
			Proto.Parent = Parent
			
			if (Ctor == null)  {
				Ctor = function(){
					var args = _Array_slice.call(arguments);
					if (BaseCtor)
						return BaseCtor.apply(this, args);
				};
			}
			
			Ctor.prototype = Proto;
			return Ctor;
		};
	}());
	// end:source /src/class.js
	
	// source /src/refs.js
	var _Array_slice = Array.prototype.slice,
		_Array_splice = Array.prototype.splice,
		_Array_indexOf = Array.prototype.indexOf,
		
		_Object_create = obj_create,
		_Object_hasOwnProp = Object.hasOwnProperty;
	// end:source /src/refs.js
	// end:source /ref-utils/lib/utils.embed.js

	// source /src/scope-vars.js
	var __rgxEscapedChar = {
			"'": /\\'/g,
			'"': /\\"/g,
			'{': /\\\{/g,
			'>': /\\>/g,
			';': /\\>/g
		},
		
		__cfg = {
			// Relevant to node.js only. Disable compo caching
			allowCache: true
		};
	// end:source /src/scope-vars.js
    // source /src/util/util.js
    
    /**
     * - arr (Array) - array that was prepaired by parser -
     *  every even index holds interpolate value that was in #{some value}
     * - model: current model
     * - type (String const) (node | attr): tell custom utils what part we are
     *  interpolating
     * - cntx (Object): current render context object
     * - element (HTMLElement):
     * type node - this is a container
     * type attr - this is element itself
     * - name
     *  type attr - attribute name
     *  type node - undefined
     *
     * -returns Array | String
     *
     * If we rendere interpolation in a TextNode, then custom util can return not only string values,
     * but also any HTMLElement, then TextNode will be splitted and HTMLElements will be inserted within.
     * So in that case we return array where we hold strings and that HTMLElements.
     *
     * If custom utils returns only strings, then String will be returned by this function
     *
     */
    
    function util_interpolate(arr, type, model, ctx, element, controller, name) {
    	var imax = arr.length,
    		i = -1,
    		array = null,
    		string = '',
    		even = true,
    		
    		utility,
    		value,
    		index,
    		key,
    		handler;
    
    	while ( ++i < imax ) {
    		if (even === true) {
    			if (array == null){
    				string += arr[i];
    			} else{
    				array.push(arr[i]);
    			}
    		} else {
    			key = arr[i];
    			value = null;
    			index = key.indexOf(':');
    
    			if (index === -1) {
    				value = obj_getPropertyEx(key,  model, ctx, controller);
    				
    			} else {
    				utility = index > 0
    					? key.substring(0, index).trim()
    					: '';
    					
    				if (utility === '') {
    					utility = 'expression';
    				}
    
    				key = key.substring(index + 1);
    				handler = custom_Utils[utility];
    				
    				if (handler == null) {
    					log_error('Undefined custom util `%s`', utility);
    					continue;
    				}
    				
    				value = handler(key, model, ctx, element, controller, name, type);
    			}
    
    			if (value != null){
    
    				if (typeof value === 'object' && array == null){
    					array = [string];
    				}
    
    				if (array == null){
    					string += value;
    				} else {
    					array.push(value);
    				}
    
    			}
    		}
    
    		even = !even;
    	}
    
    	return array == null
    		? string
    		: array
    		;
    }
    
    // end:source /src/util/util.js
    // source /src/util/attr.js
    var attr_extend;
    
    (function(){
        attr_extend = function (a, b) {
            if (a == null) {
                return b == null
                    ? {}
                    : obj_create(b);
            }
            
            if (b == null) 
                return a;
            
            var key;
            for(key in b) {
                if ('class' === key && typeof a[key] === 'string') {
                    a[key] += ' ' + b[key];
                    continue;
                }
                a[key] = b[key];
            }
            return a;
        };
    }());
    
    // end:source /src/util/attr.js
	// source /src/util/template.js
	function Template(template) {
		this.template = template;
		this.index = 0;
		this.length = template.length;
	}
	
	Template.prototype = {
		skipWhitespace: function () {
	
			var template = this.template,
				index = this.index,
				length = this.length;
	
			for (; index < length; index++) {
				if (template.charCodeAt(index) > 32 /*' '*/) {
					break;
				}
			}
	
			this.index = index;
	
			return this;
		},
	
		skipToAttributeBreak: function () {
	
			var template = this.template,
				index = this.index,
				length = this.length,
				c;
			do {
				c = template.charCodeAt(++index);
				/* if c == # && next() == { - continue */
				if (c === 35 && template.charCodeAt(index + 1) === 123) {
					// goto end of template declaration
					this.index = index;
					this.sliceToChar('}');
					this.index++;
					return;
				}
			}
			while (c !== 46 && c !== 35 && c !== 62 && c !== 123 && c !== 32 && c !== 59 && index < length);
			//while(!== ".#>{ ;");
	
			this.index = index;
		},
		sliceToChar: function (c) {
			var template = this.template,
				index = this.index,
				start = index,
				isEscaped = false,
				value, nindex;
	
			while ((nindex = template.indexOf(c, index)) > -1) {
				index = nindex;
				if (template.charCodeAt(index - 1) !== 92 /*'\\'*/) {
					break;
				}
				isEscaped = true;
				index++;
			}
	
			value = template.substring(start, index);
	
			this.index = index;
	
			return isEscaped ? value.replace(__rgxEscapedChar[c], c) : value;
		}
	
	};
	
	// end:source /src/util/template.js
    
	// source /src/util/array.js
	var arr_pushMany;
	
	(function(){
		arr_pushMany = function(arr, arrSource){
			if (arrSource == null || arr == null) 
				return;
			
			var il = arr.length,
				jl = arrSource.length,
				j = -1
				;
			while( ++j < jl ){
				arr[il + j] = arrSource[j];
			}
		};
	}());
	// end:source /src/util/array.js
	// source /src/util/string.js
	
	// end:source /src/util/string.js
    // source /src/util/object.js
    var obj_getPropertyEx,
        obj_toDictionary;
    (function(){
        obj_getPropertyEx = function(path, model, ctx, ctr){
            if (path === '.') 
                return model;
        
            var props = path.split('.'),
                value = model,
                i = -1,
                imax = props.length,
                key = props[0],
                start_i
                ;
            
            if ('$c' === key) {
                value = ctr;
                i++;
            }
            
            else if ('$a' === key) {
                value = ctr && ctr.attr;
                i++;
            }
            
            else if ('$u' === key) {
                value = customUtil_$utils;
                i++;
            }
            
            else if ('$ctx' === key) {
                value = ctx;
                i++;
            }
            
            start_i = i;
            while (value != null && ++i < imax) {
                value = value[props[i]];
            }
            if (value == null && start_i === -1) {
                var $scope;
                while (ctr != null){
                    
                    $scope = ctr.scope;
                    if ($scope != null) {
                        value = getProperty_($scope, props, 0, imax);
                        if (value != null) 
                            return value;
                    }
                    
                    ctr = ctr.parent;
                }
            }
            
            return value;
        };
        
        obj_toDictionary = function(obj){
            var array = [],
                i = 0,
                key
                ;
            for(key in obj){
                array[i++] = {
                    key: key,
                    value: obj[key]
                };
            }
            return array;
        };
        
        // = private
        
        function getProperty_(obj, props, i, imax) {
            var val = obj;
            while(i < imax && val != null){
                val = val[props[i]];
                i++;
            }
            return val;
        }
    }());
    
    // end:source /src/util/object.js
	// source /src/util/listeners.js
	var listeners_on,
		listeners_off,
		listeners_emit;
	(function(){
		
		listeners_on = function(event, fn) {
			(bin[event] || (bin[event] = [])).push(fn);
		};
		listeners_off = function(event, fn){
			if (fn == null) {
				bin[event] = [];
				return;
			}
			arr_remove(bin[event], fn);
		};
		listeners_emit = function(event){
		
			var fns = bin[event];
			if (fns == null) 
				return;
			
			var imax = fns.length,
				i = -1,
				args = _Array_slice.call(arguments, 1)
				;
				
			while ( ++i < imax) 
				fns[i].apply(null, args);
		};
		
		// === private
		
		var bin = {
			compoCreated: null,
			error: null
		};
	}());
	// end:source /src/util/listeners.js
	// source /src/util/reporters.js
	var throw_,
		parser_error,
		parser_warn,
		log,
		log_warn,
		log_error;
		
	(function(){
		
		
		throw_ = function(error){
			log_error(error);
			listeners_emit('error', error);
		};
		
		parser_error = function(msg, str, i, token, state, file){
			var error = createMsg('error', msg, str, i, token, state, file);
			
			log_error(error.message);
			log_warn(error.stack);
			listeners_emit('error', error);
		};
		parser_warn = function(msg, str, i, token, state, file){
			var error = createMsg('warn', msg, str, i, token, state, file);
			log_warn(error.message);
			log(error.stack);
			listeners_emit('error', error);
		};
		
		if (typeof console === 'undefined') {
			log = log_warn = log_error = function(){};
		}
		else {
			var bind  = Function.prototype.bind;
			log       = bind.call(console.warn , console);
			log_warn  = bind.call(console.warn , console, 'MaskJS [Warn] :');
			log_error = bind.call(console.error, console, 'MaskJS [Error] :');
		}
		
		var ParserError = createError('Error'),
			ParserWarn  = createError('Warning');
		
		function createError(type) {
			function ParserError(msg, orig, index){
				this.type = 'Parser' + type;
				this.message = msg;
				this.original = orig;
				this.index = index;
				this.stack = prepairStack();
			}
			inherit(ParserError, Error);
			return ParserError;
		}
		
		function prepairStack(){
			var stack = new Error().stack;
			if (stack == null) 
				return null;
			
			return stack
				.split('\n')
				.slice(6, 8)
				.join('\n');
		}
		function inherit(Ctor, Base){
			if (Object.create) 
				Ctor.prototype = Object.create(Base.prototype);
		}
		function createMsg(type, msg, str, index, token, state, filename){
			msg += formatToken(token)
				+ formatFilename(str, index, filename)
				+ '\nParser '
				+ formatState(state)
				+ formatStopped(type, str, index)
				;
			
			var Ctor = type === 'error'
				? ParserError
				: ParserWarn;
				
			return new Ctor(msg, str, index);
		}
		function formatToken(token){
			if (token == null) 
				return '';
			
			if (typeof token === 'number') 
				token = String.fromCharCode(token);
				
			return ' Invalid token: `'+ token + '`';
		}
		function formatFilename(str, index, filename) {
			if (index == null || !filename) 
				return '';
			
			var lines = splitLines(str, index),
				line = lines[1],
				row  = lines[2];
			return ' at '
				+ (filename || '')
				+ '(' + line + ':' + row + ')';
		}
		function formatState(state){
			var states = {
				'2': 'tag',
				'3': 'tag',
				'5': 'attribute key',
				'6': 'attribute value',
				'8': 'literal',
				'var': 'VarStatement',
				'expr': 'Expression'
			};
			if (state == null || states[state] == null) 
				return '';
			
			return ' on "' + states[state] + '"';
		}
		function formatStopped(type, str, index){
			if (index == null) 
				return '';
			
			var data = splitLines(str, index),
				lines = data[0],
				line  = data[1],
				row   = data[2];
				
			return index == null
				? ''
				: ' at ('
					+ line
					+ ':'
					+ row
					+ ') \n'
					+ formatCursor(lines, line, row)
				;
		}
		
		var formatCursor;
		(function(){
			formatCursor = function(lines, line, row) {
				var BEFORE = 3,
					AFTER  = 2,
					i = (line - 1) - BEFORE,
					imax   = i + BEFORE + AFTER,
					str  = '';
				
				if (i < 0) i = 0;
				if (imax > lines.length) imax = lines.length;
				
				var lineNumberLength = String(imax).length,
					lineNumber;
				
				for(; i < imax; i++) {
					if (str)  str += '\n';
					
					lineNumber = ensureLength(i + 1, lineNumberLength);
					str += lineNumber + '|' + lines[i];
					
					if (i + 1 === line) {
						str += '\n' + repeat(' ', lineNumberLength + 1);
						str += lines[i].substring(0, row - 2).replace(/[^\s]/g, ' ');
						str += '^';
					}
				}
				return str;
			};
			
			function ensureLength(num, count) {
				var str = String(num);
				while(str.length < count) {
					str += ' ';
				}
				return str;
			}
			function repeat(char_, count) {
				var str = '';
				while(--count > -1) {
					str += char_;
				}
				return str;
			}
		}());
		
		function splitLines(str, index) {
			var lines = str.substring(0, index).split('\n'),
				line = lines.length,
				row = index + 1 - lines.slice(0, line - 2).join('\n').length;
			return [str.split('\n'), line, row];
		}
	}());
	// end:source /src/util/reporters.js
    
	// source /src/custom/exports.js
	var custom_Utils,
		custom_Statements,
		custom_Attributes,
		custom_Tags,
		custom_Tags_defs,
		
		custom_Parsers,
		
		customUtil_get,
		customUtil_$utils,
		customUtil_register,
		
		customTag_register
		;
		
	(function(){
		
		var HtmlTags = {
			/*
			 * Most common html tags
			 * http://jsperf.com/not-in-vs-null/3
			 */
			div: null,
			span: null,
			input: null,
			button: null,
			textarea: null,
			select: null,
			option: null,
			h1: null,
			h2: null,
			h3: null,
			h4: null,
			h5: null,
			h6: null,
			a: null,
			p: null,
			img: null,
			table: null,
			td: null,
			tr: null,
			pre: null,
			ul: null,
			li: null,
			ol: null,
			i: null,
			em: null,
			b: null,
			br: null,
			strong: null,
			form: null,
			audio: null,
			video: null,
			canvas: null,
			svg: null
		};
		var HtmlAttr = {
			'class'	: null,
			'id'	: null,
			'style'	: null,
			'name'	: null,
			'type'	: null,
			'value' : null,
			'required': null,
		};
		
		custom_Utils = {
			expression: function(value, model, ctx, element, controller){
				return ExpressionUtil.eval(value, model, ctx, controller);
			},
		};
		custom_Statements 	= {};
		custom_Attributes 	= obj_create(HtmlAttr);
		custom_Tags 		= obj_create(HtmlTags);
		custom_Parsers 		= obj_create(HtmlTags);
		
		// use on server to define reserved tags and its meta info
		custom_Tags_defs = {};
		
		
		// source ./tag.js
		(function(repository){
			
			customTag_register = function(name, Handler){
				
				if (Handler != null && typeof Handler === 'object') {
					//> static
					Handler.__Ctor = wrapStatic(Handler);
				}
				
				repository[name] = Handler;
			};
			
			
			function wrapStatic(proto) {
				function Ctor(node, parent) {
					this.tagName = node.tagName;
					this.attr = node.attr;
					this.expression = node.expression;
					this.nodes = node.nodes;
					this.nextSibling = node.nextSibling;
					this.parent = parent;
					this.components = null;
				}
				
				Ctor.prototype = proto;
				
				return Ctor;
			}
			
		}(custom_Tags));
		// end:source ./tag.js
		// source ./util.js
		
		(function(repository) {
			
			customUtil_$utils = {};
		
			customUtil_register = function(name, mix) {
		
				if (is_Function(mix)) {
					repository[name] = mix;
					return;
				}
		
				repository[name] = createUtil(mix);
		
				if (mix.arguments === 'parsed')
					customUtil_$utils[name] = mix.process;
		
			};
		
			customUtil_get = function(name) {
				return name != null
					? repository[name]
					: repository
					;
			};
		
			// = private
		
			function createUtil(obj) {
		
				if (obj.arguments === 'parsed')
					return processParsedDelegate(obj.process);
				
				var fn = fn_proxy(obj.process || processRawFn, obj);
				// <static> save reference to the initial util object.
				// Mask.Bootstrap need the original util
				// @workaround
				fn.util = obj;
				return fn;
			}
		
		
			function processRawFn(expr, model, ctx, element, controller, attrName, type) {
				if ('node' === type) {
		
					this.nodeRenderStart(expr, model, ctx, element, controller);
					return this.node(expr, model, ctx, element, controller);
				}
		
				// asume 'attr'
		
				this.attrRenderStart(expr, model, ctx, element, controller, attrName);
				return this.attr(expr, model, ctx, element, controller, attrName);
			}
		
		
			function processParsedDelegate(fn) {
		
				return function(expr, model, ctx, element, controller) {
					
					var args = ExpressionUtil
							.evalStatements(expr, model, ctx, controller);
		
					return fn.apply(null, args);
				};
			}
		
		}(custom_Utils));
		// end:source ./util.js
	}());
	
	// end:source /src/custom/exports.js
	
	// source /src/expression/exports.js
	/**
	 * ExpressionUtil
	 *
	 * Helper to work with expressions
	 **/
	
	var ExpressionUtil = (function(){
	
		// source 1.scope-vars.js
		
		var index = 0,
			length = 0,
			cache = {},
			template, ast;
		
		var op_Minus = '-', //1,
			op_Plus = '+', //2,
			op_Divide = '/', //3,
			op_Multip = '*', //4,
			op_Modulo = '%', //5,
			
			op_LogicalOr = '||', //6,
			op_LogicalAnd = '&&', //7,
			op_LogicalNot = '!', //8,
			op_LogicalEqual = '==', //9,
			op_LogicalEqual_Strict = '===', // 111
			op_LogicalNotEqual = '!=', //11,
			op_LogicalNotEqual_Strict = '!==', // 112
			op_LogicalGreater = '>', //12,
			op_LogicalGreaterEqual = '>=', //13,
			op_LogicalLess = '<', //14,
			op_LogicalLessEqual = '<=', //15,
			op_Member = '.', // 16
		
			punc_ParantheseOpen 	= 20,
			punc_ParantheseClose 	= 21,
			punc_BracketOpen 		= 22,
			punc_BracketClose 		= 23,
			punc_BraceOpen 			= 24,
			punc_BraceClose 		= 25,
			punc_Comma 				= 26,
			punc_Dot 				= 27,
			punc_Question 			= 28,
			punc_Colon 				= 29,
			punc_Semicolon 			= 30,
		
			go_ref = 31,
			go_acs = 32,
			go_string = 33,
			go_number = 34,
			go_objectKey = 35;
		
		var type_Body = 1,
			type_Statement = 2,
			type_SymbolRef = 3,
			type_FunctionRef = 4,
			type_Accessor = 5,
			type_AccessorExpr = 6,
			type_Value = 7,
		
		
			type_Number = 8,
			type_String = 9,
			type_Object = 10,
			type_Array = 11,
			type_UnaryPrefix = 12,
			type_Ternary = 13;
		
		var state_body = 1,
			state_arguments = 2;
		
		
		var precedence = {};
		
		precedence[op_Member] = 1;
		
		precedence[op_Divide] = 2;
		precedence[op_Multip] = 2;
		
		precedence[op_Minus] = 3;
		precedence[op_Plus] = 3;
		
		precedence[op_LogicalGreater] = 4;
		precedence[op_LogicalGreaterEqual] = 4;
		precedence[op_LogicalLess] = 4;
		precedence[op_LogicalLessEqual] = 4;
		
		precedence[op_LogicalEqual] = 5;
		precedence[op_LogicalEqual_Strict] = 5;
		precedence[op_LogicalNotEqual] = 5;
		precedence[op_LogicalNotEqual_Strict] = 5;
		
		
		precedence[op_LogicalAnd] = 6;
		precedence[op_LogicalOr] = 6;
		
		// end:source 1.scope-vars.js
		// source 2.ast.js
		var Ast_Body,
			Ast_Statement,
			Ast_Value,
			Ast_Array,
			Ast_Object,
			Ast_FunctionRef,
			Ast_SymbolRef,
			Ast_Accessor,
			Ast_AccessorExpr,
			Ast_UnaryPrefix,
			Ast_TernaryStatement
			;
			
		
		(function(){
			
			Ast_Body = function(parent) {
				this.parent = parent;
				this.type = type_Body;
				this.body = [];
				this.join = null;
			};
			
			Ast_Statement = function(parent) {
				this.parent = parent;
			};
			
			Ast_Statement.prototype = {
				constructor: Ast_Statement,
				type: type_Statement,
				join: null,
				body: null
			};
			
			Ast_Value = function(value) {
				this.type = type_Value;
				this.body = value;
				this.join = null;
			};
			
			Ast_Array = function(parent){
				this.type = type_Array;
				this.parent = parent;
				this.body = new Ast_Body(this);
			};
			
			Ast_Object = function(parent){
				this.type = type_Object;
				this.parent = parent;
				this.props = {};
			}
			Ast_Object.prototype = {
				nextProp: function(prop){
					var body = new Ast_Statement(this);
					this.props[prop] = body;
					return body;
				},
			};
			
			Ast_FunctionRef = function(parent, ref) {
				this.parent = parent;
				this.type = type_FunctionRef;
				this.body = ref;
				this.arguments = [];
				this.next = null;
			}
			Ast_FunctionRef.prototype = {
				constructor: Ast_FunctionRef,
				newArgument: function() {
					var body = new Ast_Body(this);
					this.arguments.push(body);
			
					return body;
				}
			};
			
			Ast_SymbolRef = function(parent, ref) {
				this.type = type_SymbolRef;
				this.parent = parent;
				this.body = ref;
				this.next = null;
			};
			Ast_Accessor = function(parent, ref) {
				this.type = type_Accessor;
				this.parent = parent;
				this.body = ref;
				this.next = null;
			};
			Ast_AccessorExpr = function(parent){
				this.parent = parent;
				this.body = new Ast_Statement(this);
				this.body.body = new Ast_Body(this.body);
				this.next = null;
			};
			Ast_AccessorExpr.prototype  = {
				type: type_AccessorExpr,
				getBody: function(){
					return this.body.body;
				}
			};
			
			
			Ast_UnaryPrefix = function(parent, prefix) {
				this.parent = parent;
				this.prefix = prefix;
			};
			Ast_UnaryPrefix.prototype = {
				constructor: Ast_UnaryPrefix,
				type: type_UnaryPrefix,
				body: null
			};
			
			
			Ast_TernaryStatement = function(assertions){
				this.body = assertions;
				this.case1 = new Ast_Body(this);
				this.case2 = new Ast_Body(this);
			};
			Ast_TernaryStatement.prototype = {
				constructor: Ast_TernaryStatement,
				type: type_Ternary,
				case1: null,
				case2: null
			};
		
		}());
		// end:source 2.ast.js
		// source 2.ast.utils.js
		var ast_handlePrecedence,
			ast_append;
			
		(function(){
			
				
			ast_append = function(current, next) {
				switch(current.type) {
					case type_Body:
						current.body.push(next);
						return next;
					
					case type_Statement:
						if (next.type === type_Accessor || next.type === type_AccessorExpr) {
							return (current.next = next)
						}
						/* fall through */
					case type_UnaryPrefix:
						return (current.body = next);
					
					case type_SymbolRef:
					case type_FunctionRef:
					case type_Accessor:
					case type_AccessorExpr:
						return (current.next = next);
				}
				
				return util_throw('Invalid expression');
			};
			
			
			ast_handlePrecedence = function(ast) {
				if (ast.type !== type_Body){
					
					if (ast.body != null && typeof ast.body === 'object')
						ast_handlePrecedence(ast.body);
					
					return;
				}
			
				var body = ast.body,
					i = 0,
					length = body.length,
					x, prev, array;
			
				for(; i < length; i++){
					ast_handlePrecedence(body[i]);
				}
			
			
				for(i = 1; i < length; i++){
					x = body[i];
					prev = body[i-1];
			
					if (precedence[prev.join] > precedence[x.join])
						break;
					
				}
			
				if (i === length)
					return;
				
			
				array = [body[0]];
				for(i = 1; i < length; i++){
					x = body[i];
					prev = body[i-1];
					
					var prec_Prev = precedence[prev.join];
					if (prec_Prev > precedence[x.join] && i < length - 1){
						
						var start = i,
							nextJoin,
							arr;
						
						// collect all with join smaller or equal to previous
						// 5 == 3 * 2 + 1 -> 5 == (3 * 2 + 1);
						while (++i < length){
							nextJoin = body[i].join;
							if (nextJoin == null) 
								break;
							
							if (prec_Prev <= precedence[nextJoin])
								break;
						}
						
						arr = body.slice(start, i + 1);
						x = ast_join(arr);
						ast_handlePrecedence(x);
					}
			
					array.push(x);
				}
			
				ast.body = array;
			
			};
		
			// = private
			
			function ast_join(bodyArr){
				if (bodyArr.length === 0)
					return null;
				
				var body = new Ast_Body(bodyArr[0].parent);
			
				body.join = bodyArr[bodyArr.length - 1].join;
				body.body = bodyArr;
			
				return body;
			}
		
			
		}());
		// end:source 2.ast.utils.js
		// source 3.util.js
		var util_resolveRef,
			util_throw;
		
		(function(){
			
			util_throw = function(msg, token){
				return parser_error(msg
					, template
					, index
					, token
					, 'expr'
				);
			};
			
			util_resolveRef = function(astRef, model, ctx, controller) {
				var current = astRef,
					key = astRef.body,
					object,
					value,
					args,
					i,
					imax
					;
				
				if ('$c' === key) {
					value = controller;
					
					var next = current.next,
						nextBody = next != null && next.body;
					if (nextBody != null && value[nextBody] == null){
							
						if (next.type === type_FunctionRef
								&& typeof Compo.prototype[nextBody] === 'function') {
							// use fn from prototype if possible, like `closest`
							object = controller;
							value = Compo.prototype[nextBody];
							current = next;
						} else {
							// find the closest controller, which has the property
							while (true) {
								value = value.parent;
								if (value == null) 
									break;
								
								if (value[nextBody] == null) 
									continue;
								
								object = value;
								value = value[nextBody];
								current = next;
								break;
							}
						}
						
						if (value == null) {
							// prepair for warn message
							key = '$c.' + nextBody;
							current = next;
						}
					}
					
				}
				
				else if ('$a' === key) 
					value = controller && controller.attr;
				
				else if ('$u' === key) 
					value = customUtil_$utils;
				
				
				else if ('$ctx' === key) 
					value = ctx;
				
				else {
					// scope resolver
					
					if (model != null) {
						object = model;
						value = model[key];
					}
					
					if (value == null) {
						
						while (controller != null) {
							object = controller.scope;
							
							if (object != null) 
								value = object[key];
							
							if (value != null) 
								break;
							
							controller = controller.parent;
						} 
					}
				}
				
				if (value == null) {
					if (current == null || current.next != null){
						// notify that value is not in model, ctx, controller;
						log_warn('<mask:expression> Accessor error:', key);
					}
					return null;
				}
				
				do {
					if (current.type === type_FunctionRef) {
						
						args = [];
						i = -1;
						imax = current.arguments.length;
						
						while( ++i < imax )
							args[i] = expression_evaluate(current.arguments[i], model, ctx, controller);
						
						value = value.apply(object, args);
					}
		
					if (value == null || current.next == null) 
						break;
					
					current = current.next;
					key = current.type === type_AccessorExpr
						? expression_evaluate(current.body, model, ctx, controller)
						: current.body
						;
					
					object = value;
					value = value[key];
					
					if (value == null) 
						break;
		
				} while (true);
				
				return value;
			};
		}());
		
		
		// end:source 3.util.js
		// source 4.parser.helper.js
		var parser_skipWhitespace,
			parser_getString,
			parser_getNumber,
			parser_getArray,
			parser_getObject,
			parser_getRef,
			parser_getDirective
			;
			
		(function(){
			parser_skipWhitespace = function() {
				var c;
				while (index < length) {
					c = template.charCodeAt(index);
					if (c > 32) 
						return c;
					index++;
				}
				return null;
			};
			parser_getString = function(c) {
				var isEscaped = false,
					_char = c === 39 ? "'" : '"',
					start = index,
					nindex, string;
			
				while ((nindex = template.indexOf(_char, index)) > -1) {
					index = nindex;
					if (template.charCodeAt(nindex - 1) !== 92 /*'\\'*/ ) {
						break;
					}
					isEscaped = true;
					index++;
				}
			
				string = template.substring(start, index);
				if (isEscaped === true) {
					string = string.replace(__rgxEscapedChar[_char], _char);
				}
				return string;
			};
			
			parser_getNumber = function() {
				var start = index,
					code, isDouble;
				while (true) {
			
					code = template.charCodeAt(index);
					if (code === 46) {
						// .
						if (isDouble === true) {
							util_throw('Invalid number', code);
							return null;
						}
						isDouble = true;
					}
					if ((code >= 48 && code <= 57 || code === 46) && index < length) {
						index++;
						continue;
					}
					break;
				}
				return +template.substring(start, index);
			};
			
			
			parser_getRef = function() {
				var start = index,
					c = template.charCodeAt(index),
					ref;
			
				if (c === 34 || c === 39) {
					// ' | "
					index++;
					ref = parser_getString(c);
					index++;
					return ref;
				}
			
				while (true) {
					
					if (index === length) 
						break;
					
					c = template.charCodeAt(index);
					
					if (c === 36 || c === 95) {
						// $ _
						index++;
						continue;
					}
					if ((48 <= c && c <= 57) ||		// 0-9
						(65 <= c && c <= 90) ||		// A-Z
						(97 <= c && c <= 122)) {	// a-z
						index++;
						continue;
					}
					// - [removed] (exit on not allowed chars) 5ba755ca
					break;
				}
				return template.substring(start, index);
			};
			
			parser_getDirective = function(code) {
				if (code == null && index === length) 
					return null;
				
				switch (code) {
					case 40:
						// (
						return punc_ParantheseOpen;
					case 41:
						// )
						return punc_ParantheseClose;
					case 123:
						// {
						return punc_BraceOpen;
					case 125:
						// }
						return punc_BraceClose;
					case 91:
						// [
						return punc_BracketOpen;
					case 93:
						// ]
						return punc_BracketClose;
					case 44:
						// ,
						return punc_Comma;
					case 46:
						// .
						return punc_Dot;
					case 59:
						// ;
						return punc_Semicolon;
					case 43:
						// +
						return op_Plus;
					case 45:
						// -
						return op_Minus;
					case 42:
						// *
						return op_Multip;
					case 47:
						// /
						return op_Divide;
					case 37:
						// %
						return op_Modulo;
			
					case 61:
						// =
						if (template.charCodeAt(++index) !== code) {
							util_throw(
								'Assignment violation: View can only access model/controllers', '='
							);
							return null;
						}
						if (template.charCodeAt(index + 1) === code) {
							index++;
							return op_LogicalEqual_Strict;
						}
						return op_LogicalEqual;
					case 33:
						// !
						if (template.charCodeAt(index + 1) === 61) {
							// =
							index++;
							
							if (template.charCodeAt(index + 1) === 61) {
								// =
								index++;
								return op_LogicalNotEqual_Strict;
							}
							
							return op_LogicalNotEqual;
						}
						return op_LogicalNot;
					case 62:
						// >
						if (template.charCodeAt(index + 1) === 61) {
							index++;
							return op_LogicalGreaterEqual;
						}
						return op_LogicalGreater;
					case 60:
						// <
						if (template.charCodeAt(index + 1) === 61) {
							index++;
							return op_LogicalLessEqual;
						}
						return op_LogicalLess;
					case 38:
						// &
						if (template.charCodeAt(++index) !== code) {
							util_throw(
								'Not supported: Bitwise AND', code
							);
							return null;
						}
						return op_LogicalAnd;
					case 124:
						// |
						if (template.charCodeAt(++index) !== code) {
							util_throw(
								'Not supported: Bitwise OR', code
							);
							return null;
						}
						return op_LogicalOr;
					case 63:
						// ?
						return punc_Question;
					case 58:
						// :
						return punc_Colon;
				}
			
				if ((code >= 65 && code <= 90) ||
					(code >= 97 && code <= 122) ||
					(code === 95) ||
					(code === 36)) {
					// A-Z a-z _ $
					return go_ref;
				}
			
				if (code >= 48 && code <= 57) {
					// 0-9 .
					return go_number;
				}
			
				if (code === 34 || code === 39) {
					// " '
					return go_string;
				}
			
				util_throw(
					'Unexpected or unsupported directive', code
				);
				return null;
			};
		}());
		// end:source 4.parser.helper.js
		// source 5.parser.js
		/*
		 * earlyExit - only first statement/expression is consumed
		 */
		function expression_parse(expr, earlyExit) {
			if (earlyExit == null) 
				earlyExit = false;
			
			template = expr;
			index = 0;
			length = expr.length;
		
			ast = new Ast_Body();
		
			var current = ast,
				state = state_body,
				c, next, directive;
		
			outer: while (true) {
		
				if (index < length && (c = template.charCodeAt(index)) < 33) {
					index++;
					continue;
				}
		
				if (index >= length) 
					break;
				
				directive = parser_getDirective(c);
		
				if (directive == null && index < length) {
					break;
				}
				if (directive === punc_Semicolon) {
					if (earlyExit === true) 
						return [ast, index];
					
					break;
				}
				
				if (earlyExit === true) {
					var p = current.parent;
					if (p != null && p.type === type_Body && p.parent == null) {
						// is in root body
						if (directive === go_ref) 
							return [ast, index];
					}
				}
				
				if (directive === punc_Semicolon) {
					break;
				}
				
				switch (directive) {
					case punc_ParantheseOpen:
						current = ast_append(current, new Ast_Statement(current));
						current = ast_append(current, new Ast_Body(current));
		
						index++;
						continue;
					case punc_ParantheseClose:
						var closest = type_Body;
						if (state === state_arguments) {
							state = state_body;
							closest = type_FunctionRef;
						}
		
						do {
							current = current.parent;
						} while (current != null && current.type !== closest);
		
						if (closest === type_Body) {
							current = current.parent;
						}
		
						if (current == null) {
							util_throw('OutOfAst Exception', c);
							break outer;
						}
						index++;
						continue;
					
					case punc_BraceOpen:
						current = ast_append(current, new Ast_Object(current));
						directive = go_objectKey;
						index++;
						break;
					case punc_BraceClose:
						while (current != null && current.type !== type_Object){
							current = current.parent;
						}
						index++;
						continue;
					case punc_Comma:
						if (state !== state_arguments) {
							
							state = state_body;
							do {
								current = current.parent;
							} while (current != null &&
								current.type !== type_Body &&
								current.type !== type_Object
							);
							index++;
							if (current == null) {
								util_throw('Unexpected comma', c);
								break outer;	
							}
							
							if (current.type === type_Object) {
								directive = go_objectKey;
								break;
							}
							
							continue;
						}
						do {
							current = current.parent;
						} while (current != null && current.type !== type_FunctionRef);
		
						if (current == null) {
							util_throw('OutOfAst Exception', c);
							break outer;
						}
		
						current = current.newArgument();
		
						index++;
						continue;
		
					case punc_Question:
						ast = new Ast_TernaryStatement(ast);
						current = ast.case1;
						index++;
						continue;
					
					case punc_Colon:
						current = ast.case2;
						index++;
						continue;
		
		
					case punc_Dot:
						c = template.charCodeAt(index + 1);
						if (c >= 48 && c <= 57) {
							directive = go_number;
						} else {
							directive = current.type === type_Body
								? go_ref
								: go_acs
								;
							index++;
						}
						break;
					case punc_BracketOpen:
						if (current.type === type_SymbolRef ||
							current.type === type_AccessorExpr ||
							current.type === type_Accessor
							) {
							current = ast_append(current, new Ast_AccessorExpr(current))
							current = current.getBody();
							index++;
							continue;
						}
						current = ast_append(current, new Ast_Array(current));
						current = current.body;
						index++;
						continue;
					case punc_BracketClose:
						do {
							current = current.parent;
						} while (current != null &&
							current.type !== type_AccessorExpr &&
							current.type !== type_Array
						);
						index++;
						continue;
				}
		
		
				if (current.type === type_Body) {
					current = ast_append(current, new Ast_Statement(current));
				}
		
				if ((op_Minus === directive || op_LogicalNot === directive) && current.body == null) {
					current = ast_append(current, new Ast_UnaryPrefix(current, directive));
					index++;
					continue;
				}
		
				switch (directive) {
		
					case op_Minus:
					case op_Plus:
					case op_Multip:
					case op_Divide:
					case op_Modulo:
		
					case op_LogicalAnd:
					case op_LogicalOr:
					case op_LogicalEqual:
					case op_LogicalEqual_Strict:
					case op_LogicalNotEqual:
					case op_LogicalNotEqual_Strict:
		
					case op_LogicalGreater:
					case op_LogicalGreaterEqual:
					case op_LogicalLess:
					case op_LogicalLessEqual:
		
						while (current && current.type !== type_Statement) {
							current = current.parent;
						}
		
						if (current.body == null) {
							return util_throw(
								'Unexpected operator', c
							);
						}
		
						current.join = directive;
		
						do {
							current = current.parent;
						} while (current != null && current.type !== type_Body);
		
						if (current == null) {
							return util_throw(
								'Unexpected operator' , c
							);
						}
		
		
						index++;
						continue;
					case go_string:
					case go_number:
						if (current.body != null && current.join == null) {
							return util_throw(
								'Directive expected', c 
							);
						}
						if (go_string === directive) {
							index++;
							ast_append(current, new Ast_Value(parser_getString(c)));
							index++;
		
						}
		
						if (go_number === directive) {
							ast_append(current, new Ast_Value(parser_getNumber(c)));
						}
		
						continue;
		
					case go_ref:
					case go_acs:
						var ref = parser_getRef();
						
						if (directive === go_ref) {
								
							if (ref === 'null') 
								ref = null;
							
							if (ref === 'false') 
								ref = false;
							
							if (ref === 'true') 
								ref = true;
								
							if (typeof ref !== 'string') {
								ast_append(current, new Ast_Value(ref));
								continue;
							}
						}
						while (index < length) {
							c = template.charCodeAt(index);
							if (c < 33) {
								index++;
								continue;
							}
							break;
						}
		
						if (c === 40) {
		
							// (
							// function ref
							state = state_arguments;
							index++;
		
							var fn = ast_append(current, new Ast_FunctionRef(current, ref));
		
							current = fn.newArgument();
							continue;
						}
						
						var Ctor = directive === go_ref
							? Ast_SymbolRef
							: Ast_Accessor
						current = ast_append(current, new Ctor(current, ref));
						break;
					case go_objectKey:
						if (parser_skipWhitespace() === 125)
							continue;
						
						
						var key = parser_getRef();
						
						if (parser_skipWhitespace() !== 58) {
							//:
							return util_throw(
								'Object parser. Semicolon expeted', c
							); 
						}
						index++;
						current = current.nextProp(key);
						directive = go_ref;
						continue;
				}
			}
		
			if (current.body == null &&
				current.type === type_Statement) {
				
				return util_throw(
					'Unexpected end of expression', c
				); 
			}
		
			ast_handlePrecedence(ast);
		
			return ast;
		}
		// end:source 5.parser.js
		// source 6.eval.js
		function expression_evaluate(mix, model, ctx, controller) {
		
			var result, ast;
		
			if (null == mix)
				return null;
			
			if ('.' === mix) 
				return model;
			
			if (typeof mix === 'string'){
				ast = cache.hasOwnProperty(mix) === true
					? (cache[mix])
					: (cache[mix] = expression_parse(mix))
					;
			}else{
				ast = mix;
			}
			if (ast == null) 
				return null;
			
			var type = ast.type,
				i, x, length;
			
			if (type_Body === type) {
				var value, prev;
		
				outer: for (i = 0, length = ast.body.length; i < length; i++) {
					x = ast.body[i];
		
					value = expression_evaluate(x, model, ctx, controller);
		
					if (prev == null || prev.join == null) {
						prev = x;
						result = value;
						continue;
					}
					
					if (prev.join === op_LogicalAnd) {
						if (!result) {
							for (; i < length; i++) {
								if (ast.body[i].join === op_LogicalOr) {
									break;
								}
							}
						}else{
							result = value;
						}
					}
		
					if (prev.join === op_LogicalOr) {
						if (result){
							break outer;
						}
						if (value) {
							result = value;
							break outer;
						}
					}
		
					switch (prev.join) {
					case op_Minus:
						result -= value;
						break;
					case op_Plus:
						result += value;
						break;
					case op_Divide:
						result /= value;
						break;
					case op_Multip:
						result *= value;
						break;
					case op_Modulo:
						result %= value;
						break;
					case op_LogicalNotEqual:
						/* jshint eqeqeq: false */
						result = result != value;
						/* jshint eqeqeq: true */
						break;
					case op_LogicalNotEqual_Strict:
						result = result !== value;
						break;
					case op_LogicalEqual:
						/* jshint eqeqeq: false */
						result = result == value;
						/* jshint eqeqeq: true */
						break;
					case op_LogicalEqual_Strict:
						result = result === value;
						break;
					case op_LogicalGreater:
						result = result > value;
						break;
					case op_LogicalGreaterEqual:
						result = result >= value;
						break;
					case op_LogicalLess:
						result = result < value;
						break;
					case op_LogicalLessEqual:
						result = result <= value;
						break;
					}
		
					prev = x;
				}
			}
		
			if (type_Statement === type) {
				result = expression_evaluate(ast.body, model, ctx, controller);
				if (ast.next == null) 
					return result;
				
				//debugger;
				return util_resolveRef(ast.next, result);
			}
		
			if (type_Value === type) {
				return ast.body;
			}
			if (type_Array === type) {
				var body = ast.body.body,
					imax = body.length,
					i = -1;
				
				result = new Array(imax);
				while( ++i < imax ){
					result[i] = expression_evaluate(body[i], model, ctx, controller);
				}
				return result;
			}
			if (type_Object === type) {
				result = {};
				var props = ast.props;
				for(var key in props){
					result[key] = expression_evaluate(props[key], model, ctx, controller);
				}
				return result;
			}
		
			if (type_SymbolRef 		=== type ||
				type_FunctionRef 	=== type ||
				type_AccessorExpr 	=== type ||
				type_Accessor 		=== type) {
				return util_resolveRef(ast, model, ctx, controller);
			}
			
			if (type_UnaryPrefix === type) {
				result = expression_evaluate(ast.body, model, ctx, controller);
				switch (ast.prefix) {
				case op_Minus:
					result = -result;
					break;
				case op_LogicalNot:
					result = !result;
					break;
				}
			}
		
			if (type_Ternary === type){
				result = expression_evaluate(ast.body, model, ctx, controller);
				result = expression_evaluate(result ? ast.case1 : ast.case2, model, ctx, controller);
		
			}
		
			return result;
		}
		
		// end:source 6.eval.js
		// source 7.vars.helper.js
		var  refs_extractVars;
		(function() {
		
			/**
			 * extract symbol references
			 * ~[:user.name + 'px'] -> 'user.name'
			 * ~[:someFn(varName) + user.name] -> ['varName', 'user.name']
			 *
			 * ~[:someFn().user.name] -> {accessor: (Accessor AST function call) , ref: 'user.name'}
			 */
		
		
			refs_extractVars = function(expr, model, ctx, ctr){
				if (typeof expr === 'string') 
					expr = expression_parse(expr);
				
				return _extractVars(expr, model, ctx, ctr);
			};
			
			
			
			function _extractVars(expr, model, ctx, ctr) {
		
				if (expr == null) 
					return null;
				
				var exprType = expr.type,
					refs, x;
				if (type_Body === exprType) {
					
					var body = expr.body,
						imax = body.length,
						i = -1;
					while ( ++i < imax ){
						x = _extractVars(body[i], model, ctx, ctr);
						refs = _append(refs, x);
					}
				}
		
				if (type_SymbolRef === exprType ||
					type_Accessor === exprType ||
					type_AccessorExpr === exprType) {
					
					var path = expr.body,
						next = expr.next,
						nextType;
		
					while (next != null) {
						nextType = next.type;
						if (type_FunctionRef === nextType) {
							return _extractVars(next, model, ctx, ctr);
						}
						if ((type_SymbolRef !== nextType) &&
							(type_Accessor !== nextType) &&
							(type_AccessorExpr !== nextType)) {
							
							log_error('Ast Exception: next should be a symbol/function ref');
							return null;
						}
		
						var prop = nextType === type_AccessorExpr
							? expression_evaluate(next.body, model, ctx, ctr)
							: next.body
							;
						if (typeof prop !== 'string') {
							log_warn('Can`t extract accessor name', path);
							return null;
						}
						path += '.' + prop;
						next = next.next;
					}
		
					return path;
				}
		
		
				switch (exprType) {
					case type_Statement:
					case type_UnaryPrefix:
					case type_Ternary:
						x = _extractVars(expr.body, model, ctx, ctr);
						refs = _append(refs, x);
						break;
				}
				
				// get also from case1 and case2
				if (type_Ternary === exprType) {
					x = _extractVars(ast.case1, model, ctx, ctr);
					refs = _append(refs, x);
		
					x = _extractVars(ast.case2, model, ctx, ctr);
					refs = _append(refs, x);
				}
		
		
				if (type_FunctionRef === exprType) {
					var args = expr.arguments,
						imax = args.length,
						i = -1;
					while ( ++i < imax ){
						x = _extractVars(args[i], model, ctx, ctr);
						refs = _append(refs, x);
					}
					
					x = null;
					var parent = expr;
					outer: while ((parent = parent.parent)) {
						switch (parent.type) {
							case type_SymbolRef:
							case type_Accessor:
							case type_AccessorExpr:
								x = parent.body + (x == null ? '' : '.' + x);
								break;
							case type_Body:
							case type_Statement:
								break outer;
							default:
								x = null;
								break outer;
						}
					}
					
					if (x != null) {
						refs = _append(refs, x);
					}
					
					if (expr.next) {
						x = _extractVars(expr.next, model, ctx, ctr);
						refs = _append(refs, {accessor: _getAccessor(expr), ref: x});
					}
				}
		
				return refs;
			}
			
			function _append(current, x) {
				if (current == null) {
					return x;
				}
		
				if (x == null) {
					return current;
				}
		
				if (!(typeof current === 'object' && current.length != null)) {
					current = [current];
				}
		
				if (!(typeof x === 'object' && x.length != null)) {
					
					if (current.indexOf(x) === -1) {
						current.push(x);
					}
					
					return current;
				}
				
				for (var i = 0, imax = x.length; i < imax; i++) {
					if (current.indexOf(x[i]) === -1) {
						current.push(x[i]);
					}
				}
				
				return current;
		
			}
			
			function _getAccessor(current) {
				
				var parent = current;
				
				outer: while (parent.parent) {
					switch (parent.parent.type) {
						case type_Body:
						case type_Statement:
							break outer;
					}
					parent = parent.parent;
				}
				
				return _copy(parent, current.next);
			}
			
			function _copy(ast, stop) {
				
				if (ast === stop || ast == null) {
					return null;
				}
				
				if (typeof ast !== 'object') {
					return ast;
				}
				
				if (ast.length != null && typeof ast.splice === 'function') {
					
					var arr = [];
					
					for (var i = 0, imax = ast.length; i < imax; i++){
						arr[i] = _copy(ast[i], stop);
					}
					
					return arr;
				}
				
				
				var clone = {};
				for (var key in ast) {
					if (ast[key] == null || key === 'parent') {
						continue;
					}
					clone[key] = _copy(ast[key], stop);
				}
				
				return clone;
			}
		
		}());
		
		// end:source 7.vars.helper.js
	
	
		return {
			parse: expression_parse,
			
			/**
			 * Expression.eval(expression [, model, cntx, controller]) -> result
			 * - expression (String): Expression, only accessors are supoorted
			 *
			 * All symbol and function references will be looked for in 
			 *
			 * 1. model, or via special accessors:
			 * 		- `$c` controller
			 * 		- `$ctx`
			 * 		- `$a' controllers attributes
			 * 2. scope:
			 * 		controller.scope
			 * 		controller.parent.scope
			 * 		...
			 *
			 * Sample:
			 * '(user.age + 20) / 2'
			 * 'fn(user.age + "!") + x'
			 **/
			eval: expression_evaluate,
			varRefs: refs_extractVars,
			
			// Return all values of a comma delimiter expressions
			// like argumets: ' foo, bar, "4,50" ' => [ %fooValue, %barValue, "4,50" ]
			evalStatements: function(expr, model, ctx, controller){
				
				var body = expression_parse(expr).body,
	                args = [],
	                imax = body.length,
	                i = -1
	                ;
				var group = new Ast_Body;
	            while( ++i < imax ){
					group.body.push(body[i]);
					if (body[i].join != null) 
						continue;
					
	                args.push(expression_evaluate(group, model, ctx, controller));
					group.body.length = 0;
	            }
				return args;
			}
		};
	
	}());
	
	// end:source /src/expression/exports.js
	// source /src/dom/exports.js
	var Dom;
	
	(function(){
		
		var dom_NODE = 1,
			dom_TEXTNODE = 2,
			dom_FRAGMENT = 3,
			dom_COMPONENT = 4,
			dom_CONTROLLER = 9,
			dom_SET = 10,
			dom_STATEMENT = 15
			;
		
		// source 1.utils.js
		function _appendChild(el){
			var nodes = this.nodes;
			if (nodes == null) {
				this.nodes = [el];
				return;
			}
			
			nodes.push(el);
			var prev = nodes[nodes.length - 2];
			
			prev.nextSibling = el;
		}
		// end:source 1.utils.js
		// source 2.Node.js
		function Node(tagName, parent) {
			this.type = Dom.NODE;
			this.tagName = tagName;
			this.parent = parent;
			this.attr = {};	
		}
		Node.prototype = {
			constructor: Node,
			type: dom_NODE,
			tagName: null,
			parent: null,
			attr: null,
			nodes: null,
			expression: null,
			appendChild: _appendChild,
			stringify: null,
			__single: null
		};
		// end:source 2.Node.js
		// source 3.TextNode.js
		
		
		function TextNode(text, parent) {
			this.content = text;
			this.parent = parent;
		}
		
		TextNode.prototype = {
			type: dom_TEXTNODE,
			content: null,
			parent: null
		};
		// end:source 3.TextNode.js
		// source 4.Component.js
		function Component(compoName, parent, controller){
			this.tagName = compoName;
			this.parent = parent;
			this.controller = controller;
			this.attr = {};
		}
		Component.prototype = {
			constructor: Component,
			type: dom_COMPONENT,
			parent: null,
			attr: null,
			controller: null,
			nodes: null,
			components: null,
			model: null,
			modelRef: null
		};
		
		// end:source 4.Component.js
		// source 5.Fragment.js
		function Fragment(){}
		
		Fragment.prototype = {
			constructor: Fragment,
			type: dom_FRAGMENT,
			nodes: null,
			appendChild: _appendChild
		};
		// end:source 5.Fragment.js
		
		
		Dom = {
			NODE: dom_NODE,
			TEXTNODE: dom_TEXTNODE,
			FRAGMENT: dom_FRAGMENT,
			COMPONENT: dom_COMPONENT,
			CONTROLLER: dom_CONTROLLER,
			SET: dom_SET,
			STATEMENT: dom_STATEMENT,
		
			Node: Node,
			TextNode: TextNode,
			Fragment: Fragment,
			Component: Component
		};
	}());
	
	// end:source /src/dom/exports.js
	
	// source /src/statements/exports.js
	// source 1.if.js
	(function(){
		
		function getNodes(node, model, ctx, ctr){
			function evaluate(expr){
				return ExpressionUtil.eval(expr, model, ctx, ctr);
			}
			
			if (evaluate(node.expression)) 
				return node.nodes;
			
			while (true) {
				node = node.nextSibling;
				
				if (node == null || node.tagName !== 'else') 
					break;
				
				var expr = node.expression;
				if (expr == null || expr === '' || evaluate(expr)) 
					return node.nodes;
			}
			
			return null;
		}
		
		custom_Statements['if'] = {
			getNodes: getNodes,
			render: function(node, model, ctx, container, ctr, childs){
				
				var nodes = getNodes(node, model, ctx, ctr);
				if (nodes == null) 
					return;
				
				builder_build(nodes, model, ctx, container, ctr, childs);
			}
		};
		
	}());
	
	// end:source 1.if.js
	// source 2.for.js
	
	(function(){
		var FOR_OF_ITEM = 'for..of::item',
			FOR_IN_ITEM = 'for..in::item';
			
		custom_Statements['for'] = {
			
			render: function(node, model, ctx, container, ctr, children){
				
				parse_For(node.expression);
				
				var value = ExpressionUtil.eval(__ForDirective[3], model, ctx, ctr);
				if (value == null) 
					return;
				
				build(
					value,
					__ForDirective,
					node.nodes,
					model,
					ctx,
					container,
					ctr,
					children
				);
			},
			
			build: build,
			parseFor: parse_For,
			createForNode: createForItemNode,
			getNodes: getNodes,
			
			getHandler: function(compoName, model){
				return createForItemHandler(compoName, model);
			}
		};
		
		(function(){
			custom_Tags[FOR_OF_ITEM] = createBootstrapCompo(FOR_OF_ITEM);
			custom_Tags[FOR_IN_ITEM] = createBootstrapCompo(FOR_IN_ITEM);
			
			function createBootstrapCompo(name) {
				function For_Item(){}
				For_Item.prototype = {
					meta: {
						serializeScope: true
					},
					serializeScope: for_proto_serializeScope,
					type: Dom.COMPONENT,
					compoName: name,
					renderEnd: handler_proto_renderEnd,
					dispose: handler_proto_dispose
				};
				return For_Item;
			}
		}());
		
		
		function build(value, For, nodes, model, ctx, container, ctr, childs) {
			
			builder_build(
				getNodes(nodes, value, For[0], For[1], For[2], For[3]),
				model,
				ctx,
				container,
				ctr,
				childs
			);
		}
		
		function getNodes(nodes, value, prop1, prop2, type, expr) {
				
			if ('of' === type) {
				if (is_Array(value) === false) {
					log_error('<ForStatement> Value is not enumerable', value);
					return null;
				}
				return loop_Array(nodes, value, prop1, prop2, expr);
			}
			
			if ('in' === type) {
				if (typeof value !== 'object') {
					log_warn('<ForStatement> Value is not an object', value);
					return null;
				}
				if (is_Array(value)) 
					log_warn('<ForStatement> Consider to use `for..of` for Arrays');
				
				return loop_Object(nodes, value, prop1, prop2, expr);
			}
		}
		
		function loop_Array(template, arr, prop1, prop2, expr){
			
			var i = -1,
				imax = arr.length,
				nodes = new Array(imax),
				scope;
			
			while ( ++i < imax ) {
				scope = {};
				scope[prop1] = arr[i];
				
				if (prop2) 
					scope[prop2] = i;
				
				nodes[i] = createForItemNode(
					FOR_OF_ITEM
					, template
					, scope
					, i
					, prop1
					, expr
				);
			}
			
			return nodes;
		}
		
		function loop_Object(template, obj, prop1, prop2, expr){
			var nodes = [],
				i = 0,
				scope, key, value;
			
			for (key in obj) {
				value = obj[key];
				scope = {};
				scope[prop1] = key;
				
				if (prop2) 
					scope[prop2] = value;
				
				nodes[i++] = createForItemNode(
					FOR_IN_ITEM
					, template
					, scope
					, key
					, prop2
					, expr
				);
			}
			return nodes;
		}
		
		function createForItemNode(name, nodes, scope, key, propVal, expr) {
			return {
				type: Dom.COMPONENT,
				tagName: name,
				nodes: nodes,
				controller: createForItemHandler(name, scope, key, propVal, expr)
			};
		}
		function createForItemHandler(name, scope, key, propVal, expr) {
			return {
				meta: {
					serializeScope: true,
				},
				compoName: name,
				scope: scope,
				elements: null,
				
				propVal: propVal,
				key: key,
				expression: expr,
				
				renderEnd: handler_proto_renderEnd,
				dispose: handler_proto_dispose,
				serializeScope: for_proto_serializeScope
			};
		}
		
		function handler_proto_renderEnd(elements) {
			this.elements = elements;
		}
		function handler_proto_dispose() {
			if (this.elements) 
				this.elements.length = 0;
		}
		function for_proto_serializeScope(scope, model) {
			var ctr = this,
				expr = ctr.expression,
				key = ctr.key,
				propVal = ctr.propVal;
			
		
			var val = scope[propVal];
			if (val != null && typeof val === 'object') 
				scope[propVal] = '$ref:(' + expr + ')."' + key + '"';
			
			return scope;
		}
	
		
		var __ForDirective = [ 'prop1', 'prop2', 'in|of', 'expression' ],
			i_PROP_1 = 0,
			i_PROP_2 = 1,
			i_TYPE = 2,
			i_EXPR = 3,
			
			state_prop = 1,
			state_multiprop = 2,
			state_loopType = 3
			;
			
		var template,
			index,
			length
			;
			
		function parse_For(expr) {
			// /([\w_$]+)((\s*,\s*([\w_$]+)\s*\))|(\s*\))|(\s+))(of|in)\s+([\w_$\.]+)/
			
			template = expr;
			length = expr.length;
			index = 0;
		
			var prop1,
				prop2,
				loopType,
				hasBrackets,
				c
				;
				
			c = parser_skipWhitespace();
			if (c === 40) {
				// (
				hasBrackets = true;
				index++;
				parser_skipWhitespace();
			}
			
			prop1 = parser_getVarDeclaration();
			
			c = parser_skipWhitespace();
			if (c === 44) {
				//,
				
				if (hasBrackets !== true) {
					return throw_('Parenthese must be used in multiple var declarion');
				}
				
				index++;
				parser_skipWhitespace();
				prop2 = parser_getVarDeclaration();
			}
			
			if (hasBrackets) {
				c = parser_skipWhitespace();
				
				if (c !== 41) 
					return throw_('Closing parenthese expected');
				
				index++;
			}
			
			c = parser_skipWhitespace();
				
			var loopType;
			
			if (c === 105 && template.charCodeAt(++index) === 110) {
				// i n
				loopType = 'in';
			}
	
			if (c === 111 && template.charCodeAt(++index) === 102) {
				// o f
				loopType = 'of';
			}
			
			if (loopType == null) {
				return throw_('Invalid FOR statement. (in|of) expected');
			}
			
			__ForDirective[0] = prop1;
			__ForDirective[1] = prop2;
			__ForDirective[2] = loopType;
			__ForDirective[3] = template.substring(++index);
			
			
			return __ForDirective;
		}
		
		function parser_skipWhitespace(){
			var c;
			for(; index < length; index++ ){
				c = template.charCodeAt(index);
				if (c < 33) 
					continue;
				
				return c;
			}
			
			return -1;
		}
		
		function parser_getVarDeclaration(){
			var start = index,
				var_, c;
				
			for (; index < length; index++) {
					
				c = template.charCodeAt(index);
				
				if (c > 48 && c < 57) {
					// 0-9
					if (start === index)
						return throw_('Variable name begins with a digit');
					
					continue;
				}
				
				if (
					(c === 36) || // $
					(c === 95) || // _ 
					(c >= 97 && c <= 122) || // a-z
					(c >= 65 && c <= 90)  // A-Z
					) {
					
					continue;
				}
				
				break;
			}
			
			if (start === index) 
				return throw_('Variable declaration expected');
			
			return template.substring(start, index);
		}
		
		function throw_(message) {
			throw new Error( '<ForStatement parser> '
				+ message
				+ ' `'
				+ template.substring(index, 20)
				+ '`'
			);
		}
		
	}());
	
	
	// end:source 2.for.js
	// source 3.each.js
	(function(){
	
		custom_Statements['each'] = {		
			render: function(node, model, ctx, container, ctr, children){
				
				var array = ExpressionUtil.eval(node.expression, model, ctx, ctr);
				if (array == null) 
					return;
				
				builder_build(
					getNodes(node, array)
					, array
					, ctx
					, container
					, ctr
					, children
				);
			}
		};
		
		function getNodes(node, array){
			var imax = array.length,
				nodes = new Array(imax),
				template = node.nodes,
				expression = node.expression,
				exprPrefix = expression === '.'
					? '."'
					: '(' + node.expression + ')."',
				i = 0;
			for(; i < imax; i++){
				nodes[i] = createEachNode(template, array[i], exprPrefix, i);
			}
			return nodes;
		}
		function createEachNode(nodes, model, exprPrefix, i){
			return {
				type: Dom.COMPONENT,
				tagName: 'each::item',
				nodes: nodes,
				controller: createEachItemHandler(model, i, exprPrefix)
			};
		}
		function createEachItemHandler(model, i, exprPrefix) {
			return {
				compoName: 'each::item',
				model: model,
				scope: {
					index: i
				},
				modelRef: exprPrefix + i + '"',
				attr: null,
				meta: null
			};
		}
	}());
	// end:source 3.each.js
	// source 4.with.js
		
	custom_Statements['with'] = {
		render: function(node, model, ctx, container, controller, childs){
			
			var obj = ExpressionUtil.eval(node.expression, model, ctx, controller);
			
				
			builder_build(node.nodes, obj, ctx, container, controller, childs);
		}
	};
	// end:source 4.with.js
	// source 5.switch.js
	(function(){
		var eval_ = ExpressionUtil.eval;
		
		custom_Statements['switch'] = {
			render: function(node, model, ctx, container, controller, childs){
				
				var value = eval_(node.expression, model, ctx, controller),
					nodes = getNodes(value, node.nodes, model, ctx, controller);
				if (nodes == null) 
					return;
				
				
				builder_build(nodes, model, ctx, container, controller, childs);
			},
			
			getNodes: getNodes
		};	
		
		
		function getNodes(value, nodes, model, ctx, controller) {
			if (nodes == null) 
				return null;
			
			var imax = nodes.length,
				i = -1,
				
				child, expr,
				case_, default_;
				
			while ( ++i < imax ){
				child = nodes[i];
				
				if (child.tagName === 'default') {
					default_ = child;
					continue;
				}
				
				if (child.tagName !== 'case') {
					log_warn('<mask:switch> Case expected', child.tagName);
					continue;
				}
				expr = child.expression;
				if (!expr) {
					log_warn('<mask:switch:case> Expression expected');
					continue;
				}
				
				/* jshint eqeqeq: false */
				if (eval_(expr, model, ctx, controller) == value) {
					/* jshint eqeqeq: true */
					case_ = child;
					break;
				}
			}
			
			if (case_ == null) 
				case_ = default_;
			
			return case_ != null
				? case_.nodes
				: null
				;
		}
		
	}());
		
	
	// end:source 5.switch.js
	// source 6.include.js
	(function(){
		
		custom_Statements['include'] = {
			
			render: function(node, model, ctx, container, controller, childs){
				
				var arguments_ = ExpressionUtil.evalStatements(node.expression);
					
				var resource;
				
				while(controller != null){
					
					resource = controller.resource;
					if (resource != null) 
						break;
					
					controller = controller.parent;
				}
				
				var ctr = new IncludeController(controller),
					resume = Compo.pause(ctr, ctx);
				
				
				
				include
					.instance(resource && resource.url)
					.load
					.apply(resource, arguments_)
					.done(function(resp){
						
						ctr.templates = resp.load;
						
						builder_build(
							node.nodes,
							model,
							ctx,
							container,
							ctr,
							childs);
						
						resume();
					});
			}
		};
		
		function IncludeController(parent){
			
			this.parent = parent;
			this.compoName = 'include';
			this.components = [];
			this.templates = null;
		}
		
	}());
		
	
	// end:source 6.include.js
	// source 7.import.js
	
	
	custom_Statements['import'] = {
		render: function(node, model, ctx, container, controller, childs){
			
			var expr = node.expression,
				args = ExpressionUtil.evalStatements(expr, model, ctx, controller),
				name = args[0]
				;
			if (typeof name !== 'string') {
				log_error('<mask:import> Invalid argument', expr);
				return;
			}
		
			while (true) {
				
				if (controller.compoName === 'include') 
					break;
				
				controller = controller.parent;
				
				if (controller == null)
					break;
			}
			
			
			
			if (controller == null) 
				return;
			
			var nodes = controller.templates[name];
			if (nodes == null) 
				return;
			
			builder_build(parser_parse(nodes), model, ctx, container, controller, childs);
		}
	};
	// end:source 7.import.js
	// source 8.var.js
	custom_Tags['var'] = VarStatement;
	
	function VarStatement(){}
	
	VarStatement.prototype = {
		renderStart: function(model, ctx){
			var parent = this.parent,
				scope = parent.scope,
				key, val;
				
			if (scope == null)
				scope = parent.scope = {};
			
			this.model = {};
			for(key in this.attr){
				val = ExpressionUtil.eval(this.attr[key], model, ctx, parent);
				this.model[key] = scope[key] = val;
			}
			this.attr = {};
		},
		onRenderStartClient: function(){
			var parent = this.parent,
				scope = parent.scope;
			if (scope == null)
				scope = parent.scope = {};
				
			for(var key in this.model){
				scope[key] = this.model[key];
			}
		}
	};
	// end:source 8.var.js
	// source 9.visible.js
	(function(){
		custom_Statements['visible'] = {
			toggle: toggle,
			render: function(node, model, ctx, container, ctr, children){
				var els = [];
				builder_build(node.nodes, model, ctx, container, ctr, els);
				arr_pushMany(children, els)
				
				var visible = ExpressionUtil.eval(node.expression, model, ctx, ctr);
				toggle(els, visible);
			}
		};
		function toggle(els, visible){
			for(var i = 0; i < els.length; i++){
				els[i].style.display = visible ? '' : 'none';
			}
		}
	}());
	
	// end:source 9.visible.js
	// end:source /src/statements/exports.js
	
	
	// source /src/parse/parser.js
	var parser_parse,
		parser_parseAttr,
		parser_ensureTemplateFunction,
		parser_setInterpolationQuotes,
		parser_cleanObject,
		
		
		// deprecate
		Parser
		;
	
	(function(Node, TextNode, Fragment, Component) {
	
		var interp_START = '~',
			interp_OPEN = '[',
			interp_CLOSE = ']',
	
			// ~
			interp_code_START = 126,
			// [
			interp_code_OPEN = 91,
			// ]
			interp_code_CLOSE = 93,
	
			_serialize;
	
		// source ./cursor.js
		var cursor_groupEnd,
			cursor_quoteEnd,
			cursor_refEnd,
			cursor_skipWhitespace,
			cursor_goToWhitespace
			;
		
		(function(){
			
			cursor_groupEnd = function(str, i, imax, startCode, endCode){
				
				var count = 0,
					start = i,
					c;
				for( ; i < imax; i++){
					c = str.charCodeAt(i);
					
					if (c === 34 || c === 39) {
						// "|'
						i = cursor_quoteEnd(
							str
							, i + 1
							, imax
							, c === 34 ? '"' : "'"
						);
						continue;
					}
					
					if (c === startCode) {
						count++;
						continue;
					}
					
					if (c === endCode) {
						if (--count === -1) 
							return i;
					}
				}
				parser_warn('Group was not closed', str, start);
				return imax;
			};
			
			cursor_refEnd = function(str, i, imax){
				var c;
				while (i < imax){
					c = str.charCodeAt(i);
					
					if (c === 36 || c === 95) {
						// $ _
						i++;
						continue;
					}
					if ((48 <= c && c <= 57) ||		// 0-9
						(65 <= c && c <= 90) ||		// A-Z
						(97 <= c && c <= 122)) {	// a-z
						i++;
						continue;
					}
					
					break;
				}
				return i;
			}
			
			cursor_quoteEnd = function(str, i, imax, char_){
				var start = i;
				while ((i = str.indexOf(char_, i)) !== -1) {
					if (str.charCodeAt(i - 1) !== 92)
						// \ 
						return i;
					i++;
				}
				parser_warn('Quote was not closed', str, start);
				return imax;
			};
			
			cursor_skipWhitespace = function(str, i, imax) {
				for(; i < imax; i++) {
					if (str.charCodeAt(i) > 32) 
						return i;
				}
				return i;
			};
			
			cursor_goToWhitespace = function(str, i, imax) {
				for(; i < imax; i++) {
					if (str.charCodeAt(i) < 33) 
						return i;
				}
				return i;
			};
		}());
		// end:source ./cursor.js
		// source ./function.js
		function ensureTemplateFunction(template) {
			var index = -1;
		
			/*
			 * - single char indexOf is much faster then '~[' search
			 * - function is divided in 2 parts: interpolation start lookup/ interpolation parse
			 * for better performance
			 */
			while ((index = template.indexOf(interp_START, index)) !== -1) {
				if (template.charCodeAt(index + 1) === interp_code_OPEN) 
					break;
				
				index++;
			}
		
			if (index === -1) 
				return template;
			
			var length = template.length,
				array = [],
				lastIndex = 0,
				i = 0,
				end;
		
		
			while (true) {
				end = cursor_groupEnd(
					template
					, index + 2
					, length
					, interp_code_OPEN
					, interp_code_CLOSE
				);
				if (end === -1) 
					break;
				
				array[i++] = lastIndex === index
					? ''
					: template.substring(lastIndex, index);
				array[i++] = template.substring(index + 2, end);
		
				lastIndex = index = end + 1;
		
				while ((index = template.indexOf(interp_START, index)) !== -1) {
					if (template.charCodeAt(index + 1) === interp_code_OPEN) 
						break;
					
					index++;
				}
				if (index === -1) 
					break;
			}
		
			if (lastIndex < length) 
				array[i] = template.substring(lastIndex);
			
		
			template = null;
			return function(type, model, ctx, element, ctr, name) {
				if (type == null) {
					// http://jsperf.com/arguments-length-vs-null-check
					// this should be used to stringify parsed MaskDOM
					var string = '',
						imax = array.length,
						i = -1,
						x;
					while ( ++i < imax) {
						x = array[i];
						
						string += i % 2 === 1
							? interp_START
								+ interp_OPEN
								+ x
								+ interp_CLOSE
							: x
							;
					}
					return string;
				}
		
				return util_interpolate(
					array
					, type
					, model
					, ctx
					, element
					, ctr
					, name
				);
			};
		}
		// end:source ./function.js
		// source ./parsers/var.js
		(function(){
			custom_Parsers['var'] = function(template, index, length, parent){
				var node = new Node('var', parent),
					start,
					c;
				
				node.stringify = stingify;
				var go_varName = 1,
					go_assign = 2,
					go_value = 3,
					go_next = 4,
					state = go_varName,
					token,
					key;
				while(true) {
					if (index < length && (c = template.charCodeAt(index)) < 33) {
						index++;
						continue;
					}
					
					if (state === go_varName) {
						start = index;
						index = cursor_refEnd(template, index, length);
						key = template.substring(start, index);
						state = go_assign;
						continue;
					}
					
					if (state === go_assign) {
						if (c !== 61 ) {
							// =
							parser_error(
								'Assignment expected'
								, template
								, index
								, c
								, 'var'
							);
							return [node, index];
						}
						state = go_value;
						index++;
						continue;
					}
					
					if (state === go_value) {
						start = index;
						index++;
						switch(c){
							case 123:
							case 91:
								// { [
								index = cursor_groupEnd(template, index, length, c, c + 2);
								break;
							case 39:
							case 34:
								// ' "
								index = cursor_quoteEnd(template, index, length, c === 39 ? "'" : '"')
								break;
							default:
								while (index < length) {
									c = template.charCodeAt(index);
									if (c === 44 || c === 59) {
										//, ;
										break;
									}
									index++;
								}
								index--;
								break;
						}
						index++;
						node.attr[key] = template.substring(start, index);
						state = go_next;
						continue;
					}
					if (state === go_next) {
						if (c === 44) {
							// ,
							state = go_varName;
							index++;
							continue;
						}
						break;
					}
				}
				return [node, index];
			};
			
			function stingify(){
				var attr = this.attr;
				var str = 'var ';
				for(var key in attr){
					if (str !== 'var ') 
						str += ',';
					
					str += key + '=' + attr[key];
				}
				return str + ';';
			}
		}());
		// end:source ./parsers/var.js
		// source ./parsers/slot.js
		(function(){
			
			function create(Ctor){
				return function(str, i, imax, parent) {
					var start = str.indexOf('{', i) + 1,
						head = parseHead(
							str.substring(i, start - 1)
						),
						end = cursor_groupEnd(str, start, imax, 123, 125),
						body = str.substring(start, end)
						;
					
					return [ new Ctor(head, body, parent), end + 1 ];
				};
			}
			
			function parseHead(head) {
				var parts = /(\w+)\s*\(([^\)]*)\)/.exec(head);
				if (parts == null) {
					log_error('`slot` has invalid head syntax', head);
					return null;
				}
				var arr = [ parts[1] ];
				arr = arr.concat(
					parts[2].replace(/\s/g, '').split(',')
				);
				return arr;
			}
			
			function Handler(head, body, parent) {
				this.name = head.shift();
				this.args = head;
				this.body = body;
				this.fn = this.compile();
				this.parent	= parent;
			}
			Handler.prototype = {
				type: Dom.COMPONENT,
				controller: null,
				elements: null,
				model: null,
				stringify: function(){
					return this.tagName
						+ this.name
						+ '('
						+ this.args.join(',')
						+ ') {'
						+ this.body
						+ '}'
						;
				},
				compile: function(){
					var arr = _Array_slice.call(this.args);
					arr.push(this.body);
					
					return new (Function.bind.apply(Function, [null].concat(arr)));
				},
				render: function() {}
			};
			
			var Slot = class_create(Handler, {
				tagName: 'slot',
				render: function(model, ctx, container, ctr) {
					var slots = ctr.slots;
					if (slots == null) {
						slots = ctr.slots = {};
					}
					
					slots[this.name] = this.fn;
				}
			});
			var Event = class_create(Handler, {
				tagName: 'event',
				render: function(model, ctx, container) {
					container.addEventListener(this.name, this.fn, false);
				}
			});
			
			custom_Parsers['slot' ] =  create(Slot);
			custom_Parsers['event'] =  create(Event);
			
		}());
		// end:source ./parsers/slot.js
		// source ./parsers/style.js
		(function(){
			custom_Parsers['style'] =  function(str, i, imax, parent){
				
				var start = str.indexOf('{', i) + 1,
					attr = parser_parseAttr(str, i, start - 1),
					end = cursor_groupEnd(str, start, imax, 123, 125),
					css = str.substring(start, end)
					;
				
				if (attr.self != null) {
					var style = parent.attr.style;
					parent.attr.style = parser_ensureTemplateFunction((style || '') + css);
					return [null, end + 1];
				}
				
				return [ new Style(attr, css, parent), end + 1 ];
			};
			
			function Style(attr, css, parent) {
				if (attr.scoped != null) {
					css = style_scope(css, parent);
				}
				
				css = style_transformHost(css, parent);
				this.content = parser_ensureTemplateFunction(css);
				this.parent	= parent;
				this.attr = attr;
			}
			Style.prototype = {
				tagName: 'style',
				type: Dom.COMPONENT,
				
				controller: null,
				elements: null,
				model: null,
				
				stringify: function(){
					return 'style {' + this.getStyle() + '}';
				},
				
				render: function(model, ctx, container, ctr) {
					var el = document.createElement('style');
					el.textContent = this.getStyle(model, ctx, el, ctr);
					
					var key, val
					for(key in this.attr) {
						val = this.attr[key];
						if (val != null) {
							el.setAttribute(key, val);
						}
					}
					container.appendChild(el);
				},
				
				getStyle: function(model, ctx, el, ctr){
					return is_Function(this.content)
						? this.content('node', model, ctx, el, ctr)
						: this.content;
				}
			};
			
			
			var style_scope,
				style_transformHost;
			(function(){
				var counter = 0;
				var rgx_selector = /^([\s]*)([^\{\}]+)\{/gm;
				var rgx_host = /^([\s]*):host\s*(\(([^)]+)\))?\s*\{/gm;
				
				style_scope = function(css, parent){
					var id;
					css = css.replace(rgx_selector, function(full, pref, selector){
						if (selector.indexOf(':host') !== -1) 
							return full;
						
						if (id == null) 
							id = getId(parent);
						
						var arr = selector.split(','),
							imax = arr.length,
							i = 0;
						for(; i < imax; i++) {
							arr[i] = id + ' ' + arr[i];
						}
						selector = arr.join(',');
						return pref + selector + '{';
					});
					return css;
				};
				
				style_transformHost = function(css, parent) {
					var id;
					css = css.replace(rgx_host, function(full, pref, ext, expr){
						
						return pref
							+ (id || (id = getId(parent)))
							+ (expr || '')
							+ '{';
					});
					return css;
				};
				
				function getId(parent) {
					if (parent == null) {
						log_warn('"style" should be inside elements node');
						return '';
					}
					var id = parent.attr.id;
					if (id == null) {
						id = parent.attr.id = 'scoped__css__' + (++counter);
					}
					return '#' + id;
				}
			}());
		}());
		// end:source ./parsers/style.js
	
		var go_tag = 2,
			state_tag = 3,
			state_attr = 5,
			go_attrVal = 6,
			go_attrHeadVal = 7,
			state_literal = 8,
			go_up = 9
			;
	
	
		Parser = {
	
			/** @out : nodes */
			parse: function(template) {
	
				var current = new Fragment(),
					fragment = current,
					state = go_tag,
					last = state_tag,
					index = 0,
					length = template.length,
					classNames,
					token,
					key,
					value,
					next,
					c, // charCode
					start,
					nextC;
	
				outer: while (true) {
	
					if (index < length && (c = template.charCodeAt(index)) < 33) {
						index++;
						continue;
					}
	
					// COMMENTS
					if (c === 47) {
						// /
						nextC = template.charCodeAt(index + 1);
						if (nextC === 47){
							// inline (/)
							index++;
							while (c !== 10 && c !== 13 && index < length) {
								// goto newline
								c = template.charCodeAt(++index);
							}
							continue;
						}
						if (nextC === 42) {
							// block (*)
							index = template.indexOf('*/', index + 2) + 2;
							
							if (index === 1) {
								// if DEBUG
								log_warn('<mask:parse> block comment has no end');
								// endif
								index = length;
							}
							
							
							continue;
						}
					}
	
					if (last === state_attr) {
						if (classNames != null) {
							current.attr['class'] = ensureTemplateFunction(classNames);
							classNames = null;
						}
						if (key != null) {
							current.attr[key] = key;
							key = null;
							token = null;
						}
					}
	
					if (token != null) {
	
						if (state === state_attr) {
	
							if (key == null) {
								key = token;
							} else {
								value = token;
							}
	
							if (key != null && value != null) {
								if (key !== 'class') {
									current.attr[key] = value;
								} else {
									classNames = classNames == null ? value : classNames + ' ' + value;
								}
	
								key = null;
								value = null;
							}
	
						} else if (last === state_tag) {
	
							//next = custom_Tags[token] != null
							//	? new Component(token, current, custom_Tags[token])
							//	: new Node(token, current);
							
							if (custom_Parsers[token] != null) {
								var tuple = custom_Parsers[token](template, index, length, current);
								var node = tuple[0];
								if (node != null) {
									current.appendChild(node);
								}
								index = tuple[1];
								state = go_tag;
								token = null;
								continue;
							}
							
							
							next = new Node(token, current);
							
							current.appendChild(next);
							current = next;
							state = state_attr;
	
						} else if (last === state_literal) {
	
							next = new TextNode(token, current);
							current.appendChild(next);
							
							if (current.__single === true) {
								do {
									current = current.parent;
								} while (current != null && current.__single != null);
							}
							state = go_tag;
	
						}
	
						token = null;
					}
	
					if (index >= length) {
						if (state === state_attr) {
							if (classNames != null) {
								current.attr['class'] = ensureTemplateFunction(classNames);
							}
							if (key != null) {
								current.attr[key] = key;
							}
						}
						c = null;
						break;
					}
	
					if (state === go_up) {
						current = current.parent;
						while (current != null && current.__single != null) {
							current = current.parent;
						}
						state = go_tag;
					}
	
					switch (c) {
					case 123:
						// {
	
						last = state;
						state = go_tag;
						index++;
	
						continue;
					case 62:
						// >
						last = state;
						state = go_tag;
						index++;
						current.__single = true;
						continue;
	
	
					case 59:
						// ;
	
						// skip ; , when node is not a single tag (else goto 125)
						if (current.nodes != null) {
							index++;
							continue;
						}
	
						/* falls through */
					case 125:
						// ;}
						if (c === 125 && (state === state_tag || state === state_attr)) {
							// single tag was not closed with `;` but closing parent
							index--;
						}
						
						index++;
						last = state;
						state = go_up;
						continue;
	
					case 39:
					case 34:
						// '"
						// Literal - could be as textnode or attribute value
						if (state === go_attrVal) {
							state = state_attr;
						} else {
							last = state = state_literal;
						}
	
						index++;
	
						var isEscaped = false,
							isUnescapedBlock = false,
							_char = c === 39 ? "'" : '"';
	
						start = index;
	
						while ((index = template.indexOf(_char, index)) > -1) {
							if (template.charCodeAt(index - 1) !== 92 /*'\\'*/ ) {
								break;
							}
							isEscaped = true;
							index++;
						}
						if (index === -1) {
							parser_warn('Literal has no ending', template, start);
							index = length;
						}
						
						if (index === start) {
							nextC = template.charCodeAt(index + 1);
							if (nextC === 124 || nextC === c) {
								// | (obsolete) or triple quote
								isUnescapedBlock = true;
								start = index + 2;
								index = template.indexOf((nextC === 124 ? '|' : _char) + _char + _char, start);
	
								if (index === -1) 
									index = length;
							}
						}
	
						token = template.substring(start, index);
						if (isEscaped === true) {
							token = token.replace(__rgxEscapedChar[_char], _char);
						}
						
						if (state !== state_attr || key !== 'class') 
							token = ensureTemplateFunction(token);
							
						index += isUnescapedBlock ? 3 : 1;
						continue;
					}
	
	
					if (state === go_tag) {
						last = state_tag;
						state = state_tag;
						//next_Type = Dom.NODE;
						
						if (c === 46 /* . */ || c === 35 /* # */ ) {
							token = 'div';
							continue;
						}
						
						//-if (c === 58 || c === 36 || c === 64 || c === 37) {
						//	// : /*$ @ %*/
						//	next_Type = Dom.COMPONENT;
						//}
						
					}
	
					else if (state === state_attr) {
						if (c === 46) {
							// .
							index++;
							key = 'class';
							state = go_attrHeadVal;
						}
						
						else if (c === 35) {
							// #
							index++;
							key = 'id';
							state = go_attrHeadVal;
						}
						
						else if (c === 61) {
							// =;
							index++;
							state = go_attrVal;
							
							if (last === state_tag && key == null) {
								parser_warn('Unexpected tag assignment', template, index, c, state);
							}
							continue;
						}
						
						else if (c === 40) {
							// (
							start = 1 + index;
							index = 1 + cursor_groupEnd(template, start, length, c, 41 /* ) */);
							current.expression = template.substring(start, index - 1);
							current.type = Dom.STATEMENT;
							continue;
						}
						
						else {
	
							if (key != null) {
								token = key;
								continue;
							}
						}
					}
	
					if (state === go_attrVal || state === go_attrHeadVal) {
						last = state;
						state = state_attr;
					}
	
	
	
					/* TOKEN */
	
					var isInterpolated = null;
	
					start = index;
					while (index < length) {
	
						c = template.charCodeAt(index);
	
						if (c === interp_code_START && template.charCodeAt(index + 1) === interp_code_OPEN) {
							isInterpolated = true;
							++index;
							do {
								// goto end of template declaration
								c = template.charCodeAt(++index);
							}
							while (c !== interp_code_CLOSE && index < length);
						}
	
						// if DEBUG
						if (c === 0x0027 || c === 0x0022 || c === 0x002F || c === 0x003C || c === 0x002C) {
							// '"/<,
							parser_warn('', template, index, c, state);
							break outer;
						}
						// endif
	
	
						if (last !== go_attrVal && (c === 46 || c === 35)) {
							// .#
							// break on .# only if parsing attribute head values
							break;
						}
	
						if (c < 33 ||
							c === 61 ||
							c === 62 ||
							c === 59 ||
							c === 40 ||
							c === 123 ||
							c === 125) {
							// =>;({}
							break;
						}
	
	
						index++;
					}
	
					token = template.substring(start, index);
	
					
					if (token === '') {
						parser_warn('String expected', template, index, c, state);
						break;
					}
					
					if (isInterpolated === true) {
						if (state === state_tag) {
							parser_warn('Invalid interpolation (in tag name)'
								, template
								, index
								, token
								, state);
							break;
						}
						if (state === state_attr) {
							if (key === 'id' || last === go_attrVal) {
								token = ensureTemplateFunction(token);
							}
							else if (key !== 'class') {
								// interpolate class later
								parser_warn('Invalid interpolation (in attr name)'
									, template
									, index
									, token
									, state);
								break;
							}
						}
					}
				}
	
				if (c !== c) {
					parser_warn('IndexOverflow'
						, template
						, index
						, c
						, state
					);
				}
	
				// if DEBUG
				var parent = current.parent;
				if (parent != null &&
					parent !== fragment &&
					parent.__single !== true &&
					current.nodes != null) {
					parser_warn('Tag was not closed: ' + current.tagName, template)
				}
				// endif
	
				
				var nodes = fragment.nodes;
				return nodes != null && nodes.length === 1
					? nodes[0]
					: fragment
					;
			},
			
			// obsolete
			cleanObject: function(obj) {
				if (obj instanceof Array) {
					for (var i = 0; i < obj.length; i++) {
						this.cleanObject(obj[i]);
					}
					return obj;
				}
				delete obj.parent;
				delete obj.__single;
	
				if (obj.nodes != null) {
					this.cleanObject(obj.nodes);
				}
	
				return obj;
			},
			setInterpolationQuotes: function(start, end) {
				if (!start || start.length !== 2) {
					log_error('Interpolation Start must contain 2 Characters');
					return;
				}
				if (!end || end.length !== 1) {
					log_error('Interpolation End must be of 1 Character');
					return;
				}
	
				interp_code_START = start.charCodeAt(0);
				interp_code_OPEN = start.charCodeAt(1);
				interp_code_CLOSE = end.charCodeAt(0);
				
				interp_START = start[0];
				interp_OPEN = start[1];
				interp_CLOSE = end;
			},
			
			ensureTemplateFunction: ensureTemplateFunction
		};
		
		// = exports
		
		parser_parse = Parser.parse;
		parser_ensureTemplateFunction = Parser.ensureTemplateFunction;
		parser_cleanObject = Parser.cleanObject;
		parser_setInterpolationQuotes = Parser.setInterpolationQuotes;
		
		parser_parseAttr = function(str, start, end){
			var attr = {},
				i = start,
				key, val, c;
			while(i < end) {
				i = cursor_skipWhitespace(str, i, end);
				if (i === end) 
					break;
				
				start = i;
				for(; i < end; i++){
					c = str.charCodeAt(i);
					if (c === 61 || c < 33) break;
				}
				
				key = str.substring(start, i);
				
				i = cursor_skipWhitespace(str, i, end);
				if (i === end) {
					attr[key] = key;
					break;
				}
				if (str.charCodeAt(i) !== 61 /*=*/) {
					attr[key] = key;
					continue;
				}
				
				i = start = cursor_skipWhitespace(str, i + 1, end);
				c = str.charCodeAt(i);
				if (c === 34 || c === 39) {
					// "|'
					i = cursor_quoteEnd(str, i + 1, end, c === 39 ? "'" : '"');
					
					attr[key] = str.substring(start + 1, i);
					i++;
					continue;
				}
				i = cursor_goToWhitespace(str, i, end);
				attr[key] = str.substring(start, i);
			}
			return attr;
		};
		
	}(Dom.Node, Dom.TextNode, Dom.Fragment, Dom.Component));
	
	// end:source /src/parse/parser.js
	// source /src/build/builder.dom.js
	var builder_componentID = 0,
		builder_build;
	
	(function(custom_Attributes, custom_Tags, Component){
		
		// source ./util.js
		function build_resumeDelegate(controller, model, ctx, container, children){
			var anchor = container.appendChild(document.createComment(''));
			
			return function(){
				return build_resumeController(controller, model, ctx, anchor, children);
			};
		}
		function build_resumeController(ctr, model, ctx, anchor, children) {
			
			if (ctr.tagName != null && ctr.tagName !== ctr.compoName) {
				ctr.nodes = {
					tagName: ctr.tagName,
					attr: ctr.attr,
					nodes: ctr.nodes,
					type: 1
				};
			}
			if (ctr.model != null) {
				model = ctr.model;
			}
			
			var nodes = ctr.nodes,
				elements = [];
			if (nodes != null) {
		
				var isarray = nodes instanceof Array,
					length = isarray === true ? nodes.length : 1,
					i = 0,
					childNode = null,
					fragment = document.createDocumentFragment();
		
				for (; i < length; i++) {
					childNode = isarray === true ? nodes[i] : nodes;
					
					builder_build(childNode, model, ctx, fragment, ctr, elements);
				}
				
				anchor.parentNode.insertBefore(fragment, anchor);
			}
			
				
			// use or override custom attr handlers
			// in Compo.handlers.attr object
			// but only on a component, not a tag ctr
			if (ctr.tagName == null) {
				var attrHandlers = ctr.handlers && ctr.handlers.attr,
					attrFn,
					key;
				for (key in ctr.attr) {
					
					attrFn = null;
					
					if (attrHandlers && is_Function(attrHandlers[key])) {
						attrFn = attrHandlers[key];
					}
					
					if (attrFn == null && is_Function(custom_Attributes[key])) {
						attrFn = custom_Attributes[key];
					}
					
					if (attrFn != null) {
						attrFn(anchor, ctr.attr[key], model, ctx, elements[0], ctr);
					}
				}
			}
			
			if (is_Function(ctr.renderEnd)) {
				ctr.renderEnd(elements, model, ctx, anchor.parentNode);
			}
			
		
			if (children != null && children !== elements){
				var il = children.length,
					jl = elements.length,
					j  = -1;
					
				while(++j < jl){
					children[il + j] = elements[j];
				}
			}
		}
		// end:source ./util.js
		// source ./util.controller.js
		function controller_pushCompo(ctr, compo) {
			var compos = ctr.components;
			if (compos == null) {
				ctr.components = [ compo ];
				return;
			}
			compos.push(compo);
		}
		// end:source ./util.controller.js
		
		// source ./type.textNode.js
		
		var build_textNode = (function(){
			
			var append_textNode = (function(document){
				
				return function(element, text){
					element.appendChild(document.createTextNode(text));
				};
				
			}(document));
			
			return function build_textNode(node, model, ctx, container, controller) {
				
				var content = node.content;
					
				
				if (is_Function(content)) {
				
					var result = content('node', model, ctx, container, controller);
				
					if (typeof result === 'string') {
						
						append_textNode(container, result);
						return;
					} 
				
					
					// result is array with some htmlelements
					var text = '',
						jmax = result.length,
						j = 0,
						x;
						
					for (; j < jmax; j++) {
						x = result[j];
			
						if (typeof x === 'object') {
							// In this casee result[j] should be any HTMLElement
							if (text !== '') {
								append_textNode(container, text);
								text = '';
							}
							if (x.nodeType == null) {
								text += x.toString();
								continue;
							}
							container.appendChild(x);
							continue;
						}
			
						text += x;
					}
					
					if (text !== '') {
						append_textNode(container, text);
					}
					
					return;
				} 
				
				append_textNode(container, content);
			}
		}());
		// end:source ./type.textNode.js
		// source ./type.node.js
		
		var build_node = (function(){
			
			var el_create = (function(doc){
				return function(name){
					
					// if DEBUG
					try {
					// endif
						return doc.createElement(name);
					// if DEBUG
					} catch(error) {
						log_error(name, 'element cannot be created. If this should be a custom handler tag, then controller is not defined');
						return null;
					}
					// endif
				};
			}(document));
			
			return function build_node(node, model, ctx, container, controller, childs){
				
				var tagName = node.tagName,
					attr = node.attr;
				
				var tag = el_create(tagName);
				if (tag == null) 
					return;
				
				if (childs != null){
					childs.push(tag);
					attr['x-compo-id'] = controller.ID;
				}
				
				// ++ insert tag into container before setting attributes, so that in any
				// custom util parentNode is available. This is for mask.node important
				// http://jsperf.com/setattribute-before-after-dom-insertion/2
				if (container != null) {
					container.appendChild(tag);
				}
				
				var key,
					value;
				for (key in attr) {
				
					/* if !SAFE
					if (_Object_hasOwnProp.call(attr, key) === false) {
						continue;
					}
					*/
				
					if (is_Function(attr[key])) {
						value = attr[key]('attr', model, ctx, tag, controller, key);
						if (value instanceof Array) {
							value = value.join('');
						}
				
					} else {
						value = attr[key];
					}
				
					// null or empty string will not be handled
					if (value) {
						if (is_Function(custom_Attributes[key])) {
							custom_Attributes[key](node, value, model, ctx, tag, controller, container);
						} else {
							tag.setAttribute(key, value);
						}
					}
				}
		
				return tag;
			}
			
		}());
		// end:source ./type.node.js
		// source ./type.component.js
		var build_compo;
		(function(){
			build_compo = function(node, model, ctx, container, ctr, children){
				
				var compoName = node.tagName,
					Handler;
				
				if (node.controller != null) 
					Handler = node.controller;
				
				if (Handler == null) 
					Handler = custom_Tags[compoName];
				
				if (Handler == null) 
					return build_NodeAsCompo(node, model, ctx, container, ctr, children);
				
				var isStatic = false,
					handler, attr, key;
				
				if (typeof Handler === 'function') {
					handler = new Handler(node, model, ctx, container, ctr);
				} else{
					handler = Handler;
					isStatic = true;
				}
				var fn = isStatic
					? build_Static
					: build_Component
					;
				return fn(handler, node, model, ctx, container, ctr, children);
			}
			
			
			// PRIVATE
			
			function build_Component(compo, node, model, ctx, container, ctr, children){
				var attr, key;
				
				compo.ID = ++builder_componentID;
				compo.attr = attr = attr_extend(compo.attr, node.attr);
				compo.parent = ctr;
				compo.expression = node.expression;
				
				if (compo.compoName == null) 
					compo.compoName = node.tagName;
				
				if (compo.model == null) 
					compo.model = model;
				
				if (compo.nodes == null) 
					compo.nodes = node.nodes;
				
				for (key in attr) {
					if (typeof attr[key] === 'function') 
						attr[key] = attr[key]('attr', model, ctx, container, ctr, key);
				}
			
				
				listeners_emit(
					'compoCreated'
					, compo
					, model
					, ctx
					, container
				);
			
				if (is_Function(compo.renderStart)) 
					compo.renderStart(model, ctx, container);
				
				
				controller_pushCompo(ctr, compo);
				
				if (compo.async === true) {
					compo.await(build_resumeDelegate(compo, model, ctx, container, children));
					return null;
				}
				
				if (compo.tagName != null) {
					compo.nodes = {
						tagName: compo.tagName,
						attr: compo.attr,
						nodes: compo.nodes,
						type: 1
					};
				}
				
				
				if (typeof compo.render === 'function') {
					compo.render(compo.model, ctx, container);
					// Overriden render behaviour - do not render subnodes
					return null;
				}	
				return compo;
			}
			
			
			function build_Static(static_, node, model, ctx, container, ctr, children) {
				var Ctor = static_.__Ctor,
					wasRendered = false,
					elements,
					compo,
					clone;
				
				if (Ctor != null) {
					clone = new Ctor(node, ctr);
				}
				else {
					clone = static_;
					
					for (var key in node) 
						clone[key] = node[key];
					
					clone.parent = ctr;
				}
				
				var attr = clone.attr;
				if (attr != null) {
					for (var key in attr) {
						if (typeof attr[key] === 'function') 
							attr[key] = attr[key]('attr', model, ctx, container, ctr, key);
					}
				}
				
				if (is_Function(clone.renderStart)) 
					clone.renderStart(model, ctx, container, ctr, children);
				
				controller_pushCompo(ctr, clone);
				
				var i = ctr.components.length - 1;
				if (is_Function(clone.render)){
					wasRendered = true;
					elements = clone.render(model, ctx, container, ctr, children);
					arr_pushMany(children, elements);
					
					if (is_Function(clone.renderEnd)) {
						compo = clone.renderEnd(elements, model, ctx, container, ctr);
						if (compo != null) {
							// overriden
							ctr.components[i] = compo;
						}
					}
				}
				
				return wasRendered
					? null
					: clone
					;
			
			}
			
			
			function build_NodeAsCompo(node, model, ctx, container, ctr, childs){
				node.ID = ++builder_componentID;
				
				controller_pushCompo(ctr, node);
				
				if (node.model == null) 
					node.model = model;
				
				var els = node.elements = [];
				if (node.render) {
					node.render(node.model, ctx, container, ctr, els);
				} else {
					builder_build(node.nodes, node.model, ctx, container, node, els);
				}
				
				if (childs != null && els.length !== 0)
					arr_pushMany(childs, els);
		
				return null;
			}
			
		}());
		
		// end:source ./type.component.js
		
		builder_build = function(node, model, ctx, container, ctr, childs) {
		
			if (node == null) 
				return container;
			
			var type = node.type,
				elements,
				key,
				value,
				j, jmax;
			
			if (ctr == null) 
				ctr = new Component();
				
			if (type == null){
				// in case if node was added manually, but type was not set
				
				if (node instanceof Array) {
					type = 10
				}
				else if (node.tagName != null){
					type = 1;
				}
				else if (node.content != null){
					type = 2;
				}
			}
			
			if (type === 1 && custom_Tags[node.tagName] != null) {
				// check if custom ctr exists
				type = 4;
			}
		
			if (container == null && type !== 1) 
				container = document.createDocumentFragment();
			
			
			// Dom.TEXTNODE
			if (type === 2) {
				
				build_textNode(node, model, ctx, container, ctr);
				return container;
			}
			
			// Dom.SET
			if (type === 10) {
				
				j = 0;
				jmax = node.length;
				
				for(; j < jmax; j++) {
					builder_build(node[j], model, ctx, container, ctr, childs);
				}
				return container;
			}
			
			var tagName = node.tagName;
			if (tagName === 'else') 
				return container;
			
			// Dom.STATEMENT
			if (type === 15) {
				var Handler = custom_Statements[tagName];
				if (Handler == null) {
					
					if (custom_Tags[tagName] != null) {
						// Dom.COMPONENT
						type = 4;
					} else {
						log_error('<mask: statement is undefined>', tagName);
						return container;
					}
					
				}
				
				if (type === 15) {
					
					Handler.render(node, model, ctx, container, ctr, childs);
					return container;
				}
			}
		
			// Dom.NODE
			if (type === 1) {
				container = build_node(node, model, ctx, container, ctr, childs);
				childs = null;
			}
		
			// Dom.COMPONENT
			if (type === 4) {
		
				ctr = build_compo(node, model, ctx, container, ctr, childs);
				
				if (ctr == null) 
					return container;
				
				elements = [];
				node = ctr;
				
				if (ctr.model !== model && ctr.model != null) 
					model = ctr.model;
				
			}
		
			var nodes = node.nodes;
			if (nodes != null) {
		
				if (childs != null && elements == null)
					elements = childs;
				
				var isarray = nodes instanceof Array,
					length = isarray === true ? nodes.length : 1,
					i = 0,
					childNode = null;
		
				for (; i < length; i++) {
					childNode = isarray === true
						? nodes[i]
						: nodes;
					
					builder_build(childNode, model, ctx, container, ctr, elements);
				}
		
			}
		
			if (type === 4) {
				
				// use or override custom attr handlers
				// in Compo.handlers.attr object
				// but only on a component, not a tag ctr
				if (node.tagName == null && node.compoName !== '%') {
					var attrHandlers = node.handlers && node.handlers.attr,
						attrFn,
						val,
						key;
						
					for (key in node.attr) {
						
						val = node.attr[key];
						
						if (val == null) 
							continue;
						
						attrFn = null;
						
						if (attrHandlers != null && is_Function(attrHandlers[key])) 
							attrFn = attrHandlers[key];
						
						if (attrFn == null && custom_Attributes[key] != null) 
							attrFn = custom_Attributes[key];
						
						if (attrFn != null) 
							attrFn(node, val, model, ctx, elements[0], ctr);
					}
				}
				
				if (is_Function(node.renderEnd)) 
					node.renderEnd(elements, model, ctx, container);
			}
		
			if (childs != null && elements != null && childs !== elements)
				arr_pushMany(childs, elements);
			
			return container;
		};
		
		
		
	}(custom_Attributes, custom_Tags, Dom.Component));
	// end:source /src/build/builder.dom.js
	
	/* Features */
	// source /src/feature/run.js
	var mask_run;
	
	(function(){
		mask_run = function(){
			var args = _Array_slice.call(arguments),
				container,
				model,
				Ctr,
				imax,
				i,
				mix;
			
			imax = args.length;
			i = -1;
			while ( ++i < imax ) {
				mix = args[i];
				if (mix instanceof Node) {
					container = mix;
					continue;
				}
				if (is_Function(mix)) {
					Ctr = mix;
					continue;
				}
				if (is_Object(mix)) {
					model = mix;
					continue;
				}
			}
			
			if (container == null) 
				container = document.body;
				
			var ctr = is_Function(Ctr)
				? new Ctr
				: new Compo
				;
			ctr.ID = ++builder_componentID;
			
			if (model == null) 
				model = ctr.model || {};
			
			var scripts = _Array_slice.call(document.getElementsByTagName('script')),
				script,
				found = false;
				
			imax = scripts.length;
			i = -1;
			while( ++i < imax ){
				script = scripts[i];
				if (script.getAttribute('type') !== 'text/mask') 
					continue;
				if (script.getAttribute('data-run') !== 'true') 
					continue;
				
				var fragment = builder_build(
					parser_parse(script.textContent), model, {}, null, ctr
				);
				script.parentNode.insertBefore(fragment, script);
				found = true;
			}
			if (found === false) {
				log_warn("No blocks found: <script type='text/mask' data-run='true'>...</script>");
			}
			if (is_Function(ctr.renderEnd)) {
				ctr.renderEnd(container, model);
			}
			Compo.signal.emitIn(ctr, 'domInsert');
			return ctr;
		};
	}());
	// end:source /src/feature/run.js
	// source /src/feature/merge.js
	var mask_merge;
	(function(){
		
		mask_merge = function(a, b, owner){
			if (typeof a === 'string') 
				a = parser_parse(a);
			if (typeof b === 'string') 
				b = parser_parse(b);
			
			var contents = _getContents(b, b, new Contents);
			return _merge(a, contents, owner);
		};
		
		var tag_ELSE = '@else',
			tag_IF = '@if',
			tag_EACH = '@each',
			tag_PLACEHOLDER = '@placeholder',
			
			dom_NODE = Dom.NODE,
			dom_TEXTNODE = Dom.TEXTNODE,
			dom_FRAGMENT = Dom.FRAGMENT,
			dom_STATEMENT = Dom.STATEMENT
			;
		
		function _merge(node, contents, tmplNode, clonedParent){
			if (node == null) 
				return null;
			
			if (is_Array(node)) 
				return _mergeArray(node, contents, tmplNode, clonedParent);
			
			switch(node.type){
				case dom_TEXTNODE:
					return _cloneTextNode(node, contents, tmplNode);
				case dom_NODE:
				case dom_STATEMENT:
					return _mergeNode(node, contents, tmplNode, clonedParent);
				case dom_FRAGMENT:
					return _mergeFragment(node, contents, tmplNode, clonedParent);
			}
			log_warn('Uknown type', node.type);
			return null;
		}
		function _mergeArray(nodes, contents, tmplNode, clonedParent){
			var fragment = [],
				imax = nodes.length,
				i = -1,
				x, node;
			while( ++i < imax ) {
				node = nodes[i];
				
				if (node.tagName === tag_ELSE) {
					// check previous 
					if (x != null)
						continue;
					
					if (node.expression && !eval_(node.expression, contents, tmplNode)) 
						continue;
					
					x = _merge(nodes[i].nodes, contents, tmplNode, clonedParent)
				}
				else {
					x = _merge(node, contents, tmplNode, clonedParent);
				}
				
				appendAny(fragment, x);
			}
			return fragment;
		}
		function _mergeFragment(frag, contents, tmplNode, clonedParent) {
			var fragment = new Dom.Fragment;
			fragment.parent = clonedParent;
			fragment.nodes = _mergeArray(frag.nodes, contents, tmplNode, fragment);
			return fragment;
		}
		function _mergeNode(node, contents, tmplNode, clonedParent){
			var tagName = node.tagName;
			if (tagName.charCodeAt(0) !== 64) {
				// @
				return _cloneNode(node, contents, tmplNode, clonedParent);
			}
			
			var id = node.attr.id;
			if (tagName === tag_PLACEHOLDER && id == null) 
				return tmplNode.nodes;
			
			if (tag_EACH === tagName) {
				var arr = contents[node.expression],
					x;
				if (arr == null) {
					log_error('No template node: @' + node.expression);
					return null;
				}
				if (is_Array(arr) === false) {
					x = arr;
					return _merge(
						node.nodes
						, _getContents(x.nodes, x.nodes, new Contents(contents))
						, x
						, clonedParent
					);
				}
				var fragment = new Dom.Fragment,
					imax = arr.length,
					i = -1;
				while ( ++i < imax ){
					x = arr[i];
					appendAny(fragment, _merge(
						node.nodes
						, _getContents(x.nodes, x.nodes, new Contents(contents))
						, x
						, clonedParent
					));
				}
				return fragment;
			}
			if (tag_IF === tagName) {
				var val = eval_(node.expression, contents, tmplNode);
				return val
					? _merge(node.nodes, contents, tmplNode, clonedParent)
					: null
					;
			}
			
			if (id == null) 
				id = tagName.substring(1);
			
			var content = contents.$getNode(id);
			if (content == null) 
				return null;
			
			if (content.parent) 
				_modifyParents(clonedParent, content.parent);
			
			
			var contentNodes = content.nodes,
				wrapperNode;
			if (node.attr.as !== void 0) {
				var tagName_ = node.attr.as;
				wrapperNode = {
					type: dom_NODE,
					tagName: tagName_,
					attr: _mergeAttr(node.attr, content.attr, contents, tmplNode),
					parent: clonedParent,
					nodes: contentNodes
				};
				wrapperNode.attr.as = null;
			}
			
			if (node.nodes == null) 
				return wrapperNode || contentNodes;
			
			var nodes =  _merge(
				node.nodes
				, _getContents(contentNodes, contentNodes, new Contents(contents))
				, content
				, wrapperNode || clonedParent
			);
			if (wrapperNode != null) {
				wrapperNode.nodes = nodes;
				return wrapperNode;
			}
			return nodes;
		}
		function _mergeAttr(a, b, contents, tmplNode){
			if (a == null || b == null) 
				return a || b;
			
			var out = interpolate_obj_(a, contents, tmplNode);
			for (var key in b){
				out[key] = interpolate_str_(b[key], contents, tmplNode);
			}
			return out;
		}
		
		function _cloneNode(node, contents, tmplNode, clonedParent){
			var tagName = node.tagName || node.compoName;
			if (':template' === tagName) {
				var id = interpolate_str_(node.attr.id, contents, tmplNode);
				Mask.templates.register(id, node.nodes);
				return null;
			}
			if (':import' === tagName) {
				var id = interpolate_str_(node.attr.id, contents, tmplNode),
					nodes = Mask.templates.resolve(node, id);
				return _merge(nodes, contents, tmplNode, clonedParent);
			}
			var outnode = {
				type: node.type,
				tagName: tagName,
				attr: interpolate_obj_(node.attr, contents, tmplNode),
				expression: interpolate_str_(node.expression, contents, tmplNode),
				controller: node.controller,
				parent: clonedParent
			};
			if (node.nodes) 
				outnode.nodes = _merge(node.nodes, contents, tmplNode, outnode);
			
			return outnode;
		}
		function _cloneTextNode(node, contents, tmplNode, clonedParent){
			return {
				type: node.type,
				content: interpolate_str_(node.content, contents, tmplNode),
				parent: clonedParent
			};
		}
		function interpolate_obj_(obj, contents, node){
			var clone = _Object_create(obj),
				x;
			for(var key in clone){
				x = clone[key];
				if (x == null) 
					continue;
				
				clone[key] = interpolate_str_(x, contents, node);
			}
			return clone;
		}
		function interpolate_str_(mix, contents, node){
			var index = -1,
				isFn = false,
				str = mix;
				
			if (typeof mix === 'function') {
				isFn = true;
				str = mix();
			}
			if (typeof str !== 'string' || (index = str.indexOf('@')) === -1) 
				return mix;
			
			var result = str.substring(0, index),
				length = str.length,
				isBlockEntry = str.charCodeAt(index + 1) === 91, // [ 
				last = -1,
				c;
			
			while (index < length) {
				// interpolation
				last = index;
				if (isBlockEntry === true) {
					index = str.indexOf(']', last);
					if (index === -1) 
						index = length;
					last += 2;
				}
				else {
					while (index < length) {
						c = str.charCodeAt(++index);
						if (c === 36 || c === 95 || c === 46) {
							// $ _ .
							continue;
						}
						if ((48 <= c && c <= 57) ||		// 0-9
							(65 <= c && c <= 90) ||		// A-Z
							(97 <= c && c <= 122)) {	// a-z
							continue;
						}
						break;
					}
				}
				
				var expr = str.substring(last, index),
					fn = isBlockEntry ? eval_ : interpolate_,
					x = fn(expr, contents, node);
						
				if (x != null) 
					result += x;
				
				// tail
				last = isBlockEntry ? (index + 1): index;
				index = str.indexOf('@', index);
				if (index === -1) 
					index = length;
				
				result += str.substring(last, index);
			}
			
			return isFn
				? parser_ensureTemplateFunction(result)
				: result
				;
		}
		function interpolate_(path, contents, node) {
			var index = path.indexOf('.');
			if (index === -1) {
				log_warn('Merge templates. Accessing node', path);
				return '';
			}
			var tagName = path.substring(0, index),
				id = tagName.substring(1),
				property = path.substring(index + 1),
				obj = null;
			
			if (node != null) {
				if (tagName === '@attr')
					obj = node.attr;
				else if (tagName === node.tagName) 
					obj = node;
			}
			
			if (obj == null) 
				obj = contents.$getNode(id);
			
			if (obj == null) {
				log_error('Merge templates. Node not found', tagName);
				return '';
			}
			return obj_getProperty(obj, property);
		}
		
		function appendAny(node, mix){
			if (mix == null) 
				return;
			if (typeof mix.concat === 'function') {
				var imax = mix.length;
				for (var i = 0; i < imax; i++) {
					appendAny(node, mix[i]);
				}
				return;
			}
			if (mix.type === dom_FRAGMENT) {
				appendAny(node, mix.nodes);
				return;
			}
			
			if (typeof node.appendChild === 'function') {
				node.appendChild(mix);
				return;
			}
			
			var l = node.length;
			if (l > 0) {
				var prev = node[l - 1];
				prev.nextSibling = mix;
			}
			node.push(mix);
		}
		
		var RESERVED = ' else placeholder each attr if parent scope'
		function _getContents(b, node, contents) {
			if (node == null) 
				return contents;
			
			if (is_Array(node)) {
				var imax = node.length,
					i = -1;
				while( ++i < imax ){
					_getContents(node === b ? node[i] : b, node[i], contents);
				}
				return contents;
			}
			
			var type = node.type;
			if (type === dom_TEXTNODE) 
				return contents;
			
			if (type === dom_NODE) {
				var tagName = node.tagName;
				if (tagName != null && tagName.charCodeAt(0) === 64) {
					// @
					var id = tagName.substring(1);
					// if DEBUG
					if (RESERVED.indexOf(' ' + id + ' ') !== -1) 
						log_error('MaskMerge. Reserved Name', id);
					// endif
					var x = {
						tagName: node.tagName,
						parent: _getParentModifiers(b, node),
						nodes: node.nodes,
						attr: node.attr,
						expression: node.expression
					};
					if (contents[id] == null) {
						contents[id] = x;
					} else {
						var current = contents[id];
						if (is_Array(current)) {
							current.push(x);
						}
						else {
							contents[id] = [current, x];
						}
					}
					return contents;
				}
			}
			return _getContents(b, node.nodes, contents);
		}
		function _getParentModifiers(root, node) {
			if (node === root) 
				return null;
			
			var current, parents, parent = node.parent;
			while (true) {
				if (parent == null) 
					break;
				if (parent === root && root.type !== dom_NODE)
					break;
				
				var p = {
						type: parent.type,
						tagName: parent.tagName,
						attr: parent.attr,
						controller: parent.controller,
						expression: parent.expression,
						nodes: null,
						parent: null
					};
	
				if (parents == null) {
					current = parents = p;
				} else {
					current.parent = p;
					current = p;
				}
				parent = parent.parent;
			}
			return parents;
		}
		function _modifyParents(clonedParent, parents){
			var nodeParent = clonedParent, modParent = parents;
			while(nodeParent != null && modParent != null){
				
				if (modParent.tagName) 
					nodeParent.tagName = modParent.tagName;
				
				if (modParent.expression) 
					nodeParent.expression = modParent.expression;
				
				for(var key in modParent.attr){
					nodeParent.attr[key] = modParent.attr[key];
				}
				
				nodeParent = nodeParent.parent;
				modParent = modParent.parent;
			}
		}
		
		function eval_(expr, contents, tmplNode) {
			if (tmplNode) 
				contents.attr = tmplNode.attr;
			
			return ExpressionUtil.eval(expr, contents, null, contents);
		}
		function Contents(parent){
			this.scope = this;
			this.parent = parent;
		}
		Contents.prototype = {
			parent: null,
			attr: null,
			scope: null,
			$getNode: function(id){
				var ctx = this, node;
				while(ctx != null){
					node = ctx[id];
					if (node != null) 
						return node;
					ctx = ctx.parent;
				}
			}
		};
		
	}());
	// end:source /src/feature/merge.js
	
	// source /src/mask.js
	/**
	 *  mask
	 *
	 **/
	
	var cache = {},
		Mask = {
	
			/**
			 *	mask.render(template[, model, ctx, container = DocumentFragment, controller]) -> container
			 * - template (String | MaskDOM): Mask String or Mask DOM Json template to render from.
			 * - model (Object): template values
			 * - ctx (Object): can store any additional information, that custom handler may need,
			 * this object stays untouched and is passed to all custom handlers
			 * - container (IAppendChild): container where template is rendered into
			 * - controller (Object): instance of an controller that own this template
			 *
			 *	Create new Document Fragment from template or append rendered template to container
			 **/
			render: function (template, model, ctx, container, controller) {
	
				// if DEBUG
				if (container != null && typeof container.appendChild !== 'function'){
					log_error('.render(template[, model, ctx, container, controller]', 'Container should implement .appendChild method');
					log_warn('Args:', arguments);
				}
				// endif
	
				if (typeof template === 'string') {
					if (_Object_hasOwnProp.call(cache, template)){
						/* if Object doesnt contains property that check is faster
						then "!=null" http://jsperf.com/not-in-vs-null/2 */
						template = cache[template];
					}else{
						template = cache[template] = parser_parse(template);
					}
				}
				if (ctx == null) 
					ctx = {};
				
				return builder_build(template, model, ctx, container, controller);
			},
	
			/* deprecated, renamed to parse */
			compile: parser_parse,
	
			/**
			 *	mask.parse(template) -> MaskDOM
			 * - template (String): string to be parsed into MaskDOM
			 *
			 * Create MaskDOM from Mask markup
			 **/
			parse: parser_parse,
	
			build: builder_build,
			
			/*
			 * - ?model:Object
			 * - ?Controller: Function
			 * - ?container: Node (@default: body)
			 */
			run: mask_run,
			
			
			/*
			 * - aTmpl: Mask Template
			 * - bTmpl: Mask Template
			 *
			 * @returns New joined mask template
			 */
			merge: mask_merge,
			
			/**
			 * mask.registerHandler(tagName, tagHandler) -> void
			 * - tagName (String): Any tag name. Good practice for custom handlers it when its name begins with ':'
			 * - tagHandler (Function|Object):
			 *
			 *	When Mask.Builder matches the tag binded to this tagHandler, it -
			 *	creates instances of the class(in case of Function) or uses specified object.
			 *	Shallow copies -
			 *		.nodes(MaskDOM) - Template Object of this node
			 *		.attr(Object) - Attributes of this node
			 *	And calls
			 *		.renderStart(model, ctx, container)
			 *		.renderEnd(elements, model, ctx, container)
			 *
			 *	Custom Handler now can handle rendering of underlined nodes.
			 *	The most simple example to continue rendering is:
			 *	mask.render(this.nodes, model, container, ctx);
			 **/
			registerHandler: customTag_register,
			/**
			 *	mask.getHandler(tagName) -> Function | Object
			 * - tagName (String):
			 *
			 *	Get Registered Handler
			 **/
			getHandler: function (tagName) {
				return tagName != null
					? custom_Tags[tagName]
					: custom_Tags
					;
			},
			
			registerStatement: function(name, handler){
				//@TODO should it be not allowed to override system statements, if, switch?
				
				custom_Statements[name] = is_Function(handler)
					? { render: handler }
					: handler
					;
			},
			
			getStatement: function(name){
				return name != null
					? custom_Statements[name]
					: custom_Statements
					;
			},
			
			/**
			 * mask.registerAttrHandler(attrName, mix, Handler) -> void
			 * - attrName (String): any attribute string name
			 * - mix (String | Function): Render Mode or Handler Function if 'both'
			 * - Handler (Function)
			 *
			 * Handler Interface, <i>(similar to Utility Interface)</i>
			 * ``` customAttribute(maskNode, attributeValue, model, ctx, element, controller) ```
			 *
			 * You can change do any changes to maskNode's template, current element value,
			 * controller, model.
			 *
			 * Note: Attribute wont be set to an element.
			 **/
			registerAttrHandler: function(attrName, mix, Handler){
				if (is_Function(mix)) {
					Handler = mix;
				}
				
				custom_Attributes[attrName] = Handler;
			},
			
			getAttrHandler: function(attrName){
				return attrName != null
					? custom_Attributes[attrName]
					: custom_Attributes;
			},
			/**
			 *	mask.registerUtil(utilName, mix) -> void
			 * - utilName (String): name of the utility
			 * - mix (Function, Object): Util Handler
			 *
			 *	Register Util Handler. Template Example: '~[myUtil: value]'
			 *
			 *	Function interface:
			 *	```
			 *	function(expr, model, ctx, element, controller, attrName, type);
			 *	```
			 *
			 *	- value (String): string from interpolation part after util definition
			 *	- model (Object): current Model
			 *	- type (String): 'attr' or 'node' - tells if interpolation is in TEXTNODE value or Attribute
			 *	- ctx (Object): Context Object
			 *	- element (HTMLNode): current html node
			 *	- name (String): If interpolation is in node attribute, then this will contain attribute name
			 *
			 *  Object interface:
			 *  ```
			 *  {
			 *  	nodeRenderStart: function(expr, model, ctx, element, controller){}
			 *  	node: function(expr, model, ctx, element, controller){}
			 *
			 *  	attrRenderStart: function(expr, model, ctx, element, controller, attrName){}
			 *  	attr: function(expr, model, ctx, element, controller, attrName){}
			 *  }
			 *  ```
			 *
			 *	This diff nodeRenderStart/node is needed to seperate util logic.
			 *	Mask in node.js will call only node-/attrRenderStart,
			 *  
			 **/
			
			registerUtil: customUtil_register,
			getUtil: customUtil_get,
			
			$utils: customUtil_$utils,
			
			registerUtility: function (utilityName, fn) {
				// if DEBUG
				log_warn('@registerUtility - deprecated - use registerUtil(utilName, mix)', utilityName);
				// endif
				this.registerUtility = this.registerUtil;
				this.registerUtility(utilityName, fn);
			},
			
			getUtility: function(util){
				// if DEBUG
				log_warn('@getUtility - deprecated - use getUtil(utilName)', util);
				// endif
				this.getUtility = this.getUtil;
				
				return this.getUtility();
			},
			/**
			 * mask.clearCache([key]) -> void
			 * - key (String): template to remove from cache
			 *
			 *	Mask Caches all templates, so this function removes
			 *	one or all templates from cache
			 **/
			clearCache: function(key){
				if (typeof key === 'string'){
					delete cache[key];
				}else{
					cache = {};
				}
			},
	
			Utils: {
				
				/**
				 * mask.Util.Expression -> ExpressionUtil
				 *
				 * [[ExpressionUtil]]
				 **/
				Expression: ExpressionUtil,
	
				/**
				 *	mask.Util.getProperty(model, path) -> value
				 *	- model (Object | value)
				 *	- path (String): Property or dot chainable path to retrieve the value
				 *		if path is '.' returns model itself
				 *
				 *	```javascript
				 *	mask.render('span > ~[.]', 'Some string') // -> <span>Some string</span>
				 *	```
				 **/
				getProperty: function (model, path){
					log_warn('mask.getProperty is deprecated. Use `mask.obj.get`');
					return obj_getProperty(model, path);
				},
				
				ensureTmplFn: Parser.ensureTemplateFunction
			},
			Dom: Dom,
			plugin: function(source){
				//if DEBUG
				eval(source);
				//endif
			},
			
			obj: {
				get: obj_getProperty,
				set: obj_setProperty,
				extend: obj_extend,
			},
			is: {
				Function: is_Function,
				String: is_String,
				ArrayLike: is_ArrayLike,
			},
			
			on: listeners_on,
			off: listeners_off,
	
			/*
			 *	Stub for the reload.js, which will be used by includejs.autoreload
			 */
			delegateReload: function(){},
	
			/**
			 *	mask.setInterpolationQuotes(start,end) -> void
			 * -start (String): Must contain 2 Characters
			 * -end (String): Must contain 1 Character
			 *
			 * Starting from 0.6.9 mask uses ~[] for string interpolation.
			 * Old '#{}' was changed to '~[]', while template is already overloaded with #, { and } usage.
			 *
			 **/
			setInterpolationQuotes: Parser.setInterpolationQuotes,
			
			setCompoIndex: function(index){
				builder_componentID = index;
			},
			
			cfg: function(){
				var args = arguments;
				if (args.length === 0) {
					return __cfg;
				}
				
				var key, value;
				
				if (args.length === 2) {
					key = args[0];
					
					__cfg[key] = args[1];
					return;
				}
				
				var obj = args[0];
				if (typeof obj === 'object') {
					
					for (key in obj) {
						__cfg[key] = obj[key]
					}
				}
			}
		};
	
	
	/**	deprecated
	 *	mask.renderDom(template[, model, container, ctx]) -> container
	 *
	 * Use [[mask.render]] instead
	 * (to keep backwards compatiable)
	 **/
	Mask.renderDom = Mask.render;
	
	// end:source /src/mask.js
	
	// source /src/formatter/stringify.lib.js
	(function(mask){
	
	
		// source stringify.js
		
		var mask_stringify;
		
		(function() {
			
				
			//settings (Number | Object) - Indention Number (0 - for minification)
			mask_stringify = function(input, settings) {
				if (input == null) 
					return '';
				
				if (typeof input === 'string') 
					input = mask.parse(input);
				
				if (settings == null) {
					_indent = 0;
					_minimize = true;
				} else  if (typeof settings === 'number'){
					_indent = settings;
					_minimize = _indent === 0;
				} else{
					_indent = settings && settings.indent || 4;
					_minimize = _indent === 0 || settings && settings.minimizeAttributes;
				}
		
				return run(input);
			};
		
		
			var _minimize,
				_indent,
				Dom = mask.Dom;
		
			function doindent(count) {
				var output = '';
				while (count--) {
					output += ' ';
				}
				return output;
			}
		
		
		
			function run(node, indent, output) {
				var outer, i;
				
				if (indent == null) 
					indent = 0;
					
				if (output == null) {
					outer = true;
					output = [];
				}
		
				var index = output.length;
				if (node.type === Dom.FRAGMENT)
					node = node.nodes;
				
				if (node instanceof Array) {
					for (i = 0; i < node.length; i++) {
						processNode(node[i], indent, output);
					}
				} else {
					processNode(node, indent, output);
				}
		
		
				var spaces = doindent(indent);
				for (i = index; i < output.length; i++) {
					output[i] = spaces + output[i];
				}
		
				if (outer) 
					return output.join(_indent === 0 ? '' : '\n');
			}
		
			function processNode(node, currentIndent, output) {
				if (typeof node.stringify === 'function') {
					output.push(node.stringify(_minimize));
					return;
				}
				if (typeof node.content === 'string') {
					output.push(wrapString(node.content));
					return;
				}
		
				if (typeof node.content === 'function'){
					output.push(wrapString(node.content()));
					return;
				}
		
				if (isEmpty(node)) {
					output.push(processNodeHead(node) + ';');
					return;
				}
		
				if (isSingle(node)) {
					var next = _minimize ? '>' : ' > ';
					output.push(processNodeHead(node) + next);
					run(getSingle(node), _indent, output);
					return;
				}
		
				output.push(processNodeHead(node) + '{');
				run(node.nodes, _indent, output);
				output.push('}');
				return;
			}
		
			function processNodeHead(node) {
				var tagName = node.tagName,
					_id, _class;
		
				if (node.attr != null) {
					_id = node.attr.id || '',
					_class = node.attr['class'] || '';
				}
		
		
				if (typeof _id === 'function')
					_id = _id();
				
				if (typeof _class === 'function')
					_class = _class();
				
		
				if (_id) {
					_id = _id.indexOf(' ') !== -1
						? ''
						: '#' + _id
						;
				}
		
				if (_class) 
					_class = '.' + _class.split(' ').join('.');
				
		
				var attr = '';
				for (var key in node.attr) {
					if (key === 'id' || key === 'class') {
						// the properties was not deleted as this template can be used later
						continue;
					}
					var value = node.attr[key];
		
					if (typeof value === 'function')
						value = value();
					
		
					if (key !== value && (_minimize === false || /[^\w_$\-\.]/.test(value)))
						value = wrapString(value);
					
		
					attr += ' ' + key;
					
					if (key !== value)
						attr += '=' + value;
				}
		
				if (tagName === 'div' && (_id || _class)) 
					tagName = '';
				
				var expr = '';
				if (node.expression) 
					expr = '(' + node.expression + ')';
					
				return tagName
					+ _id
					+ _class
					+ attr
					+ expr;
			}
		
		
			function isEmpty(node) {
				return node.nodes == null || (node.nodes instanceof Array && node.nodes.length === 0);
			}
		
			function isSingle(node) {
				return node.nodes && (node.nodes instanceof Array === false || node.nodes.length === 1);
			}
		
			function getSingle(node) {
				if (node.nodes instanceof Array) 
					return node.nodes[0];
				
				return node.nodes;
			}
		
			function wrapString(str) {
				
				if (str.indexOf("'") === -1) 
					return "'" + str.trim() + "'";
				
				if (str.indexOf('"') === -1) 
					return '"' + str.trim() + '"';
				
		
				return '"' + str.replace(/"/g, '\\"').trim() + '"';
			}
		
		
		}());
		
		// end:source stringify.js
	
		mask.stringify = mask_stringify;
	
	}(Mask));
	
	// end:source /src/formatter/stringify.lib.js

	/* Handlers */
	// source /src/handlers/html.js
	(function() {
		Mask.registerHandler(':html', {
			$meta: {
				mode: 'server:all'
			},
			render: function(model, ctx, container) {
				this.html = jmask(this.nodes).text(model, ctx, this);
		
				if (container.insertAdjacentHTML) {
					container.insertAdjacentHTML('beforeend', this.html);
					return;
				}
				if (container.ownerDocument) {
					var div = document.createElement('div'),
						frag = document.createDocumentFragment(),
						child;
					div.innerHTML = this.html;
					child = div.firstChild;
					while (child != null) {
						frag.appendChild(child);
						child = child.nextSibling;
					}
				}
			},
			toHtml: function(){
				return this.html || '';
			},
			html: null
		});
	}());
	
	// end:source /src/handlers/html.js
	// source /src/handlers/define.js
	(function(mask){
		
		custom_Tags['define']  = Define;
		
		function Define(){}
		Define.prototype = {
			$meta: {
				serializeNodes: true
			},
			render: define,
			onRenderStartClient: define
		};
		
		function define(){
			var name;
			for(name in this.attr) break;
			
			var nodes = this.nodes;
			mask.registerHandler(name, Compo({
				renderStart: function(){
					this.nodes = mask.merge(nodes, this.nodes || [], this);
				}
			}));
		}
	}(Mask));
	// end:source /src/handlers/define.js
	// source /src/handlers/template.js
	(function(){
		var templates_ = {},
			helper_ = {
				get: function(id){
					return templates_[id]
				},
				resolve: function(node, id){
					var nodes = templates_[id];
					if (nodes != null) 
						return nodes;
					
					var selector = ':template[id=' + id +']',
						parent = node.parent,
						tmpl = null
						;
					while (parent != null) {
						tmpl = jmask(parent.nodes)
							.filter(selector)
							.get(0);
						
						if (tmpl != null) 
							return tmpl.nodes;
							
						parent = parent.parent;
					}
					log_warn('Template was not found', id);
					return null;
				},
				register: function(id, nodes){
					if (id == null) {
						log_warn('`:template` must be define via id attr.');
						return;
					}
					templates_[id] = nodes;
				}
			};
	
		Mask.templates = helper_;
		Mask.registerHandler(':template', {
			render: function() {
				helper_.register(this.attr.id, this.nodes);
			}
		});
	
		Mask.registerHandler(':import', {
			renderStart: function() {
				var id = this.attr.id;
				if (id == null) {
					log_error('`:import` shoud reference the template via id attr')
					return;
				}
				this.nodes = helper_.resolve(this, id);
			}
		});
	}());
	// end:source /src/handlers/template.js
	// source /src/handlers/debug.js
	(function(){
		custom_Statements['log'] = {
			render: function(node, model, ctx, container, controller){
				var arr = ExpressionUtil.evalStatements(node.expression, model, ctx, controller);
				arr.unshift('Mask::Log');
				console.log.apply(console, arr);
			}
		};
		customTag_register('debugger', {
			render: function(model, ctx, container, compo){
				debugger;
			}
		});
		customTag_register(':utest', {
			render: function () {}
		});
	}());
	// end:source /src/handlers/debug.js

	/* Libraries */
	
	// source /ref-mask-compo/lib/compo.embed.js
	
	var Compo = exports.Compo = (function(mask){
		// source /src/scope-vars.js
		var Dom = mask.Dom,
		
			_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn,
			_mask_ensureTmplFn,
			_resolve_External,
			domLib,
			Class	
			;
			
		(function(){
			_mask_ensureTmplFn = function(value) {
				return typeof value !== 'string'
					? value
					: _mask_ensureTmplFnOrig(value)
					;
			};
			_resolve_External = function(key){
				return _global[key] || _exports[key] || _atma[key]
			};
			
			var _global = global,
				_atma = global.atma || {},
				_exports = exports || {};
			
			function resolve() {
				var i = arguments.length, val;
				while( --i > -1 ) {
					val = _resolve_External(arguments[i]);
					if (val != null) 
						return val;
				}
				return null;
			}
			domLib = resolve('jQuery', 'Zepto', '$');
			Class = resolve('Class');
		}());
		
		
		// if DEBUG
		if (global.document != null && domLib == null) {
			
			log_warn('DomLite is used. You can set jQuery-Zepto-Kimbo via `Compo.config.setDOMLibrary($)`');
		}
		// endif
		// end:source /src/scope-vars.js
	
		// source /src/util/exports.js
		// source ./selector.js
		var selector_parse,
			selector_match
			;
		
		(function(){
			
			selector_parse = function(selector, type, direction) {
				if (selector == null)
					log_error('<compo>selector is undefined', type);
				
				if (typeof selector === 'object')
					return selector;
				
			
				var key, prop, nextKey;
			
				if (key == null) {
					switch (selector[0]) {
					case '#':
						key = 'id';
						selector = selector.substring(1);
						prop = 'attr';
						break;
					case '.':
						key = 'class';
						selector = sel_hasClassDelegate(selector.substring(1));
						prop = 'attr';
						break;
					default:
						key = type === Dom.SET ? 'tagName' : 'compoName';
						break;
					}
				}
			
				if (direction === 'up') {
					nextKey = 'parent';
				} else {
					nextKey = type === Dom.SET ? 'nodes' : 'components';
				}
			
				return {
					key: key,
					prop: prop,
					selector: selector,
					nextKey: nextKey
				};
			};
			
			selector_match = function(node, selector, type) {
				
				if (is_String(selector)) {
					
					if (type == null) 
						type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
					
					selector = selector_parse(selector, type);
				}
			
				var obj = selector.prop ? node[selector.prop] : node;
				if (obj == null) 
					return false;
				
				if (is_Function(selector.selector)) 
					return selector.selector(obj[selector.key]);
				
				// regexp
				if (selector.selector.test != null) 
					return selector.selector.test(obj[selector.key]);
				
				// string | int
				/* jshint eqeqeq: false */
				return obj[selector.key] == selector.selector;
				/* jshint eqeqeq: true */
			}
			
			// PRIVATE
			
			function sel_hasClassDelegate(matchClass) {
				return function(className){
					return sel_hasClass(className, matchClass);
				};
			}
			
			// [perf] http://jsperf.com/match-classname-indexof-vs-regexp/2
			function sel_hasClass(className, matchClass, index) {
				if (typeof className !== 'string')
					return false;
				
				if (index == null) 
					index = 0;
					
				index = className.indexOf(matchClass, index);
			
				if (index === -1)
					return false;
			
				if (index > 0 && className.charCodeAt(index - 1) > 32)
					return sel_hasClass(className, matchClass, index + 1);
			
				var class_Length = className.length,
					match_Length = matchClass.length;
					
				if (index < class_Length - match_Length && className.charCodeAt(index + match_Length) > 32)
					return sel_hasClass(className, matchClass, index + 1);
			
				return true;
			}
			
		}());
		
		// end:source ./selector.js
		// source ./traverse.js
		var find_findSingle,
			find_findAll;
		(function(){
			
			find_findSingle = function(node, matcher) {
				
				if (is_Array(node)) {
					var imax = node.length,
						i = 0, x;
					
					for(; i < imax; i++) {
						x = find_findSingle(node[i], matcher);
						if (x != null) 
							return x;
					}
					return null;
				}
			
				if (selector_match(node, matcher))
					return node;
				
				node = node[matcher.nextKey];
				return node == null
					? null
					: find_findSingle(node, matcher)
					;
			};
		
			find_findAll = function(node, matcher, out) {
				if (out == null) 
					out = [];
				
				if (is_Array(node)) {
					var imax = node.length,
						i = 0, x;
					
					for(; i < imax; i++) {
						find_findAll(node[i], matcher, out);
					}
					return out;
				}
				
				if (selector_match(node, matcher))
					out.push(node);
				
				node = node[matcher.nextKey];
				return node == null
					? out
					: find_findAll(node, matcher, out)
					;
			};
			
		}());
		
		// end:source ./traverse.js
		// source ./dom.js
		var dom_addEventListener,
			
			node_tryDispose,
			node_tryDisposeChildren
			;
			
		(function(){
		
			dom_addEventListener = function(element, event, listener) {
			
				if (EventDecorator != null) 
					event = EventDecorator(event);
				
				// allows custom events - in x-signal, for example
				if (domLib != null) 
					return domLib(element).on(event, listener);
					
				
				if (element.addEventListener != null) 
					return element.addEventListener(event, listener, false);
				
				if (element.attachEvent) 
					element.attachEvent('on' + event, listener);
				
			};
		
			node_tryDispose = function(node){
				if (node.hasAttribute('x-compo-id')) {
					
					var id = node.getAttribute('x-compo-id'),
						compo = Anchor.getByID(id)
						;
					
					if (compo) {
						
						if (compo.$ == null || compo.$.length === 1) {
							compo_dispose(compo);
							compo_detachChild(compo);
							return;
						}
						
						var i = _Array_indexOf.call(compo.$, node);
						if (i !== -1) 
							_Array_splice.call(compo.$, i, 1);
					}
				}
				
				node_tryDisposeChildren(node);
			};
			
			node_tryDisposeChildren = function(node){
				
				var child = node.firstChild;
				while(child != null) {
					
					if (child.nodeType === 1) 
						node_tryDispose(child);
					
					
					child = child.nextSibling;
				}
			};
			
		}());
		
		// end:source ./dom.js
		// source ./domLib.js
		/**
		 *	Combine .filter + .find
		 */
		
		var domLib_find,
			domLib_on
			;
		
		(function(){
				
			domLib_find = function($set, selector) {
				return $set.filter(selector).add($set.find(selector));
			};
			
			domLib_on = function($set, type, selector, fn) {
			
				if (selector == null) 
					return $set.on(type, fn);
				
				$set
					.on(type, selector, fn)
					.filter(selector)
					.on(type, fn);
					
				return $set;
			};
			
		}());
		
		
		// end:source ./domLib.js
		// source ./compo.js
		var compo_dispose,
			compo_detachChild,
			compo_ensureTemplate,
			compo_ensureAttributes,
			compo_attachDisposer,
			compo_removeElements,
			compo_prepairAsync,
			compo_errored,
			
			compo_meta_prepairAttributeHandler,
			compo_meta_executeAttributeHandler
			;
		
		(function(){
			
			compo_dispose = function(compo) {
				if (compo.dispose != null) 
					compo.dispose();
				
				Anchor.removeCompo(compo);
			
				var compos = compo.components,
					i = compos == null ? 0 : compos.length;
				while ( --i > -1 ) {
					compo_dispose(compos[i]);
				}
			};
			
			compo_detachChild = function(childCompo){
				var parent = childCompo.parent;
				if (parent == null) 
					return;
				
				var arr = childCompo.$,
					elements = parent.$ || parent.elements,
					i;
					
				if (elements && arr) {
					var jmax = arr.length,
						el, j;
					
					i = elements.length;
					while( --i > -1){
						el = elements[i];
						j = jmax;
						
						while(--j > -1){
							if (el === arr[j]) {
								elements.splice(i, 1);
								break;
							}
						}
					}
				}
				
				var compos = parent.components;
				if (compos != null) {
					
					i = compos.length;
					while(--i > -1){
						if (compos[i] === childCompo) {
							compos.splice(i, 1);
							break;
						}
					}
			
					if (i === -1)
						log_warn('<compo:remove> - i`m not in parents collection', childCompo);
				}
			};
			compo_ensureTemplate = function(compo) {
				if (compo.nodes == null) {
					compo.nodes = getTemplateProp_(compo);
					return;
				}
				var behaviour = compo.meta.template;
				if (behaviour == null || behaviour === 'replace') {
					return;
				}
				var template = getTemplateProp_(compo);
				if (behaviour === 'merge') {
					compo.nodes = mask_merge(template, compo.nodes, compo);
					return;
				}
				if (behaviour === 'join') {
					compo.nodes = [template, compo.nodes];
					return;
				}
				log_error('Invalid meta.nodes behaviour', behaviour);
			};
			compo_attachDisposer = function(compo, disposer) {
			
				if (compo.dispose == null) {
					compo.dispose = disposer;
					return;
				}
				
				var prev = compo.dispose;
				compo.dispose = function(){
					disposer.call(this);
					prev.call(this);
				};
			};
			
			compo_removeElements = function(compo) {
				if (compo.$) {
					compo.$.remove();
					return;
				}
				
				var els = compo.elements;
				if (els) {
					var i = -1,
						imax = els.length;
					while ( ++i < imax ) {
						if (els[i].parentNode) 
							els[i].parentNode.removeChild(els[i]);
					}
					return;
				}
				
				var compos = compo.components;
				if (compos) {
					var i = -1,
						imax = compos.length;
					while ( ++i < imax ){
						compo_removeElements(compos[i]);
					}
				}
			};
		
			compo_prepairAsync = function(dfr, compo, ctx){
				var resume = Compo.pause(compo, ctx)
				dfr.then(resume, function(error){
					compo_errored(compo, error);
					resume();
				});
			};
			
			compo_errored = function(compo, error){
				compo.nodes = mask.parse('.-mask-compo-errored > "~[.]"');
				compo.model = error.message || String(error);
				compo.renderEnd = fn_doNothing;
			};
			
			// == Meta Attribute Handler
			(function(){
				
				compo_meta_prepairAttributeHandler = function(Proto){
					if (Proto.meta == null) {
						Proto.meta = {
							attributes: null,
							cache: null,
							mode: null
						};
					}
					
					var attr = Proto.meta.attributes,
						fn = null;
					if (attr) {
						var hash = {};
						for(var key in attr) {
							_handleProperty_Delegate(Proto, key, attr[key], hash);
						}
						fn = _handleAll_Delegate(hash);
					}
					Proto.meta.handleAttributes = fn;
				};
				compo_meta_executeAttributeHandler = function(compo, model){
					var fn = compo.meta && compo.meta.handleAttributes;
					return fn == null ? true : fn(compo, model);
				};
				
				function _handleAll_Delegate(hash){
					return function(compo, model){
						var attr = compo.attr,
							key, fn, val, error;
						for(key in hash){
							fn    = hash[key];
							val   = attr[key];
							error = fn(compo, val, model);
							
							if (error == null)
								continue;
							
							_errored(compo, error, key, val)
							return false;
						}
						return true;
					};
				}
				function _handleProperty_Delegate(Proto, metaKey, metaVal, hash) {
					var optional = metaKey.charCodeAt(0) === 63, // ?
						attrName = optional
							? metaKey.substring(1)
							: metaKey;
					
					var property = attrName.replace(/-(\w)/g, _toCamelCase_Replacer),
						fn = metaVal;
					
					if (typeof metaVal === 'string') 
						fn = _ensureFns[metaVal];
						
					else if (metaVal instanceof RegExp) 
						fn = _ensureFns_Delegate.regexp(metaVal);
					
					else if (typeof metaVal === 'function') 
						fn = metaVal;
					
					else if (metaVal == null) 
						fn = _ensureFns_Delegate.any();
					
					if (fn == null) {
						log_error('Function expected for the attr. handler', metaKey);
						return;
					}
					
					Proto[property] = null;
					Proto = null;
					hash [attrName] = function(compo, attrVal, model){
						if (attrVal == null) 
							return optional ? null : Error('Expected');
						
						var val = fn.call(compo, attrVal, compo, model, attrName);
						if (val instanceof Error) 
							return val;
						
						compo[property] = val;
						return null;
					};
				}
				
				function _toCamelCase_Replacer(full, char_){
					return char_.toUpperCase();
				}
				function _errored(compo, error, key, val) {
					error.message = compo.compoName + ' - attribute `' + key + '`: ' + error.message;
					compo_errored(compo, error);
					log_error(error.message, '. Current: ', val);
				}
				var _ensureFns = {
					'string': function(x) {
						return typeof x === 'string' ? x : Error('String');
					},
					'number': function(x){
						var num = Number(x);
						return num === num ? num : Error('Number');
					},
					'boolean': function(x, compo, model, attrName){
						if (typeof x === 'boolean') 
							return x;
						if (x === attrName)  return true;
						if (x === 'true'  || x === '1') return true;
						if (x === 'false' || x === '0') return false;
						return Error('Boolean');
					}
				};
				var _ensureFns_Delegate = {
					regexp: function(rgx){
						return function(x){
							return rgx.test(x) ? x : Error('RegExp');
						};
					},
					any: function(){
						return function(x){ return x; };
					}
				};
			}());
			function getTemplateProp_(compo){
				var template = compo.template;
				if (template == null) {
					template = compo.attr.template;
					if (template == null) 
						return null;
					
					delete compo.attr.template;
				}
				if (typeof template === 'object') 
					return template;
				
				if (is_String(template)) {
					if (template.charCodeAt(0) === 35 && /^#[\w\d_-]+$/.test(template)) {
						// #
						var node = document.getElementById(template.substring(1));
						if (node == null) {
							log_warn('Template not found by id:', template);
							return null;
						}
						template = node.innerHTML;
					}
					return mask.parse(template);
				}
				log_warn('Invalid template', typeof template);
				return null;
			}
		}());
		
		// end:source ./compo.js
		// source ./compo_create.js
		var compo_create,
			compo_createConstructor;
		(function(){
			compo_create = function(arguments_){
				
				var argLength = arguments_.length,
					Proto = arguments_[argLength - 1],
					Ctor,
					key;
				
				if (argLength > 1) 
					compo_inherit(Proto, _Array_slice.call(arguments_, 0, argLength - 1));
				
				if (Proto == null)
					Proto = {};
				
				var include = _resolve_External('include');
				if (include != null) 
					Proto.__resource = include.url;
				
				var attr = Proto.attr;
				for (key in Proto.attr) {
					Proto.attr[key] = _mask_ensureTmplFn(Proto.attr[key]);
				}
				
				var slots = Proto.slots;
				for (key in slots) {
					if (typeof slots[key] === 'string'){
						//if DEBUG
						if (is_Function(Proto[slots[key]]) === false)
							log_error('Not a Function @Slot.',slots[key]);
						// endif
						slots[key] = Proto[slots[key]];
					}
				}
				
				compo_meta_prepairAttributeHandler(Proto);
				
				Ctor = Proto.hasOwnProperty('constructor')
					? Proto.constructor
					: function CompoBase() {}
					;
				
				Ctor = compo_createConstructor(Ctor, Proto);
		
				for(key in CompoProto){
					if (Proto[key] == null)
						Proto[key] = CompoProto[key];
				}
		
				Ctor.prototype = Proto;
				Proto = null;
				return Ctor;
			};
			
			compo_createConstructor = function(Ctor, proto) {
				var compos = proto.compos,
					pipes = proto.pipes,
					scope = proto.scope,
					attr = proto.attr;
					
				if (compos   == null
					&& pipes == null
					&& attr  == null
					&& scope == null) {
					return Ctor;
				}
			
				/* extend compos / attr to keep
				 * original prototyped values untouched
				 */
				return function CompoBase(node, model, ctx, container, ctr){
					
					if (Ctor != null) {
						var overriden = Ctor.call(this, node, model, ctx, container, ctr);
						if (overriden != null) 
							return overriden;
					}
					
					if (compos != null) {
						// use this.compos instead of compos from upper scope
						// : in case compos they were extended after
						this.compos = obj_create(this.compos);
					}
					
					if (pipes != null) 
						Pipes.addController(this);
					
					if (attr != null) 
						this.attr = obj_create(this.attr);
					
					if (scope != null) 
						this.scope = obj_create(this.scope);
				};
			};
		}());
		// end:source ./compo_create.js
		// source ./compo_inherit.js
		var compo_inherit;
		(function(mask_merge){
			
			compo_inherit = function(Proto, Extends){
				
				var imax = Extends.length,
					i = imax,
					ctors = [],
					x;
				while( --i > -1){
					x = Extends[i];
					if (typeof x === 'string') 
						x = Mask.getHandler(x);
					if (x == null) {
						log_error('Base component not defined', Extends[i]);
						continue;
					}
					if (typeof x === 'function') {
						ctors.push(x);
						x = x.prototype;
					}
					
					inherit_(Proto, x, 'node');
				}
				
				i = -1;
				imax = ctors.length;
				if (imax > 0) {
					if (Proto.hasOwnProperty('constructor')) 
						ctors.unshift(Proto.constructor);
					
					Proto.constructor = joinFns_(ctors);
					
				}
			};
			
			function inherit_(target, source, name){
				if (target == null || source == null) 
					return;
				
				if ('node' === name) {
					var targetNodes = target.template || target.nodes,
						sourceNodes = source.template || source.nodes;
					if (targetNodes == null || sourceNodes == null) {
						target.template = targetNodes || sourceNodes;
					} else {
						target.nodes = mask.merge(sourceNodes, targetNodes, target);
					}
				}
				
				var mix, type, fnAutoCall, hasFnOverrides = false;
				for(var key in source){
					mix = source[key];
					if (mix == null || key === 'constructor')
						continue;
					
					if ('node' === name && (key === 'template' || key === 'nodes')) 
						continue;
					
					type = typeof mix;
					
					if (target[key] == null) {
						target[key] = 'object' === type
							? clone_(mix)
							: mix;
						continue;
					}
					if ('node' === name) {
						// http://jsperf.com/indexof-vs-bunch-of-if
						var isSealed = key === 'renderStart' ||
								key === 'renderEnd' ||
								key === 'emitIn' ||
								key === 'emitOut' ||
								key === 'components' ||
								key === 'nodes' ||
								key === 'template' ||
								key === 'find' ||
								key === 'closest' ||
								key === 'on' ||
								key === 'remove' ||
								key === 'slotState' ||
								key === 'signalState' ||
								key === 'append' ||
								key === 'appendTo'
								;
						if (isSealed === true) 
							continue;
					}
					if ('pipes' === name) {
						inherit_(target[key], mix, 'pipe');
						continue;
					}
					if ('function' === type) {
						fnAutoCall = false;
						if ('slots' === name || 'events' === name || 'pipe' === name)
							fnAutoCall = true;
						else if ('node' === name && ('onRenderStart' === key || 'onRenderEnd' === key)) 
							fnAutoCall = true;
						
						target[key] = createWrapper_(target[key], mix, fnAutoCall);
						hasFnOverrides = true;
						continue;
					}
					if ('object' !== type) {
						continue;
					}
					
					switch(key){
						case 'slots':
						case 'pipes':
						case 'events':
						case 'attr':
							inherit_(target[key], mix, key);
							continue;
					}
					defaults_(target[key], mix);
				}
				
				if (hasFnOverrides === true) {
					if (target.super != null) 
						log_error('`super` property is reserved. Dismissed. Current prototype', target);
					target.super = null;
				}
			}
			
			/*! Circular references are not handled */
			function clone_(a) {
				if (a == null) 
					return null;
				
				if (typeof a !== 'object') 
					return a;
				
				if (is_Array(a)) {
					var imax = a.length,
						i = -1,
						arr = new Array(imax)
						;
					while( ++i < imax ){
						arr[i] = clone_(a[i]);
					}
					return arr;
				}
				
				var object = obj_create(a),
					key, val;
				for(key in object){
					val = object[key];
					if (val == null || typeof val !== 'object') 
						continue;
					object[key] = clone_(val);
				}
				return object;
			}
			function defaults_(target, source){
				var targetV, sourceV, key;
				for(var key in source){
					targetV = target[key];
					sourceV = source[key];
					if (targetV == null) {
						target[key] = sourceV;
						continue;
					}
					if (is_rawObject(targetV) && is_rawObject(sourceV)){
						defaults_(targetV, sourceV);
						continue;
					}
				}
			}
			function createWrapper_(selfFn, baseFn, autoCallFunctions){
				if (selfFn.name === 'compoInheritanceWrapper') {
					selfFn._fn_chain.push(baseFn);
					return selfFn;
				}
				
				var compileFns = autoCallFunctions === true
					? compileFns_autocall_
					: compileFns_
					;
				function compoInheritanceWrapper(){
					var fn = x._fn || (x._fn = compileFns(x._fn_chain));
					return fn.apply(this, arguments);
				}
				
				var x = compoInheritanceWrapper;
				x._fn_chain = [ selfFn, baseFn ];
				x._fn = null;
				
				return x;
			}
			function compileFns_(fns){
				var i = fns.length,
					fn = fns[ --i ];
				while( --i > -1){
					fn = inheritFn_(fns[i], fn);
				}
				return fn;
			}
			function compileFns_autocall_(fns) {
				var imax = fns.length;
				return function(){
					var result, fn, x,
						i = imax;
					while( --i > -1 ){
						fn = fns[i];
						if (fn == null) 
							continue;
						
						x = fn_apply(fn, this, arguments);
						if (x !== void 0) {
							result = x;
						}
					}
					return result;
				}
			}
			function inheritFn_(selfFn, baseFn){
				return function(){
					this.super = baseFn;
					var x = fn_apply(selfFn, this, arguments);
					
					this.super = null;
					return x;
				};
			}
			function joinFns_(fns) {
				var imax = fns.length;
				return function(){
					var i = imax, result;
					while( --i > -1 ){
						var x = fns[i].apply(this, arguments);
						if (x != null) {
							// use last return
							result = x;
						}
					}
					return result;
				};
			}
		}(mask.merge));
		// end:source ./compo_inherit.js
		// source ./dfr.js
		var dfr_isBusy;
		(function(){
			dfr_isBusy = function(dfr){
				if (dfr == null || typeof dfr.then !== 'function') 
					return false;
				
				// Class.Deferred
				if (is_Function(dfr.isBusy)) 
					return dfr.isBusy();
				
				// jQuery Deferred
				if (is_Function(dfr.state)) 
					return dfr.state() === 'pending';
				
				log_warn('Class or jQuery deferred interface expected');
				return false;
			};
		}());
		// end:source ./dfr.js
		
		// end:source /src/util/exports.js
	
		// source /src/compo/children.js
		var Children_ = {
		
			/**
			 *	Component children. Example:
			 *
			 *	Class({
			 *		Base: Compo,
			 *		Construct: function(){
			 *			this.compos = {
			 *				panel: '$: .container',  // querying with DOMLib
			 *				timePicker: 'compo: timePicker', // querying with Compo selector
			 *				button: '#button' // querying with querySelector***
			 *			}
			 *		}
			 *	});
			 *
			 */
			select: function(component, compos) {
				for (var name in compos) {
					var data = compos[name],
						events = null,
						selector = null;
		
					if (data instanceof Array) {
						selector = data[0];
						events = data.splice(1);
					}
					if (typeof data === 'string') {
						selector = data;
					}
					if (data == null || selector == null) {
						log_error('Unknown component child', name, compos[name]);
						log_warn('Is this object shared within multiple compo classes? Define it in constructor!');
						return;
					}
		
					var index = selector.indexOf(':'),
						engine = selector.substring(0, index);
		
					engine = Compo.config.selectors[engine];
		
					if (engine == null) {
						component.compos[name] = component.$[0].querySelector(selector);
					} else {
						selector = selector.substring(++index).trim();
						component.compos[name] = engine(component, selector);
					}
		
					var element = component.compos[name];
		
					if (events != null) {
						if (element.$ != null) {
							element = element.$;
						}
						
						Events_.on(component, events, element);
					}
				}
			}
		};
		
		// end:source /src/compo/children.js
		// source /src/compo/events.js
		var Events_ = {
			on: function(component, events, $element) {
				if ($element == null) {
					$element = component.$;
				}
		
				var isarray = events instanceof Array,
					length = isarray ? events.length : 1;
		
				for (var i = 0, x; isarray ? i < length : i < 1; i++) {
					x = isarray ? events[i] : events;
		
					if (x instanceof Array) {
						// generic jQuery .on Arguments
		
						if (EventDecorator != null) {
							x[0] = EventDecorator(x[0]);
						}
		
						$element.on.apply($element, x);
						continue;
					}
		
		
					for (var key in x) {
						var fn = typeof x[key] === 'string' ? component[x[key]] : x[key],
							semicolon = key.indexOf(':'),
							type,
							selector;
		
						if (semicolon !== -1) {
							type = key.substring(0, semicolon);
							selector = key.substring(semicolon + 1).trim();
						} else {
							type = key;
						}
		
						if (EventDecorator != null) {
							type = EventDecorator(type);
						}
		
						domLib_on($element, type, selector, fn_proxy(fn, component));
					}
				}
			}
		},
			EventDecorator = null;
		
		// end:source /src/compo/events.js
		// source /src/compo/events.deco.js
		var EventDecos = (function() {
		
			var hasTouch = (function() {
				if (document == null) {
					return false;
				}
				if ('createTouch' in document) {
					return true;
				}
				try {
					return !!document.createEvent('TouchEvent').initTouchEvent;
				} catch (error) {
					return false;
				}
			}());
		
			return {
		
				'touch': function(type) {
					if (hasTouch === false) {
						return type;
					}
		
					if ('click' === type) {
						return 'touchend';
					}
		
					if ('mousedown' === type) {
						return 'touchstart';
					}
		
					if ('mouseup' === type) {
						return 'touchend';
					}
		
					if ('mousemove' === type) {
						return 'touchmove';
					}
		
					return type;
				}
			};
		
		}());
		
		// end:source /src/compo/events.deco.js
		// source /src/compo/pipes.js
		var Pipes = (function() {
			
			var _collection = {};
		
			mask.registerAttrHandler('x-pipe-signal', 'client', function(node, attrValue, model, cntx, element, controller) {
		
				var arr = attrValue.split(';'),
					imax = arr.length,
					i = -1,
					x;
				while ( ++i < imax ) {
					x = arr[i].trim();
					if (x === '') 
						continue;
					
					var i_colon = x.indexOf(':'),
						event = x.substring(0, i_colon),
						handler = x.substring(i_colon + 1).trim(),
						dot = handler.indexOf('.'),
						
						pipe, signal;
		
					if (dot === -1) {
						log_error('define pipeName "click: pipeName.pipeSignal"');
						return;
					}
		
					pipe = handler.substring(0, dot);
					signal = handler.substring(++dot);
		
					var Handler = _handler(pipe, signal);
		
		
					// if DEBUG
					!event && log_error('Signal: event type is not set', attrValue);
					// endif
		
		
					dom_addEventListener(element, event, Handler);
		
				}
			});
		
			function _handler(pipe, signal) {
				return function(event){
					new Pipe(pipe).emit(signal, event);
				};
			}
		
		
			function pipe_attach(pipeName, controller) {
				if (controller.pipes[pipeName] == null) {
					log_error('Controller has no pipes to be added to collection', pipeName, controller);
					return;
				}
		
				if (_collection[pipeName] == null) {
					_collection[pipeName] = [];
				}
				_collection[pipeName].push(controller);
			}
		
			function pipe_detach(pipeName, controller) {
				var pipe = _collection[pipeName],
					i = pipe.length;
		
				while (--i > -1) {
					if (pipe[i] === controller) 
						pipe.splice(i, 1);
				}
		
			}
		
			function controller_remove() {
				var	controller = this,
					pipes = controller.pipes;
				for (var key in pipes) {
					pipe_detach(key, controller);
				}
			}
		
			function controller_add(controller) {
				var pipes = controller.pipes;
		
				// if DEBUG
				if (pipes == null) {
					log_error('Controller has no pipes', controller);
					return;
				}
				// endif
		
				for (var key in pipes) {
					pipe_attach(key, controller);
				}
		
				Compo.attachDisposer(controller, controller_remove.bind(controller));
			}
		
			function Pipe(pipeName) {
				if (this instanceof Pipe === false) {
					return new Pipe(pipeName);
				}
				this.pipeName = pipeName;
		
				return this;
			}
			Pipe.prototype = {
				constructor: Pipe,
				emit: function(signal){
					var controllers = _collection[this.pipeName],
						pipeName = this.pipeName,
						args;
					
					if (controllers == null) {
						//if DEBUG
						log_warn('Pipe.emit: No signals were bound to:', pipeName);
						//endif
						return;
					}
					
					/**
					 * @TODO - for backward comp. support
					 * to pass array of arguments as an Array in second args
					 *
					 * - switch to use plain arguments
					 */
					
					if (arguments.length === 2 && is_Array(arguments[1])) 
						args = arguments[1];
						
					else if (arguments.length > 1) 
						args = _Array_slice.call(arguments, 1);
					
					
					var i = controllers.length,
						controller, slots, slot, called;
		
					while (--i !== -1) {
						controller = controllers[i];
						slots = controller.pipes[pipeName];
		
						if (slots == null) 
							continue;
						
						slot = slots[signal];
						if (is_Function(slot)) {
							slot.apply(controller, args);
							called = true;
						}
					}
		
					// if DEBUG
					if (!called)
						log_warn('Pipe `%s` has not slots for `%s`', pipeName, signal);
					// endif
				}
			};
		
			Pipe.addController = controller_add;
			Pipe.removeController = controller_remove;
		
			return {
				addController: controller_add,
				removeController: controller_remove,
		
				pipe: Pipe
			};
		
		}());
		
		// end:source /src/compo/pipes.js
	
		// source /src/compo/anchor.js
		
		/**
		 *	Get component that owns an element
		 **/
		
		var Anchor = (function(){
		
			var _cache = {};
		
			return {
				create: function(compo){
					if (compo.ID == null){
						log_warn('Component should have an ID');
						return;
					}
		
					_cache[compo.ID] = compo;
				},
				resolveCompo: function(element){
					if (element == null){
						return null;
					}
		
					var findID, currentID, compo;
					do {
		
						currentID = element.getAttribute('x-compo-id');
		
		
						if (currentID) {
		
							if (findID == null) {
								findID = currentID;
							}
		
							compo = _cache[currentID];
		
							if (compo != null) {
								compo = Compo.find(compo, {
									key: 'ID',
									selector: findID,
									nextKey: 'components'
								});
		
								if (compo != null) {
									return compo;
								}
							}
		
						}
		
						element = element.parentNode;
		
					}while(element && element.nodeType === 1);
		
		
					// if DEBUG
					findID && log_warn('No controller for ID', findID);
					// endif
					return null;
				},
				removeCompo: function(compo){
					if (compo.ID == null){
						return;
					}
					delete _cache[compo.ID];
				},
				getByID: function(id){
					return _cache[id];
				}
			};
		
		}());
		
		// end:source /src/compo/anchor.js
		// source /src/compo/Compo.js
		var Compo, CompoProto;
		(function() {
		
			Compo = function () {
				if (this instanceof Compo){
					// used in Class({Base: Compo})
					return void 0;
				}
				
				return compo_create(arguments);
			};
		
			// source ./Compo.static.js
			obj_extend(Compo, {
				create: function(){
					return compo_create(arguments);
				},
				
				createClass: function(){
					
					var Ctor = compo_create(arguments),
						classProto = Ctor.prototype;
					classProto.Construct = Ctor;
					return Class(classProto);
				},
			
				/* obsolete */
				render: function(compo, model, ctx, container) {
			
					compo_ensureTemplate(compo);
			
					var elements = [];
			
					mask.render(
						compo.tagName == null ? compo.nodes : compo,
						model,
						ctx,
						container,
						compo,
						elements
					);
			
					compo.$ = domLib(elements);
			
					if (compo.events != null) 
						Events_.on(compo, compo.events);
					
					if (compo.compos != null) 
						Children_.select(compo, compo.compos);
					
					return compo;
				},
			
				initialize: function(compo, model, ctx, container, parent) {
					
					var compoName;
			
					if (container == null){
						if (ctx && ctx.nodeType != null){
							container = ctx;
							ctx = null;
						}else if (model && model.nodeType != null){
							container = model;
							model = null;
						}
					}
			
					if (typeof compo === 'string'){
						compoName = compo;
						
						compo = mask.getHandler(compoName);
						if (!compo){
							log_error('Compo not found:', compo);
						}
					}
			
					var node = {
						controller: compo,
						type: Dom.COMPONENT,
						tagName: compoName
					};
			
					if (parent == null && container != null)
						parent = Anchor.resolveCompo(container);
					
					if (parent == null)
						parent = new Dom.Component();
					
			
					var dom = mask.render(node, model, ctx, null, parent),
						instance = parent.components[parent.components.length - 1];
			
					if (container != null){
						container.appendChild(dom);
			
						Compo.signal.emitIn(instance, 'domInsert');
					}
			
					return instance;
				},
			
				
				find: function(compo, selector){
					return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'down'));
				},
				closest: function(compo, selector){
					return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
				},
			
				dispose: compo_dispose,
				
				ensureTemplate: compo_ensureTemplate,
				
				attachDisposer: compo_attachDisposer,
			
				config: {
					selectors: {
						'$': function(compo, selector) {
							var r = domLib_find(compo.$, selector)
							// if DEBUG
							if (r.length === 0) 
								log_warn('<compo-selector> - element not found -', selector, compo);
							// endif
							return r;
						},
						'compo': function(compo, selector) {
							var r = Compo.find(compo, selector);
							// if DEBUG
							if (r == null) 
								log_warn('<compo-selector> - component not found -', selector, compo);
							// endif
							return r;
						}
					},
					/**
					 *	@default, global $ is used
					 *	IDOMLibrary = {
					 *	{fn}(elements) - create dom-elements wrapper,
					 *	on(event, selector, fn) - @see jQuery 'on'
					 *	}
					 */
					setDOMLibrary: function(lib) {
						if (domLib === lib) 
							return;
						
						domLib = lib;
						domLib_initialize();
					},
			
					getDOMLibrary: function(){
						return domLib;
					},
					
					eventDecorator: function(mix){
						if (typeof mix === 'function') {
							EventDecorator = mix;
							return;
						}
						if (typeof mix === 'string') {
							EventDecorator = EventDecos[mix];
							return;
						}
						if (typeof mix === 'boolean' && mix === false) {
							EventDecorator = null;
							return;
						}
					}
			
				},
			
				//pipes: Pipes,
				pipe: Pipes.pipe,
				
				resource: function(compo){
					var owner = compo;
					
					while (owner != null) {
						
						if (owner.resource) 
							return owner.resource;
						
						owner = owner.parent;
					}
					
					return include.instance();
				},
				
				plugin: function(source){
					eval(source);
				},
				
				Dom: {
					addEventListener: dom_addEventListener
				}
			});
			
			
			// end:source ./Compo.static.js
			// source ./async.js
			(function(){
				
				function _on(ctx, type, callback) {
					if (ctx[type] == null)
						ctx[type] = [];
					
					ctx[type].push(callback);
					
					return ctx;
				}
				
				function _call(ctx, type, _arguments) {
					var cbs = ctx[type];
					if (cbs == null) 
						return;
					
					for (var i = 0, x, imax = cbs.length; i < imax; i++){
						x = cbs[i];
						if (x == null)
							continue;
						
						cbs[i] = null;
						
						if (_arguments == null) {
							x();
							continue;
						}
						
						x.apply(this, _arguments);
					}
				}
				
				
				var DeferProto = {
					done: function(callback){
						return _on(this, '_cbs_done', callback);
					},
					fail: function(callback){
						return _on(this, '_cbs_fail', callback);
					},
					always: function(callback){
						return _on(this, '_cbs_always', callback);
					},
					resolve: function(){
						this.async = false;
						_call(this, '_cbs_done', arguments);
						_call(this, '_cbs_always', arguments);
					},
					reject: function(){
						this.async = false;
						_call(this, '_cbs_fail', arguments);
						_call(this, '_cbs_always');
					},
					_cbs_done: null,
					_cbs_fail: null,
					_cbs_always: null
				};
				
				var CompoProto = {
					async: true,
					await: function(resume){
						this.resume = resume;
					}
				};
				
				Compo.pause = function(compo, ctx){
					if (ctx.async == null) {
						ctx.defers = [];
						obj_extend(ctx, DeferProto);
					}
					
					ctx.async = true;
					ctx.defers.push(compo);
					
					obj_extend(compo, CompoProto);
					
					return function(){
						Compo.resume(compo, ctx);
					};
				};
				
				Compo.resume = function(compo, ctx){
					
					// fn can be null when calling resume synced after pause
					if (compo.resume) 
						compo.resume();
					
					compo.async = false;
					
					var busy = false,
						dfrs = ctx.defers,
						imax = dfrs.length,
						i = -1,
						x;
					while ( ++i < imax ){
						x = dfrs[i];
						
						if (x === compo) {
							dfrs[i] = null;
							continue;
						}
						busy = busy || x != null;
					}
					if (busy === false) 
						ctx.resolve();
				};
				
			}());
			// end:source ./async.js
		
			CompoProto = {
				type: Dom.CONTROLLER,
				__resource: null,
				
				tagName: null,
				compoName: null,
				nodes: null,
				components: null,
				expression: null,
				attr: null,
				model: null,
				
				slots: null,
				pipes: null,
				
				compos: null,
				events: null,
				
				async: false,
				await: null,
				
				meta: {
					/* render modes, relevant for mask-node */
					mode: null,
					modelMode: null,
					attributes: null,
					serializeNodes: null,
					handleAttributes: null,
				},
				
				onRenderStart: null,
				onRenderEnd: null,
				render: null,
				renderStart: function(model, ctx, container){
		
					if (arguments.length === 1
						&& model != null
						&& model instanceof Array === false
						&& model[0] != null){
						
						var args = arguments[0];
						model = args[0];
						ctx = args[1];
						container = args[2];
					}
						
					if (compo_meta_executeAttributeHandler(this, model) === false) {
						// errored
						return;
					}
					compo_ensureTemplate(this);
					
					if (is_Function(this.onRenderStart)){
						var x = this.onRenderStart(model, ctx, container);
						if (x !== void 0 && dfr_isBusy(x)) 
							compo_prepairAsync(x, this, ctx);
					}
				},
				renderEnd: function(elements, model, ctx, container){
					if (arguments.length === 1 && elements instanceof Array === false){
						var args = arguments[0];
						elements = args[0];
						model = args[1];
						ctx = args[2];
						container = args[3];
					}
		
					Anchor.create(this, elements);
		
					this.$ = domLib(elements);
		
					if (this.events != null)
						Events_.on(this, this.events);
					
					if (this.compos != null) 
						Children_.select(this, this.compos);
					
					if (is_Function(this.onRenderEnd))
						this.onRenderEnd(elements, model, ctx, container);
				},
				appendTo: function(mix) {
					
					var element = typeof mix === 'string'
						? document.querySelector(mix)
						: mix
						;
					
					if (element == null) {
						log_warn('Compo.appendTo: parent is undefined. Args:', arguments);
						return this;
					}
		
					var els = this.$,
						i = 0,
						imax = els.length;
					for (; i < imax; i++) {
						element.appendChild(els[i]);
					}
		
					this.emitIn('domInsert');
					return this;
				},
				append: function(template, model, selector) {
					var parent;
		
					if (this.$ == null) {
						var dom = typeof template === 'string'
							? mask.compile(template)
							: template;
		
						parent = selector
							? find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'down'))
							: this;
							
						if (parent.nodes == null) {
							this.nodes = dom;
							return this;
						}
		
						parent.nodes = [this.nodes, dom];
		
						return this;
					}
					
					var fragment = mask.render(template, model, null, null, this);
		
					parent = selector
						? this.$.find(selector)
						: this.$;
						
					
					parent.append(fragment);
					
					
					// @todo do not emit to created compos before
					this.emitIn('domInsert');
					
					return this;
				},
				find: function(selector){
					return find_findSingle(
						this, selector_parse(selector, Dom.CONTROLLER, 'down')
					);
				},
				findAll: function(selector){
					return find_findAll(
						this, selector_parse(selector, Dom.CONTROLLER, 'down')
					);
				},
				closest: function(selector){
					return find_findSingle(
						this, selector_parse(selector, Dom.CONTROLLER, 'up')
					);
				},
				on: function() {
					var x = _Array_slice.call(arguments);
					if (arguments.length < 3) {
						log_error('Invalid Arguments Exception @use .on(type,selector,fn)');
						return this;
					}
		
					if (this.$ != null) 
						Events_.on(this, [x]);
					
					if (this.events == null) {
						this.events = [x];
					} else if (is_Array(this.events)) {
						this.events.push(x);
					} else {
						this.events = [x, this.events];
					}
					return this;
				},
				remove: function() {
					compo_removeElements(this);
					compo_detachChild(this);
					compo_dispose(this);
		
					this.$ = null;
					return this;
				},
		
				slotState: function(slotName, isActive){
					Compo.slot.toggle(this, slotName, isActive);
					return this;
				},
		
				signalState: function(signalName, isActive){
					Compo.signal.toggle(this, signalName, isActive);
					return this;
				},
		
				emitOut: function(signalName /* args */){
					Compo.signal.emitOut(
						this,
						signalName,
						this,
						arguments.length > 1
							? _Array_slice.call(arguments, 1)
							: null
					);
					return this;
				},
		
				emitIn: function(signalName /* args */){
					Compo.signal.emitIn(
						this,
						signalName,
						this,
						arguments.length > 1
							? _Array_slice.call(arguments, 1)
							: null
					);
					return this;
				}
			};
		
			Compo.prototype = CompoProto;
		}());
		
		// end:source /src/compo/Compo.js
		// source /src/compo/signals.js
		(function() {
		
			/**
			 *	Mask Custom Attribute
			 *	Bind Closest Controller Handler Function to dom event(s)
			 */
		
			mask.registerAttrHandler('x-signal', 'client', function(node, attrValue, model, ctx, element, controller) {
		
				var arr = attrValue.split(';'),
					signals = '',
					imax = arr.length,
					i = -1,
					x;
				
				while ( ++i < imax ) {
					x = arr[i].trim();
					if (x === '') 
						continue;
					
		
					var i_colon = x.indexOf(':'),
						event = x.substring(0, i_colon),
						handler = x.substring(i_colon + 1).trim(),
						Handler = _createListener(controller, handler)
						;
		
					// if DEBUG
					!event && log_error('Signal: event type is not set', attrValue);
					// endif
		
					if (Handler) {
		
						signals += ',' + handler + ',';
						dom_addEventListener(element, event, Handler);
					}
		
					// if DEBUG
					!Handler && log_warn('No slot found for signal', handler, controller);
					// endif
				}
		
				if (signals !== '') 
					element.setAttribute('data-signals', signals);
		
			});
		
			// @param sender - event if sent from DOM Event or CONTROLLER instance
			function _fire(controller, slot, sender, args, direction) {
				
				if (controller == null) 
					return false;
				
				var found = false,
					fn = controller.slots != null && controller.slots[slot];
					
				if (typeof fn === 'string') 
					fn = controller[fn];
				
				if (typeof fn === 'function') {
					found = true;
					
					var isDisabled = controller.slots.__disabled != null && controller.slots.__disabled[slot];
		
					if (isDisabled !== true) {
		
						var result = args == null
								? fn.call(controller, sender)
								: fn.apply(controller, [sender].concat(args));
		
						if (result === false) {
							return true;
						}
						
						if (result != null && typeof result === 'object' && result.length != null) {
							args = result;
						}
					}
				}
		
				if (direction === -1 && controller.parent != null) {
					return _fire(controller.parent, slot, sender, args, direction) || found;
				}
		
				if (direction === 1 && controller.components != null) {
					var compos = controller.components,
						imax = compos.length,
						i = 0,
						r;
					for (; i < imax; i++) {
						r = _fire(compos[i], slot, sender, args, direction);
						
						!found && (found = r);
					}
				}
				
				return found;
			}
		
			function _hasSlot(controller, slot, direction, isActive) {
				if (controller == null) {
					return false;
				}
		
				var slots = controller.slots;
		
				if (slots != null && slots[slot] != null) {
					if (typeof slots[slot] === 'string') {
						slots[slot] = controller[slots[slot]];
					}
		
					if (typeof slots[slot] === 'function') {
						if (isActive === true) {
							if (slots.__disabled == null || slots.__disabled[slot] !== true) {
								return true;
							}
						} else {
							return true;
						}
					}
				}
		
				if (direction === -1 && controller.parent != null) {
					return _hasSlot(controller.parent, slot, direction);
				}
		
				if (direction === 1 && controller.components != null) {
					for (var i = 0, length = controller.components.length; i < length; i++) {
						if (_hasSlot(controller.components[i], slot, direction)) {
							return true;
						}
		
					}
				}
				return false;
			}
		
			function _createListener(controller, slot) {
		
				if (_hasSlot(controller, slot, -1) === false) {
					return null;
				}
		
				return function(event) {
					var args = arguments.length > 1 ? _Array_slice.call(arguments, 1) : null;
					
					_fire(controller, slot, event, args, -1);
				};
			}
		
			function __toggle_slotState(controller, slot, isActive) {
				var slots = controller.slots;
				if (slots == null || slots.hasOwnProperty(slot) === false) {
					return;
				}
		
				if (slots.__disabled == null) {
					slots.__disabled = {};
				}
		
				slots.__disabled[slot] = isActive === false;
			}
		
			function __toggle_slotStateWithChilds(controller, slot, isActive) {
				__toggle_slotState(controller, slot, isActive);
		
				if (controller.components != null) {
					for (var i = 0, length = controller.components.length; i < length; i++) {
						__toggle_slotStateWithChilds(controller.components[i], slot, isActive);
					}
				}
			}
		
			function __toggle_elementsState(controller, slot, isActive) {
				if (controller.$ == null) {
					log_warn('Controller has no elements to toggle state');
					return;
				}
		
				domLib() 
					.add(controller.$.filter('[data-signals]')) 
					.add(controller.$.find('[data-signals]')) 
					.each(function(index, node) {
						var signals = node.getAttribute('data-signals');
			
						if (signals != null && signals.indexOf(slot) !== -1) {
							node[isActive === true ? 'removeAttribute' : 'setAttribute']('disabled', 'disabled');
						}
					});
			}
		
			function _toggle_all(controller, slot, isActive) {
		
				var parent = controller,
					previous = controller;
				while ((parent = parent.parent) != null) {
					__toggle_slotState(parent, slot, isActive);
		
					if (parent.$ == null || parent.$.length === 0) {
						// we track previous for changing elements :disable state
						continue;
					}
		
					previous = parent;
				}
		
				__toggle_slotStateWithChilds(controller, slot, isActive);
				__toggle_elementsState(previous, slot, isActive);
		
			}
		
			function _toggle_single(controller, slot, isActive) {
				__toggle_slotState(controller, slot, isActive);
		
				if (!isActive && (_hasSlot(controller, slot, -1, true) || _hasSlot(controller, slot, 1, true))) {
					// there are some active slots; do not disable elements;
					return;
				}
				__toggle_elementsState(controller, slot, isActive);
			}
		
		
		
			obj_extend(Compo, {
				signal: {
					toggle: _toggle_all,
		
					// to parent
					emitOut: function(controller, slot, sender, args) {
						var captured = _fire(controller, slot, sender, args, -1);
						
						// if DEBUG
						!captured && log_warn('Signal %c%s','font-weight:bold;', slot, 'was not captured');
						// endif
						
					},
					// to children
					emitIn: function(controller, slot, sender, args) {
						_fire(controller, slot, sender, args, 1);
					},
		
					enable: function(controller, slot) {
						_toggle_all(controller, slot, true);
					},
					
					disable: function(controller, slot) {
						_toggle_all(controller, slot, false);
					}
				},
				slot: {
					toggle: _toggle_single,
					enable: function(controller, slot) {
						_toggle_single(controller, slot, true);
					},
					disable: function(controller, slot) {
						_toggle_single(controller, slot, false);
					},
					invoke: function(controller, slot, event, args) {
						var slots = controller.slots;
						if (slots == null || typeof slots[slot] !== 'function') {
							log_error('Slot not found', slot, controller);
							return null;
						}
		
						if (args == null) {
							return slots[slot].call(controller, event);
						}
		
						return slots[slot].apply(controller, [event].concat(args));
					},
		
				}
		
			});
		
		}());
		
		// end:source /src/compo/signals.js
	
		// source /src/DomLite.js
		/*
		 * Extrem simple Dom Library. If (jQuery | Kimbo | Zepto) is not used.
		 * Only methods, required for the Compo library are implemented.
		 */
		var DomLite;
		(function(document){
			if (document == null) 
				return;
			
			Compo.DomLite = DomLite = function(els){
				if (this instanceof DomLite === false) 
					return new DomLite(els);
				
				return this.add(els)
			};
			
			if (domLib == null) 
				domLib = DomLite;
			
			var Proto = DomLite.fn = {
				constructor: DomLite,
				length: 0,
				add: function(mix){
					if (mix == null) 
						return this;
					if (is_Array(mix) === true) 
						return each(mix, this.add, this);
					
					var type = mix.nodeType;
					if (type === 11 /* Node.DOCUMENT_FRAGMENT_NODE */)
						return each(mix.childNodes, this.add, this);
						
					if (type == null) {
						if (typeof mix.length === 'number') 
							return each(mix, this.add, this);
						
						log_warn('Uknown domlite object');
						return this;
					}
					
					this[this.length++] = mix;
					return this;
				},
				on: function(){
					return binder.call(this, on, delegate, arguments);
				},
				off: function(){
					return binder.call(this, off, undelegate, arguments);
				},
				find: function(sel){
					return each(this, function(node){
						this.add(_$$.call(node, sel));
					}, new DomLite);
				},
				filter: function(sel){
					return each(this, function(node, index){
						_is(node, sel) === true && this.add(node);
					}, new DomLite);
				},
				parent: function(){
					var x = this[0];
					return new DomLite(x && x.parentNode);
				},
				children: function(sel){
					var set = each(this, function(node){
						this.add(node.childNodes);
					}, new DomLite);
					return sel == null ? set : set.filter(sel);
				},
				closest: function(selector){
					var x = this[0],
						dom = new DomLite;
					while( x != null && x.parentNode != null){
						x = x.parentNode;
						if (_is(x, selector)) 
							return dom.add(x);
					}
					return dom;
				},
				remove: function(){
					return each(this, function(x){
						x.parentNode.removeChild(x);
					});
				}
			};
			
			(function(){
				var Manip = {
					append: function(node, el){
						after_(node, node.lastChild, el);
					},
					prepend: function(node, el){
						before_(node, node.firstChild, el);
					},
					after: function(node, el){
						after_(node.parentNode, node, el);
					},
					before: function(node, el){
						before_(node.parentNode, node, el);
					}
				};
				each(['append', 'prepend', 'before', 'after'], function(method){
					var fn = Manip[method];
					Proto[method] = function(mix){
						var isArray = is_Array(mix);
						return each(this, function(node){
							if (isArray) {
								each(mix, function(el){
									fn(node, el);
								});
								return;
							}
							fn(node, mix);
						});
					};
				});
				function before_(parent, anchor, el){
					if (parent == null || el == null)
						return;
					parent.insertBefore(el, anchor);
				}
				function after_(parent, anchor, el) {
					var next = anchor != null ? anchor.nextSibling : null;
					before_(parent, next, el);
				}
			}());
			
			
			function each(arr, fn, ctx){
				if (arr == null) 
					return ctx || arr;
				var imax = arr.length,
					i = -1;
				while( ++i < imax ){
					fn.call(ctx || arr, arr[i], i);
				}
				return ctx || arr;
			}
			function indexOf(arr, fn, ctx){
				if (arr == null) 
					return -1;
				var imax = arr.length,
					i = -1;
				while( ++i < imax ){
					if (fn.call(ctx || arr, arr[i], i) === true)
						return i;
				}
				return -1;
			}
			
			var docEl = document.documentElement;
			var _$$ = docEl.querySelectorAll;
			var _is = (function(){
				var matchesSelector =
					docEl.webkitMatchesSelector ||
					docEl.mozMatchesSelector ||
					docEl.msMatchesSelector ||
					docEl.oMatchesSelector ||
					docEl.matchesSelector
				;
				return function (el, selector) {
					return el == null || el.nodeType !== 1
						? false
						: matchesSelector.call(el, selector);
				};	
			}());
			
			/* Events */
			var binder, on, off, delegate, undelegate;
			(function(){
				binder = function(bind, bindSelector, args){
					var length = args.length,
						fn;
					if (2 === length) 
						fn = bind
					if (3 === length) 
						fn = bindSelector;
					
					if (fn != null) {
						return each(this, function(node){
							fn.apply(DomLite(node), args);
						});
					}
					log_error('`DomLite.on|off` - invalid arguments count');
					return this;
				};
				on = function(type, fn){
					return run(this, _addEvent, type, fn);
				};
				off = function(type, fn){
					return run(this, _remEvent, type, fn);
				};
				delegate = function(type, selector, fn){
					function guard(event){
						var el = event.target,
							current = event.currentTarget;
						if (current === el) 
							return;
						while(el != null && el !== current){
							if (_is(el, selector)) {
								fn(event);
								return;
							}
							el = el.parentNode;
						}
					}
					(fn._guards || (fn._guards = [])).push(guard);
					return on.call(this, type, guard);
				};
				undelegate = function(type, selector, fn){
					return each(fn._quards, function(guard){
						off.call(this, type, guard);
					}, this);
				};
				
				function run(set, handler, type, fn){
					return each(set, function(node){
						handler.call(node, type, fn, false);
					});
				}
				var _addEvent = docEl.addEventListener,
					_remEvent = docEl.removeEventListener;
			}());
			
			/* class handler */
			(function(){
				var isClassListSupported = docEl.classList != null;
				var hasClass = isClassListSupported === true
					? function (node, klass) {
						return node.classList.contains(klass);
					}
					: function(node, klass) {
						return -1 !== (' ' + node.className + ' ').indexOf(' ' + klass + ' ');
					};
				Proto.hasClass = function(klass){
					return -1 !== indexOf(this, function(node){
						return hasClass(node, klass)
					});
				};
				var Shim;
				(function(){
					Shim = {
						add: function(node, klass){
							if (hasClass(node, klass) === false) 
								add(node, klass);
						},
						remove: function(node, klass){
							if (hasClass(node, klass) === true) 
								remove(node, klass);
						},
						toggle: function(node, klass){
							var fn = hasClass(node, klass) === true
								? remove
								: add;
							fn(node, klass);
						}
					};
					function add(node, klass){
						node.className += ' ' + klass;
					}
					function remove(node, klass){
						node.className = (' ' + node.className + ' ').replace(' ' + klass + ' ', ' ');
					}
				}());
				
				each(['add', 'remove', 'toggle'], function(method){
					var mutatorFn = isClassListSupported === false
						? Shim[method]
						: function(node, klass){
							var classList = node.classList;
							classList[method].call(classList, klass);
						};
					Proto[method + 'Class'] = function(klass){
						return each(this, function(node){
							mutatorFn(node, klass);
						});
					};
				});
					
			}());
			
			
			// Events
			(function(){
				var createEvent = function(type){
					var event = document.createEvent('Event');
					event.initEvent(type, true, true);
					return event;
				};
				var create = function(type, data){
					if (data == null) 
						return createEvent(type);
					var event = document.createEvent('CustomEvent');
					event.initCustomEvent(type, true, true, data);
					return event;
				};
				var dispatch = function(node, event){
					node.dispatchEvent(event);
				};
				Proto['trigger'] = function(type, data){
					var event = create(type, data);
					return each(this, function(node){
						dispatch(node, event);
					});
				};
			}());
			
			// Attributes
			(function(){
				Proto['attr'] = function(name, val){
					if (val === void 0) 
						return this[0] && this[0].getAttribute(name);
					return each(this, function(node){
						node.setAttribute(name, val);
					});
				};
				Proto['removeAttr'] = function(name){
					return each(this, function(node){
						node.removeAttribute(name);
					});
				};
			}());
			
			if (Object.setPrototypeOf) 
				Object.setPrototypeOf(Proto, Array.prototype);
			else if (Proto.__proto__) 
				Proto.__proto__ = Array.prototype;
			
			DomLite.prototype = Proto;
			domLib_initialize();
			
		}(global.document));
		// end:source /src/DomLite.js
		// source /src/jcompo/jCompo.js
		// try to initialize the dom lib, or is then called from `setDOMLibrary`
		domLib_initialize();
		
		function domLib_initialize(){
			if (domLib == null || domLib.fn == null)
				return;
			
			domLib.fn.compo = function(selector){
				if (this.length === 0)
					return null;
				
				var compo = Anchor.resolveCompo(this[0]);
		
				return selector == null
					? compo
					: find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
			};
		
			domLib.fn.model = function(selector){
				var compo = this.compo(selector);
				if (compo == null)
					return null;
				
				var model = compo.model;
				while(model == null && compo.parent){
					compo = compo.parent;
					model = compo.model;
				}
				return model;
			};
			
			// insert
			(function(){
				var jQ_Methods = [
					'append',
					'prepend',
					'before',
					'after'
				];
				
				[
					'appendMask',
					'prependMask',
					'beforeMask',
					'afterMask'
				].forEach(function(method, index){
					
					domLib.fn[method] = function(template, model, controller, ctx){
						
						if (this.length === 0) {
							// if DEBUG
							log_warn('<jcompo> $.', method, '- no element was selected(found)');
							// endif
							return this;
						}
						
						if (this.length > 1) {
							// if DEBUG
							log_warn('<jcompo> $.', method, ' can insert only to one element. Fix is comming ...');
							// endif
						}
						
						if (controller == null) {
							controller = index < 2
								? this.compo()
								: this.parent().compo()
								;
						}
						
						var isUnsafe = false;
						if (controller == null) {
							controller = {};
							isUnsafe = true;
						}
						
						
						if (controller.components == null) {
							controller.components = [];
						}
						
						var compos = controller.components,
							i = compos.length,
							fragment = mask.render(template, model, ctx, null, controller);
						
						var self = this[jQ_Methods[index]](fragment),
							imax = compos.length;
						
						for (; i < imax; i++) {
							Compo.signal.emitIn(compos[i], 'domInsert');
						}
						
						if (isUnsafe && imax !== 0) {
							// if DEBUG
							log_warn(
								'$.'
								, method
								, '- parent controller was not found in Elements DOM.'
								, 'This can lead to memory leaks.'
							);
							log_warn(
								'Specify the controller directly, via $.'
								, method
								, '(template[, model, controller, ctx])'
							);
							// endif
						}
						
						return self;
					};
					
				});
			}());
			
			
			// remove
			(function(){
				var jq_remove = domLib.fn.remove,
					jq_empty = domLib.fn.empty
					;
				
				domLib.fn.removeAndDispose = function(){
					this.each(each_tryDispose);
					
					return jq_remove.call(this);
				};
				
				domLib.fn.emptyAndDispose = function(){
					this.each(each_tryDisposeChildren);
					
					return jq_empty.call(this);
				}
				
				
				function each_tryDispose(index, node){
					node_tryDispose(node);
				}
				
				function each_tryDisposeChildren(index, node){
					node_tryDisposeChildren(node);
				}
				
			}());
		}
		
		// end:source /src/jcompo/jCompo.js
		
	
		// source /src/handler/slot.js
		
		function SlotHandler() {}
		
		mask.registerHandler(':slot', SlotHandler);
		
		SlotHandler.prototype = {
			constructor: SlotHandler,
			renderEnd: function(element, model, cntx, container){
				this.slots = {};
		
				this.expression = this.attr.on;
		
				this.slots[this.attr.signal] = this.handle;
			},
			handle: function(){
				var expr = this.expression;
		
				mask.Utils.Expression.eval(expr, this.model, global, this);
			}
		};
		
		// end:source /src/handler/slot.js
	
	
		return Compo;
	
	}(Mask));
	
	// end:source /ref-mask-compo/lib/compo.embed.js
	// source /ref-mask-j/lib/jmask.embed.js
	
	var jmask = exports.jmask = Mask.jmask = (function(mask){
		
		// source ../src/scope-vars.js
		var Dom = mask.Dom,
			_mask_render = mask.render,
			_mask_parse = mask.parse,
			_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn,
			_signal_emitIn = (mask.Compo || Compo).signal.emitIn;
			
		
		function _mask_ensureTmplFn(value) {
			if (typeof value !== 'string') {
				return value;
			}
			return _mask_ensureTmplFnOrig(value);
		}
		
		
		// end:source ../src/scope-vars.js
	
		// source ../src/util/array.js
		var arr_eachAny,
			arr_unique;
		
		(function(){
		
			arr_eachAny = function(mix, fn) {
				if (is_ArrayLike(mix) === false) {
					fn(mix);
					return;
				}
				var imax = mix.length,
					i = -1;
				while ( ++i < imax ){
					fn(mix[i], i);
				}
			};
			
			(function() {
				arr_unique = function(array) {
					hasDuplicate_ = false;
					array.sort(sort);
					if (hasDuplicate_ === false) 
						return array;
					
					var duplicates = [],
						i = 0,
						j = 0,
						imax = array.length - 1;
			
					while (i < imax) {
						if (array[i++] === array[i]) {
							duplicates[j++] = i;
						}
					}
					while (j--) {
						array.splice(duplicates[j], 1);
					}
			
					return array;
				};
				
				var hasDuplicate_ = false;
				function sort(a, b) {
					if (a === b) {
						hasDuplicate_ = true;
						return 0;
					}
					return 1;
				}
			}());
			
		}());
		
		// end:source ../src/util/array.js
		// source ../src/util/selector.js
		var selector_parse,
			selector_match;
			
		(function(){
			
			selector_parse = function(selector, type, direction) {
				if (selector == null) 
					log_error('selector is null for the type', type);
				
				if (typeof selector === 'object') 
					return selector;
				
				var key,
					prop,
					nextKey,
					filters,
			
					_key,
					_prop,
					_selector;
			
				var index = 0,
					length = selector.length,
					c,
					end,
					matcher, root, current,
					eq,
					slicer;
			
				if (direction === 'up') {
					nextKey = sel_key_UP;
				} else {
					nextKey = type === Dom.SET
						? sel_key_MASK
						: sel_key_COMPOS;
				}
			
				while (index < length) {
			
					c = selector.charCodeAt(index);
			
					if (c < 33) {
						index++;
						continue;
					}
					if (c === 62 /* > */) {
						if (matcher == null) {
							root = matcher = {
								selector: '__scope__',
								nextKey: nextKey,
								filters: null,
								next: {
									type: 'children',
									matcher: null
								}
							};
						} else {
							matcher.next = {
								type: 'children',
								matcher: null
							};
						}
						current = matcher;
						matcher = null;
						index++;
						continue;
					}
					
					end = selector_moveToBreak(selector, index + 1, length);
					if (c === 46 /*.*/ ) {
						_key = 'class';
						_prop = sel_key_ATTR;
						_selector = sel_hasClassDelegate(selector.substring(index + 1, end));
					}
			
					else if (c === 35 /*#*/ ) {
						_key = 'id';
						_prop = sel_key_ATTR;
						_selector = selector.substring(index + 1, end);
					}
			
					else if (c === 91 /*[*/ ) {
						eq = selector.indexOf('=', index);
						//if DEBUG
						eq === -1 && console.error('Attribute Selector: should contain "="');
						// endif
			
						_prop = sel_key_ATTR;
						_key = selector.substring(index + 1, eq);
			
						//slice out quotes if any
						c = selector.charCodeAt(eq + 1);
						slicer = c === 34 || c === 39 ? 2 : 1;
			
						_selector = selector.substring(eq + slicer, end - slicer + 1);
			
						// increment, as cursor is on closed ']'
						end++;
					}
					else {
						
						if (matcher != null) {
							matcher.next = {
								type: 'any',
								matcher: null
							};
							current = matcher;
							matcher = null;
						}
						
						_prop = null;
						_key = type === Dom.SET ? 'tagName' : 'compoName';
						_selector = selector.substring(index, end);
					}
			
					index = end;
			
					if (matcher == null) {
						matcher = {
							key: _key,
							prop: _prop,
							selector: _selector,
							nextKey: nextKey,
							filters: null
						};
						if (root == null) 
							root = matcher;
							
						if (current != null) {
							current.next.matcher = matcher;
						}
						
						continue;
					}
					if (matcher.filters == null) 
						matcher.filters = [];
					
					matcher.filters.push({
						key: _key,
						selector: _selector,
						prop: _prop
					});
				}
				
				if (current && current.next) 
					current.next.matcher = matcher;
				
				return root;
			};
			
			selector_match = function(node, selector, type) {
				if (typeof selector === 'string') {
					if (type == null) {
						type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
					}
					selector = selector_parse(selector, type);
				}
				
				if (selector.selector === '*') 
					return true;
			
				var obj = selector.prop ? node[selector.prop] : node,
					matched = false;
			
				if (obj == null) 
					return false;
				
				if (typeof selector.selector === 'function') {
					matched = selector.selector(obj[selector.key]);
				}
				
				else if (selector.selector.test != null) {
					if (selector.selector.test(obj[selector.key])) {
						matched = true;
					}
				}
				
				else  if (obj[selector.key] === selector.selector) {
					matched = true;
				}
			
				if (matched === true && selector.filters != null) {
					for(var i = 0, x, imax = selector.filters.length; i < imax; i++){
						x = selector.filters[i];
			
						if (selector_match(node, x, type) === false) {
							return false;
						}
					}
				}
			
				return matched;
			};
			
			// ==== private
			
			var sel_key_UP = 'parent',
				sel_key_MASK = 'nodes',
				sel_key_COMPOS = 'components',
				sel_key_ATTR = 'attr';
			
			
			function sel_hasClassDelegate(matchClass) {
				return function(className){
					return sel_hasClass(className, matchClass);
				};
			}
			
			// [perf] http://jsperf.com/match-classname-indexof-vs-regexp/2
			function sel_hasClass(className, matchClass, index) {
				if (typeof className !== 'string')
					return false;
				
				if (index == null) 
					index = 0;
					
				index = className.indexOf(matchClass, index);
			
				if (index === -1)
					return false;
			
				if (index > 0 && className.charCodeAt(index - 1) > 32)
					return sel_hasClass(className, matchClass, index + 1);
			
				var class_Length = className.length,
					match_Length = matchClass.length;
					
				if (index < class_Length - match_Length && className.charCodeAt(index + match_Length) > 32)
					return sel_hasClass(className, matchClass, index + 1);
			
				return true;
			}
			
			
			function selector_moveToBreak(selector, index, length) {
				var c, 
					isInQuote = false,
					isEscaped = false;
			
				while (index < length) {
					c = selector.charCodeAt(index);
			
					if (c === 34 || c === 39) {
						// '"
						isInQuote = !isInQuote;
					}
			
					if (c === 92) {
						// [\]
						isEscaped = !isEscaped;
					}
			
					if (c === 46 || c === 35 || c === 91 || c === 93 || c === 62 || c < 33) {
						// .#[]>
						if (isInQuote !== true && isEscaped !== true) {
							break;
						}
					}
					index++;
				}
				return index;
			}
			
		}());
		
		// end:source ../src/util/selector.js
		// source ../src/util/utils.js
		var jmask_filter,
			jmask_find,
			jmask_clone,
			jmask_deepest,
			jmask_getText
			;
		
		(function(){
			
			jmask_filter = function(mix, matcher) {
				if (matcher == null) 
					return mix;
				
				var result = [];
				arr_eachAny(mix, function(node, i) {
					if (selector_match(node, matcher)) 
						result.push(node);
				});
				return result;
			};
			
			/**
			 * - mix (Node | Array[Node])
			 */
			jmask_find = function(mix, matcher, output, deep) {
				if (mix == null) {
					return output;
				}
				if (output == null) {
					output = [];
				}
				if (deep == null) {
					// is root and matchling like `> div` (childs only)
					if (matcher.selector === '__scope__') {
						deep = false;
						matcher = matcher.next.matcher;
					} else{
						deep = true;
					}
				}
				
				arr_eachAny(mix, function(node){
					if (selector_match(node, matcher) === false) {
						
						if (matcher.next == null && deep !== false) 
							jmask_find(node[matcher.nextKey], matcher, output, deep);
						
						return;
					}
					
					if (matcher.next == null) {
						output.push(node);
						if (deep === true) 
							jmask_find(node[matcher.nextKey], matcher, output, deep);
							
						return;
					}
					
					var next = matcher.next;
					deep = next.type !== 'children';
					jmask_find(node[matcher.nextKey], next.matcher, output, deep);
				});
				return output;
			};
			
			jmask_clone = function(node, parent){
			
				var copy = {
					'type': 1,
					'tagName': 1,
					'compoName': 1,
					'controller': 1
				};
			
				var clone = {
					parent: parent
				};
			
				for(var key in node){
					if (copy[key] === 1){
						clone[key] = node[key];
					}
				}
			
				if (node.attr != null){
					clone.attr = obj_create(node.attr);
				}
			
				var nodes = node.nodes;
				if (nodes != null && nodes.length > 0){
					if (is_ArrayLike(nodes) === false) {
						clone.nodes = [ jmask_clone(nodes, clone) ];
					}
					else {
						clone.nodes = [];
						var imax = nodes.length,
							i = 0;
						for(; i< imax; i++){
							clone.nodes[i] = jmask_clone(nodes[i], clone);
						}
					}
				}
				return clone;
			};
			
			
			jmask_deepest = function(node){
				var current = node,
					prev;
				while(current != null){
					prev = current;
					current = current.nodes && current.nodes[0];
				}
				return prev;
			};
			
			
			jmask_getText = function(node, model, ctx, controller) {
				if (Dom.TEXTNODE === node.type) {
					if (is_Function(node.content)) {
						return node.content('node', model, ctx, null, controller);
					}
					return node.content;
				}
			
				var output = '';
				if (node.nodes != null) {
					for(var i = 0, x, imax = node.nodes.length; i < imax; i++){
						x = node.nodes[i];
						output += jmask_getText(x, model, ctx, controller);
					}
				}
				return output;
			};
		
		}());
		
		// end:source ../src/util/utils.js
	
		// source ../src/jmask/jmask.js
		function jMask(mix) {
			if (this instanceof jMask === false) 
				return new jMask(mix);
			if (mix == null) 
				return this;
			if (mix.type === Dom.SET) 
				return mix;
			return this.add(mix);
		}
		
		var Proto = jMask.prototype = {
			constructor: jMask,
			type: Dom.SET,
			length: 0,
			components: null,
			add: function(mix) {
				var i, length;
		
				if (typeof mix === 'string') {
					mix = _mask_parse(mix);
				}
		
				if (is_ArrayLike(mix)) {
					for (i = 0, length = mix.length; i < length; i++) {
						this.add(mix[i]);
					}
					return this;
				}
		
				if (typeof mix === 'function' && mix.prototype.type != null) {
					// assume this is a controller
					mix = {
						controller: mix,
						type: Dom.COMPONENT
					};
				}
		
		
				var type = mix.type;
		
				if (!type) {
					// @TODO extend to any type?
					console.error('Only Mask Node/Component/NodeText/Fragment can be added to jmask set', mix);
					return this;
				}
		
				if (type === Dom.FRAGMENT) {
					var nodes = mix.nodes;
		
					for(i = 0, length = nodes.length; i < length;) {
						this[this.length++] = nodes[i++];
					}
					return this;
				}
		
				if (type === Dom.CONTROLLER) {
		
					if (mix.nodes != null && mix.nodes.length) {
						for (i = mix.nodes.length; i !== 0;) {
							// set controller as parent, as parent is mask dom node
							mix.nodes[--i].parent = mix;
						}
					}
		
					if (mix.$ != null) {
						this.type = Dom.CONTROLLER;
					}
				}
		
		
		
				this[this.length++] = mix;
				return this;
			},
			toArray: function() {
				return Array.prototype.slice.call(this);
			},
			/**
			 *	render([model, cntx, container]) -> HTMLNode
			 * - model (Object)
			 * - cntx (Object)
			 * - container (Object)
			 * - returns (HTMLNode)
			 *
			 **/
			render: function(model, cntx, container, controller) {
				this.components = [];
		
				if (this.length === 1) {
					return _mask_render(this[0], model, cntx, container, controller || this);
				}
		
				if (container == null) {
					container = document.createDocumentFragment();
				}
		
				for (var i = 0, length = this.length; i < length; i++) {
					_mask_render(this[i], model, cntx, container, controller || this);
				}
				return container;
			},
			prevObject: null,
			end: function() {
				return this.prevObject || this;
			},
			pushStack: function(nodes) {
				var next;
				next = jMask(nodes);
				next.prevObject = this;
				return next;
			},
			controllers: function() {
				if (this.components == null) {
					console.warn('Set was not rendered');
				}
		
				return this.pushStack(this.components || []);
			},
			mask: function(template) {
				var node;
				
				if (template != null) 
					return this.empty().append(template);
				
				if (arguments.length) 
					return this;
				
				
				if (this.length === 0) 
					node = new Dom.Node();
				
				else if (this.length === 1) 
					node = this[0];
					
				else {
					node = new Dom.Fragment();
					node.nodes = [];
					
					var i = -1;
					while ( ++i < this.length ){
						node.nodes[i] = this[i];
					}
				}
		
				return mask.stringify(node);
			},
		
			text: function(mix, cntx, controller){
				if (typeof mix === 'string' && arguments.length === 1) {
					var node = [new Dom.TextNode(mix)];
		
					for(var i = 0, x, imax = this.length; i < imax; i++){
						x = this[i];
						x.nodes = node;
					}
					return this;
				}
		
				var string = '';
				for(var i = 0, x, imax = this.length; i < imax; i++){
					x = this[i];
					string += jmask_getText(x, mix, cntx, controller);
				}
				return string;
			}
		};
		
		arr_each(['append', 'prepend'], function(method) {
		
			jMask.prototype[method] = function(mix) {
				var $mix = jMask(mix),
					i = 0,
					length = this.length,
					arr, node;
		
				for (; i < length; i++) {
					node = this[i];
					// we create each iteration a new array to prevent collisions in future manipulations
					arr = $mix.toArray();
		
					for (var j = 0, jmax = arr.length; j < jmax; j++) {
						arr[j].parent = node;
					}
		
					if (node.nodes == null) {
						node.nodes = arr;
						continue;
					}
		
					node.nodes = method === 'append' ? node.nodes.concat(arr) : arr.concat(node.nodes);
				}
		
				return this;
			};
		
		});
		
		arr_each(['appendTo'], function(method) {
		
			jMask.prototype[method] = function(mix, model, cntx, controller) {
		
				if (controller == null) {
					controller = this;
				}
		
				if (mix.nodeType != null && typeof mix.appendChild === 'function') {
					mix.appendChild(this.render(model, cntx, null, controller));
		
					_signal_emitIn(controller, 'domInsert');
					return this;
				}
		
				jMask(mix).append(this);
				return this;
			};
		
		});
		
		// end:source ../src/jmask/jmask.js
		// source ../src/jmask/manip.attr.js
		(function() {
			Proto.removeAttr = Proto.removeProp = function(key){
				return coll_each(this, function(node){
					node.attr[key] = null;
				});
			};
			Proto.attr = Proto.prop = function(mix, val){
				if (arguments.length === 1) {
					return this.length > 0 ? this[0].attr[mix] : null;
				}
				function asString(node, key, val){
					node.attr[key] = _mask_ensureTmplFn(val);
				}
				function asObject(node, obj){
					for(var key in obj){
						asString(node, key, obj[key]);
					}
				}
				var fn = is_String(mix) ? asString : asObject;
				return coll_each(this, function(node){
					fn(node, mix, val);
				});
			};
			Proto.tag = function(name) {
				if (arguments.length === 0) 
					return this[0] && this[0].tagName;
				
				return coll_each(this, function(node){
					node.tagName = name;
				});
			};
			Proto.css = function(mix, val) {
				if (arguments.length <= 1 && typeof mix === 'string') {
					if (this.length == null) 
						return null;
					
					var style = this[0].attr.style;
					if (style == null) 
						return null;
					
					var obj = css_parseStyle(style);
					return mix == null ? obj : obj[mix];
				}
				
				if (mix == null) 
					return this;
				
				var stringify = typeof mix === 'object'
					? css_stringify
					: css_stringifyKeyVal ;
				var extend = typeof mix === 'object'
					? obj_extend
					: css_extendKeyVal ;
					
				return coll_each(this, function(node){
					var style = node.attr.style;
					if (style == null) {
						node.attr.style = stringify(mix, val);
						return;
					}
					var css = css_parseStyle(style);
					extend(css, mix, val);
					node.attr.style = css_stringify(css);
				});
			};
		
			function css_extendKeyVal(css, key, val){
				css[key] = val;
			}
			function css_parseStyle(style) {
				var obj = {};
				style.split(';').forEach(function(x){
					if (x === '') 
						return;
					var i = x.indexOf(':'),
						key = x.substring(0, i).trim(),
						val = x.substring(i + 1).trim();
					obj[key] = val;
				});
				return obj;
			}
			function css_stringify(css) {
				var str = '', key;
				for(key in css) {
					str += key + ':' + css[key] + ';';
				}
				return str;
			}
			function css_stringifyKeyVal(key, val){
				return key + ':' + val + ';';
			}
		
		}());
		
		// end:source ../src/jmask/manip.attr.js
		// source ../src/jmask/manip.class.js
		(function() {
			Proto.hasClass = function(klass){
				return coll_find(this, function(node){
					return has(node, klass);
				});
			};
			var Mutator_ = {
				add: function(node, klass){
					if (has(node, klass) === false) 
						add(node, klass);
				},
				remove: function(node, klass){
					if (has(node, klass) === true) 
						remove(node, klass);
				},
				toggle: function(node, klass){
					var fn = has(node, klass) === true ? remove : add;
					fn(node, klass);
				}
			};
			arr_each(['add', 'remove', 'toggle'], function(method) {
				var fn = Mutator_[method];
				Proto[method + 'Class'] = function(klass) {
					return coll_each(this, function(node){
						fn(node, klass);
					});
				};
			});
			function current(node){
				var className = node.attr['class'];
				return typeof className === 'string' ? className : '';
			}
			function has(node, klass){
				return -1 !== (' ' + current(node) + ' ').indexOf(' ' + klass + ' ');
			}
			function add(node, klass){
				node.attr['class'] =  (current(node) + ' ' + klass).trim();
			}
			function remove(node, klass) {
				node.attr['class'] = (' ' + current(node) + ' ').replace(' ' + klass + ' ', '').trim();
			}
		}());
		
		// end:source ../src/jmask/manip.class.js
		// source ../src/jmask/manip.dom.js
		obj_extend(jMask.prototype, {
			clone: function(){
				return jMask(coll_map(this, jmask_clone));
			},
			wrap: function(wrapper){
				var $wrap = jMask(wrapper);
				if ($wrap.length === 0){
					log_warn('Not valid wrapper', wrapper);
					return this;
				}
				var result = coll_map(this, function(x){
					var node = $wrap.clone()[0];
					jmask_deepest(node).nodes = [ x ];
					
					if (x.parent != null) {
						var i = coll_indexOf(x.parent.nodes, x);
						if (i !== -1) 
							x.parent.nodes.splice(i, 1, node);
					}
					return node
				});
				return jMask(result);
			},
			wrapAll: function(wrapper){
				var $wrap = jMask(wrapper);
				if ($wrap.length === 0){
					log_error('Not valid wrapper', wrapper);
					return this;
				}
				this.parent().mask($wrap);
				jmask_deepest($wrap[0]).nodes = this.toArray();
				return this.pushStack($wrap);
			}
		});
		
		arr_each(['empty', 'remove'], function(method) {
			jMask.prototype[method] = function(){
				return coll_each(this, Methods_[method]);
			};
			var Methods_ = {
				remove: function(node){
					if (node.parent != null) 
						coll_remove(node.parent.nodes, node);
				},
				empty: function(node){
					node.nodes = null;
				}
			};
		});
		
		// end:source ../src/jmask/manip.dom.js
		// source ../src/jmask/traverse.js
		obj_extend(jMask.prototype, {
			each: function(fn, cntx) {
				for (var i = 0; i < this.length; i++) {
					fn.call(cntx || this, this[i], i)
				}
				return this;
			},
			eq: function(i) {
				return i === -1 ? this.slice(i) : this.slice(i, i + 1);
			},
			get: function(i) {
				return i < 0 ? this[this.length - i] : this[i];
			},
			slice: function() {
				return this.pushStack(Array.prototype.slice.apply(this, arguments));
			}
		});
		
		
		arr_each([
			'filter',
			'children',
			'closest',
			'parent',
			'find',
			'first',
			'last'
		], function(method) {
		
			jMask.prototype[method] = function(selector) {
				var result = [],
					matcher = selector == null
						? null
						: selector_parse(selector, this.type, method === 'closest' ? 'up' : 'down'),
					i, x;
		
				switch (method) {
				case 'filter':
					return jMask(jmask_filter(this, matcher));
				case 'children':
					for (i = 0; i < this.length; i++) {
						x = this[i];
						if (x.nodes == null) {
							continue;
						}
						result = result.concat(matcher == null ? x.nodes : jmask_filter(x.nodes, matcher));
					}
					break;
				case 'parent':
					for (i = 0; i < this.length; i++) {
						x = this[i].parent;
						if (!x || x.type === Dom.FRAGMENT || (matcher && selector_match(x, matcher))) {
							continue;
						}
						result.push(x);
					}
					arr_unique(result);
					break;
				case 'closest':
				case 'find':
					if (matcher == null) {
						break;
					}
					for (i = 0; i < this.length; i++) {
						jmask_find(this[i][matcher.nextKey], matcher, result);
					}
					break;
				case 'first':
				case 'last':
					var index;
					for (i = 0; i < this.length; i++) {
		
						index = method === 'first' ? i : this.length - i - 1;
						x = this[index];
						if (matcher == null || selector_match(x, matcher)) {
							result[0] = x;
							break;
						}
					}
					break;
				}
		
				return this.pushStack(result);
			};
		
		});
		
		// end:source ../src/jmask/traverse.js
	
	
	
		return jMask;
	
	}(Mask));
	
	// end:source /ref-mask-j/lib/jmask.embed.js
	// source /ref-mask-binding/lib/binding.embed.js
	(function(mask, Compo){
		var IS_BROWSER = true,
			IS_NODE = false;
			
		// source ../src/vars.js
		var __Compo = typeof Compo !== 'undefined' ? Compo : (mask.Compo || global.Compo),
		    __dom_addEventListener = __Compo.Dom.addEventListener,
		    __mask_registerHandler = mask.registerHandler,
		    __mask_registerAttrHandler = mask.registerAttrHandler,
		    __mask_registerUtil = mask.registerUtil,
		    
			domLib = __Compo.config.getDOMLibrary();
			
		
		// end:source ../src/vars.js
	
		// source ../src/util/object.js
		
		// end:source ../src/util/object.js
		// source ../src/util/object.observe.js
		var obj_addObserver,
			obj_hasObserver,
			obj_removeObserver,
			obj_lockObservers,
			obj_unlockObservers,
			obj_ensureObserversProperty,
			obj_addMutatorObserver,
			obj_removeMutatorObserver
			;
		
		(function(){
			obj_addObserver = function(obj, property, cb) {
				// closest observer
				var parts = property.split('.'),
					imax  = parts.length,
					i = -1,
					x = obj;
				while ( ++i < imax ) {
					x = x[parts[i]];
					
					if (x == null) 
						break;
					
					if (x[prop_OBS] != null) {
						
						var prop = parts.slice(i + 1).join('.');
						if (x[prop_OBS][prop] != null) {
							
							pushListener_(x, prop, cb);
							
							var cbs = pushListener_(obj, property, cb);
							if (cbs.length === 1) {
								var arr = parts.splice(0, i);
								if (arr.length !== 0) 
									attachProxy_(obj, property, cbs, arr, true);
							}
							return;
						}
					}
				}
				
				var cbs = pushListener_(obj, property, cb);
				if (cbs.length === 1) 
					attachProxy_(obj, property, cbs, parts, true);
				
				var val = obj_getProperty(obj, property),
					mutators = getSelfMutators(val);
				if (mutators != null) {
					objMutator_addObserver(
						val, mutators, cb
					);
				}
			};
			
			obj_hasObserver = function(obj, property, callback){
				// nested observer
				var parts = property.split('.'),
					imax  = parts.length,
					i = -1,
					x = obj;
				while ( ++i < imax ) {
					x = x[parts[i]];
					if (x == null) 
						break;
					
					if (x[prop_OBS] != null) {
						if (obj_hasObserver(x, parts.slice(i).join('.'), callback))
							return true;
						
						break;
					}
				}
				
				var obs = obj[prop_OBS];
				if (obs == null || obs[property] == null) 
					return false;
				
				return arr_contains(obs[property], callback);
			};
			
			obj_removeObserver = function(obj, property, callback) {
				// nested observer
				var parts = property.split('.'),
					imax  = parts.length,
					i = -1,
					x = obj;
				while ( ++i < imax ) {
					x = x[parts[i]];
					if (x == null) 
						break;
					
					if (x[prop_OBS] != null) {
						obj_removeObserver(x, parts.slice(i).join('.'), callback);
						break;
					}
				}
				
				
				var obs = obj_ensureObserversProperty(obj, property),
					val = obj_getProperty(obj, property);
				if (callback === void 0) {
					// callback not provided -> remove all observers	
					obs.length = 0;
				} else {
					arr_remove(obs, callback);
				}
			
				var mutators = getSelfMutators(val);
				if (mutators != null) 
					objMutator_removeObserver(val, mutators, callback)
				
			};
			obj_lockObservers = function(obj) {
				var obs = obj[prop_OBS];
				if (obs != null) 
					obs[prop_DIRTY] = {};
			};	
			obj_unlockObservers = function(obj) {
				var obs = obj[prop_OBS],
					dirties = obs == null ? null : obs[prop_DIRTY];
				if (dirties == null)
					return;
				
				obs[prop_DIRTY] = null;
				
				var prop, cbs, val, imax, i;
				for(prop in dirties) {
					cbs = obj[prop_OBS][prop];
					imax = cbs == null ? 0 : cbs.length;
					if (imax === 0) 
						continue;
					
					i = -1;
					val = prop === prop_MUTATORS
							? obj
							: obj_getProperty(obj, prop)
							;
					while ( ++i < imax ) {
						cbs[i](val);
					}
				}
			};
		
			obj_ensureObserversProperty = function(obj, type){
				var obs = obj[prop_OBS];
				if (obs == null) {
					obs = {
						__dirty: null,
						__dfrTimeout: null,
						__mutators: null
					};
					defineProp_(obj, '__observers', {
						value: obs,
						enumerable: false
					});
				}
				if (type == null) 
					return obs;
				
				var arr = obs[type];
				return arr == null
					? (obs[type] = [])
					: arr
					;
			};
			
			obj_addMutatorObserver = function(obj, cb){
				var mutators = getSelfMutators(obj);
				if (mutators != null) 
					objMutator_addObserver(obj,  mutators, cb);
			};
			obj_removeMutatorObserver = function(obj, cb){
				objMutator_removeObserver(obj, null, cb);
			};
			
			// PRIVATE
			var prop_OBS = '__observers',
				prop_MUTATORS = '__mutators',
				prop_TIMEOUT = '__dfrTimeout',
				prop_DIRTY = '__dirty';
				
			var defineProp_ = Object.defineProperty;
				
			
			//Resolve object, or if property do not exists - create
			function ensureProperty_(obj, chain) {
				var i = -1,
					imax = chain.length - 1,
					key
					;
				while ( ++i < imax ) {
					key = chain[i];
			
					if (obj[key] == null) 
						obj[key] = {};
					
					obj = obj[key];
				}
				return obj;
			}
			function getSelfMutators(obj) {
				if (obj == null || typeof obj !== 'object') 
					return null;
				
				if (typeof obj.length === 'number' && typeof obj.slice === 'function') 
					return MUTATORS_.Array;
				if (typeof obj.toUTCString === 'function') 
					return MUTATORS_.Date;
				
				return null;
			}
			var MUTATORS_ = {
				Array: {
					throttle: false,
					methods: [
						// native mutators
						'push',
						'unshift',
						'splice',
						'pop',
						'shift',
						'reverse',
						'sort',
						// collection mutators
						'remove'
					]
				},
				Date: {
					throttle: true,
					methods: [
						'setDate',
						'setFullYear',
						'setHours',
						'setMilliseconds',
						'setMinutes',
						'setMonth',
						'setSeconds',
						'setTime',
						'setUTCDate',
						'setUTCFullYear',
						'setUTCHours',
						'setUTCMilliseconds',
						'setUTCMinutes',
						'setUTCMonth',
						'setUTCSeconds',
					]
				}
			};
			function attachProxy_(obj, property, cbs, chain) {
				var length = chain.length,
					parent = length > 1
						? ensureProperty_(obj, chain)
						: obj,
					key = chain[length - 1],
					currentVal = parent[key];
					
				if (length > 1) {
					obj_defineCrumbs(obj, chain);
				}
				
				
				if ('length' === key) {
					var mutators = getSelfMutators(parent);
					if (mutators != null) {
						objMutator_addObserver(
							parent, mutators, function(){
								var imax = cbs.length,
									i = -1
									;
								while ( ++i < imax ) {
									cbs[i].apply(null, arguments);
								}
							});
						return currentVal;
					}
					
				}
				
				defineProp_(parent, key, {
					get: function() {
						return currentVal;
					},
					set: function(x) {
						if (x === currentVal) 
							return;
						currentVal = x;
						var i = 0,
							imax = cbs.length,
							mutators = getSelfMutators(x);
						if (mutators != null) {
							for(; i < imax; i++) {
								objMutator_addObserver(
									x, mutators, cbs[i]
								);
							}
						}
						
						if (obj[prop_OBS][prop_DIRTY] != null) {
							obj[prop_OBS][prop_DIRTY][property] = 1;
							return;
						}
			
						for (i = 0; i < imax; i++) {
							cbs[i](x);
						}
					},
					configurable: true,
					enumerable : true
				});
				
				return currentVal;
			}
			
			function obj_defineCrumbs(obj, chain) {
				var rebinder = obj_crumbRebindDelegate(obj),
					path = '',
					key;
				
				var imax = chain.length - 1,
					i = 0;
				for(; i < imax; i++) {
					key = chain[i];
					path += key + '.';
					
					obj_defineCrumb(path, obj, key, rebinder);
					obj = obj[key];
				}
			}
			
			function obj_defineCrumb(path, obj, key, rebinder) {
					
				var value = obj[key],
					old;
				
				defineProp_(obj, key, {
					get: function() {
						return value;
					},
					set: function(x) {
						if (x === value) 
							return;
						
						old = value;
						value = x;
						rebinder(path, old);
					},
					configurable: true,
					enumerable : true
				});
			}
			
			function obj_crumbRebindDelegate(obj) {
				return function(path, oldValue){
					
					var observers = obj[prop_OBS];
					if (observers == null) 
						return;
					
					for (var property in observers) {
						
						if (property.indexOf(path) !== 0) 
							continue;
						
						var listeners = observers[property].slice(0),
							imax = listeners.length,
							i = 0;
						
						if (imax === 0) 
							continue;
						
						var val = obj_getProperty(obj, property),
							cb, oldProp;
						
						for (i = 0; i < imax; i++) {
							cb = listeners[i];
							obj_removeObserver(obj, property, cb);
							
							oldProp = property.substring(path.length);
							obj_removeObserver(oldValue, oldProp, cb);
						}
						for (i = 0; i < imax; i++){
							listeners[i](val);
						}
						
						for (i = 0; i < imax; i++){
							obj_addObserver(obj, property, listeners[i]);
						}
						
					}
				}
			}
			
			// Create Collection - Check If Exists - Add Listener
			function pushListener_(obj, property, cb) {
				var obs = obj_ensureObserversProperty(obj, property);
				if (arr_contains(obs, cb) === false) 
					obs.push(cb);
				return obs;
			}
			
			var objMutator_addObserver,
				objMutator_removeObserver;
			(function(){
				objMutator_addObserver = function(obj, mutators, cb){
					var methods = mutators.methods,
						throttle = mutators.throttle,
						obs = obj_ensureObserversProperty(obj, prop_MUTATORS);
					if (obs.length === 0) {
						var imax = methods.length,
							i = -1,
							method, fn;
						while( ++i < imax ){
							method = methods[i];
							fn = obj[method];
							if (fn == null) 
								continue;
							
							obj[method] = objMutator_createWrapper_(
								obj
								, fn
								, method
								, throttle
							);
						}
					}
					obs[obs.length++] = cb;
				};
				objMutator_removeObserver = function(obj, mutators, cb){
					var obs = obj_ensureObserversProperty(obj, prop_MUTATORS);
					if (cb === void 0) {
						obs.length = 0;
						return;
					}
					arr_remove(obs, cb);
				};
				
				function objMutator_createWrapper_(obj, originalFn, method, throttle) {
					var fn = throttle === true ? callDelayed : call;
					return function() {
						return fn(
							obj,
							originalFn,
							method,
							_Array_slice.call(arguments)
						);
					};
				}
				function call(obj, original, method, args) {
					var cbs = obj_ensureObserversProperty(obj, prop_MUTATORS),
						result = original.apply(obj, args);
					
					tryNotify(obj, cbs, method, args, result);
					return result;
				}
				function callDelayed(obj, original, method, args) {
					var cbs = obj_ensureObserversProperty(obj, prop_MUTATORS),
						result = original.apply(obj, args);
					
					var obs = obj[prop_OBS];
					if (obs[prop_TIMEOUT] != null) 
						return result;
					
					obs[prop_TIMEOUT] = setTimeout(function(){
						obs[prop_TIMEOUT] = null;
						tryNotify(obj, cbs, method, args, result);
					});
					return result;
				}
				
				function tryNotify(obj, cbs, method, args, result){
					if (cbs.length === 0) 
						return;
					
					var obs = obj[prop_OBS];
					if (obs[prop_DIRTY] != null) {
						obs[prop_DIRTY][prop_MUTATORS] = 1;
						return;
					}
					var imax = cbs.length,
						i = -1,
						x;
					while ( ++i < imax ){
						x = cbs[i];
						if (typeof x === 'function') {
							x(obj, method, args, result);
						}
					}
				}
			}());
			
		}());
		// end:source ../src/util/object.observe.js
		// source ../src/util/date.js
		var date_ensure;
		(function(){
			date_ensure = function(val){
				if (val == null || val === '') 
					return null;
				if (typeof val === 'string') 
					val = new Date(val);
					
				return isNaN(val) === false && typeof val.getFullYear === 'function'
					? val
					: null
					;
			};
		}());
		// end:source ../src/util/date.js
		// source ../src/util/dom.js
		
		function dom_removeElement(node) {
			return node.parentNode.removeChild(node);
		}
		
		function dom_removeAll(array) {
			if (array == null) 
				return;
			
			var imax = array.length,
				i = -1;
			while ( ++i < imax ) {
				dom_removeElement(array[i]);
			}
		}
		
		function dom_insertAfter(element, anchor) {
			return anchor.parentNode.insertBefore(element, anchor.nextSibling);
		}
		
		function dom_insertBefore(element, anchor) {
			return anchor.parentNode.insertBefore(element, anchor);
		}
		
		
		
		
		// end:source ../src/util/dom.js
		// source ../src/util/compo.js
		var compo_fragmentInsert,
			compo_render,
			compo_dispose,
			compo_inserted,
			compo_attachDisposer
			;
		(function(){
			
			compo_fragmentInsert = function(compo, index, fragment, placeholder) {
				if (compo.components == null) 
					return dom_insertAfter(fragment, placeholder || compo.placeholder);
				
				var compos = compo.components,
					anchor = null,
					insertBefore = true,
					imax = compos.length,
					i = index - 1,
					elements;
				
				if (anchor == null) {
					while (++i < imax) {
						elements = compos[i].elements;
				
						if (elements && elements.length) {
							anchor = elements[0];
							break;
						}
					}
				}
				if (anchor == null) {
					insertBefore = false;
					i = index < imax
						? index
						: imax
						;
					while (--i > -1) {
						elements = compos[i].elements;
						if (elements && elements.length) {
							anchor = elements[elements.length - 1];
							break;
						}
					}
				}
				if (anchor == null) 
					anchor = placeholder || compo.placeholder;
				
				if (insertBefore) 
					return dom_insertBefore(fragment, anchor);
				
				return dom_insertAfter(fragment, anchor);
			};
			
			compo_render = function(parentCtr, template, model, ctx, container) {
				return mask.render(template, model, ctx, container, parentCtr);
			};
			
			compo_dispose = function(compo, parent) {
				if (compo == null) 
					return false;
				
				if (compo.elements != null) {
					dom_removeAll(compo.elements);
					compo.elements = null;
				}
				__Compo.dispose(compo);
				
				var compos = (parent && parent.components) || (compo.parent && compo.parent.components);
				if (compos == null) {
					log_error('Parent Components Collection is undefined');
					return false;
				}
				return arr_remove(compos, compo);
			};
			
			compo_inserted = function(compo) {
				__Compo.signal.emitIn(compo, 'domInsert');
			};
			
			compo_attachDisposer = function(ctr, disposer) {
				if (typeof ctr.dispose === 'function') {
					var previous = ctr.dispose;
					ctr.dispose = function(){
						disposer.call(this);
						previous.call(this);
					};
			
					return;
				}
				ctr.dispose = disposer;
			};
		
		}());
		// end:source ../src/util/compo.js
		// source ../src/util/expression.js
		var expression_eval,
			expression_eval_strict,
			expression_bind,
			expression_unbind,
			expression_createBinder,
			expression_createListener,
			
			expression_parse,
			expression_varRefs
			;
			
		(function(){
			var Expression = mask.Utils.Expression;
		
			expression_eval_strict = Expression.eval;
			expression_parse = Expression.parse;
			expression_varRefs = Expression.varRefs;
			
			expression_eval = function(expr, model, ctx, ctr){
				if (expr === '.') 
					return model;
				
				var x = expression_eval_strict(expr, model, ctx, ctr);
				return x == null ? '' : x;
			};
				
			expression_bind = function(expr, model, ctx, ctr, callback) {
				if (expr === '.') {
					obj_addMutatorObserver(model, callback);
					return;
				}
				
				var ast = expression_parse(expr),
					vars = expression_varRefs(ast, model, ctx, ctr),
					obj, ref;
			
				if (vars == null) 
					return;
				
				if (typeof vars === 'string') {
					_toggleObserver(obj_addObserver, model, ctr, vars, callback);
					return;
				}
			
				var isArray = vars.length != null && typeof vars.splice === 'function',
					imax = isArray === true ? vars.length : 1,
					i = 0,
					x, prop;
				
				for (; i < imax; i++) {
					x = isArray === true ? vars[i] : vars;
					_toggleObserver(obj_addObserver, model, ctr, x, callback);
				}
			};
			
			expression_unbind = function(expr, model, ctr, callback) {
				
				if (typeof ctr === 'function') 
					log_warn('[mask.binding] - expression unbind(expr, model, controller, callback)');
				
				if (expr === '.') {
					obj_removeMutatorObserver(model, callback);
					return;
				}
				
				var vars = expression_varRefs(expr, model, null, ctr),
					x, ref;
			
				if (vars == null) 
					return;
				
				if (typeof vars === 'string') {
					_toggleObserver(obj_removeObserver, model, ctr, vars, callback);
					return;
				}
				
				var isArray = vars.length != null && typeof vars.splice === 'function',
					imax = isArray === true ? vars.length : 1,
					i = 0,
					x;
				
				for (; i < imax; i++) {
					x = isArray === true ? vars[i] : vars;
					_toggleObserver(obj_removeObserver, model, ctr, x, callback);
				}
			
			}
			
			/**
			 * expression_bind only fires callback, if some of refs were changed,
			 * but doesnt supply new expression value
			 **/
			expression_createBinder = function(expr, model, cntx, controller, callback) {
				var locks = 0;
				return function binder() {
					if (++locks > 1) {
						locks = 0;
						log_warn('<mask:bind:expression> Concurent binder detected', expr);
						return;
					}
					
					var value = expression_eval(expr, model, cntx, controller);
					if (arguments.length > 1) {
						var args = _Array_slice.call(arguments);
						
						args[0] = value;
						callback.apply(this, args);
						
					} else {
						
						callback(value);
					}
					
					locks--;
				};
			};
			
			expression_createListener = function(callback){
				var locks = 0;
				return function(){
					if (++locks > 1) {
						locks = 0;
						log_warn('<listener:expression> concurent binder');
						return;
					}
					
					callback();
					locks--;
				}
			};
			
			function _toggleObserver(mutatorFn, model, ctr, accessor, callback) {
				if (accessor == null) 
					return;
				
				if (typeof accessor === 'object') {
					var obj = expression_eval_strict(accessor.accessor, model, null, ctr);
					if (obj == null || typeof obj !== 'object') {
						console.error('Binding failed to an object over accessor', accessor.ref);
						return;
					}
					mutatorFn(obj, accessor.ref, callback);
					return;
				}
				
				// string;
				var property = accessor,
					parts = property.split('.'),
					imax = parts.length;
				
				if (imax > 1) {
					var first = parts[0];
					if (first === '$c') {
						// Controller Observer
						ctr = _getObservable_Controller(ctr, parts.slice(1), imax - 1);
						mutatorFn(ctr, property.substring(3), callback);
						return;
					}
					if ('$a' === first || '$ctx' === first) 
						return;
				}
				
				var obj = null;
				if (_isDefined(model, parts, imax)) {
					obj = model;
				}
				if (obj == null) {
					obj = _getObservable_Scope(ctr, parts, imax);
				}
				if (obj == null) {
					obj = model;
				}
				
				mutatorFn(obj, property, callback);
			}
			
			function _getObservable_Scope(ctr, parts, imax){
				var scope;
				while(ctr != null){
					scope = ctr.scope;
					if (scope != null && _isDefined(scope, parts, imax)) 
						return scope;
					
					ctr = ctr.parent;
				}
				return null;
			}
			function _getObservable_Controller(ctr, parts, imax) {
				while(ctr != null){
					if (_isDefined(ctr, parts, imax)) 
						return ctr;
					ctr = ctr.parent;
				}
				return ctr;
			}
			function _isDefined(obj, parts, imax){
				if (obj == null) 
					return false;
					
				var i = 0, val;
				for(; i < imax; i++) {
					obj = obj[parts[i]];
					if (obj == null) 
						return false;
				}
				return true;
			}
			
			
		}());
		
		
		
		// end:source ../src/util/expression.js
		// source ../src/util/signal.js
		var signal_parse,
			signal_create
			;
		
		(function(){
			
			
			signal_parse = function(str, isPiped, defaultType) {
				var signals = str.split(';'),
					set = [],
					i = 0,
					imax = signals.length,
					x,
					signalName, type,
					signal;
					
			
				for (; i < imax; i++) {
					x = signals[i].split(':');
					
					if (x.length !== 1 && x.length !== 2) {
						log_error('Too much ":" in a signal def.', signals[i]);
						continue;
					}
					
					
					type = x.length === 2 ? x[0] : defaultType;
					signalName = x[x.length === 2 ? 1 : 0];
					
					signal = signal_create(signalName.trim(), type, isPiped);
					
					if (signal != null) {
						set.push(signal);
					}
				}
				
				return set;
			};
			
			
			signal_create = function(signal, type, isPiped) {
				if (isPiped !== true) {
					return {
						signal: signal,
						type: type
					};
				}
				
				var index = signal.indexOf('.');
				if (index === -1) {
					log_error('No pipe name in a signal', signal);
					return null;
				}
				
				return {
					signal: signal.substring(index + 1),
					pipe: signal.substring(0, index),
					type: type
				};
			};
		}());
		
		// end:source ../src/util/signal.js
	
		// source ../src/bindingProvider.js
		// source ./DomObjectTransport.js
		var DomObjectTransport;
		(function(){
			
			var objectWay = {
				get: function(provider, expression) {
					var getter = provider.objGetter;
					if (getter == null) {
						return expression_eval(
							expression
							, provider.model
							, provider.ctx
							, provider.ctr
						);
					}
					
					var obj = getAccessorObject_(provider, getter);
					if (obj == null) 
						return null;
					
					return obj[getter](expression, provider.model, provider.ctr.parent);
				},
				set: function(obj, property, value, provider) {
					var setter = provider.objSetter;
					if (setter == null) {
						obj_setProperty(obj, property, value);
						return;
					}
					var ctx = getAccessorObject_(provider, setter);
					if (ctx == null) 
						return;
					
					ctx[setter](
						property
						, value
						, provider.model
						, provider.ctr.parent
					);
				}
			};
			var domWay  = {
				get: function(provider) {
					var getter = provider.domGetter;
					if (getter == null) {
						return obj_getProperty(provider, provider.property);
					}
					var ctr = provider.ctr.parent;
					if (isValidFn_(ctr, getter, 'Getter') === false) {
						return null;
					}
					return ctr[getter](provider.element);
				},
				set: function(provider, value) {
					var setter = provider.domSetter;
					if (setter == null) {
						obj_setProperty(provider, provider.property, value);
						return;
					}
					var ctr = provider.ctr.parent;
					if (isValidFn_(ctr, setter, 'Setter') === false) {
						return;
					}
					ctr[setter](value, provider.element);
				}
			};
			var DateTimeDelegate = {
				domSet: function(format){
					return function(prov, val){
						var date = date_ensure(val);
						prov.element.value = date == null ? '' : format(date);
					}
				},
				objSet: function(extend){
					return function(obj, prop, val){
						
						var date = date_ensure(val);
						if (date == null) 
							return;
						
						var target = date_ensure(obj_getProperty(obj, prop));
						if (target == null) {
							obj_setProperty(obj, prop, date);
							return;
						}
						extend(target, date);
					}
				}
			};
			
			DomObjectTransport = {
				// generic
				objectWay: objectWay,
				domWay: domWay,
				
				SELECT: {
					get: function(provider) {
						var el = provider.element,
							i = el.selectedIndex;
						if (i === -1) 
							return '';
						
						var opt = el.options[i],
							val = opt.getAttribute('value');
						return val == null
							? opt.getAttribute('name') /* obsolete */
							: val
							;
					},
					set: function(provider, val) {
						var el = provider.element,
							options = el.options,
							imax = options.length,
							opt, x, i;
						for(i = 0; i < imax; i++){
							opt = options[i];
							x = opt.getAttribute('value');
							if (x == null) 
								x = opt.getAttribute('name');
							
							/* jshint eqeqeq: false */
							if (x == val) {
								/* jshint eqeqeq: true */
								el.selectedIndex = i;
								return;
							}
						}
						log_warn('Value is not an option', val);
					}
				},
				DATE: {
					domWay: {
						get: domWay.get,
						set: function(prov, val){
							var date = date_ensure(val);
							prov.element.value = date == null ? '' : formatDate(date);
						}
					},
					objectWay: {
						get: objectWay.get,
						set: DateTimeDelegate.objSet(function(a, b){
							a.setFullYear(b.getFullYear());
							a.setMonth(b.getMonth());
							a.setDate(b.getDate());
						})
					}
				},
				TIME: {
					domWay: {
						get: domWay.get,
						set: DateTimeDelegate.domSet(formatTime)
					},
					objectWay: {
						get: objectWay.get,
						set: DateTimeDelegate.objSet(function(a, b){
							a.setHours(b.getHours())
							a.setMinutes(b.getMinutes());
							a.setSeconds(b.getSeconds());
						})
					}
				}
				
			};
			
			function isValidFn_(obj, prop, name) {
				if (obj== null || typeof obj[prop] !== 'function') {
					log_error('BindingProvider.', name, 'should be a function. Property:', prop);
					return false;
				}
				return true;
			}
			function getAccessorObject_(provider, accessor) {
				var ctr = provider.ctr.parent;
				if (ctr[accessor] != null) 
					return ctr;
				var model = provider.model;
				if (model[accessor] != null) 
					return model;
				
				log_error('BindingProvider. Accessor `', accessor, '`should be a function');
				return null;
			}
			function formatDate(date) {
				var YYYY = date.getFullYear(),
					MM = date.getMonth() + 1,
					DD = date.getDate();
				return YYYY
					+ '-'
					+ (MM < 10 ? '0' : '')
					+ (MM)
					+ '-'
					+ (DD < 10 ? '0' : '')
					+ (DD)
					;
			}
			function formatTime(date) {
				var H = date.getHours(),
					M = date.getMinutes();
				return H
					+ ':'
					+ (M < 10 ? '0' : '')
					+ (M)
					;
			}
		}());
		
		// end:source ./DomObjectTransport.js
		// source ./CustomProviders.js
		var CustomProviders = {};
		
		mask.registerBinding = function(name, Prov) {
			CustomProviders[name] = Prov;
		};
		// end:source ./CustomProviders.js
		
		var BindingProvider;
		(function() {
			
			mask.BindingProvider =
			BindingProvider =
			function BindingProvider(model, element, ctr, bindingType) {
				if (bindingType == null) 
					bindingType = ctr.compoName === ':bind' ? 'single' : 'dual';
				
				var attr = ctr.attr,
					type;
		
				this.node = ctr; // backwards compat.
				this.ctr = ctr;
				this.ctx = null;
		
				this.model = model;
				this.element = element;
				this.value = attr.value;
				this.property = attr.property;
				this.domSetter = attr.setter || attr['dom-setter'];
				this.domGetter = attr.getter || attr['dom-getter'];
				this.objSetter = attr['obj-setter'];
				this.objGetter = attr['obj-getter'];
				
				/* Convert to an instance, e.g. Number, on domchange event */
				this['typeof'] = attr['typeof'] || null;
				
				this.dismiss = 0;
				this.bindingType = bindingType;
				this.log = false;
				this.signal_domChanged = null;
				this.signal_objectChanged = null;
				this.locked = false;
				
				
				if (this.property == null && this.domGetter == null) {
		
					switch (element.tagName) {
						case 'INPUT':
							type = element.getAttribute('type');
							if ('checkbox' === type) {
								this.property = 'element.checked';
								break;
							}
							if ('date' === type) {
								var x = DomObjectTransport.DATE;
								this.domWay = x.domWay;
								this.objectWay = x.objectWay;
							}
							if ('number' === type) 
								this['typeof'] = 'Number';
							
							this.property = 'element.value';
							break;
						case 'TEXTAREA':
							this.property = 'element.value';
							break;
						case 'SELECT':
							this.domWay = DomObjectTransport.SELECT;
							break;
						default:
							this.property = 'element.innerHTML';
							break;
					}
				}
		
				if (attr['log']) {
					this.log = true;
					if (attr.log !== 'log') {
						this.logExpression = attr.log;
					}
				}
		
				/**
				 *	Send signal on OBJECT or DOM change
				 */
				if (attr['x-signal']) {
					var signal = signal_parse(attr['x-signal'], null, 'dom')[0],
						signalType = signal && signal.type;
					
					switch(signalType){
						case 'dom':
						case 'object':
							this['signal_' + signalType + 'Changed'] = signal.signal;
							break;
						default:
							log_error('Signal typs is not supported', signal);
							break;
					}
					
					
				}
				
				if (attr['x-pipe-signal']) {
					var signal = signal_parse(attr['x-pipe-signal'], true, 'dom')[0],
						signalType = signal && signal.type;
						
					switch(signalType){
						case 'dom':
						case 'object':
							this['pipe_' + signalType + 'Changed'] = signal;
							break;
						default:
							log_error('Pipe type is not supported');
							break;
					}
				}
				
				
				if (attr['dom-slot']) {
					this.slots = {};
					// @hack - place dualb. provider on the way of a signal
					// 
					var parent = ctr.parent,
						newparent = parent.parent;
						
					parent.parent = this;
					this.parent = newparent;
					
					this.slots[attr['dom-slot']] = function(sender, value){
						this.domChanged(sender, value);
					}
				}
				
				/*
				 *  @obsolete: attr name : 'x-pipe-slot'
				 */
				var pipeSlot = attr['object-pipe-slot'] || attr['x-pipe-slot'];
				if (pipeSlot) {
					var str = pipeSlot,
						index = str.indexOf('.'),
						pipeName = str.substring(0, index),
						signal = str.substring(index + 1);
					
					this.pipes = {};
					this.pipes[pipeName] = {};
					this.pipes[pipeName][signal] = function(){
						this.objectChanged();
					};
					
					__Compo.pipe.addController(this);
				}
		
		
				if (attr.expression) {
					this.expression = attr.expression;
					if (this.value == null && bindingType !== 'single') {
						var refs = expression_varRefs(this.expression);
						if (typeof refs === 'string') {
							this.value = refs;
						} else {
							log_warn('Please set value attribute in DualBind Control.');
						}
					}
					return;
				}
				
				this.expression = this.value;
			};
			
			BindingProvider.create = function(model, el, ctr, bindingType) {
		
				/* Initialize custom provider */
				var type = ctr.attr.bindingProvider,
					CustomProvider = type == null ? null : CustomProviders[type],
					provider;
		
				if (typeof CustomProvider === 'function') {
					return new CustomProvider(model, el, ctr, bindingType);
				}
		
				provider = new BindingProvider(model, el, ctr, bindingType);
		
				if (CustomProvider != null) {
					obj_extend(provider, CustomProvider);
				}
				return provider;
			};
			
			BindingProvider.bind = function(provider){
				return apply_bind(provider);
			};
		
			BindingProvider.prototype = {
				constructor: BindingProvider,
				
				dispose: function() {
					expression_unbind(this.expression, this.model, this.ctr, this.binder);
				},
				objectChanged: function(x) {
					if (this.dismiss-- > 0) {
						return;
					}
					if (this.locked === true) {
						log_warn('Concurance change detected', this);
						return;
					}
					this.locked = true;
		
					if (x == null) {
						x = this.objectWay.get(this, this.expression);
					}
		
					this.domWay.set(this, x);
		
					if (this.log) {
						console.log('[BindingProvider] objectChanged -', x);
					}
					if (this.signal_objectChanged) {
						signal_emitOut(this.ctr, this.signal_objectChanged, [x]);
					}
					
					if (this.pipe_objectChanged) {
						var pipe = this.pipe_objectChanged;
						__Compo.pipe(pipe.pipe).emit(pipe.signal);
					}
		
					this.locked = false;
				},
				domChanged: function(event, value) {
					if (this.locked === true) {
						log_warn('Concurance change detected', this);
						return;
					}
					this.locked = true;
		
					if (value == null) 
						value = this.domWay.get(this);
					
					var typeof_ = this['typeof'];
					if (typeof_ != null) {
						var Converter = window[typeof_];
						value = Converter(value);
					}
					
					var isValid = true,
						validations = this.ctr.validations;
					if (validations) {
						var imax = validations.length,
							i = -1, x;
						while( ++i < imax ) {
							x = validations[i];
							if (x.validate(value, this.element, this.objectChanged.bind(this)) === false) {
								isValid = false;
								break;
							}
						}
					}
					if (isValid) {
						this.dismiss = 1;
						this.objectWay.set(this.model, this.value, value, this);
						this.dismiss = 0;
		
						if (this.log) {
							console.log('[BindingProvider] domChanged -', value);
						}
						if (this.signal_domChanged) {
							signal_emitOut(this.ctr, this.signal_domChanged, [value]);
						}
						if (this.pipe_domChanged) {
							var pipe = this.pipe_domChanged;
							__Compo.pipe(pipe.pipe).emit(pipe.signal);
						}	
					}
					this.locked = false;
				},
				
				objectWay: DomObjectTransport.objectWay,
				domWay: DomObjectTransport.domWay
			};
			
			function apply_bind(provider) {
		
				var expr = provider.expression,
					model = provider.model,
					onObjChanged = provider.objectChanged = provider.objectChanged.bind(provider);
		
				provider.binder = expression_createBinder(expr, model, provider.ctx, provider.ctr, onObjChanged);
		
				expression_bind(expr, model, provider.ctx, provider.ctr, provider.binder);
		
				if (provider.bindingType === 'dual') {
					var attr = provider.ctr.attr;
					
					if (!attr['change-slot'] && !attr['change-pipe-event']) {
						var element = provider.element,
							/*
							 * @obsolete: attr name : 'changeEvent'
							 */
							eventType = attr['change-event'] || attr.changeEvent || 'change',
							onDomChange = provider.domChanged.bind(provider);
			
						__dom_addEventListener(element, eventType, onDomChange);
					}
					
						
					if (!provider.objectWay.get(provider, provider.expression)) {
						// object has no value, so check the dom
						setTimeout(function(){
							if (provider.domWay.get(provider))
								// and apply when exists
								provider.domChanged();	
						});
						return provider;
					}
				}
		
				// trigger update
				provider.objectChanged();
				return provider;
			}
		
			function signal_emitOut(ctr, signal, args) {
				if (ctr == null) 
					return;
				
				var slots = ctr.slots;
				if (slots != null && typeof slots[signal] === 'function') {
					if (slots[signal].apply(ctr, args) === false) 
						return;
				}
				
				signal_emitOut(ctr.parent, signal, args);
			}
		
			obj_extend(BindingProvider, {
				addObserver: obj_addObserver,
				removeObserver: obj_removeObserver
			});
		}());
		
		// end:source ../src/bindingProvider.js
	
		// source ../src/mask-handler/visible.js
		/**
		 * visible handler. Used to bind directly to display:X/none
		 *
		 * attr =
		 *    check - expression to evaluate
		 *    bind - listen for a property change
		 */
		
		function VisibleHandler() {}
		
		__mask_registerHandler(':visible', VisibleHandler);
		
		
		VisibleHandler.prototype = {
			constructor: VisibleHandler,
		
			refresh: function(model, container) {
				container.style.display = expression_eval(this.attr.check, model) ? '' : 'none';
			},
			renderStart: function(model, cntx, container) {
				this.refresh(model, container);
		
				if (this.attr.bind) {
					obj_addObserver(model, this.attr.bind, this.refresh.bind(this, model, container));
				}
			}
		};
		
		// end:source ../src/mask-handler/visible.js
		// source ../src/mask-handler/bind.js
		/**
		 *  Mask Custom Tag Handler
		 *	attr =
		 *		attr: {String} - attribute name to bind
		 *		prop: {Stirng} - property name to bind
		 *		- : {default} - innerHTML
		 */
		
		
		
		(function() {
		
			function Bind() {}
		
			__mask_registerHandler(':bind', Bind);
		
			Bind.prototype = {
				constructor: Bind,
				renderEnd: function(els, model, cntx, container){
					
					this.provider = BindingProvider.create(model, container, this, 'single');
					
					BindingProvider.bind(this.provider);
				},
				dispose: function(){
					if (this.provider && typeof this.provider.dispose === 'function') {
						this.provider.dispose();
					}
				}
			};
		
		
		}());
		
		// end:source ../src/mask-handler/bind.js
		// source ../src/mask-handler/dualbind.js
		/**
		 *	Mask Custom Handler
		 *
		 *	2 Way Data Model binding
		 *
		 *
		 *	attr =
		 *		value: {string} - property path in object
		 *		?property : {default} 'element.value' - value to get/set from/to HTMLElement
		 *		?changeEvent: {default} 'change' - listen to this event for HTMLELement changes
		 *
		 *		?setter: {string} - setter function of a parent controller
		 *		?getter: {string} - getter function of a parent controller
		 *
		 *
		 */
		
		function DualbindHandler() {}
		
		__mask_registerHandler(':dualbind', DualbindHandler);
		
		
		
		DualbindHandler.prototype = {
			constructor: DualbindHandler,
		
			renderEnd: function(elements, model, cntx, container) {
				this.provider = BindingProvider.create(model, container, this);
		
				if (this.components) {
					for (var i = 0, x, length = this.components.length; i < length; i++) {
						x = this.components[i];
		
						if (x.compoName === ':validate') {
							(this.validations || (this.validations = []))
								.push(x);
						}
					}
				}
		
				if (!this.attr['no-validation'] && !this.validations) {
					var Validate = model.Validate,
						prop = this.provider.value;
		
					if (Validate == null && prop.indexOf('.') !== -1) {
						var parts = prop.split('.'),
							i = 0,
							imax = parts.length,
							obj = model[parts[0]];
						while (Validate == null && ++i < imax && obj) {
							Validate = obj.Validate;
							obj = obj[parts[i]]
						}
						prop = parts.slice(i).join('.');
					}
		
					var validator = Validate && Validate[prop];
					if (typeof validator === 'function') {
		
						validator = mask
							.getHandler(':validate')
							.createCustom(container, validator);
		
						(this.validations || (this.validations = []))
							.push(validator);
		
					}
				}
		
		
				BindingProvider.bind(this.provider);
			},
			dispose: function() {
				if (this.provider && typeof this.provider.dispose === 'function') {
					this.provider.dispose();
				}
			},
		
			handlers: {
				attr: {
					'x-signal': function() {}
				}
			}
		};
		// end:source ../src/mask-handler/dualbind.js
		// source ../src/mask-handler/validate.js
		(function() {
			
			var class_INVALID = '-validate-invalid';
		
			mask.registerValidator = function(type, validator) {
				Validators[type] = validator;
			};
		
			function Validate() {}
		
			__mask_registerHandler(':validate', Validate);
		
		
		
		
			Validate.prototype = {
				constructor: Validate,
		        attr: {},
				renderStart: function(model, cntx, container) {
					this.element = container;
					
					if (this.attr.value) {
						var validatorFn = Validate.resolveFromModel(model, this.attr.value);
							
						if (validatorFn) {
							this.validators = [new Validator(validatorFn)];
						}
					}
				},
				/**
				 * @param input - {control specific} - value to validate
				 * @param element - {HTMLElement} - (optional, @default this.element) -
				 *				Invalid message is schown(inserted into DOM) after this element
				 * @param oncancel - {Function} - Callback function for canceling
				 *				invalid notification
				 */
				validate: function(input, element, oncancel) {
					if (element == null){
						element = this.element;
					}
		
					if (this.attr) {
						
						if (input == null && this.attr.getter) {
							input = obj_getProperty({
								node: this,
								element: element
							}, this.attr.getter);
						}
						
						if (input == null && this.attr.value) {
							input = obj_getProperty(this.model, this.attr.value);
						}
					}
					
					
		
					if (this.validators == null) {
						this.initValidators();
					}
		
					for (var i = 0, x, imax = this.validators.length; i < imax; i++) {
						x = this.validators[i].validate(input)
						
						if (x && !this.attr.silent) {
							this.notifyInvalid(element, x, oncancel);
							return false;
						}
					}
		
					this.makeValid(element);
					return true;
				},
				notifyInvalid: function(element, message, oncancel){
					return notifyInvalid(element, message, oncancel);
				},
				makeValid: function(element){
					return makeValid(element);
				},
				initValidators: function() {
					this.validators = [];
					
					for (var key in this.attr) {
						
						
						switch (key) {
							case 'message':
							case 'value':
							case 'getter':
								continue;
						}
						
						if (key in Validators === false) {
							log_error('Unknown Validator:', key, this);
							continue;
						}
						
						var x = Validators[key];
						
						this.validators.push(new Validator(x(this.attr[key], this), this.attr.message));
					}
				}
			};
		
			
			Validate.resolveFromModel = function(model, property){
				return obj_getProperty(model.Validate, property);
			};
			
			Validate.createCustom = function(element, validator){
				var validate = new Validate();
				
				validate.element = element;
				validate.validators = [new Validator(validator)];
				
				return validate;
			};
			
			
			function Validator(fn, defaultMessage) {
				this.fn = fn;
				this.message = defaultMessage;
			}
			Validator.prototype.validate = function(value){
				var result = this.fn(value);
				
				if (result === false) {
					return this.message || ('Invalid - ' + value);
				}
				return result;
			};
			
		
			function notifyInvalid(element, message, oncancel) {
				log_warn('Validate Notification:', element, message);
		
				var next = domLib(element).next('.' + class_INVALID);
				if (next.length === 0) {
					next = domLib('<div>')
						.addClass(class_INVALID)
						.html('<span></span><button>cancel</button>')
						.insertAfter(element);
				}
		
				return next
					.children('button')
					.off()
					.on('click', function() {
						next.hide();
						oncancel && oncancel();
			
					})
					.end()
					.children('span').text(message)
					.end()
					.show();
			}
		
			function makeValid(element) {
				return domLib(element).next('.' + class_INVALID).hide();
			}
		
			__mask_registerHandler(':validate:message', Compo({
				template: 'div.' + class_INVALID + ' { span > "~[bind:message]" button > "~[cancel]" }',
				
				onRenderStart: function(model){
					if (typeof model === 'string') {
						model = {
							message: model
						};
					}
					
					if (!model.cancel) {
						model.cancel = 'cancel';
					}
					
					this.model = model;
				},
				compos: {
					button: '$: button',
				},
				show: function(message, oncancel){
					var that = this;
					
					this.model.message = message;
					this.compos.button.off().on(function(){
						that.hide();
						oncancel && oncancel();
						
					});
					
					this.$.show();
				},
				hide: function(){
					this.$.hide();
				}
			}));
			
			
			var Validators = {
				match: function(match) {
					
					return function(str){
						return new RegExp(match).test(str);
					};
				},
				unmatch:function(unmatch) {
					
					return function(str){
						return !(new RegExp(unmatch).test(str));
					};
				},
				minLength: function(min) {
					
					return function(str){
						return str.length >= parseInt(min, 10);
					};
				},
				maxLength: function(max) {
					
					return function(str){
						return str.length <= parseInt(max, 10);
					};
				},
				check: function(condition, node){
					
					return function(str){
						return expression_eval('x' + condition, node.model, {x: str}, node);
					};
				}
				
		
			};
		
		
		
		}());
		
		// end:source ../src/mask-handler/validate.js
		// source ../src/mask-handler/validate.group.js
		function ValidateGroup() {}
		
		__mask_registerHandler(':validate:group', ValidateGroup);
		
		
		ValidateGroup.prototype = {
			constructor: ValidateGroup,
			validate: function() {
				var validations = getValidations(this);
		
		
				for (var i = 0, x, length = validations.length; i < length; i++) {
					x = validations[i];
					if (!x.validate()) {
						return false;
					}
				}
				return true;
			}
		};
		
		function getValidations(component, out){
			if (out == null){
				out = [];
			}
		
			if (component.components == null){
				return out;
			}
			var compos = component.components;
			for(var i = 0, x, length = compos.length; i < length; i++){
				x = compos[i];
		
				if (x.compoName === 'validate'){
					out.push(x);
					continue;
				}
		
				getValidations(x);
			}
			return out;
		}
		
		// end:source ../src/mask-handler/validate.group.js
	
		// source ../src/mask-util/bind.js
		/**
		 *	Mask Custom Utility - for use in textContent and attribute values
		 */
		(function(){
			
			function attr_strReplace(attrValue, currentValue, newValue) {
				if (!attrValue) 
					return newValue;
				
				if (currentValue == null || currentValue === '') 
					return attrValue + ' ' + newValue;
				
				return attrValue.replace(currentValue, newValue);
			}
		
			function refresherDelegate_NODE(element){
				return function(value) {
					element.textContent = value;
				};
			}
			function refresherDelegate_ATTR(element, attrName, currentValue) {
				return function(value){
					var currentAttr = element.getAttribute(attrName),
						attr = attr_strReplace(currentAttr, currentValue, value);
		
					element.setAttribute(attrName, attr);
					currentValue = value;
				};
			}
			function refresherDelegate_PROP(element, attrName, currentValue) {
				return function(value){
					switch(typeof element[attrName]) {
						case 'boolean':
							currentValue = element[attrName] = !!value;
							return;
						case 'number':
							currentValue = element[attrName] = Number(value);
							return;
						case 'string':
							currentValue = element[attrName] = attr_strReplace(element[attrName], currentValue, value);
							return;
						default:
							log_warn('Unsupported elements property type', attrName);
							return;
					}
				};
			}
			
			function create_refresher(type, expr, element, currentValue, attrName) {
				if ('node' === type) {
					return refresherDelegate_NODE(element);
				}
				if ('attr' === type) {
					switch(attrName) {
						case 'value':
						case 'disabled':
						case 'checked':
						case 'selected':
						case 'selectedIndex':
							return refresherDelegate_PROP(element, attrName, currentValue);
					}
					return refresherDelegate_ATTR(element, attrName, currentValue);
				}
				throw Error('Unexpected binder type: ' + type);
			}
		
		
			function bind (current, expr, model, ctx, element, controller, attrName, type){
				var	refresher =  create_refresher(type, expr, element, current, attrName),
					binder = expression_createBinder(expr, model, ctx, controller, refresher);
			
				expression_bind(expr, model, ctx, controller, binder);
			
			
				compo_attachDisposer(controller, function(){
					expression_unbind(expr, model, controller, binder);
				});
			}
		
			__mask_registerUtil('bind', {
				mode: 'partial',
				current: null,
				element: null,
				nodeRenderStart: function(expr, model, ctx, element, controller){
					
					var current = expression_eval(expr, model, ctx, controller);
					
					// though we apply value's to `this` context, but it is only for immediat use
					// in .node() function, as `this` context is a static object that share all bind
					// utils
					this.element = document.createTextNode(current);
					
					return (this.current = current);
				},
				node: function(expr, model, ctx, element, controller){
					bind(
						this.current,
						expr,
						model,
						ctx,
						this.element,
						controller,
						null,
						'node');
					
					return this.element;
				},
				
				attrRenderStart: function(expr, model, ctx, element, controller){
					return (this.current = expression_eval(expr, model, ctx, controller));
				},
				attr: function(expr, model, ctx, element, controller, attrName){
					bind(
						this.current,
						expr,
						model,
						ctx,
						element,
						controller,
						attrName,
						'attr');
					
					return this.current;
				}
			});
		
		}());
		
		// end:source ../src/mask-util/bind.js
		
		// source ../src/mask-attr/xxVisible.js
		
		
		__mask_registerAttrHandler('xx-visible', function(node, attrValue, model, cntx, element, controller) {
			
			var binder = expression_createBinder(attrValue, model, cntx, controller, function(value){
				element.style.display = value ? '' : 'none';
			});
			
			expression_bind(attrValue, model, cntx, controller, binder);
			
			compo_attachDisposer(controller, function(){
				expression_unbind(attrValue, model,  controller, binder);
			});
			
			
			
			if (!expression_eval(attrValue, model, cntx, controller)) {
				
				element.style.display = 'none';
			}
		});
		// end:source ../src/mask-attr/xxVisible.js
		// source ../src/mask-attr/xToggle.js
		/**
		 *	Toggle value with ternary operator on an event.
		 *
		 *	button x-toggle='click: foo === "bar" ? "zet" : "bar" > 'Toggle'
		 */
		
		__mask_registerAttrHandler('x-toggle', 'client', function(node, attrValue, model, ctx, element, controller){
		    
		    
		    var event = attrValue.substring(0, attrValue.indexOf(':')),
		        expression = attrValue.substring(event.length + 1),
		        ref = expression_varRefs(expression);
		    
			if (typeof ref !== 'string') {
				// assume is an array
				ref = ref[0];
			}
			
		    __dom_addEventListener(element, event, function(){
		        var value = expression_eval(expression, model, ctx, controller);
		        
		        obj_setProperty(model, ref, value);
		    });
		});
		
		// end:source ../src/mask-attr/xToggle.js
		// source ../src/mask-attr/xClassToggle.js
		/**
		 *	Toggle Class Name
		 *
		 *	button x-toggle='click: selected'
		 */
		
		__mask_registerAttrHandler('x-class-toggle', 'client', function(node, attrValue, model, ctx, element, controller){
		    
		    
		    var event = attrValue.substring(0, attrValue.indexOf(':')),
		        $class = attrValue.substring(event.length + 1).trim();
		    
			
		    __dom_addEventListener(element, event, function(){
		         domLib(element).toggleClass($class);
		    });
		});
		
		// end:source ../src/mask-attr/xClassToggle.js
	
		//--import ../src/sys/sys.js
		// source ../src/statements/exports.js
		(function(){
			var custom_Statements = mask.getStatement();
			
			// source 1.utils.js
			var _getNodes,
				_renderElements,
				_renderPlaceholder,
				_compo_initAndBind,
				
				els_toggle
				
				;
				
			(function(){
				
				_getNodes = function(name, node, model, ctx, controller){
					return custom_Statements[name].getNodes(node, model, ctx, controller);
				};
				
				_renderElements = function(nodes, model, ctx, container, ctr){
					if (nodes == null) 
						return null;
					
					var elements = [];
					builder_build(nodes, model, ctx, container, ctr, elements);
					return elements;
				};
				
				_renderPlaceholder = function(compo, container){
					compo.placeholder = document.createComment('');
					container.appendChild(compo.placeholder);
				};
				
				_compo_initAndBind = function(compo, node, model, ctx, container, controller) {
					
					compo.parent = controller;
					compo.model = model;
					
					compo.refresh = fn_proxy(compo.refresh, compo);
					compo.binder = expression_createBinder(
						compo.expr || compo.expression,
						model,
						ctx,
						controller,
						compo.refresh
					);
					
					
					expression_bind(compo.expr || compo.expression, model, ctx, controller, compo.binder);
				};
				
				
				els_toggle = function(els, state){
					if (els == null) 
						return;
					
					var isArray = typeof els.splice === 'function',
						imax = isArray ? els.length : 1,
						i = -1,
						x;
					while ( ++i < imax ){
						x = isArray ? els[i] : els;
						x.style.display = state ? '' : 'none';
					}
				}
				
			}());
			// end:source 1.utils.js
			// source 2.if.js
			(function(){
				
				mask.registerHandler('+if', {
					meta: {
						serializeNodes: true
					},
					render: function(model, ctx, container, ctr, children){
						
						var node = this,
							nodes = _getNodes('if', node, model, ctx, ctr),
							index = 0;
						
						var next = node;
						while(true){
							
							if (next.nodes === nodes) 
								break;
							
							index++;
							next = node.nextSibling;
							
							if (next == null || next.tagName !== 'else') {
								index = null;
								break;
							}
						}
						
						this.attr['switch-index'] = index;
						
						return _renderElements(nodes, model, ctx, container, ctr, children);
					},
					
					renderEnd: function(els, model, ctx, container, ctr){
						
						var compo = new IFStatement(),
							index = this.attr['switch-index'];
						
						compo.placeholder = document.createComment('');
						container.appendChild(compo.placeholder);
						
						initialize(compo, this, index, els, model, ctx, container, ctr);
						
						
						return compo;
					},
					
					serializeNodes: function(current){
						
						var nodes = [ current ];
						while (true) {
							current = current.nextSibling;
							if (current == null || current.tagName !== 'else') 
								break;
							
							nodes.push(current);
						}
						
						return mask.stringify(nodes);
					}
					
				});
				
				
				function IFStatement() {}
				
				IFStatement.prototype = {
					compoName: '+if',
					ctx : null,
					model : null,
					controller : null,
					
					index : null,
					Switch : null,
					binder : null,
					
					refresh: function() {
						var compo = this,
							switch_ = compo.Switch,
							
							imax = switch_.length,
							i = -1,
							expr,
							item, index = 0;
							
						var currentIndex = compo.index,
							model = compo.model,
							ctx = compo.ctx,
							ctr = compo.controller
							;
						
						while ( ++i < imax ){
							expr = switch_[i].node.expression;
							if (expr == null) 
								break;
							
							if (expression_eval(expr, model, ctx, ctr)) 
								break;
						}
						
						if (currentIndex === i) 
							return;
						
						if (currentIndex != null) 
							els_toggle(switch_[currentIndex].elements, false);
						
						if (i === imax) {
							compo.index = null;
							return;
						}
						
						this.index = i;
						
						var current = switch_[i];
						if (current.elements != null) {
							els_toggle(current.elements, true);
							return;
						}
						
						var frag = mask.render(current.node.nodes, model, ctx, null, ctr);
						var els = frag.nodeType === Node.DOCUMENT_FRAGMENT_NODE
							? _Array_slice.call(frag.childNodes)
							: frag
							;
						
						
						dom_insertBefore(frag, compo.placeholder);
						
						current.elements = els;
						
					},
					dispose: function(){
						var switch_ = this.Switch,
							imax = switch_.length,
							i = -1,
							
							x, expr;
							
						while( ++i < imax ){
							x = switch_[i];
							expr = x.node.expression;
							
							if (expr) {
								expression_unbind(
									expr,
									this.model,
									this.controller,
									this.binder
								);
							}
							
							x.node = null;
							x.elements = null;
						}
						
						this.controller = null;
						this.model = null;
						this.ctx = null;
					}
				};
				
				function initialize(compo, node, index, elements, model, ctx, container, ctr) {
					
					compo.model = model;
					compo.ctx = ctx;
					compo.controller = ctr;
					
					compo.refresh = fn_proxy(compo.refresh, compo);
					compo.binder = expression_createListener(compo.refresh);
					compo.index = index;
					compo.Switch = [{
						node: node,
						elements: null
					}];
					
					expression_bind(node.expression, model, ctx, ctr, compo.binder);
					
					while (true) {
						node = node.nextSibling;
						if (node == null || node.tagName !== 'else') 
							break;
						
						compo.Switch.push({
							node: node,
							elements: null
						});
						
						if (node.expression) 
							expression_bind(node.expression, model, ctx, ctr, compo.binder);
					}
					
					if (index != null) 
						compo.Switch[index].elements = elements;
					
				}
			
				
			}());
			// end:source 2.if.js
			// source 3.switch.js
			(function(){
				
				var $Switch = custom_Statements['switch'],
					attr_SWITCH = 'switch-index'
					;
				
				var _nodes,
					_index;
				
				mask.registerHandler('+switch', {
					meta: {
						serializeNodes: true
					},
					serializeNodes: function(current){
						return mask.stringify(current);
					},
					render: function(model, ctx, container, ctr, children){
						
						var value = expression_eval(this.expression, model, ctx, ctr);
						
						
						resolveNodes(value, this.nodes, model, ctx, ctr);
						
						if (_nodes == null) 
							return null;
						
						this.attr[attr_SWITCH] = _index;
						
						return _renderElements(_nodes, model, ctx, container, ctr, children);
					},
					
					renderEnd: function(els, model, ctx, container, ctr){
						
						var compo = new SwitchStatement(),
							index = this.attr[attr_SWITCH];
						
						_renderPlaceholder(compo, container);
						
						initialize(compo, this, index, els, model, ctx, container, ctr);
						
						return compo;
					}
					
				});
				
				
				function SwitchStatement() {}
				
				SwitchStatement.prototype = {
					compoName: '+switch',
					ctx: null,
					model: null,
					controller: null,
					
					index: null,
					nodes: null,
					Switch: null,
					binder: null,
					
					
					refresh: function(value) {
						
						var compo = this,
							switch_ = compo.Switch,
							
							imax = switch_.length,
							i = -1,
							expr,
							item, index = 0;
							
						var currentIndex = compo.index,
							model = compo.model,
							ctx = compo.ctx,
							ctr = compo.controller
							;
						
						resolveNodes(value, compo.nodes, model, ctx, ctr);
						
						if (_index === currentIndex) 
							return;
						
						if (currentIndex != null) 
							els_toggle(switch_[currentIndex], false);
						
						if (_index == null) {
							compo.index = null;
							return;
						}
						
						this.index = _index;
						
						var elements = switch_[_index];
						if (elements != null) {
							els_toggle(elements, true);
							return;
						}
						
						var frag = mask.render(_nodes, model, ctx, null, ctr);
						var els = frag.nodeType === Node.DOCUMENT_FRAGMENT_NODE
							? _Array_slice.call(frag.childNodes)
							: frag
							;
						
						
						dom_insertBefore(frag, compo.placeholder);
						
						switch_[_index] = els;
						
					},
					dispose: function(){
						expression_unbind(
							this.expr,
							this.model,
							this.controller,
							this.binder
						);
					
						this.controller = null;
						this.model = null;
						this.ctx = null;
						
						var switch_ = this.Switch,
							key,
							els, i, imax
							;
						
						for(key in switch_) {
							els = switch_[key];
							
							if (els == null)
								continue;
							
							imax = els.length;
							i = -1;
							while ( ++i < imax ){
								if (els[i].parentNode != null) 
									els[i].parentNode.removeChild(els[i]);
							}
						}
					}
				};
				
				function resolveNodes(val, nodes, model, ctx, ctr) {
					
					_nodes = $Switch.getNodes(val, nodes, model, ctx, ctr);
					_index = null;
					
					if (_nodes == null) 
						return;
					
					var imax = nodes.length,
						i = -1;
					while( ++i < imax ){
						if (nodes[i].nodes === _nodes) 
							break;
					}
						
					_index = i === imax ? null : i;
				}
				
				function initialize(compo, node, index, elements, model, ctx, container, ctr) {
					
					compo.ctx = ctx;
					compo.expr = node.expression;
					compo.model = model;
					compo.controller = ctr;
					compo.index = index;
					compo.nodes = node.nodes;
					
					compo.refresh = fn_proxy(compo.refresh, compo);
					compo.binder = expression_createBinder(
						compo.expr,
						model,
						ctx,
						ctr,
						compo.refresh
					);
					
					
					compo.Switch = new Array(node.nodes.length);
					
					if (index != null) 
						compo.Switch[index] = elements;
					
					expression_bind(node.expression, model, ctx, ctr, compo.binder);
				}
			
				
			}());
			// end:source 3.switch.js
			// source 4.with.js
			(function(){
				
				var $With = custom_Statements['with'];
					
				mask.registerHandler('+with', {
					meta: {
						serializeNodes: true
					},
					rootModel: null,
					render: function(model, ctx, container, ctr){
						var expr = this.expression,
							nodes = this.nodes,
							val = expression_eval_strict(
								expr, model, ctx, ctr
							)
							;
						this.rootModel = model;
						return build(nodes, val, ctx, container, ctr);
					},
					
					onRenderStartClient: function(model, ctx){
						this.rootModel = model;
						this.model = expression_eval_strict(
							this.expression, model, ctx, this
						);
					},
					
					renderEnd: function(els, model, ctx, container, ctr){
						model = this.rootModel || model;
						
						var compo = new WithStatement(this);
					
						compo.elements = els;
						compo.model = model;
						compo.parent = ctr;
						compo.refresh = fn_proxy(compo.refresh, compo);
						compo.binder = expression_createBinder(
							compo.expr,
							model,
							ctx,
							ctr,
							compo.refresh
						);
						
						expression_bind(compo.expr, model, ctx, ctr, compo.binder);
						
						_renderPlaceholder(compo, container);
						
						return compo;
					}
				});
				
				
				function WithStatement(node){
					this.expr = node.expression;
					this.nodes = node.nodes;
				}
				
				WithStatement.prototype = {
					compoName: '+with',
					elements: null,
					binder: null,
					model: null,
					parent: null,
					refresh: function(val){
						dom_removeAll(this.elements);
						
						if (this.components) {
							var imax = this.components.length,
								i = -1;
							while ( ++i < imax ){
								Compo.dispose(this.components[i]);
							}
							this.components.length = 0;
						}
						
						
						var fragment = document.createDocumentFragment();
						this.elements = build(this.nodes, val, null, fragment, this);
						
						dom_insertBefore(fragment, this.placeholder);
						compo_inserted(this);
					},
					
					
					dispose: function(){
						expression_unbind(
							this.expr,
							this.model,
							this.parent,
							this.binder
						);
					
						this.parent = null;
						this.model = null;
						this.ctx = null;
					}
					
				};
				
				function build(nodes, model, ctx, container, controller){
					var els = [];
					builder_build(nodes, model, ctx, container, controller, els);
					return els;
				}
			}());
			// end:source 4.with.js
			// source 5.visible.js
			(function(){
				var $Visible = custom_Statements['visible'];
					
				mask.registerHandler('+visible', {
					meta: {
						serializeNodes: true
					},
					render: function(model, ctx, container, ctr, childs){
						return build(this.nodes, model, ctx, container, ctr);
					},
					renderEnd: function(els, model, ctx, container, ctr){
						
						var compo = new VisibleStatement(this);
						compo.elements = els;
						compo.model = model;
						compo.parent = ctr;
						compo.refresh = fn_proxy(compo.refresh, compo);
						compo.binder = expression_createBinder(
							compo.expr,
							model,
							ctx,
							ctr,
							compo.refresh
						);
						
						expression_bind(compo.expr, model, ctx, ctr, compo.binder);
						compo.refresh();
						return compo;
					}
				});
				
				
				function VisibleStatement(node){
					this.expr = node.expression;
					this.nodes = node.nodes;
				}
				
				VisibleStatement.prototype = {
					compoName: '+visible',
					elements: null,
					binder: null,
					model: null,
					parent: null,
					refresh: function(){
						var isVisible = expression_eval(
							this.expr, this.model, this.ctx, this
						);
						$Visible.toggle(this.elements, isVisible);
					},
					dispose: function(){
						expression_unbind(
							this.expr,
							this.model,
							this.parent,
							this.binder
						);
					
						this.parent = null;
						this.model = null;
						this.ctx = null;
					}
					
				};
				
				function build(nodes, model, ctx, container, ctr){
					var els = [];
					builder_build(nodes, model, ctx, container, ctr, els);
					return els;
				}
			}());
			// end:source 5.visible.js
			// source loop/exports.js
			(function(){
				
				// source utils.js
				
				
				function arr_createRefs(array){
					var imax = array.length,
						i = -1,
						x;
					while ( ++i < imax ){
						//create references from values to distinguish the models
						x = array[i];
						switch (typeof x) {
						case 'string':
						case 'number':
						case 'boolean':
							array[i] = Object(x);
							break;
						}
					}
				}
				
				
				function list_sort(self, array) {
				
					var compos = self.node.components,
						i = 0,
						imax = compos.length,
						j = 0,
						jmax = null,
						element = null,
						compo = null,
						fragment = document.createDocumentFragment(),
						sorted = [];
				
					for (; i < imax; i++) {
						compo = compos[i];
						if (compo.elements == null || compo.elements.length === 0) 
							continue;
						
						for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
							element = compo.elements[j];
							element.parentNode.removeChild(element);
						}
					}
				
					
					outer: for (j = 0, jmax = array.length; j < jmax; j++) {
				
						for (i = 0; i < imax; i++) {
							if (array[j] === self._getModel(compos[i])) {
								sorted[j] = compos[i];
								continue outer;
							}
						}
					
						console.warn('No Model Found for', array[j]);
					}
				
				
				
					for (i = 0, imax = sorted.length; i < imax; i++) {
						compo = sorted[i];
				
						if (compo.elements == null || compo.elements.length === 0) {
							continue;
						}
				
				
						for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
							element = compo.elements[j];
				
							fragment.appendChild(element);
						}
					}
				
					self.components = self.node.components = sorted;
				
					dom_insertBefore(fragment, self.placeholder);
				
				}
				
				function list_update(self, deleteIndex, deleteCount, insertIndex, rangeModel) {
					
					var node = self.node,
						compos = node.components
						;
					if (compos == null) 
						compos = node.components = []
					
					var prop1 = self.prop1,
						prop2 = self.prop2,
						type = self.type,
						
						ctx = self.ctx,
						ctr = self.node
						;
					
					if (deleteIndex != null && deleteCount != null) {
						var i = deleteIndex,
							length = deleteIndex + deleteCount;
				
						if (length > compos.length) 
							length = compos.length;
						
						for (; i < length; i++) {
							if (compo_dispose(compos[i], node)){
								i--;
								length--;
							}
						}
					}
				
					if (insertIndex != null && rangeModel && rangeModel.length) {
				
						var i = compos.length,
							imax,
							fragment = self._build(node, rangeModel, ctx, ctr),
							new_ = compos.splice(i)
							; 
						compo_fragmentInsert(node, insertIndex, fragment, self.placeholder);
						
						compos.splice.apply(compos, [insertIndex, 0].concat(new_));
						i = 0;
						imax = new_.length;
						for(; i < imax; i++){
							__Compo.signal.emitIn(new_[i], 'domInsert');
						}
					}
				}
				
				function list_remove(self, removed){
					var compos = self.components,
						i = compos.length,
						x;
					while(--i > -1){
						x = compos[i];
						
						if (removed.indexOf(x.model) === -1) 
							continue;
						
						compo_dispose(x, self.node);
					}
				}
				
				
				// end:source utils.js
				// source proto.js
				var LoopStatementProto = {
					model: null,
					parent: null,
					refresh: function(value, method, args, result){
						var i = 0,
							x, imax;
							
						var node = this.node,
							
							model = this.model,
							ctx = this.ctx,
							ctr = this.node
							;
				
						if (method == null) {
							// this was new array/object setter and not an immutable function call
							
							var compos = node.components;
							if (compos != null) {
								var imax = compos.length,
									i = -1;
								while ( ++i < imax ){
									if (compo_dispose(compos[i], node)){
										i--;
										imax--;
									}
								}
								compos.length = 0;
							}
							
							var frag = this._build(node, value, ctx, ctr);
							
							dom_insertBefore(frag, this.placeholder);
							arr_each(node.components, compo_inserted);
							return;
						}
				
						var array = value;
						arr_createRefs(value);
						
				
						switch (method) {
						case 'push':
							list_update(this, null, null, array.length - 1, array.slice(array.length - 1));
							break;
						case 'pop':
							list_update(this, array.length, 1);
							break;
						case 'unshift':
							list_update(this, null, null, 0, array.slice(0, 1));
							break;
						case 'shift':
							list_update(this, 0, 1);
							break;
						case 'splice':
							var sliceStart = args[0],
								sliceRemove = args.length === 1 ? this.components.length : args[1],
								sliceAdded = args.length > 2 ? array.slice(args[0], args.length - 2 + args[0]) : null;
				
							list_update(this, sliceStart, sliceRemove, sliceStart, sliceAdded);
							break;
						case 'sort':
						case 'reverse':
							list_sort(this, array);
							break;
						case 'remove':
							if (result != null && result.length) 
								list_remove(this, result);
							break;
						}
					},
					
					dispose: function(){
						
						expression_unbind(
							this.expr || this.expression, this.model, this.parent, this.binder
						);
					}
				};
				
				// end:source proto.js
				// source for.js
				(function(){
					
					var For = custom_Statements['for'],
					
						attr_PROP_1 = 'for-prop-1',
						attr_PROP_2 = 'for-prop-2',
						attr_TYPE = 'for-type',
						attr_EXPR = 'for-expr'
						;
						
					
					mask.registerHandler('+for', {
						meta: {
							serializeNodes: true
						},
						serializeNodes: function(node){
							return mask.stringify(node);
						},
						render: function(model, ctx, container, ctr, children){
							var directive = For.parseFor(this.expression),
								attr = this.attr;
							
							attr[attr_PROP_1] = directive[0];
							attr[attr_PROP_2] = directive[1];
							attr[attr_TYPE] = directive[2];
							attr[attr_EXPR] = directive[3];
							
							var value = expression_eval_strict(directive[3], model, ctx, ctr);
							if (value == null) 
								return;
							
							if (is_Array(value)) 
								arr_createRefs(value);
							
							For.build(
								value,
								directive,
								this.nodes,
								model,
								ctx,
								container,
								this,
								children
							);
						},
						
						renderEnd: function(els, model, ctx, container, ctr){
							
							var compo = new ForStatement(this, this.attr);
							
							compo.placeholder = document.createComment('');
							container.appendChild(compo.placeholder);
							
							
							
							_compo_initAndBind(compo, this, model, ctx, container, ctr);
							
							return compo;
						},
						
						getHandler: function(name, model){
							
							return For.getHandler(name, model);
						}
						
					});
					
					function initialize(compo, node, els, model, ctx, container, ctr) {
						
						compo.parent = ctr;
						compo.model = model;
						
						compo.refresh = fn_proxy(compo.refresh, compo);
						compo.binder = expression_createBinder(
							compo.expr,
							model,
							ctx,
							ctr,
							compo.refresh
						);
						
						
						expression_bind(compo.expr, model, ctx, ctr, compo.binder);
						
					}
					
					function ForStatement(node, attr) {
						this.prop1 = attr[attr_PROP_1];
						this.prop2 = attr[attr_PROP_2];
						this.type = attr[attr_TYPE];
						this.expr = attr[attr_EXPR];
						
						if (node.components == null) 
							node.components = [];
						
						this.node = node;
						this.components = node.components;
					}
					
					ForStatement.prototype = {
						compoName: '+for',
						model: null,
						parent: null,
						
						refresh: LoopStatementProto.refresh,
						dispose: LoopStatementProto.dispose,
						
						_getModel: function(compo) {
							return compo.scope[this.prop1];
						},
						
						_build: function(node, model, ctx, component) {
							var nodes = For.getNodes(node.nodes, model, this.prop1, this.prop2, this.type);
							
							return builder_build(nodes, this.model, ctx, null, component);
						}
					};
					
				}());
				// end:source for.js
				// source each.js
				(function(){
					
					var Each = custom_Statements['each'];
					
					mask.registerHandler('+each', {
						meta: {
							serializeNodes: true
						},
						serializeNodes: function(node){
							return mask.stringify(node);
						},
						//modelRef: null,
						render: function(model, ctx, container, ctr, children){
							//this.modelRef = this.expression;
							var array = expression_eval(this.expression, model, ctx, ctr);
							if (array == null) 
								return;
							
							arr_createRefs(array);
							
							build(
								this.nodes,
								array,
								ctx,
								container,
								this,
								children
							);
						},
						
						renderEnd: function(els, model, ctx, container, ctr){
							var compo = new EachStatement(this, this.attr);
							
							compo.placeholder = document.createComment('');
							container.appendChild(compo.placeholder);
							
							_compo_initAndBind(compo, this, model, ctx, container, ctr);
							
							return compo;
						}
						
					});
					mask.registerHandler('each::item', EachItem);
					
					function build(nodes, array, ctx, container, ctr, elements) {
						var imax = array.length,
							nodes_ = new Array(imax),
							i = 0, node;
						
						for(; i < imax; i++) {
							node = createEachNode(nodes, i);
							builder_build(node, array[i], ctx, container, ctr, elements);
						}
					}
					
					function createEachNode(nodes, index){
						var item = new EachItem;
						item.scope = { index: index };
						
						return {
							type: Dom.COMPONENT,
							tagName: 'each::item',
							nodes: nodes,
							controller: function() {
								return item;
							}
						};
					}
					
					function EachItem() {}
					EachItem.prototype = {
						compoName: 'each::item',
						scope: null,
						model: null,
						modelRef: null,
						parent: null,
						renderStart: IS_NODE === true
							?  function(){
								var expr = this.parent.expression;
								this.modelRef = ''
									+ (expr === '.' ? '' : ('(' + expr + ')'))
									+ '."'
									+ this.scope.index
									+ '"';
							}
							: null,
						renderEnd: function(els) {
							this.elements = els;
						},
						dispose: function(){
							if (this.elements != null) {
								this.elements.length = 0;
								this.elements = null;
							}
						}
					};
					
					function EachStatement(node, attr) {
						this.expression = node.expression;
						this.nodes = node.nodes;
						
						if (node.components == null) 
							node.components = [];
						
						this.node = node;
						this.components = node.components;
					}
					
					EachStatement.prototype = {
						compoName: '+each',
						refresh: LoopStatementProto.refresh,
						dispose: LoopStatementProto.dispose,
						
						_getModel: function(compo) {
							return compo.model;
						},
						
						_build: function(node, model, ctx, component) {
							var fragment = document.createDocumentFragment();
							
							build(node.nodes, model, ctx, fragment, component);
							
							return fragment;
						}
					};
					
				}());
				// end:source each.js
				
			}());
			
			// end:source loop/exports.js
			
		}());
		// end:source ../src/statements/exports.js
	
	}(Mask, Compo));
	
	// end:source /ref-mask-binding/lib/binding.embed.js
	
	

	Mask.Compo = Compo;
	Mask.jmask = jmask;

	return (exports.mask = Mask);
}));
(function(root, factory){
	"use strict";
	
	if (root == null) {
		root = typeof window !== 'undefined' && typeof document !== 'undefined' 
			? window 
			: global;
	}
	
	
	root.ruta = factory(root);
	
}(this, function(global){
	"use strict";
	
	// source ../src/vars.js
	
	var mask = global.mask || Mask;
	
	// settings
	
	/** define if routes like '/path' are strict by default,
	 * or set explicit '!/path' - strict, '^/path' - not strict
	 *
	 * Strict means - like in regex start-end /^$/
	 * */
	var	_cfg_isStrict = true,
		_Array_slice = Array.prototype.slice;
	// end:source ../src/vars.js
	// source ../src/utils/log.js
	var log_error;
	(function(){
		
		log_error = function(){
			var args = _Array_slice.call(arguments);
			
			console.error.apply(console, ['Ruta'].concat(args));
		};
		
	}());
	// end:source ../src/utils/log.js
	// source ../src/utils/path.js
	var path_normalize,
		path_split,
		path_join,
		path_fromCLI
		;
	
	(function(){
	
	
		path_normalize = function(str) {
			
			var length = str.length,
				i = 0,
				j = length - 1;
				
			for(; i < length; i++) {
				if (str[i] === '/') 
					continue;
				
				break;
			}
			for (; j > i; j--) {
				if (str[j] === '/') 
					continue;
				
				break;
			}
			
			return str.substring(i, j + 1);
		};
		
		path_split = function(path) {
			path = path_normalize(path);
			
			return path === ''
				? []
				: path.split('/');
		};
		
		path_join = function(pathParts) {
			return '/' + pathParts.join('/');
		};
		
		path_fromCLI = function(commands){
			
			if (typeof commands === 'string') 
				commands = cli_split(commands);
			
			var parts = cli_parseArguments(commands);
			
			return parts_serialize(parts);
		};
		
		
		// == private
		
		function cli_split(string){
			var args = string.trim().split(/\s+/);
					
			var imax = args.length,
				i = -1,
				c, arg;
				
			while ( ++i < imax ){
				
				arg = args[i];
				if (arg.length === 0) 
					continue;
				
				c = arg[0];
				
				if (c !== '"' && c !== "'") 
					continue;
				
				
				var start = i;
				for( ; i < imax; i++ ){
					
					arg = args[i];
					if (arg[arg.length - 1] === c) {
						
						var str = args
							.splice(start, i - start + 1)
							.join(' ')
							.slice(1,  -1)
							;
						
						args.splice(start, 0, str);
						imax = args.length;
						break;
					}
				}
			}
			
			return args;
		}
		
		function cli_parseArguments(argv){
			var imax = argv.length,
				i = 0,
				params = {},
				args = [],
				key, val, x;
			
			for (; i < imax; i++){
				x = argv[i];
				
				if (x[0] === '-') {
					
					key = x.replace(/^[\-]+/, '');
					
					if (i < imax - 1 && argv[i + 1][0] !== '-') {
						val = argv[i + 1];
						i++;
					} else {
						val = true;
					}
					
					params[key] = val;
					continue;
				}
				
				args.push(x);
			}
			
			return {
				path: args,
				query: params
			};	
		}
	
	}());
	
	// end:source ../src/utils/path.js
	// source ../src/utils/query.js
	var query_deserialize,
		query_serialize
		;
	
	(function(){
	
		query_deserialize = function(query, delimiter) {
			if (delimiter == null) 
				delimiter = '&';
			
			var obj = {},
				parts = query.split(delimiter),
				i = 0,
				imax = parts.length,
				x, val;
				
			for (; i < imax; i++) {
				x = parts[i].split('=');
				val = x[1] == null
					? ''
					: decode(x[1])
					;
				obj_setProperty(obj, x[0], val);
			}
			return obj;
		};
		query_serialize = function(params, delimiter) {
			if (delimiter == null) 
				delimiter = '&';
			
			var query = '',
				key, val;
			for(key in params) {
				val = params[key];
				if (val == null) 
					continue;
				
				// serialize as flag
				if (typeof val === 'boolean') 
					val = null;
				
				query = query + (query ? delimiter : '') + key;
				if (val != null) 
					query += '=' + encode(val);
			}
		
			return query;
		};
		
		// = private
		
		function obj_setProperty(obj, property, value) {
			var chain = property.split('.'),
				imax = chain.length,
				i = -1,
				key;
		
			while ( ++i <  imax - 1) {
				key = chain[i];
				
				if (obj[key] == null) 
					obj[key] = {};
				
				obj = obj[key];
			}
		
			obj[chain[i]] = value;
		}
		function decode(str) {
			try {
				return decodeURIComponent(str);
			} catch(error) {
				log_error('decode:URI malformed');
				return '';
			}
		}
		function encode(str) {
			try {
				return encodeURIComponent(str);
			} catch(error) {
				log_error('encode:URI malformed');
				return '';
			}
		}
	}());
	
	
	// end:source ../src/utils/query.js
	// source ../src/utils/rgx.js
	var rgx_fromString,
	
		// Url part should be completely matched, so add ^...$ and create RegExp
		rgx_aliasMatcher,
		
		// :debugger(d|debug) => { alias: 'debugger', matcher: RegExp }
		rgx_parsePartWithRegExpAlias
		;
	
	(function(){
	
		
		rgx_fromString = function(str, flags) {
			return new RegExp(str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), flags);
		};
		
		rgx_aliasMatcher = function(str){
			
			if (str[0] === '^') 
				return new RegExp(str);
			
			var groups = str.split('|');
			for (var i = 0, imax = groups.length; i < imax; i++){
				groups[i] = '^' + groups[i] + '$';
			}
			
			return new RegExp(groups.join('|'));
		};
	
		rgx_parsePartWithRegExpAlias = function(str){
			var pStart = str.indexOf('('),
				pEnd = str.lastIndexOf(')')
				;
			
			if (pStart === -1 || pEnd === -1) {
				log_error('Expected alias part with regexp', str);
				return null;
			}
			
			var rgx = str.substring(pStart + 1, pEnd);
			return {
				alias: str.substring(1, pStart),
				matcher: rgx_aliasMatcher(rgx)
			};
		};
		
	}());
	
	// end:source ../src/utils/rgx.js
	// source ../src/utils/parts.js
	
	/**
	 *	'/foo/bar?a=b' =>
	 *	{ path: ['foo', 'bar'], query: { a: 'b' } }
	 */
	
	var parts_serialize,
		parts_deserialize
		;
	
	(function(){
		
	
		parts_serialize = function(parts){
			var path = path_join(parts.path);
			
			if (parts.query == null) 
				return path;
			
			return path
					+ '?'
					+ query_serialize(parts.query, '&')
				;
		};
		
		parts_deserialize = function(url){
			var query = url.indexOf('?'),
				path = query === -1
					? url
					: url.substring(0, query);
			
			
			return {
				path: path_split(path),
				query: query === -1
					? null
					: query_deserialize(url.substring(query + 1), '&')
			};
		};
		
		
	}());
	
	// end:source ../src/utils/parts.js

	// source ../src/route/Collection.js
	var Routes = (function(){
		
		// source Route.js
		
		// source parse.js
		var route_parseDefinition, // out route, definition 
		
			// path should be already matched by the route 
			route_parsePath // route, path 
			;
		
		(function(){
				
			
			route_parseDefinition = function(route, definition) {
				
				var c = definition.charCodeAt(0);
				switch(c){
					case 33:
						// !
						route.strict = true;
						definition = definition.substring(1);
						break;
					case 94:
						// ^
						route.strict = false;
						definition = definition.substring(1);
						break;
					case 40:
						// (
						var start = 1,
							end = definition.length - 1
							;
						if (definition.charCodeAt(definition.length - 1) !== 41) {
							// )
							log_error('parser - expect group closing');
							end ++;
						}
						
						route.match = new RegExp(definition.substring(start, end));
						return;
				}
				
				
				
				var parts = definition.split('/'),
					search,
					searchIndex,
					i = 0,
					imax = parts.length,
					x,
					c0,
					index,
					c1;
					
				
				var last = parts[imax - 1];
				searchIndex = last.indexOf('?');
				if (searchIndex > (imax === 1 ? -1 : 0)) {
					// `?` cannt be at `0` position, when has url definition contains `path`
					search = last.substring(searchIndex + 1);
					parts[imax - 1] = last.substring(0, searchIndex);
				}
			
				var matcher = '',
					alias = null,
					strictCount = 0;
			
				var gettingMatcher = true,
					isOptional,
					isAlias,
					rgx;
			
				var array = route.path = [];
				
				for (; i < imax; i++) {
					x = parts[i];
					
					if (x === '') 
						continue;
					
			
					c0 = x.charCodeAt(0);
					c1 = x.charCodeAt(1);
			
					isOptional = c0 === 63; /* ? */
					isAlias = (isOptional ? c1 : c0) === 58; /* : */
					index = 0;
					
					if (isOptional) 
						index++;
					
					if (isAlias) 
						index++;
					
			
					if (index !== 0) 
						x = x.substring(index);
					
			
					// if DEBUG
					if (!isOptional && !gettingMatcher) 
						log_error('Strict part found after optional', definition);
					// endif
			
			
					if (isOptional) 
						gettingMatcher = false;
					
					var bracketIndex = x.indexOf('(');
					if (isAlias && bracketIndex !== -1) {
						var end = x.length - 1;
						if (x[end] !== ')') 
							end+= 1;
						
						rgx = new RegExp(rgx_aliasMatcher(x.substring(bracketIndex + 1, end)));
						x = x.substring(0, bracketIndex);
					}
					
					if (!isOptional && !isAlias) {
						array.push(x);
						continue;
					}
					
					if (isAlias) {
						array.push({
							alias: x,
							matcher: rgx,
							optional: isOptional
						});
					}
					
				}
			
				if (search) {
					var query = route.query = {};
					
					parts = search.split('&');
					
					i = -1;
					imax = parts.length;
					
					var key, value, str, eqIndex;
					while(++i < imax){
						str = parts[i];
						
						eqIndex = str.indexOf('=');
						if (eqIndex === -1) {
							query[str] = ''; // <empty string>
							continue;
						}
						
						key = str.substring(0, eqIndex);
						value = str.substring(eqIndex + 1);
						
						if (value.charCodeAt(0) === 40) {
							// (
							value = new RegExp(rgx_aliasMatcher(value));
						}
						
						query[key] = value;
					}
					
					if (route.path.length === 0) {
						route.strict = false;
					}
				}
			};
			
			
			route_parsePath = function(route, path) {
				
				var queryIndex = path.indexOf('?'),
					
					query = queryIndex === -1
						? null
						: path.substring(queryIndex + 1),
					
					current = {
						path: path,
						params: query == null
							? {}
							: query_deserialize(query, '&')
					};
				
				if (route.query) {
					// ensura aliased queries, like ?:debugger(d|debug)
					for (var key in route.query){
						
						if (key[0] === '?') 
							key = key.substring(1);
						
						if (key[0] === ':') {
							var alias = rgx_parsePartWithRegExpAlias(key),
								name = alias.alias;
							
							current.params[name] = getAliasedValue(current.params, alias.matcher);
						}
					}
				}
			
				if (queryIndex !== -1) {
					path = path.substring(0, queryIndex);
				}
			
				if (route.path != null) {
						
					var pathArr = path_split(path),
						routePath = route.path,
						routeLength = routePath.length,
						
						imax = pathArr.length,
						i = 0,
						part,
						x;
				
					for (; i < imax; i++) {
						part = pathArr[i];
						x = i < routeLength ? routePath[i] : null;
						
						if (x) {
							
							if (typeof x === 'string') 
								continue;
							
							if (x.alias) {
								current.params[x.alias] = part;
								continue;
							}
						}
					}
				}
			
				return current;
			};
		
			
			// = private
			
			function getAliasedValue(obj, matcher) {
				for (var key in obj){
					if (matcher.test(key)) 
						return obj[key];
				}
			}
		}());
		// end:source parse.js
		// source match.js
		var route_match,
			route_isMatch
			;
			
		(function(){
			
			route_match = function(url, routes, currentMethod){
				
				var parts = parts_deserialize(url);
				
				
				for (var i = 0, route, imax = routes.length; i < imax; i++){
					route = routes[i];
					
					if (route_isMatch(parts, route, currentMethod)) {
						
						route.current = route_parsePath(route, url);
						return route;
					}
				}
				
				return null;
			};
			
			route_isMatch = function(parts, route, currentMethod) {
				
				if (currentMethod != null &&
					route.method != null &&
					route.method !== currentMethod) {
					return false;
				}
				
				if (route.match) {
					
					return route.match.test(
						typeof parts === 'string'
							? parts
							: parts_serialize(parts)
					);
				}
				
				
				if (typeof parts === 'string') 
					parts = parts_deserialize(parts);
			
				// route defines some query, match these with the current path{parts}
				if (route.query) {
					var query = parts.query,
						key, value;
					if (query == null) 
						return false;
					
					for(key in route.query){
						value = route.query[key];
						
						
						var c = key[0];
						if (c === ':') {
							// '?:isGlob(g|glob) will match if any is present
							var alias = rgx_parsePartWithRegExpAlias(key);
							if (alias == null || hasKey(query, alias.matcher) === false)
								return false;
							
							continue;
						}
						
						if (c === '?') 
							continue;
						
						
						if (typeof value === 'string') {
							
							if (query[key] == null) 
								return false;
							
							if (value && query[key] !== value) 
								return false;
							
							continue;
						}
						
						if (value.test && !value.test(query[key])) 
							return false;
					}
				}
				
					
				var routePath = route.path,
					routeLength = routePath.length;
				
				
				if (routeLength === 0) {
					if (route.strict) 
						return parts.path.length === 0;
					
					return true;
				}
				
				
				
				for (var i = 0, x, imax = parts.path.length; i < imax; i++){
					
					x = routePath[i];
					
					if (i >= routeLength) 
						return route.strict !== true;
					
					if (typeof x === 'string') {
						if (parts.path[i] === x) 
							continue;
						
						return false;
					}
					
					if (x.matcher && x.matcher.test(parts.path[i]) === false) {
						return false;
					}
					
					if (x.optional) 
						return true;
					
					if (x.alias) 
						continue;
					
					return false;
				}
				
				if (i < routeLength) 
					return routePath[i].optional === true;
					
				
				return true;
			};
			
			
			function hasKey(obj, rgx){
				
				for(var key in obj){
					if (rgx.test(key)) 
						return true;
				}
				return false;
			}
			
		}());
		
		// end:source match.js
		
		var regexp_var = '([^\\\\]+)';
		
		function Route(definition, value) {
			
			this.method = definition.charCodeAt(0) === 36
				? definition.substring(1, definition.indexOf(' ')).toUpperCase()
				: null
				;
			
			if (this.method != null) {
				definition = definition.substring( this.method.length + 2 );
			}
			
			this.strict = _cfg_isStrict;
			this.value = value;
			this.definition = definition;
			
			route_parseDefinition(this, definition);
		}
		
		Route.prototype = {
			path: null,
			query: null,
			value: null,
			current: null
		};
		
		// end:source Route.js
		
		
		function RouteCollection() {
			this.routes = [];
		}
		
		RouteCollection.prototype = {
			add: function(regpath, value){
				this.routes.push(new Route(regpath, value));
				return this;
			},
			
			get: function(path, currentMethod){
				
				return route_match(path, this.routes, currentMethod);
			},
			
			clear: function(){
				this.routes.length = 0;
				return this;
			}
		};
		
		RouteCollection.parse = function(definition, path){
			var route = {};
			
			route_parseDefinition(route, definition);
			return route_parsePath(route, path);
		};
		
		return RouteCollection;
	}());
	// end:source ../src/route/Collection.js

	// source ../src/emit/Location.js
	
	var Location = (function(){
		
		if (typeof window === 'undefined') {
			return function(){};
		}
		
		// source Hash.js
		function HashEmitter(listener) {
			if (typeof window === 'undefined' || 'onhashchange' in window === false)
				return null;
		
			this.listener = listener;
			
			var that = this;
			window.onhashchange = function() {
				that.changed(location.hash);
			};
			return this;
		}
		
		(function() {
			
			function hash_normalize(hash) {
				return hash.replace(/^[!#/]+/, '/');
			}
			
			HashEmitter.prototype = {
				navigate: function(hash) {
					if (hash == null) {
						this.changed(location.hash);
						return;
					}
					
					location.hash = hash;
				},
				changed: function(hash) {
					this
						.listener
						.changed(hash_normalize(hash));
						
				},
				current: function() {
					return hash_normalize(location.hash);
				}
			};
		
		}());
		// end:source Hash.js
		// source History.js
		function HistoryEmitter(listener){	
			if (typeof window === 'undefined')
				return null;
			
			if (!(window.history && window.history.pushState))
				return null;
		
			var that = this;
			that.listener = listener;
			that.initial = location.pathname;
			
			window.onpopstate = function(){
				if (that.initial === location.pathname) {
					that.initial = null;
					return;
				}
				that.changed();
			};
			
			return that;
		}
		
		HistoryEmitter.prototype = {
			navigate: function(url){
				if (url == null) {
					this.changed();
					return;
				}
				
				history.pushState({}, null, url);
				this.initial = null;
				this.changed();
			},
			changed: function(){
				this.listener.changed(location.pathname + location.search);
			},
			current: function(){
				return location.pathname + location.search;
			}
		};
		
		// end:source History.js
		
		function Location(collection, type) {
			
			this.collection = collection || new Routes();
			
			if (type) {
				var Constructor = type === 'hash'
					? HashEmitter
					: HistoryEmitter
					;
				this.emitter = new Constructor(this);
			}
			
			if (this.emitter == null) 
				this.emitter = new HistoryEmitter(this);
			
			if (this.emitter == null) 
				this.emitter = new HashEmitter(this);
			
			if (this.emitter == null) 
				log_error('Router can not be initialized - (nor HistoryAPI / nor hashchange');
		}
		
		Location.prototype = {
			
			changed: function(path){
				var item = this.collection.get(path);
				
				if (item)
					this.action(item);
				
			},
			action: function(route){
				if (typeof route.value === 'function') {
					var current = route.current;
					route.value(route, current && current.params);
				}
			},
			navigate: function(url){
				this.emitter.navigate(url);
			},
			current: function(){
				return this.collection.get(
					this.currentPath()
				);
			},
			currentPath: function(){
				return this.emitter.current();
			}
		};
		
		return Location;
	}());
	// end:source ../src/emit/Location.js
	// source ../src/ruta.js
	
	var routes = new Routes(),
		router;
	
	function router_ensure() {
		if (router == null) 
			router = new Location(routes);
			
		return router;
	}
	
	var Ruta = {
		
		Collection: Routes,
		
		setRouterType: function(type){
			if (router == null) 
				router = new Location(routes, type);
			return this;
		},
		
		setStrictBehaviour: function(isStrict){
			_cfg_isStrict = isStrict;
			return this;
		},
		
		add: function(regpath, mix){
			router_ensure();
			routes.add(regpath, mix);
			return this;
		},
		
		get: function(path){
			return routes.get(path);
		},
		navigate: function(path){
			router_ensure().navigate(path);
			return this;
		},
		current: function(){
			return router_ensure().current();
		},
		currentPath: function(){
			return router_ensure().currentPath();
		},
		
		notifyCurrent: function(){
			router_ensure().navigate();
			return this;
		},
		
		parse: Routes.parse,
		
		$utils: {
			/*
			 * Format URI path from CLI command:
			 * some action -foo bar === /some/action?foo=bar
			 */
			pathFromCLI: path_fromCLI,
			
			query: {
				serialize: query_serialize,
				deserialize: query_deserialize
			}
		}
	};
	
	
	
	// end:source ../src/ruta.js
	
	// source ../src/mask/attr/anchor-dynamic.js
	(function() {
		
		mask.registerAttrHandler('x-dynamic', function(node, value, model, ctx, tag){
			tag.onclick = navigate;
		}, 'client');
		
		function navigate(event) {
			event.preventDefault();
			event.stopPropagation();
			
			Ruta.navigate(this.href);
		}
	}());
	
	// end:source ../src/mask/attr/anchor-dynamic.js
	
	return Ruta;
}));(function(global) {

    'use strict';

	var r = global.ruqq || (global.ruqq = {});

    function getProperty(o, chain) {
        if (typeof o !== 'object' || chain == null) {
			return o;
		}

		var value = o,
			props = chain.split('.'),
			length = props.length,
			i = 0,
			key;

		for (; i < length; i++) {
			key = props[i];
			value = value[key];
			if (value == null) {
				return value;
			}
		}
		return value;
    }


    function extend(target, source) {
        for (var key in source) {
			if (source[key]) {
				target[key] = source[key];
			}
		}
        return target;
    }

    /**
     *  ~1: check(item, compareFunction);
     *  ~2: check(item, '>|<|>=|<=|==', compareToValue);
     *  ~3: check(item, propertyNameToCompare, '>|<|>=|<=|==', compareToValue);
     */

    function check(item, arg1, arg2, arg3) { /** get value */

        if (typeof arg1 === 'function') {
			return arg1(item) ? item : null;
		}
        if (typeof arg2 === 'undefined') {
			return item == arg1 ? item : null;
		}


        var value = arg1 != null ? getProperty(item, arg1) : item,
			comparer = arg2,
			compareToValue = arg3;

        switch (comparer) {
        case '>':
            return value > compareToValue ? item : null;
        case '<':
            return value < compareToValue ? item : null;
        case '>=':
            return value >= compareToValue ? item : null;
        case '<=':
            return value <= compareToValue ? item : null;
        case '!=':
            return value != compareToValue ? item : null;
        case '==':
            return value == compareToValue ? item : null;
        }
        console.error('InvalidArgumentException: arr.js:check', arguments);
        return null;
    }

    var arr = {
        /**
         * @see check
         */
        where: function(items, arg1, arg2, arg3) {
            var array = [];
            if (items == null) {
				return array;
			}

			var i = 0,
				length = items.length,
				item;

            for (; i < length; i++) {
				item = items[i];
                if (check(item, arg1, arg2, arg3) != null) {
					array.push(item);
				}
            }

            return array;
        },
        each: typeof Array.prototype.forEach !== 'undefined' ?
        function(items, fn) {
            if (items == null) {
				return items;
			}
            items.forEach(fn);
            return items;
        } : function(items, func) {
            if (items == null) {
				return items;
			}
            for (var i = 0, length = items.length; i < length; i++) {
				func(items[i]);
			}
            return items;
        },
        remove: function(items, arg1, arg2, arg3) {
            for (var i = 0, length = items.length; i < length; i++) {
				if (check(items[i], arg1, arg2, arg3) != null) {
                    items.splice(i, 1);
                    i--;
					length--;
                }
            }
            return items;
        },
        invoke: function() {
            var args = Array.prototype.slice.call(arguments);
            var items = args.shift(),
                method = args.shift(),
                results = [];
            for (var i = 0; i < items.length; i++) {
                if (typeof items[i][method] === 'function') {
                    results.push(items[i][method].apply(items[i], args));
                } else {
                    results.push(null);
                }
            }
            return results;
        },
        last: function(items, arg1, arg2, arg3) {
			if (items == null){
				return null;
			}
            if (arg1 == null) {
				return items[items.length - 1];
			}
            for (var i = items.length; i > -1; --i) {
				if (check(items[i], arg1, arg2, arg3) != null) {
					return items[i];
				}
			}
            return null;

        },
        /**
         * @see where()
         * Last Argument is default value
         */
        first: function(items, arg1, arg2, arg3) {
            if (arg1 == null) {
				return items[0];
			}
            for (var i = 0, length = items.length; i < length; i++) {
				if (check(items[i], arg1, arg2, arg3) != null) {
					return items[i];
				}
			}
            return null;
        },
        any: function(items, arg1, arg2, arg3) {
            for (var i = 0, length = items.length; i < length; i++) {
				if (check(items[i], arg1, arg2, arg3) != null) {
					return true;
				}
			}
            return false;
        },
        isIn: function(items, checkValue) {
            for (var i = 0; i < items.length; i++) {
				if (checkValue == items[i]) {
					return true;
				}
			}
            return false;
        },
        map: typeof Array.prototype.map !== 'undefined'
			? function(items, func) {
				if (items == null) {
					return [];
				}
				return items.map(func);
			}
			: function(items, func) {
				var agg = [];
				if (items == null) {
					return agg;
				}
				for (var i = 0, length = items.length; i < length; i++) {
					agg.push(func(items[i], i));
				}
				return agg;
			},
		aggr: function(items, aggr, fn){
			for(var i = 0, length = items.length; i < length; i++){
				var result = fn(items[i], aggr, i);
				if (result != null){
					aggr = result;
				}
			}
			return aggr;
		},
        /**
         * @arg arg -
         *          {Function} - return value to select)
         *          {String}  - property name to select
         *          {Array}[{String}] - property names
         */
        select: function(items, arg) {
            if (items == null) {
				return [];
			}
            var arr = [];
            for (var item, i = 0, length = items.length; i < length; i++) {
				item = items[i];

                if (typeof arg === 'string') {
                    arr.push(item[arg]);
                } else if (typeof arg === 'function') {
                    arr.push(arg(item));
                } else if (arg instanceof Array) {
                    var obj = {};
                    for (var j = 0; j < arg.length; j++) {
                        obj[arg[j]] = items[i][arg[j]];
                    }
                    arr.push(obj);
                }
            }
            return arr;
        },
        indexOf: function(items, arg1, arg2, arg3) {
            for (var i = 0, length = items.length; i < length; i++) {
                if (check(items[i], arg1, arg2, arg3) != null) {
					return i;
				}
            }
            return -1;
        },
        count: function(items, arg1, arg2, arg3) {
            var count = 0,
				i = 0,
				length = items.length;
            for (; i < length; i++) {
				if (check(items[i], arg1, arg2, arg3) != null) {
					count++;
				}
			}
            return count;
        },
        distinct: function(items, compareF) {
            var array = [];
            if (items == null) {
				return array;
			}

            var i  = 0,
				length = items.length;
            for (; i < length; i++) {
                var unique = true;
                for (var j = 0; j < array.length; j++) {
                    if ((compareF && compareF(items[i], array[j])) || (compareF == null && items[i] == array[j])) {
                        unique = false;
                        break;
                    }
                }
                if (unique) {
					array.push(items[i]);
				}
            }
            return array;
        },
		
		groupBy: function(items, compareF){
			var array = [],
				imax = items.length,
				i = -1,
				
				group, j, x, cache = {};
			
			while ( ++i < imax ){
				if (cache[i] === true) 
					continue;
				
				x = items[i];
				
				group = [x];
				j = i;
				
				while( ++j < imax ){
					if (cache[j] === true) 
						continue;
					
					if (compareF(x, items[j])) {
						cache[j] = true;
						group.push(items[j]);
					}
				}
				
				array.push(group);
			}
			
			return array;
		}
    };

	arr.each(['min','max'], function(x){
		arr[x] = function(array, property){
			if (array == null){
				return null;
			}
			var number = null;
			for(var i = 0, length = array.length; i<length; i++){
				var prop = getProperty(array[i], property);

				if (number == null){
					number = prop;
					continue;
				}

				if (x === 'max' && prop > number){
					number = prop;
					continue;
				}
				if (x === 'min' && prop < number){
					number = prop;
					continue;
				}

			}
			return number;
		}
	});

    r.arr = function(items) {
        return new Expression(items);
    };

    extend(r.arr, arr);

    function Expression(items) {
        this.items = items;
    }

    function extendClass(method) {
        Expression.prototype[method] = function() {
            // @see http://jsperf.com/arguments-transform-vs-direct

            var l = arguments.length,
                result = arr[method](this.items, //
                l > 0 ? arguments[0] : null, //
                l > 1 ? arguments[1] : null, //
                l > 2 ? arguments[2] : null, //
                l > 3 ? arguments[3] : null);

            if (result instanceof Array) {
				this.items = result;
				return this;
			}

            return result;
        };
    }

	for (var method in arr) {
        extendClass(method);
    }

}(typeof window !== 'undefined' ? window : global));
(function(root, factory){
	"use strict";
	
	if (root == null) {
		root = typeof window !== 'undefined' && typeof document !== 'undefined' 
			? window 
			: global;
	}
	
	
	if (root.net == null) 
		root.net = {};
		
		
	root.net.Uri = factory(root);
	
}(this, function(global){

    'use strict';
	
	var rgx_protocol = /^([a-zA-Z]+):\/\//,
		rgx_fileWithExt = /([^\/]+(\.[\w\d]+)?)$/i,
		rgx_extension = /\.([\w\d]+)$/i,
		rgx_win32Drive = /(^\/?\w{1}:)(\/|$)/
		
		;

	function util_isUri(object) {
		return object && typeof object === 'object' && typeof object.combine === 'function';
	}
	
	function util_combinePathes(/*args*/) {
		var args = arguments,
			str = '';
		for (var i = 0, x, imax = arguments.length; i < imax; i++){
			x = arguments[i];
			if (!x) 
				continue;
		
			if (!str) {
				str = x;
				continue;
			}
			
			if (str[str.length - 1] !== '/') 
				str += '/';
			
			str += x[0] === '/' ? x.substring(1) : x;
		}
		return str;
	}
	
	function normalize_pathsSlashes(str) {
		
		if (str[str.length - 1] === '/') {
			return str.substring(0, str.length - 1);
		}
		return str;
	}
	
	function util_clone(source) {
		var uri = new URI(),
			key;
		for (key in source) {
			if (typeof source[key] === 'string') {
				uri[key] = source[key];
			}
		}
		return uri;
	}
	
	function normalize_uri(str) {
		return str
			.replace(/\\/g,'/')
			.replace(/^\.\//,'')
			
			// win32 drive path
			.replace(/^(\w+):\/([^\/])/, '/$1:/$2') 
			
			;
	}
	
	function util_win32Path(path) {
		if (rgx_win32Drive.test(path) && path[0] === '/') {
			return path.substring(1);
		}
		return path;
	}
	
	function parse_protocol(obj) {
		var match = rgx_protocol.exec(obj.value); 

        if (match == null && obj.value[0] === '/'){
            obj.protocol = 'file';
        }

		if (match == null) 
			return;
		
		
		obj.protocol = match[1];
		obj.value = obj.value.substring(match[0].length);
	}
	
	function parse_host(obj) {
		if (obj.protocol == null)
			return;
		
		if (obj.protocol === 'file') {
			var match = rgx_win32Drive.exec(obj.value);
			if (match) {
				obj.host = match[1];
				obj.value = obj.value.substring(obj.host.length);
			}
			return;
		}
		  
		var pathStart = obj.value.indexOf('/', 2);
		
		obj.host = ~pathStart
				? obj.value.substring(0, pathStart)
				: obj.value;
				
		
		obj.value = obj.value.replace(obj.host,'');
	}
	
	function parse_search(obj) {
		var question = obj.value.indexOf('?');
		if (question === -1)
			return;
		
		obj.search = obj.value.substring(question);
		obj.value = obj.value.substring(0, question);
	}
	
	function parse_file(obj) {
		var match = rgx_fileWithExt.exec(obj.value),
			file = match == null ? null : match[1];
		
		
		if (file == null) 
			return
		
		
		obj.file = file;
		obj.value = obj.value.substring(0, obj.value.length - file.length);
		obj.value = normalize_pathsSlashes(obj.value);
		
		
		match = rgx_extension.exec(file);
		
		
		obj.extension = match == null ? null : match[1];
	
	}
	



    var URI = function(uri) {
        if (uri == null) 
            return this;
        
        if (util_isUri(uri)) 
            return uri.combine('');
        

        uri = normalize_uri(uri);
		

        this.value = uri;
		
        parse_protocol(this);
        parse_host(this);

        parse_search(this);
        parse_file(this);

		
        // normilize path - "/some/path"
        this.path = normalize_pathsSlashes(this.value);

        if (/^[\w]+:\//.test(this.path)){
            this.path = '/' + this.path;
        }

        return this;
    }
 

    URI.prototype = {
        cdUp: function() {
			if (!this.path)
				return this;
			
			if (this.path === '/')
				return this;
			
			// win32 - is base drive
            if (/^\/?[a-zA-Z]+:\/?$/.test(this.path)) 
                return this;
            
			
            this.path = this.path.replace(/\/?[^\/]+\/?$/i, '');
            return this;
        },
        /**
         * '/path' - relative to host
         * '../path', 'path','./path' - relative to current path
         */
        combine: function(path) {
			
			if (util_isUri(path)) 
				path = path.toString();
			
			
			if (!path) 
				return util_clone(this);
			
			if (rgx_win32Drive.test(path)) {
				return new URI(path);
			}
			
            var uri = util_clone(this);
			
            uri.value = path;
			
            parse_search(uri);
            parse_file(uri);
			
			if (!uri.value) 
				return uri;
			

            
			path = uri.value.replace(/^\.\//i, '');

			if (path[0] === '/') {
				uri.path = path;
				return uri;
			}
			
			
			
			while (/^(\.\.\/?)/ig.test(path)) {
				uri.cdUp();
				path = path.substring(3);
			}

			uri.path = normalize_pathsSlashes(util_combinePathes(uri.path, path));
		
            return uri;
        },
        toString: function() {

            var str = this.protocol ? this.protocol + '://' : '';
            
            str += util_combinePathes(this.host, this.path, this.file) + (this.search || '');
			
			if (!(this.file || this.search)) 
				str += '/'
			
			return str;
        },
        toPathAndQuery: function(){
            return util_combinePathes(this.path, this.file) + (this.search || '');
        },
        /**
         * @return Current URI Path{String} that is relative to @arg1 URI
         */
        toRelativeString: function(uri) {
            if (typeof uri === 'string') 
                uri = new URI(uri);
            
            //if (uri.protocol !== this.protocol || uri.host !== this.host) 
            //    return this.toString();
            

            if (this.path.indexOf(uri.path) === 0) {
				// host folder 
                var p = this.path ? this.path.replace(uri.path, '') : '';
                if (p[0] === '/') 
                    p = p.substring(1);
                
				
                return util_combinePathes(p, this.file) + (this.search || '');
            }

            // sub folder 
            var current = this.path.split('/'),
				relative = uri.path.split('/'),
            	commonpath = '',
            	i = 0,
                length = Math.min(current.length, relative.length);
				
            for (; i < length; i++) {
                if (current[i] === relative[i]) 
                    continue;
                
                break;
            }
			
            if (i > 0) 
                commonpath = current.splice(0, i).join('/');
            
            if (commonpath) {
                var sub = '',
                    path = uri.path,
                    forward;
                while (path) {
                    if (this.path.indexOf(path) == 0) {
                        forward = this.path.replace(path, '');
                        break;
                    }
                    path = path.replace(/\/?[^\/]+\/?$/i, '');
                    sub += '../';
                }
                return util_combinePathes(sub, forward, this.file);
            }


            return this.toString();
        },

        toLocalFile: function() {
			var path = util_combinePathes(this.host, this.path, this.file);
            
			return util_win32Path(path);
        },
        toLocalDir: function() {
            var path = util_combinePathes(this.host, this.path, '/');
			
			return util_win32Path(path);
        },
        toDir: function(){
        	 var str = this.protocol ? this.protocol + '://' : '';
            
            return str + util_combinePathes(this.host, this.path, '/')
        },
        isRelative: function() {
            return !(this.protocol || this.host);
        },
        getName: function(){
            return this.file.replace('.' + this.extension,'');
        }
    }

    URI.combinePathes = util_combinePathes;
	URI.combine = util_combinePathes;

	return URI;
}));
(function() {
	var _cache = {};

	/**
	 *  @augments
	 *      1. {String}, {Value},{Value} ... = Template: '%1,%2'
	 *      2. {String}, {Object} = Template: '#{key} #{key2}'
	 */
	String.format = function(str) {

		if (~str.indexOf('#{')) {
			var output = '',
				lastIndex = 0,
				obj = arguments[1];
			while (1) {
				var index = str.indexOf('#{', lastIndex);
				if (index == -1) {
					break;
				}
				output += str.substring(lastIndex, index);
				var end = str.indexOf('}', index);

				output += Object.getProperty(obj, str.substring(index + 2, end));
				lastIndex = ++end;
			}
			output += str.substring(lastIndex);
			return output;
		}

		for (var i = 1; i < arguments.length; i++) {
			var regexp = (_cache[i] || (_cache[i] = new RegExp('%' + i, 'g')));
			str = str.replace(regexp, arguments[i]);
		}
		return str;

	};


	Object.defaults = function(obj, def) {
		for (var key in def) {
			if (obj[key] == null) {
				obj[key] = def[key];
			}
		}
		return obj;
	};

	Object.clear = function(obj, arg) {
		if (arg instanceof Array) {
			for (var i = 0, x, length = arg.length; i < length; i++) {
				x = arg[i];
				if (x in obj) {
					delete obj[x];
				}
			}
		} else if (typeof arg === 'object') {
			for (var key in arg) {
				if (key in obj) {
					delete obj[key];
				}
			}
		}
		return obj;
	};

	Object.extend = function(target, source) {
		if (target == null) {
			target = {};
		}
		if (source == null) {
			return target;
		}
		for (var key in source) {
			if (source[key] != null) {
				target[key] = source[key];
			}
		}
		return target;
	};

	Object.getProperty = function(o, chain) {
		if (chain === '.') {
			return o;
		}

		var value = o,
			props = typeof chain === 'string' ? chain.split('.') : chain,
			i = -1,
			length = props.length;

		while (value != null && ++i < length) {
			value = value[props[i]];
		}

		return value;
	};

	Object.setProperty = function(o, xpath, value) {
		var arr = xpath.split('.'),
			obj = o,
			key = arr[arr.length - 1];
		while (arr.length > 1) {
			var prop = arr.shift();
			obj = obj[prop] || (obj[prop] = {});
		}
		obj[key] = value;
	};

	Object.lazyProperty = function(o, xpath, fn) {

		if (typeof xpath === 'object') {

			for (var key in xpath) {
				Object.lazyProperty(o, key, xpath[key]);
			}

			return;
		}

		var arr = xpath.split('.'),
			obj = o,
			lazy = arr[arr.length - 1];
		while (arr.length > 1) {
			var prop = arr.shift();
			obj = obj[prop] || (obj[prop] = {});
		}
		arr = null;
		obj.__defineGetter__(lazy, function() {
			delete obj[lazy];
			obj[lazy] = fn();
			fn = null;
			return obj[lazy];
		});
	};
	
	Object.clone = function(obj){
		if (obj == null) 
			return null;
		
		switch (typeof obj) {
			case 'number':
			case 'string':
			case 'function':
				return obj;
		}
		
		if (obj instanceof Array) {
			var array = [];
			
			for (var i = 0, x, imax = obj.length; i < imax; i++){
				array[i] = Object.clone(obj[i]);
			}
			return array;
		}
		
		var Ctor = obj.constructor;
		if (typeof Ctor === 'function') {
			if (Ctor === String || Ctor === Number || Ctor === RegExp || Ctor === Date) {
				return new Ctor(obj);
			}
			
			// do not suppor custom class initializations, as it could be dangerous?
		}
		
		
		var json = {};
		for (var key in obj) {
			json[key] = Object.clone(obj[key]);
		}
		return json;
		
	};

	Object.observe = function(obj, property, callback) {
		if (obj.__observers == null) {
			//-obj.__observers = {};
			Object.defineProperty(obj, '__observers', {
				value: {},
				enumerable: false
			});
		}
		if (obj.__observers[property]) {
			obj.__observers[property].push(callback);
			return;
		}
		(obj.__observers[property] || (obj.__observers[property] = []))
			.push(callback);

		var chain = property.split('.'),
			parent = obj,
			key = property;

		if (chain.length > 1) {
			key = chain.pop();
			parent = Object.getProperty(obj, chain);
		}

		var value = parent[key];
		Object.defineProperty(parent, key, {
			get: function() {
				return value;
			},
			set: function(x) {
				value = x;

				var observers = obj.__observers[property];
				for (var i = 0, length = observers.length; i < length; i++) {
					observers[i](x);
				}
			}
		});
	};


	Date.format = function(date, format) {
		if (!format) {
			format = "MM/dd/yyyy";
		}

		function pad(value) {
			return value > 9 ? value : '0' + value;
		}
		format = format.replace("MM", pad(date.getMonth() + 1));
		var _year = date.getFullYear();
		if (format.indexOf("yyyy") > -1) {
			format = format.replace("yyyy", _year);
		} else if (format.indexOf("yy") > -1) {
			format = format.replace("yy", _year.toString()
				.substr(2, 2));
		}

		format = format.replace("dd", pad(date.getDate()));

		if (format.indexOf("HH") > -1) {
			format = format.replace("HH", pad(date.getHours()));
		}
		if (format.indexOf("mm") > -1) {
			format = format.replace("mm", pad(date.getMinutes()));
		}
		if (format.indexOf("ss") > -1) {
			format = format.replace("ss", pad(date.getSeconds()));
		}
		return format;
	};

	RegExp.fromString = function(str, flags) {
		
 	    return new RegExp(str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), flags);
	};


	// obsolete - is it indeed useful ? === (create delegate)
	Function.invoke = function() {
		var arr = Array.prototype.slice.call(arguments),
			obj = arr.shift(),
			fn = arr.shift();
		return function() {
			return obj[fn].apply(obj, arr);
		};

	};

}());(function(root) {

	var mask = root.mask || Mask,
		tag_CONTENT = '@content',
		tag_PLACEHOLDER = '@placeholder',
		tag_PLACEHOLDER_ELSE = '@else',
		tag_layout_VIEW = 'layout:view',
		tag_layout_MASTER = 'layout:master',
		_masters = {};

	function Master() {}
	Master.prototype = {
		constructor: Master,
		render: function() {
			_masters[this.attr.id] = this;
		}
	};

	mask.registerHandler(tag_layout_MASTER, Master);


	function View() {}
	View.prototype = {
		constructor: View,
		renderStart: function() {
			var masterLayout = _masters[this.attr.master];

			// if DEBUG
			if (masterLayout == null) {
				console.error('Master Layout is not defined for', this);
				return;
			}
			// endif

			if (this.contents == null) {
				this.contents = view_getContents(this.nodes);

				// if DEBUG
				Object.keys && Object.keys(this.contents).length === 0 && console.warn('no contents: @content #someID');
				// endif
			}

			this.nodes = master_clone(masterLayout, this.contents).nodes;
		}
	};

	mask.registerHandler(tag_layout_VIEW, View);

	// UTILS >>

	/**
	 *	if placeholder has no ID attribute,
	 *	then can _defaultContent template inserted into that
	 *	placeholder
	 */
	function master_clone(node, contents, _defaultContent) {

		if (node instanceof Array) {
			var cloned = [];
			for(var i = 0, x, imax = node.length; i < imax; i++){
				x = master_clone(node[i], contents, _defaultContent);
				
				if (node[i].tagName === tag_PLACEHOLDER) {
					
					if (i < imax - 1 && node[i + 1].tagName === tag_PLACEHOLDER_ELSE) {
						i += 1;
						if (x == null) {
							x = master_clone(node[i].nodes, contents, _defaultContent);
						}
					}
					
				}

				if (x == null) {
					continue;
				}

				if (x instanceof Array) {
					cloned = cloned.concat(x);
					continue;
				}

				cloned.push(x);
			}
			return cloned;
		}

		if (node.content != null) {
			return {
				content: node.content,
				type: node.type
			};
		}

		if (node.tagName === tag_PLACEHOLDER) {
			var content = node.attr.id ? contents[node.attr.id] : _defaultContent;

			if (!content) {
				return null;
			}

			return node.nodes == null //
			? content //
			: master_clone(node.nodes, contents, content);
		}

		var outnode = {
			tagName: node.tagName || node.compoName,
			attr: node.attr,
			type: node.type,
			controller: node.controller
		};

		if (node.nodes) {
			outnode.nodes = master_clone(node.nodes, contents, _defaultContent);
		}

		return outnode;
	}

	function view_getContents(node, contents) {
		if (contents == null) {
			contents = {};
		}

		if (node instanceof Array) {
			var nodes = node;
			for (var i = 0, x, imax = nodes.length; i < imax; i++) {
				view_getContents(nodes[i], contents);
			}
			return contents;
		}

		var tagName = node.tagName;
		if (tagName != null && tagName === tag_CONTENT) {
			var id = node.attr.id;

			// if DEBUG
			!id && console.error('@content has no id specified', node);
			contents[id] && console.error('@content already exists', id);
			// endif

			contents[id] = view_wrapContentParents(node);
		}

		if (node.nodes != null) {
			view_getContents(node.nodes, contents);
		}

		return contents;
	}

	function view_wrapContentParents(content) {
		var parents, parent = content.parent;

		while (parent != null && parent.tagName !== tag_layout_VIEW) {
			// not a for..in | performance, as we know all keys
			var p = {
					type: parent.type,
					tagName: parent.tagName,
					attr: parent.attr,
					controller: parent.controller,
					nodes: null
				};

			if (parents == null) {
				parents = p;
				parents.nodes = content.nodes;
			}else{
				parents.nodes = [p];
			}

			parent = parent.parent;
		}

		if (parents != null) {
			return parents;
		}

		return content.nodes;
	}

}(this));

	
	
	

globals['atma'] = this;
	
}.call({}, typeof global !== 'undefined' ? global : window));