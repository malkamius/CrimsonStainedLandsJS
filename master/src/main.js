net = require("net");
areas = require("./areas");
Player = require("./Player");
RoomData = require("./RoomData");
StringUtility = require("./StringUtility");
Commands = require("./Commands");
ActInfo = require("./ActInfo");

areas.load(function() { 
	console.log(Object.keys(areas.Rooms).length + " rooms loaded.");
	fixExits();
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
	  if(StringUtility.Compare(player.name, name)) {
		  return player;
	  }
  }
}

function broadcastMessage(socket, message) {
	var player = getplayer(socket);
	for (const otherplayer of Player.Players) {
		if (otherplayer.name !== null && otherplayer != player) {
		  otherplayer.socket.write(`${message}\n`);
		} 
	  
  }
}

function handleplayerLeaving(socket) {
  player = getplayer(socket)
  console.log(`${player.name} disconnected`)
  if(player.name)
	broadcastMessage(socket, `The form of ${player.name} pops out of existence!`)
  
  if(player != null) Player.Players.splice(Player.Players.indexOf(player), 1);
}

function startListening(port) {
	setTimeout(function () {
		  pulse()
		}, 250);
	net.createServer((socket) => {
	  socket.on('error', function(ex) {
		console.log("handled error");
		console.log(ex);
		});
		console.log(`Connection from ${socket.remoteAddress} port ${socket.remotePort}`)
		player = new Player(socket);
		
		Character.DoCommands.DoHelp(player, "diku", true);
		
		player.send("Please enter your name: ");
		
		
		socket.on("data", (buffer) => {
		  player = getplayer(socket)
		  const message = buffer.toString("utf-8").replace("\r", "");
		  player.input = player.input + message;
		})
		
		socket.on("end", () => handleplayerLeaving(socket))
	})
  
    .listen(port, () => {
		console.log(`Listening on port ${port}`)
    });
}

function pulse()
{
	for(player of Player.Players)
	{
		handleinput(player);
		
		handleoutput(player);
		
	}
	setTimeout(function () {
      pulse()
    }, 250);
}

function handleoutput(player) {
	if(player.output != null && player.output != "")
		player.socket.write(player.output);
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
				var args = oneargument(str);

				for(var key in Commands) {
					if(StringUtility.Prefix(key, args[0])) {
						Commands[key](player, args[1]);
						return;
					}
				}
				
				player.send("Huh?\n\r");
			}
		}
	}
}

function nanny(player, input) {
	if(!player.name) {
		var regex = /\s/;
		var result = regex.exec(input);
		if(result && result.index) {
			player.send("Name cannot contain whitespace.\n\r");
			return true;
		}
		var otherplayer = getplayerbyname(input);
		if(otherplayer) {
			player.send(`That name is already taken.\n`);
			player.send(`What is your name? `);
			return true;
		}
		player.status = "Playing";
		player.name = StringUtility.Capitalize(input);
		Character.DoCommands.DoHelp(player, "greeting");
		player.send("\n\rWelcome to the Crimson Stained Lands!\n\r\n\r");
		broadcastMessage(player.socket, `The form of ${player.name} appears before you!`);
		player.AddCharacterToRoom(RoomData.Rooms["3700"]);
		
		return true;
	}
	return false;
}

function oneargument(text) {
	var regex = /[\s']/;
	const results = regex.exec(text);
	if(results != null && results.index != null && results.index != -1) {
		return [text.substr(0, results.index), text.length > results.index? text.substr(results.index + 1) : ""];
	}
	else
		return [text, ""];
}



function fixExits() {
	for(var roomvnum in areas.Rooms) {
		var room = areas.Rooms[roomvnum];
		for(var index = 0; index < 6; index++) {
			if(room.exits[index] && room.exits[index].destinationVnum)
				room.exits[index].destination = areas.Rooms[room.exits[index].destinationVnum];
		}
	}
}

