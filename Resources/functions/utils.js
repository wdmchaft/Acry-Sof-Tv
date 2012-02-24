Ti.include('db.js');

// Pre defineds
var db = Ti.Database.install('db/acrysof.sqlite', 'acrysofdb');

var sectionContent = {
  editorial: getContextBy(db, 'section', 'id', 1)
};

var defaultStyle = {
  navigation: {
    button: {
      prevBgImg: 'img/button_backward.png',
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

var verifySectionButtons = function ( definitions ) {
    if ( definitions.section.indication <= 1 ) {
      previousButton.animate({opacity: 0, duration: 500}, function () {
        previousButton.hide();
      });
    } if ( definitions.section.indication >= 4 ) {
      nextButton.animate({opacity: 0, duration: 500}, function () {
        nextButton.hide();
      });
    }

    if ( definitions.section.indication < 4 ) {
        nextButton.show();
        nextButton.animate({opacity: 1, duration: 500});
    } if ( definitions.section.indication > 1 ) {
        previousButton.show();
        previousButton.animate({opacity: 1, duration: 500});
    }
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
      'AcrySof® IQ ReSTOR® Toric',
      'Qualidade AcrySof® ASFÉRICA',
      'Extras'
    ], 
    paths: [
      'editorial.js',
      'section1.js',
      'section2.js',
      'section3.js',
      'section4.js',
      'section5.js',
      'section6.js',
      'section7.js'
    ]
  };

  // Menu itens
  var menu = {};
  
  // Default configuration for the menu itens
  var menuSets = {
    left: 125,
    right: 125,
    color: '#fff',
    leftIndicator: 20,
    topIndicator: [8, 40, 70, 100, 130],
    indexPosition: 100,
    labelWidth: 250,
  };

  // Default configuration for the mark at the last position in the item in modal menu
  var indicatorSet = {
    width: 16,
    height: 14,
    backgroundImage: 'img/mark.png',
    top: 0,
    left: 0
  };

  // For itens who change
  var changingItem = {};

  if ( typeof main !== 'undefined' && typeof main.title !== 'undefined' && main.title.search('editorial') > -1 ) {
    changingItem['title'] = 'Menu';
    changingItem['url'] = 'menu.js';
  }

  // Change the default value for a mutables values
  context.menu[0] = changingItem.title || context.menu[0];
  context.paths[0] = changingItem.url || context.paths[0];

  var leftMenuBlock = Ti.UI.createView({
    width: 250,
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
  footerMenu.add(rightMenuBlock);
  
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
  menu.indicator5.top = menuSets.topIndicator[0];
  rightMenuBlock.add(menu.indicator5);

  menu['indicator6'] = Ti.UI.createView(indicatorSet);
  menu.indicator6.top = menuSets.topIndicator[1];
  rightMenuBlock.add(menu.indicator6);

  menu['indicator7'] = Ti.UI.createView(indicatorSet);
  menu.indicator7.top = menuSets.topIndicator[2];
  rightMenuBlock.add(menu.indicator7);

  menu['indicator8'] = Ti.UI.createView(indicatorSet);
  menu.indicator8.top = menuSets.topIndicator[3];
  rightMenuBlock.add(menu.indicator8);

  // Context in the menu
  menu['context1'] = Ti.UI.createLabel({
    text: context.menu[0],
    width: 200,
    height: 30,
    top: 0,
    left: menuSets.leftIndicator,
    color: menuSets.color,
    zIndex: menuSets.indexPosition,
    basePath: context.paths[0],
  });
  leftMenuBlock.add(menu.context1);

  // Context in the menu
  menu['context2'] = Ti.UI.createLabel({
    text: context.menu[1],
    width: menuSets.labelWidth,
    height: 30,
    top: 30,
    left: menuSets.leftIndicator,
    color: menuSets.color,
    zIndex: menuSets.indexPosition,
    basePath: context.paths[1],
  });
  leftMenuBlock.add(menu.context2);

  // Context in the menu
  menu['context3'] = Ti.UI.createLabel({
    text: context.menu[2],
    width: menuSets.labelWidth,
    height: 30,
    top: 60,
    left: menuSets.leftIndicator,
    color: menuSets.color,
    zIndex: menuSets.indexPosition,
    basePath: context.paths[2],
  });
  leftMenuBlock.add(menu.context3);

  // Context in the menu
  menu['context4'] = Ti.UI.createLabel({
    text: context.menu[3],
    width: menuSets.labelWidth,
    height: 30,
    top: 90,
    left: menuSets.leftIndicator,
    color: menuSets.color,
    zIndex: menuSets.indexPosition,
    basePath: context.paths[3],
  });
  leftMenuBlock.add(menu.context4);
  
  // Context in the menu
  menu['context5'] = Ti.UI.createLabel({
    text: context.menu[4],
    width: menuSets.labelWidth,
    height: 30,
    top: 0,
    left: menuSets.leftIndicator,
    color: menuSets.color,
    zIndex: menuSets.indexPosition,
    basePath: context.paths[4],
  });
  rightMenuBlock.add(menu.context5);

  // Context in the menu
  menu['context6'] = Ti.UI.createLabel({
    text: context.menu[5],
    width: menuSets.labelWidth,
    height: 30,
    top: 30,
    left: menuSets.leftIndicator,
    color: menuSets.color,
    zIndex: menuSets.indexPosition,
    basePath: context.paths[5],
  });
  rightMenuBlock.add(menu.context6);

  // Context in the menu
  menu['context7'] = Ti.UI.createLabel({
    text: context.menu[6],
    width: menuSets.labelWidth,
    height: 30,
    top: 60,
    left: menuSets.leftIndicator,
    color: menuSets.color,
    zIndex: menuSets.indexPosition,
    basePath: context.paths[6],
  });
  rightMenuBlock.add(menu.context7);

  // Context in the menu
  menu['context8'] = Ti.UI.createLabel({
    text: context.menu[7],
    width: menuSets.labelWidth,
    height: 30,
    top: 90,
    left: menuSets.leftIndicator,
    color: menuSets.color,
    zIndex: menuSets.indexPosition,
    basePath: context.paths[7],
  });
  rightMenuBlock.add(menu.context8);

  // Actions for the itens in the menu
  for ( context in menu ) {
    if ( context.search('context') > -1 ) {
      if ( main.title.search( menu[context].text.toLowerCase() ) > -1 ) {
        menu[context].color = '#1c7a98';
      }

      menu[context].addEventListener('touchstart', function () {
        //this.color = '#1c7a98';
        this.opacity = 0.7;
        this.animate({ opacity: 1, color: '#1c7a98', duration: 500 });
      });

      menu[context].addEventListener('touchend', function () {
        if ( typeof main !== 'undefined' && typeof main.title !== 'undefined' && main.title.search( this.text.toLowerCase() ) === -1 ) {
          this.color = menuSets.color;
          // Create a new window
          var newWindow = Ti.UI.createWindow({
            url: this.basePath
          });
          // Close old window and open the new
          main.close();
          newWindow.open(); 
        }
      });
    } 
  }


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

// Create the title of sections
var makeTitle = function ( settings ) {
  settings = settings || {};

  if ( settings ) {
    var view = Ti.UI.createView( settings.view );
    var title = Ti.UI.createLabel( settings.title );
    var subtitle = Ti.UI.createLabel( settings.subtitle );

    view.add(title);
    view.add(subtitle);

    return {
      view: view,
      title: title,
      subtitle: subtitle
    };
  }
};

// Create a image footer description
var makeImageDescription = function ( settings ) {
  settings = settings || {};

  if ( settings ) {
    var view = Ti.UI.createView( settings.view );
    var description = Ti.UI.createLabel( settings.label );

    view.add(description);

    return {
      view: view,
      label: description
    };
  }
};


// Verify the content
var hasSection = function ( definitions ) {
  definitions = definitions || {};

  if ( definitions ) {
    if ( definitions.section.name === 'catarata' ) {
      if ( definitions.section.indication === 1 ) {
        bodyHeaderContent.title.text = 'A moderna cirurgia';
        bodyHeaderContent.subtitle.text = 'que pode mudar a sua vida';

        bodyImg.image = 'img/section_catarata_01.png';

        imgDescription.label.text = 'Cristalino Opacificado';

      } if ( section.indication === 2 ) {
        bodyHeaderContent.title.text = 'A moderna cirurgia';
        bodyHeaderContent.subtitle.text = 'que pode mudar a sua vida';

        bodyImg.image = 'img/section_catarata_02.png';
        
        imgDescription.label.text = 'O cirurgião utilizará uma técnica chamada \n facoemulsificação, através da qual o \n cristalino é fragmentado e aspirado.';

      } if ( section.indication === 3 ) {
        bodyHeaderContent.title.text = 'A moderna cirurgia';
        bodyHeaderContent.subtitle.text = 'que pode mudar a sua vida';

        bodyImg.image = 'img/section_catarata_03.png';

        imgDescription.label.text = 'Após a remoção do cristalino, a lente é \n implantada para restaurar sua visão.';

      } if ( section.indication === 4 ) {
        bodyHeaderContent.title.text = 'A moderna cirurgia';
        bodyHeaderContent.subtitle.text = 'que pode mudar a sua vida';

        bodyImg.image = 'img/section_catarata_04.png';

        imgDescription.label.text = 'Após a cirurgia, você aguardará a \n liberação do médico e, em seguida,\n poderá ir para casa.';

      }
    }
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