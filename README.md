Funktional Helper Module
========================
The `funktional` module provides helper functions for composing functions with
different capabilities.

Usage
-----
```js
var fn = require("funktional"),
    send = fn.once(console.log.bind(console));

send("foo");    // writes "foo" to console
send("bar");    // does nothing
```

Helper Functions
----------------

### bucket(stream.Readable, [function]) => Promise
Read entire stream and concatenate results.  Callback accepts `(err, bucket)`,
where `bucket` is the concatenated result.

### ok(function) => function
Wrap function to always insert `null` as the first argument.  Since the
first argument is the `err` for continuation passing style, this has the
effect of never generating an error.

### once(function) => function
Wrap function to only execute once, always returning the same result.

### promise(function) => function
Wrap continuation passing style function to return Promise and accept callback
optionally.

### pop(array) => function
Generate function which pops a value from an array when called.

### push(array) => function
Generate function which pushes a value or values onto an array when called.

### shift(array) => function
Generate function which shifts values from an array when called.

### supervise(child_process.ChildProcess, [function]) => Promise
Supervise a child process and collect stdout and stderr data.  Callback
accepts `(err, exit, stdout, stderr)`, where `exit` is the exit status, and
`stdout` and `stderr` are the output streams data.

### unshift(array)
Generate function which unshifts its arguments onto an array when called.

Appendix: Async Callback Styles
-------------------------------
There are three common asynchronous patterns used in node.  The `funktional`
module has helpers for wrapping the different styles: continuation passing,
promises, or events.  These are described here.

### Continuation Passing
In the typical node.js continuation passing style, an asynchronous function
accepts a callback as its final argument.  This callback is called once.  The
first argument is the error, and subsequent arguments are the results.

```js
// example function in continuation passing style
function continues(a, b, done) { /* ... */ }

// example usage of continuation passing style
continues("apple", 42, function(err, result) {
    if (err) console.error(err);
    else console.log(result);
});
```

### Promises
ECMAScript 6 (Harmony) defines the Promise class, which is an object which wraps
an asynchronous operation so that the final error or result can be passed to
another function.

```js
// example Promise object
var promise = new Promise( /* ... */ );

// example usage of Promise
promise.then(console.log.bind(console), console.error.bind(console));
```

### Events
Objects with asynchronous methods are often modelled using the EventEmitter
class.  More than one event may be fired and sometimes no event is fired for a
successful operation.  Errors are emitted with the "error" event, but results
are often just updated on the object.  Each EventEmitter is a bit different.

```js
// example EventEmitter
var emitter = new EventEmitter();

// example usage of EventEmitter
emitter.on("result", console.log.bind(console));
emitter.on("error", console.error.bind(console));
```
