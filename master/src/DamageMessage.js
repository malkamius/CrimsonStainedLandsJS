const fs = require("fs");
const xml2js = require('xml2js');
const Settings = require("./Settings");
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility");

const parser = new xml2js.Parser({ strict: false, trim: false });

class DamageMessage {
    static DamageMessages = {};
    
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
        this.Keyword = XmlHelper.GetAttributeValue(xml, "Keyword");
        this.Message = XmlHelper.GetAttributeValue(xml, "Message");
        this.Type = XmlHelper.GetAttributeValue(xml, "Type");
    }

}
module.exports = DamageMessage;