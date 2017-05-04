const fs = require('fs');
const shortid = require('shortid');
const states = require('./states');

module.exports = function ({stateRestoreFile}) {
    let paymentStates;
    
    try {
        const contents = fs.readFileSync(stateRestoreFile, 'utf8');
        paymentStates = JSON.parse(contents);
    }
    catch(e) {
        paymentStates = {};
    }

    const controller = {

        /**
         * status for id. When the id could not be found an reject promise is returned
         * 
         * @param {*} id 
         */
        get(id) {
            if(!paymentStates.hasOwnProperty(id)) {
                return Promise.reject();
            }
            return Promise.resolve( paymentStates[id] );
        },

        /**
         * update the status for the given id
         * @param {*} id 
         * @param {*} newState 
         */
        update(id, newState) {
            paymentStates[id] = newState;
            return Promise.resolve();
        },

        /**
         * remove the payment status because it is done and no one cares anymore
         * @param {*} id 
         */
        remove(id) { 
            delete paymentStates[id];
            return Promise.resolve();
        },
        
        /**
         * Writes all the current payment states to a file (poor mans backup)
         */
        flush() {
            fs.writeFileSync(stateRestoreFile, JSON.stringify(paymentStates), {encoding : "utf8"});
        },

        /**
         * return a id, the status is started
         */
        create() {
            const id = shortid();
            paymentStates[id] = states.STARTED;
            return Promise.resolve( id );
        }
    }

    process.on('SIGINT', () => {
        controller.flush();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('backing up payment info!');
        controller.flush();
    });

    return controller;
}