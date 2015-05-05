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

### bucket(stream.Readable, [function])
Read an entire stream, then pass the result to the callback.  Alternatively,
return a Promise for the stream result.

### once(function)
Return a new function which calls the provided function the first time only.
Subsequent calls to the new function will do nothing but return the original
result.

### pusher(array)
Return a function which pushes its arguments onto an array.

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
