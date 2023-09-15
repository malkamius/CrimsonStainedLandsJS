const XmlHelper = require("./XmlHelper");
const Character = require("./Character");
const Utility = require("./Utility");
const SkillSpell = require("./SkillSpell");
const Game = require("./Game");


class NPCTemplateData extends Character {
  static Templates = {};

  Area = null;
  HitPointDice = Array(0,0,0);
  ManaPointDice = Array(0,0,0);
  ResetMaxCount = 0;
  ResetCount = 0;
  BuyProfitPercent = 0;
  SellProfitPercent = 0;
  BuyTypes = {};
  ShopOpenHour = 0;
  ShopCloseHour = 0;
  Protects = [];
  PetVNums = [];
  Programs = [];

  constructor(area, xml, vnum) {
    super(false);
    this.VNum = vnum;
    if(xml) {
      const RaceData = require("./RaceData");
      const GuildData = require("./GuildData");
      this.Area = area;
      this.VNum = xml.GetElementValueInt( "vnum");
      this.Level = xml.GetElementValueInt( "Level");
      this.Name = xml.GetElementValue( "Name");
      this.ShortDescription = xml.GetElementValue( "ShortDescription");
      this.LongDescription = xml.GetElementValue( "LongDescription");
      this.Description = xml.GetElementValue( "Description");

      this.ArmorClass = xml.GetElementValueInt( "ArmorClass");
      this.SavingThrow = xml.GetElementValueInt( "SavingThrow");
      this.ArmorBash = xml.GetElementValueInt( "ArmorBash");
      this.ArmorSlash = xml.GetElementValueInt( "ArmorSlash");
      this.ArmorPierce = xml.GetElementValueInt( "ArmorPierce");
      this.ArmorExotic = xml.GetElementValueInt( "ArmorExotic");

      this.Silver = xml.GetElementValueInt( "Silver");
      this.Gold = xml.GetElementValueInt( "Gold");

      this.HitRoll = xml.GetElementValueInt( "HitRoll");
      this.DamageRoll = xml.GetElementValueInt( "DamRoll");
      this.HitPoints = xml.GetElementValueInt( "HitPoints");
      this.MaxHitPoints = xml.GetElementValueInt( "MaxHitPoints");
      this.ManaPoints = xml.GetElementValueInt( "ManaPoints");
      this.MaxManaPoints = xml.GetElementValueInt( "MaxManaPoints");
      this.MovementPoints = xml.GetElementValueInt( "MovementPoints");
      this.MaxMovementPoints = xml.GetElementValueInt( "MaxMovementPoints");

      this.Size = xml.GetElementValue( "Size");
      this.Sex = xml.GetElementValue( "Sex");
      
      Utility.ParseFlags(this.AffectedBy, xml.GetElementValue("AffectedBy"));
      Utility.ParseFlags(this.ImmuneFlags, xml.GetElementValue("immune"));
      Utility.ParseFlags(this.ResistFlags, xml.GetElementValue("resist"));
      Utility.ParseFlags(this.VulnerableFlags, xml.GetElementValue("vulnerable"));

      this.HitPointDice[0] = xml.GetElementValueInt( "HitPointDiceSides");
      this.HitPointDice[1] = xml.GetElementValueInt( "HitPointDiceCount");
      this.HitPointDice[2] = xml.GetElementValueInt( "HitPointDiceBonus");

      this.ManaPointDice[0] = xml.GetElementValueInt( "ManaPointDiceSides");
      this.ManaPointDice[1] = xml.GetElementValueInt( "ManaPointDiceCount");
      this.ManaPointDice[2] = xml.GetElementValueInt( "ManaPointDiceBonus");

      this.DamageDice[0] = xml.GetElementValueInt( "DamageDiceSides");
      this.DamageDice[1] = xml.GetElementValueInt( "DamageDiceCount");
      this.DamageDice[2] = xml.GetElementValueInt( "DamageDiceBonus");

      if(xml.PERMANENTSTATS) {
        var stats = xml.PERMANENTSTATS[0];
        this.PermanentStats[0] = XmlHelper.GetElementValueInt(stats, "STRENGTH");
        this.PermanentStats[1] = XmlHelper.GetElementValueInt(stats, "WISDOM");
        this.PermanentStats[2] = XmlHelper.GetElementValueInt(stats, "INTELLIGENCE");
        this.PermanentStats[3] = XmlHelper.GetElementValueInt(stats, "DEXTERITY");
        this.PermanentStats[4] = XmlHelper.GetElementValueInt(stats, "CONSTITUTION");
        this.PermanentStats[5] = XmlHelper.GetElementValueInt(stats, "CHARISMA");
      }
      
      Utility.ParseFlags(this.Flags, xml.GetElementValue("Flags"));

      this.WeaponDamageMessage = xml.GetElementValue("WeaponDamageMessage");

      this.Race = RaceData.LookupRace(xml.GetElementValue( "Race", "human"));
      this.Guild = GuildData.Lookup(xml.GetElementValue("Guild"), false);
      
      this.Alignment = xml.GetElementValue("Alignment");

      if(this.Flags.IsSet("Healer") && !this.Guild) {
        this.Guild = GuildData.Lookup("healer");
      }

      if(xml.PROTECTS && xml.PROTECTS[0] && xml.PROTECTS[0].ROOM) {
        for(var protectsxml of xml.PROTECTS[0].ROOM) {
          this.Protects.push(protectsxml.GetAttributeValueInt("VNum"));
        }
      }

      if (xml.SHOP && xml.SHOP[0])
      {
          this.Flags.SETBIT(Character.ActFlags.Shopkeeper);
          var shopdata = xml.SHOP[0];
          this.BuyProfitPercent = shopdata.GetAttributeValueInt("ProfitBuy");
          this.SellProfitPercent = shopdata.GetAttributeValueInt("ProfitSell");
          this.ShopOpenHour = shopdata.GetAttributeValueInt("OpenHour");
          this.ShopCloseHour = shopdata.GetAttributeValueInt("CloseHour");
          Utility.ParseFlags(this.BuyTypes, shopdata.GetAttributeValue("BuyTypes"));
          if (shopdata.PET)
          {
              for(var pet of shopdata.PET)
              {
                  this.PetVNums.push(pet.GetAttributeValueInt("VNum"));
              }
          }
      }
      if(xml.LEARNED && xml.LEARNED[0] && xml.LEARNED[0].SKILLSPELL) {
        for(var skillspell of xml.LEARNED[0].SKILLSPELL) {
          var name = skillspell.GetAttributeValue("Name");
          var percent = skillspell.GetAttributeValue("Value");
          var level = skillspell.GetAttributeValue("Level");
          var skill = SkillSpell.SkillLookup(name);
          if(skill) {
            var learnastype = {Skill: true};
            
            if(skill.SkillTypes["Skill"]) learnastype = {Skill: true};
            else if(skill.SkillTypes["Supplication"] && (!this.Guild || this.Guild.CastType == "Commune")) learnastype = {Supplication: true};
            else if(skill.SkillTypes["Spell"] && (!this.Guild || this.Guild.CastType == "Cast")) learnastype = {Spell: true};
            else if(skill.SkillTypes["Song"] && (!this.Guild || this.Guild.CastType == "Sing")) learnastype = {Song: true};
            this.Learned[skill.Name] = {Name: skill.Name, Percent: percent, Level: level, LearnedAs: learnastype};
          }
        }
      }

      if(xml.PROGRAMS && xml.PROGRAMS[0] && xml.PROGRAMS[0].PROGRAM) {
        for(var program of xml.PROGRAMS[0].PROGRAM) {
          this.Programs.push(program.GetAttributeValue("Name"));
        }
      }
      
    }
    if(!area.NPCTemplates[this.VNum])
      area.NPCTemplates[this.VNum] = this;
    else
      Game.log(`NPCTemplate ${this.VNum} already exists in area ${this.Name}.`, Game.LogLevels.Warning);

    if(!NPCTemplateData.Templates[this.VNum])
      NPCTemplateData.Templates[this.VNum] = this;
    else
      Game.log(`NPCTemplate ${this.VNum} already exists.`, Game.LogLevels.Warning);
  }

