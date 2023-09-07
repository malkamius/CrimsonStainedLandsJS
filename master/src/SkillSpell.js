const fs = require("fs");
const xml2js = require('xml2js');
const Settings = require("./Settings");
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility");
const Game = require("./Game");

class SkillSpell {
    static Skills = {};
    static SkillSpellTypes = [
        "None",
        "Skill",
        "Spell",
        "Commune",
        "Power",
        "Song",
        "Form",
        "InForm",
        "WarriorSpecialization",
    ];

    static SkillSpellTypesList = {
        "None": "None",
        "Skill": "Skill",
        "Spell": "Spell",
        "Commune": "Commune",
        "Power": "Power",
        "Song": "Song",
        "Form": "Form",
        "InForm": "InForm",
        "WarriorSpecialization": "WarriorSpecialization",
    };

    static CastType =
    {
        "None" : "None",
        "Cast" : "Cast",
        "Commune" : "Commune",
        "Sing" : "Sing",
        "Invoke" : "Invoke"
    };
    static TargetTypes = {
        targetIgnore: 1,
        targetCharOffensive: 2,
        targetCharDefensive: 3,
        targetCharSelf: 4,
        targetItemInventory: 5,
        targetItemCharDef: 6,
        targetItemCharOff: 7
    }

    static TargetIsType = {
        targetChar: 1,
        targetItem: 2,
        targetRoom: 3,
        targetNone: 4
    }
    Name = "";
    LearnedLevel = {};
    Rating = {};
    GuildPreRequisiteSkill = {};
    GuildPreRequisiteSkillPercentage = {};
    SpellFuncType = "";
    SpellFuncName = "";
    SpellFun = null;
    TickFuncType = "";
    TickFuncName = "";
    TickFun = null;
    EndFuncType = "";
    EndFuncName = "";
    EndFun = null;
    TargetType = "TargetIgnore";
    MinimumPosition = "Standing";
    MinimumMana = 0;
    WaitTime = 1;
    NounDamage = "";
    MessageOn = "";
    MessageOnToRoom = "";
    MessageOff = "";
    MessageOffToRoom = "";
    MessageItem = "";
    MessageItemToRoom = "";

    AutoCastScript = "";

    Lyrics = "";

    BoolAutoCast = true;
    AutoCast = null;
    SkillTypes = {};
    Prerequisites = "";
    PrerequisitePercentage = 0;

