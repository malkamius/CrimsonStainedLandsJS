const XmlHelper = require("./XmlHelper");
const ItemTemplateData = require('./ItemTemplateData');
const Utility = require('./Utility');
const AffectData = require("./AffectData");
/**
 *
 *
 * @class ItemData
 */
class ItemData {
    static Items = Array();

    static WearFlagsList =
    {
        "Take": "Take",
        "Finger": "Finger",
        "About": "About",
        "Neck": "Neck",
        "Head": "Head",
        "Legs": "Legs",
        "Feet": "Feet",
        "Hands": "Hands",
        "Wield": "Wield",
        "Hold": "Hold",
        "Float": "Float",
        "Tattoo": "Tattoo",
        "Body": "Body",
        "Waist": "Waist",
        "Wrist": "Wrist",
        "Arms": "Arms",
        "Shield": "Shield",
        "NoSac": "NoSac",

        "WearFloat": "Float",
        "Brand": "Tattoo"
    }

    static ItemTypesList =
    {
        "Armor": "Armor",
        "Boat": "Boat",
        "Cabal": "Cabal",
        "Clothing": "Clothing",
        "Container": "Container",
        "Corpse": "Corpse",
        "DrinkContainer": "DrinkContainer",
        "Food": "Food",
        "Fountain": "Fountain",
        "Furniture": "Furniture",
        "Gem": "Gem",
        "Gold": "Gold",
        "Instrument": "Instrument",
        "Jewelry": "Jewelry",
        "Key": "Key",
        "Light": "Light",
        "Map": "Map",
        "Money": "Money",
        "NPCCorpse": "NPCCorpse",
        "Pill": "Pill",
        "Portal": "Portal",
        "Potion": "Potion",
        "RoomKey": "RoomKey",
        "Scroll": "Scroll",
        "Silver": "Silver",
        "Skeleton": "Skeleton",
        "Staff": "Staff",
        "Trash": "Trash",
        "Treasure": "Treasure",
        "Wand": "Wand",
        "Weapon": "Weapon",
        "WarpStone": "WarpStone",
        "PC_Corpse": "Corpse",
        "Talisman": "Staff",
        "ThiefPick": "ThiefPick"
    }
    static WeaponTypesList =
    {
        "None": "None",
        "Sword": "Sword",
        "Axe": "Axe",
        "Dagger": "Dagger",
        "Mace": "Mace",
        "Staff": "Staff",
        "Spear": "Spear",
        "Whip": "Whip",
        "Flail": "Flail",
        "Polearm": "Polearm",
        "Exotic": "Exotic"
    }
    Template = null;
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
        var template;
        if(vnum instanceof ItemTemplateData)
            template = vnum;
        else
            template = ItemTemplateData.ItemTemplates[vnum];
        
        if(template) {
            this.Template = template;
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
            this.DamageDice = Utility.CloneArray(template.DamageDice);
            this.Material = template.Material;
            this.Liquid = template.Liquid;
            this.Weight = template.Weight;
            this.MaxWeight = template.MaxWeight;
            this.Silver = template.Silver;
            this.Gold = template.Gold;
            this.Charges = template.Charges;
            this.MaxCharges = template.MaxCharges;

            this.ArmorBash = template.ArmorBash;
            this.ArmorPierce = template.ArmorPierce;
            this.ArmorSlash = template.ArmorSlash;
            this.ArmorExotic = template.ArmorExotic;

            if(room) {
                room.Items.unshift(this);
                this.Room = room;
            }
            ItemData.Items.unshift(this);
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
        this.VNum = XmlHelper.GetElementValue(xml, "VNUM", this.VNum);
        this.Name = XmlHelper.GetElementValue(xml, "NAME", this.Name);
        this.ShortDescription = XmlHelper.GetElementValue(xml, "ShortDescription", this.ShortDescription);
        this.LongDescription = XmlHelper.GetElementValue(xml, "LongDescription", this.LongDescription);
        
        if(xml.WEARFLAGS) {
            this.WearFlags = {};
            Utility.ParseFlags(this.WearFlags, XmlHelper.GetElementValue(xml, "WearFlags"));
        }
        if(xml.EXTRAFLAGS) {
            this.ExtraFlags = {};
            Utility.ParseFlags(this.ExtraFlags, XmlHelper.GetElementValue(xml, "ExtraFlags"));

            if(this.ExtraFlags.Locked) this.ExtraFlags.Closed = true;
            if(this.ExtraFlags.Closed) {
                this.ExtraFlags.Closable = true;
                this.ExtraFlags.Closeable = true;
            }

        }
        if(xml.AFFECTS) {
            this.Affects = Array();
            for(const affectsxml of xml.AFFECTS) {
				if(affectsxml.AFFECT)
                    for(const affectxml of affectsxml.AFFECT) {
                        var affect = new AffectData({Xml: affectxml});
                        this.Affects.push(affect);
                    }
                }
        }
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

    Element(ele) {
        //var item = this;

        var itemele = ele.ele("Item");
        itemele.ele("VNum", this.VNum);
        itemele.ele("Name", this.Name);
        if(this.ShortDescription != this.Template.ShortDescription)
        itemele.ele("ShortDescription", this.ShortDescription);
        if(this.LongDescription != this.Template.LongDescription)
        itemele.ele("LongDescription", this.LongDescription);
        if(this.Description != this.Template.Description)
        itemele.ele("Description", this.Description);
        if(this.Liquid != this.Template.Liquid)
        itemele.ele("Liquid", this.Liquid);

        itemele.ele("ItemTypes", Utility.JoinFlags(this.ItemTypes));
        itemele.ele("WearFlags", Utility.JoinFlags(this.WearFlags));
        itemele.ele("ExtraFlags", Utility.JoinFlags(this.ExtraFlags));

        if(this.Affects && this.Affects.length > 0) {
            var affectselement = itemele.ele("Affects");
            for(var affect of this.Affects) {
                affect.Element(affectselement);
            }
        }
        var contains = itemele.ele("Contains");
        for(var i = 0; i < this.Contains.length; i++) {
            if(this.Contains[i].VNum == 0 || !this.Contains[i] || !this.Contains[i].Template) continue;
            this.Contains[i].Element(contains)
        }
        return itemele;
    }

    Dispose() {
        if(this.CarriedBy) {
            var slot;
            if(this.CarriedBy.Inventory.indexOf(this) != -1)
                this.CarriedBy.Inventory.splice(this.CarriedBy.Inventory.indexOf(item), 1);
            else if((slot = this.CarriedBy.GetEquipmentWearSlot(this.CarriedBy, item)))
                delete this.CarriedBy.Equipment[slot];
        }

        if(this.Room) {
            this.Room.Items.splice(this.Room.Items.indexOf(this), 1);
        }
    }
}

module.exports = ItemData;