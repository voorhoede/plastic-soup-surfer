const fork = require('child_process').fork;
const auth = require('koa-basic-auth');
const contentful = require('contentful');
const writeAtomic = require('../lib/write-atomic');

function group(items) {
    let grouped = {};
    for(let item of items) {
        const {sys : {contentType : {sys : {id}}}} = item;
        grouped.hasOwnProperty(id)
            ? grouped[id].push(item)
            : (grouped[id] = [item]);
    }

    return grouped;
}

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
                .then(({items}) => {
                    //group by contentType (makes the data easier to query)
                    const data = group(items);

                    //queue
                    return writeAtomic(process.env.DATA_DIR + "/.contentful_cache", JSON.stringify(data));
                });
        });

        ctx.body = "Cached!";
    });
}