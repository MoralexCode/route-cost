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

async function getCost(req, res) {
	const {latorigen, lonorigen, latdestino, londestino} = req.params;
	const PARAMS = `&origins=${latorigen},${lonorigen}&destinations=${latdestino},${londestino}`;
	info(`URL ${MAPS_URL}${PARAMS}`);
	const ORIGINPARAMS = `&lat=${latorigen}&lon=${lonorigen}`;
	const DESTINATIONPARAMS = `&lat=${latdestino}&lon=${londestino}`;
	let resultData = [];

	if (validateParams(latorigen, lonorigen, latdestino, londestino)) {
		const distance = await getDistanceByCoordinates(MAPS_URL + PARAMS);
		const {destination_addresses, origin_addresses} = distance;
		resultData.push(distance);

		// const {destination_addresses, origin_addresses} = response.data;
		if (destination_addresses && origin_addresses) {
			const originWeather = await getWeatherByCoordinates(
				WEATHER_ZIP_CODE_URL + ORIGINPARAMS
			);
			const destinationWeather = await getWeatherByCoordinates(
				WEATHER_ZIP_CODE_URL + DESTINATIONPARAMS
			);
			resultData.push(originWeather);
			resultData.push(destinationWeather);

			const origin = {
				place: resultData[0].origin_addresses[0],
				name: resultData[1].name,
				description: resultData[1].weather[0].description,
				temp: resultData[1].main.temp,
				icon:
					'http://openweathermap.org/img/wn/' + resultData[1].weather[0].icon + '@2x.png'
			};
			const destination = {
				place: resultData[0].destination_addresses[0],
				name: resultData[2].name,
				description: resultData[2].weather[0].description,
				temp: resultData[2].main.temp,
				icon:
					'http://openweathermap.org/img/wn/' + resultData[2].weather[0].icon + '@2x.png'
			};
			let distance = 0;
			let time = 0;
			if (resultData[0].rows[0].elements[0].status != 'ZERO_RESULTS') {
				distance = resultData[0].rows[0].elements[0].distance.text;
				time = resultData[0].rows[0].elements[0].duration.text;
			} else {
				log('No hay resultados para la distancia| ', resultData[0].rows[0].elements[0]);
			}

			const precio = await Price.findOne({}).clone();
			log(`precio | ${precio} ${resultData} ${origin} ${destination} ${distance} ${time}`);
			await buildResponse(precio, resultData, origin, destination, distance, time, res);
		} else {
			console.log('response.data: vacio ', response.data);
			sendError(res, {params: PARAMS, status: 'Location not found'});
		}
	} else {
		sendError(res, 'Latitud y longitud deben de ser numericos');
	}
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

function validateParams(lat, lon, lat2, lon2) {
	log(lat, lon, lat2, lon2);
	if (isValidFloat(lat) && isValidFloat(lon) && isValidFloat(lat2) && isValidFloat(lon2)) {
		return true;
	}
	return false;
}

function calculateCost(input, km, time, weatherCodeOrigin, weatherCodeDestination) {
	/**Se agrega modificación , dado que inicialmente se va contratar un servicio de transporte que recoja las muestras */
	console.log('getWeatherFactor |', getWeatherFactor(input.factorclima, weatherCodeOrigin));
	const banderazo = parseFloat(input.gasolina),
		kilometrosXRecorrer = km / 1000, //numero de kilometros a recorrer
		factorDeClima =
			(getWeatherFactor(input.factorclima, weatherCodeOrigin) +
				getWeatherFactor(input.factorclima, weatherCodeDestination)) /
			2, // cual es el factor del clima
		factorTiempo = getDayTime(input.factortiempo), // Dia, tarde o Noche
		tiempoARecorrerMin = time / 60, // tiempo que se tardará en recorrer esa distancia (minutos)
		tarifaXKilometro = input.costoChoferXMin; //costo del chofer por minuto(en pesos)
	//valor = [(gastosXkilometroGasolina * NumeroKilometrosARecorrer) (factorDeClima)] + [FactorTiempo * tiempoARecorrerMin * costoChoferXMin]
	//valor = [(1.8 * 6)(1.6)] + (0.5*10) = (10.8 * 1.6) + 5 = 6.48  +5 = 11.48
	return {
		banderazo,
		kilometrosXRecorrer,
		factorDeClima,
		factorTiempo,
		tiempoARecorrerMin,
		banderazo,
		kilometrosXRecorrer,
		factorDeClima,
		tiempoARecorrerMin,
		costo: banderazo + tarifaXKilometro * kilometrosXRecorrer
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
