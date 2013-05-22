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
		socket.emit('login',login,pass);
		$(this).hide();
	});

	//wynik logowania
	socket.on('loggedin',function(loggedin){
		if(loggedin) {
			//ZALOGOWANO
			$('#goLogin, #goRegister, #goInfo').slideUp();
			$('#loginForm').fadeOut(function(){
				$('#gameList').fadeIn(function(){
					
				});
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

});