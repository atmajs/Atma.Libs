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
    }

    
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
					arr_each(
						_extends,
						proto_extendDefaultsDelegate(protoValue, key)
					);
				}
			}
		}
		
		
		// PRIVATE
		
		function proto_extendDefaultsDelegate(target, key) {
			return function(source){
				var proto = proto_getProto(source),
					val = proto[key];
				if (is_rawObject(val)) {
					obj_defaults(target, val);
				}
			}
		}
		
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
			}
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
			}
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
		                        break;
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
		}
		
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
						
						/*jshint eqeqeq: false*/
						if (value != matcher) { 
							return false;
						}
						/*jshint eqeqeq: true*/
						
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
	
			if (currentInclude != null && currentInclude.type === 'js'){
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
				
				resource = new Resource('package');
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
					
					var pending = include.getPending(),
						await = pending.length;
					if (await === 0) {
						callback();
						return;
					}
					
					var i = -1,
						imax = await;
					while( ++i < imax ){
						pending[i].on(4, check, null, 'push');
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
// end:source ../src/global-vars.js

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
	
	var mask = global.mask || (typeof Mask !== 'undefined' ? Mask : null);
	
	// settings
	
	/** define if routes like '/path' are strict by default,
	 * or set explicit '!/path' - strict, '^/path' - not strict
	 *
	 * Strict means - like in regex start-end /^$/
	 * */
	var	_cfg_isStrict = true,
		_Array_slice = Array.prototype.slice;
	// end:source ../src/vars.js
	
	// source ../src/utils/obj.js
	var obj_extend,
		obj_create;
	(function(){
		
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
	// end:source ../src/utils/obj.js
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
		path_fromCLI,
		path_getQuery,
		path_setQuery
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
		
		path_getQuery = function(path){
			var i = path.indexOf('?');
			if (i === -1) 
				return null;
			
			var query = path.substring(i + 1);
			return query_deserialize(query, '&');
		};
		
		path_setQuery = function(path, mix){
			var query =  typeof mix !== 'string'
				? query_serialize(mix, '&')
				: mix;
				
			var i = path.indexOf('?');
			if (i !== -1) {
				path = path.substring(0, i);
			}
			return path + '?' + query;
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
			navigate: function(mix, opts){
				if (mix == null) {
					this.changed();
					return;
				}
				var isQueryObject = typeof mix === 'object',
					url = null;
				if (opts != null && opts.extend === true) {
					var query   = isQueryObject ? mix : path_getQuery(mix),
						current = path_getQuery(location.search);
						
					if (current != null && query != null) {
						for (var key in current) {
							// strict compare
							if (query[key] !== void 0 && query[key] === null) {
								delete current[key];
							}
						}
						query = obj_extend(current, query);
						url = path_setQuery(url || '', query);
					}
				}
				if (url == null) {
					url = isQueryObject ? path_setQuery('', mix) : mix;
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
			navigate: function(mix, opts){
				this.emitter.navigate(mix, opts);
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
	
	// source ../src/api/utils.js
	var ApiUtils = {
		/*
		 * Format URI path from CLI command:
		 * some action -foo bar === /some/action?foo=bar
		 */
		pathFromCLI: path_fromCLI,
		
		query: {
			serialize: query_serialize,
			deserialize: query_deserialize,
			get: function(path_){
				var path = path_ == null
					? location.search
					: path_;
				return path_getQuery(path);
			}
		}
	};
	// end:source ../src/api/utils.js
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
		navigate: function(mix, opts){
			router_ensure().navigate(mix, opts);
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
		
		/*
		 * @deprecated - use `_` instead
		 */
		$utils: ApiUtils,
		_     : ApiUtils,
	};
	
	
	
	// end:source ../src/ruta.js
	
	// source ../src/mask/attr/anchor-dynamic.js
	(function() {
		if (mask == null) {
			return;
		}
		
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
}));
(function(global) {

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

}());
(function(root) {

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

	
	
	

function obj_extend(target, source) {
	
	for (var key in source) {
		if (source[key] == null) 
			continue;
		
		if (globals[key] != null
			&& typeof globals[key] === 'object'
			&& typeof source[key] === 'object') {
			
			obj_extend(globals[key], source[key]);
			continue;
		}
		
		target[key] = source[key];
	}
}


obj_extend(globals, this);

	
}.call({}, typeof global !== 'undefined' ? global : window));