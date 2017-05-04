const Mollie = require('mollie-api-node');
const contentfulManagement = require('contentful-management');
const body = require('koa-body');
const json = require('koa-json');
const error = require('../lib/koa-error-response');
const paymentApi = require('../lib/payment-api');

module.exports = function (router, {constants}) {
    const contentfulClient = contentfulManagement.createClient({
        accessToken : process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN
    });

    const paymentApiClient = paymentApi({
        stateRestoreFile : process.env.DATA_DIR + "/payment-states"
    });

    async function incrementDonationsInContentFul() {
        const space = await contentfulClient.getSpace(process.env.CONTENTFUL_SPACE);

        //get the siteStatus entry from the contentful space
        let entry = await space.getEntry(constants.siteStatusEntryId);

        //increments the number of donations by 1
        entry.fields.donated['en-EU'] = parseInt(entry.fields.donated['en-EU'], 10) + 1;

        //update the value and publish it
        entry = await entry.update();
        await entry.publish();

        //profit!
    }

    router.post('/donations/add', body(), json(), error.middleware(), async (ctx) => {
        let {extra} = ctx.request.body || {};

        if(!extra) {
            extra = "0";
        }

        //simple check for decimal numbers. Does not accept negative numbers
        if(!extra.match(/^[0-9]+([\.\,][0-9]+)?$/)) {
            throw new error.UserError("Optional donation is a invalid value");
        }

        let amount = constants.donationCost + parseFloat(extra.replace(',', '.'));

        //don't allow more then 2 decimals
        amount = amount.toFixed(2);

        let storeId, payment;

        try {
            //register the payment in the local store (no need to save any payment info here, we just use it for keeping state)
            storeId = await paymentApiClient.store.create();

            console.log(`Created store id ${storeId}`);

            //create the payment in mollie
            payment = await paymentApiClient.mollie.create(ctx.request, storeId, amount);
        }
        catch(e) {
            console.log(`payment error: ${e.message.toString()}`);
        
            //remove the payment from the local store
            paymentApiClient.store.remove(storeId);
            
            throw new error.InternalError("Your payment couldn't be processed.");
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

        //we have the mollie id here so we can request the payment status with mollie
        let payment;
        try {
            payment = await paymentApiClient.mollie.get(id);
        }
        catch(e) {
            throw new error.UserError(`Invalid payment id ${id}`);
        }

        //get the storeId from the payment metadata
        const {storeId} = payment.metadata;

        console.log(`Got mollie payment status ${payment.status} for ${storeId}`);

        //abort early when the status was not paid
        if(payment.status !== "paid") {
            paymentApiClient.store.update(storeId, paymentApi.states.CANCELED);

            ctx.status = 200;
            ctx.body = "ok";
            return;
        }

        //incrementing the donation count is important then updating the store so lets do that first
        try {
            await Promise.all([
                incrementDonationsInContentFul(),
                paymentApiClient.store.update(storeId, paymentApi.states.SUCCESS)
            ]);
        }
        catch(e) {
            console.log('Payment not registered correctly with store or contentful');
            throw new error.InternalError(`Payment not registered correctly with store or contentful`);
        }

        ctx.status = 200;
        ctx.body = "ok";
    });

    /**
     * Todo show the thank you page (it should just redirect to the exploot page with a flash message)
     */
    router.get('/donations/done/:storeId', body(), error.middleware(), async (ctx) => {
        const storeId = ctx.params.storeId;

        console.log('done called');

        if(!storeId) {
            throw new error.UserError(`Invalid store id ${storeId}`);
        }
        
        let paymentState;
        try {
            paymentState = await paymentApiClient.store.get(storeId);
        }
        catch(e) {
            console.log(`Could not retrieve payment state for storeId ${storeId} (was happened?)`);
            return ctx.redirect('/exploot');
        }

        //lets cleanup then delete the store state
        try {
            await paymentApiClient.store.remove(storeId);
        }
        catch(e) {
            console.log(`Could not remove payment state for storeId ${storeId}`);
        }

        ctx.flash.set({donationState : paymentState});

        return ctx.redirect('/exploot');
    });

}