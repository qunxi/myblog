(function(homeController) {

    
    homeController.init = function(app) {

        app.get('/', function(req, res) {
            res.render('index');
        });

        /*app.get('/index', function(req, res) {
            res.render('index');
        });*/

        app.get('/about', function(req, res){
        	res.render('about');
        });
    };

})(module.exports);