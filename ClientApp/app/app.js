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
  sendMessagePeriod: process.argv[3] || DEFAULT_PERIOD,
  simulateDevice: (('' + process.argv[4]).toLowerCase() === 'true')
}
var sensor;

console.log(process.argv[4]);

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
    sendMessages(null, args);
  }
}

/**
 * Construct device-to-cloud message and send it to IoT Hub.
 */
function sendMessages(err, args) {
  if(err) {
    console.log('[Device] Message error: ' + err.toString());
    return;    
  }
  setTimeout(function() {
    var messageContent = args.simulateDevice ? createMessage() : readMessage();
    console.log("[Device] Sending message " + messageContent);
    var message = new Message(messageContent);
    client.sendEvent(message, (err) => {
      sendMessages(err, args);
    });
  }, args.sendMessagePeriod);
}

function createMessage() {
  return JSON.stringify({messageId : 1});
}

function readMessage() {
  sensor = sensor || new Sensor();
  return JSON.stringify(sensor.read());
}