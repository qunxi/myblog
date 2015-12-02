(function (controllers) {
    
    var homeCtrl = require('./homeController.js');
	var subscribeCtrl = require('./subscribeController.js');    

    controllers.init = function (app) {
        homeCtrl.init(app);   
        subscribeCtrl.init(app);
    };   

})(module.exports);