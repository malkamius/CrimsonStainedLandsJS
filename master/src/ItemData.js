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

    static WearFlags =
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
    };

    static ItemTypes =
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
    };

    static WeaponTypes =
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
    };

    static ExtraFlags =
    {
        "Glow": "Glow",
        "Hum": "Hum",
        "Dark": "Dark",
        "Lock": "Lock",
        "Locked": "Locked",
        "Evil": "Evil",
        "Invisibility": "Invisibility",
        "Magic": "Magic",
        "NoDrop": "NoDrop",
        "Bless": "Bless",
        "AntiGood": "AntiGood",
        "AntiNeutral": "AntiNeutral",
        "AntiEvil": "AntiEvil",
        "NoRemove": "NoRemove",
        "NoPurge": "NoPurge",
        "RotDeath": "RotDeath",
        "VisDeath": "VisDeath",
        "Fixed": "Fixed",
        "NoDisarm": "NoDisarm",
        "NoLocate": "NoLocate",
        "MeltDrop": "MeltDrop",
        "Closable": "Closable",
        "PickProof": "PickProof",
        "Closed": "Closed",
        "WeaponFlaming": "WeaponFlaming",
        "Poison": "Poison",
        "Heart": "Heart",
        "PouchNourishment": "PouchNourishment",
        "EverfullSkin": "EverfullSkin",
        "BurnProof": "BurnProof",
        "Flaming": "Flaming",
        "Frost": "Frost",
        "Vorpal": "Vorpal",
        "Shocking": "Shocking",
        "Unholy": "Unholy",
        "Sharp": "Sharp",
        "TwoHands": "TwoHands",
        "NoUncurse": "NoUncurse",
        "SellExtract": "SellExtract",
        "PutIn": "PutIn",
        "PutOn": "PutOn",
        "PutAt": "PutAt",
        "StandAt": "StandAt",
        "StandOn": "StandOn",
        "SitAt": "SitAt",
        "SitIn": "SitIn",
        "SitOn": "SitOn",
        "RestIn": "RestIn",
        "RestOn": "RestOn",
        "RestAt": "RestAt",
        "SleepAt": "SleepAt",
        "SleepOn": "SleepOn",
        "SleepIn": "SleepIn",
        "Inventory": "Inventory",
        "Outfit": "Outfit",
        "UniqueEquip": "UniqueEquip",
        "Closeable": "Closable",
        "Invis": "Invisibility"
    };

    static WearSlotIDs = {
        "None": "None",
        "LeftFinger": "LeftFinger",
        "RightFinger": "RightFinger",
        "About": "About",
        "Neck1": "Neck1",
        "Neck2": "Neck2",
        "Head": "Head",
        "Chest": "Chest",
        "Legs": "Legs",
        "Feet": "Feet",
        "LeftWrist": "LeftWrist",
        "RightWrist": "RightWrist",
        "Wield": "Wield",
        "DualWield": "DualWield",
        "Held": "Held",
        "Shield": "Shield",
        "Floating": "Floating",
        "Tattoo": "Tattoo",
        "Hands": "Hands",
        "Arms": "Arms",
        "Waist": "Waist"
    };
    
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
    Value = 0;
    Silver = 0;
    Gold = 0;
    Timer = -1;
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
    Keys = [];

    constructor(vnum, room, character) {
        var template;
        if(vnum instanceof ItemTemplateData) {
            template = vnum;
            vnum = template.VNum;
        }
        else {
            template = ItemTemplateData.ItemTemplates[vnum];
        }

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
            
            this.Level = template.Level;
            this.Value = template.Value;
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
            this.Nutrition = template.Nutrition;
            
            this.Timer = template.Timer;

            this.ArmorBash = template.ArmorBash;
            this.ArmorPierce = template.ArmorPierce;
            this.ArmorSlash = template.ArmorSlash;
            this.ArmorExotic = template.ArmorExotic;
            this.Keys = Utility.CloneArray(template.Keys);

            for(var spell of template.Spells) {
                this.Spells.push({Level: spell.Level, SpellName: spell.SpellName, Spell: spell.Spell});
            }

            for(var affect of template.Affects) {
                this.Affects.push(new AffectData(affect));
            }

            if(room) {
                room.Items.unshift(this);
                this.Room = room;
            } else if(character) {
                character.Inventory.unshift(this);
                this.CarriedBy = character;
            }
            ItemData.Items.unshift(this);
        } else {
            console.log("Item " + this.VNum + " not found")
        }

    }

    DisplayFlags(to) {
        var flags = "";

        if (this.ExtraFlags.ISSET(ItemData.ExtraFlags.Glow))
            flags += "(Glowing)";
        if (this.ExtraFlags.ISSET(ItemData.ExtraFlags.Hum))
            flags += "(Humming)";
        if (this.ExtraFlags.ISSET(ItemData.ExtraFlags.Invisiblility))
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
        this.VNum = xml.GetElementValue( "VNUM", this.VNum);
        this.Name = xml.GetElementValue( "NAME", this.Name);
        this.ShortDescription = xml.GetElementValue( "ShortDescription", this.ShortDescription);
        this.LongDescription = xml.GetElementValue( "LongDescription", this.LongDescription);
        this.Value = xml.GetElementValueInt("Cost", this.Value);
        this.Value = xml.GetElementValueInt("Value", this.Value);

        this.Timer = xml.GetElementValueInt("Value", this.Timer);
        if(xml.WEARFLAGS) {
            this.WearFlags = {};
            Utility.ParseFlags(this.WearFlags, xml.GetElementValue( "WearFlags"));
        }
        if(xml.EXTRAFLAGS) {
            this.ExtraFlags = {};
            Utility.ParseFlags(this.ExtraFlags, xml.GetElementValue("ExtraFlags"));

            if(this.ExtraFlags.ISSET(ItemData.ExtraFlags.Locked)) this.ExtraFlags.SETBIT(ItemData.ExtraFlags.Closed);
            if(this.ExtraFlags.ISSET(ItemData.ExtraFlags.Closed)) {
                this.ExtraFlags.SETBIT(ItemData.ExtraFlags.Closable);
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
        
        if(this.Timer > -1) {
            itemele.ele("Timer", this.Timer);
        }

        itemele.ele("Value", this.Value);
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
            this.CarriedBy.Inventory.Remove(this)
            if((slot = this.CarriedBy.GetEquipmentWearSlot(this)))
                delete this.CarriedBy.Equipment[slot];
            this.CarriedBy = null;
        }

        if(this.ContainedIn) {
            this.ContainedIn.Contains.Remove(this);
            this.ContainedIn = null;
        }

        if(this.Room) {
            this.Room.Items.splice(this.Room.Items.indexOf(this), 1);
            this.Room = null;
        }

        ItemData.Items.Remove(this);
    }
}

module.exports = ItemData;