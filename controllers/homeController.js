(function(homeController) {

    var mailVerification = require('../services/mailVerification.js');
    var utils = require('../services/utilsSrv.js');

    homeController.init = function(app) {

        app.get('/', function(req, res) {
            res.render('index');
        });

        /*app.get('/index', function(req, res) {
            res.render('index');
        });*/

        app.get('/about', function(req, res){
        	res.render('about');
        });

        app.get('/login', function(req, res){
            res.render('account/login', {});
        });

        app.get('/register', function(req, res){
            res.render('account/login', {});
        });

        app.get('/account', function(req, res){
            res.render('account/account', {});
        });

        app.get('/changepassword', function(req, res){
            res.render('account/changePassword', {});
        });

        app.get('/subscribe', function(req, res){
            res.render('account/subscribe', {});
        });

        app.get('/verification', function(req, res){
            var token = req.query.email;
            console.log(token);
            mailVerification.verifyMail(token)
                            .then(function(data){
                                console.log(data);
                                if(utils.isErrorObject(data)){
                                    return res.render('mailVerification', {message: 'verification failed'});
                                }
                                return res.render('mailVerification', {message: 'verification success'});
                            }, function(error){
                                return res.render('mailVerification', {message: 'verification failed'});
                            });
            
        });
    };

})(module.exports);