// Includes
Ti.include('functions/db.js');
Ti.include('functions/utils.js');

//Current window
var cWin = Ti.UI.currentWindow;
// Hide current window
cWin.hide();

// Main window
var win = Ti.UI.createWindow({
    backgroundImage: sets.img.background
});

// Define a section start

var section = cWin.title; // Verify the section, and add to the section variable the title.

// Define a section end

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
    text: section,
    width: 'auto',
    height: 'auto',
    font: {fontSize: 32, fontFamily: 'Helvetica'},
    color: '#000'
});
header.add(title);

// Frame for images
var frameImg = Ti.UI.createView({
    top: 150,
    width: 600,
    height: 400,
    backgroundColor: '#ccc',
    backgroundImage: 'nemo-after.png',
    opacity: 1
});
win.add(frameImg);

// Tv Image demo start

var transitionEffect = function ( settings ) {
    // Control the effect
    var touch;
    // Color animation transition
    settings['startColor'];
    settings['endColor'];
    // Image animation transition
    settings['startImg'];
    settings['endImg'];
    // Time to execution
    settings['duration'];

    touch = false;

    if ( touch === false ) {
        frameImg.addEventListener('touchstart', function ( start ) {
            frameImg.addEventListener('touchend', function ( end ) {
                if ( start.x - end.x < -250 && touch === false ) {
                    frameImg.animate({ opacity: 0, duration: settings['duration'] });
                    
                    setTimeout(function () {
                        frameImg.backgroundImage = settings['endImg'];
                        frameImg.animate({ backgroundImage: settings['endImg'], opacity: 1, duration: settings['duration'] }, function () {
                            // If was clicked, the variable touch is true, else false
                            Ti.API.info(start.x - end.x);
                            touch = true;
                        });
                    }, settings['duration']);     
                } if ( start.x - end.x > 250 && touch === true ) {
                    frameImg.animate({ opacity: 0, duration: settings['duration'] });

                    setTimeout(function () {
                        frameImg.backgroundImage = settings['startImg'];
                        frameImg.animate({ backgroundImage: settings['startImg'], opacity: 1, duration: settings['duration'] }, function () {
                            // If was clicked, the variable touch is true, else false
                            Ti.API.info(start.x - end.x);
                            touch = false;
                        });
                    }, settings['duration']); 
                }
            });
        });
    } else {
        return transitionEffect( settings );
    }
};

transitionEffect({
    startImg: './nemo-after.png',
    endImg: './nemo.png',
    duration: 1000
});

// Tv Image demo end

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