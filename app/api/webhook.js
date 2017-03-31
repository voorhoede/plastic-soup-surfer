const fork = require('child_process').fork;
const auth = require('koa-basic-auth');
const body = require('koa-body');
const json = require('koa-json');
const contentfulCache = require('../lib/contentful-cache');
const contentfulManagement = require('contentful-management');

module.exports = function (router) {
    const authMiddleware = auth({
        name : process.env.WEBHOOK_USER, 
        pass : process.env.WEBHOOK_PASS, 
    });

    const contentfulClient = contentfulManagement.createClient({
        accessToken : process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN
    });

    router.use(authMiddleware);

    let queue = Promise.resolve();

    router.post('/webhook/gps', body(), json(), async (ctx) => {
        let {lat, lng} = ctx.request.body || {};

        lat = parseFloat(lat);
        lng = parseFloat(lng);

        if(isNaN(lat) || isNaN(lng)) {
            throw new Error('Invalid lat or lng');
        }

        const space = await contentfulClient.getSpace(process.env.CONTENTFUL_SPACE);
        let entry = await space.getEntry('R6yIE4OKKOUGuWWMsaGUa');

        entry.fields.currentLocation['en-EU'] = {lat, lon : lng};

        entry = await entry.update();
        await entry.publish();

        ctx.status = 200;
        ctx.body = {status : "ok"};
    });

    router.post('/webhook/contentful', async (ctx) => {
        let {cache = false} = ctx.query || {};

        console.log("Contentful webhook!");

        queue = queue.then(() => contentfulCache.update());

        ctx.body = "Cached!";
    });
}