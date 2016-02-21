(function(DoubanBook){
	'use strict';

    var mongoose = require('mongoose');

    var Types = mongoose.Schema.Types;

    var model = 'DoubanBook';

    var DoubanBookSchema = new mongoose.Schema({
        name: String,
        author: String,
        publish: String,
        translator: String,
        originName: String,
        downloadLink: String,
        buyLink: String,
        imageUrl: String,
        doubanUrl: String,
        description: String,
        rating: Number
    });

    DoubanBookSchema.statics.getBookCount = function(){
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

    DoubanBookSchema.statics.getBooksList = function(page, limit){
        return this.find({})
                   .skip(page * limit)
                   .limit(limit)
                   .then(function(items){
                      return items;
                    }, function(error){
                         return {
                            message: 'data base query occur a problem when you query the latest item',
                            error: error
                        };
                    });
    };

    DoubanBookSchema.statics.bulkSaveBookList = function(items){
        return this.collection
                   .insert(items)
                   .then(function(data) {
                        return {
                            success: data
                        };
                    }, function(error) {
                        return {
                            error: error,
                            message: 'bulk save books occurs a problem'
                        };
                    });
    };

    module.exports = mongoose.model(model, DoubanBookSchema);
})(module.exports);