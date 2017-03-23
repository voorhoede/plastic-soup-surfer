const bluebird = require('bluebird');
const fs = bluebird.promisifyAll( require('fs') );

module.exports = async function readPhase() {
    let buffer;
    try {
        buffer = await fs.readFileAsync(process.env.DATA_DIR + "/phase");
    }
    catch(e) {}

    let currentPhase = 0;
    if(buffer) {
        currentPhase = parseInt( buffer.toString(), 10);
        if(isNaN(currentPhase)) {
            currentPhase = 0;
        }
    }

    return currentPhase;
}