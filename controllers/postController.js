(function(postController) {

    var utils = require('../services/utilsSrv.js');
    var post = require('../services/postService.js');

    postController.init = function(app) {

        app.get('/post', function(req, res) {

            var id = req.query.id;
            var src = req.query.src;
            var userId = req.query.userId;

            return post.getPostByPostId(id, userId, src)
                .then(function(data) {
                    return res.render('post', {
                        post: data.post
                    });
                }, function(error) {
                    return utils.webErrorRender(res, error);
                });
        });

        app.get('/', function(req, res) {
            var page = 0;
            var limit = 12;
            return post.getPostsList(page, limit)
                .then(function(data) {
                    return res.render('index', {
                        posts: JSON.stringify(data.data.items),
                        count: data.data.count
                    });
                }, function(error) {
                    return utils.webErrorRender(res, error);
                });
        });

    };

})(module.exports);