const AffectData = require("./AffectData");
const Utility = require("./Utility");
const Character = require("./Character");

class Dueling
{

    static DuelBlocking(character) {
        return character.Flags.ISSET(Character.ActFlags.NoDuels);
    }
    static DuelPending(character) {
        return character.Affects.find(aff => aff.Flags.ISSET(
            AffectData.AffectFlags.DuelChallenge, 
            AffectData.AffectFlags.DuelChallenged, 
            AffectData.AffectFlags.DuelStarting,
            AffectData.AffectFlags.DuelInProgress,
            AffectData.AffectFlags.DuelCancelling));
    }

    static DoIssueDuelChallenge(character, args)
    {
        var [victim, count] = character.GetCharacterWorld(args);
        
        if (victim)
        {
            if (Dueling.DuelBlocking(victim))
            {
                character.send("They aren't accepting duels right now.\n\r");
            }
            else if (Dueling.DuelPending(victim))
            {
                character.send("They already have a duel challenge.");
            }
            else
            {
                character.Act("You issue a duel challenge to $N!", victim);
                character.Act("$n issues a duel challenge to $N!", victim, null, null, Character.ActType.GlobalNotVictim);
                character.Act("$n issues a duel challenge to you!", victim, null, null, Character.ActType.ToVictim);

                var affect = new AffectData();
                affect.Flags.SETBIT(AffectData.AffectFlags.DuelChallenged);
                affect.OwnerName = character.Name;
                affect.Duration = 5;
                affect.Frequency = AffectData.Frequency.Tick;
                affect.DisplayName = "Challenge from " + affect.OwnerName;
                affect.EndMessage = "You did not accept the challenge.";
                affect.StripAndSaveFlags.SETBIT(AffectData.StripAndSaveFlags.DoNotSave);
                affect.Hidden = false;

                victim.AffectToChar(affect);

                affect = new AffectData(affect);
                affect.OwnerName = victim.Name;
                affect.Flags = {};
                affect.Flags.SETBIT(AffectData.AffectFlags.DuelChallenge);
                affect.StripAndSaveFlags.SETBIT(AffectData.StripAndSaveFlags.DoNotSave);
                affect.DisplayName = "Challenge to " + affect.OwnerName;
                affect.EndMessage = "Your challenge was not accepted.";
                character.AffectToChar(affect);
            }
        }
        else
            character.send("You don't see them here. (You must specify their entire unaltered name)\n\r");
    }

    static DoDuelAccept(character, args)
    {
        var affect;
        if ((affect = character.FindAffect(AffectData.AffectFlags.DuelChallenged)))
        {
            var challenger = Character.Characters.FirstOrDefault(c => !c.IsNPC && c.Name == affect.OwnerName);

            if(challenger == null)
            {
                character.send("Your challenger doesn't seem to be around anymore.\n\r");
            }
            else
            {
                challenger.StripAffects({AffectFlag: AffectData.AffectFlags.DuelChallenge}, true);
                character.StripAffects({AffectFlag: AffectData.AffectFlags.DuelChallenged}, true);

                var newaffect = new AffectData();
                newaffect.Flags.SETBIT(AffectData.AffectFlags.DuelStarting);
                newaffect.OwnerName = character.Name;
                newaffect.Duration = 5;
                newaffect.Frequency = AffectData.Frequency.Violence;
                newaffect.DisplayName = "Duel starting: " + newaffect.OwnerName;
                newaffect.TickProgram = "DuelProgram";
                newaffect.EndProgram = "DuelProgram";
                newaffect.BeginMessage = "The duel has been acepted."
                newaffect.Hidden = false;
                newaffect.StripAndSaveFlags.SETBIT(AffectData.StripAndSaveFlags.DoNotSave);
                challenger.AffectToChar(newaffect);

                newaffect = new AffectData(newaffect);
                newaffect.OwnerName = challenger.Name;
                newaffect.DisplayName = "Duel starting: " + newaffect.OwnerName;
                newaffect.StripAndSaveFlags.SETBIT(AffectData.StripAndSaveFlags.DoNotSave);
                character.AffectToChar(newaffect);
            }
        }
        else
            character.send("You have not been challenged.\n\r");
    }

    static DoDuelDecline(character, args)
    {
        var affect = character.FindAffect(AffectData.AffectFlags.DuelChallenged);
        if (affect)
        {
            var challenger = Character.Characters.FirstOrDefault(c => !c.IsNPC && c.Name == affect.OwnerName);

            if (challenger == null)
            {
                character.send("Your challenger doesn't seem to be around anymore.\n\r");
            }
            else
            {
                challenger.StripAffects({AffectFlag: AffectData.AffectFlags.DuelChallenge});
            }
            character.StripAffects({AffectFlag: AffectData.AffectFlags.DuelChallenged});
        }
        else
            character.send("You have not been challenged.\n\r");
    }
}
module.exports = Dueling;