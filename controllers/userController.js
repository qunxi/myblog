(function(userController) {

    var User = require('../models/user.js');
    var jwtSrv = require('jwt-simple');
    //var jwtSrv = require('../services/jwtService.js');

    userController.init = function(app) {

        //set up different secret for each app
        var SECRET_KEY = app.get('SECRET_KEY');

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
                if (err) throw err;
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
                if (err) throw err;

                if (!user)
                    return res.status(401).send({
                        message: 'Wrong eamil/password'
                    });

                user.comparePasswords(reqUser.password, function(err, isMatch) {
                    if (err) throw err;

                    if (!isMatch) {
                        return res.status(401).send({
                            message: 'Wrong eamil/password'
                        });
                    }
                    createSendToken(user, res);
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