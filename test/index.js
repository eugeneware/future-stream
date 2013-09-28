var expect = require('expect.js'),
    Stream = require('stream'),
    setImmediate = global.setImmediate || process.nextTick,
    through = require('through'),
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

  it('should be able delay a stream', function(done) {
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
        expect(Date.now()).to.be.above(start + delay);
        expect(count).to.equal(5);
        done();
      });
  });

  it('should shortcut the stream if the cond fn is true', function(done) {
    var start = Date.now();
    var delay = 100;

    function cond() {
      return true;
    }
    function makeStream() {
      return generator(5);
    }

    var count = 0;
    futureStream(makeStream, cond)
      .on('data', function (data) {
        expect(Date.now()).to.not.be.above(start + delay);
        expect(data.key).to.match(/^key [0-9]+$/);
        expect(data.value).to.match(/^value [0-9]+$/);
        count++;
      })
      .on('end', function () {
        expect(Date.now()).to.not.be.above(start + delay);
        expect(count).to.equal(5);
        done();
      });
  });

  it('should be able delay a write stream', function(done) {
    var delay = 100;
    var start = Date.now();
    function cond() {
      return (Date.now() - start) > delay;
    }

    var count = 0;
    generator(5).pipe(futureStream.write(makeStream, cond));

    function makeStream() {
      return through(write, end);
    }
    function write(data) {
      expect(Date.now()).to.be.above(start + delay);
      expect(data.key).to.match(/^key [0-9]+$/);
      expect(data.value).to.match(/^value [0-9]+$/);
      count++;
    }
    function end() {
      expect(Date.now()).to.be.above(start + delay);
      expect(count).to.equal(5);
      done();
    }
  });
});
