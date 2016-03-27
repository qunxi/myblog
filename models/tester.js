(function(Tester) {
    'use strict';

    var Q = require('q');
    var mongoose = require('mongoose');

    var TesterSchema = new mongoose.Schema({
        name: String,
        start: Date,
        end: Date,
    });

    TesterSchema.statics.findByTesterId = function(id){
        return this.findOne({
            _id: id
        });
    };

    TesterSchema.statics.verifyTester = function(name){
        return this.findOne({
            name: name
        }).then(function(data){
            console.log(data);
            return data;
        }, function(error){
            console.log(error);
            return {
                error: 'find user has an error'
            };
        });
    };

    module.exports = mongoose.model('Tester', TesterSchema);

})(module.exports);