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
	Destination = null;
	Source = null;
	Flags = {};
	OriginalFlags = {};
	Keys = [];
	ExitSize = "Medium";

	constructor(room, exitdata) {
		
		this.Direction = XmlHelper.GetElementValue(exitdata, "Direction", "north").toLowerCase();
		this.Display = XmlHelper.GetElementValue(exitdata, "Display", "the door " + this.Direction.toLowerCase());
		this.DestinationVNum = XmlHelper.GetElementValue(exitdata, "Destination");
		this.Description = XmlHelper.GetElementValue(exitdata, "Description");
		this.Keywords = XmlHelper.GetElementValue(exitdata, "Keywords");
		this.ExitSize = XmlHelper.GetElementValue(exitdata, "ExitSize", "Medium");

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
		if(RoomData.Directions.indexOf(this.Direction) == -1) {
			console.log("BAD EXIT Direction = " + this.Direction);
		} else {
			room.Exits[RoomData.Directions.indexOf(this.Direction)] = this;
		}
	}

	Element(xml) {
		var element = xml.ele("Exit");
		element.ele("Direction", this.Direction);
		element.ele("Display", this.Display);
		element.ele("Destination", this.Destination? this.Destination.VNum : this.DestinationVNum);
		element.ele("Description", this.Description);
		element.ele("Keywords", this.Keywords);
		element.ele("ExitSize", this.ExitSize);
		element.ele("Flags", this.OriginalFlags);
		if(this.Keys.length > 0) {
			element.ele("Keys", Utility.JoinArray(this.Keys, k => k, " "));
		}
	}
}


module.exports = ExitData;
