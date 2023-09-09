const FileSystem = require("fs");

const RoomData = require("./RoomData");
const AreaData = require("./AreaData");
const Character = require("./Character");
const Utitlity = require("./Utility");





Character.DoCommands.DoQuit = function(player, args) {
	player.Act("The form of $n slowly fades away!", null, null, null, "ToRoom");
	player.sendnow("Alas, all good things must come to an end.\n\r");
	player.Save();
	player.Dispose();
	player.socket.destroy();
	Player.Players.splice(Player.Players.indexOf(player), 1)
	console.log(`${player.Name} disconnected`)
}

Character.DoCommands.DoHelp = function(player, args, plain = false) {
	
	var helps;
	//var args = oneargument(str);
	if(args.IsNullOrEmpty()) args = "help";
	
	var [oneargument, therest] = args.oneArgument();
	player.StartPaging();
	if(oneargument.equals("list")) {
		var found = false;
		for(var helpkey in AreaData.AllHelps) {
			var help = AreaData.AllHelps[helpkey];
			if(therest.ISEMPTY() || help.VNum.toString().startsWith(therest) || help.Keyword.IsName(therest)) {
				if (help.Level > player.Level) continue;
				player.send("{0,-10} :: {1}\n\r", help.VNum, help.Keyword);
				found = true;
			}
		}
		if(!found) player.send("No help on that.\n\r");
	} else {
		helps = [];
		for(var helpkey in AreaData.AllHelps) {
			var help = AreaData.AllHelps[helpkey];
			if(help.VNum.toString().startsWith(args) || help.Keyword.IsName(args)) {
				helps.push(help);
			}
		}
		
		if(helps.length > 1) {
			for(var help of helps) {
				if (help.Level > player.Level) continue;
				player.send("{0,-10} :: {1}\n\r", help.VNum, help.Keyword);
				found = true;
			}
		} else if(helps.length == 1) {
			var help = helps[0];
				
			if(!plain)
			player.send("--------------------------------------------------------------------------------\n\r");
			player.send((help.Text.startsWith(".")? help.Text.substr(1) : help.Text) + (help.Text.endsWith("\n") || help.Text.endsWith("\r")? "" : "\n\r"));
			if(!plain) {
				player.send("--------------------------------------------------------------------------------\n\r");
				player.send("Last edited on {0} by {1}.\n\r\n\r", help.LastEditedOn, help.LastEditedBy);
			}
			found = true;
	
		} else {
			player.send("No help on that.\n\r");
		}
	}
	player.EndPaging();
}

/**
 * 
 * @param {CharacterData} player 
 * @param {string} args 
 * @param {boolean} auto 
 * @returns 
 */
Character.DoCommands.DoLook = function(player, args, auto) {
	player.StartPaging();
	if(player.Room == null) {
		player.send("You are not in a room.\n\r");
	} else if (!args || args.length == 0 || auto) {
		player.send(`\\c   ${player.Room.Name}\\x\n\r`);
		if(!player.Flags.ISSET(Character.ActFlags.Brief) || !auto) {
			player.send(`${player.Room.Description}\n\r\n\r`);
		} else {
			player.send("\n\r");
		}
		if(player.Flags.ISSET(Character.ActFlags.AutoExit)) {
			Character.DoCommands.DoExits(player, "");
		}
		var items = {};
		for(const item of player.Room.Items){
			var display = item.DisplayFlags(player) + item.DisplayToRoom(player);
			if(items[display])
				items[display]++;
			else
				items[display] = 1;
		}
		for(var key in items)
			player.send("   " + (items[key] > 1? ("[" + items[key] + "] ") : "") + key + "\n\r");
		for(const other of player.Room.Characters) {
			if (other != player && player.CanSee(other))
				player.Act(other.DisplayFlags(player) + other.GetLongDescription(), other, null, null, "ToChar");
		}
		
	} else {
		var [inarg, newargs] = args.oneArgument();
		var lookin = false;
		var isitem = true;
		if("in".prefix(inarg)) {
			args = newargs;
			lookin = true;
		}
		var target, count;

		[target, count] = player.GetCharacterHere(args, count);
		isitem = false;
		
		if(!target || lookin) {
			[target, count] = player.GetItemHere(args, 0);
			isitem = true;
		}
		
		if(target && target instanceof Character)	{
			if(target == player) {
				player.Act("You look at yourself.", target, null, null, "ToChar");
				player.Act("$n looks at $mself.", target, null, null, "ToRoomNotVictim");
				if(target.Form && !Utility.IsNullOrEmpty(target.Form.Description)) {
					player.Act(target.Form.Description.trim(), target);
				} else {
					player.Act(Utility.IsNullOrEmpty(target.Description)? "You see nothing special about yourself." : target.Description, target);
				}
				target.DisplayHealth(player);
				player.Act("You are wearing: ", target);
			}
			else
			{
				player.Act("You look at $N.", target, null, null, "ToChar");
				player.Act("$n looks at $N.", target, null, null, "ToRoomNotVictim");
				player.Act("$n looks at you.", target, null, null, "ToVictim");
				if(target.Form && !Utility.IsNullOrEmpty(target.Form.Description)) {
					player.Act(target.Form.Description.trim(), target);
				} else {
					player.Act(Utility.IsNullOrEmpty(target.Description)? "You see nothing special about $N." : target.Description, target);
				}
				target.DisplayHealth(player);
				player.Act("$N is wearing: ", target);
			}
			var anyitems = false;
			if(!target.Form) {
				for(var slotkey in Character.WearSlots) {
					var slot = Character.WearSlots[slotkey];
					var item = target.Equipment[slotkey];
					if(item) {
						player.send(slot.Slot + item.DisplayFlags(player) + item.Display(player) + "\n\r");
						anyitems = true;
					}
					
				}
			}
			if(!anyitems)
					player.send("   nothing.\n\r");
		} else if(target && target instanceof ItemData) {
			if(lookin && target.ExtraFlags.IsSet(ItemData.ExtraFlags.Closed)) {
				    ch.send("{0} is closed.\n\r", target.Display(ch));
			} else if(lookin && !target.ItemTypes.IsSet("Container")) {
				ch.send("{0} isn't a container.\n\r", target.Display(ch));
				player.EndPaging();
				return;
			} else if(!lookin) {
				player.Act("$n looks at $p.", null, target, null, "ToRoom");
				player.Act("You look at $p.", null, target, null, "ToChar");
				if(!target.Description.IsNullOrEmpty())
				player.send(target.Description + (target.Description.replaceAll("\r", "").endsWith("\n")? "" : "\n"));
			}
			
			if(lookin || target.ItemTypes.IsSet("Container")) {
				var items = {};
				player.Act("$p is holding:", null, target, null, "ToChar");
				for(i = 0; i < target.Contains.length; i++) {
					var item = target.Contains[i];
					var display = item.DisplayFlags(player) + item.Display(player);
					if(items[display])
						items[display]++;
					else
						items[display] = 1;
				}

				if(Object.keys(items) == 0) {
					player.send("   nothing.\n\r");
				} else {
					for(key in items)
						player.send("   " + (items[key] > 1? "[" + items[key] + "]" : "") + key + "\n\r");
				}
			}
		} else if(isitem) {
			player.send("You don't see that here.\n\r");
		} else {
			player.send("You don't see them here.\n\r");
		}
	}
	player.EndPaging();
}

