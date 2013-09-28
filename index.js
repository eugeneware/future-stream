var Stream = require('stream'),
    setImmediate = global.setImmediate || process.nextTick;

module.exports = module.exports.read = futureReadStream;
function futureReadStream(makeStream, cond) {
  if (cond()) {
    return makeStream();
  } else {
    var s = new Stream();
    s.readable = true;
    (function check() {
      if (cond()) {
        var _s = makeStream();
        ['data', 'error', 'close', 'end'].forEach(function (evt) {
          _s.on(evt, s.emit.bind(s, evt));
        });
      } else {
        setImmediate(check);
      }
    })();
    return s;
  }
}

module.exports.write = futureWriteStream;
function futureWriteStream(makeStream, cond) {
  if (cond()) {
    return makeStream();
  } else {
    var s = new Stream();
    var _s;
    var ended = false;
    var destroyed = false;

    s.writable = true;
    var buf = [];
    s.write = function (data) {
      if (_s) {
        return _s.write(data);
      } else {
        buf.push(data);
      }
    };
    s.end = function (data) {
      if (arguments.length) s.write(data);
      s.writable = false;
      ended = true;
      if (_s) return _s.end();
    };
    s.destroy = function() {
      s.writable = false;
      if (_s) return _s.destroy();
    };

    (function check() {
      if (cond()) {
        _s = makeStream();
        if (buf.length) {
          buf.map(function (data) {
            _s.write(data);
          });
        }
        if (ended) _s.end();
        if (destroyed) _s.destroy();
      } else {
        setImmediate(check);
      }
    })();
    return s;
  }
}
