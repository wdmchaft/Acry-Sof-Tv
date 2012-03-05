// Includes
Ti.include('functions/utils.js');

// Hide to clear space
clearDashboard();

// Main window
var main = Ti.UI.createWindow({
	backgroundImage: 'img/background_purple_green_left.png',
	orientationModes: [Ti.UI.PORTRAIT],
	opacity: 0,
	width: 768,
	left: -768,
	title: 'Qualidade AcrySof® ASFÉRICA'
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
	width: 550,
	height: 100,
	text: 'Por que você merece em seus olhos uma AcrySof® ASFÉRICA?',
	color: '#1c7a98',
	top: 20,
	left: 100,
	textAlign: 'left',
	font: {
		fontSize: 38,
		fontFamily: 'Swiss 721',
		fontStyle: 'normal'
	}
});
main.add(mainTitle);

// Inner content
var body = Ti.UI.createView({
	top: 160,
	left: 110,
	width: 550,
	height: 760
});
main.add(body);

makeStampExtra();

var headerTitle = makeTitle({
	view: {
		top: 20,
		left: 0,
		width: 550,
		height: 336,
		opacity: 0,
		backgroundImage:'img/last_description_bg.png'		
	},
	title: {
		text: sectionContent.section6,
		color: '#fff',
		top: 15,
		left: 20,
		font: { fontSize: 22 },
		textAlign: 'left',
		width: 'auto',
		height: 'auto',
		opacity: 1
	}
});
body.add(headerTitle.view);

var simulationContainer = Ti.UI.createImageView({
	image: 'img/section_acry_asferica_before.png',
	opacity: 0,
	top: 312
});
body.add(simulationContainer);

var simulationContainer2 = Ti.UI.createImageView({
	image: 'img/section_acry_asferica_after.png',
	opacity: 0,
	top: 312
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

	if ( element ) {
			element[0].addEventListener('touchstart', function ( start ) {
				// Left to right touch
				if ( start.x >= startX && start.x <= middleLeftX && touchFlag === false ) {
					// Define with touch end stop, in the final of limit in the image view
					element[0].addEventListener('touchend', function ( end ) {
						if ( end.x >= middleRightX && end.x < endX && touchFlag === false ) {
							element[0].animate({opacity: 0, duration: 700});
							element[1].animate({opacity: 1, duration: 1000});
							touchFlag = true;
						}
					});
				}
			});

			element[1].addEventListener('touchstart', function ( start ) {
				// Right to left touch
				if ( start.x >= middleRightX && start.x <= endX && touchFlag === true ) {
					// Limit definition
					element[1].addEventListener('touchend', function ( end ) {
						if ( end.x >= startX && end.x < middleLeftX && touchFlag === true ) {
							element[1].animate({opacity: 0, duration: 700});
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