/* Express Routes implementation */

"use strict";

var debug = require('nor-debug');
var is = require('nor-is');
var FS = require('fs');
var PATH = require('path');
var merge = require('merge');
var ARRAY = require('nor-array');
var FUNCTION = require('nor-function');

var ROUTES = module.exports = {};

/* Setup helper objects */

var _express_methods = {
	'ALL':'all',
	'USE':'use'
};

ARRAY(require('methods')).forEach(function(method) {
	_express_methods[method.toUpperCase()] = method;
});

var _special_methods = Object.keys(_express_methods);

/** */
function do_send(opts, data, req, res, next) {
	if(opts.sender && (typeof opts.sender === 'function') ) {
		//debug.log("data = ", data);
		opts.sender(data, req, res, next);
	} else {
		//debug.log("data = ", data);
		res.json(data);
	}
}

/** Join multiple Express plugins into one */
function join_plugins(plugins) {
	debug.assert(plugins).is('array');
	debug.assert( ARRAY(plugins).every(is.func) ).equals(true);

	return function(req, res, next) {
		var queue = [].concat(plugins);

		function do_iteration_() {
			if(queue.length === 0) {
				next();
				return;
			}
			var plugin = queue.shift();
			debug.assert(plugin).is('function');
			plugin(req, res, function(err) {
				if(err) {
					next(err);
					return;
				}
				do_iteration_();
			});
		}

		function do_iteration() {
			try {
				do_iteration_();
			} catch(err) {
				next(err);
				return;
			}
		}

		do_iteration();
	};
}

/** Express does not have `req.route` for `app.use()` */
function fix_for_missing_req_route(target, method) {
	debug.assert(target).is('string');
	debug.assert(method).is('string');
	return function the_fixer(req, res, next) {
		debug.assert(req).is('object');
		debug.assert(res).is('object');
		debug.assert(next).is('function');
		if(req.route === undefined) {
			req.route = {
				'path': target,
				'method': method
			};
		}
		next();
	};
}

/* */
function build_request(opts, handler) {
	debug.assert(handler).is('function');

	function do_request_(req, res, next) {
		debug.assert(req).is('object');
		debug.assert(res).is('object');
		debug.assert(next).is('function');

		var ret = handler(req, res, next);

		//debug.log('ret = ' , ret);
		// Handle undefined result -- do nothing
		if(ret === undefined) {
			return;
		// Handle promises
			} else if(ret && is.func(ret.then)) {
			ret.then(function(result) {
				if(result !== undefined) {
					do_send(opts, result, req, res, next);
				}
			}).fail(function(err) {
				next(err);
			}).done();
			return;
		// Everything else is sent encoded as JSON with status 200 OK
		} else {
			do_send(opts, ret, req, res, next);
		}
	}

	return function do_request(req, res, next) {
		try {
			do_request_(req, res, next);
		} catch(err) {
			next(err);
		}
	};
}

/** Setup member handlers */
function setup_member(context, k) {
	var handler;
	var routes = context.routes;
	var opts = context.opts;
	var middleware = context.middleware;
	var app = context.app;
	var target = context.target;
	var loop_counter = context.loop_counter;
	var v = routes[k];
	var v_is_function = is.func(v) ? true : false;

	// Special methods
	if(_special_methods.indexOf(k) >= 0) {
		handler = v_is_function ? v : FUNCTION(do_send).curry(opts, v);
		if(middleware.length === 0) {
			app[_express_methods[k]](target, build_request(opts, handler) );
		} else if(k === 'USE') {
			//debug.log('target = ', target);
			//debug.log('k = ', k);
			//debug.log('_express_methods[', k,'] = ', _express_methods[k]);

			app[_express_methods[k]](target, join_plugins( [fix_for_missing_req_route(target, 'use')].concat(middleware).concat([build_request(opts, handler)]) ) );
		} else {
			app[_express_methods[k]](target, fix_for_missing_req_route(target, (''+k).toLowerCase() ), middleware, build_request(opts, handler));
		}
		return;
	}

	// Functions
	if(process.env.DEBUG_NOR_EXPRESS) {
		debug.log( /*(req.id ? '['+req.id+'] ' : '') + */ 'target = ', target);
		debug.log( /*(req.id ? '['+req.id+'] ' : '') + */ 'k = ', k);
	}

	var new_target = (target==='/') ? ('/' + k) : (target + '/' + k);
	var new_route = ROUTES.parse(v);
	ROUTES.setup(app, new_route, new_target, merge(opts, {'loop_counter': loop_counter+1}));
}

