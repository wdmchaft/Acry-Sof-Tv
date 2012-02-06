// Preivous screen, by the menu
Ti.include('functions/db.js');
Ti.include('functions/utils.js');

var aboutSelection = getContextBy('section', 'id', 1);
var aboutContent = {
    title: aboutSelection.fieldByName('title'),
    content: aboutSelection.fieldByName('content')
};
aboutSelection.close();

var currentWindow = Ti.UI.currentWindow;
var about = Ti.UI.createWindow({
    top: 0,
    left: 0,
    width: 'auto',
    height: 'auto',
    backgroundImage: sets.img.background
});

// Header of application
var header = Ti.UI.createView({
    top: 0,
    left: 0,
    width: 'auto',
    height: 87,
    backgroundImage: sets.img.header,
    opacity: 0
});

var titleHeader = Ti.UI.createLabel({
    top:10,
    left: 10,
    width: 'auto',
    height: 'auto',
    textAlign:'left',
    text: aboutContent.title,
    shadowColor: '#000',
    shadowOffset: {x: 0, y:2},
    color: '#1b8ea3',
    font: {fontSize: 26, fontFamily: 'Helvetica'},
    opacity: 0
});
header.add(titleHeader);

// Body of application
var body = makeBody({
	view: {
        top: 0,
        left:0,
		height: 'auto',
		width: 'auto'
	}
});

// Content of body application
var contentBody = Ti.UI.createView({
    top: 80,
    left: 0,
    width: 'auto',
    height: 300,
    backgroundImage: sets.img.contentBody
});

var labelContentBody = Ti.UI.createLabel({
    text: aboutContent.content,
    font: {fontSize: 11},
    color: '#fff',
    textAlign: 'left',
    top: 18,
    left: 18,
    right: 15,
    bottom: 15,
    width: 'auto',
    height: 'auto'
});
contentBody.add(labelContentBody);

var anchorMenu = Ti.UI.createLabel({
    text: 'Ir para o menu',
    bottom: 18,
    width: 'auto',
    heitgh: 40,
    font: {fontSize: 16},
    color: '#fff',
    textAlign: 'center'
});

anchorMenu.addEventListener('click', function ( e ) {
    var win = Ti.UI.createWindow({
        title: 'Menu',
        url: 'menu.js'
    });

    about.close();
    win.open();
});

header.animate({opacity: 1, duration: 500}, function () {
    titleHeader.animate({opacity: 1, duration: 300});
});

// Add header of content in the body
body.add(header);
body.add(contentBody);
body.add(anchorMenu);

// Add to current window, the body of contents
about.add(body);

// Open the about window
about.open();
