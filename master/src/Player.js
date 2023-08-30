
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
const AffectData = require("./AffectData");
const Settings = require("./Settings");
const SkillSpell = require("./SkillSpell");
const SkillGroup = require("./SkillGroup");

const parser = new xml2js.Parser({ strict: false, trim: false });

class Player extends Character {
	static Players = Array();
	static PlayersOnlineAtOnceSinceLastReboot = 0;

	static TelnetOptionFlags = {
            ColorRGB: "ColorRGB",
            Color256: "Color256",
            SuppressGoAhead: "SuppressGoAhead",
            MUDeXtensionProtocol: "MUDeXtensionProtocol",
            WontMSSP: "WontMSSP",
            Ansi: "Ansi"
	};

	TelnetOptions = {};
	inanimate = null;
	RoomVNum = 0;
	IsNPC = false;
	PcRace = null;
	Title = "";
	ExtendedTitle = "";
	socket = null;
	input = "";
	output = "";
	status = "GetName";
	SittingAtPrompt = false;
	Prompt = "";
	ClientTypes = Array();

  	constructor(socket) {
		super();
		this.socket = socket;
		Player.Players.push(this);
  	}

	static GetPlayerByName(name, extracondition) {
		for (const player of Player.Players) {
			if(Utility.Compare(player.Name, name) && (!extracondition || extracondition(player))) {
				return player;
			}
		}
	}
	
	static GetPlayer(socket) {
		for (const player of Player.Players) {
			if(player.socket == socket) {
				return player;
			}
		}
	}
  	
	send(data, ...params) {
		data = Utility.Format(data.replace("\r", "").replace("\n", "\n\r"), params);
		this.output = this.output + Color.ColorString(data, !this.Flags.Color, this.TelnetOptions.Color256, this.TelnetOptions.ColorRGB);
	}
  	
	sendnow = function(data, ...params) {
		data = Utility.Format(data.replace("\r", "").replace("\n", "\n\r"), params);
		this.socket.write(Color.ColorString(data, !this.Flags.Color, this.TelnetOptions.Color256, this.TelnetOptions.ColorRGB));
	};
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
		this.Title = XmlHelper.GetElementValue(xml,"Title");
		this.ExtendedTitle = XmlHelper.GetElementValue(xml,"ExtendedTitle");
		this.Alignment = XmlHelper.GetElementValue(xml,"Alignment");
		this.Ethos = XmlHelper.GetElementValue(xml,"Ethos");
		this.Sex = XmlHelper.GetElementValue(xml,"Sex");
		this.Level = XmlHelper.GetElementValueInt(xml,"Level");

		this.DamageRoll = XmlHelper.GetElementValueInt(xml,"DamRoll");
		this.HitRoll = XmlHelper.GetElementValueInt(xml,"HitRoll");
		this.ArmorClass = XmlHelper.GetElementValueInt(xml,"ArmorClass");
		this.Silver = XmlHelper.GetElementValueInt(xml,"Silver");
		this.Gold = XmlHelper.GetElementValueInt(xml,"Gold");
		this.SilverBank = XmlHelper.GetElementValueInt(xml,"SilverBank");
		this.Practices = XmlHelper.GetElementValueInt(xml,"Practices");
		this.Trains = XmlHelper.GetElementValueInt(xml,"Trains");
		this.Hunger = XmlHelper.GetElementValueInt(xml,"Hunger");
		this.Thirst = XmlHelper.GetElementValueInt(xml,"Thirst");
		this.SavingThrow = XmlHelper.GetElementValueInt(xml,"SavingThrow");

		this.AffectedBy = {};
		Utility.ParseFlags(this.AffectedBy, XmlHelper.GetElementValue("AffectedBy"));

