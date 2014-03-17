/* Standard data sender */

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
			res.set('content-type', 'application/json;charset=utf-8');
			res.send(content + '\n');
		}
	}

	function html_sender(data, req, res, next) {
		debug.assert(data).is('string');
		debug.assert(req).is('object');
		debug.assert(res).is('object');
		debug.assert(next).is('function');
		res.setHeader("Content-Type", "text/html; charset=utf-8");
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
			debug.error(err);
			plugins.send_error({"code":500, "error":"Internal Server Error"})(req, res);
		}
	};
};
/* EOF */
