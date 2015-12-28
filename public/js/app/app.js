(function(){
	angular.module('app', []);

	angular.module('app').constant('API_URL', 'http://www.wangqunxi.com/api/');
	//angular.module('app').constant('API_URL', 'http://localhost:3000/api/');
	

	angular.module('app').controller('NavHeaderCtrl', NavHeaderCtrl);
	NavHeaderCtrl.$inject = ['utilsService', 'authToken'];

	function NavHeaderCtrl(utilsService, authToken){
		var vm = this;
		vm.path = utilsService.getLocationPath();
		vm.isAuthenticated = authToken.isAuthenticated();
		vm.username = authToken.getCurrentUser() ? authToken.getCurrentUser().email : '';

		vm.logout = logout;
		vm.go2Account = go2Account;
		
		function logout(){
			authToken.removeCurrentUser();
			vm.isAuthenticated = false;
			utilsService.redirectUrl('login');
		}

		function go2Account(){

			var userId = authToken.getCurrentUser() ? authToken.getCurrentUser()._id :  '';
			console.log(userId);
			utilsService.redirectUrl('account');
			//utilsService.redirectUrl('account?userId=' + userId);
		}
		//console.log(vm.isAuthenticated, authToken.getToken());
	}

	
})();