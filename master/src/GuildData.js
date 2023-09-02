const path = require('path')
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ strict: false, trim: false });
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility");
const PcRaceData = require("./PcRaceData");
const Settings = require("./Settings");



class GuildData {
    static Guilds = Array();
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
        this.Name = xml.GetAttributeValue( "Name").toLowerCase();
        this.WhoName = xml.GetAttributeValue( "WhoName");
        
        var races = {};
        Utility.ParseFlags(races, xml.GetAttributeValue( "Races"));
        for(var racekey in races) {
            var race = null;
            if((race = PcRaceData.LookupRace(racekey))) {
                this.Races.push(race);
            }
        }

        var alignments = {};
        Utility.ParseFlags(alignments, xml.GetAttributeValue( "Alignments"));
        for(var alignment in alignments)
            this.Alignments.push(alignment);
        this.GuildGroup = xml.GetAttributeValue( "GuildGroup");
        this.GuildBasicsGroup = xml.GetAttributeValue( "GuildBasicsGroup");
        this.StartingWeapon = xml.GetAttributeValueInt( "StartingWeapon", 0);
        this.HitpointGain = xml.GetAttributeValue( "HitpointGain");
        this.HitpointGainMax = xml.GetAttributeValue( "HitpointGainMax");
        this.CastType = xml.GetAttributeValue( "CastType");
        this.THAC0 = xml.GetAttributeValue( "THAC0");
        this.THAC032 = xml.GetAttributeValue( "THAC032");

        GuildData.Guilds.push(this);
    }

    static LoadAllGuilds(callback) {
        var guildspath = Settings.DataPath + "/guilds.xml";
        var content = fs.readFileSync(guildspath, "utf-8");
        parser.parseString(content, (err, xml) => {
            for(var guildxml of xml.GUILDS.GUILD)
            var guild = new GuildData(guildxml);
        });
        callback();
    };
    
    static Lookup(name, strprefix = false) {
        for(var guild of GuildData.Guilds)
            if((strprefix && Utility.Prefix(guild.Name, name)) || Utility.Compare(guild.Name, name))
                return guild;
    };
}

module.exports = GuildData;