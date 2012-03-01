define("Ti/UI", ["Ti/_/dom", "Ti/_/Evented", "Ti/_/lang", "Ti/_/ready", "Ti/_/style"], function(dom, Evented, lang, ready, style) {
	
	var body = document.body,
		isDef = require.isDef,
		isIOS = /(iPhone|iPad)/.test(navigator.userAgent);

	body.addEventListener('touchmove', function(e) {
		e.preventDefault();
	}, false);

	function hideAddressBar() {
		var x = 0;
		if (isIOS && !window.location.hash) {
			if (document.height <= window.outerHeight + 10) {
				body.style.height = (window.outerHeight + 60) + "px";
				x = 50;
			}
			setTimeout(function() {
				window.scrollTo(0, 1);
				window.scrollTo(0, 0);
				Ti.UI._doFullLayout();
			}, x);
		}
	}

	if (isIOS) {
		ready(hideAddressBar);
		window.addEventListener("orientationchange", hideAddressBar);
	}

	return lang.setObject("Ti.UI", Evented, {

		_addWindow: function(win) {
			this._validateContainer();
			this._container.add(win);
		},

		_removeWindow: function(win) {
			this._validateContainer();
			this._container.remove(win);
		},

		_doFullLayout: function() {
			if (!this._layoutInProgress) {
				this._layoutInProgress = true;
				setTimeout(lang.hitch(this, function(){
					this._validateContainer();
					this._container.doLayout(0, 0, body.clientWidth, body.clientHeight, true, true);
					this._layoutInProgress = false;
				}), 25);
			}
		},

		_doForcedFullLayout: function() {
			this._validateContainer();
			this._container.doLayout(0, 0, body.clientWidth, body.clientHeight, true, true);
			this._layoutInProgress = false;
			
		},

		_validateContainer: function() {
			if (!isDef(this._container)) {
				this._layoutInProgress = false;
				this._container = Ti.UI.createView({
					left: 0,
					top: 0
				});
				body.appendChild(this._container.domNode);
			}
		},

		properties: {
			backgroundColor: {
				set: function(value) {
					return style.set(body, "backgroundColor", value);
				}
			},
			backgroundImage: {
				set: function(value) {
					return style.set(body, "backgroundImage", value ? style.url(value) : "");
				}
			}
		},

		constants: {
			UNKNOWN: 0,
			FACE_DOWN: 1,
			FACE_UP: 2,
			PORTRAIT: 3,
			UPSIDE_PORTRAIT: 4,
			LANDSCAPE_LEFT: 5,
			LANDSCAPE_RIGHT: 6,
			INPUT_BORDERSTYLE_NONE: 0,
			INPUT_BORDERSTYLE_LINE: 1,
			INPUT_BORDERSTYLE_BEZEL: 2,
			INPUT_BORDERSTYLE_ROUNDED: 3,
			INPUT_BUTTONMODE_ALWAYS: 1,
			INPUT_BUTTONMODE_NEVER: 0,
			INPUT_BUTTONMODE_ONBLUR: 0,
			INPUT_BUTTONMODE_ONFOCUS: 1,
			KEYBOARD_APPEARANCE_ALERT: 1,
			KEYBOARD_APPEARANCE_DEFAULT: 0,
			KEYBOARD_ASCII: 1,
			KEYBOARD_DEFAULT: 2,
			KEYBOARD_EMAIL: 3,
			KEYBOARD_NAMEPHONE_PAD: 4,
			KEYBOARD_NUMBERS_PUNCTUATION: 5,
			KEYBOARD_NUMBER_PAD: 6,
			KEYBOARD_PHONE_PAD: 7,
			KEYBOARD_URL: 8,
			NOTIFICATION_DURATION_LONG: 1,
			NOTIFICATION_DURATION_SHORT: 2,
			PICKER_TYPE_COUNT_DOWN_TIMER: 1,
			PICKER_TYPE_DATE: 2,
			PICKER_TYPE_DATE_AND_TIME: 3,
			PICKER_TYPE_PLAIN: 4,
			PICKER_TYPE_TIME: 5,
			RETURNKEY_DEFAULT: 0, // return
			RETURNKEY_DONE: 1, // Done
			RETURNKEY_EMERGENCY_CALL: 2, // Emergency Call
			RETURNKEY_GO: 3, // Go
			RETURNKEY_GOOGLE: 4, // Search
			RETURNKEY_JOIN: 5, // Join
			RETURNKEY_NEXT: 6, // Next
			RETURNKEY_ROUTE: 7, // Route
			RETURNKEY_SEARCH: 8, // Search
			RETURNKEY_SEND: 9, // Send
			RETURNKEY_YAHOO: 10, // Search
			TEXT_ALIGNMENT_CENTER: 1,
			TEXT_ALIGNMENT_RIGHT: 2,
			TEXT_ALIGNMENT_LEFT: 3,
			TEXT_AUTOCAPITALIZATION_ALL: 3,
			TEXT_AUTOCAPITALIZATION_NONE: 0,
			TEXT_AUTOCAPITALIZATION_SENTENCES: 2,
			TEXT_AUTOCAPITALIZATION_WORDS: 1,
			TEXT_VERTICAL_ALIGNMENT_BOTTOM: 2,
			TEXT_VERTICAL_ALIGNMENT_CENTER: 1,
			TEXT_VERTICAL_ALIGNMENT_TOP: 3,
			ANIMATION_CURVE_EASE_IN: 1,
			ANIMATION_CURVE_EASE_IN_OUT: 2,
			ANIMATION_CURVE_EASE_OUT: 3,
			ANIMATION_CURVE_LINEAR: 4
		},

		create2DMatrix: function(args) {
			return new Ti.UI["2DMatrix"](args);
		},

		createActivityIndicator: function(args) {
			return new Ti.UI.ActivityIndicator(args);
		},

		createAlertDialog: function(args) {
			return new Ti.UI.AlertDialog(args);
		},

		createAnimation: function(args) {
			return new Ti.UI.Animation(args);
		},

		createButton: function(args) {
			return new Ti.UI.Button(args);
		},

		createButtonBar: function() {
			console.debug('Method "Titanium.UI.createButtonBar" is not implemented yet.');
		},

		createDashboardItem: function() {
			console.debug('Method "Titanium.UI.createDashboardItem" is not implemented yet.');
		},

		createDashboardView: function() {
			console.debug('Method "Titanium.UI.createDashboardView" is not implemented yet.');
		},

		createEmailDialog: function() {
			console.debug('Method "Titanium.UI.createEmailDialog" is not implemented yet.');
		},

		createImageView: function(args) {
			return new Ti.UI.ImageView(args);
		},

		createLabel: function(args) {
			return new Ti.UI.Label(args);
		},

		createOptionDialog: function() {
			console.debug('Method "Titanium.UI.createOptionDialog" is not implemented yet.');
		},

		createPicker: function(args) {
			return new Ti.UI.Picker(args);
		},

		createPickerColumn: function() {
			console.debug('Method "Titanium.UI.createPickerColumn" is not implemented yet.');
		},

		createPickerRow: function(args) {
			return new Ti.UI.PickerRow(args);
		},

		createProgressBar: function() {
			console.debug('Method "Titanium.UI.createProgressBar" is not implemented yet.');
		},

		createScrollView: function(args) {
			return new Ti.UI.ScrollView(args);
		},

		createScrollableView: function(args) {
			return new Ti.UI.ScrollableView(args);
		},

		createSearchBar: function(args) {
			return new Ti.UI.SearchBar(args);
		},

		createSlider: function(args) {
			return new Ti.UI.Slider(args);
		},

		createSwitch: function(args) {
			return new Ti.UI.Switch(args);
		},

		createTab: function(args) {
			return new Ti.UI.Tab(args);
		},

		createTabGroup: function(args) {
			return new Ti.UI.TabGroup(args);
		},

		createTableView: function(args) {
			return new Ti.UI.TableView(args);
		},

		createTableViewRow: function(args) {
			return new Ti.UI.TableViewRow(args);
		},

		createTableViewSection: function(args) {
			return new Ti.UI.TableViewSection(args);
		},

		createTextArea: function(args) {
			return new Ti.UI.TextArea(args);
		},

		createTextField: function(args) {
			return new Ti.UI.TextField(args);
		},

		createView: function(args) {
			return new Ti.UI.View(args);
		},

		createWebView: function(args) {
			return new Ti.UI.WebView(args);
		},

		createWindow: function(args) {
			return new Ti.UI.Window(args);
		}

	});

});