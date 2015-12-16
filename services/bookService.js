(function(bookService) {
    'use strict';

    var Book = require('../models/book.js');
    var utils = require('./utilsSrv.js');
    var authSrv = require('./authenticateSrv.js');
    var Q = require('q');

    bookService.submitBook = submitBook;
    bookService.getBooksList = getBooksList;

    function submitBook(book, token) {
        var deferred = Q.defer();

        if (!book) {
            deferred.reject({
                status: 400,
                error: 'book data is empty'
            });
            return deferred.promise;
        }

        if (!book.name || !book.author) {
            deferred.reject({
                status: 400,
                error: 'book name or author name must filled'
            });
            return deferred.promise;
        }
        
        return authSrv.verifyToken(token)
            .then(function(user) {
              return  saveBook({
                        name: book.name,
                        author: book.author,
                        publish: book.publish,
                        translator: book.translator,
                        originName: book.originName,
                        downloadLink: book.downloadLink,
                        buyLink: book.buyLink,
                        imageUrl: book.imageUrl,
                        description: book.description
                }).then(function(data) {
                    if (utils.isErrorObject(data)) {
                        return {
                            status: 500,
                            error: data
                        };
                    }
                    return {
                        status: 200,
                        data: data
                    };
                });
            }, function(error) {
                return {
                    status: 401,
                    error: error
                };
            });
    }

    function getBooksList(page, limit) {
        var deferred = Q.defer();

        if (page < 0 || limit <= 0) {
            deferred.reject({
                status: 400,
                error: 'the page or limit parameter is not valid'
            });
            return deferred.promise;
        }

        return Book.getBooksList(page, limit)
            .then(function(books) {
                if (utils.isErrorObject(books)) {
                    return {
                        error: books,
                        status: 500
                    };
                }
                return Book.getBookCount()
                    .then(function(count) {
                        if (utils.isErrorObject(count)) {
                            return {
                                error: count,
                                status: 500
                            };
                        }
                        return {
                            status: 200,
                            data: {
                                books: books,
                                count: count
                            }
                        };
                    });
            });
    }


    /**/
    function saveBook(book) {
        console.log(book);
        var newBook = new Book(book);

        return newBook.save(book)
            .then(function(data) {
                return data;
            }, function(error) {
                return {
                    error: 'save book has an error'
                };
            });
    }

})(module.exports);