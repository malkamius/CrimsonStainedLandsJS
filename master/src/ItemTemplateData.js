StringUtility = require("./StringUtility");

class ItemTemplateData {
    VNum = 0;
    Name = "";
    ShortDescription = "";
    LongDescription = "";
    Description = "";
    ExtraDescriptions = {};
    Contains = Array();
    Affects = Array();
    Room = null;
    HelbBy = null;
    ContainedIn = null;
    WearFlags = {};
    WeaponType = null;
    WeaponDamageType = null;
    ExtraFlags = {};
    ItemTypes = {};
    Level = 0;
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

    constructor(area, xml) {
        this.VNum = XmlHelper.GetElementValue(xml, "vnum");
        this.Name = XmlHelper.GetElementValue(xml, "Name");
        this.ShortDescription = XmlHelper.GetElementValue(xml, "ShortDescription");
        this.LongDescription = XmlHelper.GetElementValue(xml, "LongDescription");
        this.Description = XmlHelper.GetElementValue(xml, "Description");
        StringUtility.ParseFlags(this.ExtraFlags, XmlHelper.GetElementValue(xml, "ExtraFlags"));
        StringUtility.ParseFlags(this.WearFlags, XmlHelper.GetElementValue(xml, "WearFlags"));
        StringUtility.ParseFlags(this.ItemTypes, XmlHelper.GetElementValue(xml, "ItemTypes"));
        this.WeaponType = XmlHelper.GetElementValue(xml, "WeaponType");

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

ItemTemplateData.ItemTemplates = {};
module.exports = ItemTemplateData;
module.exports.ItemTemplates = {};