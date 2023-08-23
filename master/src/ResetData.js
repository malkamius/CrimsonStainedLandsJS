const RoomData = require("./RoomData");
const NPCData = require("./NPCData");
XmlHelper = require("./XmlHelper");
Resets = Array();

class ResetData {
  constructor(area, xml) {
    this.type = XmlHelper.GetElementValue(xml, "type", XmlHelper.GetAttributeValue(xml, "type"));
    this.destination = XmlHelper.GetElementValue(xml, "destination", XmlHelper.GetAttributeValue(xml, "destination"));
    this.count = XmlHelper.GetElementValue(xml, "count", XmlHelper.GetAttributeValue(xml, "count"));
    this.max = XmlHelper.GetElementValue(xml, "max", XmlHelper.GetAttributeValue(xml, "max"));
    this.vnum = XmlHelper.GetElementValue(xml, "vnum", XmlHelper.GetAttributeValue(xml, "vnum"));

    area.Resets.push(this);
  }

  Execute() {
    if(this.type == "NPC") {
        var room = RoomData.Rooms[this.destination];
        if(room) {
            var npc = new NPCData(this.vnum, room);

        }
    }
  }
}

ResetData.Resets = this.Resets;
module.exports = ResetData;
