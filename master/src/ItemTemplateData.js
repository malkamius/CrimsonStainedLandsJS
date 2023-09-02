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