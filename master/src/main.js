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

startListening(3000); 

Data.LoadData(DataLoaded);

function DataLoaded() {
	setTimeout(function () {
		pulse()
	}, 250);
	
	
}


function HandlePlayerDisconnect(socket) {
	player = Player.GetPlayer(socket);
	console.log(`${player.Name} disconnected`);


	if(player.state == "Playing")
	{
		player.Act("The form of $n fades away.", null, null, null, "ToRoom");
	}

	player.RemoveCharacterFromRoom();

	if(player && Player.Players.indexOf(player) >= 0) Player.Players.splice(Player.Players.indexOf(player), 1);
}

function HandleNewSocket(socket) {
	socket.on('error', function(ex) {
		console.log(ex);
		HandlePlayerDisconnect(socket);
	});

	console.log(`Connection from ${socket.remoteAddress} port ${socket.remotePort}`)

	socket.on("end", () => HandlePlayerDisconnect(socket))
	player = new Player(socket);
		
	Character.DoCommands.DoHelp(player, "diku", true);

	player.send("Please enter your name: ");


	socket.on("data", (buffer) => {
		player = Player.GetPlayer(socket)
		const message = buffer.toString("ascii").replace("\r", "");
		player.input = player.input + message;
	});
}

function startListening(port) {
	
	net.createServer(HandleNewSocket)
		.listen(port, () => {
			console.log(`Listening on port ${port}`)
		});
}

function pulse()
{
	for(player of Utility.CloneArray(Player.Players))
	{
		player.HandleInput();
	}

	Update();

	for(player of Utility.CloneArray(Player.Players))
	{	
		player.HandleOutput();
	}
	setTimeout(function () {
		pulse()
	}, 250);
}




		


var UpdateCombatCounter = 12;
function Update() {

	if(--UpdateCombatCounter <= 0) {
		UpdateCombat();
		UpdateCombatCounter = 12;
	}
}

function UpdateCombat() {
	for(var character of Utility.CloneArray(Character.Characters)) {
		if(character.Fighting) {
			Character.Combat.ExecuteRound(character);
		}
	}
}