/* Handle custom exception types */
"use strict";

var _Q = require('q');
var debug = require('nor-debug');
//var plugins = require('../plugins');
var HTTPError = require('../HTTPError.js');

/** */
function send_error(req, res, code, data) {
	return _Q.when(data).then(function send_error_2(data) {
		res.type('text/html');
		res.send(code, '' + data + '\n' );
	});
}

/** Default template function */
function default_tmpl(params) {
	return [
		'<html>',
		'<head>',
		'<title>Error</title>',
		'</head>',
		'<body>',
		'<h1>' + params.error + '</h1>',
		'<code>',
		JSON.stringify(params),
		'</code>',
		'</body>',
		'</html>'
	].join('\n');
}

/** */
function error_handler(tmpl) {
	return function error_handler_(err, req, res, next) {
		debug.assert(next).is('function');
		_Q.fcall(function error_handler_2() {

			if( req.accepts(['html', 'json']) !== 'html' ) {
				next(err);
				return;
			}

			var request_id = req && req.id || undefined;

			if(err instanceof HTTPError) {
				return send_error(req, res, err.code, tmpl({'error':''+err.message, 'code':err.code, 'request_id': request_id}, req, res));
			}

			if (err instanceof URIError){
				return send_error(req, res, 400, tmpl({'error':'Invalid url', 'code': 400, 'request_id': request_id}, req, res));
			}

			next(err);

		}).fail(function error_handler_failed(err) {
			debug.error('While preparing custom error: ', err);
			debug.assert(next).is('function');
			next(err);
		}).done();
	};
}

module.exports = function error_handler_custom(opts) {
	opts = opts || {};
	var tmpl = opts.template || default_tmpl;
	debug.assert(tmpl).is('function');
	return error_handler(tmpl);
};

/* EOF */
