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
      opacity: 0.8,
      bottom: -180
    });

  var context = {
    menu: [
      'Editorial',
      'Catarata',
      'AcrySof® IQ ReSTOR®',
      'AcrySof® IQ Toric',
      'AcrySof® IQ',
    ]
  };

  var menu = {}; // Menu itens
  
  var menuSets = {
    left: 125,
    right: 125,
    color: '#fff',
    leftIndicator: 20,
    topIndicator: [8, 40, 70, 100, 130]
  };

  var indicatorSet = {
    width: 16,
    height: 14,
    backgroundImage: 'img/mark.png',
    top: 0,
    left: 0
  };

  var leftMenuBlock = Ti.UI.createView({
    width: 210,
    height: 150,
    top: 60,
    left: menuSets.left
  });
  footerMenu.add(leftMenuBlock);

  var rightMenuBlock = Ti.UI.createView({
    width: 210,
    height: 150,
    top: 60,
    right: menuSets.right
  });
  footerMenu.add(leftMenuBlock);
  
  menu['indicator1'] = Ti.UI.createView(indicatorSet);
  menu.indicator1.top = menuSets.topIndicator[0];
  leftMenuBlock.add(menu.indicator1);

  menu['indicator2'] = Ti.UI.createView(indicatorSet);
  menu.indicator2.top = menuSets.topIndicator[1];
  leftMenuBlock.add(menu.indicator2);

  menu['indicator3'] = Ti.UI.createView(indicatorSet);
  menu.indicator3.top = menuSets.topIndicator[2];
  leftMenuBlock.add(menu.indicator3);

  menu['indicator4'] = Ti.UI.createView(indicatorSet);
  menu.indicator4.top = menuSets.topIndicator[3];
  leftMenuBlock.add(menu.indicator4);

  menu['indicator5'] = Ti.UI.createView(indicatorSet);
  menu.indicator5.top = menuSets.topIndicator[4];
  leftMenuBlock.add(menu.indicator5);

  for ( indicator in menu ) {
    if ( indicator.search('indicator') > -1 ) {
      Ti.API.info(indicator);
    } 
  }

  // Context in the menu
  menu['context1'] = Ti.UI.createLabel({
    text: context.menu[0],
    width: 200,
    height: 30,
    top: 0,
    left: menuSets.leftIndicator,
    color: menuSets.color
  });
  leftMenuBlock.add(menu.context1);

  // Context in the menu
  menu['context2'] = Ti.UI.createLabel({
    text: context.menu[1],
    width: 200,
    height: 30,
    top: 30,
    left: menuSets.leftIndicator,
    color: menuSets.color
  });
  leftMenuBlock.add(menu.context2);

  // Context in the menu
  menu['context3'] = Ti.UI.createLabel({
    text: context.menu[2],
    width: 200,
    height: 30,
    top: 60,
    left: menuSets.leftIndicator,
    color: menuSets.color
  });
  leftMenuBlock.add(menu.context3);

  // Context in the menu
  menu['context4'] = Ti.UI.createLabel({
    text: context.menu[3],
    width: 200,
    height: 30,
    top: 90,
    left: menuSets.leftIndicator,
    color: menuSets.color
  });
  leftMenuBlock.add(menu.context4);
  
  // Context in the menu
  menu['context5'] = Ti.UI.createLabel({
    text: context.menu[4],
    width: 200,
    height: 30,
    top: 120,
    left: menuSets.leftIndicator,
    color: menuSets.color
  });
  leftMenuBlock.add(menu.context5);


  var footerMenuOpened = false;

  // Footer menu behavior
  footerMenu.addEventListener('click', function ( e ) {
    if ( e.x > 330 && e.x < 442 &&  e.y > 9 && e.y < 50 ) {
      if ( footerMenuOpened === false ) {
        footerMenu.animate({bottom: 0, duration: 700});
        footerMenuOpened = true;
      } else {
        footerMenu.animate({bottom: footerMenu.bottom, duration: 700});
        footerMenuOpened = false;
      }
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