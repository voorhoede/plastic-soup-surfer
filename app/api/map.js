const axios = require('axios');
const contentfulCache = require('../lib/contentful-cache');
const juicerCache = require('../lib/juicer-cache');
const json = require('koa-json');
const {URL, URLSearchParams} = require('url');

function fixContentfulLocation({lat, lon}) {
    return {lat, lng : lon};
}

module.exports = function (router, {liveStream}) {
    router.get('/map/live', liveStream.middleware());

    router.get('/map/data', json(), async (ctx) => {
        const [juicerFeed, cache] = await Promise.all([
            juicerCache.get(),
            contentfulCache.get()
        ]);

        const juicerFeedItems = juicerFeed.posts.items;

        let mapData = {
            items : [], 
            currentLocation : fixContentfulLocation(cache.siteStatus[0].fields.currentLocation)
        };

        for(let post of cache.highlightedPost) {
            const postUrl = post.fields.url;
            const feedItem = juicerFeedItems.find(item => item.full_url === postUrl);

            if(feedItem) {
                mapData.items.push({
                    message : feedItem.unformatted_message,
                    image   : feedItem.image,
                    date    : new Date(feedItem.external_created_at),
                    loc     : fixContentfulLocation(post.fields.location)
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
                        loc   : fixContentfulLocation(location)
                    };
                })
            );
        }

        ctx.body = mapData;
    });
}