const XmlHelper = require("./XmlHelper");
const StringUtility = require("./StringUtility");
const RoomData = require("./RoomData");



class ExitData {
	Direction = "north";
	Display = "the door north"
	DestinationVNum = 0;
	Description = "";
	Source = null;
	Flags = {};
	OriginalFlags = {};

	constructor(room, exitdata) {
		
		this.Direction = XmlHelper.GetElementValue(exitdata, "Direction", "north").toLowerCase();
		this.Display = XmlHelper.GetElementValue(exitdata, "Display", "the door " + this.Direction.toLowerCase());
		this.DestinationVNum = XmlHelper.GetElementValue(exitdata, "Destination");
		this.Description = XmlHelper.GetElementValue(exitdata, "Description");
		StringUtility.ParseFlags(this.Flags, XmlHelper.GetElementValue(exitdata, "Flags"));
		Object.assign(this.OriginalFlags, this.Flags);

		this.Source = room;
		
		room.Exits[RoomData.Directions.indexOf(this.Direction)] = this;
	}
}


module.exports = ExitData;
