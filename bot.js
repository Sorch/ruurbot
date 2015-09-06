"use strict";

let 
	irc = require("./irc"),
	conf = require("./conf"),
	modman = require("./modman");


function Bot() {
	var self = this;
	this._connections = {};
	this._modman = new modman.M();
	this._modman.LoadPlugins();
	this._plugins = this._modman.pl();

	var conn = new irc.Client(conf.server, conf.port, conf.name, conf.groups);
	conn.startTimer = process.uptime();
	this.handleconn(conn);
}

function ytVidId(url) {
	var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
	return (url.match(p)) ? RegExp.$1 : false;
}


Bot.prototype.handleconn = function(conn) {
	var self = this;
	conn.on("connected", function() {
		console.log("connected");
		setTimeout(function() {
			conn.groups.forEach(function(i) {
				console.log("JOINING " + i);
				conn.join(i);
			})
		}, 2000);
	});
	conn.on("join", function(data) {
		var data = JSON.parse(data);
		console.log(data.nick + " Joined " + data.channel);
	});
	conn.on("part", function(data) {
		var data = JSON.parse(data);
		console.log(data.nick + " Left " + data.channel);
	});
	conn.on("msg", function(data) {
		var data = JSON.parse(data);
		console.log(data.nick + " > " + data.channel + " : " + data.msg);
		let msg = data.msg;
		if(msg[0] === "*") {
			let body = msg.slice(1).split(" ");
			let cmd  = body[0];
			let args = body.slice(1).join(" ");
			for (let plugin in self._plugins) {
				if (self._plugins[plugin].OnMessage !== undefined) {
					self._plugins[plugin].OnMessage(conn, data.nick, data.channel, msg, cmd, args);
				}
			}
		}
	});

};

exports.Bot = new Bot();
