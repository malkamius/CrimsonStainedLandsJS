const AreaData = require("./AreaData");
const Character = require("./Character");

const Combat = require("./Combat");
const DamageMessage = require("./DamageMessage");
const ItemTemplateData = require("./ItemTemplateData");
const NPCData = require("./NPCData");

const RoomData = require("./RoomData");
const SkillSpell = require("./SkillSpell");
const Utility = require("./Utility");

Character.DoCommands.DoPeace = function(character, args) {
    for(var fighting of character.Room.Characters) {
        if(fighting.Position == "Fighting" || fighting.Fighting) {
            fighting.Position = "Standing";
            fighting.Fighting = null;
            fighting.Act("A wave of calm overcomes you.", null, null, null, "ToChar");
            fighting.Act("A wave of calm overcomes $n.", null, null, null, "ToRoom");
        }
    }
    character.send("Ok.\n\r");
}

Character.DoCommands.DoSlay = function(character, args) {
    var [victim, count] = character.GetCharacterHere(args, 0);

    if(victim) {
        character.Act("$n SLAYS $N!", victim, null, null, "ToRoomNotVictim");
        character.Act("$n SLAYS you!", victim, null, null, "ToVictim");
        character.Act("You SLAY $N!", victim, null, null, "ToChar");
        victim.HitPoints = -15;
        Combat.CheckIsDead(character, victim, victim.MaxHitPoints + 15);
    } else {
        character.send("You don't see them here.\n\r");
    }
}

Character.DoCommands.DoResetAreas = function(character, args) {
    AreaData.ResetAreas(true);
    character.send("OK.\n\r");
}

Character.DoCommands.DoGoto = function(ch, args)
{
    var vnum = Number(args);
    var target;
    var room;
	if(!vnum) {
        [target] = ch.GetCharacterWorld(args);
        if(target && target.Room) {
            room = target.Room;
        } else {
            ch.send("Target not found.\n\r");
            return;
        }
    }
    else
        room = RoomData.Rooms[vnum];

    
	if (room)
	{
		// If a valid recall room is found, perform the recall action

		// Display a message to the room indicating the character's prayer
		ch.Act(ch.PoofOut, null, null, null, {type: Character.ActType.ToRoom, flags: {WizInvis: "WizInvis"}});

		// Remove the character from the current room
		ch.RemoveCharacterFromRoom();

		// Send a message to the character indicating the successful recall
		ch.send("You goto {0} [{1}].\n\r", room.Name, room.VNum);

		// Add the character to the recall room
		ch.AddCharacterToRoom(room);
		
		// Display a message to the room indicating the character's arrival
		ch.Act(ch.PoofIn, null, null, null, {type: Character.ActType.ToRoom, flags: {WizInvis: "WizInvis"}});

		// Update the character's view with the newly arrived room
		//DoLook(ch, "auto");
	} else {
		// If the recall room is not found, send an error message to the character
		ch.send("Room not found.\n\r");
	}
}

Character.DoCommands.DoTransfer = function(ch, args)
{
    var target;
	
    [target] = ch.GetCharacterWorld(args);
       
    if(target) {
        target.Act("You transfer $n.\n\r", ch, null, null, Character.ActType.ToVictim);
        target.Act("$n vanishes.\n\r", ch, null, null, Character.ActType.ToRoomNotVictim);
        target.RemoveCharacterFromRoom();
        target.AddCharacterToRoom(ch.Room);
        target.Act("$n pops in out of nowhere.\n\r", ch, null, null, Character.ActType.ToRoomNotVictim);
        target.Act("$N has transfered you.\n\r", ch);
    } else {
		ch.send("Target not found.\n\r");
	}
}

