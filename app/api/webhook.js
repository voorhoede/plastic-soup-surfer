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
        const timestamp = (new Date()).toJSON();

        console.log(`${timestamp} - Got incoming gps request: ${ctx.request.body}`);

        let {rawData, user, passwd} = ctx.request.body || {};

        if(user !== process.env.WEBHOOK_USER || passwd !== process.env.WEBHOOK_PASS) {
            ctx.status = 401;
            ctx.body = "Unauthorized";
            return;
        }

        if(!rawData) {
            console.log(`${timestamp} - rawData missing`);
            ctx.status = 400;
            ctx.body = "rawData missing";
            return;
        }

        //grab the individual values
        const rawDataValues = rawData.split(",");

        console.log(`${timestamp} - Got raw data values: ${rawDataValues}`);

        if(rawDataValues.length === 0 || (rawDataValues.length % 3) !== 0) {
            console.log(`${timestamp} - rawData wrong length`);
            ctx.status = 400;
            ctx.body = "rawData wrong length";
            return;
        }

        console.log(`Got raw data values: ${rawDataValues}`);

        //currently we assume that the last 3 values are the latest measurements
        const [timestamp, lat, lng] = rawDataValues.slice(-3);

        lat = parseFloat(lat);
        lng = parseFloat(lng);

        if(isNaN(lat) || isNaN(lng)) {
            console.log(`${timestamp} - Invalid lat or lng`);
            ctx.status = 400;
            ctx.body = 'Invalid lat or lng';
            return;
        }
 
        //throttle requests
        if(typeof lastGPSSignal !== "undefined" && lastGPSSignal+gpsSignalInterval > Date.now()) {
            console.log(`${timestamp} - Ignoring request because of throttling`);
            return;
        }

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