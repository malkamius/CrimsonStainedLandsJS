const fs = require('fs');

const Settings = require("./Settings");

class SkillGroup {
    static Groups = {}
    Name = "";
    Skills = "";
    
    constructor(xml) {
        const XmlHelper = require("./XmlHelper");
        this.Name = xml.GetAttributeValue("Name").toLowerCase();
        this.Skills = xml.GetAttributeValue("Skills");
    }

    static Load() {
        var path = Settings.DataPath + "/skillGroups.xml";
        var content = fs.readFileSync(path, "utf-8");
        const Utility = require("./Utility");
        var xml = content.ParseXml();
        if(xml.GROUPS && xml.GROUPS.GROUP)
            for(var groupxml of xml.GROUPS.GROUP) {
                var skillgroup = new SkillGroup(groupxml);
                SkillGroup.Groups[skillgroup.Name] = skillgroup;
            }
    };

    static Lookup(name) {
        return SkillGroup.Groups[name.toLowerCase()];
    };
    
}

module.exports = SkillGroup;