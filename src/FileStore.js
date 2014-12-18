
/**
 * Module dependencies.
 */

"use strict";

/* FIXME: update expiration so that the session does not expire when user is using the system! */

var util = require('util');
var fs = require('nor-fs');

module.exports = function(connect) {
	
	var Store = connect.session.Store;
	
	function FileStore(options) {
		options = options || {};
		Store.call(this, options);
		this.session_dir = options.session_dir || './sessions';
	}
	
	FileStore.prototype.__proto__ = Store.prototype;
	
	FileStore.prototype.get = function(sid, callback) {
		var self = this;
		try {
			fs.readFile(self.session_dir + '/sess-' + sid + '.json', {'encoding':'utf8'}).then(function(data) {
				if(!data) { throw new TypeError('Failed to read: ' + self.session_dir + '/sess-' + sid + '.json'); }
				callback(null, JSON.parse(data) );
			}).fail(function(err) {
				callback(err);
			}).done();
		} catch(e) {
			callback(e);
		}
	};
	
	FileStore.prototype.set = function(sid, session, callback) {
		var self = this;
		try {
			/*
			var maxAge = session.cookie.maxAge,
			    oneDay = 86400,
				ttl = ('number' == typeof maxAge) ? (maxAge / 1000 | 0) : oneDay;
			*/

			if(typeof callback !== 'function') {
				callback = function(err) {
					console.error('Error: ' + util.inspect(err) );
				};
			}

			var tmpkey = Math.random().toString(36).slice(2);
			var sess_file = self.session_dir + '/sess-' + sid + '.json';
			var tmp_sess_file = self.session_dir + '/sess-' + sid + '-' + tmpkey + '.json';

			fs.writeFile(tmp_sess_file, JSON.stringify(session), {'encoding':'utf8'})
			  .$rename(tmp_sess_file, sess_file)
			  .then(function() {
				callback();
			}).fail(function(err) {
				callback(err);
			}).done();
		} catch(e) {
			if(callback) {
				callback(e);
			} else {
				console.error('Error: ' + util.inspect(e) );
			}
		}
	};
	
	FileStore.prototype.destroy = function(sid, callback) {
		var self = this;
		if(typeof callback !== 'function') {
			callback = function(err) {
				console.error('Error: ' + util.inspect(err) );
			};
		}
		fs.unlinkIfExists(self.session_dir + '/sess-' + sid + '.json').then(function() {
			callback();
		}).fail(function(err) {
			callback(err);
		}).done();
	};
	
	/*
	FileStore.prototype.length = function(fn){
		this.client.dbsize(fn);
	};

	FileStore.prototype.clear = function(fn){
		this.client.flushdb(fn);
	};
	*/
	
	return FileStore;
};

/* EOF */
