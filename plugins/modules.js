"use strict";

var bot = require("../bot");

function OnMessage(conn, nick, channel, msg, cmd, args) {
	if(cmd == "modules") {
		var plugs = bot.Bot._modman.getPlugins();
		var ret = plugs.join(", ");
		var outret = "Plugins(" + plugs.length.toString() + ") " + ret;
		conn._msg(channel, outret);
	}
	if(cmd == "load") {
		var mod = args;
		var modman = bot.Bot._modman;
		if(modman.isLoaded(mod)) {
			var ret = "This module is already loaded!";
		} else if(modman.load(mod)) {
			ret = "Loaded \\o/";
		} else {
			ret = "The module doesn't exist in the plugins folder";
		}
		conn._msg(channel, ret);
	
	}

	if(cmd == "reload") {
		var mod = args;
		var modman = bot.Bot._modman;
		if(modman.reload(mod)) {
			var ret = "Reloaded module";
		} else {
			var ret = "Module failed to reload x-x";
		}
		conn._msg(channel, ret);
	}

	if(cmd == "unload") {
		var modman = bot.Bot._modman;
		if(modman.isLoaded(args)) {
			modman.unload(args);
			var ret = "Module unloaded";
		} else {
			var ret = "Module isn\'t loaded or doesn\'t exist";
		}
		conn._msg(channel, ret);
	}
}


	
exports.OnMessage = OnMessage;
