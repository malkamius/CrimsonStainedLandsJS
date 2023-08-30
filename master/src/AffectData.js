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
    DamageTypes = {};
    Level = 0;
    Duration = 0;
    Frequency = "Tick";
    Location = "None";
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
    //ExtraState = "";

    constructor(params) {
        
        if(params && params.AffectData) {
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
            this.DamageTypes = params.AffectData.DamageTypes.Clone();
            this.Flags = params.AffectData.Flags.Clone(); //Utility.CloneArray(params.AffectData.Flags);
            //this.ExtraState = params.AffectData.ExtraState;
         } else if(params && params.Xml) {
            this.OwnerName = XmlHelper.GetAttributeValue(params.Xml,"OwnerName");
            this.Name = XmlHelper.GetAttributeValue(params.Xml,"Name");
            this.DisplayName = XmlHelper.GetAttributeValue("DisplayName");
            this.Where = XmlHelper.GetAttributeValue(params.Xml,"Where");
            this.Level = XmlHelper.GetAttributeValue(params.Xml,"Level");
            this.Duration = XmlHelper.GetAttributeValueInt(params.Xml,"Duration");
            this.Frequency = XmlHelper.GetAttributeValue(params.Xml,"Frequency");
            this.Location = XmlHelper.GetAttributeValue(params.Xml, "Location");
            this.Modifier = XmlHelper.GetAttributeValue(params.Xml, "Modifier");
            this.Hidden = Utility.Compare(XmlHelper.GetAttributeValue(params.Xml, "Hidden"), "True");
            this.AffectType = XmlHelper.GetAttributeValue(params.Xml, "AffectType");
            //this.SkillSpell = XmlHelper.GetAttributeValue(xml, "SkillSpell");
            this.EndMessage = XmlHelper.GetAttributeValue(params.Xml, "EndMessage");
            this.EndMessageToRoom = XmlHelper.GetAttributeValue(params.Xml, "EndMessageToRoom");
            this.BeginMessage = XmlHelper.GetAttributeValue(params.Xml, "BeginMessage");
            this.BeginMessageToRoom = XmlHelper.GetAttributeValue(params.Xml, "BeginMessageToRoom");
            this.TickProgram = XmlHelper.GetAttributeValue(params.Xml, "TickProgram");
            this.EndProgram = XmlHelper.GetAttributeValue(params.Xml, "EndProgram");
            //var dtypes = {};
            Utility.ParseFlags(this.DamageTypes, XmlHelper.GetAttributeValue(params.Xml, "DamageTypes"));
            //for(var dtype in dtypes)
            //    this.DamageTypes.push(dtype);
            Utility.ParseFlags(this.Flags, XmlHelper.GetAttributeValue(params.Xml, "Flags"));

            //this.ExtraState = params.Xml.EXTRASTATE; //XmlHelper.GetElementValue("ExtraState");
         }
    }

    Element(ele) {
        var AffectElement = ele.ele("Affect");
        if(this.OwnerName)
            AffectElement.attribute("OwnerName", this.OwnerName);
        if(this.Name)
            AffectElement.attribute("Name", this.Name);
        if(this.DisplayName)
            AffectElement.attribute("DisplayName", this.DisplayName);
    
        AffectElement.attribute("Where", this.Where);
        AffectElement.attribute("Level", this.Level);
        AffectElement.attribute("Duration", this.Duration);
        AffectElement.attribute("Frequency", this.Frequency);
        AffectElement.attribute("Location", this.Location);
        AffectElement.attribute("Modifier", this.Modifier);
        AffectElement.attribute("Hidden", this.Hidden);
        AffectElement.attribute("AffectType", this.AffectType);
        if(this.EndMessage)
            AffectElement.attribute("EndMessage", this.EndMessage);
        if(this.EndMessageToRoom)
            AffectElement.attribute("EndMessageToRoom", this.EndMessageToRoom);
        if(this.BeginMessage)
            AffectElement.attribute("BeginMessage", this.BeginMessage);
        if(this.BeginMessageToRoom)
            AffectElement.attribute("BeginMessageToRoom", this.BeginMessageToRoom);
        if(this.TickProgram)
            AffectElement.attribute("TickProgram", this.TickProgram);
        if(this.EndProgram)
            AffectElement.attribute("EndProgram", this.EndProgram);
        if(this.DamageTypes && this.DamageTypes.length > 0)
            AffectElement.attribute("DamageTypes", Utility.JoinArray(this.DamageTypes));
        if(Object.keys(this.Flags) > 0)
            AffectElement.attribute("Flags", Utility.JoinFlags(this.Flags));
        //AffectElement.ele("ExtraState", this.ExtraState);

        return AffectElement;
    }
}

module.exports = AffectData;