const Utility = require("./Utility");
const Combat = require("./Combat");
const Character = require("./Character");
const SkillSpell = require("./SkillSpell");
const AffectData = require("./AffectData");
class Magic {
    static CastType =
        {
            "None" : "None",
            "Cast" : "Cast",
            "Commune" : "Commune",
            "Sing" : "Sing",
            "Invoke" : "Invoke"
        };
    
    static SaySpell(ch, spell)
    {

        var syllables = 
        {
            " ": " ",
            "ar": "abra",
            "au": "kada",
            "bless": "fido",
            "blind": "nose",
            "bur": "mosa",
            "cu": "judi",
            "de": "oculo",
            "en": "unso",
            "light": "dies",
            "lo": "hi",
            "mor": "zak",
            "move": "sido",
            "ness": "lacri",
            "ning": "illa",
            "per": "duda",
            "ra": "gru",
            "fresh": "ima",
            "re": "candus",
            "son": "sabru",
            "tect": "infra",
            "tri": "cula",
            "ven": "nofo",
            "a": "a",
            "b": "b",
            "c": "q",
            "d": "e",
            "e": "z",
            "f": "y",
            "g": "o",
            "h": "p",
            "i": "u",
            "j": "y",
            "k": "t",
            "l": "r",
            "m": "w",
            "n": "i",
            "o": "a",
            "p": "s",
            "q": "d",
            "r": "f",
            "s": "g",
            "t": "h",
            "u": "j",
            "v": "z",
            "w": "x",
            "x": "n",
            "y": "l",
            "z": "k" 
        };

        var buf = "";

        for (var i = 0; i < spell.Name.length; i++)
        {
            for (var syl in syllables)
            {
                if (spell.Name.substring(i).prefix(syl))
                {
                    i += syl.length - 1;
                    buf += syllables[syl];
                    break;
                }
            }
        }

        for (var other of ch.Room.Characters)
        {
            if (other != ch)
            {
                if (other.Guild == ch.Guild)
                    ch.Act("$n utters the words '" + spell.name + "'.\n\r", other, null, null, "ToVictim");
                else
                    ch.Act("$n utters the words '" + buf + "'.\n\r", other, null, null, "ToVictim");
            }
        }
    } // end SaySpell

    static IsSafeSpell(ch, victim, area) {
        if (ch.IsAffected("Calm"))
        {
            ch.send("You feel too calm to fight.\n\r");
            Combat.StopFighting(ch);

            return true;
        }

        if (!victim.Room || !ch.Room)
            return true;

        if (victim == ch && area)
            return true;

        if (Combat.CheckIsSafe(ch, victim))
            return false;

        if (victim.Fighting == ch || victim == ch)
            return false;

        //if (IS_IMMORTAL(ch) && ch.level > LEVEL_IMMORTAL && !area)
        //    return false;

        /* killing mobiles */
        if (victim.IsNPC)
        {
            /* safe room? */
            if (victim.Room.Flags.ISSET("Safe"))
                return true;

            if (victim.IsShop)
                return true;

            /* no killing healers, trainers, etc */
            if (victim.Flags.ISSET("Train")
                || victim.Flags.ISSET("Practice")
                || victim.Flags.ISSET("Healer")
                || victim.Flags.ISSET("Changer"))
                return true;

            if (!ch.IsNPC)
            {
                /* no pets */
                if (victim.Flags.ISSET("Pet"))
                    return true;

                /* no charmed creatures unless owner */
                if (victim.IsAffected("Charm") && (area || ch != victim.Master))
                    return true;

                /* legal kill? -- cannot hit mob fighting non-group member */
                // if (victim.Fighting && !ch.IsSameGroup(victim.Fighting))
                //     return true;
            }
            else
            {
                /* area effect spells do not hit other mobs */
                // if (area && !victim.IsSameGroup(ch.Fighting))
                //     return true;
            }
        }
        /* killing players */
        else
        {
            //if (area && IS_IMMORTAL(victim) && victim.level > LEVEL_IMMORTAL)
            //    return true;

            /* NPC doing the killing */
            if (ch.IsNPC)
            {
                /* charmed mobs and pets cannot attack players while owned */
                if (((ch.IsAffected("Charm") && (ch.Master != null
                    && ch.Master.Fighting != victim))
                    || (ch.Leader != null && ch.Leader.Fighting != victim)))
                    return true;

                if (ch.Leader != null && !victim.IsNPC)
                    return false;
                /* safe room? */
                if (victim.Room.Flags.ISSET("Safe"))
                    return true;

                /* legal kill? -- mobs only hit players grouped with opponent*/
                // if (ch.Fighting != null && !ch.Fighting.IsSameGroup(victim))
                //     return true;
            }
            /* player doing the killing */
            else
            {
                //if (!is_cabal(ch))
                //    return true;

                // if (ch.Level > victim.Level + 8)
                //     return true;
            }
        }
        return false;
    } // end of IsSafeSpell

