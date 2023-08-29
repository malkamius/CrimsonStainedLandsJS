const Character = require("./Character");

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