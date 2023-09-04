const Character = require("./Character");
const Utility = require("./Utility");
const DamageMessage = require("./DamageMessage");
const SkillSpell = require("./SkillSpell");
const RoomData = require("./RoomData");
const PhysicalStats = require("./PhysicalStats");
const AffectData = require("./AffectData");
const ItemTemplateData = require("./ItemTemplateData");
const ItemData = require("./ItemData");
const Game = require("./Game");

class Combat {
    static CheckIsSafe(ch, victim) {
        if(!ch || !victim) {
             return true;
        }
        var chduel
        if (((chduel = ch.FindAffect("DuelInProgress")) || (ch.Master && (chduel = ch.Master.FindAffect("DuelInProgress")))) && chduel.OwnerName == victim.Name) {
            return false;
        }
        
        // If the victim is a ghost and not already in combat, it is safe
        if (victim.IsAffected("Ghost") && victim.Fighting == null) {
            return true;
        }
        
        // If the attacker is the same as the victim, it is not safe
        if (ch == victim) {
            return false;
        }
        
        // If the attacker is affected by the Calm flag, they cannot engage in combat
        if (ch.IsAffected("Calm")) {
            ch.send("You feel too calm to fight.\n\r");
            Combat.StopFighting(ch);
            return true;
        }

        // Check if the attacker and victim are players or non-player characters and if they are not the same
        // Also check if the victim is a pet or has a leader who is a player
        if ((ch && victim && !ch.IsNPC && !victim.IsNPC && ch != victim) ||
            (!ch.IsNPC && (victim.Flags.IsSet("Pet") || (victim.Leader && !victim.Leader.IsNPC))))
        {
            // The gods protect the victim from the attacker
            ch.Act("The gods protect $N from you.", victim, null, null, "ToChar");
            ch.Act("The gods protect you from $n.", victim, null, null, "ToVictim");
            ch.Act("The gods protect $N from $n.", victim,  null, null, "ToRoomNotVictim");

            // Stop the attacker from fighting the victim
            if (ch.Fighting == victim)
            {
                Combat.StopFighting(ch);
                //ch.fighting = null;
                //if (ch.position == Positions.Fighting) ch.position = Positions.Standing;
            }

            // Stop the victim from fighting the attacker
            if (victim && victim.Fighting == ch)
            {
                victim.Fighting = null;
                if (victim.Position == "Fighting") victim.Position = "Standing";
            }

            return true; // It is not safe to engage in combat
        }

        return false; // It is safe to engage in combat
    }
    static UpdatePosition(victim)
    {
        // Check if the victim's hit points are greater than 0
        if (victim.HitPoints > 0)
        {
            // If the victim's position is at or below Stunned, set it to Standing
            if (victim.Position == "Stunned" || victim.Position == "Mortal" || victim.Position == "Incapacitated")
                victim.Position = "Standing";
            return; // Exit the method
        }

        // Check if the victim is an NPC and has hit points less than 1
        if (victim.IsNPC && victim.HitPoints < 1)
        {
            victim.Position = "Dead"; // Set the position to Dead
            return; // Exit the method
        }

        // Determine the position based on the victim's hit points
        if (victim.HitPoints <= -11)
            victim.Position = "Dead";
        else if (victim.HitPoints <= -6)
            victim.Position = "Mortal";
        else if (victim.HitPoints <= -3)
            victim.Position = "Incapacitated";
        else
            victim.Position = "Stunned";
    }

    /// <summary>
    /// Checks if a character is dead and performs the necessary actions.
    /// </summary>
    /// <param name="ch">The character responsible for the death (optional).</param>
    /// <param name="victim">The character who died.</param>
    /// <param name="damage">The amount of damage that caused the death.</param>
    static CheckIsDead(ch, victim, damage)
    {
        if(!victim) return;
        // Update the position of the victim based on their hit points
        Combat.UpdatePosition(victim);

        // Check the victim's position and perform the appropriate actions
        switch (victim.Position)
        {
            case "Mortal":
                victim.Act("$n is mortally wounded and will die soon, if not aided.", null, null, null, "ToRoom");
                victim.send("You are mortally wounded and will die soon, if not aided.\n\r");
                break;

            case "Incapacitated":
                victim.Act("$n is incapacitated and will slowly die, if not aided.", null, null, null, "ToRoom");
                victim.send("You are incapacitated and will slowly die, if not aided.\n\r");
                break;

            case "Stunned":
                victim.Act("$n is stunned, but will probably recover.", null, null, null, "ToRoom");
                victim.send("You are stunned, but will probably recover.\n\r");
                break;

            case "Dead":
                var duelaffect = victim.FindAffect(AffectData.AffectFlags.DuelInProgress);
                if(!ch) ch = Character.Characters.FirstOrDefault(c => c.Name == duelaffect.OwnerName);
                if( duelaffect && ch != null && (!ch.IsNPC || (ch.Master != null && !ch.Master.IsNPC)))
                {
                    if (ch.Master != null)
                    {
                        ch.Master.StripAffects({AffectFlag: AffectData.AffectFlags.DuelInProgress});
                        if (ch.Master.Fighting == ch)
                            ch.Master.Fighting = null;
                    }
                    else
                        ch.StripAffects({AffectFlag: AffectData.AffectFlags.DuelInProgress});

                    if (ch.Fighting == victim)
                        ch.Fighting = null;
                    if(victim.Fighting == ch || (ch.Master != null && victim.Fighting == ch.Master))
                        victim.Fighting = null;

                    victim.Act("$N stops $mself before finishing off $n.", ch, null, null, Character.ActType.GlobalNotVictim);
                    victim.Act("$N stops $mself before finishing you off.", ch, null, null, Character.ActType.ToChar);
                    victim.Act("You stop yourself before finishing $n off.", ch, null, null, Character.ActType.ToVictim);
                    victim.HitPoints = 20;
                    victim.Position = "Sitting";
                    for (var aff of Utility.CloneArray(victim.Affects))
                        victim.AffectFromChar(aff, AffectData.AffectRemoveReason.Died, true);
                    for (var aff of Utility.CloneArray((ch.Master || ch).Affects))
                        ch.AffectFromChar(aff, AffectData.AffectRemoveReason.Died, true);
                    return;
                }

                victim.Act("$n is DEAD!!", null, null, null, "ToRoom");
                victim.send("You have been KILLED!!\n\r\n\r");
                break;

            default:
                if (damage > victim.MaxHitPoints / 4)
                    victim.send("That really did HURT!\n\r");
                if (victim.HitPoints < victim.MaxHitPoints / 4)
                    victim.send("You sure are BLEEDING!\n\r");
                break;
        }

        // Perform actions when the victim is dead
        if (victim.Position == "Dead")
        {
            if(victim.IsNPC) {
                // give experience to everyone fighting victim
                for(var gch of victim.Room.Characters) {
                    if(gch.Fighting == victim && (!ch || !gch.IsSameGroup(ch))) {
                        var xp = gch.ExperienceCompute(victim, 1, gch.Level); // group_levels);
                        gch.send("\\CYou receive \\W{0}\\C experience points.\\x\n\r", xp);
                        gch.GainExperience(xp);
                    }
                }
            }  

            // Stop the fighting and set positions
            if (ch != null)
            {
                ch.Fighting = null;
                ch.Position = "Standing";
            }
            victim.Fighting = null;
            //victim.Position = Positions.Dead;

            Combat.StopFighting(victim, true);

            if (victim.IsNPC) {
                victim.StopFollowing();
                Character.Characters.splice(Character.Characters.indexOf(victim), 1);
                if(victim.Template && victim.Template.ResetCount > 0) victim.Template.ResetCount--;
            }

            // Remove affects from the victim
            for (var aff of victim.Affects.CloneArray())
                victim.AffectFromChar(aff, "Died", false);

            // Gain experience for killing an NPC victim
            if (ch && victim  && victim.IsNPC)
                ch.GroupGainExperience(victim);

            // Perform death cry
            victim.DeathCry();

            // Execute death-related programs for NPCs
            // if (victim.IsNPC && (npcData = (NPCData)victim) != null)
            // {
            //     foreach (var prog in npcData.Programs)
            //     {
            //         if (prog.Types.ISSET(Programs.ProgramTypes.SenderDeath))
            //         {
            //             if (victim.Room != null)
            //             {
            //                 foreach (var other in victim.Room.Characters.OfType<Player>())
            //                 {
            //                     // ch == issamegroup if in same room
            //                     if(other.IsSameGroup(ch))
            //                     _ = prog.Execute(other, npcData, npcData, null, null, Programs.ProgramTypes.SenderDeath, "");
            //                 }
            //             }
            //         }
            //     }

            //     foreach (var prog in npcData.LuaPrograms)
            //         if(prog.ProgramTypes.ISSET(Programs.ProgramTypes.SenderDeath))
            //         {
            //             if (victim.Room != null)
            //             {
            //                 foreach (var other in victim.Room.Characters.OfType<Player>())
            //                 {
            //                     // ch == issamegroup if in same room
            //                     if (other.IsSameGroup(ch))
            //                         _ = prog.Execute(other, npcData, null, null, null, null, Programs.ProgramTypes.SenderDeath, "");
            //                 }
            //             }
            //         }
            // }

            // // Execute death-related programs for other characters in the room
            // if (victim.Room != null && !victim.IsNPC)
            // {
            //     foreach (var other in victim.Room.Characters.OfType<NPCData>().ToArray())
            //     {
            //         Programs.ExecutePrograms(Programs.ProgramTypes.PlayerDeath, other, victim, null, "");
            //     }

            //     // Execute death-related programs for items in the character's inventory
            //     if (ch != null)
            //     {
            //         foreach (var item in ch.Equipment.Values.Concat(ch.Inventory).ToArray())
            //         {
            //             if (item == null) continue;
            //             Programs.ExecutePrograms(Programs.ProgramTypes.PlayerDeath, ch, item, "");
            //         }
            //     }

            //     // Execute death-related programs for items in the victim's inventory
            //     foreach (var item in victim.Equipment.Values.Concat(victim.Inventory).ToArray())
            //     {
            //         Programs.ExecutePrograms(Programs.ProgramTypes.PlayerDeath, victim, item, "");
            //     }
            // }

            var corpseTemplate;
            var newCorpse = null;

            // Create a corpse item and transfer equipment and inventory to it
            if ((corpseTemplate = ItemTemplateData.ItemTemplates[6]) && victim.Room != null)
            {
                newCorpse = new ItemData(corpseTemplate, victim.Room);
                newCorpse.Name = Utility.Format(newCorpse.Name, victim.Name);
                newCorpse.ShortDescription = Utility.Format(newCorpse.ShortDescription, victim.GetShortDescription(null));
                newCorpse.LongDescription = Utility.Format(newCorpse.LongDescription, victim.GetShortDescription(null));
                newCorpse.Description = Utility.Format(newCorpse.Description, victim.GetShortDescription(null));
                newCorpse.ItemTypes = {"Container": true};
                newCorpse.Size = victim.Size;

                if (victim.IsNPC)
                {
                    newCorpse.ItemTypes["NPCCorpse"] = true;
                    newCorpse.Timer = 3;
                }
                else
                {
                    newCorpse.ItemTypes.Corpse = true;
                    if (newCorpse.WearFlags.IsSet("Take"))
                        newCorpse.WearFlags.RemoveFlag("Take");
                    newCorpse.Timer = 10;
                }

                // if (victim.Form != null)
                //     ShapeshiftForm.DoRevert(victim, "");

                // Transfer equipment to the corpse
                for (var key in victim.Equipment.Clone())
                {
                    var value = victim.Equipment[key];

                    if (value)
                    {
                        victim.RemoveEquipment(value, false, true);
                        if (victim.Inventory.indexOf(value) >= 0)
                            victim.Inventory.splice(victim.Inventory.indexOf(value), 1);
                        newCorpse.Contains.push(value);
                        value.CarriedBy = null;
                        value.Container = newCorpse;
                        if (value.ExtraFlags.IsSet(ItemData.ExtraFlags.VisDeath))
                            value.ExtraFlags.RemoveFlag(ItemData.ExtraFlags.VisDeath);
                        if (value.ExtraFlags.IsSet(ItemData.ExtraFlags.RotDeath))
                        {
                            value.Timer = 15;
                            value.ExtraFlags.RemoveFlag(ItemData.ExtraFlags.RotDeath);
                        }
                    }
                }

                // Transfer inventory to the corpse
                for (var item of victim.Inventory.CloneArray())
                {
                    victim.Inventory.splice(victim.Inventory.indexOf(item), 1);
                    newCorpse.Contains.push(item);
                    item.Container = newCorpse;
                    item.CarriedBy = null;
                    if (item.ExtraFlags.IsSet(ItemData.ExtraFlags.VisDeath))
                        item.ExtraFlags.RemoveFlag(ItemData.ExtraFlags.VisDeath);
                    if (item.ExtraFlags.IsSet(ItemData.ExtraFlags.RotDeath))
                    {
                        item.Timer = 15;
                        item.ExtraFlags.RemoveFlag(ItemData.ExtraFlags.RotDeath);
                    }
                }

                // Transfer money to the corpse
                var silver = victim.Silver;
                var gold = victim.Gold;
                if (gold > 0 || silver > 0)
                {
                    // var money = Character.CreateMoneyItem(silver, gold);
                    // newCorpse.Contains.Add(money);
                }

                newCorpse.Alignment = victim.Alignment;
                newCorpse.Owner = victim.Name;
                victim.Gold = 0;
                victim.Silver = 0;
            }

            // Remove the character from the room
            victim.RemoveCharacterFromRoom();

            // Automatic looting and gold collection by the killer
            if (victim.IsNPC && ch != null && (ch.Flags.IsSet("AutoLoot") || ch.Flags.IsSet("AutoGold")) && newCorpse != null)
            {
                for(var item of newCorpse.Contains.CloneArray())
                {
                    if ((item.ItemTypes.IsSet("Money") && ch.Flags.IsSet("AutoGold")) ||
                        (!item.ItemTypes.IsSet("Money") && ch.Flags.IsSet("AutoLoot")))
                    {
                        newCorpse.Contains.Remove(item);

                        ch.Act("You get $p from $P.", null, item, newCorpse, "ToChar");
                        ch.Act("$n gets $p from $P.", null, item, newCorpse, "ToRoom");

                        ch.AddInventoryItem(item);
                    }
                }
            }

            // Automatic sacrifice of the corpse by the killer
            if (ch && victim.IsNPC && ch.Flags.IsSet("AutoSac"))
                Character.DoCommands.DoSacrifice(ch, "corpse");

            // Clear killer wait time on kill
            if (ch != null)
                ch.Wait = 0;
            
            victim.Wait = 0;

            if (!victim.IsNPC)
            {
                // Handle death-related actions for player characters
                if (victim.GetRecallRoom() != null)
                    victim.AddCharacterToRoom(victim.GetRecallRoom());
                victim.Act("$n appears in the room.\n\r", null, null, null, "ToRoom");
                victim.HitPoints = victim.MaxHitPoints / 2;
                victim.ManaPoints = victim.MaxManaPoints / 2;
                victim.MovementPoints = victim.MaxMovementPoints / 2;
                victim.Position = "Resting";
                victim.ModifiedStats = Array(0, 0, 0, 0, 0, 0);
                victim.Affects = Array();
                victim.AffectedBy = {};
                // if (victim.Race != null)
                //     victim.AffectedBy.AddRange(victim.Race.affects);
                victim.Hunger = 48;
                victim.Thirst = 48;
                victim.Dehydrated = 0;
                victim.Starving = 0;
                victim.HitRoll = 0;
                victim.DamageRoll = 0;

                // Clear the LastFighting reference from other NPCs
                for (var npc of Character.Characters)
                {
                    if (npc.LastFighting == victim)
                        npc.LastFighting = null;
                }

                // Apply a ghost affect to the player for a short duration
                var ghostAffect = new AffectData();
                
                ghostAffect.Duration = 15,
                ghostAffect.DisplayName = "ghost",
                ghostAffect.EndMessage = "\\WYou regain your corporeal form.\\x",
                ghostAffect.EndMessageToRoom = "$n regains $s corporeal form."
            
                ghostAffect.Flags.Ghost = true;
                victim.AffectToChar(ghostAffect);
                victim.send("\\RYou become a ghost for a short while.\\x\n\r");
            }
            else
            {
                // Handle death-related actions for NPCs
                victim = {};
            }
        }
        else if (victim != ch && victim.Fighting != null)
        {
            // Set the victim's position to Fighting if they're still in combat
            victim.Position = "Fighting";
        }
    }

