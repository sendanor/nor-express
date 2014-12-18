/* Standard data sender */

"use strict";

var is = require('nor-is');
var debug = require('nor-debug');
var plugins = require('../plugins');

module.exports = function senders_standard() {
	//debug.log('here');

	function json_sender(data, req, res, next) {
		debug.assert(data).is('object');
		debug.assert(req).is('object');
		debug.assert(res).is('object');
		debug.assert(next).is('function');

		var content;

		if(req.headers['x-pretty-print'] || req.headers['x-pretty-json']) {
			content = JSON.stringify(data, null, 2);
		} else {
			content = JSON.stringify(data);
		}

		if(content) {
			// Only set headers if not sent already and no content-type queued
			if( (!res.headersSent) && (!res.getHeader('content-type')) ) {
				res.set('Content-Type', 'application/json;charset=utf-8');
			}
			res.send(content + '\n');
		}
	}

	function html_sender(data, req, res, next) {
		debug.assert(data).is('string');
		debug.assert(req).is('object');
		debug.assert(res).is('object');
		debug.assert(next).is('function');

		//debug.log('res.headersSent = ', res.headersSent);
		//debug.log('res.getHeader("content-type") = ', res.getHeader('content-type'));

		// Only set headers if not sent already and no content-type queued
		if( (!res.headersSent) && (!res.getHeader('content-type')) ) {
			res.set("Content-Type", "text/html;charset=utf-8");
		}

		res.send(data);
	}

	return function standard_sender(data, req, res, next) {
		//debug.log('here');
		// Send as JSON
		try {

			if(is.obj(data)) {
				return json_sender(data, req, res, next);
			}

			if(is.string(data)) {
				return html_sender(data, req, res, next);
			}

			return json_sender({'$': data}, req, res, next);

		} catch(err) {
			if(req.id) {
				debug.error('['+ req.id +'] ', err);
			} else {
				debug.error(err);
			}
			plugins.send_error({"code":500, "error":"Internal Server Error"})(req, res);
		}
	};
};
/* EOF */
