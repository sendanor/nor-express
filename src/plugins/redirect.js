/* Redirect Route implementation */

"use strict";

//var debug = require('nor-debug');

module.exports = function(target) {
	//debug.log('here');
	var f = function(req, res) {
		//debug.log('here');
		res.redirect(target);
	};
	return f;
};

/* EOF */
