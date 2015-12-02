(function(){
	angular.module('app', []);

	//angular.module('app').constant('API_URL', 'http://www.wangqunxi.com/api/');
	angular.module('app').constant('API_URL', 'http://localhost:3000/api/');
	

	angular.module('app').controller('NavHeaderCtrl', NavHeaderCtrl);
	NavHeaderCtrl.$inject = ['utilsService', 'authToken'];

	function NavHeaderCtrl(utilsService, authToken){
		var vm = this;
		vm.path = utilsService.getLocationPath();
		vm.isAuthenticated = authToken.isAuthenticated();
		vm.username = authToken.getCurrentUser() ? authToken.getCurrentUser().email : '';

		vm.logout = logout;

		function logout(){
			authToken.removeCurrentUser();
			vm.isAuthenticated = false;
		}
		//console.log(vm.isAuthenticated, authToken.getToken());
	}

	angular.module('app').factory('postService', postService);
	postService.$inject = ['$http', '$sce', 'API_URL', 'utilsService'];
	function postService($http, $sce, API_URL, utilsService){

		var service = {
			getPostsByDate: getPostsByDate
		};

		return service;

		function getPostsByDate(page, limit){
			var url = API_URL + 'posts';
			return $http.get(url, {params: {page: page, limit: limit}})
						.then(function(res){
							res.data.items = _.map(res.data.items, function(n){
					   	 		if(n.description){
					   	 			n.updated = utilsService.formatDate(n.updated);
					   	 			
					   	 			n.description = $sce.trustAsHtml(n.description, 50);
					   	 		}
					   	 		return n;
					   	 	});
					   	 	return res.data;
						},
						function(res){
							console.log(res);
							return [];				
						});
						
		}
	}


	angular.module('app').controller('PostCtrl', PostCtrl);
	PostCtrl.$inject = ['postService', 'utilsService'];
	function PostCtrl(postService, utilsService){
		var vm = this;
		vm.posts = [];
		vm.showMorePosts = showMorePosts;
		vm.loaded = false;
		vm.totalSize = 0;


		var itemsOfPerPage = 12;
		initPosts();

		
		function initPosts(){
			postService.getPostsByDate(0, itemsOfPerPage)
					   .then(function(data){
					   		if(utilsService.isErrorObject(data)){
					   			vm.loaded = false;
					   		}else{
					   			vm.posts = data.items;
					   			vm.totalSize = data.count / itemsOfPerPage;
					   			vm.loaded = true;
					   		}
					   });
		}

		function showMorePosts(currentPage){
			postService.getPostsByDate(currentPage - 1, itemsOfPerPage)
					   .then(function(data){
					   		vm.posts = data.items;
					   });
		}
	}
})();