    static SetFighting(ch, victim)
    {
        if (ch.Fighting != null)
        {
            return;
        }

        if (!ch || !victim || ch.Room != victim.Room)
            return;

        ch.Fighting = victim;
        ch.Position = "Fighting";

        if (!victim.Fighting)
        {
            victim.Fighting = ch;
            victim.Position = "Fighting";
        }

        if (victim.Following == ch)
        {
            victim.StopFollowing();
        }
        
        return;
    } // End SetFighting
    
    static StopFighting(ch, world = false) {
        if (world)
        {
            for (var other of Character.Characters)
            {
                if (other.Fighting == ch)
                {
                    other.Fighting = null;
                    if (other.Position == "Fighting")
                        other.Position = "Standing";
                }
            }
        }
        

        ch.Fighting = null;
        if (ch.Position == "Fighting") ch.Position = "Standing";

    } // end StopFighting
    static DoKill(character, args) {
        if(character.Fighting) {
            character.send("You are already fighting.\n\r");
        }
        else {
            var victim, count;
            [victim, count] = Character.CharacterFunctions.GetCharacterHere(character, args);
            if(!victim) {
                character.send("You don't see them here.\n\r");
            }
            else if(victim == character) {
                character.send("Suicide is a mortal sin.\n\r");
            }
            else {
                var weapon = character.Equipment["Wield"];
                character.Fighting = victim;
                character.Position = "Fighting";
                Combat.OneHit(character, victim, weapon);
            }
        }
    };

    static OneHit(character, victim, weapon, dualwield = false, skill = null) {
        var damage = Math.floor(Math.random() * 10);

        var damagemessage = DamageMessage.DamageMessages["punch"];
        var damagetype = "Bash";
        var damagenoun = "punch";

        var leveldif = victim.Level - character.Level;
        var misschance = .20;
        if(leveldif > 2) {
            if(!dualwield)
                misschance += .02 + leveldif * .02;
            else
                misschance += .21 + leveldif * .02;
        } else if (leveldif >= 0) {
            if(!dualwield)
                misschance += .02 + leveldif * .05;
            else
                misschance += .24 + leveldif * .05;
        }

        misschance -= .05 / Math.max(character.HitRoll, 1);

        if(weapon) {
            

            if(misschance * 100 > Utility.NumberPercent())
                damage = 0;
            else
                damage = Utility.Roll(weapon.DamageDice);
            if(damage != 0) damage += character.DamageRoll;
            damagemessage = DamageMessage.DamageMessages[weapon.WeaponDamageType.toLowerCase()];
        } else {
            if(character.IsNPC && character.DamageDice) {
                if(character.WeaponDamageMessage && DamageMessage.DamageMessages[character.WeaponDamageMessage])
                    damagemessage = DamageMessage.DamageMessages[character.WeaponDamageMessage];
                if(misschance * 100 > Utility.NumberPercent())
                    damage = 0;
                else
                    damage = Utility.Roll(character.DamageDice);
            }
        }
        
        if(damagemessage) {
            damagetype = damagemessage.Type;
            damagenoun = damagemessage.Message;
        }
    
        if(character.Fighting && character.Fighting == victim && character.Fighting.Room != victim.Room) {
            character.Fighting = null;
            character.Position = "Standing";
        }
        else if(victim) {
            if(!character.Fighting)
                character.Fighting = victim;
            if(!victim.Fighting)
                victim.Fighting = character;
            victim.Position = "Fighting";

            if (Combat.CheckDistance(character, victim, weapon, damagenoun)) return;
            if (Combat.CheckDefensiveSpin(character, victim, weapon, damagenoun)) return;
            if (Combat.CheckShieldBlock(character, victim, weapon, damagenoun)) return;
            if (Combat.CheckDodge(character, victim, weapon, damagenoun)) return;
            if (Combat.CheckParry(character, victim, weapon, damagenoun)) return;
            
            Combat.Damage(character, victim, damage, damagenoun, damagetype, character.Name, weapon, true, true);
            // Combat.ShowDamageMessage(character, victim, damage, damagenoun, damagetype, false);
            
            // victim.HitPoints -= damage;
            // if(victim.HitPoints < -15) {
            //     victim.Position = "Dead";
            //     character.Act("$N has been killed!", victim, null, null, "ToRoomNotVictim");
            //     character.Act("You have been killed!", victim, null, null, "ToVictim");
            //     character.Act("$N is DEAD!", victim, null, null, "ToChar");
                
            //     for(var other of victim.Room.Characters) {
            //         if(other.Fighting == victim) {
            //             other.Fighting = null;
            //             character.Position = "Standing";
            //         }
            //     }
            //     victim.Fighting = null;
            // }
        }
    }

