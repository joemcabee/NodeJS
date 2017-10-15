var sleep = require('sleep'),
    rpio = require('rpio');

module.exports = {
    readValue: function () {
        return getAverageReading();
    }
};

function getAverageReading() {
    // which analog pin to connect
    var PHOTOPIN = 0,
        // how many samples to take and average, more takes longer
        // but is more 'smooth'
        NUMSAMPLES = 3;

    var samples = [0, 0, 0];

    var i = 0;

    // take N samples in a row, with a slight delay
    for (i = 0; i < NUMSAMPLES; i++) {
        var analogValue = getAnalogValue(PHOTOPIN);
        samples[i] = analogValue;
        sleep.sleep(1); // sleep for X seconds
    }

    // average all the samples out
    var average = 0;

    for (i = 0; i < NUMSAMPLES; i++) {
        average += samples[i];
        console.log('Reading ' + (i + 1) + ': ' + samples[i]);
    }

    average /= NUMSAMPLES;

    console.log('Average analog reading: ' + average.toString());

    return average;
}

function getAnalogValue(channel) {
    rpio.spiBegin();

    // Prepare TX buffer [trigger byte = 0x01] [channel 0 = 0x80 (128)] [dummy data = 0x01]
    var sendBuffer = new Buffer([0x01, (8 + channel << 4), 0x01]);
    var rxbuf = new Buffer([0x00, 0x00, 0x00]);

    // Send TX buffer to SPI MOSI and recieve RX buffer from MISO
    var recieveBuffer = rpio.spiTransfer(sendBuffer, rxbuf, sendBuffer.length);

    var junk = rxbuf[0],
        MSB = rxbuf[1],
        LSB = rxbuf[2];

    var value = ((MSB & 3) << 8) + LSB;

    console.log('ch' + ((sendBuffer[1] >> 4) - 8), '=', value);

    return value;
}