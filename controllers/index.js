(function (controllers) {
    
    
    var homeCtrl = require('./homeController.js');
    

    controllers.init = function (app) {
        
        homeCtrl.init(app);   
        
    };   

})(module.exports);