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
  var s = new Stream();
  var _s = makeStream();
  var ended = false;
  var destroyed = false;
  var checking = false;
  var buf = [];

  s.writable = true;
  s.write = function (data) {
    buf.push(data);
    doCheck();
  };
  s.end = function (data) {
    if (arguments.length) s.write(data);
    s.writable = false;
    ended = true;
    doCheck();
  };
  s.destroy = function() {
    s.writable = false;
    destroyed = true;
    doCheck();
  };

  function doCheck() {
    if (!checking) {
      checking = true;
      setTimeout(check, 0);
    }
  }

  function check() {
    while (buf.length) {
      var data = buf[0];
      if (cond(data)) {
        buf.shift();
        _s.write(data);
      } else {
        // seems to get better performance that setImmediate
        setTimeout(check, 0);
      }
    }
    if (buf.length === 0) {
      if (ended) _s.end();
      if (destroyed) _s.destroy();
    }
    checking = false;
  }

  return s;
}
