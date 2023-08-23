Characters = Array();

class Character {
  constructor() {
  	this.name = null;
	this.socket = null;
	this.input = "";
	this.output = "";
	this.Room = null;
	
	this.send = function(data) {
	};
	
	this.sendnow = function(data) {
	};
	Characters.push(this);
	
	this.AddCharacterToRoom = function(Room) {
		if(this.Room != null)
			this.RemoveCharacterFromRoom();
		this.Room = Room;
		if(Room) {
			Room.Characters.unshift(this);
			Character.DoCommands.DoLook(this, "", true);
		}
		
	}
	
	this.RemoveCharacterFromRoom = function() {
		if(this.Room != null) {
			var index = this.Room.Characters.indexOf(this);
			if(index && index >= 0)
				this.Room.Characters.splice(index, 1);
		}
	}
  }

}
Character.DoCommands = {};
module.exports = Character;
module.exports.Characters = Characters;

ActInfo = require("./ActInfo");
ActMovement = require("./ActMovement");
