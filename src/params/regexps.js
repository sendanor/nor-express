/* Enable regular expression support */

"use strict";

function param_regexp_support_(name, fn){
	//debug.log('here');

	if (!(fn instanceof RegExp)) {
		return;
	}

	return function param_regexp_support_request(req, res, next, val){
		var captures;
		captures = fn.exec(''+val);
		if (captures) {
			req.params[name] = (captures.length === 1) ? captures.shift() : captures;
			next();
		} else {
			next('route');
		}
	};
}

module.exports = function param_regexp_support() {
	return param_regexp_support_;
};

/* EOF */
