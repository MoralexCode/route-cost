'use strict';
const Util = require('../../util/util');
const axios = require('axios');
const Record = require('../models/record');
const Price = require('../models/price');
require('dotenv').config();
const APIKEY = process.env.APIKEY; //api key google maps
const APPID = process.env.APPID; //API key from weather
const MAPS_URL = process.env.MAPS_URL + APIKEY;
const WEATHER_ZIP_CODE_URL = process.env.WEATHER_ZIP_CODE_URL + APPID;
const controllerName = 'CostController';

function getCost(req, res) {
	const PARAMS =
		'&origins=' +
		req.params.latorigen +
		',' +
		req.params.lonorigen +
		'&destinations=' +
		req.params.latdestino +
		',' +
		req.params.londestino;
	const ORIGINPARAMS = '&lat=' + req.params.latorigen + '&lon=' + req.params.lonorigen;
	const DESTINATIONPARAMS = '&lat=' + req.params.latdestino + '&lon=' + req.params.londestino;
	let resultData = [];
	if (
		validateParams(
			req.params.latorigen,
			req.params.lonorigen,
			req.params.latdestino,
			req.params.londestino
		)
	) {
		axios
			.get(MAPS_URL + PARAMS)
			.then(function (response) {
				resultData.push(response.data);
				if (
					response.data &&
					response.data.destination_addresses &&
					response.data.destination_addresses[0] != '' &&
					response.data.origin_addresses &&
					response.data.origin_addresses[0] != ''
				) {
					axios
						.get(WEATHER_ZIP_CODE_URL + ORIGINPARAMS)
						.then(function (response) {
							//origin weather
							resultData.push(response.data);
							axios
								.get(WEATHER_ZIP_CODE_URL + DESTINATIONPARAMS)
								.then(async response => {
									//Destination weather
									console.log('response.data: ', resultData.data);
									resultData.push(response.data);
									let origin = {
										place: resultData[0].origin_addresses[0],
										name: resultData[1].name,
										description: resultData[1].weather[0].description,
										temp: resultData[1].main.temp,
										icon:
											'http://openweathermap.org/img/wn/' +
											resultData[1].weather[0].icon +
											'@2x.png'
									};
									let destination = {
										place: resultData[0].destination_addresses[0],
										name: resultData[2].name,
										description: resultData[2].weather[0].description,
										temp: resultData[2].main.temp,
										icon:
											'http://openweathermap.org/img/wn/' +
											resultData[2].weather[0].icon +
											'@2x.png'
									};
									let distance = 0;
									let time = 0;
									if (
										resultData[0].rows[0].elements[0].status != 'ZERO_RESULTS'
									) {
										distance = resultData[0].rows[0].elements[0].distance.text;
										time = resultData[0].rows[0].elements[0].duration.text;
									} else {
										console.log(
											'No hay resultados para la distancia| ',
											resultData[0].rows[0].elements[0]
										);
									}

									let precio = await findPrice();
									console.log(
										'precio |',
										precio,
										resultData,
										origin,
										destination,
										distance,
										time
									);
									await buildResponse(
										precio,
										resultData,
										origin,
										destination,
										distance,
										time,
										res
									);
								})
								.catch(function (error) {
									console.log('error : ', error);
									Util.errorMessage(res, error);
								});
						})
						.catch(function (error) {
							console.log('error : ', error);
							Util.errorMessage(res, error);
						});
				} else {
					console.log('response.data: vacio ', response.data);
					Util.errorMessage(res, {params: PARAMS, status: 'Location not found'});
				}
			})
			.catch(function (error) {
				console.log('error : ', error);
				Util.errorMessage(res, error);
			});
	} else {
		Util.errorMessage(res, 'Latitud y longitud deben de ser numericos');
	}
}

