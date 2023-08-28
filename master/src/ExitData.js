const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility");
const RoomData = require("./RoomData");



class ExitData {
	Direction = "north";
	Display = "the door north";
	Keywords = "";
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
		this.Keywords = XmlHelper.GetElementValue(exitdata, "Keywords");
		Utility.ParseFlags(this.Flags, XmlHelper.GetElementValue(exitdata, "Flags"));
		Object.assign(this.OriginalFlags, this.Flags);
		
		if(this.Flags.Locked) this.Flags.Closed = true;
		if(this.Flags.Closed) this.Flags.Door = true;
		
		this.Source = room;
		
		room.Exits[RoomData.Directions.indexOf(this.Direction)] = this;
	}
}


module.exports = ExitData;
