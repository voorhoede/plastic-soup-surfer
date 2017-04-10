const writeAtomic = require('./write-atomic');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const axios = require('axios');

const cachePath = process.env.DATA_DIR + "/.juicer_cache";
const juicerEndPoint = 'https://www.juicer.io/api/feeds/plastic-soup';

let cache = null;

exports.startPeriodicUpdate = function () {
    setInterval(this.update, 10000).unref();
}

exports.update = function () {
    return axios.get(juicerEndPoint)
        .catch(() => {})
        .then(res => {
            cache = res.data;
            return writeAtomic(cachePath, JSON.stringify(cache));
        })
        .then(() => cache);
}

exports.get = function () {
    if(cache) {
        return Promise.resolve(cache);
    }
    else {
        return fs.readFileAsync(cachePath, 'utf8')
            .then(contents => {
                return (cache = JSON.parse(contents));
            })
            .catch(() => {
                return this.update();
            });
    }
}