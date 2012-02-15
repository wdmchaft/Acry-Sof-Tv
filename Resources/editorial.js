// Includes
Ti.include('functions/utils.js');

// Hide to clear space
clearDashboard();

// Main window
var main = Ti.UI.createWindow({
	backgroundImage: 'img/background_editorial.png'
});

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

// open the main window
main.open();