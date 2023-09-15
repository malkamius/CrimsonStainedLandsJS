const XmlHelper = require("./XmlHelper");
const Game = require('./Game');
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
    
    constructor(area, xml, vnum) {
        this.VNum = vnum;

        if(xml) {
            this.VNum = xml.GetElementValueInt( "vnum");
            this.Name = xml.GetElementValue( "Name");
            this.ShortDescription = xml.GetElementValue( "ShortDescription");
            this.LongDescription = xml.GetElementValue( "LongDescription");
            this.Description = xml.GetElementValue( "Description");
            this.Material = xml.GetElementValue( "Material");
            this.Liquid = xml.GetElementValue( "Liquid");
            Utility.ParseFlags(this.ExtraFlags, xml.GetElementValue( "ExtraFlags"));
            const ItemData = require("./ItemData");
            if(this.ExtraFlags.ISSET(ItemData.ExtraFlags.Locked)) {
                this.ExtraFlags.SETBIT(ItemData.ExtraFlags.Lockable);
            }
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
        }
        if(!area.ItemTemplates[this.VNum])
            area.ItemTemplates[this.VNum] = this;
        else
            Game.log("Item " + this.VNum + " already exists in " + area.Name + ".", Game.LogLevels.Warning);
        if(!ItemTemplateData.Templates[this.VNum])
            ItemTemplateData.Templates[this.VNum] = this;
        else
            Game.log("Item " + this.VNum + " already exists globally.", Game.LogLevels.Warning);
    }

    Element(xml) {
        xml = xml.ele("Item");
        xml.ele("VNum", this.VNum);
        xml.ele("Name", this.Name);
        xml.ele("ShortDescription", this.ShortDescription);
        xml.ele("LongDescription", this.LongDescription);
        xml.ele("Description", this.Description);
        xml.ele("Material", this.Material);
        xml.ele("Liquid", this.Liquid);
        xml.ele("ExtraFlags", Utility.JoinFlags(this.ExtraFlags));
        xml.ele("WearFlags", Utility.JoinFlags(this.WearFlags));
        xml.ele("ItemTypes", Utility.JoinFlags(this.ItemTypes));
        xml.ele("WeaponType", this.WeaponType);
        xml.ele("WeaponDamageType", this.WeaponDamageType);
        xml.ele("Level", this.Level);
        xml.ele("Cost", this.Value);
        xml.ele("DiceSides", this.DamageDice[0]);
        xml.ele("DiceCount", this.DamageDice[1]);
        xml.ele("DiceBonus", this.DamageDice[2]);
        xml.ele("Weight", this.Weight);
        xml.ele("Silver", this.Silver);
        xml.ele("Gold", this.Gold);
        xml.ele("Charges", this.Charges);
        xml.ele("MaxCharges", this.MaxCharges);
        xml.ele("ArmorBash", this.ArmorBash);
        xml.ele("ArmorPierce", this.ArmorPierce);
        xml.ele("ArmorSlash", this.ArmorSlash);
        xml.ele("ArmorExotic", this.ArmorExotic);
        xml.ele("Nutrition", this.Nutrition);
        xml.ele("Durability", this.Durability);
        xml.ele("MaxDurability", this.MaxDurability);
        if(this.Timer > 0)
        xml.ele("Timer", this.Timer);
        xml.ele("MaxWeight", this.MaxWeight);
        if(this.Keys.length > 0) {
            var keys = xml.ele("Keys");
            for(var vnum of this.Keys) {
                var key = keys.ele("Key");
                key.attribute("VNum", vnum);
            }
        }

        if(this.Spells.length > 0) {
            var spells = xml.ele("Spells");
            for(var spell of this.Spells) {
                var spellxml = spells.ele("Spell");
                spellxml.attribute("SpellName", spell.SpellName);
                spellxml.attribute("Level", spell.Level);
            }
        }
        
        if(this.Affects.length > 0) {
            var affects = xml.ele("Affects");
            for(var aff of this.Affects) {
                aff.Element(affects);
            }
        }

        if(this.ExtraDescriptions.length > 0) {
            var edsxml = xml.ele("ExtraDescriptions");
            for(var ed of this.ExtraDescriptions) {
                var edxml = edsxml.ele("ExtraDescription");
                edxml.ele("Keyword", ed.Keyword);
                edxml.ele("Description", ed.Description);
            }
        }
    }
}

module.exports = ItemTemplateData;