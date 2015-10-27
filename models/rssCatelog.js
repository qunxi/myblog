(function(RssCatelog) {
    'use strict';

    var mongoose = require('mongoose');

    var model = 'RssCatelog';

    var RssCatelogSchema = new mongoose.Schema({
        website: String, //mainpage
        link: String, //self
        title: String,
        subtitle: String,
        author: String,
        updated: Date,
        classify: String,
        tags: String
    });

    RssCatelogSchema.statics.getRssCatelogByUrl = function(rsslink) {
        return this.findOne({
                    link: rsslink
                })
                .then(function(data){
                    return data;
                }, function(error){
                    return {
                        error: error,
                        message: 'getRssCatelogByUrl occurs a problem'
                    };
                });
    };

    RssCatelogSchema.statics.getCatelogsByIds = function(catelogIds) {
        return this.find({
                    $or: catelogIds
                    })
                    .then(function(data){
                        return data;
                    }, function(error){
                        return {
                            error: error,
                            message: 'getCatelogsByIds occurs a problem'
                        };
                    });
    };

    module.exports = mongoose.model(model, RssCatelogSchema);

})(module.exports);