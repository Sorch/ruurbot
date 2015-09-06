"use strict";

let 
	humanize = require("humanize"),
	request = require("request"),
	Q = require("q");



function fml() {
	var deferred = Q.defer();
	request("http://rscript.org/lookup.php?type=fml", function(error, res, body) {
		if(!error && res.statusCode == 200) {
			var what = body.replace('<pre>', '');
			var what = what.split('\n');
			if(what.indexOf('') >= 0) {
				what.splice(what.indexOf(''), 1);
			}
			var id = what[1].split(" ")[1];
			var text = what[3].split(" ").join(" ").replace("TEXT:", '');
			var agree = what[4].split(" ")[1];
			var dagree = what[5].split(" ")[1];
			var ret = '(#' + id + ')' + ' ' + text + '  Agreed ' + agree +  ' Disagreed ' + dagree;
			deferred.resolve(ret);
		}
		else {
			deferred.reject(error);
		}
	})
 	return deferred.promise;
};
function MakeBold(args) {
	return "\x02" + args + "\x0f";
}

function OnMessage(conn, nick, channel, msg, cmd, args) {
	if(cmd == "say") {
		if(["!", "/", ';', '`'].indexOf(args[0]) > -1) {
			//
		} else {
			conn._msg(channel, args);
		}
	}
	if(cmd == "gfml") {
		fml().then(function(f) {
			conn._msg(channel, f);
		})
	}
	if(cmd == "human-number") {
		if(isNaN(args)) {
			var ret = "You should give me a number to use " + nick + ".";
			conn._msg(channel, ret);
		} else{
			var ret = humanize.intword(args);
			conn._msg(channel, ret);
		}
	}
	if(cmd == "rt") {
		var stamp = process.uptime();
		var now = Math.floor(Date.now() / 1000);
		var ret = humanize.relativeTime(now - stamp);
		var pretty = "I was started " + MakeBold(ret);
		conn._msg(channel, pretty);
	}
	if(cmd == "whoami") { 
		var ret = "You are " + nick + " and this is " + channel + " :o";
		conn._msg(channel, ret);
	}
}
exports.OnMessage = OnMessage;
