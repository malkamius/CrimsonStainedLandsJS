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

    ch.WaitState(skill.WaitTime);

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
        ch.WaitState(skill.WaitTime);
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

    ch.WaitState(skill.WaitTime);
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

    ch.WaitState(skill.WaitTime);
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

    ch.WaitState(skill.WaitTime);
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

    ch.WaitState(skill.WaitTime);
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

Character.DoCommands.DoDisarm = function(ch, args)
{
    var victim = null;
    var obj = null;
    var wield = null;

    var chance, hth, ch_weapon, vict_weapon, ch_vict_weapon;
    var skill = SkillSpell.SkillLookup("disarm");

    hth = 0;

    if (skill == null || (chance = ch.GetSkillPercentage("disarm")) <= 1)
    {
        ch.send("You don't know how to disarm opponents.\n\r");
        return;
    }

    if ((!(wield = ch.GetEquipment(ItemData.WearSlotIDs.Wield))
        && ((hth = ch.GetSkillPercentage("hand to hand")) <= 1)) || ch.IsNPC)
    {
        ch.send("You must wield a weapon to disarm.\n\r");
        return;
    }

    if (ch.IsAffected(AffectData.AffectFlags.Blind))
    {
        ch.Act("You can't see the person to disarm them!", null, null, null, Character.ActType.ToChar);
        return;
    }

    if (!(victim = ch.Fighting))
    {
        ch.send("You aren't fighting anyone.\n\r");
        return;
    }

    if (!(obj = victim.GetEquipment(ItemData.WearSlotIDs.Wield)) && !(obj = victim.GetEquipment(ItemData.WearSlotIDs.DualWield)))
    {
        ch.send("Your opponent is not wielding a weapon.\n\r");
        return;
    }

    /* find weapon skills */
    ch_weapon = ch.GetSkillPercentage(SkillSpell.GetWeaponSkill(wield));
    vict_weapon = victim.GetSkillPercentage(SkillSpell.GetWeaponSkill(obj));
    ch_vict_weapon = ch.GetSkillPercentage(SkillSpell.GetWeaponSkill(obj));

    /* skill */
    if (wield == null)
        chance = (chance + hth) / 2;
    else
        chance = (chance + ch_weapon) / 2;

    //chance += (ch_vict_weapon / 2 - vict_weapon) / 2;

    /* dex vs. strength */
    //chance += ch.GetCurrentStat(PhysicalStatTypes.Dexterity);
    //chance -= 2 * ch.GetCurrentStat(PhysicalStatTypes.Strength);

    /* level */
    chance += (ch.Level - victim.Level);

    /* and now the attack */
    if (Utility.NumberPercent() < chance)
    {
        ch.WaitState(skill.WaitTime);
        Combat.Disarm(ch, victim);
        ch.CheckImprove(skill, true, 1);
    }
    else
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("You fail to disarm $N.", victim, null, null, Character.ActType.ToChar);
        ch.Act("$n tries to disarm you, but fails.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("$n tries to disarm $N, but fails.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.CheckImprove(skill, false, 1);
    }

    return;
} // end do disarm

Character.DoCommands.DoKick = function(ch, args)
{
    var victim;
    var dam;
    var skillPercent = 0;

    var skill = SkillSpell.SkillLookup("kick");

    if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You better leave the martial arts to fighters.\n\r");
        return;
    }

    if (!(victim = ch.Fighting))
    {
        ch.send("You aren't fighting anyone.\n\r");
        return;
    }

    ch.WaitState(skill.WaitTime);
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

        Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);
        ch.CheckImprove(skill, true, 1);
    }
    else
    {
        Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
        ch.CheckImprove(skill, false, 1);
    }
} // end do kick


