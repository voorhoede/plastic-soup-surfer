const Mollie = require('mollie-api-node');
const contentfulManagement = require('contentful-management');
const body = require('koa-body');
const json = require('koa-json');
const error = require('../lib/koa-error-response');

module.exports = function (router, {constants}) {
    const contentfulClient = contentfulManagement.createClient({
        accessToken : process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN
    });

    const mollieClient = new Mollie.API.Client;
    mollieClient.setApiKey(process.env.MOLLIE_API_KEY);

    function createPaymentInMollie(ctx, amount = 0) {
        return new Promise((resolve, reject) => {

            const requestBody = {
                amount,
                description: "Plastic Soup Donation",
                redirectUrl: ctx.request.protocol + "://" + ctx.request.host + "/api/donations/done",
                webhookUrl: ctx.request.protocol + "://" + ctx.request.host + "/api/donations/report"
            };

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

    router.post('/donations/add', body(), json(), error.middleware(), async (ctx) => {
        let {extra} = ctx.request.body || {};

        if(!extra) {
            extra = "0";
        }

        //simple check for rounded numbers only
        if(!extra.match(/^[0-9]+$/)) {
            throw new error.UserError("Ingevulde bonuswaarde is ongeldig");
        }

        const amount = constants.donationCost + parseInt(extra, 10);

        let payment;
        try {
            payment = await createPaymentInMollie(ctx, amount); //todo add metadata in mollie payload
        }
        catch(e) {
            console.log(`payment error: ${e.message.toString()}`);
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

    router.post('/donations/report', body(), error.middleware(), async (ctx) => {
        const {id = null} = ctx.request.body || {};

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

        console.log('Succesful payment reported by mollie');

        //abort early when the status was not paid
        if(savedPayment.status !== "paid") {
            ctx.status = 200;
            ctx.body = "ok";
            return;
        }

        const space = await contentfulClient.getSpace(process.env.CONTENTFUL_SPACE);

        //get the siteStatus entry from the contentful space
        let entry = await space.getEntry(constants.siteStatusEntryId);

        //increments the number of donations by 1
        entry.fields.donated['en-EU'] = parseInt(entry.fields.donated['en-EU'], 10) + 1;

        //update the value and publish it
        entry = await entry.update();
        await entry.publish();

        /*
            Add the payment to the cms?
            Or add payment to some db?
            Or just keep payment status in memory
            Dangers:
                - On restart the payment status is lost
        */

        ctx.status = 200;
        ctx.body = "ok";
    });

    /**
     * Todo show the thank you page (it should just redirect to the exploot page with a flash message)
     */
    router.get('/donations/done', body(), ctx => {
        ctx.flash.set({donationState : constants.donationState.SUCCESS});
        return ctx.redirect('/exploot');
    });

}