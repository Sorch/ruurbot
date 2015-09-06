var fs = require("fs");
var vm = require("vm");
var resolve = require('resolve');
var _ = require("underscore");

function M() {
	this.pluginslist = {};

}

M.prototype.LoadPlugins = function() {
	var self = this;
	var pluginsDir = fs.readdirSync("./plugins");
	pluginsDir.forEach(function(file) {
		self.pluginslist[file] = require("./plugins/"+ file);
	});
}

M.prototype.pl = function() {
	return this.pluginslist;
}

M.prototype.load = function(mod) {
	var mod = mod.replace(/\.js$/i, "");
	var self = this;
	var mod = mod + ".js";
	if (fs.existsSync("./plugins/"+ mod)) {
		var file = "./plugins/" + mod;
		self.pluginslist[mod] = require("./plugins/"+ mod);
		return true;
	} else {
		return false;
	}
}

M.prototype.reload = function(mod) {
	var mod = mod.replace(/\.js$/i, "");
	if (fs.existsSync("./plugins/"+ mod + ".js")) {
		this.unload(mod);
		var path = resolve.sync("./plugins/"+ mod + ".js");
		if (require.cache[path]){
			delete require.cache[path];
		}
		return this.load(mod);
	} else {
		return false;
	}
};

M.prototype.unload = function(mod) {
	var mod = mod.replace(/\.js$/i, "");
	var mod = mod + ".js";
	if(this.pluginslist.hasOwnProperty(mod)) {
		delete this.pluginslist[mod];
		return true;
	}
	else {
		return false;
	}
};

M.prototype.isLoaded = function(mod) {
	var mod = mod.replace(/\.js$/i, "");
	var mod = mod + ".js";
	if(this.pluginslist.hasOwnProperty(mod)) {
		return true;
	}
	else {
		return false;
	}
};


M.prototype.getPlugins = function() {
	return _.keys(this.pluginslist);
}

exports.M = M;
