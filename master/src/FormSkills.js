const PhysicalStats = require("./PhysicalStats");
const Utility = require("./Utility");
const Character = require("./Character");
const ItemData = require("./ItemData");
const Combat = require("./Combat");
const SkillSpell = require("./SkillSpell");
const AffectData = require("./AffectData");
const DamageMessage = require("./DamageMessage");
const RoomData = require("./RoomData");
const ShapeshiftForm = require("./Shapeshift");
const NPCTemplateData = require("./NPCTemplateData");

Character.DoCommands.DoBite = function(ch, args)
{
	var dam_each = [
		36,
		63,
		78,
		95
	];

	var dam;
	var [victim] = ch.GetCharacterHere(args);
	var skill = SkillSpell.SkillLookup("bite");
	var chance;

	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form == null)
	{
		ch.send("Only animals can bite someone.\n\r");
		return;
	}

	if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if ((!args.ISEMPTY() && !victim) || (args.ISEMPTY() && (victim = ch.Fighting) == null))
	{
		ch.send("You don't see them here.\n\r");
		return;
	}

	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	chance += 20;

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n ferociously bite $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n ferociously bites you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You ferociously bite $N.", victim, null, null, Character.ActType.ToChar);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);
		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bite);
	}
	else
	{
		ch.Act("$n snaps to bite $N but fails to make contact.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n snaps at you but fails to make contact.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You snap at $N in an attemt to bite them, but fail to make contact.", victim, null, null, Character.ActType.ToChar);
		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bite);
	}
	return;
}
Character.DoCommands.DoPeck = function(ch, args)
{
	var dam_each = [
		36,
		63,
		78,
		95
	];

	var dam;
	var [victim] = ch.GetCharacterHere(args);
	var skill = SkillSpell.SkillLookup("peck");
	var chance;

	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form == null)
	{
		ch.send("Only animals can peck someone.\n\r");
		return;
	}

	if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if ((!args.ISEMPTY() && !victim) || (args.ISEMPTY() && (victim = ch.Fighting) == null))
	{
		ch.send("You don't see them here.\n\r");
		return;
	}

	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	chance += 20;

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n ferociously peck $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n ferociously pecks you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You ferociously pecks $N.", victim, null, null, Character.ActType.ToChar);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);
		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	else
	{
		ch.Act("$n tries to peck $N but fails to make contact.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to peck you but fails to make contact.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to peck at $N, but fail to make contact.", victim, null, null, Character.ActType.ToChar);
		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}
Character.DoCommands.DoWaspSting = function(ch, args)
{
	var dam_each = [
		36,
		63,
		78,
		95
	];

	var dam;
	var [victim] = ch.GetCharacterHere(args);
	var skill = SkillSpell.SkillLookup("wasp sting");
	var chance;

	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
	}
	else if (ch.Form == null)
	{
		ch.send("Only animals can sting someone.\n\r");
	}

	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
	}
	else if ((!args.ISEMPTY() && !victim) || (args.ISEMPTY() && (victim = ch.Fighting) == null))
	{
		ch.send("You don't see them here.\n\r");
	}

	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	chance += 20;

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n ferociously stings $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n ferociously stings you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You ferociously stings $N.", victim, null, null, Character.ActType.ToChar);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);
		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Sting);
	}
	else
	{
		ch.Act("$n tries to sting $N but fails to make contact.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to sting you fails to make contact.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to sting $N, but fail to make contact.", victim, null, null, Character.ActType.ToChar);
		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Sting);
	}
	return;
}

Character.DoCommands.DoClaw = function(ch, args)
{

	var dam_each = [
		36,
		63,
		78,
		95
   ];
	var skill = SkillSpell.SkillLookup("claw");
	var chance;
	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form == null)
	{
		ch.send("Only animals can claw someone.\n\r");
		return;
	}
	var dam;
	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	var [victim] = ch.GetCharacterHere(args);

	if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if ((!args.ISEMPTY() && !victim) || (args.ISEMPTY() && (victim = ch.Fighting) == null))
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	chance += (level * 2);

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n makes a furious attack with their claws at $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n makes a furious attack with their claws at you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You make a furious attack with your claws at $N.", victim, null, null, Character.ActType.ToChar);

		dam = ch.GetDamage(level, 1, 2);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	else
	{
		ch.Act("$n tries to make a furious attack with their claws at $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to make a furious attack with their claws at you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to make a furious attack with your claws at $N.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}

Character.DoCommands.DoFuror = function(ch, args)
{

	var dam_each = [
		36,
		63,
		78,
		95
   ];
	var skill = SkillSpell.SkillLookup("furor");
	var chance;
	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form == null)
	{
		ch.send("Only animals can ferociously attack someone.\n\r");
		return;
	}

	var dam;
	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	var [victim] = ch.GetCharacterHere(args);

	if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if ((!args.ISEMPTY() && !victim) || (args.ISEMPTY() && (victim = ch.Fighting) == null))
	{
		ch.send("You don't see them here.\n\r");
		return;
	}

	chance += (level * 2);

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n makes a series of ferocious attack, biting and clawing at $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n makes a series of ferocious attacks, biting and clawing at you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You make a series of ferocious attacks, biting and clawing at $N.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, true, 1);

		for ( i = 0; i < 4; i++)
		{
			dam = ch.GetDamage(level, 1, 2);
			Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

			if (ch.Fighting != victim)
				break;
		}
	}
	else
	{
		ch.Act("$n tries to make a furious attack on $N but fails to get close enough.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to make a furious attack on you but fails to get close enough.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to make a furious attack on $N but fail to get close enough.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}

Character.DoCommands.DoTrample = function(ch, args)
{

	var dam_each = [
		36,
		63,
		78,
		95
   ];
	var skill = SkillSpell.SkillLookup("trample");
	var chance;
	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form == null)
	{
		ch.send("Only animals can trample someone.\n\r");
		return;
	}

	var dam;
	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier); // ch.Level;
	var [victim] = ch.GetCharacterHere(args);

	if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if ((!args.ISEMPTY() && !victim) || (args.ISEMPTY() && (victim = ch.Fighting) == null))
	{
		ch.send("You don't see them here.\n\r");
		return;
	}

	chance += (level * 2);// / 10;

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n charges at $N and tramples $M.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n charges at you, and tramples you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You charge at $N, trampling them.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, true, 1);

		for ( i = 0; i < 4; i++)
		{
			dam = ch.GetDamage(level, 1, 2);

			Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

			if (ch.Fighting != victim)
				break;
		}
	}
	else
	{
		ch.Act("$n tries to charge at $N but fails to get close enough.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to charge you but fails to get close enough.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to make charge $N but fail to get close enough.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}

Character.DoCommands.DoHoofStrike = function(ch, args)
{
	var [victim] = ch.GetCharacterHere(args);
	var dam_each = [
			50,
			65,
			85,
			105
	 ];

	var dam;
	 skillPercent = 0;

	if (ch.Form == null)
	{
		ch.send("You don't know how to hoof strike.\n\r");
		return;
	}
	var skill = SkillSpell.SkillLookup("hoof strike");
	if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to hoof strike.\n\r");
		return;
	}
	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (skillPercent > Utility.NumberPercent())
	{
		var level = 3 - (ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier));
		dam = dam_each[level];

		ch.Act("$n unleashes a powerful kick with each hoof, striking $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n unleashes a powerful kick with each of $s hoofs, striking you!", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You unleash a powerful kick with each hoof, striking $N.", victim, null, null, Character.ActType.ToChar);

		Combat.Damage(ch, victim, dam, skill);

		if (ch.Fighting == victim)
			Combat.Damage(ch, victim, dam, skill);
	}
	else
	{
		Combat.Damage(ch, victim, 0, skill);
	}
}

Character.DoCommands.DoStrike = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("strike");
	var chance;
	var [victim] = ch.GetCharacterHere(args);

	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to strike your enemy.\n\r");
		return;
	}
	else if (ch.Form == null)
	{
		ch.send("Only animals can strike their enemies.\n\r");
		return;
	}
	else if ((args.ISEMPTY() && (victim = ch.Fighting) == null) || (!args.ISEMPTY() && !victim))
	{
		ch.send("Strike who?\n\r");
		return;
	}
	else if (chance < Utility.NumberPercent())
	{
		ch.Act("You attempt to strike $N but miss.", victim);
		ch.Act("$n attempts to strike at $N but misses.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to strike you!", victim, null, null, Character.ActType.ToVictim);
		Combat.Damage(ch, victim, 0, skill);
		ch.WaitState(skill.WaitTime);
	}
	else
	{

		ch.Act("You coils up before striking at $N.", victim);
		ch.Act("$n coils up and strikes at $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n coils up and strikes you!", victim, null, null, Character.ActType.ToVictim);
		Combat.Damage(ch, victim, Utility.dice(5, 5, 100), skill);
		ch.WaitState(skill.WaitTime);
	}
}

