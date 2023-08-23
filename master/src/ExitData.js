RoomData = require("./RoomData");
XmlHelper = require("./XmlHelper");

class ExitData {
	constructor(room, exitdata) {
		this.direction = XmlHelper.GetElementValue(exitdata, "Direction", "north");
		this.destinationVnum = XmlHelper.GetElementValue(exitdata, "Destination");
		this.description = XmlHelper.GetElementValue(exitdata, "Description");
		this.source = room;
		room.exits[RoomData.Directions.indexOf(this.direction.toLowerCase())] = this;
	}
}


module.exports = ExitData;
