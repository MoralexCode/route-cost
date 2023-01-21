const supertest = require('supertest');
const assert = require('assert');
const {app, server} = require('../routecost');
const api = supertest(app);
const distance = {
	data: {
		destination_addresses: [
			'Av Vallarta 3959 C.C. Gran Plaza, Local, V1, Don Bosco Vallarta, 45049 Zapopan, Jal., Mexico'
		],
		origin_addresses: [
			'C. Clemente Rueda 56, San Fernando, 52765 Naucalpan de Juárez, Méx., Mexico'
		],
		rows: [
			{
				elements: [
					{
						distance: {
							text: '526 km',
							value: 526394
						},
						duration: {
							text: '6 hours 6 mins',
							value: 21975
						},
						status: 'OK'
					}
				]
			}
		],
		status: 'OK'
	},
	successfull: true
};

describe('distance', () => {
	test('Get distance before to arrive a one point into Map', async () => {
		await api
			.get('/api/v1/distance/19.3906797/-99.2840425/20.6737776/-103.4056253')
			.expect(200)
			.expect('Content-Type', contentType)
			.then(response => {
				assert(response.body.successfull, distance.successfull);
				assert(
					response.body.data.destination_addresses,
					distance.data.destination_addresses
				);
				assert(response.body.data.origin_addresses, distance.data.origin_addresses);
				assert(response.body.data.status, distance.data.status);
			});
	});
});

afterEach(async () => {
	await server.close();
});
