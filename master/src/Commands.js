//ActInfo = require("./ActInfo");
const Character = require("./Character");
const Combat = require("./Combat");
ActInfo = require("./ActInfo");
ActMovement = require("./ActMovement");
ActItem = require("./ActItem");
ActWiz = require("./ActWiz");
Commands = {
		"north": {Command: Character.DoCommands.DoNorth, MinimumPosition: "Standing" },
		"east": {Command: Character.DoCommands.DoEast, MinimumPosition: "Standing" },
		"south": {Command: Character.DoCommands.DoSouth, MinimumPosition: "Standing" },
		"west": {Command: Character.DoCommands.DoWest, MinimumPosition: "Standing" },
		"up": {Command: Character.DoCommands.DoUp, MinimumPosition: "Standing" },
		"down": {Command: Character.DoCommands.DoDown, MinimumPosition: "Standing" },
		"open": {Command: Character.DoCommands.DoOpen, MinimumPosition: "Resting" },
		"close": {Command: Character.DoCommands.DoClose, MinimumPosition: "Resting" },
		"equipment": {Command: Character.DoCommands.DoEquipment, MinimumPosition: "Dead" },
		"inventory": {Command: Character.DoCommands.DoInventory, MinimumPosition: "Dead" },
		"say": {Command: Character.DoCommands.DoSay, MinimumPosition: "Resting" },
		"quit": {Command: Character.DoCommands.DoQuit, MinimumPosition: "Resting" },
		"help": {Command: Character.DoCommands.DoHelp, MinimumPosition: "Dead" },
		"look": {Command: Character.DoCommands.DoLook, MinimumPosition: "Resting" },
		"exits": {Command: Character.DoCommands.DoExits, MinimumPosition: "Resting" },
		"get": {Command: Character.DoCommands.DoGet, MinimumPosition: "Resting" },
		"put": {Command: Character.DoCommands.DoPut, MinimumPosition: "Resting" },
		"drop": {Command: Character.DoCommands.DoDrop, MinimumPosition: "Resting" },
		"wear": {Command: Character.DoCommands.DoWear, MinimumPosition: "Resting" },
		"remove": {Command: Character.DoCommands.DoRemove, MinimumPosition: "Resting" },
		"stand": {Command: Character.DoCommands.DoStand, MinimumPosition: "Sleeping" },
		"sleep": {Command: Character.DoCommands.DoSleep, MinimumPosition: "Sleeping" },
		"rest": {Command: Character.DoCommands.DoRest, MinimumPosition: "Sleeping" },
		"sit": {Command: Character.DoCommands.DoSit, MinimumPosition: "Sleeping" },
		"save": {Command: Character.DoCommands.DoSave, MinimumPosition: "Dead" },
		"who": {Command: Character.DoCommands.DoWho, MinimumPosition: "Dead" },
		"where": {Command: Character.DoCommands.DoWhere, MinimumPosition: "Resting" },
		"skills": {Command: Character.DoCommands.DoSkills, MinimumPosition: "Dead" },
		"kill": {Command:Combat.DoKill, MinimumPosition: "Standing" },
		"flee": {Command:Combat.DoFlee, MinimumPosition: "Fighting" },
		"peace": {Command: Character.DoCommands.DoPeace, MinimumPosition: "Resting" },
		"slay": {Command: Character.DoCommands.DoSlay, MinimumPosition: "Standing" },
		"toggle": {Command: Character.DoCommands.DoToggle, MinimumPosition: "Dead" },
		"dirtkick": {Command:Combat.DoDirtKick, MinimumPosition: "Standing" },
		"delete": {Command: Character.DoCommands.DoDelete, MinimumPosition: "Dead" },
	};

module.exports = Commands;