Character.DoCommands.DoRestore = function(character, args) {
    var target;
    if(Utility.IsNullOrEmpty(args)) {
        character.send("You restore the room.\n\r");

        for(var player of character.Room.Characters) {
            if(!player.IsNPC) {
                player.HitPoints = player.MaxHitPoints
                player.ManaPoints = player.MaxManaPoints;
                player.MovementPoints = player.MaxMovementPoints;
                player.send("You have been restored.\n\r");
            }
        }
    } else if(args.equals("all")) {
        character.send("You restore the world.\n\r");

        for(var player of Character.Characters) {
            if(!player.IsNPC && player.status == "Playing") {
                player.HitPoints = player.MaxHitPoints
                player.ManaPoints = player.MaxManaPoints;
                player.MovementPoints = player.MaxMovementPoints;
                player.send("You have been restored.\n\r");
            }
        }
    } else if(([target] = character.GetCharacterWorld(args)) && target) {
        character.Act("You restored $N.", target);
        target.HitPoints = target.MaxHitPoints
        target.ManaPoints = target.MaxManaPoints;
        target.MovementPoints = target.MaxMovementPoints;
        target.send("You have been restored.\n\r");
    } else {
        character.send("You don't see them.\n\r");
    }
}

Character.DoCommands.DoStripAffects = function(character, args) {
    const AffectData = require('./AffectData');
    var [target] = character.GetCharacterWorld(args);
    if(Utility.IsNullOrEmpty(args)) {
        character.send("Stripaffects who?\n\r");
    } else if(target) {
        character.Act("You strip the affects of $N.", target);
        for(var aff of Utility.CloneArray(target.Affects)) {
            target.AffectFromChar(aff, AffectData.AffectRemoveReason.Stripped)
        }
        target.send("You have been stripped of affects.\n\r");
    } else {
        character.send("You don't see them.\n\r");
    }
}

Character.DoCommands.DoLoad = function(character, args) {
    var isitem = false;
    var type = "";
    [type, args] = args.OneArgument();
    isitem = !("mob".prefix(type) || "npc".prefix(type))
    var vnum = Number(args);
    if(Utility.IsNullOrEmpty(type) || (!"mob".prefix(type) && !"npc".prefix(type) && !"item".prefix(type) && !"object".prefix(type))) {
        character.send("Load NPC or Item?\n\r");
    } else if(Utility.IsNullOrEmpty(args) || !vnum) {
        target.send("Load which vnum?\n\r");
    } else {
        if(isitem) {
            const ItemData = require("./ItemData");
            var template = ItemTemplateData.ItemTemplates[vnum];
            if(template) {
                var item = new ItemData(template);

                if(item.WearFlags.ISSET(ItemData.WearFlags.Take)) {
                    character.Inventory.unshift(item);
                    item.CarriedBy = character;
                    character.Act("$p appears in your hands.", null, item, null, Character.ActType.ToChar);
                } else {
                    character.Room.Items.unshift(item);
                    item.Room = character.Room;
                    character.Act("$p appears in the room.", null, item, null, Character.ActType.ToChar);
                    character.Act("$p appears in front of you.", null, item, null, Character.ActType.ToRoom);
                }
            } else {
                character.send("Couldn't find item template of that vnum.\n\r");
            }
        } else {
            const NPCTemplateData = require("./NPCTemplateData");
            var template = NPCTemplateData.NPCTemplates[vnum];

            if(template) {
                var npc = new NPCData(template, character.Room);
                npc.Act("$n fizzles into existence.", null, null, null, Character.ActType.ToRoom);
            } else {
                ch.send("Coudln't find NPC template of that vnum.\n\r");
            }
        }
        
    }
}

