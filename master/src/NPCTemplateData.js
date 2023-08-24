Character = require("./Character");
XmlHelper = require("./XmlHelper");
NPCTemplates = {};

class NPCTemplateData extends Character {
  constructor(area, xml) {
    super();
    this.VNum = XmlHelper.GetElementValue(xml, "vnum");
    this.Name = XmlHelper.GetElementValue(xml, "Name");
    this.ShortDescription = XmlHelper.GetElementValue(xml, "ShortDescription");
    this.LongDescription = XmlHelper.GetElementValue(xml, "LongDescription");

    if(!area.NPCTemplates[this.VNum])
      area.NPCTemplates[this.VNum] = this;
    else
      console.log(`NPCTemplate ${this.VNum} already exists in area ${this.Name}.`);

    if(!NPCTemplates[this.VNum])
      NPCTemplates[this.VNum] = this;
    else
      console.log(`NPCTemplate ${this.VNum} already exists.`);
  }
}

NPCTemplateData.NPCTemplates = this.NPCTemplates;
module.exports = NPCTemplateData;
module.exports.NPCTemplates = NPCTemplates;