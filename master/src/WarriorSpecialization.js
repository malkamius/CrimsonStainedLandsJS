const PhysicalStats = require("./PhysicalStats");
const Utility = require("./Utility");
const Character = require("./Character");
const ItemData = require("./ItemData");
const Combat = require("./Combat");
const SkillSpell = require("./SkillSpell");
const AffectData = require("./AffectData");
const DamageMessage = require("./DamageMessage");

Character.DoCommands.DoWhirl = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("whirl");
	var whirlPercent;
	var weapon;
	var [victim] = ch.GetCharacterHere(args);
	if ((whirlPercent = ch.GetSkillPercentage(skill)) <= 1)
	{
		if (!ch.CheckSocials("whirl", args))
			ch.Act("You don't know how to do that.");
	}
	else if (args.ISEMPTY() && !(victim = ch.Fighting))
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
	}
	else if (((weapon = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || weapon.WeaponType != ItemData.WeaponTypes.Axe) &&
		((weapon = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || weapon.WeaponType != ItemData.WeaponTypes.Axe))
	{
		ch.Act("You must be wielding an axe to whirl it at someone.");
	}
	else
	{
		var chance = 0;
		chance += ch.TotalWeight / 25;
		chance -= victim.TotalWeight / 20;
		chance += (Character.Sizes.indexOf(ch.Size) - Character.Sizes.indexOf(victim.Size)) * 20;
		chance -= victim.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity);
		chance += ch.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Strength) / 3;
		chance += ch.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity) / 2;

		chance = chance * (whirlPercent / 100);

		ch.WaitState(skill.WaitTime);

		if (chance > Utility.NumberPercent())
		{

			if (!victim.IsAffected(skill))
			{
				var whirlAffect = new AffectData();
				
				whirlAffect.SkillSpell = skill;
				whirlAffect.DisplayName = "whirl";
				whirlAffect.Duration = 5;
				whirlAffect.Modifier = -5;
				whirlAffect.Location = AffectData.ApplyTypes.Strength;
				whirlAffect.AffectType = AffectData.AffectTypes.Skill;
				whirlAffect.Level = ch.Level;

				victim.AffectToChar(whirlAffect);

				whirlAffect.Location = AffectData.ApplyTypes.Dexterity;
				whirlAffect.EndMessage = "You recover from your injury, feeling stronger and more agile.";
				whirlAffect.EndMessageToRoom = "$n recovers from $s injury, looking stronger and more agile.";
				victim.AffectToChar(whirlAffect);
			}

			ch.Act("You whirl $p at $N.", victim, weapon);
			ch.Act("$n whirls $p at you.", victim, weapon, null, Character.ActType.ToVictim);
			ch.Act("$n whirls $p at $N.", victim, weapon, null, Character.ActType.ToRoomNotVictim);

			var damage = Utility.Roll(weapon.DamageDice) + ch.DamageRoll;

			damage = ch.CheckEnhancedDamage(damage);

			ch.CheckImprove(skill, true, 1);

			Combat.Damage(ch, victim, damage, skill, DamageMessage.WeaponDamageTypes.Slice);
		}
		else
		{
			ch.Act("You whirl $p at $N but fail to make contact.", victim, weapon);
			ch.Act("$n whirls $p at you but fails to make contact.", victim, weapon, null, Character.ActType.ToVictim);
			ch.Act("$n whirls $p at $N but fails to make contact.", victim, weapon, null, Character.ActType.ToRoomNotVictim);

			ch.CheckImprove(skill, false, 1);

			Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Slice);
		}
	}
} // end DoWhirl

Character.DoCommands.DoBoneshatter = function(ch, args)
{
	var [victim] = ch.GetCharacterHere(args);
	var skill = SkillSpell.SkillLookup("boneshatter");
	var skillPercent;
	var weapon;
	if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.Act("You don't know how to do that.");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
	}
	else if (((weapon = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || weapon.WeaponType != ItemData.WeaponTypes.Mace) &&
	   ((weapon = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || weapon.WeaponType != ItemData.WeaponTypes.Mace))
	{
		ch.Act("You must be wielding a mace to shatter someone's bones.");
	}
	else
	{
		ch.WaitState(skill.WaitTime);

		var chance = skillPercent + 20;

		if (chance > Utility.NumberPercent())
		{

			if (!victim.IsAffected(skill))
			{
				var boneshatterAffect = new AffectData()
				
				boneshatterAffect.SkillSpell = skill;
				boneshatterAffect.DisplayName = "boneshatter";
				boneshatterAffect.Duration = 5;
				boneshatterAffect.Modifier = -10;
				boneshatterAffect.Location = AffectData.ApplyTypes.Strength;
				boneshatterAffect.AffectType = AffectData.AffectTypes.Skill;
				boneshatterAffect.Level = ch.Level;

				boneshatterAffect.EndMessage = "Your bones feel better.";

				victim.AffectToChar(boneshatterAffect);
			}

			ch.Act("You shatter $N's bones with $p.", victim, weapon);
			ch.Act("$n shatters your bones with $p!", victim, weapon, null, Character.ActType.ToVictim);
			ch.Act("$n shatters $N's bones with $p!", victim, weapon, null, Character.ActType.ToRoomNotVictim);

			var damage = weapon.DamageDice.Roll() + ch.DamageRoll;

			damage = ch.CheckEnhancedDamage(damage);

			ch.CheckImprove(skill, true, 1);

			Combat.Damage(ch, victim, damage, skill, DamageMessage.WeaponDamageTypes.Slice);
		}
		else
		{
			ch.Act("You attempt to shatter $N's bones with $p.", victim, weapon);
			ch.Act("$n attempts to shatter your bones with $p!", victim, weapon, null, Character.ActType.ToVictim);
			ch.Act("$n attempts to shatter $N's bones with $p!", victim, weapon, null, Character.ActType.ToRoomNotVictim);

			ch.CheckImprove(skill, false, 1);

			Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Slice);
		}
	}
} // end DoBoneshatter