Character.DoCommands.DoExits = function(player, args) {
	var anyexits = false;
	player.send("\\g[Exits");
	if(player.Room) {	
		for(var i = 0; i < 6; i++) {
			if(player.Room.Exits[i] && player.Room.Exits[i].Destination && !player.Room.Exits[i].Flags.Window) {
				if(player.Room.Exits[i].Flags.Closed || player.Room.Exits[i].Flags.Locked) {
					player.send(" [" + RoomData.Directions[i] + "]");
				}
				else {
					player.send(" " + RoomData.Directions[i]);
				}
				anyexits = true;
			}
		}
	}
	if(!anyexits)
		player.send(" none");
	
	player.send("]\\x\n\r");
	
}

Character.DoCommands.DoEquipment = function(player, args) {
	player.send("You are wearing: \n\r");
	var anyitems = false;

	if(!player.Form) {
		for(slot in Character.WearSlots) {
			var wearslot = Character.WearSlots[slot];
			var item = player.Equipment[slot];
			if(item) {
				player.send(wearslot.Slot + " " + item.DisplayFlags(player) + item.Display(player) + "\n\r");
				anyitems = true;
			}
			
		}
	}
	if(!anyitems) player.send("   nothing.\n\r");

}

Character.DoCommands.DoInventory = function(player, args) {
	var items = {};
	player.send("You are carrying:\n\r");
	if(!player.Form) {
		for(i = 0; i < player.Inventory.length; i++) {
			var item = player.Inventory[i];
			var display = item.DisplayFlags(player) + item.Display(player);
			if(items[display])
				items[display]++;
			else
				items[display] = 1;
		}
	}
	if(Object.keys(items) == 0) {
		player.send("   nothing.\n\r");
	} else {
		for(key in items)
			player.send("   " + (items[key] > 1? "[" + items[key] + "]" : "") + key + "\n\r");
	}
}

Character.DoCommands.DoSave = function(player, args) {
	if(player && !player.IsNPC) {
		player.Save();
		player.send("Your character has been saved.\n\r");
	}
}

Character.DoCommands.DoWho = function(ch, args) {
	var whoList = "";
	var playersOnline = 0;
	whoList += "You can see:\n\r";

	for (var connection of Player.Players)
	{
		if (connection.status == "Playing" && connection.socket != null && (!connection.Flags.WizInvis || (ch.Flags.HolyLight && ch.Level >= connection.Level)))
		{
			whoList += Utitlity.Format("[{0,4} {1}] {2}{3}{4}{5}{6}\n\r",
				connection.Level,
				(connection.Guild? connection.Guild.WhoName : "   "),
				connection.IsAFK ? "\\r(AFK)\\x" : "     ",
				//"     ",
				connection == ch ? "*" : " ",
				connection.Name,
				(!Utitlity.IsNullOrEmpty(connection.Title) ? (connection.Title.startsWith(",") ? connection.Title : " " + connection.Title) : ""),
				(!Utitlity.IsNullOrEmpty(connection.ExtendedTitle) ? (!connection.ExtendedTitle.startsWith(",") ? " " : "") + connection.ExtendedTitle : "")
				);
			playersOnline++;
		}
	}
	const Settings = require("./Settings");
	whoList += "Visible players: " + playersOnline + "\n\r";
	whoList += "Max players online at once since last reboot: " + Player.PlayersOnlineAtOnceSinceLastReboot + "\n\r";
	whoList += "Max players online at once ever: " + Settings.PlayersOnlineAtOnceEver + "\n\r";

	//using (new Character.Page(ch))
		ch.send(whoList);
}

Character.DoCommands.DoSkills = function(ch, args) {
	if (!Utitlity.IsNullOrEmpty(args))
	{
		var skills = [];
		for(var skillname in SkillSpell.Skills) {
			if(Utitlity.Prefix(skillname, args) && SkillSpell.Skills[skillname].SkillTypes["Skill"]) {
				skills.push(SkillSpell.Skills[skillname]);
			}
		}

		if (skills.length == 0)
		{
			ch.send("You don't know any skills by that name");
			return;
		}
		else
		{
			for(var skill of skills)
			{
				var percent = ch.GetSkillPercentage(skill.Name);
				var lvl = ch.GetLevelSkillLearnedAt(skill.Name);
				if (ch.Level < lvl)
				{
					ch.send("You haven't learned that skill yet.");
					return;
				}

				ch.send(skill.Name + " " + percent + "%\n\r");
			}
		}
	} else {
		var lastLevel = 0;
		var column = 0;
		var skills = [];
		var text = "";
		for(var skillname in SkillSpell.Skills) {
			if((SkillSpell.Skills[skillname].SkillTypes["Skill"] || SkillSpell.Skills[skillname].SkillTypes["InForm"])
			&& !SkillSpell.Skills[skillname].SpellFun) {
				skills.push(SkillSpell.Skills[skillname]);
			}
		}

		skills.sort((a,b) => ch.GetLevelSkillLearnedAt(a.Name) < ch.GetLevelSkillLearnedAt(b.Name)? -1 : 
							 (ch.GetLevelSkillLearnedAt(a.Name) == ch.GetLevelSkillLearnedAt(b.Name)? 0 : 1));
		
		for(var skill of skills)
		{
			var percent = ch.GetSkillPercentage(skill.Name);
			var lvl = ch.GetLevelSkillLearnedAt(skill.Name);
			if(percent < 1 && lvl <= this.Level) continue;
			if ((lvl < 52 || ch.IsImmortal) || percent > 1)  //if (lvl > 0 || percent > 1 || (ch.Level > lvl && lvl > 0))
			{
				if (lvl != lastLevel)
				{
					lastLevel = lvl;
					column = 0;
					text += "\n\r";
					text += ("Lvl " + lvl + ": ").padEnd(8);
					text += "\n\r";
				}

				text += ("    " + (skill.Name + " " + (ch.Level >= lvl || percent > 1 ? percent + "%" : "N/A")).padStart(30).padEnd(35));

				if (column == 1)
				{
					text += "\n\r";
					column = 0;
				}
				else
					column++;
			}
		}
		ch.send(text + "\n\r");
	}
}

