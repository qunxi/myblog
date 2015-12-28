(function(accountService) {
    'use strict';

    var User = require('../models/user.js');
    var utils = require('./utilsSrv.js');
    var Q = require('q');

    accountService.getUserAccount = getUserAccount;
    accountService.updateAccount = updateAccount;
    accountService.modifyPassword = modifyPassword;

    function modifyPassword(user, origin, current) {

        var deferred = Q.deferred;
        if (!user || !origin || !current) {
            deferred.reject({
                status: 400,
                error: 'you do not provider user Id in request'
            });
            return deferred.promise;
        }

        return user.comparePasswordPromise(origin)
            .then(function(isMatch) {
                if (isMatch) {
                    user.password = current;
                    user.save()
                        .then(function(data) {
                            return {
                                status: 200,
                                data: user
                            };
                        }, function(error) {
                            deferred.reject({
                                status: 500,
                                error: error
                            });
                            return deferred.promise;
                        });
                } else {
                    deferred.reject({
                        status: 404,
                        error: 'you do not provider user Id in request'
                    });
                    return deferred.promise;
                }
            }, function(error) {
            	console.log(error);
                deferred.reject({
                    status: 500,
                    error: error
                });
                return deferred.promise;
            });
    }


    function updateAccount(userId, account) {

        var deferred = Q.deferred;

        return getUserAccount(userId)
            .then(function(ret) {
            	
            	var user = ret.data;
            	
            	user.username = account.username;
            	user.mobilePhone = account.mobilePhone;
            	user.sex = account.sex;
            	user.address = account.address;
            	user.github = account.github;
            	user.blog = account.blog;
            	user.description = account.description;
            	user.realName = account.realName;
            	user.published = account.published;
            	
                return user.save()
                    .then(function(data) {
                        return {
                        	status: 200,
                        	data: data
                        };
                    }, function(error) {
                        deferred.reject({
                            status: 500,
                            error: 'data base has an error'
                        });
                        return deferred.promise;
                    });
            }, function(error) {
            	console.log(error);
                deferred.reject(error);
                return deferred.promise;
            });
    }

    function getUserAccount(userId) {

        var deferred = Q.defer();

        if (!userId) {
            deferred.reject({
                status: 400,
                error: 'you do not provider user Id in request'
            });
            return deferred.promise;
        }

        return User.findUserById(userId)
            .then(function(data) {
                if (utils.isErrorObject(data)) {
                    deferred.reject({
                        status: 500,
                        error: 'data base has an error'
                    });
                    return deferred.promise;
                }

                if (!data) {
                    deferred.reject({
                        status: 404,
                        error: 'the user did not find'
                    });
                    return deferred.promise;
                }
                return {
                	status: 200,
                	data:data
                };
            });
    }

})(module.exports);