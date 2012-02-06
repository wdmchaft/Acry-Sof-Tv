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
        color: '#fff'
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
      path: 'about.js',
      color: sets.menu.color,
      hasChild: true,
      sid: 'Editorial'
  }]
};