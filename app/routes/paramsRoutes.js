'use strict';
const express = require('express'),
	paramsController = require('../controllers/paramsController'),
	api = express.Router();

// get cost by route include time, kilometer, origin and destiny weather
api.get('/params', paramsController.getParams);
api.post('/params', paramsController.setParams);

module.exports = api;
