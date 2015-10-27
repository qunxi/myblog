(function(rssPersistenceService) {
    var _ = require('lodash');
    var Q = require('q');

    var RssCatelog = require('../models/rssCatelog.js');
    var RssItem = require('../models/rssItem.js');
    var User = require('../models/user.js');
    var RssUserMap = require('../models/rssUserMap.js');

    var utils = require('./utilsSrv.js');

    rssPersistenceService.saveRssResource = function(catelog, items) {

         return RssCatelog.getRssCatelogByUrl(catelog.rsslink)
                          .then(function(data) {

                                if(utils.isErrorObject(data)){
                                    return data;
                                }

                                if (!!data) {
                                    console.log('getRssCatelogByUrl', 'the resource has existed');
                                    return saveRssItems(data, items);
                                }
                                return saveRssCatelog(catelog, items);
                            });


        /*var catelog = data.catelog;
        var items = data.items;

        var deferred = Q.defer();

        if (catelog && feeds) {

            return FeedCatelog.findFeedCatelogByUrl(catelog.rsslink)
                .then(function(feedCatelog) {

                    if (!!feedCatelog) {
                        console.log('the resource has existed');
                        return saveFeedItems(feedCatelog, feeds);
                    }

                    return saveFeedCatelog(catelog, feeds);
                }, function(error) {
                    return new Error('findFeedCatelogByUrl failed');
                });
        } else {
            console.log('catelog and feeds data not correct');
            deferred.reject(new Error('catelog and feeds data not correct'));
            return deferred.promise;
        }*/

    };

    rssPersistenceService.removeSelectedRssUserMap = function(userId, catelogIds){
        return removeSelectedRssUserMap(userId, catelogIds);
    };

    rssPersistenceService.updateUserCatelogList = function(userId, catelogId) {

        return updateUserCatelogList(userId, catelogId);
    };


    function updateUserCatelogList(userid, catelogid) {
        var rssUserMap = new RssUserMap({
            userId: userid,
            catelogId: catelogid
        });
        
        return rssUserMap.save()
                      .then(function(data){
                         console.log(data);
                         return data;
                      }, function(error){
                            console.log(error);
                            return {
                                error: error,
                                message: 'the relation mapping occurs problem'
                            };
                      });
    }

    function removeSelectedRssUserMap(userId, catelogIds){

        var rssUserMaps = _.map(catelogIds, function(n){
                                return {
                                    userId: userId,
                                    catelogId: n
                                };
                            });
        
        return RssUserMap.removeSeelctedRss(rssUserMaps)
                         .then(function(data){
                            return data;
                          });
    }

    function saveRssCatelog(catelog, items) {

        var rssCatelog = new RssCatelog({
            website: catelog.website,
            link: catelog.rsslink, //self
            title: catelog.title,
            subtitle: catelog.subtitle,
            author: catelog.author,
            updated: catelog.updated,
            classify: '',
            tags: ''
        });

        return rssCatelog
               .save()
               .then(function(catelog) {
                    return saveRssItems(catelog, items);
                },
                function(error) {
                   
                    return {
                        error: error,
                        message: 'save rssCatelog occurs a problem'
                    };
                   
                });
    }

    function saveRssItems(catelog, items) {

        return filterUpdatedItems(catelog, items)
            .then(function(data) {
                
                if(utils.isErrorObject(data)){
                    return data;
                }

                var updatedItems = data;
                
                if (!!updatedItems && updatedItems.length) {
                    
                    return RssItem.bulkSaveRssItems(updatedItems)
                             .then(function(ret){
                                if(!utils.isErrorObject(ret)){
                                    console.log(ret);
                                    return catelog;
                                }
                                return ret;
                             });
                }else{
                    return catelog;
                }
            });
    }

    function filterUpdatedItems(catelog, items) {
        
        return RssItem.getLatestRssItemByCatelogId(catelog._id)
            .then(function(data) {

                if(utils.isErrorObject(data)){
                    return data;
                }

                var latestRssItem = data;
                if (!!latestRssItem) {
                    return _.filter(items, function(n) {
                                if(n.updated > latestRssItem.updated){
                                    n.catelogId = catelog._id;
                                    return n;
                                }
                            });
                }

                return _.map(items, function(n) {
                             n.catelogId = catelog._id;
                            return n;
                        });
            });
    }

})(module.exports);