const Mollie = require('mollie-api-node');
const body = require('koa-body');

module.exports = function (router) {
    const mollieClient = new Mollie.API.Client;
    mollieClient.setApiKey(process.env.MOLLIE_API_KEY);

    const defaultPaymentBody = {
        description: "Plastic Soup Donation",
        redirectUrl: process.env.HOST + "/app/payments/done"
    }

    function createPayment() {
        return new Promise((resolve, reject) => {
            mollieClient.payments.create(Object.assign({amount : 10}, defaultPaymentBody), payment => {
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

    router.post('/add', body(), async (ctx) => {
        let payment = await createPayment();

        ctx.redirect( payment.getPaymentUrl() );
    });

    router.get('/done', body(), ctx => {
        console.log(ctx.request.body);
        ctx.body = "bedankt!";
    });

}