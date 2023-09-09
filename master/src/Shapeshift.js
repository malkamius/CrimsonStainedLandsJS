const fs = require('fs');
const XmlHelper = require("./XmlHelper");
const Utility = require("./Utility")
const Settings = require("./Settings");
const SkillSpell = require("./SkillSpell");

class ShapeshiftForm {
    static Forms = [];
    static FormType = {
        "None": "None",
        "Offense": "Offense",
        "Defense": "Defense",
        "Utility": "Utility",
        "Air": "Air",
        "Water": "Water",
        "Offenseive": "Offense",
        "Defenseive": "Defense"
    }

    static FormTier = {
        "Tier1": "Tier1",
        "Tier2": "Tier2",
        "Tier3": "Tier3",
        "Tier4": "Tier4"
    }

    static FormTiers = [
        ShapeshiftForm.FormTier.Tier1, 
        ShapeshiftForm.FormTier.Tier2, 
        ShapeshiftForm.FormTier.Tier3, 
        ShapeshiftForm.FormTier.Tier4 ];
 
    static Load() {
        var path = Settings.DataPath + "/shapeshiftforms.xml";
        var contents = fs.readFileSync(path, "ascii");
        var xml = contents.ParseXml();

        if(xml.SHAPESHIFTFORMS && xml.SHAPESHIFTFORMS.FORM) {
            for(var formxml of xml.SHAPESHIFTFORMS.FORM) {
                var form = new ShapeshiftForm(formxml);
                ShapeshiftForm.Forms.push(form);
            }
        }
    }

    Name = "";
    Tier = ShapeshiftForm.FormTier.Tier1;
    Type = ShapeshiftForm.FormType.Defense;
    FormSkill = "";
    ShortDescription = "";
    LongDescription = "";
    Description = "";
    Yell = "";
    AffectedBy = {};
    AttacksPerRound = 1;
    DamageRoll = 0;
    HitRoll = 0;
    DamageDice = [];
    DamageReduction = 125;
    DamageMessage = "bite";
    SavesSpell = 15;
    ArmorBash = 0;
    ArmorSlash = 0;
    ArmorPierce = 0;
    ArmorExotic = 0;
    Parts = {};
    ParryModifier = 0;
    Stats = [20,20,20,20,20,20];
    Skills = {};

    constructor(xml) {
        this.Name = xml.GetAttributeValue("Name");
        this.Tier = xml.GetAttributeValue("Tier");
        this.Type = xml.GetAttributeValue("Type");
        this.FormSkill = SkillSpell.SkillLookup(xml.GetAttributeValue("FormSkill"));
        this.ShortDescription = xml.GetAttributeValue("ShortDescription");
        this.LongDescription = xml.GetAttributeValue("LongDescription");
        
        this.Yell = xml.GetAttributeValue("Yell");
        Utility.ParseFlags(this.AffectedBy, xml.GetAttributeValue("AffectedBy"));
        this.AttacksPerRound = xml.GetAttributeValueInt("AttacksPerRound");
        this.DamageRoll = xml.GetAttributeValueInt("DamageRoll");
        this.HitRoll = xml.GetAttributeValueInt("HitRoll");
        this.DamageDice = [
            xml.GetAttributeValueInt("DamageDiceSides"), 
            xml.GetAttributeValueInt("DamageDiceCount"), 
            xml.GetAttributeValueInt("DamageDiceBonus")];
        this.DamageReduction = xml.GetAttributeValueInt("DamageReduction");
        this.DamageMessage = xml.GetAttributeValue("DamageMessage");
        this.SavesSpell = xml.GetAttributeValueInt("SavesSpell");
        this.ArmorBash = xml.GetAttributeValueInt("ArmorBash");
        this.ArmorSlash = xml.GetAttributeValueInt("ArmorSlash");
        this.ArmorPierce = xml.GetAttributeValueInt("ArmorPierce");
        this.ArmorExotic = xml.GetAttributeValueInt("ArmorExotic");
        Utility.ParseFlags(this.Parts, xml.GetAttributeValue("Parts"));
        this.ParryModifier = xml.GetAttributeValueInt("ParryModifier");
        

        this.Description = xml.GetElementValue("Description");
        if(xml.STATS) {
            var stats = xml.STATS[0];
            this.Stats[0] = XmlHelper.GetElementValueInt(stats, "Strength");
            this.Stats[1] = XmlHelper.GetElementValueInt(stats, "Wisdom");
            this.Stats[2] = XmlHelper.GetElementValueInt(stats, "Intelligence");
            this.Stats[3] = XmlHelper.GetElementValueInt(stats, "Dexterity");
            this.Stats[4] = XmlHelper.GetElementValueInt(stats, "Constitution");
            this.Stats[5] = XmlHelper.GetElementValueInt(stats, "Charisma");
        }

        if(xml.SKILLS && xml.SKILLS[0] && xml.SKILLS[0].SKILL) {
            for(var skillxml of xml.SKILLS[0].SKILL) {
                this.Skills[skillxml.GetAttributeValue("Name")] = skillxml.GetAttributeValueInt("Value");
            }
        }

    }

