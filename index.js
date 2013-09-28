var Stream = require('stream'),
    setImmediate = global.setImmediate || process.nextTick;

module.exports = futureStream;
function futureStream(makeStream, cond) {
  if (cond()) {
    return makeStream();
  } else {
    var s = new Stream();
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
