const XmlHelper = require("./XmlHelper");
const Character = require("./Character");
const Utility = require("./Utility");


class NPCTemplateData extends Character {
  static NPCTemplates = {};

  Area = null;
  HitPointDice = Array(0,0,0);
  ManaPointDice = Array(0,0,0);
  ResetMaxCount = 0;
  ResetCount = 0;
  
  constructor(area, xml) {
    super(false);
        
    const RaceData = require("./RaceData");
    const GuildData = require("./GuildData");
    this.Area = area;
    this.VNum = xml.GetElementValueInt( "vnum");
    this.Level = xml.GetElementValueInt( "Level");
    this.Name = xml.GetElementValue( "Name");
    this.ShortDescription = xml.GetElementValue( "ShortDescription");
    this.LongDescription = xml.GetElementValue( "LongDescription");

    this.Silver = xml.GetElementValueInt( "Silver");
    this.Gold = xml.GetElementValueInt( "Gold");

    this.HitPointDice[0] = xml.GetElementValueInt( "HitPointDiceSides");
    this.HitPointDice[1] = xml.GetElementValueInt( "HitPointDiceCount");
    this.HitPointDice[2] = xml.GetElementValueInt( "HitPointDiceBonus");

    this.ManaPointDice[0] = xml.GetElementValueInt( "ManaPointDiceSides");
    this.ManaPointDice[1] = xml.GetElementValueInt( "ManaPointDiceCount");
    this.ManaPointDice[2] = xml.GetElementValueInt( "ManaPointDiceBonus");

    this.DamageDice[0] = xml.GetElementValueInt( "DamageDiceSides");
    this.DamageDice[1] = xml.GetElementValueInt( "DamageDiceCount");
    this.DamageDice[2] = xml.GetElementValueInt( "DamageDiceBonus");

    Utility.ParseFlags(this.Flags, xml.GetElementValue("Flags"));

    this.WeaponDamageMessage = xml.GetElementValue("WeaponDamageMessage");

    this.Race = RaceData.LookupRace(xml.GetElementValue( "Race", "human"));
    this.Guild = GuildData.Lookup(xml.GetElementValue("Guild"), false);
    
    if(this.Flags.IsSet("Healer") && !this.Guild)
      this.Guild = GuildData.Lookup("healer");

    if(!area.NPCTemplates[this.VNum])
      area.NPCTemplates[this.VNum] = this;
    else
      console.log(`NPCTemplate ${this.VNum} already exists in area ${this.Name}.`);

    if(!NPCTemplateData.NPCTemplates[this.VNum])
    NPCTemplateData.NPCTemplates[this.VNum] = this;
    else
      console.log(`NPCTemplate ${this.VNum} already exists.`);
  }
}

module.exports = NPCTemplateData;