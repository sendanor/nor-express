/* Sendfile Route implementation */

module.exports = function(path, opts) {
	var f = function(req, res) {
		if(!opts) {
			res.sendfile(path);
		} else {
			res.sendfile(path, opts);
		}
	};
	return f;
};

/* EOF */
