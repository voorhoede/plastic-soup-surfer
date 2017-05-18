const writeAtomic = require('./write-atomic');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const axios = require('axios');

const cachePath = process.env.DATA_DIR + "/.juicer_cache";
const juicerEndPoint = 'https://www.juicer.io/api/feeds';
//const updateInterval = 5 * 60 * 1000; //every 5 minutes
const updateInterval = 5000

let cache = null;

exports.startPeriodicUpdate = function () {
    setInterval(() => {
        this.update()
            .catch(e => {
                console.log('Error when updating juicer feed');
            });
    }, updateInterval).unref();
}

exports.update = function () {
    return axios.get(juicerEndPoint + "/" + process.env.JUICER_FEED)
        .then(res => {
            cache = res.data;
            return writeAtomic(cachePath, JSON.stringify(cache));
        })
        .then(() => cache);
}

exports.get = function () {
    if(cache) {
        return Promise.resolve(cache); //cache exists in memory
    }
    else {
        return fs.readFileAsync(cachePath, 'utf8') //attempt to read from file
            .then(contents => {
                return (cache = JSON.parse(contents)); //success!
            })
            .catch(() => {
                return this.update(); //no cache in memory and no cache in file
            });
    }
}