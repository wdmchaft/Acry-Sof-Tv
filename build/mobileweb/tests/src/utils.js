// Deal function for format string content
String.prototype.deal = function() {
	var content = this,
		n = 0,
		args = arguments;

		for ( var i in args ) {
			if ( content.search(/\{+[0-9]+\}/) !== -1 ) {
				content = content.replace( '\{' + i + '\}', args[i] )
			} if ( content.search( /\{[0-9][:][e][0-9]\}/ ) > -1 ) {
				n = content.match( /\{[0-9][:][e][0-9]\}/ )
				n = n[0].replace( '\{'+i+':e', '' )
				n = n.replace( '\}', '' )
				n = parseInt(n)

				if ( content.search( '\{'+i+':e'+n+'\}' ) > -1 ) {
					args[i] = parseFloat(args[i])
					args[i] = args[i].toFixed(n)
					content = content.replace( /\{[0-9][:][e][0-9]\}/, args[i] )
				}
			}
		}

		return content;
}

function makeContentBlock ( options ) {
	// Create a block of content
	if ( typeof options !== undefined ) {
		var view = Ti.UI.createView( options.view );
		var	label = Ti.UI.createLabel( options.label );
		
		view.add(label);
		
		return view;	
	}
}

function makeContentBody ( options ) {
	// set a body of content
	if ( typeof options !== undefined ) {
		var view = Ti.UI.createView( options.view );

		return view;
	}
}

function makeContentTable ( options ) {
	var table = Ti.UI.createTableView( options.table );	

	return table;
}

function isArray ( o ) {
	return ( o.constructor.toString().search('Array') > -1 ) && true || false;
}