    static CastCommuneOrSing(ch, argument, MethodUsed)
    {
        var buf = "";
        var victim = null;
        var item = null;
        var vo = null;
        var arg1 = null;
        var arg2 = null;
        var spell;
        var target = "targetNone";

        var mana;
        //if (!(ch is Connection))
        //    return;

        var [arg1, targetName] = argument.oneArgument();
        [arg2, argument] = targetName.oneArgument();
        targetName = arg2;

        if (arg1.IsNullOrEmpty())
        {
            if (MethodUsed == Magic.CastType.Cast)

                ch.send("Cast which what where?\n\r");
            else if (MethodUsed == CastType.Commune)
                ch.send("Pray which prayer of supplication?\n\r");
            else if (MethodUsed == CastType.Sing)
                ch.send("Sing what?\n\r");
            return;
        }
        if (ch.IsAffected("Silenced"))
        {
            ch.Act("You cannot do that while silenced!\n\r");
            return;
        }
        if ((spell = SkillSpell.FindSpell(ch, arg1)) == null ||
            //spell.spellFun == null || 
            //ch.Level < ch.GetLevelSkillLearnedAt(spell) ||
            ch.GetSkillPercentage(spell) <= 1)
        {
            if (MethodUsed == Magic.CastType.Cast)
                ch.send("You don't know any spells of that name.\n\r");
            else if (MethodUsed == Magic.CastType.Commune)
                ch.send("You don't know any supplications of that name.\n\r");
            else if (MethodUsed == Magic.CastType.Sing)
                ch.send("You don't know any songs of that name.\n\r");
            return;
        }

        if (ch.IsAffected("Deafen"))
        {
            ch.send("You can't concentrate with the ringing in your ears.\n\r");
            return;
        }

        if (!ch.IsImmortal && !ch.IsNPC)
        {
            if (ch.Guild.CastType == Magic.CastType.Commune && MethodUsed != "Commune")
            {
                ch.send("You must commune with the gods for your blessings.\n\r");
                return;
            }
            else if (ch.Guild.CastType == Magic.CastType.Cast && MethodUsed != "Cast")
            {
                ch.send("You should try casting that as a spell.\n\r");
                return;
            }
            else if (ch.Guild.CastType == Magic.CastType.Sing && MethodUsed != "Sing")
            {
                ch.send("You should try singing that song.\n\r");
                return;
            }


            if (MethodUsed == Magic.CastType.Cast && !spell.SkillTypes.Contains("Spell"))
            {
                ch.send("You can't cast that.\n\r");
                return;
            }

            if (MethodUsed == Magic.CastType.Commune && !spell.SkillTypes.IsSet("Commune"))
            {
                ch.send("You can't pray to the gods about that.\n\r");
                return;
            }

            if (MethodUsed == CastType.Sing && !spell.SkillTypes.IsSet("Song"))
            {
                ch.send("You can't sing that.\n\r");
                return;
            }
            if (Character.Positions.indexOf(ch.Position) < Character.Positions.indexOf(spell.MinimumPosition))
            {
                ch.send("You can't concentrate enough.\n\r");
                return;
            }
        }
        mana = spell.GetManaCost(ch);

        var count = 0;


        switch (spell.TargetType.toLowerCase())
        {
            case "targetignore":
                break;
            case "targetcharoffensive":
                if (string.IsNullOrEmpty(arg2))
                    victim = ch.Fighting;
                else if (([victim, count] = Character.CharacterFunctions.GetCharacterHere(ch, targetName, count)) && !victim)
                {
                    ch.send("They aren't here.\n\r");
                    return;
                }

                if (victim == null)
                {
                    ch.send("They are not here.\n\r");
                    return;
                }
                

                target = "targetChar";
                vo = victim;
                break;
            case "targetchardefensive":
                if (arg2.IsNullOrEmpty())
                    victim = ch;
                else if (([victim, count] = Character.CharacterFunctions.GetCharacterHere(ch, targetName, count)) && !victim)
                {
                    ch.send("They aren't here.\n\r");
                    return;
                }
                target = "targetChar";
                vo = victim;
                break;
            case "targetcharself":
                if (!arg2.IsNullOrEmpty() && !targetName.IsName(ch.Name) && !arg2.equals("self"))
                {
                    ch.send("You cannot cast this spell on another.\n\r");
                    return;
                }

                vo = ch;
                target = "targetChar";
                break;
            case "targetiteminventory":
                if (arg2.ISEMPTY())
                {
                    ch.send("What should the spell be cast upon?\n\r");
                    return;
                }

                if (([item, count] = Character.ItemFunctions.GetItemInventory(ch, targetName, count)) == null)
                {
                    ch.send("You are not carrying that.\n\r");
                    return;
                }

                target = "targetItem";
                break;

            case "targetitemcharoff":
                if (arg2.ISEMPTY())
                {
                    if ((victim = ch.Fighting) == null)
                    {
                        ch.send("Cast the spell on whom or what?\n\r");
                        return;
                    }

                    target = "targetChar";
                }
                else if (([item, count] = Character.ItemFunctions.GetItemHere(ch, targetName, count)) && item)
                {
                    target = "targetItem";
                }
                else if (([item, count] = Character.ItemFunctions.GetItemHere(ch, argument, count)) && item)
                {
                    target = "targetItem";
                }
                else if (([victim, count] = Character.CharacterFunctions.GetCharacterHere(ch, targetName, count)) && victim)
                {
                    target = "targetChar";
                }

                if (target == "targetChar") /* check the sanity of the attack */
                {
                    vo = victim;
                }

                else
                {
                    ch.send("You don't see that here.\n\r");
                    return;
                }
                break;

            case "targetitemchardef":
                if (arg2.ISEMPTY())
                {
                    vo = ch;
                    victim = ch;
                    target = "targetChar";
                }

                else if (([item, count] = Character.ItemFunctions.GetItemHere(ch, argument, count)) && item)
                {
                    target = "targetItem";
                }
                else if (([item, count]= Character.ItemFunctions.GetItemHere(ch, arg2, count)) && item)
                {
                    target = "targetItem";
                }
                else if (([victim, count] = Character.CharacterFunctions.GetCharacterHere(ch, arg2, count)) && victim)
                {
                    vo = victim;
                    target = "targetChar";
                }
                else
                {
                    ch.send("You don't see that here.\n\r");
                    return;
                }
                break;
            default:
                ch.send("You can't cast this type of spell yet.\n\r");
                return;
        }

        if (ch.ManaPoints < mana)
        {
            ch.send("You don't have enough mana.\n\r");
            return;
        }

        if(target == "targetChar" && 
            (spell.TargetType.equals("targetCharOffensive") || spell.TargetType.equals("targetItemCharOff")) && 
            victim)
        {
            if (!victim.Fighting)
                victim.Fighting = ch;

            if (!ch.Fighting)
                ch.Fighting = victim;

            victim.Position = "Fighting";
            ch.Position = "Fighting";

        }

        if (MethodUsed == "Cast")
        {
            Magic.SaySpell(ch, spell);
        }
        else if (MethodUsed == "Sing")
        {
            ch.Act("\\M$n sings \n\r\n\r{0}\\x\n\r\n\r", null, null, null, "ToRoom", spell.Lyrics);//.Replace("\r", "").Replace("\n", "\n\t"));
            ch.Act("\\MYou sing \n\r\n\r{0}\\x\n\r\n\r", null, null, null, "ToChar", spell.Lyrics);//.Replace("\r", "").Replace("\n", "\n\t"));
        }
        else if (MethodUsed == "Commune")
        {
            ch.Act("$n closes their eyes for a moment.", null, null, null, ActType.ToRoom);
            ch.Act("You close your eyes for a moment as you pray to your diety.", null, null, null, ActType.ToChar);
        }
        ch.WaitState(spell.WaitTime);

        var chance = ch.GetSkillPercentage(spell) + 10;

        var held = ch.Equipment["Held"];

        if (MethodUsed == "Sing")
        {
            chance = (chance + ch.GetSkillPercentage("sing") + 10) / 2;



            if (!held || !held.ItemTypes.ISSET("Instrument"))
            {
                chance = (chance + ch.GetSkillPercentage("a cappella") + 10) / 2;
            }
        }

        if (!ch.IsImmortal && Utility.NumberPercent() > chance)
        {
            if (MethodUsed == "Cast")
                ch.send("You lost your concentration.\n\r");
            else if (MethodUsed == "Sing")
            {
                ch.send("Your song falls on deaf ears.\n\r");
                ch.CheckImprove("sing", false, 1);
                if (held == null || !held.ItemType.ISSET(ItemTypes.Instrument))
                {
                    ch.CheckImprove("a cappella", false, 1);
                }
            }
            else if (MethodUsed == "Commune")
            {
                ch.send("The gods don't seem to hear you.\n\r");
            }
            //checkimprove(ch, spell);
            ch.CheckImprove(spell, false, 1);
            ch.ManaPoints -= mana / 2;
            return;
        }
        else
        {
            ch.ManaPoints -= mana;
            ch.CheckImprove(spell, true, 1);
            if (MethodUsed == "Sing")
            {
                ch.CheckImprove("sing", true, 1);
                if (held == null || !held.ItemType.ISSET(ItemTypes.Instrument))
                {
                    ch.CheckImprove("a cappella", true, 1);
                }
            }
            if (spell.SpellFun)
                spell.SpellFun(MethodUsed, spell, ch.Level, ch, vo, item, targetName + " " + argument, target);
        }
    } // End CastCommuneOrSing

