/** Wrap the request using async-profile module */

"use strict";

//var _Q = require('q');
var FUNCTION = require('nor-function');
var debug = require('nor-debug');
var AsyncProfile = require('async-profile');

var express_async_profiler = module.exports = function plugin_async_profiler(middleware) {

	debug.assert(middleware).ignore(undefined).is('function');

	var use_middleware = arguments.length !== 0;

	var plugin = function plugin_async_profiler_(req, res, next) {

		var p;

		if(!use_middleware) {
			p = new AsyncProfile();
			res.once('finish', function plugin_async_profiler_finish() {
				p.stop();
			});
			next();
			return;
		}

		var name = FUNCTION(middleware).parseName();
		p = new AsyncProfile({
				callback: function(result) {
					debug.log( 'Profiling express ' + name + ': ' );
					result.print();
				}});

		middleware(req, res, function next_() {
			p.stop();
			if(arguments.length === 0) {
				next();
				return;
			}
			var a1 = arguments[0];
			if(arguments.length === 1) {
				next(a1);
				return;
			}
			var a2 = arguments[1];
			if (arguments.length === 2) {
				next(a1, a2);
				return;
			}
			var a3 = arguments[2];
			if (arguments.length === 3) {
				next(a1, a2, a3);
				return;
			}
		});
	};
	return plugin;
};

/** Hijack app.use so that async_profiler is used for all plugins */
express_async_profiler.setup = function setup_express_async_profiler(app) {
	var orig_use = FUNCTION(app.use).bind(app);
	app.use = function app_use_async_profiler() {

		if(arguments.length === 1) {
			return orig_use(express_async_profiler(arguments[0]));
		}

		if(arguments.length === 2) {
			return orig_use(arguments[0], express_async_profiler(arguments[1]));
		}

		throw new TypeError("app.use() called with arguments.length = ", arguments.length);
	};
};

/* EOF */
