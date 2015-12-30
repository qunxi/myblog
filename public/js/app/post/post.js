


angular.module('app').controller('PostCtrl', PostCtrl);
PostCtrl.$inject = ['$window', '$timeout', '$interval', 'postService', 'utilsService', 'authToken'];

function PostCtrl($window, $timeout, $interval, postService, utilsService, authToken) {
    var vm = this;

    vm.posts = [];
    vm.loaded = false;
    vm.totalSize = 0;
    vm.isAuthenticated = authToken.isAuthenticated();
    vm.disableComment = false;
    vm.commentsList = [];
    vm.commentLabel = '评论';
    vm.isYourFavorite = false;
    vm.thumbUp = 0;
    vm.isDisableThumbUp = false;

    vm.markThumbUp = thumbUp;
    vm.submitComment = submitComment;
    vm.addAsFavorite = addAsFavorite;
    vm.showMorePosts = showMorePosts;
    vm.initPosts = initPosts;
    

    var itemsOfPerPage = 12;

    if(utilsService.getLocationPath() === '/'){
        //initPosts();
    }
    else{
        getPostComments();
        vm.isDisableThumbUp = isMarkedThumbUp();
    }

    function initPosts(items, count) {
         vm.posts = postService.formatPosts(items);
         vm.totalSize = count / itemsOfPerPage + (count % itemsOfPerPage === 0 ? 0 : 1);
         vm.loaded = true;
    }

    function isMarkedThumbUp() {
        var postsList = angular.fromJson($window.localStorage.getItem('thumbUpPosts'));
        var postId = document.getElementById('postId').value;
        var isFinded = false;
        if (!!postsList) {
            for (i = 0; i < postsList.length; ++i) {
                if (postsList[i] === postId) {
                    isFinded = true;
                    break;
                }
            }
        }
        return isFinded;
    }

    function getPostComments(){
        var postId = document.getElementById('postId').value;
        postService.getPostComments(postId)
                   .then(function(data){
                        vm.commentsList = data;
                   });
    }

    function thumbUp(){
        var postId = document.getElementById('postId').value;
        if(!postId){
            return;
        }
        
        postService.thumbUpForPost(postId)
                   .then(function(data){
                        var postsList = angular.fromJson($window.localStorage.getItem('thumbUpPosts'));
                        
                        if(!postsList){
                            postsList = [];
                        }

                        if(!isMarkedThumbUp()){
                            postsList.push(postId);
                        }
                        
                        $window.localStorage.setItem('thumbUpPosts', angular.toJson(postsList));
                        vm.thumbUp++;
                        vm.isDisableThumbUp = true;
                   }, function(error){

                   });
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