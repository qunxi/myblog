(function(postController) {

    postController.init = function(app) {

        var authSrv = require('../services/authenticateSrv.js');
        var utilsSrv = require('../services/utilsSrv.js');
        var postSrv = require('../services/postService.js');

        app.post('/api/post/favorite', function(req, res) {
            var postId = req.body.postId;
            var token = authSrv.getTokenFrmHttpRequest(req);
            return authSrv.verifyToken(token)
                .then(function(user) {
                    return postSrv.addFavor(postId, user._id)
                        .then(function(data) {
                            utilsSrv.httpResponse(res, data);
                        }, function(error) {
                            utilsSrv.httpResponse(res, data);
                        });
                }, function(error) {
                    return utilsSrv.authenticateFailed(res, error);
                });
        });

        app.get('/api/post/comment', function(req, res) {
            var postId = req.query.postId;
            return postSrv.getPostComments(postId)
                .then(function(data) {
                    return utilsSrv.httpResponse(res, data);
                }, function(error) {
                    return utilsSrv.httpResponse(res, dta);
                });
        });

        app.post('/api/post/comment', function(req, res) {
            var postId = req.body.postId;
            var comment = req.body.comment;
            var token = authSrv.getTokenFrmHttpRequest(req);
            return authSrv.verifyToken(token)
                .then(function(user) {
                    var username = user.username ? user.username : user.email.split('@')[0];
                    return postSrv.addComment(postId, user._id, comment, username)
                        .then(function(data) {
                            return utilsSrv.httpResponse(res, data);
                        }, function(error) {
                            return utilsSrv.httpResponse(res, error);
                        });
                }, function(error) {
                    return utilsSrv.authenticateFailed(res, error);
                });
        });

        app.post('/api/post/thumbup', function(req, res) {
            var id = req.body.postId;
            return postSrv.thumbUp(id)
                .then(function(data) {
                    
                    return utilsSrv.httpResponse(res, data);
                }, function(error) {
                    console.log(data);
                    return utilsSrv.httpResponse(res, error);
                });
        });


        app.get('/api/post/favorposts', function(req, res) {
            var page = req.query.page;
            var limit = req.query.limit;

            var token = authSrv.getTokenFrmHttpRequest(req);
            return authSrv.verifyToken(token)
                .then(function(user) {
                    return postSrv.getFavorListByUserId(user._id, page, limit)
                        .then(function(data) {
                            return utilsSrv.httpResponse(res, data);
                        }, function(error) {
                            return utilsSrv.httpResponse(res, error);
                        });
                }, function(error) {
                    return utilsSrv.authenticateFailed(res, error);
                });
        });


        /*var utils = require('../services/utilsSrv.js');
        var bookSrv = require('../services/bookService.js');
        var authSrv = require('../services/authenticateSrv.js');
        var logger = app.get('appLogger');

        app.get('/api/book', function(req, res) {
            var page = req.query.page;
            var limit = req.query.limit;
            bookSrv.getBooksList(page, limit)
                       .then(function(data){
                           return utils.httpResponse(res, data);
                       }, function(error){
                           logger.error('GET /api/book?page=' + page + '&limit=' + limit +' has an error #' + error);
                           return utils.httpResponse(res, error);
                       });
        });

        app.post('/api/book', function(req, res) {
            var book = req.body.book;
            var token = authSrv.getTokenFrmHttpRequest(req);
            bookSrv.submitBook(book, token)
                       .then(function(book){
                            //console.log(book);
                            return utils.httpResponse(res, book);
                       }, function(error){
                            logger.error('POST /api/book book' + book + ' has an error #' + error);
                            return utils.httpResponse(res, error);
                       });
        });*/

    };
})(module.exports);