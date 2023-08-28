const path = require('path')
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ strict: false, trim: false });
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
	
}




module.exports = AreaData;

const RoomData = require('./RoomData');
const NPCTemplateData = require('./NPCTemplateData');
const ItemTemplateData = require('./ItemTemplateData');
const ResetData = require('./ResetData');
const HelpData = require("./HelpData");