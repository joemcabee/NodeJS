var sleep = require('sleep'),
    rpio = require('rpio');

module.exports = {
    readValue: function () {
        return getLightReading();
    }
};

function getLightReading() {
    return 0;
}