
module.exports = function () {
    const statusMap = new Map();

    return {
        get(id) {
            //status for id
        },

        update(id, newStatus) {
            //update the status 
        },

        finish(id) {
            //remove the payment status
        },

        create() {
            //return a id, the status is started
        }
    }  
}