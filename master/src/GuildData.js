const path = require('path')
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ strict: false, trim: false });
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility");
const PcRaceData = require("./PcRaceData");
const Settings = require("./Settings");

Guilds = Array();

class GuildData {
    Name = "";
    WhoName = "";
    Races = Array();
    Alignments = Array();
    GuildGroup = "Warrior";
    GuildBasicsGroup = "Warrior_Basics";
    StartingWeapon="40000";
    HitpointGain="8";
    HitpointGainMax="15";
    CastType="Commune";
	THAC0="20";
    THAC032="-6";
    
    constructor(xml) {
        this.Name = XmlHelper.GetAttributeValue(xml, "Name").toLowerCase();
        this.WhoName = XmlHelper.GetAttributeValue(xml, "WhoName");
        
        var races = {};
        Utility.ParseFlags(races, XmlHelper.GetAttributeValue(xml, "Races"));
        for(var racekey in races) {
            var race = null;
            if((race = PcRaceData.LookupRace(racekey))) {
                this.Races.push(race);
            }
        }

        var alignments = {};
        Utility.ParseFlags(alignments, XmlHelper.GetAttributeValue(xml, "Alignments"));
        for(var alignment in alignments)
            this.Alignments.push(alignment);
        this.GuildGroup = XmlHelper.GetAttributeValue(xml, "GuildGroup");
        this.GuildBasicsGroup = XmlHelper.GetAttributeValue(xml, "GuildBasicsGroup");
        this.StartingWeapon = XmlHelper.GetAttributeValueInt(xml, "StartingWeapon", 0);
        this.HitpointGain = XmlHelper.GetAttributeValue(xml, "HitpointGain");
        this.HitpointGainMax = XmlHelper.GetAttributeValue(xml, "HitpointGainMax");
        this.CastType = XmlHelper.GetAttributeValue(xml, "CastType");
        this.THAC0 = XmlHelper.GetAttributeValue(xml, "THAC0");
        this.THAC032 = XmlHelper.GetAttributeValue(xml, "THAC032");

        Guilds.push(this);
    }
}

GuildData.Guilds = Guilds;

function LoadAllGuilds(callback) {
    var guildspath = Settings.DataPath + "/guilds.xml";
    var content = fs.readFileSync(guildspath, "utf-8");
    parser.parseString(content, (err, xml) => {
        for(var guildxml of xml.GUILDS.GUILD)
        var guild = new GuildData(guildxml);
    });
    callback();
};
GuildData.Lookup = function(name, strprefix = false) {
    for(var guild of Guilds)
        if((strprefix && Utility.Prefix(guild.Name, name)) || Utility.Compare(guild.Name, name))
            return guild;
};
GuildData.LoadAllGuilds = LoadAllGuilds;

module.exports = GuildData;