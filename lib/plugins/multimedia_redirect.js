/* Hijack `res.redirect()` with better implementation which has support for JSON etc. */
module.exports = function(opts) {
	opts = opts || {};
	return function(req, res, next){

		var escapeHtml = require('escape-html');
		var statusCodes = require('http').STATUS_CODES;

		/* This function is originally from visionmedia/express's lib/response.js:664. It has extended support for JSON reply and content has line break. */
		res.redirect = function(url){
			var head = 'HEAD' == this.req.method
				, status = 302
				, body;
		
			// allow status / url
			if (2 == arguments.length) {
				if ('number' == typeof url) {
					status = url;
					url = arguments[1];
				} else {
					status = arguments[1];
				}
			}
			
			// Set location header
			this.location(url);
			url = this.get('Location');
			
			// Support text/{plain,html} by default
			this.format({
				text: function(){
					body = statusCodes[status] + '. Redirecting to ' + encodeURI(url) + '\n';
				},
				
				json: function(){
					body = JSON.stringify({"code": status, "status": statusCodes[status], "url": url}) + '\n';
				},
				
				html: function(){
					var u = escapeHtml(url);
					body = '<p>' + statusCodes[status] + '. Redirecting to <a href="' + u + '">' + u + '</a></p>\n';
				},
				
				default: function(){
					body = '';
				}
			});
			
			// Respond
			this.statusCode = status;
			this.set('Content-Length', Buffer.byteLength(body));
			this.end(head ? null : body);
		};
		
		next();
	};
};
/* EOF */
