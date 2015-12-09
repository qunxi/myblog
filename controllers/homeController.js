(function(homeController) {

    var mailVerification = require('../services/mailVerification.js');
    var utils = require('../services/utilsSrv.js');
    var rssRequest = require('../services/rssRequestSrv.js');

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

        app.get('/post', function(req, res){
            var id = req.query.id;
            var src = req.query.src;
            var userId = req.query.userId;
            if(!id){
                /*return utilsSrv.failedResponse(res, {
                    error: 'post id is empty'
                });*/
            }

            return rssRequest.requestRssItemById(id, userId)
                            .then(function(post){
                                if(utils.isErrorObject(post)){
                                    //logger.error('requestRssItemContentByItemId failed when id is ' + id + ' the #error# ' + content);
                                    //return failedResponse(res, post);
                                }
                                post.src = src;
                                post.date = utils.formatDate(post.updated);
                                
                                return res.render('post', {post: post});
                            });
        });
    };

})(module.exports);