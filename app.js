'use strict';
require('./util/global'); //load global.js to add new functions to Global enviroment
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
// cargar rutas
var cost_routes = require('./app/routes/costRoutes');
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);
// parse various different custom JSON types as JSON
app.use(
	bodyParser.json({
		type: 'application/json'
	})
);
// configurar cabeceras http
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Resquest-Method, Engaged-Auth-Token'
	);
	res.header('Access-Control-Allow-Resquest-Methods', 'GET, POST, OPTIONS, PUT, DELETE, HEAD');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, HEAD');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE, HEAD');
	res.header('Allow', 'Content-Type');
	next();
});
// ruta base
app.use('/api/v1/', cost_routes);

app.get('*', function (req, res) {
	res.status(200).send({
		message: 'Bienvenidos a CostRoutes'
	});
});
module.exports = app;
