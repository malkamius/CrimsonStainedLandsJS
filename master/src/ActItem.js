const Character = require("./Character");
const ItemData = require("./ItemData");
const Utility = require("./Utility");



function DoGet(character, args) {
    var itemName, containerName;
    [itemName, containerName] = args.oneArgument();
    var fAll = Utility.Compare(itemName, "all");
    
    if(itemName.ISEMPTY()) {
        character.send("Pick what up?\n\r");
    }
    else if(fAll && Utility.IsNullOrEmpty(containerName)) {
        for(var i = 0; i < character.Room.Items.length; i++) {
            var item = character.Room.Items[i];

            if(item.WearFlags.Take && character.GetItem(item)) {
                i--;
            }
            else if(!item.WearFlags.Take) {
                character.Act("You can't pick up $p.\n\r", null, item);
            }
        }
    } else if(!Utility.IsNullOrEmpty(containerName)) {
        var container = null;
        var count = 0;
        if(([container, count] = character.GetItemHere(containerName)) != null) {
            if(container.ExtraFlags.IsSet(ItemData.ExtraFlags.Closed)) {
                character.Act("$p is closed.\n\r", null, container);
                return;
            }
            if(container.Contains.length == 0) {
                character.Act("$p appears to be empty.", null, container, null, "ToChar");
                return;
            }

            if(fAll) {
                for(var i = 0; i < container.Contains.length; i++) {
                    var item = container.Contains[i];
                    if(item != null && item.WearFlags.Take) {
                        if(character.GetItem(item, container))
                            i--;
                    }
                    else
                        character.Act("You can't pick up $p.\n\r", null, item);
                }
            } else if(itemName.startsWith("all.")) {
                itemName = itemName.substring(4);
                for(var i = 0; i < container.Contains.length; i++) {
                    var item = container.Contains[i];
                    if(item != null && item.WearFlags.Take && Utility.IsName(item.Name, itemName)) {
                        if(character.GetItem(item, container))
                            i--;
                    }
                    else if(item != null && !item.WearFlags.Take)
                        character.send("You can't pick that up.\n\r");
                }
            } else {
                var item = character.GetItemList(container.Contains, itemName)[0];

                if(item && item.WearFlags.Take) {
                    character.GetItem(item, container);
                } else if(item) {
                    character.Act("You can't pick up $p.\n\r", null, item);
                }
                else character.send("You don't see that.\n\r")
            }
        } else {
            character.send("You don't see that container here.\n\r");
        }
    } else if(Utility.IsNullOrEmpty(containerName)) {
        if(character.Room.Items.length == 0) {
            character.send("You don't see anything here.\n\r");
        } else if(fAll) {
            for(var i = 0; i < character.Room.Items.length; i++) {
                var item = character.Room.Items[i];
                if(item != null && item.WearFlags.Take) {
                    if(character.GetItem(item, container))
                        i--;
                }
                else
                    character.send("You can't pick that up.\n\r");
            }
        } else if(itemName.startsWith("all.")) {
            itemName = itemName.substring(4);
            for(var i = 0; i < character.Room.Items.length; i++) {
                var item = character.Room.Items[i];
                if(item != null && item.WearFlags.Take && Utility.IsName(item.Name, itemName)) {
                    if(character.GetItem(item, container))
                        i--;
                }
                else if(item != null && !item.WearFlags.Take)
                    character.send("You can't pick that up.\n\r");
            }
        } else {
            var item = character.GetItemList(character.Room.Items, itemName)[0];
            if(item != null && item.WearFlags.Take) {
                character.GetItem(item, container);
            } else if(item!= null) {
                character.send("You can't pick that up.\n\r");
            }
            else character.send("You don't see that.\n\r")
        }
    }
}

