/* Hijack some standard methods to get information */
"use strict";

var debug = require('nor-debug');
var ARRAY = require('nor-array');

module.exports = function setup_inspect_methods() {
	return function inspect_methods(req, res, next) {
		ARRAY(['writeContinue' , 'writeHead' , 'setTimeout' , 'setHeader' , 'removeHeader' , 'write' , 'addTrailers' , 'end']).forEach(function(method) {
			debug.inspectMethod(res, method);
		});
		next();
	};
};

/* EOF */
