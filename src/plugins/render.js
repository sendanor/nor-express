/* Render Route implementation */

var debug = require('nor-debug');

module.exports = function(view, opts) {
	//debug.log('here');
	var f = function(req, res) {
		//debug.log('here');
		if(!opts) {
			res.render(view);
		} else {
			res.render(view, opts);
		}
	};
	return f;
};

/* EOF */
