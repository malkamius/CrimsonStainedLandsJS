const fs = require("fs");
const xml2js = require('xml2js');
const XmlHelper = require("./XmlHelper");


class Settings {
    static Port = 3000;
    static PlayersOnlineAtOnceEver = 0;
    static DataPath = "data";
    static RaceDataPath = Settings.DataPath + "/races";
    static PlayerDataPath = Settings.DataPath + "/players";
    static AreaDataPath = Settings.DataPath + "/areas";
    static TitleDataPath = Settings.DataPath + "/guilds";
    
    static SettingsPath = Settings.DataPath + "/settings.xml";

    
    
    static Load() {
        if(!fs.existsSync(this.SettingsPath))
            this.Save();
        else {
            var content = fs.readFileSync(this.SettingsPath, { encoding: "utf-8" });
            const parser = new xml2js.Parser({ strict: false, trim: false });
            parser.parseString(content, function(err, xml) {
                Settings.Port = XmlHelper.GetAttributeValueInt(xml, "Port");
                Settings.PlayersOnlineAtOnceEver = XmlHelper.GetAttributeValueInt(xml, "PlayersOnlineAtOnceEver");
                Settings.DataPath = XmlHelper.GetAttributeValue(xml, "DataPath");
                Settings.PlayerDataPath = XmlHelper.GetAttributeValue(xml, "PlayerDataPath");
                Settings.AreaDataPath = XmlHelper.GetAttributeValue(xml, "AreaDataPath");
                Settings.TitleDataPath = XmlHelper.GetAttributeValue(xml, "TitleDataPath");
                Settings.RaceDataPath = XmlHelper.GetAttributeValue(xml, "RaceDataPath");
            });
        }
    }

    static Save() {
        var builder = require('xmlbuilder');
        var xmlelement = builder.create("Settings");

        xmlelement.attribute("Port", Settings.Port);
        xmlelement.attribute("PlayersOnlineAtOnceEver", Settings.PlayersOnlineAtOnceEver);
        xmlelement.attribute("DataPath", Settings.DataPath);
        xmlelement.attribute("PlayerDataPath", Settings.PlayerDataPath);
        xmlelement.attribute("AreaDataPath", Settings.AreaDataPath);
        xmlelement.attribute("TitleDataPath", Settings.TitleDataPath);
        xmlelement.attribute("RaceDataPath", Settings.RaceDataPath);
        
        
        var xml = xmlelement.end({ pretty: true});
	    fs.writeFileSync(this.SettingsPath, xml);
        
    }
}


module.exports = Settings;