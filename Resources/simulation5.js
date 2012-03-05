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
	title: 'AcrySof® IQ ReSTOR® Toric'
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
	width: 600,
	height: 40,
	text: 'AcrySof® IQ ReSTOR® Toric',
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
		title: 'Lente',
		top: 35,
		left: 20,
		width: 120,
		height: 45,
		backgroundImage: 'img/button_green_content.png'
	}
}, 'click', function () {
		// Create a new window
          var newWindow = Ti.UI.createWindow({
            url: 'section5.js'
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
	image: 'img/section_acry_iq_restor_toric_before.png',
	opacity: 0,
	top: 9
});
body.add(simulationContainer);

var simulationContainer2 = Ti.UI.createImageView({
	image: 'img/section_acry_iq_restor_toric_after.png',
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
	var headerTitleContent = ['Visão com catarata', 'Visão sem catarata'];
	var limitX = limit;

	if ( element ) {
			element[0].addEventListener('touchstart', function ( start ) {
				element[0].addEventListener('touchend', function ( end ) {
					if ( end.x > start.x + limitX && touchFlag === false ) {
						element[0].animate({opacity: 0, duration: 700});
						
						headerTitle.title.animate({opacity: 0, duration: 500}, function () {
							headerTitle.title.text = headerTitleContent[1];
							headerTitle.title.animate({opacity: 1, duration: 500});
						});

						element[1].animate({opacity: 1, duration: 1000});
						touchFlag = true;
					}
				});
			});

			element[1].addEventListener('touchstart', function ( start ) {
				element[1].addEventListener('touchend', function ( end ) {
					if ( end.x < start.x - limitX && touchFlag === true ) {
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

touchSlide( [simulationContainer, simulationContainer2], 100 );

var pageChange = function pageChange() {
	var flag = false;
	var newPath = {};
		newPath['url'] = Ti.UI.currentWindow.url;
		newPath['urlNumber'] = parseInt(newPath['url'].match('[0-9]')[0])
		newPath['name'] = newPath.url.replace(/[0-9]+[.]js$/, '');
		newPath['next'] = newPath['urlNumber'] + 1;
		newPath['previous'] = newPath['urlNumber'] - 1;

	main.addEventListener('touchstart', function ( start ) {
		main.addEventListener('touchend', function ( end ) {
			if ( start.x > 500 && end.x < 768) {
				if ( start.x - end.x > 50 ) {
					if ( newPath['next'] > 0 && newPath['next'] < 7 ) {
						if ( newPath['next'] === 6 ) {
							// Create a new window
						    var newWindow = Ti.UI.createWindow({
						      url: 'section' + newPath.next + '.js'
						    });
						    // Close old window and open the new
						    main.close();
						    newWindow.open();
						} else {
							// Create a new window
						    var newWindow = Ti.UI.createWindow({
						      url: newPath.name + newPath.next + '.js'
						    });
						    // Close old window and open the new
						    main.close();
						    newWindow.open(); 
						}
					}
				}
			} if ( start.x > 0 && end.x < 500 ) {
				if ( start.x - end.x < -50) {
					if ( newPath['previous'] > 0 && newPath['previous'] < 7 ) {
						// Create a new window
					    var newWindow = Ti.UI.createWindow({
					      url: newPath.name + newPath.previous + '.js'
					    });
					    // Close old window and open the new
					    main.close();
					    newWindow.open();
					}
				}
			}
		});
	});
};

pageChange();
// Final of the events

// Main footer menu
var footerMainMenu = createFooterMenu(main);
main.add(footerMainMenu);

// Open the main window
main.open();