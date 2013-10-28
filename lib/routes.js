/* Express Routes implementation */

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
		if(filename === 'index.js') return;

		// Skip hidden files
		if(filename[0] === '.') return;

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

	function do_send(data, req, res, next) {
		if(opts.sender && (typeof opts.sender === 'function') ) {
			opts.sender(data, req, res, next);
		} else {
			res.send(data);
		}
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
			app[_express_methods[k]](target, function(req, res, next) {
				try {
					var ret = handler(req, res, next);
					
					// Handle undefined result -- do nothing
					if(ret === undefined) {
						return;
					// Handle promises
					} else if(is.obj(ret) && is.func(ret.then)) {
						ret.then(function(result) {
							do_send(result, req, res, next);
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
			});
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
