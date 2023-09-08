const PhysicalStats = require("./PhysicalStats");
const Utility = require("./Utility");
const Character = require("./Character");
const ItemData = require("./ItemData");
const Combat = require("./Combat");
const SkillSpell = require("./SkillSpell");
const AffectData = require("./AffectData");
const DamageMessage = require("./DamageMessage");
const RoomData = require("./RoomData");

Character.DoCommands.DoAngelsWing = function(ch, args)
{
	var shield;
	var skill = SkillSpell.SkillLookup("angels wing");
	var chance;
	var dam;
	var level = ch.Level;
	var [victim] = ch.GetCharacterHere(args);

	var dam_each = [
		0,
		4,  5,  6,  7,  8,  10, 13, 15, 20, 25,
		30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
		58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
		65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
		73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
		90,110,120,150,170,200,230,500,500,500
	];
	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
	}
	else if (!(shield = ch.GetEquipment(ItemData.WearSlotIDs.Shield)))
	{
		ch.send("You must be holding a shield to perform this maneuver.\n\r");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
	}
	else if ((!args.ISEMPTY() && !victim) || (args.ISEMPTY() && (victim = ch.Fighting) == null))
	{
		ch.send("You don't see them here.\n\r");
	}
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);

		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.Length - 1);
		level = Math.max(0, level);

		dam = Utility.Random(dam_each[level], dam_each[level] * 2);

		ch.Act("You swing your shield outward and upward, then make a quick, powerful attack to $N.\n\r", victim, null, null, Character.ActType.ToChar);
		ch.Act("$n swings $s shield outward and upward, then makes a quick, powerful attack to $N.\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n swings $s shield outward and upward, then strikes you with a quick, powerful attack.\n\r", victim, null, null, Character.ActType.ToVictim);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);
	}
	else
	{
		ch.WaitState(skill.WaitTime);

		ch.Act("You swing your shield outward and upward, but fail to make a quick, powerful attack to $N.\n\r", victim, null, null, Character.ActType.ToChar);
		ch.Act("$n swings $s shield outward and upward, but fails to make a quick, powerful attack to $N.\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n swings $s shield outward and upward, but fails to strike you .\n\r", victim, null, null, Character.ActType.ToVictim);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
	}
	return;
}
Character.DoCommands.DoPalmSmash = function(ch, args)
{

	var dam_each = [
		0,
		4,  5,  6,  7,  8,  10, 13, 15, 20, 25,
		30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
		58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
		65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
		73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
		90,110,120,150,170,200,230,500,500,500
	];
	var skill = SkillSpell.SkillLookup("palm smash");
	var chance;
	if ((chance = ch.GetSkillPercentage(skill) + 10) <= 11)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}
	var weapon;
	if (!(weapon = ch.GetEquipment(ItemData.WearSlotIDs.Wield)))
	{
		ch.send("You must be bare-handed to perform this maneuver.\n\r");
		return;
	}
	var dam;
	var level = ch.Level;
	var [victim] = ch.GetCharacterHere(args);

	if (args.ISEMPTY() && ch.Fighting == null)
	{
		ch.send("Who did you want to palm smash?\n\r");
		return;
	}
	else if ((!args.ISEMPTY() && !victim) || (args.ISEMPTY() && (victim = ch.Fighting) == null))
	{
		ch.send("There is no one here to palm smash.\n\r");
		return;
	}

	chance += level / 10;

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.Length - 1);
		level = Math.max(0, level);

		dam = Utility.Random(dam_each[level] * 2, dam_each[level] * 3);

		ch.Act("You smash the palm of your hand forward, making a quick, powerful attack to $N.\n\r", victim, null, null, Character.ActType.ToChar);
		ch.Act("$n smashes $s palm forward, quickly stricking $N.\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n smashes $s palm forward, quickly stricking you with a powerful attack.\n\r", victim, null, null, Character.ActType.ToVictim);

		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);
		victim.WaitState(Game.PULSE_VIOLENCE * 1);
		ch.CheckImprove(skill, true, 1);
		Combat.CheckCheapShotRoom(victim);
	}
	else
	{
		ch.Act("You try to smash $N with the palm of your hand but miss.\n\r", victim, null, null, Character.ActType.ToChar);
		ch.Act("$n tries to smash $N with $s palm but misses.\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to smash you with $s palm, but misses.\n\r", victim, null, null, Character.ActType.ToVictim);
		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
	}
	return;
}
Character.DoCommands.DoHandFlurry = function(ch, args)
{
	var dam_each = [
		0,
		4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
		30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
		58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
		65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
		73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
		90,110,120,150,170,200,230,500,500,500
    ];

	var victim;
	var skill = SkillSpell.SkillLookup("hand flurry");

	var chance = 0, numhits = 0, i = 0, dam = 0;
	var learned = 0;

	if ((learned = ch.GetSkillPercentage(skill) + 20) <= 11)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}
	var weapon;
	if (!(weapon = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) ||
		!(weapon = ch.GetEquipment(ItemData.WearSlotIDs.Shield)) ||
		!(weapon = ch.GetEquipment(ItemData.WearSlotIDs.Held)) ||
		!(weapon = ch.GetEquipment(ItemData.WearSlotIDs.DualWield)))
	{
		ch.send("You must be bare-handed to perform this maneuver.\n\r");
		return;
	}

	if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	chance = Utility.NumberPercent();

	if (chance > learned)
	{
		ch.Act("You attempt to start a hand flurry, but fail.", victim, null, null, Character.ActType.ToChar);
		ch.Act("$n flails out wildly with $s hands but blunders.", null, null, null, Character.ActType.ToRoom);
		ch.CheckImprove(skill, false, 2);
		ch.WaitState(skill.WaitTime / 2);
		return;
	}

	if ((chance + learned) > 165)
	{
		numhits = 7;
	}
	else if ((chance + learned) > 155)
	{
		numhits = 6;
	}
	else if ((chance + learned) > 145)
	{
		numhits = 5;
	}
	else if ((chance + learned) > 135)
	{
		numhits = 4;
	}
	else if ((chance + learned) > 115)
	{
		numhits = 3;
	}
	else
	{
		numhits = 2;
	}
	ch.Act("You begin a wild flurry of attacks with your palms!", victim, null, null, Character.ActType.ToChar);
	ch.Act("$n begins a wild flurry of attacks with $s palms!", null, null, null, Character.ActType.ToRoom);
	ch.CheckImprove(skill, true, 1);

	var level = ch.Level;

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.Length - 1);
	level = Math.max(0, level);

	for (i = 0; i < numhits; i++)
	{
		dam = Utility.Random(dam_each[level] + 10, dam_each[level] * 2 + 10);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);

		if (ch.Fighting != victim)
			break;
	}

	ch.WaitState(skill.WaitTime);

	return;
}
Character.DoCommands.DoMaceFlurry = function(ch, args)
{
	var dam_each = [
		0,
		4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
		30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
		58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
		65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
		73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
		90,110,120,150,170,200,230,500,500,500
    ];

	var victim;
	var skill = SkillSpell.SkillLookup("mace flurry");
	var wield = null;
	var chance = 0, numhits = 0, i = 0, dam = 0;
	var learned = 0;

	if ((learned = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}
	if (!(wield = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) || (wield.WeaponType != ItemData.WeaponTypes.Mace))
	{
		ch.send("You must be wielding a mace to do this.");
		return;
	}

	if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	chance = Utility.NumberPercent();

	if (chance > learned)
	{
		ch.Act("You attempt to do something fancy with your mace, but fail.", victim, null, null, Character.ActType.ToChar);
		ch.Act("$n flails out wildly with $s mace but blunders.", null, null, null, Character.ActType.ToRoom);
		ch.CheckImprove(skill, false, 2);
		ch.WaitState(skill.WaitTime / 2);
		return;
	}

	if ((chance + learned) > 158)
	{
		numhits = 5;
	}
	else if ((chance + learned) > 148)
	{
		numhits = 4;
	}
	else if ((chance + learned) > 140)
	{
		numhits = 3;
	}
	else
	{
		numhits = 2;
	}
	ch.Act("You begin a wild flurry of attacks with your mace!", victim, null, null, Character.ActType.ToChar);
	ch.Act("$n begins a wild flurry of attacks with $s mace!", null, null, null, Character.ActType.ToRoom);
	ch.CheckImprove(skill, true, 1);

	var level = ch.Level;

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.Length - 1);
	level = Math.max(0, level);

	for (i = 0; i < numhits; i++)
	{
		var roll = Utility.Roll(wield.DamageDice);

		dam = Utility.Random(dam_each[level] + roll, dam_each[level] * 2 + roll);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);

		if (ch.Fighting != victim)
			break;
	}

	ch.WaitState(skill.WaitTime);

	return;
}
Character.DoCommands.DoLanceCharge = function(ch, args)
{

	var dam_each = [
		 0,
		5,  6,  7,  8,  9,  11,  14,  16,  21,  26,
		31, 36, 41, 46, 51, 56, 56, 56, 57, 58,
		59, 59, 60, 61, 62, 62, 63, 64, 65, 65,
		66, 67, 68, 68, 69, 70, 71, 71, 72, 73,
		74, 74, 75, 76, 77, 77, 78, 79, 80, 80,
		95, 115, 125, 155, 175, 210, 240, 550, 550, 550
	];
	var skill = SkillSpell.SkillLookup("lance charge");
	var chance;
	var dam;
	var level = ch.Level;
	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	else if (!(wield = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) || (wield.WeaponType != ItemData.WeaponTypes.Spear && wield.WeaponType != ItemData.WeaponTypes.Polearm))
	{
		ch.send("You must be wielding a spear or polearm to lance charge your enemy.\n\r");
		return;
	}
	

	if (ch.Position == "Fighting")
	{
		ch.send("You're too busy fighting already!\n\r");
		return;
	}
	
	var [victim] = ch.GetCharacterHere(args);
	
	if (!args.ISEMPTY() && !vicitm)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);

	if (Combat.CheckPreventSurpriseAttacks(ch, victim)) return;

	if (chance > Utility.NumberPercent())
	{
		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.Length - 1);
		level = Math.max(0, level);


		ch.Act("$n lance charges $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n lance charges you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You lance charge $N.", victim, null, null, Character.ActType.ToChar);

		dam = Utility.Random(dam_each[level] * 4, dam_each[level] * 6);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

	}
	else
	{
		ch.Act("$n tries to lance charge $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to lance charge you but fails!", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to lance charge $N but fail.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}
Character.DoCommands.DoSabreCharge = function(ch, args)
{

	var dam_each = [
		 0,
		5,  6,  7,  8,  9,  11,  14,  16,  21,  26,
		31, 36, 41, 46, 51, 56, 56, 56, 57, 58,
		59, 59, 60, 61, 62, 62, 63, 64, 65, 65,
		66, 67, 68, 68, 69, 70, 71, 71, 72, 73,
		74, 74, 75, 76, 77, 77, 78, 79, 80, 80,
		95, 115, 125, 155, 175, 210, 240, 550, 550, 550
	];
	var skill = SkillSpell.SkillLookup("sabre charge");
	var chance;
	var dam;
	var level = ch.Level;
	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}
	var [victim] = ch.GetCharacterHere(args);
	
	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	if (!(wield = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) || wield.WeaponType != ItemData.WeaponTypes.Sword)
	{
		ch.send("You must be wielding a sword to sabre charge your enemy.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);

	if (Combat.CheckPreventSurpriseAttacks(ch, victim)) return;

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.Length - 1);
	level = Math.max(0, level);

	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n performs a sabre charge against $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n performs a sabre charge against you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You perform a sabre charge against $N.", victim, null, null, Character.ActType.ToChar);
		ch.CheckImprove(skill, true, 1);

		var roll = Utility.Roll(wield.DamageDice);

		dam = Utility.Random(dam_each[level] * 2 + roll, dam_each[level] * 3 + roll);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Acid);
	}
	else
	{
		ch.Act("$n attempts to perform a sabre charge against $N, but fails.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n attempts to perform a sabre charge against you, but fails.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You attempt to perform a sabre charge against $N, but fail.", victim, null, null, Character.ActType.ToChar);
		ch.CheckImprove(skill, false, 1);

		dam = 0;
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Acid);
	}

}
Character.DoCommands.DoCrushingCharge = function(ch, args)
{

	var dam_each = [
		0,
		5,  6,  7,  8,  9,  11,  14,  16,  21,  26,
		31, 36, 41, 46, 51, 56, 56, 56, 57, 58,
		59, 59, 60, 61, 62, 62, 63, 64, 65, 65,
		66, 67, 68, 68, 69, 70, 71, 71, 72, 73,
		74, 74, 75, 76, 77, 77, 78, 79, 80, 80,
		95, 115, 125, 155, 175, 210, 240, 550, 550, 550
	];
	var skill = SkillSpell.SkillLookup("crushing charge");
	var chance;
	var dam;
	var level = ch.Level;
	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}
	var [victim] = ch.GetCharacterHere(args);

	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	if (!(wield = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) || wield.WeaponType != ItemData.WeaponTypes.Mace)
	{
		ch.send("You must be wielding a mace to crush charge your enemy.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);

	if (Combat.CheckPreventSurpriseAttacks(ch, victim)) return;

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.Length - 1);
	level = Math.max(0, level);

	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n performs a crushing charge against $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n performs a crushing charge against you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You perform a crushing charge against $N.", victim, null, null, Character.ActType.ToChar);
		ch.CheckImprove(skill, true, 1);

		dam = Utility.Random(dam_each[level] * 2, dam_each[level] * 3);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Acid);
	}
	else
	{
		ch.Act("$n attempts to perform a crushing charge against $N, but fails.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n attempts to perform a crushing charge against you, but fails.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You attempt to perform a crushing charge against $N, but fail.", victim, null, null, Character.ActType.ToChar);
		ch.CheckImprove(skill, false, 1);

		dam = 0;
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Acid);
	}
}

