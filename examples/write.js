var futureStream = require('..');
var fs = require('fs');

function makeStream() {
  return fs.createWriteStream('/tmp/junk', { encoding: 'utf8' });
}

var start = Date.now();
function condition() {
  // true after 1 second
  return (Date.now() - start) > 1000;
}

var s = futureStream.write(makeStream, condition);
s.write('hello ');
s.write('world');
s.end();
