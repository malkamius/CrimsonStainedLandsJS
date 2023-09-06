const Character = require("./Character");
const RoomData = require("./RoomData");
const ItemData = require("./ItemData");
const AffectData = require("./AffectData");

function movechar(character, direction, crawl = false, creep = false, sendWalkMessage = true, first = true, movementCost = 0, movementWait = 0) {
	const Utility = require("./Utility");
	if (character.Position != "Standing")
	{
		if (character.Position == "Dead")
		{
			character.send("Lie still; you are DEAD.\n\r");
		}
		else if (character.Position == "Incapacitated")
		{
			character.send("You are hurt far too bad for that.\n\r");
		}
		else if (character.Position == "Stunned")
		{
			character.send("You are too stunned to do that.\n\r");
		}
		else if (character.Position == "Resting")
		{
			character.send("Nah... You feel too relaxed...\n\r");
		}
		else if (character.Position == "Sitting")
		{
			character.send("Better stand up first.\n\r");
		}
		else if (character.Position == "Fighting")
		{
			character.send("No way! You are still fighting!\n\r");
		}
		else
		{
			character.send("You aren't in the right position?\n\r");
		}
		return;
	}

	// Check if character is currently in combat
	if (this.Fighting)
	{
		character.send("No way! You are still fighting!\n\r");
		return;
	}
	var exit = character.Room.Exits[direction];
	var wasinroom = character.Room;

	if(wasinroom && exit && 
		exit.Destination && 
		(!exit.Flags.Closed || character.AffectedBy.PassDoor) &&
		(!exit.Flags.Window || crawl)) {
		
		var destination = exit.Destination;
		var sizes = ["Tiny", "Small", "Medium", "Large", "Huge", "Giant"];
		if (sizes.indexOf(this.Size) > sizes.indexOf(exit.ExitSize))
		{
			send("You can't fit.\n\r");
			return;
		}

		if (!character.IsNPC)
		{
			const SkillSpell = require("./SkillSpell");
			var trackskill = SkillSpell.SkillLookup("track");
			var trackAffect = wasinroom.Affects.FirstOrDefault(aff => aff.SkillSpell == trackskill && aff.OwnerName == character.Name);
			if (trackAffect)
			{
				trackAffect.Modifier = direction;
			}
			else
			{
				trackAffect = new AffectData();
				trackAffect.Duration = -1
				trackAffect.OwnerName = character.Name, 
				trackAffect.SkillSpell = trackskill;
				trackAffect.Modifier = direction;
				wasinroom.Affects.unshift(trackAffect);
			}
		}
		var sector = RoomData.Sectors[wasinroom.Sector];
		var checkpathfinding = false;
		if (movementCost == 0 && sector)
		{
			checkpathfinding = true;
			movementCost = sector.MovementCost;
		}
		if (movementWait == 0 && sector)
			movementWait = sector.MovementWait;

		if (!character.IsNPC && character.MovementPoints < movementCost)
		{
			character.send("You can barely feel your feet!\n\r");
			return;
		}

		if ((wasinroom.Sector == RoomData.SectorTypes.Air || destination.Sector == RoomData.SectorTypes.Air) && !character.IsAffected(AffectData.AffectFlags.Flying))
		{
			send("You can't fly.\n\r");
			return;
		}

		if (creep && (!destination.IsWilderness || destination.IsWater))
		{
			send("There's no cover there.\n\r");
			return;
		}
		var boatequipped = false;

		for(var key in character.Equipment) {
			var item = character.Equipment[key];
			if(item && item.ItemTypes.ISSET(ItemData.ItemTypes.Boat)) {
				boatequipped = true;
				break;
			}
		}
		
		if (destination.IsWater &&
			!character.IsAffected(AffectData.AffectFlags.Flying) &&
			!character.IsAffected(AffectData.AffectFlags.Swim) &&
			!character.IsAffected(AffectData.AffectFlags.WaterBreathing) &&
			!character.Inventory.FirstOrDefault(b => b.ItemTypes.ISSET(ItemData.ItemTypes.Boat)) &&
			!boatequipped)
		{
			send("You need a boat to go there.\n\r");
			return;
		}

		// Check if movement through underwater sectors requires swimming or water breathing
		if (destination.Sector == RoomData.SectorTypes.Underwater &&
			!character.IsAffected(AffectData.AffectFlags.Swim) &&
			!character.IsAffected(AffectData.AffectFlags.WaterBreathing))
		{
			send("You need water breathing to go there.\n\r");
			return;
		}

		// Deduct movement points and apply movement wait
		if (!character.IsNPC)
		{
			var chance = 0;
			if (checkpathfinding && wasinroom.Sector != RoomData.SectorTypes.City && wasinroom.Sector != RoomData.SectorTypes.Inside &&
				(chance = character.GetSkillPercentage("path finding")) > 1 && chance >= Utility.NumberPercent())
			{
				character.CheckImprove("path finding", true, 1);
				movementCost /= 2;
				movementWait /= 2;
			}
			else if (checkpathfinding && wasinroom.Sector != RoomData.SectorTypes.City && wasinroom.Sector != RoomData.SectorTypes.Inside && chance > 1)
			{
				character.CheckImprove("path finding", false, 1);
			}

			character.MovementPoints -= movementCost;
		}

		if (!character.IsAffected(AffectData.AffectFlags.FastRunning))
			character.WaitState(movementWait);
		else
			character.WaitState(movementWait / 3);

		var reversedirections = ["south", "west", "north", "east", "below", "above" ];
		var directionstring = RoomData.Directions[direction];
		character.Act("$n {0} {1}.", null, null, null, {type: Character.ActType.ToRoom, flags: {WizInvis: "WizInvis"}}, crawl? "crawls" : "leaves", directionstring);
		character.RemoveCharacterFromRoom();
		character.AddCharacterToRoom(destination);
		var reversedirection = reversedirections[direction];
		if(reversedirection != "below" && reversedirection != "above")
			character.Act("$n arrives from the " + reversedirection + ".", null, null, null, {type: Character.ActType.ToRoom, flags: {WizInvis: "WizInvis"}});
		else
			character.Act("$n arrives from " + reversedirection + ".", null, null, null, {type: Character.ActType.ToRoom, flags: {WizInvis: "WizInvis"}});
		
		// avoid circular follows
		if(wasinroom != destination) {
			for(var follower of Utility.CloneArray(wasinroom.Characters)) {
				if(follower.Following == character) {
					follower.Act("You follow $N {0}.", character, null, null, Character.ActType.ToChar, directionstring);
					movechar(follower, direction, crawl, creep);
				}
			}
		}
	}
	else
		character.send("Alas, you cannot go that way.\n\r");
}

