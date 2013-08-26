/* Render Route implementation */

module.exports = function(view, opts) {
	var f = function(req, res) {
		res.render(view, opts);
	};
	return f;
};

/* EOF */
