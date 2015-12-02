(function(userController) {

    var User = require('../models/user.js');
    var jwtSrv = require('jwt-simple');
    var authenticate = require('../services/authenticateSrv.js');
    var utilsSrv = require('../services/utilsSrv.js');
    
    var mailVerification = require('../services/mailVerification.js');

    userController.init = function(app) {

        //set up different secret for each app
        var SECRET_KEY = app.get('SECRET_KEY');
        var logger = app.get('appLogger');
        /* 
         * register
         * */
        app.post('/api/register', function(req, res) {

            var reqUser = req.body;
            var username = !reqUser.username ? '' : reqUser.username;
            var email = !reqUser.email ? '' : reqUser.email;

            User.findUserByNameOrEmail(username , email)
                .then(function(data) {
                    if (!data) {
                        var newUser = new User({
                            email: reqUser.email,
                            password: reqUser.password,
                            username: reqUser.username
                        });
                        return saveUser(newUser);
                    }

                    return utilsSrv.failedResponse(res, {
                        error: 'the email or user name has exist'
                    });
                }, function(error) {
                    logger.error('find user ' + searchUser + ' occured a problem ' + err);
                    return utilsSrv.failedResponse(res, {
                        error: 'check the username occured a problem'
                    });
                });
        });
        /*
         * login
         * */
        app.post('/api/login', function(req, res) {
            var reqUser = req.body;

            var username = !reqUser.username ? '' : reqUser.username;
            var email = !reqUser.email ? '' : reqUser.email;
            
            if(!username){
                username = email;
            }
            else if(!email){
                email = username;
            }
            else{
                //this situation shouldn't happen
                return utilsSrv.failedResponse(res, {
                            error: 'user name or password is not correct'
                        });
            }

            User.findUserByNameOrEmail(username, email)
                .then(function(data) {
                    if (!data) {
                        return utilsSrv.failedResponse(res, {
                            error: 'user name or password is not correct'
                        });
                    }

                    if(!data.actived){
                        return utilsSrv.failedResponse(res, {
                            error: 'your account not actived'
                        });
                    }

                    return comparePassword(data, reqUser.password, res);
                }, function(error) {
                    logger.error('find user ' + searchUser + ' occured a problem' + err);
                    return utilsSrv.failedResponse(res, {
                        error: 'find user ' + searchUser + ' occured a problem'
                    });
                });
        });

        app.post('/api/user/changePassword', function(req, res) {
            var params = req.body;
            var token = params.token;
            var originPassword = params.originPassword;
            var newPassword = params.newPassword;

            authenticate.verification(token, SECRET_KEY)
                .then(function(user) {
                    if (utils.isErrorObject(user)) {
                        logger.error('token ' + token + 'verification failed #error# ' + user);
                        return utils.authenticateFailed(res, user);
                    }

                    user.comparePasswords(originPassword, function(err, isMatch) {
                        if (err) {
                            return res.status(500).send({
                                error: 'compare password has a problem'
                            });
                        }

                        if (!isMatch) {
                            return res.status(401).send({
                                error: 'Original password is not correct.'
                            });
                        }
                        user.password = newPassword;
                        user.save()
                            .then(function(data) {
                                return res.status(200).send();
                            }, function(error) {
                                return res.status(500).send({
                                    error: 'update password occured a problem'
                                });
                            });
                    });
                });
        });

        function comparePassword(user, password, res) {

            user.comparePasswords(password, function(err, isMatch) {
                if (err) {
                    logger.error('compare password throw an err: ' + err);
                    return utilsSrv.failedResponse(res, {
                        error: 'compare password has a problem'
                    });
                }

                if (!isMatch) {
                    return utilsSrv.failedResponse(res, {
                        error: 'Wrong eamil/password',
                    });
                }

                return utilsSrv.successResponse(res, {
                    user: user.toJSON(),
                    token: authenticate.createToken(user._id)
                });

            });
        }


        function saveUser(user) {
            user.save()
                .then(function(data) {
                    
                    return mailVerification.sendMail(user.email, user._id)
                                    .then(function(data){
                                        
                                        return utilsSrv.successResponse(res, {
                                                user: user.toJSON()
                                            });
                                    }, function(error){
                                        
                                        return utilsSrv.failedResponse(res, {
                                                error: 'register failed'
                                        });
                                    });

                }, function(error) {
                    console.log(error);
                    return utilsSrv.failedResponse(res, {
                        error: 'register failed'
                    });
                });
        }


    };
})(module.exports);