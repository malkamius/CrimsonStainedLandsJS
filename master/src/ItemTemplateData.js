const XmlHelper = require("./XmlHelper");

const Utility = require("./Utility");

class ItemTemplateData {
    static Templates = {};
    VNum = 0;
    Name = "";
    ShortDescription = "";
    LongDescription = "";
    Description = "";
    ExtraDescriptions = [];
    Contains = Array();
    Affects = Array();
    Room = null;
    CarriedBy = null;
    ContainedIn = null;
    WearFlags = {};
    WeaponType = "";
    WeaponDamageType = "";
    ExtraFlags = {};
    ItemTypes = {};
    Level = 0;
    Value = 0;
    Nutrition = 48;
    Weight = 0;
    DamageDice = [0,0,0];
    Silver = 0;
    Gold = 0;
    Owner = "";
    MaxWeight = 0.0;
    Material = "";
    Liquid = "";
    Charges = 0;
    MaxCharges = 0;
    ArmorBash = 0;
    ArmorPierce = 0;
    ArmorSlash = 0;
    ArmorExotic = 0;
    Spells = Array();
    Timer = -1;
    Keys = [];
    Durability = 100;
    MaxDurability = 100;
    
    constructor(area, xml) {
        this.VNum = xml.GetElementValue( "vnum");
        this.Name = xml.GetElementValue( "Name");
        this.ShortDescription = xml.GetElementValue( "ShortDescription");
        this.LongDescription = xml.GetElementValue( "LongDescription");
        this.Description = xml.GetElementValue( "Description");
        this.Material = xml.GetElementValue( "Material");
        this.Liquid = xml.GetElementValue( "Liquid");
        Utility.ParseFlags(this.ExtraFlags, xml.GetElementValue( "ExtraFlags"));
        Utility.ParseFlags(this.WearFlags, xml.GetElementValue( "WearFlags"));
        Utility.ParseFlags(this.ItemTypes, xml.GetElementValue( "ItemTypes"));
        this.WeaponType = xml.GetElementValue( "WeaponType");
        this.WeaponDamageType = xml.GetElementValue( "WeaponDamageType");
        this.Level = xml.GetElementValueInt( "Level");
        this.Value = xml.GetElementValueInt( "Cost");
        this.Value = xml.GetElementValueInt( "Value", this.Value);
        this.DamageDice[0] = xml.GetElementValueInt( "DiceSides");
        this.DamageDice[1] = xml.GetElementValueInt( "DiceCount");
        this.DamageDice[2] = xml.GetElementValueInt( "DiceBonus");
        this.Weight = XmlHelper.GetElementValueFloat(xml, "Weight");
        this.MaxWeight = XmlHelper.GetElementValueFloat(xml, "MaxWeight");
        this.Silver = xml.GetElementValueInt( "Silver");
        this.Gold = xml.GetElementValueInt( "Gold");
        this.Charges = xml.GetElementValueInt( "Charges");
        this.MaxCharges = xml.GetElementValueInt( "MaxCharges");
        this.ArmorBash = xml.GetElementValueInt( "ArmorBash");
        this.ArmorPierce = xml.GetElementValueInt( "ArmorPierce");
        this.ArmorSlash = xml.GetElementValueInt( "ArmorSlash");
        this.ArmorExotic = xml.GetElementValueInt( "ArmorExotic");
        this.Nutrition = xml.GetElementValueInt( "Nutrition");

        this.Durability = xml.GetElementValueInt( "Durability", 100);
        this.MaxDurability = xml.GetElementValueInt( "MaxDurability", 100);

        this.Timer = xml.GetElementValueInt("Timer", -1);

        if(xml.KEYS && xml.KEYS[0].KEY) {
            for(var key of xml.KEYS[0].KEY) {
                var vnum = key.GetAttributeValueInt("vnum");
                if(vnum && vnum != -1) {
                    this.Keys.push(vnum);
                }
            }
        }
        
        const SkillSpell = require('./SkillSpell');
        if(xml.SPELLS && xml.SPELLS[0].SPELL) {
            for(var spellxml of xml.SPELLS[0].SPELL) {
                var spell = {Level: spellxml.GetAttributeValueInt("Level"), SpellName: spellxml.GetAttributeValue("SpellName")};
                spell.Spell = SkillSpell.SkillLookup(spell.SpellName);
                this.Spells.push(spell);
            }
        }

        const AffectData = require('./AffectData');
        if(xml.AFFECTS && xml.AFFECTS[0].AFFECT) {
            for(var affxml of xml.AFFECTS[0].AFFECT) {
                var aff = new AffectData({Xml: affxml});
                this.Affects.push(aff);
            }
        }

        if(xml.EXTRADESCRIPTIONS && xml.EXTRADESCRIPTIONS[0].EXTRADESCRIPTION) {
            for(var edxml of xml.EXTRADESCRIPTIONS[0].EXTRADESCRIPTION) {
                var extradescription = {Keyword: edxml.GetElementValue("Keyword"), Description: edxml.GetElementValue("Description")};
                this.ExtraDescriptions.push(extradescription);
            }
        }

        if(!area.ItemTemplates[this.VNum])
            area.ItemTemplates[this.VNum] = this;
        else
            console.log("Item " + this.VNum + " already exists in " + area.Name + ".");
        if(!ItemTemplateData.Templates[this.VNum])
            ItemTemplateData.Templates[this.VNum] = this;
        else
            console.log("Item " + this.VNum + " already exists globally.");
    }
}

module.exports = ItemTemplateData;