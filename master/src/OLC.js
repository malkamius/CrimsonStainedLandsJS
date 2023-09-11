const AreaData = require("./AreaData");
const Character = require("./Character");
const ItemData = require("./ItemData");
const ItemTemplateData = require("./ItemTemplateData");
const NPCTemplateData = require("./NPCTemplateData");
const ResetData = require("./ResetData");
const RoomData = require("./RoomData");
const Utility = require("./Utility");

class OLC {
    static EditAreaCommands = [
        { action: OLC.DoEditAreaCredits, name: "credits" },
        { action: OLC.DoEditAreaName, name: "name" },
        { action: OLC.DoEditAreaOverRoomVnum, name: "overroomvnum" }
    ];
    
    static EditRoomCommands = [
        { action: OLC.DoEditRoomDescription, name: "description" },
        { action: OLC.DoEditRoomName, name: "name" },
        { action: OLC.DoEditRoomSector, name: "sector" },
        { action: OLC.DoEditRoomFlags, name: "flags" },
        { action: OLC.DoEditRoomExits, name: "exits" },
        { action: OLC.DoEditRoomResets, name: "resets" },
        { action: OLC.DoEditRoomExtraDescriptions, name: "extradescriptions" }
    ];
    static EditNPCCommands = [
        { action: OLC.DoEditNPCDescription, name: "description" },
        { action: OLC.DoEditNPCName, name: "name" },
        { action: OLC.DoEditNPCFlags, name: "flags" },
        { action: OLC.DoEditNPCImmuneFlags, name: "immuneflags" },
        { action: OLC.DoEditNPCResistFlags, name: "resistflags" },
        { action: OLC.DoEditNPCVulnerableFlags, name: "vulnerableflags" },
        { action: OLC.DoEditNPCAffectedBy, name: "affectedby" },
        { action: OLC.DoEditNPCLevel, name: "level" },
        { action: OLC.DoEditNPCGold, name: "gold" },
        { action: OLC.DoEditNPCGuild, name: "guild" },
        { action: OLC.DoEditNPCRace, name: "race" },
        { action: OLC.DoEditNPCGender, name: "sex" },
        { action: OLC.DoEditNPCAlignment, name: "alignment" },
        { action: OLC.DoEditNPCHitRoll, name: "hitroll" },
        { action: OLC.DoEditNPCDamageRoll, name: "damageroll" },
        { action: OLC.DoEditNPCLongDescription, name: "longdescription" },
        { action: OLC.DoEditNPCShortDescription, name: "shortdescription" },
        { action: OLC.DoEditNPCDamageDice, name: "damagedice" },
        { action: OLC.DoEditNPCHitPointDice, name: "hitpointdice" },
        { action: OLC.DoEditNPCManaPointDice, name: "manapointdice" },
        { action: OLC.DoEditNPCProtects, name: "protects" }
    ];
    static EditItemCommands = [
        { action: OLC.DoEditItemDescription, name: "description" },
        { action: OLC.DoEditItemName, name: "name" },
        { action: OLC.DoEditItemLongDescription, name: "longdescription" },
        { action: OLC.DoEditItemShortDescription, name: "shortdescription" },
        { action: OLC.DoEditItemNightLongDescription, name: "nightlongdescription" },
        { action: OLC.DoEditItemNightShortDescription, name: "nightshortdescription" },
        { action: OLC.DoEditItemExtraFlags, name: "extraflags" },
        { action: OLC.DoEditItemWearFlags, name: "wearflags" },
        { action: OLC.DoEditItemWeaponType, name: "weapontype" },
        { action: OLC.DoEditItemLevel, name: "level" },
        { action: OLC.DoEditItemWeight, name: "weight" },
        { action: OLC.DoEditItemMaxWeight, name: "maxweight" },
        { action: OLC.DoEditItemValue, name: "value" },
        { action: OLC.DoEditItemItemTypes, name: "itemtypes" },
        { action: OLC.DoEditItemDamageDice, name: "damagedice" },
        { action: OLC.DoEditItemDamageMessage, name: "damagemessage" },
        { action: OLC.DoEditItemMaterial, name: "material" },
        { action: OLC.DoEditItemExtraDescriptions, name: "extradescriptions" },
        { action: OLC.DoEditItemLiquid, name: "liquid" },
        { action: OLC.DoEditItemNutrition, name: "nutrition" },
        { action: OLC.DoEditItemMaxCharges, name: "maxcharges" },
        { action: OLC.DoEditItemMaxDurability, name: "maxdurability" },
        { action: OLC.DoEditItemAffects, name: "affects" },
        { action: OLC.DoEditItemSpells, name: "spells" }
    ];

