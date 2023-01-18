const supertest = require('supertest');
const assert = require('assert');
const {app, server} = require('../routecost');
const api = supertest(app);
const routeCost = {
	data: {
		origin: {
			place: '20 de Noviembre, Aguascalientes, 70710 Santa María Jalapa del Marqués, Oax., Mexico',
			name: 'Jalapa',
			description: 'muy nuboso',
			temp: 30.74,
			icon: 'http://openweathermap.org/img/wn/04d@2x.png'
		},
		destination: {
			place: 'Guelaguetza 120, La Asuncion, 71222 Santa María Atzompa, Oax., Mexico',
			name: 'San Jacinto Amilpas',
			description: 'cielo claro',
			temp: 27.89,
			icon: 'http://openweathermap.org/img/wn/01d@2x.png'
		},
		cost: '2503.07',
		distance: '228 km',
		time: '4 hours 20 mins',
		message: '#AmoTirarCodigo&LosDesplieguesContinuos'
	},
	successfull: true
};
describe('Cost', () => {
	test('Get Cost to arrive a one point into Map', async () => {
		await api
			.get('/api/v1/cost/16.430746/-95.4399602/17.0812951/-96.7707511')
			.expect(200)
			.expect('Content-Type', contentType)
			.then(response => {
				assert(response.body.successfull, routeCost.successfull);
				assert(response.body.data.cost, routeCost.data.cost);
				assert(response.body.data.distance, routeCost.data.distance);
				assert(response.body.data.time, routeCost.data.time);
			});
	});
});

afterEach(async () => {
	await server.close();
});
