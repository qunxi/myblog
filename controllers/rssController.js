(function(rssController) {

    'use strict';

    rssController.init = function(app) {

        var rssRequest = require('../services/rssRequestSrv.js');
        var rssPersistence = require('../services/rssPersistenceSrv.js');
        var authenticate = require('../services/authenticateSrv.js');
        var utils = require('../services/utilsSrv.js');
        var SECRET_KEY = app.get('SECRET_KEY');

        app.post('/api/rss', function(req, res) {
            var rssParams = req.body;

            var token = rssParams.token;
            var link = rssParams.link;
          
            if(!link){
                return failedResponse(res, {error: new Error('the link is not valid')});
            }

            rssRequest.requestRssResourceFrmNet(link)
                      .then(function(data){
                         
                          if(utils.isErrorObject(data)){
                            return  failedResponse(res, data);
                          }

                          if(!data.items){
                            return failedResponse(res, {
                                error: 'dont have any catelog'
                            });
                          }

                          rssPersistence.saveRssResource(data.catelog, data.items)
                                        .then(function(data){
                                            if(utils.isErrorObject(data)){
                                                return  failedResponse(res, data);
                                            }
                                            //update catelog and user relations
                                            var catelog = data;
                                            if(!!token){
                                               return  authenticate.verification(token, SECRET_KEY)
                                                        .then(function(user){
                                                                if(utils.isErrorObject(user)){
                                                                    return  authenticateFailed(res, user);
                                                                }
                                                               
                                                                return rssPersistence.updateUserCatelogList(user._id, catelog._id)
                                                                          .then(function(data){
                                                                                //console.log(data);
                                                                                if(utils.isErrorObject(data)){
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
                                    return  authenticateFailed(res, user);
                                }
                                return rssRequest.requestRssCatelogsByUserId(user._id, page, limit)
                                                .then(function(catelogs) {
                                                    if(utils.isErrorObject(catelogs)){
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
                return {
                    error: new Error('token or catelogId is empty'),
                    message: 'token or catelogId is empty'
                };
            }
            console.log('/api/rss/catelog');
            authenticate.verification(token, SECRET_KEY)
                        .then(function(user){
                            if(utils.isErrorObject(user)){
                                return authenticateFailed(res, user);
                            }
                            return rssPersistence.updateUserCatelogList(user._id, catelogId)
                                                .then(function(data){
                                                    if(utils.isErrorObject(data)){
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
                                    return failedResponse(res, content);
                                }

                                return successResponse(res, content);
                            });
            }

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
                                    return authenticateFailed(res, user);
                                }

                                return rssPersistence.removeSelectedRssUserMap(user._id, catelogIds)
                                                    .then(function(data){
                                                        if(utils.isErrorObject(data)){
                                                            failedResponse(res, data);
                                                        }
                                                        
                                                        return successResponse(res, data);
                                                    });
                            });
            }

            return failedResponse(res, {
                error: 'you didn\'t reomve catelog success'
            });

        });

        app.get('/api/rss/items', function(req, res) {
            var catelogId = req.query.catelogId;
            var page = req.query.page;
            var limit = !!req.query.limit ? req.query.limit : 5;
            //console.log(catelogId);
            if (!!catelogId) {
                return rssRequest.requestRssItemsByCatelogId(catelogId, page, limit)
                          .then(function(items) {

                            if (utils.isErrorObject(items)) {
                                return failedResponse(res, items);
                            }
                            return successResponse(res, items);
                        });
            }

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