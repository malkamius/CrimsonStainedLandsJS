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

	if(player.Room && player.Room.Exits[direction] && player.Room.Exits[direction].Destination && !player.Room.Exits[direction].Flags.Closed) {
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

Character.DoCommands.DoNorth = donorth;
Character.DoCommands.DoEast = doeast;
Character.DoCommands.DoSouth = dosouth;
Character.DoCommands.DoWest = dowest;
Character.DoCommands.DoUp = doup;
Character.DoCommands.DoDown = dodown;

Character.Move = movechar;