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


Character.DoCommands.DoCircleStab = function(ch, argument)
{
    var arg = "";
    var victim;
    var obj;
    var chance;
    var dam;

    var skill = SkillSpell.SkillLookup("circle stab");

    [arg] = argument.OneArgument();

    if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
    {
        ch.send("Circling? What's that?\n\r");
        return;
    }
    if (arg.ISEMPTY())
    {
        victim = ch.Fighting;
        if (victim == null)
        {
            ch.send("But you aren't fighting anyone.\n\r");
            return;
        }
    }
    else if ((victim = ch.GetCharacterFromRoomByName(arg)) == null)
    {
        ch.send("They aren't here.\n\r");
        return;
    }
    if (ch.Fighting == null)
    {
        ch.send("You can't circle someone like that.\n\r");
        return;
    }
    for (var other of ch.Room.Characters)
    {
        if (other.Fighting == ch)
        {
            ch.send("Not while you're defending yourself!\n\r");
            return;
        }
    }
    if (victim == ch)
    {
        ch.send("Huh?\n\r");
        return;
    }
    obj = ch.GetEquipment(ItemData.WearSlotIDs.Wield);
    if (!obj || obj.WeaponType != WeaponTypes.Dagger)
    {
        obj = ch.GetEquipment(ItemData.WearSlotIDs.DualWield);
    }
    if (!obj || obj.WeaponType != WeaponTypes.Dagger)
    {
        ch.send("You must wield a dagger to circle stab someone.\n\r");
        return;
    }

    ch.WaitState(skill.WaitTime);

    if (Utility.NumberPercent() < chance)
    {
        ch.Act("You circle around $N to land a critical strike.", victim, null, null, Character.ActType.ToChar);
        ch.Act("$n cirlces around you to land a critical strike.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("$n circles $N to land a critical strike.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.CheckImprove(skill, true, 1);
        dam = Utility.Roll(obj.DamageDice);
        dam += 20;

        if (ch.Level <= 15)
            dam *= 1;
        else if (ch.Level <= 20)
            dam *= 3 / 2;
        else if (ch.Level < 25)
            dam *= 2;
        else if (ch.Level < 30)
            dam *= 7 / 3;
        else if (ch.Level < 40)
            dam *= 5 / 2;
        else if (ch.Level <= 49)
            dam *= 7 / 2;
        else if (ch.Level <= 55)
            dam *= 10 / 3;
        else dam *= 10 / 3;

        //Damage(ch, victim, dam, skill, obj.WeaponDamageType.Type);
        if ((chance = ch.GetSkillPercentage("precision strike")) > 1 && chance > Utility.NumberPercent())
        {
            switch (Utility.Random(1, 4))
            {
                case 1:
                    dam *= 3 / 2;
                    ch.Act("You strike with precision and do extra damage!\n\r");
                    break;
                case 2:
                    var affect = new AffectData();
                    affect.Hidden = true;
                    affect.Duration = 2;
                    affect.Frequency = AffectData.Frequency.Violence;
                    affect.flags.SETBIT(AffectData.AffectFlags.Distracted);
                    victim.AffectToChar(affect);
                    ch.Act("$N is distracted by your precise circle stab\n\r", victim);
                    ch.Act("You are distracted by $n's precise circle stab\n\r", victim, null, null, Character.ActType.ToVictim);
                    ch.Act("$N is distracteb by $n's precise circle stab\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
                    break;
                case 3:
                    var bleeding = SkillSpell.SkillLookup("bleeding");

                    if (victim.FindAffect(bleeding) == null)
                    {
                        var aff = new AffectData();
                        aff.SkillSpell = bleeding;
                        aff.Duration = Utility.Random(2, 4);
                        aff.EndMessage = "Your bleeding stops.";
                        aff.EndMessageToRoom = "$n stops bleeding.";
                        aff.OwnerName = ch.Name;
                        aff.Level = ch.Level;
                        aff.AffectType = AffectData.AffectTypes.Skill;
                        aff.DisplayName = "bleeding";
                        aff.Where = AffectData.AffectWhere.ToAffects;
                        victim.AffectToChar(aff);
                        ch.Act("$N receives a deep wound from your precise circle stab\n\r", victim);
                        ch.Act("You are deeply wounded by $n's precise circle stab\n\r", victim, null, null, Character.ActType.ToVictim);
                        ch.Act("$N is deeply wounded by $n's precise circle stab\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
                    }

                    break;
                case 4:
                    var precisionstrike = SkillSpell.SkillLookup("precision strike");

                    if (!victim.FindAffect(precisionstrike))
                    {
                        var aff = new AffectData();
                        aff.SkillSpell = precisionstrike;
                        aff.Duration = Utility.Random(2, 4);
                        aff.EndMessage = "Your strength recovers.";
                        aff.OwnerName = ch.Name;
                        aff.Level = ch.Level;
                        aff.AffectType = AffectData.AffectTypes.Skill;
                        aff.DisplayName = "precision strike";
                        aff.Modifier = -5;
                        aff.Location = AffectData.ApplyTypes.Strength;
                        aff.Where = AffectData.AffectWhere.ToAffects;
                        victim.AffectToChar(aff);
                        ch.Act("$N is weakened by your precise circle stab\n\r", victim);
                        ch.Act("You are weakened by $n's precise circle stab\n\r", victim, null, null, Character.ActType.ToVictim);
                        ch.Act("$N is weakened by $n's precise circle stab\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
                    }
                    break;

            }// end switch random number 1-4

            ch.CheckImprove("precision strike", true, 1);
        }
        else if (chance > 1)
        {
            ch.CheckImprove("precision strike", false, 1);
        }

        Damage(ch, victim, dam, skill, obj.WeaponDamageType.Type);
    }
    else
    {
        ch.CheckImprove(skill, false, 1);

        Damage(ch, victim, 0, skill, WeaponDamageTypes.None);
    }
    return;
}

Character.DoCommands.DoSteal = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("steal");
    var chance;
    var victim = null;
    var itemname = "";
    var item = null;

    [itemname, args] = args.OneArgument();
    [victim] = ch.GetCharacterHere(args) || ch.Fighting;
    [item] = victim.GetItemInventory(itemname);
    
    if (ch.Fighting != null)
    {
        victim = ch.Fighting;
        skill = SkillSpell.SkillLookup("combat steal");
    }
    if (ch.Fighting != null && (chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.Act("You cannot steal while fighting yet.\n\r");
    }
    else if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
    }

    else if (args.ISEMPTY() || (itemname.ISEMPTY()) && ch.Fighting == null)
    {
        ch.Act("Steal what from who?\n\r");
    }
    else if (ch.Fighting == null && !victim)
    {
        ch.Act("You don't see them here.\n\r");
    }
    else if (Combat.CheckIsSafe(ch, victim))
    {

    }
    else if (!(["gold", "silver", "coins"].some(str => str.equals(itemname))) && !item)
    {
        ch.Act("They aren't carrying that.\n\r");
    }
    else if (chance > Utility.NumberPercent() || !victim.IsAwake)
    {
        if (!item) // only way it got here was from typing gold, silver or coins
        {
            var gold = Math.min(victim.Gold, victim.Gold * Utility.Random(1, ch.Level) / 60);
            var silver = Math.min(victim.Silver, victim.Silver * Utility.Random(1, ch.Level) / 60);
            if (gold <= 0 && silver <= 0)
            {
                ch.Act("You couldn't get any coins.\n\r");
            }
            else if (gold > 0 && silver > 0)
            {
                ch.Act("Bingo!  You got {0} silver and {1} gold coins.\n\r", null, null, null, Character.ActType.ToChar, silver, gold);
            }
            else if (gold > 0)
            {
                ch.Act("Bingo!  You got {0} gold coins.\n\r", null, null, null, Character.ActType.ToChar, gold);
            }
            else
            {
                ch.Act("Bingo!  You got {0} silver coins.\n\r", null, null, null, Character.ActType.ToChar, silver);
            }
            victim.Gold -= gold;
            victim.Silver -= silver;
            ch.Gold += gold;
            ch.Silver += silver;
            ch.CheckImprove(skill, true, 1);
        }
        else
        {
            victim.Inventory.Remove(item);
            ch.Inventory.unshift(item);
            item.CarriedBy = ch;
            ch.CheckImprove(skill, true, 1);
            ch.Act("You successfully steal $p from $N.\n\r", victim, item);
        }
    }
    else
    {
        ch.CheckImprove(skill, false, 1);
        if (item != null)
        {
            ch.Act("You fail to steal $p from $N.\n\r", victim, item);
        }
        else ch.Act("You fail to steal from $N.\n\r", victim);
        Character.DoCommands.DoYell(victim, "Keep your hands out there!");
        Combat.SetFighting(victim, ch);
    }
} // end of steal

Character.DoCommands.DoGreaseItem = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("grease item");
    var chance;
    var count = 0;
    var item = null;
    [item, count] = ch.GetItemInventory(args)
    if(!item) [item, count] = ch.GetItemEquipment(args, count);
    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.Act("You don't know how to do that.\n\r");
    }
    else if ((args.ISEMPTY()) || !item)
    {
        ch.Act("Which item did you want to grease?\n\r");
    }
    else if (item.IsAffected(skill))
    {
        ch.Act("$p is already greased.\n\r", null, item);
    }
    else if (chance < Utility.NumberPercent())
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("$n tries to grease $p, but fails.", null, item, null, Character.ActType.ToRoom);
        ch.Act("You try to grease $p but fail.", null, item, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, false, 1);
    }
    else
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("$n successfully applies grease to $p.", null, item, null, Character.ActType.ToRoom);
        ch.Act("You successfully apply grease to $p.", null, item, null, Character.ActType.ToChar);

        var affect = new AffectData();
        affect.Duration = 2;
        affect.Level = ch.Level;
        affect.Where = AffectData.AffectWhere.ToWeapon;
        affect.SkillSpell = skill;
        affect.flags.SETBIT(AffectData.AffectFlags.Greased);
        item.affects.Add(affect);
        affect.EndMessage = "The grease on $p wears off.\n\r";
        ch.CheckImprove(skill, true, 1);
    }

}

