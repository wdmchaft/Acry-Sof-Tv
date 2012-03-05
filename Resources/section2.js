// Section 2
// Includes
Ti.include('functions/utils.js');

// Hide to clear space
clearDashboard();

// Main window
var main = Ti.UI.createWindow({
	backgroundImage: 'img/background_green_left.png',
	orientationModes: [Ti.UI.PORTRAIT],
	opacity: 0,
	width: 768,
	left: -768,
	title: 'AcrySof® IQ ReSTOR®'
});

// For idicate the section, for modify the content
var section = {
	name: 'AcrySof® IQ ReSTOR®',
	indication: 1,
	simulationPath: 'simulation2.js',
	clickFlag: true
};

main.addEventListener('focus', function () {
	main.animate({opacity: 1, left: 0, duration: 500});
	
	// Animate inner content
	bodyHeaderContent.view.animate({opacity: 1, duration: 800}, function () {
			section.clickFlag = false;
	});
});

// Next button to leave this page
var previousButton = createNavigationButton({
	button: {
		title: '',
		top: 35,
		right: 50,
		backgroundImage: defaultStyle.navigation.button.prevBgImg,
		width: 60,
		height: 114,
		opacity: 1
	}
}, 'click', function () {
	// Create a new window
    var newWindow = Ti.UI.createWindow({
      url: section.simulationPath
    });
    // Close old window and open the new
    main.close();
    newWindow.open();
});
main.add(previousButton);

// Title
var mainTitle = Ti.UI.createLabel({
	width: 450,
	height: 40,
	text: 'AcrySof® IQ ReSTOR®',
	color: '#1c7a98',
	top: 40,
	left: 105,
	font: {
		fontSize: 42,
		fontFamily: 'Swiss 721',
		fontStyle: 'normal'
	}
});
main.add(mainTitle);

// Inner content
var body = Ti.UI.createView({
	top: 150,
	left: 100,
	width: 620,
	height: 820
});
main.add(body);

// Stamp
var bottomStamp = createStampImg({
	view: {
		image: 'img/stamp2.png',
		bottom: 35,
		right: 35,
		width: 297,
		height: 205
	}
});
main.add(bottomStamp);

var headerContent = {
	title: 'Qualidade de visão em',
	subtitle: 'todas as distâncias?'
};

var bodyHeaderContent = makeTitle({
	view: {
		top: 25,
		left: 0,
		height: 65,
		opacity: 0
	},
	title: {
		text: headerContent.title,
		color: '#9284be',
		top: 0,
		left: 0,
		font: { fontSize: 28 },
		width: 'auto',
		height: 'auto'
	},
	subtitle: {
		text: headerContent.subtitle,
		color: '#9284be',
		top: 30,
		left: 0,
		font: { fontSize: 28 },
		width: 'auto',
		height: 'auto'
	}
});
body.add(bodyHeaderContent.view);

var description = Ti.UI.createLabel({
	text: sectionContent.section2,
	width: 250,
	height: 'auto',
	color: '#fff',
	top: 125, 
	left: 10,
	font: {fontSize: 20}
});
body.add(description);

var model = Ti.UI.createImageView({
	image: 'img/lens1.png',
	top: 300,
	right: 130,
	width: 272/6,
	height: 554/6
});
body.add(model);

var modelDescription = Ti.UI.createLabel({
	top: 400,
	right: 110,
	width: 85,
	height: 'auto',
	font: {fontSize: 18},
	color: '#fff',
	text: 'Tamanho real',
	textAlign: 'center'
});
body.add(modelDescription);

var modelTrigger = false;

model.addEventListener('click', function ( e ) {

	if ( modelTrigger === false ) {
		e.source.animate({width: e.source.width*6, height: e.source.height*6, top: 70, right: 15, duration: 700});
		modelDescription.animate({opacity: 0, duration: 500}, function () {
			modelTrigger = true;
		});
		/*modelDescription.animate({opacity: 0, duration: 300}, function () {
			modelDescription.text = 'Lente aumentada em 10 vezes';
			modelDescription.animate({top: 650, width: 200, right: 50}, function () {
				modelDescription.animate({opacity: 1, duration: 400});
				modelTrigger = true;
			});
		});*/
	} if ( modelTrigger === true ) {
		e.source.animate({opacity: 0, duration: 700}, function () {
			e.source.animate({width: e.source.width, height: e.source.height, top: e.source.top, right: e.source.right}, function () {
				e.source.animate({opacity: 1, duration: 600});
				modelDescription.animate({opacity: 1, duration: 600});
				modelTrigger = false;
			});
		});
	}
});



// Main footer menu
var footerMainMenu = createFooterMenu(main);
main.add(footerMainMenu);

// Open the main window
main.open();