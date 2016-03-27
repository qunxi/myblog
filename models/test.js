(function(Test) {
    'use strict';

    var Q = require('q');
    var mongoose = require('mongoose');

    var TestSchema = new mongoose.Schema({
        id: String,
        userId: mongoose.Schema.Types.ObjectId,
        createDate: Date,
        updatedDate: Date,
        answer: String,
        name: String
    });

    TestSchema.statics.findAnswerById = function(id, userId){
        return this.findOne({
            id: id,
            userId: userId
        });
    };

    module.exports = mongoose.model('Test', TestSchema);

})(module.exports);