Character.DoCommands.DoPinch = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("pinch");
	var chance;
	var [victim] = ch.GetCharacterHere(args);

	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to pinch your enemy.\n\r");
		return;
	}
	else if (ch.Form == null)
	{
		ch.send("Only animals can pinch their enemies.\n\r");
		return;
	}
	else if ((args.ISEMPTY() && (victim = ch.Fighting) == null) || (!args.ISEMPTY() && !victim))
	{
		ch.send("Pinch who?\n\r");
		return;
	}
	else if (chance < Utility.NumberPercent())
	{
		ch.Act("You attempt to pinch $N but fail to get close enough.", victim);
		ch.Act("$n attempts to pinch $N but doesn't get close.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to pinch you but doesn't get close!", victim, null, null, Character.ActType.ToVictim);
		Combat.Damage(ch, victim, 0, skill);
		ch.WaitState(skill.WaitTime);
	}
	else
	{

		ch.Act("You fiercely grip $N with your powerful claws, pinching with determination.", victim);
		ch.Act("$n fiercely grips $N with its powerful claws, pinching with determination.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n fiercely grips you with $s powerful claws, pinching with determination!", victim, null, null, Character.ActType.ToVictim);
		Combat.Damage(ch, victim, Utility.dice(5, 5, 100), skill);
		ch.WaitState(skill.WaitTime);
	}
}

Character.DoCommands.DoJump = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("jump");
	var chance;
	var dam_each = [
		36,
		63,
		78,
		95
   ];
	var dam;
	var [victim] = ch.GetCharacterHere(args);

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to jump.\n\r");
		return;
	}
	else if (ch.Form == null)
	{
		ch.send("Only animals can jump.\n\r");
		return;
	}
	else if ((args.ISEMPTY() && (victim = ch.Fighting) == null) || (!args.ISEMPTY() && !victim))
	{
		ch.send("Jump on who?\n\r");
		return;
	}
	else if (chance < Utility.NumberPercent())
	{
		ch.Act("You attempt to jump on $N's head but miss.", victim);
		ch.Act("$n jumps towards $N but misses.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to jump on your head!", victim, null, null, Character.ActType.ToVictim);
		Combat.Damage(ch, victim, 0, skill);
		ch.WaitState(skill.WaitTime);
	}
	else
	{
		var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);

		ch.Act("You jump on $N's head.", victim);
		ch.Act("$n jumps on $N's head.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n jumps on your head!", victim, null, null, Character.ActType.ToVictim);
		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		Combat.Damage(ch, victim, dam, skill);
		ch.WaitState(skill.WaitTime);

		if (victim.FindAffect(skill) == null)
		{
			var aff = new AffectData();
			aff.SkillSpell = skill;
			aff.Duration = ch.Level / 4;
			aff.EndMessage = "Your head stops throbbing.";
			aff.EndMessageToRoom = "$n's head stops throbbing.";
			aff.OwnerName = ch.Name;
			aff.Level = ch.Level;
			aff.Location = AffectData.ApplyTypes.Strength;
			aff.Modifier = -4 - ch.Level / 8;
			aff.AffectType = AffectTypes.Skill;
			aff.DisplayName = skill.name;
			aff.Where = AffectData.AffectWhere.ToAffects;

			victim.AffectToChar(aff);
		}
	}
}

Character.DoCommands.DoAntlerSwipe = function(ch, args)
{
	 skillPercent = 0;

	var skill = SkillSpell.SkillLookup("antler swipe");

	if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Fighting == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	var improved = false;

	ch.Act("$n swings $s antlers viciously.", null, null, null, Character.ActType.ToRoomNotVictim);
	ch.Act("You swing your antlers viciously.", null, null, null, Character.ActType.ToChar);

	for (var victim of Utility.CloneArray(ch.Room.Characters))
	{
		if (victim.Fighting == null || (victim.Fighting != ch && !victim.Fighting.IsSameGroup(ch)))
			continue;

		if (skillPercent > Utility.NumberPercent())
		{
			Combat.Damage(ch, victim, Utility.dice(4, 4, 85), skill);

			improved = true;
		}
		else
		{
			Combat.Damage(ch, victim, 0, skill);
		}
	}

	ch.CheckImprove(skill, improved, 1);
}

Character.DoCommands.DoTailSwipe = function(ch, args)
{
	 skillPercent = 0;

	var skill = SkillSpell.SkillLookup("tailswipe");

	if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Fighting == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	var improved = false;

	ch.Act("$n sweeps $s tail in a wide arc.", null, null, null, Character.ActType.ToRoomNotVictim);
	ch.Act("You sweep around with your tail.", null, null, null, Character.ActType.ToChar);

	for (var victim of Utility.CloneArray(ch.Room.Characters))
	{
		if (victim.Fighting == null || (victim.Fighting != ch && !victim.Fighting.IsSameGroup(ch)))
			continue;

		if (skillPercent > Utility.NumberPercent())
		{
			Combat.Damage(ch, victim, Utility.dice(4, 4, 30), skill);
			victim.WaitState(1);
			improved = true;
		}
		else
		{
			Combat.Damage(ch, victim, 0, skill);
		}
	}

	ch.CheckImprove(skill, improved, 1);
}

Character.DoCommands.DoSwipe = function(ch, args)
{

	var dam_each = [
		36,
		63,
		78,
		95
   ];
	var skill = SkillSpell.SkillLookup("swipe");
	var chance;
	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form == null)
	{
		ch.send("Only animals can swipe someone.\n\r");
		return;
	}
	var dam;
	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
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

	chance += (level * 2);

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);


		ch.Act("$n unleashes a powerful blow on $N, swiping $M with $s claws.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n unleashes a powerful blow on you, swiping you with $s claws.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You unleash a powerful blow on $N, swiping $M with your claws.", victim, null, null, Character.ActType.ToChar);

		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	else
	{
		ch.Act("$n tries to make a furious attack with their claws at $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to make a furious attack with their claws at you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to make a furious attack with your claws at $N.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}

Character.DoCommands.DoRip = function(ch, args)
{

	var dam_each = [
		36,
		63,
		78,
		95
   ];
	var skill = SkillSpell.SkillLookup("rip");
	var chance;
	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form == null)
	{
		ch.send("Only animals can rip someone with their claws.\n\r");
		return;
	}
	var dam;
	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
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

	chance += (level * 2);

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);


		ch.Act("$n rips $N up, leaving behind a vicious wound.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n rips you up, leaving behind a vicious wound.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You rip $N up, leaving behind a vicious wound.", victim, null, null, Character.ActType.ToChar);

		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

		var bleeding = SkillSpell.SkillLookup("bleeding");

		if (victim.FindAffect(bleeding) == null)
		{
			var aff = new AffectData();
			aff.SkillSpell = bleeding;
			aff.Duration = Utility.Random(5, 10);
			aff.EndMessage = "Your bleeding stops.";
			aff.EndMessageToRoom = "$n stops bleeding.";
			aff.OwnerName = ch.Name;
			aff.Level = ch.Level;
			aff.Modifier = -4;
			aff.Location = AffectData.ApplyTypes.Strength;
			aff.AffectType = AffectTypes.Skill;
			aff.DisplayName = "bleeding";
			aff.Where = AffectData.AffectWhere.ToAffects;

			victim.AffectToChar(aff);
		}
	}
	else
	{
		ch.Act("$n attempts to rip $N up but doesn't connect.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to rip you up!", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to rip $N up but fail to connect.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}

Character.DoCommands.DoDevour = function(ch, args)
{

	var dam_each = [
		40,
		70,
		90,
		120
	];
	var skill = SkillSpell.SkillLookup("devour");
	var chance;
	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form == null)
	{
		ch.send("Only animals can devour someone.\n\r");
		return;
	}
	var dam;
	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
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

	chance += (level * 2);

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);


		ch.Act("$n closes in on $N, and ferociously devours $M.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n closes in on you, and ferociously devours you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You close in on $N, and ferociously devour them.", victim, null, null, Character.ActType.ToChar);

		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	else
	{
		ch.Act("$n tries to close in on $N, but can't get close enough.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to close in on you, but can't get close enough.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to close in on $N, but can't get close enough.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}

Character.DoCommands.DoIntercept = function(ch, args)
{
	var tointercept = null;
	var skill = SkillSpell.SkillLookup("ercept");
	var chance = ch.GetSkillPercentage(skill);
	if (chance <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (tointercept = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anything.\n\r");
		return;
	}
	else if ((!args.ISEMPTY() && (tointercept = ch.GetCharacterFromRoomByName(args)) == null) || tointercept == null)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (tointercept.Fighting == ch)
	{
		ch.send("They are already targeting you.\n\r");
		return;
	}
	else if (tointercept.Fighting == null)
	{
		ch.send("They aren't fighting anyone.\n\r");
		return;
	}
	else if (chance >= Utility.NumberPercent())
	{
		ch.WaitState(Game.PULSE_VIOLENCE);
		if (tointercept && tointercept.Fighting)
		{
			tointercept.Fighting = ch;
			ch.Act("$n ercepts $N!", tointercept, null, null, Character.ActType.ToRoomNotVictim);
			ch.Act("$n ercepts you!", tointercept, null, null, Character.ActType.ToVictim);
			ch.Act("You ercept $N!", tointercept, null, null, Character.ActType.ToChar);
			return;
		}
	}
	else
	{
		ch.WaitState(Game.PULSE_VIOLENCE);
		ch.Act("$n tries to ercept $N, but fails.", tointercept, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to ercept you, but fails.", tointercept, null, null, Character.ActType.ToVictim);
		ch.Act("You try to ercept $N, but fail.", tointercept, null, null, Character.ActType.ToChar);
	}
}

Character.DoCommands.DoFlank = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("flank");
	var chance;
	var dam;
	var level = ch.Level;
	//ItemData wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [36, 63, 78, 95];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
		//ch.send("Only animals can impale someone.\n\r");
		//return;
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

	for (var other of ch.Room.Characters)
	{
		if (other.Fighting == ch)
		{
			ch.send("You are too busy defending yourself.\n\r;");
			return;
		}
	}
	//chance += (level * 2);

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);


		ch.Act("$n flank attacks $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n flank attacks you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You flank attack $N.", victim, null, null, Character.ActType.ToChar);

		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

	}
	else
	{
		ch.Act("$n attempts to flank attack $N but fails.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to flank attack you!", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to flank attack $N but fail.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}

Character.DoCommands.DoHeadbutt = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("headbutt");
	var chance;
	var dam;
	var level = ch.Level;
	//ItemData wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			25,
			35,
			45,
			60
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
		//ch.send("Only animals can impale someone.\n\r");
		//return;
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



	//chance += (level * 2);

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);


		ch.Act("$n headbutts $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n headbutts you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You headbutt $N.", victim, null, null, Character.ActType.ToChar);
		victim.WaitState(Game.PULSE_VIOLENCE * 2);
		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);
		Combat.Damage(ch, ch, dam / 2, skill, DamageMessage.WeaponDamageTypes.Bash);
	}
	else
	{
		ch.Act("$n attempts to headbutt $N but fails.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to headbutt you!", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to headbutt $N but fail.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
	}
	return;
}