Character.DoCommands.DoCrossDownParry = function(ch, args)
{
	var victim = null;
	var skill = SkillSpell.SkillLookup("cross down parry");
	var skillPercent;
	var weapon;
	if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.Act("You don't know how to do that.");
	}
	else if (args.ISEMPTY() && !(victim = ch.Fighting))
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (((weapon = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || weapon.WeaponType != ItemData.WeaponTypes.Sword) ||
	   ((weapon = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || weapon.WeaponType != ItemData.WeaponTypes.Sword))
	{
		ch.Act("You must be dual wielding swords to perform a cross down parry.");
	}
	else
	{
		ch.WaitState(skill.WaitTime);

		var chance = skillPercent + 20;

		if (chance > Utility.NumberPercent())
		{
			var damage = Utility.Roll(weapon.DamageDice) + ch.DamageRoll;

			damage = ch.CheckEnhancedDamage(damage);

			var bleeding = SkillSpell.SkillLookup("bleeding");
			if (Utility.Random(1, 4) == 1 && !victim.IsAffected(bleeding))
			{
				var bleedaffect = new AffectData();
				bleedaffect.SkillSpell = skill;
				bleedaffect.DisplayName = "bleeding";
				bleedaffect.Duration = 5;
				bleedaffect.Modifier = -4;
				bleedaffect.Location = AffectData.ApplyTypes.Strength;
				bleedaffect.AffectType = AffectData.AffectTypes.Skill;
				bleedaffect.Level = ch.Level;

				bleedaffect.EndMessage = "Your nose stops bleeding.";

				victim.AffectToChar(bleedaffect);
				damage += Utility.dice(4, 6, 6);
				ch.Act("You brings both your swords up, crossing them, and kicking $N's nose, causing it to bleed.", victim);
				ch.Act("$n brings both $s swords up, crossing them, and kicking your nose, causing it to bleed.", victim, null, null, Character.ActType.ToVictim);
				ch.Act("$n brings both $s swords up, crossing them, and kicking $N's nose, causing it to bleed.", victim, null, null, Character.ActType.ToRoomNotVictim);

			}
			else
			{
				ch.Act("You brings both your swords up, crossing them, and kick $N in the face.", victim);
				ch.Act("$n brings both $s swords up, crossing them, and kicking your face.", victim, null, null, Character.ActType.ToVictim);
				ch.Act("$n brings both $s swords up, crossing them, and kicking $N's face.", victim, null, null, Character.ActType.ToRoomNotVictim);
			}

			ch.CheckImprove(skill, true, 1);

			Combat.Damage(ch, victim, damage, skill, DamageMessage.WeaponDamageTypes.Bash);
		}
		else
		{
			ch.Act("You attempt to cross your swords and kick $N but fail.", victim);
			ch.Act("$n attempts to cross $s swords and kick you, but fails!", victim, null, null, Character.ActType.ToVictim);
			ch.Act("$n attempts to cross $s swords and kick $N's face, but fails!", victim, null, null, Character.ActType.ToRoomNotVictim);

			ch.CheckImprove(skill, false, 1);

			Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
		}
	}
} // end DoBoneshatter

Character.DoCommands.DoPummel = function(ch, args)
{
	var victim = null;
	var skill = SkillSpell.SkillLookup("pummel");
	var skillPercent;
	var level = ch.Level;
	var dam;

	var dam_each = [
		0,
		4,  5,  6,  7,  8,  10, 13, 15, 20, 25,
		30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
		58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
		65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
		73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
		90,110,120,150,170,200,230,500,500,500
	];

	if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.Act("You don't know how to do that.");
	}
	else if ((victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (ch.Equipment[ItemData.WearSlotIDs.Wield]  ||
	   ch.Equipment[ItemData.WearSlotIDs.DualWield]  ||
	   ch.Equipment[ItemData.WearSlotIDs.Held]  ||
	   ch.Equipment[ItemData.WearSlotIDs.Shield] )
	{
		ch.Act("Your hands must be empty to pummel.");
	}
	else
	{
		ch.WaitState(skill.WaitTime);

		var chance = skillPercent + 20;

		if (chance > Utility.NumberPercent())
		{
			ch.WaitState(skill.WaitTime);

			if (ch.IsNPC)
				level = Math.min(level, 51);
			level = Math.min(level, dam_each.length - 1);
			level = Math.max(0, level);

			ch.Act("You unleash a series of punches, pummeling $N.", victim);
			ch.Act("$n unleashes a series of punches, pummeling you!", victim, null, null, Character.ActType.ToVictim);
			ch.Act("$n unleashes a series of punches, pummeling $N.", victim, null, null, Character.ActType.ToRoomNotVictim);

			ch.CheckImprove(skill, true, 1);

			for (var counter = 0; counter < Utility.Random(1, 6); counter++)
			{
				dam = Utility.Random(dam_each[level] / 2, dam_each[level]);

				Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);
				if (victim.Room != ch.Room || victim.Fighting == null || ch.Fighting == null)
					break;
			}
		}
		else
		{
			ch.Act("You attempt to unleash a series of punches, but can't get close enough.", victim);
			ch.Act("$n attempts to unleash a series of punches against you, but fails to get close!", victim, null, null, Character.ActType.ToVictim);
			ch.Act("$n attempts to unleash a series of punches against $N, but fails to get close!", victim, null, null, Character.ActType.ToRoomNotVictim);

			ch.CheckImprove(skill, false, 1);

			Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
		}
	}
} // end DoPummel

Character.DoCommands.DoBackhand = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("backhand");
	var chance;
	var damage;
	var [victim] = ch.GetCharacterHere(args);
	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.Act("You don't know how to do that.");
	}
	else if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Mace) &&
		((wield = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || wield.WeaponType != ItemData.WeaponTypes.Mace))
	{
		ch.Act("You must be wielding a mace to backhand your enemy.");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
		return;
	}
	else
	{
		ch.WaitState(skill.WaitTime);
		if (chance > Utility.NumberPercent())
		{
			ch.Act("$n backhands $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
			ch.Act("$n backhands you with $p.", victim, wield, null, Character.ActType.ToVictim);
			ch.Act("You backhand $N with $p.", victim, wield, null, Character.ActType.ToChar);

			damage = Utility.Roll(wield.DamageDice) + ch.DamageRoll;

			damage = ch.CheckEnhancedDamage(damage);

			ch.CheckImprove(skill, true, 1);
			Combat.Damage(ch, victim, damage, skill, DamageMessage.WeaponDamageTypes.Pierce);

		}
		else
		{
			ch.Act("$n attempts to hit $N with a backhand blow.", victim, null, null, Character.ActType.ToRoomNotVictim);
			ch.Act("$n tries to hit you with a backhand blow!", victim, null, null, Character.ActType.ToVictim);
			ch.Act("You try to hit $N with a backhand blow.", victim, null, null, Character.ActType.ToChar);

			ch.CheckImprove(skill, false, 1);
			Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
		}
	}
} // end backhand

