var sleep = require('sleep'),
    rpio = require('rpio');

module.exports = {
    readValues: function () {
        return tryTMP();
    }
};

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

function tryTMP() {
    // which analog pin to connect
    var THERMISTORPIN = 7,
        NUMSAMPLES = 1;

    var samples = [0];

    var i = 0;

    // take N samples in a row, with a slight delay
    for (i = 0; i < NUMSAMPLES; i++) {
        var analogValue = getAnalogValue(THERMISTORPIN);
        samples[i] = analogValue;
        //sleep.sleep(1); // sleep for X seconds
    }

    var average = 0;

    for (i = 0; i < NUMSAMPLES; i++) {
        average += samples[i];
        console.log('Reading ' + (i + 1) + ': ' + samples[i]);
    }

    average /= NUMSAMPLES;

    console.log('Average analog reading: ' + average.toString());

    var millivolts = average * (3300.0 / 1023.0);
    var temp_c = ((millivolts - 100.0) / 10.0) - 40.0;
    var temp_f = (temp_c * 9.0 / 5.0) + 32;

    temp_c = Math.round(temp_c);
    temp_f = Math.round(temp_f);

    console.log('Temp ' + temp_c + ' *C');
    console.log('Temp ' + temp_f + ' *F');

    return { C: temp_c, F: temp_f };
}
