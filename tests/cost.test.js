const supertest = require('supertest');
const assert = require('assert');
const {app, server} = require('../routecost');
const api = supertest(app);
const routeCost = {
	data: {
		origin: {
			place: 'C. Clemente Rueda 56, San Fernando, 52765 Naucalpan de Juárez, Méx., Mexico',
			name: 'Col. Bosques de las Lomas',
			description: 'cielo claro',
			temp: 21.62,
			icon: 'http://openweathermap.org/img/wn/01d@2x.png'
		},
		destination: {
			place: 'Av Vallarta 3959 C.C. Gran Plaza, Local, V1, Don Bosco Vallarta, 45049 Zapopan, Jal., Mexico',
			name: 'Zapopan',
			description: 'cielo claro',
			temp: 25.11,
			icon: 'http://openweathermap.org/img/wn/01d@2x.png'
		},
		cost: '5792.33',
		distance: '526 km',
		time: '6 hours 6 mins',
		message: '#MoralexCode'
	},
	successfull: true
};
describe('Cost', () => {
	test('Get Cost to arrive a one point into Map', async () => {
		await api
			.get('/api/v1/cost/19.3906797/-99.2840425/20.6737776/-103.4056253')
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
