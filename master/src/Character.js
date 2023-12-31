const XmlHelper = require("./XmlHelper");
const AffectData = require("./AffectData");
const PhysicalStats = require("./PhysicalStats");
const SkillSpell = require("./SkillSpell");
const Utility = require("./Utility");
const ItemTemplateData = require("./ItemTemplateData");
const ItemData = require("./ItemData");
const Game = require("./Game");

const RoomData = require("./RoomData");
const ShapeshiftForm = require("./Shapeshift");
const AreaData = require("./AreaData");
class Character {
	/**
	 * Array of NPC and Player characters in the world.
	 *
	 * @static
	 * @memberof Character
	 */
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
	static Alignment = {"Good": "Good", "Neutral": "Neutral", "Evil": "Evil"};
	static Ethos = {"Orderly": "Orderly", "Neutral": "Neutral", "Chaotic": "Chaotic"};
	
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
		"OOCChannel": "OOCChannel",
		"GeneralChannel": "GeneralChannel",
        "NoDuels": "NoDuels",
        "AFK": "AFK",
    };

	static Sexes = {Male: "Male", Female: "Female", None: "None"}
	static DoCommands = {};
	static CaptureCommunications = false;
	
	IsNPC = true;
	VNum = 0;
	Name = null;
	socket = null;
	input = "";
	output = "";
	RoomVNum = 0;
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
	Wimpy = 0;

	get Position() { return this._position; }

	set Position(value) {
		this._position = value;
	}
	Race = null;
	Sex = "neutral";
	Size = "Medium";
	Material = "unknown";
	Inventory = Array();
	Equipment = {};
	AffectedBy = {};
	ImmuneFlags = {};
	VulnerableFlags = {};
	ResistFlags = {};
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
	
	Following = null;
	LastFighting = null;

	get Fighting() { return this._fighting; }
	set Fighting(value) {
		if(value && value != this.LastFighting) this.LastFighting = value;
		this._fighting = value;
	}

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
	PagingText = false;
	PagedText = "";
	ScrollCount = 40;
	PoofIn = "$n fizzles into existence.";
	PoofOut = "$n fizzles out of existence.";
	Prompt = "";
	ShapeFocusMajor = "";
	ShapeFocusMinor = "";
	
  	constructor(add = true) {
		if(add)
		Character.Characters.push(this);
	}

	Dispose() {
		if(!this.IsNPC) {
			for(var other of Character.Characters) {
				if(other.Master == this) {
					other.Dispose();
				}

				if(other.LastFighting == this) other.LastFighting = null;
			}
		}

		if(this.Form) ShapeshiftForm.DoRevert(this, "");

		if(this.Room) {
			this.RemoveCharacterFromRoom();
		}

		Character.Characters.Remove(this);
	}

	send(data) {}
	sendnow(data) {}

	

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
		const Game = require('./Game');
		if (to && !to.CanSee(this))
		{
			if (!this.IsNPC && this.Level >= Game.LEVEL_IMMORTAL && this.Flags.ISSET(Character.ActFlags.WizInvis))
				return "An Immortal";
			else
				return "someone";
		} else if (this.Form != null && !this.Form.ShortDescription.ISEMPTY()) {
			return this.Form.ShortDescription;
		} else if(this.ShortDescription && this.ShortDescription.length > 0)
			return this.ShortDescription;
		else
			return this.Name;
	}

	Display(to) {
		return this.GetShortDescription(to);
	}

	GetLongDescription() {
		const TimeInfo = require('./TimeInfo');
		if (this.Position == "Standing" && this.Form != null && !this.Form.LongDescription.ISEMPTY()) {
                return this.Form.LongDescription;
        } else if(this.Position == this.DefaultPosition && this.NightLongDescription && !this.NightLongDescription.ISEMPTY())
			return this.NightLongDescription;
		else if(this.Position == this.DefaultPosition && this.LongDescription && !this.LongDescription.ISEMPTY())
			return this.LongDescription;
		else
			return Utility.Format("{0} is " + this.Position.toLowerCase() + " here.\n\r", Utility.Capitalize(this.GetShortDescription()));
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
		var flags;
		if(!(acttype instanceof String || typeof acttype == "string")) {
			flags = acttype.flags;
			acttype = acttype.type;
		} 
		if(!message || message.length == 0)
			return;
		if(this.Room == null && acttype != "ToChar")
			return;

		if(acttype == "ToVictim" && (!victim || !victim.Room))
			return;

		if (acttype == "ToRoom" || acttype == "ToRoomNotVictim") {
			for(var other of this.Room.Characters) {
				if(flags && flags.WizInvis && 
				  this.Flags.ISSET(Character.ActFlags.WizInvis) && 
				  (!other.Flags.ISSET(Character.ActFlags.HolyLight) || this.Level > other.Level)) {
					continue;
				}
				if(other != this && (other != victim || acttype != "ToRoomNotVictim") &&
				other.Position != "Sleeping") {
					var output = this.FormatActMessage(message, other, victim, item, item2, params);
					other.send(output);
				}
			}
		} else if(acttype == "ToVictim") {
			if(flags && flags.WizInvis && 
				this.Flags.ISSET(Character.ActFlags.WizInvis) && 
				(!victim.Flags.ISSET(Character.ActFlags.HolyLight) || this.Level > victim.Level)) {
				  return;
			  }
			var output = this.FormatActMessage(message, victim, victim, item, item2, params);
			victim.send(output);
		} else if(acttype == "ToChar") {
			var output = this.FormatActMessage(message, this, victim, item, item2, params);
			this.send(output);
		} else if (acttype == Character.ActType.GlobalNotVictim) {
			for (var other of Character.Characters)
			{
				if(flags && flags.WizInvis && 
				  this.Flags.ISSET(Character.ActFlags.WizInvis) && 
				  (!other.Flags.ISSET(Character.ActFlags.HolyLight) || this.Level > other.Level)) {
					continue;
				}
				if (other != this && other != victim)
				{
					var output = this.FormatActMessage(message, this, victim, item, item2, params);
					other.send(output);
				}
			}
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
								output += display;
							}
							break;
						case 'e':
							output += this.Sex.equals("Male") ? "he" : (this.Sex.equals("Female") ? "she" : "it");
							break;
						case 'E':
							if (victim != null)
							output += victim.Sex.equals("Male") ? "he" : (victim.Sex.equals("Female") ? "she" : "it");
							break;
						case 'm':
							output += this.Sex .equals( "Male" ) ? "him" : (this.Sex .equals( "Female" ) ? "her" : "it");
							break;
						case 'M':
							if (victim != null)
							output += victim.Sex .equals("Male") ? "him" : (victim.Sex .equals( "Female" ) ? "her" : "it");
							break;
						case 's':
							output += this.Sex .equals("Male") ? "his" : (this.Sex.equals( "Female") ? "her" : "their");
							break;
						case 'S':
							if (victim != null)
							output += victim.Sex.equals( "Male") ? "his" : (victim.Sex.equals( "Female") ? "her" : "their");
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

	GetCurrentStatOutOfForm(stat) { 
		if (this.PcRace && this.PcRace.MaxStats)
			return Math.min(this.PcRace.MaxStats[stat], Math.min(25, Math.max(3, this.PermanentStats && this.ModifiedStats ? this.PermanentStats[stat] + this.ModifiedStats[stat] : (this.IsNPC ? 20 : 3))));
		else
			return Math.min(25, Math.max(3, this.PermanentStats && this.ModifiedStats ? this.PermanentStats[stat] + this.ModifiedStats[stat] : (this.IsNPC ? 20 : 3)));
	}

	GetCurrentStat(stat) {
		var fromaffects = 0;
		for(var aff of this.Affects) {
			if(stat == PhysicalStats.PhysicalStatTypes.Strength && aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Strength)
				fromaffects += aff.Modifier;
			if(stat == PhysicalStats.PhysicalStatTypes.Wisdom && aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Wisdom)
				fromaffects += aff.Modifier;
			if(stat == PhysicalStats.PhysicalStatTypes.Intelligence && aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Intelligence)
				fromaffects += aff.Modifier;
			if(stat == PhysicalStats.PhysicalStatTypes.Dexterity && aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Dexterity)
				fromaffects += aff.Modifier;
			if(stat == PhysicalStats.PhysicalStatTypes.Constitution && aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Constitution)
				fromaffects += aff.Modifier;
			if(stat == PhysicalStats.PhysicalStatTypes.Charisma && aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Charisma)
				fromaffects += aff.Modifier;
		}
		if(this.Form) return Math.max(Math.min(this.Form.Stats[stat] + fromaffects, 25), 3);
		return this.GetCurrentStatOutOfForm(stat);
	}

	GetModifiedStatUncapped(stat)
	{
		var fromaffects = 0;
		for(var aff of this.Affects) {
			if(stat == PhysicalStats.PhysicalStatTypes.Strength && aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Strength)
				fromaffects += aff.Modifier;
			if(stat == PhysicalStats.PhysicalStatTypes.Wisdom && aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Wisdom)
				fromaffects += aff.Modifier;
			if(stat == PhysicalStats.PhysicalStatTypes.Intelligence && aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Intelligence)
				fromaffects += aff.Modifier;
			if(stat == PhysicalStats.PhysicalStatTypes.Dexterity && aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Dexterity)
				fromaffects += aff.Modifier;
			if(stat == PhysicalStats.PhysicalStatTypes.Constitution && aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Constitution)
				fromaffects += aff.Modifier;
			if(stat == PhysicalStats.PhysicalStatTypes.Charisma && aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Charisma)
				fromaffects += aff.Modifier;
		}
		if(this.Form) return this.Form.Stats[stat] + fromaffects;
		return this.PermanentStats && this.ModifiedStats ? this.PermanentStats[stat] +this. ModifiedStats[stat] : (this.IsNPC ? 20 : 3);
	}

	AffectToChar(affect, show = true) {
		var newaffect = new AffectData({AffectData: affect});
		this.Affects.unshift(newaffect);

		this.AffectApply(affect, false, !show);
	}

	AffectFromChar(affect, reason = "Other", show = true) {
		affect.EndReason = reason;

		if(affect.SkillSpell && affect.SkillSpell.EndFun) {
			affect.SkillSpell.EndFun(this, affect);
		}

		const Program = require("./Program");
		if(affect.EndProgram) {
			Program.Execute(affect.EndProgram, this, null, null, null, affect, Program.ProgramTypes.AffectEnd);
		}
		this.Affects.Remove(affect);

		this.AffectApply(affect, true, !show);
	}

	StripAffects(params = {AffectFlag: null, SkillSpell: null}, silent = false) {
		if(params.AffectFlag) {
			for(var aff of Utility.CloneArray(this.Affects)) {
				if(Array.isArray(params.AffectFlag)) {
					for(var flag of params.AffectFlag) {
						if(aff.Flags[flag])
							this.AffectFromChar(aff, AffectData.AffectRemoveReason.Stripped, !silent)
					}
				} else if(aff.Flags[params.AffectFlag]) {
					this.AffectFromChar(aff, AffectData.AffectRemoveReason.Stripped, !silent)
				}
			}
		}

		if(params.SkillSpell) {
			for(var aff of Utility.CloneArray(this.Affects)) {	
				if(aff.SkillSpell == params.SkillSpell)
					this.AffectFromChar(aff, AffectData.AffectRemoveReason.Stripped, !silent)
			}
		}
	}

	IsAffected(Flag) {
		var found = false;
		var skillspell = Flag instanceof SkillSpell;
		if(!skillspell)
			found = this.Flags[Flag];
		if(!found) {
			if(!skillspell) {
				for(var setflag in this.Flags) { // case insensitive search
					if(setflag.equals(Flag)) {
						return Flags[setflag];
					}
				}
			}
			for(var aff of this.Affects) {
				if(!skillspell && aff.Flags.IsSet(Flag)) {
					return aff;
					//found = true;
					//break;
				}
				else if((skillspell && aff.SkillSpell == Flag) || (aff.SkillSpell && aff.SkillSpell.Name.equals(Flag))) {
					return aff;
					//found = true;
					//break;
				}
			}
		}
		return found || false;
	}

	FindAffect(Flag) {
				
		for(var aff of this.Affects) {
			if(Flag instanceof SkillSpell) {
				if(aff.SkillSpell == Flag) return aff;
			} else if(aff.Flags.ISSET(Flag)) {
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
			} else if(aff.SkillSpell == Flag || (aff.SkillSpell && aff.SkillSpell.Name.equals(Flag))) {
				affects.push(aff);
			}
		}
		
		return affects;
	}

	get IsImmortal() {
		return !this.IsNPC && this.Level > 51;
	}

	GetLevelSkillLearnedAtOutOfForm(skillname) {
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
		if (Utility.IsNullOrEmpty(skillname) || !skillentry) {
			if(this.IsNPC) return 10000;
			return 60;
		}
		else if (skillentry && !skillentry.PrerequisitesMet(this)) {
			if(this.IsNPC) return 10000;
			return 60;
		}
		else if (this.Learned[skillname]) {
			return this.Learned[skillname].Level;
		}
		else if (!this.Guild || !skillentry.LearnedLevel[this.Guild.Name]) {
			if(this.IsNPC) return 10000;
			return 60;
		}
		else
			return skillentry.LearnedLevel[this.Guild.Name];
	}

	GetSkillPercentageOutOfForm(skillname) {
		
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
		if(this.Form && this.Form.FormSkill == skillentry && this.Learned[skillname]) return this.Learned[skillname].Level;
		var informskills = ["control speed", "trance", "meditation", "control phase", "control skin", "control levitation"];
		if(this.Form && this.Form.Skills[skillname]) {
			return this.GetLevelSkillLearnedAt(this.Form.FormSkill);
		} else if (this.Form && !skillentry.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.InForm) && 
			informskills.indexOf(skillname) < 0 && !skillentry.SpellFun)
		{
			if(this.IsNPC) return 10000;
			return 60;
		}

		if (Utility.IsNullOrEmpty(skillname) || !skillentry) {
			if(this.IsNPC) return 10000;
			return 60;
		}
		else if (skillentry && !skillentry.PrerequisitesMet(this)) {
			if(this.IsNPC) return 10000;
			return 60;
		}
		else if (this.Learned[skillname]) {
			return this.Learned[skillname].Level;
		}
		else if (!this.Guild || !skillentry.LearnedLevel[this.Guild.Name]) {
			if(this.IsNPC) return 10000;
			return 60;
		}
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
		
		if (this.Form && skillentry)
		{
			var informskills = ["control speed", "trance", "meditation", "control phase", "control skin", "control levitation"];
			if (this.Form.FormSkill != skillentry) // no stack overflow
			{
				var formskill = this.GetSkillPercentage(this.Form.FormSkill);

				if (this.Form.Skills[skillname])
					return (formskill * this.Form.Skills[skillname] / 100);
				else if (skillentry.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Form) && this.Learned[skillname])
					return this.Learned[skillname].Percent;
				else if (informskills.indexOf(skillname) >= 0 && this.Learned[skillname])
					return this.Learned[skillname].Percent;
				else if ((informskills.indexOf(skillname) >= 0 || skillentry.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Form)) && this.IsImmortal)
					return 100;
				else
					return 0;
			}
			else if (this.Form.FormSkill == skillentry && this.Learned[skillname])
				return this.Learned[skillname].Percent;
			else if (skill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Form) && Learned[skillname])
				return this.Learned[skillname].Percent;
			else if (this.IsImmortal && !skill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.InForm))
				return 100;
			else
				return 0;
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

	GetSkillRating(sk) {
		var skill;
		var rating;
		if(sk instanceof SkillSpell) {
			skill = sk;
			sk = skill.Name;
		} else {
			skill = SkillSpell.SkillLookup(sk);
			sk = skill.Name;
		}
		if (!skill || !this.Guild)
			return 0;
		else if (this.IsImmortal)
			return 0;
		else if (this.Guild && (rating = skill.Rating[this.Guild.Name]))
			return rating;
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
		var sk;
		if(skillname instanceof SkillSpell) {
			sk = skillname;
			skillname = sk.Name;
		} else {
			sk = SkillSpell.SkillLookup(skillname);
			if(sk)
				skillname = sk.Name;
		}
		var victim;
		var chance;

		if (!sk)
			return;

		if (this.IsNPC)
			return;

		if ((this.Level < this.GetLevelSkillLearnedAt(sk) && !sk.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Form))
			|| this.GetSkillPercentage(sk) <= 1
			|| this.GetSkillPercentage(sk) >= 100)
			return;  /* skill is not known */

		if (this.Form && !sk.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Form) && sk.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.InForm) && !sk.SpellFun)
		{
			return;
		}

		if (!this.Learned[skillname])
			return;


		/* check to see if the character has a chance to learn */
		chance = 10 * PhysicalStats.IntelligenceApply[this.GetCurrentStatOutOfForm(PhysicalStats.PhysicalStatTypes.Intelligence)].Learn;
		chance /= (rating * this.GetSkillRating(sk) * 4) != 0 ? (rating * this.GetSkillRating(sk) * 4) : 1;
		chance += this.evel;
		if ((victim = this.Fighting) != null)
		{
			if (victim.IsNPC)
			{
				if (victim.Level > this.Level)
				{
					chance += (victim.Level - this.Level) * 10;
				}
			}
			if (!victim.IsNPC)
			{
				chance += (victim.Level) * 2;
			}
		}
		else
		{
			chance += this.Level;
		}

		//chance = (int)(chance * BonusInfo.LearningBonus);

		if (Utility.Random(1, 1000) > chance)
			return;

		/* now that the character has a CHANCE to learn, see if they really have */
		var prereqsnotmet = SkillSpell.Skills.Select(sk => !sk.PrerequisitesMet(this));// this.Learned.Select((l,k) => !SkillSpell.SkillLookup(k).PrerequisitesMet(this));

		if (success)
		{
			chance = Utility.URANGE(5, 100 - this.GetSkillPercentage(sk), 95);
			if (Utility.NumberPercent() < chance)
			{
				this.Learned[sk].Percent += 1;
				this.GainExperience(4 + (2 * this.GetSkillRating(sk)));
				if (sk.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Form) && this.Form)
				{
					if (this.GetSkillPercentage(sk) == 100)
						this.send("\\GYou feel confident as a {0}!\\x\n\r", this.Form.Name || "unknown");
					else
						this.send("\\GYou feel more confident as a {0}!\\x\n\r", this.Form.Name || "unknown");
				}
				else if (this.GetSkillPercentage(sk) == 100)
				{
					this.send("\\GYou have perfected {0}!\\x\n\r", sk.Name);
				}
				else
				{
					this.send("\\YYou have become better at {0}!\\x\n\r", sk.Name);
				}
			}
		}

		else
		{
			chance = Utility.URANGE(5, this.GetSkillPercentage(sk) / 2, 30);
			if (Utility.NumberPercent() - 28 < chance)
			{
				this.Learned[sk.Name].Percent += Utility.Random(1, 3);
				this.Learned[sk.Name].Percent = Math.min(this.Learned[sk.Name].Percent, 100);
				this.GainExperience(4 + 2 * this.GetSkillRating(sk));

				if (sk.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Form) && this.Form)
				{
					if (this.GetSkillPercentage(sk) == 100)
						this.send("\\GYou feel confident as a {0}!\\x\n\r", this.Form.Name || "unknown");
					else
						this.send("\\GYou feel more confident as a {0}!\\x\n\r", this.Form.Name || "unknown");
				}
				else if (this.GetSkillPercentage(sk) == 100)
				{
					this.send("\\GYou learn from your mistakes, and manage to perfect {0}!\\x\n\r", sk.Name);
				}
				else
				{
					this.send("\\YYou learn from your mistakes, and your {0} skill improves!\\x\n\r", sk.Name);

				}
			}
		}
		for (var prereqnotmet of prereqsnotmet)
		{
			//var skill = SkillSpell.SkillLookup(prereqnotmet);
			if (prereqnotmet.PrerequisitesMet(this))
			{
				this.send("\\CYou feel a rush of insight into {0}!\\x\n\r", skill.Name);
			}
		}
	}

	GetHitPointsGain()
	{
		var gain;
		var number;

		if (!this.Room)
			return 0;

		if (!this.IsImmortal && !this.IsNPC && !this.IsAffectedFlag("Ghost"))
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

		if (!this.IsImmortal && !this.IsNPC && !this.IsAffected("Ghost"))
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

		if (!this.IsImmortal && this.IsNPC && !this.IsAffected("Ghost"))
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
		if (vnum != 0 &&  (template = ItemTemplateData.Templates[vnum]) && this.Room != null)
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
			var buf = Utility.Format("\\CYou receive \\W{0}\\C experience points.\\x\n\r", xp.toFixed(2));
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
		this.XpTotal += gain;

		// if (this.Xp > this.XpTotal)
		// 	this.XpTotal = this.Xp;

		while (this.Level < 51 && this.XpTotal >=
			this.XpToLevel * (this.Level))
		{
			this.AdvanceLevel();
		}

		return;
	}

	AdvanceLevel(show = true)
	{
		if (show)
			this.send("\\gYou raise a level!!  \\x\n\r");
		this.Level += 1;
		
		//WizardNet.Wiznet(WizardNet.Flags.Levels, "{0} gained level {1}", null, null, Name, Level);

		this.GiveAdvanceLevelGains(show);
		if (!this.IsNPC && this.Guild)
		{
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
			this.Save();
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

		add_hp = PhysicalStats.ConstitutionApply[this.GetCurrentStatOutOfForm(PhysicalStats.PhysicalStatTypes.Constitution)].Hitpoints + 
			(this.Guild != null ? Utility.Random(
				this.Guild.HitpointGain,
				this.Guild.HitpointGainMax) : 3);

		var int_mod = this.GetCurrentStatOutOfForm(PhysicalStats.PhysicalStatTypes.Intelligence) - 2;

		add_mana = Math.min(1 + Utility.Random(int_mod / 2, int_mod), 16);
		
		add_move = Utility.Random(1, (this.GetCurrentStatOutOfForm(PhysicalStats.PhysicalStatTypes.Constitution)
			+ this.GetCurrentStatOutOfForm(PhysicalStats.PhysicalStatTypes.Dexterity)) / 6);
		
		add_prac = PhysicalStats.WisdomApply[this.GetCurrentStatOutOfForm(PhysicalStats.PhysicalStatTypes.Wisdom)].Practice;
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
		this.HitPoints = this.MaxHitPoints;
		this.ManaPoints = this.MaxManaPoints;
		this.MovementPoints = this.MaxMovementPoints;

		this.Practices += add_prac;
		if (this.Level % 5 == 0)
			this.Trains += 1;
		
		if (!this.IsNPC && this.Level % 20 == 0 && this.Guild.Name.equals("warrior"))
		{
			// always send message for this
			this.send("\\YYou gain a weapon specialization.\\x\n\r");
			this.WeaponSpecializations++;
		}
		
		const ShapeshiftForm = require('./Shapeshift');
		if (show)
		{
			this.send("\\gYou gain {0}/{1} hp, {2}/{3} mana, {4}/{5} move, and {6}/{7} practices.\\x\n\r",
				add_hp, this.MaxHitPoints, add_mana, this.MaxManaPoints,
				add_move, this.MaxMovementPoints, add_prac, this.Practices);

			if (this.Level % 5 == 0)
			this.send("\\YYou gain a train.\\x\n\r");



			if (this.Guild && this.Guild.Name == "shapeshifter" && (!this.ShapeFocusMajor || this.ShapeFocusMajor == ShapeshiftForm.FormType.None
				|| !this.ShapeFocusMinor || this.ShapeFocusMinor == ShapeshiftForm.FormType.None))
			{
				this.send("\\RYou have not chosen both of your shapefocuses yet. Type shapefocus major/minor to set it.\\x\n\r");
			}
		}

		// always send message for this
		if (this.Guild && this.Guild.Name == "shapeshifter")
			ShapeshiftForm.CheckGainForm(this);
		
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
				for (var other of this.Room.Characters)
				{
					if (other != this && !other.IsNPC && other.IsSameGroup(this))
					{
						splitamongst.push(other);
					}
				}


				if (splitamongst.length > 0)
				{
					var share_silver = item.Silver / (splitamongst.length + 1);
					var extra_silver = item.Silver % (splitamongst.length + 1);

					var share_gold = item.Gold / (splitamongst.length + 1);
					var extra_gold = item.Gold % (splitamongst.length + 1);


					this.Silver -= item.Silver;
					this.Silver += share_silver + extra_silver;
					this.Gold -= item.Gold;
					this.Gold += share_gold + extra_gold;


					if (share_silver > 0)
					{
						this.send("You split {0} silver coins. Your share is {1} silver.\n\r", item.Silver, share_silver + extra_silver);
					}

					if (share_gold > 0)
					{
						this.send("You split {0} gold coins. Your share is {1} gold.\n\r", item.Gold, share_gold + extra_gold);

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
								this.Act(buf, gch, null, null, Character.ActType.ToVictim);
							if(share_gold)
							gch.Gold += share_gold;
							if(share_silver)
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

			if(((number && Utility.IsNullOrEmpty(itemname)) || 
				(!Utility.IsNullOrEmpty(itemname) && Utility.IsName(item.Name, itemname))) 
				&& ++count >= number) {
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

			if(item && ((number && Utility.IsNullOrEmpty(itemname)) || 
				(!Utility.IsNullOrEmpty(itemname) && Utility.IsName(item.Name, itemname))) 
				&& ++count >= number) {
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

			if(((number && Utility.IsNullOrEmpty(itemname)) || 
				(!Utility.IsNullOrEmpty(itemname) && Utility.IsName(item.Name, itemname))) 
				&& ++count >= number) {
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
		if ((item.ExtraFlags.ISSET(ItemData.ExtraFlags.AntiGood) && this.Alignment == Character.Alignment.Good) ||
		    (item.ExtraFlags.ISSET(ItemData.ExtraFlags.AntiNeutral) && this.Alignment == Character.Alignment.Neutral) ||
		    (item.ExtraFlags.ISSET(ItemData.ExtraFlags.AntiEvil) && this.Alignment == Character.Alignment.Evil))
		{
		    this.Act("You try to wear $p, but it zaps you.", null, item, null, Character.ActType.ToChar);
		    this.Act("$n tries to wear $p, but it zaps $m.", null, item, null, Character.ActType.ToRoom);
		    return false;
		}

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
				item.ExtraFlags.ISSET(ItemData.ExtraFlags.TwoHands) ||
				(wielded && wielded.ExtraFlags.ISSET(ItemData.ExtraFlags.TwoHands))))
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
					// if (!IsNPC && item.Weight > PhysicalStats.StrengthApply[GetCurrentStat(PhysicalStatTypes.Strength)].Wield)
					// {
					//     Act("$p weighs too much for you to wield.", null, item);
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
			// if (item.Durability != 0) // Broken items don't apply any affects
			// {
			//     foreach (var aff in item.affects)
			//         AffectApply(aff);
			// }

			// // Execute any wear programs associated with the item
			// Programs.ExecutePrograms(Programs.ProgramTypes.Wear, this, item, "");

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

	CalculateXpToLevel(level) {
		if(!level) level = this.Level;
		return Math.ceil(1500 + ((level - 1) * 1500 * .08));
	}

	get XpToLevel() { return Math.ceil(1500 + ((this.Level - 1) * 1500 * .08)); }

	CanSee(other) {
		if (other == this) return true;
		if (other instanceof Character) {
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
		} else if(other instanceof ItemData) {
			return this.Flags.ISSET(Character.ActFlags.HolyLight) ||
                (!this.IsAffected(AffectData.AffectFlags.Blind) && (!other.ExtraFlags.ISSET(ItemData.ExtraFlags.VisDeath) || this.IsImmortal || this.IsNPC) &&
                (this.IsAffected(AffectData.AffectFlags.DetectInvis) || !other.ExtraFlags.ISSET(ItemData.ExtraFlags.Invisibility) || IsAffected(AffectData.AffectFlags.ArcaneVision)));
		} else return true;
	}

	NoFollow(all = false)
	{
		if (this.Following != null)
		{
			this.send("You stop following " + (this.Following.Display(this)) + ".\n\r");
			if(this.Following.Leader == this.Leader) {
				for(var other of Character.Characters)
				{
					if (other.Leader == this.Leader && other != this)
					{
						other.Act("$N leaves the group.", this);
					}
				}
				this.Leader = null;
			}
			this.Following = null;
		}
		this.send("You stop allowing followers.\n\r");

		for (var other of Character.Characters)
		{
			if (other.Following == this)
			{

				if (other.Leader == this && (all || other.Master != this))
				{
					other.Leader = null;
					
					this.Act("$N leaves your group.\n\r", other, null, null, Character.ActType.ToChar);
					this.Act("You leave $n's group.\n\r", other, null, null, Character.ActType.ToVictim);
				} 

				if(other.Following == this && (all || other.Master != this)) {
					other.Following = null;
					this.Act("$N stops following you.\n\r", other, null, null, Character.ActType.ToChar);
					this.Act("You stop following $n.\n\r", other, null, null, Character.ActType.ToVictim);
				}

				if (all && other.Master == this)
				{
					other.Leader = null;
					other.Following = null;
					other.Act("$n wanders off.", null, null, null, Character.ActType.ToRoom);
					other.RemoveCharacterFromRoom();
					Character.Characters.Remove(other);
				}
			}
		}
	} // end nofollow

	static CreateMoneyItem(silver, gold)
	{
		var obj;

		if (gold < 0 || silver < 0 || (gold == 0 && silver == 0)) {
			gold = Math.max(1, gold);
			silver = Math.max(1, silver);
		}

		if (gold == 0 && silver == 1) {
			var silvertemplate = ItemTemplateData.Templates[1];
			obj = new ItemData(silvertemplate);
		} else if (gold == 1 && silver == 0) {
			var goldtemplate = ItemTemplateData.Templates[3];
			obj = new ItemData(goldtemplate);
		} else if (silver == 0) {
			var goldpile = ItemTemplateData.Templates[4];
			obj = new ItemData(goldpile);

			obj.ShortDescription = Utility.Format(obj.ShortDescription, gold);
		} else if (gold == 0) {
			var silverpile = ItemTemplateData.Templates[2];
			obj = new ItemData(silverpile);

			obj.ShortDescription = Utility.Format(obj.ShortDescription, silver);
		} else {
			var coinpile = ItemTemplateData.Templates[5];
			obj = new ItemData(coinpile);

			obj.ShortDescription = Utility.Format(obj.ShortDescription, silver, gold);
		}
		obj.Silver = silver;
		obj.Gold = gold;
		obj.Value = (silver + gold * 1000);
		return obj;
	} // end create money item

	StartPaging() {
		this.PageText = "";
		this.PagingText = true;
	}
	
	EndPaging() {
		this.PagingText = false;
		var index = 0;
		var count = 0;
		var text = this.PageText.replaceAll("\r", "");
		for (index = text.indexOf("\n", index); count < this.ScrollCount + 1 && text.length > index + 2 && index > -1; index = text.indexOf("\n", index + 1))
			count++;

		if (count > this.ScrollCount)
			this.SendPage();
		else
		{
			this.send(this.PageText);
			this.PageText = "";
		}
	}

	SendPage()
	{
		var index = 0;
		var count = 0;
		var lastIndex = 0;
		var text = this.PageText.replaceAll("\r", "");
		for (index = text.indexOf("\n", index); count < this.ScrollCount && text.length > index + 1; index = text.indexOf("\n", index + 1)) {
			count++;
			lastIndex = index;
		}
		if(count == this.ScrollCount)
			index = lastIndex;

		if (index >= 0 && index < text.length)
		{
			this.PageText = "";

			if (text.length > index + 1) {
				this.PageText += text.substring(index + 1);
			}

			this.send(text.substring(0, index + 1));

			if (this.PageText && !this.PageText.ISEMPTY())
			{

				
					if (this.status != "Playing") {
						this.send("[Hit Enter to Continue]"); // output while playing will display a prompt and this line at time of output
					} else {
						this.SittingAtPrompt = true;
						this.send("[Hit Enter to Continue]");
					}
			}
			else
			this.send("\n\r");
		}
		else
		{
			this.PageText = "";
			this.send(text + "\n\r");

		}
	} // end SendPage

	ScanDirection(args, room = null, depth = 0) {
		room = room || this.Room;
		var index = -1;
		var direction = "";
		var exit;
		for(var tempdirection of RoomData.Directions) {
			if(tempdirection.prefix(args)) {
				index = RoomData.Directions.indexOf(tempdirection);
				exit = room.Exits[index];
				direction = tempdirection.toLowerCase();
				break;
			}
		}

		depth++;

		if (depth == 1 && direction)
		{
			this.send("You scan {0}.\n\r", direction);
			this.Act("$n scans {0}.\n\r", null, null, null, Character.ActType.ToRoom, direction);
		}
		
		
		if(!exit && args.ISEMPTY() || "all".prefix(args)) {
			// if (depth == 1) {
			// 	this.send("You scan all directions.\n\r");
			// 	this.Act("$n scans all directions.\n\r", null, null, null, Character.ActType.ToRoom, direction);
			// }
			for(var direction of RoomData.Directions) {
				this.ScanDirection(direction)
			}
		} else if(!exit && index < 0) {
			this.send("Scan in which direction?\n\r");
		} else if(exit && exit.Destination) {
			//var IsDark = exit.Destination.IsDark;

			var others = exit.Destination.Characters.Select(other => this.CanSee(other) && this != other);

			if (exit.Flags.ISSET("Closed"))
			{
				this.send("**** " + depth + " " + direction + " ****\n\r");
				this.send("Closed\n\r");
				return;
			}
			//else if (!ch.IsAffected(AffectFlags.Infrared) && !ch.IsAffected(AffectFlags.DarkVision) && !ch.IsAffected(AffectFlags.NightVision)  && IsDark)
			//{
			//    ch.send("**** " + depth + " " + direction.ToString() + " ****\n\r");
			//    ch.send("Too dark to tell\n\r");
			//}
			else if (others.length > 0)
			{
				this.send("**** " + depth + " " + direction + " ****\n\r");
				for (var other of others)
				{
					this.send(other.DisplayFlags(this));
					this.Act(other.GetLongDescription(this));
				}
			}
			if (depth < 4 && !exit.Flags.ISSET("Closed"))
				this.ScanDirection( args, exit.Destination, depth);

		}
	}

	Load(xml) {
		const RaceData = require('./RaceData');
		const GuildData = require('./GuildData');
		this.VNum = xml.GetElementValueInt("VNum");
		const NPCTemplateData = require("./NPCTemplateData");
		if(this.VNum != 0) {
			this.Template = NPCTemplateData.Templates[this.VNum];
		}

		this.Name = xml.GetElementValue("Name");
		
		this.ShortDescription = xml.GetElementValue("ShortDescription");
		this.LongDescription = xml.GetElementValue("LongDescription");
		this.Description = xml.GetElementValue("Description");
		var race = xml.GetElementValue("Race", "human");
		if(!(this.Race = RaceData.LookupRace(race)))
		Game.log(`Race ${race} not found`, Game.LogLevels.Warning);
		this.Alignment = xml.GetElementValue("Alignment");
		this.Ethos = xml.GetElementValue("Ethos");
		this.Sex = xml.GetElementValue("Sex");
		this.Level = xml.GetElementValueInt("Level");
		this.DamageRoll = xml.GetElementValueInt("DamRoll");
		this.HitRoll = xml.GetElementValueInt("HitRoll");
		this.ArmorClass = xml.GetElementValueInt("ArmorClass");
		this.Silver = xml.GetElementValueInt("Silver");
		this.Gold = xml.GetElementValueInt("Gold");
		this.Wimpy = xml.GetElementValue("Wimpy");
		
		this.SavingThrow = xml.GetElementValueInt("SavingThrow");

		this.AffectedBy = {};
		Utility.ParseFlags(this.AffectedBy, XmlHelper.GetElementValue("AffectedBy"));

		this.HitPoints = XmlHelper.GetElementValueFloat(xml,"HitPoints");
		this.MaxHitPoints = XmlHelper.GetElementValueFloat(xml,"MaxHitPoints");
		this.ManaPoints = XmlHelper.GetElementValueFloat(xml,"ManaPoints");
		this.MaxManaPoints = XmlHelper.GetElementValueFloat(xml,"MaxManaPoints");
		this.MovementPoints = XmlHelper.GetElementValueFloat(xml,"MovementPoints");
		this.MaxMovementPoints = XmlHelper.GetElementValueFloat(xml,"MaxMovementPoints");
		
		this.ArmorBash = xml.GetElementValueInt("ArmorBash");
		this.ArmorPierce = xml.GetElementValueInt("ArmorPierce");
		this.ArmorSlash = xml.GetElementValueInt("ArmorSlash");
		this.ArmorExotic = xml.GetElementValueInt("ArmorExotic");

		this.PoofIn = xml.GetElementValue("PoofIn", this.PoofIn);
		this.PoofOut = xml.GetElementValue("PoofOut", this.PoofOut);
		this.Prompt = xml.GetElementValue("Prompt", this.Prompt);

		this.ShapeFocusMajor = xml.GetElementValue("ShapeFocusMajor", "None");
		this.ShapeFocusMinor = xml.GetElementValue("ShapeFocusMinor", "None");

		var guild = xml.GetElementValue( "Guild", "");
		if(!guild.ISEMPTY() && !(this.Guild = GuildData.Lookup(guild, false)))
			console.log(`Guild ${guild} not found`);
		
		Utility.ParseFlags(this.Flags, xml.GetElementValue("Flags"));

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
					Utility.ParseFlags(learnedas, sp.GetAttributeValue("LearnedAs", "Skill Spell Song Supplication"));
					this.Learned[name] = {Name: name, Percent: percent, Level: level, LearnedAs: learnedas};
				}
			}
		}
		
		this.RoomVNum = xml.GetElementValueInt("Room");
		

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
	} // End Load

	Element(parentelement) {
		var builder = require('xmlbuilder');
		if(!parentelement) parentelement = builder.create("PlayerData");
		else parentelement = parentelement.ele("Character");
		if(this.IsNPC) {
			parentelement.ele("VNum", this.VNum);
		}
		parentelement.ele("Name", this.Name);
		parentelement.ele("ScrollCount", this.ScrollCount);
		parentelement.ele("Description", this.Description);
		parentelement.ele("ShortDescription", this.ShortDescription);
		parentelement.ele("LongDescription", this.LongDescription);

		parentelement.ele("Room", parseInt((this.Room? this.Room.VNum : 3700)));
		parentelement.ele("Race", (this.Race? this.Race.Name : "human"));
		parentelement.ele("Guild", (this.Guild? this.Guild.Name : ""));
		parentelement.ele("Alignment", this.Alignment);
		parentelement.ele("Ethos", this.Ethos);
		parentelement.ele("Sex", this.Sex);
		parentelement.ele("Level", this.Level);
		parentelement.ele("HitPoints", this.HitPoints);
		parentelement.ele("MaxHitPoints", this.MaxHitPoints);
		parentelement.ele("ManaPoints", this.ManaPoints);
		parentelement.ele("MaxManaPoints", this.MaxManaPoints);
		parentelement.ele("MovementPoints", this.MovementPoints);
		parentelement.ele("MaxMovementPoints", this.MaxMovementPoints);

		parentelement.ele("DamRoll", this.DamageRoll);
		parentelement.ele("HitRoll", this.HitRoll);
		parentelement.ele("ArmorClass", this.ArmorClass);
		parentelement.ele("Silver", this.Silver);
		parentelement.ele("Gold", this.Gold);

		parentelement.ele("Wimpy", this.Wimpy);

		if(this.ShapeFocusMajor)
		parentelement.ele("ShapeFocusMajor", this.ShapeFocusMajor);
		if(this.ShapeFocusMinor)
		parentelement.ele("ShapeFocusMinor", this.ShapeFocusMinor);

		parentelement.ele("SavingThrow", this.SavingThrow);

		parentelement.ele("AffectedBy", Utility.JoinFlags(this.AffectedBy));
		
		if(!this.Prompt.ISEMPTY()) {
			parentelement.ele("Prompt", this.Prompt);
		}

		var stats = parentelement.ele("PermanentStats");
		stats.ele("Strength", this.PermanentStats[0]);
		stats.ele("Wisdom", this.PermanentStats[1]);
		stats.ele("Intelligence", this.PermanentStats[2]);
		stats.ele("Dexterity", this.PermanentStats[3]);
		stats.ele("Constitution", this.PermanentStats[4]);
		stats.ele("Charisma", this.PermanentStats[5]);
		stats = parentelement.ele("ModifiedStats");
		stats.ele("Strength", this.ModifiedStats[0]);
		stats.ele("Wisdom", this.ModifiedStats[1]);
		stats.ele("Intelligence", this.ModifiedStats[2]);
		stats.ele("Dexterity", this.ModifiedStats[3]);
		stats.ele("Constitution", this.ModifiedStats[4]);
		stats.ele("Charisma", this.ModifiedStats[5]);

		var learnedele = parentelement.ele("Learned");
		for(var skillname in this.Learned) {
			var learned = this.Learned[skillname];
			var skillele = learnedele.ele("SkillSpell");
			skillele.attribute("Name", learned.Name);
			skillele.attribute("Value", learned.Percent);
			skillele.attribute("Level", learned.Level);
			skillele.attribute("LearnedAs", Utility.JoinFlags(learned.LearnedAs));
		}
		parentelement.ele("ArmorBash", this.ArmorBash);
		parentelement.ele("ArmorSlash", this.ArmorSlash);
		parentelement.ele("ArmorPierce", this.ArmorPierce);
		parentelement.ele("ArmorExotic", this.ArmorExotic);
		if(!this.PoofIn.ISEMPTY()) {
			parentelement.ele("PoofIn", this.PoofIn);
		}
		if(!this.PoofOut.ISEMPTY()) {
			parentelement.ele("PoofOut", this.PoofOut);
		}

		parentelement.ele("Flags", Utility.JoinFlags(this.Flags));

		if(this.Affects && this.Affects.length > 0) {
			var affectselement = parentelement.ele("Affects");
			for(var affect of this.Affects) {
				affect.Element(affectselement);
			}
		}

		var inventory = parentelement.ele("Inventory")
		for(var i = 0; i < this.Inventory.length; i++) {
			if(this.Inventory[i].VNum == 0 || !this.Inventory[i] || !this.Inventory[i].Template) continue;
			this.Inventory[i].Element(inventory);
		}
		
		var equipment = parentelement.ele("Equipment")
		for(var key in this.Equipment) {
			if(this.Equipment[key]) {
				if(this.Equipment[key].VNum == 0 || !this.Equipment[key] || !this.Equipment[key].Template) continue;
				var slot = equipment.ele("Slot").attribute("SlotID", key);
				this.Equipment[key].Element(slot);
			}
		}
		return parentelement;
	}

	GetCharacterList(list, args, count = 0) {
		if(Utility.Compare(args, "self")) return [player, ++count, ""];
		var [desiredcount, args] = Utility.NumberArgument(args);
		
		for(var key in list) {
			var ch = list[key];
			if((ch.IsNPC || ch.status == "Playing")) {
				if(ch.Form && this.CanSee(ch) && ((desiredcount && desiredcount > 0 && args.ISEMPTY()) || Utility.IsName(ch.Form.Name, args)) && ++count >= desiredcount) {
					return [ch, count, key];
				} else if((!ch.Form || this.IsImmortal) && this.CanSee(ch) && ((desiredcount && desiredcount > 0 && args.ISEMPTY()) || Utility.IsName(ch.Name, args)) && ++count >= desiredcount)
					return [ch, count, key];
			}
		}
		return [null, count, ""];
	}
	
	GetCharacterHere(args, count = 0) {
		var results = this.GetCharacterList(this.Room.Characters, args, count);
	
		return results;
	}

	GetCharacterWorld(args, count = 0) {
		var results = this.GetCharacterHere(args, count);
		
		if(results[0]) return results;

		var results = this.GetCharacterList(Character.Characters, args, count);
	
		return results;
	}

	StripCamouflage(creep = false)
	{
		if (this.AffectedBy.ISSET(AffectData.AffectFlags.Camouflage))
		{
			var aff;
			while ((aff = FindAffect(AffectData.AffectFlags.Camouflage))) {
				AffectFromChar(aff, AffectData.AffectRemoveReason.WoreOff);
			}
			this.AffectedBy.RemoveFlag(AffectData.AffectFlags.Camouflage);

			if (creep)
			{
				this.Act("You try to creep but step out of your cover.", null, null, null, Character.ctType.ToChar);
				this.Act("$n tries to creep but steps out of $s cover.", null, null, null, Character.ActType.ToRoom);
			}
			else
			{
				this.Act("You step out of your cover.", null, null, null, Character.ActType.ToChar);
				this.Act("$n steps out of $s cover.", null, null, null, Character.ActType.ToRoom);
			}
		}
	}

	StripHidden()
	{
		if (this.AffectedBy.ISSET(AffectData.AffectFlags.Hide))
		{
			var affects = this.FindAffects(AffectData.AffectFlags.Hide);

			if (!affects.some(aff => !aff.EndMessage.ISEMPTY()))
			{
				this.Act("You step out of the shadows.", null, null, null, Character.ActType.ToChar);
				this.Act("$n steps out of the shadows.", null, null, null, Character.ActType.ToRoom);
			}

			for (var aff of affects) {
				this.AffectFromChar(aff, AffectData.AffectRemoveReason.WoreOff);
			}
			this.AffectedBy.RemoveFlag(AffectData.AffectFlags.Hide);
		}
	}


	StripInvis()
	{
		if (this.AffectedBy.ISSET(AffectData.AffectFlags.Invisible))
		{
			var affects = this.FindAffects(AffectData.AffectFlags.Invisible);

			if (!affects.some(aff => !aff.EndMessage.ISEMPTY()))
			{
				this.Act("You fade into existence.", null, null, null, Character.ActType.ToChar);
				this.Act("$n fades into existence.", null, null, null, Character.ActType.ToRoom);
			}

			for (var aff of affects) {
				this.AffectFromChar(aff, AffectData.AffectRemoveReason.WoreOff);
			}
			this.AffectedBy.RemoveFlag(AffectData.AffectFlags.Invisible);

		}
	}

	StripSneak()
	{
		if (this.Race && this.Race.Aff.ISSET(AffectData.AffectFlags.Sneak))
			return;

		if (this.AffectedBy.ISSET(AffectData.AffectFlags.Sneak))
		{
			var aff;
			while ((aff = this.FindAffect(AffectData.AffectFlags.Sneak))) {
				this.AffectFromChar(aff, AffectData.AffectRemoveReason.WoreOff);
			}
			this.AffectedBy.RemoveFlag(AffectData.AffectFlags.Sneak);
			this.Act("You trample around loudly.", null, null, null, Character.ActType.ToChar);
		}
	}

	DisplayPrompt()
	{
		if (this.EditingArea)
		{
			this.send("\nEditing Area {0} - {1} - {2}", this.EditingArea.Name, this.EditingArea.VNumStart, this.EditingArea.VNumEnd);
		}
		if (this.EditingRoom)
		{
			this.send("\nEditing room \\y{0}\\x - \\Y{1}\\x", this.EditingRoom.VNum, this.EditingRoom.Name.ISEMPTY() ? "no name" : this.EditingRoom.Name);
		}
		if (this.EditingNPCTemplate)
		{
			this.send("\nEditing npc {0} - {1}", this.EditingNPCTemplate.VNum, this.EditingNPCTemplate.Name.ISEMPTY() ? "no name" : this.EditingNPCTemplate.Name);
		}
		if (this.EditingItemTemplate)
		{
			this.send("\nEditing item {0} - {1}", this.EditingItemTemplate.VNum, this.EditingItemTemplate.Name.ISEMPTY() ? "no name" : this.EditingItemTemplate.Name);
		}
		if (this.EditingHelp)
		{
			this.send("\nEditing help {0} - {1}", this.EditingHelp.VNum, this.EditingHelp.Keyword);
		}
		if (this.Prompt.ISEMPTY())
			this.send("\n" + this.FormatPrompt("<%1%%h %2%%m %3%%mv %W> "));
		else
			this.send("\n" + this.FormatPrompt(this.Prompt));
	}

	FormatPrompt(prompt)
	{
		const ExitData = require("./ExitData");
		const WeatherInfo = require("./WeatherInfo");
		const TimeInfo = require("./TimeInfo");

		var buf = "";
		var i = 0;
		while (i < prompt.length)
		{
			if (prompt[i] != '%')
			{
				buf += (prompt[i++]);
				continue;
			}
			++i;
			switch (prompt[i])
			{
				default:
					buf += ' ';
					break;
				case '1':
					buf += Utility.Format("{0}{1}\\x",
						this.HitPoints < (this.MaxHitPoints * 4) / 10 ?
						this.HitPoints < (this.MaxHitPoints * 2) / 10 ? "\\R" : "\\Y" : "\\G",
						(this.HitPoints / this.MaxHitPoints * 100).toFixed(2));
					break;
				case '2':
					buf += Utility.Format("{0}{1}\\x",
						this.ManaPoints < (this.MaxManaPoints * 4) / 10 ?
						this.ManaPoints < (this.MaxManaPoints * 2) / 10 ? "\\R" : "\\Y" : "\\G",
						(this.ManaPoints / this.MaxManaPoints * 100).toFixed(2));
					break;
				case '3':
					buf += Utility.Format("{0}{1}\\x",
					this.MovementPoints < (this.MaxMovementPoints * 4) / 10 ?
					this.MovementPoints < (this.MaxMovementPoints * 2) / 10 ? "\\R" : "\\Y" : "\\G",
					(this.MovementPoints / this.MaxMovementPoints * 100).toFixed(2));
					break;
				case 'e':
					var found = false;
					if (!this.IsAffected(AffectData.AffectFlags.Blind))
					{
						for (var exit of this.Room.Exits.Select(e => e && e.Destination
						&& !e.Flags.ISSET(ExitData.ExitFlags.Hidden)
						&& (!e.Flags.ISSET(ExitData.ExitFlags.HiddenWhileClosed) || !e.Flags.ISSET(ExitData.ExitFlags.Closed))))
						{
							found = true;
							buf += exit.Direction[0].toUpperCase();
						}
					}

					if (!found)
						buf += "none";
					break;
				case 'c':
					buf += "\n\r";
					break;
				case 'h':

					buf += Utility.Format("{0}{1}\\x",
					this.HitPoints < (this.MaxHitPoints * 4) / 10 ?
					this.HitPoints < (this.MaxHitPoints * 2) / 10 ? "\\R" : "\\Y" : "\\G",
					this.HitPoints.toFixed(2));
					break;

				case 'H':
					buf += (this.MaxHitPoints);
					break;
				case 'm':
					buf += Utility.Format("{0}{1}\\x",
					this.ManaPoints < (this.MaxManaPoints * 4) / 10 ?
					this.ManaPoints < (this.MaxManaPoints * 2) / 10 ? "\\R" : "\\Y" : "\\G",
					this.ManaPoints.toFixed(2));
					break;
				case 'M':
					buf += (this.MaxManaPoints);
					break;
				case 'v':
					buf += Utility.Format("{0}{1}\\x",
					this.MovementPoints < (this.MaxMovementPoints * 4) / 10 ?
					this.MovementPoints < (this.MaxMovementPoints * 2) / 10 ? "\\R" : "\\Y" : "\\G",
					this.MovementPoints.toFixed(2));
					break;
				case 'V':
					buf += (this.MaxMovementPoints.toFixed(2));
					break;
				case 'x':
					var xpsofar = this.XpTotal - this.CalculateXpToLevel(this.Level - 1) * (this.Level - 1);
					buf += xpsofar.toFixed(2);
					break;
				case 'X':
					buf += (this.XpToLevel * (this.Level) - this.CalculateXpToLevel(this.Level - 1) * (this.Level - 1)).toFixed(2);
					break;
				case 'g':
					buf += (this.Gold);
					break;
				case 's':
					buf += (this.Silver);
					break;
				case 'a':
					buf += (this.Alignment.toLowerCase());
					break;
				case 'r':
					if (this.Room != null)
						buf += 
						this.Flags.ISSET(Character.ActFlags.HolyLight) ||
						(!this.IsAffected(AffectData.AffectFlags.Blind) && !this.Room.IsDark)
						? (TimeInfo.IsNight && !this.Room.NightName.ISEMPTY() ? this.Room.NightName : this.Room.Name) : "darkness";
					else
						buf += (' ');
					break;
				case 'R':
					if (this.IsImmortal && this.Room != null)
						buf += (this.Room.VNum);
					else
						buf += (' ');
					break;
				case 'z':
					if (this.IsImmortal && this.Room != null)
						buf += (this.Room.Area.Name);
					else
						buf += (' ');
					break;
				case 'Z':
					buf += (this.Flags.ISSET(Character.ActFlags.HolyLight) ? " HOLYLIGHT" : "");
					break;
				case '%':
					buf += ("%");
					break;

				case 't':
					buf += new Date().toString();
					break;
				case 'T':
					buf += ((TimeInfo.Hour % 12 == 0 ? 12 : TimeInfo.Hour % 12) + (TimeInfo.Hour > 12 ? "PM" : "AM"));
					break;
				case 'w':
					{
						var sky_look = [
							"cloudless",
							"cloudy",
							"rainy",
							"stormy"
						];

						buf += (sky_look[WeatherInfo.Sky]);

						break;
					}
				case 'P':
					buf += (this.Position.toLowerCase());
					break;
				case 'W':
					buf += Utility.Format("{0} {1}",
						this.Room != null ? (!this.Room.IsWilderness ? "\\wcivilized\\x" : "\\Gwilderness\\x") : "",
						this.Room != null ? RoomData.Sectors[this.Room.Sector].Display : ""
						);
					break;
				case 'I':
					buf += (this.Room.Sector == RoomData.SectorTypes.Inside || this.Room.Flags.ISSET(RoomData.RoomFlags.Indoors) ? "\\windoors\\x" : "\\coutdoors\\x");
					break;
			}
			i++;
		}
		return buf;
	} // end FormatPrompt

	CheckEnhancedDamage(damage)
	{
		// Retrieve the "enhanced damage" skill
		var enhancedDamageSkill = SkillSpell.SkillLookup("enhanced damage");

		var skillLevel = 0;
		var diceroll = 0;

		// Check if the character has the enhanced damage skill and a skill level greater than 1
		if (damage > 0 && enhancedDamageSkill != null && (skillLevel = this.GetSkillPercentage(enhancedDamageSkill)) > 1)
		{
			// Roll a random diceroll value
			if (skillLevel > (diceroll = Utility.NumberPercent()))
			{
				// The character successfully performed enhanced damage
				this.CheckImprove(enhancedDamageSkill, true, 1);

				// Increase the damage by a percentage of the original damage based on the diceroll value
				damage += (damage * diceroll / 50);

				// Check for "enhanced damage II" skill
				if ((skillLevel = this.GetSkillPercentage("enhanced damage II")) > 1 && skillLevel > (diceroll = Utility.NumberPercent()))
				{
					// The character successfully performed enhanced damage II
					damage += (damage * diceroll / 50);
					this.CheckImprove("enhanced damage II", true, 1);
				}
				else if (skillLevel > 1)
				{
					// The character failed to perform enhanced damage II
					this.CheckImprove("enhanced damage II", false, 1);
				}
			}
			else
			{
				// The character failed to perform enhanced damage
				this.CheckImprove(enhancedDamageSkill, false, 1);
			}

			//return damage;
		}

		return damage;
	} // End check enhanced damage

	GetEquipment(slot) {
		return this.Equipment[slot];
	}

	CheckSocials(command, args, exactmatch = false) {
		const Socials = require("./Socials");
		for(var socialkey in Socials.Socials) {
			var social = Socials.Socials[socialkey];
			if((exactmatch && social.Name.equals(command)) || (!exactmatch && social.Name.prefix(command))) {
				switch (this.Position)
				{
					// Check the character's position against certain positions that restrict social commands
					case "Dead":
						this.send("Lie still; you are DEAD.\n\r");
						return true;
					case "Mortal":
					case "Incapacitated":
						this.send("You are hurt far too bad for that.\n\r");
						return true;
					case "Stunned":
						this.send("You are too stunned to do that.\n\r");
						return true;
					case "Sleeping":
						if (social.Name == "snore")
							break; // Continue executing the social command
							this.send("In your dreams or what?\n\r");
						return true;
				}

				var [victim] = this.GetCharacterHere(args)
				if (Utility.IsNullOrEmpty(args) && !Utility.IsNullOrEmpty(social.OthersNoArg) && !Utility.IsNullOrEmpty(social.CharNoArg))
				{
					// Perform the social command actions without any arguments
					this.Act(social.OthersNoArg, null, null, null, Character.ActType.ToRoom);
					this.Act(social.CharNoArg, null, null, null, Character.ActType.ToChar);
				}
				else if (Utility.IsNullOrEmpty(args) || !victim)
				{
					// The victim is not found in the room
					this.send("They aren't here.\n\r");
				}
				else if (victim == this)
				{
					// Perform the social command actions targeting oneself
					this.Act(social.OthersAuto, victim, null, null, Character.ActType.ToRoom);
					this.Act(social.CharAuto, victim, null, null, Character.ActType.ToChar);
				}
				else
				{
					if (!Utility.IsNullOrEmpty(social.OthersFound))
					{
						// Perform the social command actions with a specific victim found message
						this.Act(social.OthersFound, victim, null, null, Character.ActType.ToRoomNotVictim);
					}
					else
					{
						// Perform the social command actions without a specific victim found message
						this.Act(social.OthersNoArg, null, null, null, Character.ActType.ToRoomNotVictim);
					}

					if (!Utility.IsNullOrEmpty(social.CharFound))
					{
						// Perform the social command actions with a specific character found message
						this.Act(social.CharFound, victim, null, null, Character.ActType.ToChar);
					}
					else
					{
						// Perform the social command actions without a specific character found message
						this.Act(social.CharNoArg, null, null, null, Character.ActType.ToChar);
					}

					if (!Utility.IsNullOrEmpty(social.VictimFound) && victim.Position != "Sleeping")
					{
						// Perform the social command actions with a specific victim found message if the victim is not sleeping
						this.Act(social.VictimFound, victim, null, null, Character.ActType.ToVictim);
					}

					if (!Utility.IsNullOrEmpty(social.OthersFound) && !Utility.IsNullOrEmpty(social.CharFound) && !this.IsNPC && victim.IsNPC && victim.IsAwake)
					{
						// Perform additional social command actions when the character is not an NPC, the victim is an NPC and awake
						switch (Utility.Random(0, 12))
						{
							case 0:
							case 1:
							case 2:
							case 3:
							case 4:
							case 5:
							case 6:
							case 7:
							case 8:
								victim.Act(social.OthersFound, this, null, null, Character.ActType.ToRoomNotVictim);
								victim.Act(social.CharFound, this, null, null, Character.ActType.ToChar);
								victim.Act(social.VictimFound, this, null, null, Character.ActType.ToVictim);
								break;

							case 9:
							case 10:
							case 11:
							case 12:
								victim.Act("$n slaps $N.", this, null, null, Character.ActType.ToRoomNotVictim);
								victim.Act("You slap $N.", this, null, null, Character.ActType.ToChar);
								victim.Act("$n slaps you.", this, null, null, Character.ActType.ToVictim);
								break;
						}
					}
				}
				return true;
			}
		}
		return false;
	}

	DoCommand(command, args) {
		this.SittingAtPrompt = false;
		const Commands = require("./Commands");
		//const Player = require("./Player");
		
		if(this.CheckSocials(command, args, true))
			return;
		for(var key in Commands) {
			var Command = Commands[key];
			if(Utility.Prefix(key, command) && (!Command.Skill || this.GetSkillPercentage(Command.Skill.Name) > 1)) {
				this.LastActivity = new Date();
				this.SittingAtPrompt = false;
				if (Character.Positions.indexOf(this.Position) < Character.Positions.indexOf(Commands[key].MinimumPosition))
				{
					// Send an appropriate message based on the character's position
					switch (this.Position)
					{
						case "Dead":
							this.send("Lie still; you are DEAD.\n\r");
							break;
						case "Mortal":
						case "Incapacitated":
							this.send("You are hurt far too bad for that.\n\r");
							break;
						case "Stunned":
							this.send("You are too stunned to do that.\n\r");
							break;
						case "Sleeping":
							this.send("In your dreams or what?\n\r");
							break;
						case "Resting":
							this.send("Nah... You feel too relaxed...\n\r");
							break;
						case "Sitting":
							this.send("Better stand up first.\n\r");
							break;
						case "Fighting":
							this.send("No way! You are still fighting!\n\r");
							break;
					}
					return;
				}

				Command.Command(this, args);
				if(this.status != "Playing")
					this.SetStatus(this.status);
				
				
				return;
			}
		} // end for commands

		if(this.CheckSocials(command, args, false)) return;
		
		this.send("Huh?\n\r");

	}

	LearnSkill(skill, percentage, Level = 60)
	{
		var learned;
		if (skill == null) return;
		if (!(learned = this.Learned[skill]))
		{
			if (Level == 60 && this.Guild && skill.LearnedLevel[this.Guild.Name])
				Level = skill.LearnedLevel[this.Guild.Name];
			var learnastype = {};
			if(skill.SkillTypes["Skill"]) learnastype = {Skill: true};
			else if(skill.SkillTypes["Supplication"] && this.Guild.CastType == "Commune") learnastype = {Supplication: true};
			else if(skill.SkillTypes["Spell"] && this.Guild.CastType == "Cast") learnastype = {Spell: true};
			else if(skill.SkillTypes["Song"] && this.Guild.CastType == "Sing") learnastype = {Song: true};

			this.Learned[skill.Name] = { Name: skill.Name, Percent: percentage, Level: Level, LearnedAs: learnastype };
			
		}
		else
		{
			if (Level == 60 && this.Guild && skill.LearnedLevel[Guild.Name])
				Level = skill.LearnedLevel[this.Guild.Name];
			if (learned.Level == 0 || Level < learned.Level)
				learned.Level = Level;
			learned.Percent = percentage;
		}
	}

	HasBuilderPermission(item) {
		const Game = require('./Game');
		if(!item) return false;
		var area = item instanceof AreaData? item : item.Area;

		return (area && area.Builders && area.Builders.IsName(this.Name, true)) || (this.Level == Game.MAX_LEVEL && !this.IsNPC)
	}

	GetExtraDescription(keywords = "", count = 0) {
		var [number, keyword] = Utility.NumberArgument(keywords);
		
		for(var ed of this.Room.ExtraDescriptions) {
			if(ed.Keyword.IsName(keyword) && ++count >= number) {
				return [ed, count];
			}
		}

		for(var item of this.Inventory) {
			if(this.CanSee(item)) {
				for(var ed of item.ExtraDescriptions) {
					if(ed.Keyword.IsName(keyword) && ++count >= number) {
						return [ed, count];
					}
				}		
			}
		}

		for(var slot in this.Equipment) {
			var item = this.Equipment[slot];
			if(this.CanSee(item)) {
				for(var ed of item.ExtraDescriptions) {
					if(ed.Keyword.IsName(keyword) && ++count >= number) {
						return [ed, count];
					}
				}		
			}
		}

		return [null, count];
	}

	get GetDamageRoll() {
		if(this.Form) {
			var result = this.Form.DamageRoll;
			for(var aff of this.Affects) {
				if(aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.DamageRoll) {
					result += aff.Modifier;
				}
			}
			return result;
		} else {
			return this.DamageRoll;
		}
	}

	get GetHitRoll() {
		if(this.Form) {
			var result = this.Form.HitRoll;
			for(var aff of this.Affects) {
				if(aff.Where == AffectData.AffectWhere.ToAffects && aff.Location == AffectData.ApplyTypes.Hitroll) {
					result += aff.Modifier;
				}
			}
			return result;
		} else {
			return this.HitRoll;
		}
	}
}

module.exports = Character;

ActInfo = require("./ActInfo");
ActMovement = require("./ActMovement");
ActItem = require("./ActItem");
ActWiz = require("./ActWiz");
ActCommunication = require("./ActCommunication");
Mapper = require("./Mapper");
WarriorSpecialization = require("./WarriorSpecialization");
WarriorSkills = require("./WarriorSkills");
RangerSkills = require("./RangerSkills");
PaladinSkills = require("./PaladinSkills");
AssassinSkills = require("./AssassinSkills");
ThiefSkills = require("./ThiefSkills");
FormSkills = require("./FormSkills");
BardSkills = require("./BardSkills");