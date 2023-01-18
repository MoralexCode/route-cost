'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const RecordSchema = Schema({
    time: {
        type: Date,
        default: Date.now
    },
    input: [Schema.Types.Mixed],
    output: [Schema.Types.Mixed],
});
module.exports = mongoose.model('Record', RecordSchema)