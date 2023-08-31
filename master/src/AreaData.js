
const Settings = require("./Settings");



class AreaData {
	static AllAreas = {};
	static AllRooms = {};
	static AllHelps = {};

	xml = null;
	Name = "";
	Rooms = {};
	NPCTemplates = {};
	ItemTemplates = {};
	Resets = Array();
	helps = {};
	Timer = 0;
	LastPeopleCount = 0;

	constructor(xml) { 
		var reset = null;
		this.Name = xml.AREADATA[0].NAME[0];
		if(xml.ROOMS) {
			for(const rooms of xml.ROOMS) {
				if(rooms.ROOM)
					for(const room of rooms.ROOM) {
						AreaData.AllRooms[room.VNUM] = this.Rooms[room.VNUM] = new RoomData(this, room);
					}
			}
		}
		if(xml.NPCS) {
			for(const npcs of xml.NPCS) {
				if(npcs.NPC)
					for(const npc of npcs.NPC) {
						var npctemplate = new NPCTemplateData(this, npc);
					}
			}
		}
		if(xml.ITEMS) {
			for(const items of xml.ITEMS) {
				if(items.ITEM)
					for(const item of items.ITEM) {
						var itemtemplate = new ItemTemplateData(this, item);
					}
			}
		}
		if(xml.RESETS) {
			for(const resets of xml.RESETS) {
				if(resets.RESET)
					for(var resetxml of resets.RESET) {
						reset = new ResetData(this, resetxml);
					}
			}
		}
		if(xml.HELPS) {
			for(const helpsxml of xml.HELPS) {
				for(var helpxml of helpsxml.HELP)
				{
					var help = new HelpData(helpxml);
					AreaData.AllHelps[help.VNum] = this.helps[help.VNum] = help;
				}
			}
			
		}
		
	} // end constructor
	static LoadAllAreas(callback) {
		const path = require('path')
		const fs = require('fs');
		const xml2js = require('xml2js');
		const parser = new xml2js.Parser({ strict: false, trim: false });
		var counter = 0;
		var areasdirectory = Settings.AreaDataPath;
		fs.readdir(areasdirectory, function(err, filenames) {
			if (err) {
			  throw new Error(err);
			  return;
			}
			
			filenames.forEach(function(filename) {
				if(filename.endsWith(".xml") && !filename.endsWith("_Programs.xml")) {
				  fs.readFile(path.join(areasdirectory, filename), 'utf-8', function(err, content) {
					if (err) {
					  throw new Error(err);
					  return;
					}
					parser.parseString(content, function(err, xml) {
						var area = AreaData.AllAreas[xml.AREA.AREADATA[0].NAME[0]] = new AreaData(xml.AREA);
						//console.log("Loaded area " + area.Name);
					});
					counter++;
					if (counter === filenames.length) {
						callback();
					}
				  });
				} else {
					counter++;
					if (counter === filenames.length) {
						callback();
					}
				}
			});
		});
		
	}

	static ResetAreas(force = false) {
		for(var areakey in AreaData.AllAreas)
		{
			var area = AreaData.AllAreas[areakey];
			
			area.ResetArea(force);
			//console.log("Reset area " + area.Name);
		}
	}

	ResetArea(force = false) {
		const Character = require("./Character");
		if (force) this.Timer = 1;

		if (this.Timer > 0)
			this.Timer--;
		else
		this.Timer = 0;
		
		var people = Character.Characters.Select(function(ch) {!ch.IsNPC && ch.Room && ch.Room.Area == this});

		if (this.LastPeopleCount > 0 && people.length == 0 && this.Timer > 3)
		{
			this.Timer = 3;// game.PULSE_AREA;
		}
		else if (people.length == 0 && this.Timer > 3) //game.PULSE_AREA)
		{
			this.Timer = 3;
		}
		else if (this.LastPeopleCount == 0 && people.length > 0)
		{
			this.Timer = Utility.Random(7, 16);
		}
		this.LastPeopleCount = people.length;
		// RESET Every PULSE if empty, otherwise every 3 PULSEs
		if (this.Timer <= 0)// || (this.people.Count == 0 && timer <= (game.PULSE_AREA * 4)))
		{
			//RandomizeExits();
			if (people.length > 0)
			this.Timer = Utility.Random(7, 16);//  game.PULSE_AREA * 5;
			else
			this.Timer = 3;// game.PULSE_AREA;
			console.log("RESET AREA :: " + this.Name);

			for(var i = 0; i < this.Resets.length; i++) {
				var reset = this.Resets[i];
				reset.Execute();
			}

			for(var roomkey in this.Rooms)
			{
				var room = this.Rooms[roomkey];
				for (var exit of room.Exits)
				{
					if (exit != null)
					{
						exit.Flags = Utility.CloneArray(exit.OriginalFlags);
					}
				}

				for (var item of room.Items)
				{
					if (!item.WearFlags.ISSET("Take") && item.Template  && item.Template.ExtraFlags.ISSET("Closed") && !item.ExtraFlags.ISSET("Closed"))
					{
						item.ExtraFlags["Closed"] = true;;
					}
				}
			}

		}
		
	}
	
}




module.exports = AreaData;

const RoomData = require('./RoomData');
const NPCTemplateData = require('./NPCTemplateData');
const ItemTemplateData = require('./ItemTemplateData');
const ResetData = require('./ResetData');
const HelpData = require("./HelpData");
const Utility = require("./Utility");
