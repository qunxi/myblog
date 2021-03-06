(function(homeController) {

    var mailVerification = require('../services/mailVerification.js');
    var utils = require('../services/utilsSrv.js');
    var rssRequest = require('../services/rssRequestSrv.js');
    var bookService = require('../services/bookService.js');
    var crawlService = require('../services/crawlService.js');

    var elektaService = require('../services/elektaService.js');

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

        app.get('/test', function(req, res){
            var link = 'http://www.douban.com/j/tag/items?';
            link = link + 'start=9&limit=6&topic_id=62155&topic_name=%E7%BC%96%E7%A8%8B&mod=book';
            crawlService.crawlBooksFromDouban(link);
           
            //res.render('doubanBook/book', {});
        });
      
        app.get('/doubanBook', function(req, res){
            var page = 0;
            var limit = 9;
            bookService.getDoubanBooksList(page, limit)
                       .then(function(data){
                            return res.render('doubanBook/book', {books: JSON.stringify(data.data.books), count: data.data.count});
                       }, function(error){
                            return res.render('500', error);
                       });
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

        app.get('/welcome', function(req, res){
        	return res.render('elekta/welcome');
        });

        app.get('/interview', function(req, res){
            var id = req.query.id;
            elektaService.verification(id)
                .then(function(data){
                    if(!!data){
                        console.log(data);
                        return res.render('elekta/interview', data);
                    }
                    return res.render('elekta/welcome', {});
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