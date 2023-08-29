const XmlHelper = require("./XmlHelper");
const AffectData = require("./AffectData");
const PhysicalStats = require("./PhysicalStats");
const SkillSpell = require("./SkillSpell");
const Utility = require("./Utility");

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
				AffectedBy[flag] = true;

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
		// TODO Check weapon weight here
		if (!IsNPC && (wield = this.Equipment.Wield) != null &&
			wield.Weight > (PhysicalStats.StrengthApply[GetCurrentStat(0)].Wield))
		{
			Act("You drop $p.", null, wield, null, ActType.ToChar);
			Act("$n drops $p.", null, wield, null, ActType.ToRoom);

			RemoveEquipment(wield, !silent, true);

			Room.items.Insert(0, wield);
			wield.Room = Room;
		}
		if (!IsNPC && (wield = this.Equipment.DualWield) != null &&
			wield.Weight > (PhysicalStats.StrengthApply[GetCurrentStat(0)].Wield))
		{
			Act("You drop $p.", null, wield, null, ActType.ToChar);
			Act("$n drops $p.", null, wield, null, ActType.ToRoom);

			RemoveEquipment(wield, !silent, true);

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

	AffectToChar(affect) {
		var newaffect = new AffectData({AffectData: affect});
		this.Affects.unshift(newaffect);

		this.AffectApply(affect, false, false);
	}

	AffectFromChar(affect) {
		var index = this.Affects.indexOf(affect);
		if(index >= 0)
		this.Affects.splice(index, 1);

		this.AffectApply(affect, true, false);
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

	// FindAffects(Flag) {
	// 	var found = false;
	// 	found = Flags[Flag];
	// 	if(!found)
	// 		for(var aff of Affects) {
	// 			if(aff.Flags[Flag]) {
	// 				found = true;
	// 				break;
	// 			}
	// 			else if(aff.SkillSpell == Flag) {
	// 				found = true;
	// 				break;
	// 			}
	// 		}
		
	// 	return found;
	// }

	IsImmortal() {
		return !this.IsNPC && this.Level > 51;
	}

	GetLevelSkillLearnedAt(skillname) {
		if(Utility.IsNullOrEmpty(skillname)) return 60;
		skillname = skillname.toLowerCase();
		var skillentry = SkillSpell.GetSkill(skillname, false);
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
		if(Utility.IsNullOrEmpty(skillname)) return 0;
		skillname = skillname.toLowerCase();
		var skillentry = SkillSpell.GetSkill(skillname, false);
		
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
			//if (IS_AFFECTED(ch, AFF_REGENERATION))
			//    gain *= 2;

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

		//if (ch->on != NULL && ch->on->item_type == ITEM_FURNITURE)
		//    gain = (gain * 7 / 5);


		if (this.IsAffected("Plague"))
			gain /= 8;

		//if (position == "Sleeping" && get_skill(ch, gsn_dark_dream) > 5)
		//{
		//    if (number_percent() < get_skill(ch, gsn_dark_dream))
		//    {
		//        check_improve(ch, gsn_dark_dream, TRUE, 7);
		//        gain *= 3;
		//        gain /= 2;
		//    }
		//}

		if (this.IsAffected("Haste"))
			gain /= 2;
		if (this.IsAffected("Slow"))
		{
			gain *= 17;
			gain /= 10;
		}
		if (this.IsAffected("Burrow"))
		{
			gain *= 17;
			gain /= 10;
		}

		if (this.GetSkillPercentage("slow metabolism") > 1)
		{
			gain *= 17;
			gain /= 10;
		}
		if (this.IsAffected("camp"))
		{
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
		//if (is_affected(ch, gsn_atrophy) || is_affected(ch, gsn_prevent_healing))
		//    return 0;

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

		//if (ch->on != NULL && ch->on->item_type == ITEM_FURNITURE)
		//    gain = gain * 7 / 5;

		if (this.IsAffected("Poison"))
			gain /= 4;

		//if (position ==  "Sleeping" && get_skill(ch, gsn_dark_dream) > 5)
		//{
		//    if (number_percent() < get_skill(ch, gsn_dark_dream))
		//    {
		//        check_improve(ch, gsn_dark_dream, TRUE, 5);
		//        gain *= 3;
		//        gain /= 2;
		//    }

		//}

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
		//if (is_affected(ch, gsn_atrophy) || is_affected(ch, gsn_prevent_healing))
		//    return 0;

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

		//gain = gain * ch->in_room->heal_rate / 100;

		//if (ch->on != NULL && ch->on->item_type == ITEM_FURNITURE)
		//    gain = gain * 6 / 5;


		//if (ch->position == POS_SLEEPING && get_skill(ch, gsn_dark_dream) > 5)
		//{
		//    if (number_percent() < get_skill(ch, gsn_dark_dream))
		//    {
		//        check_improve(ch, gsn_dark_dream, TRUE, 8);
		//        gain *= 3;
		//        gain /= 2;
		//    }
		//}

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
}





module.exports = Character;


ActInfo = require("./ActInfo");
ActMovement = require("./ActMovement");
ActItem = require("./ActItem");
ActWiz = require("./ActWiz");

