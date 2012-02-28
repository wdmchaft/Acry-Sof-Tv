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
	simulationContainer.animate({opacity: 1, duration: 800}, function () {
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
		top: 70,
		left: 0,
		width: 550,
		height: 60,
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
		height: 'auto',
		opacity: 1
	}
});
body.add(headerTitle.view);

var simulationContainer = Ti.UI.createImageView({
	image: 'img/simulation_catarata_before.png',
	opacity: 0,
	top: 9
});
body.add(simulationContainer);

// Event for simulation
var touchSlide = function touchSlide( element, startX, endX, callback ) {
	// Scope function variables
	element = element || '';
	callback = callback || function () {};
	// Local function variables
	var touchFlag = false;
	var middleLeftX = endX/3;
	var middleRightX = (endX/3)*2; 
	var headerTitleContent = ['Visão com catarata', 'Visão sem catarata'];

	if ( element ) {
		element.addEventListener('touchstart', function touchEffectLeftRight( start ) {
			Ti.API.info(start.x);
			// Left to right touch
			if ( start.x >= startX && start.x <= middleLeftX && touchFlag === false ) {
				// Define with touch end stop, in the final of limit in the image view
				element.addEventListener('touchend', function ( end ) {
					if ( end.x >= middleRightX && end.x < endX && touchFlag === false ) {
						setTimeout(function () {
							headerTitle.title.animate({opacity: 0, duration: 800});
							element.animate({opacity: 0, duration: 800});

							setTimeout(function () {
								headerTitle.title.text = headerTitleContent[1];
								element.image = 'img/simulation_catarata_after.png';

								setTimeout(function () {
									headerTitle.title.animate({opacity: 1, duration: 800});
									element.animate({opacity: 1, duration: 800}, function () {
										touchFlag = true;
									});
								}, 200);
							}, 1600);
						}, 200);
					}
				});
			}

			// Right to left touch
			if ( start.x >= middleRightX && start.x <= endX && touchFlag === true ) {
				// Limit definition
				element.addEventListener('touchend', function ( end ) {
					if ( end.x >= startX && end.x < middleLeftX && touchFlag === true ) {
						setTimeout(function () {
							headerTitle.title.animate({opacity: 0, duration: 800});
							element.animate({opacity: 0, duration: 800});

							setTimeout(function () {
								headerTitle.title.text = headerTitleContent[1];
								element.image = 'img/simulation_catarata_before.png';

								setTimeout(function () {
									headerTitle.title.animate({opacity: 1, duration: 800});
									element.animate({opacity: 1, duration: 800}, function () {
										touchFlag = false;
									});
								}, 200);
							}, 1600);
						}, 200);
					}
				});
			}
		});
	}

	return callback();
};

touchSlide( simulationContainer, 0, 545, function () {
	setTimeout(function () {}, 200);
});
// Final of the events

// Main footer menu
var footerMainMenu = createFooterMenu();
main.add(footerMainMenu);

// Open the main window
main.open();