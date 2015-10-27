(function(RssItem) {
    var mongoose = require('mongoose');
    var Types = mongoose.Schema.Types;
    var model = 'RssItem';

    var RssItemSchema = new mongoose.Schema({
        title: String,
        link: String,
        updated: Date,
        author: String,
        content: String,
        images: Array,
        catelogId: Types.ObjectId
    });

    RssItemSchema.statics.bulkSaveRssItems = function(items){
        console.log(items);
        this.collection
            .insert(items)
            .then(function(data) {
                return {
                    success: true
                };
            }, function(error) {
                console.log(err.message);
                return {
                    error: error,
                    message: 'bulk save rss items occurs a problem'
                };
            });
    };

    RssItemSchema.statics.getLatestRssItemByCatelogId = function(catelogId) {
        return this.findOne({
                        'catelogId': catelogId
                    }).sort({
                        'updated': 'desc'
                    })
                    .then(function(item){
                        return item;
                    }, function(error){
                         return {
                            message: 'data base query occur a problem when you query the latest item of catelog(' + catelogId + ')',
                            error: error
                        };
                    });
    };

    RssItemSchema.statics.getRssItemContentById = function(id){
        return this.findOne({'_id': id})
                   //.select('content')
                   .then(function(data){
                      
                      if(!!data){
                         if(!data.content){
                            return {
                                hasContent: false,
                                link: data.link,
                                updated: data.updated,
                            };
                         }
                         return data.content;
                      }
                      return data;
                   }, function(error){
                        return {
                            message : 'data base query occur a problem when you query content of item(' + id + ')',
                            error: error
                        };
                   });
    };

    RssItemSchema.statics.getRssItemsByCatelogId = function(catelogId) {
        return this.find({
                        'catelogId': catelogId })
                   .sort({
                        'updated': 'desc'})
                   .select('-content')
                   .then(function(items){
                        return items;
                    }, function(error){
                        return {
                            message: 'data base query occur a problem when you query the items of catelog(' + catelogId + ')',
                            error: error
                        };
                    });
                
    };

    module.exports = mongoose.model(model, RssItemSchema);

})(module.exports);