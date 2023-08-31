const Character = require("./Character");
const Utility = require("./Utility");
const DamageMessage = require("./DamageMessage");
const SkillSpell = require("./SkillSpell");
const RoomData = require("./RoomData");
const PhysicalStats = require("./PhysicalStats");
const AffectData = require("./AffectData");
const ItemTemplateData = require("./ItemTemplateData");
const ItemData = require("./ItemData");

class Combat {
    static CheckIsSafe(ch, victim) {
        if(!ch || !victim) {
             return true;
        }
        var chduel
        if (((chduel = ch.FindAffect("DuelInProgress")) || ch.Master && (chduel = ch.Master.FindAffect("DuelInProgress"))) && chduel.ownerName == victim.Name) {
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
                if (victim.Position == Positions.Fighting) victim.Position = Positions.Standing;
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

                // if(victim.FindAffect(AffectFlags.DuelInProgress, out var duelaffect) && ch != null && (!ch.IsNPC || (ch.Master != null && !ch.Master.IsNPC)))
                // {
                //     if (ch.Master != null)
                //     {
                //         ch.Master.StripAffect(AffectFlags.DuelInProgress);
                //         if (ch.Master.Fighting == ch)
                //             ch.Master.Fighting = null;
                //     }
                //     else
                //         ch.StripAffect(AffectFlags.DuelInProgress);

                //     if (ch.Fighting == victim)
                //         ch.Fighting = null;
                //     if(victim.Fighting == ch || (ch.Master != null && victim.Fighting == ch.Master))
                //         victim.Fighting = null;

                //     victim.Act("$N stops $mself before finishing off $n.", ch, type: ActType.GlobalNotVictim);
                //     victim.Act("$N stops $mself before finishing you off.", ch, type: ActType.ToChar);
                //     victim.Act("You stop yourself before finishing $n off.", ch, type: ActType.ToVictim);
                //     victim.HitPoints = 20;
                //     victim.Position = Positions.Sitting;
                //     foreach (var aff in victim.AffectsList.ToArray())
                //         victim.AffectFromChar(aff, AffectRemoveReason.Died, true);
                    
                //     return;
                // }

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
            if (ch != null && victim != null && victim.IsNPC)
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
                        Character.ItemFunctions.RemoveEquipment(victim, value, false, true);
                        if (victim.Inventory.indexOf(value) >= 0)
                            victim.Inventory.splice(victim.Inventory.indexOf(value), 1);
                        newCorpse.Contains.push(value);
                        value.CarriedBy = null;
                        value.Container = newCorpse;
                        if (value.ExtraFlags.IsSet("VisDeath"))
                            value.ExtraFlags.RemoveFlag("VisDeath");
                        if (value.ExtraFlags.IsSet("RotDeath"))
                        {
                            value.Timer = 15;
                            value.ExtraFlags.RemoveFlag("RotDeath");
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
                    if (item.ExtraFlags.IsSet("VisDeath"))
                        item.ExtraFlags.RemoveFlag("VisDeath");
                    if (item.ExtraFlags.IsSet("RotDeath"))
                    {
                        item.Timer = 15;
                        item.ExtraFlags.RemoveFlag("RotDeath");
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
            // if (ch != null && victim.IsNPC && ch.Flags.IsSet("AutoSac"))
            //     DoActItem.DoSacrifice(ch, "corpse");

            // Clear killer wait time on kill
            if (ch != null)
                ch.Wait = 0;

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

    static OneHit(character, victim, weapon) {
        var damage = Math.floor(Math.random() * 10);

        var damagemessage = DamageMessage.DamageMessages["punch"];
        var damagetype = "Bash";
        var damagenoun = "punch";

        if(weapon) {
            damage = Utility.Roll(weapon.DamageDice);
            if(damage != 0) damage += character.DamageRoll;
            damagemessage = DamageMessage.DamageMessages[weapon.WeaponDamageType];
        } else {
            if(character.IsNPC && character.DamageDice) {
                if(character.WeaponDamageMessage && DamageMessage.DamageMessages[character.WeaponDamageMessage])
                    damagemessage = DamageMessage.DamageMessages[character.WeaponDamageMessage];
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

    static ExecuteRound = function(character) {
        var numhits = Math.floor(Math.random() * 5);
        var weapon = character.Equipment["Wield"];
        for(var i = 0; i < numhits; i++) {
            if(character.Fighting) {
                Combat.OneHit(character, character.Fighting, weapon)
            }
        }

        numhits = Math.floor(Math.random() * 5);

        if(!character.Equipment["Shield"] &&
            !character.Equipment["Held"]) {
            weapon = character.Equipment["DualWield"];
            for(var i = 0; i < numhits; i++) {
                if(character.Fighting) {
                    Combat.OneHit(character, character.Fighting, weapon)
                }
            }
        }
    };

    static Damage(ch, victim, damage, skill = "attack",
        DamageType = "Bash", ownerName = "", weapon = null,
        show = true, allowflee = true)
    {
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

    static CheckCutoff(character, victim) { 
        return false;
    }

    static CheckPartingBlow(character, victim) {

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
}

module.exports = Combat;