Character.DoCommands.DoArcaneVision = function(ch, args)
{
    var affect;
    var number = 0;
    var skill = SkillSpell.SkillLookup("arcane vision");

    if ((number = ch.GetSkillPercentage(skill) + 20) <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
    }

    else if (ch.IsAffected(AffectData.AffectFlags.ArcaneVision))
    {
        ch.send("You can already see magical items.\n\r");

    }
    else if (Utility.NumberPercent() > number)
    {
        ch.send("You fail to heighten your awareness.\n\r");
        ch.CheckImprove(skill, false, 1);
        return;
    }
    else
    {
        affect = new AffectData();
        affect.SkillSpell = skill;
        affect.DisplayName = "arcane awareness";
        affect.AffectType = AffectData.AffectTypes.Skill;
        affect.Level = ch.Level;
        affect.Location = AffectData.ApplyTypes.None;
        affect.Where = AffectData.AffectWhere.ToAffects;
        affect.flags.SETBIT(AffectData.AffectFlags.ArcaneVision);
        affect.Duration = 12;
        affect.EndMessage = "Your awareness of magical items falls.\n\r";
        ch.AffectToChar(affect);

        ch.send("Your awareness of magical items improves.\n\r");
        ch.CheckImprove(skill, true, 1);
    }
}

// Character.DoCommands.DoInfiltrate = function(ch, args)
// {
    // var skill = SkillSpell.SkillLookup("infiltrate");
    // int chance;

    // if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    // {
        // ch.send("You don't know how to do that.\n\r");
        // return;
    // }

    // Dictionary<Direction, Direction> reverseDirections = new Dictionary<Direction, Direction>
    // { { Direction.North, Direction.South }, { Direction.East, Direction.West },
        // {Direction.South, Direction.North } , {Direction.West, Direction.East },
        // {Direction.Up, Direction.Down }, {Direction.Down, Direction.Up } };

    // Direction direction = Direction.North;
    // ExitData exit;
    // ItemData container;

    // if ((exit = ch.Room.GetExit(args)) != null && exit.destination != null)
    // {
        // direction = exit.direction;
        // if (!exit.flags.Contains(ExitFlags.Closed))
        // {
            // ch.send("It isn't closed.\n\r");
        // }
        // else if (exit.flags.Contains(ExitFlags.Locked))
        // {

            // if (chance > Utility.NumberPercent())
            // {
                // ch.Act("You unlock " + exit.display + ".\n\r");
                // ch.Act("$n unlocks " + exit.display + ".\n\r", null, null, null, Character.ActType.ToGroupInRoom);
                // exit.flags.REMOVEFLAG(ExitFlags.Locked);
                // ExitData otherSide;
                // if ((otherSide = exit.destination.exits[(int)reverseDirections[direction]]) != null && otherSide.destination == ch.Room && otherSide.flags.Contains(ExitFlags.Closed) && otherSide.flags.Contains(ExitFlags.Locked))
                    // otherSide.flags.REMOVEFLAG(ExitFlags.Locked);
                // ch.CheckImprove("infiltrate", true, 1);
            // }
            // else
            // {
                // ch.send("You try to unlock " + exit.display + " but fail.\n\r");
                // ch.Act("$n tries to unlock " + exit.display + " but fails.\n\r", null, null, null, Character.ActType.ToGroupInRoom);
                // ch.CheckImprove("infiltrate", false, 1);
                // return;
            // }

        // }
        // else
            // ch.send("It isn't locked.");
    // }
    // else if ((container = ch.GetItemHere(args)) != null)
    // {
        // if (!container.extraFlags.ISSET(ExtraFlags.Locked))
        // {
            // ch.send("It's not locked.\n\r");
            // return;
        // }

        // if (chance > Utility.NumberPercent())
        // {
            // ch.Act("You unlock $p.", null, container);
            // ch.Act("$n unlocks $p.", null, container, null, Character.ActType.ToGroupInRoom);
            // container.extraFlags.REMOVEFLAG(ExtraFlags.Locked);
            // ch.CheckImprove("infiltrate", true, 1);

        // }
        // else
        // {
            // ch.Act("You try to unlock $p but fail.\n\r", null, container);
            // ch.Act("$n tries to unlock $p but fails.\n\r", null, container, null, Character.ActType.ToGroupInRoom);
            // ch.CheckImprove("infiltrate", false, 1);
            // return;
        // }
    // }
    // else
        // ch.send("You don't see that here.\n\r"); // ch.send("You can't unlock that.\n\r");
// }

