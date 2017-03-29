const axios = require('axios');
const contentfulCache = require('../lib/contentful-cache');
const json = require('koa-json');
const {URL, URLSearchParams} = require('url');

module.exports = function (router) {
    router.get('/map/data', json(), async (ctx) => {
        const [juicerFeed, cache] = await Promise.all([
            axios.get('https://www.juicer.io/api/feeds/plastic-soup'),
            contentfulCache.get()
        ]);

        const juicerFeedItems = juicerFeed.data.posts.items;

        let mapData = {
            items : [], 
            currentLocation : cache.siteStatus[0].fields.currentLocation
        };

        for(let post of cache.highlightedPost) {
            const postUrl = post.fields.url;
            const feedItem = juicerFeedItems.find(item => item.full_url === postUrl);
            if(feedItem) {
                mapData.items.push({
                    message : feedItem.unformatted_message,
                    image   : feedItem.image,
                    date    : new Date(feedItem.external_created_at),
                    loc     : post.fields.location
                });
            }
        }

        if(cache.event) {
            mapData.items = mapData.items.concat(
                cache.event.map(event => {
                    let {description : message, image : imageData, location} = event.fields;

                    const query = new URLSearchParams();
                    query.append('fit', 'crop');
                    query.append('w', '300');

                    return {
                        message, 
                        image : imageData.fields.file.url + "?" + query, 
                        date  : new Date(event.sys.createdAt),
                        loc   : location
                    };
                })
            );
        }

        ctx.body = mapData;
    });
}