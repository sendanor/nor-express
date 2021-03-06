/** Create unique idenfitied (UUID v4) and set it to `request.id` and for response as HTTP header `Request-ID`. */

"use strict";

//var _Q = require('q');
var uuid = require('node-uuid');
var debug = require('nor-debug');

module.exports = function setup_request_id(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	var f = function request_id(req, res, next) {
		debug.assert(req.id).is('undefined');
		req.id = uuid.v4();
		res.setHeader("Request-ID", req.id);
		next();
	};
	return f;
};

/* EOF */
