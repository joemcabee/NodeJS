var Gpio = require('onoff').Gpio,
    photo = new Gpio(18, 'out'),
    sleep = require('sleep');

console.log('Starting');

photo.writeSync(0);

console.log('Wrote 0');

var sample = [0, 0, 0, 0, 0];
var index = 0,
    count = 0;

while (index < 5) {
    if (photo.readSync() == 0) {
        count++;

        if (count % 500000 == 0) {
            console.log('Reached ' + count);
        }
    }
    else {
        console.log('Sample ' + index + 1);
        console.log('Count: ' + count);

        photo.writeSync(0);

        console.log('Set back to 0');

        sample[index] = count;

        count = 0;
        index++;

        console.log('Else Complete');
    }
        
    // sleep.sleep(1); // sleep for X seconds
}

photo.unexport();