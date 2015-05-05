var Readable = require("stream").Readable,
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
