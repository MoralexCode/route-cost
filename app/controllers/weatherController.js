'use strict';
require('dotenv').config();
const weatherController = {},
	controllerName = 'weatherController',
	axios = require('axios');
const {WEATHER_ZIP_CODE_URL, APPID} = process.env;
const WEATHER_URL = WEATHER_ZIP_CODE_URL + APPID;

//+-----------------------------------------------------------------------------+
//|                                                                             |
//|                                                                             |
//| get the weather by latitude and longitude                                   |
//|                                                                             |
//+-----------------------------------------------------------------------------+
weatherController.getWeatherByCoordinates = (req, res) => {
	const {lat, lon} = req.params;
	const PARAMS = `&lat=${lat}&lon=${lon}`;
	log(' URL : ', WEATHER_URL + PARAMS);
	axios
		.get(WEATHER_URL + PARAMS)
		.then(function (response) {
			const {data} = response;
			log(data);
			send(res, data);
		})
		.catch(function (error) {
			sendError(res, error, readMessage(controllerName, error));
		});
};

module.exports = weatherController;
