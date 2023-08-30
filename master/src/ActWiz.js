const Character = require("./Character");

const Combat = require("./Combat");

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