const XmlHelper = require("./XmlHelper");
const Character = require("./Character");
const Utility = require("./Utility");


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
    }
    if(!area.NPCTemplates[this.VNum])
      area.NPCTemplates[this.VNum] = this;
    else
      console.log(`NPCTemplate ${this.VNum} already exists in area ${this.Name}.`);

    if(!NPCTemplateData.Templates[this.VNum])
      NPCTemplateData.Templates[this.VNum] = this;
    else
      console.log(`NPCTemplate ${this.VNum} already exists.`);
  }
}

module.exports = NPCTemplateData;