Character.DoCommands.DoPugil = function(ch, args)
{
    var dam_each = [
        0,
        4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
        30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
        58, 58, 59, 60, 61, 61
    ];
    var skill = SkillSpell.SkillLookup("pugil");
    var chance;
    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    var dam;
    var level = ch.Level;
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

    chance += level / 10;
    var wield = ch.GetEquipment(ItemData.WearSlotIDs.Wield);

    if (wield == null || wield.WeaponType != ItemData.WeaponTypes.Staff)
    {
        ch.send("You must use a staff to pugil someone.\n\r");
        return;
    }

    ch.WaitState(skill.WaitTime);
    if (chance > Utility.NumberPercent())
    {
        if (ch.IsNPC)
            level = Math.min(level, 51);
        level = Math.min(level, dam_each.Length - 1);
        level = Math.max(0, level);

        var roll = Utility.Roll(wield.DamageDice);
        dam = Utility.Random(dam_each[level] + roll, dam_each[level] * 2 + roll);

        ch.Act("$n pugils $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n pugils you with $p!", victim, wield, null, Character.ActType.ToVictim);
        ch.Act("You pugil $N with $p.", victim, wield, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, true, 1);
        Combat.Damage(ch, victim, dam, skill, wield != null ? wield.WeaponDamageType.Type : WeaponDamageTypes.Bash);
    }
    else
    {
        ch.Act("$n attempts to pugil $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n attempts to pugil you with $p!", victim, wield, null, Character.ActType.ToVictim);
        ch.Act("You attempt to pugil $N with $p.", victim, wield, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, false, 1);
        Combat.Damage(ch, victim, 0, skill, wield != null ? wield.WeaponDamageType.Type : WeaponDamageTypes.Bash);
    }
    return;
} // end do pugil

Character.DoCommands.DoBash = function(ch, args)
{
    var victim;
    var dam = 0;
    var skillPercent = 0;
    var count = 0;
    var skill = SkillSpell.SkillLookup("bash");

    //if (!ch.IsNPC && ch.Guild != null && !skill.skillLevel.TryGetValue(ch.Guild.name, out lvl))
    //    lvl = -1;

    if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You fall flat on your face.\n\r");
        ch.WaitState(Game.PULSE_VIOLENCE * 1);
        return;
    }
    var shield;
    if ((shield = ch.GetEquipment(ItemData.WearSlotIDs.Shield))) {
        ch.send("You must shield bash someone while holding a shield.\n\r");
        return;
    }
    [victim] = ch.GetCharacterHere(args);
    if (!(victim || ch.Fighting))
    {
        ch.send("You aren't fighting anyone.\n\r");
        return;
    }

    if (Combat.CheckIsSafe(ch, victim)) return;

    if (victim == ch)
        ch.send("You can't bash yourself!.\n\r");
    else if (Combat.CheckAcrobatics(ch, victim)) return;
    else if (victim.FindAffect(SkillSpell.SkillLookup("protective shield")))
    {
        ch.WaitState(Game.PULSE_VIOLENCE);
        ch.Act("You try to bash $N but fall straight through $M.\n\r", victim, null, null, Character.ActType.ToChar);
        ch.Act("$n tries to bash $N but falls straight through $M.\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
    }
    else if (skillPercent > Utility.NumberPercent())
    {
        dam += Utility.Random(10, (ch.Level) / 2);
        if(!ch.Fighting) {
            ch.Position = "Fighting";
            ch.Fighting = victim;
        }
        ch.Act("You bash $N and they fall to the ground.\n\r", victim, null, null, Character.ActType.ToChar);
        ch.Act("$n bashes $N to the ground.\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
        victim.send("{0} bashes you to the ground.\n\r", ch.Display(victim));
        victim.Position = "Sitting";
        Combat.Damage(ch, victim, dam, skill);
        ch.WaitState(Game.PULSE_VIOLENCE * 2);
        victim.WaitState(Game.PULSE_VIOLENCE * 1);
        ch.CheckImprove(skill, true, 1);
        Combat.CheckCheapShotRoom(victim);
        Combat.CheckGroundControlRoom(victim);
    }
    else
    {
        ch.WaitState(Game.PULSE_VIOLENCE * 1);
        ch.send("You fall flat on your face.\n\r");
        ch.Position = Positions.Sitting;
        ch.CheckImprove(skill, false, 1);
    }
} // end do bash

Character.DoCommands.DoTrip = function(ch, args)
{
    var victim = null;
    var dam = 0;
    var skillPercent = 0;
    var count = 0;
    var skill = SkillSpell.SkillLookup("trip");
    [victim] = ch.GetCharacterHere(args)

    if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You stumble and your feet get crossed.\n\r");
    }

    else if (args.ISEMPTY() && !(victim = ch.Fighting))
    {
        ch.Act("You aren't fighting anyone.\n\r");
    }
    else if (!args.ISEMPTY() && !victim)
    {
        ch.Act("They aren't here!\n\r");
    }
    else if (Combat.CheckIsSafe(ch, victim))
    {

    }
    else if (victim == ch)
    {
        ch.send("You can't trip yourself!.\n\r");
    }

    else if (Combat.CheckAcrobatics(ch, victim)) return;

    else if (victim.IsAffected(AffectData.AffectFlags.Flying))
    {
        ch.send("Their feet aren't on the ground.\n\r");
    }
    else if (skillPercent > Utility.NumberPercent())
    {
        dam += Utility.dice(2, 3, 8);

        //Utility.Random(6, Math.Max(8,(ch.Level) / 5));
        if(!ch.Fighting) {
            ch.Position = "Fighting";
            ch.Fighting = victim;
        }
        ch.Act("You trip $N and $E falls to the ground.\n\r", victim);
        ch.Act("$n trips $N and $E falls to the ground.\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
        victim.Act("$N trips you to the ground.\n\r", ch);

        Combat.Damage(ch, victim, dam, skill);
        ch.WaitState(skill.WaitTime);
        victim.WaitState(Game.PULSE_VIOLENCE * 1);
        ch.CheckImprove(skill, true, 1);
        Combat.CheckCheapShotRoom(victim);
        Combat.CheckGroundControlRoom(victim);
    }
    else
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("You fail to trip them.\n\r");
        Combat.Damage(ch, victim, 0, skill);
        ch.CheckImprove(skill, false, 1);
    }
} // end do trip

