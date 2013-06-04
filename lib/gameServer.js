var socketio = require('socket.io');
var io;
var accountManager = require('./accountManager');

exports.listen = function(server) {
	io = socketio.listen(server);

	var rooms = new Array(); //lista gier {name,count}

	io.sockets.on('connection', function(player) {

		var playerLoggedIn = false;
		var nick = "";
		var currentRoom = "";

		//rejestracja uzytkownika
		player.on('register',function(login,pass){
			accountManager.addUser(login,pass,function(registered) {
				if(registered) player.emit('registered',true);
				else player.emit('registered',false);
			});
		});

		//logowanie uzytkownika
		player.on('login',function(login,pass){
			accountManager.authUser(login,pass,function(loggedin) {
				if(loggedin) {
					player.emit('loggedin',true);
					playerLoggedIn = true;
					nick = login;
					player.join("lobby");
					for(var i=0;i<rooms.length;i++) {
						player.emit('newRoom',i+1,rooms[i].name,rooms[i].count);
					}
				}
				else player.emit('loggedin',false);
			});
		});

		//tworzenie nowej gry
		player.on('newgame',function(name){
			if(playerLoggedIn) {
				var error = false;
				if((/^[a-z0-9]+$/i).test(name) && name!="lobby") {
					for(var i=0;i<rooms.length;i++) {
						if(name==rooms[i].name) error=true; 
					}
				} else error=true;
				if(!error) {
					rooms.push({"name" : name, "count" : 1});
					player.leave(currentRoom);
					player.join(name);
					currentRoom = name;
					accountManager.getCoins(nick,function(coins) {
						player.emit("joinedToGame",true,currentRoom,coins);
					});
					player.broadcast.to("lobby").emit('newRoom',rooms.length,name,1); //informuje lobby o nowej grze
				} else player.emit("joinedToGame",false);
			}	
		});

		//dolaczenie do gry
		player.on('joinGame',function(name){
			if(playerLoggedIn) {
				for(var i=0;i<rooms.length;i++) {
					if(rooms[i].name==name) {
						player.leave(currentRoom);
						currentRoom = name;
						player.join(currentRoom);
						rooms[i].count++;
						accountManager.getCoins(nick,function(coins) {
							player.emit("joinedToGame",true,currentRoom,coins);
						});
						player.broadcast.to("lobby").emit('updateRoom',name,rooms[i].count); //informuje lobby o zmianie ilosci graczy
						break;
					}
				}
			}
		});

		//funkcja wykonywana przy rozlaczeniu lub wyjsciu z gry do lobby
		var leaveRoom = function() {
			if(playerLoggedIn) {
				for(var i=0;i<rooms.length;i++) {
					if(rooms[i].name==currentRoom) {
						if(rooms[i].count == 1) {
							player.broadcast.to("lobby").emit('deleteRoom',rooms[i].name);
							rooms.splice(i,1); //usuwam gre
						} else {
							rooms[i].count--; //lub zmniejszam l.graczy
							player.broadcast.to("lobby").emit('updateRoom',rooms[i].name,rooms[i].count);
						}
						break;
					}
				}
			}
		}

		//rozlaczenie
		player.on('disconnect',function(){
			leaveRoom();
		});

		//wyjscie z gry do lobby
		player.on('returnToLobby',function(){
			leaveRoom();
			player.leave(currentRoom);
			currentRoom = "";
			player.join("lobby");
			for(var i=0;i<rooms.length;i++) {
				player.emit('newRoom',i+1,rooms[i].name,rooms[i].count);
			}
		});

		//wiadomosc czatu
		player.on('msg',function(msg) {
			if(playerLoggedIn && msg!='') {
				player.broadcast.to(currentRoom).emit('msg',nick,msg);
				player.emit('msg',nick,msg);
			}
		});

	});
}