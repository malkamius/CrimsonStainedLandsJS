
const RoomData = require("./RoomData");
const NPCData = require("./NPCData");
const ItemData = require("./ItemData");
const XmlHelper = require("./XmlHelper");



class ResetData {
  static Resets = Array();
  static LastNPCReset = null;

  static ResetTypes =
  {
      NPC: "NPC",
      Equip: "Equip",
      Give: "Give",
      Item: "Item",
      Put: "Put",
      EquipRandom: "EquipRandom"
  }

  Type = "";
  VNum = 0;
  Destination = 0;
  Count = 1;
  Max = 1;

  constructor(area, xml) {

    if(xml) {
      this.Type = xml.GetElementValue( "type", xml.GetAttributeValue( "type"));
      this.Destination = xml.GetElementValueInt( "destination", xml.GetAttributeValue( "destination"));
      this.Count = xml.GetElementValueInt( "count", xml.GetAttributeValue( "count"));
      this.Max = xml.GetElementValueInt( "max", xml.GetAttributeValue( "max"));
      this.VNum = xml.GetElementValueInt( "vnum", xml.GetAttributeValue( "vnum"));
    }
    area.Resets.push(this);
    ResetData.Resets.push(this);

  }

  Element(xml) {
    var element = xml.element("Reset");
    element.attribute("Type", this.Type);
    element.attribute("Destination", this.Destination);
    element.attribute("Count", this.Count);
    element.attribute("Max", this.Max);
    element.attribute("VNum", this.VNum);
  }

  static FixMaxCounts() {
    const AreaData = require("./AreaData");
    for(var areakey in AreaData.AllAreas) {
      var area = AreaData.AllAreas[areakey];

      for(var reset of area.Resets) {
        if(reset.Type == "NPC") {
          var template = NPCTemplateData.Templates[reset.VNum];

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
          var template = NPCTemplateData.Templates[reset.VNum];

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