    /**
     * Attempt to perform multiple hits.
     * @param {CharacterData} character 
     */
    static ExecuteRound(character) {
        var attackskills = ["", "second attack", "third attack", "fourth attack", "fifth attack"];
        var numhits = 5; //Math.floor(Math.random() * 5);
        var weapon = character.Equipment["Wield"];
        for(var i = 0; i < numhits; i++) {
            if(character.Fighting) {
                if(attackskills[i].ISEMPTY() || character.GetSkillPercentage(attackskills[i]) * .75 > Utility.NumberPercent()) {
                    Combat.OneHit(character, character.Fighting, weapon)
                    if(!attackskills[i].ISEMPTY()) {
                        character.CheckImprove(attackskills[i], true, 1);
                    }
                } else {
                    if(!attackskills[i].ISEMPTY()) {
                        character.CheckImprove(attackskills[i], false, 1);
                    }
                    break;
                }
            }
        }

        numhits = 5; //Math.floor(Math.random() * 5);
        var dualwieldskill = SkillSpell.GetSkill("dual wield");
        if(!character.Equipment["Shield"] &&
            !character.Equipment["Held"] && 
            character.GetSkillPercentage(dualwieldskill) > 1) {
            weapon = character.Equipment["DualWield"];
            for(var i = 0; i < numhits; i++) {
                if(character.Fighting) {
                    if(character.GetSkillPercentage(dualwieldskill) * .75 > Utility.NumberPercent()) {
                        if(attackskills[i].ISEMPTY() || character.GetSkillPercentage(attackskills[i]) * .75 > Utility.NumberPercent()) {
                            Combat.OneHit(character, character.Fighting, weapon, true)
                            character.CheckImprove("dual wield", true, 1);
                            if(!attackskills[i].ISEMPTY()) {
                                character.CheckImprove(attackskills[i], true, 1);
                            }
                        } else {
                            if(!attackskills[i].ISEMPTY()) {
                                character.CheckImprove(attackskills[i], false, 1);
                            }
                            break;
                        }    
                        character.CheckImprove(dualwieldskill, true, 1);
                        
                    } else {
                        character.CheckImprove(dualwieldskill, false, 1);
                        break;
                    }
                }
            }
        }
    };

    static Damage(ch, victim, damage, skill = "attack",
        DamageType = "Bash", ownerName = "", weapon = null,
        show = true, allowflee = true)
    {
        if(!damage) damage = 0;

        var nounDamage = skill;

        // If a skill is provided and it has a specific noun for damage, use that noun
        if(skill.isString()) {
            nounDamage = skill;
        }
        else if (skill && !skill.NounDamage.IsNullOrEmpty()) {
            nounDamage = skill.NounDamage;
        }

        if (!victim)
            return false;

        // Check if the damage exceeds 500, log a message if true
        if (damage > 500)
            console.log(ch.Name + " did more than 500 damage in one hit.");

        // Perform actions on the attacker (ch) if it exists
        if (ch)
        {
            // Check if the attacker and victim are in a safe zone, return false if true
            if (Combat.CheckIsSafe(ch, victim))
                return false;

            // If the victim is not already in combat and the attacker is not the victim,
            // initiate combat and notify other characters in the area
            if (!victim.Fighting && ch != victim)
            {
                // if (victim.Form != null && victim.Room != null && victim.Room.Area != null)
                // {
                //     // Notify other characters in the area of the attack
                //     foreach (var person in victim.Room.Area.People)
                //     {
                //         if (person != victim)
                //             person.Act(victim.Form.Yell, victim, null, null, ActType.ToChar);
                //     }
                // }
                // else
                Character.DoCommands.DoYell(victim, "Help! " + ch.Display(victim) + " is attacking me!");

                Combat.SetFighting(victim, ch); // Set victim's fighting target to the attacker
            }

            // If the attacker is not already in combat and is not the victim, set the attacker's target to the victim
            if (ch.Fighting == null && ch != victim)
                Combat.SetFighting(ch, victim);

            // Strip various hiding and camouflage effects from the attacker
            // if (ch != victim)
            //     ch.StripCamouflage();
            // ch.StripHidden();
            // ch.StripInvis();
            // ch.StripSneak();

            // Apply additional effects if the attacker is affected by Burrow
            if (ch != victim && ch.IsAffected("Burrow"))
            {
                ch.AffectedBy.RemoveFlag("Burrow");
                damage *= 3; // Triple the damage
                ch.Act("Your first hit coming out of your burrow surprises $N", victim, null, null, "ToChar");
                ch.Act("$n's first hit coming out $s burrow surprises $N", victim, null, null, "ToRoomNotVictim");
                ch.Act("$n's attack surprises you!", victim, null, null, "ToVictim");
            }

            // Remove the PlayDead effect if the attacker is affected by it
            if (ch != victim && ch.IsAffected("PlayDead"))
                ch.AffectedBy.RemoveFlag("PlayDead");

            // Reduce damage if the victim is affected by Protection and the attacker and victim have opposing alignments
            if ((victim.IsAffected("Protection") && ch.Alignment == "Evil" && victim.Alignment == "Good") ||
                (victim.IsAffected("Protection") && ch.Alignment == "Good" && victim.Alignment == "Evil"))
            {
                damage = (damage * 3 / 4); // Reduce damage by 25%
            }
        } // if ch != null

        // Reset the reset timer for the area if the attacker exists and is in a room within an area
        if (ch != null && ch.Room != null && ch.Room.Area != null)
            ch.Room.Area.Timer = 15;

        // Reduce damage if the victim is affected by Stone Skin
        if (victim.IsAffected("stone skin"))
            damage = (damage * 3 / 4); // Reduce damage by 25%

        // Reduce damage based on various shield effects on the victim
        if (victim.IsAffected("Sanctuary"))
            damage /= 2;
        if (victim.IsAffected("Haven"))
            damage -= damage * 3 / 8;
        if (victim.IsAffected("Watershield"))
            damage -= (int)(damage * .15);
        if (victim.IsAffected("Airshield"))
            damage -= (int)(damage * .15);
        if (victim.IsAffected("Fireshield"))
            damage -= (int)(damage * .15);
        if (victim.IsAffected("Lightningshield"))
            damage -= (int)(damage * .15);
        if (victim.IsAffected("Frostshield"))
            damage -= (int)(damage * .15);
        if (victim.IsAffected("Earthshield"))
            damage -= (int)(damage * .15);
        if (victim.IsAffected("Shield"))
            damage -= damage * 3 / 8;
        if (victim.IsAffected("AnthemOfResistance"))
            damage = damage - (damage / 4);
        if (victim.IsAffected("Retract"))
            damage = Math.ceil(damage * .05);

        // Increase damage if the attacker is affected by Bestial Fury
        if (ch != victim && ch.IsAffected("BestialFury"))
            damage += damage * .25;

        // Check if the victim is affected by Skin of the Displacer and has a chance to avoid the damage
        if (ch != victim && victim.IsAffected("SkinOfTheDisplacer") && Utility.Random(1, 8) == 1)
        {
            victim.Act("Your skin shimmers as you avoid $N's {0}.", ch, null, null, "ToChar", nounDamage);
            victim.Act("$n's skin shimmers as $e avoids $N's {0}.", ch, null, null, "ToRoomNotVictim", nounDamage);
            victim.Act("$n's skin shimmers as $e avoids your {0}.", ch, null, null, "ToVictim", nounDamage);
            return false; // Damage is avoided, return false
        }

        var immune = false;

        // Check the victim's immunity status against the damage type
        // switch (victim.CheckImmune(DamageType))
        // {
        //     case ImmuneStatus.Immune:
        //         immune = true;
        //         damage = 0; // Damage is completely negated
        //         break;
        //     case ImmuneStatus.Resistant:
        //         if (victim.IsNPC)
        //             damage -= damage / 2; // Reduce damage by 50% for NPCs
        //         else
        //             damage -= damage / 2; // Reduce damage by 50% for players
        //         break;
        //     case ImmuneStatus.Vulnerable:
        //         damage += damage / 2; // Increase damage by 50%
        //         break;
        // }

        // [immune, damage] = Combat.CheckWeaponImmune(victim, weapon);

        // Remove hiding and camouflage effects from the victim if damage is greater than 0
        if (damage > 0)
        {
            // victim.StripHidden();
            // victim.StripInvis();
            // victim.StripSneak();
            // victim.StripCamouflage();
        }

        // Display the damage message if show is true
        if (show)
            Combat.ShowDamageMessage(ch, victim, damage, nounDamage, DamageType, immune);

        // Reduce the victim's hit points by the damage amount
        victim.HitPoints -= damage;

        // Update the attacker (ch) if ownerName is provided and the attacker is the victim or null
        if (!ownerName.IsNullOrEmpty() && (ch == victim || ch == null))
        {
            ch = Character.Characters.FirstOrDefault(function(character) { return character.Name == ownerName; });
        }

        // Check if the victim is dead or has reached 0 hit points
        Combat.CheckIsDead(ch, victim, damage);

        // If the victim is an NPC and in a fighting position, has a chance to flee
        // if ((victim.Position == "Fighting" || victim.Position == "Standing") &&
        //     victim.IsNPC &&
        //     allowflee &&
        //     ch != null &&
        //     ch != victim &&
        //     victim.Room == ch.Room &&
        //     damage > 0 &&
        //     victim.Wait < Game.PULSE_VIOLENCE / 2)
        // {
        //     // Check flee conditions and execute fleeing
        //     if (((victim.Flags.ISSET(ActFlags.Wimpy) && Utility.Random(0, 4) == 0 && victim.HitPoints < victim.MaxHitPoints / 5)) ||
        //         (victim.Master != null && victim.Master.Room != victim.Room) && allowflee)
        //     {
        //         Combat.DoFlee(victim, "");
        //     }
        // }

        // If the victim is a player, check if they have a wimpy value and can flee
        // if (typeof(victim) == "Player" && ch != victim)
        // {
        //     var player = victim;

        //     if (player.Wimpy > 0 &&
        //         (victim.Position == "Fighting" || victim.Position == "Standing") &&
        //         damage > 0 &&
        //         ch != null &&
        //         victim.Room == ch.Room &&
        //         allowflee &&
        //         victim.HitPoints < player.Wimpy //&&
        //         //victim.Wait < Game.PULSE_VIOLENCE / 2
        //             )
        //     {
        //         Combat.DoFlee(victim, "");
        //     }
        // }

        return true; // Damage applied successfully
    }

