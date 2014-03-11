/** Session and GET based preview authentication mode */
var debug = require('nor-debug');
var HTTPError = require('../HTTPError.js');
var URL = require('url');

module.exports = function static_session_auth(opts) {
	//debug.log('here');
	return function plugins_static_session_auth(req, res, next) {
		//debug.log('here');
		debug.assert(req.session).is('object');
		debug.assert(req.url).is('string');

		// If the preview mode is already activated in the session, we do not need to check _auth
		if(req.session.testing === true) {
			next();
			return;
		}

		var url = URL.parse(req.url, true) || {};

		var params = url.query || {};
		//debug.log('params = ', params);

		var auth = (''+params._auth).split(':');
		//debug.log('auth = ', auth);

		var username = auth.shift();
		var password = auth.shift();

		//debug.log('username = ', username);
		//debug.log('password = ', password);
			
		//debug.log('opts.username = ', opts.username);
		//debug.log('opts.password = ', opts.password);
			
		debug.assert(opts.username).is('string');
		debug.assert(opts.password).is('string');
		debug.assert(username).is('string');
		debug.assert(password).is('string');

		if( (opts.username === username) && 
		    (opts.password === password) ) {
			req.session.testing = true;
			next();
			return;
		}

		throw new HTTPError(403);

	}; // plugins_static_session_auth
}; // module.exports
