Ti.include('functions/utils.js');
Ti.include('functions/db.js');

// Stage
var win = Ti.UI.currentWindow;
var stage = Ti.UI.createWindow();

var section;
// Verify the section and add to section variable, the title
section = hasSection(context.menu, win, 'title');

var header = Ti.UI.createView({
    top: 0,
    left: 0,
    width: 'auto',
    height: 87,
    backgroundImage: sets.img.header,
    opacity: 0
});

var titleHeader = Ti.UI.createLabel({
    top: 10,
    left: 10,
    width: 'auto',
    height: 'auto',
    textAlign: 'left',
    text: section,
    shadowColor: '#000',
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

var frameColor = Ti.UI.createView({
    top: 90,
    left: 15,
    right: 15,
    width: 'auto',
    height: 280,
    opacity: 1,
    backgroundColor: '#000',
    backgroundImage: 'nemo.png'
});

/*var frameImg = Ti.UI.createImageView({
    image: './nemo.png',
    top: 90,
    left: 15,
    right: 15
});*/

var touch = false;

frameColor.addEventListener('touchstart', function ( start ) {
    if ( start.x >= 0 && start.x <= 140 && touch === false ) {
        frameColor.addEventListener('touchend', function ( end ) {
            if ( end.x >= 150 && end.x < 350 && touch === false ) {
                frameColor.animate({opacity: 0, duration: 1000}, function () {
                    frameColor.backgroundColor = '#fff';

                    frameColor.animate({backgroundColor: '#fff', opacity: 1, duration: 800}, function () {
                        touch = true;
                    });
                });
            }    
        });
    } if ( start.x >= 150 && start.x <= 350 && touch === true ) {
        frameColor.addEventListener('touchend', function ( end ) {
            if ( end.x >= 0 && end.x < 140 && touch === true ) {
                frameColor.animate({opacity: 0, duration: 1000}, function () {
                    frameColor.backgroundColor = '#000';

                    frameColor.animate({backgroundColor: '#000', opacity: 1, duration: 800}, function () {
                        touch = false;
                    });
                });
            }    
        });
    }
});

var bodySlider = Ti.UI.createScrollableView({
    top: 80,
    width: 'auto',
    height: 300,
    views: [frameColor],
    showPagingControl: true,
    clipViews: false
});

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

    stage.close();
    win.open();
});

// Animation of the header
header.animate({opacity: 1, duration: 500}, function () {
	titleHeader.animate({opacity: 1, duration: 300});
});

// Body content
body.add(header);
body.add(frameColor);
body.add(anchorMenu);

// Menu window
stage.add(body);

// Open the main window
stage.open();