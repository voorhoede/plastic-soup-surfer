const Mollie = require('mollie-api-node');

module.exports = function mollie() {
    const mollieClient = new Mollie.API.Client;
    mollieClient.setApiKey(process.env.MOLLIE_API_KEY);

    return {
        get(id) {
            return new Promise((resolve, reject) => {
                mollieClient.payments.get(id, payment => {
                    if(payment.error) {
                        reject(payment.error);
                    }
                    resolve(payment);
                });
            });
        },

        create(request, storeId, amount = 0) {
            return new Promise((resolve, reject) => {

                const payload = {
                    amount,
                    description: "Plastic Soup Donation",
                    redirectUrl: request.protocol + "://" + request.host + "/api/donations/done/" + storeId,
                    webhookUrl: request.protocol + "://" + request.host + "/api/donations/report",
                    metadata : {
                        storeId
                    }
                };

                mollieClient.payments.create(payload, payment => {
                    if(payment.error) {
                        reject(payment.error);
                    }
                    resolve(payment);
                });
            });
        }
    }
}