function DoDrop(character, args) {
    if(Utility.Compare(args, "all")) {
        var inventory = Utility.CloneArray(character.Inventory);
        for(key in inventory) {
            var item = inventory[key];
            if(!item)
                character.send("You couldn't find it.\n\r")
            else if(item.ExtraFlags.ISSET(ItemData.ExtraFlags.NoDrop)) {
                character.send("You can't drop it.\n\r");
            }
            else {
                character.Inventory.splice(character.Inventory.indexOf(item), 1);
                item.CarriedBy = null;
                character.Room.Items.unshift(item);
                item.Room = character.Room;
                character.Act("You drop $p.", null, item, null, "ToChar");
                character.Act("$n drops $p.", null, item, null, "ToRoom");

                if (item.ExtraFlags.ISSET(ItemData.ExtraFlags.MeltDrop)) {
                    ch.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToRoom);
                    ch.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToChar);
                    item.Dispose();
                }
            }    
        }
    } else if(args.startsWith("all.") && args.length > 4) {
        var itemname = args.substring(4);
        var inventory = Utility.CloneArray(character.Inventory);
        for(key in inventory) {
            var item = inventory[key];
            if(!item.Name.IsName(itemname)) {
                continue;
            } else if(item.ExtraFlags.ISSET(ItemData.ExtraFlags.NoDrop)) {
                character.send("You can't drop it.\n\r");
            }
            else {
                character.Inventory.splice(character.Inventory.indexOf(item), 1);
                item.CarriedBy = null;
                character.Room.Items.unshift(item);
                item.Room = character.Room;
                character.Act("You drop $p.", null, item, null, "ToChar");
                character.Act("$n drops $p.", null, item, null, "ToRoom");

                if (item.ExtraFlags.ISSET(ItemData.ExtraFlags.MeltDrop)) {
                    ch.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToRoom);
                    ch.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToChar);
                    item.Dispose();
                }
            }    
        }
    } else {
        var [item] = character.GetItemInventory(args);
        
        if(!item)
            character.send("You couldn't find it.\n\r")
        else if(item.ExtraFlags.ISSET(ItemData.ExtraFlags.NoDrop)) {
            character.send("You can't drop it.\n\r");
        }
        else {
            character.Inventory.splice(character.Inventory.indexOf(item), 1);
            item.CarriedBy = null;
            character.Room.Items.unshift(item);
            item.Room = character.Room;
            character.Act("You drop $p.", null, item, null, "ToChar");
            character.Act("$n drops $p.", null, item, null, "ToRoom");
            if (item.ExtraFlags.ISSET(ItemData.ExtraFlags.MeltDrop)) {
                ch.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToRoom);
                ch.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToChar);
                item.Dispose();
            }
        }
    }
}


function DoRemove(character, args) {
    if(Utility.Compare(args, "all")) {
        for(slotkey in Character.WearSlots) {
            var item = character.Equipment[slotkey];
            if(item) {
                character.RemoveEquipment(item, true);
            }
        }
    }
    else {
        var itemandslot = character.GetItemEquipment(args);
        var item = itemandslot[0];
        var slot = itemandslot[2];
        character.RemoveEquipment(item, true);
    }
}


function DoWear(character, args) {
    
    if (Utility.IsNullOrEmpty(args)) {
        character.send("Wear what?\n\r");
        return;
    } else if (Utility.Compare(args, "all"))     {
        var woreanything = false;
        var inventory = Utility.CloneArray(character.Inventory);
        for (var allitem in inventory) {
            var item = inventory[allitem];
            if (character.WearItem(item, true, false))
                woreanything = true;
        }
        
        if (!woreanything)
            character.send("You wore nothing.\n\r");
    }
    else {
        var [item] = character.GetItemInventory(args);

        if (item)
        {
            character.WearItem(item);
        }
        else
            character.send("You aren't carrying that.\n\r");
    }
}

