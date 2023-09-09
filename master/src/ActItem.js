const Character = require("./Character");
const ItemData = require("./ItemData");
const Utility = require("./Utility");



Character.DoCommands.DoGet = function (character, args) {
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

Character.DoCommands.DoDrop = function (character, args) {
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
                    character.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToRoom);
                    character.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToChar);
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
                    character.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToRoom);
                    character.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToChar);
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
                character.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToRoom);
                character.Act("$p crumbles into dust.", null, contained, null, Character.ActType.ToChar);
                item.Dispose();
            }
        }
    }
}


Character.DoCommands.DoRemove = function (character, args) {
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


Character.DoCommands.DoWear = function (character, args) {
    
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

            character.HitPoints += character.MaxHitPoints * 0.2;
            character.HitPoints = Math.min(character.HitPoints, character.MaxHitPoints);
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
        for (var item of character.Room.Items)
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

Character.DoCommands.DoFill = function(ch, args)
{
    var [containerName, args] = args.OneArgument();
    var container = null;
    var fountain = null;
    var count = 0;
    [container] = ch.GetItemInventory(containerName);
    // fountain search
    for (var item of ch.Room.items) {
        if (item.ItemTypes.ISSET(ItemData.ItemTypes.Fountain)) {
            fountain = item;
            break;
        }
    }

    if (ch.Fighting)
    {
        ch.send("You're too busy fighting to fill anything.\n\r");
    } else if (!fountain) {
        ch.send("Nothing here to fill from.\n\r");
        return;
    } else if (Utility.IsNullOrEmpty(containerName))
    {
        ch.send("Fill what?\n\r");
    } else if (!container) {
        ch.send("You can't find it.\n\r");
    } else if (!container.ItemTypes.ISSET(ItemData.ItemTypes.DrinkContainer))
    {
        ch.Act("$p can't be filled.\n\r", null, container);
    } else if (container.Charges >= container.MaxCharges) {
        ch.Act("$p is already full.\n\r", null, container);
    } else {
        container.Charges = container.MaxCharges;
        container.Liquid = fountain.Liquid;
        ch.Act("You fill $p with {1} from $P.\n\r", null, container, fountain, Character.ActType.ToChar, fountain.Liquid);
        ch.Act("$n fills $p with {0} from $P.\n\r", null, container, fountain, Character.ActType.ToRoom, fountain.Liquid);
    }
} // end do fill

Character.DoCommands.DoRecite = function(character, args) {
    const Game = require("./Game");
    const Magic = require("./Magic");
    var itemName = "";
    var victimName = "";
    var scroll;
    var targetItem;
    var count = 0;
    var victim;

    [itemName, args] = args.OneArgument();
    [victimName, args] = args.OneArgument();
    if(!victimName.ISEMPTY()) {
        [targetItem, count] = character.GetItemHere(victimName, count)
        [victim, count] = character.GetCharacterHere(victimName, count);
    }
    if (itemName.ISEMPTY())
    {
        character.send("What scroll would you like to recite?\n\r");
        return;
    }
    else if (([scroll] = character.GetItemInventory(itemName)) == null)
    {
        character.send("You aren't carrying that scroll.\n\r");
        return;
    }
    else if (!scroll.ItemTypes.ISSET(ItemData.ItemTypes.Scroll))
    {
        character.send("You can only recite magical scrolls.\n\r");
        return;
    }
    else if (character.Level < scroll.Level)
    {
        character.send("This scroll is too complex for you to comprehend.\n\r");
        return;
    }
    else if (targetItem)
    {
        character.Act("$n recites $p at $P.", null, scroll, targetItem, Character.ActType.ToRoom);
        character.Act("You recite $p at $P.", null, scroll, targetItem, Character.ActType.ToChar);
        character.WaitState(Game.PULSE_VIOLENCE);

        if (Utility.NumberPercent() >= character.GetSkillPercentage("scrolls") * 4 / 5)
        {
            character.send("You mispronounce a syllable.\n\r");
            character.CheckImprove("scrolls", false, 2);
        }
        else
        {
            for (var spell of scroll.Spells)
            {
                Magic.ItemCastSpell(Magic.CastType.Cast, spell.Spell, spell.Level, character, null, targetItem, null);
            }
            character.CheckImprove("scrolls", true, 2);
        }

        character.Inventory.Remove(scroll);
        scroll.CarriedBy = null;

    }
    else if (victim || (victimName.ISEMPTY() && (victim = character.Fighting)))
    {
        character.Act("$n recites $p at $N.", victim, scroll, null, Character.ActType.ToRoom);
        character.Act("You recite $p at $N.", victim, scroll, null, Character.ActType.ToChar);
        character.WaitState(Game.PULSE_PER_VIOLENCE);

        if (Utility.NumberPercent() >= character.GetSkillPercentage("scrolls") * 4 / 5)
        {
            character.send("You mispronounce a syllable.\n\r");
            character.CheckImprove("scrolls", false, 2);
        }
        else
        {
            for (var spell of scroll.Spells)
            {
                Magic.ItemCastSpell(Magic.CastType.Cast, spell.Spell, spell.Level, character, victim, null, null);
            }
            character.CheckImprove("scrolls", true, 2);
        }
        character.Inventory.Remove(scroll);
        scroll.CarriedBy = null;
    }
    else if (!victimName.ISEMPTY())
    {
        character.send("You don't see them here.\n\r");
        return;
    }
    else
    {
        character.Act("$n recites $p at $mself.", null, scroll, null, Character.ActType.ToRoom);
        character.Act("You recite $p at yourself.", null, scroll, null, Character.ActType.ToChar);
        character.WaitState(Game.PULSE_PER_VIOLENCE);
        if (Utility.NumberPercent() >= character.GetSkillPercentage("scrolls") * 4 / 5)
        {
            character.send("You mispronounce a syllable.\n\r");
            character.CheckImprove("scrolls", false, 2);
        }
        else
        {
            for (var spell of scroll.Spells)
            {
                Magic.ItemCastSpell(Magic.CastType.Cast, spell.Spell, spell.Level, character, character, null, null);
            }
            character.CheckImprove("scrolls", true, 2);
        }
        character.Inventory.Remove(scroll);
        scroll.CarriedBy = null;
    }
} // do recite

Character.DoCommands.DoZap = function(character, args) {
    const Game = require("./Game");
    const Magic = require("./Magic");
    var wand = null;
    var count = 0;
    var argument = "";
    var victim = null;
    var zapTarget = null;
    [argument, args] = args.OneArgument();
    [victim, count] = character.GetCharacterHere(argument, count);
    [zapTarget, count] = character.GetItemInventory(argument, count);

    if (argument.ISEMPTY())
    {
        character.send("Who do you want to zap?\n\r");
    }
    else if (!(wand = character.Equipment[ItemData.WearSlotIDs.Held]))
    {
        character.send("You aren't holding a wand.\n\r");
    }
    else if (!wand.ItemTypes.ISSET(ItemData.ItemTypes.Wand))
    {
        character.send("You can only zap with wands.\n\r");
    }
    //else if (character.Fighting != null)
    //{
    //    character.send("You are too busy fighting to zap anyone.\n\r");
    //}
    else if (!victim && !zapTarget)
    {
        character.send("You don't see them or that here.\n\r");
    }
    else if (victim || (argument.ISEMPTY() && (victim = character.Fighting)))
    {
        if (victim != character)
        {
            character.Act("$n zaps $N with $p.", victim, wand, null, Character.ActType.ToRoomNotVictim);
            character.Act("$n zaps you with $p.", victim, wand, null, Character.ActType.ToVictim);
            character.Act("You zap $N with $p.", victim, wand, null, Character.ActType.ToChar);
        }
        else
        {
            character.Act("$n zaps $mself with $p.", victim, wand, null, Character.ActType.ToRoomNotVictim);
            character.Act("You zap yourself with $p.", victim, wand, null, Character.ActType.ToChar);
        }
        character.WaitState(Game.PULSE_VIOLENCE);

        if (character.Level < wand.Level || Utility.NumberPercent() >= character.GetSkillPercentage("wands") * 4 / 5)
        {
            character.Act("Your efforts with $p produce only smoke and sparks.", null, wand);
            character.Act("$n's efforts with $p produce only smoke and sparks.", null, wand, null, Character.ActType.ToRoom);
            character.CheckImprove("wands", false, 2);
        }
        else
        {
            for (var spell of wand.Spells)
            {
                Magic.ItemCastSpell(Magic.CastType.Cast, spell.Spell, spell.Level, character, victim, wand, null);
            }
            character.CheckImprove("wands", true, 2);
        }
    }

    else if (zapTarget)
    {

        character.Act("$n zaps $P with $p.", victim, wand, zapTarget, Character.ActType.ToRoom);
        character.Act("You zap $P with $p.", victim, wand, zapTarget, Character.ActType.ToChar);
        character.WaitState(Game.PULSE_VIOLENCE);
        if (character.Level < wand.Level || Utility.NumberPercent() >= character.GetSkillPercentage("wands") * 4 / 5)
        {
            character.Act("Your efforts with $p produce only smoke and sparks.", null, wand);
            character.Act("$n's efforts with $p produce only smoke and sparks.", null, wand, null, Character.ActType.ToRoom);
            character.CheckImprove("wands", false, 2);
        }
        else
        {
            for (var spell of wand.Spells)
            {
                Magic.ItemCastSpell(Magic.CastType.Cast, spell.Spell, spell.Level, character, null, zapTarget, null);
            }
            character.CheckImprove("wands", true, 2);
        }
    }
    if(wand && (victim || zapTarget)) {
        wand.Charges--;
        if (wand.Charges <= 0) {
            character.Act("$n's $p explodes into fragments.", victim, wand, null, Character.ActType.ToRoom);
            character.Act("Your $p explodes into fragments.", victim, wand, null, Character.ActType.ToChar);
            character.Equipment[ItemData.WearSlotIDs.Held].CarriedBy = null;
            delete character.Equipment[ItemData.WearSlotIDs.Held];
        }    
    }
} // do zap

Character.DoCommands.DoBrandish = function(character, args) {
    const Game = require("./Game");
    const Magic = require("./Magic");
    var staff = character.Equipment[ItemData.WearSlotIDs.Held];

    if (!staff)
    {
        character.send("You aren't using a staff.\n\r");
        return;
    }
    else if (!staff.ItemTypes.ISSET(ItemData.ItemTypes.Staff) && !staff.ItemTypes.ISSET("Talisman"))
    {
        character.send("You can only brandish a staff.\n\r");
        return;
    }
    else if (character.Fighting)
    {
        character.send("You are too busy fighting to brandish your staff.\n\r");
        return;
    }
    else
    {
        character.Act("$n brandishes $p.", null, staff, null, Character.ActType.ToRoom);
        character.Act("You brandish $p.", null, staff, null, Character.ActType.ToChar);
        character.WaitState(Game.PULSE_VIOLENCE);
        if (Utility.NumberPercent() >= 20 + character.GetSkillPercentage("talismans") * 4 / 5)
        {
            character.Act("You fail to invoke $p.\n\r", null, staff);
            character.Act("... and nothing happens.", null, null, null, Character.ActType.ToRoom);
            character.CheckImprove("talismans", false, 2);

        }
        else
        {
            for (var spell of staff.Spells)
            {
                Magic.ItemCastSpell(Magic.CastType.Cast, spell.Spell, spell.Level, character, character, staff, null);
            }
            character.CheckImprove("talismans", true, 2);
        }
    }


    staff.Charges--;
    if (staff.Charges <= 0)
    {
        character.Act("Your $p disinitgrates in your hands.", null, staff, null, Character.ActType.ToChar);
        character.Act("$n's $p disingtates in their hands.", null, staff, null, Character.ActType.ToRoom);
        character.Equipment[ItemData.WearSlotIDs.Held].CarriedBy = null;
        delete character.Equipment[ItemData.WearSlotIDs.Held];
    }    
} // do brandish

Character.DoCommands.DoQuaf = function(character, args) {
    const Game = require("./Game");
    const Magic = require("./Magic");

    var itemName = "";
    var potion;
    [itemName, args] = args.OneArgument();
    [potion] = character.GetItemInventory(itemName);

    if (itemName.ISEMPTY())
    {
        character.send("Quaf what?\n\r");
    }
    else if (!potion) 
    {
        character.send("You don't have that.\n\r");
    }
    else if (!potion.ItemTypes.ISSET(ItemData.ItemTypes.Potion))
    {
        character.send("You can only quaf potions.\n\r");
    }
    else if (character.Fighting)
    {
        character.send("You are too busy fighting to quaf anything.\n\r");
    }
    else
    {
        character.Act("$n quaffs $p.", null, potion, null, Character.ActType.ToRoom);
        character.Act("You quaff $p.", null, potion, null, Character.ActType.ToChar);
        character.WaitState(Game.PULSE_VIOLENCE);

        for(var spell of potion.Spells)
        {
            Magic.ItemCastSpell(Magic.CastType.Cast, spell.Spell, spell.Level, character, character, null, null);
        }

        character.Inventory.Remove(potion);
        potion.CarriedBy = null;
    }   
} // do quaf

Character.DoCommands.DoUse = function(character, args) {
    const Game = require("./Game");
    const Magic = require("./Magic");
    const Program = require("./Program");
    if (args.ISEMPTY())
    {
        character.send("Use what?\n\r");
        return;
    }

    var itemname = "";

    [itemname, args] = args.OneArgument();

    var item = character.GetItemHere(itemname);

    if (item == null)
    {
        character.send("You don't see that here.\n\r");
        return;
    }

    // bool found = false;

    // Program.Execute(Programs.ProgramTypes.Use, ch, item, "");

    // if (!found)
    character.send("You can't seem to figure out how to do that.\n\r");
} // do use

Character.DoCommands.DoRepair = function(character, args) {
    var shopKeeper = null;

    // Check if the player character is in a form
    if (character.Form)
    {
        character.send("They wouldn't be able to understand you.\n\r");
        return;
    }

    // Search for a shopkeeper NPC character in the same room as the player character
    for (var npc of character.Room.Characters)
    {
        if (npc.IsNPC && npc.Flags.ISSET(Character.ActFlags.Shopkeeper))
        {
            shopKeeper = npc;
            break;
        }
    }

    // If a shopkeeper is found, proceed with repairs
    if (shopKeeper && shopKeeper.BuyTypes)
    {
        // Display repairable item types and damaged items the player character is wearing or carrying
        if (args.ISEMPTY()) {
            character.send("This shop will repair the following types of things: ");
            character.send("{0}\n\r", Utility.JoinFlags(shopKeeper.BuyTypes));
            character.Act("$N will repair for you the following goods:", shopKeeper);

            // Get the damaged items from the player character's equipment and inventory
            var items = [];
            
            for(var key in character.Equipment) {
                var item = character.Equipment[key];
                if(item && item.Durability < item.MaxDurability && shopKeeper.BuyTypes.IsSetAny(item.ItemTypes)) {
                    items.push(item);
                }
            }
            for(var item of character.Inventory) {
                if(item && item.Durability < item.MaxDurability && shopKeeper.BuyTypes.IsSetAny(item.ItemTypes)) {
                    items.push(item);
                }
            }


            if (items.length == 0)
            {
                character.send("You aren't wearing or carrying any damaged items that this shopkeeper can fix.\n\r");
                return;
            }

            // Display the damaged items and their repair costs
            for (var item of items)
            {
                var value = item.Value * shopKeeper.SellProfitPercent / 100 * (item.Durability / item.MaxDurability);
                character.send("[{0,3}] {1,7} - {2}\n\r", item.Level, value, item.DisplayFlags(character) + item.Display(character));
            }
        }
        else // Repair a specific item
        {
            var count = 0;

            // Get the damaged items from the player character's equipment and inventory
            var items = [];
        
            for(var key in character.Equipment) {
                var item = character.Equipment[key];
                if(item && item.Durability < item.MaxDurability && shopKeeper.BuyTypes.IsSetAny(item.ItemTypes)) {
                    items.push(item);
                }
            }
            for(var item of character.Inventory) {
                if(item && item.Durability < item.MaxDurability && shopKeeper.BuyTypes.IsSetAny(item.ItemTypes)) {
                    items.push(item);
                }
            }

            // Retrieve the specific item to repair
            var [item] = character.GetItemList(items, args);

            if (!item)
            {
                character.send("You don't have that item or it isn't damaged.\n\r");
                return;
            }

            // Calculate the repair cost
            var value = item.Value * shopKeeper.SellProfitPercent / 100 * (item.Durability / item.MaxDurability);
            var gold = value / 1000;
            var silver = value % 1000;

            // Check if the player character has enough coins to cover the repair cost
            if (character.Silver + (character.Gold * 1000) < value)
            {
                character.send("You don't have enough coins.\n\r");
                return;
            }
            else
            {
                // Deduct the repair cost from the player character's gold and silver
                character.Silver -= silver;
                character.Gold -= gold;

                // Repair the item by setting its durability to the maximum
                item.Durability = item.MaxDurability;

                // Send messages to indicate the successful repair
                character.Act("$N repairs $p.", shopKeeper, item, null, Character.ActType.ToChar);
                character.Act("$N repairs $n's $p.", shopKeeper, item, null, Character.ActType.ToRoomNotVictim);
                character.Act("You repair $n's $p.", shopKeeper, item, null, Character.ActType.ToVictim);
            }
        }
    }
    else
    {
        character.send("You see no shopkeepers here.\n\r");
    }
}

Character.DoCommands.DoWield = function (character, args) {
    
    if (Utility.IsNullOrEmpty(args)) {
        character.send("Wield what?\n\r");
        return;
    } else {
        var [item] = character.GetItemInventory(args);

        if (item)
        {
            if(item.ItemTypes.ISSET(ItemData.ItemTypes.Weapon)) {
                character.WearItem(item);
            } else {
                character.send("That isn't a weapon.\n\r");
            }
        }
        else
            character.send("You aren't carrying that.\n\r");
    }
}

Character.DoCommands.DoGive = function(ch, args)
{
    var other;
    var itemname = "";
    var count = 0;
    if (ch.Form)
    {
        ch.send("You aren't holding anything.\n\r");
        return;
    }
    [itemname, args] = args.OneArgument();

    var amount = Number(itemname);

    if (amount && Number.isInteger(amount))
    {
        [itemname, args] = args.OneArgument();
        other = ch.GetCharacterHere(args);

        if (other == ch)
        {
            ch.send("You can't give yourself anything.\n\r");
            return;
        }
        else if (!other)
        {
            ch.send("You don't see them here.\n\r");
            return;
        }

        if (itemname.equals("gold"))
        {
            if (amount > ch.Gold)
            {
                ch.send("You don't have that much gold.\n\r");
                return;
            }
            else if (amount < 1)
            {
                ch.send("You can only give a positive amount of gold.\n\r");
                return;
            }

            ch.Gold -= amount;
            other.Gold += amount;
            ch.Act("You give $N {0} gold.", other, null, null, Character.ActType.ToChar, amount);
            ch.Act("$n gives you {0} gold.", other, null, null, Character.ActType.ToVictim, amount);
            ch.Act("$n gives $N some gold.", other, null, null, Character.ActType.ToRoomNotVictim);
            //Programs.ExecutePrograms(Programs.ProgramTypes.Give, ch, other, null, null, amount + " gold");
            return;
        }
        else if (itemname.equals("silver"))
        {
            if (amount > ch.Silver)
            {
                ch.send("You don't have that much silver.\n\r");
                return;
            }
            else if (amount < 1)
            {
                ch.send("You can only give a positive amount of silver.\n\r");
                return;
            }

            ch.Silver -= amount;
            other.Silver += amount;
            ch.Act("You give $N {0} silver.", other, null, null, Character.ActType.ToChar, amount);
            ch.Act("$n gives you {0} silver.", other, null, null, Character.ActType.ToVictim, amount);
            ch.Act("$n gives $N some silver.", other, null, null, Character.ActType.ToRoomNotVictim);
            //Programs.ExecutePrograms(Programs.ProgramTypes.Give, ch, other, null, null, amount + " silver");
            return;
        }
        else
        {
            ch.send("Give gold or silver?\n\r");
            return;
        }

    }
    var [item] = ch.GetItemInventory(itemname);
    const AffectData = require('./AffectData');
    [other] = ch.GetCharacterHere(args);

    if (other == ch)
    {
        ch.send("You can't give yourself anything.\n\r");
    }
    else if (!other)
    {
        ch.send("You don't see them here.\n\r");
    }
    else if (other && !other.CanSee(item))
    {
        ch.Act("You wave your hands at $N but they can't see $p.", other, item);
        ch.Act("$n waves $s hands at you.", other, null, Character.ActType.ToVictim);
    }
    else if (other && item &&
        (!item.ExtraFlags.ISSET(ItemData.ExtraFlags.NoDrop) || item.IsAffected(AffectData.AffectFlags.Greased)))
    {
        if (other.Carry + 1 > other.MaxCarry)
        {
            ch.send("They can't carry anymore items.");
            ch.Act("$n tries to give you $p, but you are carrying too many things.", other, item, null, Character.ActType.ToVictim);
            return;
        }
        if (other.TotalWeight + item.Weight > other.MaxWeight)
        {
            ch.send("You can't carry anymore weight.\n\r");
            ch.Act("$n tries to give you $p, but you are carrying too much weight.", other, item, null, Character.ActType.ToVictim);
            return;
        }


        ch.Inventory.Remove(item);
        other.Inventory.Insert(0, item);
        item.CarriedBy = other;
        ch.Act("You give $p to $N.", other, item, null, Character.ActType.ToChar);
        ch.Act("$n gives you $p.\n\r", other, item, null, Character.ActType.ToVictim);
        ch.Act("$n gives $p to $N.\n\r", other, item, null, Character.ActType.ToRoomNotVictim);
        //Programs.ExecutePrograms(Programs.ProgramTypes.Give, ch, other, item, null, "");

        if (other.IsNPC)
        {
            // if (other is NPCData)
            // {
            //     Programs.ExecutePrograms(Programs.ProgramTypes.Receive, ch, other, item, null, "");
            // }

            if (other.IsAwake)
            {
                other.WearItem(item, true, false);

                if (other.Inventory.indexOf(item) >= 0 && other.CanSee(ch))
                {

                    other.Inventory.Remove(item);
                    ch.Inventory.unshift(item);
                    item.CarriedBy = ch;

                    other.Act("You give $p to $N.\n\r", ch, item, null, Character.ActType.ToChar);
                    ch.Act("$N gives you $p.\n\r", other, item, null, Character.ActType.ToChar);
                    other.Act("$n gives $p to $N.\n\r", ch, item, null, Character.ActType.ToRoomNotVictim);


                }
                else if (other.Inventory.Contains(item))
                {
                    other.Inventory.Remove(item);
                    item.CarriedBy = null;
                    other.Room.Items.unshift(item);
                    item.Room = other.Room;

                    other.Act("You drop $p.\n\r", ch, item, null, Character.ActType.ToChar);
                    ch.Act("$N drops $p.\n\r", other, item, null, Character.ActType.ToChar);
                    other.Act("$n drops $p.\n\r", ch, item, null, Character.ActType.ToRoomNotVictim);
                }
                return;
            }
        }

    }
    else if (other != null && item != null)
        ch.send("You can't let go of it!\n\r");
    else if (item == null)
        ch.send("You don't have that.\n\r");
    else
        ch.send("You don't see them here.\n\r");
}