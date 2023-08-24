
const fs = require("fs");
const xml2js = require('xml2js');
const crypto = require('crypto');

const Color = require("./Color");
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility");
const Character = require("./Character");
const ItemData = require("./ItemData");
const RaceData = require("./RaceData");
const RoomData = require("./RoomData");


const parser = new xml2js.Parser({ strict: false, trim: false });

Players = Array();
function getplayerbyname(name) {
	for (const player of Player.Players) {
		if(Utility.Compare(player.Name, name)) {
			return player;
		}
	}
}
class Player extends Character {
	RoomVNum = 0;
	IsNPC = false;
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

  Load(path) {
	var player = this;
	var data =fs.readFileSync(path, {encoding: "ascii"});

	parser.parseString(data, function(err, xml) {
		player.LoadPlayerData(xml.PLAYERDATA);
	});
  }

  LoadPlayerData(xml) {
	if(xml)	{
		this.Name = XmlHelper.GetElementValue(xml,"Name");
		this.ShortDescription = XmlHelper.GetElementValue(xml,"ShortDescription");
		this.LongDescription = XmlHelper.GetElementValue(xml,"LongDescription");
		this.Description = XmlHelper.GetElementValue(xml,"Description");
		this.Sex = XmlHelper.GetElementValue(xml,"Sex");
		this.Level = XmlHelper.GetElementValueInt(xml,"Level");
		this.HitPoints = XmlHelper.GetElementValueInt(xml,"HitPoints");
		this.MaxHitPoints = XmlHelper.GetElementValueInt(xml,"MaxHitPoints");
		this.ManaPoints = XmlHelper.GetElementValueInt(xml,"ManaPoints");
		this.MaxManaPoints = XmlHelper.GetElementValueInt(xml,"MaxManaPoints");
		this.MovementPoints = XmlHelper.GetElementValue(xml,"MovementPoints");
		this.MaxMovementPoints = XmlHelper.GetElementValue(xml,"MaxMovementPoints");
		var race = XmlHelper.GetElementValue(xml,"Race", "human");
		if(!(this.Race = RaceData.LookupRace(race)))
			console.log(`Race ${race} not found`);

		Utility.ParseFlags(this.Flags, XmlHelper.GetElementValue(xml,"Flags"));

		this.RoomVNum = XmlHelper.GetElementValueInt(xml,"Room");
		
		this.Password = XmlHelper.GetElementValue(xml,"Password");
		
		if(xml.EQUIPMENT) {
			for(const equipmentxml of xml.EQUIPMENT) {
				if(equipmentxml.SLOT)
					for(const slotxml of equipmentxml.SLOT) {
						var slotid = slotxml.$.SLOTID;
						if(slotxml.ITEM && slotxml.ITEM) {
							var itemxml = slotxml.ITEM[0];
							var item = player.Equipment[slotid] = new ItemData(itemxml.VNUM[0], null, null);
							item.Load(itemxml);
						}
					}
			}
		}

		if(xml.INVENTORY) {
			for(const inventoryxml of xml.INVENTORY) {
				if(inventoryxml.ITEM)
					for(const itemxml of inventoryxml.ITEM) {
						var item = new ItemData(itemxml.VNUM[0]);
						item.Load(itemxml);
						this.Inventory.push(item);
				}
			}
		}
	}
  } // end LoadPlayerData

  Save(path) {
	if(!path) path = `data/players/${player.Name}.xml`;

	var builder = require('xmlbuilder');
	var xmlelement = builder.create("PlayerData");
	
	xmlelement.ele("Name", this.Name);
	xmlelement.ele("Description", this.Description);
	xmlelement.ele("ShortDescription", this.ShortDescription);
	xmlelement.ele("LongDescription", this.LongDescription);
	xmlelement.ele("Room", parseInt((this.Room? this.Room.VNum : 3700)));
	xmlelement.ele("Race", (this.Race? this.Race.Name : "human"));
	xmlelement.ele("Sex", this.Sex);
	xmlelement.ele("Level", this.Level);
	xmlelement.ele("HitPoints", this.HitPoints);
	xmlelement.ele("MaxHitPoints", this.MaxHitPoints);
	xmlelement.ele("ManaPoints", this.ManaPoints);
	xmlelement.ele("MaxManaPoints", this.MaxManaPoints);
	xmlelement.ele("MovementPoints", this.MovementPoints);
	xmlelement.ele("MaxMovementPoints", this.MaxMovementPoints);
	xmlelement.ele("ArmorBash", this.ArmorBash);
	xmlelement.ele("ArmorSlash", this.ArmorSlash);
	xmlelement.ele("ArmorPierce", this.ArmorPierce);
	xmlelement.ele("ArmorExotic", this.ArmorExotic);
	xmlelement.ele("Xp", this.Xp);
	xmlelement.ele("XpTotal", this.XpTotal);
	xmlelement.ele("Flags", Utility.JoinFlags(this.Flags));
	xmlelement.ele("Password", this.Password);
	
	var inventory = xmlelement.ele("Inventory")
	for(var i = 0; i < this.Inventory.length; i++) {
		this.Inventory[i].Element(inventory);
	}
	
	var equipment = xmlelement.ele("Equipment")
	for(var key in this.Equipment) {
		var slot = equipment.ele("Slot").attribute("SlotID", key);
		this.Equipment[key].Element(slot);
	}
	
  	var xml = xmlelement.end({ pretty: true});
	fs.writeFileSync(path, xml);
  }


