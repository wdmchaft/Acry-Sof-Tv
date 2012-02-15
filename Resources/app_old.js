// Includes
Ti.include('functions/db.js');
Ti.include('functions/utils.js');

// set background default
Titanium.UI.setBackgroundColor('#3e1a61');

if ( Ti.UI.currentWindow ) {
	// Close the currentWindow why is oldest
	Ti.UI.currentWindow.hide();
}

// Main window
var win = Ti.UI.createWindow({
	title: 'AcrySof TV',
	backgroundImage: sets.img.background
});

//header
var header = Ti.UI.createView({
	top: 0,
	left: 0,
	height: 100,
	backgroundColor: '#d2d2d2'
});
win.add(header);

// Open database of acrysof
var db = Ti.Database.install('./db/acrysof.sqlite', 'acrysof');
// Get the content of db
var acrysof = {};
	acrysof['table'] = getContextBy(db, 'section', 'id', 1);
	acrysof['title'] = acrysof.table.fieldByName('title');
	acrysof['content'] = acrysof.table.fieldByName('content');
// Close db post use
acrysof.table.close();

// Lable for title
var title = Ti.UI.createLabel({
	text: acrysof.title,
	width: 'auto',
	height: 'auto',
	font: {fontSize: 32, fontFamily: 'Helvetica'},
	color: '#000'
});
header.add(title);

// Body of content
var bodyContent = Ti.UI.createView({
	top: 150,
	left: 25, 
	right: 25,
	height: 500,
	opacity: 0.6,
	backgroundColor: '#000'
});
win.add(bodyContent);

// Main content label
var content = Ti.UI.createLabel({
	top: 0,
	left: 10,
	right: 10,
	bottom: 10,
	text: acrysof.content,
	width: 'auto',
	height: 'auto',
	font: {fontSize: 18, fontFamily: 'Helvetica'},
	color: '#fff'
});
bodyContent.add(content);

// Anchor to menu
var anchorMenu = Ti.UI.createLabel({
	text: 'Ir para o menu',
	bottom: 280,
	width: 'auto',
	height: 20,
	textAlign: 'center',
	font: {fontSize: 16, fontFamily: 'Helvetica'},
	color: '#fff'
});
win.add(anchorMenu);

// Anchor events start

anchorMenu.addEventListener('touchstart', function () {
	anchorMenu.color = '#f19a03';
});

anchorMenu.addEventListener('touchend', function () {
	anchorMenu.color = '#fff';
});

anchorMenu.addEventListener('click', function () {
	var menu = Ti.UI.createWindow({
		title: 'Menu Principal',
		url: 'menu.js'
	});

	win.close(); // Close this window and open,
	menu.open(); // this menu window.
});

// Anchor events end

// Open the main window
win.open();