// Character.DoCommands.DoDrag = function(ch, args)
// {
    // var skill = SkillSpell.SkillLookup("drag");
    // var chance;
    // var victim = null;
    // var dirArg = null;
    // var direction = Direction.North;
    // var victimname = null;
    // [victimname, args] = args.OneArgument();
    // [dirArg, args] = args.OneArgument();
    // var exit = null;

    // if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
    // {
        // ch.send("You don't know how to do that.\n\r");
    // }
    // else if (!victimname.ISEMPTY() && (victim = ch.GetCharacterFromRoomByName(victimname)) == null)
    // {
        // ch.send("You don't see them here.\n\r");
    // }
    // else if (dirArg.ISEMPTY() || !Utility.GetEnumValueStrPrefix(dirArg, ref direction))
    // {
        // ch.Act("Which direction did you want to drag $N in?\n\r", victim);
    // }
    // else if (!victim.IsAffected(AffectData.AffectFlags.BindHands) ||
        // !victim.IsAffected(AffectData.AffectFlags.BindLegs) || (!victim.IsAffected(AffectData.AffectFlags.Sleep)))
    // {
        // ch.Act("You cannot drag them if they're awake or their hands and legs are unbound.\n\r");
    // }
    // else if ((exit = ch.Room.GetExit(direction)) == null || exit.destination == null
        // || exit.flags.ISSET(ExitFlags.Closed) || exit.flags.ISSET(ExitFlags.Window) ||
        // (!victim.IsImmortal && !victim.IsNPC && (exit.destination.MinLevel > victim.Level || exit.destination.MaxLevel < victim.Level)))
    // {
        // ch.Act("You can't drag $N that way.", victim);
    // }
    // else if (chance > Utility.NumberPercent())
    // {
        // var wasinroom = ch.Room;

        // ch.Act("You drag $N {0}.", victim, args: direction.ToString().ToLower());
        // ch.Act("$n drags $N {0}.", victim, null, null, Character.ActType.ToRoomNotVictim, args: direction.ToString().ToLower());

        // ch.moveChar(direction, true, false, false, false);

        // if (ch.Room != wasinroom)
        // {
            // victim.RemoveCharacterFromRoom();
            // victim.AddCharacterToRoom(exit.destination);
            // //DoLook(victim, "auto");
            // ch.CheckImprove(skill, true, 1);

            // ch.Act("$n drags in $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
        // }
    // }
    // else
    // {
        // ch.Act("You try to drag $N {0} but fail.", victim, args: direction.ToString().ToLower());
        // ch.Act("$n tries to drag $N {0} but fails.", victim, null, null, Character.ActType.ToRoomNotVictim, args: direction.ToString().ToLower());
        // ch.CheckImprove(skill, false, 1);
    // }
// } // end drag

Character.DoCommands.DoWeaponTrip = function(ch, args)
{
    var [victim] = ch.GetCharacterHere(args);
    var dam = 0;
    var skillPercent = 0;
    var count = 0;
    var skill = SkillSpell.SkillLookup("weapon trip");
    var weapon = null;

    //if (!ch.IsNPC && ch.Guild != null && !skill.skillLevel.TryGetValue(ch.Guild.name, out lvl))
    //    lvl = -1;

    //if (!ch.Learned.TryGetValue(skill, out lvl) || lvl <= 1)
    if ((skillPercent = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.Act("You don't know how to do that.\n\r");
    }

    else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
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
        ch.Act("You can't weapon trip yourself!.\n\r");
    }
    else if (!(weapon = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) ||
        [WeaponTypes.Mace, WeaponTypes.Sword, WeaponTypes.Spear].indexOf(weapon.WeaponType) < 0)
    {
        ch.Act("You must be wielding a mace, sword, or spear in your main hand to do that.\n\r");
    }

    else if (skillPercent > Utility.NumberPercent())
    {
        dam = Utility.Roll(weapon.DamageDice);

        ch.Position = "Fighting";
        ch.Fighting = victim;
        ch.Act("You weapon trip $N and $E falls to the ground.\n\r", victim);
        ch.Act("$n weapon trips $N to the ground.\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
        victim.Act("$N weapon trips you to the ground.\n\r", ch);

        Combat.Damage(ch, victim, dam, skill);
        ch.WaitState(skill.WaitTime);

        if (!victim.IsAffected(AffectData.AffectFlags.Flying))
        {
            victim.WaitState(Game.PULSE_VIOLENCE * 2);
        }
        ch.CheckImprove(skill, true, 1);
        CheckCheapShot(victim);
        CheckGroundControl(victim);
    }
    else
    {
        ch.Act("You fail to weapon trip $N to the ground.\n\r", victim);
        ch.Act("$n fails to weapon trip $N to the ground.\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
        victim.Act("$N fails to weapon trip you to the ground.\n\r", ch);
        ch.WaitState(skill.WaitTime);
        Combat.Damage(ch, victim, 0, skill);
        ch.CheckImprove(skill, false, 1);
    }
}
Character.DoCommands.DoSap = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("sap");
    var chance;
    var dam;
    var victim = null;
    var weapon = null;

    if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    if (args.ISEMPTY())
    {
        ch.send("Sap who?\n\r");
        return;
    }
    else if (victim == ch)
    {
        ch.Act("You wouldn't want to sap yourself!");
    }
    else if (ch.Fighting != null)
    {
        ch.send("You're too busy fighting.\n\r");
        return;
    }
    else if (!args.ISEMPTY() && (victim = ch.GetCharacterFromRoomByName(args)) == null)
    {
        ch.send("You don't see them here.\n\r");
        return;
    }
    else if (victim.Protects && victim.Protects.length > 0)
    {
        ch.send("You can't sneak up on them.\n\r");
    }
    else if (ch == victim)
        ch.send("You can't sap yourself.\n\r");
    else if (victim.IsAffected(AffectData.AffectFlags.Sleep))
    {
        ch.send("They are already asleep.\n\r");
        return;
    }
    else if ((weapon = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) == null || ch.GetSkillPercentage(weapon.WeaponType.toLowerCase()) <= 1)
    {
        ch.send("You must be wielding a weapon you are familiar with to sap someone.\n\r");
        return;
    }
    else if (Combat.CheckIsSafe(ch, victim))
    {

    }
    else if (chance > Utility.NumberPercent())
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("$n saps $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n saps you.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You sap $N.", victim, null, null, Character.ActType.ToChar);

        StopFighting(victim, true);
        victim.Position = Positions.Sleeping;
        var affect = new AffectData();
        affect.DisplayName = "sap";
        affect.flags.SETBIT(AffectData.AffectFlags.Sleep);
        affect.Duration = 5;
        affect.Where = AffectData.AffectWhere.ToAffects;
        affect.SkillSpell = skill;
        affect.EndMessage = "You feel able to wake yourself up.";

        victim.AffectToChar(affect);

        ch.CheckImprove(skill, true, 1);
    }
    else
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("$n attempts to sap $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n tries to sap you!", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You try to sap $N.", victim, null, null, Character.ActType.ToChar);

        ch.CheckImprove(skill, false, 1);
        dam = Utility.Random(10, ch.Level);
        Combat.Damage(ch, victim, dam, skill, WeaponDamageTypes.Bash);
    }
    return;
}

