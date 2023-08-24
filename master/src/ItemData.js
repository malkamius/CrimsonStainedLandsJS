const XmlHelper = require("./XmlHelper");
const ItemTemplateData = require('./ItemTemplateData');

class ItemData {
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

    constructor(vnum, room, character) {
        var template = ItemTemplateData.ItemTemplates[vnum];
        if(template) {
            this.VNum = template.VNum;
            this.Name = template.Name;
            this.ShortDescription = template.ShortDescription;
            this.LongDescription = template.LongDescription;
            this.Description = template.Description;
            Object.assign(this.ExtraFlags, template.ExtraFlags);
            Object.assign(this.ItemTypes, template.ItemTypes);
            Object.assign(this.WearFlags, template.WearFlags);

            this.WeaponType = template.WeaponType;
            this.WeaponDamageType = template.WeaponDamageType;

            if(room) {
                room.Items.unshift(this);
            }
        } else {
            console.log("Item " + this.VNum + " not found")
        }

    }

    DisplayFlags(to) {
        var flags = "";

        if (this.ExtraFlags.Glow)
            flags += "(Glowing)";
        if (this.ExtraFlags.Hum)
            flags += "(Humming)";
        if (this.ExtraFlags.Invisiblility)
            flags += "(Invis)";
        // if (this.extraFlags.Magic &&
        //     (to.IsAffected(AffectFlags.DetectMagic) || to.IsAffected(AffectFlags.ArcaneVision)))
        //     flags += "(Magic)";
        // if (this.IsAffected(AffectFlags.Poison))
        //     flags += "(Poisonous)";

        if (this.Durability == 0)
            flags += "(Broken)";
        else if (this.Durability < this.MaxDurability * .75)
            flags += "(Damaged)";

        if (flags.length > 0) flags += " ";
        return flags;
    }

    Display(to) {
        // if (!to.CanSee(this))
        //     return "something";
        return this.ShortDescription && this.ShortDescription.length > 0 ? this.ShortDescription : this.Name;
    }

    DisplayToRoom(to) {
        // if (!to.CanSee(this))
        //     return "something is here.";
        return (this.LongDescription && this.LongDescription.length > 0 ?  
                this.LongDescription : (this.ShortDescription && this.ShortDescription.length > 0?
                    this.ShortDescription : 
                        this.Name.trim()));
    }

    Load(xml) {
        this.Name = XmlHelper.GetElementValue(xml, "NAME", this.Name);
        this.ShortDescription = XmlHelper.GetElementValue(xml, "ShortDescription", this.ShortDescription);
        this.LongDescription = XmlHelper.GetElementValue(xml, "LongDescription", this.LongDescription);
        if(xml.CONTAINS) {
            for(const containsxml of xml.CONTAINS) {
				if(containsxml.ITEM)
					for(const itemxml of containsxml.ITEM) {
						var item = new ItemData(itemxml.VNUM[0]);
						item.Load(itemxml);
                        this.Contains.push(item);
				}
			}
        }
    }
}

module.exports = ItemData;