/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var gulp = require('gulp');

/**
 * Setup common gulp tasks: init, install-tools, deploy, run
 */
require('gulp-common')(gulp, 'raspberrypi-node', {
  appName: 'client-app',
  configTemplate: {
    "device_host_name_or_ip_address": "[device hostname or IP address]",
    "device_user_name": "pi",
    "device_password": "raspberry",
    "iot_device_connection_string": "[IoT device connection string]"
  },
  configPostfix: 'raspberrypi'
});
