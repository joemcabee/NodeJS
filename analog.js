var rpio = require('rpio');

function getValue(channel) {
    rpio.spiBegin();

    // Prepare TX buffer [trigger byte = 0x01] [channel 0 = 0x80 (128)] [dummy data = 0x01]
    var sendBuffer = new Buffer([0x01, (8 + channel << 4), 0x01]);
    var rxbuf = new Buffer([ 0x00, 0x00, 0x00 ]);

    // Send TX buffer to SPI MOSI and recieve RX buffer from MISO
    var recieveBuffer = rpio.spiTransfer(sendBuffer, rxbuf, sendBuffer.length);

    var junk = rxbuf[0],
        MSB = rxbuf[1],
        LSB = rxbuf[2];

    var value = ((MSB & 3) << 8) + LSB;

    console.log('ch' + ((sendBuffer[1] >> 4) - 8), '=', value);
    
    return value;
}
