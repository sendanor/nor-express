/* Sends static error for all errors it catches */
var debug = require('nor-debug');
var plugins = require('../plugins');
module.exports = function error_handler_static(obj) {
	//debug.log('here');
	return function(err, req, res, next) {
		//debug.log('here');
		plugins.send_error( obj )(req, res);
	};
};
/* EOF */
