const PhysicalStats = require("./PhysicalStats");
const Utility = require("./Utility");
const Character = require("./Character");
const ItemData = require("./ItemData");
const Combat = require("./Combat");
const SkillSpell = require("./SkillSpell");
const AffectData = require("./AffectData");
const DamageMessage = require("./DamageMessage");
const RoomData = require("./RoomData");


Character.DoCommands.DoHerbs = function(ch, args)
{
    var af;
    var skill = SkillSpell.SkillLookup("herbs");

    if (ch.GetSkillPercentage(skill) <= 1)
    {
        ch.send("Huh?\n\r");
        return;
    }

    if (ch.IsAffected(skill))
    {
        ch.send("You can't search for more herbs yet.\n\r");
        return;
    }

    if (ch.Room == null || !ch.Room.IsWilderness)
    {
        ch.send("You must be in the wilderness to find herbs.\n\r");
        return;
    }

    var [victim] = ch.GetCharacterHere(args);

    if (args.ISEMPTY())
        victim = ch;
    else if (!victim)
    {
        ch.send("You don't see them here.\n\r");
        return;
    }

    if (Utility.NumberPercent() > ch.GetSkillPercentage(skill))
    {
        ch.send("You fail to find any herbs here.\n\r");
        ch.Act("$n fails to find any herbs.", null, null, null, Character.ActType.ToRoom);
        ch.CheckImprove(skill, false, 3);
        return;
    }

    if (victim == ch)
    {
        ch.Act("$n searches for and finds healing herbs.", null, null, null, Character.ActType.ToRoom);
        ch.send("You search for and find healing herbs.\n\r");
        ch.send("You feel better.\n\r");
    }
    else
    {
        ch.Act("$n searches for and finds healing herbs and applies them to $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n searches for and finds healing herbs and applies them to you.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You search for and find healing herbs and apply them to $N.\n\r", victim);
        victim.send("You feel better.\n\r");
    }
    victim.HitPoints += victim.MaxHitPoints / 4;
    victim.HitPoints = Math.min(victim.HitPoints, victim.MaxHitPoints);

    if (Utility.NumberPercent() < Math.max(1, ch.Level / 4) && victim.IsAffected(AffectData.AffectFlags.Plague))
    {
        victim.AffectFromChar(victim.FindAffect(SkillSpell.SkillLookup("plague")), AffectData.AffectRemoveReason.Cleansed);
        victim.Act("The sores on $n's body vanish.\n\r", null, null, null, Character.ActType.ToRoom);
        victim.send("The sores on your body vanish.\n\r");
    }

    if (Utility.NumberPercent() < Math.max(1, (ch.Level)) && ch.IsAffected(AffectData.AffectFlags.Blind))
    {
        victim.AffectFromChar(ch.FindAffect(SkillSpell.SkillLookup("blindness")), AffectData.AffectRemoveReason.Cleansed);
        victim.send("Your vision returns!\n\r");
    }

    if (Utility.NumberPercent() < Math.max(1, ch.Level / 2) && victim.IsAffected(AffectData.AffectFlags.Poison))
    {
        victim.AffectFromChar(victim.FindAffect(SkillSpell.SkillLookup("poison")), AffectData.AffectRemoveReason.Cleansed);
        victim.send("A warm feeling goes through your body.\n\r");
        victim.Act("$n looks better.", null, null, null, Character.ActType.ToRoom);
    }
    ch.CheckImprove(skill, true, 3);

    af = new AffectData();

    af.Where = AffectData.AffectWhere.ToAffects;
    af.SkillSpell = skill;
    af.Location = 0;
    af.Duration = 2;
    af.Modifier = 0;
    af.Level = ch.Level;
    af.AffectType = AffectTypes.Skill;
    af.DisplayName = "herbs";
    af.EndMessage = "You feel ready to search for herbs once more.";
    ch.AffectToChar(af);
    ch.WaitState(skill.WaitTime);
    return;
}