Character.DoCommands.DoLickSelf = function(ch, argument)
{
	var af;
	var skill = SkillSpell.SkillLookup("lick self");

	if (ch.GetSkillPercentage(skill) + 20 <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if (ch.IsAffected(skill))
	{
		ch.send("You can't benefit from licking your wounds more yet.\n\r");
		return;
	}


	if (Utility.NumberPercent() > ch.GetSkillPercentage(skill))
	{
		ch.send("You lick your wounds but it has no effect.\n\r");
		ch.Act("$n licks $s wounds but doesn't seem to find any relief.", null, null, null, Character.ActType.ToRoom);
		ch.CheckImprove(skill, false, 3);
		return;
	}

	ch.Act("$n spews healing saliva and antimicrobial substances to heal itself.", null, null, null, Character.ActType.ToRoom);
	ch.send("You spew healing saliva and antimicrobial substances to heal yourself.\n\r");
	ch.send("You feel better.\n\r");

	ch.HitPoints += (ch.MaxHitPoints * 0.2);
	ch.HitPoints = Math.min(ch.HitPoints, ch.MaxHitPoints);

	if (Utility.NumberPercent() < Math.max(1, ch.Level / 4) && ch.IsAffected(AffectData.AffectFlags.Plague))
	{
		ch.AffectFromChar(ch.FindAffect(SkillSpell.SkillLookup("plague")), AffectRemoveReason.Cleansed);
		ch.Act("The sores on $n's body vanish.\n\r", null, null, null, Character.ActType.ToRoom);
		ch.send("The sores on your body vanish.\n\r");
	}

	if (Utility.NumberPercent() < Math.max(1, (ch.Level)) && ch.IsAffected(AffectData.AffectFlags.Blind))
	{
		ch.AffectFromChar(ch.FindAffect(SkillSpell.SkillLookup("blindness")), AffectRemoveReason.Cleansed);
		ch.send("Your vision returns!\n\r");
	}

	if (Utility.NumberPercent() < Math.max(1, ch.Level / 2) && ch.IsAffected(AffectData.AffectFlags.Poison))
	{
		ch.AffectFromChar(ch.FindAffect(SkillSpell.SkillLookup("poison")), AffectRemoveReason.Cleansed);
		ch.send("A warm feeling goes through your body.\n\r");
		ch.Act("$n looks better.", null, null, null, Character.ActType.ToRoom);
	}
	ch.CheckImprove(skill, true, 3);

	af = new AffectData();

	af.Where = AffectData.AffectWhere.ToAffects;
	af.SkillSpell = skill;
	af.Location = 0;
	af.Duration = 1;
	af.Modifier = 0;
	af.Level = ch.Level;
	af.AffectType = AffectTypes.Skill;
	af.DisplayName = "lick self";
	af.EndMessage = "You feel ready to lick your wounds once more.";
	ch.AffectToChar(af);
	return;
}

Character.DoCommands.DoRetract = function(ch, argument)
{
	var skill = SkillSpell.SkillLookup("retract");

	if (ch.GetSkillPercentage(skill) <= 1)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if (ch.IsAffected(AffectData.AffectFlags.Retract))
	{
		ch.AffectedBy.REMOVEFLAG(AffectData.AffectFlags.Retract);

		if (ch.Form && ch.Form.Name.Contains("tortoise"))
		{
			ch.Act("$n pulls $s limbs and head out of $s shell.", null, null, null, Character.ActType.ToChar);
			ch.Act("You pull your limbs and head out of your shell.");
		}
		else
		{
			ch.Act("$n uncurls becoming more vulnerable.", null, null, null, Character.ActType.ToChar);
			ch.Act("You uncurl becoming more vulnerable.");
		}
		return;
	}

	if (ch.Form && ch.Form.Name.Contains("tortoise"))
	{
		ch.Act("$n retreats o $s shell for protection.", null, null, null, Character.ActType.ToChar);
		ch.Act("You retreat o your shell for protection.");
	}
	else
	{
		ch.Act("$n curls o a ball, becoming less vulnerable.", null, null, null, Character.ActType.ToRoom);
		ch.Act("You curl o a ball, becoming less vulnerable.");
	}
	ch.AffectedBy.SETBIT(AffectData.AffectFlags.Retract);
	return;
}

Character.DoCommands.DoTuskJab = function(ch, args)
{

	var dam_each = [40, 70, 90, 120];
	var skill = SkillSpell.SkillLookup("tusk jab");
	var chance;
	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	var dam;

	var [victim] = ch.GetCharacterHere(args);

	if (ch.Form == null)
	{
		ch.send("Only animals can tusk jab someone.\n\r");
		return;
	}

	if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if ((!args.ISEMPTY() && !victim))
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	chance += (level * 2);

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);

		ch.Act("$n jabs $N with $s tusks.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n jabs you with $s tusks.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You jab $N with your tusks.", victim, null, null, Character.ActType.ToChar);


		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	else
	{
		ch.Act("$n attempts to jab $N with $s tusks, but fails to make contact.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n attempts to jab you with $s tusks, but fails to make contact.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You attempt to jab $N with your tusks, but fail to make contact.", victim, null, null, Character.ActType.ToChar);
		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}

Character.DoCommands.DoHoofStomp = function(ch, args)
{

	var dam_each = [25, 35, 45, 65];
	var skill = SkillSpell.SkillLookup("hoof stomp");
	var chance;
	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	var dam;

	var [victim] = ch.GetCharacterHere(args);

	if (ch.Form == null)
	{
		ch.send("Only animals can hoof stomp someone.\n\r");
		return;
	}

	if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if ((!args.ISEMPTY() && !victim))
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	chance += (level * 2);

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);

		ch.Act("$n stomps $N with $s hooves.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n stomps you with $s hooves.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You stomp $N with your hooves.", victim, null, null, Character.ActType.ToChar);


		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		ch.CheckImprove(skill, true, 1);
		victim.WaitState(Game.PULSE_VIOLENCE * 2);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	else
	{
		ch.Act("$n attempts to stomp $N with $s hooves, but fails.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n attempts to stomp you with $s hooves, but fails.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You attempt to stomp $N with your hooves, but fail.", victim, null, null, Character.ActType.ToChar);
		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}

Character.DoCommands.DoDive = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("dive");
	var chance;
	var dam;
	var level = ch.Level;
	//ItemData wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			40,
			60,
			80,
			130
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
		//ch.send("Only animals can impale someone.\n\r");
		//return;
	}

	var [victim] = ch.GetCharacterHere(args);

	if (ch.Position == Positions.Fighting)
	{
		ch.send("You're too busy fighting already!\n\r");
		return;
	}

	if (ch.Room.sector != SectorTypes.Cave || ch.Room.sector != SectorTypes.Forest)
	{
		ch.send("You don't see any ledges or trees suitable for diving from.\n\r");
		return;
	}

	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}

	//chance += (level * 2);

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);


		ch.Act("$n dives on $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n dives on you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You dive on $N.", victim, null, null, Character.ActType.ToChar);

		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

	}
	else
	{
		ch.Act("$n tries to dive on $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to dive on you, but fails!", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to dive on $N, but fail.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}

Character.DoCommands.DoPounceAttack = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("pounce attack");
	var chance;
	var dam;
	var level = ch.Level;
	//ItemData wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			60,
			90,
			120,
			130
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
		//ch.send("Only animals can impale someone.\n\r");
		//return;
	}

	var [victim] = ch.GetCharacterHere(args);

	if (ch.IsAffected(skill))
	{
		ch.send("You haven't recovered from your last pounce attack yet!\n\r");
		return;
	}


	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}

	//chance += (level * 2);

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);


		ch.Act("$n pounces on $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n pounces on you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You pounce on $N.", victim, null, null, Character.ActType.ToChar);

		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);
		var affect = new AffectData();
		affect.SkillSpell = skill;
		affect.Hidden = true;
		affect.Frequency = Frequency.Violence;
		affect.Duration = 2;
		ch.AffectToChar(affect);
	}
	else
	{
		ch.Act("$n tries to pounce on $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to pounce on you, but fails!", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to pounce on $N, but fail.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
}

Character.DoCommands.DoHowl = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("howl");
	var chance;
	var dam;
	var level = ch.Level;
	//ItemData wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			60,
			90,
			120,
			130
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	}
	var [victim] = ch.GetCharacterHere(args);

	if (ch.IsAffected(skill))
	{
		ch.send("You aren't ready to howl yet!\n\r");
		return;
	}

	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}

	//chance += (level * 2);

	ch.WaitState(skill.WaitTime);
	//if (chance > utility.number_percent())
	{
		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);


		ch.Act("$n lets loose a deafening howl.", victim, null, null, Character.ActType.ToRoom);

		ch.Act("You let loose a deafening howl.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, true, 1);

		for (var other of ch.Room.Characters)
		{
			if (other != ch && other.Fighting && (other.Fighting == ch || other.Fighting.IsSameGroup(ch)))
			{
				dam = Utility.Random(dam_each[level], dam_each[level] * 2);
				Combat.Damage(ch, other, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);
				var deafen = new AffectData();
				deafen.SkillSpell = skill;
				deafen.Level = ch.Level;
				deafen.EndMessage = "The ringing in your ears lessens.";
				deafen.AffectType = AffectTypes.Skill;
				deafen.Where = AffectData.AffectWhere.ToAffects;
				deafen.DisplayName = "deafening howl";
				deafen.Flags.SETBIT(AffectData.AffectFlags.Deafen);
				deafen.Duration = 3;
				other.AffectToChar(deafen);
			}
		}
		var affect = new AffectData();
		affect.SkillSpell = skill;
		affect.Hidden = true;
		affect.Frequency = Frequency.Tick;
		affect.Duration = 5;
		ch.AffectToChar(affect);


	}
	return;
}

