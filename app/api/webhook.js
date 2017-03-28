const fork = require('child_process').fork;
const auth = require('koa-basic-auth');
const contentful = require('contentful');
const contentfulCache = require('../lib/contentful-cache');

module.exports = function (router) {
    const authMiddleware = auth({
        name : process.env.WEBHOOK_USER, 
        pass : process.env.WEBHOOK_PASS, 
    });

    const client = contentful.createClient({
        accessToken : process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN,
        space       : process.env.CONTENTFUL_SPACE
    });

    router.use(authMiddleware);

    let queue = Promise.resolve();

    router.post('/webhook/contentful', async (ctx) => {
        let {cache = false} = ctx.query || {};

        console.log("Contentful webhook!");

        queue = queue.then(() => {
            return client.getEntries()
                .then(entries => contentfulCache.set(entries));
        });

        ctx.body = "Cached!";
    });
}