function ShowSpells(ch, args, type = "Spell") {
	var typename = type == "Spell"? "spell" : type == "Supplication"? "supplication" : "song";
	if (!Utitlity.IsNullOrEmpty(args))
	{
		var skills = [];
		for(var skillname in SkillSpell.Skills) {
			if(Utitlity.Prefix(skillname, args) && SkillSpell.Skills[skillname].SkillTypes.ISSET(type)) {
				skills.push(SkillSpell.Skills[skillname]);
			}
		}

		skills.sort((a,b) => ch.GetLevelSkillLearnedAt(a.Name) < ch.GetLevelSkillLearnedAt(b.Name)? -1 : 
		(ch.GetLevelSkillLearnedAt(a.Name) == ch.GetLevelSkillLearnedAt(b.Name)? 0 : 1));

		if (skills.length == 0)
		{
			ch.send("You don't know any {0}s by that name", typename);
			return;
		}
		else
		{
			for(var skill of skills)
			{
				var percent = ch.GetSkillPercentage(skill.Name);
				var lvl = ch.GetLevelSkillLearnedAt(skill.Name);
				if (ch.Level < lvl)
				{
					ch.send("You haven't learned that {0} yet.", typename);
					return;
				}

				ch.send(skill.Name + " " + percent + "%" + " " + Math.ceil(skill.GetManaCost(ch)).toString().padStart(3) + " mana" + "\n\r");
			}
		}
	} else {
		var lastLevel = 0;
		var column = 0;
		var skills = [];
		var text = "";
		for(var skillname in SkillSpell.Skills) {
			if(SkillSpell.Skills[skillname].SkillTypes.ISSET(type)) {
				if(ch.Learned && ch.Learned[skillname] && !ch.Learned[skillname].LearnedAs.ISSET(type))
				continue;
				skills.push(SkillSpell.Skills[skillname]);
			}
		}

		skills.sort((a,b) => ch.GetLevelSkillLearnedAt(a.Name) < ch.GetLevelSkillLearnedAt(b.Name)? -1 : 
							 (ch.GetLevelSkillLearnedAt(a.Name) == ch.GetLevelSkillLearnedAt(b.Name)? 0 : 1));
		
		var anyskills = false;
		for(var skill of skills)
		{
			var percent = ch.GetSkillPercentage(skill.Name);
			var lvl = ch.GetLevelSkillLearnedAt(skill.Name);

			if ((lvl < 52 || ch.IsImmortal) || percent > 1)  //if (lvl > 0 || percent > 1 || (ch.Level > lvl && lvl > 0))
			{
				if (lvl != lastLevel)
				{
					lastLevel = lvl;
					column = 0;
					text += "\n\r";
					text += ("Lvl " + lvl + ": ").padEnd(8);
					text += "\n\r";
				}
				anyskills = true;
				text += ("    " + (skill.Name + " " + (ch.Level >= lvl || percent > 1 ? percent + "%" : "N/A") + " " + Math.ceil(skill.GetManaCost(ch)).toString().padStart(3) + " mana").padStart(30).padEnd(35));

				if (column == 1)
				{
					text += "\n\r";
					column = 0;
				}
				else
					column++;
			}
		}
		if(!anyskills) {
			ch.send("You don't know any {0}.\n\r", typename == "song"? "songs" : typename == "spell" ? "spells" : typename == "supplication"? "supplications" : "powers" );
			return;
		}

		ch.send(text + "\n\r");
	}
}

Character.DoCommands.DoSpells = function(ch, args) {
	ShowSpells(ch, args, "Spell");
}

Character.DoCommands.DoSupplications = function(ch, args) {
	ShowSpells(ch, args, "Supplication");
}

Character.DoCommands.DoSongs = function(ch, args) {
	ShowSpells(ch, args, "Song");
}

Character.DoCommands.DoDelete = function(character, args) {
	if(!character.Flags["ConfirmDelete"]) {
		character.Flags["ConfirmDelete"] = true;
		character.send("Type `delete yes` to delete your character.\n\rThis process is irreversible.\n\r")
	} else if(Utility.Compare(args, "yes")) {
		character.Act("The form of $n explodes!", null, null, null, "ToRoom");
		character.sendnow("Alas, all good things must come to an end.\n\r");
		character.Dispose();
		character.socket.destroy();
		Player.Players.splice(Player.Players.indexOf(character), 1)
		console.log(`${character.Name} disconnected`)
		const Settings = require("./Settings");
		path = Settings.PlayerDataPath + `/${character.Name}.xml`;
		FileSystem.unlinkSync(path);
	} else {
		character.send("Character deletion cancelled.\n\r");
		delete character.Flags["ConfirmDelete"];
	}
}

Character.DoCommands.DoWhere = function(character, args) {
	var count = 0;
	var desiredcount;
	var playersonly = args.IsNullOrEmpty();
	var playercount = 0;
	[desiredcount, args] = args.numberArgument();
	if(playersonly) {
		character.send("Players near you:\n\r");
	}
	for(var other of Character.Characters) {
		if(!other.Room) continue;
		if(other.Room.Area == character.Room.Area && !other.IsNPC && playersonly) {
			playercount++;
			character.send("{0}    {1,20}     {2}\n\r", (other == character? "*" : " "), other.Display(character), other.Room.Name);
		} else if(other.Room.Area == character.Room.Area && other.Name.IsName(args) && ++count >= desiredcount) {
			playercount++;
			character.send("{0}   {1,20}     {2}\n\r", (other == character? "*" : " "), other.Display(character), other.Room.Name);
			if(desiredcount) break;
		}
	}

	if(playersonly && playercount == 0) {
		character.send("    {0}\n\r", "None");
	} else if(playersonly) {
		character.send("{0} players found\n\r", playercount);
	} else if(!playersonly && playercount == 0) {
		character.send("You didn't find them.\n\r");
	}
}

Character.DoCommands.DoStand = function(ch, args) {
	if(ch.Position == "Sleeping") {
		ch.Act("$n wakes and stands up.", null, null, null, "ToRoom");
		ch.Act("You wake and stands up.", null, null, null, "ToChar");
		ch.Position = "Standing";
	} else if(ch.Position == "Resting" || ch.Position == "Sitting") {
		ch.Act("$n stands up.", null, null, null, "ToRoom");
		ch.Act("You stand up.", null, null, null, "ToChar");
		ch.Position = "Standing";
	} else if(ch.Position == "Fighting" || ch.Position == "Standing") {
		ch.send("You're already standing.\n\r");
	}
}

