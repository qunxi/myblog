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
        description: String,
        images: Array,
        catelogId: Types.ObjectId
    });

    RssItemSchema.statics.getRssItemCount = function(){
        return this.find({})
                   .count()
                   .then(function(n){
                      return n;
                   }, function(error){
                      return {
                            message: 'data base query occur a problem when you query the count of item',
                            error: error
                      };
                   });
    };

    RssItemSchema.statics.getLatestRssItems = function(page, limit){
        return this.find({})
                   .skip(page * limit)
                   .limit(limit)
                   .sort({'updated': 'desc'})
                   .then(function(items){
                      return items;
                    }, function(error){
                         return {
                            message: 'data base query occur a problem when you query the latest item',
                            error: error
                        };
                    });
    };

    RssItemSchema.statics.bulkSaveRssItems = function(items){
       
        return this.collection
                   .insert(items)
                   .then(function(data) {
                        return {
                            success: data
                        };
                    }, function(error) {
                        return {
                            error: error,
                            message: 'bulk save rss items occurs a problem'
                        };
                    });
    };

    RssItemSchema.statics.getLatestRssItemByCatelogId = function(catelogId) {
        return this.findOne({'catelogId': catelogId }, 
                            '-content')
                    .sort({'updated': 'desc'})
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
                            if(!!data.description){
                                return data.description;
                            }
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

    RssItemSchema.statics.getRssItemsByCatelogId = function(catelogId, page, limit) {
        return this.find({'catelogId': catelogId }, 
                         '-content',
                         {
                          'skip': page * limit,
                          'limit': limit
                         })
                   .sort({'updated': 'desc'})
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