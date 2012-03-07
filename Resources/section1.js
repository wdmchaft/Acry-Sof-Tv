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

// For idicate the section, for modify the content
var section = {
	name: 'catarata',
	indication: 1,
	simulationPath: 'simulation1.js',
	clickFlag: true,
	thumbnailID: 0
};

main.addEventListener('focus', function () {
	main.animate({opacity: 1, left: 0, duration: 500});
	
	// Animate inner content
	bodyHeaderContent.view.animate({opacity: 1, duration: 800}, function () {
		bodyImg.animate({opacity: 1, duration: 600}, function () {
			imgDescription.view.animate({bottom: 0, opacity: 1, duration: 600});
			section.clickFlag = false;
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

var headerContent = {
	title: 'A moderna cirurgia',
	subtitle: 'que pode mudar a sua vida'
};

var bodyHeaderContent = makeTitle({
	view: {
		top: 25,
		left: 20,
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
		color: '#fff',
		top: 30,
		left: 0,
		font: { fontSize: 24 },
		width: 'auto',
		height: 'auto'
	}
});
body.add(bodyHeaderContent.view);

var thumbnail1 = Ti.UI.createView({
	backgroundImage: 'img/thumbnail_catarata01.png',
	left: 0,
	opacity: 1,
	width: 80,
	height: 80,
	thumbnailID: 0,
	imgPath: 'img/section_catarata01.png',
	zIndex: 300
});

var thumbnail2 = Ti.UI.createView({
	backgroundImage: 'img/thumbnail_catarata02.png',
	left: 85,
	opacity: 1,
	width: 80,
	height: 80,
	thumbnailID: 1,
	imgPath: 'img/section_catarata02.png',
	zIndex: 300
});

var thumbnail3 = Ti.UI.createView({
	backgroundImage: 'img/thumbnail_catarata03.png',
	left: 170,
	opacity: 1,
	width: 80,
	height: 80,
	thumbnailID: 2,
	imgPath: 'img/section_catarata03.png',
	zIndex: 300
});

var thumbnail4 = Ti.UI.createView({
	backgroundImage: 'img/thumbnail_catarata04.png',
	left: 255,
	opacity: 1,
	width: 80,
	height: 80,
	thumbnailID: 3,
	imgPath: 'img/section_catarata04.png',
	zIndex: 300
});

var thumbnailList = [
	thumbnail1,
	thumbnail2,
	thumbnail3,
	thumbnail4
];

var bodyImg = Ti.UI.createImageView({
	image: '',
	top: 105,
	width: 549,
	height: 600,
	opacity: 0,
	zIndex: 10,
	thumbnailID: 0
});
body.add(bodyImg);

var imgDescription = makeImageDescription({
	view: {
		backgroundImage: 'img/footer_description_bg.png',
		height: 125,
		width: 550,
		bottom: 130,
		left: 0,
		opacity: 0
	},
	imgHolder: {
		top: 14,
		left: 110,
		height: 100,
		zIndex: 150
	}
});
body.add(imgDescription.view);
imgDescription.imgHolder.add(thumbnailList[0]);
imgDescription.imgHolder.add(thumbnailList[1]);
imgDescription.imgHolder.add(thumbnailList[2]);
imgDescription.imgHolder.add(thumbnailList[3]);

// Verify img to add in section
var allThumbOutFocus = function () {
	for ( var i in thumbnailList ) {
		if ( thumbnailList[i].thumbnailID === bodyImg.thumbnailID ) {
			thumbnailList[i].animate({opacity: 1, duration: 250});
		} else {
			thumbnailList[i].animate({opacity: 0.4, duration: 250});
		}
	}
}

allThumbOutFocus();

var previousButton = Ti.UI.createButton({
	backgroundImage: 'img/button_back_catarata.png',
	width: 34,
	height: 34,
	left: 35,
	zIndex: 300
});
imgDescription.view.add(previousButton);

var nextButton = Ti.UI.createButton({
	backgroundImage: 'img/button_forward_catarata.png',
	width: 34,
	height: 34,
	right: 35,
	zIndex: 300
});
imgDescription.view.add(nextButton);

var nextID, previousID;

for ( var thumb = 0; thumb < thumbnailList.length; thumb++ ) {
	var verifyImage = function () {
		if ( thumbnailList[thumb].thumbnailID === section.thumbnailID ) {
			bodyImg.image = thumbnailList[thumb].imgPath;
		}
	};

	allThumbOutFocus();
	verifyImage();

	thumbnailList[thumb].addEventListener('touchend', function ( e ) {
		bodyImg.animate({opacity: 0, duration: 500}, function () {
			bodyImg.image = e.source.imgPath;
			bodyImg.thumbnailID = e.source.thumbnailID;
			allThumbOutFocus();
			bodyImg.animate({opacity: 1, duration: 1000});
			section.thumbnailID = e.source.thumbnailID;
			e.source.animate({opacity: 1, duration: 250});
		});
	});
}

var touchFlag = false;

nextButton.addEventListener('touchend', function () {
	if ( bodyImg.thumbnailID === section.thumbnailID ) {
		var nextID = section.thumbnailID + 1;
		
		if ( nextID >= 0 && nextID <= 3 ) {
			touchFlag = true;
			bodyImg.animate({opacity: 0, duration: 500}, function () {
				bodyImg.image = thumbnailList[nextID].imgPath;
				bodyImg.thumbnailID = thumbnailList[nextID].thumbnailID;
				section.thumbnailID = nextID;
				allThumbOutFocus();
				bodyImg.animate({opacity: 1, duration: 1000});
			});
			touchFlag = false;
		}
	}
});

previousButton.addEventListener('touchend', function () {
	if ( bodyImg.thumbnailID === section.thumbnailID ) {
		var previousID = section.thumbnailID - 1;
		
		if ( previousID >= 0 && previousID <= 3 ) {
			touchFlag = true;
			bodyImg.animate({opacity: 0, duration: 500}, function () {
				bodyImg.image = thumbnailList[previousID].imgPath;
				bodyImg.thumbnailID = thumbnailList[previousID].thumbnailID;
				section.thumbnailID = previousID;
				allThumbOutFocus();
				bodyImg.animate({opacity: 1, duration: 1000});
			});
			touchFlag = false;
		}
	}
});

var touchSlide = function touchSlide( element, limit, callback ) {
	// Scope function variables
	element = element || [];
	callback = callback || function () {};
	// Local function variables
	var headerTitleContent = ['Visão com catarata', 'Visão sem catarata'];
	var limitX = limit;

	if ( element ) {
			var startx;
			var endx;
			var distance;

			element[0].addEventListener('touchstart', function ( start ) {
				startx = start.x;
				element[0].addEventListener('touchend', function ( e ) {
					endx = e.x;
					distance = startx - endx;
					
					if ( distance > limitX && touchFlag === false ) {
						var nextID = section.thumbnailID + 1;
		
						if ( nextID >= 0 && nextID <= 3 ) {
							touchFlag = true;
							bodyImg.animate({opacity: 0, duration: 500}, function () {
								bodyImg.image = thumbnailList[nextID].imgPath;
								bodyImg.thumbnailID = thumbnailList[nextID].thumbnailID;
								section.thumbnailID = nextID;
								allThumbOutFocus();
								bodyImg.animate({opacity: 1, duration: 1000}, function () {
									touchFlag = false;
								});
							});
						}
					}
				});
			});

			element[0].addEventListener('touchstart', function ( start ) {
				startx = start.x;
				element[0].addEventListener('touchend', function ( e ) {
					endx = e.x;
					distance = startx - endx;
					
					if ( distance < -limitX && touchFlag === false ) {
						touchFlag = true;
						
						var previousID = section.thumbnailID - 1;
						
						if ( previousID >= 0 && previousID <= 3 ) {
							touchFlag = true;
							bodyImg.animate({opacity: 0, duration: 500}, function () {
								bodyImg.image = thumbnailList[previousID].imgPath;
								bodyImg.thumbnailID = thumbnailList[previousID].thumbnailID;
								section.thumbnailID = previousID;
								allThumbOutFocus();
								bodyImg.animate({opacity: 1, duration: 1000}, function () {
									touchFlag = false;
								});
							});
						}
					}
				});
			});
	}

	return callback();
};

touchSlide( [bodyImg], 10 );
// Final verification

previousToSimulation();

// Main footer menu
var footerMainMenu = createFooterMenu(main);
main.add(footerMainMenu);

// Open the main window
main.open();