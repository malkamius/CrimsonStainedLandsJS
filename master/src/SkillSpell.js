const fs = require("fs");
const xml2js = require('xml2js');
const Settings = require("./Settings");
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility");

const parser = new xml2js.Parser({ strict: false, trim: false });

class SkillSpell {
    static Skills = {};
    
    Name = "";
    LearnedLevel = {};
    Rating = {};
    GuildPreRequisiteSkill = {};
    GuildPreRequisiteSkillPercentage = {};
    SpellFuncType = "";
    SpellFuncName = "";
    TickFunction = null;
    EndFunction = null;
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

    constructor(xml) {
        this.Name = XmlHelper.GetAttributeValue(xml, "Name");
        
        this.MinimumPosition = XmlHelper.GetAttributeValue(xml, "MinimumPosition");
        this.MinmumMana = XmlHelper.GetAttributeValueInt(xml, "MinmumMana");
        this.WaitTime = XmlHelper.GetAttributeValueInt(xml, "WaitTime");
        this.NounDamage = XmlHelper.GetAttributeValue(xml, "NounDamage");
        this.AutoCast = Utility.Compare(XmlHelper.GetAttributeValue(xml, "AutoCast"), "True");
        this.SpellFuncType = XmlHelper.GetAttributeValue(xml, "SpellFuncType");
        this.SpellFuncName = XmlHelper.GetAttributeValue(xml, "SpellFuncName");
        this.Lyrics = XmlHelper.GetElementValue(xml, "Lyrics");
        Utility.ParseFlags(this.SkillTypes, XmlHelper.GetAttributeValue(xml, "SkillTypes"));
        if(xml.SKILLLEVEL) {
            for(const skilllevel of xml.SKILLLEVEL) {
                var guild = XmlHelper.GetAttributeValue(skilllevel, "Guild").toLowerCase();
                this.LearnedLevel[guild] = XmlHelper.GetAttributeValueInt(skilllevel, "Level");
                this.Rating[guild] = XmlHelper.GetAttributeValueInt(skilllevel, "Rating");
                var prerequisiteskills = XmlHelper.GetAttributeValue(skilllevel, "Prerequisites");
                var prerequisitepercentage = XmlHelper.GetAttributeValueInt(skilllevel, "PrerequisitePercentage");
                var percentage = parseInt(prerequisitepercentage);

                while(!Utility.IsNullOrEmpty(prerequisiteskills)) {
                    var args = Utility.OneArgument(prerequisiteskills);
                    prerequisiteskills = args[1];
                    args[0] = args[0].toLowerCase();
                    this.GuildPreRequisiteSkill[args[0]] = args[0];
                    this.GuildPreRequisiteSkillPercentage[args[0]] = percentage;
                }
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

    GetManaCost(ch)
    {
        if (ch.Guild && this.SkillLevel[ch.Guild.Name] && ch.Level + 2 <= this.SkillLevel[ch.Guild.Name])
            return 50;
        else if (ch.Guild != null && this.SkillLevel[ch.Guild.Name])
            return Math.max(
            this.MinimumMana,
            100 / (2 + ch.Level - this.SkillLevel[ch.Guild.Name]));
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
        if (ch.IsImmortal() || ch.IsNPC) return true;

        prereqs = this.Prerequisites;
        prereq = "";
        while (prereqs.length > 0)
        {
            var args = Utility.OneArgument(prereqs);
            prereqlist = args[0];
            prereqs = args[1];
            var skill = SkillSpell.GetSkill(prereq);
            var learned;
            if ((learned = ch.Learned[skill]) && learned.Percent >= this.PrerequisitePercentage)
                continue;
            else
            {
                return false;
            }
        }

        if (ch.Guild && this.GuildPreRequisiteSkill[ch.Guild.Name] && this.GuildPreRequisiteSkillPercentage[ch.Guild.Name] && !!Utility.IsNullOrEmpty(GuildPreRequisiteSkill[ch.Guild.Name]))
        {
            prereqs = this.GuildPreRequisiteSkill[ch.Guild.Name];

            if (prereqs.includes("|"))
            {
                var prereqlist = prereqs.split('|');
                failed = 0;
                foreach (list in prereqlist)
                {
                    prereqs = list;
                    failthis = false;
                    while (prereqs.Length > 0)
                    {
                        var args = Utility.OneArgument(prereqs);
                        prereq = args[0];
                        prereqs = args[1];
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
                    var args = Utility.OneArgument(prereqs);
                    prereqlist = args[0];
                    prereqs = args[1];
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
}

module.exports = SkillSpell;