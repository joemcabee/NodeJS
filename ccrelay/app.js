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

//GET
app.get('/relays/:pin', function (req, res) {
    console.log('Relays GET Start: ' + req.params.pin);

    var currentValue = relay.getValue(req.params.pin);

    console.log('Relays GET return value: ' + currentValue);

    var data = { value: currentValue };

    res.status(200).send(data);

    console.log('Relays GET End: ' + req.params.pin);
}); 

//POST - do specified action
app.post('/relays/:pin/:act/:arg', function (req, res) {
    console.log('Relays POST Start: ' + req.params.pin + ', ' + req.params.act);

    try {
        relay.doAction(req.params.pin, req.params.act, req.params.arg);
    }
    catch(ex) {
        console.log('Error: ', ex);
        res.status(500).send(ex);
    }
    
    res.status(200).send({ response: 'success' });

    console.log('Relays POST End: ' + req.params.pin + ', ' + req.params.act);
});

//PING
app.get('/ping/', function (req, res) {
    console.log('Relays ping GET');
    
    res.status(200).send();
});

//End REST functions

http.createServer(app).listen(app.get('port'), function () {
    console.log('Server listening on port ' + app.get('port'));
});