Character.DoCommands.DoDisengage = function(ch, args)
{
    var victim = ch.Fighting;
    var skillPercent = 0;
    var skill = SkillSpell.SkillLookup("disengage");

    if ((victim = ch.Fighting) == null)
    {
        ch.send("You aren't fighting anyone!\n\r");
    }
    else if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
    {
        ch.Act("You don't know how to do that.");
    }
    else
    {
        var grip;
        if (ch.Fighting != null && ch.Fighting.Fighting == ch && (grip = ch.Fighting.GetSkillPercentage("grip")) > 1)
        {
            if (grip > Utility.NumberPercent())
            {
                ch.Fighting.Act("$n grips you in its strong raptorial arms, preventing you from disengaging.", ch, null, null, Character.ActType.ToVictim);
                ch.Fighting.Act("You grip $N in your strong raptorial arms, preventing $M from disengaging.", ch, null, null, Character.ActType.ToChar);
                ch.Fighting.Act("$n grips $N in its strong raptorial arms, preventing $M from disengaging.", ch, null, null, Character.ActType.ToRoomNotVictim);
                return;
            }
        }
        if (ch.IsAffected(SkillSpell.SkillLookup("secreted filament")) && Utility.Random(0, 1) == 0)
        {
            ch.Act("$n tries to disengage, but the filament covering $m prevents $m from doing so.", ch, null, null, Character.ActType.ToVictim);
            ch.Act("The secreted filament covering you prevents you from disengaging.\n\r", ch, null, null, Character.ActType.ToChar);
            ch.Act("$n tries to disengage, but the filament covering $m prevents $m from doing so.", ch, null, null, Character.ActType.ToRoomNotVictim);
            return;
        }

        var chance = skillPercent;

        if (chance > Utility.NumberPercent())
        {
            ch.WaitState(skill.WaitTime / 2);
            StopFighting(ch, true);
            ch.Position = Positions.Standing;

            ch.AffectedBy.SETBIT(AffectData.AffectFlags.Hide);
            ch.AffectedBy.SETBIT(AffectData.AffectFlags.Sneak);
            ch.Act("$n disengages from $N and fades into the shadows.", victim, null, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n disengages from you and fades into the shadows.", victim, null, null, Character.ActType.ToVictim);
            ch.Act("You disengage from $N and fade into the shadows.", victim, null, null, Character.ActType.ToChar);
            ch.CheckImprove("disengage", true, 1);
        }
        else
        {
            ch.WaitState(skill.WaitTime);
            ch.Act("You fail to disengage!\n\r", victim, null, null, Character.ActType.ToChar);
            ch.CheckImprove("disengage", false, 1);
        }
    }
}//end disengage
Character.DoCommands.DoKidneyShot = function(ch, args)
{
    var [victim] = ch.GetCharacterHere(args);
    var skill = SkillSpell.SkillLookup("kidney shot");
    var skillPercent;
    var weapon;
    if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
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
    else if (victim.IsAffected(skill))
    {
        ch.Act("$E is still bleeding from your previous kidney shot.\n\r", victim);
    }
    else if (((weapon = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) == null || weapon.WeaponType != WeaponTypes.Dagger) &&
       ((weapon = ch.GetEquipment(ItemData.WearSlotIDs.DualWield)) == null || weapon.WeaponType != WeaponTypes.Dagger))
    {
        ch.Act("You must be wielding a dagger to kidney shot.");
    }
    else
    {
        ch.WaitState(skill.WaitTime);

        if (skillPercent > Utility.NumberPercent())
        {

            if (!victim.IsAffected(skill))
            {
                var affect = new AffectData();
                affect.SkillSpell = skill,
                affect.DisplayName = "kidney shot",
                affect.Duration = 5,
                affect.Modifier = -5,
                affect.Location = AffectData.ApplyTypes.Strength,
                affect.AffectType = AffectData.AffectTypes.Skill,
                affect.Level = ch.Level,
                
                affect.EndMessage = "Your kidneys feel better.";
                victim.AffectToChar(affect);
            }

            ch.Act("You stab $N in the kidneys with $p.", victim, weapon);
            ch.Act("$n stabs you in the kidneys $p!", victim, weapon, null, Character.ActType.ToVictim);
            ch.Act("$n stabs $N in the kidneys with $p!", victim, weapon, null, Character.ActType.ToRoomNotVictim);

            var damage = (Utility.Roll(weapon.DamageDice) + ch.DamageRoll) * 3 / 2;

            damage = Combat.CheckEnhancedDamage(ch);

            ch.CheckImprove(skill, true, 1);

            Combat.Damage(ch, victim, damage, skill, WeaponDamageTypes.Pierce);
        }
        else
        {
            ch.Act("You attempt to stab $N in the kidneys with $p.", victim, weapon);
            ch.Act("$n attempts to stab your kidneys with $p!", victim, weapon, null, Character.ActType.ToVictim);
            ch.Act("$n attempts to stab $N in the kidneys with $p!", victim, weapon, null, Character.ActType.ToRoomNotVictim);

            ch.CheckImprove(skill, false, 1);

            Combat.Damage(ch, victim, 0, skill, WeaponDamageTypes.Slice);
        }
    }
} // end DoKidneyShot
Character.DoCommands.DoBlindFold = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("blindfold");
    var chance;
    var victim = null;

    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    if ((victim = ch.GetCharacterFromRoomByName(args)) == null)
    {
        ch.send("You don't see them here\n\r");
        return;
    }
    if (!victim.IsAffected(AffectData.AffectFlags.Sleep))
    {
        ch.send("They must be sapped or sleeping to do that.\r\n");
        return;
    }
    if (ch.Fighting != null)
    {
        ch.send("You cannot blindfold someone while fighting.\n\r");
        return;
    }
    if (CheckIsSafe(ch, victim))
    {
        return;
    }

    if (victim.IsAffected(skill))
    {
        ch.Act("$N is already blindfolded.", victim);
        return;
    }
    if (chance < Utility.NumberPercent())
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("$n tries to wrap a blindfold around $N's head but fails.", victim, null, null, Character.ActType.ToRoom);
        ch.Act("You try to wrap a blindfold around $N's head but fail.", victim, null, null, Character.ActType.ToChar);
        ch.Act("Someone tries to wrap something around your head but fails.", victim, null, null, Character.ActType.ToVictim);
        return;
    }
    ch.WaitState(skill.WaitTime);
    var affect = new AffectData();
    affect.DisplayName = "blindfold";
    affect.Duration = 6;
    affect.Where = AffectData.AffectWhere.ToAffects;
    affect.Location = AffectData.ApplyTypes.Hitroll;
    affect.Modifier = -4;
    affect.SkillSpell = skill;
    if (!(victim.ImmuneFlags.ISSET(WeaponDamageTypes.Blind) || (victim.Form != null && victim.Form.ImmuneFlags.ISSET(WeaponDamageTypes.Blind))) || victim.IsAffected(AffectData.AffectFlags.Deafen))
        affect.flags.SETBIT(AffectData.AffectFlags.Blind);
    affect.AffectType = AffectData.AffectTypes.Skill;
    affect.EndMessage = "You can see again.";
    affect.EndMessageToRoom = "$n removes the blindfold from $s eyes.";
    victim.AffectToChar(affect);
    ch.WaitState(skill.WaitTime);
    ch.Act("$n wraps a blindfold around $N's head.", victim, null, null, Character.ActType.ToRoom);
    ch.Act("You wrap a blindfold around $N's head.", victim, null, null, Character.ActType.ToChar);
    ch.Act("Someone wraps something around your head.", victim, null, null, Character.ActType.ToVictim);
    ch.CheckImprove(skill, true, 1);
    return;
} // end blindfold
Character.DoCommands.DoEnvenomWeapon = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("envenom weapon");
    var chance;
    var weapon = null;

    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.Act("You don't know how to do that.\n\r");
    }
    else if (((args.ISEMPTY()) && (weapon = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) == null) || (!args.ISEMPTY() && (weapon = ch.GetItemInventoryOrEquipment(args, false)) == null))
    {
        ch.Act("Which weapon did you want to envenom?\n\r");
    }
    else if (!weapon.ItemType.ISSET(ItemData.ItemTypes.Weapon))
    {
        ch.Act("You can only envenom a weapon.\n\r");
    }
    else if (weapon.IsAffected(skill))
    {
        ch.Act("$p is already envenomed.\n\r", null, weapon);
    }
    else if (chance < Utility.NumberPercent())
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("$n tries to envenom $s weapon, but fails.", null, null, null, Character.ActType.ToRoom);
        ch.Act("You try to envenom $p but fail.", null, weapon, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, false, 1);
    }
    else
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("$n successfully applies envenom to $p.", null, weapon, null, Character.ActType.ToRoom);
        ch.Act("You successfully apply envenom to $p.", null, weapon, null, Character.ActType.ToChar);

        var affect = new AffectData();
        affect.Duration = 10 + ch.Level / 4;
        affect.Level = ch.Level;
        affect.Where = AffectData.AffectWhere.ToWeapon;
        affect.SkillSpell = skill;
        affect.flags.SETBIT(AffectData.AffectFlags.Poison);
        weapon.affects.unshift(affect);
        affect.EndMessage = "Envenom on $p wears off.\n\r";
        ch.CheckImprove(skill, true, 1);
    }

} // end envenom weapon
Character.DoCommands.DoGag = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("gag");
    var chance;
    var victim = null;

    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    if ((victim = ch.GetCharacterFromRoomByName(args)) == null)
    {
        ch.send("You don't see them here\n\r");
        return;
    }
    if (!victim.IsAffected(AffectData.AffectFlags.Sleep))
    {
        ch.send("They must be sapped or sleeping to do that.\r\n");
        return;
    }
    if (ch.Fighting != null)
    {
        ch.send("You cannot gag someone while fighting.\n\r");
        return;
    }
    if (CheckIsSafe(ch, victim))
    {
        return;
    }

    if (victim.IsAffected(skill))
    {
        ch.Act("$N is already gagged.", victim);
        return;
    }
    if (chance < Utility.NumberPercent())
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("$n tries to gag $N's mouth but fails.", victim, null, null, Character.ActType.ToRoom);
        ch.Act("You try to gag $N's mouth but fail.", victim, null, null, Character.ActType.ToChar);
        ch.Act("Someone tries to gag your mouth but fails.", victim, null, null, Character.ActType.ToVictim);
        ch.CheckImprove(skill, false, 1);
        return;
    }
    ch.WaitState(skill.WaitTime);
    var affect = new AffectData();
    affect.DisplayName = "gag";
    affect.Duration = 6;
    affect.Where = AffectData.AffectWhere.ToAffects;
    affect.SkillSpell = skill;
    affect.flags.SETBIT(AffectData.AffectFlags.Silenced);
    affect.AffectType = AffectData.AffectTypes.Skill;
    affect.EndMessage = "You can speak again.";
    affect.EndMessageToRoom = "$n removes the gag from $s mouth.";
    victim.AffectToChar(affect);
    ch.WaitState(skill.WaitTime);
    ch.Act("$n stuffs a gag into $N's mouth.", victim, null, null, Character.ActType.ToRoom);
    ch.Act("You stuffs a gag into $N's mouth.", victim, null, null, Character.ActType.ToChar);
    ch.Act("Someone stuffs something into your mouth.", victim, null, null, Character.ActType.ToVictim);
    ch.CheckImprove(skill, true, 1);
    return;
} // end gag
Character.DoCommands.DoBindHands = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("bind hands");
    var chance;
    var victim = null;
    var item = null;

    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    if ((victim = ch.GetCharacterFromRoomByName(args)) == null)
    {
        ch.send("You don't see them here\n\r");
        return;
    }
    if (!victim.IsAffected(AffectData.AffectFlags.Sleep))
    {
        ch.send("They must be sapped or sleeping to do that.\r\n");
        return;
    }
    if (ch.Fighting != null)
    {
        ch.send("You cannot bind someones hands while fighting.\n\r");
        return;
    }
    if (CheckIsSafe(ch, victim))
    {
        return;
    }
    if (victim.IsAffected(skill))
    {
        ch.Act("$S hands are already bound.", victim);
        return;
    }
    if (chance < Utility.NumberPercent())
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("$n tries to bind $N's hands but fails.", victim, null, null, Character.ActType.ToRoom);
        ch.Act("You try to bind $N's hands but fail.", victim, null, null, Character.ActType.ToChar);
        ch.Act("Someone tries to bind your hands but fails.", victim, null, null, Character.ActType.ToVictim);
        ch.CheckImprove(skill, false, 1);
        return;
    }
    ch.WaitState(skill.WaitTime);
    var affect = new AffectData();
    affect.DisplayName = "bind hands";
    affect.Duration = 6;
    affect.Where = AffectData.AffectWhere.ToAffects;
    affect.SkillSpell = skill;
    affect.flags.SETBIT(AffectData.AffectFlags.BindHands);
    affect.AffectType = AffectData.AffectTypes.Skill;
    affect.EndMessage = "You can hold things in your hands again.";
    affect.EndMessageToRoom = "$n removes the binding from $s hands.";
    victim.AffectToChar(affect);
    ch.WaitState(skill.WaitTime);
    ch.Act("$n wraps a binding around $N's hands.", victim, null, null, Character.ActType.ToRoom);
    ch.Act("You wraps a binding around $N's hands.", victim, null, null, Character.ActType.ToChar);
    ch.Act("Someone wraps something around your hands, preventing you from holding anything.", victim, null, null, Character.ActType.ToVictim);

    for (var wearslot of [ItemData.WearSlotIDs.Wield, ItemData.WearSlotIDs.DualWield, ItemData.WearSlotIDs.Shield, ItemData.WearSlotIDs.Held ])
    {
        if ((item = victim.GetEquipment(wearslot)))
        {
            victim.RemoveEquipment(item, false, true);
            //item.CarriedBy = victim;
        }
    }
    ch.CheckImprove(skill, true, 1);
    return;
} // end bind hands
Character.DoCommands.DoBindLegs = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("bind legs");
    var chance;
    var victim = null;

    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    if ((victim = ch.GetCharacterFromRoomByName(args)) == null)
    {
        ch.send("You don't see them here\n\r");
        return;
    }
    if (!victim.IsAffected(AffectData.AffectFlags.Sleep))
    {
        ch.send("They must be sapped or sleeping to do that.\r\n");
        return;
    }
    if (ch.Fighting != null)
    {
        ch.send("You cannot bind someones legs while fighting.\n\r");
        return;
    }
    if (CheckIsSafe(ch, victim))
    {
        return;
    }
    if (victim.IsAffected(skill))
    {
        ch.Act("$S legs are already bound.", victim);
        return;
    }
    if (chance < Utility.NumberPercent())
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("$n tries to bind $N's legs but fails.", victim, null, null, Character.ActType.ToRoom);
        ch.Act("You try to bind $N's legs but fail.", victim, null, null, Character.ActType.ToChar);
        ch.Act("Someone tries to bind your legs but fails.", victim, null, null, Character.ActType.ToVictim);
        ch.CheckImprove(skill, false, 1);
        return;
    }
    ch.WaitState(skill.WaitTime);
    var affect = new AffectData();
    affect.DisplayName = "bind legs";
    affect.Duration = 6;
    affect.Where = AffectData.AffectWhere.ToAffects;
    affect.SkillSpell = skill;
    affect.flags.SETBIT(AffectData.AffectFlags.BindLegs);
    affect.AffectType = AffectData.AffectTypes.Skill;
    affect.EndMessage = "You can use your legs again.";
    affect.EndMessageToRoom = "$n removes the binding from $s legs.";
    victim.AffectToChar(affect);
    ch.WaitState(skill.WaitTime);
    ch.Act("$n wraps a binding around $N's legs.", victim, null, null, Character.ActType.ToRoom);
    ch.Act("You wraps a binding around $N's legs.", victim, null, null, Character.ActType.ToChar);
    ch.Act("Someone wraps something around your legs, preventing you from moving.", victim, null, null, Character.ActType.ToVictim);


    ch.CheckImprove(skill, true, 1);
    return;
} // end bind legs
Character.DoCommands.DoSleepingDisarm = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("sleeping disarm");
    var chance;
    var victim = null;
    var obj = null;

    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
    }

    else if ((victim = ch.GetCharacterFromRoomByName(args)) == null)
    {
        ch.send("You don't see them here\n\r");
    }
    else if (victim.IsAwake)
    {
        ch.send("They must be sapped or sleeping to do that.\r\n");
    }
    else if (ch.Fighting != null)
    {
        ch.send("You cannot sleeping disarm someone while fighting.\n\r");
    }
    else if (CheckIsSafe(ch, victim))
    {

    }
    else if (!(obj = victim.GetEquipment(ItemData.WearSlotIDs.Wield)) && !(obj = victim.GetEquipment(ItemData.WearSlotIDs.DualWield)))
    {
        ch.send("Your opponent is not wielding a weapon.\n\r");
    }
    else if (chance < Utility.NumberPercent())
    {
        ch.Act("$n tries to disarm $N while $E sleeps but fails.", victim, null, null, Character.ActType.ToRoom);
        ch.Act("You try to disarm $N while $E sleeps but fail.", victim, null, null, Character.ActType.ToChar);
        ch.Act("Someone tries to disarm you in your sleep fails.", victim, null, null, Character.ActType.ToVictim);
        ch.CheckImprove(skill, false, 1);
    }

    else
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("$n disarms $N while $E sleeps.", victim, null, null, Character.ActType.ToRoom);
        ch.Act("You disarm $N while $E sleeps.", victim, null, null, Character.ActType.ToChar);
        ch.Act("Someone tries to disarm you while you sleep.", victim, null, null, Character.ActType.ToVictim);

        victim.RemoveEquipment(obj, false, true);
        //if (victim.Inventory.Contains(obj))
        //obj.CarriedBy = victim;

        ch.CheckImprove(skill, true, 1);

        if (Utility.Random(0, 1) == 1)
        {
            victim.StripAffect(AffectData.AffectFlags.Sleep);
            victim.Position = Positions.Standing;
            Combat.SetFighting(victim, ch);
        }
    }
} // end sleeping disarm
Character.DoCommands.DoPepperDust = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("pepper dust");
    var chance;
    var dam;
    var level = ch.Level;
    var dam_each = [
        0,
        4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
        30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
        58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
        65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
        73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
        90,110,120,150,170,200,230,500,500,500
    ];

    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    if (chance <= Utility.NumberPercent())
    {
        ch.CheckImprove(skill, false, 1);
        ch.Act("The pepper dust drifts away harmlessly.");
        ch.Act("The pepper dust drifts away harmlessly.", null, null, null, Character.ActType.ToRoom);
        return;
    }
    ch.Act("$n throws some pepper dust.", null, null, null, Character.ActType.ToRoom);
    ch.Act("You throw some pepper dust.");
    ch.CheckImprove(skill, true, 1);

    for (var victim of Utility.CloneArray(ch.Room.Characters))
    {
        if (victim.IsSameGroup(ch))
            continue;
        if (CheckIsSafe(ch, victim))
            continue;

        if (chance > Utility.NumberPercent())
        {
            if (ch.IsNPC)
                level = Math.min(level, 51);
            level = Math.min(level, dam_each.length - 1);
            level = Math.max(0, level);

            dam = Utility.Random(dam_each[level] / 2, dam_each[level]);

            Combat.Damage(ch, victim, dam, skill, WeaponDamageTypes.Sting);

            if (!victim.IsAffected(skill))
            {
                if ((victim.ImmuneFlags.ISSET(WeaponDamageTypes.Blind) || (victim.Form != null && victim.Form.ImmuneFlags.ISSET(WeaponDamageTypes.Blind))) && !victim.IsAffected(AffectData.AffectFlags.Deafen))
                    victim.Act("$n is immune to blindness.", null, null, null, Character.ActType.ToRoom);
                else
                {
                    var affect = new AffectData();
                    affect.DisplayName = skill.name;
                    affect.SkillSpell = skill;
                    affect.Duration = 3;
                    affect.Where = AffectData.AffectWhere.ToAffects;
                    affect.Location = AffectData.ApplyTypes.Hitroll;
                    affect.Modifier = -4;
                    affect.SkillSpell = skill;
                    victim.Act("$n is blinded by pepper dust in their eyes!", null, null, null, Character.ActType.ToRoom);
                    affect.flags.SETBIT(AffectData.AffectFlags.Blind);
                    victim.AffectToChar(affect);

                    affect.Location = AffectData.ApplyTypes.Dex;
                    affect.Modifier = -8;
                    affect.SkillSpell = skill;
                    affect.EndMessage = "You can see again.";
                    affect.EndMessageToRoom = "$n wipes the pepper dust out of $s eyes.";
                    victim.AffectToChar(affect);
                }
            }
            if (victim.Fighting == null)
                Combat.multiHit(victim, ch);
        }
        ch.CheckImprove(skill, true, 1);
    }
} // end pepper dust
Character.DoCommands.DoBlisterAgent = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("blister agent");
    var chance;
    var dam;
    var level = ch.Level;
    var bleeding = SkillSpell.SkillLookup("bleeding");

    var dam_each = [
        0,
        4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
        30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
        58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
        65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
        73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
        90,110,120,150,170,200,230,500,500,500
    ];
    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    if (chance <= Utility.NumberPercent())
    {
        ch.CheckImprove(skill, false, 1);
        ch.Act("The blister agent drifts away harmlessly.");
        ch.Act("The blister agent drifts away harmlessly.", null, null, null, Character.ActType.ToRoom);
        return;
    }
    ch.Act("$n throws some blister agent.", null, null, null, Character.ActType.ToRoom);
    ch.Act("You throw some blister agent.");
    ch.CheckImprove(skill, true, 1);

    for (var victim of ch.Room.Characters)
    {
        if (victim.IsSameGroup(ch))
            continue;
        if (CheckIsSafe(ch, victim))
            continue;

        if (chance > Utility.NumberPercent())
        {
            if (ch.IsNPC)
                level = Math.min(level, 51);
            level = Math.min(level, dam_each.length - 1);
            level = Math.max(0, level);

            dam = Utility.Random(dam_each[level] / 2, dam_each[level]);

            Combat.Damage(ch, victim, dam, skill, WeaponDamageTypes.Sting);

            if (!victim.IsAffected(skill))
            {
                var affect = new AffectData();
                affect.DisplayName = skill.name;
                affect.SkillSpell = skill;
                affect.Level = ch.Level;
                affect.Duration = 6;
                affect.Where = AffectData.AffectWhere.ToAffects;
                affect.Location = AffectData.ApplyTypes.Str;
                affect.Modifier = -8;
                victim.Act("$n is burned by blister agent!", null, null, null, Character.ActType.ToRoom);
                //affect.flags.SETBIT(AffectData.AffectFlags.Blind);
                victim.AffectToChar(affect);

                if (victim.FindAffect(bleeding) == null)
                {
                    affect.Location = AffectData.ApplyTypes.None;
                    affect.SkillSpell = bleeding;
                    victim.AffectToChar(affect);
                }
                affect.SkillSpell = skill;
                affect.Location = AffectData.ApplyTypes.Hitroll;
                affect.Modifier = -8;
                victim.AffectToChar(affect);

                affect.Location = AffectData.ApplyTypes.AC;
                affect.Modifier = 400;
                affect.SkillSpell = skill;
                affect.EndMessage = "The blister agent surrounding you finally wears off.";
                affect.EndMessageToRoom = "The blister agent surrounding $n wears off.";
                victim.AffectToChar(affect);
            }
            if (victim.Fighting == null) {
                victim.Fighting = ch;
                Combat.ExecuteRound(victim);
            }
        }
    }
} // end blister agent

