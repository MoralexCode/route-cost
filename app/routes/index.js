'use strict';
const express = require('express'),
	app = express();

const cost = require('./costRoutes');
const weather = require('./weatherRoutes');
const distance = require('./distanceRoutes');
const params = require('./paramsRoutes');
app.use('/v1', cost); //
app.use('/v1', weather); //
app.use('/v1', distance); //
app.use('/v1', params); //

module.exports = app;
