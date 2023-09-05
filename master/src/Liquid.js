const fs = require('fs');

const Settings = require('./Settings');

class Liquid {
    static Liquids = [];
    Name = "";
    Color = "";
    Proof = 0;
    Full = 0;
    Thirst = 4;
    Food = 0;
    ServingSize = 2;

    constructor(xml) {
        const Utility = require("./Utility");
        const XmlHelper = require("./XmlHelper");
        this.Name = xml.GetAttributeValue("Name");
        this.Color = xml.GetAttributeValue("Color");
        this.Proof = xml.GetAttributeValueInt("Proof");
        this.Full = xml.GetAttributeValueInt("Full");
        this.Thirst = xml.GetAttributeValueInt("Thirst");
        this.Food = xml.GetAttributeValueInt("Food");
        this.ServingSize = xml.GetAttributeValueInt("SSize");
    }

    static Load() {
        var path = Settings.DataPath + "/liquids.xml";
        var content = fs.readFileSync(path, "utf-8");
        const Utility = require("./Utility");
        var xml = content.ParseXml();
        if(xml.LIQUIDS && xml.LIQUIDS.LIQUID)
            for(var liquidxml of xml.LIQUIDS.LIQUID) {
                var liquid = new Liquid(liquidxml);
                Liquid.Liquids.push(liquid);
            }
    }
}

module.exports = Liquid;