function donorth(character, arguments) {
	movechar(character, 0);
}

function doeast(character, arguments) {
	movechar(character, 1);
}

function dosouth(character, arguments) {
	movechar(character, 2);
}

function dowest(character, arguments) {
	movechar(character, 3);
}

function doup(character, arguments) {
	movechar(character, 4);
}

function dodown(character, arguments) {
	movechar(character, 5);
}



function DoOpen(character, args) {
	var item, count;
	var [exit, count] = character.Room.GetExit(args, count);
	var [item, count] = character.GetItemHere(args, count);
	if(args.ISEMPTY()) {
		character.send("Open what?\n\r");
	} else if(exit) {
		if(exit.Flags.Locked) {
			character.Act("{0} is locked.\n\r", null, null, null, "ToChar", exit.Display);
		} else if(!exit.Flags.Closed) {
			character.Act("{0} is not closed.\n\r", null, null, null, "ToChar", exit.Display);
		} else	{
			character.Act("You open {0}.\n\r", null, null, null, "ToChar", exit.Display);
			character.Act("$n opens {0}.", null, null, null, "ToRoom", exit.Display)
			exit.Flags.RemoveFlag("Closed");
			if(exit.Destination) {
				var reversedirections = {north: 2, east: 3, south: 0, west: 1, up: 5, down: 4};
				var otherside = exit.Destination.Exits[reversedirections[exit.Direction.toLowerCase()]];
				if(otherside) {
					otherside.Flags.RemoveFlag("Closed");
					for(var other of exit.Destination.Characters) {
						if(other.Position != "Sleeping")
							other.Act("{0} opens.", null, null, null, "ToChar", otherside.Display)
					}
				}
			} 
		}
	} else if(item) {
		if(item.ExtraFlags.ISSET(ItemData.ExtraFlags.Locked)) {
			character.send("It's locked.\n\r");
		} else if(!item.ExtraFlags.ISSET(ItemData.ExtraFlags.Closed)) {
			character.send("It's not closed.\n\r")
		} else {
			character.Act("You open $p.\n\r", null, item);
			character.Act("$n opens $p.", null, item, null, "ToRoom")
			item.ExtraFlags.RemoveFlag(ItemData.ExtraFlags.Closed);
		}

	} else {
		character.send("You don't see that here.\n\r");
	}
}

