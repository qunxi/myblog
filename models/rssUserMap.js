(function(RssUserMap) {

    var mongoose = require('mongoose');
    var _ = require('lodash');
   
    var Types = mongoose.Schema.Types;

    var model = 'RssUserMap';

    var RssUserMapSchema = new mongoose.Schema({
        userId: Types.ObjectId,
        catelogId: Types.ObjectId,
    });

    RssUserMapSchema.statics.getCatelogIdsByUserId = function(id) {
        return this.find({
                        userId: id
                    })
                    .select('catelogId').exec()
                    .then(function(catelogIds){
                        return _.map(catelogIds, function(n){
                                    return {_id: n.catelogId};
                                });
                    }, function(error){
                        return {
                            message : 'getCatelogIdsByUserId' + id + 'occur database query error',
                            error: error
                        };
                    });
    };


    RssUserMapSchema.statics.getUserIdsByCatelogId = function(id) {
         return this.find({
                        catelogId: id
                    })
                    .select('userId').exec()
                    .then(function(userIds){
                        return _.map(userIds, function(n){
                                    return {_id: n.userId};
                                });
                    }, function(error){
                        return {
                            message : 'getUserIdsByCatelogId' + id + 'occur database query error',
                            error: error
                        };
                    });
    };


    RssUserMapSchema.statics.removeSeelctedRss = function(rssUserIds){
        return this.remove({$or: rssUserIds})
                   .exec()
                   .then(function(data){
                        
                        return data;
                   }, function(error){
                        return {
                            error: error,
                            message: 'remove rssUserId happened some problem'
                        };
                   });
    };


    RssUserMapSchema.pre('save', function(next) {
        var rssUser = this;
        mongoose.model(model, RssUserMapSchema)
                .findOne({
                        catelogId: rssUser.catelogId,
                        userId: rssUser.userId
                 }, function(error, data){
                        if(error){
                            next(error);
                        }
                        if(!!data){
                            next(new Error('The relation mapping has exist'));
                        }
                        next();
                });
    });

    module.exports = mongoose.model(model, RssUserMapSchema);

})(module.exports);