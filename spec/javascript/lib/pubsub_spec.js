describe('hterm.PubSub', function() {
  var obj, callbackCount;

  beforeEach(function() {
    obj = {}
    callbackCount = 0;
    hterm.PubSub.addBehavior(obj);
  });

  it('notifies subscribers in proper order', function() {
    function one()  { expect(++callbackCount).toEqual(1) }
    function two()  { expect(++callbackCount).toEqual(2) }
    function last() { expect(++callbackCount).toEqual(3) }

    runs(function() {
      obj.subscribe('test', one);
      obj.subscribe('test', two);
      obj.publish('test', null, last);
    });

    waitsFor(function() {
      return callbackCount == 3
    }, "callbacks are not completed", 100);
  });

  it('sends published param to all subscriber', function() {
    var expected = "hello"
    function one(param)  { expect(param).toEqual(expected) }
    function last(param) { expect(param).toEqual(expected); expected = "done" }

    runs(function() {
      obj.subscribe('test', one);
      obj.publish('test', expected, last);
    });

    waitsFor(function() {
      return expected == "done"
    }, "callbacks are not completed", 100);
  });

  it('always invoke final callback if present', function() {
    var expected = "hello"
    function last(param) { expect(param).toEqual(expected); expected = "done" }

    runs(function() {
      obj.publish('test', expected, last);
    });

    waitsFor(function() {
      return expected == "done"
    }, "callbacks are not completed", 100);
  });

  it('does not stops the remaining notifications when a subscriber choke on exception', function() {
    var calledBar = false;

    function foo() { throw 'EXPECTED_EXCEPTION' }
    function bar() { calledBar = true }

    runs(function() {
      obj.subscribe('test', foo);
      obj.subscribe('test', bar);
      obj.publish('test', null);
    });

    waitsFor(function() {
      return calledBar;
    }, 'bar is never called', 100);
  });
});
