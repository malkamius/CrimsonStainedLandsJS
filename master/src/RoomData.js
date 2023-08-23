const ExitData = require('./ExitData');
Rooms = {};
Directions = Array("north", "east", "south", "west", "up", "down");

class RoomData {
	constructor(areas, area, roomxml) {
		
		this.vnum = roomxml.VNUM;
		this.name = roomxml.NAME;
		this.description = roomxml.DESCRIPTION;
		this.exits = Array(null, null, null, null, null, null);

		for(const exits of roomxml.EXITS) {
			if(exits) {
				for(var exitxml of exits.EXIT)
					var exitdata = new ExitData(this, exitxml);
			}
		}
		
		this.Characters = Array();
		this.Items = Array();
		
		Rooms[this.vnum] = this;
	}
}


module.exports = RoomData;
module.exports.Rooms = Rooms;
module.exports.Directions = Directions;