    static GetForm(ch, name, strprefix = true)
    {
        for(var form of ShapeshiftForm.Forms)
        {
            var learned;

            if ((learned = ch.GetSkillPercentage(form.FormSkill)) <= 1)
                continue;
            
            if (strprefix && form.Name.prefix(name))
                return form;
            else if (!strprefix && form.Name.equals(name)) return form;
        }
        return null;
    }

    static DoShapeshift(ch, args)
    {
        const RaceData = require('./RaceData');
        const AffectData = require('./AffectData');
        const Character = require('./Character');
        var form = ShapeshiftForm.GetForm(ch, args);

        if (!form)
        {
            ch.send("You don't know that form.\n\r");
            return;
        }
        else if (!form.Parts.ISSET(RaceData.PartFlags.Legs) && form.AffectedBy.ISSET(AffectData.AffectFlags.WaterBreathing))
        {
            ch.send("You need to be in the water to become that.\n\r");
            return;
        }
        else
        {
            ch.Act("The form of $n begins to twist and stretch as $e changes into {0}.", null, null, null, Character.ActType.ToRoom, form.ShortDescription);
            ch.Act("You begin to twist and stretch as you change into {0}.", null, null, null, Character.ActType.ToChar, form.ShortDescription);
            ShapeshiftForm.CheckControls(ch);
            ch.Form = form;
        }
    }

    static CheckControls(ch)
    {
        var affect;
        var spell;
        var control;
        const AffectData = require('./AffectData');
        var spells= [ 
            ["fly","control levitation"],
            [ "pass door","control phase" ],
            [ "stone skin","control skin" ],
            [ "haste","control speed" ],
            [ "slow","control speed" ] ];

        for(var pair of spells)
        {
            spell = SkillSpell.SkillLookup(pair[0]);

            if ((affect = ch.FindAffect(spell)) != null)
            {
                control = SkillSpell.SkillLookup(pair[1]);
                var chance = ch.GetSkillPercentageOutOfForm(control);
                if (chance <= 1 || chance < Utility.NumberPercent())
                {
                    ch.AffectFromChar(affect, AffectData.ffectRemoveReason.WoreOff);
                    if (chance > 1) ch.CheckImprove(control, false, 1);
                }
                else {
                    ch.CheckImprove(control,true,1);
                }
            }
        }
        
    }

    static DoRevert(ch, args)
    {
        const AffectData = require('./AffectData');
        const Character = require('./Character');
        if (ch.Form != null)
        {
            if (ch.IsAffected(AffectData.AffectFlags.Retract))
            {
                Combat.DoRetract(ch, "");
            }
            ch.Act("The form of $n begins to twist and stretch as $e returns to $s normal form.", null, null, null, Character.ActType.ToRoom);
            ch.Act("You feel your bones begin to twist and stretch as you revert to your natural form.", null, null, null, Character.ActType.ToChar);
            ch.Form = null;
            ShapeshiftForm.CheckControls(ch);
        }
        else
            ch.send("You aren't shapeshifted.\n\r");
    }

