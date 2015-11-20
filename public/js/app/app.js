angular.module('app', []);

angular.module('app').constant('API_URL', 'http://www.wangqunxi.com/api/');
//angular.module('app').constant('API_URL', 'http://localhost:3000/api/');

angular.module('app').factory('PostService', PostService);
PostService.$inject = ['$http', 'API_URL'];
function PostService($http, API_URL){

	var service = {
		getPostsByDate: getPostsByDate
	};

	return service;

	function getPostsByDate(page, limit){
		var url = API_URL + 'posts';
		return $http.get(url, {params: {page: page, limit: limit}})
					.then(function(res){
						return res.data;
					},
					function(res){
						console.log(res);
						return [];				
					});
	}
}


angular.module('app').controller('PostCtrl', PostCtrl);
PostCtrl.$inject = ['PostService'];
function PostCtrl(PostService){
	var vm = this;
	vm.posts = [];
	vm.showMorePosts = showMorePosts;

	initPosts();

	function initPosts(){
		PostService.getPostsByDate(0, 6)
				   .then(function(data){
				   		
				   	 	vm.posts = data;
				   });
	}

	function showMorePosts(){
		PostService.getPostsByDate(vm.posts.length / 6 + 1, 6)
				   .then(function(data){
				   		
				   		vm.posts = vm.posts.concat(data);
				   		console.log(vm.posts);
				   });
	}
} 