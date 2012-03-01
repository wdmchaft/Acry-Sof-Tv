/**
 * WARNING: this is generated code and will be lost if changes are made.
 * This generated source code is Copyright (c) 2010-2012 by Appcelerator, Inc. All Rights Reserved.
 */

var require={
	analytics: true,
	app: {
		copyright: "2012 by kaiquesilva",
		description: "not specified",
		guid: "12f92a30-5886-4810-ba92-a3f01b954c64",
		id: "AcrySofTv",
		name: "AcrySofTv",
		publisher: "kaiquesilva",
		url: "http://editoraphoenix.com.br",
		version: "1.0"
	},
	deployType: "production",
	has: {
		"declare-property-methods": true
	},
	project: {
		id: "br.com.editoraphoenix.acrysoftv",
		name: "AcrySofTv"
	},
	ti: {
		version: "1.8.1"
	},
	vendorPrefixes: {
		css: ["", "-webkit-", "-moz-", "-ms-", "-o-", "-khtml-"],
		dom: ["", "Webkit", "Moz", "ms", "O", "Khtml"]
	}
};
/**
 * This file contains source code from the following:
 *
 * Dojo Toolkit
 * Copyright (c) 2005-2011, The Dojo Foundation
 * New BSD License
 * <http://dojotoolkit.org>
 *
 * require.js
 * Copyright (c) 2010-2011, The Dojo Foundation
 * New BSD License / MIT License
 * <http://requirejs.org>
 * 
 * curl.js
 * Copyright (c) 2011 unscriptable.com / John Hann
 * MIT License
 * <https://github.com/unscriptable/curl>
 */

