Characters = Array();

class Character {
	vnum = 0;
	name = null;
	socket = null;
	input = "";
	output = "";
	Room = null;
	ShortDescription = "";
	LongDescription = "";
	Description = "";
	Affects = Array();
	Flags = {};
	Level = 60;
	WeaponDamageMessage = null;
	Alignment = "neutral";
	Ethos = "neutral";
	_position = "Standing";
	Race = null;
	Sex = "neutral";
	Size = "Medium";
	Material = "unknown";
	Inventory = Array();
	Equipment = new Map();
	AffectedBy = {};
	HitPoints = 100;
	MaxHitPoints = 100;
	ManaPoints = 100;
	MaxManaPoints = 100;
	MovementPoints = 100;
	MaxMovementPoints = 100;
	Xp = 0;
	XpTotal = 0;
	_fighting = null;
	Fighting = null;
	Following = null;
	LastFighting = null;
	Wait = 0;
	Daze = 0;
	HitRoll = 0;
	DamageRoll = 0;
	ArmorClass = 0;
	Silver = 0;
	Gold = 0;
	Hunger = 48;
	Thirst = 48;
	Drunk = 0;
	Starving = 0;
	Dehydrated = 0;
	Trains = 0;
	Practices = 0;
	SavingThrow = 0;
	PermanentStats = Array(20,20,20,20,20,20);
	ModifiedStats = Array(0,0,0,0,0,0);
	ArmorBash = 0;
	ArmorPierce = 0;
	ArmorSlash = 0;
	ArmorExotic = 0;
	DefaultPosition = "Standing";
		
  	constructor() {
		Characters.push(this);
	}

	send(data) {}
	sendnow(data) {}

	get Position() {
		return this._position;
	}

	set Position(value) {
		this._position = value;
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

	GetLongDescription() {
		if(this.Position == this.DefaultPosition && this.LongDescription && this.LongDescription.length > 0)
			return this.LongDescription;
		return "$N is " + this.Position.toLowerCase() + " here.\n\r"
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