Character.DoCommands.DoSerpentStrike = function(ch, args)
{

    var dam_each = [
         0,
        5,  6,  7,  8,  9,  11,  14,  16,  21,  26,
        31, 36, 41, 46, 51, 56, 56, 56, 57, 58,
        59, 59, 60, 61, 62, 62, 63, 64, 65, 65,
        66, 67, 68, 68, 69, 70, 71, 71, 72, 73,
        74, 74, 75, 76, 77, 77, 78, 79, 80, 80,
        95, 115, 125, 155, 175, 210, 240, 550, 550, 550
    ];
    var skill = SkillSpell.SkillLookup("serpent strike");
    var chance;
    var dam;
    var level = ch.Level;

    if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    var [victim] = ch.GetCharacterHere(args);

    if (!args.ISEMPTY() && !victim)
    {
        ch.send("You don't see them here.\n\r");
        return;
    }
    else if (args.ISEMPTY() && (victim = ch.Fighting) == null)
    {
        ch.send("You aren't fighting anybody.\n\r");
        return;
    }

    ch.WaitState(skill.WaitTime);

    if (ch.IsNPC)
        level = Math.min(level, 51);
    level = Math.min(level, dam_each.length - 1);
    level = Math.max(0, level);

    if (chance > Utility.NumberPercent())
    {
        ch.Act("$n performs a serpent strike against $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n performs a serpent strike against you.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You perform a serpent strike against $N.", victim, null, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, true, 1);


        dam = Utility.Random(dam_each[level], dam_each[level] * 2);
        Combat.Damage(ch, victim, dam, skill, WeaponDamageTypes.Acid);
    }
    else
    {
        ch.Act("$n attempts to perform a serpent strike against $N, but fails.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n attempts to perform a serpent strike against you, but fails.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You attempt to perform a serpent strike against $N, but fail.", victim, null, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, false, 1);


        dam = 0;
        Combat.Damage(ch, victim, dam, skill, WeaponDamageTypes.Acid);
    }
}

Character.DoCommands.DoCamouflage = function(ch, args)
{
    var fog = SkillSpell.SkillLookup("faerie fog");
    var fire = SkillSpell.SkillLookup("faerie fire");
    var chance;

    if ((chance = ch.GetSkillPercentage("camouflage")) <= 1)
    {
        ch.send("You attempt to hide behind a leaf.\n\r");
        return;
    }

    if (ch.IsAffected(fog) || ch.IsAffected(fire) || ch.IsAffected(AffectData.AffectFlags.FaerieFire))
    {
        ch.send("You can't camouflage while glowing.\n\r");
        return;
    }

    if (!ch.Room.IsWilderness || ch.Room.IsWater)
    {
        ch.send("There's no cover here.\n\r");
        return;
    }

    ch.send("You attempt to blend in with your surroundings.\n\r");


    if (Utility.NumberPercent() < chance)
    {
        if (!ch.IsAffected(AffectData.AffectFlags.Camouflage))
            ch.AffectedBy.SETBIT(AffectData.AffectFlags.Camouflage);
        ch.CheckImprove("camouflage", true, 3);
    }
    else
        ch.CheckImprove("camouflage", false, 3);

    return;
}

Character.DoCommands.DoCreep = function(ch, args)
{
    if (!string.IsNullOrEmpty(args))
    {
        var direction = Direction.North;

        if ((direction = Utility.GetEnumValueStrPrefix(RoomData.Directions, args)))
        {
            if (ch.AffectedBy.ISSET(AffectData.AffectFlags.Camouflage))
                ch.Move(direction, true, false, true);
            else ch.send("You must be camouflaged before attempting to creep.\n\r");
        }
        else
            ch.send("Creep West, east, south, west, up or down?\n\r");
    }
    else
        ch.send("Creep in which direction?\n\r");
}


