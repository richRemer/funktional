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

/** export functions */
module.exports = {
    once: once
};