Character.DoCommands.DoShieldBash = function(ch, args)
{
    var victim;
    var dam = 0;
    var skillPercent = 0;
    var count = 0;
    var skill = SkillSpell.SkillLookup("shield bash");

    //if (!ch.IsNPC && ch.Guild != null && !skill.skillLevel.TryGetValue(ch.Guild.name, out lvl))
    //    lvl = -1;

    if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        ch.WaitState(Game.PULSE_VIOLENCE * 1);
        return;
    }
    var shield;
    if (!(shield = ch.GetEquipment(ItemData.WearSlotIDs.Shield)))
    {
        ch.send("You must be holding a shield to shield bash someone.\n\r");
        return;
    }
    if (!(victim = (ch.GetCharacterHere(args)) || ch.Fighting))
    {
        ch.send("You aren't fighting anyone.\n\r");
        return;
    }

    if (Combat.CheckIsSafe(ch, victim)) return;

    if (victim == ch)
        ch.send("You can't shield bash yourself!.\n\r");

    else if (Combat.CheckAcrobatics(ch, victim)) return;

    else if (victim.FindAffect(SkillSpell.SkillLookup("protective shield")))
    {
        ch.WaitState(Game.PULSE_VIOLENCE);
        ch.Act("You try to shield bash $N but miss $M.\n\r", victim, null, null, Character.ActType.ToChar);
        ch.Act("$n tries to shield bash $N but miss $M.\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
    }
    else if (skillPercent > Utility.NumberPercent())
    {
        dam += Utility.Random(10, (ch.Level) / 2);

        if(!ch.Fighting) {
            ch.Position = "Fighting";
            ch.Fighting = victim;
        }
        ch.Act("You shield bash $N and they fall to the ground.\n\r", victim, null ,null, Character.ActType.ToChar);
        ch.Act("$n shield bashes $N to the ground.\n\r", victim, null ,null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n shield bashes you to the ground.\n\r", victim, null ,null, Character.ActType.ToVictim);

        Combat.Damage(ch, victim, dam, skill);
        ch.WaitState(Game.PULSE_VIOLENCE * 2);
        victim.WaitState(Game.PULSE_VIOLENCE * 1);
        ch.CheckImprove(skill, true, 1);
        Combat.CheckCheapShotRoom(victim);
        Combat.CheckGroundControlRoom(victim);
    }
    else
    {
        ch.WaitState(Game.PULSE_VIOLENCE * 1);
        ch.send("You failed to shield bash.\n\r");
        ch.CheckImprove(skill, false, 1);
    }
} // end shield bash


Character.DoCommands.DoCharge = function(ch, args)
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
    var skill = SkillSpell.SkillLookup("charge");
    var chance;
    var dam;
    var level = ch.Level;
    var wield = null;

    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    if (ch.Form)
    {
        dam_each = [36, 63, 78, 95];
        level = 3 - ch.Form.Tier;
    }
    else if (!(wield = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) || (wield.WeaponType != ItemData.WeaponTypes.Spear && wield.WeaponType != ItemData.WeaponTypes.Polearm))
    {
        ch.send("You must be wearing a spear or polearm to charge your enemy.\n\r");
        return;
    }
    var victim = null;

    if (ch.Position == "Fighting")
    {
        ch.send("You're too busy fighting already!\n\r");
        return;
    }

    victim = ch.GetCharacterHere(args);

    if (args.ISEMPTY() || !victim)
    {
        ch.send("You don't see them here.\n\r");
        return;
    }

    //chance += (level * 2);

    ch.WaitState(skill.WaitTime);

    if (Combat.CheckPreventSurpriseAttacks(ch, victim)) return;

    if (chance > Utility.NumberPercent())
    {
        if (ch.IsNPC)
            level = Math.min(level, 51);
        level = Math.min(level, dam_each.Length - 1);
        level = Math.max(0, level);


        ch.Act("$n charges $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n charges you.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You charge $N.", victim, null, null, Character.ActType.ToChar);

        dam = Utility.Random(dam_each[level] * 3, dam_each[level] * 4);
        ch.CheckImprove(skill, true, 1);
        Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Pierce);

    }
    else
    {
        ch.Act("$n tries to charge $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n tries to charge you but fails!", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You try to charge $N but fail.", victim, null, null, Character.ActType.ToChar);

        ch.CheckImprove(skill, false, 1);
        Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Pierce);
    }
    return;
}