    static DoCast(ch, args)
    {
        Magic.CastCommuneOrSing(ch, args, "Cast");
    } // end docast

    static DoCommune(ch, args)
    {
        Magic.CastCommuneOrSing(ch, args, "Commune");
    } // end DoCommune

    static DoSing(ch, args)
    {
        Magic.CastCommuneOrSing(ch, args, "Sing");
    } // end DoSing

    static ItemCastSpell(castType, spell, level, ch, victim, item, room)
    {
        var target = "targetNone";
        var vo = null;
        var vItem = null;
        if (!spell)
            return;

        if (!spell.SpellFun)
        {
            console.log("ObjectCastSpell: bad spell {0}.", spell.Name);
            return;
        }

        if (ch.Room.Flags.ISSET("NoMagic"))
        {
            ch.Act("$n's spell fizzles.", null, null, null, "ToRoom");
            ch.send("Your spell fizzles and dies.\n\r");
            return;
        }


        switch (spell.targetType.toLowerCase())
        {
            default:
                console.log("ItemCastSpell: bad target for spell {0}.", spell.Name);
                return;

            case "targetignore":
                vo = null;
                break;

            case "targetcharoffensive":
                if (victim == null)
                    victim = ch.Fighting;
                if (victim == null)
                {
                    ch.send("You can't do that.\n\r");
                    return;
                }
                if (Combat.CheckIsSafe(ch, victim) && ch != victim)
                {
                    //ch.send("Something isn't right...\n\r");
                    return;
                }
                vo = victim;
                target = "targetChar";
                break;

            case "targetchardefensive":
            case "targetcharself":
                if (victim == null)
                    victim = ch;
                vo = victim;
                target = "targetChar";
                break;

            case "targetiteminventory":
                if (item == null)
                {
                    ch.send("You can't do that.\n\r");
                    return;
                }
                vItem = item;
                target = "targetItem";
                break;

            case "targetitemcharoff":
                if (victim == null && item == null)
                {
                    if (ch.Fighting != null)
                        victim = ch.Fighting;
                    else
                    {
                        ch.send("You can't do that.\n\r");
                        return;
                    }
                }

                if (victim != null)
                {
                    if (IsSafeSpell(ch, victim, false) && ch != victim)
                    {
                        //ch.send("Something isn't right...\n\r");
                        return;
                    }

                    vo = victim;
                    target = "targetChar";
                }
                else
                {
                    vItem = item;
                    target = "targetItem";
                }
                break;


            case "targetitemchardef":
                if (victim == null && item == null)
                {
                    vo = ch;
                    target = "targetChar";
                }
                else if (victim != null)
                {
                    vo = victim;
                    target = "targetChar";
                }
                else
                {
                    vItem = item;
                    target = "targetItem";
                }

                break;
        }

        spell.SpellFun(Magic.CastType.Cast, spell, level, ch, vo, vItem, null, target);

        if ((spell.TargetType.equals("targetCharOffensive")
            || (spell.TargetType.equals("targetItemCharOff") && target == "targetChar"))
            && victim != ch
            && victim.Master != ch)
        {
            if(victim && victim.Room == ch.Room && !victim.Fighting) {
                victim.Fighting = ch;
                Combat.ExecuteRound(victim);
            }
        }

        return;
    } // end ItemCastSpell   
    
    static SpellArmor(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            if (victim == ch)
                ch.send("You already have armor.\n\r");
            else
                ch.send("They already have armor.\n\r");
            return;
        }
        else
        {
            var affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Where = "ToAffects";
            affect.Location = "Armor";
            affect.Duration = level / 2;
            affect.Modifier = -20;
            affect.DisplayName = "armor";
            affect.EndMessage = "The armor surrounding you fades.";
            affect.EndMessageToRoom = "The armor surrounding $n fades.";
            affect.AffectType = castType == "Cast" ? "Spell" : "Commune";
            victim.AffectToChar(affect);
            victim.send("You are surrounded by armor.\n\r");
            victim.Act("$n is surrounded by armor.\n\r", null, null, null, "ToRoom");
        }
    }
}

module.exports = Magic;