(function(accountController) {

    //var User = require('../models/user.js');
    //var jwtSrv = require('jwt-simple');
    //var mailVerification = require('../services/mailVerification.js');

    var authenticate = require('../services/authenticateSrv.js');
    var accountSrv = require('../services/accountService.js');
    var utils = require('../services/utilsSrv.js');
    
    accountController.init = function(app) {

        app.post('/api/account', function(req, res) {
            var account = req.body.account;
            var token = authenticate.getTokenFrmHttpRequest(req);
           	
            return authenticate.verifyToken(token)
                .then(function(data) {

                    accountSrv.updateAccount(data._id, account)
                        .then(function(data) {
                            return utils.httpResponse(res, data);
                        }, function(error) {
                            return utils.httpResponse(res, error);
                        });
                }, function(error) {
                    return utils.authenticateFailed(res, error);
                });
        });

        app.get('/api/account', function(req, res) {
            var token = authenticate.getTokenFrmHttpRequest(req);
            return authenticate.verifyToken(token)
            	.then(function(user){
		            accountSrv.getUserAccount(user._id)
		                   .then(function(data){
		                        return utils.httpResponse(res, data);
		                   }, function(error){
		                        return utils.httpResponse(res, error);
		                   });
               }, function(error){
               		return utils.authenticateFailed(res, error);
               });
        });


        app.post('/api/account/password', function(req, res) {
            var token = authenticate.getTokenFrmHttpRequest(req);
            var originPassword = req.body.originPassword;
            var newPassword = req.body.newPassword;

            return authenticate.verifyToken(token)
                .then(function(user) {
                    accountSrv.modifyPassword(user, originPassword, newPassword)
                        .then(function(data) {
                            return utils.httpResponse(res, data);
                        }, function(error) {
                            return utils.httpResponse(res, error);
                        });

                }, function(error) {
                    return utils.authenticateFailed(res, error);
                });
        });
    };

})(module.exports);