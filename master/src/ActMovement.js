Character = require("./Character");

function movechar(player, direction) {
	if(player.Room && player.Room.Exits[direction] && player.Room.Exits[direction].Destination && !player.Room.Exits[direction].Flags.Closed) {
		var room = player.Room;
		player.RemoveCharacterFromRoom();
		player.AddCharacterToRoom(room.Exits[direction].Destination);
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