(function(subscribeController) {

    var authSrv = require('../services/authenticateSrv.js');
    var utilsSrv = require('../services/utilsSrv.js');
    var rssPersistence = require('../services/rssPersistenceSrv.js');
    var rssRequest = require('../services/rssRequestSrv.js');
    var postSrv = require('../services/postService.js');
    var Q = require('q');

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

            var token = authSrv.getTokenFrmHttpRequest(req);
            return authSrv.verifyToken(token)
                .then(function(user) {
                    subscribe(link, user)
                        .then(function(catelog) {
                            if (utilsSrv.isErrorObject(catelog)) {
                                return utilsSrv.failedResponse(res, catelog);
                            }
                            return utilsSrv.successResponse(res, catelog);
                        });
                }, function(error) {
                    return utilsSrv.authenticateFailed(res, error);
                });
        });

        app.get('/api/itemContent', function(req, res) {
            var id = req.query.id;
            if (!id) {
                return utilsSrv.failedResponse(res, {
                    error: 'post id is empty'
                });
            }

            return getRssContent(id, res)
                .then(function(content) {
                    if (utilsSrv.isErrorObject(content)) {
                        return utilsSrv.failedResponse(res, content);
                    }
                    return utilsSrv.successResponse(res, content);
                });
        });

        app.get('/api/rssItem', function(req, res) {
            var id = req.query.id;
            var src = req.query.src;
            if (!id) {
                return utilsSrv.failedResponse(res, {
                    error: 'rss item id is empty'
                });
            }

            return getRssItem(id).then(function(data) {
                if (utilsSrv.isErrorObject(data)) {
                    return utilsSrv.failedResponse(res, data);
                }
                return utilsSrv.successResponse(res, data);
            });
        });

        app.get('/api/rssResource', function(req, res) {
            var page = req.query.page;
            var limit = req.query.limit;
            if (!!limit) {
                var token = authSrv.getTokenFrmHttpRequest(req);
                return authSrv.verifyToken(token)
                    .then(function(user) {
                        if (!!user._id) {
                            return getRssResource(user._id, page, limit)
                                .then(function(rssResource) {
                                    if (utilsSrv.isErrorObject(rssResource)) {
                                        return utilsSrv.failedResponse(res, rssResource);
                                    }
                                    return utilsSrv.successResponse(res, rssResource);
                                });
                        }
                    }, function(error) {
                        return utilsSrv.authenticateFailed(res, error);
                    });
            }

            return utilsSrv.failedResponse(res, {
                error: 'you request is limit is 0'
            });
        });

        app.get('/api/rss/items', function(req, res) {
            var catelogId = req.query.catelogId;
            var page = req.query.page;
            var limit = !!req.query.limit ? req.query.limit : 5;

            return getRssItemsList(catelogId, page, limit)
                .then(function(data) {
                    return utilsSrv.successResponse(res, data);
                }, function(error) {
                    return utilsSrv.failedResponse(res, error);
                });
        });


        app.post('/api/rss/removeCatelogs', function(req, res) {
            var catelogIds = req.body.catelogIds;

            if (!catelogIds) {
                return utilsSrv.failedResponse(res, {
                    error: 'you dont selected any catelogs'
                });
            }
            var token = authSrv.getTokenFrmHttpRequest(req);
            return authSrv.verifyToken(token)
                .then(function(user) {
                    return removeSelectedRssUserMap(user._id, catelogIds)
                        .then(function(data) {
                            if (utilsSrv.isErrorObject(data)) {
                                return utilsSrv.failedResponse(res, data);
                            }
                            return utilsSrv.successResponse(res, data);
                        });
                }, function(error) {
                    return utilsSrv.authenticateFailed(res, error);
                });
        });



        /*Implemention**/
        function removeSelectedRssUserMap(userId, catelogids) {
            if (userId || catelogids) {

            }

            return rssPersistence.removeSelectedRssUserMap(userId, catelogids)
                .then(function(data) {
                    if (utilsSrv.isErrorObject(data)) {
                        logger.error('you didn\'t remove catelog successfully by token ' + token + ' and catelogIds is ' + catelogIds);
                    }
                    return data;
                });
        }

        function getRssItemsList(catelogId, page, limit) {

            var deferred = Q.defer();

            if (!catelogId) {
                logger.error('catelogId is empty in the /api/rss/items');

                deferred.reject({
                    error: 'the catelog id is empty'
                });

                return deferred.promise;
            }

            return rssRequest.requestRssItemsByCatelogId(catelogId, page, limit)
                .then(function(items) {
                    if (utilsSrv.isErrorObject(items)) {
                        logger.error('requestRssItemsByCatelogId failed when catelogId is ' + catelogId + ' #error# ' + items);
                        deferred.reject(items);
                        return deferred.promise;
                    }
                    return itmes;
                });
        }


        function getRssItem(id) {
            return rssRequest.requestRssItemById(id)
                .then(function(post) {
                    if (utilsSrv.isErrorObject(post)) {
                        return post;
                    }
                    post.src = src;
                    post.date = utilsSrv.formatDate(post.updated);
                    return post;
                });
        }

        function getRssContent(id) {
            return rssRequest.requestRssItemContentByItemId(id)
                .then(function(content) {
                    if (utilsSrv.isErrorObject(content)) {
                        logger.error('requestRssItemContentByItemId failed when id is ' + id + ' the #error# ' + content);
                        return content;
                    }
                    return content;
                });
        }


        function getRssResource(userId, page, limit) {
            return rssRequest.requestRssCatelogsByUserId(userId, page, limit)
                .then(function(catelogs) {
                    if (utilsSrv.isErrorObject(catelogs)) {
                        logger.error('requestRssCatelogsByUserId failed in /api/rss/catelog and the userid is ' + userId + ' #error# ' + catelogs);
                        return catelogs;
                    }
                    return catelogs;
                });
        }

        function subscribe(link, user) {
            //request rss resource
            return rssRequest.requestRssResourceFrmNet(link)
                .then(function(data) {

                    if (utilsSrv.isErrorObject(data)) {
                        logger.error(link + 'at requestRssResourceFrmNet happened an error #error# ' + data);
                        return data;
                    }
                    return saveRssResource(data.catelog, data.items, user);
                });
        }


        //////////////////////////////////////////////
        function saveRssResource(catelog, items, user) {
            if (!catelog || !items) {
                logger.error('the catelog or items is null or undefined ever');
                return {
                    error: 'the rss has any resource'
                };
            }

            //save RSS resourec to database
            return rssPersistence.saveRssResource(catelog, items)
                .then(function(data) {
                    if (utilsSrv.isErrorObject(data)) {
                        logger.error('saveRssResource happened a problem catelog' + catelog + 'and items are' + items + ' #error# ' + data);
                        return data;
                    }

                    return addRssUserRelation(data, user);
                });
        }

        function addRssUserRelation(catelog, user) {
            if (!user._id || !catelog._id) {
                logger.error('addRssUserRelation failed becasue the userId or CatelogId not exist');
                return {
                    error: 'user add rss resource not success'
                };
            }

            //upate user and rss resource relations
            return rssPersistence.updateUserCatelogList(user._id, catelog._id)
                .then(function(userCatelog) {
                    if (utilsSrv.isErrorObject(userCatelog)) {
                        logger.error('updateUserCatelogList failed in /api/rss the userid is ' + user._id + ' and catelog is' + catelog._id);
                        return userCatelog;
                    }
                    return catelog;
                });
        }


    };
})(module.exports);