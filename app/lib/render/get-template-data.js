const db = require('../db');
const donationCounter = require('../level-counter')(db, 'donated');

module.exports = async function() {
    return {
        donated : (await donationCounter.get()),
        phase : (await db.getAsync('phase').catch(e => 0))
    }
}