async function buildResponse(prices, resultData, origin, destination, distance, time, res) {
	let input =
		resultData[0].rows[0].elements[0].status != 'ZERO_RESULTS'
			? calculateCost(
					prices,
					resultData[0].rows[0].elements[0].distance.value,
					resultData[0].rows[0].elements[0].duration.value,
					resultData[1].weather[0].id,
					resultData[2].weather[0].id
			  )
			: 0;
	let cost = isNaN(input.costo) ? 0 : input.costo.toFixed(2);
	let output = {
		origin,
		destination,
		cost,
		distance,
		time,
		message: '#AmoTirarCodigo&LosDesplieguesContinuos'
	};
	let recordSaved = await saveRecord(input, output);
	Util.dataValidation(res, output, controllerName);
}
async function findPrice() {
	return Price.findOne({}, (err, price) => {
		if (err) {
			console.log(' Price not found ');
			return err;
		} else {
			if (!price) {
				console.log('There are not Prices in DB');
				return price;
			} else {
				return {
					factorclima: price.factorclima,
					factortiempo: price.factortiempo,
					gasolina: price.gasolina,
					rendimientoxkm: price.rendimientoxkm,
					costoChoferXMin: price.costoChoferXMin
				};
				// console.log('price found : INPUTS ', INPUTS)
			}
		}
	});
}
async function saveRecord(input, output) {
	let record = new Record();
	record.input = input; //{factorclima: prices.factorclima, factortiempo: prices.factortiempo, gasolina: prices.gasolina, rendimientoxkm: prices.rendimientoxkm, costoChoferXMin: prices.costoChoferXMin };
	record.output = output;
	return record.save((err, recordStored) => {
		// save record
		if (err) {
			console.log('Error to save record', err);
		} else {
			if (!recordStored) {
				console.log('Has been not  save record');
			} else {
				console.log('Record to save : ', recordStored);
				return recordStored;
			}
		}
	});
}

function validateParams(lat, lon, lat2, lon2) {
	console.log(lat, lon, lat2, lon2);
	if (
		Util.floatValidation(lat) &&
		Util.floatValidation(lon) &&
		Util.floatValidation(lat2) &&
		Util.floatValidation(lon2)
	) {
		return true;
	}
	return false;
}

