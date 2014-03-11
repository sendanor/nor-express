/* Express Routes implementation */

var debug = require('nor-debug');
var is = require('nor-is');
var mod = module.exports = {};

/* Setup helper objects */

var _express_methods = {
	'ALL':'all',
	'USE':'use'
};

require('methods').forEach(function(method) {
	_express_methods[method.toUpperCase()] = method;
});

var _special_methods = Object.keys(_express_methods);

/** Load routes from filesystem directory */
mod.load = function(path) {
	//console.error('DEBUG: routes.load(path=' + JSON.stringify(path) + ')' );
	var routes = {};

	// Handle index files
	if(require('fs').existsSync(path+ '/index.js')) {
		routes = require(path + '/index.js');
	}

	require('fs').readdirSync(path).forEach(function(filename) {

		var stat = require('fs').statSync(path + "/" + filename);
		var ext, basename;

		// Skip index files
		if(filename === 'index.js') { return; }

		// Skip hidden files
		if(filename[0] === '.') { return; }

		// Load subdirs
		if(stat.isDirectory()) {
			routes[filename] = mod.load(path + "/" + filename);
			return;
		}

		// Load files
		ext = require('path').extname(filename);
		if(stat.isFile() && (ext === '.js') ) {
			basename = require('path').basename(filename, ext);
			if(routes[basename] !== undefined) {
				console.error('Warning! Duplicate route overriding from ' + path + "/" + filename);
			}
			routes[basename] = require(path + "/" + filename);
			return;
		}

	});

	return routes;
};

/** Setup routes to express */
mod.setup = function(app, routes, target, opts) {
	target = target || '/';
	opts = opts || {};

	var middleware = opts.middleware || [];
	if(!is.array(middleware)) { middleware = [middleware]; }

	debug.assert(middleware).is('array');

	if(!middleware.every(is.func)) {
		throw new TypeError('middleware array contains non-function elements!');
	}

	function do_send(data, req, res, next) {
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
		debug.assert( plugins.every(is.func.bind()) ).equals(true);

		return function(req, res, next) {
			var queue = [].concat(plugins);

			function do_iteration() {
				try {
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
						do_iteration();
					});
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
		return (function the_fixer(req, res, next) {
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
		});
	}

	/* */
	function build_request(handler) {
		debug.assert(handler).is('function');
		return function do_request(req, res, next) {
			try {
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
							do_send(result, req, res, next);
						}
					}).fail(function(err) {
						next(err);
					}).done();
					return;
				// Everything else is sent encoded as JSON with status 200 OK
				} else {
					do_send(ret, req, res, next);
				}
			} catch(err) {
				next(err);
			}
		};
	}

	//console.error('DEBUG: routes.setup(app, routes=' + JSON.stringify(routes, null, 2) + ', target=' + JSON.stringify(target, null, 2) + ')');

	// Setup member handlers
	Object.keys(routes).forEach(function(k) {
		var handler;
		var v = routes[k];
		var v_is_function = is.func(v) ? true : false;
		
		// Special methods
		if(_special_methods.indexOf(k) >= 0) {
			handler = v_is_function ? v : do_send.bind(undefined, v);
			if(middleware.length === 0) {
				app[_express_methods[k]](target, build_request(handler) );
			} else if(k === 'USE') {
				//debug.log('target = ', target);
				//debug.log('k = ', k);
				//debug.log('_express_methods[', k,'] = ', _express_methods[k]);

				app[_express_methods[k]](target, join_plugins( [fix_for_missing_req_route(target, 'use')].concat(middleware).concat([build_request(handler)]) ) );
			} else {
				app[_express_methods[k]](target, fix_for_missing_req_route(target, (''+k).toLowerCase() ), middleware, build_request(handler));
			}
			return;
		}

		// Functions
		var new_target = (target==='/') ? ('/' + k) : (target + '/' + k);
		if(v_is_function) {
			mod.setup(app, {'GET':v}, new_target, opts);

		// Child objects
		} else if(is.obj(v)) {
			mod.setup(app, v, new_target, opts );

		// Other types
		} else {
			mod.setup(app, {'GET':v}, new_target, opts);
		}

	});
};

/* EOF */