Character.DoCommands.DoPut = function (character, args) {
    var [itemname, containername] = args.oneArgument();
    var fAll = itemname.startsWith("all");
    var container;
    if (itemname.IsNullOrEmpty() || containername.IsNullOrEmpty()) {
        character.send("Put what in what?\n\r");
        return;
    } else if(!([container] = character.GetItemHere(containername, 0))) {
        character.send("You don't see that container here.\n\r")
    } else if(!container.ItemTypes.IsSet("Container")) {
        character.send("That isn't a container.\n\r");
    } else if (fAll) {
        if(itemname.startsWith("all.")) itemname = itemname.substring(4);
        else itemname = "";

        var movedanything = false;
        var inventory = Utility.CloneArray(character.Inventory);
        for (var allitem in inventory) {
            var item = inventory[allitem];
            if(item != container && itemname.IsNullOrEmpty() || item.Name.IsName(itemname)) {
                movedanything = true;
                container.Contains.unshift(item);
                character.Inventory.splice(character.Inventory.indexOf(item), 1);
                character.Act("$n puts $p in $P.", null, item, container, "ToRoom");
                character.Act("You puts $p in $P.", null, item, container, "ToChar");
            }
        }
        
        if (!movedanything)
            character.send("You aren't carrying that.\n\r");
    }
    else {
        var [item] = character.GetItemInventory(itemname);

        if (item != container)
        {
            container.Contains.unshift(item);
            character.Inventory.splice(character.Inventory.indexOf(item), 1);
            character.Act("$n puts $p in $P.", null, item, container, "ToRoom");
            character.Act("You puts $p in $P.", null, item, container, "ToChar");
        }
        else if(container == item) {
            character.send("You cannot put anything into itself.\n\r");
        }
        else
            character.send("You aren't carrying that.\n\r");
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

            if (item.ItemTypes.ISSET(ItemData.ItemTypes.Fountain) || !item.WearFlags.ISSET(ItemData.WearFlags.Take)) {
                ch.send(Utility.Format("Are you nuts? You cannot sacrifice {0} to the gods.\n\r", item.ShortDescription));
            } else if (item.ItemTypes.ISSET(ItemData.ItemTypes.PC_Corpse)) {
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
                ch.send("You sacrifice {0} to the gods.\n\r", item.ShortDescription);
                ch.Act("$n sacrifices $p to the gods.\n\r", null, item, null, Character.ActType.ToRoom);
                var coins = Math.max(item.Value, Utility.Random(1,3));
                coins = Utility.Random(coins, coins + 30);
                ch.send("The gods give you {0} silver coins for your sacrifice.\n\r", coins);
                ch.Silver += coins;
            }
        }

        else ch.send("You don't see that here.\n\r");
    } else ch.send("Sacrifice what?\n\r");
}

Character.DoCommands.DoList = function(character, args) {
    const NPCTemplateData = require("./NPCTemplateData");
    var shopkeeper = null;

    if (character.Form != null)
    {
        character.send("They wouldn't be able to understand you.\n\r");
        return;
    }

    shopkeeper = character.Room.Characters.FirstOrDefault(npc => npc.IsNPC && npc.Flags.ISSET(Character.ActFlags.Shopkeeper));
    
    if (shopkeeper)
    {
        character.StartPaging();
        character.send("This shop will purchase the following types of things: ");
        character.send("{0}\n\r", Utility.JoinFlags(shopkeeper.BuyTypes, ", "));
        character.Act("$N will sell you the following goods:", shopkeeper, null, null, Character.ActType.ToChar);
        for (var item of shopkeeper.Inventory)
        {
            character.send("[{0,3}] {1,7} - {2}\n\r", item.Level, item.Value * shopkeeper.SellProfitPercent / 100, item.DisplayFlags(character) + item.Display(character));
        }

        if (shopkeeper.PetVNums && shopkeeper.PetVNums.length > 0)
        {
            var pettemplate;
            character.Act("$N will sell you the following pets:", shopkeeper, null, null, Character.ActType.ToChar);
            for (var vnum of shopkeeper.PetVNums)
            {
                if ((pettemplate = NPCTemplateData.NPCTemplates[vnum]))
                {
                    character.send("[{0,2}] {1,8} - {2}\n\r", pettemplate.Level, 10 * pettemplate.Level * pettemplate.Level, pettemplate.ShortDescription);
                }
            }
        }
        character.EndPaging();
    } else {
        character.send("You see no shopkeepers here.\n\r");
    }
}

