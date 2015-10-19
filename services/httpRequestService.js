(function(httpRequestService){
	'use strict';

	var http = require('http');
	var querystring = require('querystring');
	var Q = require('q');
	//http://m.shukugang.com/hqservice/financeData/queryMarket?code=300059&mode=daily&dt=&incr=0

	httpRequestService.request = function(url, params){
		var parseUrl = require('url').parse(url, true);
		var query = querystring.stringify(params);
		
		var opt = {
			method: 'GET',
			host: parseUrl.hostname,
			path: parseUrl.path + (!!params ?  '?' + query : ''),
			port: parseUrl.port
			
		};
		

		var deferred = Q.defer();
		var req = http.request(opt, function(res){
			
			var result = '';
			res.setEncoding('utf8');

			res.on('data', function(chunk){
				result += chunk;
			});
			res.on('end', function(){
				deferred.resolve(result);
			});
		});

		req.on('error', function(e){
			console.log('problem with request: ' + e.message);
			deferred.reject(new Error('e.message'));
		});

		//req.write(query);
		req.end();
		return deferred.promise;
	};


	/*stockService.getStocksInfo = function(params, res){
		var url = 'http://m.shukugang.com/hqservice/financeData/queryMarket';
		
		return get(url, params, res);
	};*/


})(module.exports);