Character.DoCommands.DoStat = function(character, args) {
    const PhysicalStats = require("./PhysicalStats");
    var command = "";
    var vnum = 0;
    var count = 0;
    var room;
    var item;

    if (Utility.IsNullOrEmpty(args))
    {
        args = "room";
    }

    [command, args] = args.OneArgument();

    if ("room".prefix(command))
    {
        vnum = Number(args);

        if (!vnum)
        {
            vnum = character.Room.Vnum;
        }

        if (!(room = RoomData.Rooms[vnum]))
        {
            character.send("Room not found.\n\r");
        }
        else
        {
            character.send("Room details for {0}\n\r", room.VNum);

            character.send("Name: {0}\n\r", room.Name);
            character.send("Description: {0}\n\r", room.Description);
            character.send("Exits:\n\r");
            for (var exit of room.OriginalExits) {
                if (exit) {
                    character.send("\tDirection {0} Vnum {1} Name {2} Flags {3} Keys {4}\n\r", exit.Direction, exit.Destination != null ? exit.Destination.VNum  : exit.DestinationVNum, exit.Destination ? exit.Destination.Name : "", Utility.JoinFlags(exit.Flags), Utility.JoinArray(exit.Keys, null, " "));
                }
            }
        }
    }
    else if ("object".prefix(command) || "item".prefix(command))
    {
        vnum = Number(args);
        if (vnum)
        {
            var itemTemplate = ItemTemplateData.ItemTemplates[vnum];
            if (itemTemplate)
            {
                character.send("Item Template details for {0}\n\r", itemTemplate.VNum);
                character.send("Name {0}\n\r", itemTemplate.Name);
                character.send("Short Description {0}\n\r", itemTemplate.ShortDescription);
                character.send("Long Description {0}\n\r", itemTemplate.LongDescription);
                if (!Utility.IsNullOrEmpty(itemTemplate.NightShortDescription))
                    character.send("Night Short Description {0}\n\r", itemTemplate.NightShortDescription);
                if (!Utility.IsNullOrEmpty(itemTemplate.NightLongDescription))
                    character.send("Night Long Description {0}\n\r", itemTemplate.NightLongDescription);
                character.send("Level {0}\n\r", itemTemplate.Level);
                character.send("Item Types: {0}\n\r", Utility.JoinFlags(itemTemplate.ItemTypes));
                var damagemessage = DamageMessage.GetWeaponDamageMessage(itemTemplate.WeaponDamageType);
                if (damagemessage) {
                    character.send("Weapon Damage Type {0}\n\r", damagemessage.Keyword);
                }

                character.send("Weapon Type {0}\n\r", itemTemplate.WeaponType);

                character.send("Damage Dice {0}d{1}+{2} avg({3})\n\r", itemTemplate.DamageDice[0], itemTemplate.DamageDice[1], itemTemplate.DamageDice[2], Utility.Average(itemTemplate.DamageDice));
                character.send("Weight {0}, Max Weight {1}\n\r", itemTemplate.Weight, itemTemplate.MaxWeight);
                character.send("Cost {0}\n\r", itemTemplate.Value);
                character.send("Nutrition {0}, Charges {1}, Max Charges {2}\n\r", itemTemplate.Nutrition, itemTemplate.Charges, itemTemplate.MaxCharges);
                character.send("Material {0}, Liquid {1}\n\r", itemTemplate.Material, itemTemplate.Liquid);
                character.send("Armor bash {0}, slash {1}, pierce {2}, magic {3}\n\r", itemTemplate.ArmorBash, itemTemplate.ArmorSlash, itemTemplate.ArmorPierce, itemTemplate.ArmorExotic);
                character.send("Wear Flags: {0}\n\r", Utility.JoinFlags(itemTemplate.WearFlags));
                character.send("Extra Flags: {0}\n\r", Utility.JoinFlags(itemTemplate.ExtraFlags));

                var affects = "";
                for(var affect of itemTemplate.Affects) {
                    affects += "\t" + affect.Where + " - " + affect.Location + " " + affect.Modifier + " - " + Utility.JoinFlags(affect.Flags) + " - " + affect.Duration + "\n";
                }

                character.send("Affects: \n   {0}\n\r", affects);

            }
            else
            {
                character.send("Item Template with that vnum not found.\n\r");
            }
        }
        else
        {
            [item] = character.GetItemHere(args);

            if (item == null)
            {
                character.send("You don't see that here.\n\r");
            }
            else
            {
                character.send("Item details for {0}\n\r", item.Vnum);
                character.send("Name {0}\n\r", item.Name);
                character.send("Short Description {0}\n\r", item.ShortDescription);
                character.send("Long Description {0}\n\r", item.LongDescription);
                character.send("Level {0}\n\r", item.Level);
                character.send("Item Types: {0}\n\r", Utility.JoinFlags(item.ItemTypes));

                var damagemessage = DamageMessage.GetWeaponDamageMessage(item.WeaponDamageType);
                if (damagemessage) {
                    character.send("Weapon Damage Type {0}\n\r", damagemessage.Keyword);
                }

                character.send("Weapon Type {0}\n\r", item.WeaponType);

                character.send("Damage Dice {0}d{1}+{2} avg({3})\n\r", item.DamageDice[0], item.DamageDice[1], item.DamageDice[2], Utility.Average(item.DamageDice));
                character.send("Weight {0}, Max Weight {1}\n\r", item.Weight, item.MaxWeight);
                character.send("Cost {0}\n\r", item.Value);
                character.send("Timer {0}\n\r", item.Timer);
                character.send("Nutrition {0}, Charges {1}, Max Charges {2}\n\r", item.Nutrition, item.Charges, item.MaxCharges);
                character.send("Material {0}, Liquid {1}\n\r", item.Material, item.Liquid);
                character.send("Armor bash {0}, slash {1}, pierce {2}, magic {3}\n\r", item.ArmorBash, item.ArmorSlash, item.ArmorPierce, item.ArmorExotic);
                character.send("Wear Flags: {0}\n\r", Utility.JoinFlags(item.WearFlags));
                character.send("Extra Flags: {0}\n\r", Utility.JoinFlags(item.ExtraFlags));

                var affects = "";
                for(var affect of item.Affects) {
                    affects += "\t" + affect.Where + " - " + affect.Location + " " + affect.Modifier + " - " + Utility.JoinFlags(affect.Flags) + " - " + affect.Duration + "\n";
                }

                character.send("Affects: \n   {0}\n\r", affects);
            }
        }

    } // end stat item
    else if ("mobile".prefix(command) || "npc".prefix(command) || "character".prefix(command) || (!(args = command + " " + args).ISEMPTY()))
    {
        vnum = Number(args);
        if (vnum)
        {
            const NPCTemplateData = require("./NPCTemplateData");
            var npcTemplate = NPCTemplateData.NPCTemplates[vnum];
            if (npcTemplate)
            {
                character.send("NPC Template details for {0}\n\r", npcTemplate.VNum);
                character.send("Name {0}\n\r", npcTemplate.Name);
                character.send("Short Description {0}\n\r", npcTemplate.ShortDescription);
                character.send("Long Description {0}\n\r", npcTemplate.LongDescription);
                character.send("Level {0}\n\r", npcTemplate.Level);
                character.send("Guild {0}\n\r", npcTemplate.Guild != null? npcTemplate.Guild.name : "none");
                character.send("Gold {0}\n\r", npcTemplate.Gold);
                character.send("Silver {0}\n\r", npcTemplate.Silver);
                character.send("Race {0}\n\r", npcTemplate.Race != null ? npcTemplate.Race.name : "unknown");
                character.send("Hitpoint Dice {0} avg ({1})\n\r", npcTemplate.HitPointDice, Utility.Average(npcTemplate.HitPointDice));
                character.send("Manapoint Dice {0} avg ({1})\n\r", npcTemplate.ManaPointDice, Utility.Average(npcTemplate.ManaPointDice));
                character.send("Damage Dice {0} avg ({1})\n\r", npcTemplate.DamageDice, Utility.Average(npcTemplate.DamageDice));
                character.send("HitRoll {0}, DamageRoll {1}\n\r", npcTemplate.HitRoll, npcTemplate.DamageRoll);
                character.send("Act Flags: {0}\n\r", Utility.JoinFlags(npcTemplate.Flags));
                character.send("AffectedBy Flags: {0}\n\r", Utility.JoinFlags(npcTemplate.AffectedBy));
                character.send("Alignment {0}\n\r", npcTemplate.Alignment);
                character.send("Armor bash {0}, slash {1}, pierce {2}, magic {3}\n\r", npcTemplate.ArmorBash, npcTemplate.ArmorSlash, npcTemplate.ArmorPierce, npcTemplate.ArmorExotic);

                var learned = "";
                for(var skillname in npcTemplate.Learned) {
                    var skill = npcTemplate.Learned[skillname];
                    learned += (learned.length > 0? "\n   " : "") + skill.Name;
                }
                character.send("Skills: {0}\n\r", learned);

                var affects = "";
                for(var affect of npcTemplate.Affects) {
                    affects += "   " + affect.DisplayName + ", " + affect.Where + " - " + affect.Location + " " + affect.Modifier + " - " + Utility.JoinFlags(affect.Flags) + " - " + affect.Duration + "\n";
                }

                character.send("Affects: \n   {0}\n\r", affects);
            }
            else
            {
                character.send("NPC Template with that vnum not found.\n\r");
            }
        }

        else
        {
            args = args;
            var [target, count] = character.GetCharacterHere(args);
            if (!target) [target, count] = character.GetCharacterWorld(args, count);
            if (!target)
            {
                character.send("You don't see them here or they are not an NPC.\n\r");
            }
            else
            {
                var template;
                if(target.IsNPC)  {
                    template = target.Template;
                    character.send("NPC details for {0}\n\r", target.VNum);
                }
                
                character.send("Name {0}\n\r", target.Name);
                character.send("Short Description {0}\n\r", target.ShortDescription);
                character.send("Long Description {0}\n\r", target.LongDescription);
                character.send("Level {0}\n\r", target.Level);
                character.send("Guild {0}\n\r", target.Guild? target.Guild.Name : "none");
                character.send("Gold {0}\n\r", target.Gold);
                character.send("Silver {0}\n\r", target.Silver);
                character.send("Race {0}\n\r", target.Race? target.Race.Name : "unknown");
                if (template)
                {
                    character.send("Hitpoint Dice {0} avg ({1})\n\r", template.HitPointDice, Utility.Average(template.HitPointDice.Average));
                    character.send("Manapoint Dice {0} avg ({1})\n\r", template.ManaPointDice, Utility.Average(template.ManaPointDice.Average));
                    character.send("Damage Dice {0} avg ({1})\n\r", template.DamageDice, Utility.Average(template.DamageDice));
                }
                character.send("Hitpoints {0}/{1}, Mana {2}/{3}, Moves {4}/{5}\n\r", target.HitPoints, target.MaxHitPoints, target.ManaPoints, target.MaxManaPoints, target.MovementPoints, target.MaxMovementPoints);
                character.send("HitRoll {0}, DamageRoll {1}\n\r", target.HitRoll, target.DamageRoll);
                character.send("Act Flags: {0}\n\r", Utility.JoinFlags(target.Flags));
                character.send("AffectedBy Flags: {0}\n\r", Utility.JoinFlags(target.AffectedBy));
                character.send("Alignment {0}\n\r", target.Alignment);
                //var ac = target.GetArmorClass();
                //character.send(`Armor bash {ac.acBash}, slash {ac.acSlash}, pierce {ac.acPierce}, magic {ac.acExotic}\n\r`);
                
                if (target.PermanentStats != null) {
                    character.send("Strength: {0}(+{1}), Wisdom: {2}(+{3}), Intelligence: {4}(+{5}), Dexterity: {6}(+{7}), Constitution: {8}(+{9}), Charisma: {10}(+{11})\n\r",
                        target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Strength), (target.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Strength) >= target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Strength) ? target.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Strength) - target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Strength) : 0),
                        target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Wisdom), (target.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Wisdom) > target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Wisdom) ? target.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Wisdom) - target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Wisdom) : 0),
                        target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Intelligence), (target.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Intelligence) >= target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Intelligence) ? target.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Intelligence) - target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Intelligence) : 0),
                        target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity), (target.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Dexterity) >= target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity) ? target.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Dexterity) - target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity) : 0),
                        target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Constitution), (target.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Constitution) >= target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Constitution) ? target.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Constitution) - target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Constitution) : 0),
                        target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Charisma), (target.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Charisma) >= target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Charisma) ? target.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Charisma) - target.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Charisma) : 0));
                }
                        var learned = "";
                        for(var skillname in target.Learned) {
                            var skill = target.Learned[skillname];
                            learned += (learned.length > 0? "\n   " : "") + skill.Name;
                        }
                        character.send("Skills: {0}\n\r", learned);
        
                        var affects = "";
                        for(var affect of target.Affects) {
                            affects += "   " + affect.DisplayName + ", " + affect.Where + " - " + affect.Location + " " + affect.Modifier + " - " + Utility.JoinFlags(affect.Flags) + " - " + affect.Duration + "\n";
                        }
        
                        character.send("Affects: \n   {0}\n\r", affects);
            }
        }
    }
    else
    {
        character.send("Stat [npc|item|character|room] @name|@vnum.\n\r");
    }
}

