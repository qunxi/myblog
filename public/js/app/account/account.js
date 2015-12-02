angular.module('app').controller('LoginCtrl', LoginCtrl);
LoginCtrl.$inject = ['accountService', 'utilsService', 'authToken'];

function LoginCtrl(accountService, utilsService, authToken){
	var vm = this;

	vm.email = '';
	vm.password = '';
	vm.failed = false;
	vm.showLogin = utilsService.getLocationPath() === '/login';

	vm.login = login;

	function login(){
		
		if(!vm.email || !vm.password){
			return false;
		}
		if(!accountService.checkEmail(vm.email) || !accountService.checkPassword(vm.password)){
			return false;
		}

		accountService.login(vm.email, vm.password)
					.then(function(data){
						console.log(data);
						if(utilsService.isErrorObject(data)){
							
							vm.failed = true;
						}else{
							authToken.setCurrentUser(data);
							utilsService.redirectUrl('/');
						}
					});
					
	}
	//console.log(vm.showLogin);
}


angular.module('app').controller('RegisterCtrl', RegisterCtrl);
RegisterCtrl.$inject = ['accountService', 'utilsService'];

function RegisterCtrl(accountService, utilsService){
	var vm = this;
	vm.email = '';
	vm.password1 = '';
	vm.password2 = '';
	vm.captcha = '';

	vm.showRegister =  utilsService.getLocationPath() === '/register';

	vm.register = register;

	function register(){
		
		if(!vm.email || !vm.password1 || !vm.password2 /*|| !vm.captcha*/){
			return false;
		}
		if(!accountService.checkEmail(vm.email) || !accountService.checkPassword(vm.password1) ||
		   !accountService.checkPasswordsEqual(vm.password1, vm.password2) /*||
		   !accountService.checkCaptcha(vm.captcha)*/){
			return false;
		}
	
		accountService.register(vm.email, vm.password1)
					.then(function(data){
						if(utilsService.isErrorObject(data)){
							console.log(data);
							utilsService.redirectUrl('/');
							//vm.failed = true;
						}else{
							utilsService.redirectUrl('/login');
						}
					});
	}
}


angular.module('app').factory('accountService', accountService);
accountService.$inject = ['$http', 'API_URL'];

function accountService($http, API_URL){
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
        
        //console.log(!!password);
        return reg.test(password); // || (!password);
    }

    function checkPasswordsEqual(password1, password2) {
        return password1 === password2 && !!password2 && !!password1; // || (!password2);
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
    	
    	return $http.post(API_URL + 'register', {
    		email: email,
    		password: password
    	}).then(function(res){
    		//console.log(res.data);
    		return res.data;
    	}, function(res){
    		//console.log(res.data);
    		return {
    			error: res.data
    		};
    	});
    }

    function login(email, password){
    	return $http.post(API_URL + 'login', {
    		email: email,
    		password: password
    	}).then(function(res){
    		console.log(res.data);
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

