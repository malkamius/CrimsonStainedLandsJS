const NPCTemplateData = require("./NPCTemplateData");

Character = require("./Character");
Color = require("./Color");

class NPCData extends Character {
  constructor(vnum, room, xml) {
	super();
	
	if(!NPCTemplateData.NPCTemplates) {
		Character.Characters.splice(Character.Characters.indexOf(this), 1);
		return;
	}
	var template = NPCTemplateData.NPCTemplates[vnum];

	if(!template) {
  		Character.Characters.splice(Character.Characters.indexOf(this), 1);
	} else {
		this.name = template.name;
		this.ShortDerscription = template.ShortDerscription;
		this.LongDescription = template.LongDescription;
		this.Description = template.Description;
		this.AddCharacterToRoom(room);
	}

  }

}

module.exports = NPCData;