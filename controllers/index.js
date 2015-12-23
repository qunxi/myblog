(function (controllers) {
    
    var homeCtrl = require('./homeController.js');
	var subscribeCtrl = require('./subscribeController.js');
	var postCtrl = require('./postController.js'); 

    controllers.init = function (app) {
        homeCtrl.init(app);   
        subscribeCtrl.init(app);
        postCtrl.init(app);
    };   

})(module.exports);