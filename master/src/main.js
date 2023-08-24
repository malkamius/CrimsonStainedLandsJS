const net = require("net");
const RoomData = require("./RoomData");
const AreaData = require("./AreaData");
const Player = require("./Player");

const StringUtility = require("./StringUtility");
const Commands = require("./Commands");
const ActInfo = require("./ActInfo");
const fs = require('fs');
const crypto = require('crypto');

AreaData.LoadAllAreas(function() { 	
	fixExits();

	console.log(Object.keys(AreaData.AllRooms).length + " rooms loaded.");
	console.log(Object.keys(AreaData.AllHelps).length + " helps  loaded.");
	console.log(Object.keys(AreaData.AllAreas).length + " areas  loaded.");

	for(var areakey in AreaData.AllAreas)
	{
		var area = AreaData.AllAreas[areakey];
		
		for(var i = 0; i < area.Resets.length; i++) {
			reset = area.Resets[i];
			reset.Execute();
		}
		//console.log("Reset area " + area.Name);
	}
	startListening(3000); 
} );



function getplayer(socket) {
for (const player of Player.Players) {
	if(player.socket == socket) {
		return player;
	}
}
}

function getplayerbyname(name) {
for (const player of Player.Players) {
	if(StringUtility.Compare(player.Name, name)) {
		return player;
	}
}
}

function HandlePlayerDisconnect(socket) {
player = getplayer(socket)
console.log(`${player.Name} disconnected`)


if(player.state == "Playing")
{
player.Act("The form of $n fades away.", null, null, null, "ToRoom")	
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
	player = getplayer(socket)
	const message = buffer.toString("ascii").replace("\r", "");
	player.input = player.input + message;
});
}

function startListening(port) {
setTimeout(function () {
		pulse()
	}, 250);
net.createServer(HandleNewSocket)
	.listen(port, () => {
		console.log(`Listening on port ${port}`)
	});
}

function pulse()
{
	for(player of StringUtility.CloneArray(Player.Players))
	{
		handleinput(player);
	}

	Update();

	for(player of StringUtility.CloneArray(Player.Players))
	{	
		handleoutput(player);
	}
	setTimeout(function () {
		pulse()
	}, 250);
}

function handleoutput(player) {

	if(player.output != null && player.output != "")
	{
		

		if(player.status == "Playing") {
			// if(!player.output.startsWith("\n") && player.SittingAtPrompt)
			// 	player.output = "\n" + player.output;
			// if(!player.output.endsWith("\n"))
			// 	player.output = player.output + "\n";
			if (player.Fighting)
			{
				var health = "";
				var hp = parseInt(player.Fighting.HitPoints) / parseInt(player.Fighting.MaxHitPoints);
				if (hp == 1)
					health = "is in perfect health.";
				else if (hp > .8)
					health = "is covered in small scratches.";
				else if (hp > .7)
					health = "has some small wounds.";
				else if (hp > .6)
					health = "has some larger wounds.";
				else if (hp > .5)
					health = "is bleeding profusely.";
				else if (hp > .4)
					health = "writhing in agony.";
				else if (hp > 0)
					health = "convulsing on the ground.";
				else
					health = "is dead.";
				//output.Append(fighting.Display(this) + " " + health + "\n\r");
				player.Act("$N " + health + "\n\r", player.Fighting);
			}
			player.output = player.output + "\n\r" + player.GetPrompt();
			if ((player.Position == "Fighting" || player.Fighting) && player.SittingAtPrompt && !player.output.startsWith("\n\r"))
        		player.output = "\n\r" + player.output;
		}
		
		player.output = player.output.replace("\r", "");
		player.socket.write(player.output.replace("\n", "\n\r"), "ascii");
		player.SittingAtPrompt = true;
	}

	player.output = "";

}


		
function handleinput(player) {
	if(player.input != "")
	{
		var index = player.input.indexOf("\n");
		if(index != -1 && index != null)
		{
			var str = player.input.substr(0, index);
			if(index < player.input.length)
				player.input = player.input.substr(index + 1);
			else
				player.input = "";
			
			if(player.status != "Playing") {			
				nanny(player, str);
			}
			else if(player.status == "Playing") {
				var args = StringUtility.OneArgument(str);
				if(args[0] == "")
				{
					player.send("\n\r");
					player.SittingAtPrompt = false;
					return;
				}

				for(var key in Commands) {
					if(StringUtility.Prefix(key, args[0])) {
						Commands[key](player, args[1]);
						player.SittingAtPrompt = false;
						return;
					}
				}
				
				player.send("Huh?\n\r");
				player.SittingAtPrompt = false;
			}
		}
	}
}

