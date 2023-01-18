const supertest = require('supertest');
const assert = require('assert');
const {app, server} = require('../routecost');
const api = supertest(app);
const weather = {
	data: {
		coord: {
			lon: -96.7708,
			lat: 17.0813
		},
		weather: [
			{
				id: 800,
				main: 'Clear',
				description: 'cielo claro',
				icon: '01d'
			}
		],
		base: 'stations',
		main: {
			temp: 27.89,
			feels_like: 26.78,
			temp_min: 27.89,
			temp_max: 27.89,
			pressure: 1007,
			humidity: 24,
			sea_level: 1007,
			grnd_level: 842
		},
		visibility: 10000,
		wind: {
			speed: 0.97,
			deg: 155,
			gust: 2.41
		},
		clouds: {
			all: 8
		},
		dt: 1674075003,
		sys: {
			country: 'MX',
			sunrise: 1674046798,
			sunset: 1674087271
		},
		timezone: -21600,
		id: 3801595,
		name: 'San Jacinto Amilpas',
		cod: 200
	},
	successfull: true
};
describe('Weather', () => {
	test('Get Weather before to arrive a one point into Map', async () => {
		await api
			.get('/api/v1/weather/17.0812951/-96.7707511')
			.expect(200)
			.expect('Content-Type', contentType)
			.then(response => {
				assert(response.body.successfull, weather.successfull);
				assert(response.body.data.coord.lon, weather.data.coord.lon);
				assert(response.body.data.coord.lat, weather.data.coord.lat);
				assert(response.body.data.coord.lat, weather.data.coord.lat);
			});
	});
});

afterEach(async () => {
	await server.close();
});
