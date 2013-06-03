$(document).ready(function(){

	$('#loginForm').show();
	//$('#game').show();

	$('a').click(function(event) {
		event.preventDefault();
	});

	$('button').click(function(event) {
		event.preventDefault();
	});

	var currentMenu = $('#loginForm'); //aktualnie wyswietlony div
	var allowShowMenu = true; //pozwolenie na zmiane menu
	//funkcja do nawigacji (gorne menu)
	var showMenu = function(div,cb) {
		if(allowShowMenu) {
			allowShowMenu = false;
			currentMenu.fadeOut(function(){
				div.fadeIn(function(){
					currentMenu = div;
					allowShowMenu = true;
					cb();
				});
			});
		}
	}

	//gorne menu
	$('#goLogin').click(function(){
		if(!$(this).hasClass('active')){
			showMenu($('#loginForm'),function(){
				$('ul.nav li').removeClass('active');
				$('#goLogin').addClass('active');
			});
		}
	});
	$('#goRegister').click(function(){
		if(!$(this).hasClass('active')){
			showMenu($('#registerForm'),function(){
				$('ul.nav li').removeClass('active');
				$('#goRegister').addClass('active');
			});
		}
	});
	$('#goInfo').click(function(){
		if(!$(this).hasClass('active')){
			showMenu($('#about'),function(){
				$('ul.nav li').removeClass('active');
				$('#goInfo').addClass('active');
			});		
		}
	});

});