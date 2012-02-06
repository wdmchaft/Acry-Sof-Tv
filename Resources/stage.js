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
    backgroundColor: '#000',
    //backgroundImage: 'nemo.png',
    opacity: 1
});
win.add(frameImg);

// Tv Image demo start

transitionEffect( {
    startColor: '#000',
    endColor: '#fff',
    duration: 1000
} );

function transitionEffect( settings, callback ) {
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

    // Set default value
    touch = false;

    var toStart = function () {
        frameImg.addEventListener('touchend', function ( end ) {
            if ( end.x >= 260 && end.x < 600 && touch === false ) {
                
                frameImg.animate({ opacity: 0, duration: settings['duration'] }, function () {
                    // Android only -> frameImg.backgroundColor = settings['endColor'];

                    frameImg.animate({ backgroundColor: settings['endColor'], opacity: 1, duration: settings['duration'] }, function () {
                        // If was clicked, the variable touch is true, else false
                        touch = true;                                             
                    });

                });

            }
        });      
    };

    var toEnd = function () {
        frameImg.addEventListener('touchend', function ( end ) {
            if ( end.x >= 0 && end.x < 250 && touch === true ) {
                
                frameImg.animate({ opacity: 0, duration: settings['duration'] }, function () {
                    // Android only -> frameImg.backgroundColor = settings['startColor'];

                    frameImg.animate({ backgroundColor: settings['startColor'], opacity: 1, duration: settings['duration'] }, function () {
                        // Same behavior
                        touch = false;
                    });
                });

            }
        });
    };

    frameImg.addEventListener('touchstart', function ( start ) {
        if ( start.x >= 0 && start.x <= 250 && touch === false ) {
            Ti.API.info('Touch started!');
            toStart();
        } if ( start.x >= 260 && start.x <= 600 && touch === true ) {
            Ti.API.info('Touch ended!');
            toEnd();
        }
    });
    
    return callback && callback();
}

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