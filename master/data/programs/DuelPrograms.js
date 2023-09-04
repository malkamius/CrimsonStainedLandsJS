const Program = require("../../src/Program");
const AffectData = require("../../src/AffectData");
const Character = require("../../src/Character");
const Utility = require("../../src/Utility");

class DuelProgram extends Program {
    Flags = [ Program.ProgramTypes.AffectTick, Program.ProgramTypes.AffectEnd, Program.ProgramTypes.AffectTick ];
    
    static Instance = new DuelProgram();

    get Name() { return "DuelProgram"; }

    constructor() {
        super();

        Program.Programs[this.Name] = this;
    }

    Execute(sender, victim, item, skill, affect, triggertype, args) {
        if(triggertype == Program.ProgramTypes.AffectTick && affect.Flags.ISSET(AffectData.AffectFlags.DuelStarting)) {
            var opponent = Character.Characters.FirstOrDefault(c => !c.IsNPC && c.Name == affect.OwnerName);

            if (!opponent)
            {
                sender.send("Your opponent doesn't seem to be around any more.\n\r");
                sender.StripAffect(AffectData.AffectFlags.DuelStarting);
            } else {
                if(affect.Duration > 0)
                sender.send("Your duel starts in the span of \\r{0}\\x rounds of combat.\n\r", affect.Duration);
                else
                sender.send("Your duel starts \\RNOW\\x!\n\r");
            }
        } else if(triggertype == Program.ProgramTypes.AffectEnd && affect.Flags.ISSET(AffectData.AffectFlags.DuelStarting)) { 
            var opponent = Character.Characters.FirstOrDefault(c => !c.IsNPC && c.Name == affect.OwnerName);

            if (!opponent)
            {
                sender.send("Your opponent doesn't seem to be around any more.\n\r");
                sender.StripAffect(AffectData.AffectFlags.DuelStarting);
            }
            else {
                var newaffect = new AffectData();
                newaffect.Flags.SETBIT(AffectData.AffectFlags.DuelInProgress);
                newaffect.OwnerName = opponent.Name;
                newaffect.Duration = -1;
                newaffect.Frequency = AffectData.Frequency.Violence;
                newaffect.DisplayName = "Dueling " + newaffect.ownerName;
                newaffect.EndMessage = "Your duel has ended.";
                newaffect.BeginMessage = "Your duel has started.";
                newaffect.Hidden = false;
                newaffect.TickProgram = "DuelTickProgram";
                newaffect.StripAndSaveFlags.SETBIT(AffectData.StripAndSaveFlags.DoNotSave);
                sender.AffectToChar(newaffect);
            }
        } else if(triggertype == Program.ProgramTypes.AffectTick && affect.Flags.ISSET(AffectData.AffectFlags.DuelInProgress)) { 
            var opponent = Character.Characters.FirstOrDefault(c => !c.IsNPC && c.Name == affect.OwnerName);

            if (!opponent)
            {
                sender.send("Your opponent doesn't seem to be around any more.\n\r");
                sender.StripAffect(AffectData.AffectFlags.DuelInProgress);
            }
        }
    }
}

var program = new DuelProgram();