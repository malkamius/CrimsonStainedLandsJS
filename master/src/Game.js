class Game {
    static get PULSE_PER_SECOND() { return 4; };	
    static get PULSE_PER_VIOLENCE() { return Game.PULSE_PER_SECOND * 3; }
    static get PULSE_VIOLENCE() { return Game.PULSE_PER_VIOLENCE; }
    static get PULSE_PER_TICK() { return Game.PULSE_PER_SECOND * 30; }
    static get PULSE_TRACK() { return Game.PULSE_PER_SECOND * 20; }

    static GameStarted = new Date();
    static LEVEL_IMMORTAL = 52;

    static Pulse()
    {
        const Player = require('./Player');
        //console.time("PULSE");
        var startpulse = new Date();
        var player;
        for(player of Utility.CloneArray(Player.Players))
        {
            if(player.Wait > 0) player.Wait--;

            try{
                if(player.status == "WaitingOnLoad" && !player.socket.destroyed) {
                    player.status = "GetName";
                    const Character = require("./Character");
                    Character.DoCommands.DoHelp(player, "diku", true);

                    player.send("Please enter your name: ");
                }
                const TimeSpan = require("./TimeSpan");

                if(player.inanimate && new TimeSpan(Date.now() - player.inanimate).totalMinutes >= 1) {
                    player.Act("$n disappears into the void.", null, null, null, "ToRoom");
                    player.Save();
                    player.Dispose();
                    if(!player.socket.destroyed)
                    player.socket.destroy();
                    //var index = -1;
                    // var thisplayer = Player.Players.find((thisplayer, thisindexindex) => index = thisindex);
                    // thisplayer.socket = null;

                    Player.Players.splice(Player.Players.indexOf(player), 1);
                }

                if(player.socket && !player.socket.destroyed)
                    player.HandleInput(); 
            } catch(err) {
                try {
                    console.log(err);
                    player.send("Error: " + err);
                }
                catch(innererr) {
                    console.log(err);
                }
            }
        }

        Game.Update();

        for(player of Utility.CloneArray(Player.Players))
        {	
            try{
                if(player.socket && !player.socket.destroyed) {
                    player.HandleOutput();
                }
            } catch(err) {
                try {
                    console.log(err);
                    player.send("Error: " + err);
                }
                catch(innererr) {
                    console.log(err);
                }
            }

        }
        var totalpulse = new Date() - startpulse;
        setTimeout(Game.Pulse, Math.min(Math.max(250 - totalpulse, 1), 250));
        
        if(totalpulse > 250) console.log("PULSE TOOK " + totalpulse + "ms");
        //console.timeEnd("PULSE");
        //console.log(totalpulse);
    }

    static UpdateCombatCounter = 0;
    static UpdateTickCounter = 0;
    static UpdateTrackCounter = 0;

    static Update() {
        const AreaData = require('./AreaData');
        if(--Game.UpdateTickCounter <= 0) {
            AreaData.ResetAreas();
            Game.UpdateWeather();
            Game.UpdateTick();
            Game.UpdateTickCounter = Game.PULSE_PER_TICK;
        }

        if(--Game.UpdateCombatCounter <= 0) {
            Game.UpdateCombat();
            Game.UpdateCombatCounter = Game.PULSE_PER_VIOLENCE;
        }

        if(--Game.UpdateTrackCounter <= 0) {
            Game.UpdateTrack();
            Game.UpdateTrackCounter = Game.PULSE_TRACK;
        }

        Game.UpdateAggro();
    }


    static DumpItems(item)
    {
        for (var contained of Utility.CloneArray(item.Contains))
        {
            item.Contains.Remove(contained);
            item.Room.Items.unshift(contained);
            contained.Room = item.Room;
            contained.Container = null;
        }
    }

    static UpdateTick() {
        Game.UpdateCharactersTick();
        
        Game.UpdateItemsTick();
    }



    static UpdateCombat() {
        const Character = require("./Character");
        const Combat = require("./Combat");
        const SkillSpell = require("./SkillSpell");
        const Magic = require("./Magic");
        const Program = require("./Program");
        for(var character of Utility.CloneArray(Character.Characters)) {
            for(var affect of Utility.CloneArray(character.Affects)) {
                if(affect.Frequency == "Violence") {
                    if(affect.Duration > 0) --affect.Duration;

                    if(affect.SkillSpell && affect.SkillSpell.TickFun) {
                        affect.SkillSpell.TickFun(character, affect);
                    }
                    if(affect.TickProgram) {
                        Program.Execute(affect.TickProgram, character, null, null, null, affect, Program.ProgramTypes.AffectTick);
                    }
                    
                    if(affect.Duration == 0) {
                        character.AffectFromChar(affect);
                    }
                }
            }
            
            if(character.IsNPC && character.Wait == 0 && Utility.Random(0,2) == 2) {
                //for(var learnedkey in character.Learned) {
                    //var learned = character.Learned[learnedkey];
                    var learned = Utility.SelectRandom(character.Learned, function(item) { var skill;
                        return (skill = SkillSpell.GetSkill(item.Name, false)) && skill.AutoCast == true && skill.TargetType.equals("targetCharDefensive")});
                    if(learned) {
                        var skill = SkillSpell.GetSkill(learned.Name, false);

                        if(learned && skill && skill.TargetType.equals("targetCharDefensive")) {
                            if(skill.AutoCastScript.ISEMPTY() || eval(skill.AutoCastScript)) {
                                var victim = character;
                                
                                if(character.Flags.ISSET("Healer") && character.Room.Characters.length > 1)
                                    victim = character.Room.Characters.SelectRandom(function (other) { return other != character;});

                                if(character.Guild && character.Guild.CastType) {
                                    if(victim == character)
                                        Magic.CastCommuneOrSing(character, "'" + skill.Name + "'", character.Guild.CastType);
                                    else
                                        Magic.CastCommuneOrSing(character, "'" + skill.Name + "' " + victim.Name, character.Guild.CastType);
                                    //console.log(Utility.Format("{0} {1}", character.Guild.CastType, "'" + skill.Name + "'"))
                                }
                                
                            }
                        }
                    }
                //}
            }

            

            if(character.Fighting && character.Fighting.Room != character.Room) {
                character.Fighting = null;
                character.Position = "Standing";
            }

            if(character.Fighting) {
                Combat.ExecuteRound(character);
            }
        }
    }

    static UpdateAggro() {
        const Character = require("./Character");
        const Combat = require("./Combat");
        const AffectData = require("./AffectData");
        for(var character of Utility.CloneArray(Character.Characters)) { 
            if(character.IsNPC && character.Wait > 0) character.Wait--;

            if (character.IsNPC && 
                character.Room &&
                character.Flags.ISSET(Character.ActFlags.Aggressive) && 
                character.Fighting == null && character.IsAwake
                && !character.IsAffected(AffectData.AffectFlags.Calm)
                && !((character.Flags.ISSET(Character.ActFlags.Wimpy) && 
                    character.HitPoints < character.MaxHitPoints / 5)))
            {
                var gentlewalk;
                var randomPlayer = character.Room.Characters.SelectRandom(ch => 
                    !ch.IsNPC && character.CanSee(ch) && 
                    !ch.IsAffected(AffectData.AffectFlags.Ghost) &&
                    !(gentlewalk = ch.IsAffected("gentle walk") && gentlewalk.Duration == -1) &&
                    !ch.IsAffected(AffectData.AffectFlags.PlayDead) &&
                    ch.Level < character.Level + 5);
                
                if (randomPlayer && (character.Alignment != "Good" || randomPlayer.Alignment == "Evil"))
                {
                    character.Act("$n screams and attacks YOU!", randomPlayer, null, null, Character.ActType.ToVictim);
                    character.Act("$n screams and attacks $N!", randomPlayer, null, null, Character.ActType.ToRoomNotVictim);
                    character.Fighting = randomPlayer;
                    Combat.ExecuteRound(character);
                }
            } else if(character.IsNPC && character.Room && character.LastFighting) {
                Game.CheckTrackAggro(character);
            } else {
                Game.CheckAutoAssist(character);
            }
        }
    }

    static CheckAutoAssist(character) {
        const Character = require("./Character");
        const Combat = require("./Combat");
        const Utility = require("./Utility");

        if(character.Fighting || Character.Positions.indexOf(character.Position) <= Character.Positions.indexOf("Sleeping")) {
            return;
        } 
        if(!character.Fighting && character.Flags.ISSET(Character.ActFlags.AutoAssist)) {
            var assist = character.Room.Characters.SelectRandom(c => c.Fighting && (c.IsSameGroup(character) || character.Master == c));
            if(assist) {
                character.Fighting = assist.Fighting;
                Combat.ExecuteRound(character);
            }
        } 
        if(!character.Fighting && character.Flags.ISSET(Character.ActFlags.AssistAll)) {
            var assist = character.Room.Characters.SelectRandom(c => c.Fighting && c != character);
            if(assist) {
                character.Fighting = assist.Fighting;
                Combat.ExecuteRound(character);
            }
        } 
        if(!character.Fighting && character.Flags.ISSET(Character.ActFlags.AssistAlign)) {
            var assist = character.Room.Characters.SelectRandom(c => c.Fighting && c.Alignment == character.Alignment);
            if(assist) {
                character.Fighting = assist.Fighting;
                Combat.ExecuteRound(character);
            }
        } 
        if(!character.Fighting && character.Flags.ISSET(Character.ActFlags.AssistPlayer)) {
            var assist = character.Room.Characters.SelectRandom(c => c.Fighting && !c.IsNPC);   
            if(assist) {
                character.Fighting = assist.Fighting;
                Combat.ExecuteRound(character);
            }
        } 
        if(!character.Fighting && character.Flags.ISSET(Character.ActFlags.AssistRace)) {
            var assist = character.Room.Characters.SelectRandom(c => c.Fighting && c.Race == character.Race);
            if(assist) {            
                character.Fighting = assist.Fighting;
                Combat.ExecuteRound(character);
            }
        }

        if(!character.Fighting && character.Flags.ISSET(Character.ActFlags.AssistVnum)) {
            var assist = character.Room.Characters.SelectRandom(c => c.Fighting && c.VNum == character.VNum);
            if(assist) {
                character.Fighting = assist.Fighting;
                Combat.ExecuteRound(character);
            }
        }

    }

    static UpdateCharactersTick() {
        const Character = require("./Character");
        const Program = require("./Program");
        const AffectData = require("./AffectData");
        const SkillSpell = require("./SkillSpell");
        const Combat = require("./Combat");

        for(var character of Utility.CloneArray(Character.Characters)) { 
            try {
                for(var affect of Utility.CloneArray(character.Affects)) {
                    if(affect.Frequency == "Tick") {
                        if(affect.Duration > 0) --affect.Duration;

                        if(affect.SkillSpell && affect.SkillSpell.TickFun) {
                            affect.SkillSpell.TickFun(character, affect);
                        }

                        if(affect.TickProgram) {
                            Program.Execute(affect.TickProgram, character, null, null, null, affect, Program.ProgramTypes.AffectTick);
                        }

                        if((affect.Duration == 0)) {
                            character.AffectFromChar(affect);
                        }

                        
                    }
                }
            } catch(err) {
                console.log(err);
            }

            if(Character.Positions.indexOf(character.Position) > Character.Positions.indexOf("Stunned")) {
                if(character.HitPoints < character.MaxHitPoints) {
                    var gain = character.GetHitPointsGain();

                    character.HitPoints = Math.min(character.HitPoints + gain, character.MaxHitPoints);
                } else {
                    character.HitPoints = Math.min(character.HitPoints, character.MaxHitPoints);
                }

                if(character.ManaPoints < character.MaxManaPoints) {
                    var gain = character.GetManaPointsGain();

                    character.ManaPoints = Math.min(character.ManaPoints + gain, character.MaxManaPoints);
                } else {
                    character.ManaPoints = Math.min(character.ManaPoints, character.MaxManaPoints);
                }

                if(character.MovementPoints < character.MaxMovementPoints) {
                    var gain = character.GetMovementPointsGain();

                    character.MovementPoints = Math.min(character.MovementPoints + gain, character.MaxMovementPoints);
                } else {
                    character.MovementPoints = Math.min(character.MovementPoints, character.MaxMovementPoints);
                }
            }
            if (character.Position == "Stunned") {
                const Combat = require('./Combat');
                Combat.UpdatePosition(ch);
            }

            if (!character.IsNPC && !character.IsImmortal && !character.IsInactive && !character.IsAffected(AffectData.AffectFlags.Ghost))
            {

                var survivalist = 0;
                if ((character.GetSkillPercentage("slow metabolism") <= 1 && (survivalist = character.GetSkillPercentage("survivalist")) <= 1) || Utility.Random(0, 15) == 0)
                {
                    if (survivalist > 1) character.CheckImprove("survivalist", false, 1);
                    if (character.Hunger > 0 && !character.IsAffected(AffectData.AffectFlags.Sated))
                    character.Hunger--;
                    else if (character.Hunger <= 0 && !character.IsAffected(AffectData.AffectFlags.Sated))
                        character.Starving++;
                    if (character.Thirst > 0 && !character.IsAffected(AffectData.AffectFlags.Quenched))
                        character.Thirst--;
                    else if (character.Thirst <= 0 && !character.IsAffected(AffectData.AffectFlags.Quenched))
                        character.Dehydrated++;

                    if (character.Level > 10)
                    {
                        if (character.Hunger == 0 && !character.IsAffected(AffectData.AffectFlags.Sated))
                            character.Starving++;
                        if (character.Thirst == 0 && !character.IsAffected(AffectData.AffectFlags.Quenched))
                            character.Dehydrated++;
                    }
                    else
                    {
                        character.Starving = 0;
                        character.Dehydrated = 0;
                    }

                    if (character.Hunger > 0
                        && character.Starving > 0)
                    {
                        var counter = character.Starving;
                        if (counter <= 4)
                            character.send("You are no longer famished.\n\r");
                        else
                            character.send("You are no longer starving.\n\r");
                        character.Starving = 0;
                        //ch.hunger = 2;
                    }

                    if (character.Thirst > 0
                        && character.Dehydrated > 0)
                    {
                        var counter = character.Dehydrated;
                        if (counter <= 5)
                            character.send("You are no longer dehydrated.\n\r");
                        else
                            character.send("You are no longer dying of thirst.\n\r");
                        character.Dehydrated = 0;
                        //ch.thirst = 2;
                    }


                    if (character.Hunger < 4 && !character.IsAffected(AffectData.AffectFlags.Sated))
                    {
                        if (character.Starving < 2)
                            character.send("You are hungry.\n\r");


                    }
                    if (character.Thirst < 4 && !character.IsAffected(AffectData.AffectFlags.Quenched))
                    {
                        if (character.Dehydrated < 2)
                            character.send("You are thirsty.\n\r");
                    }

                    if (character.Starving > 1 && !character.IsAffected(AffectData.AffectFlags.Sated))
                    {
                        var counter = character.Starving;
                        if (counter <= 5)
                            character.send("You are famished!\n\r");
                        else if (counter <= 8)
                            character.send("You are beginning to starve!\n\r");
                        else
                        {
                            character.send("You are starving!\n\r");
                            if (character.Level > 10 && !character.IsAffected(AffectData.AffectFlags.Sated) && !character.IsAffected(AffectData.AffectFlags.Ghost))
                                Combat.Damage(character, character, Utility.Random(counter - 3, 2 * (counter - 3)), SkillSpell.SkillLookup("starvation"));
                        }

                    }

                    if (character.Dehydrated > 1 && !character.IsAffected(AffectData.AffectFlags.Quenched))
                    {
                        var counter = character.Dehydrated;
                        if (counter <= 2)
                            character.send("Your mouth is parched!\n\r");
                        else if (counter <= 5)
                            character.send("You are beginning to dehydrate!\n\r");
                        else
                        {
                            character.send("You are dying of thirst!\n\r");
                            if (character.Level > 10 && !character.IsAffected(AffectData.AffectFlags.Quenched) && !character.IsAffected(AffectData.AffectFlags.Ghost))
                                Combat.Damage(character, character, Utility.Random(counter, 2 * counter), SkillSpell.SkillLookup("dehydration"));
                        }
                    }
                }
                else
                {
                    if (survivalist > 1) character.CheckImprove("survivalist", true, 1);
                }

            } // end !isnpc && !isimmortal

            if (character.Drunk > 0)
            {
                character.Drunk = Math.max(Math.min(character.Drunk - 3, character.Drunk / 2), 0);
                if (character.Drunk == 0)
                {
                    character.send("You are sober.\n\r");
                }
            }

        }
    }

    static UpdateItemsTick() {
        const ItemData = require("./ItemData");
        const Character = require("./Character");
        const Player = require("./Player");
        for(var item of Utility.CloneArray(ItemData.Items)) {
            if(item.Timer > 0 && --item.Timer == 0) {
                var message = "";
                if (item.ItemTypes.ISSET(ItemData.ItemTypes.Fountain))
                {
                    message = "$p dries up.";
                }
                else if (item.ItemTypes.ISSET(ItemData.ItemTypes.Corpse) || item.ItemTypes.ISSET(ItemData.ItemTypes.NPCCorpse))
                {
                    message = "$p decays into dust.";
                }
                else if (item.ItemTypes.ISSET(ItemData.ItemTypes.Food))
                {
                    message = "$p decomposes.";
                }
                else if (item.ItemTypes.ISSET(ItemData.ItemTypes.Potion))
                {
                    message = "$p has evaporated from disuse.";
                }
                else if (item.ItemTypes.ISSET(ItemData.ItemTypes.Portal))
                {
                    message = "$p fades out of existence.";
                }
                else
                {
                    message = "$p crumbles into dust.";
                }

                if (item.CarriedBy)
                {
                    if (item.CarriedBy.IsNPC
                        && item.CarriedBy.IsShop)
                        item.CarriedBy.Gold += item.Value / 5;
                    else
                    {
                        item.CarriedBy.Act(message, null, item, null, Character.ActType.ToChar);
                    }
                }
                else if (item.Room != null && item.Room.Characters.length > 0)
                {
                    item.Room.Characters[0].Act(message, null, item, null, Character.ActType.ToRoom);
                    item.Room.Characters[0].Act(message, null, item, null, Character.ActType.ToChar);
                } 

                if (item.Contains.length > 0)
                {
                    if (item.CarriedBy != null)
                    {
                        for (var contained of Utility.CloneArray(item.Contains))
                        {
                            item.Contains.Remove(contained);
                            item.CarriedBy.AddInventoryItem(contained);
                        }
                    }
                    else if (item.Room != null)
                    {
                        if (item.ItemTypes.ISSET(ItemData.ItemTypes.Corpse))
                        {
                            var owner = Player.Players.FirstOrDefault((player) => player.Name == item.Owner);

                            if (owner && owner.status == "Playing")
                            {

                                for (var contained of Utility.CloneArray(item.Contains))
                                {
                                    item.Contains.Remove(contained);
                                    owner.Act("$p appears in your hands.", null, contained, null, Character.ActType.ToChar);
                                    owner.Act("$p appears in $n's hands.", null, contained, null, Character.ActType.ToRoom);
                                    owner.AddInventoryItem(contained);
                                    contained.CarriedBy = owner;
                                    contained.Container = null;
                                }
                            }
                            else
                            {
                                var recallroom = null;
                                var pit;
                                if (item.Alignment == Alignment.Good)
                                {
                                    recallroom = RoomData.Rooms[19089];
                                }
                                else if (item.Alignment == Alignment.Evil)
                                {
                                    recallroom = RoomData.Rooms[19090];
                                }
                                else
                                {
                                    recallroom = RoomData.Rooms[19001];
                                }

                                //var recallroom = 
                                if (recallroom)
                                {
                                    pit = recallroom.Items.FirstOrDefault((obj) => obj.VNum == 19000);

                                    if (pit)
                                    {
                                        for (var contained of Utility.CloneArray(item.Contains))
                                        {
                                            item.Contains.Remove(contained);
                                            pit.Contains.unshift(contained);

                                            contained.Container = pit;
                                        }
                                    }
                                    else
                                        Game.DumpItems(item);
                                }
                                else
                                    Game.DumpItems(item);
                            }
                        }
                        else
                        {
                            Game.DumpItems(item);
                        }
                    }
                    else if (item.Container != null)
                    {
                        for(var contained of Utility.CloneArray(item.Contains))
                        {
                            item.Contains.Remove(contained);
                            item.Container.Contains.unshift(contained);
                            contained.Container = item.Container;
                        }
                    }
                }

                item.Dispose();
            }
        }
    }

    static CheckTrackAggro(character) {
        const Combat = require("./Combat");
        const AffectData = require("./AffectData");
        const Character = require("./Character");
        if (character.IsNPC &&
            !character.Fighting && 
            character.IsAwake &&
            !character.IsAffected(AffectData.AffectFlags.Calm) &&
            !((character.Flags.ISSET(Character.ActFlags.Wimpy) && character.HitPoints < character.MaxHitPoints / 5)) &&
            character.LastFighting.Room == character.Room && 
            character.CanSee(character.LastFighting) && 
            !character.LastFighting.IsAffected(AffectData.AffectFlags.PlayDead) && 
            !character.LastFighting.IsAffected(AffectData.AffectFlags.Ghost))
        {
            character.Act("$n screams and attacks YOU!", character.LastFighting, null, null, Character.ActType.ToVictim);
            character.Act("$n screams and attacks $N!", character.LastFighting, Character.ActType.ToRoomNotVictim);

            //aggressor.LastFighting = null;
            character.Fighting = character.LastFighting;
            Combat.ExecuteRound(character);
        }
    }

    static TrackOnce(character) {
        const Character = require("./Character");
        var exit;
        if(character.IsNPC && character.Fighting == null) {
            var trackAffect = character.Room.Affects.FirstOrDefault(aff => aff.SkillSpell && aff.SkillSpell.Name == "track" && aff.OwnerName == character.LastFighting.Name);
            if (trackAffect &&
                (exit = character.Room.Exits[trackAffect.Modifier]) &&
                exit.Destination  &&
                (!character.Flags.ISSET(Character.ActFlags.StayArea) || exit.Destination.Area == character.Room.Area))
            {
                character.Act("$n checks the ground for tracks.", null, null, null, Character.ActType.ToRoom);
                Character.Move(character, trackAffect.Modifier);

                Game.CheckTrackAggro(character);
            }
        }
    }

    static UpdateTrack() {
        const Character = require("./Character");

        for(var character of Utility.CloneArray(Character.Characters)) { 
            if (character.IsNPC && 
                character.LastFighting && 
                character.Position == "Standing" && 
                character.Fighting == null && 
                !character.Flags.ISSET(Character.ActFlags.Sentinel))
            {
                Game.TrackOnce(character);
                Game.TrackOnce(character);
            }
        }
    }
    static #lasthour = 0;
    static UpdateWeather() {
        const TimeInfo = require('./TimeInfo');
        const WeatherInfo = require('./WeatherInfo');

        var buf = "";
        var diff = 0;

        if (Game.#lasthour != TimeInfo.Hour)
            switch (TimeInfo.Hour)
            {
                case 5:
                    buf += "The day has begun.\n\r";
                    break;

                case 6:
                    buf += "The sun rises in the east.\n\r";
                    break;

                case 19:
                    buf += "The sun slowly disappears in the west.\n\r";
                    break;

                case 20:
                    buf += "The night has begun.\n\r";
                    break;
            }

            Game.#lasthour = TimeInfo.Hour;

        /*
        * Weather change.
        */
        if (TimeInfo.Month >= 9 && TimeInfo.Month <= 16)
            diff = WeatherInfo.mmhg > 985 ? -2 : 2;
        else
            diff = WeatherInfo.mmhg > 1015 ? -2 : 2;

        WeatherInfo.change += diff * Utility.Roll([1, 4, 0]) + Utility.Roll([2, 6, 0]) - Utility.Roll([2, 6, 0]);
        WeatherInfo.change = Math.max(WeatherInfo.change, -12);
        WeatherInfo.change = Math.min(WeatherInfo.change, 12);

        WeatherInfo.mmhg += WeatherInfo.change;
        WeatherInfo.mmhg = Math.max(WeatherInfo.mmhg, 960);
        WeatherInfo.mmhg = Math.min(WeatherInfo.mmhg, 1040);

        switch (WeatherInfo.Sky)
        {
            default:
                console.log("Weather_update: bad sky " + WeatherInfo.Sky + ".");
                WeatherInfo.Sky = "Cloudless";
                break;

            case "Cloudless":
                if (WeatherInfo.mmhg < 990
                    || (WeatherInfo.mmhg < 1010 && Utility.Random(0, 2) == 0))
                {
                    buf += "The sky is getting cloudy.\n\r";
                    WeatherInfo.Sky = "Cloudy";
                }
                break;

            case "Cloudy":
                if (WeatherInfo.mmhg < 970
                    || (WeatherInfo.mmhg < 990 && Utility.Random(0, 2) == 0))
                {
                    buf += "It starts to rain.\n\r";
                    WeatherInfo.Sky = WeatherInfo.SkyStates.Raining;
                }

                if (WeatherInfo.mmhg > 1030 && Utility.Random(0, 2) == 0)
                {
                    buf += "The clouds disappear.\n\r";
                    WeatherInfo.Sky = WeatherInfo.SkyStates.Cloudless;
                }
                break;

            case "Raining":
                if (WeatherInfo.mmhg < 970 && Utility.Random(0, 2) == 0)
                {
                    buf += "Lightning flashes in the sky.\n\r";
                    WeatherInfo.Sky = WeatherInfo.SkyStates.Lightning;
                }

                if (WeatherInfo.mmhg > 1030
                    || (WeatherInfo.mmhg > 1010 && Utility.Random(0, 2) == 0))
                {
                    buf += "The rain stopped.\n\r";
                    WeatherInfo.Sky = WeatherInfo.SkyStates.Cloudy;
                }
                break;

            case "Lightning":
                if (WeatherInfo.mmhg > 1010
                    || (WeatherInfo.mmhg > 990 && Utility.Random(0, 2) == 0))
                {
                    buf += "The lightning has stopped.\n\r";
                    WeatherInfo.Sky = WeatherInfo.SkyStates.Raining;
                    break;
                }
                break;
        }

        if (buf.length > 0)
        {
            const Player = require("./Player");
            for (var player of Player.Players)
            {
                if (player.status == "Playing"
                    && player.IsOutside
                    && player.IsAwake)
                    player.send(buf);
            }
        }

        return;
    }
}

module.exports = Game;