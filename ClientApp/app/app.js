/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var fs = require('fs');
var path = require('path');
var Sensor = require('./sensor.js');

// Use MQTT protocol to communicate with IoT hub
var Client = require('azure-iot-device').Client;
var ConnectionString = require('azure-iot-device').ConnectionString;
var Message = require('azure-iot-device').Message;
var Protocol = require('azure-iot-device-mqtt').Mqtt;

const DEFAULT_PERIOD = 2000;

// read out all params and set default value
var args = {
  connectionStringParam: process.argv[2],
  sendMessagePeriod: parseInt(process.argv[3] + '') || DEFAULT_PERIOD,
  simulateDevice: (('' + process.argv[4]).toLowerCase() === 'true')
}
var sensor;

// Read device connection string from command line arguments and parse it
var connectionString = ConnectionString.parse(args.connectionStringParam);
var deviceId = connectionString.DeviceId;

// fromConnectionString must specify a transport constructor, coming from any transport package.
var client = Client.fromConnectionString(args.connectionStringParam, Protocol);

// Configure the client to use X509 authentication if required by the connection string.
if (connectionString.x509) {
  // Read X.509 certificate and private key.
  // These files should be in the current folder and use the following naming convention:
  // [device name]-cert.pem and [device name]-key.pem, example: myraspberrypi-cert.pem
  var options = {
    cert: fs.readFileSync(path.join(__dirname, deviceId + '-cert.pem')).toString(),
    key: fs.readFileSync(path.join(__dirname, deviceId + '-key.pem')).toString()
  };

  client.setOptions(options);

  console.log('[Device] Using X.509 client certificate authentication');
}

// Connect to IoT Hub and send messages via the callback.
client.open((err) => {
  connectCallback(err, args);
});

/** functions */
/**
 * Start sending messages after getting connected to IoT Hub.
 * If there is any error, log the error message to console.
 * @param {string}  err - connection error
 */
function connectCallback(err, args) {
  if (err) {
    console.log('[Device] Could not connect: ' + err);
  } else {
    console.log('[Device] Client connected\n');
    messageCreator = args.simulateDevice ? createMessage : readMessage
    sendMessages(args.sendMessagePeriod);
  }
}

/**
 * Construct device-to-cloud message and send it to IoT Hub.
 */
var messageCount = 0;
var messageCreator;
function sendMessages(period) {
  messageCount++;
  setTimeout(function () {
    messageCreator(messageCount, (error, messageContent) => {
      if (error) {
        console.log('[Device] Create message error: ' + error.toString());
        sendMessages(period);
        return;
      }
      console.log("[Device] Sending message " + messageContent);
      var message = new Message(messageContent);
      client.sendEvent(message, (err) => {
        if (err) {
          console.log('[Device] Send message error: ' + err.toString());
        }
        sendMessages(period);
      });
    });
  }, period);
}

function createMessage(count, callback) {
  callback(null, JSON.stringify({
    messageId: count,
    temperature: 20.0,
    humidity: 30.0
  }));
}

function readMessage(count, callback) {
  getSensor(() => {
    sensor.read((error, data) => {
      if (error) {
        callback(error);
        return;
      }
      // console.log(JSON.stringify(data));
      callback(null, JSON.stringify({
        messageId: count,
        temperature: data.temperature_C,
        humidity: data.humidity
      }));
    });
  });
}

function getSensor(callback) {
  if (sensor) {
    callback(sensor);
  } else {
    sensor = new Sensor();
    sensor.init(callback);
  }
}
