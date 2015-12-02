(function(mailVerification){

	var nodemailer = require('nodemailer');
	var jwt = require('jwt-simple');
	var smtpTransport = require('nodemailer-smtp-transport');
	var User = require('../models/user.js');
	var Q = require('q');

	var SECRET_KEY = 'mailxx';
	var verificationUrl = 'http://www.wangqunxi.com/verification?email=';
	//var verificationUrl = 'http://localhost:3000/verification?email=';

	mailVerification.sendMail = sendMail;
	mailVerification.verifyMail = verifyMail;

	function generateMailTemplate(email, link){
		var htmlTemplate = 
			'<div><p>你好！</p>' +
			'<p>感谢你注册xxxx。</p>' +
			'<p>你的登录邮箱为&nbsp;' + email +
			'&nbsp;请点击以下链接激活帐号：</p>' +
			'<a style="color:green" href="' + link + '">' + link + '</a>' +
			'<p>如果以上链接无法点击，请将上面的地址复制到你的浏览器(如Chorme,Firefox, IE)的地址栏进入xxxx。 （该链接在48小时内有效，48小时后需要重新注册）'+
			'</p></div>';
		return htmlTemplate;
	}

	function sendMail(email, userId){

		var deferred = Q.defer();

		transporter.sendMail({
		    from: 'helloprogrammer@aliyun.com',
		    to: email, 
		    subject: '请激活你的帐号',
		    html: generateMailTemplate(email, getTokenLink(userId))
		}, function (error, info) {
		    if(error){
		    	console.log(error);
		        deferred.reject({
		        	error: 'send mail failed please check with the administrat'
		        }); 
		        
		    }else{
		        deferred.resolve({
		        	message: 'send mail successfully'
		        });
		    }
		    transporter.close();
		    return deferred.promise;
		});
	}

	function getTokenLink(userId){
		var token = createMailToken(userId);
		return verificationUrl + token;
	}

	function createMailToken(userId){
		var today = new Date();
		var tomorrow = today.setDate(today.getDate() + 1); 
		
		var payload = {
            expire: tomorrow,
            sub: userId
        };
        return jwt.encode(payload, SECRET_KEY);
	}

	function verifyMail(token){
		var payload = null;
		var deferred = Q.defer();

		try{
			payload = jwt.decode(token, SECRET_KEY);
		}
		catch(error){
			deferred.reject({
            	error: 'mail verification failed'
        	});
        	return deferred.promise;
		}
       
        return User.findUserById(payload.sub)
            .then(function(data) {
                if (!data) {
                    return {
                    	error: 'mail verification failed'
                    };
                }
                data.actived = true;
                return data.save()
		                   .then(function(data){
		                		return data;
		                	}, function(error){
		                		return {
		                			error: 'set actived flag failed'
		                		};
		                	});
                
            }, function(error) {
                return {
                	error: error
                };
            });
	}

	var config = {
		/*host: 'smtp.126.com',
		secure: true,
		port: 465,
		auth:{
			user: 'helloprogrammer@126.com',
			pass: '****'
		}*/
		//service: '163',
		/*auth:{
			user: 'wangqx85@163.com',
			pass: 'xxxxx'
		}*/
		/*host: 'smtp.163.com',
		secure: true,
		port: 465,
		auth:{
			user: 'wangqx85@163.com',
			pass: 'xxxxx'
		}*/
		// aliyun config
		host: 'smtp.aliyun.com',
		secure: true,
		port: 465,
		auth:{
			user: 'helloprogrammer@aliyun.com',
			pass: 'Elekta1985'
		}
	};

	var transporter = nodemailer.createTransport(smtpTransport(config));

})(module.exports);