/* Sends static error for all errors it catches */
"use strict";
var debug = require('nor-debug');
var plugins = require('../plugins');

module.exports = function error_handler_static(obj) {
	debug.assert(obj).is('object');

	var send_error_ = plugins.send_error( obj );

	return function error_handler_static_(err, req, res, next) {
		debug.assert(err).is('object');
		debug.assert(req).is('object');
		debug.assert(res).is('object');
		debug.assert(next).is('function');

		send_error_(req, res);
	};
};
/* EOF */
