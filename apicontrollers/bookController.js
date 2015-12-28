(function(bookController) {

    bookController.init = function(app) {

        var utils = require('../services/utilsSrv.js');
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

                            return utils.httpResponse(res, book);
                       }, function(error){
                            logger.error('POST /api/book book' + book + ' has an error #' + error);
                            return utils.httpResponse(res, error);
                       });
        });

    };
})(module.exports);