Character = require("./Character");

function dosay(player, arguments) {
	for (const otherplayer of Player.Players) {
		if (otherplayer.name !== null && otherplayer != player) {
		  player.Act("\\y$n" + ` says '${arguments}'\\x\n`, otherplayer, null, null, "ToVictim");
		} 
	}
	player.send(`\\yYou say '${arguments}'\\x\n`);
}

function doquit(player, arguments) {
	player.sendnow("Alas, all good things must come to an end.\n\r");
	player.RemoveCharacterFromRoom();
	player.socket.destroy();
	Player.Players.splice(Player.Players.indexOf(player), 1)
	console.log(`${player.name} disconnected`)
  
	//broadcastMessage(player.socket, `The form of ${player.name} slowly fades away!`)
}

function dohelp(player, arguments, plain = false) {
	//var args = oneargument(str);
	for(var helpkey in areas.helps) {
		var help = areas.helps[helpkey];
		if(help.vnum.startsWith(arguments) || StringUtility.Includes(help.keyword, arguments)) {
			if(!plain)
			player.send("--------------------------------------------------------------------------------\n\r");
			player.send((help.text.startsWith(".")? help.text.substr(1) : help.text) + (help.text.endsWith("\n") || help.text.endsWith("\r")? "" : "\n\r"));
			if(!plain)
			player.send("--------------------------------------------------------------------------------\n\r\n\r");
		}
	}
}

function dolook(player, arguments, auto) {
	if(player.Room == null) {
		player.send("You are not in a room.\n\r");
	} else if (!arguments || arguments.length == 0 || auto) {
		player.send(`\\c   ${player.Room.name}\\x\n\r`);
		player.send(`${player.Room.description}\n\r\n\r`);
		doexits(player, "");
		for(const other of player.Room.Characters) {
			if (other != player)
				player.Act(other.LongDescription && other.LongDescription.length > 0?
					other.LongDescription :
					"$N is standing here.\n\r", other, null, null, "ToChar");
		}
	} else {
		player.send("You can't do that yet.\n\r");
	}
}

function doexits(player, arguments) {
	var anyexits = false;
	player.send("\\g[Exits");
	if(player.Room) {	
		for(var i = 0; i < 6; i++) {
			if(player.Room.exits[i] && player.Room.exits[i].destination) {
				player.send(" " + RoomData.Directions[i]);
				anyexits = true;
			}
		}
	}
	if(!anyexits)
		player.send(" none");
	
	player.send("]\\x\n\r");
	
}
Character.DoCommands.DoSay = dosay;
Character.DoCommands.DoQuit = doquit;
Character.DoCommands.DoHelp = dohelp;
Character.DoCommands.DoLook = dolook;
Character.DoCommands.DoExits = doexits;
// module.exports = { 
					// DoSay: dosay, 
					// DoQuit: doquit,
					// DoHelp: dohelp,
					// DoLook: dolook,
					// DoExits: doexits
				// };
