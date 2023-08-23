Character = require("./Character");
XmlHelper = require("./XmlHelper");
NPCTemplates = {};

class NPCTemplateData extends Character {
  constructor(area, xml) {
    super();
    this.vnum = XmlHelper.GetElementValue(xml, "vnum");
    this.name = XmlHelper.GetElementValue(xml, "Name");
    this.ShortDescription = XmlHelper.GetElementValue(xml, "ShortDescription");
    this.LongDescription = XmlHelper.GetElementValue(xml, "LongDescription");

    if(!area.NPCTemplates[this.vnum])
      area.NPCTemplates[this.vnum] = this;
    else
      console.log(`NPCTemplate ${this.vnum} already exists in area ${this.name}.`);

    if(!NPCTemplates[this.vnum])
      NPCTemplates[this.vnum] = this;
    else
      console.log(`NPCTemplate ${this.vnum} already exists.`);
  }
}

NPCTemplateData.NPCTemplates = this.NPCTemplates;
module.exports = NPCTemplateData;
module.exports.NPCTemplates = NPCTemplates;