/* Overrides `res.render()` to support default from `app.get('layout')` */

var debug = require('nor-debug');

module.exports = function render_with_layout() {
	//debug.log('here');
	return function(req, res, next){
		//debug.log('here');

		debug.assert(req).is('object');
		debug.assert(res).is('object');
		debug.assert(next).is('function');

		var _render = res.render.bind(res);
		res.render = function(name, options, fn){
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
