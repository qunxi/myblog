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

    rssRequestService.requestRssCatelogsByUserId = function(id) {
        return getCatelogsByUserId(id);
    };

    rssRequestService.requestRssItemsByCatelogId = function(id) {
        return getItemsByCatelogId(id);
    };

    rssRequestService.requestRssItemContentByItemId = function(id){
        return getRssItemContentById(id);
    };


    //private section
    function getItemsByCatelogId(catelogId) {
        return RssItem.getRssItemsByCatelogId(catelogId)
                      .then(function(data){
                        if(utils.isErrorObject(data)){
                            return data;
                        }

                        if(!data || !data.length){
                            return {
                                error: 'don\'t find any items of the catelog'
                            };
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

    function getCatelogsByUserId(userId) {
        return RssUserMap.getCatelogIdsByUserId(userId)
                         .then(function(data) {
                            if(utils.isErrorObject(data)){
                                return data;
                            }
                            var catelogIds = data;
                            if(!!catelogIds && catelogIds.length){
                                return RssCatelog.getCatelogsByIds(catelogIds);
                            }
                            else{
                                return {
                                    error: userId + 'don\' have any Rss resource'
                                };
                            }
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
            updated: data.updated
        };

        var normalizeFeeds = _.chain(data.items)
            .map(function(item) {
                var rssContent = item.content || item['content:encoded'];
                return {
                    title: item.title,
                    link: item.link.href,
                    updated: item.updated,
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
            updated: data.lastBuildDate
        };

        var normalizeFeeds = _.chain(data.items)
            .map(function(item) {
            	var rssContent = item.content || item['content:encoded'];
                return {
                    title: item.title,
                    link: item.link,
                    updated: item.pubdate,
                    author: '',
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








    /*rssParseService.requestRssResource = function(url, errCallback, successCallback){

		var parser = new FeedMe(true);

		//var rssJson = null;

		httpRequest.request(url, null, function(data){
			
			parser.write(data);
			
			normalizeFeeds(url, parser.done(), errCallback, successCallback);	
			
		});
	};

	rssParseService.updateUserRssList = function(userId, catelogId){
		var feedUserRelation = new FeedUserRelation({
			userId: userId,
			catelogId: catelogId
		});	

		feedUserRelation.save(function(err){

		});
	};

	function normalizeFeeds(url, data, errCallback, successCallback){
		var normalizeData = null;

		if(data.type === 'atom'){
			normalizeData = generateAtomFeeds(data, url);	
		}
		else{
			normalizeData = generateRSSFeeds(data, url);	
		}

		console.log(normalizeData);
		saveRssResource(normalizeData, errCallback, successCallback);
	}

    function saveRssResource(data, errCallback, successCallback) {
    	var catelog = data.catelog;
    	var feeds = data.feeds;

        if (catelog && feeds) {

            var newFeedCatelog = new FeedCatelog({
                url: catelog.url,
                link: catelog.link, //self
                title: catelog.title,
                subtitle: catelog.subtitle,
                author: catelog.author,
                updated: catelog.updated,
                //class: rssParams.class,
                //tags: rssParams.tags
            });

            newFeedCatelog.save(function(err) {
                if (err) {
                	errCallback();
                	return;
                }

                var feed = Feed.findLatestFeed(newFeedCatelog._id);

                //save feeds
                if (!!feed) {
                    feeds = _.chain(feeds)
                        .filter(function(n) {
                            return n.updated > feed.updated;
                        })
                        .map(function(n) {
                            n.catelogId = newFeedCatelog._id;
                        })
                        .value();
                } else {
                    feeds = _.chain(feeds)
                        .map(function(n) {
                            n.catelogId = newFeedCatelog._id;
                        })
                        .value();
                }

                Feed.collection.insert(feeds, function(err, docs) {
                    if (err) {
                        errCallback();
                        return;
                    }
                    successCallback();
                });

            });
        }
    }
*/






})(module.exports);