Character.DoCommands.DoSting = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("sting");
	var chance;
	var dam;
	var [victim] = ch.GetCharacterHere(args);
	chance = ch.GetSkillPercentage(skill) + 20;
	if (ch.Form == null)
	{
		var wield = null;

		if (chance <= 21)
		{
			ch.send("You don't know how to do that.\n\r");
			return;
		}

		if ((!(wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) || wield.WeaponType != ItemData.WeaponTypes.Whip) &&
			(!(wield = ch.Equipment[ItemData.WearSlotIDs.DualWield]) || wield.WeaponType != ItemData.WeaponTypes.Whip))
		{
			ch.send("You must be wielding a whip to sting your enemy.");
			return;
		}

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
			ch.Act("$n stings $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
			ch.Act("$n stings you with $p.", victim, wield, null, Character.ActType.ToVictim);
			ch.Act("You sting $N with $p.", victim, wield, null, Character.ActType.ToChar);

			dam = wield.DamageDice.Roll() + ch.DamageRoll;
			ch.CheckImprove(skill, true, 1);
			Combat.Damage(ch, victim, dam, "stinging lash", DamageMessage.WeaponDamageTypes.Pierce);

		}
		else
		{
			ch.Act("$n attempts to sting $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
			ch.Act("$n tries to sting you with $p!", victim, wield, null, Character.ActType.ToVictim);
			ch.Act("You try to sting $N with $p.", victim, wield, null, Character.ActType.ToChar);

			ch.CheckImprove(skill, false, 1);
			Combat.Damage(ch, victim, 0, "stinging lash", DamageMessage.WeaponDamageTypes.Pierce);
		}
	} // end form == null
	else // form 
	{
		ch.WaitState(skill.WaitTime);
		if (chance < 21)
		{
			ch.send("You don't know how to do that.\n\r");
		}
		else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
		{
			ch.send("You aren't fighting anyone.\n\r");
			return;
		}
		else if (!args.ISEMPTY() && !victim)
		{
			ch.send("You don't see them here.\n\r");
			return;
		}
		else if (chance < Utility.NumberPercent())
		{
			ch.Act("You try to sting $N but miss.");
			ch.Act("$n tries to sting you but misses.", victim, null, null, Character.ActType.ToVictim);
			ch.Act("$n tries to sting $N but misses.", victim, null, null, Character.ActType.ToRoomNotVictim);

			Combat.Damage(ch, victim, 0, "sting", DamageMessage.WeaponDamageTypes.Sting);

		}
		else
		{
			ch.Act("You strike quickly with your stinger, injecting $N with poison.", victim);
			ch.Act("$n strikes quickly with $s stinger, injecting you with poison.", victim, null, null, Character.ActType.ToVictim);
			ch.Act("$n strikes quickly with $s stinger, injecting $N with poison.", victim, null, null, Character.ActType.ToRoomNotVictim);

			var dam_each = [
				30,
				50,
				80,
				100
			];
			var level = 3 - ch.Form.Tier;

			dam = Utility.Random(dam_each[level], dam_each[level] * 2);
			Combat.Damage(ch, victim, dam, "sting", DamageMessage.WeaponDamageTypes.Sting);

			var poison = victim.FindAffect(skill);

			if (poison )
			{
				poison.duration = 2 + level * 2;
				ch.Act("$n's sting .", victim, null, null, Character.ActType.ToVictim);
			}
			else
			{
				poison = new AffectData()
				poison.OwnerName = ch.Name;
				poison.SkillSpell = skill;
				poison.Duration = 2 + level * 2;
				poison.EndMessage = "The poison from your sting ebbs.";
				poison.EndMessageToRoom = "$n's poison from $s sting ebbs.";
				poison.Location = AffectData.ApplyTypes.Strength;
				poison.Modifier = -4;
				victim.AffectToChar(poison);
				ch.Act("Poison flows through your veins from $n's sting.", victim, null, null, Character.ActType.ToVictim);
				ch.Act("Poison flows through $N's veins from your sting.", victim, null, null, Character.ActType.ToChar);
				ch.Act("Poison flows through $N's veins from $n's sting.", victim, null, null, Character.ActType.ToRoomNotVictim);
			}
		}
	}
	return;
} // end sting

Character.DoCommands.DoBludgeon = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("bludgeon");
	var chance;
	var dam;

	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Flail) &&
		((wield = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || wield.WeaponType != ItemData.WeaponTypes.Flail))
	{
		ch.send("You must be wielding a flail to bludgeon your enemy.");
		return;
	}

	var [victim] = ch.GetCharacterHere(args);

	if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if (!args.ISEMPTY() && !(victim))
	{
		ch.send("You don't see them here.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{
		ch.Act("$n bludgeons $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n bludgeons you with $p.", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You bludgeons $N with $p.", victim, wield, null, Character.ActType.ToChar);

		dam = wield.DamageDice.Roll() + ch.DamageRoll;
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

	}
	else
	{
		ch.Act("$n attempts to bludgeons $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to bludgeon you with $p!", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You try to bludgeon $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
	return;
} // end bludgeon


Character.DoCommands.DoLegsweep = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("legsweep");
	var chance;
	var dam;

	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || (wield.WeaponType != ItemData.WeaponTypes.Polearm && wield.WeaponType != ItemData.WeaponTypes.Staff && wield.WeaponType != ItemData.WeaponTypes.Spear)) &&
		((wield = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || (wield.WeaponType != ItemData.WeaponTypes.Polearm && wield.WeaponType != ItemData.WeaponTypes.Staff && wield.WeaponType != ItemData.WeaponTypes.Spear)))
	{
		ch.send("You must be wielding a spear, staff or polearm to legsweep your enemy.");
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
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n legsweeps $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n legsweeps you with $p.", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You legsweep $N with $p.", victim, wield, null, Character.ActType.ToChar);
		victim.WaitState(Game.PULSE_VIOLENCE * 2);
		dam = Utility.Random(10, ch.Level);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);
		CheckCheapShot(victim);
		CheckGroundControl(victim);

	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n attempts to legsweep $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to legsweep you with $p!", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You try to legsweep $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
	}
	return;
} // end legsweep