Character.DoCommands.DoHeadSmash = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("head smash");
	var chance;
	var dam;
	var level = ch.Level;
	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if ((wield = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) == null || (wield.WeaponType != ItemData.WeaponTypes.Staff && wield.WeaponType != ItemData.WeaponTypes.Polearm))
	{
		ch.send("You must be wielding a staff or polearm to head smash your enemy.");
		return;
	}

	var [victim] = ch.GetCharacterHere(args);

	if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n feints an attack at $N, creating an opportunity to smash $S head in.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n feints an attack at you, creating an opportunity to smash your head in.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You feint an attack at $N, then take the opportunity to smash $S head in.", victim, null, null, Character.ActType.ToChar);

		dam = (Utility.Roll(wield.DamageDice) + ch.DamageRoll) * 2;
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Smash);

		if (!victim.IsAffected(skill))
		{
			var affect = new AffectData();
			affect.SkillSpell = skill;
			affect.DisplayName = skill.name;
			affect.Duration = 5;
			affect.Where = AffectData.AffectWhere.ToAffects;
			affect.Location = AffectData.ApplyTypes.Strength;
			affect.Modifier = -6;
			victim.AffectToChar(affect);

			affect.Location = AffectData.ApplyTypes.Dexterity;
			affect.Modifier = -6;
			victim.AffectToChar(affect);

			affect.Location = AffectData.ApplyTypes.AC;
			affect.Modifier = +400;

			affect.EndMessage = "Your head feels better.";
			affect.EndMessageToRoom = "$n's head looks better.";
			victim.AffectToChar(affect);
		}
	}
	else
	{
		ch.Act("$n attempts to headsmash $N but fails to open a strike opportunity with $s feint.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to smash your head but failed to open a strike opportunity &s initial feint!", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to headsmash $N but your faint fails to open a strike opportunity.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Smash);
	}
	return;
}

