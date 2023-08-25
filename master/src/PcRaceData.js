const path = require('path')
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ strict: false, trim: false });
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility")
PcRaces = Array();

class PcRaceData {
    Name = "";
    IsPcRace = true;

    Alignments = Array();
    Ethos = Array();
    Parts = {};
    Size = "Medium";
    Stats = Array(20,20,20,20,20,20);
    MaxStats = Array(25, 25, 25, 25, 25 ,25);
    
    
    constructor(xml) {

        this.Name = XmlHelper.GetElementValue(xml, "Name");
        this.IsPcRace = Utility.Compare(XmlHelper.GetElementValue(xml, "IsPcRace"), "true");
        
        Utility.ParseFlags(this.Parts, XmlHelper.GetElementValue(xml, "Parts"));
        
        var alignments = {};
        Utility.ParseFlags(alignments, XmlHelper.GetElementValue(xml, "Alignment"));
        for(var alignment in alignments) this.Alignments.push(alignment);

        var ethosi = {};
        Utility.ParseFlags(ethosi, XmlHelper.GetElementValue(xml, "Ethos"));
        for(var ethos in ethosi) this.Ethos.push(ethos);

        this.Size = XmlHelper.GetElementValue(xml, "Size");

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
        PcRaces.push(this);
    }
}

PcRaceData.PcRaces = PcRaces;

function LoadAllPcRaces(callback) {
    var racespath = path.join(__dirname, '../data/PC_Races.xml');
    var content = fs.readFileSync(racespath, "utf-8");
    parser.parseString(content, (err, xml) => {
        for(var racexml of xml.RACES.RACEDATA)
        var race = new PcRaceData(racexml);
    });
    callback();
};

PcRaceData.LoadAllPcRaces = LoadAllPcRaces;
PcRaceData.LookupRace = function(name, strprefix = false) {
    for(var race of PcRaces)
        if((strprefix && Utility.Prefix(race.Name, name)) || Utility.Compare(race.Name, name))
            return race;
};
module.exports = PcRaceData;