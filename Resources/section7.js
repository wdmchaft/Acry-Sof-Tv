// Section 2
// Includes
Ti.include('functions/utils.js');

// Hide to clear space
clearDashboard();

var main = Ti.UI.createWindow({
	backgroundImage: 'img/background_extra.png',
	orientationModes: [Ti.UI.PORTRAIT],
	opacity: 0,
	width: 768,
	left: -768,
	title: 'Extras'
});

main.addEventListener('focus', function () {
	main.animate({opacity: 1, left: 0, duration: 500});
});

previousToSimulation();

main.addEventListener('touchend', function ( end ) {
	if ( end.x > 60 && end.y < 750 && end.source.winName === 'main' ) {
		var newWindow = Ti.UI.createWindow({
			url: 'menu.js'
		});
		// Close old window and open the new
		main.close();
		newWindow.open();
	}
});

var footerMainMenu = createFooterMenu(main);
main.add(footerMainMenu);
// Open the main window
main.open();