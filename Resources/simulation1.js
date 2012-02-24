// Includes
Ti.include('functions/utils.js');

// Hide to clear space
clearDashboard();

// Main window
var main = Ti.UI.createWindow({
	backgroundImage: 'img/background_purple_right.png',
	orientationModes: [Ti.UI.PORTRAIT],
	opacity: 0,
	width: 768,
	left: -768,
	title: 'catarata'
});

var section = { 
	touchFlag: true 
};

main.addEventListener('focus', function () {
	main.animate({opacity: 1, left: 0, duration: 500});

	// Animate inner content
	simulation.animate({opacity: 1, duration: 800}, function () {
		headerTitle.view.animate({top: 0, opacity: 1, duration: 600}, function () {
			section.touchFlag = false;
		});
	});
});

// Title
var mainTitle = Ti.UI.createLabel({
	width: 300,
	height: 40,
	text: 'Catarata',
	color: '#1c7a98',
	top: 40,
	right: 100,
	textAlign: 'right',
	font: {
		fontSize: 42,
		fontFamily: 'Swiss 721',
		fontStyle: 'normal'
	}
});
main.add(mainTitle);

// Next button to leave this page
var previousButton = createNavigationButton({
	button: {
		title: '',
		top: 35,
		left: 25,
		backgroundImage: defaultStyle.navigation.button.prevBgImg,
		width: 60,
		height: 114
	}
}, 'click', function () {
		// Create a new window
          var newWindow = Ti.UI.createWindow({
            url: 'section1.js'
          });
          // Close old window and open the new
          main.close();
          newWindow.open();
});
main.add(previousButton);

// Inner content
var body = Ti.UI.createView({
	top: 160,
	left: 110,
	width: 550,
	height: 760
});
main.add(body);

var headerTitle = makeTitle({
	view: {
		top: 0,
		left: 0,
		width: 550,
		height: 65,
		top: 70,
		opacity: 0,
		backgroundImage:'img/header_description_bg.png'		
	},
	title: {
		text: 'Visão com catarata',
		color: '#9284be',
		top: 10,
		font: { fontSize: 28 },
		textAlign: 'center',
		width: 'auto',
		height: 'auto'
	}
});
body.add(headerTitle.view);

var simulation = Ti.UI.createImageView({
	image: 'img/simulation_catarata_before.png',
	opacity: 0
});
body.add(simulation);

// Main footer menu
var footerMainMenu = createFooterMenu();
main.add(footerMainMenu);

// Open the main window
main.open();