/** Parse multiple supported types as routes object */
ROUTES.parse = function parse_route(routes, opts) {
	opts = opts || {};
	debug.assert(opts).is('object');

	if(opts.routes === undefined) {
		opts.routes = true;
	}

	//debug.log('routes = ', routes);

	// Functions are expected to be for GET handlers in standard format function(req, res)
	if(is.func(routes)) {
		return {'GET': routes};
	}

	// Objects might be different things...
	if(is.obj(routes)) {

		// If it has `.toRoutes()`, we expect it to convert to our routes object.
		if(opts.routes && is.func(routes.toRoutes)) {
			return routes.toRoutes();
		} else if(is.func(routes.toNorExpress)) {
			return {'GET': routes.toNorExpress()};
		}

		// We expect other objects to be our routes object
		return routes;
	}

	// Other things are just passed as GET handlers
	return {'GET': routes};
};

/** Returns true if file should be ignored */
function ignore_file(/*filename*/) {
	return false;
}

/** Returns true if file should be ignored */
function accept_file(filename, state) {
	state = state || {};
	debug.assert(filename).is('string');
	debug.assert(state).is('object');
	if(!state.file) { return; }
	var ext = PATH.extname(filename);
	return (ext === '.js') ? true : false;
}

/** Returns true if file should be ignored */
function accept_dir(filename, state) {
	state = state || {};
	debug.assert(filename).is('string');
	debug.assert(state).is('object');
	if(!state.directory) { return; }
	return true;
}

/** Returns true if file or directory should be ignored */
function accept_multi(filename, state) {
	state = state || {};
	debug.assert(filename).is('string');
	debug.assert(state).is('object');
	if(state.directory) { return accept_dir(filename, state); }
	if(state.file) { return accept_file(filename, state); }
	return;
}

/** Load routes from filesystem directory */
ROUTES.load = function(path, opts) {
	opts = opts || {};
	debug.assert(opts).is('object');

	if(!is.func(opts.ignore)) {
		opts.ignore = ignore_file;
	}

	if(!is.func(opts.accept)) {
		opts.accept = accept_multi;
	}

	if(!is.func(opts.require)) {
		opts.require = require;
	}

	debug.assert(opts.ignore).is('function');
	debug.assert(opts.accept).is('function');
	debug.assert(opts.require).is('function');

	//console.error('DEBUG: routes.load(path=' + JSON.stringify(path) + ')' );
	var routes = opts.routes || {};
	debug.assert(routes).is('object');

	// Handle index file
	var routes_file = PATH.resolve(path, 'index.js');
	if(FS.existsSync(routes_file)) {
		routes = ROUTES.parse( opts.require( routes_file ), {'routes': false} );
	}

	ARRAY(FS.readdirSync(path)).forEach(function(filename) {

		var full_filename = PATH.resolve(path, filename);
		var stat = FS.statSync(full_filename);
		var ext, basename;

		var state = {
			directory: stat.isDirectory() ? true : false,
			file: stat.isFile() ? true : false
		};

		// Skip index files
		if(filename === 'index.js') { return; }

		// Skip hidden files
		if(filename[0] === '.') { return; }

		// Skip ignored or non-accepted files
		if(opts.ignore(filename, state)) { return; }
		if(!opts.accept(filename, state)) { return; }

		// Load subdirs
		if(state.directory) {
			routes[filename] = ROUTES.load(full_filename, merge(opts, {'routes':{}}) );
			return;
		}

		// Load files
		if(state.file) {
			ext = PATH.extname(filename);
			basename = PATH.basename(filename, ext);
			if(routes[basename] !== undefined) {
				debug.warn('Duplicate route ', basename, ' merged to ', full_filename );
			}
			var route = merge(routes[basename], ROUTES.parse(opts.require(full_filename)));
			routes[basename] = route;
			routes[basename + ext] = route;
			return;
		}

	});

	return routes;
};

/** Setup routes to express */
ROUTES.setup = function(app, routes, target, opts) {
	target = target || '/';
	opts = opts || {};

	var max_loops    = opts.max_loops    || 100;
	var loop_counter = opts.loop_counter ||   0;

	if(loop_counter > max_loops) {
		throw new TypeError("Possible internal loop detected. Probably a bug.");
	}

	if(process.env.DEBUG_NOR_EXPRESS) {
		debug.log("ROUTES.setup() where routes =", routes, " and target =", target);
	}

	var middleware = opts.middleware || [];
	if(!is.array(middleware)) { middleware = [middleware]; }

	debug.assert(middleware).is('array');

	if(!ARRAY(middleware).every(is.func)) {
		throw new TypeError('middleware array contains non-function elements!');
	}

	//console.error('DEBUG: routes.setup(app, routes=' + JSON.stringify(routes, null, 2) + ', target=' + JSON.stringify(target, null, 2) + ')');

	// Setup member handlers
	ARRAY(Object.keys(routes)).forEach(FUNCTION(setup_member).curry({
		"routes": routes,
		"opts": opts,
		"middleware": middleware,
		"app": app,
		"target": target,
		"loop_counter": loop_counter
	}));

};

/* EOF */
