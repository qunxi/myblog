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


    RssCatelogSchema.statics.getAllOfCatelogs = function(){
        return this.find({})
                   .then(function(data){
                        return data;
                   }, function(error){
                        return {
                            error: error,
                            message: 'get all of catelogs occurs a problem'
                        };
                   });
    };


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

    RssCatelogSchema.statics.getCatelogsByText = function(query){
        return this.find({$or: [{title: new RegExp(query, 'i')}, 
                                {website: new RegExp(query, 'i')}, 
                                {link: new RegExp(query, 'i')}]})
                   .then(function(data){
                        return data;
                   }, function(error){
                        return {
                            error: error,
                            message: 'query the rss occurs a problem'
                        };
                   });
    };

    RssCatelogSchema.statics.getCatelogsByIds = function(catelogIds, page, limit) {
        return this.find({
                    $or: catelogIds
                    }, null, {
                        skip: page * limit,
                        limit: limit
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