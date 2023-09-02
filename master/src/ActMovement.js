const Character = require("./Character");
const RoomData = require("./RoomData");
const ItemData = require("./ItemData");

function movechar(player, direction) {
	if (player.Position != "Standing")
	{
		if (player.Position == "Dead")
		{
			player.send("Lie still; you are DEAD.\n\r");
		}
		else if (player.Position == "Incapacitated")
		{
			player.send("You are hurt far too bad for that.\n\r");
		}
		else if (player.Position == "Stunned")
		{
			player.send("You are too stunned to do that.\n\r");
		}
		else if (player.Position == "Resting")
		{
			player.send("Nah... You feel too relaxed...\n\r");
		}
		else if (player.Position == "Sitting")
		{
			player.send("Better stand up first.\n\r");
		}
		else if (player.Position == "Fighting")
		{
			player.send("No way! You are still fighting!\n\r");
		}
		else
		{
			player.send("You aren't in the right position?\n\r");
		}
		return;
	}

	// Check if character is currently in combat
	if (this.Fighting)
	{
		SendToChar("No way! You are still fighting!\n\r");
		return;
	}
	var exit = player.Room.Exits[direction];
	if(player.Room && exit && 
		exit.Destination && 
		(!exit.Flags.Closed || player.AffectedBy.PassDoor)) {
		var sizes = ["Tiny", "Small", "Medium", "Large", "Huge", "Giant"];
		if (sizes.indexOf(this.Size) > sizes.indexOf(exit.ExitSize))
		{
			send("You can't fit.\n\r");
			return;
		}
		var destination = exit.Destination;
		var reversedirections = ["south", "west", "north", "east", "below", "above" ];
		var room = player.Room;
		var directionstring = RoomData.Directions[direction];
		player.Act("$n leaves " + directionstring + ".", null, null, null, "ToRoom");
		player.RemoveCharacterFromRoom();
		player.AddCharacterToRoom(room.Exits[direction].Destination);
		var reversedirection = reversedirections[direction];
		if(reversedirection != "below" && reversedirection != "above")
			player.Act("$n arrives from the " + reversedirection + ".", null, null, null, "ToRoom");
		else
			player.Act("$n arrives from " + reversedirection + ".", null, null, null, "ToRoom");
	}
	else
		player.send("Alas, you cannot go that way.\n\r");
}

function donorth(player, arguments) {
	movechar(player, 0);
}

function doeast(player, arguments) {
	movechar(player, 1);
}

function dosouth(player, arguments) {
	movechar(player, 2);
}

function dowest(player, arguments) {
	movechar(player, 3);
}

function doup(player, arguments) {
	movechar(player, 4);
}

function dodown(player, arguments) {
	movechar(player, 5);
}



function DoOpen(character, args) {
	var item, count;
	var [exit, count] = character.Room.GetExit(args, count);
	var [item, count] = character.GetItemHere(args, count);
	
	if(exit) {
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
	
	if(exit) {
		

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
	
	if(exit) {
		

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
	
	if(exit) {
		

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