Character.DoCommands.DoButcher = function(ch, args)
{

    var skill = SkillSpell.SkillLookup("butcher");
    var chance;

    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    var count = 0;
    var [corpse] = ch.GetItemRoom(args);
    if (!corpse)
    {
        ch.send("You don't see that here.\n\r");
        return;
    }
    else if (!corpse.ItemTypes.ISSET(ItemData.ItemTypes.NPCCorpse) && !corpse.ItemTypes.ISSET(ItemData.ItemTypes.PC_Corpse))
    {
        ch.send("That is not a corpse.\n\r");
        return;
    }
    else if (corpse.ItemTypes.ISSET(ItemData.ItemTypes.PC_Corpse) && corpse.Contains.length > 0)
    {
        ch.send("You cannot butcher another players corpse unless it is empty.\n\r");
        return;
    }
    else if (corpse.Size == "Tiny")
    {
        ch.send("That corpse is too tiny to butcher.\n\r");
        return;
    }

    const ItemTemplateData = require('./ItemTemplateData');
    var template;
    if ((template = ItemTemplateData.ItemTemplates[2971]))
    {
        if (chance > Utility.NumberPercent())
        {
            var steakcount = corpse.Size == "Small" ? 1 : corpse.Size == "Medium" ? Utility.Random(1, 3)
                : corpse.Size == "Large" ? Utility.Random(2, 4) : Utility.Random(3, 5);

            for (var i = 0; i < steakcount; i++)
            {
                var steak = new ItemData(template);
                steak.ShortDescription = Utility.Format(steak.ShortDescription, corpse.ShortDescription);
                steak.LongDescription = Utility.Format(steak.LongDescription, corpse.ShortDescription);
                steak.Description = Utility.Format(steak.Description, corpse.ShortDescription);
                ch.Room.Items.unshift(steak);
                steak.Room = ch.Room;
            }
            for (var contained of corpse.Contains)
            {
                ch.Room.Items.unshift(contained);
                contained.Room = ch.Room;
                contained.Container = null;
            }
            
            corpse.Contains = [];
            corpse.Dispose();

            ch.Act("You carefully carve up $p and produce {0} steaks.\n\r", null, corpse, null, Character.ActType.ToChar, steakcount);
            ch.Act("$n carefully carves up $p and produces {0} steaks.\n\r", null, corpse, null, Character.ActType.ToRoom, steakcount);
            ch.CheckImprove(skill, true, 1);
            return;
        }
        else
        {
            for (var contained of corpse.Contains)
            {
                ch.Room.Items.unshift(contained);
                contained.Room = ch.Room;
                contained.Container = null;

            }
            corpse.Contains = [];
            corpse.Dispose();

            ch.Act("You try to carve up $p but you destroy it in the process.\n\r", null, corpse, null, Character.ActType.ToChar);
            ch.Act("$n tries to carve up $p but destroys it in the process.\n\r", null, corpse, null, Character.ActType.ToRoom);
            ch.CheckImprove(skill, false, 1);
            return;
        }
    }
}

