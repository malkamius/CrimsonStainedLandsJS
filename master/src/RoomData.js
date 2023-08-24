Rooms = {};
Directions = Array("north", "east", "south", "west", "up", "down");


class RoomData {
	VNum = 0;
	Name = "";
	Description = "";
	Exits = Array(null, null, null, null, null, null);

	constructor(areas, area, roomxml) {
		this.VNum = roomxml.VNUM;
		this.Name = roomxml.NAME;
		this.Description = roomxml.DESCRIPTION;
		this.Exits = Array(null, null, null, null, null, null);

		for(const exits of roomxml.EXITS) {
			if(exits) {
				for(var exitxml of exits.EXIT) {
					var exitdata = new ExitData(this, exitxml);
				}
			}
		}
		
		this.Characters = Array();
		this.Items = Array();
		
		Rooms[this.VNum] = this;
	}
}


RoomData.Directions = Directions;
RoomData.Rooms = Rooms;
module.exports = RoomData;

ExitData = require('./ExitData');