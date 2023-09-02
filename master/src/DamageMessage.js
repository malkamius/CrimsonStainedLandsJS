const fs = require("fs");
const xml2js = require('xml2js');
const Settings = require("./Settings");
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility");

const parser = new xml2js.Parser({ strict: false, trim: false });

class DamageMessage {
    static DamageMessages = {};
    static WeaponDamageTypes = {
        "Bite": "Bite",
        "Sting": "Sting",
        "Slap": "Slap",
        "Divine": "Divine",
        "Wrath": "Wrath",
        "Whack": "Whack",
        "Slice": "Slice",
        "Pierce": "Pierce",
        "Smash": "Smash",
        "Bash": "Bash",
        "Slash": "Slash",
        "Pound": "Pound",
        "Cut": "Cut",
        "Chop": "Chop",
        "Crush": "Crush",
        "Claw": "Claw",
        "Burn": "Burn",
        "Freeze": "Freeze",
        "FrBite": "FrBite",
        "Corrosion": "Corrosion",
        "Poison": "Poison",
        "Toxin": "Toxin",
        "Psychic": "Psychic",
        "Blast": "Blast",
        "Decay": "Decay",
        "Holy": "Holy",
        "Electrical": "Electrical",
        "Acid": "Acid",
        "Energy": "Energy",
        "Lightning": "Lightning",
        "Fire": "Fire",
        "Cold": "Cold",
        "Negative": "Negative",
        "Light": "Light",
        "Mental": "Mental",
        "Sound": "Sound",
        "Force": "Force",
        "Whomp": "Whomp",
        "Other": "Other",
        "Magic": "Magic",
        "Disease": "Disease",
        "Summon": "Summon",
        "Silver": "Silver",
        "Mithril": "Mithril",
        "Wood": "Wood",
        "Iron": "Iron",
        "Drowning": "Drowning",
        "Charm": "Charm",
        "Weapon": "Weapon",
        "None": "None",
        "Air": "Air",
        "Blind" : "Blind"
    };
    Keyword = "";
    Message = "";
    Type = "";
    
    static Load() {
        const parser = new xml2js.Parser({ strict: false, trim: false });

        var path = Settings.DataPath + "/damage_messages.xml";

        var data = fs.readFileSync(path, {encoding: "ascii"});
        parser.parseString(data, function(err, xml) {
            
            if(xml.DAMAGEMESSAGES && xml.DAMAGEMESSAGES.DAMAGEMESSAGE) {
                for(const damagemessagexml of xml.DAMAGEMESSAGES.DAMAGEMESSAGE) {
                    var message = new DamageMessage(damagemessagexml);
                    DamageMessage.DamageMessages[message.Keyword.toLowerCase()] = message;
                }
            }
        });
    
    }

    constructor(xml) {
        this.Keyword = xml.GetAttributeValue( "Keyword");
        this.Message = xml.GetAttributeValue( "Message");
        this.Type = xml.GetAttributeValue( "Type");
    }

    static GetWeaponDamageMessage(keyword) {
        for(var key in DamageMessage.DamageMessages) {
            if(key.equals(keyword)) return DamageMessage.DamageMessages[key];
        }
    }
}
module.exports = DamageMessage;