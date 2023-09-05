//ActInfo = require("./ActInfo");
const Character = require("./Character");
const Combat = require("./Combat");
const Magic = require("./Magic");
const Dueling = require("./Dueling");

Commands = {
		"north": {Command: Character.DoCommands.DoNorth, MinimumPosition: "Standing" },
		"east": {Command: Character.DoCommands.DoEast, MinimumPosition: "Standing" },
		"south": {Command: Character.DoCommands.DoSouth, MinimumPosition: "Standing" },
		"west": {Command: Character.DoCommands.DoWest, MinimumPosition: "Standing" },
		"up": {Command: Character.DoCommands.DoUp, MinimumPosition: "Standing" },
		"down": {Command: Character.DoCommands.DoDown, MinimumPosition: "Standing" },
		"open": {Command: Character.DoCommands.DoOpen, MinimumPosition: "Resting" },
		
		"cast": {Command: Magic.DoCast, MinimumPosition: "Fighting" },
		"commune": {Command: Magic.DoCommune, MinimumPosition: "Fighting" },
		"close": {Command: Character.DoCommands.DoClose, MinimumPosition: "Resting" },
		"crawl": {Command: Character.DoCommands.DoCrawl, MinimumPosition: "Standing" },
		"equipment": {Command: Character.DoCommands.DoEquipment, MinimumPosition: "Dead" },
		"inventory": {Command: Character.DoCommands.DoInventory, MinimumPosition: "Dead" },
		"say": {Command: Character.DoCommands.DoSay, MinimumPosition: "Resting" },
		"quit": {Command: Character.DoCommands.DoQuit, MinimumPosition: "Resting" },
		"help": {Command: Character.DoCommands.DoHelp, MinimumPosition: "Dead" },
		"look": {Command: Character.DoCommands.DoLook, MinimumPosition: "Resting" },
		"exits": {Command: Character.DoCommands.DoExits, MinimumPosition: "Resting" },
		"unlock": {Command: Character.DoCommands.DoUnlock, MinimumPosition: "Resting" },
		"lock": {Command: Character.DoCommands.DoLock, MinimumPosition: "Resting" },
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
		"spells": {Command: Character.DoCommands.DoSpells, MinimumPosition: "Dead" },
		"supplications": {Command: Character.DoCommands.DoSupplications, MinimumPosition: "Dead" },
		"songs": {Command: Character.DoCommands.DoSongs, MinimumPosition: "Dead" },
		"kill": {Command:Combat.DoKill, MinimumPosition: "Standing" },
		"flee": {Command:Combat.DoFlee, MinimumPosition: "Fighting" },
		"worth": {Command:Character.DoCommands.DoWorth, MinimumPosition: "Dead" },
		"follow": {Command:Character.DoCommands.DoFollow, MinimumPosition: "Dead" },
		"nofollow": {Command:Character.DoCommands.DoNoFollow, MinimumPosition: "Dead" },
		"group": {Command:Character.DoCommands.DoGroup, MinimumPosition: "Dead" },
		"throw": {Command:Combat.DoThrow, MinimumPosition: "Fighting" },
		"kansetsuwaza": {Command:Combat.DoKansetsuwaza, MinimumPosition: "Fighting" },
		"kotegaeshi": {Command:Combat.DoKotegaeshi, MinimumPosition: "Fighting" },

		"peace": {Command: Character.DoCommands.DoPeace, MinimumPosition: "Resting" },
		"slay": {Command: Character.DoCommands.DoSlay, MinimumPosition: "Dead" },
		"sing": {Command: Magic.DoSing, MinimumPosition: "Resting" },
		"toggle": {Command: Character.DoCommands.DoToggle, MinimumPosition: "Dead" },
		"dirtkick": {Command:Combat.DoDirtKick, MinimumPosition: "Standing" },
		"affects": {Command: Character.DoCommands.DoAffects, MinimumPosition: "Dead" },
		"time": {Command: Character.DoCommands.DoTime, MinimumPosition: "Dead" },
		"weather": {Command: Character.DoCommands.DoWeather, MinimumPosition: "Dead" },

		"list": {Command: Character.DoCommands.DoList, MinimumPosition: "Resting" },
		"value": {Command: Character.DoCommands.DoValue, MinimumPosition: "Resting" },
		"buy": {Command: Character.DoCommands.DoBuy, MinimumPosition: "Resting" },
		"sell": {Command: Character.DoCommands.DoSell, MinimumPosition: "Resting" },

		"drink": {Command: Character.DoCommands.DoDrink, MinimumPosition: "Resting" },
		"eat": {Command: Character.DoCommands.DoEat, MinimumPosition: "Resting" },

		"yell": {Command: Character.DoCommands.DoYell, MinimumPosition: "Resting" },
		"sayto": {Command: Character.DoCommands.DoSayTo, MinimumPosition: "Resting" },
		"whisper": {Command: Character.DoCommands.DoWhisper, MinimumPosition: "Resting" },
		"whisperto": {Command: Character.DoCommands.DoWhisperTo, MinimumPosition: "Resting" },
		"tell": {Command: Character.DoCommands.DoTell, MinimumPosition: "Resting" },
		"reply": {Command: Character.DoCommands.DoReply, MinimumPosition: "Resting" },
		"gtell": {Command: Character.DoCommands.DoGroupTell, MinimumPosition: "Dead" },
		"grouptell": {Command: Character.DoCommands.DoGroupTell, MinimumPosition: "Dead" },
		
		"pray": {Command: Character.DoCommands.DoPray, MinimumPosition: "Dead" },

		"newbiechannel": {Command: Character.DoCommands.DoNewbie, MinimumPosition: "Dead" },
		"oocchannel": {Command: Character.DoCommands.DoOOC, MinimumPosition: "Dead" },
		"generalchannel": {Command: Character.DoCommands.DoGeneral, MinimumPosition: "Dead" },

		"replay": {Command: Character.DoCommands.DoReplay, MinimumPosition: "Dead" },
		
		"recall": {Command: Character.DoCommands.DoRecall, MinimumPosition: "Standing" },
		
		"scan": {Command: Character.DoCommands.DoScan, MinimumPosition: "Resting" },

		"scrollcount": {Command: Character.DoCommands.DoScrollCount, MinimumPosition: "Dead" },

		"map": {Command: Character.DoCommands.DoMap, MinimumPosition: "Dead" },
		"heal": {Command: Magic.DoHeal, MinimumPosition: "Resting" },
		"sacrifice": {Command: Character.DoCommands.DoSacrifice, MinimumPosition: "Resting" },
		"duelchallenge": {Command: Dueling.DoIssueDuelChallenge, MinimumPosition: "Dead" },
		"duelaccept": {Command: Dueling.DoDuelAccept, MinimumPosition: "Dead" },
		"dueldecline": {Command: Dueling.DoDuelDecline, MinimumPosition: "Dead" },
		"goto": {Command: Character.DoCommands.DoGoto, MinimumPosition: "Dead" },
		"transfer": {Command: Character.DoCommands.DoTransfer, MinimumPosition: "Dead" },
		"resetareas": {Command: Character.DoCommands.DoResetAreas, MinimumPosition: "Dead" },
		"delete": {Command: Character.DoCommands.DoDelete, MinimumPosition: "Dead" },
	};

module.exports = Commands;
