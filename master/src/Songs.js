const Utility = require("./Utility");
const AffectData = require("./AffectData");
const Combat = require("./Combat");
const Character = require("./Character");
class Songs {		
    static SongTravelersMarch(castType, song, level, ch, victim, item, args, target)
    {
        var RefreshAmountByLevel = 
        [
            [ 0, 20 ],
            [ 15, 30 ],
            [ 25, 50 ],
        ];

        var RefreshAmount = Utility.FromLevelTable(RefreshAmountByLevel, level);

        for (var GroupMember of ch.GetGroupMembersInRoom())
        {
            if (GroupMember.MovementPoints < GroupMember.MaxMovementPoints && !GroupMember.IsAffected(AffectData.AffectFlags.Deafen))
            {
                var FuzzyRefreshAmount = Utility.Random(RefreshAmount - 5, RefreshAmount + 5);

                GroupMember.MovementPoints = Math.min(GroupMember.MovementPoints + FuzzyRefreshAmount, GroupMember.MaxMovementPoints);

                GroupMember.Act("You feel able to walk further.\n\r\n\r");
            }
            else
                GroupMember.Act("Your feet are already fully rested.\n\r\n\r");
        }

    }
    static SongAdagio(castType, song, level, ch, victim, item, args, target)
    {
        var HealAmountByLevel =
        [
            [ 0, 20 ],
            [ 15, 30 ],
            [ 25, 50 ],
            [ 30, 70 ],
            [ 40, 80 ],
            [ 50, 100 ],
        ];

        var HealAmount = Utility.FromLevelTable(HealAmountByLevel, level);

        for (var GroupMember of ch.GetGroupMembersInRoom())
        {
            if (GroupMember.HitPoints < GroupMember.MaxHitPoints && !GroupMember.IsAffected(AffectData.AffectFlags.Deafen))
            {
                var FuzzyRefreshAmount = Utility.Random(HealAmount - 5, HealAmount + 5);

                GroupMember.HitPoints = Math.min(GroupMember.HitPoints + FuzzyRefreshAmount, GroupMember.MaxHitPoints);

                GroupMember.Act("You feel a little better.\n\r\n\r");
            }
            else
                GroupMember.Act("Your health is already fully restored.\n\r\n\r");
        }
    }
    static SongElvenAdagio(castType, song, level, ch, victim, item, args, target)
    {
        var HealAmountByLevel =
        [
            [ 0, 50 ],
            [ 15, 70 ],
            [ 25, 100 ],
            [ 35, 125 ],
            [ 45, 175 ],
            [ 50, 225 ],
        ];

        var HealAmount = Utility.FromLevelTable(HealAmountByLevel, level);

        for (var GroupMember of ch.GetGroupMembersInRoom())
        {
            if (GroupMember.HitPoints < GroupMember.MaxHitPoints && !GroupMember.IsAffected(AffectData.AffectFlags.Deafen))
            {
                var FuzzyRefreshAmount = Utility.Random(HealAmount - 10, HealAmount + 10);

                GroupMember.HitPoints = Math.min(GroupMember.HitPoints + FuzzyRefreshAmount, GroupMember.MaxHitPoints);

                GroupMember.Act("You feel much better.\n\r\n\r");
            }
            else
                GroupMember.Act("Your health is already fully restored.\n\r\n\r");
        }
    }

