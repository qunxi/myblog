(function(postService) {
    'use strict';

    //var rssRequest = require('./rssRequestSrv.js');
    var Q = require('q');
    var _ = require('lodash');
    var utils = require('./utilsSrv.js');

    var RssItem = require('../models/rssItem.js');
    var PostFavorite = require('../models/postFavorite.js');
    var PostComment = require('../models/postComment.js');
    var rssCatelog = require('../models/rssCatelog.js');

    postService.getPostsList = getPostsList;
    postService.getPostByPostId = getPostByPostId;
    postService.thumbUp = thumbUp;
    postService.getPostComments = getPostComments;
    postService.addFavor = addFavor;
    postService.addComment = addComment;
    postService.getFavorListByUserId = getFavorListByUserId;


    var  DESCRIPTION_COUNT = 480;

    function getFavorListByUserId(userId, page, limit) {
        var deferred = Q.defer();
        //console.log(userId, limit, page);
        if (!userId || !limit) {
            deferred.reject({
                status: 400,
                error: 'you do not provider post Id in request'
            });
            return deferred.promise;
        }

        return PostFavorite.getFavoritesByUserId(userId, page, limit)
            .then(function(data) {
                if (utils.isErrorObject(data)) {
                    deferred.reject({
                        status: 500,
                        error: data
                    });
                    return deferred.promise;
                }
               
                var ids = _.map(data, function(item){
                    return {_id: item.postId};
                });
                
                return RssItem.getRssItemsByIds(ids)
                    .then(function(posts) {
                        
                        if (utils.isErrorObject(posts)) {
                            deferred.reject({
                                status: 500,
                                error: posts
                            });
                            return deferred.promise;
                        }

                        var summary = _.map(posts, function(post){
                            return {
                                postId: post._id,
                                title: post.title,
                                url: '/post?id=' + post._id + '&userId=' + userId,//post.link,
                                description: utils.cutString(post.content, DESCRIPTION_COUNT)
                            };
                        });

                        return {
                            status: 200,
                            data: summary
                        };
                    });
            });
    }


    function thumbUp(postId) {
        var deferred = Q.defer();
        if (!postId) {
            deferred.reject({
                status: 400,
                error: 'you do not provider post Id in request'
            });
            return deferred.promise;
        }
        
        return thumbUpForPost(postId)
            .then(function(post) {
                if (!post) {
                    deferred.reject({
                        status: 404,
                        error: 'do not find any match post'
                    });
                    return deferred.promise;
                }
                if (utils.isErrorObject(post)) {
                    deferred.reject({
                        status: 500,
                        error: post
                    });
                    return deferred.promise;
                }
                return {
                    status: 200,
                    data: post
                };
            });
    }

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
                    deferred.reject({
                        status: 404,
                        error: 'do not find any match post'
                    });
                    return deferred.promise;
                }
                if (utils.isErrorObject(post)) {
                    deferred.reject({
                        status: 500,
                        error: post
                    });
                    return deferred.promise;
                }
                //post.src = src;
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
                    deferred.reject({
                        status: 500,
                        error: post
                    });
                    return deferred.promise;
                }
                return {
                    status: 200,
                    data: data
                };
            });
    }

    function getPostComments(postId) {
        var deferred = Q.defer();

        if (!postId) {
            deferred.reject({
                status: 400,
                error: 'post id is empty'
            });
            return deferred.promise;
        }
        return PostComment.getPostCommentsById(postId)
            .then(function(data) {
                if (utils.isErrorObject(data)) {
                    deferred.reject({
                        status: 500,
                        error: post
                    });
                    return deferred.promise;
                }
                return {
                    status: 200,
                    data: data
                };
            });
    }
    
    function addFavor(postId, userId) {
        var deferred = Q.defer();

        if (!postId || !userId) {
            deferred.reject({
                status: 400,
                error: 'user id or post id is empty'
            });

            return deferred.promise;
        }

        return addFavorForPost(postId, userId)
            .then(function(data) {
                if (utils.isErrorObject(data)) {
                    deferred.reject({
                        status: 500,
                        error: post
                    });
                    return deferred.promise;
                }
                return {
                    status: 200,
                    data: data
                };
            });
    }


    function addComment(postId, userId, comment, user) {
        var deferred = Q.defer();

        if (!postId || !userId || !comment || comment.length > 250) {
            deferred.reject({
                status: 400,
                error: 'your comments not according to rules'
            });

            return deferred.promise;
        }

        return addCommentForPost(postId, userId, comment, user)
            .then(function(data) {
                if (utils.isErrorObject(data)) {
                    deferred.reject({
                        status: 500,
                        error: post
                    });
                    return deferred.promise;
                }
                return {
                    status: 200,
                    data: data
                };
            });
    }

    //private implement
    function addFavorForPost(postId, userId) {
        var postFavorite = new PostFavorite({
            userId: userId,
            postId: postId
        });
        return PostFavorite.isFavoriteExist(userId, postId)
            .then(function(data) {
                if (utils.isErrorObject(data)) {
                    return data;
                }
                if(!data){
                    return postFavorite.save()
                        .then(function(data) {
                            return data;
                        }, function(error) {
                            return {
                                error: 'add favorite failed'
                            };
                        });
                }
                else{
                    return data.remove();
                }
            });
    }

    function addCommentForPost(postId, userId, comment, username) {
        var postComment = new PostComment({
            userId: userId,
            postId: postId,
            date: new Date(),
            user: username,
            comment: comment
        });

        return PostComment.isCommentExist(userId, postId, comment)
            .then(function(data) {
                if (utils.isErrorObject(data)) {
                    return data;
                }
                return postComment.save()
                    .then(function(data) {
                        return data;
                    }, function(error) {
                        return error;
                    });
            });
    }

    function thumbUpForPost(postId) {
        return RssItem.getRssItemById(postId)
            .then(function(post) {
                if (!post || utils.isErrorObject(post)) {
                    return post;
                }

                if (!post.thumbUp) {
                    post.thumbUp = 1;
                } else {
                    post.thumbUp++;
                }

                return post.save()
                    .then(function(data) {
                        return data;
                    }, function(error) {
                        return {
                            error: 'update thumbup failed'
                        };
                    });
            });
    }

    function getPostById(postId, userId) {
        return RssItem.getRssItemById(postId)
            .then(function(post) {
                if (!post || utils.isErrorObject(post)) {
                    return post;
                }

            return rssCatelog.getCatelogById(post.catelogId)
                .then(function(catelog) {
                    if (!catelog || utils.isErrorObject(catelog)) {
                        return catelog;
                    }

                    return PostFavorite.isFavoriteExist(userId, postId)
                        .then(function(data) {
                            if (!data || utils.isErrorObject(data)) {
                                post.favor = false;
                                post.src = catelog.title;
                                return post;
                            }
                            post.favor = true;
                            post.src = catelog.title;
                            return post;
                        });

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
                    /*if (!n.description) {
                        n.description = n.content;
                    }*/
                    n.description = utils.cutString(n.content, DESCRIPTION_COUNT);
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