Character.DoCommands.DoVitalArea = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("vital area");
	var chance;

	var [victim] = ch.GetCharacterHere(args);
	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	else if (ch.Equipment[ItemData.WearSlotIDs.Wield]  ||
		ch.Equipment[ItemData.WearSlotIDs.DualWield] )
	{
		ch.send("You must be using only your hands to vital area an opponent.");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (victim.IsAffected(skill))
	{
		ch.send("You have already struck their vital areas.");
	}
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n strikes $N's vital areas.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n strikes your vital areas.", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You strike $N's vital areas.", victim, null, null, Character.ActType.ToChar);

		var affect = new AffectData()
		affect.SkillSpell = skill;
		affect.DisplayName = "vital area";
		affect.Duration = 5;
		affect.Modifier = -4;
		affect.Location = AffectData.ApplyTypes.Strength;
		affect.AffectType = AffectData.AffectTypes.Skill;
		affect.Level = ch.Level;

		victim.AffectToChar(affect);
		
		affect.Location = AffectData.ApplyTypes.Dexterity;
		affect.EndMessage = "You don't feel as sore in your vital areas.";
		victim.AffectToChar(affect);

		ch.CheckImprove(skill, true, 1);
	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n fails to strike $N's vital areas.", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to strike your vital areas, and misses!", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You try to strike $N's vital areas and miss.", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
	}
	return;
} // end vital area

Character.DoCommands.DoDoubleThrust = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("double thrust");
	var chance;
	var damage;
	var [victim] = ch.GetCharacterHere(args);

	var wield = null;
	var dualwield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.Act("You don't know how to do that.");
	}
	else if ((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Sword ||
		(dualwield = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || dualwield.WeaponType != ItemData.WeaponTypes.Sword)
	{
		ch.Act("You must be dual wielding swords to double thrust.");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
		return;
	}
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);

		ch.Act("$n double thrusts $N with $p and $P.", victim, wield, dualwield, Character.ActType.ToRoomNotVictim);
		ch.Act("$n double thrusts you with $p and $P.", victim, wield, dualwield, Character.ActType.ToVictim);
		ch.Act("You backhand $N with $p and $P.", victim, wield, dualwield, Character.ActType.ToChar);

		ch.CheckImprove(skill, true, 1);

		damage = wield.DamageDice.Roll() + ch.DamageRoll;
		damage = ch.CheckEnhancedDamage(damage);
		damage *= 2;
		Combat.Damage(ch, victim, damage, skill, wield.WeaponDamageType.Type);

		damage = dualwield.DamageDice.Roll() + ch.DamageRoll;
		damage = ch.CheckEnhancedDamage(damage);
		damage *= 2;
		Combat.Damage(ch, victim, damage, skill, dualwield.WeaponDamageType.Type);

	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n attempts to double thrust $N with $p and $P.", victim, wield, dualwield, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to double thrust you with $p and $P!", victim, wield, dualwield, Character.ActType.ToVictim);
		ch.Act("You try to double thrust $N with $p and $P.", victim, wield, dualwield, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
} // end double thrust

Character.DoCommands.DoJab = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("jab");
	var chance;
	var damage;
	var [victim] = ch.GetCharacterHere(args);

	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.Act("You don't know how to do that.");
	}
	else if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Sword) &&
		((wield = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || wield.WeaponType != ItemData.WeaponTypes.Sword))
	{
		ch.Act("You must be wielding a sword to jab.");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
		return;
	}
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);

		ch.Act("$n jabs $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n jabs you with $p.", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You jabs $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, true, 1);

		damage = wield.DamageDice.Roll() + ch.DamageRoll;
		damage = ch.CheckEnhancedDamage(damage);
		damage *= 2;
		Combat.Damage(ch, victim, damage, skill, wield.WeaponDamageType.Type);

	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n attempts to jab $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to jab you with $p!", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You try to jab $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
} // end jab

Character.DoCommands.DoChop = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("chop");
	var chance;
	var damage;
	var [victim] = ch.GetCharacterHere(args);

	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.Act("You don't know how to do that.");
	}
	else if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Polearm))
	{
		ch.Act("You must be wielding a polearm to chop.");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
		return;
	}
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);

		ch.Act("$n chops $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n chops you with $p.", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You chop $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, true, 1);

		damage = wield.DamageDice.Roll() + ch.DamageRoll;
		damage = ch.CheckEnhancedDamage(damage);
		Combat.Damage(ch, victim, damage, skill, wield.WeaponDamageType.Type);

	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n attempts to chop $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to chop you with $p!", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You try to chop $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
} // end chop

Character.DoCommands.DoCrescentStrike = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("crescent strike");
	var chance;
	var damage;
	var [victim] = ch.GetCharacterHere(args);

	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.Act("You don't know how to do that.");
	}
	else if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Spear))
	{
		ch.Act("You must be wielding a spear to crescent strike.");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
		return;
	}
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);

		ch.Act("$n crescent strikes $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n crescent strikes you with $p.", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You crescent strike $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, true, 1);

		damage = wield.DamageDice.Roll() + ch.DamageRoll;
		damage = ch.CheckEnhancedDamage(damage);
		Combat.Damage(ch, victim, damage, skill, wield.WeaponDamageType.Type);

	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n attempts to crescent strike $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to crescent strike you with $p!", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You try to crescent strike $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
} // end crescent strike

Character.DoCommands.DoOverhead = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("overhead");
	var chance;
	var damage;
	var [victim] = ch.GetCharacterHere(args);

	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.Act("You don't know how to do that.");
	}
	else if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Axe))
	{
		ch.Act("You must be wielding an axe in your main hand to overhead attack.");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
		return;
	}
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);

		ch.Act("$n overhead attacks $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n overhead attacks you with $p.", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You overhead attack $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, true, 1);

		damage = wield.DamageDice.Roll() + ch.DamageRoll;
		damage = ch.CheckEnhancedDamage(damage);
		damage *= 3;
		Combat.Damage(ch, victim, damage, skill, wield.WeaponDamageType.Type);
	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n attempts to overhead attack $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to overhead attack you with $p!", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You try to overhead attack $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
} // end overhead