Character.DoCommands.DoEarClap = function(ch, args)
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
    var skill = SkillSpell.SkillLookup("ear clap");
    var chance;
    var dam;
    var level = ch.Level;
    var victim = ch.GetCharacterHere(args);

    if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
    }
    else if (!args.ISEMPTY() && !victim)
    {
        ch.send("You don't see them here.\n\r");
    }
    else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
    {
        ch.Act("You aren't fighting anybody.\n\r");
    }
    else if (victim.IsAffected(skill))
    {
        ch.Act("$N is already affected by your earl clap!\n\r", victim);
    }
    else if (chance > Utility.NumberPercent())
    {
        if (ch.IsNPC)
            level = Math.min(level, 51);
        level = Math.min(level, dam_each.length - 1);
        level = Math.max(0, level);

        ch.Act("$n deafens $N with a powerful ear clap.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n deafens you with a powerful ear clap.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You deafen $N with a powerful ear clap.", victim, null, null, Character.ActType.ToChar);

        ch.CheckImprove(skill, true, 1);

        dam = Utility.Random(dam_each[level], dam_each[level] * 2);
        Combat.Damage(ch, victim, dam, skill, WeaponDamageTypes.Bash);
        ch.WaitState(skill.WaitTime);

        var affect = new AffectData();
        affect.SkillSpell = skill;
        affect.Level = ch.Level;
        affect.Duration = 3;
        affect.EndMessage = "The ringing in your ears lessens.";
        affect.AffectType = AffectData.AffectTypes.Skill;
        affect.Where = AffectData.AffectWhere.ToAffects;
        affect.DisplayName = "ear clap";
        affect.flags.SETBIT(AffectData.AffectFlags.Deafen);
        victim.AffectToChar(affect);
    }
    else
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("$n tries to deafen $N with a powerful ear clap but misses.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n tries to deafen you with a powerful ear clap but misses.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You try to deafen $N with a powerful ear clap but miss.", victim, null, null, Character.ActType.ToChar);
        Combat.Damage(ch, victim, 0, skill, WeaponDamageTypes.Bash);
        ch.CheckImprove(skill, false, 1);
    }
    return;
} // ear clap