Character.DoCommands.DoQuillSpray = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("quill spray");
	var chance;
	var dam;
	var level = ch.Level;
	//ItemData wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			30,
			40,
			50,
			60
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
		//ch.send("Only animals can impale someone.\n\r");
		//return;
	}


	if (ch.IsAffected(skill))
	{
		ch.send("You aren't ready to spray quills yet!\n\r");
		return;
	}



	ch.WaitState(skill.WaitTime);

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.length - 1);
	level = Math.max(0, level);


	ch.Act("$n sprays quills everywhere.", null, null, null, Character.ActType.ToRoom);

	ch.Act("You spray quills everywhere.", null, null, null, Character.ActType.ToChar);

	ch.CheckImprove(skill, true, 1);

	for (var other of Utility.CloneArray(ch.Room.Characters))
	{
		if (other != ch && !other.IsSameGroup(ch))
		{
			dam = Utility.Random(dam_each[level], dam_each[level] * 2);
			Combat.Damage(ch, other, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

		}
	}
	var affect = new AffectData();
	affect.SkillSpell = skill;
	affect.Hidden = true;
	affect.Frequency = Frequency.Tick;
	affect.Duration = 5;
	affect.EndMessage = "You feel ready to spray more quills.";
	ch.AffectToChar(affect);

	return;
}

Character.DoCommands.DoChestPound = function(ch, args)
{
	var affect;
	var skill = SkillSpell.SkillLookup("chest pound");
	 skillPercent;

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if ((affect = ch.FindAffect(skill)))
	{
		ch.send("You are already enraged!\n\r");
		return;
	}
	else
	{
		ch.WaitState(skill.WaitTime);
		affect = new AffectData();
		affect.SkillSpell = skill;
		affect.Level = ch.Level;
		affect.Location = AffectData.ApplyTypes.Damroll;
		affect.Duration = 2;
		affect.Modifier = +5;
		affect.DisplayName = "chest pound";
		affect.AffectType = AffectTypes.Skill;
		ch.AffectToChar(affect);

		affect = new AffectData();
		affect.SkillSpell = skill;
		affect.Level = ch.Level;
		affect.Location = AffectData.ApplyTypes.Hitroll;
		affect.Duration = 2;
		affect.Modifier = +5;
		affect.DisplayName = "chest pound";
		affect.EndMessage = "Your rage subsides.\n\r";
		affect.EndMessageToRoom = "$n's rage subsides.\n\r";
		affect.AffectType = AffectTypes.Skill;
		ch.AffectToChar(affect);

		 heal = (ch.Level * 2.5) + 5;
		ch.HitPoints = Math.min(ch.HitPoints + heal, ch.MaxHitPoints);


		ch.send("You pound your chest, becoming enraged.\n\r");
		ch.Act("$n pounds $s chest, becoming enraged.\n\r", null, null, null, Character.ActType.ToRoom);
		ch.CheckImprove(skill, true, 1);
	}
}

Character.DoCommands.DoLaugh = function(ch, args)
{
	var affect;
	var skill = SkillSpell.SkillLookup("laugh");
	 skillPercent;

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.CheckSocials("laugh", args);
		return;
	}

	if ((affect = ch.FindAffect(skill)))
	{
		ch.send("You are already empowered!\n\r");
		return;
	}
	else
	{
		ch.WaitState(skill.WaitTime);

		affect = new AffectData();
		affect.SkillSpell = skill;
		affect.Level = ch.Level;
		affect.Where = AffectData.AffectWhere.ToAffects;
		affect.Flags.SETBIT(AffectData.AffectFlags.Haste);
		affect.Duration = 2;
		affect.DisplayName = "laugh";
		affect.AffectType = AffectTypes.Skill;
		ch.AffectToChar(affect);

		affect = new AffectData();
		affect.SkillSpell = skill;
		affect.Level = ch.Level;
		affect.Where = AffectData.AffectWhere.ToAffects;
		affect.Location = AffectData.ApplyTypes.Damroll;
		affect.Duration = 2;
		affect.Modifier = Math.max(3, ch.Level / 3);
		affect.DisplayName = "laugh";
		affect.AffectType = AffectTypes.Skill;
		ch.AffectToChar(affect);

		affect = new AffectData();
		affect.SkillSpell = skill;
		affect.Level = ch.Level;
		affect.Where = AffectData.AffectWhere.ToAffects;
		affect.Location = AffectData.ApplyTypes.Hitroll;
		affect.Duration = 2;
		affect.Modifier = Math.max(3, ch.Level / 3);
		affect.DisplayName = "laugh";
		affect.EndMessage = "Your empowering laugh subsides.\n\r";
		affect.EndMessageToRoom = "$n's empowering laugh subsides.\n\r";
		affect.AffectType = AffectTypes.Skill;
		ch.AffectToChar(affect);

		var heal = (ch.Level * 2.5) + 5;
		ch.HitPoints = Math.min(ch.HitPoints + heal, ch.MaxHitPoints);


		ch.send("You let lose a laugh-like vocalization, invigorating yourself.\n\r");
		ch.Act("$n lets lose a laugh-like vocalization, invigorating $mself.\n\r", null, null, null, Character.ActType.ToRoom);
		ch.CheckImprove(skill, true, 1);
	}
}

Character.DoCommands.DoNoxiousSpray = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("noxious spray");
	var chance;
	var dam;
	var level = ch.Level;
	var spray = SkillSpell.SkillLookup("noxious poison");
	//ItemData wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			30,
			40,
			50,
			60
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	}

	var [victim] = ch.GetCharacterHere(args);

	if (ch.IsAffected(skill))
	{
		ch.send("You aren't ready to release a noxious spray yet!\n\r");
		return;
	}

	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}

	//chance += (level * 2);

	ch.WaitState(skill.WaitTime);

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.length - 1);
	level = Math.max(0, level);


	ch.Act("$n ejects a hot noxious chemical spray from the tip of its abdomen with a popping sound.", victim, null, null, Character.ActType.ToRoom);
	ch.Act("You eject a hot noxious chemical spray from the tip of its abdomen with a popping sound.", victim, null, null, Character.ActType.ToChar);

	ch.CheckImprove(skill, true, 1);

	for (var other of Utility.CloneArray(ch.Room.Characters))
	{
		if (other != ch && other.Fighting && (other.Fighting == ch || other.Fighting.IsSameGroup(ch)))
		{
			dam = Utility.Random(dam_each[level], dam_each[level] * 2);
			Combat.Damage(ch, other, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

			if (!other.IsAffected(spray))
			{
				var affect = new AffectData();
				affect.OwnerName = ch.Name;
				affect.SkillSpell = spray;
				affect.Level = ch.Level;
				affect.Where = AffectData.AffectWhere.ToAffects;
				affect.Location = AffectData.ApplyTypes.Strength;
				affect.Flags.SETBIT(AffectData.AffectFlags.Poison);
				affect.Duration = 2 + level / 8;
				affect.Modifier = -5;
				affect.DisplayName = "Noxious Spray";
				affect.EndMessage = "You feel less sick.\n\r";
				affect.EndMessageToRoom = "$n looks less sick.\n\r";
				affect.AffectType = AffectTypes.Skill;

				other.AffectToChar(affect);
				other.send("You feel very sick.\n\r");
				other.Act("$n looks very ill.", null, null, null, ActType.ToRoom);
			}
		}
	}
	var aff = new AffectData();
	aff.SkillSpell = skill;
	aff.Hidden = false;
	aff.Frequency = Frequency.Tick;
	aff.Location = AffectData.ApplyTypes.AC;
	aff.Where = AffectData.AffectWhere.ToAffects;
	aff.DisplayName = "noxious spray";
	aff.Modifier = 200;
	aff.Duration = 5;
	aff.EndMessage = "You feel ready to spray noxious chemicals again.";
	ch.AffectToChar(aff);


}


