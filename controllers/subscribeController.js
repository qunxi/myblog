(function(subscribeController) {

    var authSrv = require('../services/authenticateSrv.js');
    var utilsSrv = require('../services/utilsSrv.js');
    var rssPersistence = require('../services/rssPersistenceSrv.js');
    var rssRequest = require('../services/rssRequestSrv.js');

    subscribeController.init = function(app) {

        var logger = app.get('appLogger');

        app.post('/api/subscribe', function(req, res) {

            var link = req.body.link;

            if (!link) {
                logger.error('link is empty in the /api/rss post');
                return utilsSrv.failedResponse(res, {
                    error: 'rss link is null or invalid'
                });
            }

            return authSrv.verifyToken(req)
                    .then(function(data) {
                        return subscribe(link, data, res);
                    }, function(error) {
                        return utilsSrv.authenticateFailed(res, error);
                    });
        });


        app.get('/api/rssResource', function(req, res) {
            var page = req.query.page;
            var limit = req.query.limit;
            if (!!limit) {
                return authSrv.verifyToken(req)
                        .then(function(data) {
                            if (!!data._id) {
                                return getRssResource(data._id, page, limit, res);
                            }
                        }, function(error) {
                            return utilsSrv.authenticateFailed(res, error);
                        });
            }

            return utilsSrv.failedResponse(res, {
                error: 'you request is limit is 0'
            });
        });

        /*Implemention**/

        function getRssResource(userId, page, limit, res) {
            return rssRequest.requestRssCatelogsByUserId(userId, page, limit)
                .then(function(catelogs) {
                    if (utilsSrv.isErrorObject(catelogs)) {
                        logger.error('requestRssCatelogsByUserId failed in /api/rss/catelog and the userid is ' + userId + ' #error# ' + catelogs);
                        return utilsSrv.failedResponse(res, catelogs);
                    }
                    return utilsSrv.successResponse(res, catelogs);
                });
        }

        function subscribe(link, user, res) {
            //request rss resource
            return rssRequest.requestRssResourceFrmNet(link)
                    .then(function(data) {

                        if (utilsSrv.isErrorObject(data)) {
                            logger.error(link + 'at requestRssResourceFrmNet happened an error #error# ' + data);
                            return utilsSrv.failedResponse(res, data);
                        }

                        return saveRssResource(data.catelog, data.items, user, res);
                    });
        }

        function saveRssResource(catelog, items, user, res) {
            if (!catelog || !items) {
                logger.error('the catelog or items is null or undefined ever');
                return utilsSrv.failedResponse(res, {
                    error: 'the rss has any resource'
                });
            }

            //save RSS resourec to database
            return rssPersistence.saveRssResource(catelog, items)
                    .then(function(data) {
                        if (utilsSrv.isErrorObject(data)) {
                            logger.error('saveRssResource happened a problem catelog' + catelog + 'and items are' + items + ' #error# ' + data);
                            return utilsSrv.failedResponse(res, data);
                        }

                        return addRssUserRelation(data, user, res);
                    });
        }

        function addRssUserRelation(catelog, user, res) {
            if (!user._id || !catelog._id) {
                logger.error('addRssUserRelation failed becasue the userId or CatelogId not exist');
                return utilsSrv.failedResponse(res, {
                    error: 'user add rss resource not success'
                });
            }

            //upate user and rss resource relations
            return rssPersistence.updateUserCatelogList(user._id, catelog._id)
                    .then(function(userCatelog) {
                        if (utilsSrv.isErrorObject(userCatelog)) {
                            logger.error('updateUserCatelogList failed in /api/rss the userid is ' + user._id + ' and catelog is' + catelog._id);
                            return utilsSrv.failedResponse(res, userCatelog);
                        }
                        return utilsSrv.successResponse(res, catelog);
                    });
        }


    };
})(module.exports);