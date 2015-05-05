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
function bucket(stream, done) {
    var bucket = [],
        result;

    // set result to Promise if no callback provided
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
 * Supervise a ChildProcess and pass results to callback or return results as
 * a Promise if no callback is provided.
 * @param {ChildProcess} proc
 * @param {function} [done]
 * @returns {Promise}
 */
function supervise(proc, done) {
    var result, resolver, rejecter,
        output = [],
        error = [];

    // set result to Promise if no callback provided
    if (!done) {
        // create new done to resolve Promise
        done = function(err, code, stdout, stderr) {
            if (err) rejecter(err);
            else resolver({
                exit: code,
                stdout: stdout,
                stderr: stderr
            });
        };

        // create a Promise result
        result = new Promise(function(resolve, reject) {
            resolver = resolve;
            rejecter = reject;
        });
    }

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

    // return promised result
    return result;
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
    supervise: supervise,

    popper: popper,
    pusher: pusher,
    shifter: shifter,
    unshifter: unshifter
};
