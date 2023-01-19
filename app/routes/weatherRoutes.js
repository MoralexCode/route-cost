'use strict';
const express = require('express'),
	weatherController = require('../controllers/weatherController'),
	api = express.Router();

//get the weather by latitude and longitude
api.get('/weather/:lat/:lon', weatherController.getWeatherByCoordinates);

module.exports = api;
