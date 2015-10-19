var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var controllers = require('./controllers');

var app = express();

//setup bodyparser
app.use(bodyParser.json());

//setup CORS
app.use(function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

//setup the controller
controllers.init(app);

app.get('/', function(req, res){
	res.send("hello world!!!");
});

//connect to mongodb
var mongodbConnection = 'mongodb://ds041164.mongolab.com:41164/heroku_dpdvxrnp';
mongoose.connect(mongodbConnection, function (err) { 
    if (err)
        console.log('MongoDB: connection error ->' + err);
    else
        console.log('MongoDB connect successfully');
});

//create server
var server = http.createServer(app);

//test
//var jwt = require('./services/jwtService.js');
//console.log(jwt.encode('hi', 'secret'));



//var TestSchema = new mongoose.Schema({
//    email: String,
//    password: String
//});

//var Test = mongoose.model('Test', TestSchema);

//var test = new Test();


server.listen(5000 || process.env.PORT, function () { 
    console.log("it is listening the port: " + server.address().port);
});