Character.DoCommands.DoStenchCloud = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("stench cloud");
    var chance;
    var dam;
    var level = ch.Level;
    var dam_each = [
        0,
        4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
        30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
        58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
        65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
        73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
        90,110,120,150,170,200,230,500,500,500
    ];

    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    if (chance <= Utility.NumberPercent())
    {
        ch.CheckImprove(skill, false, 1);
        ch.Act("The stench cloud drifts away harmlessly.");
        ch.Act("The stench cloud drifts away harmlessly.", null, null, null, Character.ActType.ToRoom);
        return;
    }
    ch.Act("$n generates a stench cloud.", null, null, null, Character.ActType.ToRoom);
    ch.Act("You generate a stench cloud.");
    ch.CheckImprove(skill, true, 1);

    for (var victim of Utility.CloneArray(ch.Room.Characters))
    {
        if (victim.IsSameGroup(ch))
            continue;
        if (CheckIsSafe(ch, victim))
            continue;

        if (chance > Utility.NumberPercent())
        {
            if (ch.IsNPC)
                level = Math.min(level, 51);
            level = Math.min(level, dam_each.length - 1);
            level = Math.max(0, level);

            dam = Utility.Random(dam_each[level] / 2, dam_each[level]);


            if (!victim.IsAffected(skill))
            {
                Combat.Damage(victim, victim, dam, skill, WeaponDamageTypes.Sting, ch.Name);

                var affect = new AffectData();
                affect.DisplayName = skill.name;
                affect.SkillSpell = skill;
                affect.Duration = 6;
                affect.Where = AffectData.AffectWhere.ToAffects;
                affect.Location = AffectData.ApplyTypes.AC;
                affect.Modifier = 100;
                affect.SkillSpell = skill;
                affect.flags.SETBIT(AffectData.AffectFlags.Smelly);
                affect.EndMessage = "You stop smelling so bad.";
                affect.EndMessageToRoom = "$n stops smelling so bad.";
                victim.AffectToChar(affect);
                victim.Act("$n is covered by a stench cloud!", null, null, null, Character.ActType.ToRoom);

            }
            //if (victim.Fighting == null)
            //   Combat.multiHit(victim, ch);
        }

    }
} // end stench cloud
Character.DoCommands.DoShiv = function(ch, args)
{
    var [victim] = ch.GetCharacterHere(args);
    var skill = SkillSpell.SkillLookup("shiv");
    var skillPercent;
    var weapon;
    if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
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
    else if (((weapon = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) == null || weapon.WeaponType != WeaponTypes.Dagger) &&
       ((weapon = ch.GetEquipment(ItemData.WearSlotIDs.DualWield)) == null || weapon.WeaponType != WeaponTypes.Dagger))
    {
        ch.Act("You must be wielding a dagger to shiv.");
    }
    else if (skillPercent > Utility.NumberPercent())
    {
        var affect;
        ch.WaitState(skill.WaitTime);

        if (!(affect = victim.FindAffect(skill)))
        {
            affect = new AffectData();
            affect.SkillSpell = skill,
            affect.DisplayName = "shiv",
            affect.Duration = 5,
            affect.Modifier = -2,
            affect.Location = AffectData.ApplyTypes.Strength,
            affect.AffectType = AffectData.AffectTypes.Skill,
            affect.Level = ch.Level,

            affect.EndMessage = "Your shiv bleeding subsides.";
            victim.AffectToChar(affect);
        }
        else
        {
            victim.AffectApply(affect, true, true);
            affect.modifier -= 2;
            affect.Duration = 5;
            victim.AffectApply(affect, false, true);
        }

        ch.Act("You shiv $N in the gut with $p.", victim, weapon);
        ch.Act("$n shivs you in the gut with $p!", victim, weapon, null, Character.ActType.ToVictim);
        ch.Act("$n shivs $N in the gut with $p!", victim, weapon, null, Character.ActType.ToRoomNotVictim);

        var damage = (Utility.Roll(weapon.DamageDice) + ch.DamageRoll) * 3;

        damage = Combat.CheckEnhancedDamage(ch);
        damage = Combat.CheckPreyOnTheWeak(ch, victim);

        ch.CheckImprove(skill, true, 1);

        Combat.Damage(ch, victim, damage, skill, weapon.WeaponDamageType.Type);
    }
    else
    {
        ch.WaitState(skill.WaitTime);
        ch.Act("You attempt to shiv $N in the gut with $p.", victim, weapon);
        ch.Act("$n attempts to shiv your gut with $p!", victim, weapon, null, Character.ActType.ToVictim);
        ch.Act("$n attempts to shiv $N in the gut with $p!", victim, weapon, null, Character.ActType.ToRoomNotVictim);

        ch.CheckImprove(skill, false, 1);
        Combat.Damage(ch, victim, 0, skill, weapon.WeaponDamageType.Type);

    }
} // end shiv

