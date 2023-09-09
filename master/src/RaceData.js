const path = require('path')
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ strict: false, trim: false });
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility")
const Settings = require("./Settings");



class RaceData {
  static Races = Array();
  static PartFlags =
  {
    "Head": "Head",
    "Arms": "Arms",
    "Legs": "Legs",
    "Heart": "Heart",
    "Brains": "Brains",
    "Guts": "Guts",
    "Hands": "Hands",
    "Feet": "Feet",
    "Fingers": "Fingers",
    "Ear": "Ear",
    "Eye": "Eye",
    "LongTongue": "LongTongue",
    "EyeStalks": "EyeStalks",
    "Tentacles": "Tentacles",
    "Fins": "Fins",
    "Wings": "Wings",
    "Tail": "Tail",
    "Claws": "Claws",
    "Fangs": "Fangs",
    "Horns": "Horns",
    "Scales": "Scales",
    "Tusks": "Tusks",
    "Pincers": "Pincers",
    "Shell": "Shell",
    "Mandible": "Mandible",
    "Bones": "Bones"
  }

  static FormFlags =
  {
    "edible": "edible",
    "poison": "poison",
    "magical": "magical",
    "instant_decay": "instant_decay",
    "other": "other",
    "animal": "animal",
    "sentient": "sentient",
    "undead": "undead",
    "construct": "construct",
    "mist": "mist",
    "intangible": "intangible",
    "biped": "biped",
    "centaur": "centaur",
    "insect": "insect",
    "spider": "spider",
    "crustacean": "crustacean",
    "worm": "worm",
    "blob": "blob",
    "mammal": "mammal",
    "bird": "bird",
    "reptile": "reptile",
    "snake": "snake",
    "dragon": "dragon",
    "amphibian": "amphibian",
    "fish": "fish",
    "cold_blood": "cold_blood",
    "skeleton": "skeleton",
    "ghoul": "ghoul",
    "zombie": "zombie"
  }
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
        RaceData.Races.push(this);
    }

    static LookupRace(name, strprefix = false) {
      for(var race of RaceData.Races)
          if((strprefix && Utility.Prefix(race.Name, name)) || Utility.Compare(race.Name, name))
              return race;
    };

    static LoadAllRaces(callback) {
      var counter = 0;
      var racesdirectory = Settings.RaceDataPath;
      
      var filenames = fs.readdirSync(racesdirectory);
    
      for(var filename of filenames) {
        if(filename.endsWith(".xml")) {
          var content = fs.readFileSync(path.join(racesdirectory, filename), 'utf-8');
          var xml = content.ParseXml();
          var race = new RaceData(xml.RACE);
        }
      }
      callback();
    };
}




module.exports = RaceData;