	HandleOutput() {

		if(this.output != null && this.output != "")
		{
			if(this.status == "Playing") {
				if (this.Fighting)
				{
					var health = "";
					var hp = parseInt(this.Fighting.HitPoints) / parseInt(this.Fighting.MaxHitPoints);
					if (hp == 1)
						health = "is in perfect health.";
					else if (hp > .8)
						health = "is covered in small scratches.";
					else if (hp > .7)
						health = "has some small wounds.";
					else if (hp > .6)
						health = "has some larger wounds.";
					else if (hp > .5)
						health = "is bleeding profusely.";
					else if (hp > .4)
						health = "writhing in agony.";
					else if (hp > 0)
						health = "convulsing on the ground.";
					else
						health = "is dead.";
					//output.Append(fighting.Display(this) + " " + health + "\n\r");
					this.Act("$N " + health + "\n\r", this.Fighting);
				}
				this.output = this.output + "\n\r" + this.GetPrompt();
				if (this.SittingAtPrompt && !this.output.startsWith("\n\r"))
				this.output = "\n\r" + this.output;
			}
			
			this.output = this.output.replace("\r", "");
			this.socket.write(player.output.replace("\n", "\n\r"), "ascii");
			this.SittingAtPrompt = true;
		}

		this.output = "";

	}

	HandleInput() {
		if(this.input != "")
		{
			var index = this.input.indexOf("\n");
			if(index != -1 && index != null)
			{
				var str = this.input.substring(0, index);
				if(index < this.input.length)
					this.input = this.input.substring(index + 1);
				else
					this.input = "";
				
				if(this.status != "Playing") {			
					this.nanny(str);
				}
				else if(this.status == "Playing") {
					var args = Utility.OneArgument(str);
					if(args[0] == "")
					{
						this.send("\n\r");
						this.SittingAtPrompt = false;
						return;
					}
					const Commands = require("./Commands");
					for(var key in Commands) {
						if(Utility.Prefix(key, args[0])) {
							Commands[key](this, args[1]);
							this.SittingAtPrompt = false;
							return;
						}
					}
					
					this.send("Huh?\n\r");
					this.SittingAtPrompt = false;
				}
			}
		}
	}

	nanny(input) {
		if(this.status == "GetName") {
			if(!input || input.length < 3 || input.length > 12) {
				this.send("Name must be between 3 and 12 characters long.\n\r");
				this.send(`What is your name? `);
				return true;
			}

			var regex = /\s/;
			var result = regex.exec(input);
			if(result && result.index >= 0) {
				this.send("Name cannot contain whitespace.\n\r");
				this.send(`What is your name? `);
				return true;
			}
			var otherplayer = getplayerbyname(input);
			if(otherplayer) {
				this.send(`That name is already taken.\n`);
				this.send(`What is your name? `);
				return true;
			}
			regex = /[^A-Za-z]+/;
			result = regex.exec(input);

			if(result && result.index >= 0 && result.length > 0) {
				this.send("Name can only contain characters in the alphabet.\n\r");
				this.send(`What is your name? `);
				return true;
			}

			player.Name = Utility.Capitalize(input);
			if(fs.existsSync(`data/players/${this.Name}.xml`)) {
				this.Load(`data/players/${this.Name}.xml`);
				this.status = "GetPassword";
				this.send("Enter your password: ");
				return true;
			} else {
				this.status = "Playing";
				Character.DoCommands.DoHelp(this, "greeting");
				this.send("\n\rWelcome to the Crimson Stained Lands!\n\r\n\r");
				this.AddCharacterToRoom(RoomData.Rooms["3700"]);
				this.Act("The form of $n appears before you.", null, null, null, "ToRoom");
				return true;
			}
				
		}
		if(this.status == "GetPassword") {
			let hash = crypto.createHash('md5').update(input + "salt").digest("hex");
			if(!Utility.Compare(hash, this.Password)) {
				this.sendnow("Incorrect password.\n\r");
				this.socket.destroy();
				Player.Players.splice(Player.Players.indexOf(player), 1);
				console.log(`${this.Name} disconnected - incorrect password`);
			}
			else {
				this.status = "Playing";
				

				Character.DoCommands.DoHelp(this, "greeting");
				this.send("\n\rWelcome to the Crimson Stained Lands!\n\r\n\r");
				var room = RoomData.Rooms[this.RoomVNum];
				this.AddCharacterToRoom(room? room : RoomData.Rooms["3700"]);
				this.Act("The form of $n appears before you.", null, null, null, "ToRoom");
			}
			return true;
			
		}
		return false;
	}
}
Player.Players = Players;
module.exports = Player;
//module.exports.Players = Players;