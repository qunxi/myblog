(function (controllers) {
    
    var userCtrl = require('./userController.js');
    var homeCtrl = require('./homeController.js');
    var stockCtrl = require('./stockController.js');
    var rssCtrl = require('./rssController.js');

    controllers.init = function (app) {
        userCtrl.init(app);
        homeCtrl.init(app);   
        stockCtrl.init(app);
        rssCtrl.init(app);
    };   

})(module.exports);