    static DoNextVnum(ch, args)
    {
        var area = ch.EditingArea || ch.Room.Area;
        if(area) {
            ch.send("Next Vnums: Room {0}, NPC {1}, Item {2}\n\r",
                Object.keys(area.Rooms).length > 0 ? Utility.Max(area.Rooms, r => r.VNum) + 1 : area.VNumStart,
                Object.keys(area.NPCTemplates).length > 0 ? Utility.Max(area.NPCTemplates, n => n.VNum) + 1 : area.VNumStart,
                Object.keys(area.ItemTemplates).length > 0 ? Utility.Max(area.ItemTemplates, i => i.VNum) + 1 : area.VNumStart);
        } else {
            ch.send("Area not found.\n\r");
        }
    }

    static DoCreate(ch, args)
    {
        var [type, args] = args.OneArgument();

        if ("area".prefix(type))
        {
            
            var [nameString, args] = args.OneArgument();
            var [vnumStartString, args] = args.OneArgument();
            var [vnumEndString, args] = args.OneArgument();

            var VNumStart = Number(vnumStartString);
            var VNumEnd = Number(vnumEndString);
            if (!VNumStart || !VNumEnd)
            {
                ch.send("Create Area \"name\" vnumstart vnumend");
                return;
            }

            var area = new AreaData();
            area.Name = nameString;
            area.VNumStart = VNumStart;
            area.VNumEnd = VNumEnd;
            area.FileName = Settings.AreasPath + "/" + nameString + ".xml";
            
            AreaData.AllAreas.Add(area);
            ch.EditingArea = area;
            area.saved = false;
            ch.send("OK\n\r");
        }
        else if ("reset".prefix(type))
        {
            var [ResetTypeString, args] = args.OneArgument();
            var [vnumStartString, args] = args.OneArgument();
            var [vnumEndString, args] = args.OneArgument();
            var [countString, args] = args.OneArgument();
            var [maxCountString, args] = args.OneArgument();

            var VNumStart = Number(vnumStartString);
            var VNumEnd = Number(vnumEndString);
            var count = Number(countString);
            var maxCount = Number(maxCountString);
           
            var resetType = ResetData.ResetTypes.Equip;
            ch.EditingArea = ch.EditingArea || ch.Room.Area;
            if (Utility.IsNullOrEmpty(resetType = Utility.GetEnumValueStrPrefix(ResetData.ResetTypes, ResetTypeString)))
            {
                ch.send("Invalid reset types, valid values: {0}", Utility.JoinFlags(ResetData.ResetTypes, ", "));
            }
            if(!ch.EditingArea) {
                ch.send("Area not found.\n\r");
                return;
            }
            if (!VNumStart)
            {
                ch.send("Invalid start vnum.\n\r");
                return;

            }
            if (!VNumEnd)
            {
                ch.send("Invalid end vnum, using current room vnum.\n\r");
                VNumEnd = ch.Room.Vnum;
                //return;
            }
            if (!count)
            {
                count = 1;
            }
            if (!maxCount)
            {
                maxCount = 1;
            }
            //else
            {
                var reset = new ResetData(ch.EditingArea);
                reset.Type =  resetType;
                reset.VNum = VNumStart;
                reset.Destination = VNumEnd;
                reset.Count = count;
                reset.Max = maxCount;
                ch.EditingArea.saved = false;
                ch.send("OK.\n\r");
            }
        }
        else if ("room".prefix(type))
        {
            var VNumStart = Number(args);
            if (!VNumStart)
            {
                ch.send("You must specify a vnum.\n\r");
            }
            else if (!ch.EditingArea  && !(ch.EditingArea = ch.Room.Area))
            {
                ch.send("Area not found.\n\r");
            }
            else if (RoomData.Rooms[VNumStart])
            {
                ch.send("Room with that vnum already exists.\n\r");
            }
            else
            {
                var room = new RoomData(ch.EditingArea, null, VNumStart);
                ch.EditingRoom = room;
                ch.EditingArea.saved = false;
                ch.send("OK.\n\r");
            }
        }
        else if ("npc".prefix(type) || "mobile".prefix(type))
        {
            var VNumStart = Number(args);
            if (!VNumStart)
            {
                ch.send("You must specify a vnum.\n\r");
            }
            else if (!ch.EditingArea && !(ch.EditingArea = ch.Room.Area))
            {
                ch.send("Area not found.\n\r");
            }
            else if (NPCTemplateData.Templates[VNumStart])
            {
                ch.send("NPC with that vnum already exists.\n\r");
            }
            else
            {
                var npc = new NPCTemplateData(ch.EditingArea, null, VNumStart);
                ch.EditingNPCTemplate = npc;
                ch.EditingArea.saved = false;
                ch.send("OK.\n\r");
            }
        }
        else if ("item".prefix(type) || "object".prefix(type))
        {
            var VNumStart = Number(args);
            if (!VNumStart)
            {
                ch.send("You must specify a vnum.\n\r");
            }
            else if (!ch.EditingArea && !(ch.EditingArea = ch.Room.Area))
            {
                ch.send("Area not found.\n\r");
            }
            else if (ItemTemplateData.Templates[VNumStart])
            {
                ch.send("Item with that vnum already exists.\n\r");
            }
            else
            {
                var item = new ItemTemplateData(ch.EditingArea, null, VNumStart);
                ch.EditingItemTemplate = item;
                ch.EditingArea.saved = false;
                ch.send("OK.\n\r");
            }
        }
        else
        {
            ch.send("Syntax: create area [name] [vnumstart] [vnumend]" +
                "\ncreate room [vnum]" +
                "\ncreate npc [vnum]" +
                "\ncreate item [vnum]" +
                "\nOr: create reset [vnum] [desintation] [count] [maxcount] \n\r");

        }
    }
    