		this.HitPoints = XmlHelper.GetElementValueInt(xml,"HitPoints");
		this.MaxHitPoints = XmlHelper.GetElementValueInt(xml,"MaxHitPoints");
		this.ManaPoints = XmlHelper.GetElementValueInt(xml,"ManaPoints");
		this.MaxManaPoints = XmlHelper.GetElementValueInt(xml,"MaxManaPoints");
		this.MovementPoints = XmlHelper.GetElementValue(xml,"MovementPoints");
		this.MaxMovementPoints = XmlHelper.GetElementValue(xml,"MaxMovementPoints");
		var race = XmlHelper.GetElementValue(xml,"Race", "human");
		if(!(this.Race = RaceData.LookupRace(race)))
			console.log(`Race ${race} not found`);
		if(!(this.PcRace = PcRaceData.LookupRace(race)))
			console.log(`Race ${race} not found`);
		var guild = XmlHelper.GetElementValue(xml, "Guild", "warrior");
		if(!(this.Guild = GuildData.Lookup(guild, false)))
			console.log(`Guild ${guild} not found`);
		Utility.ParseFlags(this.Flags, XmlHelper.GetElementValue(xml,"Flags"));

		if(xml.PERMANENTSTATS) {
			var stats = xml.PERMANENTSTATS[0];
			this.PermanentStats[0] = XmlHelper.GetElementValueInt(stats, "STRENGTH");
			this.PermanentStats[1] = XmlHelper.GetElementValueInt(stats, "WISDOM");
			this.PermanentStats[2] = XmlHelper.GetElementValueInt(stats, "INTELLIGENCE");
			this.PermanentStats[3] = XmlHelper.GetElementValueInt(stats, "DEXTERITY");
			this.PermanentStats[4] = XmlHelper.GetElementValueInt(stats, "CONSTITUTION");
			this.PermanentStats[5] = XmlHelper.GetElementValueInt(stats, "CHARISMA");
		}

		if(xml.MODIFIEDSTATS) {
			var stats = xml.MODIFIEDSTATS[0];
			
			this.ModifiedStats[0] = XmlHelper.GetElementValueInt(stats, "STRENGTH");
			this.ModifiedStats[1] = XmlHelper.GetElementValueInt(stats, "WISDOM");
			this.ModifiedStats[2] = XmlHelper.GetElementValueInt(stats, "INTELLIGENCE");
			this.ModifiedStats[3] = XmlHelper.GetElementValueInt(stats, "DEXTERITY");
			this.ModifiedStats[4] = XmlHelper.GetElementValueInt(stats, "CONSTITUTION");
			this.ModifiedStats[5] = XmlHelper.GetElementValueInt(stats, "CHARISMA");
		}
		
		if(xml.LEARNED) {
			for(var learned of xml.LEARNED) {
				if(learned.SKILLSPELL)
				for(var sp of learned.SKILLSPELL) {
					var name = XmlHelper.GetAttributeValue(sp, "Name");
					var percent = XmlHelper.GetAttributeValueInt(sp, "Value");
					var level = XmlHelper.GetAttributeValueInt(sp, "Level");
					var learnedas = {};
					Utility.ParseFlags(learnedas, XmlHelper.GetAttributeValue("LearnedAs", "Skill Spell Song Supplication"));
					this.Learned[name] = {Name: name, Percent: percent, Level: level, LearnedAs: learnedas};
				}
			}
		}
		
		this.RoomVNum = XmlHelper.GetElementValueInt(xml,"Room");
		this.Prompt = XmlHelper.GetElementValue(xml,"Prompt");

		this.Password = XmlHelper.GetElementValue(xml,"Password");

		if(xml.AFFECTS) {
            this.Affects = Array();
            for(const affectsxml of xml.AFFECTS) {
				if(affectsxml.AFFECT)
                    for(const affectxml of affectsxml.AFFECT) {
                        var affect = new AffectData({Xml: affectxml});
                        this.Affects.push(affect);
                    }
                }
        }
		
