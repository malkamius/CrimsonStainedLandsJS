const net = require("net");
const RoomData = require("./RoomData");
const AreaData = require("./AreaData");
const Player = require("./Player");

const Utility = require("./Utility");
const Commands = require("./Commands");
const fs = require('fs');
const crypto = require('crypto');
const Data = require('./Data');
const Color = require("./Color");
const Settings = require("./Settings");
const TelnetProtocol = require("./TelnetProtocol");
const WeatherInfo = require("./WeatherInfo");
const TimeInfo = require("./TimeInfo");
const Game = require("./Game");

var server = startListening(Settings.Port); 
var IsDataLoaded = false;

Data.LoadData(DataLoaded);

function DataLoaded() {
	var address = server.address();
	console.log(Utility.Format("Awaiting connections at {0}:{1}", address.address, address.port));

	for(player of Utility.CloneArray(Player.Players))
	{	
		player.HandleOutput();
	}
	IsDataLoaded = true;

	setTimeout(function () {
		pulse()
	}, 250);
	
}


function HandlePlayerDisconnect(socket) {
	player = Player.GetPlayer(socket);
	if(player != null) {
		player.input = "";
		console.log(`${player.Name} disconnected`);


		if(player.status == "Playing")
		{
			player.Act("$n loses their animation.", null, null, null, "ToRoom");
			if(!player.socket.destroyed)
				player.socket.destroy();
			player.inanimate = new Date();
		}
		else if(player && Player.Players.indexOf(player) >= 0) {
			if(!player.socket.destroyed)
				player.socket.destroy();
			Player.Players.splice(Player.Players.indexOf(player), 1);
		} 	
	}
}

