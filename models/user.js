(function(User) {
    'use strict';

    var Q = require('q');
    var bcrypt = require('bcrypt-nodejs');
    var mongoose = require('mongoose');

    var UserSchema = new mongoose.Schema({
        email: String,
        username: String,
        password: String,
        actived: Boolean,
        mobilePhone: String,
        sex: Number,
        address: String,
        github: String,
        blog: String,
        description: String,
        realName: String,
        published: Number,
        registerDate: Date
    });

    UserSchema.methods.toJSON = function() {
        var user = this.toObject();
        delete user.password;
        return user;
    };

    UserSchema.methods.comparePasswords = function(password, callback) {
        bcrypt.compare(password, this.password, callback);
    };

    UserSchema.methods.comparePasswordPromise = function(password) {
        return Q.nfcall(bcrypt.compare, password, this.password);
    };

    UserSchema.statics.findUserById = function(id) {
        return this.findOne({
            _id: id
        }).then(function(data){
            return data;
        }, function(error){
            return {
                error: 'find user has an error'
            };
        });
    };

    UserSchema.statics.findUserByNameOrEmail = function(name, email) {
        
        var searchUser = {
            $or: [{
                username: name
            }, {
                email: email
            }]
        };

        return this.findOne(searchUser);
    };

    UserSchema.statics.updateUserPassword = function(userId, password){

        bcrypt.genSalt(10, function(err, salt) {
            if (err) return next(err);

            bcrypt.hash(password, salt, null, function(err, hash) {
                if (err) return next(err);
                password = hash;
                next();
            });
        });

        return this.findOneAndUpdate({
            _id: userId
        }, {
            password: password
        }, {
        });
    };

    UserSchema.pre('save', function(next) {
        var user = this;
        if (!user.isModified('password')) {
            console.log('Is not modifed');
            return next();
        }

        bcrypt.genSalt(10, function(err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, null, function(err, hash) {
                if (err) return next(err);
                user.password = hash;
                next();
            });
        });
    });

    module.exports = mongoose.model('User', UserSchema);

})(module.exports);