    static SongCharismaticPrelude(castType, song, level, ch, victim, item, args, target)
    {
        var CharismaAmountByLevel =
        [
            [ 0, 4 ],
            [ 15, 6 ],
            [ 25, 8 ],
        ];

        var DurationAmountByLevel =
        [
            [ 0, 5 ],
            [ 15, 10 ],
            [ 25, 12 ],
        ];

        var CharismaAmount = Utility.FromLevelTable(CharismaAmountByLevel, level);
        var Duration = Utility.FromLevelTable(DurationAmountByLevel, level);;

        for (var GroupMember of ch.GetGroupMembersInRoom())
        {
            if (!GroupMember.IsAffected(song) && !GroupMember.IsAffected(AffectData.AffectFlags.Deafen))
            {
                var Affect = new AffectData();

                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Location = AffectData.ApplyTypes.Charisma;
                Affect.Modifier = CharismaAmount;
                Affect.Duration = Duration;
                Affect.EndMessage = "You feel less lovely.";
                Affect.EndMessageToRoom = "$n looks less lovely.";

                GroupMember.AffectToChar(Affect);

                GroupMember.Act("You feel more lovely.\n\r\n\r");
            }
            else if (!GroupMember.IsAffected(AffectData.AffectFlags.Deafen))

            {
                GroupMember.Act("You already feel more lovely.\n\r\n\r");
            }
        }
    }
    static SongCanticle(castType, song, level, ch, victim, item, args, target)
    {
        var BlessAmountByLevel = 
        [
            [ 0, 4 ],
            [ 15, 5 ],
            [ 25, 6 ],
            [ 35, 8 ],
            [ 45, 10 ],
        ];

        var DurationAmountByLevel = 
        [
            [ 0, 5 ],
            [ 15, 10 ],
            [ 25, 12 ],
        ];

        var BlessAmount = Utility.FromLevelTable(BlessAmountByLevel, level);
        var Duration = Utility.FromLevelTable(DurationAmountByLevel, level);

        for (var GroupMember of ch.GetGroupMembersInRoom())
        {
            if (!GroupMember.IsAffected(song) && !GroupMember.IsAffected(AffectData.AffectFlags.Deafen))
            {
                var Affect = new AffectData();

                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Location = AffectData.ApplyTypes.Hitroll;
                Affect.Modifier = BlessAmount;
                Affect.Duration = Duration;


                GroupMember.AffectToChar(Affect);
                Affect.Modifier = -BlessAmount;
                Affect.Location = AffectData.ApplyTypes.SavingSpell;

                Affect.EndMessage = "You feel less blessed.";
                Affect.EndMessageToRoom = "$n looks less blessed.";

                GroupMember.AffectToChar(Affect);

                GroupMember.Act("You feel blessed.\n\r\n\r");
            }
            else if (!GroupMember.IsAffected(AffectData.AffectFlags.Deafen))

            {
                GroupMember.Act("You already feel blessed.\n\r\n\r");
            }
        }
    }
    static SongPiercingDissonance(castType, song, level, ch, NA, item, args, target)
    {
        for (var victim of Utility.CloneArray(ch.Room.Characters))
        {
            if (!victim.IsSameGroup(ch) && !victim.IsAffected(AffectData.AffectFlags.Deafen))
            {
                var damage = Utility.dice(3, level + 2, level);
                Combat.Damage(ch, victim, damage, song, WeaponDamageTypes.Sound);
            }
        }
    }
    static SongBattaglia(castType, song, level, bard, NA, item, args, target)
    {
        for (var Victim of Utility.CloneArray(bard.Room.Characters))
        {
            if (!Victim.IsSameGroup(bard) && Victim.Fighting != null && Victim.Fighting.IsSameGroup(bard)
                && !Victim.IsAffected(AffectData.AffectFlags.Deafen) && !Victim.IsAffected(song))
            {
                var Affect = new AffectData();

                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Location = AffectData.ApplyTypes.Hitroll;
                Affect.Modifier = level / -5;
                Affect.Duration = 2;

                Victim.AffectToChar(Affect);

                Affect.Location = AffectData.ApplyTypes.DamageRoll;

                Affect.EndMessage = "You feel less frightened.";
                Affect.EndMessageToRoom = "$n looks less frigntened.";

                Victim.AffectToChar(Affect);

                bard.Act("You feel frightened by $n's battaglia.\n\r\n\r", Victim, null, null, Character.ActType.ToVictim);
                bard.Act("$N appears to be frightened by your battaglia.", Victim, null, null, Character.ActType.ToChar);
                bard.Act("$N appears to be frightened by $n's battaglia.\n\r\n\r", Victim, null, null, Character.ActType.ToRoomNotVictim);
            }
            else if (bard.IsSameGroup(Victim) && !Victim.IsAffected(AffectData.AffectFlags.Deafen) && !Victim.IsAffected(song))
            {
                var Affect = new AffectData();

                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Location = AffectData.ApplyTypes.Hitroll;
                Affect.Modifier = level / 5;
                Affect.Duration = 2;

                Victim.AffectToChar(Affect);

                Affect.Location = AffectData.ApplyTypes.DamageRoll;

                Affect.EndMessage = "You feel less frenzied.";
                Affect.EndMessageToRoom = "$n looks less frenzied.";

                Victim.AffectToChar(Affect);

                if (bard != Victim)
                {
                    bard.Act("You feel frenzied by $n's battaglia.\n\r\n\r", Victim, null, null, Character.ActType.ToVictim);
                    bard.Act("$N appears to be frenzied by your battaglia.", Victim, null, null, Character.ActType.ToChar);
                    bard.Act("$N appears to be frenzied by $n's battaglia.\n\r\n\r", Victim, null, null, Character.ActType.ToRoomNotVictim);
                }
                else
                {
                    bard.Act("You feel frenzied by your battaglia.\n\r\n\r", Victim, null, null, Character.ActType.ToVictim);
                    bard.Act("$N appears to be frenzied by $s battaglia.\n\r\n\r", Victim, null, null, Character.ActType.ToRoomNotVictim);
                }
            }
        }
    }
    static SongLanguidCarol(castType, song, level, bard, NA, item, args, target)
    {
        var StrengthAmountByLevel = 
        [
            [ 0, 4 ],
            [ 15, 6 ],
            [ 25, 8 ],
            [ 35, 10 ],
            [ 45, 12 ],
        ];

        var DurationAmountByLevel = 
        [
            [ 0, 5 ],
            [ 15, 10 ],
            [ 25, 12 ],
        ];
        var StrengthAmount = Utility.FromLevelTable(StrengthAmountByLevel, level);
        var Duration = Utility.FromLevelTable(DurationAmountByLevel, level);

        for (var Victim of Utility.CloneArray(bard.Room.Characters))
        {
            if (!Victim.IsSameGroup(bard) && !Victim.IsAffected(AffectData.AffectFlags.Deafen) && !Victim.IsAffected(song))
            {
                var Affect = new AffectData();

                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Location = AffectData.ApplyTypes.Strength;
                Affect.Modifier = -StrengthAmount;
                Affect.Duration = Duration;

                Victim.AffectToChar(Affect);

                Affect.Location = AffectData.ApplyTypes.DamageRoll;

                Affect.EndMessage = "You feel stronger.";
                Affect.EndMessageToRoom = "$n looks stronger.";

                Victim.AffectToChar(Affect);

                bard.Act("You feel weakened by $n's Languid Carol.\n\r\n\r", Victim, null, null, Character.ActType.ToVictim);
                bard.Act("$N appears to be weakened by your Languid Carol.", Victim, null, null, Character.ActType.ToChar);
                bard.Act("$N appears to be weakened by $n's Languid Carol.\n\r\n\r", Victim, null, null, Character.ActType.ToRoomNotVictim);

                if (Victim.Fighting == null && Victim.IsAwake)
                {
                    var Weapon = Victim.Equipment["Wield"];
                    Combat.OneHit(Victim, bard, Weapon);
                }
            }
        }
    }
    static SongAnthemOfResistance(castType, song, level, ch, victim, item, args, target)
    {

        var DurationAmountByLevel = 
        [
            [ 0, 5 ],
            [ 15, 8 ],
            [ 25, 10 ],
            [ 35, 12 ],
            [ 45, 14 ],
        ];

        var Duration = Utility.FromLevelTable(DurationAmountByLevel, level);

        for (var GroupMember of ch.GetGroupMembersInRoom())
        {
            if (!GroupMember.IsAffected(song) && !GroupMember.IsAffected(AffectData.AffectFlags.Deafen))
            {
                var Affect = new AffectData();

                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Flags.SETBIT(AffectData.AffectFlags.AnthemOfResistance);
                Affect.Duration = Duration;
                Affect.EndMessage = "You feel less resistant.";
                Affect.EndMessageToRoom = "$n looks less resistant.";

                GroupMember.AffectToChar(Affect);

                GroupMember.Act("You feel more resistant.\n\r\n\r");
            }
            else if (!GroupMember.IsAffected(AffectData.AffectFlags.Deafen))

            {
                GroupMember.Act("You already feel more resistant.\n\r\n\r");
            }
        }

    }
    static SongRiddleOfRevelation(castType, song, level, bard, NA, item, args, target)
    {

        var DurationAmountByLevel =
        [
            [ 0, 2 ],
            [ 15, 4 ],
            [ 25, 6 ],
            [ 35, 8 ],
            [ 45, 10 ],
        ];
        var Duration = Utility.FromLevelTable(DurationAmountByLevel, level);

        for (var Victim of Utility.CloneArray(bard.Room.Characters))
        {
            if (!Victim.IsSameGroup(bard) && !Victim.IsAffected(AffectData.AffectFlags.Deafen) && !Victim.IsAffected(song))
            {
                var Affect = new AffectData();

                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Location = AffectData.ApplyTypes.None;
                Affect.Modifier = 0;
                Affect.Duration = Duration;
                Affect.Flags.SETBIT(AffectData.AffectFlags.FaerieFire);

                Affect.EndMessage = "You are no longer glowing.";
                Affect.EndMessageToRoom = "$n is no longer glowing.";

                Victim.AffectToChar(Affect);

                bard.Act("You are revealed by $n's Riddle Of Revelation.\n\r\n\r", Victim, null, null, Character.ActType.ToVictim);
                bard.Act("$N becomes revealed by your Riddle Of Revelation.", Victim, null, null, Character.ActType.ToChar);
                bard.Act("$N becomes refealed by $n's Riddle of Revelation.\n\r\n\r", Victim, null, null, Character.ActType.ToRoomNotVictim);

                Victim.StripHidden();
                Victim.StripInvis();
                Victim.StripSneak();
                Victim.StripCamouflage();

            }
        }
    }
    static SongReveille(castType, song, level, bard, NA, item, args, target)
    {
        for (var victim of Utility.CloneArray(bard.Room.Characters))
        {
            if ((victim.IsAffected(AffectData.AffectFlags.Sleep) || victim.IsAffected(SkillSpell.SkillLookup("strangle"))) && !victim.IsAffected(AffectData.AffectFlags.Deafen))
            {

                var effect = victim.FindAffect(AffectData.AffectFlags.Sleep);
                if (effect != null) victim.AffectFromChar(effect, AffectRemoveReason.Cleansed);

                effect = victim.FindAffect(SkillSpell.SkillLookup("strangle"));
                if (effect != null) victim.AffectFromChar(effect, AffectRemoveReason.Cleansed);

                CharacterDoFunctions.DoStand(victim, "");

                bard.Act("You are awakened by $n's Reveille.\n\r\n\r", victim, null, null, Character.ActType.ToVictim);
                bard.Act("$N is awakened by your Reveille.", victim, null, null, Character.ActType.ToChar);
                bard.Act("$N becomes awakened by $n's Reveille.\n\r\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
            }
        }

    }
    static SongPastoralOfTheMind(castType, song, level, ch, victim, item, args, target)
    {
        var ManaAmountByLevel =
        [
            [ 0, 100 ],
            [ 15, 100 ],
            [ 25, 100 ],
            [ 30, 120 ],
            [ 35, 140 ],
            [ 40, 160 ],
            [ 45, 180 ],
            [ 50, 200 ],
        ];

        var ManaAmount = Utility.FromLevelTable(ManaAmountByLevel, level);

        for (var GroupMember of ch.GetGroupMembersInRoom())
        {
            if (GroupMember.ManaPoints < GroupMember.MaxManaPoints && !GroupMember.IsAffected(AffectData.AffectFlags.Deafen))
            {
                var FuzzyManaAmount = Utility.Random(ManaAmount - 10, ManaAmount + 10);

                GroupMember.ManaPoints = Math.min(GroupMember.ManaPoints + FuzzyManaAmount, GroupMember.MaxManaPoints);

                GroupMember.Act("You feel better able to concentrate.\n\r\n\r");
            }
            else
                GroupMember.Act("Your ability to concentrate is already accomplished.\n\r\n\r");
        }

    }
    static SongTranquilSerenade(castType, song, level, bard, NA, item, args, target)
    {
        for (var victim of Utility.CloneArray(bard.Room.Characters))
        {
            if (!victim.IsAffected(AffectData.AffectFlags.Deafen))
            {
                if (victim.Fighting != null) Combat.StopFighting(victim, true);
                if (!victim.IsAffected(song))
                {
                    var Affect = new AffectData();

                    Affect.DisplayName = song.Name;
                    Affect.SkillSpell = song;
                    Affect.Level = level;
                    Affect.Duration = 2;
                    Affect.Flags.SETBIT(AffectData.AffectFlags.Calm);

                    Affect.EndMessage = "You are no longer calmed.";
                    Affect.EndMessageToRoom = "$n is no longer calmed.";

                    victim.AffectToChar(Affect);

                }

                bard.Act("You are calmed by $n's Tranquil Serenade.\n\r\n\r", victim, null, null, Character.ActType.ToVictim);
                bard.Act("$N is calmed by your Tranquil Serenade.", victim, null, null, Character.ActType.ToChar);
                bard.Act("$N becomes calmed by $n's Tranquil Serenade.\n\r\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
            }
        }

    }
    static SongRequiem(castType, song, level, bard, NA, item, args, target)
    {
                
        var corpse= null;

        for (var Item of bard.Room.items)

        {
            if (Item.ItemType.ISSET(ItemTypes.PC_Corpse)) corpse=item;
        }

        if (corpse == null) { bard.send("There is no player corpse here to sing over.\n\r"); return; }

        for (var Victim of Utility.CloneArray(bard.Room.Characters))
        {
            if (!Victim.IsAffected(AffectData.AffectFlags.Deafen) && !Victim.IsAffected(song))
            {
                var Affect = new AffectData();

                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Location = AffectData.ApplyTypes.AC;
                Affect.Modifier = -40;
                Affect.Duration = 100;
                Affect.Flags.SETBIT(AffectData.AffectFlags.EnhancedFastHealing);

                Affect.EndMessage = "You are no longer inspired.";
                Affect.EndMessageToRoom = "$n is no longer inspired.";

                Victim.AffectToChar(Affect);

                bard.Act("You are inspired by $n's song of Requiem over $p.\n\r\n\r", Victim, corpse, null, Character.ActType.ToVictim);
                bard.Act("$N becomes inspired by your song of Requiem.", Victim, null, null, Character.ActType.ToChar);
                bard.Act("$N becomes inspired by $n's song of Requiem over $p.\n\r\n\r", Victim,corpse, null, Character.ActType.ToRoomNotVictim);

            }

        }

    }
    static SongElegyOfTears(castType, song, level, bard, NA, item, args, target)
    {
        for (var victim of Utility.CloneArray(bard.Room.Characters))
        {
            if (!victim.IsAffected(AffectData.AffectFlags.Deafen))
            {
                if (victim.LastFighting != null)
                {
                    victim.LastFighting = null;

                    bard.Act("$N is calmed by your Elegy Of Tears.", victim, null, null, Character.ActType.ToChar);
                    bard.Act("$N becomes calmed by $n's Elegy Of Tears.\n\r\n\r", victim, null, null, Character.ActType.ToRoomNotVictim);
                }
            }
        }

    }
    static SongBagatelleOfBravado(castType, song, level, ch, victim, item, args, target)
    {
        var StatAmountByLevel =
        [
            [ 10, 40 ],
            [ 20, 50 ],
            [ 28, 70 ],
            [ 30, 90 ],
            [ 32, 110 ],
            [ 34, 130 ],
            [ 38, 145 ],
            [ 41, 155 ],
            [ 45, 170 ],
        ];

        var DurationAmountByLevel =
        [
            [ 0, 5 ],
            [ 15, 5 ],
            [ 28, 5 ],
            [ 30, 6 ],
            [ 32, 8 ],
            [ 34, 10 ],
            [ 38, 12 ],
            [ 41, 14 ],
            [ 45, 16 ],
        ];

        var StatAmount = Utility.FromLevelTable(StatAmountByLevel, level);
        var Duration = Utility.FromLevelTable(DurationAmountByLevel, level);

        for (var GroupMember of ch.GetGroupMembersInRoom())
        {
            if (!GroupMember.IsAffected(song) && !GroupMember.IsAffected(AffectData.AffectFlags.Deafen))
            {
                var Affect = new AffectData();

                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Location = AffectData.ApplyTypes.Hp;
                Affect.Modifier = StatAmount;
                Affect.Duration = Duration;

                GroupMember.AffectToChar(Affect);
                Affect.Location = AffectData.ApplyTypes.Mana;

                Affect.EndMessage = "You feel more vulnerable.";
                Affect.EndMessageToRoom = "$n looks more vulnerable.";

                GroupMember.AffectToChar(Affect);

                GroupMember.Act("You feel more confidence.\n\r\n\r");
            }
            else if (!GroupMember.IsAffected(AffectData.AffectFlags.Deafen))

            {
                GroupMember.Act("You already feel more confident.\n\r\n\r");
            }
        }
    }
    static SongLaboriousLament(castType, song, level, bard, NA, item, args, target)
    {
        var DexAmountByLevel = 
        [
            [ 0, 5 ],
            [ 15, 5 ],
            [ 29, 5 ],
            [ 32, 6 ],
            [ 36, 7 ],
            [ 39, 8 ],
            [ 42, 9 ],
            [ 44, 10 ],
            [ 46, 11 ],
            [ 50, 12 ],
        ];

        var DurationAmountByLevel =
        [
            [ 0, 5 ],
            [ 29, 5 ],
            [ 33, 6 ],
            [ 37, 7 ],
            [ 41, 8 ],
            [ 45, 10 ],
            [ 50, 12 ],
        ];
        var DexAmount = Utility.FromLevelTable(DexAmountByLevel, level);
        var Duration = Utility.FromLevelTable(DurationAmountByLevel, level);

        for (var Victim of Utility.CloneArray(bard.Room.Characters))
        {
            if (!Victim.IsSameGroup(bard) && !Victim.IsAffected(AffectData.AffectFlags.Deafen) && !Victim.IsAffected(song))
            {
                var Affect = new AffectData();

                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Location = AffectData.ApplyTypes.Strength;
                Affect.Modifier = -DexAmount;
                Affect.Duration = Duration;

                Victim.AffectToChar(Affect);

                Affect.Location = AffectData.ApplyTypes.Dex;

                Affect.EndMessage = "You feel more coordinated.";
                Affect.EndMessageToRoom = "$n looks more coordinated.";

                Victim.AffectToChar(Affect);

                bard.Act("You feel less coordinated by $n's Laborious Lament.\n\r\n\r", Victim, null, null, Character.ActType.ToVictim);
                bard.Act("$N appears to be less coordinated by your Laborious Lament.", Victim, null, null, Character.ActType.ToChar);
                bard.Act("$N appears to be less coordinated by $n's Laborious Lament.\n\r\n\r", Victim, null, null, Character.ActType.ToRoomNotVictim);

                if (Victim.Fighting == null && Victim.IsAwake)
                {
                    var Weapon = Victim.Equipment["Wield"];
                    Combat.OneHit(Victim, bard, Weapon);
                }
            }
        }
    }
    static SongVibrato(castType, song, level, ch, NA, item, args, target)
    {
        for (var victim of Utility.CloneArray(ch.Room.Characters))
        {
            if (!victim.IsSameGroup(ch) && !victim.IsAffected(AffectData.AffectFlags.Deafen))
            {
                var damage = Utility.dice(3, level + 2, level*2);
                Combat.Damage(ch, victim, damage, song, WeaponDamageTypes.Blast);
            }
        }
    }
    static SongApocalypticOverture(castType, song, level, ch, NA, item, args, target)
    {
        var fire = Utility.Random(0, 1) == 1;

        for (var victim of Utility.CloneArray(ch.Room.Characters))
        {
            if (!victim.IsSameGroup(ch) && !victim.IsAffected(AffectData.AffectFlags.Deafen))
            {
                var damage = Utility.dice(3, level + 10, level * 2);
                Combat.Damage(ch, victim, damage, fire ? "apocalyptic blaze":"apocalyptic frost", fire ? WeaponDamageTypes.Fire : WeaponDamageTypes.Cold);
            }
        }
    }
    static SongFantasiaOfPalliation(castType, song, level, bard, NA, item, args, target)
    {
        var DurationAmountByLevel = 
        [
            [ 0, 5 ],
            [ 29, 5 ],
            [ 33, 6 ],
            [ 37, 7 ],
            [ 41, 8 ],
            [ 45, 10 ],
            [ 50, 12 ],
        ];
        var Duration = Utility.FromLevelTable(DurationAmountByLevel, level);

        for (var Victim of Utility.CloneArray(bard.Room.Characters))
        {
            if (!Victim.IsSameGroup(bard) && !Victim.IsAffected(AffectData.AffectFlags.Deafen) && !Victim.IsAffected(song))
            {
                var Affect = new AffectData();
                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Location = AffectData.ApplyTypes.Strength;
                Affect.Modifier = (int)(-Victim.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Strength)*.1);
                Affect.Duration = Duration;
                Victim.AffectToChar(Affect);

                Affect.Location = AffectData.ApplyTypes.Dex;
                Affect.Modifier = (int)(-Victim.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Dexterity) * .1);
                Victim.AffectToChar(Affect);

                Affect.Location = AffectData.ApplyTypes.Int;
                Affect.Modifier = (int)(-Victim.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Intelligence) * .1);
                Victim.AffectToChar(Affect);

                Affect.Location = AffectData.ApplyTypes.Wis;
                Affect.Modifier = (int)(-Victim.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Wisdom) * .1);
                Victim.AffectToChar(Affect);

                Affect.Location = AffectData.ApplyTypes.Con;
                Affect.Modifier = (int)(-Victim.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Constitution) * .1);
                Victim.AffectToChar(Affect);

