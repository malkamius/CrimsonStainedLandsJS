const RoomData = require("./RoomData");
const NPCData = require("./NPCData");
const ItemData = require("./ItemData");
XmlHelper = require("./XmlHelper");
Resets = Array();

class ResetData {
  Type = "";
  VNum = 0;
  Destination = 0;
  Count = 1;
  Max = 1;

  constructor(area, xml) {
    this.Type = XmlHelper.GetElementValue(xml, "type", XmlHelper.GetAttributeValue(xml, "type"));
    this.Destination = XmlHelper.GetElementValue(xml, "destination", XmlHelper.GetAttributeValue(xml, "destination"));
    this.Count = XmlHelper.GetElementValue(xml, "count", XmlHelper.GetAttributeValue(xml, "count"));
    this.Max = XmlHelper.GetElementValue(xml, "max", XmlHelper.GetAttributeValue(xml, "max"));
    this.VNum = XmlHelper.GetElementValue(xml, "vnum", XmlHelper.GetAttributeValue(xml, "vnum"));

    area.Resets.push(this);
  }

  Execute() {
    if(this.Type == "NPC") {
        var room = RoomData.Rooms[this.Destination];
        if(room) {
            var npc = new NPCData(this.VNum, room);

        }
    } else if(this.Type == "Item") {
        var room = RoomData.Rooms[this.Destination];
          if(room) {
            var item = new ItemData(this.VNum, room);
        }
    }
  }
}

ResetData.Resets = this.Resets;
module.exports = ResetData;
