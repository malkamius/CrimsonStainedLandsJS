const Character = require("./Character");
const ItemData = require("./ItemData");
const Utility = require("./Utility");

/**
 *
 *
 * @param {Character} player
 * @param {ItemData} item
 * @param {boolean} [atEnd=false]
 * @return {*} 
 */
function AddInventoryItem(player, item, atEnd = false)
{
    

    if (item.ItemTypes.Money)
    {
        Silver += item.Silver;
        Gold += item.Gold;


        if (player.Flags.AutoSplit)
        {
            var splitamongst = Array();
            // foreach (var other in Room.Characters)
            // {
            //     if (other != this && !other.IsNPC && other.IsSameGroup(this))
            //     {
            //         splitamongst.Add(other);
            //     }
            // }


            // if (splitamongst.Count > 0)
            // {
            //     var share_silver = item.Silver / (splitamongst.Count + 1);
            //     var extra_silver = item.Silver % (splitamongst.Count + 1);

            //     var share_gold = item.Gold / (splitamongst.Count + 1);
            //     var extra_gold = item.Gold % (splitamongst.Count + 1);


            //     Silver -= item.Silver;
            //     Silver += share_silver + extra_silver;
            //     Gold -= item.Gold;
            //     Gold += share_gold + extra_gold;


            //     if (share_silver > 0)
            //     {
            //         send("You split {0} silver coins. Your share is {1} silver.\n\r", item.Silver, share_silver + extra_silver);
            //     }

            //     if (share_gold > 0)
            //     {
            //         send("You split {0} gold coins. Your share is {1} gold.\n\r", item.Gold, share_gold + extra_gold);

            //     }
            //     string buf;
            //     if (share_gold == 0)
            //     {
            //         buf = string.Format("$n splits {0} silver coins. Your share is {1} silver.",
            //                 item.Silver, share_silver);
            //     }
            //     else if (share_silver == 0)
            //     {
            //         buf = string.Format("$n splits {0} gold coins. Your share is {1} gold.",
            //             item.Gold, share_gold);
            //     }
            //     else
            //     {
            //         buf = string.Format(
            //             "$n splits {0} silver and {1} gold coins, giving you {2} silver and {3} gold.\n\r",
            //                 item.Silver, item.Gold, share_silver, share_gold);
            //     }

            //     foreach (var gch in splitamongst)
            //     {
            //         if (gch != this)
            //         {
            //             if (gch.Position != Positions.Sleeping)
            //                 Act(buf, gch, null, null, ActType.ToVictim);
            //             gch.Gold += share_gold;
            //             gch.Silver += share_silver;
            //         }
            //     }
            // }// end if splitamongst.count > 0
        } // end isset autosplit
        return true;

    }
    else
    {
        if(atEnd) player.Inventory.push(item);
        else player.Inventory.unshift(item);
        item.CarriedBy = player;
        return true;
    }
}

/**
 * Attempt to pick up an item, can fail if too many items or too much weight
 *
 * @param {Character} player
 * @param {ItemData} item
 * @param {ItemData} [container=null]
 * @return {boolean} 
 */
function GetItem(player, item, container = null) {
    if (item.WearFlags.Take)
    {
        if (player.Carry + 1 > player.MaxCarry)
        {
            player.send("You can't carry anymore items.\n\r");
            return false;
        }

        if (container == null)
        {
            if (player.TotalWeight + item.Weight > player.MaxWeight)
            {
                player.send("You can't carry anymore weight.\n\r");
                return false;
            }
            player.Room.Items.splice(player.Room.Items.indexOf(item), 1);
            item.Room = null;
            
            player.Act("You get $p.\n\r", null, item, null, "ToChar");
            player.Act("$n gets $p.\n\r", null, item, null, "ToRoom");
        }
        else
        {
            if (container.CarriedBy != player && player.TotalWeight + item.Weight > player.MaxWeight)
            {
                player.send("You can't carry anymore weight.\n\r");
                return false;
            }

            container.Contains.splice(container.Contains.indexOf(item), 1);
            item.Container = null;
            
            player.Act("You get $p from $P.\n\r", null, item, container, "ToChar");
            player.Act("$n gets $p from $P.\n\r", null, item, container, "ToRoom");
        }
        AddInventoryItem(player, item);
        return true;
    }
    else
        return false;
}

