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
	// source /src/store/mongo/MongoStore.js
	
	Class.MongoStore = (function(){
		
		// source utils.js
		var cb_createListener,
			cb_completeDelegate
			;
		
		(function(){
		
			cb_createListener = function(count, cb){
				var _error;
				return function(error){
					if (error)
						_error = error;
						
					if (--count === 0)
						cb(_error);
				};
			};
			
			cb_completeDelegate = function(dfr) {
				return function(error){
					if (error) 
						return dfr.reject(error);
					dfr.resolve();
				}
			};
			
		}());
		
		// end:source utils.js
		// source Settings.js
		
		var __ip = '127.0.0.1',
		    __port = 27017,
		    __db,
		    __connection,
		    __params = {
		        auto_reconnect: true,
		        native_parser: true,
		        w: 1
		    }
		    ;
		    
		var Settings = function(setts){
		    if (setts.ip) 
		        __ip = setts.ip; 
		    
		    if (setts.port) 
		        __port = setts.port; 
		    
		    if (setts.db) 
		        __db = setts.db;
		    
		    if (setts.params) 
		        __params = setts.params;
		    
		    __connection = setts.connection;
		};
		
		
		function settings_getConnectionString(){
		    if (__connection) 
		        return __connection;
		    
		    if (!__db) 
		        return null;
		    
		    return 'mongodb://'
		        + __ip
		        + ':'
		        + __port
		        + '/'
		        + __db
		        ;
		}
		// end:source Settings.js
		// source Driver.js
		
		var db_getDb,
		    db_getCollection,
		    db_findSingle,
		    db_findMany,
		    db_count,
		    db_insert,
		    db_insertSingle,
		    db_insertMany,
		    db_updateSingle,
		    db_updateMany,
		    db_remove,
		    db_ensureObjectID,
		    db_patchSingle,
		    db_ensureIndex,
		    
		    db_getMongo,
		    
		    db_resolveCollection,
		    db_resolveDb,
		    
		    db_profiler_toggle,
		    db_profiler_getData
		    ;
		
		(function(){
		    // source DriverCore.js
		    var core_findSingle,
		    	core_findMany,
		    	
		    	core_upsertSingle,
		    	core_upsertMany,
		    	
		    	core_updateSingle,
		    	core_updateMany,
		    	
		    	core_removeSingle,
		    	core_removeMany,
		    	
		    	core_count,
		    	
		    	core_profileIndexes_Enable,
		    	core_profileIndexes_GetData
		    	;
		    	
		    (function(){
		    	
		    	core_findSingle = function(coll, query, options, callback /*<error, item>*/){
		    		var c = db.collection(coll);
		    		if (options == null) {
		    			return c.findOne(query, callback);
		    		}
		    		c.findOne(query, options, callback);
		    	};
		    	
		    	core_findMany = function(coll, query, options, callback /*<error, array>*/){
		    		var c = db.collection(coll);
		    		if (options == null) 
		    			return c.find(query, onQuery);
		    		
		    		c.find(query, options, onQuery);
		    			
		    		function onQuery(error, cursor){
		    			if (error) {
		    				return callback(error);
		    			}
		    			cursor.toArray(callback);
		    		}
		    	};
		    	
		    	core_upsertSingle = function(coll, query, data, callback/*<error, stats>*/){
		    		db
		    			.collection(coll)
		    			.update(query, data, opt_upsertSingle, callback);
		    	};
		    	core_upsertMany = function(coll, array /*[[query, data]]*/, callback){
		    		modifyMany(core_upsertSingle, coll, array, callback);
		    	};
		    	
		    	core_updateSingle = function(coll, query, mod, callback /*<error, stats>*/){
		    		db
		    			.collection(coll)
		    			.update(query, mod, callback);
		    	};
		    	core_updateMany = function(coll, array/*[[query, data]]*/, callback){
		    		modifyMany(core_updateSingle, coll, array, callback);
		    	};
		    	
		    	core_removeSingle = function(coll, query, callback /*<error, count>*/){
		    		db
		                .collection(coll)
		                .remove(query, { justOne: true }, callback);
		    	};
		    	core_removeMany = function(coll, query, callback /*<error, count>*/){
		    		db
		    			.collection(coll)
		    			.remove(query, { justOne: false }, callback);
		    	};
		    	
		    	core_count = function(coll, query, callback/*<error, count>*/){
		    		db
		    			.collection(coll)
		    			.count(query, callback);
		    	}
		    	
		    	// ==== private
		    	
		    	var opt_upsertSingle = {
		    		upsert: true,
		    		multi: false,
		    	};
		    	function modifyMany(modifier, coll, array /*[[query, data]]*/, callback) {
		    		var error,
		    			imax = array.length,
		    			count = imax;
		    			i = -1;
		    		if (imax === 0) 
		    			return callback();
		    		
		    		while ( ++i < imax ){
		    			modifier(coll, array[i][0], array[i][1], listener);
		    		}
		    		
		    		function listener(err){
		    			if (err) 
		    				error = err;
		    			
		    			if (--count === 0) 
		    				callback(error);
		    		}
		    	}
		    	
		    }());
		    // end:source DriverCore.js
		    // source DriverProfiler.js
		    var core_profiler_toggle,
		    	core_profiler_getData
		    	;
		    
		    (function(){
		    	var state = false,
		    	
		    		// settins
		    		setts_slowLimit = 50,
		    		setts_onDetect = null,
		    		setts_detector = null,
		    		
		    		box = {
		    			count: 0,
		    			slow: [],
		    			errors: []
		    		},
		    		
		    		_core_findSingle = core_findSingle,
		    		_core_findMany = core_findMany,
		    		_core_upsertSingle = core_upsertSingle,
		    		_core_upsertMany = core_upsertMany,
		    		_core_updateSingle = core_updateSingle,
		    		_core_updateMany = core_updateMany,
		    		_core_removeSingle = core_removeSingle,
		    		_core_removeMany = core_removeMany,
		    		_core_count = core_count
		    		;
		    	
		    	core_profiler_getData = function(){
		    		return box;
		    	};
		    	
		    	core_profiler_toggle =  function(enable, settings){
		    		if (settings) {
		    			setts_slowLimit = settings.slow || setts_slowLimit;
		    			setts_onDetect = settings.onDetect || setts_onDetect;
		    			setts_detector = settings.detector || setts_detector;
		    		}
		    		
		    		if (state === enable) 
		    			return;
		    		if (enable == null) 
		    			enable = !!state;
		    		
		    		state = enable;
		    		if (state === false) {
		    			core_findSingle = _core_findSingle;
		    			core_findMany = _core_findMany;
		    			core_upsertSingle = _core_upsertSingle;
		    			core_upsertMany = _core_upsertMany;
		    			core_updateSingle = _core_updateSingle;
		    			core_updateMany = _core_updateMany;
		    			core_removeSingle = _core_removeSingle;
		    			core_removeMany = _core_removeMany;
		    			core_count = _core_count;
		    			return;
		    		}
		    		
		    		core_findSingle = function(coll, query, options, callback /*<error, item>*/){
		    			_core_findSingle.apply(null, arguments);
		    			_core_findSingle(
		    				coll
		    				, wrapQuery(query)
		    				, options
		    				, analizator(coll, query));
		    		};
		    		core_findMany = function(coll, query, options, callback /*<error, array>*/){
		    			_core_findMany.apply(null, arguments);
		    			_core_findMany(
		    				coll
		    				, wrapQuery(query)
		    				, options
		    				, analizator(coll, query));
		    		};
		    		core_upsertSingle = function(coll, query, data, callback/*<error, stats>*/){
		    			_core_upsertSingle.apply(null, arguments);
		    			_core_upsertSingle(
		    				coll
		    				, wrapQuery(query)
		    				, data
		    				, analizator(coll, query));
		    		};
		    		core_upsertMany = function(coll, array /*[[query, data]]*/, callback){
		    			_core_upsertMany.apply(null, arguments);
		    			_core_upsertMany(
		    				coll
		    				, wrapMany(array)
		    				, analizator(coll, array));
		    		};
		    		core_updateSingle = function(coll, query, mod, callback /*<error, stats>*/){
		    			_core_updateSingle.apply(null, arguments);
		    			_core_updateSingle(
		    				coll
		    				, wrapQuery(query)
		    				, mod
		    				, analizator(coll, query));
		    		};
		    		core_updateMany = function(coll, array/*[[query, data]]*/, callback){
		    			_core_updateMany.apply(null, arguments);
		    			_core_updateMany(
		    				coll
		    				, wrapMany(array)
		    				, analizator(coll, array));
		    		};
		    		core_removeSingle = function(coll, query, callback /*<error, count>*/){
		    			_core_removeSingle.apply(null, arguments);
		    			_core_removeSingle(
		    				coll
		    				, wrapQuery(query)
		    				, analizator(coll, query));
		    		};
		    		core_removeMany = function(coll, query, callback /*<error, count>*/){
		    			_core_removeMany.apply(null, arguments);
		    			_core_removeMany(
		    				coll
		    				, wrapQuery(query)
		    				, analizator(coll, query));
		    		};
		    		core_count = function(coll, query, callback/*<error, count>*/){
		    			_core_count.apply(null, arguments);
		    			_core_count(
		    				coll
		    				, wrapQuery(query)
		    				, analizator(coll, query));
		    		};
		    	}
		    	
		    	function wrapQuery(query){
		    		if (query == null) 
		    			return { $query: {}, $explain: true };
		    		
		    		if (query.$query) {
		    			query.$explain = true;
		    			return query;
		    		}
		    		return {
		    			$query: query,
		    			$explain: true
		    		};
		    	}
		    	function wrapMany(array){
		    		return array.forEach(function(x){
		    			return [ wrapQuery(x[0]), x[1]];
		    		});
		    	}
		    	function analizator(coll, query) {
		    		return function(error, plan){
		    			box.count++;
		    			if (error) {
		    				box.errors.push(error);
		    				return;
		    			}
		    			analize(coll, query, plan);
		    		}
		    	}
		    	function analize(coll, query, plan, params){
		    		params = params || {};
		    		if (plan == null || typeof plan === 'number') 
		    			return;
		    		if (Array.isArray(plan)) {
		    			plan.forEach(function(plan, index){
		    				params.isArray = true;
		    				params.index = index;
		    				analize(coll, query, plan, params);
		    			});
		    			return;
		    		}
		    		if (plan.clause) {
		    			plan.clause.forEach(function(plan, index){
		    				params.isClause = true;
		    				params.index = index;
		    				analize(coll, query, plan, index);
		    			});
		    			return;
		    		}
		    		if (plan.millis != null && plan.millis >= setts_slowLimit) {
		    			add('slow', coll, query, plan, params);
		    			return;
		    		}
		    		if (plan.cursor == null) 
		    			return;
		    		
		    		if (plan.cursor.indexOf('BasicCursor') !== -1) {
		    			add('unindexed', coll, query, plan, params);
		    			return;
		    		}
		    		if (setts_detector && setts_detector(plan, coll, query)) {
		    			add('custom', coll, query, plan, params);
		    			return;
		    		}
		    	}
		    	function add(reason, coll, query, plan, params){
		    		params.reason = reason;
		    		
		    		var obj = {
		    			coll: coll,
		    			query: query,
		    			plan: plan,
		    			params: params
		    		};
		    		setts_onDetect && setts_onDetect(obj);
		    		box.slow.push(obj);
		    	}
		    }());
		    // end:source DriverProfiler.js
		    
		    db_profiler_getData = core_profiler_getData;
		    db_profiler_toggle = core_profiler_toggle;
		    
		    var db,
		        mongo;
		        
		    db_getCollection = function(name, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_getCollection, name, callback));
		        
		        var coll = db.collection(name);
		        if (coll == null) 
		            return callback('<mongo> Collection Not Found: ' + name);
		        
		        callback(null, coll);
		    };
		    
		    db_resolveCollection = function(name){
		        var dfr = new Class.Deferred();
		        db_getCollection(name, function(err, coll) {
		            if (err) 
		                return dfr.reject(err);
		            dfr.resolve(coll)
		        });
		        return dfr;  
		    };
		    
		    db_getDb = function(callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_getDb, callback));
		        callback(null, db);
		    };
		    
		    db_resolveDb = function(name){
		        var dfr = new Deferred();
		        db_getDb(function(error, db){
		            if (error) 
		                return dfr.reject(error);
		            dfr.resolve(db);
		        })
		        return dfr;
		    };
		    
		    db_findSingle = function(coll, query, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_findSingle, coll, query, callback));
		        core_findSingle(coll, queryToMongo(query), null, callback);
		    };
		    
		    db_findMany = function(coll, query, options, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_findMany, coll, query, options, callback));
		        if (options == null) 
		            options = {};
		        core_findMany(coll, queryToMongo(query), options, callback);
		    };
		    
		    db_count = function(coll, query, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_count, coll, query, callback));
		        core_count(coll, query, callback);
		    };
		    
		    db_insert = function(coll, data, callback){
		        if (db == null)
		            return connect(createDbDelegate(db_insert, coll, data, callback));
		        db
		            .collection(coll)
		            .insert(data, { safe: true }, callback);
		    };
		    db_insertSingle = function(coll, data, callback){
		        if (db == null)
		            return connect(createDbDelegate(db_insertSingle, coll, data, callback));
		        db
		            .collection(coll)
		            .insertOne(data, { safe: true }, callback);
		    };
		    db_insertMany = function(coll, data, callback){
		        if (db == null)
		            return connect(createDbDelegate(db_insertMany, coll, data, callback));
		        db
		            .collection(coll)
		            .insertMany(data, { safe: true }, callback);
		    };
		    
		    db_updateSingle = function(coll, data, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_updateSingle, coll, data, callback));
		        
		        if (data._id == null) 
		            return callback('<mongo:update> invalid ID');
		        
		        var query = {
		            _id: db_ensureObjectID(data._id)
		        };
		        core_updateSingle(coll, query, data, callback);
		    };
		    
		    db_updateMany = function(coll, array, callback){
		        var batch = array.map(function(x){
		            return [
		                {_id: db_ensureObjectID(x._id) },
		                x
		            ];
		        });
		        core_updateMany(coll, batch, callback);
		    };
		    
		    db_patchSingle = function(coll, id, patch, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_patchSingle, coll, id, patch, callback));
		        
		        var query = { _id: db_ensureObjectID(id) };
		        core_updateSingle(coll, query, patch, callback);
		    };
		    
		    db_remove = function(coll, query, isSingle, callback){
		        if (db == null) 
		            return connect(db_remove.bind(null, coll, query, callback));
		        
		        query = queryToMongo(query);
		        
		        var fn = isSingle
		            ? core_removeSingle
		            : core_removeMany
		            ;
		        fn(coll, query, callback);
		    };
		    
		    /**
		     * index:
		     *    - Object { foo: 1}
		     *    - Array<Object, Options> [{foo:1}, {unique: true }]
		     */
		    db_ensureIndex = function(collection, index, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_ensureIndex, collection, index, callback));
		        
		        var coll = db.collection(collection);
		        if (Array.isArray(index)) {
		            coll.ensureIndex(index[0], index[1], callback);
		            return;
		        }
		        coll.ensureIndex(index, callback);
		    };
		    
		    db_ensureObjectID = function(value){
		        if (is_String(value) && value.length === 24) 
		            return db_getMongo().ObjectID(value);
		        return value;
		    };
		    
		    db_getMongo = function(){
		        db_getMongo = function() { return mongo; };
		        return (mongo = require('mongodb'));
		    };
		    
		    var connect = (function(){
		        
		        var listeners = [],
		            connecting = false,
		            connection;
		        
		        return function(callback){
		            if (db) 
		                return callback();
		            
		            if (__db == null) 
		                return callback('Database is not set. Call Class.MongoStore.settings({db:"myDbName"})');
		            
		            listeners.push(callback);
		            if (connecting) 
		                return;
		            
		            db_getMongo();
		            
		            connecting = true;
		            connection = settings_getConnectionString();
		            
		            if (!connection) 
		                return callback('<mongo> Invalid connection string');
		            
		            mongo
		                .MongoClient
		                .connect(
		                    connection,
		                    __params,
		                    onConnected
		                );
		
		            function onConnected(err, database){
		                if (err == null) 
		                    db = database;
		                
		                var imax = listeners.length,
		                    i = -1;
		                
		                while( ++i < imax ) {
		                    listeners[i](err);
		                }
		                
		                listeners.length = 0;
		                connecting = false;
		            }
		        };
		    }());
		    
		    var queryToMongo = function(query){
		        if (query == null) 
		            return query;
		        
		        if (query.hasOwnProperty('$query') || query.hasOwnProperty('$limit')) 
		            return query;
		        
		        
		        if (query.hasOwnProperty('_id')) 
		            query._id = db_ensureObjectID(query._id);
		        
		        var comparer = {
		            62: {
		                // >
		                0: '$gt',
		                // >=
		                61: '$gte' 
		            },
		            60: {
		                // <
		                0: '$lt',
		                // <=
		                61: '$lte' 
		            }
		        };
		        
		        for (var key in query) {
		            var val = query[key],
		                c;
		                
		            if (typeof  val === 'string') {
		                c = val.charCodeAt(0);
		                switch(c){
		                    case 62:
		                    case 60:
		                        
		                        // >
		                        var compare = comparer[c]['0'];
		                        
		                        if (val.charCodeAt(1) === 61) {
		                            // =
		                            compare = comparer[c]['61'];
		                            val = val.substring(2);
		                        }else{
		                            val = val.substring(1);
		                        }
		                        query[key] = {};
		                        query[key][compare] = parseInt(val);
		                        
		                        continue;
		                };
		            }
		        }
		        
		        return query;
		    };
		    
		    var createDbDelegate = function(fn){
		        var args = _Array_slice.call(arguments, 1),
		            callback = args[args.length - 1]
		            ;
		        return function(error){
		            if (error) 
		                return callback(error);
		            
		            if (arguments.length > 0) 
		                args = args.concat(arguments);
		            
		            return fn_apply(fn, null, args);
		        };
		    };
		}());
		// end:source Driver.js
		// source IndexHandler.js
		var IndexHandler;
		(function(){
			IndexHandler = {
				add: function(coll, indexes){
					_container.push([coll, indexes]);
				},
				ensureAll: ensureAll,
				ensure: ensure
			};
			
			// == private
			var i_Coll = 0,
				i_Indexes = 1
				;
			
			var _container = [];
			
			function ensure(coll, indexes, callback){
				var i = -1,
					imax = indexes.length,
					listener = cb_createListener(imax, callback)
					;
				
				while(++i < imax){
					db_ensureIndex(coll, indexes[i], listener);
				}
			}
			
			function ensureAll(callback){
				var dfr = new Deferred,
					imax = _container.length,
					listener = cb_createListener(imax, callback),
					i = -1
					;
					
				while ( ++i < imax ){
					ensure(
						_container[i][i_Coll],
						_container[i][i_Indexes],
						listener
					);
				}
			}
			
		}());
		// end:source IndexHandler.js
		// source MongoStoreCtor.js
		function MongoStoreCtor(mix) {
			var primaryKey = '_id',
				indexes = null,
				coll
				;
			
			if (is_String(mix)) {
				coll = mix;
			}
			else if (is_Object(mix)) {
				coll = mix.collection;
				indexes = mix.indexes;
				
				if (mix.primaryKey != null) {
					primaryKey = mix.primaryKey;
					
					var index = {};
					index[primaryKey] = 1;
					
					if (indexes == null) 
						indexes = [];
					indexes.push([index, { unique: true }]);
				}
				
			}
			
			// if DEBUG
			!coll && console.error('<MongoStore> should define a collection name', mix);
			// endif
			
			this._coll = coll;
			this._indexes = indexes;
			this._primaryKey = primaryKey;
			
			if (indexes != null) 
				IndexHandler.add(coll, indexes);
		}
		// end:source MongoStoreCtor.js
		// source MongoSingle.js
		var MongoStoreSingle = (function() {
		
			function MongoStoreSingle(mix) {
				MongoStoreCtor.call(this, mix);
			}
			
			/**
			 * @TODO - replace ensureFree with a stack of calls
			 */
			obj_inherit(MongoStoreSingle, StoreProto, Serializable, Deferred, {
				
				fetch: function(data) {
					if (this._ensureFree() === false)
						return this;
					
					db_findSingle(this._coll, data, fn_proxy(this._fetched, this));
					return this;
				},
				save: function() {
					if (this._ensureFree() === false)
						return this;
					
					var json = this.serialize(),
						fn = json._id == null
							? db_insertSingle
							: db_updateSingle
							;
					
					fn(this._coll, json, fn_proxy(this._inserted, this));
					return this;
				},
				del: function() {
					if (this._ensureFree() === false)
						return this;
					
					if (this._id) {
						db_remove(this._coll, {
							_id: this._id
						}, true, fn_proxy(this._completed, this));
					}
					else {
						this._completed('<class:patch> `_id` is not defined');
					}
					
					return this;
				},
				
				patch: function(patch){
					if (this._ensureFree() === false) 
						return this;
					
					if (this._id == null)
						return this._completed('<class:patch> `_id` is not defined');
					
					var error = obj_patchValidate(patch);
					if (error != null) 
						return this._completed(error)
					
					obj_patch(this, patch);
					db_patchSingle(
						this._coll,
						this._id,
						patch,
						fn_proxy(this._completed, this)
					);
				
					return this;
				},
				
				Static: {
					fetch: function(data) {
						
						return new this().fetch(data);
					},
					
					resolveCollection: function(){
						
						return db_resolveCollection(new this()._coll);
					}
				},
			
				serialize: function(){
					return json_proto_toJSON.call(this);
				},
				
				deserialize: function(json){
					
					Serializable
						.deserialize(this, json);
					
					if (this._id)
						this._id = db_ensureObjectID(this._id);
				  
					return this;  
				},
				
				/* -- private -- */
		        _busy: false,
				
				_coll: null,
				_indexes: null,
				_primaryKey: null,
				
				_ensureFree: function(){
					if (this._busy) {
						console.warn('<mongo:single> transport requested, but is busy for the same instance.');
						return false;
					}
					
					this.defer();
					this._busy = true;
					
					return true;
				},
				_completed: function(error){
					this._busy = false;
					
					return error 
						? this.reject(error)
						: this.resolve(this)
						;
				},
				_fetched: function(error, json) {
					if (error == null) {
						if (json == null) {
							error = {
								message: 'Entry Not Found',
								code: 404
							};
						}
						else {
							this.deserialize(json);
						}
					}
					
					this._completed(error);
				},
				
				_inserted: function(error, result){
					if (error == null) {
						var array = result.ops;
						if (array != null && this._id == null) {
							if (is_Array(array) && array.length === 1) {
								this._id = array[0]._id
							}
							else {
								console.error('<mongo:insert-single> expected an array in callback');
							}
						}
					}
					this._completed(error);
				}
			});
			
			var Constructor = function(collection) {
			
				return new MongoStoreSingle(collection);
			};
			
			Constructor.prototype = MongoStoreSingle.prototype;
			
			
			return Constructor;
		
		}());
		// end:source MongoSingle.js
		// source MongoCollection.js
		var MongoStoreCollection = (function(){
		    
		    function MongoStoreCollection(mix){
		        MongoStoreCtor.call(this, mix);
		    }
		    
		    function collection_push(collection, json){
		        var Constructor = collection._ctor,
		            instance = new Constructor(json);
		            
		        if (instance._id == null && is_Function(instance.deserialize)) {
		            instance.deserialize(json);
		        }
		        
		        collection[collection.length++] = instance;
		    }
		    
		    obj_inherit(MongoStoreCollection, Deferred, {
		        
		        fetch: function(query, options){
		            if (this._ensureFree() === false)
		                return this;
		            
		            db_findMany(this._coll, query, options, fn_proxy(this._fetched, this));
		            return this;
		        },
		        save: function(){
		            if (this._ensureFree() === false)
		                return this;
		            
		            var insert = [],
						insertIndexes = [],
		                update = [],
		                coll = this._coll,
		                onComplete = fn_proxy(this._completed, this);
		            
		            for (var i = 0, x, imax = this.length; i < imax; i++){
		                x = this[i];
		                
		                if (x._id == null) {
		                    insert.push(x.serialize());
							insertIndexes.push(i);
		                    continue;
		                }
		                update.push(x.serialize());
		            }
		            
		            if (insert.length && update.length) {
		                var listener = cb_createListener(2, onComplete);
		                
		                db_insertMany(coll, insert, this._insertedDelegate(this, listener, insertIndexes));
		                db_updateMany(coll, update, listener);
		                return this;
		            }
		            
		            if (insert.length) {
		                db_insertMany(coll, insert, this._insertedDelegate(this, this._completed, insertIndexes));
		                return this;
		            }
		            
		            if (update.length) {
		                db_updateMany(coll, update, onComplete);
		                return this;
		            }
		            
		            return this;
		        },
		        del: function(data){
		            if (data == null && arguments.length !== 0) {
						console.error('<MongoStore:del> - selector is specified, but is undefined');
						return this;
					}
		            
		            if (this._ensureFree() === false)
		                return this;
		            
		            var array = data == null
		                ? this.toArray()
		                : this.remove(data)
		                ;
		                
		            if (array && array.length) {
		                var ids = [];
		                for (var i = 0, x, imax = array.length; i < imax; i++){
		                    x = array[i];
		                    if (x._id) {
		                        ids.push(x._id);
		                    }
		                }
		                
		                db_remove(this._coll, {
		                    _id: {
		                        $in: ids
		                    }
		                }, false, fn_proxy(this._completed, this));
		                
		            }else{
		                this._completed();   
		            }
		            
		            return this;
		        },
		        
		        
		        Static: {
		            fetch: function(query, options){
		                return new this().fetch(query, options);
		            },
					count: function(query){
						var dfr = new Deferred;
						db_count(this.prototype._coll, query, function(error, count){
							if (error != null) {
								dfr.reject(count);
								return;
							}
							dfr.resolve(count);
						});
						return dfr;
					}
		        },
		        
		        /* -- private -- */
		        _busy: false,
				
				_coll: null,
				_indexes: null,
				_primaryKey: null,
				
		        _ensureFree: function(){
		            if (this._busy) {
						console.warn('<mongo:collection> requested transport, but is busy by the same instance.');
		                return false;
		            }
		            
		            this._busy = true;
		            this._resolved = null;
		            this._rejected = null;
		            
		            return true;
		        },
		        _completed: function(error){
		            this._busy = false;
		            
		            if (error) 
		                this.reject(error);
		            else
		                this.resolve(this);
		        },
		        _fetched: function(error, json){
		            if (arr_isArray(json)) {
		                
		                for (var i = 0, x, imax = json.length; i < imax; i++){
		                    x = json[i];
		                    
		                    collection_push(this, x);
		                }
		                
		            } else if (json) {
		                collection_push(this, json);
		            }
		            
		            this._completed(error);
		        },
				
				_insertedDelegate: function(ctx, callback, indexes){			
					/**
					 *	@TODO make sure if mongodb returns an array of inserted documents
					 *	in the same order as it was passed to insert method
					 */			
					function call(error) {
						callback.call(ctx, error);
					}			
					return function(error, result){
						if (error == null) {
							var coll = result.ops;
							if (is_Array(coll) === false) {
								console.error('<mongo:bulk insert> array expected');					
								return call();
							}
							
							if (coll.length !== indexes.length) {
								console.error('<mongo:bul insert> count missmatch', coll.length, indexes.length);
								return call();
							}
							
							for (var i = 0, index, imax = indexes.length; i < imax; i++){
								index = indexes[i];
								
								ctx[index]._id = coll[i]._id;
							}
						}
						call(error);
					};
				}
		    });    
		    
		    
		    var Constructor = function(collection) {
		
		        return new MongoStoreCollection(collection);
		    };
		
		    Constructor.prototype = MongoStoreCollection.prototype;
		
		
		    return Constructor;
		
		}());
		// end:source MongoCollection.js
		
		
		return {
			Single: MongoStoreSingle,
			Collection: MongoStoreCollection,
			settings: Settings,
			
			resolveDb: db_resolveDb,
			resolveCollection: db_resolveCollection,
			
			createId: function(id){
				return db_ensureObjectID(id);
			},
			
			ensureIndexes: function(Ctor) {
				var proto = Ctor.prototype,
					indexes = proto._indexes,
					coll = proto._coll,
					dfr = new Deferred()
					;
					
				if (indexes == null) 
					return dfr.reject('<No indexes> ' + coll);
				
				IndexHandler.ensure(coll, indexes, cb_completeDelegate(dfr));
				return dfr;
			},
			
			ensureIndexesAll: function(){
				var dfr = new Deferred;
				IndexHandler.ensureAll(cb_completeDelegate(dfr));
				return dfr;
			},
			
			profiler: {
				/* ( state, { slowLimit, onDetect, detector } ) */
				toggle: db_profiler_toggle,
				getData: db_profiler_getData
			}
		};
	}());
	
	// end:source /src/store/mongo/MongoStore.js
	

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
	
	// source ../src/node/node.js
	(function(){
		
		cfg.server = true;
	    
	    var vm = require('vm'),
			Module = (global.module || module).constructor;
	    
		// source utils/file.js
		
		var fs_exists,
			file_read,
		    file_watch;
		    
		(function(){
		    var _fs = require('fs'),
				_watchers = {};
				
		    file_read = function(url, callback){
		        if (cfg.sync) {
					try {
						var content = _fs.readFileSync(url, 'utf8');
						
						callback(null, content);
					} catch(error) {
						console.error('File Read - ', error);
					}
					
					return;
				}
				_fs.readFile(url, 'utf8', callback);
		    };
		    
		    file_watch =  function(path, callback){
		        _unbind(path);
		        _watchers[path] = _fs.watch(path, callback);
		    };
		    
			fs_exists = function(path){
				return _fs.existsSync(path);
			};
		    
		    function _unbind(path) {
		        if (_watchers[path] == null)
		            return;
		        
		        _watchers[path].close();
		        _watchers[path] = null;
		    }
		    
		}());
			
			
		// end:source utils/file.js
		// source utils/bin.js
		var bin_removeDelegate,
		    bin_remove,
		    bin_tryReload
		    ;
		
		(function(){
		        
		    bin_removeDelegate = function(url) {
		        // use timeout as sys-file-change event is called twice
		        var timeout;
		        return function() {
		            if (timeout)
		                clearTimeout(timeout);
		    
		            timeout = setTimeout(function() {
		                
		                var triggerFn;
		                if (typeof cfg.autoreload === 'object') {
		                    triggerFn = function(state){
		                        state !== false && cfg.autoreload.fileChanged(url, 'include');
		                    };
		                }
		                
		                bin_tryReload(url, triggerFn);
		                
		            }, 150);
		        };
		    };
		    
		    bin_remove = function(path) {
		        if (path == null)
		            return;
		    
		        var type,
		            id,
		            index,
		            res,
		            parents = []
		            ;
		    
		        for (type in bin) {
		    
		            for (id in bin[type]) {
		                res = bin[type][id];
		    
		                index = id.indexOf(path);
		                if (index !== -1 && index === id.length - path.length) {
		    
		                    bin_clearCache(type, id);
		                    
		                    var arr = res.parent && res.parent.url
		                        ? bin_remove(res.parent.url)
		                        : [ res ]
		                        ;
		                    parents
		                        .push
		                        .apply(parents, arr);
		                }
		            }
		    
		        }
		        
		        if (parents.length === 0) {
		            console.warn('<include:res:remove> Resource is not in cache', path);
		        }
		            
		        return parents;
		    };
		    
		    bin_tryReload = function(path, callback) {
		        var parents = bin_remove(path).filter(function(x){ return x != null; });
		        if (parents.length === 0) {
		            callback && callback(false);
		            return;
		        }
		        
		        var count = parents.length,
		            imax = count,
		            i = -1;
		        
		        while (++i < imax) {
		            bin_load(parents[i])
		                .done(function(){
		                    
		                    if (--count === 0 && callback) 
		                        callback();
		                });
		        }
		    }
		
		    // PRIVATE
		    
		    function bin_load(resource) {
		        if (resource == null)
		            return;
		    
		        resource.content = null;
		        resource.exports = null;
		    
		        var parent = resource.parent;
		        return parent
		            .create(
		                resource.type,
		                resource.route,
		                resource.namespace,
		                resource.xpath
		            )
		            .on(4, parent.childLoaded);
		    
		    }
		    
		    function bin_clearCache(type, id){
		        var resource = bin[type][id],
		            children = resource.includes
		            ;
		        delete bin[type][id];
		        
		        if (children == null) 
		            return;
		        
		        children.forEach(function(child){
		            var resource = child.resource,
		                type = resource.type,
		                id = resource.url
		                ;
		                
		            if (id[0] !== '/') 
		                id = '/' + id;
		                
		            delete bin[type][id];
		        });
		    }
		    
		}());
		
		// end:source utils/bin.js
		
		
	    // source xhr.js
	    
	    XMLHttpRequest = function() {};
	    XMLHttpRequest.prototype = {
	        constructor: XMLHttpRequest,
	        open: function(method, url) {
	            this.url = url;
	        },
	        send: function() {
	    
	            if (this.url.indexOf('file://') !== -1) {
	                this.url = path_getFile(this.url);
	            }
	    
	            var that = this;
	            
	            file_read(this.url, function(err, data) {
	                if (err) {
	                    console.error('>>', err.code, err.path);
	                    data = '';
	                }
	                that.readyState = 4;
	                that.responseText = data;
	                that.onreadystatechange();
	                
	                if (err == null && cfg.autoreload) {
	                    file_watch(that.url, bin_removeDelegate(that.url));
	                }
	            });
	        
	        }
	    };
	    // end:source xhr.js
		// source eval.js
		
		__eval = function(source, include, isGlobalCntx) {
		    module.exports = {};
		    
		    global.include = include;
		    global.require = require;
		    global.exports = module.exports;
		    global.__filename = path_getFile(include.url);
		    global.__dirname = path_getDir(global.__filename);
		    global.module = module;
		
		    if (isGlobalCntx !== true) {
		        source = '(function(){ ' + source + '\n}())';
		    }
		
		    try {
		        //- vm.runInThisContext(source, global.__filename);
		        
		        if (!isGlobalCntx) {
		            var filename = global.__filename
		            module = new Module(filename, module);
		            module.paths = Module._nodeModulePaths(path_getDir(filename));
		            module.filename = filename;
		            module._compile(source, filename);
		            module.loaded = true;
		        }
		        
		        else {
		            vm.runInThisContext(source, global.__filename);
		        }
		        
		    } catch(e) {
		        console.error('Module Evaluation Error', include.url);
		        console.error(e.stack);
		    }
		    
		    
		    
		    if (include.exports == null) {
		        var exports = module.exports;
		        
		        if (typeof exports !== 'object' || Object.keys(exports).length) {
		            include.exports = module.exports;
		        }
		    }
		
		};
		
		// end:source eval.js
		
		
		// source export-resource.js
		(function(){
		    
		    var npmPath,
		        atmaPath
		        ;
		    
		    obj_inherit(Resource, {
		        
		        isBrowser: false,
		        isNode: true,
		        
		        bin_remove: bin_remove,
		        bin_tryReload: bin_tryReload,
		        path_getFile: function() {
		            return path_getFile(this.url);
		        },
		    
		        path_getDir: function() {
		            return path_getDir(path_getFile(this.url));
		        },
		    
		        inject: function() {
		    
		            var pckg = arguments.length === 1
		                ? arguments[0]
		                : __array_slice.call(arguments);
		    
		            this.state = this.state >= 3 ? 3 : 2;
		    
		            var current = this,
		                bundle = current.create()
		                ;
		    
		            bundle.url = this.url;
		            bundle.location = this.location;
		            
		            bundle
		                .load(pckg)
		                .done(function(resp) {
		    
		                bundle.state = 3;
		                bundle.on(4, function() {
		                    
		                    var remove = 1;
		                    var index = ruqq.arr.indexOf(current.includes, function(res){
		                        return res.resource === bundle;
		                    });
		                    if (index === -1){
		                        index = current.includes.length - 1;
		                        remove = 0;
		                    }
		                    
		                    current
		                        .includes
		                        .splice
		                        .apply(current.includes, [index, remove].concat(bundle.includes));
		    
		                    current.readystatechanged(3);
		                });
		                    
		                inject_process(bundle, 0);
		            });
		    
		            return current;
		        },
		        
		        embed: function(){
		            return this.js.apply(this, arguments);
		        },
		    
		        instance: function(currentUrl, parent) {
		            if (typeof currentUrl === 'string') {
		    
		                var old = module,
		                    next = new Module(currentUrl, old);
		    
		                next.filename = path_getFile(currentUrl);
		                next.paths = Module._nodeModulePaths(path_getDir(next.filename));
		    
		    
		                if (npmPath == null) {
		                    
		                    var PATH = process.env.PATH || process.env.path,
		                        delimiter = require('path').delimiter,
		                        parts = PATH.split(delimiter);
		                        
		                    var i = parts.length,
		                        rgx = /([\\\/]npm[\\\/])|([\\\/]npm$)/gi;
		                    while ( --i > -1 ){
		                        if (rgx.test(parts[i])) {
		                            npmPath = parts[i];
		                            break;
		                        }
		                    }
		                    
		                    if (npmPath == null && process.platform !== 'win32') {
		                        [
		                            '/usr/lib/node_modules',
		                            '/usr/local/lib/node_modules'
		                        ].forEach(function(path){
		                            
		                            if (npmPath == null && fs_exists(path)) 
		                                npmPath = path;
		                        });
		                    }
		                        
		                    if (npmPath) {
		                        if (npmPath.indexOf('node_modules') === -1) 
		                            npmPath = path_combine(npmPath, 'node_modules');
		                            
		                        atmaPath = path_combine(
		                            path_getDir(
		                                path_normalize(
		                                    process.mainModule.filename
		                            )), 'node_modules'
		                        );
		                    } else {
		                        npmPath = false;
		                        console.warn(
		                            'Could not resolve global NPM Directory from system path (%s)',
		                            delimiter,
		                            PATH
		                        );
		                    }
		                }
		    
		                
		                if (atmaPath) 
		                    next.paths.unshift(atmaPath);
		                    
		                if (npmPath) 
		                    next.paths.unshift(npmPath);
		                    
		                
		                global.module = module = next;
		                global.require = require = next.require.bind(next);
		            }
		    
		            var res = new Resource();
		            res.state = 4;
		            res.location = currentUrl;
		            res.parent = parent;
		            return res;
		        }
		    });
		    
		    
		    function inject_process(bundle, index){
		        if (index >= bundle.includes.length) 
		            return bundle.readystatechanged(4);
		        
		        var include = bundle.includes[index],
		            resource = include.resource,
		            alias = include.route.alias,
		            source = resource.exports
		            ;
		
		        resource.exports = null;
		        resource.type = 'js';
		        resource.includes = null;
		        resource.state = 3;
		        resource.parent = null;
		
		        for (var key in bin.load) {
		            if (bin.load[key] === resource) {
		                delete bin.load[key];
		                break;
		            }
		        }
		
		        try {
		            __eval(source, resource, true);
		        } catch(error) {
		            console.error('<inject> Evaluation error', resource.url, error);
		            resource.state = 4;
		        }
		        
		        resource.readystatechanged(3);
		        resource.on(4, function(){
		            
		            if (resource.exports && alias) {
		                global[alias] = resource.exports;
		            }
		            
		            inject_process(bundle, ++index);
		        });
		    }
		}());
		// end:source export-resource.js
		// source export-include.js
		obj_inherit(Include, {
		    
		    isBrowser: false,
		    isNode: true,
		    
		    
		    bin_tryReload: bin_tryReload,
		    bin_remove: bin_remove
		});
		// end:source export-include.js
	    
	}());
	// end:source ../src/node/node.js

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