Character.DoCommands.DoAmbush = function(ch, args)
{

    var dam_each = [
         0,
        5,  6,  7,  8,  9,  11,  14,  16,  21,  26,
        31, 36, 41, 46, 51, 56, 56, 56, 57, 58,
        59, 59, 60, 61, 62, 62, 63, 64, 65, 65,
        66, 67, 68, 68, 69, 70, 71, 71, 72, 73,
        74, 74, 75, 76, 77, 77, 78, 79, 80, 80,
        95, 115, 125, 155, 175, 210, 240, 550, 550, 550
    ];
    var skill = SkillSpell.SkillLookup("ambush");
    var chance;
    var dam;
    var level = ch.Level;

    if ((chance = ch.GetSkillPercentage(skill) + 20) <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }


    if (ch.Form)
    {
        dam_each = [36, 63, 78, 95];
        level = 3 - ch.Form.Tier;
    }

    var victim = null;

    if (ch.Position == Positions.Fighting)
    {
        ch.send("You're too busy fighting already!\n\r");
        return;
    }

    if (!ch.IsAffected(AffectData.AffectFlags.Camouflage))
    {
        ch.send("You aren't using any cover to set up for an ambush.\n\r");
        return;
    }
    [victim] = ch.GetCharacterHere(args)
    if (!args.ISEMPTY() && !victim)
    {
        ch.send("You don't see them here.\n\r");
        return;
    }

    if (victim == ch)
    {
        ch.send("You can't ambush yourself.\n\r");
        return;
    }
    //chance += (level * 2);


    ch.WaitState(skill.WaitTime);

    if (Combat.CheckPreventSurpriseAttacks(ch, victim))
    {
        return;
    }
    if (chance > Utility.NumberPercent())
    {
        if (ch.IsNPC)
            level = Math.min(level, 51);
        level = Math.min(level, dam_each.length - 1);
        level = Math.max(0, level);

        ch.Act("$n ambushes $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n ambushes you.", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You ambush $N.", victim, null, null, Character.ActType.ToChar);

        dam = Utility.Random(dam_each[level] * 3, dam_each[level] * 4);
        ch.CheckImprove(skill, true, 1);
        Combat.Damage(ch, victim, dam, skill, WeaponDamageTypes.Pierce);
    }
    else
    {
        ch.Act("$n tries to ambush $N.", victim, null, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n tries to ambush you but fails!", victim, null, null, Character.ActType.ToVictim);
        ch.Act("You try to ambush $N but fail.", victim, null, null, Character.ActType.ToChar);

        ch.CheckImprove(skill, false, 1);
        Combat.Damage(ch, victim, 0, skill, WeaponDamageTypes.Pierce);
    }
    return;
}

Character.DoCommands.DoCamp = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("camp");
    var chance = ch.GetSkillPercentage(skill);
    
    if (chance <= 1)
    {
        ch.send("You don't know how to camp.\n\r");
        return;
    }
    if (ch.Fighting != null || ch.Position == Positions.Fighting)
    {
        ch.send("You can't camp while fighting!\n\r");
        return;
    }
    if (!ch.Room.IsWilderness)
    {
        ch.send("You can only camp in the wild.\n\r");
        return;
    }
    if (chance < Utility.NumberPercent())
    {
        ch.send("You tried to set up camp but failed.\n\r");
        ch.CheckImprove(skill, false, 1);
        return;
    }

    ch.send("You prepare a camp and quickly lay down to rest.\n\r");
    ch.Act("$n prepares a camp and quickly lays down to rest.\n\r", null, null, null, Character.ActType.ToRoom);

    for(var groupmember of ch.Room.Characters)
    {
        if (groupmember.IsSameGroup(ch) && (ch.Position == "Standing" || ch.Position == "Resting" || ch.Position == "Sitting"))
        {
            if (ch != groupmember)
            {
                groupmember.Act("$N has prepared a camp, you quickly join $M in resting.\n\r", ch);
                groupmember.Act("$n joins $N at $S camp and quicly lays down to rest.\n\r", null, null, null, Character.ActType.ToRoomNotVictim);
                groupmember.Position = "Sleeping";
            }
            var aff = new AffectData();
            aff.SkillSpell = skill;
            aff.Where = AffectData.AffectWhere.ToAffects;
            aff.Duration = -1;
            aff.DisplayName = "camp";
            aff.EndMessage = "You feel refreshed as you break camp.\n\r";
            groupmember.AffectToChar(aff);
        }
    }
    ch.Position = "Sleeping";
    ch.CheckImprove(skill, true, 1);
}

Character.DoCommands.DoAcuteVision = function(ch, args)
{
    var affect;
    var number = 0;
    if ((number = ch.GetSkillPercentage("acute vision")) <= 1)
    {
        ch.send("Huh?\n\r");
        return;
    }

    if (ch.IsAffected(AffectData.AffectFlags.AcuteVision))
    {
        ch.send("You are already as alert as you can be.\n\r");
        return;
    }
    else
    {
        if (Utility.NumberPercent() > number)
        {
            ch.send("You fail.\n\r");
            ch.CheckImprove("acute vision", false, 2);
            return;
        }
        affect = new AffectData();
        affect.SkillSpell = SkillSpell.SkillLookup("acute vision");
        affect.DisplayName = "acute vision";
        affect.AffectType = AffectTypes.Skill;
        affect.Level = ch.Level;
        affect.Location = AffectData.ApplyTypes.None;
        affect.Where = AffectData.AffectWhere.ToAffects;
        affect.Flags.Add(AffectData.AffectFlags.AcuteVision);
        affect.Duration = 6;
        affect.EndMessage = "You can no longer see the camouflaged.\n\r";
        ch.AffectToChar(affect);

        ch.send("Your awareness improves.\n\r");
        ch.CheckImprove("acute vision", true, 2);
    }
}

Character.DoCommands.DoFindWater = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("findwater");
    var chance;

    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    if (ch.Room.sector == SectorTypes.City)
    {
        ch.send("You cannot poke through the floor to find water.\n\r");
        ch.Act("$n pokes the floor, trying to find water, but nothing happens.\n\r", null, null, null, Character.ActType.ToRoom);
        return;
    }
    var template = ItemTemplateData.ItemTemplates[23];
    if (template)
    {
        if (chance > Utility.NumberPercent())
        {
            var spring = new ItemData(template);
            ch.Room.Items.unshift(spring);
            spring.Room = ch.Room;
            spring.Timer = 7;
            ch.send("You poke around and create a spring of water flowing out of the ground.\n\r");
            ch.Act("$n pokes around and creates a spring of water flowing out of the ground.\n\r", null, null, null, Character.ActType.ToRoom);
            ch.CheckImprove(skill, true, 1);
            return;
        }
        else
        {
            ch.send("You poke the ground a bit, but nothing happens.\n\r");
            ch.Act("$n pokes the ground a bit, but nothing happens.\n\r", null, null, null, Character.ActType.ToRoom);
            ch.CheckImprove(skill, false, 1);
            return;
        }
    }
}


