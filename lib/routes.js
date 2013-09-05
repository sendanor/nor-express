/* Express Routes implementation */

var mod = module.exports = {};

/* Setup helper objects */

var _express_methods = {
	'ALL':'all'
};

require('methods').forEach(function(method) {
	_express_methods[method.toUpperCase()] = method;
});

var _special_methods = Object.keys(_express_methods);

/** Load routes from filesystem directory */
mod.load = function(path) {
	console.error('DEBUG: routes.load(path=' + JSON.stringify(path) + ')' );
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
mod.setup = function(app, routes, target) {
	target = target || '/';

	console.error('DEBUG: routes.setup(app, routes=' + JSON.stringify(routes, null, 2) + ', target=' + JSON.stringify(target, null, 2) + ')');

	// Setup member handlers
	Object.keys(routes).forEach(function(k) {
		var v = routes[k];
		
		//console.error('DEBUG: routes.setup(app, routes=' + JSON.stringify(routes, null, 2) + ', target=' + JSON.stringify(target, null, 2) + ') in loop with k=' + JSON.stringify(k) 
		//	+', v=' + JSON.stringify(v) );

		// Special methods
		if(_special_methods.indexOf(k) >= 0) {
			if(v && ('function' === typeof v) ) {
				//console.error('DEBUG: app['+_express_methods[k]+']('+target+', '+v+');');
				app[_express_methods[k]](target, v);
			} else {
				//console.error('DEBUG: app['+_express_methods[k]+']('+target+', builtin);');
				app[_express_methods[k]](target, function(req, res) {
					res.send(v);
				});
			}
			return;
		}

		// Functions
		var new_target = (target==='/') ? ('/' + k) : (target + '/' + k);
		if( v && ('function' === typeof v) ) {
			mod.setup(app, {'GET':v}, new_target);

		// Child objects
		} else if( v && ('object' === typeof v) ) {
			mod.setup(app, v, new_target );

		// Other types
		} else {
			mod.setup(app, {'GET':v}, new_target);
		}

	});
};

/* EOF */
