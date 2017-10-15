var Gpio = require('onoff').Gpio;
var locked = [];

module.exports = {
    doAction: function(pin, action, arg) {
        if (action == 'flipValue') {
            // flipValueWithLock(pin);
        }
        else if (action == 'flipValueWithTimeout') {
            flipValueWithTimeout(pin, arg);
        }
    },
    getValue: function (device) {
        // console.log('relay.js -> getValue: ' + device);
        // var gpio;

        // if (device == 'LeftGarageDoor') {
        //     gpio = leftGargageDoor;
        // }
        // else if (device == 'RightGarageDoor') {
        //     gpio = rightGarageDoor;
        // }
        // else if (device == 'InteriorGarageLights') {
        //     gpio = interiorGarageLights;
        // }
        // else if (device == 'ExteriorLights') {
        //     gpio = exteriorLights;
        // }

        // if (gpio == null) {
        //     console.log('Could not find device "' + device + '".');
        //     return null;
        // }
        // else {
        //     var value = gpio.readSync();
        //     console.log('Device "' + device + '" has current value of "' + value + '".');
        //     return gpio.readSync();
        // }
    },
    changeValue: function (device) {
        var gpio;
        
        if (device == 'InteriorGarageLights') {
            gpio = new Gpio(24, 'high');
            // gpio.lock = false;
            flipValueWithLock(device, gpio);
        }
        else if (device == 'ExteriorLights') {
            gpio = new Gpio(24, 'high');
            // gpio.lock = false;
            flipValueWithLock(device, gpio);
        }
    }
};

function setValue(device, gpio, value) {
    //only proceed if device found
    if (gpio != null) {
        console.log('Found device "' + device + '". Starting setValue.');
        var currentValue = gpio.readSync();

        console.log('Current value for "' + device + '" is "' + currentValue  +'"');
        
        //only write new value if it's different than current value
        if (currentValue == value) {
            console.log('Value is already set to "' + value + '". No changes made.');
        }
        else {
            gpio.writeSync(value);

            console.log('Changed value to "' + value + '".');

            //release pin if shutting it off
            if (value == 0) {
                gpio.unexport();
                console.log('Unexport called.');
            }
        }
    }
}

function setValueWithTimeout(device, gpio, timeout) {
    setValue(device, gpio, 1);

    setTimeout(function () {
        setValue(device, gpio, 0);
        console.log('Timeout elapsed. Value flipped back.');
    }, timeout);
}

// function flipValueWithLock(device, gpio) {
//     gpio.lock = false;

//     if (gpio.lock == true) {
//         console.log(device + ' is locked. Throwing Error.');
//         throw 'LockException';
//     }
//     else {
//         gpio.lock = true;
//         console.log('Locking ' + device);

//         flipValue(device, gpio);

//         gpio.lock = false;
//         console.log('Unlocked ' + device);
//     }
// }

function flipValue(gpio) {
    if (gpio != null) {
        var pin = gpio.gpio;
        console.log('Starting flipValue for ' + pin);

        var currentValue = gpio.readSync();
        console.log('Current value for "' + pin + '" is "' + currentValue + '"');

        var newValue = currentValue ^ 1;

        gpio.writeSync(newValue);

        console.log('Changed value to "' + newValue + '".');

        //release pin if shutting it off
        //if (newValue == 0) {
        //    gpio.unexport();
        //    console.log('Unexport called.');
        //}
    }
}

function flipValueWithTimeout(pin, timeout) {
    var gpio = new Gpio(pin, 'high');
    var locked = checkLock(pin);
    
    if (locked == true) {
        console.log(pin + ' is locked. Throwing Error.');
        throw 'LockException';
    }
    else {
        lockPin(pin);
        console.log('Locking ' + pin);
    }

    console.log('Starting flipValueWithTimeout for pin ' + pin);

    flipValue(gpio);

    setTimeout(function () {
        console.log('flipValue timeout elapsed.');
        flipValue( gpio);
        console.log('Value flipped back.');

        // gpio.lock = false;
        unlockPin(pin);

        console.log(pin + ' unlocked.');
            
        gpio.unexport();
        console.log('Unexport called.');
    }, timeout);
}

function checkLock(pin) {
    for (var i = 0; i < locked.length; i++) {
        if (pin == locked[i]) {
            return true;
        }
    }

    return false;
}

function lockPin(pin) {
    locked.push(pin);
}

function unlockPin(pin) {
    var index = -1;

    for (var i = 0; i < locked.length; i++) {
        if (pin == locked[i]) {
            index = i;
            break;
        }
    }

    locked.splice(index, 1);

    return false;
}