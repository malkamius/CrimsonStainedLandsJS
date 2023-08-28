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
	console.log(`${player.Name} disconnected`);


	if(player.status == "Playing")
	{
		player.Act("$n loses their animation.", null, null, null, "ToRoom");
		if(!player.socket.destroyed)
			player.socket.destroy();
		player.inanimate = new Date();
	}
	else if(player && Player.Players.indexOf(player) >= 0) {
		Player.Players.splice(Player.Players.indexOf(player), 1);
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
	if(!IsDataLoaded) player.status = "WaitingOnLoad";
	else {
		Character.DoCommands.DoHelp(player, "diku", true);

		player.send("Please enter your name: ");
	}

	socket.on("data", (buffer) => {
		player = Player.GetPlayer(socket)
		if(player) {
			const message = buffer.toString("ascii").replace("\r", "");
			player.input = player.input + message;
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
	var player;
	for(player of Utility.CloneArray(Player.Players))
	{
		try{
			if(player.status == "WaitingOnLoad" && !player.socket.destroyed) {
				player.status = "GetName";
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
	setTimeout(function () {
		pulse();
	}, 250);
}


const PULSE_PER_SECOND = 4;	
const PULSE_PER_VIOLENCE = PULSE_PER_SECOND * 3;
const PULSE_PER_TICK = PULSE_PER_SECOND * 30;

var UpdateCombatCounter = PULSE_PER_VIOLENCE;
var UpdateTickCounter = PULSE_PER_TICK;

function Update() {

	if(--UpdateTickCounter <= 0) {
		UpdateTick();
		UpdateTickCounter = PULSE_PER_TICK;
	}

	if(--UpdateCombatCounter <= 0) {
		UpdateCombat();
		UpdateCombatCounter = PULSE_PER_VIOLENCE;
	}

	UpdateAggro();
}

function UpdateTick() {

	for(var character of Utility.CloneArray(Character.Characters)) { 
		for(var affect of character.Affects) {
			if(affect.Frequency == "Tick" && affect.Duration > 0 && --affect.Duration == 0) {
				character.AffectFromChar(affect);
			}
		}
	}

}

function UpdateCombat() {
	for(var character of Utility.CloneArray(Character.Characters)) {
		for(var affect of character.Affects) {
			if(affect.Frequency == "Violence" && affect.Duration > 0 && --affect.Duration == 0) {
				character.AffectFromChar(affect);
			}
		}
		if(character.Fighting) {
			Character.Combat.ExecuteRound(character);
		}
	}
}

function UpdateAggro() {
	for(var character of Utility.CloneArray(Character.Characters)) { 

	}
}