/* Handle standard exception types */
var debug = require('nor-debug');
var plugins = require('../plugins');
var HTTPError = require('../HTTPError.js');
module.exports = function error_handler_standard(opts) {
	opts = opts || {};
	return function(err, req, res, next) {
		if(err instanceof HTTPError) {
			plugins.send_error({'error':''+err.message, 'code':err.code})(req, res);
		} else if (err instanceof URIError){
			plugins.send_error({'error':'Invalid url', 'code': 400} )(req, res);
		} else {
			debug.assert(next).typeOf('function');
			next(err);
		}
	};
};
/* EOF */
