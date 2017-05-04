const getSocialFeed = require('../lib/get-social-feed');
const json = require('koa-json');
const nunjucks = require('nunjucks');

module.exports = function (router, {nunjucksEnv}) {
    router.get('/social-feed', json(), async (ctx) => {
        const {offsetId = "", limit = 12} = ctx.query;

        const {posts, next} = await getSocialFeed(offsetId, limit);

        ctx.body = {
            next,
            posts : posts.map(post => {
                return nunjucksEnv.render('components/social-card/social-card.api.html', {feedItem : post});
            })
        }
    });
}