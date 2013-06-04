$(document).ready(function() {
	var socket = io.connect(window.location);

	//REJESTRACJA
	$('#btnRegister').click(function(){
		var login = $('#inputLoginR').val();
		var pass = $('#inputPasswordR').val();
		var retype = $('#inputRetypePasswordR').val();
		//usuniecie ostrzezen
		$('.alert').remove();

		if (!(login.length>0 && login.length<=20 && pass.length>5 && pass.length<=20)) {
				$('<div class="alert alert-error">Długość loginu i hasła nie może przekraczać 20 znaków, hało musi mieć min. 6 znaków</div>').insertAfter($('#registerForm'));
			} else
				if(!((/^[a-z0-9]+$/i).test(login) && (/^[a-z0-9]+$/i).test(pass))) {
					$('<div class="alert alert-error">Login i hasło mogą składać się tylko z liter i cyfr</div>').insertAfter($('#registerForm'));
				} else
					if(pass!=retype) {
						$('<div class="alert alert-error">Przepisane hasło jest nieprawidłowe</div>').insertAfter($('#registerForm'));
					} else {
						//proba rejestracji uzytkownika
						pass = CryptoJS.SHA3(pass).toString();
						socket.emit('register',login,pass);
						$(this).hide();
					}
	});

	//wynik rejestracji
	socket.on('registered',function(registered) {
		if(registered) {
			$('<div class="alert alert-success">Zostałeś zarejestrowany. Teraz możesz się zalogować</div>').insertAfter($('#registerForm'));
		} else {
			$('<div class="alert alert-error">Taki użytkownik już istnieje lub wystąpił błąd</div>').insertAfter($('#registerForm'));
			$('#btnRegister').show();
		}
	});

	//LOGOWANIE
	$('#btnLogin').click(function(){
		var login = $('#inputLoginL').val();
		var pass = $('#inputPasswordL').val();
		//usuniecie ostrzezen
		$('.alert').remove();
		//proba zalogowania
		pass = CryptoJS.SHA3(pass).toString();
		socket.emit('login',login,pass);
		$(this).hide();
	});

	//wynik logowania
	socket.on('loggedin',function(loggedin){
		if(loggedin) {
			//ZALOGOWANO
			$('#goLogin, #goRegister, #goInfo').slideUp();
			$('#loginForm').fadeOut(function(){
				$('#gameList').fadeIn();
				$('#nick').text($('#inputLoginL').val()); //nick na gornej belce w #game
			});
		} else {
			$('<div class="alert alert-error">Nieprawidłowe dane logowania lub wystąpił błąd</div>').insertAfter($('#loginForm'));
			$('#btnLogin').show();
		}
	});

	//przy zmianie menu znikaja ostrzezenia
	$('#goLogin, #goRegister, #goInfo').click(function(){
		$('.alert').remove();
	})

	//klikanie w pozycje na liscie gier
	$(document).on('click','#tableGameList table tbody tr',function(){
		$('tbody tr').removeClass('choosenGame');
		$(this).addClass('choosenGame');
		$('#joinBtn').removeClass('disabled');
	});

	//tworzenie nowej gry
	$('#createBtn').click(function() {
		var name = prompt("Nazwa gry (dozwolone tylko litery i cyfry)");
		if(name!=null) {
			socket.emit('newgame',name);
		}
	});
	//odpowiedz na stworzenie gry lub dolaczenie do istniejacej
	socket.on('joinedToGame',function(joined,room,coins){
		if(joined) {
			$('#gameList').fadeOut(function(){
				$('#room').text(room);
				$('#coins').text(coins);
				$('#game').fadeIn(function(){

				});
			})
		} else {
			alert("Podana nazwa jest nieprawidłowa lub zajęta");
		}
	});
	//dolaczenie do gry
	$('#joinBtn').click(function(){
		if(!$(this).hasClass('disabled')) {
			var name = $('.choosenGame td:eq(1)').text();
			socket.emit('joinGame',name);
		} else alert('Najpierw wybierz, do której gry chcesz dołączyć');
	});

	//info o nowej grze
	socket.on('newRoom',function(lp,name,count) {
		$('tbody').append($('<tr id="'+name+'"><td>'+lp+'</td><td>'+name+'</td><td>'+count+'</td></tr>'));
	});

	//info o zmianie liczby graczy w grze
	socket.on('updateRoom',function(name,count){
		$('tr#'+name+' td:last').text(count);
	});

	//info o usunieciu gry
	socket.on('deleteRoom',function(name){
		$('tr#'+name).remove();
		//poprawa numeracji gier
		$('tbody tr').each(function(i){
			$(this).children().first().text(i+1);
		});
	});

	//wysylanie wiadomosci czatu
	$('#msg').keypress(function(key){
		if(key.keyCode == 13) {
			socket.emit('msg',$('#msg').val());
			$('#msg').val("");
		}
	});

	//odebranie wiadomosci czatu
	socket.on('msg',function(nick,msg){
		$('#msgList').append("<p><b>"+nick+": </b>"+msg+"</p>");
		$('#msgList').animate({scrollTop: $('#msgList').prop("scrollHeight")},500);
	});

	//powrot do lobby
	$('#wyjdz').click(function(){
		$('#gameList tbody').html("");
		socket.emit('returnToLobby');
		$('#game').fadeOut(function(){
			$('#gameList').fadeIn();
		});
	});
});