function DoClose(character, args) {
	var item, count;
	var [exit, count] = character.Room.GetExit(args, count);
	var [item, count] = character.GetItemHere(args, count);
	if(args.ISEMPTY()) {
		character.send("Close what?\n\r");
	} else if(exit) {
		

		if(!exit.Flags.Door) {
			character.Act("{0} can't be closed.\n\r", null, null, null, "ToChar", exit.Display);
		} else if(exit.Flags.Closed) {
			character.Act("{0} is already closed.\n\r", null, null, null, "ToChar", exit.Display);
		} else {
			if(exit.Destination) {
				var reversedirections = {north: 2, east: 3, south: 0, west: 1, up: 5, down: 4};
				var otherside = exit.Destination.Exits[reversedirections[exit.Direction.toLowerCase()]];
				if(otherside) {
					otherside.Flags.Closed = true;
					for(var other of exit.Destination.Characters) {
						if(other.Position != "Sleeping")
							other.Act("{0} closes.", null, null, null, "ToChar", otherside.Display)
					}
				}
			} 
			
			character.send("You close {0}.\n\r", exit.Display);
			character.Act("$n closes {0}.", null, null, null, "ToRoom", exit.Display)
			exit.Flags.Closed = true;
		}
	} else if(item) {
		if(!item.ExtraFlags.ISSET(ItemData.ExtraFlags.Closable)) {
			character.Act("$p can't be closed.\n\r", null, item);
		} else if(item.ExtraFlags.ISSET(ItemData.ExtraFlags.Closed)) {
			character.Act("$p is already closed.\n\r", null, item);
		} else {
			character.Act("You close $p.\n\r", null, item);
			character.Act("$n closes $p.", null, item, null, "ToRoom")
			item.ExtraFlags.SETBIT(ItemData.ExtraFlags.Closed);
		}
	}  else {
		character.send("You don't see that here.\n\r");
	}
	
}