Character.DoCommands.DoSit = function(ch, args) {
	if(ch.Position == "Sleeping") {
		ch.Act("$n wakes and sits up.", null, null, null, "ToRoom");
		ch.Act("You wake and sits up.", null, null, null, "ToChar");
		ch.Position = "Sitting";
	} else if(ch.Position == "Resting" || ch.Position == "Standing") {
		ch.Act("$n begins sitting.", null, null, null, "ToRoom");
		ch.Act("You begin sitting.", null, null, null, "ToChar");
		ch.Position = "Sitting";
	} else if(ch.Position == "Fighting") {
		ch.send("No way! You are still fighting!\n\r");
	} else if(ch.Position == "Sitting") {
		ch.send("You're already sitting.\n\r");
	}
}

Character.DoCommands.DoRest = function(ch, args) {
	if(ch.Position == "Sleeping") {
		ch.Act("$n wakes and begins resting.", null, null, null, "ToRoom");
		ch.Act("You wake and begin resting.", null, null, null, "ToChar");
		ch.Position = "Resting";
	} else if(ch.Position == "Sitting" || ch.Position == "Standing") {
		ch.Act("$n begins resting.", null, null, null, "ToRoom");
		ch.Act("You begin resting.", null, null, null, "ToChar");
		ch.Position = "Resting";
	} else if(ch.Position == "Fighting") {
		ch.send("No way! You are still fighting!\n\r");
	} else if(ch.Position == "Resting") {
		ch.send("You're already resting.\n\r");
	}
}

Character.DoCommands.DoSleep = function(ch, args) {
	if(ch.Position == "Standing" || ch.Position == "Resting" || ch.Position == "Sitting") {
		ch.Act("$n lays down and goes to sleep.", null, null, null, "ToRoom");
		ch.Act("You lay down and go to sleep.", null, null, null, "ToChar");
		ch.Position = "Sleeping";
	} else if(ch.Position == "Fighting") {
		ch.send("No way! You are still fighting!\n\r");
	} else if(ch.Position == "Sleeping") {
		ch.send("You're already sleeping.\n\r");
	}
}

Character.DoCommands.DoWake = function(ch, args) {
	const AffectData = require('./AffectData');
	var victim = ch;

	if(!Utility.ISEMPTY(args)) {
		[victim] = ch.GetCharacterHere(args);
	}

	if(victim != ch && ch.Position == "Sleeping") {
		this.send("In your dreams or what?\n\r");
	} else if(victim.Position == "Sleeping") {
		if(victim.IsAffected(AffectData.AffectFlags.Sleep)) {
			if(victim == ch) {
				ch.Act("You try but can't wake yourself up.");
			} else {
				ch.Act("You try, but you can't wake $N.", victim);
			}
		}
		if(victim == ch) { 
			ch.Act("$n wakes and stands up.", null, null, null, "ToRoom");
			ch.Act("You wake and stand up.", null, null, null, "ToChar");
		} else {
			ch.Act("$n wakes $N up.", victim, null, null, "ToRoomNotVictim");
			ch.Act("$n wakes you up.", victim, null, null, "ToVictim");
			ch.Act("You wake $N up.", victim, null, null, "ToChar");
		}
		ch.Position = "Standing";
	} else {
		if(victim == ch) {
			ch.send("You're already awake.\n\r"); 
		} else {
			ch.Act("$N is already awake.", victim);
		}
	}
}

Character.DoCommands.DoAffects = function(ch, args) {
	var any = false;
	ch.send("You are affected by:\n\r");
	for(var affect of ch.Affects) {
		if(!affect.Hidden) {
			any = true;
			if (affect.Modifier != 0) {
				ch.send("{0,25} {1,-15} {2,-5} for {3} {4}.\n\r", 
				(affect.DisplayName && affect.SkillSpell? affect.SkillSpell.Name : affect.DisplayName) + ":", 
				affect.Location, 
				((affect.Modifier > 0 ? "+" : " ") + Math.ceil(affect.Modifier)),
				 Math.ceil(affect.Duration), (affect.Frequency == "Tick" ? "hours" : "rounds"));
			}
			else {
				ch.send("{0,47} for {1} {2}.\n\r", 
				(affect.DisplayName.ISEMPTY() && affect.SkillSpell? affect.SkillSpell.Name : affect.DisplayName) + ":", 
				Math.ceil(affect.Duration), (affect.Frequency == "Tick" ? "hours" : "rounds"));
			}
		}
	}
	if(!any)
		ch.send("    nothing.\n\r");
}
Character.DoCommands.DoToggle = function(ch, args)
{
	var flags = [
		"AFK",
		"AutoAssist",
		"AutoSac",
		"AutoLoot",
		"AutoExit",
		"AutoGold",
		"AutoSplit",
		"Color",
		"Brief",
		"NoSummon",
		"NoFollow",
		"NewbieChannel",
		"WizInvis",
		"HolyLight"
	];
	if (args.IsNullOrEmpty())
	{
		for(var flag of flags)
		{
			if ((flag == "HolyLight" || flag == "WizInvis") && !ch.IsImmortal) continue;
			ch.send("{0,-20}: {1}\\x\n\r", flag, ch.Flags.IsSet(flag) ? "\\gON" : "\\rOFF");
		}
	}
	else
	{
		for (var flag of flags)
		{
			if ((flag == "HolyLight" || flag == "WizInvis") && !ch.IsImmortal) continue;

			if (flag.prefix(args))
			{
				if (ch.Flags.IsSet(flag))
				{
					ch.Flags.RemoveFlag(flag);
				}
				else
					ch.Flags[flag] = true;

				ch.send("{0,-20}: {1}\\x\n\r", flag, ch.Flags.IsSet(flag) ? "\\gON" : "\\rOFF");
				return;
			}
		}
		ch.send("Flag not found.\n\r");
	}
}

Character.DoCommands.DoTime = function(ch, args) {
	const TimeInfo = require("./TimeInfo");
	const Game = require("./Game");
	const TimeSpan = require("./TimeSpan");
	var suf;
	var day = Math.ceil(TimeInfo.Day) + 1;

	if (day > 4 && day < 20) suf = "th";
	else if (day % 10 == 1) suf = "st";
	else if (day % 10 == 2) suf = "nd";
	else if (day % 10 == 3) suf = "rd";
	else suf = "th";

	ch.send("It is {0} o'clock {1}, Day of {2}, {3}{4} of the Month of {5}.\n\r",
		(TimeInfo.Hour % 12 == 0) ? 12 : TimeInfo.Hour % 12,
		TimeInfo.Hour >= 12 ? "pm" : "am",
		TimeInfo.DayName,
		day, suf,
		TimeInfo.MonthName);

	var runningtime = new TimeSpan(new Date() - Game.GameStarted);

	ch.send("Server started at {0}.\n\rThe system time is {1}.\n\rGame has been running for {2} days, {3} hours and {4} minutes.\n\r",
		Game.GameStarted.toString(), new Date().toString(), runningtime.days, runningtime.hours, runningtime.minutes);

	// if (ch is Player)
	// {
	// 	var player = ch as Player;
	// 	ch.send("Total Time played: {0}\n\r", (player.TotalPlayTime + (DateTime.Now - player.LastSaveTime)));
	// }
	return;
}

