var Gpio = require('onoff').Gpio,
    swtch = new Gpio(26, 'out');

var initialValue = swtch.readSync();

console.log('Initial Value: ' + initialValue);

swtch.writeSync(initialValue ^ 1);

var secondValue = swtch.readSync();

console.log('Second Value: ' + secondValue);
    
swtch.unexport();