var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

var appConfig = require('./appConfig.js');

var app = express();

//setup bodyparser
app.use(bodyParser.json());



//setup the configuration
appConfig.bootstrapWeb(app);


//create server
var server = http.createServer(app);

server.listen(process.env.PORT || 3000, function() {
    console.log("it is listening the port: " + server.address().port);
});