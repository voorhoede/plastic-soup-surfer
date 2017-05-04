
module.exports = function ({stateRestoreFile}) {
    return {
        store  : require('./store')({stateRestoreFile}),
        mollie : require('./mollie')()
    }
}

module.exports.states = require('./states');