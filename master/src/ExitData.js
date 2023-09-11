const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility");
const RoomData = require("./RoomData");



class ExitData {

	static ExitFlags = {
		"Door": "Door",
		"Closed": "Closed",
		"Locked": "Locked",
		"Lockable": "Lockable",
		"Window": "Window",
		"PickProof": "PickProof",
		"NoPass": "NoPass",
		"NoBash": "NoBash",
		"Hidden": "Hidden",
		"HiddenWhileClosed": "HiddenWhileClosed",
		"MustUseKeyword": "MustUseKeyword",
		"NoRandomize": "NoRandomize",
		"NonObvious": "Hidden",
	}
	
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

		if(this.Flags.ISSET(ExitData.ExitFlags.Locked)) {
			this.Flags.SETBIT(ExitData.ExitFlags.Closed)
			this.Flags.SETBIT(ExitData.ExitFlags.Lockable)
		}
		if(this.Flags.ISSET(ExitData.ExitFlags.Closed) || this.Flags.ISSET(ExitData.ExitFlags.Lockable)) 
			this.Flags.SETBIT(ExitData.ExitFlags.Door)
		
		Object.assign(this.OriginalFlags, this.Flags);
		
		
		this.Source = room;
		
		room.Exits[RoomData.Directions.indexOf(this.Direction)] = this;
	}
}


module.exports = ExitData;
