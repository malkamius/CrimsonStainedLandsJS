Characters = Array();

class Character {
  	constructor() {
		this.vnum = 0;
		this.name = null;
		this.socket = null;
		this.input = "";
		this.output = "";
		this.Room = null;
		this.ShortDescription = "";
		this.LongDescription = "";
		this.Description = "";
		this.Affects = Array();
		this.Flags = {};
		this.Level = 60;
		this.WeaponDamageMessage = null;
		this.Alignment = "neutral";
		this.Ethos = "neutral";
		this._position = "Standing";
		this.Race = null;
		this.Sex = "neutral";
		this.Size = "Medium";
		this.Material = "unknown";
		this.Inventory = Array();
		this.Equipment = new Map();
		this.AffectedBy = {};
		this.HitPoints = 100;
		this.MaxHitPoints = 100;
		this.ManaPoints = 100;
		this.MaxManaPoints = 100;
		this.MovementPoints = 100;
		this.MaxMovementPoints = 100;
		this.Xp = 0;
		this.XpTotal = 0;
		this._fighting = null;
		this.Fighting = null;
		this.Following = null;
		this.LastFighting = null;
		this.Wait = 0;
		this.Daze = 0;
		this.HitRoll = 0;
		this.DamageRoll = 0;
		this.ArmorClass = 0;
		this.Silver = 0;
		this.Gold = 0;
		this.Hunger = 48;
		this.Thirst = 48;
		this.Drunk = 0;
		this.Starving = 0;
		this.Dehydrated = 0;
		this.Trains = 0;
		this.Practices = 0;
		this.SavingThrow = 0;
		this.PermanentStats = Array(20,20,20,20,20,20);
		this.ModifiedStats = Array(0,0,0,0,0,0);
		this.ArmorBash = 0;
		this.ArmorPierce = 0;
		this.ArmorSlash = 0;
		this.ArmorExotic = 0;
		this.DefaultPosition = "Standing";
		
		
		this.send = function(data) {
		};
		
		this.sendnow = function(data) {
		};
		Characters.push(this);
		
	}
	AddCharacterToRoom(Room) {
		if(this.Room != null)
			this.RemoveCharacterFromRoom();
		this.Room = Room;
		if(Room) {
			Room.Characters.unshift(this);
			Character.DoCommands.DoLook(this, "", true);
		}
	}

	RemoveCharacterFromRoom() {
		if(this.Room != null) {
			var index = this.Room.Characters.indexOf(this);
			if(index >= 0)
				this.Room.Characters.splice(index, 1);
		}
	}

	GetShortDescription(to) {
		if(this.ShortDescription && this.ShortDescription.length > 0)
			return this.ShortDescription;
		else
			return this.name;
	}

	Display(to) {
		return this.GetShortDescription(to);
	}

	GetPrompt() {
		return `<${this.HitPoints}/${this.MaxHitPoints}hp ${this.ManaPoints}/${this.MaxManaPoints}m ${this.MovementPoints}/${this.MaxMovementPoints}mv> `
	}

	Act(message, victim = null, item = null, item2 = null, acttype = "ToChar") {
		if(!message || message.length == 0)
			return;
		if(this.Room == null && acttype != "ToChar")
			return;

		if(acttype == "ToVictim" && (!victim || !victim.Room))
			return;

		if (acttype == "ToRoom" || acttype == "ToRoomNotVictim")
		{
			for (let index = 0; index < this.Room.Characters.length; ++index) {
				const other = this.Room.Characters[index];
				if(other != this && (other != victim || acttype != "ToRoomNotVictim") &&
				other.Position != "Sleeping") {
					var output = this.FormatActMessage(message, other, victim, item, item2);
					other.send(output);
				}
			}
		}
		else if(acttype == "ToVictim") {
			var output = this.FormatActMessage(message, victim, victim, item, item2);
			victim.send(output);
		}
		else if(acttype == "ToChar") {
			var output = this.FormatActMessage(message, this, victim, item, item2);
			this.send(output);
			
		}
	}

	FormatActMessage(message, to, victim, item, item2) {
		var output = "";
		for (var i = 0; i < message.length; i++) {
			if (message[i] == '$') {
				i++;
				if (i < message.length)
				{
					switch (message[i])
					{
						case 'n':
							output += this.Display(to);
							break;
						case 'N':
							if (victim != null)
								output += victim.Display(to);
							break;
						case 'p':
							if (item != null)
								output += item.Display(to);
							break;
						case 'P':
							if (item2 != null)
								output +=item2.Display(to);
							break;
						case 'o':
							if (item != null)
							{
								var display = item.Display(to);
								if (display.startsWith("a ")) display = display.substr(2);
								if (display.startsWith("the ")) display = display.substr(4);
								formatmsg.Append(display);
							}
							break;
						case 'e':
							output += this.Sex == "Male" ? "he" : (this.Sex == "Female" ? "she" : "it");
							break;
						case 'E':
							if (victim != null)
							output += victim.Sex == "Male" ? "he" : (victim.Sex == "Female" ? "she" : "it");
							break;
						case 'm':
							output += this.Sex == "Male" ? "him" : (Sex == "Female" ? "her" : "it");
							break;
						case 'M':
							if (victim != null)
							output += victim.Sex == "Male" ? "him" : (victim.Sex == "Female" ? "her" : "it");
							break;
						case 's':
							output += this.Sex == "Male" ? "his" : (this.Sex == "Female" ? "her" : "their");
							break;
						case 'S':
							if (victim != null)
							output += victim.Sex == "Male" ? "his" : (Sex == "Female" ? "her" : "their");
							break;
	
						case '$':
							output += "$";
							break;
						default:
							output += message[i];
							break;
					}
				}
			}
			else
				output +=message[i];
	
		}
		if (!output.endsWith("\n\r"))
			output += "\n\r";
		
		if (output && output.length > 1)
		{
			if (output.startsWith("\\") && output.length > 3)
			{
				output = output.substring(0, 2) + output[2].toUpperCase() + output.substring(3);
			}
			else
				output = output[0].toUpperCase() + output.substring(1);
		}
		return output;
	}
}



Character.DoCommands = {};
Character.Characters = Characters;
module.exports = Character;


ActInfo = require("./ActInfo");
ActMovement = require("./ActMovement");