Character.DoCommands.DoDisembowel = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("disembowel");
	var chance;
	var damage;
	var [victim] = ch.GetCharacterHere(args);

	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.Act("You don't know how to do that.");
	}
	else if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Axe))
	{
		ch.Act("You must be wielding an axe in your main hand to attempt this move.");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
		return;
	}
	else if (victim.HitPoints.Percent(victim.MaxHitPoints) > 30)
	{
		ch.Act("They aren't hurt enough to attempt disembowelment.");
	}
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);

		ch.CheckImprove(skill, true, 1);

		if (Utility.Random(1, 5) == 1)
		{
			ch.Act("$n +++DISEMBOWELS+++ $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
			ch.Act("$n +++DISEMBOWELS+++ you.", victim, null, null, Character.ActType.ToVictim);
			ch.Act("You +++DISEMBOWEL+++ $N.", victim, null, null, Character.ActType.ToChar);

			victim.HitPoints = -15;
			Combat.CheckIsDead(ch, victim, -1);
		}
		else
		{
			ch.Act("$n attempts a sweeping gut shot!", victim, wield, null, Character.ActType.ToRoomNotVictim);
			ch.Act("$n attempts a sweeping gut shot!", victim, wield, null, Character.ActType.ToVictim);
			ch.Act("You attempt a sweeping gut shot!", victim, wield, null, Character.ActType.ToChar);
			damage = wield.DamageDice.Roll() + ch.DamageRoll;
			damage = ch.CheckEnhancedDamage(damage);
			damage *= 3;
			Combat.Damage(ch, victim, damage, skill, wield.WeaponDamageType.Type);
		}
	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n attempts a sweeping gut shot, but misses entirely!", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n attempts a sweeping gut shot, but misses entirely!", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You attempt a sweeping gut shot, but misses entirely!", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
	}
} // end disembowel

Character.DoCommands.DoPincer = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("pincer");
	var chance;
	var damage;
	var [victim] = ch.GetCharacterHere(args);

	var wield = null;
	var dualwield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.Act("You don't know how to do that.");
	}
	else if ((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Axe ||
		(dualwield = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || dualwield.WeaponType != ItemData.WeaponTypes.Axe)
	{
		ch.Act("You must be dual wielding an axes to attempt this move.");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
		return;
	}
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);

		ch.CheckImprove(skill, true, 1);


		ch.Act("$n attempts to pincer $N with $s axes!", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n pincers you with $s axes!", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You pincer $N with your axes!", victim, null, null, Character.ActType.ToChar);
		damage = wield.DamageDice.Roll() + ch.DamageRoll;
		damage = ch.CheckEnhancedDamage(damage);
		damage *= 2;
		Combat.Damage(ch, victim, damage, skill, wield.WeaponDamageType.Type);

		if (!victim.IsAffected(skill))
		{
			var affect = new AffectData();
			affect.Where = AffectData.AffectWhere.ToAffects;
			affect.Location = AffectData.ApplyTypes.Strength;
			affect.Modifier = -5;
			affect.Duration = 5;
			affect.DisplayName = "pincer";

			victim.AffectToChar(affect);
			
			affect.EndMessage = "You feel better from the pincer.";
			affect.Location = AffectData.ApplyTypes.Dexterity;
			victim.AffectToChar(affect);
		}
	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n attempts to pincer $N with $s axes, but misses entirely!", victim, null, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n attempts to pincer you with $s axes, but misses entirely!", victim, null, null, Character.ActType.ToVictim);
		ch.Act("You attempt to pincer $N with your axes!", victim, null, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, wield.WeaponDamageType.Type);
	}
} // end pincer

Character.DoCommands.DoUnderhandStab = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("underhand stab");
	var chance;
	var damage;
	var [victim] = ch.GetCharacterHere(args);

	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.Act("You don't know how to do that.");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
		return;
	}
	else if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Dagger) &&
		((wield = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || wield.WeaponType != ItemData.WeaponTypes.Dagger))
	{
		ch.Act("You must be wielding a dagger to underhand stab $N.", victim);
	}
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);

		ch.Act("$n underhand stabs $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n underhand stabs you with $p.", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You underhand stab $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, true, 1);

		damage = wield.DamageDice.Roll() + ch.DamageRoll;
		damage = ch.CheckEnhancedDamage(damage);
		damage *= 2;
		Combat.Damage(ch, victim, damage, skill, wield.WeaponDamageType.Type);

	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n attempts to underhand stab $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to underhand stab you with $p!", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You try to underhand stab $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, wield.WeaponDamageType.Type);
	}
} // end underhand stab

Character.DoCommands.DoLeverageKick = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("leverage kick");
	var chance;
	var damage;
	var [victim] = ch.GetCharacterHere(args);

	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.Act("You don't know how to do that.");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
		return;
	}
	else if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || (wield.WeaponType != ItemData.WeaponTypes.Spear && wield.WeaponType != ItemData.WeaponTypes.Staff)))
	{
		ch.Act("You must be wielding a spear or staff to leverage kick.");
	}
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);

		ch.Act("$n leverage kicks $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n leverage kicks you with $p.", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You leverage kick $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, true, 1);

		damage = wield.DamageDice.Roll() + ch.DamageRoll;
		damage = ch.CheckEnhancedDamage(damage);
		Combat.Damage(ch, victim, damage, skill, wield.WeaponDamageType.Type);

		victim.WaitState(Game.PULSE_VIOLENCE * 2);
	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n attempts to leverage kick $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to leverage kick you with $p!", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You try to leverage kick $N with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
	}
} // end leverage kick

