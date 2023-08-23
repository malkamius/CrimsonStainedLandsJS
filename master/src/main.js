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

function HandlePlayerDisconnect(socket) {
  player = getplayer(socket)
  console.log(`${player.name} disconnected`)

  
  if(player.state == "Playing")
  {
	player.Act("The form of $n fades away.", null, null, null, "ToRoom")	
  }

  player.RemoveCharacterFromRoom();

  if(player != null) Player.Players.splice(Player.Players.indexOf(player), 1);
}

function HandleNewSocket(socket) {
	socket.on('error', function(ex) {
		console.log(ex);
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
	{


		if(player.status == "Playing") {
			if(!player.output.startsWith("\n") && player.SittingAtPrompt)
				player.output = "\n" + player.output;
			if(!player.output.endsWith("\n"))
				player.output = player.output + "\n";
			player.output = player.output + player.GetPrompt();
			player.SittingAtPrompt = true;
		}
		player.socket.write(player.output.replace("\n", "\n\r"), "ascii");
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
				var args = oneargument(str);
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
	if(!player.name) {
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

		player.status = "Playing";
		player.name = StringUtility.Capitalize(input);
		Character.DoCommands.DoHelp(player, "greeting");
		player.send("\n\rWelcome to the Crimson Stained Lands!\n\r\n\r");
		player.AddCharacterToRoom(RoomData.Rooms["3700"]);
		player.Act("The form of $n appears before you.", null, null, null, "ToRoom");
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

