const nunjucks = require('nunjucks');
const bluebird = require('bluebird');
const contentfulCache = require('./lib/contentful-cache');

module.exports = function (router) {
    const env = nunjucks.configure("./src", {
        noCache : process.env.NODE_ENV === "development"
    });

    router.use(async (ctx, next) => {
        ctx.state.templateData = await contentfulCache.get();
        await next();
    });

    router.get('/', ctx => {
        ctx.body = env.render('views/index/index.html', Object.assign(ctx.state.templateData, {
            page : 'index'
        }));
    });

    router.get('exploot', ctx => {
        ctx.body = env.render('views/exploot/exploot.html', Object.assign(ctx.state.templateData, {
            page : 'exploot'
        }));
    });
}