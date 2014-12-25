/* Overrides `res.render()` to support default from `app.get('layout')` */

"use strict";

var debug = require('nor-debug');
var FUNCTION = require('nor-function');

module.exports = function setup_render_with_layout() {
	//debug.log('here');
	return function render_with_layout(req, res, next){
		//debug.log('here');

		debug.assert(req).is('object');
		debug.assert(res).is('object');
		debug.assert(next).is('function');

		var _render = FUNCTION(res.render).bind(res);
		res.render = function render_with_layout_setup(name, options, fn){
			options = options || {};
			if(typeof options.layout === 'undefined') {
				options.layout = res.app.get('layout');
			}
			options.layout = 'layouts/' + options.layout + '/index.ejs';
			_render(name, options, fn);
		};

		next();
	};
};

/* EOF */
