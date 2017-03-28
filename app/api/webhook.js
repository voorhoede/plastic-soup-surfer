const fork = require('child_process').fork;
const auth = require('koa-basic-auth');
const contentfulCache = require('../lib/contentful-cache');

module.exports = function (router) {
    const authMiddleware = auth({
        name : process.env.WEBHOOK_USER, 
        pass : process.env.WEBHOOK_PASS, 
    });

    router.use(authMiddleware);

    let queue = Promise.resolve();

    router.post('/webhook/contentful', async (ctx) => {
        let {cache = false} = ctx.query || {};

        console.log("Contentful webhook!");

        queue = queue.then(() => {
            return contentfulCache.update();
        });

        ctx.body = "Cached!";
    });
}