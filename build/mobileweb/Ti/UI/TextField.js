define("Ti/UI/TextField",
	["Ti/_/declare", "Ti/_/UI/TextBox", "Ti/_/css", "Ti/_/dom", "Ti/_/lang", "Ti/_/style", "Ti/UI"],
	function(declare, TextBox, css, dom, lang, style, UI) {

	var borderStyles = ["None", "Line", "Bezel", "Rounded"];

	return declare("Ti.UI.TextField", TextBox, {

		constructor: function(args) {
			var f = this._field = dom.create("input", {
				autocomplete: "off",
				style: {
					width: "100%",
					height: "100%"
				}
			}, this.domNode);

			this._initTextBox();
			this._keyboardType();
			this.borderStyle = UI.INPUT_BORDERSTYLE_NONE;

			require.on(f, "focus", this, function() {
				this.clearOnEdit && (f.value = "");
			});
		},

        _defaultWidth: "auto",

        _defaultHeight: "auto",

		_getContentWidth: function() {
			return this._measureText(this.value, this._field).width;
		},

		_getContentHeight: function() {
			return this._measureText(this.value, this._field).height;
		},

		_setTouchEnabled: function(value) {
			this.slider && style.set(this._field, "pointerEvents", value ? "auto" : "none");
		},

		_keyboardType: function(args) {
			var t = "text",
				args = args || {};
			if (lang.val(args.pm, this.passwordMask)) {
				t = "password";
			} else {
				switch (lang.val(args.kt, this.keyboardType)) {
					case UI.KEYBOARD_EMAIL:
						t = "email";
						break;
					case UI.KEYBOARD_NUMBER_PAD:
						t = "number";
						break;
					case UI.KEYBOARD_PHONE_PAD:
						t = "tel";
						break;
					case UI.KEYBOARD_URL:
						t = "url";
						break;
				}
			}
			this._field.type = t;
		},

		properties: {
			borderStyle: {
				set: function(value, oldValue) {
					var n = this.domNode,
						s = "TiUITextFieldBorderStyle";
					if (value !== oldValue) {
						css.remove(n, s + borderStyles[oldValue]);
						css.add(n, s + borderStyles[value]);
					}
					return value;
				}
			},

			clearOnEdit: false,

			hintText: {
				set: function(value) {
					this._field.placeholder = value;
					return value;
				}
			},

			keyboardType: {
				set: function(value) {
					this._keyboardType({ kt:value });
					return value;
				}
			},

			maxLength: {
				set: function(value) {
					value = value|0;
					this._field.maxlength = value > 0 ? value : "";
					return value;
				}
			},

			passwordMask: {
				value: false,
				set: function(value) {
					this._keyboardType({ pm:value });
					return value;
				}
			}
		}

	});

});