Character.DoCommands.DoKnife = function(ch, argument)
{
	var victim;
	var obj;
	var chance;
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

	var skill = SkillSpell.SkillLookup("knife");

	if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
	{
		ch.send("You don't know how to knife.\n\r");
	}
	else if (argument.ISEMPTY())
	{
		ch.send("Knife whom?\n\r");
	}
	else if (ch.Fighting != null)
	{
		ch.send("No way! You're still fighting!\n\r");
	}

	else if ((victim = ch.GetCharacterFromRoomByName(argument)) == null)
	{
		ch.send("They aren't here.\n\r");
	}

	else if (victim == ch)
	{
		ch.send("Bah, you can't knife yourself.\n\r");
	}
	else if (((obj = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) == null || obj.WeaponType != WeaponTypes.Dagger)
					&& ((obj = ch.GetEquipment(ItemData.WearSlotIDs.DualWield)) == null || obj.WeaponType != WeaponTypes.Dagger))
	{
		ch.send("You must wield a dagger to knife someone.\n\r");
	}
	else if (chance > Utility.NumberPercent())
	{
		var level = ch.Level;
		var roll = Utility.Roll(obj.DamageDice) + ch.DamageRoll;

		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);

		dam = Utility.Random(dam_each[level] + roll, dam_each[level] * 3 / 2 + roll);

		ch.Act("You step forward quickly and deliver a powerful knife attack at $N.\n\r", victim, null, Character.ActType.ToChar);
		ch.Act("$n step forward quickly and delivers a powerful knife attack at $N..\n\r", victim, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n step forward quickly and delivers a powerful knife attack at you .\n\r", victim, null, Character.ActType.ToVictim);
		ch.CheckImprove(skill, true, 1);
		Combat.Damage(ch, victim, dam, skill, obj.WeaponDamageType.Type);
	}
	else
	{
		ch.Act("You step forward quickly but fail to deliver a powerful knife attack at $N.\n\r", victim, null, Character.ActType.ToChar);
		ch.Act("$n steps forward quickly but fails to deliver a powerful knife attack at $N.\n\r", victim, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n steps forward quickly but fails to deliver a powerful knife attack at you.\n\r", victim, null, Character.ActType.ToVictim);

		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, obj.WeaponDamageType.Type);
	}
	return;
}


