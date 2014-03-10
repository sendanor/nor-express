/* Enable regular expression support */
module.exports = function param_regexp_support() {
	return function(name, fn){
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