(function(global) {

	"use strict";

	var // misc variables
		x,
		odp,
		doc = global.document,
		el = doc.createElement("div"),

		// cached useful regexes
		commentRegExp = /(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg,
		cjsRequireRegExp = /[^.]require\(\s*["']([^'"\s]+)["']\s*\)/g,
		reservedModuleIdsRegExp = /exports|module/,

		// the global config settings
		cfg = global.require || {},

		// shortened packagePaths variable
		pp = cfg.packagePaths || {},

		// the number of seconds to wait for a script to load before timing out
		waitSeconds = (cfg.waitSeconds || 7) * 1000,

		baseUrl = cfg.baseUrl || "./",

		// CommonJS paths
		paths = cfg.paths || {},

		// feature detection results initialize by pre-calculated tests
		hasCache = cfg.hasCache || {},

		// a queue of module definitions to evaluate once a module has loaded
		defQ = [],

		// map of module ids to functions containing an entire module, which could
		// include multiple defines. when a dependency is not defined, the loader
		// will check the cache to see if it exists first before fetching from the
		// server. this is used when the build system bundles modules into the
		// minified javascript files.
		defCache = {},

		// map of package names to package resource definitions
		packages = {},

		// map of module ids to module resource definitions that are being loaded and processed
		waiting = {},

		// map of module ids to module resource definitions
		modules = {},

		// mixin of common functions
		fnMixin;

	/******************************************************************************
	 * Utility functions
	 *****************************************************************************/

	function _mix(dest, src) {
		for (var p in src) {
			src.hasOwnProperty(p) && (dest[p] = src[p]);
		}
		return dest;
	}

	function mix(dest) {
		// summary:
		//		Copies properties by reference from a source object to a destination
		//		object, then returns the destination object. To be clear, this will
		//		modify the dest being passed in.
		var i = 1;
		dest || (dest = {});
		while (i < arguments.length) {
			_mix(dest, arguments[i++]);
		}
		return dest;
	}

	function each(a, fn) {
		// summary:
		//		Loops through each element of an array and passes it to a callback
		//		function.
		var i = 0,
			l = (a && a.length) || 0,
			args = Array.prototype.slice.call(arguments, 0);
		args.shift();
		while (i < l) {
			args[0] = a[i++];
			fn.apply(null, args);
		}
	}

	function is(it, type) {
		// summary:
		//		Tests if "it" is a specific "type". If type is omitted, then
		//		it will return the type.
		//
		// returns:
		//		Boolean if type is passed in
		//		String of type if type is not passed in
		var t = it === undefined ? "" : ({}).toString.call(it),
			m = t.match(/^\[object (.+)\]$/),
			v = m ? m[1] : "Undefined";
		return type ? type === v : v;
	}
	
	function isDef(it) {
		// summary:
		//		Helper function that tests if "it" is defined
		//
		// returns:
		//		Boolean
		return !is(it, "Undefined");
	}

	function isEmpty(it) {
		// summary:
		//		Checks if an object is empty.
		var p;
		for (p in it) {
			break;
		}
		return !it || (!it.call && !p);
	}

	function evaluate(code, sandboxVariables, globally) {
		// summary:
		//		Evaluates code globally or in a sandbox.
		//
		// code: String
		//		The code to evaluate
		//
		// sandboxVariables: Object?
		//		When "globally" is false, an object of names => values to initialize in
		//		the sandbox. The variable names must NOT contain '-' characters.
		//
		// globally: Boolean?
		//		When true, evaluates the code in the global namespace, generally "window".
		//		If false, then it will evaluate the code in a sandbox.

		var i,
			vars = [],
			vals = [],
			r;

		if (globally) {
			r = global.eval(code);
		} else {
			for (i in sandboxVariables) {
				vars.push(i + "=__vars." + i);
				vals.push(i + ":" + i);
			}
			r = (new Function("__vars", (vars.length ? "var " + vars.join(',') + ";\n" : "") + code + "\n;return {" + vals.join(',') + "};"))(sandboxVariables);
		}

		// if the last line of a module is a console.*() call, Firebug for some reason
		// sometimes returns "_firebugIgnore" instead of undefined or null
		return r === "_firebugIgnore" ? null : r;
	}

	function compactPath(path) {
		var result = [],
			segment,
			lastSegment;
		path = path.replace(/\\/g, '/').split('/');
		while (path.length) {
			segment = path.shift();
			if (segment === ".." && result.length && lastSegment !== "..") {
				result.pop();
				lastSegment = result[result.length - 1];
			} else if (segment !== ".") {
				result.push(lastSegment = segment);
			}
		}
		return result.join("/");
	}

	/******************************************************************************
	 * has() feature detection
	 *****************************************************************************/

	function has(name) {
		// summary:
		//		Determines of a specific feature is supported.
		//
		// name: String
		//		The name of the test.
		//
		// returns: Boolean (truthy/falsey)
		//		Whether or not the feature has been detected.

		if (is(hasCache[name], "Function")) {
			hasCache[name] = hasCache[name](global, doc, el);
		}
		return hasCache[name];
	}

	has.add = function(name, test, now, force){
		// summary:
		//		Adds a feature test.
		//
		// name: String
		//		The name of the test.
		//
		// test: Function
		//		The function that tests for a feature.
		//
		// now: Boolean?
		//		If true, runs the test immediately.
		//
		// force: Boolean?
		//		If true, forces the test to override an existing test.

		if (hasCache[name] === undefined || force) {
			hasCache[name] = test;
		}
		return now && has(name);
	};

	/******************************************************************************
	 * Event handling
	 *****************************************************************************/

	function on(target, type, context, listener) {
		// summary:
		//		Connects a listener to an event on the specified target.
		//
		// target: Object|DomNode
		//		The target to add the event listener to.
		//
		// type: String
		//		The event to listen for.
		//
		// context: Object|Function
		//		When listener is defined, the context is the scope in which the listener
		//		is executed.
		//
		// listener: Function?|String?
		//		Optional. When present, the context is used as the scope.
		//
		// example:
		//		Attaching to a click event:
		//		|	on(myButton, "click", function() {
		//		|		alert("Howdy!");
		//		|	});
		//
		// example:
		//		Attaching to a click event within a declared class method:
		//		|	...
		//		|	constructor: function() {
		//		|		require.on(myButton, "click", this, "onButtonClick");
		//		|	},
		//		|	onButtonClick: function() {
		//		|		alert("Howdy from " + this.declaredClass + "!");
		//		|	}
		//		|	...
		//
		// example:
		//		Attaching to a click event with an anonymous function in a declared class:
		//		|	...
		//		|	constructor: function() {
		//		|		require.on(myButton, "click", this, function() {
		//		|			alert("Howdy from " + this.declaredClass + "!");
		//		|		});
		//		|	}
		//		|	...

		var cb = is(listener, "Function") ? function() {
			return listener.apply(context, arguments);
		} : is(listener, "String") ? function() {
			return context[listener].apply(context, arguments);
		} : context;

		target.addEventListener(type, cb, false);
		return function() {
			target.removeEventListener(type, cb, false);
		};
	}

	on.once = function(target, type, listener) {
		var h = on(target, type, function() {
			h && h(); // do the disconnect
			return listener.apply(this, arguments);
		});
		return h;
	};

	/******************************************************************************
	 * Configuration processing
	 *****************************************************************************/

	// make sure baseUrl ends with a slash
	if (!/\/$/.test(baseUrl)) {
		baseUrl += "/";
	}

	function configPackage(/*String|Object*/pkg, /*String?*/dir) {
		// summary:
		//		An internal helper function to configure a package and add it to the array
		//		of packages.
		//
		// pkg: String|Object
		//		The name of the package (if a string) or an object containing at a minimum
		//		the package's name, but possibly also the package's location and main
		//		source file
		//
		// dir: String?
		//		Optional. A base URL to prepend to the package location

		pkg = pkg.name ? pkg : { name: pkg };
		pkg.location = (/(^\/)|(\:)/.test(dir) ? dir : "") + (pkg.location || pkg.name);
		pkg.main = (pkg.main || "main").replace(/(^\.\/)|(\.js$)/, "");
		packages[pkg.name] = pkg;
	}

	// first init all packages from the config
	each(cfg.packages, configPackage);

	// second init all package paths and their packages from the config
	for (x in pp) {
		each(pp[x], configPackage, x + "/");
	}

	// run all feature detection tests
	for (x in cfg.has) {
		has.add(x, cfg.has[x], 0, true);
	}

	/******************************************************************************
	 * Module functionality
	 *****************************************************************************/

	function ResourceDef(name, refModule, deps, rawDef) {
		// summary:
		//		A resource definition that describes a file or module being loaded.
		//
		// description:
		//		A resource is anything that is "required" such as applications calling
		//		require() or a define() with dependencies.
		//
		//		This loader supports resources that define multiple modules, hence this
		//		object.
		//
		//		In addition, this object tracks the state of the resource (loaded,
		//		executed, etc) as well as loads a resource and executes the defintions.
		//
		// name: String
		//		The module id.
		//
		// deps: Array?
		//		An array of dependencies.
		//
		// rawDef: Object? | Function? | String?
		//		The object, function, or string that defines the resource.
		//
		// refModule: Object?
		//		A reference map used for resolving module URLs.

		var match = name && name.match(/^(.+?)\!(.*)$/),
			isRelative = /^\./.test(name),
			exports = {},
			pkg = null,
			cjs,
			_t = this;

		// name could be:
		//  - a plugin		text!/some/file.html or include!/some/file.js
		//  - a module		some/module, ../some/module
		//  - a js file		/some/file.js
		//  - a url			http://www.google.com/

		_t.name = name;
		_t.deps = deps || [];
		_t.plugin = null;
		_t.callbacks = [];

		if (!match && (/(^\/)|(\:)|(\.js$)/.test(name) || (isRelative && !refModule))) {
			_t.url = name;
		} else {
			if (match) {
				_t.plugin = _t.deps.length;
				_t.pluginArgs = match[2];
				_t.pluginCfg = cfg[match[1]];
				_t.deps.push(match[1]);
			} else if (name) {
				name = _t.name = compactPath((isRelative ? refModule.name + "/../" : "") + name);

				if (/^\./.test(name)) {
					throw new Error("Irrational path \"" + name + "\"");
				}

				// TODO: if this is a package, then we need to transform the URL into the module's path
				// MUST set pkg to anything other than null, even if this module isn't in a package
				pkg = "";

				/(^\/)|(\:)/.test(name) || (name = baseUrl + name);

				_t.url = name + ".js";
			}
		}

		_t.pkg = pkg;
		_t.rawDef = rawDef;
		_t.loaded = !!rawDef;
		_t.refModule = refModule;

		// our scoped require()
		function scopedRequire() {
			var args = Array.prototype.slice.call(arguments, 0);
			args.length > 1 || (args[1] = 0);
			args[2] = _t;
			return req.apply(null, args);
		}
		scopedRequire.toUrl = function() {
			var args = Array.prototype.slice.call(arguments, 0);
			_t.plugin === null && (args[1] = _t);
			return toUrl.apply(null, args);
		};
		mix(scopedRequire, fnMixin, {
			cache: req.cache
		});

		_t.cjs = {
			require: scopedRequire,
			exports: exports,
			module: {
				exports: exports
			}
		};
	}

	ResourceDef.prototype.load = function(sync, callback) {
		// summary:
		//		Retreives a remote script and inject it either by XHR (sync) or attaching
		//		a script tag to the DOM (async).
		//
		// sync: Boolean
		//		If true, uses XHR, otherwise uses a script tag.
		//
		// callback: Function?
		//		A function to call when sync is false and the script tag loads.

		var s,
			x,
			disconnector,
			_t = this,
			cached = defCache[_t.name],
			fireCallbacks = function() {
				each(_t.callbacks, function(c) { c(_t); });
			},
			onLoad = function(rawDef) {
				_t.loaded = 1;
				if (_t.rawDef = rawDef) {
					if (is(rawDef, "String")) {
						// if rawDef is a string, then it's either a cached string or xhr response
						if (/\.js$/.test(_t.url)) {
							rawDef = evaluate(rawDef, _t.cjs);
							_t.def = _t.rawDef = !isEmpty(rawDef.exports) ? rawDef.exports : (rawDef.module && !isEmpty(rawDef.module.exports) ? rawDef.module.exports : null);
							_t.def === null && (_t.rawDef = rawDef);
						} else {
							_t.def = rawDef;
							_t.executed = 1;
						}
					} else if (is(rawDef, "Function")) {
						// if rawDef is a function, then it's a cached module definition
						waiting[_t.name] = _t;
						rawDef();
					}
				}
				processDefQ(_t);
				fireCallbacks();
				return 1;
			};

		_t.sync = sync;
		callback && _t.callbacks.push(callback);

		// if we don't have a url, then I suppose we're loaded
		if (!_t.url) {
			_t.loaded = 1;
			fireCallbacks();
			return;
		}

		// if we're already waiting, then we can just return and our callback will be fired
		if (waiting[_t.name]) {
			return;
		}

		// if we're already loaded or the definition has been cached, then just return now
		if (_t.loaded || cached) {
			return onLoad(cached);
		}

		// mark this module as waiting to be loaded so that anonymous modules can be
		// identified
		waiting[_t.name] = _t;

		if (sync) {
			x = new XMLHttpRequest();
			x.open("GET", _t.url, false);
			x.send(null);

			if (x.status === 200) {
				return onLoad(x.responseText);
			} else {
				throw new Error("Failed to load module \"" + _t.name + "\": " + x.status);
			}
		} else {
			// insert the script tag, attach onload, wait
			x = _t.node = doc.createElement("script");
			x.type = "text/javascript";
			x.charset = "utf-8";
			x.async = true;

			disconnector = on(x, "load", function(e) {
				e = e || global.event;
				var node = e.target || e.srcElement;
				if (e.type === "load" || /complete|loaded/.test(node.readyState)) {
					disconnector();
					onLoad();
				}
			});

			// set the source url last
			x.src = _t.url;

			s = doc.getElementsByTagName("script")[0];
			s.parentNode.insertBefore(x, s);
		}
	};

	ResourceDef.prototype.execute = function(callback) {
		// summary:
		//		Executes the resource's rawDef which defines the module.
		//
		// callback: Function?
		//		A function to call after the module has been executed.

		var _t = this;

		if (_t.executed) {
			callback && callback();
			return;
		}

		// first need to make sure we have all the deps loaded
		fetch(_t.deps, function(deps) {
			var i,
				p,
				r = _t.rawDef,
				q = defQ.slice(0), // backup the defQ
				finish = function() {
					_t.executed = 1;
					callback && callback();
				};

			// need to wipe out the defQ
			defQ = [];

			// make sure we have ourself in the waiting queue
			//waiting[_t.name] = _t;

			_t.def = _t.def
				||	(r && (is(r, "String")
						? evaluate(r, _t.cjs)
						: is(r, "Function")
							? r.apply(null, deps)
							: is(r, "Object")
								? (function(obj, vars) {
										for (var i in vars){
											this[i] = vars[i];
										}
										return obj;
									}).call({}, r, _t.cjs)
								: null
						)
					)
				||	_t.cjs.exports;

			// we might have just executed code above that could have caused a couple
			// define()'s to queue up
			processDefQ(_t);

			// restore the defQ
			defQ = q;

			// if plugin is not null, then it's the index in the deps array of the plugin
			// to invoke
			if (_t.plugin !== null) {
				p = deps[_t.plugin];

				// the plugin's content is dynamic, so just remove from the module cache
				if (p.dynamic) {
					delete modules[_t.name];
				}

				// if the plugin has a load function, then invoke it!
				p.load && p.load(_t.pluginArgs, _t.cjs.require, function(v) {
					_t.def = v;
					finish();
				}, _t.pluginCfg);
			}

			finish();
		}, function(ex) {
			throw ex;
		}, _t.refModule, _t.sync);
	};

	function getResourceDef(name, refModule, deps, rawDef, dontCache, overrideCache) {
		// summary:
		//		Creates a new resource definition or returns an existing one from cache.

		var module = new ResourceDef(name, refModule, deps, rawDef),
			moduleName = module.name;

		if (name in module.cjs) {
			module.def = module[name];
			module.loaded = module.executed = 1;
			return module;
		}

		return dontCache || !moduleName ? module : (!modules[moduleName] || overrideCache ? (modules[moduleName] = module) : modules[moduleName]);
	}

	function processDefQ(module) {
		// summary:
		//		Executes all modules sitting in the define queue.
		//
		// description:
		//		When a resource is loaded, the remote AMD resource is fetched, it's
		//		possible that one of the define() calls was anonymous, so it should
		//		be sitting in the defQ waiting to be executed.

		var m,
			q = defQ.slice(0);
		defQ = [];

		while (q.length) {
			m = q.shift();

			// if the module is anonymous, assume this module's name
			m.name || (m.name = module.name);

			// if the module is this module, then modify this 
			if (m.name === module.name) {
				modules[m.name] = module;
				module.deps = m.deps;
				module.rawDef = m.rawDef;
				module.execute();
			} else {
				modules[m.name] = m;
				m.execute();
			}
		}

		delete waiting[module.name];
	}

	function fetch(deps, success, failure, refModule, sync) {
		// summary:
		//		Fetches all dependents and fires callback when finished or on error.
		//
		// description:
		//		The fetch() function will fetch each of the dependents either
		//		synchronously or asynchronously (default).
		//
		// deps: String | Array
		//		A string or array of module ids to load. If deps is a string, load()
		//		returns the module's definition.
		//
		// success: Function?
		//		A callback function fired once the loader successfully loads and evaluates
		//		all dependent modules. The function is passed an ordered array of
		//		dependent module definitions.
		//
		// failure: Function?
		//		A callback function fired when the loader is unable to load a module. The
		//		function is passed the exception.
		//
		// refModule: Object?
		//		A reference map used for resolving module URLs.
		//
		// sync: Boolean?
		//		Forces the async path to be sync.
		//
		// returns: Object | Function
		//		If deps is a string, then it returns the corresponding module definition,
		//		otherwise the require() function.

		var i, l, count, s = is(deps, "String");

		if (s) {
			deps = [deps];
			sync = 1;
		}

		for (i = 0, l = count = deps.length; i < l; i++) {
			deps[i] && (function(idx, name) {
				getResourceDef(deps[idx], refModule).load(!!sync, function(m) {
					m.execute(function() {
						deps[idx] = m.def;
						if (--count === 0) {
							success && success(deps);
							count = -1; // prevent success from being called the 2nd time below
						}
					});
				});
			}(i, deps[i]));
		}

		count === 0 && success && success(deps);
		return s ? deps[0] : deps;
	}

	function def(name, deps, rawDef) {
		// summary:
		//		Used to define a module and it's dependencies.
		//
		// description:
		//		Defines a module. If the module has any dependencies, the loader will
		//		resolve them before evaluating the module.
		//
		//		If any of the dependencies fail to load or the module definition causes
		//		an error, the entire definition is aborted.
		//
		// name: String|Array?
		//		Optional. The module name (if a string) or array of module IDs (if an array) of the module being defined.
		//
		// deps: Array?
		//		Optional. An array of module IDs that the rawDef being defined requires.
		//
		// rawDef: Object|Function
		//		An object or function that returns an object defining the module.
		//
		// example:
		//		Anonymous module, no deps, object definition.
		//
		//		Loader tries to detect module name, fails and ignores definition if more
		//		unable to determine name or there's already anonymous module tied to the
		//		name found.
		//
		//		If the module name is determined, then the module definition
		//		is immediately defined.
		//
		//		|	define({
		//		|		sq: function(x) { return x * x; }
		//		|	});
		//
		// example:
		//		Anonymous module, no deps, rawDef definition.
		//
		//		Loader tries to detect module name, fails and ignores definition if more
		//		unable to determine name or there's already anonymous module tied to the
		//		name found.
		//
		//		Since no deps, module definition is treated as a CommonJS module and is
		//		passed in passed require, exports, and module arguments, then immediately
		//		evaluated.
		//
		//		|	define(function(require, exports, module) {
		//		|		return {
		//		|			sq: function(x) { return x * x; }
		//		|		};
		//		|	});
		//
		// example:
		//		Named module, no deps, object definition.
		//
		//		Since no deps, the module definition is immediately defined.
		//
		//		|	define("arithmetic", {
		//		|		sq: function(x) { return x * x; }
		//		|	});
		//
		// example:
		//		Named module, no deps, rawDef definition.
		//
		//		Since no deps, module definition is treated as a CommonJS module and is
		//		passed in passed require, exports, and module arguments, then immediately
		//		evaluated.
		//
		//		|	define("arithmetic", function(require, exports, module) {
		//		|		return {
		//		|			sq: function(x) { return x * x; }
		//		|		};
		//		|	});
		//
		// example:
		//		Anonymous module, two deps, object definition.
		//
		//		Loader tries to detect module name, fails and ignores definition if more
		//		unable to determine name or there's already anonymous module tied to the
		//		name found.
		//
		//		If the module name is determined, then the loader will load the two
		//		dependencies, then once the dependencies are loaded, it will evaluate a
		//		function wrapper around the module definition.
		//
		//		|	define(["dep1", "dep2"], {
		//		|		sq: function(x) { return x * x; }
		//		|	});
		//
		// example:
		//		Anonymous module, two deps, function definition.
		//
		//		Loader tries to detect module name, fails and ignores definition if more
		//		unable to determine name or there's already anonymous module tied to the
		//		name found.
		//
		//		If the module name is determined, then the loader will load the two
		//		dependencies, then once the dependencies are loaded, it will evaluate
		//		the rawDef function.
		//
		//		|	define(["dep1", "dep2"], function(dep1, dep2) {
		//		|		return {
		//		|			sq: function(x) { return x * x; }
		//		|		};
		//		|	});
		//
		// example:
		//		Name module, two deps, object definition.
		//
		//		After the two dependencies are loaded, the loader will evaluate a
		//		function wrapper around the module definition.
		//
		//		|	define("arithmetic", ["dep1", "dep2"], {
		//		|		sq: function(x) { return x * x; }
		//		|	});
		//
		// example:
		//		Name module, two deps, function definition.
		//
		//		After the two dependencies are loaded, the loader will evaluate the
		//		function rawDef.
		//
		//		|	define("arithmetic", ["dep1", "dep2"], function(dep1, dep2) {
		//		|		return {
		//		|			sq: function(x) { return x * x; }
		//		|		};
		//		|	});

		var i = ["require"],
			module;

		if (!rawDef) {
			rawDef = deps || name;
			rawDef.length === 1 || i.concat(["exports", "module"]);
			if (typeof name !== "string") {
				deps = deps ? name : i;
				name = 0;
			} else {
				deps = i;
			}
		}

		if (reservedModuleIdsRegExp.test(name)) {
			throw new Error("Not allowed to define reserved module id \"" + name + "\"");
		}

		if (is(rawDef, "Function") && arguments.length === 1) {
			// treat rawDef as CommonJS definition and scan for any requires and add
			// them to the dependencies so that they can be loaded and passed in.
			rawDef.toString()
				.replace(commentRegExp, "")
				.replace(cjsRequireRegExp, function(match, dep) {
					deps.push(dep);
				});
		}

		module = getResourceDef(name, 0, deps, rawDef, 0, 1);

		// if not waiting for this module to be loaded, then the define() call was
		// possibly inline or deferred, so try fulfill dependencies, and define the
		// module right now.
		if (name && !waiting[name]) {
			module.execute();

		// otherwise we are definitely waiting for a script to load, eventhough we
		// may not know the name, we'll know when the script's onload fires.
		} else if (name || !isEmpty(waiting)) {
			defQ.push(module);

		// finally, we we're ask to define something without a name and there's no
		// scripts pending, so there's no way to know what the name is. :(
		} else {
			throw new Error("Unable to define anonymous module");
		}
	}

	// set the "amd" property and advertise supported features
	def.amd = {
		plugins: true,
		vendor: "titanium"
	};

	function toUrl(name, refModule) {
		// summary:
		//		Converts a module name including extension to a URL path.
		//
		// name: String
		//		The module name including extension.
		//
		// returns: String
		//		The fully resolved URL.
		//
		// example:
		//		Returns the URL for a HTML template file.
		//		|	define(function(require) {
		//		|		var templatePath = require.toUrl("./templates/example.html");
		//		|	});

		var	match = name.match(/(.+)(\.[^\/\.]+?)$/),
			module = getResourceDef((match && match[1]) || name, refModule, 0, 0, 1),
			url = module.url;

		module.pkg !== null && (url = url.substring(0, url.length - 3));
		return url + ((match && match[2]) || "");
	}

	function req(deps, callback, refModule) {
		// summary:
		//		Fetches a module, caches its definition, and returns the module. If an
		//		array of modules is specified, then after all of them have been
		//		asynchronously loaded, an optional callback is fired.
		//
		// deps: String | Array
		//		A string or array of strings containing valid module identifiers.
		//
		// callback: Function?
		//		Optional. A function that is fired after all dependencies have been
		//		loaded. Only applicable if deps is an array.
		//
		// refModule: Object?
		//		A reference map used for resolving module URLs.
		//
		// returns: Object | Function
		//		If calling with a string, it will return the corresponding module
		//		definition.
		//
		//		If calling with an array of dependencies and a callback function, the
		//		require() function returns itself.
		//
		// example:
		//		Synchronous call.
		//		|	require("arithmetic").sq(10); // returns 100
		//
		// example:
		//		Asynchronous call.
		//		|	require(["arithmetic", "convert"], function(arithmetic, convert) {
		//		|		convert(arithmetic.sq(10), "fahrenheit", "celsius"); // returns 37.777
		//		|	});

		return fetch(deps, function(deps) {
			callback && callback.apply(null, deps);
		}, function(ex) {
			throw ex;
		}, refModule) || req;
	}

	req.toUrl = toUrl;
	req.config = cfg;
	mix(req, fnMixin = {
		each: each,
		evaluate: evaluate,
		has: has,
		is: is,
		isDef: isDef,
		mix: mix,
		on: on
	});

	req.cache = function(subject) {
		// summary:
		//		Copies module definitions into the definition cache.
		//
		// description:
		//		When running a build, the build will call this function and pass in an
		//		object with module id => function. Each function contains the contents
		//		of the module's file.
		//
		//		When a module is required, the loader will first see if the module has
		//		already been defined.  If not, it will then check this cache and execute
		//		the module definition.  Modules not defined or cached will be fetched
		//		remotely.
		//
		// subject: String | Object
		//		When a string, returns the cached object or undefined otherwise an object
		//		with module id => function where each function wraps a module.
		//
		// example:
		//		This shows what build system would generate. You should not need to do this.
		//		|	require.cache({
		//		|		"arithmetic": function() {
		//		|			define(["dep1", "dep2"], function(dep1, dep2) {
		//		|				var api = { sq: function(x) { return x * x; } };
		//		|			});
		//		|		},
		//		|		"my/favorite": function() {
		//		|			define({
		//		|				color: "red",
		//		|				food: "pizza"
		//		|			});
		//		|		}
		//		|	});
		var p, m, re = /^url\:(.+)/;
		if (is(subject, "String")) {
			return defCache[subject];
		} else {
			for (p in subject) {
				m = p.match(re);
				if (m) {
					defCache[toUrl(m[1])] = subject[p];
				} else {
					m = getResourceDef(p, 0, 0, subject[p], 1);
					defCache[m.name] = m.rawDef;
				}
			}
		}
	};

	// expose require() and define() to the global namespace
	global.require = req;
	global.define = def;

}(window));

require.cache({
	"Ti/_": function() {
		define({
			getAbsolutePath: function(path) {
				/^app\:\/\//.test(path) && (path = path.substring(6));
				/^\//.test(path) && (path = path.substring(1));
				return /^\/\//.test(path) || path.indexOf("://") > 0 ? path : location.pathname.replace(/(.*)\/.*/, "$1") + "/" + path;
			},
			uuid: function() {
				/**
				 * Math.uuid.js (v1.4)
				 * Copyright (c) 2010 Robert Kieffer
				 * Dual licensed under the MIT and GPL licenses.
				 * <http://www.broofa.com>
				 * mailto:robert@broofa.com
				 */
				// RFC4122v4 solution:
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random() * 16 | 0,
						v = c == 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				}).toUpperCase();
			}
		});
	},
	"Ti/_/browser": function() {
		define(function() {
			var match = navigator.userAgent.toLowerCase().match(/(webkit|gecko|trident|presto)/);
			return {
				runtime: match ? match[0] : "unknown"
			};
		});
	},
	"Ti/_/css": function() {
		define(["Ti/_/string"], function(string) {
			function processClass(node, cls, adding) {
				var i = 0, p,
					cn = " " + node.className + " ",
					cls = require.is(cls, "Array") ? cls : cls.split(" ");

				for (; i < cls.length; i++) {
					p = cn.indexOf(" " + cls[i] + " ");
					if (adding && p === -1) {
						cn += cls[i] + " ";
					} else if (!adding && p !== -1) {
						cn = cn.substring(0, p) + cn.substring(p + cls[i].length + 1);
					}
				}

				node.className = string.trim(cn);
			}

			return {
				add: function(node, cls) {
					processClass(node, cls, 1);
				},

				remove: function(node, cls) {
					processClass(node, cls);
				},

				clean: function(cls) {
					return cls.replace(/[^A-Za-z0-9\-]/g, "");
				}
			};
		});
	},
	"Ti/_/declare": function() {
		define(["Ti/_/lang"], function(lang) {
			/**
			 * declare() functionality based on code from Dojo Toolkit.
			 *
			 * Dojo Toolkit
			 * Copyright (c) 2005-2011, The Dojo Foundation
			 * New BSD License
			 * <http://dojotoolkit.org>
			 */

			var is = require.is,
				mix = require.mix,
				classCounters = {};

			// C3 Method Resolution Order (see http://www.python.org/download/releases/2.3/mro/)
			function c3mro(bases, className) {
				var result = [],
					roots = [ {cls: 0, refs: []} ],
					nameMap = {},
					clsCount = 1,
					l = bases.length,
					i = 0,
					j, lin, base, top, proto, rec, name, refs;

				// build a list of bases naming them if needed
				for (; i < l; ++i) {
					base = bases[i];
					if (!base) {
						throw new Error('Unknown base class for "' + className + '" [' + i + ']');
					} else if(!is(base, "Function")) {
						throw new Error('Base class not a function for "' + className + '" [' + i + ']');
					}
					lin = base._meta ? base._meta.bases : [base];
					top = 0;
					// add bases to the name map
					for (j = lin.length - 1; j >= 0; --j) {
						proto = lin[j].prototype;
						proto.hasOwnProperty("declaredClass") || (proto.declaredClass = "uniqName_" + (counter++));
						name = proto.declaredClass;
						if (!nameMap.hasOwnProperty(name)) {
							nameMap[name] = {count: 0, refs: [], cls: lin[j]};
							++clsCount;
						}
						rec = nameMap[name];
						if (top && top !== rec) {
							rec.refs.push(top);
							++top.count;
						}
						top = rec;
					}
					++top.count;
					roots[0].refs.push(top);
				}

				// remove classes without external references recursively
				while (roots.length) {
					top = roots.pop();
					result.push(top.cls);
					--clsCount;
					// optimization: follow a single-linked chain
					while (refs = top.refs, refs.length == 1) {
						top = refs[0];
						if (!top || --top.count) {
							// branch or end of chain => do not end to roots
							top = 0;
							break;
						}
						result.push(top.cls);
						--clsCount;
					}
					if (top) {
						// branch
						for (i = 0, l = refs.length; i < l; ++i) {
							top = refs[i];
							--top.count || roots.push(top);
						}
					}
				}

				if (clsCount) {
					throw new Error('Can\'t build consistent linearization for ' + className + '"');
				}

				// calculate the superclass offset
				base = bases[0];
				result[0] = base ?
					base._meta && base === result[result.length - base._meta.bases.length] ?
						base._meta.bases.length : 1 : 0;

				return result;
			}

			function makeConstructor(bases, ctorSpecial) {
				return function() {
					var a = arguments,
						args = a,
						a0 = a[0],
						f, i, m, p,
						l = bases.length,
						preArgs,
						dc = this.declaredClass;

					classCounters[dc] || (classCounters[dc] = 0);
					this.widgetId = dc + ":" + (classCounters[dc]++);

					// 1) call two types of the preamble
					if (ctorSpecial && (a0 && a0.preamble || this.preamble)) {
						// full blown ritual
						preArgs = new Array(bases.length);
						// prepare parameters
						preArgs[0] = a;
						for (i = 0;;) {
							// process the preamble of the 1st argument
							(a0 = a[0]) && (f = a0.preamble) && (a = f.apply(this, a) || a);
							// process the preamble of this class
							f = bases[i].prototype;
							f = f.hasOwnProperty("preamble") && f.preamble;
							f && (a = f.apply(this, a) || a);
							if (++i === l) {
								break;
							}
							preArgs[i] = a;
						}
					}

					// 2) call all non-trivial constructors using prepared arguments
					for (i = l - 1; i >= 0; --i) {
						f = bases[i];
						m = f._meta;
						if (m) {
							f = m.ctor;
							lang.mixProps(this, m.hidden);
						}
						is(f, "Function") && f.apply(this, preArgs ? preArgs[i] : a);
					}

					// 3) mixin args if any
					is(a0, "Object") && mix(this, a0);

					// 4) continue the original ritual: call the postscript
					f = this.postscript;
					f && f.apply(this, args);
				};
			}

			function mixClass(dest, src) {
				for (var p in src) {
					if (src.hasOwnProperty(p) && !/^(constructor|properties|constants|__values__)$/.test(p)) {
						is(src[p], "Function") && (src[p].nom = name);
						dest[p] = src[p];
					}
				}
				return dest;
			}

			function declare(className, superclass, definition) {
				// summary:
				//		Creates an instantiable class object.
				//
				// className: String?
				//		Optional. The name of the class.
				//
				// superclass: null | Object | Array
				//		The base class or classes to extend.
				//
				// definition: Object
				//		The definition of the class.

				if (!is(className, "String")) {
					definition = superclass;
					superclass = className;
					className = "";
				}
				definition = definition || {};

				var bases = [definition.constructor],
					ctor,
					i,
					mixins = 1,
					proto = {},
					superclassType = is(superclass),
					t;

				// build the array of bases
				if (superclassType === "Array") {
					bases = c3mro(superclass, className);
					superclass = bases[mixins = bases.length - bases[0]];
				} else if (superclassType === "Function") {
					t = superclass._meta;
					bases = bases.concat(t ? t.bases : superclass);
				} else if (superclassType === "Object") {
					ctor = new Function;
					mix(ctor.prototype, superclass);
					bases[0] = superclass = ctor;
				} else {
					superclass = 0;
				}

				// build the prototype chain
				if (superclass) {
					for (i = mixins - 1;; --i) {
						ctor = new Function;
						ctor.prototype = superclass.prototype;
						proto = new ctor;

						// stop if nothing to add (the last base)
						if (!i) {
							break;
						}

						// mix in properties
						t = bases[i];
						(t._meta ? mixClass : mix)(proto, t.prototype);

						// chain in new constructor
						ctor = new Function;
						ctor.superclass = superclass;
						ctor.prototype = proto;
						superclass = proto.constructor = ctor;
					}
				}

				// add all properties except constructor, properties, and constants
				mixClass(proto, definition);

				// if the definition is not an object, then we want to use its constructor
				t = definition.constructor;
				if (t !== Object.prototype.constructor) {
					t.nom = "constructor";
					proto.constructor = t;
				}

				// build the constructor and add meta information to the constructor
				mix(bases[0] = ctor = makeConstructor(bases, t), {
					_meta: {
						bases: bases,
						hidden: definition,
						ctor: definition.constructor
					},
					superclass: superclass && superclass.prototype,
					extend: function(src) {
						mixClass(this.prototype, src);
						return this;
					},
					prototype: proto
				});

				// now mix in just the properties and constants
				//lang.mixProps(proto, definition);

				// add "standard" methods to the prototype
				mix(proto, {
					constructor: ctor,
					// TODO: need a nice way of accessing the super method without using arguments.callee
					// getInherited: function(name, args) {
					//	return is(name, "String") ? this.inherited(name, args, true) : this.inherited(name, true);
					// },
					// inherited: inherited,
					isInstanceOf: function(cls) {
						var bases = this.constructor._meta.bases,
							i = 0,
							l = bases.length;
						for (; i < l; ++i) {
							if (bases[i] === cls) {
								return true;
							}
						}
						return this instanceof cls;
					}
				});

				// add name if specified
				if (className) {
					proto.declaredClass = className;
					lang.setObject(className, ctor);
				}

				return ctor;
			}

			return declare;
		});
	},
	"Ti/_/dom": function() {
		define(["Ti/_/style"], function(style) {
			/**
			 * create(), attr(), place(), & remove() functionality based on code from Dojo Toolkit.
			 *
			 * Dojo Toolkit
			 * Copyright (c) 2005-2011, The Dojo Foundation
			 * New BSD License
			 * <http://dojotoolkit.org>
			 */

			var is = require.is,
				forcePropNames = {
					innerHTML:	1,
					className:	1,
					value:		1
				},
				attrNames = {
					// original attribute names
					classname: "class",
					htmlfor: "for",
					// for IE
					tabindex: "tabIndex",
					readonly: "readOnly"
				},
				names = {
					// properties renamed to avoid clashes with reserved words
					"class": "className",
					"for": "htmlFor",
					// properties written as camelCase
					tabindex: "tabIndex",
					readonly: "readOnly",
					colspan: "colSpan",
					frameborder: "frameBorder",
					rowspan: "rowSpan",
					valuetype: "valueType"
				};

			return {
				create: function(tag, attrs, refNode, pos) {
					var doc = refNode ? refNode.ownerDocument : document;
					is(tag, "String") && (tag = doc.createElement(tag));
					attrs && this.attr(tag, attrs);
					refNode && this.place(tag, refNode, pos);
					return tag;
				},

				attr: function(node, name, value) {
					if (arguments.length === 2) {
						// the object form of setter: the 2nd argument is a dictionary
						for (var x in name) {
							this.attr(node, x, name[x]);
						}
						return node;
					}

					var lc = name.toLowerCase(),
						propName = names[lc] || name,
						forceProp = forcePropNames[propName],
						attrId, h;

					if (propName === "style" && !require.is(value, "String")) {
						return style.set(node, value);
					}

					if (forceProp || is(value, "Boolean") || is(value, "Function")) {
						node[name] = value;
						return node;
					}

					// node's attribute
					node.setAttribute(attrNames[lc] || name, value);
					return node;
				},

				place: function(node, refNode, pos) {
					refNode.appendChild(node);
					return node;
				},

				detach: function(node) {
					return node.parentNode && node.parentNode.removeChild(node);
				},

				destroy: function(node) {
					try {
						var destroyContainer = node.ownerDocument.createElement("div");
						destroyContainer.appendChild(this.detach(node) || node);
						destroyContainer.innerHTML = "";
					} catch(e) {
						/* squelch */
					}
				},

				unitize: function(x) {
					return isNaN(x-0) || x-0 != x ? x : x + "px"; // note: must be != and not !==
				},

				computeSize: function(x,totalLength) {
					if (!require.is(x,"Number") && !require.is(x,"String")) {
						return;
					}
					if (x === "auto" || require.is(x,"Number")) {
						return x;
					} else {
						var value = parseFloat(x),
							units = x.substring((value + "").length),
							dpi = Ti.Platform.DisplayCaps.dpi,
							undef;
						
						function processMM(x) {
							// Convert mm to in for this calculation
							return x * 0.03937007874015748 * dpi;
						}
						
						function processIN(x) {
							return x * dpi;
						}
						
						switch(units) {
							case "%":
								if(totalLength == "auto") {
									return "auto";
								} else if (!require.is(totalLength,"Number")) {
									console.error("Could not compute percentage size/position of element.");
									return;
								} 
								return value / 100 * totalLength;
							case "mm": return processMM(value);
							case "cm": return processMM(value * 10);
							case "in": return processIN(value);
							case "pt": return processIN(value / 72);
							case "pc": return processIN(value / 864);
							case "px": return value;
							case "dp": return value;
						}
					}
				}
			};
		});
	},
	"Ti/_/event": function() {
		define({
			stop: function(e) {
				e.preventDefault();
				e.stopPropagation();
			}
		});
	},
	"Ti/_/include": function() {
		define(function() {
			var cache = {},
				stack = [];

			return {
				dynamic: true, // prevent the loader from caching the result

				normalize: function(name, normalize) {
					var parts = name.split("!"),
						url = parts[0];
					parts.shift();
					return (/^\./.test(url) ? normalize(url) : url) + (parts.length ? "!" + parts.join("!") : "");
				},

				load: function(name, require, onLoad, config) {
					var c,
						x,
						parts = name.split("!"),
						len = parts.length,
						url,
						sandbox;

					if (sandbox = len > 1 && parts[0] === "sandbox") {
						parts.shift();
						name = parts.join("!");
					}

					url = require.toUrl(/^\//.test(name) ? name : "./" + name, stack.length ? { name: stack[stack.length-1] } : null);
					c = cache[url] || require.cache(url);

					if (!c) {
						x = new XMLHttpRequest();
						x.open("GET", url, false);
						x.send(null);
						if (x.status === 200) {
							c = x.responseText;
						} else {
							throw new Error("Failed to load include \"" + url + "\": " + x.status);
						}
					}

					stack.push(url);
					try {
						require.evaluate(cache[url] = c, 0, !sandbox);
					} catch (e) {
						throw e;
					} finally {
						stack.pop();
					}

					onLoad(c);
				}
			};
		});
	},
	"Ti/_/lang": function() {
		define(["Ti/_/string"], function(string) {
			/**
			 * hitch() and setObject() functionality based on code from Dojo Toolkit.
			 *
			 * Dojo Toolkit
			 * Copyright (c) 2005-2011, The Dojo Foundation
			 * New BSD License
			 * <http://dojotoolkit.org>
			 */

			var global = this,
				is = require.is;

			function toArray(obj, offset) {
				return [].concat(Array.prototype.slice.call(obj, offset||0));
			}

			function hitchArgs(scope, method) {
				var pre = toArray(arguments, 2);
					named = is(method, "String");
				return function() {
					var s = scope || global,
						f = named ? s[method] : method;
					return f && f.apply(s, pre.concat(toArray(arguments)));
				};
			}

			return {
				val: function(originalValue, defaultValue) {
					return is(originalValue, "Undefined") ? defaultValue : originalValue;
				},

				hitch: function(scope, method) {
					if (arguments.length > 2) {
						return hitchArgs.apply(global, arguments);
					}
					if (!method) {
						method = scope;
						scope = null;
					}
					if (is(method, "String")) {
						scope = scope || global;
						if (!scope[method]) {
							throw(['hitch: scope["', method, '"] is null (scope="', scope, '")'].join(''));
						}
						return function() {
							return scope[method].apply(scope, arguments || []);
						};
					}
					return !scope ? method : function() {
						return method.apply(scope, arguments || []);
					};
				},

				mixProps: function(dest, src, everything) {
					var d, i, p, v, special = { properties: 1, constants: 0 };
					for (p in src) {
						if (src.hasOwnProperty(p) && !/^(constructor|__values__)$/.test(p)) {
							if (p in special) {
								d = dest[p] || (dest[p] = {});
								d.__values__ || (d.__values__ = {});
								for (i in src[p]) {
									(function(property, externalDest, internalDest, valueDest, /* setter/getter, getter, or value */ descriptor, capitalizedName, writable) {
										var o = is(descriptor, "Object"),
											getter = o && is(descriptor.get, "Function") && descriptor.get,
											setter = o && is(descriptor.set, "Function") && descriptor.set;

										if (o && (getter || setter)) {
											valueDest[property] = descriptor.value;
										} else if (is(descriptor, "Function")) {
											getter = descriptor;
										} else {
											valueDest[property] = descriptor;
										}

										// first set the internal private interface
										Object.defineProperty(internalDest, property, {
											get: function() {
												return getter ? getter.call(externalDest, valueDest[property]) : valueDest[property];
											},
											set: function(v) {
												valueDest[property] = setter ? setter.call(externalDest, v, valueDest[property]) : v;
											},
											configurable: true,
											enumerable: true
										});

										// this is the public interface
										Object.defineProperty(dest, property, {
											get: function() {
												return internalDest[property];
											},
											set: function(v) {
												if (!writable) {
													throw new Error('Property "' + property + '" is read only');
												}
												internalDest[property] = v;
											},
											configurable: true,
											enumerable: true
										});

										if (require.has("declare-property-methods") && (writable || property.toUpperCase() !== property)) {
											externalDest["get" + capitalizedName] = function() { return internalDest[property]; };
											writable && (externalDest["set" + capitalizedName] = function(v) { return internalDest[property] = v; });
										}
									}(i, dest, d, d.__values__, src[p][i], string.capitalize(i), special[p]));
								}
							} else if (everything) {
								dest[p] = src[p];
							}
						}
					}
					return dest;
				},

				setObject: function(name) {
					var parts = name.split("."),
						q = parts.pop(),
						obj = window,
						i = 0,
						p = parts[i++],
						value = {};

					if (p) {
						do {
							obj = p in obj ? obj[p] : (obj[p] = {});
						} while (obj && (p = parts[i++]));
					}

					if (!obj || !q) {
						return undefined;
					}

					// need to mix args into values
					for (i = 1; i < arguments.length; i++) {
						is(arguments[i], "Object") ? this.mixProps(value, arguments[i], 1) : (value = arguments[i]);
					}

					return obj[q] = value;
				}
			};
		});
	},
	"Ti/_/ready": function() {
		define(function() {
			/**
			 * ready() functionality based on code from Dojo Toolkit.
			 *
			 * Dojo Toolkit
			 * Copyright (c) 2005-2011, The Dojo Foundation
			 * New BSD License
			 * <http://dojotoolkit.org>
			 */

			var doc = document,
				readyStates = { "loaded": 1, "complete": 1 },
				isReady = !!readyStates[doc.readyState],
				readyQ = [];

			if (!isReady) {
				function detectReady(evt) {
					if (isReady || (evt && evt.type == "readystatechange" && !readyStates[doc.readyState])) {
						return;
					}
					while (readyQ.length) {
						(readyQ.shift())();
					}
					isReady = 1;
				}

				readyQ.concat([
					require.on(doc, "DOMContentLoaded", detectReady),
					require.on(window, "load", detectReady)
				]);

				if ("onreadystatechange" in doc) {
					readyQ.push(require.on(doc, "readystatechange", detectReady));
				} else {
					function poller() {
						readyStates[doc.readyState] ? detectReady() : setTimeout(poller, 30);
					}
					poller();
				}
			}

			function ready(context, callback) {
				var fn = callback ? function(){ callback.call(context); } : context;
				if (isReady) {
					fn();
				} else {
					readyQ.push(fn);
				}
			}

			ready.load = function(name, require, onLoad) {
				ready(onLoad);
			};

			return ready;
		});
	},
	"Ti/_/string": function() {
		define({
			capitalize: function(s) {
				s = s || "";
				return s.substring(0, 1).toUpperCase() + s.substring(1);
			},

			trim: String.prototype.trim ?
				function(str){ return str.trim(); } :
				function(str){ return str.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); }
		});
	},
	"Ti/_/style": function() {
		define(["Ti/_", "Ti/_/string"], function(_, string) {
			var vp = require.config.vendorPrefixes.dom;

			function set(node, name, value) {
				var i = 0,
					x,
					uc;
				if (arguments.length > 2) {
					while (i < vp.length) {
						x = vp[i++];
						x += x ? uc || (uc = string.capitalize(name)) : name;
						if (x in node.style) {
							require.each(require.is(value, "Array") ? value : [value], function(v) { node.style[x] = v; });
							return value;
						}
					}
				} else {
					for (x in name) {
						set(node, x, name[x]);
					}
				}
				return node;
			}

			return {
				url: function(url) {
					return !url ? "" : /^url\(/.test(url) ? url : "url(" + _.getAbsolutePath(url) + ")";
				},

				get: function(node, name) {
					if (require.is(name, "Array")) {
						for (var i = 0; i < name.length; i++) {
							name[i] = node.style[name[i]];
						}
						return name;
					}
					return node.style[name];
				},

				set: set
			};
		});
	}
});
/**
 * This file contains source code from the following:
 *
 * es5-shim
 * Copyright 2009, 2010 Kristopher Michael Kowal
 * MIT License
 * <https://github.com/kriskowal/es5-shim>
 */

(function(global){
	var cfg = require.config,
		is = require.is,
		each = require.is,
		Ti = {
			_5: {}
		},
		doc = document,
		body = doc.body,
		undef,
		ready = require("Ti/_/ready"),
		createUUID = require("Ti/_").uuid,
		sessionId,
		analyticsStorageName = "ti:analyticsEvents",
		localeData = {},
		analyticsEventSeq = 1,
		analyticsLastSent = null;

	// Object.defineProperty() shim
	if (!Object.defineProperty || !(function (obj) {
			try {
				Object.defineProperty(obj, "x", {});
				return obj.hasOwnProperty("x");
			} catch (e) { }
		}({}))) {
		// add support for Object.defineProperty() thanks to es5-shim
		Object.defineProperty = function defineProperty(obj, prop, desc) {
			if (!obj || (!is(obj, "Object") && !is(obj, "Function") && !is(obj, "Window"))) {
				throw new TypeError("Object.defineProperty called on non-object: " + obj);
			}
			desc = desc || {};
			if (!desc || (!is(desc, "Object") && !is(desc, "Function"))) {
				throw new TypeError("Property description must be an object: " + desc);
			}
	
			if (odp) {
				try {
					return odp.call(Object, obj, prop, desc);
				} catch (e) { }
			}
	
			var op = Object.prototype,
				h = function (o, p) {
					return o.hasOwnProperty(p);
				},
				a = h(op, "__defineGetter__"),
				p = obj.__proto__;
	
			if (h(desc, "value")) {
				if (a && (obj.__lookupGetter__(prop) || obj.__lookupSetter__(prop))) {
					obj.__proto__ = op;
					delete obj[prop];
					obj[prop] = desc.value;
					obj.__proto__ = p;
				} else {
					obj[prop] = desc.value;
				}
			} else {
				if (!a) {
					throw new TypeError("Getters and setters can not be defined on this javascript engine");
				}
				if (h(desc, "get")) {
					defineGetter(obj, prop, desc.get);
				}
				if (h(desc, "set")) {
					defineSetter(obj, prop, desc.set);
				} else {
					obj[prop] = null;
				}
			}
		};
	}

	Object.defineProperty(global, "Ti", { value: Ti, writable: false });
	Object.defineProperty(global, "Titanium", { value: Ti, writable: false });

	// console.*() shim	
	console === undef && (console = {});

	// make sure "log" is always at the end
	each(["debug", "info", "warn", "error", "log"], function (c) {
		console[c] || (console[c] = ("log" in console)
			?	function () {
					var a = Array.apply({}, arguments);
					a.unshift(c + ":");
					console.log(a.join(" "));
				}
			:	function () {}
		);
	});

	// JSON.parse() and JSON.stringify() shim
	if (JSON === undef || JSON.stringify({a:0}, function(k,v){return v||1;}) !== '{"a":1}') {
		function escapeString(s){
			return ('"' + s.replace(/(["\\])/g, '\\$1') + '"').
				replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").
				replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r");
		}
	
		JSON.parse = function (s) {
			return eval('(' + s + ')');
		};
	
		JSON.stringify = function (value, replacer, space) {
			if (is(replacer, "String")) {
				space = replacer;
				replacer = null;
			}
	
			function stringify(it, indent, key) {
				var val,
					len,
					objtype = typeof it,
					nextIndent = space ? (indent + space) : "",
					sep = space ? " " : "",
					newLine = space ? "\n" : "",
					ar = [];
	
				if (replacer) {
					it = replacer(key, it);
				}
				if (objtype === "number") {
					return isFinite(it) ? it + "" : "null";
				}
				if (is(objtype, "Boolean")) {
					return it + "";
				}
				if (it === null) {
					return "null";
				}
				if (is(it, "String")) {
					return escapeString(it);
				}
				if (objtype === "function" || objtype === "undefined") {
					return undef;
				}
	
				// short-circuit for objects that support "json" serialization
				// if they return "self" then just pass-through...
				if (is(it.toJSON, "Function")) {
					return stringify(it.toJSON(key), indent, key);
				}
				if (it instanceof Date) {
					return '"{FullYear}-{Month+}-{Date}T{Hours}:{Minutes}:{Seconds}Z"'.replace(/\{(\w+)(\+)?\}/g, function(t, prop, plus){
						var num = it["getUTC" + prop]() + (plus ? 1 : 0);
						return num < 10 ? "0" + num : num;
					});
				}
				if (it.valueOf() !== it) {
					return stringify(it.valueOf(), indent, key);
				}
	
				// array code path
				if (it instanceof Array) {
					for(key = 0, len = it.length; key < len; key++){
						var obj = it[key];
						val = stringify(obj, nextIndent, key);
						if (!is(val, "String")) {
							val = "null";
						}
						ar.push(newLine + nextIndent + val);
					}
					return "[" + ar.join(",") + newLine + indent + "]";
				}
	
				// generic object code path
				for (key in it) {
					var keyStr;
					if (is(key, "Number")) {
						keyStr = '"' + key + '"';
					} else if (is(key, "String")) {
						keyStr = escapeString(key);
					} else {
						continue;
					}
					val = stringify(it[key], nextIndent, key);
					if (!is(val, "String")) {
						// skip non-serializable values
						continue;
					}
					// At this point, the most non-IE browsers don't get in this branch 
					// (they have native JSON), so push is definitely the way to
					ar.push(newLine + nextIndent + keyStr + ":" + sep + val);
				}
				return "{" + ar.join(",") + newLine + indent + "}"; // String
			}
	
			return stringify(value, "", "");
		};
	}

	// print the Titanium version *after* the console shim
	console.info("[INFO] Appcelerator Titanium " + cfg.ti.version + " Mobile Web");

	// make sure we have some vendor prefixes defined
	cfg.vendorPrefixes || (cfg.vendorPrefixes = ["", "Moz", "Webkit", "O", "ms"]);

	// expose JSON functions to Ti namespace
	Ti.parse = JSON.parse;
	Ti.stringify = JSON.stringify;

	require.on(global, "beforeunload", function() {
		Ti.App.fireEvent("close");
		Ti._5.addAnalyticsEvent("ti.end", "ti.end");
	});

	Ti._5.prop = function(obj, property, value, descriptor) {
		if (require.is(property, "Object")) {
			for (var i in property) {
				Ti._5.prop(obj, i, property[i]);
			}
		} else {
			var skipSet,
				capitalizedName = require("Ti/_/string").capitalize(property);

			// if we only have 3 args, so need to check if it's a default value or a descriptor
			if (arguments.length === 3 && require.is(value, "Object") && (value.get || value.set)) {
				descriptor = value;
				// we don't have a default value, so skip the set
				skipSet = 1;
			}

			// if we have a descriptor, then defineProperty
			if (descriptor) {
				if ("value" in descriptor) {
					skipSet = 2;
					if (descriptor.get || descriptor.set) {
						// we have a value, but since there's a custom setter/getter, we can't have a value
						value = descriptor.value;
						delete descriptor.value;
						value !== undef && (skipSet = 0);
					} else {
						descriptor.writable = true;
					}
				}
				descriptor.configurable = true;
				descriptor.enumerable = true;
				Object.defineProperty(obj, property, descriptor);
			}

			// create the get/set functions
			obj["get" + capitalizedName] = function(){ return obj[property]; };
			(skipSet | 0) < 2 && (obj["set" + capitalizedName] = function(val){ return obj[property] = val; });

			// if there's no default value or it's already been set with defineProperty(), then we skip setting it
			skipSet || (obj[property] = value);
		}
	};

	Ti._5.propReadOnly = function(obj, property, value) {
		var i;
		if (require.is(property, "Object")) {
			for (i in property) {
				Ti._5.propReadOnly(obj, i, property[i]);
			}
		} else {
			Ti._5.prop(obj, property, undef, require.is(value, "Function") ? { get: value, value: undef } : { value: value });
		}
	};

	Ti._5.createClass = function(className, value){
		var i,
			classes = className.split("."),
			klass,
			parent = global;
		for (i = 0; i < classes.length; i++) {
			klass = classes[i];
			parent[klass] === undef && (parent[klass] = i == classes.length - 1 && value !== undef ? value : new Object());
			parent = parent[klass];
		}
		return parent;
	};

	sessionId = "sessionStorage" in global && sessionStorage.getItem("mobileweb_sessionId");
	sessionId || sessionStorage.setItem("mobileweb_sessionId", sessionId = createUUID());

	Ti._5.addAnalyticsEvent = function(eventType, eventEvent, data, isUrgent){
		if (!cfg.analytics) {
			return;
		}
		// store event
		var storage = localStorage.getItem(analyticsStorageName);
		if(storage == null){
			storage = [];
		} else {
			storage = JSON.parse(storage);
		}
		var now = new Date();
		var ts = "yyyy-MM-dd'T'HH:mm:ss.SSSZ".replace(/\w+/g, function(str){
			switch(str){
				case "yyyy":
					return now.getFullYear();
				case "MM":
					return now.getMonth() + 1;
				case "dd":
					return now.getDate();
				case "HH":
					return now.getHours();
				case "mm":
					return now.getMinutes();
				case "ss":
					return now.getSeconds();
				case "SSSZ":
					var tz = now.getTimezoneOffset();
					var atz = Math.abs(tz);
					tz = (tz < 0 ? "-" : "+") + (atz < 100 ? "00" : (atz < 1000 ? "0" : "")) + atz;
					return now.getMilliseconds() + tz;
				default:
					return str;
			}
		});
		var formatZeros = function(v, n){
			var d = (v+'').length;
			return (d < n ? (new Array(++n - d)).join("0") : "") + v;
		};

		storage.push({
			eventId: createUUID(),
			eventType: eventType,
			eventEvent: eventEvent,
			eventTimestamp: ts,
			eventPayload: data
		});
		localStorage.setItem(analyticsStorageName, JSON.stringify(storage));
		Ti._5.sendAnalytics(isUrgent);
	};

	// collect and send Ti.Analytics notifications
	Ti._5.sendAnalytics = function(isUrgent){
		if (!cfg.analytics) {
			return;
		}

		var i,
			evt,
			storage = JSON.parse(localStorage.getItem(analyticsStorageName)),
			now = (new Date()).getTime(),
			jsonStrs = [],
			ids = [],
			iframe,
			form,
			hidden,
			rand = Math.floor(Math.random() * 1e6),
			iframeName = "analytics" + rand,
			callback = "mobileweb_jsonp" + rand;

		if (storage === null || (!isUrgent && analyticsLastSent !== null && now - analyticsLastSent < 300000 /* 5 minutes */)) {
			return;
		}

		analyticsLastSent = now;

		for (i = 0; i < storage.length; i++) {
			evt = storage[i];
			ids.push(evt.eventId);
			jsonStrs.push(JSON.stringify({
				seq: analyticsEventSeq++,
				ver: "2",
				id: evt.eventId,
				type: evt.eventType,
				event: evt.eventEvent,
				ts: evt.eventTimestamp,
				mid: Ti.Platform.id,
				sid: sessionId,
				aguid: cfg.guid,
				data: require.is(evt.eventPayload, "object") ? JSON.stringify(evt.eventPayload) : evt.eventPayload
			}));
		}

		function onIframeLoaded() {
			form.parentNode.removeChild(form);
			iframe.parentNode.removeChild(iframe);
		}

		iframe = doc.createElement("iframe");
		iframe.style.display = "none";
		iframe.id = iframe.name = iframeName;

		form = doc.createElement("form");
		form.style.display = "none";
		form.target = iframeName;
		form.method = "POST";
		form.action = "https://api.appcelerator.net/p/v2/mobile-track?callback=" + callback;

		hidden = doc.createElement("input");
		hidden.type = "hidden";
		hidden.name = "content";
		hidden.value = "[" + jsonStrs.join(",") + "]";

		body.appendChild(iframe);
		body.appendChild(form);
		form.appendChild(hidden);

		global[callback] = function(response){
			if(response && response.success){
				// remove sent events on successful sent
				var j, k, found,
					storage = localStorage.getItem(analyticsStorageName),
					ev,
					evs = [];

				for (j = 0; j < storage.length; j++) {
					ev = storage[j];
					found = 0;
					for (k = 0; k < ids.length; k++) {
						if (ev.eventId == ids[k]) {
							found = 1;
							ids.splice(k, 1);
							break;
						}
					}
					found || evs.push(ev);
				}

				localStorage.setItem(analyticsStorageName, JSON.stringify(evs));
				
			}
		};

		// need to delay attaching of iframe events so they aren't prematurely called
		setTimeout(function() {
			iframe.onload = onIframeLoaded;
			iframe.onerror = onIframeLoaded;
			form.submit();
		}, 25);
	};

	Ti._5.extend = function(dest, source){
		for (var key in source) {
			dest[key] = source[key];
		}
		return dest;
	};

	Ti._5.setLocaleData = function(obj){
		localeData = obj;
	};

	Ti._5.getLocaleData = function(){
		return localeData;
	};

	// Get browser window sizes
	Ti._5.getWindowSizes = function() {
		var n,
			docElem = doc.documentElement;
		if (body.offsetWidth) {
			n = {
				width: body.offsetWidth|0,
				height: body.offsetHeight|0
			};
		} else if (doc.compatMode === "CSS1Compat" && docElem && docElem.offsetWidth) {
			n = {
				width: docElem.offsetWidth,
				height: docElem.offsetHeight
			};
		} else if (global.innerWidth && global.innerHeight) {
			n = {
				width: global.innerWidth,
				height: global.innerHeight
			};
		}
		return n;
	};

	ready(function() {
		body.style.margin = 0;
		body.style.padding = 0;

		if (cfg.analytics) {
			// enroll event
			if (localStorage.getItem("mobileweb_enrollSent") === null) {
				// setup enroll event
				Ti._5.addAnalyticsEvent('ti.enroll', 'ti.enroll', {
					mac_addr: null,
					oscpu: null,
					app_name: cfg.appName,
					platform: Ti.Platform.name,
					app_id: cfg.appId,
					ostype: Ti.Platform.osname,
					osarch: Ti.Platform.architecture,
					model: Ti.Platform.model,
					deploytype: cfg.deployType
				});
				localStorage.setItem("mobileweb_enrollSent", true)
			}

			// app start event
			Ti._5.addAnalyticsEvent('ti.start', 'ti.start', {
				tz: (new Date()).getTimezoneOffset(),
				deploytype: cfg.deployType,
				os: Ti.Platform.osname,
				osver: Ti.Platform.ostype,
				version: cfg.tiVersion,
				un: null,
				app_version: cfg.appVersion,
				nettype: null
			});

			// try to sent previously sent analytics events on app load
			Ti._5.sendAnalytics();
		}

		// load app.js when ti and dom is ready
		ready(function() {
			require(["app.js"]);
		});
	});

}(window));
Ti._5.EventDriven = function(obj) {
	var listeners = null;

	obj.addEventListener = function(eventName, handler){
		listeners || (listeners = {});
		(listeners[eventName] = listeners[eventName] || []).push(handler);
	};

	obj.removeEventListener = function(eventName, handler){
		if (listeners) {
			if (handler) {
				var i = 0,
					events = listeners[eventName],
					l = events && events.length || 0;

				for (; i < l; i++) {
					events[i] === handler && events.splice(i, 1);
				}
			} else {
				delete listeners[eventName];
			}
		}
	};

	obj.hasListener = function(eventName) {
		return listeners && listeners[eventName];
	};

	obj.fireEvent = function(eventName, eventData){
		if (listeners) {
			var i = 0,
				events = listeners[eventName],
				l = events && events.length,
				data = require.mix({
					source: obj,
					type: eventName
				}, eventData);

			while (i < l) {
				events[i++].call(obj, data);
			}
		}
	};
};
;
define("Ti/_/Evented", function() {

	return {
		listeners: null,

		addEventListener: function(name, handler) {
			this.listeners || (this.listeners = {});
			(this.listeners[name] = this.listeners[name] || []).push(handler)
		},

		removeEventListener: function(name, handler) {
			if (this.listeners) {
				if (handler) {
					var i = 0,
						events = this.listeners[name],
						l = events && events.length || 0;
	
					for (; i < l; i++) {
						events[i] === handler && events.splice(i, 1);
					}
				} else {
					delete this.listeners[name];
				}
			}
		},

		fireEvent: function(name, eventData) {
			var i = 0,
				events = this.listeners && this.listeners[name],
				l = events && events.length,
				data = require.mix({
					source: this,
					type: name
				}, eventData);

			while (i < l) {
				events[i++].call(this, data);
			}
		}
	};

});;
define("Ti/_/Gestures/GestureRecognizer", ["Ti/_/declare", "Ti/_/lang"], function(declare,lang) {

	return declare("Ti._.Gestures.GestureRecognizer", null, {
		
		blocking: null,
		
		constructor: function() {
			this.blocking = [];
		},
		
		processTouchStartEvent: function(e, element){
		},
		finalizeTouchStartEvent: function(){
		},
		
		processTouchEndEvent: function(e, element){
		},
		finalizeTouchEndEvent: function(){
		},
		
		processTouchMoveEvent: function(e, element){
		},
		finalizeTouchMoveEvent: function(){
		},
		
		processTouchCancelEvent: function(e, element){
		},
		finalizeTouchCancelEvent: function(){
		}

	});

});;
define("Ti/_/Gestures/DoubleTap", ["Ti/_/declare", "Ti/_/lang","Ti/_/Gestures/GestureRecognizer"], function(declare,lang,GestureRecognizer) {

	return declare("Ti._.Gestures.DoubleTap", GestureRecognizer, {
		
		name: "doubletap",
		
		_firstTapTime: null,
		_firstTapLocation: null,
		
		// This is the amount of time that can elapse before the two taps are considered two separate single taps
		_timeThreshold: 250,
		
		// This is the amount of space the finger is allowed drift until the gesture is no longer considered a tap
		_driftThreshold: 25,
				
		initTracker: function(x,y) {
			this._firstTapTime = (new Date()).getTime();
			this._firstTapLocation = {
				x: x,
				y: y
			}
		},
		
		processTouchEndEvent: function(e, element){
			if (e.touches.length == 0 && e.changedTouches.length == 1) {
				
				var x = e.changedTouches[0].clientX,
					y = e.changedTouches[0].clientY;
				
				if (this._firstTapTime) {
					var elapsedTime = (new Date()).getTime() - this._firstTapTime;
					this._firstTapTime = null;
					if (elapsedTime < this._timeThreshold && Math.abs(this._firstTapLocation.x - x) < this._driftThreshold && 
							Math.abs(this._firstTapLocation.y - y) < this._driftThreshold) {
						var result = {
							x: x,
							y: y
						};
						if (!element._isGestureBlocked(this.name)) {
							this.blocking.push("singletap");
							lang.hitch(element,element._handleTouchEvent("dblclick",result));
							lang.hitch(element,element._handleTouchEvent(this.name,result));
						}
					} else {
						this.initTracker(x,y);
					}
				} else {
					this.initTracker(x,y);
				}
				
			}
		},
		finalizeTouchEndEvent: function(){
			this.blocking = [];
		},
		
		processTouchCancelEvent: function(e, element){
			this._firstTapTime = null;
		}

	});

});;
define("Ti/_/Gestures/LongPress", ["Ti/_/declare", "Ti/_/lang","Ti/_/Gestures/GestureRecognizer"], function(declare,lang,GestureRecognizer) {

	return declare("Ti._.Gestures.LongPress", GestureRecognizer, {
		
		name: "longpress",
		
		_timer: null,
		_touchStartLocation: null,
		
		// This is the amount of time that must elapse before the tap is considered a long press
		_timeThreshold: 500,
		
		// This is the amount of space the finger is allowed drift until the gesture is no longer considered a tap
		_driftThreshold: 25,
		
		processTouchStartEvent: function(e, element){
			clearTimeout(this._timer);
			if (e.touches.length == 1 && e.changedTouches.length == 1) {
				this._touchStartLocation = {
					x: e.changedTouches[0].clientX,
					y: e.changedTouches[0].clientY
				}
				this._timer = setTimeout(lang.hitch(this,function(){
					if (!element._isGestureBlocked(this.name)) {
						this.blocking.push("singletap");
						this.blocking.push("doubletap");
						lang.hitch(element,element._handleTouchEvent("longpress",{
							x: e.changedTouches[0].clientX,
							y: e.changedTouches[0].clientY
						}));
					}
				}),this._timeThreshold);
			}
		},
		
		processTouchEndEvent: function(e, element){
			if (e.touches.length == 0 && e.changedTouches.length == 1) {
				clearTimeout(this._timer);
			}
		},
		finalizeTouchEndEvent: function(){
			this.blocking = [];
		},
		
		processTouchMoveEvent: function(e, element){
			if (!this._touchStartLocation || Math.abs(this._touchStartLocation.x - e.changedTouches[0].clientX) > this._driftThreshold || 
					Math.abs(this._touchStartLocation.y - e.changedTouches[0].clientY) > this._driftThreshold) {
				clearTimeout(this._timer);
			}
		},
		
		processTouchCancelEvent: function(e, element){
			clearTimeout(this._timer);
		}
		
	});
	
});;
define("Ti/_/Gestures/Pinch", ["Ti/_/declare", "Ti/_/lang","Ti/_/Gestures/GestureRecognizer"], function(declare,lang,GestureRecognizer) {

	return declare("Ti._.Gestures.Pinch", GestureRecognizer, {
		
		name: "pinch",
		
		_touchStartLocation: null,
		_touchEndLocation: null,
		_fingerDifferenceThresholdTimer: null,
		_startDistance: null,
		_previousDistance: null,
		_previousTime: null,
		
		// There are two possibilities: the user puts down two fingers at exactly the same time,
		// which is almost impossible, or they put one finger down first, followed by the second.
		// For the second case, we need ensure that the two taps were intended to be at the same time.
		// This value defines the maximum time difference before this is considered some other type of gesture.
		_fingerDifferenceThreshold: 100,
		
		// This is the minimum amount of space the fingers are must move before it is considered a pinch
		_driftThreshold: 25,
		
		processTouchStartEvent: function(e, element){
			var x = e.changedTouches[0].clientX,
				y = e.changedTouches[0].clientY,
				touchesLength = e.touches.length,
				changedTouchesLength = e.changedTouches.length;
			
			// First finger down of the two, given a slight difference in contact time
			if (touchesLength == 1 && changedTouchesLength == 1) {
				this._touchStartLocation = [{
					x: x,
					y: y
				}];
				this._fingerDifferenceThresholdTimer = setTimeout(lang.hitch(this,function(){
					this._touchStartLocation = null;
				}),this._fingerDifferenceThreshold);
			
			// Second finger down of the two, given a slight difference in contact time
			} else if (touchesLength == 2 && changedTouchesLength == 1) {
				clearTimeout(this._fingerDifferenceThresholdTimer);
				if (this._touchStartLocation) {
					this._touchStartLocation.push({
						x: x,
						y: y
					});
					this._startDistance = Math.sqrt(Math.pow(this._touchStartLocation[0].x - this._touchStartLocation[1].x,2) + 
						Math.pow(this._touchStartLocation[0].y - this._touchStartLocation[1].y,2));
				}
				
			// Two fingers down at the same time
			} else if (touchesLength == 2 && changedTouchesLength == 2) {
				this._touchStartLocation = [{
					x: x,
					y: y
				},
				{
					x: e.changedTouches[1].clientX,
					y: e.changedTouches[1].clientY
				}];
				this._startDistance = Math.sqrt(Math.pow(this._touchStartLocation[0].x - this._touchStartLocation[1].x,2) + 
					Math.pow(this._touchStartLocation[0].y - this._touchStartLocation[1].y,2));
				
			// Something else, means it's not a pinch
			} else {
				this._touchStartLocation = null;
			}
		},
		
		processTouchEndEvent: function(e, element){
			this.processTouchMoveEvent(e, element);
			this._touchStartLocation = null;
		},
		
		processTouchMoveEvent: function(e, element){
			if (this._touchStartLocation && this._touchStartLocation.length == 2 && e.touches.length == 2) {
				var currentDistance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX,2) + 
					Math.pow(e.touches[0].clientY - e.touches[1].clientY,2)),
					velocity = 0,
					currentTime = (new Date()).getTime();
				if (this._previousDistance) {
					velocity = Math.abs(this._previousDistance / this._startDistance - currentDistance / this._startDistance) / ((currentTime - this._previousTime) / 1000); 
				}
				this._previousDistance = currentDistance;
				this._previousTime = currentTime;
				if (!element._isGestureBlocked(this.name)) {
					lang.hitch(element,element._handleTouchEvent(this.name,{
						scale: currentDistance / this._startDistance,
						velocity: velocity
					}));
				}
			}
		},
		
		processTouchCancelEvent: function(e, element){
			this._touchStartLocation = null;
		}
		
	});
	
});;
define("Ti/_/Gestures/SingleTap", ["Ti/_/declare", "Ti/_/lang","Ti/_/Gestures/GestureRecognizer"], function(declare,lang,GestureRecognizer) {

	return declare("Ti._.Gestures.SingleTap", GestureRecognizer, {
		
		name: "singletap",
		
		_touchStartLocation: null,
		
		// This is the amount of space the finger is allowed drift until the gesture is no longer considered a tap
		_driftThreshold: 25,
		
		processTouchStartEvent: function(e, element){
			if (e.touches.length == 1 && e.changedTouches.length == 1) {
				this._touchStartLocation = {
					x: e.changedTouches[0].clientX,
					y: e.changedTouches[0].clientY
				}
			}
		},
		
		processTouchEndEvent: function(e, element){
			if (e.touches.length == 0 && e.changedTouches.length == 1 && this._touchStartLocation) {
				var x = e.changedTouches[0].clientX,
					y = e.changedTouches[0].clientY;
				if (Math.abs(this._touchStartLocation.x - x) < this._driftThreshold && 
						Math.abs(this._touchStartLocation.y - y) < this._driftThreshold) {
					this._touchStartLocation = null;
					var result = {
						x: x,
						y: y
					};
					if (!element._isGestureBlocked(this.name)) {
						lang.hitch(element,element._handleTouchEvent("click",result));
						lang.hitch(element,element._handleTouchEvent(this.name,result));
					}
				}
			}
		},
		
		processTouchCancelEvent: function(e, element){
			this._touchStartLocation = null;
		}

	});

});;
define("Ti/_/Gestures/Swipe", ["Ti/_/declare", "Ti/_/lang","Ti/_/Gestures/GestureRecognizer"], function(declare,lang,GestureRecognizer) {

	return declare("Ti._.Gestures.Swipe", GestureRecognizer, {
		
		name: "swipe",
		
		_touchStartLocation: null,
		_distanceThresholdPassed: false,
		
		// This specifies the minimum distance that a finger must travel before it is considered a swipe
		_distanceThreshold: 25,
		
		// The masimum angle, in radians, from the axis a swipe is allowed to travel before it is no longer considered a swipe
		_angleThreshold: Math.PI/12, // 15 degrees
		
		processTouchStartEvent: function(e, element){
			if (e.touches.length == 1 && e.changedTouches.length == 1) {
				this._distanceThresholdPassed = false;
				this._touchStartLocation = {
					x: e.changedTouches[0].clientX,
					y: e.changedTouches[0].clientY
				}
			} else {
				this._touchStartLocation = null;
			}
		},
		
		processTouchEndEvent: function(e, element){
			if (e.touches.length == 0 && e.changedTouches.length == 1) {
				this._processSwipeEvent(e,element,true);
			}
			this._touchStartLocation = null;
		},
		
		processTouchMoveEvent: function(e, element){
			if (e.touches.length == 1 && e.changedTouches.length == 1) {
				this._processSwipeEvent(e,element,false);
			}
		},
		
		processTouchCancelEvent: function(e, element){
			this._touchStartLocation = null;
		},
		
		_processSwipeEvent: function(e,element,finishedSwiping) {
			var x = e.changedTouches[0].clientX,
				y = e.changedTouches[0].clientY;
			if (this._touchStartLocation) {
				var xDiff = Math.abs(this._touchStartLocation.x - x),
					yDiff = Math.abs(this._touchStartLocation.y - y),
					distance = Math.sqrt(Math.pow(this._touchStartLocation.x - x,2) + Math.pow(this._touchStartLocation.y - y,2)),
					angleOK;
				!this._distanceThresholdPassed && (this._distanceThresholdPassed = distance > this._distanceThreshold);
				
				if (this._distanceThresholdPassed) {
					// If the distance is small, then the angle is way restrictive, so we ignore it
					if (distance <= this._distanceThreshold || xDiff === 0 || yDiff === 0) {
						angleOK = true;
					} else if (xDiff > yDiff) {
						angleOK = Math.atan(yDiff/xDiff) < this._angleThreshold;
					} else {
						angleOK = Math.atan(xDiff/yDiff) < this._angleThreshold;
					}
					if (!angleOK) {
						this._touchStartLocation = null;
					} else {
						
						if (!element._isGestureBlocked(this.name)) {
							
							// Calculate the direction
							var direction;
							if (xDiff > yDiff) {
								direction =  this._touchStartLocation.x - x > 0 ? "left" : "right";
							} else {
								direction =  this._touchStartLocation.y - y > 0 ? "down" : "up";
							}
							
							// Right now only left and right are supported
							if (direction === "left" || direction === "right") {
								lang.hitch(element,element._handleTouchEvent(this.name,{
									x: x,
									y: y,
									direction: direction,
									_distance: x - this._touchStartLocation.x,
									_finishedSwiping: finishedSwiping
								}));
							}
						}
					}
				}
			}
		}
		
	});
	
});;
define("Ti/_/Gestures/TouchStart", ["Ti/_/declare", "Ti/_/lang","Ti/_/Gestures/GestureRecognizer"], function(declare,lang,GestureRecognizer) {

	return declare("Ti._.Gestures.TouchStart", GestureRecognizer, {
		
		name: "touchstart",
		
		processTouchStartEvent: function(e, element){
			if (!element._isGestureBlocked(this.name)) {
				for (var i = 0; i < e.changedTouches.length; i++) {
					lang.hitch(element,element._handleTouchEvent(this.name,{
						x: e.changedTouches[i].clientX,
						y: e.changedTouches[i].clientY
					}));
				}
			}
		}

	});

});;
define("Ti/_/Gestures/TouchMove", ["Ti/_/declare", "Ti/_/lang","Ti/_/Gestures/GestureRecognizer"], function(declare,lang,GestureRecognizer) {

	return declare("Ti._.Gestures.TouchMove", GestureRecognizer, {
		
		name: "touchmove",
		
		processTouchMoveEvent: function(e, element){
			if (!element._isGestureBlocked(this.name)) {
				for (var i = 0; i < e.changedTouches.length; i++) {
					lang.hitch(element,element._handleTouchEvent(this.name,{
						x: e.changedTouches[i].clientX,
						y: e.changedTouches[i].clientY
					}));
				}
			}
		}

	});

});;
define("Ti/_/Gestures/TouchEnd", ["Ti/_/declare", "Ti/_/lang","Ti/_/Gestures/GestureRecognizer"], function(declare,lang,GestureRecognizer) {

	return declare("Ti._.Gestures.TouchEnd", GestureRecognizer, {
		
		name: "touchend",
		
		processTouchEndEvent: function(e, element){
			if (!element._isGestureBlocked(this.name)) {
				for (var i = 0; i < e.changedTouches.length; i++) {
					lang.hitch(element,element._handleTouchEvent(this.name,{
						x: e.changedTouches[i].clientX,
						y: e.changedTouches[i].clientY
					}));
				}
			}
		}

	});

});;
define("Ti/_/Gestures/TouchCancel", ["Ti/_/declare", "Ti/_/lang","Ti/_/Gestures/GestureRecognizer"], function(declare,lang,GestureRecognizer) {

	return declare("Ti._.Gestures.TouchCancel", GestureRecognizer, {
		
		name: "touchcancel",
		
		processTouchCancelEvent: function(e, element){
			if (!element._isGestureBlocked(this.name)) {
				for (var i = 0; i < e.changedTouches.length; i++) {
					lang.hitch(element,element._handleTouchEvent(this.name,{
						x: e.changedTouches[i].clientX,
						y: e.changedTouches[i].clientY
					}));
				}
			}
		}

	});

});;
define("Ti/_/Gestures/TwoFingerTap", ["Ti/_/declare", "Ti/_/lang","Ti/_/Gestures/GestureRecognizer"], function(declare,lang,GestureRecognizer) {

	return declare("Ti._.Gestures.TwoFingerTap", GestureRecognizer, {
		
		name: "twofingertap",
		
		_touchStartLocation: null,
		_touchEndLocation: null,
		_fingerDifferenceThresholdTimer: null,
		
		// There are two possibilities: the user puts down two fingers at exactly the same time,
		// which is almost impossible, or they put one finger down first, followed by the second.
		// For the second case, we need ensure that the two taps were intended to be at the same time.
		// This value defines the maximum time difference before this is considered some other type of gesture.
		_fingerDifferenceThreshold: 100,
		
		// This is the amount of space the fingers are allowed drift until the gesture is no longer considered a two finger tap
		_driftThreshold: 25,
		
		processTouchStartEvent: function(e, element){
			
			var x = e.changedTouches[0].clientX,
				y = e.changedTouches[0].clientY,
				touchesLength = e.touches.length,
				changedTouchesLength = e.changedTouches.length;
			element.backgroundColor == "yellow" && console.debug("Two Finger Tap" + touchesLength + "," + changedTouchesLength);
			
			// First finger down of the two, given a slight difference in contact time
			if (touchesLength == 1 && changedTouchesLength == 1) {
				this._touchStartLocation = [{
					x: x,
					y: y
				}];
				this._fingerDifferenceThresholdTimer = setTimeout(lang.hitch(this,function(){
					this._touchStartLocation = null;
				}),this._fingerDifferenceThreshold);
			
			// Second finger down of the two, given a slight difference in contact time
			} else if (touchesLength == 2 && changedTouchesLength == 1) {
				clearTimeout(this._fingerDifferenceThresholdTimer);
				if (this._touchStartLocation) {
					this._touchStartLocation.push({
						x: x,
						y: y
					});
				}
				
			// Two fingers down at the same time
			} else if (touchesLength == 2 && changedTouchesLength == 2) {
				this._touchStartLocation = [{
					x: x,
					y: y
				},
				{
					x: e.changedTouches[1].clientX,
					y: e.changedTouches[1].clientY
				}];
				
			// Something else, means it's not a two finger tap
			} else {
				this._touchStartLocation = null;
			}
		},
		
		processTouchEndEvent: function(e, element){
			element.backgroundColor == "yellow" && console.debug("Two Finger Tap end" + e.touches.length + "," + e.changedTouches.length);
			
			var x = e.changedTouches[0].clientX,
				y = e.changedTouches[0].clientY,
				touchesLength = e.touches.length,
				changedTouchesLength = e.changedTouches.length;
			
			// One finger was lifted off, one remains
			if (touchesLength == 1 && changedTouchesLength == 1) {
				this._touchEndLocation = [{
					x: x,
					y: y
				}];
				this._fingerDifferenceThresholdTimer = setTimeout(lang.hitch(this,function(){
					this._touchStartLocation = null;
				}),this._fingerDifferenceThreshold);
				
			// Second or both fingers lifted off
			} else if (touchesLength == 0 && (changedTouchesLength == 1 || changedTouchesLength == 2)) {
				if (this._touchStartLocation && this._touchStartLocation.length == 2) {
					for(var i = 0; i < changedTouchesLength; i++) {
						this._touchEndLocation.push({
							x: x,
							y: y
						});
					}
					var distance1OK = Math.abs(this._touchStartLocation[0].x - this._touchEndLocation[0].x) < this._driftThreshold && 
							Math.abs(this._touchStartLocation[0].y - this._touchEndLocation[0].y) < this._driftThreshold,
						distance2OK = Math.abs(this._touchStartLocation[1].x - this._touchEndLocation[1].x) < this._driftThreshold && 
							Math.abs(this._touchStartLocation[1].y - this._touchEndLocation[1].y) < this._driftThreshold;
					// Check if the end points are swapped from the start points
					if (!distance1OK || !distance2OK) {
						distance1OK = Math.abs(this._touchStartLocation[0].x - this._touchEndLocation[1].x) < this._driftThreshold && 
							Math.abs(this._touchStartLocation[0].y - this._touchEndLocation[1].y) < this._driftThreshold;
						distance2OK = Math.abs(this._touchStartLocation[1].x - this._touchEndLocation[0].x) < this._driftThreshold && 
							Math.abs(this._touchStartLocation[1].y - this._touchEndLocation[0].y) < this._driftThreshold;
					}
					if (distance1OK && distance2OK && !element._isGestureBlocked(this.name)) {
						this.blocking.push("singletap");
						this.blocking.push("doubletap");
						this.blocking.push("longpress");
						lang.hitch(element,element._handleTouchEvent(this.name,{
							x: (this._touchStartLocation[0].x + this._touchStartLocation[1].x) / 2,
							y: (this._touchStartLocation[0].y + this._touchStartLocation[1].y) / 2
						}));
					}
					this._touchStartLocation = null;
				}
				
			// Something else, means it's not a two finger tap
			} else {
				this._touchStartLocation = null;
			}
			
			
		},
		finalizeTouchEndEvent: function(){
			this.blocking = [];
		},
		
		processTouchCancelEvent: function(e, element){
			this._touchStartLocation = null;
		}
		
	});
	
});;
define("Ti/_/UI/Element",
	["Ti/_/browser", "Ti/_/css", "Ti/_/declare", "Ti/_/dom", "Ti/_/lang", "Ti/_/style", "Ti/_/Evented",
	"Ti/_/Gestures/DoubleTap","Ti/_/Gestures/LongPress","Ti/_/Gestures/Pinch","Ti/_/Gestures/SingleTap",
	"Ti/_/Gestures/Swipe","Ti/_/Gestures/TouchCancel","Ti/_/Gestures/TouchEnd","Ti/_/Gestures/TouchMove",
	"Ti/_/Gestures/TouchStart","Ti/_/Gestures/TwoFingerTap"],
	function(browser, css, declare, dom, lang, style, Evented,
		DoubleTap, LongPress, Pinch, SingleTap, Swipe, TouchCancel, TouchEnd, TouchMove, TouchStart, TwoFingerTap) {

	var undef,
		unitize = dom.unitize,
		computeSize = dom.computeSize,
		on = require.on,
		set = style.set,
		isDef = require.isDef,
		val = lang.val,
		is = require.is,
		transitionEvents = {
			webkit: "webkitTransitionEnd",
			trident: "msTransitionEnd",
			gecko: "transitionend",
			presto: "oTransitionEnd"
		},
		transitionEnd = transitionEvents[browser.runtime] || "transitionEnd",
		curves = ["ease", "ease-in", "ease-in-out", "ease-out", "linear"];

	return declare("Ti._.UI.Element", Evented, {

		domType: null,
		domNode: null,

		constructor: function() {
			var bgSelPrevColor,
				bgSelPrevImage,
				bgFocusPrevColor;

			this.domNode = dom.create(this.domType || "div", {
				className: "TiUIElement " + css.clean(this.declaredClass),
				"data-widget-id": this.widgetId
			});
			
			// Handle click/touch/gestures
			this._gestureRecognizers = {
				Pinch: (new Pinch()),
				Swipe: (new Swipe()),
				TwoFingerTap: (new TwoFingerTap()),
				DoubleTap: (new DoubleTap()),
				LongPress: (new LongPress()),
				SingleTap: (new SingleTap()),
				TouchStart: (new TouchStart()),
				TouchEnd: (new TouchEnd()),
				TouchMove: (new TouchMove()),
				TouchCancel: (new TouchCancel())
			};
			var recognizers = this._gestureRecognizers,
			// Each event could require a slightly different precedence of execution, which is why we have these separate lists.
			// For now they are the same, but I suspect they will be different once the android-iphone parity is determined.
				touchStartRecognizers = recognizers,
				touchMoveRecognizers = recognizers,
				touchEndRecognizers = recognizers,
				touchCancelRecognizers = recognizers;
			
			var self = this;
			function processTouchEvent(eventType,e,self,gestureRecognizers) {
				e.preventDefault && e.preventDefault();
				e.changedTouches[0] && e.changedTouches[0].preventDefault && e.changedTouches[0].preventDefault();
				for (var i in gestureRecognizers) {
					gestureRecognizers[i]["process" + eventType](e,self);
				}
				for (var i in gestureRecognizers) {
					gestureRecognizers[i]["finalize" + eventType]();
				}
			}
			if ("ontouchstart" in document.body) {
				on(this.domNode,"touchstart",function(e){
					processTouchEvent("TouchStartEvent",e,self,touchStartRecognizers);
					
					var moveDisconnect = on(window,"touchmove",function(e){
						processTouchEvent("TouchMoveEvent",e,self,touchMoveRecognizers);
					});
					var endDisconnect = on(window,"touchend",function(e){
						processTouchEvent("TouchEndEvent",e,self,touchEndRecognizers);
						moveDisconnect();
						cancelDisconnect();
						endDisconnect();
					});
					var cancelDisconnect = on(window,"touchcancel",function(e){
						processTouchEvent("TouchCancelEvent",e,self,touchCancelRecognizers);
						moveDisconnect();
						cancelDisconnect();
						endDisconnect();
					});
				});
			} else {
				
				// Fall back to using the traditional mouse events
				var mousePressed = false;
				on(this.domNode,"mousedown",function(e){
					mousePressed = true;
					processTouchEvent("TouchStartEvent",{
						touches: [e],
					    targetTouches: [],
					    changedTouches: [e],
					    altKey: e.altKey,
					    metaKey: e.metaKey,
					    ctrlKey: e.ctrlKey,
					    shiftKey: e.shiftKey
					},self,touchStartRecognizers);
					
					var moveDisconnect = on(window,"mousemove",function(e){
						if (mousePressed) {
							processTouchEvent("TouchMoveEvent",{
								touches: [e],
							    targetTouches: [],
							    changedTouches: [e],
							    altKey: e.altKey,
							    metaKey: e.metaKey,
							    ctrlKey: e.ctrlKey,
							    shiftKey: e.shiftKey
							},self,touchMoveRecognizers);
						}
					});
					
					var endDisconnect = on(window,"mouseup",function(e){
						mousePressed = false;
						processTouchEvent("TouchEndEvent",{
							touches: [],
						    targetTouches: [],
						    changedTouches: [e],
						    altKey: e.altKey,
						    metaKey: e.metaKey,
						    ctrlKey: e.ctrlKey,
						    shiftKey: e.shiftKey
						},self,touchEndRecognizers);
						moveDisconnect();
						endDisconnect();
					});
				});
			}

			// TODO: mixin JSS rules (http://jira.appcelerator.org/browse/TIMOB-6780)

			on(this.domNode, "focus", lang.hitch(this, function() {
				var tmp, node = this.domNode;

				this._origBg = style.get(node, ["backgroundColor", "backgroundImage"]);

				(tmp = this.backgroundSelectedColor) && style.set(node, "backgroundColor", tmp);
				(tmp = this.backgroundSelectedImage) && style.set(node, "backgroundImage", style.url(tmp));

				if (this.focusable) {
					(tmp = this.backgroundFocusedColor) && style.set(node, "backgroundColor", tmp);
					(tmp = this.backgroundFocusedImage) && style.set(node, "backgroundImage", style.url(tmp));
				}
			}));

			on(this.domNode, "blur", lang.hitch(this, function() {
				var bg = (this._origBg || []).concat([0, 0]);

				this.focusable && this.backgroundSelectedColor && (bg[0] = this.backgroundSelectedColor);
				bg[0] && style.set(this.domNode, "backgroundColor", bg[0]);

				this.focusable && this.backgroundSelectedImage && (bg[1] = this.backgroundSelectedImage);
				bg[1] && style.set(this.domNode, "backgroundImage", style.url(bg[1]));
			}));
		},

		destroy: function() {
			dom.destroy(this.domNode);
			this.domNode = null;
		},
		
		doLayout: function(originX,originY,parentWidth,parentHeight,centerHDefault,centerVDefault) {
			
			this._originX = originX;
			this._originY = originY;
			this._centerHDefault = centerHDefault;
			this._centerVDefault = centerVDefault;
			
			var dimensions = this._computeDimensions(parentWidth, parentHeight, this.left,this.top,this.right,this.bottom,
				isDef(this.center) ? this.center.x : undef,isDef(this.center) ? this.center.y : undef,this.width,this.height,this.borderWidth);
			
			this._measuredLeft = dimensions.left;
			this._measuredTop = dimensions.top;
			this._measuredRightPadding = dimensions.rightPadding;
			this._measuredBottomPadding = dimensions.bottomPadding;
			this._measuredWidth = dimensions.width;
			this._measuredHeight = dimensions.height;
			this._measuredBorderWidth = dimensions.borderWidth;
					
			// Set the position, size and z-index
			isDef(this._measuredLeft) && set(this.domNode, "left", unitize(this._measuredLeft));
			isDef(this._measuredTop) && set(this.domNode, "top", unitize(this._measuredTop));
			isDef(this._measuredWidth) && set(this.domNode, "width", unitize(this._measuredWidth));
			isDef(this._measuredHeight) && set(this.domNode, "height", unitize(this._measuredHeight));
			set(this.domNode, "zIndex", is(this.zIndex,"Number") ? this.zIndex : 0);
		},
		
		_computeDimensions: function(parentWidth,parentHeight,left,top,originalRight,originalBottom,centerX,centerY,width,height,borderWidth) {
			
			// Compute as many sizes as possible, should be everything except auto
			left = computeSize(left,parentWidth),
			top = computeSize(top,parentHeight),
			originalRight = computeSize(originalRight,parentWidth),
			originalBottom = computeSize(originalBottom,parentHeight),
			centerX = isDef(centerX) ? computeSize(centerX,parentWidth) : undef,
			centerY = isDef(centerY) ? computeSize(centerY,parentHeight) : undef,
			width = computeSize(width,parentWidth),
			height = computeSize(height,parentHeight);
			
			// For our purposes, auto is the same as undefined for position values.
			left == "auto" && (left = undef);
			top == "auto" && (top = undef);
			originalRight == "auto" && (right = undef);
			originalBottom == "auto" && (bottom = undef);
			centerX == "auto" && (centerX = undef);
			centerY == "auto" && (centerY = undef);
			
			// Convert right/bottom coordinates to be with respect to (0,0)
			var right = isDef(originalRight) ? (parentWidth - originalRight) : undef,
				bottom = isDef(originalBottom) ? (parentHeight - originalBottom) : undef;
			
			// Unfortunately css precidence doesn't match the titanium, so we have to handle precedence and default setting ourselves
			if (isDef(width)) {
				if (isDef(left)) {
					right = undef;
				} else if (isDef(centerX)){
					if (width === "auto") {
						left = "calculateAuto";
					} else {
						left = centerX - width / 2;
						right = undef;
					}
				} else if (isDef(right)) {
					// Do nothing
				} else {
					// Set the default position
					left = "calculateAuto";
				}
			} else {
				if (isDef(centerX)) {
					if (isDef(left)) {
						width = (centerX - left) * 2;
						right = undef;
					} else if (isDef(right)) {
						width = (right - centerX) * 2;
					} else {
						// Set the default width
						width = computeSize(this._defaultWidth,parentWidth);
					}
				} else {
					if (isDef(left) && isDef(right)) {
						// Do nothing
					} else {
						width = computeSize(this._defaultWidth,parentWidth);
						if(!isDef(left) && !isDef(right)) {
							// Set the default position
							left = "calculateAuto";
						}
					}
				}
			}
			if (isDef(height)) {
				if (isDef(top)) {
					bottom = undef;
				} else if (isDef(centerY)){
					if(height === "auto") {
						top = "calculateAuto";
					} else {
						top = centerY - height / 2;
						bottom = undef;
					}
				} else if (isDef(bottom)) {
					// Do nothing
				} else {
					// Set the default position
					top = "calculateAuto";
				}
			} else {
				if (isDef(centerY)) {
					if (isDef(top)) {
						height = (centerY - top) * 2;
						bottom = undef;
					} else if (isDef(bottom)) {
						height = (bottom - centerY) * 2;
					} else {
						// Set the default height
						height = computeSize(this._defaultHeight,parentHeight);
					}
				} else {
					if (isDef(top) && isDef(bottom)) {
						// Do nothing
					} else {
						// Set the default height
						height = computeSize(this._defaultHeight,parentHeight);
						if(!isDef(top) && !isDef(bottom)) {
							// Set the default position
							top = "calculateAuto";
						}
					}
				}
			}
			
			// Calculate the width/left properties if width is NOT auto
			var borderWidth = computeSize(borderWidth);
			borderWidth = is(borderWidth,"Number") ? borderWidth: 0;
			if (width != "auto") {
				if (isDef(right)) {
					if (isDef(left)) {
						width = right - left;
					} else {
						left = right - width;
					}
				}
				width -= borderWidth * 2;
			}
			if (height != "auto") {
				if (isDef(bottom)) {
					if (isDef(top)) {
						height = bottom - top;
					} else {
						top = bottom - height;
					}
				}
				height -= borderWidth * 2;
			}
			
			// TODO change this once we re-architect the inheritence so that widgets don't have add/remove/layouts
			if (this.children.length > 0) {
				var computedSize = this._layout.doLayout(this,width,height);
				width == "auto" && (width = computedSize.width);
				height == "auto" && (height = computedSize.height);
			} else {
				width == "auto" && (width = this._getContentWidth());
				height == "auto" && (height = this._getContentHeight());
			}
			
			// Set the default top/left if need be
			if (left == "calculateAuto") {
				left = this._centerHDefault ? computeSize("50%",parentWidth) - (is(width,"Number") ? width : 0) / 2 : 0;
			}
			if (top == "calculateAuto") {
				top = this._centerVDefault ? computeSize("50%",parentHeight) - (is(height,"Number") ? height : 0) / 2 : 0;
			}
			
			// Apply the origin and border width
			left += this._originX;
			top += this._originY;
			var rightPadding = is(originalRight,"Number") ? originalRight : 0,
				bottomPadding = is(originalBottom,"Number") ? originalBottom : 0;
			
			if(!is(left,"Number") || !is(top,"Number") || !is(rightPadding,"Number")
				 || !is(bottomPadding,"Number") || !is(width,"Number") || !is(height,"Number")) {
			 	throw "Invalid layout";
			}
			
			return {
				left: left,
				top:top,
				rightPadding: rightPadding,
				bottomPadding: bottomPadding,
				width: width,
				height: height,
				borderWidth: borderWidth};
		},
		
		// This method returns the offset of the content relative to the parent's location. 
		// This is useful for controls like ScrollView that can move the children around relative to itself.
		_getContentOffset: function(){
			return {x: 0, y: 0};
		},
		
		_gestureRecognizers: [],
		
		_isGestureBlocked: function(gesture) {
			for (var recognizer in this._gestureRecognizers) {
				var blockedGestures = this._gestureRecognizers[recognizer].blocking;
				for (var blockedGesture in blockedGestures) {
					if (gesture === blockedGestures[blockedGesture]) {
						return true;
					}
				}
			}
			return false;
		},
		
		_handleTouchEvent: function(type, e) {
			this.fireEvent(type, e);
		},

		show: function() {
			this.visible = true;
			//this.fireEvent("ti:shown");
		},

		hide: function() {
			this.visible = false;
			//obj.fireEvent("ti:hidden");
		},

		animate: function(anim, callback) {
			var anim = anim || {},
				curve = curves[anim.curve] || "ease",
				fn = lang.hitch(this, function() {
					var transformCss = "";

					// Set the color and opacity properties
					anim.backgroundColor !== undef && (obj.backgroundColor = anim.backgroundColor);
					anim.opacity !== undef && style.set(this.domNode, "opacity", anim.opacity);
					style.set(this.domNode, "display", anim.visible !== undef && !anim.visible ? "none" : "");

					// Set the position and size properties
					var dimensions = this._computeDimensions(
						this._parent ? this._parent._measuredWidth : "auto", 
						this._parent ? this._parent._measuredHeight : "auto", 
						val(anim.left, this.left),
						val(anim.top, this.top),
						val(anim.right, this.right),
						val(anim.bottom, this.bottom),
						isDef(anim.center) ? anim.center.x : isDef(this.center) ? this.center.x : undef,
						isDef(anim.center) ? anim.center.y : isDef(this.center) ? this.center.y : undef,
						val(anim.width, this.width),
						val(anim.height, this.height),
						val(anim.borderWidth, this.borderWidth)
					);

					style.set(this.domNode, {
						left: unitize(dimensions.left),
						top: unitize(dimensions.top),
						width: unitize(dimensions.width),
						height: unitize(dimensions.height),
						borderWidth: unitize(dimensions.borderWidth)
					});

					// Set the z-order
					!isDef(anim.zIndex) && style.set(this.domNode, "zIndex", anim.zIndex);

					// Set the transform properties
					if (anim.transform) {
						this._curTransform = this._curTransform ? this._curTransform.multiply(anim.transform) : anim.transform;
						transformCss = this._curTransform.toCSS();
					}

					style.set(this.domNode, "transform", transformCss);
				}),
				done = function() {
					is(anim.complete, "Function") && anim.complete();
					is(callback, "Function") && callback();
				};

			Ti.UI._doForcedFullLayout();

			anim.duration = anim.duration || 0;
			anim.delay = anim.delay || 0;
			anim.transform && style.set("transform", "");
			anim.start && anim.start();

			if (anim.duration > 0) {
				// Create the transition, must be set before setting the other properties
				style.set(this.domNode, "transition", "all " + anim.duration + "ms " + curve + (anim.delay ? " " + anim.delay + "ms" : ""));
				on.once(window, transitionEnd, lang.hitch(this, function(e) {
					// Clear the transform so future modifications in these areas are not animated
					style.set(this.domNode, "transition", "");
					done();
				}));
				setTimeout(fn, 0);
			} else {
				fn();
				done();
			}
		},
		
		_getContentWidth: function() {
			return this.domNode.clientWidth;
		},
		
		_getContentHeight: function() {
			return this.domNode.clientHeight;
		},
		
		_setTouchEnabled: function(value) {
			set(this.domNode,"pointerEvents", value ? "auto" : "none");
			if(!value) {
				for (var i in this.children) {
					this.children[i]._setTouchEnabled(value);
				}
			}
		},
		
		_measuredLeft: 0,
		_measuredTop: 0,
		_measuredRightPadding: 0,
		_measuredBottomPadding: 0,
		_measuredWidth: 0,
		_measuredHeight: 0,

		properties: {
			
			// Properties that are handled by the element
			backgroundColor: {
				set: function(value) {
					return style.set(this.domNode, "backgroundColor", value);
				}
			},
			backgroundFocusedColor: undef,
			backgroundFocusedImage: undef,
			backgroundGradient: {
				set: function(value) {
					var value = value || {},
						output = [],
						colors = value.colors || [],
						type = value.type,
						start = value.startPoint,
						end = value.endPoint;

					if (type === "linear") {
						start && end && start.x != end.x && start.y != end.y && output.concat([
							unitize(value.startPoint.x) + " " + unitize(value.startPoint.y),
							unitize(value.endPoint.x) + " " + unitize(value.startPoint.y)
						]);
					} else if (type === "radial") {
						start = value.startRadius;
						end = value.endRadius;
						start && end && output.push(unitize(start) + " " + unitize(end));
						output.push("ellipse closest-side");
					} else {
						style.set(this.domNode, "backgroundImage", "none");
						return;
					}

					require.each(colors, function(c) {
						output.push(c.color ? c.color + " " + (c.position * 100) + "%" : c);
					});

					output = type + "-gradient(" + output.join(",") + ")";

					require.each(vendorPrefixes.css, function(p) {
						style.set(this.domNode, "backgroundImage", p + output);
					});

					return value;
				}
			},
			backgroundImage: {
				set: function(value) {
					return style.set(this.domNode, "backgroundImage", value ? style.url(value) : "");
				}
			},
			backgroundSelectedColor: undef,
			backgroundSelectedImage: undef,
			borderColor: {
				set: function(value) {
					if (style.set(this.domNode, "borderColor", value)) {
						this.borderWidth | 0 || (this.borderWidth = 1);
						style.set(this.domNode, "borderStyle", "solid");
					} else {
						this.borderWidth = 0;
					}
					return value;
				}
			},
			borderRadius: {
				set: function(value) {
					style.set(this.domNode, "borderRadius", unitize(value));
					return value;
				}
			},
			borderWidth: {
				set: function(value) {
					style.set(this.domNode, "borderWidth", unitize(value));
					this.borderColor || style.set(this.domNode, "borderColor", "black");
					style.set(this.domNode, "borderStyle", "solid");
					return value;
				}
			},
			color: {
				set: function(value) {
					return style.set(this.domNode, "color", value);
				}
			},
			focusable: undef,
			opacity: {
				set: function(value) {
					return this.domNode.style.opacity = value;
				}
			},
			visible: {
				set: function(value, orig) {
					if (value !== orig) {
						!value && (this._lastDisplay = style.get(this.domNode, "display"));
						style.set(this.domNode, "display", !!value ? this._lastDisplay || "" : "none");
						!!value && Ti.UI._doFullLayout();
					}
					return value;
				}
			},
			
			touchEnabled: {
				set: function(value) {
					this._setTouchEnabled(value);
					return value;
				},
				value: true
			},

			transform: {
				set: function(value) {
					style.set(this.domNode, "transform", value.toCSS());
					return this._curTransform = value;
				}
			},

			// Properties that are handled by the layout manager
			bottom: {
				set: function(value) {
					Ti.UI._doFullLayout();
					return value;
				}
			},
			
			center: {
				set: function(value) {
					Ti.UI._doFullLayout();
					return value;
				}
			},
			
			height: {
				set: function(value) {
					Ti.UI._doFullLayout();
					return value;
				}
			},
			
			left: {
				set: function(value) {
					Ti.UI._doFullLayout();
					return value;
				}
			},
			
			right: {
				set: function(value) {
					Ti.UI._doFullLayout();
					return value;
				}
			},
			
			top: {
				set: function(value) {
					Ti.UI._doFullLayout();
					return value;
				}
			},
			
			width: {
				set: function(value) {
					Ti.UI._doFullLayout();
					return value;
				}
			},
			
			zIndex: {
				set: function(value) {
					Ti.UI._doFullLayout();
					return value;
				}
			},
			
			size: {
				set: function(value) {
					console.debug('Property "Titanium._.UI.Element#.size" is not implemented yet.');
					return value;
				}
			}
		}

	});

});;
define("Ti/_/Layouts/Base", ["Ti/_/css", "Ti/_/declare", "Ti/_/style", "Ti/_/dom"], function(css, declare, style, dom) {
	
	var unitize = dom.unitize,
		set = style.set,
		isDef = require.isDef,
		is = require.is,
		undef;

	return declare("Ti._.Layouts.Base", null, {

		constructor: function(element) {
			this.element = element;
			css.add(element.domNode, css.clean(this.declaredClass));
		},

		destroy: function() {
			css.remove(this.element.domNode, css.clean(this.declaredClass));
		}

	});

});;
define("Ti/_/Layouts/Absolute", ["Ti/_/Layouts/Base", "Ti/_/declare"], function(Base, declare) {

	return declare("Ti._.Layouts.Absolute", Base, {

		doLayout: function(element, width, height) {
			var computedSize = {width: 0, height: 0};
			for(var i = 0; i < element.children.length; i++) {
				
				// Layout the child
				var child = element.children[i];
				child.doLayout(0,0,width,height,true,true);
				
				// Update the size of the component
				var rightMostEdge = child._measuredWidth + child._measuredLeft + 2 * child._measuredBorderWidth + child._measuredRightPadding;
				var bottomMostEdge = child._measuredHeight + child._measuredTop + 2 * child._measuredBorderWidth + child._measuredBottomPadding;
				rightMostEdge > computedSize.width && (computedSize.width = rightMostEdge);
				bottomMostEdge > computedSize.height && (computedSize.height = bottomMostEdge);
			}
			return computedSize;
		}

	});

});
;
define("Ti/_/Layouts/Horizontal", ["Ti/_/Layouts/Base", "Ti/_/declare"], function(Base, declare) {

	return declare("Ti._.Layouts.Horizontal", Base, {

		doLayout: function(element, width, height) {
			var computedSize = {width: 0, height: 0},
				currentLeft = 0;
			for(var i = 0; i < element.children.length; i++) {
				
				// Layout the child
				var child = element.children[i];
				child.doLayout(currentLeft,0,width,height,false,false);
				
				// Update the size of the component
				currentLeft = child._measuredLeft + child._measuredWidth + 2 * child._measuredBorderWidth + child._measuredRightPadding;
				var bottomMostEdge = child._measuredTop + child._measuredHeight + 2 * child._measuredBorderWidth + child._measuredBottomPadding;
				currentLeft > computedSize.width && (computedSize.width = currentLeft);
				bottomMostEdge > computedSize.height && (computedSize.height = bottomMostEdge);
			}
			return computedSize;
		}

	});

});
;
define("Ti/_/Layouts/Vertical", ["Ti/_/Layouts/Base", "Ti/_/declare"], function(Base, declare) {

	return declare("Ti._.Layouts.Vertical", Base, {

		doLayout: function(element, width, height) {
			var computedSize = {width: 0, height: 0},
				currentTop = 0;
			for(var i = 0; i < element.children.length; i++) {
				
				// Layout the child
				var child = element.children[i];
				child.doLayout(0,currentTop,width,height,true,false);
				
				// Update the size of the component
				var rightMostEdge = child._measuredWidth + child._measuredLeft + 2 * child._measuredBorderWidth + child._measuredRightPadding;
				currentTop = child._measuredHeight + child._measuredTop + 2 * child._measuredBorderWidth + child._measuredBottomPadding;
				rightMostEdge > computedSize.width && (computedSize.width = rightMostEdge);
				currentTop > computedSize.height && (computedSize.height = currentTop);
			}
			return computedSize;
		}

	});

});
;
define("Ti/_/Layouts",
	["Ti/_/Layouts/Absolute", "Ti/_/Layouts/Horizontal", "Ti/_/Layouts/Vertical"],
	function(Absolute, Horizontal, Vertical) {

	return {
		Absolute: Absolute,
		Horizontal: Horizontal,
		Vertical: Vertical
	};

});;
define("Ti", ["Ti/_/Evented"], function(Evented) {

	var ver = require.config.ti.version;

	return require.mix(Ti, Evented, {
		version: ver,
		buildDate: "01/27/12 17:31",
		buildHash: "a24502a",
		userAgent: "Appcelerator Titanium/" + ver + " (" + navigator.userAgent + ")",

		include: function(files) {
			var i = 0;
			typeof files === "array" || (files = [].concat(Array.prototype.slice.call(arguments, 0)));
			for (; i < files.length; i++) {
				require("Ti/_/include!" + files[i]);
			}
		}
	});

});
;
define("Ti/Accelerometer", ["Ti/_/Evented"], function(Evented) {
	
	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
	
		var undef,
			lastShake = (new Date()).getTime(),
			lastAccel = {};
	
		require.on(window, "devicemotion", function(evt) {
			var e = evt.acceleration || evt.accelerationIncludingGravity,
				currentTime,
				accel = e && {
					x: e.x,
					y: e.y,
					z: e.z,
					source: evt.source
				};
			if (accel) {
				if (lastAccel.x !== undef && (
					Math.abs(lastAccel.x - accel.x) > 0.2 || 
					Math.abs(lastAccel.y - accel.y) > 0.2 ||
					Math.abs(lastAccel.z - accel.z) > 0.2
				)) {
					currentTime = (new Date()).getTime();
					accel.timestamp = currentTime - lastShake;
					lastShake = currentTime;
					api.fireEvent("update", accel);
				}
				lastAccel = accel;
			}
		});
	
	})(Ti._5.createClass("Ti.Accelerometer"));
	
});;
define("Ti/Analytics", ["Ti/_/Evented"], function(Evented) {
	
	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
	
		// Methods
		api.addEvent = function(typ, name, data){
			Ti._5.addAnalyticsEvent(typ, name, data);
		};
		api.featureEvent = function(name, data){
			Ti._5.addAnalyticsEvent('app.feature', name, data);
		};
		api.navEvent = function(from, to, name, data){
			Ti._5.addAnalyticsEvent('app.nav', name, data);
		};
		api.settingsEvent = function(name, data){
			Ti._5.addAnalyticsEvent('app.settings', name, data);
		};
		api.timedEvent = function(name, start, stop, duration, data){
			if(data == null){
				data = {};
			}
			data.start = start;
			data.stop = stop;
			data.duration = duration;
	
			Ti._5.addAnalyticsEvent('app.timed', name, data);
		};
		api.userEvent = function(name, data){
			Ti._5.addAnalyticsEvent('app.user', name, data);
		};
	})(Ti._5.createClass('Ti.Analytics'));
	
});;
define("Ti/API", ["Ti/_/Evented", "Ti/_/lang"], function(Evented, lang) {

	var api = {};

	require.each(["debug", "error", "info", "log", "warn"], function(fn) {
		api[fn] = function(msg) {
			console[fn]("[" + fn.toUpperCase() + "]", msg);
		};
	});

	return lang.setObject("Ti.API", Evented, api);

});;
define("Ti/App", ["Ti/_/Evented"], function(Evented) {

	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
	
		require.mix(api, require.config.app, {
			idleTimerDisabled: true,
			proximityDetection: false,
			proximityState: 0
		});
	
		// Methods
		api.getArguments = function(){
			console.debug('Method "Titanium.App.getArguments" is not implemented yet.');
		};
	})(Ti._5.createClass('Ti.App'));

});;
define("Ti/App/Properties", ["Ti/_/Evented"], function(Evented) {

	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
		var STORAGE = "ti:LocalStorage";
		var _getProp = function(prop, def, transform){
			if(prop == null){
				return;
			}
			var storage = localStorage.getItem(STORAGE);
			if(storage == null){
				storage = [];
			} else {
				storage = JSON.parse(storage);
			}
			var val =  storage[prop];
			if(val != null){
				return typeof transform !== 'undefined' ? transform(val) : val;
			} else if (typeof def !== 'undefined'){
				return def;
			}
	
			return val;
		};
	
		var _setProp = function(prop, val, transform){
			if(prop == null || typeof val === 'undefined'){
				return;
			}
			val = typeof transform !== 'undefined' ? transform(val) : val;
			var storage = localStorage.getItem(STORAGE);
			if(storage == null){
				storage = {};
			} else {
				storage = JSON.parse(storage);
			}
			if(prop != null){
				storage[prop] = val;
			}
			localStorage.setItem(STORAGE, JSON.stringify(storage));
		};
	
		var _parseBoolean = function(val){return Boolean(val);};
		// Methods
		api.getBool = function(prop, def){
			return _getProp(prop, def, _parseBoolean);
		};
		api.getDouble = function(prop, def){
			return _getProp(prop, def, parseFloat);
		};
		api.getInt = function(prop, def){
			return _getProp(prop, def, parseInt);
		};
		api.getList = function(prop, def){
			return _getProp(prop, def, function(val){
				if(val instanceof Array){
					return val;
				}
				return [val];
			});
		};
		api.getString = function(prop, def){
			return _getProp(prop, def, function(val){
				if(typeof val === 'string'){
					return val;
				}
				return val.toString();
			});
		};
		api.hasProperty = function(prop){
			return typeof _getProp(prop) !== 'undefined';
		};
		api.listProperties = function(){
			var storage = localStorage.getItem(STORAGE);
			if(storage == null){
				return [];
			} else {
				storage = JSON.parse(storage);
			}
			var props = [];
			for(var key in storage){
				props.push(key);
			}
	
			return props;
		};
		api.removeProperty = function(prop){
			var storage = localStorage.getItem(STORAGE);
			if(storage == null){
				return;
			} else {
				storage = JSON.parse(storage);
			}
			
			delete storage[prop];
	
			localStorage.setItem(STORAGE, JSON.stringify(storage));
		};
		api.setBool = function(prop, val){
			_setProp(prop, val, _parseBoolean);
		};
		api.setDouble = function(prop, val){
			_setProp(prop, val, parseFloat);
		};
		api.setInt = function(prop, val){
			_setProp(prop, val, parseInt);
		};
		api.setList = function(prop, val){
			_setProp(prop, val, function(val){
				if(val instanceof Array){
					return val;
				}
				return [val];
			});
		};
		api.setString = function(prop, val){
			_setProp(prop, val, function(val){
				return val !== null ? ""+val : null;
			});
		};
	})(Ti._5.createClass('Ti.App.Properties'));

});;
define("Ti/Blob", ["Ti/_/Evented"], function(Evented) {
	
	(function(api){	// Methods
		api.imageAsThumbnail = function(){
			console.debug('Method "Titanium.Blob.imageAsThumbnail" is not implemented yet.');
		};
	})(Ti._5.createClass('Ti.Blob'));

});;
define("Ti/Contacts", ["Ti/_/Evented"], function(Evented) {

	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
	
		// Properties
		Ti._5.propReadOnly(api, {
			CONTACTS_KIND_ORGANIZATION: 0,
			CONTACTS_KIND_PERSON: 1,
			CONTACTS_SORT_FIRST_NAME: 2,
			CONTACTS_SORT_LAST_NAME: 3
		});
	
		// Methods
		api.createGroup = function(){
			console.debug('Method "Titanium.Contacts.createGroup" is not implemented yet.');
		};
		api.createPerson = function(){
			console.debug('Method "Titanium.Contacts.createPerson" is not implemented yet.');
		};
		api.getAllGroups = function(){
			console.debug('Method "Titanium.Contacts.getAllGroups" is not implemented yet.');
		};
		api.getAllPeople = function(){
			console.debug('Method "Titanium.Contacts.getAllPeople" is not implemented yet.');
		};
		api.getGroupByID = function(){
			console.debug('Method "Titanium.Contacts.getGroupByID" is not implemented yet.');
		};
		api.getPeopleWithName = function(){
			console.debug('Method "Titanium.Contacts.getPeopleWithName" is not implemented yet.');
		};
		api.getPersonByID = function(){
			console.debug('Method "Titanium.Contacts.getPersonByID" is not implemented yet.');
		};
		api.removeGroup = function(){
			console.debug('Method "Titanium.Contacts.removeGroup" is not implemented yet.');
		};
		api.removePerson = function(){
			console.debug('Method "Titanium.Contacts.removePerson" is not implemented yet.');
		};
		api.revert = function(){
			console.debug('Method "Titanium.Contacts.revert" is not implemented yet.');
		};
		api.save = function(){
			console.debug('Method "Titanium.Contacts.save" is not implemented yet.');
		};
		api.showContacts = function(){
			console.debug('Method "Titanium.Contacts.showContacts" is not implemented yet.');
		};
	})(Ti._5.createClass("Ti.Contacts"));

});;
define("Ti/Database", ["Ti/_/Evented"], function(Evented) {
	
	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
		// Methods
		api.install = function(){
			console.debug('Method "Titanium.Database.install" is not implemented yet.');
		};
		api.open = function(name, version, desc, size) {
			return new api.DB({
				name: name,
				version: version,
				desc: desc,
				size: size
			});
		};
	})(Ti._5.createClass('Ti.Database'));

	
});;
define("Ti/Facebook", ["Ti/_/Evented"], function(Evented) {

	(function(api){

		var undef,
			facebookInitialized = false,
			loginAfterInitialization = false,
			appid = null,
			notLoggedInMessage = "not logged in",
			facebookDiv = document.createElement("div"),
			facebookScriptTagID = "facebook-jssdk",
			facebookLoaded = false;
	
		// Interfaces
		Ti._5.EventDriven(api);
	
		function initFacebook() {
			FB.init({
				appId: appid, // App ID
				status: false, // do NOT check login status because we're gonna do it after init() anyways
				cookie: true, // enable cookies to allow the server to access the session
				oauth: true, // enable OAuth 2.0
				xfbml: true  // parse XFBML
			});
			FB.getLoginStatus(function(response){
				facebookInitialized = true;
				(response.status == "connected" && initSession(response)) || loginAfterInitialization && loginInternal();
			});
		}
	
		function initSession(response) {
			var ar = response.authResponse;
			if (ar) {
				// Set the various status members
				loggedIn = true;
				api.uid = ar.userID;
				api.expirationDate = new Date((new Date()).getTime() + ar.expiresIn * 1000);
	
				// Set a timeout to match when the token expires
				ar.expiresIn && setTimeout(function(){ 
					api.logout();
				}, ar.expiresIn * 1000);
	
				// Fire the login event
				api.fireEvent("login", {
					cancelled: false,
					data: response,
					success: true,
					uid: api.uid
				});
	
				return true;
			}
		}
	
		// Properties
		Ti._5.prop(api, {
			accessToken: undef,
			appid: {
				get: function(){return appid;},
				set: function(val){
					appid = val;
					facebookLoaded && initFacebook();
				}
			},
			expirationDate: undef,
			forceDialogAuth: {
				get: function(){return true;},
				set: function(){}
			},
			loggedIn: false,
			permissions: undef,
			uid: undef
		});
	
		// Create the div required by Facebook
		facebookDiv.id = "fb-root";
		document.body.appendChild(facebookDiv);
	
		// Load the Facebook SDK Asynchronously.
		if (!document.getElementById(facebookScriptTagID)) {
			var facebookScriptTag = document.createElement("script"),
				head = document.getElementsByTagName("head")[0];
			facebookScriptTag.id = facebookScriptTagID; 
			facebookScriptTag.async = true;
			facebookScriptTag.src = "//connect.facebook.net/en_US/all.js";
			head.insertBefore(facebookScriptTag, head.firstChild);
		}
	
		window.fbAsyncInit = function() {
			facebookLoaded = true;
			appid && initFacebook();
		};
	
		function processResponse(response, requestParamName, requestParamValue, callback) {
			result = {source:api,success:false};
			result[requestParamName] = requestParamValue;
			if (!response || response.error) {
				response && (result["error"] = response.error);
			} else {
				result["success"] = true;
				result["result"] = JSON.stringify(response);
			}
			callback(result);
		}
			
		function loginInternal() {
			FB.login(function(response) {
				initSession(response) || api.fireEvent("login", {
					cancelled	: true,
					data		: response,
					error		: "user cancelled or an internal error occured.",
					success		: false,
					uid			: response.id
				});
			}, {"scope":api.permissions.join()});
		}
	
		// Methods
		api.authorize = function() {
			// Sanity check
			if (appid == null) {
				throw new Error("App ID not set. Facebook authorization cancelled.");
			}
	
			// Check if facebook is still initializing, and if so queue the auth request
			if (facebookInitialized) {
				// Authorize
				loginInternal();
			} else {
				loginAfterInitialization = true;
			}
		};
		api.createLoginButton = function(parameters) {
			throw new Error('Method "Titanium.Facebook.createLoginButton" is not implemented yet.');
		};
		api.dialog = function(action, params, callback) {
			if (loggedIn) {
				params.method = action;
				FB.ui(params,function(response){
					processResponse(response,"action",action,callback);
				});
			} else {
				callback({
					success	: false,
					error	: notLoggedInMessage,
					action	: action,
					source	: api
				});
			}
		};
		api.logout = function() {
			loggedIn && FB.logout(function(response) {
				loggedIn = false;
				api.fireEvent("logout", {
					success	: true
				});
			});
		};
		api.request = function(method, params, callback) {
			if (loggedIn) {
				params.method = method;
				params.urls = "facebook.com,developers.facebook.com";
				FB.api(params,function(response){
					processResponse(response,"method",method,callback);
				});
			} else {
				callback({
					success	: false,
					error	: notLoggedInMessage,
					method	: method,
					source	: api
				});
			}
		};
		api.requestWithGraphPath = function(path, params, httpMethod, callback) {
			if (loggedIn) {
				FB.api(path,httpMethod,params,function(response){
					processResponse(response,"path",path,callback);
				});
			} else {
				callback({
					success	: false,
					error	: notLoggedInMessage,
					path	: path,
					source	: api
				});
			}
		};
	})(Ti._5.createClass("Ti.Facebook"));

});;
define("Ti/Filesystem", ["Ti/_/Evented"], function(Evented) {

	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
	
		// Properties
		Ti._5.propReadOnly(api, {
			MODE_APPEND: 1,
			MODE_READ: 2,
			MODE_WRITE: 3,
			applicationDataDirectory: "/",
			applicationDirectory: "/",
			lineEnding: "\n",
			resourcesDirectory: "/",
			separator: "/",
			tempDirectory: null
		});
	
		// Methods
		api.createFile = function(){
			console.debug('Method "Titanium.Filesystem.createFile" is not implemented yet.');
		};
		api.createTempDirectory = function(){
			console.debug('Method "Titanium.Filesystem.createTempDirectory" is not implemented yet.');
		};
		api.createTempFile = function(){
			console.debug('Method "Titanium.Filesystem.createTempFile" is not implemented yet.');
		};
		api.getFile = function(){
			console.debug('Method "Titanium.Filesystem.getFile" is not implemented yet.');
			return new Ti.Filesystem.File;
		};
		api.isExternalStoragePresent = function(){
			console.debug('Method "Titanium.Filesystem.isExternalStoragePresent" is not implemented yet.');
		};
	})(Ti._5.createClass('Ti.Filesystem'));

});;
define("Ti/Geolocation", ["Ti/_/Evented"], function(Evented) {
	
	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
	
		var undef;
	
		// Properties
		Ti._5.propReadOnly(api, {
			ACCURACY_BEST: 0,
			ACCURACY_HUNDRED_METERS: 2,
			ACCURACY_KILOMETER: 3,
			ACCURACY_NEAREST_TEN_METERS: 1,
			ACCURACY_THREE_KILOMETERS: 4,
	
			AUTHORIZATION_AUTHORIZED: 4,
			AUTHORIZATION_DENIED: 1,
			AUTHORIZATION_RESTRICTED: 2,
			AUTHORIZATION_UNKNOWN: 0,
	
			ERROR_DENIED: 1,
			ERROR_HEADING_FAILURE: 2,
			ERROR_LOCATION_UNKNOWN: 3,
			ERROR_NETWORK: 0,
			ERROR_REGION_MONITORING_DELAYED: 4,
			ERROR_REGION_MONITORING_DENIED: 5,
			ERROR_REGION_MONITORING_FAILURE: 6,
	
			PROVIDER_GPS: 1,
			PROVIDER_NETWORK: 2
		});
	
		Ti._5.prop(api, {
			accuracy: api.ACCURACY_BEST,
			locationServicesAuthorization: undef,
			locationServicesEnabled: undef,
			preferredProvider: undef,
			purpose: undef,
			showCalibration: true
		});
	
		// Methods
		api.getCurrentPosition = function(callbackFunc) {
			if (_lastPosition && require.is(callbackFunc, "Function")) {
				callbackFunc(_lastPosition);
				return;
			}
			if (_lastError) {
				require.is(callbackFunc, "Function") && callbackFunc(_lastError);
				return;
			}
			navigator.geolocation.getCurrentPosition(
				function(oPos){
					require.is(callbackFunc, "Function") && callbackFunc({
						code: 0,
						coords: {
							latitude : oPos.coords.latitude,
							longitude : oPos.coords.longitude,
							altitude : oPos.coords.altitude,
							heading : oPos.coords.heading,
							accuracy : oPos.coords.accuracy,
							speed : oPos.coords.speed,
							altitudeAccuracy : oPos.coords.altitudeAccuracy,
							timestamp : oPos.timestamp
						},
						error: "",
						success: true
					});
				},
				function(oError){
					require.is(callbackFunc, "Function") && callbackFunc({
						coords: null,
						error: oError.message,
						message: oError.message,
						success: false
					});
				},
				{
					enableHighAccuracy : _accuracy < 3 || api.ACCURACY_BEST === _accuracy
				}
			);
		};
	
		var _watchId,
			_oldAddEventListener = api.addEventListener, // WARNING: this may cause problems
			_lastPosition = null,
			_lastError = null;
	
		api.addEventListener = function(eventType, callback){
			_oldAddEventListener(eventType, callback);
			if(eventType == "location"){
				_watchId = navigator.geolocation.watchPosition(
					function(oPos){
						_lastError = null;
	
						api.fireEvent("location", _lastPosition = {
							code: 0,
							coords : {
								latitude : oPos.coords.latitude,
								longitude : oPos.coords.longitude,
								altitude : oPos.coords.altitude,
								heading : oPos.coords.heading,
								accuracy : oPos.coords.accuracy,
								speed : oPos.coords.speed,
								altitudeAccuracy : oPos.coords.altitudeAccuracy,
								timestamp : oPos.timestamp
							},
							error: "",
							provider: null,
							success: true
						});
						/*
						if (oPos.heading) {
							api.fireEvent("heading", oPos);
						}
						*/
					},
					function(oError){
						_lastPosition = null;
	
						api.fireEvent("location", _lastError = {
							coords: null,
							error: oError.message,
							message: oError.message,
							provider: null,
							success: false
						});
						/*
						if (oPos.heading) {
							api.fireEvent("heading", oPos);
						}
						*/
					},
					{
						enableHighAccuracy : _accuracy < 3 || api.ACCURACY_BEST === _accuracy
					}
				);
			}
		};
		var _oldRemoveEventlistener = api.removeEventListener; // WARNING: this may cause problems
		api.removeEventListener = function(eventName, cb){
			_oldRemoveEventlistener(eventName, cb);
			if(eventName == "location"){
				navigator.geolocation.clearWatch(_watchId);
			}
		};
	
		api.forwardGeocoder = function(address, callbackFunc) {};
		api.getCurrentHeading = function(callbackFunc) {};
		api.reverseGeocoder = function(latitude, longitude, callbackFunc) {};
		api.setShowCalibration = function(val) {
			/*
			if ("undefined" == typeof val) {
				val = true;
			}
			*/
			api.showCalibration = !!val;
		};
	})(Ti._5.createClass("Ti.Geolocation"));

});;
define("Ti/Locale", ["Ti/_/Evented"], function(Evented) {

	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
	
		var lang = navigator.language.replace(/^([^\-\_]+)[\-\_](.+)?$/, function(o, l, c){ return l.toLowerCase() + (c && "-" + c.toUpperCase()); }),
			langParts = lang.split("-");
	
		// Properties
		Ti._5.propReadOnly(api, {
			currentCountry: langParts[1] || "",
			currentLanguage: langParts[0] || "",
			currentLocale: lang
		});
	
		// Methods
		api.formatTelephoneNumber = function() {
			console.debug('Method "Titanium.Locale.formatTelephoneNumber" is not implemented yet.');
		};
		api.getCurrencyCode = function() {
			console.debug('Method "Titanium.Locale.getCurrencyCode" is not implemented yet.');
		};
		api.getCurrencySymbol = function() {
			console.debug('Method "Titanium.Locale.getCurrencySymbol" is not implemented yet.');
		};
		api.getLocaleCurrencySymbol = function() {
			console.debug('Method "Titanium.Locale.getLocaleCurrencySymbol" is not implemented yet.');
		};
		api.getString = function(str, hintText) {
			var data = Ti._5.getLocaleData();
			if(typeof data[api.currentLanguage] != 'undefined' && typeof data[api.currentLanguage][str] != 'undefined') {
				return data[api.currentLanguage][str];
			} else if (typeof hintText != 'undefined'){
				return hintText;
			}
			return str;
		};
	})(Ti._5.createClass("Ti.Locale"));
	
	// L = Ti.Locale.getString;
	Object.defineProperty(window, "L", { value: Ti.Locale.getString, enumarable: true });
	
	(function(api){
		// format a generic string using the [IEEE printf specification](http://www.opengroup.org/onlinepubs/009695399/functions/printf.html).
		api.format = function(s) {
			console.debug('Method "String.format" is not implemented yet.');
			return [].concat(Array.prototype.slice.call(arguments, 0)).join(" ");
		};
	
		// format a date into a locale specific date format. Optionally pass a second argument (string) as either "short" (default), "medium" or "long" for controlling the date format.
		api.formatDate = function(dt, fmt) {
			console.debug('Method "String.formatDate" is not implemented yet.');
			return dt.toString();
		};
	
		// format a date into a locale specific time format.
		api.formatTime = function(dt) {
			console.debug('Method "String.formatTime" is not implemented yet.');
			return dt.toString();
		};
	
		// format a number into a locale specific currency format.
		api.formatCurrency = function(amt) {
			console.debug('Method "String.formatCurrency" is not implemented yet.');
			return amt;
		};
	
		// format a number into a locale specific decimal format.
		api.formatDecimal = function(dec) {
			console.debug('Method "String.formatDecimal" is not implemented yet.');
			return dec;
		};
	})(String);

});;
define("Ti/Map", ["Ti/_/Evented"], function(Evented) {
	
	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
	
		// Properties
		Ti._5.propReadOnly(api, {
			HYBRID_TYPE: 0,
			SATELLITE_TYPE: 1,
			STANDARD_TYPE: 2
		});
	
		// Methods
		api.createAnnotation = function(){
			console.debug('Method "Titanium.Map.createAnnotation" is not implemented yet.');
		};
		api.createMapView = function(){
			console.debug('Method "Titanium.Map.createMapView" is not implemented yet.');
		};
	})(Ti._5.createClass('Ti.Map'));

});;
define("Ti/Media", ["Ti/_/Evented", "Ti/_/lang"], function(Evented, lang) {

	return lang.setObject("Ti.Media", Evented, {

		constants: {
			UNKNOWN_ERROR: 0,
			DEVICE_BUSY: 1,
			NO_CAMERA: 2,
			NO_VIDEO: 3,

			VIDEO_CONTROL_DEFAULT: 1,
			VIDEO_CONTROL_EMBEDDED: 1,
			VIDEO_CONTROL_FULLSCREEN: 2,
			VIDEO_CONTROL_NONE: 0,
			VIDEO_CONTROL_HIDDEN: 0,

			VIDEO_SCALING_NONE: 0,
			VIDEO_SCALING_ASPECT_FILL: 2,
			VIDEO_SCALING_ASPECT_FIT: 1,
			VIDEO_SCALING_MODE_FILL: 3,

			VIDEO_PLAYBACK_STATE_STOPPED: 0,
			VIDEO_PLAYBACK_STATE_PLAYING: 1,
			VIDEO_PLAYBACK_STATE_PAUSED: 2,

			VIDEO_LOAD_STATE_PLAYABLE: 1,
			VIDEO_LOAD_STATE_PLAYTHROUGH_OK: 2,
			VIDEO_LOAD_STATE_STALLED: 4,
			VIDEO_LOAD_STATE_UNKNOWN: 0,

			VIDEO_REPEAT_MODE_NONE: 0,
			VIDEO_REPEAT_MODE_ONE: 1,

			VIDEO_FINISH_REASON_PLAYBACK_ENDED: 0,
			VIDEO_FINISH_REASON_PLAYBACK_ERROR: 1,
			VIDEO_FINISH_REASON_USER_EXITED: 2
		},

		beep: function() {
			console.debug('Method "Titanium.Media.beep" is not implemented yet.');
		},

		createAudioPlayer: function() {
			console.debug('Method "Titanium.Media.createAudioPlayer" is not implemented yet.');
		},

		createAudioRecorder: function() {
			console.debug('Method "Titanium.Media.createAudioRecorder" is not implemented yet.');
		},

		createItem: function() {
			console.debug('Method "Titanium.Media.createItem" is not implemented yet.');
		},

		createSound: function() {
			console.debug('Method "Titanium.Media.createSound" is not implemented yet.');
		},

		createVideoPlayer: function(args) {
			return new Ti.Media.VideoPlayer(args);
		}

	});
	
});;
define("Ti/Network", ["Ti/_/Evented"], function(Evented) {

	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
	
		var _httpURLFormatter = null,
		    _online = navigator.onLine;
	
		// Properties
		Ti._5.propReadOnly(api, {
			INADDR_ANY: null,
			NETWORK_LAN: 1,
			NETWORK_MOBILE: 3,
			NETWORK_NONE: 0,
			NETWORK_UNKNOWN: -1,
			NETWORK_WIFI: 2,
			NOTIFICATION_TYPE_ALERT: 0,
			NOTIFICATION_TYPE_BADGE: 1,
			NOTIFICATION_TYPE_SOUND: 2,
			READ_MODE: 0,
			READ_WRITE_MODE: 2,
			WRITE_MODE: 1,
			networkType: function() {
				if (!_online) {
					return api.NETWORK_NONE;
				}		
				if (navigator.connection && navigator.connection.type == navigator.connection.WIFI) {
					return api.NETWORK_WIFI;
				}
				if (navigator.connection && navigator.connection.type == navigator.connection.ETHERNET) {
					return api.NETWORK_LAN;
				}
				if (
					navigator.connection &&
					(navigator.connection.type == navigator.connection.CELL_2G ||
					navigator.connection.type == navigator.connection.CELL_3G)			
				) {
					return api.NETWORK_MOBILE;
				}
				
				return api.NETWORK_UNKNOWN;
			},
			networkTypeName: function() {
				if (!_online) {
					return "NONE";
				}		
				if (navigator.connection && navigator.connection.type == navigator.connection.WIFI) {
					return "WIFI";
				}
				if (navigator.connection && navigator.connection.type == navigator.connection.ETHERNET) {
					return "LAN";
				}
				if (
					navigator.connection &&
					(navigator.connection.type == navigator.connection.CELL_2G ||
					navigator.connection.type == navigator.connection.CELL_3G)			
				) {
					return "MOBILE";
				}
				
				return "UNKNOWN";
			},
			online: function() {
				return navigator.onLine;
			}
		});
		
		Ti._5.prop(api, "httpURLFormatter", {
			get: function() {return _httpURLFormatter;},
			set: function(val) {_httpURLFormatter = val;}
		});
	
		// Methods
		api.createHTTPClient = function(args) {
			return new Ti.Network.HTTPClient(args);
		};
	
		api.decodeURIComponent = function(value) {
			return decodeURIComponent(value);
		};
	
		api.encodeURIComponent = function(value) {
			return encodeURIComponent(value);
		};
	
		// Events
		require.on(window, "online", function(evt) {
			if (!_online) {
				_online = true;
				api.fireEvent("change", {
					networkType		: api.networkType,
					networkTypeName	: api.networkTypeName,
					online			: true,
					source			: evt.target,
					type			: evt.type
				});
			}
		});
		
		require.on(window, "offline", function(evt) {
			if (_online) {
				_online = false;
				api.fireEvent("change", {
					networkType		: api.networkType,
					networkTypeName	: api.networkTypeName,
					online			: false,
					source			: evt.target,
					type			: evt.type
				});
			}
		});
	})(Ti._5.createClass("Ti.Network"));


});;
define("Ti/Network/HTTPClient", ["Ti/_/Evented"], function(Evented) {

	Ti._5.createClass("Ti.Network.HTTPClient", function(args){
	
		var undef,
			obj = this,
			enc = encodeURIComponent,
			is = require.is,
			on = require.on,
			xhr = new XMLHttpRequest,
			UNSENT = 0,
			OPENED = 1,
			HEADERS_RECEIVED = 2,
			LOADING = 3,
			DONE = 4,
			_readyState = UNSENT, // unsent
			_completed, // This completed stuff is a hack to get around a non-obvious bug.
			timeoutTimer;
		
		Ti._5.EventDriven(obj);
		
		function fireStateChange() {
			is(obj.onreadystatechange, "Function") && obj.onreadystatechange.call(obj);
		}

		function serialize(obj) {
			var pairs = [],
				prop,
				value;

			for (prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					is(value = obj[prop], "Array") || (value = [value]);
					prop = enc(prop) + "=";
					require.each(value, function(v) {
						pairs.push(prop + enc(v));
					});
				}
			}

			return pairs.join("&");
		}

		xhr.onreadystatechange = function() {
			switch (xhr.readyState) {
				case 0: _readyState = UNSENT; break;
				case 1: _readyState = OPENED; break;
				case 2: _readyState = LOADING; break;
				case 3: _readyState = HEADERS_RECEIVED; break;
				case 4:
					clearTimeout(timeoutTimer);
					_completed = true;
					_readyState = DONE;
					if (xhr.status == 200) {
						obj.responseText = xhr.responseText;
						obj.responseXML = xhr.responseXML;
						obj.responseData = xhr.responseHeader;
						is(obj.onload, "Function") && obj.onload.call(obj);
					} else {
						xhr.status / 100 | 0 > 3 && onerror();
					}
			}
			fireStateChange();
		};
	
		function onerror(error) {
			obj.abort();
			is(error, "Object") || (error = { message: error });
			error.error || (error.error = error.message || xhr.status);
			parseInt(error.error) || (error.error = "Can't reach host");
			is(obj.onerror, "Function") && obj.onerror.call(obj, error);
		}
	
		on(xhr, "error", onerror);
		on(xhr.upload, "error", onerror);
	
		function onprogress(evt) {
			evt.progress = evt.lengthComputable ? evt.loaded / evt.total : false;
			is(obj.onsendstream, "Function") && obj.onsendstream.call(obj, evt);
		}
	
		on(xhr, "progress", onprogress);
		on(xhr.upload, "progress", onprogress);
	
		// Properties
		Ti._5.propReadOnly(obj, {
			UNSENT: UNSENT,
			OPENED: OPENED,
			HEADERS_RECEIVED: HEADERS_RECEIVED,
			LOADING: LOADING,
			DONE: DONE,
			connected: function() { return _readyState >= OPENED; },
			readyState: function() { return _readyState; },
			status: function() { return xhr.status; }
		});
	
		Ti._5.prop(obj, {
			connectionType: undef,
			file: undef,
			location: undef,
			ondatastream: undef,
			onerror: undef,
			onload: undef,
			onreadystatechange: undef,
			onsendstream: undef,
			responseData: "",
			responseText: "",
			responseXML: "",
			timeout: undef,
			validatesSecureCertificate: false
		});
	
		require.mix(obj, args);
	
		// Methods
		obj.abort = function() {
			obj.responseText = obj.responseXML = obj.responseData = "";
			_completed = true;
			clearTimeout(timeoutTimer);
			obj.connected && xhr.abort();
			_readyState = UNSENT;
			fireStateChange();
		};
	
		obj.getResponseHeader = function(name) {
			return xhr.readyState === 2 ? xhr.getResponseHeader(name) : null;
		};
	
		obj.open = function(method, url, async) {
			var httpURLFormatter = Ti.Network.httpURLFormatter;
			obj.abort();
			xhr.open(
				obj.connectionType = method,
				obj.location = require("Ti/_").getAbsolutePath(httpURLFormatter ? httpURLFormatter(url) : url),
				!!async
			);
			xhr.setRequestHeader("UserAgent", Ti.userAgent);
		};
	
		obj.send = function(args){
			_completed = false;
			try {
				args = is(args, "Object") ? serialize(args) : args;
				args && xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.send(args);
				clearTimeout(timeoutTimer);
				obj.timeout && (timeoutTimer = setTimeout(function() {
					if (obj.connected) {
						obj.abort();
						!_completed && onerror("Request timed out");
					}
				}, obj.timeout));
			} catch (error) {
				onerror(error);
			}
		};
	
		obj.setRequestHeader = function(label,value) {
			xhr.setRequestHeader(label,value);
		};
	});


});;
define("Ti/Platform", ["Ti/_", "Ti/_/browser", "Ti/_/Evented", "Ti/_/lang"], function(_, browser, Evented, lang) {

	var id = localStorage && localStorage.getItem("ti:titaniumPlatformId") ?
			localStorage.getItem("ti:titaniumPlatformId") : _.uuid();

	localStorage.setItem("ti:titaniumPlatformId", id);

	return lang.setObject("Ti.Platform", Evented, {

		createUUID: _.uuid,

		canOpenURL: function() {
			return true;
		},

		openURL: function(url){
			var m = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?/.exec(url);
			if ( (/^([tel|sms|mailto])/.test(url) || /^([\/?#]|[\w\d-]+^:[\w\d]+^@)/.test(m[1])) && !/^(localhost)/.test(url) ) {
				setTimeout(function () {
					window.location.href = url;
				}, 1);
			} else {
				window.open(url);
			}
		},

		constants: {
			BATTERY_STATE_CHARGING: 1,
			BATTERY_STATE_FULL: 2,
			BATTERY_STATE_UNKNOWN: -1,
			BATTERY_STATE_UNPLUGGED: 0,
			address: null,
			architecture: null,
			availableMemory: null,
			batteryLevel: null,
			batteryMonitoring: null,
			batteryState: this.BATTERY_STATE_UNKNOWN,
			id: id,
			isBrowser: true,
			locale: navigator.language,
			macaddress: null,
			model: null,
			name: navigator.userAgent,
			netmask: null,
			osname: "mobileweb",
			ostype: navigator.platform,
			runtime: browser.runtime,
			processorCount: null,
			username: null,
			version: require.config.ti.version
		}

	});

});
;
define("Ti/Platform/DisplayCaps", ["Ti/_/Evented", "Ti/_/lang"], function(Evented, lang) {
	
	// Pre-calculate the screen DPI
	var body = document.body,
		measureDiv = document.createElement('div');
	measureDiv.style.width = "1in";
	measureDiv.style.visibility = "hidden";
	body.appendChild(measureDiv);
	var dpi = parseInt(measureDiv.clientWidth);
	body.removeChild(measureDiv);
	
	var ua = navigator.userAgent.toLowerCase(),
		api = lang.setObject("Ti.Platform.DisplayCaps", Evented, {

			constants: {
				density: function(){
					switch (ua) {
						case "iphone":
							return "medium";
						case "ipad":
							return "medium";
						default:
							return "";
					}
				},

				dpi: dpi,

				platformHeight: window.innerHeight,

				platformWidth: window.innerWidth
			}
	
		});

	return Ti.Platform.displayCaps = api;

});;
define("Ti/UI", ["Ti/_/dom", "Ti/_/Evented", "Ti/_/lang", "Ti/_/ready", "Ti/_/style"], function(dom, Evented, lang, ready, style) {
	
	var body = document.body,
		isDef = require.isDef,
		isIOS = /(iPhone|iPad)/.test(navigator.userAgent);

	body.addEventListener('touchmove', function(e) {
		e.preventDefault();
	}, false);

	function hideAddressBar() {
		var x = 0;
		if (isIOS && !window.location.hash) {
			if (document.height <= window.outerHeight + 10) {
				body.style.height = (window.outerHeight + 60) + "px";
				x = 50;
			}
			setTimeout(function() {
				window.scrollTo(0, 1);
				window.scrollTo(0, 0);
				Ti.UI._doFullLayout();
			}, x);
		}
	}

	if (isIOS) {
		ready(hideAddressBar);
		window.addEventListener("orientationchange", hideAddressBar);
	}

	return lang.setObject("Ti.UI", Evented, {

		_addWindow: function(win) {
			this._validateContainer();
			this._container.add(win);
		},

		_removeWindow: function(win) {
			this._validateContainer();
			this._container.remove(win);
		},

		_doFullLayout: function() {
			if (!this._layoutInProgress) {
				this._layoutInProgress = true;
				setTimeout(lang.hitch(this, function(){
					this._validateContainer();
					this._container.doLayout(0, 0, body.clientWidth, body.clientHeight, true, true);
					this._layoutInProgress = false;
				}), 25);
			}
		},

		_doForcedFullLayout: function() {
			this._validateContainer();
			this._container.doLayout(0, 0, body.clientWidth, body.clientHeight, true, true);
			this._layoutInProgress = false;
			
		},

		_validateContainer: function() {
			if (!isDef(this._container)) {
				this._layoutInProgress = false;
				this._container = Ti.UI.createView({
					left: 0,
					top: 0
				});
				body.appendChild(this._container.domNode);
			}
		},

		properties: {
			backgroundColor: {
				set: function(value) {
					return style.set(body, "backgroundColor", value);
				}
			},
			backgroundImage: {
				set: function(value) {
					return style.set(body, "backgroundImage", value ? style.url(value) : "");
				}
			}
		},

		constants: {
			UNKNOWN: 0,
			FACE_DOWN: 1,
			FACE_UP: 2,
			PORTRAIT: 3,
			UPSIDE_PORTRAIT: 4,
			LANDSCAPE_LEFT: 5,
			LANDSCAPE_RIGHT: 6,
			INPUT_BORDERSTYLE_NONE: 0,
			INPUT_BORDERSTYLE_LINE: 1,
			INPUT_BORDERSTYLE_BEZEL: 2,
			INPUT_BORDERSTYLE_ROUNDED: 3,
			INPUT_BUTTONMODE_ALWAYS: 1,
			INPUT_BUTTONMODE_NEVER: 0,
			INPUT_BUTTONMODE_ONBLUR: 0,
			INPUT_BUTTONMODE_ONFOCUS: 1,
			KEYBOARD_APPEARANCE_ALERT: 1,
			KEYBOARD_APPEARANCE_DEFAULT: 0,
			KEYBOARD_ASCII: 1,
			KEYBOARD_DEFAULT: 2,
			KEYBOARD_EMAIL: 3,
			KEYBOARD_NAMEPHONE_PAD: 4,
			KEYBOARD_NUMBERS_PUNCTUATION: 5,
			KEYBOARD_NUMBER_PAD: 6,
			KEYBOARD_PHONE_PAD: 7,
			KEYBOARD_URL: 8,
			NOTIFICATION_DURATION_LONG: 1,
			NOTIFICATION_DURATION_SHORT: 2,
			PICKER_TYPE_COUNT_DOWN_TIMER: 1,
			PICKER_TYPE_DATE: 2,
			PICKER_TYPE_DATE_AND_TIME: 3,
			PICKER_TYPE_PLAIN: 4,
			PICKER_TYPE_TIME: 5,
			RETURNKEY_DEFAULT: 0, // return
			RETURNKEY_DONE: 1, // Done
			RETURNKEY_EMERGENCY_CALL: 2, // Emergency Call
			RETURNKEY_GO: 3, // Go
			RETURNKEY_GOOGLE: 4, // Search
			RETURNKEY_JOIN: 5, // Join
			RETURNKEY_NEXT: 6, // Next
			RETURNKEY_ROUTE: 7, // Route
			RETURNKEY_SEARCH: 8, // Search
			RETURNKEY_SEND: 9, // Send
			RETURNKEY_YAHOO: 10, // Search
			TEXT_ALIGNMENT_CENTER: 1,
			TEXT_ALIGNMENT_RIGHT: 2,
			TEXT_ALIGNMENT_LEFT: 3,
			TEXT_AUTOCAPITALIZATION_ALL: 3,
			TEXT_AUTOCAPITALIZATION_NONE: 0,
			TEXT_AUTOCAPITALIZATION_SENTENCES: 2,
			TEXT_AUTOCAPITALIZATION_WORDS: 1,
			TEXT_VERTICAL_ALIGNMENT_BOTTOM: 2,
			TEXT_VERTICAL_ALIGNMENT_CENTER: 1,
			TEXT_VERTICAL_ALIGNMENT_TOP: 3,
			ANIMATION_CURVE_EASE_IN: 1,
			ANIMATION_CURVE_EASE_IN_OUT: 2,
			ANIMATION_CURVE_EASE_OUT: 3,
			ANIMATION_CURVE_LINEAR: 4
		},

		create2DMatrix: function(args) {
			return new Ti.UI["2DMatrix"](args);
		},

		createActivityIndicator: function(args) {
			return new Ti.UI.ActivityIndicator(args);
		},

		createAlertDialog: function(args) {
			return new Ti.UI.AlertDialog(args);
		},

		createAnimation: function(args) {
			return new Ti.UI.Animation(args);
		},

		createButton: function(args) {
			return new Ti.UI.Button(args);
		},

		createButtonBar: function() {
			console.debug('Method "Titanium.UI.createButtonBar" is not implemented yet.');
		},

		createDashboardItem: function() {
			console.debug('Method "Titanium.UI.createDashboardItem" is not implemented yet.');
		},

		createDashboardView: function() {
			console.debug('Method "Titanium.UI.createDashboardView" is not implemented yet.');
		},

		createEmailDialog: function() {
			console.debug('Method "Titanium.UI.createEmailDialog" is not implemented yet.');
		},

		createImageView: function(args) {
			return new Ti.UI.ImageView(args);
		},

		createLabel: function(args) {
			return new Ti.UI.Label(args);
		},

		createOptionDialog: function() {
			console.debug('Method "Titanium.UI.createOptionDialog" is not implemented yet.');
		},

		createPicker: function(args) {
			return new Ti.UI.Picker(args);
		},

		createPickerColumn: function() {
			console.debug('Method "Titanium.UI.createPickerColumn" is not implemented yet.');
		},

		createPickerRow: function(args) {
			return new Ti.UI.PickerRow(args);
		},

		createProgressBar: function() {
			console.debug('Method "Titanium.UI.createProgressBar" is not implemented yet.');
		},

		createScrollView: function(args) {
			return new Ti.UI.ScrollView(args);
		},

		createScrollableView: function(args) {
			return new Ti.UI.ScrollableView(args);
		},

		createSearchBar: function(args) {
			return new Ti.UI.SearchBar(args);
		},

		createSlider: function(args) {
			return new Ti.UI.Slider(args);
		},

		createSwitch: function(args) {
			return new Ti.UI.Switch(args);
		},

		createTab: function(args) {
			return new Ti.UI.Tab(args);
		},

		createTabGroup: function(args) {
			return new Ti.UI.TabGroup(args);
		},

		createTableView: function(args) {
			return new Ti.UI.TableView(args);
		},

		createTableViewRow: function(args) {
			return new Ti.UI.TableViewRow(args);
		},

		createTableViewSection: function(args) {
			return new Ti.UI.TableViewSection(args);
		},

		createTextArea: function(args) {
			return new Ti.UI.TextArea(args);
		},

		createTextField: function(args) {
			return new Ti.UI.TextField(args);
		},

		createView: function(args) {
			return new Ti.UI.View(args);
		},

		createWebView: function(args) {
			return new Ti.UI.WebView(args);
		},

		createWindow: function(args) {
			return new Ti.UI.Window(args);
		}

	});

});;
define("Ti/Gesture", ["Ti/_/Evented", "Ti/_/lang", "Ti/UI"], function(Evented, lang, UI) {

	var undef,
		win = window,
		on = require.on,
		lastOrient = null,
		lastShake = (new Date()).getTime(),
		lastAccel = {},
		api = lang.setObject("Ti.Gesture", Evented, {
			properties: {
				orientation: UI.UNKNOWN
			}
		});

	function getWindowOrientation() {
		api.orientation = UI.PORTRAIT;
		switch (win.orientation) {
			case 90:
				api.orientation = UI.LANDSCAPE_LEFT;
				break;
			case -90:
				api.orientation = UI.LANDSCAPE_RIGHT;
				break;
			case 180:
				api.orientation = UI.UPSIDE_PORTRAIT;
				break;
		}
		return api.orientation;
	}
	getWindowOrientation();

	on(win, "orientationchange", function(evt) {
		getWindowOrientation();
		lastOrient !== api.orientation && api.fireEvent('orientationchange', {
			orientation: lastOrient = api.orientation,
			source: evt.source
		});
	});

	function deviceOrientation(evt) {
		var orient = null,
			beta = Math.abs(evt.beta || evt.y|0 * 90),
			gamma = Math.abs(evt.gamma || evt.x|0 * 90);

		beta < 5 && gamma > 170 && (orient = UI.FACE_DOWN);
		beta < 5 && gamma < 5 && (orient = UI.FACE_UP);
		beta > 50 && 0 > beta && lastOrient != orient && (orient = UI.UPSIDE_PORTRAIT);

		if (orient !== null && lastOrient !== orient) {
			api.fireEvent('orientationchange', {
				orientation: lastOrient = orient,
				source: evt.source
			});
		}
	}

	on(win, "MozOrientation", deviceOrientation);
	on(win, "deviceorientation", deviceOrientation);

	on(win, "devicemotion", function(evt) {
		var e = evt.acceleration || evt.accelerationIncludingGravity,
			x, y, z,
			currentTime,
			accel = e && {
				x: e.x,
				y: e.y,
				z: e.z,
				source: evt.source
			};

		if (accel) {
			if (lastAccel.x !== undef) {
				x = Math.abs(lastAccel.x - accel.x) > 10;
				y = Math.abs(lastAccel.y - accel.y) > 10;
				z = Math.abs(lastAccel.z - accel.z) > 10;
				if ((x && (y || z)) || (y && z)) {
					currentTime = (new Date()).getTime();
					if ((accel.timestamp = currentTime - lastShake) > 300) {
						lastShake = currentTime;
						api.fireEvent('shake', accel);
					}
				}
			}
			lastAccel = accel;
		}
	});

	return api;

});
;
define("Ti/Utils", ["Ti/_/Evented"], function(Evented) {

	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
		
		function _clone(oSource) {
			if(!oSource || 'object' !== typeof oSource)  {
				return oSource;
			}
			var oClone = 'function' === typeof oSource.pop ? [] : {};
			var sIndex = null;
			for(sIndex in oSource) {
				if(oSource.hasOwnProperty(sIndex)) {
					var oProp = oSource[sIndex];
					if(oProp && 'object' === typeof oProp) {
						oClone[sIndex] = _clone(oProp);
					} else {
						oClone[sIndex] = oProp;
					}
				}
			}
			return oClone;
		}
	
		var _DOMParser = new DOMParser();
		api.DOMDocument = null;
		
		function _NodeList() {
			var _nodes = [];
	
			Ti._5.prop(this, 'length', {
				get: function() {return _nodes.length}
			});
		
			this.item = function (iIndex) {
				return _nodes[iIndex]; 
			}
			this.add = function (oNode) {
				_nodes.push(oNode);
			}
			this.remove = function (oNode) {
				for (var iCounter=_nodes.length; iCounter--;) {
					if (oNode == _nodes[iCounter]) {
						_nodes.splice(iCounter,1);
					}
				}
			}
		}
		
		function _addEvaluate(oNode) {
			oNode.evaluate = function (xml) {
				tempXPathResult = _DOMParser.parseFromString(_serialize1Node(oNode),"text/xml");
				var oNodes = tempXPathResult.evaluate(xml, tempXPathResult, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
				var oResult = new _NodeList();
				var oTemp = null;
				if (oNodes) {
					while (oTemp = oNodes.iterateNext()) {
						oResult.add(_nodeWrapper(oTemp));
					}
				}
				return oResult;
			};
			return oNode;
		}
		
		function _nodeWrapper(oNode) {
			if (!oNode.nodeValue) {
				oNode.nodeValue = oNode;
			}
			if (!oNode.text) {
				oNode.text = oNode.nodeValue;
			}
			
			return _addEvaluate(oNode);
		}
		
		// Methods
		api.parseString = function(xml) {
			domDocument = _DOMParser.parseFromString(xml.replace(/>\s*</gi, "><"),"text/xml");
			var oResult = domDocument.firstChild || domDocument;
	
			// Add some functionality for compatibility with Mobile SDK
			oResult = _addEvaluate(oResult);
			oResult.documentElement = _addEvaluate(domDocument.documentElement);
			oResult.getElementsByTagName = function (sName) {
				return oResult.parentNode ? oResult.parentNode.getElementsByTagName(sName) : oResult.getElementsByTagName(sName);
			}
			
			return api.DOMDocument = oResult;
		};
		
		function _serialize1Node (node) {
			if ('undefined' != typeof node.outerHTML) {
				return node.outerHTML;
			}
			
			if ('undefined' != typeof XMLSerializer) {
				var serializer = new XMLSerializer();
				return serializer.serializeToString(node);
			} else if (node.xml) {
				return node.xml;
			} else {
				var oNode = document.createElement("div");
				oNode.appendChild(node);
				return oNode.innerHTML;
			}
		};
		
		api.serializeToString = function (nodeList) {
			if ('array' != typeof nodeList && '[object NodeList]' !== nodeList.toString()) {
				return _serialize1Node(nodeList);
			}
			var sResult = "";
			for (var iCounter=0; iCounter < nodeList.length; iCounter++) {
				sResult += _serialize1Node(nodeList[iCounter]);
			}
			return sResult;
		}
		
	})(Ti._5.createClass('Ti.XML'));

});;
define("Ti/UI/View",
	["Ti/_/declare", "Ti/_/dom", "Ti/_/UI/Element", "Ti/_/lang", "Ti/_/string", "Ti/_/Layouts"],
	function(declare, dom, Element, lang, string, Layouts) {

	return declare("Ti.UI.View", Element, {

		_parent: null,

		constructor: function() {
			this.children = [];
			this.layout = "absolute";
			this.containerNode = this.domNode;
		},

		add: function(view) {
			view._parent = this;
			this.children.push(view);
			this.containerNode.appendChild(view.domNode);
			Ti.UI._doFullLayout();
		},

		remove: function(view) {
			var i = 0,
				l = this.children.length;
			for (; i < l; i++) {
				if (this.children[i] === view) {
					this.children.splice(i, 1);
					break;
				}
			}
			dom.detach(view.domNode);
			Ti.UI._doFullLayout();
		},
		
		destroy: function() {
			var i = 0,
				l = this.children.length;
			for (; i < l; i++) {
				this.children[i].destroy();
			}
			Element.prototype.destroy.apply(this, arguments);
		},
	
		_defaultWidth: "100%",
		_defaultHeight: "100%",

		properties: {
			layout: {
				set: function(value) {
					var match = value.toLowerCase().match(/^(horizontal|vertical)$/),
						value = match ? match[0] : "absolute";

					if (this._layout) {
						this._layout.destroy();
						this._layout = null;
					}

					this._layout = new Layouts[string.capitalize(value)](this);

					return value;
				}
			}
		}

	});

});;
define("Ti/Media/VideoPlayer", ["Ti/_/declare", "Ti/Media", "Ti/UI/View"], function(declare, Media, View) {

	var on = require.on,
		STOPPED = 0,
		STOPPING = 1,
		PAUSED = 2,
		PLAYING = 3,
		nativeFullscreen,
		fakeFullscreen = true,
		mimeTypes = {
			"m4v": "video/mp4",
			"mov": "video/quicktime",
			"mp4": "video/mp4",
			"ogg": "video/ogg",
			"ogv": "video/ogg",
			"webm": "video/webm"
		};

	return declare("Ti.Media.VideoPlayer", View, {

		_currentState: STOPPED,

		constructor: function() {
			this._handles = [];
		},

		properties: {
			autoplay: false,
			currentPlaybackTime: {
				get: function() {
					return this._video ? this._video.currentTime * 1000 : 0;
				},
				set: function(value) {
					this._video && (this._video.currentTime = (value / 1000) | 0);
					return value;
				}
			},
			fullscreen: {
				// TODO: Add check for Firefox <http://www.thecssninja.com/javascript/fullscreen>
				value: (function(s) {
					return s && s();
				}(document.createElement("video").webkitDisplayingFullscreen)),

				set: function(value) {
					var h,
						v = this._video;

					value = !!value;
					if (nativeFullscreen) {
						try {
							if (value) {
								v.webkitEnterFullscreen();
							} else {
								v.webkitExitFullscreen();
							}
						} catch(ex) {}
					} else if (fakeFullscreen) {
						v.className = value ? "fullscreen" : "";
						value && (h = on(window, "keydown", function(e) {
							if (e.keyCode === 27) {
								this.fullscreen = 0;
								h();
							}
						}));
					}

					this.fireEvent("fullscreen", {
						entering: value
					});

					return value;
				}
			},
			mediaControlStyle: {
				value: Media.VIDEO_CONTROL_DEFAULT,
				set: function(value) {
					this._video && (this._video.controls = value === Media.VIDEO_CONTROL_DEFAULT);
					return value;
				}
			},
			repeatMode: Media.VIDEO_REPEAT_MODE_NONE,
			scalingMode: {
				set: function(value) {
					var n = this.domNode,
						fit = Media.VIDEO_SCALING_ASPECT_FIT,
						m = {};

					m[Media.VIDEO_SCALING_NONE] = "TiScalingNone";
					m[fit] = "TiScalingAspectFit";
					n.className = n.className.replace(/(scaling\-[\w\-]+)/, "") + ' ' + (m[value] || m[value = fit]);
					return value;
				}
			},
			url: {
				set: function(value) {
					this.constants.playing = false;
					this._currentState = STOPPED;
					this.properties.__values__.url = value;
					this._createVideo();
					return value;
				}
			}
		},

		constants: {
			playbackState: Media.VIDEO_PLAYBACK_STATE_STOPPED,
			playing: false,
			initialPlaybackTime: 0,
			endPlaybackTime: 0,
			playableDuration: 0,
			loadState: Media.VIDEO_LOAD_STATE_UNKNOWN,
			duration: 0
		},

		_set: function(type, state) {
			var evt = {};
			evt[type] = this.constants[type] = state;
			this.fireEvent(type === "loadState" ? type.toLowerCase() : type, evt);
		},

		_complete: function(evt) {
			var ended = evt.type === "ended";
			this.constants.playing = false;
			this._currentState = STOPPED;
			this.fireEvent("complete", {
				reason: ended ? Media.VIDEO_FINISH_REASON_PLAYBACK_ENDED : Media.VIDEO_FINISH_REASON_USER_EXITED
			});
			ended && this.repeatMode === Media.VIDEO_REPEAT_MODE_ONE && setTimeout(function() { this._video.play(); }, 1);
		},

		_stalled: function() {
			this._set("loadState", Media.VIDEO_LOAD_STATE_STALLED);
		},

		_fullscreenChange: function(e) {
			this.fullscreen && (this.fullscreen = !_fullscreen);
		},

		_metaDataLoaded: function() {
			// TODO: Add check for Firefox <http://www.thecssninja.com/javascript/fullscreen>
			nativeFullscreen = this._video.webkitSupportsFullscreen;
			this._durationChange();
		},

		_durationChange: function() {
			var d = this._video.duration * 1000,
				c = this.constants;
			if (d !== Infinity) {
				this.duration || this.fireEvent("durationAvailable", {
					duration: d
				});
				c.duration = c.playableDuration = c.endPlaybackTime = d;
			}
		},

		_paused: function() {
			var pbs = Media.VIDEO_PLAYBACK_STATE_STOPPED;
			this.constants.playing = false;
			if (this._currentState === PLAYING) {
				this._currentState = PAUSED;
				pbs = Media.VIDEO_PLAYBACK_STATE_PAUSED;
			} else if (this._currentState === STOPPING) {
				this._video.currentTime = 0;
			}
			this._set("playbackState", pbs);
		},

		_createVideo: function(dontCreate) {
			var i, src, match,
				video = this._video,
				url = this.url;

			if (!url) {
				return;
			}

			if (dontCreate && video && video.parentNode) {
				return video;
			}

			this.release();

			video = this._video = document.createElement("video");
			video.tabindex = 0;

			this.mediaControlStyle === Media.VIDEO_CONTROL_DEFAULT && (video.controls = 1);
			this.scalingMode = Media.VIDEO_SCALING_ASPECT_FIT;

			this._handles = [
				on(video, "playing", this, function() {
					this._currentState = PLAYING;
					this.constants.playing = true;
					this.fireEvent("playing", {
						url: video.currentSrc
					});
					this._set("playbackState", Media.VIDEO_PLAYBACK_STATE_PLAYING);
				}),
				on(video, "pause", this, "_paused"),
				on(video, "canplay", this, function() {
					this._set("loadState", Media.VIDEO_LOAD_STATE_PLAYABLE);
					this._currentState === STOPPED && this.autoplay && video.play();
				}),
				on(video, "canplaythrough", this, function() {
					this._set("loadState", Media.VIDEO_LOAD_STATE_PLAYTHROUGH_OK);
					this.fireEvent("preload");
				}),
				on(video, "loadeddata", this, function() {
					this.fireEvent("load");
				}),
				on(video, "loadedmetadata", this, "_metaDataLoaded"),
				on(video, "durationchange", this, "_durationChange"),
				on(video, "timeupdate", this, function() {
					this.constants.currentPlaybackTime = this._video.currentTime * 1000;
					this._currentState === STOPPING && this.pause();
				}),
				on(video, "error", this, function() {
					var msg = "Unknown error";
					switch (video.error.code) {
						case 1: msg = "Aborted"; break;
						case 2: msg = "Decode error"; break;
						case 3: msg = "Network error"; break;
						case 4: msg = "Unsupported format";
					}
					this.constants.playing = false;
					this._set("loadState", Media.VIDEO_LOAD_STATE_UNKNOWN);
					this.fireEvent("error", {
						message: msg
					});
					this.fireEvent("complete", {
						reason: Media.VIDEO_FINISH_REASON_PLAYBACK_ERROR
					});
				}),
				on(video, "abort", this, "_complete"),
				on(video, "ended", this, "_complete"),
				on(video, "stalled", this, "_stalled"),
				on(video, "waiting", this, "_stalled"),
				on(video, "mozfullscreenchange", this, "_fullscreenChange"),
				on(video, "webkitfullscreenchange", this, "_fullscreenChange")
			];

			this.domNode.appendChild(video);

			require.is(url, "Array") || (url = [url]);

			for (i = 0; i < url.length; i++) {
				src = document.createElement("source");
				src.src = url[i];
				match = url[i].match(/.+\.([^\/\.]+?)$/);
				match && mimeTypes[match[1]] && (src.type = mimeTypes[match[1]]);
				video.appendChild(src);
			}

			return video;
		},

		play: function() {
			this._currentState !== PLAYING && this._createVideo(1).play();
		},

		pause: function() {
			this._currentState === PLAYING && this._createVideo(1).pause();
		},

		release: function() {
			var i,
				video = this._video,
				parent = video && video.parentNode;
			if (parent) {
				require.each(this._handles, function(h) { h(); });
				this._handles = [];
				parent.removeChild(video);
			}
			this._video = null;
		},

		stop: function() {
			this._currentState = STOPPING;
			this._video.pause();
			this._video.currentTime = 0;
		}

	});

});
;
define("Ti/UI/TableViewRow", ["Ti/_/declare", "Ti/UI/View", "Ti/_/dom", "Ti/_/css", "Ti/_/style"], function(declare, View, dom, css, style) {

	var set = style.set,
		undef;

	return declare("Ti.UI.TableViewRow", View, {
		
		constructor: function(args) {
			
			this.leftView = Ti.UI.createView({
				left: 0,
				top: 0,
				width: "auto",
				layout: "horizontal"
			}),
			set(this.leftView.domNode,"boxAlign","center");
			this.add(this.leftView);
			
			this.leftImageView = Ti.UI.createImageView();
			this.leftView.add(this.leftImageView); 
			
			this.titleLabel = Ti.UI.createLabel({width: "auto"});
			this.leftView.add(this.titleLabel);
			
			this.rightView = Ti.UI.createView({
				right: 0,
				top: 0,
				width: "auto",
				layout: "horizontal"
			}),
			set(this.rightView.domNode,"boxAlign","center");
			this.add(this.rightView);
			
			this.rightImageView = Ti.UI.createImageView();
			this.rightView.add(this.rightImageView);
			
			// Holds detail, child, or check
			this.extraView = Ti.UI.createView({width: "auto"});
			this.rightView.add(this.extraView);
		},
		
		_defaultHeight: "auto",
		_defaultWidth: "100%",
		_tableRowHeight: undef,
		_handleTouchEvent: function(type, e) {
			if (type === "click" || type === "singletap") {
				this._parent && this._parent._parent && (this._parent._parent._tableViewRowClicked = this);
			}
			View.prototype._handleTouchEvent.apply(this,arguments);
		},

		properties: {
			hasCheck: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.TableViewRow#.hasCheck" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.TableViewRow#.hasCheck" is not implemented yet.');
					return value;
				}
			},
			hasChild: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.TableViewRow#.hasChild" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.TableViewRow#.hasChild" is not implemented yet.');
					return value;
				}
			},
			hasDetail: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.TableViewRow#.hasDetail" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.TableViewRow#.hasDetail" is not implemented yet.');
					return value;
				}
			},
			leftImage: {
				set: function(value) {
					this.leftImageView.image = value;
					return value;
				}
			},
			rightImage: {
				set: function(value) {
					this.rightImageView.image = value;
					return value;
				}
			},
			selectedBackgroundColor: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.TableViewRow#.selectedBackgroundColor" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.TableViewRow#.selectedBackgroundColor" is not implemented yet.');
					return value;
				}
			},
			selectedBackgroundImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.TableViewRow#.selectedBackgroundImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.TableViewRow#.selectedBackgroundImage" is not implemented yet.');
					return value;
				}
			},
			selectedColor: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.TableViewRow#.selectedColor" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.TableViewRow#.selectedColor" is not implemented yet.');
					return value;
				}
			},
			title: {
				set: function(value) {
					this.titleLabel.text = value;
					return value;
				}
			}
		}

	});

});;
define("Ti/_/UI/SuperView", ["Ti/_/declare", "Ti/_/dom", "Ti/UI/View"], function(declare, dom, View) {
	
	var windows = [],
		stack = [],
		stackIdx = -1,
		activeWindow,
		history = window.history || {},
		ps = history.pushState;

	ps && require.on(window, "popstate", function(evt) {
		var i,
			n = stackIdx + 1,
			win;
		if (evt && evt.state && (i = evt.state.windowIdx) !== null) {
			win = windows[i];
			if (n < stack.length && stack[n]._windowIdx === i) {
				// forward
				history.pushState({ windowIdx:i }, "", "");
			} else {
				// back
				activeWindow.close();
				win.fireEvent("focus");
			}
		}
	});

	require.on(window, "resize", function() {
		Ti.UI._doFullLayout();
	});

	return declare("Ti._.UI.SuperView", View, {

		_windowIdx: null,
		_opened: 0,

		constructor: function() {
			this._windowIdx = windows.length;
			windows.push(this);
		},

		destroy: function() {
			this.close();
			windows[this._windowIdx] = null;
			View.prototype.destroy.apply(this, arguments);
		},

		open: function(args) {
			var i,
				n = stackIdx + 1,
				len = stack.length - n;

			if (!this._opened) {
				// TODO: if args, then do animation on open
				this._opened = 1;
				this.show();
				Ti.UI._addWindow(this);

				activeWindow && activeWindow.fireEvent("blur");
				ps && history[activeWindow ? "pushState" : "replaceState"]({ windowIdx: this._windowIdx }, "", "");
				if (len > 0) {
					for (i = len - 1; i >= n; i--) {
						stack[i].close({ skipHistory:true });
					}
					stack.splice(n, len);
				}
				stackIdx++;
				stack.push(activeWindow = this);

				this.fireEvent("open");
				this.fireEvent("focus");
			}
		},

		close: function(args) {
			if (this._opened) {
				// TODO: if args, then do animation on close
				this._opened = 0;
				Ti.UI._removeWindow(this);
				(!args || !args.skipHistory) && window.history.go(-1);
				stackIdx--;
				Ti.UI._doFullLayout();
				this.fireEvent("blur");
				this.fireEvent("close");
			}
		},

		setWindowTitle: function(title) {
			activeWindow === this && (document.title = title || require.config.project.name);
			return title;
		}

	});

});;
define("Ti/UI/Tab", ["Ti/_/declare", "Ti/_/lang", "Ti/UI/View", "Ti/_/dom", "Ti/_/css", "Ti/_/style"], function(declare, lang, View, dom, css, style) {

	var set = style.set,
		undef;

	return declare("Ti.UI.Tab", View, {

		constructor: function(args) {
			this._windows = [];

			this._contentContainer = dom.create("div", {
				className: "TiUIButtonContentContainer",
				style: {
					width: "100%",
					height: "100%",
					display: ["-webkit-box", "-moz-box"],
					boxOrient: "horizontal",
					boxPack: "center",
					boxAlign: "center"
				}
			}, this.domNode);

			this._tabIcon = dom.create("img", {
				className: "TiUIButtonImage"
			}, this._contentContainer);

			this._tabTitle = dom.create("div", {
				className: "TiUIButtonTitle",
				style: {
					whiteSpace: "nowrap"
				}
			}, this._contentContainer);

			require.on(this.domNode, "click", this, function(e) {
				this._tabGroup && this._tabGroup.setActiveTab(this);
			});
		},

		open: function(win, args) {
			win = win || this.window;
			this._windows.push(win);
			win.open(args);
		},

		close: function(args) {
			var win = this._windows.pop();
			win && win.close(args);
		},

		_defaultWidth: "auto",
		_defaultHeight: "auto",
		_tabGroup: null,
		_tabWidth: "100%",

		properties: {
			active: {
				get: function(value) {
					return this._tabGroup && this._tabGroup.activeTab === this;
				}
			},

			icon: {
				set: function(value) {
					return this._tabIcon.src = value;
				}
			},

			title: {
				set: function(value) {
					return this._tabTitle.innerHTML = value;
				}
			},

			titleid: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Tab#.titleid" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Tab#.titleid" is not implemented yet.');
					return value;
				}
			},

			// Override width and height
			width: function(value) {
				return this._tabWidth;
			},

			// Override width and height
			height: function(value) {
				return "100%";
			},

			window: {
				get: function(value) {
					var w = this._windows;
					return value ? value : w.length ? w[0] : null;
				},
				set: function(value) {
					this._windows.unshift(value);
					return value;
				}
			}
		}

	});

});
;
define("Ti/UI/TabGroup", ["Ti/_/declare", "Ti/_/UI/SuperView"], function(declare, SuperView) {
		
	var undef,
		is = require.is;

	return declare("Ti.UI.TabGroup", SuperView, {
		
		constructor: function(args){
			
			// Create the tab bar
			this._tabBarContainer = Ti.UI.createView({
				width: "100%",
				height: "10%",
				layout: "horizontal",
				top: 0,
				left: 0
			});
			this.add(this._tabBarContainer);
			
			// Create the tab window container
			this._tabContentContainer = Ti.UI.createView({
				width: "100%",
				height: "90%",
				left: 0,
				top: "10%"
			});
			this.add(this._tabContentContainer);
		},

		addTab: function(tab) {
			
			// Initialize the tabs, if necessary
			if(!this.tabs) {
				this.tabs = [];
			}
			
			// Add the tab to the list and tab bar
			var tabs = this.tabs;
			tabs.push(tab);
			tab._tabGroup = this;
			this._tabBarContainer.add(tab);
			this._setTabBarWidths(tabs);
			
			// Set the active tab if there are currently no tabs
			if(tabs.length == 1) {
				this.properties.activeTab = tab;
			}
		},
		
		removeTab: function(tab) {
			
			// Remove the tab from the list
			var tabs = this.tabs,
				idx = this.tabs.indexOf(tab);
			if (idx === -1) {
				return;
			}
			tabs.splice(idx,1);
			
			// Remove the tab from the tab bar and recalculate the tab sizes
			this._tabBarContainer.remove(tab);
			this._setTabBarWidths(tabs);
			
			// Update the active tab, if necessary
			if (tab === this._activeTab) {
				this._activateTab(tabs[0]);
			}
		},
		
		_activateTab: function(tab) {
			if(this._activeTab) {
				this._activeTab.active = false;
				this._activeTab.domNode.className = this._activeTab.domNode.className.replace("TiActiveTab","");
				this._tabContentContainer.remove(this._activeTab["window"]);
			}
			if(tab) {
				this._activeTab = tab;
				tab.domNode.className += " TiActiveTab";
				tab.active = true;
				this._tabContentContainer.add(tab["window"]);
			}
		},
		
		_setTabBarWidths: function(tabs) {
			var tabWidth = (100 / tabs.length) + "%";
			for (var i in tabs) {
				tabs[i]._tabWidth = tabWidth;
			}
		},
		
		_defaultWidth: "100%",
		_defaultHeight: "100%",
		_activeTab: undef,

		properties: {
			activeTab: {
				set: function(value) {
					if (is(value,"Number")) {
						if (!value in this.tabs) {
							return;
						}
						value = this.tabs[value];
					}
					this._activateTab(value);
					return value;
				}
			},
			
			tabs: {
				set: function(value, oldValue) {
					if(!is(value,"Array")) {
						return;
					}
					var tabBarContainer = this._tabBarContainer;
					for(var i in oldValue) {
						tabBarContainer.remove(oldValue[i]);
					}
					this._setTabBarWidths(value);
					this._activateTab(value[0]);
					for(var i in value) {
						tabBarContainer.add(value[i]);
					}
					return value;
				}
			}
		}
	});

});
;
define("Ti/UI/Window", ["Ti/_/declare", "Ti/Gesture", "Ti/_/UI/SuperView", "Ti/UI"], function(declare, Gesture, SuperView, UI) {

	var undef;

	return declare("Ti.UI.Window", SuperView, {
	
		_defaultWidth: "100%",
		_defaultHeight: "100%",

		properties: {
			orientation: {
				get: function() {
					return Gesture.orientation;
				}
			},

			title: {
				set: function(value) {
					return this.setWindowTitle(value);
				}
			},

			titleid: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Window#.titleid" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Window#.titleid" is not implemented yet.');
					return value;
				}
			},

			titlePrompt: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Window#.titlePrompt" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Window#.titlePrompt" is not implemented yet.');
					return value;
				}
			},

			titlepromptid: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Window#.titlepromptid" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Window#.titlepromptid" is not implemented yet.');
					return value;
				}
			},

			url: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Window#.url" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Window#.url" is not implemented yet.');
					return value;
				}
			}
		},

		open: function() {
			SuperView.prototype.open.apply(this);
			this.setWindowTitle(this.title);
		}

	});

});;
define("Ti/_/UI/Widget", ["Ti/_/declare", "Ti/UI/View"], function(declare, View) {

	// base class for various widgets that will eventually merge with Ti._.UI.Element in 1.9
	return declare("Ti._.UI.Widget", View);

});;
define("Ti/_/UI/FontWidget", ["Ti/_/declare", "Ti/_/style", "Ti/_/dom", "Ti/_/UI/Widget"], function(declare, style, dom, Widget) {
		
	var set = style.set,
		isDef = require.isDef,
		computeSize = dom.computeSize,
		unitize = dom.unitize,
		undef;

	return declare("Ti._.UI.FontWidget", Widget, {

		constructor: function() {
			this._styleableDomNodes = [];
		},

		_setFont: function(font,domNode) {
			isDef(font.fontFamily) && set(domNode, "fontFamily", font.fontFamily);
			isDef(font.fontSize) && set(domNode, "fontSize", dom.unitize(font.fontSize));
			isDef(font.fontStyle) && set(domNode, "fontStyle", font.fontStyle);
			isDef(font.fontWeight) && set(domNode, "fontWeight", font.fontWeight);
		},

		_addStyleableDomNode: function(styleableDomNode) {
			this._styleableDomNodes.push(styleableDomNode);
		},

		_removeStyleableDomNode: function(styleableDomNode) {
			var index = this._styleableDomNodes.indexOf(styleableDomNode);
			index != -1 && this._styleableDomNodes.splice(index,1);
		},

		_measureText: function(text, domNode) {
			var textRuler = document.getElementById("textRuler");
			textRuler.innerHTML = text;

			var computedStyle = window.getComputedStyle(domNode);
			this._setFont({
				fontFamily: (this.font && this.font.fontFamily) ? this.font.fontFamily : computedStyle.fontFamily,
				fontSize: (this.font && this.font.fontSize) ? this.font.fontSize : computedStyle.fontSize,
				fontStyle: (this.font && this.font.fontStyle) ? this.font.fontStyle : computedStyle.fontStyle,
				fontWeight: (this.font && this.font.fontWeight) ? this.font.fontWeight : computedStyle.fontWeight,
			},textRuler);

			// Return the computed style
			return {width: textRuler.clientWidth, height: textRuler.clientHeight};
		},

		properties: {
			font: {
				set: function(value) {
					for (var domNode in this._styleableDomNodes) {
						this._setFont(value, this._styleableDomNodes[domNode]);
					}
					return value;
				}
			}
		}
	});
	
});;
define("Ti/_/UI/TextBox",
	["Ti/_/declare", "Ti/_/dom", "Ti/_/event", "Ti/_/style", "Ti/_/UI/FontWidget", "Ti/UI"],
	function(declare, dom, event, style, FontWidget, UI) {

	return declare("Ti._.UI.TextBox", FontWidget, {

		_field: null,

		_initTextBox: function() {
			// wire up events
			var field = this._field,
				form = this._form = dom.create("form", null, this.domNode);

			this._addStyleableDomNode(field);

			require.on(field, "keydown", this, function(e) {
				if (this.editable) {
					if (e.keyCode === 13) {
						if (this.suppressReturn) {
							event.stop(e);
							field.blur();
						}
						this.fireEvent("return");
					}
				} else {
					event.stop(e);
				}
			});
			require.on(field, "keypress", this, function() {
				this._capitalize();
			});
			require.on(field, "change", this, function() {
				this.fireEvent("change");
			});
		},

		_capitalize: function(ac, val) {
			var f = this._field,
				ac = "off";
			switch (ac || this.autocapitalization) {
				case UI.TEXT_AUTOCAPITALIZATION_ALL:
					f.value = f.value.toUpperCase();
					break;
				case UI.TEXT_AUTOCAPITALIZATION_SENTENCES:
					ac = "on";
			}
			this._field.autocapitalize = ac;
		},

		blur: function() {
			this._field.blur();
			this.fireEvent("blur");
		},

		focus: function() {
			this._field.focus();
			this.fireEvent("focus");
		},

		hasText: function() {
			return !this._field.value.length;
		},

		properties: {
			autocapitalization: {
				value: UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
				set: function(value, oldValue) {
					value !== oldValue && this._capitalize(value);
					return value;
				}
			},

			autocorrect: {
				value: false,
				set: function(value) {
					this._field.autocorrect = !!value ? "on" : "off";
					return value;
				}
			},

			editable: true,

			enabled: {
				value: true,
				set: function(value) {
					this._field.disabled = !value;
					return value;
				}
			},

			returnKeyType: {
				value: UI.RETURNKEY_DEFAULT,
				set: function(value) {
					var title = "",
						dest = this.domNode;
					if (value !== UI.RETURNKEY_DEFAULT) {
						deset = this._form;
						[4,8,10].indexOf(value) !== -1 && (title = "Search");
					}
					this._field.title = title;
					dom.place(this._field, dest);
					return value;
				}
			},

			suppressReturn: true,

			textAlign: {
				set: function(value) {
					style.set(this._field, "text-align", value === Ti.UI.TEXT_ALIGNMENT_RIGHT ? "right" : value === Ti.UI.TEXT_ALIGNMENT_CENTER ? "center" : "left");
					return value;
				}
			},

			value: {
				set: function(value) {
					return this._capitalize(this._field.value = value);
				}
			}
		}

	});

});;
define("Ti/UI/2DMatrix", ["Ti/_/declare", "Ti/_/Evented", "Ti/Platform", "Ti/UI"], function(declare, Evented, Platform, UI) {

	var isFF = Platform.runtime === "gecko",
		px = function(x) {
			return isFF ? x + "px" : x;
		};

	function detMinor(y, x, m) {
		var x1 = x == 0 ? 1 : 0,
			x2 = x == 2 ? 1 : 2,
			y1 = y == 0 ? 1 : 0,
			y2 = y == 2 ? 1 : 2;
		return (m[y1][x1] * m[y2][x2]) - (m[y1][x2] * m[y2][x1]);
	}

	function mult(obj, a, b, c, d, tx, ty, r) {
		return {
			a: obj.a * a + obj.b * c,
			b: obj.a * b + obj.b * d,
			c: obj.c * a + obj.d * c,
			d: obj.c * b + obj.d * d,
			tx: obj.a * tx + obj.b * ty + obj.tx,
			ty: obj.c * tx + obj.d * ty + obj.ty,
			rotation: obj.rotation + r
		};
	}

	return declare("Ti.UI.2DMatrix", Evented, {

		properties: {
			a: 1,
			b: 0,
			c: 0,
			d: 1,
			tx: 0,
			ty: 0,
			rotation: 0
		},

		constructor: function(matrix) {
			matrix && require.mix(this, matrix);
		},

		invert: function() {
			var x = 0,
				y = 0,
				m = [[this.a, this.b, this.tx], [this.c, this.d, this.ty], [0, 0, 1]],
				n = m,
				det = this.a * detMinor(0, 0, m) - this.b * detMinor(0, 1, m) + this.tx * detMinor(0, 2, m);

			if (Math.abs(det) > 1e-10) {
				det = 1.0 / det;
				for (; y < 3; y++) {
					for (; x < 3; x++) {
						n[y][x] = detMinor(x, y, m) * det;
						(x + y) % 2 == 1 && (n[y][x] = -n[y][x]);
					}
				}
			}

			return new UI["2DMatrix"](mult(this, n[0][0], n[0][1], n[1][0], n[1][1], n[0][2], n[1][2]));
		},

		multiply: function(other) {
			return new UI["2DMatrix"](mult(this, other.a, other.b, other.c, other.d, other.tx, other.ty, other.rotation));
		},

		rotate: function(angle) {
			return new UI["2DMatrix"]({ a: this.a, b: this.b, c: this.c, d: this.d, tx: this.tx, ty: this.ty, rotation: this.rotation + angle });
		},

		scale: function(x, y) {
			return new UI["2DMatrix"](mult(this, x, 0, 0, y, 0, 0));
		},

		translate: function(x, y) {
			return new UI["2DMatrix"](mult(this, 0, 0, 0, 0, x, y));
		},

		toCSS: function() {
			var i = 0,
				v = [this.a, this.b, this.c, this.d, this.tx, this.ty];
	
			for (; i < 6; i++) {
				v[i] = v[i].toFixed(6);
				i > 4 && (v[i] = px(v[i]));
			}

			return "matrix(" + v.join(",") + ") rotate(" + this.rotation + "deg)";
		}

	});

});
;
define("Ti/UI/ActivityIndicator", ["Ti/_/declare", "Ti/_/UI/Element"], function(declare, Element) {

	return declare("Ti.UI.ActivityIndicator", Element, {

		show: function() {
			console.debug('Method "Titanium.UI.ActivityIndicator#.show" is not implemented yet.');
		},

		hide: function() {
			console.debug('Method "Titanium.UI.ActivityIndicator#.hide" is not implemented yet.');
		},
		
		_defaultWidth: "auto",
		_defaultHeight: "auto",
		
		properties: {
			color: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ActivityIndicator#.color" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.ActivityIndicator#.color" is not implemented yet.');
					return value;
				}
			},
			
			font: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ActivityIndicator#.font" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.ActivityIndicator#.font" is not implemented yet.');
					return value;
				}
			},
			
			message: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ActivityIndicator#.message" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.ActivityIndicator#.message" is not implemented yet.');
					return value;
				}
			},
			
			messageid: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ActivityIndicator#.messageid" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.ActivityIndicator#.messageid" is not implemented yet.');
					return value;
				}
			},
			
		}

	});

});;
define("Ti/UI/AlertDialog", ["Ti/_/declare", "Ti/_/Evented"], function(declare, Evented) {

	return declare("Ti.UI.AlertDialog", Evented, {
		show: function() {
			alert(this.message);
		},

		hide: function() {
			// Do nothing since alert() is blocking.
		},
		
		properties: {
			
			buttonNames: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.AlertDialog#.buttonNames" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.AlertDialog#.buttonNames" is not implemented yet.');
					return value;
				}
			},
			
			cancel: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.AlertDialog#.cancel" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.AlertDialog#.cancel" is not implemented yet.');
					return value;
				}
			},
			
			message: "",
			
			messageid: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.AlertDialog#.messageid" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.AlertDialog#.messageid" is not implemented yet.');
					return value;
				}
			},
			
			ok: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.AlertDialog#.ok" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.AlertDialog#.ok" is not implemented yet.');
					return value;
				}
			},
			
			okid: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.AlertDialog#.okid" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.AlertDialog#.okid" is not implemented yet.');
					return value;
				}
			},
			
			title: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.AlertDialog#.title" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.AlertDialog#.title" is not implemented yet.');
					return value;
				}
			},
			
			titleid: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.AlertDialog#.titleid" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.AlertDialog#.titleid" is not implemented yet.');
					return value;
				}
			}
		}

	});

});
;
define("Ti/UI/Animation", ["Ti/_/declare", "Ti/_/Evented"], function(declare, Evented) {

	var undef;

	return declare("Ti.UI.Animation", Evented, {

		start: function() {
			this.fireEvent("start");
		},

		complete: function() {
			this.fireEvent("complete");
		},

		properties: {
			autoreverse: undef,
			backgroundColor: undef,
			bottom: undef,
			center: undef,
			color: undef,
			curve: undef,
			delay: undef,
			duration: undef,
			height: undef,
			left: undef,
			opacity: undef,
			repeat: undef,
			right: undef,
			top: undef,
			transform: undef,
			visible: undef,
			width: undef,
			zIndex: undef
		}

	});

});
;
define("Ti/UI/Button", ["Ti/_/declare", "Ti/_/UI/FontWidget", "Ti/_/dom", "Ti/_/css", "Ti/_/style"], function(declare, FontWidget, dom, css, style) {
	
	var set = style.set,
		undef;
		
	function arrayContains(array,object) {
		for (var i in array) {
			if (array[i] == object) {
				return true;
			}
		}
		return false;
	}
	
	// Measure the size of an empty button to determine the extra padding
	var buttonRuler = document.createElement("button");
	document.body.appendChild(buttonRuler);
	var buttonHorizontalPadding = buttonRuler.clientWidth,
		buttonVerticalPadding = buttonRuler.clientHeight;
	document.body.removeChild(buttonRuler);
	
	return declare("Ti.UI.Button", FontWidget, {
		
		constructor: function() {
			set(this.domNode, "backgroundSize","100% 100%");
			set(this.domNode, "backgroundRepeat","no-repeat");
			
			this.button = dom.create("button", {
				className: css.clean("TiUIButtonButton")
			});
			this.domNode.appendChild(this.button);
			set(this.button,"width","100%");
			set(this.button,"height","100%");
			
			this.contentContainer = dom.create("div", {
				className: "TiUIButtonContentContainer"
			});
			this.button.appendChild(this.contentContainer)
			set(this.contentContainer, "display", "-webkit-box");
			set(this.contentContainer, {
				display: "-moz-box",
				boxOrient: "horizontal",
				boxPack: "center",
				boxAlign: "center"
			});
			
			this.buttonImage = dom.create("img", {
				className: "TiUIButtonImage"
			});
			this.contentContainer.appendChild(this.buttonImage);
			
			this.buttonTitle = dom.create("div", {
				className: "TiUIButtonTitle"
			});
			set(this.buttonTitle,"whiteSpace","nowrap");
			this.contentContainer.appendChild(this.buttonTitle);
			this._addStyleableDomNode(this.buttonTitle);
		},

		_defaultWidth: "auto",
		_defaultHeight: "auto",
		_getContentWidth: function() {
			return this.buttonImage.width + this._measureText(this.title, this.buttonTitle).width + buttonHorizontalPadding;
		},
		_getContentHeight: function() {
			return this.buttonImage.height + this._measureText(this.title, this.buttonTitle).height + buttonVerticalPadding;
		},
		_setTouchEnabled: function(value) {
			FontWidget.prototype._setTouchEnabled.apply(this,arguments);
			var cssVal = value ? "auto" : "none";
			this.button && set(this.button,"pointerEvents", cssVal);
			this.contentContainer && set(this.contentContainer,"pointerEvents", cssVal);
			this.buttonImage && set(this.buttonImage,"pointerEvents", cssVal);
			this.buttonTitle && set(this.buttonTitle,"pointerEvents", cssVal);
		},
	
		properties: {			
			backgroundColor: {
				set: function(value) {
					set(this.button,"color",value);
					return value;
				}
			},
			backgroundImage: {
				set: function(value) {
					if (value) {
						set(this.domNode, "backgroundImage", value ? style.url(value) : "");
						if (arrayContains(this.domNode.children, this.button)) {
							this.domNode.removeChild(this.button);
							this.domNode.appendChild(this.contentContainer);
						}
					} else {
						set(this.domNode, "backgroundImage", "");
						if (arrayContains(this.domNode.children, this.contentContainer)) {
							this.domNode.removeChild(this.contentContainer);
							this.domNode.appendChild(this.button);
						}
					}
					return value;
				}
			},
			backgroundLeftCap: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Button#.backgroundLeftCap" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Button#.backgroundLeftCap" is not implemented yet.');
					return value;
				}
			},
			backgroundTopCap: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Button#.backgroundTopCap" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Button#.backgroundTopCap" is not implemented yet.');
					return value;
				}
			},
			color: {
				set: function(value) {
					set(this.buttonTitle,"color",value);
					return value;
				}
			},
			enabled: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Button#.enabled" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Button#.enabled" is not implemented yet.');
					return value;
				},
				value: true
			},
			image: {
				set: function(value) {
					this.buttonImage.src = value;
					return value;
				}
			},
			selectedColor: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Button#.selectedColor" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Button#.selectedColor" is not implemented yet.');
					return value;
				}
			},
			style: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Button#.style" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Button#.style" is not implemented yet.');
					return value;
				}
			},
			title: {
				set: function(value) {
					this.buttonTitle.innerHTML = value;
					Ti.UI._doFullLayout();
					return value;
				}
			},
			titleid: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Button#.titleid" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Button#.titleid" is not implemented yet.');
					return value;
				}
			}
		}

	});

});;
define("Ti/UI/ImageView", 
	["Ti/_/declare", "Ti/_/UI/Widget", "Ti/_/dom", "Ti/_/css", "Ti/_/style", "Ti/_/lang"], 
	function(declare, Widget, dom, css, style, lang) {
		
	var set = style.set;

	return declare("Ti.UI.ImageView", Widget, {
		
		constructor: function() {
			
			this.contentContainer = dom.create("div", {
				className: css.clean("TiUIImageViewAligner")
			});
			set(this.contentContainer, "width", "100%");
			set(this.contentContainer, "height", "100%");
			set(this.contentContainer, "display", "-webkit-box");
			set(this.contentContainer, "display", "-moz-box");
			set(this.contentContainer, "boxOrient", "horizontal");
			set(this.contentContainer, "boxPack", "center");
			set(this.contentContainer, "boxAlign", "center");
			this.domNode.appendChild(this.contentContainer);
			
			this.imageDisplay = dom.create("img", {
				className: css.clean("TiUIImageViewDisplay")
			});
			this.contentContainer.appendChild(this.imageDisplay);
			set(this.imageDisplay, "width", "100%");
			set(this.imageDisplay, "height", "100%");
		},
		
		pause: function(){
			console.debug('Method "Titanium.UI.ImageView#.pause" is not implemented yet.');
		},
		start: function(){
			console.debug('Method "Titanium.UI.ImageView#.start" is not implemented yet.');
		},
		stop: function(){
			console.debug('Method "Titanium.UI.ImageView#.stop" is not implemented yet.');
		},
		toBlob: function(){
			console.debug('Method "Titanium.UI.ImageView#.toBlob" is not implemented yet.');
		},
		
		doLayout: function() {
			Widget.prototype.doLayout.apply(this,arguments);
			if (this.canScale) {
				var controlRatio = this._measuredWidth / this._measuredHeight,
					imageRatio = this._getContentWidth() / this._getContentHeight();
				if (controlRatio > imageRatio) {
					set(this.imageDisplay,"width","auto");
					set(this.imageDisplay,"height","100%");
				} else {
					set(this.imageDisplay,"width","100%");
					set(this.imageDisplay,"height","auto");
				}
			} else {
				set(this.imageDisplay,"width","auto");
				set(this.imageDisplay,"height","auto");
			}
		},

		_defaultWidth: "auto",
		_defaultHeight: "auto",
		_getContentWidth: function() {
			return this.imageDisplay.width;
		},
		_getContentHeight: function() {
			return this.imageDisplay.height;
		},
		_setTouchEnabled: function(value) {
			Widget.prototype._setTouchEnabled.apply(this,arguments);
			var cssVal = value ? "auto" : "none";
			this.contentContainer && set(this.contentContainer,"pointerEvents", cssVal);
			this.imageDisplay && set(this.imageDisplay,"pointerEvents", cssVal);
		},
		
		properties: {
			animating: false,
			canScale: {
				set: function(value, oldValue){
					if (value !== oldValue) {
						Ti.UI._doFullLayout();
					}
					return value;
				},
				value: true
			},
			defaultImage: null,
			duration: 0,
			image: {
				set: function(value) {
					this.defaultImage && (this.imageDisplay.src = value);
					var tempImage = new Image();
					require.on(tempImage, "load", lang.hitch(this, function () {
						this.imageDisplay.src = value;
						
						// Force a layout to take the image size into account
						Ti.UI._doFullLayout();
					}));
					tempImage.src = value;
					return value;
				}
			},
			images: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ImageView#.images" is not implemented yet.');
					return value;
				},
				set: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ImageView#.images" is not implemented yet.');
					return value;
				}
			},
			paused: false,
			preventDefaultImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ImageView#.preventDefaultImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ImageView#.preventDefaultImage" is not implemented yet.');
					return value;
				}
			},
			repeatCount: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ImageView#.repeatCount" is not implemented yet.');
					return value;
				},
				set: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ImageView#.repeatCount" is not implemented yet.');
					return value;
				}
			},
			reverse: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ImageView#.reverse" is not implemented yet.');
					return value;
				},
				set: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ImageView#.reverse" is not implemented yet.');
					return value;
				}
			}
		}

	});

});;
define("Ti/UI/Label", ["Ti/_/declare", "Ti/_/UI/FontWidget", "Ti/_/dom", "Ti/_/css", "Ti/_/style"], function(declare, FontWidget, dom, css, style) {

	var set = style.set,
		undef;

	return declare("Ti.UI.Label", FontWidget, {
		
		constructor: function() {
			
			this.touchEnabled = false;
			
			// Create the aligner div. This sets up a flexbox to float the text to the middle
			this.textAlignerDiv = dom.create("div", {
				className: css.clean("TiUILabelTextAligner")
			}, this.domNode);

			set(this.textAlignerDiv, "display", "-webkit-box");
			set(this.textAlignerDiv, {
				display: "-moz-box",
				boxOrient: "vertical",
				boxPack: "center",
				width: "100%",
				height: "100%",
				overflow: "hidden"
			});

			// Create the container div. This gets floated by the flexbox
			this.textContainerDiv = dom.create("div", {
				className: css.clean("TiUILabelTextContainer"),
				style: {
					userSelect: "none"
				}
			}, this.textAlignerDiv);

			this._addStyleableDomNode(this.textContainerDiv);
		},

		toImage: function(callback) {
			// TODO
		},

		_defaultWidth: "auto",

		_defaultHeight: "auto",
		_getContentWidth: function() {
			return this._measureText(this.text, this.textContainerDiv).width;
		},
		_getContentHeight: function() {
			return this._measureText(this.text, this.textContainerDiv).height;
		},
		_setTouchEnabled: function(value) {
			FontWidget.prototype._setTouchEnabled.apply(this,arguments);
			var cssVal = value ? "auto" : "none"
			this.textAlignerDiv && set(this.textAlignerDiv,"pointerEvents", cssVal);
			this.textContainerDiv && set(this.textContainerDiv,"pointerEvents", cssVal);
		},

		properties: {
			color: {
				set: function(value) {
					this.textContainerDiv.style.color = value;
					return value;
				}
			},
			highlightedColor: undef,
			shadowColor: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Label#.shadowColor" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Label#.shadowColor" is not implemented yet.');
					return value;
				}
			},
			shadowOffset: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Label#.shadowOffset" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Label#.shadowOffset" is not implemented yet.');
					return value;
				}
			},
			text: {
				set: function(value) {
					this.textContainerDiv.innerHTML = value;
					Ti.UI._doFullLayout();
					return value;
				}
			},
			textAlign: {
				set: function(value) {
					this.textContainerDiv.style.textAlign = value;
					return value;
				}
			},
			textid: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Label#.textid" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Label#.textid" is not implemented yet.');
					return value;
				}
			},
			wordWrap: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Label#.wordWrap" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Label#.wordWrap" is not implemented yet.');
					return value;
				},
				value: false
			}
		}

	});

});;
define("Ti/UI/ScrollableView", 
	["Ti/_/declare", "Ti/_/UI/Widget", "Ti/_/lang", "Ti/_/dom", "Ti/_/css", "Ti/_/style"], 
	function(declare, Widget, lang, dom, css, style) {

	var set = style.set,
		is = require.is,
		isDef = require.isDef,
		unitize = dom.unitize,
		undef;

	return declare("Ti.UI.ScrollableView", Widget, {
		
		// This sets the minimum velocity that determines whether a swipe was a flick or a drag
		_velocityThreshold: 0.4,
		
		// This determines the minimum distance scale (i.e. width divided by this value) before a flick requests a page turn
		_minimumFlickDistanceScaleFactor: 15,
		
		// This determines the minimum distance scale (i.e. width divided by this value) before a drag requests a page turn
		_minimumDragDistanceScaleFactor: 2,
		
		constructor: function(args){
			
			this._setContent();
			
			// State variables
			this._viewToRemoveAfterScroll = -1;
			this._currentPage = 0;
			
			var initialPosition,
				animationView,
				swipeInitialized = false,
				viewsToScroll,
				touchEndHandled,
				startTime;
			// This touch end handles the case where a swipe was started, but turned out not to be a swipe
			this.addEventListener("touchend",function(e) {
				if (!touchEndHandled && swipeInitialized) {
					var width = this._measuredWidth,
						destinationLeft = viewsToScroll.indexOf(this.views[this.currentPage]) * -width;
					animationView.animate({
						duration: (300 + 0.2 * width) / (width - Math.abs(e._distance)) * 10,
						left: destinationLeft,
						curve: Ti.UI.ANIMATION_CURVE_EASE_OUT
					},lang.hitch(this,function(){
						this._setContent(this.views[this.currentPage]);
					}));
				}
			})
			this.addEventListener("swipe",function(e){
				
				// If we haven't started swiping yet, start swiping,
				var width = this._measuredWidth;
				if (!swipeInitialized) {
					swipeInitialized = true;
					touchEndHandled = false;
					startTime = (new Date()).getTime();
					
					// Create the list of views that can be scrolled, the ones immediately to the left and right of the current view
					initialPosition = 0;
					viewsToScroll = [];
					if (this.currentPage > 0) {
						viewsToScroll.push(this.views[this.currentPage - 1]);
						initialPosition = -width;
					}
					viewsToScroll.push(this.views[this.currentPage]);
					if (this.currentPage < this.views.length - 1) {
						viewsToScroll.push(this.views[this.currentPage + 1]);
					}
					
					// Create the animation div
					animationView = Ti.UI.createView({
						width: unitize(viewsToScroll.length * width),
						height: "100%",
						layout: "absolute",
						left: initialPosition,
						top: 0
					});
		
					// Attach the child views, each contained in their own div so we can mess with positioning w/o touching the views
					for (var i = 0; i < viewsToScroll.length; i++) {
						var viewContainer = Ti.UI.createView({
							left: unitize(i * width),
							top: 0,
							width: unitize(width),
							height: "100%",
							layout: "horizontal" // Do a horizontal to force the child to (0,0) without overwriting the original position values
						});
						set(viewContainer.domNode,"overflow","hidden");
						viewContainer.add(viewsToScroll[i]);
						animationView.add(viewContainer);
					}
					
					// Set the initial position
					animationView.left = unitize(initialPosition);
					this._setContent(animationView);
					
					// We have to force a non-delayed layout right now
					Ti.UI._doForcedFullLayout();
				}
				
				// Update the position of the animation div
				var newPosition = initialPosition + e._distance;
				newPosition = newPosition < 0 ? newPosition > -animationView._measuredWidth + width ? newPosition :-animationView._measuredWidth + width : 0;
				animationView.domNode.style.left = unitize(newPosition);
				
				// If the swipe is finished, we animate to the final position
				if (e._finishedSwiping) {
					swipeInitialized = false;
					touchEndHandled = true;
					
					// Determine whether this was a flick or a drag
					var velocity = Math.abs((e._distance) / ((new Date()).getTime() - startTime));
					var scaleFactor = velocity > this._velocityThreshold ? 
						this._minimumFlickDistanceScaleFactor : this._minimumDragDistanceScaleFactor
					
					// Find out which view we are animating to
					var destinationIndex = this.currentPage,
						animationLeft = initialPosition;
					if (e._distance > width / scaleFactor && this._currentPage > 0) {
						destinationIndex = this._currentPage - 1;
						animationLeft = 0;
					} else if (e._distance < -width / scaleFactor && this._currentPage < this.views.length - 1) {
						destinationIndex = this._currentPage + 1;
						if (viewsToScroll.length === 3) {
							animationLeft = -2 * width;
						} else {
							animationLeft = -width;
						}
					}
					
					// Check if the user attempted to scroll past the edge, in which case we directly reset the view instead of animation
					if (newPosition == 0 || newPosition == -animationView._measuredWidth + width) {
						this._setContent(this.views[destinationIndex]);
					} else {
						// Animate the view and set the final view
						animationView.animate({
							duration: (300 + 0.2 * width) / (width - Math.abs(e._distance)) * 10,
							left: animationLeft,
							curve: Ti.UI.ANIMATION_CURVE_EASE_OUT
						},lang.hitch(this,function(){
							this._setContent(this.views[destinationIndex]);
							this._currentPage = destinationIndex;
						}));
					}
				}
			});
		},
		
		addView: function(view){
			// Sanity check
			if (view) {
				this.views.push(view);
	
				// Check if any children have been added yet, and if not load this view
				this.views.length == 1 && this.scrollToView(0);
			}
		},
		
		removeView: function(view) {
			
			// Get and validate the location of the view
			var viewIndex = is(view,"Number") ? view : this.views.indexOf(view);
			if (viewIndex < 0 || viewIndex >= this.views.length) {
				return;
			}
	
			// Update the view if this view was currently visible
			if (viewIndex == this.currentPage) {
				if (this.views.length == 1) {
					this._setContent();
					this._removeViewFromList(viewIndex);
				} else {
					this._viewToRemoveAfterScroll = viewIndex;
				    this.scrollToView(viewIndex == this.views.length - 1 ? --viewIndex : ++viewIndex);
				}
			} else {
				this._removeViewFromList(viewIndex);
			}
		},
		
		_removeViewFromList: function(viewIndex) {
			// Remove the view
			this.views.splice(viewIndex,1);
	
			// Update the current view if necessary
			if (viewIndex < this.currentPage){
				this.currentPage--;
			}
		},
		
		_setContent: function(view) {
			
			// Remove and garbage collect the old container
			this.container && this.remove(this.container);
			this.container = null;
			
			// Create the new container
			this.container = Ti.UI.createView({
				left: 0,
				top: 0,
				width: "100%",
				height: "100%"
			});
			set(this.container.domNode,"overflow","hidden");
			this.add(this.container);
			
			// Add the view to the container
			view && this.container.add(view);
		},
		
		scrollToView: function(view) {
			var viewIndex = is(view,"Number") ? view : this.views.indexOf(view)
			
			// Sanity check
			if (viewIndex < 0 || viewIndex >= this.views.length || viewIndex == this.currentPage) {
				return;
			}
	
			// If the scrollableView hasn't been laid out yet, we can't do much since the scroll distance is unknown.
			// At the same time, it doesn't matter since the user won't see it anyways. So we just append the new
			// element and don't show the transition animation.
			if (!this.container.domNode.offsetWidth) {
				this._setContent(this.views[viewIndex]);
			} else {
				
				// Calculate the views to be scrolled
				var width = this._measuredWidth,
					viewsToScroll = [],
					scrollingDirection = -1,
					initialPosition = 0;
				if (viewIndex > this.currentPage) {
					for (var i = this.currentPage; i <= viewIndex; i++) {
						viewsToScroll.push(this.views[i]);
					}
				} else {
					for (var i = viewIndex; i <= this.currentPage; i++) {
						viewsToScroll.push(this.views[i]);
					}
					initialPosition = -(viewsToScroll.length - 1) * width;
					scrollingDirection = 1;
				}
	
				// Create the animation div
				var animationView = Ti.UI.createView({
					width: unitize(viewsToScroll.length * width),
					height: "100%",
					layout: "absolute",
					left: initialPosition,
					top: 0
				});
	
				// Attach the child views, each contained in their own div so we can mess with positioning w/o touching the views
				for (var i = 0; i < viewsToScroll.length; i++) {
					var viewContainer = Ti.UI.createView({
						left: unitize(i * width),
						top: 0,
						width: unitize(width),
						height: "100%",
						layout: "horizontal" // Do a horizontal to force the child to (0,0) without overwriting the original position values
					});
					set(viewContainer.domNode,"overflow","hidden");
					viewContainer.add(viewsToScroll[i]);
					animationView.add(viewContainer);
				}
				
				// Set the initial position
				animationView.left = unitize(initialPosition);
				this._setContent(animationView);
				
				// We have to force a non-delayed layout right now
				Ti.UI._doForcedFullLayout();
	
				// Set the start time
				var duration = 300 + 0.2 * width, // Calculate a weighted duration so that larger views take longer to scroll.
					distance = (viewsToScroll.length - 1) * width;
					
				animationView.animate({
					duration: duration,
					left: initialPosition + scrollingDirection * distance,
					curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
				},lang.hitch(this,function(){
					this._setContent(this.views[viewIndex]);
					this._currentPage = viewIndex;
					if (this._viewToRemoveAfterScroll != -1) {
						this._removeViewFromList(this._viewToRemoveAfterScroll);
						this._viewToRemoveAfterScroll = -1;
					}
				}));
			}
		},
		
		_defaultWidth: "100%",
		_defaultHeight: "100%",

		properties: {
			currentPage: {
				get: function() {
					return this._currentPage;
				},
				set: function(value) {
					if (value >= 0 && value < this.views.length) {
						this.scrollToView(value);
					}
					this._currentPage = value;
					return value;
				}
			},
			pagingControlColor: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ScrollableView#.pagingControlColor" is not implemented yet.');
					return value;
				},
				set: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ScrollableView#.pagingControlColor" is not implemented yet.');
					return value;
				}
			},
			pagingControlHeight: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ScrollableView#.pagingControlHeight" is not implemented yet.');
					return value;
				},
				set: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ScrollableView#.pagingControlHeight" is not implemented yet.');
					return value;
				}
			},
			pagingControlTimeout: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ScrollableView#.pagingControlTimeout" is not implemented yet.');
					return value;
				},
				set: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ScrollableView#.pagingControlTimeout" is not implemented yet.');
					return value;
				}
			},
			showPagingControl: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ScrollableView#.showPagingControl" is not implemented yet.');
					return value;
				},
				set: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ScrollableView#.showPagingControl" is not implemented yet.');
					return value;
				}
			},
			views: {
				set: function(value, oldValue) {
					// Value must be an array
					if (!is(value,"Array")) {
						return;
					}
					oldValue.length == 0 && value.length > 0 && this._setContent(value[0]);
					return value;
				},
				value: []
			}
		}

	});

});;
define("Ti/UI/ScrollView", ["Ti/_/declare", "Ti/UI/View", "Ti/_/style", "Ti/_/lang"], function(declare, View, style, lang) {

	return declare("Ti.UI.ScrollView", View, {
		
		constructor: function(args) {
			style.set(this.domNode, "overflow", "scroll");
			
			// Handle scrolling
			var previousTouchLocation;
			this.addEventListener("touchstart",function(e) {
				previousTouchLocation = {x: e.x, y: e.y};
			});
			this.addEventListener("touchend",function(e) {
				previousTouchLocation = null;
			});
			this.addEventListener("touchmove",lang.hitch(this,function(e) {
				this.domNode.scrollLeft += previousTouchLocation.x - e.x;
				this.domNode.scrollTop += previousTouchLocation.y - e.y;
				previousTouchLocation = {x: e.x, y: e.y};
			}));
		},
		
		scrollTo: function(x,y) {
			x !== null && (this.domNode.scrollLeft = parseInt(x));
			y !== null && (this.domNode.scrollTop = parseInt(y));
		},
		
		_defaultWidth: "100%",
		_defaultHeight: "100%",
		_getContentOffset: function(){
			return this.contentOffset;
		},

		properties: {
			canCancelEvents: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ScrollView#.canCancelEvents" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.ScrollView#.canCancelEvents" is not implemented yet.');
					return value;
				}
			},
			
			contentHeight: {
				get: function(value) {
					return this.height;
				},
				set: function(value) {
					this.height = value;
					return value;
				}
			},
			
			contentOffset: {
				get: function(value) {
					return {x: this.domNode.scrollLeft, y: this.domNode.scrollTop}
				},
				set: function(value) {
					return {x: this.domNode.scrollLeft, y: this.domNode.scrollTop};
				}
			},
			
			contentWidth: {
				get: function(value) {
					return this.width;
				},
				set: function(value) {
					this.width = value;
					return value;
				}
			},
			
			showHorizontalScrollIndicator: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ScrollView#.showHorizontalScrollIndicator" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.ScrollView#.showHorizontalScrollIndicator" is not implemented yet.');
					return value;
				}
			},
			
			showVerticalScrollIndicator: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.ScrollView#.showVerticalScrollIndicator" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.ScrollView#.showVerticalScrollIndicator" is not implemented yet.');
					return value;
				}
			}
		}

	});

});;
define("Ti/UI/Slider", ["Ti/_/declare", "Ti/_/UI/Widget", "Ti/_/dom", "Ti/_/css", "Ti/_/style"], function(declare, Widget, dom, css, style) {

    var set = style.set,
        undef;

	return declare("Ti.UI.Slider", Widget, {

		constructor: function(args) {
			this.slider = dom.create("input", {
				className: css.clean("TiUISliderSlider")
			});
			this.slider.type = "range";
			this.domNode.appendChild(this.slider);
			set(this.slider,"width","100%");
			set(this.slider,"height","100%");
			this.slider.min = 0;
			this.slider.max = 100;
			this.slider.value = 0;
		},
		
		_defaultWidth: "100%",
		_defaultHeight: "auto",
		_getContentWidth: function() {
			return this.slider.clientWidth;
		},
		_getContentHeight: function() {
			return this.slider.clientHeight;
		},
		_setTouchEnabled: function(value) {
			Widget.prototype._setTouchEnabled.apply(this,arguments);
			this.slider && set(this.slider,"pointerEvents", value ? "auto" : "none");
		},

		properties: {
			disabledLeftTrackImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Slider#.disabledLeftTrackImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Slider#.disabledLeftTrackImage" is not implemented yet.');
					return value;
				}
			},
			
			disabledRightTrackImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Slider#.disabledRightTrackImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Slider#.disabledRightTrackImage" is not implemented yet.');
					return value;
				}
			},
			
			disabledThumbImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Slider#.disabledThumbImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Slider#.disabledThumbImage" is not implemented yet.');
					return value;
				}
			},
			
			highlightedLeftTrackImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Slider#.highlightedLeftTrackImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Slider#.highlightedLeftTrackImage" is not implemented yet.');
					return value;
				}
			},
			
			highlightedRightTrackImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Slider#.highlightedRightTrackImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Slider#.highlightedRightTrackImage" is not implemented yet.');
					return value;
				}
			},
			
			highlightedThumbImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Slider#.highlightedThumbImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Slider#.highlightedThumbImage" is not implemented yet.');
					return value;
				}
			},
			
			leftTrackImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Slider#.leftTrackImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Slider#.leftTrackImage" is not implemented yet.');
					return value;
				}
			},
			
			max: {
				get: function(value) {
					return this.slider.max;
				},
				set: function(value) {
					this.slider.max = value;
					return value;
				}
			},
			
			min: {
				get: function(value) {
					return this.slider.min;
				},
				set: function(value) {
					this.slider.min = value;
					return value;
				}
			},
			
			rightTrackImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Slider#.rightTrackImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Slider#.rightTrackImage" is not implemented yet.');
					return value;
				}
			},
			
			selectedLeftTrackImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Slider#.selectedLeftTrackImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Slider#.selectedLeftTrackImage" is not implemented yet.');
					return value;
				}
			},
			
			selectedRightTrackImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Slider#.selectedRightTrackImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Slider#.selectedRightTrackImage" is not implemented yet.');
					return value;
				}
			},
			
			selectedThumbImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Slider#.selectedThumbImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Slider#.selectedThumbImage" is not implemented yet.');
					return value;
				}
			},
			
			thumbImage: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Slider#.thumbImage" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Slider#.thumbImage" is not implemented yet.');
					return value;
				}
			},
			
			value: {
				get: function(value) {
					return this.slider.value;
				},
				set: function(value) {
					this.slider.value = value;
					return value;
				}
			}
		}

	});

});
;
define("Ti/UI/Switch", ["Ti/_/declare", "Ti/_/UI/Widget", "Ti/_/dom", "Ti/_/css", "Ti/_/style"], function(declare, Widget, dom, css, style) {

	var set = style.set,
        undef;

	return declare("Ti.UI.Switch", Widget, {

		constructor: function(args) {
			this._switch = dom.create("input", {
				className: css.clean("TiUISwitchSwitch")
			});
			set(this._switch,"width","100%");
			set(this._switch,"height","100%");
			this._switch.type = "checkbox";
			this.domNode.appendChild(this._switch);
		},
		
		_defaultWidth: "auto",
        _defaultHeight: "auto",
		_getContentWidth: function() {
			return this._switch.clientWidth;
		},
		_getContentHeight: function() {
			return this.textArea.clientHeight;
		},
		_setTouchEnabled: function(value) {
			Widget.prototype._setTouchEnabled.apply(this,arguments);
			this.slider && set(this._switch,"pointerEvents", value ? "auto" : "none");
		},

		properties: {
            title: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Switch#.title" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Switch#.title" is not implemented yet.');
					return value;
				}
			},
			
            titleOff: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Switch#.titleOff" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Switch#.titleOff" is not implemented yet.');
					return value;
				}
			},
			
            titleOn: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Switch#.titleOn" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Switch#.titleOn" is not implemented yet.');
					return value;
				}
			},
			
            value: {
				get: function(value) {
					return this._switch.value;
				},
				set: function(value) {
					this._switch.value = value ? true : false
					return this._switch.value;
				}
			}
		}

	});

});
;
define("Ti/UI/TableView", ["Ti/_/declare", "Ti/UI/View", "Ti/_/dom", "Ti/_/css", "Ti/_/style", "Ti/_/lang"], function(declare, View, dom, css, style, lang) {

	var set = style.set,
		is = require.is,
		isDef = require.isDef,
		undef;

	return declare("Ti.UI.TableView", View, {
		
		constructor: function(args) {
			
			// Create the parts out of Ti controls so we can make use of the layout system
			this.layout = 'vertical';
			set(this.domNode,"overflow-x","hidden");
			set(this.domNode,"overflow-y","auto");
			
			// Use horizontal layouts so that the default location is always (0,0)
			this.header = Ti.UI.createView({height: 'auto', layout: 'horizontal'});
			this.rows = Ti.UI.createView({height: 'auto', layout: 'vertical'});
			this.footer = Ti.UI.createView({height: 'auto', layout: 'horizontal'});
			
			this.add(this.header);
			this.add(this.rows);
			this.add(this.footer);
			
			// Handle scrolling
			var previousTouchLocation;
			this.addEventListener("touchstart",function(e) {
				previousTouchLocation = e.y;
			});
			this.addEventListener("touchend",function(e) {
				previousTouchLocation = null;
			});
			this.addEventListener("touchmove",lang.hitch(this,function(e) {
				this.domNode.scrollTop += previousTouchLocation - e.y;
				previousTouchLocation = e.y;
			}));
		},

		appendRow: function(row, properties) {
			console.debug('Property "Titanium.UI.TableView#.appendRow" is not implemented yet.');
		},
		deleteRow: function(row, properties) {
			console.debug('Property "Titanium.UI.TableView#.deleteRow" is not implemented yet.');
		},
		insertRowAfter: function(index, row, properties) {
			console.debug('Property "Titanium.UI.TableView#.insertRowAfter" is not implemented yet.');
		},
		insertRowBefore: function(index, row, properties) {
			console.debug('Property "Titanium.UI.TableView#.insertRowBefore" is not implemented yet.');
		},
		updateRow: function(row, properties) {
			console.debug('Property "Titanium.UI.TableView#.updateRow" is not implemented yet.');
		},
		
		doLayout: function() {
			
			// Update the row height info
			for (var i in this.data) {
				var row = this.data[i];
				if (isDef(row.declaredClass) && row.declaredClass == "Ti.UI.TableViewRow") {
					row._defaultHeight = this.rowHeight;
					set(row.domNode,'minHeight',this.minRowHeight);
					set(row.domNode,'maxHeight',this.maxRowHeight);
				}
			}
			
			View.prototype.doLayout.apply(this,arguments);
		},
		
		_defaultWidth: "100%",
		_defaultHeight: "100%",
		_getContentOffset: function(){
			return {x: this.domNode.scrollLeft, y: this.domNode.scrollTop};
		},
		
		_handleTouchEvent: function(type, e) {
			if (type === "click" || type === "singletap") {
				e.row = this._tableViewRowClicked;
				e.rowData = this._tableViewRowClicked;
				e.index = this.rows.children.indexOf(this._tableViewRowClicked);
				e.section = this._tableViewSectionClicked;
				e.searchMode = false;
			}
			View.prototype._handleTouchEvent.apply(this,arguments);
		},
		
		_tableViewRowClicked: null,
		_tableViewSectionClicked: null,
		
		properties: {
			data: {
				set: function(value,oldValue) {
					if (is(value,'Array')) {
						
						// Remove the old children
						for(var i in oldValue) {
							this.rows.remove(oldValue[i]);
						}
						
						// Convert any object literals to TableViewRow instances, and update TableViewRow instances with row info
						for (var i in value) {
							if (!isDef(value[i].declaredClass) || value[i].declaredClass != "Ti.UI.TableViewRow") {
								value[i] = Ti.UI.createTableViewRow(value[i]);
							}
						}
						
						// Add the new children
						for (var i in value) {
							this.rows.add(value[i]);
							this.rows.add(Ti.UI.createView({height: "1px", width: "100%", backgroundColor: this.separatorColor}));
						}
						
						// Relayout the screen
						Ti.UI._doFullLayout();
						
						return value;
					} else {
						// Data must be an array
						return;
					}
				}
			},
			footerTitle: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this.footerTitleControl && this.footer.remove(this.footerTitleControl);
						this.footerTitleControl = Ti.UI.createLabel({text: value});
						this.footer.add(this.footerTitleControl);
						Ti.UI._doFullLayout();
					}
					return value;
				}
			},
			footerView: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this.footerTitleControl && this.footer.remove(this.footerTitleControl);
						this.footerTitleControl = value;
						this.footer.add(this.footerTitleControl);
						Ti.UI._doFullLayout();
					}
					return value;
				}
			},
			headerTitle: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this.headerTitleControl && this.header.remove(this.headerTitleControl);
						this.headerTitleControl = Ti.UI.createLabel({text: value});
						this.header.add(this.headerTitleControl);
						Ti.UI._doFullLayout();
					}
					return value;
				}
			},
			headerView: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this.headerTitleControl && this.header.remove(this.headerTitleControl);
						this.headerTitleControl = value;
						this.header.add(this.headerTitleControl);
						Ti.UI._doFullLayout();
					}
					return value;
				}
			},
			maxRowHeight: "100%",
			minRowHeight: "0%",
			rowHeight: "50px",
			separatorColor: {
				set: function(value) {
					console.debug('Property "Titanium.UI.TableView#.separatorColor" is not implemented yet.');
					return value;
				},
				value: "lightGrey"
			},
			separatorStyle: {
				set: function(value) {
					console.debug('Property "Titanium.UI.TableView#.separatorStyle" is not implemented yet.');
					return value;
				}
			}
		}

	});

});;
define("Ti/UI/TableViewSection", ["Ti/_/declare", "Ti/_/UI/Widget"], function(declare, Widget) {

	return declare("Ti.UI.TableViewSection", Widget, {

		_defaultHeight: "auto",
		_defaultWidth: "auto",
			
		properties: {
			footerTitle: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.TableViewSection#.footerTitle" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.TableViewSection#.footerTitle" is not implemented yet.');
					return value;
				}
			},
			
			footerView: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.TableViewSection#.footerView" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.TableViewSection#.footerView" is not implemented yet.');
					return value;
				}
			},
			
			headerTitle: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.TableViewSection#.headerTitle" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.TableViewSection#.headerTitle" is not implemented yet.');
					return value;
				}
			},
			
			headerView: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.TableViewSection#.headerView" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.TableViewSection#.headerView" is not implemented yet.');
					return value;
				}
			},
			
			rowCount: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.TableViewSection#.rowCount" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.TableViewSection#.rowCount" is not implemented yet.');
					return value;
				}
			}
		}

	});

});;
define("Ti/UI/TextArea",
	["Ti/_/declare", "Ti/_/UI/TextBox", "Ti/_/dom", "Ti/_/css", "Ti/_/style", "Ti/UI"],
	function(declare, TextBox, dom, css, style, UI) {

	return declare("Ti.UI.TextArea", TextBox, {

		domType: "textarea",

		constructor: function(args) {
			style.set(this._field = this.domNode, {
				width: "100%",
				height: "100%"
			});

			this._initTextBox();
		},

		_defaultWidth: "auto",

		_defaultHeight: "auto",

		_getContentWidth: function() {
			return this._measureText(this.value, this.textArea).width;
		},

		_getContentHeight: function() {
			return this._measureText(this.value, this.textArea).height;
		},

		_setTouchEnabled: function(value) {
			TextBox.prototype._setTouchEnabled.apply(this,arguments);
			this.slider && style.set(this.textArea, "pointerEvents", value ? "auto" : "none");
		}

	});

});
;
define("Ti/UI/TextField",
	["Ti/_/declare", "Ti/_/UI/TextBox", "Ti/_/css", "Ti/_/dom", "Ti/_/lang", "Ti/_/style", "Ti/UI"],
	function(declare, TextBox, css, dom, lang, style, UI) {

	var borderStyles = ["None", "Line", "Bezel", "Rounded"];

	return declare("Ti.UI.TextField", TextBox, {

		constructor: function(args) {
			var f = this._field = dom.create("input", {
				autocomplete: "off",
				style: {
					width: "100%",
					height: "100%"
				}
			}, this.domNode);

			this._initTextBox();
			this._keyboardType();
			this.borderStyle = UI.INPUT_BORDERSTYLE_NONE;

			require.on(f, "focus", this, function() {
				this.clearOnEdit && (f.value = "");
			});
		},

        _defaultWidth: "auto",

        _defaultHeight: "auto",

		_getContentWidth: function() {
			return this._measureText(this.value, this._field).width;
		},

		_getContentHeight: function() {
			return this._measureText(this.value, this._field).height;
		},

		_setTouchEnabled: function(value) {
			this.slider && style.set(this._field, "pointerEvents", value ? "auto" : "none");
		},

		_keyboardType: function(args) {
			var t = "text",
				args = args || {};
			if (lang.val(args.pm, this.passwordMask)) {
				t = "password";
			} else {
				switch (lang.val(args.kt, this.keyboardType)) {
					case UI.KEYBOARD_EMAIL:
						t = "email";
						break;
					case UI.KEYBOARD_NUMBER_PAD:
						t = "number";
						break;
					case UI.KEYBOARD_PHONE_PAD:
						t = "tel";
						break;
					case UI.KEYBOARD_URL:
						t = "url";
						break;
				}
			}
			this._field.type = t;
		},

		properties: {
			borderStyle: {
				set: function(value, oldValue) {
					var n = this.domNode,
						s = "TiUITextFieldBorderStyle";
					if (value !== oldValue) {
						css.remove(n, s + borderStyles[oldValue]);
						css.add(n, s + borderStyles[value]);
					}
					return value;
				}
			},

			clearOnEdit: false,

			hintText: {
				set: function(value) {
					this._field.placeholder = value;
					return value;
				}
			},

			keyboardType: {
				set: function(value) {
					this._keyboardType({ kt:value });
					return value;
				}
			},

			maxLength: {
				set: function(value) {
					value = value|0;
					this._field.maxlength = value > 0 ? value : "";
					return value;
				}
			},

			passwordMask: {
				value: false,
				set: function(value) {
					this._keyboardType({ pm:value });
					return value;
				}
			}
		}

	});

});
;
define("Ti/UI/WebView", ["Ti/_/declare", "Ti/_/UI/Widget", "Ti/_/dom", "Ti/_/css", "Ti/_/style"], function(declare, Widget, dom, css, style) {

	var set = style.set,
        undef;

	return declare("Ti.UI.WebView", Widget, {
		
		constructor: function(args) {
			this._iframe = dom.create("iframe", {
				className: css.clean("TiUIWebViewIFrame")
			});
			this.domNode.appendChild(this._iframe);
			set(this._iframe,"width","100%");
			set(this._iframe,"height","100%");
		},
		
		canGoBack: function(x,y) {
			console.debug('Method "Titanium.UI.WebView#.canGoBack" is not implemented yet.');
		},
		
		canGoForward: function(x,y) {
			console.debug('Method "Titanium.UI.WebView#.canGoForward" is not implemented yet.');
		},
		
		evalJS: function(x,y) {
			console.debug('Method "Titanium.UI.WebView#.evalJS" is not implemented yet.');
		},
		
		goBack: function(x,y) {
			this._iframe.contentWindow.history.go(-1);
		},
		
		goForward: function(x,y) {
			this._iframe.contentWindow.history.go(1);
		},
		
		reload: function(x,y) {
			this._iframe.contentWindow.location.reload(true);
		},
		
		repaint: function(x,y) {
			console.debug('Method "Titanium.UI.WebView#.repaint" is not implemented yet.');
		},
		
		stopLoading: function(x,y) {
			console.debug('Method "Titanium.UI.WebView#.stopLoading" is not implemented yet.');
		},
		
		_defaultWidth: "100%",
		_defaultHeight: "100%",
		_getContentWidth: function() {
			return this._iframe.clientWidth;
		},
		_getContentHeight: function() {
			return this._iframe.clientHeight;
		},
		_setTouchEnabled: function(value) {
			Widget.prototype._setTouchEnabled.apply(this,arguments);
			this.slider && set(this._iframe,"pointerEvents", value ? "auto" : "none");
		},
		
		properties: {
			data: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.WebView#.data" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.WebView#.data" is not implemented yet.');
					return value;
				}
			},
			
			html: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.WebView#.html" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.WebView#.html" is not implemented yet.');
					return value;
				}
			},
			
			loading: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.WebView#.loading" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.WebView#.loading" is not implemented yet.');
					return value;
				}
			},
			
			url: { 
				set: function(value) {
					this._iframe.src = value;
					return value;
				}
			}
		}

	});

});;
define("Ti/Utils", ["Ti/_/Evented"], function(Evented) {

	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
		
		// private property
		var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		// private method for UTF-8 encoding
		function _utf8_encode (string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
	
			for (var n = 0; n < string.length; n++) {
	
				var c = string.charCodeAt(n);
	
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
	
			}
	
			return utftext;
		};
		// private method for UTF-8 decoding
		function _utf8_decode (utftext) {
		   var string = "";
		   var i = 0;
		   var c = c1 = c2 = 0;
	
		   while ( i < utftext.length ) {
	
			   c = utftext.charCodeAt(i);
	
			   if (c < 128) {
				   string += String.fromCharCode(c);
				   i++;
			   }
			   else if((c > 191) && (c < 224)) {
				   c2 = utftext.charCodeAt(i+1);
				   string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				   i += 2;
			   }
			   else {
				   c2 = utftext.charCodeAt(i+1);
				   c3 = utftext.charCodeAt(i+2);
				   string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				   i += 3;
			   }
	
		   }
	
			return string;
		};
		
		// Methods
		api.base64decode = function(input){
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
	
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	
			while (i < input.length) {
	
				enc1 = _keyStr.indexOf(input.charAt(i++));
				enc2 = _keyStr.indexOf(input.charAt(i++));
				enc3 = _keyStr.indexOf(input.charAt(i++));
				enc4 = _keyStr.indexOf(input.charAt(i++));
	
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
	
				output = output + String.fromCharCode(chr1);
	
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
	
			}
	
			output = _utf8_decode(output);
	
			return output;
		};
		api.base64encode = function(input){
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
	
			input = _utf8_encode(input);
	
			while (i < input.length) {
	
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
	
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
	
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
	
				output = output +
				_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
				_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
	
			}
	
			return output;
		};
		api.md5HexDigest = function(input){
			// +   original by: javascript.ru (http://www.javascript.ru/)
	
			var RotateLeft = function(lValue, iShiftBits) {
					return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
				};
		 
			var AddUnsigned = function(lX,lY) {
					var lX4,lY4,lX8,lY8,lResult;
					lX8 = (lX & 0x80000000);
					lY8 = (lY & 0x80000000);
					lX4 = (lX & 0x40000000);
					lY4 = (lY & 0x40000000);
					lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
					if (lX4 & lY4) {
						return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
					}
					if (lX4 | lY4) {
						if (lResult & 0x40000000) {
							return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
						} else {
							return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
						}
					} else {
						return (lResult ^ lX8 ^ lY8);
					}
				};
		 
			var F = function(x,y,z) { return (x & y) | ((~x) & z); };
			var G = function(x,y,z) { return (x & z) | (y & (~z)); };
			var H = function(x,y,z) { return (x ^ y ^ z); };
			var I = function(x,y,z) { return (y ^ (x | (~z))); };
		 
			var FF = function(a,b,c,d,x,s,ac) {
					a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
					return AddUnsigned(RotateLeft(a, s), b);
				};
		 
			var GG = function(a,b,c,d,x,s,ac) {
					a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
					return AddUnsigned(RotateLeft(a, s), b);
				};
		 
			var HH = function(a,b,c,d,x,s,ac) {
					a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
					return AddUnsigned(RotateLeft(a, s), b);
				};
		 
			var II = function(a,b,c,d,x,s,ac) {
					a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
					return AddUnsigned(RotateLeft(a, s), b);
				};
		 
			var ConvertToWordArray = function(str) {
					var lWordCount;
					var lMessageLength = str.length;
					var lNumberOfWords_temp1=lMessageLength + 8;
					var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
					var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
					var lWordArray=Array(lNumberOfWords-1);
					var lBytePosition = 0;
					var lByteCount = 0;
					while ( lByteCount < lMessageLength ) {
						lWordCount = (lByteCount-(lByteCount % 4))/4;
						lBytePosition = (lByteCount % 4)*8;
						lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount)<<lBytePosition));
						lByteCount++;
					}
					lWordCount = (lByteCount-(lByteCount % 4))/4;
					lBytePosition = (lByteCount % 4)*8;
					lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
					lWordArray[lNumberOfWords-2] = lMessageLength<<3;
					lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
					return lWordArray;
				};
		 
			var WordToHex = function(lValue) {
					var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
					for (lCount = 0;lCount<=3;lCount++) {
						lByte = (lValue>>>(lCount*8)) & 255;
						WordToHexValue_temp = "0" + lByte.toString(16);
						WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
					}
					return WordToHexValue;
				};
		 
			var x=Array();
			var k,AA,BB,CC,DD,a,b,c,d;
			var S11=7, S12=12, S13=17, S14=22;
			var S21=5, S22=9 , S23=14, S24=20;
			var S31=4, S32=11, S33=16, S34=23;
			var S41=6, S42=10, S43=15, S44=21;
		 
			str = _utf8_encode(input);
			x = ConvertToWordArray(str);
			a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
		 
			for (k=0;k<x.length;k+=16) {
				AA=a; BB=b; CC=c; DD=d;
				a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
				d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
				c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
				b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
				a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
				d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
				c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
				b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
				a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
				d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
				c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
				b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
				a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
				d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
				c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
				b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
				a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
				d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
				c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
				b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
				a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
				d=GG(d,a,b,c,x[k+10],S22,0x2441453);
				c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
				b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
				a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
				d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
				c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
				b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
				a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
				d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
				c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
				b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
				a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
				d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
				c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
				b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
				a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
				d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
				c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
				b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
				a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
				d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
				c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
				b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
				a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
				d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
				c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
				b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
				a=II(a,b,c,d,x[k+0], S41,0xF4292244);
				d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
				c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
				b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
				a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
				d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
				c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
				b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
				a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
				d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
				c=II(c,d,a,b,x[k+6], S43,0xA3014314);
				b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
				a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
				d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
				c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
				b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
				a=AddUnsigned(a,AA);
				b=AddUnsigned(b,BB);
				c=AddUnsigned(c,CC);
				d=AddUnsigned(d,DD);
			}
		 
			var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
		 
			return temp.toLowerCase();
	
		};
	})(Ti._5.createClass('Ti.Utils'));

});;
