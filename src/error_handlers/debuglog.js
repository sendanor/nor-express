/* Sends error in debug log. If `opts.next` is true, then this error handler continues on next handler always. */
"use strict";
var is = require('nor-is');
var debug = require('nor-debug');
module.exports = function error_handler_debuglog(opts) {
	//debug.log('here');
	opts = opts || {};
	var go_next = !!( opts.next );
	return function error_handler_debuglog_(err, req, res, next) {
		var prefix = '';
		if(req.id) {
			prefix += '[' + req.id + '] ';
		}
		debug.error( ('-- Exception --\n' + (err.stack || (is.obj(err) ? JSON.stringify(err, null, 2) : err)) + '\n----').split('\n').join('\n' + prefix) + '\n' );
		if(go_next) {
			debug.assert(next).is('function');
			next(err);
		}
	};
};
/* EOF */
