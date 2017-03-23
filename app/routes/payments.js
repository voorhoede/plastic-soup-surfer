const Mollie = require('mollie-api-node');
const body = require('koa-body');
const json = require('koa-json');
const error = require('../../lib/koa-error-response');
const levelup = require('levelup');

module.exports = function (router) {
    const mollieClient = new Mollie.API.Client;
    mollieClient.setApiKey(process.env.MOLLIE_API_KEY);

    const defaultPaymentBody = {
        description: "Plastic Soup Donation",
        redirectUrl: process.env.HOST + "/app/payments/done",
        webhookUrl: process.env.HOST + "/app/payments/report"
    }

    function createPaymentInMollie(extra = 0) {
        return new Promise((resolve, reject) => {
            const requestBody = Object.assign({amount : 10 + Math.max(extra, 0)}, defaultPaymentBody);

            mollieClient.payments.create(requestBody, payment => {
                if(payment.error) {
                    console.log(payment.error);
                    reject(payment.error);
                }
                //where are the errors?
                resolve(payment);
            });
        });
    }

    router.get('/total', async (ctx) => {
        
    });

    router.post('/add', body(), json(), error.middleware(), async (ctx) => {
        let {extra = ""} = ctx.request.body || {};

        extra = parseFloat(extra || 0);
        
        if(isNaN(extra) || extra < 0) { //limit extra?
            throw new error.UserError("Ingevulde bonuswaarde is ongeldig");
        }

        let payment = await createPaymentInMollie(extra);

        if(!ctx.state.xhr) {
            return ctx.redirect( payment.getPaymentUrl() );
        }
        else {
            ctx.status = 200;
            ctx.body = {paymentUrl : payment.getPaymentUrl()};
        }
    });

    router.post('/report', body(), ctx => {
        const {id = null} = ctx.request.body || {};

        if(!id) {
            return;
        }

        //get payment with id
        console.log(id);
    });

    router.get('/done', body(), ctx => {
        console.log(ctx.request.body);
        ctx.body = "bedankt!";
    });

}