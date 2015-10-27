(function(UtilsService){
	UtilsService.isErrorObject = function(obj){
		return !!obj && obj.hasOwnProperty('error');
	};
})(module.exports);