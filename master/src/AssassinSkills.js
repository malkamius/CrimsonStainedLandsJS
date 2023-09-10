const PhysicalStats = require("./PhysicalStats");
const Utility = require("./Utility");
const Character = require("./Character");
const ItemData = require("./ItemData");
const Combat = require("./Combat");
const SkillSpell = require("./SkillSpell");
const AffectData = require("./AffectData");
const DamageMessage = require("./DamageMessage");
const RoomData = require("./RoomData");
const ItemTemplateData = require("./ItemTemplateData");

Character.DoCommands.DoWheelKick = function(ch, args)
{
	var victim;
	var dam;
	var skillPercent = 0;

	var skill = SkillSpell.SkillLookup("wheel kick");

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (skillPercent > Utility.NumberPercent())
	{
		dam = (ch.Level) / 2;
		dam += Utility.Random(ch.Level / 2, ch.Level);
		dam += Utility.Random(ch.Level / 5, ch.Level / 4);

		Combat.Damage(ch, victim, dam, skill);

		ch.CheckImprove(skill, true, 1);

	}
	else
	{
		Combat.Damage(ch, victim, 0, skill);
		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoSweepKick = function(ch, args)
{
	var victim;
	var dam;
	var skillPercent = 0;

	var skill = SkillSpell.SkillLookup("sweep kick");

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (skillPercent > Utility.NumberPercent())
	{
		dam = (ch.Level) / 2;
		dam += Utility.Random(ch.Level / 2, ch.Level);
		dam += Utility.Random(ch.Level / 5, ch.Level / 4);

		victim.WaitState(Game.PULSE_VIOLENCE);
        victim.Position = "Sitting";
        Combat.CheckCheapShotRoom(ch, victim);
		Combat.Damage(ch, victim, dam, skill);
		ch.CheckImprove(skill, true, 1);

	}
	else
	{
		Combat.Damage(ch, victim, 0, skill);
		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoSideKick = function(ch, args)
{
	var victim;
	var dam;
	var skillPercent = 0;

	var skill = SkillSpell.SkillLookup("side kick");

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (skillPercent > Utility.NumberPercent())
	{
		dam = (ch.Level) / 2;
		dam += Utility.Random(ch.Level / 2, ch.Level);
		dam += Utility.Random(ch.Level / 5, ch.Level / 4);
		dam = dam * 5 / 4; //adding 25% to previous kick

		Combat.Damage(ch, victim, dam, skill);
		ch.CheckImprove(skill, true, 1);

	}
	else
	{
		Combat.Damage(ch, victim, 0, skill);
		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoScissorsKick = function(ch, args)
{
	var victim;
	var dam;
	var skillPercent = 0;

	var skill = SkillSpell.SkillLookup("scissors kick");

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (skillPercent > Utility.NumberPercent())
	{
		dam = (ch.Level) / 2;
		dam += Utility.Random(ch.Level / 2, ch.Level);
		dam += Utility.Random(ch.Level / 5, ch.Level / 4);
		dam = dam * 3 / 2;

		victim.WaitState(Game.PULSE_VIOLENCE);

		Combat.Damage(ch, victim, dam, skill);
		ch.CheckImprove(skill, true, 1);

	}
	else
	{
		Combat.Damage(ch, victim, 0, skill);
		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoMuleKick = function(ch, args)
{
	var victim = null;
	var dam;
	var skillPercent = 0;

	var skill = SkillSpell.SkillLookup("mule kick");

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	for (var other of ch.Room.Characters)
	{
		if (other.Fighting == ch && ch.Fighting != other)
		{
			victim = other;
			break;
		}
	}

	if (victim == null)
	{
		ch.send("There is no one fighting you from behind or the side.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (skillPercent > Utility.NumberPercent())
	{
		dam = (ch.Level) / 2;
		dam += Utility.Random(ch.Level / 2, ch.Level);
		dam += Utility.Random(ch.Level / 5, ch.Level / 4);
		dam = dam * 9 / 5;

		Combat.Damage(ch, victim, dam, skill);
		ch.CheckImprove(skill, true, 1);

	}
	else
	{
		Combat.Damage(ch, victim, 0, skill);
		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoCrescentKick = function(ch, args)
{
	var victim;
	var dam;
	var skillPercent = 0;

	var skill = SkillSpell.SkillLookup("crescent kick");

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (skillPercent > Utility.NumberPercent())
	{
		dam = ch.Level;
		dam += Utility.Random(ch.Level / 2, ch.Level);
		dam += Utility.Random(ch.Level / 5, ch.Level / 4);
		dam = dam * 2;


		Combat.Damage(ch, victim, dam, skill);
		ch.CheckImprove(skill, true, 1);

	}
	else
	{
		Combat.Damage(ch, victim, 0, skill);
		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoAxeKick = function(ch, args)
{
	var victim;
	var dam;
	var skillPercent = 0;

	var skill = SkillSpell.SkillLookup("axe kick");

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (skillPercent > Utility.NumberPercent())
	{
		dam = ch.Level;
		dam += Utility.Random(ch.Level / 2, ch.Level);
		dam += Utility.Random(ch.Level / 5, ch.Level / 4);
		dam = dam * 9 / 4;


		Combat.Damage(ch, victim, dam, skill);
		ch.CheckImprove(skill, true, 1);

		if (!victim.IsAffected(skill))
		{
			var affect = new AffectData();
			affect.DisplayName = "axe kick";
			affect.AffectType = AffectData.AffectTypes.Skill;
			affect.Where = AffectData.AffectWhere.ToAffects;
			affect.Location = AffectData.ApplyTypes.Strength;
			affect.Duration = 5;
			affect.Modifier = -5;
			ch.AffectToChar(affect);

			affect.Location = AffectData.ApplyTypes.Dexterity;
			affect.EndMessage = "Your shoulder feels better.";
			affect.EndMessageToRoom = "$n's shoulder looks better.";
			ch.AffectToChar(affect);

		}
	}
	else
	{
		Combat.Damage(ch, victim, 0, skill);
		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoMountainStormKick = function(ch, args)
{
	var victim;
	var dam;
	var skillPercent = 0;

	var skill = SkillSpell.SkillLookup("mountain storm kick");

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (skillPercent > Utility.NumberPercent())
	{
		dam = ch.Level;
		dam += Utility.Random(ch.Level / 2, ch.Level);
		dam += Utility.Random(ch.Level / 5, ch.Level / 4);
		dam = dam * 5 / 2;

		victim.WaitState(Game.PULSE_VIOLENCE);

		Combat.Damage(ch, victim, dam, skill);
		ch.CheckImprove(skill, true, 1);
	}
	else
	{
		Combat.Damage(ch, victim, 0, skill);
		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoDoubleSpinKick = function(ch, args)
{
	var victim;
	var dam;
	var skillPercent = 0;

	var skill = SkillSpell.SkillLookup("double spin kick");

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if ((victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (skillPercent > Utility.NumberPercent())
	{
		dam = ch.Level;
		dam += Utility.Random(ch.Level / 2, ch.Level);
		dam += Utility.Random(ch.Level / 5, ch.Level / 4);
		dam = dam * 11 / 4;


		Combat.Damage(ch, victim, dam, skill);

		dam = ch.Level;
		dam += Utility.Random(ch.Level / 2, ch.Level);
		dam += Utility.Random(ch.Level / 5, ch.Level / 4);
		dam = dam * 11 / 4;

		Combat.Damage(ch, victim, dam, skill);

		ch.CheckImprove(skill, true, 1);


	}
	else
	{
		Combat.Damage(ch, victim, 0, skill);
		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoRisingPhoenixKick = function(ch, args)
{
	var dam;
	var skillPercent = 0;

	var skill = SkillSpell.SkillLookup("rising phoenix kick");

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if (ch.Room.Characters.Count <= 1)
	{
		ch.send("There is no one here to fight.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (skillPercent > Utility.NumberPercent())
	{
		for (var victim of Utility.CloneArray(ch.Room.Characters))
		{
			if (victim != ch && !victim.IsSameGroup(ch))
			{
				dam = ch.Level;
				dam += Utility.Random(ch.Level / 2, ch.Level);
				dam += Utility.Random(ch.Level / 5, ch.Level / 4);
				dam = dam * 3;

				victim.WaitState(Game.PULSE_VIOLENCE);

				Combat.Damage(ch, victim, dam, skill);
			}
		}
		ch.CheckImprove(skill, true, 1);
	}
	else
	{
		ch.Act("Your attempt to Rising Pheonix Kick failed");
		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoCaltraps = function(ch, args)
{
	var victim = null;
	var dam;
	var skillPercent = 0;

	var skill = SkillSpell.SkillLookup("caltraps");

	if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if (!args.ISEMPTY() && (victim = ch.GetCharacterFromRoomByName(args)) == null)
	{
		ch.send("You don't see them here.\n\r");
		return;
	}
	else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}

	if (victim == null)
	{
		ch.send("You have no victim.\n\r");
		return;
	}

	ch.WaitState(skill.WaitTime);
	if (skillPercent > Utility.NumberPercent())
	{
		dam = Utility.dice(2, 5, 15);

		Combat.Damage(ch, victim, dam, skill);

		ch.CheckImprove(skill, true, 1);

		if (!victim.IsAffected(skill))
		{
			var affect = new AffectData();
			affect.DisplayName = "caltraps";
			affect.AffectType = AffectData.AffectTypes.Skill;
			affect.Where = AffectData.AffectWhere.ToAffects;
			affect.Location = AffectData.ApplyTypes.Dexterity;
			affect.Duration = 3;
			affect.Modifier = -3;
			affect.EndMessage = "Your feet feel better.";
			affect.EndMessageToRoom = "$n stops limping.";
			victim.AffectToChar(affect);

		}
	}
	else
	{
		Combat.Damage(ch, victim, 0, skill);
		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoEndure = function(ch, args)
{
	var affect;
	var skill = SkillSpell.SkillLookup("endure");
	var skillPercent;

	if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if ((affect = ch.FindAffect(skill)) != null)
	{
		ch.send("You are already enduring!\n\r");
		return;
	}

	else if (ch.ManaPoints < 20)
	{
		ch.send("You don't have enough mana to endure.\n\r");
		return;
	}

	else
	{
		ch.WaitState(skill.WaitTime);
		if (skillPercent > Utility.NumberPercent())
		{
			affect = new AffectData();
			affect.SkillSpell = skill;
			affect.Level = ch.Level;
			affect.Location = AffectData.ApplyTypes.SavingSpell;
			affect.Duration = 8;
			affect.Modifier = -20;
			affect.DisplayName = skill.name;
			affect.AffectType = AffectData.AffectTypes.Skill;
			ch.AffectToChar(affect);

			affect = new AffectData();
			affect.SkillSpell = skill;
			affect.Level = ch.Level;
			affect.Location = AffectData.ApplyTypes.AC;
			affect.Duration = 8;
			affect.Modifier = -20;
			affect.DisplayName = skill.name;
			affect.EndMessage = "You are no longer enduring.\n\r";
			affect.AffectType = AffectData.AffectTypes.Skill;
			ch.AffectToChar(affect);

			ch.ManaPoints -= 20;


			ch.send("You feel able to persevere better.\n\r");
			ch.CheckImprove(skill, true, 1);
		}
		else
		{
			ch.send("You try to endure but fail.\n\r");
			ch.CheckImprove(skill, false, 1);
		}
	}
}
Character.DoCommands.DoOwaza = function(ch, args)
{
	var skill = SkillSpell.SkillLookup("owaza");
	var chance;
	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}

	if (!ch.Fighting)
	{
		ch.send("You aren't fighting anyone.\n\r");
		return;
	}
	if (ch.IsAffected(skill))
	{
		var affect = ch.FindAffect(skill);
		ch.AffectFromChar(affect, AffectData.AffectRemoveReason.Other);
	}

	ch.WaitState(skill.WaitTime);

	if (ch.Fighting.HitPoints / ch.Fighting.MaxHitPoints * 100 <= 50)
		chance += 20;
	else if (ch.Fighting.HitPoints / ch.Fighting.MaxHitPoints * 100 <= 60)
		chance += 10;
	else if (ch.Fighting.HitPoints / ch.Fighting.MaxHitPoints * 100 <= 70)
		chance += 5;
	else if (ch.Fighting.HitPoints / ch.Fighting.MaxHitPoints * 100 >= 80)
		chance += -5;

	if (chance > Utility.NumberPercent())
	{
		var affect = new AffectData();
		affect.SkillSpell = skill;
		affect.Level = ch.Level;
		affect.Duration = 1;
		affect.Frequency = Frequency.Violence;
		affect.Hidden = true;
		affect.DisplayName = skill.name;
		affect.AffectType = AffectData.AffectTypes.Skill;
		ch.AffectToChar(affect);

		ch.send("You have successfully prepared an owaza attack.\n\r");
		ch.CheckImprove(skill, true, 1);
	}
	else
	{
		ch.send("You try to owaza but fail.\n\r");
		ch.Act("$n tries to do somee fancy moves but fails.\n\r", null, null, null, Character.ActType.ToRoom);
		ch.CheckImprove(skill, false, 1);
	}
}

Character.DoCommands.DoBindWounds = function(ch, args)
{
	var af;
	var skill = SkillSpell.SkillLookup("bind wounds");

	if (ch.GetSkillPercentage(skill) <= 1)
	{
		ch.send("Huh?\n\r");
		return;
	}

	if (ch.IsAffected(skill))
	{
		ch.send("You can't apply more aid yet.\n\r");
		return;
	}
	if (ch.ManaPoints < 15)
	{
		ch.send("You don't have the mana.\n\r");
		return;
	}

	if (Utility.NumberPercent() > ch.GetSkillPercentage(skill))
	{
		ch.send("You fail to focus on your injuries.\n\r");
		ch.Act("$n fails to focus on $s injuries and bind $s wounds.", null, null, null, Character.ActType.ToRoom);
		ch.ManaPoints -= 12;
		ch.CheckImprove(skill, false, 3);
		return;
	}

	ch.ManaPoints -= 25;

	ch.Act("$n focuses on $s injuries and binds $s wounds.", null, null, null, Character.ActType.ToRoom);
	ch.send("You focus on your injuries and bind your wounds.\n\r");
	ch.send("You feel better.\n\r");

	ch.HitPoints += ch.MaxHitPoints * 0.2;
	ch.HitPoints = Math.min(ch.HitPoints, ch.MaxHitPoints);

	if (Utility.NumberPercent() < Math.max(1, ch.Level / 4) && ch.IsAffected(AffectData.AffectFlags.Plague))
	{
		ch.AffectFromChar(ch.FindAffect(SkillSpell.SkillLookup("plague")), AffectData.AffectRemoveReason.Cleansed);
		ch.Act("The sores on $n's body vanish.\n\r", null, null, null, Character.ActType.ToRoom);
		ch.send("The sores on your body vanish.\n\r");
	}

	if (Utility.NumberPercent() < Math.max(1, (ch.Level)) && ch.IsAffected(AffectData.AffectFlags.Blind))
	{
		ch.AffectFromChar(ch.FindAffect(SkillSpell.SkillLookup("blindness")), AffectData.AffectRemoveReason.Cleansed);
		ch.send("Your vision returns!\n\r");
	}

	if (Utility.NumberPercent() < Math.max(1, ch.Level / 2) && ch.IsAffected(AffectData.AffectFlags.Poison))
	{
		ch.AffectFromChar(ch.FindAffect(SkillSpell.SkillLookup("poison")), AffectData.AffectRemoveReason.Cleansed);
		ch.send("A warm feeling goes through your body.\n\r");
		ch.Act("$n looks better.", null, null, null, Character.ToRoom);
	}
	ch.CheckImprove(skill, true, 3);

	af = new AffectData();

	af.Where = AffectData.AffectWhere.ToAffects;
	af.SkillSpell = skill;
	af.Location = 0;
	af.Duration = 2;
	af.Modifier = 0;
	af.Level = ch.Level;
	af.AffectType = AffectData.AffectTypes.Skill;
	af.DisplayName = "bind wounds";
	af.EndMessage = "You feel ready to bind your wounds once more.";
	ch.AffectToChar(af);
	ch.WaitState(skill.WaitTime);
	return;
}

Character.DoCommands.DoDetectHidden = function(ch, args)
{
    var affect;
    var number = 0;
    if ((number = ch.GetSkillPercentage("detect hidden") + 20) <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
    }
    else if (ch.IsAffected(AffectData.AffectFlags.DetectHidden))
    {
        ch.send("You are already as alert as you can be.\n\r");
    }
    else if (Utility.NumberPercent() > number)
    {
        ch.send("You peer into the shadows but your vision stays the same.\n\r");
        ch.CheckImprove("detect hidden", false, 2);
    }
    else
    {
        affect = new AffectData();
        affect.SkillSpell = SkillSpell.SkillLookup("detect hidden");
        affect.DisplayName = "detect hidden";
        affect.AffectType = AffectData.AffectTypes.Skill;
        affect.Level = ch.Level;
        affect.Location = AffectData.ApplyTypes.None;
        affect.Where = AffectData.AffectWhere.ToAffects;
        affect.Flags.SETBIT(AffectData.AffectFlags.DetectHidden);
        affect.Duration = 6;
        affect.EndMessage = "You can no longer see the hidden.\n\r";
        ch.AffectToChar(affect);

        ch.send("Your awareness improves.\n\r");
        ch.CheckImprove("detect hidden", true, 2);
    }
}

Character.DoCommands.DoHeightenedAwareness = function(ch, args)
{
    var affect;
    var number = 0;
    if ((number = ch.GetSkillPercentage("heightened awareness") + 20) <= 21)
    {
        ch.send("You don't know how to do that.\n\r");

    }
    else if (ch.IsAffected(AffectData.AffectFlags.DetectInvis))
    {
        ch.send("Your awareness is already heightened.\n\r");
        return;
    }
    else if (Utility.NumberPercent() > number)
    {
        ch.send("You fail to heighten your awareness.\n\r");
        ch.CheckImprove("heightened awareness", false, 2);
        return;
    }
    else
    {
        affect = new AffectData();
        affect.SkillSpell = SkillSpell.SkillLookup("heightened awareness");
        affect.DisplayName = "heightened awareness";
        affect.AffectType = AffectData.AffectTypes.Skill;
        affect.Level = ch.Level;
        affect.Location = AffectData.ApplyTypes.None;
        affect.Where = AffectData.AffectWhere.ToAffects;
        affect.Flags.SETBIT(AffectData.AffectFlags.DetectInvis);
        affect.Duration = 6;
        affect.EndMessage = "Your awareness lessens slightly.\n\r";
        ch.AffectToChar(affect);

        ch.send("Your awareness improves.\n\r");
        ch.CheckImprove("heightened awareness", true, 2);
    }
}

Character.DoCommands.DoHide = function(ch, args)
{
    var fog = SkillSpell.SkillLookup("faerie fog");
    var fire = SkillSpell.SkillLookup("faerie fire");

    if (ch.GetSkillPercentage("hide") <= 1)
    {
        ch.send("You don't know how to hide.\n\r");
        return;
    }

    if (ch.IsAffected(fog) || ch.IsAffected(fire) || ch.IsAffected(AffectData.AffectFlags.FaerieFire))
    {
        ch.send("You can't hide while glowing.\n\r");
        return;
    }

    if (!([RoomData.SectorTypes.City, 
            RoomData.SectorTypes.Inside, 
            RoomData.SectorTypes.Forest, 
            RoomData.SectorTypes.Cave, 
            RoomData.SectorTypes.Road]).indexOf(ch.Room.Sector) < 0)
    {
        ch.send("The shadows here are too natural to blend with.\n\r");
        return;
    }

    ch.send("You attempt to hide.\n\r");

    if (ch.IsAffected(AffectData.AffectFlags.Hide))
        return;

    if (Utility.NumberPercent() < ch.GetSkillPercentage("hide"))
    {
        ch.AffectedBy.SETBIT(AffectData.AffectFlags.Hide);
        ch.CheckImprove("hide", true, 3);
    }
    else
        ch.CheckImprove("hide", false, 3);

    return;
}

Character.DoCommands.DoSneak = function(ch, args)
{
    var af;
    var fog = SkillSpell.SkillLookup("faerie fog");
    var fire = SkillSpell.SkillLookup("faerie fire");

    if (ch.GetSkillPercentage("sneak") <= 1)
    {
        ch.send("You don't know how to sneak.\n\r");
        return;
    }

    if (ch.IsAffected(fog) || ch.IsAffected(fire) || ch.IsAffected(AffectData.AffectFlags.FaerieFire))
    {
        ch.send("You can't hide while glowing.\n\r");
        return;
    }

    ch.send("You attempt to move silently.\n\r");
    if (ch.IsAffected(AffectData.AffectFlags.Sneak))
        return;

    if (Utility.NumberPercent() < ch.GetSkillPercentage("sneak"))
    {
        ch.CheckImprove("sneak", true, 3);
        af = new AffectData();
        af.DisplayName = "sneak";
        af.Where = AffectData.AffectWhere.ToAffects;
        af.SkillSpell = SkillSpell.SkillLookup("sneak");
        af.AffectType = AffectData.AffectTypes.Skill;
        af.Level = ch.Level;
        af.Duration = ch.Level;
        af.Location = AffectData.ApplyTypes.None;
        af.Modifier = 0;
        af.Flags.SETBIT(AffectData.AffectFlags.Sneak);
        ch.AffectToChar(af);
        ch.send("You begin sneaking.\n\r");
    }
    else
        ch.CheckImprove("sneak", true, 3);

    return;
}

Character.DoCommands.DoStrangle = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("strangle");
    var chance;
    var dam;
    var [victim] = ch.GetCharacterHere(args)

    if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    if (args.ISEMPTY())
    {
        ch.send("Strangle who?\n\r");
        return;
    }
    else if (ch.Fighting != null)
    {
        ch.send("You're too busy fighting.\n\r");
        return;
    }
    else if (!args.ISEMPTY() && !victim)
    {
        ch.send("You don't see them here.\n\r");
        return;
    }
    else if (ch == victim)
    {
        ch.send("You can't strangle yourself.\n\r");
    }
    else if (victim.Protects && victim.Protects.length >= 0)
    {
        ch.send("You can't sneak up on them.\n\r");
    }
    else if (victim.IsAffected(AffectData.AffectFlags.Sleep))
    {
        ch.send("They are already asleep.\n\r");
        return;
    }
    else
    {
        ch.WaitState(skill.WaitTime);
        if (chance > Utility.NumberPercent())
        {
            ch.Act("$n strangles $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n strangles you.", victim, null, null, Character.ActType.ToVictim);
            ch.Act("You strangle $N.", victim, null, null, Character.ActType.ToChar);

            Combat.StopFighting(victim, true);
            victim.Position = "Sleeping";
            var affect = new AffectData();
            affect.DisplayName = "strangle";
            affect.Flags.SETBIT(AffectData.AffectFlags.Sleep);
            affect.Duration = 3;
            affect.Where = AffectData.AffectWhere.ToAffects;
            affect.SkillSpell = skill;
            affect.EndMessage = "You feel able to wake yourself up.";

            victim.AffectToChar(affect);

            ch.CheckImprove(skill, true, 1);
        }
        else
        {
            ch.Act("$n attempts to strangle $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n tries to strangle you!", victim, null, null, Character.ActType.ToVictim);
            ch.Act("You try to strangle $N.", victim, null, null, Character.ActType.ToChar);

            ch.CheckImprove(skill, false, 1);
            dam = Utility.Random(10, ch.Level);
            Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);
        }
    }
    return;
}

Character.DoCommands.DoBlindnessDust = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("blindness dust");
    var chance;


    if ((chance = ch.GetSkillPercentage(skill)) + 10 <= 11)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    ch.WaitState(skill.WaitTime);
    ch.Act("$n throws some blinding dust.", null, null, null, Character.ActType.ToRoom);
    ch.Act("You throw some blinding dust.", null, null, null, Character.ActType.ToChar);

    if (chance <= Utility.NumberPercent())
    {
        ch.CheckImprove(skill, false, 1);
        ch.Act("The blinding dust drifts away harmlessly.");
        ch.Act("The blinding dust drifts away harmlessly.", null, null, null, Character.ActType.ToRoom);
        return;
    }

    for (var victim of Utility.CloneArray(ch.Room.Characters))
    {
        if (victim.IsSameGroup(ch))
            continue;
        if (Combat.CheckIsSafe(ch, victim))
            continue;
        // if ((victim.ImmuneFlags.ISSET(DamageMessage.WeaponDamageTypes.Blind) || (victim.Form && victim.Form.ImmuneFlags.ISSET(DamageMessage.WeaponDamageTypes.Blind))) && !victim.IsAffected(AffectData.AffectFlags.Deafen))
        // {
        //     victim.Act("$n is immune to blindness.", null, null, null, Character.ActType.ToRoom);
        //     continue;
        // }
        if (victim.IsAffected(AffectData.AffectFlags.Blind))
        {
            ch.Act("$N is already blind.", victim);
        }

        if (chance > Utility.NumberPercent())
        {
            var affect = new AffectData();
            affect.DisplayName = "blindness dust";
            affect.Duration = 3;
            affect.Where = AffectData.AffectWhere.ToAffects;
            affect.Location = AffectData.ApplyTypes.Hitroll;
            affect.Modifier = -4;
            affect.SkillSpell = skill;
            affect.Flags.SETBIT(AffectData.AffectFlags.Blind);
            affect.EndMessage = "You can see again.";
            affect.EndMessageToRoom = "$n wipes the blinding dust out of $s eyes.";
            victim.AffectToChar(affect);
            victim.Act("$n is blinded by dust in their eyes!", null, null, null, Character.ActType.ToRoom);
        }
        if (victim.Fighting == null)
            Combat.multiHit(victim, ch);
    }
    ch.CheckImprove(skill, true, 1);

    return;
}

Character.DoCommands.DoPoisonDust = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("poison dust");
    var chance;


    if ((chance = ch.GetSkillPercentage(skill)) + 10 <= 11)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    ch.WaitState(skill.WaitTime);
    ch.Act("$n throws some poison dust.", null, null, null, Character.ActType.ToRoom);
    ch.Act("You throw some poison dust.", null, null, null, Character.ActType.ToChar);

    if (chance <= Utility.NumberPercent())
    {
        ch.CheckImprove(skill, false, 1);
        ch.Act("The poison dust drifts away harmlessly.");
        ch.Act("The poison dust drifts away harmlessly.", null, null, null, Character.ActType.ToRoom);
        return;
    }

    var skPoison = SkillSpell.SkillLookup("poison");

    for (var victim of Utility.CloneArray(ch.Room.Characters))
    {
        if (victim.IsSameGroup(ch))
            continue;
        if (Combat.CheckIsSafe(ch, victim))
            continue;
        if (victim.IsAffected(AffectData.AffectFlags.Poison))
        {
            ch.Act("$N is already poisoned.", victim);
        }

        if (chance > Utility.NumberPercent())
        {
            var affect = new AffectData();
            affect.DisplayName = "poison dust";
            affect.Duration = 3;
            affect.Where = AffectData.AffectWhere.ToAffects;
            affect.Location = AffectData.ApplyTypes.Hitroll;
            affect.Modifier = -4;
            affect.SkillSpell = skPoison;
            affect.Flags.SETBIT(AffectData.AffectFlags.Poison);
            affect.EndMessage = "You feel better.";
            affect.EndMessageToRoom = "$n recovers from $s poison.";
            victim.AffectToChar(affect);
            victim.Act("$n is poisoned by inhaling poison dust!", null, null, null, Character.ActType.ToRoom);
        }
        if (victim.Fighting == null && victim.Position != "Sleeping") {
            victim.Fighting = ch;
            Combat.ExecuteRound(victim);
        }
    }
    ch.CheckImprove(skill, true, 1);

    return;
}

Character.DoCommands.DoPoisonDagger = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("poison dagger");
    var chance;


    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    var ItemTemplate = ItemTemplateData.Templates[2966];
    if (!ItemTemplate)
    {
        ch.send("You fail.\n\r");
        return;
    }
    ch.WaitState(skill.WaitTime);
    ch.Act("$n crafts a poisonous dagger.", null, null, null, Character.ActType.ToRoom);
    ch.Act("You craft a poisonous dagger.", null, null, null, Character.ActType.ToChar);

    var dagger = new ItemData(ItemTemplate);

    var skPoison = SkillSpell.SkillLookup("poison");

    var affect = new AffectData();
    affect.Duration = -1;
    affect.Where = AffectData.AffectWhere.ToWeapon;
    affect.SkillSpell = skPoison;
    affect.Flags.SETBIT(AffectData.AffectFlags.Poison);
    dagger.Affects.unshift(affect);
    dagger.Level = ch.Level;
    dagger.DamageDice = [2, 6, 11];
    dagger.Timer = 15;

    ch.AddInventoryItem(dagger);

    ch.CheckImprove(skill, true, 1);

    return;
}

Character.DoCommands.DoThrow = function(ch, args)
{
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
    else if (Combat.CheckAcrobatics(ch, victim)) return;

    var skill = SkillSpell.SkillLookup("throw");
    ch.WaitState(skill.WaitTime);
    Combat.AssassinThrow(ch, victim);
}

Character.DoCommands.DoVanish = function(ch, args)
{

	var skill = SkillSpell.SkillLookup("vanish");
	var chance;
	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to do that.\n\r");
		return;
	}


	ch.WaitState(skill.WaitTime);
	if (chance > Utility.NumberPercent())
	{

		ch.Act("$n throws down a globe of dust, vanishing from sight.", null, null, null, Character.ActType.ToRoom);
		ch.Act("You throw down a globe of dust, vanishing from sight.", null, null, null, Character.ActType.ToChar);
		ch.CheckImprove(skill, true, 1);
		Combat.StopFighting(ch, true);

		if (Object.keys(ch.Room.Area.Rooms).length > 1)
		{
			var attempts = 0;
			var newroom = ch.Room.Area.Rooms.SelectRandom();
			while ((newroom == null || newroom == ch.Room || newroom.Flags.ISSET(RoomData.RoomFlags.Indoors) || newroom.Sector == RoomData.SectorTypes.Inside || !(ch.IsImmortal || ch.IsNPC || (ch.Level <= newroom.MaxLevel && ch.Level >= newroom.MinLevel))) && attempts <= 10)
			{
				newroom = ch.Room.Area.Rooms.SelectRandom();
				attempts++;
			}
			if (attempts < 10)
			{
				ch.RemoveCharacterFromRoom();
				ch.AddCharacterToRoom(newroom);
				//Character.DoLook(ch, "auto");
			} else {
				ch.send("You fail.\n\r");
			}
		}

	}
	else
	{
		ch.Act("$n throws down a globe of dust, but nothing happens.", null, null, null, Character.ActType.ToRoom);
		ch.Act("You throw down a globe of dust, but fail to vanish.", null, null, null, Character.ActType.ToChar);
		ch.CheckImprove(skill, false, 1);

	}
	return;
}