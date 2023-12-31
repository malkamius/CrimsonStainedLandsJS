const AffectData = require("./AffectData");
const AreaData = require("./AreaData");
const Character = require("./Character");
const GuildData = require("./GuildData");
const ItemData = require("./ItemData");
const ItemTemplateData = require("./ItemTemplateData");
const NPCTemplateData = require("./NPCTemplateData");
const RaceData = require("./RaceData");
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
            
            AreaData.AllAreas[area.Name] = area;
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

	static DoEditAreaName(ch, args)
	{
		if (ch.EditingArea == null)
		{
			ch.send("Edit area not found\n\r");
			return;
		}
		else if (!ch.HasBuilderPermission(ch.EditingArea))
		{
			ch.send("You don't have permission to edit that area.\n\r");
		}
		else
		{
			delete AreaData.AllAreas[ch.EditingArea.Name];
			ch.EditingArea.Name = args;
			AreaData.AllAreas[ch.EditingArea.Name] = ch.EditingArea;
			ch.EditingArea.saved = false;
			ch.send("Done.\n\r");
		}
	}
	
	static DoEditAreaCredits(ch, args)
	{
		if (ch.EditingArea == null)
		{
			ch.send("Edit area not found\n\r");
			return;
		}
		else if (!ch.HasBuilderPermission(ch.EditingArea))
		{
			ch.send("You don't have permission to edit that area.\n\r");
		}
		else
		{
			ch.EditingArea.Credits = args;

			ch.EditingArea.saved = false;
			ch.send("Done.\n\r");
		}
	}

	static DoEditAreaOverRoomVnum(ch, args)
	{
		var VNum = Number(args);
		if (ch.EditingArea == null)
		{
			ch.send("Edit area not found\n\r");
			return;
		}
		else if (!ch.HasBuilderPermission(ch.EditingArea))
		{
			ch.send("You don't have permission to edit that area.\n\r");
		}
		else if (isNaN(VNum))
		{
			ch.send("Room with specified vnum not found.\n\r");
		}
		else
		{
			ch.EditingArea.OverRoomVNum = VNum;

			ch.EditingArea.saved = false;
			ch.send("Done.\n\r");
		}
	}

    static DoEditNPCLevel(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }
        var number = Number(args);
        if (!number || !(ch.EditingNPCTemplate.Level = number))
        {
            ch.send("Syntax: edit npc [vnum] level [1-60]\n\r");
            return;
        }

        ch.EditingNPCTemplate.Area.saved = false;
    }

    static DoEditNPCDamageRoll(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }
        var number = Number(args);
        if (!number || !(ch.EditingNPCTemplate.DamageRoll = number))
        {
            ch.send("Syntax: edit npc [vnum] damageroll [number]\n\r");
            return;
        }

        ch.EditingNPCTemplate.Area.saved = false;
    }

    static DoEditNPCHitRoll(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }
        var number = Number(args);
        if (!number || !(ch.EditingNPCTemplate.HitRoll = number))
        {
            ch.send("Syntax: edit npc [vnum] hitroll [number]\n\r");
            return;
        }

        ch.EditingNPCTemplate.Area.saved = false;
    }

    static DoEditNPCProtects(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        var protects = [];
        var protectstring = args;
        while(!Utility.IsNullOrEmpty(args)) {
            [protectsstring, args] = args.OneArgument();
            var protects = Number(protectsstring);
            if(!protects) {
                ch.send("Syntax: edit npc [vnum] protects {vnum vnum vnum...}\n\r");
                return;
            }
            protects.push(vnum);
        }
        
        ch.EditingNPCTemplate.Protects = Utility.CloneArray(protects);

        ch.EditingNPCTemplate.Area.saved = false;
    }

    static DoEditNPCGold(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }
        var number = Number(args);
        if (!number || !(ch.EditingNPCTemplate.Gold = number))
        {
            ch.send("Syntax: edit npc [vnum] gold [number]\n\r");
            return;
        }

        ch.EditingNPCTemplate.Area.saved = false;
    }

    static DoEditNPCGuild(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }
        var guild = null;
        if (!(guild = GuildData.Lookup(args)) && !"none".prefix(args))
        {
            ch.send("Syntax: edit npc [vnum] guild {guild name}\n\r");
            ch.send("Valid guilds are {0}.\n\r", Utility.JoinArray(GuildData.Guilds, g => g.Name, ", "));
            return;
        }

        ch.EditingNPCTemplate.Guild = guild;
        ch.send("OK.\n\r");
        ch.EditingNPCTemplate.Area.saved = false;
    }

    static DoEditNPCRace(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }
        var race = null;
        if (!(race = RaceData.LookupRace(args)))
        {
            ch.send("Syntax: edit npc [vnum] race {race name}\n\r");
            ch.send("Valid races are {0}.\n\r", Utility.JoinArray(RaceData.Races, r => r.Name, ", "));
            return;
        }

        ch.EditingNPCTemplate.Race = race;
        ch.send("OK.\n\r");
        ch.EditingNPCTemplate.Area.saved = false;
    }

    static DoEditNPCGender(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }
        var sex;
        if (Utility.IsNullOrEmpty(sex = Utility.GetEnumValueStrPrefix(Character.Sexes, args)))
        {
            ch.send("Syntax: edit npc [vnum] gender {sex}\n\r");
            ch.send("Valid sexes are {0}.\n\r", Utility.JoinFlags(Character.Sexes));
            return;
        }

        ch.EditingNPCTemplate.Sex = sex;
        ch.send("OK.\n\r");
        ch.EditingNPCTemplate.Area.saved = false;
    }

    static DoEditNPCAlignment(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }
        var alignment;
        if (Utility.IsNullOrEmpty(alignment = Utility.GetEnumValueStrPrefix(Character.Alignment, args)))
        {
            ch.send("Syntax: edit npc [vnum] alignment {alignment}\n\r");
            ch.send("Valid alignments are {0}.\n\r", Utility.JoinFlags(Character.Alignment));
            return;
        }

        ch.EditingNPCTemplate.Alignment = alignment;
        ch.send("OK.\n\r");
        ch.EditingNPCTemplate.Area.saved = false;
    }

    static DoEditNPCFlags(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        if (!Utility.GetEnumValues(Character.ActFlags, args, ch.EditingNPCTemplate.Flags, true))
        {
            ch.send("Valid flags are {0}.\n\r", Utility.JoinFlags(Character.ActFlags, ", "));
        }

        ch.EditingNPCTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditNPCImmuneFlags(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        if (!Utility.GetEnumValues(DamageMessage.WeaponDamageTypes, args, ch.EditingNPCTemplate.ImmuneFlags, true))
        {
            ch.send("Valid flags are {0}.\n\r", Utility.JoinFlags(DamageMessage.WeaponDamageTypes, ", "));
        }

        ch.EditingNPCTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditNPCResistFlags(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        if (!Utility.GetEnumValues(DamageMessage.WeaponDamageTypes, args, ch.EditingNPCTemplate.ResistFlags, true))
        {
            ch.send("Valid flags are {0}.\n\r", Utility.JoinFlags(DamageMessage.WeaponDamageTypes, ", "));
        }

        ch.EditingNPCTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditNPCVulnerableFlags(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        if (!Utility.GetEnumValues(DamageMessage.WeaponDamageTypes, args, ch.EditingNPCTemplate.VulnerableFlags, true))
        {
            ch.send("Valid flags are {0}.\n\r", Utility.JoinFlags(DamageMessage.WeaponDamageTypes, ", "));
        }

        ch.EditingNPCTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditNPCAffectedBy(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        if (!Utility.GetEnumValues(AffectData.AffectFlags, args, ch.EditingNPCTemplate.AffectedBy, true))
        {
            ch.send("Valid flags are {0}.\n\r", Utility.JoinFlags(AffectData.AffectFlags));
        }

        ch.EditingNPCTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditNPCName(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        ch.EditingNPCTemplate.Name = args;

        ch.EditingNPCTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditNPCLongDescription(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        ch.EditingNPCTemplate.LongDescription = args;

        ch.EditingNPCTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditNPCShortDescription(ch, args)
    {
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        ch.EditingNPCTemplate.ShortDescription = args;

        ch.EditingNPCTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditNPCDescription(ch, args)
    {
        var plusminus = "";
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }
        var [plusminus, newargs] = args.OneArgument();

        if (plusminus == "-")
        {
            if(ch.EditingNPCTemplate.Description.endsWith("\n")) {
                ch.EditingNPCTemplate.Description = ch.EditingNPCTemplate.Description.replace(/.*?\n$/, "");
            } else {
                ch.EditingNPCTemplate.Description = "";
            }
        }
        else if (plusminus == "+")
        {
            ch.EditingNPCTemplate.Description += (!Utility.IsNullOrEmpty(ch.EditingNPCTemplate.Description) && !ch.EditingNPCTemplate.Description.endsWith("\n") ? "\n" : "") + newargs + "\n";
        }
        else
        {
            ch.EditingNPCTemplate.Description = args + "\n";
        }
        ch.EditingNPCTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditNPCDamageDice(ch, args)
    {
        var [damagedicesidesstring, args] = args.OneArgument();
        var [damagedicecountstring, args] = args.OneArgument();
        var [damagedicebonusstring, args] = args.OneArgument();
        
        var sides = Number(damagedicesidesstring);
        var count = Number(damagedicecountstring);
        var bonus = Number(damagedicebonusstring);
        
        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        if (isNaN(sides) || isNaN(count) || isNaN(bonus))
        {
            ch.send("Syntax: edit npc [vnum] damagedice [dicesides] [dicecount] [dicebonus]\n\r");
            return;
        }
        else {
            ch.EditingNPCTemplate.DamageDice = [sides, count, bonus];
            ch.send("OK.\n\r");
        }
        ch.EditingNPCTemplate.Area.saved = false;
    }

    static DoEditNPCHitPointDice(ch, args)
    {
        var [damagedicesidesstring, args] = args.OneArgument();
        var [damagedicecountstring, args] = args.OneArgument();
        var [damagedicebonusstring, args] = args.OneArgument();
        
        var sides = Number(damagedicesidesstring);
        var count = Number(damagedicecountstring);
        var bonus = Number(damagedicebonusstring);

        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        if (isNaN(sides) || isNaN(count) || isNaN(bonus))
        {
            ch.send("Syntax: edit npc [vnum] hitpointdice [dicesides] [dicecount] [dicebonus]\n\r");
            return;
        }
        else {
            ch.EditingNPCTemplate.HitPointDice = [sides, count, bonus];
            ch.send("OK.\n\r");
        }

        ch.EditingNPCTemplate.Area.saved = false;
    }

    static DoEditNPCManaPointDice(ch, args)
    {
        var [damagedicesidesstring, args] = args.OneArgument();
        var [damagedicecountstring, args] = args.OneArgument();
        var [damagedicebonusstring, args] = args.OneArgument();
        
        var sides = Number(damagedicesidesstring);
        var count = Number(damagedicecountstring);
        var bonus = Number(damagedicebonusstring);

        if (ch.EditingNPCTemplate == null)
        {
            ch.send("Edit item not found\n\r");
            return;
        }

        if (isNaN(sides) || isNaN(count) || isNaN(bonus))
        {
            ch.send("Syntax: edit npc [vnum] manapointdice [dicesides] [dicecount] [dicebonus]\n\r");
            return;
        }
        else {
            ch.EditingNPCTemplate.ManaPointDice = [sides, count, bonus];
            ch.send("OK.\n\r");
        }

        ch.EditingNPCTemplate.Area.saved = false;
    }

    static DoEditRoomDescription(ch, args)
    {
	    var plusminus = "";
        if (!ch.EditingRoom)
        {
            ch.send("Edit room not found");
            return;
        }
        [plusminus, newargs] = args.OneArgument();

        if (plusminus == "-")
        {
            if(ch.EditingRoom.Description.endsWith("\n")) {
                ch.EditingRoom.Description = ch.EditingRoom.Description.replace(/.*?\n$/, "");
            } else {
                ch.EditingRoom.Description = "";
            }
        }
        else if (plusminus == "+")
        {
            ch.EditingRoom.Description += (!Utility.IsNullOrEmpty(ch.EditingRoom.Description) && !ch.EditingRoom.Description.endsWith("\n") ? "\n" : "") + newargs + "\n";
            ch.send("OK.\n\r");
        }
        else if ("extradescriptions".prefix(plusminus))
        {
            if ("clear".prefix(newargs))
            {
                ch.EditingRoom.ExtraDescriptions = [];
                ch.send("OK.\n\r");
            }
        }
        else
        {
            ch.EditingRoom.Description = args + "\n";
            ch.send("OK.\n\r");
        }
        ch.EditingRoom.Area.saved = false;

    }

    static DoEditRoomName(ch, args)
    {
        if (!ch.EditingRoom)
        {
            ch.send("Edit room not found\n\r");
            return;
        }

        ch.EditingRoom.Name = args;

        ch.EditingRoom.Area.saved = false;
        ch.send("Done.\n\r");
    }

    static DoEditRoomSector(ch, args)
    {
        var sector;
        if (!ch.EditingRoom)
        {
            ch.send("Edit room not found\n\r");
            return;
        }
        else if (!ch.HasBuilderPermission(ch.EditingRoom))
        {
            ch.send("You don't have permission to edit that room.\n\r");
        }
        else if ((sector = Utility.GetEnumValueStrPrefix(RoomData.SectorTypes, args)) && (ch.EditingRoom.Sector = sector))
        {
            ch.send("Sector changed to " + ch.EditingRoom.Sector + "\n\r");
            ch.EditingRoom.Area.saved = false;
        }
        else
            ch.send("Valid Sector Types are " + Utility.JoinFlags(RoomData.SectorTypes) + "\n\r");

    }

    static DoEditRoomFlags(ch, args)
    {
        if (!ch.EditingRoom)
        {
            ch.send("Edit room not found\n\r");
            return;
        }
        else if (!ch.HasBuilderPermission(ch.EditingRoom))
        {
            ch.send("You don't have permission to edit that room.\n\r");
        }

        else if (Utility.GetEnumValues(RoomData.RoomFlags, args, ch.EditingRoom.Flags, true))
        {
            ch.send("Room Flags changed to " + Utility.JoinFlags(ch.EditingRoom.Flags) + "\n\r");
            ch.EditingRoom.Area.saved = false;
        }
        else
            ch.send("Valid Flags are " + Utility.JoinFlags(RoomData.RoomFlags, ", ") + "\n\r");

    }

    static DoEditRoomExits(ch, args)
    {
        var [directionArg, args] = args.OneArgument();
        var [command, args] = args.OneArgument();
        var vnum = Number(args);
        
        if (Utility.IsNullOrEmpty(directionArg))
        {
            ch.send("What direction do you want to edit?\n\r");
            return;
        }
        var direction;
        if ((direction = RoomData.Directions.findIndex(d => d.prefix(directionArg))) == -1)
        {
            ch.send("Invalid direction.\n\r");
            return;
        }

        var exit = ch.EditingRoom.Exits[direction]? ch.EditingRoom.Exits[direction] : (ch.EditingRoom.Exits[direction] = new ExitData());
        if(!exit.Source) exit.Source = ch.EditingRoom;
        if(!exit.Direction) exit.Direction = RoomData.Directions[direction];
        
        if ("delete".prefix(command))
        {
            if (exit != null) ch.EditingRoom.Exits[direction] = null;
            
            ch.EditingRoom.Area.saved = false;
            ch.send("Exit removed on this side\n\r");
            return;
        }
        else if ("destination".prefix(command) && vnum)
        {
            var room;
            if (room = RoomData.Rooms[vnum])
            {
                exit.Destination = room;
                exit.DestinationVNum = room.VNum;

                ch.EditingRoom.Area.saved = false;
                ch.send("OK.\n\r");
                return;
            }
            else
            {
                ch.send("Destination vnum does not exist.");
                return;
            }

        }
        else if ("flags".prefix(command))
        {
            var flags = {};
            Utility.GetEnumValues(ExitData.ExitFlags, args, flags);

            exit.OriginalFlags = flags;
            exit.Flags = Utility.CloneArray(flags);
            
            ch.EditingRoom.Area.saved = false;
            ch.send("OK.\n\r");
            ch.send("Valid flags are {0}\n", Utility.JoinFlags(ExitData.ExitFlags));
            return;
        }
        else if ("keywords".prefix(command))
        {
            exit.Keywords = args;
            
            ch.EditingRoom.Area.saved = false;
            ch.send("OK.\n\r");
            return;
        }
        else if ("display".prefix(command))
        {
            exit.Display = args;
            
            ch.EditingRoom.Area.saved = false;
            ch.send("OK.\n\r");
            return;
        }
        else if ("description".prefix(command))
        {
            exit.Description = args;
            
            ch.EditingRoom.Area.saved = false;
            ch.send("OK.\n\r");
            return;
        }
        else if ("size".prefix(command))
        {
            var size;
            if (!(size = Utility.GetEnumValue(Character.Sizes, args)))
            {
                ch.send("Valid sizes are {0}.\n\r", Utility.JoinArray(Character.Sizes, ", "));
                return;
            }
            else
            {
                exit.ExitSize = size;
                ch.EditingRoom.Area.saved = false;
                ch.send("OK.\n\r");
                return;
            }
        }
        else if ("keys".prefix(command))
        {
            if (args.ISEMPTY())
            {
                exit.Keys = [];
                
                ch.EditingRoom.Area.saved = false;
                ch.send("OK.\n\r");
                return;
            }
            else
            {
                var keys = args.split(' ');
                var newkeys = [];
                var valid = true;
                for (var key of keys)
                {
                    var keyvnum = Number(key)
                    if(!keyvnum)
                        valid = false;
                    else
                        newkeys.push(keyvnum)
                }
                if (valid)
                {
                    exit.Keys = newkeys;
                    
                    ch.EditingRoom.Area.saved = false;
                    ch.send("OK.\n\r");
                    return;
                }
                else
                {
                    ch.send("Keys must be vnums separated by spaces\n\r");
                    return;
                }

            }
        }

        ch.send("Edit room exits {direction} [keywords, description, destination, flags, size, keys, delete] {arguments}\n\r");
    }

    static DoEditRoomResets(ch, args)
    {
        var [command, args] = args.OneArgumentOut();
        var room = ch.EditingRoom;

        if (room == null)
        {
            ch.send("You aren't editing a room.\n\r");
            return;
        }
        else if (!ch.HasBuilderPermission(room))
        {
            ch.send("Builder permissions not set.\n\r");
            return;
        }
        else if ("list".prefix(command))
        {
            var resets = room.GetResets();
            ch.send("Resets for room {0} - {1}\n\r", room.VNum, room.Name);
            for (var i = 0; i < resets.length; i++)
            {
                var reset = resets[i];
                var SpawnName = "";
                if ((reset.resetType == ResetTypes.Equip || reset.resetType == ResetTypes.Give || reset.resetType == ResetTypes.Put || reset.resetType == ResetTypes.Item)
                    && (itemTemplate = ItemTemplateData.Templates[reset.spawnVnum]))
                {
                    SpawnName = itemtemplate.Name;
                }
                else if (reset.resetType == ResetTypes.NPC && (npcTemplate = NPCTemplateData.Templates[reset.spawnVnum]))
                    SpawnName = npctemplate.Name;

                if (SpawnName.ISEMPTY())
                    SpawnName = "unknown name";

                ch.send("[{0,5:D5}]    {1}Type {2}, SpawnVnum {3} - {4}, MaxRoomCount {5}, MaxCount {6}\n\r",
                    i + 1,
                    reset.Type == "Equip" || reset.Type == "Give" || reset.Type == "Put" ? "    " : "",
                    reset.Type, reset.VNum, SpawnName, reset.Count, reset.Max);
            }
            ch.send("\n\r{0} resets.\n\r", resets.Count);
        }
        else if ("delete".prefix(command))
        {
            var resets = room.GetResets();
            var index = Number(args);
            if (!isNaN(index) && index >= 1 && index <= resets.length)
            {
                var reset = resets[index - 1];
                room.Area.Resets.Remove(reset);
                room.Area.saved = false;
                ch.send("Reset removed.\n\r");
            }
            else
                ch.send("You must supply a valid index.\n\r");
        }
        else if ("move".prefix(command))
        {
            var resets = room.GetResets();

            var [argStartIndex, args] = args.OneArgument();
            var [argEndIndex, args] = args.OneArgument();
            var index = Number(argStartIndex);
            var endIndex = Number(argEndIndex);
            if (!isNaN(index) && index >= 1 && index <= resets.length && !isNaN(endIndex) && endIndex >= 1 && endIndex <= resets.length)
            {
                // var reset = resets[index - 1];
                // var destinationReset = resets[endIndex - 1];
                // room.Area.Resets[index - 1] = destinationReset;
                // room.Area.Resets[endIndex - 1] = reset;
                [room.Area.Resets[index - 1], room.Area.Resets[endIndex - 1]] = [room.Area.Resets[endIndex - 1], room.Area.Resets[index - 1]];
                room.Area.saved = false;
                ch.send("Reset moved.\n\r");
            }
            else
                ch.send("You must supply a valid start and end index.\n\r");
        }
        else if ("create".prefix(command) || "new".prefix(command))
        {
            var resets = room.GetResets();
            [arg1, args] = arguments.OneArgument();
            [arg2, args] = arguments.OneArgument();
            [arg3, args] = arguments.OneArgument();
            [arg4, args] = arguments.OneArgument();

            var spawnvnum = 0, maxroomcount = 0, maxcount = 0;
            var index = Number(arg1);
            if (isNaN(index))
            {
                index = resets.length;
            }
            else
            {
                arg1 = arg2;
                arg2 = arg3;
                arg3 = arg4;
                arg4 = args;
            }
            index = index - 1;
            if (index <= 0 && resets.length > 0)
            {
                index = room.Area.Resets.indexOf(resets[resets.length - 1]) + 1;
            }
            else if (index < 0 || resets.length == 0)
            {
                index = room.Area.Resets.length;
            }
            else if (index == resets.length)
            {
                index = room.Area.Resets.indexOf(resets[index - 1]) + 1;
            }
            else if (index >= resets.length)
            {
                ch.send("Index must be less than or equal to the count of resets in the room.\n\r");
                return;
            }
            else
                index = room.Area.Resets.indexOf(resets[index]);
            
            if (index < 0) index = 0;
            
            var type = Utility.GetEnumValueStrPrefix(ResetData.ResetTypes, arg1, "");
            spawnvnum = Number(arg2);
            maxroomcount = Number(arg3);
            maxcount = Number(arg4);
            if (arg1.ISEMPTY() || Utility.IsNullOrEmpty(type))
            {
                ch.send("You must supply a valid reset type.\n\r");
                ch.send("Valid reset types are {0}.\n\r", Utility.JoinFlags(ResetData.ResetTypes, ", "));
                ch.send("redit reset create [{0}] @spawnvnum @roomcount @maxcount\n\r", Utility.JoinFlags(ResetData.ResetTypes, "|"));
                return;
            }
            else if (arg2.ISEMPTY() || isNaN(spawnvnum))
            {
                ch.send("You must supply a valid spawn vnum.\n\r");
                return;
            }

            if (!arg3.ISEMPTY() && isNaN(arg3))
            {
                ch.send("Max room count must be numeric if supplied.\n\r");
                return;
            }

            if (!arg4.ISEMPTY() && isNaN(arg4))
            {
                ch.send("Max count must be numeric if supplied.\n\r");
                return;
            }

            if (maxroomcount == 0)
            {
                maxroomcount = Utility.Count(resets, r => r.Type == type && r.VNum == spawnvnum) + 1;
            }

            if (maxcount == 0)
            {
                maxcount = Utility.Count(room.Area.Resets, r => r.Type == type && r.VNum == spawnvnum);
            }

            var reset = new ResetData();
            reset.Count = maxroomcount;
            reset.Max  = maxcount;
            reset.Type = type;
            reset.Destination = room.VNum;
            reset.VNum = spawnvnum;
            area = room.Area
            if(index == 0) {
                room.Area.Resets.unshift(reset);
            } else if(index == room.Area.Resets.length) {
                room.Area.Resets.push(reset);
            } else {
                room.Area.Resets.splice(index, 0, reset);
            }
            //[room.Area.Resets[room.Area.Resets.length - 1], room.Area.Resets[index]] = [room.Area.Resets[index], room.Area.Resets[room.Area.Resets.length - 1]];
            // var resetatindex = room.Area.Resets[index];
            // room.Area.Resets[index] = reset;
            // room.Area.Resets[room.Area.Resets.length - 1] = resetatindex;
            room.Area.saved = false;
        }
        else
            ch.send("redit resets [list|delete @index|move @index @newindex|create {@index} @type]");
    }

    static DoEditItemLevel(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found\n\r");
            return;
        }
        var number = Number(args);
        if (isNaN(number) || !(ch.EditingItemTemplate.Level = number))
        {
            ch.send("Syntax: edit item [vnum] level [1-60]\n\r");
            return;
        }
        else
            ch.send("OK.\n\r");

        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemWeight(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found\n\r");
            return;
        }
        var number = Number(args);
        if (isNaN(number) || !(ch.EditingItemTemplate.Weight = number))
        {
            ch.send("Syntax: edit item [vnum] weight [number]\n\r");
            return;
        }
        else
            ch.send("OK.\n\r");

        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemMaxWeight(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found\n\r");
            return;
        }
        var number = Number(args);
        if (isNaN(number) || !(ch.EditingItemTemplate.MaxWeight = number))
        {
            ch.send("Syntax: edit item [vnum] maxweight [number]\n\r");
            return;
        }
        else
            ch.send("OK.\n\r");

        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemValue(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found\n\r");
            return;
        }
        var number = Number(args);
        if (isNaN(number) || !(ch.EditingItemTemplate.Value = number))
        {
            ch.send("Syntax: edit item [vnum] value [number]\n\r");
            return;
        }
        else
            ch.send("OK.\n\r");

        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemExtraFlags(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found\n\r");
            return;
        }

        ch.EditingItemTemplate.ExtraFlags = {};

        if (!Utility.GetEnumValues(ItemData.ExtaFlags, args, ch.EditingItemTemplate.ExtraFlags, true))
        {
            ch.send("Valid extra flags are {0}.\n\r", Utility.JoinFlags(ItemData.ExtraFlags, ", "));
        }
        else
            ch.send("OK.\n\r");

        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemWearFlags(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found\n\r");
            return;
        }
        ch.EditingItemTemplate.WearFlags = {};
        if (!Utility.GetEnumValues(ItemData.WearFlags, args, ch.EditingItemTemplate.WearFlags, true))
        {
            ch.send("Valid wear flags are {0}.\n\r", Utility.JoinFlags(ItemData.WearFlags, ", "));
        }
        else
            ch.send("OK.\n\r");
        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemWeaponType(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found\n\r");
            return;
        }

        ch.EditingItemTemplate.WeaponType = ItemData.WeaponTypes.None;
        var flag = Utility.GetEnumValue(ItemData.WeaponTypes, args);
        if (Utility.IsNullOrEmpty(flag) || !(ch.EditingItemTemplate.WeaponType = flag))
        {
            ch.send("Valid weapon types are {0}.\n\r", Utility.JoinFlags(ItemData.WeaponTypes, ", "));
        }
        else
            ch.send("OK.\n\r");

        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemItemTypes(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found\n\r");
            return;
        }
        var flag = Utility.GetEnumValue(ItemData.ItemTypes, args);
        if (Utility.IsNullOrEmpty(flag) || !(ch.EditingItemTemplate.ItemTypes.SETBIT(flag)))
        {
            ch.send("Valid item types are {0}.\n\r", Utility.JoinFlags(ItemData.ItemTypes, ", "));
        }

        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemDamageMessage(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found\n\r");
            return;
        }

        for (var key in DamageMessage.DamageMessages)
        {
            var message = DamageMessage.DamageMessages[key]
            if (message.Keyword.prefix(args))
            {
                ch.EditingItemTemplate.WeaponDamageType = message.Keyword;
                ch.EditingItemTemplate.Area.saved = false;
                return;
            }
        }

        ch.send("Damage message not found, valid messages are {0}.\n\r", Utility.JoinArray(DamageMessage.DamageMessages.Select(m => m.Keyword), ", "));

    }

    static DoEditItemDamageDice(ch, args)
    {
        var [damagedicesidesstring, args] = args.OneArgument();
        var [damagedicecountstring, args] = args.OneArgument();
        var [damagedicebonusstring, args] = args.OneArgument();

        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found\n\r");
            return;
        }
        var sides = Number(damagedicesidesstring);
        var count = Number(damagedicecountstring);
        var bonus = Number(damagedicebonusstring);

        if (isNaN(sides) || isNaN(count) || isNaN(bonus))
        {
            ch.send("Syntax: edit item [vnum] damagedice [dicesides] [dicecount] [dicebonus]\n\r");
            return;
        }
        ch.EditingItemTemplate.DamageDice = [sides, count, bonus];
        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemMaterial(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found");
            return;
        }

        ch.EditingItemTemplate.Material = args;

        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemLiquid(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found");
            return;
        }

        ch.EditingItemTemplate.Liquid = args;

        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemMaxCharges(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found");
            return;
        }
        var number = Number(args);
        if (!number || !(ch.EditingItemTemplate.MaxCharges = number)) ch.send("MaxCharges must be numerical.\n\r");

        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemMaxDurability(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found");
            return;
        }
        var number = Number(args);
        if (!number || !(ch.EditingItemTemplate.MaxCharges = number)) ch.send("MaxDurability must be numerical.\n\r");

        ch.EditingItemTemplate.Area.saved = false;
    }

    static DoEditItemNutrition(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found");
            return;
        }
        var number = Number(args);
        if (!number || !(ch.EditingItemTemplate.Nutrition = number)) ch.send("Nutrition must be numerical.\n\r");

        ch.EditingItemTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditItemArmorClass(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found");
            return;
        }
        
        var [ac_bash, args] = args.OneArgument();
        var [ac_slash, args] = args.OneArgument();
        var [ac_pierce, args] = args.OneArgument();
        var [ac_exotic, args] = args.OneArgument();
        
        var bash = Number(ac_bash);
        var slash = Number(ac_slash);
        var pierce = Number(ac_pierce);
        var exotic = Number(ac_exotic);
        if (isNaN(bash) || isNaN(slash) || isNaN(pierce) || isNaN(exotic)) {
            ch.send("Armor class must be numerical and must supply armorclass [bash slash pierce exotic].\n\r");
        }
        ch.EditingItemTemplate.ArmorBash = bash;
        ch.EditingItemTemplate.ArmorSlash = slash;
        ch.EditingItemTemplate.ArmorPierce = pierce;
        ch.EditingItemTemplate.ArmorExotic = exotic;
        
        ch.EditingItemTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditItemName(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found");
            return;
        }

        ch.EditingItemTemplate.Name = args;

        ch.EditingItemTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditItemLongDescription(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        ch.EditingItemTemplate.LongDescription = args;

        ch.EditingItemTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditItemNightLongDescription(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        ch.EditingItemTemplate.NightLongDescription = args;

        ch.EditingItemTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditItemNightShortDescription(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        ch.EditingItemTemplate.NightShortDescription = args;

        ch.EditingItemTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }


    static DoEditItemShortDescription(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit npc not found\n\r");
            return;
        }

        ch.EditingItemTemplate.ShortDescription = args;

        ch.EditingItemTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditItemDescription(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit npc not found");
            return;
        }
        var [plusminus, newargs] = args.OneArgument();

        if (plusminus == "-")
        {
            if(ch.EditingItemTemplate.Description.endsWith("\n")) {
                ch.EditingItemTemplate.Description = ch.EditingItemTemplate.Description.replace(/.*?\n$/, "");
            } else {
                ch.EditingItemTemplate.Description = "";
            }
        }
        else if (plusminus == "+")
        {
            ch.EditingItemTemplate.Description += (!Utility.IsNullOrEmpty(ch.EditingItemTemplate.Description) && !ch.EditingItemTemplate.Description.endsWith("\n") ? "\n" : "") + newargs + "\n";
        }
        else
        {
            ch.EditingItemTemplate.Description = args + "\n";
        }
        ch.EditingItemTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditItemSpells(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found\n\r");
            return;
        }
        
        ch.EditingItemTemplate.Spells = [];
        while (!args.ISEMPTY())
        {
            var [levelstring, args] = args.OneArgument();
            var [arg, args] = args.OneArgument();
            var level = Number(levelstring);
            var skill;
            if (isNaN(level) || !(skill = SkillSpell.SkillLookup(arg)))
            {
                ch.send("Syntax: edit item [vnum] spells [spell level] [spell name] [spell level] [spell name].\n Skill/spell {0} not found.\n\r", arg);
                return;
            }
            var spell = {Level: level, SpellName: skill.Name};
            ch.EditingItemTemplate.Spells.push(spell);
        }


        ch.EditingItemTemplate.Area.saved = false;
        ch.send("OK.\n\r");
    }

    static DoEditItemAffects(ch, args)
    {
        if (!ch.EditingItemTemplate)
        {
            ch.send("Edit item not found\n\r");
            return;
        }

        var apply = AffectData.ApplyTypes.None;

        var applytypestring = "";
        var applyvaluestring = "";
        var applyvalue = 0;
        [applytypestring, args] = args.OneArgument();
        [applyvaluestring, args] = args.OneArgument();
        if (!applytypestring.ISEMPTY() && applytypestring == "-")
        {
            if (ch.EditingItemTemplate.Affects.length > 0)
            {
                ch.EditingItemTemplate.Affects.splice(ch.EditingItemTemplate.Affects.length - 1, 1);
                ch.send("OK.\n\r");
            }
            else
                ch.send("No more affects on that item.\n\r");
            return;
        }
        applyvalue = Number(applyvaluestring);
        apply = Utility.GetEnumValue(AffectData.ApplyType, applytypestring);
        if (!applytypestring.ISEMPTY() && !applyvaluestring.ISEMPTY() && !isNaN(applyvalue) && !Utility.IsNullOrEmpty(apply))
        {
            for (var aff in Utility.CloneArray(ch.EditingItemTemplate.Affects))
            {
                if (aff.Where == AffectData.AffectWhere.ToObject && aff.Location == apply)
                {
                    if (aff.modifier == 0)
                    {
                        ch.EditingItemTemplate.Affects.Remove(aff);
                    }
                    else
                        aff.Modifier = applyvalue;
                    return;
                }
            }
            var affect = new AffectData();
            affect.Where = AffectData.AffectWhere.ToObject;
            affect.Location = apply;
            affect.Modifier = applyvalue;
            affect.Duration = -1;
            ch.EditingItemTemplate.Affects.push(affect);
            ch.EditingItemTemplate.Area.saved = false;
            ch.send("OK.\n\r");
        }
        else
        {
            ch.send("Edit item [vnum] affects [type] [value]\n\r");
            ch.send("Types: {0}", Utility.JoinFlags(AffectData.ApplyTypes, ", "));
        }

    }

    static DoDig(ch, args)
    {
        var directionArg = "";
        var vnumArg = "";
        [directionArg, args] = arguments.OneArgument();
        var reversedirections = [1,3,0,2,5,4];
        var room;
        [vnumArg, args] = arguments.OneArgument();
        var vnum = Number(vnumArg);
        var area = ch.EditingArea || ch.Room.Area;
        var direction = -1;

        if (Utility.IsNullOrEmpty(directionArg))
        {
            ch.send("What direction do you want to create a new room in?\n\r");
            return;
        }
        else if((direction = RoomData.Directions.findIndex(s => s.prefix(directionArg))) < 0)
        {
            ch.send("Invalid direction.\n\r");
            return;
        }
        else if (!ch.HasBuilderPermission(ch.Room) || !ch.HasBuilderPermission(area))
        {
            ch.send("Builder permissions not set.\n\r");
            return;
        }
        else if ("delete".prefix(vnumArg))
        {
            var exit = ch.Room.Exits[direction];
            if (exit != null) ch.Room.Exits[direction] = null;
            ch.send("Exit removed on this side\n\r");
        }
        else if ((vnumArg.ISEMPTY() || vnum == 0 || isNaN(vnum)) && 
        area != null && 
        isNaN((vnum = (Utility.Max(area.Rooms, r => r.VNum) + 1) || area.VNumStart)))
        {
            ch.send("Invalid vnum.\n\r");
        }
        else if ((room = RoomData.Rooms[vnum]))
        {
            //ch.send("Not yet implemented.\n\r");
            ch.send("Room ({0}) already exists. Attempting to link exits.\n\r", room.VNum)
        }
        else
        {
            room = new RoomData();
            room.VNum = vnum;
            if (vnumArg.equals("copy") || args.equals("copy"))
            {
                room.Name = ch.Room.Name;
                room.Description = ch.Room.Description;
                room.Sector = ch.Room.Sector;
                room.Flags = Utility.CloneArray(ch.Room.Flags);
            }
            room.Area = area;
            AreaData.AllRooms[vnum] = room.Area.Rooms[vnum] = RoomData.Rooms[vnum] = room;

            room.Area.saved = false;
            ch.Room.Area.saved = false;
        }
        
        
        var revDirection = reversedirections[direction];
        var Flags = {};
        Utility.GetEnumValues(ExitData.ExitFlags, args, flags);
        var exit = room.Exits[revDirection] = new ExitData(); 
        exit.Destination = ch.Room;
        exit.DestinationVnum = ch.Room.VNum;
        exit.Direction = RoomData.Directions[revDirection]
        exit.Description = "";
        exit.Flags = Utility.CloneArray(Flags);
        exit.OriginalFlags = Utility.CloneArray(Flags);
        var exit = ch.Room.Exits[direction] = new ExitData();
        exit.Destination = room;
        exit.Direction = RoomData.Directions[direction];
        exit.Description = "";
        exit.Flags = Utility.CloneArray(Flags);
        exit.OriginalFlags = Utility.CloneArray(Flags);
        
        Character.Move(ch, direction);
    }

    static DoEditRoomExtraDescriptions(ch, args)
    {
        [command, args] = args.OneArgumen();
        var room = ch.EditingRoom;

        if (room == null)
        {
            ch.send("You aren't editing a room.\n\r");
            return;
        }
        else if (!ch.HasBuilderPermission(room))
        {
            ch.send("Builder permissions not set.\n\r");
            return;
        }
        else if ("list".StringPrefix(command))
        {
            [strindex] = args.OneArgument();
            var ed = null;
            var index = Number(strindex);
            if (!strindex.ISEMPTY() && (!isNaN(index) || (ed = room.ExtraDescriptions.FirstOrDefault(e => e.Keyword.IsName(strindex))) != null))
            {
                ch.send("Keywords: {0}\n\rDescription: {1}\n\r", ed.Keyword, ed.Description);
            }
            else if (!strindex.ISEMPTY())
            {
                ch.send("ExtraDescription not found or index out of range.\n\r");
            }
            else
            {
                var extradescriptions = room.ExtraDescriptions;
                ch.send("Extra descriptions for item {0} - {1}\n\r", room.VNum, room.Name);
                for (var i = 0; i < extradescriptions.length; i++)
                {
                    ed = extradescriptions[i];

                    ch.send("[{0,5:D5}]    Keywords {1}\n\r",
                        i + 1, ed.Keyword);
                }
                ch.send("\n\r{0} extra descriptions.\n\r", extradescriptions.length);
            }
        }
        else if ("delete".StringPrefix(command))
        {
            var eds = room.ExtraDescriptions;
            var index = Number(args);
            var ed = null;
            if ((!isNaN(index) && index >= 1 && index <= eds.length && (ed = eds[index - 1])) || (ed = room.ExtraDescriptions.FirstOrDefault(e => e.Keyword.IsName(args))))
            {
                room.ExtraDescriptions.Remove(ed);
                room.Area.saved = false;
                ch.send("Extra description removed.\n\r");
            }
            else
                ch.send("You must supply a valid index or keyword.\n\r");
        }
        else if ("move".StringPrefix(command))
        {
            var eds = room.ExtraDescriptions;

            [argStartIndex, args] = arguments.OneArgument();
            var index = Number(argStartIndex);
            var endIndex = Number(args);

            if (!isNaN(index) && index >= 1 && index <= eds.length && !isNaN(endIndex) && endIndex >= 1 && endIndex <= eds.length)
            {
                [room.ExtraDescriptions[index - 1], room.ExtraDescriptions[endIndex - 1]] = [room.ExtraDescriptions[endIndex - 1], room.ExtraDescriptions[index]];

                room.Area.saved = false;
                ch.send("Extra description moved.\n\r");
            }
            else
                ch.send("You must supply a valid start and end index.\n\r");
        }
        else if ("create".StringPrefix(command) || "new".StringPrefix(command))
        {
            var eds = room.ExtraDescriptions;
            [keywords] = args.OneArgumentOut();
            var index = Number(keywords);
            if (isNaN(index))
            {
                index = eds.length;
            }
            else
            {
                [keywords, args] = arguments.OneArgument();
            }
            
            index = index - 1;

            if (index <= 0 && eds.length > 0)
            {
                index = room.ExtraDescriptions.indexOf(eds[eds.Count - 1]) + 1;
            }
            else if (index < 0 || eds.length == 0)
            {
                index = room.ExtraDescriptions.length;
            }
            else if (index == eds.length)
            {
                index = room.ExtraDescriptions.indexOf(eds[index - 1]) + 1;
            }
            else if (index >= eds.length)
            {
                ch.send("Index must be less than or equal to the count of extra descriptions in the room.\n\r");
                return;
            }
            else
                index = room.ExtraDescriptions.indexOf(eds[index]);

            if (index < 0) index = 0;


            if (keywords.ISEMPTY())
            {
                ch.send("You must supply keywords.\n\r");
                return;
            }

            var ed = {Keyword: args, Description: ""}
            if(index == eds.length) {
                eds.push(ed);
            } else if(index == 0) {
                eds.unshift(ed);
            } else {
                eds.splice(index, 0, ed);
            }
            
            ch.send("ExtraDescription added at index {0}.\n\r", index + 1);
            room.Area.saved = false;
        }
        else if ("edit".StringPrefix(command))
        {
            var eds = room.ExtraDescriptions;
            [strindex] = args.OneArgument();
            var index = Number(strindex);
            var modifier = "";
            var ed = null;
            if (isNaN(index) && !(ed = room.ExtraDescriptions.FirstOrDefault(e => e.Keyword.IsName(strindex))))
            {
                index = eds.length;
            }
            else if (!ed)
            {
                [strindex, args] = args.OneArgument();
                [modifier] = args.OneArgument();


                index = index - 1;
                if (index <= 0 && eds.length > 0)
                {
                    index = room.ExtraDescriptions.indexOf(eds[eds.length - 1]) + 1;
                }
                else if (index < 0 || eds.length == 0)
                {
                    index = room.ExtraDescriptions.length;
                }
                else if (index == eds.length)
                {
                    index = room.ExtraDescriptions.indexOf(eds[index - 1]) + 1;
                }
                else if (index >= eds.length)
                {
                    ch.send("Index must be less than or equal to the count of resets in the room.\n\r");
                    return;
                }
                else
                    index = room.ExtraDescriptions.indexOf(eds[index]);
                if (index < 0) index = 0;

                ed = room.ExtraDescriptions[index];
            }
            else
            {
                [strindex, args] = args.OneArgument();
                [modifier] = args.OneArgument();
            }
            if (ed != null)
            {
                if (modifier == "+")
                {
                    [modifier, args] = args.OneArgument();
                    ed.Description += ((ed.Description.Length > 0 && !ed.Description.EndsWith("\n")) ? "\n" : "") + args + "\n";
                }
                else if (modifier == "-")
                {
                    var newlineindex = ed.Description.LastIndexOf("\n");
                    [modifier, args] = args.OneArgument();
                    ed.Description = newlineindex < 1 ? "" : ed.Description.Substring(0, newlineindex);
                }
                else
                    [ed.Description] = args.replaceAll("\r", "") + "\n";
                ch.send("OK.\n\r");
            }
        }
        else
            ch.send("redit extradescriptions [list|delete @index|move @index @newindex|create @keywords|edit @index {+|-} $text]");
    } // end EditRoomExtraDescriptions

    static DoEditItemExtraDescriptions(ch, args)
    {
        [command, args] = args.OneArgumen();
        var item = ch.EditingItem;

        if (item == null)
        {
            ch.send("You aren't editing a item.\n\r");
            return;
        }
        else if (!ch.HasBuilderPermission(item))
        {
            ch.send("Builder permissions not set.\n\r");
            return;
        }
        else if ("list".StringPrefix(command))
        {
            [strindex] = args.OneArgument();
            var ed = null;
            var index = Number(strindex);
            if (!strindex.ISEMPTY() && (!isNaN(index) || (ed = item.ExtraDescriptions.FirstOrDefault(e => e.Keyword.IsName(strindex))) != null))
            {
                ch.send("Keywords: {0}\n\rDescription: {1}\n\r", ed.Keyword, ed.Description);
            }
            else if (!strindex.ISEMPTY())
            {
                ch.send("ExtraDescription not found or index out of range.\n\r");
            }
            else
            {
                var extradescriptions = item.ExtraDescriptions;
                ch.send("Extra descriptions for item {0} - {1}\n\r", item.VNum, item.Name);
                for (var i = 0; i < extradescriptions.length; i++)
                {
                    ed = extradescriptions[i];

                    ch.send("[{0,5:D5}]    Keywords {1}\n\r",
                        i + 1, ed.Keyword);
                }
                ch.send("\n\r{0} extra descriptions.\n\r", extradescriptions.length);
            }
        }
        else if ("delete".StringPrefix(command))
        {
            var eds = item.ExtraDescriptions;
            var index = Number(args);
            var ed = null;
            if ((!isNaN(index) && index >= 1 && index <= eds.length && (ed = eds[index - 1])) || (ed = item.ExtraDescriptions.FirstOrDefault(e => e.Keyword.IsName(args))))
            {
                item.ExtraDescriptions.Remove(ed);
                item.Area.saved = false;
                ch.send("Extra description removed.\n\r");
            }
            else
                ch.send("You must supply a valid index or keyword.\n\r");
        }
        else if ("move".StringPrefix(command))
        {
            var eds = item.ExtraDescriptions;

            [argStartIndex, args] = arguments.OneArgument();
            var index = Number(argStartIndex);
            var endIndex = Number(args);

            if (!isNaN(index) && index >= 1 && index <= eds.length && !isNaN(endIndex) && endIndex >= 1 && endIndex <= eds.length)
            {
                [item.ExtraDescriptions[index - 1], item.ExtraDescriptions[endIndex - 1]] = [item.ExtraDescriptions[endIndex - 1], item.ExtraDescriptions[index]];

                item.Area.saved = false;
                ch.send("Extra description moved.\n\r");
            }
            else
                ch.send("You must supply a valid start and end index.\n\r");
        }
        else if ("create".StringPrefix(command) || "new".StringPrefix(command))
        {
            var eds = item.ExtraDescriptions;
            [keywords] = args.OneArgumentOut();
            var index = Number(keywords);
            if (isNaN(index))
            {
                index = eds.length;
            }
            else
            {
                [keywords, args] = arguments.OneArgument();
            }
            
            index = index - 1;

            if (index <= 0 && eds.length > 0)
            {
                index = item.ExtraDescriptions.indexOf(eds[eds.Count - 1]) + 1;
            }
            else if (index < 0 || eds.length == 0)
            {
                index = item.ExtraDescriptions.length;
            }
            else if (index == eds.length)
            {
                index = item.ExtraDescriptions.indexOf(eds[index - 1]) + 1;
            }
            else if (index >= eds.length)
            {
                ch.send("Index must be less than or equal to the count of extra descriptions in the item.\n\r");
                return;
            }
            else
                index = item.ExtraDescriptions.indexOf(eds[index]);

            if (index < 0) index = 0;


            if (keywords.ISEMPTY())
            {
                ch.send("You must supply keywords.\n\r");
                return;
            }

            var ed = {Keyword: args, Description: ""}
            if(index == eds.length) {
                eds.push(ed);
            } else if(index == 0) {
                eds.unshift(ed);
            } else {
                eds.splice(index, 0, ed);
            }
            
            ch.send("ExtraDescription added at index {0}.\n\r", index + 1);
            item.Area.saved = false;
        }
        else if ("edit".StringPrefix(command))
        {
            var eds = item.ExtraDescriptions;
            [strindex] = args.OneArgument();
            var index = Number(strindex);
            var modifier = "";
            var ed = null;
            if (isNaN(index) && !(ed = item.ExtraDescriptions.FirstOrDefault(e => e.Keyword.IsName(strindex))))
            {
                index = eds.length;
            }
            else if (!ed)
            {
                [strindex, args] = args.OneArgument();
                [modifier] = args.OneArgument();


                index = index - 1;
                if (index <= 0 && eds.length > 0)
                {
                    index = item.ExtraDescriptions.indexOf(eds[eds.length - 1]) + 1;
                }
                else if (index < 0 || eds.length == 0)
                {
                    index = item.ExtraDescriptions.length;
                }
                else if (index == eds.length)
                {
                    index = item.ExtraDescriptions.indexOf(eds[index - 1]) + 1;
                }
                else if (index >= eds.length)
                {
                    ch.send("Index must be less than or equal to the count of resets in the item.\n\r");
                    return;
                }
                else
                    index = item.ExtraDescriptions.indexOf(eds[index]);
                if (index < 0) index = 0;

                ed = item.ExtraDescriptions[index];
            }
            else
            {
                [strindex, args] = args.OneArgument();
                [modifier] = args.OneArgument();
            }
            if (ed != null)
            {
                if (modifier == "+")
                {
                    [modifier, args] = args.OneArgument();
                    ed.Description += ((ed.Description.Length > 0 && !ed.Description.EndsWith("\n")) ? "\n" : "") + args + "\n";
                }
                else if (modifier == "-")
                {
                    var newlineindex = ed.Description.LastIndexOf("\n");
                    [modifier, args] = args.OneArgument();
                    ed.Description = newlineindex < 1 ? "" : ed.Description.Substring(0, newlineindex);
                }
                else
                    [ed.Description] = args.replaceAll("\r", "") + "\n";
                ch.send("OK.\n\r");
            }
        }
        else
            ch.send("oedit extradescriptions [list|delete @index|move @index @newindex|create @keywords|edit @index {+|-} $text]");
    } // end EditItemExtraDescriptions
}

module.exports = OLC;