
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
const NPCData = require("./NPCData");
const PhysicalStats = require("./PhysicalStats");

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
	Communications = [];
	TelnetOptions = {};
	inanimate = null;
	
	IsNPC = false;
	PcRace = null;
	Title = "";
	ExtendedTitle = "";
	SilverBank = 0;
	socket = null;
	input = "";
	output = "";
	status = "GetName";
	SittingAtPrompt = false;
	Prompt = "";
	ClientTypes = Array();
	LastSavedTime = 0;

  	constructor(socket) {
		super(false);
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
		data = Utility.Format(data.replaceAll("\r", "").replaceAll("\n", "\n\r"), params);
		if(Character.CaptureCommunications) {
			this.Communications.push(data);
			if(this.Communications.length > 35) {
				this.Communications.splice(0, this.Communications.length - 35);
			}
		}

		if(this.PagingText) {
			this.PageText += data.replaceAll("\r", "");
		} else {
			this.output = this.output + data;
		}
	}
  	
	sendnow = function(data, ...params) {
		data = Utility.Format(data.replaceAll("\r", "").replaceAll("\n", "\n\r"), params);
		this.socket.write(Color.ColorString(data, !this.Flags.Color, this.TelnetOptions.Color256, this.TelnetOptions.ColorRGB));
	};

	Load(path) {
		var player = this;
		var data =fs.readFileSync(path, {encoding: "ascii"});

		parser.parseString(data, function(err, xml) {
			player.LoadPlayerData(xml.PLAYERDATA);
		});
  	}

	LoadPets(xml) {
		if(xml.PETS && xml.PETS[0] && xml.PETS[0].CHARACTER) {
			for(var petxml of xml.PETS[0].CHARACTER) {
				var pet = new NPCData(petxml.GetElementValueInt("VNum"), this.Room);
				pet.Load(petxml);
				pet.Following = this;
				pet.Master = this;
				pet.Leader = this;
			}
		}
	}

	LoadPlayerData(xml) {
		if(xml)	{
			super.Load(xml);
			this.LastSavedTime = new Date();

			this.ScrollCount = xml.GetElementValueInt("ScrollCount", 40);
			this.Title = xml.GetElementValue("Title");
			this.ExtendedTitle = xml.GetElementValue("ExtendedTitle");
			this.Xp = xml.GetElementValueInt("Xp");
			this.XpTotal = xml.GetElementValueInt("XpTotal");
			this.SilverBank = xml.GetElementValueInt("SilverBank", 0);
			this.Practices = xml.GetElementValueInt("Practices");
			this.Trains = xml.GetElementValueInt("Trains");
			this.Hunger = xml.GetElementValueInt("Hunger");
			this.Thirst = xml.GetElementValueInt("Thirst");
			this.Starving = xml.GetElementValueInt("Starving");
			this.Dehydrated = xml.GetElementValueInt("Dehydrated");
			this.Drunk = xml.GetElementValueInt("Drunk");
			this.Prompt = xml.GetElementValue("Prompt");
			this.Password = xml.GetElementValue("Password");
			if(!(this.PcRace = PcRaceData.LookupRace(this.Race.Name)))
				console.log(`PcRace ${race} not found`);
			var title;
			if(!this.Title || this.Title.IsNullOrEmpty()) {
				if (this.Guild && this.Guild.Titles && (title = this.Guild.Titles[this.Level]))
				{
					if (this.Sex.equals("Female"))
					{
						this.Title = "the " + title.FemaleTitle;
					}
					else
						this.Title = "the " + title.MaleTitle;

				} 
			}

			
			
		}
  	} // end LoadPlayerData

	Save(path) {
		if(!path) path = Settings.PlayerDataPath + `/${this.Name}.xml`;
		this.LastSavedTime = new Date();
		var builder = require('xmlbuilder');
		var xmlelement = super.Element();// builder.create("PlayerData");
		
		xmlelement.ele("Title", this.Title);
		xmlelement.ele("ExtendedTitle", this.ExtendedTitle);
		xmlelement.ele("Xp", this.Xp);
		xmlelement.ele("XpTotal", this.XpTotal);
		xmlelement.ele("SilverBank", this.SilverBank);
		xmlelement.ele("Practices", this.Practices);
		xmlelement.ele("Trains", this.Trains);
		xmlelement.ele("Hunger", this.Hunger);
		xmlelement.ele("Thirst", this.Thirst);
		xmlelement.ele("Starving", this.Starving);
		xmlelement.ele("Dehydrated", this.Dehydrated);
		xmlelement.ele("Drunk", this.Drunk);

		xmlelement.ele("Prompt", this.Prompt);
		xmlelement.ele("Password", this.Password);
		if (this.Room) {
			var pets = xmlelement.ele("Pets");
			for(var pet of this.Room.Characters) {
				if(pet.Master == this) {
					pet.Element(pets);
				}
			}
		}

		var xml = xmlelement.end({ pretty: true});
		fs.writeFileSync(path, xml);
	}


	HandleOutput() {

		if(this.output != null && this.output != "")
		{
			this.output = this.output.replaceAll("\r", "");
			if(this.status == "Playing") {
				if(this.Fighting)
				this.Fighting.DisplayHealth(this);
				//this.output = this.output + (!this.output.endsWith("\n\n")? "\n" : "");
				this.DisplayPrompt();
				if (this.SittingAtPrompt && !this.output.startsWith("\n"))
				this.output = "\n" + this.output;
			}
			
			this.output = this.output.replaceAll("\r", "");
			if(!this.output.endsWith("\n"))
				this.output += "\u00FF\u00F9";
			this.socket.write(Color.ColorString(this.output.replaceAll("\n", "\n\r"), !this.Flags.Color, this.TelnetOptions.Color256, this.TelnetOptions.ColorRGB), "ascii");
			
			this.SittingAtPrompt = true;
		}

		this.output = "";

	}

	HandleInput() {
		if(this.input != "")
		{
			if(this.status == "Playing" && this.Wait > 0) return;
			this.input = this.input.replaceAll("\r", "");
			
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
						if(this.PageText && this.PageText.length > 0) {
							this.SendPage();
						}
						return;
					}
					if(this.PageText && this.PageText.length > 0) {
						this.PageText = "";
						this.send("Paged text cleared.\n\r");
						return;
					}
					
					this.DoCommand(command, args);
					
					
					this.LastActivity = new Date();
				}
				else if(this.status != "Playing") {			
					this.nanny(str);
				}

			}
		} // input != ""
		if(this.status == "Playing") {
			const TimeSpan = require('./TimeSpan');
			if(this.LastSavedTime && new TimeSpan(new Date() - this.LastSavedTime).totalMinutes >= 5) {
				this.send("Auto-saving.\n\r");
				this.Save();
			}
		}
	} // end HandleInput

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
				if(fs.existsSync(Settings.PlayerDataPath + `/${this.Name}.xml`)) {
					this.Load(Settings.PlayerDataPath + `/${this.Name}.xml`);
					if(this.Password != "") {
						this.SetStatus("GetPasswordExisting");
					} else {
						this.SetStatus("CreateNewPassword");
					}
					
				} else if(!this.CheckName(this.Name)) {
					this.send("Name unavailable.\n\r");
					this.SetStatus("GetName");
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
								var title;
								if (this.Guild && this.Guild.Titles && (title = this.Guild.Titles[this.Level]))
								{
									if (this.Sex.equals("Female"))
									{
										this.Title = "the " + title.FemaleTitle;
									}
									else
										this.Title = "the " + title.MaleTitle;

								} 
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
						
						this.Flags.SETBIT(Character.ActFlags.AutoLoot);
						this.Flags.SETBIT(Character.ActFlags.AutoSac);
						this.Flags.SETBIT(Character.ActFlags.AutoGold);
						this.Flags.SETBIT(Character.ActFlags.AutoSplit);
						this.Flags.SETBIT(Character.ActFlags.AutoAssist);
						this.Flags.SETBIT(Character.ActFlags.AutoExit);

						var extrapractice = Math.ceil(PhysicalStats.WisdomApply[this.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Wisdom)].Practice / 2);
						this.Practices = 5 + extrapractice;
						this.Trains = 3;

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
				var character = this;
				if(Character.Characters.indexOf(this) < 0)
					Character.Characters.push(this);
				
				if(!this.Room) {
					var room = RoomData.Rooms[this.RoomVNum];
					this.AddCharacterToRoom(room? room : RoomData.Rooms["3700"]);
					this.Act("The form of $n appears before you.", null, null, null, "ToRoom");

					var path = Settings.PlayerDataPath + `/${this.Name}.xml`;
					var data =fs.readFileSync(path, {encoding: "ascii"});

					parser.parseString(data, function(err, xml) {
						character.LoadPets(xml.PLAYERDATA);
					});

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

	CheckName(name) {
		if("self".prefix(name) || name.prefix("self")) return false;
		for(var character of Character.Characters) {
			if(character.IsNPC && character.Name.IsName(name))
				return false;
		}
		return true;
	}

	static DoPassword(ch, args)
	{
		var password = "";
		var passwordConfirm = "";

		if (ch.IsNPC)
		{
			return;
		}

		[password, args] = args.OneArgument();
		[passwordConfirm, args]= args.OneArgument();

		if (password.ISEMPTY() || passwordConfirm.ISEMPTY())
		{
			ch.send("Syntax: Password {New Password} {Confirm New Password}\n\r");
		}
		else if (password != passwordConfirm)
		{
			ch.send("Passwords do not match.\n\r");
		}
		else
		{
			let hash = crypto.createHash('md5').update(password + "salt").digest("hex");
			ch.Password = hash;
			ch.Save();
			ch.send("Password changed.\n\r");
		}
	}
}

module.exports = Player;
