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
            /*if(data){
                return {
                    error: 'the favorite has existed'
                };
            }*/
            return data;
        }, function(error) {
            return {
                error: 'find post favorite has an error'
            };
        });
    };

    module.exports = mongoose.model(model, PostFavoriteSchema);

})(module.exports);