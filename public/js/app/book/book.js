angular.module('app').factory('bookService', bookService);
bookService.$inject = ['$http', 'API_URL', 'utilsService', 'authToken'];

function bookService($http, API_URL, utilsService, authToken) {
    var service = {
        getBookList: getBookList,
        submitBook: submitBook
    };

    return service;

    function getBookList(page, limit) {
        var url = API_URL + 'book';
        return $http.get(url, {
            params: {
                page: page,
                limit: limit
            }
        }).then(function(res) {
            return res.data;
        }, function(res) {
            return {
                error: res.data
            };
        });
    }

    function submitBook(book) {
        var url = API_URL + 'book';
        return $http.post(url, {book: book})
                   .then(function(res){
                        return res.data;
                   }, function(res){
                        return {
                            error: res.data
                        };
                   });
    }
}

angular.module('app').controller('BookCtrl', BookCtrl);
BookCtrl.$inject = ['bookService', 'utilsService'];

function BookCtrl(bookService, utilsService){
    var vm = this;

    vm.submitBook = submitBook;
    vm.getBookList = getBookList;
    vm.initBookList = initBookList;

    vm.newBook = {
        name: '',
        author:  '',
        translator: '',
        publish: '',
        originName: '',
        downloadLink: '',
        buyLink: '',
        imageUrl: ''
    };

    vm.books = [];
    vm.pageCount = 0;

    var countOfPerPage = 9;

    function initBookList(books, count){
        vm.books = books;
        vm.pageCount = count / countOfPerPage + (count % countOfPerPage === 0 ? 0 : 1);
    }

    function getBookList(page){
        var limit = countOfPerPage;
        return bookService.getBookList(page - 1, limit)
                  .then(function(data){
                        if(utilsService.isErrorObject(data)){
                            console.log(data);
                            return [];
                        }

                        vm.books = data.books;
                        vm.pageCount = data.count;
                  });
    }

    function submitBook(){
        var book = {
            name : vm.newBook.name,
            author: vm.newBook.author,
            translator: vm.newBook.translator,
            publish: vm.newBook.publish,
            originName: vm.newBook.originName,
            downloadLink: vm.newBook.downloadLink,
            buyLink: vm.newBook.buyLink,
            imageUrl: vm.newBook.imageUrl
        };
        bookService.submitBook(book)
                   .then(function(data){
                        if(utilsService.isErrorObject(data)){
                            console.log(data);
                            return data;
                        }
                        return data;
                   });
    }
}