    static LoadAll() {
        const parser = new xml2js.Parser({ strict: false, trim: false });

        var paths = [Settings.DataPath + "/skilllevels.xml", Settings.DataPath + "/songs.xml"];

        for(var path of paths) {
            var data = fs.readFileSync(path, {encoding: "ascii"});
            parser.parseString(data, function(err, xml) {
                
                if(xml.SONGS) {
                    //for(const songsxml of xml.SONGS) {
                    var songsxml = xml.SONGS;
                    if(songsxml.SONG) {
                        for(const songxml of songsxml.SONG) {
                            var skill = new SkillSpell(songxml);
                            SkillSpell.Skills[skill.Name.toLowerCase()] = skill;
                        }
                    }
                    
                }
                if(xml.SKILLLEVELS) {
                    //for(const skillsxml of xml.SKILLLEVELS) {
                    var skillsxml = xml.SKILLLEVELS;
                    if(skillsxml.SKILLSPELL) {
                        for(const skillxml of skillsxml.SKILLSPELL) {
                            var skill = new SkillSpell(skillxml);
                            SkillSpell.Skills[skill.Name.toLowerCase()] = skill;
                        }
                    }
                    
                }
                
            });
        }
    }
    static containers = {};
    constructor(xml) {
        this.Name = xml.GetAttributeValue( "Name");
        
        this.MinimumPosition = xml.GetAttributeValue( "MinimumPosition", "Standing");
        this.MinmumMana = xml.GetAttributeValueInt( "MinmumMana");
        this.WaitTime = xml.GetAttributeValueInt( "WaitTime", Game.PULSE_PER_VIOLENCE);
        this.NounDamage = xml.GetAttributeValue( "NounDamage");
        this.AutoCast = Utility.Compare(xml.GetAttributeValue( "AutoCast"), "True");
        this.SpellFuncType = xml.GetAttributeValue( "SpellFuncType");
        this.SpellFuncName = xml.GetAttributeValue( "SpellFuncName");
        this.TickFuncType = xml.GetAttributeValue( "TickFuncType");
        this.TickFuncName = xml.GetAttributeValue( "TickFuncName");
        this.EndFuncType = xml.GetAttributeValue( "EndFuncType");
        this.EndFuncName = xml.GetAttributeValue( "EndFuncName");
        this.TargetType = xml.GetAttributeValue("TargetType", "TargetIgnore");
        this.AutoCast = xml.GetAttributeValue("AutoCast").equals("true");
        this.AutoCastScript = xml.GetAttributeValue("AutoCastScript");
        
        if(!this.SpellFuncName.IsNullOrEmpty() && !this.SpellFuncType.IsNullOrEmpty()) {
            try{
                if(!SkillSpell.containers[this.SpellFuncType])
                    SkillSpell.containers[this.SpellFuncType] = require("./" + this.SpellFuncType);
                this.SpellFun = SkillSpell.containers[this.SpellFuncType][this.SpellFuncName];
            } catch(err) {
                
            }
        }
        if(!this.TickFuncName.IsNullOrEmpty() && !this.TickFuncType.IsNullOrEmpty()) {
            try{
                if(!SkillSpell.containers[this.TickFuncType])
                    SkillSpell.containers[this.TickFuncType] = require("./" + this.TickFuncType);
                this.TickFun = SkillSpell.containers[this.TickFuncType][this.TickFuncName];
            } catch(err) {
                
            }
        }
        if(!this.EndFuncName.IsNullOrEmpty() && !this.EndFuncType.IsNullOrEmpty()) {
            try{
                if(!SkillSpell.containers[this.EndFuncType])
                    SkillSpell.containers[this.EndFuncType] = require("./" + this.EndFuncType);
                this.EndFun = SkillSpell.containers[this.EndFuncType][this.EndFuncName];
            } catch(err) {
                
            }
        }
        this.Lyrics = xml.GetElementValue( "Lyrics");
        this.Prerequisites = xml.GetAttributeValue( "Prerequisites");
        this.PrerequisitePercentage = xml.GetAttributeValueInt( "PrerequisitePercentage");
        Utility.ParseFlags(this.SkillTypes, xml.GetAttributeValue( "SkillTypes"));
        if(xml.SKILLLEVEL) {
            for(const skilllevel of xml.SKILLLEVEL) {
                var guild = XmlHelper.GetAttributeValue(skilllevel, "Guild").toLowerCase();
                this.LearnedLevel[guild] = XmlHelper.GetAttributeValueInt(skilllevel, "Level");
                this.Rating[guild] = XmlHelper.GetAttributeValueInt(skilllevel, "Rating");
                var prerequisiteskills = XmlHelper.GetAttributeValue(skilllevel, "Prerequisites");
                var prerequisitepercentage = XmlHelper.GetAttributeValueInt(skilllevel, "PrerequisitePercentage");
                var percentage = parseInt(prerequisitepercentage);

                this.GuildPreRequisiteSkill[guild] = prerequisiteskills;
                this.GuildPreRequisiteSkillPercentage[guild] = percentage;
                
            }
        }
    }

    static GetSkill(name, prefix = true) {
        if(!name) return null;

        if(this.Skills[name.toLowerCase()]) return this.Skills[name];
        
        if(prefix) {
            for(var skillname in this.Skills) {
                if(Utility.Prefix(skillname, name)) {
                    return this.Skills[skillname];
                }
            }
        }
    }

