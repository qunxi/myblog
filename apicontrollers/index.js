(function (apicontrollers) {
    
    var userCtrl = require('./userController.js');
    var homeCtrl = require('./homeController.js');
    var stockCtrl = require('./stockController.js');
    var rssCtrl = require('./rssController.js');
    var contractCtrl = require('./contractController.js');
    var jobCtrl = require('./jobController.js');
    var bookCtrl = require('./bookController.js');
    var accountCtrl = require('./accountController.js');
    var postCtrl = require('./postController.js');

    apicontrollers.init = function (app) {
        userCtrl.init(app);
        homeCtrl.init(app);   
        stockCtrl.init(app);
        rssCtrl.init(app);
        jobCtrl.init(app);
        bookCtrl.init(app);
        contractCtrl.init(app);
        accountCtrl.init(app);
        postCtrl.init(app);
    };   

})(module.exports);