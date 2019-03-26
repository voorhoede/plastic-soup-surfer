'use strict';

const contentfulCache = require('./lib/contentful-cache');
const getSocialFeed = require('./lib/get-social-feed');
const paymentApi = require('./lib/payment-api');
const nunjucksMarkdown = require('./lib/nunjucks-markdown');
const moment = require('moment');
const path = require('path');

module.exports = function(router, { constants, nunjucksEnv }) {
    nunjucksMarkdown(nunjucksEnv);

    const devMode = process.env.NODE_ENV === 'development';

    let manifest;
    if (!devMode) {
        manifest = require(path.join(
            '..',
            process.env.DIST_DIR,
            'rev-manifest.json'
        ));
    }

    function parseDate(date) {
        let [year, month, day] = date.split('-');

        year = parseInt(year, 10);
        month = parseInt(month, 10);
        day = parseInt(day, 10);

        return Date.UTC(year, month - 1, day);
    }

    function getGroupedEvents(eventList) {
        const now = Date.now();

        eventList = eventList.map(event => {
            return Object.assign({}, event.fields, {
                timestamp: moment(event.fields.date),
                date: moment(event.fields.date).format('MMMM Do - YYYY'),
            });
        });

        const upcomingEvents = eventList
            .filter(event => event.timestamp > now)
            .sort((a, b) => {
                return a.timestamp.valueOf() - b.timestamp.valueOf();
            });
        const pastEvents = eventList
            .filter(event => now > event.timestamp)
            .sort((a, b) => {
                return b.timestamp.valueOf() - a.timestamp.valueOf();
            });

        return { upcomingEvents, pastEvents };
    }

    router.use(async (ctx, next) => {
        ctx.state.baseTemplateData = Object.assign(
            await contentfulCache.get(),
            {
                mainCSS: devMode
                    ? 'assets/css/main.css'
                    : manifest['assets/css/main.css'],
                allJS: devMode
                    ? 'assets/js/all.js'
                    : manifest['assets/js/all.js'],
            }
        );

        try {
            await next();
        } catch (e) {
            console.error(e.message); //keep this so we can see the cause of the errors

            ctx.status = 500;
            ctx.body = nunjucksEnv.render(
                'views/500/500.html',
                Object.assign(ctx.state.baseTemplateData, {
                    page: '500',
                })
            );
        }
    });

    router.get('/', async ctx => {
        const { upcomingEvents, pastEvents } = getGroupedEvents(
            ctx.state.baseTemplateData.event
        );
        const socialFeed = await getSocialFeed(0, 24);

        ctx.body = nunjucksEnv.render(
            'views/index/index.html',
            Object.assign(ctx.state.baseTemplateData, {
                page: 'index',
                pastEvents,
                upcomingEvents,
                socialFeed,
            })
        );
    });

    router.get('about', ctx => {
        ctx.body = nunjucksEnv.render(
            'views/about/about.html',
            Object.assign(ctx.state.baseTemplateData, {
                page: 'about',
            })
        );
    });

    router.get('donate', ctx => {
        const { error = null, donationState = paymentApi.states.NOT_STARTED } =
            ctx.flash.get() || {};

        ctx.body = nunjucksEnv.render(
            'views/donate/donate.html',
            Object.assign(ctx.state.baseTemplateData, {
                page: 'donate',
                error,
                donationState,
            })
        );
    });

    router.get('campaigns', ctx => {
        ctx.body = nunjucksEnv.render(
            'views/campaigns/overview.html',
            {
                ...ctx.state.baseTemplateData,
                page: 'campaigns',
            }
        );
    });

    router.get('campaigns/:name', ctx => {
        ctx.body = nunjucksEnv.render(
            `views/campaigns/${ctx.params.name}.html`,
            {
                ...ctx.state.baseTemplateData,
                page: 'campaigns',
            }
        );
    });

    router.get('*', ctx => {
        ctx.status = 404;
        ctx.body = nunjucksEnv.render(
            'views/404/404.html',
            {
                ...ctx.state.baseTemplateData,
                page: '404',
            }
        );
    });
};
