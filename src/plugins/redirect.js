/* Redirect Route implementation */

"use strict";

//var debug = require('nor-debug');

module.exports = function setup_plugins_redirect(target) {
	//debug.log('here');
	var f = function plugins_redirect(req, res) {
		//debug.log('here');
		res.redirect(target);
	};
	return f;
};

/* EOF */
