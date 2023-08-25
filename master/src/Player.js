
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
const PcRaceData = require("./PcRaceData");
const GuildData = require("./GuildData");


const parser = new xml2js.Parser({ strict: false, trim: false });

Players = Array();
function GetPlayerByName(name, extracondition) {
	for (const player of Player.Players) {
		if(Utility.Compare(player.Name, name) && (!extracondition || extracondition(player))) {
			return player;
		}
	}
}
function GetPlayer(socket) {
	for (const player of Player.Players) {
		if(player.socket == socket) {
			return player;
		}
	}
}
class Player extends Character {
	RoomVNum = 0;
	IsNPC = false;
	PcRace = null;

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
		this.Alignment = XmlHelper.GetElementValue(xml,"Alignment");
		this.Ethos = XmlHelper.GetElementValue(xml,"Ethos");
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
		var guild = XmlHelper.GetElementValue(xml, "Guild", "warrior");
		if(!(this.Guild = GuildData.Lookup(guild, false)))
			console.log(`Guild ${guild} not found`);
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
	xmlelement.ele("Guild", (this.Guild? this.Guild.Name : "warrior"));
	xmlelement.ele("Alignment", this.Alignment);
	xmlelement.ele("Ethos", this.Ethos);
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
		switch(this.status) {
			case "GetName":
				if(!input || input.length < 3 || input.length > 12) {
					this.send("Name must be between 3 and 12 characters long.\n\r");
					this.SetStatus("GetName");
					break;
				}

				var regex = /\s/;
				var result = regex.exec(input);
				if(result && result.index >= 0) {
					this.send("Name cannot contain whitespace.\n\r");
					this.SetStatus("GetName");
					break;
				}
				// var otherplayer = GetPlayerByName(input);
				// if(otherplayer) {
				// 	this.send(`That name is already taken.\n`);
				// 	this.SetStatus("GetName");
				// 	break;
				// }
				regex = /[^A-Za-z]+/;
				result = regex.exec(input);

				if(result && result.index >= 0 && result.length > 0) {
					this.send("Name can only contain characters in the alphabet.\n\r");
					this.SetStatus("GetName");
					break;
				}

				player.Name = Utility.Capitalize(input);
				if(fs.existsSync(`data/players/${this.Name}.xml`)) {
					this.Load(`data/players/${this.Name}.xml`);
					if(this.Password != "") {
						this.SetStatus("GetPasswordExisting");
					} else {
						this.SetStatus("CreateNewPassword");
					}
					
				} else {
					this.send("New player detected.\n\r");
					this.SetStatus("GetNewPassword");
					
				}
				break;
			case "CreateNewPassword":
				this.Password = crypto.createHash('md5').update(input + "salt").digest("hex");
				this.SetStatus("ConfirmNewPassword");
				break;
			case "ConfirmNewPassword":
				if(this.Password == crypto.createHash('md5').update(input + "salt").digest("hex")) {
					
					if(GetPlayerByName(this.Name, (player) => player != this)) {
						this.SetStatus("PlayerAlreadyConnected");
					}
					else {
						this.SetStatus("Playing");	
						this.Save();
					}
				}
				else {
					this.send("Input didn't match.\n\r");
					this.SetStatus("CreateNewPassword")
				}
				break;
			case "GetNewPassword":
				this.Password = crypto.createHash('md5').update(input + "salt").digest("hex");
				this.SetStatus("ConfirmPassword");
				break;
			case "ConfirmPassword":
				if(this.Password == crypto.createHash('md5').update(input + "salt").digest("hex")) {
					this.SetStatus("GetColorOn")
				}
				else {
					this.send("Input didn't match.\n\r");
					this.SetStatus("GetNewPassword")
				}
				break;
			case "GetColorOn":
				if(Utility.Prefix("yes", input)) {
					this.Flags.Color = true;
				} else if (Utility.Prefix("no", input)) {
					delete this.Flags.Color;
				} else {
					this.SetStatus("GetColorOn");
					break;
				}
				this.SetStatus("GetSex");
				break;
			case "GetSex":
				if(Utility.Prefix("male", input)) {
					this.Sex = "male";
				} else if(Utility.Prefix("female", input)) {
					this.Sex = "female";
				} else {
					this.SetStatus("GetSex");
					break;
				}
				this.SetStatus("GetRace")
				break;
			case "GetRace":
				 var race = null;
				 
				 if(!(race = PcRaceData.LookupRace(input, true)) || !(this.Race = RaceData.LookupRace(race.Name))) {
					this.SetStatus("GetRace");
				 } else {
					this.PcRace = race;
					this.Size = this.Race.Size;
					this.PermanentStats = Utility.CloneArray(this.Race.Stats);
					this.SetStatus("GetGuild");
				 }
				 break;
			case "GetGuild":
				for(var guild of GuildData.Guilds) {
					if(Utility.Prefix(guild.Name, input)) {
						for(var race of guild.Races) {
							if(Utility.Compare(race.Name, this.Race.Name)) {
								this.Guild = guild;
								break;
							}
						}
					}
				}

				if(!this.Guild)
					this.SetStatus("GetGuild");
				else if(this.Guild.StartingWeapon == "0" || this.Guild.StartingWeapon == 0) {
					this.SetStatus("GetDefaultWeapon");
				} else {
					this.SetStatus("GetAlignment");
				}
				break;
			case "GetDefaultWeapon":
				var index;
                var weapons =  ["sword", "axe", "spear", "staff", "dagger", "mace", "whip", "flail", "polearm"];
                var weaponVNums =[ 40000, 40001, 40004, 40005, 40002, 40003, 40006, 40007, 40020 ];

				for(var i = 0; i < weapons.length; i++) {
					if(Utility.Prefix(weapons[i], input)) {
						var weapon = new ItemData(weaponVNums[i]);
						weapon.CarriedBy = this;
						this.Equipment.Wield = weapon;
						// TODO Set skill to 75
						this.SetStatus("GetAlignment");
						break;
					}
				}

				this.SetStatus("GetDefaultWeapon");
				break;
			case "GetAlignment":
				var guildchoice;
				var racechoice;
				for(var alignment of this.Guild.Alignments) {
					if(Utility.Prefix(alignment, input)) {
						guildchoice = alignment;
					}
				}
				for(alignment of this.PcRace.Alignments) {
					if(Utility.Prefix(alignment, input)) {
						racechoice = alignment;
					}
				}

				if(racechoice && guildchoice && Utility.Compare(racechoice,guildchoice)) {
					this.Alignment = racechoice;
					this.send("You are " + this.Alignment.toLowerCase() + ".\n\r");
					this.SetStatus("GetEthos");
				} else {
					this.SetStatus("GetAlignment");
				}

				break;
			case "GetEthos":
				for(var ethos of this.PcRace.Ethos) {
					if(Utility.Prefix(ethos, input)) {
						this.Ethos = ethos;
						this.Save();
						this.SetStatus("Playing");
						break;	
					}
				}
				if(!this.Ethos)
					this.SetStatus("GetEthos");

				break;
			case "GetPasswordExisting":
				let hash = crypto.createHash('md5').update(input + "salt").digest("hex");
				if(!Utility.Compare(hash, this.Password)) {
					this.sendnow("Incorrect password.\n\r");
					this.socket.destroy();
					Player.Players.splice(Player.Players.indexOf(this), 1);
					console.log(`${this.Name} disconnected - incorrect password`);
				}
				else {
					if(GetPlayerByName(this.Name, (player) => player != this)) {
						this.SetStatus("PlayerAlreadyConnected");
					}
					else
						this.SetStatus("Playing");					
				}
				break;
			case "PlayerAlreadyConnected":
				if(Utility.Prefix("no", input)) {
					this.sendnow("Goodbye then.\n\r");
					this.socket.destroy();
					Player.Players.splice(Player.Players.indexOf(this), 1);
					console.log(`${this.Name} disconnected - already playing`);
				} else if(Utility.Prefix("yes", input)) {
					var other = GetPlayerByName(this.Name, (player) => player != this);
					other.sendnow("Your character is being logged in elsewhere.\n\r");
					other.Act("$n loses their animation.", null, null, null, "ToRoom");
					other.socket.destroy();
					other.socket = this.socket;
					Player.Players.splice(Player.Players.indexOf(this), 1);
					other.SetStatus("Playing");
				} else {
					var other = GetPlayerByName(this.Name, (player) => player != this);
					if(!other) {
						this.SetStatus("Playing");
					} else {
						this.SetStatus("PlayerAlreadyConnected");
					}
				}

			default: return false;
		}
		return true;
	}

	SetStatus(status) {
		this.status = status;
		switch(this.status) {
			case "GetName":
				this.send(`What is your name? `);
				break;
			case "GetNewPassword":
				this.send("Please enter your new password: ");
				break;
			case "ConfirmPassword":
				this.send("Please confirm your new password: ");
				break;
			case "GetColorOn":
				this.send("Would you like to enable color? (yes/no) ");
				break;
			case "GetSex":
				this.send("What is your sex? (Male, Female) ")
				break;
			case "GetRace":
				var races = "";
				 for(var race of PcRaceData.PcRaces) { 
					races = races + (races.length > 0? ", ": "") + race.Name.toLowerCase();
				 }
				 this.send("What is your race? (" + races + ") ");
				 break;
			case "GetGuild":
				var guilds = "";
				for(var guild of GuildData.Guilds) {
					
					for(var race of guild.Races) {
						if(Utility.Compare(race.Name, this.Race.Name)) {
							guilds = guilds + (guilds.length > 0? ", " : "") + guild.Name;
							break;
						}
					}
					
				}
				this.send("What is your guild? (" + guilds + ") ");
				break;
			case "GetAlignment":
				if(this.PcRace.Alignments.length == 1) {
					this.Alignment = this.PcRace.Alignments[0];
					this.send("You are " + this.Alignment.toLowerCase() + ".\n\r");
					this.SetStatus("GetEthos")
				} else if(this.Guild.Alignments.length == 1) {
					this.Alignment = this.Guild.Alignments[0];
					this.send("You are " + this.Alignment.toLowerCase() + ".\n\r");
					this.SetStatus("GetEthos")
				} else {
					var alignments = "";
					for(var racealign of this.PcRace.Alignments) {
						for(var guildalign of this.Guild.Alignments) {
							if(Utility.Compare(racealign, guildalign)) {
								alignments = alignments + (alignments.length > 0? ", " : "") + racealign.toLowerCase();
							}
						}
					}
					this.send("What is your alignment? (" + alignments + ") ");
				}
				break;
			case "GetEthos":
				if(this.PcRace.Ethos.length == 1) {
					this.Ethos = this.PcRace.Ethos[0];
					this.send("You are " + this.Ethos.toLowerCase() + ".\n\r");
					this.Save();
					this.SetStatus("Playing");
				} else {
					this.send("What is your ethos? (" + Utility.JoinArray(this.PcRace.Ethos, (str) => str.toLowerCase()) + ") ");
				}
				break;
			case "GetPasswordExisting":
				this.send("Enter your password: ");
				break;
			case "CreateNewPassword":
				this.send("Please enter a new password: ");
				break;
			case "ConfirmNewPassword":
				this.send("Please confirm your new password: ");
				break;
			case "PlayerAlreadyConnected":
				this.send("That player is already connected, continuing will disconnect them.\n\rContinue? (yes/no) ");
				break;
			case "Playing":
				Character.DoCommands.DoHelp(this, "greeting");
				this.send("\n\rWelcome to the Crimson Stained Lands!\n\r\n\r");
				if(!this.Room) {
					var room = RoomData.Rooms[this.RoomVNum];
					this.AddCharacterToRoom(room? room : RoomData.Rooms["3700"]);
					this.Act("The form of $n appears before you.", null, null, null, "ToRoom");
				} else {
					Character.DoCommands.DoLook(this, "", true);
					this.Act("$n regains their animation.", null, null, null, "ToRoom");
				}

				break;
		}

	}
}
Player.GetPlayer = GetPlayer;
Player.GetPlayerByName = GetPlayerByName;
Player.Players = Players;
module.exports = Player;
//module.exports.Players = Players;