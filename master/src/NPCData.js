const NPCTemplateData = require("./NPCTemplateData");
const Utility = require("./Utility");
const Character = require("./Character");
const Color = require("./Color");

class NPCData extends Character {
  constructor(VNum, room, xml) {
	super();
	
	if(!NPCTemplateData.NPCTemplates) {
		Character.Characters.splice(Character.Characters.indexOf(this), 1);
		return;
	}
	var template = NPCTemplateData.NPCTemplates[VNum];

	if(!template) {
  		Character.Characters.splice(Character.Characters.indexOf(this), 1);
	} else {
		this.Name = template.Name;
		this.ShortDescription = template.ShortDescription;
		this.LongDescription = template.LongDescription;
		this.Description = template.Description;
		this.MaxHitPoints = Utility.Roll(template.HitPointDice); 
		this.HitPoints = this.MaxHitPoints;
		this.AddCharacterToRoom(room);
	}

  }

}

NPCData.ItemFunctions = Character.ItemFunctions;
module.exports = NPCData;