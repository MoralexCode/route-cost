'use strict';
const axios = require('axios');
const Record = require('../models/record');
const Price = require('../models/price');
require('dotenv').config();
const APIKEY = process.env.APIKEY; //api key google maps
const APPID = process.env.APPID; //API key from weather
const MAPS_URL = process.env.MAPS_URL + APIKEY;
const WEATHER_ZIP_CODE_URL = process.env.WEATHER_ZIP_CODE_URL + APPID;
const controllerName = 'CostController';

const error = console.error;

function getCost(req, res) {
	const {latorigen, lonorigen, latdestino, londestino} = req.params;
	const PARAMS = `&origins=${latorigen},${lonorigen}&destinations=${latdestino},${londestino}`;
	info(`URL ${MAPS_URL}${PARAMS}`);
	const ORIGINPARAMS = `&lat=${latorigen}&lon=${lonorigen}`;
	const DESTINATIONPARAMS = `&lat=${latdestino}&lon=${londestino}`;
	let resultData = [];

	if (validateParams(latorigen, lonorigen, latdestino, londestino)) {
		axios
			.get(MAPS_URL + PARAMS)
			.then(function (response) {
				const {data} = response;
				resultData.push(data);
				log(data);
				if (
					data &&
					data.destination_addresses &&
					data.destination_addresses[0] != '' &&
					data.origin_addresses &&
					data.origin_addresses[0] != ''
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
										log(
											'No hay resultados para la distancia| ',
											resultData[0].rows[0].elements[0]
										);
									}

									let precio = await findPrice();
									log(
										`precio | ${precio} ${resultData} ${origin} ${destination} ${distance} ${time}`
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
									log('error : ', error);
									sendError(res, error);
								});
						})
						.catch(function (error) {
							console.log('error : ', error);
							sendError(res, error);
						});
				} else {
					console.log('response.data: vacio ', response.data);
					sendError(res, {params: PARAMS, status: 'Location not found'});
				}
			})
			.catch(function (error) {
				console.log('error : ', error);
				sendError(res, error);
			});
	} else {
		sendError(res, 'Latitud y longitud deben de ser numericos');
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
	dataValidation(res, output, controllerName);
}
async function findPrice() {
	return await Price.findOne({}, (err, price) => {
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
	}).clone();
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
	log(lat, lon, lat2, lon2);
	if (isValidFloat(lat) && isValidFloat(lon) && isValidFloat(lat2) && isValidFloat(lon2)) {
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
	//     valor = [(gastosXkilometroGasolina * NumeroKilometrosARecorrer) (factorDeClima)] + [FactorTiempo * tiempoARecorrerMin * costoChoferXMin]
	//     console.log("Resultado :", gastosXkilometroGasolina, kilometrosXRecorrer, factorDeClima, factorTiempo, tiempoARecorrerMin, costoChoferXMin, '= ', gastosXkilometroGasolina * kilometrosXRecorrer * factorDeClima) + (factorTiempo * tiempoARecorrerMin * costoChoferXMin)
	//     return { gastosXkilometroGasolina, kilometrosXRecorrer, factorDeClima, factorTiempo, tiempoARecorrerMin, costoChoferXMin, gastosXkilometroGasolina, kilometrosXRecorrer, factorDeClima, factorTiempo, tiempoARecorrerMin, costoChoferXMin, costo: (gastosXkilometroGasolina * kilometrosXRecorrer * factorDeClima) + (factorTiempo * tiempoARecorrerMin * costoChoferXMin) }
	//     valor = [(1.8 * 6)(1.6)] + (0.5*10) = (10.8 * 1.6) + 5 = 6.48  +5 = 11.48
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
	const hora = new Date();
	if (hora.getHours() >= 7 && hora.getHours() <= 15) return time.dia; //'Dia'

	if (hora.getHours() >= 16) return time.tarde; //'tarde'

	return time.noche; //'Noche'
}

async function getParams(req, res) {
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
}

function setParams(req, res) {
	var update = req.body;
	var _id = req.params.id;
	var validParams = validateConfigParams(update);
	if (validParams.status) {
		Price.findOneAndUpdate(_id, update, (err, priceUpdated) => {
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

module.exports = {
	getCost,
	getParams,
	setParams
};
