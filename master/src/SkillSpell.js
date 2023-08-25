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
    SkillTypes = ["Skill"];
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
                        }
                    }
                    
                }
                if(xml.SKILLLEVELS) {
                    //for(const skillsxml of xml.SKILLLEVELS) {
                    var skillsxml = xml.SKILLLEVELS;
                    if(skillsxml.SKILLSPELL) {
                        for(const skillxml of skillsxml.SKILLSPELL) {
                            var skill = new SkillSpell(skillxml);
                        }
                    }
                    
                }
                SkillSpell.Skills[skill.Name] = skill;
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
        
        if(xml.SKILLLEVEL) {
            for(const skilllevel of xml.SKILLLEVEL) {
                var guild = XmlHelper.GetAttributeValue(skilllevel, "Guild");
                this.LearnedLevel[guild] = XmlHelper.GetAttributeValue(skilllevel, "Level");
                this.Rating[guild] = XmlHelper.GetAttributeValue(skilllevel, "Rating");
                var prerequisiteskills = XmlHelper.GetAttributeValue(skilllevel, "Prerequisites");
                var prerequisitepercentage = XmlHelper.GetAttributeValue(skilllevel, "PrerequisitePercentage");
                var percentage = parseInt(prerequisitepercentage);

                while(!Utility.IsNullOrEmpty(prerequisiteskills)) {
                    var args = Utility.OneArgument(prerequisiteskills);
                    prerequisiteskills = args[1];
                    
                    this.GuildPreRequisiteSkill[args[0]] = args[0];
                    this.GuildPreRequisiteSkillPercentage[args[0]] = percentage;
                }
            }
        }
    }
}

module.exports = SkillSpell;