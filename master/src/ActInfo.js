const RoomData = require("./RoomData");
const AreaData = require("./AreaData");
const Character = require("./Character");


function dosay(player, arguments) {
	player.Act("\\y$n" + ` says '${arguments}'\\x\n`, null, null, null, "ToRoom");
	// for (const otherplayer of Player.Players) {
	// 	if (otherplayer.Name !== null && otherplayer != player) {
	// 	  player.Act("\\y$n" + ` says '${arguments}'\\x\n`, otherplayer, null, null, "ToVictim");
	// 	} 
	// }
	player.send(`\\yYou say '${arguments}'\\x\n`);
}

function doquit(player, arguments) {
	player.Act("The form of $n slowly fades away!", null, null, null, "ToRoom");
	player.sendnow("Alas, all good things must come to an end.\n\r");
	player.RemoveCharacterFromRoom();
	player.socket.destroy();
	Player.Players.splice(Player.Players.indexOf(player), 1)
	console.log(`${player.Name} disconnected`)
}

function dohelp(player, arguments, plain = false) {
	//var args = oneargument(str);
	for(var helpkey in AreaData.AllHelps) {
		var help = AreaData.AllHelps[helpkey];
		if(help.VNum.startsWith(arguments) || StringUtility.Includes(help.Keyword, arguments)) {
			if(!plain)
			player.send("--------------------------------------------------------------------------------\n\r");
			player.send((help.Text.startsWith(".")? help.Text.substr(1) : help.Text) + (help.Text.endsWith("\n") || help.Text.endsWith("\r")? "" : "\n\r"));
			if(!plain)
			player.send("--------------------------------------------------------------------------------\n\r\n\r");
		}
	}
}

function dolook(player, arguments, auto) {
	if(player.Room == null) {
		player.send("You are not in a room.\n\r");
	} else if (!arguments || arguments.length == 0 || auto) {
		player.send(`\\c   ${player.Room.Name}\\x\n\r`);
		player.send(`${player.Room.Description}\n\r\n\r`);
		doexits(player, "");
		var items = {};
		for(const item of player.Room.Items){
			var display = item.DisplayToRoom(player);
			if(items[display])
				items[display]++;
			else
				items[display] = 1;
		}
		for(var key in items)
			player.send("   " + (items[key] > 1? ("[" + items[key] + "] ") : "") + key + "\n\r");
		for(const other of player.Room.Characters) {
			if (other != player)
				player.Act(other.GetLongDescription(), other, null, null, "ToChar");
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
			if(player.Room.Exits[i] && player.Room.Exits[i].Destination) {
				if(player.Room.Exits[i].Flags.Closed || player.Room.Exits[i].Flags.Locked) {
					player.send(" [" + RoomData.Directions[i] + "]");
				}
				else {
					player.send(" " + RoomData.Directions[i]);
				}
				anyexits = true;
			}
		}
	}
	if(!anyexits)
		player.send(" none");
	
	player.send("]\\x\n\r");
	
}

function doequipment(player, arguments) {
	player.send("You are wearing: \n\r");
	var anyitems = false;
	for(slot in Character.WearSlots) {
		var wearslot = Character.WearSlots[slot];
		var item = player.Equipment[slot];
		if(item) {
			player.send(wearslot.Slot + " " + item.DisplayFlags(player) + item.Display(player) + "\n\r");
			anyitems = true;
		}
		
	}

	if(!anyitems) player.send("   nothing.\n\r");

}

function doinventory(player, arguments) {
	var items = {};
	player.send("You are carrying:\n\r");
	for(i = 0; i < player.Inventory.length; i++) {
		var item = player.Inventory[i];
		var display = item.DisplayFlags(player) + item.Display(player);
		if(items[display])
			items[display]++;
		else
			items[display] = 1;
	}

	if(Object.keys(items) == 0) {
		player.send("   nothing.\n\r");
	} else {
		for(key in items)
			player.send("   " + (items[key] > 1? "[" + items[key] + "]" : "") + key + "\n\r");
	}
}
Character.DoCommands.DoSay = dosay;
Character.DoCommands.DoQuit = doquit;
Character.DoCommands.DoHelp = dohelp;
Character.DoCommands.DoLook = dolook;
Character.DoCommands.DoExits = doexits;
Character.DoCommands.DoEquipment = doequipment;
Character.DoCommands.DoInventory = doinventory;
// module.exports = { 
					// DoSay: dosay, 
					// DoQuit: doquit,
					// DoHelp: dohelp,
					// DoLook: dolook,
					// DoExits: doexits
				// };
