/**
 * Module dependencies.
 */

var http = require('http');
var path = require('path');
var relay = require('./relay');
var express = require('express');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(app.router);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//Begin REST functions

//PING
app.get('/ping/', function (req, res) {
    console.log('Relays ping GET');
    
    res.status(200).send();
});

//End REST functions

http.createServer(app).listen(app.get('port'), function () {
    console.log('Server listening on port ' + app.get('port'));
});
