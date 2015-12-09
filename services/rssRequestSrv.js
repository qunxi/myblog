(function(rssRequestService) {
    'use strict';

    var _ = require('lodash');
    var FeedMe = require('feedme');
    var iconv = require('iconv-lite');

    var httpRequest = require('./httpRequestSrv');
    var RssCatelog = require('../models/rssCatelog.js');
    var RssItem = require('../models/rssItem.js');
    var RssUserMap = require('../models/rssUserMap.js');
    var utils = require('./utilsSrv.js');
    var PostComment = require('../models/postComment.js');
    var PostFavorite = require('../models/postFavorite.js');
    

    rssRequestService.requestRssResourceFrmNet = function(link) {

        return httpRequest.request(link)
            .then(function(data) {
                
                var xmlEncoding = /<\?xml[\w\W]*encoding="([\w\W]*)"\?>/gi;
                var result = xmlEncoding.exec(data.slice(0, 100));
                
                if(result && result.length === 2){
                    var encoding = result[1];

                    var buf= new Buffer(data,'binary');
                    data = iconv.decode(buf, encoding);
                }
                
                var parser = new FeedMe(true);
                parser.write(data);
                return normalizeFeeds(link, parser.done());
            }, function(error) {
                return {
                    error: error
                };
            });
    };

     /*data base query interface*/

    rssRequestService.requestRssCatelogsByUserId = function(id, page, limit) {
        return getCatelogsByUserId(id, page, limit);
    };

    rssRequestService.requestRssItemsByCatelogId = function(id, page, limit) {
        return getItemsByCatelogId(id, page, limit);
    };

    rssRequestService.requestRssItemContentByItemId = function(id){
        return getRssItemContentById(id);
    };

    rssRequestService.requestRssCatelogsByText = function(query){
        return getRssCatelogByText(query);
    };

    rssRequestService.requestAllRssPosts = function(page, limit){
        return getRssPosts(page, limit);
    };

    rssRequestService.requestRssItemById = function(postId, userId){
        return getRssItemById(postId, userId);
    };

    rssRequestService.getPostCommentsById = function(id){
        return getPostCommentsById(id);
    };

    //private section
    function getRssItemById(postId, userId){
        return RssItem.getRssItemById(postId)
                      .then(function(post){
                            if(utils.isErrorObject(post)){
                                return post;
                            }
                            return PostFavorite.isFavoriteExist(userId, postId)
                                        .then(function(data){
                                            if(!data || utils.isErrorObject(data)){
                                                post.favor = true;
                                                return post;
                                            }
                                            post.favor = false;
                                            return post;
                                        });
                      });
    }

    function getPostCommentsById(id){
        return  PostComment.getPostCommentsById(id);
                         /*.then(function(data){
                            if(utils.isErrorObject(data)){
                                return data;
                            }

                         });*/
    }

    function getRssPosts(page, limit){

        function getPostSource(link){
            var items = link.split('.');
            var reg = /(http|https):\/\/([\w\W]+)\//ig;
            var result = reg.exec(link);
            if(result.length === 3){
                var temp = result[2].split('.');
                if(temp.length >= 2){
                   return temp[temp.length - 2];
                }
            }
            return link;
        }

        return RssItem.getLatestRssItems(page, limit)
                      .then(function(data){
                            if(utils.isErrorObject(data)){
                                return data;
                            }
                            var items = _.chain(data).map(function(n){
                                if(!n.description){
                                    n.description = n.content;
                                }
                                n.description = utils.cutString(n.description, 50);
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
                                   .then(function(count){
                                         if(utils.isErrorObject(count)){
                                            return count;
                                         }
                                         return {
                                            count: count,
                                            items: items
                                         };
                                   });
                      });
    }

    function getItemsByCatelogId(catelogId, page, limit) {
        return RssItem.getRssItemsByCatelogId(catelogId, page, limit)
                      .then(function(data){
                        if(utils.isErrorObject(data)){
                            return data;
                        }

                        return data;
                      });
    }

    function getRssItemContentById(itemId){
        return RssItem.getRssItemContentById(itemId)
                      .then(function(data){
                        if(utils.isErrorObject(data)){
                            return {
                                error: error,
                                message: 'getRssItemContentById occurs a problem'
                            };
                        }
                        return data;
                      });
    }

    function getCatelogsByUserId(userId, page, limit) {
        return RssUserMap.getCatelogIdsByUserId(userId)
                         .then(function(data) {
                            if(utils.isErrorObject(data)){
                                return data;
                            }
                            var catelogIds = data;
                            if(!!catelogIds && catelogIds.length){
                                return RssCatelog.getCatelogsByIds(catelogIds, page, limit);
                            }
                            else{
                                /*return {
                                    error: userId + 'don\' have any Rss resource'
                                };*/
                                return [];
                            }
                        });
    }

    function getRssCatelogByText(query){
        return RssCatelog.getCatelogsByText(query)
                         .then(function(data){
                            return data;
                          });
    }


    function normalizeFeeds(selfLink, data) {
        if(!verfyRssData(data)){
            return {
                error: 'the data is not valid rss data'
            };
        }

        if (data.type === 'atom') {
            return generateAtomFeeds(data, selfLink);
        }
       
        return generateRSSFeeds(data, selfLink);
    }

    function verfyRssData(data){
        if(data.type === undefined && data.title === undefined){
            return false;
        }
        return true;
    }

    function generateAtomFeeds(data, url) {

        var mainUrl = _.chain(data.link)
            .find(function(n) {
                return n.rel !== 'self';
            })
            .value();

        mainUrl = !!mainUrl ? mainUrl.href : data.author.uri;

        var rssCatelog = {
            title: data.title,
            subtitle: !!data.subtitle ? data.subtitle : '',
            author: !!data.author ? data.author.name : '',
            website: mainUrl,
            rsslink: url,
            updated: new Date(Date.parse(data.updated))
        };

        var normalizeFeeds = _.chain(data.items)
            .map(function(item) {
                var rssContent = getItemContent(item);
                
                var description = item.summary;
                var updated = item.published || item.updated;
                var link = item.link instanceof Array && !!item.link.length ? item.link[0].href :item.link.href;
                
                var formated = formatContentAndDescription(rssContent, description, rssCatelog.website);
                return {
                    title: item.title,
                    link: link,
                    updated: new Date(Date.parse(updated)),
                    description: formated.description,
                    author: item.author,
                    content: formated.content,
                    images: formated.images
                };
            })
            .value();
        return {
            catelog: rssCatelog,
            items: normalizeFeeds
        };
    }

    function getItemContent(item){
        var rssContent = item.content || item['content:encoded'];
        return rssContent.text || rssContent;
    }

    function generateRSSFeeds(data, url) {
        var rssCatelog = {
            title: data.title,
            subtitle: !!data.description ? data.description : '',
            author: data.author,
            website: data.link,
            rsslink: url,
            updated: new Date(Date.parse(data.lastbuilddate))
        };

        var normalizeFeeds = _.chain(data.items)
            .map(function(item) {
            	var rssContent = getItemContent(item);
                var description = item.description;
                var updated = item.pubdate || item.published;

                /*if(!rssCatelog.website){
                    var index = item.link.indexOf('/', 7);
                    rssCatelog.website = item.link.substr(0, index + 1);
                }*/

                var formated = formatContentAndDescription(rssContent, description, rssCatelog.website);
                
                return {
                    title: item.title,
                    link: item.link,
                    updated: new Date(Date.parse(updated)),
                    author: '',
                    description: formated.description,
                    content: formated.content,
                    images: formated.images
                };
            })
            .value();
        return {
            catelog: rssCatelog,
            items: normalizeFeeds
        };
    }

    function formatContentAndDescription(content, description, link) {
       
        var images = [];
     
        var format;
        if (!!content && !!link) {
           
            format = utils.formatImageUrl(content, link);
            content = format.content;
            images = format.images;
        } else if (!!description && !!link) {
           
            format = utils.formatImageUrl(description, link);
            images = format.images;
            description = format.content;
        }

        return {
            content : content,
            description: description,
            images: images
        };
    }


})(module.exports);