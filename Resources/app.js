// set background default
Titanium.UI.setBackgroundColor('#3e1a61');

Ti.include('functions/utils.js');

var win = Ti.UI.createWindow({
	title: 'AcrySof TV',
	url: 'about.js',
	backgroundImage: sets.img.background
});

win.open();
