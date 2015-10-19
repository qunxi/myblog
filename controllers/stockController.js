(function(stockController){

	stockController.init = function(app){

		var httpRequest = require('../services/httpRequestService.js');

		app.get('/api/stock', function(req, res){
			var params = req.body;
			var url = 'http://m.shukugang.com/hqservice/financeData/queryMarket';

			request(url, params, res);
		});


		app.get('/api/stocks/search', function(req, res){

			var params = req.query;
			var url = 'http://m.shukugang.com/stock/search';

			httpRequest.request(url, params)
				.then(function(data){
					var jsonData = JSON.parse(data);
					res.status(200).send(jsonData);
				}, function(error){
					res.status(400).send(error);
				});
		}).listen(app.get('port'), function() {
    		console.log('App is running, server is listening on port ', app.get('port'));
		});


		//private 
		function request(url, params, res){
			httpRequest.request(url, params, function(data){
				var jsonData = JSON.parse(data);
				if(jsonData.error){
					res.status(400).send(jsonData);
					console.log(jsonData);
				}
				else{
					res.status(200).send(jsonData);
					console.log(jsonData);
				}
			});
		}
	};


})(module.exports);