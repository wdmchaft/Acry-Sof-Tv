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

// table of content
var tableContent = Ti.UI.createView({
	top: 10,
	width: 1600,
	height: 700,
});
win.add(tableContent);


// Frame for images
var frameImg = Ti.UI.createView({
    top: 100,
    width: 600,
    height: 400,
    backgroundColor: '#ccc',
    backgroundImage: 'nemo-after.png',
    opacity: 1
});
tableContent.add(frameImg);

transitionEffect({
    startImg: './nemo-after.png',
    endImg: './nemo.png',
    duration: 1000
});

// Continuation of the section
var publication = Ti.UI.createView({
	top: 100, 
	left: 1300,
	width: 600,
	height: 700,
	backgroundColor: '#f00'
});
tableContent.add(publication);

tableContent.left = -1210;

// Slider
var slider = Ti.UI.createSlider({
	min: 1,
	max: 2,
	value: 1,
	width: 500,
	height: 400,
	bottom: 50
});

// Slider events start

slider.addEventListener('change', function ( e ) {
});

// Slider events end

// Slider add to this window
win.add(slider);

// Open the main window
win.open();