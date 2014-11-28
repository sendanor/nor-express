/* Enable regular expression support */
var debug = require('nor-debug');
module.exports = function param_regexp_support() {
	//debug.log('here');
	return function(name, fn){
		//debug.log('here');
        if (fn instanceof RegExp) {
            return function(req, res, next, val){
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
    };
};
/* EOF */
