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

        app.get('/login', function(req, res){
            res.render('account/login', {});
        });

        app.get('/register', function(req, res){
            res.render('account/login', {});
        });

        app.get('/account', function(req, res){
            res.render('account/account', {});
        });

        app.get('/changepassword', function(req, res){
            res.render('account/changePassword', {});
        });

        app.get('/subscribe', function(req, res){
            res.render('account/subscribe', {});
        });
    };

})(module.exports);