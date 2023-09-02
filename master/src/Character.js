const XmlHelper = require("./XmlHelper");
const AffectData = require("./AffectData");
const PhysicalStats = require("./PhysicalStats");
const SkillSpell = require("./SkillSpell");
const Utility = require("./Utility");
const ItemTemplateData = require("./ItemTemplateData");
const ItemData = require("./ItemData");
const NPCTemplateData = require("./NPCTemplateData");
class Character {
	static Characters = Array();
	static WearSlots = { 
		LeftFinger: { ID: "LeftFinger", Flag: "Finger",   	Slot: "<ring>             ", WearString: "on your finger", WearStringOthers: "on $s finger" },
		RightFinger: { ID: "RightFinger", Flag: "Finger", 	Slot: "<ring>             ", WearString: "on your finger", WearStringOthers: "on $s finger" },
		Neck1: { ID: "Neck1", Flag: "Neck",               	Slot: "<around neck>      ", WearString: "around your neck", WearStringOthers: "around $s neck" },
		Neck2: { ID: "Neck2", Flag: "Neck",				 	Slot: "<around neck>      ", WearString: "around your neck", WearStringOthers: "around $s neck" },
		Head: { ID: "Head", Flag: "Head", 					Slot: "<on head>          ", WearString: "on your head", WearStringOthers: "on $s head" } ,
		Chest: { ID: "Chest", Flag: "Body", 				Slot: "<on chest>         ", WearString: "on your chest", WearStringOthers: "on $s chest" },
		Arms: { ID: "Arms", Flag: "Arms", 					Slot: "<on arms>          ", WearString: "on your arms", WearStringOthers: "on $s arms" } ,
		Legs: { ID: "Legs", Flag: "Legs", 					Slot: "<on legs>          ", WearString: "on your legs", WearStringOthers: "on $s legs" },
		Feet: { ID: "Feet", Flag: "Feet", 					Slot: "<on feet>          ", WearString: "on your feet", WearStringOthers: "on $s feet" } ,
		Hands: { ID: "Hands", Flag: "Hands", 				Slot: "<on hands>         ", WearString: "on your hands", WearStringOthers: "on $s hands" },
		Waist: { ID: "Waist", Flag: "Waist", 				Slot: "<on waist>         ", WearString: "about your waist", WearStringOthers: "about $s waist" } ,
		About: { ID: "About", Flag: "About", 				Slot: "<about body>       ", WearString: "about your body", WearStringOthers: "about $s body" },
		LeftWrist: { ID: "LeftWrist", Flag: "Wrist", 		Slot: "<wrists>           ", WearString: "on your wrist", WearStringOthers: "on $s wrist" } ,
		RightWrist: { ID: "RightWrist", Flag: "Wrist", 		Slot: "<wrists>           ", WearString: "on your wrist", WearStringOthers: "on $s wrist" },
		Wield: { ID: "Wield", Flag: "Wield", 				Slot: "<wielded>          ", WearString: "in your main hand", WearStringOthers: "in $s main hand" } ,
		DualWield: { ID: "DualWield", Flag: "Wield", 		Slot: "<dual wielding>    ", WearString: "in your offhand", WearStringOthers: "in $s offhand" },
		Held: { ID: "Held", Flag: "Hold", 					Slot: "<offhand>          ", WearString: "in your offhand", WearStringOthers: "in $s offhand" } ,
		Shield: { ID: "Shield", Flag: "Shield", 			Slot: "<offhand>          ", WearString: "in your offhand", WearStringOthers: "in $s offhand" },
		Floating: { ID: "Floating", Flag: "Float", 			Slot: "<floating nearby>  ", WearString: "floating near you", WearStringOthers: "floating near $m" },
		Tattoo: { ID: "Tattoo", Flag: "Tattoo", 			Slot: "<tattood>          ", WearString: "on your arm", WearStringOthers: "on $s arm" }
	
	};
	static Sizes = ["Tiny", "Small", "Medium", "Large", "Huge", "Giant"];
	static Positions = ["Dead", "Mortal", "Incapacitated", "Stunned", "Sleeping", "Resting", "Sitting", "Fighting", "Standing"];
	static ActType = {"ToRoom": "ToRoom", "ToRoomNotVictim": "ToRoomNotVictim", "ToVictim": "ToVictim", "ToChar": "ToChar", "ToAll": "ToAll", "ToGroupInRoom": "ToGroupInRoom", "GlobalNotVictim": "GlobalNotVictim" };

	static ActFlags = {
        "GuildMaster": "GuildMaster",
        "NoAlign": "NoAlign",
        "Color": "Color",
        "SkipAutoDeletePrompt": "SkipAutoDeletePrompt",
        "AutoAssist": "AutoAssist",
        "AutoExit": "AutoExit",
        "AutoLoot": "AutoLoot",
        "AutoSac": "AutoSac",
        "AutoGold": "AutoGold",
        "AutoSplit": "AutoSplit",
        "Evaluation": "Evaluation",
        "Betrayer": "Betrayer",
        "HeroImm": "HeroImm",
        "HolyLight": "HolyLight",
        "CanLoot": "CanLoot",
        "NoSummon": "NoSummon",
        "NoFollow": "NoFollow",
        "NoTransfer": "NoTransfer",
        "PlayerDenied": "PlayerDenied",
        "Frozen": "Frozen",
        "AssistPlayer": "AssistPlayer",
        "AssistAll": "AssistAll",
        "AssistVnum": "AssistVnum",
        "AssistAlign": "AssistAlign",
        "AssistRace": "AssistRace",
        "Sentinel": "Sentinel",           
        "Scavenger": "Scavenger",         
        "CabalMob": "CabalMob",          
        "Aggressive": "Aggressive",         
        "StayArea": "StayArea",          
        "Wimpy": "Wimpy",
        "Pet": "Pet",                
        "Trainer": "Trainer",              

        "NoTrack": "NoTrack",
        "Undead": "Undead",
        "Cleric": "Cleric",
        "Mage": "Mage",
        "Thief": "Thief",
        "Warrior": "Warrior",
        "NoPurge": "NoPurge",
        "Outdoors": "Outdoors",
        "Indoors": "Indoors",
        "IsHealer": "IsHealer",
        "Banker": "Banker",
        "Brief": "Brief",
        "NPC": "NPC",
        "NoWander": "NoWander",

        "Changer": "Changer",
        "Healer": "Healer",

        "Shopkeeper": "Shopkeeper",

        "AreaAttack": "AreaAttack",
        "WizInvis": "WizInvis",
        "Fade": "Fade",
        "AssistPlayers": "AssistPlayers",
        "AssistGuard": "AssistGuard",
        "Rescue": "Rescue",
        "UpdateAlways": "UpdateAlways",

        "Backstab": "Backstab",
        "Bash": "Bash",
        "Berserk": "Berserk",
        "Disarm": "Disarm",
        "Dodge": "Dodge",
        "Fast": "Fast",
        "Kick": "Kick",
        "DirtKick": "DirtKick",
        "Parry": "Parry",
        "Tail": "Tail",
        "Trip": "Trip",
        "Crush": "Crush",
        "PartingBlow": "PartingBlow",

        "Train = Trainer": "Train = Trainer",
        "Gain = Trainer": "Gain = Trainer",
        "Practice = GuildMaster": "Practice = GuildMaster",
        "ColorOn = Color": "ColorOn = Color",
        "NewbieChannel": "NewbieChannel",
        "NoDuels": "NoDuels",
        "AFK": "AFK",
    };