function DoUnlock(character, args) {
	var item, count;
	var [exit, count] = character.Room.GetExit(args, count);
	var [item, count] = character.GetItemHere(args, count);
	if(args.ISEMPTY()) {
		character.send("Unlock what?\n\r");
	} else if(exit) {
		

		if(!exit.Flags.ISSET("Closed")) {
			character.Act("{0} isn't closed.\n\r", null, null, null, "ToChar", exit.Display);
		} else if(!exit.Flags.ISSET("Locked")) {
			character.Act("{0} isn't locked.\n\r", null, null, null, "ToChar", exit.Display);
		} else {
			var hasKey = false;
			for(var keyvnum of exit.Keys) {
				for(var potentialkey of character.Inventory) {
					if(potentialkey && potentialkey.VNum == keyvnum) {
						hasKey = true;
					}
				}

				for(var potentialkeykey in character.Equipment) {
					potentialkey = character.Equipment[potentialkeykey];
					if(potentialkey && potentialkey.VNum == keyvnum) {
						hasKey = true;
					}
				}
			}

			if(exit.Keys.length == 0) {
				character.send("{0} can't be locked.", exit.Display);
			} else if(!hasKey) {
				character.send("You don't have the key for that.\n\r");
			} else {
				if(exit.Destination) {
					var reversedirections = {north: 2, east: 3, south: 0, west: 1, up: 5, down: 4};
					var otherside = exit.Destination.Exits[reversedirections[exit.Direction.toLowerCase()]];
					if(otherside) {
						otherside.Flags.RemoveFlag("Locked");
						for(var other of exit.Destination.Characters) {
							if(other.Position != "Sleeping")
								other.Act("You hear a clicking noise from {0}.", null, null, null, "ToChar", otherside.Display)
						}
					}
				} 
				
				character.send("You unlock {0}.\n\r", exit.Display);
				character.Act("$n unlocks {0}.", null, null, null, "ToRoom", exit.Display)
				exit.Flags.RemoveFlag("Locked");
			}
		}
	} else if(item) {
		if(!item.ExtraFlags.ISSET(ItemData.ExtraFlags.Closed)) {
			character.Act("$p isn't closed.\n\r", null, item);
		} else if(!item.ExtraFlags.ISSET(ItemData.ExtraFlags.Locked)) {
			character.Act("$p isn't locked.\n\r", null, item);
		} else {
			var hasKey = false;
			for(var keyvnum of item.Keys) {
				for(var potentialkey of character.Inventory) {
					if(potentialkey && potentialkey.VNum == keyvnum) {
						hasKey = true;
					}
				}

				for(var potentialkeykey in character.Equipment) {
					potentialkey = character.Equipment[potentialkeykey];
					if(potentialkey && potentialkey.VNum == keyvnum) {
						hasKey = true;
					}
				}
			}

			if(exit.Keys.length == 0) {
				character.send("{0} can't be locked.", exit.Display);
			} else if(!hasKey) {
				character.send("You don't have the key for that.\n\r");
			} else {
				character.Act("You unlock $p.\n\r", null, item);
				character.Act("$n unlocks $p.", null, item, null, "ToRoom")
				item.ExtraFlags.SETBIT(ItemData.ExtraFlags.Closed);
			}
		}
	}  else {
		character.send("You don't see that here.\n\r");
	}
}

function DoLock(character, args) {
	var item, count;
	var [exit, count] = character.Room.GetExit(args, count);
	var [item, count] = character.GetItemHere(args, count);
	if(args.ISEMPTY()) {
		character.send("Lock what?\n\r");
	} else if(exit) {
		

		if(!exit.Flags.ISSET("Closed")) {
			character.Act("{0} isn't closed.\n\r", null, null, null, "ToChar", exit.Display);
		} else if(exit.Flags.ISSET("Locked")) {
			character.Act("{0} is already locked.\n\r", null, null, null, "ToChar", exit.Display);
		} else {
			var hasKey = false;
			for(var keyvnum of exit.Keys) {
				for(var potentialkey of character.Inventory) {
					if(potentialkey && potentialkey.VNum == keyvnum) {
						hasKey = true;
					}
				}

				for(var potentialkeykey in character.Equipment) {
					potentialkey = character.Equipment[potentialkeykey];
					if(potentialkey && potentialkey.VNum == keyvnum) {
						hasKey = true;
					}
				}
			}

			if(exit.Keys.length == 0) {
				character.send("{0} can't be locked.", exit.Display);
			} else if(!hasKey) {
				character.send("You don't have the key for that.\n\r");
			} else {
				if(exit.Destination) {
					var reversedirections = {north: 2, east: 3, south: 0, west: 1, up: 5, down: 4};
					var otherside = exit.Destination.Exits[reversedirections[exit.Direction.toLowerCase()]];
					if(otherside) {
						otherside.Flags.SETBIT("Locked");
						for(var other of exit.Destination.Characters) {
							if(other.Position != "Sleeping")
								other.A
							ct("You hear a clicking noise from {0}.", null, null, null, "ToChar", otherside.Display)
						}
					}
				} 
				
				character.send("You lock {0}.\n\r", exit.Display);
				character.Act("$n locks {0}.", null, null, null, "ToRoom", exit.Display)
				exit.Flags.SETBIT("Locked");
			}
		}
	} else if(item) {
		if(!item.ExtraFlags.ISSET(ItemData.ExtraFlags.Closed)) {
			character.Act("$p isn't closed.\n\r", null, item);
		} else if(item.ExtraFlags.ISSET(ItemData.ExtraFlags.Locked)) {
			character.Act("$p is already locked.\n\r", null, item);
		} else {
			var hasKey = false;
			for(var keyvnum of item.Keys) {
				for(var potentialkey of character.Inventory) {
					if(potentialkey && potentialkey.VNum == keyvnum) {
						hasKey = true;
					}
				}

				for(var potentialkeykey in character.Equipment) {
					potentialkey = character.Equipment[potentialkeykey];
					if(potentialkey && potentialkey.VNum == keyvnum) {
						hasKey = true;
					}
				}
			}

			if(exit.Keys.length == 0) {
				character.send("{0} can't be locked.", exit.Display);
			} else if(!hasKey) {
				character.send("You don't have the key for that.\n\r");
			} else {
				character.Act("You lock $p.\n\r", null, item);
				character.Act("$n locks $p.", null, item, null, "ToRoom")
				item.ExtraFlags.SETBIT(ItemData.ExtraFlags.Locked);
			}
		}
	}  else {
		character.send("You don't see that here.\n\r");
	}
}

