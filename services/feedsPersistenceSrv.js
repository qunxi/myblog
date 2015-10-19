(function(feedsPersistenceSrv){
	var _ = require('lodash');
	var Q = require('q');
	var FeedCatelog = require('../models/feedCatelog.js');
	var Feed = require('../models/feeds.js');
	var FeedUserRelation = require('../models/feedUserRelation.js');

	feedsPersistenceSrv.saveFeedsResource = function(data){
		var catelog = data.catelog;
    	var feeds = data.feeds;

    	var deferred = Q.defer();

        if (catelog && feeds) {
        	
        	return FeedCatelog.findFeedCatelogByUrl(catelog.rsslink)
        			   .then(function(feedCatelog){
        			   		if(!!feedCatelog){
				  				console.log('the resource has existed');
				  				return saveFeedItems(feedCatelog, feeds);
				  			}

			        		return saveFeedCatelog(catelog, feeds);
        			   }, function(error){
        			   		return new Error('findFeedCatelogByUrl failed');
        			   });       	
        }else{
        	console.log('catelog and feeds data not correct');
        	deferred.reject(new Error('catelog and feeds data not correct'));
        	return deferred.promise;
        }

	};

	feedsPersistenceSrv.updatedFeedCatelogList = function(userid, catelog){
		var feedUserRelation = new FeedUserRelation({
			userId: userid,
			catelogId: catelog._id
		});	

		FeedUserRelation.findOne({userId: userid, catelogId: catelog._id})
			 .then(function(catelogRelation){
			 	if(!catelogRelation){
			 		return feedUserRelation.save()
								.then(function(data){
									return data;
								}, function(error){
									console.log(error);
									return new Error('feed and user relationship updated failed');
								});
			 	}
			 	return new Error('you have add this catelog');
			}, function(error){
				console.log('feed user relation find failed');
				return error;
			});
	};



	function saveFeedCatelog(feedCatelog, feeds){
		
		var newFeedCatelog = new FeedCatelog({
                website: feedCatelog.website,
                link: feedCatelog.rsslink, //self
                title: feedCatelog.title,
                subtitle: feedCatelog.subtitle,
                author: feedCatelog.author,
                updated: feedCatelog.updated,
               	classify: '',
               	tags: ''
            });
		
        return newFeedCatelog.save()
	            	.then(function(catelog){
	            		return saveFeedItems(catelog, feeds);
	            	}, 
	            	function(err){
	            		console.log(err.message);
	            		return new Error('catelog save happened error in database');
	            	});
	}
	
	function saveFeedItems(catelog, feeds){
		
		return getUpdatedFeedItems(catelog, feeds)
					.then(function(newFeeds){

						return  Feed.collection
					  				.insert(newFeeds)
						  			.then(function(data){
						  				return catelog;
						  			}, function(err){
						  				console.log(err.message);
						  				return new Error('feeds bulk insert failed in database');
						  			});

				  		}, function(error){
				  			return error;
				  	});	  		
	}

	function getUpdatedFeedItems(catelog, feeds){

		return	Feed.findLatestFeedItem(catelog._id)
			.then(function(latestFeed){

				if (!!latestFeed) {
            		return _.chain(feeds)
                    	.filter(function(n) {
                        	return n.updated > latestFeed.updated;
                     	})
                    	.map(function(n) {
                          	n.catelogId = catelog._id;
                          	return n;
                     	})
                    .value();
        		} 
       
        		return _.chain(feeds)
	                	.map(function(n) {
	                   		n.catelogId = catelog._id;
	                   		return n;
	                	})
	                	.value();

			}, function(error){
				return new Error('get latest Feeds if failed, the catelogId is ' + catelog._id);
			});       
	}

})(module.exports);