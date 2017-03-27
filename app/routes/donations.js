const Mollie = require('mollie-api-node');
const body = require('koa-body');
const json = require('koa-json');
const error = require('../lib/koa-error-response');
const db = require('../lib/db');
const renderQueue = require('../lib/render');

const donationCounter = require('../lib/level-counter')(db, 'donated');

module.exports = function (router) {
    const mollieClient = new Mollie.API.Client;
    mollieClient.setApiKey(process.env.MOLLIE_API_KEY);

    const defaultPaymentBody = {
        description: "Plastic Soup Donation",
        redirectUrl: process.env.HOST + "/app/donations/done",
        webhookUrl: process.env.HOST + "/app/donations/report"
    }

    let delayedTimeout;
    function delayedRender() {
        if(delayedTimeout) {
            return;
        }
        delayedTimeout = setTimeout(async () => {
            renderQueue.addTask({useContentfulCache : true});
            delayedTimeout = undefined;
        }, 10000).unref();
    }

    function createPaymentInMollie(amount = 0) {
        return new Promise((resolve, reject) => {
            const requestBody = Object.assign({amount}, defaultPaymentBody);

            mollieClient.payments.create(requestBody, payment => {
                if(payment.error) {
                    reject(payment.error);
                }
                resolve(payment);
            });
        });
    }

    function getPaymentFromMollie(id) {
        return new Promise((resolve, reject) => {
            mollieClient.payments.get(id, payment => {
                if(payment.error) {
                    reject(payment.error);
                }
                resolve(payment);
            });
        });
    }

    router.post('/add', body(), json(), error.middleware(), async (ctx) => {
        let {extra = ""} = ctx.request.body || {};

        extra = parseFloat(extra || 0);

        console.log("Add payment");
        
        if(isNaN(extra) || extra < 0) { //limit extra?
            throw new error.UserError("Ingevulde bonuswaarde is ongeldig");
        }

        const amount = 10 + extra;

        let payment;
        try {
            payment = await createPaymentInMollie(amount);
        }
        catch(e) {
            console.log(`payment error: ${e.toString()}`);
            throw new error.InternalError("Betaling kon niet worden aangemaakt!");
        }

        console.log(`Created payment ${payment.id} with amount ${amount}`);

        if(!ctx.state.xhr) {
            return ctx.redirect( payment.getPaymentUrl() );
        }
        else {
            ctx.status = 200;
            ctx.body = {paymentUrl : payment.getPaymentUrl()};
        }
    });

    router.post('/report', body(), error.middleware(), async (ctx) => {
        const {id = null} = ctx.request.body || {};

        console.log("Payment report");

        if(!id) {
            return;
        }

        let savedPayment;
        try {
            savedPayment = await getPaymentFromMollie(id);
        }
        catch(e) {
            throw new error.UserError(`Invalid payment id ${id}`);
        }

        console.log(`Found payment ${savedPayment}`);

        //abort early when the status was not paid
        if(savedPayment.status !== "paid") {
            ctx.status = 200;
            ctx.body = "ok";
            return;
        }

        //increment the total payments
        const donated = await donationCounter.add(savedPayment.amount);
        console.log(`Incremented total payments by ${savedPayment.amount}. New total: ${donated}`);

        //rerender the site
        delayedRender();

        ctx.status = 200;
        ctx.body = "ok";
    });

    router.get('/done', body(), ctx => {
        console.log(ctx.request.body);
        ctx.body = "bedankt!";
    });

}