Character.DoCommands.DoGrant = function(character, args) {
    var targetname;
    var command;
    [targetname, args] = args.OneArgument();
    [command, args] = args.OneArgument();
    var [target] = character.GetCharacterWorld(targetname);
    var commands = ["level","title","extendedtitle", "extitle", "skill"];
    if(targetname.ISEMPTY() || args.ISEMPTY() || command.ISEMPTY() || !commands.some(s => s.prefix(command))) {
        character.send("grant @playername [level|title|extendedtitle|extitle|skill] arguments")
    } else if(!target) {
        character.send("You couldn't find them.\n\r");
    } else if("level".prefix(command)) {
        var level = Number(args);

        if(!level || level > character.Level || level < 1 || level > 60) {
            character.send("Provide a valid level between 1 and {0}", character.Level);
        } else {
            if(level == target.Level) {
                character.send("They are already level {0}.", level);
            } else if(level < target.Level) {
                target.Level = level;
                target.Save();
                target.send("You have been demoted to level {0}.\n\r", level);
                character.send("You have demoted them to level {0}.\n\r", level)
            } else {
                for(var i = target.Level; i < level - 1; i++) {
                    target.AdvanceLevel(false);
                }
                target.AdvanceLevel(true);
                target.send("You have been promoted to level {0}.\n\r", level);
                character.Act("You have promoted $N to level {0}.\n\r", target, null, null, Character.ActType.ToChar, level);
            }
        }
    } else if("title".prefix(command)) {
        target.Title = args;
        character.send("OK.\n\r");
    } else if("extitle".prefix(command) || "extendedtitle".prefix(command)) {
        target.ExtendedTitle = args;
        character.send("OK.\n\r");
    } else if("skill".prefix(command)) {
        var skillname;
        var percentage;
        [skillname, args] = args.OneArgument();
        var skill = SkillSpell.SkillLookup(skillname, true);
        if(args.ISEMPTY()) {
            percentage = 1;
        } else {
            percentage = Number(args);
        }
        if(skillname.ISEMPTY()) {
            character.send("Grant what skill?\n\r");
        } else if(!skill && !skillname.equals("all")) {
            character.send("Skill not found.\n\r");
        } else if(skillname.equals("all")) {
            for(var skillname in SkillSpell.Skills) {
                skill = SkillSpell.Skills[skillname];
                target.Learned[skill.Name] = {Name: skill.Name, Percent: percentage, Level: target.Level, LearnedAs: {Skill: true, Spell: true, Song: true, Supplication: true}};    
            }
            target.send("You have been granted all skills, spells, supplications and songs.\n\r");
            character.Act("You have granted $N all skills, spells, supplications and songs.", target, null, null, Character.ActType.ToChar);
        } else {
            target.Learned[skill.Name] = {Name: skill.Name, Percent: percentage, Level: target.Level, LearnedAs: {Skill: true, Spell: true, Song: true, Supplication: true}};
            target.send("You have been granted {0}.\n\r", skill.Name);
            character.Act("You have granted $N {0}.", target, null, null, Character.ActType.ToChar, skill.Name);
        }
    }    
} // Do Grant

Character.DoCommands.DoPoofIn = function(character, args) {
    if(!args.ISEMPTY()) {
        character.PoofIn = args;
    }
    character.send("Your PoofIn is `{0}`.\n\r", character.PoofIn);
}

Character.DoCommands.DoPoofOut = function(character, args) {
    if(!args.ISEMPTY()) {
        character.PoofOut = args;
    }
    character.send("Your PoofOut is `{0}`.\n\r", character.PoofOut);
}