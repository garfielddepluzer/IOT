﻿/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var gulp = require('gulp');

function initTasks(gulp) {
  require('gulp-common')(gulp, 'raspberrypi-node', { appName: 'lesson-4' });

  gulp.task('send-cloud-to-device-messages', false, function () {
    var config = require("./config.json");
    var Message = require('azure-iot-common').Message;
    var client = require('azure-iothub').Client.fromConnectionString(config.iot_hub_connection_string);

    var getDeviceId = function (connectionString) {
      var elements = connectionString.split(';');
      var dict = {};
      for (var i = 0; i < elements.length; i++) {
        var kvp = elements[i].split('=');
        dict[kvp[0]] = kvp[1];
      }
      return dict.DeviceId;
    };
    var targetDevice = getDeviceId(config.iot_device_connection_string);
    var commandMessage = {
      command: 'blink'
    };

    var sentMessageCount = 0;
    var MaxMessageNumber = 20;

    var sendMessageCallback = function (err) {
      if (err) {
        console.error('[IoT Hub] Sending message error: ' + err.message);
      }
      if (sentMessageCount < MaxMessageNumber) {
        setTimeout(sendMessage, 2000);
      } else if (sentMessageCount == MaxMessageNumber) {
        commandMessage.command = 'stop';
        setTimeout(sendMessage, 2000);
      } else {
        client.close(closeConnectionCallback);
      }
    };

    var sendMessage = function () {
      sentMessageCount++;
      commandMessage.messageId = sentMessageCount;
      var message = new Message(JSON.stringify(commandMessage));
      console.log('[IoT Hub] Sending message #' + sentMessageCount + ': ' + message.getData());
      client.send(targetDevice, message, sendMessageCallback);
    };

    var closeConnectionCallback = function (err) {
      if (err) {
        console.error('[IoT Hub] Close connection error: ' + err.message + '\n');
      } else {
        console.error('[IoT Hub] Connection closed\n');
      }
    };

    var connectCallback = function (err) {
      if (err) {
        console.error('[IoT Hub] Fail to connect: ' + err.message + '\n');
      } else {
        console.log('[IoT Hub] Client connected\n');
        // Wait for 5 seconds so that Device gets connected to IoT Hub.
        setTimeout(sendMessage, 5000);
      }
    };

    client.open(connectCallback);
  });

  gulp.task('run', 'Runs deployed sample on the board', ['run-internal', 'send-cloud-to-device-messages']);
}

initTasks(gulp);