// Includes
Ti.include('functions/utils.js');

// Hide to clear space
clearDashboard();	
// Main window
var main = Ti.UI.createWindow({
	backgroundImage: 'img/background_editorial.png',
	orientationModes: [Ti.UI.PORTRAIT],
	opacity: 0,
	width: 768,
	left: -768,
	title: 'editorial'
});

main.addEventListener('focus', function () {
	main.animate({opacity: 1, left: 0, duration: 500});
});

var nextButton = createNavigationButton({
	button: {
		title: 'Voltar ao Menu',
		top: 40,
		right: 30,
		width: 167,
		height: 45,
		backgroundImage: 'img/button_back_content.png'
	}
}, 'click', function () {
	    // go to next page
	    var newWindow = Ti.UI.createWindow({
	    	url: 'menu.js'
	    });
	    // Close old window and open the new
	    main.close();
	    newWindow.open();
});
main.add(nextButton);

// Area for the content
var contentArea = Ti.UI.createView({
	width: 550,
	height: 700,
	top: 155,
	left: 125
});
main.add(contentArea);

// Target content area
var content = Ti.UI.createLabel({
	text: sectionContent.editorial.fieldByName('content'),
	textAlign: 'left',
	top: 0,
	left: 0,
	width: 'auto',
	height: 'auto',
	color: '#fff',
	font: { fontSize: defaultStyle.typo.size }
});
contentArea.add(content);

// Main footer menu
var footerMainMenu = createFooterMenu();
main.add(footerMainMenu);

// open the main window
main.open();