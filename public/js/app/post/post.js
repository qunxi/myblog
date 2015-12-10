angular.module('app').factory('postService', postService);
postService.$inject = ['$http', '$sce', 'API_URL', 'utilsService', 'authToken'];

function postService($http, $sce, API_URL, utilsService, authToken) {

    var service = {
        getPostsByDate: getPostsByDate,
        addPostComment: addPostComment,
        getPostComments: getPostComments,
        addAsFavorite: addAsFavorite
    };

    return service;


    function addAsFavorite(postId){
        var url = API_URL + 'post/favorite';
        return $http.post(url, {postId: postId})
                    .then(function(res){
                        return res.data;
                    }, function(res){
                        return {
                            error: res.data.error
                        };
                    });
    }

    function addPostComment(postId, comment){

    	var url = API_URL + 'post/comment';
    	return $http.post(url, {postId: postId, comment: comment})
	    		.then(function(res){
	    			return res.data;
	    		}, function(res){
	    			return {
	    				error: res.data.error
	    			};
	    		});
    }

    function getPostComments(postId){
    	var url = API_URL + 'post/comment';
        return $http.get(url, {
            params:{
                postId: postId
            }
        })
        .then(function(res){
            //console.log(res.data);
            return formatComments(res.data);
        }, function(res){
            return [];
        });
    }

    function getPostsByDate(page, limit) {
        var url = API_URL + 'posts';
        return $http.get(url, {
                params: {
                    page: page,
                    limit: limit
                }
            })
            .then(function(res) {
                    res.data.items = formatPosts(res.data.items);
                    return res.data;
                },
                function(res) {
                    console.log(res);
                    return [];
                });
    }

    function formatComments(comments){
        return _.map(comments, function(comment) {
            comment.date = utilsService.formatDate(comment.date);
            return comment;
        });
    }

    function formatPosts(posts) {
        return _.map(posts, function(post) {
        	post.updated = utilsService.formatDate(post.updated);
            post.description = $sce.trustAsHtml(post.description, 50);
            var user = authToken.getCurrentUser();
            if(!user){
                post.postLink = '/post?id=' + post._id + '&src=' + post.source;
            }
            else{
                var userId = user._id;
                post.postLink = '/post?id=' + post._id + '&src=' + post.source + '&userId=' + userId;
            }
            return post;
        });
    }
}


angular.module('app').controller('PostCtrl', PostCtrl);
PostCtrl.$inject = ['$timeout', '$interval', 'postService', 'utilsService', 'authToken'];

function PostCtrl($timeout, $interval, postService, utilsService, authToken) {
    var vm = this;

    vm.posts = [];
    vm.loaded = false;
    vm.totalSize = 0;
    vm.isAuthenticated = authToken.isAuthenticated();
    vm.disableComment = false;
    vm.commentsList = [];
    vm.commentLabel = '评论';
    vm.isYourFavorite = false;
    
    vm.thumbUp = thumbUp;
    vm.submitComment = submitComment;
    vm.addAsFavorite = addAsFavorite;
    vm.showMorePosts = showMorePosts;

    var itemsOfPerPage = 12;

    if(utilsService.getLocationPath() === '/'){
        initPosts();
    }
    else{
        getPostComments();
    }

    function initPosts() {
        postService.getPostsByDate(0, itemsOfPerPage)
            .then(function(data) {
                if (utilsService.isErrorObject(data)) {
                    vm.loaded = false;
                } else {
                    vm.posts = data.items;
                    vm.totalSize = data.count / itemsOfPerPage;
                    vm.loaded = true;
                }
                console.log(vm.posts);
            });
    }

    function getPostComments(){
        var postId = document.getElementById('postId').value;
        postService.getPostComments(postId)
                   .then(function(data){
                        vm.commentsList = data;
                   });
    }

    function thumbUp(){

    }

    function addAsFavorite(){

        if(!vm.isAuthenticated){
            utilsService.redirectUrl('/login');
        }

        var postId = document.getElementById('postId').value;

        if(!postId){
            return;
        }

        postService.addAsFavorite(postId)
                   .then(function(data){
                        if(utilsService.isErrorObject(data)){
                            //vm.isYourFavorite = true;
                            return data;
                        }
                        vm.isYourFavorite = !vm.isYourFavorite;
                        return data;
                   });
    }

    function submitComment(){

        if(!vm.isAuthenticated){
            utilsService.redirectUrl('/login');
        }
    	
        var postId = document.getElementById('postId').value;

        if(!postId || !vm.comment || vm.comment.length < 6){
            return;
        }
        
    	postService.addPostComment(postId, vm.comment)
    			   .then(function(data){
                        if(utilsService.isErrorObject(data)){
                            return data;
                        }
                        vm.comment = '';
                        vm.commentsList.push(data);
                        waittingTenSecond();
    			   });
    }

    function waittingTenSecond() {
        vm.disableComment = true;
        var timer = 10;

        vm.commentLabel = '评论(' + timer + ')';
        var interval = $interval(function() {
            timer--;
            vm.commentLabel = '评论(' + timer + ')';
            if (timer <= 0) {
                $interval.cancel(interval);
                vm.commentLabel = '评论';
            }
        }, 1000);

        $timeout(function() {
            vm.disableComment = false;
        }, 10000);
    }

    function showMorePosts(currentPage) {
        postService.getPostsByDate(currentPage - 1, itemsOfPerPage)
            .then(function(data) {
                vm.posts = data.items;
            });
    }

     
}