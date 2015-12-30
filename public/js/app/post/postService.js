angular.module('app').factory('postService', postService);
postService.$inject = ['$http', '$sce', 'API_URL', 'utilsService', 'authToken'];

function postService($http, $sce, API_URL, utilsService, authToken) {

    var service = {
        getPostsByDate: getPostsByDate,
        addPostComment: addPostComment,
        getPostComments: getPostComments,
        addAsFavorite: addAsFavorite,
        thumbUpForPost: thumbUpForPost,
        formatPosts: formatPosts,
        getFavorPostList: getFavorPostList 
    };

    return service;

    function getFavorPostList(page, limit) {

        return $http.get(API_URL + 'post/favorposts', {
            params: {
                //userId: userId,
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

    function thumbUpForPost(postId){
        var url = API_URL + 'post/thumbup';
        return $http.post(url, {postId: postId})
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
            }).then(function(res) {
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
            post.description = $sce.trustAsHtml(post.description, 100);
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