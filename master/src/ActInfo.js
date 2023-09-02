const FileSystem = require("fs");

const RoomData = require("./RoomData");
const AreaData = require("./AreaData");
const Character = require("./Character");
const Utitlity = require("./Utility");
const Settings = require("./Settings");


function dosay(player, arguments) {
	player.Act("\\y$n says '{0}\\x\\y'\\x\n", null, null, null, "ToRoom", arguments);
	// for (const otherplayer of Player.Players) {
	// 	if (otherplayer.Name !== null && otherplayer != player) {
	// 	  player.Act("\\y$n" + ` says '${arguments}'\\x\n`, otherplayer, null, null, "ToVictim");
	// 	} 
	// }
	player.send("\\yYou say '{0}\\x\\y'\\x\n", arguments);
}

function DoYell(player, args) {
	for (const otherplayer of Character.Characters) {
		if(otherplayer.Room && otherplayer.Room.Area == player.Room.Area) {
			otherplayer.send("\\r{0} yells '{1}\\x\\r'\\x\n", Utility.Capitalize(player.Display(otherplayer)), args);
		}
	}

	player.send("\\rYou yell '{0}\\x\\r'\\x\n", args);
}

function doquit(player, arguments) {
	player.Act("The form of $n slowly fades away!", null, null, null, "ToRoom");
	player.sendnow("Alas, all good things must come to an end.\n\r");
	player.RemoveCharacterFromRoom();
	player.socket.destroy();
	Player.Players.splice(Player.Players.indexOf(player), 1)
	console.log(`${player.Name} disconnected`)
}

function dohelp(player, arguments, plain = false) {
	var found = false;
	//var args = oneargument(str);
	if(arguments.IsNullOrEmpty()) arguments = "help";

	for(var helpkey in AreaData.AllHelps) {
		var help = AreaData.AllHelps[helpkey];
		if(help.VNum.toString().startsWith(arguments) || Utility.Includes(help.Keyword, arguments)) {
			if(!plain)
			player.send("--------------------------------------------------------------------------------\n\r");
			player.send((help.Text.startsWith(".")? help.Text.substr(1) : help.Text) + (help.Text.endsWith("\n") || help.Text.endsWith("\r")? "" : "\n\r"));
			if(!plain) {
				player.send("--------------------------------------------------------------------------------\n\r");
				player.send("Last edited on {0} by {1}.\n\r\n\r", help.LastEditedOn, help.LastEditedBy);
			}
			found = true;
		}
	}
	if(!found) player.send("No help on that.\n\r");
}

/**
 * 
 * @param {CharacterData} player 
 * @param {string} arguments 
 * @param {boolean} auto 
 * @returns 
 */
