// Splash screen
var main = Ti.UI.createWindow({
	backgroundImage: 'img/Default.png'
});

var invokeWindow = function invokeWindow( element, duration ) {
	element = element || '';
	duration = duration || 0;

	if ( element && duration ) {
		element.animate({opacity: 0, duration: duration}, function () {
			// go to next page
		    var newWindow = Ti.UI.createWindow({
		    	url: 'menu.js'
		    });
		    // Close old window and open the new
		    main.close();
		    newWindow.open();
			});
	}
};

// Main include
main.addEventListener('focus', function ( e ) {
	var duration = 1500;

	var startEvent = function () {
		return invokeWindow(e.source, duration);
	};

	setTimeout(startEvent, duration);
});

main.open();