Character.DoCommands.DoVenomSpit = function(ch, args)
{

	var dam_each = [
		 0,
		5,  6,  7,  8,  9,  11, 14, 16, 21, 26,
		31, 36, 41, 46, 51, 56, 56, 56, 57, 58,
		59, 59, 60, 61, 62, 62, 63, 64, 65, 65,
		66, 67, 68, 68, 69, 70, 71, 71, 72, 73,
		74, 74, 75, 76, 77, 77, 78, 79, 80, 80,
		95, 115, 125, 155, 175, 210, 240, 550, 550, 550
	];
	var skill = SkillSpell.SkillLookup("venom spit");
	var venom = SkillSpell.SkillLookup("venom");
	var chance;
	var dam;
	var level = ch.Level;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			30,
			50,
			80,
			100
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	}

	var [victim] = ch.GetCharacterHere(args);

	if (ch.IsAffected(skill))
	{
		ch.send("You aren't ready to spit venom again yet!\n\r");
		return;
	}

	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.length - 1);
	level = Math.max(0, level);

	if (Utility.Random(1, 10) <= 6 && !victim.IsAffected(skill))
	{
		//if ((victim.ImmuneFlags.ISSET(DamageMessage.WeaponDamageTypes.Blind) || (victim.Form && victim.Form.ImmuneFlags.ISSET(DamageMessage.WeaponDamageTypes.Blind))) && !victim.IsAffected(AffectData.AffectFlags.Deafen))
		//	victim.Act("$n is immune to blindness.", null, null, null, Character.ActType.ToRoom);
		//else
		//{
		var blindaffect = new AffectData();
		blindaffect.OwnerName = ch.Name;
		blindaffect.SkillSpell = skill;
		blindaffect.Level = ch.Level;
		blindaffect.Where = AffectData.AffectWhere.ToAffects;
		blindaffect.Location = AffectData.ApplyTypes.Hitroll;
		blindaffect.Flags.SETBIT(AffectData.AffectFlags.Blind);
		blindaffect.Duration = 3;
		blindaffect.Modifier = -4;
		blindaffect.DisplayName = "Blinded";
		blindaffect.EndMessage = "You can see again.\n\r";
		blindaffect.EndMessageToRoom = "$n recovers their sight.\n\r";
		blindaffect.AffectType = AffectTypes.Skill;

		victim.AffectToChar(blindaffect);
		ch.Act("$n spits venom at $N, getting some in $S eyes.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("You spit venom at $N, getting some in $S eyes.", victim, null, null, Character.ActType.ToChar);
		victim.Act("You are blinded by $N's venom!\n\r", ch);
		victim.Act("$n appears to be blinded by $N's venom!", ch, null, null, ActType.ToRoomNotVictim);
		//}
	}
	else
	{
		ch.Act("$n spits venom at $N.", victim, null, null, Character.ActType.ToRoom);
		ch.Act("You spit venom at $N.", victim, null, null, Character.ActType.ToChar);
	}
	ch.CheckImprove(skill, true, 1);

	dam = Utility.Random(dam_each[level], dam_each[level] * 2);
	Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

	if (!victim.IsAffected(venom))
	{
		var affect = new AffectData();
		affect.OwnerName = ch.Name;
		affect.SkillSpell = venom;
		affect.Level = ch.Level;
		affect.Where = AffectData.AffectWhere.ToAffects;
		affect.Location = AffectData.ApplyTypes.Strength;
		affect.Duration = 6;
		affect.Modifier = -5;
		affect.DisplayName = "Venom Poison";
		affect.EndMessage = "You feel less sick.\n\r";
		affect.EndMessageToRoom = "$n is looking less sick.\n\r";
		affect.AffectType = AffectTypes.Skill;

		victim.AffectToChar(affect);
		victim.send("You feel very sick.\n\r");
		victim.Act("$n looks very ill.", null, null, null, ActType.ToRoom);
	}

	var aff = new AffectData();
	aff.SkillSpell = skill;
	aff.Hidden = true;
	aff.Frequency = Frequency.Tick;
	aff.Where = AffectData.AffectWhere.ToAffects;
	aff.DisplayName = "venom spit";
	aff.Duration = 6;
	aff.EndMessage = "You feel ready to spit venom again.";
	ch.AffectToChar(aff);
}
Character.DoCommands.DoShootBlood = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("shoot blood");
	var chance;
	var level = ch.Level;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			30,
			50,
			80,
			100
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	}

	var [victim] = ch.GetCharacterHere(args);

	if (ch.IsAffected(skill))
	{
		ch.send("You aren't ready to shoot blood again!\n\r");
		return;
	}

	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.length - 1);
	level = Math.max(0, level);

	if (chance > Utility.NumberPercent())
	{
		//if ((victim.ImmuneFlags.ISSET(DamageMessage.WeaponDamageTypes.Blind) || (victim.Form && victim.Form.ImmuneFlags.ISSET(DamageMessage.WeaponDamageTypes.Blind))) && !victim.IsAffected(AffectData.AffectFlags.Deafen))
		//	victim.Act("$n is immune to blindness.", null, null, null, Character.ActType.ToRoom);
		//else
		//{
		ch.Act("$n shoots blood at $N' eyes.", victim, null, null, Character.ActType.ToRoom);
		ch.Act("You shoot blood at $N's eyes.", victim, null, null, Character.ActType.ToChar);
		var blindaffect = new AffectData();
		blindaffect.OwnerName = ch.Name;
		blindaffect.SkillSpell = skill;
		blindaffect.Level = ch.Level;
		blindaffect.Where = AffectData.AffectWhere.ToAffects;
		blindaffect.Location = AffectData.ApplyTypes.Hitroll;
		blindaffect.Flags.SETBIT(AffectData.AffectFlags.Blind);
		blindaffect.Duration = 3;
		blindaffect.Modifier = -4;
		blindaffect.DisplayName = "Blinded";
		blindaffect.EndMessage = "You can see again.\n\r";
		blindaffect.EndMessageToRoom = "$n recovers their sight.\n\r";
		blindaffect.AffectType = AffectTypes.Skill;

		victim.AffectToChar(blindaffect);
		victim.send("You are blinded!\n\r");
		victim.Act("$n appears to be blinded!", null, null, null, ActType.ToRoom);
		//}
	}
	else
	{
		ch.Act("$n shoots blood at $N's eyes, but misses.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n shoots blood at your eyes, but misses.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You shoot blood at $N's eyes, but miss.", victim, null, null, Character.ActType.ToChar);
	}

	//dam = utility.rand(dam_each[level], dam_each[level] * 2);
	//Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

	var aff = new AffectData();
	aff.SkillSpell = skill;
	aff.Hidden = true;
	aff.Frequency = Frequency.Tick;
	aff.Where = AffectData.AffectWhere.ToAffects;
	aff.DisplayName = "shoot blood";
	aff.Duration = 5;
	aff.EndMessage = "You feel ready to shoot blood again.";
	ch.AffectToChar(aff);
}
Character.DoCommands.DoZigzag = function(ch, args)
{
	var victim;

	 skillPercent = 0;
	var skill = SkillSpell.SkillLookup("zigzag");
	var chance;
	if ((chance = skillPercent = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to mislead your foes.\n\r");
		return;
	}

	if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	var aff;
	if ((aff = victim.FindAffect(skill)))
	{
		ch.send("They are already being misled.\n\r");
		return;
	}

	if (Combat.CheckIsSafe(ch, victim)) return;

	ch.WaitState(skill.WaitTime);

	/* stats */
	chance += ch.GetCurrentStat(PhysicalStatTypes.Dexterity);
	chance -= 2 * victim.GetCurrentStat(PhysicalStatTypes.Dexterity);

	/* speed  */
	if (ch.Flags.ISSET(Character.ActFlags.Fast) || ch.IsAffected(AffectData.AffectFlags.Haste))
		chance += 10;
	if (victim.Flags.ISSET(Character.ActFlags.Fast) || victim.IsAffected(AffectData.AffectFlags.Haste))
		chance -= 30;

	/* level */
	chance += (ch.Level - victim.Level) * 2;

	/* sloppy hack to prevent false zeroes */
	if (chance % 5 == 0)
		chance += 1;


	if (chance > Utility.NumberPercent())
	{

		ch.Act("$N is misled by $n's zig and zag!", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n zigs and zags and distracts your next attack.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You distract $N with a zigzag.", victim, null, null, Character.ActType.ToChar);

		var newaffect = new AffectData();
		newaffect.Flags.SETBIT(AffectData.AffectFlags.ZigZagFe);
		newaffect.Duration = 2;
		newaffect.Frequency = Frequency.Violence;
		newaffect.DisplayName = "zigzag";
		newaffect.Modifier = 0;
		newaffect.Location = AffectData.ApplyTypes.None;
		newaffect.SkillSpell = skill;
		newaffect.AffectType = AffectTypes.Skill;
		victim.AffectToChar(newaffect);

		var existingAffect = victim.Affects.FirstOrDefault(a => a.SkillSpell == skill && Object.keys(a.Flags).length == 0);

		if (existingAffect)
		{
			victim.AffectApply(existingAffect, true, true);
			existingaffect.Duration = 6;
			existingaffect.Modifier -= 1;
			victim.AffectApply(existingAffect, false, true);
		}
		else
		{
			newaffect.Frequency = Frequency.Tick;
			newaffect.Flags = {};
			newaffect.Duration = 6;
			newaffect.Location = AffectData.ApplyTypes.Dex;
			newaffect.Modifier = -1;
			victim.AffectToChar(newaffect);
		}
		ch.CheckImprove(skill, true, 1);
	}
	else
	{
		ch.Act("$n fails to mislead $N with $s zigzag!", null, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n attempts to distract you, but fails to mislead your next attack with a zigzag.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You fail to distract $N from their next attack with a zigzag.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoFlight = function(ch, args)
{
	 skillPercent = 0;
	var skill = SkillSpell.SkillLookup("flight");
	var chance;
	if ((chance = skillPercent = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to fly.\n\r");
		return;
	}

	var aff;
	if (ch.IsAffected(AffectData.AffectFlags.Flying) || (aff = ch.FindAffect(skill)))
	{
		ch.send("You are already flying.\n\r");
		return;
	}


	ch.WaitState(skill.WaitTime);

	//if (chance > utility.number_percent())
	{

		ch.Act("$n leaps o the air and uses $s small wings to fly for a short time.", null, null, null, Character.ActType.ToRoom);
		ch.Act("You leap o the air and use your small wings to fly for a short time.", null, null, null, Character.ActType.ToChar);

		var newaffect = new AffectData();

		newaffect.Duration = 2;
		newaffect.Frequency = Frequency.Tick;
		newaffect.DisplayName = "flight";
		newaffect.Modifier = 0;
		newaffect.Location = AffectData.ApplyTypes.None;
		newaffect.SkillSpell = skill;
		newaffect.AffectType = AffectTypes.Skill;
		newaffect.Flags.SETBIT(AffectData.AffectFlags.Flying);
		ch.AffectToChar(newaffect);

		ch.CheckImprove(skill, true, 1);
	}

}

Character.DoCommands.DoGlandSpray = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("gland spray");
	var chance;
	var dam;
	var level = ch.Level;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			30,
			50,
			80,
			100
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	}

	var [victim] = ch.GetCharacterHere(args);

	if (ch.IsAffected(skill))
	{
		ch.send("You aren't ready to spray from your glands again!\n\r");
		return;
	}

	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.length - 1);
	level = Math.max(0, level);

	if (Utility.Random(1, 10) <= 3)
	{
		//if ((victim.ImmuneFlags.ISSET(DamageMessage.WeaponDamageTypes.Blind) || (victim.Form && victim.Form.ImmuneFlags.ISSET(DamageMessage.WeaponDamageTypes.Blind))) && !victim.IsAffected(AffectData.AffectFlags.Deafen))
		//	victim.Act("$n is immune to blindness.", null, null, null, Character.ActType.ToRoom);
		//else
		//{
		ch.Act("$n sprays sulfurous and pungent chemicals from $s anal glands, getting some in $N's eyes.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n sprays sulfurous and pungent chemicals from $s anal glands, getting some in your eyes.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You spray sulfurous and pungent chemicals from your anal glands, getting some in $N's eyes.", victim, null, null, Character.ActType.ToChar);
		var blindaffect = new AffectData();
		blindaffect.OwnerName = ch.Name;
		blindaffect.SkillSpell = skill;
		blindaffect.Level = ch.Level;
		blindaffect.Where = AffectData.AffectWhere.ToAffects;
		blindaffect.Location = AffectData.ApplyTypes.Hitroll;
		blindaffect.Flags.SETBIT(AffectData.AffectFlags.Blind);
		blindaffect.Duration = 2;
		blindaffect.Modifier = -4;
		blindaffect.DisplayName = "Blinded";
		blindaffect.EndMessage = "You can see again.\n\r";
		blindaffect.EndMessageToRoom = "$n recovers their sight.\n\r";
		blindaffect.AffectType = AffectTypes.Skill;

		victim.AffectToChar(blindaffect);
		victim.send("You are blinded!\n\r");
		victim.Act("$n appears to be blinded!", null, null, null, ActType.ToRoom);
		//}
	}
	else
	{
		ch.Act("$n sprays sulfurous and pungent chemicals from $s anal glands at $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n sprays sulfurous and pungent chemicals from $s anal glands at you.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You spray sulfurous and pungent chemicals from your anal glands at $N.", victim, null, null, Character.ActType.ToChar);
	}
	ch.CheckImprove(skill, true, 1);


	dam = Utility.Random(dam_each[level], dam_each[level] * 2);
	Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

	var affect = new AffectData();
	affect.OwnerName = ch.Name;
	affect.SkillSpell = SkillSpell.SkillLookup("faerie fire");
	affect.Level = ch.Level;
	affect.Where = AffectData.AffectWhere.ToAffects;
	affect.Location = AffectData.ApplyTypes.AC;
	affect.Flags.SETBIT(AffectData.AffectFlags.FaerieFire);
	affect.Duration = 6;
	affect.Modifier = 20;
	affect.DisplayName = "sprayed";
	affect.EndMessage = "Your stench wanes.\n\r";
	affect.EndMessageToRoom = "$n's stench wanes.\n\r";
	affect.AffectType = AffectTypes.Skill;

	victim.AffectToChar(affect);

	var aff = new AffectData();
	aff.SkillSpell = skill;
	aff.Hidden = true;
	aff.Frequency = Frequency.Tick;
	aff.Where = AffectData.AffectWhere.ToAffects;
	aff.DisplayName = "gland spray";
	aff.Duration = 6;
	aff.EndMessage = "You feel ready to spray from your stink glands again.";
	ch.AffectToChar(aff);
}

Character.DoCommands.DoVenomStrike = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("venom strike");
	var venomstrikepoison = SkillSpell.SkillLookup("poisonous venom strike");
	var chance;
	var dam;
	var level = ch.Level;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			30,
			50,
			80,
			100
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	}

	var [victim] = ch.GetCharacterHere(args);

	if (ch.IsAffected(skill))
	{
		ch.send("You aren't ready to venom strike again!\n\r");
		return;
	}

	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.length - 1);
	level = Math.max(0, level);


	ch.Act("$n strikes quickly, injecting $N with subduing poison.", victim, null, null, Character.ActType.ToRoomNotVictim);
	ch.Act("$n strikes quickly, injecting you with subduing poison.", victim, null, null, Character.ActType.ToVictim);
	ch.Act("You strike quickly, injecting $N with subduing poison.", victim, null, null, Character.ActType.ToChar);

	ch.CheckImprove(skill, true, 1);


	dam = Utility.Random(dam_each[level], dam_each[level] * 2);
	Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

	if (!ch.IsAffected(venomstrikepoison))
	{
		var affect = new AffectData();
		affect.OwnerName = ch.Name;
		affect.SkillSpell = venomstrikepoison;
		affect.Level = ch.Level;
		affect.Where = AffectData.AffectWhere.ToAffects;
		affect.Location = AffectData.ApplyTypes.Hitroll;
		affect.Duration = 6;
		affect.Modifier = -10;
		affect.DisplayName = "venom strike";
		affect.EndMessage = "You feel less sick.\n\r";
		affect.EndMessageToRoom = "$n appears less sick.\n\r";
		affect.AffectType = AffectTypes.Skill;

		victim.AffectToChar(affect);
	}

	var aff = new AffectData();
	aff.SkillSpell = skill;
	aff.Hidden = true;
	aff.Frequency = Frequency.Violence;
	aff.Where = AffectData.AffectWhere.ToAffects;
	aff.DisplayName = "venom strike";
	aff.Duration = 3;
	aff.EndMessage = "You feel ready to venom strike again.";
	ch.AffectToChar(aff);
}
Character.DoCommands.DoVenomousSting = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("venomous sting");
	var venomstingpoison = SkillSpell.SkillLookup("poisonous venom strike");
	var chance;
	var dam;
	var level = ch.Level;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			30,
			50,
			80,
			100
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	}

	var [victim] = ch.GetCharacterHere(args);

	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.length - 1);
	level = Math.max(0, level);

	ch.Act("$n strikes quickly, stinging $N with poison.", victim, null, null, Character.ActType.ToRoomNotVictim);
	ch.Act("$n strikes quickly, stinging you with poison.", victim, null, null, Character.ActType.ToVictim);
	ch.Act("You strike quickly, stinging $N with poison.", victim, null, null, Character.ActType.ToChar);

	ch.CheckImprove(skill, true, 1);

	dam = Utility.Random(dam_each[level], dam_each[level] * 2);
	Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Sting);

	if (!ch.IsAffected(venomstingpoison))
	{
		var affect = new AffectData();
		affect.OwnerName = ch.Name;
		affect.SkillSpell = venomstingpoison;
		affect.Level = ch.Level;
		affect.Where = AffectData.AffectWhere.ToAffects;
		affect.Location = AffectData.ApplyTypes.Hitroll;
		affect.Duration = 6;
		affect.Modifier = -10;
		affect.DisplayName = "venomous sting";
		affect.EndMessage = "You feel less sick.\n\r";
		affect.EndMessageToRoom = "$n appears less sick.\n\r";
		affect.AffectType = AffectTypes.Skill;

		victim.AffectToChar(affect);
	}

	//var aff = new AffectData();
	//aff.SkillSpell = skill;
	//aff.Hidden = true;
	//aff.Frequency = Frequency.Violence;
	//aff.Where = AffectData.AffectWhere.ToAffects;
	//aff.DisplayName = "venomous sting";
	//aff.Duration = 3;
	//aff.EndMessage = "You feel ready to venomous sting again.";
	//ch.AffectToChar(aff);
}


