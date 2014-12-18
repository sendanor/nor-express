/* Hijack some standard methods to get information */
"use strict";

var debug = require('nor-debug');
//var util = require('util');

module.exports = function() {
	//debug.log('here');
	//var id = 0;
	return function(req, res, next) {
		//debug.log('here');
		['writeContinue' , 'writeHead' , 'setTimeout' , 'setHeader' , 'removeHeader' , 'write' , 'addTrailers' , 'end'].forEach(function(method) {
			debug.inspectMethod(res, method);
		});
		next();
	};
};

/* EOF */