    static CheckGainForm(ch)
    {
        //;
        if (!ch.Guild || ch.Guild.Name != "shapeshifter") return;
        
        var tier4forms = ShapeshiftForm.Forms.Select(form => form.Tier == ShapeshiftForm.FormTier.Tier4 && form.Type == ch.ShapeFocusMajor && ch.GetSkillPercentage(form.FormSkill) > 1).length;
        var tier3forms = ShapeshiftForm.Forms.Select(form => form.Tier == ShapeshiftForm.FormTier.Tier3 && (form.Type == ch.ShapeFocusMajor || form.Type == ch.ShapeFocusMinor) && ch.GetSkillPercentage(form.FormSkill) > 1).length;
        var tier2forms = ShapeshiftForm.Forms.Select(form => form.Tier == ShapeshiftForm.FormTier.Tier2 && (form.Type == ch.ShapeFocusMajor || form.Type == ch.ShapeFocusMinor) && ch.GetSkillPercentage(form.FormSkill) > 1).length;
        var tier1forms = ShapeshiftForm.Forms.Select(form => form.Tier == ShapeshiftForm.FormTier.Tier1 && (form.Type == ch.ShapeFocusMajor || form.Type == ch.ShapeFocusMinor) && ch.GetSkillPercentage(form.FormSkill) > 1).length;
       
        if (ch.Level >= 5 || (ch.Level >= 8 && 30 > Utility.NumberPercent()))
        {

            var hasTier4Major = tier4forms > 0;

            if (!hasTier4Major)
            {
                var selectedform = ShapeshiftForm.Forms.SelectRandom(form => form.Tier == ShapeshiftForm.FormTier.Tier4 && form.Type == ch.ShapeFocusMajor && form.FormSkill && ch.GetSkillPercentage(form.FormSkill) <= 1);
                
                if (selectedform != null)
                {
                    var skill = selectedform.FormSkill;
                    ch.LearnSkill(skill, 75, ch.Level);
                    ch.send("\\GYou have learned how to shapeshift into the form of {0}{1}!\\x\n\r", "aeiou".indexOf(selectedform.Name[0]) >= 0? "an " : "a ", selectedform.Name);
                    ch.Save();
                }
            }
        }

        if (ch.Level >= 18 || (ch.Level >= 16 && 30 > Utility.NumberPercent()))
        {

            var hasTier3Major = tier3forms > 0;

            if (!hasTier3Major)
            {
                var selectedform = ShapeshiftForm.Forms.SelectRandom(form => form.Tier == ShapeshiftForm.FormTier.Tier3 && form.Type == ch.ShapeFocusMajor && form.FormSkill && ch.GetSkillPercentage(form.FormSkill) <= 1);
                
                if (selectedform != null)
                {
                    var skill = selectedform.FormSkill;
                    ch.LearnSkill(skill, 75, ch.Level);
                    ch.send("\\GYou have learned how to shapeshift into the form of {0}{1}!\\x\n\r", "aeiou".Contains(selectedform.Name[0]) ? "an " : "a ", selectedform.Name);
                    ch.Save();
                }
            }
        }

        if (ch.Level >= 25 || (ch.Level >= 22 && 30 > Utility.NumberPercent()))
        {

            var hasTier3Minor = tier3forms > 1;

            if (!hasTier3Minor)
            {
                var selectedform = ShapeshiftForm.Forms.SelectRandom(form => form.Tier == ShapeshiftForm.FormTier.Tier3 && form.Type == ch.ShapeFocusMinor && form.FormSkill && ch.GetSkillPercentage(form.FormSkill) <= 1);

                if (selectedform != null)
                {
                    var skill = selectedform.FormSkill;
                    ch.LearnSkill(skill, 75, ch.Level);
                    ch.send("\\GYou have learned how to shapeshift into the form of {0}{1}!\\x\n\r", "aeiou".Contains(selectedform.Name[0]) ? "an " : "a ", selectedform.Name);
                    ch.Save();
                }
            }
        }



        if (ch.Level >= 30 || (ch.Level >= 28 && 30 > Utility.NumberPercent()))
        {

            var hasTier2Major = tier2forms > 0;

            if (!hasTier2Major)
            {
                var selectedform = ShapeshiftForm.Forms.SelectRandom(form => form.Tier == ShapeshiftForm.FormTier.Tier2 && form.Type == ch.ShapeFocusMajor && form.FormSkill && ch.GetSkillPercentage(form.FormSkill) <= 1);

                if (selectedform != null)
                {
                    var skill = selectedform.FormSkill;
                    ch.LearnSkill(skill, 75, ch.Level);
                    ch.send("\\GYou have learned how to shapeshift into the form of {0}{1}!\\x\n\r", "aeiou".Contains(selectedform.Name[0]) ? "an " : "a ", selectedform.Name);
                    ch.Save();
                }
            }
        }

        if (ch.Level >= 33 || (ch.Level >= 31 && 30 > Utility.NumberPercent()))
        {

            var hasTier2Minor = tier2forms > 1;

            if (!hasTier2Minor)
            {
                var selectedform = ShapeshiftForm.Forms.SelectRandom(form => form.Tier == ShapeshiftForm.FormTier.Tier2 && form.Type == ch.ShapeFocusMinor && form.FormSkill && ch.GetSkillPercentage(form.FormSkill) <= 1);

                if (selectedform != null)
                {
                    var skill = selectedform.FormSkill;
                    ch.LearnSkill(skill, 75, ch.Level);
                    ch.send("\\GYou have learned how to shapeshift into the form of {0}{1}!\\x\n\r", "aeiou".Contains(selectedform.Name[0]) ? "an " : "a ", selectedform.Name);
                    ch.Save();
                }
            }
        }



        if (ch.Level >= 44 || (ch.Level >= 42 && 30 > Utility.NumberPercent()))
        {

            var hasTier1Major = tier1forms > 0;

            if (!hasTier1Major)
            {
                var selectedform = ShapeshiftForm.Forms.SelectRandom(form => form.Tier == ShapeshiftForm.FormTier.Tier1 && form.Type == ch.ShapeFocusMajor && form.FormSkill && ch.GetSkillPercentage(form.FormSkill) <= 1);

                if (selectedform != null)
                {
                    var skill = selectedform.FormSkill;
                    ch.LearnSkill(skill, 75, ch.Level);
                    ch.send("\\GYou have learned how to shapeshift into the form of {0}{1}!\\x\n\r", "aeiou".Contains(selectedform.Name[0]) ? "an " : "a ", selectedform.Name);
                    ch.Save();
                }
            }
        }

        if (ch.Level >= 48 || (ch.Level >= 47 && 30 > Utility.NumberPercent()))
        {

            var hasTier1Minor = tier1forms > 1;

            if (!hasTier1Minor)
            {
                var selectedform = ShapeshiftForm.Forms.SelectRandom(form => form.Tier == ShapeshiftForm.FormTier.Tier1 && form.Type == ch.ShapeFocusMinor && form.FormSkill && ch.GetSkillPercentage(form.FormSkill) <= 1);

                if (selectedform != null)
                {
                    var skill = selectedform.FormSkill;
                    ch.LearnSkill(skill, 75, ch.Level);
                    ch.send("\\GYou have learned how to shapeshift into the form of {0}{1}!\\x\n\r", "aeiou".indexOf(selectedform.Name[0]) >= 0? "an " : "a ", selectedform.Name);
                    ch.Save();
                }
            }
        }
    } // end CheckGainForm

