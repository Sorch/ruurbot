"use strict";

let
	net = require('net'),
	_ = require("underscore"),
	utils = require('util'),
	events = require('events');

utils.inherits(Client, events.EventEmitter);
function Client(host, port, name, groups) {
	this.host = host;
	this.port = port;
	this.name = name;
	this.groups = groups || [];
	this.listeners = [];
	this.socket = new net.Socket();
	let self = this;
	this._connections = {};
	this.userlist = {};
	this._connect();
	this._handle();
};

Client.prototype._connect = function() {
	let self = this;
	self.socket.setEncoding('utf-8');
	self.socket.setNoDelay();
	self.socket.connect(self.port , self.host);
}

Client.prototype._send = function(data) {
	let self = this;
	self.socket.write(data + '\n', 'utf8', function() {} );
};


Client.prototype._msg = function(chan, msg) {
	var ret = "PRIVMSG " + chan + " :" + msg;
	this._send(ret);
}

Client.prototype._notice = function(user, msg) {
	var ret = "NOTICE " + user + " :" + msg;
	this._send(ret);
}


Client.prototype.join = function(chan) {
	this.socket.write("JOIN " + chan + "\r\n");
}

Client.prototype.part = function(chan) {
	this.socket.write("PART " + chan + "\r\n");
}

Client.prototype._handle = function() {
	var self = this;
	this.socket.on('connect', function() {
		self.emit("connected");
		self._on(/^PING :(.+)$/i, function(info) {
			self._send('PONG :' + info[1]);
		});

		self._on(/^(?:[:](\S+) )?(\S+)(?: (?!:)(.+?))?(?: [:](.+))?$/i, function(info) {
			if(info[2] == "353") {
				var chan = info[3].split(/[=@]/)[1].replace(/ /g,'');
				var users = info[4].trim().split(/ +/);
				self.userlist[chan] = [];
				users.forEach(function(user) {
					var m = user.match(/^(.)(.*)$/);
					if(m) {
						var modes = ["~", "+", "&", "%", "@"];
						if(modes.indexOf(m[1]) > -1) {
							var usern = m[2];
						} else {
							var usern = m[0];
						}
						self.userlist[chan].push(usern);
					}
				});
				var data = JSON.stringify({"channel": chan, "users": self.userlist[chan]});
				self.emit("userlist", data)
			}


			if(info[2] == "PRIVMSG") {
				var hostmask = info[0].split(/[!@]/);
				var who = hostmask[0].replace(":", "");
				var msg = info[4];
				var channel = info[3];
				var data = JSON.stringify({"nick": who, "channel": channel, "msg": msg, "hostmask": hostmask});
				self.emit("msg" , data);
			}

			if(info[2] == "JOIN") {
				var hostmask = info[0].split(/[!@]/);
				var who = hostmask[0].replace(":", "");
				var chan = info[4];
				//and of course now we join em
				if(who != self.name) {
					if(self.userlist[chan].indexOf(who) === -1) {
						self.userlist[chan].push(who);
					}
				}
				var data = JSON.stringify({"nick": who, "channel": chan, "hostmask": hostmask});
				self.emit("join" , data);
			}

			if(info[2] == "PART") {
				var hostmask = info[0].split(/[!@]/);
				var who = hostmask[0].replace(":", "");
				var chan = info[3];
				//here comes the userlist removal crap...
				if(self.userlist[chan].indexOf(who) > 0) {
					_.without(self.userlist[chan], who);
				}
				var data = JSON.stringify({"nick": who, "channel": chan, "hostmask": hostmask});
				self.emit("part" , data);
			}

		})
		self._send('NICK ' + self.name);
		self._send('USER ' + self.name + ' 8 * :' + "oh lol");
	});
	this.socket.on("data", function(data) {
		data = data.split('\n');
		for (var i = 0; i < data.length; i++) {
			if (data !== '') {
				self.handledata(data[i].slice(0, -1));
			}
		}
	});
};
Client.prototype.handledata = function(data) {
	var self = this;
	var i, info;
	for (i = 0; i < self.listeners.length; i++) {
		var info = self.listeners[i][0].exec(data);
		if(info) {
			self.listeners[i][1](info, data);
			if (self.listeners[i][2]) {
				self.listeners.splice(i, 1);
			}
		}
	}

}
Client.prototype._on = function(data, cb) {
	var self = this;
	this.listeners.push([data, cb, false]);
}
exports.Client = Client
