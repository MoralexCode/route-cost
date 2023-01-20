'use strict';
require('dotenv').config();
const paramsController = {},
	controllerName = 'paramsController',
	Price = require('../models/price');
const {WEATHER_ZIP_CODE_URL, APPID} = process.env;
const WEATHER_URL = WEATHER_ZIP_CODE_URL + APPID;

//+-----------------------------------------------------------------------------+
//|                                                                             |
//|                                                                             |
//| get the params to calculate the route cost and apply bussiness rules        |
//|                                                                             |
//+-----------------------------------------------------------------------------+

paramsController.getParams = async (req, res) => {
	Price.findOne({}, (err, price) => {
		if (err) {
			sendError(res, err);
		} else {
			if (!price) {
				sendError(res, 'No hay precios en la base de datos');
			} else {
				send(res, price);
			}
		}
	}).clone();
};

//+-----------------------------------------------------------------------------+
//|                                                                             |
//|                                                                             |
//| set the params values to calculate the route cost and apply bussiness rules |
//|                                                                             |
//+-----------------------------------------------------------------------------+
paramsController.setParams = (req, res) => {
	const update = req.body;
	const {id} = req.params;
	const validParams = validateConfigParams(update);
	if (validParams.status) {
		Price.findOneAndUpdate(id, update, (err, priceUpdated) => {
			if (err) {
				sendError(res, err);
			} else {
				if (!priceUpdated) {
					sendError(res, 'Error al guardar los parametros en la base de datos');
				} else {
					log('priceUpdated | ', priceUpdated);
					send(res, priceUpdated);
				}
			}
		});
	} else {
		sendError(res, validParams.message);
	}
};
function timeFactorValid(factorTime) {
	let response = {message: 'Factor needs an object with numeric values'};
	const ok = {status: true, message: ''};
	Object.keys(factorTime).forEach(function (item) {
		response = !factorTime[item] || !isValidFloat(factorTime[item]) ? response : ok;
	});
	return response;
}
function weatherFactorValid(weatherFactor) {
	let response = {message: 'Factor needs an arrar with numeric values'};
	Object.keys(weatherFactor).forEach(function (weather) {
		Object.keys(weather).forEach(function (item) {
			response = !isValidFloat(weather[item]) ? response : {status: true};
		});
	});
	return response;
}
// TODO: validate dia, tarde y noche values
// function hasAValidObject(factorTime, obj) {
// 	Object.keys(obj).forEach(function (item) {
// 		if (!obj.hasOwnProperty('dia)) return response;
// 	});
// }
function validateConfigParams(obj) {
	const {factortiempo, factorclima, gasolina, rendimientoxkm, costoChoferXMin} = obj;
	let response = {status: true, message: ''};
	if (factortiempo && factortiempo.length > 0) {
		response = timeFactorValid(factortiempo);
	}
	if (factorclima && factorclima.length > 0) {
		response = weatherFactorValid(factorclima);
	}
	if (!isValidFloat(gasolina)) {
		response = {status: false, message: 'gasolina must be numeric'};
	}
	if (!isValidFloat(rendimientoxkm)) {
		response = {status: false, message: 'rendimientoxkm must be numeric'};
	}
	if (!isValidFloat(costoChoferXMin)) {
		response = {status: false, message: 'costoChoferXMin must be numeric'};
	}

	return response;
}

module.exports = paramsController;