Character.DoCommands.DoFashionStaff = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("fashion staff");
    var chance;
    const ItemTemplateData = require('./ItemTemplateData');
    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    if (ch.Room.sector == SectorTypes.City || ch.Room.sector == SectorTypes.Inside)
    {
        ch.send("You cannot find a suitable tree branch from which to fashion your staff.\n\r");
        return;
    }
    var  ItemTemplate = ItemTemplateData.ItemTemplates[2967];
    if (!ItemTemplate)
    {
        ch.send("You failed.\n\r");
        return;
    }
    ch.WaitState(skill.WaitTime);
    ch.Act("$n fashions a ranger staff from a nearby tree branch.", null, null, null, Character.ActType.ToRoom);
    ch.Act("You fashion a ranger staff from a nearby tree branch.", null, null, null, Character.ActType.ToChar);

    var affmodifiertable = [
        [ 0,   4 ],
        [ 35,  6 ],
        [ 42,  8 ],
        [ 56, 14 ],
        [ 48, 10 ],
        [ 51, 12 ],
    ];
    var staff = new ItemData(ItemTemplate);

    var affect = new AffectData();
    affect.Duration = -1;
    affect.Where = AffectData.AffectWhere.ToObject;
    affect.SkillSpell = skill;
    affect.Location = AffectData.ApplyTypes.DamageRoll;
    affect.Modifier = Utility.FromLevelTable(affmodifiertable, ch.Level);
    staff.Affects.unshift(new AffectData(affect));
    affect.Location = AffectData.ApplyTypes.Hitroll;
    staff.Affects.unshift(new AffectData(affect));
    staff.DamageDice.DiceSides = 6;
    staff.DamageDice.DiceCount = 8;
    staff.DamageDice.DiceBonus = ch.Level / 3;
    staff.Level = ch.Level;

    ch.AddInventoryItem(staff);
    ch.CheckImprove(skill, true, 1);
    return;
}
Character.DoCommands.DoFashionSpear = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("fashion spear");
    var chance;
    const ItemTemplateData = require('./ItemTemplateData');
    if ((chance = ch.GetSkillPercentage(skill)) + 20 <= 21)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    if (ch.Room.sector == SectorTypes.City || ch.Room.sector == SectorTypes.Inside)
    {
        ch.send("You cannot find a suitable tree branch from which to fashion your spear.\n\r");
        return;
    }
    
    var  ItemTemplate = ItemTemplateData.ItemTemplates[2969];
    if (!ItemTemplate)
    {
        ch.send("You failed.\n\r");
        return;
    }
    ch.WaitState(skill.WaitTime);
    ch.Act("$n fashions a ranger spear from a nearby tree branch.", null, null, null, Character.ActType.ToRoom);
    ch.Act("You fashion a ranger spear from a nearby tree branch.", null, null, null, Character.ActType.ToChar);

    var affmodifiertable =
    [
        [ 0,   4 ],
        [ 35,  6 ],
        [ 42,  8 ],
        [ 48, 10 ],
        [ 51, 12 ],
        [ 56, 14 ],

    ];
    var spear = new ItemData(ItemTemplate);

    var affect = new AffectData();
    affect.Duration = -1;
    affect.Where = AffectData.AffectWhere.ToObject;
    affect.SkillSpell = skill;
    affect.Location = AffectData.ApplyTypes.DamageRoll;
    affect.Modifier = Utility.FromLevelTable(affmodifiertable, ch.Level);
    spear.Affects.unshift(new AffectData(affect));
    affect.Location = AffectData.ApplyTypes.Hitroll;
    spear.Affects.unshift(new AffectData(affect));
    spear.DamageDice.DiceSides = 6;
    spear.DamageDice.DiceCount = 8;
    spear.DamageDice.DiceBonus = ch.Level / 3;
    spear.Level = ch.Level;

    ch.AddInventoryItem(spear);
    ch.CheckImprove(skill, true, 1);
    return;
}

