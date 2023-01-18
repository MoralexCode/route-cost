let app = require('./app');
require('dotenv').config();
let port = process.env.PORT || 5050;
let db = require('mongoose');
db.Promise = global.Promise;
let uri = process.env.MONGODB_URL;
app.listen(port, function() {
    console.log(`============================================================================ `);
    console.log(`Servidor del api rest  escuhando en ${process.env.HOST}:${port}/ `)
    db.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('[db] Conectada con éxito');

            console.log(`============================================================================ `);
        }).catch(err => console.error('[db]', err));
});