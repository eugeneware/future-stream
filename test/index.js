var expect = require('expect.js'),
    Stream = require('stream'),
    setImmediate = global.setImmediate || process.nextTick,
    futureStream = require('..');

describe('future-stream', function() {
  function generator(n) {
    var s = new Stream();
    s.readable = true;
    setImmediate(function () {
      var i = 0;
      (function next() {
        s.emit('data', { key: 'key ' + i, value: 'value ' + i });
        if (++i >= n) {
          s.emit('end');
        } else {
          setImmediate(next);
        }
      })();
    });
    return s;
  }

  it('emit events', function(done) {
    var delay = 100;
    var start = Date.now();
    function cond() {
      return (Date.now() - start) > delay;
    }
    function makeStream() {
      return generator(5);
    }

    var count = 0;
    futureStream(makeStream, cond)
      .on('data', function (data) {
        expect(Date.now()).to.be.above(start + delay);
        expect(data.key).to.match(/^key [0-9]+$/);
        expect(data.value).to.match(/^value [0-9]+$/);
        count++;
      })
      .on('end', function () {
        expect(Date.now() > start);
        expect(count).to.equal(5);
        done();
      });
  });
});
