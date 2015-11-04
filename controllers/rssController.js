(function(rssController) {

    'use strict';

    rssController.init = function(app) {

        var rssRequest = require('../services/rssRequestSrv.js');
        var rssPersistence = require('../services/rssPersistenceSrv.js');
        var authenticate = require('../services/authenticateSrv.js');
        var utils = require('../services/utilsSrv.js');
        var SECRET_KEY = app.get('SECRET_KEY');

        var logger = app.get('appLogger');
        app.post('/api/rss', function(req, res) {
            var rssParams = req.body;

            var token = rssParams.token;
            var link = rssParams.link;
          
            if(!link){
                logger.Error('link is empty in the /api/rss post');
                return failedResponse(res, {error: new Error('the link is not valid')});
            }

            rssRequest.requestRssResourceFrmNet(link)
                      .then(function(data){
                         
                          if(utils.isErrorObject(data)){
                            logger.Error(link + 'at requestRssResourceFrmNet happened an error #error# ' + data);
                            return  failedResponse(res, data);
                          }

                          if(!data.items){
                            logger.Error(link + 'don\'t have any catelog');
                            return failedResponse(res, {
                                error: 'dont have any catelog'
                            });
                          }

                          rssPersistence.saveRssResource(data.catelog, data.items)
                                        .then(function(data){
                                            if(utils.isErrorObject(data)){
                                                logger.Error('saveRssResource happened a problem catelog' + data.catelog + 'and items are' + data.items + ' #error# ' + data);
                                                return  failedResponse(res, data);
                                            }
                                            //update catelog and user relations
                                            var catelog = data;
                                            if(!!token){
                                               return  authenticate.verification(token, SECRET_KEY)
                                                        .then(function(user){
                                                                if(utils.isErrorObject(user)){
                                                                    logger.Error('token ' + token + 'verification failed #error# ' + user);
                                                                    return  authenticateFailed(res, user);
                                                                }
                                                               
                                                                return rssPersistence.updateUserCatelogList(user._id, catelog._id)
                                                                          .then(function(data){
                                                                                if(utils.isErrorObject(data)){
                                                                                    logger.Error('updateUserCatelogList failed in /api/rss the userid is ' + user._id + ' and catelog is' + catelog._id + ' #error# ' + data );
                                                                                    return  failedResponse(res, data);
                                                                                }
                                                                                return successResponse(res, catelog);
                                                                });
                                                        });
                                            }
                                            else{
                                                return successResponse(res, catelog);
                                            }
                                        });
                      });
        });

        app.get('/api/rss/catelog', function(req, res) {
        	//get must use query to get param
            var token = req.query.token;
            var page = req.query.page;
            var limit = !!req.query.limit ? req.query.limit : 10;
            if (!!token) {
               authenticate.verification(token, SECRET_KEY)
                           .then(function(user){
                                if(utils.isErrorObject(user)){
                                    logger.Error('token ' + token + 'verification failed #error# ' + user);
                                    return  authenticateFailed(res, user);
                                }
                                return rssRequest.requestRssCatelogsByUserId(user._id, page, limit)
                                                .then(function(catelogs) {
                                                    if(utils.isErrorObject(catelogs)){
                                                        logger.Error('requestRssCatelogsByUserId failed in /api/rss/catelog and the userid is ' + user._id + ' #error# ' + user);
                                                        return failedResponse(res, catelogs);
                                                    }
                                                    return successResponse(res, catelogs);
                                                });
                            });
            }
        });
         app.post('/api/rss/catelog', function(req, res) {
            var token = req.body.token;
            var catelogId = req.body.catelogId;
            if(!token || !catelogId){
                logger.Error('token and catelogid is empty token is ' + token + ' catelogId is ' + catelogId);
                return {
                    error: new Error('token or catelogId is empty'),
                    message: 'token or catelogId is empty'
                };
            }
           
            authenticate.verification(token, SECRET_KEY)
                        .then(function(user){
                            if(utils.isErrorObject(user)){
                                logger.Error('token ' + token + 'verification failed #error# ' + user);
                                return authenticateFailed(res, user);
                            }
                            return rssPersistence.updateUserCatelogList(user._id, catelogId)
                                                .then(function(data){
                                                    if(utils.isErrorObject(data)){
                                                        logger.Error('updateUserCatelogList failed in /api/rss/catelog the userid is ' + user._id + ' and catelog is' + catelog._id + ' #error# ' + data );                         
                                                        return failedResponse(res, data);
                                                    } 
                                                    return successResponse(res, data);
                                                });
                        });
        });


        app.get('/api/rss/itemContent', function(req, res){
            var id = req.query.itemId;
            
            if(!!id){
                return rssRequest.requestRssItemContentByItemId(id)
                            .then(function(content){
                                if(utils.isErrorObject(content)){
                                    logger.Error('requestRssItemContentByItemId failed when id is ' + id + ' the #error# ' + content);
                                    return failedResponse(res, content);
                                }

                                return successResponse(res, content);
                            });
            }
            logger.Error('you are not assign any content id for the /api/rss/itemContent');
            return failedResponse(res, {
                error: 'you not specific the item id'
            });

        });

        app.post('/api/rss/removeCatelogs', function(req, res){
            var token = req.body.token;
            var catelogIds = req.body.catelogIds;
           
            if(!!token && !!catelogIds){
                return authenticate.verification(token, SECRET_KEY)
                            .then(function(user){
                                if(utils.isErrorObject(user)){
                                    logger.Error('token ' + token + 'verification failed #error# ' + user);
                                    return authenticateFailed(res, user);
                                }

                                return rssPersistence.removeSelectedRssUserMap(user._id, catelogIds)
                                                    .then(function(data){
                                                        if(utils.isErrorObject(data)){
                                                            logger.Error('you didn\'t remove catelog successfully by token ' + token + ' and catelogIds is ' + catelogIds);
                                                            failedResponse(res, data);
                                                        }
                                                        
                                                        return successResponse(res, data);
                                                    });
                            });
            }

            logger.Error('you didn\'t setup any token or catelogs for the /api/rss/removeCatelogs ' + token + ' and catelogIds is ' + catelogIds);
            return failedResponse(res, {
                error: 'you didn\'t reomve catelog success'
            });

        });

        app.get('/api/rss/items', function(req, res) {
            var catelogId = req.query.catelogId;
            var page = req.query.page;
            var limit = !!req.query.limit ? req.query.limit : 5;
           
            if (!!catelogId) {
                return rssRequest.requestRssItemsByCatelogId(catelogId, page, limit)
                          .then(function(items) {

                            if (utils.isErrorObject(items)) {
                                logger.Error('requestRssItemsByCatelogId failed when catelogId is ' + catelogId + ' #error# ' + items);
                                return failedResponse(res, items);
                            }
                            return successResponse(res, items);
                        });
            }
            logger.Error('catelogId is empty in the /api/rss/items');
            return failedResponse(res, {
                error: 'you don\'t specific the catelog id'
            });

        });

        app.get('/api/rss/search', function(req, res) {
            var query = req.query.q;
            console.log(query);
            if (!!query) {
                return rssRequest.requestRssCatelogsByText(query)
                          .then(function(items) {
                            if (utils.isErrorObject(items)) {
                                logger.Error('requestRssCatelogsByText is failed in /api/rss/search #error# ' + items);
                                return failedResponse(res, items);
                            }
                            return successResponse(res, items);
                        });
            }
        });

        //private
        function failedResponse(res, data){
            return res.status(500).send({
                error: data
            });
        }

        function successResponse(res, data){
            return res.status(200).send(data);
        }

        function authenticateFailed(res, data){
            return res.status(203).send({
                error: 'don\'t get authorization'
            });
        }

    };

})(module.exports);