Character.DoCommands.DoCrusaderStrike = function(ch, args)
{
    var weapon;
    var skill = SkillSpell.SkillLookup("crusader strike");
    var chance;
    var dam;
    var level = ch.Level;
    var victim = ch.GetCharacterHere(args);

    var dam_each = [
        0,
        4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
        30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
        58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
        65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
        73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
        90,110,120,150,170,200,230,500,500,500
    ];

    if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
    }
    else if (!(weapon = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) || !weapon.ExtraFlags.ISSET(ItemData.ExtraFlags.TwoHands))
    {
        ch.send("You must be wielding a two-handed weapon to crusader strike someone.\n\r");
    }
    else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
    {
        ch.send("You aren't fighting anyone.\n\r");
    }
    else if ((!args.ISEMPTY() && !victim))
    {
        ch.send("You don't see them here.\n\r");
    }
    else if (victim == ch)
    {
        ch.send("You can't crusaders strike yourself.\n\r");
    }

    else if (chance > Utility.NumberPercent())
    {
        ch.WaitState(skill.WaitTime);
        if (ch.IsNPC)
            level = Math.min(level, 51);
        level = Math.min(level, dam_each.Length - 1);
        level = Math.max(0, level);
        var roll = Utility.Roll(weapon.DamageDice);

        dam = Utility.Random(dam_each[level] * 2 + roll, dam_each[level] * 3 + roll);

        ch.CheckImprove(skill, true, 1);
        Combat.Damage(ch, victim, dam, skill, weapon.WeaponDamageType.Type);
    }
    else
    {
        ch.WaitState(skill.WaitTime);
        ch.CheckImprove(skill, false, 1);
        Combat.Damage(ch, victim, 0, skill, weapon.WeaponDamageType.Type);
    }
    return;
} // end crusader strike