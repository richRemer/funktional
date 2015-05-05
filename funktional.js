var Promise = require("es6-promise").Promise;

/**
 * Create updated function which only executes the first time it is called.
 * The new function will always return the same result.
 * @param {function}
 * @returns {function}
 */
function once(fn) {
    var called = false,
        result;

    return function() {
        if (!called) {
            result = fn.apply(this, arguments);
            called = true;
        }

        return result;
    };
}

/**
 * Create function which pushes its arguments onto an array.
 * @param {array} arr
 * @returns {function}
 */
function pusher(arr) {
    return function() {
        Array.prototype.push.apply(arr, arguments);
    };
}

/**
 *
 * @param {Readable} stream
 * @param {function} [done]
 * @returns {Promise}
 */
function bucket(stream, done) {
    var bucket = [],
        result;

    // bucket result differs based on whether callback is provided
    if (!done) {
        // create a Promise result
        result = new Promise(function(resolve, reject) {
            // setup missing callback to resolve promised result
            done = function(err, result) {
                if (err) reject(err);
                else resolve(result);
            };
        });
    }

    // read the stream and pass results to callback
    stream.on("error", done);
    stream.on("data", pusher(bucket));
    stream.on("end", function() {
        var strings;

        strings = bucket.every(function(val) {
            return typeof val === "string" || val instanceof Buffer;
        });

        done(null, strings ? bucket.join("") : bucket);
    });

    // return promised result
    return result;
}

/** export functions */
module.exports = {
    once: once,
    bucket: bucket
};