function calculateCost(input, km, time, weatherCodeOrigin, weatherCodeDestination) {
	/**Se agrega modificación , dado que inicialmente se va contratar un servicio de transporte que recoja las muestras */
	const banderazo = parseFloat(input.gasolina),
		kilometrosXRecorrer = km / 1000, //numero de kilometros a recorrer
		factorDeClima =
			(getWeatherFactor(input.factorclima, weatherCodeOrigin) +
				getWeatherFactor(input.factorclima, weatherCodeDestination)) /
			2, // cual es el factor del clima
		factorTiempo = getDayTime(input.factortiempo[0]), // Dia, tarde o Noche
		tiempoARecorrerMin = time / 60, // tiempo que se tardará en recorrer esa distancia (minutos)
		tarifaXKilometro = input.costoChoferXMin; //costo del chofer por minuto(en pesos)
	//valor = [(gastosXkilometroGasolina * NumeroKilometrosARecorrer) (factorDeClima)] + [FactorTiempo * tiempoARecorrerMin * costoChoferXMin]
	//console.log("Resultado :", gastosXkilometroGasolina, kilometrosXRecorrer, factorDeClima, factorTiempo, tiempoARecorrerMin, costoChoferXMin, '= ', gastosXkilometroGasolina * kilometrosXRecorrer * factorDeClima) + (factorTiempo * tiempoARecorrerMin * costoChoferXMin)
	return {
		banderazo,
		kilometrosXRecorrer,
		factorDeClima,
		factorTiempo,
		tiempoARecorrerMin,
		banderazo,
		kilometrosXRecorrer,
		factorDeClima,
		factorTiempo,
		tiempoARecorrerMin,
		costo: banderazo + tarifaXKilometro * kilometrosXRecorrer
	};
	//valor = [(1.8 * 6)(1.6)] + (0.5*10) = (10.8 * 1.6) + 5 = 6.48  +5 = 11.48
	/**Versión anterior */
	// const gastosXkilometroGasolina = (parseFloat(input.gasolina) / parseFloat(input.rendimientoxkm)), //cuanto $ cuesta recorrer 1 km en el vehiculo,$20/15km=1.3$  gasolina $20 el litro y rinde para 15km 20/15=1.3
	//     kilometrosXRecorrer = (km / 1000), //numero de kilometros a recorrer
	//     factorDeClima = (getWeatherFactor(input.factorclima, weatherCodeOrigin) + getWeatherFactor(input.factorclima, weatherCodeDestination)) / 2, // cual es el factor del clima
	//     factorTiempo = getDayTime(input.factortiempo[0]), // Dia, tarde o Noche
	//     tiempoARecorrerMin = (time / 60), // tiempo que se tardará en recorrer esa distancia (minutos)
	//     costoChoferXMin = input.costoChoferXMin //costo del chofer por minuto(en pesos)
	//     //valor = [(gastosXkilometroGasolina * NumeroKilometrosARecorrer) (factorDeClima)] + [FactorTiempo * tiempoARecorrerMin * costoChoferXMin]
	//     //console.log("Resultado :", gastosXkilometroGasolina, kilometrosXRecorrer, factorDeClima, factorTiempo, tiempoARecorrerMin, costoChoferXMin, '= ', gastosXkilometroGasolina * kilometrosXRecorrer * factorDeClima) + (factorTiempo * tiempoARecorrerMin * costoChoferXMin)
	//     return { gastosXkilometroGasolina, kilometrosXRecorrer, factorDeClima, factorTiempo, tiempoARecorrerMin, costoChoferXMin, gastosXkilometroGasolina, kilometrosXRecorrer, factorDeClima, factorTiempo, tiempoARecorrerMin, costoChoferXMin, costo: (gastosXkilometroGasolina * kilometrosXRecorrer * factorDeClima) + (factorTiempo * tiempoARecorrerMin * costoChoferXMin) }
	//     //valor = [(1.8 * 6)(1.6)] + (0.5*10) = (10.8 * 1.6) + 5 = 6.48  +5 = 11.48
}

function getWeatherFactor(weatherPrice, weather) {
	for (var i = 0; i < weatherPrice.length; i++) {
		if (weatherPrice[i].code == weather) {
			return weatherPrice[i].value;
		}
	}
	return 1.5; //valor por default
}

function getDayTime(time) {
	var hora = new Date();
	if (hora.getHours() >= 7 && hora.getHours() <= 15) {
		return time.dia; //'Dia'
	} else if (hora.getHours() >= 16) {
		return time.tarde; //'tarde'
	} else if (hora.getHours() >= 18) {
		return time.noche; //'Noche'
	}
}

//get the distance by latitude and longitude
function getDistanceByCoordinates(req, res) {
	console.log(
		'params : ',
		req.params.latorigen,
		' ',
		req.params.lonorigen,
		'   ****** ',
		req.params.latdestino,
		' ',
		req.params.londestino
	);
	var PARAMS =
		'&origins=' +
		req.params.latorigen +
		',' +
		req.params.lonorigen +
		'&destinations=' +
		req.params.latdestino +
		',' +
		req.params.londestino;
	console.log(' ruta: ', MAPS_URL + PARAMS);
	axios
		.get(MAPS_URL + PARAMS)
		.then(function (response) {
			console.log(response.data);
			Util.message(res, response.data);
		})
		.catch(function (error) {
			console.log('error : ', error);
			Util.errorMessage(res, error);
		});
}

//get the weather by latitude and longitude
function getWeatherByCoordinates(req, res) {
	console.log('params : ', req.params.lat);
	var PARAMS = '&lat=' + req.params.lat + '&lon=' + req.params.lon;
	console.log(' ruta: ', WEATHER_ZIP_CODE_URL + PARAMS);
	axios
		.get(WEATHER_ZIP_CODE_URL + PARAMS)
		.then(function (response) {
			console.log(response.data);
			Util.message(res, response.data);
		})
		.catch(function (error) {
			Util.errorMessage(res, error);
		});
}

