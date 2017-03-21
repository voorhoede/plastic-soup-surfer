const path = require('path');
const axios = require('axios');
const renderContentful = require('../plugins/render-contentful');

function addInstagramFeed(ctx) {
    return axios.get('http://www.instagram.com/instagram/media')
        .then(({data}) => {
            ctx.instafeed = data;
        });
}

function addJuicerFeed(ctx) {
    return axios.get('http://www.juicer.io/api/feeds/devoorhoede?per=10&page=1')
        .then(({}))
}

module.exports = function ({dir}) {
    return this.src('./templates/*')
        .pipe(renderContentful())
        .pipe(this.dest('./build'));
}