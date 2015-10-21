(function(feedsRequestSrv) {
    'use strict';

    var Stream = require('stream');
    var _ = require('lodash');
    var FeedMe = require('feedme');

    var httpRequest = require('./httpRequestService');
    var FeedCatelog = require('../models/feedCatelog.js');
    var Feed = require('../models/feeds.js');
    var FeedUserRelation = require('../models/feedUserRelation.js');

    feedsRequestSrv.requestFeedsResource = function(link) {

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

    feedsRequestSrv.updateCatelogs = function(catelogId) {
        return getFeedItemsByCatelogId(catelogId);
    };

    feedsRequestSrv.requestFeedCatelogs = function(userId) {
        return getCatelogsByUserId(userId);
    };



    feedsRequestSrv.requestFeedsByCatelogId = function(catelogId) {
        return getFeedItemsByCatelogId(catelogId);
    };




    //private section
    function getFeedItemsByCatelogId(id) {
        return Feed.findItemsByCatelogId(id);
    }



    function getCatelogsByUserId(userId) {
        return FeedUserRelation.findCatelogIdsByUserId(userId)
            .then(function(catelogIds) {
                return FeedCatelog.findCatelogsByUserIds(catelogIds);
            }, function(error) {
                console.log(error);
                return error;
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

        var feedCatelog = {
            title: data.title,
            subtitle: !!data.subtitle ? data.subtitle : '',
            author: data.author.name,
            website: !!mainUrl ? mainUrl.href : '',
            rsslink: url,
            updated: data.updated
        };

        var normalizeFeeds = _.chain(data.items)
            .map(function(item) {
                return {
                    title: item.title,
                    link: item.link.href,
                    updated: item.updated,
                    author: item.author,
                    content: ''
                };
            })
            .value();
        return {
            catelog: feedCatelog,
            feeds: normalizeFeeds
        };
    }


    function generateRSSFeeds(data, url) {
        var feedCatelog = {
            title: data.title,
            subtitle: !!data.description ? data.description : '',
            author: data.author,
            website: data.link,
            rsslink: url,
            updated: data.lastBuildDate
        };

        var normalizeFeeds = _.chain(data.items)
            .map(function(item) {
            	console.log(item.link);
                return {
                    title: item.title,
                    link: item.link,
                    updated: item.pubdate,
                    author: '',
                    content: ''
                };
            })
            .value();
        return {
            catelog: feedCatelog,
            feeds: normalizeFeeds
        };
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