    static DoEdit(ch, args)
    {
        var [type, args] = args.OneArgument();
    
        if ("area".prefix(type))
        {
            OLC.DoEditArea(ch, args);
        }
        else if ("room".prefix(type))
        {
            OLC.DoEditRoom(ch, args);
        }
        else if ("npc".prefix(type) || "mobile".prefix(type))
        {
            OLC.DoEditNPC(ch, args);
        }
        else if ("item".prefix(type) || "object".prefix(type))
        {
            OLC.DoEditItem(ch, args);
        }
        else if("help".prefix(type))
        {
            OLC.DoEditHelp(ch, args);
        }
        else if ("done".prefix(type))
        {
            ch.EditingRoom = null;
            ch.EditingNPCTemplate = null;
            ch.EditingItemTemplate = null;
            ch.EditingArea = null;
            ch.EditingHelp = null;
            ch.send("OK.\n\r");
        }
        else
        {
            ch.send("Syntax: Edit [area|room|item|object|npc|mobile]\n\r");
        }
    
    }
    
    static DoEditNPC(ch, args)
    {
        var [vnumString, args] = args.OneArgument();
        var npcTemplate = ch.EditingNPCTemplate;
        var editCommand;
        var npc;

        var vnum = Number(vnumString);
        if (vnum)
        {
            if (npcTemplate = NPCTemplateData.Templates[vnum])
            {
                [vnumString, args] = args.OneArgument();
                if (!ch.HasBuilderPermission(npcTemplate))
                {
                    ch.send("Builder permissions not set.\n\r");
                    return;
                }
                ch.EditingNPCTemplate = npcTemplate;
            }
            else
            {
                ch.send("npc vnum not found.\n\r");
                return;
            }
        }
        else if ("done".prefix(vnumString))
        {
            ch.EditingRoom = null;
            ch.EditingNPCTemplate = null;
            ch.EditingItemTemplate = null;
            ch.EditingArea = null;
            ch.send("OK.\n\r");
            return;
        }
        else if (ch.EditingNPCTemplate && (editCommand = OLC.EditNPCCommands.FirstOrDefault(c => c.name.prefix(vnumString))))
        {
            if (!ch.HasBuilderPermission(ch.EditingNPCTemplate))
            {
                ch.send("Builder permissions not set.\n\r");
                return;
            }
            if(editCommand.action) {
                editCommand.action(ch, args);
            } else {
                ch.send("Command action missing.\n\r");
            }
            return;
        }
        else if (([npc] = ch.GetCharacterHere(vnumString)) && npc && npc.IsNPC && npc.Template)
        {
            if (!ch.HasBuilderPermission(npc.Template))
            {
                ch.send("Builder permissions not set.\n\r");
                return;
            }
            ch.EditingNPCTemplate = npc.Template;
        }
        else if (npc && !npc.IsNPC)
            ch.send("It isn't an npc.\n\r");
        else if (npc && !npc.Template)
            ch.send("That npc doesn't have a template.\n\r");
        else
            ch.send("You don't see them here.\n\r");
    
        ch.send("Syntax: Edit NPC [vnum] [name|description|level|flags|affectedby|damageroll|hitroll|damagedice|hitpointdice|manapointdice]\n\r");
    }
    
