'use strict';
require('./util/global'); //load global.js to add new functions to Global enviroment
const express = require('express'),
	app = express();
const boxen = require('boxen');
const cors = require('cors');
const pkg = require('./package.json');
const {cyan} = require('chalk');
require('dotenv').config();
const ENV = process.env; // GET environment variables
const PORT = ENV.PORT || 3000;
const HOST = ENV.HOST;
const db = require('mongoose');
db.Promise = global.Promise;
db.set('strictQuery', true);
const URI = ENV.MONGODB_URL;

const log = console.log;
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json({limit: '100mb'}));
//============ add Routes ===================
const routes = require('./app/routes/index');

// ruta base
app.use('/api', routes);
app.get('*', function (req, res) {
	res.status(200).send({
		message: 'Bienvenidos a RouteCost'
	});
});
const server = app.listen(PORT, () => {
	const appName = pkg.name;
	db.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true})
		.then(() => {
			info(
				boxen(
					`👂Listening at http://${HOST}:${PORT}\n[DB] Conectada con éxito  \n🔥  ${cyan(
						` Learn, develop, enjoy, repeat  `
					)}😎 `,
					{
						title: appName,
						titleAlignment: 'center',
						borderStyle: 'double'
					}
				)
			);
		})
		.catch(err => console.error('[db]', err));
});

module.exports = {app, server};
