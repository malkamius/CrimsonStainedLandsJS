const net = require("net");
const dns = require("dns");

const RoomData = require("./RoomData");
const AreaData = require("./AreaData");
const Player = require("./Player");

const Utility = require("./Utility");
const Commands = require("./Commands");
const Data = require('./Data');
const Color = require("./Color");
const Settings = require("./Settings");
const TelnetProtocol = require("./TelnetProtocol");
const WeatherInfo = require("./WeatherInfo");
const TimeInfo = require("./TimeInfo");
const Game = require("./Game");
const Character = require("./Character");
const SkillSpell = require("./SkillSpell");
const AffectData = require("./AffectData");

var IsDataLoaded = false;

var server = startListening(Settings.Port); 

Data.LoadData(DataLoaded);

function DataLoaded() {
	var address = server.address();
	Game.log(Utility.Format("Awaiting connections at {0}:{1}", address.address, address.port), Game.LogLevels.Information);

	for(player of Utility.CloneArray(Player.Players))
	{	
		player.HandleOutput();
	}
	IsDataLoaded = true;

	// first pulse
	Game.Pulse();
}


function HandlePlayerDisconnect(socket) {
	player = Player.GetPlayer(socket);
	if(player != null) {
		player.input = "";
		Game.log(`${player.Name} disconnected`);


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
		Game.log(ex, Game.LogLevels.Error);
		HandlePlayerDisconnect(socket);
	});

	Game.log(`Connection from ${socket.remoteAddress} port ${socket.remotePort}`, Game.LogLevels.Information)

	socket.on("end", () => HandlePlayerDisconnect(socket));

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
		DataReceived(socket, buffer);
	});
	dns.reverse(socket.remoteAddress, function(err, hostnames) {
		if(!err) {
			socket.hostnames = hostnames;
			Game.log(`Socket ${socket.remoteAddress} hostnames are ` + hostnames.join(", "));
		} else {
			Game.log(`Socket ${socket.remoteAddress} reversedns error  ` + err);
		}
	})
}


function startListening(port) {
	return net.createServer(HandleNewSocket)
		.listen(port, () => {
			Game.log(`Listening on port ${port}`)
		});
}

function DataReceived(socket, buffer) {
	player = Player.GetPlayer(socket)
	if(player) {
		try{ 
			if(buffer.length > 4200 || player.input.length > 4200) {
				socket.end("Too much data.\n\r", "ascii");
				Player.Players.splice(Player.Players.indexOf(player), 1);
				return;
			}

			var position = player.input.length;
			
			for(var i = 0; i < buffer.length; i++) {
				var singlecharacter = buffer[i];

				if (singlecharacter == TelnetProtocol.Options.InterpretAsCommand) {
					var [newbyteindex, carryover] = TelnetProtocol.ProcessInterpretAsCommand(player, buffer, i,
						function (sender, command) {
							if (command.Type == TelnetProtocol.CommandTypes.WillTelnetType)
							{
								Game.log("WillTelnetType");
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
										return ClientString.prefix(Object.keys(option)[0]) || ClientString.toUpperCase().replaceAll(" ", "").indexOf(Object.keys(option)[0]) >= 0;
									});

									if (Options)
										for (var client in Options) {
											var options = Options[client];
											for(var option of options)
												player.TelnetOptions[option] = true;
										}


									if (player.ClientTypes.indexOf(ClientString) < 0)
									{
										Game.log(ClientString + " client detected.");
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
								Game.log("SENDING MSSP DATA");
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
								Game.log("WONT MSSP");
								//var buffer = Buffer.from(TelnetProtocol.ServerGetWillMUDExtensionProtocol);
								//player.socket.write(buffer, "binary");
							}
							else if (command.Type == TelnetProtocol.CommandTypes.DoMUDExtensionProtocol)
							{
								player.TelnetOptions[Player.TelnetOptionFlags.MUDeXtensionProtocol] = true;
								Game.log("MXP Enabled.");
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
					if(!player.IsImmortal && buffer[i] == 92) {
						player.input = player.input + String.fromCharCode(buffer[i]);
					}
				} 
			}
		}
		catch(err) {
			Game.log("Error: " + err, Game.LogLevels.Error);
		}
	}
}
