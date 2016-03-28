(function(elektaController) {

    var elektaService = require('../services/elektaService.js');
    var utilsSrv = require('../services/utilsSrv.js');

    elektaController.init = function(app) {

        app.post('/api/elekta/starttime', function(req, res){

            var name = req.body.account;
            
            return elektaService.signIn(name)
                .then(function(data){
                    console.log(data);
                   return utilsSrv.httpResponse(res, data);
                }, function(error){
                     console.log(error);
                    return utilsSrv.httpResponse(res, error);
                });
        });

        app.post('/api/elekta/addAccount', function(req, res){
            var name = req.body.account;
            return elektaService.addTester(name)
                .then(function(data){
                }, function(error){
                });
        });


        app.post('/api/elekta/answer', function(req, res){
            var id = req.body.id;
            var answer = req.body.answer;
            var userId = req.body.userId;
            var name = req.body.username;
           
            return elektaService.submitAnswer(id, answer, userId, name)
                            .then(function(data){
                                return utilsSrv.httpResponse(res, data);
                            }, function(error){
                                return utilsSrv.httpResponse(res, error);
                            });
        });

    };
})(module.exports);