Character.DoCommands.DoSecreteFilament = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("secreted filament");
	var chance;
	var dam;
	var level = ch.Level;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			30,
			50,
			80,
			100
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	}

	var [victim] = ch.GetCharacterHere(args);

	if (ch.IsAffected(skill))
	{
		ch.send("You aren't ready to secrete filament again!\n\r");
		return;
	}

	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.length - 1);
	level = Math.max(0, level);


	ch.Act("$n sprays $N with a secreted filament.", victim, null, null, Character.ActType.ToRoomNotVictim);
	ch.Act("$n sprays you with a secreted filament.", victim, null, null, Character.ActType.ToVictim);
	ch.Act("You spray $N with a secreted filament.", victim, null, null, Character.ActType.ToChar);

	ch.CheckImprove(skill, true, 1);


	dam = Utility.Random(dam_each[level], dam_each[level] * 2);
	Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

	if (!ch.IsAffected(AffectData.AffectFlags.Poison))
	{
		var affect = new AffectData();
		affect.OwnerName = ch.Name;
		affect.SkillSpell = skill;
		affect.Level = ch.Level;
		affect.Where = AffectData.AffectWhere.ToAffects;
		affect.Location = AffectData.ApplyTypes.Hitroll;
		affect.Duration = 6;
		affect.Modifier = -5;
		affect.DisplayName = "secreted filament";
		affect.EndMessage = "You escape the secreted filament.\n\r";
		affect.EndMessageToRoom = "$n escapes the secreted filament.\n\r";
		affect.AffectType = AffectTypes.Skill;

		victim.AffectToChar(affect);

		affect = new AffectData();
		affect.OwnerName = ch.Name;
		affect.SkillSpell = skill;
		affect.Level = ch.Level;
		affect.Where = AffectData.AffectWhere.ToAffects;
		affect.Location = AffectData.ApplyTypes.DamageRoll;
		affect.Duration = 6;
		affect.Modifier = -5;
		affect.DisplayName = "secreted filament";

		affect.AffectType = AffectTypes.Skill;

		victim.AffectToChar(affect);
	}

	var aff = new AffectData();
	aff.SkillSpell = skill;
	aff.Hidden = true;
	aff.Frequency = Frequency.Violence;
	aff.Where = AffectData.AffectWhere.ToAffects;
	aff.DisplayName = "secreted filament";
	aff.Duration = 3;
	aff.EndMessage = "You feel ready to secrete filament again.";
	ch.AffectToChar(aff);
}


