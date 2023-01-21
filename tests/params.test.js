const supertest = require('supertest');
const assert = require('assert');
const {app, server} = require('../routecost');
const api = supertest(app);
const params = {
	gasolina: '2',
	rendimientoxkm: '14',
	factortiempo: {
		dia: '1',
		tarde: '1.5',
		noche: '2'
	},
	factorclima: [
		{
			code: 200,
			value: '1.5',
			name: 'Thunderstorm'
		},
		{
			code: 300,
			value: '1.1',
			name: 'Drizzle'
		},
		{
			code: 500,
			value: '1.5',
			name: 'Rain'
		},
		{
			code: 600,
			value: '1.5',
			name: 'Snow'
		},
		{
			code: 700,
			value: '1.1',
			name: 'other'
		},
		{
			code: 800,
			value: '1',
			name: 'Clear'
		},
		{
			code: 801,
			value: '1',
			name: 'Clouds'
		}
	],
	costoChoferXMin: '11'
};
describe('Params', () => {
	test('Get the params to calculate the route cost', async () => {
		await api
			.get('/api/v1/params')
			.expect(200)
			.expect('Content-Type', contentType)
			.then(response => {
				assert(response.body.successfull, params.successfull);
				assert(response.body.successfull, params.gasolina);
				assert(response.body.successfull, params.rendimientoxkm);
				assert(response.body.successfull, params.costoChoferXMin);
			});
	});

	test('Update the params to calculate the route cost', async () => {
		await api
			.put('/api/v1/params')
			.send(params)
			.expect(200)
			.expect('Content-Type', contentType)
			.then(response => {
				assert(response.body.successfull, params.successfull);
				assert(response.body.data.gasolina, params.gasolina);
				assert(response.body.data.rendimientoxkm, params.rendimientoxkm);
				assert(response.body.data.costoChoferXMin, params.costoChoferXMin);
			});
	});
});

afterEach(async () => {
	await server.close();
});
