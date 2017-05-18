const axios = require('axios');
const contentfulCache = require('../lib/contentful-cache');
const juicerCache = require('../lib/juicer-cache');
const json = require('koa-json');
const url = require('url');
const {URL, URLSearchParams} = require('url');

module.exports = function (router, {liveStream, constants, nunjucksEnv}) {
    function fixContentfulLocation({lat, lon}) {
        return {lat, lng : lon};
    }

    /**
     * Get the juicer item which matches the highlighted post
     * A naive way to determine the juicer item to just check if one of the items has a url which matches the url in the post
     * A better way is to look at the id (which needs to be extracted from the url)
     */
    function getJuicerItemForHighlightedPost(juicerFeedItems, {fields}) {
        let juicerItem;

        //first try the naive method
        juicerItem = juicerFeedItems.find(item => item.full_url === fields.url);
        if(juicerItem) {
            return juicerItem;
        }

        let url;
        try {
            url = new URL(fields.url);
        }
        catch(e) {
            return null;
        }
        
        url.hostname = url.hostname.replace(/^www\./, "");

        let id;
        switch(url.hostname) {
            case "youtu.be" :
            case "youtube.nl" :
            case "youtube.com" :
                if(url.search) { //youtube.com/watch?v={id}
                    id = url.searchParams.v;
                }
                else { //youtube.com/{id}
                    id = url.pathname.substr(1);
                }

                return juicerFeedItems.find(item => item.external_id === id);

            case "twitter.com" :
            case "facebook.com" :
                if(url.pathname.endsWith("/")) {
                    url.pathname = url.pathname.slice(0, -1); //chop of the last slash
                }
                id = url.pathname.split("/").pop();
                
                return juicerFeedItems.find(item => item.external_id === id);
        }

        return null;
    }

    /**
     * Converts a juicer item to template data which can consumed by the social-card template
     * @param {*} juicerItem 
     */
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

    /**
     * Converts a contentful event to template data which can consumed by the social-card template
     * @param {*} param0 
     */
    function mapEventToSocialCard({fields}) {
        //use the contentful image api to return a scaled/ cropped image
        const query = new URLSearchParams();
        query.append('fit', 'fill');
        query.append('w', constants.mapOverlayImageWidth);

        return {
            imageUrl : fields.image ? fields.image.fields.file.url + "?" + query : null,
            title    : fields.title,
            social   : null,
            body     : fields.description
        };
    }

    router.get('/map/live', liveStream.middleware());

    router.get('/map/data', json(), async (ctx) => {
        ctx.set('Cache-Control', 'no-cache');

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
                
                //match by url (this should work fine)
                const juicerItem = getJuicerItemForHighlightedPost(juicerFeedItems, post);

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