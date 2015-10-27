var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var controllers = require('./controllers');

var app = express();

//setup bodyparser
app.use(bodyParser.json());

//setup CORS
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.set('SECRET_KEY', 'xxxx');

//setup the controller
controllers.init(app);

//connect to mongodb
var dbConnectionString = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/test';
mongoose.connect(dbConnectionString, function(err) {
    console.log(dbConnectionString);
    if (err)
        console.log('MongoDB: connection error ->' + err);
    else
        console.log('MongoDB connect successfully');
});

//create server
var server = http.createServer(app);

server.listen(process.env.PORT || 3000, function() {
    console.log("it is listening the port: " + server.address().port);
});