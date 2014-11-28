/** Assert helpers */

"use strict";

var debug = require('nor-debug');
var our_assert = module.exports = {};

/** Asserts that the `req` and `res` are OK */
our_assert.handlers = function assert_handlers(req, res) {
	debug.assert(req).typeOf('object');
	debug.assert(res).typeOf('object');
};

/* EOF */
