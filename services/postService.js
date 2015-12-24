(function(postService) {
    'use strict';

    //var rssRequest = require('./rssRequestSrv.js');
    var Q = require('q');
    var _ = require('lodash');
    var utils = require('./utilsSrv.js');
    var RssItem = require('../models/rssItem.js');
    var PostFavorite = require('../models/postFavorite.js');

    postService.getPostsList = getPostsList;
    postService.getPostByPostId = getPostByPostId;

    function getPostByPostId(postId, userId, src) {
        var deferred = Q.defer();

        if (!postId) {
            deferred.reject({
                status: 400,
                error: 'you do not provider post Id in request'
            });
            return deferred.promise;
        }

        return getPostById(postId, userId)
            .then(function(post) {
                if (!post) {
                    return {
                        status: 404,
                        error: 'do not find any match post'
                    };
                }
                if (utils.isErrorObject(post)) {
                    return {
                        status: 500,
                        error: post
                    };
                }
                post.src = src;
                post.date = utils.formatDate(post.updated);
                return {
                    status: 200,
                    post: post
                };
            });
    }

    function getPostsList(page, limit) {
        var deferred = Q.defer();

        if (!limit) {
            deferred.reject({
                status: 400,
                error: 'you do not provider limit data for request'
            });
            return deferred.promise;
        }

        return requestPosts(page, limit)
            .then(function(data) {
                if (utils.isErrorObject(data)) {
                    return {
                        error: data,
                        status: 500
                    };
                }
                return {
                    status: 200,
                    data: data
                };
            });
    }

    //private implement
    function getPostById(postId, userId) {
        return RssItem.getRssItemById(postId)
            .then(function(post) {
                if (!post || utils.isErrorObject(post)) {
                    return post;
                }
                return PostFavorite.isFavoriteExist(userId, postId)
                    .then(function(data) {
                        if (!data || utils.isErrorObject(data)) {
                            post.favor = false;
                            return post;
                        }
                        post.favor = true;
                        return post;
                    });
            });
    }


    function requestPosts(page, limit) {
        return RssItem.getLatestRssItems(page, limit)
            .then(function(data) {
                if (utils.isErrorObject(data)) {
                    return data;
                }
                var items = _.chain(data).map(function(n) {
                    if (!n.description) {
                        n.description = n.content;
                    }
                    n.description = utils.cutString(n.description, 150);
                    var item = {
                        _id: n._id,
                        catelog: n.catelogId,
                        description: n.description,
                        images: _.take(n.images, 1),
                        link: n.link,
                        title: n.title,
                        updated: n.updated,
                        source: getPostSource(n.link)
                    };
                    return item;
                });
                
                return RssItem.getRssItemCount()
                    .then(function(count) {
                        if (utils.isErrorObject(count)) {
                            return count;
                        }

                        return {
                            count: count,
                            items: items.value()
                        };
                    });
            });
    }


    function getPostSource(link) {
        var items = link.split('.');
        var reg = /(http|https):\/\/([\w\W]+)\//ig;
        var result = reg.exec(link);
        if (result.length === 3) {
            var temp = result[2].split('.');
            if (temp.length >= 2) {
                return temp[temp.length - 2];
            }
        }
        return link;
    }


})(module.exports);