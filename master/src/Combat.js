const Character = require("./Character");
const Utility = require("./Utility");
const DamageMessage = require("./DamageMessage");
const SkillSpell = require("./SkillSpell");
const RoomData = require("./RoomData");

class Combat {
    static DoKill(character, args) {
        if(character.Fighting) {
            character.send("You are already fighting.\n\r");
        }
        else {
            var victim = Character.CharacterFunctions.GetCharacterHere(character, args);
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

            Combat.ShowDamageMessage(character, victim, damage, damagenoun, damagetype, false);
            
            victim.HitPoints -= damage;
            if(victim.HitPoints < -15) {
                victim.Position = "Dead";
                character.Act("$N has been killed!", victim, null, null, "ToRoomNotVictim");
                character.Act("You have been killed!", victim, null, null, "ToVictim");
                character.Act("$N is DEAD!", victim, null, null, "ToChar");
                
                for(var other of victim.Room.Characters) {
                    if(other.Fighting == victim) {
                        other.Fighting = null;
                        character.Position = "Standing";
                    }
                }
                victim.Fighting = null;
            }
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
                                other.Fighting == fightingme
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
}

module.exports = Combat;