function HandleNewSocket(socket) {
	socket.on('error', function(ex) {
		console.log(ex);
		HandlePlayerDisconnect(socket);
	});

	console.log(`Connection from ${socket.remoteAddress} port ${socket.remotePort}`)

	socket.on("end", () => HandlePlayerDisconnect(socket))
	player = new Player(socket);
	var buffer = Buffer.from(TelnetProtocol.ServerGetDoTelnetType);
	player.socket.write(buffer, "binary");

	if(!IsDataLoaded) player.status = "WaitingOnLoad";
	else {
		

		const Character = require("./Character");
		Character.DoCommands.DoHelp(player, "diku", true);

		player.send("Please enter your name: ");
	}

	socket.on("data", (buffer) => {
		player = Player.GetPlayer(socket)
		if(player) {
			try{ 
				if(buffer.length > 4200 || player.input.length > 4200) {
					//socket.write();
					socket.end("Too much data.\n\r", "ascii");
					Player.Players.splice(Player.Players.indexOf(player), 1);
					return;
				}
				// const message = buffer.toString("ascii");
				// console.log(buffer);
				// console.log(message);
				var position = player.input.length;
				
				for(var i = 0; i < buffer.length; i++) {
					var singlecharacter = buffer[i];

					if (singlecharacter == TelnetProtocol.Options.InterpretAsCommand) {
						var [newbyteindex, carryover] = TelnetProtocol.ProcessInterpretAsCommand(player, buffer, i,
							function (sender, command) {
								if (command.Type == TelnetProtocol.CommandTypes.WillTelnetType)
								{
									console.log("WillTelnetType");
									var buffer = Buffer.from(TelnetProtocol.ServerGetWillTelnetType);
									player.socket.write(buffer, "binary");
								}
								else if (command.Type == TelnetProtocol.CommandTypes.ClientSendNegotiateType) {
									var telnettypes;
									if ((telnettypes = command.Values["TelnetType"]) && telnettypes && telnettypes.length > 0)
									{
										var ClientString = telnettypes[0];
										const Player = require("./Player");
										var TelnetOptionFlags =
										[
											{ "CMUD": [ Player.TelnetOptionFlags.Color256 ] },
											{ "Mudlet": [ Player.TelnetOptionFlags.Color256, Player.TelnetOptionFlags.ColorRGB ] },
											{ "Mushclient": [ Player.TelnetOptionFlags.Color256, Player.TelnetOptionFlags.ColorRGB ] },
											{ "TRUECOLOR":  [ Player.TelnetOptionFlags.ColorRGB ] },
											{ "256COLOR": [ Player.TelnetOptionFlags.Color256 ] },
											{ "VT100": [ Player.TelnetOptionFlags.Ansi ] },
											{ "ANSI": [ Player.TelnetOptionFlags.Ansi ] },
										];

										var Options = TelnetOptionFlags.FirstOrDefault(function(option) {
											return ClientString.prefix(Object.keys(option)[0]) || ClientString.toUpperCase().replace(" ", "").indexOf(Object.keys(option)[0]) >= 0;
										});

										if (Options)
											for (var client in Options) {
												var options = Options[client];
												for(var option of options)
													player.TelnetOptions[option] = true;
											}


										if (player.ClientTypes.indexOf(ClientString) < 0)
										{
											console.log(ClientString + " client detected.");
											player.ClientTypes.push(ClientString);
											var buffer = Buffer.from(TelnetProtocol.ServerGetTelnetTypeNegotiate);
											player.socket.write(buffer, "binary");
										}
										else {
											var buffer = Buffer.from(TelnetProtocol.ServerGetWillMudServerStatusProtocol);
											player.socket.write(buffer, "binary");
										}
									}
									else {
										var buffer = Buffer.from(TelnetProtocol.ServerGetWillMudServerStatusProtocol);
										player.socket.write(buffer, "binary");
									}
								}  else if (command.Type == TelnetProtocol.CommandTypes.DoMUDServerStatusProtocol) {
									const TimeSpan = require("./TimeSpan");
									console.log("SENDING MSSP DATA");
									var variables = {};
									variables["NAME"] = ["CRIMSON STAINED LANDS"];
									var pcount = 0;
									for(var p in Player.Players)
										if(p.status == "Playing") pcount++;
									variables["PLAYERS"] = [pcount];
									variables["UPTIME"] =  [new TimeSpan(Date.now() - Game.GameStarted).totalSeconds];
									variables["HOSTNAME"] = ["kbs-cloud.com"];
									variables["PORT"] = [Settings.Port ];
									//variables["SSL"] = [Settings.SSLPort ];
									variables["CODEBASE"] = ["CUSTOM"];
									variables["WEBSITE"] = ["https://kbs-cloud.com"];

									var buffer = Buffer.from(TelnetProtocol.ServerGetNegotiateMUDServerStatusProtocol(variables));
									player.socket.write(buffer, "binary");
									// buffer = Buffer.from(TelnetProtocol.ServerGetWillMUDExtensionProtocol);
									// player.socket.write(buffer, "binary");
								}
								else if (command.Type == TelnetProtocol.CommandTypes.DontMUDServerStatusProtocol)
								{
									console.log("WONT MSSP");
									//var buffer = Buffer.from(TelnetProtocol.ServerGetWillMUDExtensionProtocol);
									//player.socket.write(buffer, "binary");
								}
								else if (command.Type == TelnetProtocol.CommandTypes.DoMUDExtensionProtocol)
								{
									player.TelnetOptions[Player.TelnetOptionFlags.MUDeXtensionProtocol] = true;
									console.log("MXP Enabled.");
								}
							}
						);
						if (newbyteindex > i)
							i = newbyteindex - 1;
						this.ReceiveBufferBacklog = carryover; // not supported yet
					} else if(buffer[i] == 8 && position > 0) {
						if(position > 1)
							player.input = player.input.substring(0, position - 1);
						else
							player.input = "";
						position--;
					} else if(buffer[i] == 13 || buffer[i] == 10 || buffer[i] >= 32 && buffer[i] <= 126) {
						player.input = player.input + String.fromCharCode(buffer[i]);
					} 
				}

				//const message = buffer.toString("ascii").replace("\r", "");
				//player.input = player.input + message;
			}
			catch(err) {
				console.log("Error: " + err);
			}
		}
		
	});
}

function startListening(port) {
	return net.createServer(HandleNewSocket)
		.listen(port, () => {
			console.log(`Listening on port ${port}`)
		});
}

