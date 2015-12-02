angular.module('app').controller('SubscribeCtrl', SubscribeCtrl);
SubscribeCtrl.$inject = ['subscribeService', 'utilsService'];

function SubscribeCtrl(subscribeService, utilsService){
	var vm = this;

	vm.subscribeText = '';
	vm.loading = false;

	vm.subscribe = subscribe;
	vm.getRssResources = getRssResources;

	getRssResources();

	function subscribe(){
		vm.loading = true;
		subscribeService.subscribe(vm.subscribeText)
						.then(function(data){
							if(utilsService.isErrorObject(data)){
								//error show	
							}
							vm.loading = false;
							getRssResources();
						});
	}

	function getRssResources(){
		var page = 0;
		var limit = 5;
		subscribeService.getRssResources(0, 5)
						.then(function(data){
							console.log(data);
							if(utilsService.isErrorObject(data)){
								//error show
								return [];	
							}

							vm.catelogs = _.map(data, function(n){
								n.updated = utilsService.formatDate(n.updated);
								return n;
							});
						});
	}
}


angular.module('app').factory('subscribeService', subscribeService);
subscribeService.$inject = ['$http', 'API_URL'];

function subscribeService($http, API_URL){
	var service = {
		subscribe : subscribe,
		getRssResources: getRssResources
	};

	return service;

	function subscribe(link){
		var url = API_URL + 'subscribe';

		return $http.post(url, {link: link})
					.then(function(res){
						
					 	return res.data;
					}, function(res){
					 	
					 	return {
					 		error: res.data.error
					 	};
					});
	}

	function getRssResources(page, limit){
		var url = API_URL + 'rssResource';

		return $http.get(url, {params: {page: page, limit: limit}})
					.then(function(res){
						return res.data;
					}, function(res){
						return {
							error: res.data.error
						};
					});
	}
}