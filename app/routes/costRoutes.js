'use strict';
const express = require('express');
const CostController = require('../controllers/costController');
const api = express.Router();

//get the distance by latitude and longitude
api.get(
	'/distance/:latorigen/:lonorigen/:latdestino/:londestino',
	CostController.getDistanceByCoordinates
);
//get the weather by latitude and longitude
api.get('/weather/:lat/:lon', CostController.getWeatherByCoordinates);
// get cost by route include time, kilometer, origin and destiny weather
api.get('/cost/:latorigen/:lonorigen/:latdestino/:londestino', CostController.getCost);

module.exports = api;
