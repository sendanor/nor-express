/* HTTP Error implementation */

var util = require('util');

/** Exception type for HTTP errors */
function HTTPError() {
	var args = Array.prototype.slice.call(arguments);
	if(!(this instanceof arguments.callee)) {
		var self = new (arguments.callee);
		return self.apply(self, args);
	}

	var headers, msg, code;
	args.forEach(function(arg) {
		if(typeof arg === 'object') {
			headers = arg;
		}
		if(typeof arg === 'string') {
			msg = arg;
		}
		if(typeof arg === 'number') {
			code = arg;
		}
	});

	code = code || 500;
	msg = msg || (''+code+' '+require('http').STATUS_CODES[code]);
	headers = headers || {};

	Error.call(this);
	Error.captureStackTrace(this, this);
	this.code = code;
	this.message = msg;
	this.headers = headers;
}

util.inherits(HTTPError, Error);
HTTPError.prototype.name = 'HTTP Error';

/** User defineable object for codes */
HTTPError.codes = {};

/* Creates custom exception for our HTTP error 401

	HTTPError.codes[401] = function() {
		var err = new HTTPError(401, 'Tämä sivu vaatii sisäänkirjautumisen', {
			'WWW-Authenticate':'OpenID realm="My Realm"',
			'location':'https://ruokatilaus.fi/signin'
		});
		return err;
	};

*/

/** Create HTTP exception */
HTTPError.create = function(code, msg, headers) {
	return (HTTPError.codes[code] && HTTPError.codes[code](code, msg, headers)) || new HTTPError(code, msg, headers);
};

// Exports
module.exports = HTTPError;

/* EOF */
