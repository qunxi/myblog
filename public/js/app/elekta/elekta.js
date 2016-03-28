angular.module('app').factory('elektaService', elektaService);

elektaService.$inject = ['$http', 'API_URL', 'utilsService', '$window'];

function elektaService($http, API_URL, utilsService, $window){
	var service = {
		startTime: startTime,
		addAccount: addAccount,
		sumbitAnswer: sumbitAnswer
	};
	return service;

	function startTime(account){
		var url = API_URL + 'elekta/starttime';
		
		$http.post(url, {account: account})
			.then(function(data){
				$window.sessionStorage.setItem('elekta', angular.toJson(data.data));
				utilsService.redirectUrl('/interview?id=' + data.data._id);
			}, function(error){
				console.log(error);
			});
	}

	function addAccount(account){
		var url = API_URL + 'elekta/addAccount';
				
		$http.post(url, {account: account})
			.then(function(data){
				console.log(data);
			}, function(error){
				console.log(error);
		});
	}

	function sumbitAnswer(id, answer){
		var url = API_URL + 'elekta/answer';
		var cache = angular.fromJson($window.sessionStorage.getItem('elekta'));
		var userId = cache._id;
		var username = cache.name;

		return $http.post(url, {id: id, answer: answer, userId: userId, username: username})
					.then(function(data){
						return data;
					}, function(res){
						return {
		                	error: res.data
		            	};
				});
	}
}

angular.module('app').controller('ElektaCtrl', ElektaCtrl);
ElektaCtrl.$inject = ['elektaService', '$interval', 'utilsService'];

function ElektaCtrl(elektaService, $interval, utilsService){

	var vm = this;
	
	vm.error = '';
	vm.account = '';
	vm.minutes = 0;
	vm.test1 = '';
	vm.test2 = '';
	vm.test3 = '';
	vm.test4 = '';
	vm.message1 = false;
	vm.message2 = false;
	vm.message3 = false;
	vm.message4 = false;

	vm.sumbitAnswer = sumbitAnswer;
	vm.startTime = startTime;
	vm.addAccount = addAccount;
	vm.initTime = initTime;

	function initTime(time){
		vm.minutes = Math.round((time / 60000));
		$interval(function() {
    		vm.minutes--;
    		if(vm.minutes <= 0){
				utilsService.redirectUrl('/welcome');
			}
  		}, 60000);
	}

	function sumbitAnswer(id, answer){
		if(id > 4 || id < 1 || answer === ''){
			return;
		}
		elektaService.sumbitAnswer(id, answer)
			.then(function(data){
				if(!utilsService.isErrorObject(data)){
                    switch(id){
                    	case 1:
                    		vm.message1 = true;
                    		break;
                    	case 2:
                    		vm.message2 = true;
                    		break;
                    	case 3:
                    		vm.message3 = true;
                    		break;
                    	case 4:
                    		vm.message4 = true;
                    		break;
                    }
                }
			},function(error){
				console.log(error);
			});
	}

	function startTime(account){
		if(account === ''){
			vm.error = 'please sign in your account!';
			return;
		}
		elektaService.startTime(account);
	}

	function addAccount(account){
		if(account === ''){
			vm.error = 'please sign in your account!';
			return;
		}
		elektaService.addAccount(account);
	}

}