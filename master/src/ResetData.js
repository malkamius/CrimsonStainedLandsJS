
const RoomData = require("./RoomData");
const NPCData = require("./NPCData");
const ItemData = require("./ItemData");
const XmlHelper = require("./XmlHelper");



class ResetData {
  static Resets = Array();
  static LastNPCReset = null;
  Type = "";
  VNum = 0;
  Destination = 0;
  Count = 1;
  Max = 1;

  constructor(area, xml) {
    this.Type = XmlHelper.GetElementValue(xml, "type", XmlHelper.GetAttributeValue(xml, "type"));
    this.Destination = XmlHelper.GetElementValueInt(xml, "destination", XmlHelper.GetAttributeValue(xml, "destination"));
    this.Count = XmlHelper.GetElementValueInt(xml, "count", XmlHelper.GetAttributeValue(xml, "count"));
    this.Max = XmlHelper.GetElementValueInt(xml, "max", XmlHelper.GetAttributeValue(xml, "max"));
    this.VNum = XmlHelper.GetElementValueInt(xml, "vnum", XmlHelper.GetAttributeValue(xml, "vnum"));
    
    area.Resets.push(this);
    ResetData.Resets.push(this);

  }

  static FixMaxCounts() {
    const AreaData = require("./AreaData");
    for(var areakey in AreaData.AllAreas) {
      var area = AreaData.AllAreas[areakey];

      for(var reset of area.Resets) {
        if(reset.Type == "NPC") {
          var template = NPCTemplateData.NPCTemplates[reset.VNum];

          if(template) {
            template.ResetMaxCount += 1; //Math.max(reset.Max, 1);
          }
        }
      }
    }
  }

  Execute() {
    var reset = this;
    if(this.Type == "NPC") {
      ResetData.LastNPCReset = null;
      var room = RoomData.Rooms[this.Destination];
      if(room) {
          var template = NPCTemplateData.NPCTemplates[reset.VNum];

          if(template) {
            var npcsInRoom = room.Characters.Select(function(npc) { return npc.VNum == reset.VNum } );
            //var npcs = Character.Characters.Select(function(npc) { return npc.VNum == reset.VNum } );
            if((template.ResetCount < this.Max || template.ResetCount < template.ResetMaxCount) && npcsInRoom.length < this.Count) {
              var npc = new NPCData(this.VNum, room);
              ResetData.LastNPCReset = npc;
            }
          }
      }
    } else if(this.Type == "Item") {
        var room = RoomData.Rooms[this.Destination];
          if(room) {
            var items = room.Items.Select(function(item) { return item.VNum == reset.VNum } );
            if(items.length < this.Count) {
              var item = new ItemData(this.VNum, room);
            }
        }
    } else if(this.Type == "Give" && ResetData.LastNPCReset) {
      var item = new ItemData(this.VNum, null, null);
      ResetData.LastNPCReset.Inventory.unshift(item);
    } else if(this.Type == "Equip" && ResetData.LastNPCReset) {
      var item = new ItemData(this.VNum, null, null);
      if(!ResetData.LastNPCReset.WearItem(item, false, true))
        ResetData.LastNPCReset.AddInventoryItem(item);
    }
  }
}

module.exports = ResetData;

const Character = require("./Character");
const NPCTemplateData = require("./NPCTemplateData");