    static DoEditItem(ch, args)
    {
        var vnumString = "";
        [vnumString, args] = args.OneArgument();
        var vnum = 0;
        var itemTemplate;
        var editCommand;
        vnum = Number(vnumString);
        if (vnum)
        {
            if (itemTemplate = ItemTemplateData.Templates[vnum])
            {
                if (!ch.HasBuilderPermission(itemTemplate))
                {
                    ch.send("Builder permissions not set.\n\r");
                    return;
                }
                ch.EditingItemTemplate = itemTemplate;
            }
            else
            {
                ch.send("Item with that vnum not found.\n\r");
                return;
            }
        }
        else if ("done".prefix(vnumString))
        {
            ch.EditingRoom = null;
            ch.EditingNPCTemplate = null;
            ch.EditingItemTemplate = null;
            ch.EditingArea = null;
            ch.send("OK.\n\r");
            return;
        }
        else if (ch.EditingItemTemplate && (editCommand = OLC.EditItemCommands.FirstOrDefault(c => c.name.prefix(vnumString))))
        {
            if (!ch.HasBuilderPermission(ch.EditingItemTemplate))
            {
                ch.send("Builder permissions not set.\n\r");
                return;
            }
            if(editCommand.action) {
                editCommand.action(ch, args);
            } else {
                ch.send("Command action missing.\n\r");
            }
            return;
        }
        else if ([item] = ch.GetItemHere(vnumString) && item && item.Template)
        {
            if (!ch.HasBuilderPermission(item.Template))
            {
                ch.send("Builder permissions not set.\n\r");
                return;
            }
            ch.EditingItemTemplate = item.Template;
        }
        else if (item && !item.Template)
            ch.send("That item doesn't have a template.\n\r");
        else
        {
            ch.send("You don't see that here.");
            return;
        }
    
        ch.send("Syntax: Edit Item [vnum] [name|description|level|extraflags|wearflags|itemtypes|value|nutrition|maxcharges|liquid|material|affects|damagedice|damagemessage|weapontype|weight|maxweight]\n\r");
    }
    
    static DoEditRoom(ch, args)
    {
        var vnumString = "";
        [vnumString] = args.OneArgument();
        var vnum = Number(vnumString);
        var room;
        if (vnum)
        {
            [vnumString, args] = args.OneArgument();
            if (!(room = RoomData.Rooms[vnum]))
            {
                ch.send("room vnum not found.\n\r");
                return;
            }
            if (!ch.HasBuilderPermission(room))
            {
                ch.send("Builder permissions not found.\n\r");
                return;
            }
            ch.EditingRoom = room;
        }
        else if (args.ISEMPTY())
        {
            room = ch.Room;
            ch.EditingRoom = room;
            ch.send("OK, editing room set to current room.\n\r");
            return;
        }
        else if ("done".prefix(args))
        {
            ch.EditingRoom = null;
            ch.EditingNPCTemplate = null;
            ch.EditingItemTemplate = null;
            ch.EditingArea = null;
            ch.send("OK.\n\r");
            return;
        }
        else
        {
            room = ch.EditingRoom || ch.Room;
        }
    
        if (!ch.HasBuilderPermission(room))
        {
            ch.send("Builder permissions not set.\n\r");
            return;
        }
        var commandStr = "";
        [commandStr, args] = args.OneArgument();
        ch.EditingRoom = room;
        for (var command of OLC.EditRoomCommands)
        {
            if (command.name.prefix(commandStr) && command.action)
            {
                command.action(ch, args);
                return;
            }
        }
        ch.send("Invalid command.\n\r");
    }
    
