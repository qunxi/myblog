(function(stockController) {

    stockController.init = function(app) {

        var httpRequest = require('../services/httpRequestSrv.js');

        app.get('/api/stock', function(req, res) {
            var params = req.body;
            var url = 'http://m.shukugang.com/hqservice/financeData/queryMarket';

            request(url, params, res);
        });


        app.get('/api/stocks/search', function(req, res) {

            var params = req.query;
            var url = 'http://m.shukugang.com/stock/search';

            httpRequest.request(url, params)
                .then(function(data) {
                    var jsonData = JSON.parse(data);
                    res.status(200).send(jsonData);
                }, function(error) {
                    console.log(error);
                    res.status(400).send(error);
                });
        });


        //private 
        function request(url, params, res) {
            httpRequest.request(url, params, function(data) {
                var jsonData = JSON.parse(data);
                if (jsonData.error) {
                    res.status(400).send(jsonData);
                    console.log(jsonData);
                } else {
                    res.status(200).send(jsonData);
                    console.log(jsonData);
                }
            });
        }
    };


})(module.exports);