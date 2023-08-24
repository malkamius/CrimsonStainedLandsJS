const Character = require("./Character");
const Color = require("./Color");
const XmlHelper = require("./XmlHelper");
const StringUtility = require("./StringUtility");
const fs = require("fs");
const xml2js = require('xml2js');
const ItemData = require("./ItemData");
const parser = new xml2js.Parser({ strict: false, trim: false });

Players = Array();

class Player extends Character {
	RoomVNum = 0;
	IsNPC = false;
  constructor(socket) {
	super();
  	this.socket = socket;
	this.input = "";
	this.output = "";
	this.status = "GetName";
	this.SittingAtPrompt = false;
	this.send = function(data) {
		data = data.replace("\r", "").replace("\n", "\n\r");
		this.output = this.output + Color.ColorString(data, false, false);
	};
	
	this.sendnow = function(data) {
		data = data.replace("\r", "").replace("\n", "\n\r");
		this.socket.write(Color.ColorString(data, false, false));
	};
	
	Players.push(this);
  }

  Load(path) {
	var player = this;
	var data =fs.readFileSync(path, {encoding: "ascii"});

	parser.parseString(data, function(err, xml) {
		player.LoadPlayerData(xml.PLAYERDATA);
	});
  }

  LoadPlayerData(xml) {
	if(xml)	{
		this.Name = XmlHelper.GetElementValue(xml,"Name");
		this.ShortDescription = XmlHelper.GetElementValue(xml,"ShortDescription");
		this.LongDescription = XmlHelper.GetElementValue(xml,"LongDescription");
		this.Description = XmlHelper.GetElementValue(xml,"Description");
		this.Sex = XmlHelper.GetElementValue(xml,"Sex");
		this.Level = XmlHelper.GetElementValueInt(xml,"Level");
		this.HitPoints = XmlHelper.GetElementValueInt(xml,"HitPoints");
		this.MaxHitPoints = XmlHelper.GetElementValueInt(xml,"MaxHitPoints");
		this.ManaPoints = XmlHelper.GetElementValueInt(xml,"ManaPoints");
		this.MaxManaPoints = XmlHelper.GetElementValueInt(xml,"MaxManaPoints");
		this.MovementPoints = XmlHelper.GetElementValue(xml,"MovementPoints");
		this.MaxMovementPoints = XmlHelper.GetElementValue(xml,"MaxMovementPoints");
		
		StringUtility.ParseFlags(this.Flags, XmlHelper.GetElementValue(xml,"Flags"));

		this.RoomVNum = XmlHelper.GetElementValueInt(xml,"Room");
		
		this.Password = XmlHelper.GetElementValue(xml,"Password");
		
		if(xml.EQUIPMENT) {
			for(const equipmentxml of xml.EQUIPMENT) {
				if(equipmentxml.SLOT)
					for(const slotxml of equipmentxml.SLOT) {
						var slotid = slotxml.$.SLOTID;
						if(slotxml.ITEM && slotxml.ITEM) {
							var itemxml = slotxml.ITEM[0];
							var item = player.Equipment[slotid] = new ItemData(itemxml.VNUM[0], null, null);
							item.Load(itemxml);
						}
					}
			}
		}

		if(xml.INVENTORY) {
			for(const inventoryxml of xml.INVENTORY) {
				if(inventoryxml.ITEM)
					for(const itemxml of inventoryxml.ITEM) {
						var item = new ItemData(itemxml.VNUM[0]);
						item.Load(itemxml);
						this.Inventory.push(item);
				}
			}
		}
	}
  } // end LoadPlayerData

  Save(path) {
	if(!path) path = `data/players/${player.Name}.xml`;

	var builder = require('xmlbuilder');
	var xmlelement = builder.create("PlayerData");
	
	xmlelement.ele("Name", this.Name);
	xmlelement.ele("Description", this.Description);
	xmlelement.ele("ShortDescription", this.ShortDescription);
	xmlelement.ele("LongDescription", this.LongDescription);
	xmlelement.ele("Room", this.Room? this.Room.VNum : 3700);
	xmlelement.ele("Sex", this.Sex);
	xmlelement.ele("Level", this.Level);
	xmlelement.ele("HitPoints", this.HitPoints);
	xmlelement.ele("MaxHitPoints", this.MaxHitPoints);
	xmlelement.ele("ManaPoints", this.ManaPoints);
	xmlelement.ele("MaxManaPoints", this.MaxManaPoints);
	xmlelement.ele("MovementPoints", this.MovementPoints);
	xmlelement.ele("MaxMovementPoints", this.MaxMovementPoints);
	xmlelement.ele("ArmorBash", this.ArmorBash);
	xmlelement.ele("ArmorSlash", this.ArmorSlash);
	xmlelement.ele("ArmorPierce", this.ArmorPierce);
	xmlelement.ele("ArmorExotic", this.ArmorExotic);
	xmlelement.ele("Xp", this.Xp);
	xmlelement.ele("XpTotal", this.XpTotal);
	xmlelement.ele("Flags", StringUtility.JoinFlags(this.Flags));
	xmlelement.ele("Password", this.Password);
	
	var inventory = xmlelement.ele("Inventory")
	for(var i = 0; i < this.Inventory.length; i++) {
		this.Inventory[i].Element(inventory);
	}
	
	var equipment = xmlelement.ele("Equipment")
	for(var key in this.Equipment) {
		var slot = equipment.ele("Slot").attribute("SlotID", key);
		this.Equipment[key].Element(slot);
	}
	
  	var xml = xmlelement.end({ pretty: true});
	fs.writeFileSync(path, xml);
  }
}

module.exports = Player;
module.exports.Players = Players;