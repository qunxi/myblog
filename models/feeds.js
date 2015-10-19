(function(Feed){
	var mongoose = require('mongoose');
	var Types = mongoose.Schema.Types;
	var model = 'Feed';

	var FeedSchema = new mongoose.Schema({
        title: String,
        link: String,
        updated: Date,
        author: String,
        content: String,
        catelogId: Types.ObjectId
    });

	FeedSchema.statics.findLatestFeedItem = function(catelogId){
		return this.findOne({'catelogId': catelogId}).sort({updated: 'desc'});
	};

	FeedSchema.statics.findItemsByCatelogId = function(catelogId){
		return this.find({'catelogId': catelogId}).sort({updated: 'desc'});
	};

	module.exports = mongoose.model(model, FeedSchema);

})(module.exports);