const nunjucks = require('nunjucks');
const bluebird = require('bluebird');
const contentfulCache = require('./lib/contentful-cache');

module.exports = function (router) {
    const env = nunjucks.configure("./src", {
        noCache : process.env.NODE_ENV === "development"
    });

    router.use(async (ctx, next) => {
        const {siteStatus} = ctx.state.baseTemplateData = await contentfulCache.get();
        
        Object.assign(ctx.state.baseTemplateData, {
            donatedProgress : Math.round( siteStatus[0].fields.donated / 10000 )
        });

        await next();
    });

    router.get('/', ctx => {
        ctx.body = env.render('views/index/index.html', Object.assign(ctx.state.baseTemplateData, {
            page : 'index'
        }));
    });

    router.get('exploot', ctx => {
        const {error = null} = ctx.flash.get() || {};

        ctx.body = env.render('views/exploot/exploot.html', Object.assign(ctx.state.baseTemplateData, {
            page : 'exploot',
            error
        }));
    });
}