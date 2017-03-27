const levelup = require('levelup');
const bluebird = require('bluebird');

const db = levelup(process.env.DATA_DIR + '/db', {
    valueEncoding : 'json'
});
bluebird.promisifyAll(db);

module.exports = db;