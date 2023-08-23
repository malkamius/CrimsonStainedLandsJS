//ActInfo = require("./ActInfo");
Character = require("./Character");
Commands = {
				"north": Character.DoCommands.DoNorth,
				"east": Character.DoCommands.DoEast,
				"south": Character.DoCommands.DoSouth,
				"west": Character.DoCommands.DoWest,
				"up": Character.DoCommands.DoUp,
				"down": Character.DoCommands.DoDown,
				"say": Character.DoCommands.DoSay,
				"quit": Character.DoCommands.DoQuit,
				"help": Character.DoCommands.DoHelp,
				"look": Character.DoCommands.DoLook,
				"exits": Character.DoCommands.DoExits
			};

module.exports = Commands;
