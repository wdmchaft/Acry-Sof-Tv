Ti.include('db.js');

// Pre defineds
var db = Ti.Database.install('db/acrysof.sqlite', 'acrysofdb');

var sectionContent = {
  editorial: getContextBy(db, 'section', 'id', 1)
};

var defaultStyle = {
  navigation: {
    button: {
      prevBgImg: '',
      nextBgImg: 'img/button_forward.png'
    }
  },
  typo: {
    size: 22
  },
  menu: {
    footerBgImg: 'img/footer_background_menu.png' 
  }
}

// New functions
var clearDashboard = function () {
  var currentWindow = Ti.UI.currentWindow;

  if ( typeof currentWindow !== 'undefined' ) {
    currentWindow.hide();
  }
};

// Create a button for navigation
var createNavigationButton = function ( settings, eventName, eventFunction ) {
  // Next page button
  var Btn = Ti.UI.createButton( settings.button );

  // Next page button action
  Btn.addEventListener( eventName, eventFunction);

  return Btn;
};

// Create the standart footer menu
var createFooterMenu = function () {
  var footerMenu = Ti.UI.createView({
    width: 768,
    height: 235,
    backgroundImage: defaultStyle.menu.footerBgImg,
    opacity: 0.75,
    bottom: -180
  });
  

  var footerMenuOpened = false;

  // Footer menu behavior
  footerMenu.addEventListener('click', function ( e ) {
    if ( footerMenuOpened === false ) {
      footerMenu.animate({bottom: 0, duration: 1000});
      footerMenuOpened = true;
    } else {
      footerMenu.animate({bottom: footerMenu.bottom, duration: 700});
      footerMenuOpened = false;
    }
  });

  return footerMenu;
}

// Functions for utilize out the box

function makeBody( options ) {
  // Create a body layout
	options = options || false;

	if ( options ) {
		var view = Ti.UI.createView( options.view );

		return view;
	}
}

function deal() {
  // usage: 'message {0}', 'replace'
  var args = Array.prototype.slice.call(arguments);
  
  if ( args.constructor.toString().indexOf('Array') > -1 ) {
    args = Array.prototype.slice.call(arguments);
  }

  var message = args[0].toString();
  var count = 1;
  
  for ( var i = 0; i < args.length; i++ ) {
    if ( typeof args[count] !== undefined ) {
      message = message.replace('{' + i + '}', args[count]);
      count += 1;
    }
  }
  
  return message;
}

function info( message ) {
  // shortcut
  return Ti.API.info( message );
}

function hasSection ( context, comparison, child ) {
  // section verify and return the title
  context = context || false;
  comparison = comparison || false;
  child = child || false;

  if ( context && comparison && child ) {
    for ( var i = 0; i < context.length; i++ ) {
      if ( context[i][child] === comparison[child] ) {
        return context[i][child];
      } else {
        return false;
      }
    }
  }
}

// transition with fade effect
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
                            touch = true;
                        });
                    }, settings['duration']);     
                } if ( start.x - end.x > 250 && touch === true ) {
                    frameImg.animate({ opacity: 0, duration: settings['duration'] });

                    setTimeout(function () {
                        frameImg.backgroundImage = settings['startImg'];
                        frameImg.animate({ backgroundImage: settings['startImg'], opacity: 1, duration: settings['duration'] }, function () {
                            // If was clicked, the variable touch is true, else false
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


// Object for set patterns
var sets = {
    font: {
        color: '#1b8ea3',
        size: 22
    },
    img: {
        header: './header.png',
        background: './background.png',
        contentBody: './content_body.png'
    },
    menu: {
        color: '#000'
    },
    dimensions: {
      width: Ti.Platform.displayCaps.platformWidth,
      height: Ti.Platform.displayCaps.platformHeight
    }
};

var context = {
  menu: [{
      title: 'AcrySof® IQ ReSTOR®',
      path: 'stage.js',
      color: sets.menu.color,
      hasChild: true,
      sid: 'Catarata'
  }, {
      title: 'AcrySof® IQ Toric',
      path: 'stage.js',
      color: sets.menu.color,
      hasChild: true,
      sid: 'Toric'
  }, {
      title: 'AcrySof® IQ',
      path: 'stage.js',
      color: sets.menu.color,
      hasChild: true,
      sid: 'IQ'
  }, {
      title: 'AcrySof® IQ ReSTOR® Toric',
      path: 'stage.js',
      color: sets.menu.color,
      hasChild: true,
      sid: 'Restor Toric'
  }, {
      title: 'AcrySof® Porque utilizar?',
      path: 'stage.js',
      color: sets.menu.color,
      hasChild: true,
      sid: 'Utilizar'
  }, {
      title: 'AcrySof® Editorial',
      path: 'app.js',
      color: sets.menu.color,
      hasChild: true,
      sid: 'Editorial'
  }, {
    title: 'Slider test',
    path: 'slider.js',
    color: sets.menu.color,
    hasChild: true,
    sid: 'sliderTest'
  }]
};