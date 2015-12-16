(function(Book) {
    'use strict';

    var mongoose = require('mongoose');

    var Types = mongoose.Schema.Types;

    var model = 'Book';

    var BookSchema = new mongoose.Schema({
        name: String,
        author: String,
        publish: String,
        translator: String,
        originName: String,
        downloadLink: String,
        buyLink: String,
        imageUrl: String,
        description: String
    });

    BookSchema.statics.getBookCount = function(){
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

    BookSchema.statics.getBooksList = function(page, limit){
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


    module.exports = mongoose.model(model, BookSchema);
})(module.exports);