Character.DoCommands.DoWeather = function(ch, args) {
	const WeatherInfo = require("./WeatherInfo");

	var buf;

	var sky_look =
	{
		"Cloudless": "cloudless",
		"Cloudy": "cloudy",
		"Raining": "rainy",
		"Lightning": "lit by flashes of lightning"
	};

	if (!ch.IsOutside)
	{
		ch.send("You can't see the weather here.\n\r");
		return;
	}

	buf = Utility.Format("The sky is {0} and {1}.\n\r",
		sky_look[WeatherInfo.Sky],
		WeatherInfo.change >= 0 ? "a warm southerly breeze blows" : "a cold northern gust blows");
	ch.send(buf);
	return;
}

Character.DoCommands.DoWorth = function(ch, args)
{
	if (ch.Form) {
		ch.send("You need {0} xp to level({1} of {2})\n\r",
		(ch.XpToLevel * (ch.Level)) - ch.Xp, ch.XpTotal, ch.XpToLevel * (ch.Level));
	} else {
			ch.send("You have {0} silver, and {1} gold. You need {2} xp to level({3} of {4})\n\r",
			ch.Silver, ch.Gold, (ch.XpToLevel * (ch.Level)) - ch.Xp, ch.XpTotal, ch.XpToLevel * (ch.Level));
	}
}

Character.DoCommands.DoScrollCount = function(character, args) {
	if(args.ISEMPTY()) {
		character.send("Scroll count is {0}.\n\r", character.ScrollCount);
	} else {
		var count = Number(args);

		if(count && count >= 1) {
			character.ScrollCount = count;
			character.send("Scroll count is {0}.\n\r", character.ScrollCount);
		} else {
			character.send("Scroll count must be greater than 0.\n\r")
		}
	}
}

Character.DoCommands.DoScan = function(character, args) { 
	character.ScanDirection(args);
}

Character.DoCommands.DoScore = function(character, args) {
	const PhysicalStats = require('./PhysicalStats');
	character.send("You are {0} the {1} {2}, a {3} at level {4}.\n\r", character.Name, character.Sex != "None" ? character.Sex : "sexless", character.Race.Name.toLowerCase(), character.Guild.Name, character.Level);
	character.send("Alignment: {0}, Ethos: {1}.\n\r", character.Alignment.toLowerCase(), character.Ethos.toLowerCase());
	if (character.PermanentStats != null)
		character.send("Strength: {0}(+{1}), Wisdom: {2}(+{3}), Intelligence: {4}(+{5}), Dexterity: {6}(+{7}), Constitution: {8}(+{9}), Charisma: {10}(+{11})\n\r",
			character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Strength), (character.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Strength) >= character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Strength) ? character.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Strength) - character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Strength) : 0),
			character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Wisdom), (character.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Wisdom) > character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Wisdom) ? character.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Wisdom) - character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Wisdom) : 0),
			character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Intelligence), (character.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Intelligence) >= character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Intelligence) ? character.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Intelligence) - character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Intelligence) : 0),
			character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity), (character.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Dexterity) >= character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity) ? character.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Dexterity) - character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity) : 0),
			character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Constitution), (character.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Constitution) >= character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Constitution) ? character.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Constitution) - character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Constitution) : 0),
			character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Charisma), (character.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Charisma) >= character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Charisma) ? character.GetModifiedStatUncapped(PhysicalStats.PhysicalStatTypes.Charisma) - character.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Charisma) : 0));
	// var ac = ch.GetArmorClass();
	// ch.send("AC Bash {0}, Slash {1}, Pierce {2}, Exotic {3}\n\r", ac.acBash, ac.acSlash, ac.acPierce, ac.acExotic);
	character.send("Carry #: {0}/{1}, Weight {2}/{3}\n\r", character.Carry, character.MaxCarry, character.TotalWeight, character.MaxWeight);

	character.send("Practices: {0}, Trains {1}\n\r", character.Practices, character.Trains);
	character.send("Hitpoints: {0}/{1} Mana: {2}/{3} Movement: {4}/{5}.\n\r", character.HitPoints, character.MaxHitPoints, character.ManaPoints, character.MaxManaPoints, character.MovementPoints, character.MaxMovementPoints);
	character.send("Damage Roll: {0}, Hit Roll: {1}\n\r", character.GetDamageRoll, character.GetHitRoll);

	Character.DoCommands.DoWorth(character, args);
	Character.DoCommands.DoAffects(character, args);
}

Character.DoCommands.DoPrompt = function(ch,  args)
{
	const Color = require('./Color');
	if (!(ch instanceof Player)) return;

	ch.send("The default prompt is: <%1%%h %2%%m %3%%mv %W> \n\r");

	if (!args.ISEMPTY() && (args.equals("all") || args.equals("default")))
	{
		player.Prompt = "<%1%%h %2%%m %3%%mv %W> ";
	}
	else if (!args.ISEMPTY() && args.equals("?"))
	{
		Character.DoCommands.DoHelp(ch, "prompt");
	}
	else if (!args.ISEMPTY())
	{
		player.Prompt = args + (!args.endsWith(" ") ? " " : "");
	}

	ch.send("Your prompt is: " + Color.EscapeColor(player.Prompt) + "\n\r");
}

