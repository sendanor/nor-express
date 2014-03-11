/* Sends error in debug log. If `opts.next` is true, then this error handler continues on next handler always. */
var debug = require('nor-debug');
module.exports = function error_handler_debuglog(opts) {
	//debug.log('here');

	opts = opts || {};
	var go_next = opts.next || false;
	return function(err, req, res, next) {
		debug.log('-- Exception --\n' + (err.stack || err) + '\n----\n' );
		debug.assert(next).typeOf('function');
		if(go_next) {
			next(err);
		}
	};
};
/* EOF */
