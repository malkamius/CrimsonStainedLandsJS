const Character = require("./Character");
const RoomData = require("./RoomData");
function movechar(player, direction) {
	if (player.Position != "Standing")
	{
		if (player.Position == "Dead")
		{
			player.send("Lie still; you are DEAD.\n\r");
		}
		else if (player.Position == "Incapacitated")
		{
			player.send("You are hurt far too bad for that.\n\r");
		}
		else if (player.Position == "Stunned")
		{
			player.send("You are too stunned to do that.\n\r");
		}
		else if (player.Position == "Resting")
		{
			player.send("Nah... You feel too relaxed...\n\r");
		}
		else if (player.Position == "Sitting")
		{
			player.send("Better stand up first.\n\r");
		}
		else if (player.Position == "Fighting")
		{
			player.send("No way! You are still fighting!\n\r");
		}
		else
		{
			player.send("You aren't in the right position?\n\r");
		}
		return;
	}

	// Check if character is currently in combat
	if (this.Fighting)
	{
		SendToChar("No way! You are still fighting!\n\r");
		return;
	}
	var exit = player.Room.Exits[direction];
	if(player.Room && exit && 
		exit.Destination && 
		(!exit.Flags.Closed || player.AffectedBy.PassDoor)) {
		var sizes = ["Tiny", "Small", "Medium", "Large", "Huge", "Giant"];
		if (sizes.indexOf(this.Size) > sizes.indexOf(exit.ExitSize))
		{
			send("You can't fit.\n\r");
			return;
		}
		var destination = exit.Destination;
		var reversedirections = ["south", "west", "north", "east", "below", "above" ];
		var room = player.Room;
		var directionstring = RoomData.Directions[direction];
		player.Act("$n leaves " + directionstring + ".", null, null, null, "ToRoom");
		player.RemoveCharacterFromRoom();
		player.AddCharacterToRoom(room.Exits[direction].Destination);
		var reversedirection = reversedirections[direction];
		if(reversedirection != "below" && reversedirection != "above")
			player.Act("$n arrives from the " + reversedirection + ".", null, null, null, "ToRoom");
		else
			player.Act("$n arrives from " + reversedirection + ".", null, null, null, "ToRoom");
	}
	else
		player.send("Alas, you cannot go that way.\n\r");
}

function donorth(player, arguments) {
	movechar(player, 0);
}

function doeast(player, arguments) {
	movechar(player, 1);
}

function dosouth(player, arguments) {
	movechar(player, 2);
}

function dowest(player, arguments) {
	movechar(player, 3);
}

function doup(player, arguments) {
	movechar(player, 4);
}

function dodown(player, arguments) {
	movechar(player, 5);
}

function GetExit(character, keyword, count = 0) {
	var number = 0;
	var [number, keyword] = keyword.numberArgument();
	for(var exit of character.Room.Exits) {
		if(exit && (exit.Keywords.IsName(keyword) || exit.Direction.prefix(keyword)) && ++count > number) {
			return [exit, count];
		}
	}
	return [null, count];
}

function DoOpen(character, arguments) {
	var item, count;
	var [exit, count] = GetExit(character, arguments, count);
	var [item, count] = Character.ItemFunctions.GetItemHere(character, arguments, count);
	
	if(exit) {
		if(exit.Flags.Locked) {
			character.Act("{0} is locked.\n\r", null, null, null, "ToChar", exit.Display);
		} else if(!exit.Flags.Closed) {
			character.Act("{0} is not closed.\n\r", null, null, null, "ToChar", exit.Display);
		} else	{
			character.Act("You open {0}.\n\r", null, null, null, "ToChar", exit.Display);
			character.Act("$n opens {0}.", null, null, null, "ToRoom", exit.Display)
			delete exit.Flags.Closed;
		}
	} else if(item) {
		if(item.ExtraFlags.Locked) {
			character.send("It's locked.\n\r");
		} else if(!item.ExtraFlags.Closed) {
			character.send("It's not closed.\n\r")
		} else {
			character.Act("You open $p.\n\r", null, item);
			character.Act("$n opens $p.", null, item, null, "ToRoom")
			delete item.ExtraFlags.Closed;
		}

	} else {
		character.send("You don't see that here.\n\r");
	}
}

function DoClose(character, arguments) {
	var item, count;
	var [exit, count] = GetExit(character, arguments, count);
	var [item, count] = Character.ItemFunctions.GetItemHere(character, arguments, count);
	
	if(exit) {
		if(!exit.Flags.Door) {
			character.Act("{0} can't be closed.\n\r", null, null, null, "ToChar", exit.Display);
		} else if(exit.Flags.Closed) {
			character.Act("{0} is already closed.\n\r", null, null, null, "ToChar", exit.Display);
		} else {
			character.send("You close {0}.\n\r", exit.Display);
			character.Act("$n closes {0}.", null, null, null, "ToRoom", exit.Display)
			exit.Flags.Closed = true;
		}
	} else if(item) {
		if(!item.ExtraFlags.Closable) {
			character.Act("$p can't be closed.\n\r", null, item);
		} else if(item.ExtraFlags.Closed) {
			character.Act("$p is already closed.\n\r", null, item);
		} else {
			character.Act("You close $p.\n\r", null, item);
			character.Act("$n closes $p.", null, item, null, "ToRoom")
			item.ExtraFlags.Closed = true;
		}
	}  else {
		character.send("You don't see that here.\n\r");
	}
	
}
Character.DoCommands.DoNorth = donorth;
Character.DoCommands.DoEast = doeast;
Character.DoCommands.DoSouth = dosouth;
Character.DoCommands.DoWest = dowest;
Character.DoCommands.DoUp = doup;
Character.DoCommands.DoDown = dodown;
Character.DoCommands.DoOpen = DoOpen;
Character.DoCommands.DoClose = DoClose;
Character.Move = movechar;