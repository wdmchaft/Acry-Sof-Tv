// Includes
Ti.include('functions/utils.js');

// Hide to clear space
clearDashboard();

// Main window
var main = Ti.UI.createWindow({
	backgroundImage: 'img/background_menu.png',
	orientationModes: [Ti.UI.PORTRAIT],
	opacity: 0,
	width: 768,
	left: -768,
	title: 'menu'
});

main.addEventListener('focus', function () {
	main.animate({opacity: 1, left: 0, duration: 500});
});

// Area for the content
var contentArea = Ti.UI.createView({
	width: 550,
	height: 700,
	top: 155,
	left: 125
});
main.add(contentArea);

// Populate the menu area
var populateMenu = function ( itens ) {
	var menuItemHeight = contentArea.height/itens;
	var menu = {};
	var menuSets = {
		size: 28,
		color: '#9284be',
		right: 25
	}
	
	// Item
	menu['item01'] = Ti.UI.createView({
		top: 0,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item01);

	// Content
	menu['content01'] = Ti.UI.createLabel({
		text: 'Editorial',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: menuSets.right,
		basePath: 'editorial.js'
	});
	menu.item01.add(menu.content01);

	// Item
	menu['item02'] = Ti.UI.createView({
		top: menuItemHeight,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item02);

	// Content
	menu['content02'] = Ti.UI.createLabel({
		text: 'Catarata',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: menuSets.right,
		basePath: 'simulation1.js'
	});
	menu.item02.add(menu.content02);
	
	// Item
	menu['item03'] = Ti.UI.createView({
		top: menuItemHeight*2,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item03);

	// Content
	menu['content03'] = Ti.UI.createLabel({
		text: 'AcrySof® IQ ReSTOR®',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: menuSets.right,
		basePath: 'simulation2.js'
	});
	menu.item03.add(menu.content03);

	// Item
	menu['item04'] = Ti.UI.createView({
		top: menuItemHeight*3,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item04);

	// Content
	menu['content04'] = Ti.UI.createLabel({
		text: 'AcrySof® IQ Toric',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: menuSets.right,
		basePath: 'simulation3.js'
	});
	menu.item04.add(menu.content04);

	// Item
	menu['item05'] = Ti.UI.createView({
		top: menuItemHeight*4,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item05);

	// Content
	menu['content05'] = Ti.UI.createLabel({
		text: 'AcrySof® IQ',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: menuSets.right,
		basePath: 'simulation4.js'
	});
	menu.item05.add(menu.content05);

	// Item
	menu['item06'] = Ti.UI.createView({
		top: menuItemHeight*5,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item06);

	// Content
	menu['content06'] = Ti.UI.createLabel({
		text: 'AcrySof® IQ ReSTOR® Toric',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: menuSets.right,
		basePath: 'simulation5.js'
	});
	menu.item06.add(menu.content06);

	// Item
	menu['item07'] = Ti.UI.createView({
		top: menuItemHeight*6,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item07);

	// Content
	menu['content07'] = Ti.UI.createLabel({
		text: 'Qualidade AcrySof® ASFÉRICA',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: menuSets.right,
		basePath: 'section6.js'
	});
	menu.item07.add(menu.content07);

	// Add click on the itens in the menu
	for ( var i in menu ) {
		if ( i.search('content') > -1 )
			menu[i].addEventListener('click', function () {
				// Create a new window
				var newWindow = Ti.UI.createWindow({
			    	url: this.basePath
			    });
			    // Close old window and open the new
			    main.close();
			    newWindow.open();
			});
	}
};
populateMenu(7);

// Open the main window
main.open();