(function(rssRequestService) {
    'use strict';

    var Stream = require('stream');
    var _ = require('lodash');
    var FeedMe = require('feedme');

    var httpRequest = require('./httpRequestSrv');

    var RssCatelog = require('../models/rssCatelog.js');
    var RssItem = require('../models/rssItem.js');
    var RssUserMap = require('../models/rssUserMap.js');

    var utils = require('./utilsSrv.js');

    rssRequestService.requestRssResourceFrmNet = function(link) {

        return httpRequest.request(link)
            .then(function(data) {
                var parser = new FeedMe(true);
                parser.write(data);
                return normalizeFeeds(link, parser.done());
            }, function(error) {
                console.log(error);
                return error;
            });
    };

    /*feedsRequestSrv.updateCatelogs = function(catelogId) {
        return getFeedItemsByCatelogId(catelogId);
    };*/

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

    //private section
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
        console.log(itemId);
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
        if (data.type === 'atom') {
            return generateAtomFeeds(data, selfLink);
        }

        return generateRSSFeeds(data, selfLink);
    }

    function generateAtomFeeds(data, url) {

        var mainUrl = _.chain(data.link)
            .find(function(n) {
                return !n.rel;
            })
            .value();

        var rssCatelog = {
            title: data.title,
            subtitle: !!data.subtitle ? data.subtitle : '',
            author: data.author.name,
            website: !!mainUrl ? mainUrl.href : '',
            rsslink: url,
            updated:  new Date(Date.parse(data.updated))
        };

        var normalizeFeeds = _.chain(data.items)
            .map(function(item) {
                var rssContent = item.content || item['content:encoded'];
                return {
                    title: item.title,
                    link: item.link.href,
                    updated: new Date(Date.parse(item.updated)),
                    description: item.summary,
                    author: item.author,
                    content: rssContent,
                    images: extractImagsFrmContent(rssContent)
                };
            })
            .value();
        return {
            catelog: rssCatelog,
            items: normalizeFeeds
        };
    }


    function generateRSSFeeds(data, url) {
        var rssCatelog = {
            title: data.title,
            subtitle: !!data.description ? data.description : '',
            author: data.author,
            website: data.link,
            rsslink: url,
            updated: new Date(Date.parse(data.lastBuildDate))
        };

        var normalizeFeeds = _.chain(data.items)
            .map(function(item) {
            	var rssContent = item.content || item['content:encoded'];
                return {
                    title: item.title,
                    link: item.link,
                    updated: new Date(Date.parse(item.pubdate)),
                    author: '',
                    description: item.description,
                    content: rssContent,
                    images: extractImagsFrmContent(rssContent)
                };
            })
            .value();
        return {
            catelog: rssCatelog,
            items: normalizeFeeds
        };
    }

    function extractImagsFrmContent(content){
        var reg = /<img\s[^>]*?src\s*=\s*['"]([^'"]*?)['"][^>]*?>/gi;
        var imageUrls = [];

        while(reg.exec(content)){
            imageUrls.push((RegExp.$1));
        }

        return imageUrls;
    }


})(module.exports);