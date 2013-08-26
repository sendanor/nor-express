/* Redirect Route implementation */

module.exports = function(target) {
	var f = function(req, res) {
		res.redirect(target);
	};
	return f;
};

/* EOF */
