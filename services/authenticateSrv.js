(function(authenticateService) {

    var jwtSrv = require('jwt-simple');
    var Q = require('q');
    var User = require('../models/user.js');

    //const value and  can't access by the out side
    var SECRET_KEY = 'xxxx';

    authenticateService.createToken = createToken;
    authenticateService.verifyToken = verifyToken;
    authenticateService.getTokenFrmHttpRequest = getTokenFrmHttpRequest;

    authenticateService.verification = function(token, SECRET_KEY) {
        var payload = jwtSrv.decode(token, SECRET_KEY);

        return User.findUserById(payload.sub)
            .then(function(data) {
                return data;
            }, function(error) {

                return {
                    error: error,
                    message: 'authenticate occur a problem'
                };
            });
    };


    /**/
    function getTokenFrmHttpRequest(req){
        var authorization = req.headers.authorization;
        return !authorization ? '' : req.headers.authorization.split(' ')[1];
    }

    function verifyToken(token) {
        var deferred = Q.defer();

        deferred.reject({
            error: 'Token Authorized failed'
        });

        /*if (!req.headers.authorization) {
            return deferred.promise;
        }

        var token = req.headers.authorization.split(' ')[1];*/

        if (!token) {
            return deferred.promise;
        }

        var payload = jwtSrv.decode(token, SECRET_KEY);

        if (!payload.sub) {
            return deferred.promise;
        }

        return User.findUserById(payload.sub)
            .then(function(data) {
                if (!data) {
                    return deferred.promise;
                }
                return data;
            }, function(error) {
                return deferred.promise;
            });
    }

    function createToken(userId) {
        
        var payload = {
            //iss: req.hostname,
            sub: userId
        };

        return jwtSrv.encode(payload, SECRET_KEY);
    }


})(module.exports);