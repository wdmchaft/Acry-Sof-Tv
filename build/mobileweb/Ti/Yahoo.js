define("Ti/Utils", ["Ti/_/Evented"], function(Evented) {

	(function(api){
		// Interfaces
		Ti._5.EventDriven(api);
		// Methods
		api.yql = function(){
			console.debug('Method "Titanium.Yahoo.yql" is not implemented yet.');
		};
	})(Ti._5.createClass('Ti.Yahoo'));
	
});