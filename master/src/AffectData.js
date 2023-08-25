const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility");

/**
 *
 *
 * @class AffectData
 */
class AffectData {
    OwnerName = "";
    Name = "";
    DisplayName = "";
    Where = "";
    DamageTypes = Array();
    Level = 0;
    Duration = 0;
    Frequency = "";
    Location = "";
    Flags = {};
    Modifier = 0;
    Hidden = false;
    AffectType = "Spell";
    SkillSpell = null;
    EndMessage = "";
    EndMessageToRoom = "";
    BeginMessage = "";
    BeginMessageToRoom = "";
    TickProgram = "";
    EndProgram = "";

    constructor(params) {
        if(params.AffectData) {
            this.OwnerName = params.AffectData.OwnerName;
            this.Name = params.AffectData.Name;
            this.DisplayName = params.AffectData.DisplayName;
            this.Where = params.AffectData.Where;
            this.Level = params.AffectData.Level;
            this.Duration = params.AffectData.Duration;
            this.Frequency = params.AffectData.Frequency;
            this.Location = params.AffectData.Location;
            this.Modifier = params.AffectData.Modifier;
            this.Hidden = params.AffectData.Hidden;
            this.AffectType = params.AffectData.AffectType;
            this.SkillSpell = params.AffectData.SkillSpell;
            this.EndMessage = params.AffectData.EndMessage;
            this.EndMessageToRoom = params.AffectData.EndMessageToRoom;
            this.BeginMessage = params.AffectData.BeginMessage;
            this.BeginMessageToRoom = params.AffectData.BeginMessageToRoom;
            this.TickProgram = params.AffectData.TickProgram;
            this.EndProgram = params.AffectData.EndProgram;
            this.DamageTypes = Utility.CloneArray(params.AffectData.DamageTypes);
            this.Flags = Utility.CloneArray(params.AffectData.Flags);
         } else if(params.Xml) {
            this.OwnerName = XmlHelper.GetAttributeValue("OwnerName");
            this.Name = XmlHelper.GetAttributeValue("Name");
            this.DisplayName = XmlHelper.GetAttributeValue("DisplayName");
            this.Where = XmlHelper.GetAttributeValue("Where");
            this.Level = XmlHelper.GetAttributeValue("Level");
            this.Duration = XmlHelper.GetAttributeValueInt("Duration");
            this.Frequency = XmlHelper.GetAttributeValue("Frequency");
            this.Location = XmlHelper.GetAttributeValue(xml, "Location");
            this.Modifier = XmlHelper.GetAttributeValue(xml, "Modifier");
            this.Hidden = XmlHelper.GetAttributeValue(xml, "Hidden");
            this.AffectType = XmlHelper.GetAttributeValue(xml, "AffectType");
            //this.SkillSpell = XmlHelper.GetAttributeValue(xml, "SkillSpell");
            this.EndMessage = XmlHelper.GetAttributeValue(xml, "EndMessage");
            this.EndMessageToRoom = XmlHelper.GetAttributeValue(xml, "EndMessageToRoom");
            this.BeginMessage = XmlHelper.GetAttributeValue(xml, "BeginMessage");
            this.BeginMessageToRoom = XmlHelper.GetAttributeValue(xml, "BeginMessageToRoom");
            this.TickProgram = XmlHelper.GetAttributeValue(xml, "TickProgram");
            this.EndProgram = XmlHelper.GetAttributeValue(xml, "EndProgram");
            var dtypes = {};
            Utility.ParseFlags(dtypes, XmlHelper.GetAttributeValue(xml, "DamageTypes"));
            for(var dtype in dtypes)
                this.DamageTypes.push(dtype);
            Utility.ParseFlags(this.Flags, XmlHelper.GetAttributeValue(xml, "DamageTypes"));
            this.Flags = Utility.CloneArray(params.AffectData.Flags);
         }
    }
}

exports.module = AffectData;