// Includes
Ti.include('functions/utils.js');

// Hide to clear space
clearDashboard();

// Main window
var main = Ti.UI.createWindow({
	backgroundImage: 'img/background_green_right.png',
	orientationModes: [Ti.UI.PORTRAIT],
	opacity: 0,
	width: 768,
	left: -768,
	title: 'AcrySof® IQ'
});

var section = { 
	touchFlag: true 
};

main.addEventListener('focus', function () {
	main.animate({opacity: 1, left: 0, duration: 500});

	// Animate inner content
	simulationContainer.animate({opacity: 1, duration: 800}, function () {
		headerTitle.view.animate({top: 0, opacity: 1, duration: 600}, function () {
			section.touchFlag = false;
		});
	});
});

// Title
var mainTitle = Ti.UI.createLabel({
	width: 450,
	height: 40,
	text: 'AcrySof® IQ',
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
		title: 'Operação',
		top: 35,
		left: 20,
		width: 120,
		height: 45
	}
}, 'click', function () {
		// Create a new window
          var newWindow = Ti.UI.createWindow({
            url: 'section4.js'
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

// Stamp
var bottomStamp = createStampImg({
	view: {
		image: 'img/stamp1.png',
		bottom: 27,
		right: 10,
		width: 104,
		height: 52
	}
});
main.add(bottomStamp);

var headerTitle = makeTitle({
	view: {
		top: 70,
		left: 0,
		width: 550,
		height: 60,
		opacity: 0,
		backgroundImage:'img/header_description_bg.png'		
	},
	title: {
		text: 'Visão com aberrações',
		color: '#9284be',
		top: 15,
		font: { fontSize: 28 },
		textAlign: 'center',
		width: 'auto',
		height: 'auto',
		opacity: 1
	}
});
body.add(headerTitle.view);

var simulationContainer = Ti.UI.createImageView({
	image: 'img/section_acrysof_iq_before.png',
	opacity: 0,
	top: 9
});
body.add(simulationContainer);

var simulationContainer2 = Ti.UI.createImageView({
	image: 'img/section_acrysof_iq_after.png',
	opacity: 0,
	top: 9
});
body.add(simulationContainer2);

// Event for simulation
var touchSlide = function touchSlide( element, startX, endX, callback ) {
	// Scope function variables
	element = element || [];
	callback = callback || function () {};
	// Local function variables
	var touchFlag = false;
	var middleLeftX = endX/3;
	var middleRightX = (endX/3)*2;
	var headerTitleContent = ['Visão com aberrações', 'Visão com AcrySof® IQ'];

	if ( element ) {
			element[0].addEventListener('touchstart', function ( start ) {
				// Left to right touch
				if ( start.x >= middleRightX && start.x <= endX && touchFlag === false ) {
					// Define with touch end stop, in the final of limit in the image view
					element[0].addEventListener('touchend', function ( end ) {
						if ( end.x >= startX && end.x < middleLeftX && touchFlag === false ) {
							element[0].animate({opacity: 0, duration: 700});
							
							headerTitle.title.animate({opacity: 0, duration: 500}, function () {
								headerTitle.title.text = headerTitleContent[1];
								headerTitle.title.animate({opacity: 1, duration: 500});
							});

							element[1].animate({opacity: 1, duration: 1000});
							touchFlag = true;
						}
					});
				}
			});

			element[1].addEventListener('touchstart', function ( start ) {
				// Right to left touch
				if ( start.x >= startX && start.x <= middleLeftX && touchFlag === true ) {
					// Limit definition
					element[1].addEventListener('touchend', function ( end ) {
						if ( end.x >= middleRightX && end.x < endX && touchFlag === true ) {
							element[1].animate({opacity: 0, duration: 700});

							headerTitle.title.animate({opacity: 0, duration: 500}, function () {
								headerTitle.title.text = headerTitleContent[0];
								headerTitle.title.animate({opacity: 1, duration: 500});
							});

							element[0].animate({opacity: 1, duration: 1000});
							
							touchFlag = false;
						}
					});
				}
			});
	}

	return callback();
};

touchSlide( [simulationContainer, simulationContainer2], 0, 550 );
// Final of the events

// Main footer menu
var footerMainMenu = createFooterMenu();
main.add(footerMainMenu);

// Open the main window
main.open();