Character.DoCommands.DoCranial = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("cranial");
	var chance;
	var damage;
	var [victim] = ch.GetCharacterHere(args);

	var wield = null;

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.Act("You don't know how to do that.");
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.Act("You aren't fighting anyone.");
	}
	else if (!args.ISEMPTY() && !victim)
	{
		ch.Act("You don't see them here.");
		return;
	}
	else if ((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Mace)
	{
		ch.Act("You must be wielding a mace in your main hand to cranial.");
	}
	else if (chance > Utility.NumberPercent())
	{
		ch.WaitState(skill.WaitTime);

		ch.Act("$n strikes $N on the head with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n strikes you on the head with $p.", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You strikes $N on the head with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, true, 1);

		damage = wield.DamageDice.Roll() + ch.DamageRoll;
		damage = ch.CheckEnhancedDamage(damage);
		Combat.Damage(ch, victim, damage, skill, wield.WeaponDamageType.Type);

		if (Utility.Random(1, 3) == 1)
		{
			if (victim.Protects && victim.Protects.length > 0)
			{
				victim.Act("$n resists passing out from the blow to $s head.", null, null, null, Character.ActType.ToRoom);
				victim.Act("You resist passing out from the blow to your head.");
			}
			else
			{
				victim.Act("$n passes out from the blow to $s head.", null, null, null, Character.ActType.ToRoom);
				victim.Act("You pass out from the blow to your head.");

				Combat.StopFighting(victim, true);
				var affect = new AffectData()

				affect.DisplayName = "cranial";
				affect.SkillSpell = skill;
				affect.Duration = 2;
				affect.AffectType = AffectData.AffectTypes.Skill;
				affect.Where = AffectData.AffectWhere.ToAffects;

				affect.Flags.SETBIT(AffectData.AffectFlags.Sleep);
				victim.Position = "Sleeping";
				victim.AffectToChar(affect);
			}
		}
		else
		{
			victim.WaitState(Game.PULSE_VIOLENCE);
		}
	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("$n attempts to strike $N on the head with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to strike you on the head with $p!", victim, wield, null, Character.ActType.ToVictim);
		ch.Act("You try to strike $N on the head with $p.", victim, wield, null, Character.ActType.ToChar);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
	}
} // end cranial

Character.DoCommands.DoEntrapWeapon = function(ch, argument)
{
	var victim = null;
	var obj = null;
	var wield = null;

	var chance, ch_weapon, vict_weapon, ch_vict_weapon;
	var skill = SkillSpell.SkillLookup("entrap weapon");

	if (skill == null || (chance = ch.GetSkillPercentage(skill) + 20) <= 1)
	{
		ch.send("You don't know how to entrap an opponents weapon.\n\r");
		return;
	}
	else if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if (!(wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) || wield.WeaponType != ItemData.WeaponTypes.Polearm)
	{
		ch.send("You must wield a polearm to entrap an opponents weapon.\n\r");
		return;
	}

	else if (ch.IsAffected(AffectData.AffectFlags.Blind))
	{
		ch.Act("You can't see the person to entrap $s weapon!", victim, null, null, Character.ActType.ToChar);
		return;
	}
	else if (!(obj = victim.Equipment[ItemData.WearSlotIDs.Wield]) && !(obj = victim.Equipment[ItemData.WearSlotIDs.DualWield]))
	{
		ch.send("Your opponent is not wielding a weapon.\n\r");
		return;
	}
	else
	{
		/* find weapon skills */
		ch_weapon = ch.GetSkillPercentage(wield.WeaponType);
		vict_weapon = victim.GetSkillPercentage(obj.WeaponType);
		ch_vict_weapon = ch.GetSkillPercentage(obj.WeaponType);

		/* skill */
		chance = (chance + ch_weapon) / 2;
		chance = (chance + ch_vict_weapon) / 2;

		/* level */
		chance += (ch.Level - victim.Level);

		/* and now the entrap */
		if (Utility.NumberPercent() < chance)
		{
			ch.WaitState(skill.WaitTime);
			if (obj.extraFlags.ISSET(ExtraFlags.NoRemove) || obj.extraFlags.ISSET(ExtraFlags.NoDisarm) || victim.IsAffected(SkillSpell.SkillLookup("spiderhands")))
			{
				ch.Act("$S weapon won't budge!", victim, null, null, Character.ActType.ToChar);
				ch.Act("$n tries to entrap your weapon, but it won't budge!", victim, null, null, Character.ActType.ToVictim);
				ch.Act("$n tries to entrap $N's weapon, but it won't budge.", victim, null, null, Character.ActType.ToRoomNotVictim);
				return;
			}

			ch.Act("$n ENTRAPS your weapon!", victim, null, null, Character.ActType.ToVictim);
			ch.Act("You entraps $N's weapon!", victim, null, null, Character.ActType.ToChar);
			ch.Act("$n entraps $N's weapon!", victim, null, null, Character.ActType.ToRoomNotVictim);

			//victim.Equipment[victim.GetEquipmentWearSlot(obj).id] = null;
			victim.RemoveEquipment(obj, false, false);

			if (!obj.extraFlags.ISSET(ExtraFlags.NoDrop) && !obj.extraFlags.ISSET(ExtraFlags.Inventory))
			{
				if (victim.Inventory.Contains(obj))
					victim.Inventory.Remove(obj);

				victim.Room.items.Insert(0, obj);
				obj.Room = victim.Room;
				obj.CarriedBy = null;
				if (victim.IsNPC && victim.Wait == 0 && victim.CanSee(obj))
				{
					if (victim.GetItem(obj, null))
						victim.WearItem(obj);

				}
			}

			ch.CheckImprove(skill, true, 1);
		}
		else
		{
			ch.WaitState(skill.WaitTime);
			ch.Act("You fail to entrap $N's weapon.", victim, null, null, Character.ActType.ToChar);
			ch.Act("$n tries to entrap your weapon, but fails.", victim, null, null, Character.ActType.ToVictim);
			ch.Act("$n tries to entrap $N's weapon, but fails.", victim, null, null, Character.ActType.ToRoomNotVictim);
			ch.CheckImprove(skill, false, 1);
		}
	}
	return;
}


