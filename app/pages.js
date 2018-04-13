const bluebird = require('bluebird');
const contentfulCache = require('./lib/contentful-cache');
const getSocialFeed = require('./lib/get-social-feed');
const paymentApi = require('./lib/payment-api');
const nunjucksMarkdown = require('./lib/nunjucks-markdown');
const moment = require('moment');

module.exports = function (router, {constants, nunjucksEnv}) {
    nunjucksMarkdown(nunjucksEnv);

    const devMode = process.env.NODE_ENV === "development";

    let manifest; 
    if(!devMode) {
        manifest = require(process.env.DIST_DIR + "/rev-manifest.json");
    }

    function parseDate(date) {
        let [year, month, day] = date.split("-");

        year = parseInt(year, 10);
        month = parseInt(month, 10);
        day = parseInt(day, 10);

        return Date.UTC(year, month-1, day);
    }

    function getGroupedEvents(eventList) {
        const now = Date.now();

        eventList = eventList.map(event => {
            return Object.assign({}, event.fields, {
                timestamp : moment(event.fields.date),
                date      : moment(event.fields.date).format("MMMM Do - YYYY")
            });
        });

        const upcomingEvents = eventList.filter(event => event.timestamp > now).sort((a,b) => {
            return a.timestamp.valueOf() - b.timestamp.valueOf();
        });
        const pastEvents = eventList.filter(event => now > event.timestamp).sort((a,b) => {
            return b.timestamp.valueOf() - a.timestamp.valueOf();
        });
        
        return {upcomingEvents, pastEvents};
    }

    router.use(async (ctx, next) => {
        const {siteStatus} = ctx.state.baseTemplateData = await contentfulCache.get();

        //how many exploots have been filled. This number is not rounded so you can get 3.5
        const explootProgress = siteStatus[0].fields.donated / constants.donationsPerExploot;

        //the total progress (displayed in the header & exploot page)
        let donatedProgress = Math.ceil((explootProgress / constants.exploots) * 100);

        if(donatedProgress > 100) {
            donatedProgress -= 100;
        }

        const dayInMilliseconds = 86400000;
        const daysDiff = Date.now() - parseDate(siteStatus[0].fields.startDay);
        const day = Math.max( Math.floor( daysDiff / dayInMilliseconds ), 1) || 1;
        const distance = siteStatus[0].fields.distance;
        const phase = siteStatus[0].fields.phase;

        Object.assign(ctx.state.baseTemplateData, {
            explootProgress, 
            donatedProgress,
            day,
            distance,
            phase,
            mainCSS : devMode ? "/assets/css/main.css" : manifest['assets/css/main.css'],
            allJS : devMode ? "/assets/js/all.js" : manifest['assets/js/all.js']
        });

        try {
            await next();
        }
        catch(e) {
            console.log(e.message); //keep this so we can see the cause of the errors

            ctx.status = 500;
            ctx.body = nunjucksEnv.render('views/500/500.html', Object.assign(ctx.state.baseTemplateData, {
                page : '500'
            })); 
        }
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
        const {error = null, donationState = paymentApi.states.NOT_STARTED} = ctx.flash.get() || {};

        ctx.body = nunjucksEnv.render('views/exploot/exploot.html', Object.assign(ctx.state.baseTemplateData, {
            page : 'exploot',
            error,
            donationState
        }));
    });

    router.get('expedition', ctx => {
        ctx.body = nunjucksEnv.render('views/expedition/expedition.html', Object.assign(ctx.state.baseTemplateData, {
            page : 'expedition'
        }));
    });

    router.get('*', ctx => {
        ctx.body = nunjucksEnv.render('views/404/404.html', Object.assign(ctx.state.baseTemplateData, {
            page : '404'
        })); 
    });

}