		if(xml.EQUIPMENT) {
			for(const equipmentxml of xml.EQUIPMENT) {
				if(equipmentxml.SLOT)
					for(const slotxml of equipmentxml.SLOT) {
						var slotid = slotxml.$.SLOTID;
						if(slotxml.ITEM && slotxml.ITEM) {
							var itemxml = slotxml.ITEM[0];
							var item = this.Equipment[slotid] = new ItemData(itemxml.VNUM[0], null, null);
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
		if(!path) path = Settings.PlayerDataPath + `/${this.Name}.xml`;

		var builder = require('xmlbuilder');
		var xmlelement = builder.create("PlayerData");
		
		xmlelement.ele("Name", this.Name);
		xmlelement.ele("Description", this.Description);
		xmlelement.ele("ShortDescription", this.ShortDescription);
		xmlelement.ele("LongDescription", this.LongDescription);
		xmlelement.ele("Title", this.Title);
		xmlelement.ele("ExtendedTitle", this.ExtendedTitle);
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

		xmlelement.ele("DamRoll", this.DamageRoll);
		xmlelement.ele("HitRoll", this.HitRoll);
		xmlelement.ele("ArmorClass", this.ArmorClass);
		xmlelement.ele("Silver", this.Silver);
		xmlelement.ele("Gold", this.Gold);
		xmlelement.ele("SilverBank", this.SilverBank);
		xmlelement.ele("Practices", this.Practices);
		xmlelement.ele("Trains", this.Trains);
		xmlelement.ele("Hunger", this.Hunger);
		xmlelement.ele("Thirst", this.Thirst);
		xmlelement.ele("SavingThrow", this.SavingThrow);

		xmlelement.ele("AffectedBy", Utility.JoinFlags(this.AffectedBy));
		
		
		var stats = xmlelement.ele("PermanentStats");
		stats.ele("Strength", this.PermanentStats[0]);
		stats.ele("Wisdom", this.PermanentStats[1]);
		stats.ele("Intelligence", this.PermanentStats[2]);
		stats.ele("Dexterity", this.PermanentStats[3]);
		stats.ele("Constitution", this.PermanentStats[4]);
		stats.ele("Charisma", this.PermanentStats[5]);
		stats = xmlelement.ele("ModifiedStats");
		stats.ele("Strength", this.ModifiedStats[0]);
		stats.ele("Wisdom", this.ModifiedStats[1]);
		stats.ele("Intelligence", this.ModifiedStats[2]);
		stats.ele("Dexterity", this.ModifiedStats[3]);
		stats.ele("Constitution", this.ModifiedStats[4]);
		stats.ele("Charisma", this.ModifiedStats[5]);

		var learnedele = xmlelement.ele("Learned");
		for(var skillname in this.Learned) {
			var learned = this.Learned[skillname];
			var skillele = learnedele.ele("SkillSpell");
			skillele.attribute("Name", learned.Name);
			skillele.attribute("Value", learned.Percent);
			skillele.attribute("Level", learned.Level);
			skillele.attribute("LearnedAs", Utility.JoinFlags(learned.LearnedAs));
		}
		xmlelement.ele("ArmorBash", this.ArmorBash);
		xmlelement.ele("ArmorSlash", this.ArmorSlash);
		xmlelement.ele("ArmorPierce", this.ArmorPierce);
		xmlelement.ele("ArmorExotic", this.ArmorExotic);
		xmlelement.ele("Xp", this.Xp);
		xmlelement.ele("XpTotal", this.XpTotal);
		xmlelement.ele("Flags", Utility.JoinFlags(this.Flags));

		if(this.Affects && this.Affects.length > 0) {
			var affectselement = itemele.ele("Affects");
			for(var affect of this.Affects) {
				affect.Element(affectselement);
			}
		}

		var inventory = xmlelement.ele("Inventory")
		for(var i = 0; i < this.Inventory.length; i++) {
			if(this.Inventory[i].VNum == 0 || !this.Inventory[i] || !this.Inventory[i].Template) continue;
			this.Inventory[i].Element(inventory);
		}
		
		var equipment = xmlelement.ele("Equipment")
		for(var key in this.Equipment) {
			if(this.Equipment[key]) {
				if(this.Equipment[key].VNum == 0 || !this.Equipment[key] || !this.Equipment[key].Template) continue;
				var slot = equipment.ele("Slot").attribute("SlotID", key);
				this.Equipment[key].Element(slot);
			}
		}
		xmlelement.ele("Prompt", this.Prompt);

		xmlelement.ele("Password", this.Password);

		var xml = xmlelement.end({ pretty: true});
		fs.writeFileSync(path, xml);
	}


	HandleOutput() {

		if(this.output != null && this.output != "")
		{
			this.output = this.output.replace("\r", "");
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
					this.Act("$N " + health + "\n", this.Fighting);
				}
				this.output = this.output + (!this.output.endsWith("\n\n")? "\n" : "") + this.GetPrompt();
				if (this.SittingAtPrompt && !this.output.startsWith("\n"))
				this.output = "\n" + this.output;
			}
			
			this.output = this.output.replace("\r", "");
			if(!this.output.endsWith("\n"))
				this.output += "\u00FF\u00F9";
			this.socket.write(this.output.replace("\n", "\n\r"), "ascii");
			
			this.SittingAtPrompt = true;
		}

		this.output = "";

	}

	HandleInput() {
		if(this.input != "")
		{
			this.input = this.input.replace("\r", "");
			var index = this.input.indexOf("\n");
			if(index != -1 && index != null)
			{
				var str = this.input.substring(0, index);
				if(index < this.input.length)
					this.input = this.input.substring(index + 1);
				else
					this.input = "";
				
				if(this.status == "Playing" || str.toLowerCase().startsWith("help")) {
					var args, command;
					[command, args] = str.oneArgument();
					if(command.IsNullOrEmpty())
					{
						this.send("\n\r");
						this.SittingAtPrompt = false;
						return;
					}
					const Commands = require("./Commands");
					for(var key in Commands) {
						if(Utility.Prefix(key, command)) {
							this.LastActivity = new Date();
							Commands[key](this, args);
							if(this.status != "Playing")
								this.SetStatus(this.status);
							this.SittingAtPrompt = false;
							
							return;
						}
					}
					
					this.send("Huh?\n\r");
					this.SittingAtPrompt = false;
					this.LastActivity = new Date();
				}
				else if(this.status != "Playing") {			
					this.nanny(str);
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

				this.Name = Utility.Capitalize(input);
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
					
					if(Player.GetPlayerByName(this.Name, (player) => player != this)) {
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

				if(!this.Guild) {
					this.SetStatus("GetGuild");
					return true;
				}
				else if(Utility.IsNullOrEmpty(this.Guild.StartingWeapon) ||
				this.Guild.StartingWeapon == "0" || 
				this.Guild.StartingWeapon == 0) {
					this.SetStatus("GetDefaultWeapon");
				} else {
					var weapons =  ["sword", "axe", "spear", "staff", "dagger", "mace", "whip", "flail", "polearm"];
                	var weaponVNums =[ 40000, 40001, 40004, 40005, 40002, 40003, 40006, 40007, 40020 ];
					var index = weaponVNums.indexOf(this.Guild.StartingWeapon);
					if(index >= 0) {
						this.Learned[weapons[index]] = {Name: weapons[index], Percent: 75, Level: 1, LearnedAs: {Skill: true}};
					}
					var weapon = new ItemData(this.Guild.StartingWeapon);
					weapon.CarriedBy = this;
					this.Equipment.Wield = weapon;
					this.SetStatus("GetAlignment");
				}
				this.Learned["recall"] = {Name: "recall", Percent: 100, Level: 1, LearnedAs: {Skill: true}};
				
				var groupname;
				if((groupname = this.Guild.GuildBasicsGroup)) {
					var basicsgroup = SkillGroup.Lookup(groupname);

					if(basicsgroup) {
						var skills = basicsgroup.Skills;

						while(!skills.IsNullOrEmpty()) {
							var skillname;
							[skillname, skills] = skills.oneArgument();
							var skill = SkillSpell.GetSkill(skillname);
							
							if(skill) {
								var learnastype = {Skill: true};
								if(skill.SkillTypes["Skill"]) learnastype = {Skill: true};
								else if(skill.SkillTypes["Supplication"] && this.Guild.CastType == "Commune") learnastype = {Supplication: true};
								else if(skill.SkillTypes["Spell"] && this.Guild.CastType == "Cast") learnastype = {Spell: true};
								else if(skill.SkillTypes["Song"] && this.Guild.CastType == "Sing") learnastype = {Song: true};
								this.Learned[skill.Name] = {Name: skill.Name, Percent: 100, Level: 1, LearnedAs: learnastype};
							}
						}
					}
				}

				for(var skillname in SkillSpell.Skills)
				{
					var skill = SkillSpell.Skills[skillname];
					var percent = this.GetSkillPercentage(skill.Name);
					var lvl = this.GetLevelSkillLearnedAt(skill.Name);
					var learnastype = {Skill: true};
					if(skill.SkillTypes["Skill"]) learnastype = {Skill: true};
					else if(skill.SkillTypes["Supplication"] && this.Guild.CastType == "Commune") learnastype = {Supplication: true};
					else if(skill.SkillTypes["Spell"] && this.Guild.CastType == "Cast") learnastype = {Spell: true};
					else if(skill.SkillTypes["Song"] && this.Guild.CastType == "Sing") learnastype = {Song: true};

					if (lvl < 52 && (!this.Learned[skill.Name] || this.Learned[skill.Name].Percent <= 1)) 
					{
						this.Learned[skill.Name] = {Name: skill.Name, Percent: 1, Level: lvl, LearnedAs: learnastype};
					}
					
				}
				//console.dir(this.Learned);
				break;
			case "GetDefaultWeapon":
                var weapons =  ["sword", "axe", "spear", "staff", "dagger", "mace", "whip", "flail", "polearm"];
                var weaponVNums =[ 40000, 40001, 40004, 40005, 40002, 40003, 40006, 40007, 40020 ];

				for(var i = 0; i < weapons.length; i++) {
					if(Utility.Prefix(weapons[i], input)) {
						var weapon = new ItemData(weaponVNums[i]);
						weapon.CarriedBy = this;
						this.Equipment.Wield = weapon;
						this.Learned[weapons[i]] = {Name: weapons[i], Percent: 75, Level: 1, LearnedAs: {Skill: true}};
						// TODO Set skill to 75
						this.SetStatus("GetAlignment");
						return true;
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
					if(Player.GetPlayerByName(this.Name, (player) => player != this && player.status == "Playing")) {
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
					var other = Player.GetPlayerByName(this.Name, (player) => player != this);
					if(other) {
						if(!other.socket.destroyed) {
							other.sendnow("Your character is being logged in elsewhere.\n\r");
							other.Act("$n loses their animation.", null, null, null, "ToRoom");
							other.socket.destroy();
						}
						other.inanimate = null;
						other.socket = this.socket;
						// The other player took over this socket, remove this player
						Player.Players.splice(Player.Players.indexOf(this), 1);
						this.socket = null;
					}
					other.SetStatus("Playing");
				} else {
					var other = Player.GetPlayerByName(this.Name, (player) => player != this);
					if(!other) {
						this.SetStatus("Playing");
					} else {
						this.SetStatus("PlayerAlreadyConnected");
					}
				}

			default: return false;
		}
		return true;
	} // end of nanny

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
			case "GetDefaultWeapon":
				var weapons =  ["sword", "axe", "spear", "staff", "dagger", "mace", "whip", "flail", "polearm"];
                
				this.send("Choose a weapon to start with: (" + Utility.JoinArray(weapons) + ") ");
	
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
				Character.DoCommands.DoHelp(this, "greeting", true);
				Character.DoCommands.DoHelp(this, "MOTD", false);
				this.send("\n\rWelcome to the Crimson Stained Lands!\n\r\n\r");
				if(!this.Room) {
					var room = RoomData.Rooms[this.RoomVNum];
					this.AddCharacterToRoom(room? room : RoomData.Rooms["3700"]);
					this.Act("The form of $n appears before you.", null, null, null, "ToRoom");
				} else {
					Character.DoCommands.DoLook(this, "", true);
					this.Act("$n regains their animation.", null, null, null, "ToRoom");
				}

				this.LastActivity = new Date();

				var count = 0;
				for(var player of Player.Players)
					if(player.status == "Playing" && player.socket != null) 
						count++;
				if(count > Player.PlayersOnlineAtOnceSinceLastReboot)
					Player.PlayersOnlineAtOnceSinceLastReboot = count;
				if(count > Settings.PlayersOnlineAtOnceEver) {
					Settings.PlayersOnlineAtOnceEver =  count;
					Settings.Save();
				}
				
				break;
		}

	} // end of Set Status

	IsInanimate() {	return this.inanimate; };
}

module.exports = Player;
