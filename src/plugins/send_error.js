
var debug = require('nor-debug');
var is = require('nor-is');

/* Send errors */
module.exports = function send_error(code, obj) {

	//debug.log('here');

	if(is.obj(code) && is.undef(obj)) {
		obj = code;
		code = obj.code || undefined;
	}
	obj = obj || {};
	if(!code) {
		code = 500;
	}
	debug.assert(obj).is('object');
	debug.assert(code).is('number');
	if(!obj.code) {
		obj.code = code;
	}
	if(obj.message) {
		obj.error = ''+obj.message;
		delete obj.message;
	}
	if(!obj.error) {
		obj.error = 'Error '+obj.code;
	}

	return function(req, res) {
		//debug.log('here');
		res.type('application/json');
		res.send(code, JSON.stringify(obj) + '\n' );
	};
};

/* EOF */