const Utility = require("./Utility");
const Settings = require("./Settings");
const XmlHelper = require("./XmlHelper");
const ItemData = require("./ItemData");


class AreaData {
	static AllAreas = {};
	static AllRooms = {};
	static AllHelps = {};

	xml = null;
	Path = "";
	Name = "";
	Credits = "";
	Information = "";
	Builders = "";
	Security = 0;
	VNumStart = 0;
	VNumEnd = 0;
	OverRoomVNum = 0;
	Rooms = {};
	NPCTemplates = {};
	ItemTemplates = {};
	Resets = Array();
	Helps = {};
	Timer = 0;
	LastPeopleCount = 0;
	saved = true;

	constructor(xml, path) { 
		
		var reset = null;
		var areaxml = xml.AREADATA[0];
		this.Path = path;
		this.Name = areaxml.GetElementValue("Name");
		this.Information = areaxml.GetElementValue("Info");
		this.Credits = areaxml.GetElementValue("Credits");
		this.VNumStart = areaxml.GetElementValueInt("VNumStart");
		this.VNumEnd = areaxml.GetElementValueInt("VNumEnd");
		this.Builders = areaxml.GetElementValue("Builders");
		this.Security = areaxml.GetElementValueInt("Security");
		this.OverRoomVNum = areaxml.GetElementValueInt("OverRoomVNum");
		if(xml.ROOMS) {
			for(const rooms of xml.ROOMS) {
				if(rooms.ROOM)
					for(const roomxml of rooms.ROOM) {
						var vnum = roomxml.GetElementValueInt("VNum");
						var room = new RoomData(this, roomxml, vnum);
					}
			}
		}
		if(xml.NPCS) {
			for(const npcs of xml.NPCS) {
				if(npcs.NPC)
					for(const npc of npcs.NPC) {
						var vnum = npc.GetElementValueInt("VNum");
						var npctemplate = new NPCTemplateData(this, npc, vnum);
					}
			}
		}
		if(xml.ITEMS) {
			for(const items of xml.ITEMS) {
				if(items.ITEM)
					for(const item of items.ITEM) {
						var vnum = item.GetElementValueInt("VNum");
						var itemtemplate = new ItemTemplateData(this, item, vnum);
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
					var vnum = helpxml.GetAttributeValueInt("VNum");
					var help = new HelpData(this, helpxml, vnum);
					AreaData.AllHelps[help.VNum] = this.Helps[help.VNum] = help;
				}
			}
			
		}
		
	} // end constructor
	static LoadAllAreas(callback) {
		const path = require('path')
		const fs = require('fs');
		//const xml2js = require('xml2js');
		//const parser = new xml2js.Parser({ strict: false, trim: false });
		var counter = 0;
		const Settings = require("./Settings");
		var areasdirectory = Settings.AreaDataPath;
		var filenames = fs.readdirSync(areasdirectory);
		for(var filename of filenames){
			if(filename.endsWith(".xml") && !filename.endsWith("_Programs.xml")) {
				var areapath = path.join(areasdirectory, filename);
				var content = fs.readFileSync(areapath, 'utf-8')
				var xml = content.ParseXml();
					var area = AreaData.AllAreas[xml.AREA.AREADATA[0].NAME[0]] = new AreaData(xml.AREA, areapath);
					
					//console.log("Loaded area " + area.Name);
				
				counter++;
			}
		}
		callback();
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
			//console.log("RESET AREA :: " + this.Name);

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
					if (!item.WearFlags.ISSET(ItemData.WearFlags.Take) && 
					item.Template && 
					item.Template.ExtraFlags.ISSET(ItemData.ExtraFlags.Closed) && 
					!item.ExtraFlags.ISSET(ItemData.ExtraFlags.Closed))
					{
						item.ExtraFlags.SETBIT(ItemData.ExtraFlags.Closed);
					}
				}
			}

		}
		
	}

	static SaveAreas(params = {force: false}) {
		var count = 0;
		for(var areakey in this.AllAreas) {
			var area = this.AllAreas[areakey];
			if(!area.saved || params.force) {
				area.Save();
				count++;
			}
		}
		return count;
	}
	
	Save() {
		var builder = require('xmlbuilder');
		var xml = builder.create("Area");
		this.Element(xml);

		var rooms = xml.ele("Rooms");
		for(var roomkey in this.Rooms) {
			var room = this.Rooms[roomkey];
			room.Element(rooms);
		}

		var npcs = xml.ele("NPCs");
		for(var npckey in this.NPCTemplates) {
			var npc = this.NPCTemplates[npckey];
			npc.Element(npcs);
		}

		var items = xml.ele("Items");
		for(var itemkey in this.ItemTemplates) {
			var item = this.ItemTemplates[itemkey];
			item.Element(items);
		}

		var resets = xml.ele("Resets");
		for(var reset of this.Resets) {
			reset.Element(resets);
		}

		var helps = xml.ele("Helps");
		for(var helpkey in this.Helps) {
			var help = this.Helps[helpkey];
			help.Element(helps);
		}

		var xmlstring = xml.end({ pretty: true});
		const path = require('path');
		var filepath = this.Path;
		const fs = require('fs');
		fs.writeFileSync(filepath, xmlstring);
		this.saved = true;
	}

	Element(xml) {
		var areadata = xml.ele("AreaData");
		areadata.ele("Name", this.Name);
		areadata.ele("Info", this.Information);
		areadata.ele("VNumStart", this.VNumStart);
		areadata.ele("VNumEnd", this.VNumEnd);
		areadata.ele("Credits", this.Credits);
		areadata.ele("Builders", this.Builders);
		areadata.ele("Security", this.Security);
		areadata.ele("OverRoomVNum", this.OverRoomVNum);
	}
}




module.exports = AreaData;

const RoomData = require('./RoomData');
const NPCTemplateData = require('./NPCTemplateData');
const ItemTemplateData = require('./ItemTemplateData');
const ResetData = require('./ResetData');
const HelpData = require("./HelpData");
//const Utility = require("./Utility");const Settings = require("./Settings");

