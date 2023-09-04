const Settings = require("./Settings");
const Utility = require("./Utility");

class Program {
    static Programs = {};

    static ProgramTypes = {
        None: "None",
        Say: "Say",
        Open: "Open",
        Close: "Close",
        RoundCombat: "RoundCombat",
        OneHitMiss: "OneHitMiss",
        OneHitHit: "OneHitHit",
        OneHitAny: "OneHitAny",
        EnterRoom: "EnterRoom",
        ExitRoom: "ExitRoom",
        PlayerDeath: "PlayerDeath",
        SenderDeath: "SenderDeath",
        Use: "Use",
        Invoke: "Invoke",
        Give: "Give",
        Receive: "Receive",
        Wear: "Wear",
        AffectTick: "AffectTick",
        AffectEnd: "AffectEnd",
        BeforeUnlock: "BeforeUnlock",
        BeforeRelock: "BeforeRelock",
        Pulse: "Pulse",
        PulseViolence: "PulseViolence"
    }

    Flags = [];

    constructor() {
        
    }

    Execute(sender, victim, item, skill, affect, triggertype, args) {

    }

    static Execute(programname, sender, victim, item, skill, affect, triggertype, args) {
        for(var name in Program.Programs) {
            var program = Program.Programs[name];
            if(program.Name.equals(programname) && program.Flags.ISSET(triggertype)) {
                return program.Execute(sender, victim, item, skill, affect, triggertype, args);
            }
        }

        return false;
    }

    static LoadPrograms() {
        const fs = require("fs");

        var path = Settings.DataPath + "/programs";

        var paths = fs.readdirSync(path);

        for(var programpath of paths) {
            if(programpath.endsWith(".js")) {
                var program = require("../" + path + "/" + programpath);
            }
        }
    }
}

module.exports = Program;