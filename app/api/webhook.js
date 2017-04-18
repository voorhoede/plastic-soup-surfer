const fork = require('child_process').fork;
const auth = require('koa-basic-auth');
const body = require('koa-body');
const json = require('koa-json');
const contentfulCache = require('../lib/contentful-cache');
const contentfulManagement = require('contentful-management');

module.exports = function (router, {liveStream}) {
    const authMiddleware = auth({
        name : process.env.WEBHOOK_USER, 
        pass : process.env.WEBHOOK_PASS, 
    });

    const contentfulClient = contentfulManagement.createClient({
        accessToken : process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN
    });

    let lastGPSSignal;
    const gpsSignalInterval = 5000;

    router.post('/webhook/gps', body(), json(), async (ctx) => {
        console.log(`${(new Date()).toJSON()} - Got incoming gps request: ${ctx.request.body}`);

        let {lat, lng, user, passwd} = ctx.request.body || {};

        if(user !== process.env.WEBHOOK_USER || passwd !== process.env.WEBHOOK_PASS) {
            ctx.status = 401;
            ctx.body = "Unauthorized";
            return;
        }

        lat = parseFloat(lat);
        lng = parseFloat(lng);

        if(isNaN(lat) || isNaN(lng)) {
            throw new Error('Invalid lat or lng');
        }

        //TODO activate this to 
        // if(typeof lastGPSSignal !== "undefined" && lastGPSSignal+gpsSignalInterval > Date.now()) {
        //     return;
        // }

        lastGPSSignal = Date.now();

        const space = await contentfulClient.getSpace(process.env.CONTENTFUL_SPACE);
        let entry = await space.getEntry('R6yIE4OKKOUGuWWMsaGUa');

        entry.fields.currentLocation['en-EU'] = {lat, lon : lng};

        entry = await entry.update();
        await entry.publish();

        ctx.status = 200;
        ctx.body = {status : "ok"};
    });

    let cfUpdateQueue = Promise.resolve();
    router.post('/webhook/contentful', authMiddleware, async (ctx) => {
        let {cache = false} = ctx.query || {};

        cfUpdateQueue = cfUpdateQueue.then(() => {
            return contentfulCache.update()
                .then(cache => {
                    const {lat, lon : lng} = cache.siteStatus[0].fields.currentLocation;
                    liveStream.publishJSON({lat, lng}, {event : 'live_position'});
                });
        });

        ctx.body = "Contentful webhook was executed";
    });
}