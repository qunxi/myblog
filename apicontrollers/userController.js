(function(userController) {

    var User = require('../models/user.js');
    var jwtSrv = require('jwt-simple');
    var authenticate = require('../services/authenticateSrv.js');
    var utils = require('../services/utilsSrv.js');

    userController.init = function(app) {

        //set up different secret for each app
        var SECRET_KEY = app.get('SECRET_KEY');
        var logger = app.get('appLogger');
        /* 
         * register
         * */
        app.post('/api/register', function(req, res) {

            var reqUser = req.body;

            var searchUser = {
                $or: [{
                    username: reqUser.username
                }, {
                    username: reqUser.email
                }, {
                    email: reqUser.email
                }, {
                    email: reqUser.username
                }]
            };

            User.findOne(searchUser, function(err, user) {
                if (err) {
                        logger.error('find user ' + searchUser + ' occured a problem' + err);
                        return res.status(500).send({
                            error: 'find user ' + searchUser + ' occured a problem'
                    });
                }
                
                if (user) {

                    return res.status(406).send({
                        message: "the user has exist"
                    });
                }

                var newUser = new User({
                    email: reqUser.email,
                    password: reqUser.password,
                    username: reqUser.username
                });

                newUser.save(function(err) {
                    createSendToken(newUser, res);
                });
            });
        });

        /*
         * login
         * */
        app.post('/api/login', function(req, res) {
            var reqUser = req.body;

            var searchUser = {
                $or: [{
                    username: reqUser.username
                }, {
                    email: reqUser.username
                }]
            };

            User.findOne(searchUser, function(err, user) {
               
                if (err) {
                    logger.error('find user ' + searchUser + ' occured a problem' + err);
                    return res.status(500).send({
                        error: 'find user ' + searchUser + ' occured a problem'
                    });
                }

                if (!user){
                    return res.status(401).send({
                        error: 'Wrong eamil/password',
                        message: 'Wrong eamil/password'
                    });
                }

                user.comparePasswords(reqUser.password, function(err, isMatch) {
                    if (err) {
                        logger.error('compare password throw an err: ' + err);
                        return res.status(500).send({
                            error: 'compare password has a problem'
                        });
                    }

                    if (!isMatch) {
                        return res.status(401).send({
                            error: 'Wrong eamil/password',
                            message: 'Wrong eamil/password'
                        });
                    }
                    createSendToken(user, res);
                });

            });

        });

        app.post('/api/user/changePassword', function(req, res) {
            var params = req.body;
            var token = params.token;
            var originPassword = params.originPassword;
            var newPassword = params.newPassword;

            authenticate.verification(token, SECRET_KEY)
                        .then(function(user){
                            if(utils.isErrorObject(user)){
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
                                        .then(function(data){
                                             return res.status(200).send();
                                        }, function(error){
                                             return res.status(500).send({
                                                error: 'update password occured a problem'
                                             });
                                        });
                            });
                        });
        });


        function createSendToken(user, res) {
            var payload = {
                //iss: req.hostname,
                sub: user.id
            };

            var token = jwtSrv.encode(payload, SECRET_KEY);

            res.status(200).send({
                user: user.toJSON(),
                token: token
            });
        }

    };
})(module.exports);