function getParams(req, res) {
	let precio = Price.findOne({}, (err, price) => {
		if (err) {
			Util.errorMessage(res, error);
		} else {
			if (!price) {
				Util.errorMessage(res, 'No hay precios en la base de datos');
			} else {
				// INPUTS = { factorclima: price.factorclima, factortiempo: price.factortiempo, gasolina: price.gasolina, rendimientoxkm: price.rendimientoxkm, costoChoferXMin: price.costoChoferXMin }
				Util.message(res, price);
			}
		}
	});
}

function setParams(req, res) {
	var update = req.body;
	var _id = req.params.id;
	var validParams = validateConfigParams(update);
	if (validParams.status) {
		Price.findOneAndUpdate(_id, update, (err, priceUpdated) => {
			if (err) {
				Util.errorMessage(res, error);
			} else {
				if (!priceUpdated) {
					Util.errorMessage(res, 'Error al guardar los parametros en la base de datos');
				} else {
					console.log('priceUpdated | ', priceUpdated);
					Util.message(res, priceUpdated);
				}
			}
		});
	} else {
		Util.errorMessage(res, validParams.message);
	}
}

function validateConfigParams(obj) {
	var response = {status: false, message: ''};
	//validar el factor tiempo
	if (
		obj.factortiempo &&
		obj.factortiempo != undefined &&
		obj.factortiempo != null &&
		obj.factortiempo.length > 0
	) {
		if (obj.factortiempo[0].dia && Util.floatValidation(obj.factortiempo[0].dia)) {
			response = {status: true, message: ''};
		} else {
			response = {status: false, message: 'EL valor del dia debe ser numerico'};
		}
		if (obj.factortiempo[0].tarde && Util.floatValidation(obj.factortiempo[0].tarde)) {
			response = {status: true, message: ''};
		} else {
			response = {status: false, message: 'EL valor de la tarde debe ser numerico'};
		}
		if (obj.factortiempo[0].noche && Util.floatValidation(obj.factortiempo[0].noche)) {
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
		if (obj.factorclima[0].value && Util.floatValidation(obj.factorclima[0].value)) {
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
	if (obj.gasolina && Util.floatValidation(obj.gasolina)) {
		response = {status: true, message: ''};
	} else {
		response = {status: false, message: 'EL valor de la gasolina debe ser numerico'};
	}

	//validar la rendimientoxkm
	if (obj.rendimientoxkm && Util.floatValidation(obj.rendimientoxkm)) {
		response = {status: true, message: ''};
	} else {
		response = {status: false, message: 'EL valor del  rendimientoxkm debe ser numerico'};
	}
	//validar la costoChoferXMin
	if (obj.costoChoferXMin && Util.floatValidation(obj.costoChoferXMin)) {
		response = {status: true, message: ''};
	} else {
		response = {status: false, message: 'EL valor del  costoChoferXMin debe ser numerico'};
	}

	//{"factortiempo":[{"dia":1,"tarde":1.5,"noche":2}],
	//"factorclima":[{"code":200,"value":1.5,"name":"Thunderstorm"},
	//{"code":300,"value":1.1,"name":"Drizzle"},{"code":500,"value":1.5,"name":"Rain"},{"code":600,"value":1.5,"name":"Snow"},{"code":700,"value":1.1,"name":"other"},{"code":800,"value":1,"name":"Clear"}],"_id":"5e1b898208242773ed41be15",
	//"gasolina":"20.5","rendimientoxkm":"18","costoChoferXMin":"1.1"}}
	return response;
}

module.exports = {
	getCost,
	getWeatherByCoordinates,
	getDistanceByCoordinates,
	getParams,
	setParams
};