    static DoShapeFocus(ch, args)
    {
        var [arg, args] = args.OneArgument();

        if (!ch.Guild || ch.Guild.Name != "shapeshifter")
        {
            ch.Act("Only shapeshifters can choose a shapefocus.");
            return;
        }

        if (arg.equals("major"))
        {
            if (ch.ShapeFocusMajor == ShapeshiftForm.FormType.None && 
                (ch.ShapeFocusMajor = Utility.GetEnumValue(ShapeshiftForm.FormType, args, ShapeshiftForm.FormType.None)) && 
                ch.ShapeFocusMajor != ShapeshiftForm.FormType.None && 
                ch.ShapeFocusMajor != ShapeshiftForm.FormType.Air && 
                ch.ShapeFocusMajor != ShapeshiftForm.FormType.Water)
            {
                ch.send("You have chosen the major focus {0}.\n\r", ch.ShapeFocusMajor.toLowerCase());
                if (ch.ShapeFocusMajor == ShapeshiftForm.FormType.Offense)
                {
                    ch.LearnSkill(SkillSpell.SkillLookup("tiger frenzy"), 1, 30);
                    ch.LearnSkill(SkillSpell.SkillLookup("bestial fury"), 1, 36);

                }
                if (ch.ShapeFocusMajor == ShapeshiftForm.FormType.Defense)
                {
                    ch.LearnSkill(SkillSpell.SkillLookup("primal tenacity"), 1, 30);
                    ch.LearnSkill(SkillSpell.SkillLookup("skin of the displacer"), 1, 36);

                }
                if (ch.ShapeFocusMajor == ShapeshiftForm.FormType.Utility)
                {
                    ch.LearnSkill(SkillSpell.SkillLookup("slyness of the fox"), 1, 30);
                    ch.LearnSkill(SkillSpell.SkillLookup("recovery of the snake"), 1, 36);

                }
                ShapeshiftForm.CheckGainForm(ch);
            }
            else if (ch.ShapeFocusMajor == ShapeshiftForm.FormType.Air || ch.ShapeFocusMajor == ShapeshiftForm.FormType.Water)
            {
                ch.ShapeFocusMajor = ShapeshiftForm.FormType.None;
                ch.send("Syntax: shapefocus major [{0}].\n\r", Utility.JoinArray(ShapeshiftForm.FormType.Select((f, k) => f != ShapeshiftForm.FormType.Water && f != ShapeshiftForm.FormType.Air && f == k), null, ", "));

            }
            else if (ch.ShapeFocusMajor != ShapeshiftForm.FormType.None)
            {
                ch.send("Your major shapefocus is in {0} forms.\n\r", ch.ShapeFocusMajor.toLowerCase());
            }
            else
                ch.send("Syntax: shapefocus major [{0}].\n\r", Utility.JoinArray(ShapeshiftForm.FormType.Select((f, k) => f != ShapeshiftForm.FormType.Water && f != ShapeshiftForm.FormType.Air && f == k), null, ", "));


        }
        else if (arg.equals("minor"))
        {
            if (ch.ShapeFocusMinor == ShapeshiftForm.FormType.None && 
                (ch.ShapeFocusMinor = Utility.GetEnumValue(ShapeshiftForm.FormType, args, ShapeshiftForm.FormType.None)) && 
                ch.ShapeFocusMinor != ShapeshiftForm.FormType.None && 
                ch.ShapeFocusMinor != ShapeshiftForm.FormType.Air && 
                ch.ShapeFocusMinor != ShapeshiftForm.FormType.Water)
            {
                ch.send("You have chosen the minor focus {0}.\n\r", ch.ShapeFocusMinor.ToString().ToLower());
                ShapeshiftForm.CheckGainForm(ch);
            }
            else if (ch.ShapeFocusMinor == ShapeshiftForm.FormType.Air || ch.ShapeFocusMinor == ShapeshiftForm.FormType.Water)
            {
                ch.ShapeFocusMinor = ShapeshiftForm.FormType.None;
                ch.send("Syntax: shapefocus minor [{0}].\n\r", Utility.JoinArray(ShapeshiftForm.FormType.Select((f, k) => f != ShapeshiftForm.FormType.Water && f != ShapeshiftForm.FormType.Air && f == k), null, ", "));
            }
            else if (ch.ShapeFocusMinor != ShapeshiftForm.FormType.None)
            {
                ch.send("Your minor shapefocus is in {0} forms.\n\r", ch.ShapeFocusMinor.ToString().ToLower());
            }
            else
            ch.send("Syntax: shapefocus minor [{0}].\n\r", Utility.JoinArray(ShapeshiftForm.FormType.Select((f, k) => f != ShapeshiftForm.FormType.Water && f != ShapeshiftForm.FormType.Air && f == k), null, ", "));

        }
        else
            ch.send("Syntax: shapefocus [major|minor] [{0}].\n\r", Utility.JoinArray(ShapeshiftForm.FormType.Select((f, k) => f != ShapeshiftForm.FormType.Water && f != ShapeshiftForm.FormType.Air && f == k), null, ", "));
    } // end shape focus