/**
 * Attempt to get an item from the characters inventory, can be a n.item name
 *
 * @param {Character} player
 * @param {string} itemname
 * @param {number} [count=0]
 * @return {Array[ItemData, number]} Item and count as array
 */
function GetItemInventory(player, itemname, count = 0) {
    var number = Utility.NumberArgument(itemname);
    itemname = number[1];
    number = number[0];
    for(var i = 0; i < player.Inventory.length; i++) {
        var item = player.Inventory[i];

        if((Utility.IsNullOrEmpty(itemname) || Utility.IsName(item.Name, itemname)) && ++count >= number) {
            return [item, count];
        }
    }
    return [null, count];
}

/**
 * Attempt to retrieve an item from the equipment of the character, can be a n.name argument
 *
 * @param {Character} player
 * @param {string} itemname
 * @param {number} [count=0]
 * @return {Array[ItemData, number, string]} Item, count and slot id as array
 */
function GetItemEquipment(player, itemname, count = 0) {
    var number = Utility.NumberArgument(itemname);
    itemname = number[1];
    number = number[0];
    for(key in Character.WearSlots) {
        var item = player.Equipment[key];

        if(item && (Utility.IsNullOrEmpty(itemname) || Utility.IsName(item.Name, itemname)) && ++count >= number) {
            return [item, count, key];
        }
    }
    return [null, count, key];
}

/**
 *
 *
 * @param {Character}} player
 * @param {Array} list
 * @param {string} itemname
 * @param {number} [count=0]
 * @return {Array} item, count, key in the list 
 */
function GetItemList(player, list, itemname, count = 0) {
    var number = Utility.NumberArgument(itemname);
    itemname = number[1];
    number = number[0];
    for(key in list) {
        var item = list[key];

        if((Utility.IsNullOrEmpty(itemname) || Utility.IsName(item.Name, itemname)) && ++count >= number) {
            return [item, count, key];
        }
    }
    return [null, count, key];
}

/**
 *
 *
 * @param {Character} player
 * @param {string} itemname
 * @return {ItemData} 
 */
function GetItemHere(player, itemname) {
    var result = GetItemInventory(player, itemname);
    if(!result[0])
        result = GetItemEquipment(player, itemname, result[1]);
    if(!result[0])
        result = GetItemList(player, player.Room.Items, itemname, result[1]);

    return result[0];
}