Character.DoCommands.DoBuy = function(character, args) {
    if (character.Form != null)
	{
		character.send("They wouldn't be able to understand you.\n\r");
		return;
	}

	if (args.ISEMPTY())
	{
		character.send("Buy what?\n\r");
	}
	else
	{
        const NPCTemplateData = require("./NPCTemplateData");
        const NPCData = require("./NPCData");
		var shopkeeper = null;
		shopkeeper = character.Room.Characters.FirstOrDefault(npc => npc.IsNPC && npc.Flags.ISSET(Character.ActFlags.Shopkeeper));

		if (shopkeeper != null)
		{
			var count = 0;
			var item = null;
			var numberof;
			var buywhat = "";
			[buywhat, args] = args.OneArgument();
            numberof = Number(args);
			if (args.ISEMPTY() || numberof <= 0)
				numberof = 1;

			if (shopkeeper.PetVNums && shopkeeper.PetVNums.length > 0)
			{
                var pettemplate
				for(var vnum of shopkeeper.PetVNums)
				{
					if ((pettemplate = NPCTemplateData.NPCTemplates[vnum]) && pettemplate.Name.IsName(buywhat))
					{
                        for(var pet of Character.Characters) {
                            if(pet.Master == character && pet.Flags.ISSET(Character.ActFlags.Pet)) {
                                character.send("You already have a pet.\n\r");
                                return;
                            }
                        }
						
						if (pettemplate.Level > character.Level)
						{
							character.send("Wait till you get a bit older first.\n\r");
							return;
						}
						var cost = 10 * pettemplate.Level * pettemplate.Level;

						if ((character.Gold * 1000) + character.Silver > cost)
						{
							// character.ck can carry weight/# of items, character.ck that shop has # of items
							var silver = 0, gold = 0;

							silver = Math.min(character.Silver, cost);

							if (silver < cost)
							{
								gold = ((cost - silver + 999) / 1000);
								silver = cost - 1000 * gold;
							}

							character.Gold -= gold;
							character.Silver -= silver;
							if (gold > 0 && silver > 0)
							{
								character.Act("You hand {0} gold and {1} silver coins to $N.", shopkeeper, null, null, Character.ActType.ToChar, gold, silver);
							}
							else if (gold > 1)
								character.Act("You hand {0} gold coins to $N.", shopkeeper, null, null, Character.ActType.ToChar, gold);
							else if (gold > 0)
								character.Act("You hand {0} gold coins to $N.", shopkeeper, null, null, Character.ActType.ToChar, gold);
							else if (silver > 1)
								character.Act("You hand {0} silver coins to $N.", shopkeeper, null, null, Character.ActType.ToChar, silver);
							else
								character.Act("You hand {0} silver coin to $N.", shopkeeper, null, null, Character.ActType.ToChar, silver);

							if (silver < 0)
							{
								character.Act("$N hands you {0} silver back.", shopkeeper, null, null, Character.ActType.ToChar, -silver);
							}

							character.Act("$n hands some coins to $N.", shopkeeper, null, null, Character.ActType.ToRoom);

							var pet = new NPCData(pettemplate, character.Room);
							pet.Flags.SETBIT(Character.ActFlags.AutoAssist);
                            pet.Flags.SETBIT(Character.ActFlags.Pet);
							pet.Following = character;
							pet.Leader = character;
                            pet.Master = character;
						}
						else
							character.Act("$N says '\\yYou don't have enough coin for that.\\x'\n\r", shopkeeper);

						return;
					}
				}
			}

			[item, count] = shopkeeper.GetItemInventory(buywhat);

			if (item != null && character.Level < item.Level)
			{
				character.send("Wait till you're a bit older to be able to buy that.\n\r");
				return;
			}
			else if (item != null)
			{
				var cost = (item.Value * shopkeeper.SellProfitPercent / 100) * numberof;

				if (item.ExtraFlags.ISSET(ItemData.ExtraFlags.Inventory) && numberof > 1)
				{
					character.send("You can only buy one of those.\n\r");
				}
				else
				{
					if ((character.Gold * 1000) + character.Silver > cost)
					{
						// character.ck can carry weight/# of items, character.ck that shop has # of items
						var silver = 0, gold = 0;

						silver = Math.min(character.Silver, cost);

						if (silver < cost)
						{
							gold = ((cost - silver + 999) / 1000);
							silver = cost - 1000 * gold;
						}

						character.Gold -= gold;
						character.Silver -= silver;
						if (gold > 0 && silver > 0)
						{
							character.Act("You hand {0} gold and {1} silver coins to $N.", shopkeeper, null, null, Character.ActType.ToChar, gold, silver);
						}
						else if (gold > 1)
							character.Act("You hand {0} gold coins to $N.", shopkeeper, null, null, Character.ActType.ToChar, gold);
						else if (gold > 0)
							character.Act("You hand {0} gold coins to $N.", shopkeeper, null, null, Character.ActType.ToChar, gold);
						else if (silver > 1)
							character.Act("You hand {0} silver coins to $N.", shopkeeper, null, null, Character.ActType.ToChar, silver);
						else
							character.Act("You hand {0} silver coin to $N.", shopkeeper, null, null, Character.ActType.ToChar, silver);

						if (silver < 0)
						{
							character.Act("$N hands you {0} silver back.", shopkeeper, null, null, Character.ActType.ToChar, -silver);
						}

						character.Act("$n hands some coins to $N.", shopkeeper, null, null, Character.ActType.ToRoom);

						if (item.ExtraFlags.ISSET(ItemData.ExtraFlags.Inventory))
						{
							shopkeeper.Inventory.Remove(item);
							character.Inventory.unshift(item);
							item.CarriedBy = character;
							character.Act("$N hands $p to $n.", shopkeeper, item, null, Character.ActType.ToRoom);
							character.Act("$N hands $p to you.", shopkeeper, item, null, Character.ActType.ToChar);

						}
						else
						{
							for (var i = 0; i < numberof; i++)
							{
								item = new ItemData(item.Template);
								character.Inventory.unshift(item);
								item.CarriedBy = character;
							}

							character.Act("$N hands {0} $p to $n.", shopkeeper, item, null, Character.ActType.ToRoom, numberof);
							character.Act("$N hands {0} $p to you.", shopkeeper, item, null, Character.ActType.ToChar, numberof);

						}

					}
					else
						character.Act("$N says '\\yYou don't have enough coin for that.\\x'\n\r", shopkeeper);
				}
			}
			else
				character.Act("$N says '\\yI don't seem to be carrying that.\\x'\n\r", shopkeeper);
		}
		else
			character.send("You see no shopkeepers here.\n\r");
	}
}