    static ShowDamageMessage(ch, victim, damageAmount, nounDamage, DamageType = "Bash", immune = false)
    {
        // Variables for verb singular, verb plural, and punctuation
        var vs = "";
        var vp = "";
        var punct = "";

        // Determine the appropriate verb phrases based on the damage amount
        if (damageAmount == 0)
        {
            vs = "miss";
            vp = "misses";
        }
        else if (damageAmount <= 1)
        {
            vs = "barely scratch";
            vp = "barely scratches";
        }
        else if (damageAmount <= 2)
        {
            vs = "scratch";
            vp = "scratches";
        }
        else if (damageAmount <= 4)
        {
            vs = "graze";
            vp = "grazes";
        }
        else if (damageAmount <= 7)
        {
            vs = "hit";
            vp = "hits";
        }
        else if (damageAmount <= 11)
        {
            vs = "injure";
            vp = "injures";
        }
        else if (damageAmount <= 15)
        {
            vs = "wound";
            vp = "wounds";
        }
        else if (damageAmount <= 20)
        {
            vs = "maul";
            vp = "mauls";
        }
        else if (damageAmount <= 25)
        {
            vs = "decimate";
            vp = "decimates";
        }
        else if (damageAmount <= 30)
        {
            vs = "devastate";
            vp = "devastates";
        }
        else if (damageAmount <= 37)
        {
            vs = "maim";
            vp = "maims";
        }
        else if (damageAmount <= 45)
        {
            vs = "MUTILATE";
            vp = "MUTILATES";
        }
        else if (damageAmount <= 55)
        {
            vs = "EVISCERATE";
            vp = "EVISCERATES";
        }
        else if (damageAmount <= 65)
        {
            vs = "DISMEMBER";
            vp = "DISMEMBERS";
        }
        else if (damageAmount <= 85)
        {
            vs = "MASSACRE";
            vp = "MASSACRES";
        }
        else if (damageAmount <= 100)
        {
            vs = "MANGLE";
            vp = "MANGLES";
        }
        else if (damageAmount <= 135)
        {
            vs = "*** DEMOLISH ***";
            vp = "*** DEMOLISHES ***";
        }
        else if (damageAmount <= 160)
        {
            vs = "*** DEVASTATE ***";
            vp = "*** DEVASTATES ***";
        }
        else if (damageAmount <= 250)
        {
            vs = "=== OBLITERATE ===";
            vp = "=== OBLITERATES ===";
        }
        else if (damageAmount <= 330)
        {
            vs = ">>> ANNIHILATE <<<";
            vp = ">>> ANNIHILATES <<<";
        }
        else if (damageAmount <= 380)
        {
            vs = "<<< ERADICATE >>>";
            vp = "<<< ERADICATES >>>";
        }
        else
        {
            vs = "do UNSPEAKABLE things to";
            vp = "does UNSPEAKABLE things to";
        }

        // Determine the appropriate punctuation based on the damage amount
        punct = (damageAmount <= 33) ? "." : "!";

        // If the damage is immune (no effect)
        if (immune)
        {
            // Check various conditions and display corresponding immunity messages
            if (ch == victim && !Utility.IsNullOrEmpty(nounDamage))
            {
                ch.Act("$n is unaffected by $s own " + nounDamage + ".", null, null, null, "ToRoom");
                ch.Act("Luckily, you are immune to that.");
            }
            else if (!Utility.IsNullOrEmpty(nounDamage))
            {
                ch.Act("$N is unaffected by $n's " + nounDamage + "!", victim, null, null, "ToRoomNotVictim");
                ch.Act("$N is unaffected by your " + nounDamage + "!", victim, null, null, "ToChar");
                ch.Act("$n's " + nounDamage + " is powerless against you.", victim, null, null, "ToVictim");
            }
            else if (ch == victim)
            {
                ch.Act("$n is unaffected by $mself.", null, null, null, "ToRoom");
                ch.Act("Luckily, you are immune to that.");
            }
            else
            {
                ch.Act("$N is unaffected by $n!", victim, null, null, "ToRoomNotVictim");
                ch.Act("$N is unaffected by you!", victim, null, null, "ToChar");
                ch.Act("$n is powerless against you.", victim, null, null, "ToVictim");
            }
        }

        // If the attacker and victim are different characters and there is a specific damage noun
        if (victim != ch && ch != null && !Utility.IsNullOrEmpty(nounDamage))
        {
            // Display damage messages with specific noun to the attacker, victim, and the room
            ch.Act("Your " + nounDamage + " \\R" + vp + "\\x $N" + punct, victim, null, null, "ToChar");
            victim.Act("$N's " + nounDamage + " \\R" + vp + "\\x you" + punct, ch, null, null, "ToChar");
            ch.Act("$n's " + nounDamage + " \\R" + vp + "\\x $N" + punct, victim, null, null, "ToRoomNotVictim");
        }
        // If the attacker is null and there is a specific damage noun
        else if (ch == null && !Utility.IsNullOrEmpty(nounDamage))
        {
            // Display damage messages with specific noun to the victim and the room
            victim.Act("Your " + nounDamage + " \\R" + vp + "\\x you" + punct, null, null, null, "ToChar");
            victim.Act("$n's " + nounDamage + " \\R" + vp + "\\x them" + punct, null, null, null, "ToRoom");
        }
        // If there is a specific damage noun but no attacker
        else if (!Utility.IsNullOrEmpty(nounDamage))
        {
            // Display damage messages with specific noun to the attacker (if available) and the room
            ch.Act("Your " + nounDamage + " \\R" + vp + "\\x you" + punct, null, null, null, "ToChar");
            ch.Act("$n's " + nounDamage + " \\R" + vp + "\\x them" + punct, victim, null, null, "ToRoom");
        }
        // If the attacker and victim are different characters and there is no specific damage noun
        else if (victim != ch && ch != null)
        {
            // Display generic damage messages to the attacker, victim, and the room
            ch.Act("You \\R" + vs + "\\x $N" + punct, victim, null, null, "ToChar");
            victim.Act("$N \\R" + vp + "\\x you" + punct, ch, null, null, "ToChar");
            ch.Act("$n \\R" + vp + "\\x $N" + punct, victim, null, null, "ToRoomNotVictim");
        }
        // If the attacker is null and there is no specific damage noun
        else if (ch == null && Utility.IsNullOrEmpty(nounDamage))
        {
            // Display generic damage messages to the victim and the room
            victim.Act("You \\R" + vs + "\\x yourself" + punct, null, null, null, "ToChar");
            victim.Act("$n \\R" + vp + "\\x $mself" + punct, null, null, null, "ToRoom");
        }
        // If there is no specific damage noun
        else if (Utility.IsNullOrEmpty(nounDamage))
        {
            // Display generic damage messages to the attacker and the room
            ch.Act("You \\R" + vs + "\\x yourself" + punct, null, null, null, "ToChar");
            ch.Act("$n \\R" + vp + "\\x $mself" + punct, victim, null, null, "ToRoom");
        }
    } // end damageMessage

    static DoFlee = function(character, args) {
        if (!character.Fighting) {
            character.send("You aren't fighting anyone!\n\r");
        }
        else
        {
            var exits = character.Room.Exits.Select(function(exit) {
                return exit && 
                exit.Destination && 
                (!exit.Flags.Closed || 
                (!exit.Flags.NoPass && ch.AffectFlags.PassDoor)) && 
                !exit.Flags.Window  &&
                (exit.Destination.Area == character.Room.Area || !character.IsNPC || !character.Flags.StayArea) &&
                (character.IsImmortal || character.IsNPC || (character.Level <= exit.Destination.MaxLevel && character.Level >= exit.Destination.MinLevel))
            });
            
            if (exits.length > 0)
            {
                // TODO Chance to fail
                var grip;
                if (character.Fighting && character.Fighting.Fighting == character && (grip = character.Fighting.GetSkillPercentage("grip")) > 1)
                {
                    if (grip > Utility.NumberPercent())
                    {
                        character.Fighting.Act("$n grips you in its strong raptorial arms, preventing you from fleeing.", character, null, null, "ToVictim");
                        character.Fighting.Act("You grip $N in your strong raptorial arms, preventing $M from fleeing.", character, null, null, "ToChar");
                        character.Fighting.Act("$n grips $N in its strong raptorial arms, preventing $M from fleeing.", character, null, null, "ToRoomNotVictim");
                        return;
                    }
                }

                if (character.IsAffectedSkill(SkillSpell.GetSkill("secreted filament", false)) && Utility.Random(0, 1) == 0)
                {
                    character.Act("The secreted filament covering you prevents you from fleeing.\n\r");
                    character.Act("$n tries to flee, but the filament covering $m prevents $m from doing so.", null, null, null, "ToRoom");

                    return;
                }
                var cutoff = false;
                for (var fightingch of Utility.CloneArray(character.Room.Characters))
                {
                    if (fightingch.Fighting == character)
                    {
                        cutoff = Combat.CheckCutoff(fightingch, character);
                        Combat.CheckPartingBlow(fightingch, character);
                    }
                }
                if (cutoff) return;

                if (Utility.Random(1, 10) == 1)
                {
                    character.send("PANIC! You couldn't escape!\n\r");
                    return;
                }
                var exit = exits[Utility.Random(0, exits.length - 1)];

                //RoomData WasInRoom = ch.Room;

                var wasFighting = character.Fighting;
                var wasPosition = character.Position;
                var wasInRoom = character.Room;
                character.Fighting = null;
                character.Position = "Standing";
                var chance = 0;
                if ((chance = character.GetSkillPercentage("rogues awareness")) > 1 && chance > Utility.NumberPercent())
                {
                    character.send("You flee {0}.\n\r", exit.Direction.toLowerCase());
                    character.CheckImprove("rogues awareness", true, 1);
                }
                else
                {
                    if (chance > 1)
                    {
                        character.CheckImprove("rogues awareness", false, 1);
                    }
                    character.send("You flee from combat.\n\r");
                }
                character.Act("$n flees {0}.\n\r", null, null, null, "ToRoom", exit.Direction.toLowerCase());
                Character.Move(character, RoomData.Directions.indexOf(exit.Direction.toLowerCase()), false, false, false);

                if (character.Room == wasInRoom)
                {
                    character.Fighting = wasFighting;
                    character.Position = wasPosition;
                }
                else
                {
                    if (wasFighting != null && wasFighting.Fighting == character) {
                        wasFighting.Fighting = null;
                        wasFighting.Position = "Standing";
                    }
                        

                    for (var fightingme of wasInRoom.Characters)
                        if (fightingme.Fighting == character)
                        {
                            // Find someone else to fight
                            var fightingother = fightingme.Room.Characters.Select(function(other) {
                                return other.Fighting == fightingme
                            })
                            fightingother.SelectRandom();

                            if (fightingother)
                                fightingme.Fighting = fightingother;
                            else if (fightingme.Position == "Fighting") // No one else to fight? go back to standing
                            {
                                fightingme.Fighting = null;
                                fightingme.Position = "Standing";
                            } else {
                                fightingme.Fighting = null;
                            }

                        }
                }

            }
            else {
                character.send("You don't see anywhere to flee to!\n\r");
            }
        }
    }

