/* Standard data sender */
module.exports = function senders_standard() {
	return function json_sender(data, req, res, next) {
		// Send as JSON
		try {
			debug.assert(data).is('object');
			var content;

			if(req.headers['x-pretty-print'] || req.headers['x-pretty-json']) {
				content = JSON.stringify(data, null, 2);
			} else {
				content = JSON.stringify(data);
			}

			if(content) {
				res.type('application/json');
				res.send(content + '\n');
			}
		} catch(err) {
			debug.error(err);
			nor_express.plugins.send_error({"code":500, "error":"Internal Server Error"})(req, res);
		}
	};
};
/* EOF */
