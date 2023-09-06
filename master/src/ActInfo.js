const FileSystem = require("fs");

const RoomData = require("./RoomData");
const AreaData = require("./AreaData");
const Character = require("./Character");
const Utitlity = require("./Utility");
const Settings = require("./Settings");




function doquit(player, args) {
	player.Act("The form of $n slowly fades away!", null, null, null, "ToRoom");
	player.sendnow("Alas, all good things must come to an end.\n\r");
	player.Save();
	player.Dispose();
	player.socket.destroy();
	Player.Players.splice(Player.Players.indexOf(player), 1)
	console.log(`${player.Name} disconnected`)
}

function dohelp(player, args, plain = false) {
	
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
function dolook(player, args, auto) {
	player.StartPaging();
	if(player.Room == null) {
		player.send("You are not in a room.\n\r");
	} else if (!args || args.length == 0 || auto) {
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

function doexits(player, args) {
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

function doequipment(player, args) {
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

function doinventory(player, args) {
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

function DoSave(player, args) {
	if(player && !player.IsNPC) {
		player.Save();
		player.send("Your character has been saved.\n\r");
	}
}

function DoWho(ch, args) {
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

function DoSkills(ch, args) {
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

function DoDelete(character, args) {
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

		path = Settings.PlayerDataPath + `/${character.Name}.xml`;
		FileSystem.unlinkSync(path);
	} else {
		character.send("Character deletion cancelled.\n\r");
		delete character.Flags["ConfirmDelete"];
	}
}

function DoWhere(character, args) {
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

const Player = require("./Player");
const SkillSpell = require("./SkillSpell");const ItemData = require("./ItemData");
const Utility = require("./Utility");

