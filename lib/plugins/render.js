/* Render Route implementation */

module.exports = function(view, opts) {
	var f = function(req, res) {
		if(!opts) {
			res.render(view);
		} else {
			res.render(view, opts);
		}
	};
	return f;
};

/* EOF */