function pulse()
{
	//console.time("PULSE");
	var startpulse = new Date();
	var player;
	for(player of Utility.CloneArray(Player.Players))
	{
		try{
			if(player.status == "WaitingOnLoad" && !player.socket.destroyed) {
				player.status = "GetName";
				const Character = require("./Character");
				Character.DoCommands.DoHelp(player, "diku", true);

				player.send("Please enter your name: ");
			}
			const TimeSpan = require("./TimeSpan");

			if(player.inanimate && new TimeSpan(Date.now() - player.inanimate).totalMinutes >= 1) {
				player.Act("$n disappears into the void.", null, null, null, "ToRoom");
				player.Save();
				player.RemoveCharacterFromRoom();
				if(!player.socket.destroyed)
				player.socket.destroy();
				//var index = -1;
				// var thisplayer = Player.Players.find((thisplayer, thisindexindex) => index = thisindex);
				// thisplayer.socket = null;

				Player.Players.splice(Player.Players.indexOf(player), 1);
			}

			if(player.socket && !player.socket.destroyed)
				player.HandleInput(); 
		} catch(err) {
			try {
				console.log(err);
				player.send("Error: " + err);
			}
			catch(innererr) {
				console.log(err);
			}
		}
	}

	Update();

	for(player of Utility.CloneArray(Player.Players))
	{	
		try{
			if(player.socket && !player.socket.destroyed) {
				player.HandleOutput();
			}
		} catch(err) {
			try {
				console.log(err);
				player.send("Error: " + err);
			}
			catch(innererr) {
				console.log(err);
			}
		}

	}
	var totalpulse = new Date() - startpulse;
	setTimeout(function () {
		pulse();
	}, Math.min(Math.max(250 - totalpulse, 1), 250));
	
	if(totalpulse > 250) console.log("PULSE TOOK " + totalpulse + "ms");
	//console.timeEnd("PULSE");
	//console.log(totalpulse);
}

var UpdateCombatCounter = 0; // Game.PULSE_PER_VIOLENCE;
var UpdateTickCounter = 0; //Game.PULSE_PER_TICK;

function Update() {

	if(--UpdateTickCounter <= 0) {
		AreaData.ResetAreas();
		UpdateWeather();
		UpdateTick();
		UpdateTickCounter = Game.PULSE_PER_TICK;
	}

	if(--UpdateCombatCounter <= 0) {
		UpdateCombat();
		UpdateCombatCounter = Game.PULSE_PER_VIOLENCE;
	}

	UpdateAggro();
}
var _lasthour = TimeInfo.Hour;
function UpdateWeather() {
	var buf = "";
	var diff = 0;

	if (_lasthour != TimeInfo.Hour)
		switch (TimeInfo.Hour)
		{
			case 5:
				buf += "The day has begun.\n\r";
				break;

			case 6:
				buf += "The sun rises in the east.\n\r";
				break;

			case 19:
				buf += "The sun slowly disappears in the west.\n\r";
				break;

			case 20:
				buf += "The night has begun.\n\r";
				break;
		}

	_lasthour = TimeInfo.Hour;

	/*
	* Weather change.
	*/
	if (TimeInfo.Month >= 9 && TimeInfo.Month <= 16)
		diff = WeatherInfo.mmhg > 985 ? -2 : 2;
	else
		diff = WeatherInfo.mmhg > 1015 ? -2 : 2;

	WeatherInfo.change += diff * Utility.Roll([1, 4, 0]) + Utility.Roll([2, 6, 0]) - Utility.Roll([2, 6, 0]);
	WeatherInfo.change = Math.max(WeatherInfo.change, -12);
	WeatherInfo.change = Math.min(WeatherInfo.change, 12);

	WeatherInfo.mmhg += WeatherInfo.change;
	WeatherInfo.mmhg = Math.max(WeatherInfo.mmhg, 960);
	WeatherInfo.mmhg = Math.min(WeatherInfo.mmhg, 1040);

	switch (WeatherInfo.Sky)
	{
		default:
			console.log("Weather_update: bad sky " + WeatherInfo.Sky + ".");
			WeatherInfo.Sky = "Cloudless";
			break;

		case "Cloudless":
			if (WeatherInfo.mmhg < 990
				|| (WeatherInfo.mmhg < 1010 && Utility.Random(0, 2) == 0))
			{
				buf += "The sky is getting cloudy.\n\r";
				WeatherInfo.Sky = "Cloudy";
			}
			break;

		case "Cloudy":
			if (WeatherInfo.mmhg < 970
				|| (WeatherInfo.mmhg < 990 && Utility.Random(0, 2) == 0))
			{
				buf += "It starts to rain.\n\r";
				WeatherInfo.Sky = WeatherInfo.SkyStates.Raining;
			}

			if (WeatherInfo.mmhg > 1030 && Utility.Random(0, 2) == 0)
			{
				buf += "The clouds disappear.\n\r";
				WeatherInfo.Sky = WeatherInfo.SkyStates.Cloudless;
			}
			break;

		case "Raining":
			if (WeatherInfo.mmhg < 970 && Utility.Random(0, 2) == 0)
			{
				buf += "Lightning flashes in the sky.\n\r";
				WeatherInfo.Sky = WeatherInfo.SkyStates.Lightning;
			}

			if (WeatherInfo.mmhg > 1030
				|| (WeatherInfo.mmhg > 1010 && Utility.Random(0, 2) == 0))
			{
				buf += "The rain stopped.\n\r";
				WeatherInfo.Sky = WeatherInfo.SkyStates.Cloudy;
			}
			break;

		case "Lightning":
			if (WeatherInfo.mmhg > 1010
				|| (WeatherInfo.mmhg > 990 && Utility.Random(0, 2) == 0))
			{
				buf += "The lightning has stopped.\n\r";
				WeatherInfo.Sky = WeatherInfo.SkyStates.Raining;
				break;
			}
			break;
	}

	if (buf.length > 0)
	{
		for (var player of Player.Players)
		{
			if (player.status == "Playing"
				&& player.IsOutside
				&& player.IsAwake)
				player.send(buf);
		}
	}

	return;
}

