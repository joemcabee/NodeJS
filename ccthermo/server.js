// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var relay = require('./relay');
var fetchUrl = require("fetch").fetchUrl;

// Set up ccenviro client
var RestClient = require('node-rest-client').Client;
var enviroClient = new RestClient();

// registering remote methods 
enviroClient.registerMethod("getTemp", "http://192.168.0.204/api/temp", "GET");

// Set up logging
const opts = {
    errorEventName: 'error',
    logDirectory: '/logs',
    fileNamePattern: 'roll-<DATE>.log',
    dateFormat: 'YYYY.MM.DD'
};

const log = require('simple-node-logger').createSimpleLogger('ccenviro.log');

// set up thermostat variables and default values
var defaultMinimum = 68,
    defaultMaximum = 72,
    defaultNotHomeMinimum = 66,
    defafultNotHomeMaximum = 74,
    minimum = defaultMinimum,
    maximum = defaultMaximum,
    notHomeMinimum = defaultNotHomeMinimum,
    notHomeMaximum = defafultNotHomeMaximum,
    currentTemp = -100,
    systemOn = true,
    fanOn = false,
    interval = -100;

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
    log.info('Request received:', req);
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({ message: 'Server is running...' });
});

// on routes that end in /bears
// ----------------------------------------------------
router.route('/minimum/:min_value')
    .get(function (req, res) {
        log.info('Minimum GET Start');

        try {
            res.status(200).send(minimum);
        }
        catch (ex) {
            log.error(ex);
            res.status(500).send(ex);
        }

        log.info('Minimum GET End');
    })
    .post(function (req, res) {
        log.info('Minimum POST Start');

        try {
            minimum = req.params.min_value;

            res.status(200).send();
        }
        catch (ex) {
            log.error(ex);
            res.status(500).send(ex);
        }

        log.info('Minimum POST End');
    });

router.route('/maximum/:max_value')
    .get(function (req, res) {
        log.info('Maximum GET Start');

        try {
            res.status(200).send(maximum);
        }
        catch (ex) {
            log.error(ex);
            res.status(500).send(ex);
        }

        log.info('Maximum GET End');
    })
    .post(function (req, res) {
        log.info('Maximum POST Start');

        try {
            maximum = req.params.max_value;

            res.status(200).send();
        }
        catch (ex) {
            log.error(ex);
            res.status(500).send(ex);
        }

        log.info('Maximum POST End');
    });

router.route('/system/:on_or_off')
    .get(function (req, res) {
        log.info('System GET Start');

        try {
            res.status(200).send(systemOn);
        }
        catch (ex) {
            log.error(ex);
            res.status(500).send(ex);
        }

        log.info('System GET End');
    })
    .post(function (req, res) {
        log.info('System POST Start');

        try {
            if (req.params.on_or_off == 1) {
                // start up system only if it's currently off
                if (systemOn == false) {
                    systemOn = true;
                    interval = setInterval(run(), 60000);
                }
            }
            else {
                // interval should take care of shutting things down
                systemOn = false;
            }

            res.status(200).send();
        }
        catch (ex) {
            log.error(ex);
            res.status(500).send(ex);
        }

        log.info('System POST End');
    });

router.route('/fan/:on_or_off')
    .get(function (req, res) {
        log.info('Fan GET Start');

        try {
            res.status(200).send(fanOn);
        }
        catch (ex) {
            log.error(ex);
            res.status(500).send(ex);
        }

        log.info('Fan GET End');
    })
    .post(function (req, res) {
        log.info('Fan POST Start');

        try {
            if (req.params.on_or_off == 1) {
                fanOn = true;
            }
            else {
                fanOn = false;
            }

            res.status(200).send();
        }
        catch (ex) {
            log.error(ex);
            res.status(500).send(ex);
        }

        log.info('Fan POST End');
    });

router.route('/ping')
    .get(function (req, res) {
        log.info('Ping GET Start');
        res.status(200).send();
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
log.info('Server listening on port ' + port);

// start the program and check temp every minute
interval = setInterval(run(), 60000);

function run() {
    if (systemOn) {
        client.methods.getTemp(function (data, response) {
            // parsed response body as js object 
            log.info(data);

            currentTemp = data.fahrenheit;

            // Something is not right
            if (currentTemp < 50 || currenTemp > 99) {
                log.error('Invalid temp ', currentTemp);
            }
            // Too cold
            else if (currenTemp < minimum) {
                relay.turnOnHeat();
            }
            // Too hot
            else if (currentTemp > maximum) {
                relay.turnOnCool();
            }
            // Keep the fan going
            else if (fanOn) {
                relay.turnOnFan();
            }
            // Just right
            else {
                relay.turnOnFan();
            }
        });
    }
    else {
        // Shut the system down
        relay.turnOffSystem();
        // Clear the interval
        clearInterval(interval);
    }
}