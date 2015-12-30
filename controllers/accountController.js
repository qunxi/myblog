(function(accountController) {

    var utils = require('../services/utilsSrv.js');
    var account = require('../services/accountService.js');

    accountController.init = function(app) {

        app.get('/login', function(req, res) {
            res.render('account/login', {});
        });

        app.get('/register', function(req, res) {
            res.render('account/login', {});
        });

         app.get('/account', function(req, res) {
            res.render('account/account', {});
        });

        /*app.get('/account', function(req, res) {
            var userId = req.query.userId;
            
            account.getUserAccount(userId)
                   .then(function(data){
                        //console.log(data);
                        user = data.data;
                        return res.render('account/account', {
                            account: {
                                id: user._id,
                                realName: !user.realName ? '' : user.realName,
                                userName: !user.username ? '' : user.username,
                                email: user.email,
                                mobilePhone: !data.mobilePhone ? '' : user.mobilePhone,
                                address: !user.address ? '' : user.address,
                                sex: !user.sex ? 2 : user.sex,
                                blog: !user.blog ? '' : user.blog,
                                github: !user.github ? '' : user.github,
                                description: !user.description ? '' : user.description,
                                published: !user.published ? 0 : user.published
                            }
                        });
                   }, function(error){
                        return utils.webErrorRender(res, error);
                   });
        });*/

        app.get('/changepassword', function(req, res) {
            res.render('account/changePassword', {});
        });

        app.get('/favorposts', function(req, res){
            res.render('account/favorposts', {});
        });
    };

})(module.exports);