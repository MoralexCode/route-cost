'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PriceSchema = Schema({
	gasolina: String,
	rendimientoxkm: String, //cuantos KM rinde un L de gas en el vehiculo
	factortiempo: Schema.Types.Mixed, //Dia , Tarde, Noche
	factorclima: [Schema.Types.Mixed], //Dia , Tarde, Noche
	costoChoferXMin: String //Costo del chofer por minuto
});
module.exports = mongoose.model('Price', PriceSchema);
