(function(rssRequestService) {
    'use strict';

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
                var description = item.summary;
                var updated = item.updated || item.published;
                var formated = formatContentAndDescription(rssContent, description, mainUrl);
                return {
                    title: item.title,
                    link: item.link.href,
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
                var description = item.description;
                var updated = item.pubdate || item.published;
                var formated = formatContentAndDescription(rssContent, description, data.link);
                
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
        if (!!content) {
           
            format = utils.formatImageUrl(content, link);
            content = format.content;
            images = format.images;
        } else if (!!description) {
           
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