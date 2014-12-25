/* Sendfile Route implementation */

"use strict";
//var debug = require('nor-debug');

module.exports = function plugins_sendfile(path, opts) {
	//debug.log('here');
	var f = function sendfile(req, res) {
		//debug.log('here');
		if(!opts) {
			res.sendfile(path);
		} else {
			res.sendfile(path, opts);
		}
	};
	return f;
};

/* EOF */