Character.DoCommands.DoFollow = function(ch,args)
{
	var count = 0;
	var follow = null;
	if(args.ISEMPTY()) {
		ch.send("Follow who?\n\r");
	} else if (args.equals("self") || ([follow, count] = ch.GetCharacterHere(args)) && follow == ch) {
		if (ch.Following)
		{
			ch.send("You stop following " + (ch.Following.Display(ch)) + ".\n\r");
			ch.Following.send(ch.Display(ch.Following) + " stops following you.\n\r");

			for(var other of Character.Characters)
			{
				if (other.Leader == ch.Leader && other != ch)
				{
					other.Act("$N leaves the group.", ch);
				}
			}

			ch.Following = null;
			ch.Leader = null;
		}
		else
			ch.send("You aren't following anybody.\n\r");
	}
	else if (follow)
	{
		if (ch.Following)
		{
			if(ch.Following.Leader == ch.Leader) {
				for(var other of Character.Characters)
				{
					if (other.Leader == ch.Leader && other != ch)
					{
						other.Act("$N leaves the group.", ch);
					}
				}
				ch.Leader = null;
			}
			ch.Following.send(ch.Display(ch.Following) + " stops following you.\n\r");
		}

		if (follow.Flags.ISSET(Character.ActFlags.NoFollow))
		{
			ch.send("They don't allow followers.\n\r");
		}
		else
		{
			ch.Leader = null;
			ch.Following = follow;
			ch.send("You start following " + (follow.Display(ch)) + ".\n\r");
			ch.Act("$n begins following $N.", follow, null, null, Character.ActType.ToRoomNotVictim);
			follow.send(ch.Display(follow) + " starts following you.\n\r");
		}
	}
	else
		ch.send("You don't see them here.\n\r");
}

Character.DoCommands.DoNoFollow = function(ch, args)
{
	if (!ch.Flags.ISSET(Character.ActFlags.NoFollow))
	{
		ch.Flags.SETBIT(Character.ActFlags.NoFollow);
		ch.NoFollow(args.equals("all"));
	}
	else
	{
		ch.Flags.RemoveFlag(Character.ActFlags.NoFollow);
		ch.send("You now allow followers.\n\r");
	}
}