                Affect.Location = AffectData.ApplyTypes.Chr;
                Affect.Modifier = (int)(-Victim.GetCurrentStat(PhysicalStats.PhysicalStatTypes.Charisma) * .1);
                Victim.AffectToChar(Affect);

                Affect.Location = AffectData.ApplyTypes.Hp;
                Affect.Modifier = (int)(-Victim.MaxHitPoints * .1);
                Victim.AffectToChar(Affect);

                Affect.Location = AffectData.ApplyTypes.DamageRoll;
                Affect.Modifier = (int)(-Victim.DamageRoll * .1);
                Victim.AffectToChar(Affect);

                Affect.Location = AffectData.ApplyTypes.Hitroll;
                Affect.Modifier = (int)(-Victim.HitRoll * .1);

                Affect.EndMessage = "You feel less disheartened.";
                Affect.EndMessageToRoom = "$n looks disheartened.";
                Victim.AffectToChar(Affect);

                bard.Act("You feel less disheartened by $n's Fantasia Of Palliation.\n\r\n\r", Victim, null, null, Character.ActType.ToVictim);
                bard.Act("$N appears to be less disheartened by your Fantasia Of Palliation.", Victim, null, null, Character.ActType.ToChar);
                bard.Act("$N appears to be less disheartened by $n's Fantasia Of Palliation.\n\r\n\r", Victim, null, null, Character.ActType.ToRoomNotVictim);