function dolook(player, arguments, auto) {
	if(player.Room == null) {
		player.send("You are not in a room.\n\r");
	} else if (!arguments || arguments.length == 0 || auto) {
		player.send(`\\c   ${player.Room.Name}\\x\n\r`);
		player.send(`${player.Room.Description}\n\r\n\r`);
		doexits(player, "");
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
			if (other != player)
				player.Act(other.DisplayFlags(player) + other.GetLongDescription(), other, null, null, "ToChar");
		}
		
	} else {
		var [inarg, newargs] = arguments.oneArgument();
		var lookin = false;
		var isitem = true;
		if("in".prefix(inarg)) {
			arguments = newargs;
			lookin = true;
		}

		var [target, count] = player.GetItemHere(arguments, 0);
		if(!target && !lookin) {
			[target, count] = Character.CharacterFunctions.GetCharacterHere(player, arguments, count);
			isitem = false;
		}
		
		if(target && target instanceof Character)	{
			if(target == player) {
				player.Act("You look at yourself.", target, null, null, "ToChar");
				player.Act("$n looks at $mself.", target, null, null, "ToRoomNotVictim");
				
				player.Act(Utility.IsNullOrEmpty(target.Description)? "You see nothing special about yourself." : target.Description, target);
				target.DisplayHealth(player);
				player.Act("You are wearing: ", target);
			}
			else
			{
				player.Act("You look at $N.", target, null, null, "ToChar");
				player.Act("$n looks at $N.", target, null, null, "ToRoomNotVictim");
				player.Act("$n looks at you.", target, null, null, "ToVictim");

				player.Act(Utility.IsNullOrEmpty(target.Description)? "You see nothing special about $N." : target.Description, target);
				target.DisplayHealth(player);
				player.Act("$N is wearing: ", target);
			}
			var anyitems = false;
			for(var slotkey in Character.WearSlots) {
				var slot = Character.WearSlots[slotkey];
				var item = target.Equipment[slotkey];
				if(item) {
					player.send(slot.Slot + item.DisplayFlags(player) + item.Display(player) + "\n\r");
					anyitems = true;
				}
				
			}
			if(!anyitems)
					player.send("   nothing.\n\r");
		} else if(target && target instanceof ItemData) {
			if(lookin && target.ExtraFlags.IsSet("Closed")) {
				    ch.send("{0} is closed.\n\r", target.Display(ch));
			} else if(lookin && !target.ItemTypes.IsSet("Container")) {
				ch.send("{0} isn't a container.\n\r", target.Display(ch));
				return;
			} else if(!lookin) {
				player.Act("$n looks at $p.", null, target, null, "ToRoom");
				player.Act("You look at $p.", null, target, null, "ToChar");
				if(!target.Description.IsNullOrEmpty())
				player.send(target.Description + (target.Description.replace("\r", "").endsWith("\n")? "" : "\n"));
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
}

function doexits(player, arguments) {
	var anyexits = false;
	player.send("\\g[Exits");
	if(player.Room) {	
		for(var i = 0; i < 6; i++) {
			if(player.Room.Exits[i] && player.Room.Exits[i].Destination) {
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

function doequipment(player, arguments) {
	player.send("You are wearing: \n\r");
	var anyitems = false;
	for(slot in Character.WearSlots) {
		var wearslot = Character.WearSlots[slot];
		var item = player.Equipment[slot];
		if(item) {
			player.send(wearslot.Slot + " " + item.DisplayFlags(player) + item.Display(player) + "\n\r");
			anyitems = true;
		}
		
	}

	if(!anyitems) player.send("   nothing.\n\r");

}

function doinventory(player, arguments) {
	var items = {};
	player.send("You are carrying:\n\r");
	for(i = 0; i < player.Inventory.length; i++) {
		var item = player.Inventory[i];
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

function GetCharacterList(player, list, arguments, count = 0) {
	if(Utility.Compare(arguments, "self")) return [player, ++count, ""];
	var numberargs = Utility.NumberArgument(arguments);
	var desiredcount = numberargs[0];
	arguments = numberargs[1];
	for(key in list) {
		var ch = list[key];
		if((Utility.IsNullOrEmpty(arguments) || Utility.IsName(ch.Name, arguments)) && ++count > desiredcount)
			return [ch, count, key];
	}
	return [null, count, ""];
}

function GetCharacterHere(player, arguments, count = 0) {
	var results = GetCharacterList(player, player.Room.Characters, arguments, count);

	return results;

}

function DoSave(player, arguments) {
	if(player && !player.IsNPC) {
		player.Save();
		player.send("Your character has been saved.\n\r");
	}
}

function DoWho(ch, arguments) {
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
	whoList += "Visible players: " + playersOnline + "\n\r";
	whoList += "Max players online at once since last reboot: " + Player.PlayersOnlineAtOnceSinceLastReboot + "\n\r";
	whoList += "Max players online at once ever: " + Settings.PlayersOnlineAtOnceEver + "\n\r";

	//using (new Character.Page(ch))
		ch.send(whoList);
}

function DoSkills(ch, arguments) {
	if (!Utitlity.IsNullOrEmpty(arguments))
	{
		var skills = [];
		for(var skillname in SkillSpell.Skills) {
			if(Utitlity.Prefix(skillname, arguments) && SkillSpell.Skills[skillname].SkillTypes["Skill"]) {
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
			if(SkillSpell.Skills[skillname].SkillTypes["Skill"]) {
				skills.push(SkillSpell.Skills[skillname]);
			}
		}

		skills.sort((a,b) => ch.GetLevelSkillLearnedAt(a.Name) < ch.GetLevelSkillLearnedAt(b.Name)? -1 : 
							 (ch.GetLevelSkillLearnedAt(a.Name) == ch.GetLevelSkillLearnedAt(b.Name)? 0 : 1));
		
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

				ch.send(skill.Name + " " + percent + "%" + " " + skill.MinimumMana + " mana" + "\n\r");
			}
		}
	} else {
		var lastLevel = 0;
		var column = 0;
		var skills = [];
		var text = "";
		for(var skillname in SkillSpell.Skills) {
			if(SkillSpell.Skills[skillname].SkillTypes.ISSET(type)) {
				skills.push(SkillSpell.Skills[skillname]);
			}
		}

		skills.sort((a,b) => ch.GetLevelSkillLearnedAt(a.Name) < ch.GetLevelSkillLearnedAt(b.Name)? -1 : 
							 (ch.GetLevelSkillLearnedAt(a.Name) == ch.GetLevelSkillLearnedAt(b.Name)? 0 : 1));
		
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

				text += ("    " + (skill.Name + " " + (ch.Level >= lvl || percent > 1 ? percent + "%" : "N/A") + " " + skill.MinimumMana + " mana").padStart(30).padEnd(35));

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

Character.DoCommands.DoSpells = function(ch, args) {
	ShowSpells(ch, args, "Spell");
}

Character.DoCommands.DoSupplications = function(ch, args) {
	ShowSpells(ch, args, "Supplication");
}

Character.DoCommands.DoSongs = function(ch, args) {
	ShowSpells(ch, args, "Song");
}

function DoDelete(character, arguments) {
	if(!character.Flags["ConfirmDelete"]) {
		character.Flags["ConfirmDelete"] = true;
		character.send("Type `delete yes` to delete your character.\n\rThis process is irreversible.\n\r")
	} else if(Utility.Compare(arguments, "yes")) {
		character.Act("The form of $n explodes!", null, null, null, "ToRoom");
		character.sendnow("Alas, all good things must come to an end.\n\r");
		character.RemoveCharacterFromRoom();
		character.socket.destroy();
		Player.Players.splice(Player.Players.indexOf(character), 1)
		console.log(`${character.Name} disconnected`)

		path = Settings.PlayerDataPath + `/${character.Name}.xml`;
		FileSystem.unlinkSync(path);
	} else {
		character.send("Character deletion cancelled.\n\r");
		delete character.Flags["ConfirmDelete"];
	}
}

function DoWhere(character, arguments) {
	var count = 0;
	var desiredcount;
	var playersonly = arguments.IsNullOrEmpty();
	var playercount = 0;
	[desiredcount, arguments] = arguments.numberArgument();
	if(playersonly) {
		character.send("Players near you:\n\r");
	}
	for(var other of Character.Characters) {
		if(!other.Room) continue;
		if(other.Room.Area == character.Room.Area && !other.IsNPC && playersonly) {
			playercount++;
			character.send("{0}    {1,20}     {2}\n\r", (other == character? "*" : " "), other.Display(character), other.Room.Name);
		} else if(other.Room.Area == character.Room.Area && other.Name.IsName(arguments) && ++count >= desiredcount) {
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

Character.DoCommands.DoAffects = function(ch, args) {
	var any = false;
	ch.send("You are affected by:\n\r");
	for(var affect of ch.Affects) {
		if(!affect.Hidden) {
			any = true;
			if (affect.Modifier != 0) {
				ch.send("{0,20} {1,-15} {2,-5} for {3} {4}.\n\r", affect.DisplayName + ":", affect.Location, ((affect.Modifier > 0 ? "+" : " ") + affect.Modifier.toString()),
				 affect.Duration, (affect.Frequency == "Tick" ? "hours" : "rounds"));
			}
			else {
				ch.send("{0,42} for {1} {2}.\n\r", affect.DisplayName + ":", affect.Duration, (affect.Frequency == "Tick" ? "hours" : "rounds"));
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

Character.DoCommands.DoSay = dosay;
Character.DoCommands.DoYell = DoYell;
Character.DoCommands.DoQuit = doquit;
Character.DoCommands.DoHelp = dohelp;
Character.DoCommands.DoLook = dolook;
Character.DoCommands.DoExits = doexits;
Character.DoCommands.DoEquipment = doequipment;
Character.DoCommands.DoInventory = doinventory;
Character.DoCommands.DoSave = DoSave;
Character.DoCommands.DoWho = DoWho;
Character.DoCommands.DoSkills = DoSkills;
Character.DoCommands.DoDelete = DoDelete;
Character.DoCommands.DoWhere = DoWhere;

Character.CharacterFunctions.GetCharacterHere = GetCharacterHere;
Character.CharacterFunctions.GetCharacterList = GetCharacterList;
const Player = require("./Player");
const SkillSpell = require("./SkillSpell");const ItemData = require("./ItemData");
const Utility = require("./Utility");