function DoGet(player, arguments) {
    args = Utility.OneArgument(arguments);
    var fAll = Utility.Compare(args[0], "all");

    var itemName = args[0];
    var containerName = args[1];
    
    if(fAll && Utility.IsNullOrEmpty(containerName)) {
        for(var i = 0; i < player.Room.Items.length; i++) {
            var item = player.Room.Items[i];

            if(item.WearFlags.Take && GetItem(player, item)) {
                i--;
            }
            else if(!item.WearFlags.Take) {
                player.send("You can't pick that up.\n\r");
            }
        }
    } else if(!Utility.IsNullOrEmpty(containerName)) {
        var container = null;

        if((container = GetItemHere(player, containerName)) != null) {
            if(container.Contains.length == 0) {
                player.Act("$p appears to be empty.", null, container, null, "ToChar");
                return;
            }

            if(fAll) {
                for(var i = 0; i < container.Contains.length; i++) {
                    var item = container.Contains[i];
                    if(item != null && item.WearFlags.Take) {
                        if(GetItem(player, item, container))
                            i--;
                    }
                    else
                        player.send("You can't pick that up.\n\r");
                }
            } else if(itemName.startsWith("all.")) {
                itemName = itemName.substring(4);
                for(var i = 0; i < container.Contains.length; i++) {
                    var item = container.Contains[i];
                    if(item != null && item.WearFlags.Take && Utility.IsName(item.Name, itemName)) {
                        if(GetItem(player, item, container))
                            i--;
                    }
                    else if(item != null && !item.WearFlags.Take)
                        player.send("You can't pick that up.\n\r");
                }
            } else {
                var item = GetItemList(itemName, container.Contains)[0];

                if(item && item.WearFlags.Take) {
                    GetItem(player, item, container);
                } else if(item) {
                    player.send("You can't pick that up.\n\r");
                }
                else player.send("You don't see that.\n\r")
            }
        } else {
            player.send("You don't see that container here.\n\r");
        }
    } else if(Utility.IsNullOrEmpty(containerName)) {
        if(player.Room.Items.length == 0) {
            player.send("You don't see anything here.\n\r");
        } else if(fAll) {
            for(var i = 0; i < player.Room.Items.length; i++) {
                var item = player.Room.Items[i];
                if(item != null && item.WearFlags.Take) {
                    if(GetItem(player, item, container))
                        i--;
                }
                else
                    player.send("You can't pick that up.\n\r");
            }
        } else if(itemName.startsWith("all.")) {
            itemName = itemName.substring(4);
            for(var i = 0; i < player.Room.Items.length; i++) {
                var item = player.Room.Items[i];
                if(item != null && item.WearFlags.Take && Utility.IsName(item.Name, itemName)) {
                    if(GetItem(player, item, container))
                        i--;
                }
                else if(item != null && !item.WearFlags.Take)
                    player.send("You can't pick that up.\n\r");
            }
        } else {
            var item = GetItemList(itemName, player.Room.Items)[0];
            if(item != null && item.WearFlags.Take) {
                GetItem(player, item, container);
            } else if(item!= null) {
                player.send("You can't pick that up.\n\r");
            }
            else player.send("You don't see that.\n\r")
        }
    }
}

function DoDrop(player, arguments) {
    if(Utility.Compare(arguments, "all")) {
        var inventory = Utility.CloneArray(player.Inventory);
        for(key in inventory) {
            var item = inventory[key];
            if(!item)
                player.send("You couldn't find it.\n\r")
            else if(item.ExtraFlags.NoDrop) {
                player.send("You can't drop it.\n\r");
            }
            else {
                player.Inventory.splice(player.Inventory.indexOf(item), 1);
                item.CarriedBy = null;
                player.Room.Items.unshift(item);
                item.Room = player.Room;
                player.Act("You drop $p.", null, item, null, "ToChar");
                player.Act("$n drops $p.", null, item, null, "ToRoom");
            }    
        }
    } else {
        var item = GetItemInventory(player, arguments)[0];
        
        if(!item)
            player.send("You couldn't find it.\n\r")
        else if(item.ExtraFlags.NoDrop) {
            player.send("You can't drop it.\n\r");
        }
        else {
            player.Inventory.splice(player.Inventory.indexOf(item), 1);
            item.CarriedBy = null;
            player.Room.Items.unshift(item);
            item.Room = player.Room;
            player.Act("You drop $p.", null, item, null, "ToChar");
            player.Act("$n drops $p.", null, item, null, "ToRoom");
        }
    }
}

function RemoveEquipment(player, item, sendmessage) {
    var slot = null;
    for(slotkey in player.Equipment) {
        if(player.Equipment[slotkey] == item)
            slot = slotkey;
    }
    if (!item || !slot) {
        if(sendmessage)
        player.send("You aren't wearing that.\n\r");
    } else if(item.ExtraFlags.NoRemove) {
        if(sendmessage)
        player.Act("You can't remove $p.\n\r", null, item, null, "ToChar");
    } else {
        player.Inventory.unshift(item);
        
        item.CarriedBy = player;
        delete player.Equipment[slot];
        if(sendmessage) {
            player.Act("You remove $p.\n\r", null, item, null, "ToChar");
            player.Act("$n removes $p.\n\r", null, item, null, "ToRoom");
        }
        return true;
    }
    return false;
}