Character.DoCommands.DoWarCry = function(ch, args)
{
    var affect;
    var skill = SkillSpell.SkillLookup("warcry");
    var skillPercent;

    //if (!ch.IsNPC && ch.Guild != null && !sn.skillLevel.TryGetValue(ch.Guild.name, out lvl))
    //    lvl = -1;

    //if (!ch.Learned.TryGetValue(sn, out lvl) || lvl <= 1)
    if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("Huh?\n\r");
        return;
    }

    if ((affect = ch.FindAffect(skill)) != null)
    {
        ch.send("You are already inspired!\n\r");
        return;
    }
    else if (ch.Position == "Standing" && !ch.Fighting)
    {
        ch.send("You must be fighting to warcry!\n\r");
        return;
    }
    else if (ch.ManaPoints < 20)
    {
        ch.send("You don't have enough mana to warcry.\n\r");
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
            affect.Location = AffectData.ApplyTypes.Saves;
            affect.Duration = 10;
            affect.Modifier = -8;
            affect.DisplayName = "warcry";
            affect.AffectType = AffectData.AffectTypes.Skill;
            ch.AffectToChar(affect);

            affect = new AffectData();
            affect.SkillSpell = skill;
            affect.Level = ch.Level;
            affect.Location = AffectData.ApplyTypes.Hitroll;
            affect.Duration = 10;
            affect.Modifier = +8;
            affect.DisplayName = "warcry";
            affect.EndMessage = "Your warcry subsides.\n\r";
            affect.EndMessageToRoom = "$n's warcry subsides.\n\r";
            affect.AffectType = AffectData.AffectTypes.Skill;
            ch.AffectToChar(affect);

            ch.ManaPoints -= 20;

            ch.send("You are inspired by your warcry.\n\r");
            ch.Act("$n becomes inspired by $s warcry.\n\r", null, null, null, Character.ActType.ToRoom);
            ch.CheckImprove(skill, true, 1);
        }
        else
        {
            ch.send("You choke up and fail to yell your warcry.\n\r");
            ch.Act("$n chokes up and fails to yell their warcry.\n\r", null, null, null, Character.ActType.ToRoom);
            ch.CheckImprove(skill, false, 1);
        }
    }
}