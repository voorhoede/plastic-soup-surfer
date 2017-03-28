const nunjucks = require('nunjucks');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));

module.exports = function (router) {
    const env = nunjucks.configure("./src", {
        noCache : process.env.NODE_ENV === "development"
    });

    router.use(async (ctx, next) => {
        let templateData = {};
        try {
            templateData = JSON.parse( await fs.readFileAsync(process.env.DATA_DIR + "/.contentful_cache", "utf8") );
        }
        catch(e) {}

        ctx.state.templateData = templateData;
        await next();
    });

    router.get('/', ctx => {
        ctx.body = env.render('views/index/index.html', ctx.state.templateData);
    });

    router.get('exploot', ctx => {
        ctx.body = env.render('views/exploot/exploot.html', ctx.state.templateData);
    });
}