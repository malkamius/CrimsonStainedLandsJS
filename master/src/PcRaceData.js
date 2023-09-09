const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ strict: false, trim: false });
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility")
const Settings = require("./Settings");



class PcRaceData {
    static PcRaces = Array();
    Name = "";
    IsPcRace = true;

    Alignments = Array();
    Ethos = Array();
    Parts = {};
    Size = "Medium";
    Stats = Array(20,20,20,20,20,20);
    MaxStats = Array(25, 25, 25, 25, 25 ,25);
    
    
    constructor(xml) {

        this.Name = xml.GetElementValue( "Name").toLowerCase();
        this.IsPcRace = Utility.Compare(xml.GetElementValue( "IsPcRace"), "true");
        
        Utility.ParseFlags(this.Parts, xml.GetElementValue( "Parts"));
        
        var alignments = {};
        Utility.ParseFlags(alignments, xml.GetElementValue( "Alignment"));
        for(var alignment in alignments) this.Alignments.push(alignment);

        var ethosi = {};
        Utility.ParseFlags(ethosi, xml.GetElementValue( "Ethos"));
        for(var ethos in ethosi) this.Ethos.push(ethos);

        this.Size = xml.GetElementValue( "Size");

        if(xml.STATS) {
            var stats = xml.STATS[0];
            this.Stats[0] = XmlHelper.GetElementValueInt(stats, "Strength");
            this.Stats[1] = XmlHelper.GetElementValueInt(stats, "Wisdom");
            this.Stats[2] = XmlHelper.GetElementValueInt(stats, "Intelligence");
            this.Stats[3] = XmlHelper.GetElementValueInt(stats, "Dexterity");
            this.Stats[4] = XmlHelper.GetElementValueInt(stats, "Constitution");
            this.Stats[5] = XmlHelper.GetElementValueInt(stats, "Charisma");
        }

        if(xml.MAXSTATS) {
            var maxstats = xml.MAXSTATS[0];
            this.MaxStats[0] = XmlHelper.GetElementValueInt(maxstats, "Strength");
            this.MaxStats[1] = XmlHelper.GetElementValueInt(maxstats, "Wisdom");
            this.MaxStats[2] = XmlHelper.GetElementValueInt(maxstats, "Intelligence");
            this.MaxStats[3] = XmlHelper.GetElementValueInt(maxstats, "Dexterity");
            this.MaxStats[4] = XmlHelper.GetElementValueInt(maxstats, "Constitution");
            this.MaxStats[5] = XmlHelper.GetElementValueInt(maxstats, "Charisma");
        }
        
    }

    static LoadAllPcRaces(callback) {
        var racespath = Settings.DataPath + '/PC_Races.xml';
        var content = fs.readFileSync(racespath, "utf-8");
        var xml = content.ParseXml();
        for(var racexml of xml.RACES.RACEDATA) {
            var race = new PcRaceData(racexml);
            PcRaceData.PcRaces.push(race);
        }
        callback();
    }

    static LookupRace(name, strprefix = false) {
        for(var race of PcRaceData.PcRaces)
            if((strprefix && Utility.Prefix(race.Name, name)) || Utility.Compare(race.Name, name))
                return race;
    }
}


module.exports = PcRaceData;