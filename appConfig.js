(function(appConfig){

var log4js = require('log4js');
var mongoose = require('mongoose');
    var controllers = require('./controllers');

    appConfig.bootstrapSchedule = function() {
        setupMongoDb();
        setupLogger();
    };

    appConfig.getScheduleLogger = function(){
        return log4js.getLogger('schedule');
    };

    appConfig.bootstrapWeb = function(app){
        //setup CORS
        setupCors(app);
        //setup SECRET_KEY
        app.set('SECRET_KEY', 'xxxx');
        //setup logger
        setupLogger(); 
        app.set('appLogger', log4js.getLogger('app'));
        //setup the controller
        controllers.init(app);
        //setup mongodb
        setupMongoDb();
};
    function setupCors(app){
       app.use(function(req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
       });
    }


    function setupLogger() {
    log4js.configure({
            appenders: [{
                type: 'console'
            }, {
                type: 'file',
                filename: __dirname + '/logs/app.log',
                category: 'app'
            }, {
                type: 'file',
                filename: __dirname + '/logs/schedule.log',
                category: 'schedule'
            }]
    });

}


function setupMongoDb(){
	var connectString = process.env.MONGOLAB_URI ||
    					process.env.MONGOHQ_URL ||
    					'mongodb://localhost/test';

    mongoose.connect(connectString);

    mongoose.connection.on('connected', function(){
    	console.log('Mongoose default connection open to ' + connectString);
    });

    mongoose.connection.on('error', function(err){
    	console.log('Mongoose default connection error: ' + err);
    });

    mongoose.connection.on('disconnected', function(){
    	console.log('Mongoose default connection disconnected');
    });

    process.on('SIGINT', function(){
    	mongoose.connection.close(function(){
    		console.log('Mongoose default connection disconnected throught app terminations');
    		process.exit(0);
    	});
    });
}





})(module.exports);