const XmlHelper = require("./XmlHelper");

const Utility = require("./Utility");

class ItemTemplateData {
    static ItemTemplates = {};
    VNum = 0;
    Name = "";
    ShortDescription = "";
    LongDescription = "";
    Description = "";
    ExtraDescriptions = {};
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
    
    constructor(area, xml) {
        this.VNum = XmlHelper.GetElementValue(xml, "vnum");
        this.Name = XmlHelper.GetElementValue(xml, "Name");
        this.ShortDescription = XmlHelper.GetElementValue(xml, "ShortDescription");
        this.LongDescription = XmlHelper.GetElementValue(xml, "LongDescription");
        this.Description = XmlHelper.GetElementValue(xml, "Description");
        this.Material = XmlHelper.GetElementValue(xml, "Material");
        this.Liquid = XmlHelper.GetElementValue(xml, "Liquid");
        Utility.ParseFlags(this.ExtraFlags, XmlHelper.GetElementValue(xml, "ExtraFlags"));
        Utility.ParseFlags(this.WearFlags, XmlHelper.GetElementValue(xml, "WearFlags"));
        Utility.ParseFlags(this.ItemTypes, XmlHelper.GetElementValue(xml, "ItemTypes"));
        this.WeaponType = XmlHelper.GetElementValue(xml, "WeaponType");
        this.WeaponDamageType = XmlHelper.GetElementValue(xml, "WeaponDamageType");
        this.Level = XmlHelper.GetElementValueInt(xml, "Level");
        this.Value = XmlHelper.GetElementValueInt(xml, "Cost");
        this.Value = XmlHelper.GetElementValueInt(xml, "Value", this.Value);
        this.DamageDice[0] = XmlHelper.GetElementValueInt(xml, "DiceSides");
        this.DamageDice[1] = XmlHelper.GetElementValueInt(xml, "DiceCount");
        this.DamageDice[2] = XmlHelper.GetElementValueInt(xml, "DiceBonus");
        this.Weight = XmlHelper.GetElementValueFloat(xml, "Weight");
        this.MaxWeight = XmlHelper.GetElementValueFloat(xml, "MaxWeight");
        this.Silver = XmlHelper.GetElementValueInt(xml, "Silver");
        this.Gold = XmlHelper.GetElementValueInt(xml, "Gold");
        this.Charges = XmlHelper.GetElementValueInt(xml, "Charges");
        this.MaxCharges = XmlHelper.GetElementValueInt(xml, "MaxCharges");
        this.ArmorBash = XmlHelper.GetElementValueInt(xml, "ArmorBash");
        this.ArmorPierce = XmlHelper.GetElementValueInt(xml, "ArmorPierce");
        this.ArmorSlash = XmlHelper.GetElementValueInt(xml, "ArmorSlash");
        this.ArmorExotic = XmlHelper.GetElementValueInt(xml, "ArmorExotic");
        this.Timer = xml.GetElementValueInt("Timer", -1)
        if(!area.ItemTemplates[this.VNum])
            area.ItemTemplates[this.VNum] = this;
        else
            console.log("Item " + this.VNum + " already exists in " + area.Name + ".");
        if(!ItemTemplateData.ItemTemplates[this.VNum])
            ItemTemplateData.ItemTemplates[this.VNum] = this;
        else
            console.log("Item " + this.VNum + " already exists globally.");
    }
}

module.exports = ItemTemplateData;