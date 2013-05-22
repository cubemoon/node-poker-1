var socketio = require('socket.io');
var io;
var accountManager = require('./accountManager');

exports.listen = function(server) {
	io = socketio.listen(server);

	io.sockets.on('connection', function(player) {
		player.set('loggedIn',false);

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
					player.set('loggedin',true);
				}
				else player.emit('loggedin',false);
			});
		});

	});
}