var sqlite3 = require('sqlite3');

var db = new sqlite3.Database("./users.db");

/*
	dodawanie uzytkownika do bazy
	zwraca true jezeli dodano	
*/
exports.addUser = function addUser(login,pass,res) {
	// max 20 znakow, haslo min 6 znakow, tylko litery i cyfry
	if (login.length>0 && login.length<=20 && pass.length>5 && pass.length<=20) {
		if((/^[a-z0-9]+$/i).test(login) && (/^[a-z0-9]+$/i).test(pass)) {
			var stmt = 'SELECT COUNT(*) AS count FROM users WHERE login=?';
			db.get(stmt,login,function(err,row) {
				//nick wolny
				if(row.count==0) {
					//dodaje do bazy
					stmt = db.prepare('INSERT INTO users VALUES (?,?,500)');
					stmt.run(login,pass);
					stmt.finalize();
					res(true);
				} else res(false);
			});
		} else res(false);
	} else res(false);
}

/*
	logowanie uzytkownika	
	zwraca true jezeli dane sa poprawne
*/
exports.authUser = function authUser(login,pass,res) {
	var stmt = 'SELECT COUNT(*) AS count FROM users WHERE login=? AND pass=?';
	db.get(stmt,login,pass,function(err,row) {
		//dane logowania sie zgadzaja
		if(row.count==1) {
			res(true);
		} else res(false);
	});
}

/*
	zwraca ilosc monet uzytkownika
*/
exports.getCoins = function getCoins(login,res) {
	var stmt = 'SELECT coins FROM users WHERE login=?';
	db.get(stmt,login,function(err,row) {
		res(row.coins);
	});
}

/*
	zapisuje ilosc monet uzytkownika do bazy
	zwraca true
*/
exports.setCoins = function setCoins(login,coins,res) {
	var stmt = 'UPDATE users SET coins=? WHERE login=?';
	db.run(stmt,coins,login,function(err,r) {
		res(true);
	});
}