(function(Feedback) {
    'use strict';

    var mongoose = require('mongoose');

    var Types = mongoose.Schema.Types;

    var model = 'Feedback';

    var FeedbackSchema = new mongoose.Schema({
        userId: Types.ObjectId,
        message: String,
    });

    module.exports = mongoose.model(model, FeedbackSchema);
})(module.exports);