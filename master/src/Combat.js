const Character = require("./Character");
const StringUtility = require("./StringUtility");

Character.Combat.DoKill = function(character, arguments) {
    if(character.Fighting) {
        character.send("You are already fighting.\n\r");
    }
    else {
        var victim = Character.CharacterFunctions.GetCharacterHere(character, arguments);
        if(!victim) {
            character.send("You don't see them here.\n\r");
        }
        else if(victim == character) {
            character.send("Suicide is a mortal sin.\n\r");
        }
        else {
            character.Fighting = victim;
            character.Position = "Fighting";
            OneHit(character, victim);
        }
    }
};

function OneHit(character, victim) {
    var damage = Math.floor(Math.random() * 150);
    if(character.Fighting && character.Fighting == victim && character.Fighting.Room != victim.Room) {
        character.Fighting = null;
        character.Position = "Standing";
    }
    else if(victim) {
        if(!character.Fighting)
            character.Fighting = victim;
        if(!victim.Fighting)
            victim.Fighting = character;
        victim.Position = "Fighting";

        DamageMessage(character, victim, damage, "punch", "Bash", false);
        
        victim.HitPoints -= damage;
        if(victim.HitPoints < -15) {
            victim.Position = "Dead";
            character.Act("$N has been killed!", victim, null, null, "ToRoomNotVictim");
            character.Act("You have been killed!", victim, null, null, "ToVictim");
            character.Act("$N is DEAD!", victim, null, null, "ToChar");
            
            for(var other of victim.Room.Characters) {
                if(other.Fighting == victim) {
                    other.Fighting = null;
                    character.Position = "Standing";
                }
            }
            victim.Fighting = null;
        }
    }
}

Character.Combat.ExecuteRound = function(character) {
    var numhits = Math.floor(Math.random() * 5);

    for(var i = 0; i < numhits; i++) {
        if(character.Fighting)
            OneHit(character, character.Fighting)
    }
};


