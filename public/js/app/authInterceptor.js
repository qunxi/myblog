(function() {
    'use strict';

    angular.module('app')
        .factory('authToken', authToken);

    authToken.$inject = ['$window'];

    function authToken($window) {

        var userCache = null;
        var cacheKey = 'user';

        var service = {
            getToken: getToken,
            isAuthenticated: isAuthenticated,
            getCurrentUser: getCurrentUser,
            setCurrentUser: setCurrentUser,
            removeCurrentUser: removeCurrentUser
        };
        return service;

        function getCurrentUser() {
            if (!userCache) {
                userCache = $window.localStorage.getItem(cacheKey);
            }
            return !userCache ? null : userCache.user;
        }

        function getToken() {
            if (!userCache) {
                userCache = angular.fromJson($window.localStorage.getItem(cacheKey));
            }
            return !userCache ? null : userCache.token;
        }

        function removeCurrentUser() {
            userCache = null;
            $window.localStorage.removeItem(cacheKey);
        }

        function setCurrentUser(user) {
            userCache = user;
            $window.localStorage.setItem(cacheKey, angular.toJson(user));
        }

        function isAuthenticated() {
            return !!getToken();
        }
    }
})();


(function() {
    'use strict';

    angular.module('app')
        .factory('authInterceptor', authInterceptor);

    angular.module('app')
        .config(function($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    });

    authInterceptor.$inject = ['authToken'];

    function authInterceptor(authToken) {
        var service = {
            request: request,
            response: response
        };

        return service;

        function request(config) {
            var token = authToken.getToken();

            if (token)
                config.headers.Authorization = "Bear" + " " + token;

            return config;
        }

        function response(res) {
            return res;
        }

    }

})();