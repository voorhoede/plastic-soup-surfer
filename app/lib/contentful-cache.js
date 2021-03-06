const writeAtomic = require('./write-atomic');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const contentful = require('contentful');

const cachePath = process.env.DATA_DIR + "/.contentful_cache";

let cache = null;

const client = contentful.createClient({
    accessToken : process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN,
    space       : process.env.CONTENTFUL_SPACE
});

exports.update = function () {
    return client.getEntries()
        .then(entries => {
            cache = group(entries.items);
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

function group(items) {
    let grouped = {};
    for(let item of items) {
        const {sys : {contentType : {sys : {id}}}} = item;
        grouped.hasOwnProperty(id)
            ? grouped[id].push(item)
            : (grouped[id] = [item]);
    }

    return grouped;
}