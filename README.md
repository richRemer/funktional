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

### once(function) -> function
Wrap the function so that it can only be called once.