	static DoCommands = {};
    static CharacterFunctions = {};
	IsNPC = true;
	VNum = 0;
	Name = null;
	socket = null;
	input = "";
	output = "";
	Room = null;
	ShortDescription = "";
	LongDescription = "";
	Description = "";
	Affects = Array();
	Learned = {};
	Flags = {};
	Level = 1;
	WeaponDamageMessage = null;
	Alignment = "neutral";
	Ethos = "neutral";
	_position = "Standing";
	Race = null;
	Sex = "neutral";
	Size = "Medium";
	Material = "unknown";
	Inventory = Array();
	Equipment = {};
	AffectedBy = {};
	HitPoints = 100;
	MaxHitPoints = 100;
	ManaPoints = 100;
	MaxManaPoints = 100;
	MovementPoints = 100;
	MaxMovementPoints = 100;
	HitPointDice = Array(0,0,0);
	DamageDice = Array(0,0,0);
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
	Carry = 0;
	MaxCarry = 100;
	TotalWeight = 0;
	MaxWeight = 600;
	LastActivity = null;

  	constructor(add = true) {
		if(add)
		Character.Characters.push(this);
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
			const Combat = require("./Combat");
			var index = this.Room.Characters.indexOf(this);
			if(index >= 0)
				this.Room.Characters.splice(index, 1);
			Combat.StopFighting(this, true);
			this.Room = null;
		}
	}

	GetShortDescription(to) {
		if(this.ShortDescription && this.ShortDescription.length > 0)
			return this.ShortDescription;
		else
			return this.Name;
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
		return Utility.Format("<{0}{1}\\x/{2} {3}{4}\\x/{5} {6}{7}\\x/{8} \\mvnum \\c{9}\\x> ",
			this.HitPoints < this.MaxHitPoints * 0.25? "\\r" : this.HitPoints < this.MaxHitPoints * 0.75? "\\y" : "\\g", 
			this.HitPoints.toFixed(2), this.MaxHitPoints.toFixed(2), 
			this.ManaPoints < this.MaxManaPoints * 0.25? "\\r" : this.ManaPoints < this.MaxManaPoints * 0.75? "\\y" : "\\g",
			this.ManaPoints.toFixed(2), this.MaxManaPoints.toFixed(2),
			this.MovementPoints < this.MaxMovementPoints * 0.25? "\\r" : this.MovementPoints < this.MaxMovementPoints * 0.75? "\\y" : "\\g",
			this.MovementPoints.toFixed(2), this.MaxMovementPoints.toFixed(2), 
			 this.Room.VNum);
	}

	Act(message, victim = null, item = null, item2 = null, acttype = "ToChar", ...params) {
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
					var output = this.FormatActMessage(message, other, victim, item, item2, params);
					other.send(output);
				}
			}
		}
		else if(acttype == "ToVictim") {
			var output = this.FormatActMessage(message, victim, victim, item, item2, params);
			victim.send(output);
		}
		else if(acttype == "ToChar") {
			var output = this.FormatActMessage(message, this, victim, item, item2, params);
			this.send(output);
			
		}
	}

	FormatActMessage(message, to, victim, item, item2, ...params) {
		if(params && params.length == 1 && Array.isArray(params[0])) params = params[0];
		var output = "";
		message = Utility.Format(message, params);
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
		if (!output.endsWith("\n\r") && !output.endsWith("\n"))
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
	} // end format act message

	/**
	 * 
	 * @param {AffectData} affect to be applied or removed
	 * @param {Boolean} remove is it being applied or removed
	 * @param {Boolean} silent show end or begin messages
	 * @returns null
	 */
	AffectApply(affect, remove = false, silent = false) {
		if (affect.Where == "ToWeapon") {
                return;
		}

		if (remove)
		{
			if(!silent && !Utility.IsNullOrEmpty(affect.EndMessage)) {
				this.Act(affect.EndMessage);
			}
	
			if(!silent && !Utility.IsNullOrEmpty(affect.EndMessageToRoom)) {
				this.Act(affect.EndMessageToRoom, null, null, null, "ToRoom");
			}

			if (Object.keys(affect.Flags).length > 0)
			{
				for (var flag in affect.Flags)
				{
					
					// don't remove affect provided by another debuff( for example, blinded then dirt kicked, dirt kick won't remove blind of blindness )
					if (this.Affects.findIndex((aff) => affect != aff && aff.Flags.IsSet(flag)) >= 0)
						continue;
					else if(this.AffectedBy.IsSet(flag))
						this.AffectedBy.RemoveFlag(flag);
				}
			}
		}
		else
		{
			for (var flag in affect.Flags)
				this.AffectedBy[flag] = true;

			if(!silent && !Utility.IsNullOrEmpty(affect.BeginMessage)) {
				this.Act(affect.BeginMessage);
			}
	
			if(!silent && !Utility.IsNullOrEmpty(affect.BeginMessageToRoom)) {
				this.Act(affect.BeginMessageToRoom, null, null, null, "ToRoom");
			}

		}

		// if (affect.Where == "ToImmune" && remove)
		// 	ImmuneFlags.RemoveWhere(w => aff.DamageTypes.Contains(w));
		// else if (affect.Where == "ToResist" && remove)
		// 	ResistFlags.RemoveWhere(w => aff.DamageTypes.Contains(w));
		// else if (affect.Where == "ToVulnerabilities" && remove)
		// 	VulnerableFlags.RemoveWhere(w => aff.DamageTypes.Contains(w));
		// else if (affect.Where == "ToImmune" && !remove)
		// 	ImmuneFlags.SETBITS(aff.DamageTypes);
		// else if (affect.Where == "ToResist" && !remove)
		// 	ResistFlags.SETBITS(aff.DamageTypes);
		// else if (affect.Where == "ToVulnerabilities" && !remove)
		// 	VulnerableFlags.SETBITS(aff.DamageTypes);

		if (affect.Modifier != 0)
		{
			var modifier = affect.Modifier;
			if (remove) modifier = -modifier;
			switch (affect.Location)
			{
				case "Strength":
					this.ModifiedStats[0] += modifier;
					break;
				case "Wisdom":
					this.ModifiedStats[1] += modifier;
					break;
				case "Intelligence":
					this.ModifiedStats[2] += modifier;
					break;
				case "Dexterity":
					this.ModifiedStats[3] += modifier;
					break;
				case "Constitution":
					this.ModifiedStats[4] += modifier;
					break;
				case "Charisma":
					this.ModifiedStats[5] += modifier;
					break;
				case "Hitroll":
					this.HitRoll += modifier;
					break;
				case "Damroll":
					this.DamageRoll += modifier;
					break;
				case "Armor":
					//ArmorBash += modifier;
					//ArmorSlash += modifier;
					//ArmorPierce += modifier;
					//ArmorExotic += modifier;
					this.ArmorClass += modifier;
					break;
				case "Hitpoints":
					this.MaxHitPoints += modifier;
					break;
				case "Mana":
					this.MaxManaPoints += modifier;
					break;
				case "Move":
					this.MaxMovementPoints += modifier;
					break;
				case "Saves":
				case "SavingSpell":
					this.SavingThrow += modifier;
					break;
			}
		}

		var wield = null;

		if ((wield = this.Equipment.Wield) &&
			wield.Weight > (PhysicalStats.StrengthApply[this.GetCurrentStat(0)].Wield))
		{
			this.Act("You drop $p.", null, wield, null, Character.ActType.ToChar);
			this.Act("$n drops $p.", null, wield, null, Character.ActType.ToRoom);

			this.RemoveEquipment(wield, !silent, true);
			this.Inventory.Remove(wield);
			wield.CarriedBy = null;
			this.Room.Items.unshift(wield);
			wield.Room = this.Room;
		}
		if ((wield = this.Equipment.DualWield) &&
			wield.Weight > (PhysicalStats.StrengthApply[this.GetCurrentStat(0)].Wield))
		{
			this.Act("You drop $p.", null, wield, null, Character.ActType.ToChar);
			this.Act("$n drops $p.", null, wield, null, Character.ActType.ToRoom);

			this.RemoveEquipment(wield, !silent, true);
			this.Inventory.Remove(wield);
			wield.CarriedBy = null;
			this.Room.Items.unshift(wield);

			wield.Room = this.Room;
		}
	}

	GetCurrentStat(stat) {
		if (this.PcRace && this.PcRace.MaxStats)
			return Math.min(this.PcRace.MaxStats[stat], Math.min(25, Math.max(0, this.PermanentStats && this.ModifiedStats ? this.PermanentStats[stat] + this.ModifiedStats[stat] : (this.IsNPC ? 20 : 3))));
		else
			return Math.min(25, Math.max(3, this.PermanentStats && this.ModifiedStats ? this.PermanentStats[stat] + this.ModifiedStats[stat] : (this.IsNPC ? 20 : 3)));
	}

	GetModifiedStatUncapped(stat)
	{
		return this.PermanentStats && this.ModifiedStats ? this.PermanentStats[stat] +this. ModifiedStats[stat] : (this.IsNPC ? 20 : 3);
	}

	AffectToChar(affect, show) {
		var newaffect = new AffectData({AffectData: affect});
		this.Affects.unshift(newaffect);

		this.AffectApply(affect, false, !show);
	}

	AffectFromChar(affect, reason = "Other", show = true) {
		var index = this.Affects.indexOf(affect);
		if(index >= 0)
		this.Affects.splice(index, 1);

		this.AffectApply(affect, true, !show);
	}

	StripAffects(params = {AffectFlag: null, SkillSpell: null}) {
		if(params.AffectFlag) {
			for(var aff of Utility.CloneArray(this.Affects)) {
				for(var flag of params.AffectFlag) {
					if(aff.Flags[flag])
						this.AffectFromChar(aff)
				}
			}
		}

		if(params.SkillSpell) {
			for(var aff of Utility.CloneArray(this.Affects)) {	
				if(aff.SkillSpell == params.SkillSpell)
					this.AffectFromChar(aff)
			}
		}
	}

	IsAffected(Flag) {
		var found = false;
		
		found = this.Flags[Flag];
		if(!found) {
			for(var setflag in this.Flags) { // case insensitive search
				if(setflag.equals(Flag)) {
					return Flags[setflag];
				}
			}
			for(var aff of this.Affects) {
				if(aff.Flags.IsSet(Flag)) {
					return aff;
					//found = true;
					//break;
				}
				else if(aff.SkillSpell == Flag || (aff.SkillSpell && aff.SkillSpell.Name.equals(Flag))) {
					return aff;
					//found = true;
					//break;
				}
			}
		}
		return found;
	}

	FindAffect(Flag) {
				
		for(var aff of this.Affects) {
			if(Flag instanceof SkillSpell) {
				if(aff.SkillSpell == Flag) return aff;
			} else if(aff.Flags.IsSet(Flag)) {
				return aff;
			} else if(aff.SkillSpell && aff.SkillSpell.Name.equals(Flag)) {
				return aff;
			}
		}
		
		return null;
	}

	FindAffects(Flag) {
		var affects = Array();
		
		
		for(var aff of this.Affects) {
			if(Flag instanceof SkillSpell) {
				if(aff.SkillSpell == Flag) affects.push(aff);
			} else if(aff.Flags.IsSet(Flag)) {
				affects.push(aff);
			} else if(aff.SkillSpell == Flag || (aff.SkillSpell && aff.SkillSpell.Name.equals(flag))) {
				affects.push(aff);
			}
		}
		
		return affects;
	}

	get IsImmortal() {
		return !this.IsNPC && this.Level > 51;
	}

	GetLevelSkillLearnedAt(skillname) {
		var skillentry;
		if(skillname instanceof SkillSpell) {
			skillentry = skillname;
			skillname = skillentry.Name;
		}
		else {
			if(Utility.IsNullOrEmpty(skillname)) return 60;
			skillname = skillname.toLowerCase();
		
			skillentry = SkillSpell.GetSkill(skillname, false);
		}
		if (Utility.IsNullOrEmpty(skillname) || !skillentry)
			return 60;
		else if (skillentry && !skillentry.PrerequisitesMet(this))
			return 60;
		else if (this.Learned[skillname])
			return this.Learned[skillname].Level;
		else if (!this.Guild || !skillentry.LearnedLevel[this.Guild.Name])
			return 60;
		else
			return skillentry.LearnedLevel[this.Guild.Name];
	}

	GetSkillPercentage(skillname) {
		
		var skillentry;
		if(skillname instanceof SkillSpell) {
			skillentry = skillname;
			skillname = skillentry.Name;
		}
		else {
			if(Utility.IsNullOrEmpty(skillname)) return 0;
			skillname = skillname.toLowerCase();
		
			skillentry = SkillSpell.GetSkill(skillname, false);
		}
		
		if (Utility.IsNullOrEmpty(skillname) || !skillentry)
			return 0;
		else if (this.IsImmortal)
			return 100;
		else if ((this.IsNPC || this.Level < 60) &&  this.GetLevelSkillLearnedAt(skillname) == 60)
			return 0;
		else if (this.Learned[skillname] && this.Level >= this.GetLevelSkillLearnedAt(skillname) && skillentry.PrerequisitesMet(this))
			return this.Learned[skillname].Percent;
		else if (this.Guild != null && (this.Level >= this.GetLevelSkillLearnedAt(skillname)) && skillentry.PrerequisitesMet(this))
			return 1;
		else
			return 0;
	}

	IsInanimate() {	return false; };

	IsAffectedSkill(skillspell) {
		for(var aff of this.Affects) {
			if(aff.SkillSpell == skillspell) {
				return aff;
			}
		}
		return null;
	}

	IsAffectedFlag(flag) {
		if(this.AffectedBy[flag]) return this.AffectedBy[flag];
		for(var aff of this.Affects) {
			if(aff.Flags[flag]) {
				return aff;
			}
		}
		return null;
	}

	CheckImprove(skillname, success, rating) {

	}

	GetHitPointsGain()
	{
		var gain;
		var number;

		if (!this.Room)
			return 0;

		if (!this.IsNPC && !this.IsAffectedFlag("Ghost"))
		{
			if (this.Starving > 6 && !this.IsAffected("Sated"))
				return 0;
			if (this.Dehydrated > 4 && !this.IsAffected("Quenched"))
				return 0;
		}

		if (this.IsNPC)
		{
			gain = 5 + this.Level;

			switch (this.Position)
			{
				default: gain /= 2; break;
				case "Sleeping": gain = 3 * gain / 2; break;
				case "Resting": break;
				case "Fighting": gain /= 3; break;
			}

		}
		else
		{
			gain = Math.max(3, this.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Constitution) - 3 + this.Level / 2);
			if(this.Guild)
				gain += this.Guild.HitpointGainMax;
			number = Utility.NumberPercent();
			if (number < this.GetSkillPercentage("fast healing"))
			{
				gain += number * gain / 100;
				if (this.HitPoints < this.MaxHitPoints)
					this.CheckImprove("fast healing", true, 8);
			}
			else
				this.CheckImprove("fast healing", false, 4);

			if (this.IsAffected("EnhancedFastHealing"))
			{
				gain += (Utility.NumberPercent() * gain / 100) * 2;
			}

			switch (this.Position)
			{
				default: gain /= 4; break;
				case "Sleeping": break;
				case "Resting": gain /= 2; break;
				case "Fighting": gain /= 6; break;
			}

			if (this.Hunger == 0 && !this.IsAffected("Sated"))
				gain /= 2;

			if (this.Thirst == 0 && !this.IsAffected("Quenched"))
				gain /= 2;
		}

		if (this.IsAffected("Plague"))
			gain /= 8;
		if (this.IsAffected("Haste"))
			gain /= 2;
		if (this.IsAffected("Slow")) {
			gain *= 17;
			gain /= 10;
		}
		if (this.IsAffected("Burrow")) {
			gain *= 17;
			gain /= 10;
		}

		if (this.GetSkillPercentage("slow metabolism") > 1)	{
			gain *= 17;
			gain /= 10;
		}
		if (this.IsAffected("camp")) {
			gain *= 2;
		}
		gain *= 2;
		return Math.min(gain, this.MaxHitPoints - this.HitPoints);
	} // end of HitpointGain

	GetManaPointsGain()
	{
		var gain;
		var number;

		if (!this.Room)
			return 0;

		if (!this.IsNPC && !this.IsAffected("Ghost"))
		{
			if (this.Starving > 6 && !this.IsAffected("Sated"))
				return 0;
			if (this.Dehydrated > 4 && !this.IsAffected("Quenched"))
				return 0;
		}

		if (this.IsNPC)
		{

			gain = 5 + this.Level;

			if (this.Race && this.Race.Name.toLowerCase() == "malefisti")
				gain *= 2;

			switch (this.Position)
			{
				default: gain /= 2; break;
				case "Sleeping": gain = 3 * gain / 2; break;
				case "Resting": break;
				case "Fighting": gain /= 3; break;
			}
		}
		else
		{
			gain = (this.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Wisdom) / 2 - 9
				+ this.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Intelligence) * 2 + this.Level);
			number = Utility.NumberPercent();
			if (number < this.GetSkillPercentage("meditation"))
			{
				gain += number * gain / 100;
				if (this.ManaPoints < this.MaxManaPoints)
					this.CheckImprove("meditation", true, 4);
			}
			number = Utility.NumberPercent();
			if (number < this.GetSkillPercentage("trance"))
			{
				gain += number * gain / 100;
				if (this.ManaPoints < this.MaxManaPoints)
					this.CheckImprove("trance", true, 4);
			}

			switch (this.Position)
			{
				default: gain /= 4; break;
				case "Sleeping": break;
				case "Resting": gain /= 2; break;
				case "Fighting": gain /= 6; break;
			}

			if (this.Hunger == 0 && !this.IsAffected("Sated"))
				gain /= 2;

			if (this.Thirst == 0 && !this.IsAffected("Quenched"))
				gain /= 2;

		}

		if (this.IsAffected("Poison"))
			gain /= 4;
		if (this.IsAffected("Plague"))
			gain /= 8;
		if (this.IsAffected("Haste"))
			gain /= 2;
		if (this.IsAffected("Slow"))
			gain += (11 * gain / 10);
		if (this.IsAffected("Burrow"))
			gain += (11 * gain / 10);
		if (this.GetSkillPercentage("slow metabolism") > 1)
			gain += (11 * gain / 10);
		if (this.IsAffected("camp"))
		{
			gain *= 2;
		}
		gain *= 2;
		return Math.min(gain, this.MaxManaPoints - this.ManaPoints);
	} // end ManaPointsGain

	GetMovementPointsGain()
	{
		var gain;

		if (!this.Room)
			return 0;

		if (!this.IsNPC && !this.IsAffected("Ghost"))
		{
			if (this.Starving > 6 && !this.IsAffected("Sated"))
				return 0;
			if (this.Dehydrated > 4 && !this.IsAffected("Quenched"))
				return 0;
		}

		if (this.IsNPC)
		{
			gain = this.Level;
		}
		else
		{
			gain = Math.max(15, this.Level);

			switch (this.Position)
			{
				case "Sleeping": gain += this.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity); break;
				case "Resting": gain += this.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity) / 2; break;
			}

			if (this.Hunger == 0 && !this.IsAffected("Sated"))
				gain /= 2;

			if (this.Thirst == 0 && !this.IsAffected("Quenched"))
				gain /= 2;

		}

		if (this.IsAffected("Poison"))
			gain /= 4;

		if (this.IsAffected("Plague"))
			gain /= 8;

		if (this.IsAffected("Haste") || this.IsAffected("Slow"))
			gain *= 2;
		if (this.IsAffected("Burrow"))
			gain *= 2;
		if (this.GetSkillPercentage("slow metabolism") > 1)
			gain += (11 * gain / 10);
		if (this.IsAffected("camp"))
		{
			gain *= 2;
		}
		gain *= 2;
		return Math.min(gain, this.MaxMovementPoints - this.MovementPoints);
	} // end MovementPointsGain

	StopFollowing()	{
		if (this.Following != null)
		{
			this.send("You stop following " + (Following.Display(this)) + ".\n\r");
			Following.send(this.Display(Following) + " stops following you.\n\r");
			
			if (this.Following.Pet == this) {
				this.Following.Pet = null;
			}
			this.Following = null;
			this.Leader = null;
		}
	}

	WaitState(count) {
		this.Wait += count;
	}

	DeathCry()
	{
		var msg = "You hear $n's death cry."; ;
		var vnum = 0;

		var parts = this.Race.Part;
		//if (Form != null) parts = Form.Parts;
		switch (Utility.Random(0, 7))
		{
			default:
			case 0: msg = "$n hits the ground ... DEAD."; break;
			case 1:
				msg = "$n splatters blood on your armor.";
				break;
			case 2:
				if (parts["Guts"])
				{
					msg = "$n spills their guts all over the floor.";
					vnum = 11;
				}
				break;
			case 3:
				if (parts["Head"])
				{
					msg = "$n's severed head plops on the ground.";
					vnum = 7;
				}
				break;
			case 4:
				if (parts["Heart"])
				{
					msg = "$n's heart is torn from their chest.";
					vnum = 8;
				}
				break;
			case 5:
				if (parts["Arms"])
				{
					msg = "$n's arm is sliced from their dead body.";
					vnum = 9;
				}
				break;
			case 6:
				if (parts["Legs"])
				{
					msg = "$n's leg is sliced from their dead body.";
					vnum = 10;
				}
				break;
			case 7:
				if (parts["Brains"])
				{
					msg = "$n's head is shattered, and their brains splash all over you.";
					vnum = 12;
				}
				break;
		} // switch/select random part

		this.Act(msg, null, null, null, "ToRoom");
		var template;
		if (vnum != 0 &&  (template = ItemTemplateData.ItemTemplates[vnum]) && this.Room != null)
		{
			var item = new ItemData(template, this.Room);
			item.Timer = Utility.Random(4, 7)
			item.ShortDescription = Utility.Format(item.ShortDescription, this.GetShortDescription(null));
			item.LongDescription = Utility.Format(item.LongDescription, this.GetShortDescription(null));
			item.Description = Utility.Format(item.Description, this.GetShortDescription(null));
		}

		if (!this.IsNPC)
			msg = "You hear something's death cry.";
		else
			msg = "You hear someone's death cry.";

		if (this.Room)
			// send death cry to surrounding rooms
			for (var exit of this.Room.Exits)
			{
				if (exit && exit.Destination != null && exit.Destination != this.Room)
				{
					for (var other of exit.Destination.Characters)
					{
						other.send(msg + "\n\r");
					}
				}
			}
	} // end of deathcry

	 IsSameGroup(bch)
	{
		var ach = this;
		var bch;

		if (!bch)
			return false;
		if (bch == ach) return true;
		
		if (ach.Leader) ach = ach.Leader;
		if (bch.Leader) bch = bch.Leader;
		return ach == bch;
	}

	ExperienceCompute(victim, group_amount, glevel)
	{
		var xp, base_exp;
		var level_range;
		var mult;

		mult = (this.Level / glevel) * group_amount;
		if (mult >= 1)
		{
			mult = (1 + mult) / 2;
		}
		else
		{
			mult *= mult;
		}
		mult = Utility.URANGE(.25, mult, 1.1);

		level_range = victim.Level - this.Level;

		/* compute the base exp */
		switch (level_range)
		{
			default: base_exp = 0; break;
			case -9: base_exp = 2; break;
			case -8: base_exp = 4; break;
			case -7: base_exp = 7; break;
			case -6: base_exp = 12; break;
			case -5: base_exp = 14; break;
			case -4: base_exp = 25; break;
			case -3: base_exp = 36; break;
			case -2: base_exp = 55; break;
			case -1: base_exp = 70; break;
			case 0: base_exp = 88; break;
			case 1: base_exp = 110; break;
			case 2: base_exp = 131; break;
			case 3: base_exp = 153; break;
			case 4: base_exp = 165; break;
		}

		if (level_range > 4)
			base_exp = 165 + 20 * (level_range - 4);

		if (mult < 1 && level_range > 4)
			base_exp = (4 * base_exp + 165) / 3;

		base_exp *= 3;

		if (victim.Flags.IsSet("NoAlign"))
			xp = base_exp;

		else if (this.Alignment == "Good")
		{
			if (victim.Alignment == "Evil")
				xp = (base_exp * 4) / 3;

			else if (victim.Alignment == "Good")
				xp = -30;

			else
				xp = base_exp;
		}
		else if (this.Alignment == "Evil") /* for baddies */
		{
			if (victim.Alignment == "Good")
				xp = (base_exp * 4) / 3;

			else if (victim.Alignment == "Evil")
				xp = base_exp / 2;

			else
				xp = base_exp;
		}
		else /* neutral */
		{
			xp = base_exp;
		}

		xp = (xp * 2) / 3;

		xp *= mult;
		xp = Utility.Random(xp, xp * 5 / 4);

		/* adjust for grouping */
		if (group_amount == 2)
			xp = (xp * 5) / 3;
		if (group_amount == 3)
			xp = (xp * 7) / 3;
		if (group_amount > 3)
			xp /= (group_amount - 2);

		return xp; //(int)(xp * BonusInfo.ExperienceBonus);
	}
	
	GroupGainExperience(victim)
	{
		var xp;
		var members = 0;
		//int group_levels = 0;
		//Character lch;
		if (victim.Room == null) return;
		for (var gch of victim.Room.Characters)
		{
			if (this.IsSameGroup(gch))
			{
				if (!gch.IsNPC) members++;

				//group_levels += gch.level;

				//if (gch.isNPC) group_levels += gch.level;
			}
		}

		if (members == 0)
		{
			members = 1;
		}

		//lch = Leader ?? this;

		for (var gch of victim.Room.Characters)
		{

			if (!this.IsSameGroup(gch) || gch.IsNPC)
				continue;

			xp = gch.ExperienceCompute(victim, members, gch.Level); // group_levels);
			var buf = Utility.Format("\\CYou receive \\W{0}\\C experience points.\\x\n\r", xp);
			gch.send(buf);
			gch.GainExperience(xp);
		}
	}

	GainExperience(gain)
	{
		if (this.IsNPC)
			return;

		/*ch->exp = UMAX( exp_per_level(ch,ch->pcdata->points), ch->exp + gain );*/
		if (this.Level < 51)
		this.Xp += gain;

		if (this.Xp > this.XpTotal)
			this.XpTotal = this.Xp;

		while (this.Level < 51 && this.Xp >=
			this.XpToLevel * (this.Level))
		{
			this.AdvanceLevel();
		}

		return;
	}

	AdvanceLevel(show = true)
	{
		if (show)
			send("\\gYou raise a level!!  \\x\n\r");
		this.Level += 1;
		
		//WizardNet.Wiznet(WizardNet.Flags.Levels, "{0} gained level {1}", null, null, Name, Level);

		this.GiveAdvanceLevelGains(show);
		if (!this.IsNPC && this.Guild)
		{
			var title;
			if (this.Guild && (title = this.Guild.Titles[Level]))
			{
				if (this.Sex == "Female")
				{
					this.Title = "the " + title.FemaleTitle;
				}
				else
					this.Title = "the " + title.MaleTitle;

			}
			this.SaveCharacterFile();
		}

		if (!this.IsNPC)
		{
			// foreach (var questprogress in ((Player)this).Quests)
			// {
			// 	if (questprogress.Status == Quest.QuestStatus.InProgress && Level > questprogress.Quest.EndLevel)
			// 	{
			// 		QuestProgressData.FailQuest(this, questprogress.Quest);
			// 	}
			// }
		}
	}

	GiveAdvanceLevelGains(show)
	{
		var add_hp;
		var add_mana;
		var add_move;
		var add_prac;

		add_hp = PhysicalStats.ConstitutionApply[this.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Constitution)].Hitpoints + 
			(this.Guild != null ? Utility.Random(
				this.Guild.HitpointGain,
				this.Guild.HitpointGainMax) : 3);

		var int_mod = GetCurrentStat(PhysicalStatTypes.Intelligence) - 2;

		add_mana = Math.min(1 + Utility.Random(int_mod / 2, int_mod), 16);
		
		add_move = Utility.Random(1, (GetCurrentStat(PhysicalStats.PhysicalStatTypes.Constitution)
			+ GetCurrentStat(PhysicalStatTypes.Dexterity)) / 6);
		
		add_prac = PhysicalStats.WisdomApply[GetCurrentStat(PhysicalStats.PhysicalStatTypes.Wisdom)].Practice;
		//add_prac = 3;
		if (!this.Guild.Name.equals("warrior"))
		{
			add_hp += Utility.Random(1, 4);
			add_hp = Math.min(add_hp, 24);
		}
		else if (!this.Guild.Name.equals("paladin"))
		{
			add_hp = Math.min(add_hp, 17);
		}
		else if (!this.Guild.Name.equals("healer"))
		{
			add_hp = Math.min(add_hp, 15);
		}
		else if (!this.Guild.Name.equals("mage"))
		{
			add_hp = Math.min(add_hp, 11);
		}
		else if (!this.Guild.Name.equals("shapeshifter"))
		{
			add_hp = Math.min(add_hp, 11);
		}
		else
			add_hp = Math.min(add_hp, 15);

		add_hp = Math.max(2, add_hp);
		add_mana = Math.max(2, add_mana);
		add_move = Math.max(6, add_move);

		this.MaxHitPoints += add_hp;
		this.MaxManaPoints += add_mana;
		this.MaxMovementPoints += add_move;

		// restore on level up
		this.HitPoints = MaxHitPoints;
		this.ManaPoints = MaxManaPoints;
		this.MovementPoints = MaxMovementPoints;

		this.Practices += add_prac;
		if (this.Level % 5 == 0)
			this.Trains += 1;

		if (show)
		{
			send("\\gYou gain {0}/{1} hp, {2}/{3} mana, {4}/{5} move, and {6}/{7} practices.\\x\n\r",
				add_hp, this.MaxHitPoints, add_mana, this.MaxManaPoints,
				add_move, this.MaxMovementPoints, add_prac, this.Practices);

			if (this.Level % 5 == 0)
				send("\\YYou gain a train.\\x\n\r");

			if (!this.IsNPC && this.Level % 20 == 0 && this.Guild.Name.equals("warrior"))
			{
				send("\\YYou gain a weapon specialization.\\x\n\r");
				this.WeaponSpecializations++;
			}

			// if (this is Player && this.Guild != null && this.Guild.name == "shapeshifter" && (((Player)this).ShapeFocusMajor == ShapeshiftForm.FormType.None
			// 	|| ((Player)this).ShapeFocusMinor == ShapeshiftForm.FormType.None))
			// {
			// 	send("\\RYou have not chosen both of your shapefocuses yet. Type shapefocus major/minor to set it.\\x\n\r");
			// }
		}

		// if (this is Player && this.Guild != null && this.Guild.name == "shapeshifter")
		// 	ShapeshiftForm.CheckGainForm(this);
		
		return;
	}

	GetRecallRoom()
	{
		const RoomData = require("./RoomData");
		var recallroom = null;
		if (this.Alignment.equals("Good"))
		{
			if ((recallroom = RoomData.Rooms[19089]))
			{
				return recallroom;
			}
		}
		else if (this.Alignment.equals("Evil"))
		{
			if ((recallroom = RoomData.Rooms[19090]))
			{
				return recallroom;
			}
		}
		else
		{
			if ((recallroom = RoomData.Rooms[19091]))
			{
				return recallroom;
			}
		}

		return RoomData.Rooms[3001];
	}
	get IsInactive() { 
		const TimeSpan = require("./TimeSpan");
		return !this.IsNPC && this.LastActivity && new TimeSpan(Date.now() - this.LastActivity).totalMinutes > 5; 
	} 

	get IsAFK() { 
		return this.Flags.IsSet("AFK") || this.IsInactive; 
	} 

	DisplayFlags(viewer)
	{
		var flags = "";
		

		if (!this.IsNPC && this.IsAFK)
			flags += "\\r(AFK)\\x";
		if (this.inanimate)
			flags += "(inanimate)";
		if (this.Flags.IsSet("WizInvis"))
			flags += "\\w(WizInvis)\\x";
		if (this.AffectedBy.IsSet("Ghost"))
			flags += "\\W(Ghost)\\x";
		if (this.IsAffected("Burrow"))
			flags += "(Burrowed)";
		if (this.IsAffected("Camouflage"))
			flags += "\\G(Camouflaged)\\x";
		if (this.AffectedBy.IsSet("Hide"))
			flags = "\\R(Hidden)\\x";
		if (this.AffectedBy.IsSet("Invisible"))
			flags += "(Invis)";
		if (this.AffectedBy.IsSet("Sanctuary"))
			flags += "\\W(White Aura)\\x";
		if (this.AffectedBy.IsSet("Haven"))
			flags += "(Haven)";
		if (viewer.AffectedBy.IsSet("KnowAlignment") && this.Alignment.equals("Evil"))
			flags += "\\r(Red Aura)\\x";
		if (viewer.AffectedBy.IsSet("KnowAlignment") && this.Alignment.equals("Good"))
			flags += "\\y(Golden Aura)\\x";
		if (this.IsAffected("FaerieFire") || this.IsAffected(SkillSpell.SkillLookup("faerie fog")))
			flags += "\\m(Purple)\\x";
		if (this.IsAffected("Smelly"))
			flags += "(Smelly)";

		if (flags.length > 0) flags += " ";
		return flags;
	}

	get IsOutside() {return this.Room && !this.Room.Flags.IsSet("Indoors") && 
		this.Room.Sector != "Inside" && 
		this.Room.Sector != "Cave" && 
		this.Room.Sector != "Underground" &&
		this.Room.Sector != "Underwater"; 
	}
	get IsAwake() { return this.Position != "Sleeping"; }

	DisplayHealth(to) {
		var health = "";
		var hp = parseInt(this.HitPoints) / parseInt(this.MaxHitPoints);
		if (hp == 1)
			health = (to == this? "are" : "is") + " in perfect health.";
		else if (hp > .8)
			health = (to == this? "are" : "is") + " covered in small scratches.";
		else if (hp > .7)
			health = (to == this? "have" : "has") + " some small wounds.";
		else if (hp > .6)
			health = (to == this? "have" : "has") + " some larger wounds.";
		else if (hp > .5)
			health = (to == this? "are" : "is") + " bleeding profusely.";
		else if (hp > .4)
			health = (to == this? "are" : "is") + " writhing in agony.";
		else if (hp > 0)
			health = (to == this? "are" : "is") + " convulsing on the ground.";
		else
			health = (to == this? "are" : "is") + " dead.";
		
		if(to == this)
			to.Act("You " + health, this);
		else
			to.Act("$N " + health, this);
		
	}

	GetDamage(level, LowEndMultiplier = 1, HighEndMultiplier = 2, bonus = 0)
	{
		var dam_each =
		[
			0,
			4,  5,  6,  7,  8,  10, 13, 15, 20, 25,
			30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
			58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
			65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
			73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
			90,110,120,150,170,200,230,500,500,500
		];

		if (this.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);
		return Utility.Random(dam_each[level] * LowEndMultiplier + bonus, dam_each[level] * HighEndMultiplier + bonus);
	} // end get damage

	GetEquipmentWearSlot(item) {
		for(key in this.Equipment) {
			if(this.Equipment[key] == item) return key;
		}
		return null;
	}

	/**
	 *
	 *
	 * @param {ItemData} item
	 * @param {boolean} [atEnd=false]
	 * @return {*} 
	 */
	AddInventoryItem(item, atEnd = false)
	{
		

		if (item.ItemTypes.ISSET("Money"))
		{
			this.Silver += item.Silver;
			this.Gold += item.Gold;


			if (this.Flags.AutoSplit)
			{
				var splitamongst = Array();
				for (var other of Room.Characters)
				{
					if (other != this && !other.IsNPC && other.IsSameGroup(this))
					{
						splitamongst.Add(other);
					}
				}


				if (splitamongst.Count > 0)
				{
					var share_silver = item.Silver / (splitamongst.Count + 1);
					var extra_silver = item.Silver % (splitamongst.Count + 1);

					var share_gold = item.Gold / (splitamongst.Count + 1);
					var extra_gold = item.Gold % (splitamongst.Count + 1);


					this.Silver -= item.Silver;
					this.Silver += share_silver + extra_silver;
					this.Gold -= item.Gold;
					this.Gold += share_gold + extra_gold;


					if (share_silver > 0)
					{
						send("You split {0} silver coins. Your share is {1} silver.\n\r", item.Silver, share_silver + extra_silver);
					}

					if (share_gold > 0)
					{
						send("You split {0} gold coins. Your share is {1} gold.\n\r", item.Gold, share_gold + extra_gold);

					}
					var buf;
					if (share_gold == 0)
					{
						buf = Utility.Format("$n splits {0} silver coins. Your share is {1} silver.",
								item.Silver, share_silver);
					}
					else if (share_silver == 0)
					{
						buf = Utility.Format("$n splits {0} gold coins. Your share is {1} gold.",
							item.Gold, share_gold);
					}
					else
					{
						buf = Utility.Format(
							"$n splits {0} silver and {1} gold coins, giving you {2} silver and {3} gold.\n\r",
								item.Silver, item.Gold, share_silver, share_gold);
					}

					for(var gch of splitamongst)
					{
						if (gch != this)
						{
							if (gch.Position != "Sleeping")
								Act(buf, gch, null, null, Character.ActType.ToVictim);
							gch.Gold += share_gold;
							gch.Silver += share_silver;
						}
					}
				}// end if splitamongst.count > 0
			} // end isset autosplit
			item.Dispose();
			return true;

		}
		else
		{
			if(atEnd) this.Inventory.push(item);
			else this.Inventory.unshift(item);
			
			item.CarriedBy = this;

			return true;
		}
	}

	/**
	 * Attempt to pick up an item, can fail if too many items or too much weight
	 *
	 * @param {ItemData} item
	 * @param {ItemData} [container=null]
	 * @return {boolean} 
	 */
	GetItem(item, container = null) {
		if (item.WearFlags.Take)
		{
			if (this.Carry + 1 > this.MaxCarry)
			{
				this.send("You can't carry anymore items.\n\r");
				return false;
			}

			if (container == null)
			{
				if (this.TotalWeight + item.Weight > this.MaxWeight)
				{
					this.send("You can't carry anymore weight.\n\r");
					return false;
				}
				this.Room.Items.splice(this.Room.Items.indexOf(item), 1);
				item.Room = null;
				
				this.Act("You get $p.\n\r", null, item, null, "ToChar");
				this.Act("$n gets $p.\n\r", null, item, null, "ToRoom");
			}
			else
			{
				if (container.CarriedBy != this && this.TotalWeight + item.Weight > this.MaxWeight)
				{
					this.send("You can't carry anymore weight.\n\r");
					return false;
				}

				container.Contains.splice(container.Contains.indexOf(item), 1);
				item.Container = null;
				
				this.Act("You get $p from $P.\n\r", null, item, container, "ToChar");
				this.Act("$n gets $p from $P.\n\r", null, item, container, "ToRoom");
			}
			this.AddInventoryItem(item);
			return true;
		}
		else
			return false;
	}

	/**
	 * Attempt to get an item from the characters inventory, can be a n.item name
	 *
	 * @param {string} itemname
	 * @param {number} [count=0]
	 * @return {Array[ItemData, number]} Item and count as array
	 */
	GetItemInventory(itemname, count = 0) {
		var number = Utility.NumberArgument(itemname);
		itemname = number[1];
		number = number[0];
		for(var i = 0; i < this.Inventory.length; i++) {
			var item = this.Inventory[i];

			if((Utility.IsNullOrEmpty(itemname) || Utility.IsName(item.Name, itemname)) && ++count >= number) {
				return [item, count];
			}
		}
		return [null, count];
	}

	/**
	 * Attempt to retrieve an item from the equipment of the character, can be a n.name argument
	 *
	 * @param {string} itemname
	 * @param {number} [count=0]
	 * @return {Array[ItemData, number, string]} Item, count and slot id as array
	 */
	GetItemEquipment(itemname, count = 0) {
		var number = Utility.NumberArgument(itemname);
		itemname = number[1];
		number = number[0];
		for(var key in Character.WearSlots) {
			var item = this.Equipment[key];

			if(item && (Utility.IsNullOrEmpty(itemname) || Utility.IsName(item.Name, itemname)) && ++count >= number) {
				return [item, count, key];
			}
		}
		return [null, count, key];
	}

	/**
	 *
	 *
	 * @param {Array} list
	 * @param {string} itemname
	 * @param {number} [count=0]
	 * @return {Array} item, count, key in the list 
	 */
	GetItemList(list, itemname, count = 0) {
		var number = Utility.NumberArgument(itemname);
		itemname = number[1];
		number = number[0];
		for(var key in list) {
			var item = list[key];

			if((Utility.IsNullOrEmpty(itemname) || Utility.IsName(item.Name, itemname)) && ++count >= number) {
				return [item, count, key];
			}
		}
		return [null, count, key];
	}

	/**
	 *
	 *
	 * @param {string} itemname
	 * @return {ItemData} 
	 */
	GetItemHere(itemname, count = 0) {
		var result = this.GetItemInventory(itemname, count);
		if(!result[0])
			result = this.GetItemEquipment(itemname, result[1]);
		if(!result[0])
			result = this.GetItemList(this.Room.Items, itemname, result[1]);

		return result;
	}

	/**
	 * 
	 * @param {string} itemname 
	 * @param {number} count 
	 * @returns An ItemData matching the name specified from in the room
	 */
	GetItemRoom(itemname, count = 0) {
		var result = this.GetItemList(this.Room.Items, itemname, count);

		return result;
	}

	WearItem(item, sendMessage = true, remove = true)
	{
		var firstSlot = null;
		var emptySlot = null;
		var offhandSlotToRemove = null;
		var offhand;
		var wielded;

		var noun = "wear";
		
		// Check if the item has the UniqueEquip flag and the character is already wearing one
		if (item.ExtraFlags.UniqueEquip)
		{
			for(var key in this.Equipment)
			{
				var other = this.Equipment[key];
				if (other && other.VNum == item.VNum)
				{
					this.send("You can only wear one of those at a time.\n\r");
					return false;
				}
			}
		}

		// Check if the item has alignment restrictions that conflict with the character's alignment
		// if ((itemData.extraFlags.ISSET(ExtraFlags.AntiGood) && Alignment == Alignment.Good) ||
		//     (itemData.extraFlags.ISSET(ExtraFlags.AntiNeutral) && Alignment == Alignment.Neutral) ||
		//     (itemData.extraFlags.ISSET(ExtraFlags.AntiEvil) && Alignment == Alignment.Evil))
		// {
		//     Act("You try to wear $p, but it zaps you.", null, itemData, type: ActType.ToChar);
		//     Act("$n tries to wear $p, but it zaps $m.", null, itemData, type: ActType.ToRoom);
		//     return false;
		// }

		var handslots = { Wield: true, DualWield: true, Shield: true, Held: true };

		wielded = this.Equipment["Wield"];

		// Iterate over the available wear slots to find an empty slot or the first suitable slot
		for(var slotkey in Character.WearSlots)
		{
			var slot = Character.WearSlots[slotkey];
			// Check if the character's hands are bound and the item requires hand slots
			// if (item.WearFlags[slot.Flag] && Object.keys(handslots).indexOf(slot.ID) >= 0 && IsAffected(AffectData.AffectFlags.BindHands))
			// {
			//     this.Act("You can't equip that while your hands are bound.\n\r");
			//     return false;
			// }

			// Check if the item can be dual wielded and the character has the appropriate skill
			if (slot.ID == "DualWield" &&
				(this.GetSkillPercentage("dual wield") <= 1 ||
				item.ExtraFlags.TwoHands ||
				(wielded && wielded.ExtraFlags.TwoHands)))
				continue;

			// Check if the item can be worn in the current slot and the slot is empty
			if (item.WearFlags[slot.Flag] && !this.Equipment[slot.ID])
			{
				emptySlot = slot;
				break;
			}
			else if (item.WearFlags[slot.Flag] && firstSlot == null)
				firstSlot = slot;
		}

		// Check if a hand slot needs to be emptied for a two-handed item
		if (emptySlot && (emptySlot.ID == "Held" || emptySlot.ID == "DualWield" || emptySlot.ID == "Shield") && (wielded = this.Equipment["Wield"]) && wielded.ExtraFlags.TwoHands)
		{
			if (remove)
			{
				if (!this.RemoveEquipment(wielded, sendMessage))
					return false;
			}
			else
				return false;
		}

		// Check if a two-handed item requires the removal of an offhand item
		if (!emptySlot && !remove) return false;

		if (item.ExtraFlags.TwoHands && ((offhand = this.Equipment["Shield"]) || (offhand = this.Equipment["Held"]) || (offhand = this.Equipment["DualWield"])))
		{
			if (!this.RemoveEquipment(offhand, sendMessage))
			{
				this.send("You need two hands free for that weapon.\n\r");
				return false;
			}
		}

		// Check if there is an offhand item that needs to be replaced
		if (
			(
				(emptySlot && (emptySlot.ID == "DualWield" || emptySlot.ID == "Shield" || emptySlot.ID == "Held"))
		||
				(firstSlot && (firstSlot.ID == "DualWield" || firstSlot.ID == "Shield" || firstSlot.ID == "Held"))
			)
		&& (
				(offhand = this.Equipment["Shield"]) || (offhand = this.Equipment["Held"]) || (offhand = this.Equipment["DualWield"])
			))
		{
			if (!remove) return false;
			if (this.RemoveEquipment(offhand, sendMessage))
			{
				if (emptySlot == null)
					emptySlot = firstSlot;
			}
			else
				return false; // no remove item, should have gotten a message if we are showing messages, no switching out noremove gear in resets
		}
		// Replace an item other than the offhand
		else if (!emptySlot && firstSlot)
		{
			if (this.RemoveEquipment(this.Equipment[firstSlot.ID], sendMessage))
				emptySlot = firstSlot;
		}

		// Attempt to wear the item in the empty slot
		if (emptySlot)
		{
			if (sendMessage)
			{
				if (emptySlot.ID == "Wield" || emptySlot.ID == "DualWield")
				{
					// // Check if the character can wield the item based on their strength
					// if (!IsNPC && itemData.Weight > PhysicalStats.StrengthApply[GetCurrentStat(PhysicalStatTypes.Strength)].Wield)
					// {
					//     Act("$p weighs too much for you to wield.", null, itemData);
					//     return false;
					// }

					noun = "wield";
				}
				else
					noun = "wear";

				// Display wear messages to the character and the room
				this.Act("You " + noun + " $p " + emptySlot.WearString + ".\n\r", null, item, null, "ToChar");
				this.Act("$n " + noun + "s $p " + emptySlot.WearStringOthers + ".\n\r", null, item, null, "ToRoom");
			}

			// Add the item to the equipment slot
			this.Equipment[emptySlot.ID] = item;

			// Remove the item from the character's inventory
			if (this.Inventory.indexOf(item) >= 0)
				this.Inventory.splice(this.Inventory.indexOf(item), 1);
			item.CarriedBy = this;

			// // Apply the item's affects to the character
			// if (itemData.Durability != 0) // Broken items don't apply any affects
			// {
			//     foreach (var aff in itemData.affects)
			//         AffectApply(aff);
			// }

			// // Execute any wear programs associated with the item
			// Programs.ExecutePrograms(Programs.ProgramTypes.Wear, this, itemData, "");

			return true;
		}
		else
		{
			this.send("You couldn't wear it.\n\r");
			return false;
		}
	}

	RemoveEquipment(item, sendmessage = true, force = false) {
		var slot = null;
		for(var slotkey in this.Equipment) {
			if(this.Equipment[slotkey] == item)
				slot = slotkey;
		}
		if (!item || !slot) {
			if(sendmessage)
			this.send("You aren't wearing that.\n\r");
		} else if(item.ExtraFlags.NoRemove && !force) {
			if(sendmessage)
			this.Act("You can't remove $p.\n\r", null, item, null, "ToChar");
		} else {
			this.Inventory.unshift(item);
			
			item.CarriedBy = this;
			delete this.Equipment[slot];
			if(sendmessage) {
				this.Act("You remove $p.\n\r", null, item, null, "ToChar");
				this.Act("$n removes $p.\n\r", null, item, null, "ToRoom");
			}
			return true;
		}
		return false;
	}

	GetGroupMembersInRoom() {
		return this.Room.Characters.Select((ch) => ch.IsSameGroup(this));
	}

	get XpToLevel() { return Math.ceil(1500 + ((this.Level - 1) * 1500 * .08)); }

	CanSee(other) {
		if (other == this) return true;
            return (this.Flags.ISSET("HolyLight") && (this.Level >= other.Level || other.IsNPC)) ||
                (!this.IsAffected(AffectData.AffectFlags.Blind) &&
                (this.IsAffected(AffectData.AffectFlags.DetectInvis) || !other.IsAffected(AffectData.AffectFlags.Invisible) || 
				other.IsAffected(AffectData.AffectFlags.Smelly)) &&
                (this.IsAffected(AffectData.AffectFlags.DetectHidden) ||
                    (this.IsAffected(AffectData.AffectFlags.AcuteVision) && other.Room.IsWilderness) || 
					!other.IsAffected(AffectData.AffectFlags.Hide) || 
					other.IsAffected(AffectData.AffectFlags.Smelly)) &&
                (this.IsAffected(AffectData.AffectFlags.AcuteVision) || !other.IsAffected(AffectData.AffectFlags.Camouflage) ||
				 other.IsAffected(AffectData.AffectFlags.Smelly)) &&
                (!other.IsAffected(AffectData.AffectFlags.Burrow)) && (!other.Flags.ISSET("WizInvis")));
	}
}

module.exports = Character;

ActInfo = require("./ActInfo");
ActMovement = require("./ActMovement");
ActItem = require("./ActItem");
ActWiz = require("./ActWiz");
Mapper = require("./Mapper");
