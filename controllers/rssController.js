(function(rssController){

	'use strict';
	 
	 rssController.init = function(app) {

	 	var feedsRequest = require('../services/feedsRequestSrv.js');
	 	var feedsPersistence = require('../services/feedsPersistenceSrv.js');

	  	app.post('/api/rss', function(req, res){
	  			var rssParams = req.body;
	  			var userId = rssParams.userId;
	  			feedsRequest.requestFeedsResource(rssParams.link)
								   .then(function(data){
			  							feedsPersistence.saveFeedsResource(data)
			  								.then(function(catelog){
			  									console.log('api/rss', catelog);
			  									return feedsPersistence.updatedFeedCatelogList(userId, catelog);
			  								}, function(error){
			  									console.log('api/rss', error);
			  									return error;
			  								});
			  						}, function(err){
			  							return err;
			  						})
			  					   .then(function(){
			  					   		successCallback(res);
			  					   	}, 
			  					   	function(err){failedCallback(res, err);
			  					   	});

	  		});

		app.get('/api/rss/catelog', function(req, res){
			var userId = req.body.userId;
			console.log(userId);
			if(!!userId){
				feedsRequest.requestFeedCatelogs(userId)
					.then(function(data){
						successCallback(res, data);
					}, function(err){
						console.log(err);
						failedCallback(res, err);
					});
				return;	
			}

			return res.status(203).send({
	  				error: 'you don\'t have authorization, please login'
            });
		});


		app.get('/api/rss/feeds', function(req, res){
			var catelogId = req.body.catelogId;

			if(!!catelogId){
				feedsRequest.requestFeedsByCatelogId(catelogId)
						.then(function(data){
							successCallback(res, data);
						}, 
						function(err){
							console.log(err);
							failedCallback(res, err);
						});
				return;
			}

			return failedCallback(res, {error: 'please specific the catelogs'});

		});

		//private
	  	function failedCallback(res, error){
	  		return res.status(400).send({
	  				error: error.message
                });
	  	}

	  	function successCallback(res, data){
	  		return res.status(200).send(data);
	  	}

	  };

})(module.exports);