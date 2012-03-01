define("Ti/Geolocation", ["Ti/_/Evented"], function(Evented) {
	
	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
	
		var undef;
	
		// Properties
		Ti._5.propReadOnly(api, {
			ACCURACY_BEST: 0,
			ACCURACY_HUNDRED_METERS: 2,
			ACCURACY_KILOMETER: 3,
			ACCURACY_NEAREST_TEN_METERS: 1,
			ACCURACY_THREE_KILOMETERS: 4,
	
			AUTHORIZATION_AUTHORIZED: 4,
			AUTHORIZATION_DENIED: 1,
			AUTHORIZATION_RESTRICTED: 2,
			AUTHORIZATION_UNKNOWN: 0,
	
			ERROR_DENIED: 1,
			ERROR_HEADING_FAILURE: 2,
			ERROR_LOCATION_UNKNOWN: 3,
			ERROR_NETWORK: 0,
			ERROR_REGION_MONITORING_DELAYED: 4,
			ERROR_REGION_MONITORING_DENIED: 5,
			ERROR_REGION_MONITORING_FAILURE: 6,
	
			PROVIDER_GPS: 1,
			PROVIDER_NETWORK: 2
		});
	
		Ti._5.prop(api, {
			accuracy: api.ACCURACY_BEST,
			locationServicesAuthorization: undef,
			locationServicesEnabled: undef,
			preferredProvider: undef,
			purpose: undef,
			showCalibration: true
		});
	
		// Methods
		api.getCurrentPosition = function(callbackFunc) {
			if (_lastPosition && require.is(callbackFunc, "Function")) {
				callbackFunc(_lastPosition);
				return;
			}
			if (_lastError) {
				require.is(callbackFunc, "Function") && callbackFunc(_lastError);
				return;
			}
			navigator.geolocation.getCurrentPosition(
				function(oPos){
					require.is(callbackFunc, "Function") && callbackFunc({
						code: 0,
						coords: {
							latitude : oPos.coords.latitude,
							longitude : oPos.coords.longitude,
							altitude : oPos.coords.altitude,
							heading : oPos.coords.heading,
							accuracy : oPos.coords.accuracy,
							speed : oPos.coords.speed,
							altitudeAccuracy : oPos.coords.altitudeAccuracy,
							timestamp : oPos.timestamp
						},
						error: "",
						success: true
					});
				},
				function(oError){
					require.is(callbackFunc, "Function") && callbackFunc({
						coords: null,
						error: oError.message,
						message: oError.message,
						success: false
					});
				},
				{
					enableHighAccuracy : _accuracy < 3 || api.ACCURACY_BEST === _accuracy
				}
			);
		};
	
		var _watchId,
			_oldAddEventListener = api.addEventListener, // WARNING: this may cause problems
			_lastPosition = null,
			_lastError = null;
	
		api.addEventListener = function(eventType, callback){
			_oldAddEventListener(eventType, callback);
			if(eventType == "location"){
				_watchId = navigator.geolocation.watchPosition(
					function(oPos){
						_lastError = null;
	
						api.fireEvent("location", _lastPosition = {
							code: 0,
							coords : {
								latitude : oPos.coords.latitude,
								longitude : oPos.coords.longitude,
								altitude : oPos.coords.altitude,
								heading : oPos.coords.heading,
								accuracy : oPos.coords.accuracy,
								speed : oPos.coords.speed,
								altitudeAccuracy : oPos.coords.altitudeAccuracy,
								timestamp : oPos.timestamp
							},
							error: "",
							provider: null,
							success: true
						});
						/*
						if (oPos.heading) {
							api.fireEvent("heading", oPos);
						}
						*/
					},
					function(oError){
						_lastPosition = null;
	
						api.fireEvent("location", _lastError = {
							coords: null,
							error: oError.message,
							message: oError.message,
							provider: null,
							success: false
						});
						/*
						if (oPos.heading) {
							api.fireEvent("heading", oPos);
						}
						*/
					},
					{
						enableHighAccuracy : _accuracy < 3 || api.ACCURACY_BEST === _accuracy
					}
				);
			}
		};
		var _oldRemoveEventlistener = api.removeEventListener; // WARNING: this may cause problems
		api.removeEventListener = function(eventName, cb){
			_oldRemoveEventlistener(eventName, cb);
			if(eventName == "location"){
				navigator.geolocation.clearWatch(_watchId);
			}
		};
	
		api.forwardGeocoder = function(address, callbackFunc) {};
		api.getCurrentHeading = function(callbackFunc) {};
		api.reverseGeocoder = function(latitude, longitude, callbackFunc) {};
		api.setShowCalibration = function(val) {
			/*
			if ("undefined" == typeof val) {
				val = true;
			}
			*/
			api.showCalibration = !!val;
		};
	})(Ti._5.createClass("Ti.Geolocation"));

});