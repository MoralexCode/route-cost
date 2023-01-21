const supertest = require('supertest');
const assert = require('assert');
const {app, server} = require('../routecost');
const api = supertest(app);
const weather = {
	data: {
		coord: {
			lon: -103.4056,
			lat: 20.6738
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
			temp: 25.11,
			feels_like: 24.41,
			temp_min: 25.11,
			temp_max: 25.44,
			pressure: 1018,
			humidity: 28
		},
		visibility: 10000,
		wind: {
			speed: 5.66,
			deg: 260
		},
		clouds: {
			all: 0
		},
		dt: 1674340791,
		sys: {
			type: 2,
			id: 268566,
			country: 'MX',
			sunrise: 1674307939,
			sunset: 1674347826
		},
		timezone: -21600,
		id: 3979770,
		name: 'Zapopan',
		cod: 200
	},
	successfull: true
};
describe('Weather', () => {
	test('Get Weather before to arrive a one point into Map', async () => {
		await api
			.get('/api/v1/weather/20.6737776/-103.4056253')
			.expect(200)
			.expect('Content-Type', contentType)
			.then(response => {
				assert(response.body.successfull, weather.successfull);
				assert(response.body.data.coord.lon, weather.data.coord.lon);
				assert(response.body.data.coord.lat, weather.data.coord.lat);
				assert(response.body.data.name, weather.data.name);
			});
	});
});

afterEach(async () => {
	await server.close();
});