function DamageMessage(ch, victim, damageAmount, nounDamage, DamageType = "Bash", immune = false)
{
    // Variables for verb singular, verb plural, and punctuation
    var vs = "";
    var vp = "";
    var punct = "";

    // Determine the appropriate verb phrases based on the damage amount
    if (damageAmount == 0)
    {
        vs = "miss";
        vp = "misses";
    }
    else if (damageAmount <= 1)
    {
        vs = "barely scratch";
        vp = "barely scratches";
    }
    else if (damageAmount <= 2)
    {
        vs = "scratch";
        vp = "scratches";
    }
    else if (damageAmount <= 4)
    {
        vs = "graze";
        vp = "grazes";
    }
    else if (damageAmount <= 7)
    {
        vs = "hit";
        vp = "hits";
    }
    else if (damageAmount <= 11)
    {
        vs = "injure";
        vp = "injures";
    }
    else if (damageAmount <= 15)
    {
        vs = "wound";
        vp = "wounds";
    }
    else if (damageAmount <= 20)
    {
        vs = "maul";
        vp = "mauls";
    }
    else if (damageAmount <= 25)
    {
        vs = "decimate";
        vp = "decimates";
    }
    else if (damageAmount <= 30)
    {
        vs = "devastate";
        vp = "devastates";
    }
    else if (damageAmount <= 37)
    {
        vs = "maim";
        vp = "maims";
    }
    else if (damageAmount <= 45)
    {
        vs = "MUTILATE";
        vp = "MUTILATES";
    }
    else if (damageAmount <= 55)
    {
        vs = "EVISCERATE";
        vp = "EVISCERATES";
    }
    else if (damageAmount <= 65)
    {
        vs = "DISMEMBER";
        vp = "DISMEMBERS";
    }
    else if (damageAmount <= 85)
    {
        vs = "MASSACRE";
        vp = "MASSACRES";
    }
    else if (damageAmount <= 100)
    {
        vs = "MANGLE";
        vp = "MANGLES";
    }
    else if (damageAmount <= 135)
    {
        vs = "*** DEMOLISH ***";
        vp = "*** DEMOLISHES ***";
    }
    else if (damageAmount <= 160)
    {
        vs = "*** DEVASTATE ***";
        vp = "*** DEVASTATES ***";
    }
    else if (damageAmount <= 250)
    {
        vs = "=== OBLITERATE ===";
        vp = "=== OBLITERATES ===";
    }
    else if (damageAmount <= 330)
    {
        vs = ">>> ANNIHILATE <<<";
        vp = ">>> ANNIHILATES <<<";
    }
    else if (damageAmount <= 380)
    {
        vs = "<<< ERADICATE >>>";
        vp = "<<< ERADICATES >>>";
    }
    else
    {
        vs = "do UNSPEAKABLE things to";
        vp = "does UNSPEAKABLE things to";
    }

    // Determine the appropriate punctuation based on the damage amount
    punct = (damageAmount <= 33) ? "." : "!";

    // If the damage is immune (no effect)
    if (immune)
    {
        // Check various conditions and display corresponding immunity messages
        if (ch == victim && !StringUtility.IsNullOrEmpty(nounDamage))
        {
            ch.Act("$n is unaffected by $s own " + nounDamage + ".", null, null, null, "ToRoom");
            ch.Act("Luckily, you are immune to that.");
        }
        else if (!StringUtility.IsNullOrEmpty(nounDamage))
        {
            ch.Act("$N is unaffected by $n's " + nounDamage + "!", victim, null, null, "ToRoomNotVictim");
            ch.Act("$N is unaffected by your " + nounDamage + "!", victim, null, null, "ToChar");
            ch.Act("$n's " + nounDamage + " is powerless against you.", victim, null, null, "ToVictim");
        }
        else if (ch == victim)
        {
            ch.Act("$n is unaffected by $mself.", null, null, null, "ToRoom");
            ch.Act("Luckily, you are immune to that.");
        }
        else
        {
            ch.Act("$N is unaffected by $n!", victim, null, null, "ToRoomNotVictim");
            ch.Act("$N is unaffected by you!", victim, null, null, "ToChar");
            ch.Act("$n is powerless against you.", victim, null, null, "ToVictim");
        }
    }

    // If the attacker and victim are different characters and there is a specific damage noun
    if (victim != ch && ch != null && !StringUtility.IsNullOrEmpty(nounDamage))
    {
        // Display damage messages with specific noun to the attacker, victim, and the room
        ch.Act("Your " + nounDamage + " \\R" + vp + "\\x $N" + punct, victim, null, null, "ToChar");
        victim.Act("$N's " + nounDamage + " \\R" + vp + "\\x you" + punct, ch, null, null, "ToChar");
        ch.Act("$n's " + nounDamage + " \\R" + vp + "\\x $N" + punct, victim, null, null, "ToRoomNotVictim");
    }
    // If the attacker is null and there is a specific damage noun
    else if (ch == null && !StringUtility.IsNullOrEmpty(nounDamage))
    {
        // Display damage messages with specific noun to the victim and the room
        victim.Act("Your " + nounDamage + " \\R" + vp + "\\x you" + punct, null, null, null, "ToChar");
        victim.Act("$n's " + nounDamage + " \\R" + vp + "\\x them" + punct, null, null, null, "ToRoom");
    }
    // If there is a specific damage noun but no attacker
    else if (!StringUtility.IsNullOrEmpty(nounDamage))
    {
        // Display damage messages with specific noun to the attacker (if available) and the room
        ch.Act("Your " + nounDamage + " \\R" + vp + "\\x you" + punct, null, null, null, "ToChar");
        ch.Act("$n's " + nounDamage + " \\R" + vp + "\\x them" + punct, victim, null, null, "ToRoom");
    }
    // If the attacker and victim are different characters and there is no specific damage noun
    else if (victim != ch && ch != null)
    {
        // Display generic damage messages to the attacker, victim, and the room
        ch.Act("You \\R" + vs + "\\x $N" + punct, victim, null, null, "ToChar");
        victim.Act("$N \\R" + vp + "\\x you" + punct, ch, null, null, "ToChar");
        ch.Act("$n \\R" + vp + "\\x $N" + punct, victim, null, null, "ToRoomNotVictim");
    }
    // If the attacker is null and there is no specific damage noun
    else if (ch == null && StringUtility.IsNullOrEmpty(nounDamage))
    {
        // Display generic damage messages to the victim and the room
        victim.Act("You \\R" + vs + "\\x yourself" + punct, null, null, null, "ToChar");
        victim.Act("$n \\R" + vp + "\\x $mself" + punct, null, null, null, "ToRoom");
    }
    // If there is no specific damage noun
    else if (StringUtility.IsNullOrEmpty(nounDamage))
    {
        // Display generic damage messages to the attacker and the room
        ch.Act("You \\R" + vs + "\\x yourself" + punct, null, null, null, "ToChar");
        ch.Act("$n \\R" + vp + "\\x $mself" + punct, victim, null, null, "ToRoom");
    }
} // end damageMessage