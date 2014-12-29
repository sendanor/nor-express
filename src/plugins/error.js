/* Redirect Route implementation */

"use strict";

//var debug = require('nor-debug');
var ARRAY = require('nor-array');
var prettified = require('prettified');
//var http = require('http');
var HTTPError = require('../HTTPError.js');

module.exports = function plugins_error(err) {

	function plugins_error_request_(req, res) {
		if(err instanceof HTTPError) {
			res.status(err.code);
			ARRAY(Object.keys(err.headers)).forEach(function(key) {
				res.header(key, err.headers[key]);
			});
			res.render('error', {'message':err.message});
		} else {
			prettified.errors.print(err);
			res.status(500);
			res.render('error', {'message':'Internal Server Error'});
		}
	}

	var f = function plugins_error_request(req, res) {
		try {
			plugins_error_request_(req, res);
		} catch (err2) {
			prettified.errors.print(err2);
			res.send('Unexpected error!');
		}
	};

	return f;
};

/* EOF */
