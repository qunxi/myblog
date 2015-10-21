(function(FeedUserRelation) {
    var mongoose = require('mongoose');
    var model = 'FeedUserRelation';
    var Types = mongoose.Schema.Types;

    var FeedUserRelationSchema = new mongoose.Schema({
        userId: Types.ObjectId,
        catelogId: Types.ObjectId,
    });

    FeedUserRelationSchema.statics.findCatelogIdsByUserId = function(id) {
        return this.find({
            userId: id
        }).select('catelogId').exec();
    };


    module.exports = mongoose.model(model, FeedUserRelationSchema);

})();