Character.DoCommands.DoPractice = function(ch, args)
{
	const PhysicalStats = require('./PhysicalStats');
	// var skills = from skill in ch.learned where skill.Key.skillType.Contains(SkillSpellTypes.Skill) && (skill.Key.skillLevel.ContainsKey(ch.guild.name) || skill.Value > 0) orderby skill.Key.skillLevel.ContainsKey(ch.guild.name) ? skill.Key.skillLevel[ch.guild.name] : 100 select skill;
	if (Utility.IsNullOrEmpty(args))
	{
		var column = 0;
		var text = "";
		var skills = SkillSpell.Skills.Select(tempskill => tempskill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Skill) ||
		tempskill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Spell) ||
		tempskill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Commune) ||
		tempskill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Song) ||
		(tempskill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.InForm) && tempskill.SpellFun));
		skills.sort((a, b) => ch.GetLevelSkillLearnedAtOutOfForm(a) < ch.GetLevelSkillLearnedAtOutOfForm(b)? -1 : ch.GetLevelSkillLearnedAtOutOfForm(a) > ch.GetLevelSkillLearnedAtOutOfForm(b)? 1 : 0);
		for(var skill of skills)
		{
			var percent = ch.GetSkillPercentageOutOfForm(skill); // ch.Learned.TryGetValue(skill, out int percent);
			//skill.skillLevel.TryGetValue(ch.Guild.name, out int lvl);
			var lvl = ch.GetLevelSkillLearnedAtOutOfForm(skill);

			if (percent > 1 || ch.Level >= lvl && skill.PrerequisitesMet(ch)) // && (lvl < (game.LEVEL_HERO + 1)) || ch.IS_IMMORTAL))
			{
				text += Utility.Format("     {0,30} {1,-5} ", skill.Name, (ch.Level >= lvl || percent > 1 ? percent + "%" : "N/A"));
				//text += ("    " + (skill.Name.padEnd(25) + " " + (ch.Level >= lvl || percent > 1 ? percent + "%" : "N/A").padStart(4)).padEnd(30));

				if (column == 1)
				{
					text += "\n";
					column = 0;
				}
				else
					column++;
			}
		}
		ch.send(text + "\n\rYou have {0} practice sessions left.\n\r", ch.Practices);
	}
	else
	{
		if (!ch.IsAwake)
		{
			ch.SendToChar("In your dreams or what?\n\r");
			return;
		}

		if (ch.Form)
		{
			ch.send("You can't do that in form.\n\r");
			return;
		}
		var skill;
		var skills = SkillSpell.Skills.Select(tempskill => (tempskill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Skill) ||
		tempskill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Spell) ||
		tempskill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Commune) ||
		tempskill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.Song) ||
		(tempskill.SkillTypes.ISSET(SkillSpell.SkillSpellTypesList.InForm) && tempskill.SpellFun)) &&
		tempskill.Name.prefix(args));
		if(skills.length > 0) {
			skills.sort((a, b) => ch.GetLevelSkillLearnedAtOutOfForm(a) < ch.GetLevelSkillLearnedAtOutOfForm(b)? -1 : ch.GetLevelSkillLearnedAtOutOfForm(a) > ch.GetLevelSkillLearnedAtOutOfForm(b)? 1 : 0);
			skill = skills[0];
		}
		//skill = SkillSpell.SkillLookup(arguments);
		var practiceMob = null;
		for (var mob of ch.Room.Characters)
		{
			if (mob.Flags.ISSET(Character.ActFlags.GuildMaster))// && (!mob.Guild || mob.Guild == ch.Guild))
			{
				practiceMob = mob;
				break;
			}
		}

		if (practiceMob && practiceMob.Guild && practiceMob.Guild != ch.Guild)
		{
			ch.send("They won't teach you because you aren't a {0}.\n\r", practiceMob.Guild.Name);
			return;
		}
		if (skill)
		{
			var learned = ch.GetSkillPercentage(skill);
			//ch.Learned.TryGetValue(skill, out int learned);

			if (ch.Level >= ch.GetLevelSkillLearnedAt(skill) && ch.Practices >= 1 && practiceMob && learned < 75)
			{
				ch.LearnSkill(skill, Math.min(learned + PhysicalStats.IntelligenceApply[ch.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Intelligence)].Learn, 75));
				ch.Practices -= 1;
				ch.send("You practice and learn in the ability {0}.\n\r", skill.Name);
				if (ch.Learned[skill.Name].Percent == 75)
				{
					ch.send("\\gYou are now learned in the ability {0}.\\x\n\r", skill.Name);
				}
			}
			else if (learned >= 75)
			{
				ch.send("You are already learned at " + skill.Name + ".\n\r");
			}
			else if (!practiceMob)
				ch.send("Find a guild master and have practices.\n\r");
			else if (ch.Practices == 0)
			{
				ch.send("You don't have enough practice sessions.\n\r");
			}
			else
				ch.send("What skill is that?\n\r");
		}
		else
			ch.send("What skill is that?\n\r");
	}
}

Character.DoCommands.DoTrain = function(ch, args)
{
	const PhysicalStats = require('./PhysicalStats');
	var Trainer = null;

	for (var mob of ch.Room.Characters)
	{
		if (mob.Flags.ISSET(Character.ActFlags.Trainer) || mob.Flags.ISSET("Gain"))
		{
			Trainer = mob;
			break;
		}
	}

	if (Trainer)
	{
		if (ch.Form)
		{
			ch.send("You can't do that in form.\n\r");
			return;
		}

		if (args.ISEMPTY())
		{

			ch.send("You can train: \n\r");
			
			for (var stat in PhysicalStats.PhysicalStatTypes)
			{
				var statindex = PhysicalStats.PhysicalStatTypes[stat];
				if (ch.PermanentStats[statindex] < ch.PcRace.MaxStats[statindex])
				{
					ch.send("\t" + stat.toLowerCase() + "\n\r");
				}
			}
			ch.send("\tHitpoints\n\r\tMana\n\r");
			ch.send("You have " + ch.Trains + " trains.\n\r");
			return;
		}


		if (ch.Trains > 0)
		{
			for (var stat in PhysicalStats.PhysicalStatTypes)
			{
				var statindex = PhysicalStats.PhysicalStatTypes[stat];
				if (stat.prefix(args) && ch.PermanentStats[statindex] < ch.PcRace.MaxStats[statindex])
				{
					ch.send("You train your " + stat.toLowerCase() + ".\n\r");
					ch.Act("$n's " + stat.toLowerCase() + " increases.\n\r", null, null, null, Character.ActType.ToRoom);
					ch.PermanentStats[statindex]++;
					ch.Trains--;
					return;
				}
			}

			if ("hitpoints".prefix(args) || args.equals("hp"))
			{
				ch.send("You train your hitpoints.\n\r");
				ch.Act("$n's hitpoints increase.\n\r", null, null, null, Character.ActType.ToRoom);
				ch.MaxHitPoints += 10;
				ch.Trains--;
				return;
			}

			if ("mana".prefix(args))
			{
				ch.send("You train your mana.\n\r");
				ch.Act("$n's mana increases.\n\r", null, null, null, Character.ActType.ToRoom);
				ch.MaxManaPoints += 10;
				ch.Trains--;
				return;
			}

			ch.send("You can't train that.\n\r");
		}
		else
			ch.send("You have no trains.\n\r");
	}
	else
		ch.send("There is no trainer here.\n\r");

}

