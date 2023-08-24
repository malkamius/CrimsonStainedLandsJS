//ActInfo = require("./ActInfo");
Character = require("./Character");
Commands = {
				"north": Character.DoCommands.DoNorth,
				"east": Character.DoCommands.DoEast,
				"south": Character.DoCommands.DoSouth,
				"west": Character.DoCommands.DoWest,
				"up": Character.DoCommands.DoUp,
				"down": Character.DoCommands.DoDown,
				"equipment": Character.DoCommands.DoEquipment,
				"inventory": Character.DoCommands.DoInventory,
				"say": Character.DoCommands.DoSay,
				"quit": Character.DoCommands.DoQuit,
				"help": Character.DoCommands.DoHelp,
				"look": Character.DoCommands.DoLook,
				"exits": Character.DoCommands.DoExits,
				"get": Character.DoCommands.DoGet,
				"drop": Character.DoCommands.DoDrop,
				"wear": Character.DoCommands.DoWear,
				"remove": Character.DoCommands.DoRemove
			};

module.exports = Commands;
