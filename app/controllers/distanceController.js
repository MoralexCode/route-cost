'use strict';
require('dotenv').config();
const weatherController = {},
	controllerName = 'weatherController',
	axios = require('axios');
const {APIKEY, MAPS_URL} = process.env;
const URL = MAPS_URL + APIKEY;
//+-----------------------------------------------------------------------------+
//|                                                                             |
//|                                                                             |
//|  get the distance by latitude and longitude                                 |
//|                                                                             |
//+-----------------------------------------------------------------------------+
weatherController.getDistanceByCoordinates = (req, res) => {
	const {latorigen, lonorigen, latdestino, londestino} = req.params;
	const PARAMS = `&origins=${latorigen},${lonorigen}&destinations=${latdestino},${londestino}`;
	info(`URL ${URL}${PARAMS}`);

	axios
		.get(URL + PARAMS)
		.then(function (response) {
			send(res, response.data);
		})
		.catch(function (error) {
			sendError(res, error, readMessage(controllerName, error));
		});
};

module.exports = weatherController;
