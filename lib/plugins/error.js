/* Redirect Route implementation */

var prettified = require('prettified');
var http = require('http');
var HTTPError = require('../HTTPError.js');

module.exports = function(err) {
	prettified.errors.print(err);
	var f = function(req, res) {
		try {
			if(err instanceof HTTPError) {
				res.status(err.code);
				Object.keys(err.headers).forEach(function(key) {
					res.header(key, err.headers[key]);
				});
				res.render('error', {'message':err.message});
			} else {
				res.status(500);
				res.render('error', {'message':'Pahus, virhe tapahtui!'});
			}
		} catch (err2) {
			prettified.errors.print(err2);
			res.send('Odottamaton virhe tapahtui!');
		}
	};

	/*
	code = code || 500;
	msg = msg || http.STATUS_CODES[code] || 'Internal Server Error';
	var f = function(req, res) {
		prettified.errors.print(err); // FIXME: preffified failing to print stderr correctly
		// FIXME: Implement better error for browser
		res.send(code, msg);
	};
	*/

	return f;
};

/* EOF */
