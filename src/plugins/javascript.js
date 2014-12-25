/*
 * Parse JavaScript request bodies, providing the parsed JavaScript function as req.body.
 *
 * Originally from http://www.senchalabs.org/connect/json.html
 *
 * (The MIT License)
 *
 * Copyright (c) 2010 Sencha Inc.
 * Copyright (c) 2011 LearnBoost
 * Copyright (c) 2011-2014 TJ Holowaychuk
 * Copyright (c) 2014 Jaakko-Heikki Heusala <jheusala@iki.fi>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

"use strict";

/**
 * Module dependencies.
 */

var utils = require('connect').utils;
var getBody = require('raw-body');
var FUNCTION = require('nor-function');

/**
 * JavaScript:
 *
 * Parse JavaScript function request bodies, providing the
 * parsed function as `req.body`.
 *
 * Options:
 *
 *   - `strict`  when `false` anything `require('nor-function').parse()` accepts will be parsed
 *   - `limit`  byte limit [1mb]
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function plugin_javascript(options){
	options = options || {};
	var strict = options.strict !== false;
	var verify = typeof options.verify === 'function' && options.verify;

	return function javascript(req, res, next) {
		if (req._body) {
			return next();
		}
		req.body = req.body || {};

		if (!utils.hasBody(req)) {
			return next();
		}

		// check Content-Type
		if (!exports.regexp.test(utils.mime(req))) {
			return next();
		}

		// flag as parsed
		req._body = true;

		// parse
		getBody(req, {
			limit: options.limit || '1mb',
			length: req.headers['content-length'],
			encoding: 'utf8'
		}, function (err, buf) {
			if (err) {
				return next(err);
			}

			if (verify) {
				try {
					verify(req, res, buf);
				} catch (err) {
					if (!err.status) {
						err.status = 403;
					}
					return next(err);
				}
			}

			var first = buf.trim().substr(0, 'function'.length);

			if (0 === buf.length) {
				return next(utils.error(400, 'invalid javascript, empty body'));
			}

			if (strict && ('function' !== first)) {
				return next(utils.error(400, 'invalid javascript'));
			}

			try {
				req.body = FUNCTION.parse(buf);
			} catch (err){
				err.body = buf;
				err.status = 400;
				return next(err);
			}
			next();
		});
	};
};

exports.regexp = /^(application|text)\/([\w!#\$%&\*`\-\.\^~]*\+)?javascript$/i;
