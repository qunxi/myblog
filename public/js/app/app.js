angular.module('app', []);

angular.module('app').constant('API_URL', 'http://www.wangqunxi.com/api/');
//angular.module('app').constant('API_URL', 'http://localhost:3000/api/');

angular.module('app').factory('UtilsService', UtilsService);
function UtilsService(){
	var service = {
		cutString: cutString
	};

	function cutString(data, maxLength){
		if(data.length > maxLength){
			return data.substr(0, maxLength) + '...';
		}
		return data;
	}

	return service;
}

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
PostCtrl.$inject = ['$sce', 'PostService', 'UtilsService'];
function PostCtrl($sce, PostService, UtilsService){
	var vm = this;
	vm.posts = [];
	vm.showMorePosts = showMorePosts;

	initPosts();

	function initPosts(){
		PostService.getPostsByDate(0, 6)
				   .then(function(data){
				   	 	vm.posts = _.map(data, function(n){
				   	 		if(n.description){
				   	 			console.log(UtilsService.cutString(n.description, 45));
				   	 			n.description = $sce.trustAsHtml(UtilsService.cutString(n.description, 45));
				   	 		}
				   	 		return n;
				   	 	});
				   	 	console.log(vm.posts);
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