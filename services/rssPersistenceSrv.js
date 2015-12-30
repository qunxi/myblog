(function(rssPersistenceService) {
    var _ = require('lodash');

    var RssCatelog = require('../models/rssCatelog.js');
    var RssItem = require('../models/rssItem.js');
    var User = require('../models/user.js');
    var RssUserMap = require('../models/rssUserMap.js');
    var PostComment = require('../models/postComment.js');
    var PostFavorite = require('../models/postFavorite.js');

    var utils = require('./utilsSrv.js');

    var httpRequest = require('./httpRequestSrv.js');
    var htmlParseSrv = require('./htmlParseSrv.js');

    function getWebSiteFavorIcon(website) {
        var iconAddress = website + '/favicon.ico';

        return httpRequest.request(iconAddress)
            .then(function(data) {
                return iconAddress;
            }, function(error) {
                return httpRequest.request(website)
                    .then(function(data) {
                        return htmlParseSrv.getFavIconSrc(data);
                    }, function(error) {
                        return '';
                    });
            });
    }

    rssPersistenceService.saveRssResource = function(catelog, items) {

        return RssCatelog.getRssCatelogByUrl(catelog.rsslink)
            .then(function(data) {

                if (utils.isErrorObject(data)) {
                    return data;
                }

                if (!data) {
                    return getWebSiteFavorIcon(catelog.website)
                        .then(function(icon) {
                            catelog.icon = icon;
                            return saveRssCatelog(catelog, items);
                        });
                } else {
                    return data;
                }
                /*if (!!data) {
                    console.log('getRssCatelogByUrl', 'the resource has existed');
                    return saveRssItems(data, items);
                }*/
                //return saveRssCatelog(catelog, items);
            });
    };

    rssPersistenceService.addCommentForPost = function(postId, userId, comment, username){
        return addCommentForPost(postId, userId, comment, username);
    };

    rssPersistenceService.saveRssItems = function(catelog, items) {
        return saveRssItems(catelog, items);
    };

    rssPersistenceService.removeSelectedRssUserMap = function(userId, catelogIds) {
        return removeSelectedRssUserMap(userId, catelogIds);
    };

    rssPersistenceService.updateUserCatelogList = function(userId, catelogId) {

        return updateUserCatelogList(userId, catelogId);
    };

    rssPersistenceService.addFavorForPost = function(postId, userId) {
        return addFavorForPost(postId, userId);
    };

    function updateUserCatelogList(userid, catelogid) {
        var rssUserMap = new RssUserMap({
            userId: userid,
            catelogId: catelogid
        });

        return rssUserMap.save()
            .then(function(data) {
                return data;
            }, function(error) {
                return {
                    error: error,
                    message: 'the relation mapping occurs problem'
                };
            });
    }

    function removeSelectedRssUserMap(userId, catelogIds) {

        var rssUserMaps = _.map(catelogIds, function(n) {
            return {
                userId: userId,
                catelogId: n
            };
        });

        return RssUserMap.removeSeelctedRss(rssUserMaps)
            .then(function(data) {
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
            icon: catelog.icon,
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

                if (utils.isErrorObject(data)) {
                    return data;
                }

                var updatedItems = data;

                if (!!updatedItems && updatedItems.length) {

                    return RssItem.bulkSaveRssItems(updatedItems)
                        .then(function(ret) {
                            if (!utils.isErrorObject(ret)) {
                                return catelog;
                            }
                            return ret;
                        });
                } else {
                    return catelog;
                }
            });
    }

    function filterUpdatedItems(catelog, items) {

        return RssItem.getLatestRssItemByCatelogId(catelog._id)
            .then(function(data) {

                if (utils.isErrorObject(data)) {
                    return data;
                }

                var latestRssItem = data;
                if (!!latestRssItem) {
                    return _.filter(items, function(n) {
                        if (n.updated > latestRssItem.updated) {
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