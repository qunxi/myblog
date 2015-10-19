(function(FeedCatelog){
	'use strict';

	var mongoose = require('mongoose');

	var model = 'FeedCatelog';

	var FeedCatelogSchema = new mongoose.Schema({
        website: String, //mainpage
        link: String, //self
        title: String,
        subtitle: String,
        author: String,
        updated: Date,
        classify: String,
        tags: String
    });

	FeedCatelogSchema.statics.findFeedCatelogByUrl = function(feed){
		return this.findOne({link: feed.link});
	};

	FeedCatelogSchema.statics.findCatelogsByUserIds = function(catelogIds){
		return this.find(catelogIds);
	};

	module.exports = mongoose.model(model, FeedCatelogSchema);

})(module.exports);