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
	left: 0,
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
	height: 700
});
tableContent.add(publication);

// Thumbnail container
var containerThumb1 = Ti.UI.createView({
	top: 0,
	left: 0,
	height: 200,
	backgroundColor: '#0f0'
});
publication.add(containerThumb1);

// Thumbnail container
var containerThumb2 = Ti.UI.createView({
	top: 205,
	left: 0,
	height: 200,
	backgroundColor: '#0f0'
});
publication.add(containerThumb2);

// Thumbnail container
var containerThumb3 = Ti.UI.createView({
	top: 410,
	left: 0,
	height: 200,
	backgroundColor: '#0f0'
});
publication.add(containerThumb3);

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
	if ( e.source.value === 1 && e.source.value < 2 ) {
		tableContent.animate({ left: -410, duration: 1000 });
	} if ( e.source.value === 2 && e.source.value > 1 ) {
		tableContent.animate({ left: -1210, duration: 1000 });
	}
});

// Slider events end

// Slider add to this window
win.add(slider);

// Open the main window
win.open();