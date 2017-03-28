const writeAtomic = require('./write-atomic');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));

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

let cache = null;
const cachePath = process.env.DATA_DIR + "/.contentful_cache";

exports.get = function () {
    if(cache) {
        return Promise.resolve(cache);
    }
    else {
        return fs.readFileAsync(cachePath, 'utf8')
            .then(contents => {
                return (cache = JSON.parse(contents));
            });
    }
}

exports.set = function ({items}) {
    //group by contentType (makes the data easier to query)
    cache = group(items);

    return writeAtomic(cachePath, JSON.stringify(cache));
}