/*jshint -W032 */


// source /ref-mask/src/umd-head
/*!
 * MaskJS v0.12.21
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, 2015 Atma.js and other contributors
 */
(function (root, factory) {
    'use strict';
    
	var _env = (typeof window === 'undefined' || window.navigator == null)
		? 'node'
		: 'dom';
	var _global = (_env === 'dom')
		? window
		: global;
	var _isCommonJs = typeof exports !== 'undefined'
		&& (root == null || root === exports || root === _global);
	if (_isCommonJs) {
        root = exports;
    }
	var _exports = root || _global;
	var _document = _global.document;
    
    function construct(){
        var mask = factory(_global, _exports, _document);
		if (_isCommonJs) {
			module.exports = mask;
		}
		return mask;
    }

    if (typeof define === 'function' && define.amd) {
        return define(construct);
    }
    
	// Browser OR Node
    return construct();

}(this, function (global, exports, document) {
    'use strict';

// end:source /ref-mask/src/umd-head
	
	// source /ref-utils/lib/utils.embed.js
	// source /src/refs.js
	var _Array_slice = Array.prototype.slice,
		_Array_splice = Array.prototype.splice,
		_Array_indexOf = Array.prototype.indexOf,
		
		_Object_create = null, // in obj.js
		_Object_hasOwnProp = Object.hasOwnProperty,
		_Object_getOwnProp = Object.getOwnPropertyDescriptor,
		_Object_defineProperty = Object.defineProperty;
	// end:source /src/refs.js
	
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
		is_rawObject,
		is_NODE,
		is_DOM;
	
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
	
		is_DOM = typeof window !== 'undefined' && window.navigator != null;
		is_NODE = !is_DOM;
		
	}());
	// end:source /src/is.js
	// source /src/obj.js
	var obj_getProperty,
		obj_setProperty,
		obj_hasProperty,
		obj_extend,
		obj_extendDefaults,
		obj_extendMany,
		obj_extendProperties,
		obj_create,
		obj_toFastProps,
		obj_defineProperty;
	(function(){
		obj_getProperty = function(obj_, path){
			if ('.' === path) // obsolete
				return obj_;
			
			var obj = obj_,
				chain = path.split('.'),
				imax = chain.length,
				i = -1;
			while ( obj != null && ++i < imax ) {
				obj = obj[chain[i]];
			}
			return obj;
		};
		obj_setProperty = function(obj_, path, val) {
			var obj = obj_,
				chain = path.split('.'),
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
		obj_hasProperty = function(obj, path) {
			var x = obj_getProperty(obj, path);
			return x !== void 0;
		};
		obj_defineProperty = function(obj, path, dscr) {
			var x = obj,
				chain = path.split('.'),
				imax = chain.length - 1,
				i = -1, key;
			while (++i < imax) {
				key = chain[i];
				if (x[key] == null) 
					x[key] = {};
				x = x[key];
			}
			key = chain[imax];
			if (_Object_defineProperty) {
				if (dscr.writable     === void 0) dscr.writable     = true;
				if (dscr.configurable === void 0) dscr.configurable = true;
				if (dscr.enumerable   === void 0) dscr.enumerable   = true;
				_Object_defineProperty(x, key, dscr);
				return;
			}
			x[key] = dscr.value === void 0
				? dscr.value
				: (dscr.get && dscr.get());
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
		obj_extendDefaults = function(a, b){
			if (b == null) 
				return a || {};
			if (a == null) 
				return obj_create(b);
			
			for(var key in b) {
				if (a[key] == null) 
					a[key] = b[key];
			}
			return a;
		}
		obj_extendProperties = (function(){
			if (_Object_getOwnProp == null) 
				return obj_extend;
			
			return function(a, b){
				if (b == null)
					return a || {};
				
				if (a == null)
					return obj_create(b);
				
				var key, descr;
				for(key in b){
					descr = _Object_getOwnProp(b, key);
					if (descr == null) 
						continue;
					
					if (descr.hasOwnProperty('value')) {
						a[key] = descr.value;
						continue;
					}
					_Object_defineProperty(a, key, descr);
				}
				return a;
			};
		}());
		obj_extendMany = function(a){
			var imax = arguments.length,
				i = 1;
			for(; i<imax; i++) {
				a = obj_extend(a, arguments[i]);
			}
			return a;
		};
		obj_toFastProps = function(obj){
			/*jshint -W027*/
			function F() {}
			F.prototype = obj;
			new F();
			return;
			eval(obj);
		};
		_Object_create = obj_create = Object.create || function(x) {
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
		arr_contains,
		arr_pushMany;
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
		arr_pushMany = function(arr, arrSource){
			if (arrSource == null || arr == null || arr === arrSource) 
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
	// source /src/str.js
	var str_format;
	(function(){
		str_format = function(str_){
			var str = str_,
				imax = arguments.length,
				i = 0, x;
			while ( ++i < imax ){
				x = arguments[i];
				if (is_Object(x) && x.toJSON) {
					x = x.toJSON();
				}
				str_ = str_.replace(rgxNum(i - 1), String(x));
			}
			
			return str_;
		};
		
		var rgxNum;
		(function(){
			rgxNum = function(num){
				return cache_[num] || (cache_[num] = new RegExp('\\{' + num + '\\}', 'g'));
			};
			var cache_ = {};
		}());
	}());
	// end:source /src/str.js
	// source /src/class.js
	/**
	 * create([...Base], Proto)
	 * Base: Function | Object
	 * Proto: Object {
	 *    constructor: ?Function
	 *    ...
	 */
	var class_create,
	
		// with property accessor functions support
		class_createEx;
	(function(){
		
		class_create = function(){
			var args = _Array_slice.call(arguments),
				Proto = args.pop();
			if (Proto == null) 
				Proto = {};
			
			var Ctor = Proto.hasOwnProperty('constructor')
				? Proto.constructor
				: function ClassCtor () {};
			
			var i = args.length,
				BaseCtor, x;
			while ( --i > -1 ) {
				x = args[i];
				if (typeof x === 'function') {
					BaseCtor = wrapFn(x, BaseCtor);
					x = x.prototype;
				}
				obj_extendDefaults(Proto, x);
			}
			return createClass(wrapFn(BaseCtor, Ctor), Proto);
		};
		class_createEx = function(){
			var args = _Array_slice.call(arguments),
				Proto = args.pop();
			if (Proto == null) 
				Proto = {};
			
			var Ctor = Proto.hasOwnProperty('constructor')
				? Proto.constructor
				: function () {};
				
			var imax = args.length,
				i = -1,
				BaseCtor, x;
			while ( ++i < imax ) {
				x = args[i];
				if (typeof x === 'function') {
					BaseCtor = wrapFn(BaseCtor, x);
					x = x.prototype;
				}
				obj_extendProperties(Proto, x);
			}
			return createClass(wrapFn(BaseCtor, Ctor), Proto);
		};
		
		function createClass(Ctor, Proto) {
			Proto.constructor = Ctor;
			Ctor.prototype = Proto;
			return Ctor;
		}
		function wrapFn(fnA, fnB) {
			if (fnA == null) {
				return fnB;
			}
			if (fnB == null) {
				return fnA;
			}
			return function(){
				var args = _Array_slice.call(arguments);
				var x = fnA.apply(this, args);
				if (x !== void 0) 
					return x;
				
				return fnB.apply(this, args);
			};
		}
	}());
	// end:source /src/class.js
	// source /src/error.js
	var error_createClass,
		error_formatSource,
		error_formatCursor,
		error_cursor;
		
	(function(){
		error_createClass = function(name, Proto, stackSliceFrom){
			var Ctor = _createCtor(Proto, stackSliceFrom);
			Ctor.prototype = new Error;
			
			Proto.constructor = Error;
			Proto.name = name;
			obj_extend(Ctor.prototype, Proto);
			return Ctor;
		};
		
		error_formatSource = function(source, index, filename) {
			var cursor  = error_cursor(source, index),
				lines   = cursor[0],
				lineNum = cursor[1],
				rowNum  = cursor[2],
				str = '';
			if (filename != null) {
				str += str_format(' at {0}({1}:{2})\n', filename, lineNum, rowNum);
			}
			return str + error_formatCursor(lines, lineNum, rowNum);
		};
		
		/**
		 * @returns [ lines, lineNum, rowNum ]
		 */
		error_cursor = function(str, index){
			var lines = str.substring(0, index).split('\n'),
				line = lines.length,
				row = index + 1 - lines.slice(0, line - 1).join('\n').length;
			if (line > 1) {
				// remote trailing newline
				row -= 1;
			}
			return [str.split('\n'), line, row];
		};
		
		(function(){
			error_formatCursor = function(lines, lineNum, rowNum) {
					
				var BEFORE = 3,
					AFTER  = 2,
					i = lineNum - BEFORE,
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
					
					if (i + 1 === lineNum) {
						str += '\n' + repeat(' ', lineNumberLength + 1);
						str += lines[i].substring(0, rowNum - 1).replace(/[^\s]/g, ' ');
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
		
		function _createCtor(Proto, stackFrom){
			var Ctor = Proto.hasOwnProperty('constructor')
				? Proto.constructor
				: null;
				
			return function(){
				obj_defineProperty(this, 'stack', {
					value: _prepairStack(stackFrom || 3)
				});
				obj_defineProperty(this, 'message', {
					value: str_format.apply(this, arguments)
				});
				if (Ctor != null) {
					Ctor.apply(this, arguments);
				}
			};
		}
		
		function _prepairStack(sliceFrom) {
			var stack = new Error().stack;
			return stack == null ? null : stack
				.split('\n')
				.slice(sliceFrom)
				.join('\n');
		}
		
	}());
	// end:source /src/error.js
	
	// source /src/class/Dfr.js
	var class_Dfr;
	(function(){
		class_Dfr = function(){};
		class_Dfr.prototype = {
			_isAsync: true,
			_done: null,
			_fail: null,
			_always: null,
			_resolved: null,
			_rejected: null,
			
			defer: function(){
				this._rejected = null;
				this._resolved = null;
				return this;
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
					dfr = new class_Dfr;
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
				done && this.done(delegate(dfr, 'resolve'));
				fail && this.fail(delegate(dfr, 'reject' ));
				
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
		
		class_Dfr.run = function(fn, ctx){
			var dfr = new class_Dfr();
			if (ctx == null) 
				ctx = dfr;
			
			fn.call(
				ctx
				, fn_proxy(dfr.resolve, ctx)
				, fn_proxy(dfr.reject, dfr)
				, dfr
			);
			return dfr;
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
			
			if (x instanceof class_Dfr) 
				return true;
			
			return typeof x.done === 'function'
				&& typeof x.fail === 'function'
				;
		}
	}());
	// end:source /src/class/Dfr.js
	// source /src/class/EventEmitter.js
	var class_EventEmitter;
	(function(){
	 
		class_EventEmitter = function() {
			this._listeners = {};
		};
	    class_EventEmitter.prototype = {
	        on: function(event, fn) {
	            if (fn != null){
					(this._listeners[event] || (this._listeners[event] = [])).push(fn);
				}
	            return this;
	        },
	        once: function(event, fn){
				if (fn != null) {
					fn._once = true;
					(this._listeners[event] || (this._listeners[event] = [])).push(fn);
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
			
	        off: function(event, fn) {
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
					
					if (listeners[i] === fn) {
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
	
	// end:source /src/class/EventEmitter.js
	
	
	// end:source /ref-utils/lib/utils.embed.js
	
	// source const
	var mode_SERVER = 'server',
		mode_SERVER_ALL = 'server:all',
		mode_SERVER_CHILDREN = 'server:children',
		mode_CLIENT = 'client',
		mode_BOTH = 'both',
		mode_model_NONE = 'none';
	// end:source const
	// source /ref-mask/src/scope-vars
	var __rgxEscapedChar = {
			"'": /\\'/g,
			'"': /\\"/g,
			'{': /\\\{/g,
			'>': /\\>/g,
			';': /\\>/g
		},
		
		__cfg = {
			// Relevant to NodeJS only. Disables compo caching
			allowCache: true,
			preprocessor: {
				style : null,
				script: null
			},
			base: null,
			
			getFile: null,
			getScript: null,
			
			buildStyle: null,
			buildScript: null,
		};
	// end:source /ref-mask/src/scope-vars
	
	
	// source /ref-mask/src/util/
	// source ./util.js
	
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
	
	function util_interpolate(arr, type, model, ctx, element, ctr, name) {
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
					value = obj_getPropertyEx(key,  model, ctx, ctr);
					
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
					
					value = handler(key, model, ctx, element, ctr, name, type);
				}
	
				if (value != null){
	
					if (typeof value === 'object' && array == null){
						array = [ string ];
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
	
	// end:source ./util.js
	// source ./attr.js
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
	
	// end:source ./attr.js
	// source ./array.js
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
	// end:source ./array.js
	// source ./object.js
	var obj_getPropertyEx,
	    obj_toDictionary;
	(function(){
	    obj_getPropertyEx = function(path, model, ctx, ctr){
	        if (path === '.') 
	            return model;
	    
	        var props = path.split('.'),
	            imax = props.length,
	            key = props[0]
	            ;
	        
	        if ('$c' === key) {
	            reporter_deprecated('accessor.compo', 'Use `$` instead of `$c`');
	            key = '$';
	        }
	        if ('$u' === key) {
	            reporter_deprecated('accessor.util', 'Use `_` instead of `$u`');
	            key = '_';
	        }
	        if ('$' === key) {
	            return getProperty_(ctr, props, 1, imax);
	        }
	        if ('$a' === key) {
	            return getProperty_(ctr && ctr.attr, props, 1, imax);
	        }
	        if ('_' === key) {
	            return getProperty_(customUtil_$utils, props, 1, imax);
	        }
	        if ('$ctx' === key) {
	            return getProperty_(ctx, props, 1, imax);
	        }
	        if ('$scope' === key) {
	            return getFromScope_(ctr, props, 1, imax);
	        }
	        
	        var x = getProperty_(model, props, 0, imax);
	        if (x != null) {
	            return x;
	        }
	        
	        return getFromScope_(ctr, props, 0, imax);
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
	    
	    function getProperty_(obj, props, startIndex, imax) {
	        var i = startIndex,
	            val = obj;
	        while(i < imax && val != null){
	            val = val[props[i]];
	            i++;
	        }
	        return val;
	    }
	    
	    function getFromScope_(ctr, props, startIndex, imax) {
	        while (ctr != null){
	            var scope = ctr.scope;
	            if (scope != null) {
	                var x = getProperty_(scope, props, startIndex, imax);
	                if (x != null) 
	                    return x;
	            }
	            ctr = ctr.parent;
	        }
	        return null;
	    }
	}());
	
	// end:source ./object.js
	// source ./listeners.js
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
			if (fns == null) {
				return false;
			}
			var imax = fns.length,
				i = -1,
				args = _Array_slice.call(arguments, 1)
				;
			if (imax === 0) {
				return false;
			}
			while ( ++i < imax) {
				fns[i].apply(null, args);
			}
			return true;
		};
		
		// === private
		
		var bin = {
			compoCreated: null,
			error: null
		};
	}());
	// end:source ./listeners.js
	// source ./reporters.js
	var throw_,
		parser_error,
		parser_warn,
		error_,
		error_withSource,
		error_withNode,
		warn_,
		warn_withSource,
		warn_withNode,
		
		log,
		log_warn,
		log_error,
		reporter_createErrorNode,
		reporter_deprecated;
		
	(function(){
		(function () {
			
			if (typeof console === 'undefined') {
				log = log_warn = log_error = function(){};
				return;
			}		
			var bind  = Function.prototype.bind;
			log       = bind.call(console.warn , console);		
			log_warn  = bind.call(console.warn , console, 'MaskJS [Warn] :');
			log_error = bind.call(console.error, console, 'MaskJS [Error] :');
		}());
		
		var STACK_SLICE = 4;
		var MaskError = error_createClass('MaskError', {}, STACK_SLICE);
		var MaskWarn  = error_createClass('MaskWarn',  {}, STACK_SLICE);
		
			
		throw_ = function(error){
			log_error(error);
			listeners_emit('error', error);
		};
		
		error_withSource = delegate_withSource(MaskError, 'error');
		error_withNode   = delegate_withNode  (MaskError, 'error');
		
		warn_withSource = delegate_withSource(MaskWarn, 'warn');
		warn_withNode   = delegate_withNode  (MaskWarn, 'warn');
		
		parser_error = delegate_parserReporter(MaskError, 'error');
		parser_warn = delegate_parserReporter(MaskWarn, 'warn');
		
		reporter_createErrorNode = function(message){
			return parser_parse(
				'div style="background:red;color:white;">tt>"""' + message + '"""'
			);
		};
		
		(function(){
			reporter_deprecated = function(id, message){
				if (_notified[id] !== void 0) {
					return;
				}
				_notified[id] = 1;
				log_warn('[deprecated]', message);
			};
			var _notified = {};
		}());
		
		function delegate_parserReporter(Ctor, type) {
			return function(str, source, index, token, state, file) {
				var error = new Ctor(str);
				var tokenMsg = formatToken(token);
				if (tokenMsg) {
					error.message += tokenMsg;
				}
				var stateMsg = formatState(state);
				if (stateMsg) {
					error.message += stateMsg;
				}
				var cursorMsg = error_formatSource(source, index, file);
				if (cursorMsg) {
					error.message += '\n' + cursorMsg;
				}
				report(error, 'error');
			};
		}
		function delegate_withSource(Ctor, type){
			return function(str, source, index, file){
				var error = new Ctor(str);
				error.message = '\n' + error_formatSource(source, index, file);
				report(error, type);
			};
		}
		function delegate_withNode(Ctor, type){
			return function(str, node){
				var error = new Ctor(str);
				error.message = error.message
					+ '\n'
					+ _getNodeStack(node);
				
				report(error, type);
			};
		}
		
		function _getNodeStack(node){
			var stack = [ node ];
			
			var parent = node.parent;
			while (parent != null) {
				stack.unshift(parent);
				parent = parent.parent;
			}
			var str = '';
			var root = stack[0];
			if (root !== node && is_String(root.source) && node.sourceIndex > -1) {
				str += error_formatSource(root.source, node.sourceIndex, root.filename) + '\n';
			}
			
			str += '  at ' + stack
				.map(function(x){
					return x.tagName;
				})
				.join(' > ');
				
			return str;
		}
		
		function report(error, type) {
			if (listeners_emit(type, error)) {
				return;
			}
			var fn = type === 'error' ? log_error : log_warn;
			fn(error.message);
			fn('\n' + error.stack);
		}
		
		function formatToken(token){
			if (token == null) 
				return '';
			
			if (typeof token === 'number') 
				token = String.fromCharCode(token);
				
			return ' Invalid token: `'+ token + '`';
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
			
			return ' in `' + states[state] + '`';
		}
		
	}());
	// end:source ./reporters.js
	// source ./path.js
	var path_getDir,
		path_getFile,
		path_getExtension,
		path_resolveCurrent,
		path_normalize,
		path_resolveUrl,
		path_combine,
		path_isRelative,
		path_toRelative
		;
	(function(){
		var isWeb = true;
		
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
			if (query !== -1) {
				path = path.substring(0, query);
			}
			var match = rgx_EXT.exec(path);
			return match == null ? '' : match[1];
		};
		
		(function(){
			var current_;
			
	
			
			// if (NODE)
			path_resolveCurrent = function(){
				if (current_ != null) return current_;
				return (current_ = path_win32Normalize(process.cwd()));
			};
			// endif
		}());
		
		
		path_normalize = function(path) {
			var path_ = path
				.replace(/\\/g, '/')
				// remove double slashes, but not near protocol
				.replace(/([^:\/])\/{2,}/g, '$1/')
				// './xx' to relative string
				.replace(/^\.\//, '')
				// join 'xx/./xx'
				.replace(/\/\.\//g, '/')
				;
			return path_collapse(path_);
		};
		path_resolveUrl = function(path, base) {
			var url = path_normalize(path);
			if (path_isRelative(url)) {
				return path_normalize(path_combine(base || path_resolveCurrent(), url));
			}
			if (rgx_PROTOCOL.test(url)) 
				return url;
			
			if (url.charCodeAt(0) === 47 /*/*/) {
				if (__cfg.base) {
					return path_combine(__cfg.base, url);
				}
			}
			return url;
		};
		path_isRelative = function(path) {
			var c = path.charCodeAt(0);
			switch (c) {
				case 47:
					// /
					return false;
				case 102:
				case 104:
					// f || h
					return rgx_PROTOCOL.test(path) === false;
			}
			return true;
		};
		path_toRelative = function(path, anchor, base){
			var path_     = path_resolveUrl(path_normalize(path), base),
				absolute_ = path_resolveUrl(path_normalize(anchor), base);
			
			if (path_getExtension(absolute_) !== '') {
				absolute_ = path_getDir(absolute_);
			}
			absolute_ = path_combine(absolute_, '/');
			if (path_.toUpperCase().indexOf(absolute_.toUpperCase()) === 0) {
				return path_.substring(absolute_.length);
			}
			return path;
		};
		
		path_combine = function() {
			var out = '',
				imax = arguments.length,
				i = -1, x;
			while ( ++i < imax ){
				x = arguments[i];
				if (!x)  continue;
				
				x = path_normalize(x);
				if (out === '') {
					out = x;
					continue;
				}
				if (out[out.length - 1] !== '/') {
					out += '/'
				}
				if (x[0] === '/') {
					x = x.substring(1);
				}
				out += x;
			}
			return out;
		};
		
		var rgx_PROTOCOL = /^(file|https?):/i,
			rgx_SUB_DIR  = /([^\/]+\/)?\.\.\//,
			rgx_FILENAME = /\/[^\/]+\.\w+$/,
			rgx_EXT      = /\.(\w+)$/,
			rgx_win32Drive = /(^\/?\w{1}:)(\/|$)/
			;
	
		function path_win32Normalize (path){
			path = path_normalize(path);
			if (path.substring(0, 5) === 'file:')
				return path;
			
			return 'file:///' + path;
		}
		
		function path_collapse(url) {
			while (url.indexOf('../') !== -1) {
				url = url.replace(rgx_SUB_DIR, '');
			}
			return url.replace(/\/\.\//g, '/');
		}
		function path_ensureTrailingSlash(path) {
			if (path.charCodeAt(path.length - 1) === 47 /* / */)
				return path;
			
			return path + '/';
		}
		function path_sliceFilename(path) {
			return path_ensureTrailingSlash(path.replace(rgx_FILENAME, ''));
		}
		
	}());
		
	
	// end:source ./path.js
	// source ./resource/file.js
	var file_get,
		file_getScript,
		file_getStyle,
		file_getJson;
		
	(function(){
		file_get = function(path, ctr){
			return get(xhr_get, path, ctr);
		};
		file_getScript = function(path, ctr){
			return get(script_get, path, ctr);
		};
		file_getStyle = function(path, ctr){
			return get(style_get, path, ctr);
		};
		file_getJson = function(path, ctr){
			return get(json_get, path, ctr);
		};
		
		function get(fn, path, ctr) {
			path = path_resolveUrl(path, ctr);
	
			var dfr = Cache[path];
			if (dfr !== void 0) {
				return dfr;
			}
			dfr = new class_Dfr;
			fn(path, dfr.pipeCallback());
			return dfr;
		}
		
		var Cache = {};
		
		
		// source transports/json
		var json_get;
		(function(){
			json_get = function(path, cb){
				xhr_get(path, function(error, str){
					if (error) return cb(error);
					try {
						var x = JSON.parse(str);
						cb(null, x);
					} catch (error) {
						cb('JSON error: ' + String(error));
					}
				})
			};
		}());
		// end:source transports/json
		// source transports/script
		var script_get;
		(function(){
			script_get = function(path, cb){
				var res = new Resource(path)
					.done(function(exports){
						cb(null, exports);
					})
					.fail(function(err){
						cb(err);
					});
					
				ScriptStack.load(res);
			};
			
			var Resource = class_create(class_Dfr, {
				exports: null,
				url: null,
				state: 0,
				constructor: function(url){
					this.url = url;
				},
				load: function(){
					if (this.state !== 0) {
						return this;
					}
					this.state = 1;
					global.module = {};
					
					var self = this;
					embedScript(this.url, function(event){
						self.state = 4;
						if (event && event.type === 'error') {
							self.reject(event);
							return;
						}
						self.resolve(self.exports = global.module.exports);
					});
					return this;
				}
			});
			var ScriptStack;
			(function() {
				ScriptStack = {
					load: function(resource) {
						_stack.push(resource);
						process();
					}
				};
				
				var _stack = [];
				
				function process() {
					if (_stack.length === 0) 
						return;
					
					var res = _stack[0];
					if (res.state !== 0) 
						return;
					
					res
						.load()
						.always(process);
				}
			})();
			
			var embedScript;
			(function(){
				embedScript = function (url, callback) {
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
					if (_head === void 0) {
						_head = document.getElementsByTagName('head')[0];
					}
					_head.appendChild(tag);
				};
				var _head;
			}());
			
			
		}());
		// end:source transports/script
		// source transports/style
		var style_get;
		(function(){
			style_get = function(path, cb){
				embedStyle(path);
				// do not wait for the load event
				cb();
			};
			
			var embedStyle;
			(function(){
				embedStyle = function (url, callback) {
					var tag = document.createElement('style');
					tag.rel = 'stylesheet';
					tag.href = url;
					if ('onreadystatechange' in tag) {
						tag.onreadystatechange = function() {
							(this.readyState === 'complete' || this.readyState === 'loaded') && callback();
						};
					} else {
						tag.onload = tag.onerror = callback;
					}
					if (_head === void 0) {
						_head = document.getElementsByTagName('head')[0];
					}
					_head.appendChild(tag);
				};
				var _head;
			}());
			
			
		}());
		// end:source transports/style
		// source transports/xhr
		var xhr_get;
		(function(){
			xhr_get = function(path, cb){
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if (xhr.readyState !== 4)
						return;
					
					var res = xhr.responseText,
						status = xhr.status, err;
					if (status !== 0 && status !== 200) {
						err = {
							status: status,
							content: res
						};
						log_warn('File error', path, status);
					}
					cb(err, res);
				};
				xhr.open('GET', path, true);
				xhr.send();
			};
		}());
		// end:source transports/xhr
	
	}());
	// end:source ./resource/file.js
	
	// end:source /ref-mask/src/util/
	//#source util/
	// source path
	var path_toLocalFile;
	(function(){
		
		path_toLocalFile = function(path){
			path = path_normalize(path);
			if (path_isRelative(path)) {
				path = '/' + path;
			}
			if (path.charCodeAt(0) === 47 /*/*/) {
				return path_combine(cwd(), path);
			}
			if (path.indexOf('file://') === 0) {
				path = path.replace('file://', '');
			}
			if (/^\/\w+:\//.test(path)) {
				path = path.substring(1);
			}
			return path;
		};
		
		function cwd() {
			return path_normalize(process.cwd());
		}
	}());
	// end:source path
	// source compo
	var	compo_getMetaInfo,	
		compo_getRenderMode,
		compo_getModelRenderMode,
		compo_isServerMode,
		compo_setMode,
		compo_wrapOnTagName,
		compo_getMetaVal,
		compo_setMetaVal
		;
		
	(function(){
		
		compo_isServerMode = function(compo){
			return compo_getRenderMode(compo) === mode_SERVER;
		};
		compo_setMode = function(ctr, mode){
			ctr.meta = ctr.meta == null
				? new CompoMeta
				: obj_create(ctr.meta)
				;
			ctr.meta.mode = mode;
		};
		compo_getMetaInfo = function(compo){
			if (compo == null) 
				return new CompoMeta;
			
			var proto = typeof compo === 'function'
					? compo.prototype
					: compo
					;
			return new CompoMeta(proto);
		};
		compo_getRenderMode = function(compo){
			if (compo == null) 
				return mode_BOTH;
			
			var proto = typeof compo === 'function'
				? compo.prototype
				: compo
				;
			var mode = proto.meta && proto.meta.mode;
			if (mode == null || mode === mode_BOTH) 
				return mode_BOTH;
			
			if (typeof mode === 'number') {
				throw Error('Not implemented: Mode as number');
			}
			
			if (mode === mode_SERVER || mode === mode_SERVER_ALL) 
				return mode_SERVER;
			
			if (mode === mode_CLIENT) 
				return mode_CLIENT;
			
			log_error('Uknown render mode', mode);		
			return mode_BOTH;
		};
		compo_getModelRenderMode = function(compo){
			if (compo == null) 
				return mode_BOTH;
			
			var proto = typeof compo === 'function'
				? compo.prototype
				: compo
				;
			var mode = proto.meta && proto.meta.modeModel;
			if (mode == null || mode === mode_BOTH) 
				return mode_BOTH;
			
			if (typeof mode === 'number') {
				throw Error('Not implemented: Mode as number');
			}
			
			if (mode === mode_SERVER || mode === mode_SERVER_ALL) 
				return mode_SERVER;
			
			log_error('Uknown render mode for a model', mode);		
			return mode_BOTH;
		};
		compo_wrapOnTagName = function(compo, node){
			if (compo.tagName == null
				|| compo.tagName === node.tagName
				|| compo.tagName === compo.compoName)
					return;
			
			compo.nodes = {
				tagName: compo.tagName,
				attr: compo.attr,
				nodes: compo.nodes,
				type: 1
			};
		};
		
		compo_getMetaVal = function(compo, prop){
			var x = getMetaVal(compo, prop) || MetaDefault[prop];
			if (x == null) {
				log_error('Uknown meta property', prop);
			}
			return x;
		};
		compo_setMetaVal = function(compo, prop, val) {
			var proto = typeof compo === 'function'
				? compo.prototype
				: compo;
				
			proto.meta = proto.meta == null
				? new CompoMeta
				: obj_create(proto.meta)
				;
			proto.meta[prop] = val;
		};
		
		// Private
		
		function getMetaVal(compo, prop) {
			if (compo == null) 
				return;
			
			var proto = typeof compo === 'function'
				? compo.prototype
				: compo
				;
			
			if (proto.meta != null) {
				return proto.meta[prop];
			}
			if (proto.$meta != null) {
				log_warn('@obsolete: `$meta` property is renamed to `meta`');
				return proto.$meta[prop];
			}
			if (proto[prop] != null) {
				log_error('@deprecate next: Component has meta value direct in the prototypes. Use `meta` object property');
				return proto[prop];
			}
			return null;
		}
		
		function CompoMeta(ctr){
			if (ctr == null) {
				return;
			}
			var meta = ctr.meta || ctr.$meta;
			if (meta != null) {
				return meta;
			}
			if (ctr.mode /* obsolete */) {
				this.mode = ctr.mode;
			}
		}
		
		var MetaDefault = CompoMeta.prototype = {
			mode: mode_BOTH,
			modeModel: mode_BOTH,
			attributes: null,
			cache: false
		};
	}());
	// end:source compo
	// source json
	var json_dimissCircular;
	(function() {
		json_dimissCircular = function(mix) {
			if (is_Object(mix)) {
				cache = [];
				mix = clone(mix);
				cache = null;
			}
			return mix;
		};
		
		var cache;
	
		function clone(mix) {
			
			if (is_Array(mix)) {
				var arr = [],
					imax = mix.length,
					i = -1;
				while ( ++i < imax ){
					arr[i] = clone(mix[i]);
				}
				return arr;
			}
			
			if (is_Object(mix)) {
				if (cache.indexOf(mix) !== -1) 
					return '[object Circular]';
				
				cache.push(mix);
				var obj = {};
				for (var key in mix) {
					obj[key] = clone(mix[key]);
				}
				return obj;
			}
	
			return mix;
		}
	}());
	// end:source json
	// source node
	var node_getType;
	(function(){
		
		node_getType = function (node) {
			var type = node.type;
			if (type == null){
				// in case if node was added manually, but type was not set
				
				if (is_Array(node)) {
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
				// check if the tag name was overriden
				type = 4;
			}
			
			return type;
		};
		
	}());
	// end:source node
	// source loaders
	(function(){
		__cfg.getFile = function (path) {
			var dfr = new class_Dfr;
			var fs  = require('fs');
			var filename = path_toLocalFile(resolvePath(path));
			fs.readFile(filename, 'utf8', function(error, str){
				if (error != null) {
					dfr.reject({
						message: error.toString(),
						status: error.code
					});
					return;
				}
				dfr.resolve(str);
			});
			return dfr;
		};
		__cfg.getScript = function (path) {
			var dfr = new class_Dfr;
			var filename = path_toLocalFile(resolvePath(path));
			
			try {
				var x  = require(filename);
				dfr.resolve(x);
			} catch (error) {
				dfr.reject(error);
			}
			return dfr;
		};
		
		var base_ = path_toLocalFile(path_resolveCurrent());
		function resolvePath(path) {
			if (path_isRelative(path)) {
				return path_combine(base_, path);
			}
			return path;
		}
	}());
	// end:source loaders
	// source ctx
	var ctx_stringify;
	(function(){
		
		ctx_stringify = function(ctx) {
			var has = false, obj = {}, x;
			for(var key in ctx) {
				if (key.charCodeAt(0) === 95 /*_*/) {
					continue;
				}
				x = ctx[key];
				
				var type = typeof x;
				if (x == null
					|| type === 'object' /* skip complex objects */
					|| type === 'function') {
					continue;
				}
				if (key === 'async') {
					continue;
				}
				
				has = true;
				obj[key] = x;
			}
			
			return has === false ? null : obj;
		};
	}());
	// end:source ctx
	
	//#end:source util/
	
	// source /ref-mask/src/custom/
	var custom_Utils,
		custom_Statements,
		custom_Attributes,
		custom_Tags,
		custom_Tags_global,
		custom_Tags_defs,
		
		custom_Parsers,
		custom_Parsers_Transform,
		custom_Optimizers,
		
		customUtil_get,
		customUtil_$utils,
		customUtil_register,
		
		customTag_get,
		customTag_getAll,
		customTag_register,
		customTag_registerScoped,
		customTag_registerFromTemplate,
		customTag_registerResolver,
		customTag_Base,
		
		custom_optimize
		;
		
	(function(){
		
		var _HtmlTags = {
			/*
			 * Most common html tags
			 * http://jsperf.com/not-in-vs-null/3
			 */
			a: null,
			abbr: null,
			article: null,
			aside: null,
			audio: null,
			b: null,
			big: null,
			blockquote: null,
			br: null,
			button: null,
			canvas: null,
			datalist: null,
			details: null,
			div: null,
			em: null,
			fieldset: null,
			footer: null,
			form: null,
			h1: null,
			h2: null,
			h3: null,
			h4: null,
			h5: null,
			h6: null,
			header: null,
			i: null,
			img: null,
			input: null,
			label: null,
			legend: null,
			li: null,
			menu: null,
			nav: null,
			ol: null,
			option: null,
			p: null,
			pre: null,
			section: null,
			select: null,
			small: null,
			span: null,
			strong: null,
			svg: null,
			table: null,
			tbody: null,
			td: null,
			textarea: null,
			tfoot: null,
			th: null,
			thead: null,
			tr: null,
			tt: null,
			ul: null,
			video: null,
		};
		var _HtmlAttr = {
			'class'	: null,
			'id'	: null,
			'style'	: null,
			'name'	: null,
			'type'	: null,
			'value' : null,
			'required': null,
			'disabled': null,
		};
		
		custom_Utils = {
			expression: function(value, model, ctx, element, ctr){
				return expression_eval(value, model, ctx, ctr);
			},
		};
		custom_Optimizers   = {};
		custom_Statements 	= {};
		custom_Attributes 	= obj_extend({}, _HtmlAttr);
		custom_Tags 		= obj_extend({}, _HtmlTags);
		custom_Tags_global 	= obj_extend({}, _HtmlTags);
		custom_Parsers 		= obj_extend({}, _HtmlTags);
		custom_Parsers_Transform = obj_extend({}, _HtmlTags);
		
		// use on server to define reserved tags and its meta info
		custom_Tags_defs = {};
		
		
		// source ./tag.js
		(function(){
			customTag_get = function(name, ctr) {
				if (arguments.length === 0) {
					reporter_deprecated('getHandler.all', 'Use `mask.getHandlers` to get all components (also scoped)');
					return customTag_getAll();
				}
				var Ctor = custom_Tags[name];
				if (Ctor == null) {
					return null;
				}
				if (Ctor !== Resolver) {
					return Ctor;
				}
				
				var ctr_ = ctr;
				while(ctr_ != null) {
					if (is_Function(ctr_.getHandler)) {
						Ctor = ctr_.getHandler(name);
						if (Ctor != null) {
							return Ctor;
						}
					}
					ctr_ = ctr_.parent;
				}
				return null;
			};
			customTag_getAll = function(ctr) {
				if (ctr == null) {
					return custom_Tags;
				}
				
				var obj = {},
					ctr_ = ctr, x;
				while (ctr_ != null) {
					x = null;
					if (is_Function(ctr_.getHandlers)) {
						x = ctr_.getHandlers();
					} else {
						x = ctr_.__handlers__;
					}
					if (x != null) {
						obj = obj_extendDefaults(obj, x);
					}
					ctr_ = ctr_.parent;
				}
				for (var key in custom_Tags) {
					x = custom_Tags[key];
					if (x == null || x === Resolver) {
						continue;
					}
					if (obj[key] == null) {
						obj[key] = x;
					}
				}
				return obj;
			};
			
			customTag_register = function(mix, Handler){
				if (typeof mix !== 'string' && arguments.length === 3) {
					customTag_registerScoped.apply(this, arguments);
					return;
				}
				
				custom_Tags[mix] = compo_ensureCtor(Handler);
				//> make fast properties
				obj_toFastProps(custom_Tags);
			};
			
			customTag_registerFromTemplate = function(mix, Ctr, path){
				var dfr = new class_Dfr;
				new Module
					.ModuleMask(path || '')
					.preprocess_(mix, function(error, exports){
						if (error) {
							return dfr.reject(error);
						}
						var store = exports.__handlers__;
						for (var key in store) {
							if (exports[key] != null) {
								// is global
								customTag_register(key, store[key]);
								continue;
							}
							customTag_registerScoped(Ctr, key, store[key]);
						}
					});
				
				return dfr;
			};
			
			customTag_registerScoped = function(Ctx, name, Handler) {
				customTag_registerResolver(name);
				var obj = is_Function(Ctx) ? Ctx.prototype : Ctx;
				var map = obj.__handlers__;
				if (map == null) {
					map = obj.__handlers__ = {};
				}
				map[name] = compo_ensureCtor(Handler);
				
				if (obj.getHandler == null) {
					obj.getHandler = compo_getHandlerDelegate;
				}
			};
			
			customTag_registerResolver = function(name){
				var Ctor = custom_Tags[name];
				if (Ctor === Resolver) 
					return;
				
				if (Ctor != null) 
					custom_Tags_global[name] = Ctor;
				
				custom_Tags[name] = Resolver;
				
				//> make fast properties
				obj_toFastProps(custom_Tags);
			};
			
			customTag_Base = {
				async: false,
				attr: null,
				await: null,
				compoName: null,
				components: null,
				expression: null,
				ID: null,
				meta: null,
				model: null,
				nodes: null,
				parent: null,
				render: null,
				renderEnd: null,
				renderStart: null,
				tagName: null,
				type: null,
			};
			
			var Resolver;
			(function(){
				Resolver = function (node, model, ctx, container, ctr) {
					var Mix = customTag_get(node.tagName, ctr);
					if (Mix != null) {
						if (is_Function(Mix) === false)	{
							return obj_create(Mix);
						}
						return new Mix(node, model, ctx, container, ctr);
					}
					error_withNode('Component not found: ' + node.tagName, node);
					return null;
				};
			}());
			
			function wrapStatic(proto) {
				function Ctor(node, parent) {
					this.ID = null;
					this.tagName = node.tagName;
					this.attr = obj_create(node.attr);
					this.expression = node.expression;
					this.nodes = node.nodes;
					this.nextSibling = node.nextSibling;
					this.parent = parent;
					this.components = null;
				}
				Ctor.prototype = proto;
				return Ctor;
			}
			
			function compo_getHandlerDelegate(name) {
				var map = this.__handlers__;
				return map == null ? null : map[name];
			}
			
			function compo_ensureCtor(Handler) {
				if (is_Object(Handler)) {
					//> static
					Handler.__Ctor = wrapStatic(Handler);
				}
				return Handler;
			}
			
			function compo_registerViaTemplate(tmpl, Ctx) {
				jmask(tmpl).each(function(x){
					var name = x.tagName;
					if (name === 'let' && Ctx == null) {
						name = 'define';
					}
					if ('define' === name) {
						Define.registerGlobal()
					}
				});
			}
			
		}());
		// end:source ./tag.js
		// source ./util.js
		(function() {
			customUtil_$utils = {};
			customUtil_register = function(name, mix) {
				if (is_Function(mix)) {
					custom_Utils[name] = mix;
					return;
				}
				custom_Utils[name] = createUtil(mix);
				if (mix.arguments === 'parsed')
					customUtil_$utils[name] = mix.process;
			};
			customUtil_get = function(name) {
				return name != null ? custom_Utils[name] : custom_Utils;
			};
		
			// = private
		
			function createUtil(obj) {
		
				if (obj.arguments === 'parsed')
					return processParsedDelegate(obj.process);
				
				var fn = fn_proxy(obj.process || processRawFn, obj);
				// <static> save reference to the initial util object.
				// Mask.Bootstrap needs the original util
				// @workaround
				fn.util = obj;
				return fn;
			}
		
		
			function processRawFn(expr, model, ctx, el, ctr, attrName, type) {
				if ('node' === type) {
					this.nodeRenderStart(expr, model, ctx, el, ctr);
					return this.node(expr, model, ctx, el, ctr);
				}
		
				// asume 'attr'
				this.attrRenderStart(expr, model, ctx, el, ctr, attrName);
				return this.attr(expr, model, ctx, el, ctr, attrName);
			}
		
			function processParsedDelegate(fn) {
				return function(expr, model, ctx, el, ctr) {
					var args = expression_evalStatements(
						expr, model, ctx, ctr
					);
					return fn.apply(null, args);
				};
			}
		}());
		// end:source ./util.js
		
		
		(function(){
			custom_optimize = function(){
				var i = _arr.length;
				while (--i > -1) {
					readProps(_arr[i]);
				}
				i = _arr.length;
				while(--i > -1) {
					defineProps(_arr[i]);
					obj_toFastProps(_arr[i]);
				}
				obj_toFastProps(custom_Attributes);
			};
			var _arr = [
				custom_Statements,
				custom_Tags,
				custom_Parsers,
				custom_Parsers_Transform
			];
			var _props = {};
			function readProps(obj) {
				for (var key in obj) {
					_props[key] = null;
				}
			}
			function defineProps(obj) {
				for (var key in _props) {
					if (obj[key] === void 0) {
						obj[key] = null;
					}
				}
			}
		}());
		
	}());
	
	// end:source /ref-mask/src/custom/
	// source /ref-mask/src/expression/
	/**
	 * ExpressionUtil
	 *
	 * Helper to work with expressions
	 **/
	var expression_eval,
		expression_evalStatements,
		ExpressionUtil;
	
	(function(){
	
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
			
			util_resolveRef = function(astRef, model, ctx, ctr) {
				var controller = ctr,
					current = astRef,
					key = astRef.body,
					object,
					value,
					args,
					i,
					imax
					;
				
				if ('$c' === key) {
					reporter_deprecated(
						'accessor.compo', "Use `$` instead of `$c`."
					);
					key = '$';
				}
				if ('$u' === key) {
					reporter_deprecated(
						'accessor.util', "Use `_` instead of `$u`"
					);
					key = '_';
				}
				if ('$a' === key) {
					reporter_deprecated(
						'accessor.attr', "Use `$.attr` instead of `$a`"
					);
				}
				
				if ('$' === key) {
					value = controller;
					
					var next = current.next,
						nextBody = next != null && next.body;
					if (nextBody != null && value[nextBody] == null){
							
						if (next.type === type_FunctionRef && is_Function(Compo.prototype[nextBody])) {
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
							key = '$.' + nextBody;
							current = next;
						}
					}
					
				}
				
				else if ('$a' === key) {
					value = controller && controller.attr;
				}
				
				else if ('_' === key) {
					value = customUtil_$utils;
				}
				
				
				else if ('$ctx' === key) {
					value = ctx;
				}
				
				else if ('$scope' === key) {
					var next = current.next,
						nextBody = next != null && next.body;
					
					if (nextBody != null) {
						while (controller != null) {
							object = controller.scope;				
							if (object != null) {
								value = object[nextBody];
							}
							if (value != null) {
								break;
							}
							controller = controller.parent;
						}
						current = next;
					}
				}
				
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
						
						while( ++i < imax ) {
							args[i] = expression_evaluate(
								current.arguments[i]
								, model
								, ctx
								, controller
							);
						}
						
						value = value.apply(object, args);
					}
		
					if (value == null || current.next == null) {
						break;
					}
					
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
		// source 7.eval_statements.js
		function expression_evaluateStatements(expr, model, ctx, ctr){
					
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
				
				args.push(expression_evaluate(group, model, ctx, ctr));
				group.body.length = 0;
			}
			return args;
		}
		// end:source 7.eval_statements.js
		// source 8.vars.helper.js
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
		
		// end:source 8.vars.helper.js
	
		expression_eval           = expression_evaluate;
		expression_evalStatements = expression_evaluateStatements;
		ExpressionUtil = {
			'parse': expression_parse,
			
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
			'eval': expression_evaluate,
			'varRefs': refs_extractVars,
			
			// Return all values of a comma delimiter expressions
			// like argumets: ' foo, bar, "4,50" ' => [ %fooValue, %barValue, "4,50" ]
			'evalStatements': expression_evaluateStatements
		};
	
	}());
	
	// end:source /ref-mask/src/expression/
	// source /ref-mask/src/dom/
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
			
			var length = nodes.length;
			if (length !== 0) {
				var prev = nodes[length - 1];
				if (prev != null) {
					prev.nextSibling = el;
				}
			}
			
			nodes.push(el);
		}
		// end:source 1.utils.js
		// source 2.Node.js
		var Node = class_create({
			constructor:  function Node(tagName, parent) {
				this.type = Dom.NODE;
				this.tagName = tagName;
				this.parent = parent;
				this.attr = {};	
			},
			__single: null,
			appendChild: _appendChild,
			attr: null,
			expression: null,
			nodes: null,
			parent: null,
			sourceIndex: -1,
			stringify: null,
			tagName: null,
			type: dom_NODE,
		});
		
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
		var Fragment = class_create({
			type: dom_FRAGMENT,
			nodes: null,
			appendChild: _appendChild,
			source: ''
		});
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
	
	// end:source /ref-mask/src/dom/
	// source /ref-mask/src/statements/
	// source ./01.if.js
	(function(){
		
		function getNodes(node, model, ctx, ctr){
			function evaluate(expr){
				return expression_eval(expr, model, ctx, ctr);
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
	
	// end:source ./01.if.js
	// source ./02.for.js
	
	(function(){
		var FOR_OF_ITEM = 'for..of::item',
			FOR_IN_ITEM = 'for..in::item';
			
		custom_Statements['for'] = {
			
			render: function(node, model, ctx, container, ctr, children){
				
				parse_For(node.expression);
				
				var value = expression_eval(__ForDirective[3], model, ctx, ctr);
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
	
	
	// end:source ./02.for.js
	// source ./03.each.js
	(function(){
	
		custom_Statements['each'] = {		
			render: function(node, model, ctx, container, ctr, children){
				
				var array = expression_eval(node.expression, model, ctx, ctr);
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
	// end:source ./03.each.js
	// source ./04.with.js
	custom_Statements['with'] = {
		render: function(node, model, ctx, el, ctr, elements){
			var obj = expression_eval(
				node.expression
				, model
				, ctx
				, ctr
			);
			builder_build(
				node.nodes
				, obj
				, ctx
				, el
				, ctr
				, elements
			);
		}
	};
	// end:source ./04.with.js
	// source ./05.switch.js
	(function(){
		custom_Statements['switch'] = {
			render: function(node, model, ctx, el, ctr, elements){
				
				var value = expression_eval(node.expression, model, ctx, ctr),
					nodes = getNodes(value, node.nodes, model, ctx, ctr);
				if (nodes == null) 
					return;
							
				builder_build(nodes, model, ctx, el, ctr, elements);
			},
			
			getNodes: getNodes
		};	
		
		
		function getNodes(value, nodes, model, ctx, ctr) {
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
				if (expression_eval(expr, model, ctx, ctr) == value) {
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
		
	
	// end:source ./05.switch.js
	// source ./09.visible.js
	(function(){
		custom_Statements['visible'] = {
			toggle: toggle,
			render: function(node, model, ctx, container, ctr, children){
				var els = [];
				builder_build(node.nodes, model, ctx, container, ctr, els);
				arr_pushMany(children, els)
				
				var visible = expression_eval(node.expression, model, ctx, ctr);
				toggle(els, visible);
			}
		};
		function toggle(els, visible){
			for(var i = 0; i < els.length; i++){
				els[i].style.display = visible ? '' : 'none';
			}
		}
	}());
	
	// end:source ./09.visible.js
	// source ./10.repeat.js
	(function(){
		custom_Statements['repeat'] = {
			render: function(node, model, ctx, container, ctr, children){
				var run = expression_eval,
					str = node.expression,
					repeat = str.split('..'),
					index = + run(repeat[0] || '', model, ctx, ctr),
					length = + run(repeat[1] || '', model, ctx, ctr);
	
				if (index !== index || length !== length) {
					log_error('Repeat attribute(from..to) invalid', str);
					return;
				}
	
				var nodes = node.nodes;
				var arr = [];
				var i = -1;
				while (++i < length) {
					arr[i] = compo_init(
						'repeat::item',
						nodes,
						model,
						i,
						container,
						ctr
					);
				}
	
				var els = [];
				builder_build(arr, model, ctx, container, ctr, els);
				arr_pushMany(children, els);
			}
		};
	
		function compo_init(name, nodes, model, index, container, parent) {		
			return {
				type: Dom.COMPONENT,
				compoName: name,
				attr: {},
				nodes: nodes,
				model: model,
				container: container,
				parent: parent,
				index: index,
				scope: {
					index: index
				}
			};
		}
	}());
	
	// end:source ./10.repeat.js
	// end:source /ref-mask/src/statements/
	// source /ref-mask/src/parser/
	var parser_parse,
		parser_parseHtml,
		parser_parseAttr,
		parser_parseAttrObject,
		parser_ensureTemplateFunction,
		parser_setInterpolationQuotes,
		parser_cleanObject,
		parser_ObjectLexer
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
			interp_code_CLOSE = 93;
	
		// source ./cursor
		var cursor_groupEnd,
			cursor_quoteEnd,
			cursor_refEnd,
			cursor_tokenEnd,
			cursor_skipWhitespace,
			cursor_skipWhitespaceBack,
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
			};
			
			cursor_tokenEnd = function(str, i, imax){
				var c;
				while (i < imax){
					c = str.charCodeAt(i);
					if (c === 36 || c === 95 || c === 58) {
						// $ _ :
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
			};
			
			cursor_quoteEnd = function(str, i, imax, char_){
				var start = i;
				while ((i = str.indexOf(char_, i)) !== -1) {
					if (str.charCodeAt(i - 1) !== 92)
						// \ 
						return i;
					i++;
				}
				parser_warn('Quote was not closed', str, start - 1);
				return imax;
			};
			
			cursor_skipWhitespace = function(str, i, imax) {
				for(; i < imax; i++) {
					if (str.charCodeAt(i) > 32) 
						return i;
				}
				return i;
			};
			cursor_skipWhitespaceBack = function(str, i) {
				for(; i > 0; i--) {
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
		// end:source ./cursor
		// source ./function
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
		// end:source ./function
		// source ./object/ObjectLexer
		var ObjectLexer;
		(function(){
			
			// source ./compile.js
			var _compile;
			(function(){
				_compile = function(str, i, imax){
					if (i === void 0) {
						i = 0;
						imax = str.length;
					}
					
					var tokens = [],
						c, optional, ref, start;
					outer: for(; i < imax; i++) {
						start = i;
						c = str.charCodeAt(i);
						optional = false;
						if (63 === c /* ? */) {
							optional = true;
							start = ++i;
							c = str.charCodeAt(i);
						}
						switch(c) {
							case 32 /* */:
								tokens.push(new token_Whitespace(optional, i));
								continue;
							case 34:
							case 39 /*'"*/:
								i = cursor_quoteEnd(str, i + 1, imax, c === 34 ? '"' : "'");
								tokens.push(
									new token_String(
										_compile(str, start + 1, i)
									)
								);
								continue;
							case 36 /*$*/:
								start = ++i;
								var isExtended = false;
								if (c === str.charCodeAt(i)) {
									isExtended = true;
									start = ++i;
								}
								i = cursor_tokenEnd(str, i, imax);
								
								var name = str.substring(start, i);
								if (optional === false && isExtended === false) {
									tokens.push(new token_Var(name));
									i--;
									continue;
								}
								
								c = str.charCodeAt(i);
								if (c === 91 /*[*/) {
									i = compileArray(name, tokens, str, i, imax, optional);
									continue;
								}
								if (c === 40 /*(*/) {
									i = compileExtendedVar(name, tokens, str, i, imax);
									continue;
								}
								if (c === 60 /*<*/ ) {
									i = compileCustomVar(name, tokens, str, i, imax);
									continue;
								}
								throw_('Unexpected extended type');
								continue;
							
							case 40 /*(*/:
								if (optional === true) {
									i = compileGroup(optional, tokens, str, i, imax);
									continue;
								}
								/* fall through */
							case 44 /*,*/:
							case 41 /*)*/:
							case 91 /*[*/:
							case 93 /*]*/:
							case 123 /*{*/:
							case 125 /*}*/:
								tokens.push(new token_Punctuation(String.fromCharCode(c)));
								continue;
						}
						
						while(i < imax) {
							c = str.charCodeAt(++i);
							if (c > 32 && c !== 34 && c !== 39 && c !== 36 && c !== 44) {
								continue;
							}
							tokens.push(new token_Const(str.substring(start, i)));
							--i;
							continue outer;
						}
					}
					
					var jmax = tokens.length,
						j = -1,
						orGroup = jmax > 1,
						x;
					while(orGroup === true && ++j < jmax) {
						x = tokens[j];
						if (x instanceof token_Group === false || x.optional !== true) {
							orGroup = false;
						}
					}
					if (0 && orGroup === true) {
						tokens = [ new token_OrGroup(tokens) ];
					}
					
					return tokens;
				};
				
				function compileArray(name, tokens, str, i, imax, optional){
					var start = ++i;
					i = cursor_groupEnd(str, i, imax, 91, 93);
					var innerTokens = _compile(str, start, i);
					
					i++;
					if (str.charCodeAt(i) !== 40 /*(*/) 
						throw_('Punctuation group expected');
					
					start = ++i;
					i = cursor_groupEnd(str, i, imax, 40, 41)
					var delimiter = str.substring(start, i);
					tokens.push(
						new token_Array(
							name
							, innerTokens
							, new token_Punctuation(delimiter)
							, optional
						)
					);
					return i;
				}
				function compileExtendedVar(name, tokens, str, i, imax){
					var start = ++i;
					i = cursor_groupEnd(str, i, imax, 40, 41);
					tokens.push(
						new token_ExtendedVar(name, str.substring(start, i))
					);
					return i;
				}
				function compileCustomVar(name, tokens, str, i, imax) {
					var start = ++i;
					i = cursor_tokenEnd(str, i, imax);
					tokens.push(
						new token_CustomVar(name, str.substring(start, i))
					);
					return i;
				}
				function compileGroup(optional, tokens, str, i, imax) {
					var start = ++i;
					i = cursor_groupEnd(str, start, imax, 40, 41);
					tokens.push(
						new token_Group(_compile(str, start, i), optional)
					);
					return i;
				}
				
				function throw_(msg) {
					throw Error('Lexer pattern: ' + msg);
				}
			}());
			// end:source ./compile.js
			// source ./consume.js
			var _consume;
			(function() {
				_consume = function(tokens, str, index, length, out, isOptional){
					var index_ = index;
					var imax = tokens.length,
						i = 0, token, start;
					for(; i < imax; i++) {
						token = tokens[i];
						start = index;
						index = token.consume(str, index, length, out);
						if (index === start) {
							if (token.optional === true) {
								continue;
							}
							if (isOptional === true) {
								return index_;
							}
							// global require is also not optional: throw error
							var msg = 'Token of type `' + token.name + '`';
							if (token.token) {
								msg += ' Did you mean: `' + token.token + '`?';
							}
							parser_error(msg, str, index);
							return index_;
						}
					}
					return index;
				};
			}());
			// end:source ./consume.js
			// source ./tokens.js
			var token_Const,
				token_Var,
				token_String,
				token_Whitespace,
				token_Array,
				token_Punctuation,
				token_ExtendedVar,
				token_CustomVar,
				token_Group,
				token_OrGroup;
			(function(){
				
				token_Whitespace = create('Whitespace', {
					constructor: function(optional){
						this.optional = optional;
					},
					consume: cursor_skipWhitespace
				});
				
				// To match the string and continue, otherwise stops current consumer
				// foo
				token_Const = create('Const', {
					constructor: function(str) {
						this.token = str;
					},
					consume: function(str, i, imax){
						var end = i + this.token.length;
						str = str.substring(i, end);
						return  str === this.token ? end : i;
					}
				});
				// consume string (JS syntax) to the variable
				// $foo
				token_Var = create('Var', {
					constructor: function(name){
						this.token = name;
						this.setter = generateSetter(name);
					},
					consume: function(str, i, imax, out) {
						var end = cursor_tokenEnd(str, i, imax);
						if (end === i) 
							return i;
						
						this.setter(out, str.substring(i, end));
						return end;
					}
				});
				/* consume string to the variable
				 * - by Regexp
				 *     $$foo(\w+)
				 * - rest of the string
				 *     $$foo(*)
				 * - inside a group of chars `()` `[]` `""` `''`, etc
				 *     $$foo(*())
				 */
				token_ExtendedVar = create('ExtendedVar', {
					constructor: function(name, rgx){
						this.token = rgx;
						this.setter = generateSetter(name);
						if (rgx.charCodeAt(0) === 42) {
							// *
							if (rgx === '*') {
								this.consume = this.consumeAll;
								return;
							}
							if (rgx.length === 3) {
								this.consume = this.consumeGroup;
								return;
							}
							throw Error('`*` consumer expected group chars to parse');
						}
						this.rgx = new RegExp(rgx, 'g');
					},
					consumeAll: function(str, i, imax, out){
						this.setter(out, str.substring(i));
						return imax;
					},
					consumeGroup: function(str, i, imax, out){
						var start = this.token.charCodeAt(1),
							end   = this.token.charCodeAt(2);
						if (str.charCodeAt(i) !== start) {
							return token_Var
								.prototype
								.consume
								.call(this, str, i, imax, out);
						}
						
						var end = cursor_groupEnd(str, ++i, imax, start, end);
						if (end === i) 
							return i;
						
						this.setter(out, str.substring(i, end));
						return end + 1;
					},
					consume: function(str, i, imax, out) {
						this.rgx.lastIndex = i;
						var match = this.rgx.exec(str);
						if (match == null) 
							return i;
						
						var x = match[0];
						this.setter(out, x);
						return i + x.length;
					}
				});
				(function(){
					// Consume string with custom Stop/Continue Function to the variable
					token_CustomVar = create('CustomVar', {
						constructor: function(name, consumer) {
							this.fn = Consumers[consumer];
							this.token = name;
							this.setter = generateSetter(name);
						},
						consume: function(str, i, imax, out) {
							var start = i;
							
							var c;
							for (; i < imax; i++){
								c = str.charCodeAt(i);
								if (c === 36 || c === 95 || c === 58) {
									// $ _ :
									continue;
								}
								if ((48 <= c && c <= 57) ||		// 0-9
									(65 <= c && c <= 90) ||		// A-Z
									(97 <= c && c <= 122)) {	// a-z
									continue;
								}
								if (this.fn(c) === true) {
									continue;
								}
								break;
							}
							if (i === start) 
								return i;
							
							this.setter(out, str.substring(start, i));
							return i;
						}
					});
					
					var Consumers = {
						accessor: function(c){
							if (c === 46 /*.*/) {
								return true;
							}
							return false;
						}
					};
				}());
				
				token_String = create('String', {
					constructor: function(tokens){
						this.tokens = tokens;
					},
					consume: function(str, i, imax, out) {
						var c = str.charCodeAt(i);
						if (c !== 34 && c !== 39) 
							return i;
						
						var end = cursor_quoteEnd(str, i + 1, imax, c === 34 ? '"' : "'");
						if (this.tokens.length === 1) {
							var $var = this.tokens[0];
							out[$var.token] = str.substring(i + 1, end);
						} else {
							throw Error('Not implemented');
						}
						return ++end;
					}
				});
				token_Array = create('Array', {
					constructor: function(name, tokens, delim, optional) {
						this.token = name;
						this.delim = delim;
						this.tokens = tokens;
						this.optional = optional;
					},
					consume: function(str, i, imax, out){
						var obj, end, arr;
						while(true) {
							obj = {};
							end = _consume(this.tokens, str, i, imax, obj, this.optional);
							
							if (i === end) {
								if (arr == null) 
									return i;
								throw Error('Next item expected');
							}
							if (arr == null) 
								arr = [];
							arr.push(obj);
							i = end;
							
							end = this.delim.consume(str, i, imax);
							if (i === end) 
								break;
							i = end;
						}
						out[this.token] = arr;
						return i;
					}
				});
				token_Punctuation = create('Punc', {
					constructor: function(str){
						this.before = new token_Whitespace(true);
						this.delim = new token_Const(str);
						this.after = new token_Whitespace(true);
						this.token = str;
					},
					consume: function(str, i, imax){
						var start = this.before.consume(str, i, imax);
						var end = this.delim.consume(str, start, imax);
						if (start === end) {
							return i;
						}
						return this.after.consume(str, end, imax);
					}
				});
				token_Group = create('Group', {
					constructor: function(tokens, optional) {
						this.optional = optional;
						this.tokens = tokens;
					},
					consume: function(str, i, imax, out){
						return _consume(this.tokens, str, i, imax, out, this.optional);
					}
				});
				token_OrGroup = create('OrGroup', {
					constructor: function(groups) {
						this.groups = groups,
						this.length = groups.length;
					},
					consume: function(str, i, imax, out) {
						var start = i,
							j = 0;
						for(; j < this.length; j++) {
							i = this.groups[j].consume(str, i, imax, out);
							if (i !== start) 
								return i;
						}
						return i;
					}
				});
				
				function generateSetter(name) {
					return new Function('obj', 'val', 'obj.' + name + '= val;');
				}
				function create(name, Proto) {
					var Ctor = Proto.constructor;
					Proto.name = name;
					Proto.optional = false;
					Proto.token = null;
					Ctor.prototype = Proto;
					return Ctor;
				}
			}());
			// end:source ./tokens.js
			
			ObjectLexer = function(pattern){
				if (arguments.length === 1 && typeof pattern === 'string') {
					return ObjectLexer_single(pattern);
				}
				return ObjectLexer_sequance(Array.prototype.slice.call(arguments));
			};
			
			function ObjectLexer_single (pattern){
				var tokens = _compile(pattern);
				return function(str, i, imax, out, optional){
					return _consume(tokens, str, i, imax, out, optional);
				};	
			}
		
			var ObjectLexer_sequance;
			(function(){
				ObjectLexer_sequance = function(args) {
					var jmax = args.length,
						j = -1;
					while( ++j < jmax ) {
						args[j] = __createConsumer(args[j]);
					}
					return function(str, i, imax, out, optional){
						var start;
						j = -1;
						while( ++j < jmax ) {
							start = i;
							i = __consume(args[j], str, i, imax, out, optional);
							if (i === start) 
								return start;
						}
						return i;
					}
				};
				function __consume(x, str, i, imax, out, optional) {
					if (typeof x === 'function') {
						return x(str, i, imax, out, optional);
					}
					return __consumeOptionals(x, str, i, imax, out, optional);
				}
				function __consumeOptionals(arr, str, i, imax, out, optional) {
					var start = i,
						jmax = arr.length,
						j = -1;
					while( ++j < jmax ){
						i = arr[j](str, i, imax, out, true);
						if (start !== i) 
							return i;
					}
					if (optional !== true) {
						// notify
						arr[0](str, start, imax, out, optional);
					}
					return start;
				}
				function __createConsumer(mix) {
					if (typeof mix === 'string') {
						return ObjectLexer_single(mix);
					}
					// else Array<string>
					var i = mix.length;
					while(--i > -1) mix[i] = ObjectLexer_single(mix[i]);
					return mix;
				}
			}());
			
		}());
		// end:source ./object/ObjectLexer
		// source ./parsers/var
		(function(){
			custom_Parsers['var'] = function(str, index, length, parent){
				var node = new VarNode('var', parent),
					start,
					c;
				
				var go_varName = 1,
					go_assign = 2,
					go_value = 3,
					go_next = 4,
					state = go_varName,
					token,
					key;
				while(true) {
					if (index < length && (c = str.charCodeAt(index)) < 33) {
						index++;
						continue;
					}
					
					if (state === go_varName) {
						start = index;
						index = cursor_refEnd(str, index, length);
						key = str.substring(start, index);
						state = go_assign;
						continue;
					}
					
					if (state === go_assign) {
						if (c !== 61 ) {
							// =
							parser_error(
								'Assignment expected'
								, str
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
								index = cursor_groupEnd(str, index, length, c, c + 2);
								break;
							case 39:
							case 34:
								// ' "
								index = cursor_quoteEnd(str, index, length, c === 39 ? "'" : '"')
								break;
							default:
								while (index < length) {
									c = str.charCodeAt(index);
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
						node.attr[key] = str.substring(start, index);
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
				return [node, index, 0];
			};
			
			var VarNode = class_create(Dom.Node, {
				stringify: function() {
					var attr = this.attr;
					var str = 'var ';
					for(var key in attr){
						if (str !== 'var ') 
							str += ',';
						
						str += key + '=' + attr[key];
					}
					return str + ';';
				}
			});
		}());
		// end:source ./parsers/var
		// source ./parsers/content
		(function(){
			
			// source content/style
			var Style;
			(function () {
				Style = {
					transform: function(body, attr, parent) {
						if (attr.self != null) {
							var style = parent.attr.style;
							parent.attr.style = parser_ensureTemplateFunction((style || '') + body);
							return null;
						}
						
						var str = body;
						if (attr.scoped) {
							attr.scoped = null;
							str = style_scope(str, parent);
						}
						
						str = style_transformHost(str, parent);
						return str;
					}
				}
				
				var style_scope,
					style_transformHost;
				(function(){
					var counter = 0;
					var rgx_selector = /^([\s]*)([^\{\}]+)\{/gm;
					var rgx_host = /^([\s]*):host\s*(\(([^)]+)\))?\s*\{/gm;
					
					style_scope = function(css, parent){
						var id;
						return css.replace(rgx_selector, function(full, pref, selector){
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
					};
					
					style_transformHost = function(css, parent) {
						var id;
						return css.replace(rgx_host, function(full, pref, ext, expr){
							
							return pref
								+ (id || (id = getId(parent)))
								+ (expr || '')
								+ '{';
						});
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
			// end:source content/style
			
			custom_Parsers['style' ] = createParser('style', Style.transform);
			custom_Parsers['script'] = createParser('script');
			
			custom_Tags['style' ] = createHandler('style');
			custom_Tags['script'] = createHandler('script');
			
			var ContentNode = class_create(Dom.Node, {
				content: null,
				
				stringify: function (stream) {
					stream.processHead(this);
					
					var body = this.content;
					if (body == null) {
						stream.print(';');
						return;
					}
					if (is_Function(body)) {
						body = body();
					}
					
					stream.openBlock('{');
					stream.print(body);
					stream.closeBlock('}');
					return;
				}
			});
			
			function createParser(name, transform) {
				return function (str, i, imax, parent) {
						var start = i,
						end,
						attr,
						hasBody,
						body,
						c;
						
					while(i < imax) {
						c = str.charCodeAt(i);
						if (c === 123 || c === 59 || c === 62) {
							//{;>
							break;
						}
						i++;
					}
					if (c === 62) {
						// handle single as generic mask node
						return [ new Dom.Node(name, parent), i, go_tag ];
					}
					
					attr = parser_parseAttr(str, start, i);
					for (var key in attr) {
						attr[key] = ensureTemplateFunction(attr[key]);
					}
					
					end = i;
					hasBody = c === 123;
					
					if (hasBody) {
						i++;
						end = cursor_groupEnd(str, i, imax, 123, 125); //{}
						body = str.substring(i, end);
						
						if (transform != null) {
							body = transform(body, attr, parent);
							if (body == null) {
								return [ null, end + 1 ];
							}
						}
						
						body = preprocess(name, body);
						body = ensureTemplateFunction(body);
					}
					
					var node = new ContentNode(name, parent);
					node.content = body;
					node.attr = attr;
					return [ node, end + 1, 0 ];
				};
			}
			
			function createHandler(name) {
				return class_create(customTag_Base, {
					meta: {
						mode: 'server'
					},
					body : null,
					
					constructor: function(node, model, ctx, el, ctr){
						var content = node.content;
						if (content == null && node.nodes) {
							var x = node.nodes[0];
							if (x.type === Dom.TEXTNODE) {
								content = x.content;
							} else {
								//@OBSOLETE. allow only textnodes
								content = jmask(x.nodes).text();
							}
						}
						
						this.body = is_Function(content)
							? content('node', model, ctx, el, ctr)
							: content
							;
					},		
					render: function(model, ctx, container) {
						var el = document.createElement(name),
							body = this.body,
							attr = this.attr;
						el.textContent = body; 
						for(var key in attr) {
							var val =  attr[key];
							if (val != null) {
								el.setAttribute(key, val);
							}
						}
						container.appendChild(el);
					}
				});
			}
			
			function preprocess(name, body) {
				var fn = __cfg.preprocessor[name];
				if (fn == null) {
					return body;
				}
				var result = fn(body);
				if (result == null) {
					log_error('Preprocessor must return a string');
					return body;
				}
				return result;
			}
		}());
		// end:source ./parsers/content
		// source ./parsers/import
		(function(){
			var IMPORT  = 'import',
				IMPORTS = 'imports';
			
			custom_Parsers[IMPORT] = function(str, i, imax, parent){
				var obj = {
					exports: null,
					alias: null,
					path: null
				};
				var end = lex_(str, i, imax, obj);
				return [ new ImportNode(parent, obj),  end, 0 ];
			};
			custom_Parsers_Transform[IMPORT] = function(current) {
				if (current.tagName === IMPORTS) {
					return null;
				}
				var imports = new ImportsNode('imports', current);
				current.appendChild(imports);
				return imports;
			};
			
			var lex_ = ObjectLexer(
				[ 'from "$path"'
				, '* as $alias from "$path"'
				, '$$exports[$name?( as $alias)](,) from "$path"'
				]
			);
			
			var ImportsNode = class_create(Dom.Node, {
				stringify: function (stream) {
					stream.process(this.nodes);
				}
			});
			
			var ImportNode = class_create({
				type: Dom.COMPONENT,
				tagName: IMPORT,
				
				path: null,
				exports: null,
				alias: null,
				
				constructor: function(parent, data){
					this.path = data.path;
					this.alias = data.alias;
					this.exports = data.exports;
					
					this.parent = parent;
				},
				stringify: function(){
					var from = " from '" + this.path + "';";
					if (this.alias != null) {
						return IMPORT + " * as " + this.alias + from;
					}
					if (this.exports != null) {
						var arr = this.exports,
							str = '',
							imax = arr.length,
							i = -1, x; 
						while( ++i < imax ){
							x = arr[i];
							str += x.name;
							if (x.alias) {
								str += ' as ' + x.alias;
							}
							if (i !== imax - 1) {
								str +=', ';
							}
						}
						return IMPORT + ' ' + str + from;
					}
					return IMPORT + from;
				}
			});
			
		}());
		// end:source ./parsers/import
		// source ./parsers/define
		(function(){
			createParser('define');
			createParser('let');
			
			function createParser (tagName) {
				custom_Parsers[tagName] = function(str, i, imax, parent){
					var node = new DefineNode(tagName, parent);
					var end = lex_(str, i, imax, node);
					return [ node,  end, go_tag ];
				};
			}
			var lex_ = ObjectLexer(
				'$name'
				, '?( as $$as(*()))?( extends $$extends[$$compo<accessor>](,))'
				, '{'
			);
			var DefineNode = class_create(Dom.Node, {
				'name': null,
				'extends': null,
				'as': null,
				
				stringify: function(stream){
					var extends_ = this['extends'],
						as_ = this['as'],
						str = '';
					if (as_ != null && as_.length !== 0) {
						str += ' as (' + as_ + ')';
					}
					if (extends_ != null && extends_.length !== 0) {
						str += ' extends ';
						var imax = extends_.length,
							i = -1, x;
						while( ++i < imax ){
							str += extends_[i].compo;
							if (i < imax - 1) 
								str += ', ';
						}
					}
					
					var head = this.tagName + ' ' + this.name + str;
					stream.write(head)
					stream.openBlock('{');
					stream.process(this.nodes);
					stream.closeBlock('}');
				},
			});
			
		}());
		// end:source ./parsers/define
		// source ./parsers/methods
		(function(){	
			function create(tagName){
				return function(str, i, imax, parent) {
					var start = str.indexOf('{', i) + 1,
						head = parseHead(
							tagName, str.substring(i, start - 1)
						),
						end = cursor_groupEnd(str, start, imax, 123, 125),
						body = str.substring(start, end),
						node = new MethodNode(tagName, head.shift(), head, body, parent)
						;
					return [ node, end + 1, 0 ];
				};
			}
			
			function parseHead(name, head) {
				var parts = /(\w+)\s*\(([^\)]*)\)/.exec(head);
				if (parts == null) {
					log_error(name,' has invalid head syntax:', head);
					return null;
				}
				var arr = [ parts[1] ];
				arr = arr.concat(
					parts[2].replace(/\s/g, '').split(',')
				);
				return arr;
			}
			function compileFn(args, body) {
				var arr = _Array_slice.call(args);
				var compile = __cfg.preprocessor.script;
				if (compile != null) {
					body = compile(body);
				}
				arr.push(body);			
				return new (Function.bind.apply(Function, [null].concat(arr)));
			}
			
			var MethodNode = class_create(Dom.Component.prototype, {
				'name': null,
				'body': null,
				'args': null,
				
				'fn': null,
				
				constructor: function(tagName, name, args, body, parent){
					this.tagName = tagName;
					this.name = name;
					this.args = args;
					this.body = body;
					this.parent = parent;
					this.fn = compileFn(args, body);
				},
				stringify: function(stream){
					var head = this.tagName
						+ ' '
						+ this.name
						+ '('
						+ this.args.join(',')
						+ ')';
					stream.write(head);
					stream.openBlock('{');
					stream.print(this.body);
					stream.closeBlock('}');
				}
			});
			
			custom_Parsers['slot' ]    = create('slot');
			custom_Parsers['event']    = create('event');
			custom_Parsers['function'] = create('function');
		}());
		
		// end:source ./parsers/methods
		// source ./html/parser
		(function () {
			var state_closeTag = 21;
			
			parser_parseHtml = function(str) {
				var current = new Fragment(),
					fragment = current,
					state = go_tag,
					i = 0,
					imax = str.length,
					token,
					c, // charCode
					start;
			
				outer: while (i <= imax) {
					i = cursor_skipWhitespace(str, i, imax);
					
					if (state === state_attr) {
						i = parser_parseAttrObject(str, i, imax, current.attr);
						if (i === imax) {
							break;
						}
						handleNodeAttributes(current);
						
						switch (char_(str, i)) {
							case 47:  // /
								current = current.parent;
								i = until_(str, i, imax, 62);
								i++;
								break;
							case 62: // >
								if (SINGLE_TAGS[current.tagName.toLowerCase()] === 1) {
									current = current.parent;
								}
								break;
						}
						i++;
						if (current.tagName === 'mask') {
							start = i;
							i = str.indexOf('</mask>', start);
							var mix = parser_parse(str.substring(start, i));
							var nodes = current.parent.nodes;
							nodes.splice(nodes.length - 1, 1);
							current = current.parent;
							if (mix.type === Dom.FRAGMENT) {
								_appendMany(current, mix.nodes);
							} else {
								current.appendChild(mix);
							}
							i += 7; //</mask> @TODO proper </mask> search
						}
						
						state = state_literal;
						continue outer;
					}
					c = char_(str, i);
					if (c === 60) {
						//<
						c = char_(str, ++i)
						if (c === 33 &&
							char_(str, i + 1) === 45 &&
							char_(str, i + 2) === 45) {
							//!--
							// COMMENT
							i = str.indexOf('-->', i + 3) + 3;
							if (i === 2) {
								// if DEBUG
								parser_warn('Comment has no ending', str, i);
								// endif
								i = imax;
							}
							continue;
						}
						if (c < 33) {
							i = cursor_skipWhitespace(str, i, imax);
						}
						c = char_(str, i, imax);
						if (c === 47 /*/*/) {
							state = state_closeTag;
							i++;
							i = cursor_skipWhitespace(str, i, imax);
						}
						
						start = i;
						i = cursor_tokenEnd(str, i + 1, imax);
						token = str.substring(start, i);
						
						if (state === state_closeTag) {
							current = tag_Close(current, token.toLowerCase());
							state   = state_literal;
							i   = until_(str, i, imax, 62 /*>*/);
							i   ++;
							continue;
						}
						// open tag
						current = tag_Open(token, current);
						state = state_attr;
						continue;
					}
					
					// LITERAL
					start = i;
					token = '';
					while(i <= imax) {
						c = char_(str, ++i);
						if (c === 60 /*<*/) {
							// MAYBE NODE
							c = char_(str, i + 1);
							if (c === 36 || c === 95 || c === 58 || 43) {
								// $ _ : +
								break;
							}
							if ((65 <= c && c <= 90) ||		// A-Z
								(97 <= c && c <= 122)) {	// a-z
								break;
							}
						}
						if (c === 38 /*&*/) {
							// ENTITY
							var Char = null;
							var ent  = null;
							ent = unicode_(str, i + 1);
							if (ent != null) {
								Char = unicode_toChar(ent);
							} else {
								ent = entity_(str, i + 1);
								if (ent != null) {
									Char = entity_toChar(ent);
								}
							}
							if (Char != null) {
								token += str.substring(start, i) + Char;
								start = i + ent.length + 1 /*;*/;
							}
						}
					}
					token += str.substring(start, i);
					if (token !== '') {
						token = ensureTemplateFunction(token);
						current.appendChild(new TextNode(token, current));
					}
				}
				
					
				
				var nodes = fragment.nodes;
				return nodes != null && nodes.length === 1
					? nodes[0]
					: fragment
					;
			};
			
			
			function char_(str, i) {
				return str.charCodeAt(i);
			}
			function until_(str, i, imax, c) {
				for(; i < imax; i++) {
					if (c === char_(str, i)) {
						return i;
					}
				}
				return i;
			}
			function unicode_(str, i, imax) {
				var lim = 7,
					c = char_(str, i);
				if (c !== 35 /*#*/) {
					return null;
				}
				var start = i + 1;
				while (++i < imax) {
					if (--lim === 0) {
						return null;
					}
					c = char_(str, i);
					if (48 <= c && c <= 57 /*0-9*/) {
						continue;
					}
					if (65 <= c && c <= 70 /*A-F*/) {
						continue;
					}
					if (c === 120 /*x*/) {
						continue;
					}
					if (c === 59 /*;*/) {
						return str.substring(start, i);
					}
					break;
				}
				return null;
			}
			function unicode_toChar(unicode) {
				var num = Number('0' + unicode);
				if (num !== num) {
					parser_warn('Invalid Unicode Char', unicode);
					return '';
				}
				return String.fromCharCode(num);
			}
			function entity_(str, i, imax) {
				var lim = 10,
					start = i;
				for(; i < imax; i++, lim--) {
					if (lim === 0) {
						return null;
					}
					var c = char_(str, i);
					if (c === 59 /*;*/) {
						break;
					}
					if ((48 <= c && c <= 57) ||		// 0-9
						(65 <= c && c <= 90) ||		// A-Z
						(97 <= c && c <= 122)) {	// a-z
						i++;
						continue;
					}
					return null;
				}
				return str.substring(start, i);
			}
			
			var entity_toChar;
			(function (d) {
				
		
				
				// if NODE
				var HtmlEntities;
				entity_toChar = function(ent){
					if (HtmlEntities == null) {
						HtmlEntities = require('./html_entities.js');
					}
					return HtmlEntities[ent];
				};
				// endif
			}(document));
			
			var SINGLE_TAGS = {
				area  : 1,
				base  : 1,
				br    : 1,
				col   : 1,
				embed : 1,
				hr    : 1,
				img   : 1,
				input : 1,
				keygen: 1,
				link  : 1,
				menuitem: 1,
				meta  : 1,
				param : 1,
				source: 1,
				track : 1,
				wbr   : 1
			};
			var IMPLIES_CLOSE;
			(function(){
				var formTags = {
					input: 1,
					option: 1,
					optgroup: 1,
					select: 1,
					button: 1,
					datalist: 1,
					textarea: 1
				};
				IMPLIES_CLOSE = {
					tr      : { tr:1, th:1, td:1 },
					th      : { th:1 },
					td      : { thead:1, td:1 },
					body    : { head:1, link:1, script:1 },
					li      : { li:1 },
					p       : { p:1 },
					h1      : { p:1 },
					h2      : { p:1 },
					h3      : { p:1 },
					h4      : { p:1 },
					h5      : { p:1 },
					h6      : { p:1 },
					select  : formTags,
					input   : formTags,
					output  : formTags,
					button  : formTags,
					datalist: formTags,
					textarea: formTags,
					option  : { option:1 },
					optgroup: { optgroup:1 }
				};
			}());
			
			function tag_Close(current, name) {
				if (SINGLE_TAGS[name] === 1) {
					// donothing
					return current;
				}
				
				var x = current;
				while(x != null) {
					if (x.tagName != null && x.tagName.toLowerCase() === name) {
						break;
					}
					x = x.parent;
				}
				if (x == null) {
					parser_warn('Unmatched closing tag', name);
					return current;
				}
				return x.parent || x;
			}
			function tag_Open(name, current) {
				var node = current;
				var TAGS = IMPLIES_CLOSE[name];
				if (TAGS != null) {
					while (node.parent != null && node.parent.tagName && TAGS[node.parent.tagName.toLowerCase()] === 1) {
						node = node.parent;
					}
				}
				
				var next = new Node(name, node);
				node.appendChild(next);
				return next;
			}
			
			function handleNodeAttributes(node) {
				var obj = node.attr,
					key, val;
				for(key in obj) {
					val = obj[key];
					if (val != null && val !== key) {
						obj[key] = ensureTemplateFunction(val);
					}
				}
				if (obj.expression != null) {
					node.expression = obj.expression;
					node.type = Dom.STATEMENT;
				}
			}
			
			function _appendMany(node, nodes) {
				arr_each(nodes, function(x){
					node.appendChild(x)
				});
			}
		}());
		// end:source ./html/parser
		
		var go_tag = 2,
			state_tag = 3,
			state_attr = 5,
			go_attrVal = 6,
			go_attrHeadVal = 7,
			state_literal = 8,
			go_up = 9
			;
		
		parser_ensureTemplateFunction = ensureTemplateFunction;
		parser_ObjectLexer = ObjectLexer;
	
		/** @out : nodes */
		parser_parse = function(template) {
			var current = new Fragment(),
				fragment = current,
				state = go_tag,
				last = state_tag,
				index = 0,
				length = template.length,
				classNames,
				token,
				tokenIndex,
				key,
				value,
				next,
				c, // charCode
				start,
				nextC;
			
			fragment.source = template;
			outer: while (true) {
				
				while (index < length && (c = template.charCodeAt(index)) < 33) {
					index++;
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
							parser_warn('Block comment has no ending', template, index);
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
						var parser = custom_Parsers[token];
						if (parser != null) {
							// Parser should return: [ parsedNode, nextIndex, nextState ]
							var tuple = parser(
								template
								, index
								, length
								, current
							);
							var node = tuple[0],
								nextState = tuple[2];
								
							index = tuple[1];
							state = nextState === 0
								? go_tag
								: nextState;
							if (node != null) {
								node.sourceIndex = tokenIndex;
								
								var transform = custom_Parsers_Transform[token];
								if (transform != null) {
									var x = transform(current, node);
									if (x != null) {
										// make the current node single, to exit this and the transformed node on close
										current.__single = true;
										current = x;
									}
								}
								
								current.appendChild(node);
								if (nextState !== 0) {
									current = node;
								} else {
									if (current.__single === true) {
										do {
											current = current.parent;
										} while (current != null && current.__single != null);
									}
								}
							}
							token = null;
							continue;
						}
						
						
						next = new Node(token, current);
						next.sourceIndex = tokenIndex;
						
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
					if (current == null) {
						current = fragment;
						parser_warn(
							'Unexpected tag closing'
							, template
							, cursor_skipWhitespaceBack(template, index - 1)
						);
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
					if (current.nodes != null) {
						// skip ; , when node is not a single tag (else goto 125)
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
						parser_warn('Literal has no ending', template, start - 1);
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
	
					tokenIndex = start;
					token = template.substring(start, index);
					
					if (isEscaped === true) {
						token = token.replace(__rgxEscapedChar[_char], _char);
					}
					
					if (state !== state_attr || key !== 'class') {
						token = ensureTemplateFunction(token);
					}
					index += isUnescapedBlock ? 3 : 1;
					continue;
				}
	
				if (state === go_tag) {
					last = state_tag;
					state = state_tag;
					//next_Type = Dom.NODE;
					
					if (c === 46 /* . */ || c === 35 /* # */ ) {
						tokenIndex = index;
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
							tokenIndex = index;
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
						parser_error('', template, index, c, state);
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
				tokenIndex = start;
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
				current.nodes != null &&
				parent.tagName !== 'imports') {
				parser_warn('Tag was not closed: ' + current.tagName, template)
			}
			// endif
	
			
			var nodes = fragment.nodes;
			return nodes != null && nodes.length === 1
				? nodes[0]
				: fragment
				;
		};
	
		parser_cleanObject = function(mix) {
			if (is_Array(mix)) {
				for (var i = 0; i < mix.length; i++) {
					parser_cleanObject(mix[i]);
				}
				return mix;
			}
			delete mix.parent;
			delete mix.__single;
			if (mix.nodes != null) {
				parser_cleanObject(mix.nodes);
			}
			return mix;
		};
		
		parser_setInterpolationQuotes = function(start, end) {
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
		};
		
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
		
		parser_parseAttrObject = function(str, i, imax, attr){
			var state_KEY = 1,
				state_VAL = 2,
				state_END = 3,
				state = state_KEY,
				token, index, key, c;
				
			outer: while(i < imax) {
				i = cursor_skipWhitespace(str, i, imax);
				if (i === imax) 
					break;
				
				index = i;
				c = str.charCodeAt(i);
				switch (c) {
					case 61 /* = */:
						i++;
						state = state_VAL;
						continue outer;
					case 123:
					case 59:
					case 62:
					case 47:
						// {;>/
						state = state_END;
						break;
					case 40:
						//()
						i = cursor_groupEnd(str, ++index, imax, 40, 41);
						if (key != null) {
							attr[key] = key;
						}
						key = 'expression';
						token = str.substring(index, i);
						i++;
						state = state_VAL;
						break;
					case 39:
					case 34:
						//'"
						i = cursor_quoteEnd(str, ++index, imax, c === 39 ? "'" : '"');
						token = str.substring(index, i);
						i++;
						break;
					default:
						i++;
						for(; i < imax; i++){
							c = str.charCodeAt(i);
							if (c < 33 || c === 61 || c === 123 || c === 59 || c === 62 || c === 47) {
								// ={;>/
								break;
							}
						}
						token = str.substring(index, i);
						break;
				}
				
				if (token === '') {
					parser_warn('Token not readable', str, i);
					i++;
					continue;
				}
				
				if (state === state_VAL) {
					attr[key] = token;
					state = state_KEY;
					key = null;
					continue;
				}
				if (key != null) {
					attr[key] = key;
					key = null;
				}
				if (state === state_END) {
					break;
				}
				key = token;
			}
			return i;
		};
		
	}(Dom.Node, Dom.TextNode, Dom.Fragment, Dom.Component));
	
	// end:source /ref-mask/src/parser/
	// source /ref-mask/src/formatter/stringify_stream
	var mask_stringify,
		mask_stringifyAttr;
	(function () {
		
		var defaultOptions = {
			minify: true,
			indent: 4,
			indentChar: ' '
		};
		
		//opts (Number | Object) - Indention Number (0 - for minification)
		mask_stringify = function(input, opts) {
			if (input == null) 
				return '';
			
			if (typeof input === 'string') 
				input = parser_parse(input);
			
			if (opts == null) {
				opts = obj_create(defaultOptions);
			} else  if (typeof opts === 'number'){
				var indent = opts;
				opts = obj_create(defaultOptions);
				opts.indent = indent;
				opts.minify = indent === 0;
			} else{
				opts = obj_extendDefaults(opts, defaultOptions);
				if (opts.indent > 0) {
					opts.minify = false;
				}
				if (opts.minify === true) {
					opts.indent = 0;
				}
			}
			
			return new Stream(input, opts).toString();
		};
		
		mask_stringifyAttr = function(attr){
			var str = '',
				key, x, part;
			for (key in attr) {
				x = getString(attr[key]);
				
				if (str.length !== 0) {
					str += ' ';
				}
				str += key;
				
				if (x !== key) {
					str += "=" + wrapString(x);
				} 
			}
			return str;
		};
		
		var Stream = class_create({
			string: '',
			indent: 0,
			indentStr: '',
			minify: false,
			opts: null,
			ast : null,
			constructor: function(ast, opts) {
				this.opts = opts;
				this.ast  = ast;
				this.minify = opts.minify;
				this.indentStr = doindent(opts.indent, opts.indentChar);
			},
			toString: function(){
				this.process(this.ast, this);
				return this.string;
			},
			process: function(mix){
				if (mix.type === Dom.FRAGMENT) {
					mix = mix.nodes;
				}
				if (is_ArrayLike(mix)) {
					var imax = mix.length,
						i = -1;
					while ( ++i < imax ){
						if (i !== 0) {
							this.newline();
						}
						this.processNode(mix[i]);
					}
					return;
				}
				this.processNode(mix);
			},
			processNode: function(node) {
				var stream = this;
				if (is_Function(node.stringify)) {
					var str = node.stringify(stream);
					if (str != null) {
						stream.write(str);
					}
					return;
				}
				if (is_String(node.content)) {
					stream.write(wrapString(node.content));
					return;
				}
				if (is_Function(node.content)){
					stream.write(wrapString(node.content()));
					return;
				}
				
				this.processHead(node);
				
				if (isEmpty(node)) {
					stream.print(';');
					return;
				}
				if (isSingle(node)) {
					stream.openBlock('>');
					stream.processNode(getSingle(node));
					stream.closeBlock(null);
					return;
				}
				
				stream.openBlock('{');
				stream.process(node.nodes);
				stream.closeBlock('}');
			},
			processHead: function(node) {
				var stream = this,
					str = '',
					id, cls, expr
					;
				
				var attr = node.attr;
				if (attr != null) {
					id  = attr.id;
					cls = attr['class'];
					if (typeof id === 'function') {
						id = id();
					}
					if (id != null && id.indexOf(' ') !== -1) {
						id = null;
					}
					if (id != null) {
						str += '#' + id;
					}
					if (typeof cls === 'function') {
						cls = cls();
					}
					if (cls != null) {
						str += '.' + cls.trim().replace(/\s+/g, '.');
					}
					
					for(var key in attr) {
						if (key === 'id' && id != null) {
							continue;
						}
						if (key === 'class' && cls != null) {
							continue;
						}
						var val = attr[key];
						if (val == null) {
							continue;
						}
						
						str += ' ' + key;
						if (val === key) {
							continue;
						}
						if (typeof val === 'function') {
							val = val();
						}
						if (stream.minify === false || /[^\w_$\-\.]/.test(val)){
							val = wrapString(val);
						}
						str += '=' + val;
					}
				}
				
				if (isTagNameOptional(node, id, cls) === false) {
					str = node.tagName + str;
				}
				
				var expr = node.expression;
				if (expr != null) {
					if (typeof expr === 'function') {
						expr = expr();
					}
					if (stream.minify === false) {
						str += ' ';
					}
					str += '(' + expr + ')';
				}
				
				if (this.minify === false) {
					str = doindent(this.indent, this.indentStr) + str;
				}
				stream.print(str);
			},
			
			newline: function(){
				if (this.minify === false) {
					this.string += '\n';
				}
			},
			openBlock: function(c){
				this.indent++;
				if (this.minify === false) {
					this.string += ' ' + c + '\n';
					return;
				}
				this.string += c;
			},
			closeBlock: function(c){
				this.indent--;
				if (c != null) {
					this.newline();
					this.write(c);
				}
			},
			write: function(str){
				if (this.minify === true) {
					this.string += str;
					return;
				}
				var prfx = doindent(this.indent, this.indentStr);
				this.string += str.replace(/^/gm, prfx);
			},
			print: function(str){
				this.string += str;
			}
		});
		
		function doindent(count, c) {
			var output = '';
			while (count--) {
				output += c;
			}
			return output;
		}
	
		function isEmpty(node) {
			return node.nodes == null || (is_ArrayLike(node.nodes) && node.nodes.length === 0);
		}
	
		function isSingle(node) {
			var arr = node.nodes;
			if (arr == null) {
				return true;
			}
			var isArray = typeof arr.length === 'number';
			if (isArray && arr.length > 1) {
				return false;
			}
			var x = isArray ? arr[0] : arr;
			return x.stringify == null;
		}
		function isTagNameOptional(node, id, cls) {
			if (id == null && cls == null) {
				return false;
			}
			var tagName = node.tagName;
			if (tagName === 'div') {
				return true;
			}
			return false;
		}
		function getSingle(node) {
			if (is_ArrayLike(node.nodes)) 
				return node.nodes[0];
			
			return node.nodes;
		}
	
		function wrapString(str) {
			if (str.indexOf("'") === -1) 
				return "'" + str + "'";
			
			if (str.indexOf('"') === -1) 
				return '"' + str + '"';
			
			return '"' + str.replace(/"/g, '\\"') + '"';
		}
	
		function getString(mix) {
			return is_Function(mix) ? mix() : mix;
		}
		
	}());
	
	// end:source /ref-mask/src/formatter/stringify_stream

	
	//#source html-dom/
	var HtmlDom;
	(function(){
		HtmlDom = {};	
	
		obj_extend(Dom, {
			DOCTYPE: 11,
			UTILNODE: 12
		});
		
		var SingleTags = {
			'area': 1,
			'base': 1,
			'br': 1,
			'col': 1,
			'embed': 1,
			'hr': 1,
			'img': 1,
			'input': 1,
			'keygen': 1,
			'link': 1,
			'menuitem': 1,
			'meta': 1,
			'param': 1,
			'source': 1,
			'track': 1,
			'wbr': 1
		};
		
		// source ./util/node.js
		var node_insertBefore,
			node_empty;
		
		(function(){
			node_insertBefore = function(node, anchor) {
				return anchor.parentNode.insertBefore(node, anchor);
			};
			node_empty = function(node){
				while (node.firstChild != null) {
					node.removeChild(node.firstChild);
				}
			};
		}());
		
		// end:source ./util/node.js
		// source ./util/traverse.js
		
		function trav_getDoc(el, _deep) {
			if (el != null && el.nodeType === Dom.FRAGMENT) 
				el = el.firstChild;
			
			if (el == null)
				return null;
			
			if (el instanceof HtmlDom.Component === false)
				return null;
			
			if (el.compoName === ':document') 
				return el;
		
			if (_deep == null)
				_deep = 0;
			if (_deep === 4) 
				return null;
			
			var doc;
			doc = trav_getDoc(el.nextSibling, _deep);
			
			if (doc)
				return doc;
			
			return trav_getDoc(el.firstChild, ++_deep);
		}
		
		
		function trav_getChild(parent, tagName) {
			var el = parent.firstChild;
			
			while (el && el.tagName !== tagName) {
				el = el.nextSibling;
			}
			
			return el;
		}
		// end:source ./util/traverse.js
		// source ./util/stringify.js
		(function(){
		
			HtmlDom.stringify = function(document, model, ctx, compo) {
			
				if (compo == null || compo.components == null || compo.components.length === 0) {
					return document.toString();
				}
				
				var meta    = comment_meta(ctx),
					modules = comment_modules(ctx),
					documentElement = trav_getDoc(document);
				if (documentElement == null) {
					return meta.header
						+ modules
						+ document
						+ meta.footer
						;
				}
				
				var html = trav_getChild(documentElement, 'HTML');
				if (html != null) {
					var body = trav_getChild(html, 'BODY');
					if (body != null){
						el_prepend(body, modules);
						el_prepend(body, meta.header);
						el_append(body, meta.footer);
					}else{
						log_error('Body not found');
					}
				}
				return document.toString();
			};
		
			function comment_meta(ctx) {
				var headerJson = {
						model: ctx._models.stringify(),
						ctx: ctx_stringify(ctx),
						ID: ctx._id
					},
					headerInfo = {
						type: 'm'
					};
				
				return {
					header: new HtmlDom.Comment(Meta.stringify(headerJson, headerInfo)),
					footer: new HtmlDom.Comment(Meta.close(headerJson, headerInfo))
				};
			}
			function comment_modules(ctx) {
				if (ctx._modules == null) {
					return null;
				}
				var str = ctx._modules.stringify();
				if (str == null || str === '') {
					return null;
				}
				
				var comment = Meta.stringify({
					mask: str
				}, {
					type  : 'r',
					single: true
				});
				return new HtmlDom.Comment(comment);
			}
			
			function el_append(el, x) {
				if (x == null) return;
				el.appendChild(x);
			}
			function el_prepend(el, x) {
				if (x == null) return;
				el.insertBefore(x, el.firstChild)
			}
		}());
		
		
		// end:source ./util/stringify.js
		// source ./jq/util/selector.js
		
		var sel_key_UP = 'parentNode',
			sel_key_CHILD = 'firstChild',
			sel_key_ATTR = 'attributes';
		
		function selector_parse(selector, direction) {
			
			if (typeof selector === 'object') {
				// or null
				return selector;
			}
		
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
				matcher,
				eq,
				slicer;
		
			if (direction === 'up') {
				nextKey = sel_key_UP;
			} else {
				nextKey = sel_key_CHILD;
			}
		
			while (index < length) {
		
				c = selector.charCodeAt(index);
		
				if (c < 33) {
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
					_prop = null;
					_key = 'tagName';
					_selector = selector
						.substring(index, end)
						.toUpperCase();
				}
		
				index = end;
		
		
		
				if (matcher == null) {
					matcher = {
						key: _key,
						prop: _prop,
						selector: _selector,
						nextKey: nextKey,
		
						filters: null
					}
		
					continue;
				}
		
				if (matcher.filters == null) {
					matcher.filters = [];
				}
		
				matcher.filters.push({
					key: _key,
					selector: _selector,
					prop: _prop
				});
		
			}
		
			return matcher;
		}
		
		function sel_hasClassDelegate(matchClass) {
			return function(className){
				return sel_classIndex(className, matchClass) !== -1;
			};
		}
		
		// [perf] http://jsperf.com/match-classname-indexof-vs-regexp/2
		function sel_classIndex(className, matchClass, index) {
			if (className == null) 
				return -1;
			
			if (index == null) 
				index = 0;
				
			index = className.indexOf(matchClass, index);
		
			if (index === -1)
				return -1;
		
			if (index > 0 && className.charCodeAt(index - 1) > 32)
				return sel_classIndex(className, matchClass, index + 1);
		
			var class_Length = className.length,
				match_Length = matchClass.length;
				
			if (index < class_Length - match_Length && className.charCodeAt(index + match_Length) > 32)
				return sel_classIndex(className, matchClass, index + 1);
		
			return index;
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
		
				if (c === 46 || c === 35 || c === 91 || c === 93 || c < 33) {
					// .#[]
					if (isInQuote !== true && isEscaped !== true) {
						break;
					}
				}
				index++;
			}
			return index;
		}
		
		function selector_match(node, selector) {
			if (typeof selector === 'string') {
				selector = selector_parse(selector);
			}
		
			var obj = selector.prop ? node[selector.prop] : node,
				matched = false;
		
			if (obj == null) {
				return false;
			}
		
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
		
					if (selector_match(node, x) === false) {
						return false;
					}
				}
			}
		
			return matched;
		}
		
		// end:source ./jq/util/selector.js
		
		// source ./Node.js
		(function() {
			
			HtmlDom.Node = class_create({
				parentNode: null,
				firstChild: null,
				lastChild: null,
		
				nextSibling: null,
		
				get length() {
					var count = 0,
						el = this.firstChild;
		
					while (el != null) {
						count++;
						el = el.nextSibling;
					}
					return count;
				},
		
				get childNodes() {
					var array = [],
						el = this.firstChild;
					while (el != null) {
						array.push(el);
						el = el.nextSibling;
					}
					return array;
				},
			
				querySelector: function(selector) {
					var matcher = typeof selector === 'string'
						? selector_parse(selector)
						: selector
						;
					var el = this.firstChild,
						matched;
						
					for(; el != null; el = el.nextSibling) {
						if (selector_match(el, matcher))
							return el;
					}
		
					if (el != null)
						return el;
		
					el = this.firstChild;
					for (;el != null; el = el.nextSibling) {
						
						if (typeof el.querySelector === 'function') {
							matched = el.querySelector(matcher);
		
							if (matched != null)
								return matched;
						}
					}
					return null;
				},
		
				appendChild: function(child) {
		
					if (child == null)
						return child;
		
					if (child.nodeType === Dom.FRAGMENT) {
		
						var fragment = child;
						if (fragment.firstChild == null)
							return fragment;
		
						var el = fragment.firstChild;
						while (true) {
							el.parentNode = this;
		
							if (el.nextSibling == null)
								break;
		
							el = el.nextSibling;
						}
		
						if (this.firstChild == null) {
							this.firstChild = fragment.firstChild;
						} else {
							fragment.lastChild.nextSibling = fragment.firstChild;
						}
		
						fragment.lastChild = fragment.lastChild;
						return fragment;
					}
		
					if (this.firstChild == null) {
						this.firstChild = this.lastChild = child;
					} else {
						this.lastChild.nextSibling = child;
						this.lastChild = child;
					}
					child.parentNode = this;
					return child;
				},
		
				insertBefore: function(child, anchor) {
					var prev = this.firstChild;
					if (prev !== anchor) {
						while (prev != null && prev.nextSibling !== anchor) {
							prev = prev.nextSibling;
						}
					}
					if (prev == null)
						// set tail
						return this.appendChild(child);
		
					if (child.nodeType === Dom.FRAGMENT) {
						var fragment = child;
		
						// set parentNode
						var el = fragment.firstChild;
						if (el == null)
							// empty
							return fragment;
						
						while (el != null) {
							el.parentNode = this;
							el = el.nextSibling;
						}
		
						// set to head
						if (prev === anchor && prev === this.firstChild) {
							this.firstChild = fragment.firstChild;
		
							fragment.lastChild.nextSibling = prev;
							return fragment;
						}
		
						// set middle
						prev.nextSibling = fragment.firstChild;
						fragment.lastChild.nextSibling = anchor;
						return fragment;
					}
		
					child.parentNode = this;
		
					if (prev === anchor && prev === this.firstChild) {
		
						// set head
						this.firstChild = child;
						child.nextSibling = prev;
		
						return child;
					}
		
					// set middle
					prev.nextSibling = child;
					child.nextSibling = anchor;
		
					return child;
				},
				
				removeChild: function (node) {
					if (node == null) {
						return;
					}
					var child = this.firstChild,
						prev = null;
					while (child != null && child !== node) {
						prev = child;
						child = child.nextSibling;
					}
					if (child == null) {
						return;
					}
					
					if (prev == null) {
						// is first child;
						this.firstChild = child.nextSibling;
					} else {
						prev.nextSibling = child.nextSibling;
					}
					if (this.lastChild === child) {
						this.lastChild = prev;
					}
					
					node.nextSibling = null;
					node.parentNode = null;
				}
			});
		
		}());
		// end:source ./Node.js
		// source ./Doctype.js
		HtmlDom.DOCTYPE = class_create({
			nodeType: Dom.DOCTYPE,
			constructor: function(doctype){
				this.doctype = doctype;
			},
			toString: function(buffer){
				return this.doctype;
			}
		});
		
		
		// end:source ./Doctype.js
		// source ./DocumentFragment.js
		HtmlDom.DocumentFragment = class_createEx(
			HtmlDom.Node,
			{
				nodeType: Dom.FRAGMENT,
				toString: function(){
					var element = this.firstChild,
						string = '';
						
					while (element != null) {
						string += element.toString();
						element = element.nextSibling;
					}
					return string;
			}
		});
		// end:source ./DocumentFragment.js
		// source ./Element.js
		(function() {
			// source jq/classList.js
			function ClassList(node) {
				
				if (node.attributes == null) {
					debugger;
				}
				
				this.attr = node.attributes;
				this.className = this.attr['class'] || '';
			}
			
			ClassList.prototype = {
				get length() {
					return this.className.split(/\s+/).length;
				},
				
				contains: function(_class){
					return sel_classIndex(this.className, _class) !== -1;
				},
				remove: function(_class){
					var index = sel_classIndex(this.className, _class);
					if (index === -1) 
						return;
					
					var str = this.className;
					
					this.className =
					this.attr['class'] =
						str.substring(0, index) + str.substring(index + _class.length);
					
				},
				add: function(_class){
					if (sel_classIndex(this.className, _class) !== -1)
						return;
					
					this.className =
					this.attr['class'] = this.className
						+ (this.className === '' ? '' : ' ')
						+ _class;
				}
			};
			// end:source jq/classList.js
		
			HtmlDom.Element = class_createEx(
				HtmlDom.Node,
				{
					nodeType: Dom.NODE,
					constructor: function(name) {
						this.tagName = name.toUpperCase();
						this.attributes = {};
					},
					setAttribute: function(key, value) {
						this.attributes[key] = value;
					},
					getAttribute: function(key) {
						return this.attributes[key];
					},
					get classList () {
						return new ClassList(this);
					},
			
					toString: function() {
						var tagName = this.tagName.toLowerCase(),
							attr = this.attributes,
							value, element;
			
						var string = '<' + tagName;
			
						for (var key in attr) {
							value = attr[key];
			
							string += ' '
								+ key
								+ '="'
								+ (typeof value === 'string' ? value.replace(/"/g, '&quot;') : value)
								+ '"';
						}
		
						var isSingleTag = SingleTags[tagName] === 1,
							element = this.firstChild;
			
						if (element == null) {
							return string + (isSingleTag ? '/>' : '></' + tagName + '>');
						}
			
						string += isSingleTag ? '/>' : '>';
			
						if (isSingleTag) {
							string += '<!--~-->'
						}
			
						while (element != null) {
							string += element.toString();
							element = element.nextSibling;
						}
			
						if (isSingleTag)
							return string + '<!--/~-->';
			
						return string + '</' + tagName + '>';
					},
			
					// generic properties
					get value () {
						return this.attributes.value;
					},
					set value (value) {
						this.attributes.value = value;
					},
					get selected () {
						return this.attributes.selected
					},
					set selected (value) {
						if (!value) {
							delete this.attributes.selected;
							return;
						}
						this.attributes.selected = 'selected';
					},
					get checked () {
						return this.attributes.checked;
					},
					set checked (value) {
						if (!value) {
							delete this.attributes.checked;
							return;
						}
						this.attributes.checked = 'checked';
					},
					
					get textContent () {
						var child = this.firstChild;
						var txt = '';
						while (child != null) {
							if (child.nodeType === Node.TEXTNODE) {
								txt += child.textContent;
								continue;
							}
							
							txt += child.textContent || '';
							child = child.nextSibling;
						}
						return txt;
					},
					
					set textContent (str) {
						node_empty(this);
						this.appendChild(document.createTextNode(str));
					}
				}
			);
		
		}());
		// end:source ./Element.js
		// source ./TextNode.js
		(function() {
		
			HtmlDom.TextNode = class_create({
				nodeType: Dom.TEXTNODE,
				nextSibling: null,
				textContent: '',
				constructor: function TextNode(text){
					this.textContent = String(text == null ? '' : text);
				},
				toString: function() {
					return escape(this.textContent);
				}
			});
		
			function escape(html) {
				return html
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					;
			}
		}());
		// end:source ./TextNode.js
		// source ./Component.js
		(function(){
			// source /ref-mask/src/builder/util.js
			var builder_resumeDelegate,
				builder_pushCompo;
				
			(function(){
			
				builder_resumeDelegate = function (ctr, model, ctx, container, children, finilizeFn){
					var anchor = document.createComment('');		
					container.appendChild(anchor);
					return function(){
						return _resume(ctr, model, ctx, anchor, children, finilizeFn);
					};
				};
				builder_pushCompo = function (ctr, compo) {
					var compos = ctr.components;
					if (compos == null) {
						ctr.components = [ compo ];
						return;
					}
					compos.push(compo);
				};
				
				// == private
				
				function _resume(ctr, model, ctx, anchorEl, children, finilize) {
					
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
						
						anchorEl.parentNode.insertBefore(fragment, anchorEl);
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
								attrFn(anchorEl, ctr.attr[key], model, ctx, elements[0], ctr);
							}
						}
					}
					
					if (is_Function(finilize)) {
						finilize.call(
							ctr
							, elements
							, model
							, ctx
							, anchorEl.parentNode
						);
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
				
			}());
			// end:source /ref-mask/src/builder/util.js
			
			
			HtmlDom.Component = class_createEx(
				HtmlDom.Node,
				{
					nodeType: Dom.COMPONENT,
				
					compoName: null,
					compo: null,
					node : null,
					instance: null,
					components: null,
					ID: null,
					modelID: null,
					
					constructor: function (node, model, ctx, container, ctr) {
						this.node = node;
						this.compoName = node.compoName || node.tagName;
						return;
					
						////var compoName = node.compoName || node.tagName,
						////	Handler   = node.controller || custom_Tags[compoName] || obj_create(node),
						////	cache     = compo_getMetaInfo(Handler).cache || false;
						////
						////if (cache /* unstrict */) {
						////	var compo = Cache.getCompo(model, ctx, compoName, Handler);
						////	if (compo != null) {
						////		this.compo = compo;
						////		
						////		if (compo.__cached) {
						////			compo.render = fn_doNothing;
						////		}
						////		builder_pushCompo(ctr, compo);
						////		return;
						////	}
						////}
						////
						////var compo = _initController(Handler, node, model, ctx, container, ctr),
						////	cache = compo_getMetaInfo(compo).cache;
						////if (cache /* unstrict */) {
						////	Cache.cacheCompo(model, ctx, compoName, compo, cache);
						////}
						////if (compo.compoName == null) {
						////	compo.compoName = compoName;
						////}
						////if (compo.model == null) {
						////	compo.model = model;
						////}
						////if (compo.nodes == null) {
						////	compo.nodes = node.nodes;
						////}
						////this.compoName = compo.compoName;
						////this.compo = compo;
						////this.node  = node;
						////
						////var attr = obj_extend(compo.attr, node.attr),
						////	mode = compo_getMetaVal(ctr, 'mode');
						////if (mode_SERVER_ALL === mode || mode_SERVER_CHILDREN === mode) {
						////	compo_setMetaVal(compo, 'mode', mode_SERVER_ALL);
						////}
						////if (attr['x-mode'] !== void 0) {
						////	mode = attr['x-mode'];
						////	compo_setMetaVal(compo, 'mode', mode);
						////}
						////if (attr['x-mode-model']  !== void 0) {
						////	compo_setMetaVal(compo, 'modeModel', attr['x-mode-model']);
						////}
						////if (compo_isServerMode(this.compo) === false) {
						////	this.ID = this.compo.ID = ++ ctx._id;
						////}
						////if (mode === mode_CLIENT) {
						////	compo.render = fn_doNothing;
						////}
						////
						////compo.attr = attr;
						////compo.parent = ctr;
						////
						////for (var key in attr) {
						////	if (is_Function(attr[key])) {
						////		attr[key] = attr[key]('attr', model, ctx, container, ctr, key);
						////	}
						////}
						////
						////if (is_Function(compo.renderStart)) {
						////	compo.renderStart(model, ctx, container);
						////}
						////
						////builder_pushCompo(ctr, compo);
						////if (compo.async === true) {
						////	var resume = builder_resumeDelegate(
						////		compo
						////		, model
						////		, ctx
						////		, this
						////		, null
						////		, compo.onRenderEndServer
						////	);
						////	compo.await(resume);
						////	return;
						////}
						////
						////compo_wrapOnTagName(compo, node);
						////
						////if (is_Function(compo.render)) 
						////	compo.render(model, ctx, this, compo);
						////
						////this.initModelID(ctx, model);
					},
					
					setComponent: function (compo, model, ctx) {
						this.ID    = compo.ID;
						this.compo = compo;
						this.setModelId_(compo, model, ctx);
					},
					setModelId_: function(compo, model, ctx){
						if (compo_isServerMode(compo)) 
							return;
						
						if (compo.modelRef) {
							var id = ctx._models.tryAppend(compo);
							if (id !== -1){
								this.modelID = id;
							}
							return;
						}
						
						if (compo.model == null || compo.model === model) {
							return;
						}
						
						var id = ctx._models.tryAppend(compo);
						if (id !== -1) {
							this.modelID = id;
						}
					},
					initModelID: function(ctx, parentsModel){
						var compo = this.compo;
						if (compo_isServerMode(compo)) 
							return;
						
						if (compo.modelRef) {
							var id = ctx._models.tryAppend(compo);
							if (id !== -1){
								this.modelID = id;
							}
							return;
						}
						
						if (compo.model == null || compo.model === parentsModel) {
							return;
						}
						
						var id = ctx._models.tryAppend(compo);
						if (id !== -1) {
							this.modelID = id;
						}
					},
					toString: function() {			
						var compo = this.compo;
						if (compo.__cached != null) {
							return compo.__cached;
						}
						
						var meta = compo_getMetaInfo(compo);
						if (meta.mode === mode_CLIENT) {
							var json = {
									mask: mask_stringify(this.node, 0)
								},
								info = {
									type: 'r',
									single: true,
								},
								string = Meta.stringify(json, info);
							if (meta.cache /* unstrict */) {
								compo.__cached = string;
							}
							return string;
						}
						
						var	json = {
								ID: this.ID,
								modelID: this.modelID,						
								compoName: compo.compoName,
								attr: compo.attr,
								expression: compo.expression,
								nodes: _serializeNodes(meta, this),
								scope: _serializeScope(meta, compo)
							},
							info = {
								single: this.firstChild == null,
								type: 't',
								mode: meta.mode
							};
						
						var string = Meta.stringify(json, info);
						
						if (compo.toHtml != null) {
							string += compo.toHtml();
						} else {
							string += _stringifyChildren(this);
						}
						
						if (meta.mode !== mode_CLIENT) {
							string += Meta.close(json, info);
						}
						if (meta.cache) {
							compo.__cached = string;
						}
						return string;
					}
				});
			
			function _stringifyChildren(compoEl) {
				var el  = compoEl.firstChild,
					str = '';
				while (el != null) {
					str += el.toString();
					el = el.nextSibling;
				}
				return str;
			}
			
			function _initController(Mix, node, model, ctx, el, ctr) {
				if (is_Function(Mix)) {
					return new Mix(node, model, ctx, el, ctr);
				}
				if (is_Function(Mix.__Ctor)) {
					return new Mix.__Ctor(node, model, ctx, el, ctr);
				}
				return Mix;
			}
			
			function _serializeNodes(meta, compoEl) {
				var x = meta.serializeNodes;
				if (x == null || x === false)
					return null;
				
				var fn = null;
				if (is_Function(x)) {
					fn = x;
				}
				if (fn == null && is_Function(compoEl.compo.serializeNodes)) {
					fn = compoEl.compo.serializeNodes;
				}
				if (fn == null) {
					fn = mask_stringify;
				}
				
				return fn.call(compoEl.compo, compoEl.node);
			}
			function _serializeScope(meta, compo) {
				if (meta.serializeScope == null) {
					return null;
				}
				
				var scope = compo.scope;
				if (scope == null) {
					return null;
				}
				
				var parent = compo.parent,
					model = compo.model;
				while(model == null && parent != null){
					model = parent.model;
					parent = parent.parent;
				}
				return compo.serializeScope(scope, model);
			}
		}());
		// end:source ./Component.js
		// source ./Util.js
		(function() {
			HtmlDom.UtilNode = class_create({
				nodeType: Dom.UTILNODE,
				nextSibling: null,
				firstChild: null,
				constructor: function(type, name, value, attrName) {
					this.meta = {
						utilType: type,
						utilName: name,
						value: value,
						attrName: attrName,
						current: null
					};
				},
				appendChild: function(el){
					this.firstChild = el;
				},
				toString: function() {
					var json = this.meta,
						info = {
							type: 'u',
							single: this.firstChild == null
						},
						string = Meta.stringify(json, info);
					
					if (this.firstChild == null) 
						return string;
					
					
					return string
						+ this.firstChild.toString()
						+ Meta.close(json, info)
						;
				}
			});
		}());
		// end:source ./Util.js
		// source ./Comment.js
		(function(){
			HtmlDom.Comment =  class_create({
				nextSibling: null,
				parentNode: null,
				textContent: '',
				constructor: function (textContent) {
					var str = textContent;
					if (str == null) {
						return;
					}
					if (_isComment(str)) {
						str = _stripComment(str);
					}
					this.textContent = str.replace('-->', '--&gt;');
				},
				toString: function(){
					if (this.textContent === '') 
						return '';
					
					return '<!--' + this.textContent + '-->';
				}
			});
			
			function _isComment(txt) {
				if (txt.charCodeAt(0) !== 60/*<*/
					&& txt.charCodeAt(1) !== 33/*!*/
					&& txt.charCodeAt(1) !== 45/*-*/
					&& txt.charCodeAt(2) !== 45/*-*/)
					return false;
				
				var l = txt.length;
				if (txt.charCodeAt(--l) !== 62/*>*/
					&& txt.charCodeAt(--l) !== 45/*-*/
					&& txt.charCodeAt(--l) !== 45/*-*/)
					return false;
				
				return true;
			}
			function _stripComment(txt) {
				return txt.slice(4, -3);
			}
			
		}());
		
		// end:source ./Comment.js
		
		// source ./document.js
		document = {
			createDocumentFragment: function(){
				return new HtmlDom.DocumentFragment();
			},
			createElement: function(name){
				return new HtmlDom.Element(name);
			},
			createTextNode: function(text){
				return new HtmlDom.TextNode(text);
			},
			createComment: function(text){
				return new HtmlDom.Comment(text);
			},
			createComponent: function(compo, model, ctx, container, ctr){
				return new HtmlDom.Component(compo, model, ctx, container, ctr);
			}
		};
		// end:source ./document.js
	
	}());
	//#end:source html-dom/
	//#source builder/
	var builder_componentID = 0,
		builder_build,
		builder_Ctx,
		builder_CtxModels,
		builder_CtxModules;
		
	(function() {
		
		// source ctx/CtxModels
		(function(){	
			builder_CtxModels = class_create({
				constructor: function (model, startIndex) {
					this._models = {};
					this._id = startIndex || 0;
					this.append(model);
				},
				append: function(model){
					return add(this, model);
				},
				tryAppend: function(ctr){
					
					if (mode_SERVER_ALL === ctr.mode)
						return -1;
					
					if (mode_model_NONE === ctr.modeModel)
						return -1;
					
					var model = ctr.modelRef != null
						? '$ref:' + ctr.modelRef
						: ctr.model
						;
					return add(this, model);
				},
				
				stringify: function(){
					return stringify(this._models);
				}
			});
			
			// private
			
			function add(modelBuilder, model) {
				if (model == null) 
					return -1;
				
				var id = 'm' + (++modelBuilder._id);
				modelBuilder._models[id] = model;
				return id;
			}
			var stringify;
			(function(){
				stringify = function (models) {
					stringify = typeof Class !== 'undefined' && is_Function(Class.stringify)
						? Class.stringify
						: JSON.stringify
						;
					return stringify(models);
				};
			}())
		}());
		// end:source ctx/CtxModels
		// source ctx/CtxModules
		(function(){	
			builder_CtxModules = class_create({
				constructor: function () {
					this._modules = [];
				},
				add: function(module, owner){
					if (module == null || module.error != null) {
						return;
					}
					this.push(module, owner);
					
					var imports = module.imports,
						imax = imports.length,
						i = -1;
					while ( ++i < imax ) {
						this.add(imports[i].module, module);
					}
				},
				
				push: function(module, owner) {
					var arr = this._modules;
					var i = arr.indexOf(module);
					if (i !== -1) {
						
						if (owner != null) {
							var i_owner = arr.indexOf(owner);
							if (i > i_owner) {
								// move close to parent
								arr.splice(i, 1);
								arr.splice(i_owner, 0, module);
							}
						}
						return;
					}
					arr.unshift(module);
				},
				
				stringify: function(opts){
					var modules = this._modules,
						arr = [],
						imax = modules.length,
						i = -1, x
						;
					while( ++i < imax) {
						x = modules[i];
						if (x.type === 'mask') {
							arr.push(createModuleNode(x));
						}
					}
					return mask_stringify(arr, opts);
				}
			});
			
			function createModuleNode(module) {
				var node = new mask.Dom.Node('module');
				var path = path_toRelative(module.path, path_resolveCurrent());
				if (path_isRelative(path)) {
					path = '/' + path;
				}
				node.attr = {
					path: path
				};
				node.nodes = module.source;
				return node;
			}
		}());
		// end:source ctx/CtxModules
		// source build_component
		var build_component;
		(function(){
			build_component = function(node, model, ctx, container, ctr){
				var compoName = node.compoName || node.tagName,
					Handler   = node.controller || custom_Tags[compoName] || obj_create(node),
					cache     = compo_getMetaInfo(Handler).cache || false;
				
				if (cache /* unstrict */) {
					var compo = Cache.getCompo(model, ctx, compoName, Handler);
					if (compo != null) {
						if (compo.__cached) {
							compo.render = fn_doNothing;
						}
						builder_pushCompo(ctr, compo);
						return compo;
					}
				}
				
				var compo = _initController(Handler, node, model, ctx, container, ctr),
					cache = compo_getMetaInfo(compo).cache;
				if (cache /* unstrict */) {
					Cache.cacheCompo(model, ctx, compoName, compo, cache);
				}
				if (compo.compoName == null) {
					compo.compoName = compoName;
				}
				if (compo.model == null) {
					compo.model = model;
				}
				if (compo.nodes == null) {
					compo.nodes = node.nodes;
				}
				
				var attr = obj_extend(compo.attr, node.attr),
					mode = compo_getMetaVal(ctr, 'mode');
				if (mode_SERVER_ALL === mode || mode_SERVER_CHILDREN === mode) {
					compo_setMetaVal(compo, 'mode', mode_SERVER_ALL);
				}
				if (attr['x-mode'] !== void 0) {
					mode = attr['x-mode'];
					compo_setMetaVal(compo, 'mode', mode);
				}
				if (attr['x-mode-model']  !== void 0) {
					compo_setMetaVal(compo, 'modeModel', attr['x-mode-model']);
				}
				if (compo_isServerMode(compo) === false) {
					compo.ID = ++ ctx._id;
				}
				if (mode === mode_CLIENT) {
					compo.render = fn_doNothing;
				}
				
				compo.attr = attr;
				compo.parent = ctr;
				
				for (var key in attr) {
					if (is_Function(attr[key])) {
						attr[key] = attr[key]('attr', model, ctx, container, ctr, key);
					}
				}
			
				if (is_Function(compo.renderStart)) {
					compo.renderStart(model, ctx, container);
				}
				
				builder_pushCompo(ctr, compo);
				if (compo.async === true) {
					var resume = builder_resumeDelegate(
						compo
						, model
						, ctx
						, container
						, null
						, compo.onRenderEndServer
					);
					compo.await(resume);
					return compo;
				}
		
				compo_wrapOnTagName(compo, node);
		
				if (is_Function(compo.render)) {
					compo.render(model, ctx, container, compo);
				}
				return compo;
			};
			
			function _initController(Mix, node, model, ctx, el, ctr) {
				if (is_Function(Mix)) {
					return new Mix(node, model, ctx, el, ctr);
				}
				if (is_Function(Mix.__Ctor)) {
					return new Mix.__Ctor(node, model, ctx, el, ctr);
				}
				return Mix;
			}
		}());
		// end:source build_component
		
		// source /ref-mask/src/builder/ctx
		(function(){
			
			builder_Ctx = class_create(class_Dfr, {
				constructor: function(data){
					obj_extend(this, data);
				},
				// Is true, if some of the components in a ctx is async
				async: false,
				// List of busy components
				defers: null /*Array*/,
				
				// NodeJS
				// Track components ID
				_id: null,
				// ModelsBuilder for HTML serialization
				_models: null,
				
				// ModulesBuilder fot HTML serialization
				_modules: null,
				
				_redirect: null,
				_rewrite: null
			});
		}());
		// end:source /ref-mask/src/builder/ctx
		// source /ref-mask/src/builder/util
		var builder_resumeDelegate,
			builder_pushCompo;
			
		(function(){
		
			builder_resumeDelegate = function (ctr, model, ctx, container, children, finilizeFn){
				var anchor = document.createComment('');		
				container.appendChild(anchor);
				return function(){
					return _resume(ctr, model, ctx, anchor, children, finilizeFn);
				};
			};
			builder_pushCompo = function (ctr, compo) {
				var compos = ctr.components;
				if (compos == null) {
					ctr.components = [ compo ];
					return;
				}
				compos.push(compo);
			};
			
			// == private
			
			function _resume(ctr, model, ctx, anchorEl, children, finilize) {
				
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
					
					anchorEl.parentNode.insertBefore(fragment, anchorEl);
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
							attrFn(anchorEl, ctr.attr[key], model, ctx, elements[0], ctr);
						}
					}
				}
				
				if (is_Function(finilize)) {
					finilize.call(
						ctr
						, elements
						, model
						, ctx
						, anchorEl.parentNode
					);
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
			
		}());
		// end:source /ref-mask/src/builder/util
		// source /ref-mask/src/builder/build_node
		var build_node;
		(function(){
			build_node = function build_node(node, model, ctx, container, ctr, children){
				
				var tagName = node.tagName,
					attr = node.attr;
				
				var el = el_create(tagName);
				if (el == null) 
					return;
				
				if (children != null){
					children.push(el);
					attr['x-compo-id'] = ctr.ID;
				}
				
				// ++ insert el into container before setting attributes, so that in any
				// custom util parentNode is available. This is for mask.node important
				// http://jsperf.com/setattribute-before-after-dom-insertion/2
				if (container != null) {
					container.appendChild(el);
				}
				
				var key, mix, val, fn;
				for(key in attr) {
					mix = attr[key];
					if (is_Function(mix)) {
						var result = mix('attr', model, ctx, el, ctr, key);
						if (result == null) {
							continue;
						}
						if (typeof result === 'string') {
							val = result;
						} else if (is_ArrayLike(result)){
							if (result.length === 0) {
								continue;
							}
							val = result.join('');
						} else {
							val = result;
						}
					} else {
						val = mix;
					}
					
					if (val != null && val !== '') {
						fn = custom_Attributes[key];
						if (fn != null) {
							fn(node, val, model, ctx, el, ctr, container);
						} else {
							el.setAttribute(key, val);
						}
					}
				}
				return el;
			};
			
			var el_create;
			(function(doc){
				el_create = function(name){			
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
		}());
		// end:source /ref-mask/src/builder/build_node
		// source /ref-mask/src/builder/build_textNode
		var build_textNode;
		(function(){	
			build_textNode = function build_textNode(node, model, ctx, el, ctr) {
				
				var content = node.content;
				if (is_Function(content)) {		
					var result = content(
						'node', model, ctx, el, ctr
					);
					if (typeof result === 'string') {
						append_textNode(el, result);
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
								append_textNode(el, text);
								text = '';
							}
							if (x.nodeType == null) {
								text += x.toString();
								continue;
							}
							el.appendChild(x);
							continue;
						}	
						text += x;
					}			
					if (text !== '') {
						append_textNode(el, text);
					}
					return;
				}
				append_textNode(el, content);
			};
			
			var append_textNode;
			(function(doc){
				append_textNode = function(el, text){
					el.appendChild(doc.createTextNode(text));
				};
			}(document));
		}());
		// end:source /ref-mask/src/builder/build_textNode
		
		// source build
		(function(){	
			builder_build = function(template, model, ctx, container, ctr, children){
				if (container == null) {
					container = document.createDocumentFragment();
				}
				if (ctr == null) {
					ctr = new Dom.Component();
				}
				if (ctx == null) {
					ctx = new builder_Ctx;
				}
				if (ctx._models == null) {
					ctx._models = new builder_CtxModels(model, Cache.modelID);
				}
				if (ctx._modules == null) {
					ctx._modules = new builder_CtxModules();
				}
				if (ctx._id == null) {
					ctx._id = Cache.controllerID;
				}
				return build(template, model, ctx, container, ctr, children);
			};
			
			function build (node, model, ctx, container, ctr, children) {
				if (node == null) {
					return container;
				}
				if (ctx._redirect != null || ctx._rewrite != null) {
					return container;
				}
				var type = node_getType(node),
					element,
					elements,
					j, jmax, key, value;
		
				// Dom.SET
				if (type === 10) {
					var imax = node.length,
						i;
					for(i = 0; i < imax; i++) {
						build(node[i], model, ctx, container, ctr);
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
							log_error('<mask: statement is undefined', tagName);
							return container;
						}
						
					}
					if (type === 15) {
						Handler.render(node, model, ctx, container, ctr, children);
						return container;
					}
				}
				
				// Dom.NODE
				if (type === 1) {
					if (tagName.charCodeAt(0) === 58) {
						// :
						type = 4;
						node.mode = mode_CLIENT;
						node.controller = mock_TagHandler.create(tagName, null, mode_CLIENT);
					} else {
						container = build_node(node, model, ctx, container, ctr, children);
						children = null;
					}
				}
		
				// Dom.TEXTNODE
				if (type === 2) {
					build_textNode(node, model, ctx, container, ctr);
					return container;
				}
		
				// Dom.COMPONENT
				if (type === 4) {
					element = document.createComponent(node, model, ctx, container, ctr);
					container.appendChild(element);
					container = element;
					
					var compo = build_component(node, model, ctx, element, ctr);
					if (compo != null) {
						element.setComponent(compo, model, ctx);
		
						if (compo.async) {
							return element;
						}
						if (compo.render) {
							return element;
						}
						if (compo.model && compo.model !== model) {
							model = compo.model;
						}
						
						ctr = compo;
						node = compo;
						// collect childElements for the component
						elements = [];
					}
				}
		
				buildChildNodes(node, model, ctx, container, ctr, elements);
				
				if (container.nodeType === Dom.COMPONENT) {
					var fn = ctr.onRenderEndServer;
					if (fn != null && ctr.async !== true) {
						fn.call(ctr, elements, model, ctx, container, ctr);
					}
				}
				
				arr_pushMany(children, elements);
				return container;
			};
			
			function buildChildNodes (node, model, ctx, container, ctr, els) {
				var nodes = node.nodes;
				if (nodes == null) 
					return;
				
				if (is_ArrayLike(nodes) === false) {
					build(nodes, model, ctx, container, ctr, els);
					return;
				}
				
				var imax = nodes.length,
					i;
				for(i = 0; i< imax; i++){
					build(nodes[i], model, ctx, container, ctr, els);
				}
			};	
		}());
		// end:source build
	}());
	
	//#end:source builder/

	/*** Features ***/	
	// source /ref-mask/src/feature/
	// source run
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
				found = false,
				ready = false,
				await = 0;
				
			imax = scripts.length;
			i = -1;
			while( ++i < imax ){
				script = scripts[i];
				if (script.getAttribute('type') !== 'text/mask') 
					continue;
				if (script.getAttribute('data-run') !== 'true') 
					continue;
				
				found = true;
				var ctx = new builder_Ctx;
				var fragment = builder_build(
					parser_parse(script.textContent), model, ctx, null, ctr
				);
				if (ctx.async === true) {
					await++;
					ctx.done(insertDelegate(fragment, script, resumer));
					continue;
				}
				script.parentNode.insertBefore(fragment, script);
			}
			ready = true;
			if (found === false) {
				log_warn("No blocks found: <script type='text/mask' data-run='true'>...</script>");
			}
			if (await === 0) {
				flush();
			}
			function resumer(){
				if (--await === 0 && ready)
					flush();
			}
			function flush() {
				if (is_Function(ctr.renderEnd)) {
					ctr.renderEnd(container, model);
				}
				Compo.signal.emitIn(ctr, 'domInsert');
			}
			
			return ctr;
		};
		function insertDelegate(fragment, script, done) {
			return function(){
				script.parentNode.insertBefore(fragment, script);
				done();
			};
		}
	}());
	// end:source run
	// source merge
	var mask_merge;
	(function(){
		
		mask_merge = function(a, b, owner, opts){
			if (typeof a === 'string') 
				a = parser_parse(a);
			if (typeof b === 'string') 
				b = parser_parse(b);
			
			var placeholders = _resolvePlaceholders(b, b, new Placeholders(null, b, opts));
			return _merge(a, placeholders, owner);
		};
		
		var tag_ELSE = '@else',
			tag_IF   = '@if',
			tag_EACH = '@each',
			tag_PLACEHOLDER = '@placeholder',
			
			dom_NODE      = Dom.NODE,
			dom_TEXTNODE  = Dom.TEXTNODE,
			dom_FRAGMENT  = Dom.FRAGMENT,
			dom_STATEMENT = Dom.STATEMENT,
			dom_COMPONENT = Dom.COMPONENT
			;
		
		function _merge(node, placeholders, tmplNode, clonedParent){
			if (node == null) 
				return null;
			
			var fn;
			if (is_Array(node)) {
				fn = _mergeArray;
			} else {
				switch(node.type){
					case dom_TEXTNODE:
						fn = _cloneTextNode;
						break;
					case dom_NODE:
					case dom_STATEMENT:
						fn = _mergeNode;
						break;
					case dom_FRAGMENT:
						fn = _mergeFragment;
						break;
					case dom_COMPONENT:
						fn = _mergeComponent;
						break;
				}
			}
			if (fn !== void 0) {
				return fn(node, placeholders, tmplNode, clonedParent);
			}
			log_warn('Uknown type', node.type);
			return null;
		}
		function _mergeArray(nodes, placeholders, tmplNode, clonedParent){
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
					
					if (node.expression && !eval_(node.expression, placeholders, tmplNode)) 
						continue;
					
					x = _merge(nodes[i].nodes, placeholders, tmplNode, clonedParent)
				}
				else {
					x = _merge(node, placeholders, tmplNode, clonedParent);
				}
				
				appendAny(fragment, x);
			}
			return fragment;
		}
		function _mergeFragment(frag, placeholders, tmplNode, clonedParent) {
			var fragment = new Dom.Fragment;
			fragment.parent = clonedParent;
			fragment.nodes = _mergeArray(frag.nodes, placeholders, tmplNode, fragment);
			return fragment;
		}
		function _mergeComponent(node, placeholders, tmplNode, clonedParent) {
			if (node.nodes == null) 
				return node;
			
			var cloned = new Dom.Component;
			obj_extend(cloned, node);
			cloned.nodes = _merge(cloned.nodes, placeholders, tmplNode, clonedParent);
			return cloned;
		}
		function _mergeNode(node, placeholders, tmplNode, clonedParent){
			var tagName = node.tagName;
			if (tagName.charCodeAt(0) !== 64) {
				// @
				return _cloneNode(node, placeholders, tmplNode, clonedParent);
			}
			
			var id = node.attr.id;
			if (tagName === tag_PLACEHOLDER && id == null) {
				if (tmplNode != null) {
					var tagName_ = tmplNode.tagName;
					if (tagName_ != null && tmplNode.tagName.charCodeAt(0) === 64 /*@*/) {
						return tmplNode.nodes
					}
				}
				id = '$root';
			}
			
			if (tag_EACH === tagName) {
				var arr = placeholders.$getNode(node.expression),
					x;
				if (arr == null) {
					if (node.attr.optional == null) {
						error_withNode('No template node: @' + node.expression, node);
					}
					return null;
				}
				if (is_Array(arr) === false) {
					x = arr;
					return _merge(
						node.nodes
						, _resolvePlaceholders(x.nodes, x.nodes, new Placeholders(placeholders))
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
						, _resolvePlaceholders(x.nodes, x.nodes, new Placeholders(placeholders))
						, x
						, clonedParent
					));
				}
				return fragment;
			}
			if (tag_IF === tagName) {
				var val = eval_(node.expression, placeholders, tmplNode);
				return val
					? _merge(node.nodes, placeholders, tmplNode, clonedParent)
					: null
					;
			}
			
			if (id == null) 
				id = tagName.substring(1);
			
			var content = placeholders.$getNode(id, node.expression);
			if (content == null) {
				if (placeholders.opts.extending === true) {
					return node;
				}
				return null;
			}
			
			if (content.parent) 
				_modifyParents(clonedParent, content.parent);
			
			
			var contentNodes = content.nodes,
				wrapperNode;
			if (node.attr.as !== void 0) {
				var tagName_ = node.attr.as;
				wrapperNode = {
					type: dom_NODE,
					tagName: tagName_,
					attr: _mergeAttr(node.attr, content.attr, placeholders, tmplNode),
					parent: clonedParent,
					nodes: contentNodes
				};
				wrapperNode.attr.as = null;
			}
			
			if (node.nodes == null) {
				return _merge((wrapperNode || contentNodes), placeholders, tmplNode, clonedParent);
			}
			
			var nodes =  _merge(
				node.nodes
				, _resolvePlaceholders(contentNodes, contentNodes, new Placeholders(placeholders))
				, content
				, wrapperNode || clonedParent
			);
			if (wrapperNode != null) {
				wrapperNode.nodes = nodes;
				return wrapperNode;
			}
			return nodes;
		}
		function _mergeAttr(a, b, placeholders, tmplNode){
			if (a == null || b == null) 
				return a || b;
			
			var out = interpolate_obj_(a, placeholders, tmplNode);
			for (var key in b){
				out[key] = interpolate_str_(b[key], placeholders, tmplNode);
			}
			return out;
		}
		
		function _cloneNode(node, placeholders, tmplNode, clonedParent){
			var tagName = node.tagName || node.compoName;
			switch (tagName) {
				case ':template':
					var id = interpolate_str_(node.attr.id, placeholders, tmplNode);
					Mask.templates.register(id, node.nodes);
					return null;
				case ':import':
					var id = interpolate_str_(node.attr.id, placeholders, tmplNode),
						nodes = Mask.templates.resolve(node, id);
					return _merge(nodes, placeholders, tmplNode, clonedParent);
				case 'define':
				case 'function':
				case 'var':
				case 'import':
				case 'script':
				case 'style':
				case 'slot':
				case 'event':
					return node;
				case 'include':
					var tagName = node.attr.id;
					if (tagName == null) {
						// get the first key
						for (var key in node.attr) {
							tagName = key;
							break;
						}
					}
					tagName = interpolate_str_(tagName, placeholders, tmplNode);
					
					var handler = customTag_get(tagName, tmplNode);
					if (handler !== null) {
						var proto = handler.prototype;
						var tmpl  = proto.template || proto.nodes;
						
						placeholders = _resolvePlaceholders(
							node.nodes,
							node.nodes,
							new Placeholders(placeholders, node.nodes)
						);
						return _merge(tmpl, placeholders, tmplNode, clonedParent);
					}
					break;
				default:
					var handler = customTag_get(tagName, tmplNode);
					if (handler !== null) {
						var proto = handler.prototype;
						if (proto && proto.meta != null && proto.meta.template === 'merge') {
							return node;
						}
					}
					break;
			}
			
			var outnode = {
				type: node.type,
				tagName: tagName,
				attr: interpolate_obj_(node.attr, placeholders, tmplNode),
				expression: interpolate_str_(node.expression, placeholders, tmplNode),
				controller: node.controller,
				parent: clonedParent,
				nodes: null
			};
			if (node.nodes) 
				outnode.nodes = _merge(node.nodes, placeholders, tmplNode, outnode);
			
			return outnode;
		}
		function _cloneTextNode(node, placeholders, tmplNode, clonedParent){
			return {
				type: node.type,
				content: interpolate_str_(node.content, placeholders, tmplNode),
				parent: clonedParent
			};
		}
		function interpolate_obj_(obj, placeholders, node){
			var clone = _Object_create(obj),
				x;
			for(var key in clone){
				x = clone[key];
				if (x == null) 
					continue;
				
				clone[key] = interpolate_str_(x, placeholders, node);
			}
			return clone;
		}
		function interpolate_str_(mix, placeholders, node){
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
					x = fn(expr, placeholders, node);
						
				if (x != null) {
					result += x;
				}
				else if (placeholders.opts.extending === true) {
					result += isBlockEntry ? ('@[' + expr + ']') : expr
				}
				
				// tail
				last = isBlockEntry ? (index + 1) : index;
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
		function interpolate_(path, placeholders, node) {
			var index = path.indexOf('.');
			if (index === -1) {
				log_warn('Merge templates. Accessing node', path);
				return null;
			}
			var tagName = path.substring(0, index),
				id = tagName.substring(1),
				property = path.substring(index + 1),
				obj = null;
			
			if (node != null) {
				if (tagName === '@attr') {
					return interpolate_getAttr_(node, placeholders, property);
				}
				else if (tagName === '@counter') {
					return interpolate_getCounter_(property);
				}
				else if (tagName === node.tagName) 
					obj = node;
			}
			
			if (obj == null) 
				obj = placeholders.$getNode(id);
			
			if (obj == null) {
				//- log_error('Merge templates. Node not found', tagName);
				return null;
			}
			return obj_getProperty(obj, property);
		}
		
		function interpolate_getAttr_(node, placeholders, prop) {
			var x = node.attr && node.attr[prop];
			var el = placeholders;
			while (x == null && el != null) {
				x = el.attr && el.attr[prop];
				el = el.parent;
			}
			return x;
		}
		
		var interpolate_getCounter_;
		(function(){
			var _counters = {};
			interpolate_getCounter_ = function(prop) {
				var i = _counters[prop] || 0;
				return (_counters[prop] = ++i);
			};
		}());
		
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
		function _resolvePlaceholders(b, node, placeholders) {
			if (node == null) 
				return placeholders;
			
			if (is_Array(node)) {
				var imax = node.length,
					i = -1;
				while( ++i < imax ){
					_resolvePlaceholders(node === b ? node[i] : b, node[i], placeholders);
				}
				return placeholders;
			}
			
			var type = node.type;
			if (type === dom_TEXTNODE) 
				return placeholders;
			
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
					if (placeholders[id] == null) {
						placeholders[id] = x;
					} else {
						var current = placeholders[id];
						if (is_Array(current)) {
							current.push(x);
						}
						else {
							placeholders[id] = [current, x];
						}
					}
					return placeholders;
				}
			}
			return _resolvePlaceholders(b, node.nodes, placeholders);
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
		
		function eval_(expr, placeholders, tmplNode) {
			if (tmplNode != null) {
				placeholders.attr = tmplNode.attr;
			}
			return expression_eval(expr, placeholders, null, placeholders);
		}
		function Placeholders(parent, nodes, opts){
			var $root = null;
			if (nodes != null) {
				$root = new Dom.Node(tag_PLACEHOLDER);
				$root.nodes = nodes;
			}
			this.scope = this;
			this.parent = parent;
			this.$root = $root || (parent && parent.$root);
			
			if (opts != null) {
				this.opts = opts;
			}
			else if (parent != null) {
				this.opts = parent.opts;
			}
		}
		Placeholders.prototype = {
			opts: {
				extending: false
			},
			parent: null,
			attr: null,
			scope: null,
			$root: null,
			$getNode: function(id, filter){
				var ctx = this, node;
				while(ctx != null){
					node = ctx[id];
					if (node != null) 
						break;
					ctx = ctx.parent;
				}
				if (filter != null && node != null) {
					node = {
						nodes: jmask(node.nodes).filter(filter)
					};
				}
				return node;
			}
		};
		
	}());
	// end:source merge
	// source optimize
	var mask_optimize;
	(function(){
		
		mask_optimize = function (dom, done) {
			mask_TreeWalker.walkAsync(
				dom
				, function (node, next) {
					var fn = getOptimizer(node);
					if (fn != null) {
						fn(node, next);
						return;
					}
					next();
				}
				, done
			);
		};
		
		function getOptimizer(node) {
			if (node.type !== Dom.NODE) 
				return null;
			
			return custom_Optimizers[node.tagName];
		}
	}());
	// end:source optimize
	// source modules/
	var Module;
	(function(){
		Module = {};
		var _cache = {},
			_extensions_script = ' js es6 test coffee ',
			_extensions_style  = ' css sass scss less ',
			_extensions_data   = ' json ',
			_base;
		
		// source utils
		var u_resolveLocation,
			u_resolvePath,
			u_handler_getDelegate;
			
		(function(){
		
			u_resolveLocation = function(ctx, ctr, module) {
				if (module != null) {
					return module.location;
				}	
				while(ctr != null) {
					if (ctr.location != null) {
						return ctr.location;
					}
					if (ctr.resource != null && ctr.resource.location) {
						return ctr.resource.location;
					}
					ctr = ctr.parent;
				}
				var path = null;
				if (ctx != null) {
					if (ctx.filename != null) {
						path = path_getDir(path_normalize(ctx.filename));
					}
					if (ctx.dirname != null) {
						path = path_normalize(ctx.dirname + '/');
					}
				}
				
				if (_base == null) {
					_base = path_resolveCurrent();
				}
				
				if (path != null) {
					if (path_isRelative(path) === false) {
						return path;
					}
					return path_combine(_base, path);
				}
				return _base;
			};
			
			u_resolvePath = function(path, ctx, ctr, module){
				if ('' === path_getExtension(path)) {
					path += '.mask';
				}
				if (path_isRelative(path) === false) {
					return path;
				}
				return path_normalize(path_combine(
					u_resolveLocation(ctx, ctr, module), path
				));
			};
			
			u_handler_getDelegate = function(compoName, compo, next) {
				return function(name) {
					if (name === compoName) 
						return compo;
					if (next != null) 
						return next(name);
					
					return null;
				};
			};
			
			
		}());
		
		// end:source utils
	
		// source Import/Import
		var IImport = class_create({
			type: null,
			constructor: function(path, alias, exports, module){
				this.path = path;
				this.alias = alias;
				this.exports = exports;
				this.module = Module.createModule(path, module);
				this.parent = module;
			},
			eachExport: function(fn){
				var alias = this.alias;
				if (alias != null) {
					fn.call(this, alias, '*', alias);
					return;
				}
				var exports = this.exports
				if (exports != null) {
					var imax = exports.length,
						i = -1;
					while(++i < imax) {
						var x = exports[i];
						fn.call(
							this
							, x.alias == null ? x.name : x.alias
							, x.name
							, x.alias
						);
					}
				}
			},
			
			getOriginal: function(alias){
				if (this.alias === alias) {
					return '*';
				}
				var exports = this.exports;
				if (exports != null) {
					var imax = exports.length,
						i = -1, x;
					while(++i < imax) {
						x = exports[i];
						if ((x.alias || x.name) === alias) {
							return x.name;
						}
					}
				}
				return null;
			},
			
			loadImport: function(cb){
				var self = this;
				this
					.module
					.loadModule()
					.fail(cb)
					.done(function(module){
						cb(null, self);
					});
			},
			
			registerScope: null,
			
			logError_: function(msg){
				var str = '\n(Module) ' + (this.parent || {path: 'root'}).path
				str += '\n  (Import) ' + this.path
				str += '\n    ' + msg;
				log_error(str);
			}
		});
		
		
		(function(){
			IImport.create = function(path, alias, exports, parent){
				return new (Factory(path))(path, alias, exports, parent);
			};
			function Factory(path) {
				var ext = path_getExtension(path);
				if (ext === 'mask') {
					return ImportMask;
				}
				if (ext === 'html') {
					return ImportHtml;
				}
				var search = ' ' + ext + ' ';
				if (_extensions_style.indexOf(search) !== -1) {
					return ImportStyle;
				}
				if (_extensions_data.indexOf(search)  !== -1) {
					return ImportData;
				}
				// assume script, as anything else is not supported yet
				return ImportScript;
			}
		}());
		// end:source Import/Import
		// source Import/ImportMask
		var ImportMask = class_create(IImport, {
			type: 'mask',
			constructor: function(){
				this.eachExport(function(compoName){
					if (compoName !== '*') 
						customTag_registerResolver(compoName);
				});
			},
			getHandler: function(name){
				var module = this.module;
				if (module == null || module.error != null) {
					return;
				}
				var orig = this.getOriginal(name);
				if (orig == null) {
					return null;
				}
				return module.exports[orig] || module.queryHandler(orig);
			},
		});
		// end:source Import/ImportMask
		// source Import/ImportScript
		var ImportScript = class_create(IImport, {
			type: 'script',
			registerScope: function(owner){
				this.eachExport(function(exportName, name, alias){
					var obj = this.module.register(owner, name, alias);
					if (obj == null) {
						this.logError_('Exported property is undefined: ' + name);
					}
				});
			}
		});
		// end:source Import/ImportScript
		// source Import/ImportStyle
		var ImportStyle = class_create(IImport, {
			type: 'style'
		});
		// end:source Import/ImportStyle
		// source Import/ImportData
		var ImportData = class_create(ImportScript, {
			type: 'data'
		});
		// end:source Import/ImportData
		// source Import/ImportHtml
		var ImportHtml = class_create(ImportMask, {
			type: 'mask'
		});
		// end:source Import/ImportHtml
		
		// source Module/Module
		var IModule = class_create(class_Dfr, {
			type: null,
			path: null,
			location: null,
			exports: null,
			state: 0,
			constructor: function(path, parent) {
				this.path = path;
				this.parent = parent;
				this.exports = {};
				this.location = path_getDir(path);
			},
			loadModule: function(){
				if (this.state !== 0) 
					return this;
				
				this.state = 1;
				var self = this;
				this
					.load_(this.path)
					.fail(function(err){
						self.onLoadError_(err);
					})
					.done(function(mix){
						self.onLoadSuccess_(mix);
					});
				return this;
			},
			complete_: function(error, exports){
				this.exports = exports;
				this.error = error;
				this.state = 4;
				if (error) {
					this.reject(error);
					return;
				}
				this.resolve(this);
			},
			onLoadSuccess_: function(mix){
				if (this.preprocess_ == null) {
					this.complete_(null, mix);
					return;
				}
				this.preprocess_(mix, this.complete_);
			},
			onLoadError_: function(error){
				if (this.preprocessError_ == null) {
					this.complete_(error);
					return;
				}
				this.preprocessError_(error, this.complete_);
			},
			load_: null,
			preprocess_: null,
			preprocessError_: null,
			register: fn_doNothing,
		});
		
		(function(){
			IModule.create = function(path, parent){
				return new (Factory(path))(path, parent);
			};
			function Factory(path) {
				var ext = path_getExtension(path);
				if (ext === 'mask') {
					return ModuleMask;
				}
				var search = ' ' + ext + ' ';
				if (_extensions_style.indexOf(search) !== -1) {
					return ModuleStyle;
				}
				if (_extensions_data.indexOf(search)  !== -1) {
					return ModuleData;
				}
				if (ext === 'html') {
					return ModuleHtml;
				}
				// assume script, as anything else is not supported yet
				return ModuleScript;
			}
		}());
		
		// end:source Module/Module
		// source Module/ModuleMask
		var ModuleMask;
		(function(){
			ModuleMask = class_create(IModule, {
				type: 'mask',
				scope: null,
				source: null,
				modules: null,
				exports: null,
				imports: null,
				
				load_: function(path){
					return (__cfg.getFile || file_get)(path);
				},
				preprocessError_: function(error, next) {
					var msg = 'Load error: ' + this.path;
					if (error && error.status) {
						msg += '; Status: ' + error.status;
					}
		
					this.source = reporter_createErrorNode(msg);
					next.call(this, error);
				},
				preprocess_: function(mix, next) {
					var ast = typeof mix === 'string'
						? parser_parse(mix)
						: mix
						;
					
					this.scope = {};
					this.source = ast;
					this.imports = [];
					this.exports = {
						'__nodes__': [],
						'__handlers__': {}
					};
					
					var arr  = _nodesToArray(ast),
						imax = arr.length,
						i = -1,
						x;
					while( ++i < imax ){
						x = arr[i];
						switch (x.tagName) {
							case 'import':
								this.imports.push(Module.createImport(
									x, null, null, this
								));
								break;
							case 'module':
								Module.registerModule(
									x.nodes, u_resolvePath(x.attr.path, null, null, this)
								);
								break;
							case 'define':
							case 'let':
								continue;
							default:
								this.exports.__nodes__.push(x);
								break;
						}
					}
					
					_loadImports(this.imports, function(){
						next.call(this, null, _createExports(arr, null, this));
					}, this);
				},
				
				getHandler: function(name){
					return _module_getHandler.call(this, this, name);
				},
				queryHandler: function(selector) {
					if (this.error) {
						return _createHandlerForNodes(this.source, this);
					}
					
					var nodes = this.exports.__nodes__;
					if (selector !== '*') {
						nodes = _nodesFilter(nodes, selector);
					}
					return nodes != null && nodes.length !== 0
						? _createHandlerForNodes(nodes, this)
						: null
						;
				},
			});
			
			// Also flattern all `imports` tags
			function _nodesToArray (mix) {
				var type = mix.type;
				if (type === Dom.NODE && mix.tagName === 'imports') {
					return mix.nodes;
				}
				if (type !== Dom.FRAGMENT && type != null) {
					return [ mix ];
				}
				var arr = mix;
				if (type === Dom.FRAGMENT) {
					arr = mix.nodes;
				}
				var imax = arr.length,
					i = -1, x;
				while ( ++i < imax ){
					x = arr[i];
					if (x.tagName === 'imports') {
						arr.splice.apply(arr, [i, 1].concat(x.nodes));
						i--;
					}
				}
				
				return arr;
			}
			function _nodesFilter(nodes, tagName) {
				var arr = [],
					imax = nodes.length,
					i = -1, x;
				while ( ++i < imax ) {
					x = nodes[i];
					if (x.tagName === tagName) {
						arr.push(x);
					}
				}
				return arr;
			}
			function _createExports(nodes, model, module) {
				var exports = module.exports,
					imports = module.imports,
					scope   = module.scope,
					getHandler = _module_getHandlerDelegate(module);
				
				var i = -1,
					imax = imports.length;
				while ( ++i < imax ) {
					var x = imports[i];
					if (x.registerScope) {
						x.registerScope(module);
					}
				}
				
				var i = -1,
					imax = nodes.length;
				while ( ++i < imax ) {
					var node = nodes[i];
					var name = node.tagName;
					if (name === 'define' || name === 'let') {
						var Ctor = Define.create(node, model, module);
						obj_extend(Ctor.prototype, {
							getHandler: getHandler,
							location: module.location,
							scope: scope
						});
						if (name === 'define') {
							exports[node.name] = Ctor;
						}
						exports.__handlers__[node.name] = Ctor;
					}
				}
				exports['*'] = class_create(customTag_Base, {
					getHandler: getHandler,
					location: module.location,
					nodes: exports.__nodes__,
					scope: scope
				});
				
				return exports;
			}
			function _createHandlerForNodes(nodes, module) {
				return class_create({
					scope: module.scope,
					location: module.location,
					nodes: nodes,
					getHandler: _module_getHandlerDelegate(module)
				});
			}
			
			function _loadImports(imports, done, module) {
				var count = imports.length;
				if (count === 0) {
					return done.call(module);
				}
				var imax = count,
					i = -1;
				while( ++i < imax ) {
					imports[i].loadImport(await);
				}
				
				function await(){
					if (--count > 0) 
						return;
					done.call(module);
				}
			}
			function _module_getHandlerDelegate(module) {
				return function(name) {
					return _module_getHandler.call(this, module, name);
				};
			}
			function _module_getHandler(module, name) {
				var Ctor = module.exports[name];
				if (Ctor != null) {
					return Ctor;
				}
				
				// check internal components store
				var handlers = this.__handlers__;
				if (handlers != null && (Ctor = handlers[name]) != null) {
					return Ctor;
				}
				
				var arr = module.imports,
					i = arr.length,
					x, type;
				while( --i > -1) {
					x = arr[i];
					type = x.type;
					if (type === 'mask' && (Ctor = x.getHandler(name)) != null) {
						return Ctor;
					}
				}
				return null;
			}
		}());
		
		// end:source Module/ModuleMask
		// source Module/ModuleScript
		var ModuleScript = class_create(IModule, {
			type: 'script',
			
			load_: function(path){
				var fn = __cfg.getScript || file_getScript;
				return fn(path);
			},
			getExport_: function(property) {
				var obj = this.exports;
				return property !== '*'
					? obj_getProperty(obj, property)
					: obj
					;
			},
			
			register: function(ctr, name, alias) {
				var prop = alias || name;
				var obj = this.getExport_(name);
				if (obj == null) {
					return null;
				}
				if (ctr.scope == null) {
					ctr.scope = {};
				}
				obj_setProperty(ctr.scope, prop, obj);
				return obj;
			},
			
		});
		// end:source Module/ModuleScript
		// source Module/ModuleStyle
		var ModuleStyle = class_create(IModule, {
			type: 'style',
			
			load_: function(path){
				var fn = __cfg.getStyle || file_getStyle;
				return fn(path);
			}
		});
		// end:source Module/ModuleStyle
		// source Module/ModuleData
		var ModuleData = class_create(ModuleScript, {
			type: 'data',
			
			load_: function(path){
				var fn = __cfg.getData || file_getJson;
				return fn(path);
			}	
		});
		// end:source Module/ModuleData
		// source Module/ModuleHtml
		var ModuleHtml;
		(function(){
			ModuleHtml = class_create(ModuleMask, {
				type: 'mask',
				preprocess_: function(mix, next) {
					var ast = typeof mix === 'string'
						? parser_parseHtml(mix)
						: mix
						;
					return ModuleMask
						.prototype
						.preprocess_
						.call(this, ast, next);
				}
			});
		}());
		// end:source Module/ModuleHtml
		
		// source components
		(function() {
			var IMPORT  = 'import',
				IMPORTS = 'imports';
				
			custom_Tags['module'] = class_create({
				constructor: function(node, model, ctx, container, ctr) {
					var path  = path_resolveUrl(node.attr.path, u_resolveLocation(ctx, ctr));
					Module.registerModule(node.nodes, path, ctx, ctr);
				},
				render: fn_doNothing
			});
			custom_Tags['import:base'] = function(node, model, ctx, el, ctr){
				var base = path_normalize(expression_eval(node.expression, model, ctx, ctr));
				if (base != null && base[base.length - 1] !== '/') {
					base += '/';
				}
				Module.cfg('base', base);
			};
			custom_Tags[IMPORT] = class_create({
				meta: {
					serializeNodes: true
				},
				constructor: function(node, model, ctx, el, ctr) {
					if (node.alias == null && node.exports == null && Module.isMask(node.path)) {
						// embedding
						this.module = Module.createModule(node.path, ctx, ctr);
					}
				},
				renderStart: function(model, ctx){
					if (this.module == null) {
						return;
					}
					var resume = Compo.pause(this, ctx);
					var self   = this;
					this
						.module
						.loadModule()
						.always(function(){
							self.scope = self.module.scope;
							self.nodes = self.module.source;
							self.getHandler = self.module.getHandler.bind(self.module);
							resume();
						});
				}
			});
			
			custom_Tags[IMPORTS] = class_create({
				imports_: null,
				load_: function(ctx, cb){
					var arr = this.imports_,
						self = this,
						imax = arr.length,
						await = imax,
						i = -1, x;
					
					function done(error, import_) {
						if (error == null) {
							if (import_.registerScope) {
								import_.registerScope(self);
							}
							if (ctx._modules != null) {
								ctx._modules.add(import_.module);
							}
						}
						if (--await === 0) {
							cb();
						}
					}
					while( ++i < imax ){
						x = arr[i];
						x.loadImport(done);
					}
				},
				start_: function(model, ctx){
					var resume = Compo.pause(this, ctx),
						nodes = this.nodes,
						imax = nodes.length,
						i = -1
						;
					var arr = this.imports_ = [];
					while( ++i < imax ){
						if (nodes[i].tagName === IMPORT) {
							arr.push(Module.createImport(nodes[i], ctx, this));
						}
					}
					this.load_(ctx, resume);
				},
				meta: {
					serializeNodes: true
				},
				renderStart: function(model, ctx){
					this.start_(model, ctx);
				},
				renderStartClient: function(model, ctx){
					this.start_(model, ctx);
				},
				serializeNodes: function(){
					// NodeJS
					var arr = [],
						i = this.nodes.length, x;
					while( --i > -1 ){
						x = this.nodes[i];
						if (x.tagName === IMPORT) {
							arr.push(x);
						}
					}
					return mask_stringify(arr);
				},
				
				getHandler: function(name){
					var arr = this.imports_,
						imax = arr.length,
						i = -1, import_, x;
					while ( ++i < imax ){
						import_ = arr[i];
						if (import_.type !== 'mask') {
							continue;
						}
						x = import_.getHandler(name);
						if (x != null) {
							return x;
						}
					}
					return null;
				},
				getHandlers: function(){
					var handlers = {};
					var arr = this.imports_,
						imax = arr.length,
						i = -1, import_, x;
					while ( ++i < imax ){
						import_ = arr[i];
						if (import_ !== 'mask') {
							continue;
						}
						x = import_.getHandlers();
						obj_extend(handlers, x);
					}
					return handlers;
				},
			});
		
			
		}());
		
		// end:source components
		// source tools/dependencies
		var tools_getDependencies;
		(function() {
				
			tools_getDependencies = function(template, path, opts_){
				
				var opts = obj_extendDefaults(opts_, defaultOptions);
				var dfr = new class_Dfr;
				var ast = typeof template === 'string'
					? parser_parse(template)
					: template
					;
				
				return get(ast, path, opts, dfr);
			};
			
			
			var defaultOptions = {
				deep: true,
				flattern: false
			};
			
			function get(ast, path, opts, dfr) {
				walk(ast, path, opts, function(error, dep){
					if (error) return dfr.reject(error);
					if (opts.flattern === true && opts.deep === true) {
						dep = flattern(dep);
					}
					dfr.resolve(dep);
				});
				return dfr;
			}
			
			function walk(ast, path, opts, done) {
				var location = path_getDir(path);
				var dependency = {
					mask: [],
					data: [],
					style: [],
					script: [],
				};
				
				mask_TreeWalker.walkAsync(ast, visit, complete);
				
				function visit (node, next){
					if (node.tagName !== 'import') {
						return next();
					}
					var path = resolvePath(node.path, location);
					var type = Module.getType(path);
					if (opts.deep === false) {
						dependency[type].push(path);
						return next();
					}
					if ('mask' === type) {
						getMask(path, opts, function(error, dep){
							if (error) {
								return done(error);
							}
							dependency.mask.push(dep);
							next();
						});
						return;
					}
					
					dependency[type].push(path);
					next();
				}
				function complete() {
					done(null, dependency);
				}
			}
			
			function getMask(path, opts, done){
				var dep = {
					path: path,
					dependencies: null
				};
				
				(__cfg.getFile || file_get)(path)
					.done(function(template){
						walk(parser_parse(template), path, opts, function(error, deps){
							if (error) {
								done(error);
								return;
							}
							dep.dependencies = deps;
							done(null, dep);
						});
					})
					.fail(done);
			}		
			function resolvePath(path_, location) {
				var path = path_;
				if ('' === path_getExtension(path)) {
					path += '.mask';
				}
				if (path_isRelative(path)) {
					path = path_combine(location, path);
				}
				return path_normalize(path);
			}
			
			var flattern;
			(function () {
				flattern = function (deps) {
					return {
						mask: resolve(deps, 'mask'),
						data: resolve(deps, 'data'),
						style: resolve(deps, 'style'),
						script: resolve(deps, 'script'),
					};
				};
				
				function resolve(deps, type) {
					return distinct(get(deps, type, []));
				}
				function get (deps, type, stack) {
					if (deps == null) {
						return stack;
					}
					var arr = deps[type],
						imax = arr.length,
						i = -1, x;
					while ( ++i < imax ) {
						x = arr[i];
						if (typeof x === 'string') {
							stack.unshift(x);
							continue;
						}
						// assume is an object { path, dependencies[] }
						stack.unshift(x.path);
						get(x.dependencies, type, stack);
					}
					if ('mask' !== type) {
						deps.mask.forEach(function(x){
							get(x.dependencies, type, stack);
						});
					}
					return stack;
				}
				function distinct (stack) {
					for (var i = 0; i < stack.length; i++) {
						for (var j = i + 1; j < stack.length; j++) {
							if (stack[i] === stack[j]) {
								stack.splice(j, 1);
								j--;
							}
						}
					}
					return stack;
				}
			}());
			
		}());
		// end:source tools/dependencies
		// source tools/build
		var tools_build;
		(function(){
			
			tools_build = function(template, path, opts_){
				var opts = obj_extendDefaults(opts_, optionsDefault);
				return class_Dfr.run(function(resolve, reject){
					tools_getDependencies(template, path, { flattern: true })
						.fail(reject)
						.done(function(deps){
							build(deps, opts, complete, reject);
						});
					function complete (out) {
						out.mask += '\n' + template;
						resolve(out);
					}
				});
			};
			
			var optionsDefault = {
				minify: false
			};
			
			function build(deps, opts, resolve, reject) {
				var types = ['mask', 'script', 'style', 'data'];
				var out = {
					mask: '',
					data: '',
					style: '',
					script: '',
				};
				function next(){
					if (types.length === 0) {
						if (out.data) {
							out.script = out.data + '\n' + out.script;
						}
						return resolve(out);
					}
					var type = types.shift();
					build_type(deps, type, opts, function(error, str){
						if (error) return reject(error);
						out[type] = str;
						next();
					});
				}
				next();
			}
			
			function build_type (deps, type, opts, done) {
				var arr = deps[type],
					imax = arr.length,
					i = -1,
					stack = [];
					
				function next() {
					if (++i === imax) {
						done(null, stack.join('\n'));
						return;
					}
					Single[type](arr[i], opts)
						.fail(done)
						.done(function(str){
							stack.push('/* source ' + arr[i] + ' */');
							stack.push(str);
							next();
						});
				}
				next();
			}
			
			var Single = {
				mask: function(path, opts, done){
					return class_Dfr.run(function(resolve, reject) {
						(__cfg.getFile || file_get)(path)
							.fail(reject)
							.done(function(str) {
								// remove all remote styles
								var ast = mask_TreeWalker.walk(str, function(node){
									if (node.tagName === 'link' && node.attr.href) {
										return { remove: true };
									}
								});
								ast = jmask('module')
									.attr('path', path)
									.append(ast);
								
								var str = mask_stringify(ast[0], {
									indent: opts.minify ? 0 : 4
								});
								resolve(str);
							});
					});
				},
				script: function(path, opts){
					return (__cfg.buildScript || build_script)(path, opts);
				},
				style: function(path, opts) {
					return (__cfg.buildStyle || build_style)(path, opts);
				},
				data: function(path, opts) {
					return (__cfg.buildData || build_data)(path, opts);
				}
			}
			
			function build_script(path, opts, done) {
				return class_Dfr.run(function(resolve, reject){
					(__cfg.getFile || file_get)(path)
						.fail(reject)
						.done(function(str){
							var script = 'module = { exports: null }\n';
							script += str + ';\n';
							script += 'mask.Module.registerModule(module.exports, "' + path + '")';
							resolve(script);
						});	
				});
			}
			function build_style(path, opts, done) {
				return (__cfg.getFile || file_get)(path, done);
			}
			function build_data(path, opts, done) {
				return class_Dfr.run(function(resolve, reject){
					(__cfg.getFile || file_get)(path)
						.fail(reject)
						.done(function(mix){
							var json;
							try {
								json = typeof mix === 'string'
									? JSON.parse(mix)
									: mix;
							} catch (error) {
								reject(error);
								return;
							}
							var str = JSON.stringify(json, null, opts.minify ? 4 : void 0);
							var script = 'module = { exports: ' + str + ' }\n'
								+ 'mask.Module.registerModule(module.exports, "' + path + '")';
								
							resolve(script);
						});	
				});
			}
		}());
		// end:source tools/build
		
		obj_extend(Module, {
			ModuleMask: ModuleMask,
			createModule: function(path_, ctx, ctr, parent) {			
				var path   = u_resolvePath(path_, ctx, ctr, parent),
					module = _cache[path];
				if (module == null) {
					module = _cache[path] = IModule.create(path, parent);
				}
				return module;
			},
			registerModule: function(mix, path_, ctx, ctr, parent) {
				var path   = u_resolvePath(path_, ctx, ctr, parent),
					module = Module.createModule(path, ctx, ctr, parent);
				module.state = 1;
				if (Module.isMask(path)) {
					module.preprocess_(mix, function(){
						module.state = 4;
						module.resolve(module);
					});
					return module;
				}
				// assume others and is loaded
				module.state   = 4;
				module.exports = mix;
				module.resolve(module);
				return module;
			},
			
			createImport: function(data, ctx, ctr, module){
				var path    = u_resolvePath(data.path, ctx, ctr, module),
					alias   = data.alias,
					exports = data.exports;
				return IImport.create(path, alias, exports, module);
			},
			isMask: function(path){
				var ext = path_getExtension(path);
				return ext === '' || ext === 'mask' || ext === 'html';
			},
			getType: function(path) {
				var ext = path_getExtension(path);			
				if (ext === '' || ext === 'mask'){
					return 'mask';
				}
				var search = ' ' + ext + ' ';
				if (_extensions_style.indexOf(search) !== -1){
					return 'style';
				}
				if (_extensions_data.indexOf(search) !== -1){
					return 'data';
				}
				// assume is javascript
				return 'script';
			},
			cfg: function(name, val){
				switch (name) {
					case 'base':
						_base = val;
						break;
				}
			},
			resolveLocation: u_resolveLocation,
			getDependencies: tools_getDependencies,
			build: tools_build,
		});
	}());
	// end:source modules/
	// source Define
	var Define;
	(function(){
		Define = {
			create: function(node, model, ctr){
				return compo_fromNode(node, model, ctr);
			},
			registerGlobal: function(node, model, ctr) {
				var Ctor = Define.create(node, model, ctr);
				customTag_register(
					node.name, Ctor
				);
			},
			registerScoped: function(node, model, ctr) {
				var Ctor = Define.create(node, model, ctr);
				customTag_registerScoped(
					ctr, node.name, Ctor
				);
			}
		};
		
		function compo_prototype(tagName, attr, nodes, owner, model) {
			var arr = [];
			var Proto = {
				tagName: tagName,
				template: arr,
				attr: attr,
				location: trav_location(owner),
				meta: {
					template: 'merge'
				},
				renderStart: function(){
					Compo.prototype.renderStart.apply(this, arguments);
					if (this.nodes === this.template) {
						this.nodes = mask_merge(this.nodes, [], this);
					}
				},
				getHandler: null
			};
			var imax = nodes == null ? 0 : nodes.length,
				i = 0, x, name;
			for(; i < imax; i++) {
				x = nodes[i];
				if (x == null) 
					continue;
				name = x.tagName;
				if ('function' === name) {
					Proto[x.name] = x.fn;
					continue;
				}
				if ('slot' === name || 'event' === name) {
					var type = name + 's';
					var fns = Proto[type];
					if (fns == null) {
						fns = Proto[type] = {};
					}
					fns[x.name] = x.fn;
					continue;
				}
				if ('define' === name || 'let' === name) {
					var fn = name === 'define'
						? Define.registerGlobal
						: Define.registerScoped;
					fn(x, model, owner);
					continue;
				}
				arr.push(x);
			}
			return Proto;
		}
		function compo_extends(extends_, model, ctr) {
			var args = [];
			if (extends_ == null) 
				return args;
			
			var imax = extends_.length,
				i = -1,
				await = 0, x;
			while( ++i < imax ){
				x = extends_[i];
				if (x.compo) {
					var compo = resolveCompo(x.compo, ctr);
					if (compo != null) {
						args.unshift(compo);
						continue;
					}
					
					var obj = expression_eval(x.compo, model, null, ctr);
					if (obj != null) {
						args.unshift(obj);
						continue;
					}
					log_error('Nor component, nor scoped data is resolved:', x.compo);
					continue;
				}
			}
			return args;
		}
		function resolveCompo(compoName, ctr) {
			while (ctr != null) {
				if (ctr.getHandler) {
					var x = ctr.getHandler(compoName);
					if (x != null) 
						return x;
				}
				ctr = ctr.parent;
			}
			return custom_Tags[compoName];
		}
		function compo_fromNode(node, model, ctr) {
			var extends_ = node['extends'],
				as_ = node['as'],
				tagName,
				attr;
			if (as_ != null) {
				var x = parser_parse(as_);
				tagName = x.tagName;
				attr = obj_extend(node.attr, x.attr);
			}
			
			var name = node.name,
				Proto = compo_prototype(tagName, attr, node.nodes, ctr, model),
				args = compo_extends(extends_, model, ctr)
				;
			
			args.push(Proto);
			return Compo.apply(null, args);
		}
		
		function trav_location(ctr) {
			while(ctr != null) {
				if (ctr.location) {
					return ctr.location;
				}
				if (ctr.resource && ctr.resource.location) {
					return ctr.resource.location;
				}
				ctr = ctr.parent;
			}
			return null;
		}
	}());
	// end:source Define
	// source TreeWalker
	var mask_TreeWalker;
	(function(){
		mask_TreeWalker = {
			walk: function(root, fn) {
				if (typeof root === 'object' && root.type === Dom.CONTROLLER) {
					new SyncWalkerCompos(root, fn);
					return root;
				}
				root = prepairRoot(root);
				new SyncWalker(root, fn);
				return root;
			},
			walkAsync: function(root, fn, done){
				root = prepairRoot(root);
				new AsyncWalker(root, fn, done);
			}
		};
		
		var SyncWalker,
			SyncWalkerCompos;
		(function(){
			SyncWalker = function(root, fn){
				walk(root, fn);
			};
			SyncWalkerCompos = function(root, fn){
				walkCompos(root, fn, root);
			};
			function walk(node, fn, parent, index) {
				if (node == null) 
					return null;
				
				var deep = true, break_ = false, mod;
				if (isFragment(node) !== true) {
					mod = fn(node);
				}
				if (mod !== void 0) {
					mod = new Modifier(mod);
					mod.process(new Step(node, parent, index));
					deep   = mod.deep;
					break_ = mod['break'];
				}			
				var nodes = safe_getNodes(node);
				if (nodes == null || deep === false || break_ === true) {
					return mod;
				}
				var imax = nodes.length,
					i = 0, x;
				for(; i < imax; i++) {
					x = nodes[i];
					mod = walk(x, fn, node, i);
					if (mod != null && mod['break'] === true) {
						return mod;
					}
				}
			}
			function walkCompos(compo, fn, parent, index) {
				if (compo == null) 
					return;
				
				var mod = fn(compo, index);
				if (mod !== void 0) {
					if (mod.deep === false || mod['break'] === true) {
						return mod;
					}
				}
				var compos = compo.components;
				if (compos == null) {
					return null;
				}
				var imax = compos.length,
					i = 0, x;
				for(; i < imax; i++) {
					x = compos[i];
					mod = walkCompos(x, fn, compo, i);
					if (mod != null && mod['break'] === true) {
						return mod;
					}
				}
			}
		}());
		var AsyncWalker;
		(function(){
			AsyncWalker = function(root, fn, done){
				this.stack = [];
				this.done = done;
				this.root = root;
				this.fn = fn;
				
				this.process = this.process.bind(this);
				this.visit(this.push(root));
			};
			AsyncWalker.prototype = {
				current: function(){
					return this.stack[this.stack.length - 1];
				},
				push: function(node, parent, index){
					var step = new Step(node, parent, index);
					this.stack.push(step);
					return step;
				},
				pop: function(){
					return this.stack.pop();
				},
				getNext: function(goDeep){
					var current  = this.current(),
						node = current.node,
						nodes = safe_getNodes(node);
					if (node == null) {
						throw Error('Node is null');
					}
					if (nodes != null && goDeep !== false && nodes.length !== 0) {
						if (nodes[0] == null) {
							throw Error('Node is null');
						}
						return this.push(
							nodes[0],
							node,
							0
						);
					}
					var parent, index;
					while (this.stack.length !== 0) {
						current = this.pop();
						parent = current.parent;
						index  = current.index;
						if (parent == null) {
							this.pop();
							continue;
						}
						if (++index < parent.nodes.length) {
							return this.push(
								parent.nodes[index],
								parent,
								index
							);
						}
					}
					return null;
				},
				process: function(mod){
					var deep = true, break_ = false;
					
					if (mod !== void 0) {
						mod = new Modifier(mod);
						mod.process(this.current());
						deep   = mod.deep;
						break_ = mod['break'];
					}
					
					var next = break_ === true ? null : this.getNext(deep);
					if (next == null) {
						this.done(this.root);
						return;
					}
					this.visit(next);
				},
				
				visit: function(step){
					var node = step.node;
					if (isFragment(node) === false) {
						this.fn(node, this.process);
						return;
					}
					this.process();
				},
				
				fn: null,
				done: null,
				stack: null
			};
		}());
		
		var Modifier;
		(function(){
			Modifier = function (mod, step) {
				for (var key in mod) {
					this[key] = mod[key];
				}
			};
			Modifier.prototype = {
				'break': false,
				deep: true,
				remove: false,
				replace: null,
				process: function(step){
					if (this.replace != null) {
						this.deep = false;
						step.parent.nodes[step.index] = this.replace;
						return;
					}
					if (this.remove === true) {
						this.deep = false;
						var arr = step.parent.nodes,
							i = step.index;
						_Array_splice.call(arr, i, 1);
						return;
					}
				}
			};	
		}());
		
		var Step = function (node, parent, index) {
			this.node = node;
			this.index = index;
			this.parent = parent;
		};
		
		/* UTILS */
		
		function isFragment(node) {
			return Dom.FRAGMENT === safe_getType(node);
		}
		function safe_getNodes(node) {
			var nodes = node.nodes;
			if (nodes == null) 
				return null;
			
			return is_Array(nodes)
				? (nodes)
				: (node.nodes = [ nodes ]);
		}
		function safe_getType(node) {
			var type = node.type;
			if (type != null)
				return type;
		
			if (is_Array(node)) return Dom.FRAGMENT;
			if (node.tagName != null) return Dom.NODE;
			if (node.content != null) return Dom.TEXTNODE;
		
			return Dom.NODE;
		}
		function prepairRoot(root){
			if (typeof root === 'string') {
				root = parser_parse(root);
			}
			if (isFragment(root) === false) {
				var fragment = new Dom.Fragment;
				fragment.appendChild(root);
				
				root = fragment;
			}
			return root;
		}
	}());
	// end:source TreeWalker
	// end:source /ref-mask/src/feature/
	
	// source /ref-mask/src/mask
	var Mask;
	(function(){
		Mask = {	
			/**
			 *	mask.render(template[, model, ctx, container = DocumentFragment, controller]) -> container
			 * - template (String | MaskDOM): Mask String or Mask DOM Json template to render from.
			 * - model (Object): template values
			 * - ctx (Object): can store any additional information, that custom handler may need,
			 * 		this object stays untouched and is passed to all custom handlers
			 * - container (IAppendChild): container where template is rendered into
			 * - controller (Object): instance of an controller that own this template
			 *
			 *	Create new Document Fragment from template or append rendered template to container
			 **/
			render: function (mix, model, ctx, container, controller) {
	
				// if DEBUG
				if (container != null && typeof container.appendChild !== 'function'){
					log_error('.render(template[, model, ctx, container, controller]', 'Container should implement .appendChild method');
				}
				// endif
				
				var template = mix;
				if (typeof mix === 'string') {
					if (_Object_hasOwnProp.call(__templates, mix)){
						/* if Object doesnt contains property that check is faster
						then "!=null" http://jsperf.com/not-in-vs-null/2 */
						template = __templates[mix];
					}else{
						template = __templates[mix] = parser_parse(mix);
					}
				}
				if (ctx == null || ctx.constructor !== builder_Ctx)
					ctx = new builder_Ctx(ctx);
					
				return builder_build(template, model, ctx, container, controller);
			},
			
			renderAsync: function(template, model, ctx, container, ctr) {
				if (ctx == null || ctx.constructor !== builder_Ctx)
					ctx = new builder_Ctx(ctx);
				
				var dom = this.render(template, model, ctx, container, ctr),
					dfr = new class_Dfr;
				
				if (ctx.async === true) {
					ctx.done(function(){
						dfr.resolve(dom);
					});
				} else {
					dfr.resolve(dom);
				}
				return dfr;
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
			parseHtml: parser_parseHtml,
			stringify: mask_stringify,
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
			
			/*
			 * (dom:MaskDom, done:Action<MaskDom>)
			 */
			optimize: mask_optimize,
			
			registerOptimizer: function(tagName, fn){
				custom_Optimizers[tagName] = fn;
			},
			
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
			
			registerFromTemplate: customTag_registerFromTemplate,
			/**
			 *	mask.getHandler(tagName) -> Function | Object
			 * - tagName (String):
			 *
			 *	Get Registered Handler
			 **/
			getHandler: customTag_get,
			getHandlers: customTag_getAll,
			
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
			_     : customUtil_$utils,
			
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
					delete __templates[key];
				}else{
					__templates = {};
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
				
				ensureTmplFn: parser_ensureTemplateFunction
			},
			Dom: Dom,
			TreeWalker: mask_TreeWalker,
			Module: Module,
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
				Array: is_ArrayLike,
				Object: is_Object,
				NODE: is_NODE,
				DOM: is_DOM
			},
			
			'class': {
				create: class_create,
				Deferred: class_Dfr,
				EventEmitter: class_EventEmitter
			},
			
			parser: {
				ObjectLexer: parser_ObjectLexer
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
			setInterpolationQuotes: parser_setInterpolationQuotes,
			
			setCompoIndex: function(index){
				builder_componentID = index;
			},
			
			cfg: function(){
				var args = arguments,
					len = args.length
				if (len === 0) {
					return __cfg;
				}
				if (len === 1) {
					var x = args[0]
					if (is_Object(x)) {
						obj_extend(__cfg, x);
						return;
					}
					if (is_String(x)) {
						return obj_getProperty(__cfg, x);
					}
				}
				if (len === 2) {
					var prop = args[0];
					if (obj_hasProperty(__cfg, prop) === false) {
						log_warn('Unknown configuration property', prop);
					}
					obj_setProperty(__cfg, prop, args[1]);
					return;
				}
			},
			// For the consistence with the NodeJS
			toHtml: function(dom) {
				return $(dom).outerHtml();
			},
			
			factory: function(compoName){
				var params_ = _Array_slice.call(arguments, 1),
					factory = params_.pop(),
					mode = 'both';
				if (params_.length !== 0) {
					var x = params_[0];
					if (x === 'client' || x === 'server') {
						mode = x;
					}
				}
				if ((mode === 'client' && is_NODE) || (mode === 'server' && is_DOM) ) {
					customTag_register(compoName, {
						meta: { mode: mode }
					});
					return;
				}
				factory(global, Compo.config.getDOMLibrary(), function(compo){
					customTag_register(compoName, compo);
				});
			}
		};
		
		
		var __templates = {};
	}());
	
	// end:source /ref-mask/src/mask

	
	//#source mock/mock
	var Meta,
		mock_TagHandler;
	
	(function(){
	
		// source Meta.js
		(function(){
			Meta = {
				stringify: function(json, info){
					
					switch (info.mode) {
						case 'server':
						case 'server:all':
							return '';
					}
					
					
					var	type = info.type,
						isSingle = info.single,
					
						string = tag_OPEN + type;
						
						if (json.ID) 
							string += '#' + json.ID;
						
						string += seperator_CHAR + ' ';
					
					for (var key in json) {
						if (key === 'ID') 
							continue;
						
						if (json[key] == null) 
							continue;
						
						
						string += key
							+ ':'
							+ val_stringify(json[key])
							+ seperator_CHAR
							+ ' ';
					}
					
					if (isSingle)
						string += '/';
						
					string += tag_CLOSE;
					
					return string;
				},
				
				close: function(json, info){
					switch (info.mode) {
						case 'server':
						case 'server:all':
							return '';
					}
					
					
					return tag_OPEN
						+'/'
						+ info.type
						+ (json.ID ? '#' + json.ID : '')
						+ tag_CLOSE;
				},
				
				parse: function (string){
					parser_Index = 0;
					parser_String = string;
					parser_Length = string.length;
					
					
					var json = {},
						c = string[parser_Index];
						
					if (c === '/') {
						json.end = true;
						parser_Index++;
					}
					
					json.type = string[parser_Index++];
					parse_ID(json);
					
					while (parse_property(json));
					
					if (parser_Index === -1) 
						return {};
					
					if (string[parser_Length - 1] === '/') 
						json.single = true;
					if (json.scope !== void 0) 
						json.scope = JSON.parse(json.scope);
					
					return json;
				}
			};
			
			var seperator_CODE = 30,
				seperator_CHAR = String.fromCharCode(seperator_CODE);
			
			function val_stringify(mix) {
				if (mix == null) 
					return 'null';
				if (typeof mix !== 'object') {
					// string | number
					return mix;
				}
				
				if (is_Array(mix) === false) {
					// JSON.stringify does not handle the prototype chain
					mix = _obj_flatten(mix);
				}
				
				return JSON.stringify(mix);
			}
			
			var parser_Index,
				parser_Length,
				parser_String;
				
			var tag_OPEN = '<!--',
				tag_CLOSE = '-->';
					
				
			function parse_ID(json){
				
				if (parser_String[parser_Index] !== '#') {
					return;
				}
				parser_Index++;
				
				var end = parser_String.indexOf(seperator_CHAR);
				
				if (end === -1) {
					end = parser_String.length;
				}
				
				json.ID = parseInt(parser_String.substring(parser_Index, end), 10);
				parser_Index = end;
			}
			
			function parse_property(json) {
				if (parser_Index > parser_Length - 5) 
					return false;
				
				
				if (parser_String[parser_Index++] !== seperator_CHAR || parser_String[parser_Index++] !== ' '){
					parser_Index = -1;
					return false;
				}
				
				var index = parser_Index,
					str = parser_String;
				
				var colon = str.indexOf(':', index),
					key = str.substring(index, colon);
					
				var end = str.indexOf(seperator_CHAR + ' ', colon),
					value = str.substring(colon + 1, end);
					
				
				if (key === 'attr') {
					value = JSON.parse(value);
				}
				
				json[key] = value;
				
				parser_Index = end;
				return true;
			}
			function _obj_flatten(obj) {
				var result = Object.create(obj);
				for(var key in result) {
					result[key] = result[key];
				}
				return result;
			}
			
		}());
		// end:source Meta.js
		// source attr-handler.js
		var mock_AttrHandler = (function() {
			
			function Attr(attrName, attrValue, ID) {
				this.meta = {
					ID : ID,
					name : attrName,
					value : attrValue
				};
			}
			
			Attr.prototype = {
				toString: function(){
					var json = this.meta,
						info = {
							type: 'a',
							single: true
						};
						
					return Meta.stringify(json, info);
				}
			};
			
			return {
				create: function(attrName, fn, mode) {
					
					return function(node, value, model, cntx, tag, controller, container){
						
						if (mode !== 'server') {
							container.insertBefore(new Attr(attrName, value, ++cntx._id), tag);
						}
						
						if (mode !== 'client') {
							return fn(node, value, model, cntx, tag, controller);
						}
						
						
						return '';
					};
				}
			};
		
		}());
		// end:source attr-handler.js
		// source tag-handler.js
		mock_TagHandler = (function() {
			
			function EmptyHandler(attrName, attrValue) {}
			
			EmptyHandler.prototype = {
				render: function(){},
				mode: 'client'
			};
			
			return {
				create: function(tagName, Compo, mode){
					
					if (mode === 'client' || Compo.prototype.mode === 'client') {
						return EmptyHandler;
					}
					
					Compo.prototype.mode = mode;
					return Compo;
					
				},
				
				
			};
				
		}());
		// end:source tag-handler.js
		// source util-handler.js
		var mock_UtilHandler;
		(function() {
			mock_UtilHandler = {
				create: utilFunction
			};
			
			function utilFunction(name, mix, mode){
				if (mode === 'server') 
					return mix;
				
				// partial | client
				return function(val, model, ctx, el, ctr, attrName, type) {
					var node = new HtmlDom.UtilNode(type, name, val, attrName /*, ++ctx._id */);
					if (type === 'attr') {
						el
							.parentNode
							.insertBefore(node, el);
					}
					
					if (mode === 'partial') {
						var fn = util_FNS[type],
							current;
						if (is_Function(mix[fn]) === false){
							log_error('Utils partial function is not defined', fn);
							return '';
						}
						
						current = mix[fn](val, model, ctx, el, ctr);
						if (type === 'node') {
							node.appendChild(mix.element);
							return node;
						}
						
						//> attr
						return node.meta.current = current;
					}
					
					/* client-only */
					if (type === 'node') 
						return node;
					
					//> attr
					return '';
				};
			}
			
			var util_FNS = {
				node: 'nodeRenderStart',
				attr: 'attrRenderStart'
			};
		
		}());
		// end:source util-handler.js
		
		var orig_registerUtil = Mask.registerUtil;
		
		Mask.registerAttrHandler = function(attrName, mix, fn){
			
			if (fn == null) {
				custom_Attributes[attrName] = mix;
				return;
			}
			
			// obsolete - change args in all callers
			if (typeof fn === 'string') {
				var swap = mix;
				mix = fn;
				fn = swap;
			}
			
			custom_Attributes[attrName] = mock_AttrHandler.create(attrName, fn, mix);
		};
		
		
		
		Mask.registerUtil = function(name, mix, mode){
			
			if (mode == null && is_Object(mix)) 
				mode = mix.mode;
			
			orig_registerUtil(name, mode == null
				? mix
				: mock_UtilHandler.create(name, mix, mode)
			);
		}
		
		// backward support
		Mask.registerUtility  = Mask.registerUtil;
		
		Mask.registerHandler = function(tagName, compo){
			
			if (compo != null && typeof compo === 'object') {
				//> static
				compo.__Ctor = wrapStatic(compo);
			}	
			
			if (custom_Tags_defs.hasOwnProperty(tagName)) 
				obj_extend(compo.prototype, custom_Tags_defs[tagName]);
			
			var proto = typeof compo === 'function'
				? compo.prototype
				: compo;
			if (proto.meta == null) 
				proto.meta = proto.$meta || {};
			
			/* obsolete meta copy */
			if (proto.cache) 
				proto.meta.cache = proto.cache;
			if (proto.mode) 
				proto.meta.mode = proto.mode;
			
			
			if (compo_getMetaVal(compo, 'mode') === mode_CLIENT) {
				custom_Tags[tagName] = mock_TagHandler.create(tagName, compo, 'client');
				return;
			}
			
			custom_Tags[tagName] = compo;
		};
		
		Mask.compoDefinitions = function(compos, utils, attributes){
			var tags = custom_Tags,
				defs = custom_Tags_defs;
				
			for (var tagName in compos) {
				defs[tagName] = compos[tagName];
				
				if (tags[tagName] !== void 0) {
					obj_extend(tags[tagName].prototype, compos[tagName]);
					continue;
				}
				
				tags[tagName] = mock_TagHandler.create(tagName, null, 'client');
			}
			
			var doNothing = function(){};
			for (var key in utils){
				if (utils[key].mode === 'client'){
					Mask.registerUtil(key, doNothing, 'client');
				}
			}
			
			for (var key in attributes){
				if (attributes[key].mode === 'client') {
					Mask.registerAttrHandler(key, doNothing, 'client');
				}
			}
		};	
		
		
		function wrapStatic(proto, parent) {
			function Ctor(node) {
				this.tagName = node.tagName;
				this.compoName = node.tagName;
				
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
	}());
	
	//#end:source mock/mock
	//#source cache/
	var Cache;
	(function(){
		
		var _lastCtrlID = 0,
			_lastModelID = 0,
			_cache = {};
		
		// source ./utils.js
		
		function cache_toHtmlDelegate(html) {
			return function(){
				return html;
			};
		}
		// end:source ./utils.js
		// source ./CompoCacheCollection.js
		
		function CompoCacheCollection(ctr, cache) {
			if (cache == null /* obsolete */) 
				cache = ctr.cache;
			
			if (cache == null) 
				return;
			this.__cacheInfo = new CompoCache(cache);
		}
		
		CompoCacheCollection.prototype = {
			__null: null,
			__value: null
		};
		
		
		function CompoCache(cache) {
			if (typeof cache === 'object') {
				if (cache.byProperty) {
					var prop = cache.byProperty,
						dot = prop.indexOf('.'),
						objName = prop.substring(0, dot),
						obj;
					
					prop = prop.substring(dot + 1);
					
					switch (objName) {
						case 'model':
						case 'ctx':
							break;
						default:
							console.error('[CompoCache] - property accessor not valid - should be "[model/ctx].[accessor]"');
							return null;	
					}
					
					this.propObjName = objName;
					this.propAccessor = prop;
				}
			}
			this.expire = cache.expire;
			return this;
		}
		
		CompoCache.prototype = {
			prop: void 0,
			propObjName: null,
			propAccessor: null,
			expire: null,
			
			getKey: function(model, ctx) {
				
				if (this.propAccessor == null) 
					return '__value';
				
				var objName = this.propObjName,
					prop = this.propAccessor;
				
				var obj, key;
				
				if ('model' === objName) 
					obj = model;
				
				if ('ctx' === objName) 
					obj = ctx;
				
				
				key = obj_getProperty(obj, prop);
				
				
				if (typeof key === 'undefined') 
					return '__value';
				
				if (key == null) 
					return '__null';
				
				return key;
			}
		};
		// end:source ./CompoCacheCollection.js
		
		Cache = {
			get controllerID (){
				return _lastCtrlID;
			},
			
			get modelID () {
				return _lastModelID;
			},
			
			cacheCompo: function(model, ctx, compoName, compo, cache){
				
				if (__cfg.allowCache === false) 
					return;
				
				var cached = _cache[compoName];
				if (cached == null) {
					cached = _cache[compoName] = new CompoCacheCollection(compo, cache);
				}
				
				var cacheInfo = cached.__cacheInfo;
				
				if (cacheInfo == null) 
					return;
				
				cached[cacheInfo.getKey(model, ctx)] = compo;
				
				_lastCtrlID = ctx._id;
				_lastModelID = ctx._models._id;
			},
			
			
			getCompo: function(model, ctx, compoName, Ctor){
				if (__cfg.allowCache === false) 
					return null;
				
				var cached = _cache[compoName];
				if (cached == null)
					return null;
				
				var info = cached.__cacheInfo,
					compo = cached[info.getKey(model, ctx)];
				
				// check if cached data is already present, due to async. components
				return compo == null || compo.__cached == null
					? null
					: compo;
			},
			
			getCache: function(){
				return _cache;
			}
		};
	}());
	//#end:source cache/
	//#source mask
	(function(){
		var mask_render = Mask.render;
			
		obj_extend(Mask, {
			toHtml: function(dom, model, ctx, ctr){
				return HtmlDom.stringify(dom, model, ctx, ctr);
			},
			render: function(tmpl, model, ctx, el, ctr){
				var _ctr = ensureCtr(ctr),
					_ctx = ensureCtx(ctx),
					dom = mask_render(tmpl, model, _ctx, el, _ctr);
					
				return HtmlDom.stringify(dom, model, _ctx, _ctr);
			},
			renderAsync: function(tmpl, model, ctx, el, ctr){
				var _ctr = ensureCtr(ctr),
					_ctx = ensureCtx(ctx),
					dfr = new class_Dfr,
					dom = mask_render(tmpl, model, _ctx, el, _ctr);
				
				if (_ctx.async === true) {
					_ctx.done(resolve);
				} else {
					resolve();
				}
				
				function resolve() {
					var html = _ctx._rewrite == null && _ctx._redirect == null
						? HtmlDom.stringify(dom, model, _ctx, _ctr)
						: null;
					dfr.resolve(html);
				}
				return dfr;
			}
		});
		
		function ensureCtr(ctr) {
			return ctr == null
				? new Dom.Component
				: ctr;
		}
		function ensureCtx(ctx) {
			return ctx == null || ctx.constructor !== builder_Ctx
				? new builder_Ctx(ctx)
				: ctx;
		}
	}());
	//#end:source mask

	/*** Libraries ***/	
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
				if (node == null) 
					return false;
				
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
				if (node == null) 
					return null;
				
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
		
			dom_addEventListener = function(el, event, fn, param, ctr) {
			
				if (TouchHandler.supports(event)) {
					TouchHandler.on(el, event, fn);
					return;
				}
				if (KeyboardHandler.supports(event, param)) {
					KeyboardHandler.attach(el, event, param, fn, ctr);
					return;
				}
				// allows custom events - in x-signal, for example
				if (domLib != null) 
					return domLib(el).on(event, fn);
				
				if (el.addEventListener != null) 
					return el.addEventListener(event, fn, false);
				
				if (el.attachEvent) 
					el.attachEvent('on' + event, fn);
			};
		
			node_tryDispose = function(node){
				if (node.hasAttribute('x-compo-id')) {
					
					var id = node.getAttribute('x-compo-id'),
						compo = Anchor.getByID(id)
						;
					
					if (compo != null) {
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
			
				var compos = compo.components;
				if (compos != null) {
					var i = compos.length;
					while ( --i > -1 ) {
						compo_dispose(compos[i]);
					}
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
				if (template == null) {
					return;
				}
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
						default_ = null,
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
					
					else if (typeof metaVal === 'object') {
						fn = _ensureFns_Delegate.options(metaVal);
						default_ = metaVal['default'];
					}
					
					if (fn == null) {
						log_error('Function expected for the attr. handler', metaKey);
						return;
					}
					
					Proto[property] = null;
					Proto = null;
					hash [attrName] = function(compo, attrVal, model){
						if (attrVal == null) {
							if (optional === false) {
								return Error('Expected');
							}
							if (default_ != null) {
								compo[property] = default_;
							}
							return null;
						}
						
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
					},
					options: function(opts){
						var type = opts.type || 'string',
							def = opts.default || _defaults[type];
						return function(x){
							if (!x) return def;
							var fn = _ensureFns[type];
							if (fn != null) 
								return fn.apply(this, arguments);
							
							return x;
						};
					}
				};
				var _defaults = {
					string: '',
					boolean: false,
					number: 0
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
		(function(){
			
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
				var meta = Proto.meta;
				if (meta == null) 
					meta = Proto.meta = {};
				
				if (meta.template == null) 
					meta.template = 'merge';
			};
			
			function inherit_(target, source, name){
				if (target == null || source == null) 
					return;
				
				if ('node' === name) {
					var targetNodes = target.template || target.nodes,
						sourceNodes = source.template || source.nodes;
					target.template = targetNodes == null || sourceNodes == null
						? (targetNodes || sourceNodes)
						: (mask_merge(sourceNodes, targetNodes, target, {extending: true }));
					
					if (target.nodes != null) {
						target.nodes = target.template;
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
		}());
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
		
		// source /src/keyboard/Handler.js
		var KeyboardHandler;
		(function(){
			
			// source ./utils.js
			var event_bind,
				event_unbind,
				event_getCode;
			(function(){
				
				event_bind = function (el, type, mix){
					el.addEventListener(type, mix, false);
				};
				event_unbind = function (el, type, mix) {
					el.removeEventListener(type, mix, false);
				};	
				
				event_getCode = function(event){
					var code = event.keyCode || event.which;
					
					if (code >= 96 && code <= 105) {
						// numpad digits
						return code - 48;
					}
					
					return code;
				};
				
			}());
			
			// end:source ./utils.js
			// source ./const.js
			var CODES, SHIFT_NUMS, MODS;
			
			CODES = {
				"backspace": 8,
				"tab": 9,
				"return": 13,
				"enter": 13,
				"shift": 16,
				"ctrl": 17,
				"control": 17,
				"alt": 18,
				"option": 18,
				
				"fn": 255,
				
				"pause": 19,
				"capslock": 20,
				"esc": 27,
				"space": 32,
				"pageup": 33,
				"pagedown": 34,
				"end": 35,
				"home": 36,
				"start": 36,
				
				"left": 37,
				"up": 38,
				"right": 39,
				"down": 40,
				
				"insert": 45,
				"ins": 45,
				"del": 46,
				"numlock": 144,
				"scroll": 145,
				
				"f1": 112,
				"f2": 113,
				"f3": 114,
				"f4": 115,
				"f5": 116,
				"f6": 117,
				"f7": 118,
				"f8": 119,
				"f9": 120,
				"f10": 121,
				"f11": 122,
				"f12": 123,
				
				";": 186,
				"=": 187,
				"*": 106,
				"+": 107,
				"-": 189,
				".": 190,
				"/": 191,
				
				",": 188,
				"`": 192,
				"[": 219,
				"\\": 220,
				"]": 221,
				"'": 222
			};
			
			SHIFT_NUMS = {
			  "`": "~",
			  "1": "!",
			  "2": "@",
			  "3": "#",
			  "4": "$",
			  "5": "%",
			  "6": "^",
			  "7": "&",
			  "8": "*",
			  "9": "(",
			  "0": ")",
			  "-": "_",
			  "=": "+",
			  ";": ": ",
			  "'": "\"",
			  ",": "<",
			  ".": ">",
			  "/": "?",
			  "\\": "|"
			};
			
			MODS = {
				'16': 'shiftKey',
				'17': 'ctrlKey',
				'18': 'altKey',
			};
			// end:source ./const.js
			// source ./filters.js
			var filter_isKeyboardInput,
				filter_skippedInput,
				filter_skippedComponent,
				filter_skippedElement;
			(function(){
				filter_skippedInput = function(event, code){
					if (event.ctrlKey || event.altKey) 
						return false;
					return filter_isKeyboardInput(event.target);
				};
				
				filter_skippedComponent = function(compo){
					if (compo.$ == null || compo.$.length === 0) {
						return false;
					}
					return filter_skippedElement(compo.$.get(0));
				};
				filter_skippedElement = function(el) {
					if (document.contains(el) === false) 
						return false;
					
					if (el.style.display === 'none')
						return false;
					
					var disabled = el.disabled;
					if (disabled === true) 
						return false;
					
					return true;
				};
				filter_isKeyboardInput = function (el) {
					var tag = el.tagName;
					if ('TEXTAREA' === tag) {
						return true;
					}
					if ('INPUT' !== tag) {
						return false;
					}
					return TYPELESS_INPUT.indexOf(' ' + el.type + ' ') === -1;
				};
				
				var TYPELESS_INPUT = ' button submit checkbox file hidden image radio range reset ';
			}());
			// end:source ./filters.js
			// source ./Hotkey.js
			var Hotkey;
			(function(){
				Hotkey = {
					on: function(combDef, fn, compo) {
						if (handler == null) init();
						
						var comb = IComb.create(
							combDef
							, 'keydown'
							, fn
							, compo
						);
						handler.attach(comb);
					},
					off: function(fn){
						handler.off(fn);
					},
					handleEvent: function(event){
						handler.handle(event.type, event_getCode(event), event);
					},
					reset: function(){
						handler.reset();
					}
				};
				var handler;
				function init() {
					handler = new CombHandler();
					event_bind(window, 'keydown', Hotkey);
					event_bind(window, 'keyup', Hotkey);
					event_bind(window, 'focus', Hotkey.reset);
				}
			}());
			// end:source ./Hotkey.js
			// source ./IComb.js
			var IComb;
			(function(){
				IComb = function(set){
					this.set = set;
				};
				IComb.parse = function (str) {
					var parts = str.split(','),
						combs = [],
						imax = parts.length,
						i = 0;
					for(; i < imax; i++){
						combs[i] = parseSingle(parts[i]);
					}
					return combs;
				};
				IComb.create = function (def, type, fn, ctx) {
					var codes = IComb.parse(def);
					var comb = Key.create(codes);
					if (comb == null) {
						comb = new KeySequance(codes)
					}
					comb.init(type, fn, ctx);
					return comb;
				};
				IComb.prototype = {
					type: null,
					ctx: null,
					set: null,
					fn: null,
					init: function(type, fn, ctx){
						this.type = type;
						this.ctx = ctx;
						this.fn = fn;
					},
					tryCall: null
				};
				
				function parseSingle(str) {
					var keys = str.split('+'),
						imax = keys.length,
						i = 0,
						out = [], x, code;
					for(; i < imax; i++){
						x = keys[i].trim();
						code = CODES[x];
						if (code === void 0) {
							if (x.length !== 1) 
								throw Error('Unexpected sequence. Use `+` sign to define the sequence:' + x)
							
							code = x.toUpperCase().charCodeAt(0);
						}
						out[i] = code;
					}
					return {
						last: out[imax - 1],
						keys: out.sort()
					};
				}
			}());
			// end:source ./IComb.js
			// source ./Key.js
			var Key;
			(function(){
				Key = class_create(IComb, {
					constructor: function(set, key, mods){
						this.key = key;
						this.mods = mods;
					},
					tryCall: function(event, codes, lastCode){
						if (event.type !== this.type || lastCode !== this.key) {
							return Key_MATCH_FAIL;
						}
						
						for (var key in this.mods){
							if (event[key] !== this.mods[key]) 
								return Key_MATCH_FAIL;
						}
						
						this.fn.call(this.ctx, event);
						return Key_MATCH_OK;
					}
				});
				
				Key.create = function(set){
					if (set.length !== 1) 
						return null;
					var keys = set[0].keys,
						i = keys.length,
						mods = {
							shiftKey: false,
							ctrlKey: false,
							altKey: false
						};
					
					var key, mod, hasMod;
					while(--i > -1){
						if (MODS.hasOwnProperty(keys[i]) === false) {
							if (key != null) 
								return null;
							key = keys[i];
							continue;
						}
						mods[MODS[keys[i]]] = true;
						hasMod = true;
					}
					return new Key(set, key, mods);
				};
				
			}());
			// end:source ./Key.js
			// source ./KeySequance.js
			var KeySequance,
				Key_MATCH_OK = 1,
				Key_MATCH_FAIL = 2,
				Key_MATCH_WAIT = 3,
				Key_MATCH_NEXT = 4;
			
			(function(){
				KeySequance = class_create(IComb, {
					index: 0,
					tryCall: function(event, codes, lastCode){
						var matched = this.check_(codes, lastCode);
						if (matched === Key_MATCH_OK) {
							this.index = 0;
							this.fn.call(this.ctx, event);
						}
						return matched;
					},
					fail_: function(){
						this.index = 0;
						return Key_MATCH_FAIL;
					},
					check_: function(codes, lastCode){
						var current = this.set[this.index],
							keys = current.keys,
							last = current.last;
					
						var l = codes.length;
						if (l < keys.length) 
							return Key_MATCH_WAIT;
						if (l > keys.length) 
							return this.fail_();
						
						if (last !== lastCode) {
							return this.fail_();
						}
						while (--l > -1) {
							if (keys[l] !== codes[l]) 
								return this.fail_();
						}
						if (this.index < this.set.length - 1) {
							this.index++;
							return Key_MATCH_NEXT;
						}
						this.index = 0;
						return Key_MATCH_OK;
					}
				});
				
			}());
			
			
			// end:source ./KeySequance.js
			// source ./CombHandler.js
			var CombHandler;
			(function(){
				CombHandler = function(){
					this.keys = [];
					this.combs = [];
				};
				CombHandler.prototype = {
					keys: null,
					combs: null,
					attach: function(comb) {
						this.combs.push(comb);
					},
					off: function(fn){
						var imax = this.combs.length,
							i = 0;
						for(; i < imax; i++){
							if (this.combs[i].fn === fn) {
								this.combs.splice(i, 1);
								return true;
							}
						}
						return false;
					},
					handle: function(type, code, event){
						if (this.combs.length === 0) {
							return;
						}
						if (this.filter_(event, code)) {
							return;
						}
						if (type === 'keydown') {
							if (this.add_(code)) {
								this.emit_(type, event, code);
							}
							return;
						}
						if (type === 'keyup') {
							this.emit_(type, event, code);
							this.remove_(code);
						}
					},
					handleEvent: function(event){
						var code = event_getCode(event),
							type = event.type;
						this.handle(type, code, event);
					},
					reset: function(){
						this.keys.length = 0;
					},
					add_: function(code){
						var imax = this.keys.length,
							i = 0, x;
						for(; i < imax; i++){
							x = this.keys[i];
							if (x === code) 
								return false;
							
							if (x > code) {
								this.keys.splice(i, 0, code);
								return true;
							}
						}
						this.keys.push(code);
						return true;
					},
					remove_: function(code){
						var i = this.keys.length;
						while(--i > -1){
							if (this.keys[i] === code) {
								this.keys.splice(i, 1);
								return;
							}
						}
					},
					emit_: function(type, event, lastCode){
						var next = false,
							combs = this.combs,
							imax = combs.length,
							i = 0, x, stat;
						for(; i < imax; i++){
							x = combs[i];
							if (x.type !== type) 
								continue;
							
							stat = x.tryCall(event, this.keys, lastCode);
							if (Key_MATCH_OK === stat || stat === Key_MATCH_NEXT) {
								event.preventDefault();
							}
							if (stat === Key_MATCH_WAIT || stat === Key_MATCH_NEXT) {
								next = true;
							}
						}
						if (next === false) {
							//-this.keys.length = 0;
						}
					},
					filter_: function(event, code){
						return filter_skippedInput(event, code);
					}
				};
			}());
			// end:source ./CombHandler.js
			
			KeyboardHandler = {
				supports: function(event, param){
					if (param == null) 
						return false;
					switch(event){
						case 'press':
						case 'keypress':
						case 'keydown':
						case 'keyup':
						case 'hotkey':
						case 'shortcut':
							return true;
					}
					return false;
				},
				on: function(el, type, def, fn){
					if (type === 'keypress' || type === 'press') {
						type = 'keydown';
					}
					var comb = IComb.create(def, type, fn);
					if (comb instanceof Key) {
						event_bind(el, type, function (event) {
							var code = event_getCode(event);
							var r = comb.tryCall(event, null, code);
							if (r === Key_MATCH_OK) 
								event.preventDefault();
						});
						return;
					}
					
					var handler = new CombHandler;
					event_bind(el, 'keydown', handler);
					event_bind(el, 'keyup', handler);
					handler.attach(comb);
				},
				hotkeys: function(compo, hotkeys){
					var fns = [], fn, comb;
					for(comb in hotkeys) {
						fn = hotkeys[comb];
						Hotkey.on(comb, fn, compo);
					}
					compo_attachDisposer(compo, function(){
						var comb, fn;
						for(comb in hotkeys) {
							Hotkey.off(hotkeys[comb]);
						}
					});
				},
				attach: function(el, type, comb, fn, ctr){
					if (filter_isKeyboardInput(el)) {
						this.on(el, type, comb, fn);
					}
					var x = ctr;
					while(x && x.slots == null) {
						x = x.parent;
					}
					if (x == null) {
						log_error('Slot-component not found:', comb);
						return;
					}
					var hotkeys = x.hotkeys;
					if (hotkeys == null) {
						hotkeys = x.hotkeys = {};
					}
					hotkeys[comb] = fn;
				}
			};
		}());
		// end:source /src/keyboard/Handler.js
		// source /src/touch/Handler.js
		var TouchHandler;
		(function(){
			
			// source ./utils.js
			var event_bind,
				event_unbind,
				event_trigger,
				isTouchable;
			
			(function(){
				isTouchable = 'ontouchstart' in global;
				
				event_bind = function(el, type, mix) {
					el.addEventListener(type, mix, false);
				};
				event_unbind = function (el, type, mix) {
					el.removeEventListener(type, mix, false);
				};
				event_trigger = function(el, type) {
					var event = new CustomEvent(type, {
						cancelable: true,
						bubbles: true
					});
					el.dispatchEvent(event);
				};
			}());
				
			// end:source ./utils.js
			// source ./Touch.js
			var Touch;
			(function(){
				Touch = function(el, type, fn) {
					this.el = el;
					this.fn = fn;
					this.dismiss = 0;
					event_bind(el, type, this);
					event_bind(el, MOUSE_MAP[type], this);
				};
				
				var MOUSE_MAP = {
					'mousemove': 'touchmove',
					'mousedown': 'touchstart',
					'mouseup': 'touchend'
				};
				var TOUCH_MAP = {
					'touchmove': 'mousemove',
					'touchstart': 'mousedown',
					'touchup': 'mouseup'
				};
				
				Touch.prototype = {
					handleEvent: function (event) {
						switch(event.type){
							case 'touchstart':
							case 'touchmove':
							case 'touchend':
								this.dismiss++;
								event = prepairTouchEvent(event);
								this.fn(event);
								break;
							case 'mousedown':
							case 'mousemove':
							case 'mouseup':
								if (--this.dismiss < 0) {
									this.dismiss = 0;
									this.fn(event);
								}
								break;
						}
					}
				};
				function prepairTouchEvent(event){
					var touch = null,
						touches = event.changedTouches;
					if (touches && touches.length) {
						touch = touches[0];
					}
					if (touch == null && event.touches) {
						touch = event.touches[0];
					}
					if (touch == null) {
						return event;
					}
					return createMouseEvent(event, touch);
				}
				function createMouseEvent (event, touch) {
					var obj = Object.create(MouseEvent.prototype);
					for (var key in event) {
						obj[key] = event[key];
					}
					for (var key in PROPS) {
						obj[key] = touch[key];
					}
					return new MouseEvent(TOUCH_MAP[event.type], obj);
				}
				var PROPS = {
					clientX: 1,
					clientY: 1,
					pageX: 1,
					pageY: 1,
					screenX: 1,
					screenY: 1
				};
			}());
			// end:source ./Touch.js
			// source ./FastClick.js
			var FastClick;
			(function(){
				FastClick = function (el, fn) {
					this.state = 0;
					this.el = el;
					this.fn = fn;
					this.startX = 0;
					this.startY = 0;
					this.tStart = 0;
					this.tEnd = 0;
					this.dismiss = 0;
					
					event_bind(el, 'touchstart', this);
					event_bind(el, 'touchend', this);
					event_bind(el, 'click', this);
				};
				
				var threshold_TIME = 300,
					threshold_DIST = 10;
				
				FastClick.prototype = {
					handleEvent: function (event) {
						switch (event.type) {
							case 'touchmove':
								this.touchmove(event);
								break;
							case 'touchstart':
								this.touchstart(event);
								break;
							case 'touchend':
								this.touchend(event);
								break;
							case 'touchcancel':
								this.reset();
								break;
							case 'click':
								this.click(event);
								break;
						}
					},
					
					touchstart: function(event){
						event_bind(document.body, 'touchmove', this);
						
						var e = event.touches[0];
						
						this.state  = 1;
						this.tStart = event.timeStamp;
						this.startX = e.clientX;
						this.startY = e.clientY;
					},
					touchend: function (event) {
						this.tEnd = event.timeStamp;
						if (this.state === 1) {
							this.dismiss++;
							if (this.tEnd - this.tStart <= threshold_TIME) {
								this.call(event);
								return;
							}
							
							event_trigger(this.el, 'taphold');
							return;
						}
						this.reset();
					},
					click: function(event){
						if (--this.dismiss > -1) 
							return;
						
						var dt = event.timeStamp - this.tEnd;
						if (dt < 400) 
							return;
						
						this.dismiss = 0;
						this.call(event);
					},
					touchmove: function(event) {
						var e = event.touches[0];
						
						var dx = e.clientX - this.startX;
						if (dx < 0) dx *= -1;
						if (dx > threshold_DIST) {
							this.reset();
							return;
						}
						
						var dy = e.clientY - this.startY;
						if (dy < 0) dy *= -1;
						if (dy > threshold_DIST) {
							this.reset();
							return;
						}
					},
					
					reset: function(){
						this.state = 0;
						event_unbind(document.body, 'touchmove', this);
					},
					call: function(event){
						this.reset();
						this.fn(event);
					}
				};
				
			}());
			// end:source ./FastClick.js
			
			TouchHandler = {
				supports: function (type) {
					if (isTouchable === false) {
						return false;
					}
					switch(type){
						case 'click':
						case 'mousedown':
						case 'mouseup':
						case 'mousemove':
							return true;
					}
					return false;
				},
				on: function(el, type, fn){
					if ('click' === type) {
						return new FastClick(el, fn);
					}
					return new Touch(el, type, fn);
				}
			};
		}());
		// end:source /src/touch/Handler.js
	
		// source /src/compo/anchor.js
		/**
		 *	Get component that owns an element
		 **/
		var Anchor;
		(function(){
			Anchor =  {
				create: function(compo){
					var id = compo.ID;
					if (id == null){
						log_warn('Component should have an ID');
						return;
					}
					_cache[id] = compo;
				},
				resolveCompo: function(el, silent){
					if (el == null)
						return null;
					
					var ownerId, id, compo;
					do {
						id = el.getAttribute('x-compo-id');
						if (id != null) {
							if (ownerId == null) {
								ownerId = id;
							}
							compo = _cache[id];
							if (compo != null) {
								compo = Compo.find(compo, {
									key: 'ID',
									selector: ownerId,
									nextKey: 'components'
								});
								if (compo != null) 
									return compo;
							}
						}
						el = el.parentNode;
					}while(el != null && el.nodeType === 1);
		
					// if DEBUG
					ownerId && silent !== true && log_warn('No controller for ID', ownerId);
					// endif
					return null;
				},
				removeCompo: function(compo){
					var id = compo.ID;
					if (id != null) 
						_cache[id] = void 0;
				},
				getByID: function(id){
					return _cache[id];
				}
			};
		
			var _cache = {};
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
				
				initialize: function(mix, model, ctx, container, parent) {
					if (mix == null)
						throw Error('Undefined is not a component');
					
					if (container == null){
						if (ctx && ctx.nodeType != null){
							container = ctx;
							ctx = null;
						}else if (model && model.nodeType != null){
							container = model;
							model = null;
						}
					}
					var node;
					function createNode(compo) {
						node = {
							controller: compo,
							type: Dom.COMPONENT
						};
					}
					if (typeof mix === 'string'){
						if (/^[^\s]+$/.test(mix)) {
							var compo = mask.getHandler(mix);
							if (compo == null)
								throw Error('Component not found: ' + mix);
							
							createNode(compo);
						} else {
							createNode(Compo({
								template: mix
							}));
						}
					}
					else if (typeof mix === 'function') {
						createNode(mix);
					}
					
					if (parent == null && container != null) {
						parent = Anchor.resolveCompo(container);
					}
					if (parent == null){
						parent = new Compo();
					}
					
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
							console.error('EventDecorators are not used. Touch&Mouse support is already integrated');
							EventDecorator = EventDecos[mix];
							return;
						}
						if (typeof mix === 'boolean' && mix === false) {
							EventDecorator = null;
							return;
						}
					}
			
				},
			
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
					// if DEBUG
					eval(source);
					// endif
				},
				
				Dom: {
					addEventListener: dom_addEventListener
				}
			});
			
			
			// end:source ./Compo.static.js
			// source ./async.js
			(function(){
				Compo.pause = function(compo, ctx){
					if (ctx != null) {
						if (ctx.defers == null) {
							// async components
							ctx.defers = [];
						}
						if (ctx.resolve == null) {
							obj_extend(ctx, class_Dfr.prototype);
						}
						ctx.async = true;
						ctx.defers.push(compo);
					}
					
					obj_extend(compo, CompoProto);
					return function(){
						Compo.resume(compo, ctx);
					};
				};
				Compo.resume = function(compo, ctx){
					compo.async = false;
			
					// fn can be null when calling resume synced after pause
					if (compo.resume) {
						compo.resume();
					}
					if (ctx == null) {
						return;
					}
					
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
				
				var CompoProto = {
					async: true,
					await: function(resume){
						this.resume = resume;
					}
				};
			}());
			// end:source ./async.js
		
			CompoProto = {
				type: Dom.CONTROLLER,
				__resource: null,
				
				ID: null,
				
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
				hotkeys: null,
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
					
					if (this.hotkeys != null) 
						KeyboardHandler.hotkeys(this, this.hotkeys);
					
					
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
		
		// source /src/signal/exports.js
		(function(){
			
			// source ./utils.js
			var _hasSlot,
				_fire;
				
			(function(){
				// @param sender - event if sent from DOM Event or CONTROLLER instance
				_fire = function (ctr, slot, sender, args, direction) {
					if (ctr == null) 
						return false;
					
					var found = false,
						fn = ctr.slots != null && ctr.slots[slot];
						
					if (typeof fn === 'string') 
						fn = ctr[fn];
					
					if (typeof fn === 'function') {
						found = true;
						
						var isDisabled = ctr.slots.__disabled != null && ctr.slots.__disabled[slot];
						if (isDisabled !== true) {
			
							var result = args == null
								? fn.call(ctr, sender)
								: fn.apply(ctr, [ sender ].concat(args));
			
							if (result === false) {
								return true;
							}
							if (result != null && typeof result === 'object' && result.length != null) {
								args = result;
							}
						}
					}
			
					if (direction === -1 && ctr.parent != null) {
						return _fire(ctr.parent, slot, sender, args, direction) || found;
					}
			
					if (direction === 1 && ctr.components != null) {
						var compos = ctr.components,
							imax = compos.length,
							i = 0,
							r;
						for (; i < imax; i++) {
							r = _fire(compos[i], slot, sender, args, direction);
							
							!found && (found = r);
						}
					}
					
					return found;
				}; // _fire()
			
				_hasSlot = function (ctr, slot, direction, isActive) {
					if (ctr == null) {
						return false;
					}
					var slots = ctr.slots;
					if (slots != null && slots[slot] != null) {
						if (typeof slots[slot] === 'string') {
							slots[slot] = ctr[slots[slot]];
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
					if (direction === -1 && ctr.parent != null) {
						return _hasSlot(ctr.parent, slot, direction);
					}
					if (direction === 1 && ctr.components != null) {
						for (var i = 0, length = ctr.components.length; i < length; i++) {
							if (_hasSlot(ctr.components[i], slot, direction)) {
								return true;
							}
						}
					}
					return false;
				}; 
			}());
			
			// end:source ./utils.js
			// source ./toggle.js
			var _toggle_all,
				_toggle_single;
			(function(){
				_toggle_all = function (ctr, slot, isActive) {
			
					var parent = ctr,
						previous = ctr;
					while ((parent = parent.parent) != null) {
						__toggle_slotState(parent, slot, isActive);
			
						if (parent.$ == null || parent.$.length === 0) {
							// we track previous for changing elements :disable state
							continue;
						}
			
						previous = parent;
					}
			
					__toggle_slotStateWithChilds(ctr, slot, isActive);
					__toggle_elementsState(previous, slot, isActive);
				};
			
				_toggle_single = function(ctr, slot, isActive) {
					__toggle_slotState(ctr, slot, isActive);
			
					if (!isActive && (_hasSlot(ctr, slot, -1, true) || _hasSlot(ctr, slot, 1, true))) {
						// there are some active slots; do not disable elements;
						return;
					}
					__toggle_elementsState(ctr, slot, isActive);
				};
				
			
				function __toggle_slotState(ctr, slot, isActive) {
					var slots = ctr.slots;
					if (slots == null || slots.hasOwnProperty(slot) === false) {
						return;
					}
					var disabled = slots.__disabled;
					if (disabled == null) {
						disabled = slots.__disabled = {};
					}
					disabled[slot] = isActive === false;
				}
			
				function __toggle_slotStateWithChilds(ctr, slot, isActive) {
					__toggle_slotState(ctr, slot, isActive);
					
					var compos = ctr.components;
					if (compos != null) {
						var imax = compos.length,
							i = 0;
						for(; i < imax; i++) {
							__toggle_slotStateWithChilds(compos[i], slot, isActive);
						}
					}
				}
			
				function __toggle_elementsState(ctr, slot, isActive) {
					if (ctr.$ == null) {
						log_warn('Controller has no elements to toggle state');
						return;
					}
			
					domLib() 
						.add(ctr.$.filter('[data-signals]')) 
						.add(ctr.$.find('[data-signals]')) 
						.each(function(index, node) {
							var signals = node.getAttribute('data-signals');
				
							if (signals != null && signals.indexOf(slot) !== -1) {
								node[isActive === true ? 'removeAttribute' : 'setAttribute']('disabled', 'disabled');
							}
						});
				}
			
				
			
			}());
			// end:source ./toggle.js
			// source ./attributes.js
			(function(){
				
				_create('signal');
				
				_createEvent('change');
				_createEvent('click');
				_createEvent('tap', 'click');
			
				_createEvent('keypress');
				_createEvent('keydown');
				_createEvent('keyup');
				_createEvent('mousedown');
				_createEvent('mouseup');
				
				_createEvent('press', 'keydown');
				_createEvent('shortcut', 'keydown');
				
				function _createEvent(name, type) {
					_create(name, type || name);
				}
				function _create(name, asEvent) {
					mask.registerAttrHandler('x-' + name, 'client', function(node, attrValue, model, ctx, el, ctr){
						_attachListener(el, ctr, attrValue, asEvent);
					});
				}
				
				function _attachListener(el, ctr, definition, asEvent) {
					var arr = definition.split(';'),
						signals = '',
						imax = arr.length,
						i = -1,
						x;
					
					var i_colon,
						i_param,
						event,
						mix,
						param,
						name,
						fn;
						
					while ( ++i < imax ) {
						x = arr[i].trim();
						if (x === '') 
							continue;
						
						mix = param = name = null;
						
						i_colon = x.indexOf(':');
						if (i_colon !== -1) {
							mix = x.substring(0, i_colon);
							i_param = mix.indexOf('(');
							if (i_param !== -1) {
								param = mix.substring(i_param + 1, mix.lastIndexOf(')'));
								mix = mix.substring(0, i_param);
								
								// if DEBUG
								param === '' && log_error('Not valid signal parameter');
								// endif
							}
							x = x.substring(i_colon + 1).trim();
						}
						
						name = x;
						fn = _createListener(ctr, name);
						
						if (asEvent == null) {
							event = mix;
						} else {
							event = asEvent;
							param = mix;
						}
						
						if (!event) {
							log_error('Signal: Eventname is not set', arr[i]);
						}
						if (!fn) {
							log_warn('Slot not found:', name);
							continue;
						}
						
						signals += ',' + name + ',';
						dom_addEventListener(el, event, fn, param, ctr);
					}
					
					if (signals !== '') {
						var attr = el.getAttribute('data-signals');
						if (attr != null) {
							signals = attr + signals;
						}
						el.setAttribute('data-signals', signals);
					}
				}
				
				function _createListener (ctr, slot) {
					if (_hasSlot(ctr, slot, -1) === false) {
						return null;
					}
					return function(event) {
						var args = arguments.length > 1
							? _Array_slice.call(arguments, 1)
							: null;
						_fire(ctr, slot, event, args, -1);
					};
				}
			}());
			// end:source ./attributes.js
			
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
		// end:source /src/signal/exports.js
		
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
				},
				text: function(mix){
					if (arguments.length === 0) {
						return aggr('', this, function(txt, x){
							return txt + x.textContent;
						});
					}
					return each(this, function(x){
						x.textContent = mix;
					});
				},
				html: function(mix){
					if (arguments.length === 0) {
						return aggr('', this, function(txt, x){
							return txt + x.innerHTML;
						});
					}
					return each(this, function(x){
						x.innerHTML = mix;
					});
				},
				val: function(mix){
					if (arguments.length === 0) {
						return this.length === 0 ? null : this[0].value;
					}
					if (this.length !== 0) {
						this[0].value = mix;
					}
					return this;
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
			function aggr(seed, arr, fn, ctx) {
				each(arr, function(x, i){
					seed = fn.call(ctx || arr, seed, arr[i], i);
				});
				return seed;
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
				
				var compo = Anchor.resolveCompo(this[0], true);
		
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
					
					domLib.fn[method] = function(template, model, ctr, ctx){
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
						if (ctr == null) {
							ctr = index < 2
								? this.compo()
								: this.parent().compo()
								;
						}
						
						var isUnsafe = false;
						if (ctr == null) {
							ctr = {};
							isUnsafe = true;
						}
						
						
						if (ctr.components == null) {
							ctr.components = [];
						}
						
						var compos = ctr.components,
							i = compos.length,
							fragment = mask.render(template, model, ctx, null, ctr);
						
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
					else if (c === 58 /*:*/ && selector.charCodeAt(index + 1) === 58) {
						index += 2;
						var start = index, name, expr;
						do {
							c = selector.charCodeAt(index);
						} while (c >= 97 /*a*/ && c <= 122 /*z*/ && ++index < length);
						
						name = selector.substring(start, index);
						if (c === 40 /*(*/) {
							start = ++index;
							do {
								c = selector.charCodeAt(index);
							} while (c !== 41/*)*/ && ++index < length);
							expr = selector.substring(start, index);
							index++;
						}
						var pseudo = PseudoSelectors(name, expr);
						if (matcher == null) {
							matcher = {
								selector: '*',
								nextKey: nextKey
							};
						}
						if (root == null) {
							root = matcher;
						}
						if (matcher.filters == null) {
							matcher.filters = [];
						}
						matcher.filters.push(pseudo);
						continue;
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
				
				var obj = selector.prop ? node[selector.prop] : node,
					matched = false;
			
				if (obj == null) 
					return false;
				if (selector.selector === '*') {
					matched = true
				}
				else if (typeof selector.selector === 'function') {
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
						
						if (typeof x === 'function') {
							matched = x(node, type);
							if (matched === false) 
								return false;
							continue;
						}
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
			
			var PseudoSelectors;
			(function() {
				PseudoSelectors = function(name, expr) {
					var fn = Fns[name];
					if (fn !== void 0) 
						return fn;
					
					var worker = Workers[name];
					if (worker !== void 0) 
						return worker(expr);
					
					throw new Error('Uknown pseudo selector:' + name);
				};		
				var Fns = {
					text: function (node) {
						return node.type === Dom.TEXTNODE;
					},
					node: function(node) {
						return node.type === Dom.NODE;
					}
				};
				var Workers = {
					not: function(expr){
						return function(node, type){
							return !selector_match(node, expr, type);
						}
					}
				};
			}());
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
				return _Array_slice.call(this);
			},
			/**
			 *	render([model, cntx, container]) -> HTMLNode
			 * - model (Object)
			 * - cntx (Object)
			 * - container (Object)
			 * - returns (HTMLNode)
			 *
			 **/
			render: function(model, ctx, el, ctr) {
				this.components = [];
		
				if (this.length === 1) {
					return _mask_render(this[0], model, ctx, el, ctr || this);
				}
		
				if (el == null) {
					el = document.createDocumentFragment();
				}
		
				for (var i = 0, length = this.length; i < length; i++) {
					_mask_render(this[i], model, ctx, el, ctr || this);
				}
				return el;
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
				if (arguments.length !== 0) {
					return this.empty().append(template);
				}
				return mask.stringify(this);
			},
		
			text: function(mix, ctx, ctr){
				if (typeof mix === 'string' && arguments.length === 1) {
					var node = [ new Dom.TextNode(mix) ];
		
					for(var i = 0, imax = this.length; i < imax; i++){
						this[i].nodes = node;
					}
					return this;
				}
		
				var str = '';
				for(var i = 0, imax = this.length; i < imax; i++){
					str += jmask_getText(this[i], mix, ctx, ctr);
				}
				return str;
			}
		};
		
		arr_each(['append', 'prepend'], function(method) {
		
			Proto[method] = function(mix) {
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
		
			Proto[method] = function(mix, model, cntx, controller) {
		
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
		obj_extend(Proto, {
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
			Proto[method] = function(){
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
		obj_extend(Proto, {
			each: function(fn, ctx) {
				for (var i = 0; i < this.length; i++) {
					fn.call(ctx || this, this[i], i)
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
		
			Proto[method] = function(selector) {
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
	
	
		jMask.prototype.fn = jMask.prototype;
		return jMask;
	
	}(Mask));
	
	// end:source /ref-mask-j/lib/jmask.embed.js
	// source /ref-mask-binding/lib/binding_embed_node
	
	
	
	(function(mask, Compo){
		
		// source vars
		var __Compo = typeof Compo !== 'undefined' ? Compo : (mask.Compo || global.Compo),
		    __dom_addEventListener = __Compo.Dom.addEventListener,
		    __registerHandler = mask.registerHandler,
		    __registerAttr = mask.registerAttrHandler,
		    __registerUtil = mask.registerUtil,
		    
			domLib = __Compo.config.getDOMLibrary();
			
		
		// end:source vars
		// source utils/
		// source object
		
		// end:source object
		// source object_observe
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
						var oldVal = currentVal;
						
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
						
						obj_sub_notifyListeners(obj, property, oldVal)
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
			function obj_sub_notifyListeners(obj, path, oldVal) {
				var obs = obj[prop_OBS];
				if (obs == null) 
					return;
				for(var prop in obs) {
					if (prop.indexOf(path + '.') !== 0) 
						continue;
					
					var cbs = obs[prop].slice(0),
						imax = cbs.length,
						i = 0, oldProp, cb;
					if (imax === 0) 
						continue;
					
					var val = obj_getProperty(obj, prop);
					for (i = 0; i < imax; i++) {
						cb = cbs[i];
						obj_removeObserver(obj, prop, cb);
						
						if (oldVal != null && typeof oldVal === 'object') {
							oldProp = prop.substring(path.length + 1);
							obj_removeObserver(oldVal, oldProp, cb);
						}
					}
					for (i = 0; i < imax; i++){
						cbs[i](val);
					}
					for (i = 0; i < imax; i++){
						obj_addObserver(obj, prop, cbs[i]);
					}
				}
			}
			
			function obj_crumbRebindDelegate(obj) {
				return function(path, oldValue){
					obj_crumbRebind(obj, path, oldValue);
				};
			}
			function obj_crumbRebind(obj, path, oldValue) {
				var obs = obj[prop_OBS];
				if (obs == null) 
					return;
				
				for (var prop in obs) {
					if (prop.indexOf(path) !== 0) 
						continue;
					
					var cbs = obs[prop].slice(0),
						imax = cbs.length,
						i = 0;
					
					if (imax === 0) 
						continue;
					
					var val = obj_getProperty(obj, prop),
						cb, oldProp;
					
					for (i = 0; i < imax; i++) {
						cb = cbs[i];
						obj_removeObserver(obj, prop, cb);
						
						if (oldValue != null && typeof oldValue === 'object') {
							oldProp = prop.substring(path.length);
							obj_removeObserver(oldValue, oldProp, cb);
						}
					}
					for (i = 0; i < imax; i++){
						cbs[i](val);
					}
					
					for (i = 0; i < imax; i++){
						obj_addObserver(obj, prop, cbs[i]);
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
		// end:source object_observe
		// source date
		var date_ensure;
		(function(){
			date_ensure = function(val){
				if (val == null || val === '') 
					return null;
				
				var date = val;
				var type = typeof val;
				if (type === 'string') {
					date = new Date(val);
					
					if (rgx_es5Date.test(date) && val.indexOf('Z') === -1) {
						// adjust to local time (http://es5.github.io/x15.9.html#x15.9.1.15)
						val.setMinutes(val.getTimezoneOffset());
					}
				}
				if (type === 'number') {
					date = new Date(val);
				}
				
				return isNaN(date) === false && typeof date.getFullYear === 'function'
					? date
					: null
					;
			};
			
			var rgx_es5Date = /^\d{4}\-\d{2}/;
		}());
		// end:source date
		// source dom
		
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
		
		
		
		
		// end:source dom
		// source compo
		var compo_fragmentInsert,
			compo_render,
			compo_dispose,
			compo_inserted,
			compo_attachDisposer,
			compo_trav_children
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
		
			compo_trav_children = function(compo, compoName){
				var out = [],
					arr = compo.components || [],
					imax = arr.length,
					i = -1;
				
				while ( ++i < imax ){
					if (arr[i].compoName === compoName) {
						out.push(arr[i]);
					}
				}
				return out;
			};
		}());
		// end:source compo
		// source expression
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
					if (first === '$c' || first === '$') {
						if (parts[1] === 'attr') {
							return;
						}
						// Controller Observer
						var owner  = _getObservable_Controller(ctr, parts.slice(1), imax - 1);
						var cutIdx = first.length + 1;
						mutatorFn(owner, property.substring(cutIdx), callback);
						return;
					}
					if (first === '$scope') {
						// Controller Observer
						var scope = _getObservable_Scope(ctr, parts[1]);
						var cutIdx = 6 + 1;
						mutatorFn(scope, property.substring(cutIdx), callback);
						return;
					}
					if ('$a' === first || '$ctx' === first || '_' === first || '$u' === first) 
						return;
				}
				
				var obj = null;
				if (_isDefined(model, parts, imax)) {
					obj = model;
				}
				if (obj == null) {
					obj = _getObservable_Scope(ctr, parts[0], imax);
				}
				if (obj == null) {
					obj = model;
				}
				
				mutatorFn(obj, property, callback);
			}
			
			function _getObservable_Scope_(ctr, parts, imax){
				var scope;
				while(ctr != null){
					scope = ctr.scope;
					if (scope != null && _isDefined(scope, parts, imax)) 
						return scope;
					
					ctr = ctr.parent;
				}
				return null;
			}
			function _getObservable_Controller(ctr_, parts, imax) {
				var ctr = ctr_;
				while(ctr != null){
					if (_isDefined(ctr, parts, imax)) 
						return ctr;
					ctr = ctr.parent;
				}
				return ctr;
			}
			function _getObservable_Scope(ctr_, property, imax) {
				var ctr = ctr_, scope;
				while(ctr != null){
					scope = ctr.scope;
					if (scope != null && scope[property] != null) {
						return scope;
					}
					ctr = ctr.parent;
				}
				return null;
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
		
		
		
		// end:source expression
		// source signal
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
		
		// end:source signal
		// end:source utils/
		
		// source DomObjectTransport
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
				},
				RADIO: {
					domWay: {
						get: function(provider){
							var el = provider.element;
							return el.checked ? el.value : null;
						},
						set: function(provider, value){
							var el = provider.element;
							el.checked = el.value === value;
						}
					},
				}
				
			};
			
			function isValidFn_(obj, prop, name) {
				if (obj== null || typeof obj[prop] !== 'function') {
					log_error('BindingProvider. Controllers accessor.', name, 'should be a function. Property:', prop);
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
		
		// end:source DomObjectTransport
		// source ValidatorProvider
		var ValidatorProvider,
			Validators;
		(function() {
			var class_INVALID = '-validate__invalid';
			
			ValidatorProvider = {
				getFnFromModel: fn_fromModelWrapp,
				getFnByName: fn_byName,
				validate: validate,
				validateUi: function(fns, val, ctr, el, oncancel) {
					var error = validate(fns, val, ctr);
					if (error != null) {
						ui_notifyInvalid(el, error, oncancel);
						return error;
					}
					ui_clearInvalid(el);
					return null;
				}
			};
			
			function validate(fns, val, ctr) {
				if (fns == null) {
					return null;
				}
				var imax = fns.length,
					i = -1,
					error, fn;
				while ( ++i < imax ){
					fn = fns[i];
					if (fn == null) {
						continue;
					}
					error = fn(val, ctr);
					if (error != null) {
						if (is_String(error)) {
							return {
								message: error,
								actual: val
							};
						}
						if (error.actual == null) {
							error.actual = val;
						}
						return error;
					}
				}
			}
			
			function fn_fromModel(model, prop) {
				if (is_Object(model) === false) {
					return null;
				}
				var Validate = model.Validate;
				if (Validate != null) {
					var fn = null;
					if (is_Function(fn = Validate)) {
						return fn;
					}
					if (is_Function(fn = Validate[prop])) {
						return fn;
					}
				}
				
				var i = prop.indexOf('.');
				if (i !== -1) {
					return fn_fromModel(
						model[prop.substring(0, i)], prop.substring(i+1)
					);
				}
				return null;
			}
			function fn_fromModelWrapp(model, prop) {
				var fn = fn_fromModel(model, prop);
				if (fn == null) {
					return null;
				}
				return function(){
					var mix = fn.apply(model, arguments),
						message, error;
					if (mix == null) {
						return null;
					}
					if (is_String(mix)) {
						return {
							message: mix,
							property: prop,
							ctx: model
						};
					}
					mix.property = prop;
					mix.ctx = model;
					return mix;
				};
			}
			
			function fn_byName(name, param, message) {
				var Delegate = Validators[name];
				if (Delegate == null) {
					log_error('Invalid validator', name, 'Supports:', Object.keys(Validators));
					return null;
				}
				var fn = Delegate(param);
				return function(val, ctr){
					var mix = fn(val, ctr);
					if (mix == null || mix === true) {
						return null;
					}
					if (mix === false) {
						return message || ('Check failed: `' + name + '`');
					}
					if (is_String(mix) && mix.length !== 0) {
						return mix;
					}
					return null;
				};
			}
			
			function ui_notifyInvalid(el, error, oncancel) {
				
				var message = error.message || error;
				var next = domLib(el).next('.' + class_INVALID);
				if (next.length === 0) {
					next = domLib('<div>')
						.addClass(class_INVALID)
						.html('<span></span><button>&otimes;</button>')
						.insertAfter(el);
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
		
			function ui_clearInvalid(el) {
				return domLib(el).next('.' + class_INVALID).hide();
			}
			
			Validators = {
				match: function (match) {		
					return function (str){
						return new RegExp(match).test(str);
					};
				},
				unmatch: function (unmatch) {
					return function (str){
						return !(new RegExp(unmatch).test(str));
					};
				},
				minLength: function (min) {
					return function (str){
						return str.length >= parseInt(min, 10);
					};
				},
				maxLength: function (max) {
					return function (str){
						return str.length <= parseInt(max, 10);
					};
				},
				check: function (condition, node){
					return function (str){
						return expression_eval('x' + condition, node.model, {x: str}, node);
					};
				}
			};
		}());
		// end:source ValidatorProvider
		// source BindingProvider
		var CustomProviders,
			BindingProvider;
		(function() {
			CustomProviders = {};
			
			BindingProvider = class_create({
				validations: null,
				constructor: function BindingProvider(model, element, ctr, bindingType) {
					if (bindingType == null) {
						bindingType = 'dual';
						
						var name = ctr.compoName;
						if (name === ':bind' || name === 'bind') {
							bindingType = 'single';
						}
					}
					
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
								else if ('date' === type) {
									var x = DomObjectTransport.DATE;
									this.domWay = x.domWay;
									this.objectWay = x.objectWay;
								}
								else if ('number' === type) {
									this['typeof'] = 'Number';
								}
								else if ('radio' === type) {
									var x = DomObjectTransport.RADIO;
									this.domWay = x.domWay;
									break;
								}
								
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
				},
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
					
					var error = this.validate(value);
					if (error == null) {
						this.dismiss = 1;
						this.objectWay.set(this.model, this.value, value, this);
						this.dismiss = 0;
		
						if (this.log) {
							console.log('[BindingProvider] domChanged -', value);
						}
						if (this.signal_domChanged != null) {
							signal_emitOut(this.ctr, this.signal_domChanged, [value]);
						}
						if (this.pipe_domChanged != null) {
							var pipe = this.pipe_domChanged;
							__Compo.pipe(pipe.pipe).emit(pipe.signal);
						}	
					}
					this.locked = false;
				},
				addValidation: function(mix){
					if (this.validations == null) {
						this.validations = [];
					}
					if (is_Array(mix)) {
						this.validations = this.validations.concat(mix);
						return;
					}
					this.validations.push(mix);
				},
				validate: function (val) {
					var fns = this.validations,
						ctr = this.ctr,
						el = this.element;
						
					return ValidatorProvider.validateUi(
						fns, val, ctr, el, this.objectChanged.bind(this)
					);
				},
				objectWay: DomObjectTransport.objectWay,
				domWay: DomObjectTransport.domWay,
			});
				
			
			obj_extend(BindingProvider, {
				create: function (model, el, ctr, bindingType) {
			
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
				},
				
				bind: function (provider){
					return apply_bind(provider);
				}
			});
			
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
		
		// end:source BindingProvider
		
		// source handlers/
		// source visible
		/**
		 * visible handler. Used to bind directly to display:X/none
		 *
		 * attr =
		 *    check - expression to evaluate
		 *    bind - listen for a property change
		 */
		
		function VisibleHandler() {}
		
		__registerHandler(':visible', VisibleHandler);
		
		
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
		
		// end:source visible
		// source validate
		var ValidationCompo;
		(function() {	
			var class_INVALID = '-validate-invalid';
		
			ValidationCompo = class_create({
		        attr: null,
				element: null,
				validators: null,
				
				constructor: function(){
					this.validators = [];
				},
				renderStart: function(model, ctx, container) {
					this.element = container;
					
					var prop = this.attr.value;
					if (prop) {
						var fn = ValidatorProvider.getFnFromModel(model, prop);
						if (fn != null) {
							this.validators.push(fn);
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
				validate: function(val, el, oncancel) {
					var element = el == null ? this.element : el,
						value   = val;
					if (arguments.length === 0) {
						value = obj_getProperty(this.model, this.attr.value);
					}
					if (this.validators.length === 0) {
						this.initValidators();
					}
					var fns = this.validators,
						type = this.attr.silent ? 'validate' : 'validateUi'
						;
					
					return ValidatorProvider[type](
						fns, value, this, element, oncancel
					);
				},
				initValidators: function() {
					var attr = this.attr,
						message = this.attr.message,
						isDefault = message == null
					
					if (isDefault) {
						message = 'Invalid value of `' + this.attr.value + '`';
					}
					for (var key in attr) {				
						switch (key) {
							case 'message':
							case 'value':
							case 'getter':
							case 'silent':
								continue;
						}				
						if (key in Validators === false) {
							log_error('Unknown Validator:', key, this);
							continue;
						}
						var str = isDefault ? (message + ' Validation: `' + key + '`') : message 
						var fn = ValidatorProvider.getFnByName(key, attr[key], str);
						if (fn != null) {
							this.validators.push(fn);
						}
					}
				}
			});
			
			__registerHandler(':validate', ValidationCompo);
			
			__registerHandler(':validate:message', Compo({
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
			
		}());
		
		// end:source validate
		// source validate_group
		function ValidateGroup() {}
		
		__registerHandler(':validate:group', ValidateGroup);
		
		
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
		
		// end:source validate_group
		
		// if NODE
		// source bind_node
		
		(function() {
		
			function Bind() {}
		
			__registerHandler(':bind', Bind);
			__registerHandler( 'bind', Bind);
		
			Bind.prototype = {
				constructor: Bind,
				renderStart: function(model, cntx, container){
					
					this.provider = BindingProvider.create(model, container, this, 'single');
					this.provider.objectChanged();
				}
			};
		
		
		}());
		// end:source bind_node
		// source dualbind_node
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
		
		__registerHandler(':dualbind', DualbindHandler);
		__registerHandler( 'dualbind', DualbindHandler);
		
		
		
		DualbindHandler.prototype = {
			constructor: DualbindHandler,
			
			renderStart: function(model, ctx, container) {
				this.provider = BindingProvider.create(model, container, this);
				this.provider.objectChanged();
			},
			dispose: function(){
				var provider = this.provider,
					dispose = provider && provider.dispose;
				if (typeof dispose === 'function') {
					dispose.call(provider);
				}
			},
			
			handlers: {
				attr: {
					'x-signal' : function(){}
				}
			}
		};
		
		// end:source dualbind_node
		// endif
		
		
		// end:source handlers/
		// source utilities/
		// source bind
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
		
			__registerUtil('bind', {
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
		
		// end:source bind
		// end:source utilities/
		// source attributes/
		// source xxVisible
		
		
		__registerAttr('xx-visible', function(node, attrValue, model, cntx, element, controller) {
			
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
		// end:source xxVisible
		// source xToggle
		/**
		 *	Toggle value with ternary operator on an event.
		 *
		 *	button x-toggle='click: foo === "bar" ? "zet" : "bar" > 'Toggle'
		 */
		
		__registerAttr('x-toggle', 'client', function(node, attrValue, model, ctx, element, controller){
		    
		    
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
		
		// end:source xToggle
		// source xClassToggle
		/**
		 *	Toggle Class Name
		 *
		 *	button x-toggle='click: selected'
		 */
		
		__registerAttr('x-class-toggle', 'client', function(node, attrVal, model, ctx, element){
		    
		    var event = attrVal.substring(0, attrVal.indexOf(':')),
		        klass = attrVal.substring(event.length + 1).trim();
		    
			
		    __dom_addEventListener(element, event, function(){
		         domLib(element).toggleClass(klass);
		    });
		});
		
		// end:source xClassToggle
		// end:source attributes/
		// source statements/
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
				
				_renderPlaceholder = function(staticCompo, compo, container){
					var placeholder = staticCompo.placeholder;
					if (placeholder == null) {
						placeholder = document.createComment('');
						container.appendChild(placeholder);
					}
					compo.placeholder = placeholder;
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
				
				__registerHandler('+if', {
					placeholder: null,
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
						
						_renderPlaceholder(this, compo, container);
						
						return initialize(
							compo
							, this
							, index
							, els
							, model
							, ctx
							, container
							, ctr
						);
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
					if (index != null) {
						compo.Switch[index].elements = elements;
					}
					return compo;
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
				
				__registerHandler('+switch', {
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
						
						_renderPlaceholder(this, compo, container);
						
						return initialize(
							compo
							, this
							, index
							, els
							, model
							, ctx
							, container
							, ctr
						);
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
					
					if (index != null) {
						compo.Switch[index] = elements;
					}
					expression_bind(node.expression, model, ctx, ctr, compo.binder);
					
					return compo;
				}
			
				
			}());
			// end:source 3.switch.js
			// source 4.with.js
			(function(){
				
				var $With = custom_Statements['with'];
					
				__registerHandler('+with', {
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
						
						_renderPlaceholder(this, compo, container);
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
					
				__registerHandler('+visible', {
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
						
					
					__registerHandler('+for', {
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
							_renderPlaceholder(this, compo, container);			
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
					var EachBinded =  {
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
							
							_renderPlaceholder(this, compo, container);
							_compo_initAndBind(compo, this, model, ctx, container, ctr);
							return compo;
						}
						
					};
					
					var EachItem = class_create({
						compoName: 'each::item',
						scope: null,
						model: null,
						modelRef: null,
						parent: null,
						// if NODE
						renderStart: function(){
							var expr = this.parent.expression;
							this.modelRef = ''
								+ (expr === '.' ? '' : ('(' + expr + ')'))
								+ '."'
								+ this.scope.index
								+ '"';
						},
						// endif
				
						renderEnd: function(els) {
							this.elements = els;
						},
						dispose: function(){
							if (this.elements != null) {
								this.elements.length = 0;
								this.elements = null;
							}
						}
					});
					
					var EachStatement = class_create({
						constructor: function EachStatement(node, attr) {
							this.expression = node.expression;
							this.nodes = node.nodes;
							
							if (node.components == null) 
								node.components = [];
							
							this.node = node;
							this.components = node.components;
						},
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
					});
					
					// METHODS
					
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
					
					// EXPORTS
					
					__registerHandler('each::item', EachItem);
					__registerHandler('+each', EachBinded);
				}());
				// end:source each.js
				
			}());
			
			// end:source loop/exports.js
			
		}());
		// end:source statements/
		
		// source exports
		obj_extend(mask, {
			Validators: Validators,
			registerValidator: function(type, fn) {
				Validators[type] = fn;
			},
			BindingProviders: CustomProviders,
			registerBinding: function(name, Prov) {
				CustomProviders[name] = Prov;
			}
		});
		
		// end:source exports
		
	}(Mask, Compo));
	
	// end:source /ref-mask-binding/lib/binding_embed_node
	
	
	// source /ref-mask/src/handlers/
	// source debug
	(function(){
		custom_Statements['log'] = {
			render: function(node, model, ctx, container, controller){
				var arr = expression_evalStatements(node.expression, model, ctx, controller);
				arr.unshift('Mask::Log');
				console.log.apply(console, arr);
			}
		};
		customTag_register('debugger', {
			render: function(model, ctx, container, compo){
				debugger;
			}
		});
		customTag_register(':utest', Compo({
			render: function (model, ctx, container) {
				if (container.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
					container = container.childNodes;
				this.$ = $(container);
			}
		}));
	}());
	// end:source debug
	// source define
	custom_Tags['define'] = class_create({
		meta: {
			serializeNodes: true
		},
		constructor: function(node, model, ctx, el, ctr) {
			Define.registerGlobal(node, model, ctr);
		},
		render: fn_doNothing
	});
	
	custom_Tags['let'] = class_create({
		meta: {
			serializeNodes: true
		},
		constructor: function(node, model, ctx, el, ctr) {
			Define.registerScoped(node, model, ctr);
		},
		render: fn_doNothing
	});
	// end:source define
	// source html
	(function() {
		Mask.registerHandler(':html', {
			meta: {
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
						child;
					div.innerHTML = this.html;
					child = div.firstChild;
					while (child != null) {
						container.appendChild(child);
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
	
	// end:source html
	// source methods
	(function() {
		var Method = class_create({
			meta: {
				serializeNodes: true
			},
			constructor: function(node) {
				this.fn = node.fn; // || compileFn(node.args, node.body);
				this.name = node.name;
			}
		});
		
		custom_Tags['slot'] = class_create(Method, {
			renderEnd: function(){
				var ctr = this.parent;
				var slots = ctr.slots;
				if (slots == null) {
					slots = ctr.slots = {};
				}
				slots[this.name] = this.fn;
			}
		});
		custom_Tags['event'] = class_create(Method, {
			renderEnd: function(els, model, ctx, el){
				this.fn = this.fn.bind(this.parent);
				Compo.Dom.addEventListener(el, this.name, this.fn);
			}
		});
		custom_Tags['function'] = class_create(Method, {
			renderEnd: function(){
				this.parent[this.name] = this.fn;
			}
		});
	}());
	// end:source methods
	// source template
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
		customTag_register(':template', {
			render: function() {
				helper_.register(this.attr.id, this.nodes);
			}
		});
	
		customTag_register(':import', {
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
	// end:source template
	// source var
	(function(){
		// TODO: refactor methods, use MaskNode Serialization instead Model Serialization
		custom_Tags['var'] = class_create(customTag_Base, {
			renderStart: function(model, ctx){
				set(this, this.attr, true, model, ctx);
			},
			onRenderStartClient: function(){
				set(this, this.model, false)
			}
		});
	
		function set(self, source, doEval, attr, model, ctx) {
			// set data also to model, so that it will be serialized in NodeJS
			self.model = {};
			
			var parent = self.parent;
			var scope  = parent.scope;
			if (scope == null) {
				scope = parent.scope = {};
			}
			for(var key in source){
				self.model[key] = scope[key] = doEval === false
					? source[key]
					: expression_eval(source[key], model, ctx, parent);
			}
		}
	}());
	// end:source var
	// end:source /ref-mask/src/handlers/
	// source handlers/document
	custom_Tags[':document'] = class_create({
		isDocument: true,
		meta: {
			mode: mode_SERVER
		},
		render: function(model, ctx, fragment, ctr) {
	
			var attr = this.attr,
				nodes = this.nodes,
				doctype = 'html',
				
				head, body, handleBody;
	
			if (attr.doctype) {
				doctype = attr.doctype;
				attr.doctype = null;
			}
			
			fragment.appendChild(new HtmlDom.DOCTYPE('<!DOCTYPE ' + doctype + '>'));
	
			var html = {
				tagName: 'html',
				type: Dom.NODE,
				attr: attr,
				nodes: [],
			};
			
			if (nodes != null) {
				var imax = nodes.length,
					i = -1, x;
				while (++i < imax) {
					x = nodes[i];
					
					if (x.tagName === 'head') {
						head = x;
						continue;
					}
					if (x.tagName === 'body') {
						body = x;
						continue;
					}
					handleBody = true;
				}
			}
			
			if (body == null) {
				body = {
					nodeType: Dom.NODE,
					tagName: 'body',
					nodes: []
				};
			}
	
			head != null && html.nodes.push(head);
			body != null && html.nodes.push(body);
	
			if (handleBody) {
				var imax = nodes.length,
					i = 0, x;
				for(; i < imax; i++) {
					x = nodes[i];
					if ('head' === x.tagName) 
						continue;
					if ('body' === x.tagName) 
						continue;
					
					body.nodes.push(x);
				}
			}
	
	
			var owner = this.parent;
			owner.components = [];
			builder_build(html, model, ctx, fragment, owner);
			return fragment;
		}
	});
	
	// end:source handlers/document


// source /ref-mask/src/umd-footer
	Mask.Compo = Compo;
	Mask.jmask = jmask;
	
	Mask.version = '0.12.21';
	
	//> make fast properties
	custom_optimize();
	
	return (exports.mask = Mask);
}));
// end:source /ref-mask/src/umd-footer
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

	
	
	

module.exports = this;
	
}.call({}, typeof global !== 'undefined' ? global : window));