(function(PostFavorite) {
    'use strict';

    var mongoose = require('mongoose');

    var Types = mongoose.Schema.Types;

    var model = 'PostFavorite';

    var PostFavoriteSchema = new mongoose.Schema({
        userId: Types.ObjectId,
        postId: Types.ObjectId
    });

    PostFavoriteSchema.statics.isFavoriteExist = function(userId, postId){
        return this.findOne({
            userId: userId,
            postId: postId
        }).then(function(data) {
            return data;
        }, function(error) {
            return {
                error: 'find post favorite has an error'
            };
        });
    };

    PostFavoriteSchema.statics.getFavoritesByUserId = function(userId, page, limit) {
        return this.find({userId: userId})
            .skip(page * limit)
            .limit(limit)
            .then(function(items) {
                return items;
            }, function(error) {
                return {
                    message: 'data base query occur a problem when you query the latest item',
                    error: error
                };
            });
    };


    module.exports = mongoose.model(model, PostFavoriteSchema);

})(module.exports);