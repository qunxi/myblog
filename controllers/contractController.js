(function(contractController) {

    contractController.init = function(app) {

        var authenticate = require('../services/authenticateSrv.js');
        var utils = require('../services/utilsSrv.js');
        var SECRET_KEY = app.get('SECRET_KEY');
        var logger = app.get('appLogger');
        var Feedback = require('../models/feedback.js');

        app.post('/api/contract/feedback', function(req, res) {
            var rssParams = req.body;

            var token = rssParams.token;
            var message = rssParams.message;

            authenticate.verification(token, SECRET_KEY)
                        .then(function(user){

                            if(utils.isErrorObject(user)){
                                logger.error('token ' + token + 'verification failed #error# ' + user);
                                return  utils.authenticateFailed(res, user);
                            }

                            var feedback = new Feedback({
                                    userId: user._id,
                                    message: message});

                            feedback.save()
                                    .then(function(data){
                                        return utils.successResponse(res, data);
                                    }, function(error){
                                        return utils.failedResponse(res, {
                                            error: error,
                                            message: 'save rssCatelog occurs a problem'
                                        });
                                    });
                        });
        });

    };
})(module.exports);