Character.DoCommands.DoStripWeapon = function(ch, argument)
{
	var victim = null;
	var obj = null;
	var wield = null;

	var chance, ch_weapon, vict_weapon, ch_vict_weapon;
	var skill = SkillSpell.SkillLookup("strip weapon");

	if (skill == null || (chance = ch.GetSkillPercentage(skill) + 20) <= 1)
	{
		ch.send("You don't know how to strip an opponents weapon.\n\r");
		return;
	}
	else if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || (wield.WeaponType != ItemData.WeaponTypes.Whip && wield.WeaponType != ItemData.WeaponTypes.Flail))
		&& ((wield = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || (wield.WeaponType != ItemData.WeaponTypes.Whip && wield.WeaponType != ItemData.WeaponTypes.Flail)))
	{
		ch.send("You must wield a whip or flail to strip an opponents weapon.\n\r");
		return;
	}

	else if (ch.IsAffected(AffectData.AffectFlags.Blind))
	{
		ch.Act("You can't see $N to strip $s weapon!", victim, null, null, Character.ActType.ToChar);
		return;
	}
	else if (!(obj = victim.Equipment[ItemData.WearSlotIDs.Wield]) && !(obj = victim.Equipment[ItemData.WearSlotIDs.DualWield]))
	{
		ch.send("Your opponent is not wielding a weapon.\n\r");
		return;
	}
	else
	{
		/* find weapon skills */
		ch_weapon = ch.GetSkillPercentage((wield.WeaponType));
		vict_weapon = victim.GetSkillPercentage((objobj.WeaponType));
		ch_vict_weapon = ch.GetSkillPercentage((obj.WeaponType));

		/* skill */
		chance = (chance + ch_weapon) / 2;
		chance = (chance + ch_vict_weapon) / 2;

		/* level */
		chance += (ch.Level - victim.Level);

		/* and now the entrap */
		if (Utility.NumberPercent() < chance)
		{
			ch.WaitState(skill.WaitTime);
			if (obj.extraFlags.ISSET(ExtraFlags.NoRemove) || obj.extraFlags.ISSET(ExtraFlags.NoDisarm) || victim.IsAffected(SkillSpell.SkillLookup("spiderhands")))
			{
				ch.Act("$S weapon won't budge!", victim, null, null, Character.ActType.ToChar);
				ch.Act("$n tries to strip your weapon, but it won't budge!", victim, null, null, Character.ActType.ToVictim);
				ch.Act("$n tries to strip $N's weapon, but it won't budge.", victim, null, null, Character.ActType.ToRoomNotVictim);
				return;
			}

			ch.Act("$n STRIPS your weapon!", victim, null, null, Character.ActType.ToVictim);
			ch.Act("You strip $N's weapon!", victim, null, null, Character.ActType.ToChar);
			ch.Act("$n strips $N's weapon!", victim, null, null, Character.ActType.ToRoomNotVictim);

			//victim.Equipment[victim.GetEquipmentWearSlot(obj).id] = null;
			victim.RemoveEquipment(obj, false, false);

			if (!obj.extraFlags.ISSET(ExtraFlags.NoDrop) && !obj.extraFlags.ISSET(ExtraFlags.Inventory))
			{
				if (victim.Inventory.Contains(obj))
					victim.Inventory.Remove(obj);

				victim.Room.items.Insert(0, obj);
				obj.Room = victim.Room;
				obj.CarriedBy = null;
				if (victim.IsNPC && victim.Wait == 0 && victim.CanSee(obj))
				{
					if (victim.GetItem(obj, null))
						victim.WearItem(obj);

				}
			}

			ch.CheckImprove(skill, true, 1);
		}
		else
		{
			ch.WaitState(skill.WaitTime);
			ch.Act("You fail to strip $N's weapon.", victim, null, null, Character.ActType.ToChar);
			ch.Act("$n tries to strip your weapon, but fails.", victim, null, null, Character.ActType.ToVictim);
			ch.Act("$n tries to strip $N's weapon, but fails.", victim, null, null, Character.ActType.ToRoomNotVictim);
			ch.CheckImprove(skill, false, 1);
		}
	}
	return;
}


Character.DoCommands.DoHookWeapon = function(ch, argument)
{
	var victim = null;
	var obj = null;
	var wield = null;

	var chance, ch_weapon, vict_weapon, ch_vict_weapon;
	var skill = SkillSpell.SkillLookup("hook weapon");

	if (skill == null || (chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to hook an opponents weapon.\n\r");
		return;
	}
	else if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Axe)
		&& ((wield = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || wield.WeaponType != ItemData.WeaponTypes.Axe))
	{
		ch.send("You must wield an axe to hook an opponents weapon.\n\r");
		return;
	}

	else if (ch.IsAffected(AffectData.AffectFlags.Blind))
	{
		ch.Act("You can't see $N to hook $s weapon!", victim, null, null, Character.ActType.ToChar);
		return;
	}
	else if (!(obj = victim.Equipment[ItemData.WearSlotIDs.Wield]) && !(obj = victim.Equipment[ItemData.WearSlotIDs.DualWield]))
	{
		ch.send("Your opponent is not wielding a weapon.\n\r");
		return;
	}
	else
	{
		/* find weapon skills */
		ch_weapon = ch.GetSkillPercentage((wield.WeaponType));
		vict_weapon = victim.GetSkillPercentage((obj.WeaponType));
		ch_vict_weapon = ch.GetSkillPercentage((obj.WeaponType));

		/* skill */
		chance = (chance + ch_weapon) / 2;
		chance = (chance + ch_vict_weapon) / 2;

		/* level */
		chance += (ch.Level - victim.Level);

		/* and now the entrap */
		if (Utility.NumberPercent() < chance)
		{
			ch.WaitState(skill.WaitTime);
			if (obj.extraFlags.ISSET(ExtraFlags.NoRemove) || obj.extraFlags.ISSET(ExtraFlags.NoDisarm) || victim.IsAffected(SkillSpell.SkillLookup("spiderhands")))
			{
				ch.Act("$S weapon won't budge!", victim, null, null, Character.ActType.ToChar);
				ch.Act("$n tries to hook your weapon, but it won't budge!", victim, null, null, Character.ActType.ToVictim);
				ch.Act("$n tries to hook $N's weapon, but it won't budge.", victim, null, null, Character.ActType.ToRoomNotVictim);
				return;
			}

			ch.Act("$n HOOKS your weapon!", victim, null, null, Character.ActType.ToVictim);
			ch.Act("You hook $N's weapon!", victim, null, null, Character.ActType.ToChar);
			ch.Act("$n hooks $N's weapon!", victim, null, null, Character.ActType.ToRoomNotVictim);

			//victim.Equipment[victim.GetEquipmentWearSlot(obj).id] = null;
			victim.RemoveEquipment(obj, false, false);

			if (!obj.extraFlags.ISSET(ExtraFlags.NoDrop) && !obj.extraFlags.ISSET(ExtraFlags.Inventory))
			{
				if (victim.Inventory.Contains(obj))
					victim.Inventory.Remove(obj);

				victim.Room.items.Insert(0, obj);
				obj.Room = victim.Room;
				obj.CarriedBy = null;
				if (victim.IsNPC && victim.Wait == 0 && victim.CanSee(obj))
				{
					if (victim.GetItem(obj, null))
						victim.WearItem(obj);

				}
			}

			ch.CheckImprove(skill, true, 1);
		}
		else
		{
			ch.WaitState(skill.WaitTime);
			ch.Act("You fail to hook $N's weapon.", victim, null, null, Character.ActType.ToChar);
			ch.Act("$n tries to hook your weapon, but fails.", victim, null, null, Character.ActType.ToVictim);
			ch.Act("$n tries to hook $N's weapon, but fails.", victim, null, null, Character.ActType.ToRoomNotVictim);
			ch.CheckImprove(skill, false, 1);
		}
	}
	return;
}


