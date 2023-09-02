const Character = require("./Character");
const ItemData = require("./ItemData");
const Utility = require("./Utility");



function DoGet(player, arguments) {
    var itemName, containerName;
    [itemName, containerName] = arguments.oneArgument();
    var fAll = Utility.Compare(itemName, "all");
    
    if(itemName.ISEMPTY()) {
        player.send("Pick what up?\n\r");
    }
    else if(fAll && Utility.IsNullOrEmpty(containerName)) {
        for(var i = 0; i < player.Room.Items.length; i++) {
            var item = player.Room.Items[i];

            if(item.WearFlags.Take && player.GetItem(item)) {
                i--;
            }
            else if(!item.WearFlags.Take) {
                player.Act("You can't pick up $p.\n\r", null, item);
            }
        }
    } else if(!Utility.IsNullOrEmpty(containerName)) {
        var container = null;
        var count = 0;
        if(([container, count] = player.GetItemHere(containerName)) != null) {
            if(container.ExtraFlags.IsSet("Closed")) {
                player.Act("$p is closed.\n\r", null, container);
                return;
            }
            if(container.Contains.length == 0) {
                player.Act("$p appears to be empty.", null, container, null, "ToChar");
                return;
            }

            if(fAll) {
                for(var i = 0; i < container.Contains.length; i++) {
                    var item = container.Contains[i];
                    if(item != null && item.WearFlags.Take) {
                        if(player.GetItem(item, container))
                            i--;
                    }
                    else
                        player.Act("You can't pick up $p.\n\r", null, item);
                }
            } else if(itemName.startsWith("all.")) {
                itemName = itemName.substring(4);
                for(var i = 0; i < container.Contains.length; i++) {
                    var item = container.Contains[i];
                    if(item != null && item.WearFlags.Take && Utility.IsName(item.Name, itemName)) {
                        if(player.GetItem(item, container))
                            i--;
                    }
                    else if(item != null && !item.WearFlags.Take)
                        player.send("You can't pick that up.\n\r");
                }
            } else {
                var item = player.GetItemList(container.Contains, itemName)[0];

                if(item && item.WearFlags.Take) {
                    player.GetItem(item, container);
                } else if(item) {
                    player.Act("You can't pick up $p.\n\r", null, item);
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
                    if(player.GetItem(item, container))
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
                    if(player.GetItem(item, container))
                        i--;
                }
                else if(item != null && !item.WearFlags.Take)
                    player.send("You can't pick that up.\n\r");
            }
        } else {
            var item = player.GetItemList(player.Room.Items, itemName)[0];
            if(item != null && item.WearFlags.Take) {
                player.GetItem(item, container);
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

                if (item.ExtraFlags.ISSET(ExtraFlags.MeltDrop)) {
                    ch.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToRoom);
                    ch.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToChar);
                    item.Dispose();
                }
            }    
        }
    } else {
        var [item] = player.GetItemInventory(arguments);
        
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
            if (item.ExtraFlags.ISSET(ExtraFlags.MeltDrop)) {
                ch.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToRoom);
                ch.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToChar);
                item.Dispose();
            }
        }
    }
}


function DoRemove(player, arguments) {
    if(Utility.Compare(arguments, "all")) {
        for(slotkey in Character.WearSlots) {
            var item = player.Equipment[slotkey];
            if(item) {
                player.RemoveEquipment(item, true);
            }
        }
    }
    else {
        var itemandslot = player.GetItemEquipment(arguments);
        var item = itemandslot[0];
        var slot = itemandslot[2];
        player.RemoveEquipment(item, true);
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
            if (player.WearItem(item, true, false))
                woreanything = true;
        }
        
        if (!woreanything)
            player.send("You wore nothing.\n\r");
    }
    else {
        var [item] = player.GetItemInventory(arguments);

        if (item)
        {
            player.WearItem(item);
        }
        else
            player.send("You aren't carrying that.\n\r");
    }
}

