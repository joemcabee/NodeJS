var Gpio = require('onoff').Gpio,
    sleep = require('sleep'),
    locked = [],
    systemLocked = false,
    PIN_FAN = 0,
    PIN_HEAT = 1,
    PIN_COOL = 2,
    DEVICE_ON = 0,
    DEVICE_OFF = 1;

module.exports = {
    turnOffSystem: function () {
        turnOffFan();
        turnOffHeat();
        turnOffCool();
    },
    turnOnFan: function () {
        console.log('Begin turnOnFan');

        var fan = new Gpio(PIN_FAN, 'high');
        var currentValue = fan.readSync();

        if (currentValue == DEVICE_OFF) {
            fan.writeSync(DEVICE_ON);
            console.log('Fan turned on');
        }
        else {
            console.log('Fan already turned on');
        }

        console.log('End turnOnFan');
    },
    turnOffFan: function () {
        console.log('Begin turnOffFan');

        turnOff('Fan', PIN_FAN);

        console.log('End turnOffFan');
    },
    turnOnHeat: function () {
        console.log('Begin turnOnHeat');

        var heat = new Gpio(PIN_HEAT, 'high');

        if (systemLock) {
            console.log('System is locked. Throwing Error.');
            throw 'LockException';
        }
        else {
            systemLock = true;
            console.log('Locking system');
        }

        turnOffFan();

        sleep.sleep(15);

        turnOffCool();

        sleep.sleep(15);

        var currentHeat = heat.readSync();

        if (currentHeat == DEVICE_OFF) {
            heat.writeSync(DEVICE_ON);
            console.log('Heat turned on');
        }
        else {
            console.log('Heat already turned on');
        }

        sleep.sleep(15);

        turnOnFan();

        systemLocked = false;
        console.log('System unlocked');

        console.log('End turnOnHeat');
    },
    turnOffHeat: function () {
        console.log('Begin turnOffHeat');

        turnOff('Heat', PIN_HEAT);

        console.log('End turnOffHeat');
    },
    turnOnCool: function () {
        console.log('Begin turnOnCool');

        var cool = new Gpio(PIN_COOL, 'high');

        if (systemLock) {
            console.log('System is locked. Throwing Error.');
            throw 'LockException';
        }
        else {
            systemLock = true;
            console.log('Locking system');
        }

        turnOffFan();

        sleep.sleep(15);

        turnOffHeat();

        sleep.sleep(15);

        var currentCool = cool.readSync();

        if (currentCool == DEVICE_OFF) {
            cool.writeSync(DEVICE_ON);
            console.log('Cool turned on');
        }
        else {
            console.log('Cool already turned on');
        }

        sleep.sleep(15);

        turnOnFan();

        systemLocked = false;
        console.log('System unlocked');

        console.log('End turnOnHeat');
    },
    turnOffCool: function () {
        console.log('Begin turnOffCool');

        turnOff('Cool', PIN_COOL);

        console.log('End turnOffCool');
    }
};

function turnOff(device, pin) {
    console.log('Begin turnOff for %j', device);

    var device = new Gpio(pin, 'high');
    var currentValue = device.readSync();

    if (currentValue == DEVICE_OFF) {
        console.log('%j already turned off', device);
    }
    else {
        device.writeSync(DEVICE_OFF);
        console.log('%j turned off', device);
    }

    device.unexport();

    console.log('Unexport called.');

    console.log('End turnOff for %j', device);
}