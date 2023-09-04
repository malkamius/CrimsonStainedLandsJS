const path = require('path')
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ strict: false, trim: false });
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility")
const Settings = require("./Settings");

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
        this.CanSpeak = Utility.Compare(xml.GetAttributeValue( "CanSpeak", "false"), "true");
        this.HasCoins = Utility.Compare(xml.GetAttributeValue( "HasCoins", "false"), "true");
        this.Name = xml.GetElementValue( "Name").toLowerCase();
        this.PcRace = Utility.Compare(xml.GetElementValue( "PcRace"), "true");
        Utility.ParseFlags(this.Part, xml.GetElementValue( "Part"));
        Utility.ParseFlags(this.Act, xml.GetElementValue( "Act"));
        Utility.ParseFlags(this.Aff, xml.GetElementValue( "Aff"));
        Utility.ParseFlags(this.Immune, xml.GetElementValue( "Immune"));
        Utility.ParseFlags(this.Resist, xml.GetElementValue( "Resist"));
        Utility.ParseFlags(this.Vulnerable, xml.GetElementValue( "Vulnerable"));
        Utility.ParseFlags(this.Form, xml.GetElementValue( "Form"));
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
        Races.push(this);
    }
}
RaceData.Races = Races;

RaceData.LoadAllRaces = function(callback) {
  var counter = 0;
	var racesdirectory = Settings.RaceDataPath;
	// fs.readdir(racesdirectory, function(err, filenames) {
	// 	if (err) {
	// 	  throw new Error(err);
	// 	  return;
	// 	}
  filenames = fs.readdirSync(racesdirectory);

  //filenames.forEach(function(filename) {
  for(var filename of filenames) {
    if(filename.endsWith(".xml")) {
      var content = fs.readFileSync(path.join(racesdirectory, filename), 'utf-8');//, function(err, content) {
      // if (err) {
      //   throw new Error(err);
      //   return;
      // }
      parser.parseString(content, function(err, xml) {
        var race = new RaceData(xml.RACE);
        //console.log("Loaded area " + area.Name);
      });
    }
  }
  callback();
  //     counter++;
  //     if (counter === filenames.length) {
  //       callback();
  //     }
  //     });
  //   } else {
  //     counter++;
  //     if (counter === filenames.length) {
  //       callback();
  //     }
  //   }
  // });
};

RaceData.LookupRace = function(name, strprefix = false) {
    for(var race of Races)
        if((strprefix && Utility.Prefix(race.Name, name)) || Utility.Compare(race.Name, name))
            return race;
};

module.exports = RaceData;