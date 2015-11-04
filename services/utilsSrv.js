(function(UtilsService){
	UtilsService.isErrorObject = function(obj){
		return !!obj && obj.hasOwnProperty('error');
	};
	UtilsService.isWarningObject = function(obj){
		return !!obj && obj.hasOwnProperty('warning');
	};
})(module.exports);