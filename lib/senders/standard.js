/* Standard data sender */

var debug = require('nor-debug');
var plugins = require('../plugins');

module.exports = function senders_standard() {
	//debug.log('here');
	return function json_sender(data, req, res, next) {
		//debug.log('here');
		// Send as JSON
		try {
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
		} catch(err) {
			debug.error(err);
			plugins.send_error({"code":500, "error":"Internal Server Error"})(req, res);
		}
	};
};
/* EOF */