Character.DoCommands.DoGroup = function(ch, args)
{
	var groupWith = null;
	var count = 0;

	if (!args || args.ISEMPTY())
	{
		var groupLeader = ch.Leader || ch;
		var members = "";
		var percentHP;
		var percentMana;
		var percentMove;

		percentHP = groupLeader.HitPoints / groupLeader.MaxHitPoints * 100;
		percentMana = groupLeader.ManaPoints / groupLeader.MaxManaPoints * 100;
		percentMove = groupLeader.MovementPoints / groupLeader.MaxMovementPoints * 100;

		members += "Group leader: " + groupLeader.Display(ch).padEnd(20) + " Lvl " + groupLeader.Level + " " + percentHP.toFixed(2) + "%hp " + percentMana.toFixed(2) + "%m " + percentMove.toFixed(2) + "%mv\n\r";
		for (var member of Character.Characters)
		{
			if (member == groupLeader)
				continue;
			else if(member.Leader != groupLeader) continue;

			percentHP = member.HitPoints / member.MaxHitPoints * 100;
			percentMana = member.ManaPoints / member.MaxManaPoints * 100;
			percentMove = member.MovementPoints / member.MaxMovementPoints * 100;


			members += "              " + member.Display(ch).padEnd(20) + " Lvl " + member.Level + " " + percentHP.toFixed(2) + "%hp " + percentMana.toFixed(2) + "%m " + percentMove.toFixed(2) + "%mv\n\r";
		}

		ch.send(members);
		// }
		// else
		// 	ch.send("You aren't in a group.\n\r");
	}
	else if (!ch.IsAwake)
	{
		ch.send("In your dreams, or what?\n\r");
		return;
	}
	else if (args.equals("self") || ([groupWith] = ch.GetCharacterHere(args)) && groupWith == ch)
	{
		ch.send("You can't group with yourself.\n\r");
	}
	else if (groupWith != null)
	{
		if (ch.Leader && ch.Leader != ch)
		{
			ch.send("You aren't the group leader.\n\r");
		}
		else if (groupWith.Following != ch)
			ch.send("They aren't following you.\n\r");
		else if (groupWith.Leader == ch)
		{
			groupWith.Leader = null;
			ch.send("You remove " + groupWith.Display(ch) + " from the group.\n\r");
			ch.Act("$n removes $N from their group.\n\r", groupWith, null, null, Character.ActType.ToRoomNotVictim);
			groupWith.send(ch.Display(groupWith) + " removes you from the group.\n\r");
		}
		else
		{
			groupWith.Leader = ch;
			ch.send("You add " + (groupWith.Display(ch)) + " to the group.\n\r");
			ch.Act("$n adds $N to their group.", groupWith, null, null, Character.ActType.ToRoomNotVictim);
			groupWith.send(ch.Display(groupWith) + " adds you to the group.\n\r");
		}
	}
}

Character.DoCommands.DoRecall = function(ch, args)
{
	// Get the recall room for the character
	var room = ch.GetRecallRoom();

	if (room)
	{
		// If a valid recall room is found, perform the recall action

		// Display a message to the room indicating the character's prayer
		ch.Act("$n prays for transportation and disappears.\n\r", null, null, null, Character.ActType.ToRoom);

		// Remove the character from the current room
		ch.RemoveCharacterFromRoom();

		// Send a message to the character indicating the successful recall
		ch.send("You pray for transportation to your temple.\n\r");

		// Add the character to the recall room
		ch.AddCharacterToRoom(room);
		
		// Display a message to the room indicating the character's arrival
		ch.Act("$n appears before the altar.\n\r", null, null, null, Character.ActType.ToRoom);

		// Update the character's view with the newly arrived room
		//DoLook(ch, "auto");
	}
	else
	{
		// If the recall room is not found, send an error message to the character
		ch.send("Room not found.\n\r");
	}
}

Character.DoCommands.DoCrawl = function(character, args) {
	var [exit] = character.Room.GetExit(args);
	var direction;
	if(!exit || !exit.Flags.Window || (direction = RoomData.Directions.indexOf(exit.Direction)) == -1) {
		character.send("You can't crawl there.\n\r")
	} else {
		movechar(character, direction, true, false, true, true);
	}

}
	
Character.DoCommands.DoNorth = donorth;
Character.DoCommands.DoEast = doeast;
Character.DoCommands.DoSouth = dosouth;
Character.DoCommands.DoWest = dowest;
Character.DoCommands.DoUp = doup;
Character.DoCommands.DoDown = dodown;
Character.DoCommands.DoOpen = DoOpen;
Character.DoCommands.DoClose = DoClose;
Character.DoCommands.DoUnlock = DoUnlock;
Character.DoCommands.DoLock = DoLock;

Character.Move = movechar;