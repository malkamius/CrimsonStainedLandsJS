const fs = require('fs');
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility")
const Settings = require("./Settings");

class Social {
    static Socials = {};

    Name = "";
    CharNoArg = "";
    OthersNoArg = "";
    CharFound = "";
    OthersFound = "";
    VictimFound = "";
    CharNotFound = "";

    constructor(name, charnoarg, othersnoarg, charfound, othersfound, victimfound, charnotfound, charauto, othersauto) {
        this.Name = name;
        this.CharNoArg = charnoarg;
        this.OthersNoArg = othersnoarg;
        this.CharFound = charfound;
        this.OthersFound = othersfound;
        this.VictimFound = victimfound;
        this.CharNotFound = charnotfound;
        this.CharAuto = charauto;
        this.OthersAuto = othersauto;
    }

    static Load() {
        var content = fs.readFileSync(Settings.DataPath + "/socials.xml", "ascii");
        var xml = content.ParseXml();

        if(xml.SOCIALS && xml.SOCIALS.SOCIAL)
        {
            for(var socialxml of xml.SOCIALS.SOCIAL) {
                var social = new Social(socialxml.GetAttributeValue("Keyword"),
                socialxml.GetAttributeValue("CharNoArg"),
                socialxml.GetAttributeValue("OthersNoArg"),
                socialxml.GetAttributeValue("CharFound"),
                socialxml.GetAttributeValue("OthersFound"),
                socialxml.GetAttributeValue("VictimFound"),
                socialxml.GetAttributeValue("CharNotFound"),
                socialxml.GetAttributeValue("CharAuto"),
                socialxml.GetAttributeValue("OthersAuto"),
                );
                Social.Socials[social.Name] = social;
            }
        }
    }
}

module.exports = Social;