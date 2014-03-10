var util = require('util');     

/* Hijack some standard methods to get information */
module.exports = function() {
	var id = 0;
	return function(req, res, next) {
		['writeContinue' , 'writeHead' , 'setTimeout' , 'setHeader' , 'removeHeader' , 'write' , 'addTrailers' , 'end'].forEach(function(method) {
			debug.inspectMethod(res, method);
		});
		next();
	};
};

/* EOF */
