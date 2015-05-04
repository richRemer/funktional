var expect = require("expect.js"),
    sinon = require("sinon"),
    fn = require("..");

describe("once", function() {
    it("should only execute on first call", function() {
        var spy = sinon.spy(),
            onceFn = fn.once(spy);

        onceFn();
        onceFn();

        expect(spy.calledOnce).to.be(true);
    });
});