  Element(xml) {
    var element = xml.ele("NPC");
    element.ele("VNum", this.VNum);
    element.ele("Name", this.Name);
    element.ele("ShortDescription", this.ShortDescription);
    element.ele("LongDescription", this.LongDescription);
    element.ele("Description", this.Description);

    element.ele("Level", this.Level);
    element.ele("Silver", this.Silver);
    element.ele("Gold", this.Gold);

    element.ele("DamRoll", this.DamageRoll);
    element.ele("HitRoll", this.HitRoll);

    element.ele("Sex", this.Sex);

    if(this.Race)
    element.ele("Race", this.Race.Name);
    
    if(this.Guild)
    element.ele("Guild", this.Guild.Name);

    element.ele("Size", this.Size);
    element.ele("Alignment", this.Alignment);
    
    element.ele("SavingThrow", this.SavingThrow);
    element.ele("ArmorClass", this.ArmorClass);

    element.ele("ArmorBash", this.ArmorBash);
    element.ele("ArmorSlash", this.ArmorSlash);
    element.ele("ArmorPierce", this.ArmorPierce);
    element.ele("ArmorExotic", this.ArmorExotic);

    element.ele("HitPointDiceSides", this.HitPointDice[0] || 0);
    element.ele("HitPointDiceCount", this.HitPointDice[1] || 0);
    element.ele("HitPointDiceBonus", this.HitPointDice[2] || 0);

    element.ele("ManaPointDiceSides", this.ManaPointDice[0] || 0);
    element.ele("ManaPointDiceCount", this.ManaPointDice[1] || 0);
    element.ele("ManaPointDiceBonus", this.ManaPointDice[2] || 0);

    element.ele("DamageDiceSides", this.DamageDice[0] || 0);
    element.ele("DamageDiceCount", this.DamageDice[1] || 0);
    element.ele("DamageDiceBonus", this.DamageDice[2] || 0);

    var stats = element.ele("PermanentStats");
    stats.ele("Strength", this.PermanentStats[0]);
    stats.ele("Wisdom", this.PermanentStats[1]);
    stats.ele("Intelligence", this.PermanentStats[2]);
    stats.ele("Dexterity", this.PermanentStats[3]);
    stats.ele("Constitution", this.PermanentStats[4]);
    stats.ele("Charisma", this.PermanentStats[5]);
        

    element.ele("WeaponDamageMessage", this.WeaponDamageMessage);
    element.ele("AffectedBy", Utility.JoinFlags(this.AffectedBy));
    element.ele("Flags", Utility.JoinFlags(this.Flags));
    element.ele("Immune", Utility.JoinFlags(this.ImmuneFlags));
    element.ele("Resist", Utility.JoinFlags(this.ResistFlags));
    element.ele("Vulnerable", Utility.JoinFlags(this.VulnerableFlags));


    if(this.Protects.length > 0) {
      var protectesele = element.ele("Protects")
      for(var vnum of this.Protects) {
        var protectele = protectesele.ele("Room");
        protectele.attribute("VNum", vnum);

      }
    }

    if(this.Programs.length > 0) {
      var psele = element.ele("Programs");
      for(var program of this.Programs) {
        var pele = psele.element("Program");
        pele.attribute("Name", program);
      }
    }

    if(this.Flags.IsSet(Character.ActFlags.Shopkeeper)) {
      var shopele = element.ele("Shop");
      shopele.attribute("ProfitBuy", 100);
      shopele.attribute("ProfitSell", 100);
      shopele.attribute("OpenHour", 100);
      shopele.attribute("CloseHour", 100);
      shopele.attribute("BuyTypes", Utility.JoinFlags(this.BuyTypes));
      if(this.PetVNums.length > 0) {
        for(var vnum of this.PetVNums) {
          shopele.ele("Pet");
          shopele.attribute("VNum", vnum);
        }
      }
    }

    if(Object.keys(this.Learned).length > 0) {
      var learnedxml = element.ele("Learned");
      for(var learnedkey in this.Learned) {
        var learned = this.Learned[learnedkey];
        var skillspellxml = learnedxml.ele("SkillSpell");
        skillspellxml.attribute("Name", learned.Name);
        skillspellxml.attribute("Percent", learned.Percent);
        skillspellxml.attribute("Level", learned.Level);
        skillspellxml.attribute("LearnedAs", Utility.JoinFlags(learned.LearnedAs));
      }
    }
  }
}

module.exports = NPCTemplateData;