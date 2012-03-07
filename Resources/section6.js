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
		top: 70,
		left: -1,
		width: 552,
		height: 60,
		opacity: 0,
		backgroundImage:'img/header_description_bg.png'		
	},
	title: {
		text: 'Visão noturna com aberrações',
		color: '#9284be',
		top: 15,
		font: { fontSize: 24 },
		textAlign: 'center',
		width: 'auto',
		height: 'auto',
		opacity: 1
	}
});
body.add(headerTitle.view);

var simulationContainer = Ti.UI.createImageView({
	image: 'img/boat_1.png',
	opacity: 0,
	top: 9
});
body.add(simulationContainer);

var simulationContainer2 = Ti.UI.createImageView({
	image: 'img/boat_2.png',
	opacity: 0,
	top: 9
});
body.add(simulationContainer2);

// Event for simulation
var touchSlide = function touchSlide( element, limit, callback ) {
	// Scope function variables
	element = element || [];
	callback = callback || function () {};
	// Local function variables
	var touchFlag = false;
	var headerTitleContent = ['Visão noturna com aberrações', 'Visão noturna com AcrySof® ASFÉRICA'];
	var limitX = limit;

	if ( element ) {
		var startx;
		var endx;
		var distance;

		element[0].addEventListener('touchstart', function ( start ) {
			info('started')
			startx = start.x;
			element[0].addEventListener('touchmove', function ( e ) {
				endx = e.x;
				distance = startx - endx;
				
				if ( distance > limitX && touchFlag === false ) {
					element[0].animate({opacity: 0, duration: 700});

					headerTitle.title.animate({opacity: 0, duration: 500}, function () {
						headerTitle.title.text = headerTitleContent[0];
						headerTitle.title.animate({opacity: 1, duration: 500});
					});

					element[1].animate({opacity: 1, duration: 1000});

					touchFlag = true;
				}
			});
		});

		element[1].addEventListener('touchstart', function ( start ) {
			startx = start.x;
			element[1].addEventListener('touchmove', function ( e ) {
				endx = e.x;
				distance = startx - endx;
				
				if ( distance < -limitX && touchFlag === true ) {
					element[1].animate({opacity: 0, duration: 700});

					headerTitle.title.animate({opacity: 0, duration: 500}, function () {
						headerTitle.title.text = headerTitleContent[0];
						headerTitle.title.animate({opacity: 1, duration: 500});
					});

					element[0].animate({opacity: 1, duration: 1000});

					touchFlag = false;
				}
			});
		});
	}

	return callback();
};

touchSlide( [simulationContainer, simulationContainer2], 25 );

pageChange();
// Final of the events

// Main footer menu
var footerMainMenu = createFooterMenu(main);
main.add(footerMainMenu);

// Open the main window
main.open();