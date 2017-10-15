// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var temp = require('./temp');
var light = require('./photo');

// Set up logging
const opts = {
    errorEventName:'error',
    logDirectory:'/logs',
    fileNamePattern:'roll-<DATE>.log',
    dateFormat:'YYYY.MM.DD'
};

const log = require('simple-node-logger').createSimpleLogger('ccenviro.log');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    // console.log('Something is happening.');
    log.info('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// on routes that end in /bears
// ----------------------------------------------------
router.route('/light')
    .get(function (req, res) {
        // console.log('Light GET Start');
        log.info('Light GET Start');

        try {
            var reading = light.readValue();
            // console.log(reading);
            log.info('light reading: ', reading);
            res.status(200).send({ photo: reading });
        }
        catch (ex) {
            // console.log('Error: ', ex);
            log.error(ex);
            res.status(500).send(ex);
        }

        // console.log('Light GET End');
        log.info('Light GET End');
    });

router.route('/temp')
    .get(function (req, res) {
        // console.log('Temp GET Start');
        log.info('Temp GET Start');

        try {
            var reading = temp.getLatestTemperature();

            log.info('latest temperature: ', reading);

            res.status(200).send(reading);
        }
        catch (ex) {
            // console.log('Error: ', ex);
            log.error(ex);
            res.status(500).send(ex);
        }

        // console.log('Temp GET End');
        log.info('Temp GET End');
    });

router.route('/ping')
    .get(function (req, res) {
        // console.log('Ping GET Start');
        log.info('Ping GET Start');
        res.status(200).send();
        // console.log('Ping GET End');
        log.info('Ping GET End');
    });

// router.route('/bears/:bear_id')
//     // get the bear with that id (accessed at GET http://localhost:3000/api/bears/:bear_id)
//     .get(function(req, res) {
//         Bear.findById(req.params.bear_id, function(err, bear) {
//             if (err)
//                 res.send(err);
//             res.json(bear);
//         });
//     });

// more routes for our API will happen here
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
log.info('App listening on port ' + port);

log.info('Begin initial temperature update');
temp.updateTemperatureValue();
temp.scheduleTemperatureUpdate();