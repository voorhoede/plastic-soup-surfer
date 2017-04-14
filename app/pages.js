const nunjucks = require('nunjucks');
const bluebird = require('bluebird');
const contentfulCache = require('./lib/contentful-cache');
const moment = require('moment');

module.exports = function (router, {constants}) {
    const env = nunjucks.configure("./src", {
        noCache : process.env.NODE_ENV === "development"
    });

    function parseDate(date) {
        let [year, month, day] = date.split("-");

        year = parseInt(year, 10);
        month = parseInt(month, 10);
        day = parseInt(day, 10);

        return Date.UTC(year, month-1, day);
    }


    router.use(async (ctx, next) => {
        const {siteStatus} = ctx.state.baseTemplateData = await contentfulCache.get();

        //how many exploots have been filled. This number is not rounded so you can get 3.5
        const explootProgress = siteStatus[0].fields.donated / constants.donationsPerExploot;

        //the total progress (displayed in the header)
        const donatedProgress = explootProgress / constants.exploots;

        const dayInMilliseconds = 86400000;
        const daysDiff = Date.now() - parseDate(siteStatus[0].fields.startDay);
        const day = Math.floor( daysDiff / dayInMilliseconds ) || 1;

        Object.assign(ctx.state.baseTemplateData, {
            explootProgress, 
            donatedProgress,
            day
        });

        await next();
    });

    router.get('/', ctx => {
        const {event : eventList} = ctx.state.baseTemplateData;

        const now = Date.now();

        const upcomingEvents = eventList
            .filter(event => {
                return new Date(event.fields.date) > now;
            })
            .map(event => {
                return Object.assign({}, event.fields, {
                    date : moment(event.fields.date).format("MMMM Do - YYYY")
                });
            });

        const pastEvents = eventList
            .filter(event => {
                return now > new Date(event.fields.date);
            })
            .map(event => {
                return Object.assign({}, event.fields, {
                    date : moment(event.fields.date).format("MMMM Do - YYYY")
                });
            });

        ctx.body = env.render('views/index/index.html', Object.assign(ctx.state.baseTemplateData, {
            page : 'index',
            pastEvents,
            upcomingEvents
        }));
    });

    router.get('about', ctx => {
        ctx.body = env.render('views/about/about.html', Object.assign(ctx.state.baseTemplateData, {
            page : 'about'
        }));
    });

    router.get('exploot', ctx => {
        const {error = null} = ctx.flash.get() || {};

        ctx.body = env.render('views/exploot/exploot.html', Object.assign(ctx.state.baseTemplateData, {
            page : 'exploot',
            error
        }));
    });

    router.get('expedition', ctx => {
        ctx.body = env.render('views/expedition/expedition.html', Object.assign(ctx.state.baseTemplateData, {
            page : 'expedition'
        }));
    });
}