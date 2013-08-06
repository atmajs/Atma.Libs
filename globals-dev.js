(function(globals){
	
	
	(function(root, factory){
	"use strict";

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
	
	
	factory(_global, _exports);
	
}(this, function(global, exports){
	"use strict";
	
	var _Array_slice = Array.prototype.slice,
		_Array_sort = Array.prototype.sort;
	
	// source ../src/util/array.js
	function arr_each(array, callback) {
		
		if (arr_isArray(array)) {
			for (var i = 0, imax = array.length; i < imax; i++){
				callback(array[i], i);
			}
			return;
		}
		
		callback(array);
	}
	
	function arr_isArray(array) {
		return array != null
			&& typeof array === 'object'
			&& typeof array.length === 'number'
			&& typeof array.splice === 'function';
	}
	
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
	// source ../src/util/proto.js
	
	
	var class_inherit = (function() {
		
		var PROTO = '__proto__';
		
		function proto_extend(proto, source) {
			if (source == null) {
				return;
			}
			if (typeof proto === 'function') {
				proto = proto.prototype;
			}
		
			if (typeof source === 'function') {
				source = source.prototype;
			}
			
			for (var key in source) {
				proto[key] = source[key];
			}
		}
		
		var _toString = Object.prototype.toString,
			_isArguments = function(args){
				return _toString.call(args) === '[object Arguments]';
			};
		
		
		function proto_override(proto, key, fn) {
	        var __super = proto[key],
				__proxy = __super == null
					? function() {}
					: function(args){
					
						if (_isArguments(args)) {
							return __super.apply(this, args);
						}
						
						return __super.apply(this, arguments);
					};
	        
	        return function(){
	            this.super = __proxy;
	            
	            return fn.apply(this, arguments);
	        };
	    }
	
		function inherit(_class, _base, _extends, original, _overrides) {
			
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
	
			if (_base != null) {
				proto[PROTO] = _base.prototype;
			}
	
			
			if (_overrides != null) {
				for (var key in _overrides) {
					prototype[key] = proto_override(prototype, key, _overrides[key]);
				}
			}
			
			_class.prototype = prototype;
		}
	
	
		// browser that doesnt support __proto__ 
		function inherit_protoLess(_class, _base, _extends, original) {
			if (_base != null) {
				var tmp = function() {};
	
				tmp.prototype = _base.prototype;
	
				_class.prototype = new tmp();
				_class.prototype.constructor = _class;
			}
	
			proto_extend(_class.prototype, original);
	
	
			if (_extends != null) {
				arr_each(_extends, function(x) {
					var a = {};
					proto_extend(a, x);
					
					delete a.constructor;
					for (var key in a) {
						_class.prototype[key] = a[key];
					}
				});
			}
		}
	
		return '__proto__' in Object.prototype === true ? inherit : inherit_protoLess;
	
	}());
	
	function proto_getProto(mix) {
		if (typeof mix === 'function') {
			return mix.prototype;
		}
		return mix;
	}
	
	var class_inheritStatics = function(_class, mix){
		if (mix == null) {
			return;
		}
		
		if (typeof mix === 'function') {
			for (var key in mix) {
				if (typeof mix[key] === 'function' && mix.hasOwnProperty(key) && _class[key] == null) {
					_class[key] = mix[key];
				}
			}
			return;
		}
		
		if (Array.isArray(mix)) {
			var imax = mix.length,
				i = 0;
			
			// backwards for proper inhertance flow
			while (imax-- !== 0) {
				class_inheritStatics(_class, mix[i++]);
			}
			return;
		}
		
		if (mix.Static) {
			mix = mix.Static;
			for (var key in mix) {
				if (mix.hasOwnProperty(key) && _class[key] == null) {
					_class[key] = mix[key];
				}
			}
			return;
		}
	};
	
	function class_extendProtoObjects(proto, _base, _extends){
		var key,
			protoValue;
			
		for (key in proto) {
			protoValue = proto[key];
			
			if (!obj_isRawObject(protoValue))
				continue;
			
			if (_base != null){
				if (obj_isRawObject(_base.prototype[key])) 
					obj_defaults(protoValue, _base.prototype[key]);
			}
			
			if (_extends != null) {
				arr_each(_extends, function(x){
					x = proto_getProto(x);
					
					if (obj_isRawObject(x[key])) 
						obj_defaults(protoValue, x[key]);
				});
			}
		}
	}
	// source ../src/util/object.js
	function obj_inherit(target /* source, ..*/ ) {
		if (typeof target === 'function') {
			target = target.prototype;
		}
		var i = 1,
			imax = arguments.length,
			source, key;
		for (; i < imax; i++) {
	
			source = typeof arguments[i] === 'function' ? arguments[i].prototype : arguments[i];
	
			for (key in source) {
				
				if ('Static' === key) {
					if (target.Static != null) {
						
						for (key in target.Static) {
							target.Static[key] = target.Static[key];
						}
						
						continue;
					}
				}
				
				target[key] = source[key];
			}
		}
		return target;
	}
	
	 function obj_getProperty(o, chain) {
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
			if (value == null) 
				return value;
			
		}
		return value;
	}
	
	function obj_isRawObject(value) {
		if (value == null) 
			return false;
		
		if (typeof value !== 'object')
			return false;
		
		return value.constructor === Object;
	}
	
	function obj_defaults(value, _defaults) {
		for (var key in _defaults) {
			if (value[key] == null) {
				value[key] = _defaults[key];
			}
		}
		return value;
	}
	
	function obj_extend(target, source) {
		for (var key in source) {
			if (source[key]) 
				target[key] = source[key];
			
		}
		return target;
	}
	
	
	var JSONHelper = {
		toJSON: function(){
			var obj = {},
				key, value;
			
			for (key in this) {
				
				// _ (private)
				if (key.charCodeAt(0) === 95)
					continue;
				
				if ('Static' === key || 'Validate' === key)
					continue;
				
				value = this[key];
				
				if (value == null)
					continue;
				
				if (typeof value === 'function')
					continue;
				
				
				obj[key] = value;
				
			}
			
			return obj;
		}
	};
	
	// source ../src/util/function.js
	function fn_proxy(fn, cntx) {
	
		return function() {
			switch (arguments.length) {
				case 1:
					return fn.call(cntx, arguments[0]);
				case 2:
					return fn.call(cntx,
						arguments[0],
						arguments[1]);
				case 3:
					return fn.call(cntx,
						arguments[0],
						arguments[1],
						arguments[2]);
				case 4:
					return fn.call(cntx,
						arguments[0],
						arguments[1],
						arguments[2],
						arguments[3]);
				case 5:
					return fn.call(cntx,
						arguments[0],
						arguments[1],
						arguments[2],
						arguments[3],
						arguments[4]
						);
			};
			
			return fn.apply(cntx, arguments);
		};
	}
	
	// source ../src/xhr/XHR.js
	var XHR = {};
	
	arr_each(['get', 'del'], function(key){
		XHR[key] = function(path, sender){
			
			this.promise[key](path).then(function(error, response){
				
				if (error) {
					sender.onError(error, response);
					return;
				}
				
				sender.onSuccess(response);
			});
			
		};
	});
	
	arr_each(['post', 'put'], function(key){
		XHR[key] = function(path, data, cb){
			this.promise[key](path, data)
			
			.then(function(error, response){
				cb(error, response);
			});
		};
	});
	
	
	// source ../src/xhr/promise.js
	/*
	 *  Copyright 2012-2013 (c) Pierre Duquesne <stackp@online.fr>
	 *  Licensed under the New BSD License.
	 *  https://github.com/stackp/promisejs
	 */
	
	(function(exports) {
	
	    function bind(func, context) {
	        return function() {
	            return func.apply(context, arguments);
	        };
	    }
	
	    function Promise() {
	        this._callbacks = [];
	    }
	
	    Promise.prototype.then = function(func, context) {
	        var f = bind(func, context);
	        if (this._isdone) {
	            f(this.error, this.result);
	        } else {
	            this._callbacks.push(f);
	        }
	    };
	
	    Promise.prototype.done = function(error, result) {
	        this._isdone = true;
	        this.error = error;
	        this.result = result;
	        for (var i = 0; i < this._callbacks.length; i++) {
	            this._callbacks[i](error, result);
	        }
	        this._callbacks = [];
	    };
	
	    function join(funcs) {
	        var numfuncs = funcs.length;
	        var numdone = 0;
	        var p = new Promise();
	        var errors = [];
	        var results = [];
	
	        function notifier(i) {
	            return function(error, result) {
	                numdone += 1;
	                errors[i] = error;
	                results[i] = result;
	                if (numdone === numfuncs) {
	                    p.done(errors, results);
	                }
	            };
	        }
	
	        for (var i = 0; i < numfuncs; i++) {
	            funcs[i]()
	                .then(notifier(i));
	        }
	
	        return p;
	    }
	
	    function chain(funcs, error, result) {
	        var p = new Promise();
	        if (funcs.length === 0) {
	            p.done(error, result);
	        } else {
	            funcs[0](error, result)
	                .then(function(res, err) {
	                funcs.splice(0, 1);
	                chain(funcs, res, err)
	                    .then(function(r, e) {
	                    p.done(r, e);
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
	        var p = new Promise();
	        var xhr, payload;
	        data = data || {};
	        headers = headers || {};
	
	        try {
	            xhr = new_xhr();
	        } catch (e) {
	            p.done(-1, "");
	            return p;
	        }
	
	        payload = _encode(data);
	        if (method === 'GET' && payload) {
	            url += '?' + payload;
	            payload = null;
	        }
	
	        xhr.open(method, url);
	        xhr.setRequestHeader('Content-type',
	            'application/x-www-form-urlencoded');
	        for (var h in headers) {
	            if (headers.hasOwnProperty(h)) {
	                xhr.setRequestHeader(h, headers[h]);
	            }
	        }
	
	        function onTimeout() {
	            xhr.abort();
	            p.done(exports.promise.ETIMEOUT, "");
	        };
	
	        var timeout = exports.promise.ajaxTimeout;
	        if (timeout) {
	            var tid = setTimeout(onTimeout, timeout);
	        }
	
	        xhr.onreadystatechange = function() {
	            if (timeout) {
	                clearTimeout(tid);
	            }
	            if (xhr.readyState === 4) {
	                if (xhr.status === 200) {
	                    p.done(null, xhr.responseText);
	                } else {
	                    p.done(xhr.status, xhr.responseText);
	                }
	            }
	        };
	
	        xhr.send(payload);
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
	
	        /* Error codes */
	        ENOXHR: 1,
	        ETIMEOUT: 2,
	
	        /**
	         * Configuration parameter: time in milliseconds after which a
	         * pending AJAX request is considered unresponsive and is
	         * aborted. Useful to deal with bad connectivity (e.g. on a
	         * mobile network). A 0 value disables AJAX timeouts.
	         *
	         * Aborted requests resolve the promise with a ETIMEOUT error
	         * code.
	         */
	        ajaxTimeout: 0
	    };
	
	    if (typeof define === 'function' && define.amd) {
	        /* AMD support */
	        define(function() {
	            return promise;
	        });
	    } else {
	        exports.promise = promise;
	    }
	
	
	})(XHR);
	
	// source ../src/business/Serializable.js
	function Serializable(data) {
		
		if (data == null || typeof data !== 'object')
			return;
		
		for (var key in data) {
			if (data[key] == null)
				continue;
			
			this[key] = data[key];
		}
		
	}
	
	Serializable.prototype = {
		constructor: Serializable,
		
		serialize: function() {
			return JSON.stringify(this);
		},
		
		deserialize: function(json) {
			
			if (typeof json === 'string') 
				json = JSON.parse(json);
			
			
			for (var key in json) 
				this[key] = json[key];
			
			return this;
		}
	};
	
	
	// source ../src/business/Route.js
	/**
	 *	var route = new Route('/user/:id');
	 *
	 *	route.create({id:5}) // -> '/user/5'
	 */
	var Route = (function(){
		
		
		function Route(route){
			this.route = route_parse(route);
		};
		
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
			
			console.error('Paths breadcrumbs should be match by regexps');
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
	// source ../src/business/Deferred.js
	var DeferredProto = {
		_isAsync: true,
			
		_done: null,
		_fail: null,
		_always: null,
		_resolved: null,
		_rejected: null,
		
		deferr: function(){
			this._rejected = null;
			this._resolved = null;
		},
		
		resolve: function() {
			this._fail = null;
			this._resolved = arguments;
	
			var cbs = this._done,
				imax = cbs && cbs.length,
				i = 0;
			if (cbs) {
				while (imax-- !== 0) {
					cbs[i++].apply(this, arguments);
				}
				this._done = null;
			}
	
			cbs = this._always;
			imax = cbs && cbs.length,
			i = 0;
			if (cbs) {
				while (imax-- !== 0) {
					cbs[i++].apply(this, this);
				}
				this._always = null;
			}
	
			return this;
		},
		reject: function() {
			this._done = null;
			this._rejected = arguments;
	
			var cbs = this._fail,
				imax = cbs && cbs.length,
				i = 0;
			if (cbs) {
				while (imax-- !== 0) {
					cbs[i++].apply(this, arguments);
				}
				this._fail = null;
			}
	
			cbs = this._always;
			imax = cbs && cbs.length,
			i = 0;
			if (cbs) {
				while (imax-- !== 0) {
					cbs[i++].apply(this, this);
				}
				this._always = null;
			}
	
			return this;
		},
	
		done: function(callback) {
			
			if (this._resolved != null)
				callback.apply(this, this._resolved);
			else
				(this._done || (this._done = [])).push(callback);
	
	
			return this;
		},
		fail: function(callback) {
			
			if (this._rejected != null)
				callback.apply(this, this._rejected);
			else
				(this._fail || (this._fail = [])).push(callback);
	
	
			return this;
		},
		always: function(callback) {
			if (this._rejected != null || this._resolved != null)
				callback.apply(this, this);
			else
				(this._always || (this._always = [])).push(callback);
	
			return this;
		},
	};
	// source ../src/business/EventEmitter.js
	var EventEmitter = (function(){
	 
		function Emitter() {
			this._listeners = {};
		}
	 
		
	    Emitter.prototype = {
	        constructor: Emitter,
			
	        on: function(event, callback) {
	            (this._listeners[event] || (this._listeners[event] = [])).push(callback);
	            return this;
	        },
	        once: function(event, callback){
	            callback._once = true;
	            (this._listeners[event] || (this._listeners[event] = [])).push(callback);
	            return this;
	        },
			
			pipe: function(event){
				var that = this,
					slice = Array.prototype.slice, 
					args;
				return function(){
					args = slice.call(arguments);
					args.unshift(event);
					that.trigger.apply(that, args);
				};
			},
	        
	        trigger: function() {
	            var args = Array.prototype.slice.call(arguments),
	                event = args.shift(),
	                fns = this._listeners[event],
	                fn, imax, i = 0;
	                
	            if (fns == null)
					return this;
				
				for (imax = fns.length; i < imax; i++) {
					fn = fns[i];
					fn.apply(this, args);
					
					if (fn._once === true){
						fns.splice(i,1);
						i--;
						length--;
					}
				}
			
	            return this;
	        },
	        off: function(event, callback) {
	            if (this._listeners[event] == null)
					return this;
					
				var arr = this._listeners[event],
					imax = arr.length,
					i = 0;
					
				for (; i < imax; i++) {
					
					if (arr[i] === callback) 
						arr.splice(i, 1);
					
					i--;
					length--;
				}
			
	            return this;
			}
	    };
	    
	    return Emitter;
	    
	}());
	
	// source ../src/business/Validation.js
	var Validation = (function(){
		
		
		function val_check(instance, validation) {
			if (typeof validation === 'function') 
				return validation.call(instance);
			
			var result;
			
			for (var property in validation) {
				
				result = val_checkProperty(instance, property, validation[property]);
				
				if (result)
					return result;
			}
		}
		
		
		function val_checkProperty(instance, property, checker) {
			var value = obj_getProperty(instance, property);
			
			return checker.call(instance, value);
		}
		
		
		function val_process(instance) {
			var result;
			
			
			if (instance.Validate != null) {
				result  = val_check(instance, instance.Validate);
				if (result)
					return result;
			}
			
			// @TODO Do nest recursion check ?
			//
			//for (var key in instance) {
			//	if (instance[key] == null || typeof instance !== 'object' ) 
			//		continue;
			//	
			//	result = val_process(instance, instance[key].Validate)
			//}
			
		}
		
		return {
			validate: val_process
		};
		
	}());
	
	
	// source ../src/collection/Collection.js
	var Collection = (function(){
		
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
				push: function(/*mix*/) {
					for (var i = 0, imax = arguments.length; i < imax; i++){
						
						this[this.length++] = create(this._constructor, arguments[i]);
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
					
					this[0] = create(this._constructor, mix);
					return this;
				},
				
				splice: function(index, count /* args */){
					var i, imax, length, y;
					
					
					// clear range after length until index
					if (index >= this.length) {
						count = 0;
						for (i = this.length, imax = index; i < imax; i++){
							this[i] = void 0;
						}
					}
					
					var	rm_count = count,
						rm_start = index,
						rm_end = index + rm_count,
						add_count = arguments.length - 2,
						
						new_length = this.length + add_count - rm_count;
					
					
					// move block
					
					var block_start = rm_end,
						block_end = this.length,
						block_shift = new_length - this.length;
					
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
						this[i++] = create(this._constructor, arguments[y++]);
					}
					
					
					this.length = new_length;
					return this;
				},
				
				slice: function(){
					return _Array_slice.apply(this, arguments);
				},
				
				sort: function(fn){
					_Array_sort.call(this, fn);
					return this;
				},
				
				reverse: function(){
					var array = _Array_slice.call(this, 0);
						
					for (var i = 0, imax = this.length; i < imax; i++){
						this[i] = array[imax - i - 1];
					}
					return this;
				},
				
				toString: function(){
					return _Array_slice.call(this, 0).toString()
				},
				
				each: function(fn, cntx){
					for (var i = 0, imax = this.length; i < imax; i++){
						
						fn.call(cntx || this, this[i], i);
						
					}
				},
				
				
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
					
					var imax = this.length,
						i = 0;
					while (--imax !== -1) {
						if (check(this[i++], mix))
							return this[i - 1];
					}
					return null;
				},
				last: function(mix){
					if (mix == null)
						return this[0];
					
					var imax = this.length;
					while (--imax !== -1) {
						if (check(this[imax], mix))
							return this[imax];
					}
					return null;
				}
			};
			
			
			return ArrayProto;
		}());
		
		
		function create(Constructor, mix) {
			
			if (mix instanceof Constructor) 
				return mix;
			
			return new Constructor(mix);
		}
		
		var CollectionProto = {
			serialize: function(){
				return JSON.stringify(this.toArray());
			},
			
			deserialize: function(mix){
				for (var i = 0, imax = mix.length; i < imax; i++){
					this[this.length++] = create(this._constructor, mix[i]);
				}
				
				return this;
			},
			
			del: function(mix){
				
				if (mix == null && arguments.length !== 0) {
					console.error('Collection.del - selector is specified, but is undefined');
					return this;
				}
				
				if (mix == null) {
					
					for (var i = 0, imax = this.length; i < imax; i++){
						this[i] = null;
					}
					this.length = 0;
					
					LocalStore.prototype.del.call(this);
					return this;
				}
				
				var array = this.remove(mix);
				if (array.length === 0) 
					return this;
				
				return this.save();
			},
			
			toArray: function(){
				var array = new Array(this.length);
				for (var i = 0, imax = this.length; i < imax; i++){
					array[i] = this[i];
				}
				
				return array;
			}	
		};
		
		function overrideConstructor(baseConstructor, Child) {
			
			return function CollectionConstructor(){
				this.length = 0;
				this._constructor = Child;
				
				if (baseConstructor != null)
					return baseConstructor.apply(this, arguments);
				
				return this;
			};
			
		}
		
		function Collection(Child, Proto) {
			
			Proto.Construct = overrideConstructor(Proto.Construct, Child);
			
			
			obj_inherit(Proto, CollectionProto, ArrayProto);
			return Class(Proto);
		}
		
		
		return Collection;
	}());
	
	// source ../src/store/Store.js
	var StoreProto = {
		
		// Serialization
		deserialize: function(json) {
			
			if (typeof json === 'string') 
				json = JSON.parse(json);
			
			
			for (var key in json) 
				this[key] = json[key];
			
			return this;
		},
		serialize: function() {
			return JSON.stringify(this);
		},
		
		
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
	// source ../src/store/Remote.js
	/**
	 *	Alpha - Test - End
	 */
	
	var Remote = (function(){
		
		var XHRRemote = function(route){
			this._route = new Route(route);
		};
		
		obj_inherit(XHRRemote, StoreProto, DeferredProto, {
			
			fetch: function(data){
				XHR.get(this._route.create(data || this), this);
				return this;
			},
			
			save: function(callback){
				XHR.post(this._route.create(this), this.serialize(), callback);
			},
			
			del: function(callback){
				XHR.del(this._route.create(this), this.serialize(), callback);
			},
			
			onSuccess: function(response){
				var json;
				
				try {
					json = JSON.parse(response);	
				} catch(error) {
					this.onError(error);
					return;
				}
				
				
				this.deserialize(json);
				this.resolve(this);
			},
			onError: function(error){
				this.reject({
					error: error
				});
			}
			
			
		});
		
		
		
		return function(route){
			
			return new XHRRemote(route);
			
		};
		
	}());
	// source ../src/store/LocalStore.js
	var LocalStore = (function(){
		
		var LocalStore = function(route){
			this._route = new Route(route);
		};
		
		obj_inherit(LocalStore, StoreProto, DeferredProto, {
			
			fetch: function(data){
				
				var path = this._route.create(data || this),
					object = localStorage.getItem(path);
				
				if (object == null) {
					this.resolve(this);
					return this;
				}
				
				if (typeof object === 'string'){
					try {
						object = JSON.parse(object);
					} catch(e) {
						this.onError(e);
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
				return this;
			},
			
			del: function(data){
				var path = this._route.create(data || this);
				
				localStorage.removeItem(path);
				return this;
			},
			
			onError: function(error){
				this.reject({
					error: error
				});
			}
			
			
		});
		
		
		
		var Constructor = function(route){
			
			return new LocalStore(route);
			
		};
		
		Constructor.prototype = LocalStore.prototype;
		
		
		return Constructor;
	
	}());
	
	
	// source ../src/Class.js
	var Class = function(data) {
		var _base = data.Base,
			_extends = data.Extends,
			_static = data.Static,
			_construct = data.Construct,
			_class = null,
			_store = data.Store,
			_self = data.Self,
			_overrides = data.Override,
			
			key;
	
		if (_base != null) {
			delete data.Base;
		}
		if (_extends != null) {
			delete data.Extends;
		}
		if (_static != null) {
			delete data.Static;
		}
		if (_self != null) {
			delete data.Self;
		}
		if (_construct != null) {
			delete data.Construct;
		}
		
		if (_store != null) {
			
			if (_extends == null) {
				_extends = _store;
			} else if (Array.isArray(_extends)) {
				_extends.push(_store)
			} else {
				_extends = [_extends, _store];
			}
			
			delete data.Store;
		}
		
		if (_overrides != null) {
			delete data.Override;
		}
		
		if (data.toJSON === void 0) {
			data.toJSON = JSONHelper.toJSON;
		}
	
	
		if (_base == null && _extends == null && _self == null) {
			if (_construct == null) {
				_class = function() {};
			} else {
				_class = _construct;
			}
	
			data.constructor = _class.prototype.constructor;
	
			if (_static != null) {
				for (key in _static) {
					_class[key] = _static[key];
				}
			}
	
			_class.prototype = data;
			return _class;
	
		}
	
		_class = function() {
	
			if (_extends != null) {
				var isarray = _extends instanceof Array,
					length = isarray ? _extends.length : 1,
					x = null;
				for (var i = 0; isarray ? i < length : i < 1; i++) {
					x = isarray ? _extends[i] : _extends;
					if (typeof x === 'function') {
						x.apply(this, arguments);
					}
				}
			}
	
			if (_base != null) {
				_base.apply(this, arguments);
			}
			
			if (_self != null) {
				for (var key in _self) {
					this[key] = fn_proxy(_self[key], this);
				}
			}
	
			if (_construct != null) {
				var r = _construct.apply(this, arguments);
				if (r != null) {
					return r;
				}
			}
			return this;
		};
	
		if (_static != null) {
			for (key in _static) {
				_class[key] = _static[key];
			}
		}
		
		if (_base != null) {
			class_inheritStatics(_class, _base);
		}
		
		if (_extends != null) {
			class_inheritStatics(_class, _extends);
		}
	
		class_extendProtoObjects(data, _base, _extends);
		class_inherit(_class, _base, _extends, data, _overrides);
	
	
		data = null;
		_static = null;
	
		return _class;
	};
	// source ../src/Class.Static.js
	/**
	 * Can be used in Constructor for binding class's functions to class's context
	 * for using, for example, as callbacks
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
	
	Class.Remote = Remote;
	Class.LocalStore = LocalStore;
	Class.Collection = Collection;
	
	Class.Serializable = Serializable;
	Class.Deferred = DeferredProto;
	Class.EventEmitter = EventEmitter;
	
	Class.validate = Validation.validate;
	
	
	// source ../src/fn/fn.js
	(function(){
		
		// source memoize.js
		
		
		function args_match(a, b) {
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
		
		function args_id(store, args) {
		
			if (args.length === 0)
				return 0;
		
			
			for (var i = 0, imax = store.length; i < imax; i++) {
				
				if (args_match(store[i], args))
					return i + 1;
			}
			
			store.push(args);
			return store.length;
		}
		
		
		function fn_memoize(fn) {
		
			var _cache = {},
				_args = [];
				
			return function() {
		
				var id = args_id(_args, arguments);
		
				
				return _cache[id] == null
					? (_cache[id] = fn.apply(this, arguments))
					: _cache[id];
			};
		}
		
		
		function fn_resolveDelegate(cache, cbs, id) {
			
			return function(){
				cache[id] = arguments;
				
				for (var i = 0, x, imax = cbs[id].length; i < imax; i++){
					x = cbs[id][i];
					x.apply(this, arguments);
				}
				
				cbs[i] = null;
				cache = null;
				cbs = null;
			};
		}
		
		function fn_memoizeAsync(fn) {
			var _cache = {},
				_cacheCbs = {},
				_args = [];
				
			return function(){
				
				var args = Array.prototype.slice.call(arguments),
					callback = args.pop();
				
				var id = args_id(_args, args);
				
				if (_cache[id]){
					callback.apply(this, _cache[id])
					return; 
				}
				
				if (_cacheCbs[id]) {
					_cacheCbs[id].push(callback);
					return;
				}
				
				_cacheCbs[id] = [callback];
				
				args = Array.prototype.slice.call(args);
				args.push(fn_resolveDelegate(_cache, _cacheCbs, id));
				
				fn.apply(this, args);
			};
		}
		
			
			
		
		
		Class.Fn = {
			memoize: fn_memoize,
			memoizeAsync: fn_memoizeAsync
		};
		
	}());
	
	exports.Class = Class;
	
}));
// source ../src/head.js
(function (root, factory) {
    'use strict';

	var _global, _exports, _document;
	
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
	
	_document = _global.document;
	
	
	factory(_global, _exports, _document);

}(this, function (global, exports, document) {
    'use strict';

	// source ../src/1.scope-vars.js
	
	/**
	 *	.cfg
	 *		: path :=	root path. @default current working path, im browser window.location;
	 *		: eval := in node.js this conf. is forced
	 *		: lockedToFolder := makes current url as root path
	 *			Example "/script/main.js" within this window.location "{domain}/apps/1.html"
	 *			will become "{domain}/apps/script/main.js" instead of "{domain}/script/main.js"
	 */
	
	var bin = {},
		isWeb = !! (global.location && global.location.protocol && /^https?:/.test(global.location.protocol)),
		reg_subFolder = /([^\/]+\/)?\.\.\//,
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
		__array_slice = Array.prototype.slice,
		
		XMLHttpRequest = global.XMLHttpRequest;
	
		 
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
	
	
	// source ../src/utils/fn.js
	function fn_proxy(fn, ctx) {
		
		return function(){
			fn.apply(ctx, arguments);
		};
		
	}
	
	function fn_doNothing(fn) {
		typeof fn === 'function' && fn();
	}
	// source ../src/utils/object.js
	function obj_inherit(target /* source, ..*/ ) {
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
	}
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
	// source ../src/utils/path.js
	function path_getDir(url) {
		var index = url.lastIndexOf('/');
		return index === -1 ? '' : url.substring(index + 1, -index);
	}
	
	function path_resolveCurrent() {
	
		if (document == null) {
			return typeof module === 'undefined'
				? '' 
				: path_win32Normalize(module.parent.filename);
		}
		var scripts = document.getElementsByTagName('script'),
			last = scripts[scripts.length - 1],
			url = last && last.getAttribute('src') || '';
			
		return (url[0] === '/') ? url : '/' + url;
	}
	
	function path_win32Normalize(path){
		path = path.replace(/\\/g, '/');
		if (path.substring(0, 5) === 'file:'){
			return path;
		}
	
		return 'file:///' + path;
	}
	
	function path_resolveUrl(url, parent) {
		if (cfg.path && url[0] === '/') {
			url = cfg.path + url.substring(1);
		}
	
		switch (url.substring(0, 5)) {
			case 'file:':
			case 'http:':
				return url;
		}
	
		if (url.substring(0, 2) === './') {
			url = url.substring(2);
		}
	
	
		if (url[0] === '/') {
			if (isWeb === false || cfg.lockedToFolder === true) {
				url = url.substring(1);
			}
		} else if (parent != null && parent.location != null) {
			url = parent.location + url;
		}
	
	
		while (url.indexOf('../') !== -1) {
			url = url.replace(reg_subFolder, '');
		}
	
		return url;
	}
	
	function path_isRelative(path) {
		var c = path.charCodeAt(0);
		
		switch (c) {
			case 47:
				// /
				return false;
			case 102:
				// f
			case 104:
				// h
				return /^file:|https?:/.test(path) === false;
		}
		
		return true;
	}
	
	function path_getExtension(path) {
		var query = path.indexOf('?');
		if (query === -1) {
			return path.substring(path.lastIndexOf('.') + 1);
		}
		
		return path.substring(path.lastIndexOf('.', query) + 1, query);
	}
	
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
					console.error('Include Item has no Data', type, namespace);
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
	 
	// source ../src/4.IncludeDeferred.js
	
	/**
	 * STATES:
	 * 0: Resource Created
	 * 1: Loading
	 * 2: Loaded - Evaluating
	 * 3: Evaluated - Childs Loading
	 * 4: Childs Loaded - Completed
	 */
	
	var IncludeDeferred = function() {
		this.callbacks = [];
		this.state = -1;
	};
	
	IncludeDeferred.prototype = { /**	state observer */
	
		on: function(state, callback, sender) {
			if (this === sender && this.state === -1) {
				callback(this);
				return this;
			}
			
			// this === sender in case when script loads additional
			// resources and there are already parents listeners
			
			var mutator = (this.state < 3 || this === sender)
				? 'unshift'
				: 'push';
			
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
				length = includes == null ? 0 : includes.length;
	
			if (length > 0 && this.response == null){
				this.response = {};
	
				var resource, route;
	
				for(var i = 0, x; i < length; i++){
					x = includes[i];
					resource = x.resource;
					route = x.route;
	
					if (typeof resource.exports === 'undefined'){
						continue;
					}
	
					var type = resource.type;
					switch (type) {
					case 'js':
					case 'load':
					case 'ajax':
	
						var alias = route.alias || Routes.parseAlias(route),
							obj = type === 'js' ? this.response : (this.response[type] || (this.response[type] = {}));
	
						if (alias) {
							obj[alias] = resource.exports;
							break;
						} else {
							console.warn('Resource Alias is Not defined', resource);
						}
						break;
					}
	
				}
			}
			callback(this.response);
		}
	};
	 
	// source ../src/5.Include.js
	var Include = (function(IncludeDeferred) {
	
		function Include() {
			IncludeDeferred.call(this);
		}
	
		stub_release(Include.prototype);
		
		obj_inherit(Include, IncludeDeferred, {
			setCurrent: function(data) {
	
				var resource = new Resource('js', {
					path: data.id
				}, data.namespace, null, null, data.id);
	
				if (resource.state !== 4) {
					console.error("Current Resource should be loaded");
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
					Routes.register(mix, arguments[1]);
					return this;
				}
				
				for (var key in mix) {
					Routes.register(key, mix[key]);
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
			register: function(_bin) {
				for (var key in _bin) {
					for (var i = 0; i < _bin[key].length; i++) {
						var id = _bin[key][i].id,
							url = _bin[key][i].url,
							namespace = _bin[key][i].namespace,
							resource = new Resource();
	
						resource.state = 4;
						resource.namespace = namespace;
						resource.type = key;
	
						if (url) {
							if (url[0] === '/') {
								url = url.substring(1);
							}
							resource.location = path_getDir(url);
						}
	
						switch (key) {
						case 'load':
						case 'lazy':
							var container = document.querySelector('#includejs-' + id.replace(/\W/g, ''));
							if (container == null) {
								console.error('"%s" Data was not embedded into html', id);
								return;
							}
							resource.exports = container.innerHTML;
							break;
						}
						
						//
						(bin[key] || (bin[key] = {}))[id] = resource;
					}
				}
			},
			/**
			 *	Create new Resource Instance,
			 *	as sometimes it is necessary to call include. on new empty context
			 */
			instance: function(url) {
				var resource;
				if (url == null) {
					resource = new Include();
					resource.state = 4;
					
					return resource;
				}
				
				resource = new Resource();
				resource.state = 4;
				resource.location = path_getDir(url);
				
				return resource;
			},
	
			getResource: function(url, type) {
				var id = url;
				
				if (url.charCodeAt(0) !== 47) {
					// /
					id = '/' + id;
				}
	
				if (type != null){
					return bin[type][id];
				}
	
				for (var key in bin) {
					if (bin[key].hasOwnProperty(id)) {
						return bin[key][id];
					}
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
			}
		});
		
		
		return Include;
	
		
		// >> FUNCTIONS
		
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
	 
	// source ../src/6.ScriptStack.js
	/** @TODO Refactor loadBy* {combine logic} */
	
	var ScriptStack = (function() {
	
		var head, currentResource, stack = [],
			loadScript = function(url, callback) {
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
				}(head || (head = document.getElementsByTagName('head')[0])).appendChild(tag);
			},
	
			loadByEmbedding = function() {
				if (stack.length === 0) {
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
			},
			processByEval = function() {
				if (stack.length === 0) {
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
	
				resource.readystatechanged(3);
				currentResource = null;
				processByEval();
	
			};
	
	
		return {
			load: function(resource, parent, forceEmbed) {
	
				//console.log('LOAD', resource.url, 'parent:',parent ? parent.url : '');
	
				var added = false;
				if (parent) {
					for (var i = 0, length = stack.length; i < length; i++) {
						if (stack[i] === parent) {
							stack.splice(i, 0, resource);
							added = true;
							break;
						}
					}
				}
	
				if (!added) {
					stack.push(resource);
				}
	
				// was already loaded, with custom loader for example
	
				if (!cfg.eval || forceEmbed) {
					loadByEmbedding();
					return;
				}
	
				if (cfg.sync === true) {
					currentResource = null;
				}
	
	
				if (resource.source) {
					resource.state = 2;
					processByEval();
					return;
				}
	
				XHR(resource, function(resource, response) {
					if (!response) {
						console.error('Not Loaded:', resource.url);
					}
	
					resource.source = response;
					resource.state = 2;
	
					processByEval();
				});
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
					// this should be not the case, but anyway checked.
					
					// - resource can load resources in done cb, and then it will be
					// already not in stack
					//-console.warn('Resource is not in stack', resource);
					return;
				}
	
				for (i= 0; i < length; i++) {
					if (stack[i] === parent) {
						parentIndex = i;
						break;
					}
				}
	
				if (parentIndex === -1) {
					//// - should be already in stack
					////if (parent == null) {
					////	stack.unshift(resource);
					////}
					return;
				}
	
				if (resourceIndex < parentIndex) {
					return;
				}
	
				stack.splice(resourceIndex, 1);
				stack.splice(parentIndex, 0, resource);
	
	
			}
		};
	})();
	
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
	
			return (cfg.loader[extension] = new Resource('js', Routes.resolve(namespace, path), namespace));
		}
		
		function doLoad_completeDelegate(callback, resource) {
			return function(response){
				callback(resource, response);
			};
		}
		
		function doLoad(resource, loader, callback) {
			XHR(resource, function(resource, response) {
				var delegate = doLoad_completeDelegate(callback, resource),
					syncResponse = loader.process(response, resource, delegate);
				
				// match also null
				if (typeof syncResponse !== 'undefined') {
					callback(resource, syncResponse);
				}
				
			});
		}
	
		return {
			load: function(resource, callback) {
	
				var loader = createLoader(resource.url);
				
				if (loader.process) {
					doLoad(resource, loader, callback);
					return;
				}
				
				loader.done(function() {
					doLoad(resource, loader.exports, callback);
				});
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
	// source ../src/9.Resource.js
	var Resource = (function(Include, Routes, ScriptStack, CustomLoader) {
	
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
					ScriptStack.load(resource, resource.parent, resource.type === 'embed');
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
	
		var Resource = function(type, route, namespace, xpath, parent, id) {
			Include.call(this);
			
			this.childLoaded = fn_proxy(this.childLoaded, this);
	
			var url = route && route.path;
	
			if (url != null) {
				this.url = url = path_resolveUrl(url, parent);
			}
	
			this.route = route;
			this.namespace = namespace;
			this.type = type;
			this.xpath = xpath;
			this.parent = parent;
	
			if (id == null && url) {
				id = (url[0] === '/' ? '' : '/') + url;
			}
	
	
			var resource = bin[type] && bin[type][id];
			if (resource) {
	
				if (resource.state < 4 && type === 'js') {
					ScriptStack.moveToParent(resource, parent);
				}
	
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
	
			if (cfg.version) {
				this.url += (this.url.indexOf('?') === -1 ? '?' : '&') + 'v=' + cfg.version;
			}
	
			return process(this);
	
		};
	
		Resource.prototype = obj_inherit(Resource, Include, {
			childLoaded: function(child) {
				var resource = this,
					includes = resource.includes;
				if (includes && includes.length) {
					if (resource.state < 3 /* && resource.url != null */ ) {
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
	
				this.state = this.state >= 3 ? 3 : 2;
				this.response = null;
	
				if (this.includes == null) {
					this.includes = [];
				}
	
				resource = new Resource(type, route, namespace, xpath, this, id);
	
				this.includes.push({
					resource: resource,
					route: route
				});
	
				return resource;
			},
			include: function(type, pckg) {
				var that = this;
				Routes.each(type, pckg, function(namespace, route, xpath) {
	
					if (that.route != null && that.route.path === route.path) {
						// loading itself
						return;
					}
					
					that
						.create(type, route, namespace, xpath)
						.on(4, that.childLoaded);
	
				});
	
				return this;
			},
			
			getNestedOfType: function(type){
				return resource_getChildren(this.includes, type);
			}
		});
	
		return Resource;
	
		
		function resource_getChildren(includes, type, out) {
			if (includes == null) {
				return null;
			}
			
			if (out == null) {
				out = [];
			}
			
			for (var i = 0, x, imax = includes.length; i < imax; i++){
				x = includes[i].resource;
				
				if (type === x.type) {
					out.push(x);
				}
				
				if (x.includes != null) {
					resource_getChildren(x.includes, type, out);
				}
			}
			
			return out;
		}
		
	}(Include, Routes, ScriptStack, CustomLoader));
	
	// source ../src/10.export.js
	
	exports.include = new Include();
	
	exports.includeLib = {
		Routes: RoutesLib,
		Resource: Resource,
		ScriptStack: ScriptStack,
		registerLoader: CustomLoader.register
	};
	
	// source ../src/11.node.js
	(function() {
	
		cfg.server = true;
	
		var fs = require('fs'),
			vm = require('vm'),
			Module = global.module.constructor,
			globalPath,
			includePath;
	
	
		XMLHttpRequest = function() {};
		XMLHttpRequest.prototype = {
			constructor: XMLHttpRequest,
			open: function(method, url) {
				this.url = url;
			},
			send: function() {
	
				if (this.url.indexOf('file://') !== -1) {
					this.url = getFile(this.url);
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
		
		function file_read(url, callback) {
			if (cfg.sync) {
				try {
					var content = fs.readFileSync(url, 'utf8');
					
					callback(null, content);
				} catch(error) {
					console.error('File Read - ', error);
				}
				
				return;
			}
			fs.readFile(url, 'utf8', callback);
		}
		
		var file_watch = (function(){
			var _watchers = {};
			
			function _unbind(path) {
				if (_watchers[path] == null)
					return;
				
				_watchers[path].close();
				_watchers[path] = null;
			}
			
			return function(path, callback){
				_unbind(path);
				_watchers[path] = fs.watch(path, callback);
			};
		}());
		
		
		function bin_removeDelegate(url) {
			// use timeout as sys-file-change event is called twice
			var timeout;
			return function(){
				if (timeout) 
					clearTimeout(timeout);
				
				timeout = setTimeout(function(){
					bin_remove(url);
				}, 150);
			};
		}
		function bin_remove(mix) {
			if (mix == null) 
				return;
			
			var type,
				id,
				index,
				res;
				
			var isUrl = typeof mix === 'string',
				url = isUrl ? mix : null;
			
			
			for (type in bin) {
				
				for (id in bin[type]) {
					
					if (isUrl === false) {
						if (bin[type][id] === mix) {
							delete bin[type][id];
							return;
						}
						continue;
					}
					
					index = id.indexOf(url);
					if (index !== -1 && index === id.length - url.length) {
						
						res = bin[type][id];
				
						delete bin[type][id];
						
						if (type === 'load') {
							bin_remove(res.parent);
						}
						
						return;
					}
				}
				
			}
			console.warn('[bin_remove] Resource is not in cache', url);
		}
	
		__eval = function(source, include, isGlobalCntx) {
			module.exports = {};
			
			global.include = include;
			global.require = require;
			global.exports = module.exports;
			global.__filename = getFile(include.url);
			global.__dirname = getDir(global.__filename);
			global.module = module;
	
			if (isGlobalCntx !== true) {
				source = '(function(){ ' + source + ' }())';
			}
	
			try {
				vm.runInThisContext(source, global.__filename);
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
	
	
		function getFile(url) {
			
			url = url
				.replace('file://', '')
				.replace(/\\/g, '/')
				.replace(/\?[^\n]+$/, '');
			
			if (/^\/\w+:\/[^\/]/i.test(url)){
				// win32 drive
				return url.substring(1);
			}
			
			return url;
		}
	
		function getDir(url) {
			return url.substring(0, url.lastIndexOf('/'));
		}
		
		obj_inherit(Resource, {
			
			path_getFile: function(){
				return getFile(this.url);
			},
			
			path_getDir: function(){
				return getDir(getFile(this.url));
			},
		
			inject: function() {
				
				var pckg = arguments.length === 1
					? arguments[0]
					: __array_slice.call(arguments);
				
				var current = this;
				
				current.state = current.state >= 3 ? 3 : 2;
				
				var bundle = current.create();
				
				bundle.url = this.url;
				bundle.location = this.location;
				bundle.load(pckg).done(function(resp){
		
					var sources = resp.load,
						key,
						resource;
					
					try {
						for(var i = 0; i< bundle.includes.length; i++){
							//@TODO - refactor
							
							var resource = bundle.includes[i].resource,
								source = resource.exports;
		
							
							resource.exports = null;
							resource.type = 'js';
							resource.includes = null;
							resource.state = 3;
							
							
							for (var key in bin.load) {
								if (bin.load[key] === resource) {
									delete bin.load[key];
									break;
								}
							}
							
		
							__eval(source, resource, true);
		
							
							resource.readystatechanged(3);
		
						}
					} catch (e) {
						console.error('Injected Script Error\n', e, key);
					}
		
					
					bundle.on(4, function(){
						
						current
							.includes
							.splice
							.apply(current.includes, [bundle, 1].concat(bundle.includes));
		
						current.readystatechanged(3);
					});
				});
		
				return current;
			},
		
			instance: function(currentUrl) {
				if (typeof currentUrl === 'string') {
		
					var old = module,
						next = new Module(currentUrl, old);
		
					next.filename = getFile(currentUrl);
					next.paths = Module._nodeModulePaths(getDir(next.filename));
		
		
					if (!globalPath) {
						var delimiter = process.platform === 'win32' ? ';' : ':',
							PATH = process.env.PATH || process.env.path;
		
						if (!PATH){
							console.error('PATH not defined in env', process.env);
						}
		
						var parts = PATH.split(delimiter),
							globalPath = ruqq.arr.first(parts, function(x){
								return /([\\\/]npm[\\\/])|([\\\/]npm$)/gi.test(x);
							});
		
						if (globalPath){
							globalPath = globalPath.replace(/\\/g, '/');
							globalPath += (globalPath[globalPath.length - 1] !== '/' ? '/' : '') + 'node_modules';
			
							includePath = io.env.applicationDir.toLocalDir() + 'node_modules';
						}else {
							console.error('Could not resolve global NPM Directory from system path');
							console.log('searched with pattern /npm in', PATH, delimiter);
						}
					}
		
		
					next.paths.unshift(includePath);
					next.paths.unshift(globalPath);
		
					module = next;
					require = next.require.bind(next);
				}
		
				var res = new Resource();
				res.state = 4;
				return res;
			}
		});
	
	
	
	}());

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

// source ../src/umd-head.js
(function (root, factory) {
    'use strict';
    
    var _global, _exports, _document;

    
	if (typeof exports !== 'undefined' && (root === exports || root == null)){
		// raw nodejs module
    	_global = global;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined' || window.document == null ? global : window;
	}
    
    _document = _global.document;
	_exports = root || _global;
    

    function construct(plugins){

        if (plugins == null) {
            plugins = {};
        }
        var lib = factory(_global, plugins, _document),
            key;

        for (key in plugins) {
            lib[key] = plugins[key];
        }

        return lib;
    };

    
    if (typeof exports !== 'undefined' && exports === root) {
        module.exports = construct();
        return;
    }
    if (typeof define === 'function' && define.amd) {
        define(construct);
        return;
    }
    
    var plugins = {},
        lib = construct(plugins);

    _exports.mask = lib;

    for (var key in plugins) {
        _exports[key] = plugins[key];
    }

    

}(this, function (global, exports, document) {
    'use strict';




	// source ../src/scope-vars.js
	var regexpWhitespace = /\s/g,
		regexpEscapedChar = {
			"'": /\\'/g,
			'"': /\\"/g,
			'{': /\\\{/g,
			'>': /\\>/g,
			';': /\\>/g
		},
		hasOwnProp = {}.hasOwnProperty,
		listeners = null,
		
		__cfg = {
			
			/*
			 * Relevant to node.js only, to enable compo caching
			 */
			allowCache: true
		};
	
	// source ../src/util/util.js
	function util_extend(target, source) {
	
		if (target == null) {
			target = {};
		}
		for (var key in source) {
			// if !SAFE
			if (hasOwnProp.call(source, key) === false) {
				continue;
			}
			// endif
			target[key] = source[key];
		}
		return target;
	}
	
	function util_getProperty(o, chain) {
		if (chain === '.') {
			return o;
		}
	
		var value = o,
			props = chain.split('.'),
			i = -1,
			length = props.length;
	
		while (value != null && ++i < length) {
			value = value[props[i]];
		}
	
		return value;
	}
	
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
	
	function util_interpolate(arr, type, model, cntx, element, controller, name) {
		var length = arr.length,
			i = 0,
			array = null,
			string = '',
			even = true,
			utility, value, index, key, handler;
	
		for (; i < length; i++) {
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
					value = util_getProperty(model, key);
				} else {
					utility = index > 0
						? str_trim(key.substring(0, index))
						: '';
						
					if (utility === '') {
						utility = 'expression';
					}
	
					key = key.substring(index + 1);
					handler = custom_Utils[utility];
					
					value = fn_isFunction(handler)
						? handler(key, model, cntx, element, controller, name, type)
						: handler.process(key, model, cntx, element, controller, name, type);
						
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
	
		return array == null ? string : array;
	}
	
	// source ../src/util/template.js
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
				// if c == # && next() == { - continue */
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
	
			return isEscaped ? value.replace(regexpEscapedChar[c], c) : value;
		}
	
	};
	
	// source ../src/util/string.js
	function str_trim(str) {
	
		var length = str.length,
			i = 0,
			j = length - 1,
			c;
	
		for (; i < length; i++) {
			c = str.charCodeAt(i);
			if (c < 33) {
				continue;
			}
			break;
	
		}
		
		for (; j >= i; j--) {
			c = str.charCodeAt(j);
			if (c < 33) {
				continue;
			}
			break;
		}
	
		return i === 0 && j === length - 1
			? str
			: str.substring(i, j + 1);
	}
	// source ../src/util/function.js
	function fn_isFunction(x) {
		return typeof x === 'function';
	}
	// source ../src/util/condition.js
	/**
	 *	ConditionUtil
	 *
	 *	Helper to work with conditional expressions
	 **/
	
	var ConditionUtil = (function() {
	
		function parseDirective(T, currentChar) {
			var c = currentChar,
				start = T.index,
				token;
	
			if (c == null) {
				T.skipWhitespace();
				start = T.index;
				currentChar = c = T.template.charCodeAt(T.index);
			}
	
			if (c === 34 /*"*/ || c === 39 /*'*/ ) {
	
				T.index++;
				token = T.sliceToChar(c === 39 ? "'" : '"');
				T.index++;
	
				return token;
			}
	
	
			do {
				c = T.template.charCodeAt(++T.index);
			} while (T.index < T.length && //
			c !== 32 /* */ && //
			c !== 33 /*!*/ && //
			c !== 60 /*<*/ && //
			c !== 61 /*=*/ && //
			c !== 62 /*>*/ && //
			c !== 40 /*(*/ && //
			c !== 41 /*)*/ && //
			c !== 38 /*&*/ && //
			c !== 124 /*|*/ );
	
			token = T.template.substring(start, T.index);
	
			c = currentChar;
	
			if (c === 45 || (c > 47 && c < 58)) { /* [-] || [number] */
				return token - 0;
			}
	
			if (c === 116 /*t*/ && token === 'true') {
				return true;
			}
	
			if (c === 102 /*f*/ && token === 'false') {
				return false;
			}
	
			return {
				value: token
			};
		}
	
	
	
		function parseAssertion(T, output) {
			// use shadow class
			var current = {
				assertions: null,
				join: null,
				left: null,
				right: null
			},
				c;
	
			if (output == null) {
				output = [];
			}
	
			if (typeof T === 'string') {
				T = new Template(T);
			}
			outer: while(1) {
				T.skipWhitespace();
	
				if (T.index >= T.length) {
					break;
				}
	
				c = T.template.charCodeAt(T.index);
	
				switch (c) {
				case 61:
					// <
				case 60:
					// >
				case 62:
					// !
				case 33:
					var start = T.index;
					do {
						c = T.template.charCodeAt(++T.index);
					} while (T.index < T.length && (c === 60 || c === 61 || c === 62));
	
					current.sign = T.template.substring(start, T.index);
					continue;
					// &
				case 38:
					// |
				case 124:
					if (T.template.charCodeAt(++T.index) !== c) {
						console.error('Unary operation not valid');
					}
	
					current.join = c === 38 ? '&&' : '||';
	
					output.push(current);
					current = {
						assertions: null,
						join: null,
						left: null,
						right: null
					};
	
					++T.index;
					continue;
					// (
				case 40:
					T.index++;
					parseAssertion(T, (current.assertions = []));
					break;
					// )
				case 41:
					T.index++;
					break outer;
				default:
					current[current.left == null ? 'left' : 'right'] = parseDirective(T, c);
					continue;
				}
			}
	
			if (current.left || current.assertions) {
				output.push(current);
			}
			return output;
		}
	
	
		var _cache = [];
	
		function parseLinearCondition(line) {
	
			if (_cache[line] != null) {
				return _cache[line];
			}
	
			var length = line.length,
				ternary = {
					assertions: null,
					case1: null,
					case2: null
				},
				questionMark = line.indexOf('?'),
				T = new Template(line);
	
	
			if (questionMark !== -1) {
				T.length = questionMark;
			}
	
			ternary.assertions = parseAssertion(T);
	
			if (questionMark !== -1){
				T.length = length;
				T.index = questionMark + 1;
	
				ternary.case1 = parseDirective(T);
				T.skipWhitespace();
	
				if (T.template.charCodeAt(T.index) === 58 /*:*/ ) {
					T.index++; // skip ':'
					ternary.case2 = parseDirective(T);
				}
			}
	
			return (_cache[line] = ternary);
		}
	
		function isCondition(assertions, model) {
			if (typeof assertions === 'string') {
				assertions = parseLinearCondition(assertions).assertions;
			}
	
			if (assertions.assertions != null) {
				// backwards compatible, as argument was a full condition statement
				assertions = assertions.assertions;
			}
	
			var current = false,
				a, value1, value2, i, length;
	
			for (i = 0, length = assertions.length; i < length; i++) {
				a = assertions[i];
	
				if (a.assertions) {
					current = isCondition(a.assertions, model);
				} else {
					value1 = typeof a.left === 'object' ? util_getProperty(model, a.left.value) : a.left;
	
					if (a.right == null) {
						current = value1;
						if (a.sign === '!') {
							current = !current;
						}
	
					} else {
						value2 = typeof a.right === 'object' ? util_getProperty(model, a.right.value) : a.right;
						switch (a.sign) {
						case '<':
							current = value1 < value2;
							break;
						case '<=':
							current = value1 <= value2;
							break;
						case '>':
							current = value1 > value2;
							break;
						case '>=':
							current = value1 >= value2;
							break;
						case '!=':
							current = value1 !== value2;
							break;
						case '==':
							current = value1 === value2;
							break;
						}
					}
				}
	
				if (current) {
					if (a.join === '&&') {
						continue;
					}
	
					break; // we are in OR and current is truthy
				}
	
				if (a.join === '||') {
					continue;
				}
	
				if (a.join === '&&'){
					// find OR in stack (false && false && false || true -> true)
					for(++i; i<length; i++){
						if (assertions[i].join === '||'){
							break;
						}
					}
				}
			}
			return current;
		}
	
		return {
			/**
			 *	condition(ternary[, model]) -> result
			 *	- ternary (String)
			 *	- model (Object): Data Model
			 *
			 *	Ternary Operator is evaluated via ast parsing.
			 *	All this expressions are valid:
			 *		('name=="me"',{name: 'me'}) -> true
			 *		('name=="me"?"yes"',{name: 'me'}) -> "yes"
			 *		('name=="me"? surname',{name: 'me', surname: 'you'}) -> 'you'
			 *		('name=="me" ? surname : "none"',{}) -> 'none'
			 *
			 **/
			condition: function(line, model) {
				var con = parseLinearCondition(line),
					result = isCondition(con.assertions, model);
	
				if (con.case1 != null){
					result =  result ? con.case1 : con.case2;
				}
	
				if (result == null) {
					return '';
				}
				if (typeof result === 'object' && result.value) {
					return util_getProperty(model, result.value);
				}
	
				return result;
			},
			/**
			 *	isCondition(condition, model) -> Boolean
			 * - condition (String)
			 * - model (Object)
			 *
			 *	Evaluate condition via ast parsing using specified model data
			 **/
			isCondition: isCondition,
	
			/**
			 *	parse(condition) -> Object
			 * - condition (String)
			 *
			 *	Parse condition to an AstTree.
			 **/
			parse: parseLinearCondition,
	
			/* deprecated - moved to parent */
			out: {
				isCondition: isCondition,
				parse: parseLinearCondition
			}
		};
	}());
	
	// source ../src/expression/exports.js
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
			op_LogicalNotEqual = '!=', //11,
			op_LogicalGreater = '>', //12,
			op_LogicalGreaterEqual = '>=', //13,
			op_LogicalLess = '<', //14,
			op_LogicalLessEqual = '<=', //15,
			op_Member = '.', // 16
		
			punc_ParantheseOpen = 20,
			punc_ParantheseClose = 21,
			punc_Comma = 22,
			punc_Dot = 23,
			punc_Question = 24,
			punc_Colon = 25,
		
			go_ref = 30,
			go_string = 31,
			go_number = 32;
		
		var type_Body = 1,
			type_Statement = 2,
			type_SymbolRef = 3,
			type_FunctionRef = 4,
			type_Accessor = 5,
			type_Value = 6,
		
		
			type_Number = 7,
			type_String = 8,
			type_UnaryPrefix = 9,
			type_Ternary = 10;
		
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
		precedence[op_LogicalNotEqual] = 5;
		
		
		precedence[op_LogicalAnd] = 6;
		precedence[op_LogicalOr] = 6;
		
		// source 2.ast.js
		function Ast_Body(parent) {
			this.parent = parent;
			this.type = type_Body;
			this.body = [];
			this.join = null;
		}
		
		function Ast_Statement(parent) {
			this.parent = parent;
		}
		Ast_Statement.prototype = {
			constructor: Ast_Statement,
			type: type_Statement,
			join: null,
			body: null
		};
		
		
		function Ast_Value(value) {
			this.type = type_Value;
			this.body = value;
			this.join = null;
		}
		
		function Ast_FunctionRef(parent, ref) {
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
		
		function Ast_SymbolRef(parent, ref) {
			this.parent = parent;
			this.type = type_SymbolRef;
			this.body = ref;
			this.next = null;
		}
		
		function Ast_Accessor(parent, astRef){
			this.parent = parent;
			this.body = astRef;
			this.next = null;
		}
		
		
		function Ast_UnaryPrefix(parent, prefix) {
			this.parent = parent;
			this.prefix = prefix;
		}
		Ast_UnaryPrefix.prototype = {
			constructor: Ast_UnaryPrefix,
			type: type_UnaryPrefix,
			body: null
		};
		
		
		
		function Ast_TernaryStatement(assertions){
			this.body = assertions;
			this.case1 = new Ast_Body(this);
			this.case2 = new Ast_Body(this);
		}
		Ast_TernaryStatement.prototype = {
			constructor: Ast_TernaryStatement,
			type: type_Ternary,
			case1: null,
			case2: null
		};
		
		
		function ast_append(current, next) {
			if (null == current) {
				console.error('Undefined', current, next);
			}
			var type = current.type;
		
			if (type_Body === type){
				current.body.push(next);
				return next;
			}
		
			if (type_Statement === type || type_UnaryPrefix === type){
				return current.body = next;
			}
		
			if (type_SymbolRef === type || type_FunctionRef === type){
				return current.next = next;
			}
		
			console.error('Unsupported - append:', current, next);
			return next;
		}
		
		function ast_join(){
			if (arguments.length === 0){
				return null;
			}
			var body = new Ast_Body(arguments[0].parent);
		
			body.join = arguments[arguments.length - 1].join;
			body.body = Array.prototype.slice.call(arguments);
		
			return body;
		}
		
		function ast_handlePrecedence(ast){
			if (ast.type !== type_Body){
				if (ast.body != null && typeof ast.body === 'object'){
					ast_handlePrecedence(ast.body);
				}
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
		
				if (precedence[prev.join] > precedence[x.join]){
					break;
				}
			}
		
			if (i === length){
				return;
			}
		
			array = [body[0]];
			for(i = 1; i < length; i++){
				x = body[i];
				prev = body[i-1];
		
				if (precedence[prev.join] > precedence[x.join] && i < length - 1){
					x = ast_join(body[i], body[++i]);
				}
		
				array.push(x);
			}
		
			ast.body = array;
		
		}
		
		// source 3.util.js
		function _throw(message, token) {
			console.error('Expression parser:', message, token, template.substring(index));
		}
		
		
		function util_resolveRef(astRef, model, cntx, controller) {
			var current = astRef,
				key = astRef.body,
				object, value;
		
			if (value == null && model != null) {
				object = model;
				value = model[key];
			}
		
			if (value == null && cntx != null) {
				object = cntx;
				value = cntx[key];
			}
		
			if (value == null && controller != null) {
				do {
					object = controller;
					value = controller[key];
				} while (value == null && (controller = controller.parent) != null);
			}
		
			if (value != null) {
				do {
					if (current.type === type_FunctionRef) {
						var args = [];
						for (var i = 0, x, length = current.arguments.length; i < length; i++) {
							x = current.arguments[i];
							args[i] = expression_evaluate(x, model, cntx, controller);
						}
						value = value.apply(object, args);
					}
		
					if (value == null || current.next == null) {
						break;
					}
		
					current = current.next;
					key = current.body;
					object = value;
					value = value[key];
		
					if (value == null) {
						break;
					}
		
				} while (true);
			}
		
			if (value == null){
				if (current == null || current.next != null){
					_throw('Mask - Accessor error - ', key);
				}
			}
		
			return value;
		
		
		}
		
		function util_getValue(object, props, length) {
			var i = -1,
				value = object;
			while (value != null && ++i < length) {
				value = value[props[i]];
			}
			return value;
		}
		
		// source 4.parser.helper.js
		function parser_skipWhitespace() {
			var c;
			while (index < length) {
				c = template.charCodeAt(index);
				if (c > 32) {
					return c;
				}
				index++;
			}
			return null;
		}
		
		
		function parser_getString(c) {
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
				string = string.replace(regexpEscapedChar[_char], _char);
			}
			return string;
		}
		
		function parser_getNumber() {
			var start = index,
				code, isDouble;
			while (true) {
		
				code = template.charCodeAt(index);
				if (code === 46) {
					// .
					if (isDouble === true) {
						_throw('Unexpected punc');
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
		}
		
		function parser_getRef() {
			var start = index,
				c = template.charCodeAt(index),
				ref;
		
			if (c === 34 || c === 39) {
				index++;
				ref = parser_getString(c);
				index++;
				return ref;
			}
		
			while (true) {
		
				c = template.charCodeAt(index);
				if (
					c > 47 && // ()+-*,/
		
				c !== 58 && // :
				c !== 60 && // <
				c !== 61 && // =
				c !== 62 && // >
				c !== 63 && // ?
		
				c !== 124 && // |
		
				index < length) {
		
					index++;
					continue;
				}
		
				break;
			}
		
			return template.substring(start, index);
		}
		
		function parser_getDirective(code) {
			if (code == null && index === length) {
				return null;
			}
		
			switch (code) {
				case 40:
					// )
					return punc_ParantheseOpen;
				case 41:
					// )
					return punc_ParantheseClose;
				case 44:
					// ,
					return punc_Comma;
				case 46:
					// .
					return punc_Dot;
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
						_throw('Not supported (Apply directive) - view can only access model/controllers');
						return null;
					}
					return op_LogicalEqual;
		
				case 33:
					// !
					if (template.charCodeAt(index + 1) === 61) {
						// =
						index++;
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
						_throw('Single Binary Operator AND');
						return null;
					}
					return op_LogicalAnd;
		
				case 124:
					// |
					if (template.charCodeAt(++index) !== code) {
						_throw('Single Binary Operator OR');
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
		
			if (code >= 65 && code <= 90 || code >= 97 && code <= 122 || code === 95 || code === 36) {
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
		
			_throw('Unexpected / Unsupported directive');
			return null;
		}
		// source 5.parser.js
		function expression_parse(expr) {
		
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
		
				if (index >= length) {
					break;
				}
		
				directive = parser_getDirective(c);
		
				if (directive == null && index < length) {
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
							_throw('OutOfAst Exception - body closed');
							break outer;
						}
		
						index++;
						continue;
		
		
					case punc_Comma:
						if (state !== state_arguments) {
							_throw('Unexpected punctuation, comma');
							break outer;
						}
						do {
							current = current.parent;
						} while (current != null && current.type !== type_FunctionRef);
		
						if (current == null) {
							_throw('OutOfAst Exception - next argument');
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
							directive = go_ref;
							index++;
						}
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
					case op_LogicalNotEqual:
		
					case op_LogicalGreater:
					case op_LogicalGreaterEqual:
					case op_LogicalLess:
					case op_LogicalLessEqual:
		
						while (current && current.type !== type_Statement) {
							current = current.parent;
						}
		
						if (current.body == null) {
							_throw('Unexpected operator', current);
							break outer;
						}
		
						current.join = directive;
		
						do {
							current = current.parent;
						} while (current != null && current.type !== type_Body);
		
						if (current == null) {
							console.error('Unexpected parent', current);
						}
		
		
						index++;
						continue;
					case go_string:
					case go_number:
						if (current.body != null && current.join == null) {
							_throw('Directive Expected');
							break;
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
						var ref = parser_getRef();
		
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
		
						if (c === 110 && ref === 'null') {
							ref = null;
						}
		
						if (c === 102 && ref === 'false') {
							ref = false;
						}
		
						if (c === 116 && ref === 'true') {
							ref = true;
						}
		
						current = ast_append(current, typeof ref === 'string' ? new Ast_SymbolRef(current, ref) : new Ast_Value(ref));
						
						break;
				}
			}
		
			if (current.body == null && current.type === type_Statement) {
				_throw('Unexpected end of expression');
			}
		
			ast_handlePrecedence(ast);
		
			return ast;
		}
		// source 6.eval.js
		function expression_evaluate(mix, model, cntx, controller) {
		
			var result, ast;
		
			if (mix == null){
				return null;
			}
		
			if (typeof mix === 'string'){
				if (cache.hasOwnProperty(mix) === true){
					ast = cache[mix];
				}else{
					ast = (cache[mix] = expression_parse(mix));
				}
			}else{
				ast = mix;
			}
		
			var type = ast.type,
				i, x, length;
		
			if (type_Body === type) {
				var value, prev;
		
				outer: for (i = 0, length = ast.body.length; i < length; i++) {
					x = ast.body[i];
		
					value = expression_evaluate(x, model, cntx, controller);
		
					if (prev == null) {
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
						result = result != value;
						break;
					case op_LogicalEqual:
						result = result == value;
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
				return expression_evaluate(ast.body, model, cntx, controller);
			}
		
			if (type_Value === type) {
				return ast.body;
			}
		
			if (type_SymbolRef === type || type_FunctionRef === type) {
				return util_resolveRef(ast, model, cntx, controller);
			}
			
			if (type_UnaryPrefix === type) {
				result = expression_evaluate(ast.body, model, cntx, controller);
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
				result = expression_evaluate(ast.body, model, cntx, controller);
				result = expression_evaluate(result ? ast.case1 : ast.case2, model, cntx, controller);
		
			}
		
			return result;
		}
		
		// source 7.vars.helper.js
		var refs_extractVars = (function() {
		
			/**
			 * extract symbol references
			 * ~[:user.name + 'px'] -> 'user.name'
			 * ~[:someFn(varName) + user.name] -> ['varName', 'user.name']
			 *
			 * ~[:someFn().user.name] -> {accessor: (Accessor AST function call) , ref: 'user.name'}
			 */
		
		
			return function(expr){
				if (typeof expr === 'string') {
					expr = expression_parse(expr);
				}
				
				return _extractVars(expr);
				
				
			};
			
			
			
			function _extractVars(expr) {
		
				if (expr == null) {
					return null;
				}
		
				var refs, x;
		
				if (type_Body === expr.type) {
		
					for (var i = 0, length = expr.body.length; i < length; i++) {
						x = _extractVars(expr.body[i]);
						refs = _append(refs, x);
					}
				}
		
				if (type_SymbolRef === expr.type) {
					var path = expr.body,
						next = expr.next;
		
					while (next != null) {
						if (type_FunctionRef === next.type) {
							return _extractVars(next);
						}
						if (type_SymbolRef !== next.type) {
							console.error('Ast Exception: next should be a symbol/function ref');
							return null;
						}
		
						path += '.' + next.body;
		
						next = next.next;
					}
		
					return path;
				}
		
		
				switch (expr.type) {
					case type_Statement:
					case type_UnaryPrefix:
					case type_Ternary:
						x = _extractVars(expr.body);
						refs = _append(refs, x);
						break;
				}
				
				// get also from case1 and case2
				if (type_Ternary === expr.type) {
					x = _extractVars(ast.case1);
					refs = _append(refs, x);
		
					x = _extractVars(ast.case2);
					refs = _append(refs, x);
				}
		
		
				if (type_FunctionRef === expr.type) {
					for(var i = 0, length = expr.arguments.length; i < length; i++){
						x = _extractVars(expr.arguments[i]);
						refs = _append(refs, x);
					}
					
					x = null;
					var parent = expr;
					outer: while ((parent = parent.parent)) {
						switch (parent.type) {
							case type_SymbolRef:
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
						x = _extractVars(expr.next);
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
		
	
	
		return {
			parse: expression_parse,
			
			/**
			 * Expression.eval(expression [, model, cntx, controller]) -> result
			 * - expression (String): Expression, only accessors are supoorted
			 *
			 * All symbol and function references will be looked for in 
			 *
			 * 1. model
			 * 2. cntx
			 * 3. controller
			 * 4. controller.parent
			 * 5. and so on
			 *
			 * Sample:
			 * '(user.age + 20) / 2'
			 * 'fn(user.age + "!") + x'
			 **/
			eval: expression_evaluate,
			varRefs: refs_extractVars
		};
	
	}());
	
	// source ../src/custom.js
	var custom_Utils = {
		condition: ConditionUtil.condition,
		expression: function(value, model, cntx, element, controller){
			return ExpressionUtil.eval(value, model, cntx, controller);
		},
	},
		custom_Attributes = {
			'class': null,
			id: null,
			style: null,
			name: null,
			type: null
		},
		custom_Tags = {
			// Most common html tags
			// http://jsperf.com/not-in-vs-null/3
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
			b: null,
			strong: null,
			form: null
		},
		
		// use on server to define reserved tags and its meta info
		custom_Tags_defs = {};
	
	// source ../src/dom/dom.js
	
	var Dom = {
		NODE: 1,
		TEXTNODE: 2,
		FRAGMENT: 3,
		COMPONENT: 4,
		CONTROLLER: 9,
		SET: 10,
	
		Node: Node,
		TextNode: TextNode,
		Fragment: Fragment,
		Component: Component
	};
	
	function Node(tagName, parent) {
		this.type = Dom.NODE;
	
		this.tagName = tagName;
		this.parent = parent;
		this.attr = {};
	}
	
	Node.prototype = {
		constructor: Node,
		type: Dom.NODE,
		tagName: null,
		parent: null,
		attr: null,
		nodes: null,
		__single: null
	};
	
	function TextNode(text, parent) {
		this.content = text;
		this.parent = parent;
		this.type = Dom.TEXTNODE;
	}
	
	TextNode.prototype = {
		type: Dom.TEXTNODE,
		content: null,
		parent: null
	};
	
	function Fragment(){
		this.nodes = [];
	}
	
	Fragment.prototype = {
		constructor: Fragment,
		type: Dom.FRAGMENT,
		nodes: null
	};
	
	function Component(compoName, parent, controller){
		this.tagName = compoName;
		this.parent = parent;
		this.controller = controller;
		this.attr = {};
	}
	
	Component.prototype = {
		constructor: Component,
		type: Dom.COMPONENT,
		parent: null,
		attr: null,
		controller: null,
		nodes: null,
		components: null,
		model: null,
		modelRef: null
	};
	
	// source ../src/parse/parser.js
	var Parser = (function(Node, TextNode, Fragment, Component) {
	
		var interp_START = '~',
			interp_CLOSE = ']',
	
			// ~
			interp_code_START = 126,
			// [
			interp_code_OPEN = 91,
			// ]
			interp_code_CLOSE = 93,
	
			_serialize;
	
	
		function ensureTemplateFunction(template) {
			var index = -1;
	
			/*
			 * - single char indexOf is much faster then '~[' search
			 * - function is divided in 2 parts: interpolation start lookup/ interpolation parse
			 * for better performance
			 */
			while ((index = template.indexOf(interp_START, index)) !== -1) {
				if (template.charCodeAt(index + 1) === interp_code_OPEN) {
					break;
				}
				index++;
			}
	
			if (index === -1) {
				return template;
			}
	
	
			var array = [],
				lastIndex = 0,
				i = 0,
				end;
	
	
			while (true) {
				end = template.indexOf(interp_CLOSE, index + 2);
				if (end === -1) {
					break;
				}
	
				array[i++] = lastIndex === index ? '' : template.substring(lastIndex, index);
				array[i++] = template.substring(index + 2, end);
	
	
				lastIndex = index = end + 1;
	
				while ((index = template.indexOf(interp_START, index)) !== -1) {
					if (template.charCodeAt(index + 1) === interp_code_OPEN) {
						break;
					}
					index++;
				}
	
				if (index === -1) {
					break;
				}
	
			}
	
			if (lastIndex < template.length) {
				array[i] = template.substring(lastIndex);
			}
	
			template = null;
			return function(type, model, cntx, element, controller, name) {
				if (type == null) {
					// http://jsperf.com/arguments-length-vs-null-check
					// this should be used to stringify parsed MaskDOM
					var string = '';
					for (var i = 0, x, length = array.length; i < length; i++) {
						x = array[i];
						if (i % 2 === 1) {
							string += '~[' + x + ']';
						} else {
							string += x;
						}
					}
					return string;
				}
	
				return util_interpolate(array, type, model, cntx, element, controller, name);
			};
	
		}
	
	
		function _throw(template, index, state, token) {
			var parsing = {
					2: 'tag',
					3: 'tag',
					5: 'attribute key',
					6: 'attribute value',
					8: 'literal'
				}[state],
	
				lines = template.substring(0, index).split('\n'),
				line = lines.length,
				row = lines[line - 1].length,
	
				message = ['Mask - Unexpected:', token, 'at(', line, ':', row, ') [ in', parsing, ']'];
	
			console.error(message.join(' '), {
				stopped: template.substring(index),
				template: template
			});
		}
	
	
	
		return {
	
			/** @out : nodes */
			parse: function(template) {
	
				//_serialize = T.serialize;
	
				var current = new Fragment(),
					fragment = current,
					state = 2,
					last = 3,
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
	
				var go_tag = 2,
					state_tag = 3,
					state_attr = 5,
					go_attrVal = 6,
					go_attrHeadVal = 7,
					state_literal = 8,
					go_up = 9;
	
	
				outer: while (true) {
	
					if (index < length && (c = template.charCodeAt(index)) < 33) {
						index++;
						continue;
					}
	
					// inline comments
					if (c === 47 && template.charCodeAt(index + 1) === 47) {
						// /
						index++;
						while (c !== 10 && c !== 13 && index < length) {
							// goto newline
							c = template.charCodeAt(++index);
						}
						continue;
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
	
							next = custom_Tags[token] != null
								? new Component(token, current, custom_Tags[token])
								: new Node(token, current);
	
							if (current.nodes == null) {
								current.nodes = [next];
							} else {
								current.nodes.push(next);
							}
	
							current = next;
	
	
							state = state_attr;
	
						} else if (last === state_literal) {
	
							next = new TextNode(token, current);
	
							if (current.nodes == null) {
								current.nodes = [next];
							} else {
								current.nodes.push(next);
							}
	
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
							nindex, _char = c === 39 ? "'" : '"';
	
						start = index;
	
						while ((nindex = template.indexOf(_char, index)) > -1) {
							index = nindex;
							if (template.charCodeAt(nindex - 1) !== 92 /*'\\'*/ ) {
								break;
							}
							isEscaped = true;
							index++;
						}
	
						if (start === index) {
							nextC = template.charCodeAt(index + 1);
							if (nextC === 124 || nextC === c) {
								// | (obsolete) or triple quote
								isUnescapedBlock = true;
								start = index + 2;
								index = nindex = template.indexOf((nextC === 124 ? '|' : _char) + _char + _char, start);
	
								if (index === -1) {
									index = length;
								}
	
							}
						}
	
						token = template.substring(start, index);
						if (isEscaped === true) {
							token = token.replace(regexpEscapedChar[_char], _char);
						}
	
						token = ensureTemplateFunction(token);
	
	
						index += isUnescapedBlock ? 3 : 1;
						continue;
					}
	
	
					if (state === go_tag) {
						last = state_tag;
						state = state_tag;
	
						if (c === 46 /* . */ || c === 35 /* # */ ) {
							token = 'div';
							continue;
						}
					}
	
					else if (state === state_attr) {
						if (c === 46) {
							// .
							index++;
							key = 'class';
							state = go_attrHeadVal;
						} else if (c === 35) {
							// #
							index++;
							key = 'id';
							state = go_attrHeadVal;
						} else if (c === 61) {
							// =;
							index++;
							state = go_attrVal;
							continue;
						} else {
	
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
							_throw(template, index, state, String.fromCharCode(c));
							break;
						}
						// endif
	
	
						if (last !== go_attrVal && (c === 46 || c === 35)) {
							// .#
							// break on .# only if parsing attribute head values
							break;
						}
	
						if (c === 61 || c === 62 || c === 123 || c < 33 || c === 59) {
							// =>{ ;
							break;
						}
	
	
						index++;
					}
	
					token = template.substring(start, index);
	
					// if DEBUG
					if (!token) {
						_throw(template, index, state, '*EMPTY*');
						break;
					}
					if (isInterpolated === true && state === state_tag) {
						_throw(template, index, state, 'Tag Names cannt be interpolated (in dev)');
						break;
					}
					// endif
	
	
					if (isInterpolated === true && (state === state_attr && key === 'class') === false) {
						token = ensureTemplateFunction(token);
					}
	
				}
	
				////if (isNaN(c)) {
				////	_throw(template, index, state, 'Parse IndexOverflow');
				////
				////}
	
				// if DEBUG
				if (current.parent != null && current.parent !== fragment && current.parent.__single !== true && current.nodes != null) {
					console.warn('Mask - ', current.parent.tagName, JSON.stringify(current.parent.attr), 'was not proper closed.');
				}
				// endif
	
	
				return fragment.nodes.length === 1 ? fragment.nodes[0] : fragment;
			},
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
					console.error('Interpolation Start must contain 2 Characters');
					return;
				}
				if (!end || end.length !== 1) {
					console.error('Interpolation End must be of 1 Character');
					return;
				}
	
				interp_code_START = start.charCodeAt(0);
				interp_code_OPEN = start.charCodeAt(1);
				interp_code_CLOSE = end.charCodeAt(0);
				interp_CLOSE = end;
				interp_START = start.charAt(0);
			},
			
			ensureTemplateFunction: ensureTemplateFunction
		};
	}(Node, TextNode, Fragment, Component));
	

	// source ../src/build/html/builder.js
	var builder_build = (function() {
	
		// source stringify.js
		
		function html_stringify(document, model, component) {
		
			component = html_prepairControllers(component);
		
			if (component.components == null || component.components.length === 0) {
				return html_toString(document);
			}
		
		
			var first = document.firstChild,
				id = component.ID || (component.ID = Date.now()),
				setupCode = "" //
				+ "<script type='text/javascript'>(" //
				+ html_maskSetup.toString() //
				+ '(' //
				+ JSON.stringify(component) //
				+ ', ' //
				+ (model != null ? JSON.stringify(model) : 'null') + ')); </script>';
		
		
		
			if (first && first.nodeType === Dom.DOCTYPE) {
		
				var html = first.nextNode;
		
				if (html) {
					var body = html.firstChild;
					while(body && body.tagName !== 'body'){
						body = body.nextNode;
					}
		
					if (body){
						body.appendChild(new html_TextNode(setupCode));
					}else{
						console.warn('Body not found');
					}
				}
		
				return html_toString(document);
			}
		
			return '' //
			+ "<script type='mask/html-template-start' id='mask-htmltemplate-" + id + "'></script>" //
			+ html_toString(document) //
			+ "<script type='mask/html-template-end' name='mask-htmltemplate-" + id + "'></script>" //
			+ setupCode;
		
		}
		
		function html_maskSetup(meta, model) {
		
		
			var fragment, parent = {
				components: []
			};
		
			function findElements(fragment, id, elements) {
				if (elements == null) {
					elements = [];
				}
		
				if (fragment instanceof Array) {
					for (var i = 0, x, length = fragment.length; i < length; i++) {
						x = fragment[i];
						findElements(x, id, elements);
					}
					return elements;
				}
		
				if (fragment.getAttribute('x-compo-id') === id) {
					elements.push(fragment);
				}
		
				var childs = document.querySelectorAll('[x-compo-id="' + id + '"]');
		
				if (childs.length){
					var l = elements.length;
					for(var i = 0, length = childs.length; i < length; i++){
						elements[l++] = childs[i];
					}
		
				}
		
		
				return elements;
			}
		
			function setupComponent(meta, model, parent, fragment) {
				var handler, elements;
				if (meta.compoName) {
					var Handler = mask.getHandler(meta.compoName);
		
					if (Handler == null){
						console.error('Component Handler was not loaded:', meta.compoName);
						return;
					}
		
					handler = typeof Handler === 'function' ? new Handler(model) : Handler;
		
		
		
						handler.attr = {};
		
						if (typeof handler.renderStart === 'function') {
							handler.renderStart(model);
						}
		
						elements = findElements(fragment, meta.ID);
		
						handler.ID = meta.ID;
		
						if (typeof handler.renderEnd === 'function') {
							handler.renderEnd(elements, model);
						}
		
		
						if (parent.components == null) {
							parent.components = [];
						}
		
						parent.components.push(handler);
		
				}
		
				if (meta.components) {
					var _parent = handler || parent,
						_fragment = elements && elements.length ? elements : fragment;
		
					for (var i = 0, x, length = meta.components.length; i < length; i++) {
						x = meta.components[i];
						html_maskSetup(x, model, _parent, _fragment);
					}
				}
			}
		
		
			var id = 'mask-htmltemplate-' + meta.ID,
				startNode = document.getElementById(id);
		
			if (startNode != null) {
		
				var endNode = document.getElementsByName(id)[0];
		
				if (startNode == null || endNode == null) {
					console.error('Invalid node range to initialize mask components');
					return;
				}
		
				var array = [],
					node = startNode.nextSibling;
				while (node != null && node != endNode) {
					array.push(node);
		
					node = node.nextSibling;
				}
		
				fragment = array;
			} else {
				fragment = document.body;
			}
		
		
			for (var i = 0, x, length = meta.components.length; i < length; i++) {
				x = meta.components[i];
				setupComponent(x, model, parent, fragment);
			}
		
			if (typeof Compo !== 'undefined') {
				Compo.signal.emitIn(parent, 'domInsert');
			}
		
		
		}
		
		function html_prepairControllers(controller, output) {
			if (output == null) {
				output = {};
			}
		
			output.compoName = controller.compoName;
			output.ID = controller.ID;
		
			if (controller.components) {
				var compos = [],
					array = controller.components;
				for (var i = 0, x, length = array.length; i < length; i++) {
					x = array[i];
		
					compos.push(html_prepairControllers(x));
				}
		
				output.components = compos;
			}
		
			return output;
		
		}
		
		// source util.js
		
		var html_SingleTags = {
		
		};
		
		function html_appendChild(child) {
			if (this.firstChild == null) {
				this.firstChild = this.lastChild = child;
				return;
			}
			this.lastChild.nextNode = child;
			this.lastChild = child;
		}
		
		function html_toString(element) {
		
			var nodeType = element.nodeType,
				string = '';
		
		
			if (Dom.FRAGMENT === nodeType) {
				element = element.firstChild;
				while (element != null) {
					string += html_toString(element);
		
					element = element.nextNode;
				}
		
				return string;
			}
		
			if (Dom.DOCTYPE === nodeType) {
				return element.doctype;
			}
		
		
			if (Dom.NODE === nodeType) {
				var tagName = element.tagName,
					attr = element.attributes,
					value;
		
				string = '<' + tagName;
		
				for (var key in attr) {
					value = attr[key];
		
					string += ' ' + key + '="' + (typeof value === 'string' ? value.replace(/"/g, '\\"') : value) + '"';
				}
		
				if (html_SingleTags[tagName] === 1) {
					string += '/>';
		
					return string;
				}
		
				string += '>';
		
				element = element.firstChild;
				while (element != null) {
					string += html_toString(element);
					element = element.nextNode;
				}
		
				return string + '</' + tagName + '>';
		
			}
		
			if (Dom.TEXTNODE === nodeType) {
				return element.textContent;
			}
		
		
			console.error('Unknown node Type', nodeType, element.tagName, element.textContent, element.firstChild == null);
			return '';
		}
		
		
		// source html_dom.js
		
		util_extend(Dom, {
			DOCTYPE: 11
		});
		
		
		function html_DocumentFragment() {}
		
		html_DocumentFragment.prototype = {
			constructor: html_DocumentFragment,
			nodeType: Dom.FRAGMENT,
			firstChild: null,
			lastChild: null,
			nextNode: null,
			appendChild: html_appendChild
		}
		
		
		function html_Element(name) {
			this.tagName = name;
			this.attributes = {};
		}
		
		html_Element.prototype = {
			constructor: html_Element,
			nodeType: Dom.NODE,
			firstChild: null,
			lastChild: null,
			nextNode: null,
			appendChild: html_appendChild,
			setAttribute: function(key, value){
				this.attributes[key] = value;
			},
			getAttribute: function(key){
				return this.attributes[key];
			}
		};
		
		
		function html_TextNode(text){
			this.textContent = text;
		}
		
		html_TextNode.prototype = {
			constructor: html_TextNode,
			nodeType: Dom.TEXTNODE,
			nextNode: null
		};
		
		
		function html_DOCTYPE(doctype){
			this.doctype = doctype;
		}
		html_DOCTYPE.prototype = {
			constructor: html_DOCTYPE,
			nodeType: Dom.DOCTYPE
		};
		
		var document = {
			createDocumentFragment: function(){
				return new html_DocumentFragment();
			},
			createElement: function(name){
				return new html_Element(name);
			},
			createTextNode: function(text){
				return new html_TextNode(text);
			}
		};
		
		// source handlers/document.js
		(function() {
		
		
			function Document() {}
		
			custom_Tags[':document'] = Document;
		
			Document.prototype = {
				render: function(model, cntx, fragment, controller) {
		
					var attr = this.attr,
						nodes = this.nodes,
						doctype = attr.doctype || 'html';
		
					delete attr.doctype;
		
					fragment.appendChild(new html_DOCTYPE('<!DOCTYPE ' + doctype + '>'));
		
					var html = {
						tagName: 'html',
						type: Dom.NODE,
						attr: attr,
						nodes: [],
					}, head, body, handleBody;
		
					for (var i = 0, x, length = nodes.length; i < length; i++) {
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
						for (var i = 0, x, length = nodes.length; i < length; i++) {
							x = nodes[i];
							if (x.tagName === 'head') {
								continue;
							}
							if (x.tagName === 'body') {
								continue;
							}
		
							body.nodes.push(x);
						}
					}
		
		
					var owner = this.parent;
					owner.components = [];
		
					builder_html(html, model, cntx, fragment, owner);
		
					return fragment;
				}
			};
		
		}());
		
	
	
		var _controllerID = 0;
	
		function builder_html(node, model, cntx, container, controller) {
	
			if (node == null) {
				return container;
			}
	
			var type = node.type,
				elements,
				childs,
				j, jmax, key, value;
	
			if (type === 10 /*SET*/ || node instanceof Array) {
				for (j = 0, jmax = node.length; j < jmax; j++) {
					builder_html(node[j], model, cntx, container, controller);
				}
				return container;
			}
	
			if (type == null) {
				// in case if node was added manually, but type was not set
				if (node.tagName != null) {
					type = 1;
				} else if (node.content != null) {
					type = 2;
				}
			}
	
			if (type === 1 /* Dom.NODE */) {
				// source ../type.node.js
				
				var tagName = node.tagName,
					attr = node.attr,
					tag;
				
				// if DEBUG
				try {
				// endif
					tag = document.createElement(tagName);
				// if DEBUG
				} catch(error) {
					console.error(tagName, 'element cannot be created. If this should be a custom handler tag, then controller is not defined');
					return;
				}
				// endif
				
				
				if (childs != null){
					childs.push(tag);
					childs = null;
					attr['x-compo-id'] = controller.ID;
				}
				
				// ++ insert tag into container before setting attributes, so that in any
				// custom util parentNode is available. This is for mask.node important
				// http://jsperf.com/setattribute-before-after-dom-insertion/2
				if (container != null) {
					container.appendChild(tag);
				}
				
				
				for (key in attr) {
				
					/* if !SAFE
					if (hasOwnProp.call(attr, key) === false) {
						continue;
					}
					*/
				
					if (typeof attr[key] === 'function') {
						value = attr[key]('attr', model, cntx, tag, controller, key);
						if (value instanceof Array) {
							value = value.join('');
						}
				
					} else {
						value = attr[key];
					}
				
					// null or empty string will not be handled
					if (value) {
						if (typeof custom_Attributes[key] === 'function') {
							custom_Attributes[key](node, value, model, cntx, tag, controller, container);
						} else {
							tag.setAttribute(key, value);
						}
					}
				
				}
				
				
				container = tag;
				
			}
	
			if (type === 2 /* Dom.TEXTNODE */) {
				// source ../type.textNode.js
				var x, content, result, text;
				
				content = node.content;
				
				if (typeof content === 'function') {
				
					result = content('node', model, cntx, container, controller);
				
					if (typeof result === 'string') {
						container.appendChild(document.createTextNode(result));
				
					} else {
				
						text = '';
						// result is array with some htmlelements
						for (j = 0, jmax = result.length; j < jmax; j++) {
							x = result[j];
				
							if (typeof x === 'object') {
								// In this casee result[j] should be any HTMLElement
								if (text !== '') {
									container.appendChild(document.createTextNode(text));
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
							container.appendChild(document.createTextNode(text));
						}
					}
				
				} else {
					container.appendChild(document.createTextNode(content));
				}
				
				return container;
			}
	
			if (type === 4 /* Dom.COMPONENT */) {
				// source ../type.component.js
				var Handler = node.controller,
					handler = typeof Handler === 'function' ? new Handler(model) : Handler,
					attr;
				
				if (handler != null) {
					/* if (!DEBUG)
					try{
					*/
				
					handler.compoName = node.tagName;
					handler.attr = attr = util_extend(handler.attr, node.attr);
				
				
					for (key in attr) {
						if (typeof attr[key] === 'function') {
							attr[key] = attr[key]('attr', model, cntx, container, controller, key);
						}
					}
				
					if (node.nodes != null) {
						handler.nodes = node.nodes;
					}
					
					handler.parent = controller;
				
					if (listeners != null && listeners['compoCreated'] != null) {
						var fns = listeners.compoCreated;
				
						for (j = 0, jmax = fns.length; j < jmax; j++) {
							fns[j](handler, model, cntx, container);
						}
				
					}
				
					if (typeof handler.renderStart === 'function') {
						handler.renderStart(model, cntx, container);
					}
				
					/* if (!DEBUG)
					} catch(error){ console.error('Custom Tag Handler:', node.tagName, error); }
					*/
				
				
					node = handler;
				}
				
				if (controller.components == null) {
					controller.components = [node];
				} else {
					controller.components.push(node);
				}
				
				controller = node;
				controller.ID = ++_controllerID;
				elements = [];
				
				if (controller.async === true) {
					controller.await(build_resumeDelegate(controller, model, cntx, container));
					return container;
				}
				
				if (controller.model != null) {
					model = controller.model;
				}
				
				if (handler != null && handler.tagName != null && handler.tagName !== node.compoName) {
					handler.nodes = {
						tagName: handler.tagName,
						attr: handler.attr,
						nodes: handler.nodes,
						type: 1
					};
				}
				
				
				if (typeof controller.render === 'function') {
					// with render implementation, handler overrides render behaviour of subnodes
					controller.render(model, cntx, container);
					return container;
				}
				
			}
	
			var nodes = node.nodes;
			if (nodes != null) {
	
				var isarray = nodes instanceof Array,
					length = isarray === true ? nodes.length : 1,
					i = 0, childNode;
	
	
				for (; i < length; i++) {
	
					childNode = isarray === true ? nodes[i] : nodes;
	
					if (type === 4 /* Dom.COMPONENT */ && childNode.type === 1 /* Dom.NODE */){
						childNode.attr['x-compo-id'] = node.ID;
					}
	
					builder_html(childNode, model, cntx, container, controller);
				}
	
			}
	
	
			return container;
		}
	
	
		return function(template, model, cntx) {
			var doc = new html_DocumentFragment(),
				component = new Component();
	
	
			builder_html(template, model, cntx, doc, component);
	
			return html_stringify(doc, model, component);
		};
	
	}());
	
	
	// source ../src/mask.js
	
	/**
	 *  mask
	 *
	 **/
	
	var cache = {},
		Mask = {
	
			/**
			 *	mask.render(template[, model, cntx, container = DocumentFragment, controller]) -> container
			 * - template (String | MaskDOM): Mask String or Mask DOM Json template to render from.
			 * - model (Object): template values
			 * - cntx (Object): can store any additional information, that custom handler may need,
			 * this object stays untouched and is passed to all custom handlers
			 * - container (IAppendChild): container where template is rendered into
			 * - controller (Object): instance of an controller that own this template
			 *
			 *	Create new Document Fragment from template or append rendered template to container
			 **/
			render: function (template, model, cntx, container, controller) {
	
				// if DEBUG
				if (container != null && typeof container.appendChild !== 'function'){
					console.error('.render(template[, model, cntx, container, controller]', 'Container should implement .appendChild method');
					console.warn('Args:', arguments);
				}
				// endif
	
				if (typeof template === 'string') {
					if (hasOwnProp.call(cache, template)){
						/* if Object doesnt contains property that check is faster
						then "!=null" http://jsperf.com/not-in-vs-null/2 */
						template = cache[template];
					}else{
						template = cache[template] = Parser.parse(template);
					}
				}
				
				if (cntx == null) {
					cntx = {};
				}
				
				return builder_build(template, model, cntx, container, controller);
			},
	
			/* deprecated, renamed to parse */
			compile: Parser.parse,
	
			/**
			 *	mask.parse(template) -> MaskDOM
			 * - template (String): string to be parsed into MaskDOM
			 *
			 * Create MaskDOM from Mask markup
			 **/
			parse: Parser.parse,
	
			build: builder_build,
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
			 *		.renderStart(model, cntx, container)
			 *		.renderEnd(elements, model, cntx, container)
			 *
			 *	Custom Handler now can handle rendering of underlined nodes.
			 *	The most simple example to continue rendering is:
			 *	mask.render(this.nodes, model, container, cntx);
			 **/
			registerHandler: function (tagName, TagHandler) {
				custom_Tags[tagName] = TagHandler;
			},
			/**
			 *	mask.getHandler(tagName) -> Function | Object
			 * - tagName (String):
			 *
			 *	Get Registered Handler
			 **/
			getHandler: function (tagName) {
				return tagName != null
					? custom_Tags[tagName]
					: custom_Tags;
			},
	
	
			/**
			 * mask.registerAttrHandler(attrName, mix, Handler) -> void
			 * - attrName (String): any attribute string name
			 * - mix (String | Function): Render Mode or Handler Function if 'both'
			 * - Handler (Function)
			 *
			 * Handler Interface, <i>(similar to Utility Interface)</i>
			 * ``` customAttribute(maskNode, attributeValue, model, cntx, element, controller) ```
			 *
			 * You can change do any changes to maskNode's template, current element value,
			 * controller, model.
			 *
			 * Note: Attribute wont be set to an element.
			 **/
			registerAttrHandler: function(attrName, mix, Handler){
				if (fn_isFunction(mix)) {
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
			 *	function(expr, model, cntx, element, controller, attrName, type);
			 *	```
			 *
			 *	- value (String): string from interpolation part after util definition
			 *	- model (Object): current Model
			 *	- type (String): 'attr' or 'node' - tells if interpolation is in TEXTNODE value or Attribute
			 *	- cntx (Object): Context Object
			 *	- element (HTMLNode): current html node
			 *	- name (String): If interpolation is in node attribute, then this will contain attribute name
			 *
			 *  Object interface:
			 *  ```
			 *  {
			 *  	nodeRenderStart: function(expr, model, cntx, element, controller){}
			 *  	node: function(expr, model, cntx, element, controller){}
			 *
			 *  	attrRenderStart: function(expr, model, cntx, element, controller, attrName){}
			 *  	attr: function(expr, model, cntx, element, controller, attrName){}
			 *  }
			 *  ```
			 *
			 *	This diff nodeRenderStart/node is needed to seperate util logic.
			 *	Mask in node.js will call only node-/attrRenderStart,
			 *  
			 **/
			
			registerUtil: function(utilName, mix){
				if (typeof mix === 'function') {
					custom_Utils[utilName] = mix;
					return;
				}
				
				if (typeof mix.process !== 'function') {
					mix.process = function(expr, model, cntx, element, controller, attrName, type){
						if ('node' === type) {
							
							this.nodeRenderStart(expr, model, cntx, element, controller);
							return this.node(expr, model, cntx, element, controller);
						}
						
						// asume 'attr'
						
						this.attrRenderStart(expr, model, cntx, element, controller, attrName);
						return this.attr(expr, model, cntx, element, controller, attrName);
					};
				
				}
				
				custom_Utils[utilName] = mix;
			},
			
			getUtil: function(util){
				return util != null
					? custom_Utils[util]
					: custom_Utils;
			},
			
			registerUtility: function (utilityName, fn) {
				console.warn('@registerUtility - deprecated - use registerUtil(utilName, mix)', utilityName);
				
				this.registerUtility = this.registerUtil;
				this.registerUtility(utilityName, fn);
			},
			
			getUtility: function(util){
				console.warn('@getUtility - deprecated - use getUtil(utilName)', util);
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
			//- removed as needed interface can be implemented without this
			//- ICustomTag: ICustomTag,
	
			/** deprecated
			 *	mask.ValueUtils -> Object
			 *
			 *	see Utils.Condition Object instead
			 **/
			ValueUtils: {
				condition: ConditionUtil.condition,
				out: ConditionUtil
			},
	
			Utils: {
				Condition: ConditionUtil,
				
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
				getProperty: util_getProperty,
				
				ensureTmplFn: Parser.ensureTemplateFunction
			},
			Dom: Dom,
			plugin: function(source){
				eval(source);
			},
			on: function(event, fn){
				if (listeners == null){
					listeners = {};
				}
	
				(listeners[event] || (listeners[event] = [])).push(fn);
			},
	
			/*
			 *	Stub for reload.js, which will be used by includejs.autoreload
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
			
			
			compoIndex: function(index){
				_controllerID = index;
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
	 *	mask.renderDom(template[, model, container, cntx]) -> container
	 *
	 * Use [[mask.render]] instead
	 * (to keep backwards compatiable)
	 **/
	Mask.renderDom = Mask.render;
	



	// source ../src/formatter/stringify.lib.js
	(function(mask){
	
	
		// source stringify.js
		
		var stringify = (function() {
		
		
			var _minimizeAttributes,
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
		
				if (indent == null) {
					indent = 0;
				}
		
				if (output == null) {
					outer = true;
					output = [];
				}
		
				var index = output.length;
		
				if (node.type === Dom.FRAGMENT){
					node = node.nodes;
				}
		
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
		
				if (outer) {
					return output.join(_indent === 0 ? '' : '\n');
				}
		
			}
		
			function processNode(node, currentIndent, output) {
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
					output.push(processNodeHead(node) + ' > ');
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
					_id = node.attr.id || '',
					_class = node.attr['class'] || '';
		
		
				if (typeof _id === 'function'){
					_id = _id();
				}
				if (typeof _class === 'function'){
					_class = _class();
				}
		
				if (_id) {
					if (_id.indexOf(' ') !== -1) {
						_id = '';
					} else {
						_id = '#' + _id;
					}
				}
		
				if (_class) {
					_class = '.' + _class.split(' ').join('.');
				}
		
				var attr = '';
		
				for (var key in node.attr) {
					if (key === 'id' || key === 'class') {
						// the properties was not deleted as this template can be used later
						continue;
					}
					var value = node.attr[key];
		
					if (typeof value === 'function'){
						value = value();
					}
		
					if (_minimizeAttributes === false || /\s/.test(value)){
						value = wrapString(value);
					}
		
					attr += ' ' + key + '=' + value;
				}
		
				if (tagName === 'div' && (_id || _class)) {
					tagName = '';
				}
		
				return tagName + _id + _class + attr;
			}
		
		
			function isEmpty(node) {
				return node.nodes == null || (node.nodes instanceof Array && node.nodes.length === 0);
			}
		
			function isSingle(node) {
				return node.nodes && (node.nodes instanceof Array === false || node.nodes.length === 1);
			}
		
			function getSingle(node) {
				if (node.nodes instanceof Array) {
					return node.nodes[0];
				}
				return node.nodes;
			}
		
			function wrapString(str) {
				if (str.indexOf('"') === -1) {
					return '"' + str.trim() + '"';
				}
		
				if (str.indexOf("'") === -1) {
					return "'" + str.trim() + "'";
				}
		
				return '"' + str.replace(/"/g, '\\"').trim() + '"';
			}
		
			/**
			 *	- settings (Number | Object) - Indention Number (0 - for minification)
			 **/
			return function(input, settings) {
				if (input == null) {
					return '';
				}
				
				if (typeof input === 'string') {
					input = mask.parse(input);
				}
		
		
				if (typeof settings === 'number'){
					_indent = settings;
					_minimizeAttributes = _indent === 0;
				}else{
					_indent = settings && settings.indent || 4;
					_minimizeAttributes = _indent === 0 || settings && settings.minimizeAttributes;
				}
		
		
				return run(input);
			};
		}());
		
	
		mask.stringify = stringify;
	
	}(Mask));
	


	/* Handlers */

	// source ../src/handlers/sys.js
	(function(mask) {
	
		function Sys() {
			this.attr = {};
		}
	
		mask.registerHandler('%', Sys);
	
		Sys.prototype = {
			'debugger': null,
			'use': null,
			'repeat': null,
			'if': null,
			'else': null,
			'each': null,
			'log': null,
			'visible': null,
			'model': null,
			
			constructor: Sys,
			renderStart: function(model, cntx, container) {
				var attr = this.attr;
	
				if (attr['use'] != null) {
					var use = attr['use'];
					this.model = util_getProperty(model, use);
					this.modelRef = use;
					return;
				}
	
				if (attr['debugger'] != null) {
					debugger;
					return;
				}
				
				if (attr['visible'] != null) {
					var state = ExpressionUtil.eval(attr.visible, model, cntx, this.parent);
					if (!state) {
						this.nodes = null;
					}
					return;
				}
	
				if (attr['log'] != null) {
					var key = attr.log,
						value = util_getProperty(model, key);
	
					console.log('Key: %s, Value: %s', key, value);
					return;
				}
	
				if (attr['repeat'] != null) {
					repeat(this, model, cntx, container);
				}
	
				if (attr['if'] != null) {
					var check = attr['if'];
	
					this.state = ConditionUtil.isCondition(check, model);
	
					if (!this.state) {
						this.nodes = null;
					}
					return;
				}
	
				if (attr['else'] != null) {
					var compos = this.parent.components,
						prev = compos && compos[compos.length - 1];
	
					if (prev != null && prev.compoName === '%' && prev.attr['if'] != null) {
	
						if (prev.state) {
							this.nodes = null;
						}
						return;
					}
					console.error('Previous Node should be "% if=\'condition\'"', prev, this.parent);
					return;
				}
	
				// foreach is deprecated
				if (attr['each'] != null || attr['foreach'] != null) {
					each(this, model, cntx, container);
				}
			},
			render: null
		};
	
	
		function each(compo, model, cntx, container){
			if (compo.nodes == null && typeof Compo !== 'undefined'){
				Compo.ensureTemplate(compo);
			}
	
			var prop = compo.attr.foreach || compo.attr.each,
				array = util_getProperty(model, prop),
				nodes = compo.nodes,
				item = null,
				indexAttr = compo.attr.index || 'index';
	
			if (array == null) {
				var parent = compo;
				while (parent != null && array == null) {
					array = util_getProperty(parent, prop);
					parent = parent.parent;
				}
			}
			
			compo.nodes = [];
			compo.model = array;
			compo.modelRef = prop;
			
			compo.template = nodes;
			compo.container = container;
			
	
			if (array == null || typeof array !== 'object' || array.length == null){
				return;
			}
	
			for (var i = 0, x, length = array.length; i < length; i++) {
				x = compo_init(nodes, array[i], i, container, compo);
				x[indexAttr] = i;
				compo.nodes[i] = x;
			}
	
			for(var method in ListProto){
				compo[method] = ListProto[method];
			}
		}
	
		function repeat(compo, model, cntx, container) {
			var repeat = compo.attr.repeat.split('..'),
				index = +repeat[0],
				length = +repeat[1],
				template = compo.nodes,
				x;
	
			// if DEBUG
			(isNaN(index) || isNaN(length)) && console.error('Repeat attribute(from..to) invalid', compo.attr.repeat);
			// endif
	
			compo.nodes = [];
	
			for (var i = 0; index < length; index++) {
				x = compo_init(template, model, index, container, compo);
				x._repeatIndex = index;
	
				compo.nodes[i++] = x;
			}
		}
	
		function compo_init(nodes, model, modelRef, container, parent) {
			var item = new Component();
			item.nodes = nodes;
			item.model = model;
			item.container = container;
			item.parent = parent;
			item.modelRef = modelRef;
	
			return item;
		}
	
	
		var ListProto = {
			append: function(model){
				var item;
				item = new Component();
				item.nodes = this.template;
				item.model = model;
	
				mask.render(item, model, null, this.container, this);
			}
		};
	
	}(Mask));
	
	// source ../src/handlers/utils.js
	(function(mask) {
	
		/**
		 *	:template
		 *
		 *	Child nodes wont be rendered. You can resolve it as custom component and get its nodes for some use
		 *
		 **/
	
		var TemplateCollection = {};
	
		mask.templates = TemplateCollection;
	
		mask.registerHandler(':template', TemplateHandler);
	
		function TemplateHandler() {}
		TemplateHandler.prototype.render = function() {
			if (this.attr.id == null) {
				console.warn('Template Should be defined with ID attribute for future lookup');
				return;
			}
	
			TemplateCollection[this.attr.id] = this.nodes;
		};
	
	
		mask.registerHandler(':import', ImportHandler);
	
		function ImportHandler() {}
		ImportHandler.prototype = {
			constructor: ImportHandler,
			attr: null,
			template: null,
	
			renderStart: function() {
				if (this.attr.id) {
	
					this.nodes = this.template;
	
					if (this.nodes == null) {
						this.nodes = TemplateCollection[this.attr.id];
					}
	
					// @TODO = optimize, not use jmask
					if (this.nodes == null) {
						var parent = this,
							template,
							selector = ':template[id='+this.attr.id+']';
	
						while (template == null && (parent = parent.parent) != null) {
							if (parent.nodes != null) {
								template = jmask(parent.nodes).filter(selector).get(0);
							}
						}
	
						if (template != null) {
							this.nodes = template.nodes;
						}
	
	
					}
	
					// @TODO = load template from remote
					if (this.nodes == null) {
						console.warn('Template could be not imported', this.attr.id);
					}
				}
			}
		};
	
	
		/**
		 *	:html
		 *
		 *	Shoud contain literal, that will be added as innerHTML to parents node
		 *
		 **/
		mask.registerHandler(':html', HTMLHandler);
	
		function HTMLHandler() {}
		
		HTMLHandler.prototype = {
			mode: 'server:all',
			render: function(model, cntx, container) {
	
				var html = jmask(this.nodes).text(model, cntx, this);
		
				if (!html) {
					console.warn('No HTML for node', this);
					return;
				}
				
				if (container.insertAdjacentHTML) {
					container.insertAdjacentHTML('beforeend', html);
					return;
				}
			
				this.toHtml = function(){
					return html;
				};
				
			}
		};
	
	}(Mask));
	

	// source ../src/libs/compo.js
	
	var Compo = exports.Compo = (function(mask){
		'use strict';
		// source ../src/scope-vars.js
		var domLib = global.jQuery || global.Zepto || global.$,
			Dom = mask.Dom,
			__array_slice = Array.prototype.slice,
			
			_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn;
		
		function _mask_ensureTmplFn(value) {
			if (typeof value !== 'string') {
				return value;
			}
			return _mask_ensureTmplFnOrig(value);
		}
		
		if (document != null && domLib == null){
			console.warn('jQuery / Zepto etc. was not loaded before compo.js, please use Compo.config.setDOMLibrary to define dom engine');
		}
		
	
		// source ../src/util/object.js
		function obj_extend(target, source){
			if (target == null){
				target = {};
			}
			if (source == null){
				return target;
			}
		
			for(var key in source){
				target[key] = source[key];
			}
		
			return target;
		}
		
		function obj_copy(object) {
			var copy = {};
		
			for (var key in object) {
				copy[key] = object[key];
			}
		
			return copy;
		}
		
		// source ../src/util/function.js
		function fn_proxy(fn, context) {
			
			return function(){
				return fn.apply(context, arguments);
			};
			
		}
		// source ../src/util/selector.js
		function selector_parse(selector, type, direction) {
			if (selector == null){
				console.warn('selector is null for type', type);
			}
		
			if (typeof selector === 'object'){
				return selector;
			}
		
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
					selector = new RegExp('\\b' + selector.substring(1) + '\\b');
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
		}
		
		function selector_match(node, selector, type) {
			if (typeof selector === 'string') {
				if (type == null) {
					type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
				}
				selector = selector_parse(selector, type);
			}
		
			var obj = selector.prop ? node[selector.prop] : node;
			if (obj == null) {
				return false;
			}
		
			if (selector.selector.test != null) {
				if (selector.selector.test(obj[selector.key])) {
					return true;
				}
			} else {
				// == - to match int and string
				if (obj[selector.key] == selector.selector) {
					return true;
				}
			}
		
			return false;
		}
		
		// source ../src/util/traverse.js
		function find_findSingle(node, matcher) {
			if (node instanceof Array) {
				for (var i = 0, x, length = node.length; i < length; i++) {
					x = node[i];
					var r = find_findSingle(x, matcher);
					if (r != null) {
						return r;
					}
				}
				return null;
			}
		
			if (selector_match(node, matcher) === true) {
				return node;
			}
			return (node = node[matcher.nextKey]) && find_findSingle(node, matcher);
		}
		
		// source ../src/util/dom.js
		function dom_addEventListener(element, event, listener) {
			
			// allows custom events - in x-signal, for example
			if (domLib != null) {
				domLib(element).on(event, listener);
				return;
			}
			
			if (element.addEventListener != null) {
				element.addEventListener(event, listener, false);
				return;
			}
			if (element.attachEvent) {
				element.attachEvent("on" + event, listener);
			}
		}
		
		// source ../src/util/domLib.js
		/**
		 *	Combine .filter + .find
		 */
		
		function domLib_find($set, selector) {
			return $set.filter(selector).add($set.find(selector));
		}
		
		function domLib_on($set, type, selector, fn) {
		
			if (selector == null) {
				return $set.on(type, fn);
			}
		
			$set.on(type, selector, fn);
			$set.filter(selector).on(type, fn);
			return $set;
		}
		
	
		// source ../src/compo/children.js
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
						console.error('Unknown component child', name, compos[name]);
						console.warn('Is this object shared within multiple compo classes? Define it in constructor!');
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
		
		// source ../src/compo/events.js
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
		
		// source ../src/compo/events.deco.js
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
		
		// source ../src/compo/pipes.js
		var Pipes = (function() {
		
		
			mask.registerAttrHandler('x-pipe-signal', function(node, attrValue, model, cntx, element, controller) {
		
				var arr = attrValue.split(';');
				for (var i = 0, x, length = arr.length; i < length; i++) {
					x = arr[i].trim();
					if (x === '') {
						continue;
					}
		
					var event = x.substring(0, x.indexOf(':')),
						handler = x.substring(x.indexOf(':') + 1).trim(),
						dot = handler.indexOf('.'),
						pipe, signal;
		
					if (dot === -1) {
						console.error('define pipeName "click: pipeName.pipeSignal"');
						return;
					}
		
					pipe = handler.substring(0, dot);
					signal = handler.substring(++dot);
		
					var Handler = _handler(pipe, signal);
		
		
					// if DEBUG
					!event && console.error('Signal: event type is not set', attrValue);
					// endif
		
		
					if (EventDecorator != null) {
						event = EventDecorator(event);
					}
		
					dom_addEventListener(element, event, Handler);
		
				}
			});
		
			function _handler(pipe, signal) {
				return function(){
					new Pipe(pipe).emit(signal);
				};
			}
		
			var Collection = {};
		
		
			function pipe_attach(pipeName, controller) {
				if (controller.pipes[pipeName] == null) {
					console.error('Controller has no pipes to be added to collection', pipeName, controller);
					return;
				}
		
				if (Collection[pipeName] == null) {
					Collection[pipeName] = [];
				}
				Collection[pipeName].push(controller);
			}
		
			function pipe_detach(pipeName, controller) {
				var pipe = Collection[pipeName],
					i = pipe.length;
		
				while (--i) {
					if (pipe[i] === controller) {
						pipe.splice(i, 1);
						i++;
					}
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
					console.error('Controller has no pipes', controller);
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
				emit: function(signal, args){
					var controllers = Collection[this.pipeName],
						pipeName = this.pipeName;
					if (controllers == null) {
						console.warn('Pipe.emit: No signals were bound to a Pipe', pipeName);
						return;
					}
		
					var i = controllers.length,
						controller, slots, slot, called;
		
					while (--i !== -1) {
						controller = controllers[i];
						slots = controller.pipes[pipeName];
		
						if (slots == null) {
							continue;
						}
		
						slot = slots[signal];
						if (typeof slot === 'function') {
							slot.apply(controller, args);
							called = true;
						}
					}
		
					// if DEBUG
					called !== true && console.warn('No piped slot found for a signal', signal, pipeName);
					// endif
				}
			};
		
			Pipe.addController = controller_add;
			Pipe.removeController = controller_remove;
		
			return {
				addController: controller_add,
				removeController: controller_remove,
		
				emit: function(pipeName, signal, args) {
					Pipe(pipeName).emit(signal, args);
				},
				pipe: Pipe
			};
		
		}());
		
	
		// source ../src/compo/anchor.js
		
		/**
		 *	Get component that owns an element
		 **/
		
		var Anchor = (function(){
		
			var _cache = {};
		
			return {
				create: function(compo){
					if (compo.ID == null){
						console.warn('Component should have an ID');
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
					findID && console.warn('No controller for ID', findID);
					// endif
					return null;
				},
				removeCompo: function(compo){
					if (compo.ID == null){
						return;
					}
					delete _cache[compo.ID];
				}
			};
		
		}());
		
		// source ../src/compo/Compo.js
		var Compo = (function() {
		
			function Compo(controller) {
				if (this instanceof Compo){
					// used in Class({Base: Compo})
					return null;
				}
		
				var klass;
		
				if (controller == null){
					controller = {};
				}
		
				if (controller.attr != null) {
					
					for (var key in controller.attr) {
						controller.attr[key] = _mask_ensureTmplFn(controller.attr[key]);
					}
					
				}
				
				var slots = controller.slots;
				if (slots != null) {
					for (var key in slots) {
						if (typeof slots[key] === 'string'){
							//if DEBUG
							typeof controller[slots[key]] !== 'function' && console.error('Not a Function @Slot.',slots[key]);
							// endif
							slots[key] = controller[slots[key]];
						}
					}
				}
				
				if (controller.hasOwnProperty('constructor')){
					klass = controller.constructor;
				}
		
		
				klass = compo_createConstructor(klass, controller);
		
				if (klass == null){
					klass = function CompoBase(){};
				}
		
				for(var key in Proto){
					if (controller[key] == null){
						controller[key] = Proto[key];
					}
					controller['base_' + key] = Proto[key];
				}
		
				klass.prototype = controller;
		
				controller = null;
		
				return klass;
			}
		
			// source Compo.util.js
			function compo_dispose(compo) {
				if (compo.dispose != null) {
					compo.dispose();
				}
			
				Anchor.removeCompo(compo);
			
				var i = 0,
					compos = compo.components,
					length = compos && compos.length;
			
				if (length) {
					for (; i < length; i++) {
						compo_dispose(compos[i]);
					}
				}
			}
			
			function compo_ensureTemplate(compo) {
				if (compo.nodes != null) {
					return;
				}
				
				if (compo.attr.template != null) {
					compo.template = compo.attr.template;
					
					delete compo.attr.template;
				}
				
				var template = compo.template;
				
				if (typeof template == null) {
					return;
				}
				
			
				if (typeof template === 'string') {
					if (template[0] === '#') {
						var node = document.getElementById(template.substring(1));
						if (node == null) {
							console.error('Template holder not found by id:', template);
							return;
						}
						template = node.innerHTML;
					}
					template = mask.parse(template);
				}
			
				if (typeof template === 'object') {
					compo.nodes = template;
				}
			}
			
			function compo_containerArray() {
				var arr = [];
				arr.appendChild = function(child) {
					this.push(child);
				};
				return arr;
			}
			
			function compo_attachDisposer(controller, disposer) {
			
				if (typeof controller.dispose === 'function') {
					var previous = controller.dispose;
					controller.dispose = function(){
						disposer.call(this);
						previous.call(this);
					};
			
					return;
				}
			
				controller.dispose = disposer;
			}
			
			
			function compo_createConstructor(ctor, proto) {
				var compos = proto.compos,
					pipes = proto.pipes,
					attr = proto.attr;
					
				if (compos == null && pipes == null && proto.attr == null) {
					return ctor;
				}
			
				/* extend compos / attr to keep
				 * original prototyped values untouched
				 */
				return function CompoBase(){
			
					if (compos != null) {
						// use this.compos instead of compos from upper scope
						// : in case compos from proto was extended after
						this.compos = obj_copy(this.compos);
					}
			
					if (pipes != null) {
						Pipes.addController(this);
					}
					
					if (attr != null) {
						this.attr = obj_copy(this.attr);
					}
			
					if (typeof ctor === 'function') {
						ctor.call(this);
					}
				};
			}
			
			// source Compo.static.js
			obj_extend(Compo, {
				create: function(controller){
					var klass;
			
					if (controller == null){
						controller = {};
					}
			
					if (controller.hasOwnProperty('constructor')){
						klass = controller.constructor;
					}
			
					if (klass == null){
						klass = function CompoBase(){};
					}
			
					for(var key in Proto){
						if (controller[key] == null){
							controller[key] = Proto[key];
						}
						controller['base_' + key] = Proto[key];
					}
			
			
					klass.prototype = controller;
			
			
					return klass;
				},
			
				/* obsolete */
				render: function(compo, model, cntx, container) {
			
					compo_ensureTemplate(compo);
			
					var elements = [];
			
					mask.render(compo.tagName == null ? compo.nodes : compo, model, cntx, container, compo, elements);
			
					compo.$ = domLib(elements);
			
					if (compo.events != null) {
						Events_.on(compo, compo.events);
					}
					if (compo.compos != null) {
						Children_.select(compo, compo.compos);
					}
			
					return compo;
				},
			
				initialize: function(compo, model, cntx, container, parent) {
					
					var compoName;
			
					if (container == null){
						if (cntx && cntx.nodeType != null){
							container = cntx;
							cntx = null;
						}else if (model && model.nodeType != null){
							container = model;
							model = null;
						}
					}
			
					if (typeof compo === 'string'){
						compoName = compo;
						
						compo = mask.getHandler(compoName);
						if (!compo){
							console.error('Compo not found:', compo);
						}
					}
			
					var node = {
						controller: compo,
						type: Dom.COMPONENT,
						tagName: compoName
					};
			
					if (parent == null && container != null){
						parent = Anchor.resolveCompo(container);
					}
			
					if (parent == null){
						parent = new Dom.Component();
					}
			
					var dom = mask.render(node, model, cntx, null, parent),
						instance = parent.components[parent.components.length - 1];
			
					if (container != null){
						container.appendChild(dom);
			
						Compo.signal.emitIn(instance, 'domInsert');
					}
			
					return instance;
				},
			
				dispose: function(compo) {
					if (typeof compo.dispose === 'function') {
						compo.dispose();
					}
			
			
					var i = 0,
						compos = compo.components,
						length = compos && compos.length;
			
					if (length) {
						for (; i < length; i++) {
							Compo.dispose(compos[i]);
						}
					}
				},
			
				find: function(compo, selector){
					return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'down'));
				},
				closest: function(compo, selector){
					return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
				},
			
				ensureTemplate: compo_ensureTemplate,
				attachDisposer: compo_attachDisposer,
			
				config: {
					selectors: {
						'$': function(compo, selector) {
							var r = domLib_find(compo.$, selector)
							// if DEBUG
							r.length === 0 && console.error('Compo Selector - element not found -', selector, compo);
							// endif
							return r;
						},
						'compo': function(compo, selector) {
							var r = Compo.find(compo, selector);
							if (r == null) {
								console.error('Compo Selector - component not found -', selector, compo);
							}
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
						domLib = lib;
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
				}
			});
			
			
			// source async.js
			(function(){
				
				function _on(cntx, type, callback) {
					if (cntx[type] == null)
						cntx[type] = [];
					
					cntx[type].push(callback);
					
					return cntx;
				}
				
				function _call(cntx, type, _arguments) {
					var cbs = cntx[type];
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
					}
				};
				
				var CompoProto = {
					async: true,
					await: function(resume){
						this.resume = resume;
					}
				}
				
				Compo.pause = function(compo, cntx){
					
					if (cntx.async == null) {
						cntx.defers = [];
						
						cntx._cbs_done = null;
						cntx._cbs_fail = null;
						cntx._cbs_always = null;
						
						for (var key in DeferProto) {
							cntx[key] = DeferProto[key];
						}
					}
					
					cntx.async = true;
					
					for (var key in CompoProto) {
						compo[key] = CompoProto[key];
					}
					
					cntx.defers.push(compo);
				}
				
				Compo.resume = function(compo, cntx){
					
					// fn can be null when calling resume synced after pause
					if (compo.resume) 
						compo.resume();
					
					compo.async = false;
					
					var busy = false;
					for (var i = 0, x, imax = cntx.defers.length; i < imax; i++){
						x = cntx.defers[i];
						
						if (x === compo) {
							cntx.defers[i] = null;
							continue;
						}
						
						if (busy === false) {
							busy = x != null;
						}
					}
					
					if (busy === false) {
						cntx.resolve();
					}
				};
				
			}());
		
			var Proto = {
				type: Dom.CONTROLLER,
				
				tagName: null,
				compoName: null,
				nodes: null,
				attr: null,
				
				slots: null,
				pipes: null,
				
				compos: null,
				events: null,
				
				onRenderStart: null,
				onRenderEnd: null,
				render: null,
				renderStart: function(model, cntx, container){
		
					if (arguments.length === 1 && model != null && model instanceof Array === false && model[0] != null){
						model = arguments[0][0];
						cntx = arguments[0][1];
						container = arguments[0][2];
					}
		
		
					if (typeof this.onRenderStart === 'function'){
						this.onRenderStart(model, cntx, container);
					}
		
					// - do not override with same model
					//if (this.model == null){
					//	this.model = model;
					//}
		
					if (this.nodes == null){
						compo_ensureTemplate(this);
					}
		
				},
				renderEnd: function(elements, model, cntx, container){
					if (arguments.length === 1 && elements instanceof Array === false){
						elements = arguments[0][0];
						model = arguments[0][1];
						cntx = arguments[0][2];
						container = arguments[0][3];
					}
		
					Anchor.create(this, elements);
		
					this.$ = domLib(elements);
		
					if (this.events != null) {
						Events_.on(this, this.events);
					}
		
					if (this.compos != null) {
						Children_.select(this, this.compos);
					}
		
					if (typeof this.onRenderEnd === 'function'){
						this.onRenderEnd(elements, model, cntx, container);
					}
				},
				appendTo: function(x) {
					
					var element = typeof x === 'string' ? document.querySelector(x) : x;
					
		
					if (element == null) {
						console.warn('Compo.appendTo: parent is undefined. Args:', arguments);
						return this;
					}
		
					for (var i = 0; i < this.$.length; i++) {
						element.appendChild(this.$[i]);
					}
		
					this.emitIn('domInsert');
					return this;
				},
				append: function(template, model, selector) {
					var parent;
		
					if (this.$ == null) {
						var dom = typeof template === 'string' ? mask.compile(template) : template;
		
						parent = selector ? find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'down')) : this;
						if (parent.nodes == null) {
							this.nodes = dom;
							return this;
						}
		
						parent.nodes = [this.nodes, dom];
		
						return this;
					}
					var array = mask.render(template, model, null, compo_containerArray(), this);
		
					parent = selector ? this.$.find(selector) : this.$;
					for (var i = 0; i < array.length; i++) {
						parent.append(array[i]);
					}
		
					this.emitIn('domInsert');
					//- Shots.emit(this, 'DOMInsert');
					return this;
				},
				find: function(selector){
					return find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'down'));
				},
				closest: function(selector){
					return find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'up'));
				},
				on: function() {
					var x = Array.prototype.slice.call(arguments);
					if (arguments.length < 3) {
						console.error('Invalid Arguments Exception @use .on(type,selector,fn)');
						return this;
					}
		
					if (this.$ != null) {
						Events_.on(this, [x]);
					}
		
		
					if (this.events == null) {
						this.events = [x];
					} else if (this.events instanceof Array) {
						this.events.push(x);
					} else {
						this.events = [x, this.events];
					}
					return this;
				},
				remove: function() {
					if (this.$ != null){
						this.$.remove();
						
						var parents = this.parent && this.parent.elements;
						if (parents != null) {
							for (var i = 0, x, imax = parents.length; i < imax; i++){
								x = parents[i];
								
								for (var j = 0, jmax = this.$.length; j < jmax; j++){
									if (x === this.$[j]){
										parents.splice(i, 1);
										
										i--;
										imax--;
									}
									
								}
								
							}
						}
			
						this.$ = null;
					}
		
					compo_dispose(this);
		
					var components = this.parent && this.parent.components;
					if (components != null) {
						var i = components.indexOf(this);
		
						if (i === -1){
							console.warn('Compo::remove - parent doesnt contains me', this);
							return this;
						}
		
						components.splice(i, 1);
					}
					
					return this;
				},
		
				slotState: function(slotName, isActive){
					Compo.slot.toggle(this, slotName, isActive);
				},
		
				signalState: function(signalName, isActive){
					Compo.signal.toggle(this, signalName, isActive);
				},
		
				emitOut: function(signalName /* args */){
					Compo.signal.emitOut(this, signalName, this, arguments.length > 1 ? __array_slice.call(arguments, 1) : null);
				},
		
				emitIn: function(signalName /* args */){
					Compo.signal.emitIn(this, signalName, this, arguments.length > 1 ? __array_slice.call(arguments, 1) : null);
				}
			};
		
			Compo.prototype = Proto;
		
		
			return Compo;
		}());
		
		// source ../src/compo/signals.js
		(function() {
		
			/**
			 *	Mask Custom Attribute
			 *	Bind Closest Controller Handler Function to dom event(s)
			 */
		
			mask.registerAttrHandler('x-signal', 'client', function(node, attrValue, model, cntx, element, controller) {
		
				var arr = attrValue.split(';'),
					signals = '';
				for (var i = 0, x, length = arr.length; i < length; i++) {
					x = arr[i].trim();
					if (x === '') {
						continue;
					}
		
					var event = x.substring(0, x.indexOf(':')),
						handler = x.substring(x.indexOf(':') + 1).trim(),
						Handler = _createListener(controller, handler);
		
		
					// if DEBUG
					!event && console.error('Signal: event type is not set', attrValue);
					// endif
		
					if (Handler) {
		
						if (EventDecorator != null) {
							event = EventDecorator(event);
						}
		
						signals += ',' + handler + ',';
						dom_addEventListener(element, event, Handler);
					}
		
					// if DEBUG
					!Handler && console.warn('No slot found for signal', handler, controller);
					// endif
				}
		
				if (signals !== '') {
					element.setAttribute('data-signals', signals);
				}
		
			});
		
			// @param sender - event if sent from DOM Event or CONTROLLER instance
			function _fire(controller, slot, sender, args, direction) {
				
				if (controller == null) {
					return false;
				}
				
				var found = false,
					fn = controller.slots != null && controller.slots[slot];
					
				if (typeof fn === 'string') {
					fn = controller[fn];
				}
		
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
					var args = arguments.length > 1 ? __array_slice.call(arguments, 1) : null;
					
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
					console.warn('Controller has no elements to toggle state');
					return;
				}
		
				domLib() //
				.add(controller.$.filter('[data-signals]')) //
				.add(controller.$.find('[data-signals]')) //
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
						!captured && console.warn('Signal %c%s','font-weight:bold;', slot, 'was not captured');
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
							console.error('Slot not found', slot, controller);
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
		
	
		// source ../src/jcompo/jCompo.js
		(function(){
		
			if (domLib == null || domLib.fn == null){
				return;
			}
		
		
			domLib.fn.compo = function(selector){
				if (this.length === 0){
					return null;
				}
				var compo = Anchor.resolveCompo(this[0]);
		
				if (selector == null){
					return compo;
				}
		
				return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
			};
		
			domLib.fn.model = function(selector){
				var compo = this.compo(selector);
				if (compo == null){
					return null;
				}
				var model = compo.model;
				while(model == null && compo.parent){
					compo = compo.parent;
					model = compo.model;
				}
				return model;
			};
		
		}());
		
	
		// source ../src/handler/slot.js
		
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
		
	
	
		return Compo;
	
	}(Mask));
	
	// source ../src/libs/jmask.js
	
	var jmask = exports.jmask = (function(mask){
		'use strict';
		// source ../src/scope-vars.js
		var Dom = mask.Dom,
			_mask_render = mask.render,
			_mask_parse = mask.parse,
			_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn,
			_signal_emitIn = (global.Compo || mask.Compo || Compo).signal.emitIn;
			
		
		function _mask_ensureTmplFn(value) {
			if (typeof value !== 'string') {
				return value;
			}
			return _mask_ensureTmplFnOrig(value);
		}
		
		
	
		// source ../src/util/object.js
		function util_extend(target, source){
			if (target == null){
				target = {};
			}
			if (source == null){
				return target;
			}
		
			for(var key in source){
				target[key] = source[key];
			}
		
			return target;
		}
		
		// source ../src/util/array.js
		function arr_each(array, fn) {
			for (var i = 0, length = array.length; i < length; i++) {
				fn(array[i], i);
			}
		}
		
		function arr_remove(array, child) {
			if (array == null) {
				console.error('Can not remove myself from parent', child);
				return;
			}
		
			var index = array.indexOf(child);
		
			if (index === -1) {
				console.error('Can not remove myself from parent', child, index);
				return;
			}
		
			array.splice(index, 1);
		}
		
		function arr_isArray(x) {
			return x != null && typeof x === 'object' && x.length != null && typeof x.slice === 'function';
		}
		
		var arr_unique = (function() {
		
			var hasDuplicates = false;
		
			function sort(a, b) {
				if (a === b) {
					hasDuplicates = true;
					return 0;
				}
		
				return 1;
			}
		
			return function(array) {
				var duplicates, i, j, imax;
		
				hasDuplicates = false;
		
				array.sort(sort);
		
				if (hasDuplicates === false) {
					return array;
				}
		
				duplicates = [];
				i = 0;
				j = 0;
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
		
		}());
		
		
		// source ../src/util/selector.js
		
		var sel_key_UP = 'parent',
			sel_key_MASK = 'nodes',
			sel_key_COMPOS = 'components',
			sel_key_ATTR = 'attr';
		
		function selector_parse(selector, type, direction) {
			if (selector == null) {
				console.warn('selector is null for type', type);
			}
		
			if (typeof selector === 'object') {
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
				nextKey = type === Dom.SET
					? sel_key_MASK
					: sel_key_COMPOS;
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
				return sel_hasClass(className, matchClass);
			};
		}
		
		// [perf] http://jsperf.com/match-classname-indexof-vs-regexp/2
		function sel_hasClass(className, matchClass, index) {
			if (className == null) 
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
		
		function selector_match(node, selector, type) {
			if (typeof selector === 'string') {
				if (type == null) {
					type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
				}
				selector = selector_parse(selector, type);
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
		
					if (selector_match(node, x, type) === false) {
						return false;
					}
				}
			}
		
			return matched;
		}
		
		// source ../src/util/utils.js
		
		function jmask_filter(arr, matcher) {
			if (matcher == null) {
				return arr;
			}
		
			var result = [];
			for (var i = 0, x, length = arr.length; i < length; i++) {
				x = arr[i];
				if (selector_match(x, matcher)) {
					result.push(x);
				}
			}
			return result;
		}
		
		/**
		 * - mix (Node | Array[Node])
		 */
		function jmask_find(mix, matcher, output) {
			if (mix == null) {
				return output;
			}
		
			if (output == null) {
				output = [];
			}
		
			if (mix instanceof Array){
				for(var i = 0, length = mix.length; i < length; i++){
					jmask_find(mix[i], matcher, output);
				}
				return output;
			}
		
			if (selector_match(mix, matcher)){
				output.push(mix);
			}
		
			var next = mix[matcher.nextKey];
		
			if (next != null){
				jmask_find(next, matcher, output);
			}
		
			return output;
		}
		
		function jmask_clone(node, parent){
		
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
		
			if (node.attr){
				clone.attr = util_extend({}, node.attr);
			}
		
			var nodes = node.nodes;
			if (nodes != null && nodes.length > 0){
				clone.nodes = [];
		
				var isarray = nodes instanceof Array,
					length = isarray === true ? nodes.length : 1,
					i = 0;
				for(; i< length; i++){
					clone.nodes[i] = jmask_clone(isarray === true ? nodes[i] : nodes, clone);
				}
			}
		
			return clone;
		}
		
		
		function jmask_deepest(node){
			var current = node,
				prev;
			while(current != null){
				prev = current;
				current = current.nodes && current.nodes[0];
			}
			return prev;
		}
		
		
		function jmask_getText(node, model, cntx, controller) {
			if (Dom.TEXTNODE === node.type) {
				if (typeof node.content === 'function') {
					return node.content('node', model, cntx, null, controller);
				}
				return node.content;
			}
		
			var output = '';
			if (node.nodes != null) {
				for(var i = 0, x, imax = node.nodes.length; i < imax; i++){
					x = node.nodes[i];
					output += jmask_getText(x, model, cntx, controller);
				}
			}
			return output;
		}
		
		////////function jmask_initHandlers($$, parent){
		////////	var instance;
		////////
		////////	for(var i = 0, x, length = $$.length; i < length; i++){
		////////		x = $$[i];
		////////		if (x.type === Dom.COMPONENT){
		////////			if (typeof x.controller === 'function'){
		////////				instance = new x.controller();
		////////				instance.nodes = x.nodes;
		////////				instance.attr = util_extend(instance.attr, x.attr);
		////////				instance.compoName = x.compoName;
		////////				instance.parent = parent;
		////////
		////////				x = $$[i] = instance;
		////////			}
		////////		}
		////////		if (x.nodes != null){
		////////			jmask_initHandlers(x.nodes, x);
		////////		}
		////////	}
		////////}
		
		
	
		// source ../src/jmask/jmask.js
		function jMask(mix) {
		
		
			if (this instanceof jMask === false) {
				return new jMask(mix);
			}
		
			if (mix == null) {
				return this;
			}
			
			if (mix.type === Dom.SET) {
				return mix;
			}
		
			return this.add(mix);
		}
		
		jMask.prototype = {
			constructor: jMask,
			type: Dom.SET,
			length: 0,
			components: null,
			add: function(mix) {
				var i, length;
		
				if (typeof mix === 'string') {
					mix = _mask_parse(mix);
				}
		
				if (arr_isArray(mix)) {
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
				if (template != null) {
					return this.empty().append(template);
				}
		
				if (arguments.length) {
					return this;
				}
		
				var node;
		
				if (this.length === 0) {
					node = new Dom.Node();
				} else if (this.length === 1) {
					node = this[0];
				} else {
					node = new Dom.Fragment();
					for (var i = 0, length = this.length; i < length; i++) {
						node.nodes[i] = this[i];
					}
				}
		
				return mask.stringify(node);
			},
		
			text: function(mix, cntx, controller){
				if (typeof mix === 'string') {
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
		
		// source ../src/jmask/manip.attr.js
		(function() {
			arr_each(['add', 'remove', 'toggle', 'has'], function(method) {
		
				jMask.prototype[method + 'Class'] = function(klass) {
					var length = this.length,
						i = 0,
						classNames, j, jmax, node, current;
		
					if (typeof klass !== 'string') {
						if (method === 'remove') {
							for (; i < length; i++) {
								this[0].attr['class'] = null;
							}
						}
						return this;
					}
		
		
					for (; i < length; i++) {
						node = this[i];
		
						if (node.attr == null) {
							continue;
						}
		
						current = node.attr['class'];
		
						if (current == null) {
							current = klass;
						} else {
							current = ' ' + current + ' ';
		
							if (classNames == null) {
								classNames = klass.split(' ');
								jmax = classNames.length;
							}
							for (j = 0; j < jmax; j++) {
								if (!classNames[j]) {
									continue;
								}
		
								var hasClass = current.indexOf(' ' + classNames[j] + ' ') > -1;
		
								if (method === 'has') {
									if (hasClass) {
										return true;
									} else {
										continue;
									}
								}
		
								if (hasClass === false && (method === 'add' || method === 'toggle')) {
									current += classNames[j] + ' ';
								} else if (hasClass === true && (method === 'remove' || method === 'toggle')) {
									current = current.replace(' ' + classNames[j] + ' ', ' ');
								}
							}
							current = current.trim();
						}
		
						if (method !== 'has') {
							node.attr['class'] = current;
						}
					}
		
					if (method === 'has') {
						return false;
					}
		
					return this;
				};
		
			});
		
		
			arr_each(['attr', 'removeAttr', 'prop', 'removeProp'], function(method) {
				jMask.prototype[method] = function(key, value) {
					if (!key) {
						return this;
					}
		
					var length = this.length,
						i = 0,
						args = arguments.length,
						node;
		
					for (; i < length; i++) {
						node = this[i];
		
						switch (method) {
						case 'attr':
						case 'prop':
							if (args === 1) {
								if (typeof key === 'string') {
									return node.attr[key];
								}
		
								for (var x in key) {
									node.attr[x] = _mask_ensureTmplFn(key[x]);
								}
		
							} else if (args === 2) {
								node.attr[key] = _mask_ensureTmplFn(value);
							}
							break;
						case 'removeAttr':
						case 'removeProp':
							node.attr[key] = null;
							break;
						}
					}
		
					return this;
				};
			});
		
			util_extend(jMask.prototype, {
				tag: function(arg) {
					if (typeof arg === 'string') {
						for (var i = 0, length = this.length; i < length; i++) {
							this[i].tagName = arg;
						}
						return this;
					}
					return this[0] && this[0].tagName;
				},
				css: function(mix, value) {
					var args = arguments.length,
						length = this.length,
						i = 0,
						css, key, style;
		
					if (args === 1 && typeof mix === 'string') {
						if (length === 0) {
							return null;
						}
						if (typeof this[0].attr.style === 'string') {
							return css_toObject(this[0].attr.style)[mix];
						} else {
							return null;
						}
					}
		
					for (; i < length; i++) {
						style = this[i].attr.style;
		
						if (typeof style === 'function') {
							continue;
						}
						if (args === 1 && typeof mix === 'object') {
							if (style == null) {
								this[i].attr.style = css_toString(mix);
								continue;
							}
							css = css_toObject(style);
							for (key in mix) {
								css[key] = mix[key];
							}
							this[i].attr.style = css_toString(css);
						}
		
						if (args === 2) {
							if (style == null) {
								this[i].attr.style = mix + ':' + value;
								continue;
							}
							css = css_toObject(style);
							css[mix] = value;
							this[i].attr.style = css_toString(css);
		
						}
					}
		
					return this;
				}
			});
		
			// TODO: val(...)?
		
			function css_toObject(style) {
				var arr = style.split(';'),
					obj = {},
					index;
				for (var i = 0, x, length = arr.length; i < length; i++) {
					x = arr[i];
					index = x.indexOf(':');
					obj[x.substring(0, index).trim()] = x.substring(index + 1).trim();
				}
				return obj;
			}
		
			function css_toString(css) {
				var output = [],
					i = 0;
				for (var key in css) {
					output[i++] = key + ':' + css[key];
				}
				return output.join(';');
			}
		
		}());
		
		// source ../src/jmask/manip.dom.js
		
		
		util_extend(jMask.prototype, {
			clone: function(){
				var result = [];
				for(var i = 0, length = this.length; i < length; i++){
					result[i] = jmask_clone(this[0]);
				}
				return jMask(result);
			},
		
			// @TODO - wrap also in maskdom (modify parents)
			wrap: function(wrapper){
				var $mask = jMask(wrapper),
					result = [],
					$wrapper;
		
				if ($mask.length === 0){
					console.log('Not valid wrapper', wrapper);
					return this;
				}
		
				for(var i = 0, length = this.length; i < length; i++){
					$wrapper = length > 0 ? $mask.clone() : $mask;
					jmask_deepest($wrapper[0]).nodes = [this[i]];
		
					result[i] = $wrapper[0];
		
					if (this[i].parent != null){
						this[i].parent.nodes = result[i];
					}
				}
		
				return jMask(result);
			},
			wrapAll: function(wrapper){
				var $wrapper = jMask(wrapper);
				if ($wrapper.length === 0){
					console.error('Not valid wrapper', wrapper);
					return this;
				}
		
		
				this.parent().mask($wrapper);
		
				jmask_deepest($wrapper[0]).nodes = this.toArray();
				return this.pushStack($wrapper);
			}
		});
		
		arr_each(['empty', 'remove'], function(method) {
			jMask.prototype[method] = function() {
				var i = 0,
					length = this.length,
					node;
		
				for (; i < length; i++) {
					node = this[i];
		
					if (method === 'empty') {
						node.nodes = null;
						continue;
					}
					if (method === 'remove') {
						if (node.parent != null) {
							arr_remove(node.parent.nodes, node);
						}
						continue;
					}
		
				}
		
				return this;
			};
		});
		
		// source ../src/jmask/traverse.js
		util_extend(jMask.prototype, {
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
					matcher = selector == null ? null : selector_parse(selector, this.type, method === 'closest' ? 'up' : 'down'),
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
		
	
	
	
		return jMask;
	
	}(Mask));
	


	return Mask;

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
	
	var mask = global.mask || Mask;
	
	// source ../src/utils/path.js
	function path_normalize(str) {
		
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
	}
	
	function path_split(path) {
		path = path_normalize(path);
		
		return path === ''
			? []
			: path.split('/');
	}
	
	function path_join(parts) {
		return '/' + parts.join('/');
	}
	
	// source ../src/utils/query.js
	function query_deserialize(query, delimiter) {
		delimiter == null && (delimiter = '/');
	
		var obj = {},
			parts = query.split(delimiter),
			i = 0,
			imax = parts.length,
			x;
	
		for (; i < imax; i++) {
			x = parts[i].split('=');
	
			obj[x[0]] = decodeURIComponent(x[1]);
	
		}
	
		return obj;
	}
	
	function query_serialize(params, delimiter) {
		delimiter == null && (delimiter = '/');
	
		var query = '',
			key;
	
		for (key in params) {
			query = (query ? delimiter : '') + key + '=' + encodeURIComponent(params[key]);
		}
	
		return query;
	}
	
	

	// source ../src/route/Collection.js
	var Routes = (function(){
		
		// source Route.js
		
		// source parse.js
		
		function route_parseDefinition(route, definition) {
			
			if (definition[0] === '!') {
				route.strict = true;
				definition = definition.substring(1);
			}
			
			
			var parts = definition.split('/'),
				i = 0,
				imax = parts.length,
				x,
				c0,
				index,
				c1;
		
			var matcher = '',
				alias = null,
				strictCount = 0;
		
			var gettingMatcher = true,
				isConditional,
				isAlias;
		
			var array = [];
			
			for (; i < imax; i++) {
				x = parts[i];
				
				if (x === '') 
					continue;
				
		
				c0 = x.charCodeAt(0);
				c1 = x.charCodeAt(1);
		
				isConditional = c0 === 63; /* ? */
				isAlias = (isConditional ? c1 : c0) === 58; /* : */
				index = 0;
				
				if (isConditional) 
					index++;
				
				if (isAlias) 
					index++;
				
		
				if (index !== 0) 
					x = x.substring(index);
				
		
				// if DEBUG
				!isConditional && !gettingMatcher && console.log('Strict route part found after conditional', definition);
				// endif
		
		
				if (isConditional) 
					gettingMatcher = false;
				
		
				if (gettingMatcher) {
					strictCount += 1;
					matcher += '/' + (isAlias ? regexp_var : x)
				}
		
				if (isAlias) {
					(alias || (alias = {}))[index] = x;
				}
				
				if (!isConditional && !isAlias) {
					array.push(x);
					continue;
				}
				
				if (isAlias) {
					array.push({
						alias: x,
						optional: isConditional
					});
				}
				
			}
		
			route.parts = array;
		}
		
		
		/* - path should be already matched by the route */
		
		function route_parsePath(route, path) {
			
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
		
			if (queryIndex !== -1) {
				path = path.substring(0, queryIndex);
			}
		
			var parts = path_split(path),
				routeParts = route.parts,
				routeLength = routeParts.length,
				
				imax = parts.length,
				i = 0,
				part,
				x;
		
			for (; i < imax; i++) {
				part = parts[i];
				x = i < routeLength ? routeParts[i] : null;
				
				if (x) {
					
					if (typeof x === 'string') 
						continue;
					
					if (x.alias) {
						current.params[x.alias] = part;
						continue;
					}
					
				}
			}
		
			return current;
		}
		
		// source match.js
			
			
		function route_match(url, routes){
			url = path_normalize(url);
			
			var query = url.indexOf('?'),
				path = query === -1
					? url
					: url.substring(0, query);
			
			
			var parts = path_split(path);
			
			for (var i = 0, route, imax = routes.length; i < imax; i++){
				route = routes[i];
				
				if (route_isMatch(parts, route)) {
					route.current = route_parsePath(route, url);
					
					return route;
				}
			}
			
			return null;
		};
		
		function route_isMatch(parts, route) {
			
			if (typeof parts === 'string') 
				parts = path_split(parts);
			
			
				
			var routeParts = route.parts,
				routeLength = routeParts.length;
		
			
			
			for (var i = 0, x, imax = parts.length; i < imax; i++){
				
				x = routeParts[i];
				
				if (i >= routeLength) 
					return route.strict !== true;
				
				if (typeof x === 'string') {
					if (parts[i] === x) 
						continue;
					
					return false;
				}
				
				if (x.optional) 
					return true;
				
				if (x.alias) 
					continue;
				
				return false;
			}
			
			if (i < routeLength) 
				return routeParts[i].optional === true;
				
			
			return true;
		}
		
		var regexp_var = '([^\\\\]+)';
		
		function Route(definition, value) {
		
			this.value = value;
			this.definition = definition;
			
			route_parseDefinition(this, definition);
		}
		
		Route.prototype = {
			parts: null,
			value: null,
			current: null
		};
		
		
		
		function RouteCollection() {
			this.routes = [];
		}
		
		RouteCollection.prototype = {
			add: function(regpath, value){
				
				this.routes.push(new Route(regpath, value));
				
				return this;
			},
			
			get: function(path){
				
				return route_match(path, this.routes);
			}
		};
		
		RouteCollection.parse = function(definition, path){
			var route = {};
			
			route_parseDefinition(route, definition);
			return route_parsePath(route, path);
		};
		
		
		return RouteCollection;
	}());

	// source ../src/emit/Location.js
	
	var Location = (function(){
		
		if (typeof window === 'undefined') {
			return function(){};
		}
		
		// source Hash.js
		function HashEmitter(listener) {
		
			if (typeof window === 'undefined' || 'onhashchange' in window === false)
				return null;
		
		
			var that = this;
		
			that.listener = listener;
		
			window.onhashchange = function() {
				that.changed(location.hash);
			}
		
			return that;
		}
		
		(function() {
			
			function hash_normalize(hash) {
				return hash.replace(/^[!#/]+/, '/');
			}
			
			HashEmitter.prototype = {
				navigate: function(hash) {
					
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
		
		(function(){
			
			HistoryEmitter.prototype = {
				navigate: function(url){
					history.pushState({}, null, url);
					this.changed();
				},
				
				changed: function(){
					
					this.listener.changed(location.pathname + location.search);
				}
			};
		
		}());
		
		function Location(collection, action) {
			
			this.collection = collection || new Routes();
			this.emitter = new HistoryEmitter(this);
			
			if (action) 
				this.action = action;
			
			
			if (this.emitter == null) 
				this.emitter = new HashEmitter(this);
			
			if (this.emitter == null) 
				console.error('Router can not be initialized - (nor History API / nor Hashchage');
		}
		
		Location.prototype = {
			
			changed: function(path){
				var item = this.collection.get(path);
				
				if (item)
					this.action(item);
				
			},
			action: function(route){
				route.value(route)
			},
			navigate: function(url){
				this.emitter.navigate(url);
			},
			current: function(){
				var path = this.emitter.current();
				
				return this.collection.get(path);
			}
		};
		
		return Location;
	}());
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
		
		add: function(regpath, mix){
			router_ensure();
			
			return routes.add(regpath, mix);
		},
		
		get: function(path){
			
			return routes.get(path);
		},
		navigate: function(path){
			
			router_ensure()
				.navigate(path);
		},
		
		current: function(){
			
			return router_ensure()
				.current();
		},
		
		parse: Routes.parse
	};
	
	
	
	
	// source ../src/mask/attr/anchor-dynamic.js
	
	
	(function() {
		
			
		mask.registerAttrHandler('x-dynamic', function(node, value, model, cntx, tag){
			
			tag.onclick = navigate;
			
		}, 'client');
		
		function navigate(event) {
			event.preventDefault();
			event.stopPropagation();
			
			Ruta.navigate(this.href);
		}
		
	}());
	
	
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

	
	
	

for (var key in this) {
	globals[key] = this[key];
}

	
}.call({}, typeof global !== 'undefined' ? global : window));