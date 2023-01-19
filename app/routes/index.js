'use strict';
const express = require('express'),
	app = express();

const cost = require('./costRoutes');
const weather = require('./weatherRoutes');
const distance = require('./distanceRoutes');
app.use('/v1', cost); //
app.use('/v1', weather); //
app.use('/v1', distance); //

module.exports = app;