Character.DoCommands.DoBackstab = function(ch, argument)
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
	var skill = SkillSpell.SkillLookup("backstab");
	var chance;
	var dam;
	var level = ch.Level;
	var arg = "";
	var victim;
	var obj;

	[arg] = argument.OneArgument();
	[victim] = ch.GetCharacterHere(arg)
	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to backstab.\n\r");
	}

	else if (arg.ISEMPTY())
	{
		ch.send("Backstab whom?\n\r");
	}

	else if (ch.Fighting != null)
	{
		ch.send("You're facing the wrong end.\n\r");
	}

	else if (!victim)
	{
		ch.send("They aren't here.\n\r");
	}
	else if (victim == ch)
	{
		ch.send("How can you sneak up on yourself?\n\r");
	}

	else if ((!(obj = ch.GetEquipment(ItemData.WearSlotIDs.Wield)) || obj.WeaponType != WeaponTypes.Dagger)
		 && (!(obj = ch.GetEquipment(ItemData.WearSlotIDs.DualWield)) || obj.WeaponType != WeaponTypes.Dagger))
	{
		ch.send("You must wield a dagger to backstab someone.\n\r");
	}

	else if (Combat.CheckIsSafe(ch, victim))
	{

	}
	else if (victim.Fighting != null)
	{
		ch.send("That person is moving around too much to backstab.\n\r");
	}
	else if (victim.HitPoints < victim.MaxHitPoints * 5 / 10)
	{
		ch.Act("$N is hurt and suspicious ... you can't sneak up.", victim, null, Character.ActType.ToChar);
	}
	else if (victim.CanSee(ch) && victim.IsAwake)
	{
		ch.Act("You can't backstab someone who can see you.");
	}
	else if (Combat.CheckPreventSurpriseAttacks(ch, victim)) return;

	else if (chance > Utility.NumberPercent() || !victim.IsAwake)
	{
		ch.WaitState(skill.WaitTime);

		var roll = Utility.Roll(obj.DamageDice) + ch.DamageRoll;

		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);

		dam = Utility.Random(dam_each[level] + roll, dam_each[level] * 2 + roll);

		ch.Act("You backstab $N with your dagger.\n\r", victim);
		ch.Act("$n backstabs $N with $s dagger.\n\r", victim, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n backstabs you with $s dagger.\n\r", victim, null, Character.ActType.ToVictim);

		Combat.Damage(ch, victim, dam, skill.NounDamage, obj.WeaponDamageType.Type);
		ch.CheckImprove(skill, true, 1);
	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("You try backstab $N with your dagger but fail.\n\r", victim);
		ch.Act("$n tries to backstab $N with $s dagger but fails.\n\r", victim, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to backstab you with $s dagger but fails.\n\r", victim, null, Character.ActType.ToVictim);
		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, WeaponDamageTypes.None);
	}
} // end backstab
Character.DoCommands.DoDualBackstab = function(ch, argument)
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

	var skill = SkillSpell.SkillLookup("dual backstab");
	var chance;
	var dam;
	var level = ch.Level;
	var [victim] = ch.GetCharacterHere(argument);
	var weapon;
	var offhand;
	
	weapon = ch.GetEquipment(ItemData.WearSlotIDs.Wield);
	offhand = ch.GetEquipment(ItemData.WearSlotIDs.DualWield);


	if ((chance = ch.GetSkillPercentage(skill)) <= 1)
	{
		ch.send("You don't know how to backstab.\n\r");
	}
	else if (argument.ISEMPTY())
	{
		ch.send("Backstab whom?\n\r");
	}
	else if (ch.Fighting != null)
	{
		ch.send("You're facing the wrong end.\n\r");
	}
	else if (!victim)
	{
		ch.send("They aren't here.\n\r");
	}
	else if (victim.CanSee(ch) && victim.IsAwake)
	{
		ch.Act("You can't backstab someone who can see you.");
	}
	else if (victim == ch)
	{
		ch.send("How can you backstab yourself?\n\r");
	}
	else if (weapon == null || weapon.WeaponType != WeaponTypes.Dagger || offhand == null || offhand.WeaponType != WeaponTypes.Dagger)
	{
		ch.send("You must be dual wielding daggers to dual backstab someone.\n\r");
	}
	else if (Combat.CheckIsSafe(ch, victim))
	{

	}
	else if (victim.Fighting != null)
	{
		ch.send("That person is moving around too much to dual backstab.\n\r");
	}
	else if (victim.HitPoints < victim.MaxHitPoints * 5 / 10)
	{
		ch.Act("$N is hurt and suspicious ... you can't sneak up.", victim, null, Character.ActType.ToChar);
	}
	else if (Combat.CheckPreventSurpriseAttacks(ch, victim)) return;

	else if (Utility.NumberPercent() < chance || !victim.IsAwake)
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("You backstab $N with your daggers.\n\r", victim);
		ch.Act("$n backstabs $N with $s daggers.\n\r", victim, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n backstabs you with $s daggers.\n\r", victim, null, Character.ActType.ToVictim);

		if (ch.IsNPC)
			level = Math.min(level, 51);
		level = Math.min(level, dam_each.length - 1);
		level = Math.max(0, level);

		var roll = Utility.Roll(weapon.DamageDice);
		dam = Utility.Random(dam_each[level] + roll, dam_each[level] * 2 + roll);
		Damage(ch, victim, dam, skill.NounDamage, weapon.WeaponDamageType.Type);

		roll = Utility.Roll(offhand.DamageDice);
		dam = Utility.Random(dam_each[level] + roll, dam_each[level] * 2 + roll);
		Combat.Damage(ch, victim, dam, skill.NounDamage, offhand.WeaponDamageType.Type);
		ch.CheckImprove(skill, true, 1);
	}
	else
	{
		ch.WaitState(skill.WaitTime);
		ch.Act("You try double backstab $N with your daggers but fail.\n\r", victim);
		ch.Act("$n tries to double backstab $N with $s daggers but fails.\n\r", victim, null, Character.ActType.ToRoomNotVictim);
		ch.Act("$n tries to double backstab you with $s daggers but fails.\n\r", victim, null, Character.ActType.ToVictim);
		ch.CheckImprove(skill, false, 1);
		Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.None);
	}
} // end dual backstab