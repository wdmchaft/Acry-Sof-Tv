// Preivous screen, by the menu
Ti.include('functions/db.js');
Ti.include('functions/utils.js');

// DB invoke
var db = Ti.Database.install('./db/acrysof.sqlite', 'acrysof');
// Get all content of db
var aboutSelection = getContextBy(db, 'section', 'id', 1);
// Get filtered by field, in db
var aboutContent = {
    title: aboutSelection.fieldByName('title'),
    content: aboutSelection.fieldByName('content')
};
// Close the db
aboutSelection.close();

// get a current window with informations
var currentWindow = Ti.UI.currentWindow;
// Body content of this section
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
    backgroundColor:
    backgroundImage: sets.img.header,
    opacity: 0
});

// Title of this, section
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
// add title to this part of app
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

// Label of textual content
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
// add label to body of content
contentBody.add(labelContentBody);

// Create a anchor menu, with go to main menu
var anchorMenu = Ti.UI.createLabel({
    text: 'Ir para o menu',
    bottom: 18,
    width: 'auto',
    heitgh: 40,
    font: {fontSize: 16},
    color: '#fff',
    textAlign: 'center'
});

// add click event to this item
anchorMenu.addEventListener('click', function ( e ) {
    var win = Ti.UI.createWindow({
        title: 'Menu',
        url: 'menu.js'
    });

    about.close();
    win.open();
});

// animate the header for entance
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
