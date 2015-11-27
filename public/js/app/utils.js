angular.module('app').factory('UtilsService', UtilsService);

UtilsService.$inject = ['$window'];

function UtilsService($window) {
    var service = {
        /*cutString: cutString,*/
        formatDate: formatDate,
        isErrorObject: isErrorObject,
        getLocationPath: getLocationPath,
        redirectUrl: redirectUrl
    };

    function formatDate(date) {
        var newDate = new Date();

        if (!(date instanceof Date)) {
            var parseDate = Date.parse(date);
            if (!!parseDate) {
                newDate = new Date(parseDate);
            }
        } else {
            newDate = date;
        }

        return newDate.getUTCFullYear() + '-' +
            (newDate.getUTCMonth() + 1) + '-' + newDate.getUTCDate() +
            ' ' + newDate.getUTCHours() + ':' + newDate.getUTCMinutes() +
            ':' + newDate.getUTCSeconds();
    }

    function isErrorObject(data) {
        return !!data && data.hasOwnProperty('error');
    }

    function getLocationPath(){
    	return $window.location.pathname;
    }

    function redirectUrl(path){
    	$window.location.href = path;
    }
    /*function cutString(data, maxLength){
			if(data.length > maxLength){
				return data.substr(0, maxLength) + '...';
			}
			return data;
		}*/

    return service;
}