    static DoDirtKick(ch, args)
    {
        var victim;
        var dam;
        var skillPercent = 0;
        var skill = SkillSpell.GetSkill("dirt kick");
        var chance;
        if ((chance = skillPercent = ch.GetSkillPercentage(skill)) <= 1)
        {
            ch.send("You get your feet dirty.\n\r");
            return;
        }
        var count = 0;
        if (!(victim = ch.Fighting) && !(args.IsNullOrEmpty() || (([victim, count] = Character.CharacterFunctions.GetCharacterHere(ch, args, count)) && victim)))
        {
            ch.send("You aren't fighting anyone.\n\r");
            return;
        }
        var aff;
        if ((aff = victim.FindAffect("Blind")) != null)
        {
            ch.send("They are already blinded.\n\r");
            return;
        }
        if (Combat.CheckIsSafe(ch, victim)) return;

        ch.WaitState(skill.WaitTime);

        /* stats */
        chance += ch.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity);
        chance -= 2 * victim.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity);

        /* speed  */
        if (ch.Flags.IsSet("Fast") || ch.IsAffected("Haste"))
            chance += 10;
        if (ch.Flags.IsSet("Slow"))
            chance -= 30;
        if (victim.Flags.IsSet("Fast") || victim.IsAffected("Haste"))
            chance -= 30;
        if (victim.Flags.IsSet("Slow"))
            chance += 30;

        /* level */
        chance += (ch.Level - victim.Level) * 2;

        /* sloppy hack to prevent false zeroes */
        if (chance % 5 == 0)
            chance += 1;

        /* terrain */

        switch (ch.Room.Sector)
        {
            case "Inside": chance -= 20; break;
            case "City": chance -= 10; break;
            case "Field": chance += 5; break;
            case "Forest":
            case "Hills":
                break;
            case "Mountain": chance -= 10; break;
            case "WaterSwim":
            case "WaterNoSwim":
            case "Underwater":
                chance = 0; break;
            case "Air": chance = 0; break;
            case "Desert": chance += 10; break;
        }

        if (chance == 0)
        {
            ch.send("There isn't any dirt to kick.\n\r");
            return;
        }

        if (chance > Utility.NumberPercent())
        {
            dam = Utility.Random(2, 5);

            victim.Act("$n is blinded by the dirt in $s eyes!", null, null, null, "ToRoom");
            ch.Act("$n kicks dirt in your eyes!", victim, null, null, "ToVictim");

            Combat.Damage(ch, victim, dam, skill, "Blind");//, DAM_BASH, true);

            //if (!(victim.ImmuneFlags.IsSet("Blind") || (victim.Form != null && victim.Form.ImmuneFlags.ISSET(WeaponDamageTypes.Blind))) || victim.IsAffected(AffectFlags.Deafen))
            //{
                var newAffect = new AffectData();
                newAffect.Flags.Blind = true;
                newAffect.Duration = 0;
                newAffect.DisplayName = "dirt kick";
                newAffect.Modifier = -4;
                newAffect.Location = "Hitroll";
                newAffect.SkillSpell = skill;
                newAffect.EndMessage = "You wipe the dirt from your eyes.\n\r";
                newAffect.EndMessageToRoom = "$n wipes the dirt from their eyes.\n\r";
                newAffect.AffectType = "Skill";
                victim.AffectToChar(newAffect);
            //}
            //else
            //    victim.Act("$n is immune to blindness.",null, null, null, "ToRoom");
            ch.CheckImprove(skill, true, 1);
        }
        else
        {
            Combat.Damage(ch, victim, 0, skill);

            ch.CheckImprove(skill, false, 1);
        }
    }

    static CheckDodge(ch, victim, weapon, damageType)
    {
        var chance;
        var dex, dexa;
        var skDodge;
        if (!victim) return false;

        if (!victim.IsAwake)
            return false;

        skDodge = SkillSpell.SkillLookup("dodge");

        if (!skDodge) return false;

        var skillDodge = victim.GetSkillPercentage(skDodge) * .75;

        if (victim.GetSkillPercentage("tree climb") > 1 && 
            victim.Room.Sector == RoomData.SectorTypes.Forest || 
            victim.Room.Sector == RoomData.SectorTypes.Cave)
        {
            skillDodge = 90;
        }

        chance = (3 * skillDodge / 10);

        dex = victim.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity);
        dexa = ch.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity);
        if (dex <= 5)
            chance += 0;
        else if (dex <= 10)
            chance += dex / 2;
        else if (dex <= 15)
            chance += (2 * dex / 3);
        else if (dex <= 20)
            chance += (8 * dex / 10);
        else
            chance += dex;
        chance += dex - dexa;
        chance += (Character.Sizes.indexOf(ch.Size) - Character.Sizes.indexOf(victim.Size)) * 5;


        if (!victim.CanSee(ch))
            chance *= Utility.Random(6 / 10, 3 / 4);

        if (ch.IsAffected(AffectData.AffectFlags.Haste)) chance -= 20;
        if (victim.IsAffected(AffectData.AffectFlags.Haste)) chance += 5;
        if (ch.IsAffected(AffectData.AffectFlags.Slow)) chance += 5;
        if (victim.IsAffected(AffectData.AffectFlags.Slow)) chance -= 5;

        if (ch.Form) chance = chance * (100 - ch.Form.ParryModifier) / 100;

        if (Utility.NumberPercent() >= chance + victim.Level - ch.Level)
        {
            victim.CheckImprove(skDodge, false, 4);
            return false;
        }

        // check concealed sends its own dodge message
        if (!Combat.CheckConcealed(victim, ch, damageType))
        {
            ch.Act("You \\Cdodge\\x $n's {0}.", victim, null, null, Character.ActType.ToVictim, damageType);
            ch.Act("$N \\Cdodges\\x your {0}.", victim, null, null, Character.ActType.ToChar, damageType);
        }
        victim.CheckImprove(skDodge, true, 5);

        Combat.CheckOwaza(victim, ch);

