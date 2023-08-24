const path = require('path')
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ strict: false, trim: false });
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility")
Races = Array();

class RaceData {
    Name = "";
    PcRace = false;
    Act = {};
    Aff = {};
    Immune = {};
    Resist = {};
    Vulnerable = {};
    Form = {};
    Part = {};
    Stats = Array(20,20,20,20,20,20);
    MaxStats = Array(25, 25, 25, 25, 25 ,25);
    Size = "Medium";
    CanSpeak = true;
    HasCoins = true;

    constructor(xml) {
        this.CanSpeak = Utility.Compare(XmlHelper.GetAttributeValue(xml, "CanSpeak", "false"), "true");
        this.HasCoins = Utility.Compare(XmlHelper.GetAttributeValue(xml, "HasCoins", "false"), "true");
        this.Name = XmlHelper.GetElementValue(xml, "Name");
        this.PcRace = Utility.Compare(XmlHelper.GetElementValue(xml, "PcRace"), "true");
        Utility.ParseFlags(this.Part, XmlHelper.GetElementValue(xml, "Part"));
        Utility.ParseFlags(this.Act, XmlHelper.GetElementValue(xml, "Act"));
        Utility.ParseFlags(this.Aff, XmlHelper.GetElementValue(xml, "Aff"));
        Utility.ParseFlags(this.Immune, XmlHelper.GetElementValue(xml, "Immune"));
        Utility.ParseFlags(this.Resist, XmlHelper.GetElementValue(xml, "Resist"));
        Utility.ParseFlags(this.Vulnerable, XmlHelper.GetElementValue(xml, "Vulnerable"));
        Utility.ParseFlags(this.Form, XmlHelper.GetElementValue(xml, "Form"));
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
        Races.push(this);
    }
}
RaceData.Races = Races;

RaceData.LoadAllRaces = function(callback) {
    var counter = 0;
	var racesdirectory = path.join(__dirname, '../data/races');
	fs.readdir(racesdirectory, function(err, filenames) {
		if (err) {
		  throw err;
		  return;
		}
		
		filenames.forEach(function(filename) {
			if(filename.endsWith(".xml")) {
			  fs.readFile(path.join(racesdirectory, filename), 'utf-8', function(err, content) {
				if (err) {
				  throw err;
				  return;
				}
				parser.parseString(content, function(err, xml) {
					var race = new RaceData(xml.RACE);
					//console.log("Loaded area " + area.Name);
				});
				counter++;
				if (counter === filenames.length) {
					callback();
				}
			  });
			} else {
				counter++;
				if (counter === filenames.length) {
					callback();
				}
			}
		});
    });
};

RaceData.LookupRace = function(name, strprefix = false) {
    for(var race of Races)
        if((strprefix && Utility.Prefix(race.Name, name)) || Utility.Compare(race.Name, name))
            return race;
};

module.exports = RaceData;