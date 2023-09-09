//ActInfo = require("./ActInfo");
const Character = require("./Character");
const Combat = require("./Combat");
const Magic = require("./Magic");
const Dueling = require("./Dueling");

Commands = {
		"north": {Command: Character.DoCommands.DoNorth, MinimumPosition: "Standing" },
		"east": {Command: Character.DoCommands.DoEast, MinimumPosition: "Standing" },
		"south": {Command: Character.DoCommands.DoSouth, MinimumPosition: "Standing" },
		"west": {Command: Character.DoCommands.DoWest, MinimumPosition: "Standing" },
		"up": {Command: Character.DoCommands.DoUp, MinimumPosition: "Standing" },
		"down": {Command: Character.DoCommands.DoDown, MinimumPosition: "Standing" },
		"open": {Command: Character.DoCommands.DoOpen, MinimumPosition: "Resting" },
		
		"cast": {Command: Magic.DoCast, MinimumPosition: "Fighting" },
		"commune": {Command: Magic.DoCommune, MinimumPosition: "Fighting" },
		"close": {Command: Character.DoCommands.DoClose, MinimumPosition: "Resting" },
		"crawl": {Command: Character.DoCommands.DoCrawl, MinimumPosition: "Standing" },
		"equipment": {Command: Character.DoCommands.DoEquipment, MinimumPosition: "Dead" },
		"inventory": {Command: Character.DoCommands.DoInventory, MinimumPosition: "Dead" },
		"say": {Command: Character.DoCommands.DoSay, MinimumPosition: "Resting" },
		"quit": {Command: Character.DoCommands.DoQuit, MinimumPosition: "Resting" },
		"help": {Command: Character.DoCommands.DoHelp, MinimumPosition: "Dead" },
		"look": {Command: Character.DoCommands.DoLook, MinimumPosition: "Resting" },
		"exits": {Command: Character.DoCommands.DoExits, MinimumPosition: "Resting" },
		"unlock": {Command: Character.DoCommands.DoUnlock, MinimumPosition: "Resting" },
		"lock": {Command: Character.DoCommands.DoLock, MinimumPosition: "Resting" },
		"get": {Command: Character.DoCommands.DoGet, MinimumPosition: "Resting" },
		"put": {Command: Character.DoCommands.DoPut, MinimumPosition: "Resting" },
		"drop": {Command: Character.DoCommands.DoDrop, MinimumPosition: "Resting" },
		"wear": {Command: Character.DoCommands.DoWear, MinimumPosition: "Resting" },
		"remove": {Command: Character.DoCommands.DoRemove, MinimumPosition: "Resting" },
		"stand": {Command: Character.DoCommands.DoStand, MinimumPosition: "Sleeping" },
		"sleep": {Command: Character.DoCommands.DoSleep, MinimumPosition: "Sleeping" },
		"rest": {Command: Character.DoCommands.DoRest, MinimumPosition: "Sleeping" },
		"sit": {Command: Character.DoCommands.DoSit, MinimumPosition: "Sleeping" },
		"save": {Command: Character.DoCommands.DoSave, MinimumPosition: "Dead" },
		"who": {Command: Character.DoCommands.DoWho, MinimumPosition: "Dead" },
		"where": {Command: Character.DoCommands.DoWhere, MinimumPosition: "Resting" },
		"skills": {Command: Character.DoCommands.DoSkills, MinimumPosition: "Dead" },
		"spells": {Command: Character.DoCommands.DoSpells, MinimumPosition: "Dead" },
		"supplications": {Command: Character.DoCommands.DoSupplications, MinimumPosition: "Dead" },
		"songs": {Command: Character.DoCommands.DoSongs, MinimumPosition: "Dead" },
		"kill": {Command:Combat.DoKill, MinimumPosition: "Standing" },
		"flee": {Command:Combat.DoFlee, MinimumPosition: "Fighting" },
		"worth": {Command:Character.DoCommands.DoWorth, MinimumPosition: "Dead" },
		"follow": {Command:Character.DoCommands.DoFollow, MinimumPosition: "Dead" },
		"nofollow": {Command:Character.DoCommands.DoNoFollow, MinimumPosition: "Dead" },
		"group": {Command:Character.DoCommands.DoGroup, MinimumPosition: "Dead" },
		"throw": {Command:Combat.DoThrow, MinimumPosition: "Fighting" },
		"kansetsuwaza": {Command:Combat.DoKansetsuwaza, MinimumPosition: "Fighting" },
		"kotegaeshi": {Command:Combat.DoKotegaeshi, MinimumPosition: "Fighting" },

		"peace": {Command: Character.DoCommands.DoPeace, MinimumPosition: "Resting" },
		"slay": {Command: Character.DoCommands.DoSlay, MinimumPosition: "Dead" },
		"sing": {Command: Magic.DoSing, MinimumPosition: "Resting" },
		"toggle": {Command: Character.DoCommands.DoToggle, MinimumPosition: "Dead" },
		"dirtkick": {Command:Combat.DoDirtKick, MinimumPosition: "Standing" },
		"affects": {Command: Character.DoCommands.DoAffects, MinimumPosition: "Dead" },
		"time": {Command: Character.DoCommands.DoTime, MinimumPosition: "Dead" },
		"weather": {Command: Character.DoCommands.DoWeather, MinimumPosition: "Dead" },
		"score": {Command: Character.DoCommands.DoScore, MinimumPosition: "Dead" },
		"prompt": {Command: Character.DoCommands.DoPrompt, MinimumPosition: "Dead" },

		"list": {Command: Character.DoCommands.DoList, MinimumPosition: "Resting" },
		"value": {Command: Character.DoCommands.DoValue, MinimumPosition: "Resting" },
		"buy": {Command: Character.DoCommands.DoBuy, MinimumPosition: "Resting" },
		"sell": {Command: Character.DoCommands.DoSell, MinimumPosition: "Resting" },
		"repair": {Command: Character.DoCommands.DoRepair, MinimumPosition: "Resting" },

		"drink": {Command: Character.DoCommands.DoDrink, MinimumPosition: "Resting" },
		"eat": {Command: Character.DoCommands.DoEat, MinimumPosition: "Resting" },

		"recite": {Command: Character.DoCommands.DoRecite, MinimumPosition: "Resting" },
		"zap": {Command: Character.DoCommands.DoZap, MinimumPosition: "Resting" },
		"brandish": {Command: Character.DoCommands.DoBrandish, MinimumPosition: "Resting" },
		"quaf": {Command: Character.DoCommands.DoQuaf, MinimumPosition: "Resting" },
		"use": {Command: Character.DoCommands.DoUse, MinimumPosition: "Resting" },

		"yell": {Command: Character.DoCommands.DoYell, MinimumPosition: "Resting" },
		"sayto": {Command: Character.DoCommands.DoSayTo, MinimumPosition: "Resting" },
		"whisper": {Command: Character.DoCommands.DoWhisper, MinimumPosition: "Resting" },
		"whisperto": {Command: Character.DoCommands.DoWhisperTo, MinimumPosition: "Resting" },
		"tell": {Command: Character.DoCommands.DoTell, MinimumPosition: "Resting" },
		"reply": {Command: Character.DoCommands.DoReply, MinimumPosition: "Resting" },
		"gtell": {Command: Character.DoCommands.DoGroupTell, MinimumPosition: "Dead" },
		"grouptell": {Command: Character.DoCommands.DoGroupTell, MinimumPosition: "Dead" },
		
		"pray": {Command: Character.DoCommands.DoPray, MinimumPosition: "Dead" },

		"train": {Command: Character.DoCommands.DoTrain, MinimumPosition: "Standing" },
		"gain": {Command: Character.DoCommands.DoGain, MinimumPosition: "Standing" },
		"practice": {Command: Character.DoCommands.DoPractice, MinimumPosition: "Dead" },
		
		"newbiechannel": {Command: Character.DoCommands.DoNewbie, MinimumPosition: "Dead" },
		"oocchannel": {Command: Character.DoCommands.DoOOC, MinimumPosition: "Dead" },
		"generalchannel": {Command: Character.DoCommands.DoGeneral, MinimumPosition: "Dead" },

		"replay": {Command: Character.DoCommands.DoReplay, MinimumPosition: "Dead" },
		
		"recall": {Command: Character.DoCommands.DoRecall, MinimumPosition: "Standing" },

		"rescue": {Command: Character.DoCommands.DoRescue, MinimumPosition: "Fighting" },
		"berserk": {Command: Character.DoCommands.DoBerserk, MinimumPosition: "Fighting" },
		"berserkersstrike": {Command: Character.DoCommands.DoBerserkersStrike, MinimumPosition: "Fighting" },
		"risingkick": {Command: Character.DoCommands.DoRisingKick, MinimumPosition: "Fighting" },
		"slice": {Command: Character.DoCommands.DoSlice, MinimumPosition: "Fighting" },
		"thrust": {Command: Character.DoCommands.DoThrust, MinimumPosition: "Fighting" },
		"pierce": {Command: Character.DoCommands.DoPierce, MinimumPosition: "Fighting" },
		"kick": {Command: Character.DoCommands.DoKick, MinimumPosition: "Fighting" },
		"disarm": {Command: Character.DoCommands.DoDisarm, MinimumPosition: "Fighting" },
		"pugil": {Command: Character.DoCommands.DoPugil, MinimumPosition: "Fighting" },
		"bash": {Command: Character.DoCommands.DoBash, MinimumPosition: "Fighting" },
		"trip": {Command: Character.DoCommands.DoTrip, MinimumPosition: "Fighting" },
		"charge": {Command: Character.DoCommands.DoCharge, MinimumPosition: "Fighting" },
		"shieldbash": {Command: Character.DoCommands.DoShieldBash, MinimumPosition: "Fighting" },
		"warcry": {Command: Character.DoCommands.DoWarCry, MinimumPosition: "Fighting" },
		"feint": {Command: Character.DoCommands.DoFeint, MinimumPosition: "Fighting" },

		"crusaderstrike": {Command: Character.DoCommands.DoCrusaderStrike, MinimumPosition: "Fighting" },
		"angelswing": {Command: Character.DoCommands.DoAngelsWing, MinimumPosition: "Fighting" },
		"palmsmash": {Command: Character.DoCommands.DoPalmSmash, MinimumPosition: "Fighting" },
		"handflurry": {Command: Character.DoCommands.DoHandFlurry, MinimumPosition: "Fighting" },
		"maceflurry": {Command: Character.DoCommands.DoMaceFlurry, MinimumPosition: "Fighting" },
		"lancecharge": {Command: Character.DoCommands.DoLanceCharge, MinimumPosition: "Fighting" },
		"sabrecharge": {Command: Character.DoCommands.DoSabreCharge, MinimumPosition: "Fighting" },
		"crushingcharge": {Command: Character.DoCommands.DoCrushingCharge, MinimumPosition: "Fighting" },
		"headsmash": {Command: Character.DoCommands.DoHeadSmash, MinimumPosition: "Fighting" },

		"wheelkick": {Command: Character.DoCommands.DoWheelKick, MinimumPosition: "Fighting" },
		"sweepkick": {Command: Character.DoCommands.DoSweepKick, MinimumPosition: "Fighting" },
		"sidekick": {Command: Character.DoCommands.DoSideKick, MinimumPosition: "Fighting" },
		"scissorskick": {Command: Character.DoCommands.DoScissorsKick, MinimumPosition: "Fighting" },
		"mulekick": {Command: Character.DoCommands.DoMuleKick, MinimumPosition: "Fighting" },
		"crescentkick": {Command: Character.DoCommands.DoCrescentKick, MinimumPosition: "Fighting" },
		"axekick": {Command: Character.DoCommands.DoAxeKick, MinimumPosition: "Fighting" },
		"mountainstormkick": {Command: Character.DoCommands.DoMountainStormKick, MinimumPosition: "Fighting" },
		"risingphoenixkick": {Command: Character.DoCommands.DoRisingPhoenixKick, MinimumPosition: "Fighting" },
		"doublespinkick": {Command: Character.DoCommands.DoDoubleSpinKick, MinimumPosition: "Fighting" },
		"caltraps": {Command: Character.DoCommands.DoCaltraps, MinimumPosition: "Fighting" },
		"endure": {Command: Character.DoCommands.DoEndure, MinimumPosition: "Fighting" },
		"bindwounds": {Command: Character.DoCommands.DoBindWounds, MinimumPosition: "Fighting" },
		"owaza": {Command: Character.DoCommands.DoOwaza, MinimumPosition: "Fighting" },
		"detecthidden": {Command: Character.DoCommands.DoDetectHidden, MinimumPosition: "Fighting" },
		"heightenedawareness": {Command: Character.DoCommands.DoHeightenedAwareness, MinimumPosition: "Fighting" },
		"hide": {Command: Character.DoCommands.DoHeightenedAwareness, MinimumPosition: "Standing" },
		"sneak": {Command: Character.DoCommands.DoHeightenedAwareness, MinimumPosition: "Standing" },
		"throw": {Command: Character.DoCommands.DoThrow, MinimumPosition: "Fighting" },
		"strangle": {Command: Character.DoCommands.DoStrangle, MinimumPosition: "Standing" },
		"blindnessdust": {Command: Character.DoCommands.DoBlindnessDust, MinimumPosition: "Fighting" },
		"poisondust": {Command: Character.DoCommands.DoPoisonDust, MinimumPosition: "Fighting" },
		"poisondagger": {Command: Character.DoCommands.DoPoisonDagger, MinimumPosition: "Standing" },

		"circlestab": {Command: Character.DoCommands.DoCircleStab, MinimumPosition: "Fighting" },
		"steal": {Command: Character.DoCommands.DoSteal, MinimumPosition: "Fighting" },
		"greaseitem": {Command: Character.DoCommands.DoGreaseItem, MinimumPosition: "Standing" },
		"arcanevision": {Command: Character.DoCommands.DoArcaneVision, MinimumPosition: "Fighting" },
		"weapontrip": {Command: Character.DoCommands.DoWeaponTrip, MinimumPosition: "Fighting" },
		"sap": {Command: Character.DoCommands.DoSap, MinimumPosition: "Standing" },
		"disengage": {Command: Character.DoCommands.DoDisengage, MinimumPosition: "Fighting" },
		"kidneyshot": {Command: Character.DoCommands.DoKidneyShot, MinimumPosition: "Fighting" },
		"blindfold": {Command: Character.DoCommands.DoBlindfold, MinimumPosition: "Standing" },
		"envenomweapon": {Command: Character.DoCommands.DoEnvenomWeapon, MinimumPosition: "Standing" },
		"gag": {Command: Character.DoCommands.DoGag, MinimumPosition: "Standing" },
		"bindhands": {Command: Character.DoCommands.DoBindHands, MinimumPosition: "Standing" },
		"bindlegs": {Command: Character.DoCommands.DoBindLegs, MinimumPosition: "Standing" },
		"sleepingdisarm": {Command: Character.DoCommands.DoSleepingDisarm, MinimumPosition: "Standing" },
		"pepperdust": {Command: Character.DoCommands.DoPepperDust, MinimumPosition: "Fighting" },
		"blisteragent": {Command: Character.DoCommands.DoBlisterAgent, MinimumPosition: "Fighting" },
		"earclap": {Command: Character.DoCommands.DoEarClap, MinimumPosition: "Fighting" },
		"stenchcloud": {Command: Character.DoCommands.DoStenchCloud, MinimumPosition: "Fighting" },
		"shiv": {Command: Character.DoCommands.DoShiv, MinimumPosition: "Fighting" },
		"knife": {Command: Character.DoCommands.DoKnife, MinimumPosition: "Standing" },
		"backstab": {Command: Character.DoCommands.DoBackstab, MinimumPosition: "Standing" },
		"dualbackstab": {Command: Character.DoCommands.DoDualBackstab, MinimumPosition: "Standing" },

		"lash": {Command: Character.DoCommands.DoLash, MinimumPosition: "Fighting" },
		"barkskin": {Command: Character.DoCommands.DoBarkskin, MinimumPosition: "Fighting" },
		"camouflage": {Command: Character.DoCommands.DoCamouflag, MinimumPosition: "Standing" },
		"creep": {Command: Character.DoCommands.DoCreep, MinimumPosition: "Standing" },
		"ambush": {Command: Character.DoCommands.DoAmbush, MinimumPosition: "Standing" },
		"serpentstrike": {Command: Character.DoCommands.DoSerpentStrike, MinimumPosition: "Fighting" },
		"herbs": {Command: Character.DoCommands.DoHerbs, MinimumPosition: "Resting" },
		"butcher": {Command: Character.DoCommands.DoButcher, MinimumPosition: "Standing" },
		"camp": {Command: Character.DoCommands.DoCamp, MinimumPosition: "Resting" },
		"acutevision": {Command: Character.DoCommands.DoAcuteVision, MinimumPosition: "Resting" },
		"findwater": {Command: Character.DoCommands.DoFindWater, MinimumPosition: "Standing" },
		"fashionstaff": {Command: Character.DoCommands.DoFashionStaff, MinimumPosition: "Standing" },
		"fashionspear": {Command: Character.DoCommands.DoFashionSpear, MinimumPosition: "Standing" },
		"owlkinship": {Command: Character.DoCommands.DoOwlKinship, MinimumPosition: "Fighting" },
		"serpentkinship": {Command: Character.DoCommands.DoSerpentKinship, MinimumPosition: "Fighting" },
		"bearkinship": {Command: Character.DoCommands.DoBearKinship, MinimumPosition: "Fighting" },
		"wolfkinship": {Command: Character.DoCommands.DoWolfKinship, MinimumPosition: "Fighting" },

		"whirl": {Command: Character.DoCommands.DoWhirl, MinimumPosition: "Fighting" },
		"boneshatter": {Command: Character.DoCommands.DoBoneshatter, MinimumPosition: "Fighting" },
		"crossdownparry": {Command: Character.DoCommands.DoCrossDownParry, MinimumPosition: "Fighting" },
		"pummel": {Command: Character.DoCommands.DoPummel, MinimumPosition: "Fighting" },
		"backhand": {Command: Character.DoCommands.DoBackhand, MinimumPosition: "Fighting" },
		"sting": {Command: Character.DoCommands.DoSting, MinimumPosition: "Fighting" },
		"bludgeon": {Command: Character.DoCommands.DoBludgeon, MinimumPosition: "Fighting" },
		"legsweep": {Command: Character.DoCommands.DoLegsweep, MinimumPosition: "Fighting" },
		"vitalarea": {Command: Character.DoCommands.DoVitalArea, MinimumPosition: "Fighting" },
		"doublethrust": {Command: Character.DoCommands.DoDoubleThrust, MinimumPosition: "Fighting" },
		"jab": {Command: Character.DoCommands.DoJab, MinimumPosition: "Fighting" },
		"chop": {Command: Character.DoCommands.DoChop, MinimumPosition: "Fighting" },
		"crescentstrike": {Command: Character.DoCommands.DoCrescentStrike, MinimumPosition: "Fighting" },
		"overhead": {Command: Character.DoCommands.DoOverhead, MinimumPosition: "Fighting" },
		"disembowel": {Command: Character.DoCommands.DoDisembowel, MinimumPosition: "Fighting" },
		"pincer": {Command: Character.DoCommands.DoPincer, MinimumPosition: "Fighting" },
		"underhandstab": {Command: Character.DoCommands.DoUnderhandStab, MinimumPosition: "Fighting" },
		"leveragekick": {Command: Character.DoCommands.DoLeverageKick, MinimumPosition: "Fighting" },
		"cranial": {Command: Character.DoCommands.DoCranial, MinimumPosition: "Fighting" },
		"entrapweapon": {Command: Character.DoCommands.DoEntrapWeapon, MinimumPosition: "Fighting" },
		"stripweapon": {Command: Character.DoCommands.DoStripWeapon, MinimumPosition: "Fighting" },
		"hookweapon": {Command: Character.DoCommands.DoHookWeapon, MinimumPosition: "Fighting" },
		"weaponbreaker": {Command: Character.DoCommands.DoWeaponBreaker, MinimumPosition: "Fighting" },
		"dent": {Command: Character.DoCommands.DoDent, MinimumPosition: "Fighting" },
		"stab": {Command: Character.DoCommands.DoStab, MinimumPosition: "Fighting" },
		"drum": {Command: Character.DoCommands.DoDrum, MinimumPosition: "Fighting" },
		"impale": {Command: Character.DoCommands.DoImpale, MinimumPosition: "Fighting" },
		"flurry": {Command: Character.DoCommands.DoFlurry, MinimumPosition: "Fighting" },

		"scan": {Command: Character.DoCommands.DoScan, MinimumPosition: "Resting" },

		"scrollcount": {Command: Character.DoCommands.DoScrollCount, MinimumPosition: "Dead" },

		"map": {Command: Character.DoCommands.DoMap, MinimumPosition: "Dead" },
		"heal": {Command: Magic.DoHeal, MinimumPosition: "Resting" },
		"sacrifice": {Command: Character.DoCommands.DoSacrifice, MinimumPosition: "Resting" },
		"duelchallenge": {Command: Dueling.DoIssueDuelChallenge, MinimumPosition: "Dead" },
		"duelaccept": {Command: Dueling.DoDuelAccept, MinimumPosition: "Dead" },
		"dueldecline": {Command: Dueling.DoDuelDecline, MinimumPosition: "Dead" },
		"goto": {Command: Character.DoCommands.DoGoto, MinimumPosition: "Dead" },
		"transfer": {Command: Character.DoCommands.DoTransfer, MinimumPosition: "Dead" },
		"grant": {Command: Character.DoCommands.DoGrant, MinimumPosition: "Dead" },

		"restore": {Command: Character.DoCommands.DoRestore, MinimumPosition: "Dead" },
		"stripaffects": {Command: Character.DoCommands.DoStripAffects, MinimumPosition: "Dead" },
		"load": {Command: Character.DoCommands.DoLoad, MinimumPosition: "Dead" },
		"stat": {Command: Character.DoCommands.DoStat, MinimumPosition: "Dead" },
		"poofin": {Command: Character.DoCommands.DoPoofIn, MinimumPosition: "Dead" },
		"poofout": {Command: Character.DoCommands.DoPoofOut, MinimumPosition: "Dead" },

		"resetareas": {Command: Character.DoCommands.DoResetAreas, MinimumPosition: "Dead" },
		"delete": {Command: Character.DoCommands.DoDelete, MinimumPosition: "Dead" },
	};
	
module.exports = Commands;
