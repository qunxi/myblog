(function(){
	angular.module('app', []);

	angular.module('app').constant('API_URL', 'http://www.wangqunxi.com/api/');
	//angular.module('app').constant('API_URL', 'http://localhost:3000/api/');

	angular.module('app').controller('NavHeaderCtrl', NavHeaderCtrl);
	NavHeaderCtrl.$inject = ['$window'];

	function NavHeaderCtrl($window){
		var vm = this;
		vm.path = $window.location.pathname;
	}


	angular.module('app').factory('UtilsService', UtilsService);
	function UtilsService(){
		var service = {
			/*cutString: cutString,*/
			formatDate: formatDate,
			isErrorObject: isErrorObject
		};

		function formatDate(date){
			var newDate = new Date();

			if(!(date instanceof Date)){
				var parseDate = Date.parse(date);
				if(!!parseDate){
					newDate = new Date(parseDate);
				}
			}else{
				newDate = date;
			}
			
			return newDate.getUTCFullYear() + '-' +
			       (newDate.getUTCMonth() + 1) + '-' + newDate.getUTCDate() +
				   ' ' + newDate.getUTCHours() + ':' + newDate.getUTCMinutes() + 
				   ':' + newDate.getUTCSeconds();
		}
		
		function isErrorObject(data){
			
			return !!data && data.hasOwnProperty('error');
		}

		/*function cutString(data, maxLength){
			if(data.length > maxLength){
				return data.substr(0, maxLength) + '...';
			}
			return data;
		}*/

		return service;
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

		initPosts();

		function initPosts(){
			PostService.getPostsByDate(0, 6)
					   .then(function(data){
					   		if(UtilsService.isErrorObject(data)){
					   			vm.loaded = false;
					   		}else{
					   			vm.posts = data.items;
					   			vm.totalSize = data.count;
					   			vm.loaded = true;
					   		}
					   });
		}

		function showMorePosts(currentPage){
			PostService.getPostsByDate(currentPage - 1, 6)
					   .then(function(data){
					   		vm.posts = data.items;
					   });
		}
	}
})();