Character.DoCommands.DoAcidExcrete = function(ch, args)
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
	var skill = SkillSpell.SkillLookup("acid excrete");
	var chance;
	var dam;
	var level = ch.Level;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form)
	{
		dam_each = [
			30,
			50,
			80,
			100
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	}

	var [victim] = ch.GetCharacterHere(args);

	if (ch.IsAffected(skill))
	{
		ch.send("You aren't ready to excete acid again!\n\r");
		return;
	}

	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.length - 1);
	level = Math.max(0, level);


	ch.Act("$n directs an acetic stream of acid at $N from $s pedicel.", victim, null, null, Character.ActType.ToRoomNotVictim);
	ch.Act("$n directs an acetic stream of acid at you from $s pedicel.", victim, null, null, Character.ActType.ToVictim);
	ch.Act("You direct an acetic stream of acid at $N from your pedicel.", victim, null, null, Character.ActType.ToChar);

	ch.CheckImprove(skill, true, 1);


	dam = Utility.Random(dam_each[level], dam_each[level] * 2);
	Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Acid);

	var found = false;

	for (var existingaff of victim.Affects)
	{
		if (existingaff.SkillSpell != skill)
			continue;

		if (existingaff.Location == AffectData.ApplyTypes.Strength || existingaff.Location == AffectData.ApplyTypes.Dexterity)
		{
			existingaff.Modifier -= 2;
			existingaff.Duration = 6;
			found = true;
		}
	}

	if (!found)
	{
		var affect = new AffectData();
		affect.OwnerName = ch.Name;
		affect.SkillSpell = skill;
		affect.Level = ch.Level;
		affect.Where = AffectData.AffectWhere.ToAffects;
		affect.Location = AffectData.ApplyTypes.Strength;
		affect.Duration = 6;
		affect.Modifier = -2;
		affect.DisplayName = "excreted acid";
		affect.EndMessage = "The burning lessens.\n\r";
		affect.EndMessageToRoom = "$n looks relieved from the excreted acid.\n\r";
		affect.AffectType = AffectTypes.Skill;

		victim.AffectToChar(affect);

		affect = new AffectData();
		affect.OwnerName = ch.Name;
		affect.SkillSpell = skill;
		affect.Level = ch.Level;
		affect.Where = AffectData.AffectWhere.ToAffects;
		affect.Location = AffectData.ApplyTypes.Dexterity;
		affect.Duration = 6;
		affect.Modifier = -2;
		affect.DisplayName = "excreted acid";

		affect.AffectType = AffectTypes.Skill;

		victim.AffectToChar(affect);
	}

	var aff = new AffectData();
	aff.SkillSpell = skill;
	aff.Hidden = true;
	aff.Frequency = Frequency.Violence;
	aff.Where = AffectData.AffectWhere.ToAffects;
	aff.DisplayName = "excreted acid";
	aff.Duration = 3;
	aff.EndMessage = "You feel ready to excrete acid again.";
	ch.AffectToChar(aff);
}


