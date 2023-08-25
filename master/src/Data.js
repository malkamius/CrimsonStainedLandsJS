const RaceData = require("./RaceData");
const PcRaceData = require("./PcRaceData");
const GuildData = require("./GuildData");
const AreaData = require("./AreaData");
const SkillSpell = require("./SkillSpell");
const Settings = require("./Settings");

function LoadData(callback) {
	Settings.Load();
	SkillSpell.LoadAll();
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

	for(var areakey in AreaData.AllAreas)
	{
		var area = AreaData.AllAreas[areakey];
		
		for(var i = 0; i < area.Resets.length; i++) {
			reset = area.Resets[i];
			reset.Execute();
		}
		//console.log("Reset area " + area.Name);
	}
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