function DumpItems(item)
{
	for (var contained of Utility.CloneArray(item.Contains))
	{
		item.Contains.Remove(contained);
		item.Room.Items.unshift(contained);
		contained.Room = item.Room;
		contained.Container = null;
	}
}

function UpdateTick() {
	const Character = require("./Character");
	for(var character of Utility.CloneArray(Character.Characters)) { 
		for(var affect of character.Affects) {
			if(affect.Frequency == "Tick" && (affect.Duration == 0 || (affect.Duration > 0 && --affect.Duration == 0))) {
				character.AffectFromChar(affect);
			}
		}

		if(character.HitPoints < character.MaxHitPoints) {
			var gain = character.GetHitPointsGain();

			character.HitPoints = Math.min(character.HitPoints + gain, character.MaxHitPoints);
		}

		if(character.ManaPoints < character.MaxManaPoints) {
			var gain = character.GetManaPointsGain();

			character.ManaPoints = Math.min(character.ManaPoints + gain, character.MaxManaPoints);
		}

		if(character.MovementPoints < character.MaxMovementPoints) {
			var gain = character.GetMovementPointsGain();

			character.MovementPoints = Math.min(character.MovementPoints + gain, character.MaxMovementPoints);
		}
	}
	const ItemData = require("./ItemData");
	for(var item of Utility.CloneArray(ItemData.Items)) {
		if(item.Timer == 0 || (item.Timer > 0 && --item.Timer == 0)) {
			var message = "";
			if (item.ItemTypes.ISSET(ItemData.ItemTypesList.Fountain))
			{
				message = "$p dries up.";
			}
			else if (item.ItemTypes.ISSET(ItemData.ItemTypesList.Corpse) || item.ItemTypes.ISSET(ItemData.ItemTypesList.NPCCorpse))
			{
				message = "$p decays into dust.";
			}
			else if (item.ItemTypes.ISSET(ItemData.ItemTypesList.Food))
			{
				message = "$p decomposes.";
			}
			else if (item.ItemTypes.ISSET(ItemData.ItemTypesList.Potion))
			{
				message = "$p has evaporated from disuse.";
			}
			else if (item.ItemTypes.ISSET(ItemData.ItemTypesList.Portal))
			{
				message = "$p fades out of existence.";
			}
			else
			{
				message = "$p crumbles into dust.";
			}

			if (item.CarriedBy)
			{
				if (item.CarriedBy.IsNPC
					&& item.CarriedBy.IsShop)
					item.CarriedBy.Gold += item.Value / 5;
				else
				{
					item.CarriedBy.Act(message, null, item, null, Character.ActType.ToChar);
				}
			}
			else if (item.Room != null && item.Room.Characters.length > 0)
			{
				item.Room.Characters[0].Act(message, null, item, null, Character.ActType.ToRoom);
				item.Room.Characters[0].Act(message, null, item, null, Character.ActType.ToChar);
			}

			if (item.Contains.length > 0)
			{
				if (item.CarriedBy != null)
				{
					for (var contained of Utility.CloneArray(item.Contains))
					{
						item.Contains.Remove(contained);
						item.CarriedBy.AddInventoryItem(contained);
					}
				}
				else if (item.Room != null)
				{
					if (item.ItemTypes.ISSET(ItemData.ItemTypesList.Corpse))
					{
						var owner = Player.Players.FirstOrDefault((player) => player.Name == item.Owner);

						if (owner && owner.status == "Playing")
						{

							for (var contained of Utility.CloneArray(item.Contains))
							{
								item.Contains.Remove(contained);
								owner.Act("$p appears in your hands.", null, contained, null, Character.ActType.ToChar);
								owner.Act("$p appears in $n's hands.", null, contained, null, Character.ActType.ToRoom);
								owner.AddInventoryItem(contained);
								contained.CarriedBy = owner;
								contained.Container = null;
							}
						}
						else
						{
							var recallroom = null;
							var pit;
							if (item.Alignment == Alignment.Good)
							{
								recallroom = RoomData.Rooms[19089];
							}
							else if (item.Alignment == Alignment.Evil)
							{
								recallroom = RoomData.Rooms[19090];
							}
							else
							{
								recallroom = RoomData.Rooms[19001];
							}

							//var recallroom = 
							if (recallroom)
							{
								pit = recallroom.Items.FirstOrDefault((obj) => obj.VNum == 19000);

								if (pit)
								{
									for (var contained of Utility.CloneArray(item.Contains))
									{
										item.Contains.Remove(contained);
										pit.Contains.unshift(contained);

										contained.Container = pit;
									}
								}
								else
									DumpItems(item);
							}
							else
								DumpItems(item);
						}
					}
					else
					{
						DumpItems(item);
					}
				}
				else if (item.Container != null)
				{
					for(var contained of Utility.CloneArray(item.Contains))
					{
						item.Contains.Remove(contained);
						item.Container.Contains.unshift(contained);
						contained.Container = item.Container;
					}
				}
			}

			item.Dispose();
		}
	}

}

