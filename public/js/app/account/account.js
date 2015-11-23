angular.module('app').controller('LoginCtrl', LoginCtrl);
LoginCtrl.$inject = ['AccountService'];

function LoginCtrl(AccountService){
	var vm = this;

	vm.email = '';
	vm.password = '';
}


angular.module('app').controller('RegisterCtrl', RegisterCtrl);
RegisterCtrl.$inject = ['AccountService'];

function RegisterCtrl(AccountService){
	var vm = this;
	vm.email = '';
	vm.password1 = '';
	vm.passwrod2 = '';
	vm.captcha = '';

	//vm.checkPasswordsEqual = AccountService.checkPasswordsEqual();
	//vm.checkPassword = AccountService.checkPassword();
	///vm.checkEmail = AccountService.checkEmail();
}


angular.module('app').factory('AccountService', AccountService);
AccountService.$inject = [];

function AccountService(){
	var service = {
		/*checkPassword: checkPassword,
		checkEmail: checkEmail,
		checkPasswordsEqual: checkPasswordsEqual*/
	};

	return service;



    


}

