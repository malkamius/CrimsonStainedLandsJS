const Utility = require('./Utility');
const XmlHelper = require("./XmlHelper");

class RoomData {
	static Rooms = {};
	static Directions = Array("north", "east", "south", "west", "up", "down");

	Area = null;
	VNum = 0;
	Name = "";
	Description = "";
	Exits = Array(null, null, null, null, null, null);
	Characters = Array();
	Items = Array();
	Flags = {};
	Sector = "Inside";

	constructor(area, roomxml) {
		const ExitData = require('./ExitData');
		this.Area = area;
		this.VNum = roomxml.GetElementValueInt("VNum");
		this.Name = roomxml.GetElementValue("Name");
		this.Description = roomxml.GetElementValue("Description");
		this.Sector = roomxml.GetElementValue("Sector");
		Utility.ParseFlags(this.Flags, roomxml.GetElementValue("Flags"));

		this.Exits = Array(null, null, null, null, null, null);
		
		for(const exits of roomxml.EXITS) {
			if(exits) {
				for(var exitxml of exits.EXIT) {
					var exitdata = new ExitData(this, exitxml);
				}
			}
		}
		RoomData.Rooms[this.VNum] = this;
	}
}


module.exports = RoomData;

