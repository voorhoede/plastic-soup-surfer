const writeFileAtomic = require('write-file-atomic');

module.exports =  function(path, contents) {
    return new Promise((resolve, reject) => {
        writeFileAtomic(path, contents, err => {
            if(err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}