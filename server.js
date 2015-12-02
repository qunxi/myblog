var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var ejsLayouts = require("express-ejs-layouts");

var appConfig = require('./appConfig.js');

var app = express();

//setup bodyparser
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(ejsLayouts);
app.set("layout extractScripts", true);

//setup the configuration
appConfig.bootstrapWeb(app);


//create server
var server = http.createServer(app);

server.listen(process.env.PORT || 3000, function() {
    console.log("it is listening the port: " + server.address().port);
});