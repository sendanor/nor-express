/* Overrides `res.render()` to support default from `app.get('layout')` */
module.exports = function render_with_layout() {
	return function(req,res,next){
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
