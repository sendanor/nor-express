/* Render Route implementation */

"use strict";

//var debug = require('nor-debug');

module.exports = function setup_plugins_render(view, opts) {
	//debug.log('here');
	var f = function plugins_render(req, res) {
		//debug.log('here');
		if(!opts) {
			res.render(view);
		} else {
			res.render(view, opts);
		}
	};
	return f;
};

/* EOF */