    static DoEditHelp(ch, args)
    {
        var [arg1, args] = args.OneArgument();
        if ("list".prefix(arg1))
        {
            var helps = null;
    
            if (ch.EditingArea)
            {
                helps = ch.EditingArea.Helps;
            }
            else if (!args.ISEMPTY())
                helps = HelpData.Helps.Select(help => help.VNum.toString().prefix(args) || help.Keyword.IsName(args));
            else
                helps = HelpData.Helps;
    
            for(var helpkey in helps)
            {
                var help = helps[helpkey];
                ch.send("{0} :: {1} - {2}\n\r", help.Area.Name, help.VNum, help.Keyword);
            }
        }
        else if ("create".prefix(arg1))
        {
            var vnum = Number(args);
            if (vnum)
            {
                var area = AreaData.AllAreas.FirstOrDefault(a => vnum >= a.VNumStart && vnum <= a.VNumEnd);
                if (area != null)
                {
                    HelpData.Helps[vnum] = AreaData.AllHelps[vnum] = area.Helps[vnum] = ch.EditingHelp = new HelpData(area, null, vnum);
                    HelpData.Helps.Add(ch.EditingHelp);
                    ch.EditingHelp.Area = area;
                    ch.EditingHelp.VNum = vnum;
                    ch.EditingHelp.Keyword = "";
                    ch.EditingHelp.Text = "";
                    ch.EditingHelp.LastEditedOn = new Date();
                    ch.EditingHelp.LastEditedBy = ch.Name;
                    ch.EditingHelp.Area.saved = false;
                }
                else
                    ch.send("Area with a vnum range containing that vnum not found.\n\r");
            }
            else if (ch.EditingArea)
            {
                if (HelpData.Helps.FirstOrDefault(h => h.Keyword.IsName(args)))
                {
                    ch.send("A help with that keyword already exists.\n\r");
                }
                else
                {
                    var area = ch.EditingArea;
                    var vnum = Utility.Max(area.Helps, (h => h.VNum)) + 10;
                    HelpData.Helps[vnum] = AreaData.AllHelps[vnum] = area.Helps[vnum] = ch.EditingHelp = new HelpData(area, null, vnum);
                    ch.EditingHelp.Keyword = "";
                    ch.EditingHelp.Text = "";
                    ch.EditingHelp.LastEditedOn = new Date();
                    ch.EditingHelp.LastEditedBy = ch.Name;
                    ch.EditingHelp.Area.saved = false;
                }
            }
            else
            {
                var area = AreaData.Areas.FirstOrDefault(a => a.Name == "Help");
                if(area) {
                    area.Helps.Add(ch.EditingHelp = new HelpData());
                    var vnum = Utility.Max(area.Helps, (h => h.VNum)) + 10;
                    HelpData.Helps[vnum] = AreaData.AllHelps[vnum] = area.Helps[vnum] = ch.EditingHelp = new HelpData(area, null, vnum);
                    ch.EditingHelp.lastEditedOn = new Date();
                    ch.EditingHelp.lastEditedBy = ch.Name;
                    ch.EditingHelp.area.saved = false;
                    ch.send("OK.\n\r");
                }
            }
        }
        else if ("edit".prefix(arg1))
        {
            var vnum = Number(args);
            if (vnum)
            {
                ch.EditingHelp = HelpData.Helps.FirstOrDefault(h => h.VNum == vnum);
                if (ch.EditingHelp)
                    ch.send("Editing help {0} - {1}.\n\r", ch.EditingHelp.vnum, ch.EditingHelp.keyword);
                else
                    ch.send("Help {0} not found.\n\r", vnum);
            }
            else
            {
                ch.EditingHelp = HelpData.Helps.FirstOrDefault(h => h.Keyword.IsName(args));
    
                if (ch.EditingHelp)
                    ch.send("Editing help {0} - {1}.\n\r", ch.EditingHelp.vnum, ch.EditingHelp.keyword);
                else
                    ch.send("Help {0} not found.\n\r", vnum);
            }
        }
        else if ("vnum".prefix(arg1))
        {
            var vnum = Number(args);
            if (!ch.EditingHelp)
                ch.send("You aren't editing a help entry.\n\r");
            else if (vnum)
            {
                if (HelpData.Helps.Any(h => h.VNum == vnum && h != ch.EditingHelp))
                {
                    ch.send("A help with that vnum already exists.\n\r");
                }
                else
                {
                    ch.EditingHelp.VNum = vnum;
                    ch.send("OK.\n\r");
                }
            }
            else
                ch.send("Enter a numeric vnum.\n\r");
        }
        else if ("level".prefix(arg1))
        {
            var level = Number(args);
            if (ch.EditingHelp == null)
                ch.send("You aren't editing a help entry.\n\r");
            else if (level)
            {
                ch.EditingHelp.Level = level;
                ch.EditingHelp.Area.saved = false;
                ch.send("OK.\n\r");
            }
            else
                ch.send("Enter a numeric level.\n\r");
        }
        else if ("keywords".prefix(arg1))
        {
            if (ch.EditingHelp == null)
                ch.send("You aren't editing a help entry.\n\r");
            else if (args.ISEMPTY())
                ch.send("Set keywords to what?\n\r");
            else if (HelpData.Helps.Any(h => h.Keyword.IsName(args) && h != ch.EditingHelp))
            {
                ch.send("A help with that keyword already exists.\n\r");
            }
            else
            {
                ch.EditingHelp.Keyword = args;
                ch.EditingHelp.Area.saved = false;
                ch.send("OK.\n\r");
            }
        }
        else if ("text".prefix(arg1))
        {
            var [mod] = args.OneArgument();
            if (ch.EditingHelp == null)
                ch.send("You aren't editing a help entry.\n\r");
            else if (mod == "-")
            {
                [mod, args] = args.OneArgument();
                if(ch.EditingHelp.Text.endsWith("\n")) {
                    ch.EditingHelp.Text = ch.EditingHelp.Text.replace(/.*?\n$/, "");
                } else {
                    ch.EditingHelp.Text = "";
                }
                
                ch.EditingHelp.area.saved = false;
                ch.send("OK.\n\r");
            }
            else if (mod == "+")
            {
                [mod, args] = args.OneArgument();
                ch.EditingHelp.Text += (!Utility.IsNullOrEmpty(ch.EditingHelp.Text) && !ch.EditingHelp.Text.endsWith("\n") ? "\n" : "") + args + "\n";
                ch.EditingHelp.Area.saved = false;
                ch.send("OK.\n\r");
            }
            else
            {
                ch.EditingHelp.Text = args;
                ch.EditingHelp.Area.saved = false;
                ch.send("OK.\n\r");
            }
    
        }
        else if ("done".prefix(arg1))
        {
            ch.EditingHelp = null;
            ch.send("OK.\n\r");
        }
        else
        {
            if (ch.EditingHelp == null)
            {
                ch.send("HEdit [create|list|edit] [vnum|keywords]\n\r");
            }
            else
            {
                ch.send("HEdit [vnum|keywords|level|text]\n\r");
            }
        }
    } // end DoEditHelp