Character.DoCommands.DoOwlKinship = function(ch, args)
{
    var skill = SkillSpell.SkillLookup("owl kinship");
    var chance;

    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    if (ch.IsAffected(skill))
    {
        ch.send("You cannot commune with the owls yet.\n\r");
        return;
    }
    if (ch.Pet)
    {
        ch.send("You cannot have more than one wild creature assisting you.\n\r");
        return;
    }

    ch.WaitState(skill.WaitTime);
    var aff = new AffectData();
    aff.SkillSpell = skill;
    aff.Hidden = false;
    aff.DisplayName = skill.name;
    aff.Frequency = Frequency.Tick;
    aff.Duration = 24;
    aff.EndMessage = "You can once again commune with the owls.";
    ch.AffectToChar(aff);

    var KinshipTemplate = NPCTemplateData.NPCTemplates[19041];
    if (KinshipTemplate)
    {
        var Pet = new NPCData(KinshipTemplate, ch.Room);
        Pet.MaxHitPoints = ch.MaxHitPoints / 2;
        Pet.HitPoints = ch.MaxHitPoints / 2;
        Pet.HitRoll = ch.HitRoll;
        Pet.DamageRoll = ch.DamageRoll;
        Pet.ArmorClass = ch.ArmorClass - 100;
        Pet.Level = ch.Level;
        Pet.Following = ch;
        Pet.Leader = ch;

        var damagedicebylevel = [
            [0,  [3,5,10]],
            [25, [4,6,10]],
            [35, [4,8,10]],
            [45, [4,10,10]],
            [51, [4,10,15]],
            [56, [4,11,20]],
        ];
        Pet.DamageDice = Utility.FromLevelTable(damagedicebylevel, ch.Level);

        ch.Act("With a loud howl, $n calls into the wild, attracting $N to $s side.", Pet, null, null, Character.ActType.ToRoom);
        ch.Act("You howl into the wild, attracting $N to your side.", Pet, null, null, Character.ActType.ToChar);

        //foreach (var attacker in ch.Room.Characters.ToArray())
        //{
        //    if (attacker.Fighting == ch)
        //        attacker.Fighting = Pet;
        //}
    }
    return;
}
Character.DoCommands.DoWolfKinship = function(ch, args)
{

    var skill = SkillSpell.SkillLookup("wolf kinship");
    var chance;

    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    if (ch.IsAffected(skill))
    {
        ch.send("You cannot commune with the wolves yet.\n\r");
        return;
    }
    if (ch.Pet)
    {
        ch.send("You cannot have more than one wild creature assisting you.\n\r");
        return;
    }

    ch.WaitState(skill.WaitTime);
    var aff = new AffectData();
    aff.SkillSpell = skill;
    aff.Hidden = false;
    aff.DisplayName = skill.name;
    aff.Frequency = Frequency.Tick;
    aff.Duration = 24;
    aff.EndMessage = "You can once again commune with the wolves.";
    ch.AffectToChar(aff);

    var KinshipTemplate = NPCTemplateData.NPCTemplates[19038];
    if (KinshipTemplate)
    {
        var Pet = new NPCData(KinshipTemplate, ch.Room);
        Pet.Master = ch;
        Pet.MaxHitPoints = ch.MaxHitPoints / 2;
        Pet.HitPoints = ch.MaxHitPoints / 2;
        Pet.HitRoll = ch.HitRoll;
        Pet.DamageRoll = ch.DamageRoll;
        Pet.ArmorClass = ch.ArmorClass - 100;
        Pet.Level = ch.Level;
        Pet.Following = ch;
        Pet.Leader = ch;

        var damagedicebylevel = 
        [
            [ 0, [3,5,10 ]],
            [25, [4,6,10 ]],
            [35, [4,8,10 ]],
            [45, [4,10,10]],
            [51, [4,10,15]],
            [56, [4,11,20]],
        ];
        Pet.DamageDice = Utility.FromLevelTable(damagedicebylevel, ch.Level);

        ch.Act("With a loud howl, $n calls into the wild, attracting $N to $s side.", Pet, null, null, Character.ActType.ToRoom);
        ch.Act("You howl into the wild, attracting $N to your side.", Pet, null, null, Character.ActType.ToChar);

        //foreach (var attacker in ch.Room.Characters.ToArray())
        //{
        //    if (attacker.Fighting == ch)
        //        attacker.Fighting = Pet;
        //}
    }
    return;
}
Character.DoCommands.DoSerpentKinship = function(ch, args)
{

    var skill = SkillSpell.SkillLookup("serpent kinship");
    var chance;

    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    if (ch.IsAffected(skill))
    {
        ch.send("You cannot commune with the serpents yet.\n\r");
        return;
    }
    if (ch.Pet)
    {
        ch.send("You cannot have more than one wild creature assisting you.\n\r");
        return;
    }

    ch.WaitState(skill.WaitTime);
    var aff = new AffectData();
    aff.SkillSpell = skill;
    aff.Hidden = false;
    aff.DisplayName = skill.name;
    aff.Frequency = Frequency.Tick;
    aff.Duration = 24;
    aff.EndMessage = "You can once again commune with the serpents.";
    ch.AffectToChar(aff);

    var KinshipTemplate = NPCTemplateData.NPCTemplates[19039];
    if (KinshipTemplate)
    {
        var Pet = new NPCData(KinshipTemplate, ch.Room);
        Pet.Master = ch;
        Pet.MaxHitPoints = ch.MaxHitPoints / 2;
        Pet.HitPoints = ch.MaxHitPoints / 2;
        Pet.HitRoll = ch.HitRoll * 2;
        Pet.DamageRoll = ch.DamageRoll * 2;
        Pet.ArmorClass = ch.ArmorClass - 100;
        Pet.Level = ch.Level;
        Pet.Following = ch;
        Pet.Leader = ch;

        var damagedicebylevel = 
        [
            [ 0, [3,5,10 ]],
            [25, [4,6,10 ]],
            [35, [4,8,10 ]],
            [45, [4,10,10]],
            [51, [4,10,15]],
            [56, [4,11,20]],
        ];
        Pet.DamageDice = Utility.FromLevelTable(damagedicebylevel, ch.Level);

        ch.Act("With a loud hiss, $n calls into the wild, attracting $N to $s side.", Pet, null, null, Character.ActType.ToRoom);
        ch.Act("You hiss loudly into the wild, attracting $N to your side.", Pet, null, null, Character.ActType.ToChar);

        //foreach (var attacker in ch.Room.Characters.ToArray())
        //{
        //    if (attacker.Fighting == ch)
        //        attacker.Fighting = Pet;
        //}
    }
    return;
}
Character.DoCommands.DoBearKinship = function(ch, args)
{

    var skill = SkillSpell.SkillLookup("bear kinship");
    var chance;

    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }
    if (ch.IsAffected(skill))
    {
        ch.send("You cannot commune with the bears yet.\n\r");
        return;
    }
    if (ch.Pet)
    {
        ch.send("You cannot have more than one wild creature assisting you.\n\r");
        return;
    }

    ch.WaitState(skill.WaitTime);
    var aff = new AffectData();
    aff.SkillSpell = skill;
    aff.Hidden = false;
    aff.DisplayName = skill.name;
    aff.Frequency = Frequency.Tick;
    aff.Duration = 24;
    aff.EndMessage = "You can once again commune with the bears.";
    ch.AffectToChar(aff);

    var KinshipTemplate = NPCTemplateData.NPCTemplates[19040];
    if (KinshipTemplate)
    {
        var Pet = new NPCData(KinshipTemplate, ch.Room);
        Pet.Master = ch;
        Pet.Following = ch;
        Pet.Leader = ch;
        Pet.MaxHitPoints = ch.MaxHitPoints * 2;
        Pet.HitPoints = ch.MaxHitPoints * 2;
        Pet.HitRoll = ch.HitRoll / 2;
        Pet.DamageRoll = ch.DamageRoll / 2;
        Pet.ArmorClass = ch.ArmorClass - 500;
        Pet.Level = ch.Level;

        
        var damagedicebylevel = 
        [
            [ 0, [3,5,10 ]],
            [25, [4,6,10 ]],
            [35, [4,8,10 ]],
            [45, [4,10,10]],
            [51, [4,10,15]],
            [56, [4,11,20]],
        ];
        Pet.DamageDice = Utility.FromLevelTable(damagedicebylevel, ch.Level);

        ch.Act("With a loud growl, $n calls into the wild, attracting $N to $s side.", Pet, null, null, Character.ActType.ToRoom);
        ch.Act("You growl loudly into the wild, attracting $N to your side.", Pet, null, null, Character.ActType.ToChar);

        //foreach (var attacker in ch.Room.Characters.ToArray())
        //{
        //    if (attacker.Fighting == ch)
        //        attacker.Fighting = Pet;
        //}
    }
    return;
}