function UpdateCombat() {
	const Character = require("./Character");
	const Combat = require("./Combat");
	const SkillSpell = require("./SkillSpell");
	const Magic = require("./Magic");
	for(var character of Utility.CloneArray(Character.Characters)) {
		for(var affect of character.Affects) {
			if(affect.Frequency == "Violence" && (affect.Duration == 0 || (affect.Duration > 0 && --affect.Duration == 0))) {
				character.AffectFromChar(affect);
			}
		}
		
		if(character.IsNPC && character.Wait == 0) {
			//for(var learnedkey in character.Learned) {
				//var learned = character.Learned[learnedkey];
				var learned = Utility.SelectRandom(character.Learned, function(item) { var skill;
					return (skill = SkillSpell.GetSkill(item.Name, false)) && skill.AutoCast == true && skill.TargetType.equals("targetCharDefensive")});
				if(learned) {
					var skill = SkillSpell.GetSkill(learned.Name, false);

					if(learned && skill && skill.TargetType.equals("targetCharDefensive")) {
						if(skill.AutoCastScript.ISEMPTY() || eval(skill.AutoCastScript)) {
							var victim = character;
							if(character.Guild && character.Guild.CastType) {
								Magic.CastCommuneOrSing(character, "'" + skill.Name + "'", character.Guild.CastType);
								//console.log(Utility.Format("{0} {1}", character.Guild.CastType, "'" + skill.Name + "'"))
							}
							
						}
					}
				}
			//}
		}

		

		if(character.Fighting && character.Fighting.Room != character.Room) {
			character.Fighting = null;
			character.Position = "Standing";
		}

		if(character.Fighting) {
			Combat.ExecuteRound(character);
		}
	}
}

function UpdateAggro() {
	const Character = require("./Character");
	for(var character of Utility.CloneArray(Character.Characters)) { 
		if(character.Wait > 0) character.Wait--;
	}
}