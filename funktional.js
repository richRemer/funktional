var Promise = require("es6-promise").Promise;

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

//////////////////////////////////////////////////////////////////////////////
// Array function binding
//////////////////////////////////////////////////////////////////////////////

/**
 * Create function which pops values from an array.
 * @param {array} arr
 * @returns {function}
 */
function popper(arr) {
    return Array.prototype.pop.bind(arr);
}

/**
 * Create function which pushes its arguments onto an array.
 * @param {array} arr
 * @returns {function}
 */
function pusher(arr) {
    return Array.prototype.push.bind(arr);
}

/**
 * Create function which shifts values from an array.
 * @param {array} arr
 * @returns {function}
 */
function shifter(arr) {
    return Array.prototype.shift.bind(arr);
}

/**
 * Create function which unshifts its arguments onto an array.
 * @param {array} arr
 * @returns {function}
 */
function unshifter(arr) {
    return Array.prototype.unshift.bind(arr);
}

/** export functions */
module.exports = {
    bucket: bucket,
    once: once,

    popper: popper,
    pusher: pusher,
    shifter: shifter,
    unshifter: unshifter
};