Character.DoCommands.DoSpit = function(ch, args)
{

	var dam_each = [
			50,
			80,
			100,
			120
		];

	if (ch.Form == null)
	{
		if (!ch.CheckSocials("spit", args))
			ch.send("You must be in camel form to spit!\n\r");
		return;
	}

	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	var skill = SkillSpell.SkillLookup("spit");
	var chance;
	var dam;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	var [victim] = ch.GetCharacterHere(args);

	if (ch.IsAffected(skill))
	{
		ch.send("You aren't ready to spit again yet!\n\r");
		return;
	}

	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.length - 1);
	level = Math.max(0, level);

	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n shoots saliva and partially digested food at $N' eyes.", victim, null, null, Character.ActType.ToRoom);
		ch.Act("You shoot saliva and partially digested food at $N's eyes.", victim, null, null, Character.ActType.ToChar);

		if (!victim.IsAffected(AffectData.AffectFlags.Blind))
		{
			//if ((victim.ImmuneFlags.ISSET(DamageMessage.WeaponDamageTypes.Blind) || (victim.Form && victim.Form.ImmuneFlags.ISSET(DamageMessage.WeaponDamageTypes.Blind))) && !victim.IsAffected(AffectData.AffectFlags.Deafen))
			//	victim.Act("$n is immune to blindness.", null, null, null, Character.ActType.ToRoom);
			//else
			//{
			var blindaffect = new AffectData();
			blindaffect.OwnerName = ch.Name;
			blindaffect.SkillSpell = skill;
			blindaffect.Level = ch.Level;
			blindaffect.Where = AffectData.AffectWhere.ToAffects;
			blindaffect.Location = AffectData.ApplyTypes.Hitroll;
			blindaffect.Flags.SETBIT(AffectData.AffectFlags.Blind);
			blindaffect.Duration = 1;
			blindaffect.Modifier = -4;
			blindaffect.DisplayName = "Blinded";
			blindaffect.EndMessage = "You can see again.\n\r";
			blindaffect.EndMessageToRoom = "$n recovers their sight.\n\r";
			blindaffect.AffectType = AffectTypes.Skill;

			victim.AffectToChar(blindaffect);
			victim.Act("You are blinded by $N's spit of saliva and partially digested food!\n\r", ch);
			victim.Act("$n appears to be blinded by $N's saliva and partially digested food!", ch, null, null, ActType.ToRoomNotVictim);
			victim.Act("$n appears to be blinded by your spit of saliva and partially digested food!", ch, null, null, ActType.ToVictim);
			//}
		}
		dam = dam_each[level];
		Combat.Damage(ch, victim, dam, skill);

	}
	else
	{
		ch.Act("$n tries to spit saliva and partially digested food at $N's eyes, but misses.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("You try to spit saliva and partially digested food at $N's eyes, but miss.", victim, null, null, Character.ActType.ToChar);
		ch.Act("$n tries to spit saliva and partially digested food your eyes, but misses.", victim, null, null, Character.ActType.ToVictim);
	}

	//dam = utility.rand(dam_each[level], dam_each[level] * 2);
	//Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

	var aff = new AffectData();
	aff.SkillSpell = skill;
	aff.Hidden = true;
	aff.Frequency = Frequency.Tick;
	aff.Where = AffectData.AffectWhere.ToAffects;
	aff.DisplayName = "spit";
	aff.Frequency = Frequency.Violence;
	aff.Duration = 2;
	aff.EndMessage = "You feel ready to spit again.";
	ch.AffectToChar(aff);
}
Character.DoCommands.DoSnarl = function(ch, args)
{

	var dam_each = [
			25,
			35,
			45,
			55
		];

	if (ch.Form == null)
	{
		if (!ch.CheckSocials("snarl", args))
			ch.send("You must be in form to growl!\n\r");
		return;
	}

	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	var skill = SkillSpell.SkillLookup("snarl");
	var chance;
	var dam;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}
	var victim = null;
	if (ch.IsAffected(skill))
	{
		ch.send("You aren't ready to snarl again yet!\n\r");
		return;
	}
	if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}
	ch.WaitState(skill.WaitTime);

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.length - 1);
	level = Math.max(0, level);

	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n snarls fiercely at $N.", victim, null, null, Character.ActType.ToRoom);
		ch.Act("You snarl fiercely at $N.", victim, null, null, Character.ActType.ToChar);
		var aff = new AffectData();
		aff.SkillSpell = skill;
		aff.Hidden = false;
		aff.Location = AffectData.ApplyTypes.Hitroll;
		aff.DisplayName = "snarled";
		aff.Frequency = Frequency.Violence;
		aff.Duration = 2;
		aff.Modifier = victim.HitRoll / 2;

		victim.AffectToChar(aff);

		aff.Hidden = true;
		aff.Location = AffectData.ApplyTypes.None;
		aff.Modifier = 0;
		aff.Duration = 4;
		aff.EndMessage = "You feel ready to snarl again.";
		ch.AffectToChar(aff);

		victim.Act("Your aim is hindered by $N's snarl!\n\r", ch);
		victim.Act("$n's aim appears to hindered by $N's snarl!", ch, null, null, ActType.ToRoomNotVictim);
		victim.Act("$n's aim appears to be hindered by your snarl!", ch, null, null, ActType.ToVictim);

		dam = dam_each[level];
		Combat.Damage(ch, victim, dam, skill);
	}
	else
	{
		ch.Act("$n tries to snarl at $N, but misses.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("You try to snarl at $N, but miss.", victim, null, null, Character.ActType.ToChar);
		ch.Act("$n tries to snarl at you, but misses.", victim, null, null, Character.ActType.ToVictim);
	}
}
Character.DoCommands.DoAutotomy = function(ch, args)
{

	var skill = SkillSpell.SkillLookup("autotomy");
	var chance;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}
	if (ch.IsAffected(skill))
	{
		ch.send("Your tail has not fully grown back yet.\n\r");
		return;
	}
	ch.WaitState(skill.WaitTime);
	var aff = new AffectData();
	aff.SkillSpell = skill;
	aff.Hidden = true;
	aff.Frequency = Frequency.Tick;
	aff.Duration = 24;
	aff.EndMessage = "Your tail has fully grown back.";
	ch.AffectToChar(aff);

	ch.Act("$n detaches its tail, and steps aside to rest for a bit.", null, null, null, Character.ActType.ToRoom);
	ch.Act("You detach your tail and step aside to rest or run.", null, null, null, Character.ActType.ToChar);

	var TailTemplate = NPCTemplateData.NPCTemplates[19037];
	if (TailTemplate)
	{
		var Tail = new NPCData(TailTemplate, ch.Room);
		Tail.MaxHitPoints = ch.MaxHitPoints;
		Tail.HitPoints = ch.MaxHitPoints;

		var tailaffect = new AffectData();
		tailaffect.Hidden = true;
		tailaffect.Flags.SETBIT(AffectData.AffectFlags.SuddenDeath);
		tailaffect.Duration = 4;
		tailaffect.EndMessageToRoom = "$n finally subsides and dies.\n\r";
		Tail.AffectToChar(tailaffect);

		for (var attacker of Utility.CloneArray(ch.Room.Characters))
		{
			if (attacker.Fighting == ch) attacker.Fighting = Tail;
		}
	}
	Combat.StopFighting(ch, true);

	return;
}

Character.DoCommands.DoTalonStrike = function(ch, args)
{
	var dam_each = [
		 0,
		5,  6,  7,  8,  9,  11, 14, 16, 21, 26,
		31, 36, 41, 46, 51, 56, 56, 56, 57, 58,
		59, 59, 60, 61, 62, 62, 63, 64, 65, 65,
		66, 67, 68, 68, 69, 70, 71, 71, 72, 73,
		74, 74, 75, 76, 77, 77, 78, 79, 80, 80,
		95, 115, 125, 155, 175, 210, 240, 550, 550, 550
	];
	var skill = SkillSpell.SkillLookup("talon strike");
	var venom = SkillSpell.SkillLookup("venom");
	var bleeding = SkillSpell.SkillLookup("bleeding");
	var chance;
	var dam;
	var level = ch.Level;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}
	if (ch.Form)
	{
		dam_each = [
			75,
			100,
			150,
			200
		];
		level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	}

	var [victim] = ch.GetCharacterHere(args);

	if (ch.IsAffected(skill))
	{
		ch.send("You aren't ready to spit venom again yet!\n\r");
		return;
	}
	if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anybody.\n\r");
		return;
	}
	ch.WaitState(skill.WaitTime);

	if (ch.IsNPC)
		level = Math.min(level, 51);
	level = Math.min(level, dam_each.length - 1);
	level = Math.max(0, level);

	if (!victim.IsAffected(skill))
	{
		var affect = new AffectData();
		affect.SkillSpell = bleeding;
		affect.DisplayName = bleeding.name;
		affect.Duration = 5;
		affect.OwnerName = ch.Name;
		affect.Level = ch.Level;
		affect.AffectType = AffectTypes.Skill;
		affect.DisplayName = "bleeding";
		affect.Where = AffectData.AffectWhere.ToAffects;
		victim.AffectToChar(affect);

		affect.SkillSpell = skill;
		affect.Location = AffectData.ApplyTypes.DamageRoll;
		affect.Duration = 5;
		affect.Modifier = -10;
		victim.AffectToChar(affect);

		affect.SkillSpell = skill;
		affect.Location = AffectData.ApplyTypes.Hitroll;
		affect.Duration = 5;
		affect.Modifier = -10;
		victim.AffectToChar(affect);

		affect.SkillSpell = venom;
		affect.DisplayName = venom.name;
		affect.Duration = 5;
		affect.EndMessage = "Your wound closes and your poison runs it's course..";
		affect.EndMessageToRoom = "$n wounds close and $s poison ends.";
		victim.AffectToChar(affect);

		dam = Utility.Random(dam_each[level], dam_each[level] * 2);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Claw);
	}
	else
	{
		ch.Act("They are already wounded by your powerful talon strike!");
	}
} // end talon strike
Character.DoCommands.DoPuncturingBite = function(ch, args)
{
	var dam_each = [
		36,
		63,
		78,
		95
	];
	var dam;
	var healamount;
	var [victim] = ch.GetCharacterHere(args);
	var skill = SkillSpell.SkillLookup("puncturing bite");
	var bleeding = SkillSpell.SkillLookup("bleeding");
	var chance;

	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (ch.Form == null)
	{
		ch.send("Only animals can puncture bite someone.\n\r");
		return;
	}

	if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if ((!args.ISEMPTY() && !victim) || (args.ISEMPTY() && (victim = ch.Fighting) == null))
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	var level = 3 - ShapeshiftForm.FormTiers.indexOf(ch.Form.Tier);
	chance += 20;

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n punctures $N's skin with $s sharp teeth and quickly feeds on their exposed blood.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n punctures your skin with $s sharp teeth and quickly feeds on your exposed blood.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You puncture $N's skin with your sharp teeth and quickly feed on their expolsed blood.", victim, null, null, Character.ActType.ToChar);

		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);

		healamount = Utility.Random(dam_each[level], dam_each[level] * 2);
		dam = Utility.Random(dam_each[level], dam_each[level] * 2);

		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bite);

		ch.HitPoints = Math.min(ch.HitPoints + healamount, ch.MaxHitPoints);
		ch.Hunger = 48;
		ch.Starving = 0;
		ch.Thirst = 48;
		ch.Dehydrated = 0;

		var affect = new AffectData();
		affect.SkillSpell = bleeding;
		affect.DisplayName = bleeding.name;
		affect.Duration = 5;
		affect.OwnerName = ch.Name;
		affect.Level = ch.Level;
		affect.AffectType = AffectTypes.Skill;
		affect.DisplayName = "bleeding";
		affect.Where = AffectData.AffectWhere.ToAffects;
		victim.AffectToChar(affect);

		affect.SkillSpell = skill;
		affect.Location = AffectData.ApplyTypes.Strength;
		affect.Modifier = -2;
		affect.Duration = 5;
		affect.EndMessage = "A bleeding wound puncture finally closes.";
		victim.AffectToChar(affect);
	}
	else
	{
		ch.Act("$n tries to puncture $N's skin with $s sharp teeth but fails to make contact.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to puncture your skin with $s sharp teeth but fails to make contact.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to puncture $N's skin with your sharp teeth but fail to make contact.", victim, null, null, Character.ActType.ToChar);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bite);
	}
	return;
} // end puncture bite