Character.DoCommands.DoGain = function(ch, args)
{
	var Trainer = null;

	for (var mob of ch.Room.Characters)
	{
		if (mob.Flags.ISSET(Character.ActFlags.Trainer) || mob.Flags.ISSET("Gain"))
		{
			Trainer = mob;
			break;
		}
	}

	if (Trainer)
	{
		if (ch.Form)
		{
			ch.send("You can't do that in form.\n\r");
			return;
		}

		if ("revert".prefix(args))
		{
			if (ch.Trains > 0)
			{
				ch.Practices += 10;
				ch.Trains--;
				ch.Act("You convert 1 train into 10 practices.");
			}
			else
				ch.send("You have no trains.\n\r");
		}
		else if ("convert".prefix(args))
		{
			if (ch.Practices >= 10)
			{
				ch.Practices -= 10;
				ch.Trains++;
				ch.Act("You convert 10 practices into 1 train.");
			}
			else
				ch.send("You don't have enough practices.\n\r");
		}
		else
			ch.send("Gain [convert|revert]");
	}
	else
		ch.send("There is no trainer here.\n\r");

}

Character.DoCommands.DoAutoAssist = function(character, args) {
	if("on".prefix(args) || character.Flags.ISSET(Character.ActFlags.AutoAssist)) {
		character.Flags.RemoveFlag(Character.ActFlags.AutoAssist);
	} else if("off".prefix(args) || !character.Flags.ISSET(Character.ActFlags.AutoAssist)) {
		character.Flags.SETBIT(Character.ActFlags.AutoAssist);
	}

	character.send("AutoAssist is {0}.\n\r", character.Flags.ISSET(Character.ActFlags.AutoAssist)? "\\GON\\x" : "\\ROFF\\x")
}

Character.DoCommands.DoAutoSacrifice = function(character, args) {
	if("on".prefix(args) || character.Flags.ISSET(Character.ActFlags.AutoSac)) {
		character.Flags.RemoveFlag(Character.ActFlags.AutoSac);
	} else if("off".prefix(args) || !character.Flags.ISSET(Character.ActFlags.AutoSac)) {
		character.Flags.SETBIT(Character.ActFlags.AutoSac);
	}

	character.send("AutoSacrifice is {0}.\n\r", character.Flags.ISSET(Character.ActFlags.AutoSac)? "\\GON\\x" : "\\ROFF\\x")
}

Character.DoCommands.DoAutoLoot = function(character, args) {
	if("on".prefix(args) || character.Flags.ISSET(Character.ActFlags.AutoLoot)) {
		character.Flags.RemoveFlag(Character.ActFlags.AutoLoot);
	} else if("off".prefix(args) || !character.Flags.ISSET(Character.ActFlags.AutoLoot)) {
		character.Flags.SETBIT(Character.ActFlags.AutoLoot);
	}

	character.send("AutoLoot is {0}.\n\r", character.Flags.ISSET(Character.ActFlags.AutoLoot)? "\\GON\\x" : "\\ROFF\\x")
}

Character.DoCommands.DoAutoGold = function(character, args) {
	if("on".prefix(args) || character.Flags.ISSET(Character.ActFlags.AutoGold)) {
		character.Flags.RemoveFlag(Character.ActFlags.AutoGold);
	} else if("off".prefix(args) || !character.Flags.ISSET(Character.ActFlags.AutoGold)) {
		character.Flags.SETBIT(Character.ActFlags.AutoGold);
	}

	character.send("AutoGold is {0}.\n\r", character.Flags.ISSET(Character.ActFlags.AutoGold)? "\\GON\\x" : "\\ROFF\\x")
}

Character.DoCommands.DoAutoSplit = function(character, args) {
	if("on".prefix(args) || character.Flags.ISSET(Character.ActFlags.AutoSplit)) {
		character.Flags.RemoveFlag(Character.ActFlags.AutoSplit);
	} else if("off".prefix(args) || !character.Flags.ISSET(Character.ActFlags.AutoSplit)) {
		character.Flags.SETBIT(Character.ActFlags.AutoSplit);
	}

	character.send("AutoSplit is {0}.\n\r", character.Flags.ISSET(Character.ActFlags.AutoSplit)? "\\GON\\x" : "\\ROFF\\x")
}

Character.DoCommands.DoColor = function(character, args) {
	if("on".prefix(args) || character.Flags.ISSET(Character.ActFlags.Color)) {
		character.Flags.RemoveFlag(Character.ActFlags.Color);
	} else if("off".prefix(args) || !character.Flags.ISSET(Character.ActFlags.Color)) {
		character.Flags.SETBIT(Character.ActFlags.Color);
	}

	character.send("Color is {0}.\n\r", character.Flags.ISSET(Character.ActFlags.Color)? "\\GON\\x" : "\\ROFF\\x")
}

Character.DoCommands.DoBrief = function(character, args) {
	if("on".prefix(args) || character.Flags.ISSET(Character.ActFlags.Brief)) {
		character.Flags.RemoveFlag(Character.ActFlags.Brief);
	} else if("off".prefix(args) || !character.Flags.ISSET(Character.ActFlags.Brief)) {
		character.Flags.SETBIT(Character.ActFlags.Brief);
	}

	character.send("Brief is {0}.\n\r", character.Flags.ISSET(Character.ActFlags.Brief)? "\\GON\\x" : "\\ROFF\\x")
}

Character.DoCommands.DoAutoExits = function(character, args) {
	if("on".prefix(args) || character.Flags.ISSET(Character.ActFlags.AutoExit)) {
		character.Flags.RemoveFlag(Character.ActFlags.AutoExit);
	} else if("off".prefix(args) || !character.Flags.ISSET(Character.ActFlags.AutoExit)) {
		character.Flags.SETBIT(Character.ActFlags.AutoExit);
	}

	character.send("AutoExits is {0}.\n\r", character.Flags.ISSET(Character.ActFlags.AutoExit)? "\\GON\\x" : "\\ROFF\\x")
}

Character.DoCommands.DoAFK = function(character, args) {
	if("on".prefix(args) || character.Flags.ISSET(Character.ActFlags.AFK)) {
		character.Flags.RemoveFlag(Character.ActFlags.AFK);
	} else if("off".prefix(args) || !character.Flags.ISSET(Character.ActFlags.AFK)) {
		character.Flags.SETBIT(Character.ActFlags.AFK);
	}

	character.send("AFK is {0}.\n\r", character.Flags.ISSET(Character.ActFlags.AFK)? "\\GON\\x" : "\\ROFF\\x")
}

