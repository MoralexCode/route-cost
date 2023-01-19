'use strict';
const express = require('express'),
	distanceController = require('../controllers/distanceController'),
	api = express.Router();

//get the distance by latitude and longitude
api.get(
	'/distance/:latorigen/:lonorigen/:latdestino/:londestino',
	distanceController.getDistanceByCoordinates
);

module.exports = api;
