(function(authenticateService){

	var jwtSrv = require('jwt-simple');
	
	var User = require('../models/user.js');

	authenticateService.verification = function(token, SECRET_KEY){
		var payload = jwtSrv.decode(token, SECRET_KEY);

		return User.findUserById(payload.sub)
					.then(function(data){	
						return data;
					}, function(error){
						
						return {
							error: error,
							message: 'authenticate occur a problem'
						};
					});
	};


})(module.exports);