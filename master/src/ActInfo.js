const RoomData = require("./RoomData");
const AreaData = require("./AreaData");
const Character = require("./Character");
const Utitlity = require("./Utility");
const Settings = require("./Settings");
const FileSystem = require("fs");

function dosay(player, arguments) {
	player.Act("\\y$n says '{0}\\x\\y'\\x\n", null, null, null, "ToRoom", [arguments]);
	// for (const otherplayer of Player.Players) {
	// 	if (otherplayer.Name !== null && otherplayer != player) {
	// 	  player.Act("\\y$n" + ` says '${arguments}'\\x\n`, otherplayer, null, null, "ToVictim");
	// 	} 
	// }
	player.send("\\yYou say '{0}\\x\\y'\\x\n", [arguments]);
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
			if(!plain)
			player.send("--------------------------------------------------------------------------------\n\r");
			player.send("Last edited on {0} by {1}.\n\r\n\r", [help.LastEditedOn, help.LastEditedBy]);
			found = true;
		}
	}
	if(!found) player.send("No help on that.\n\r");
}

function dolook(player, arguments, auto) {
	if(player.Room == null) {
		player.send("You are not in a room.\n\r");
	} else if (!arguments || arguments.length == 0 || auto) {
		player.send(`\\c   ${player.Room.Name}\\x\n\r`);
		player.send(`${player.Room.Description}\n\r\n\r`);
		doexits(player, "");
		var items = {};
		for(const item of player.Room.Items){
			var display = item.DisplayToRoom(player);
			if(items[display])
				items[display]++;
			else
				items[display] = 1;
		}
		for(var key in items)
			player.send("   " + (items[key] > 1? ("[" + items[key] + "] ") : "") + key + "\n\r");
		for(const other of player.Room.Characters) {
			if (other != player)
				player.Act(other.GetLongDescription(), other, null, null, "ToChar");
		}
		
	} else {
		
		var targetch = Character.CharacterFunctions.GetCharacterHere(player, arguments);
		
		if(targetch)	{
			if(targetch == player) {
				player.Act("You look at yourself.", targetch, null, null, "ToChar");
				player.Act("$n looks at $mself.", targetch, null, null, "ToRoomNotVictim");
				
				player.Act(Utility.IsNullOrEmpty(targetch.Description)? "You see nothing special about yourself." : targetch.Description, targetch);
				player.Act("You are wearing: ", targetch);
			}
			else
			{
				player.Act("You look at $N.", targetch, null, null, "ToChar");
				player.Act("$n looks at $N.", targetch, null, null, "ToRoomNotVictim");
				player.Act("$n looks at you.", targetch, null, null, "ToVictim");

				player.Act(Utility.IsNullOrEmpty(targetch.Description)? "You see nothing special about $N." : targetch.Description, targetch);
				player.Act("$N is wearing: ", targetch);
			}
			var anyitems = false;
			for(var slotkey in Character.WearSlots) {
				var slot = Character.WearSlots[slotkey];
				var item = targetch.Equipment[slotkey];
				if(item) {
					player.send(slot.Slot + item.DisplayFlags(player) + item.Display(player) + "\n\r");
					anyitems = true;
				}
				
			}
			if(!anyitems)
					player.send("   nothing.\n\r");
		} else {
			player.send("You don't see them.\n\r");
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

function GetCharacterHere(player, arguments) {
	var results = GetCharacterList(player, player.Room.Characters, arguments);

	return results[0];

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
				[connection.Level,
				(connection.Guild? connection.Guild.WhoName : "   "),
				//connection.IsAFK ? "\\r(AFK)\\x" : "     ",
				"     ",
				connection == ch ? "*" : " ",
				connection.Name,
				(!Utitlity.IsNullOrEmpty(connection.Title) ? (connection.Title.startsWith(",") ? connection.Title : " " + connection.Title) : ""),
				(!Utitlity.IsNullOrEmpty(connection.ExtendedTitle) ? (!connection.ExtendedTitle.startsWith(",") ? " " : "") + connection.ExtendedTitle : "")
				]);
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

			if ((lvl < 52 || ch.IsImmortal()) || percent > 1)  //if (lvl > 0 || percent > 1 || (ch.Level > lvl && lvl > 0))
			{
				if (lvl != lastLevel)
				{
					lastLevel = lvl;
					column = 0;
					text += "\n\r";
					text += ("Lvl " + lvl + ": ").padEnd(8);
					text += "\n\r";
				}

				text += ("    " + (skill.Name + " " + (ch.Level >= lvl || percent > 1 ? percent + "%" : "N/A")).padStart(20).padEnd(25));

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

Character.DoCommands.DoSay = dosay;
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

Character.CharacterFunctions.GetCharacterHere = GetCharacterHere;
Character.CharacterFunctions.GetCharacterList = GetCharacterList;
const Player = require("./Player");
const SkillSpell = require("./SkillSpell");
