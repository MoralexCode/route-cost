const supertest = require('supertest');
const assert = require('assert');
const {app, server} = require('../routecost');
const api = supertest(app);
const distance = {
	data: {
		destination_addresses: [
			'Guelaguetza 120, La Asuncion, 71222 Santa María Atzompa, Oax., Mexico'
		],
		origin_addresses: [
			'20 de Noviembre, Aguascalientes, 70710 Santa María Jalapa del Marqués, Oax., Mexico'
		],
		rows: [
			{
				elements: [
					{
						distance: {
							text: '228 km',
							value: 227552
						},
						duration: {
							text: '4 hours 20 mins',
							value: 15602
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
			.get('/api/v1/distance/16.430746/-95.4399602/17.0812951/-96.7707511')
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
