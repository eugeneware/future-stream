var futureStream = require('..');
var fs = require('fs');

function makeStream() {
  return fs.createWriteStream('/tmp/junk', { encoding: 'utf8' });
}

var start = Date.now();
function condition(data) {
  // when data is 'delay', delay the write for one second
  if (data == 'delay') {
    return (Date.now() - start) > 1000;
  } else {
    return true;
  }
}

var s = futureStream.write(makeStream, condition);
s.write('delay');
s.write('not delayed');
s.end();
