var sleep = require('sleep'),
    PythonShell = require('python-shell'),
    _celsius  = -1,
    _fahrenheit = -1,
    _lastCheck = null;

module.exports = {
    updateTemperatureValue: function () {
        runPythonScript();
    },
    getLatestTemperature: function () {
        return { 'celsius': _celsius, 'fahrenheit': _fahrenheit,  'timestamp': _lastCheck };
    },
    scheduleTemperatureUpdate: function() {
        scheduleRun();
    }
};

function scheduleRun() {
    setTimeout(function() {
        console.log('begin scheduled temperature update');
        runPythonScript();
        scheduleRun();
    }, 60000);
}

function runPythonScript() {
    var temp = -1;
    
    var options = {
        mode: 'text',
        scriptPath: '/home/pi/apps/python/enviro/scripts'
    };

    PythonShell.run('read_temperature.py', options, function (err, results) {
        console.log('python script complete');

        // Throw error from python script execution
        if (err) throw err;

        // results is an array consisting of messages collected during execution 
        console.log('python script results: %j', results);

        _celsius = results[0];
        _fahrenheit = convertCelsiusToFahrenheit(_celsius);
        _lastCheck = new Date();
    });
}

function convertCelsiusToFahrenheit(celsius){
    return (celsius * (9 / 5 )) + 32;
}