    static DoEditArea(ch, args)
    {
        var vnumString = "";
        [vnumString] = args.OneArgument();
        var vnum = Number(vnumString);
        var area = null;
        if (vnum)
        {
            [vnumString, args] = args.OneArgument();
            if (!(area = AreaData.AllAreas.FirstOrDefault(a => a.VNumStart >= vnum && a.VNumEnd <= vnum)))
            {
                ch.send("area vnum not found.\n\r");
                return;
            }
            else if (!ch.HasBuilderPermission(area))
            {
                ch.send("Builder permissions not found.\n\r");
                return;
            }
            else
                ch.EditingArea = area;
        }
        else if (!vnumString.ISEMPTY() && !(area = AreaData.AllAreas.FirstOrDefault(a=> a.Name.IsName(vnumString))))
        {
            ch.send("Area not found.\n\r");
        }
        else if ("done".prefix(args))
        {
            ch.EditingRoom = null;
            ch.EditingNPCTemplate = null;
            ch.EditingItemTemplate = null;
            ch.EditingArea = null;
            ch.send("OK.\n\r");
            return;
        }

        if (!area)
        {
            area = ch.EditingArea || ch.Room.Area;
        }
        ch.EditingArea = area;
        if (!ch.HasBuilderPermission(area))
        {
            ch.send("Builder permissions not set.\n\r");
            return;
        }
        var commandStr = "";
        [commandStr, args] = args.OneArgument();
        for (var command of OLC.EditAreaCommands)
        {
            if (command.name.prefix(commandStr) && command.action)
            {
                command.action(ch, args);
                return;
            }
        }
        ch.send("Invalid command.\n\r");
    }
}

module.exports = OLC;