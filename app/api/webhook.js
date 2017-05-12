const fork = require('child_process').fork;
const auth = require('koa-basic-auth');
const body = require('koa-body');
const json = require('koa-json');
const contentfulCache = require('../lib/contentful-cache');
const contentfulManagement = require('contentful-management');

module.exports = function (router, {liveStream, constants}) {

    //basis auth middleware is used by the contentful webhook
    const authMiddleware = auth({
        name : process.env.WEBHOOK_USER, 
        pass : process.env.WEBHOOK_PASS, 
    });

    const contentfulClient = contentfulManagement.createClient({
        accessToken : process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN
    });

    //we get a lot of gps signals so we ignore those which are send within 5 seconds of the last signal
    let lastGPSSignal;
    const gpsSignalInterval = 5000;

    /**
     * GPS webhook is called by the gps transmitter
     * 
     * Notice that we don't publish any data to the sse stream here, because:
     * - the gps webhook saves the data in the cms
     * - the cms triggers the /webhook/contentful route
     * - the /webhook/contentful route publishes the data to the sse stream
     */
    router.post('/webhook/gps', body(), json(), async (ctx) => {
        const logTime = (new Date()).toJSON();

        console.log(`${logTime} - Got incoming gps request: ${JSON.stringify(ctx.request.body)}`);

        let {rawData, user, passwd} = ctx.request.body || {};

        //poor man's authentication
        if(user !== process.env.WEBHOOK_USER || passwd !== process.env.WEBHOOK_PASS) {
            ctx.status = 401;
            ctx.body = "Unauthorized";
            return;
        }

        if(!rawData) {
            console.log(`${logTime} - rawData missing`);
            ctx.status = 400;
            ctx.body = "rawData missing";
            return;
        }

        //grab the individual values
        const rawDataValues = rawData.split(",");

        //FIX: strip empty value at the end
        if(rawDataValues[rawDataValues.length-1] === "") {
            rawDataValues.pop();
        }

        console.log(`${logTime} - Got raw data values: ${rawDataValues}`);

        if(rawDataValues.length === 0 || (rawDataValues.length % 3) !== 0) {
            console.log(`${logTime} - rawData wrong length`);
            ctx.status = 400;
            ctx.body = "rawData wrong length";
            return;
        }

        console.log(`Got raw data values: ${rawDataValues}`);

        //currently we assume that the last 3 values are the latest measurements
        let [timestamp, lat, lng] = rawDataValues.slice(-3);

        lat = parseFloat(lat);
        lng = parseFloat(lng);

        //sometimes the gps signal sends -1, -1 which is wrong
        if((lat === -1 && lng === -1) || isNaN(lat) || isNaN(lng)) {
            console.log(`${logTime} - Invalid lat or lng`);
            ctx.status = 400;
            ctx.body = 'Invalid lat or lng';
            return;
        }
 
        //throttle requests
        if(typeof lastGPSSignal !== "undefined" && lastGPSSignal+gpsSignalInterval > Date.now()) {
            console.log(`${logTime} - Ignoring request because of throttling`);
            return;
        }

        lastGPSSignal = Date.now();

        //get the contentful space
        const space = await contentfulClient.getSpace(process.env.CONTENTFUL_SPACE);

        //get the site status entry
        let entry = await space.getEntry(constants.siteStatusEntryId);

        //update the location
        entry.fields.currentLocation['en-EU'] = {lat, lon : lng};

        //update the entry
        entry = await entry.update();
        //...and publish it
        await entry.publish();

        ctx.status = 200;
        ctx.body = {status : "ok"};
    });

    /**
     * Contentful webhook called by the contentful cms
     */
    let cfUpdateQueue = Promise.resolve();
    router.post('/webhook/contentful', authMiddleware, async (ctx) => {
        let {cache = false} = ctx.query || {};

        /**
         * Request the contentful data and publish the current location to the sse stream
         * I added cfUpdateQueue to prevent that updates happen in parallel but this might not be needed
         */
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