Character.DoCommands.DoSell = function(character, args) {
    if (character.Form != null)
	{
		character.send("They wouldn't be able to understand you.\n\r");
		return;
	}

	if (args.ISEMPTY())
	{
		character.send("Sell what?\n\r");
		return;
	}

	var shopkeeper = character.Room.Characters.FirstOrDefault(npc => npc.IsNPC && npc.Flags.ISSET(Character.ActFlags.Shopkeeper));

	if (!shopkeeper)
	{
		character.send("There is no shopkeeper here.\n\r");
		return;
	}
	
	var [item, count] = character.GetItemInventory(args);

	if (!item)
	{
		character.send("You don't seem to have that.\n\r");
	}
	else if (!item.ItemTypes.IsSetAny(shopkeeper.BuyTypes))
	{
		character.send("This shopkeeper doesn't buy that kind of item.\n\r");
	}
	else if (shopkeeper.Inventory.FirstOrDefault(invitem => invitem.Template == item.Template))
	{
		character.Act("$N says '\\yI already have one of those I can't sell!\\x'.", shopkeeper, null, null, Character.ActType.ToChar);
	}
	else
	{
		character.Inventory.Remove(item);
		item.ExtraFlags.SETBIT(ItemData.ExtraFlags.Inventory);
		shopkeeper.Inventory.unshift(item);
		item.CarriedBy = shopkeeper;

		var amount = item.Value * shopkeeper.SellProfitPercent / 100;
		var gold = amount / 1000;
		var silver = amount % 1000;

		if (gold > 0 && silver > 0)
		{
			character.Act("$N hands you {0} gold and {1} silver coins.", shopkeeper, null, null, Character.ActType.ToChar, gold, silver);
		}
		else if (gold > 1)
			character.Act("$N hands you {0} gold coins.", shopkeeper, null, null, Character.ActType.ToChar, gold);
		else if (gold > 0)
			character.Act("$N hands {0} gold coins to you.", shopkeeper, null, null, Character.ActType.ToChar, gold);
		else if (silver > 1)
			character.Act("$N hands {0} silver coins to you.", shopkeeper, null, null, Character.ActType.ToChar, silver);
		else
			character.Act("$N hands {0} silver coin to you.", shopkeeper, null, null, Character.ActType.ToChar, silver);

		character.Act("$n hands $p to $N.", shopkeeper, item, null, Character.ActType.ToRoom);
		character.Act("$N hands some coins to $n.", shopkeeper, null, null, Character.ActType.ToRoom);
	}
}

