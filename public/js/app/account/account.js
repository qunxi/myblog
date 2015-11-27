angular.module('app').controller('LoginCtrl', LoginCtrl);
LoginCtrl.$inject = ['AccountService', 'UtilsService'];

function LoginCtrl(AccountService, UtilsService){
	var vm = this;

	vm.email = '';
	vm.password = '';
	vm.failed = false;
	vm.showLogin = UtilsService.getLocationPath() === '/login';

	vm.login = login;

	function login(){
		
		if(!vm.email || !vm.password){
			return false;
		}
		if(!AccountService.checkEmail(vm.email) || !AccountService.checkPassword(vm.password)){
			return false;
		}

		AccountService.login(vm.email, vm.password)
					.then(function(data){
						if(UtilsService.isErrorObject(data)){
							console.log('ddd');
							vm.failed = true;
						}else{
							UtilsService.redirectUrl('/about');
						}
					});
					
	}
	//console.log(vm.showLogin);
}


angular.module('app').controller('RegisterCtrl', RegisterCtrl);
RegisterCtrl.$inject = ['AccountService', 'UtilsService'];

function RegisterCtrl(AccountService, UtilsService){
	var vm = this;
	vm.email = '';
	vm.password1 = '';
	vm.password2 = '';
	vm.captcha = '';

	vm.showRegister =  UtilsService.getLocationPath() === '/register';

	vm.register = register;

	function register(){
		if(!vm.email || !vm.password1 || !vm.password2 || !vm.captcha){
			return false;
		}
		if(!AccountService.checkEmail(vm.email) || !AccountService.checkPassword(vm.password1) ||
		   !AccountService.checkPasswordsEqual(vm.password1, vm.password2) ||
		   !AccountService.checkCaptcha(vm.captcha)){
			return false;
		}
		//console.log(vm.email, vm.password1, vm.passwrod2);
		AccountService.register(vm.email, vm.password1);
	}
}


angular.module('app').factory('AccountService', AccountService);
AccountService.$inject = ['$http', 'API_URL'];

function AccountService($http, API_URL){
	var service = {
		checkPassword: checkPassword,
		checkEmail: checkEmail,
		checkCaptcha: checkCaptcha,
		checkPasswordsEqual: checkPasswordsEqual,
		login: login,
		register: register
	};

	return service;

    function checkPassword(password) {
        var reg = new RegExp('^[\\W\\w]{6,15}$', 'g');
        console.log(password);
        //console.log(!!password);
        return reg.test(password); // || (!password);
    }

    function checkPasswordsEqual(password1, password2) {
    	console.log('eq');
        return password1 === password2 && !!passwrod2 && !!password1; // || (!password2);
    }

    function checkEmail(email) {
        var reg = new RegExp('^[a-z]([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?$',
            'g');
        return reg.test(email); // || (!email);
    }

    function checkCaptcha(captcha) {
        var reg = new RegExp('^[A-Za-z0-9]{4}$', 'gi');
        return reg.test(captcha); // || (!captcha);
    }

    function register(email, password){

    }

    function login(email, password){
    	return $http.post(API_URL + 'login', {
    		username: email,
    		password: password
    	}).then(function(res){
    		return res.data;
    	}, function(res){
    		if(res.status == 401){
    			return {
    				error: '您登录的用户名或密码不正确'
    			};
    		}
    		else{
    			return {
    				error: '网络或服务器发生异常，请与管理员联系'
    			};
    		}
    	});
    }
}

