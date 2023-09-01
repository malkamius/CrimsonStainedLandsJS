const Utility = require("./Utility");
const Combat = require("./Combat");
const Character = require("./Character");
const SkillSpell = require("./SkillSpell");
const AffectData = require("./AffectData");
const DamageMessage = require("./DamageMessage");

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
                if (arg2.ISEMPTY())
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
            ch.Act("$n closes their eyes for a moment.", null, null, null, "ToRoom");
            ch.Act("You close your eyes for a moment as you pray to your diety.", null, null, null, "ToChar");
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
                    if (Magic.IsSafeSpell(ch, victim, false) && ch != victim)
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
    
    static SavesSpell(level, victim, damageType)
    {
        var save;

        if (victim == null) return false;

        save = 35 + (victim.Level - level) * 5 - victim.SavingThrow;
        if (victim.IsAffected("Berserk"))
            save += victim.Level / 5;

        if (victim.IsNPC)
            save = victim.Level / 4;  /* simulate npc saving throw */

        // switch (victim.CheckImmune(damageType))
        // {
        //     case ImmuneStatus.Immune: return true;
        //     case ImmuneStatus.Resistant: save += 2; break;
        //     case ImmuneStatus.Vulnerable: save -= 2; break;
        // }
        save = Utility.URANGE(5, save, 98);
        return Utility.NumberPercent() < save;
    }
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

    static SpellSanctuary(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected("Sanctuary"))
        {
            if (victim != ch)
                ch.send("They are already protected by a white aura.\n\r");
            else
                ch.send("You are already protected by a white aura.");
            return;
        }
        else
        {
            //if (victim.IsAffected(AffectFlags.Haven)) victim.AffectFromChar(victim.FindAffect("Haven"), AffectRemoveReason.WoreOff);
            victim.send("A white aura surrounds you.\n\r");
            victim.Act("A white aura surrounds $n.", null, null, null, "ToRoom");
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = "None";
            affect.Where = "ToAffects";
            affect.Flags["Sanctuary"] = true;
            affect.Duration = 5 + level / 5;
            affect.DisplayName = "sanctuary";
            affect.EndMessage = "Your white aura fades.\n\r";
            affect.EndMessageToRoom = "$n's white aura fades.\n\r";
            affect.AffectType = castType == "Cast" ? "Spell" : "Commune";
            victim.AffectToChar(affect);

        }
    }

    static SpellCureLight(CastType, spell, level, ch, victim, item, args, target)
    {
        if (victim == null)
            victim = ch;

        var heal = (ch.Level * 1.5) + Utility.Random(ch.Level / 2, ch.Level);

        victim.HitPoints = Math.min(victim.HitPoints + heal, victim.MaxHitPoints);
        if (Character.Positions.indexOf(victim.Position) <= Character.Positions.indexOf("Stunned"))
            Combat.UpdatePosition(victim);
        victim.send("Your wounds are slightly healed.\n\r");
        victim.Act("$n's wounds are slightly healed.\n\r", null, null, null, "ToRoom");
    }
    static SpellMendWounds(CastType, spell, level, ch, victim, item, args, target)
    {
        if (victim == null)
            victim = ch;

        var heal = ch.GetDamage(Math.min(level, 17), 1, 1, 20);
        victim.HitPoints = Math.min(victim.HitPoints + heal, victim.MaxHitPoints);
        if (Character.Positions.indexOf(victim.Position) <= Character.Positions.indexOf("Stunned"))
            Combat.UpdatePosition(victim);
        victim.Act("Your wounds are healed.\n\r", victim);
        victim.Act("$n's wounds are healed.\n\r", null, null, null, "ToRoom");
    }
    static SpellCureSerious(CastType, spell, level, ch, victim, item, args, target)
    {
        if (victim == null)
            victim = ch;

        var heal = (ch.Level * 2.5) + Utility.Random(ch.Level / 2, ch.Level);
        victim.HitPoints = Math.min(victim.HitPoints + heal, victim.MaxHitPoints);
        if (Character.Positions.indexOf(victim.Position) <= Character.Positions.indexOf("Stunned"))
            Combat.UpdatePosition(victim);
        victim.send("Your wounds are greatly healed.\n\r");
        victim.Act("$n's wounds are greatly healed.\n\r", null, null, null, "ToRoom");
    }

    static SpellCureCritical(CastType, spell, level, ch, victim, item, args, target)
    {
        if (victim == null)
            victim = ch;

        var heal = (ch.Level * 4) + Utility.Random(ch.Level / 2, ch.Level);
        victim.HitPoints = Math.min(victim.HitPoints + heal, victim.MaxHitPoints);
        if (Character.Positions.indexOf(victim.Position) <= Character.Positions.indexOf("Stunned"))
            Combat.UpdatePosition(victim);
        victim.send("Your wounds are immensely healed.\n\r");
        victim.Act("$n's wounds are immensely healed.\n\r", null, null, null, "ToRoom");
    }
    static SpellHeal(CastType, spell, level, ch, victim, item, args, target)
    {
        if (victim == null)
            victim = ch;

        var heal = (ch.Level * 5) + Utility.Random(ch.Level / 2, ch.Level);
        victim.HitPoints = Math.min(victim.HitPoints + heal, victim.MaxHitPoints);
        if (Character.Positions.indexOf(victim.Position) <= Character.Positions.indexOf("Stunned"))
            Combat.UpdatePosition(victim);
        victim.send("Your wounds are healed.\n\r");
        victim.Act("$n's wounds are healed.\n\r", null, null, null, "ToRoom");
    }
    static SpellRejuvenate(CastType, spell, level, ch, victim, item, args, target)
    {
        if (victim == null)
            victim = ch;

        var heal = (ch.Level * 6) + Utility.Random(ch.Level / 2, ch.Level);
        victim.HitPoints = Math.min(victim.HitPoints + heal, victim.MaxHitPoints);
        if (Character.Positions.indexOf(victim.Position) <= Character.Positions.indexOf("Stunned"))
            Combat.UpdatePosition(victim);
        victim.send("Your wounds are healed.\n\r");
        victim.Act("$n's wounds are healed.\n\r", null, null, null, "ToRoom");
    }
    static SpellBless(CastType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            ch.send("They are already blessed.\n\r");
            return;
        }
        else
        {

            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.Hitroll;
            affect.Duration = 10 + level / 4;
            affect.Modifier = Math.Max(3, level / 3);
            affect.DisplayName = "blessed";
            affect.AffectType = castType == "Cast" ? "Spell" : "Commune";
            victim.AffectToChar(affect);

            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.Damroll;
            affect.Duration = 10 + level / 4;
            affect.Modifier = Math.Max(3, level / 3);
            affect.DisplayName = "blessed";
            affect.AffectType = castType == "Cast" ? "Spell" : "Commune";
            victim.AffectToChar(affect);

            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.Saves;
            affect.Duration = 10 + level / 4;
            affect.Modifier = -(Math.Max(5, level / 3));
            affect.DisplayName = "blessed";
            affect.AffectType = castType == "Cast" ? "Spell" : "Commune";
            victim.AffectToChar(affect);

            affect.EndMessage = "The blessing surrounding you fades.\n\r";
            affect.EndMessageToRoom = "The blessing surrounding $n fades.\n\r";

            victim.send("You are surrounded by a blessing.\n\r");
            victim.Act("$n is surrounded by a blessing.", null, null, null, "ToRoom");
        }
    }

    static SpellPrayer(castType, spell, level, ch, victim, item, args )
    {
        var affect;

        ch.Act("$n kneels and prays for a blessing.", null, null, null, "ToRoom");

        for (var GroupMember in ch.Room.Characters.Select((p) => p.IsSameGroup(ch)))
        {
            if (!GroupMember.IsAffected(spell))
            {
                affect = new AffectData();
                affect.SkillSpell = spell;
                affect.Level = level;
                affect.Where = "ToAffects";
                affect.Location = "Hitroll";
                affect.Duration = 10 + level / 4;
                affect.Modifier = Math.Max(3, level / 3);
                affect.DisplayName = "blessed";
                affect.AffectType = castType == "Cast" ? "Spell" : "Commune";
                GroupMember.AffectToChar(affect);

                affect = new AffectData();
                affect.SkillSpell = spell;
                affect.Level = level;
                affect.Where = "ToAffects";
                affect.Location = "Damroll";
                affect.Duration = 10 + level / 4;
                affect.Modifier = Math.Max(3, level / 3);
                affect.DisplayName = "blessed";
                affect.AffectType = castType == "Cast" ? "Spell" : "Commune";
                GroupMember.AffectToChar(affect);

                affect = new AffectData();
                affect.SkillSpell = spell;
                affect.Level = level;
                affect.Where = "ToAffects";
                affect.Location = ApplyTypes.Saves;
                affect.Duration = 10 + level / 4;
                affect.Modifier = -(Math.Max(5, level / 3));
                affect.DisplayName = "blessed";
                affect.AffectType = castType == "Cast" ? "Spell" : "Commune";
                GroupMember.AffectToChar(affect);

                affect.EndMessage = "The blessing surrounding you fades.\n\r";
                affect.EndMessageToRoom = "The blessing surrounding $n fades.\n\r";

                GroupMember.send("You are surrounded by a blessing.\n\r");
                GroupMember.Act("$n is surrounded by a blessing.", null, null, null, "ToRoom");
            }
        }
    }

    static SpellBlindness(castType, spell, ch_level, ch, victim, item, args )
    {
        var affect;
        if (victim == null)
            victim = ch.Fighting;
        if (victim == null)
            ch.send("You aren't fighting anyone.\n\r");
        else if ((affect = victim.FindAffect(spell)) != null)
        {
            ch.send("They are already blind.\n\r");
            return;
        }
        // else if ((victim.ImmuneFlags.ISSET(WeaponDamageTypes.Blind) || (victim.Form != null && victim.Form.ImmuneFlags.ISSET(WeaponDamageTypes.Blind))) && !victim.IsAffected(AffectFlags.Deafen))
        //     victim.Act("$n is immune to blindness.", null, null, null, "ToRoom");
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = ch_level;
            affect.Where = "ToAffects";
            affect.Location = "Hitroll";
            affect.Flags.Add(AffectFlags.Blind);
            affect.Duration = Math.Max(3, ch_level / 3);
            affect.Modifier = -4;
            affect.DisplayName = "Blinded";
            affect.EndMessage = "You can see again.\n\r";
            affect.EndMessageToRoom = "$n can see again.\n\r";
            affect.AffectType = AffectTypes.Malady; //castType == "Cast" ? "Spell" : "Commune";
            victim.AffectToChar(affect);
            victim.send("You are blinded.\n\r");
            victim.Act("$n is blinded.\n\r", null, null, null, "ToRoom");
        }
    }

    static SpellCreateBread(castType, spell, ch_level, ch, victim, item, args )
    {
        var template;
        if ((template = ItemTemplateData.ItemTemplates[13]))
        {
            var bread = new ItemData(template);
            ch.Room.Items.unshift(bread);
            bread.Room = ch.Room;
            ch.send("You create a loaf of bread out of thin air.\n\r");
            ch.Act("$n creates a loaf of bread out of thin air.\n\r", null, null, null, "ToRoom");
        }
    }

    static SpellDetectInvis(castType, spell, level, ch, victim, item, args )
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            if (ch != victim)
                ch.send("They can already see the invisible.\n\r");
            else
                ch.send("You can already see the invisible.\n\r");
            return;
        }
        else
        {

            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = "None";
            affect.Where = "ToAffects";
            affect.Flags["DetectInvis"] = true;
            affect.Duration = 10 + level / 4;
            affect.DisplayName = "detect invisibility";
            affect.EndMessage = "You can no longer see the invisible.\n\r";
            affect.AffectType = castType == "Cast" ? "Spell" : "Commune";

            victim.AffectToChar(affect);


            victim.send("Your eyes tingle.\n\r");
            if (ch != victim)
                ch.send("Ok.\n\r");
        }
    }
    static SpellInfravision(castType, spell, level, ch, victim, item, args )
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            if (ch != victim)
                ch.send("They can already see through the darkness.\n\r");
            else
                ch.send("You can already see through the darkness.\n\r");
            return;
        }
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = "None";
            affect.Where = "ToAffects";
            affect.Flags["Infrared"] = true;
            affect.Duration = 10 + level / 4;
            affect.DisplayName = "Infravision";
            affect.EndMessage = "You can no longer see through the darkness.\n\r";
            affect.AffectType = castType == "Cast" ? "Spell" : "Commune";

            victim.AffectToChar(affect);

            victim.send("Your eyes briefly glow red.\n\r");
            if (ch != victim)
                ch.send("Ok.\n\r");
        }
    }

    static SpellInvis(castType, spell, level, ch, victim, item, args )
    {
        var affect;
        if (victim == null)
            victim = ch;

        var fog = SkillSpell.SkillLookup("faerie fog");
        var fire = SkillSpell.SkillLookup("faerie fire");

        if (victim.IsAffected(fog) || victim.IsAffected(fire) || victim.IsAffected(AffectFlags.FaerieFire))
        {
            if (victim != ch)
                ch.send("They can't become invisible while glowing.\n\r");
            else
                ch.send("You cannot become invisible while glowing.\n\r");
            return;
        }

        if ((affect = victim.FindAffect(spell)))
        {
            if (victim != ch)
                ch.send("They are already invisible.\n\r");
            else
                ch.send("You are already invisible.");
            return;
        }
        else
        {
            victim.send("You fade out of existence.\n\r");
            victim.Act("$n fades out of existence.", null, null, null, "ToRoom");
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = "None";
            affect.Where = "ToAffects";
            affect.Flags["Invisible"] = true;
            affect.Duration = 10 + level / 4;
            affect.DisplayName = "invisibility";
            affect.EndMessage = "You fade into existence.\n\r";
            affect.EndMessageToRoom = "$n fades back into existence.\n\r";
            affect.AffectType = castType == "Cast" ? "Spell" : "Commune";

            victim.AffectToChar(affect);
        }
    }

    static AffectPlagueTick(ch, affect)
    {
        Combat.Damage(ch, ch, Math.max(affect.Level, 12), affect.SkillSpell, "Disease", affect.OwnerName);
    }

    static AffectPoisonTick(ch, affect)
    {
        Combat.Damage(ch, ch, Math.max(affect.Level / 2, 8), affect.SkillSpell, "Poison", affect.OwnerName);
    }

    static AffectAlcoholPoisonTick(ch, affect)
    {
        Combat.Damage(ch, ch, Math.max(affect.Level / 5, 5), affect.SkillSpell, "Poison", affect.OwnerName);
    }

    static SpellPoison(castType, spell, ch_level, ch, victim, item, args)
    {
        var affect;
        if (victim == null)
            victim = ch.Fighting;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            ch.send("They are already poisoned.\n\r");
            return;
        }
        else
        {
            if (Magic.SavesSpell(ch_level, victim, WeaponDamageTypes.Poison))
            {
                victim.Act("$n turns slightly green, but it passes.", null, null, null, "ToRoom");
                victim.send("You feel momentarily ill, but it passes.\n\r");
                return;
            }

            affect = new AffectData();
            affect.OwnerName = ch.Name;
            affect.SkillSpell = spell;
            affect.Level = ch_level;
            affect.Where = "ToAffects";
            affect.Location = "Strength";
            affect.Flags["Poison"] = true;
            affect.Duration = 3;
            affect.Modifier = -3;
            affect.DisplayName = "Poisoned";
            affect.EndMessage = "You feel less sick.\n\r";
            affect.EndMessageToRoom = "$n starts looking less sick.\n\r";
            affect.AffectType = AffectTypes.Malady; //castType == "Cast" ? "Spell" : "Commune";

            victim.AffectToChar(affect);
            victim.send("You feel very sick.\n\r");
            victim.Act("$n looks very ill.", null, null, null, "ToRoom");
        }
    }
    static SpellWordOfRecall(castType, spell, ch_level, ch, victim, item, args )
    {
        if (victim == null)
            victim = ch;
        var recallroom;
        if ((recallroom = victim.GetRecallRoom()) == null) //!RoomData.rooms.TryGetValue(3001, out recallroom))
        {
            ch.send("You can't seem to find home.\n\r");
            return;
        }
        victim.send("Your vision swirls a moment as you are transported to another place.\n\r");
        victim.Act("$n disappears.", null, null, null, "ToRoom");

        //if (victim.Fighting != null)
        Combat.StopFighting(victim, true);

        ch.MovementPoints /= 2;

        victim.RemoveCharacterFromRoom();
        victim.AddCharacterToRoom(recallroom);

        victim.Act("$n appears in the room.", null, null, null, "ToRoom");
        //Character.DoLook(victim, "auto");
    }
    static SpellRemoveCurse(castType, spell, ch_level, ch, victim, item, args )
    {
        if (victim == null)
            victim = ch;

        if (target.equals("targetItem"))
        {
            if (item != null)
            {
                if (item.ExtraFlags.ISSET("NoRemove") || item.ExtraFlags.ISSET("NoDrop"))
                {
                    item.ExtraFlags.RemoveFlag("NoRemove");
                    item.ExtraFlags.RemoveFlag("NoDrop");
                    ch.Act("$p glows white as its curse is lifted.", null, item, null, "ToChar");
                    ch.Act("$p glows white as its curse is lifted.", null, item, null, "ToRoom");
                }
                else
                    ch.Act("$p isn't cursed.", null, item, null, "ToChar");
            }
        }
        else
        {
            if (victim != null)
            {
                var count = 0;
                var victimname = "";
                [victimname, args] = args.OneArgument();
                if (!args.ISEMPTY())
                {
                    [item, count] = victim.GetItemEquipment(args, count);
                    if (!item)
                        [item, count] = victim.GetItemInventory(args, count);

                    if (!item)
                    {
                        ch.send("You can't find it.\n\r");
                        return;
                    }

                    if (item.ExtraFlags.ISSET("NoRemove") || item.ExtraFlags.ISSET("NoDrop"))
                    {
                        item.ExtraFlags.RemoveFlag("NoRemove");
                        item.ExtraFlags.RemoveFlag("NoDrop");
                        ch.Act("$p glows white as its curse is lifted.", null, item, null, "ToChar");
                        ch.Act("$p glows white as its curse is lifted.", null, item, null, "ToRoom");
                        return;
                    }
                    else
                    {
                        ch.Act("$p isn't cursed.", null, item, null, "ToChar");
                        return;
                    }
                }

                var curse = victim.FindAffect("Curse");// (from aff in victim.AffectsList where aff.flags.ISSET(AffectFlags.Curse) select aff).FirstOrDefault();

                if (curse != null)
                {
                    victim.AffectFromChar(curse, "Cleansed");
                    ch.Act("You place your hand on $N's head for a moment and a look of relief passes over $M.", victim, null, null, "ToChar");
                    ch.Act("$n places their hand on $N's head for a moment and a look of relief passes over $M.", victim, null, null, "ToRoomNotVictim");
                    ch.Act("$n places their hand on your head for a moment and a feeling of relief passes over you.", victim, null, null, "ToVictim");
                }
                else
                    ch.Act("$N isn't cursed in any way you can intervene.", victim, null, null, "ToChar");
            }
        }
    }

    static SpellWrath(castType, spell, ch_level, ch, victim, item, args )
    {
        var dam;

        if (!victim.Alignment.equals("Evil"))
        {
            ch.Act("$N is unaffected by $n's heavenly wrath.", victim, null, null, "ToRoomNotVictim");
            ch.Act("You are unaffected by $n's heavenly wrath.\n\r", victim, null, null, "ToVictim");
            ch.send("The Gods do not enhance your wrath and frown on your actions.\n\r");
            return;
        }
        var level = ch_level;

        if (!ch.IsNPC && victim.Flags.ISSET("Undead"))
            level += Utility.Random(2, level / 2);

        dam = Utility.Roll([7, level, level + 10]);

        if (Magic.SavesSpell(ch_level, victim, "Holy") || Magic.SavesSpell(ch_level + 5, victim, "Holy"))
        	dam /= 2;

        ch.Act("You call down the wrath of god upon $N.", victim, null, null, "ToChar");
        ch.Act("$n calls down the wrath of god upon $N.", victim, null, null, "ToRoomNotVictim");
        ch.Act("$n calls down the wrath of god upon you.", victim, null, null, "ToVictim");
        Combat.Damage(ch, victim, dam, spell, "Holy");
        return;
    }

    static SpellHolyWrath(castType, spell, ch_level, ch, victim, item, args )
    {
        for (var vict in Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch)
                SpellWrath(castType, spell, ch_level, ch, vict, item, arguments, "targetChar");
        }
    }

    static SpellFlamestrike(castType, spell, ch_level, ch, victim, item, args )
    {
        var dam;

        dam = Utility.Roll([4, ch_level, ch_level]);

        if (Magic.SavesSpell(ch_level, victim, "Fire"))
        	dam /= 2;
        
        ch.Act("You call down a pillar of fire upon $N.", victim, null, null, "ToChar");
        ch.Act("$n calls down a pillar of fire upon $N.", victim, null, null, "ToRoomNotVictim");
        ch.Act("$n calls down a pillar of fire upon you.", victim, null, null, "ToVictim");
        Combat.Damage(ch, victim, dam, spell, "Fire");

        return;
    }
    static SpellShield(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            ch.send("You aren't ready to cast a shield again.\n\r");
            return;
        }
        else if(victim.IsAffected(AffectData.AffectFlags.Shield))
        {
            if (victim != ch)
                ch.send("They are already protected by a shield.\n\r");
            else
                ch.send("You are already protected by a shield.");
            return;
        }
        else
        {
            victim.send("A magical shield surrounds you.\n\r");
            victim.Act("A magical shield surrounds $n.", null, null, null, Character.ActType.ToRoom);
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = ApplyTypes.None;
            affect.Where = AffectWhere.ToAffects;
            affect.DisplayName = "shield cooldown";
            affect.Duration = 24;
            affect.EndMessage = "You feel ready to cast shield again.";
            victim.AffectToChar(affect);

            affect.Flags.Add(AffectData.AffectFlags.Shield);
            affect.Duration = 12 + level / 6;
            affect.Location = ApplyTypes.AC;
            affect.Modifier = -30 - level / 5;
            affect.EndMessage = "Your magical shield fades.\n\r";
            affect.EndMessageToRoom = "$n's magical shield fades.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);
        }
    }

    static SpellWaterShield(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.Watershield))
        {
            if (victim != ch)
                ch.send("They are already protected by your water shield.\n\r");
            else
                ch.send("You are already protected by water shield.");
            return;
        }
        else
        {
            victim.send("A magical water shield surrounds you.\n\r");
            victim.Act("A magical water shield surrounds $n.", null, null, null, Character.ActType.ToRoom);
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.DisplayName = "water shield";
            affect.Duration = 24;
            affect.EndMessage = "Your magical shield of water fades.\n\r";
            affect.EndMessageToRoom = "$n's magical shield of water fades.\n\r";
            affect.EndMessage = "You feel ready to cast water shield again.";
            affect.DamageTypes.Add(DamageMessage.WeaponDamageTypes.Drowning);
            affect.Where = AffectWhere.ToImmune;
            victim.AffectToChar(affect);
        }
    }
    static SpellEarthShield(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.Earthshield))
        {
            if (victim != ch)
                ch.send("They are already protected by your earth shield.\n\r");
            else
                ch.send("You are already protected by earth shield.");
            return;
        }
        else
        {
            victim.send("A magical shield of surrounds you.\n\r");
            victim.Act("A magical shield of earth surrounds $n.", null, null, null, Character.ActType.ToRoom);
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.DisplayName = "earth shield";
            affect.Duration = 24;
            affect.EndMessage = "Your magical shield of earth fades.\n\r";
            affect.EndMessageToRoom = "$n's magical shield of earth fades.\n\r";
            affect.EndMessage = "You feel ready to cast earth shield again.";
            affect.DamageTypes.Add(DamageMessage.WeaponDamageTypes.Bash);
            affect.Where = AffectWhere.ToImmune;
            victim.AffectToChar(affect);
        }
    }
    static SpellAirShield(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.Airshield))
        {
            if (victim != ch)
                ch.send("They are already protected by your air shield.\n\r");
            else
                ch.send("You are already protected by air shield.");
            return;
        }
        else
        {
            victim.send("A magical shield of air surrounds you.\n\r");
            victim.Act("A magical shield of air surrounds $n.", null, null, null, Character.ActType.ToRoom);
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.DisplayName = "air shield";
            affect.Duration = 24;
            affect.EndMessage = "Your magical shield of air fades.\n\r";
            affect.EndMessageToRoom = "$n's magical shield of air fades.\n\r";
            affect.EndMessage = "You feel ready to cast air shield again.";
            affect.DamageTypes.Add(DamageMessage.WeaponDamageTypes.Air);
            affect.Where = AffectWhere.ToImmune;
            victim.AffectToChar(affect);
        }
    }
    static SpellFireShield(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.Fireshield))
        {
            if (victim != ch)
                ch.send("They are already protected by your fire shield.\n\r");
            else
                ch.send("You are already protected by fire shield.");
            return;
        }
        else
        {
            victim.send("A magical shield of fire surrounds you.\n\r");
            victim.Act("A magical shield of fire surrounds $n.", null, null, null, Character.ActType.ToRoom);
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.DisplayName = "fire shield";
            affect.Duration = 24;
            affect.EndMessage = "Your magical shield of fire fades.\n\r";
            affect.EndMessageToRoom = "$n's magical shield of fire fades.\n\r";
            affect.EndMessage = "You feel ready to cast fire shield again.";
            affect.DamageTypes.Add(DamageMessage.WeaponDamageTypes.Fire);
            affect.Where = AffectWhere.ToImmune;
            victim.AffectToChar(affect);
        }
    }
    static SpellLightningShield(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.Lightningshield))
        {
            if (victim != ch)
                ch.send("They are already protected by your lightning shield.\n\r");
            else
                ch.send("You are already protected by lightning shield.");
            return;
        }
        else
        {
            victim.send("A magical shield of lightning crackles around you.\n\r");
            victim.Act("A magical shield of lightning crackles around $n.", null, null, null, Character.ActType.ToRoom);
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.DisplayName = "fire shield";
            affect.Duration = 24;
            affect.EndMessage = "Your magical shield of lightning fades.\n\r";
            affect.EndMessageToRoom = "$n's magical shield of lightning fades.\n\r";
            affect.EndMessage = "You feel ready to cast lightning shield again.";
            affect.DamageTypes.Add(DamageMessage.WeaponDamageTypes.Lightning);
            affect.Where = AffectWhere.ToImmune;
            victim.AffectToChar(affect);
        }
    }
    static SpellFrostShield(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.Frostshield))
        {
            if (victim != ch)
                ch.send("They are already protected by your frost shield.\n\r");
            else
                ch.send("You are already protected by frost shield.");
            return;
        }
        else
        {
            victim.send("You sence tingling and numbing of your skin.\n\r");
            victim.Act("A magical shield of frost surrounds $n.", null, null, null, Character.ActType.ToRoom);
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.DisplayName = "fire shield";
            affect.Duration = 24;
            affect.EndMessage = "Your magical shield of frost fades.\n\r";
            affect.EndMessageToRoom = "$n's magical shield of frost fades.\n\r";
            affect.EndMessage = "You feel ready to cast frost shield again.";
            affect.DamageTypes.Add(DamageMessage.WeaponDamageTypes.Cold);
            affect.Where = AffectWhere.ToImmune;
            victim.AffectToChar(affect);
        }
    }
    static SpellCureBlindness(castType, spell, ch_level, ch, victim, item, args, target)
    {
    /*
        if (victim == null) victim = ch;

        var blindness = (from aff of victim.AffectsList where aff.Flags.ISSET(AffectData.AffectFlags.Blind) && (aff.AffectType == AffectData.AffectTypes.Malady || aff.AffectType == AffectData.AffectTypes.Spell || aff.AffectType == AffectData.AffectTypes.Commune) select aff).FirstOrDefault();

        if (blindness != null)
        {
            victim.AffectFromChar(blindness, AffectData.AffectRemoveReason.Cleansed);

            if (ch != victim)
            {
                ch.Act("You place your hand over $N's eyes for a moment and the cloudy look filling them goes away.", victim, null, null, Character.ActType.ToChar);
                ch.Act("$n places their hand over $N's eyes for a moment and the cloudy look filling them goes away.", victim, null, null, Character.ActType.ToRoomNotVictim);
                ch.Act("$n places their hand over your eyes for a moment.", victim, null, null, Character.ActType.ToVictim);
            }
            else
                ch.send("OK.\n\r");
        }
        else
            ch.Act("$N isn't blinded of a way you can cure.", victim, Character.ActType.ToChar);
    */
    }

    static SpellPassDoor(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.PassDoor))
        {
            if (victim != ch)
                ch.send("They are already out of phase.\n\r");
            else
                ch.send("You are already out of phase.\n\r");
            return;
        }
        else
        {
            victim.send("You phase of and out of existence.\n\r");
            victim.Act("$n phases of and out of existence.", null, null, null, Character.ActType.ToRoom);
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = ApplyTypes.None;
            affect.Where = AffectWhere.ToAffects;
            affect.Flags.Add(AffectData.AffectFlags.PassDoor);
            affect.Duration = 5 + level / 3;
            affect.DisplayName = "pass door";
            affect.EndMessage = "Your feel less translucent.\n\r";
            affect.EndMessageToRoom = "$n appears less translucent.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;

            victim.AffectToChar(affect);

        }
    }

    static CheckSpellcraft(ch, spell)
    {
        if(spell instanceof String) spell = SkillSpell.SkillLookup(spell);
        var chance;
        var symbol = null;
        //ItemData ring = null;

        if (!spell) return false;
        chance = ch.GetSkillPercentage("spellcraft");
        if (chance <= 1)
            return false;
        symbol = ch.Equipment["Held"];
        if (symbol && symbol.VNum == 14739)
            chance += 15;

        chance /= 5;

        var spellcraftII = ch.GetSkillPercentage("spellcraft II");
        if (spellcraftII <= 75)
            chance += 5;
        if (spellcraftII <= 85)
            chance += 6;
        if (spellcraftII <= 95)
            chance += 7;
        if (spellcraftII == 100)
            chance += 8;

        if (Utility.NumberPercent() > chance)
        {
            ch.CheckImprove("spellcraft", false, 6);
            if (ch.GetSkillPercentage("spellcraft II") != 0)
            {
                ch.CheckImprove("spellcraft", false, 6);
            }
            return false;

        }

        ch.CheckImprove("spellcraft II", true, 6);

        ch.CheckImprove("spellcraft", true, 6);

        return true;
    }

    static SpellcraftDamagDice(num, die)
    {
        var dam;
        if (num == 0 || die == 0)
            return 0;

        if (die == 1)
            return num;
        else if (die == 2)
            return (num * 2);
        else if (die == 3)
            return (num * Utility.Random(2, 3));

        dam = (num * die) / 2;
        dam += Utility.Roll([num / 2, die]);
        return dam;
    }

    static SpellSummon(castType, spell, level, ch, victim, item, args, target)
    {


        if (([victim] = Character.CharacterFunctions.GetCharacterList(ch, Character.Characters, args)) == null
            || victim == ch
            || victim.Room == null
            || (!victim.IsNPC && victim.Room.Area != ch.Room.Area)
            || ch.Room.Flags.ISSET(RoomFlags.Safe)
            || (victim.IsNPC && victim.IsAffected(AffectData.AffectFlags.Charm) && victim.Room.Area != ch.Room.Area)
            || victim.Room.Flags.ISSET(RoomFlags.Safe)
            || victim.Room.Flags.ISSET(RoomFlags.Private)
            || victim.Room.Flags.ISSET(RoomFlags.Solitary)
            || victim.Room.Flags.ISSET(RoomFlags.NoRecall)
            || ch.Room.Flags.ISSET(RoomFlags.NoRecall)
            || (victim.IsNPC && victim.Flags.ISSET(ActFlags.Aggressive))
            || victim.Level >= (level + 10)
            || (!victim.IsNPC && victim.Level >= Game.LEVEL_IMMORTAL)
            || victim.Fighting != null
            || (victim.IsNPC && victim.Flags.ISSET(ActFlags.Shopkeeper))
            || (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Other)))
        {
            ch.send("You failed.\n\r");
            return;
        }

        victim.Act("$n disappears suddenly.", null, null, null, Character.ActType.ToRoom);
        victim.RemoveCharacterFromRoom();
        ch.Act("$n has summoned you!", victim, null, null, Character.ActType.ToVictim);
        victim.AddCharacterToRoom(ch.Room);
        victim.Act("$n arrives suddenly.", null, null, null, Character.ActType.ToRoom);
        
        return;
    }
    static SpellTeleport(castType, spell, level, ch, victim, item, args, target)
    {
        const RoomData = require("./RoomData");
        if (ch.Room == null
            || (!ch.IsNPC && ch.Room.Flags.ISSET(RoomFlags.NoRecall))
            || (!ch.IsNPC && ch.Fighting != null)
            )
        {
            ch.send("You failed.\n\r");
            return;
        }
        var room = RoomData.Rooms.SelectRandom();

        if (room == null || !(ch.IsImmortal || ch.IsNPC || (ch.Level <= room.MaxLevel && ch.Level >= room.MinLevel)))
        {
            ch.send("You failed.\n\r");
            return;
        }

        ch.Act("$n vanishes!", null, null, null, Character.ActType.ToRoom);
        ch.RemoveCharacterFromRoom();
        ch.AddCharacterToRoom(room);
        ch.Act("$n slowly fades into existence.", null, null, null, Character.ActType.ToRoom);
        
        return;
    }
    static SpellFireball(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));

        ch.Act("The air surrounding you grows into a heat wave!", null, null, null, Character.ActType.ToChar);
        ch.Act("$n makes the air grow into a heat wave!", null, null, null, Character.ActType.ToRoom);

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                var dam = ch.GetDamage(level, 1, 2);

                if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Fire))
                    dam /= 2;

                if (spellcraft) dam += level;

                Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Fire);
                ch.CheckImprove(spell, true, 1);
            }
        }
    } // end fireball
    static SpellConeOfCold(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));

        ch.Act("As you bring your hands together, a cone of freezing ice shoots out from your fingertips.", null, null, null, Character.ActType.ToChar);
        ch.Act("As $N brings $s hands together, a cone of freezing ice shoots out from $s fingertips.", null, null, null, Character.ActType.ToRoom);

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                var dam = ch.GetDamage(level, 1, 2);

                if (spellcraft)
                    dam += level;
                if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Cold))
                    dam /= 2;

                Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Cold);
                ch.CheckImprove(spell, true, 1);
            }
        }
    } // end cone of cold
    static SpellControlledFireball(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));

        ch.Act("The air surrounding you grows into a giant heat wave!", null, null, null, Character.ActType.ToChar);
        ch.Act("$n makes the air grow into a giant heat wave!", null, null, null, Character.ActType.ToRoom);

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (((vict.Fighting != null && vict.Fighting.IsSameGroup(ch)) || ch.Fighting == vict) && vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                var dam = ch.GetDamage(level, 1, 2);

                if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Fire))
                    dam /= 2;

                if (spellcraft) dam += level;

                Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Fire);
                ch.CheckImprove(spell, true, 1);
            }
        }
    } // end controlled fireball
    static SpellNova(castType, spell, level, ch, victim, item, args, target)
    {
        var sector = ch.Room.Sector;
        var checkSector = ((sector == SectorTypes.Inside));
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));

        ch.Act("You emit a soundless scream as waves of heat roll out from your mouth.", null, null, null, Character.ActType.ToChar);
        ch.Act("With hands outstretched and face to the sky, " +
            "$n opens his mouth of a soundless scream as waves of heat roll out from $s.".WrapText(), null, null, null, Character.ActType.ToRoom);

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (((vict.Fighting != null && vict.Fighting.IsSameGroup(ch)) || ch.Fighting == vict) && vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                var dam = ch.GetDamage(level, 1, 2);

                if (spellcraft)
                    dam += level;
                if (checkSector)
                    dam *= 2;
                if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Fire))
                    dam /= 2;

                Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Fire);
                ch.CheckImprove(spell, true, 1);
            }
        }
    } // end nova
    static SpellAvalanche(castType, spell, level, ch, victim, item, args, target)
    {
        var sector = ch.Room.Sector;
        var checkSector = ((sector == SectorTypes.Mountain) || (sector == SectorTypes.Cave) || (sector == SectorTypes.Underground));
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));

        ch.Act("You summon an avalanche from the surrounding rocks!", null, null, null, Character.ActType.ToChar);
        ch.Act("$n summons an avalanche from the surrounding rocks!", null, null, null, Character.ActType.ToRoom);

        if (checkSector) ch.Act("You summon powerful avalanche!", null, null, null, Character.ActType.ToChar);

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                var dam = ch.GetDamage(level, .5, 1);  //dam = Utility.Random(dam_each[level], dam_each[level] * 2);

                if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Bash))
                    dam /= 2;

                if (checkSector)
                    dam *= 2;

                if (spellcraft) dam += level;

                Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Bash);
                ch.CheckImprove(spell, true, 1);
            }
        }
    } // end avalanche

    static SpellMagicMissile(castType, spell, level, ch, victim, item, args, target)
    {

        var dam = ch.GetDamage(level, .5, 2);  //dam = Utility.Random(dam_each[level] / 2, dam_each[level] * 2);

        if (Magic.CheckSpellcraft(ch, spell))
            dam += level;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Energy))
            dam /= 2;
        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Energy);
        return;
    }

    static SpellDetectMagic(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            if (ch != victim)
                ch.send("They can already sense magic.\n\r");
            else
                ch.send("You can already sense magic.\n\r");
            return;
        }
        else
        {

            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = ApplyTypes.None;
            affect.Where = AffectWhere.ToAffects;
            affect.Flags.Add(AffectData.AffectFlags.DetectMagic);
            affect.Duration = 10;
            affect.DisplayName = "detect magic";
            affect.EndMessage = "You can no longer sense magic.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);


            victim.send("Your eyes feel different.\n\r");
            if (ch != victim)
                ch.send("Ok.\n\r");
        }
    }

    static SpellDispelMagic(castType, spell, level, ch, victim, item, args, target)
    {
        if (victim == null) victim = ch;
        var stripped = false;
        for (var aff of Utility.CloneArray(victim.Affects))
        {
            if (aff.AffectType == AffectData.AffectTypes.Spell || aff.AffectType == AffectData.AffectTypes.Commune)
            {
                var striplevel = aff.Level - ch.Level;
                var chance = 75;
                if (striplevel < 0)
                    chance += 25;
                else if (striplevel > 5)
                    chance -= 25;

                if (Utility.NumberPercent() < chance)
                {
                    stripped = true;
                    victim.AffectFromChar(aff, AffectData.AffectRemoveReason.Cleansed);
                }
            }
        }
        if (stripped)
            ch.send("Ok.\n\r");
        else
            ch.send("You failed.\n\r");
    }

    static SpellCureDisease(castType, spell, level, ch, victim, item, args, target)
    {
        if (victim == null) victim = ch;
        var stripped = false;

        for (var aff of Utility.CloneArray(victim.Affects))
        {
            if ((aff.AffectType == AffectData.AffectTypes.Malady || aff.AffectType == AffectData.AffectTypes.Spell || aff.AffectType == AffectData.AffectTypes.Commune) &&
                (aff.SkillSpell == SkillSpell.SkillLookup("plague") || aff.Flags.ISSET(AffectData.AffectFlags.Plague)))
            {
                var striplevel = aff.Level - ch.Level;
                var chance = 75;
                if (striplevel < 0)
                    chance += 25;
                else if (striplevel > 5)
                    chance -= 25;

                if (Utility.NumberPercent() < chance)
                {
                    stripped = true;
                    victim.AffectFromChar(aff, AffectData.AffectRemoveReason.Cleansed);

                    // remove all of the affect of that type
                    for (var affother of Utility.CloneArray(victim.Affects))
                    {
                        if (affother != aff && affother.skillSpell == aff.SkillSpell)
                            victim.AffectFromChar(affother, AffectData.AffectRemoveReason.Cleansed);
                    }
                }
                else
                    ch.send("You fail to remove {0}.\n\r", aff.DisplayName);
            }
        }
        if (stripped)
            ch.send("Ok.\n\r");
        else
            ch.send("You failed.\n\r");
    }

    static SpellCurePoison(castType, spell, level, ch, victim, item, args, target)
    {
        if (victim == null) victim = ch;
        var stripped = false;

        for (var aff of Utility.CloneArray(victim.Affects))
        {
            if ((aff.AffectType == AffectData.AffectTypes.Malady || aff.AffectType == AffectData.AffectTypes.Spell || aff.AffectType == AffectData.AffectTypes.Commune) &&
                (aff.SkillSpell == SkillSpell.SkillLookup("poison") || aff.Flags.ISSET(AffectData.AffectFlags.Poison)))
            {
                var striplevel = aff.Level - ch.Level;
                var chance = 75;
                if (striplevel < 0)
                    chance += 25;
                else if (striplevel > 5)
                    chance -= 25;

                if (Utility.NumberPercent() < chance)
                {
                    stripped = true;
                    victim.AffectFromChar(aff, AffectData.AffectRemoveReason.Cleansed);

                    // remove all of the affect of that type
                    for (var affother of Utility.CloneArray(victim.Affects))
                    {
                        if (affother != aff && affother.skillSpell == aff.SkillSpell)
                            victim.AffectFromChar(affother, AffectData.AffectRemoveReason.Cleansed);
                    }
                }
                else
                    ch.send("You fail to remove {0}.\n\r", aff.DisplayName);
            }
        }
        if (stripped)
            ch.send("Ok.\n\r");
        else
            ch.send("You failed.\n\r");
    }

    static SpellStoneskin(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            if (ch != victim)
                ch.send("They already have stoneskin.\n\r");
            else
                ch.send("You already have stoneskin.\n\r");
            return;
        }
        else
        {

            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = ApplyTypes.Armor;
            affect.Duration = 10 + level / 4;
            affect.Modifier = -30 - ((level / 2) - 10);
            affect.DisplayName = "stoneskin";
            affect.EndMessage = "Your stoneskin fades..\n\r";
            affect.EndMessageToRoom = "$n's stoneskin fades.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);
            victim.send("Your skin turns to stone.\n\r");
            victim.Act("$n's skin turns to stone.\n\r", null, null, null, Character.ActType.ToRoom);
        }
    }
    static SpellSheenOfStone(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            if (ch != victim)
                ch.send("They're skin already glistens with a sheen of stone.\n\r");
            else
                ch.send("Your skin already glistens with a sheen of stone.\n\r");
            return;
        }
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = ApplyTypes.Armor;
            affect.Duration = 10 + level / 4;
            affect.Modifier = -60 - ((level / 2) - 20);
            affect.DisplayName = "Sheen of Stone";
            affect.EndMessage = "Your sheen of stone fades..\n\r";
            affect.EndMessageToRoom = "$n's sheen of stone fades.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);
            victim.send("Your skin glistens with a sheen of stone.\n\r");
            victim.Act("$n's skin glistnes with a sheen of stone.\n\r", null, null, null, Character.ActType.ToRoom);
        }
    }
    static SpellFly(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.Flying))
        {
            if (ch != victim)
                ch.send("They are already flying.\n\r");
            else
                ch.send("You are already flying.\n\r");
            return;
        }
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.None;
            affect.Duration = level / 2;
            affect.Modifier = 0;
            affect.Flags.SETBIT(AffectData.AffectFlags.Flying);
            affect.DisplayName = "fly";
            affect.EndMessage = "You fall back to the ground.\n\r";
            affect.EndMessageToRoom = "$n falls back to the ground.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);
            victim.send("Your feet lift off the ground as you begin to fly.\n\r");
            victim.Act("$n's feet lift off the ground as they begin to fly.\n\r", null, null, null, Character.ActType.ToRoom);
        }
    }
    static SpellWaterBreathing(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.WaterBreathing))
        {
            if (ch != victim)
                ch.send("They already have gills.\n\r");
            else
                ch.send("Your gills already give you water breathing..\n\r");
            return;
        }
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.None;
            affect.Duration = level / 2;
            affect.Modifier = 0;
            affect.Flags.SETBIT(AffectData.AffectFlags.WaterBreathing);
            affect.DisplayName = "water breathing";
            affect.EndMessage = "Your gills disappear, preventing you from breath underwater anymore.\n\r";
            affect.EndMessageToRoom = "$n's gills disappear.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);
            victim.send("Miniature gills apear on the side of your face.\n\r");
            victim.Act("Miniature gills appear on the side of $n's face.\n\r", null, null, null, Character.ActType.ToRoom);
        }
    }

    static SpellGiantStrength(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            if (ch != victim)
                ch.send("Their strength is already increased.\n\r");
            else
                ch.send("You already have the strength of giants.\n\r");
            return;
        }
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = ApplyTypes.Strength;
            affect.Where = AffectWhere.ToAffects;
            affect.Duration = level / 2;
            affect.Modifier = 3 + (level / 7);
            affect.DisplayName = "giant strength";
            affect.EndMessage = "Your giant strength fades..\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);
            victim.send("You feel the strength of giants enter you.\n\r");
            victim.Act("$n appears to be stronger.\n\r", null, null, null, Character.ActType.ToRoom);
        }
    }

    static SpellPlague(castType, spell, ch_level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch.Fighting;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.Plague))
        {
            ch.send("They are already afflicted with the plague.\n\r");
            return;
        }
        else
        {
            if (Magic.SavesSpell(ch_level, victim, DamageMessage.WeaponDamageTypes.Poison))
            {
                victim.Act("$n starts to break out with sores, but recovers.", null, null, null, Character.ActType.ToRoom);
                victim.send("You start to break out with sores, but recover.\n\r");
                return;
            }

            affect = new AffectData();
            affect.OwnerName = ch.Name;
            affect.SkillSpell = spell;
            affect.Level = ch_level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.Strength;
            affect.Flags.Add(AffectData.AffectFlags.Plague);
            affect.Duration = Math.Max(3, ch_level / 4);
            affect.Modifier = -5;
            affect.DisplayName = "plague";
            affect.EndMessage = "Your sores disappear.\n\r";
            affect.EndMessageToRoom = "$n's sores disappear.\n\r";
            affect.AffectType = AffectData.AffectTypes.Malady; // castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;

            victim.AffectToChar(affect);
            victim.send("You break out of sores.\n\r");
            victim.Act("$n breaks out of sores.", null, null, null, Character.ActType.ToRoom);
        }
    }

    static SpellArcaneNuke(castType, spell, ch_level, ch, victim, item, args, target)
    {
        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                var damage = Utility.Roll([25, 4, 20]);

                ch.Act("$n's arcane nuke hits $N!", vict, null, null, Character.ActType.ToRoomNotVictim);
                ch.Act("$n's arcane nuke hits you!", vict, null, null, Character.ActType.ToVictim);
                ch.Act("Your arcane nuke hits $N!", vict, null, null, Character.ActType.ToChar);

                Combat.Damage(ch, vict, damage, spell, DamageMessage.WeaponDamageTypes.Force);
            }
        }
    }

    static SpellIdentify(castType, spell, ch_level, ch, victim, item, args, target)
    {
    /*
        var buffer = new StringBuilder();
        buffer.Append(new string('-', 80) + "\n\r");
        buffer.AppendFormat("Object {0} can be referred to as '{1}'\n\rIt is of type {2} and level {3}\n\r", item.ShortDescription, item.Name,
            string.Join(" ", (from flag of item.ItemType.Distinct() select flag.ToString())), item.Level);
        buffer.AppendFormat("It is worth {0} silver and weighs {1} pounds.\n\r", item.Value, item.Weight);

        if (item.ItemType.ISSET(ItemTypes.Weapon))
        {
            if (item.WeaponDamageType != null)
                buffer.AppendFormat("Damage Type is {0}\n\r", item.WeaponDamageType.Keyword);
            buffer.AppendFormat("Weapon Type is {0} with damage dice of {1} (avg {2})\n\r", item.WeaponType, item.DamageDice, item.DamageDice);

        }

        if (item.ItemType.ISSET(ItemTypes.Container))
        {
            buffer.AppendFormat("It can hold {0} pounds.", item.MaxWeight);
        }

        if (item.ItemType.ISSET(ItemTypes.Food))
        {
            buffer.AppendFormat("It is edible and provides {0} nutrition.\n\r", item.Nutrition);
        }

        if (item.ItemType.ISSET(ItemTypes.DrinkContainer))
        {
            buffer.AppendFormat("Nutrition {0}, Drinks left {1}, Max Capacity {2}, it is filled with '{3}'\n\r", item.Nutrition, item.Charges, item.MaxCharges, item.Liquid);
        }

        buffer.AppendFormat("It is made out of '{0}'\n\r", item.Material);
        if (item.timer > 0)
            buffer.AppendFormat("It will decay of {0} hours.\n\r", item.timer);

        if (item.ItemType.ISSET(ItemTypes.Armor) || item.ItemType.ISSET(ItemTypes.Clothing))
        {
            buffer.AppendFormat("It provides armor against bash {0}, slash {1}, pierce {2}, magic {3}\n\r", item.ArmorBash, item.ArmorSlash, item.ArmorPierce, item.ArmorExotic);
        }
        buffer.AppendFormat("It can be worn on {0} and has extra flags of {1}.\n\r", string.Join(", ", (from flag of item.wearFlags.Distinct() select flag.ToString())),
            string.Join(", ", (from flag of item.ExtraFlags.Distinct() select flag.ToString())));

        buffer.AppendFormat("Affects: \n   {0}\n\r", string.Join("\n   ", (from aff of item.affects where aff.@where == AffectWhere.ToObject select aff.Location.ToString() + " " + aff.Modifier)));

        if (item.ItemType.ISSET(ItemTypes.Staff) || item.ItemType.ISSET(ItemTypes.Wand) || item.ItemType.ISSET(ItemTypes.Scroll) || item.ItemType.ISSET(ItemTypes.Potion))
        {
            buffer.AppendFormat("It contains the following spells:\n\r   {0}", string.Join("\n   ", from itemspell of item.Spells select (itemspell.SpellName + " [lvl " + itemspell.Level + "]")) + "\n\r");
        }

        if (item.ItemType.ISSET(ItemTypes.Staff) || item.ItemType.ISSET(ItemTypes.Wand))
        {
            buffer.AppendFormat("It has {0} of {1} charges left\n\r", item.Charges, item.MaxCharges);
        }

        buffer.Append(new string('-', 80) + "\n\r");
        ch.send(buffer.ToString());
    */
    } // end SpellIdentify

    static SpellLocateObject(castType, spell, ch_level, ch, victim, item, args, target)
    {
        using (new Character.Page(ch))
        {
            for (var locate of ItemData.Items)
            {
                if (args.ISEMPTY() || locate.Name.IsName(args))
                {
                    try
                    {
                        ch.send(locate.Display(ch) + " {0} {1}\n\r",
                            (locate.CarriedBy != null ? "held by" : (locate.Room != null ? "on the ground in" : (locate.Container != null ? "contained in" : ""))),
                            (locate.CarriedBy != null ? locate.CarriedBy.Display(ch) : (locate.Room != null ? (TimeInfo.IS_NIGHT && !locate.Room.NightName.ISEMPTY() ? locate.Room.NightName : locate.Room.Name) : (locate.Container != null ? locate.Container.Display(ch) : ""))));
                    }
                    catch (ex)
                    {
                    }

                }
            }
        }
    } // end locate object

    static SpellEnchantArmor(castType, spell, ch_level, ch, victim, item, args, target)
    {
        if (item == null)
        {
            ch.send("You don't see that here.\n\r");
            return;
        }
        else if (!item.ItemType.ISSET(ItemTypes.Armor) && !item.ItemType.ISSET(ItemTypes.Clothing))
        {
            ch.send("That isn't armor.\n\r");
            return;
        }
        else
        {
            // TODO Chance to fail / maybe destroy item?
            var aff = item.Affects.FirstOrDefault(ia => ia.SkillSpell == spell && ia.Location == AffectData.ApplyTypes.AC);

            if (aff != null && aff.Modifier >= 50)
            {
                ch.Act("$p flares blindingly and then fades completely.\n\r", null, item);
                ch.Act("$p flares blindingly and then fades completely.\n\r", null, item, null, Character.ActType.ToRoom);

                if (Character.ItemFunctions.GetEquipmentWearSlot(ch,item))
                {
                    ch.AffectApply(aff, true);
                }
                item.Affects.Remove(aff);
                item.ExtraFlags.Remove(ExtraFlags.Glow);
                item.ExtraFlags.Remove(ExtraFlags.Hum);

            }
            else if (aff != null)
            {
                if (Character.ItemFunctions.GetEquipmentWearSlot(ch, item))
                {
                    ch.AffectApply(aff, true);
                }
                aff.Modifier += 10;
                if (Character.ItemFunctions.GetEquipmentWearSlot(ch, item))
                {
                    ch.AffectApply(aff, false);
                }
                ch.Act("$p glows blue briefly before fading slightly.\n\r", null, item);
                ch.Act("$p glows blue briefly before fading slightly.\n\r", null, item, null, Character.ActType.ToRoom);

            }
            else
            {
                aff = new AffectData();
                aff.SkillSpell = spell;
                aff.Where = AffectWhere.ToObject;
                aff.Location = ApplyTypes.AC;
                aff.Modifier = 10;
                aff.Level = ch_level;
                aff.Duration = -1;
                item.affects.Add(aff);
                item.ExtraFlags.SETBIT(ExtraFlags.Glow);
                item.ExtraFlags.SETBIT(ExtraFlags.Hum);
                if (ch.GetEquipmentWearSlot(item) != null)
                {
                    ch.AffectApply(aff);
                }
                ch.Act("$p glows blue briefly before fading slightly.\n\r", null, item);
                ch.Act("$p glows blue briefly before fading slightly.\n\r", null, item, null, Character.ActType.ToRoom);

            }
        }
    } // end enchant armor

    static SpellEnchantWeapon(castType, spell, ch_level, ch, victim, item, args, target)
    {
        if (item == null)
        {
            ch.send("You don't see that here.\n\r");
            return;
        }
        else if (!item.ItemType.ISSET(ItemTypes.Weapon))
        {
            ch.send("That isn't a weapon.\n\r");
            return;
        }
        else
        {
            // TODO Chance to fail / maybe destroy item?
            var aff = item.Affects.FirstOrDefault(ia => ia.SkillSpell == spell && ia.Location == AffectData.ApplyTypes.Damroll);
            var aff2 = item.Affects.FirstOrDefault(ia => ia.SkillSpell == spell && ia.Location == AffectData.ApplyTypes.Hitroll);
            var worn = Character.ItemFunctions.GetEquipmentWearSlot(ch, item) != null;
            if (aff != null && aff.Modifier >= 6)
            {
                ch.Act("$p flares blindingly and then fades completely.\n\r", null, item);
                ch.Act("$p flares blindingly and then fades completely.\n\r", null, item, null, Character.ActType.ToRoom);

                if (worn)
                {
                    ch.AffectApply(aff, true);
                    ch.AffectApply(aff2, true);
                }
                item.affects.Remove(aff);
                item.affects.Remove(aff2);
                item.ExtraFlags.Remove(ExtraFlags.Glow);
                item.ExtraFlags.Remove(ExtraFlags.Hum);

            }
            else if (aff != null)
            {
                if (worn)
                {
                    ch.AffectApply(aff, true);
                    ch.AffectApply(aff2, true);
                }
                aff.Modifier += 1;
                aff2.modifier += 1;
                if (worn)
                {
                    ch.AffectApply(aff);
                    ch.AffectApply(aff2);
                }

                ch.Act("$p glows blue briefly before fading slightly.\n\r", null, item);
                ch.Act("$p glows blue briefly before fading slightly.\n\r", null, item, null, Character.ActType.ToRoom);

            }
            else
            {
                aff = new AffectData();
                aff.SkillSpell = spell;
                aff.Location = ApplyTypes.Damroll;
                aff.Modifier = 1;
                aff.Level = ch_level;
                aff.Duration = -1;
                aff.Where = AffectWhere.ToObject;

                aff2 = new AffectData();
                aff2.where = AffectWhere.ToObject;
                aff2.skillSpell = spell;
                aff2.location = ApplyTypes.Hitroll;
                aff2.modifier = 1;
                aff2.duration = -1;
                aff2.level = ch_level;

                item.affects.Add(aff);
                item.affects.Add(aff2);

                item.ExtraFlags.SETBIT(ExtraFlags.Glow);
                item.ExtraFlags.SETBIT(ExtraFlags.Hum);
                if (worn)
                {
                    ch.AffectApply(aff);
                    ch.AffectApply(aff2);
                }
                ch.Act("$p glows blue briefly before fading slightly.\n\r", null, item);
                ch.Act("$p glows blue briefly before fading slightly.\n\r", null, item, null, Character.ActType.ToRoom);

            }
        }
    } // end enchant weapon

    static SpellCurse(castType, spell, ch_level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch.Fighting;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.Curse))
        {
            ch.send("They are already cursed.\n\r");
            return;
        }
        else
        {
            if (Magic.SavesSpell(ch_level, victim, DamageMessage.WeaponDamageTypes.Negative))
            {
                victim.Act("$n turns to look uncfomfortable but recovers.", null, null, null, Character.ActType.ToRoom);
                victim.send("You feel momentarily uncomfortable but recover.\n\r");
                return;
            }

            affect = new AffectData();
            affect.OwnerName = ch.Name;
            affect.SkillSpell = spell;
            affect.Level = ch_level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.None;
            affect.Flags.Add(AffectData.AffectFlags.Curse);
            affect.Duration = ch_level / 4;
            affect.Modifier = 0;
            affect.DisplayName = "Cursed";
            affect.EndMessage = "You feel less unclean.\n\r";
            affect.EndMessageToRoom = "$n looks less uncomfortable.\n\r";
            affect.AffectType = AffectData.AffectTypes.Malady; //castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;

            victim.AffectToChar(affect);
            victim.send("You feel unclean.\n\r");
            victim.Act("$n looks very uncomfortable.", null, null, null, Character.ActType.ToRoom);
        }
    } // end curse

    static SpellWeaken(castType, spell, ch_level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch.Fighting;

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.Weaken))
        {
            ch.send("They are already weakened.\n\r");
            return;
        }
        else
        {
            if (Magic.SavesSpell(ch_level, victim, DamageMessage.WeaponDamageTypes.Negative))
            {
                victim.Act("$n looks weaker for a moment but recovers.", null, null, null, Character.ActType.ToRoom);
                victim.send("You feel weaker for a moment but recover.\n\r");
                return;
            }

            affect = new AffectData();
            affect.OwnerName = ch.Name;
            affect.SkillSpell = spell;
            affect.Level = ch_level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.Strength;
            affect.Flags.Add(AffectData.AffectFlags.Weaken);
            affect.Duration = ch_level / 4;
            affect.Modifier = -5;
            affect.DisplayName = "Weakened";
            affect.EndMessage = "You feel stronger.\n\r";
            affect.EndMessageToRoom = "$n looks like a weight has been lifted off of $m.\n\r";
            affect.AffectType = AffectData.AffectTypes.Malady;  //castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;

            victim.AffectToChar(affect);
            victim.send("You feel weaker.\n\r");
            victim.Act("$n looks weaker.", null, null, null, Character.ActType.ToRoom);
        }
    } // end weaken

    static SpellCreateFood(castType, spell, ch_level, ch, victim, item, args, target)
    {
        var template;
        if ((template = ItemTemplateData.ItemTemplates[13]))
        {
            var bread = new ItemData(template);
            ch.Room.Items.unshift(bread);
            bread.Room = ch.Room;
            ch.send("You create a loaf of bread out of thin air.\n\r");
            ch.Act("$n creates a loaf of bread out of thin air.\n\r", null, null, null, Character.ActType.ToRoom);
        }
    }

    static SpellCreateSpring(castType, spell, ch_level, ch, victim, item, args, target)
    {
        var template;
        if ((template = ItemTemplateData.ItemTemplates[22]))
        {
            var spring = new ItemData(template);
            ch.Room.Items.unshift(spring);
            spring.Room = ch.Room;
            spring.timer = 7;
            ch.send("You create a spring of water flowing out of the ground.\n\r");
            ch.Act("$n creates a spring of water flowing out of the ground.\n\r", null, null, null, Character.ActType.ToRoom);
        }
    }

    static SpellCreateWater(castType, spell, ch_level, ch, victim, item, args, target)
    {
        if (item != null && !item.ItemType.ISSET(ItemTypes.DrinkContainer))
        {
            ch.send("That can't hold water.\n\r");
        }

        if (item == null)
        {
            ch.send("Fill what with water?");
        }
        else if (item.Charges != 0 && item.Liquid != "water")
        {
            ch.send("It still has something other than water of it.\n\r");
        }
        else
        {
            item.Liquid = "water";
            item.Charges = item.MaxCharges;
            item.Nutrition = Liquid.Liquids["water"].thirst;

            ch.Act("Water flows out of your finger into $p .\n\r", null, item, null, Character.ActType.ToChar);
            ch.Act("Water flows out of $n's finger into $p .\n\r", null, item, null, Character.ActType.ToRoom);
        }
    } // end create water

    static SpellFaerieFog(castType, spell, ch_level, ch, victim, item, args, target)
    {
        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !vict.IsAffected(spell) && !vict.IsAffected(AffectData.AffectFlags.FaerieFire)) // && !ch.IsSameGroup(vict))
            {
                if (vict.FindAffect(spell) != null)
                    continue;

                ch.Act("$N is revealed by $n's faerie fog.", vict, null, null, Character.ActType.ToRoomNotVictim);
                ch.Act("$n's faerie fog reveals you.", vict, null, null, Character.ActType.ToVictim);
                ch.Act("Your faerie fog reveals $N.", vict, null, null, Character.ActType.ToChar);
                var affect = new AffectData();
                affect.OwnerName = ch.Name;
                affect.SkillSpell = spell;
                affect.Level = ch_level;
                affect.Location = ApplyTypes.None;
                //affect.Flags.Add(AffectData.AffectFlags.FaerieFire);
                affect.Where = AffectWhere.ToAffects;
                affect.Duration = ch_level / 5;
                affect.Modifier = 0;
                affect.DisplayName = "Faerie Fogged";
                affect.EndMessage = "You stop glowing purple.\n\r";
                affect.EndMessageToRoom = "$n stops glowing purple.\n\r";
                affect.AffectType = AffectData.AffectTypes.Malady; //castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
                vict.AffectToChar(affect);
                vict.StripHidden();
                vict.StripInvis();
                vict.StripSneak();
                vict.StripCamouflage();
            }
        }
    }

    static SpellFaerieFire(castType, spell, ch_level, ch, victim, item, args, target)
    {
        if (victim.FindAffect(spell) != null)
        {
            ch.send("They are already glowing.\n\r");
            return;
        }

        ch.Act("$N is revealed by $n's faerie fire.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n's faerie fire reveals you.", victim, null, null, Character.ActType.ToRoom);
        ch.Act("Your faerie fire reveals $N.", victim, null, null, Character.ActType.ToChar);
        var affect = new AffectData();
        affect.OwnerName = ch.Name;
        affect.SkillSpell = spell;
        affect.Level = ch_level;
        affect.Location = ApplyTypes.Hitroll;
        affect.Flags.Add(AffectData.AffectFlags.FaerieFire);
        affect.Duration = ch_level / 4;
        affect.Modifier = -4 - ch.Level / 4;
        affect.Where = AffectWhere.ToAffects;
        victim.AffectToChar(affect);

        affect.Location = ApplyTypes.AC;
        affect.Modifier = +200 + ch.Level * 4;
        affect.DisplayName = "Faerie Fire";
        affect.EndMessage = "You stop glowing purple.\n\r";
        affect.EndMessageToRoom = "$n stops glowing purple.\n\r";
        affect.AffectType = AffectData.AffectTypes.Malady; //castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
        victim.AffectToChar(affect);
        victim.StripHidden();
        victim.StripInvis();
        victim.StripSneak();
        victim.StripCamouflage();
    }

    static SpellHarm(castType, spell, level, ch, victim, item, args, target)
    {
        var dam;

        dam = ch.GetDamage(level, 1, 2, 10);

        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Force))
            dam = dam / 2;

        var chance = ch.GetSkillPercentage("second attack") + 20;
        var chance2 = ch.GetSkillPercentage("third attack") + 20;

        if (chance2 > 21 && Utility.NumberPercent() < chance2)
        {
            Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Force);
            if (victim.Room == ch.Room)
                Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Force);
            if (victim.Room == ch.Room)
                Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Force);
        }
        else if (chance > 21 && Utility.NumberPercent() < chance)
        {
            Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Force);
            if (victim.Room == ch.Room)
                Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Force);
        }
        else Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Force);
    }

    static SpellLightningBolt(castType, spell, level, ch, victim, item, args, target)
    {
        var sector = ch.Room.Sector;
        var checkSector = ((sector == SectorTypes.WaterSwim) || (sector == SectorTypes.Swim) ||
            (sector == SectorTypes.WaterNoSwim) || (sector == SectorTypes.Ocean) ||
            (sector == SectorTypes.River) || (sector == SectorTypes.Underwater));

        var dam = ch.GetDamage(level, .5, 1);// dam = Utility.Random(dam_each[level] / 2, dam_each[level] * 2);
        ch.Act(checkSector ? "Due to the nearness of water, A HUGE bolt of lightning shoots forth from your hands!" :
            "A bolt of lightning shoots forth from your hands!", null, null, null, Character.ActType.ToChar);
        ch.Act("A bolt of lightning shoots from $n's hands!", null, null, null, Character.ActType.ToRoom);

        if (checkSector)
            dam *= 2;
        if (Magic.CheckSpellcraft(ch, spell))
            dam += level;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Lightning))
            dam /= 2;
        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Lightning);
        return;
    }
    static SpellForkedLightning(castType, spell, level, ch, victim, item, args, target)
    {
        var sector = ch.Room.Sector;
        var checkSector = ((sector == SectorTypes.WaterSwim) || (sector == SectorTypes.Swim) ||
            (sector == SectorTypes.WaterNoSwim) || (sector == SectorTypes.Ocean) ||
            (sector == SectorTypes.River) || (sector == SectorTypes.Underwater));
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));

        ch.Act(checkSector ? "Due to the nearness of water, A HUGE bolt of forked lightning shoots forth from your hands!" :
            "A bolt of forked lightning shoots forth from your hands!", null, null, null, Character.ActType.ToChar);
        ch.Act("A bolt of forked lightning shoots from $n's hands!", null, null, null, Character.ActType.ToRoom);

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (((vict.Fighting != null && vict.Fighting.IsSameGroup(ch)) || ch.Fighting == vict) && vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                var dam = ch.GetDamage(level, 1, 2);

                if (checkSector)
                    dam *= 2;
                if (spellcraft)
                    dam += level;
                if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Lightning))
                    dam /= 2;

                Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Lightning);
                ch.CheckImprove(spell, true, 1);
            }
        }
    } // end fireball

    static SpellAcidBlast(castType, spell, level, ch, victim, item, args, target)
    {
        var dam = ch.GetDamage(level, 1, 2);  //dam = Utility.Random(dam_each[level] * 2, dam_each[level] * 4);

        if (Magic.CheckSpellcraft(ch, spell))
            dam += level;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Acid))
            dam /= 2;
        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Acid);
        return;
    }

    static SpellColourSpray(castType, spell, level, ch, victim, item, args, target)
    {
        var dam = ch.GetDamage(level, 2, 4); // Utility.Random(dam_each[level] * 2, dam_each[level] * 4);

        if (Magic.CheckSpellcraft(ch, spell))
            dam += level;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Light))
            dam /= 2;
        else
            SpellBlindness(castType, SkillSpell.SkillLookup("blindness"), level / 2, ch, victim, item, args, target);

        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Light);
        return;
    }

    static SpellChillTouch(castType, spell, level, ch, victim, item, args, target)
    {
        var dam = ch.GetDamage(level, .5, 1);

        if (Magic.CheckSpellcraft(ch, spell))
            dam += level;

        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Cold))
            dam /= 2;
        else
        {
            var affect = new AffectData();
            affect.OwnerName = ch.Name;
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = ApplyTypes.Strength;
            affect.Where = AffectWhere.ToAffects;
            affect.Duration = 6;
            affect.Modifier = -1;
            affect.DisplayName = "Chill Touch";
            affect.EndMessage = "You feel less chilled.\n\r";
            affect.EndMessageToRoom = "$n looks less chilled.\n\r";
            affect.AffectType = AffectData.AffectTypes.Malady; //castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectApply(affect);
            victim.Act("$n turns blue and shivers.\n\r", null, null, null, Character.ActType.ToRoom);
            victim.Act("You turn blue and shiver.\n\r", null, null, null, Character.ActType.ToChar);
        }

        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Cold);
        return;
    }

    //static SpellDetectEvil(castType, spell, level, ch, victim, item, args, target)
    //{
    //    var affect;
    //    if (victim == null)
    //        victim = ch;

    //    if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.DetectEvil))
    //    {
    //        if (victim != ch)
    //            ch.send("They can already sense evil.\n\r");
    //        else
    //            ch.send("You can already sense evil when it is present.");
    //        return;
    //    }
    //    else
    //    {
    //        victim.send("You feel able to sense evil.\n\r");
    //        //victim.Act("$n is protected from evil.", null, null, null, Character.ActType.ToRoom);
    //        affect = new AffectData();
    //        affect.SkillSpell = spell;
    //        affect.Level = level;
    //        affect.Location = ApplyTypes.None;
    //        affect.Where = AffectWhere.ToAffects;
    //        affect.Flags.Add(AffectData.AffectFlags.DetectEvil);
    //        affect.Duration = 10 + level / 4;
    //        affect.DisplayName = "detect evil";
    //        affect.EndMessage = "Your feel less aware of evil.\n\r";
    //        //affect.EndMessageToRoom = "$n's protection wanes.\n\r";
    //        affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;

    //        victim.AffectToChar(affect);


    //    }
    //}
    //static SpellDetectGood(castType, spell, level, ch, victim, item, args, target)
    //{
    //    var affect;
    //    if (victim == null)
    //        victim = ch;

    //    if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.DetectGood))
    //    {
    //        if (victim != ch)
    //            ch.send("They can already sense good.\n\r");
    //        else
    //            ch.send("You can already sense good when it is present.\n\r");
    //        return;
    //    }
    //    else
    //    {
    //        victim.send("You feel able to sense good.\n\r");
    //        //victim.Act("$n is protected from evil.", null, null, null, Character.ActType.ToRoom);
    //        affect = new AffectData();
    //        affect.SkillSpell = spell;
    //        affect.Level = level;
    //        affect.Location = ApplyTypes.None;
    //        affect.Where = AffectWhere.ToAffects;
    //        affect.Flags.Add(AffectData.AffectFlags.DetectGood);
    //        affect.Duration = 10 + level / 4;
    //        affect.DisplayName = "detect good";
    //        affect.EndMessage = "Your feel less aware of good.\n\r";
    //        //affect.EndMessageToRoom = "$n's protection wanes.\n\r";
    //        affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;

    //        victim.AffectToChar(affect);
    //    }
    //}
    static SpellRefresh(castType, spell, level, ch, victim, item, args, target)
    {
        if (victim == null)
            victim = ch;

        if (victim.MovementPoints == victim.MaxMovementPoints)
        {
            if (victim != ch)
                ch.send("Their feet are already fully rested.\n\r");
            else
                ch.send("Your feet are already fully rested.");
            return;
        }
        else
        {
            victim.send("You feel able to walk further.\n\r");
            victim.Act("$n looks refreshed.", null, null, null, Character.ActType.ToRoom);

            victim.MovementPoints += level; // over refresh :D

        }
    }
    static SpellSleep(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
        {
            ch.send("You can't find them.\n\r");
            return;
        }

        if ((affect = victim.FindAffect(spell)) != null || victim.IsAffected(AffectData.AffectFlags.Sleep))
        {
            ch.send("They are already forced asleep.\n\r");
            return;
        }
        else
        {
            // Saves ??
            victim.send("You feel very sleepy ..... zzzzzz.\n\r");
            victim.Act("$n goes to sleep.", null, null, null, Character.ActType.ToRoom);

            Combat.StopFighting(victim, true);
            victim.Position = Positions.Sleeping;

            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = ApplyTypes.None;
            affect.Where = AffectWhere.ToAffects;
            affect.Flags.Add(AffectData.AffectFlags.Sleep);
            affect.Duration = Math.Max(5, level / 4);
            affect.DisplayName = "sleep";
            affect.EndMessage = "Your feel less tired.\n\r";
            affect.EndMessageToRoom = "$n looks less tired.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;

            victim.AffectToChar(affect);
        }
    }
    static SpellCancellation(castType, spell, level, ch, victim, item, args, target)
    {
        if (victim == null) victim = ch;
        var stripped = false;
        for (var aff of Utility.CloneArray(victim.Affects))
        {
            if (aff.AffectType == AffectData.AffectTypes.Spell || aff.AffectType == AffectData.AffectTypes.Commune)
            {
                var striplevel = aff.Level - ch.Level;
                var chance = 75;
                if (striplevel < 0)
                    chance += 25;
                else if (striplevel > 5)
                    chance -= 25;

                if (Utility.NumberPercent() < chance)
                {
                    stripped = true;
                    victim.AffectFromChar(aff, AffectData.AffectRemoveReason.Cleansed);
                }
            }
        }
        if (stripped)
            ch.send("Ok.\n\r");
        else
            ch.send("You failed.\n\r");
    }
    static SpellCauseLight(castType, spell, level, ch, victim, item, args, target)
    {
        Combat.Damage(ch, victim, Utility.Roll([1, 8]) + level / 3, spell, DamageMessage.WeaponDamageTypes.Force);
        return;
    }

    static SpellCauseSerious(castType, spell, level, ch, victim, item, args, target)
    {
        Combat.Damage(ch, victim, Utility.Roll([2, 8]) + level / 2, spell, DamageMessage.WeaponDamageTypes.Force);
        return;
    }

    static SpellCauseCritical(castType, spell, level, ch, victim, item, args, target)
    {
        Combat.Damage(ch, victim, Utility.Roll([3, 8]) + level - 6, spell, DamageMessage.WeaponDamageTypes.Force);
        return;
    }

    static SpellSlow(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(AffectData.AffectFlags.Slow)) != null)
        {
            if (ch != victim)
                ch.send("They are already moving more slowly.\n\r");
            else
                ch.send("Your movements are already slowed.\n\r");
            return;
        }
        else if ((affect = victim.FindAffect(AffectData.AffectFlags.Haste)) != null)
        {
            victim.AffectFromChar(affect, AffectData.AffectRemoveReason.WoreOff);
        }
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.Hitroll;
            affect.Duration = 5 + level / 4;
            affect.Modifier = -4;
            affect.DisplayName = "slow";
            affect.Flags.SETBIT(AffectData.AffectFlags.Slow);
            affect.EndMessage = "Your movement quickens.\n\r";
            affect.EndMessageToRoom = "$n is moving more quickly.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);
            victim.send("You begin to move more slowly.\n\r");
            victim.Act("$n begins to move more slowly.\n\r", null, null, null, Character.ActType.ToRoom);
        }
    }
    static SpellHaste(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(AffectData.AffectFlags.Haste)) != null)
        {
            if (ch != victim)
                ch.send("They are already moving more quickly.\n\r");
            else
                ch.send("Your movements is already quickened.\n\r");
            return;
        }
        else if ((affect = victim.FindAffect(AffectData.AffectFlags.Slow)) != null)
        {
            victim.AffectFromChar(affect, AffectData.AffectRemoveReason.WoreOff);
        }
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = ApplyTypes.Hitroll;
            affect.Duration = 5 + level / 4;
            affect.Modifier = 4 + level / 6;
            affect.DisplayName = "haste";
            affect.Where = AffectWhere.ToAffects;
            affect.Flags.SETBIT(AffectData.AffectFlags.Haste);
            affect.EndMessage = "Your movement slows down.\n\r";
            affect.EndMessageToRoom = "$n is moving more slowly.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);
            victim.send("You begin to move more quickly.\n\r");
            victim.Act("$n begins to move more quickly.\n\r", null, null, null, Character.ActType.ToRoom);
        }
    }
    static SpellProtectiveShield(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            if (ch != victim)
                ch.send("They are already surrounded by a protective shield.\n\r");
            else
                ch.send("You are already surrounded by a protective shield.\n\r");
            return;
        }
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.None;
            affect.Duration = 10 + level / 4;
            affect.Modifier = 0;
            affect.DisplayName = "protective shield";
            affect.EndMessage = "Your protective shield fades.\n\r";
            affect.EndMessageToRoom = "$n's protective shield fades.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);
            victim.send("You are surrounded by a protective shield.\n\r");
            victim.Act("$n is surrounded by a protective shield.\n\r", null, null, null, Character.ActType.ToRoom);
        }
    }
    static SpellFrenzy(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(AffectData.AffectFlags.Berserk)) != null)
        {
            if (ch != victim)
                ch.send("They are already of a frenzied state.\n\r");
            else
                ch.send("You are already of a frenzied state.\n\r");
            return;
        }
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.Hitroll;
            affect.Duration = 10 + level / 4;
            affect.Modifier = level / 4;
            affect.Flags.Add(AffectData.AffectFlags.Berserk);
            affect.DisplayName = "frenzy";
            affect.EndMessage = "Your frenzy fades.\n\r";
            affect.EndMessageToRoom = "$n's frenzied look fades.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);

            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.Damroll;
            affect.Duration = 10 + level / 4;
            affect.Modifier = level / 4;
            affect.Flags.Add(AffectData.AffectFlags.Berserk);
            affect.DisplayName = "frenzy";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);

            victim.send("You enter a frenzied state.\n\r");
            victim.Act("$n enters a frenzied state.\n\r", null, null, null, Character.ActType.ToRoom);
        }
    }
    static SpellChangeSex(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            if (ch != victim)
                ch.send("They've already been changed.\n\r");
            else
                ch.send("You've already been changed.\n\r");
            return;
        }
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Where = AffectWhere.ToAffects;
            affect.Location = ApplyTypes.Sex;
            affect.Duration = level * 2;
            affect.Modifier = 1;
            affect.DisplayName = "change sex";
            affect.EndMessage = "Your sex returns to normal.";
            affect.EndMessageToRoom = "$n's sex returns to normal.";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);


            victim.Act("You feel different.", null, null, null, Character.ActType.ToChar);
            victim.Act("$n doesn't look like $mself anymore...", null, null, null, Character.ActType.ToRoom);
        }
    }
    static SpellEnergyDrain(castType, spell, level, ch, victim, item, args, target)
    {
        var amount;
        var type;
        if (victim == ch)
        {
            ch.send("You can't drain your own life force.\n\r", ch);
            return;
        }
        switch (Utility.Random(0, 3))
        {
            default: type = 1; amount = Utility.Roll([level, 3]); break;
            case (0):
            case (1):          /* HP */
                type = 1; amount = Utility.Roll([level, 2]); break;
            case (2):       /* move */
                type = 2; amount = Utility.Roll([level, 2]); break;
            case (3):       /* mana */
                type = 3; amount = Utility.Roll([level, 2]); break;
        }
        var amounthp = Utility.Roll([level, 2]);
        victim.send("You feel an icy hand brush against your soul.\n\r");

        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Negative))
        {
            victim.Act("$n turns pale and shivers briefly.", victim, null, null, Character.ActType.ToRoom);
            Combat.Damage(ch, victim, amounthp, spell, DamageMessage.WeaponDamageTypes.Negative);
            return;
        }
        victim.Act("$n gets a horrible look of pain of $s face and shudders of shock.", null, null, null, Character.ActType.ToRoom);

        var affect = new AffectData();
        affect.SkillSpell = spell;
        affect.Level = level;

        affect.Duration = level / 2;
        affect.Where = AffectWhere.ToAffects;
        affect.DisplayName = "energy drain";

        affect.AffectType = AffectData.AffectTypes.Malady;

        switch (type)
        {
            default:
            case (1):
                ch.Act("You drain $N's vitality with vampiric magic.", victim, null, null, Character.ActType.ToChar);
                victim.send("You feel your body being mercilessly drained.\n\r");
                ch.HitPoints = Utility.URANGE(0, ch.HitPoints + amount / 3, ch.MaxHitPoints);

                if (!victim.IsAffected(spell))
                {
                    affect.EndMessage = "Your vitality returns.";
                    affect.EndMessageToRoom = "$n's vitality returns.";

                    affect.Location = ApplyTypes.Constitution;
                    affect.Modifier = -3;
                    victim.AffectToChar(affect);
                }
                break;
            case (2):
                ch.send("Your energy draining invigorates you!\n\r");
                victim.MovementPoints = Utility.URANGE(0, victim.MovementPoints - amount, victim.MaxMovementPoints);
                ch.MovementPoints = Utility.URANGE(0, ch.MovementPoints + amount / 2, ch.MaxMovementPoints);
                victim.send("You feel tired and weakened.\n\r", victim);
                if (!victim.IsAffected(spell))
                {
                    affect.EndMessage = "Your agility returns.";
                    affect.EndMessageToRoom = "$n's agility returns.";

                    affect.Location = ApplyTypes.Dexterity;
                    affect.Modifier = -2;
                    victim.AffectToChar(affect);

                    affect.EndMessage = "";
                    affect.EndMessageToRoom = "";

                    affect.Location = ApplyTypes.Move;
                    affect.Modifier = -amount / 2;
                    victim.AffectToChar(affect);
                }
                break;
            case (3):
                victim.ManaPoints = Utility.URANGE(0, victim.ManaPoints - amount, victim.MaxManaPoints);
                ch.send("Your draining sends warm energy through you!\n\r");

                ch.ManaPoints = Utility.URANGE(0, ch.ManaPoints + amount / 3, ch.MaxManaPoints);
                victim.send("You feel part of your mind being savagely drained.\n\r");
                if (!victim.IsAffected(spell))
                {
                    affect.EndMessage = "Your mental focus returns.";
                    affect.EndMessageToRoom = "$n's mental focus returns.";

                    affect.Location = ApplyTypes.Intelligence;
                    affect.Modifier = -3;
                    victim.AffectToChar(affect);

                    affect.EndMessage = "";
                    affect.EndMessageToRoom = "";

                    affect.Location = ApplyTypes.Wisdom;
                    affect.Modifier = -2;
                    victim.AffectToChar(affect);
                }
                break;
        }

        Combat.Damage(ch, victim, amount + amounthp, spell, DamageMessage.WeaponDamageTypes.Negative);
    }
    static SpellGasBreath(castType, spell, ch_level, ch, victim, item, args, target)
    {
        var dam = ch.HitPoints / 9;
        dam += Utility.Roll([ch_level, 5]);
        if (dam > ch.HitPoints)
            dam = ch.HitPoints;

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                ch.Act("$n's gas breath hits $N!", vict, null, null, Character.ActType.ToRoomNotVictim);
                ch.Act("$n's gas breath hits you!", vict, null, null, Character.ActType.ToVictim);
                ch.Act("Your gas breath hits $N!", vict, null, null, Character.ActType.ToChar);

                if (Magic.SavesSpell(ch_level, vict, DamageMessage.WeaponDamageTypes.Poison))
                {
                    Combat.Damage(ch, vict, dam / 2, spell, DamageMessage.WeaponDamageTypes.Poison);
                }
                else
                {
                    Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Poison);
                }
            }
        }
    }
    static SpellFireBreath(castType, spell, ch_level, ch, victim, item, args, target)
    {
        var dam = ch.HitPoints / 9;
        dam += Utility.Roll([ch_level, 5]);
        if (dam > ch.HitPoints)
            dam = ch.HitPoints;

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                ch.Act("$n's fire breath hits $N!", vict, null, null, Character.ActType.ToRoomNotVictim);
                ch.Act("$n's fire breath hits you!", vict, null, null, Character.ActType.ToVictim);
                ch.Act("Your fire breath hits $N!", vict, null, null, Character.ActType.ToChar);

                if (Magic.SavesSpell(ch_level, vict, DamageMessage.WeaponDamageTypes.Fire))
                {
                    Combat.Damage(ch, vict, dam / 2, spell, DamageMessage.WeaponDamageTypes.Fire);
                }
                else
                {
                    Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Fire);
                }
            }
        }
    }
    static SpellAcidBreath(castType, spell, ch_level, ch, victim, item, args, target)
    {
        var dam = ch.HitPoints / 9;
        dam += Utility.Roll([ch_level, 4]);
        if (dam > ch.HitPoints)
            dam = ch.HitPoints;

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                ch.Act("$n's acid breath hits $N!", vict, null, null, Character.ActType.ToRoomNotVictim);
                ch.Act("$n's acid breath hits you!", vict, null, null, Character.ActType.ToVictim);
                ch.Act("Your acid breath hits $N!", vict, null, null, Character.ActType.ToChar);

                if (Magic.SavesSpell(ch_level, vict, DamageMessage.WeaponDamageTypes.Acid))
                {
                    Combat.Damage(ch, vict, dam / 2, spell, DamageMessage.WeaponDamageTypes.Acid);
                }
                else
                {
                    Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Acid);
                }
            }
        }
    }
    static SpellLightningBreath(castType, spell, ch_level, ch, victim, item, args, target)
    {
        var dam = ch.HitPoints / 9;
        dam += Utility.Roll([ch_level, 4]);
        if (dam > ch.HitPoints)
            dam = ch.HitPoints;

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                ch.Act("$n's lightning breath hits $N!", vict, null, null, Character.ActType.ToRoomNotVictim);
                ch.Act("$n's lightning breath hits you!", vict, null, null, Character.ActType.ToVictim);
                ch.Act("Your lightning breath hits $N!", vict, null, null, Character.ActType.ToChar);

                if (Magic.SavesSpell(ch_level, vict, DamageMessage.WeaponDamageTypes.Lightning))
                {
                    Combat.Damage(ch, vict, dam / 2, spell, DamageMessage.WeaponDamageTypes.Lightning);
                }
                else
                {
                    Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Lightning);
                }
            }
        }
    }
    static SpellEarthquake(castType, spell, ch_level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));

        ch.Act("The earth trembles beneath your feet!", null, null, null, Character.ActType.ToChar);
        ch.Act("$n makes the earth tremble and shiver.", null, null, null, Character.ActType.ToRoom);

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                if (vict.IsAffected(AffectData.AffectFlags.Flying))
                {
                    Combat.Damage(ch, vict, 0, spell, DamageMessage.WeaponDamageTypes.Bash);
                    ch.CheckImprove(spell, false, 1);
                }
                else
                {
                    var dam = ch.GetDamage(ch_level, .5, 1);

                    if (spellcraft) dam += ch_level;

                    if (Magic.SavesSpell(ch_level, victim, DamageMessage.WeaponDamageTypes.Bash))
                        dam /= 2;
                    Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Bash);
                    ch.CheckImprove(spell, true, 1);
                }

            }
        }
    }
    static SpellDetectPoison(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            if (ch != victim)
                ch.send("They can already sense poison.\n\r");
            else
                ch.send("You can already sense poison.\n\r");
            return;
        }
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = ApplyTypes.None;
            affect.Where = AffectWhere.ToAffects;
            affect.Duration = 10;
            affect.DisplayName = "detect poison";
            affect.EndMessage = "You can no longer sense poison.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);


            victim.send("Your eyes feel different.\n\r");
            if (ch != victim)
                ch.send("Ok.\n\r");
        }
    }
    static SpellSpiderhands(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim == null)
            victim = ch;

        if ((affect = victim.FindAffect(spell)) != null)
        {
            if (ch != victim)
                ch.send("They already have a spiderlike grip.\n\r");
            else
                ch.send("You already have a spiderlike grip.\n\r");
            return;
        }
        else
        {
            affect = new AffectData();
            affect.SkillSpell = spell;
            affect.Level = level;
            affect.Location = ApplyTypes.None;
            affect.Where = AffectWhere.ToAffects;
            affect.Duration = level / 3;
            affect.DisplayName = "spiderhands";
            affect.EndMessage = "You lose your spiderlike grip.\n\r";
            affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
            victim.AffectToChar(affect);


            victim.send("Your grip tightens like a spider on its prey.\n\r");
            if (ch != victim)
                ch.send("Ok.\n\r");
        }
    }
    static SpellSealOfRighteousness(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim != ch)
            victim = ch;

        StripSeals(victim);

        affect = new AffectData();
        affect.SkillSpell = spell;
        affect.Level = level;
        affect.Where = AffectWhere.ToAffects;
        affect.Location = ApplyTypes.Hitroll;
        affect.Duration = 10 + (level / 4);
        affect.Modifier = level / 4;
        affect.DisplayName = "seal of righteousness";
        affect.EndMessage = "Your seal of righteousness breaks.\n\r";
        affect.EndMessageToRoom = "$n's seal of righteousness breaks.\n\r";
        affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
        victim.AffectToChar(affect);

        victim.send("You gain the effect of a seal of righteousness.\n\r");
        victim.Act("$n gains the effect of a seal of righteousness.\n\r", null, null, null, Character.ActType.ToRoom);

    }
    static StripSeals(ch)
    {
        for (var aff of Utility.CloneArray(ch.Affects))
        {
            if (aff.SkillSpell != null && aff.SkillSpell.name.StartsWith("seal of"))
                ch.AffectFromChar(aff, AffectData.AffectRemoveReason.WoreOff);
        }
    }
    static SpellSealOfLight(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim != ch)
            victim = ch;

        StripSeals(victim);

        affect = new AffectData();
        affect.SkillSpell = spell;
        affect.Level = level;
        affect.Where = AffectWhere.ToAffects;
        affect.Location = ApplyTypes.Saves;
        affect.Duration = 10 + (level / 4);
        affect.Modifier = -(level / 4);
        affect.DisplayName = "seal of light";
        affect.EndMessage = "Your seal of light breaks.\n\r";
        affect.EndMessageToRoom = "$n's seal of light breaks.\n\r";
        affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
        victim.AffectToChar(affect);

        victim.send("You gain the effect of a seal of light.\n\r");
        victim.Act("$n gains the effect of a seal of light.\n\r", null, null, null, Character.ActType.ToRoom);
    }
    static SpellSealOfWisdom(castType, spell, level, ch, victim, item, args, target)
    {
        var affect;
        if (victim != ch)
            victim = ch;

        StripSeals(victim);

        affect = new AffectData();
        affect.SkillSpell = spell;
        affect.Level = level;
        affect.Where = AffectWhere.ToAffects;
        affect.Location = ApplyTypes.Mana;
        affect.Duration = 10 + (level / 4);
        affect.Modifier = level / 3;
        affect.DisplayName = "seal of wisdom";
        affect.EndMessage = "Your seal of wisdom breaks.\n\r";
        affect.EndMessageToRoom = "$n's seal of wisdom breaks.\n\r";
        affect.AffectType = castType == SkillSpell.CastType.Cast ? AffectData.AffectTypes.Spell : AffectData.AffectTypes.Commune;
        victim.AffectToChar(affect);

        victim.send("You gain the effect of a seal of wisdom.\n\r");
        victim.Act("$n gains the effect of a seal of wisdom.\n\r", null, null, null, Character.ActType.ToRoom);
    }
    static DoHeal(ch, args)
    {
        var healer = null;
        if (ch == null) return;

        for (var npc of ch.Room.Characters)
        {
            if (npc.Flags.ISSET(ActFlags.Healer) || npc.Flags.ISSET(ActFlags.Cleric))
            {
                healer = npc;
                break;
            }
        }
        if (healer == null)
        {
            ch.send("There are no healers here.\n\r");
            return;
        }
        if (args.ISEMPTY())
        {
            ch.Act("\\Y$N says 'I offer the following spells:'\\x", healer);
            ch.send("  Light       :  Cure light wounds      100 silver\n\r");
            ch.send("  Serious     :  Cure serious wounds    150 silver\n\r");
            ch.send("  Critic      :  Cure critical wounds   250 silver\n\r");
            ch.send("  Heal        :  Healing spell          400 silver\n\r");
            ch.send("  Blind       :  Cure blindness         150 silver\n\r");
            ch.send("  Disease     :  Cure disease           250 silver\n\r");
            ch.send("  Poison      :  Cure poison            250 silver\n\r");
            ch.send("  Cleanse     :  Cleanse                500 silver\n\r");
            ch.send("  Uncurse     :  Remove curse           100 silver\n\r");
            ch.send("  Restoration :  Restoration            150 silver\n\r");
            ch.send("  Refresh     :  Restore movement       150 silver\n\r");
            ch.send("  Mana        :  Restore mana           100 silver\n\r");
            ch.send(" Type heal <type> to be healed.\n\r");
            return;
        }
        var cost;
        var arg = "";
        spell;
        [arg, args] = args.OneArgument();
        if ("light".prefix(arg))
        {
            spell = SkillSpell.SkillLookup("cure light");
            cost = 100;
        }
        else if ("serious".prefix(arg))
        {
            spell = SkillSpell.SkillLookup("cure serious");
            cost = 150;
        }
        else if ("critical".prefix(arg))
        {
            spell = SkillSpell.SkillLookup("cure critical");
            cost = 250;
        }
        else if ("cleanse".prefix(arg))
        {
            spell = SkillSpell.SkillLookup("cleanse");
            cost = 500;
        }
        else if ("heal".prefix(arg))
        {
            spell = SkillSpell.SkillLookup("heal");
            cost = 400;
        }
        else if ("blindness".prefix(arg))
        {
            spell = SkillSpell.SkillLookup("cure blindness");
            cost = 150;
        }
        else if ("disease".prefix(arg))
        {
            spell = SkillSpell.SkillLookup("cure disease");
            cost = 250;
        }
        else if ("poison".prefix(arg))
        {
            spell = SkillSpell.SkillLookup("cure poison");
            cost = 250;
        }
        else if ("curse".prefix(arg) || "uncurse".prefix(arg))
        {
            spell = SkillSpell.SkillLookup("remove curse");
            cost = 100;
        }
        else if ("restore".prefix(arg) || "restoration".prefix(arg))
        {
            spell = SkillSpell.SkillLookup("restoration");
            cost = 150;
        }
        else if ("mana".prefix(arg) || "energize".prefix(arg))
        {
            spell = SkillSpell.SkillLookup("energize");
            cost = 100;
        }
        else if ("refresh".prefix(arg) || "moves".prefix(arg))
        {
            spell = SkillSpell.SkillLookup("refresh");
            cost = 150;
        }
        else
        {
            ch.Act("\\Y$N says 'Type 'heal' for a list of spells.'\\x",
                healer);
            return;
        }
        if (cost > (ch.Gold * 1000 + ch.Silver))
        {
            ch.Act("\\Y$N says 'You do not have enough gold for my services.'\\x",
                healer);
            return;
        }
        ch.WaitState(Game.PULSE_VIOLENCE);

        if (ch.Silver > cost)
            ch.Silver -= cost;
        else
        {
            ch.Silver += 1000 - cost;
            ch.Gold--;
        }

        healer.Act("$n closes $s eyes for a moment and nods at $N.", ch, null, null, Character.ActType.ToRoomNotVictim);
        healer.Act("$n closes $s eyes for a moment and nods at you.", ch, null, null, Character.ActType.ToVictim);

        if (spell == null || spell.spellFun == null)
        {
            ch.Act("\\Y$N says 'I don't know how to do that yet.'\\x", healer); return;
        }

        spell.spellFun(SkillSpell.CastType.Commune, spell, healer.Level, healer, ch, null, ch.Name + " " + args, TargetIsType.targetChar);
    }
    static SpellImbueWeapon(castType, spell, ch_level, ch, victim, item, args, target)
    {
        if (item == null)
        {
            ch.send("You don't see that here.\n\r");
            return;
        }
        else if (ch.ManaPoints < ch.MaxManaPoints / 2)
        {
            ch.send("You do not have enough mana to cast this spell.\n\r");
            return;
        }
        else if (!item.ItemType.ISSET(ItemTypes.Weapon))
        {
            ch.send("That isn't a weapon.\n\r");
            return;
        }
        else if (ch.GetEquipmentWearSlot(item) != null)
        {
            ch.send("You cannot imbue a weapon you are wielding or holding.\n\r");
            return;
        }
        else
        {
            var vnum = 0;
            if (item.Vnum == 2967) vnum = 2968;
            else if (item.Vnum == 2969) vnum = 2970;
            else
            {
                ch.send("You do not have an appropriate weapon to imbue.\n\r");
                return;
            }
            if (!(ItemTemplate = ItemTemplateData.ItemTemplates[vnum]))
            {
                ch.send("You failed.\n\r");
                return;
            }
            ch.WaitState(spell.waitTime * 2);
            ch.Act("$n imbues $p with a measure of $s life force.", null, null, null, Character.ActType.ToRoom);
            ch.Act("You imbue $p with a measure of your life force.", null, null, null, Character.ActType.ToChar);

            var affmodifiertable = 
            [
                [ 0, 4 ],
                [ 35, 6 ],
                [ 42, 8 ],
                [ 48, 10 ],
                [ 51, 12 ],
                [ 56, 14 ],
            ];
            var mod;
            for(var arr of affmodifiertable)
                if(ch.Level >= arr[0]) mod = arr[1];
            var staffspear = new ItemData(ItemTemplate);

            var affect = new AffectData();
            affect.Duration = -1;
            affect.Where = AffectWhere.ToObject;
            affect.SkillSpell = spell;
            affect.Location = ApplyTypes.DamageRoll;
            affect.Modifier = mod;
            staffspear.affects.Add(new AffectData(affect));
            affect.Location = ApplyTypes.Hitroll;
            staffspear.affects.Add(new AffectData(affect));
            staffspear.DamageDice.DiceSides = 6;
            staffspear.DamageDice.DiceCount = 8;
            staffspear.DamageDice.DiceBonus = ch.Level / 4 + 10;
            staffspear.Level = ch.Level;
            item.Dispose();
            ch.AddInventoryItem(staffspear);
            ch.ManaPoints -= ch.MaxManaPoints / 2;
            Combat.Damage(ch, ch, ch.MaxHitPoints / 2, spell, DamageMessage.WeaponDamageTypes.Magic);
        }
    } // end enchant weapon
    static SpellBlessWeapon(castType, spell, ch_level, ch, victim, item, args, target)
    {
        if (item == null)
        {
            ch.send("You don't see that here.\n\r");
            return;
        }
        else if (!item.ItemType.ISSET(ItemTypes.Weapon))
        {
            ch.send("That isn't a weapon.\n\r");
            return;
        }
        else
        {
            var aff = item.Affects.FirstOrDefault(ia => ia.SkillSpell == spell && ia.Location == AffectData.ApplyTypes.Damroll);
            var aff2 = item.Affects.FirstOrDefault(ia => ia.SkillSpell == spell && ia.Location == AffectData.ApplyTypes.Hitroll);
            var worn = ch.GetEquipmentWearSlot(item) != null;
            if (worn)
            {
                ch.Act("You cannot bless a weapon you are wielding.\n\r");
                return;
            }

            if (aff != null)
            {
                item.affects.Remove(aff);
                item.affects.Remove(aff2);
            }

            aff = new AffectData();
            aff.SkillSpell = spell;
            aff.Location = ApplyTypes.Damroll;
            aff.Modifier = (ch.Level / 10) + 5;
            aff.Level = ch_level;
            aff.Duration = -1;
            aff.Where = AffectWhere.ToObject;

            aff2 = new AffectData();
            aff2.where = AffectWhere.ToObject;
            aff2.skillSpell = spell;
            aff2.location = ApplyTypes.Hitroll;
            aff2.modifier = (ch.Level / 10) + 5;
            aff2.duration = -1;
            aff2.level = ch_level;

            item.affects.Add(aff);
            item.affects.Add(aff2);

            item.ExtraFlags.SETBIT(ExtraFlags.Glow);
            item.ExtraFlags.SETBIT(ExtraFlags.Hum);
            item.WeaponDamageType = WeaponDamageMessage.GetWeaponDamageMessage("Wrath");

            if (worn)
            {
                ch.AffectApply(aff);
                ch.AffectApply(aff2);
            }
            ch.Act("$p glows a deep violet before fading slightly.\n\r", null, item);
            ch.Act("$p glows a deep violet before fading slightly.\n\r", null, item, null, Character.ActType.ToRoom);
        }
    }
    static SpellRemoveTaint(castType, spell, ch_level, ch, victim, item, args, target)
    {
        if (victim == null)
            victim = ch;

        if (target == TargetIsType.targetItem)
        {
            if (item != null)
            {
                if (item.ExtraFlags.ISSET(ExtraFlags.Evil) || item.ExtraFlags.ISSET(ExtraFlags.AntiGood))
                {
                    item.ExtraFlags.REMOVEFLAG(ExtraFlags.Evil);
                    item.ExtraFlags.REMOVEFLAG(ExtraFlags.AntiGood);
                    ch.Act("$p glows white as its tavar is lifted.", null, item, null, Character.ActType.ToChar);
                    ch.Act("$p glows white as its tavar is lifted.", null, item, null, Character.ActType.ToRoom);
                }
                else
                    ch.Act("$p isn't tainted.", null, item, null, Character.ActType.ToChar);
            }
        }
        else
        {
            if (victim != null)
            {
                var count = 0;
                var victimname = "";
                [victimname, args] = args.OneArgument();
                if (!args.ISEMPTY())
                {
                    [item, count] = Character.ItemFunctions.GetItemEquipment(victim, args, count);
                    if (!item)
                        [item, count] = Character.ItemFunctions.GetItemInventory(victim, args, count);

                    if (!item)
                    {
                        ch.send("You can't find it.\n\r");
                        return;
                    }

                    if (item.ExtraFlags.ISSET("Evil") || item.ExtraFlags.ISSET("AntiGood"))
                    {
                        item.ExtraFlags.REMOVEFLAG("Evil");
                        item.ExtraFlags.REMOVEFLAG("AntiGood");
                        ch.Act("$p glows white as its tavar is lifted.", null, item, null, Character.ActType.ToChar);
                        ch.Act("$p glows white as its tavar is lifted.", null, item, null, Character.ActType.ToRoom);
                        return;
                    }
                    else
                    {
                        ch.Act("$p isn't tainted.", null, item, null, Character.ActType.ToChar);
                        return;
                    }
                }
            }
        }
    }
    static StripDamageNounModifiers(ch)
    {
        for (var affect of Utility.CloneArray(ch.Affects))
        {
            if (affect.Where == AffectData.AffectWhere.ToDamageNoun)
            {
                ch.AffectFromChar(affect, AffectData.AffectRemoveReason.WoreOff);
            }
        }
    } // end strip damage noun modifier
    static SpellChannelHeat(castType, spell, ch_level, ch, victim, item, args, target)
    {
        StripDamageNounModifiers(ch);
        ch.Act("$n begins channeling heat.", null, null, null, Character.ActType.ToRoom);
        ch.Act("You channel heat.");
        var affect = new AffectData();
        affect.Where = AffectWhere.ToDamageNoun;
        affect.Duration = 10;
        affect.SkillSpell = spell;
        affect.Level = ch_level;
        affect.DisplayName = spell.name;
        affect.DamageTypes.Add(DamageMessage.WeaponDamageTypes.Fire);
        affect.EndMessage = "You are no longer channeling heat.";
        ch.AffectToChar(affect);
    } // end Channel Heat
    static SpellFrostFingers(castType, spell, ch_level, ch, victim, item, args, target)
    {
        StripDamageNounModifiers(ch);
        ch.Act("$n begins channeling frost fingers.", null, null, null, Character.ActType.ToRoom);
        ch.Act("You channel frost fingers.");
        var affect = new AffectData();
        affect.Where = AffectWhere.ToDamageNoun;
        affect.Duration = 10;
        affect.SkillSpell = spell;
        affect.Level = ch_level;
        affect.DisplayName = spell.name;
        affect.DamageTypes.Add(DamageMessage.WeaponDamageTypes.Cold);
        affect.EndMessage = "You are no longer channeling frost.";
        ch.AffectToChar(affect);
    } // end Frost Fingers
    static SpellShockingTouch(castType, spell, ch_level, ch, victim, item, args, target)
    {
        StripDamageNounModifiers(ch);
        ch.Act("A spark seems to jump between $n's eyes.", null, null, null, Character.ActType.ToRoom);
        ch.Act("You charge yourself with electricity.");
        var affect = new AffectData();
        affect.Where = AffectWhere.ToDamageNoun;
        affect.Duration = 10;
        affect.SkillSpell = spell;
        affect.Level = ch_level;
        affect.DisplayName = spell.name;
        affect.DamageTypes.Add(DamageMessage.WeaponDamageTypes.Lightning);
        affect.EndMessage = "Your charge dissipates.";
        ch.AffectToChar(affect);
    } // end Shocking Touch
    static SpellChargeWeapon(castType, spell, ch_level, ch, victim, item, args, target)
    {
        var weapon = null;

        if (((args.ISEMPTY()) && (weapon = ch.GetEquipment(WearSlotIDs.Wield)) == null) || (!args.ISEMPTY() && (weapon = ch.GetItemInventoryOrEquipment(args, false)) == null))
        {
            ch.Act("Which weapon did you want to charge?\n\r");
        }
        else if (!weapon.ItemType.ISSET(ItemTypes.Weapon))
        {
            ch.Act("You can only charge a weapon.\n\r");
        }
        //else if (weapon.IsAffected(spell ))
        //{
        //    ch.Act("$p is already charged.\n\r", item: weapon);
        //}
        else
        {
            ch.Act("Sparks fly between $n eyes then $p crackles with lightning.", null, weapon, null, Character.ActType.ToRoom);
            ch.Act("You successfully charge $p with lightning.", null, weapon, null, Character.ActType.ToChar);

            var affect = weapon.FindAffect(spell);
            if (affect == null)
            {
                affect = new AffectData();
                affect.Duration = 10;
                affect.Level = ch.Level;
                affect.Where = AffectWhere.ToWeapon;
                affect.SkillSpell = spell;
                affect.Flags.SETBIT(AffectData.AffectFlags.Lightning);
                weapon.affects.Add(affect);
                affect.EndMessage = "Charge on $p wears off.\n\r";
            }
            else affect.Duration = 10;
        }

    } // end charge weapon
    static CheckChargeWeapon(ch, victim, weapon)
    {
        var weaponaffect;

        if (weapon != null && (weaponaffect = weapon.FindAffect(AffectData.AffectFlags.Lightning)) != null && Utility.Random(1, 10) == 1)
        {
            var dam = ch.GetDamage(weaponaffect.Level, .5, 1); //dam = Utility.Random(dam_each[level] / 2, dam_each[level]);
            if (Magic.SavesSpell(weaponaffect.Level, victim, DamageMessage.WeaponDamageTypes.Lightning))
                dam /= 2;
            ch.Act("As $p strikes $N, its stored chearge is unleashed!\n\r", victim, weapon, Character.ActType.ToChar);
            ch.Act("As $n strikes $N with $p, its stored chearge is unleashed!\n\r", victim, weapon, Character.ActType.ToRoomNotVictim);
            ch.Act("As $p strikes you, its stored chearge is unleashed!\n\r", victim, weapon, Character.ActType.ToVictim);

            Combat.Damage(ch, victim, dam, weaponaffect.SkillSpell, DamageMessage.WeaponDamageTypes.Lightning);
            return;
        }
    }
    static SpellCyclone(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));
        var dam = ch.GetDamage(level, .5, 1); //dam = Utility.Random(dam_each[level] / 2, dam_each[level]);

        if (spellcraft)
            dam += level;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Air))
            dam /= 2;

        ch.Act("A small cyclone of air begins to swirl around you before striking out at $N!", victim, Character.ActType.ToChar);
        ch.Act("A small cyclone of air begins to swirl around $n before striking out at $N!", victim, Character.ActType.ToRoomNotVictim);
        ch.Act("A small cyclone of air begins to swirl around $n before striking out at you!", victim, Character.ActType.ToVictim);

        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Air);

    } // end cyclone
    static SpellIceNeedles(castType, spell, level, ch, victim, item, args, target)
    {
        var chance = ch.GetSkillPercentage(spell) + 20;
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));
        var dam = ch.GetDamage(level, 1, 2); //dam = Utility.Random(dam_each[level] / 2, dam_each[level]);

        if (spellcraft)
            dam += level;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Cold))
            dam /= 2;

        ch.Act("A spray of piercing ice needles swirl around before striking $N!", victim, Character.ActType.ToChar);
        ch.Act("A spray of piercing ice needles swirl around $n before striking $N!", victim, Character.ActType.ToRoomNotVictim);
        ch.Act("A spray of piercing ice needles swirl around $n before striking you!", victim, Character.ActType.ToVictim);

        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Cold);
        if (chance > Utility.NumberPercent())
        {
            var affect = new AffectData();
            affect.DisplayName = spell.name;
            affect.SkillSpell = spell;
            affect.Duration = 5;
            affect.OwnerName = ch.Name;
            affect.Level = level;
            affect.Location = ApplyTypes.Str;
            affect.Modifier = -3;
            if (!victim.IsAffected(spell))
            {
                victim.Act("$n is pierced by ice needles.\n\r", null, null, null, Character.ActType.ToRoom);
                victim.Act("You are pierced by ice needles.\n\r", null, null, null, Character.ActType.ToChar);
            }
            else
            {
                victim.Act("The ice needle wounds of $n deepen.\n\r", null, null, null, Character.ActType.ToRoom);
                victim.Act("Your ice needle wounds deepen.\n\r", null, null, null, Character.ActType.ToChar);
            }
            victim.AffectToChar(affect);

            affect.Location = ApplyTypes.Dex;
            affect.Modifier = -3;
            affect.EndMessage = "You recover from your ice wounds.";
            affect.EndMessageToRoom = "$n recovers from $s ice wounds.";
            victim.AffectToChar(affect);
        }
    } // end iceneedles
    static SpellBuffet(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));
        var isFlying = victim.IsAffected(AffectData.AffectFlags.Flying);
        var dam = ch.GetDamage(level, 1, 2); //dam = Utility.Random(dam_each[level] / 2, dam_each[level]);

        if (spellcraft)
            dam += level;
        if (isFlying)
            dam *= 2;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Air))
            dam /= 2;

        ch.Act("You buffet $N with a controlled blast of air!", victim, Character.ActType.ToChar);
        ch.Act("$n buffets $N with a controlled blast of air!", victim, Character.ActType.ToRoomNotVictim);
        ch.Act("$n buffets you with a controlled blast of air!", victim, Character.ActType.ToVictim);


        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Air);
        return;
    }
    static SpellWallOfFire(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));
        var dam = ch.GetDamage(level, 1.5, 2.5);  //dam = Utility.Random(dam_each[level], dam_each[level] * 2);

        if (spellcraft)
            dam += level;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Fire))
            dam /= 2;

        ch.Act("You conjure a precise wall of fire, then throw it at $N.\n\r", victim, Character.ActType.ToChar);
        ch.Act("$n conjures a precise wall of fire, then throws it at $N.\n\r", victim, Character.ActType.ToRoomNotVictim);

        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Fire);
    } // end wall of fire
    static SpellIcicle(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));
        var sector = ch.Room.Sector;
        var checkSector = ((sector == SectorTypes.WaterSwim) || (sector == SectorTypes.Swim) ||
            (sector == SectorTypes.WaterNoSwim) || (sector == SectorTypes.Ocean) ||
            (sector == SectorTypes.River) || (sector == SectorTypes.Underwater));

        var dam = ch.GetDamage(level, .5, 1); //dam = Utility.Random(dam_each[level], dam_each[level] * 2);

        ch.Act(checkSector ? "Because of the available water nearby, you conjure a greater bolt of ice to throw at $N." :
            "You conjure a magical bolt of ice, then throw it at $N.\n\r", victim, Character.ActType.ToChar);
        ch.Act("$n conjures a magical bolt of ice, then throws it at $N.\n\r", victim, Character.ActType.ToRoomNotVictim);

        if (spellcraft)
            dam += level;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Cold))
            dam /= 2;
        if (checkSector)
            dam *= 2;


        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Cold);
    } // end icicle
    static SpellEngulf(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));
        var sector = ch.Room.Sector;
        var checkSector = ((sector == SectorTypes.WaterSwim) || (sector == SectorTypes.Swim) ||
            (sector == SectorTypes.WaterNoSwim) || (sector == SectorTypes.Ocean) ||
            (sector == SectorTypes.River) || (sector == SectorTypes.Underwater));

        var dam = ch.GetDamage(level, 1, 2);

        ch.Act(checkSector ? "Because of the available water nearby, your engulfing of $N is twice as powerful." :
            "You completely engulf $N of water, drowning them without mercy.\n\r", victim, Character.ActType.ToChar);
        ch.Act("$n completely engulfs $N of water, drowning them without mercy.\n\r", victim, Character.ActType.ToRoomNotVictim);

        if (spellcraft)
            dam += level;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Drowning))
            dam /= 2;
        if (checkSector)
            dam *= 2;

        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Drowning);
    } // end engulf
    static SpellDrown(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));
        var sector = ch.Room.Sector;
        var checkSector = ((sector == SectorTypes.WaterSwim) || (sector == SectorTypes.Swim) ||
            (sector == SectorTypes.WaterNoSwim) || (sector == SectorTypes.Ocean) ||
            (sector == SectorTypes.River) || (sector == SectorTypes.Underwater));

        var dam = ch.GetDamage(level, .5, 1); //dam = Utility.Random(dam_each[level], dam_each[level] * 2);

        ch.Act(checkSector ? "Because of the available water nearby, you conjure a greater ball of water to drown $N in." :
            "You conjure a magical ball of water to drown $N in.\n\r", victim, Character.ActType.ToChar);
        ch.Act("$n conjures a magical ball of water to drown $N in.\n\r", victim, Character.ActType.ToRoomNotVictim);

        if (spellcraft)
            dam += level;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Drowning))
            dam /= 2;
        if (checkSector)
            dam *= 2;

        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Drowning);
    } // end drown
    static SpellGeyser(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));
        var sector = ch.Room.Sector;
        var checkSector = ((sector == SectorTypes.WaterSwim) || (sector == SectorTypes.Swim) ||
            (sector == SectorTypes.WaterNoSwim) || (sector == SectorTypes.Ocean) ||
            (sector == SectorTypes.River) || (sector == SectorTypes.Underwater));

        var dam = ch.GetDamage(level, 1.5, 2.5);

        ch.Act(checkSector ? "Because of the available water nearby, you conjure a greater geyser to drown $N in." :
            "You conjure a geyser of water to drown $N in.\n\r", victim, Character.ActType.ToChar);
        ch.Act("$n conjures a geyser of water to drown $N in.\n\r", victim, Character.ActType.ToRoomNotVictim);

        if (spellcraft)
            dam += level;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Drowning))
            dam /= 2;
        if (checkSector)
            dam = (int)(dam * 1.5); ;

        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Drowning);
    } // end drown
    static SpellImmolation(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));

        for (var Victim of Utility.CloneArray(ch.Room.Characters))
        {
            if (!Victim.IsSameGroup(ch) && !Victim.IsAffected(AffectData.AffectFlags.Immolation) && !Victim.IsAffected(spell))
            {
                var Affect = new AffectData();
                Affect.ownerName = ch.Name;
                Affect.displayName = spell.name;
                Affect.skillSpell = spell;
                Affect.level = level;
                Affect.where = AffectWhere.ToAffects;
                Affect.location = ApplyTypes.None;
                Affect.flags.SETBIT(AffectData.AffectFlags.Immolation);
                Affect.modifier = 0;
                Affect.duration = Game.PULSE_TICK * 2;
                Affect.frequency = Frequency.Violence;

                Affect.endMessage = "You stop burning.";
                Affect.endMessageToRoom = "$n stops burning.";

                Victim.AffectToChar(Affect);

                ch.Act("$N starts burning from your immolation.", Victim, Character.ActType.ToChar);
                ch.Act("You start burning from $n's immolation.\n\r\n\r", Victim, Character.ActType.ToVictim);
                ch.Act("$N starts burning from $n's immolation.\n\r\n\r", Victim, Character.ActType.ToRoomNotVictim);

                if (Victim.Fighting == null)
                {
                    var Weapon = Victim.GetEquipment(WearSlotIDs.Wield);
                    Combat.oneHit(Victim, ch, Weapon);
                }
            }
            var dam = ch.GetDamage(level, .5, 1); //dam = Utility.Random(dam_each[level], dam_each[level] * 2);

            if (spellcraft)
                dam += level;
            if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Fire))
                dam /= 2;

            Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Fire);
        }
    } // end immolation
    static ImmolationDamage(victim, affect)
    {
        var DamAmountByLevel = [
        
            [ 40, 37 ],
            [ 45, 45 ],
            [ 50, 55 ],
            [ 51, 60 ],
        ];
        var DamAmount = 0;
        for(var i of DamAmountByLevel)
            if(affect.Level > i[0])
                DamAmount = i[1];
        Combat.Damage(victim, victim, Utility.Random(DamAmount - 5, DamAmount + 5), affect.SkillSpell, DamageMessage.WeaponDamageTypes.Fire, affect.OwnerName);
    }
    static SpellTsunami(castType, spell, level, ch, victim, item, args, target)
    {
        var sector = ch.Room.Sector;
        var checkSector = (sector == SectorTypes.WaterSwim) || (sector == SectorTypes.Swim) ||
                    (sector == SectorTypes.WaterNoSwim) || (sector == SectorTypes.Ocean) ||
                    (sector == SectorTypes.River) || (sector == SectorTypes.Underwater);
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));

        ch.Act(checkSector ? "Because of the available water nearby, You conjure a massive ball of water, then throw a mammoth tsunami!\n\r" :
            "You conjure a magical ball of water then throw a tsunami!\n\r", victim, Character.ActType.ToChar);
        ch.Act("$n conjures a magical ball of water then throws a tsunami!\n\r", victim, Character.ActType.ToRoomNotVictim);

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {

                var dam = ch.GetDamage(level, .5, 1); //dam = Utility.Random(dam_each[level], dam_each[level] * 2);
                if (spellcraft)
                    dam += level;

                if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Drowning))
                    dam /= 2;

                if (checkSector)
                    dam *= 2;

                Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Drowning);
                ch.CheckImprove(spell, true, 1);
            }
        }
    } // end tsunami
    static SpellPillarOfTheHeavens(castType, spell, level, ch, victim, item, args, target)
    {
        var sector = ch.Room.Sector;
        var checkSector = (sector == SectorTypes.Inside) || (sector == SectorTypes.Underground) ||
            (sector == SectorTypes.Cave);
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));
        var chance = 0, numhits = 0, i = 0, dam = 0;
        var learned = 0;

        ch.Act(checkSector ? "Because you are not outside, You conjure a week barrage of lighting bolts.\n\r" :
            "You conjure a barrage of lightning bolts!\n\r", victim, Character.ActType.ToChar);
        ch.Act("$n conjures a barrage of lightning bolts!\n\r", victim, Character.ActType.ToRoomNotVictim);

        learned = ch.GetSkillPercentage(spell) + 20;

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {
                chance = Utility.NumberPercent();

                if ((chance + learned) > 165)
                {
                    numhits = 4;
                }
                else if ((chance + learned) > 155)
                {
                    numhits = 3;
                }
                else if ((chance + learned) > 145)
                {
                    numhits = 2;
                }
                else
                {
                    numhits = 1;
                }
                for (i = 0; i < numhits; i++)
                {
                    dam = ch.GetDamage(level, 1, 2);

                    if (checkSector)
                        dam /= 2;
                    if (spellcraft)
                        dam += level;
                    if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Lightning))
                        dam /= 2;

                    Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Lightning);

                    if (ch.Room != victim.Room)
                        break;
                }
                ch.CheckImprove(spell, true, 1);
            }
        }
    } // end tsunami
    static SpellIceshards(castType, spell, level, ch, victim, item, args, target)
    {
        var chance = 0, numhits = 0, i = 0, dam = 0;
        var learned = 0;
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));

        ch.Act("You conjure a magical bolt of ice, then throw it at $N.\n\r", victim, Character.ActType.ToChar);
        ch.Act("$n conjures a magical bolt of ice, then throws it at $N.\n\r", victim, Character.ActType.ToRoomNotVictim);

        learned = ch.GetSkillPercentage(spell) + 20;
        chance = Utility.NumberPercent();

        if ((chance + learned) > 165)
        {
            numhits = 4;
        }
        else if ((chance + learned) > 155)
        {
            numhits = 3;
        }
        else if ((chance + learned) > 145)
        {
            numhits = 2;
        }
        else
        {
            numhits = 1;
        }
        for (i = 0; i < numhits; i++)
        {
            dam = ch.GetDamage(level);
            if (spellcraft)
                dam += level;
            if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Cold))
                dam /= 2;
            Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Cold);

            if (ch.Room != victim.Room)
                break;
        }
    } // end iceshards
    static SpellWindWall(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));

        ch.Act("The air surrounding you grows and blasts out!", null, null, null, Character.ActType.ToChar);
        ch.Act("$n makes the air grow into a forceful blast!", null, null, null, Character.ActType.ToRoom);

        for (var vict of Utility.CloneArray(ch.Room.Characters))
        {
            if (vict != ch && !ch.IsSameGroup(vict) && !Magic.IsSafeSpell(ch, vict, true))
            {

                var dam = ch.GetDamage(level); //dam = Utility.Random(dam_each[level], dam_each[level] * 2);

                if (spellcraft)
                    dam += level;
                if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Air))
                    dam /= 2;

                Combat.Damage(ch, vict, dam, spell, DamageMessage.WeaponDamageTypes.Air);
                ch.CheckImprove(spell, true, 1);
            }
        }
    } // end wind wall
    static SpellPebbleToBoulder(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));
        var sector = ch.Room.Sector;
        var checkSector = ((sector == SectorTypes.Mountain) || (sector == SectorTypes.Cave) || (sector == SectorTypes.Underground));
        var chance = ch.GetSkillPercentage(spell) + 20;

        ch.Act("You toss a small pebble at $N. of mid-air the pebble transforms into a huge boulder!\n\r", victim, Character.ActType.ToChar);
        ch.Act("$n tosses a small pebble at $N. of mid-air the pebble transforms into a huge boulder!\n\r", victim, Character.ActType.ToRoomNotVictim);
        ch.Act("$n tosses a small pebble at you. of mid-air the pebble tranforms into a huge boulder!\n\r", victim, Character.ActType.ToVictim);

        if (chance > Utility.NumberPercent())
        {
            var dam = ch.GetDamage(level, 1, 2); //dam = Utility.Random(dam_each[level], dam_each[level] * 2);

            if (spellcraft)
                dam += level;
            if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Bash))
                dam /= 2;
            if (checkSector)
            {
                victim.WaitState(Game.PULSE_VIOLENCE * 2);
                dam *= 2;
            }
            else victim.WaitState(Game.PULSE_VIOLENCE);

            Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Bash);
        }
        else
        {
            Combat.Damage(ch, victim, 0, spell, DamageMessage.WeaponDamageTypes.Bash);
        }
    } // end stoneshatter
    static SpellStoneShatter(castType, spell, level, ch, victim, item, args, target)
    {
        var spellcraft = (Magic.CheckSpellcraft(ch, spell));
        var dam = ch.GetDamage(level, .5, 1); //dam = Utility.Random(dam_each[level], dam_each[level] * 2);

        if (spellcraft)
            dam += level;
        if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Bash))
            dam /= 2;

        ch.Act("You conjure stones from thin air, then throw them at $N.\n\r", victim, Character.ActType.ToChar);
        ch.Act("$n conjures stones from thin air, then throws them at $N.\n\r", victim, Character.ActType.ToRoomNotVictim);
        ch.Act("$n conjures stones from thin air, then throws them you.\n\r", victim, Character.ActType.ToVictim);

        Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Bash);
    } // end pebble to boulder
    static SpellEarthRipple(castType, spell, level, ch, victim, item, args, target)
    {
        // var spellcraft = (Magic.CheckSpellcraft(ch, spell));
        // var sector = ch.Room.Sector;
        // var checkSector = ((sector == SectorTypes.Mountain) || (sector == SectorTypes.Cave) || (sector == SectorTypes.Underground));
        // var dirArg = null;
        // var direction = 0;
        // var victimname = null;
        // [victimname, args] = args.OneArgument();
        // [dirArg, args] = args.OneArgument();
        // if (dirArg.ISEMPTY()) dirArg = victimname;
        // var exit = null;

        // if (dirArg.ISEMPTY() || !Utility.GetEnumValueStrPrefix(dirArg, ref direction))
        // {
        //     ch.Act("Which direction did you want to force $N in?\n\r", victim);
        // }
        // else if ((exit = ch.Room.GetExit(direction)) == null || exit.destination == null
        //     || exit.flags.ISSET(ExitFlags.Closed) || exit.flags.ISSET(ExitFlags.Window) ||
        //     (!victim.IsImmortal && !victim.IsNPC && (exit.destination.MinLevel > victim.Level || exit.destination.MaxLevel < victim.Level)))
        // {
        //     ch.Act("You can't force $N of that direction.", victim);
        // }
        // else
        // {
        //     var dam = ch.GetDamage(level, .5f, 1); //dam = Utility.Random(dam_each[level], dam_each[level] * 2);

        //     if (spellcraft)
        //         dam += level;
        //     if (Magic.SavesSpell(level, victim, DamageMessage.WeaponDamageTypes.Bash))
        //         dam /= 2;
        //     if (checkSector)
        //         dam *= 2;

        //     ch.Act(checkSector ? "Because of the earth near you, you invoke massive elemental earth beneath $N, and drive them {0}.\n\r" :
        //         "You invoke elemental earth beneath $N, and drive them {0}.\n\r", victim, Character.ActType.ToChar, args: direction.ToString().ToLower());
        //     ch.Act("$n invokes elemental earth beneath $N and drives them {0}.\n\r", victim, Character.ActType.ToRoomNotVictim, args: direction.ToString().ToLower());
        //     ch.Act("$n invokes elemental earth beneath you and drives you {0}.\n\r", victim, Character.ActType.ToVictim, args: direction.ToString().ToLower());

        //     Combat.Damage(ch, victim, dam, spell, DamageMessage.WeaponDamageTypes.Bash);

        //     victim.RemoveCharacterFromRoom();
        //     victim.AddCharacterToRoom(exit.destination);
        //     victim.Act("$n arrives on a wave of elemental earth.\n\r", null, null, null, Character.ActType.ToRoom);
            
        //     ch.Act("$n hurls $N {0} with $s earth ripple.", victim, Character.ActType.ToRoomNotVictim, args: direction.ToString().ToLower());
        // }
    } // end earth ripple
}

module.exports = Magic;