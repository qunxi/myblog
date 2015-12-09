(function(PostComment) {
    'use strict';

    var mongoose = require('mongoose');

    var Types = mongoose.Schema.Types;

    var model = 'PostComment';

    var PostCommentSchema = new mongoose.Schema({
        userId: Types.ObjectId,
        postId: Types.ObjectId,
        user: String,
        date: Date,
        comment: String,
    });

    PostCommentSchema.statics.getPostCommentsById = function(postId){
        return this.find({
            postId: postId
        }).then(function(data){
            return data;
        }, function(error){
            return {
                error: 'find comments has an error'
            };
        });
    };

    PostCommentSchema.statics.isCommentExist = function(userId, postId, comment){
        return this.findOne({
            userId: userId,
            postId: postId,
            comment: comment
        }).then(function(data) {
            if(data){
                return {
                    error: 'the comment has existed'
                };
            }
            return data;
        }, function(error) {
            return {
                error: 'find post comment has an error'
            };
        });
    };

    module.exports = mongoose.model(model, PostCommentSchema);

})(module.exports);