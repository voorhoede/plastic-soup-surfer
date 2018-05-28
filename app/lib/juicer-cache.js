const writeAtomic = require('./write-atomic');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const axios = require('axios');

const cachePath = process.env.DATA_DIR + "/.juicer_cache";
const juicerEndPoint = 'https://www.juicer.io/api/feeds';
const updateInterval = 60 * 60 * 1000; // every hour

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

    function retrieveAllPages() {
        let pageNum = 1, juicerFeed;

        function retrieveNextPage() {
            return axios.get(juicerEndPoint + "/" + process.env.JUICER_FEED + "?page=" + (pageNum++))
                .then(({data}) => {
                    if(!juicerFeed) {
                        juicerFeed = data;
                    }
                    else if(data.posts.items.length) {
                        juicerFeed.posts.items = juicerFeed.posts.items.concat( data.posts.items );
                    }

                    if(data.posts.items.length) {
                        return retrieveNextPage();
                    }

                    return juicerFeed;
                });
        }

        return retrieveNextPage();
    }

    return retrieveAllPages()
        .then(data => {
            cache = data;
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
