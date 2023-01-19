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
			sendError(res, error);
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
				sendError(res, error);
			} else {
				if (!priceUpdated) {
					sendError(res, 'Error al guardar los parametros en la base de datos');
				} else {
					console.log('priceUpdated | ', priceUpdated);
					send(res, priceUpdated);
				}
			}
		});
	} else {
		sendError(res, validParams.message);
	}
};

function validateConfigParams(obj) {
	var response = {status: false, message: ''};
	//validar el factor tiempo
	if (
		obj.factortiempo &&
		obj.factortiempo != undefined &&
		obj.factortiempo != null &&
		obj.factortiempo.length > 0
	) {
		if (obj.factortiempo[0].dia && isValidFloat(obj.factortiempo[0].dia)) {
			response = {status: true, message: ''};
		} else {
			response = {status: false, message: 'EL valor del dia debe ser numerico'};
		}
		if (obj.factortiempo[0].tarde && isValidFloat(obj.factortiempo[0].tarde)) {
			response = {status: true, message: ''};
		} else {
			response = {status: false, message: 'EL valor de la tarde debe ser numerico'};
		}
		if (obj.factortiempo[0].noche && isValidFloat(obj.factortiempo[0].noche)) {
			response = {status: true, message: ''};
		} else {
			response = {status: false, message: 'EL valor de la noche debe ser numerico'};
		}
	} else {
		response = {status: false, message: 'EL factortiempo debe ser un arreglo con valores'};
	}
	//validar el factor clima
	if (
		obj.factorclima &&
		obj.factorclima != undefined &&
		obj.factorclima != null &&
		obj.factorclima.length > 0
	) {
		if (obj.factorclima[0].value && isValidFloat(obj.factorclima[0].value)) {
			response = {status: true, message: ''};
		} else {
			response = {
				status: false,
				message: 'EL valor de' + obj.factorclima[0].name + 'debe ser numerico'
			};
		}
	} else {
		response = {status: false, message: 'EL factorclima debe ser un arreglo con valores'};
	}

	//validar la gasolina
	if (obj.gasolina && isValidFloat(obj.gasolina)) {
		response = {status: true, message: ''};
	} else {
		response = {status: false, message: 'EL valor de la gasolina debe ser numerico'};
	}

	//validar la rendimientoxkm
	if (obj.rendimientoxkm && isValidFloat(obj.rendimientoxkm)) {
		response = {status: true, message: ''};
	} else {
		response = {status: false, message: 'EL valor del  rendimientoxkm debe ser numerico'};
	}
	//validar la costoChoferXMin
	if (obj.costoChoferXMin && isValidFloat(obj.costoChoferXMin)) {
		response = {status: true, message: ''};
	} else {
		response = {status: false, message: 'EL valor del  costoChoferXMin debe ser numerico'};
	}

	return response;
}

module.exports = paramsController;
