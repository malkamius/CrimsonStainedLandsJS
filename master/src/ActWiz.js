const AreaData = require("./AreaData");
const Character = require("./Character");

const Combat = require("./Combat");
const RoomData = require("./RoomData");

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
    var [victim, count] = Character.CharacterFunctions.GetCharacterHere(character, args, 0);

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
        [target] = Character.CharacterFunctions.GetCharacterList(ch, Character.Characters, args);
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
		ch.Act("$n steps into a cloud of smoke.\n\r", null, null, null, Character.ActType.ToRoom);

		// Remove the character from the current room
		ch.RemoveCharacterFromRoom();

		// Send a message to the character indicating the successful recall
		ch.send("You goto {0} [{1}].\n\r", room.Name, room.VNum);

		// Add the character to the recall room
		ch.AddCharacterToRoom(room);
		
		// Display a message to the room indicating the character's arrival
		ch.Act("$n steps out of a cloud of smoke.\n\r", null, null, null, Character.ActType.ToRoom);

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
	
    [target] = Character.CharacterFunctions.GetCharacterList(ch, Character.Characters, args);
       
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