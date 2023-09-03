const Character = require("./Character");
const Utility = require("./Utility");

Character.DoCommands.DoSay = function(character, args) {
	character.Act("\\y$n says '{0}\\x\\y'\\x\n", null, null, null, Character.ActType.ToRoom, args);
	character.send("\\yYou say '{0}\\x\\y'\\x\n", args);
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
    if(!to) [to] = Character.CharacterFunctions.GetCharacterHere(character, name);

    if(!to) {
        character.send("You don't see them here.\n\r");
    } else if(to == character) {
	    character.Act("\\y$n says to $mself '{0}\\x\\y'\\x\n", to, null, null, Character.ActType.ToRoom, args);
	    character.Act("\\yYou say to yourself '{0}\\x\\y'\\x\n", to,  null, null, Character.ActType.ToChar, args);
    } else {
        character.Act("\\y$n says to you '{0}\\x\\y'\\x\n", to, null, null, Character.ActType.ToVictim, args);
	    character.Act("\\y$n says to $N '{0}\\x\\y'\\x\n", to, null, null, Character.ActType.ToRoomNotVictim, args);
	    character.Act("\\yYou say to $N '{0}\\x\\y'\\x\n", to,  null, null, Character.ActType.ToChar, args);
    }
}

Character.DoCommands.DoYell = function(character, args) {
	for (const othercharacter of Character.Characters) {
		if(othercharacter.Room && othercharacter.Room.Area == character.Room.Area) {
			character.Act("\\r$n yells '{0}\\x\\r'\\x\n", othercharacter, null, null, Character.ActType.ToVictim, args);
		}
	}

	character.send("\\rYou yell '{0}\\x\\r'\\x\n", args);
}

Character.DoCommands.DoWhisper = function(character, args) {
	character.Act("\\R$n whispers '{0}\\x\\R'\\x\n", null, null, null, Character.ActType.ToRoom, args);
	character.send("\\RYou whisper '{0}\\x\\R'\\x\n", args);
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
    if(!to) [to] = Character.CharacterFunctions.GetCharacterHere(character, name);

    if(!to) {
        character.send("You don't see them here.\n\r");
    } else if(to == character) {
	    character.Act("\\R$n whispers to $mself '{0}\\x\\R'\\x\n", to, null, null, Character.ActType.ToRoom, args);
	    character.Act("\\RYou whisper to yourself '{0}\\x\\R'\\x\n", to,  null, null, Character.ActType.ToChar, args);
    } else {
        character.Act("\\R$n whispers to you '{0}\\x\\R'\\x\n", to, null, null, Character.ActType.ToVictim, args);
	    character.Act("\\R$n whispers to $N '{0}\\x\\R'\\x\n", to, null, null, Character.ActType.ToRoomNotVictim, args);
	    character.Act("\\RYou whisper to $N '{0}\\x\\R'\\x\n", to,  null, null, Character.ActType.ToChar, args);
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
    if(!to) [to] = Character.CharacterFunctions.GetCharacterList(character, Character.Characters, name);

    if(!to) {
        character.send("You don't see them here.\n\r");
    } else if(!to.socket || to.socket.isdestroyed || to.inanimate) {
        character.send("They can't hear you.\n\r");
    } else {
        to.ReplyTo = character;
	    character.Act("\\RYou tell $N '{0}\\x\\R'\\x\n", to,  null, null, Character.ActType.ToChar, args);
        character.Act("\\R$n tells you '{0}\\x\\R'\\x\n", to, null, null, Character.ActType.ToVictim, args);

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
	    character.Act("\\RYou tell $N '{0}\\x\\R'\\x\n", to,  null, null, Character.ActType.ToChar, args);
        character.Act("\\R$n tells you '{0}\\x\\R'\\x\n", to, null, null, Character.ActType.ToVictim, args);
    }
}

Character.DoCommands.DoGroupTell = function(character, args) {
    if(!args || args.ISEMPTY()) {
        character.send("Tell the group what?\n\r");
    } else {
        var any = false;
        character.send("\\MYou tell the group '{0}\\x\\M'\\x\n\r", args);
        for(var member of Character.Characters) {
            if(member != character && member.IsSameGroup(character)) {
                character.Act("\\M$n tells the group '{0}\\x\\M'\\x\n\r", member, null, null, Character.ActType.ToVictim, args);
                any = true;
            }
        } 
        if(!any) character.send("No one heard you.\n\r");
    }
}