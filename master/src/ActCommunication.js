const Character = require("./Character");
const Utility = require("./Utility");

Character.DoCommands.DoSay = function(character, args) {
    Character.CaptureCommunications = true;
	character.Act("\\y$n says '{0}\\x\\y'\\x\n", null, null, null, Character.ActType.ToRoom, args);
	character.send("\\yYou say '{0}\\x\\y'\\x\n", args);
    Character.CaptureCommunications = false;
}

Character.DoCommands.DoSayTo = function(character, args, to = null) {
    var name;
    if(to && args.ISEMPTY()) {
        character.send("Say what to who?\n\r");
        name = to.name;
    } else if(!to) {
        [name, args] = args.OneArgument();
    }
    if((!to && name.ISEMPTY()) || args.ISEMPTY()) {
        character.send("Say what to who?\n\r");
        return;
    } 
    if(!to) [to] = character.GetCharacterHere(name);

    if(!to) {
        character.send("You don't see them here.\n\r");
    } else if(to == character) {
        Character.CaptureCommunications = true;
	    character.Act("\\y$n says to $mself '{0}\\x\\y'\\x\n", to, null, null, Character.ActType.ToRoom, args);
	    character.Act("\\yYou say to yourself '{0}\\x\\y'\\x\n", to,  null, null, Character.ActType.ToChar, args);
        Character.CaptureCommunications = false;
    } else {
        Character.CaptureCommunications = true;
        character.Act("\\y$n says to you '{0}\\x\\y'\\x\n", to, null, null, Character.ActType.ToVictim, args);
	    character.Act("\\y$n says to $N '{0}\\x\\y'\\x\n", to, null, null, Character.ActType.ToRoomNotVictim, args);
	    character.Act("\\yYou say to $N '{0}\\x\\y'\\x\n", to,  null, null, Character.ActType.ToChar, args);
        Character.CaptureCommunications = false;
    }
}

Character.DoCommands.DoYell = function(character, args) {
    Character.CaptureCommunications = true;
	for (const othercharacter of Character.Characters) {
		if(othercharacter != character && othercharacter.Room && othercharacter.Room.Area == character.Room.Area) {
			character.Act("\\r$n yells '{0}\\x\\r'\\x\n", othercharacter, null, null, Character.ActType.ToVictim, args);
		}
	}

	character.send("\\rYou yell '{0}\\x\\r'\\x\n", args);
    Character.CaptureCommunications = false;
}

Character.DoCommands.DoWhisper = function(character, args) {
    Character.CaptureCommunications = true;
	character.Act("\\R$n whispers '{0}\\x\\R'\\x\n", null, null, null, Character.ActType.ToRoom, args);
	character.send("\\RYou whisper '{0}\\x\\R'\\x\n", args);
    Character.CaptureCommunications = false;
}

Character.DoCommands.DoWhisperTo = function(character, args, to = null) {
    var name;
    if(to && args.ISEMPTY()) {
        character.send("Whisper what to who?\n\r");
        name = to.name;
    } else if(!to) {
        [name, args] = args.OneArgument();
    }
    if((!to && name.ISEMPTY()) || args.ISEMPTY()) {
        character.send("Whisper what to who?\n\r");
        return;
    } 
    if(!to) [to] = character.GetCharacterHere(name);

    if(!to) {
        character.send("You don't see them here.\n\r");
    } else if(to == character) {
        Character.CaptureCommunications = true;
	    character.Act("\\R$n whispers to $mself '{0}\\x\\R'\\x\n", to, null, null, Character.ActType.ToRoom, args);
	    character.Act("\\RYou whisper to yourself '{0}\\x\\R'\\x\n", to,  null, null, Character.ActType.ToChar, args);
        Character.CaptureCommunications = false;
    } else {
        Character.CaptureCommunications = true;
        character.Act("\\R$n whispers to you '{0}\\x\\R'\\x\n", to, null, null, Character.ActType.ToVictim, args);
	    character.Act("\\R$n whispers to $N '{0}\\x\\R'\\x\n", to, null, null, Character.ActType.ToRoomNotVictim, args);
	    character.Act("\\RYou whisper to $N '{0}\\x\\R'\\x\n", to,  null, null, Character.ActType.ToChar, args);
        Character.CaptureCommunications = false;
    }
}

Character.DoCommands.DoTell = function(character, args, to = null) {
    var name;
    if(to && args.ISEMPTY()) {
        character.send("Tell who what?\n\r");
        name = to.name;
    } else if(!to) {
        [name, args] = args.OneArgument();
    }
    if((!to && name.ISEMPTY()) || args.ISEMPTY()) {
        character.send("Tell who what?\n\r");
        return;
    } 
    if(!to) [to] = character.GetCharacterWorld(name);

    if(!to) {
        character.send("You don't see them here.\n\r");
    } else if(!to.socket || to.socket.isdestroyed || to.inanimate) {
        character.send("They can't hear you.\n\r");
    } else {
        to.ReplyTo = character;
        Character.CaptureCommunications = true;
	    character.Act("\\RYou tell $N '{0}\\x\\R'\\x\n", to,  null, null, Character.ActType.ToChar, args);
        character.Act("\\R$n tells you '{0}\\x\\R'\\x\n", to, null, null, Character.ActType.ToVictim, args);
        Character.CaptureCommunications = false;
    }
}