function DoRemove(player, arguments) {
    if(Utility.Compare(arguments, "all")) {
        for(slotkey in Character.WearSlots) {
            var item = player.Equipment[slotkey];
            if(item) {
                RemoveEquipment(player, item, true);
            }
        }
    }
    else {
        var itemandslot = GetItemEquipment(player, arguments);
        var item = itemandslot[0];
        var slot = itemandslot[2];
        RemoveEquipment(player, item, true);
    }
}

function WearItem(player, item, sendMessage = true, remove = true)
{
    var firstSlot = null;
    var emptySlot = null;
    var offhandSlotToRemove = null;
    var offhand;
    var wielded;

    var noun = "wear";
    
    // Check if the item has the UniqueEquip flag and the character is already wearing one
    if (item.ExtraFlags.UniqueEquip)
    {
        for(var key in player.Equipment)
        {
            var other = player.Equipment[key];
            if (other && other.VNum == item.VNum)
            {
                player.send("You can only wear one of those at a time.\n\r");
                return false;
            }
        }
    }

    // Check if the item has alignment restrictions that conflict with the character's alignment
    // if ((itemData.extraFlags.ISSET(ExtraFlags.AntiGood) && Alignment == Alignment.Good) ||
    //     (itemData.extraFlags.ISSET(ExtraFlags.AntiNeutral) && Alignment == Alignment.Neutral) ||
    //     (itemData.extraFlags.ISSET(ExtraFlags.AntiEvil) && Alignment == Alignment.Evil))
    // {
    //     Act("You try to wear $p, but it zaps you.", null, itemData, type: ActType.ToChar);
    //     Act("$n tries to wear $p, but it zaps $m.", null, itemData, type: ActType.ToRoom);
    //     return false;
    // }

    var handslots = { Wield: true, DualWield: true, Shield: true, Held: true };

    wielded = player.Equipment["Wield"];

    // Iterate over the available wear slots to find an empty slot or the first suitable slot
    for(var slotkey in Character.WearSlots)
    {
        var slot = Character.WearSlots[slotkey];
        // Check if the character's hands are bound and the item requires hand slots
        // if (item.WearFlags[slot.Flag] && Object.keys(handslots).indexOf(slot.ID) >= 0 && IsAffected(AffectFlags.BindHands))
        // {
        //     this.Act("You can't equip that while your hands are bound.\n\r");
        //     return false;
        // }

        // Check if the item can be dual wielded and the character has the appropriate skill
        if (slot.ID == "DualWield" || //&&
        //     (GetSkillPercentage(SkillSpell.SkillLookup("dual wield")) <= 1 ||
             item.ExtraFlags.TwoHands ||
             (wielded && wielded.ExtraFlags.TwoHands))
             continue;

        // Check if the item can be worn in the current slot and the slot is empty
        if (item.WearFlags[slot.Flag] && !player.Equipment[slot.ID])
        {
            emptySlot = slot;
            break;
        }
        else if (item.WearFlags[slot.Flag] && firstSlot == null)
            firstSlot = slot;
    }

    // Check if a hand slot needs to be emptied for a two-handed item
    if (emptySlot && (emptySlot.ID == "Held" || emptySlot.ID == "DualWield" || emptySlot.ID == "Shield") && (wielded = player.Equipment["Wield"]) && wielded.ExtraFlags.TwoHands)
    {
        if (remove)
        {
            if (!RemoveEquipment(player, wielded, sendMessage))
                return false;
        }
        else
            return false;
    }

    // Check if a two-handed item requires the removal of an offhand item
    if (!emptySlot && !remove) return false;
    if (item.ExtraFlags.TwoHands && ((offhand = player.Equipment["Shield"]) || (offhand = player.Equipment["Held"]) || (offhand = player.Equipment["DualWield"])))
    {
        if (!RemoveEquipment(player, offhand, sendMessage))
        {
            player.send("You need two hands free for that weapon.\n\r");
            return false;
        }
    }

    // Check if there is an offhand item that needs to be replaced
    if (
        (
            (emptySlot && (emptySlot.ID == "DualWield" || emptySlot.ID == "Shield" || emptySlot.ID == "Held"))
    ||
            (firstSlot && (firstSlot.ID == "DualWield" || firstSlot.ID == "Shield" || firstSlot.ID == "Held"))
        )
    && (
            (offhand = player.Equipment["Shield"]) || (offhand = player.Equipment["Held"]) || (offhand = player.Equipment["DualWield"])
        ))
    {
        if (!remove) return false;
        if (RemoveEquipment(player, offhand, sendMessage))
        {
            if (emptySlot == null)
                emptySlot = firstSlot;
        }
        else
            return false; // no remove item, should have gotten a message if we are showing messages, no switching out noremove gear in resets
    }
    // Replace an item other than the offhand
    else if (!emptySlot && firstSlot)
    {
        if (RemoveEquipment(player, player.Equipment[firstSlot.ID], sendMessage))
            emptySlot = firstSlot;
    }

    // Attempt to wear the item in the empty slot
    if (emptySlot)
    {
        if (sendMessage)
        {
            if (emptySlot.ID == "Wield" || emptySlot.ID == "DualWield")
            {
                // // Check if the character can wield the item based on their strength
                // if (!IsNPC && itemData.Weight > PhysicalStats.StrengthApply[GetCurrentStat(PhysicalStatTypes.Strength)].Wield)
                // {
                //     Act("$p weighs too much for you to wield.", null, itemData);
                //     return false;
                // }

                noun = "wield";
            }
            else
                noun = "wear";

            // Display wear messages to the character and the room
            player.Act("You " + noun + " $p " + emptySlot.WearString + ".\n\r", null, item, null, "ToChar");
            player.Act("$n " + noun + "s $p " + emptySlot.WearStringOthers + ".\n\r", null, item, null, "ToRoom");
        }

        // Add the item to the equipment slot
        player.Equipment[emptySlot.ID] = item;

        // Remove the item from the character's inventory
        if (player.Inventory.indexOf(item) >= 0)
            player.Inventory.splice(player.Inventory.indexOf(item), 1);
        item.CarriedBy = this;

        // // Apply the item's affects to the character
        // if (itemData.Durability != 0) // Broken items don't apply any affects
        // {
        //     foreach (var aff in itemData.affects)
        //         AffectApply(aff);
        // }

        // // Execute any wear programs associated with the item
        // Programs.ExecutePrograms(Programs.ProgramTypes.Wear, this, itemData, "");

        return true;
    }
    else
    {
        player.send("You couldn't wear it.\n\r");
        return false;
    }
}
function DoWear(player, arguments) {
    
    if (Utility.IsNullOrEmpty(arguments)) {
        player.send("Wear what?\n\r");
        return;
    } else if (Utility.Compare(arguments, "all"))     {
        var woreanything = false;
        var inventory = Utility.CloneArray(player.Inventory);
        for (var allitem in inventory) {
            var item = inventory[allitem];
            if (WearItem(player, item, true, false))
                woreanything = true;
        }
        
        if (!woreanything)
            player.send("You wore nothing.\n\r");
    }
    else {
        var item = GetItemInventory(player, arguments)[0];

        if (item)
        {
            WearItem(player, item);
        }
        else
            player.send("You aren't carrying that.\n\r");
    }
}

Character.DoCommands.DoGet = DoGet;
Character.DoCommands.DoDrop = DoDrop;
Character.DoCommands.DoRemove = DoRemove;
Character.DoCommands.DoWear = DoWear;

Character.ItemFunctions.WearItem = WearItem;
Character.ItemFunctions.AddInventoryItem = AddInventoryItem;
Character.ItemFunctions.GetItemInventory = GetItemInventory;
Character.ItemFunctions.GetItemEquipment = GetItemEquipment;
Character.ItemFunctions.GetItemHere = GetItemHere;
Character.ItemFunctions.GetItemList = GetItemList;
Character.ItemFunctions.GetItem = GetItem;