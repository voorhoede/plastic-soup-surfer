const axios = require('axios');
const contentfulCache = require('../lib/contentful-cache');
const juicerCache = require('../lib/juicer-cache');
const json = require('koa-json');
const {URL, URLSearchParams} = require('url');

function fixContentfulLocation({lat, lon}) {
    return {lat, lng : lon};
}

module.exports = function (router, {liveStream, constants}) {
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

        //lookup the highlighted posts from contentful and check if a similar post exists in juicer
        for(let post of cache.highlightedPost) {
            const postUrl = post.fields.url;

            //match by url (this should work fine)
            const feedItem = juicerFeedItems.find(item => item.full_url === postUrl);

            if(feedItem) {
                mapData.items.push({
                    type    : 'highlighted-post',
                    source  : feedItem.source.source,
                    message : feedItem.unformatted_message,
                    image   : feedItem.image,
                    date    : new Date(feedItem.external_created_at),
                    loc     : fixContentfulLocation(post.fields.location)
                });
            }
        }

        if(cache.event) {

            //only return the events which need to be shown on the map
            const eventsOnMap = cache.event.filter(event => {
                return event.fields.showOnMap;
            });

            mapData.items = mapData.items.concat(
                eventsOnMap.map(event => {
                    let {description : message, title, image : imageData, location} = event.fields;

                    const query = new URLSearchParams();
                    query.append('fit', 'fill');
                    query.append('w', constants.mapItemImageWidth);

                    return {
                        type : "event",
                        message, 
                        title,
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