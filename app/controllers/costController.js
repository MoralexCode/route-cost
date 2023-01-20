'use strict';
const axios = require('axios');
const Record = require('../models/record');
const Price = require('../models/price');
require('dotenv').config();
//APIKEY google maps, APPID key from weather
const {APIKEY, APPID, WEATHER_ZIP_CODE_URL, MAPS_URL} = process.env;
const MAP_URL = MAPS_URL + APIKEY;
const WEATHER_URL = WEATHER_ZIP_CODE_URL + APPID;
const controllerName = 'CostController';

async function getCost(req, res) {
	const {latorigen, lonorigen, latdestino, londestino} = req.params;
	const PARAMS = `&origins=${latorigen},${lonorigen}&destinations=${latdestino},${londestino}`;
	const ORIGINPARAMS = `&lat=${latorigen}&lon=${lonorigen}`;
	const DESTINATIONPARAMS = `&lat=${latdestino}&lon=${londestino}`;

	if (!validateParams(req.params)) sendError(res, 'Latitud y longitud deben de ser numericos');
	const route = await getDistanceByCoordinates(MAP_URL + PARAMS);
	const {destination_addresses, origin_addresses, rows} = route;
	const [elements] = rows[0].elements;
	if (elements.status === 'ZERO_RESULTS' || !destination_addresses || !origin_addresses)
		sendError(res, elements, 'there are not records');

	const originWeather = await getWeatherByCoordinates(WEATHER_URL + ORIGINPARAMS);
	const destinationWeather = await getWeatherByCoordinates(WEATHER_URL + DESTINATIONPARAMS);

	const origin = getPlaceDetails(origin_addresses, originWeather);
	const destination = getPlaceDetails(destination_addresses, destinationWeather);

	const cost = await calculateCost(elements, originWeather, destinationWeather);
	await buildResponse(res, cost, origin, destination, elements);
}
async function getWeatherByCoordinates(url) {
	log(' URL : ', url);
	return await axios
		.get(url)
		.then(function (response) {
			const {data} = response;
			log(data);
			return data;
		})
		.catch(function (error) {
			throw error;
		});
}

async function getDistanceByCoordinates(url) {
	log(' URL : ', url);
	return await axios
		.get(url)
		.then(function (response) {
			const {data} = response;
			log(data);
			return data;
		})
		.catch(function (error) {
			throw error;
		});
}

async function buildResponse(res, cost, origin, destination, elements) {
	const distance = elements.distance.text;
	const time = elements.duration.text;
	let input = cost;
	let output = {
		origin,
		destination,
		cost: cost.costo,
		distance,
		time,
		message: '#AmoTirarCodigo'
	};
	await saveRecord(input, output);
	dataValidation(res, output, controllerName);
}

async function saveRecord(input, output) {
	let record = new Record();
	record.input = input;
	record.output = output;
	return await record.save((err, recordStored) => {
		if (err) log('Error to save record', err);
		if (recordStored) return recordStored;
		log('Has been not  save record');
	});
}

function validateParams(params) {
	const {latorigen, lonorigen, latdestino, londestino} = params;
	log(latorigen, lonorigen, latdestino, londestino);
	if (
		isValidFloat(latorigen) &&
		isValidFloat(lonorigen) &&
		isValidFloat(latdestino) &&
		isValidFloat(londestino)
	) {
		return true;
	}
	return false;
}
// TODO: create a new formula
async function calculateCost(elements, originWeather, destinationWeather) {
	const params = await Price.findOne({}).clone();
	const {gasolina, factorclima, factortiempo, costoChoferXMin} = params;
	const {distance, duration} = elements;
	elements;
	const banderazo = parseFloat(gasolina),
		kilometrosXRecorrer = distance.value / 1000, //kilometros a recorrer
		factorDeClima =
			(getWeatherFactor(factorclima, originWeather) +
				getWeatherFactor(factorclima, destinationWeather)) /
			2, // cual es el factor del clima
		factorTiempo = getDayTime(factortiempo), // Dia, tarde o Noche
		tiempoARecorrerMin = duration.value / 60, // tiempo que se tardará en recorrer esa distancia (minutos)
		tarifaXKilometro = costoChoferXMin; //costo del chofer por minuto(en pesos)
	//valor = [(gastosXkilometroGasolina * NumeroKilometrosARecorrer) (factorDeClima)] + [FactorTiempo * tiempoARecorrerMin * costoChoferXMin]
	//valor = [(1.8 * 6)(1.6)] + (0.5*10) = (10.8 * 1.6) + 5 = 6.48  +5 = 11.48
	return {
		banderazo,
		kilometrosXRecorrer,
		factorDeClima,
		factorTiempo,
		tiempoARecorrerMin,
		costo: (banderazo + tarifaXKilometro * kilometrosXRecorrer).toFixed(2)
	};
}
function getPlaceDetails(addresses, weather) {
	return {
		place: addresses[0],
		name: weather.name,
		description: weather.weather[0].description,
		temp: weather.main.temp,
		icon: 'http://openweathermap.org/img/wn/' + weather.weather[0].icon + '@2x.png'
	};
}
function getWeatherFactor(weatherPrice, weather) {
	const condtions = weatherPrice.find(w => w.code == weather);
	return condtions ? condtions.value : 1.5;
}

function getDayTime(time) {
	const hora = new Date();
	if (hora.getHours() >= 7 && hora.getHours() <= 15) return time.dia; //'Dia'

	if (hora.getHours() >= 16) return time.tarde; //'tarde'

	return time.noche; //'Noche'
}

module.exports = {
	getCost
};
