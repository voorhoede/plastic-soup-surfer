
let cachedCounters = new WeakMap();

function counter(db, key) {
    let value;

    /**
     * Gets the currently saved value in the counter.
     * If the value was not yet retrieved then we retrieve it first. Otherwise we use the retrieved value.
     */
    function getSaved() {
        let valuePromise;
        if(typeof value === "undefined") {
            valuePromise = db.getAsync(key)
                .then(v => {
                    return (value = parseInt(v, 10));
                })
                .catch(() => {
                    return (value = 0);
                });
        }
        else {
            valuePromise = Promise.resolve(value);
        }
        return valuePromise;
    }

    return {
        add(amount) {
            amount = parseInt(amount, 10);

            if(amount === 0) {
                return Promise.resolve();
            }

            return getSaved().then(v => {
                value = v + amount;
                return db.putAsync(key, value).then(() => value);
            });
        },

        get() {
            return getSaved();
        }
    }
}

/**
 * (payment) counter for leveldb
 * (Not atomic. Please only use this on one spot)
 * 
 * Counters are cached by db and key.
 * 
 */
module.exports = function (db, key) {
    let byKey = cachedCounters.get(db);

    if(!byKey) {
        cachedCounters.set(db, byKey = new Map());
    }

    if(byKey.has(key)) {
        return byKey.get(key);
    }

    const counterInstance = counter(db, key);
    byKey.set(key, counterInstance);
    return counterInstance;
}