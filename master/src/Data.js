const RaceData = require("./RaceData");
const PcRaceData = require("./PcRaceData");
const GuildData = require("./GuildData");
const AreaData = require("./AreaData");
const SkillSpell = require("./SkillSpell");
const Settings = require("./Settings");
const DamageMessage = require("./DamageMessage");
const SkillGroup = require("./SkillGroup");
const ResetData = require("./ResetData");
const Program = require("./Program");
const Liquid = require("./Liquid");

function LoadData(callback) {
	Settings.Load();
	DamageMessage.Load();
	SkillSpell.LoadAll();
	SkillGroup.Load();
    Liquid.Load();
	Program.LoadPrograms();
	const Commands = require("./Commands");
	var count = 0;
	for(var skillname in SkillSpell.Skills) {
		var skill = SkillSpell.Skills[skillname];
		if(!skill.SpellFuncName && skill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Skill) && !Commands[skillname.replaceAll(" ", "")]) {
			console.log("Unlinked skill: " + skillname);
			console.dir(skill.LearnedLevel);
			count++;
		}
	}
	console.log(count + " unlinked skills");

	LoadRaces(callback);
}

function LoadRaces(callback) {
	RaceData.LoadAllRaces(function() { LoadPcRaces(callback); });
}

function LoadPcRaces(callback) {
	PcRaceData.LoadAllPcRaces(function() { LoadGuilds(callback); });
}

function LoadGuilds(callback) {
	GuildData.LoadAllGuilds(function() { LoadAreas(callback); });
}

function LoadAreas(callback) {

	AreaData.LoadAllAreas(function() { 	
		fixExits();
		ResetData.FixMaxCounts();
		AllLoaded(callback);
	} );

}

function AllLoaded(callback) {
	console.log(Object.keys(SkillSpell.Skills).length + " skills loaded.");
	console.log(RaceData.Races.length + " races loaded.");
	console.log(PcRaceData.PcRaces.length + " pc races loaded.");
	console.log(GuildData.Guilds.length + " guilds loaded.");
	console.log(Object.keys(AreaData.AllRooms).length + " rooms loaded.");
	console.log(Object.keys(AreaData.AllHelps).length + " helps loaded.");
	console.log(Object.keys(AreaData.AllAreas).length + " areas loaded.");
	console.log(Object.keys(ResetData.Resets).length + " resets loaded.");

	AreaData.ResetAreas();
	
    callback();
}

function fixExits() {
	for(var roomvnum in AreaData.AllRooms) {
		var room = AreaData.AllRooms[roomvnum];
		for(var index = 0; index < 6; index++) {
			if(room.Exits[index] && room.Exits[index].DestinationVNum) {
				room.Exits[index].Destination = AreaData.AllRooms[room.Exits[index].DestinationVNum];
			}
		}
	}
}

exports.LoadData = LoadData;