Character.DoCommands.DoDeposit = function(ch, args)
{
	var banker;
	var arg = "";
	var amount;

	banker = ch.Room.Characters.FirstOrDefault(npc => npc.Flags.ISSET(Character.ActFlags.Banker));

	if (!banker)
	{
		ch.send("You can't do that here.\n\r");
		return;
	}

	if (ch.Form)
	{
		ch.send("You can't speak to the banker.\n\r");
		return;
	}

	[arg, args] = args.OneArgument();
	if (arg.ISEMPTY())
	{
		ch.send("Deposit how much of which coin type?\n\r");
		return;
	}
	var amount = Number(arg);
	if (!amount || !Number.isInteger(amount))
	{
		ch.send("Deposit how much of which type of coin?\n\r");
		return;
	}

	[arg, args] = args.OneArgument();
	if (amount <= 0 || (!arg.equals("gold") && !arg.equals("silver")))
	{
		ch.Act("$N tells you, 'Sorry, deposit how much of which coin type?'", banker);
		return;
	}

	if (arg.equals("gold"))
	{
		if (ch.Gold < amount)
		{
			ch.Act("$N tells you, 'You don't have that much gold on you!'", banker);
			return;
		}
		ch.SilverBank += amount * 1000;
		ch.Gold -= amount;
	}
	else if (arg.equals("silver"))
	{
		if (ch.Silver < amount)
		{
			ch.Act("$N tells you, 'You don't have that much silver on you!'", banker);
			return;
		}
		ch.SilverBank += amount;
		ch.Silver -= amount;
	}
	ch.send("You deposit {0} {1}.\n\r", amount, arg.toLowerCase());
	ch.send("Your new balance is {0} silver.\n\r", ch.SilverBank);
	return;
}

Character.DoCommands.DoWithdraw = function( ch, args)
{
	var banker;
	var arg = "";
	var amount;


	banker = ch.Room.Characters.FirstOrDefault(npc => npc.Flags.ISSET(Character.ActFlags.Banker));

	if (!banker)
	{
		ch.send("You can't do that here.\n\r");
		return;
	}
	//var charges;
	if (ch.Form)
	{
		ch.send("You can't speak to the banker.\n\r");
		return;
	}

	[arg, args] = args.OneArgument();
	if (arg.ISEMPTY())
	{
		ch.send("Withdraw how much of which coin type?\n\r");
		return;
	}
	amount = Number(arg);
	if (!amount || !Number.isInteger(amount))
	{
		ch.send("Withdraw how much of which type of coin?\n\r", ch);
		return;
	}

	[arg, args] = args.OneArgument();
	if (amount <= 0 || (!arg.equals("gold") && !arg.equals("silver")))
	{
		ch.Act("$N tells you, 'Sorry, withdraw how much of which coin type?'", banker);
		return;
	}
	//charges = 10 * amount / 100;

	if (arg.equals("gold"))
	{
		if (ch.SilverBank < amount * 1000)
		{
			ch.Act("$N tells you, 'Sorry you do not have we don't give loans.'", banker);
			return;
		}
		ch.SilverBank -= amount * 1000;
		ch.Gold += amount;
		// if(Math.floor(charges) != charges) {
		// 	ch.Silver -= (charges - Math.floor(charges)) * 1000;
		// }
		// ch.Gold -= Math.floor(charges);
	}
	else if (arg.equals("silver"))
	{
		if (ch.SilverBank < amount)
		{
			ch.Act("$N tells you, 'You don't have that much silver in the bank.'", banker);
			return;
		}
		ch.SilverBank -= amount;
		ch.Silver += amount;
		//ch.Silver -= charges;
	}

	ch.send("You withdraw {0} {1}.\n\r", amount, arg.toLowerCase());
	//ch.send("You are charged a small fee of {0} {1}.\n\r", charges, arg.ToLower());
	return;
}

Character.DoCommands.DoBalance = function(ch, args)
{
	var banker;

	banker = ch.Room.Characters.FirstOrDefault(npc => npc.Flags.ISSET(Character.ActFlags.Banker));

	if (!banker)
	{
		ch.send("You can't do that here.\n\r");
		return;
	}
	if (ch.Form)
	{
		ch.send("You can't speak to the banker.\n\r");
		return;
	}
	if (ch.SilverBank == 0)
		ch.send("You have no account here!\n\r");
	else
		ch.send("You have {0} silver in your account.\n\r", ch.SilverBank);
	return;
}

Character.DoCommands.DoCommands = function(character, args) {
	const Commands = require('./Commands');
	var column = 0;
	character.send("The following commands are available to you:\n\r")
	for(var key in Commands) {
		var command = Commands[key];
		
		if(command.Skill && character.GetSkillPercentage(command.Skill) <= 1) {
			continue;
		} 

		character.send("{0,20} ", key);
		column++;
		if(column >= 4) {
			character.send("\n\r");
			column = 0;
		}
	}
	character.send("\n\r");
}

Character.DoCommands.DoSocials = function(character, args) {
	const Socials = require('./Socials');
	var column = 0;
	character.send("The following socials are available:\n\r")
	for(var key in Socials.Socials) {
		
		character.send("{0,20} ", key);
		column++;
		if(column >= 4) {
			character.send("\n\r");
			column = 0;
		}
	}
	character.send("\n\r");
}

Character.DoCommands.DoBug = function(character, args) {
	const fs = require('fs');
	const Settings = require('./Settings');
	fs.appendFileSync(Settings.DataPath + "/bugs.txt", Utility.Format("{0} {1} :: {2} - {3}\n", new Date().toDateString(), new Date().toTimeString(), character.Name, args));
	character.send("Bug logged.\n\r");
}

Character.DoCommands.DoVisible = function(character, args) {
	character.StripCamouflage();
	character.StripHidden();
	character.StripInvis();
	character.StripSneak();
	character.send("OK.\n\r");
}

Character.DoCommands.DoAreas = function(ch, args)
{
	const AreaData = require("./AreaData");
	ch.StartPaging();
	var areas = [];
	for(var areakey in AreaData.AllAreas) {
		var area = AreaData.AllAreas[areakey];
		areas.push(area);
	}
	if (ch.IsImmortal) {	
		areas.sort((a, b) => a.VNumStart < b.VNumStart? -1 : a.VNumStart > b.VNumStart? 1 : 0);
		for(var area of areas) {
			ch.send("{0,25} - {1,40} {2,-6} - {3,-6}\n\r", area.Name, area.Credits, area.VNumStart, area.VNumEnd);
		}
	} else {
		areas.sort((a, b) => a.Credits < b.Credits? -1 : a.Credits > b.Credits? 1 : 0);
		for(var area of areas) {
			ch.send("{0,25} - {1,40}\n\r", area.Name, area.Credits);
		}
	}
	
	ch.EndPaging();
}

Character.DoCommands.DoArea = function(ch, args) {
	if (!ch.Room || !ch.Room.Area)
		ch.send("You aren't anywhere.");
	else
		ch.send(ch.Room.Area.Name.padEnd(30) + " - " + ch.Room.Area.Credits.padEnd(40) + "\n\r");
}
const Player = require("./Player");
const SkillSpell = require("./SkillSpell");const ItemData = require("./ItemData");
const Utility = require("./Utility");