Character.DoCommands.DoReply = function(character, args) {
    var to = character.ReplyTo;

    if(!to) {
        character.send("You have no reply to set.\n\r");
    } else if(!args || args.ISEMPTY()) {
        character.send("Reply with what?\n\r");
    } else if(!to.socket || to.socket.isdestroyed || to.inanimate) {
        character.send("They can't hear you.\n\r");
    } else {
        to.ReplyTo = character;
        Character.CaptureCommunications = true;
	    character.Act("\\RYou tell $N '{0}\\x\\R'\\x\n", to,  null, null, Character.ActType.ToChar, args);
        character.Act("\\R$n tells you '{0}\\x\\R'\\x\n", to, null, null, Character.ActType.ToVictim, args);
        Character.CaptureCommunications = false;
    }
}

Character.DoCommands.DoGroupTell = function(character, args) {
    if(!args || args.ISEMPTY()) {
        character.send("Tell the group what?\n\r");
    } else {
        var any = false;
        Character.CaptureCommunications = true;
        character.send("\\MYou tell the group '{0}\\x\\M'\\x\n\r", args);
        for(var member of Character.Characters) {
            if(member != character && member.IsSameGroup(character)) {
                character.Act("\\M$n tells the group '{0}\\x\\M'\\x\n\r", member, null, null, Character.ActType.ToVictim, args);
                any = true;
            }
        } 
        Character.CaptureCommunications = false;
        if(!any) character.send("No one heard you.\n\r");
    }
}

Character.DoCommands.DoPray = function(character, args) {
    Character.CaptureCommunications = true;
	for (const othercharacter of Character.Characters) {
		if(othercharacter != character && othercharacter.status == "Playing" && othercharacter.IsImmortal) {
			character.Act("\\r$n prays '{0}\\x\\r'\\x", othercharacter, null, null, Character.ActType.ToVictim, args);
		}
	}
    Character.CaptureCommunications = false;
	character.send("\\rYou pray to the gods!\\x\n\r");
}

Character.DoCommands.DoNewbie = function(character, args) {
    if(args.ISEMPTY()) {
        if(character.Flags.ISSET(Character.ActFlags.NewbieChannel)) {
            character.Flags.RemoveFlag(Character.ActFlags.NewbieChannel);
        } else {
            character.Flags.SETBIT(Character.ActFlags.NewbieChannel);
        }

        character.send("Newbie channel is {0}.\n\r", character.Flags.ISSET(Character.ActFlags.NewbieChannel)? "\\gON\\x" : "\\rOFF\\x");
    } else {
        Character.CaptureCommunications = true;
        character.send("\\cNEWBIE (You): {0}\\x\n\r", args);

        for (const othercharacter of Character.Characters) {
            if(othercharacter != character && othercharacter.status == "Playing" && othercharacter.Flags.ISSET(Character.ActFlags.NewbieChannel)) {
                character.Act("\\cNEWBIE ($n): {0}\\x", othercharacter, null, null, Character.ActType.ToVictim, args);
            }
        }
        Character.CaptureCommunications = false;
    }
	
}

Character.DoCommands.DoOOC = function(character, args) {
    if(args.ISEMPTY()) {
        if(character.Flags.ISSET(Character.ActFlags.OOCChannel)) {
            character.Flags.RemoveFlag(Character.ActFlags.OOCChannel);
        } else {
            character.Flags.SETBIT(Character.ActFlags.OOCChannel);
        }

        character.send("OOC channel is {0}.\n\r", character.Flags.ISSET(Character.ActFlags.OOCChannel)? "\\gON\\x" : "\\rOFF\\x");
    } else {
        Character.CaptureCommunications = true;
        character.send("\\rOOC (You): {0}\\x\n\r", args);

        for (const othercharacter of Character.Characters) {
            if(othercharacter != character && othercharacter.status == "Playing" && othercharacter.Flags.ISSET(Character.ActFlags.OOCChannel)) {
                character.Act("\\rOOC ($n): {0}\\x", othercharacter, null, null, Character.ActType.ToVictim, args);
            }
        }
        Character.CaptureCommunications = false;
    }
	
}

Character.DoCommands.DoGeneral = function(character, args) {
    if(args.ISEMPTY()) {
        if(character.Flags.ISSET(Character.ActFlags.GeneralChannel)) {
            character.Flags.RemoveFlag(Character.ActFlags.GeneralChannel);
        } else {
            character.Flags.SETBIT(Character.ActFlags.GeneralChannel);
        }

        character.send("General channel is {0}.\n\r", character.Flags.ISSET(Character.ActFlags.GeneralChannel)? "\\gON\\x" : "\\rOFF\\x");
    } else {
        Character.CaptureCommunications = true;
        character.send("\\WGENERAL (You): {0}\\x\n\r", args);

        for (const othercharacter of Character.Characters) {
            if(othercharacter != character && othercharacter.status == "Playing" && othercharacter.Flags.ISSET(Character.ActFlags.GeneralChannel)) {
                character.Act("\\WGENERAL ($n): {0}\\x", othercharacter, null, null, Character.ActType.ToVictim, args);
            }
        }
        Character.CaptureCommunications = false;
    }	
}

Character.DoCommands.DoImmortal = function(character, args) {
    if(args.ISEMPTY()) {
        character.send("Say what on the immortal channel?\n\r");
    } else {
        Character.CaptureCommunications = true;
        character.send("\\WIMMORTAL :: (You): {0}\\x\n\r", args);

        for (const othercharacter of Character.Characters) {
            if(othercharacter != character && othercharacter.status == "Playing" && othercharacter.IsImmortal) {
                character.Act("\\WIMMORTAL :: ($n): {0}\\x", othercharacter, null, null, Character.ActType.ToVictim, args);
            }
        }
        Character.CaptureCommunications = false;
    }	
}

Character.DoCommands.DoReplay = function(character, args) {
    if(character.Communications) {
        character.send("Last {0} communications:\n\r", character.Communications.length)
        for(var comm of character.Communications)
            character.send(comm);
    }
}