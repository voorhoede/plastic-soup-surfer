const axios = require('axios');
const contentfulCache = require('../lib/contentful-cache');
const juicerCache = require('../lib/juicer-cache');
const json = require('koa-json');
const {URL, URLSearchParams} = require('url');

module.exports = function (router, {liveStream, constants, nunjucksEnv}) {
    function fixContentfulLocation({lat, lon}) {
        return {lat, lng : lon};
    }

    function mapJuicerItemToSocialCard(juicerItem) {
        return {
            imageUrl : juicerItem.image,
            title : null,
            social : {
                type : juicerItem.source.source,
                url : juicerItem.full_url
            },
            body : juicerItem.message
        };
    }

    function mapEventToSocialCard({fields}) {
        const query = new URLSearchParams();
        query.append('fit', 'fill');
        query.append('w', constants.mapOverlayImageWidth);

        return {
            imageUrl : fields.image.fields.file.url + "?" + query,
            title    : fields.title,
            social   : null,
            body     : fields.description
        };
    }

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

        if(cache.highlightedPost) {
            //lookup the highlighted posts from contentful and check if a similar post exists in juicer
            for(let post of cache.highlightedPost) {
                const postUrl = post.fields.url;

                //match by url (this should work fine)
                const juicerItem = juicerFeedItems.find(item => item.full_url === postUrl);

                if(juicerItem) {
                    mapData.items.push({
                        type    : 'highlighted-post',
                        html    : nunjucksEnv.render('components/social-card/social-card.api.html', {
                            feedItem : mapJuicerItemToSocialCard(juicerItem)
                        }),
                        date    : new Date(juicerItem.external_created_at),
                        loc     : fixContentfulLocation(post.fields.location)
                    });
                }
            }
        }

        if(cache.event) {

            //only return the events which need to be shown on the map
            const eventsOnMap = cache.event.filter(event => {
                return event.fields.showOnMap;
            });

            mapData.items = mapData.items.concat(
                eventsOnMap.map(event => {
                    return {
                        type : "event",
                        html : nunjucksEnv.render('components/social-card/social-card.api.html', {
                            feedItem : mapEventToSocialCard(event)
                        }),
                        date  : new Date(event.sys.createdAt),
                        loc : fixContentfulLocation(event.fields.location)
                    };
                })
            );
        }

        ctx.body = mapData;
    });
}