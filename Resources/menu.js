// Includes
Ti.include('functions/utils.js');

// Hide to clear space
clearDashboard();

// Main window
var main = Ti.UI.createWindow({
	backgroundImage: 'img/background_menu.png',
	orientationModes: [Ti.UI.PORTRAIT]
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
		color: '#9284be'
	}
		
	menu['item01'] = Ti.UI.createView({
		top: 0,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item01);

	menu['content01'] = Ti.UI.createLabel({
		text: 'Editorial',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: 0
	});
	menu.item01.add(menu.content01);

	menu['item02'] = Ti.UI.createView({
		top: menuItemHeight,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item02);

	menu['content02'] = Ti.UI.createLabel({
		text: 'Catarata',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: 0
	});
	menu.item02.add(menu.content02);
	
	menu['item03'] = Ti.UI.createView({
		top: menuItemHeight*2,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item03);

	menu['content03'] = Ti.UI.createLabel({
		text: 'AcrySof® IQ ReSTOR®',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: 0
	});
	menu.item03.add(menu.content03);

	menu['item04'] = Ti.UI.createView({
		top: menuItemHeight*3,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item04);

	menu['content04'] = Ti.UI.createLabel({
		text: 'AcrySof® IQ Toric',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: 0
	});
	menu.item04.add(menu.content04);

	menu['item05'] = Ti.UI.createView({
		top: menuItemHeight*4,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item05);

	menu['content05'] = Ti.UI.createLabel({
		text: 'AcrySof® IQ',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: 0
	});
	menu.item05.add(menu.content05);

	menu['item06'] = Ti.UI.createView({
		top: menuItemHeight*5,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item06);

	menu['content06'] = Ti.UI.createLabel({
		text: 'AcrySof® IQ ReSTOR® Toric',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: 0
	});
	menu.item06.add(menu.content06);

	menu['item07'] = Ti.UI.createView({
		top: menuItemHeight*6,
		right: 0,
		width: contentArea.width,
		height: menuItemHeight
	});
	contentArea.add(menu.item07);

	menu['content07'] = Ti.UI.createLabel({
		text: 'Qualidade AcrySof® ASFÉRICA',
		width: 'auto',
		height: 'auto',
		font: { fontSize: menuSets.size },
		color: menuSets.color,
		textAlign: 'right',
		top: 0,
		right: 0
	});
	menu.item07.add(menu.content07);
};
populateMenu(7);


// Main footer menu
var footerMainMenu = createFooterMenu();
main.add(footerMainMenu);

// Open the main window
main.open();