function nanny(player, input) {
if(player.status == "GetName") {
	if(!input || input.length < 3 || input.length > 12) {
		player.send("Name must be between 3 and 12 characters long.\n\r");
		player.send(`What is your name? `);
		return true;
	}

	var regex = /\s/;
	var result = regex.exec(input);
	if(result && result.index >= 0) {
		player.send("Name cannot contain whitespace.\n\r");
		player.send(`What is your name? `);
		return true;
	}
	var otherplayer = getplayerbyname(input);
	if(otherplayer) {
		player.send(`That name is already taken.\n`);
		player.send(`What is your name? `);
		return true;
	}
	regex = /[^A-Za-z]+/;
	result = regex.exec(input);

	if(result && result.index >= 0 && result.length > 0) {
		player.send("Name can only contain characters in the alphabet.\n\r");
		player.send(`What is your name? `);
		return true;
	}

	player.Name = StringUtility.Capitalize(input);
	if(fs.existsSync(`data/players/${player.Name}.xml`)) {
		player.Load(`data/players/${player.Name}.xml`);
		player.status = "GetPassword";
		player.send("Enter your password: ");
		return true;
	} else {
		player.status = "Playing";
		Character.DoCommands.DoHelp(player, "greeting");
		player.send("\n\rWelcome to the Crimson Stained Lands!\n\r\n\r");
		player.AddCharacterToRoom(RoomData.Rooms["3700"]);
		player.Act("The form of $n appears before you.", null, null, null, "ToRoom");
		return true;
	}
		
}
if(player.status == "GetPassword") {
	let hash = crypto.createHash('md5').update(input + "salt").digest("hex");
	if(!StringUtility.Compare(hash, player.Password)) {
		player.sendnow("Incorrect password.\n\r");
		player.socket.destroy();
		Player.Players.splice(Player.Players.indexOf(player), 1);
		console.log(`${player.Name} disconnected - incorrect password`);
	}
	else {
		player.status = "Playing";
		

		Character.DoCommands.DoHelp(player, "greeting");
		player.send("\n\rWelcome to the Crimson Stained Lands!\n\r\n\r");
		var room = RoomData.Rooms[player.RoomVNum];
		player.AddCharacterToRoom(room? room : RoomData.Rooms["3700"]);
		player.Act("The form of $n appears before you.", null, null, null, "ToRoom");
	}
	return true;
	
}
return false;
}





function fixExits() {
for(var roomvnum in AreaData.AllRooms) {
	var room = AreaData.AllRooms[roomvnum];
	for(var index = 0; index < 6; index++) {
		if(room.Exits[index] && room.Exits[index].DestinationVNum) {
			room.Exits[index].Destination = AreaData.AllRooms[room.Exits[index].DestinationVNum];
		}
	}
}
}

var UpdateCombatCounter = 12;
function Update() {

	if(--UpdateCombatCounter <= 0) {
		UpdateCombat();
		UpdateCombatCounter = 12;
	}
}

function UpdateCombat() {
	for(var character of StringUtility.CloneArray(Character.Characters)) {
		if(character.Fighting) {
			Character.Combat.ExecuteRound(character);
		}
	}
}