                if (Victim.Fighting == null && Victim.IsAwake)
                {
                    var Weapon = Victim.Equipment["Wield"];
                    Combat.OneHit(Victim, bard, Weapon);
                }
            }
        }
    }
    static DirgeImmolation(victim, affect)
    {
        var DamAmountByLevel =
        [
            [ 40, 37 ],
            [ 45, 45 ],
            [ 50, 55 ],
            [ 51, 60 ],
        ];

        var DamAmount = Utility.FromLevelTable(DurationAmountByLevel, affect.Level);
        Combat.Damage(victim, victim, Utility.Random(DamAmount-5, DamAmount+5),affect.SkillSpell, DamageMessages.WeaponDamageTypes.Fire, affect.OwnerName);
    }
    static SongDirgeOfSacrifice(castType, song, level, bard, NA, item, args, target)
    {
    for (var Victim of Utility.CloneArray(bard.Room.Characters))
        {
            if (!Victim.IsSameGroup(bard) && !Victim.IsAffected(AffectData.AffectFlags.Deafen) && !Victim.IsAffected(song))
            {
                var Affect = new AffectData();
                Affect.OwnerName = bard.Name;
                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Location = AffectData.ApplyTypes.None;
                Affect.Modifier = 0;
                Affect.Duration = Game.PULSE_TICK *2;
                Affect.Frequency= Frequency.Violence;

                Affect.EndMessage = "You stop burning.";
                Affect.EndMessageToRoom = "$n stops burning.";

                Victim.AffectToChar(Affect);

                bard.Act("You feel immolated by $n's Dirge Of Sacrifice.\n\r\n\r", Victim, null, null, Character.ActType.ToVictim);
                bard.Act("$N appears to be afflicted by immolation from your Dirge Of Sacrifice.", Victim, null, null, Character.ActType.ToChar);
                bard.Act("$N appears to be afflicted by immolation from $n's Dirge Of Sacrifice.\n\r\n\r", Victim, null, null, Character.ActType.ToRoomNotVictim);

                if (Victim.Fighting == null && Victim.IsAwake)
                {
                    var Weapon = Victim.Equipment["Wield"];
                    Combat.OneHit(Victim, bard, Weapon);
                }
            }
        }
    }
    static SongGrandNocturne(castType, song, level, bard, NA, item, args, target)
    {
        for (var Victim of Utility.CloneArray(bard.Room.Characters))
        {
            if (!Victim.IsSameGroup(bard)
                && !Victim.IsAffected(AffectData.AffectFlags.Deafen) && !Victim.IsAffected(song))
            {
                var Affect = new AffectData();

                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Modifier = 0;
                Affect.Duration = 2;
                Affect.Flags.SETBIT(AffectData.AffectFlags.GrandNocturne);

                Affect.EndMessage = "You feel less ineffective.";
                Affect.EndMessageToRoom = "$n looks less ineffective.";

                Victim.AffectToChar(Affect);

                bard.Act("You feel ineffective from $n's battaglia.\n\r\n\r", Victim, null, null, Character.ActType.ToVictim);
                bard.Act("$N appears to be very ineffective by your battaglia.", Victim, null, null, Character.ActType.ToChar);
                bard.Act("$N appears to be ineffective by $n's battaglia.\n\r\n\r", Victim, null, null, Character.ActType.ToRoomNotVictim);
            }
        }
    }

    static SongLullaby(castType, song, level, bard, NA, item, args, target)
    {
        for (var Victim of Utility.CloneArray(bard.Room.Characters))
        {
            if (!Victim.IsSameGroup(bard)
                && !Victim.IsAffected(AffectData.AffectFlags.Deafen) && !Victim.IsAffected(song))
            {
                var Affect = new AffectData();

                Affect.DisplayName = song.Name;
                Affect.SkillSpell = song;
                Affect.Level = level;
                Affect.Where = AffectData.AffectWhere.ToAffects;
                Affect.Modifier = 0;
                Affect.Duration = 5;
                Affect.Flags.SETBIT(AffectData.AffectFlags.Sleep);

                Affect.EndMessage = "You feel less sleepy.";
                Affect.EndMessageToRoom = "$n looks less sleepy.";

                Victim.AffectToChar(Affect);
                Victim.Position = Positions.Sleeping;
                bard.Act("You feel sleepy from $n's lullaby.\n\r\n\r", Victim, null, null, Character.ActType.ToVictim);
                bard.Act("$N appears to be very sleepy by your lullaby.", Victim, null, null, Character.ActType.ToChar);
                bard.Act("$N appears to be very sleepy by $n's lullaby.\n\r\n\r", Victim, null, null, Character.ActType.ToRoomNotVictim);
            }
        }
    }
}

module.exports = Songs;