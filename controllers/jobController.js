(function(jobController) {

	var jobService = require('../services/jobService.js');
	var utilsService = require('../services/utilsSrv.js');
    jobController.init = function(app) {

        app.get('/api/jobs', function(req, res) {

        	var query = req.query.query;
        	var city = req.query.city;
            var page = req.query.page;
            var limit = req.query.limit;
            jobService.getJobsFromBaidu(query, city, page, limit)
            		  .then(function(data){
            		  	console.log(data);
            		  	if(utilsService.isErrorObject(data)){
            		  		return utilsService.failedResponse(res, data);
            		  	}
            		  	console.log(data);
            		  	return utilsService.successResponse(res, data);
            		  });
        });

    };
})(module.exports);