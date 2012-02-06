Ti.include('./functions/utils.js');

// Main menu
var menu = Ti.UI.createWindow({
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
    text: 'Índice',
    shadowColor: '#000',
    shadowOffset: {x: 0, y:2},
    color: '#1b8ea3',
    font: {fontSize: 26, fontFamily: 'Helvetica'},
    opacity: 0
});
header.add(titleHeader);

var body = makeBody({
	view: {
        top: 0,
        left:0,
		height: 'auto',
		width: 'auto'
	}
});

var mainMenu = Ti.UI.createTableView({
	data: context.menu,
	top: 90
});

mainMenu.addEventListener('click', function (e) {
	if ( e.rowData.path ) {
		var win = Ti.UI.createWindow({
			title: e.rowData.title,
			url: e.rowData.path
		});

        var sid = e.rowData.sid;
        win.sectionID = sid;

		menu.close();
		win.open();
	}
});

// Animation of the header
header.animate({opacity: 1, duration: 500}, function () {
	titleHeader.animate({opacity: 1, duration: 300});
});

// Body content
body.add(header);
body.add(mainMenu);

// Menu window
menu.add(body);

// Main window of menu section
menu.open();