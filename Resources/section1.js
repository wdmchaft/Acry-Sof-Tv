// Includes
Ti.include('functions/utils.js');

// Hide to clear space
clearDashboard();

// Main window
var main = Ti.UI.createWindow({
	backgroundImage: 'img/background_purple_left.png',
	orientationModes: [Ti.UI.PORTRAIT],
	opacity: 0,
	width: 768,
	left: -768,
	title: 'catarata'
});

main.addEventListener('focus', function () {
	main.animate({opacity: 1, left: 0, duration: 500});
	imgDescription.animate({bottom: 0, opacity: 0.8, duration: 800});
});

// Next button to leave this page
var nextButton = createNavigationButton({
	button: {
		title: '',
		top: 35,
		right: 30,
		backgroundImage: defaultStyle.navigation.button.nextBgImg,
		width: 60,
		height: 114
	}
}, 'click', function () {
	    // go to next section into the catarata
	    Ti.API.info('Show your moves.');
});
main.add(nextButton);

// Title
var mainTitle = Ti.UI.createLabel({
	width: 300,
	height: 40,
	text: 'Catarata',
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
	top: 120,
	left: 110,
	width: 550,
	height: 820,
});
main.add(body);

var headerContent = {
	title: 'A moderna cirurgia',
	subtitle: 'que pode mudar a sua vida'
};

var bodyHeaderContent = makeTitle({
	view: {
		top: 25,
		left: 20,
		height: 65
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
		color: '#fff',
		top: 30,
		left: 0,
		font: { fontSize: 24 },
		width: 'auto',
		height: 'auto'
	}
});
body.add(bodyHeaderContent);

var bodyImg = Ti.UI.createImageView({
	image: 'img/section_catarata_01.png',
	top: 0,
	zIndex: 10
});
body.add(bodyImg);

var descriptionContent = {
	text: 'Cristalino Opacificado'
};

var imgDescription = makeImageDescription({
	view: {
		backgroundImage: 'img/footer_description_bg.png',
		height: 125,
		width: 550,
		bottom: 130,
		left: 0,
		opacity: 0
	},
	label: {
		text: descriptionContent.text,
		width: 'auto',
		height: 'auto',
		color: '#fff',
		textAlign: 'center',
		font: { fontSize: 24 }
	}
});
body.add(imgDescription);

// Main footer menu
var footerMainMenu = createFooterMenu();
main.add(footerMainMenu);

// Open the main window
main.open();