(function (homeController) {

  	//var stockService = require('../services/stockService.js');
    //var rssParseService = require('../services/feedsRequestSrv.js');

    homeController.init = function(app) { 
    	

    	app.get('/', function(req, res){

            res.status(200).send("hello world!!!");

    		/*rssParseService.requestRssResource("http://www.people.com.cn/rss/politics.xml", function(data){
                res.status(200).send(data);
            });*/
    	});
    
    };
})(module.exports);