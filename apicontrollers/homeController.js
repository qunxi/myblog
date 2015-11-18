(function(homeController) {

    var jobService = require('../services/jobService.js');
    var utilsService = require('../services/utilsSrv.js');
    var rssRequest = require('../services/rssRequestSrv.js');

    homeController.init = function(app) {

        /*app.get('/', function(req, res) {
            res.status(200).send("hello world!!!");
        });*/

        app.get('/api/posts', function(req, res){

            var page = req.query.page;
            var limit = req.query.limit;

            rssRequest.requestAllRssPosts(page, limit)
                      .then(function(data){
                            if(utilsService.isErrorObject(data)){
                                return utilsService.failedResponse(res, data);
                            }
                            return utilsService.successResponse(res, data);
                      });
        });

        app.get('/api/favorJobs', function(req, res){

            var query = '软件开发';
            var city = '上海';
            var page = 0;
            var limit = 5;

            jobService.getJobsFromBaidu(query, city, page, limit)
                      .then(function(data){
                       
                        if(utilsService.isErrorObject(data)){
                            return utilsService.failedResponse(res, data);
                        }
                        return utilsService.successResponse(res, data);
                      });
        });

    };
})(module.exports);