Character.DoCommands.DoValue = function (character, args) {
    if (character.Form != null)
    {
        character.send("They wouldn't be able to understand you.\n\r");
        return;
    }

    if (args.ISEMPTY())
    {
        character.send("Sell what?\n\r");
        return;
    }

    var shopkeeper = character.Room.Characters.FirstOrDefault(npc => npc.IsNPC && npc.Flags.ISSET(Character.ActFlags.Shopkeeper));

    if (!shopkeeper)
    {
        character.send("There is no shopkeeper here.\n\r");
        return;
    }
    var [item] = character.GetItemInventory(args);

    if (!item)
    {
        character.send("You don't seem to have that.\n\r");
    }
    else if (!item.ItemTypes.IsSetAny(shopkeeper.BuyTypes))
    {
        character.send("This shopkeeper doesn't buy that kind of item.\n\r");
    }
    else
    {
        var amount = item.Value * shopkeeper.SellProfitPercent / 100;


        character.Act("$N says '\\yI'd say $p is worth about {0} coins.\\x'.", shopkeeper, item, null, Character.ActType.ToChar, amount);
    }
} // end dovalue

Character.DoCommands.DoEat = function(character, args) {
    const AffectData = require("./AffectData");
    const SkillSpell = require("./SkillSpell");
    const Magic = require("./Magic");
    var foodName = "";
    [foodName, args] = args.OneArgument();
    var item = null;
    var count = 0;
    var carrionskill = SkillSpell.SkillLookup("carrion feeding");
    var carrionfeeding = character.GetSkillPercentage(carrionskill);

    if (Utility.IsNullOrEmpty(foodName))
    {
        character.send("Eat what?\n\r");
        return;
    }
    else if (!character.Form && ([item, count] = character.GetItemInventory(foodName)) && !item)
    {
        character.send("You don't have that item.\n\r");
        return;
    }
    else if (character.Form && ([item, count] = character.GetItemRoom(foodName, count)) && !item)
    {
        character.send("You don't see that here.\n\r");
        return;
    }
    else if (!item)
    {
        character.send("You don't have that item.\n\r");
        return;
    }
    else if (character.Fighting)
    {
        character.send("You are too busy fighting to worry about food\n\r");
        return;
    }
    else if (carrionfeeding > 1 && character.IsAffected(carrionskill))
    {
        character.Act("You are not ready to carrion feed yet.");
    }
    else if (!item.ItemTypes.ISSET(ItemData.ItemTypes.Food) && !item.ItemTypes.ISSET(ItemData.ItemTypes.Pill) &&
        (carrionfeeding <= 1 ||
            !(item.ItemTypes.ISSET(ItemData.ItemTypes.NPCCorpse) || (item.VNum >= 8 && item.VNum <= 12))))
    {
        character.send("That's not edible.\n\r");
        return;
    }
    else if (!character.IsNPC && !character.IsImmortal && character.Hunger > 40 &&
        (carrionfeeding <= 1 ||
            !(item.ItemTypes.ISSET(ItemData.ItemTypes.NPCCorpse) || (item.VNum >= 8 && item.VNum <= 12))))
    {
        character.send("You are too full to eat more.\n\r");
        return;
    }
    else
    {

        if (carrionfeeding > 1 && (((item.ItemTypes.ISSET(ItemData.ItemTypes.NPCCorpse) || (item.Vnum >= 8 && item.Vnum <= 12)))))
        {
            item.Nutrition = 40;
            character.Thirst = 40;
            character.Dehydrated = 0;

            character.HitPoints += ch.MaxHitPoints * 0.2;
            character.HitPoints = Math.min(ch.HitPoints, ch.MaxHitPoints);
            character.Act("You devour $p ravenously.", null, item, null, Character.ActType.ToChar);
            character.Act("$n devours $p ravenously.", null, item, null, Character.ActType.ToRoom);

            var feeding = new AffectData();
            feeding.Duration = 1;
            feeding.DisplayName = "carrion feeding";
            feeding.EndMessage = "You feel ready to carrion feed again.";
            feeding.SkillSpell = carrionskill;
            character.AffectToChar(feeding);
        }
        else
        {
            character.Act("You eat $p.", null, item, null, Character.ActType.ToChar);
            character.Act("$n eats $p.", null, item, null, Character.ActType.ToRoom);

        }
        character.Hunger += item.Nutrition;
        character.Starving = 0;
        if (character.Hunger <= 4)
            character.send("You are no longer hungry.\n\r");
        else if (character.Hunger > 40)
            character.send("You are full.\n\r");

        character.Hunger = Math.min(character.Hunger, 48);
        if (item.ExtraFlags.ISSET(ItemData.ExtraFlags.Heart))
        {
            character.send("You feel empowered by eating the heart of your foe.\n\r");
            character.HitPoints += 15;
        }
        if (item.ExtraFlags.ISSET(ItemData.ExtraFlags.Poison) && carrionfeeding <= 1)
        {
            var affect = new AffectData();
            affect.DisplayName = "food poisoning";
            affect.SkillSpell = SkillSpell.SkillLookup("poison");
            affect.Location = AffectData.ApplyTypes.None;
            affect.Where = AffectData.AffectWhere.ToAffects;
            affect.Level = item.Level;
            affect.Duration = 2;
            character.AffectToChar(affect);
            character.send("You choke and gag.\n\r");
            character.Act("$n chokes and gags.\n\r", null, null, null, Character.ActType.ToRoom);

        }

        if (character.Inventory.indexOf(item) >= 0)
        {
            character.Inventory.Remove(item);
            item.CarriedBy = null;
        }
        else if (character.Room.Items.indexOf(item) >= 0)
        {
            character.Room.Items.Remove(item);
            item.Room = null;
        }
        if (item.Spells)
            for (var spell of item.Spells)
            {
                if (spell.Spell != null)
                    Magic.ItemCastSpell(SkillSpell.CastType.Cast, spell.Spell, spell.Level, character, character, item, character.Room);
            }
    }
} // end do eat

