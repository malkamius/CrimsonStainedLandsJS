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
	Keys = [];

	constructor(room, exitdata) {
		
		this.Direction = XmlHelper.GetElementValue(exitdata, "Direction", "north").toLowerCase();
		this.Display = XmlHelper.GetElementValue(exitdata, "Display", "the door " + this.Direction.toLowerCase());
		this.DestinationVNum = XmlHelper.GetElementValue(exitdata, "Destination");
		this.Description = XmlHelper.GetElementValue(exitdata, "Description");
		this.Keywords = XmlHelper.GetElementValue(exitdata, "Keywords");

		var keys = exitdata.GetElementValue("Keys");

		if(keys && !keys.ISEMPTY()) {
			var arrkeys = keys.split(" ");
			if(!arrkeys || arrkeys.length == 0) {
				arrkeys = [keys];
			}

			for(var key of arrkeys) {
				var numkey = parseInt(key);
				if(numkey && numkey != -1) {
					this.Keys.push(numkey);
				}
			}
		}

		Utility.ParseFlags(this.Flags, XmlHelper.GetElementValue(exitdata, "Flags"));

		if(this.Flags.Locked) 
			this.Flags.Closed = true;
		if(this.Flags.Closed) 
			this.Flags.Door = true;

		Object.assign(this.OriginalFlags, this.Flags);
		
		
		this.Source = room;
		
		room.Exits[RoomData.Directions.indexOf(this.Direction)] = this;
	}
}


module.exports = ExitData;
