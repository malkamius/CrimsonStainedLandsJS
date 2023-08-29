//ActInfo = require("./ActInfo");
const Character = require("./Character");
const Combat = require("./Combat");

Commands = {
		"north": Character.DoCommands.DoNorth,
		"east": Character.DoCommands.DoEast,
		"south": Character.DoCommands.DoSouth,
		"west": Character.DoCommands.DoWest,
		"up": Character.DoCommands.DoUp,
		"down": Character.DoCommands.DoDown,
		"open": Character.DoCommands.DoOpen,
		"close": Character.DoCommands.DoClose,
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
		"remove": Character.DoCommands.DoRemove,
		"save": Character.DoCommands.DoSave,
		"who": Character.DoCommands.DoWho,
		"where": Character.DoCommands.DoWhere,
		"skills": Character.DoCommands.DoSkills,
		"kill": Combat.DoKill,
		"flee": Combat.DoFlee,
		"peace": Character.DoCommands.DoPeace,
		"delete": Character.DoCommands.DoDelete
	};

module.exports = Commands;