Character.DoCommands.DoDrink = function(character, args) {
    const AffectData = require("./AffectData");
    const SkillSpell = require("./SkillSpell");
    const Liquid = require("./Liquid");
    var containerName = "";
    [containerName, args] = args.OneArgument();
    var container = null;
    var count = 0;

    if (Utility.IsNullOrEmpty(containerName))
    {
        for (var item of character.Room.items)
        {
            if (item.ItemTypes.ISSET(ItemData.ItemTypes.Fountain))
            {
                container = item;
            }
        }

        if (container == null)
        {
            character.send("Drink what?\n\r");
            return;
        }
    }
    else
    {
        if (character.Form || (([container] = character.GetItemInventory(containerName)) && !container))
        {
            character.send("You can't find it.\n\r");
            return;
        }
    }

    if (character.Fighting != null)
    {
        character.send("You're too busy fighting to drink anything.\n\r");
        return;
    }



    var amount;
    var liquid;
    var charges;

    if (container.ItemTypes.ISSET(ItemData.ItemTypes.Fountain))
    {
        liquid = container.Liquid;
        amount = container.Nutrition;
    }

    else if (container.ItemTypes.ISSET(ItemData.ItemTypes.DrinkContainer))
    {
        liquid = container.Liquid;
        amount = container.Nutrition;
        charges = container.Charges;

        if (charges == 0)
        {
            character.send("It's empty.\n\r");
            return;
        }
        else container.Charges--;

    }
    else
    {
        character.send("You can't drink from that.\n\r");
        return;
    }
    var hunger = 0;
    var thirst = amount;
    var drunk = 0;

    var liq = Liquid.Liquids.FirstOrDefault(l => l.Name.equals(liquid));
    if (liq)
    {
        amount = Math.max(liq.ServingSize, amount);
        thirst = amount * liq.Thirst / 3;
        hunger = amount * liq.Full / 3;
        drunk = amount * liq.Proof / 36;

    }

    if (character.Drunk >= 48 && drunk > 0)
    {
        character.send("You fail to reach your mouth. *Hic*\n\r");
        return;
    }

    //if (amount > 0)
    {


        character.Act("You drink {0} from $p.\n\r", null, container, null, Character.ActType.ToChar, liquid.toLowerCase());
        character.Act("$n drinks {0} from $p.\n\r", null, container, null, Character.ActType.ToRoom, liquid.toLowerCase());

        if (thirst != 0)
            character.Thirst = Math.min(character.Thirst + thirst, 48);

        if (hunger != 0)
            character.Hunger = Math.min(character.Hunger + hunger, 48);

        if (character.Thirst > 0)
            character.Dehydrated = 0;

        if (character.Hunger > 0)
            character.Starving = 0;

        if (drunk != 0)
            character.Drunk = character.Drunk + drunk;

        if (!character.IsNPC && character.Thirst >= 48 && thirst > 0)
        {
            character.send("Your thirst is quenched.\n\r");
            character.Dehydrated = 0;
        }

        if (!character.IsNPC && character.Hunger >= 48 && hunger > 0)
        {
            character.send("You are full.\n\r");
            character.Dehydrated = 0;
            character.Starving = 0;
        }

        if (!character.IsNPC && character.Drunk >= 20)
        {
            character.send("You're smashed!\n\r");
            var affect;
            var alcoholpoisoning = SkillSpell.SkillLookup("alcohol poisoning");

            if ((affect = character.FindAffect(alcoholpoisoning)))
            {
                affect.Duration = character.Drunk / 10;
            }
            else
            {
                affect = new AffectData();
                affect.displayName = "alcohol poisoning";
                affect.skillSpell = alcoholpoisoning;
                affect.location = ApplyTypes.None;
                affect.where = AffectWhere.ToAffects;
                affect.level = 1;
                affect.duration = character.Drunk / 10;
                character.AffectToChar(affect);
            }
        }
        else if (!character.IsNPC && character.Drunk >= 10)
        {
            character.send("You feel drunk.\n\r");

        }
        else if (!character.IsNPC && character.Drunk >= 2)
        {
            character.send("You feel tipsy.\n\r");

        }

        if (container.ExtraFlags.ISSET(ItemData.ExtraFlags.Poison))
        {

            var affect = new AffectData();

            affect.SkillSpell = SkillSpell.SkillLookup("poison");
            affect.Location = AffectData.ApplyTypes.None;
            affect.Flags.SETBIT(AffectData.AffectFlags.Poison);
            affect.Where = AffectData.AffectWhere.ToAffects;
            affect.Level = container.Level;
            affect.DisplayName = "food poisoning";
            affect.Duration = 2;
            character.AffectToChar(affect);
            character.send("You choke and gag.\n\r");
            character.Act("$n chokes and gags.\n\r", null, null, null, Character.ActType.ToRoom);

        }
    }
} // end do drink
Character.DoCommands.DoGet = DoGet;
Character.DoCommands.DoDrop = DoDrop;
Character.DoCommands.DoRemove = DoRemove;
Character.DoCommands.DoWear = DoWear;