Character.DoCommands.DoWeaponBreaker = function(ch, argument)
{
	var victim = null;
	var obj = null;
	var wield = null;

	var chance, ch_weapon, vict_weapon, ch_vict_weapon;
	var skill = SkillSpell.SkillLookup("weapon breaker");

	if (skill == null || (chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to break an opponents weapon like that.\n\r");
		return;
	}
	else if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Axe)
		&& ((wield = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || wield.WeaponType != ItemData.WeaponTypes.Axe))
	{
		ch.send("You must wield an axe to break an opponents weapon.\n\r");
		return;
	}

	else if (ch.IsAffected(AffectData.AffectFlags.Blind))
	{
		ch.Act("You can't see $N to break $s weapon!", victim, null, null, Character.ActType.ToChar);
		return;
	}
	else if ((!(obj = victim.Equipment[ItemData.WearSlotIDs.Wield]) || obj.Durability == 0) && 
		(!(obj = victim.Equipment[ItemData.WearSlotIDs.DualWield]) || obj.Durability == 0))
	{
		ch.send("Your opponent is not wielding a weapon you can break.\n\r");
		return;
	}
	else
	{
		/* find weapon skills */
		ch_weapon = ch.GetSkillPercentage((wield.WeaponType));
		vict_weapon = victim.GetSkillPercentage((obj.WeaponType));
		ch_vict_weapon = ch.GetSkillPercentage((obj.WeaponType));

		/* skill */
		chance = (chance + ch_weapon) / 2;
		chance = (chance + ch_vict_weapon) / 2;

		/* level */
		chance += (ch.Level - victim.Level);

		/* and now the break */
		if (Utility.NumberPercent() < chance)
		{
			ch.WaitState(skill.WaitTime);


			ch.Act("$n breaks your weapon with $s axe!", victim, null, null, Character.ActType.ToVictim);
			ch.Act("You break $N's with your axe!", victim, null, null, Character.ActType.ToChar);
			ch.Act("$n breaks $N's weapon with $s axe!", victim, null, null, Character.ActType.ToRoomNotVictim);

			obj.Durability = 0;

			ch.CheckImprove(skill, true, 1);
		}
		else
		{
			ch.WaitState(skill.WaitTime);
			ch.Act("You fail to break $N's weapon.", victim, null, null, Character.ActType.ToChar);
			ch.Act("$n tries to break your weapon, but fails.", victim, null, null, Character.ActType.ToVictim);
			ch.Act("$n tries to break $N's weapon, but fails.", victim, null, null, Character.ActType.ToRoomNotVictim);
			ch.CheckImprove(skill, false, 1);
		}
	}
	return;
} // end weapon breaker

Character.DoCommands.DoDent = function(ch, argument)
{
	var victim = null;
	var wield = null;

	var chance, ch_weapon;
	var skill = SkillSpell.SkillLookup("dent");

	if (skill == null || (chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to dent an opponents armor.\n\r");
		return;
	}
	else if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	else if (((wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) == null || wield.WeaponType != ItemData.WeaponTypes.Mace)
		&& ((wield = ch.Equipment[ItemData.WearSlotIDs.DualWield]) == null || wield.WeaponType != ItemData.WeaponTypes.Mace))
	{
		ch.send("You must wield a mace to dent an opponents armor.\n\r");
		return;
	}
	else if (victim.Equipment.Keys.Count == 0 || victim.Equipment.All(kvp => (kvp.Value == null || !kvp.Value.ItemType.ISSET(ItemTypes.Armor)) 
	&& kvp.Value.Durability > 0))
	{
		ch.send("They aren't wearing any armor for you to dent.\n\r");
		return;
	}
	else
	{
        var objs = [];
        for(var key in victim.Equipment) {
            var item = victim.Equipment[key];
            if(item.ItemTypes.ISSET(ItemData.ItemTypes.Armor)) {
                objs.push(item);
            }
        }
		var obj =  objs.SelectRandom();
		if(obj == null)
		{
			ch.send("You couldn't find any armor to dent.\n\r");
			return;
		}
		/* find weapon skills */
		ch_weapon = ch.GetSkillPercentage((wield.WeaponType));

		/* skill */
		chance = (chance + ch_weapon) / 2;

		/* level */
		chance += (ch.Level - victim.Level);

		/* and now the break */
		if (Utility.NumberPercent() < chance)
		{
			ch.WaitState(skill.WaitTime);



			ch.Act("$n dents and breaks $p with $s mace!", victim, obj, null, Character.ActType.ToVictim);
			ch.Act("You dent and breaks $N's $p with your mace!", victim, obj, null, Character.ActType.ToChar);
			ch.Act("$n dents and breaks $N's $p with $s mace!", victim, obj, null, Character.ActType.ToRoomNotVictim);

			obj.Durability = 0;

			ch.CheckImprove(skill, true, 1);
		}
		else
		{
			ch.WaitState(skill.WaitTime);
			ch.Act("You fail to dent and break $N's $p.", victim, obj, null, Character.ActType.ToChar);
			ch.Act("$n tries to dent and break $p, but fails.", victim, obj, null, Character.ActType.ToVictim);
			ch.Act("$n tries to dent break $N's $p, but fails.", victim, obj, null, Character.ActType.ToRoomNotVictim);
			ch.CheckImprove(skill, false, 1);
		}
	}
	return;
} // end dent