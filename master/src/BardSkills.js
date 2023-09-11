const PhysicalStats = require("./PhysicalStats");
const Utility = require("./Utility");
const Character = require("./Character");
const ItemData = require("./ItemData");
const Combat = require("./Combat");
const SkillSpell = require("./SkillSpell");
const AffectData = require("./AffectData");
const DamageMessage = require("./DamageMessage");
const RoomData = require("./RoomData");
const ItemTemplateData = require("./ItemTemplateData");
const ExitData = require("./ExitData");

Character.DoCommands.DoLore = function(ch, args) {
    var [item, count] = ch.GetItemInventory(args);
    if(!item) [item] = ch.GetItemEquipment(args, count);

    if(Utility.IsNullOrEmpty(args)) {
        ch.send("Inspect which item?\n\r");
    } else if(!item) {
        ch.send("You aren't carrying or wearing that.\n\r");
    } else {
        var buffer = "";
        buffer += ("-".repeat(80) + "\n\r");
        buffer += Utility.Format("Object {0} can be referred to as '{1}'\n\rIt is of type {2} and level {3}\n\r", item.ShortDescription, item.Name,
            Utility.JoinFlags(item.ItemTypes), item.Level);
        buffer += Utility.Format("It is worth {0} silver and weighs {1} pounds.\n\r", item.Value, item.Weight);

        if (item.ItemTypes.ISSET(ItemData.ItemTypes.Weapon))
        {
            if (item.WeaponDamageType != null)
                buffer += Utility.Format("Damage Type is {0}\n\r", item.WeaponDamageType);
            buffer += Utility.Format("Weapon Type is {0} with damage dice of {1} (avg {2})\n\r", item.WeaponType, Utility.FormatDice(item.DamageDice), Utility.Average(item.DamageDice));

        }

        if (item.ItemTypes.ISSET(ItemData.ItemTypes.Container))
        {
            buffer += Utility.Format("It can hold {0} pounds.", item.MaxWeight);
        }

        if (item.ItemTypes.ISSET(ItemData.ItemTypes.Food))
        {
            buffer += Utility.Format("It is edible and provides {0} nutrition.\n\r", item.Nutrition);
        }

        if (item.ItemTypes.ISSET(ItemData.ItemTypes.DrinkContainer))
        {
            buffer += Utility.Format("Nutrition {0}, Drinks left {1}, Max Capacity {2}, it is filled with '{3}'\n\r", item.Nutrition, item.Charges, item.MaxCharges, item.Liquid);
        }

        buffer += Utility.Format("It is made out of '{0}'\n\r", item.Material);

        if (item.Timer > 0)
            buffer += Utility.Format("It will decay in {0} hours.\n\r", item.Timer);

        if (item.ItemTypes.ISSET(ItemData.ItemTypes.Armor) || item.ItemTypes.ISSET(ItemData.ItemTypes.Clothing))
        {
            buffer += Utility.Format("It provides armor against bash {0}, slash {1}, pierce {2}, magic {3}\n\r", item.ArmorBash, item.ArmorSlash, item.ArmorPierce, item.ArmorExotic);
        }
        buffer += Utility.Format("It can be worn on {0} and has extra flags of {1}.\n\r", Utility.JoinFlags(item.WearFlags),
            Utility.JoinFlags(item.ExtraFlags));

        buffer += Utility.Format("Affects: \n   {0}\n\r",
        item.Affects.Select(function(aff) {
                return aff.Where == AffectData.AffectWhere.ToObject;
            }).joinWithTransform(function(aff) {
                return  aff.Location + " " + aff.Modifier
            }, "\n   "));

        if (item.Spells && (
                item.ItemTypes.ISSET(ItemData.ItemTypes.Staff) ||
                item.ItemTypes.ISSET(ItemData.ItemTypes.Wand) || 
                item.ItemTypes.ISSET(ItemData.ItemTypes.Scroll) || 
                item.ItemTypes.ISSET(ItemData.ItemTypes.Potion)))
        {
            buffer += Utility.Format("It contains the following spells:\n\r   {0}", item.Spells.joinWithTransform(function(itemspell) { 
                return itemspell.SpellName + " [lvl " + itemspell.Level + "]";},"\n   ") + "\n\r");
        }

        if (item.ItemTypes.ISSET(ItemData.ItemTypes.Staff) || item.ItemTypes.ISSET(ItemData.ItemTypes.Wand))
        {
            buffer += Utility.Format("It has {0} of {1} charges left\n\r", item.Charges, item.MaxCharges);
        }

        buffer += "-".repeat(80) + "\n\r";
        ch.send(buffer);
    }
}

Character.DoCommands.DoRoundhouse = function(ch, args)
{
    var dam_each = [
        0,
        4,  5,  6,  7,  8,   10,  13,  15,  20,  25,
        30, 35, 40, 45, 50, 55, 55, 55, 56, 57,
        58, 58, 59, 60, 61, 61, 62, 63, 64, 64,
        65, 66, 67, 67, 68, 69, 70, 70, 71, 72,
        73, 73, 74, 75, 76, 76, 77, 78, 79, 79,
        90,110,120,150,170,200,230,500,500,500
    ];
    var skill = SkillSpell.SkillLookup("roundhouse");
    var chance;
    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    var dam;
    var level = ch.Level;
    var [victim] = ch.GetCharacterHere(args);

    if (args.ISEMPTY() && (victim = ch.Fighting) == null)
    {
        ch.send("You aren't fighting anyone.\n\r");
        return;
    }
    else if ((!args.ISEMPTY() && !victim))
    {
        ch.send("You don't see them here.\n\r");
        return;
    }

    //chance += level / 10;

    ch.WaitState(skill.WaitTime);
    if (chance > Utility.NumberPercent())
    {
        if (ch.IsNPC)
            level = Math.min(level, 51);
        level = Math.min(level, dam_each.Length - 1);
        level = Math.max(0, level);

        dam = Utility.Random(dam_each[level] / 2, dam_each[level]);

        ch.Act("$n roundhouses $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n roundhouses you!", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You roundhouse $N.", victim, null, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, true, 1);
        Combat.Damage(ch, victim, dam, skill, DamageMessage.WeaponDamageTypes.Bash);
    }
    else
    {
        ch.Act("$n attempts to roundhouse $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n attempts to roundhouse you!", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You attempt to roundhouse $N.", victim, null, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, false, 1);
        Combat.Damage(ch, victim, 0, skill, DamageMessage.WeaponDamageTypes.Bash);
    }
    return;
}