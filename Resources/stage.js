// Includes
Ti.include('functions/db.js');
Ti.include('functions/utils.js');

// Hide current window
Ti.UI.currentWindow.hide();

// Main window
var win = Ti.UI.createWindow({
    backgroundImage: sets.img.background
});

// Define a section start

var section = hasSection( context.menu, Ti.UI.currentWindow, 'title' ); // Verify the section, and add to the section variable the title.

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
    backgroundColor: '#000'
});
win.add(frameImg);

// Tv Image demo start

function transitionEffect( element, settings ) {
    // Control the effect
    var touch;
    // Color animation transition
    settings['startColor'];
    settings['endColor'];
    // Image animation transition
    settings['startImg'];
    settings['endImg'];
    // Time to execution
    settings['duration']

    element.addEventListener('touchstart', function ( start ) {
        if ( start.x >= 0 && start.x <= 140 && touch === false ) {
            
            element.addEventListener('touchend', function ( end ) {
                if ( end.x >= 150 && end.x < 350 && touch === false ) {
                    
                    element.animate({opacity: 0, settings['duration']}, function () {
                        
                    });

                }
            });

        }
    });
}

// Tv Image demo end

// Open the main window
win.open();