Character.DoCommands.DoPut = function (player, arguments) {
    var [itemname, containername] = arguments.oneArgument();
    var fAll = itemname.startsWith("all");
    var container;
    if (itemname.IsNullOrEmpty() || containername.IsNullOrEmpty()) {
        player.send("Put what in what?\n\r");
        return;
    } else if(!([container] = player.GetItemHere(containername, 0))) {
        player.send("You don't see that container here.\n\r")
    } else if(!container.ItemTypes.IsSet("Container")) {
        player.send("That isn't a container.\n\r");
    } else if (fAll) {
        if(itemname.startsWith("all.")) itemname = itemname.substring(4);
        else itemname = "";

        var movedanything = false;
        var inventory = Utility.CloneArray(player.Inventory);
        for (var allitem in inventory) {
            var item = inventory[allitem];
            if(item != container && itemname.IsNullOrEmpty() || item.Name.IsName(itemname)) {
                movedanything = true;
                container.Contains.unshift(item);
                player.Inventory.splice(player.Inventory.indexOf(item), 1);
                player.Act("$n puts $p in $P.", null, item, container, "ToRoom");
                player.Act("You puts $p in $P.", null, item, container, "ToChar");
            }
        }
        
        if (!movedanything)
            player.send("You aren't carrying that.\n\r");
    }
    else {
        var [item] = player.GetItemInventory(itemname);

        if (item != container)
        {
            container.Contains.unshift(item);
            player.Inventory.splice(player.Inventory.indexOf(item), 1);
            player.Act("$n puts $p in $P.", null, item, container, "ToRoom");
            player.Act("You puts $p in $P.", null, item, container, "ToChar");
        }
        else if(container == item) {
            player.send("You cannot put anything into itself.\n\r");
        }
        else
            player.send("You aren't carrying that.\n\r");
    }
}

Character.DoCommands.DoSacrifice = function(ch, args)
{
    var itemName = "";
    var containerName = "";
    [itemName, args] = args.OneArgument();
    //[containerName, args] = args.OneArgument();

    if(!itemName.ISEMPTY())
    {
        
        var [item, count] = ch.GetItemRoom(itemName, 0);

        if (item != null)
        {

            if (item.ItemTypes.ISSET(ItemData.ItemTypesList.Fountain) || !item.WearFlags.ISSET(ItemData.WearFlagsList.Take)) {
                ch.send(Utility.Format("Are you nuts? You cannot sacrifice {0} to the gods.\n\r", item.ShortDescription));
            } else if (item.ItemTypes.ISSET(ItemData.ItemTypesList.PC_Corpse)) {
                ch.Act("The gods wouldn't approve of that.");
            } else {
                for (var contained of item.Contains)
                {
                    ch.Room.Items.unshift(contained);
                    contained.Room = ch.Room;
                    contained.Container = null;

                    //if (contained.extraFlags.ISSET(ExtraFlags.MeltDrop))
                    //{
                    //    ch.Act("$p crumbles into dust.", item: contained, type: ActType.ToRoom);
                    //    ch.Act("$p crumbles into dust.", item: contained, type: ActType.ToChar);
                    //    contained.Dispose();
                    //}
                }
                item.Contains = Array();

                ch.Room.Items.Remove(item);
                item.Room = null;
                item.Dispose();
                ch.send(Utility.Format("You sacrifice {0} to the gods.\n\r", item.ShortDescription));
                ch.Act("$n sacrifices $p to the gods.\n\r", null, item, null, Character.ActType.ToRoom);
            }
        }

        else ch.send("You don't see that here.\n\r");
    } else ch.send("Sacrifice what?\n\r");
}

Character.DoCommands.DoGet = DoGet;
Character.DoCommands.DoDrop = DoDrop;
Character.DoCommands.DoRemove = DoRemove;
Character.DoCommands.DoWear = DoWear;
