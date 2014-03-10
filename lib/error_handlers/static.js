/* Sends static error for all errors it catches */
module.exports = function error_handler_static(obj) {
	var plugins = require('../plugins');
	return function(err, req, res, next) {
		plugins.send_error( obj )(req, res);
	};
};
/* EOF */
