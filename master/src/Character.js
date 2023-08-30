const XmlHelper = require("./XmlHelper");
const AffectData = require("./AffectData");
const PhysicalStats = require("./PhysicalStats");
const SkillSpell = require("./SkillSpell");
const Utility = require("./Utility");
const ItemTemplateData = require("./ItemTemplateData");
const ItemData = require("./ItemData");
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
	static DoCommands = {};
    static ItemFunctions = {};
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

  	constructor() {
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
			var index = this.Room.Characters.indexOf(this);
			if(index >= 0)
				this.Room.Characters.splice(index, 1);
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
		return `<${this.HitPoints}/${this.MaxHitPoints}hp ${this.ManaPoints}/${this.MaxManaPoints}m ${this.MovementPoints}/${this.MaxMovementPoints}mv> `
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
	} // end format act message

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

			if (affect.Flags.length > 0)
			{
				for (var flag of affect.Flags)
				{
					
					// don't remove affect provided by another debuff( for example, blinded then dirt kicked, dirt kick won't remove blind of blindness )
					if (Affects.findIndex((aff) => affect != aff && affect.Flags[flag]) >= 0)
						continue;
					else if(AffectedBy[flag])
						delete AffectedBy[flag];
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

		if (!this.IsNPC && (wield = this.Equipment.Wield) &&
			wield.Weight > (PhysicalStats.StrengthApply[this.GetCurrentStat(0)].Wield))
		{
			Act("You drop $p.", null, wield, null, ActType.ToChar);
			Act("$n drops $p.", null, wield, null, ActType.ToRoom);

			Character.ItemFunctions.RemoveEquipment(this, wield, !silent, true);

			Room.items.Insert(0, wield);
			wield.Room = Room;
		}
		if (!this.IsNPC && (wield = this.Equipment.DualWield) &&
			wield.Weight > (PhysicalStats.StrengthApply[this.GetCurrentStat(0)].Wield))
		{
			Act("You drop $p.", null, wield, null, ActType.ToChar);
			Act("$n drops $p.", null, wield, null, ActType.ToRoom);

			Character.ItemFunctions.RemoveEquipment(this, wield, !silent, true);

			Room.items.Insert(0, wield);
			wield.Room = Room;
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

	IsImmortal() {
		return !this.IsNPC && this.Level > 51;
	}

	GetLevelSkillLearnedAt(skillname) {
		var skillentry;
		if(skillname instanceof SkillSpell) {
			skillentry = skillname;
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
		}
		else {
			if(Utility.IsNullOrEmpty(skillname)) return 0;
			skillname = skillname.toLowerCase();
		
			skillentry = SkillSpell.GetSkill(skillname, false);
		}
		
		if (Utility.IsNullOrEmpty(skillname) || !skillentry)
			return 0;
		else if (this.IsImmortal())
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
			this.XpTotal = Xp;

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
		var recallroom = null;
		if (Alignment.equals("Good"))
		{
			if ((recallroom = RoomData.Rooms[19089]))
			{
				return recallroom;
			}
		}
		else if (Alignment.equals("Evil"))
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
}

module.exports = Character;

ActInfo = require("./ActInfo");
ActMovement = require("./ActMovement");
ActItem = require("./ActItem");
ActWiz = require("./ActWiz");

