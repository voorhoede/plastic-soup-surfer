const bluebird = require('bluebird');
const contentfulCache = require('./lib/contentful-cache');
const getSocialFeed = require('./lib/get-social-feed');
const moment = require('moment');

module.exports = function (router, {constants, nunjucksEnv}) {

    function parseDate(date) {
        let [year, month, day] = date.split("-");

        year = parseInt(year, 10);
        month = parseInt(month, 10);
        day = parseInt(day, 10);

        return Date.UTC(year, month-1, day);
    }

    function getGroupedEvents(eventList) {
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

        return {upcomingEvents, pastEvents};
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
        const distance = siteStatus[0].fields.distance;

        Object.assign(ctx.state.baseTemplateData, {
            explootProgress, 
            donatedProgress,
            day,
            distance
        });

        await next();
    });

    router.get('/', async (ctx) => {
        const {upcomingEvents, pastEvents} = getGroupedEvents(ctx.state.baseTemplateData.event);
        const socialFeed = await getSocialFeed(0, 24);

        ctx.body = nunjucksEnv.render('views/index/index.html', Object.assign(ctx.state.baseTemplateData, {
            page : 'index',
            pastEvents,
            upcomingEvents,
            socialFeed
        }));
    });

    router.get('about', ctx => {
        ctx.body = nunjucksEnv.render('views/about/about.html', Object.assign(ctx.state.baseTemplateData, {
            page : 'about'
        }));
    });

    router.get('exploot', ctx => {
        const {error = null} = ctx.flash.get() || {};

        ctx.body = nunjucksEnv.render('views/exploot/exploot.html', Object.assign(ctx.state.baseTemplateData, {
            page : 'exploot',
            error
        }));
    });

    router.get('expedition', ctx => {
        ctx.body = nunjucksEnv.render('views/expedition/expedition.html', Object.assign(ctx.state.baseTemplateData, {
            page : 'expedition'
        }));
    });
}