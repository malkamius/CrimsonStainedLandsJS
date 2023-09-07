const PhysicalStats = require("./PhysicalStats");
const Utility = require("./Utility");
const Character = require("./Character");
const ItemData = require("./ItemData");
const Combat = require("./Combat");
const SkillSpell = require("./SkillSpell");
const AffectData = require("./AffectData");
const DamageMessage = require("./DamageMessage");


Character.DoCommands.DoRescue = function(ch, args)
{
    var [torescue] = ch.GetCharacterHere(args);
    var victim = null;
    var skill = SkillSpell.SkillLookup("rescue");
    var chance = ch.GetSkillPercentage(skill) * .75;

    if (ch.IsNPC) chance = 80;

    if (chance <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    if (!torescue)
    {
        ch.send("You don't see them here.\n\r");
        return;
    }
    for (var other of ch.Room.Characters)
    {
        if (other.Fighting == torescue)
        {
            victim = other;
            break;
        }
    }

    if (victim == null)
    {
        ch.send("No one is fighting them.\n\r");
        return;
    }

    ch.WaitState(Game.PULSE_VIOLENCE);
    if (chance >= Utility.NumberPercent())
    {

        victim.Fighting = ch;
        ch.Act("$n rescues $N!", torescue, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n rescues you!", torescue, null, null, Character.ActType.ToVictim);
        ch.Act("You rescue $N!", torescue, null, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, true, 1);
    }
    else
    {
        ch.Act("$n tries to rescue $N, but fails.", torescue, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n tries to rescue you, but fails.", torescue, null, null, Character.ActType.ToVictim);
        ch.Act("You try to rescue $N, but fail.", torescue, null, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, false, 1);
    }
}

Character.DoCommands.DoFeint = function(ch, args)
{
    var victim;

    var skillPercent = 0;
    var skill = SkillSpell.SkillLookup("feint");
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
    if ((aff = victim.FindAffect(skill)) != null)
    {
        ch.send("They are already being misled.\n\r");
        return;
    }

    if (CheckIsSafe(ch, victim)) return;

    ch.WaitState(skill.waitTime);

    /* stats */
    chance += ch.GetCurrentStat(PhysicalStatTypes.Dexterity);
    chance -= 2 * victim.GetCurrentStat(PhysicalStatTypes.Dexterity);

    /* speed  */
    if (ch.Flags.ISSET(Character.ActFlags.Fast) || ch.IsAffected(Character.AffectFlags.Haste))
        chance += 10;
    if (victim.Flags.ISSET(Character.ActFlags.Fast) || victim.IsAffected(Character.AffectFlags.Haste))
        chance -= 30;

    /* level */
    chance += (ch.Level - victim.Level) * 2;

    /* sloppy hack to prevent false zeroes */
    if (chance % 5 == 0)
        chance += 1;


    if (chance > Utility.NumberPercent())
    {

        ch.Act("$N is misled by $n's feint!", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n feints your next attack.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You distract $N with a cunning feint.", null, null, Character.ActType.ToChar);

        var newAffect = new AffectData();

        newAffect.Duration = 2;
        newAffect.Frequency = Frequency.Violence;
        newAffect.DisplayName = "feint";
        newAffect.Modifier = 0;
        newAffect.Location = ApplyTypes.None;
        newAffect.SkillSpell = skill;
        newAffect.AffectType = AffectTypes.Skill;
        victim.AffectToChar(newAffect);

        ch.CheckImprove(skill, true, 1);
    }
    else
    {
        ch.Act("$n fails to mislead $N with $s feint!", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n attempts to distract you, but fails to mislead your next attack.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You fail to distract $N from their next attack.", victim, null, null, Character.ActType.ToChar);

        ch.CheckImprove(skill, false, 1);
    }
}

Character.DoCommands.DoBerserk = function(ch, args)
{
    var affect;
    var skill = SkillSpell.SkillLookup("berserk");
    var skillPercent;

    if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("Huh?\n\r");
        return;
    }

    if ((affect = ch.FindAffect(skill)) != null)
    {
        ch.send("You are already enraged!\n\r");
        return;
    }

    else if (ch.ManaPoints < 20)
    {
        ch.send("You don't have enough mana to enrage.\n\r");
        return;
    }

    else
    {
        ch.WaitState(skill.waitTime);
        if (skillPercent > Utility.NumberPercent())
        {
            affect = new AffectData();
            affect.SkillSpell = skill;
            affect.Level = ch.Level;
            affect.Location = ApplyTypes.Damroll;
            affect.Duration = 2;
            affect.Modifier = +5;
            affect.DisplayName = "berserk";
            affect.AffectType = AffectTypes.Skill;
            ch.AffectToChar(affect);

            affect = new AffectData();
            affect.SkillSpell = skill;
            affect.Level = ch.Level;
            affect.Location = ApplyTypes.Hitroll;
            affect.Duration = 2;
            affect.Modifier = +5;
            affect.DisplayName = "berserk";
            affect.EndMessage = "Your rage subsides.\n\r";
            affect.EndMessageToRoom = "$n's rage subsides.\n\r";
            affect.AffectType = AffectTypes.Skill;
            ch.AffectToChar(affect);

            var heal = (int)(ch.Level * 2.5) + 5;
            ch.HitPoints = Math.min(ch.HitPoints + heal, ch.MaxHitPoints);
            ch.ManaPoints -= 20;


            ch.send("You are filled with rage.\n\r");
            ch.Act("$n becomes filled with rage.\n\r", null, null, null, Character.ActType.ToRoom);
            ch.CheckImprove(skill, true, 1);
        }
        else
        {
            ch.send("You only manage to turn your face red.\n\r");
            ch.Act("$n manages to turn their face red.\n\r", null, null, null, Character.ActType.ToRoom);
            ch.CheckImprove(skill, false, 1);
        }
    }
}

Character.DoCommands.DoBerserkersStrike = function(ch, args)
{
    var dam;
    var level = ch.Level;
    var [victim] = ch.GetCharacterHere(args);
    var skill = SkillSpell.SkillLookup("berserkers strike");
    var chance;

    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
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
    if (victim == ch)
    {
        ch.send("You can't berserkers strike yourself.\n\r");
        return;
    }
    chance += level / 10;
    var wield = ch.Equipment[ItemData.WearSlotIDs.Wield];

    ch.WaitState(skill.waitTime);
    if (chance > Utility.NumberPercent())
    {
        if (wield != null)
        {
            var roll = wield.DamageDice.Roll();
            dam = ch.GetDamage(level, .5, 1, roll);

            Combat.Damage(ch, victim, dam, skill, wield != null ? wield.WeaponDamageType.Type : wield.WeaponDamageType.Type);
        }
        else
        {
            dam = ch.GetDamage(level, .5, 1);
            Combat.Damage(ch, victim, dam, skill, wield != null ? wield.WeaponDamageType.Type : DamageMessage.WeaponDamageTypes.Bash);
        }
        ch.CheckImprove(skill, true, 1);

    }
    else
    {
        ch.CheckImprove(skill, false, 1);
        Combat.Damage(ch, victim, 0, skill, wield != null ? wield.WeaponDamageType.Type : DamageMessage.WeaponDamageTypes.Bash);
    }
    return;
}

Character.DoCommands.DoRisingKick = function(ch, args)
{
    var dam;
    var skillPercent = 0;

    var skill = SkillSpell.SkillLookup("rising kick");

    if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You better leave the martial arts to fighters.\n\r");
        return;
    }

    if (ch.Fighting == null)
    {
        ch.send("You aren't fighting anyone.\n\r");
        return;
    }

    ch.WaitState(skill.waitTime);
    var improved = false;
    for (var victim of Utility.CloneArray(ch.Room.Characters))
    {
        if (victim.Fighting == null || (victim.Fighting != ch && !victim.Fighting.IsSameGroup(ch)))
            continue;

        if (skillPercent > Utility.NumberPercent())
        {
            dam = (ch.Level) / 2;
            dam += Utility.Random(0, (ch.Level) / 6);
            dam += Utility.Random(0, (ch.Level) / 6);
            dam += Utility.Random(0, (ch.Level) / 6);
            dam += Utility.Random(0, (ch.Level) / 6);
            dam += Utility.Random(0, (ch.Level) / 6);
            dam += Utility.Random(0, (ch.Level) / 6);
            dam += Utility.Random(ch.Level / 5, ch.Level / 4);

            ch.Act("$n performs a rising kick on $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n performs a rising kick on you.", victim, null, null, Character.ActType.ToVictim);
            ch.Act("You perform a rising kick on $N.", victim, null, null, Character.ActType.ToChar);
            Damage(ch, victim, dam, skill);

            improved = true;
        }
        else
        {
            ch.Act("$n attempts to perform a rising kick on $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n attempts to perform a rising kick on you.", victim, null, null, Character.ActType.ToVictim);
            ch.Act("You attempt to perform a rising kick on $N.", victim, null, null, Character.ActType.ToChar);
            Damage(ch, victim, 0, skill);
        }
    }

    ch.CheckImprove(skill, improved, 1);
}

Character.DoCommands.DoPierce = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("pierce");
    var chance;
    var dam;
    var level = ch.Level;
    var wield = null;

    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    if (!(wield = ch[ItemData.WearSlotIDs.Wield]) || wield.WeaponType != ItemData.WeaponTypes.Spear)
    {
        ch.send("You must be wielding a spear to pierce your enemy.");
        return;
    }

    var victim = null;

    if (arguments.ISEMPTY() && (victim = ch.Fighting) == null)
    {
        ch.send("You aren't fighting anyone.\n\r");
        return;
    }
    else if (!arguments.ISEMPTY() && (victim = ch.GetCharacterFromRoomByName(arguments)) == null)
    {
        ch.send("You don't see them here.\n\r");
        return;
    }

    ch.WaitState(skill.WaitTime);
    if (chance > Utility.NumberPercent())
    {
        ch.Act("$n pierces $N, leaving behind a painful injury.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n pierces you, leaving behind an painful injury.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You pierce $N, leaving behind a painful injury.", victim, null, null, Character.ActType.ToChar);

        dam = Utility.Roll(wield.DamageDice) + ch.DamageRoll;
        ch.CheckImprove(skill, true, 1);
        Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

        if (!victim.IsAffected(skill))
        {
            var aff = new AffectData();
            aff.SkillSpell = skill;
            aff.Duration = Utility.Random(5, 10);
            aff.EndMessage = "Your injury feels better.";
            aff.EndMessageToRoom = "$n recovers from $s injury.";
            aff.OwnerName = ch.Name;
            aff.Level = ch.Level;
            aff.Modifier = -4;
            aff.Location = ApplyTypes.Strength;
            aff.AffectType = AffectTypes.Skill;
            aff.DisplayName = "pierce";
            aff.Where = AffectWhere.ToAffects;

            victim.AffectToChar(aff);
        }
    }
    else
    {
        ch.Act("$n attempts to pierce $N but doesn't connect.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n tries to pierce you!", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You try to pierce $N but fail to connect.", victim, null, null, Character.ActType.ToChar);

        ch.CheckImprove(skill, false, 1);
        Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
    }
    return;
}

Character.DoCommands.DoThrust = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("thrust");
    var chance;
    var dam;
    var level = ch.Level;
    var wield = null;

    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    if (!(wield = ch.Equipment[ItemData.WearSlotIDs.Wield]) || (wield.WeaponType != ItemData.WeaponTypes.Spear && wield.WeaponType != ItemData.WeaponTypes.Polearm))
    {
        ch.send("You must be wielding a spear or polearm to thrust at your enemy.");
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

    ch.WaitState(skill.waitTime);
    if (chance > Utility.NumberPercent())
    {
        ch.Act("$n thrusts at $N, knocking $M back.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n thrusts at you, knocking you back.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You thrust at $N, knocking $M back.", victim, null, null, Character.ActType.ToChar);

        dam = (wield.DamageDice.Roll() + ch.DamageRoll) * 2;
        ch.CheckImprove(skill, true, 1);
        Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

        if (!victim.IsAffected(skill))
        {
            var aff = new AffectData();
            aff.SkillSpell = skill;
            aff.Duration = 2;
            aff.OwnerName = ch.Name;
            aff.Level = ch.Level;
            aff.AffectType = AffectTypes.Skill;
            aff.Hidden = true;
            aff.Frequency = Frequency.Violence;
            aff.DisplayName = "thrust";
            aff.Where = AffectWhere.ToAffects;

            victim.AffectToChar(aff);
        }
    }
    else
    {
        ch.Act("$n attempts to thrust at $N but doesn't manage to push $M back.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n tries to thrust at you!", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You try to thrust at $N but fail to knock $M back.", victim, null, null, Character.ActType.ToChar);

        ch.CheckImprove(skill, false, 1);
        Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
    }
    return;
}

Character.DoCommands.DoSlice = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("slice");
    var chance;
    var dam;
    var level = ch.Level;
    var wield = null;

    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    if ((wield = ch.GetEquipment(WearSlotIDs.Wield)) == null || (wield.WeaponType != WeaponTypes.Polearm && wield.WeaponType != WeaponTypes.Axe))
    {
        ch.send("You must be wielding a polearm or axe to slice your enemy.");
        return;
    }

    var victim = null;

    if (arguments.ISEMPTY() && (victim = ch.Fighting) == null)
    {
        ch.send("You aren't fighting anyone.\n\r");
        return;
    }
    else if (!arguments.ISEMPTY() && (victim = ch.GetCharacterFromRoomByName(arguments)) == null)
    {
        ch.send("You don't see them here.\n\r");
        return;
    }

    ch.WaitState(skill.waitTime);
    if (chance > Utility.NumberPercent())
    {
        ch.Act("$n slices $N with $p, leaving behind a bleeding wound.", victim, wield, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n slices you with $p, leaving behind a bleeding wound.", victim, wield, null, Character.ActType.ToVictim);
        ch.Act("You slice $N with $p, leaving behind a bleeding wound.", victim, wield, null, Character.ActType.ToChar);

        dam = wield.DamageDice.Roll() + ch.DamageRoll;
        ch.CheckImprove(skill, true, 1);
        Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);
        var skBleed = SkillSpell.SkillLookup("bleeding");

        if (!victim.IsAffected(skBleed))
        {
            var aff = new AffectData();
            aff.SkillSpell = skBleed;
            aff.Duration = 4;
            aff.EndMessage = "You stop bleeding.";
            aff.EndMessageToRoom = "$n stops bleeding.";
            aff.OwnerName = ch.Name;
            aff.Level = ch.Level;
            aff.AffectType = AffectTypes.Skill;

            aff.Frequency = Frequency.Tick;
            aff.DisplayName = "slice";
            aff.Where = AffectWhere.ToAffects;

            victim.AffectToChar(aff);
        }
    }
    else
    {
        ch.Act("$n attempts to slice $N with $p but doesn't connect.", victim, wield, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n tries to slice you with $p!", victim, wield, null, Character.ActType.ToVictim);
        ch.Act("You try to slice $N with $p but don't connect.", victim, wield, null, Character.ActType.ToChar);

        ch.CheckImprove(skill, false, 1);
        Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
    }
    return;
}