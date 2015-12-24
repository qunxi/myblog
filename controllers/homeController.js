(function(homeController) {

    var mailVerification = require('../services/mailVerification.js');
    var utils = require('../services/utilsSrv.js');
    var rssRequest = require('../services/rssRequestSrv.js');
    var bookService = require('../services/bookService.js');

    homeController.init = function(app) {

        /*app.get('/', function(req, res) {
            res.render('index');
        });*/

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
        app.get('/test', function(req, res){
            console.log('test');
            
            res.render('mailVerification', {success: false});
        });

        app.get('/verification', function(req, res){
            var token = req.query.email;
            
            mailVerification.verifyMail(token)
                            .then(function(data){
                                if(utils.isErrorObject(data)){
                                    return res.render('mailVerification', {success: false});
                                }
                                return res.render('mailVerification', {success: true});
                            }, function(error){
                                return res.render('mailVerification', {success: false});
                            });
            
        });

        app.get('/book', function(req, res){
            //var page = req.query.page;
            //var limit = req.query.limit;
            var page = 0;
            var limit = 9;
            bookService.getBooksList(page, limit)
                       .then(function(data){
                            return res.render('book', {books: JSON.stringify(data.data.books), count: data.data.count});
                       }, function(error){
                            return res.render('500', error);
                       });
        });
    };

})(module.exports);