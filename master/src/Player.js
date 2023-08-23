Character = require("./Character");
Color = require("./Color");
Players = Array();

class Player extends Character {
  constructor(socket) {
	super();
  	this.socket = socket;
	this.input = "";
	this.output = "";
	this.status = "GetName";
	this.SittingAtPrompt = false;
	this.send = function(data) {
		data = data.replace("\r", "").replace("\n", "\n\r");
		this.output = this.output + Color.ColorString(data, false, false);
	};
	
	this.sendnow = function(data) {
		data = data.replace("\r", "").replace("\n", "\n\r");
		this.socket.write(Color.ColorString(data, false, false));
	};
	
	Players.push(this);
  }

}

module.exports = Player;
module.exports.Players = Players;