    static SkillLookup(name, prefix = true) {
        return this.GetSkill(name, prefix);
    }
    GetManaCost(ch)
    {
        if (ch.Guild && this.LearnedLevel[ch.Guild.Name] && ch.Level + 2 <= this.LearnedLevel[ch.Guild.Name])
            return 50;
        else if (ch.Guild != null && this.LearnedLevel[ch.Guild.Name])
            return Math.max(
            this.MinimumMana,
            100 / (2 + ch.Level - this.LearnedLevel[ch.Guild.Name]));
        else
            return 50;
    }

    GetSkillLevel(guild)
    {
        if (guild && SkillLevel[Guild.Name])
            return SkillLevel[Guild.Name];

        return 60;
    }

    PrerequisitesMet(ch)
    {
        if (ch.IsImmortal || ch.IsNPC) return true;

        var prereqs = this.Prerequisites;
        var prereq = "";
        //if(this.Name == "flurry") console.log(`${prereqs} ${this.PrerequisitePercentage}`);
        while (prereqs.length > 0)
        {
            [prereq, prereqs] = prereqs.oneArgument();
            
            var skill = SkillSpell.GetSkill(prereq);
            var learned;
            if ((learned = ch.Learned[skill.Name]) && learned.Percent >= this.PrerequisitePercentage)
                continue;
            else
            {
                return false;
            }
        }
       
        if (ch.Guild && this.GuildPreRequisiteSkill[ch.Guild.Name] && 
            this.GuildPreRequisiteSkillPercentage[ch.Guild.Name] && 
            !Utility.IsNullOrEmpty(this.GuildPreRequisiteSkill[ch.Guild.Name]))
        {
            prereqs = this.GuildPreRequisiteSkill[ch.Guild.Name];
            
            if (prereqs.includes("|"))
            {
                var prereqlist = prereqs.split('|');
                var failed = 0;
                for (var list of prereqlist)
                {
                    prereqs = list;
                    var failthis = false;
                    while (prereqs.length > 0)
                    {
                        [prereq, prereqs] = prereqs.oneArgument();
                        
                        var learned;
                        
                        if ((learned = ch.Learned[prereq.toLowerCase()]) && learned.Percent >= this.GuildPreRequisiteSkillPercentage[ch.Guild.Name])
                            continue;
                        else
                        {
                            failthis = true;
                            break;
                        }
                    }
                    if (failthis) failed++;

                }
                
                if (failed == prereqlist.length) return false;
            }
            else
            {
                while (prereqs.length > 0)
                {
                    var skill;
                    [skill, prereqs] = prereqs.oneArgument();
                    
                    var learned;
                    
                    if ((learned = ch.Learned[skill]) && learned.Percent >= this.GuildPreRequisiteSkillPercentage[ch.Guild.Name])
                        continue;
                    else
                    {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    static FindSpell(ch, name)
    {
        var results = Array();
        for(var skillentry in SkillSpell.Skills) {
            var tempskill = SkillSpell.Skills[skillentry];
            if (((tempskill.SkillTypes.IsSet("Skill") ||
            tempskill.SkillTypes.IsSet("Spell") ||
            tempskill.SkillTypes.IsSet("Supplication") ||
            tempskill.SkillTypes.IsSet("Song") ||
            (tempskill.SkillTypes.IsSet("InForm"))) && tempskill.SpellFun)
            && tempskill.Name.prefix(name)
            && (ch.Level >= ch.GetLevelSkillLearnedAt(tempskill) && ch.GetSkillPercentage(tempskill) >= 1)
            ) {
                results.push(tempskill);
            }
        }
        if(results.length > 0) {
        results.sort(function (sk1, sk2) {
             var lvl1 = ch.GetLevelSkillLearnedAt(sk1);
             var lvl2 = ch.GetLevelSkillLearnedAt(sk2);
             return lvl1 < lvl2? -1 : lvl1 > lvl2? 1 : 0;
            });
        
        return results[0];
        } else return null;
    }

    static GetWeaponSkill(item) {
        return SkillSpell.GetSkill(item.WeaponType);
    }
}

module.exports = SkillSpell;