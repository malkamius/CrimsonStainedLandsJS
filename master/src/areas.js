module.exports = {
  areas: new areas()
};

const path = require('path')
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ strict: false, trim: false });
const RoomData = require('./RoomData');
const NPCTemplateData = require('./NPCTemplateData');
const ResetData = require('./ResetData');

function areas()
{
	this.load = function(callback) { 
		areas_load(this, callback);
	};
	this.areas = {};
	this.Rooms = {};
	this.name = "";
	this.helps = {};
}

function areas_load(areas, callback)
{
    var counter = 0;
	var areasdirectory = path.join(__dirname, '../data/areas');
	fs.readdir(areasdirectory, function(err, filenames) {
		if (err) {
		  throw err;
		  return;
		}
		
		filenames.forEach(function(filename) {
			if(filename.endsWith(".xml") && !filename.endsWith("_Programs.xml")) {
			  fs.readFile(path.join(areasdirectory, filename), 'utf-8', function(err, content) {
				if (err) {
				  throw err;
				  return;
				}
				parser.parseString(content, function(err, xml) {
					var area = areas.areas[xml.AREA.AREADATA[0].NAME[0]] = new areadata(areas, xml.AREA);
					
					area.load(areas);
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

function areadata(areas, xml)
{
	this.xml = xml;
	this.name = xml.AREADATA[0].NAME[0];
	this.Rooms = {};
	this.NPCTemplates = {};
	this.ItemTemplates = {};
	this.Resets = Array();
	this.helps = {};
	this.load = function(areas) { 
		loadareadata(areas, this, xml);
	};
}

function loadareadata(areas, area, xml) {
	var reset = null;
	if(!area) return;
	if(xml.ROOMS) {
		for(const rooms of xml.ROOMS) {
			if(rooms.ROOM)
				for(const room of rooms.ROOM) {
					areas.Rooms[room.VNUM] = area.Rooms[room.VNUM] = new RoomData(areas, area, room);
				}
		}
	}
	if(xml.NPCS) {
		for(const npcs of xml.NPCS) {
			if(npcs.NPC)
				for(const npc of npcs.NPC) {
					var npctemplate = new NPCTemplateData(area, npc);
				}
		}
	}
	if(xml.RESETS) {
		for(const resets of xml.RESETS) {
			if(resets.RESET)
				for(resetxml of resets.RESET) {
					reset = new ResetData(area, resetxml);
				}
		}
	}
	if(xml.HELPS) {
		for(const helps of xml.HELPS) {
			for(var help of helps.HELP)
			{
				areas.helps[help.$.VNUM] = area.helps[help.$.VNUM] = new helpdata(help.$.VNUM, help.$.KEYWORD, help._);
			}
		}
		
	}
	for(var i = 0; i < area.Resets.length; i++) {
		reset = area.Resets[i];
		reset.Execute();
	}
}

function helpdata(vnum, keyword, text) {
	this.vnum = vnum;
	this.keyword = keyword;
	this.text = text;
}

module.exports = new areas();