    static DoEnliven(ch, args)
    {
        const AffectData = require('./AffectData');
        var sksp = [ "fly", "pass door", "stone skin", "haste", "slow" ];
        var greaterEnlivens = [ "tiger frenzy", "bestial fury" ,"primal tenacity" ,
            "skin of the displacer","slyness of the fox","recovery of the snake" ];

        var allsksp = [ "fly", "pass door", "stone skin", "haste", "slow", "tiger frenzy", "bestial fury" ,"primal tenacity" ,
        "skin of the displacer","slyness of the fox","recovery of the snake" ];

        if (!ch.Form)
        {
            ch.Act("You can only enliven while in form!");
            return;
        }
        else if (args.ISEMPTY())
        {
            ch.send("Enliven which of the following spells : {0}?", Utility.JoinArray(allsksp.Select(sk => ch.GetSkillPercentageOutOfForm(sk)), null, ", "));
            return;
        }

        
        
        for (var spell of allsksp)
        {
            if (spell.prefix(args))
            {
                var sk = SkillSpell.SkillLookup(spell);
                var chance = ch.GetSkillPercentageOutOfForm(sk);

                if (chance <= 1)
                {
                    if (greaterEnlivens.indexOf(spell) <= 1) {
                        ch.Act("You haven't learned that greater enliven yet.");
                    } else {
                         ch.Act("You haven't learned that spell yet.");
                    }
                }
                else if (chance < Utility.NumberPercent())
                {
                    ch.send("You failed to enliven {0}.", spell);
                    ch.CheckImprove(sk, false, 1);
                    ch.WaitState(sk.waitTime);
                }
                else
                {
                    if(greaterEnlivens.indexOf(spell) >= 0)
                    {
                        for (var enliven of greaterEnlivens)
                        {
                            var affect;
                            var enlivenskill = SkillSpell.SkillLookup(enliven);
                            while ((affect = ch.FindAffect(enlivenskill)) != null)
                                ch.AffectFromChar(affect, AffectData.AffectRemoveReason.WoreOff);
                        }
                    }
                    ch.send("You enliven {0}.", spell);
                    sk.SpellFun(Magic.CastType.None, sk, ch.Level, ch, ch, null, args, TargetIsType.targetChar);
                    ch.CheckImprove(sk, true, 1);
                    ch.WaitState(sk.waitTime);
                }
                return;
            }
        }
        ch.send("Enliven which of the following spells : {0}?", Utility.JoinArray(allsksp.Select(sk => ch.GetSkillPercentageOutOfForm(sk)), null, ", "));
    } // end enliven

    static DoForms(ch, args)
    {
        var any = false;
        
        for (var key in ch.Learned)
        {
            for(var form of ShapeshiftForm.Forms) {
                if(form.FormSkill.Name == key) {
                    var skill = ch.GetSkillPercentage(form.FormSkill)
                    ch.send("You are {0} with the `{1}` form.\n\r", skill == 100 ? "confident" : skill > 85 ? "competent" : "unfamiliar", form.Name);
                    any = true;
                }
            }
        }

        if (!any)
            ch.send("You know no forms.\n\r");

    }
}

module.exports = ShapeshiftForm;