var Promise = require("es6-promise").Promise,
    slice = Array.prototype.slice;

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
 * Create updated function with optional callback and Promise return value.
 * @param {function} fn
 * @returns {function}
 */
function promise(fn) {
    return function() {
        var context = this,
            args = slice.call(arguments, 0),
            done;

        if (typeof args[args.length-1] === "function") done = args.pop();

        return new Promise(function(resolve, reject) {
            fn.apply(context, args.concat(function(err, val) {
                try {done && done.apply(null, arguments);} catch (err) {}
                if (err) reject(err);
                else resolve(val);
            }));
        });
    }
}

/**
 * Create continuation passing style callback which passes results to 'resolve'
 * function on success, or passes error to 'reject' function on error.
 * @param {function} resolve
 * @param {function} reject
 * @returns {function}
 */
function razor(resolve, reject) {
    return function(err) {
        if (err) reject(err);
        else resolve.apply(null, slice.call(arguments, 1));
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
var bucket = promise(function(stream, done) {
    var bucket = [];

    // read the stream and pass results to callback
    stream.on("error", done);
    stream.on("data", push(bucket));
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
var supervise = promise(function(proc, done) {
    var output = [],
        error = [];

    // ChildProcess may emit "error", "close", or both; ensure single done call
    done = once(done);

    // collect buffered output
    proc.stdout.on("data", push(output));
    proc.stderr.on("data", push(error));

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
function pop(arr) {
    return Array.prototype.pop.bind(arr);
}

/**
 * Create function which pushes its arguments onto an array.
 * @param {array} arr
 * @returns {function}
 */
function push(arr) {
    return Array.prototype.push.bind(arr);
}

/**
 * Create function which shifts values from an array.
 * @param {array} arr
 * @returns {function}
 */
function shift(arr) {
    return Array.prototype.shift.bind(arr);
}

/**
 * Create function which unshifts its arguments onto an array.
 * @param {array} arr
 * @returns {function}
 */
function unshift(arr) {
    return Array.prototype.unshift.bind(arr);
}

/** export functions */
module.exports = {
    ok: ok,
    once: once,
    promise: promise,
    razor: razor,

    bucket: bucket,
    supervise: supervise,

    pop: pop,
    push: push,
    shift: shift,
    unshift: unshift
};