Character.DoCommands.DoBarkskin = function(ch, args)
{
    var affect;
    var victim = ch;

    var skill = SkillSpell.SkillLookup("barkskin");
    var chance;
    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    if ((affect = victim.FindAffect(skill)) != null)
    {
        ch.send("You are already protected by barkskin.\n\r");
        return;
    }
    else

    if (chance > Utility.NumberPercent())
    {
        ch.Act("$n's skin becomes as hard as treebark.", victim, null, null, Character.ActType.ToRoom);
        ch.Act("Your skin becomes as hard as treebark.", victim, null, null, Character.ActType.ToChar);

        affect = new AffectData();
        affect.SkillSpell = skill;
        affect.Where = AffectData.AffectWhere.ToAffects;
        affect.Location = AffectData.ApplyTypes.Armor;
        affect.Duration = 7;
        affect.Modifier = -40;
        affect.DisplayName = "barkskin";
        affect.EndMessage = "The toughness of your barkskin fades.\n\r";
        affect.EndMessageToRoom = "The toughness of $n's barkskin fades.\n\r";
        victim.AffectToChar(affect);
        ch.CheckImprove(skill, true, 1);
    }
    else
    {
        ch.Act("$n concentrats a bit with steady breathing, but nothing happens.", victim, null, null, Character.ActType.ToRoom);
        ch.Act("You try to make your skin as hard as treebark but fail.", victim, null, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, false, 1);
    }

}
Character.DoCommands.DoLash = function(ch, args)
{

    var skill = SkillSpell.SkillLookup("lash");
    var chance;
    if ((chance = ch.GetSkillPercentage(skill)) <= 1)
    {
        ch.send("You don't know how to do that.\n\r");
        return;
    }

    var level = ch.Level;
    var victim = null;
    
    victim = ch.GetCharacterHere(args);

    if (args.ISEMPTY() && (victim = ch.Fighting) == null)
    {
        ch.send("You aren't fighting anyone.\n\r");
        return;
    }
    else if ((!args.ISEMPTY() && !victim) || (args.ISEMPTY() && !(victim = ch.Fighting)))
    {
        ch.send("You don't see them here.\n\r");
        return;
    }

    chance += level / 10;
    var wield = ch.GetEquipment(ItemData.WearSlotIDs.Wield);

    if (wield == null || (wield.WeaponType != ItemData.WeaponTypes.Whip && wield.WeaponType != ItemData.WeaponTypes.Flail))
    {
        ch.send("You must use a whip or flail to lash someone.\n\r");
        return;
    }
    ch.WaitState(skill.WaitTime);
    if (chance > Utility.NumberPercent())
    {
        var damage = Utility.dice(2, ch.Level / 2, ch.Level / 2);

        ch.Act("$n lashes $N with $p and pulls $M to the ground.", victim, wield, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n lashes you with $p and pulls you to the ground!", victim, wield, null, Character.ActType.ToVictim);
        ch.Act("You lash $N with $p and pull $M to the ground.", victim, wield, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, true, 1);
        Combat.Damage(ch, victim, damage, skill, wield != null ? wield.WeaponDamageType : DamageMessage.WeaponDamageTypes.Sting);
        victim.WaitState(Game.PULSE_VIOLENCE * 2);
        CheckCheapShot(victim);
        CheckGroundControl(victim);
    }
    else
    {
        ch.Act("$n attempts to lash $N with $p.", victim, wield, null, Character.ActType.ToRoomNotVictim);
        ch.Act("$n attempts to lash you with $p!", victim, wield, null, Character.ActType.ToVictim);
        ch.Act("You attempt to lash $N with $p.", victim, wield, null, Character.ActType.ToChar);
        ch.CheckImprove(skill, false, 1);
        Combat.Damage(ch, victim, 0, skill, wield != null ? wield.WeaponDamageType : DamageMessage.WeaponDamageTypes.Sting);
    }
    return;
}