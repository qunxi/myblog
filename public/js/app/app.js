(function(){
	angular.module('app', []);

	angular.module('app').constant('API_URL', 'http://www.wangqunxi.com/api/');
	//angular.module('app').constant('API_URL', 'http://localhost:3000/api/');

	angular.module('app').controller('NavHeaderCtrl', NavHeaderCtrl);
	NavHeaderCtrl.$inject = ['UtilsService'];

	function NavHeaderCtrl(UtilsService){
		var vm = this;
		vm.path = UtilsService.getLocationPath();
	}

	angular.module('app').factory('PostService', PostService);
	PostService.$inject = ['$http', '$sce', 'API_URL', 'UtilsService'];
	function PostService($http, $sce, API_URL, UtilsService){

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
					   	 			n.updated = UtilsService.formatDate(n.updated);
					   	 			
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
	PostCtrl.$inject = ['PostService', 'UtilsService'];
	function PostCtrl(PostService, UtilsService){
		var vm = this;
		vm.posts = [];
		vm.showMorePosts = showMorePosts;
		vm.loaded = false;
		vm.totalSize = 0;


		var itemsOfPerPage = 12;
		initPosts();

		
		function initPosts(){
			PostService.getPostsByDate(0, itemsOfPerPage)
					   .then(function(data){
					   		if(UtilsService.isErrorObject(data)){
					   			vm.loaded = false;
					   		}else{
					   			vm.posts = data.items;
					   			vm.totalSize = data.count / itemsOfPerPage;
					   			vm.loaded = true;
					   		}
					   });
		}

		function showMorePosts(currentPage){
			PostService.getPostsByDate(currentPage - 1, itemsOfPerPage)
					   .then(function(data){
					   		vm.posts = data.items;
					   });
		}
	}
})();