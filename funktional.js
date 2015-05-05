var Promise = require("es6-promise").Promise;

//////////////////////////////////////////////////////////////////////////////
// Utility wrappers
//////////////////////////////////////////////////////////////////////////////

/**
 * Create updated function which always passes null as its first argument.  As
 * this is typically the error argument, this has the effect of turning the
 * function into an always successful result.
 * @param {function} fn
 * @returns {function}
 */
function ok(fn) {
    return fn.bind(null, null);
}

/**
 * Create updated function which only executes the first time it is called.
 * The new function will always return the same result.
 * @param {function} fn
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
 * Create updated function with the callback optional.  If the callback is not
 * provided, the function will return a Promise.
 * @param {function} fn
 * @returns {function}
 */
function pledge(fn) {
    return function() {
        var resolver, rejecter,
            result;

        if (typeof arguments[arguments.length-1] !== "function") {
            result = new Promise(function(resolve, reject) {
                resolver = resolve;
                rejecter = reject;
            });

            Array.prototype.push.call(arguments, function(err, result) {
                if (err) rejecter(err);
                else resolver(result);
            });
        }

        fn.apply(this, arguments);
        return result;
    }
}

//////////////////////////////////////////////////////////////////////////////
// Specialized event handlers
//////////////////////////////////////////////////////////////////////////////

/**
 * Consume Readable stream and pass result to callback or return as a Promise
 * if no callback is provided.
 * @param {Readable} stream
 * @param {function} [done]
 * @returns {Promise}
 */
var bucket = pledge(function(stream, done) {
    var bucket = [];

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
});

/**
 * Supervise a ChildProcess and pass results to callback or return results as
 * a Promise if no callback is provided.
 * @param {ChildProcess} proc
 * @param {function} [done]
 * @returns {Promise}
 */
var supervise = pledge(function(proc, done) {
    var output = [],
        error = [];

    // ChildProcess may emit "error", "close", or both; ensure single done call
    done = once(done);

    // collect buffered output
    proc.stdout.on("data", pusher(output));
    proc.stderr.on("data", pusher(error));

    // handle process and pass execution results to callback
    proc.on("error", done);
    proc.on("close", function(code) {
        done(null, code, Buffer.concat(output), Buffer.concat(error));
    });
});


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
    once: once,
    pledge: pledge,

    bucket: bucket,
    supervise: supervise,

    popper: popper,
    pusher: pusher,
    shifter: shifter,
    unshifter: unshifter
};
