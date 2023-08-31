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
		template.ResetCount++;
		this.Template = template;
		this.VNum = VNum;
		this.Name = template.Name;
		this.ShortDescription = template.ShortDescription;
		this.LongDescription = template.LongDescription;
		this.Description = template.Description;
		this.Race = template.Race;
		this.MaxHitPoints = Utility.Roll(template.HitPointDice); 
		this.HitPoints = this.MaxHitPoints;
		this.MaxManaPoints = Utility.Roll(template.ManaPointDice); 
		this.ManaPoints = this.MaxManaPoints;
		this.MovementPoints = 100;
		this.WeaponDamageMessage = template.WeaponDamageMessage;
		this.Guild = template.Guild;
		this.Level = template.Level;
		const SkillSpell = require("./SkillSpell");
		if(this.Guild) {
			for(var skillname in SkillSpell.Skills)
			{
				var skill = SkillSpell.Skills[skillname];
				var percent = this.GetSkillPercentage(skill.Name);
				var lvl = this.GetLevelSkillLearnedAt(skill.Name);
				var learnastype = {Skill: true};
				if(skill.SkillTypes["Skill"]) learnastype = {Skill: true};
				else if(skill.SkillTypes["Supplication"] && this.Guild.CastType == "Commune") learnastype = {Supplication: true};
				else if(skill.SkillTypes["Spell"] && this.Guild.CastType == "Cast") learnastype = {Spell: true};
				else if(skill.SkillTypes["Song"] && this.Guild.CastType == "Sing") learnastype = {Song: true};

				if (lvl <= this.Level && (!this.Learned[skill.Name] || this.Learned[skill.Name].Percent <= 1)) 
				{
					this.Learned[skill.Name] = {Name: skill.Name, Percent: 80, Level: lvl, LearnedAs: learnastype};
				}
				
			}
		}

		this.DamageDice = Utility.CloneArray(template.DamageDice);
		this.Flags = Utility.CloneArray(template.Flags);
		
		this.AddCharacterToRoom(room);
	}

  }

}

NPCData.ItemFunctions = Character.ItemFunctions;
module.exports = NPCData;