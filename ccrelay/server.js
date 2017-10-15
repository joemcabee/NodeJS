// BASE SETUP
// =============================================================================

// call the packages we need
var express     = require('express');        // call express
var app         = express();                 // define our app using express
var bodyParser  = require('body-parser');
var relay       = require('./relay');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// on routes that end in /bears
// ----------------------------------------------------
router.route('/relays/:pin/:act/:arg')
    // create a bear (accessed at POST http://localhost:3000/api/bears)
    .post(function(req, res) {
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
    
router.route('/ping')
    .get(function(req, res) {
        res.status(200).send();
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
console.log('Magic happens on port ' + port);
