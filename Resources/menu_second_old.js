// Includes
Ti.include('functions/db.js');
Ti.include('functions/utils.js');

// Close the currentWindow why is oldest
Ti.UI.currentWindow.hide();
// Main window
var win = Ti.UI.createWindow({
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

// Lable for title
var title = Ti.UI.createLabel({
    text: 'Menu',
    width: 'auto',
    height: 'auto',
    font: {fontSize: 32, fontFamily: 'Helvetica'},
    color: '#000'
});
header.add(title);

// Table of contents
var menu = Ti.UI.createTableView({
    top: 100,
    data: context.menu
});
win.add(menu);

// Menu events start

menu.addEventListener('click', function ( e ) {
    if ( e.rowData.path ) {
        var nWin = Ti.UI.createWindow({
            title: e.rowData.title,
            url: e.rowData.path
        });

        var sid = e.rowData.sid;
        nWin.sectionID = sid;

        win.close();
        nWin.open();
    }
});

// Menu events end

// Open the main window
win.open();