3
        return true;
    } // end check dodge

    static CheckParry(ch, victim, weapon, damageType)
    {
        var chance = 0;
        var skParry;
        var skWeapon = null;
        var victimWield;
        var victimDualWield;
        var skVictimWield = null;
        var skVictimDualWield = null;
        var skVictimDualWieldSkill = null;

        if (!victim.IsAwake)
            return false;

        skParry = SkillSpell.SkillLookup("parry");
        victimWield = victim.Equipment["Wield"];
        victimDualWield = victim.Equipment["DualWield"];

        if (weapon != null) // weapon ch is using to hit victim, skill lowers chance of parry
        {
            skWeapon = SkillSpell.SkillLookup(weapon.WeaponType);
            chance -= ch.GetSkillPercentage(skWeapon) / 10;

            switch (weapon.WeaponType)
            {
                default: chance += 15; break;
                case ItemData.WeaponTypes.Sword: chance += 5; break;
                case ItemData.WeaponTypes.Dagger: chance += 5; break;
                case ItemData.WeaponTypes.Spear: chance -= 5; break;
                case ItemData.WeaponTypes.Staff: chance -= 5; break;
                case ItemData.WeaponTypes.Mace: chance -= 5; break;
                case ItemData.WeaponTypes.Axe: chance -= 5; break;
                case ItemData.WeaponTypes.Flail: chance += 10; break;
                case ItemData.WeaponTypes.Whip: chance += 10; break;
                case ItemData.WeaponTypes.Polearm: chance -= 5; break;
            }
        }

        if (victimWield != null)
        {
            skVictimWield = SkillSpell.SkillLookup(victimWield.WeaponType);
            var skillChance = victim.GetSkillPercentage(skVictimWield);
            chance += skillChance / 10;

            switch (victimWield.WeaponType)
            {
                default: chance += 15; break;
                case ItemData.WeaponTypes.Sword: chance += 10; break;
                case ItemData.WeaponTypes.Dagger: chance -= 20; break;
                case ItemData.WeaponTypes.Spear: chance += 20; break;
                case ItemData.WeaponTypes.Staff: chance += 10; break;
                case ItemData.WeaponTypes.Mace: chance -= 20; break;
                case ItemData.WeaponTypes.Axe: chance -= 25; break;
                case ItemData.WeaponTypes.Flail: chance -= 10; break;
                case ItemData.WeaponTypes.Whip: chance -= 10; break;
                case ItemData.WeaponTypes.Polearm: chance += 10; break;
            }
        }

        if (victimDualWield != null)
        {
            skVictimDualWield = SkillSpell.SkillLookup(victimDualWield.WeaponType);
            skVictimDualWieldSkill = SkillSpell.SkillLookup("dual wield");

            var skillChance = victim.GetSkillPercentage(skVictimDualWield); ;
            chance += skillChance / 10;
            skillChance = victim.GetSkillPercentage(skVictimDualWieldSkill);
            chance += skillChance / 10;
            switch (victimDualWield.WeaponType)
            {
                default: chance += 15; break;
                case ItemData.WeaponTypes.Sword: chance += 10; break;
                case ItemData.WeaponTypes.Dagger: chance -= 20; break;
                case ItemData.WeaponTypes.Spear: chance += 20; break;
                case ItemData.WeaponTypes.Staff: chance += 10; break;
                case ItemData.WeaponTypes.Mace: chance -= 20; break;
                case ItemData.WeaponTypes.Axe: chance -= 25; break;
                case ItemData.WeaponTypes.Flail: chance -= 10; break;
                case ItemData.WeaponTypes.Whip: chance -= 10; break;
                case ItemData.WeaponTypes.Polearm: chance += 10; break;
            }
        }

        if (skParry == null || (!victim.IsNPC && victim.GetSkillPercentage(skParry) == 0)) return false;
        
        //if (!victim.isNPC)
        chance += victim.GetSkillPercentage(skParry) / 2;
        chance /= 2;
        
        if(!victimWield && !victimDualWield) chance = 0;

        var unarmeddefense = SkillSpell.SkillLookup("unarmed defense");
        var unarmeddefensechance = 0;
        if (!victimWield && !victimDualWield && (unarmeddefensechance = victim.GetSkillPercentage(unarmeddefense)) > 1)
            chance = (chance + unarmeddefensechance) / 2;

        var ironfists = SkillSpell.SkillLookup("ironfists");
        var ironfistschance = 0;
        if (!victimWield && !victimDualWield && (ironfistschance = victim.GetSkillPercentage(ironfists)) > 1)
            chance = (chance + ironfistschance) / 2;

        var flourintine = SkillSpell.SkillLookup("flourintine");
        var flourintinechance = 0;
        // must dual wield swords for flourintine
        if (((victimWield && victimWield.WeaponType == ItemData.WeaponTypes.Sword) && (victimDualWield && victimDualWield.WeaponType == ItemData.WeaponTypes.Sword)) && (flourintinechance = victim.GetSkillPercentage(flourintine)) > 1)
        {
            chance += flourintinechance / 5;
        }
        //else
        //    chance /= 5;
        if (ch.IsAffected(AffectData.AffectFlags.Haste)) chance -= 20;
        if (victim.IsAffected(AffectData.AffectFlags.Haste)) chance += 5;
        if (ch.IsAffected(AffectData.AffectFlags.Slow)) chance += 5;
        if (victim.IsAffected(AffectData.AffectFlags.Slow)) chance -= 5;

        if (ch.Form) chance = chance * (100 - ch.Form.ParryModifier) / 100;

        if (Utility.NumberPercent() >= chance + victim.Level - ch.Level)
        {
            if (unarmeddefensechance > 1)
                victim.CheckImprove(unarmeddefense, false, 2);
            if (ironfistschance > 1)
                victim.CheckImprove(ironfists, false, 2);
            if (flourintinechance > 1)
                victim.CheckImprove(flourintine, true, 2);
            victim.CheckImprove(skParry, false, 4);
            return false;
        }

        if (unarmeddefensechance > 1 || ironfistschance > 1)
        {
            ch.Act("You \\Cparry\\x $n's {0} with your bare hands.", victim, null, null, Character.ActType.ToVictim, damageType);
            ch.Act("$N \\Cparries\\x your {0} with $S bare hands.", victim, null, null, Character.ActType.ToChar, damageType);
        }
        else
        {
            ch.Act("You \\Cparry\\x $n's {0}.", victim, null, null, Character.ActType.ToVictim, damageType);
            ch.Act("$N \\Cparries\\x your {0}.", victim, null, null, Character.ActType.ToChar, damageType);
        }

        victim.CheckImprove(skParry, true, 5);
        if (unarmeddefensechance > 1)
            victim.CheckImprove(unarmeddefense, true, 1);
        if (ironfistschance > 1)
            victim.CheckImprove(ironfists, true, 1);
        if (flourintinechance > 1)
            victim.CheckImprove(flourintine, true, 1);
        if ((victimWield != null && victimWield.WeaponType == ItemData.WeaponTypes.Sword) || (victimDualWield != null && victimDualWield.WeaponType == ItemData.WeaponTypes.Sword))
        {
            var skRiposte = SkillSpell.SkillLookup("riposte");
            var riposteChance = victim.GetSkillPercentage(skRiposte);

            if (riposteChance > Utility.NumberPercent())
            {
                victim.Act("You riposte $N's {0}!", ch, null, null, Character.ActType.ToChar, damageType);
                ch.Act("$N ripostes your {0}!", victim, null, null, Character.ActType.ToChar, damageType);
                var offhand = !(victimWield != null && victimWield.WeaponType == WeaponTypes.Sword);
                Combat.OneHit(victim, ch, !offhand ? victimWield : victimDualWield, offhand, skRiposte);
            }
        }
        Combat.CheckOwaza(victim, ch);

        return true;
    } // end check parry

    static CheckShieldBlock(ch, victim, weapon, damageType)
    {
        var chance;
        var str, stra;
        var skShieldBlock;
        if (!victim.IsAwake)
            return false;

        if (victim.Form) return false;

        skShieldBlock = SkillSpell.SkillLookup("shield block");
        var shield;
        if (skShieldBlock == null || !(shield = victim.Equipment["Shield"])) return false;

        var skillDodge = !victim.IsNPC ? victim.GetSkillPercentage(skShieldBlock) * .75: 50;
        chance = (3 * skillDodge / 10);

        str = victim.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Strength);
        stra = ch.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Strength);
        if (str <= 5)
            chance += 0;
        else if (str <= 10)
            chance += str / 2;
        else if (str <= 15)
            chance += (2 * str / 3);
        else if (str <= 20)
            chance += (8 * str / 10);
        else
            chance += str;
        chance += str - stra;
        chance += (Character.Sizes.indexOf(ch.Size) - Character.Sizes.indexOf(victim.Size)) * 5;


        if (!victim.CanSee(ch))
            chance *= Utility.Random(6 / 10, 3 / 4);

        if (Utility.NumberPercent() >= chance + victim.Level - ch.Level)
        {
            victim.CheckImprove(skShieldBlock, false, 4);
            return false;
        }

        ch.Act("You \\Cblock\\x $n's {0} with $p.", victim, shield, null, Character.ActType.ToVictim, damageType);
        ch.Act("$N \\Cblocks\\x your {0} with $p.", victim, shield, null, Character.ActType.ToChar, damageType);

        victim.CheckImprove(skShieldBlock, true, 5);

        Combat.CheckShieldJab(victim, ch);
        Combat.CheckOwaza(victim, ch);

        return true;
    } // end check shield block

    static CheckShieldJab(ch, victim)
    {
        var dam = 0;
        var skillPercent = 0;
        var skill = SkillSpell.SkillLookup("shield jab");

        if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
        {
            return;
        }

        if (victim.FindAffect(SkillSpell.SkillLookup("protective shield")) != null)
        {
            ch.WaitState(Game.PULSE_PER_VIOLENCE);
            ch.Act("You try to shield jab $N but miss $M.\n\r", victim, null, null, Character.Character.ActType.ToChar);
            ch.Act("$n tries to shield jab $N but miss $M.\n\r", victim, null, null, Character.Character.ActType.ToRoomNotVictim);
        }
        //else if (Utility.Random(0, 1) == 0) return; //50% chance for shield jab attempt
        else if (skillPercent > Utility.NumberPercent())
        {
            dam += Utility.dice(2, (ch.Level) / 2, (ch.Level) / 4);

            if (ch.Fighting == null)
            {
                ch.Position = "Fighting";
                ch.Fighting = victim;
            }
            ch.Act("You take advantage of your block and jab $N with your shield.\n\r", victim, null, null, Character.Character.ActType.ToChar);
            ch.Act("$n takes advantage of $s block and jabs $N with $s shield.\n\r", victim, null, null, Character.Character.ActType.ToRoomNotVictim);
            ch.Act("$n jabs you with $s shield after blocking your attack..\n\r", victim, null, null, Character.Character.ActType.ToVictim);

            Combat.Damage(ch, victim, dam, skill);

            ch.CheckImprove(skill, true, 1);
        }

        else ch.CheckImprove(skill, false, 1);
    }

    static CheckConcealed(ch, victim, dodgeDamageNoun)
    {
        var dam = 0;
        var skillPercent = 0;
        var skill = SkillSpell.SkillLookup("concealed");
        var wield;
        var offhand = false;
        if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
        {
            return false;
        }
        else if ((!(wield = ch.Equipment["Wield"]) || wield.WeaponType != ItemData.WeaponTypes.Dagger) &&
            ((offhand = true) && !(wield = ch.Equipment["DualWield"]) || wield.WeaponType != ItemData.WeaponTypes.Dagger))
        { // must be wielding a dagger to concealed attack
            return false;
        }
        else if (skillPercent > Utility.NumberPercent())
        {
            dam += Utility.dice(2, (ch.Level) / 2, (ch.Level) / 4);

            if (ch.Fighting == null)
            {
                ch.Position = "Fighting";
                ch.Fighting = victim;
            }
            ch.Act("You \\Cdodge\\x $N's {0} and close in for a concealed attack.\n\r", victim, null, null, Character.Character.ActType.ToChar, dodgeDamageNoun);
            ch.Act("$n \\Cdodges\\x $N's {0} and closes in for a concealed attack.\n\r", victim, null, null, Character.Character.ActType.ToRoomNotVictim, dodgeDamageNoun);
            ch.Act("$n \\Cdodges\\x your {0} and closes in for a concealed attack.\n\r", victim, null, null, Character.Character.ActType.ToVictim, dodgeDamageNoun);

            Combat.OneHit(ch, victim, wield, offhand);
            //Combat.Damage(ch, victim, dam, skill);

            ch.CheckImprove(skill, true, 1);
            return true;
        }

        else
        {
            ch.CheckImprove(skill, false, 1);
            return false;
        }
    }

    static CheckCutoff(ch, victim)
    {
        var skillPercent = 0;
        var skill = SkillSpell.SkillLookup("cutoff");
        var wield;

        if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
        {
            return false;
        }
        else if ((wield = ch.GetEquipment(WearSlotIDs.Wield)) == null || wield.WeaponType != WeaponTypes.Polearm)
        { // must be wielding a polearm to cut off an opponents escape
            return false;
        }
        else if (skillPercent > Utility.NumberPercent())
        {

            if (ch.Fighting == null)
            {
                ch.Position = "Fighting";
                ch.Fighting = victim;
            }
            ch.Act("You \\Ccuts off\\x $N's escape with $p.\n\r", victim, wield, null, Character.ActType.ToChar);
            ch.Act("$n \\Ccuts off\\x $N's escape with $p.\n\r", victim, wield, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n \\Ccuts off\\x your escape with $p.\n\r", victim, wield, null, Character.ActType.ToVictim);

            ch.CheckImprove(skill, true, 1);
            return true;
        }

        else
        {
            ch.CheckImprove(skill, false, 1);
            return false;
        }
    }

    static CheckPartingBlow(ch, victim)
    {
        var skillPercent = 0;
        var skill = SkillSpell.SkillLookup("parting blow");
        var wield;
        var offhand = false;

        if ((skillPercent = ch.GetSkillPercentage(skill) + 20) <= 21)
        {
            return;
        }
        else if (skillPercent > Utility.NumberPercent())
        {

            if (ch.Fighting == null)
            {
                ch.Position = "Fighting";
                ch.Fighting = victim;
            }
            ch.Act("You get a parting blow as $N attempts to escape.\n\r", victim, null, null, Character.Character.ActType.ToChar);
            ch.Act("$n gets a parting blow as $N attempts to escape.\n\r", victim, null, null, Character.Character.ActType.ToRoomNotVictim);
            ch.Act("$n gets a parting blow as you attempt to escape.\n\r", victim, null, null, Character.Character.ActType.ToVictim);

            wield = ch.GetEquipment(WearSlotIDs.Wield);
            // only hit with main hand
            Combat.OneHit(ch, victim, wield, offhand, skill);

            ch.CheckImprove(skill, true, 1);
            return;
        }

        else
        {
            ch.CheckImprove(skill, false, 1);
            return;
        }
    }

    static CheckDistance(ch, victim, weapon, damageType)
    {
        var chance = 0;
        var skDistance;
        var skWeapon = null;
        var victimWield;
        var skVictimWield = null;


        if (!victim.IsAwake)
            return false;

        skDistance = SkillSpell.SkillLookup("distance");

        victimWield = victim.Equipment["Wield"];

        if (victimWield == null || victimWield.WeaponType != ItemData.WeaponTypes.Polearm)
            return false;

        if (weapon != null) // weapon ch is using to hit victim, skill lowers chance of parry
        {
            skWeapon = SkillSpell.SkillLookup(weapon.WeaponType());
            chance -= ch.GetSkillPercentage(skWeapon) / 10;

            switch (weapon.WeaponType)
            {
                default: chance += 15; break;
                case ItemData.WeaponTypes.Sword: chance += 5; break;
                case ItemData.WeaponTypes.Dagger: chance += 5; break;
                case ItemData.WeaponTypes.Spear: chance -= 5; break;
                case ItemData.WeaponTypes.Staff: chance -= 5; break;
                case ItemData.WeaponTypes.Mace: chance -= 5; break;
                case ItemData.WeaponTypes.Axe: chance -= 5; break;
                case ItemData.WeaponTypes.Flail: chance += 10; break;
                case ItemData.WeaponTypes.Whip: chance += 10; break;
                case ItemData.WeaponTypes.Polearm: chance -= 5; break;
            }
        }

        if (victimWield != null)
        {
            skVictimWield = SkillSpell.SkillLookup(victimWield.WeaponType());
            var skillChance = victim.GetSkillPercentage(skVictimWield);
            chance += skillChance / 10;

            switch (victimWield.WeaponType)
            {
                default: chance += 15; break;
                case ItemData.WeaponTypes.Sword: chance += 10; break;
                case ItemData.WeaponTypes.Dagger: chance -= 20; break;
                case ItemData.WeaponTypes.Spear: chance += 20; break;
                case ItemData.WeaponTypes.Staff: chance += 10; break;
                case ItemData.WeaponTypes.Mace: chance -= 20; break;
                case ItemData.WeaponTypes.Axe: chance -= 25; break;
                case ItemData.WeaponTypes.Flail: chance -= 10; break;
                case ItemData.WeaponTypes.Whip: chance -= 10; break;
                case ItemData.WeaponTypes.Polearm: chance += 10; break;
            }
        }

        if (skDistance == null || (!victim.IsNPC && victim.GetSkillPercentage(skDistance) <= 1)) return false;

        //if (!victim.isNPC)
        chance += victim.GetSkillPercentage(skDistance) / 3;
        chance += victim.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Strength) / 2;
        chance -= ch.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Strength) / 4;

        if (victim.Size > ch.Size) chance += 20;
        if (ch.Size > victim.Size) chance -= 10;

        if (Utility.NumberPercent() >= chance + victim.Level - ch.Level)
        {
            victim.CheckImprove(skDistance, false, 4);
            return false;
        }


        ch.Act("You keep $n's {0} at a distance.", victim, null, null, Character.ActType.ToVictim, damageType);
        ch.Act("$N keeps you at a distance.", victim, null, null, Character.ActType.ToChar, damageType);

        victim.CheckImprove(skDistance, true, 5);

        return true;
    } // end check distance

    static CheckDefensiveSpin(ch, victim, weapon, damageType)
    {
        var chance = 0;
        var skSpin;
        var skWeapon = null;
        var victimWield;
        var skVictimWield = null;


        if (!victim.IsAwake)
            return false;


        skSpin = SkillSpell.SkillLookup("defensive spin");


        victimWield = victim.Equipment["Wield"];

        if (victimWield == null || (victimWield.WeaponType != ItemData.WeaponTypes.Staff && victimWield.WeaponType != ItemData.WeaponTypes.Spear))
            return false;

        if (weapon != null) // weapon ch is using to hit victim, skill lowers chance of parry
        {
            skWeapon = SkillSpell.SkillLookup(weapon.WeaponType());
            chance -= ch.GetSkillPercentage(skWeapon) / 10;

            switch (weapon.WeaponType)
            {
                default: chance += 15; break;
                case ItemData.WeaponTypes.Sword: chance += 5; break;
                case ItemData.WeaponTypes.Dagger: chance += 5; break;
                case ItemData.WeaponTypes.Spear: chance -= 5; break;
                case ItemData.WeaponTypes.Staff: chance -= 5; break;
                case ItemData.WeaponTypes.Mace: chance -= 5; break;
                case ItemData.WeaponTypes.Axe: chance -= 5; break;
                case ItemData.WeaponTypes.Flail: chance += 10; break;
                case ItemData.WeaponTypes.Whip: chance += 10; break;
                case ItemData.WeaponTypes.Polearm: chance -= 5; break;
            }
        }

        if (victimWield != null)
        {
            skVictimWield = SkillSpell.SkillLookup(victimWield.WeaponType());
            var skillChance = victim.GetSkillPercentage(skVictimWield);
            chance += skillChance / 10;

            switch (victimWield.WeaponType)
            {
                default: chance += 15; break;
                case ItemData.WeaponTypes.Sword: chance += 10; break;
                case ItemData.WeaponTypes.Dagger: chance -= 20; break;
                case ItemData.WeaponTypes.Spear: chance += 20; break;
                case ItemData.WeaponTypes.Staff: chance += 10; break;
                case ItemData.WeaponTypes.Mace: chance -= 20; break;
                case ItemData.WeaponTypes.Axe: chance -= 25; break;
                case ItemData.WeaponTypes.Flail: chance -= 10; break;
                case ItemData.WeaponTypes.Whip: chance -= 10; break;
                case ItemData.WeaponTypes.Polearm: chance += 10; break;
            }
        }

        if (skSpin == null || (!victim.IsNPC && victim.GetSkillPercentage(skSpin) <= 1)) return false;

        //if (!victim.isNPC)
        chance += victim.GetSkillPercentage(skSpin) / 3;
        chance += victim.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity) / 2;
        chance -= ch.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity) / 4;

        if (Utility.NumberPercent() >= chance + victim.Level - ch.Level)
        {
            victim.CheckImprove(skSpin, false, 4);
            return false;
        }


        ch.Act("You keep $n's {0} at bay as you spin away.", victim, null, null, Character.ActType.ToVictim, damageType);
        ch.Act("$N keeps your {0} at bay as they spin away.", victim, null, null, Character.ActType.ToChar, damageType);

        victim.CheckImprove(skSpin, true, 5);

        return true;
    } // end check spin
    
    static CheckOwaza(ch, victim)
    {
        var skill = SkillSpell.SkillLookup("owaza");

        if (ch.Fighting == victim && ch.IsAffected(skill))
        {
            var affect = ch.FindAffect(skill);
            ch.AffectFromChar(affect, AffectData.AffectRemoveReason.Other);

            if (Combat.DoAssassinKotegaeshi(ch, victim))
            {
                if (ch.Fighting == victim && Combat.DoAssassinKansetsuwaza(ch, victim))
                    if (ch.Fighting == victim) Combat.AssassinThrow(ch, victim);
            }
        }
    }
    
    static DoAssassinKotegaeshi(ch, victim)
    {
        var dam_each = 
        [
            0,
            4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
            30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
            58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
            65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
            73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
            90,110,120,150,170,200,230,500,500,500
        ];
        var skill = SkillSpell.SkillLookup("kotegaeshi");
        var chance;
        if ((chance = ch.GetSkillPercentage(skill)) <= 1)
        {
            ch.send("You don't know how to do that.\n\r");
            return false;
        }

        var dam;
        var level = ch.Level;


        //chance += level / 10;

        if (chance > Utility.NumberPercent())
        {
            if (ch.IsNPC)
                level = Math.min(level, 51);
            level = Math.min(level, dam_each.length - 1);
            level = Math.max(0, level);

            dam = Utility.Random(dam_each[level], dam_each[level] * 2);

            ch.Act("$n breaks $N's wrist with $s kotegaeshi.", victim, null, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n breaks your wrist with $s kotegaeshi!", victim, null, null, Character.ActType.ToVictim);
            ch.Act("You break $N's wrist with your kotegaeshi.", victim, null, null, Character.ActType.ToChar);
            ch.CheckImprove(skill, true, 1);

            Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);
            if (!victim.IsAffected(skill))
            {
                var affect = new AffectData();
                affect.SkillSpell = skill;
                affect.DisplayName = skill.Name;
                affect.Duration = 5;
                affect.Where = AffectData.AffectWhere.ToAffects;
                affect.Location = AffectData.ApplyTypes.Strength;
                affect.Modifier = -5;
                affect.EndMessage = "Your wrist feels better.";
                affect.EndMessageToRoom = "$n's wrist looks better.";
                victim.AffectToChar(affect);
            }
            return true;
        }
        else
        {
            ch.Act("$n attempts to break $N's wrists with $s kotegaeshi.", victim, null, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n attempts to break your wrist with $s kotegaeshi!", victim, null, null, Character.ActType.ToVictim);
            ch.Act("You attempt to break $N's wrist with your kotegaeshi.", victim, null, null, Character.ActType.ToChar);

            ch.CheckImprove(skill, false, 1);
            Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
        }
        return false;
    }

    static DoKansetsuwaza(ch, args)
    {
        var victim = null;

        if (args.ISEMPTY() && (victim = ch.Fighting) == null)
        {
            ch.send("You aren't fighting anyone.\n\r");
            return;
        }
        else if ((!args.ISEMPTY() && ([victim] = Character.CharacterFunctions.GetCharacterHere(ch, args)) && victim) || (args.ISEMPTY() && !(victim = ch.Fighting)))
        {
            ch.send("You don't see them here.\n\r");
            return;
        }

        var skill = SkillSpell.SkillLookup("kansetsuwaza");
        ch.WaitState(skill.WaitTime);
        Combat.DoAssassinKansetsuwaza(ch, victim);
    }
    static DoAssassinKansetsuwaza(ch, victim)
    {
        var dam_each = 
        [
            0,
            4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
            30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
            58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
            65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
            73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
            90,110,120,150,170,200,230,500,500,500
        ];
        var skill = SkillSpell.SkillLookup("kansetsuwaza");
        var chance;
        if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
        {
            ch.send("You don't know how to do that.\n\r");
            return false;
        }

        var dam;
        var level = ch.Level;

        //chance += level / 10;

        if (chance > Utility.NumberPercent())
        {
            if (ch.IsNPC)
                level = Math.min(level, 51);
            level = Math.min(level, dam_each.length - 1);
            level = Math.max(0, level);

            dam = Utility.Random(dam_each[level], dam_each[level] * 2);

            ch.Act("$n locks $N's elbow with $s kansetsuwaza.", victim, null, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n locks your elbow with $s kansetsuwaza!", victim, null, null, Character.ActType.ToVictim);
            ch.Act("You lock $N's elbow with your kansetsuwaza.", victim, null, null, Character.ActType.ToChar);
            ch.CheckImprove(skill, true, 1);

            Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);

            if (!victim.IsAffected(skill))
            {
                var affect = new AffectData();
                affect.skillSpell = skill;
                affect.displayName = skill.Name;
                affect.duration = 5;
                affect.where = AffectData.AffectWhere.ToAffects;
                affect.location = AffectData.ApplyTypes.Strength;
                affect.modifier = -4;
                victim.AffectToChar(affect);

                affect.location = AffectData.ApplyTypes.Dexterity;
                affect.modifier = -4;
                affect.endMessage = "Your elbow feels better.";
                affect.endMessageToRoom = "$n's elbow looks better.";
                victim.AffectToChar(affect);
            }
            return true;
        }
        else
        {
            ch.Act("$n attempts to lock $N's elbow with $s kansetsuwaza.", victim, null, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n attempts to lock your elbow with $s kansetsuwaza!", victim, null, null, Character.ActType.ToVictim);
            ch.Act("You attempt to lock $N's elbow with your kansetsuwaza.", victim, null, null, Character.ActType.ToChar);

            ch.CheckImprove(skill, false, 1);
            Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
        }
        return false;
    }
    
    static DoThrow(ch, args)
    {
        var victim = null;

        if (args.ISEMPTY() && (victim = ch.Fighting) == null)
        {
            ch.send("You aren't fighting anyone.\n\r");
            return;
        }
        else if ((!args.ISEMPTY() && (victim = ch.GetCharacterFromRoomByName(args)) == null) || (args.ISEMPTY() && (victim = ch.Fighting) == null))
        {
            ch.send("You don't see them here.\n\r");
            return;
        }
        // else if (Combat.CheckAcrobatics(ch, victim)) return;

        var skill = SkillSpell.SkillLookup("throw");
        ch.WaitState(skill.WaitTime);
        Combat.AssassinThrow(ch, victim);
    }

    static AssassinThrow(ch, victim)
    {
        var dam_each = 
        [
            0,
            4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
            30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
            58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
            65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
            73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
            90,110,120,150,170,200,230,500,500,500
        ];
        var skill = SkillSpell.SkillLookup("throw");
        var chance;
        if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
        {
            ch.send("You don't know how to do that.\n\r");
            return false;
        }

        var dam;
        var level = ch.Level;

        //chance += level / 10;

        if (chance > Utility.NumberPercent())
        {
            if (ch.IsNPC)
                level = Math.min(level, 51);
            level = Math.min(level, dam_each.length - 1);
            level = Math.max(0, level);

            dam = Utility.Random(dam_each[level], dam_each[level] * 2);

            ch.Act("$n throws $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n throws you!", victim, null, null, Character.ActType.ToVictim);
            ch.Act("You throw $N.", victim, null, null, Character.ActType.ToChar);
            ch.CheckImprove(skill, true, 1);

            Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);
            victim.WaitState(Game.PULSE_PER_VIOLENCE);
            Combat.CheckGroundControlRoom(victim);
            Combat.CheckCheapShotRoom(victim);
            return true;
        }
        else
        {
            ch.Act("$n attempts to throw $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n tries to throw you!", victim, null, null, Character.ActType.ToVictim);
            ch.Act("You try to throw $N.", victim, null, null, Character.ActType.ToChar);

            ch.CheckImprove(skill, false, 1);
            Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
        }
        return false;
    }

    static CheckGroundControlRoom(victim)
    {
        if (victim.Room && victim.Position == "Fighting")
            for (var other of Utility.CloneArray(victim.Room.Characters))
            {
                if (other.Fighting == victim)
                {
                    Combat.CheckGroundControl(other, victim);
                }
            }
    }

    static CheckCheapShot(ch, victim)
    {
        var dam_each = 
        [
            0,
            4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
            30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
            58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
            65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
            73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
            90,110,120,150,170,200,230,500,500,500
        ];
        var skill = SkillSpell.SkillLookup("cheap shot");
        var chance;
        if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
        {
            return;
        }

        var dam;
        var level = ch.Level;

        if (ch.Room != victim.Room || victim.Position != "Fighting")
            return;
        //chance += level / 10;

        if (chance > Utility.NumberPercent())
        {
            if (ch.IsNPC)
            {
                level = Math.min(level, 51);
            }
            level = Math.min(level, dam_each.length - 1);
            level = Math.max(0, level);

            dam = Utility.Random(dam_each[level], dam_each[level] * 2);

            ch.Act("Seizing upon $N's moment of weakness, you brutally kick $M while $E's down!", victim, null, null, Character.ActType.ToChar);
            ch.Act("Seizing upon your moment of weakness, $n brutally kicks you while you're down!", victim, null, null, Character.ActType.ToVictim);
            ch.Act("Seizing upon $N's moment of weakness, $n brutally kicks $M while $E's down!", victim, null, null, Character.ActType.ToRoomNotVictim);

            if (Utility.NumberPercent() < 26)
            {
                ch.Act("$N grunts in pain as you land a particularly vicious kick!", victim, null, null, Character.ActType.ToChar);
                ch.Act("You grunt in pain as $n lands a particularly vicious kick!", victim, null, null, Character.ActType.ToVictim);
                ch.Act("$N grunts in pain as $n lands a particularly vicious kick!", victim, null, null, Character.ActType.ToRoomNotVictim);
                dam = dam * 2;
                victim.WaitState(Game.PULSE_PER_VIOLENCE);
            }
            victim.WaitState(Game.PULSE_PER_VIOLENCE);
            ch.CheckImprove(skill, true, 1);
            Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);
        }
        else
        {
            ch.send("You were unable to get a cheap shot in.\n\r");
            ch.CheckImprove(skill, false, 1);
            return;
        }
    }
    
    static CheckCheapShotRoom(victim)
    {
        if (victim.Room != null && victim.Position == "Fighting")
            for (var other of Utility.CloneArray(victim.Room.Characters))
            {
                if (other.Fighting == victim)
                {
                    Combat.CheckCheapShot(other, victim);
                }
            }
    }

    static CheckGroundControl(ch, victim)
    {
        var dam_each =
        [
            0,
            4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
            30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
            58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
            65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
            73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
            90,110,120,150,170,200,230,500,500,500
        ];
        var skill = SkillSpell.SkillLookup("ground control");
        var chance;
        if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
        {
            return;
        }

        var dam;
        var level = ch.Level;

        if (ch.Room != victim.Room || victim.Position != "Fighting")
            return;
        //chance += level / 10;

        if (chance > Utility.NumberPercent())
        {
            if (ch.IsNPC)
                level = Math.min(level, 51);
            level = Math.min(level, dam_each.length - 1);
            level = Math.max(0, level);

            dam = Utility.Random(dam_each[level], dam_each[level] * 2);

            ch.Act("$n manipulates $N while they are on the ground.", victim, null, null, Character.ActType.ToRoomNotVictim);
            ch.Act("$n manipulates you while you are on the ground!", victim, null, null, Character.ActType.ToVictim);
            ch.Act("You manipulate $N while they are on the ground.", victim, null, null, Character.ActType.ToChar);
            ch.CheckImprove(skill, true, 1);

            Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);
        }
    }

    static DoKotegaeshi(ch, args)
    {
        var victim = null;

        if (args.ISEMPTY() && !(victim = ch.Fighting))
        {
            ch.send("You aren't fighting anyone.\n\r");
            return;
        }
        else if ((!args.ISEMPTY() && ([victim] = Character.CharacterFunctions.GetCharacterHere(ch, args)) && !victim) || (args.ISEMPTY() && !(victim = ch.Fighting)))
        {
            ch.send("You don't see them here.\n\r");
            return;
        }
        var skill = SkillSpell.SkillLookup("kotegaeshi");
        ch.WaitState(skill.WaitTime);
        Combat.DoAssassinKotegaeshi(ch, victim);
    }
}

module.exports = Combat;