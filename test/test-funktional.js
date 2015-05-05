var Readable = require("stream").Readable,
    spawn = require("child_process").spawn,
    expect = require("expect.js"),
    sinon = require("sinon"),
    fn = require("..");

describe("once", function() {
    describe("(function)", function() {
        it("should only execute on first call", function() {
            var spy = sinon.spy(),
                onceFn = fn.once(spy);

            onceFn();
            onceFn();

            expect(spy.calledOnce).to.be(true);
        });
    });
});

describe("pledge", function() {
    describe("(function)", function() {
        it("should make callback optional; Promise instead", function(done) {
            var callback = function(a, b, done) {
                    done(null, a, b);
                },
                pledge = fn.pledge(callback),
                promise = pledge(42, 13);

            promise.then(function(result) {
                expect(arguments.length).to.be(1);
                expect(result).to.be(42);
                done();
            }).catch(done);
        });
    });
});

describe("bucket", function() {
    function createStream() {
        var chunks = ["foo", "bar"];
        stream = new Readable();
        stream._read = function() {
            this.push(chunks.shift());
        };
        return stream;
    }

    describe("(Readable)", function() {
        it("should consume stream and return Promise", function(done) {
            var bucket = fn.bucket(createStream());

            expect(bucket.then).to.be.a("function");
            bucket.then(function(result) {
                expect(result).to.be("foobar");
                done();
            }).catch(done);
        });
    });

    describe("(Readable, function)", function() {
        it("should consume stream and pass to callback", function(done) {
            fn.bucket(createStream(), function(err, result) {
                if (err) done(err);
                else {
                    expect(result).to.be("foobar");
                    done();
                }
            });
        });
    });
});

describe("supervise", function() {
    function createProc() {
        return spawn("ls");
    }

    describe("(ChildProcess)", function() {
        it("should supervise process and return Promise", function(done) {
            var supervise = fn.supervise(createProc());

            expect(supervise.then).to.be.a("function");
            supervise.then(function(result) {
                expect(result).to.be.a("number");
                done();
            }).catch(done);
        });
    });

    describe("(ChildProcess, function)", function() {
        it("should run proc and pass result to callback", function(done) {
            fn.supervise(createProc(), function(err, exit, stdout, stderr) {
                if (err) done(err);
                else {
                    expect(exit).to.be.a("number");
                    expect(stdout).to.be.a(Buffer);
                    expect(stderr).to.be.a(Buffer);
                    done();
                }
            });
        });
    });
});

describe("popper", function() {
    describe("(array)", function() {
        it("should remove and return values from end of array", function() {
            var arr = [0, 1, 2],
                popper = fn.popper(arr);

            expect(popper()).to.be(2);
            expect(popper()).to.be(1);
            expect(popper()).to.be(0);
            expect(arr.length).to.be(0);
        });
    });
});

describe("pusher", function() {
    describe("(array)", function() {
        it("should add arguments to end of array", function() {
            var arr = [0],
                pusher = fn.pusher(arr);

            pusher(1, 2);
            expect(arr.length).to.be(3);
            expect(arr[1]).to.be(1);
            expect(arr[2]).to.be(2);
        });
    });
});

describe("shifter", function() {
    describe("(array)", function() {
        it("should remove and return values from start of array", function() {
            var arr = [0, 1, 2],
                shifter = fn.shifter(arr);

            expect(shifter()).to.be(0);
            expect(shifter()).to.be(1);
            expect(shifter()).to.be(2);
            expect(arr.length).to.be(0);
        });
    });
});

describe("unshifter", function() {
    describe("(array)", function() {
        it("should add arguments to start of array", function() {
            var arr = [0],
                unshifter = fn.unshifter(arr);

            unshifter(1, 2);
            expect(arr.length).to.be(3);
            expect(arr[0]).to.be(1);
            expect(arr[1]).to.be(2);
        });
    });
});

