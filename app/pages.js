const nunjucks = require('nunjucks');
const bluebird = require('bluebird');
const contentfulCache = require('./lib/contentful-cache');

module.exports = function (router, {constants}) {
    const env = nunjucks.configure("./src", {
        noCache : process.env.NODE_ENV === "development"
    });

    router.use(async (ctx, next) => {
        const {siteStatus} = ctx.state.baseTemplateData = await contentfulCache.get();

        //how many exploots have been filled. This number is not rounded so you can get 3.5
        const explootProgress = siteStatus[0].fields.donated / constants.donationsPerExploot;

        //the total progress (displayed in the header)
        const donatedProgress = explootProgress / constants.exploots;
        
        Object.assign(ctx.state.baseTemplateData, {explootProgress, donatedProgress});

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