/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var wpi = require('wiring-pi');

const PIN = 7;

function Sensor() {
  wpi.setup('wpi');
  wpi.digitalWrite(PIN, wpi.HIGH);
  console.log('create sensor');
}

Sensor.prototype.read = function () {
    console.log('reading');
    console.log(wpi.digitalRead(PIN));
    console.log(wpi.digitalRead(8));

    wpi.pinMode(PIN, wpi.OUTPUT);
    wpi.digitalWrite(PIN, wpi.HIGH);
    wpi.delay(250);
    wpi.digitalWrite(PIN, wpi.LOW);
    wpi.delay(20);

    wpi.digitalWrite(PIN, wpi.HIGH);
    wpi.pinMode(PIN, wpi.INPUT);
    wpi.pullUpDnControl(PIN, wpi.PUD_UP);
    wpi.delayMicroseconds(10);

    if(wpi.pulseIn(PIN, wpi.HIGH) === 0 || wpi.pulseIn(PIN, wpi.LOW) === 0) {
        console.log('read failed');
        return {messageId: -1};
    }

    var cycles = [], data = [];
    for(var i = 0; i < 80; i+=4) {
        cycles[i] = wpi.pulseIn(PIN, wpi.LOW);
        cycles[i + 1] = wpi.pulseIn(PIN, wpi.HIGH);
        cycles[i + 2] = wpi.pulseIn(PIN, wpi.LOW);
        cycles[i + 3] = wpi.pulseIn(PIN, wpi.HIGH);
    }

    for(var i = 0; i < 40; i++) {
        var low = cycles[2 * i];
        var high = cycles[2 * i + 1];
        var index = Math.floor(i/8);
        data[index] = data[index] << 1;
        if(high > low) {
            data[index] = data[index] | 1;
        }
    }

console.log(data);
 console.log(((data[2] & 0x7f)*256 + data[3])/10);
 console.log(cycles);
  return {messageId : 2};
}

module.exports = Sensor;